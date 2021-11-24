var mongoose = require('../../config/db.config');

const Hardwarekey = mongoose.model('Hardwarekey', { 
    title: String,
    keyhandle: String,
    publickey: String,
    registeredKeys: String,
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    created_at : { type : Date, default: Date.now }
});


module.exports = Hardwarekey;