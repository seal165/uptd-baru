/**
 * Model untuk tabel `services`, `test_categories`, `test_types`.
 */
const db = require('../config/database');

exports.listCategories = async () => {
    const [rows] = await db.query(
        'SELECT * FROM test_categories ORDER BY name ASC'
    );
    return rows;
};

exports.listTypesByCategory = async (categoryId) => {
    const [rows] = await db.query(
        'SELECT * FROM test_types WHERE category_id = ? ORDER BY name ASC',
        [categoryId]
    );
    return rows;
};

exports.listServices = async () => {
    // Gabung kategori + tipe + services jadi tree structure
    const [rows] = await db.query(`
        SELECT 
            tc.id AS category_id, tc.name AS category_name,
            tt.id AS type_id, tt.name AS type_name,
            s.id AS service_id, s.name AS service_name,
            s.sample, s.duration, s.price, s.method, s.kan, s.accredited
        FROM test_categories tc
        LEFT JOIN test_types tt ON tt.category_id = tc.id
        LEFT JOIN services s ON s.type_id = tt.id
        ORDER BY tc.name, tt.name, s.name
    `);

    // Bentuk tree
    const tree = [];
    const catMap = {};
    const typeMap = {};

    for (const r of rows) {
        if (!catMap[r.category_id]) {
            catMap[r.category_id] = {
                categoryId: r.category_id,
                categoryName: r.category_name,
                types: []
            };
            tree.push(catMap[r.category_id]);
        }
        if (r.type_id && !typeMap[r.type_id]) {
            typeMap[r.type_id] = {
                typeId: r.type_id,
                typeName: r.type_name,
                items: []
            };
            catMap[r.category_id].types.push(typeMap[r.type_id]);
        }
        if (r.service_id) {
            typeMap[r.type_id].items.push({
                id: r.service_id,
                name: r.service_name,
                sample: r.sample,
                duration: r.duration,
                price: r.price,
                method: r.method,
                kan: r.kan,
                accredited: r.accredited
            });
        }
    }
    return tree;
};

exports.findServiceById = async (id) => {
    const [rows] = await db.query(
        `SELECT s.*, tt.name AS type_name, tc.name AS category_name
         FROM services s
         LEFT JOIN test_types tt ON tt.id = s.type_id
         LEFT JOIN test_categories tc ON tc.id = tt.category_id
         WHERE s.id = ? LIMIT 1`,
        [id]
    );
    return rows[0] || null;
};
