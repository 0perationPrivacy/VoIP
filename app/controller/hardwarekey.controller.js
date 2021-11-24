const U2F = require("u2f");
var baseUrl = process.env.BASE_URL.trim()
const APP_ID = baseUrl.substr(0, baseUrl.length - 1);
var Hardwarekey = require('../model/hardwarekey.model');
var User = require('../model/user.model');
exports.registerSession = async (req, res) => {
    var session = U2F.request(APP_ID);
    console.log('====================================registerSession=====================')
    console.log(session)
    console.log('====================================/registerSession=====================')
    res.send(session); 
}
exports.register = async (req, res) => {
    console.log('register key')
    console.log(req.body.result)
    /* var hardwarekey = Hardwarekey.findOne({registeredKeys: req.body.result.registeredKeys})
    if(!hardwarekey) { */
        var registration = U2F.checkRegistration(req.body.result, req.body.registerResponse);
        console.log('====================================registration response=====================')
        console.log(registration)
        console.log('====================================/registration response=====================')
        if(!registration.successful) {
            return res.status(400).send({ message: "The hardware key has not been registered" });
        }
    
        await User.updateOne({_id:{$eq:req.user.id}},{hardwarekey:'true'})
        var keyFound = await Hardwarekey.findOne({user: {$eq: req.user.id}})
        if(keyFound){
            keyFound.keyhandle = registration.keyHandle;
            keyFound.publickey = registration.publicKey;
            keyFound.title = req.body.title,
            keyFound.registeredKeys = req.body.result.registeredKeys
            await keyFound.save()
        }else{
            var data = {
                keyhandle: registration.keyHandle,
                publickey: registration.publicKey,
                user: req.user.id,
                title:req.body.title,
                registeredKeys: req.body.result.registeredKeys
            }
            await Hardwarekey.create(data)
        }
        res.send({ message: "The hardware key has been registered"});
    /* }else{
        res.send({ message: "The hardware key has not been registered (unique)"})
    } */
}

exports.loginSession = async (req, res) => {
    var hardwarekey = await Hardwarekey.findOne({user: {$eq: req.body.user}})
    /*if(hardwarekey){
        var keyHandle = hardwarekey.keyhandle
    }else{
        var keyHandle = 'demo'
    }*/
    var keyHandle = 'demo'
    var loginSession = U2F.request(APP_ID, keyHandle)
    console.log('====================================login session=====================')
    console.log(loginSession)
    console.log('====================================/login session=====================')
    res.send(loginSession)
}

exports.login = async (req, res) => {
    var hardwarekey = await Hardwarekey.findOne({user: {$eq: req.body.user}})
    console.log('====================================/database=====================')
    console.log(hardwarekey)
    console.log('====================================/database=====================')
    var success = U2F.checkSignature(req.body.result, req.body.loginResponse, hardwarekey.publickey);
    if(!success.successful) {
        return res.status(400).send({ message: "Unauthorized access" });
    }
    console.log('====================================login success=====================')
    console.log(success)
    console.log('====================================/login success=====================')
    res.send(success);
}