/**
 * Generate Apple Client Secret JWT for Supabase
 *
 * Usage:
 *   node scripts/generate-apple-secret.js /path/to/AuthKey_XXXXXXXX.p8
 *
 * The generated JWT is valid for 6 months (Apple's maximum).
 * Paste the output into Supabase → Authentication → Providers → Apple → Secret Key.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ─── Configuration ───────────────────────────────────────────
const TEAM_ID = 'CAM72BZ8A2';           // Apple Developer Account/Team ID
const KEY_ID = 'C7F7BPSSW8';            // Key ID from Apple Developer → Keys
const CLIENT_ID = 'com.anonymous.mirrorcleios.auth'; // Service ID (not App/Bundle ID)
// ─────────────────────────────────────────────────────────────

const keyPath = process.argv[2];
if (!keyPath) {
  console.error('Usage: node scripts/generate-apple-secret.js /path/to/AuthKey.p8');
  process.exit(1);
}

const privateKey = fs.readFileSync(path.resolve(keyPath), 'utf8');

// JWT Header
const header = {
  alg: 'ES256',
  kid: KEY_ID,
  typ: 'JWT',
};

// JWT Payload — 6-month expiry (Apple maximum)
const now = Math.floor(Date.now() / 1000);
const payload = {
  iss: TEAM_ID,
  iat: now,
  exp: now + 86400 * 180, // 180 days
  aud: 'https://appleid.apple.com',
  sub: CLIENT_ID,
};

function base64url(data) {
  return Buffer.from(data)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Build the JWT
const headerB64 = base64url(JSON.stringify(header));
const payloadB64 = base64url(JSON.stringify(payload));
const signingInput = `${headerB64}.${payloadB64}`;

const sign = crypto.createSign('SHA256');
sign.update(signingInput);
sign.end();

const signature = sign.sign(privateKey);

// Convert DER signature to raw r||s format for ES256
// DER format: 0x30 [total-len] 0x02 [r-len] [r] 0x02 [s-len] [s]
function derToRaw(derSig) {
  let offset = 2; // skip 0x30 and total length

  // Read r
  if (derSig[offset] !== 0x02) throw new Error('Invalid DER signature');
  offset++;
  const rLen = derSig[offset];
  offset++;
  let r = derSig.slice(offset, offset + rLen);
  offset += rLen;

  // Read s
  if (derSig[offset] !== 0x02) throw new Error('Invalid DER signature');
  offset++;
  const sLen = derSig[offset];
  offset++;
  let s = derSig.slice(offset, offset + sLen);

  // Remove leading zeros (DER adds a 0x00 byte if high bit is set)
  if (r.length === 33 && r[0] === 0) r = r.slice(1);
  if (s.length === 33 && s[0] === 0) s = s.slice(1);

  // Pad to 32 bytes if needed
  const rPad = Buffer.alloc(32);
  const sPad = Buffer.alloc(32);
  r.copy(rPad, 32 - r.length);
  s.copy(sPad, 32 - s.length);

  return Buffer.concat([rPad, sPad]);
}

const rawSig = derToRaw(signature);
const signatureB64 = base64url(rawSig);

const jwt = `${signingInput}.${signatureB64}`;

console.log('\n=== Apple Client Secret JWT ===\n');
console.log(jwt);
console.log('\n=== Instructions ===');
console.log('1. Copy the JWT above (the long string starting with "eyJ...")');
console.log('2. Go to Supabase Dashboard → Authentication → Providers → Apple');
console.log('3. Paste it into the "Secret Key" field');
console.log('4. Save\n');
console.log(`Valid for 180 days (expires: ${new Date((now + 86400 * 180) * 1000).toISOString().split('T')[0]})`);
console.log('Re-run this script to generate a new one before it expires.\n');
