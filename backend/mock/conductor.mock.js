const express = require('express');
const app = express();
app.use(express.json());

// Base de datos en memoria
const conductores = [
  {
    idConductor: 'c-1',
    nombre: 'Alberto',
    email: 'alberto@gmail.com',
    password: 'contraseña1234',
    idCuenta: 'cta-1'
  }
];

// Tokens activos: { tokenString -> idConductor }
const tokens = {};

function generarToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function conductorDTO(c) {
  return {
    idConductor: c.idConductor,
    nombre: c.nombre,
    email: c.email,
    idCuenta: c.idCuenta
  };
}

// POST /api/conductores — Registro
app.post('/api/conductores', (req, res) => {
  const { nombre, email, password } = req.body?.conductor ?? {};

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (conductores.find(c => c.email === email)) {
    return res.status(400).json({ error: 'Email ya registrado' });
  }

  const nuevo = {
    idConductor: `c-${conductores.length + 1}`,
    nombre,
    email,
    password,
    idCuenta: `cta-${conductores.length + 1}`
  };

  conductores.push(nuevo);
  console.log(`[MOCK] Conductor registrado: ${email}`);
  res.status(201).json(conductorDTO(nuevo));
});

// POST /api/conductores/login — Login
app.post('/api/conductores/login', (req, res) => {
  const { email, password } = req.body ?? {};

  const conductor = conductores.find(
    c => c.email === email && c.password === password
  );

  if (!conductor) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const tokenString = generarToken();
  const expiraEn = 3600; // segundos
  tokens[tokenString] = {
    idConductor: conductor.idConductor,
    expira: Date.now() + expiraEn * 1000
  };

  console.log(`[MOCK] Login correcto: ${email}`);
  res.status(200).json({ token: tokenString, expiraEn, tipo: 'Bearer' });
});

// GET /api/conductores/validate — Validar token
app.get('/api/conductores/validate', (req, res) => {
  const authHeader = req.headers['authorization'] ?? '';
  const tokenString = authHeader.replace('Bearer ', '').trim();

  const entrada = tokens[tokenString];

  if (!entrada) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  if (Date.now() > entrada.expira) {
    delete tokens[tokenString];
    return res.status(401).json({ error: 'Token expirado' });
  }

  // Renueva expiración (igual que haría el real)
  entrada.expira = Date.now() + 3600 * 1000;

  const conductor = conductores.find(c => c.idConductor === entrada.idConductor);
  res.status(200).json(conductorDTO(conductor));
});

app.listen(8081, () => {
  console.log('[MOCK] ConductorService corriendo en http://localhost:8081');
});