const bcrypt = require('bcrypt');
const saltRounds = 10;
const Validator = require('validatorjs');

const moment = require('moment')

var User = require('../model/user.model');
const nodemailer = require('nodemailer');

var Contact = require('../model/contact.model');
var Email = require('../model/email.model');
var Message = require('../model/message.model'); 
var Setting = require('../model/setting.model'); 
const telnyxHelper = require('../helper/telnyx.helper');
const twilioHelper = require('../helper/twilio.helper');

const remoteVersion = 'https://raw.githubusercontent.com/0perationPrivacy/VoIP/main/version.md';
const currentVersion = process.env.APP_VERSION; // change to read from local file version.md

var jwt = require('jsonwebtoken');

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
                var token = jwt.sign(obj, process.env.COOKIE_KEY);
                //console.log(token)
                //res.status(401).json({status:'false',message:'Unauthorized Access!'});
                // return
                //var strObj = JSON.stringify(obj);
                //let buff = Buffer.from(strObj, "utf8");
                //let base64data = buff.toString('base64');
                user.token = token;
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
                  res.send({status:true, message:'user data!', data:user, token:token});
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

exports.getUpdateVersion = (req, res) => {
    var request = require('request');
    request.get(remoteVersion, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            if(isNaN(body)){
                res.send({update: 'false'});
            }else{
                // var curruntv = process.env.APP_VERSION
                // curruntv = curruntv.replace("v", "").replace("-beta", "");
                // console.log(body)
                console.log(currentVersion)
                if(currentVersion < body){
                    res.send({update: 'true'});
                }else{
                    res.send({update: 'false'});
                }
            }
        }else{
            res.send({update: 'false'});
        }
    });
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

exports.updateUserName = async (req, res) => {
    let rules = {
        email: 'required',
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        var user = await User.findOne({ email: req.body.email , _id: { $ne: req.user.id } });
        if(user){
            res.status(400).json({status:'false',message:'username already exists!'});
        }else{
            var checkUser = await User.findById(req.user.id);
            if(checkUser){
                checkUser.email = req.body.email
                checkUser.name = req.body.email
                var saveEmail = await checkUser.save()
                res.send({status:true, message:'username updated successfully!', data:checkUser});
            }else{
                res.status(400).json({status:'false',message:'User not found!'});
            }
        }
    }else{
        res.status(419).send({status: false, errors:validation.errors, data: []});
    }
}

exports.updatePassword = async (req, res) => {
    let rules = {
        old_password: 'required',
        password: 'required',
        c_password: 'required'
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        var checkUser = await User.findById(req.user.id);
        if(checkUser){
            var checkpassword = bcrypt.compareSync(req.body.old_password, checkUser.password);
            if(checkpassword){
                const hash = bcrypt.hashSync(req.body.password, saltRounds);
                checkUser.password = hash
                var saveEmail = await checkUser.save()
                res.send({status:true, message:'Password updated successfully!', data:checkUser});
            }else{
                res.status(400).json({status:'false',message:'Please enter a valid old password!'});
            }
        }else{
            res.status(400).json({status:'false',message:'User not found!'});
        }
    }else{
        res.status(419).send({status: false, errors:validation.errors, data: []});
    }
}

exports.checkPassword = async (req, res) => {
    console.log(req.user.id)
    let rules = {
        password: 'required'
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        var checkUser = await User.findById(req.user.id);
        if(checkUser){
            var checkpassword = bcrypt.compareSync(req.body.password, checkUser.password);
            if(checkpassword){
                var response = await deleteAllAccountData(req.user.id)
                res.send(response)
                // res.send({status:'true', message:'Password checked!', data:checkUser});
            }else{
                res.status(400).json({status:'false',message:'Please enter a valid password!'});
            }
        }else{
            res.status(400).json({status:'false',message:'User not found!'});
        }
    }else{
        res.status(419).send({status: false, errors:validation.errors, data: []});
    }
}

const deleteAllAccountData = (userid) => {
    // console.log(outboundProfileid)
    return new Promise(async (resolve,reject) =>  {
        try{
            var response = {status:'true', message:'Password checked!', data:[]}; 
            await Contact.deleteMany({user: userid});
            await Email.deleteMany({user: userid});
            await Message.deleteMany({user: userid});
            var settings =await Setting.find({user: userid});
            for(var i = 0; i < settings.length; i++) {
                try{
                    if(settings[i].type === 'telnyx'){
                        if(settings[i].api_key && settings[i].sid){
                            await telnyxHelper.updatePhoneNumber(settings[i].api_key, settings[i].sid)
                        }
                        if(settings[i].api_key && settings[i].sip_id){
                            await telnyxHelper.deleteSIPApp(settings[i].api_key, settings[i].sip_id)
                        }
                        if(settings[i].api_key && settings[i].telnyx_outbound){
                            await telnyxHelper.deleteOutboundVoice(settings[i].api_key, settings[i].telnyx_outbound)
                        }
                        if(settings[i].api_key && settings[i].telnyx_twiml){
                            await telnyxHelper.deleteTexmlApp(settings[i].api_key, settings[i].telnyx_twiml)
                        }
                        if(settings[i]._id && settings[i].sid){
                            await telnyxHelper.emptyMessageProfile(settings[i].api_key, settings[i].sid)
                        }
                        if(settings[i].api_key && settings[i].setting){
                            await telnyxHelper.deleteMessageProfile(settings[i].api_key, settings[i].setting)
                        }
                    }
                    if(settings[i].type === 'twilio' && settings[i].twilio_sid && settings[i].twilio_token){
                        if(settings[i].app_key){
                            await twilioHelper.removeAPIKey(settings[i].twilio_sid, settings[i].twilio_token, settings[i].app_key)
                        }
                        if(settings[i].app_key){
                            await twilioHelper.deleteTwiml(settings[i].twilio_sid, settings[i].twilio_token, settings[i].twiml_app)
                        }
                        if(settings[i].app_key){
                            await twilioHelper.unlinkNumber(settings[i].twilio_sid, settings[i].twilio_token, settings[i].sid)
                        }
                    }
                }catch(error){

                }
            }
            await Setting.deleteMany({user: userid});
            await User.deleteOne({_id: userid});
            resolve(response);
        }catch(error){
            console.log(error)
            resolve(false);
        }
    });
}



