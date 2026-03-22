const router = require('express').Router();
const { reservasAdapter } = require('../gateway/index.js');

// POST   /api/reservas             — Crear reserva (bloquea un poste 15 min)
// DELETE /api/reservas/:idReserva  — Cancelar una reserva activa

router.post('/', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    const data = await reservasAdapter.post('/api/reservas', req.body, token);
    res.status(201).json(data);
  } catch (err) { next(err); }
});

router.delete('/:idReserva', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    const data = await reservasAdapter.del(`/api/reservas/${req.params.idReserva}`, token);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
