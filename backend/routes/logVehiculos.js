const router = require('express').Router();
const { logVehiculosAdapter } = require('../gateway/index.js');

// GET /api/log-vehiculos/:idVehiculo — Historial de eventos de un vehículo

router.get('/:idVehiculo', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await logVehiculosAdapter.get(`/api/log-vehiculos/${req.params.idVehiculo}`, req.query, token);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
