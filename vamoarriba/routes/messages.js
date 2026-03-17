const express = require('express');
const db = require('../database');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.get('/messages', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  const conversations = db.prepare(`
    SELECT u.id, u.nombre, u.apellido, u.rol, u.avatar,
      (SELECT contenido FROM mensajes
       WHERE (emisor_id = u.id AND receptor_id = ?) OR (emisor_id = ? AND receptor_id = u.id)
       ORDER BY created_at DESC LIMIT 1) as ultimo_mensaje,
      (SELECT created_at FROM mensajes
       WHERE (emisor_id = u.id AND receptor_id = ?) OR (emisor_id = ? AND receptor_id = u.id)
       ORDER BY created_at DESC LIMIT 1) as ultima_fecha,
      (SELECT COUNT(*) FROM mensajes WHERE emisor_id = u.id AND receptor_id = ? AND leido = 0) as no_leidos
    FROM usuarios u
    WHERE u.id != ? AND (
      u.id IN (SELECT emisor_id FROM mensajes WHERE receptor_id = ?)
      OR u.id IN (SELECT receptor_id FROM mensajes WHERE emisor_id = ?)
    )
    ORDER BY ultima_fecha DESC
  `).all(userId, userId, userId, userId, userId, userId, userId, userId);

  res.render('messages', { conversations, chat: null, messages: [] });
});

router.get('/messages/:id', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const otherId = req.params.id;

  const chat = db.prepare('SELECT id, nombre, apellido, rol, avatar FROM usuarios WHERE id = ?').get(otherId);
  if (!chat) return res.redirect('/messages');

  db.prepare('UPDATE mensajes SET leido = 1 WHERE emisor_id = ? AND receptor_id = ?').run(otherId, userId);

  const messages = db.prepare(`
    SELECT m.*, u.nombre as emisor_nombre, u.apellido as emisor_apellido
    FROM mensajes m JOIN usuarios u ON m.emisor_id = u.id
    WHERE (m.emisor_id = ? AND m.receptor_id = ?) OR (m.emisor_id = ? AND m.receptor_id = ?)
    ORDER BY m.created_at ASC
  `).all(userId, otherId, otherId, userId);

  const conversations = db.prepare(`
    SELECT u.id, u.nombre, u.apellido, u.rol, u.avatar,
      (SELECT COUNT(*) FROM mensajes WHERE emisor_id = u.id AND receptor_id = ? AND leido = 0) as no_leidos
    FROM usuarios u
    WHERE u.id != ? AND (
      u.id IN (SELECT emisor_id FROM mensajes WHERE receptor_id = ?)
      OR u.id IN (SELECT receptor_id FROM mensajes WHERE emisor_id = ?)
    )
  `).all(userId, userId, userId, userId);

  res.render('messages', { conversations, chat, messages });
});

router.post('/messages/:id', isAuthenticated, (req, res) => {
  const { contenido } = req.body;
  if (contenido && contenido.trim()) {
    db.prepare('INSERT INTO mensajes (emisor_id, receptor_id, contenido) VALUES (?, ?, ?)')
      .run(req.session.userId, req.params.id, contenido.trim());
  }
  res.redirect(`/messages/${req.params.id}`);
});

module.exports = router;
