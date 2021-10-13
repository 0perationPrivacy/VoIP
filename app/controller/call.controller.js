const Validator = require('validatorjs');
var Setting = require('../model/setting.model');
var twilio = require('twilio');

exports.create = async (req, res) => {
    let rules = {
        app_key: 'required',
        app_secret: 'required',
        twiml_app: 'required'
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        var checkSetting = await Setting.findById(req.body.setting_id)
        if(checkSetting){
            checkSetting.app_key = req.body.app_key
            checkSetting.app_secret = req.body.app_secret
            checkSetting.twiml_app = req.body.twiml_app
            var saveData = await checkSetting.save()
            if(saveData){
                res.send({status:true, message:'call setting updated!', data:checkSetting});
            }else{
                res.status(400).json({status:'false',message:'call setting not updated!'});
            }
        }
    }else{
        res.status(419).send({status: false, errors:validation.errors, data: []});
    }
};

exports.delete = async (req, res) => {
    var checkSetting = await Setting.findById(req.body.setting_id)
    if(checkemail){
        checkSetting.app_key = null
        checkSetting.app_secret = null
        checkSetting.twiml_app = null
        var saveData = await checkSetting.save()
        if(saveData){
            res.send({status:true, message:'Call setting deleted!', data:deleteEmail});
        }else{
            res.status(400).json({status:'false',message:'Call setting not deleted!'});
        }
    }
};
exports.get  = async (req, res) => {
    var checkSetting = await Setting.findById(req.body.setting_id)
    res.send({status:true, message:'get Call setting!', data:checkSetting});
};

exports.getToken = async (req, res) => {
    var setting = await Setting.findById(req.body.setting_id)
    if(setting){
        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;

        // Used when generating any kind of tokens
        const twilioAccountSid = setting.twilio_sid;
        const twilioApiKey =  setting.app_key;
        const twilioApiSecret = setting.app_secret;
        const outgoingApplicationSid = setting.twiml_app;
        const identity = req.user.id;

        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: outgoingApplicationSid,
            incomingAllow: true, // Optional: add to allow incoming calls
        });
        const token = new AccessToken(
            twilioAccountSid,
            twilioApiKey,
            twilioApiSecret,
            {identity: identity}
        );
        token.addGrant(voiceGrant);
        var tokenData = token.toJwt()
        res.send({status:true, message:'get token!', data:tokenData});
    }
}