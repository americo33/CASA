const express = require('express');
const db = require('../database');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.get('/goals', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const rol = req.session.rol;

  let metas;
  if (rol === 'coach' || rol === 'admin') {
    metas = db.prepare(`
      SELECT m.*, u.nombre as coachee_nombre, u.apellido as coachee_apellido
      FROM metas m JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.coach_id = ? ORDER BY m.created_at DESC
    `).all(userId);
  } else {
    metas = db.prepare(`
      SELECT m.*, u.nombre as coach_nombre, u.apellido as coach_apellido
      FROM metas m LEFT JOIN usuarios u ON m.coach_id = u.id
      WHERE m.usuario_id = ? ORDER BY m.created_at DESC
    `).all(userId);
  }

  res.render('goals', { metas });
});

router.get('/goals/new', isAuthenticated, (req, res) => {
  const coaches = db.prepare("SELECT id, nombre, apellido, especialidad FROM usuarios WHERE rol = 'coach' AND activo = 1").all();
  res.render('goal-new', { coaches, error: null });
});

router.post('/goals/new', isAuthenticated, (req, res) => {
  const { titulo, descripcion, categoria, coach_id, fecha_objetivo } = req.body;
  const userId = req.session.userId;

  db.prepare(`
    INSERT INTO metas (usuario_id, coach_id, titulo, descripcion, categoria, fecha_objetivo)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, coach_id || null, titulo, descripcion, categoria, fecha_objetivo || null);

  res.redirect('/goals');
});

router.post('/goals/:id/progress', isAuthenticated, (req, res) => {
  const { progreso } = req.body;
  db.prepare('UPDATE metas SET progreso = ? WHERE id = ?').run(progreso, req.params.id);
  res.redirect('/goals');
});

module.exports = router;
