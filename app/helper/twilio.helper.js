const twilio = require('twilio')
const crypto = require('crypto')
const { combineURLs } = require("./common.helper")
const { generateStrongPassword } = require("./crypto.helper")

const creatTwiml = (sid, token) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            var twiml = await client.applications.create({
              voiceMethod: "POST",
              voiceUrl: combineURLs(
                process.env.BASE_URL.trim(),
                "api/call/make-call"
              ),
              statusCallback: combineURLs(
                process.env.BASE_URL.trim(),
                "api/call/status"
              ),
              statusCallbackMethod: "POST",
              friendlyName: "Operationprivacy VoIPSuite",
            });
            resolve(twiml.sid)
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

const updateTwiml = (sid, token, twimlsid) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            var twiml = await client.applications(twimlsid).update({
              voiceMethod: "POST",
              voiceUrl: combineURLs(
                process.env.BASE_URL.trim(),
                "api/call/make-call"
              ),
              statusCallback: combineURLs(
                process.env.BASE_URL.trim(),
                "api/call/status"
              ),
              statusCallbackMethod: "POST",
            });
            resolve(twiml.sid)
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

const deleteTwiml = (sid, token, twimlsid) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            await client.applications(twimlsid).remove()
            resolve(true)
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

const creatAPIKey = (sid, token) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            var apiKey = await client.newKeys.create({friendlyName: 'Operationprivacy call API Key'})
            resolve(apiKey)
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

const removeAPIKey = (sid, token, api_key) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            await client.keys(api_key).remove();
            resolve(true)
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

const unlinkNumber = (sid, token, numbersid) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            client.incomingPhoneNumbers(numbersid)
            .update({
                smsUrl: '',
                voiceUrl: '', 
                statusCallback: ''
            })
            resolve(true)
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

const twimlFallbackUpdate = (data) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(data.sid, data.token);
            await client.applications(data.twimlsid)
            .update({
                voiceFallbackUrl: data.url,
                voiceFallbackMethod: 'POST'
            })
            resolve(true)
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

const numberFallbackUpdate = (data) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(data.sid, data.token);
            await client.incomingPhoneNumbers(data.numbersid)
            .update({
                voiceFallbackUrl: data.voice_url,
                voiceFallbackMethod: 'POST',
                smsFallbackUrl: data.sms_url,
                smsFallbackMethod: 'POST'
            })
            resolve(true)
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

const twimlGet = (data) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(data.sid, data.token);
            var app = await client.applications(data.twimlsid)
            .fetch()
            resolve(app)
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

const numberGet = (data) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(data.sid, data.token);
            var number = await client.incomingPhoneNumbers(data.numbersid)
            .fetch()
            resolve(number)
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

// --- SIP Domain + Credential List provisioning (Phase 3) ---
// Twilio's analog to Telnyx's Credential Connection (see telnyx.helper.js's
// createSIPApp): a generic SIP REGISTER target that any SIP client — Linphone
// included — can authenticate against, replacing the old Voice-SDK access-token
// flow (twilio.jwt.AccessToken + VoiceGrant) that required Twilio's proprietary
// client SDK and would have disqualified the app from F-Droid.

const createSipDomain = (sid, token) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            // Domain names are unique across ALL of Twilio, not just this
            // account, so this needs real entropy rather than a timestamp.
            const domainName = `voipsuite${crypto.randomBytes(8).toString('hex')}.sip.twilio.com`;
            const domain = await client.sip.domains.create({
                domainName,
                friendlyName: 'Operation Privacy VoIP Suite',
                sipRegistration: true,
                voiceMethod: 'POST',
            });
            resolve(domain);
        } catch (e) {
            console.log(e);
            resolve(false);
        }
    });
}

const deleteSipDomain = (sid, token, domainSid) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            await client.sip.domains(domainSid).remove();
            resolve(true);
        } catch (e) {
            console.log(e);
            resolve(false);
        }
    });
}

const updateSipDomainVoiceUrl = (sid, token, domainSid, voiceUrl) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            await client.sip.domains(domainSid).update({voiceUrl, voiceMethod: 'POST'});
            resolve(true);
        } catch (e) {
            console.log(e);
            resolve(false);
        }
    });
}

// One credential list holding one username/password pair, mapped to the
// domain for both REGISTER auth and (via sipRegistration above) outbound
// INVITE auth from the registered client.
const createSipCredential = (sid, token, domainSid) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            const username = `sip${crypto.randomBytes(6).toString('hex')}`;
            const password = generateStrongPassword();

            const credentialList = await client.sip.credentialLists.create({
                friendlyName: `voip-suite-${username}`,
            });
            await client.sip.credentialLists(credentialList.sid).credentials.create({username, password});
            await client.sip.domains(domainSid).credentialListMappings.create({
                credentialListSid: credentialList.sid,
            });

            resolve({credentialListSid: credentialList.sid, username, password});
        } catch (e) {
            console.log(e);
            resolve(false);
        }
    });
}

const deleteSipCredential = (sid, token, domainSid, credentialListSid) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            try {
                await client.sip.domains(domainSid).credentialListMappings(credentialListSid).remove();
            } catch (e) {}
            await client.sip.credentialLists(credentialListSid).remove();
            resolve(true);
        } catch (e) {
            console.log(e);
            resolve(false);
        }
    });
}

module.exports = {
    creatTwiml, updateTwiml, deleteTwiml, creatAPIKey, removeAPIKey, unlinkNumber, twimlFallbackUpdate, numberFallbackUpdate, twimlGet, numberGet,
    createSipDomain, deleteSipDomain, updateSipDomainVoiceUrl, createSipCredential, deleteSipCredential
}