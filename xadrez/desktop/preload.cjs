const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAuth', {
  signIn: () => ipcRenderer.invoke('desktop-google-signin')
});

contextBridge.exposeInMainWorld('desktopWindow', {
  minimize: () => ipcRenderer.invoke('desktop-window-control', 'minimize'),
  toggleMaximize: () => ipcRenderer.invoke('desktop-window-control', 'toggle-maximize'),
  toggleFullscreen: () => ipcRenderer.invoke('desktop-window-control', 'toggle-fullscreen'),
  close: () => ipcRenderer.invoke('desktop-window-control', 'close')
});
