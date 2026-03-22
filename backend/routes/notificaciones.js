const router = require('express').Router();
const { notificacionesAdapter } = require('../gateway/index.js');

// GET   /api/notificaciones                     — Lista notificaciones (filtros: conductorId, estado, tipo, severidad)
// GET   /api/notificaciones/:id                 — Detalle de una notificación
// PATCH /api/notificaciones/:id/ack             — Marcar como reconocida (ACK)
// PATCH /api/notificaciones/:id/resolver        — Marcar como resuelta

router.get('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await notificacionesAdapter.get('/api/notificaciones', req.query, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await notificacionesAdapter.get(`/api/notificaciones/${req.params.id}`, {}, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.patch('/:id/ack', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    const data = await notificacionesAdapter.patch(`/api/notificaciones/${req.params.id}/ack`, {}, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.patch('/:id/resolver', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    const data = await notificacionesAdapter.patch(`/api/notificaciones/${req.params.id}/resolver`, {}, token);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
