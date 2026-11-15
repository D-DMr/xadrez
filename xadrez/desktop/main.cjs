const crypto = require('node:crypto');
const http = require('node:http');
const path = require('node:path');
const { fileURLToPath, pathToFileURL } = require('node:url');
const { app, BrowserWindow, ipcMain, shell } = require('electron');

const gamePage = path.resolve(__dirname, '../public/index.html');
const preloadPage = path.resolve(__dirname, 'preload.cjs');
const gameUrl = pathToFileURL(gamePage).href;
const googleDesktopClientId = '424719795420-3fb0dnjsvuekpng6sjb9dqt6d1jbs47j.apps.googleusercontent.com';
const hasSingleInstanceLock = app.requestSingleInstanceLock();
let signInInProgress = null;

function signInWithGoogle() {
  if (signInInProgress) return signInInProgress;

  signInInProgress = new Promise((resolve, reject) => {
    const state = crypto.randomBytes(32).toString('base64url');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    let redirectUri;
    let settled = false;
    let timeout;

    const server = http.createServer(async (request, response) => {
      const callback = new URL(request.url, 'http://127.0.0.1');
      if (request.method !== 'GET' || callback.pathname !== '/oauth2callback') {
        response.writeHead(404).end();
        return;
      }

      const returnedState = callback.searchParams.get('state') || '';
      if (returnedState.length !== state.length ||
          !crypto.timingSafeEqual(Buffer.from(returnedState), Buffer.from(state))) {
        response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Invalid OAuth state.');
        return;
      }

      const code = callback.searchParams.get('code');
      const providerError = callback.searchParams.get('error');
      response.writeHead(providerError || !code ? 400 : 200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'"
      }).end(providerError || !code
        ? 'Sign-in was cancelled. You can close this window.'
        : 'Sign-in complete. You can close this window and return to Xadrez Total.');

      if (providerError || !code) {
        finish(new Error(providerError || 'Google did not return an authorization code.'));
        return;
      }

      try {
        const tokens = await exchangeGoogleCode(code, codeVerifier, redirectUri);
        finish(null, { idToken: tokens.id_token });
      } catch (error) {
        finish(error);
      }
    });

    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      server.close();
      if (error) reject(error);
      else resolve(result);
    };

    server.on('error', finish);
    server.listen(0, '127.0.0.1', async () => {
      const address = server.address();
      redirectUri = `http://127.0.0.1:${address.port}/oauth2callback`;
      const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authorizationUrl.search = new URLSearchParams({
        client_id: googleDesktopClientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      }).toString();

      timeout = setTimeout(() => finish(new Error('Google sign-in timed out. Please try again.')), 180000);
      try {
        await shell.openExternal(authorizationUrl.href);
      } catch (error) {
        finish(error);
      }
    });
  }).finally(() => {
    signInInProgress = null;
  });

  return signInInProgress;
}

async function exchangeGoogleCode(code, codeVerifier, redirectUri) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: googleDesktopClientId,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    })
  });
  const tokens = await response.json();
  if (!response.ok || typeof tokens.id_token !== 'string') {
    throw new Error(tokens.error_description || tokens.error || 'Google could not complete sign-in.');
  }
  return tokens;
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 360,
    minHeight: 500,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: preloadPage
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (new URL(url).protocol === 'https:') shell.openExternal(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    if (url !== gameUrl) event.preventDefault();
  });
  window.loadFile(gamePage);
}

if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const window = BrowserWindow.getAllWindows()[0];
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });

  app.whenReady().then(() => {
    ipcMain.handle('desktop-google-signin', event => {
      const window = BrowserWindow.getAllWindows()[0];
      const senderUrl = new URL(event.senderFrame.url);
      if (!window || event.sender !== window.webContents ||
          senderUrl.protocol !== 'file:' || path.resolve(fileURLToPath(senderUrl)) !== gamePage) {
        throw new Error('Sign-in can only be started from the game window.');
      }
      return signInWithGoogle();
    });
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
