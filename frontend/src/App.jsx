import { useAuth, AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import AuthPage from "./components/Auth/AuthPage";
import Dashboard from "./components/Dashboard/Dashboard";
import "./styles/global.css";

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
