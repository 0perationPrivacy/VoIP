const crypto = require("crypto");
const algorithm = "aes-256-cbc"; 

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

module.exports = {
    encryptedString, decryptedString
}