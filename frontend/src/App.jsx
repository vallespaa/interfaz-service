import { useEffect, useState, useRef } from "react";
import { getVehiculos, getZonas, getNotificaciones, getCargas } from "./api";
import KpiBar from "./components/KpiBar";
import VehiculosTable from "./components/VehiculosTable";
import ZonasPanel from "./components/ZonasPanel";
import AlertasSidebar from "./components/AlertasSidebar";

// ID del conductor logueado. En el futuro vendrá del token JWT tras el login.
const CONDUCTOR_ID = "cond-2022";
const TOKEN = null; // null mientras usamos mocks sin autenticación real

function App() {
  const [vehiculos, setVehiculos] = useState([]);
  const [zonas,     setZonas]     = useState([]);
  const [alertas,   setAlertas]   = useState([]);
  const [cargas,    setCargas]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // Carga inicial por Rest
  useEffect(() => {
    async function cargarDatosIniciales() {
      try {
        const [v, z, n, c] = await Promise.all([
          getVehiculos(TOKEN),
          getZonas(TOKEN),
          getNotificaciones(CONDUCTOR_ID, TOKEN),
          getCargas(TOKEN),
        ]);
        setVehiculos(v);
        setZonas(z);
        setAlertas(n);
        setCargas(c);
      } catch (err) {
        setError("Error cargando datos iniciales: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    cargarDatosIniciales();
  }, []);

  // Actualizaciones en tiempo real a través de Web Socket
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080"); // Cambiar cuando suba a la maquina virtual

    socket.onopen = () => {
      setConnected(true);
      console.log("Conectado al servidor WebSocket");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { type, payload } = data;

      // Aquí filtramos según el tipo de mensaje que enviemos desde el servidor
      switch (type) {
        // Canal de VehiculosService
        case "vehiculos:posiciones":
          if (payload.actualizaciones) {
            setVehiculos((prev) => {
              const siguiente = [...prev];
              payload.actualizaciones.forEach((update) => {
                const idx = siguiente.findIndex(v => v.idVehiculo === update.idVehiculo);
                if (idx !== -1) {
                  siguiente[idx] = { ...siguiente[idx], ...update };
                } else {
                  siguiente.push(update);
                }
              });
              return siguiente;
            });
          }
          break;

        // Canal de ZonasCargaService
        case "infraestructura:postes":
          setZonas((prev) => {
            const zonaData = payload.payload ? payload.payload : payload;
            
            const idx = prev.findIndex(z => z.idZona === zonaData.idZona);
            if (idx !== -1) {
              const siguiente = [...prev];
              siguiente[idx] = { ...siguiente[idx], ...zonaData };
              return siguiente;
            }
            return [...prev, zonaData]; // zona nueva
          });
          break;

        // Canal de NotificationsService
        case "sistema:notificaciones":
          setAlertas((prev) => [payload, ...prev].slice(0, 10)); // máx 10
          break;

        default:
          console.log("Evento WebSocket no manejado:", type);
      }
    };

    socket.onerror  = () => setConnected(false);
    socket.onclose  = () => setConnected(false);
    socketRef.current = socket;

    return () => socket.close();
  }, []);

  // Renderizado

  if (loading) return <p style={{ padding: "20px" }}>Cargando datos...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>

      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>IU Maestra — Control de Flota</h1>
        <span>{connected ? "🟢 Conectado" : "🔴 Desconectado"}</span>
      </div>

      {/* KPIs */}
      <KpiBar
        totalVehiculos={vehiculos.length}
        zonasActivas={zonas.filter(z => z.estado === "HABILITADA").length}
        alertasAbiertas={alertas.length}
        cargasActivas={cargas.length}
      />

      {/* Cuerpo: contenido principal + sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "20px" }}>

        {/* Columna izquierda */}
        <main>
          <h2>Vehículos</h2>
          <VehiculosTable vehiculos={vehiculos} />

          <h2 style={{ marginTop: "32px" }}>Zonas de carga</h2>
          <ZonasPanel zonas={zonas} />
        </main>

        {/* Columna derecha */}
        <AlertasSidebar alertas={alertas} />

      </div>
    </div>
  );
}

export default App;
