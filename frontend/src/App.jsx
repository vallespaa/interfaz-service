import { useEffect, useState } from "react";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import AuthPage from "./components/Auth/AuthPage";
import { getVehiculos, getZonas, getNotificaciones } from "./api";
import KpiBar from "./components/KpiBar";
import VehiculosTable from "./components/VehiculosTable";
import ZonasPanel from "./components/ZonasPanel";
import AlertasSidebar from "./components/AlertasSidebar";
import "./styles/global.css";

// ID del conductor logueado. En el futuro vendrá del token JWT tras el login.
const CONDUCTOR_ID = "cond-2022";
const TOKEN = null; // null mientras usamos mocks sin autenticación real

function Dashboard() {
  const [vehiculos, setVehiculos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial por Rest
  useEffect(() => {
    async function cargarDatosIniciales() {
      try {
        const [v, z, n] = await Promise.all([
          getVehiculos(TOKEN),
          getZonas(TOKEN),
          getNotificaciones(CONDUCTOR_ID, TOKEN),
        ]);
        setVehiculos(v);
        setZonas(z);
        setAlertas(n);
      } catch (err) {
        setError("Error cargando datos iniciales: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    cargarDatosIniciales();
  }, []);

  if (loading) return <p style={{ padding: "20px" }}>Cargando datos...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;

  return (
    <div style={{ 
      backgroundColor: 'white', 
      color: 'black',
      height: '100vh',
      overflow: 'auto',
      fontFamily: 'sans-serif',
      padding: "20px" 
    }}>

      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>IU Maestra — Control de Flota</h1>
      </div>

      {/* KPIs */}
      <KpiBar
        totalVehiculos={vehiculos.length}
        zonasActivas={zonas.filter(z => z.estado === "HABILITADA").length}
        alertasAbiertas={alertas.length}
        cargasActivas={2}
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

function AppInner() {
  const { conductor, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--bg-deep)",
        flexDirection: "column", gap: "16px"
      }}>
        <span style={{ fontSize: "32px", filter: "drop-shadow(0 0 12px #00d4ff)" }}>⚡</span>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "13px" }}>
          Cargando sesión…
        </span>
      </div>
    );
  }

  if (!conductor) return <AuthPage />;

  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
