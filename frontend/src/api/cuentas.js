import { api } from "./apiClient";

/**
 * Obtiene la cuenta bancaria y saldo actual de un conductor.
 *
 * @param {string} idConductor
 * @returns {Promise<{ idCuenta: string, idConductor: string, iban: string, saldoPendiente: number, moneda: string, createdAt: Date }>}
 */
export const getCuentaPorConductor = (idConductor) =>
  api.get(`/cuentas/conductor/${idConductor}`);

/**
 * Obtiene el historial de movimientos (cargos) de una cuenta.
 *
 * @param {string} idCuenta
 * @returns {Promise<Array<{ idCargo: string, concepto: string, importe: number, estado: string, createdA: Date, idReferencia: string }>>}
 */
export const getMovimientosCuenta = (idCuenta) =>
  api.get(`/cuentas/${idCuenta}/movimientos`);
