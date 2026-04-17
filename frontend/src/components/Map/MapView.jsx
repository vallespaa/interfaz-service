import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "../../context/AppContext";
import { getZonasCercanas } from "../../api";
import styles from "./MapView.module.css";

const COORDENADAS = [41.6488, -0.8891];

// Fix default icon path issue in CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// ── Crea un icono SVG de rayo según disponibilidad ────────────────────────────
function createZonaIcon(libre, total) {
  const ratio = total > 0 ? libre / total : 0;
  let color, glowColor;
  if (ratio > 0.5)       { color = "#00e676"; glowColor = "rgba(0,230,118,0.5)"; }
  else if (ratio > 0)    { color = "#ff9800"; glowColor = "rgba(255,152,0,0.5)"; }
  else                   { color = "#f44336"; glowColor = "rgba(244,67,54,0.5)"; }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- Pin -->
      <ellipse cx="16" cy="38" rx="5" ry="2" fill="rgba(0,0,0,0.3)"/>
      <path d="M16 36 C16 36 4 24 4 14 C4 7.4 9.4 2 16 2 C22.6 2 28 7.4 28 14 C28 24 16 36 16 36Z"
        fill="#0f1218" stroke="${color}" stroke-width="1.5" filter="url(#glow)"/>
      <!-- Rayo -->
      <path d="M18 6 L12 18 L16 18 L14 26 L22 14 L18 14 Z"
        fill="${color}" filter="url(#glow)"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function MapView() {

  const { seleccionarZona } = useApp();
  const [zonas, setZonas] = useState([]);

  // Carga zonas cercanas
  useEffect(() => {
    getZonasCercanas({ lat: COORDENADAS[0], lng: COORDENADAS[1], radio: 3000 })
      .then(setZonas)
      .catch(() => {});
  }, []);

  return (
    <div className={styles.wrapper}>
      <MapContainer
        center={COORDENADAS}
        zoom={14}
        className={styles.map}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />

        {zonas.map(zona => (
          <Marker
            key={zona.idZona}
            position={[zona.coordenadas.lat, zona.coordenadas.lng]}
            icon={createZonaIcon(zona.postesLibres ?? 0, zona.capacidadTotal ?? 10)}
            eventHandlers={{ click: () => seleccionarZona(zona) }}
          >
            <Popup className={styles.popup}>
              <strong>{zona.nombre}</strong><br />
              {zona.postesLibres}/{zona.capacidadTotal} libres
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Leyenda */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span style={{ background: "var(--green)" }} className={styles.legendDot} />
          <span>&gt;50% libre</span>
        </div>
        <div className={styles.legendItem}>
          <span style={{ background: "var(--orange)" }} className={styles.legendDot} />
          <span>&lt;50% libre</span>
        </div>
        <div className={styles.legendItem}>
          <span style={{ background: "var(--red)" }} className={styles.legendDot} />
          <span>Completo</span>
        </div>
      </div>
    </div>
  );
}
