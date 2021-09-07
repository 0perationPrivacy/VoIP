var User = require('../model/user.model');

module.exports = (req, res, next) => {
    try {
        if(req.headers.token){
            const token = req.headers.token;
            var condition = {token:token};
            User.findOne(condition).then(data => {
                if(data){
                    req.user = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
                    next();
                }else{
                    res.status(401).json({
                        error: 'Unauthorized Access!'
                    });
                }
            }).catch(err => {
                res.status(500).send({
                  message:
                    err.message || "Error occurred while logging in."
                });
            });  
        }else{
            res.status(401).json({
                error: 'Unauthorized Access!'
            });
        }
    } catch (e) {
      res.status(401).json({
        error: 'Unauthorized Access!'
      });
    }
};