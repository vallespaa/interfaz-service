import { api } from "./apiClient";

/**
 * Lista todas las zonas operativas.
 *
 * @returns {Promise<Array<object>>}
 */
export const getZonas = () => api.get("/zonas");

/**
 * Obtiene zonas cercanas a una coordenada.
 *
 * @param {{ lat: number, lng: number, radio?: number }} params
 * @returns {Promise<Array<{
 *   idZona: string,
 *   nombre: string,
 *   coordenadas: { lat: number, lng: number },
 *   postesLibres: number,
 *   capacidadTotal: number,
 *   precioPorKW: number,
 *   tipoTarifa: string,
 *   distanciaKm: number,
 *   tiempoEstimadoMinutos: number,
 *   estado: string
 * }>>}
 */
export const getZonasCercanas = ({ lat, lng, radio } = {}) => {
  const query = new URLSearchParams({ lat, lng, ...(radio && { radio }) });
  return api.get(`/zonas/cercanas?${query}`);
};

/**
 * Obtiene el detalle completo de una zona: tarifas, lista de postes y ocupación.
 *
 * @param {string} idZona
 * @returns {Promise<{
 *   idZona: string,
 *   nombre: string,
 *   coordenadas: { lat: number, lng: number },
 *   postesLibres: number,
 *   capacidadTotal: number,
 *   precioPorKW: number,
 *   tipoTarifa: string,
 *   distanciaKm: number,
 *   tiempoEstimadoMinutos: number,
 *   estado: string
 * }>}
 */
export const getDetalleZona = (idZona) => api.get(`/zonas/${idZona}`);
