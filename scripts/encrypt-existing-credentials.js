// One-time migration: re-saves every Setting document so the schema's
// encrypt-on-set hook (app/model/setting.model.js) turns any legacy plaintext
// credential fields into ciphertext. Safe to run more than once — reading a
// field decrypts it first, so re-running just re-encrypts with a fresh IV
// rather than double-encrypting.
//
// Run manually, with CREDENTIALS_ENCRYPTION_KEY already set in the environment:
//   NODE_ENV=production node scripts/encrypt-existing-credentials.js
require('../config.js');

const mongoose = require('../config/db.config');
const Setting = require('../app/model/setting.model');

const FIELDS = ['api_key', 'twilio_sid', 'twilio_token', 'app_secret', 'sip_password'];

async function run() {
  await new Promise((resolve, reject) => {
    mongoose.connection.once('open', resolve);
    mongoose.connection.once('error', reject);
  });

  const settings = await Setting.find({});
  let touched = 0;

  for (const setting of settings) {
    let changed = false;
    for (const field of FIELDS) {
      // Reading applies the decrypt getter; reassigning the same plaintext
      // back through the encrypt setter is what forces re-encryption.
      const value = setting[field];
      if (value) {
        setting[field] = value;
        changed = true;
      }
    }
    if (changed) {
      await setting.save();
      touched++;
    }
  }

  console.log(`Done. Re-saved ${touched} of ${settings.length} Setting documents.`);
  await mongoose.connection.close();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
