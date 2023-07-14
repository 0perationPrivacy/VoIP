const bcrypt = require('bcrypt');
const saltRounds = 10;
const Validator = require('validatorjs');

const moment = require('moment')
const fs = require('fs')

var User = require('../model/user.model');
const nodemailer = require('nodemailer');
var Hardwarekey = require('../model/hardwarekey.model');
var Contact = require('../model/contact.model');
var Email = require('../model/email.model');
var Message = require('../model/message.model'); 
var Setting = require('../model/setting.model'); 
const telnyxHelper = require('../helper/telnyx.helper');
const twilioHelper = require('../helper/twilio.helper');

const remoteVersion = 'https://raw.githubusercontent.com/0perationPrivacy/VoIP/main/version.md';
const currentVersion = 'version.md'; // read from local file version.md

var jwt = require('jsonwebtoken');

const Speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const userDataResponseGen = (userDataObj) => {
  const { _id, name, email, token } = userDataObj;
  return { _id, name, email, token };
};

exports.login = async (req, res) => {
    try{
        let rules = {
            email: 'required',
            password: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            var email = req.body.email.toLowerCase()
            var userData = {email:{ $eq: email}};
            var user = await User.findOne(userData);
            //res.send(user);
            if(user){
                var checkpassword = bcrypt.compareSync(req.body.password, user.password);
                if(checkpassword){
                    var obj = {id:user.id,email:user.email,name:user.name};
                    var token = jwt.sign(obj, process.env.COOKIE_KEY);
                    user.token = token;
                    user.save();      
                    var status = 'true';
                    var harwarekey, mfa;
                    if(user.hardwarekey && user.hardwarekey === 'true'){
                        var mfa = false
                        if(user.mfa && user.mfa === 'true') {
                            mfa = true;
                        }
                        status = 'hardwarekey';
                        // harwarekey = false
                        harwarekey = await Hardwarekey.find({ user:user._id, registrationComplete: true });
                        // res.send({status:'hardwarekey', message:'Successfully logged in.', data:user, token:token, harwarekey:harwarekey, mfa:mfa});
                    } else
                    if(user.mfa && user.mfa === 'true'){
                        status = 'mfa';
                        harwarekey = false
                        mfa=true
                    }else{
                        harwarekey = false;
                        mfa = false;
                    }
                    const userDataResponse = userDataResponseGen(user);
                    res.send({status:status, message:'Successfully logged in.', data:userDataResponse, token:token, harwarekey:harwarekey, mfa:mfa});
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
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};
//otp-verify
exports.otpVerify = async (req, res) => {
    try{
        var userData = {_id:{$eq: req.body.user}};
        var user = await User.findOne(userData);
        if(user){
            var verifyData = Speakeasy.totp.verify({
                secret: user.mfa_token,
                encoding: 'base32',
                token: req.body.verification_code
            });
            if(verifyData){
                res.status(200).json({status:'true',data:[],message:'verified successfully!'});
            }else{
                res.status(400).json({status:'false',message:'Please enter valid verification code!'});
            }
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.register = async (req, res) => {
    try{
        let rules = {
            email: 'required',
            password: 'required|between:6,100'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            var email = req.body.email.toLowerCase()
            var checkEmail = await User.findOne({email: {$eq: email}});
            if(checkEmail){
                var errors = {errors: {email:['Username already exists!']}};
                res.status(400).send({status: false, errors:errors, data: []});
            }else{
                const hash = bcrypt.hashSync(req.body.password, saltRounds);
                var userData = {name:email, email:email,password:hash};
                var saveUser = await User.create(userData);

                const userDataResponse = userDataResponseGen(saveUser);
                res.send({status:true, message:'User created successfully!', data:userDataResponse});
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.getSignUpOption = async (req, res) => {
    try{
        var signup = process.env.SIGNUPS;
        if(signup){
            res.send({status:true, message:'signup option!', data:signup});
        }else{
            res.status(400).send({status: false, errors:'signup not avilables', data: []}); 
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.getVersionOption = (req, res) => {
    // var request = require('request');
    // console.log(currentVersion);
    try {
        const data = fs.readFileSync(currentVersion, 'utf8')
        console.log(data)
        res.send({status:true, message:'version defined.', data:`v${data}`});
      } catch (err) {
        console.error(err)
        res.send({status:true, message:'version file not found!', data:'v0.0'});
      }
    // request.get(currentVersion, async function (error, response, body) {
    //     console.log('currentVersion check');
    //     console.log(error);
    //     console.log('status => '+ response.statusCode);
    //     if (!error && response.statusCode == 200) {
    //         console.log('body =>'+body);
    //         if(isNaN(body)){
    //             res.send({status:true, message:'Not a numeric value!', data:'v0.0'});
    //         }else{
    //             res.send({status:true, message:'version defined.', data:`v${body}`});
    //         }
    //     }else{
    //         res.send({status:true, message:'version file not found!', data:'v0.0'});
    //     }
    // });
};
exports.checkDirectoryName = (req, res) => {
    try{
        var dir = process.env.APPDIRECTORY
        if(dir){
            if(req.body.dirname){
                if(dir === req.body.dirname){
                    res.send({status:true, message:'APPDIRECTORY Matched!', data:{status:'true', dir: dir}});
                } else {
                    res.send({status:true, message:'APPDIRECTORY Mismatch!', data:{status:'false', dir: dir}});
                }
            }else{
                res.send({status:true, message:'APPDIRECTORY Mismatch!', data:{status:'no-name', dir: dir}});
            }
        }else{
            if(req.body.dirname){
                if('voip' === req.body.dirname){
                    res.send({status:true, message:'APPDIRECTORY not defined!', data:{status:'nodir', dir: 'voip'}});
                }else{
                    res.send({status:true, message:'APPDIRECTORY Mismatch!', data:{status:'false', dir: dir}});
                }
            }else{
                res.send({status:true, message:'APPDIRECTORY not defined!', data:{status:'no-name',  dir: 'voip'}});
            }
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};
exports.getUpdateVersion = (req, res) => {
    try{
        var request = require('request');
        request.get(remoteVersion, async function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if(isNaN(body)){
                    res.send({update: 'false'});
                }else{
                    // var curruntv = process.env.APP_VERSION
                    // curruntv = curruntv.replace("v", "").replace("-beta", "");
                    // console.log(body)
                    //console.log(currentVersion)
                    try {
                        const body2 = fs.readFileSync(currentVersion, 'utf8')
                        if(body2 < body){
                            res.send({update: 'true'});
                        }else{
                            res.send({update: 'false'});
                        }
                    } catch (err) {
                        console.error(err)
                        res.send({update: 'false'});
                    }
                    // request.get(currentVersion, async function (error, response, body2) {
                    //     if (!error && response.statusCode == 200) {
                    //         if(isNaN(body2)){
                    //             res.send({update: 'false'});
                    //         }else{
                    //             if(body2 < body){
                    //                 res.send({update: 'true'});
                    //             }else{
                    //                 res.send({update: 'false'});
                    //             }
                    //         }
                    //     }else{
                    //         res.send({update: 'false'});
                    //     }
                    // });
                    // console.log(currentVersion)
                    // var current
                }
            }else{
                res.send({update: 'false'});
            }
        });
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.updateUserName = async (req, res) => {
    try{
        let rules = {
            email: 'required',
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            var user = await User.findOne({ email: { $eq: req.body.email } , _id: { $ne: req.user.id } });
            if(user){
                res.status(400).json({status:'false',message:'username already exists!'});
            }else{
                // var checkUser = await User.findById(req.user.id);
                var checkUser = await User.findOne({_id: { $eq: req.user.id }});
                if(checkUser){
                    checkUser.email = req.body.email
                    checkUser.name = req.body.email
                    var saveEmail = await checkUser.save()
                    const userDataResponse = userDataResponseGen(checkUser);
                    res.send({status:true, message:'username updated successfully!', data:userDataResponse});
                }else{
                    res.status(400).json({status:'false',message:'User not found!'});
                }
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
}

exports.getUser = async (req, res) => {
    try{
        var user = await User.findOne({ _id: { $eq: req.user.id } });
        if(user){
            const userDataResponse = userDataResponseGen(user);
            res.status(200).json({ status: "true", data: userDataResponse, message: "user get!" });
        }else{
            res.status(400).json({status:'false',message:'User not found!'});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
}

exports.saveMfa = async (req, res) => {
    try{
        let rules = {
            status: 'required',
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            var user = await User.findOne({ _id: { $eq: req.user.id } });
            if(user){
                if(req.body.status === 'true'){
                    if(req.body.qr === 'true'){
                        const secretCode = Speakeasy.generateSecret({
                            name: `Operation Privacy (${req.user.email})`,
                        });
                        user.mfa_token = secretCode.base32
                        await user.save()
                        var image = await QRCode.toDataURL(secretCode.otpauth_url)
                        var respnse = {
                            image: image,
                            secret: secretCode.base32
                        }
                        res.send(respnse);
                    }else{
                        var verifyData = Speakeasy.totp.verify({
                            secret: user.mfa_token,
                            encoding: 'base32',
                            token: req.body.code
                        });
                        if(verifyData){
                            user.mfa = 'true'
                            await user.save()

                        const userDataResponse = userDataResponseGen(user);
                        res.status(200).json({status: "true", data: userDataResponse, message: "verified successfully!" });
                        }else{
                            res.status(400).json({status:'false',message:'Please enter valid verification code!'});
                        }
                    }
                }else{
                    user.mfa = req.body.status
                    await user.save()

                    const userDataResponse = userDataResponseGen(user);
                    res.status(200).json({status:'true',data:userDataResponse,message:'status saved successfully!'});
                }
            }else{
                // var checkUser = await User.findById(req.user.id);
                var checkUser = await User.findOne({_id: { $eq: req.user.id }});
                if(checkUser){
                    checkUser.email = req.body.email
                    checkUser.name = req.body.email
                    var saveEmail = await checkUser.save()

                    const userDataResponse = userDataResponseGen(checkUser);
                    res.send({status:true, message:'username updated successfully!', data:userDataResponse});
                }else{
                    res.status(400).json({status:'false',message:'User not found!'});
                }
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
}

exports.updatePassword = async (req, res) => {
    try{
        let rules = {
            old_password: 'required',
            password: 'required',
            c_password: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkUser = await User.findById(req.user.id);
            var checkUser = await User.findOne({_id: { $eq: req.user.id }});
            if(checkUser){
                var checkpassword = bcrypt.compareSync(req.body.old_password, checkUser.password);
                if(checkpassword){
                    const hash = bcrypt.hashSync(req.body.password, saltRounds);
                    checkUser.password = hash
                    var saveEmail = await checkUser.save()

                    const userDataResponse = userDataResponseGen(checkUser);
                    res.send({status:true, message:'Password updated successfully!', data:userDataResponse});
                }else{
                    res.status(400).json({status:'false',message:'Please enter a valid old password!'});
                }
            }else{
                res.status(400).json({status:'false',message:'User not found!'});
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
}
exports.passwordVerify = async(req, res) => {
    try{
        let rules = {
            password: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            var checkUser = await User.findOne({_id: {$eq: req.user.id }});
            if(checkUser){
                var checkpassword = bcrypt.compareSync(req.body.password, checkUser.password);
                if(checkpassword){
                    const userDataResponse = userDataResponseGen(checkUser);
                    res.send({status:'true', message:'Password checked!', data:userDataResponse});
                }else{
                    res.status(400).json({status:'false',message:'please enter valid password!'});
                }
            }else{
                res.status(400).json({status:'false',message:'User not found!'});
            }
        }else{
            res.status(400).send({status: false, message:'Password required!', data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
}
exports.checkPassword = async (req, res) => {
    try{
        let rules = {
            password: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkUser = await User.findById(req.user.id);
            var checkUser = await User.findOne({_id: {$eq: req.user.id }});
            if(checkUser){
                var checkpassword = bcrypt.compareSync(req.body.password, checkUser.password);
                if(checkpassword){
                    var response = await deleteAllAccountData(req.user.id)
                    res.send(response)
                }else{
                    res.status(400).json({status:'false',message:'Please enter a valid password!'});
                }
            }else{
                res.status(400).json({status:'false',message:'User not found!'});
            }
        }else{
            res.status(400).send({status: false, message:'Password required!', data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
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
            var settings =await Setting.find({user:{ $eq: userid}});
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



