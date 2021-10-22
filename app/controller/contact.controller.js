const Validator = require('validatorjs');
var Contact = require('../model/contact.model');

exports.getOne = async (req, res) => {
    var phoneNumber = req.body.number.replace("+", "")
    var stringLen = phoneNumber.length
    if(stringLen > 10){
        phoneNumber = `+${phoneNumber}`
    }else if(stringLen == 10){
        phoneNumber = `+1${phoneNumber}`
    }
    var checkData = {user: req.user.id, number:phoneNumber};
    var checkProfile = await Contact.findOne(checkData)
    res.status(200).json({status:'false',data:checkProfile});
};

exports.crate = async (req, res) => {
    let rules = {
        first_name: 'required',
        number: 'required'
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        var phoneNumber = req.body.number.trim().replace("+", "")
        var stringLen = phoneNumber.length
        if(stringLen > 10){
            phoneNumber = `+${phoneNumber}`
        }else if(stringLen == 10){
            phoneNumber = `+1${phoneNumber}`
        }
        var checkData = {user: req.user.id, number:phoneNumber};
        var checkProfile = await Contact.findOne(checkData)
        if(checkProfile){
            res.status(400).json({status:'false',message:'Number already exists!'});
        }else{
            var countContact = await Contact.countDocuments({user: req.user.id});
            if(countContact < 500){
                var storeData = {user: req.user.id, number:phoneNumber,note: req.body.note,  first_name: req.body.first_name, last_name: req.body.last_name};
                var isSave = await Contact.create(storeData);
                if(isSave){
                    res.send({status:true, message:'Contact saved!', data:isSave});
                }else{
                    res.status(400).json({status:'false',message:'Contact not saved!'});
                }
            }else{
                res.status(400).json({status:'false',message:'Cannot have more than 500 contacts!'});
            }
        }
    }else{
        res.status(419).send({status: false, errors:validation.errors, data: []});
    }
};

exports.multipleUpload = async (req, res) => {
    for(var i=0; i < req.body.contacts.length; i++){
        var contact = req.body.contacts[i]
        var phoneNumber = contact.number.trim().replace("+", "")
        var stringLen = phoneNumber.length
        if(stringLen > 10){
            phoneNumber = `+${phoneNumber}`
        }else if(stringLen == 10){
            phoneNumber = `+1${phoneNumber}`
        }
        var storeData = { 
            user: req.user.id, 
            number:phoneNumber,
            note: contact.note,  
            first_name: contact.first_name, 
            last_name: contact.last_name
        };
        var checkProfile = await Contact.findOne(storeData)
        if(!checkProfile){
            var countContact = await Contact.countDocuments({user: req.user.id});
            if(countContact < 500){
                var isSave = await Contact.create(storeData);
            }
        }
    }
    res.send({status:true, message:'Contact data added!', data:[]});
};

exports.getAllContact = async (req, res) => {
    var contacts = await Contact.find({user: req.user.id});
    res.send({status:true, message:'Contact data!', data:contacts});
};

exports.delete = async (req, res) => {
    var deleteContact = await Contact.deleteOne({_id:req.body.contact_id })
    if(deleteContact){
        res.send({status:true, message:'Contact deleted successfully!', data:deleteContact});
    }else{
        res.status(400).json({status:'false',message:'Contact not deleted!'});
    }
};

exports.update = async (req, res) => {
    let rules = {
        first_name: 'required',
        // last_name: 'required',
        number: 'required',
        // note: 'required',
        contact_id: 'required'
    };
    let validation = new Validator(req.body, rules);
    if(validation.passes()){
        var contact = await Contact.findById(req.body.contact_id)
        var phoneNumber = req.body.number.trim().replace("+", "")
        var stringLen = phoneNumber.length
        if(stringLen > 10){
            phoneNumber = `+${phoneNumber}`
        }else if(stringLen == 10){
            phoneNumber = `+1${phoneNumber}`
        }
        contact.first_name = req.body.first_name;
        contact.last_name = req.body.last_name;
        contact.number = phoneNumber;
        contact.note = req.body.note;
        var save = contact.save();
        if(save){
            res.send({status:true, message:'Contact update successfully!', data:contact});
        }else{
            res.status(400).json({status:'false',message:'Contact not updated!'});
        }    
    }else{
        res.status(419).send({status: false, errors:validation.errors, data: []});       
    }
};


exports.deleteall = async (req, res) => {
    var deleteContact = await Contact.deleteMany({user:req.user.id })
    if(deleteContact){
        res.send({status:true, message:'All contacts deleted!', data:deleteContact});
    }else{
        res.status(400).json({status:'false',message:'Contacts not deleted!'});
    }
};

