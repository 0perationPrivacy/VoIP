module.exports = app => {
    var call = require('../controller/call.controller');
    var router = require("express").Router();
    const auth = require('../middleware/auth.middleware');

    // Legacy per-profile call-setting management (old Twilio Voice-SDK fields) —
    // kept only for account-deletion cleanup of already-provisioned settings.
    router.post("/setting", auth, call.create);
    router.post("/setting/delete", auth, call.delete);
    router.post("/setting/get", auth, call.get);

    router.post("/sip-credentials", auth, call.getSipCredentials);
    router.post("/history", auth, call.history);

    // Provider webhooks — no app auth (Telnyx/Twilio can't send our JWT),
    // authenticated instead via each provider's own webhook signature.
    router.post("/status", call.status);
    router.post("/telnyx", call.telnyx);
    router.post("/status/telnyx", call.statusTelnyx);
    router.post("/twilio-sip-inbound", call.twilioSipInbound);

    app.use('/api/call', router);
};
