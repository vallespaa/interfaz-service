const { WebSocketServer } = require('ws');
const { estadoSistema } = require('../mockData');

let wss;

const iniciarWebSocket = (httpServer) => {
  wss = new WebSocketServer({ server: httpServer });

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

  return wss;
};

const broadcast = (paquete) => {
  wss?.clients.forEach((wsClient) => {
    if (wsClient.readyState === 1) {
      wsClient.send(paquete);
    }
  });
};

module.exports = { iniciarWebSocket, broadcast };