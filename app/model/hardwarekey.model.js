var mongoose = require('../../config/db.config');

const Hardwarekey = mongoose.model('Hardwarekey', { 
    title: String,
    registrationComplete: {
        type: Boolean,
        enum: [false, true],
        default: false
    },
    credentials:{
        type: Array,
        default: []
    },
    id: {
        type: String,
        default: null
    },
    userHandleToUsername:{
        type: String,
        default: null
    },
    aaguid:{
        type: String,
        default: null
    }, 
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    created_at : { type : Date, default: Date.now }
});


module.exports = Hardwarekey;