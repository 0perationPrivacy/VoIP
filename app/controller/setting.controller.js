const Validator = require("validatorjs");
const telnyx = require("telnyx");
const moment = require("moment");
var mongoose = require("mongoose");
const twilio = require("twilio");
const path = require("path");
const http = require("https");
const fs = require("fs");
const request = require("request");
const crypto = require("crypto");

var Setting = require("../model/setting.model");
var User = require("../model/user.model");
var Message = require("../model/message.model");
const Numbers = require("twilio/lib/rest/Numbers");
var Contact = require("../model/contact.model");
var Email = require("../model/email.model");
const { exists } = require("../model/setting.model");
const {sendEmail, combineURLs } = require("../helper/common.helper");
const telnyxHelper = require("../helper/telnyx.helper");
const twilioHelper = require("../helper/twilio.helper");
const webhookVerify = require("../helper/webhook-verify.helper");

exports.deleteKey = async (req, res) => {
  try {
    var settingCheck = await Setting.findOne({
      user: { $eq: req.body.user },
      _id: { $eq: req.body.profile_id },
    });
    try {
      if (settingCheck.type === "telnyx") {
        var Telynx = telnyx(settingCheck.api_key);
        try {
          await Telynx.phoneNumbers.update(settingCheck.sid, {
            connection_id: "",
          });
        } catch (error) {}
        if (settingCheck.sip_id) {
          try {
            await telnyxHelper.deleteSIPApp(
              settingCheck.api_key,
              settingCheck.sip_id
            );
          } catch (error) {}

          try {
            await telnyxHelper.deleteOutboundVoice(
              settingCheck.api_key,
              settingCheck.telnyx_outbound
            );
          } catch (error) {}
        }
        if (settingCheck.telnyx_twiml) {
          try {
            await telnyxHelper.deleteTexmlApp(
              settingCheck.api_key,
              settingCheck.telnyx_twiml
            );
          } catch (error) {}
        }
        try {
          await Telynx.phoneNumbers.updateMessagingSettings(settingCheck.sid, {
            messaging_profile_id: "",
          });
        } catch (error) {}
        try {
          const { data: messagingProfiles } =
            await Telynx.messagingProfiles.retrieve(settingCheck.setting);
          await messagingProfiles.del();
        } catch (error) {}
      } else {
        if (settingCheck.app_key) {
          try {
            await twilioHelper.removeAPIKey(
              settingCheck.twilio_sid,
              settingCheck.twilio_token,
              settingCheck.app_key
            );
          } catch (error) {}
        }
        if (settingCheck.twiml_app) {
          try {
            await twilioHelper.deleteTwiml(
              settingCheck.twilio_sid,
              settingCheck.twilio_token,
              settingCheck.twiml_app
            );
          } catch (error) {}
        }
        if (settingCheck.sip_domain_sid && settingCheck.sip_id) {
          try {
            await twilioHelper.deleteSipCredential(
              settingCheck.twilio_sid,
              settingCheck.twilio_token,
              settingCheck.sip_domain_sid,
              settingCheck.sip_id
            );
          } catch (error) {}
        }
        if (settingCheck.sip_domain_sid) {
          try {
            await twilioHelper.deleteSipDomain(
              settingCheck.twilio_sid,
              settingCheck.twilio_token,
              settingCheck.sip_domain_sid
            );
          } catch (error) {}
        }
        const client = twilio(
          settingCheck.twilio_sid,
          settingCheck.twilio_token
        );
        client.incomingPhoneNumbers(settingCheck.sid).update({
          smsUrl: "",
          voiceUrl: "",
          statusCallback: "",
        });
      }
    } catch (error) {}
    settingCheck.api_key = null;
    settingCheck.number = null;
    settingCheck.setting = null;
    settingCheck.sid = null;
    settingCheck.twilio_sid = null;
    settingCheck.twilio_token = null;

    settingCheck.app_key = null;
    settingCheck.app_secret = null;
    settingCheck.twiml_app = null;
    settingCheck.sip_id = null;
    settingCheck.sip_username = null;
    settingCheck.sip_password = null;
    settingCheck.sip_registrar = null;
    settingCheck.sip_domain_sid = null;
    settingCheck.telnyx_twiml = null;
    settingCheck.telnyx_outbound = null;

    settingCheck.save();
    if (settingCheck) {
      res.send({
        status: true,
        message: "Setting Deleted!",
        data: settingCheck,
      });
    } else {
      res
        .status(400)
        .json({ status: "false", message: "Setting not deleted!" });
    }
  } catch (error) {
    res.status(400).json({ status: "false", message: "Setting not deleted!" });
  }
};
exports.create = async (req, res) => {
  try {
    if (req.body.type == "telnyx") {
      let rules = {
        api_key: "required",
        number: "required",
        user: "required",
        profile: "required",
      };
      let validation = new Validator(req.body, rules);
      if (validation.passes()) {
        var user = await User.findOne({ _id: { $eq: req.body.user } });
        if (user) {
          var firstSettingCheck = await Setting.findOne({
            _id: { $not: { $eq: req.body.setting } },
            number: { $eq: req.body.number },
          });
          if (firstSettingCheck) {
            res
              .status(400)
              .json({
                status: "false",
                message: "Number already assigned to another profile!",
              });
          } else {
            var settingStore = false;
            var settingCheck = await Setting.findOne({
              user: { $eq: req.body.user },
              _id: { $eq: req.body.setting },
            });
            if (settingCheck) {
              settingCheck.api_key = req.body.api_key;
              settingCheck.number = req.body.number;
              settingCheck.sid = req.body.sid;
              settingCheck.profile = req.body.profile;
              settingCheck.type = "telnyx";
              settingCheck.telnyx_public_key = req.body.telnyx_public_key;

              if (req.body.override === "true") {
                if (settingCheck.telnyx_twiml) {
                  await telnyxHelper.updateTexmlApp(
                    req.body.api_key,
                    settingCheck.telnyx_twiml
                  );
                } else {
                  var twimlTel = await telnyxHelper.createTexmlApp(
                    req.body.api_key
                  );
                  if (!twimlTel || !twimlTel.data) {
                    return res.status(400).json({
                      status: "false",
                      message: "Failed to create the Telnyx TeXML application — check that your API key is valid and check the backend log for the specific Telnyx error.",
                    });
                  }
                  settingCheck.telnyx_twiml = twimlTel.data.id;
                }
                if (settingCheck.telnyx_outbound) {
                  // telnyxHelper.updateTexmlApp(req.body.api_key, settingCheck.telnyx_twiml)
                } else {
                  var outboundTel = await telnyxHelper.createOutboundVoice(
                    req.body.api_key
                  );
                  if (!outboundTel || !outboundTel.data) {
                    return res.status(400).json({
                      status: "false",
                      message: "Failed to create the Telnyx outbound voice profile — check that your API key is valid and check the backend log for the specific Telnyx error.",
                    });
                  }
                  settingCheck.telnyx_outbound = outboundTel.data.id;
                }

                if (settingCheck.sip_id) {
                  await telnyxHelper.updateSIPApp(
                    req.body.api_key,
                    settingCheck.sip_id,
                    settingCheck.telnyx_outbound,
                    settingCheck.number
                  );
                } else {
                  var sipTel = await telnyxHelper.createSIPApp(
                    req.body.api_key,
                    req.user.id,
                    settingCheck.telnyx_outbound,
                    settingCheck.number
                  );
                  if (!sipTel || !sipTel.data) {
                    return res.status(400).json({
                      status: "false",
                      message: "Failed to create the Telnyx SIP credential connection — check that your API key is valid and check the backend log for the specific Telnyx error.",
                    });
                  }
                  settingCheck.sip_id = sipTel.data.id;
                  settingCheck.sip_username = sipTel.data.user_name;
                  settingCheck.sip_password = sipTel.data.password;
                  settingCheck.sip_registrar = 'sip.telnyx.com';
                }
              }

              var save = await settingCheck.save();
              if (!settingCheck.setting) {
                settingStore = true;
              }
            } else {
              var telynxData = {
                api_key: req.body.api_key,
                sid: req.body.sid,
                number: req.body.number,
                user: req.body.user,
                profile: req.body.profile,
                type: "telnyx",
                telnyx_public_key: req.body.telnyx_public_key,
              };
              var save = await Setting.create(telynxData);
              settingStore = true;
              var settingCheck = await Setting.findOne({
                user: { $eq: req.body.user },
                _id: { $eq: req.body.setting },
              });
            }
            if (save) {
              if (settingStore) {
                var saveTelnyxSetting = await telnyx(
                  req.body.api_key
                ).messagingProfiles.create({
                  name: "VoIP sms Web Application",
                  enabled: true,
                  webhook_url: combineURLs(
                    process.env.BASE_URL.trim(),
                    "api/setting/receive-sms/",
                    req.body.type
                  ),
                  // "*" is not a valid value — Telnyx expects real alpha-2
                  // country codes here (same as the Outbound Voice Profile's
                  // whitelisted_destinations), and rejects the whole request
                  // otherwise. Pre-existing bug, unrelated to the voice-calling
                  // whitelist fix elsewhere in this file.
                  whitelisted_destinations: ["US", "CA"]
                });
                var telnyxSetting = saveTelnyxSetting.data.id;
              } else {
                await telnyx(req.body.api_key).messagingProfiles.update(
                  settingCheck.setting,
                  {
                    webhook_url: combineURLs(
                      process.env.BASE_URL.trim(),
                      "api/setting/receive-sms/",
                      req.body.type
                    ),
                    // This profile was originally created with the invalid
                    // "*" wildcard (see the create branch above) — Telnyx
                    // apparently validates whitelisted_destinations on
                    // update even when this call doesn't otherwise touch it,
                    // and rejects the whole request while that invalid value
                    // is still stored. Set it explicitly here too so this
                    // gets corrected regardless of which branch a given
                    // profile happens to hit.
                    whitelisted_destinations: ["US", "CA"],
                  }
                );
                var telnyxSetting = settingCheck.setting;
              }
              settingCheck.setting = telnyxSetting;
              settingCheck.save();
              await telnyx(
                req.body.api_key
              ).phoneNumbers.updateMessagingSettings(req.body.sid, {
                messaging_profile_id: telnyxSetting,
              });
              if (req.body.override === "true") {
                await telnyx(req.body.api_key).phoneNumbers.update(
                  req.body.sid,
                  { connection_id: settingCheck.telnyx_twiml }
                );
              }
              res.send({
                status: true,
                message: "setting saved!",
                data: settingCheck,
              });
            } else {
              res
                .status(400)
                .json({ status: "false", message: "Setting not saved!" });
            }
          }
        } else {
          res
            .status(400)
            .json({ status: "false", message: "Something is wrong!" });
        }
      } else {
        let rules2 = {
          profile: "required",
        };
        let validation2 = new Validator(req.body, rules2);
        if (validation2.passes()) {
          var user = await User.findOne({ _id: { $eq: req.body.user } });
          if (user) {
            var firstSettingCheck = await Setting.findOne({
              _id: { $eq: req.body.setting },
            });
            if (firstSettingCheck) {
              firstSettingCheck.profile = req.body.profile;
              firstSettingCheck.save();
              res.send({
                status: true,
                message: "setting saved!",
                data: settingCheck,
              });
            } else {
              res
                .status(400)
                .json({ status: "false", message: "setting not found!" });
            }
          } else {
            res
              .status(400)
              .json({ status: "false", message: "Something is wrong!" });
          }
        } else {
          res
            .status(419)
            .send({ status: false, errors: validation2.errors, data: [] });
        }
      }
    } else {
      //twilio setting
      let rules = {
        twilio_sid: "required",
        twilio_token: "required",
        twilio_number: "required",
        sid: "required",
        user: "required",
        profile: "required",
      };
      let validation = new Validator(req.body, rules);
      if (validation.passes()) {
        var user = await User.findOne({ _id: { $eq: req.body.user } });
        if (user) {
          var firstSettingCheck = await Setting.findOne({
            _id: { $not: { $eq: req.body.setting } },
            number: { $eq: req.body.twilio_number },
          });
          if (firstSettingCheck) {
            res
              .status(400)
              .json({
                status: "false",
                message: "Number already assigned to another profile!",
              });
          } else {
            var settingStore = false;
            var settingCheck = await Setting.findOne({
              user: { $eq: req.body.user },
              _id: { $eq: req.body.setting },
            });
            if (settingCheck) {
              settingCheck.api_key = null;
              settingCheck.number = req.body.twilio_number;
              settingCheck.sid = req.body.sid;
              settingCheck.twilio_sid = req.body.twilio_sid;
              settingCheck.twilio_token = req.body.twilio_token;
              settingCheck.profile = req.body.profile;
              settingCheck.type = "twilio";
              if (req.body.override === "true") {
                // SIP Domain + Credential List — the generic-SIP replacement for
                // the old TwiML Application + API Key flow below it (which only
                // a Twilio-proprietary Voice SDK could consume). Kept alongside
                // rather than deleting yet: the old fields still back the
                // now-retired getToken() branch until any remaining callers move over.
                if (!settingCheck.sip_domain_sid) {
                  var sipDomain = await twilioHelper.createSipDomain(
                    req.body.twilio_sid,
                    req.body.twilio_token
                  );
                  if (sipDomain) {
                    settingCheck.sip_domain_sid = sipDomain.sid;
                    settingCheck.sip_registrar = sipDomain.domainName;
                  }
                }
                if (settingCheck.sip_domain_sid && !settingCheck.sip_username) {
                  var sipCredential = await twilioHelper.createSipCredential(
                    req.body.twilio_sid,
                    req.body.twilio_token,
                    settingCheck.sip_domain_sid
                  );
                  if (sipCredential) {
                    settingCheck.sip_id = sipCredential.credentialListSid;
                    settingCheck.sip_username = sipCredential.username;
                    settingCheck.sip_password = sipCredential.password;
                  }
                }
              }
              var save = await settingCheck.save();
            } else {
              var twilioData = {
                number: req.body.twilio_number,
                sid: req.body.sid,
                twilio_sid: req.body.twilio_sid,
                twilio_token: req.body.twilio_token,
                user: req.body.user,
                type: "twilio",
                profile: req.body.profile,
              };
              var save = await Setting.create(twilioData);
            }
          }
          if (save) {
            const client = new twilio(
              req.body.twilio_sid,
              req.body.twilio_token
            );
            if (req.body.override === "true") {
              var twilioUpdatedata = {
                smsUrl: combineURLs(
                  process.env.BASE_URL.trim(),
                  "api/setting/receive-sms/",
                  req.body.type
                ),
                voiceUrl: combineURLs(
                  process.env.BASE_URL.trim(),
                  "api/call/twilio-sip-inbound"
                ),
                statusCallback: combineURLs(
                  process.env.BASE_URL.trim(),
                  "api/call/status"
                ),
                voiceApplicationSid: "",
              };
            } else {
              var twilioUpdatedata = {
                smsUrl:
                  process.env.BASE_URL.trim() +
                  "api/setting/receive-sms/" +
                  req.body.type,
              };
            }
            await client
              .incomingPhoneNumbers(req.body.sid)
              .update(twilioUpdatedata);
            res.send({
              status: true,
              message: "setting saved!",
              data: settingCheck,
            });
          } else {
            res
              .status(400)
              .json({ status: "false", message: "Setting not saved!" });
          }
        } else {
          res
            .status(400)
            .json({ status: "false", message: "Something is wrong!" });
        }
      } else {
        let rules2 = {
          profile: "required",
        };
        let validation2 = new Validator(req.body, rules2);
        if (validation2.passes()) {
          var user = await User.findOne({ _id: { $eq: req.body.user } });
          if (user) {
            var firstSettingCheck = await Setting.findOne({
              _id: { $eq: req.body.setting },
            });
            if (firstSettingCheck) {
              firstSettingCheck.profile = req.body.profile;
              firstSettingCheck.save();
              res.send({
                status: true,
                message: "setting saved!",
                data: settingCheck,
              });
            } else {
              res
                .status(400)
                .json({ status: "false", message: "setting not found!" });
            }
          } else {
            res
              .status(400)
              .json({ status: "false", message: "Something is wrong!" });
          }
        } else {
          res
            .status(419)
            .send({ status: false, errors: validation2.errors, data: [] });
        }
        // res.status(419).send({status: false, errors:validation.errors, data: []});
      }
    }
  } catch (error) {
    console.log('setting.create failed:', error.response?.data || error.message);
    res.status(400).send({ status: false, message: error.message, data: [] });
  }
};
exports.getSetting = async (req, res) => {
  try {
    let rules = {
      setting: "required",
    };
    let validation = new Validator(req.body, rules);
    if (validation.passes()) {
      var settingCheck = await Setting.findOne({
        user: { $eq: req.user.id },
        _id: { $eq: req.body.setting },
      });
      if (settingCheck) {
        res.send({
          status: true,
          message: "setting data!",
          data: settingCheck,
        });
      } else {
        res
          .status(400)
          .json({ status: "false", message: "Setting not found!" });
      }
    } else {
      res
        .status(419)
        .send({ status: false, errors: validation.errors, data: [] });
    }
  } catch (error) {
    res.status(400).send({ status: false, errors: error.message, data: [] });
  }
};

