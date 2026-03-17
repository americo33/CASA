const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM usuarios WHERE email = ? AND activo = 1').get(email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('login', { error: 'Email o contraseña incorrectos' });
  }

  db.prepare('UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

  req.session.userId = user.id;
  req.session.nombre = user.nombre;
  req.session.apellido = user.apellido;
  req.session.email = user.email;
  req.session.rol = user.rol;
  req.session.avatar = user.avatar;

  res.redirect('/dashboard');
});

router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { error: null, form: {} });
});

router.post('/register', (req, res) => {
  const { nombre, apellido, email, password, password2, rol, especialidad, bio, pais, ciudad } = req.body;

  if (password !== password2) {
    return res.render('register', { error: 'Las contraseñas no coinciden', form: req.body });
  }

  if (password.length < 6) {
    return res.render('register', { error: 'La contraseña debe tener al menos 6 caracteres', form: req.body });
  }

  const existing = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (existing) {
    return res.render('register', { error: 'Este email ya está registrado', form: req.body });
  }

  const hash = bcrypt.hashSync(password, 10);
  const userRol = (rol === 'coach') ? 'coach' : 'coachee';

  const result = db.prepare(`
    INSERT INTO usuarios (nombre, apellido, email, password, rol, especialidad, bio, pais, ciudad)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(nombre, apellido, email, hash, userRol, especialidad || null, bio || null, pais || null, ciudad || null);

  req.session.userId = result.lastInsertRowid;
  req.session.nombre = nombre;
  req.session.apellido = apellido;
  req.session.email = email;
  req.session.rol = userRol;
  req.session.avatar = null;

  res.redirect('/dashboard');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
