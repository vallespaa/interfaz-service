import { useEffect, useState, useCallback } from "react";
import { useApp } from "../../context/AppContext";
import { getZonasCercanas, getFavoritos, crearFavorito, eliminarFavorito } from "../../api";
import styles from "./Panel.module.css";

export default function ZonasList() {
  const { seleccionarZona } = useApp();
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritosMap, setFavoritosMap] = useState({});

  useEffect(() => {
    const coordenadas = { lat: 40.3436, lng: -1.1062, radio: 3000 };

    Promise.all([
      getZonasCercanas(coordenadas),
      getFavoritos()
    ])
      .then(([zonasData, favoritosData]) => {
        setZonas(zonasData);
        const mapa = {};
        favoritosData.forEach(f => { mapa[f.idZona] = f.idFavorito; });
        setFavoritosMap(mapa);
      })
      .catch((error) => console.error("Error al cargar zonas o favoritos:", error))
      .finally(() => setLoading(false));
  }, []);

  const toggleFavorito = useCallback(async (e, zona) => {
    e.stopPropagation();

    const idZona = zona.idZona;
    const esFavorito = !!favoritosMap[idZona];

    if (esFavorito) {
      const idFavoritoAnterior = favoritosMap[idZona];
      setFavoritosMap(prev => { const s = { ...prev }; delete s[idZona]; return s; });
      try {
        await eliminarFavorito(idFavoritoAnterior);
      } catch {
        // Revertir si falla
        setFavoritosMap(prev => ({ ...prev, [idZona]: idFavoritoAnterior }));
      }
    } else {
      setFavoritosMap(prev => ({ ...prev, [idZona]: "pending" }));
      try {
        const nuevo = await crearFavorito(idZona);
        setFavoritosMap(prev => ({ ...prev, [idZona]: nuevo.idFavorito }));
      } catch {
        setFavoritosMap(prev => { const s = { ...prev }; delete s[idZona]; return s; });
      }
    }
  }, [favoritosMap]);


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
            const esFavorito = !!favoritosMap[zona.idZona];
            return (
              <li key={zona.idZona}>
                <div
                  className={styles.zonaCard}
                  onClick={() => seleccionarZona(zona)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && seleccionarZona(zona)}
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
                  <button
                    className={`${styles.favBtn} ${esFavorito ? styles.favActive : ""}`}
                    onClick={(e) => toggleFavorito(e, zona)}
                    title={esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
                  >
                    {esFavorito ? "★" : "☆"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
