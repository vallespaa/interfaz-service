import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCuentaPorConductor } from "../../api";
import styles from "./Profile.module.css";

export default function ProfilePage() {
  const { conductor, logout } = useAuth();
  const [cuenta, setCuenta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = conductor?.idConductor;
    if (!id) { setLoading(false); return; }
    getCuentaPorConductor(id)
      .then(setCuenta)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [conductor]);

  const inicial = conductor?.nombre?.[0]?.toUpperCase() ?? "?";

  return (
    <div className={styles.page}>
      {/* Avatar */}
      <div className={styles.avatarSection}>
        <div className={styles.avatar}>{inicial}</div>
        <div>
          <div className={styles.nombre}>{conductor?.nombre ?? "—"}</div>
          <div className={styles.email}>{conductor?.email ?? "—"}</div>
        </div>
      </div>

      {/* Cuenta bancaria */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Cuenta bancaria</div>
        {loading ? (
          <div className={styles.skeletonBlock} />
        ) : cuenta ? (
          <>
            <div className={styles.ibanDisplay}>
              <span className={styles.ibanLabel}>IBAN</span>
              <span className={styles.ibanVal}>
                {cuenta.iban
                  ? `${cuenta.iban.slice(0,4)} •••• •••• •••• ${cuenta.iban.slice(-4)}`
                  : "No disponible"}
              </span>
            </div>
            <div className={styles.saldoRow}>
              <div className={styles.saldoItem}>
                <span className={styles.saldoLabel}>Saldo pendiente</span>
                <span className={styles.saldoVal} style={{ color: cuenta.saldoPendiente > 0 ? "var(--orange)" : "var(--green)" }}>
                  {cuenta.saldoPendiente?.toFixed(2) ?? "0.00"} €
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className={styles.empty}>No se pudo cargar la cuenta.</p>
        )}
      </div>

      {/* Datos del conductor */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Datos personales</div>
        <div className={styles.dataRow}>
          <span>ID conductor</span>
          <strong>{conductor?.idConductor ?? "—"}</strong>
        </div>
        <div className={styles.dataRow}>
          <span>Nombre</span>
          <strong>{conductor?.nombre ?? "—"}</strong>
        </div>
        <div className={styles.dataRow}>
          <span>Email</span>
          <strong>{conductor?.email ?? "—"}</strong>
        </div>
      </div>

      <button className={styles.logoutBtn} onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}
