import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getHistorico, getDetalleCargaHistorica } from "../../api";
import styles from "./Historial.module.css";

function formatFecha(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function formatDuracion(inicio, fin) {
  if (!inicio || !fin) return "—";
  const ms = new Date(fin) - new Date(inicio);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

export default function HistorialPage() {
  const { conductor } = useAuth();
  const [cargas, setCargas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [loadingDet, setLDet] = useState(false);

  useEffect(() => {
    const conductorId = conductor?.idConductor;
    getHistorico({ conductorId })
      .then(data => setCargas(data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [conductor]);

  const verDetalle = async (idCarga) => {
    if (detalle?.idRegistro === idCarga) { setDetalle(null); return; }
    setLDet(true);
    try {
      const d = await getDetalleCargaHistorica(idCarga);
      setDetalle(d);
    } catch { setDetalle(null); }
    finally { setLDet(false); }
  };

  // Totales
  const totalKwh = cargas.reduce((s, c) => s + (c.metadatos.energiaEntregadaKw ?? 0), 0).toFixed(2);
  const totalImport = cargas.reduce((s, c) => s + (c.importeCargo ?? 0), 0).toFixed(2);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Historial de cargas</h1>
          <p className={styles.subtitle}>{cargas.length} registros · inmutable</p>
        </div>
      </div>

      {/* Resumen global */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total facturado</span>
          <span className={styles.summaryVal} style={{ color: "var(--accent)" }}>{totalImport} €</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Sesiones</span>
          <span className={styles.summaryVal}>{cargas.length}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>kWh Entregados</span>
          <span className={styles.summaryVal}>{totalKwh}</span>
        </div>
      </div>

      {/* Tabla tipo libro mayor */}
      {loading ? (
        <div className={styles.loadingList}>
          {[1,2,3,4,5].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : cargas.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>≡</span>
          <p>No hay cargas registradas todavía.</p>
        </div>
      ) : (
        <div className={styles.ledger}>
          {/* Cabecera */}
          <div className={styles.ledgerHead}>
            <span>ID transacción</span>
            <span>Inicio</span>
            <span>Duración</span>
            <span>kWh</span>
            <span>Importe</span>
            <span></span>
          </div>

          {/* Filas */}
          {cargas.map((c, idx) => {
            const id = c.idRegistro;
            const abierta = detalle?.idRegistro === id;
            return (
              <div key={id} className={`${styles.ledgerRow} ${idx % 2 === 0 ? styles.ledgerEven : ""}`}>
                <div className={styles.ledgerRowMain}>
                  <span className={styles.txId}>#{String(id).slice(-8).toUpperCase()}</span>
                  <span>{formatFecha(c.fechaInicio)}</span>
                  <span>{formatDuracion(c.fechaInicio, c.fechaFin)}</span>
                  <span>{c.metadatos?.energiaEntregadaKw ?? 0} kWh</span>
                  <span className={styles.importeVal}>{(c.importeCargo ?? 0).toFixed(2)} €</span>
                  <button
                    className={`${styles.expandBtn} ${abierta ? styles.expandBtnOpen : ""}`}
                    onClick={() => verDetalle(id)}
                  >
                    {loadingDet && abierta ? "…" : abierta ? "▲" : "▼"}
                  </button>
                </div>

                {/* Detalle expandido */}
                {abierta && detalle && (
                  <div className={styles.ledgerDetalle + " animate-fadeUp"}>
                    <div className={styles.detalleGrid}>
                      <div className={styles.detalleItem}>
                        <span>Vehículo</span>
                        <strong>{detalle.idVehiculo ?? "—"}</strong>
                      </div>
                      <div className={styles.detalleItem}>
                        <span>Poste</span>
                        <strong>{detalle.idPoste ?? "—"}</strong>
                      </div>
                      <div className={styles.detalleItem}>
                        <span>Fin</span>
                        <strong>{formatFecha(detalle.fechaFin)}</strong>
                      </div>
                      <div className={styles.detalleItem}>
                        <span>Tarifa</span>
                        <strong>{detalle.metadatos?.tarifaAplicada ?? "ESTANDAR"}</strong>
                      </div>
                    </div>
                    <div className={styles.recibo}>
                      <div className={styles.reciboHeader}>
                        <span>⚡ EVcharge — Recibo digital</span>
                        <span className={styles.reciboId}>TXN-{String(id).slice(-8).toUpperCase()}</span>
                      </div>
                      <div className={styles.reciboLinea}>
                        <span>Duración</span>
                        <span>{formatDuracion(detalle.fechaInicio, detalle.fechaFin)}</span>
                      </div>
                      <div className={styles.reciboTotal}>
                        <span>TOTAL</span>
                        <span>{(detalle.importeCargo ?? 0).toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
