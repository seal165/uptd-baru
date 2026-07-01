const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Set global setting di res.locals.settings & req.settings
 * supaya bisa diakses di EJS view + middleware lain.
 */
module.exports = async (req, res, next) => {
    try {
        const [rows] = await db.query(
            'SELECT setting_key, setting_value FROM settings'
        );
        const settings = {};
        rows.forEach((row) => {
            let key = row.setting_key;
            if (key.startsWith('system_')) key = key.replace('system_', '');
            settings[key] = row.setting_value;
        });
        res.locals.settings = settings;
        req.settings = settings;
        next();
    } catch (err) {
        logger.warn('Failed to load global settings: ' + err.message);
        res.locals.settings = {};
        req.settings = {};
        next();
    }
};
