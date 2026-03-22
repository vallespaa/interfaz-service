const router = require('express').Router();
const { historicoAdapter } = require('../gateway/index.js');

// GET /api/historico           — Lista de cargas finalizadas (filtro por conductorId via query)
// GET /api/historico/:idCarga  — Detalle completo de una carga histórica

router.get('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await historicoAdapter.get('/api/historico', req.query, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:idCarga', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await historicoAdapter.get(`/api/historico/${req.params.idCarga}`, {}, token);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
