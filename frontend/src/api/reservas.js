import { api } from "./apiClient";

/**
 * Crea una reserva, bloqueando un poste durante 15 minutos.
 * Si no se inicia la carga antes, el backend la cancela automáticamente.
 *
 * @param {{ idZona: string, idConductor: string, idVehiculo: string }} datos
 * @returns {Promise<{
 *   idReserva: string,
 *   idZona: string,
 *   idPoste: string,
 *   idVehiculo: string,
 *   idUsuario: string,
 *   estado: string,
 *   fechaCreacion: string,
 *   fechaExpiracion: string,
 *   precioPorKWh: number,
 *   tipoTarifa: string,
 *   notificacionPreventivaEnviada: boolean
 * }>}
 */
export const crearReserva = (datos) => api.post("/reservas", datos);

/**
 * Cancela una reserva activa antes de que expire.
 *
 * @param {string} idReserva
 * @returns {Promise<null>}
 */
export const cancelarReserva = (idReserva) =>
  api.delete(`/reservas/${idReserva}`);
