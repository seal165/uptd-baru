const dashboardController = require('./src/controllers/dashboardController');

const req = {};
const res = {
    status: function(s) { this.statusCode = s; return this; },
    json: function(d) { console.log('JSON:', JSON.stringify(d, null, 2)); return this; }
};
const next = (err) => { console.error('Next called with Error:', err); };

dashboardController.adminStats(req, res, next).then(() => {
    console.log('Done!');
}).catch(console.error);
