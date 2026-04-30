# Backend — API Gateway

> Node.js/Express que actúa como punto de entrada único para el frontend y orquesta las llamadas al resto de microservicios.

---

## Descripción general

El backend de la IU Maestro es un **API Gateway monolítico** construido en Node.js. Recibe todas las peticiones del frontend React y las delega a los microservicios correspondientes mediante adaptadores configurables. Soporta comunicación síncrona (REST) y asíncrona (Redis Pub/Sub + WebSockets).

Una de sus características clave es el sistema de **adaptadores con mocks**: si un microservicio externo no está disponible, basta con activar la variable `USE_MOCK_<SERVICIO>=true` para que el backend use datos simulados de la carpeta `mocks/`, sin necesidad de cambiar ninguna lógica de negocio.

---

## Arquitectura interna

```
backend/
├── routes/          # Definición de rutas HTTP públicas
├── controllers/     # Lógica de orquestación y validación
├── gateway/
│   └── adapterFactory.js   # Abstrae llamadas REST vs. mocks
├── services/
│   ├── websocket.js        # Envío de eventos en tiempo real al frontend
│   └── redisSubscriber.js  # Suscripción a canales Redis de microservicios
├── models/
│   └── favoritos.js        # Esquema Mongoose (único dato propio)
├── middlewares/
│   └── auth.js             # Validación JWT
├── mocks/           # Datos de ejemplo para desarrollo sin microservicios
└── config/          # Conexión a MongoDB y Redis
```

---

## Stack tecnológico

| Librería | Uso |
|---|---|
| Express.js | Framework HTTP y definición de rutas |
| Mongoose | ODM para MongoDB (favoritos) |
| Redis (ioredis) | Pub/Sub para eventos en tiempo real |
| ws | WebSockets hacia el frontend |
| Axios | Cliente HTTP para llamadas a microservicios |
| jsonwebtoken | Generación y validación de JWT |
| dotenv | Gestión de variables de entorno |
| uuid | Generación de identificadores únicos |
| cookie-parser | Gestión de cookies de sesión |

---

## Configuración — Variables de entorno

Crea un fichero `backend/.env` basado en `.env.example`:

```env
# Servidor
PORT=8080
FRONTEND_URL=http://localhost:3000

# Autenticación
JWT_SECRET=cambia_esto_por_una_clave_segura

# Base de datos propia (favoritos)
MONGO_URI=mongodb://mongo:27017/iumaestro

# Redis
REDIS_URL=redis://canal:contraseña@canal-redis:puerto
CANAL_MOTORSIMULACION=MotorSimulacionService/simulacion.cargadores/estado
CANAL_VEHICULOS=vehículos/eventos
CANAL_NOTIFICACIONES=notifications-service/eventos
CANAL_IUMAESTRO=iumaestro:favoritos

# URLs de microservicios externos
CONDUCTOR_SERVICE_URL=http://conductor-service:puerto
VEHICULOS_SERVICE_URL=http://vehiculos-service:puerto
ZONAS_SERVICE_URL=http://zonas-service:puerto
POSTES_SERVICE_URL=http://postes-service:puerto
RESERVAS_SERVICE_URL=http://reservas-service:puerto
CARGAS_SERVICE_URL=http://cargas-service:puerto
HISTORICO_SERVICE_URL=http://historico-service:puerto
NOTIFICACIONES_SERVICE_URL=http://notificaciones-service:puerto
CUENTAS_SERVICE_URL=http://cuentas-service:puerto
LOG_VEHICULOS_SERVICE_URL=http://log-vehiculos-service:puerto

# Mocks: pon 'true' para usar datos simulados cuando el servicio no esté disponible
USE_MOCK_CONDUCTOR=false
USE_MOCK_VEHICULOS=false
USE_MOCK_ZONAS=false
USE_MOCK_POSTES=false
USE_MOCK_RESERVAS=false
USE_MOCK_CARGAS=false
USE_MOCK_HISTORICO=false
USE_MOCK_NOTIFICACIONES=false
USE_MOCK_CUENTAS=false
USE_MOCK_LOG_VEHICULOS=false
```

---

## API REST

**Base URL:** `http://localhost:8080`

