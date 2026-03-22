const router = require('express').Router();
const { cargasAdapter } = require('../gateway/index.js');

// POST   /api/cargas          — Iniciar una sesión de carga
// GET    /api/cargas          — Consultar cargas activas (filtro por vehiculoId via query)
// GET    /api/cargas/:idCarga — Estado en tiempo real de una carga activa
// DELETE /api/cargas/:idCarga — Finalizar/cerrar manualmente una sesión de carga

router.post('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    const data = await cargasAdapter.post('/api/cargas', req.body, token);
    res.status(201).json(data);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await cargasAdapter.get('/api/cargas', req.query, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:idCarga', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await cargasAdapter.get(`/api/cargas/${req.params.idCarga}`, {}, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.delete('/:idCarga', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    const data = await cargasAdapter.del(`/api/cargas/${req.params.idCarga}`, token);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
