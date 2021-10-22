var mongoose = require('../../config/db.config');

const Email = mongoose.model('Email', { 
    email:String,
    password: String,
    to_email: String,
    host: String,
    port: String,
    secure: Boolean,
    sender_email:String,
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    created_at : { type : Date, default: Date.now }
});


module.exports = Email;