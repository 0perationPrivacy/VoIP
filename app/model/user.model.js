var mongoose = require('../../config/db.config');

const User = mongoose.model('User', { 
    name: String,
    email: String,
    password: String,
    token: String,
    otp: String
});


module.exports = User;