const api = require('./src/services/apiClient');
async function test() {
    try {
        const res = await api.auth.adminLogin('admin@uptd.gov.id', 'admin123');
        const token = res.data.data.token;
        const stats = await api.dashboard.adminStats(token);
        console.log("SUCCESS:", JSON.stringify(stats.data, null, 2));
    } catch(e) {
        console.error('Error:', e.message);
    }
}
test();
