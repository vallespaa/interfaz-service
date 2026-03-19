import { useEffect, useState, useRef } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_CARS = [
  { idVehiculo: "V-001", matricula: "3284-XYZ", nivelBateriaActual: 87, capacidadBateriaMaxima: 100, latitud: 41.3851, longitud: 2.1734, velocidad: 42, estado: "EN_RUTA" },
  { idVehiculo: "V-002", matricula: "8821-ABC", nivelBateriaActual: 15, capacidadBateriaMaxima: 100, latitud: 41.3901, longitud: 2.1654, velocidad: 0,  estado: "CARGANDO" },
  { idVehiculo: "V-003", matricula: "5590-QWE", nivelBateriaActual: 55, capacidadBateriaMaxima: 100, latitud: 41.3821, longitud: 2.1801, velocidad: 28, estado: "EN_RUTA" },
  { idVehiculo: "V-004", matricula: "1193-RTY", nivelBateriaActual: 8,  capacidadBateriaMaxima: 100, latitud: 41.3871, longitud: 2.1601, velocidad: 0,  estado: "AVERIA" },
  { idVehiculo: "V-005", matricula: "7742-UIO", nivelBateriaActual: 62, capacidadBateriaMaxima: 100, latitud: 41.3931, longitud: 2.1751, velocidad: 35, estado: "EN_RUTA" },
  { idVehiculo: "V-006", matricula: "4467-PAS", nivelBateriaActual: 31, capacidadBateriaMaxima: 100, latitud: 41.3811, longitud: 2.1681, velocidad: 19, estado: "EN_RUTA" },
  { idVehiculo: "V-007", matricula: "9938-DFG", nivelBateriaActual: 0,  capacidadBateriaMaxima: 100, latitud: 41.3861, longitud: 2.1721, velocidad: 0,  estado: "CARGANDO" },
];

const INITIAL_LOGS = [
  { id: 1, ts: "14:32:01", msg: "V-002 conectado al poste #P-07", level: "info" },
  { id: 2, ts: "14:32:08", msg: "ALERTA: V-004 batería crítica (8%)", level: "error" },
  { id: 3, ts: "14:32:15", msg: "V-001 posición actualizada", level: "info" },
  { id: 4, ts: "14:32:22", msg: "Redis ping OK — latencia 2ms", level: "ok" },
  { id: 5, ts: "14:32:29", msg: "ALERTA: V-004 sistema en avería", level: "error" },
  { id: 6, ts: "14:32:36", msg: "V-005 velocidad: 35 km/h", level: "info" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pct = (car) => Math.round((car.nivelBateriaActual / car.capacidadBateriaMaxima) * 100);

const batteryColor = (p) => {
  if (p > 50) return { bg: "#dcfce7", fg: "#16a34a", border: "#bbf7d0" };
  if (p > 20) return { bg: "#fff7ed", fg: "#ea580c", border: "#fed7aa" };
  return { bg: "#fef2f2", fg: "#dc2626", border: "#fecaca" };
};

const statusConfig = {
  EN_RUTA:  { label: "En ruta",   dot: "#16a34a", bg: "#f0fdf4", text: "#15803d" },
  CARGANDO: { label: "Cargando",  dot: "#ea580c", bg: "#fff7ed", text: "#c2410c" },
  AVERIA:   { label: "Avería",    dot: "#dc2626", bg: "#fef2f2", text: "#b91c1c" },
  LIBRE:    { label: "Libre",     dot: "#94a3b8", bg: "#f8fafc", text: "#64748b" },
};

// ─── Small components ─────────────────────────────────────────────────────────

function Badge({ estado }) {
  const c = statusConfig[estado] || statusConfig.LIBRE;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, color: c.text,
      fontSize: 11, fontWeight: 500,
      padding: "2px 8px", borderRadius: 99,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0,
        animation: estado === "EN_RUTA" ? "livePulse 2s ease-in-out infinite" : "none",
      }} />
      {c.label}
    </span>
  );
}

function BatteryPill({ value }) {
  const c = batteryColor(value);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.fg, fontSize: 12, fontWeight: 600,
      padding: "2px 9px", borderRadius: 6,
      fontFamily: "'DM Mono', monospace",
    }}>
      {value}%
      {value < 20 && <span style={{ fontSize: 10, animation: "livePulse 1s infinite" }}>⚠</span>}
    </span>
  );
}

