import { api } from "./apiClient";

/**
 * Lista todos los vehículos del sistema.
 *
 * @returns {Promise<Array<object>>}
 */
export const getVehiculos = () => api.get("/vehiculos");

/**
 * Obtiene el detalle de un vehículo, incluyendo posición GPS,
 * velocidad, rumbo y estado de batería.
 *
 * @param {string} idVehiculo
 * @returns {Promise<{
 *   idVehiculo: string,
 *   idConductor: string,
 *   matricula: string,
 *   modelo: string,
 *   latitud: number,
 *   longitud: number,
 *   velocidad: number,
 *   rumbo: number,
 *   potenciaCarga: number,
 *   nivelBateriaActual: number,
 *   capacidadBateriaMaxima: number,
 *   saludbateria: number,
 *   estado: string
 * }>}
 */
export const getDetalleVehiculo = (idVehiculo) =>
  api.get(`/vehiculos/${idVehiculo}`);

/**
 * Crea un nuevo vehículo asociado a un conductor.
 *
 * @param {{ idConductor: string, matricula: string, modelo: string, capacidadBateriaMaxima: number, potenciaCarga: number }} datos
 * @returns {Promise<object>}
 */
export const crearVehiculo = (datos) => api.post("/vehiculos", datos);
