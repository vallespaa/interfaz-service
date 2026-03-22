const router = require('express').Router();
const { vehiculosAdapter } = require('../gateway/index.js');

// GET  /api/vehiculos               — Lista de vehículos
// GET  /api/vehiculos/:idVehiculo   — Detalle de un vehículo
// POST /api/vehiculos               — Crear vehículo

router.get('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await vehiculosAdapter.get('/api/vehiculos', req.query, token);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:idVehiculo', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await vehiculosAdapter.get(`/api/vehiculos/${req.params.idVehiculo}`, {}, token);
    res.json(data);
  } catch (err) {
    next(err);
  }
});
 
router.post('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
 
    const data = await vehiculosAdapter.post('/api/vehiculos', req.body, token);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});
 
module.exports = router;
