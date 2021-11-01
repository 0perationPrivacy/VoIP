const twilio = require('twilio')

const creatTwiml = (sid, token) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            var twiml = await client.applications.create({
                voiceMethod: 'POST',
                voiceUrl: `${process.env.BASE_URL.trim()}api/call/make-call`,
                statusCallback: `${process.env.BASE_URL.trim()}api/call/status`,
                statusCallbackMethod: 'POST',
                friendlyName: 'Operationprivacy VoIPSuite'
            })
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
            var twiml = await client.applications(twimlsid)
                    .update({
                        voiceMethod: 'POST',
                        voiceUrl: `${process.env.BASE_URL.trim()}api/call/make-call`,
                        statusCallback: `${process.env.BASE_URL.trim()}api/call/status`,
                        statusCallbackMethod: 'POST',
                    })
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

module.exports = {
    creatTwiml, updateTwiml, deleteTwiml, creatAPIKey, removeAPIKey, unlinkNumber, twimlFallbackUpdate, numberFallbackUpdate, twimlGet, numberGet 
}