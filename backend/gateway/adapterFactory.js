const axios = require('axios');

function createAdapter(serviceName, baseUrlEnv, mockPath = null) {
  const useMock = () => mockPath && process.env[`USE_MOCK_${serviceName}`] === 'true';

  const client = axios.create({
    baseURL: process.env[baseUrlEnv],
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Reenvía el token del usuario al microservicio
  client.interceptors.request.use((config) => {
    if (config._token) {
      config.headers['Authorization'] = `Bearer ${config._token}`;
      delete config._token;
    }
    return config;
  });

  async function get(path, params = {}, token = null) {
    if (useMock()) {
      console.log(`[MOCK] ${serviceName} GET ${path}`);
      const data = require(mockPath);
      // Si el mock es un objeto con rutas, devuelve la sección correcta
      return data[path] ?? data;
    }
    const res = await client.get(path, { params, _token: token });
    return res.data;
  }

  async function post(path, body = {}, token = null) {
    if (useMock()) {
      console.log(`[MOCK] ${serviceName} POST ${path}`, body);
      const mocks = require(mockPath);
      return mocks[`POST:${path}`] ?? { success: true, mock: true };
    }
    const res = await client.post(path, body, { _token: token });
    return res.data;
  }

  async function patch(path, body = {}, token = null) {
    if (useMock()) {
      console.log(`[MOCK] ${serviceName} PATCH ${path}`, body);
      const mocks = require(mockPath);
      return mocks[`PATCH:${path}`] ?? { success: true, mock: true };
    }
    const res = await client.patch(path, body, { _token: token });
    return res.data;
  }

  async function del(path, token = null) {
    if (useMock()) {
      console.log(`[MOCK] ${serviceName} DELETE ${path}`);
      const mocks = require(mockPath);
      return mocks[`DELETE:${path}`] ?? { success: true, mock: true };
    }
    const res = await client.delete(path, { _token: token });
    return res.data;
  }

  return { get, post, patch, del };
}

module.exports = { createAdapter };
