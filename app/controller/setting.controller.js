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
const Numbers = require('twilio/lib/rest/Numbers');
var Contact = require('../model/contact.model');
var Email = require('../model/email.model');
const { exists } = require('../model/setting.model');
const commonHelper = require('../helper/common.helper')
const telnyxHelper = require('../helper/telnyx.helper')
const twilioHelper = require('../helper/twilio.helper')

exports.deleteKey = async (req, res) => {
    try {
        var settingCheck = await Setting.findOne({ user: { $eq: req.body.user }, _id: { $eq: req.body.profile_id } })
        try {
            if (settingCheck.type === 'telnyx') {
                var Telynx = telnyx(settingCheck.api_key)
                try {
                    await Telynx.phoneNumbers.update(
                        settingCheck.sid,
                        { connection_id: '' }
                    );
                } catch (error) {

                }
                if (settingCheck.sip_id) {
                    try {
                        await telnyxHelper.deleteSIPApp(settingCheck.api_key, settingCheck.sip_id)
                    } catch (error) {

                    }

                    try {
                        await telnyxHelper.deleteOutboundVoice(settingCheck.api_key, settingCheck.telnyx_outbound)
                    } catch (error) {

                    }
                }
                if (settingCheck.telnyx_twiml) {
                    try {
                        await telnyxHelper.deleteTexmlApp(settingCheck.api_key, settingCheck.telnyx_twiml)
                    } catch (error) {

                    }
                }
                try {
                    await Telynx.phoneNumbers.updateMessagingSettings(
                        settingCheck.sid,
                        { messaging_profile_id: "" }
                    );
                } catch (error) {

                }
                try {
                    const { data: messagingProfiles } = await Telynx.messagingProfiles.retrieve(settingCheck.setting);
                    await messagingProfiles.del();
                } catch (error) {

                }
            } else {
                if (settingCheck.app_key) {
                    try {
                        await twilioHelper.removeAPIKey(settingCheck.twilio_sid, settingCheck.twilio_token, settingCheck.app_key)
                    } catch (error) {

                    }
                }
                if (settingCheck.twiml_app) {
                    try {
                        await twilioHelper.deleteTwiml(settingCheck.twilio_sid, settingCheck.twilio_token, settingCheck.twiml_app)
                    } catch (error) {

                    }
                }
                const client = twilio(settingCheck.twilio_sid, settingCheck.twilio_token)
                client.incomingPhoneNumbers(settingCheck.sid)
                    .update({
                        smsUrl: '',
                        voiceUrl: '',
                        statusCallback: ''
                    })
            }
        } catch (error) {

        }
        settingCheck.api_key = null;
        settingCheck.number = null;
        settingCheck.setting = null;
        settingCheck.sid = null;
        settingCheck.twilio_sid = null;
        settingCheck.twilio_token = null;

        settingCheck.app_key = null;
        settingCheck.app_secret = null;
        settingCheck.twiml_app = null;
        settingCheck.sip_id = null;
        settingCheck.sip_username = null;
        settingCheck.sip_password = null;
        settingCheck.telnyx_twiml = null;
        settingCheck.telnyx_outbound = null;

        settingCheck.save();
        if (settingCheck) {
            res.send({ status: true, message: 'Setting Deleted!', data: settingCheck });
        } else {
            res.status(400).json({ status: 'false', message: 'Setting not deleted!' });
        }
    } catch (error) {
        res.status(400).json({ status: 'false', message: 'Setting not deleted!' });
    }
};
exports.create = async (req, res) => {
    try {
        if (req.body.type == 'telnyx') {
            let rules = {
                api_key: 'required',
                number: 'required',
                user: 'required',
                profile: 'required'
            };
            let validation = new Validator(req.body, rules);
            if (validation.passes()) {
                var user = await User.findOne({ _id: { $eq: req.body.user } });
                if (user) {
                    var firstSettingCheck = await Setting.findOne({ _id: { $not: { $eq: req.body.setting } }, number: { $eq: req.body.number } })
                    if (firstSettingCheck) {
                        res.status(400).json({ status: 'false', message: 'Number already assigned to another profile!' });
                    } else {
                        var settingStore = false;
                        var settingCheck = await Setting.findOne({ user: { $eq: req.body.user }, _id: { $eq: req.body.setting } })
                        if (settingCheck) {
                            settingCheck.api_key = req.body.api_key;
                            settingCheck.number = req.body.number;
                            settingCheck.sid = req.body.sid;
                            settingCheck.profile = req.body.profile;
                            settingCheck.type = 'telnyx';

                            if (req.body.override === 'true') {
                                if (settingCheck.telnyx_twiml) {
                                    await telnyxHelper.updateTexmlApp(req.body.api_key, settingCheck.telnyx_twiml)
                                } else {
                                    var twimlTel = await telnyxHelper.createTexmlApp(req.body.api_key)
                                    settingCheck.telnyx_twiml = twimlTel.data.id
                                }
                                if (settingCheck.telnyx_outbound) {
                                    // telnyxHelper.updateTexmlApp(req.body.api_key, settingCheck.telnyx_twiml)
                                } else {
                                    var outboundTel = await telnyxHelper.createOutboundVoice(req.body.api_key)
                                    settingCheck.telnyx_outbound = outboundTel.data.id
                                }

                                if (settingCheck.sip_id) {
                                    await telnyxHelper.updateSIPApp(req.body.api_key, settingCheck.sip_id, settingCheck.telnyx_outbound)
                                } else {
                                    // console.log('==================================================================')
                                    // console.log(settingCheck.telnyx_outbound)
                                    var sipTel = await telnyxHelper.createSIPApp(req.body.api_key, req.user.id, settingCheck.telnyx_outbound)
                                    //console.log('==================================================================')
                                    // console.log(sipTel.data.id)
                                    settingCheck.sip_id = sipTel.data.id
                                    settingCheck.sip_username = sipTel.data.user_name
                                    settingCheck.sip_password = sipTel.data.password
                                }
                            }

                            settingCheck.save();
                            var save = settingCheck;
                            if (!settingCheck.setting) {
                                settingStore = true;
                            }
                        } else {
                            var telynxData = {
                                api_key: req.body.api_key,
                                sid: req.body.sid,
                                number: req.body.number,
                                user: req.body.user,
                                profile: req.body.profile,
                                type: 'telnyx'
                            }
                            var save = await Setting.create(telynxData);
                            settingStore = true;
                            var settingCheck = await Setting.findOne({ user: { $eq: req.body.user }, _id: { $eq: req.body.setting } })
                        }
                        if (save) {
                            if (settingStore) {
                                var saveTelnyxSetting = await telnyx(req.body.api_key).messagingProfiles.create(
                                    {
                                        "name": "VoIP sms Web Application", "enabled": true,
                                        "webhook_url": process.env.BASE_URL.trim() + "api/setting/receive-sms/" + req.body.type,
                                    }
                                )
                                var telnyxSetting = saveTelnyxSetting.data.id;
                            } else {
                                await telnyx(req.body.api_key).messagingProfiles.update(settingCheck.setting,
                                    {
                                        "webhook_url": process.env.BASE_URL.trim() + "api/setting/receive-sms/" + req.body.type
                                    }
                                );
                                var telnyxSetting = settingCheck.setting;
                            }
                            settingCheck.setting = telnyxSetting;
                            settingCheck.save();
                            await telnyx(req.body.api_key).phoneNumbers.updateMessagingSettings(
                                req.body.sid,
                                { messaging_profile_id: telnyxSetting }
                            );
                            if (req.body.override === 'true') {
                                await telnyx(req.body.api_key).phoneNumbers.update(
                                    req.body.sid,
                                    { connection_id: settingCheck.telnyx_twiml }
                                );
                            }
                            res.send({ status: true, message: 'setting saved!', data: settingCheck });
                        } else {
                            res.status(400).json({ status: 'false', message: 'Setting not saved!' });
                        }

                    }
                } else {
                    res.status(400).json({ status: 'false', message: 'Something is wrong!' });
                }
            } else {
                let rules2 = {
                    profile: 'required'
                };
                let validation2 = new Validator(req.body, rules2);
                if (validation2.passes()) {
                    var user = await User.findOne({ _id: { $eq: req.body.user } });
                    if (user) {
                        var firstSettingCheck = await Setting.findOne({ _id: { $eq: req.body.setting } })
                        if (firstSettingCheck) {
                            firstSettingCheck.profile = req.body.profile
                            firstSettingCheck.save()
                            res.send({ status: true, message: 'setting saved!', data: settingCheck });
                        } else {
                            res.status(400).json({ status: 'false', message: 'setting not found!' });
                        }
                    } else {
                        res.status(400).json({ status: 'false', message: 'Something is wrong!' });
                    }
                } else {
                    res.status(419).send({ status: false, errors: validation2.errors, data: [] });
                }
            }
        } else {
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
            if (validation.passes()) {
                var user = await User.findOne({ _id: { $eq: req.body.user } });
                if (user) {
                    var firstSettingCheck = await Setting.findOne({ _id: { $not: { $eq: req.body.setting } }, number: { $eq: req.body.twilio_number } })
                    if (firstSettingCheck) {
                        res.status(400).json({ status: 'false', message: 'Number already assigned to another profile!' });
                    } else {
                        var settingStore = false;
                        var settingCheck = await Setting.findOne({ user: { $eq: req.body.user }, _id: { $eq: req.body.setting } })
                        if (settingCheck) {
                            settingCheck.api_key = null;
                            settingCheck.number = req.body.twilio_number;
                            settingCheck.sid = req.body.sid;
                            settingCheck.twilio_sid = req.body.twilio_sid;
                            settingCheck.twilio_token = req.body.twilio_token;
                            settingCheck.profile = req.body.profile;
                            settingCheck.type = 'twilio';
                            if (req.body.override === 'true') {
                                if (settingCheck.twiml_app) {
                                    await twilioHelper.updateTwiml(req.body.twilio_sid, req.body.twilio_token, settingCheck.twiml_app)
                                } else {
                                    var twiml_app = await twilioHelper.creatTwiml(req.body.twilio_sid, req.body.twilio_token);
                                    settingCheck.twiml_app = twiml_app
                                }
                                if (settingCheck.app_key) {

                                } else {
                                    var appData = await twilioHelper.creatAPIKey(req.body.twilio_sid, req.body.twilio_token);
                                    settingCheck.app_key = appData.sid
                                    settingCheck.app_secret = appData.secret
                                }
                            }
                            var save = settingCheck.save();
                        } else {
                            var twilioData = {
                                number: req.body.twilio_number,
                                sid: req.body.sid,
                                twilio_sid: req.body.twilio_sid,
                                twilio_token: req.body.twilio_token,
                                user: req.body.user,
                                type: 'twilio',
                                profile: req.body.profile
                            }
                            var save = await Setting.create(twilioData);
                        }
                    }
                    if (save) {
                        const client = new twilio(req.body.twilio_sid, req.body.twilio_token);
                        if (req.body.override === 'true') {
                            var twilioUpdatedata = {
                                smsUrl: process.env.BASE_URL.trim() + "api/setting/receive-sms/" + req.body.type,
                                voiceUrl: process.env.BASE_URL.trim() + "api/call/incomming",
                                statusCallback: process.env.BASE_URL.trim() + "api/call/status",
                                voiceApplicationSid: "",
                            }
                        } else {
                            var twilioUpdatedata = {
                                smsUrl: process.env.BASE_URL.trim() + "api/setting/receive-sms/" + req.body.type,
                            }
                        }
                        await client.incomingPhoneNumbers(req.body.sid)
                            .update(twilioUpdatedata)
                        res.send({ status: true, message: 'setting saved!', data: settingCheck });
                    } else {
                        res.status(400).json({ status: 'false', message: 'Setting not saved!' });
                    }
                } else {
                    res.status(400).json({ status: 'false', message: 'Something is wrong!' });
                }
            } else {
                let rules2 = {
                    profile: 'required'
                };
                let validation2 = new Validator(req.body, rules2);
                if (validation2.passes()) {
                    var user = await User.findOne({ _id: { $eq: req.body.user } });
                    if (user) {
                        var firstSettingCheck = await Setting.findOne({ _id: { $eq: req.body.setting } })
                        if (firstSettingCheck) {
                            firstSettingCheck.profile = req.body.profile
                            firstSettingCheck.save()
                            res.send({ status: true, message: 'setting saved!', data: settingCheck });
                        } else {
                            res.status(400).json({ status: 'false', message: 'setting not found!' });
                        }
                    } else {
                        res.status(400).json({ status: 'false', message: 'Something is wrong!' });
                    }
                } else {
                    res.status(419).send({ status: false, errors: validation2.errors, data: [] });
                }
                // res.status(419).send({status: false, errors:validation.errors, data: []});
            }
        }
    } catch (error) {
        // console.log(error)
        res.status(400).send({ status: false, message: error.message, data: [] });
    }
};
exports.getSetting = async (req, res) => {
    try {
        let rules = {
            setting: 'required'
        };
        let validation = new Validator(req.body, rules);
        if (validation.passes()) {
            var settingCheck = await Setting.findOne({ user: { $eq: req.user.id }, _id: { $eq: req.body.setting } })
            if (settingCheck) {
                res.send({ status: true, message: 'setting data!', data: settingCheck });
            } else {
                res.status(400).json({ status: 'false', message: 'Setting not found!' });
            }
        } else {
            res.status(419).send({ status: false, errors: validation.errors, data: [] });
        }
    } catch (error) {
        res.status(400).send({ status: false, errors: error.message, data: [] });
    }
};

