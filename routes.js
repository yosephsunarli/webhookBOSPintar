module.exports = function (app) {
    var router = require('./controller');
    app.route('/webhook').post(router.webhookFunction);
};