exports.getNumber = async (req, res) => {
  try {
    if (req.body.type == "telnyx") {
      let rules = {
        api_key: "required",
      };
      let validation = new Validator(req.body, rules);
      if (validation.passes()) {
        var phoneNumber = await telnyx(req.body.api_key).phoneNumbers.list();
        res.send({
          status: true,
          message: "Phone number list retrieved.",
          data: phoneNumber,
        });
      } else {
        res
          .status(419)
          .send({ status: false, errors: validation.errors, data: [] });
      }
    } else if (req.body.type == "twilio") {
      let rules = {
        twilio_sid: "required",
        twilio_token: "required",
      };
      let validation = new Validator(req.body, rules);
      if (validation.passes()) {
        const client = new twilio(req.body.twilio_sid, req.body.twilio_token);
        const numbers = await client.incomingPhoneNumbers.list();
        res.send({
          status: true,
          message: "Phone number list retrieved.",
          data: numbers,
        });
      } else {
        res
          .status(419)
          .send({ status: false, errors: validation.errors, data: [] });
      }
    }
  } catch (error) {
    res.status(400).send({ status: false, errors: error.message, data: [] });
  }
};

exports.sendSms = async (req, res) => {
  try {
    let rules = {
      user: "required",
      numbers: "required",
      profile: "required",
    };
    let validation = new Validator(req.body, rules);
    if (validation.passes()) {
      var settingCheck = await Setting.findOne({
        user: { $eq: req.body.user },
        _id: { $eq: req.body.profile._id },
      });
      if (settingCheck) {
        if (settingCheck.type == "twilio") {
          const client = require("twilio")(
            settingCheck.twilio_sid,
            settingCheck.twilio_token
          );
          var arrMessageData = [];
          for (var i = 0; i < req.body.numbers.length; i++) {
            var toNumber = req.body.numbers[i];
            toNumber = toNumber
              .replace(/\s/g, "")
              .replace(/\-/g, "")
              .replace(/\)/g, "")
              .replace(/\(/g, "");
            var sendNumber = toNumber.length;
            if (sendNumber == 10) {
              toNumber = `+1${toNumber}`;
            }
            var twilioParams = {
              body: req.body.message,
              from: settingCheck.number,
              to: toNumber,
              statusCallback: combineURLs(
                process.env.BASE_URL.trim(),
                "api/setting/sms-status/twilio"
              ),
            };
            if (req.body.media.length > 0) {
              twilioParams.mediaUrl = req.body.media;
            }
            //media
            var sendSms = await client.messages.create(twilioParams);
            if (sendSms.sid !== undefined) {
              var messageData = {
                sid: sendSms.sid,
                user: req.body.user,
                number: toNumber,
                telnyx_number: settingCheck.number,
                type: "send",
                status: "sent",
                isview: "true",
                message: req.body.message,
                setting: settingCheck._id,
              };
              var contact = await Contact.findOne({
                user: { $eq: req.body.user },
                number: { $eq: toNumber },
              });
              if (contact) {
                messageData.contact = contact._id;
              } else {
                toNumber = toNumber.slice(-10);
                var contact2 = await Contact.findOne({
                  user: { $eq: req.body.user },
                  number: { $eq: toNumber },
                });
                if (contact2) {
                  messageData.contact = contact2._id;
                }
              }
              if (req.body.media.length > 0) {
                messageData.media = JSON.stringify(req.body.media);
              }
              arrMessageData.push(messageData);
            }
          }
        } else {
          const Telnyx = telnyx(settingCheck.api_key);
          var arrMessageData = [];
          for (var i = 0; i < req.body.numbers.length; i++) {
            //var sendNumber = req.body.numbers[i].length
            var toNumber = req.body.numbers[i];
            toNumber = toNumber
              .replace(/\s/g, "")
              .replace(/\-/g, "")
              .replace(/\)/g, "")
              .replace(/\(/g, "");
            var sendNumber = toNumber.length;
            if (sendNumber == 10) {
              toNumber = `+1${toNumber}`;
            }
            var telnyxParams = {
              from: settingCheck.number, // Your Telnyx number
              to: toNumber,
              text: req.body.message,
              webhook_url: combineURLs(
                process.env.BASE_URL.trim(),
                "api/setting/sms-status/telnyx"
              ),
            };
            if (req.body.media.length > 0) {
              telnyxParams.media_urls = req.body.media;
            }
            var sendSms = await Telnyx.messages.create(telnyxParams);
            if (sendSms.data.id !== undefined) {
              var messageData = {
                sid: sendSms.data.id,
                user: req.body.user,
                number: toNumber,
                telnyx_number: settingCheck.number,
                type: "send",
                status: "sent",
                isview: "true",
                message: req.body.message,
                setting: settingCheck._id,
              };
              var contact = await Contact.findOne({
                user: { $eq: req.body.user },
                number: { $eq: toNumber },
              });
              if (contact) {
                messageData.contact = contact._id;
              } else {
                toNumber = toNumber.slice(-10);
                var contact2 = await Contact.findOne({
                  user: { $eq: req.body.user },
                  number: { $eq: toNumber },
                });
                if (contact2) {
                  messageData.contact = contact2._id;
                }
              }
              if (req.body.media.length > 0) {
                messageData.media = JSON.stringify(req.body.media);
              }
              //media
              arrMessageData.push(messageData);
            }
          }
        }
        var messages = await Message.create(arrMessageData);
        if (messages) {
          res.send({
            status: true,
            message: "Message sent successfully!",
            data: messages,
          });
        } else {
          res
            .status(400)
            .json({ status: "false", message: "Message not sent!" });
        }
      } else {
        res.status(400).json({ status: "false", message: "Message not sent!" });
      }
    } else {
      res
        .status(419)
        .send({ status: false, errors: validation.errors, data: [] });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: false, message: error.message, data: [] });
  }
};

