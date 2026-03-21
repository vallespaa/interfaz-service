require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http'); 

const { subClient, pubClient } = require('./config/redis');
const { iniciarWebSocket } = require('./services/websocket');
const { iniciarSuscripciones } = require('./services/redisSubscriber');
const { estadoSistema, iniciarSimulacion } = require('./mockData');

// RUTAS
//const authRoutes = require('./routes/auth');
const vehiculosRoutes = require('./routes/vehiculos.js');

const app = express();
const PORT = process.env.PORT || 8080;

// CONFIGURACIÓN

app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true
}));
app.use(express.json());

// REGISTRO RUTAS API
app.use('/api/vehiculos', vehiculosRoutes);

app.get('/api/iu/estado', (req, res) => {
  console.log("Petición de estado recibida");
  res.status(200).json(estadoSistema); 
});

// Configuración HTTP + WebSocket
const httpServer = createServer(app);
iniciarWebSocket(httpServer);

// ARRANQUE DEL SISTEMA

async function start() {
  try {
    await subClient.connect();
    await pubClient.connect();
    console.log("Conectado a Redis. Publicador y Suscriptor listos.");

    iniciarSimulacion(pubClient);
    await iniciarSuscripciones(subClient);
    
    httpServer.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Ruta GET /api/iu/estado en http://localhost:${PORT}/api/iu/estado`);
    }); 
  } catch (err) {
    console.error('Error fatal arrancando el servidor:', err);
    process.exit(1);
  }
}

start();