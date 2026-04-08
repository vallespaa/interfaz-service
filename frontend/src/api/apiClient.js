const BASE_URL = `http://${window.location.hostname}:8080/api`;

// TODO: Ajustar getToken / setToken / removeToken según compañero
// Por ahora se guarda en memoria para no tocarlo en localStorage hasta decidirlo.

let _token = null;

export const setToken = (token) => {
  _token = token;
};

export const getToken = () => _token;

export const removeToken = () => {
  _token = null;
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

/**
 * Realiza una petición HTTP genérica.
 *
 * @param {string} endpoint  — Ruta relativa, ej: "/zonas/cercanas"
 * @param {object} options   — Opciones extra de fetch (method, body, signal…)
 * @returns {Promise<any>}   — JSON parseado de la respuesta
 * @throws {ApiError}        — Error enriquecido con status y mensaje del servidor
 */
async function request(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (_token) {
    headers["Authorization"] = `Bearer ${_token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Respuestas sin cuerpo (204 No Content, etc.)
  if (response.status === 204) return null;

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      data?.mensaje ?? data?.message ?? "Error desconocido",
      response.status,
      data
    );
  }

  return data;
}

// ─── Error personalizado ──────────────────────────────────────────────────────

export class ApiError extends Error {
  /**
   * @param {string} message   — Mensaje legible
   * @param {number} status    — Código HTTP (400, 401, 404…)
   * @param {object} data      — Cuerpo completo del error tal como lo devuelve el server
   */
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ─── Métodos HTTP convenientes ────────────────────────────────────────────────

export const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: "GET" }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: (endpoint, body = {}, options = {}) =>
    request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: "DELETE" }),
};