async function downloadInboundMedia(mediaDescriptors) {
  var media = [];
  for (var i = 0; i < mediaDescriptors.length; i++) {
    const {url, contentType} = mediaDescriptors[i];
    if (contentType == "image/gif") {
      var name = `${crypto.randomBytes(24).toString("hex")}.gif`;
    } else if (contentType == "image/jpeg") {
      var name = `${crypto.randomBytes(24).toString("hex")}.jpg`;
    } else {
      var name = `${crypto.randomBytes(24).toString("hex")}.png`;
    }
    var date = moment(new Date()).format("MMDDYYYY");
    try {
      await fs.promises.access("./uploads/" + date);
    } catch (e) {
      await fs.promises.mkdir("./uploads/" + date);
    }

    request(url)
      .pipe(fs.createWriteStream(`./uploads/${date}/${name}`))
      .on("close", () => console.log("Image downloaded."));
    var savedName = combineURLs(process.env.BASE_URL.trim(), "uploads", date, name);
    media.push(savedName);
  }
  return media;
}

exports.receiveSms = async (req, res) => {
  try {
    var mediaDescriptors = [];
    if (req.params.type !== undefined && req.params.type == "twilio") {
      var messageText = req.body.Body;
      var toNumber = req.body.To;
      var fromnumber = req.body.From;
      var sid = req.body.SmsSid;
      for (var i = 0; i < (req.body.NumMedia || 0); i++) {
        mediaDescriptors.push({
          url: req.body[`MediaUrl${i}`],
          contentType: req.body[`MediaContentType${i}`],
        });
      }
    } else {
      var messageData = req.body.data.payload;
      var toNumber = messageData.to[0].phone_number;
      var fromnumber = messageData.from.phone_number;
      var sid = messageData.id;
      var messageText = messageData.text;
      for (var i = 0; i < messageData.media.length; i++) {
        mediaDescriptors.push({
          url: messageData.media[i].url,
          contentType: messageData.media[i].content_type,
        });
      }
    }

    var settingCheck = await Setting.findOne({ number: { $eq: toNumber } });

    // Without this, any inbound-message endpoint accepted whatever payload was
    // POSTed to it — the destination number alone was treated as proof it came
    // from the real carrier, so anyone could forge a "received" text into a
    // user's inbox. Reject anything that doesn't carry a valid provider signature.
    if (settingCheck) {
      var isVerified =
        req.params.type === "twilio"
          ? webhookVerify.verifyTwilioSignature(req, settingCheck.twilio_token)
          : webhookVerify.verifyTelnyxSignature(req, settingCheck.telnyx_public_key);

      if (!isVerified) {
        return res.status(401).json({ status: "false", message: "invalid webhook signature" });
      }
    }

    var media = mediaDescriptors.length > 0 ? await downloadInboundMedia(mediaDescriptors) : [];

    if (settingCheck) {
      var messageData2 = {
        sid: sid,
        user: settingCheck.user,
        number: fromnumber,
        telnyx_number: toNumber,
        type: "receive",
        status: "received",
        isview: "false",
        message: messageText,
        setting: settingCheck._id,
        media: JSON.stringify(media),
      };

      var contact = await Contact.findOne({
        user: { $eq: settingCheck.user },
        number: { $eq: fromnumber },
      });

      if (contact) {
        messageData2.contact = contact._id;
      } else {
        contact = await Contact.findOne({
          user: { $eq: settingCheck.user },
          number: { $eq: fromnumber },
        });
        if (contact) {
          messageData2.contact = contact._id;
        }
      }

      global.io.to(settingCheck.user.toString()).emit("user_message", {
        message: messageText,
        number: fromnumber,
        telnyx_number: toNumber,
        toUser: settingCheck.user,
        contact,
        type: "receive",
        status: "received",
        isview: false,
        settings: settingCheck,
      });
      console.log("settingCheck ===>", settingCheck);
      if (
        settingCheck.emailnotification !== undefined &&
        settingCheck.emailnotification == "true"
      ) {
        var emailSetting = await Email.findOne({
          user: { $eq: settingCheck.user },
        });
        if (emailSetting) {
          try {
            var emailData = {
              subject: `Message from ${fromnumber}`,
              text: "Message received",
              html: `Received Message on ${toNumber}:<br><hr><br><p>${messageText}</p><br><hr><br>`,
            };
            sendEmail(emailSetting, emailData);
          } catch (error) {
            // console.log(error)
          }
        }
      }
      // global.io.to(settingCheck.number).emit('new_message',{message: messageText, number:fromnumber});
      let messageSavedResponse = await Message.create(messageData2);
      console.log("messageSavedResponse ===:", messageSavedResponse);
    }
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    console.log(response.toString());
    res.set("Content-Type", "text/xml");
    if (settingCheck && settingCheck.type == "twilio") {
      sleep(settingCheck, req.body.SmsSid);
    }
    res.send();
  } catch (error) {
    res.status(400).json({ status: "false", message: "something went wrong" });
  }
};
function sleep(settingCheck, sid) {
  return new Promise((resolve) => {
    setTimeout(async function () {
      const client = twilio(settingCheck.twilio_sid, settingCheck.twilio_token);

      for (var i = 0; i < 5; i++) {
        try {
          var deleteMessage = await client.messages(sid).remove();
          if (deleteMessage) {
            break;
          }
        } catch (error) {}
      }
      if (deleteMessage) {
        resolve(true);
      } else {
        resolve(false);
      }
    }, 5000);
  });
}
exports.smsStatus = async (req, res) => {
  try {
    if (req.params.type !== undefined && req.params.type === "twilio") {
      var status = req.body.MessageStatus;
      var sid = req.body.MessageSid;

      var settingCheck = await Setting.findOne({
        number: { $eq: req.body.From },
      });
      if (settingCheck && !webhookVerify.verifyTwilioSignature(req, settingCheck.twilio_token)) {
        return res.status(401).json({ status: "false", message: "invalid webhook signature" });
      }

      if (
        settingCheck &&
        settingCheck.type === "twilio" &&
        (req.body.MessageStatus === "delivered" ||
          req.body.MessageStatus === "undelivered" ||
          req.body.MessageStatus === "failed")
      ) {
        const client = twilio(
          settingCheck.twilio_sid,
          settingCheck.twilio_token
        );
        for (var i = 0; i < 5; i++) {
          try {
            var isDelete = await client.messages(sid).remove();
            if (isDelete) {
              break;
            }
          } catch (error) {}
        } //remove Twilio sms from server right after sent with any status reply state
      }
    } else {
      var data = req.body.data.payload;
      var status = data.to[0].status;
      var sid = data.id;

      var settingCheck = await Setting.findOne({
        number: { $eq: data.to[0].phone_number },
      });
      if (settingCheck && !webhookVerify.verifyTelnyxSignature(req, settingCheck.telnyx_public_key)) {
        return res.status(401).json({ status: "false", message: "invalid webhook signature" });
      }
    }
    var message = await Message.findOne({ sid: { $eq: sid } });
    if (message) {
      message.status = status;
      message.save();
    }
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();
    console.log(response.toString());
    res.set("Content-Type", "text/xml");
    res.send();
  } catch (error) {
    res.status(400).json({ status: "false", message: "something went wrong" });
  }
};

