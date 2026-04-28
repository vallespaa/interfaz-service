const router = require('express').Router();
const { cargasAdapter } = require('../gateway/index.js');

// POST   /api/cargas                   — Iniciar simulación de carga
// GET    /api/cargas                   — Listar sesiones activas
// GET    /api/cargas/:idCarga          — Estado detallado
// PUT    /api/cargas/:idCarga/detener  — Detener simulación

router.post('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
    const data = await cargasAdapter.post('/api/simulaciones/cargadores', req.body, token);
    res.status(201).json(data);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await cargasAdapter.get('/api/simulaciones/cargadores', req.query, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:idCarga', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await cargasAdapter.get(`/api/simulaciones/cargadores/${req.params.idCarga}`, {}, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.put('/:idCarga/detener', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
    const data = await cargasAdapter.put(
      `/api/simulaciones/cargadores/${req.params.idCarga}/detener`, 
      {}, 
      token
    );

    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;