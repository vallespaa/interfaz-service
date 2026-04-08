import { api } from "./apiClient";

/**
 * Lista postes con filtros opcionales.
 *
 * @param {{ idZona?: string, estado?: string }} filtros
 * @returns {Promise<Array<object>>}
 */
export const getPostes = ({ idZona, estado } = {}) => {
  const query = new URLSearchParams({
    ...(idZona && { idZona }),
    ...(estado && { estado }),
  });
  return api.get(`/postes?${query}`);
};

/**
 * Obtiene el detalle de un poste concreto.
 *
 * @param {string} idPoste
 * @returns {Promise<{ idPoste: string, idZona: string, estado: string, potenciaMax: number, idVehiculo: number }>}
 */
export const getDetallePoste = (idPoste) => api.get(`/postes/${idPoste}`);

/**
 * Actualiza el estado de un poste.
 *
 * @param {string} idPoste
 * @param {string} estado
 * @returns {Promise<object>}
 */
export const actualizarEstadoPoste = (idPoste, estado) =>
  api.patch(`/postes/${idPoste}/estado`, { estado });
