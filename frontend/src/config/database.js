const mysql = require('mysql2');
const env = require('./env');

/**
 * MySQL pool untuk query langsung dari frontend
 * (dipakai globalSettings & maintenanceCheck).
 */
const pool = mysql.createPool({
    host: env.DB.host,
    user: env.DB.user,
    password: env.DB.password,
    database: env.DB.database,
    port: env.DB.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
