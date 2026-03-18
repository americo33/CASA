const express = require('express');
const db = require('../database');
const { isAuthenticated, isCoach } = require('../middleware/auth');
const router = express.Router();

// List sessions
router.get('/sessions', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const rol = req.session.rol;

  let sesiones;
  if (rol === 'coach' || rol === 'admin') {
    sesiones = db.prepare(`
      SELECT s.*, u.nombre as coachee_nombre, u.apellido as coachee_apellido,
        m.titulo as meta_titulo, m.categoria
      FROM sesiones s
      JOIN usuarios u ON s.coachee_id = u.id
      JOIN metas m ON s.meta_id = m.id
      WHERE s.coach_id = ?
      ORDER BY s.fecha DESC
    `).all(userId);
  } else {
    sesiones = db.prepare(`
      SELECT s.*, u.nombre as coach_nombre, u.apellido as coach_apellido,
        m.titulo as meta_titulo, m.categoria
      FROM sesiones s
      JOIN usuarios u ON s.coach_id = u.id
      JOIN metas m ON s.meta_id = m.id
      WHERE s.coachee_id = ?
      ORDER BY s.fecha DESC
    `).all(userId);
  }

  res.render('sessions', { sesiones });
});

// New session form
router.get('/sessions/new', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const rol = req.session.rol;

  let metas, coaches, coachees;
  if (rol === 'coach' || rol === 'admin') {
    metas = db.prepare(`
      SELECT m.*, u.nombre as coachee_nombre, u.apellido as coachee_apellido
      FROM metas m JOIN usuarios u ON m.usuario_id = u.id
      WHERE m.coach_id = ? AND m.estado = 'activa'
    `).all(userId);
    coachees = db.prepare(`
      SELECT DISTINCT u.id, u.nombre, u.apellido
      FROM usuarios u JOIN metas m ON m.usuario_id = u.id
      WHERE m.coach_id = ?
    `).all(userId);
  } else {
    metas = db.prepare("SELECT m.*, u.nombre as coach_nombre, u.apellido as coach_apellido FROM metas m LEFT JOIN usuarios u ON m.coach_id = u.id WHERE m.usuario_id = ? AND m.estado = 'activa'").all(userId);
    coaches = db.prepare("SELECT id, nombre, apellido, especialidad FROM usuarios WHERE rol = 'coach' AND activo = 1").all();
  }

  res.render('session-new', { metas, coaches: coaches || [], coachees: coachees || [], error: null });
});

router.post('/sessions/new', isAuthenticated, (req, res) => {
  const { meta_id, titulo, fecha, duracion } = req.body;
  const userId = req.session.userId;
  const rol = req.session.rol;

  const meta = db.prepare('SELECT * FROM metas WHERE id = ?').get(meta_id);
  if (!meta) return res.redirect('/sessions');

  let coachId, coacheeId;
  if (rol === 'coach' || rol === 'admin') {
    coachId = userId;
    coacheeId = meta.usuario_id;
  } else {
    coachId = meta.coach_id;
    coacheeId = userId;
  }

  // Check payment/free session for coachees
  if (rol === 'coachee' && coachId) {
    const payments = require('./payments');
    const available = payments.getAvailableSessions(userId, coachId);
    if (available <= 0) {
      return res.redirect(`/checkout/${coachId}`);
    }
    // Consume a session from the oldest payment
    const usedFree = payments.hasUsedFreeSession(userId, coachId);
    if (usedFree) {
      const pago = db.prepare(
        "SELECT * FROM pagos WHERE usuario_id = ? AND coach_id = ? AND estado = 'completado' AND sesiones_usadas < sesiones_totales ORDER BY created_at ASC LIMIT 1"
      ).get(userId, coachId);
      if (pago) {
        db.prepare('UPDATE pagos SET sesiones_usadas = sesiones_usadas + 1 WHERE id = ?').run(pago.id);
      }
    }
  }

  db.prepare(`
    INSERT INTO sesiones (meta_id, coach_id, coachee_id, titulo, fecha, duracion, estado)
    VALUES (?, ?, ?, ?, ?, ?, 'programada')
  `).run(meta_id, coachId, coacheeId, titulo, fecha, duracion || 60);

  res.redirect('/sessions');
});

// Session detail with GROW
router.get('/sessions/:id', isAuthenticated, (req, res) => {
  const session = db.prepare(`
    SELECT s.*,
      c.nombre as coach_nombre, c.apellido as coach_apellido, c.especialidad,
      co.nombre as coachee_nombre, co.apellido as coachee_apellido,
      m.titulo as meta_titulo, m.descripcion as meta_descripcion, m.progreso as meta_progreso, m.categoria
    FROM sesiones s
    JOIN usuarios c ON s.coach_id = c.id
    JOIN usuarios co ON s.coachee_id = co.id
    JOIN metas m ON s.meta_id = m.id
    WHERE s.id = ?
  `).get(req.params.id);

  if (!session) return res.redirect('/sessions');

  const userId = req.session.userId;
  if (session.coach_id !== userId && session.coachee_id !== userId && req.session.rol !== 'admin') {
    return res.redirect('/sessions');
  }

  res.render('session-detail', { session });
});

// Update GROW notes
router.post('/sessions/:id/grow', isAuthenticated, (req, res) => {
  const { grow_goal, grow_reality, grow_options, grow_will, notas_coach, notas_coachee, estado } = req.body;
  const sessionId = req.params.id;

  const session = db.prepare('SELECT * FROM sesiones WHERE id = ?').get(sessionId);
  if (!session) return res.redirect('/sessions');

  const userId = req.session.userId;
  if (session.coach_id !== userId && session.coachee_id !== userId && req.session.rol !== 'admin') {
    return res.redirect('/sessions');
  }

  db.prepare(`
    UPDATE sesiones SET grow_goal=?, grow_reality=?, grow_options=?, grow_will=?,
      notas_coach=?, notas_coachee=?, estado=?
    WHERE id = ?
  `).run(
    grow_goal || session.grow_goal,
    grow_reality || session.grow_reality,
    grow_options || session.grow_options,
    grow_will || session.grow_will,
    notas_coach || session.notas_coach,
    notas_coachee || session.notas_coachee,
    estado || session.estado,
    sessionId
  );

  if (estado === 'completada' && session.meta_id) {
    const totalSessions = db.prepare('SELECT COUNT(*) as c FROM sesiones WHERE meta_id = ?').get(session.meta_id).c;
    const completedSessions = db.prepare("SELECT COUNT(*) as c FROM sesiones WHERE meta_id = ? AND estado = 'completada'").get(session.meta_id).c;
    const progress = Math.round((completedSessions / totalSessions) * 100);
    db.prepare('UPDATE metas SET progreso = ? WHERE id = ?').run(Math.min(progress, 100), session.meta_id);
  }

  res.redirect(`/sessions/${sessionId}`);
});

// Rate session
router.post('/sessions/:id/rate', isAuthenticated, (req, res) => {
  const { calificacion, feedback } = req.body;
  db.prepare('UPDATE sesiones SET calificacion = ?, feedback = ? WHERE id = ?')
    .run(calificacion, feedback, req.params.id);
  res.redirect(`/sessions/${req.params.id}`);
});

module.exports = router;
