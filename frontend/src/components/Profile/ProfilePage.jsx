import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getCuentaPorConductor, getVehiculos, crearVehiculo } from "../../api";
import styles from "./Profile.module.css";

export default function ProfilePage() {
  const { conductor, logout } = useAuth();
  const [cuenta, setCuenta] = useState(null);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoVehiculo, setNuevoVehiculo] = useState({ 
    matricula: "", 
    modelo: "", 
    capacidadBateriaMaxima: "",
    potenciaCarga: ""
  });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const id = conductor?.idConductor;
    if (!id) { setLoading(false); return; }
    Promise.all([
      getCuentaPorConductor(id),
      getVehiculos()
    ]).then(([dataCuenta, dataVehiculos]) => {
        setCuenta(dataCuenta);
        const misVehiculos = dataVehiculos?.filter(v => v.idConductor === id) || [];
        setVehiculos(misVehiculos);
      })
      .catch((err) => console.error("Error cargando datos de perfil:", err))
      .finally(() => setLoading(false));
  }, [conductor]);

  const handleAddVehiculo = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const vehiculoGuardado = await crearVehiculo({
        idConductor: conductor.idConductor,
        matricula: nuevoVehiculo.matricula,
        modelo: nuevoVehiculo.modelo,
        capacidadBateriaMaxima: parseFloat(nuevoVehiculo.capacidadBateriaMaxima),
        potenciaCarga: parseFloat(nuevoVehiculo.potenciaCarga || 0)
      });
      setVehiculos([...vehiculos, vehiculoGuardado]);
      setNuevoVehiculo({ matricula: "", modelo: "", capacidadBateriaMaxima: "", potenciaCarga: "" });
      setMostrarForm(false);
    } catch (error) {
      alert("Error al guardar el vehículo");
    } finally {
      setEnviando(false);
    }
  };

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

      {/* Gestión de Vehículos */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Mis Vehículos</div>
          <button 
            className={styles.addBtn} 
            onClick={() => setMostrarForm(!mostrarForm)}
          >
            {mostrarForm ? "Cancelar" : "+ Añadir"}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={handleAddVehiculo} className={styles.form}>
            <input 
              type="text" 
              placeholder="Matrícula (ej: 1234BBB)" 
              value={nuevoVehiculo.matricula}
              onChange={e => setNuevoVehiculo({...nuevoVehiculo, matricula: e.target.value})}
              required 
            />
            <input 
              type="text" 
              placeholder="Modelo (ej: Tesla Model 3)" 
              value={nuevoVehiculo.modelo}
              onChange={e => setNuevoVehiculo({...nuevoVehiculo, modelo: e.target.value})}
              required 
            />
            <input 
              type="number" 
              placeholder="Capacidad Batería (kWh)" 
              value={nuevoVehiculo.capacidadBateriaMaxima}
              onChange={e => setNuevoVehiculo({...nuevoVehiculo, capacidadBateriaMaxima: e.target.value})}
              required 
            />
            <input 
              type="number" 
              placeholder="Potencia Carga (kW)" 
              value={nuevoVehiculo.potenciaCarga}
              onChange={e => setNuevoVehiculo({...nuevoVehiculo, potenciaCarga: e.target.value})}
              required 
            />
            <button type="submit" disabled={enviando} className={styles.saveBtn}>
              {enviando ? "Guardando..." : "Guardar Vehículo"}
            </button>
          </form>
        )}

        <div className={styles.vehiculosList}>
          {vehiculos.length > 0 ? (
            vehiculos.map(v => (
              <div key={v.idVehiculo} className={styles.vehiculoItem}>
                <div className={styles.vInfo}>
                  <strong>{v.modelo}</strong>
                  <span>{v.matricula}</span>
                </div>
                <div className={styles.vBadge}>{v.capacidadBateriaMaxima} kWh</div>
              </div>
            ))
          ) : (
            !mostrarForm && <p className={styles.empty}>No tienes vehículos registrados.</p>
          )}
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
