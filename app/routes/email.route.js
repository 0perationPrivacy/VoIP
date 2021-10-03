module.exports = app => {
    var email = require('../controller/email.controller');
    var router = require("express").Router();
    const auth = require('../middleware/auth.middleware');

    router.post("/create", auth, email.create);
    router.get("/delete", auth, email.delete);
    
    app.use('/api/email', router);
};