const express = require('express');
const db = require('../database');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

const PRECIO_SESION = 80; // USD por sesión individual

// Pricing page
router.get('/pricing', (req, res) => {
  const paquetes = db.prepare('SELECT * FROM paquetes WHERE activo = 1 ORDER BY semanas ASC').all();
  const coaches = db.prepare("SELECT id, nombre, apellido, especialidad FROM usuarios WHERE rol = 'coach' AND activo = 1").all();
  res.render('pricing', { paquetes, coaches, precioSesion: PRECIO_SESION });
});

// Check if user has free session available with a coach
function hasUsedFreeSession(userId, coachId) {
  const existing = db.prepare(
    "SELECT COUNT(*) as c FROM sesiones WHERE coachee_id = ? AND coach_id = ?"
  ).get(userId, coachId);
  return existing.c > 0;
}

// Get available sessions for a user with a coach
function getAvailableSessions(userId, coachId) {
  const pagos = db.prepare(
    "SELECT * FROM pagos WHERE usuario_id = ? AND coach_id = ? AND estado = 'completado' AND sesiones_usadas < sesiones_totales ORDER BY created_at ASC"
  ).all(userId, coachId);
  let total = 0;
  for (const p of pagos) {
    total += (p.sesiones_totales - p.sesiones_usadas);
  }
  // Add free session if not used
  if (!hasUsedFreeSession(userId, coachId)) {
    total += 1;
  }
  return total;
}

// API: Check available sessions
router.get('/api/sessions-available/:coachId', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const coachId = parseInt(req.params.coachId);
  const available = getAvailableSessions(userId, coachId);
  const usedFree = hasUsedFreeSession(userId, coachId);
  res.json({ available, usedFree, needsPayment: available <= 0 });
});

// Checkout page - Select package and pay
router.get('/checkout/:coachId', isAuthenticated, (req, res) => {
  const coachId = parseInt(req.params.coachId);
  const coach = db.prepare("SELECT id, nombre, apellido, especialidad FROM usuarios WHERE id = ? AND rol = 'coach'").get(coachId);
  if (!coach) return res.redirect('/coaches');

  const paquetes = db.prepare('SELECT * FROM paquetes WHERE activo = 1 ORDER BY semanas ASC').all();
  const usedFree = hasUsedFreeSession(req.session.userId, coachId);
  const available = getAvailableSessions(req.session.userId, coachId);

  // Get user's payment history with this coach
  const pagosAnteriores = db.prepare(
    "SELECT * FROM pagos WHERE usuario_id = ? AND coach_id = ? ORDER BY created_at DESC"
  ).all(req.session.userId, coachId);

  res.render('checkout', {
    coach, paquetes, usedFree, available,
    precioSesion: PRECIO_SESION,
    pagosAnteriores
  });
});

