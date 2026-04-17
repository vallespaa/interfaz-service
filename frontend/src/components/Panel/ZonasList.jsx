import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { getZonasCercanas } from "../../api";
import styles from "./Panel.module.css";

export default function ZonasList() {
  const { seleccionarZona } = useApp();
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const coordenadas = { lat: 41.6488, lng: -0.8891, radio: 3000 };

    getZonasCercanas(coordenadas)
      .then(setZonas)
      .catch((error) => console.error("Error al cargar zonas:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>Zonas cercanas</span>
        <span className={styles.sectionCount}>{zonas.length}</span>
      </div>

      {loading ? (
        <div className={styles.loadingList}>
          {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : zonas.length === 0 ? (
        <p className={styles.empty}>No hay zonas cercanas disponibles.</p>
      ) : (
        <ul className={`${styles.zonasList} stagger`}>
          {zonas.map(zona => {
            return (
              <li key={zona.idZona}>
                <button
                  className={styles.zonaCard}
                  onClick={() => seleccionarZona(zona)}
                >
                  <div className={styles.zonaInfo}>
                    <span className={styles.zonaNombre}>{zona.nombre}</span>
                  </div>
                  <div className={styles.zonaStatus}>
                    <span className={styles.zonaMeta}>
                      {zona.distanciaKm ? `${(zona.distanciaKm).toFixed(1) ?? "0.0"} km` : ""}
                    </span>
                    <span className={styles.zonaMeta}>
                      {zona.postesLibres ?? "?"}/{zona.capacidadTotal ?? "?"} libres
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
