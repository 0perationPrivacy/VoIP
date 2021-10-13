module.exports = app => {
    var call = require('../controller/call.controller');
    var router = require("express").Router();
    const auth = require('../middleware/auth.middleware');

    router.post("/setting", auth, call.create);
    router.post("/setting/delete", auth, call.delete);
    router.post("/setting/get", auth, call.get);
    router.post("/token", auth, call.getToken);
    
    app.use('/api/call', router);
};