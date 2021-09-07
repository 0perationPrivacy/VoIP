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
    isview: {
        type: String,
        enum : ['false','true'],
        default: 'false'
    },
    status: String,
    message: String,
    media: String,
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    number_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Number' 
    },
    setting: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Setting' 
    },
    created_at : { type : Date, default: Date.now }
});


module.exports = Message;