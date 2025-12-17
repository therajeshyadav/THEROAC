const { google } = require('googleapis');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
require('dotenv').config();

const TOKEN_PATH = path.join(__dirname, '../../gmail_token.json');

const OAuth2 = google.auth.OAuth2;

function createOAuthClient() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground';

  if (!clientId || !clientSecret) {
    console.warn('⚠️  GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET not set in environment. Gmail features will be disabled until configured.');
    // Still create client (will fail if used) so callers can handle absence.
  }

  return new OAuth2(clientId, clientSecret, redirectUri);
}

const oauth2Client = createOAuthClient();

async function ensureTokenDir() {
  const dir = path.dirname(TOKEN_PATH);
  try {
    await fsp.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function loadTokenIfExists() {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const tokenText = await fsp.readFile(TOKEN_PATH, 'utf8');
      const tokenData = JSON.parse(tokenText);
      oauth2Client.setCredentials(tokenData);
      console.log('✅ Loaded existing Gmail token from gmail_token.json');
      return oauth2Client;
    }
    return null;
  } catch (err) {
    console.error('❌ Error while reading Gmail token file:', err.message);
    return null;
  }
}

async function getAccessToken() {
  // If environment variables missing, return null so caller can decide.
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    console.warn('⚠️  Gmail client credentials not configured in environment.');
    return null;
  }

  const client = await loadTokenIfExists();
  if (client) return client;

  // Token not found — return null and also provide URL to create one.
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
    prompt: 'consent',
  });

  console.warn('\n⚠️  No Gmail token found. To enable Gmail sending do the following:');
  console.warn('1) Visit the following URL in your browser to authorize the application:\n');
  console.warn(authUrl);
  console.warn('\n2) After granting access, run:');
  console.warn('   node src/utils/gmailAuth.js --code=YOUR_AUTH_CODE\n');
  return null;
}

async function saveNewToken(authCode) {
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    throw new Error('Gmail client credentials (GMAIL_CLIENT_ID/GMAIL_CLIENT_SECRET) are missing in environment.');
  }

  if (!authCode) {
    throw new Error('Authorization code is required to save new token.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(authCode);
    await ensureTokenDir();
    await fsp.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf8');
    oauth2Client.setCredentials(tokens);
    console.log(`✅ New Gmail token saved to ${TOKEN_PATH}`);
    return tokens;
  } catch (err) {
    console.error('❌ Error generating new Gmail token:', err.message);
    throw err;
  }
}

/**
 * CLI helper: allow running this file directly to save a token.
 * Usage:
 *   node src/utils/gmailAuth.js --code=AUTH_CODE
 * or
 *   node src/utils/gmailAuth.js
 *   (will print auth URL if no code provided)
 */
if (require.main === module) {
  (async () => {
    const arg = process.argv.find((a) => a.startsWith('--code='));
    if (arg) {
      const authCode = arg.split('=')[1];
      try {
        await saveNewToken(authCode);
        process.exit(0);
      } catch (err) {
        console.error('Failed to save token:', err.message);
        process.exit(1);
      }
    } else {
      // Print auth url and exit (do not call process.exit from module load)
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.send'],
        prompt: 'consent',
      });
      console.log('\nVisit this URL to authorize the Gmail API for this app:\n');
      console.log(authUrl);
      console.log('\nThen run: node src/utils/gmailAuth.js --code=YOUR_AUTH_CODE\n');
      process.exit(0);
    }
  })();
}

module.exports = { getAccessToken, saveNewToken };
