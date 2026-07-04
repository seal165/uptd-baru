console.log('🟢 [DB] File database.js mulai di-load');

require('dotenv').config();
const mysql = require('mysql2');

// Buat pool koneksi
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'uptd_lab',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Matikan ONLY_FULL_GROUP_BY untuk setiap koneksi
pool.on('connection', (connection) => {
    console.log('🔧 Setting sql_mode...');
    connection.query("SET SESSION sql_mode = ''");
});

// Promise wrapper
const promisePool = pool.promise();

// ===== TAMBAHKAN TEST KONEKSI DI SINI =====
(async function testConnection() {
    try {
        console.log('🟢 [DB] Mencoba koneksi ke MySQL...');
        const connection = await promisePool.getConnection();
        console.log('✅ [DB] Koneksi ke MySQL BERHASIL!');
        connection.release(); // Lepaskan kembali ke pool
    } catch (err) {
        console.error('❌ [DB] GAGAL koneksi ke MySQL:');
        console.error('   - Pesan:', err.message);
        console.error('   - Kode:', err.code);
        console.error('   - Host:', process.env.DB_HOST || 'localhost');
        console.error('   - User:', process.env.DB_USER || 'root');
        console.error('   - Database:', process.env.DB_NAME || 'uptd_lab');
        console.error('⚠️  Periksa apakah MySQL menyala dan kredensial benar.');
        // Jangan exit, biarkan server tetap jalan dengan error (agar terlihat)
        // Tapi lebih baik exit agar tidak lanjut ke server.js yang error
        process.exit(1);
    }
})();

module.exports = promisePool;