module.exports = app => {
    var hardwarekey = require('../controller/hardwarekey.controller');
    var router = require("express").Router();
    const auth = require('../middleware/auth.middleware');
    router.post("/register-key", auth, hardwarekey.registerSession);
    router.post("/register",auth, hardwarekey.register);
    router.post("/verify",auth, hardwarekey.verify);

    router.post("/login-key", hardwarekey.loginSession);
    router.post("/login", hardwarekey.login);

    router.post("/get",auth, hardwarekey.getKey);
    router.post("/delete",auth, hardwarekey.delete);

    app.use('/api/hardwarekey', router);
};