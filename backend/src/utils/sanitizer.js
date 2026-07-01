/**
 * Helper untuk sanitasi input dari user.
 */

exports.escapeHtml = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]));
};

exports.normalizeEmail = (email) => {
    if (typeof email !== 'string') return email;
    return email.trim().toLowerCase();
};

exports.cleanPhone = (phone) => {
    if (typeof phone !== 'string') return phone;
    return phone.replace(/\D/g, '');
};
