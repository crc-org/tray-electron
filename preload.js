const { contextBridge, ipcRenderer } = require('electron');

console.log("Script called");
contextBridge.exposeInMainWorld('api', {
  closeActiveWindow: () => { 
      ipcRenderer.send('close-active-window');
  },

  startSetup: (args) => {
      ipcRenderer.send('start-setup', args);
  },

  handleSetupLogs: (cb) => {
    ipcRenderer.on('setup-logs-async', cb)
  },

  removeSetupLogListeners: () => {
    ipcRenderer.removeAllListeners('setup-logs-async')
  }
});
