import { api, setToken, removeToken } from "./apiClient";

// TODO: Revisar gestión del Token

/**
 * Registra un nuevo conductor.
 * El backend crea automáticamente una cuenta bancaria asociada.
 *
 * @param {{ nombre: string, email: string, password: string }} datos
 * @returns {Promise<{ idConductor: string, nombre: string, email: string, password: string, idCuenta: string }>}
 */
export const registrarConductor = async (datos) => { 
  const data = await api.post("/conductores", { conductor: datos });
  if (data?.token) setToken(data.token);
  return data;
};

/**
 * Inicia sesión y guarda el token recibido.
 *
 * @param {{ email: string, password: string }} credenciales
 * @returns {Promise<{ token: string, conductor: object }>}
 */
export const login = async (credenciales) => {
  const data = await api.post("/conductores/login", credenciales);
  if (data?.token) setToken(data.token);
  return data;
};

/**
 * Cierra la sesión limpiando el token en memoria.
 */
export const logout = () => removeToken();

/**
 * Valida el token actual contra el servidor.
 * Útil para comprobar si la sesión sigue activa al cargar la app.
 *
 * @returns {Promise<{ idConductor: string, nombre: string, email: string, password: string, idCuenta: string }>}
 */
export const validarToken = () => api.get("/conductores/validate");
