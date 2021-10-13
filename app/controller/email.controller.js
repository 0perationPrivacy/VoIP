const Validator = require('validatorjs');
var Email = require('../model/email.model');
var Setting = require('../model/setting.model');

exports.create = async (req, res) => {
    let rules = {
        api_key: 'required',
        sender_id: 'required',
        to_email: 'required'
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        var storeData = {user: req.user.id};
        var checkemail = await Email.findOne(storeData)
        if(checkemail){
            checkemail.api_key = req.body.api_key
            checkemail.sender_id = req.body.sender_id
            checkemail.to_email = req.body.to_email
            var saveData = await checkemail.save()
            if(saveData){
                res.send({status:true, message:'Email setting updated!', data:checkemail});
            }else{
                res.status(400).json({status:'false',message:'Email setting not updated!'});
            }
        }else{
            var isSave = await Email.create({user: req.user.id, api_key:req.body.api_key,sender_id: req.body.sender_id, to_email:req.body.to_email});
            if(isSave){
                res.send({status:true, message:'Email setting saved!', data:isSave});
            }else{
                res.status(400).json({status:false,message:'Email setting not saved!'});
            }
        }
    }else{
        res.status(419).send({status: false, errors:validation.errors, data: []});
    }
};

exports.delete = async (req, res) => {
    var storeData = {user: req.user.id};
    var checkemail = await Email.findOne(storeData)
    if(checkemail){
        var deleteEmail = checkemail.delete()
        if(deleteEmail){
            res.send({status:true, message:'Email settings deleted!', data:deleteEmail});
        }else{
            res.status(400).json({status:'false',message:'Email settings not deleted!'});
        }
    }else{
        res.status(400).json({status:'false',message:'Email settings not found!'});
    }
};
exports.get  = async (req, res) => {
    var storeData = {user: req.user.id};
    var checkemail = await Email.findOne(storeData)
    res.send({status:true, message:'Get Email Settings!', data:checkemail});
};

exports.saveSetting = async (req, res) => {
    var checkemail = await Setting.findById(req.body.setting_id)
    if(checkemail){
        checkemail.emailnotification = req.body.status
        var updateData = await checkemail.save()
        res.send({status:true, message:'settings updated!', data:checkemail});
    }else{
        res.status(400).json({status:'false',message:'settings not updated!'});
    }
};