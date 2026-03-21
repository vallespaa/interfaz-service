const router = require('express').Router();
const { vehiculosAdapter } = require('../gateway/index.js');

// GET /api/vehiculos          — Lista de vehículos

router.get('/', async (req, res, next) => {
  try {
    const data = await vehiculosAdapter.get('/vehiculos', {}, req.headers.authorization?.split(' ')[1]);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;