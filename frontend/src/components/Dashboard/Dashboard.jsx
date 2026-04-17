import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { getCuentaPorConductor } from "../../api";
import MapView from "../Map/MapView";
import RightPanel from "../Panel/RightPanel";
import NotificationsPage from "../Notifications/NotificationsPage";
import ProfilePage from "../Profile/ProfilePage";
import HistorialPage from "../Profile/HistorialPage";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { conductor } = useAuth();
  const { notifCount } = useApp();
  const [activeNav, setActiveNav] = useState("mapa");
  const [cuenta, setCuenta] = useState(null);

  const renderMain = () => {
    switch (activeNav) {
      case "notificaciones": return <NotificationsPage />;
      case "historial": return <HistorialPage />;
      case "perfil": return <ProfilePage />;
      default: return <MapView />;
    }
  };

  useEffect(() => {
    const id = conductor?.idConductor;
    if (!id) { return; }
    getCuentaPorConductor(id)
      .then(setCuenta)
      .catch(() => {});
  }, [conductor?.idConductor]);

  const showRightPanel = activeNav === "mapa";

  return (
    <div className={styles.layout}>

      {/* ── Contenido principal ── */}
      <div className={styles.main}>

        {/* Barra superior */}
        <header className={styles.topbar}>
          <button
            className={styles.logo}
            onClick={() => setActiveNav("mapa")}
            title={"Página principal"}
          >
            ⚡
          </button>

          <div className={styles.topbarRight}>
            <button
              className={styles.saldoBtn}
              onClick={() => setActiveNav("historial")}
              title={"Historial"}
            >
              <span className={styles.saldoLabel}>Saldo</span>
              <span className={styles.saldoVal}>{cuenta?.saldoPendiente?.toFixed(2) ?? "0.00"} €</span>
            </button>

            <button
              className={styles.notifBtn}
              onClick={() => setActiveNav("notificaciones")}
            >
              🔔
              {notifCount > 0 && (
                <span className={styles.notifBadge}>{notifCount}</span>
              )}
            </button>

            <button
              className={styles.userBtn}
              onClick={() => setActiveNav("perfil")}
              title={"Perfil"}
            >
              <span className={styles.userAvatar}>
                {conductor?.nombre?.[0]?.toUpperCase() ?? "?"}
              </span>
              <span className={styles.userName}>
                {conductor?.nombre?.split(" ")[0] ?? "Usuario"}
              </span>
            </button>
          </div>
        </header>

        {/* Área de contenido */}
        <div className={styles.content}>
          <div className={styles.mapArea}>
            {renderMain()}
          </div>

          {showRightPanel && (
            <aside className={styles.rightPanel}>
              <RightPanel />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
