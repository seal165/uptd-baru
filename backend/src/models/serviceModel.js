/**
 * Model untuk tabel `services`, `test_categories`, `test_types`.
 * Schema DB:
 *   test_types: id, type_name
 *   test_categories: id, test_type_id, category_name
 *   services: id, category_id, test_type_id, service_name, min_sample, satuan,
 *             duration_days, price, method, kan
 */
const db = require('../config/database');

exports.listCategories = async () => {
    const [rows] = await db.query(
        'SELECT * FROM test_categories ORDER BY category_name ASC'
    );
    return rows;
};

exports.listTypesByCategory = async (categoryId) => {
    const [rows] = await db.query(
        'SELECT * FROM test_types ORDER BY type_name ASC'
    );
    return rows;
};

exports.listServices = async () => {
    // Gabung tipe + categories + services
    const [rows] = await db.query(`
        SELECT 
            tt.id AS type_id, tt.type_name AS type_name,
            tc.id AS category_id, tc.category_name AS category_name,
            s.id AS service_id, s.service_name AS service_name,
            s.min_sample, s.satuan, s.duration_days, s.price, s.method, s.kan,
            s.test_type_id, s.category_id AS s_category_id
        FROM test_types tt
        LEFT JOIN services s ON s.test_type_id = tt.id
        LEFT JOIN test_categories tc ON tc.id = s.category_id
        ORDER BY tt.id, s.service_name
    `);

    // Bentuk data sesuai ekspektasi frontend (Array of Types)
    const typeMap = {};
    const result = [];

    for (const r of rows) {
        if (!typeMap[r.type_id]) {
            typeMap[r.type_id] = {
                typeId: r.type_id,
                typeName: r.type_name,
                items: []
            };
            result.push(typeMap[r.type_id]);
        }
        
        if (r.service_id) {
            typeMap[r.type_id].items.push({
                id: r.service_id,
                service_name: r.service_name,
                sample: r.min_sample ? `${r.min_sample} ${r.satuan || ''}`.trim() : '-',
                min_sample: r.min_sample,
                satuan: r.satuan,
                duration: r.duration_days,
                price: r.price,
                method: r.method,
                kan: r.kan,
                test_type_id: r.test_type_id,
                category_id: r.s_category_id,
                category_name: r.category_name
            });
        }
    }
    
    return result;
};

exports.findServiceById = async (id) => {
    const [rows] = await db.query(
        `SELECT s.*, tt.type_name, tc.category_name
         FROM services s
         LEFT JOIN test_types tt ON tt.id = s.test_type_id
         LEFT JOIN test_categories tc ON tc.id = s.category_id
         WHERE s.id = ? LIMIT 1`,
        [id]
    );
    return rows[0] || null;
};
