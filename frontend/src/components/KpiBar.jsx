function KpiBar({ totalVehiculos, zonasActivas, alertasAbiertas, cargasActivas }) {
  const kpis = [
    { label: "Vehículos",     value: totalVehiculos  },
    { label: "Zonas activas", value: zonasActivas    },
    { label: "Alertas",       value: alertasAbiertas },
    { label: "Cargas activas",value: cargasActivas   },
  ];

  return (
    <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
      {kpis.map((kpi) => (
        <div key={kpi.label} style={{
          flex: 1,
          padding: "16px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          textAlign: "center",
          backgroundColor: "#fafafa",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{kpi.value}</div>
          <div style={{ fontSize: "0.9rem", color: "#555" }}>{kpi.label}</div>
        </div>
      ))}
    </div>
  );
}

export default KpiBar;
