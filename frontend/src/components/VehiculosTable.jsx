// Colores de fondo por estado del vehículo
const ESTADO_COLOR = {
  EN_USO:       "#d1e7dd",
  CARGANDO:     "#cfe2ff",
  DISPONIBLE:   "#fff3cd",
  SIN_BATERIA:  "#f8d7da",
  MANTENIMIENTO:"#e2e3e5",
};

function VehiculosTable({ vehiculos }) {
  if (vehiculos.length === 0) {
    return <p>No hay vehículos registrados.</p>;
  }

  return (
    <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ backgroundColor: "#eee" }}>
          <th>ID Vehículo</th>
          <th>Matrícula</th>
          <th>Batería (kWh)</th>
          <th>Estado</th>
          <th>Velocidad</th>
          <th>Latitud</th>
          <th>Longitud</th>
        </tr>
      </thead>
      <tbody>
        {vehiculos.map((v) => (
          <tr key={v.idVehiculo}>
            <td><b>{v.idVehiculo}</b></td>
            <td>{v.matricula ?? "—"}</td>
            <td>
              {v.nivelBateriaActual?.toFixed(1)} / {v.capacidadBateriaMaxima?.toFixed(1)}
            </td>
            <td>
              <span style={{
                padding: "3px 8px",
                borderRadius: "4px",
                backgroundColor: ESTADO_COLOR[v.estado] ?? "#eee",
                fontSize: "0.85rem",
              }}>
                {v.estado ?? v.estadoSugerido ?? "—"}
              </span>
            </td>
            <td>{v.velocidad?.toFixed(1) ?? "—"} km/h</td>
            <td>{v.latitud?.toFixed(4) ?? "—"}</td>
            <td>{v.longitud?.toFixed(4) ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default VehiculosTable;
