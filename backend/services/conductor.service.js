const axios = require('axios');

const BASE_URL = process.env.CONDUCTOR_SERVICE_URL;

async function registrar(nombre, email, password) {
  const res = await axios.post(`${BASE_URL}/api/conductores`, {
    conductor: { nombre, email, password }
  });
  return res.data; // ConductorDTO
}

async function login(email, password) {
  const res = await axios.post(`${BASE_URL}/api/conductores/login`, {
    email,
    password
  });
  return res.data; // TokenDTO
}

async function validarToken(token) {
  const res = await axios.get(`${BASE_URL}/api/conductores/validate`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data; // ConductorDTO
}

module.exports = { registrar, login, validarToken };