// Process payment (Stripe Checkout session)
router.post('/checkout/process', isAuthenticated, (req, res) => {
  const { coach_id, paquete_id, payment_type } = req.body;
  const userId = req.session.userId;
  const coachId = parseInt(coach_id);

  const coach = db.prepare("SELECT id, nombre, apellido FROM usuarios WHERE id = ? AND rol = 'coach'").get(coachId);
  if (!coach) return res.redirect('/coaches');

  let concepto, monto, sesionesTotales;

  if (payment_type === 'individual') {
    concepto = `Sesión individual con ${coach.nombre} ${coach.apellido}`;
    monto = PRECIO_SESION;
    sesionesTotales = 1;
  } else {
    const paquete = db.prepare('SELECT * FROM paquetes WHERE id = ? AND activo = 1').get(parseInt(paquete_id));
    if (!paquete) return res.redirect(`/checkout/${coachId}`);
    concepto = `${paquete.nombre} con ${coach.nombre} ${coach.apellido}`;
    monto = paquete.precio_total;
    sesionesTotales = paquete.sesiones;
  }

  // If Stripe is configured, create checkout session
  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: concepto, description: `VamoArriba Coaching - ${sesionesTotales} sesión(es)` },
          unit_amount: Math.round(monto * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/${coachId}`,
      metadata: { userId: userId.toString(), coachId: coachId.toString(), sesionesTotales: sesionesTotales.toString(), paqueteId: (paquete_id || '').toString() },
    }).then(session => {
      // Save pending payment
      db.prepare(`
        INSERT INTO pagos (usuario_id, coach_id, paquete_id, stripe_session_id, concepto, monto, estado, sesiones_totales)
        VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?)
      `).run(userId, coachId, paquete_id || null, session.id, concepto, monto, sesionesTotales);

      res.redirect(session.url);
    }).catch(err => {
      console.error('Stripe error:', err);
      res.render('checkout', {
        coach, paquetes: db.prepare('SELECT * FROM paquetes WHERE activo = 1 ORDER BY semanas ASC').all(),
        usedFree: hasUsedFreeSession(userId, coachId),
        available: getAvailableSessions(userId, coachId),
        precioSesion: PRECIO_SESION,
        pagosAnteriores: db.prepare("SELECT * FROM pagos WHERE usuario_id = ? AND coach_id = ? ORDER BY created_at DESC").all(userId, coachId),
        error: 'Error al procesar el pago. Intenta de nuevo.'
      });
    });
  } else {
    // Demo mode: simulate successful payment
    const result = db.prepare(`
      INSERT INTO pagos (usuario_id, coach_id, paquete_id, stripe_payment_id, concepto, monto, estado, sesiones_totales, metodo_pago, fecha_pago)
      VALUES (?, ?, ?, ?, ?, ?, 'completado', ?, 'demo', CURRENT_TIMESTAMP)
    `).run(userId, coachId, paquete_id || null, 'demo_' + Date.now(), concepto, monto, sesionesTotales);

    res.redirect(`/payment/success?demo=1&payment_id=${result.lastInsertRowid}`);
  }
});

// Payment success page
router.get('/payment/success', isAuthenticated, (req, res) => {
  const { session_id, demo, payment_id } = req.query;
  let pago;

  if (demo && payment_id) {
    pago = db.prepare('SELECT p.*, u.nombre as coach_nombre, u.apellido as coach_apellido FROM pagos p JOIN usuarios u ON p.coach_id = u.id WHERE p.id = ? AND p.usuario_id = ?')
      .get(parseInt(payment_id), req.session.userId);
  } else if (session_id) {
    // Confirm Stripe payment
    pago = db.prepare('SELECT p.*, u.nombre as coach_nombre, u.apellido as coach_apellido FROM pagos p JOIN usuarios u ON p.coach_id = u.id WHERE p.stripe_session_id = ? AND p.usuario_id = ?')
      .get(session_id, req.session.userId);

    if (pago && pago.estado === 'pendiente') {
      // Mark as completed
      db.prepare("UPDATE pagos SET estado = 'completado', fecha_pago = CURRENT_TIMESTAMP WHERE id = ?").run(pago.id);
      pago.estado = 'completado';

      // Confirm with Stripe
      if (process.env.STRIPE_SECRET_KEY) {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        stripe.checkout.sessions.retrieve(session_id).then(session => {
          if (session.payment_status === 'paid') {
            db.prepare("UPDATE pagos SET stripe_payment_id = ?, metodo_pago = 'stripe' WHERE id = ?")
              .run(session.payment_intent, pago.id);
          }
        }).catch(() => {});
      }
    }
  }

  if (!pago) return res.redirect('/dashboard');
  res.render('payment-success', { pago });
});

// My payments
router.get('/my-payments', isAuthenticated, (req, res) => {
  const pagos = db.prepare(`
    SELECT p.*, u.nombre as coach_nombre, u.apellido as coach_apellido, u.especialidad as coach_especialidad,
      pk.nombre as paquete_nombre
    FROM pagos p
    JOIN usuarios u ON p.coach_id = u.id
    LEFT JOIN paquetes pk ON p.paquete_id = pk.id
    WHERE p.usuario_id = ?
    ORDER BY p.created_at DESC
  `).all(req.session.userId);

  res.render('my-payments', { pagos });
});

// Stripe webhook (for production)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send('Stripe not configured');
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      db.prepare("UPDATE pagos SET estado = 'completado', stripe_payment_id = ?, metodo_pago = 'stripe', fecha_pago = CURRENT_TIMESTAMP WHERE stripe_session_id = ?")
        .run(session.payment_intent, session.id);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Export helper for session booking
router.getAvailableSessions = getAvailableSessions;
router.hasUsedFreeSession = hasUsedFreeSession;
router.PRECIO_SESION = PRECIO_SESION;

module.exports = router;
