const mysql = require('mysql2/promise');
const fs = require('fs');

async function extractSchema() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'uptd_lab'
        });

        console.log('Connected to db');

        const [tables] = await connection.query(`
            SELECT TABLE_NAME as table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'uptd_lab'
        `);

        const schema = {};
        const relations = [];

        for (const { table_name: tableName } of tables) {
            const [columns] = await connection.query(`
                SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, COLUMN_KEY, IS_NULLABLE, EXTRA
                FROM information_schema.columns 
                WHERE table_schema = 'uptd_lab' AND TABLE_NAME = ?
            `, [tableName]);
            
            schema[tableName] = columns;

            const [foreignKeys] = await connection.query(`
                SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE table_schema = 'uptd_lab' AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL
            `, [tableName]);

            for (const fk of foreignKeys) {
                relations.push({
                    table: tableName,
                    column: fk.COLUMN_NAME,
                    referencedTable: fk.REFERENCED_TABLE_NAME,
                    referencedColumn: fk.REFERENCED_COLUMN_NAME
                });
            }
        }
        
        fs.writeFileSync('schema.json', JSON.stringify({ schema, relations }, null, 2));
        console.log('Schema extracted to schema.json');
        
        await connection.end();
    } catch (e) {
        console.error(e);
    }
}

extractSchema();
