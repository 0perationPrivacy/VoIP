const U2F = require("u2f");
const base64url = require('base64url');
var baseUrl = process.env.BASE_URL.trim()
const APP_ID = baseUrl.substr(0, baseUrl.length - 1);
var Hardwarekey = require('../model/hardwarekey.model');
var User = require('../model/user.model');
var Handel = require('../model/handel.model');

var sessData = {};
exports.registerSession = async (req, res) => {
    console.log(req.user);
    var payload = req.body;
    var userexists = await userExists(payload.title, req.user.id);
    var getuser = await Hardwarekey.findOne({title: payload.title, user: req.user.id, id: sessData.id});
    // console.log(getuser)
    if(userexists && getuser && getuser.registrationComplete){
        res.status(400).send({'status': 'false', 'message': 'Title already exists!'});
    }else{
        await deleteUser(payload.title, req.user.id);
        payload.id = base64url.encode(await generateRandomBuffer(32));
        payload.credentials = [];
        var user = await addUser(payload.title, payload, req.user.id);
        console.log(user);
        sessData = req.session;
        sessData.title = payload.title;
        sessData.user = req.user.id;
        sessData.id = payload.id;
        res.send({'status': 'startFIDOEnrolment'});
    }
}
exports.register = async (req, res) => {
    if(!sessData.title){
        res.status(400).send({'status': 'failed', 'message': 'Access denied!'});
        return;
    }
    let user = await getUser(sessData.title, sessData.user);
    var userData = await User.findOne({_id: sessData.user});
    sessData.challenge = base64url.encode(await generateRandomBuffer(32));
    var publicKey = {
        challenge: sessData.challenge,
        'rp': {
            'name': 'Operation Privacy'
        },
        'user': {
            'id': user.id,
            'name': userData.email,
            'displayName': userData.name
        },
        'pubKeyCredParams': [
            { 'type': 'public-key', 'alg': -7   },
            { 'type': 'public-key', 'alg': -257 },
        ],
        'attestation': 'direct'
    };
    if(req.body.options) {
        var options = req.body.options
        if(!publicKey.authenticatorSelection)
            publicKey.authenticatorSelection = {};

        if(options.attestation)
            publicKey.attestation = options.attestation;

        if(options.rpId)
            publicKey.rp.id = options.rpId;

        if(options.uv)
            publicKey.authenticatorSelection.userVerification = 'required';
    }

    if(sessData.rk) {
        if(!publicKey.authenticatorSelection)
            publicKey.authenticatorSelection = {};

        publicKey.authenticatorSelection.requireResidentKey = true;
    }
    var hardwarekey = await Hardwarekey.find({user: req.user.id, registrationComplete:true});
    res.send({publicKey:publicKey, hardwarekey:hardwarekey});
}

exports.verify = async (req, res) => {
    var payload = req.body;

    if(!sessData.title){
        return res.status(400).send({'status': 'false', message:'Access denied!', 'errorMessage': 'Access denied!'});
    }
    // var checkKey = await Hardwarekey.findOne({user: sessData.user, aaguid: payload.aaguid});
    // if(checkKey){
    //     var handel = await Handel.deleteOne({user: sessData.user, username : sessData.title});
    //     console.log(handel);
    //     sessData = {};
    //     return res.status(400).json({status:'false',message:'Harware key already exits!'}); 
    // }
    let user = await getUser(sessData.title, sessData.user);
    var cr = user.credentials;
    cr.push(payload.id);
    var updateData = {
        registrationComplete: true,
        credentials: cr, 
        aaguid: payload.aaguid
    };
    let updateuser = await updateUser(sessData.title, sessData.user, updateData);
    if(updateuser.registrationComplete == true){
        await User.updateOne({_id: sessData.user}, {hardwarekey: 'true'});
    }
    console.log(updateuser)
    sessData = {};
    res.send({'status': 'ok'});
};

