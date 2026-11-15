const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAuth', {
  signIn: () => ipcRenderer.invoke('desktop-google-signin')
});
