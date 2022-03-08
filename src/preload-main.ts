import { Configuration, IpcEventHandler, StatusState } from "../frontend/src/global";

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  openLinkInDefaultBrowser: (url: string) => {
    ipcRenderer.send('open-link', url)
  },
  
  closeActiveWindow: () => { 
    ipcRenderer.send('hide-active-window');
  },

  startInstance: (args: unknown) => {
    ipcRenderer.send('start-instance', args);
  },

  stopInstance: (args: unknown) => {
    ipcRenderer.send('stop-instance', args);
  },

  deleteInstance: (args: unknown) => {
    ipcRenderer.send('delete-instance', args);
  },

  onStatusChanged: (cb: IpcEventHandler<StatusState>) => {
    ipcRenderer.on('status-changed', cb);
  },

  configurationLoad: (args: unknown) => {
    ipcRenderer.send('config-load', args);
  },

  configurationSave: (args: unknown) => {
    ipcRenderer.send('config-save', args);
  },

  onConfigurationLoaded: (cb: IpcEventHandler<Configuration>) => {
    ipcRenderer.on('config-loaded', cb);
  },
  
  onConfigurationSaved: (cb: IpcEventHandler<{}>) => {
    ipcRenderer.on('config-saved', cb);
  },

  openPullsecretChangeWindow: (args: unknown) => {
    ipcRenderer.send('open-pullsecret-window', args);
  },

  pullsecretChange: (args: {pullsecret: string} ) => {
    ipcRenderer.send('pullsecret-change', args);
  },

  onPullsecretChanged: (cb: IpcEventHandler<unknown>) => {
    ipcRenderer.on('pullsecret-changed', cb);
  },

  retrieveLogs: (args: unknown) => {
    ipcRenderer.send('logs-retrieve', args);
  },

  onLogsRetrieved: (cb: IpcEventHandler<string[]>) => {
    ipcRenderer.on('logs-retrieved', cb);
  },

  telemetry: {
    trackError: (errorMsg: string) => {
      ipcRenderer.send('track-error', errorMsg);
    },

    trackSuccess: (successMsg: string) => {
      ipcRenderer.send('track-success', successMsg);
    }
  },

  about: () => {
    return ipcRenderer.invoke('get-about');
  },

  showModalDialog: (title: string, message: string, ...items: string[]) => {
    return ipcRenderer.invoke('open-dialog', title, message, ...items);
  },

  openSetupWindow: () => {
    return ipcRenderer.invoke('open-setup-window');
  }

});
