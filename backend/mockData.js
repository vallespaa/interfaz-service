let estadoSistema = {
    listaVehiculos: [
      { "idVehiculo": "veh-5501", "idConductor": "cond-2022", "matricula": "1234-XYZ", "latitud": 40.4167, "longitud": -3.7032, "velocidad": 50.5, "nivelBateriaActual": 45.2, "capacidadBateriaMaxima": 60.0, "estado": "EN_USO"},
      { "idVehiculo": "veh-5551", "idConductor": "cond-5551", "matricula": "1234-XYZ", "latitud": 40.3455, "longitud": -1.1042, "velocidad": 50.5, "nivelBateriaActual": 85.0, "capacidadBateriaMaxima": 120.0, "estado": "EN_USO" },
      { "idVehiculo": "veh-0425", "idConductor": "cond-0425", "matricula": "1234-XYZ", "latitud": 40.3523, "longitud": -1.1615, "velocidad": 50.5, "nivelBateriaActual": 12.0, "capacidadBateriaMaxima": 120.0, "estado": "EN_USO" },
      { "idVehiculo": "veh-0994", "idConductor": "cond-0994", "matricula": "1234-XYZ", "latitud": 40.3441, "longitud": -1.0898, "velocidad": 50.5, "nivelBateriaActual": 10.0, "capacidadBateriaMaxima": 120.0, "estado": "EN_USO" }
    ],
    listaPostes: [
      { "idZona": "Z-Madrid-01", "postesLibres": 5, "estado": "DISPONIBLE" }
    ],
    notificacionesActivas: []
};

// Función para simular el movimiento
const iniciarSimulacion = (redisPublisher) => {
    // 1. Simulación de Movimiento de Vehículos (Cada 3 seg)
    setInterval(async () => {
        estadoSistema.listaVehiculos = estadoSistema.listaVehiculos.map(v => ({
            ...v,
            latitud: v.latitud + (Math.random() - 0.5) * 0.0005,
            longitud: v.longitud + (Math.random() - 0.5) * 0.0005,
            nivelBateriaActual: Math.max(0, +(v.nivelBateriaActual - 0.05).toFixed(2))
        }));

        if (redisPublisher && redisPublisher.isOpen) {
          // Según el PDF de VehiculosService, envían un objeto con el array "actualizaciones"
          const payloadVehiculos = {
            timestamp: new Date().toISOString(),
            actualizaciones: estadoSistema.listaVehiculos.map(v => ({
              idVehiculo: v.idVehiculo,
              latitud: v.latitud,
              longitud: v.longitud,
              nivelBateriaActual: v.nivelBateriaActual,
              estadoSugerido: v.estado
            }))
          };
          await redisPublisher.publish(process.env.CANAL_VEHICULOS || 'vehiculo.telemetria', JSON.stringify(payloadVehiculos));
        }
    }, 3000);

    // 2. Simulación de Zonas de Carga (Cada 10 seg cambia la ocupación)
    setInterval(async () => {
      if (redisPublisher && redisPublisher.isOpen) {
        const zonaUpdate = {
          type: "ZONA_UPDATE",
          payload: {
            idZona: "Z-Madrid-01",
            postesLibres: Math.floor(Math.random() * 6),
            estado: "DISPONIBLE"
          }
        };
        await redisPublisher.publish(process.env.CANAL_POSTES || 'zonas.eventos', JSON.stringify(zonaUpdate));
      }
    }, 10000);
    
    // 3. Simulación de Alertas Críticas (Cada 15 seg una alerta aleatoria)
    setInterval(async () => {
      if (redisPublisher && redisPublisher.isOpen) {
        const alerta = {
          idAlerta: "uuid-" + Math.random().toString(16).slice(2),
          tipo: "VEHICULO_SIN_BATERIA",
          severidad: "CRITICAL",
          idEntidad: "veh-0425",
          fecha: new Date().toISOString(),
          mensaje: "El vehículo veh-0425 tiene menos del 10% de batería"
        };
        await redisPublisher.publish(process.env.CANAL_NOTIFICACIONES || 'alerta.creada', JSON.stringify(alerta));
      }
    }, 15000);
};

// Exportamos el objeto y la función
module.exports = { estadoSistema, iniciarSimulacion };