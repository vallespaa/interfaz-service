import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { getPostes, crearReserva, getVehiculos } from "../../api";
import { ApiError } from "../../api";
import styles from "./Panel.module.css";

const ESTADO_COLOR = {
  LIBRE: "var(--green)",
  RESERVADO: "var(--orange)",
  OCUPADO: "var(--accent)",
  MANTENIMIENTO: "var(--red)",
};

export default function ZonaDetalle() {
  const { conductor } = useAuth();
  const { zonaSeleccionada, volverAZonas, activarReserva } = useApp();
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservando, setReservando] = useState(false);
  const [posteSeleccionado, setPoste] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!zonaSeleccionada) return;
    setLoading(true);
    getPostes({ idZona: zonaSeleccionada.idZona })
      .then(setPostes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [zonaSeleccionada]);

  const handleReservar = async () => {

    // TODO: Implementar mejor selección de vehículo
    const vehiculos = await getVehiculos();
    const vehiculo = vehiculos.find(v => v.idConductor === conductor?.idConductor);

    if (!posteSeleccionado) { setError("Selecciona un poste primero."); return; }
    if (!vehiculo) { setError("No tienes un vehículo asignado."); return; }
    setError(""); setReservando(true);
    try {
      const reserva = await crearReserva({
        idZona: zonaSeleccionada.idZona,
        idConductor: vehiculo.idConductor,
        idVehiculo: vehiculo.idVehiculo,
      });

      // TODO: Eliminar cuando microservicio de reservas esté activo
      // Forzamos que la expiración sea dentro de 15 minutos a partir de AHORA
      const ahora = new Date();
      const expiracion = new Date(ahora.getTime() + 15 * 60000);

      const reservaMock = {
        ...reserva,
        fechaCreacion: ahora.toISOString(),
        fechaExpiracion: expiracion.toISOString()
      };

      activarReserva(reservaMock);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear la reserva.");
    } finally { setReservando(false); }
  };

  const postesLibres = postes.filter(p => p.estado === "LIBRE").length;

  return (
    <div className={styles.section + " animate-slideInRight"}>
      {/* Header */}
      <div className={styles.detalleHeader}>
        <button className={styles.backBtn} onClick={volverAZonas}>← Volver</button>
        <div>
          <div className={styles.sectionTitle}>{zonaSeleccionada?.nombre}</div>
          <div className={styles.zonaMeta}>{postesLibres} de {postes.length} libres</div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingList}>
          {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : (
        <>
          {/* Grid de postes */}
          <div className={styles.postesGrid}>
            {postes.map(poste => {
              const libre = poste.estado === "LIBRE";
              const sel = posteSeleccionado?.idPoste === poste.idPoste;
              return (
                <button
                  key={poste.idPoste}
                  className={`${styles.posteCard} ${sel ? styles.posteCardSel : ""} ${!libre ? styles.posteCardDisabled : ""}`}
                  disabled={!libre}
                  onClick={() => libre && setPoste(poste)}
                >
                  <div className={styles.posteEstadoDot}
                    style={{ background: ESTADO_COLOR[poste.estado] ?? "var(--text-muted)" }} />
                  <div className={styles.posteNombre}>
                    {`Poste ${poste.idPoste}`}
                  </div>
                  <div className={styles.posteTipo}>
                    {zonaSeleccionada.tipoTarifa === "PREMIUM" ? "⚡ Premium" : "Estándar"}
                    {" · "}
                    {poste?.potenciaMax ?? "—"} kW
                  </div>
                  <div className={styles.posteTarifa}>
                    {zonaSeleccionada?.precioPorKWh ?? "—"} €/kWh
                  </div>
                  <div className={styles.posteEstadoLabel}
                    style={{ color: ESTADO_COLOR[poste.estado] ?? "var(--text-muted)" }}>
                    {poste.estado}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Resumen del poste seleccionado */}
          {posteSeleccionado && (
            <div className={styles.posteResumen}>
              <div className={styles.posteResumenRow}>
                <span>Tarifa</span>
                <strong>{zonaSeleccionada.precioPorKWh} €/kWh</strong>
              </div>
              <div className={styles.posteResumenRow}>
                <span>Potencia</span>
                <strong>{posteSeleccionado.potenciaMax} kW</strong>
              </div>
              <div className={styles.posteResumenRow}>
                <span>Tipo</span>
                <strong>{zonaSeleccionada.tipoTarifa === "PREMIUM" ? "Premium ⚡" : "Estándar"}</strong>
              </div>
              <div className={styles.posteResumenNote}>
                La reserva bloquea el poste 15 min.
              </div>
            </div>
          )}

          {error && <p className={styles.errorInline}>{error}</p>}

          <button
            className={styles.btnReservar}
            disabled={!posteSeleccionado || reservando}
            onClick={handleReservar}
          >
            {reservando
              ? <><span className={styles.spinnerDark} /> Reservando…</>
              : "Reservar poste →"}
          </button>
        </>
      )}
    </div>
  );
}
