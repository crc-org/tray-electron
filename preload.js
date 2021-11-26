const { contextBridge, ipcRenderer } = require('electron')

console.log("Script called");
contextBridge.exposeInMainWorld('api', {
  closeActiveWindow: () => { ipcRenderer.send('close-active-window') }
});