import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { getNotificaciones, ackNotificacion, resolverNotificacion } from "../../api";
import { suscribir, desuscribir } from "../../services/wsClient";
import styles from "./Notifications.module.css";

const SEV_COLOR = {
  INFO: "var(--accent)",
  WARNING: "var(--orange)",
  ERROR: "var(--red)",
  CRITICAL: "var(--red)",
};

const SEV_ICON = {
  INFO: "ℹ️", WARNING: "⚠️", ERROR: "❌", CRITICAL: "🔴",
};

export default function NotificationsPage() {
  const { conductor } = useAuth();
  const { setNotifCount } = useApp();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todas"); // "todas" | "pendientes" | "resueltas"

  const load = () => {
    const conductorId = conductor?.idConductor;
    getNotificaciones({ conductorId })
      .then(data => {
        setNotifs(data ?? []);
        const pendientes = (data ?? []).filter(n => n.estado !== "RESUELTA").length;
        setNotifCount(pendientes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const canal = "notifications-service/eventos";

    const handleNuevaNotif = (mensaje) => {
      const nuevaNotif = mensaje.datos;
      if (!nuevaNotif || !nuevaNotif.idNotificacion) return;

      setNotifs(prev => {
        if (prev.some(n => n.idNotificacion === nuevaNotif.idNotificacion)) return prev;
        setNotifCount(c => c + 1);
        return [notif.datos, ...prev];
      });
    };

    suscribir(canal, handleNuevaNotif);
    return () => desuscribir(canal, handleNuevaNotif);
  }, []);

  const handleAck = async (id) => {
    await ackNotificacion(id).catch(() => {});
    setNotifs(prev => prev.map(n => n.idNotificacion === id ? { ...n, estado: "ACK" } : n));
  };

  const handleResolver = async (id) => {
    await resolverNotificacion(id).catch(() => {});
    setNotifs(prev => prev.map(n => n.idNotificacion === id ? { ...n, estado: "RESUELTA" } : n));
    setNotifCount(prev => Math.max(0, prev - 1));
  };

  const filtered = notifs.filter(n => {
    if (filtro === "pendientes") return n.estado !== "RESUELTA";
    if (filtro === "resueltas")  return n.estado === "RESUELTA";
    return true;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notificaciones</h1>
          <p className={styles.subtitle}>{notifs.filter(n => n.estado !== "RESUELTA").length} pendientes</p>
        </div>
        <button className={styles.refreshBtn} onClick={load}>↺ Actualizar</button>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        {["todas","pendientes","resueltas"].map(f => (
          <button
            key={f}
            className={`${styles.filtroBtn} ${filtro === f ? styles.filtroBtnActive : ""}`}
            onClick={() => setFiltro(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingList}>
          {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>◎</span>
          <p>No hay notificaciones en esta categoría</p>
        </div>
      ) : (
        <ul className={`${styles.list} stagger`}>
          {filtered.map(n => (
            <li
              key={n.idNotificacion}
              className={`${styles.notifCard} ${n.estado === "RESUELTA" ? styles.notifResuelta : ""}`}
            >
              <div
                className={styles.notifSev}
                style={{ color: SEV_COLOR[n.severidad] ?? "var(--text-muted)" }}
              >
                {SEV_ICON[n.severidad] ?? "·"}
              </div>
              <div className={styles.notifBody}>
                <div className={styles.notifMensaje}>{n.mensaje ?? "Sin mensaje"}</div>
                <div className={styles.notifMeta}>
                  <span style={{ color: SEV_COLOR[n.severidad] ?? "var(--text-muted)" }}>
                    {n.severidad ?? "INFO"}
                  </span>
                  {n.fechaCreacion && (
                    <>{" · "}<span>{new Date(n.fechaCreacion).toLocaleString("es-ES")}</span></>
                  )}
                </div>
              </div>
              <div className={styles.notifActions}>
                {n.estado === "ABIERTA" && (
                  <button className={styles.ackBtn} onClick={() => handleAck(n.idNotificacion)} title="Marcar como visto">✓</button>
                )}
                {n.estado !== "RESUELTA" && (
                  <button className={styles.resolverBtn} onClick={() => handleResolver(n.idNotificacion)} title="Resolver">✕</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
