const Telnyx = require('telnyx');
var axios = require('axios');
const moment = require('moment');


//Inside lib file declare functions
const requestCurl = (method,url,headers,data=null) => {
    return new Promise((resolve) => {
        if(data){
            var config = {
                method: method,
                url: url,
                headers: headers,
                data:data
            };
        }else{
            var config = {
                method: method,
                url: url,
                headers: headers
            };   
        }
        axios(config).then(function (response) {
            resolve(response.data);
        }).catch(function (error) {
            // console.log(error)
            resolve(false);
        });
    });
}
 
const createTexmlApp = (apiKey) => {
    return new Promise(async (resolve,reject) =>  {
        var url = `https://api.telnyx.com/v2/texml_applications`;
        var headers =  { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${apiKey}`
          };
        var data = {
            "friendly_name": moment().format('YYYYMMDDHHmm'),
            "voice_url" : `${process.env.BASE_URL.trim()}api/call/telnyx`,
            "voice_method" : 'post',
            "status_callback" :`${process.env.BASE_URL.trim()}api/call/status/telnyx`,
            "status_callback_method": 'post'
        }
        var response = await requestCurl('POST',url,headers, data);
        resolve(response);
    });
}

const updateTexmlApp = (apiKey, twimlid) => {
    return new Promise(async (resolve,reject) =>  {
        var url = `https://api.telnyx.com/v2/texml_applications/${twimlid}`;
        var headers =  { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${apiKey}`
          };
        var data = {
            "voice_url" : `${process.env.BASE_URL.trim()}api/call/telnyx`,
            "voice_method" : 'post',
            "status_callback" :`${process.env.BASE_URL.trim()}api/call/status/telnyx`,
            "status_callback_method": 'post'
        }
        var response = await requestCurl('PATCH',url,headers, data);
        resolve(response);
    });
}

const deleteTexmlApp = (apiKey, twimlid) => {
    return new Promise(async (resolve,reject) =>  {
        var url = `https://api.telnyx.com/v2/texml_applications/${twimlid}`;
        var headers =  { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${apiKey}`
          };
        var response = await requestCurl('DELETE',url,headers);
        resolve(response);
    });
}

const createSIPApp = (apiKey, userid, outboundProfileid) => {
    // console.log(outboundProfileid)
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(apiKey);
            // In Node 10
            var password = Math.floor((Math.random() * 1000000000) + 999999999);
            const credentialConnection = await telnyx.credentialConnections.create({
                connection_name: `sip${moment().format('YYYYMMDDHHmm')}`,
                user_name: `user${moment().format('YYYYMMDDHHmm')}`,
                password: password,
                webhook_event_url: `${process.env.BASE_URL.trim()}api/call/status/telnyx`,
                outbound: { outbound_voice_profile_id:  outboundProfileid},
                sip_uri_calling_preference: 'unrestricted'
            });
            resolve(credentialConnection);
        }catch(error){
            console.log(error)
            resolve(false);
        }
    });
}

const updateSIPApp = (apiKey, uuid, outboundProfileid) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(apiKey);
            const { data: credentialConnection } = await telnyx.credentialConnections.retrieve(uuid);
            credentialConnection.update({ 
                webhook_event_url: `${process.env.BASE_URL.trim()}api/call/status/telnyx`,
                outbound: { outbound_voice_profile_id:  outboundProfileid},
                sip_uri_calling_preference: 'unrestricted'
            });
            resolve(true);
        }catch(error){
            // console.log(error)
            resolve(false);
        }
    });
}

const deleteSIPApp = (apiKey, uuid) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(apiKey);
            const { data: credentialConnection } = await telnyx.credentialConnections.retrieve(uuid);
            await credentialConnection.del();
            resolve(true);
        }catch(error){
            // console.log(error)
            resolve(false);
        }
    });
}

const createOutboundVoice = (apiKey) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(apiKey);
            // In Node 10
            const outboundVoiceProfiles = await telnyx.outboundVoiceProfiles.create(
                {"name": `outbound${moment().format('YYYYMMDDHHmm')}`}
              );
              // console.log(outboundVoiceProfiles.data)
            resolve(outboundVoiceProfiles);
        }catch(error){
            // console.log(error)
            resolve(false);
        }
    });
}

const deleteOutboundVoice = (apiKey, profileid) => {
    return new Promise(async (resolve,reject) =>  {
        try{
            const telnyx = Telnyx(apiKey);
            const { data: outboundVoiceProfiles } = await telnyx.outboundVoiceProfiles.retrieve(profileid);
            await outboundVoiceProfiles.del();
            resolve(true);
        }catch(error){
            // console.log(error)
            resolve(false);
        }
    });
}

module.exports = {
    requestCurl, createTexmlApp, updateTexmlApp, deleteTexmlApp, createSIPApp, updateSIPApp, deleteSIPApp, createOutboundVoice, deleteOutboundVoice
}