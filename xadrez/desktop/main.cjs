const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { app, BrowserWindow, shell } = require('electron');

const gamePage = path.resolve(__dirname, '../public/index.html');
const gameUrl = pathToFileURL(gamePage).href;
const hasSingleInstanceLock = app.requestSingleInstanceLock();

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
      sandbox: true
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
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
