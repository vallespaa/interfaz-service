const BASE = "http://localhost:8080";

// Helper interno: hace el fetch y lanza error si la respuesta no es 2xx
async function apiFetch(path, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`Error ${res.status} en ${path}`);
  return res.json();
}

// --- Vehículos ---
export function getVehiculos(token) {
  return apiFetch("/api/vehiculos", token);
}

// --- Zonas de carga ---
export function getZonas(token) {
  return apiFetch("/api/zonas", token);
}

// --- Notificaciones activas de un conductor ---
export function getNotificaciones(conductorId, token) {
  return apiFetch(`/api/notificaciones?conductorId=${conductorId}&estado=ABIERTA`, token);
}

// --- Cargas activas ---
export function getCargas(token) {
  return apiFetch("/api/cargas", token);
}
