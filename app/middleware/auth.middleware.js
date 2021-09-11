var User = require('../model/user.model');
var jwt = require('jsonwebtoken');
// const salt = process.env.COOKIE_KEY
module.exports = (req, res, next) => {
    try {
        if(req.headers.token){
            const token = req.headers.token;
            var condition = {token:token};
            User.findOne(condition).then(data => {
                if(data){
                    try {
                        var decoded = jwt.verify(token, process.env.COOKIE_KEY);
                        //console.log(decoded)
                        req.user = decoded;
                        next();
                      } catch(err) {
                        res.status(401).json({
                            error: 'Unauthorized Access!'
                        });
                      }
                    
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