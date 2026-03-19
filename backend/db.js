const { Pool } = require('pg'); // Asumiendo que usáis PostgreSQL

// Configuración del Pool
const pool = new Pool({
    user: 'tu_usuario',
    host: 'db-maestro', // Nombre que tendrá el servicio en Docker
    database: 'simulador_db',
    password: 'tu_password',
    port: 5432,
    max: 10, // Máximo de clientes en el pool (Requisito de la asignatura)
    idleTimeoutMillis: 30000,
});

module.exports = pool;