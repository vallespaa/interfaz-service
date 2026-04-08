import { api } from "./apiClient";

/**
 * Lista las cargas finalizadas.
 * Se puede filtrar por conductor para mostrar solo el historial propio.
 *
 * @param {{ conductorId?: string }} filtros
 * @returns {Promise<Array<{
 *   idRegistro: string,
 *   idCliente: string,
 *   idVehiculo: string,
 *   idPoste: string,
 *   fechaInicio: string,
 *   fechaFin: string,
 *   importeCargo: number,
 * }>>}
 */
export const getHistorico = ({ conductorId } = {}) => {
  const query = new URLSearchParams({ ...(conductorId && { conductorId }) });
  return api.get(`/historico?${query}`);
};

/**
 * Obtiene el detalle completo de una carga histórica concreta.
 *
 * @param {string} idCarga
 * @returns {Promise<object>}
 */
export const getDetalleCargaHistorica = (idCarga) =>
  api.get(`/historico/${idCarga}`);