// ─── Map (Canvas placeholder — swap with Leaflet) ─────────────────────────────
function MapCanvas({ cars, selectedCar, onSelect }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = "#f8f9fb";
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 48) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Roads
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 10; ctx.lineCap = "round";
    [[0.1,0.5,0.9,0.5],[0.5,0.1,0.5,0.9],[0.2,0.25,0.75,0.75],[0.15,0.8,0.85,0.2]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1*W,y1*H); ctx.lineTo(x2*W,y2*H); ctx.stroke();
    });
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1; ctx.setLineDash([12,8]);
    [[0.1,0.5,0.9,0.5],[0.5,0.1,0.5,0.9]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1*W,y1*H); ctx.lineTo(x2*W,y2*H); ctx.stroke();
    });
    ctx.setLineDash([]);

    // Blocks
    ctx.fillStyle = "#f1f5f9"; ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1;
    [[0.1,0.1,0.15,0.12],[0.3,0.12,0.14,0.1],[0.62,0.18,0.12,0.14],[0.72,0.62,0.14,0.1],[0.13,0.63,0.1,0.14],[0.55,0.62,0.13,0.12]].forEach(([x,y,w,h]) => {
      ctx.beginPath(); ctx.rect(x*W,y*H,w*W,h*H); ctx.fill(); ctx.stroke();
    });

    // Charging stations
    [[0.26,0.38],[0.71,0.28],[0.44,0.71]].forEach(([fx,fy]) => {
      const x = fx*W, y = fy*H;
      ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2);
      ctx.fillStyle = "#fff7ed"; ctx.fill();
      ctx.strokeStyle = "#fdba74"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = "#ea580c"; ctx.font = "11px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("⚡", x, y+4);
    });

    // Vehicles
    cars.forEach((car, i) => {
      const fx = 0.18 + (i % 4) * 0.18;
      const fy = 0.28 + Math.floor(i / 4) * 0.38;
      const x = fx*W, y = fy*H;
      const p = pct(car);
      const c = batteryColor(p);
      const isSel = selectedCar?.idVehiculo === car.idVehiculo;

      if (isSel) {
        ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2);
        ctx.fillStyle = "#3b82f622"; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(x,y,11,0,Math.PI*2);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.strokeStyle = isSel ? "#3b82f6" : c.border; ctx.lineWidth = isSel ? 2 : 1.5; ctx.stroke();
      ctx.font = "13px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("🚗", x, y+5);
      ctx.fillStyle = "#64748b"; ctx.font = "9px sans-serif";
      ctx.fillText(car.matricula, x, y-16);
    });

    // Popup for selected
    if (selectedCar) {
      const i = cars.findIndex(c => c.idVehiculo === selectedCar.idVehiculo);
      if (i !== -1) {
        const fx = 0.18 + (i % 4) * 0.18;
        const fy = 0.28 + Math.floor(i / 4) * 0.38;
        const x = fx*W, y = fy*H;
        const p = pct(selectedCar);
        const bx = Math.min(x+14, W-145), by = y-70;
        ctx.shadowColor = "rgba(0,0,0,0.08)"; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.roundRect(bx,by,138,58,7);
        ctx.fillStyle = "#fff"; ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = "#0f172a"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "left";
        ctx.fillText(selectedCar.matricula, bx+10, by+17);
        ctx.fillStyle = "#94a3b8"; ctx.font = "10px sans-serif";
        ctx.fillText(selectedCar.idVehiculo, bx+10, by+30);
        const fc = batteryColor(p);
        ctx.fillStyle = fc.fg; ctx.font = "bold 12px sans-serif";
        ctx.fillText(`${p}% batería`, bx+10, by+46);
      }
    }
  }, [cars, selectedCar]);

  const handleClick = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;
    const hit = cars.find((_, i) => {
      const fx = 0.18 + (i % 4) * 0.18;
      const fy = 0.28 + Math.floor(i / 4) * 0.38;
      return Math.hypot(mx - fx, my - fy) < 0.04;
    });
    onSelect(hit || null);
  };

  return (
    <div style={{ position: "relative", height: "100%", borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0" }}>
      <canvas ref={ref} width={880} height={500}
        style={{ width: "100%", height: "100%", cursor: "crosshair", display: "block" }}
        onClick={handleClick} />
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
        {[["🚗 Vehículos"],["⚡ Postes"],["🗺 Zonas"]].map(([label])=>(
          <button key={label} style={{
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6,
            padding: "4px 10px", fontSize: 11, color: "#374151", cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)", fontFamily: "'DM Sans', sans-serif",
          }}>{label}</button>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 10, right: 12, color: "#94a3b8", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>
        41.3852°N · 2.1734°E
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", flex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function Sidebar({ cars, search, setSearch, selectedCar, onSelect }) {
  const filtered = cars.filter(c =>
    c.matricula.toLowerCase().includes(search.toLowerCase()) ||
    c.idVehiculo.toLowerCase().includes(search.toLowerCase())
  );
  const alerts = cars.filter(c => pct(c) < 20);
  const stats = {
    enRuta:   cars.filter(c => c.estado === "EN_RUTA").length,
    cargando: cars.filter(c => c.estado === "CARGANDO").length,
    averia:   cars.filter(c => c.estado === "AVERIA").length,
  };

  return (
    <div style={{ width: 264, flexShrink: 0, background: "#fff", borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "14px 14px 0", display: "flex", gap: 8 }}>
        <StatCard label="En ruta"  value={stats.enRuta}   color="#16a34a" />
        <StatCard label="Cargando" value={stats.cargando} color="#ea580c" />
        <StatCard label="Avería"   value={stats.averia}   color="#dc2626" />
      </div>

      {alerts.length > 0 && (
        <div style={{ margin: "12px 14px 0", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#dc2626", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ animation: "livePulse 1s infinite" }}>⚠</span> Alertas críticas
          </div>
          {alerts.map(car => (
            <div key={car.idVehiculo} onClick={() => onSelect(car)} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 0", borderTop: "1px solid #fee2e2", cursor: "pointer",
            }}>
              <span style={{ fontSize: 12, color: "#7f1d1d", fontFamily: "'DM Mono', monospace" }}>{car.matricula}</span>
              <BatteryPill value={pct(car)} />
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: "12px 14px 8px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar matrícula o ID…"
          style={{
            width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 7, padding: "7px 11px", fontSize: 12, color: "#0f172a",
            outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
          }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 14px 14px" }}>
        {filtered.map(car => {
          const p = pct(car);
          const isSel = selectedCar?.idVehiculo === car.idVehiculo;
          return (
            <div key={car.idVehiculo} onClick={() => onSelect(isSel ? null : car)} style={{
              padding: "10px 11px", borderRadius: 8, marginBottom: 4,
              background: isSel ? "#f0f9ff" : "#fafafa",
              border: `1px solid ${isSel ? "#bae6fd" : "#f1f5f9"}`,
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", fontFamily: "'DM Mono', monospace" }}>{car.matricula}</span>
                <Badge estado={car.estado} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <BatteryPill value={p} />
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{car.velocidad > 0 ? `${car.velocidad} km/h` : "Detenido"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Telemetry Dock ───────────────────────────────────────────────────────────
function TelemetryDock({ cars, logs, open, setOpen }) {
  const [tab, setTab] = useState("tabla");
  return (
    <div style={{ background: "#fff", borderTop: "1px solid #e2e8f0", flexShrink: 0, transition: "height 0.25s ease", height: open ? 210 : 40, overflow: "hidden" }}>
      <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: open ? "1px solid #f1f5f9" : "none", cursor: "pointer" }}
        onClick={() => setOpen(!open)}>
        <div style={{ display: "flex", gap: 4 }}>
          {["tabla","logs"].map(t => (
            <button key={t} onClick={e => { e.stopPropagation(); setTab(t); setOpen(true); }} style={{
              background: tab === t && open ? "#f1f5f9" : "none",
              border: "none", borderRadius: 5, padding: "4px 12px",
              fontSize: 12, fontWeight: 500,
              color: tab === t && open ? "#0f172a" : "#94a3b8",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>
              {t === "tabla" ? "Tabla de datos" : "Logs Redis"}
            </button>
          ))}
        </div>
        <span style={{ color: "#cbd5e1", fontSize: 13 }}>{open ? "▾" : "▴"}</span>
      </div>

      {open && tab === "tabla" && (
        <div style={{ overflowX: "auto", overflowY: "auto", height: 168 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["ID","Matrícula","Batería","Velocidad","Cap. Máx.","Estado","Latitud","Longitud"].map(h => (
                  <th key={h} style={{ padding: "6px 14px", textAlign: "left", fontWeight: 600, color: "#64748b", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cars.map((car, i) => (
                <tr key={car.idVehiculo} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "6px 14px", color: "#64748b", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{car.idVehiculo}</td>
                  <td style={{ padding: "6px 14px", fontFamily: "'DM Mono', monospace", color: "#0f172a" }}>{car.matricula}</td>
                  <td style={{ padding: "6px 14px" }}><BatteryPill value={pct(car)} /></td>
                  <td style={{ padding: "6px 14px", color: "#374151" }}>{car.velocidad} km/h</td>
                  <td style={{ padding: "6px 14px", color: "#94a3b8" }}>{car.capacidadBateriaMaxima} kWh</td>
                  <td style={{ padding: "6px 14px" }}><Badge estado={car.estado} /></td>
                  <td style={{ padding: "6px 14px", color: "#94a3b8", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{car.latitud.toFixed(4)}</td>
                  <td style={{ padding: "6px 14px", color: "#94a3b8", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{car.longitud.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && tab === "logs" && (
        <div style={{ height: 168, overflowY: "auto", padding: "8px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
          {logs.map(log => (
            <div key={log.id} style={{ display: "flex", gap: 12, padding: "4px 0", borderBottom: "1px solid #f8fafc", alignItems: "flex-start" }}>
              <span style={{ color: "#94a3b8", flexShrink: 0 }}>{log.ts}</span>
              <span style={{ color: log.level === "error" ? "#dc2626" : log.level === "ok" ? "#16a34a" : "#64748b" }}>
                {log.msg}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [cars, setCars]               = useState(MOCK_CARS);
  const [logs, setLogs]               = useState(INITIAL_LOGS);
  const [connected, setConnected]     = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [search, setSearch]           = useState("");
  const [dockOpen, setDockOpen]       = useState(true);

  // Simulate live updates (remove when connecting real WebSocket)
  useEffect(() => {
    const id = setInterval(() => {
      setCars(prev => prev.map(car => ({
        ...car,
        nivelBateriaActual: Math.max(0, Math.min(car.capacidadBateriaMaxima,
          car.nivelBateriaActual + (car.estado === "CARGANDO" ? 0.8 : -0.2))),
        velocidad: car.estado === "EN_RUTA"
          ? Math.max(10, Math.min(80, car.velocidad + (Math.random() - 0.5) * 6))
          : 0,
      })));
      const msgs = [
        ["Redis ping OK", "ok"], ["V-001 posición actualizada", "info"],
        ["V-003 velocidad cambiada", "info"], ["WebSocket heartbeat OK", "ok"],
        ["ALERTA: V-004 batería crítica", "error"],
      ];
      const [msg, level] = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs(prev => [{ id: Date.now(), level, ts: new Date().toLocaleTimeString("es-ES", { hour12: false }), msg }, ...prev.slice(0, 29)]);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // ── WebSocket real (descomenta al conectar al backend) ──
  // useEffect(() => {
  //   const socket = new WebSocket("ws://localhost:8080");
  //   socket.onopen    = () => setConnected(true);
  //   socket.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     if (data.type === "ESTADO_INICIAL") {
  //       setCars(data.payload.listaVehiculos);
  //     } else if (data.type === "ACTUALIZACION") {
  //       setCars(data.payload);
  //     } else if (data.type === "vehiculos:posiciones") {
  //       setCars(prev => {
  //         const existe = prev.find(v => v.idVehiculo === data.payload.idVehiculo);
  //         return existe
  //           ? prev.map(v => v.idVehiculo === data.payload.idVehiculo ? data.payload : v)
  //           : [...prev, data.payload];
  //       });
  //     }
  //   };
  //   socket.onerror = socket.onclose = () => setConnected(false);
  //   return () => socket.close();
  // }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8fafc; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
        input::placeholder { color: #94a3b8; }
        @keyframes livePulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
      `}</style>

      <div style={{
        display: "flex", flexDirection: "column",
        height: "100vh", width: "100vw",
        fontFamily: "'DM Sans', sans-serif",
        background: "#f8fafc", color: "#0f172a",
        overflow: "hidden",
      }}>
        {/* Header */}
        <header style={{
          height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⚡</div>
              <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.02em" }}>FleetOS</span>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {["Mapa en vivo","Analítica","Configuración"].map((item, i) => (
                <button key={item} style={{
                  background: i === 0 ? "#f1f5f9" : "none", border: "none",
                  color: i === 0 ? "#0f172a" : "#94a3b8",
                  padding: "5px 12px", borderRadius: 6, fontSize: 12,
                  fontWeight: i === 0 ? 600 : 400, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}>{item}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: connected ? "#16a34a" : "#dc2626",
                boxShadow: `0 0 0 2px ${connected ? "#dcfce7" : "#fee2e2"}`,
                animation: connected ? "livePulse 2s infinite" : "none",
              }} />
              <span style={{ fontSize: 11, color: connected ? "#16a34a" : "#dc2626", fontWeight: 500 }}>
                {connected ? "Conectado" : "Desconectado"}
              </span>
            </div>
            <div style={{ width: 1, height: 18, background: "#e2e8f0" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#64748b" }}>GF</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>Gestor de Flota</div>
                <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>admin@fleet.es</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1, padding: 14, overflow: "hidden" }}>
            <MapCanvas cars={cars} selectedCar={selectedCar} onSelect={setSelectedCar} />
          </div>
          <Sidebar cars={cars} search={search} setSearch={setSearch} selectedCar={selectedCar} onSelect={setSelectedCar} />
        </div>

        {/* Dock */}
        <TelemetryDock cars={cars} logs={logs} open={dockOpen} setOpen={setDockOpen} />
      </div>
    </>
  );
}
