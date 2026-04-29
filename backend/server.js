require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http'); 

const { subClient, pubClient } = require('./config/redis');
const conectarDB = require('./config/db');
const { iniciarWebSocket } = require('./services/websocket');
const { iniciarSuscripciones } = require('./services/redisSubscriber');

// RUTAS
const favoritosRoutes = require('./routes/favoritos');
const conductoresRoutes = require('./routes/conductores');
const vehiculosRoutes = require('./routes/vehiculos');
const zonasRoutes = require('./routes/zonas');
const postesRoutes = require('./routes/postes');
const reservasRoutes = require('./routes/reservas');
const cargasRoutes = require('./routes/cargas');
const historicoRoutes = require('./routes/historico');
const notificacionesRoutes = require('./routes/notificaciones');
const cuentasRoutes = require('./routes/cuentas');
const logVehiculosRoutes = require('./routes/logVehiculos');

const app = express();
const PORT = process.env.PORT;

// CONFIGURACIÓN

app.use(cors({
  origin: process.env.FRONTEND_URL, 
  credentials: true
}));
app.use(express.json());

// REGISTRO RUTAS API
app.use('/api/iu/favoritos', favoritosRoutes); // Mi API
app.use('/api/conductores', conductoresRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/zonas', zonasRoutes);
app.use('/api/postes', postesRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/cargas', cargasRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/log-vehiculos', logVehiculosRoutes);

// Configuración HTTP + WebSocket
const httpServer = createServer(app);
iniciarWebSocket(httpServer);

// ARRANQUE DEL SISTEMA

async function start() {
  try {
    await conectarDB();

    await subClient.connect();
    await pubClient.connect();
    console.log("Conectado a Redis. Publicador y Suscriptor listos.");

    await iniciarSuscripciones(subClient);
    
    httpServer.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Ruta GET /api/iu/favoritos en http://localhost:${PORT}/api/iu/favoritos`);
    }); 
  } catch (err) {
    console.error('Error fatal arrancando el servidor:', err);
    process.exit(1);
  }
}

start();
