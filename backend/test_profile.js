const mysql = require('mysql2/promise');
const http = require('http');

async function run() {
    try {
        const conn = await mysql.createConnection({host:'localhost', user:'root', password:'', database:'uptd_lab'});
        const [rows] = await conn.execute('SELECT token FROM sessions WHERE user_id = 4 LIMIT 1');
        const token = rows[0]?.token;
        await conn.end();

        if (!token) return console.log('No token');

        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/settings/profile',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        }, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => console.log('Response:', data));
        });
        req.end();
    } catch (e) {
        console.error(e);
    }
}
run();
