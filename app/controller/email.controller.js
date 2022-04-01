const Validator = require('validatorjs');
var Email = require('../model/email.model');
var Setting = require('../model/setting.model');

exports.create = async (req, res) => {
    try{
        //return res.send(req.body);
        let rules = {
            email: 'required',
            password: 'required',
            to_email: 'required',
            host: 'required',
            port: 'required',
            to_email: 'required',
            sender_email: 'required'
        };
        let validation = new Validator(req.body, rules);
        if(validation.passes()){
            var storeData = {user: req.user.id};
            var checkemail = await Email.findOne(storeData)
            if(checkemail){
                checkemail.email = req.body.email
                checkemail.password = req.body.password
                checkemail.to_email = req.body.to_email
                checkemail.host = req.body.host
                checkemail.port = req.body.port
                checkemail.secure = req.body.secure
                checkemail.sender_email = req.body.sender_email
                var saveData = await checkemail.save()
                if(saveData){
                    res.send({status:true, message:'Email settings updated!', data:checkemail});
                }else{
                    res.status(400).json({status:'false',message:'Email settings not updated!'});
                }
            }else{
                var createData = {
                    user: req.user.id, 
                    email:req.body.email,
                    password: req.body.password, 
                    to_email:req.body.to_email,
                    host:req.body.host,
                    port: req.body.port, 
                    secure:req.body.secure,
                    sender_email: req.body.sender_email
                };
                var isSave = await Email.create(createData);
                if(isSave){
                    res.send({status:true, message:'Email settings saved!', data:isSave});
                }else{
                    res.status(400).json({status:false,message:'Email settings not saved!'});
                }
            }
        }else{
            res.status(419).send({status: false, errors:validation.errors, data: []});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.delete = async (req, res) => {
    try{
        var storeData = {user: {$eq: req.user.id}};
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
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};
exports.getEmail  = async (req, res) => {
    try{
        var storeData = {user: req.user.id };
        var checkemail = await Email.findOne(storeData)
        //console.log('checkemail');
        // console.log(checkemail);
        res.send({status:true, message:'Get Email Settings!', data:checkemail});
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};

exports.saveSetting = async (req, res) => {
    try{
        // var checkemail = await Setting.findById(req.body.setting_id)
        var checkemail = await Setting.findOne({_id: { $eq: req.body.setting_id}})
        if(checkemail){
            checkemail.emailnotification = req.body.status
            var updateData = await checkemail.save()
            res.send({status:true, message:'settings updated!', data:checkemail});
        }else{
            res.status(400).json({status:'false',message:'settings not updated!'});
        }
    }catch(error){
        res.status(400).json({status:'false',message:'something is wrong'});
    }
};