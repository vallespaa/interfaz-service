const SEVERIDAD_ESTILO = {
  CRITICAL: { backgroundColor: "#f8d7da", borderColor: "#f5c2c7" },
  WARNING:  { backgroundColor: "#fff3cd", borderColor: "#ffe69c" },
  INFO:     { backgroundColor: "#d1ecf1", borderColor: "#bee5eb" },
};

function AlertasSidebar({ alertas }) {  
  return (
    <aside style={{ borderLeft: "1px solid #ccc", paddingLeft: "20px" }}>
      <h3>🚨 Alertas recientes</h3>

      {alertas.length === 0 && <p style={{ color: "#888" }}>No hay alertas activas.</p>}

      {alertas.map((alerta, i) => {
        const estilo = SEVERIDAD_ESTILO[alerta.severidad] ?? SEVERIDAD_ESTILO.INFO;
        return (
          <div key={alerta.idNotificacion ?? alerta.idAlerta ?? i} style={{
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
            border: `1px solid ${estilo.borderColor}`,
            backgroundColor: estilo.backgroundColor,
          }}>
            <strong>{alerta.tipo}</strong>
            <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
              {alerta.mensaje}
            </p>
            <small style={{ color: "#666" }}>
              {alerta.fechaCreacion
                ? new Date(alerta.fechaCreacion).toLocaleTimeString()
                : alerta.fecha
                ? new Date(alerta.fecha).toLocaleTimeString()
                : "—"}
            </small>
          </div>
        );
      })}
    </aside>
  );
}

export default AlertasSidebar;
