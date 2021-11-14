const Validator = require('validatorjs');
var Setting = require('../model/setting.model');
var Message = require('../model/message.model');
const twilio = require('twilio');
const telnyx = require('telnyx');
const telnyxHelper = require('../helper/telnyx.helper')
const twilioHelper = require('../helper/twilio.helper')
exports.crateProfile = async (req, res) => {
    let rules = {
        profile: 'required'
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        var checkprofile = {user: { $eq: req.user.id }, profile: { $eq: req.body.profile} };
        var checkProfileData = await Setting.findOne(checkprofile)
        if(checkProfileData){
            res.status(400).json({status:'false',message:'Profile already exists!'});
        }else{
            var storeData = {user: req.user.id , profile: req.body.profile };
            var isSave = await Setting.create(storeData);
            if(isSave){
                res.send({status:true, message:'Profile saved!', data:isSave});
            }else{
                res.status(400).json({status:'false',message:'Profile not saved!'});
            }
        }
            
    }else{
        res.status(419).send({status: false, errors:validation.errors, data: []});
    }
};

exports.getOneProfile = async (req, res) => {
    var getData = await Setting.findOne({user: {$eq: req.user.id }, _id:{ $eq: req.body.setting}}).populate({
        path: 'messageCount',
        match: { isview: 'false' }
    }).populate({
        path: 'totalCount',
        match: { isview: 'false' }
    })
   // var messageCount = await Message.countDocuments({user:req.user.id,isview:'false'})
    // getData.totalMessage = messageCount;
    res.send({status:true, message:'Profile data!', data:getData});
};
exports.getProfile = async (req, res) => {
    var getData = await Setting.find({user:{ $eq: req.user.id}}).populate({
        path: 'messageCount',
        match: { isview: 'false' }
    }).populate({
        path: 'totalCount',
        match: { isview: 'false' }
    })
    res.send({status:true, message:'Profile data!', data:getData});
};
exports.deleteProfile = async (req, res) => {
    
    var settingCheck = await Setting.findOne({_id:{$eq: req.body.profile_id} })
    // var getData = await Setting.deleteOne({_id:req.body.profile_id })
    if(settingCheck){
        Message.deleteMany({setting:settingCheck._id })
        if(settingCheck.type === 'telnyx' && settingCheck.api_key && settingCheck.setting){
            var Telynx = telnyx(settingCheck.api_key)  
            try{
                await Telynx.phoneNumbers.update(
                    settingCheck.sid,
                    { connection_id: '' }
                  ); 
            }catch(error){
                
            }
            if(settingCheck.sip_id){
                try{
                    await telnyxHelper.deleteSIPApp(settingCheck.api_key, settingCheck.sip_id)
                }catch(error){

                }

                try{
                    await telnyxHelper.deleteOutboundVoice(settingCheck.api_key, settingCheck.telnyx_outbound)
                }catch(error){

                }
            }
            if(settingCheck.telnyx_twiml){
                try{
                    await telnyxHelper.deleteTexmlApp(settingCheck.api_key, settingCheck.telnyx_twiml) 
                }catch(error){
    
                }
            }
            try{
                await Telynx.phoneNumbers.updateMessagingSettings(
                    settingCheck.sid,
                    { messaging_profile_id: "" }
                ); 
            }catch(error){

            }
            try{
                const { data: messagingProfiles } = await Telynx.messagingProfiles.retrieve(settingCheck.setting);
                await messagingProfiles.del();
            }catch(error){

            }
        }
        if(settingCheck.type === 'twilio' && settingCheck.twilio_sid && settingCheck.twilio_token && settingCheck.sid){

            if(settingCheck.app_key){
                try{
                    await twilioHelper.removeAPIKey(settingCheck.twilio_sid, settingCheck.twilio_token, settingCheck.app_key)
                }catch(error){

                }
            }
            if(settingCheck.twiml_app){
                try{
                    await twilioHelper.deleteTwiml(settingCheck.twilio_sid, settingCheck.twilio_token, settingCheck.twiml_app)
                } catch(error){

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
        await Setting.deleteOne({_id:{ $eq: req.body.profile_id } })
        res.send({status:true, message:'Profile deleted successfully!', data:settingCheck});
    }else{
        res.status(400).json({status:'false',message:'Profile not deleted!'});
    }
};

exports.updateProfile = async (req, res) => {
    let rules = {
        profile: 'required',
        profile_id: 'required'
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        // var setting = await Setting.findById(req.body.profile_id)
        var setting = await Setting.findOne({_id: { $eq: req.body.profile_id}})
        setting.profile = req.body.profile;
        var save = setting.save();
        if(save){
            res.send({status:true, message:'Profile update successfully!', data:setting});
        }else{
            res.status(400).json({status:'false',message:'Profile not updated!'});
        }    
    }else{
        res.status(419).send({status: false, errors:validation.errors, data: []});       
    }
};

