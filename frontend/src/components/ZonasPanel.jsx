
// Color de la barra de disponibilidad según % de postes libres
function colorDisponibilidad(libres, total) {
  if (total === 0) return "#ccc";
  const ratio = libres / total;
  if (ratio > 0.5) return "#198754";  // verde: más de la mitad libres
  if (ratio > 0)   return "#ffc107";  // naranja: quedan pocos
  return "#dc3545";                   // rojo: lleno
}

function ZonasPanel({ zonas }) {
  if (zonas.length === 0) {
    return <p>No hay zonas registradas.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {zonas.map((zona) => (
        <div key={zona.idZona} style={{
          padding: "12px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          backgroundColor: "#fafafa",
        }}>
          {/* Nombre y tarifa */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <b>{zona.nombre}</b>
            <span style={{ fontSize: "0.85rem", color: "#555" }}>
              {zona.tipoTarifa} — {zona.precioPorKWh} €/kWh
            </span>
          </div>

          {/* Barra de disponibilidad */}
          <div style={{ backgroundColor: "#e9ecef", borderRadius: "4px", height: "10px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: zona.capacidadTotal > 0
                ? `${(zona.postesLibres / zona.capacidadTotal) * 100}%`
                : "0%",
              backgroundColor: colorDisponibilidad(zona.postesLibres, zona.capacidadTotal),
              transition: "width 0.4s ease",
            }} />
          </div>

          {/* Texto debajo de la barra */}
          <div style={{ fontSize: "0.8rem", color: "#555", marginTop: "4px" }}>
            {zona.postesLibres} / {zona.capacidadTotal} postes libres
          </div>
        </div>
      ))}
    </div>
  );
}

export default ZonasPanel;
