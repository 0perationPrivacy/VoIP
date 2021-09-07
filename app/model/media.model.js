var mongoose = require('../../config/db.config');

const Media = mongoose.model('Media', { 
    media: String,
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
});


module.exports = Media;