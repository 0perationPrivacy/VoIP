const crypto = require('crypto');

// AES-256-GCM at-rest encryption for provider credentials (Telnyx api_key,
// Twilio sid/token, Twilio API key secret, SIP password). Self-hosting-friendly:
// the key lives in an env var, not an external KMS.
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const PREFIX = 'enc:v1:';

function getKey() {
  const keyHex = (process.env.CREDENTIALS_ENCRYPTION_KEY || '').trim();
  if (!keyHex || keyHex.startsWith('CHANGE_ME')) {
    throw new Error(
      'CREDENTIALS_ENCRYPTION_KEY is not set. Generate one with `openssl rand -hex 32` and set it in your .env.'
    );
  }
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
  }
  return key;
}

function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined || plaintext === '') return plaintext;
  // Re-saving an already-encrypted value (e.g. an unrelated field changed on
  // the same document) must not double-encrypt it.
  if (typeof plaintext === 'string' && plaintext.startsWith(PREFIX)) return plaintext;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext.toString('hex')}`;
}

function decrypt(value) {
  if (value === null || value === undefined || value === '') return value;
  if (typeof value !== 'string' || !value.startsWith(PREFIX)) {
    // Row predates this change and hasn't been re-saved yet — return the
    // legacy plaintext as-is rather than breaking every existing profile.
    return value;
  }

  const [ivHex, tagHex, dataHex] = value.slice(PREFIX.length).split(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return plaintext.toString('utf8');
}

// SIP credential passwords for both providers. Twilio rejects anything not
// meeting its own strength check (12+ chars, upper+lower+digit — error 21240);
// a plain crypto.randomBytes(...).toString('hex') can never satisfy that since
// hex is only [0-9a-f] and so never contains an uppercase character. Guarantee
// each required class is present, then fill/shuffle the rest with crypto.randomInt
// (CSPRNG, not Math.random).
function generateStrongPassword(length = 24) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const all = upper + lower + digits;
  const pick = charset => charset[crypto.randomInt(charset.length)];

  const chars = [pick(upper), pick(lower), pick(digits)];
  for (let i = chars.length; i < length; i++) {
    chars.push(pick(all));
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

module.exports = {encrypt, decrypt, generateStrongPassword};
