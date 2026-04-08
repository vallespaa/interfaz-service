import { api } from "./apiClient";

// ─── Notificaciones ───────────────────────────────────────────────────────────

/**
 * Lista notificaciones con filtros opcionales.
 *
 * @param {{ conductorId: string, estado?: string, tipo?: string, severidad?: string }} filtros
 * @returns {Promise<Array<object>>}
 */
export const getNotificaciones = ({ conductorId, estado, tipo, severidad } = {}) => {
  const query = new URLSearchParams({
    ...(conductorId && { conductorId }),
    ...(estado && { estado }),
    ...(tipo && { tipo }),
    ...(severidad && { severidad }),
  });
  return api.get(`/notificaciones?${query}`);
};

/**
 * Obtiene el detalle de una notificación.
 *
 * @param {string} idNotificacion
 * @returns {Promise<object>}
 */
export const getDetalleNotificacion = (idNotificacion) => api.get(`/notificaciones/${idNotificacion}`);

/**
 * Marca una notificación como reconocida (ACK) — el usuario la ha visto.
 *
 * @param {string} idNotificacion
 * @returns {Promise<object>}
 */
export const ackNotificacion = (idNotificacion) => api.patch(`/notificaciones/${idNotificacion}/ack`);

/**
 * Marca una notificación como resuelta.
 *
 * @param {string} idNotificacion
 * @returns {Promise<object>}
 */
export const resolverNotificacion = (idNotificacion) =>
  api.patch(`/notificaciones/${idNotificacion}/resolver`);

// ─── Alertas ─────────────────────────────────────────────────────────────────

/**
 * Lista alertas del sistema con filtros opcionales.
 *
 * @param {{ estado?: string, tipo?: string, severidad?: string }} filtros
 * @returns {Promise<Array<object>>}
 */
export const getAlertas = ({ estado, tipo, severidad } = {}) => {
  const query = new URLSearchParams({
    ...(estado && { estado }),
    ...(tipo && { tipo }),
    ...(severidad && { severidad }),
  });
  return api.get(`/alertas?${query}`);
};

/**
 * Obtiene el detalle de una alerta.
 *
 * @param {string} idAlerta
 * @returns {Promise<object>}
 */
export const getDetalleAlerta = (idAlerta) => api.get(`/alertas/${idAlerta}`);

/**
 * Cierra una alerta activa.
 *
 * @param {string} idAlerta
 * @returns {Promise<object>}
 */
export const cerrarAlerta = (idAlerta) =>
  api.patch(`/alertas/${idAlerta}/cerrar`);
