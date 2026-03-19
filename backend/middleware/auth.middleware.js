const conductorService = require('../services/conductor.service');

const COOKIE_NAME = 'auth_token';

async function authMiddleware(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  try {
    // Valida el token y renueva su expiración en el ConductorService
    const conductor = await conductorService.validarToken(token);

    // Inyectamos el conductor en la request para que las rutas lo usen
    req.conductor = conductor;
    next();
  } catch (err) {
    res.clearCookie(COOKIE_NAME);
    return res.status(401).json({ error: 'Sesión expirada o inválida' });
  }
}

module.exports = authMiddleware;