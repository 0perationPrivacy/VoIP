const Validator = require('validatorjs');
var Setting = require('../model/setting.model');

const telnyxHelper = require('../helper/telnyx.helper')
const twilioHelper = require('../helper/twilio.helper');
const { combineURLs } = require('../helper/common.helper')

exports.twilioTwimlFallback = async (req, res) => {
    try{
        let rules = {
            url: 'required',
            setting_id: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkSetting = await Setting.findById(req.body.setting_id)
            var checkSetting = await Setting.findOne({_id: { $eq: req.body.setting_id}})
            if(checkSetting){
                var updateData = {
                    sid: checkSetting.twilio_sid,
                    token: checkSetting.twilio_token,
                    twimlsid: checkSetting.twiml_app,
                    url: combineURLs(req.body.url, '/api/call/make-call')
                }
                await twilioHelper.twimlFallbackUpdate(updateData);

                var updateData2 = {
                    sid: checkSetting.twilio_sid,
                    token: checkSetting.twilio_token,
                    numbersid: checkSetting.sid,
                    voice_url: combineURLs(req.body.url, '/api/call/incomming'),
                    sms_url: combineURLs(req.body.url, '/api/setting/receive-sms/twilio)')
                }
                await twilioHelper.numberFallbackUpdate(updateData2);

                res.send({status:true, message:'Fallback url updated!', data:checkSetting});
            }else{
                res.status(400).send({status: false, message:'Setting not found', data: []});  
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.twilioNumberFallback = async (req, res) => {
    try{
        let rules = {
            setting_id: 'required',
            voice_url: 'required',
            sms_url: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkSetting = await Setting.findById(req.body.setting_id)
            var checkSetting = await Setting.findOne({_id: { $eq: req.body.setting_id}})
            if(checkSetting){
                var updateData = {
                    sid: checkSetting.twilio_sid,
                    token: checkSetting.twilio_token,
                    numbersid: checkSetting.sid,
                    voice_url: req.body.voice_url,
                    sms_url: req.body.sms_url
                }
                await twilioHelper.numberFallbackUpdate(updateData);
                res.send({status:true, message:'Fallback url updated!', data:checkSetting});
            }else{
                res.status(400).send({status: false, message:'Setting not found', data: []});  
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.twilioTwimlGet = async (req, res) => {
    try{
        let rules = {
            setting_id: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkSetting = await Setting.findById(req.body.setting_id)
            var checkSetting = await Setting.findOne({_id: {$eq: req.body.setting_id}})
            if(checkSetting){
                var updateData = {
                    sid: checkSetting.twilio_sid,
                    token: checkSetting.twilio_token,
                    twimlsid: checkSetting.twiml_app,
                }
                var app = await twilioHelper.twimlGet(updateData);
                res.send({status:true, message:'Fallback url updated!', data:app});
            }else{
                res.status(400).send({status: false, message:'Setting not found', data: []});  
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.twilioNumberGet = async (req, res) => {
    try{
        let rules = {
            setting_id: 'required',
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkSetting = await Setting.findById(req.body.setting_id)
            var checkSetting = await Setting.findOne({_id: {$eq: req.body.setting_id}})
            if(checkSetting){
                var updateData = {
                    sid: checkSetting.twilio_sid,
                    token: checkSetting.twilio_token,
                    numbersid: checkSetting.sid
                }
                var number = await twilioHelper.numberGet(updateData);
                res.send({status:true, message:'Number setting!', data:number});
            }else{
                res.status(400).send({status: false, message:'Setting not found', data: []});  
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.telnyxMessageFallback = async (req, res) => {
    try{
        let rules = {
            url: 'required',
            setting_id: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkSetting = await Setting.findById(req.body.setting_id)
            var checkSetting = await Setting.findOne({_id: {$eq: req.body.setting_id}})
            if(checkSetting){
                var updateData = {
                    apiKey: checkSetting.api_key,
                    setting: checkSetting.setting,
                    url: combineURLs(req.body.url, '/api/setting/receive-sms/telnyx')
                }
                await telnyxHelper.messageProfileFallback(updateData);

                var updateData2 = {
                    apiKey: checkSetting.api_key,
                    twimlid: checkSetting.telnyx_twiml,
                    url: combineURLs(req.body.url, '/api/call/telnyx')
                }
                await telnyxHelper.texmlAppFalback(updateData2);

                var updateData3 = {
                    apiKey: checkSetting.api_key,
                    uuid: checkSetting.sip_id,
                    url: combineURLs(req.body.url, '/api/call/status/telnyx')
                }
                await telnyxHelper.sIPAppFallback(updateData3);

                res.send({status:true, message:'Fallback url updated!', data:checkSetting});
            }else{
                res.status(400).send({status: false, message:'Setting not found', data: []});  
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.telnyxTwimlFallback = async (req, res) => {
    try{
        let rules = {
            url: 'required',
            setting_id: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkSetting = await Setting.findById(req.body.setting_id)
            var checkSetting = await Setting.findOne({_id: {$eq: req.body.setting_id}})
            if(checkSetting){
                var updateData = {
                    apiKey: checkSetting.api_key,
                    twimlid: checkSetting.telnyx_twiml,
                    url: req.body.url
                }
                await telnyxHelper.texmlAppFalback(updateData);
                res.send({status:true, message:'Fallback url updated!', data:checkSetting});
            }else{
                res.status(400).send({status: false, message:'Setting not found', data: []});  
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.telnyxSipFallback = async (req, res) => {
    try{
        let rules = {
            url: 'required',
            setting_id: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkSetting = await Setting.findById(req.body.setting_id)
            var checkSetting = await Setting.findOne({_id: {$eq: req.body.setting_id}})
            if(checkSetting){
                var updateData = {
                    apiKey: checkSetting.api_key,
                    uuid: checkSetting.sip_id,
                    url: req.body.url
                }
                await telnyxHelper.sIPAppFallback(updateData);
                res.send({status:true, message:'Fallback url updated!', data:checkSetting});
            }else{
                res.status(400).send({status: false, message:'Setting not found', data: []});  
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.telnyxMessageGet = async (req, res) => {
    try{
        let rules = {
            setting_id: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkSetting = await Setting.findById(req.body.setting_id)
            var checkSetting = await Setting.findOne({_id: {$eq: req.body.setting_id}})
            if(checkSetting){
                var updateData = {
                    apiKey: checkSetting.api_key,
                    setting: checkSetting.setting
                }
                var messageProfile = await telnyxHelper.messageProfileGet(updateData);
                res.send({status:true, message:'Message profile data!', data:messageProfile});
            }else{
                res.status(400).send({status: false, message:'Setting not found', data: []});  
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.telnyxTwimlGet = async (req, res) => {
    try{
        let rules = {
            setting_id: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkSetting = await Setting.findById(req.body.setting_id)
            var checkSetting = await Setting.findOne({_id: {$eq: req.body.setting_id}})
            if(checkSetting){
                var updateData = {
                    apiKey: checkSetting.api_key,
                    twimlid: checkSetting.telnyx_twiml
                }
                var twiml = await telnyxHelper.texmlAppGet(updateData);
                res.send({status:true, message:'texml data!', data:twiml});
            }else{
                res.status(400).send({status: false, message:'Setting not found', data: []});  
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.telnyxSipGet = async (req, res) => {
    try{
        let rules = {
            setting_id: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            // var checkSetting = await Setting.findById(req.body.setting_id)
            var checkSetting = await Setting.findOne({_id: {$eq: req.body.setting_id}})
            if(checkSetting){
                var updateData = {
                    apiKey: checkSetting.api_key,
                    uuid: checkSetting.sip_id
                }
                var sip = await telnyxHelper.sIPAppGet(updateData);
                res.send({status:true, message:'SIP Data!', data:sip});
            }else{
                res.status(400).send({status: false, message:'Setting not found', data: []});  
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.checkCallSetting = async(req, res) => {
    try{
        if(req.body.type == 'telnyx') {
            var rules = {
                api_key: 'required',
                number: 'required',
                sid: 'required'
            };
        } else {
            var rules = {
                twilio_sid: 'required',
                twilio_token: 'required',
                twilio_number: 'required',
                sid: 'required',
            }
        }
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            if(req.body.type == 'telnyx'){
                var updateData = {
                    number_sid : req.body.sid,
                    apiKey: req.body.api_key
                }
                var numberData = await telnyxHelper.getNumberData(updateData);
                res.send({status:'true', message:'Number Data!', data:numberData});
            }else{
                var updateData = {
                    sid : req.body.twilio_sid,
                    token: req.body.twilio_token,
                    numbersid: req.body.sid
                }
                var numberData = await twilioHelper.numberGet(updateData);
                res.send({status:'true', message:'Number Data!', data:numberData});
            }
        }else{
            res.status(400).send({status: false, message:'Please enter valid data', data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

