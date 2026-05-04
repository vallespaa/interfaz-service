# ⚡ EV Charging System — IU Maestro

> Interfaz de usuario e integración para un ecosistema distribuido de simulación de carga de vehículos eléctricos.

Este repositorio contiene el microservicio **IU Maestro**, desarrollado como parte de un proyecto colaborativo de arquitectura de microservicios. Es la única capa con la que interactúa el usuario final: integra, orquesta y presenta el ecosistema completo de carga eléctrica.

---

## 🗺️ Contexto del sistema

El ecosistema completo está formado por los siguientes microservicios independientes, desarrollados por distintos equipos:

| Microservicio | Responsabilidad |
|---|---|
| **Conductor Service** | Registro, login y tokens JWT |
| **Cuenta Service** | Contabilidad de cargos mensuales |
| **Vehículos Service** | Posición GPS, batería y estado del vehículo |
| **Log Vehículos Service** | Registro de eventos de vehículo |
| **ZonasCarga Service** | Agrupación geográfica de postes de carga |
| **PostesCarga Service** | Estado individual de cada poste |
| **Cargas Service** | Sesiones de carga activas |
| **HistóricoCargas Service** | Archivo inmutable de cargas completadas |
| **MotorSimulación** | Núcleo de simulación (actualiza vehículos y postes periódicamente) |
| **Notifications Service** | Central de alertas e incidencias |
| **IU Maestro** *(este repo)* | API Gateway + interfaz React |

La IU Maestro actúa como **API Gateway**: recibe todas las peticiones del frontend y las orquesta hacia los microservicios correspondientes.

---

## 🏗️ Arquitectura

```
┌────────────────────────────────────────┐
│              Frontend (React)          │
│         http://localhost:3000          │
└──────────────────┬─────────────────────┘
                   │ HTTP / WebSocket
┌──────────────────▼─────────────────────┐
│         Backend — API Gateway          │
│         Node.js + Express              │
│         http://localhost:8080          │
│                                        │
│ ┌─────────┐ ┌───────────┐ ┌──────────┐ │
│ │ Routes  │ │Controllers│ │ Gateway  │ │
│ └─────────┘ └───────────┘ └────┬─────┘ │
│  ┌─────────┐ ┌──────────┐      │       │
│  │MongoDB  │ │  Redis   │      │       │
│  │Favoritos│ │ Pub/Sub  │      │       │
│  └─────────┘ └──────────┘      │       │
└────────────────────────────────┼───────┘
                                 │ REST HTTP
              ┌──────────────────▼──────────────────┐
              │       Microservicios externos       │
              │  Conductor · Cuentas · Vehículos    │
              │ Zonas · Postes · Cargas · Histórico │
              │  Notificaciones · MotorSimulación   │
              └─────────────────────────────────────┘
```

La comunicación es tanto **síncrona** (REST via Axios hacia los microservicios) como **asíncrona** (Redis Pub/Sub + WebSockets hacia el frontend).

---

## 📁 Estructura del repositorio

```
/
├── backend/           # API Gateway — Node.js/Express
│   ├── routes/        # Definición de rutas HTTP
│   ├── controllers/   # Lógica de orquestación
│   ├── gateway/       # Adaptadores hacia microservicios externos
│   ├── services/      # WebSocket y Redis Pub/Sub
│   ├── models/        # Esquemas Mongoose (favoritos)
│   ├── middlewares/   # Autenticación JWT
│   ├── mocks/         # Datos simulados para desarrollo
│   └── config/        # Configuración de BD y Redis
│
├── frontend/          # SPA React
│   └── src/
│       ├── context/   # AuthContext y AppContext
│       ├── api/       # Cliente HTTP y wrappers por dominio
│       ├── components/# Auth, Dashboard, Map, Panel, Notifications, Profile
│       └── services/  # Cliente WebSocket
│
└── docker-compose.yml # Orquestación de contenedores
```

---

## 🚀 Puesta en marcha

### Prerrequisitos

- [Docker](https://www.docker.com/) y Docker Compose instalados.
- Los microservicios externos deben estar accesibles en red, o bien activar los **mocks** del backend (ver configuración).

### 1. Configurar variables de entorno

Copia el fichero de ejemplo y rellena los valores:

```bash
cp backend/.env.example backend/.env
```

Variables requeridas en `backend/.env`:

```env
# Servidor
PORT=8080
FRONTEND_URL=http://localhost:3000

# Autenticación
JWT_SECRET=tu_clave_secreta_aqui

# Base de datos
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

# Activar mocks (true = usa datos simulados en lugar del servicio real)
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

> **Modo mock:** Si algún microservicio externo no está disponible, puedes poner `USE_MOCK_<SERVICIO>=true`. El sistema usará datos simulados de `backend/mocks/` y el resto de la aplicación seguirá funcionando con normalidad.

### 2. Levantar el entorno

```bash
docker-compose up --build
```

Esto arranca automáticamente:
- El **backend** en `http://localhost:8080`
- El **frontend** en `http://localhost:3000`
- Una instancia de **MongoDB** para los favoritos

### 3. Acceder a la aplicación

Abre `http://localhost:3000` en el navegador, regístrate con un correo y contraseña y el sistema creará automáticamente una cuenta bancaria asociada a tu perfil.

---

## ✨ Funcionalidades principales

- **Registro e inicio de sesión** con autenticación JWT
- **Mapa interactivo** con zonas de carga codificadas por color según disponibilidad (verde / naranja / rojo), actualizado en tiempo real via WebSockets
- **Detalle de zona**: ocupación, tarifas (€/kWh) y selección de poste
- **Reserva de poste** con cuenta atrás de 15 minutos y cancelación automática
- **Sesión de carga activa**: telemetría en tiempo real (batería, kWh entregados, potencia, coste acumulado)
- **Resumen e historial** de cargas completadas
- **Centro de notificaciones**: postes averiados, batería baja, interrupciones
- **Perfil y cuenta bancaria**: saldo, IBAN, historial de movimientos

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React, React-Leaflet, Context API |
| Backend | Node.js, Express.js |
| Base de datos | MongoDB (Mongoose) |
| Mensajería async | Redis Pub/Sub |
| Tiempo real | WebSockets (ws) |
| Autenticación | JWT |
| HTTP client | Axios |
| Contenedores | Docker, Docker Compose |

---

## 🔐 Seguridad

- El token JWT se almacena en `sessionStorage` del navegador.
- Todas las rutas protegidas del backend validan el token vía middleware.
- El `idConductor` se extrae del token en el backend y nunca se expone directamente al frontend.
- El token se propaga automáticamente en la cabecera `Authorization: Bearer` hacia los microservicios externos.

---

## 📝 Contexto académico

Este proyecto fue desarrollado como parte de la asignatura de **Sistemas y Tecnologías Web** como ejercicio práctico de diseño e implementación de microservicios. Cada miembro del equipo desarrolló un microservicio independiente; este repositorio contiene la capa de integración y presentación (IU Maestro).

Los adaptadores con soporte de mocks (`gateway/adapterFactory.js`) permitieron desarrollar e integrar la interfaz de forma autónoma, sin depender de la disponibilidad simultánea del resto de equipos.

---

## 📄 Documentación adicional

- [`backend/README.md`](./backend/README.md) — Detalle del API Gateway: rutas, controladores, adaptadores y configuración.
- [`frontend/README.md`](./frontend/README.md) — Detalle del frontend React: componentes, contexto y flujo de datos.