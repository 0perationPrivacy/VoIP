module.exports = app => {
    var hardwarekey = require('../controller/hardwarekey.controller');
    var router = require("express").Router();
    const auth = require('../middleware/auth.middleware');
    router.post("/register-key",auth, hardwarekey.registerSession);
    router.post("/register",auth, hardwarekey.register);

    router.post("/login-key", hardwarekey.loginSession);
    router.post("/login", hardwarekey.login);

    app.use('/api/hardwarekey', router);
};