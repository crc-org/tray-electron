const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  closeActiveWindow: () => { 
      ipcRenderer.send('close-active-window');
  },

  startSetup: (args) => {
      ipcRenderer.send('start-setup', args);
  },

  onSetupLogs: (cb) => {
    ipcRenderer.on('setup-logs-async', cb)
  },

  onSetupEnded: (cb) => {
    ipcRenderer.on('setup-ended', cb)
  },

  onConfigurationSaved: (cb) => {
    ipcRenderer.on('config-saved', cb)
  },

  removeSetupLogListeners: () => {
    ipcRenderer.removeAllListeners('setup-logs-async')
  },

  closeSetupWizard: () => {
    ipcRenderer.send('close-setup-wizard')
  },
});
