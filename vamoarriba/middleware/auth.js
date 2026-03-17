function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

function isCoach(req, res, next) {
  if (req.session && (req.session.rol === 'coach' || req.session.rol === 'admin')) {
    return next();
  }
  res.status(403).render('error', { message: 'Acceso denegado. Solo coaches pueden acceder.', user: req.session });
}

function isAdmin(req, res, next) {
  if (req.session && req.session.rol === 'admin') {
    return next();
  }
  res.status(403).render('error', { message: 'Acceso denegado. Solo administradores.', user: req.session });
}

function setLocals(req, res, next) {
  res.locals.user = req.session.userId ? {
    id: req.session.userId,
    nombre: req.session.nombre,
    apellido: req.session.apellido,
    email: req.session.email,
    rol: req.session.rol,
    avatar: req.session.avatar
  } : null;
  res.locals.currentPath = req.path;
  next();
}

module.exports = { isAuthenticated, isCoach, isAdmin, setLocals };
