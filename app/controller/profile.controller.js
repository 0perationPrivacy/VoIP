const Validator = require('validatorjs');
var Setting = require('../model/setting.model');
var Message = require('../model/message.model');
const twilio = require('twilio');
const telnyx = require('telnyx');
exports.crateProfile = async (req, res) => {
    let rules = {
        profile: 'required'
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        var storeData = {user: req.user.id, profile:req.body.profile };
        var checkProfile = await Setting.findOne(storeData)
        if(checkProfile){
            res.status(400).json({status:'false',message:'Profile already exists!'});
        }else{
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
    var getData = await Setting.findOne({user:req.user.id, _id:req.body.setting}).populate({
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
    var getData = await Setting.find({user:req.user.id}).populate({
        path: 'messageCount',
        match: { isview: 'false' }
    }).populate({
        path: 'totalCount',
        match: { isview: 'false' }
    })
    res.send({status:true, message:'Profile data!', data:getData});
};
exports.deleteProfile = async (req, res) => {
    
    var settingCheck = await Setting.findOne({_id:req.body.profile_id })
    // var getData = await Setting.deleteOne({_id:req.body.profile_id })
    if(settingCheck){
        Message.deleteMany({setting:settingCheck._id })
        if(settingCheck.type === 'telnyx' && settingCheck.api_key && settingCheck.setting){
            var Telynx = telnyx(settingCheck.api_key)  
            await Telynx.phoneNumbers.updateMessagingSettings(
                settingCheck.sid,
                { messaging_profile_id: "" }
            ); 
            const { data: messagingProfiles } = await Telynx.messagingProfiles.retrieve(settingCheck.setting);
            await messagingProfiles.del();
        }
        if(settingCheck.type === 'twilio' && settingCheck.twilio_sid && settingCheck.twilio_token && settingCheck.sid){
            const client = twilio(settingCheck.twilio_sid, settingCheck.twilio_token)
            client.incomingPhoneNumbers(settingCheck.sid)
            .update({
                smsUrl: ''
            })
        }
        await Setting.deleteOne({_id:req.body.profile_id })
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
        var setting = await Setting.findById(req.body.profile_id)
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

