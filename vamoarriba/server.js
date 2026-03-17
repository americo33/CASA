const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');
const { setLocals } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'vamoarriba-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(setLocals);

// Unread messages count middleware
app.use((req, res, next) => {
  if (req.session.userId) {
    const unread = db.prepare('SELECT COUNT(*) as c FROM mensajes WHERE receptor_id = ? AND leido = 0').get(req.session.userId);
    res.locals.unreadMessages = unread ? unread.c : 0;
    const notifs = db.prepare('SELECT COUNT(*) as c FROM notificaciones WHERE usuario_id = ? AND leida = 0').get(req.session.userId);
    res.locals.unreadNotifs = notifs ? notifs.c : 0;
  } else {
    res.locals.unreadMessages = 0;
    res.locals.unreadNotifs = 0;
  }
  next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/dashboard'));
app.use('/', require('./routes/coaches'));
app.use('/', require('./routes/sessions'));
app.use('/', require('./routes/goals'));
app.use('/', require('./routes/messages'));

// Landing page
app.get('/', (req, res) => {
  const coaches = db.prepare(`
    SELECT u.*,
      (SELECT ROUND(AVG(calificacion), 1) FROM testimonios WHERE coach_id = u.id) as rating,
      (SELECT COUNT(*) FROM testimonios WHERE coach_id = u.id) as total_reviews,
      (SELECT COUNT(DISTINCT usuario_id) FROM metas WHERE coach_id = u.id) as total_coachees
    FROM usuarios u WHERE u.rol = 'coach' AND u.activo = 1
    ORDER BY rating DESC LIMIT 6
  `).all();

  const testimonios = db.prepare(`
    SELECT t.*, u.nombre as coachee_nombre, u.apellido as coachee_apellido,
      c.nombre as coach_nombre, c.apellido as coach_apellido, c.especialidad
    FROM testimonios t
    JOIN usuarios u ON t.coachee_id = u.id
    JOIN usuarios c ON t.coach_id = c.id
    WHERE t.aprobado = 1
    ORDER BY t.calificacion DESC, t.created_at DESC LIMIT 6
  `).all();

  const stats = {
    coaches: db.prepare("SELECT COUNT(*) as c FROM usuarios WHERE rol = 'coach'").get().c,
    coachees: db.prepare("SELECT COUNT(*) as c FROM usuarios WHERE rol = 'coachee'").get().c,
    sesiones: db.prepare('SELECT COUNT(*) as c FROM sesiones').get().c,
    metas: db.prepare('SELECT COUNT(*) as c FROM metas').get().c,
  };

  res.render('index', { coaches, testimonios, stats });
});

// Resources page
app.get('/resources', (req, res) => {
  const recursos = db.prepare(`
    SELECT r.*, u.nombre as autor_nombre, u.apellido as autor_apellido
    FROM recursos r JOIN usuarios u ON r.autor_id = u.id
    ORDER BY r.created_at DESC
  `).all();
  res.render('resources', { recursos });
});

// Error page
app.get('/error', (req, res) => res.render('error', { message: 'Página no encontrada' }));
app.use((req, res) => res.status(404).render('error', { message: 'Página no encontrada' }));

// Initialize database then start server
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`\n  VamoArriba esta corriendo en http://localhost:${PORT}\n`);
    console.log(`  Admin: admin / admin1234`);
    console.log(`  Coaches: maria@vamoarriba.com / coach123`);
    console.log(`  Coachees: pedro@gmail.com / user123\n`);
  });
}).catch(err => {
  console.error('Error initializing database:', err);
  process.exit(1);
});
