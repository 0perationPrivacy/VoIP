var mongoose = require('../../config/db.config');
const {encrypt, decrypt} = require('../helper/crypto.helper');

// Credential-bearing fields are transparently encrypted at rest (AES-256-GCM)
// via these schema-level get/set hooks — every existing read/write of
// settingCheck.api_key etc. elsewhere in the codebase keeps working unchanged.
const encryptedField = () => ({
    type: String,
    default: null,
    get: decrypt,
    set: encrypt,
});

const userSchema = mongoose.Schema({
    api_key: encryptedField(),
    number: String,
    setting: String,
    sid:String,
    twilio_sid: encryptedField(),
    twilio_token: encryptedField(),
    // Telnyx's webhook-signing public key from the sender's own Telnyx Portal
    // account (portal.telnyx.com/#/app/account/public-key) — not a secret,
    // it's the counterpart used to verify inbound webhook signatures.
    telnyx_public_key: String,
    profile: String,
    emailnotification:{
        type: String,
        enum : ['false','true'],
        default: 'false'
    },
    type: {
        type: String,
        enum : ['telnyx','twilio'],
        default: 'telnyx'
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    app_key:{
        type: String, 
        default: null
    },
    app_secret: encryptedField(),
    twiml_app: {
        type: String,
        default: null
    },
    sip_id:{
        type: String,
        default: null
    },
    // The SIP registrar host the mobile client's Linphone engine registers
    // against. Fixed (sip.telnyx.com) for Telnyx; a per-account generated
    // hostname (voipsuite<random>.sip.twilio.com) for Twilio — see
    // twilio.helper.js's createSipDomain. One shared field so the mobile
    // "get my SIP credentials" endpoint doesn't need provider-specific logic.
    sip_registrar: {
        type: String,
        default: null
    },
    // Twilio SIP Domain resource SID (needed for teardown/updates) — has no
    // Telnyx equivalent, sip_id already serves that role there.
    sip_domain_sid: {
        type: String,
        default: null
    },
    sip_username: {
        type: String,
        default: null
    },
    sip_password: encryptedField(),
    telnyx_twiml:{
        type: String, 
        default: null
    },
    telnyx_outbound:{
        type: String, 
        default: null
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
 
 // Set Object and Json property to true. Default is set to false.
 // getters:true is required for res.send(settingDoc) — otherwise the API
 // response would leak ciphertext instead of the decrypted credential.
 userSchema.set('toObject', { virtuals: true, getters: true });
 userSchema.set('toJSON', { virtuals: true, getters: true });

const Setting = mongoose.model('Setting', userSchema);


module.exports = Setting;