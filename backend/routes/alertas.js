const router = require('express').Router();
const { notificacionesAdapter } = require('../gateway/index.js');

// GET   /api/alertas                  — Lista alertas (filtros: estado, tipo, severidad)
// GET   /api/alertas/:idAlerta        — Detalle de una alerta
// PATCH /api/alertas/:idAlerta/cerrar — Cerrar una alerta

router.get('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await notificacionesAdapter.get('/api/alertas', req.query, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:idAlerta', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await notificacionesAdapter.get(`/api/alertas/${req.params.idAlerta}`, {}, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.patch('/:idAlerta/cerrar', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    const data = await notificacionesAdapter.patch(`/api/alertas/${req.params.idAlerta}/cerrar`, {}, token);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
