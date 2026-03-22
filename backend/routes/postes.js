const router = require('express').Router();
const { postesAdapter } = require('../gateway/index.js');

// GET   /api/postes           — Lista de postes (filtros por zona, estado via query params)
// GET   /api/postes/:idPoste  — Detalle de un poste
// PATCH /api/postes/:idPoste/estado — Actualizar estado de un poste

router.get('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await postesAdapter.get('/api/postes', req.query, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:idPoste', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const data = await postesAdapter.get(`/api/postes/${req.params.idPoste}`, {}, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.patch('/:idPoste/estado', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    const data = await postesAdapter.patch(`/api/postes/${req.params.idPoste}/estado`, req.body, token);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
