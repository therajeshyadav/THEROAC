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
    console.warn('GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET missing.');
  }

  return new OAuth2(clientId, clientSecret, redirectUri);
}

const oauth2Client = createOAuthClient();

async function ensureTokenDir() {
  const dir = path.dirname(TOKEN_PATH);
  try {
    await fsp.mkdir(dir, { recursive: true });
  } catch (e) {}
}

async function loadTokenIfExists() {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const tokenText = await fsp.readFile(TOKEN_PATH, 'utf8');
      const tokenData = JSON.parse(tokenText);
      oauth2Client.setCredentials(tokenData);
      console.log('Loaded existing Gmail token from gmail_token.json');

      // Ensure access token refresh happens automatically
      await oauth2Client.getAccessToken();

      return oauth2Client;
    }
    return null;
  } catch (err) {
    console.error('Error reading Gmail token:', err.message);
    return null;
  }
}

async function getAccessToken() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("Gmail OAuth credentials missing.");
    return oauth2Client;
  }

  const loadedClient = await loadTokenIfExists();
  if (loadedClient) return loadedClient;

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
    prompt: 'consent',
  });

  console.warn('\n No Gmail token found. Authorize the app:');
  console.warn(authUrl);
  console.warn('Then run:\n node src/utils/gmailAuth.js --code=AUTH_CODE\n');

  return oauth2Client;
}

async function saveNewToken(authCode) {
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    throw new Error('Missing Gmail OAuth environment variables.');
  }

  if (!authCode) {
    throw new Error('Authorization code is required.');
  }

  try {
    const { tokens } = await oauth2Client.getToken(authCode);
    await ensureTokenDir();
    await fsp.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf8');
    oauth2Client.setCredentials(tokens);
    console.log(`New Gmail token saved to ${TOKEN_PATH}`);
    return tokens;
  } catch (err) {
    console.error('Error saving Gmail token:', err.message);
    throw err;
  }
}

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
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.send'],
        prompt: 'consent',
      });
      console.log('\nVisit this URL to authorize Gmail:\n');
      console.log(authUrl);
      console.log('\nThen run: node src/utils/gmailAuth.js --code=YOUR_AUTH_CODE\n');
      process.exit(0);
    }
  })();
}

module.exports = { getAccessToken, saveNewToken };
