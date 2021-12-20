const { contextBridge, ipcRenderer } = require('electron');
const Config = require('./config');
const Telemetry = require('./telemetry');


const config = new Config()
const telemetry = new Telemetry(config.get('enableTelemetry'))

contextBridge.exposeInMainWorld('api', {
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
      telemetry.trackError(errorMsg);
    },

    trackSuccess: (successMsg) => {
      telemetry.trackSuccess(successMsg);
    }
  }
});