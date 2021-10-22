const crypto = require("crypto");
const algorithm = "aes-256-cbc"; 
const nodemailer = require("nodemailer")
const twilio = require('twilio')

const encryptedString = (message) => {
    return new Promise(async (resolve) => {
        try {
            const initVector = crypto.randomBytes(16);
            const Securitykey = process.env.COOKIE_KEY;
            const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
            let encryptedData = cipher.update(message, "utf-8", "hex");
            resolve(encryptedData);
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

const decryptedString = (message) => {
    return new Promise(async (resolve) => {
        try {
            const Securitykey = process.env.COOKIE_KEY;
            const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
            let encryptedData = cipher.update(message, "utf-8", "hex");
            resolve(encryptedData);
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

const sendEmail = (setting,email) => {
    return new Promise(async (resolve) => {
        try {
            let transporter = nodemailer.createTransport({
                host: setting.host, // "smtp.gmail.com",
                port: setting.port, // 587,
                secure: setting.secure, // true for 465, false for other ports
                auth: {
                    user:  setting.email, // process.env.EMAIL, // generated ethereal user
                    pass: setting.password, // process.env.PASSWORD, // generated ethereal password
                },
            });
            transporter.sendMail({
                from: setting.sender_email, // sender address
                to: setting.to_email, // list of receivers
                subject: email.subject, // Subject line
                text:  email.email, // plain text body
                html: email.html
            });
            resolve(true);
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

const creatTwiml = (sid, token) => {
    return new Promise(async (resolve) => {
        try {
            const client = twilio(sid, token);
            var twiml = await client.applications.create({
                voiceMethod: 'POST',
                voiceUrl: '',
                friendlyName: 'operationprivacy VoIPSuite '
            })
            resolve(twiml.sid)
        }catch (e){
            console.log(e);
            resolve(false);
        }
    });
}

module.exports = {
    encryptedString, decryptedString, sendEmail, creatTwiml
}