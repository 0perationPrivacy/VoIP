const bcrypt = require('bcrypt');
const saltRounds = 10;
const Validator = require('validatorjs');

const moment = require('moment')

var User = require('../model/user.model');
const nodemailer = require('nodemailer');

exports.login = async (req, res) => {
    let rules = {
        email: 'required',
        password: 'required'
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        var email = req.body.email.toLowerCase()
        var userData = {email:email};
        var user = await User.findOne(userData);
        //res.send(user);
        if(user){
            var checkpassword = bcrypt.compareSync(req.body.password, user.password);
            if(checkpassword){
                var obj = {id:user.id,email:user.email,name:user.name};
                var strObj = JSON.stringify(obj);
                let buff = Buffer.from(strObj, "utf8");
                let base64data = buff.toString('base64');
                user.token = base64data;
                user.save();                
                /*var min = 100000;
                var max = 999999;
                var otp = Math.floor(Math.random() * (max - min)) + min;
                user.otp = otp;
                user.save();
                
                let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: process.env.EMAIL, // generated ethereal user
                        pass: process.env.PASSWORD, // generated ethereal password
                    },
                });

                transporter.sendMail({
                    from: process.env.EMAIL, // sender address
                    to: user.email, // list of receivers
                    subject: "Verify OTP✔", // Subject line
                    text: "Your otp is " +otp, // plain text body
                  });
                  var data = {_id:user._id, email:user.email};*/
                  res.send({status:true, message:'user data!', data:user, token:base64data});
                  return;
            }else{
                res.status(401).json({status:'false',message:'Unauthorized Access!'});
            }
        }else{
            res.status(401).json({status:'false',message:'Unauthorized Access!'});
        }
    }else{
        res.status(419).send({status: false, errors:validation.errors, data: []});
    }
};
//otp-verify
exports.otpVerify = async (req, res) => {
    var userData = {_id:req.body.user};
    var user = await User.findOne(userData);
    if(user && user.otp == req.body.otp){
        var obj = {id:user.id,email:user.email,name:user.name};
        var strObj = JSON.stringify(obj);
        let buff = Buffer.from(strObj, "utf8");
        let base64data = buff.toString('base64');
        user.token = base64data;
        user.save();
        res.send({status:true, message:'user data!', data:user, token:base64data});
    }else{
        res.status(401).json({status:'false',message:'Unauhtorize user!'}); 
    }
};

exports.register = async (req, res) => {
    let rules = {
        email: 'required',
        password: 'required|between:6,100'
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        var email = req.body.email.toLowerCase()
        var checkEmail = await User.findOne({email: email});
        if(checkEmail){
            var errors = {errors: {email:['Username already exists!']}};
            res.status(400).send({status: false, errors:errors, data: []});
        }else{
            const hash = bcrypt.hashSync(req.body.password, saltRounds);
            var userData = {name:email, email:email,password:hash};
            var saveUser = await User.create(userData);
            res.send({status:true, message:'User created successfully!', data:saveUser});
        }
    }else{
        res.status(419).send({status: false, errors:validation.errors, data: []});
    }
};

exports.getSignUpOption = async (req, res) => {
    var signup = process.env.SIGNUPS;
    if(signup){
        res.send({status:true, message:'signup option!', data:signup});
    }else{
        res.status(400).send({status: false, errors:'signup not avilables', data: []}); 
    }
    // res.send({status:true, message:'user created successfully!', data:saveUser});
};

exports.getVersionOption = (req, res) => {
    var version = process.env.APP_VERSION;
    if(!version){
        version = 'v0.0'
    }
    res.send({status:true, message:'version option!', data:version});  
};
exports.updateAllProfile = async (req, res) => {
    var users = await User.find();
    for (var i=0; i < users.length; i++) {
        var email = users[i].email.toLowerCase()
        var user = await User.findById(users[i]._id);
        user.email = email;
        user.save();
    }
    res.send(users)
};



