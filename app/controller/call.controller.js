const Validator = require('validatorjs');
var Setting = require('../model/setting.model');
var Call = require('../model/message.model');
var Contact = require('../model/contact.model');
var twilio = require('twilio');
const webhookVerify = require('../helper/webhook-verify.helper');

// Legacy per-profile call-setting management for the old Twilio Voice-SDK
// fields (app_key/app_secret/twiml_app). Kept only so an account that still
// has these provisioned can be cleaned up (see user.controller.js's
// deleteAllAccountData) — new profiles are provisioned via setting.controller.js's
// create flow instead, which now sets up SIP (see getSipCredentials below).
exports.create = async (req, res) => {
    try{
        let rules = {
            type: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            var checkSetting = await Setting.findOne({_id: {$eq: req.body.setting_id}, user: {$eq: req.user.id}})
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
            }else{
                res.status(404).json({status:'false',message:'Setting not found!'});
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
        var checkSetting = await Setting.findOne({_id: {$eq: req.body.setting_id}, user: {$eq: req.user.id}})
        if(checkSetting){
            checkSetting.app_key = null
            checkSetting.app_secret = null
            checkSetting.twiml_app = null
            var saveData = await checkSetting.save()
            if(saveData){
                res.send({status:true, message:'Call setting deleted!', data:checkSetting});
            }else{
                res.status(400).json({status:'false',message:'Call setting not deleted!'});
            }
        }else{
            res.status(404).json({status:'false',message:'Setting not found!'});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something went wrong'});
    }
};
exports.get  = async (req, res) => {
    try{
        var checkSetting = await Setting.findOne({_id: {$eq: req.body.setting_id}, user: {$eq: req.user.id}})
        if(checkSetting){
            res.send({status:true, message:'get Call setting!', data:checkSetting});
        }else{
            res.status(404).json({status:'false',message:'Setting not found!'});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something went wrong'});
    }
};

// Replaces the old getToken(), which minted a Twilio Voice-SDK Access Token
// (twilio.jwt.AccessToken + VoiceGrant) — unusable without adding Twilio's
// proprietary, closed-source mobile Voice SDK, which would disqualify the app
// from F-Droid. Both providers now expose plain SIP registration credentials
// instead, consumed uniformly by the app's own Linphone-based calling engine.
exports.getSipCredentials = async (req, res) => {
    try{
        let rules = {
            setting_id: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(!validation.passes()){
            return res.status(419).send({status: false, errors:validation.errors, data: []});
        }

        var setting = await Setting.findOne({_id: {$eq: req.body.setting_id}, user: {$eq: req.user.id}})
        if(!setting){
            return res.status(404).json({status:'false', message:'Setting not found!'});
        }
        if(!setting.sip_username || !setting.sip_registrar){
            return res.status(400).json({status:'false', message:'Calling is not set up for this profile yet — open Profile Settings and save again to finish provisioning.'});
        }

        res.send({
            status: true,
            message: 'sip credentials',
            data: {
                registrar: setting.sip_registrar,
                username: setting.sip_username,
                password: setting.sip_password,
                provider: setting.type,
                // The actual purchased DID — used by the client as the
                // outbound caller ID, distinct from sip_username (just the
                // SIP credential's auth identifier). Telnyx/Twilio reject
                // outbound calls outright ("Caller Origination Number is
                // Invalid") if the caller ID isn't a real owned number.
                number: setting.number,
            },
        });
    }catch(error){
        res.status(500).send({status:'false', message:'something wrong fetching call credentials!', data:[]});
    }
};

// Recent calls across all contacts for a profile — a phone app's "Recents"
// tab, distinct from messageList's per-contact thread view.
exports.history = async (req, res) => {
    try{
        let rules = {
            setting_id: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(!validation.passes()){
            return res.status(419).send({status: false, errors:validation.errors, data: []});
        }

        var setting = await Setting.findOne({_id: {$eq: req.body.setting_id}, user: {$eq: req.user.id}})
        if(!setting){
            return res.status(404).json({status:'false', message:'Setting not found!'});
        }

        var calls = await Call.find({user: {$eq: req.user.id}, setting: {$eq: setting._id}, datatype: {$eq: 'call'}})
            .sort({created_at: -1})
            .limit(100)
            .populate('contact');

        res.send({status:true, message:'call history', data: calls});
    }catch(error){
        res.status(400).json({status:'false', message:'something went wrong'});
    }
};

exports.status = async (req, res) => {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    try{
        var call = await Call.findOne({sid: { $eq: req.body.CallSid}})
        if(call){
            var settingCheck = await Setting.findOne({number:{$eq: call.telnyx_number}})
            if(settingCheck && !webhookVerify.verifyTwilioSignature(req, settingCheck.twilio_token)){
                return res.status(401).json({status:'false', message:'invalid webhook signature'});
            }

            call.duration = req.body.CallDuration
            call.status = req.body.CallStatus
            await call.save()
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
                        if(settingCheck && !webhookVerify.verifyTelnyxSignature(req, settingCheck.telnyx_public_key)){
                            return res.status(401).json({status:'false', message:'invalid webhook signature'});
                        }
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
                            var settingCheck2 = await Setting.findOne({number:{ $eq: call.telnyx_number}})
                            if(settingCheck2 && !webhookVerify.verifyTelnyxSignature(req, settingCheck2.telnyx_public_key)){
                                return res.status(401).json({status:'false', message:'invalid webhook signature'});
                            }
                            var difference = (new Date(event.payload.end_time) - new Date(event.payload.start_time)) / 1000;
                            call.duration = Math.ceil(difference)
                            call.status = 'completed'
                            await call.save()
                            if(settingCheck2){
                                global.io.to(settingCheck2.user.toString()).emit('user_message',{message: 'call', number:call.number});
                            }
                        }
                    break;
            }
        } else {
            var call = await Call.findOne({sid: { $eq: req.body.CallSid}})
            if(call){
                var settingCheck3 = await Setting.findOne({number: { $eq: call.telnyx_number}})
                if(settingCheck3 && !webhookVerify.verifyTelnyxSignature(req, settingCheck3.telnyx_public_key)){
                    return res.status(401).json({status:'false', message:'invalid webhook signature'});
                }
                call.duration = req.body.CallDuration
                call.status = req.body.CallStatus
                await call.save()
                if(settingCheck3){
                    global.io.to(settingCheck3.user.toString()).emit('user_message',{message: 'call', number:call.number});
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

// Twilio's SIP-dial equivalent of Telnyx's `telnyx` handler below: an inbound
// PSTN call to the number is routed by TwiML to the SIP Domain the client
// registered against (see twilio.helper.js's createSipDomain/createSipCredential).
exports.twilioSipInbound = async (req, res) => {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    try{
        var settingCheck = await Setting.findOne({number: {$eq: req.body.To}})
        if(settingCheck && !webhookVerify.verifyTwilioSignature(req, settingCheck.twilio_token)){
            return res.status(401).json({status:'false', message:'invalid webhook signature'});
        }
        if(settingCheck && settingCheck.sip_username && settingCheck.sip_registrar){
            const dial = response.dial();
            dial.sip(`sip:${settingCheck.sip_username}@${settingCheck.sip_registrar}`);

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
        console.log(error)
    }
    res.set('Content-Type', 'text/xml');
    res.send(response.toString());
};

exports.telnyx = async (req, res) => {
    try{
        var settingCheck = await Setting.findOne({number: { $eq: req.body.To}})
        if(settingCheck && !webhookVerify.verifyTelnyxSignature(req, settingCheck.telnyx_public_key)){
            return res.status(401).json({status:'false', message:'invalid webhook signature'});
        }
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
        }else{
            var callXml = `<?xml version="1.0" encoding="UTF-8"?>
                        <Response>
                        </Response>`;
        }
    }catch(error){
        var callXml = `<?xml version="1.0" encoding="UTF-8"?>
                        <Response>
                        </Response>`;
    }
    res.set('Content-Type', 'text/xml');
    res.send(callXml);
};
