var mongoose = require('../../config/db.config');

const Handel = mongoose.model('Handel', { 
    username: {
        type: String
    },
    id: {
        type: String
    },
    registrationComplete: {
        type: Boolean,
        enum: [false, true],
        default: false
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null
    },
    created_at : { type : Date, default: Date.now }
});


module.exports = Handel;