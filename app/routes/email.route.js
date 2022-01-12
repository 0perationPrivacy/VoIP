module.exports = app => {
    var email = require('../controller/email.controller');
    var router = require("express").Router();
    const auth = require('../middleware/auth.middleware');

    router.post("/create", auth, email.create);
    router.get("/delete", auth, email.delete);
    router.get("/setting-get", auth, email.getEmail);
    router.post("/save/setting", auth, email.saveSetting);
    
    app.use('/api/email', router);
};