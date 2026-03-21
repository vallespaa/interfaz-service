const router = require('express').Router();
const { conductorAdapter } = require('../gateway/index.js');

// POST /api/conductores       - Registro
// POST /api/conductores/login - Login

router.post('/', async (req, res, next) => {
  try {
    const { conductor } = req.body;

    if (!conductor || !conductor.nombre || !conductor.email || !conductor.password) {
      return res.status(400).json({ error: 'Datos del conductor incompletos' });
    }

    const data = await conductorAdapter.post('/api/conductores', req.body);
    res.status(201).json(data);
  } catch (err) { 
    next(err); 
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email y password son obligatorios' });
    }

    const data = await conductorAdapter.post('/api/conductores/login', req.body);
    res.json(data);
  } catch (err) { 
    next(err); 
  }
});

module.exports = router;