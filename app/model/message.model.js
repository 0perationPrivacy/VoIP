var mongoose = require('../../config/db.config');

const Message = mongoose.model('Message', { 
    sid: String,
    number: String,
    telnyx_number: String,
    type: {
        type: String,
        enum : ['send','receive'],
        default: 'send'
    },
    datatype: {
        type: String,
        enum : ['call','message'],
        default: 'message'
    },
    isview: {
        type: String,
        enum : ['false','true'],
        default: 'false'
    },
    status: {
        type: String,
        default: null
    },
    message: String,
    media: String,
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    duration: {
        type: Number,
        default: null
    },
    contact: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Contact' 
    },
    setting: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Setting' 
    },
    created_at : { type : Date, default: Date.now }
});


module.exports = Message;