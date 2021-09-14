const Validator = require('validatorjs');
const telnyx = require('telnyx');
const moment = require('moment')
var mongoose = require('mongoose');
const twilio = require('twilio');
const path = require("path")
const http = require('https');
const fs = require('fs');
const request = require('request');
const crypto = require('crypto');

var Setting = require('../model/setting.model');
var User = require('../model/user.model');
var Message = require('../model/message.model');
var Number = require('../model/number.model');
const Numbers = require('twilio/lib/rest/Numbers');
const { exists } = require('../model/setting.model');
exports.deleteKey = async (req, res) => {
    var settingCheck = await Setting.findOne({user:req.body.user,_id:req.body.profile_id})
    if(settingCheck.type === 'telnyx'){
        var Telynx = telnyx(settingCheck.api_key)  
        await Telynx.phoneNumbers.updateMessagingSettings(
            settingCheck.sid,
            { messaging_profile_id: "" }
        ); 
        const { data: messagingProfiles } = await Telynx.messagingProfiles.retrieve(settingCheck.setting);
        await messagingProfiles.del();
    }else{
        const client = twilio(settingCheck.twilio_sid, settingCheck.twilio_token)
        client.incomingPhoneNumbers(settingCheck.sid)
        .update({
            smsUrl: ''
        })
    }
    settingCheck.api_key = null;
    settingCheck.number = null;
    settingCheck.setting = null;
    settingCheck.sid = null;
    settingCheck.twilio_sid = null;
    settingCheck.twilio_token = null;
    settingCheck.save();
    if(settingCheck){
        res.send({status:true, message:'Setting Deleted!', data:settingCheck});
    }else{
        res.status(400).json({status:'false',message:'Setting not deleted!'});
    }
};
exports.create = async (req, res) => {
    try {
        if(req.body.type == 'telnyx'){
            let rules = {
                api_key: 'required',
                number: 'required',
                user: 'required',
                profile: 'required'
            };
            let validation = new Validator(req.body, rules);
            if(validation.passes()){
                var user = await User.findOne({_id: req.body.user});
                if(user){
                    var firstSettingCheck = await Setting.findOne({_id: { $not: { $eq: req.body.setting } } , number:req.body.number})
                    if(firstSettingCheck){
                        res.status(400).json({status:'false',message:'Number already assigned to another profile!'});
                    }else{
                        var settingStore = false;
                        var settingCheck = await Setting.findOne({user:req.body.user, _id:req.body.setting})
                        if(settingCheck){
                            settingCheck.api_key = req.body.api_key;
                            settingCheck.number = req.body.number;
                            settingCheck.sid = req.body.sid;
                            settingCheck.profile = req.body.profile;
                            settingCheck.type = 'telnyx';
                            settingCheck.save();
                            var save = settingCheck;
                            if(!settingCheck.setting){
                                settingStore = true;
                            }
                        }else{
                            var telynxData = {
                                api_key: req.body.api_key,
                                sid : req.body.sid,
                                number : req.body.number,
                                user:req.body.user,
                                profile: req.body.profile,
                                type: 'telnyx'
                            }
                            var save = await Setting.create(telynxData);
                            settingStore = true;
                            var settingCheck = await Setting.findOne({user:req.body.user, _id:req.body.setting})
                        }
                        if(save){
                            if(settingStore){
                                    var saveTelnyxSetting = await telnyx(req.body.api_key).messagingProfiles.create(
                                        {"name":"VoIP sms Web Application","enabled":true, "webhook_url" : process.env.BASE_URL.trim() + "api/setting/receive-sms/"+req.body.type}
                                    )
                                    var telnyxSetting = saveTelnyxSetting.data.id;
                            }else{
                                await telnyx(req.body.api_key).messagingProfiles.update(settingCheck.setting, {"webhook_url":process.env.BASE_URL.trim()+"api/setting/receive-sms/"+req.body.type});
                                var telnyxSetting = settingCheck.setting;
                            }
                            settingCheck.setting = telnyxSetting;
                            settingCheck.save();
                            await telnyx(req.body.api_key).phoneNumbers.updateMessagingSettings(
                                    req.body.sid,
                                    { messaging_profile_id: telnyxSetting }
                                );
                            res.send({status:true, message:'setting saved!', data:settingCheck});
                        }else{
                            res.status(400).json({status:'false',message:'Setting not saved!'});
                        }

                    }
                }else{
                    res.status(400).json({status:'false',message:'Something is wrong!'});
                }
            }else{
                let rules2 = {
                    profile: 'required'
                };
                let validation2 = new Validator(req.body, rules2);
                if(validation2.passes()){
                    var user = await User.findOne({_id: req.body.user});
                    if(user){
                        var firstSettingCheck = await Setting.findOne({_id:req.body.setting})
                        if(firstSettingCheck){
                            firstSettingCheck.profile = req.body.profile
                            firstSettingCheck.save()
                            res.send({status:true, message:'setting saved!', data:settingCheck});
                        }else{
                            res.status(400).json({status:'false',message:'setting not found!'});
                        }
                    }else{
                        res.status(400).json({status:'false',message:'Something is wrong!'});
                    }
                }else{
                    res.status(419).send({status: false, errors:validation2.errors, data: []});
                }    
            }
        }else{
            //twilio setting
            let rules = {
                twilio_sid: 'required',
                twilio_token: 'required',
                twilio_number: 'required',
                sid: 'required',
                user: 'required',
                profile: 'required'
            };
            let validation = new Validator(req.body, rules);
            if(validation.passes()){
                var user = await User.findOne({_id: req.body.user});
                if(user){
                    var firstSettingCheck = await Setting.findOne({_id: { $not: { $eq: req.body.setting } } , number:req.body.twilio_number})
                    if(firstSettingCheck){
                        res.status(400).json({status:'false',message:'Number already assigned to another profile!'});
                    }else{
                        var settingStore = false;
                        var settingCheck = await Setting.findOne({user:req.body.user, _id:req.body.setting})
                        if(settingCheck){
                            settingCheck.api_key = null;
                            settingCheck.number = req.body.twilio_number;
                            settingCheck.sid = req.body.sid;
                            settingCheck.twilio_sid = req.body.twilio_sid;
                            settingCheck.twilio_token = req.body.twilio_token;
                            settingCheck.profile = req.body.profile;
                            settingCheck.type = 'twilio';
                            var save = settingCheck.save();
                        }else{
                            var twilioData = {
                                number: req.body.twilio_number,
                                sid : req.body.sid,
                                twilio_sid : req.body.twilio_sid,
                                twilio_token: req.body.twilio_token,
                                user:req.body.user,
                                type: 'twilio',
                                profile: req.body.profile
                            }
                            var save = await Setting.create(twilioData);
                        }
                    }
                if(save){
                    const client = new twilio(req.body.twilio_sid, req.body.twilio_token);
                    client.incomingPhoneNumbers(req.body.sid)
                    .update({smsUrl: process.env.BASE_URL.trim()+"api/setting/receive-sms/"+req.body.type})
                    res.send({status:true, message:'setting saved!', data:settingCheck});
                }else{
                    res.status(400).json({status:'false',message:'Setting not saved!'});
                }
                }else{
                    res.status(400).json({status:'false',message:'Something is wrong!'});
                }

            }else{
                let rules2 = {
                    profile: 'required'
                };
                let validation2 = new Validator(req.body, rules2);
                if(validation2.passes()){
                    var user = await User.findOne({_id: req.body.user});
                    if(user){
                        var firstSettingCheck = await Setting.findOne({_id:req.body.setting})
                        if(firstSettingCheck){
                            firstSettingCheck.profile = req.body.profile
                            firstSettingCheck.save()
                            res.send({status:true, message:'setting saved!', data:settingCheck});
                        }else{
                            res.status(400).json({status:'false',message:'setting not found!'});
                        }
                    }else{
                        res.status(400).json({status:'false',message:'Something is wrong!'});
                    }
                }else{
                    res.status(419).send({status: false, errors:validation2.errors, data: []});
                }  
                // res.status(419).send({status: false, errors:validation.errors, data: []});
            }
        }  
    } catch (error) {
        res.status(400).send({status: false, errors:error.message, data: []});
    } 
};
exports.getSetting = async (req, res) => {
    try {
        let rules = {
            user: 'required',
            setting: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            var settingCheck = await Setting.findOne({user:req.body.user,_id:req.body.setting})
            if(settingCheck){
                res.send({status:true, message:'setting data!', data:settingCheck});
            }else{
                res.status(400).json({status:'false',message:'Setting not found!'});
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }  
    } catch (error) {
        res.status(400).send({status: false, errors:error.message, data: []});
    } 
};

exports.getNumber = async (req, res) => {
    try {
        if(req.body.type == 'telnyx'){
            let rules = {
                api_key: 'required',
            };
            let validation = new Validator(req.body, rules);
            if(validation.passes()){
                var phoneNumber = await telnyx(req.body.api_key).phoneNumbers.list();
                res.send({status:true, message:'number list!', data:phoneNumber});
            }else{
                res.status(419).send({status: false, errors:validation.errors, data: []});  
            }
        }else if(req.body.type == 'twilio'){
            let rules = {
                twilio_sid: 'required',
                twilio_token: 'required'
            };
            let validation = new Validator(req.body, rules);
            if(validation.passes()){
                const client = new twilio(req.body.twilio_sid, req.body.twilio_token);
                const numbers = await client.incomingPhoneNumbers.list()
                res.send({status:true, message:'number list!', data:numbers});
            }else{
                res.status(419).send({status: false, errors:validation.errors, data: []});  
            }
        }
      } catch (error) {
        res.status(400).send({status: false, errors:error.message, data: []});
      } 
};

exports.sendSms = async (req, res) => {
    try {
        let rules = {
            user: 'required',
            numbers : 'required', 
            profile: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            var settingCheck = await Setting.findOne({user:req.body.user, _id:req.body.profile._id})
            if(settingCheck){
                if(settingCheck.type == 'twilio'){
                    const client = require('twilio')(settingCheck.twilio_sid, settingCheck.twilio_token);
                    var arrMessageData = [];
                    for(var i=0; i < req.body.numbers.length; i++ ) {
                        var toNumber = req.body.numbers[i];
                        toNumber = toNumber.replace(/\s/g,'').replace(/\-/g,'').replace(/\)/g,'').replace(/\(/g,'')
                        var sendNumber = toNumber.length
                        if(sendNumber <= 10){
                            toNumber = `+1${toNumber}`;
                        }
                        var twilioParams = {
                            body: req.body.message, 
                            from: settingCheck.number, 
                            to: toNumber,
                            statusCallback: `${process.env.BASE_URL.trim()}api/setting/sms-status/twilio`,
                        };
                        if(req.body.media.length > 0){
                            twilioParams.mediaUrl = req.body.media
                        }
                        //media
                        var sendSms = await client.messages.create(twilioParams)
                        if(sendSms.sid !== undefined){
                            var messageData = {
                                sid: sendSms.sid,
                                user: req.body.user,
                                number: toNumber,
                                telnyx_number: settingCheck.number,
                                type: 'send',
                                status: 'sent',
                                isview: 'true',
                                message: req.body.message,
                                setting: settingCheck._id
                            };
                            if(req.body.media.length > 0){
                                messageData.media = JSON.stringify(req.body.media)
                            }
                            arrMessageData.push(messageData);
                        } 
                    }
                }else{
                    const Telnyx = telnyx(settingCheck.api_key);
                    var arrMessageData = [];
                    for(var i=0; i < req.body.numbers.length; i++ ) {
                        //var sendNumber = req.body.numbers[i].length
                        var toNumber = req.body.numbers[i];
                        toNumber = toNumber.replace(/\s/g,'').replace(/\-/g,'').replace(/\)/g,'').replace(/\(/g,'')
                        var sendNumber = toNumber.length
                        if(sendNumber <= 10){
                            toNumber = `+1${toNumber}`;
                        }
                        var telnyxParams = {
                            'from': settingCheck.number, // Your Telnyx number
                            'to': toNumber,
                            'text': req.body.message,
                            'webhook_url' : `${process.env.BASE_URL.trim()}api/setting/sms-status/telnyx`
                        }
                        if(req.body.media.length > 0){
                            telnyxParams.media_urls = req.body.media
                        }
                        var sendSms = await Telnyx.messages.create(telnyxParams);
                        if(sendSms.data.id !== undefined){
                            var messageData = {
                                sid: sendSms.data.id,
                                user: req.body.user,
                                number: toNumber,
                                telnyx_number: settingCheck.number,
                                type: 'send',
                                status: 'sent',
                                isview: 'true',
                                message: req.body.message,
                                setting: settingCheck._id
                            };
                            if(req.body.media.length > 0){
                                messageData.media = JSON.stringify(req.body.media)
                            }
                            //media
                            arrMessageData.push(messageData);
                        } 
                    }
                }
                var messages = await Message.create(arrMessageData);
                if(messages){
                    res.send({status:true, message:'Message sent successfully!', data:messages});
                }else{
                    res.status(400).json({status:'false',message:'Message not sent!'}); 
                }
            }else{
                res.status(400).json({status:'false',message:'Message not sent!'});     
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }  
    } catch (error) {
        res.status(400).send({status: false, errors:error.message, data: []});
    } 
};

exports.receiveSms = async (req, res) => {
    var media = [];
    if(req.params.type !== undefined && req.params.type == 'twilio'){
        var messageText = req.body.Body;
        var toNumber = req.body.To;
        var fromnumber = req.body.From;
        var sid = req.body.SmsSid;
        if(req.body.NumMedia > 0){
            var fackMedia = [];
            for(var i=0; i < req.body.NumMedia; i++){
                var tMedia = `MediaUrl${i}`;
                const url = req.body[tMedia]; // link to file you want to download
                //var name = `uploads/${Date.now()}${req.body.SmsSid}.png`;
                var name = crypto.randomBytes(24).toString('hex');
                var date = moment(new Date()).format('MMDDYYYY');
                try {
                    await fs.promises.access("./uploads/"+date);
                }catch (e) {
                    await fs.promises.mkdir('./uploads/'+date)
                }

                request(url).pipe(fs.createWriteStream(`./uploads/${date}/${name}`))
                .on('close', () => console.log('Image downloaded.'));
                savedName = `${process.env.BASE_URL.trim()}uploads/${date}/${name}`
                fackMedia.push(savedName)
                /*request(url).pipe(fs.createWriteStream(name))
                .on('close', () => console.log('Image downloaded.'));
                savedName = `${process.env.BASE_URL.trim()}${name}`
                fackMedia.push(savedName)*/
            }
            media = fackMedia;
        }
    }else{
        var messageData = req.body.data.payload;
        var toNumber = messageData.to[0].phone_number;
        var fromnumber = messageData.from.phone_number;
        var sid = messageData.id;
        var messageText = messageData.text;
        if(messageData.media.length > 0){
            var fackMedia = [];
            for(var i=0; i < messageData.media.length; i++){
                const url = messageData.media[i].url; // link to file you want to download
                // var name = `uploads/${Date.now()}${sid}.png`;
                var name = crypto.randomBytes(24).toString('hex');
                var date = moment(new Date()).format('MMDDYYYY');
                try {
                    await fs.promises.access("./uploads/"+date);
                }catch (e) {
                    await fs.promises.mkdir('./uploads/'+date)
                }

                request(url).pipe(fs.createWriteStream(`./uploads/${date}/${name}`))
                .on('close', () => console.log('Image downloaded.'));
                savedName = `${process.env.BASE_URL.trim()}uploads/${date}/${name}`
                fackMedia.push(savedName)
                // fackMedia.push(messageData.media[i].url)
            }
            media = fackMedia;
        }
    }
    var settingCheck = await Setting.findOne({number:toNumber})
    if(settingCheck){
        var messageData2 = {
            sid: sid,
            user: settingCheck.user,
            number: fromnumber,
            telnyx_number: toNumber,
            type: 'receive',
            status: 'received',
            isview: 'false',
            message: messageText,
            setting: settingCheck._id,
            media: JSON.stringify(media)
        };
        global.io.to(settingCheck.user.toString()).emit('user_message',{message: messageText, number:fromnumber});

        // global.io.to(settingCheck.number).emit('new_message',{message: messageText, number:fromnumber});
        Message.create(messageData2);
    }
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    console.log(response.toString());
    res.set('Content-Type', 'text/xml');
    if(settingCheck && settingCheck.type == 'twilio'){
        sleep(settingCheck, req.body.SmsSid);
    }
    res.send();
};
function sleep(settingCheck, sid) {
    return new Promise((resolve) => {
      setTimeout(async function(){
        const client = twilio(settingCheck.twilio_sid, settingCheck.twilio_token);
        var deleteMessage = await client.messages(sid).remove();
          resolve(true)
      }, 3000);
    });
}   
exports.smsStatus = async (req, res) => {
    if(req.params.type !== undefined && req.params.type === 'twilio'){
        var status = req.body.MessageStatus;
        var sid = req.body.MessageSid;
        if(req.body.MessageStatus === 'delivered' || req.body.MessageStatus === 'undelivered' || req.body.MessageStatus === 'failed'){
            var settingCheck = await Setting.findOne({number:req.body.From})
            if(settingCheck){
                if(settingCheck.type === 'twilio'){
                    const client = twilio(settingCheck.twilio_sid, settingCheck.twilio_token);
                    client.messages(sid).remove();      //remove Twilio sms from server right after sent with any status reply state
                }
            }
        }
    }else{
        var data = req.body.data.payload;
        var status = data.to[0].status;
        var sid = data.id;
    }
    var message = await Message.findOne({sid: sid});
    if(message){
        message.status = status;
        message.save();
    }
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    console.log(response.toString());
    res.set('Content-Type', 'text/xml');
    res.send();
};

exports.getNumberList = async (req, res) => {
    var user_id = new mongoose.Types.ObjectId(req.body.user);
    var setting = new mongoose.Types.ObjectId(req.body.setting);
    var message =  await Message.aggregate([
        { "$match": { "user":  user_id, 'setting':setting} },
        { "$sort": {  "_id": -1 } },
        { "$group": { 
            "_id": "$number",
            "message":{"$first":"$message"},
            "id":{"$first":"$_id"},
            "created_at":{"$first":"$created_at"},
            "telnyx_number":{"$first":"$telnyx_number"},
            "id": {"$first":"$_id"},
            "isview": {
                "$sum": {
                    "$cond": { if: { $eq: [ "$isview", 'false' ] }, then: 1, else: 0 }
                }
            }
            }
        },        
    ]);
    message.sort(function (a, b) {
        return b.created_at - a.created_at;
    });
    res.status(200).json(message);
};
exports.messageDelete = async (req, res) => {
    try {
        var deletecon = {user: req.body.user, number: req.body.number};
        var messages = await Message.deleteMany(deletecon);
        if(messages){
            res.status(200).send({status: true, errors:'', data: messages});
        }else{
            res.status(400).send({status: false, errors:'Chat not deleted', data: []});
        }
    } catch (error) {
        console.error(error);
        res.status(400).send({status: false, errors:error.message, data: []});
    }
};

exports.messageList = async (req, res) => {
    await Message.updateMany({user:req.body.user,telnyx_number:req.body.number.telnyx_number, number: req.body.number._id,setting:req.body.profile.id, isview: 'false'}, { isview: 'true' });
    var messages = await Message.find({user: req.body.user,setting:req.body.profile.id,telnyx_number:req.body.number.telnyx_number, number: req.body.number._id});
    res.send(messages);
};

