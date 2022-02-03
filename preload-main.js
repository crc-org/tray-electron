const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openLinkInDefaultBrowser: (url) => {
    ipcRenderer.send('open-link', url)
  },
  
  closeActiveWindow: () => { 
    ipcRenderer.send('hide-active-window');
  },

  startInstance: (args) => {
    ipcRenderer.send('start-instance', args);
  },

  stopInstance: (args) => {
    ipcRenderer.send('stop-instance', args);
  },

  deleteInstance: (args) => {
    ipcRenderer.send('delete-instance', args);
  },

  onStatusChanged: (cb) => {
    ipcRenderer.on('status-changed', cb);
  },

  configurationLoad: (args) => {
    ipcRenderer.send('config-load', args);
  },

  configurationSave: (args) => {
    ipcRenderer.send('config-save', args);
  },

  onConfigurationLoaded: (cb) => {
    ipcRenderer.on('config-loaded', cb);
  },
  
  onConfigurationSaved: (cb) => {
    ipcRenderer.on('config-saved', cb);
  },

  openPullsecretChangeWindow: (args) => {
    ipcRenderer.send('open-pullsecret-window', args);
  },

  pullsecretChange: (args) => {
    ipcRenderer.send('pullsecret-change', args);
  },

  onPullsecretChanged: (cb) => {
    ipcRenderer.on('pullsecret-changed', cb);
  },

  retrieveLogs: (args) => {
    ipcRenderer.send('logs-retrieve', args);
  },

  onLogsRetrieved: (cb) => {
    ipcRenderer.on('logs-retrieved', cb);
  },

  telemetry: {
    trackError: (errorMsg) => {
      ipcRenderer.send('track-error', errorMsg);
    },

    trackSuccess: (successMsg) => {
      ipcRenderer.send('track-success', successMsg);
    }
  },

  about: () => {
    return ipcRenderer.invoke('get-about');
  }
});
