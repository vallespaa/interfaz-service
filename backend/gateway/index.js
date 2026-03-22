const { createAdapter } = require('./adapterFactory');
const path = require('path');
const m = (f) => path.join(__dirname, '../mocks', f);

const conductorAdapter = createAdapter('CONDUCTOR', 'CONDUCTOR_URL', m('conductores.json'));
const vehiculosAdapter = createAdapter('VEHICULOS', 'VEHICULOS_URL', m('vehicles.json'));
const zonasAdapter = createAdapter('ZONAS', 'ZONAS_URL', m('zonas.json'));
const postesAdapter = createAdapter('POSTES', 'POSTES_URL', m('postes.json'));
const reservasAdapter = createAdapter('RESERVAS', 'RESERVAS_URL', m('zonas.json'));
const cargasAdapter = createAdapter('CARGAS', 'CARGAS_URL', m('cargas.json'));
const historicoAdapter = createAdapter('HISTORICO', 'HISTORICO_URL', m('historico.json'));
const notificacionesAdapter = createAdapter('NOTIFICACIONES', 'NOTIFICACIONES_URL', m('notificaciones.json'));
const cuentasAdapter = createAdapter('CUENTAS', 'CUENTAS_URL', m('cuentas.json'));
const logVehiculosAdapter = createAdapter('LOG_VEHICULOS', 'LOG_VEHICULOS_URL', m('logVehiculos.json'));

module.exports = {
  conductorAdapter,
  vehiculosAdapter,
  zonasAdapter,
  postesAdapter,
  reservasAdapter,
  cargasAdapter,
  historicoAdapter,
  notificacionesAdapter,
  cuentasAdapter,
  logVehiculosAdapter,
};
