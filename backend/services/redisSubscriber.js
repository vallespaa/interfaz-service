const { broadcast } = require('./websocket');

const canales = [
  process.env.CANAL_POSTES,
  process.env.CANAL_ALERTAS,
  process.env.CANAL_NOTIFICACIONES,
  process.env.CANAL_VEHICULOS
];

const iniciarSuscripciones = async (subClient) => {
  for (const canal of canales) {
    await subClient.subscribe(canal, (mensaje, channel) => {
      
      try {
        const data = JSON.parse(mensaje);
        const paquete = JSON.stringify({
          type: channel,
          payload: data
        });
        
        broadcast(paquete);
      } catch (e) {
        console.error('Error parseando JSON de Redis:', e);
      }
    });
  }
};

module.exports = { iniciarSuscripciones };