exports.getNumberList = async (req, res) => {
  try {
    var user_id = new mongoose.Types.ObjectId(req.body.user);
    var setting = new mongoose.Types.ObjectId(req.body.setting);
    var message = await Message.aggregate([
      { $match: { user: user_id, setting: setting } },
      { $sort: { _id: -1 } },
      {
        $group: {
          _id: "$number",
          message: { $first: "$message" },
          id: { $first: "$_id" },
          created_at: { $first: "$created_at" },
          contact: { $first: "$contact" },
          message_type: { $first: "$datatype" },
          type: { $first: "$type" },
          telnyx_number: { $first: "$telnyx_number" },
          id: { $first: "$_id" },
          isview: {
            $sum: {
              $cond: { if: { $eq: ["$isview", "false"] }, then: 1, else: 0 },
            },
          },
        },
      },
    ]);
    await Contact.populate(message, { path: "contact" });
    message.sort(function (a, b) {
      return b.created_at - a.created_at;
    });
    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ status: "false", message: "something went wrong" });
  }
};
exports.messageDelete = async (req, res) => {
  try {
    var deletecon = {
      user: { $eq: req.body.user },
      number: { $eq: req.body.number },
    };
    var messages = await Message.deleteMany(deletecon);
    if (messages) {
      res.status(200).send({ status: true, errors: "", data: messages });
    } else {
      res
        .status(400)
        .send({ status: false, errors: "Chat not deleted", data: [] });
    }
  } catch (error) {
    res.status(400).send({ status: false, errors: error.message, data: [] });
  }
};

exports.messageList = async (req, res) => {
  try {
    var filterObject = {
      user: { $eq: req.body.user },
      telnyx_number: { $eq: req.body.number.telnyx_number },
      number: { $eq: req.body.number._id },
      setting: { $eq: req.body.profile },
    };

    await Message.updateMany(
      { ...filterObject, isview: { $eq: "false" } },
      { isview: "true" }
    );
    var messages = await Message.find(filterObject);

    res.send(messages);
  } catch (error) {
    res.status(400).json({ status: "false", message: "something went wrong" });
  }
};
