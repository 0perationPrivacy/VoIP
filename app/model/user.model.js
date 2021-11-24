var mongoose = require('../../config/db.config');

const User = mongoose.model('User', { 
    name: String,
    email: String,
    password: String,
    token: String,
    otp: String,
    mfa: {
        type: String,
        enum : ['false','true'],
        default: 'false'
    },
    mfa_token: {
        type: String,
        default: null
    },
    hardwarekey:{
        type: String,
        enum : ['false','true'],
        default: 'false'
    }
});


module.exports = User;