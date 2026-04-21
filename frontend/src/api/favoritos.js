import { api } from "./apiClient";

/**
 * Devuelve la lista de zonas favoritas del conductor autenticado.
 *
 * @returns {Promise<Array<{ idFavorito: string, idConductor: string, idZona: string, fechaGuardado: string }>>}
 */
export const getFavoritos = () => api.get("/iu/favoritos");

/**
 * Añade una zona a los favoritos del conductor autenticado.
 * Devuelve 409 si ya existe.
 *
 * @param {string} idZona
 * @returns {Promise<{ idFavorito: string, idConductor: string, idZona: string, fechaGuardado: string }>}
 */
export const crearFavorito = (idZona) => api.post("/iu/favoritos", { idZona });

/**
 * Elimina una zona de los favoritos del conductor autenticado.
 * Devuelve 403 si el favorito no pertenece al conductor.
 *
 * @param {string} idFavorito
 * @returns {Promise<void>}
 */
export const eliminarFavorito = (idFavorito) => api.delete(`/iu/favoritos/${idFavorito}`);
