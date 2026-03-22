const router = require('express').Router();
const { zonasAdapter } = require('../gateway/index.js');

// GET  /api/zonas           — Lista de zonas operativas
// GET  /api/zonas/cercanas  — Zonas cercanas por lat/lng (query params: lat, lng, radio)
// GET  /api/zonas/:idZona   — Detalle de una zona (tarifas, postes, ocupación)

router.get('/cercanas', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { lat, lng, radio } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Los parámetros lat y lng son obligatorios' });
    }

    const data = await zonasAdapter.get('/api/zonas/cercanas', { lat, lng, radio }, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await zonasAdapter.get('/api/zonas', req.query, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:idZona', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await zonasAdapter.get(`/api/zonas/${req.params.idZona}`, {}, token);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
