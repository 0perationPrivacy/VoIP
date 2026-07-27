const crypto = require('crypto');
const twilio = require('twilio');
const {combineURLs} = require('./common.helper');

// Telnyx signs webhooks with Ed25519 (`telnyx-signature-ed25519` / `telnyx-timestamp`
// headers) using a public key from the sender's Telnyx Portal account — different per
// Telnyx account, so it's stored per-Setting rather than as one global env var.
// Node's crypto.verify needs the raw 32-byte key wrapped in an SPKI DER structure;
// this is the fixed RFC 8410 prefix for Ed25519, so no extra dependency is needed.
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');
const TELNYX_TOLERANCE_SECONDS = 300;

function verifyTelnyxSignature(req, publicKeyBase64) {
  const signature = req.headers['telnyx-signature-ed25519'];
  const timestamp = req.headers['telnyx-timestamp'];
  if (!signature || !timestamp || !publicKeyBase64 || !req.rawBody) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > TELNYX_TOLERANCE_SECONDS) return false;

  try {
    const rawKey = Buffer.from(publicKeyBase64, 'base64');
    if (rawKey.length !== 32) return false;
    const derKey = Buffer.concat([ED25519_SPKI_PREFIX, rawKey]);
    const signedPayload = Buffer.concat([Buffer.from(`${timestamp}|`), req.rawBody]);

    return crypto.verify(null, signedPayload, {key: derKey, format: 'der', type: 'spki'}, Buffer.from(signature, 'base64'));
  } catch (e) {
    return false;
  }
}

// Twilio signs the exact webhook URL it was configured with (HMAC-SHA1 over the
// URL + sorted form params), not the raw body — req.body from bodyParser.urlencoded
// is exactly what the SDK expects here.
function verifyTwilioSignature(req, authToken) {
  const signature = req.headers['x-twilio-signature'];
  if (!signature || !authToken || !process.env.BASE_URL) return false;

  const url = combineURLs(process.env.BASE_URL.trim(), req.originalUrl.replace(/^\/+/, ''));
  return twilio.validateRequest(authToken, signature, url, req.body);
}

module.exports = {verifyTelnyxSignature, verifyTwilioSignature};
