var mongoose = require('../../config/db.config');
const userSchema = mongoose.Schema({ 
    api_key: String,
    number: String,
    setting: String,
    sid:String,
    twilio_sid: String,
    twilio_token: String,
    profile: String,
    type: {
        type: String,
        enum : ['telnyx','twilio'],
        default: 'telnyx'
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    created_at : { type : Date, default: Date.now },
     
});

userSchema.virtual('messageCount', {
    ref: 'Message', //The Model to use
    localField: '_id', //Find in Model, where localField 
    foreignField: 'setting', // is equal to foreignField,
    count: true
 });

 userSchema.virtual('totalCount', {
    ref: 'Message', //The Model to use
    localField: 'user', //Find in Model, where localField 
    foreignField: 'user', // is equal to foreignField,
    count: true
 });
 
 // Set Object and Json property to true. Default is set to false
 userSchema.set('toObject', { virtuals: true });
 userSchema.set('toJSON', { virtuals: true });

const Setting = mongoose.model('Setting', userSchema);


module.exports = Setting;