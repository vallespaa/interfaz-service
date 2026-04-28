import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { getDetalleVehiculo, detenerSesionCarga } from "../../api";
import { useAuth } from "../../context/AuthContext";
import styles from "./Panel.module.css";

// TODO: Añadir WebSocket cuando esté listo microservicio
// Simula actualización de telemetría cada 10 segundos
function useTelemetria(idVehiculo) {
  const [tel, setTel] = useState({ bateria: 30, kwhEntregados: 0, potencia: 0, coste: 0, duracion: 0 });

  useEffect(() => {
    if (!idVehiculo) return;
    // Carga inicial
    getDetalleVehiculo(idVehiculo)
      .then(v => setTel(prev => ({ ...prev, bateria: v?.nivelBateriaActual ?? 30 })))
      .catch(() => {});
  }, [idVehiculo]);

  // Simulación de incremento (reemplazar por WS)
  useEffect(() => {
    const iv = setInterval(() => {
      setTel(prev => {
        const kwhInc = parseFloat((Math.random() * 0.05).toFixed(3));
        const newKwh = parseFloat((prev.kwhEntregados + kwhInc).toFixed(2));
        const newBat = Math.min(100, prev.bateria + 0.2);
        return {
          bateria: parseFloat(newBat.toFixed(1)),
          kwhEntregados: newKwh,
          potencia: parseFloat((11 + Math.random() * 2).toFixed(1)),
          coste: parseFloat((newKwh * 0.35).toFixed(4)),
          duracion: prev.duracion + 10,
        };
      });
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  return tel;
}

function formatDuracion(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

export default function CargaPanel() {
  const { cargaActiva, finalizarCarga } = useApp();
  const { conductor } = useAuth();
  const tel = useTelemetria(conductor?.idVehiculo);
  const [finalizando, setFin] = useState(false);

  const batPct = Math.round(tel.bateria);
  const batColor = batPct > 60 ? "var(--green)" : batPct > 20 ? "var(--orange)" : "var(--red)";

  // Contador de coste
  const [displayCoste, setDisplayCoste] = useState(0);
  const costeTarget = useRef(0);
  useEffect(() => { costeTarget.current = tel.coste; }, [tel.coste]);
  useEffect(() => {
    const iv = setInterval(() => {
      setDisplayCoste(prev => {
        const diff = costeTarget.current - prev;
        if (Math.abs(diff) < 0.0001) return costeTarget.current;
        return parseFloat((prev + diff * 0.05).toFixed(4));
      });
    }, 50);
    return () => clearInterval(iv);
  }, []);

  const handleFinalizar = async () => {
    if (!cargaActiva?.id) {
      console.error("No hay un ID de carga activo disponible");
      return;
    }
    setFin(true);
    try {
      await detenerSesionCarga(cargaActiva.id);
      finalizarCarga();
    } catch (err) {
      alert("No se pudo detener la carga en el servidor");
      setFin(false);
    }
  };

  return (
    <div className={styles.section + " animate-slideInRight"}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Carga activa</span>
        <span className={styles.cargaBadge}>EN CURSO</span>
      </div>

      {/* Duración */}
      <div className={styles.duracionDisplay}>
        {formatDuracion(tel.duracion)}
      </div>

      {/* Batería */}
      <div className={styles.batWidget}>
        <div className={styles.batLabel}>
          <span>Batería</span>
          <strong style={{ color: batColor }}>{batPct}%</strong>
        </div>
        <div className={styles.batBar}>
          <div
            className={styles.batFill}
            style={{ width: `${batPct}%`, background: batColor }}
          />
        </div>
        <div className={styles.batTip} />
      </div>

      {/* Métricas */}
      <div className={styles.metricGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricVal}>{tel.kwhEntregados.toFixed(2)}</span>
          <span className={styles.metricLabel}>kWh</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricVal}>{tel.potencia.toFixed(1)}</span>
          <span className={styles.metricLabel}>kW actual</span>
        </div>
        <div className={`${styles.metricCard} ${styles.metricCardAccent}`}>
          <span className={styles.metricVal} style={{ color: "var(--accent)" }}>
            {displayCoste.toFixed(3)} €
          </span>
          <span className={styles.metricLabel}>coste acumulado</span>
        </div>
      </div>

      <div className={styles.reservaNote}>
        ID Simulación: {cargaActiva?.id} <br/>
        Datos reales del Motor de Simulación.
      </div>

      <button
        className={styles.btnDanger}
        onClick={handleFinalizar}
        disabled={finalizando}
      >
        {finalizando ? "Finalizando…" : "Detener carga"}
      </button>
    </div>
  );
}