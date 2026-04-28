import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext";
import { ApiError, cancelarReserva as apiCancelar, getDetalleVehiculo, getDetallePoste, iniciarSesionCarga } from "../../api";
import styles from "./Panel.module.css";

const ALERTA_EN = 2 * 60;         // alerta a los 2 minutos restantes

export default function ReservaPanel() {
  const { reservaActiva, cancelarReserva, iniciarCarga } = useApp();

  const calcSegs = () => {
    const diff = Math.floor((new Date(reservaActiva.fechaExpiracion) - Date.now()) / 1000);
    return Math.max(0, diff);
  };

  const [segs, setSegs] = useState(calcSegs);
  const [toast, setToast] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const toastShown = useRef(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setSegs(prev => {
        const next = Math.max(0, prev - 1);
        if (next <= ALERTA_EN && !toastShown.current) {
          toastShown.current = true;
          setToast(true);
          setTimeout(() => setToast(false), 5000);
        }
        if (next === 0) { cancelarReserva(); clearInterval(iv); }
        return next;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [cancelarReserva]);

  const handleCancelar = async () => {
    setCancelando(true);
    try {
      await apiCancelar(reservaActiva.idReserva);
    } finally {
      cancelarReserva();
    }
  };

  const handleCargar = async () => {
    if (!reservaActiva) { setError("Realiza una reserva primero."); return; }

    setError("");  setCargando(true);
    try {
      const [vehiculo, poste] = await Promise.all([
        getDetalleVehiculo(reservaActiva.idVehiculo),
        getDetallePoste(reservaActiva.idPoste)
      ]);

      // Valor de batería aleatorio para correcta simulación
      const nivelFalso = Math.floor(Math.random() * (50 - 10 + 1)) + 10;

      const datosSimulacion = {
        cargadorId: poste.idPoste,
        vehiculoId: vehiculo.idVehiculo,
        socInicial: nivelFalso,
        socObjetivo: 100.0,                         // Valor por defecto
        capacidadBateriaKwh: vehiculo.capacidadBateriaMaxima,
        potenciaMaxCargadorKw: poste.potenciaMax,
        voltajeNominal: 400                        // Voltaje nominal por defecto
      };

      const nuevaCarga = await iniciarSesionCarga(datosSimulacion);
      iniciarCarga(nuevaCarga); 
      
    } catch (err) {
      setError(err.message || "Error al iniciar la simulación de carga");
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar la carga.");
    } finally { setCargando(false); }
  };

  const mins = String(Math.floor(segs / 60)).padStart(2, "0");
  const secs = String(segs % 60).padStart(2, "0");

  return (
    <div className={styles.section + " animate-slideInRight"}>
      {toast && <div className={styles.toast}>⚠️ Tu reserva expira pronto</div>}

      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Reserva activa</span>
        <span className={styles.reservaBadge}>BLOQUEADO</span>
      </div>

      <div className={styles.simpleTimer}>
        <div className={styles.timerTime}>{mins}:{secs}</div>
        <span className={styles.reservaNote}>Tiempo restante de cortesía</span>
      </div>

      <div className={styles.reservaInfo}>
        <div className={styles.reservaInfoRow}>
          <span>ID Reserva</span>
          <strong>{reservaActiva?.idReserva ?? "—"}</strong>
        </div>
        <div className={styles.reservaInfoRow}>
          <span>Poste</span>
          <strong>{reservaActiva?.idPoste ?? "—"}</strong>
        </div>
        <div className={styles.reservaInfoRow}>
          <span>Expira</span>
          <strong>{reservaActiva?.fechaExpiracion
            ? new Date(reservaActiva.fechaExpiracion).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
            : "—"}</strong>
        </div>
      </div>

      <div className={styles.reservaNote}>
        Conecta tu vehículo al poste para iniciar la carga automáticamente.
      </div>

      <button className={styles.btnDanger} onClick={handleCancelar} disabled={cancelando}>
        {cancelando ? "Cancelando…" : "Cancelar reserva"}
      </button>

      <button className={styles.btnSecondarySmall} onClick={handleCargar}>
        Iniciar carga
      </button>
    </div>
  );
}
