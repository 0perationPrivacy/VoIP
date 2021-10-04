const Validator = require('validatorjs');
var Email = require('../model/email.model');

exports.create = async (req, res) => {
    let rules = {
        api_key: 'required',
        sender_id: 'required'
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        var storeData = {user: req.user.id};
        var checkemail = await Email.findOne(storeData)
        if(checkemail){
            checkemail.api_key = req.body.api_key
            checkemail.sender_id = req.body.sender_id
            var saveData = checkemail.save()
            if(saveData){
                res.send({status:true, message:'Email setting updated!', data:checkemail});
            }else{
                res.status(400).json({status:'false',message:'Email setting not updated!'});
            }
        }else{
            var isSave = await Email.create({user: req.user.id, api_key:req.body.api_key,sender_id: req.body.sender_id});
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
            res.send({status:true, message:'Email setting deleted!', data:deleteEmail});
        }else{
            res.status(400).json({status:'false',message:'Email setting not deleted!'});
        }
    }else{
        res.status(400).json({status:'false',message:'Email setting not found!'});
    }
};