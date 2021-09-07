var mongoose = require('../../config/db.config');

const Number = mongoose.model('Number', { 
    number: String,
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    created_at : { type : Date, default: Date.now }
});


module.exports = Number;