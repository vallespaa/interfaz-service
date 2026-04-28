import { api } from "./apiClient";

/**
 * Inicia una sesión de carga simulada.
 * @param {{
 *   cargadorId: string,
 *   vehiculoId: string,
 *   socInicial: number,
 *   socObjetivo: number,
 *   capacidadBateriaKwh: number,
 *   potenciaMaxCargadorKw: number,
 *   voltajeNominal: number
 * }}
 * @returns {Promise<{
 *   id: string,
 *   cargadorId: string,
 *   vehiculoId: string,
 *   estado: string,
 *   estadoIEC: string,
 *   faseCarga: string,
 *   potenciaActual: number,
 *   corrienteActual: number,
 *   energiaEntregada: number,
 *   socInicial: number,
 *   socActual: number,
 *   socObjetivo: number,
 *   tiempoRestante: number,
 *   ticksEjecutados: number,
 *   creadoEn: string,
 *   actualizadoEn: string
 * }>}
 */
export const iniciarSesionCarga = (datos) => api.post("/cargas", datos);

/**
 * Obtiene el estado detallado de una sesión de carga específica.
 * * @param {string} id
 * @returns {Promise<object>}
 */
export const getEstadoSesionCarga = (id) => api.get(`/cargas/${id}`);

/**
 * Detiene una sesión de carga (simula que el usuario desconecta).
 * * @param {string} id
 * @returns {Promise<object>}
 */
export const detenerSesionCarga = (id) => api.put(`/cargas/${id}/detener`);