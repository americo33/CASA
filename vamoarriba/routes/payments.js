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

  const pagosAnteriores = db.prepare(
    "SELECT * FROM pagos WHERE usuario_id = ? AND coach_id = ? ORDER BY created_at DESC"
  ).all(req.session.userId, coachId);

  res.render('checkout', {
    coach, paquetes, usedFree, available,
    precioSesion: PRECIO_SESION,
    pagosAnteriores
  });
});

// Process payment (MercadoPago Checkout)
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

  // If MercadoPago is configured, create preference
  if (process.env.MP_ACCESS_TOKEN) {
    const { MercadoPagoConfig, Preference } = require('mercadopago');
    const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const preference = new Preference(mpClient);
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    preference.create({
      body: {
        items: [{
          title: concepto,
          description: `VamoArriba Coaching - ${sesionesTotales} sesión(es)`,
          quantity: 1,
          currency_id: 'USD',
          unit_price: monto,
        }],
        back_urls: {
          success: `${baseUrl}/payment/success`,
          failure: `${baseUrl}/checkout/${coachId}`,
          pending: `${baseUrl}/payment/success`,
        },
        auto_return: 'approved',
        external_reference: JSON.stringify({ userId, coachId, sesionesTotales, paqueteId: paquete_id || null }),
        notification_url: `${baseUrl}/webhook/mercadopago`,
      }
    }).then(result => {
      // Save pending payment
      db.prepare(`
        INSERT INTO pagos (usuario_id, coach_id, paquete_id, mp_preference_id, concepto, monto, estado, sesiones_totales)
        VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?)
      `).run(userId, coachId, paquete_id || null, result.id, concepto, monto, sesionesTotales);

      // Redirect to MercadoPago checkout
      const mpUrl = process.env.MP_SANDBOX === 'true' ? result.sandbox_init_point : result.init_point;
      res.redirect(mpUrl);
    }).catch(err => {
      console.error('MercadoPago error:', err);
      res.render('checkout', {
        coach, paquetes: db.prepare('SELECT * FROM paquetes WHERE activo = 1 ORDER BY semanas ASC').all(),
        usedFree: hasUsedFreeSession(userId, coachId),
        available: getAvailableSessions(userId, coachId),
        precioSesion: PRECIO_SESION,
        pagosAnteriores: db.prepare("SELECT * FROM pagos WHERE usuario_id = ? AND coach_id = ? ORDER BY created_at DESC").all(userId, coachId),
        error: 'Error al procesar el pago con MercadoPago. Intenta de nuevo.'
      });
    });
  } else {
    // Demo mode: simulate successful payment
    const result = db.prepare(`
      INSERT INTO pagos (usuario_id, coach_id, paquete_id, mp_payment_id, concepto, monto, estado, sesiones_totales, metodo_pago, fecha_pago)
      VALUES (?, ?, ?, ?, ?, ?, 'completado', ?, 'demo', CURRENT_TIMESTAMP)
    `).run(userId, coachId, paquete_id || null, 'demo_' + Date.now(), concepto, monto, sesionesTotales);

    res.redirect(`/payment/success?demo=1&payment_id=${result.lastInsertRowid}`);
  }
});

// Payment success page
router.get('/payment/success', isAuthenticated, (req, res) => {
  const { payment_id: mpPaymentId, status, external_reference, demo, payment_id } = req.query;
  let pago;

  if (demo && payment_id) {
    // Demo mode
    pago = db.prepare('SELECT p.*, u.nombre as coach_nombre, u.apellido as coach_apellido FROM pagos p JOIN usuarios u ON p.coach_id = u.id WHERE p.id = ? AND p.usuario_id = ?')
      .get(parseInt(payment_id), req.session.userId);
  } else if (status === 'approved' && external_reference) {
    // MercadoPago approved payment
    let ref;
    try { ref = JSON.parse(external_reference); } catch (e) { return res.redirect('/dashboard'); }

    // Find the pending payment for this user/coach
    pago = db.prepare(
      "SELECT p.*, u.nombre as coach_nombre, u.apellido as coach_apellido FROM pagos p JOIN usuarios u ON p.coach_id = u.id WHERE p.usuario_id = ? AND p.coach_id = ? AND p.estado = 'pendiente' ORDER BY p.created_at DESC LIMIT 1"
    ).get(ref.userId, ref.coachId);

    if (pago) {
      db.prepare("UPDATE pagos SET estado = 'completado', mp_payment_id = ?, metodo_pago = 'mercadopago', fecha_pago = CURRENT_TIMESTAMP WHERE id = ?")
        .run(mpPaymentId || '', pago.id);
      pago.estado = 'completado';
    }
  } else if (status === 'pending' && external_reference) {
    // MercadoPago pending payment
    let ref;
    try { ref = JSON.parse(external_reference); } catch (e) { return res.redirect('/dashboard'); }

    pago = db.prepare(
      "SELECT p.*, u.nombre as coach_nombre, u.apellido as coach_apellido FROM pagos p JOIN usuarios u ON p.coach_id = u.id WHERE p.usuario_id = ? AND p.coach_id = ? AND p.estado = 'pendiente' ORDER BY p.created_at DESC LIMIT 1"
    ).get(ref.userId, ref.coachId);

    if (pago) {
      db.prepare("UPDATE pagos SET mp_payment_id = ? WHERE id = ?").run(mpPaymentId || '', pago.id);
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

// MercadoPago webhook (IPN - Instant Payment Notification)
router.post('/webhook/mercadopago', (req, res) => {
  if (!process.env.MP_ACCESS_TOKEN) {
    return res.status(200).send('OK');
  }

  const { type, data } = req.body;

  if (type === 'payment' && data && data.id) {
    const { MercadoPagoConfig, Payment } = require('mercadopago');
    const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
    const payment = new Payment(mpClient);

    payment.get({ id: data.id }).then(paymentData => {
      if (paymentData.status === 'approved' && paymentData.external_reference) {
        let ref;
        try { ref = JSON.parse(paymentData.external_reference); } catch (e) { return; }

        db.prepare(
          "UPDATE pagos SET estado = 'completado', mp_payment_id = ?, metodo_pago = 'mercadopago', fecha_pago = CURRENT_TIMESTAMP WHERE usuario_id = ? AND coach_id = ? AND estado = 'pendiente' ORDER BY created_at DESC LIMIT 1"
        ).run(String(data.id), ref.userId, ref.coachId);
      }
    }).catch(err => {
      console.error('MercadoPago webhook error:', err.message);
    });
  }

  res.status(200).send('OK');
});

// Export helper for session booking
router.getAvailableSessions = getAvailableSessions;
router.hasUsedFreeSession = hasUsedFreeSession;
router.PRECIO_SESION = PRECIO_SESION;

module.exports = router;