exports.getNumber = async (req, res) => {
    try {
        if (req.body.type == 'telnyx') {
            let rules = {
                api_key: 'required',
            };
            let validation = new Validator(req.body, rules);
            if (validation.passes()) {
                var phoneNumber = await telnyx(req.body.api_key).phoneNumbers.list();
                res.send({ status: true, message: 'Phone number list retrieved.', data: phoneNumber });
            } else {
                res.status(419).send({ status: false, errors: validation.errors, data: [] });
            }

        } else if (req.body.type == 'twilio') {
            let rules = {
                twilio_sid: 'required',
                twilio_token: 'required'
            };
            let validation = new Validator(req.body, rules);
            if (validation.passes()) {
                const client = new twilio(req.body.twilio_sid, req.body.twilio_token);
                const numbers = await client.incomingPhoneNumbers.list()
                res.send({ status: true, message: 'Phone number list retrieved.', data: numbers });
            } else {
                res.status(419).send({ status: false, errors: validation.errors, data: [] });
            }
        }
    } catch (error) {
        res.status(400).send({ status: false, errors: error.message, data: [] });
    }
};

exports.sendSms = async (req, res) => {
    try {
        let rules = {
            user: 'required',
            numbers: 'required',
            profile: 'required'
        };
        let validation = new Validator(req.body, rules);
        if (validation.passes()) {
            var settingCheck = await Setting.findOne({ user: { $eq: req.body.user }, _id: { $eq: req.body.profile._id } })
            if (settingCheck) {
                if (settingCheck.type == 'twilio') {
                    const client = require('twilio')(settingCheck.twilio_sid, settingCheck.twilio_token);
                    var arrMessageData = [];
                    for (var i = 0; i < req.body.numbers.length; i++) {
                        var toNumber = req.body.numbers[i];
                        toNumber = toNumber.replace(/\s/g, '').replace(/\-/g, '').replace(/\)/g, '').replace(/\(/g, '')
                        var sendNumber = toNumber.length
                        if (sendNumber == 10) {
                            toNumber = `+1${toNumber}`;
                        }
                        var twilioParams = {
                            body: req.body.message,
                            from: settingCheck.number,
                            to: toNumber,
                            statusCallback: `${process.env.BASE_URL.trim()}api/setting/sms-status/twilio`,
                        };
                        if (req.body.media.length > 0) {
                            twilioParams.mediaUrl = req.body.media
                        }
                        //media
                        var sendSms = await client.messages.create(twilioParams)
                        if (sendSms.sid !== undefined) {
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
                            var contact = await Contact.findOne({ user: { $eq: req.body.user }, number: { $eq: toNumber } });
                            if (contact) {
                                messageData.contact = contact._id
                            } else {
                                toNumber = toNumber.slice(-10)
                                var contact2 = await Contact.findOne({ user: { $eq: req.body.user }, number: { $eq: toNumber } });
                                if (contact2) {
                                    messageData.contact = contact2._id
                                }
                            }
                            if (req.body.media.length > 0) {
                                messageData.media = JSON.stringify(req.body.media)
                            }
                            arrMessageData.push(messageData);
                        }
                    }
                } else {
                    const Telnyx = telnyx(settingCheck.api_key);
                    var arrMessageData = [];
                    for (var i = 0; i < req.body.numbers.length; i++) {
                        //var sendNumber = req.body.numbers[i].length
                        var toNumber = req.body.numbers[i];
                        toNumber = toNumber.replace(/\s/g, '').replace(/\-/g, '').replace(/\)/g, '').replace(/\(/g, '')
                        var sendNumber = toNumber.length
                        if (sendNumber == 10) {
                            toNumber = `+1${toNumber}`;
                        }
                        var telnyxParams = {
                            'from': settingCheck.number, // Your Telnyx number
                            'to': toNumber,
                            'text': req.body.message,
                            'webhook_url': `${process.env.BASE_URL.trim()}api/setting/sms-status/telnyx`
                        }
                        if (req.body.media.length > 0) {
                            telnyxParams.media_urls = req.body.media
                        }
                        var sendSms = await Telnyx.messages.create(telnyxParams);
                        if (sendSms.data.id !== undefined) {
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
                            var contact = await Contact.findOne({ user: { $eq: req.body.user }, number: { $eq: toNumber } });
                            if (contact) {
                                messageData.contact = contact._id
                            } else {
                                toNumber = toNumber.slice(-10)
                                var contact2 = await Contact.findOne({ user: { $eq: req.body.user }, number: { $eq: toNumber } });
                                if (contact2) {
                                    messageData.contact = contact2._id
                                }
                            }
                            if (req.body.media.length > 0) {
                                messageData.media = JSON.stringify(req.body.media)
                            }
                            //media
                            arrMessageData.push(messageData);
                        }
                    }
                }
                var messages = await Message.create(arrMessageData);
                if (messages) {
                    res.send({ status: true, message: 'Message sent successfully!', data: messages });
                } else {
                    res.status(400).json({ status: 'false', message: 'Message not sent!' });
                }
            } else {
                res.status(400).json({ status: 'false', message: 'Message not sent!' });
            }
        } else {
            res.status(419).send({ status: false, errors: validation.errors, data: [] });
        }
    } catch (error) {
        console.log(error)
        res.status(400).send({ status: false, message: error.message, data: [] });
    }
};

