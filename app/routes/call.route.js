module.exports = app => {
    var call = require('../controller/call.controller');
    var router = require("express").Router();
    const auth = require('../middleware/auth.middleware');

    router.post("/setting", auth, call.create);
    router.post("/setting/delete", auth, call.delete);
    router.post("/setting/get", auth, call.get);
    router.post("/token", auth, call.getToken);

    //calling route
    router.post("/make-call", call.makeCall);
    router.post("/status", call.status);
    router.post("/incoming", call.incoming);
    router.post("/telnyx", call.telnyx);
    router.post("/status/telnyx", call.statusTelnyx);
    
    app.use('/api/call', router);
};