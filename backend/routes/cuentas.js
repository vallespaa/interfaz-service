const router = require('express').Router();
const { cuentasAdapter } = require('../gateway/index.js');

// GET /api/cuentas/conductor/:idConductor — Cuenta y saldo por conductor
// GET /api/cuentas/:idCuenta/movimientos  — Historial de cargos de una cuenta

router.get('/conductor/:idConductor', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    const data = await cuentasAdapter.get(`/api/cuentas/conductor/${req.params.idConductor}`, {}, token);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:idCuenta/movimientos', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

    const data = await cuentasAdapter.get(`/api/cuentas/${req.params.idCuenta}/movimientos`, {}, token);
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
