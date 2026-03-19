const express = require('express');
const router = express.Router();
const conductorService = require('../services/conductor.service');

const COOKIE_NAME = 'auth_token';
const COOKIE_OPTS = {
  httpOnly: true,       // JS del navegador no puede leerla
  sameSite: 'strict',   // protección CSRF
  maxAge: 3600 * 1000   // 1 hora en ms
  // secure: true        // descomentar en producción (HTTPS)
};

// POST /auth/register
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body ?? {};

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos: nombre, email, password' });
  }

  try {
    const conductor = await conductorService.registrar(nombre, email, password);
    res.status(201).json({ ok: true, conductor });
  } catch (err) {
    const status = err.response?.status ?? 500;
    const mensaje = err.response?.data?.error ?? 'Error al registrar';
    res.status(status).json({ error: mensaje });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan campos: email, password' });
  }

  try {
    const tokenDTO = await conductorService.login(email, password);

    // Guardamos el token en cookie HttpOnly, el frontend nunca lo ve
    res.cookie(COOKIE_NAME, tokenDTO.token, COOKIE_OPTS);

    // Al frontend solo le mandamos los datos del conductor
    // Validamos el token para obtener el ConductorDTO
    const conductor = await conductorService.validarToken(tokenDTO.token);
    res.status(200).json({ ok: true, conductor });
  } catch (err) {
    const status = err.response?.status ?? 500;
    const mensaje = err.response?.data?.error ?? 'Error al iniciar sesión';
    res.status(status).json({ error: mensaje });
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.status(200).json({ ok: true });
});

module.exports = router;