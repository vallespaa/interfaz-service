const { broadcast } = require('./websocket');

const canales = [
  process.env.CANAL_MOTORSIMULACION,
  process.env.CANAL_VEHICULOS,
  process.env.CANAL_NOTIFICACIONES,
  process.env.CANAL_IUMAESTRO,
];

const iniciarSuscripciones = async (subClient) => {
  for (const canal of canales) {
    if (!canal) continue;

    await subClient.subscribe(canal, (mensaje, channel) => {

      try {
        const data = JSON.parse(mensaje);

        console.log(`\n[Redis] 📥 Mensaje recibido en canal: ${channel}`);
        console.log(`Contenido:`, data);
        
        const paquete = JSON.stringify({
          type: channel,
          payload: data
        });
        
        broadcast(paquete);
      } catch (e) {
        console.error(`[Redis] Error parseando mensaje del canal ${channel}:`, e);
      }
    });
    console.log(`[Redis] Suscrito al canal: ${canal}`);
  }
};

module.exports = { iniciarSuscripciones };