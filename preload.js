const { contextBridge, ipcRenderer } = require('electron');

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
  },

  closeSetupWizard: () => {
    ipcRenderer.send('close-setup-wizard')
  } 
});
