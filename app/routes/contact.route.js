module.exports = app => {
    var contact = require('../controller/contact.controller');
    var router = require("express").Router();
    const auth = require('../middleware/auth.middleware');

    router.post("/get-one", auth, contact.getOne);
    router.post("/create", auth, contact.crate);
    router.post("/update", auth, contact.update);
    router.post("/delete", auth, contact.delete);
    router.get("/get-all", auth, contact.getAllContact);
    router.post("/multiple-add", auth, contact.multipleUpload);
    router.post("/deleteall", auth, contact.deleteall);
    

    app.use('/api/contact', router);
};