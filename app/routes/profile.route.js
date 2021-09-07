module.exports = app => {
    var profileController = require('../controller/profile.controller');
    var router = require("express").Router();
    const auth = require('../middleware/auth.middleware');
    //router.post("/register",auth, user.login);
    router.post("/create",auth, profileController.crateProfile);
    router.post("/getdata",auth, profileController.getProfile);
    router.post("/delete-profile",auth, profileController.deleteProfile);
    router.post("/update-profile",auth, profileController.updateProfile);
    
    router.post("/getdata-one",auth, profileController.getOneProfile);
    
    app.use('/api/profile', router);
};