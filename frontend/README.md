# Frontend — Aplicación React

> Single Page Application para conductores de vehículos eléctricos. Presenta el ecosistema de carga en un mapa interactivo y gestiona reservas, sesiones de carga, notificaciones y perfil.

---

## Descripción general

El frontend es una SPA construida con **React** y Create React App. Se comunica exclusivamente con el backend API Gateway (`http://{host}:8080/api`) y no accede directamente a ningún microservicio externo.

La navegación principal se organiza en cuatro áreas: **mapa**, **notificaciones**, **historial** y **perfil**. El panel derecho del mapa es contextual y cambia según el estado de la sesión del conductor (lista de zonas → detalle de zona → reserva activa → carga activa).

---

## Stack tecnológico

| Librería | Uso |
|---|---|
| React (CRA) | Framework de UI |
| React Context API | Estado global (sesión y navegación) |
| React-Leaflet + Leaflet | Mapa interactivo |
| fetch API | Comunicación HTTP centralizada |
| ws | Cliente WebSocket (preparado para tiempo real) |
| React Testing Library + Jest | Tests de componentes |

---

## Estructura de carpetas

```
src/
├── App.jsx                  # Punto de entrada; inicializa providers
├── index.js                 # Arranque de la app
│
├── context/
│   ├── AuthContext.jsx      # Sesión, token JWT y datos del conductor
│   └── AppContext.jsx       # Modo del panel, zona seleccionada, reserva activa
│
├── api/
│   ├── apiClient.js         # Cliente HTTP centralizado (token, base URL)
│   └── *.js                 # Wrappers por dominio: zonas, postes, reservas...
│
├── services/
│   └── wsClient.js          # Cliente WebSocket
│
├── components/
│   ├── Auth/                # Pantallas de login y registro
│   ├── Dashboard/           # Layout principal y navegación
│   ├── Map/                 # Mapa interactivo con zonas de carga
│   ├── Panel/               # Panel derecho contextual
│   │   ├── ZonasList.jsx    # Listado de zonas cercanas
│   │   ├── ZonaDetalle.jsx  # Detalle de zona y selección de poste
│   │   ├── ReservaPanel.jsx # Cuenta atrás de reserva
│   │   └── CargaPanel.jsx   # Telemetría de carga activa
│   ├── Notifications/       # Centro de notificaciones
│   └── Profile/             # Perfil, vehículos y cuenta bancaria
│
└── styles/                  # Estilos globales
```

---

## Configuración

El frontend **no requiere fichero `.env`** en su configuración actual. La URL base de la API se determina dinámicamente en `src/api/apiClient.js`:

```js
const BASE_URL = `http://${window.location.hostname}:8080/api`;
```

Esto hace que siempre apunte al mismo host del navegador en el puerto `8080`, lo cual funciona tanto en local como en cualquier entorno de despliegue sin necesidad de reconfigurar.

---

## Flujo principal de la aplicación

```
App.jsx
  └── AuthProvider + AppProvider
        ├── [Sin sesión] → AuthPage (login / registro)
        └── [Con sesión] → Dashboard
              ├── MapView          ← mapa + zonas en tiempo real
              ├── RightPanel       ← panel contextual
              │     ├── ZonasList
              │     ├── ZonaDetalle
              │     ├── ReservaPanel
              │     └── CargaPanel
              ├── NotificationsPage
              └── ProfilePage
```

### Autenticación

1. El conductor introduce email y contraseña en `AuthPage`.
2. La llamada a `POST /api/conductores/login` devuelve un JWT.
3. El token se guarda en `sessionStorage` bajo la clave `ev_token`.
4. `apiClient.js` lo incluye automáticamente en el header `Authorization: Bearer` de todas las peticiones.
5. Al recargar la página, `AuthContext` valida el token con `GET /api/conductores/validate` antes de mostrar la aplicación.

### Panel contextual (flujo de carga)

| Estado | Componente activo | Qué hace |
|---|---|---|
| Inicio | `ZonasList` | Muestra zonas cercanas ordenadas por distancia |
| Zona seleccionada | `ZonaDetalle` | Postes disponibles, tarifas y selección |
| Reserva creada | `ReservaPanel` | Cuenta atrás de 15 min, cancelación y arranque de carga |
| Carga en curso | `CargaPanel` | Telemetría: batería, kWh, potencia y coste acumulado |

---

## Componentes clave

### `AuthContext.jsx`
Gestiona el ciclo de vida de la sesión. Expone `login()`, `logout()` y los datos del conductor autenticado. Valida el token al montar la aplicación.

### `AppContext.jsx`
Controla la navegación interna del panel derecho (`panelMode`), la zona seleccionada y la reserva activa. Centraliza las acciones de UI para evitar prop drilling.

### `MapView.jsx`
Renderiza el mapa con `react-leaflet`. Carga las zonas cercanas al montar, usa geocodificación de OpenStreetMap para búsqueda por nombre, y pinta marcadores con color según disponibilidad (verde / naranja / rojo). Permite marcar zonas como favoritas.

### `CargaPanel.jsx`
Simula la telemetría de carga actualizando estado de batería, kWh entregados y coste cada 10 segundos. Está preparado para recibir estos datos via WebSocket cuando el microservicio de cargas lo soporte.

### `ReservaPanel.jsx`
Cuenta atrás de 15 minutos. Llama a `cancelarReserva()` automáticamente si el tiempo expira. Permite cancelar manualmente o iniciar la carga.

### `NotificationsPage.jsx`
Lista notificaciones del conductor (postes averiados, batería baja...). Actualiza el badge de no leídas en el contexto global. Permite marcar como vista (`/ack`) o resolver (`/resolver`).

### `ProfilePage.jsx`
Muestra datos personales, vehículos asociados, saldo de cuenta e IBAN. Incluye el historial de movimientos bancarios del Cuenta Service y el cierre mensual automático.

---

## Ejecución local

Con Docker Compose desde la raíz del proyecto (recomendado):

```bash
docker-compose up --build
```

El frontend queda disponible en `http://localhost:3000`.

---

## Limitaciones y trabajo futuro

- La telemetría de `CargaPanel` es actualmente local (simula datos en el cliente). Está preparada para reemplazarse por eventos WebSocket reales cuando el Cargas Service los emita.
- La cuenta atrás de `ReservaPanel` funciona en el cliente; idealmente debería estar dirigida por el servidor para garantizar consistencia.