### Conductores
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/conductores` | Registro (crea también cuenta bancaria) |
| `POST` | `/api/conductores/login` | Login (devuelve JWT) |
| `GET` | `/api/conductores/validate` | Valida token JWT |

### Vehículos
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/vehiculos` | Lista vehículos del conductor |
| `GET` | `/api/vehiculos/:idVehiculo` | Detalle de un vehículo |
| `POST` | `/api/vehiculos` | Crear nuevo vehículo |

### Zonas de carga
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/zonas` | Lista todas las zonas |
| `GET` | `/api/zonas/cercanas?lat=&lng=` | Zonas próximas al conductor |
| `GET` | `/api/zonas/:idZona` | Detalle de zona |

### Postes
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/postes?idZona=&estado=` | Postes filtrados |
| `GET` | `/api/postes/:idPoste` | Detalle de poste |
| `PATCH` | `/api/postes/:idPoste/estado` | Actualizar estado de poste |

### Reservas
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/reservas` | Crear reserva (bloquea poste 15 min) |
| `DELETE` | `/api/reservas/:idReserva` | Cancelar reserva |

### Cargas
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/cargas` | Iniciar sesión de carga |
| `GET` | `/api/cargas` | Listar cargas activas |
| `GET` | `/api/cargas/:idCarga` | Detalle de carga |
| `PUT` | `/api/cargas/:idCarga/detener` | Detener carga |

### Historial
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/historico` | Historial de cargas del conductor |
| `GET` | `/api/historico/:idCarga` | Detalle de carga histórica |

### Notificaciones
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/notificaciones` | Lista de notificaciones |
| `GET` | `/api/notificaciones/:id` | Detalle de notificación |
| `PATCH` | `/api/notificaciones/:id/ack` | Marcar como vista |
| `PATCH` | `/api/notificaciones/:id/resolver` | Resolver incidencia |

### Cuenta y perfil
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/cuentas/conductor/:idConductor` | Saldo y datos de cuenta |
| `GET` | `/api/cuentas/:idCuenta/movimientos` | Historial de movimientos |
| `GET` | `/api/log-vehiculos/:idVehiculo` | Log de eventos de vehículo |

### Favoritos *(datos propios del gateway)*
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/iu/favoritos` | Lista favoritos del conductor |
| `POST` | `/api/iu/favoritos` | Crear favorito |
| `DELETE` | `/api/iu/favoritos/:id` | Eliminar favorito |

---

## Comunicación en tiempo real

El backend combina **Redis Pub/Sub** y **WebSockets** para enviar actualizaciones al frontend sin necesidad de polling:

- Los microservicios publican eventos en canales Redis.
- `services/redisSubscriber.js` escucha esos canales.
- `services/websocket.js` reenvía los eventos a los clientes conectados.

Eventos típicos:
- `vehiculos:posiciones` — actualización de posición y batería de vehículos
- `infraestructura:postes` — cambios de estado en postes de carga
- `iumaestro.favoritos` — sincronización de zonas favoritas

---

## Persistencia de datos

El backend solo persiste **datos propios**: los favoritos de zonas de cada conductor, guardados en MongoDB con Mongoose.

El resto de la información reside en los microservicios externos y se consulta en tiempo real. Redis se usa exclusivamente para mensajería Pub/Sub, no como caché.

---

## Autenticación y seguridad

1. El conductor hace login y recibe un JWT del Conductor Service.
2. El frontend lo almacena en `sessionStorage`.
3. Cada petición incluye el header `Authorization: Bearer <token>`.
4. El middleware `middlewares/auth.js` valida el token en todas las rutas protegidas.
5. El backend extrae el `idConductor` del token y lo propaga a los microservicios externos, sin exponerlo al frontend.

---

## Ejecución local

Con Docker Compose (recomendado):

```bash
cd backend
cp .env.example .env    # configura las variables
docker-compose up --build
```

El backend queda disponible en `http://localhost:8080`.

---

## Añadir nueva funcionalidad

1. Crear la ruta en `routes/`.
2. Añadir la lógica en un nuevo controller en `controllers/`.
3. Si consume un microservicio externo, añadir el adaptador en `gateway/`.
4. Registrar la ruta en `server.js`.
5. Si necesitas datos simulados, añadir el mock correspondiente en `mocks/`.