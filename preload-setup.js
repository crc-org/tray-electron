const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openLinkInDefaultBrowser: (url) => {
    ipcRenderer.send('open-link', url)
  },
  
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

  removeSetupLogListeners: () => {
    ipcRenderer.removeAllListeners('setup-logs-async')
  },

  closeSetupWizard: () => {
    ipcRenderer.send('close-setup-wizard')
  },
});
