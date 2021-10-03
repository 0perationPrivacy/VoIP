var mongoose = require('../../config/db.config');

const Email = mongoose.model('Email', { 
    api_key: String,
    sender_id: String,
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    created_at : { type : Date, default: Date.now }
});


module.exports = Email;