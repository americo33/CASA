const express = require('express');
const db = require('../database');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.get('/coaches', (req, res) => {
  const { especialidad, pais, buscar } = req.query;
  let query = `
    SELECT u.*,
      (SELECT COUNT(*) FROM metas WHERE coach_id = u.id) as total_coachees,
      (SELECT COUNT(*) FROM sesiones WHERE coach_id = u.id) as total_sesiones,
      (SELECT ROUND(AVG(calificacion), 1) FROM testimonios WHERE coach_id = u.id) as rating,
      (SELECT COUNT(*) FROM testimonios WHERE coach_id = u.id) as total_reviews
    FROM usuarios u WHERE u.rol = 'coach' AND u.activo = 1
  `;
  const params = [];

  if (especialidad) {
    query += ' AND u.especialidad = ?';
    params.push(especialidad);
  }
  if (pais) {
    query += ' AND u.pais = ?';
    params.push(pais);
  }
  if (buscar) {
    query += ' AND (u.nombre LIKE ? OR u.apellido LIKE ? OR u.especialidad LIKE ? OR u.bio LIKE ?)';
    const like = `%${buscar}%`;
    params.push(like, like, like, like);
  }

  query += ' ORDER BY rating DESC, total_sesiones DESC';
  const coaches = db.prepare(query).all(...params);

  const especialidades = db.prepare("SELECT DISTINCT especialidad FROM usuarios WHERE rol = 'coach' AND especialidad IS NOT NULL").all();
  const paises = db.prepare("SELECT DISTINCT pais FROM usuarios WHERE rol = 'coach' AND pais IS NOT NULL").all();

  res.render('coaches', { coaches, especialidades, paises, filtros: req.query });
});

router.get('/coach/:id', (req, res) => {
  const coach = db.prepare(`
    SELECT u.*,
      (SELECT COUNT(DISTINCT usuario_id) FROM metas WHERE coach_id = u.id) as total_coachees,
      (SELECT COUNT(*) FROM sesiones WHERE coach_id = u.id) as total_sesiones,
      (SELECT ROUND(AVG(calificacion), 1) FROM testimonios WHERE coach_id = u.id) as rating
    FROM usuarios u WHERE u.id = ? AND u.rol = 'coach'
  `).get(req.params.id);

  if (!coach) return res.redirect('/coaches');

  const testimonios = db.prepare(`
    SELECT t.*, u.nombre, u.apellido
    FROM testimonios t JOIN usuarios u ON t.coachee_id = u.id
    WHERE t.coach_id = ? AND t.aprobado = 1 ORDER BY t.created_at DESC
  `).all(req.params.id);

  const metas = db.prepare(`
    SELECT m.titulo, m.categoria, m.estado, m.progreso, u.nombre as coachee_nombre
    FROM metas m JOIN usuarios u ON m.usuario_id = u.id
    WHERE m.coach_id = ? ORDER BY m.created_at DESC LIMIT 5
  `).all(req.params.id);

  res.render('coach-detail', { coach, testimonios, metas });
});

module.exports = router;