exports.receiveSms = async (req, res) => {
    try {
        var media = [];
        if (req.params.type !== undefined && req.params.type == 'twilio') {
            var messageText = req.body.Body;
            var toNumber = req.body.To;
            var fromnumber = req.body.From;
            var sid = req.body.SmsSid;
            if (req.body.NumMedia > 0) {
                var fackMedia = [];
                for (var i = 0; i < req.body.NumMedia; i++) {
                    var tMedia = `MediaUrl${i}`;
                    var tMediaType = `MediaContentType${i}`;
                    const url = req.body[tMedia]; // link to file you want to download
                    //var name = `uploads/${Date.now()}${req.body.SmsSid}.png`;
                    // var name = crypto.randomBytes(24).toString('hex');
                    if (tMediaType == 'image/gif') {
                        var name = `${crypto.randomBytes(24).toString('hex')}.gif`;
                    } else if (tMediaType == 'image/jpeg') {
                        var name = `${crypto.randomBytes(24).toString('hex')}.jpg`;
                    } else {
                        var name = `${crypto.randomBytes(24).toString('hex')}.png`;
                    }
                    var date = moment(new Date()).format('MMDDYYYY');
                    try {
                        await fs.promises.access("./uploads/" + date);
                    } catch (e) {
                        await fs.promises.mkdir('./uploads/' + date)
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
        } else {
            var messageData = req.body.data.payload;
            var toNumber = messageData.to[0].phone_number;
            var fromnumber = messageData.from.phone_number;
            var sid = messageData.id;
            var messageText = messageData.text;
            if (messageData.media.length > 0) {
                var fackMedia = [];
                for (var i = 0; i < messageData.media.length; i++) {
                    const url = messageData.media[i].url; // link to file you want to download
                    // var name = `uploads/${Date.now()}${sid}.png`;
                    if (messageData.media[i].content_type == 'image/gif') {
                        var name = `${crypto.randomBytes(24).toString('hex')}.gif`;
                    } else if (messageData.media[i].content_type == 'image/jpeg') {
                        var name = `${crypto.randomBytes(24).toString('hex')}.jpg`;
                    } else {
                        var name = `${crypto.randomBytes(24).toString('hex')}.png`;
                    }

                    var date = moment(new Date()).format('MMDDYYYY');
                    try {
                        await fs.promises.access("./uploads/" + date);
                    } catch (e) {
                        await fs.promises.mkdir('./uploads/' + date)
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
        var settingCheck = await Setting.findOne({ number: { $eq: toNumber } })
        if (settingCheck) {
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
            var contact = await Contact.findOne({ user: { $eq: settingCheck.user }, number: { $eq: fromnumber } });
            if (contact) {
                messageData2.contact = contact._id
            } else {
                var fromnumber2 = fromnumber.slice(-10)
                // console.log(fromnumber2)
                var contact2 = await Contact.findOne({ user: { $eq: settingCheck.user }, number: { $eq: fromnumber2 } });
                // console.log(contact2)
                if (contact2) {
                    messageData2.contact = contact2._id
                }
            }
            global.io.to(settingCheck.user.toString()).emit('user_message', { message: messageText, number: fromnumber, toNumber: toNumber });
            if (settingCheck.emailnotification !== undefined && settingCheck.emailnotification == 'true') {
                var emailSetting = await Email.findOne({ user: { $eq: settingCheck.user } })
                if (emailSetting) {
                    try {
                        var emailData = {
                            subject: 'Message received from ' + fromnumber,
                            text: 'Message received',
                            html: `Received Message: <br><p>${messageText}</p>`,
                        };
                        commonHelper.sendEmail(emailSetting, emailData);
                    } catch (error) {
                        // console.log(error)
                    }
                }

            }
            // global.io.to(settingCheck.number).emit('new_message',{message: messageText, number:fromnumber});
            Message.create(messageData2);
        }
        const VoiceResponse = twilio.twiml.VoiceResponse;
        const response = new VoiceResponse();
        console.log(response.toString());
        res.set('Content-Type', 'text/xml');
        if (settingCheck && settingCheck.type == 'twilio') {
            sleep(settingCheck, req.body.SmsSid)
        }
        res.send();
    } catch (error) {
        res.status(400).json({ status: 'false', message: 'something went wrong' });
    }
};
function sleep(settingCheck, sid) {
    return new Promise((resolve) => {
        setTimeout(async function () {
            const client = twilio(settingCheck.twilio_sid, settingCheck.twilio_token);

            for (var i = 0; i < 5; i++) {
                try {
                    var deleteMessage = await client.messages(sid).remove();
                    if (deleteMessage) { break; }
                } catch (error) {
                }
            }
            if (deleteMessage) {
                resolve(true)
            } else {
                resolve(false)
            }
        }, 5000);
    });
}
exports.smsStatus = async (req, res) => {
    try {
        if (req.params.type !== undefined && req.params.type === 'twilio') {
            var status = req.body.MessageStatus;
            var sid = req.body.MessageSid;
            if (req.body.MessageStatus === 'delivered' || req.body.MessageStatus === 'undelivered' || req.body.MessageStatus === 'failed') {
                var settingCheck = await Setting.findOne({ number: { $eq: req.body.From } })
                if (settingCheck) {
                    if (settingCheck.type === 'twilio') {
                        const client = twilio(settingCheck.twilio_sid, settingCheck.twilio_token);
                        for (var i = 0; i < 5; i++) {
                            try {
                                var isDelete = await client.messages(sid).remove();
                                if (isDelete) { break; }
                            } catch (error) {

                            }
                        }     //remove Twilio sms from server right after sent with any status reply state
                    }
                }
            }
        } else {
            var data = req.body.data.payload;
            var status = data.to[0].status;
            var sid = data.id;
        }
        var message = await Message.findOne({ sid: { $eq: sid } });
        if (message) {
            message.status = status;
            message.save();
        }
        const VoiceResponse = twilio.twiml.VoiceResponse;
        const response = new VoiceResponse();
        console.log(response.toString());
        res.set('Content-Type', 'text/xml');
        res.send();
    } catch (error) {
        res.status(400).json({ status: 'false', message: 'something went wrong' });
    }
};

exports.getNumberList = async (req, res) => {
    try {
        var user_id = new mongoose.Types.ObjectId(req.body.user);
        var setting = new mongoose.Types.ObjectId(req.body.setting);
        var message = await Message.aggregate([
            { "$match": { "user": user_id, 'setting': setting } },
            { "$sort": { "_id": -1 } },
            {
                "$group": {
                    "_id": "$number",
                    "message": { "$first": "$message" },
                    "id": { "$first": "$_id" },
                    "created_at": { "$first": "$created_at" },
                    "contact": { "$first": "$contact" },
                    "message_type": { "$first": "$datatype" },
                    "type": { "$first": "$type" },
                    "telnyx_number": { "$first": "$telnyx_number" },
                    "id": { "$first": "$_id" },
                    "isview": {
                        "$sum": {
                            "$cond": { if: { $eq: ["$isview", 'false'] }, then: 1, else: 0 }
                        }
                    }
                }
            }
        ]);
        await Contact.populate(message, { path: "contact" });
        message.sort(function (a, b) {
            return b.created_at - a.created_at;
        });
        res.status(200).json(message);
    } catch (error) {
        res.status(400).json({ status: 'false', message: 'something went wrong' });
    }
};
exports.messageDelete = async (req, res) => {
    try {
        var deletecon = { user: { $eq: req.body.user }, number: { $eq: req.body.number } };
        var messages = await Message.deleteMany(deletecon);
        if (messages) {
            res.status(200).send({ status: true, errors: '', data: messages });
        } else {
            res.status(400).send({ status: false, errors: 'Chat not deleted', data: [] });
        }
    } catch (error) {
        res.status(400).send({ status: false, errors: error.message, data: [] });
    }
};

exports.messageList = async (req, res) => {
    try {
        var filterObject = {
            user: { $eq: req.body.user },
            telnyx_number: { $eq: req.body.number.telnyx_number },
            number: { $eq: req.body.number._id },
            setting: { $eq: req.body.profile.id },
        };

        await Message.updateMany({ ...filterObject, isview: { $eq: 'false' } }, { isview: 'true' });
        var messages = await Message.find(filterObject);

        res.send(messages);
    } catch (error) {
        res.status(400).json({ status: 'false', message: 'something went wrong' });
    }
};

