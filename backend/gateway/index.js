const { createAdapter } = require('./adapterFactory');
const path = require('path');
const m = (f) => path.join(__dirname, '../mocks', f);

const conductorAdapter  = createAdapter('CONDUCTOR', 'CONDUCTOR_URL',  m('auth.json'));
const vehiculosAdapter  = createAdapter('VEHICULOS',  'VEHICULOS_URL',  m('vehicles.json'));

module.exports = {
  conductorAdapter,
  vehiculosAdapter,
};
