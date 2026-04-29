import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { getDetalleVehiculo, detenerSesionCarga } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { suscribir, desuscribir } from "../../services/wsClient";
import styles from "./Panel.module.css";

const CANAL_CARGAS = "MotorSimulacionService/simulacion.cargadores/estado";

// Tiempo de espera antes de activar el fallback de simulación (ms)
const FALLBACK_TIMEOUT_MS = 15_000;

// Hook de telemetría.
function useTelemetria(idVehiculo) {
  const [tel, setTel] = useState({ bateria: 30, kwhEntregados: 0, potencia: 0, coste: 0, duracion: 0 });

  // Flag: ¿hemos recibido al menos un mensaje WS real?
  const wsActivo = useRef(false);
  const fallbackTimer = useRef(null);
  const fallbackInterval = useRef(null);

  //  Carga inicial del nivel de batería desde REST 
  useEffect(() => {
    if (!idVehiculo) return;
    getDetalleVehiculo(idVehiculo)
      .then(v => setTel(prev => ({ ...prev, bateria: v?.nivelBateriaActual ?? 30 })))
      .catch(() => {});
  }, [idVehiculo]);

  //  Simulación local (fallback) 
  const iniciarSimulacion = useCallback(() => {
    if (fallbackInterval.current) return; // ya activa
    console.warn("[CargaPanel] Sin datos WS — activando simulación local");
    fallbackInterval.current = setInterval(() => {
      setTel(prev => {
        const kwhInc   = parseFloat((Math.random() * 0.05).toFixed(3));
        const newKwh   = parseFloat((prev.kwhEntregados + kwhInc).toFixed(2));
        const newBat   = Math.min(100, prev.bateria + 0.2);
        return {
          bateria:       parseFloat(newBat.toFixed(1)),
          kwhEntregados: newKwh,
          potencia:      parseFloat((11 + Math.random() * 2).toFixed(1)),
          coste:         parseFloat((newKwh * 0.35).toFixed(4)),
          duracion:      prev.duracion + 10,
        };
      });
    }, 10_000);
  }, []);

  const detenerSimulacion = useCallback(() => {
    if (fallbackInterval.current) {
      clearInterval(fallbackInterval.current);
      fallbackInterval.current = null;
    }
  }, []);

  //  Suscripción WebSocket 
  useEffect(() => {
    if (!idVehiculo) return;

    // Arrancar temporizador de fallback
    fallbackTimer.current = setTimeout(iniciarSimulacion, FALLBACK_TIMEOUT_MS);

    const manejarCarga = (payload) => {
      // El payload puede ser un array de actualizaciones o un objeto único
      const lista = Array.isArray(payload)
        ? payload
        : (payload?.actualizaciones ?? [payload]);

      // Buscar la entrada correspondiente a nuestro vehículo
      const entrada = lista.find(
        item => item.idVehiculo === idVehiculo || item.vehiculoId === idVehiculo
      );
      if (!entrada) return;

      // Primera recepción real → cancelar fallback y simulación
      if (!wsActivo.current) {
        wsActivo.current = true;
        clearTimeout(fallbackTimer.current);
        detenerSimulacion();
        console.log("[CargaPanel] Telemetría WS activa para vehículo", idVehiculo);
      }

      setTel(prev => ({
        bateria:       entrada.socActual          ?? entrada.nivelBateria    ?? prev.bateria,
        kwhEntregados: entrada.energiaEntregada   ?? entrada.kwhEntregados   ?? prev.kwhEntregados,
        potencia:      entrada.potenciaActual     ?? entrada.potencia        ?? prev.potencia,
        coste:         entrada.costeAcumulado     ?? entrada.coste           ?? prev.coste,
        // duracion la incrementamos nosotros: el WS no suele enviarla
        duracion:      prev.duracion + 10,
      }));
    };

    suscribir(CANAL_CARGAS, manejarCarga);

    return () => {
      desuscribir(CANAL_CARGAS, manejarCarga);
      clearTimeout(fallbackTimer.current);
      detenerSimulacion();
      wsActivo.current = false;
    };
  }, [idVehiculo, iniciarSimulacion, detenerSimulacion]);

  return tel;
}

function formatDuracion(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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