exports.loginSession = async (req, res) => {
    var payload = req.body
    var userexit = await userExists(payload.title, payload.user)
    if(!userexit){
        res.status(400).send({status: 'error', message: 'Wrong username or password!'});
        return;
    }else{
        sessData.title = payload.title;
        sessData.user = payload.user;
    }
    sessData.challenge = base64url.encode(await generateRandomBuffer(32));
    var publicKey = {
        'challenge': sessData.challenge,
        'status': 'ok'
    }
    let user = await getUser(sessData.title, sessData.user);
    console.log(user);
    publicKey.allowCredentials = user.credentials.map((credId) => {
        return { 'type': 'public-key', 'id': credId }
    })
    
    if(sessData.rk) {
        delete publicKey.allowCredentials
    }

    if(sessData.uv) {
        publicKey.userVerification = 'required';
    }
    res.send(publicKey);
}

function preformatGetAssertReq (getAssert) {
    getAssert.challenge = base64url.decode(getAssert.challenge)
    if (getAssert.allowCredentials) {
      for (let allowCred of getAssert.allowCredentials) {
        allowCred.id = base64url.decode(allowCred.id)
      }
    }
    return getAssert
  }

exports.login = async (req, res) => {
    var payload = req.body
    var userwhere = sessData.user
    var checkHandel = await getUserByUserHandle(payload.response.userHandle, userwhere);
    if(!sessData.title && !checkHandel){
        res.status(400).send({'status': 'false', message: 'Something is wrong!'});
    }else{
        sessData = {};
        res.send({'status': 'true'});
    }
}

exports.getKey = async (req, res) => {
    var harewarekeys = await Hardwarekey.find({user:req.user.id, registrationComplete: true});
    res.send({status:'true', message:'hardware key list!', data:harewarekeys});
}
exports.delete = async (req, res) => {
    var harewarekey = await Hardwarekey.findOne({_id: req.body.id});
    if(harewarekey){
        await Handel.deleteOne({username: harewarekey.title, user: harewarekey.user});
        await harewarekey.delete()
    }
    var harewarekeys = await Hardwarekey.findOne({user:req.user.id, registrationComplete: true});
    if(!harewarekeys){
        await User.updateOne({_id: req.user.id}, {hardwarekey: 'false'});
    }
    res.send({status:'true', message:'hardware key deleted!', data:[]});
}

async function getUserByUserHandle(userHandle, userwhere) {
    try {
        var user = await Handel.findOne({id:userHandle});
        if(user){
            userwhere.title = user.username;
            let userJSON = Hardwarekey.findOne(userwhere);
            if(!userJSON)
                throw new Error(`Username "${user.username}" does not exist!`);

            return userJSON;
        }else{
            return false;
        }
    } catch(e) {
        return {}
    }
};

async function generateRandomBuffer(length) {
    if(!length)
        length = 32;

    //var randomBuff = new Uint32Array(length);
    let randomBuff = new Uint8Array(length);
    var getRandomValues = require('get-random-values');
    getRandomValues(randomBuff);
    //var crypto = require('crypto');
    //console.log(crypto.getRandomValues(a));
    return randomBuff
};

async function addUser(username, struct, user){
    var handel = await Handel.create({id:struct.id, username:username, user:user});
    sessData.handelId = handel._id
    struct.user = user
    await Hardwarekey.create(struct);
    return true;
}

async function deleteUser(title, user){
    await Hardwarekey.deleteOne({title: title, user: user});
    return true;
}

async function userExists(title, user) {
    var user = await Hardwarekey.findOne({title: title, user: user});
    if(!user){
        return false;
    }
    return true;
};

async function getUser(title, user){
    var user = await Hardwarekey.findOne({title: title, user: user});
    if(user){
        return user;
    }else{
        return false;
    }
};

async function updateUser(title, user, struct){
    console.log("=====================================================")
    console.log("session title => "+title)
    console.log("session user => "+user)
    console.log(struct)
    var user = await Hardwarekey.findOne({title: title, user: user});
    if(user){
        user.registrationComplete = struct.registrationComplete;
        user.credentials = struct.credentials;
        user.aaguid = struct.aaguid;
        await user.save();
        // var user2 = await Hardwarekey.updateOne({ title: title, user: user}, struct);
        return user;
    }else{
        return false;
    }
};

async function generateRandomBuffer(length) {
    if(!length)
        length = 32;

    //var randomBuff = new Uint32Array(length);
    let randomBuff = new Uint8Array(length);
    var getRandomValues = require('get-random-values');
    getRandomValues(randomBuff);
    //var crypto = require('crypto');
    //console.log(crypto.getRandomValues(a));
    return randomBuff
};
