const cookieParser = require('cookie-parser');        // ← NUEVO
const authRoutes = require('./routes/auth.routes');   // ← NUEVO


const redis = require('redis');
const express = require('express');
const cors = require('cors');
const { createServer } = require('http'); 
const { WebSocketServer } = require('ws');

const { estadoSistema, iniciarSimulacion } = require('./mockData');

// CONFIGURACIÓN

const app = express();
const port = 8080;

app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true
}));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));     // ← NUEVO
app.use('/auth', authRoutes);                         // ← NUEVO

// Cliente Redis
const subClient = redis.createClient({ url: process.env.REDIS_URL });
const pubClient = redis.createClient({ url: process.env.REDIS_URL });

subClient.on('error', (err) => console.error('Redis Sub Error:', err));
pubClient.on('error', (err) => console.error('Redis Pub Error:', err));

// Configuración HTTP + WebSocket
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer }); 

// WEBSOCKET

wss.on('connection', (ws) => {
  console.log(`Cliente conectado`);

  const mensajeInicial = JSON.stringify({
    type: 'ESTADO_INICIAL',
    payload: estadoSistema
  });
  ws.send(mensajeInicial);

  ws.on('close', () => console.log('Cliente desconectado'));
  ws.on('error', console.error);
});

// RUTAS EXPRESS 

const authMiddleware = require('./middleware/auth.middleware');
app.get('/api/iu/estado', authMiddleware, (req, res) => {
  console.log("Petición de estado recibida");
  res.status(200).json(estadoSistema); 
});

// ARRANQUE DEL SISTEMA

// Configuramos cliente Redis
async function conectarRedis() {
  await subClient.connect();
  await pubClient.connect();
  console.log("Conectado a Redis. Publicador y Suscriptor listos.");

  iniciarSimulacion(pubClient);

  const canales = [
    process.env.CANAL_POSTES,
    process.env.CANAL_ALERTAS,
    process.env.CANAL_NOTIFICACIONES,
    process.env.CANAL_VEHICULOS
  ];

  for (const nombreCanal of canales) {
    await subClient.subscribe(nombreCanal, (mensaje, channel) => {
      
      try {
        const data = JSON.parse(mensaje);
        const paquete = JSON.stringify({
          type: channel,
          payload: data
        });

        console.log(paquete);

        wss.clients.forEach((wsClient) => {
          if (wsClient.readyState === 1) {
            wsClient.send(paquete);
          }
        });
      } catch (e) {
        console.error("Error parseando JSON de Redis:", e);
      }
    });
  }
}

conectarRedis().catch((err) => {
  console.error("Error fatal conectando Redis:", err);
  process.exit(1);
});

httpServer.listen(port, () => {
    console.log(`Servidor con WebSockets corriendo en http://localhost:${port}`);
    console.log(`Ruta GET /api/iu/estado en http://localhost:${port}/api/iu/estado`);
});