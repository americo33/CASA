const express = require('express');
const db = require('../database');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.get('/dashboard', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const rol = req.session.rol;

  const publicaciones = db.prepare(`
    SELECT p.*, u.nombre, u.apellido, u.rol as autor_rol, u.avatar,
      (SELECT COUNT(*) FROM likes WHERE publicacion_id = p.id) as total_likes,
      (SELECT COUNT(*) FROM comentarios WHERE publicacion_id = p.id) as total_comentarios,
      (SELECT COUNT(*) FROM likes WHERE publicacion_id = p.id AND usuario_id = ?) as user_liked
    FROM publicaciones p
    JOIN usuarios u ON p.usuario_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 20
  `).all(userId);

  let metas = [];
  let sesiones = [];
  let stats = {};

  if (rol === 'coach' || rol === 'admin') {
    metas = db.prepare(`
      SELECT m.*, u.nombre as coachee_nombre, u.apellido as coachee_apellido
      FROM metas m JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.coach_id = ? ORDER BY m.created_at DESC LIMIT 10
    `).all(userId);
    sesiones = db.prepare(`
      SELECT s.*, u.nombre as coachee_nombre, u.apellido as coachee_apellido, m.titulo as meta_titulo
      FROM sesiones s JOIN usuarios u ON s.coachee_id = u.id JOIN metas m ON s.meta_id = m.id
      WHERE s.coach_id = ? ORDER BY s.fecha DESC LIMIT 5
    `).all(userId);
    stats = {
      totalCoachees: db.prepare('SELECT COUNT(DISTINCT usuario_id) as c FROM metas WHERE coach_id = ?').get(userId).c,
      totalSesiones: db.prepare('SELECT COUNT(*) as c FROM sesiones WHERE coach_id = ?').get(userId).c,
      metasActivas: db.prepare('SELECT COUNT(*) as c FROM metas WHERE coach_id = ? AND estado = ?').get(userId, 'activa').c,
    };
  } else {
    metas = db.prepare(`
      SELECT m.*, u.nombre as coach_nombre, u.apellido as coach_apellido
      FROM metas m LEFT JOIN usuarios u ON m.coach_id = u.id
      WHERE m.usuario_id = ? ORDER BY m.created_at DESC LIMIT 10
    `).all(userId);
    sesiones = db.prepare(`
      SELECT s.*, u.nombre as coach_nombre, u.apellido as coach_apellido, m.titulo as meta_titulo
      FROM sesiones s JOIN usuarios u ON s.coach_id = u.id JOIN metas m ON s.meta_id = m.id
      WHERE s.coachee_id = ? ORDER BY s.fecha DESC LIMIT 5
    `).all(userId);
    stats = {
      totalMetas: db.prepare('SELECT COUNT(*) as c FROM metas WHERE usuario_id = ?').get(userId).c,
      totalSesiones: db.prepare('SELECT COUNT(*) as c FROM sesiones WHERE coachee_id = ?').get(userId).c,
      metasCompletadas: db.prepare('SELECT COUNT(*) as c FROM metas WHERE usuario_id = ? AND estado = ?').get(userId, 'completada').c,
    };
  }

  const notificaciones = db.prepare(`
    SELECT * FROM notificaciones WHERE usuario_id = ? AND leida = 0 ORDER BY created_at DESC LIMIT 10
  `).all(userId);

  res.render('dashboard', { publicaciones, metas, sesiones, stats, notificaciones });
});

// Create post
router.post('/post', isAuthenticated, (req, res) => {
  const { contenido } = req.body;
  if (contenido && contenido.trim()) {
    db.prepare('INSERT INTO publicaciones (usuario_id, contenido) VALUES (?, ?)').run(req.session.userId, contenido.trim());
  }
  res.redirect('/dashboard');
});

// Like post
router.post('/post/:id/like', isAuthenticated, (req, res) => {
  const postId = req.params.id;
  const userId = req.session.userId;
  const existing = db.prepare('SELECT id FROM likes WHERE publicacion_id = ? AND usuario_id = ?').get(postId, userId);
  if (existing) {
    db.prepare('DELETE FROM likes WHERE publicacion_id = ? AND usuario_id = ?').run(postId, userId);
  } else {
    db.prepare('INSERT INTO likes (publicacion_id, usuario_id) VALUES (?, ?)').run(postId, userId);
  }
  res.redirect('/dashboard');
});

// Comment on post
router.post('/post/:id/comment', isAuthenticated, (req, res) => {
  const { contenido } = req.body;
  if (contenido && contenido.trim()) {
    db.prepare('INSERT INTO comentarios (publicacion_id, usuario_id, contenido) VALUES (?, ?, ?)')
      .run(req.params.id, req.session.userId, contenido.trim());
  }
  res.redirect('/dashboard');
});

// Profile
router.get('/profile/:id?', isAuthenticated, (req, res) => {
  const profileId = req.params.id || req.session.userId;
  const profile = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(profileId);
  if (!profile) return res.redirect('/dashboard');

  const publicaciones = db.prepare(`
    SELECT p.*, (SELECT COUNT(*) FROM likes WHERE publicacion_id = p.id) as total_likes,
    (SELECT COUNT(*) FROM comentarios WHERE publicacion_id = p.id) as total_comentarios
    FROM publicaciones p WHERE p.usuario_id = ? ORDER BY p.created_at DESC
  `).all(profileId);

  const metas = db.prepare('SELECT * FROM metas WHERE usuario_id = ? OR coach_id = ? ORDER BY created_at DESC').all(profileId, profileId);

  const totalConexiones = db.prepare(`
    SELECT COUNT(*) as c FROM conexiones WHERE (usuario_id = ? OR conectado_id = ?) AND estado = 'aceptada'
  `).get(profileId, profileId).c;

  res.render('profile', { profile, publicaciones, metas, totalConexiones });
});

// Edit profile
router.get('/profile/edit/me', isAuthenticated, (req, res) => {
  const profile = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.session.userId);
  res.render('edit-profile', { profile, error: null, success: null });
});

router.post('/profile/edit/me', isAuthenticated, (req, res) => {
  const { nombre, apellido, bio, especialidad, telefono, pais, ciudad, linkedin, sitio_web } = req.body;
  db.prepare(`
    UPDATE usuarios SET nombre=?, apellido=?, bio=?, especialidad=?, telefono=?, pais=?, ciudad=?, linkedin=?, sitio_web=?
    WHERE id = ?
  `).run(nombre, apellido, bio || null, especialidad || null, telefono || null, pais || null, ciudad || null, linkedin || null, sitio_web || null, req.session.userId);

  req.session.nombre = nombre;
  req.session.apellido = apellido;

  const profile = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.session.userId);
  res.render('edit-profile', { profile, error: null, success: 'Perfil actualizado correctamente' });
});

module.exports = router;
