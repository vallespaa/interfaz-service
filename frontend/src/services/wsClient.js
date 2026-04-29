const WS_URL = `ws://${window.location.hostname}:8080`;

let socket = null;
const listeners = {};
let reconnectTimer = null;

// ── Conexión ──────────────────────────────────────────────────────────────────

export const conectarWS = () => {
  if (socket && socket.readyState < 2) return; // ya conectado o conectando

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log('[WS] Conectado a', WS_URL);
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  socket.onclose = () => {
    console.warn('[WS] Desconectado. Reintentando en 5 segundos…');
    socket = null;
    // Reconexión automática tras 5 segundos
    reconnectTimer = setTimeout(conectarWS, 5000);
  };

  socket.onerror = (err) => {
    console.error('[WS] Error de socket:', err);
  };

  socket.onmessage = (event) => {
    let type, payload;
    try {
      ({ type, payload } = JSON.parse(event.data));
    } catch (e) {
      console.error('[WS] Mensaje no parseable:', event.data, e);
      return;
    }

    const cbs = listeners[type];
    if (cbs) {
      cbs.forEach(cb => {
        try { cb(payload); }
        catch (e) { console.error(`[WS] Error en listener de "${type}":`, e); }
      });
    }
  };
};

export const desconectarWS = () => {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  socket?.close();
  socket = null;
};

// ── Pub/Sub ligero ────────────────────────────────────────────────────────────

/**
 * Suscribirse a un canal WS.
 * @param {string} type  - El valor de `type` que llega en el mensaje JSON.
 *                         Debe coincidir exactamente con el nombre del canal Redis.
 * @param {function} callback - Se llama con `payload` cada vez que llega el evento.
 */
export const suscribir = (type, callback) => {
  if (!listeners[type]) listeners[type] = new Set();
  listeners[type].add(callback);
};

/**
 * Cancelar suscripción a un canal.
 * Llamar siempre desde el cleanup de useEffect para evitar memory leaks.
 */
export const desuscribir = (type, callback) => {
  listeners[type]?.delete(callback);
};