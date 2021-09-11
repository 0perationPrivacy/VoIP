module.exports = app => {
    var media = require('../controller/media.controller');
    var router = require("express").Router();
    const auth = require('../middleware/auth.middleware');
    router.post("/upload-files", auth, media.fileUpload);
    
    app.use('/api/media', router);
};