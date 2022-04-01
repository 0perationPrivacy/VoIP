const Validator = require('validatorjs');
var Setting = require('../model/setting.model');
var Call = require('../model/message.model');
var Contact = require('../model/contact.model');
var twilio = require('twilio');

exports.create = async (req, res) => {
    try{
        let rules = {
            type: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkSetting = await Setting.findById(req.body.setting_id)
            var checkSetting = await Setting.findOne({_id : {$eq: req.body.setting_id}})
            if(checkSetting){
                if(checkSetting.type === 'twilio'){
                    checkSetting.app_key = req.body.app_key
                    checkSetting.app_secret = req.body.app_secret
                    checkSetting.twiml_app = req.body.twiml_app
                }else{
                    checkSetting.sip_username = req.body.sip_username
                    checkSetting.sip_password = req.body.sip_password
                }
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
    }catch(error){
        res.status(400).json({status:'false',message:'something went wrong'});
    }
};

exports.delete = async (req, res) => {
    try{
        // var checkSetting = await Setting.findById(req.body.setting_id)
        var checkSetting = await Setting.findOne({_id : {$eq: req.body.setting_id}})
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
    }catch(error){
        res.status(400).json({status:'false',message:'something went wrong'});
    }
};
exports.get  = async (req, res) => {
    try{
        // var checkSetting = await Setting.findById(req.body.setting_id)
        var checkSetting = await Setting.findOne({_id : {$eq: req.body.setting_id}})
        res.send({status:true, message:'get Call setting!', data:checkSetting});
    }catch(error){
        res.status(400).json({status:'false',message:'something went wrong'});
    }
};

exports.getToken = async (req, res) => {
    try{
        // var setting = await Setting.findById(req.body.setting_id)
        var setting = await Setting.findOne({_id : {$eq: req.body.setting_id}})
       // console.log(setting)
        if(setting){
            if (setting.type === 'twilio') {
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
                res.send({status:true, message:'get token!', data:{token: tokenData, type: setting.type}});
            }else{
                res.send({status:true, message:'get token!', data:{setting: setting, type: setting.type}});
            }
            
        }
    }catch(error){
        console.log(error)
        res.status(500).send({status:true,error:true, errorData:'something wrong in get token!', data:[] });
    }
};

exports.makeCall = async (req, res) => {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    try {
        // var settingCheck = await Setting.findOne({number:req.body.twilio_number})
        var checkSetting = await Setting.findOne({number : {$eq: req.body.twilio_number}})
        if(checkSetting){
            var dial = response.dial({
                callerId: req.body.twilio_number
            });

            var phoneNumber = req.body.number.trim().replace("+", "")
            var stringLen = phoneNumber.length
            if(stringLen > 10){
                phoneNumber = `+${phoneNumber}`
            }else if(stringLen == 10){
                phoneNumber = `+1${phoneNumber}`
            }
            var updateCall = {
                sid: req.body.CallSid,
                user: checkSetting.user,
                datatype: 'call',
                type: 'send',
                number: phoneNumber,
                telnyx_number: req.body.twilio_number,
                setting: checkSetting._id,
                isview: 'true'
            }
            var contact = await Contact.findOne({user: { $eq: checkSetting.user}, number: {$eq: phoneNumber}});
            if(contact){
                updateCall.contact = contact._id
            }
            await Call.create(updateCall);
            dial.number(phoneNumber);
            res.set('Content-Type', 'text/xml');
            return res.send(response.toString());
        }
    } catch(error) {
        console.log(error)
        res.set('Content-Type', 'text/xml');
        return res.send(response.toString());
    }
    
};

exports.status = async (req, res) => {
    
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    try{
        var call = await Call.findOne({sid: { $eq: req.body.CallSid}})
        if(call){
            call.duration = req.body.CallDuration
            call.status = req.body.CallStatus
            await call.save()
            var settingCheck = await Setting.findOne({number:{$eq: call.twilio_number}})
            if(settingCheck){
                global.io.to(settingCheck.user.toString()).emit('user_message',{message: 'call', number:call.number});
            }
        }
    }catch(error){

    }
    res.set('Content-Type', 'text/xml');
    res.send(response.toString());
};
exports.statusTelnyx = async (req, res) => {
    try{
        if(req.body.CallSid === undefined){
            var event = req.body.data
            switch (event.event_type) {
                case 'call.initiated':
                    if(event.payload.direction === 'outgoing'){
                        var settingCheck = await Setting.findOne({number:{ $eq: event.payload.from}})
                        if(settingCheck){
                            var updateCall = {
                                sid: event.payload.call_session_id,
                                user: settingCheck.user,
                                datatype: 'call',
                                type: 'send',
                                number: event.payload.to,
                                telnyx_number: event.payload.from,
                                setting: settingCheck._id,
                                isview: 'true'
                            }
                            var contact = await Contact.findOne({user: { $eq: settingCheck.user}, number: { $eq: event.payload.to}});
                            if(contact){
                                updateCall.contact = contact._id
                            }
                            Call.create(updateCall);
                        }
                    }
                    break;
                case 'call.hangup':
                        var call = await Call.findOne({sid: {$eq: event.payload.call_session_id}})
                        if(call){
                            var difference = (new Date(event.payload.end_time) - new Date(event.payload.start_time)) / 1000;
                            call.duration = Math.ceil(difference)
                            call.status = 'completed'
                            await call.save()
                            var settingCheck = await Setting.findOne({number:{ $eq: call.twilio_number}})
                            if(settingCheck){
                                global.io.to(settingCheck.user.toString()).emit('user_message',{message: 'call', number:call.number});
                            }
                        }
                    break;
            }
        } else {
            var call = await Call.findOne({sid: { $eq: req.body.CallSid}})
            if(call){
                call.duration = req.body.CallDuration
                call.status = req.body.CallStatus
                await call.save()
                var settingCheck = await Setting.findOne({number: { $eq: call.twilio_number}})
                if(settingCheck){
                    global.io.to(settingCheck.user.toString()).emit('user_message',{message: 'call', number:call.number});
                }
            }
        }
    }catch(error){

    }
    var callXml = `<?xml version="1.0" encoding="UTF-8"?>
                    <Response>
                    </Response>`;
    res.set('Content-Type', 'text/xml');
    res.send(callXml);
};

exports.incomming = async (req, res) => {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    try{
        var settingCheck = await Setting.findOne({number: {$eq: req.body.To}})
        if(settingCheck){
            const dial = response.dial();
            const client = dial.client();
            client.identity(`${settingCheck.user}`);
            var updateCall = {
                sid: req.body.CallSid,
                user: settingCheck.user,
                datatype: 'call',
                type: 'receive',
                number: req.body.From,
                telnyx_number: req.body.To,
                setting: settingCheck._id,
                isview: 'false'
            }
            var contact = await Contact.findOne({user: { $eq: settingCheck.user}, number: {$eq: req.body.From}});
            if(contact){
                updateCall.contact = contact._id
            }
            Call.create(updateCall);
        }
    }catch(error){

    }
    res.set('Content-Type', 'text/xml');
    res.send(response.toString());
};

exports.telnyx = async (req, res) => {
    try{
        var settingCheck = await Setting.findOne({number: { $eq: req.body.To}})
        if(settingCheck && settingCheck.sip_username){
            var callXml = `<?xml version="1.0" encoding="UTF-8"?>
                        <Response>
                        <Dial>
                            <Sip>sip:${settingCheck.sip_username}@sip.telnyx.com</Sip>
                        </Dial>
                        </Response>`;
            var updateCall = {
                sid: req.body.CallSid,
                user: settingCheck.user,
                datatype: 'call',
                type: 'receive',
                number: req.body.From,
                telnyx_number: req.body.To,
                setting: settingCheck._id,
                isview: 'false'
            }
            var contact = await Contact.findOne({user: { $eq: settingCheck.user}, number: {$eq: req.body.From}});
            if(contact){
                updateCall.contact = contact._id
            }
            Call.create(updateCall);
        }
    }catch(error){
        var callXml = `<?xml version="1.0" encoding="UTF-8"?>
                        <Response>
                        </Response>`;
    }
    res.set('Content-Type', 'text/xml');
    res.send(callXml);
};