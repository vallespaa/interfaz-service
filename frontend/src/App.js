import { useEffect, useState, useRef } from "react";

function App() {
  const [cars, setCars] = useState([]);
  const [zones, setZones] = useState([]); // Nuevo: Para los cargadores
  const [alerts, setAlerts] = useState([]); // Nuevo: Para la barra lateral
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080"); // Cambiar cuando suba a la maquina virtual

    socket.onopen = () => {
      setConnected(true);
      console.log("Conectado al servidor");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { type, payload } = data;

      // Aquí filtramos según el tipo de mensaje que enviemos desde el servidor
      switch (type) {
        case 'ESTADO_INICIAL':
          setCars(payload.listaVehiculos || []);
          setZones(payload.listaPostes || []);
          setAlerts(payload.notificacionesActivas || []);
          setLoading(false);
          break;

        case 'vehiculos:posiciones': // Canal de VehiculosService
          // Payload: { actualizaciones: [...] }
          console.log("vehiculos:posiciones: ", payload)
          if (payload.actualizaciones) {
            setCars((prevCars) => {
              const newCars = [...prevCars];
              payload.actualizaciones.forEach((update) => {
                const index = newCars.findIndex(c => c.idVehiculo === update.idVehiculo);
                if (index !== -1) {
                  // Actualizamos solo los campos que vienen (lat, lng, bateria)
                  newCars[index] = { ...newCars[index], ...update };
                } else {
                  // Si es un coche nuevo que no conocíamos
                  newCars.push(update);
                }
              });
              return newCars;
            });
          }
          break;

        case 'infraestructura:postes': // Canal de ZonasCargaService
          console.log("infraestructura:postes: ", payload)
          setZones((prevZones) => {
            const index = prevZones.findIndex(z => z.idZona === payload.idZona);
            if (index !== -1) {
              const nextZones = [...prevZones];
              nextZones[index] = { ...nextZones[index], ...payload };
              return nextZones;
            }
            return [...prevZones, payload];
          });
          break;

        case 'sistema:notificaciones': // Canal de NotificationsService
          console.log("sistema:notificaciones: ", payload)
          setAlerts((prev) => [payload, ...prev].slice(0, 10)); // Guardamos las últimas 10
          break;
        
        default:
          console.log("Evento no manejado:", type);
      }
    };

    // 4. Manejo de errores
    socket.onerror = (error) => {
      console.error(error);
      setConnected(false);
      setLoading(false);
    };
    
    socket.onclose = () => {
      setConnected(false);
    };

    socketRef.current = socket;

    return () => socket.close();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px' }}>
      
      {/* COLUMNA IZQUIERDA: MAPA Y TABLA */}
      <main>
        <h1>🛠 IU Maestra - Control de Flota</h1>
        <p>Estado: {connected ? "🟢 Conectado" : "🔴 Desconectado"}</p>

        {loading ? <p>Cargando ecosistema...</p> : (
          <>
            <section style={{ backgroundColor: '#f0f0f0', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              {/* Aquí irá tu componente de Leaflet pronto */}
              <p>[ MAPA DE LEAFLET: {cars.length} Vehículos | {zones.length} Zonas ]</p>
            </section>

            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#eee' }}>
                  <th>ID</th>
                  <th>Batería</th>
                  <th>Estado</th>
                  <th>Latitud</th>
                  <th>Longitud</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((v) => (
                  <tr key={v.idVehiculo}>
                    <td><b>{v.idVehiculo}</b></td>
                    <td>{v.nivelBateriaActual?.toFixed(1)}%</td>
                    <td><span style={{ padding: '4px', borderRadius: '4px', background: v.estado === 'EN_USO' ? '#d1e7dd' : '#fff3cd' }}>
                      {v.estado || v.estadoSugerido}
                    </span></td>
                    <td>{v.latitud?.toFixed(4)}</td>
                    <td>{v.longitud?.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>

      {/* COLUMNA DERECHA: ALERTAS EN TIEMPO REAL */}
      <aside style={{ borderLeft: '1px solid #ccc', paddingLeft: '20px' }}>
        <h3>🚨 Alertas Recientes</h3>
        {alerts.length === 0 && <p>No hay alertas activas</p>}
        {alerts.map((alert, i) => (
          <div key={i} style={{ 
            padding: '10px', 
            marginBottom: '10px', 
            borderRadius: '5px', 
            backgroundColor: alert.severidad === 'CRITICAL' ? '#f8d7da' : '#fff3cd',
            border: '1px solid ' + (alert.severidad === 'CRITICAL' ? '#f5c2c7' : '#ffe69c')
          }}>
            <strong>{alert.tipo}</strong>
            <p style={{ margin: '5px 0', fontSize: '0.9em' }}>{alert.mensaje}</p>
            <small>{new Date(alert.fecha).toLocaleTimeString()}</small>
          </div>
        ))}
      </aside>
    </div>
  );
}

export default App;