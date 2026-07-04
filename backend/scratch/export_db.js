const mysqldump = require('mysqldump');

async function exportDatabase() {
    try {
        await mysqldump({
            connection: {
                host: 'localhost',
                user: 'root',
                password: '',
                database: 'uptd_lab',
            },
            dumpToFile: './uptd_lab_lengkap.sql',
        });
        console.log("Database exported to uptd_lab_lengkap.sql");
    } catch (e) {
        console.error(e);
    }
}
exportDatabase();
