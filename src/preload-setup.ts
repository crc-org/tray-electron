const { contextBridge, ipcRenderer } = require('electron');
import {IpcEventHandler, SetupParams} from '../frontend/src/global';

contextBridge.exposeInMainWorld('api', {
  openLinkInDefaultBrowser: (url: string) => {
    ipcRenderer.send('open-link', url)
  },
  
  closeActiveWindow: () => { 
      ipcRenderer.send('close-active-window');
  },

  startSetup: (args: SetupParams) => {
      ipcRenderer.send('start-setup', args);
  },

  onSetupLogs: (cb:  IpcEventHandler<string>) => {
    ipcRenderer.on('setup-logs-async', cb)
  },

  onSetupError: (cb:  IpcEventHandler<string>) => {
    ipcRenderer.on('setup-logs-error', cb)
  },

  onSetupEnded: (cb: IpcEventHandler<unknown>) => {
    ipcRenderer.on('setup-ended', cb)
  },

  forceEndErrorDuringSetup: () => {
    ipcRenderer.send('force-end-setup-error');
},

  removeSetupLogListeners: () => {
    ipcRenderer.removeAllListeners('setup-logs-async')
    ipcRenderer.removeAllListeners('setup-logs-error')
  },

  closeSetupWizard: () => {
    ipcRenderer.send('close-setup-wizard')
  },

  showModalDialog: (title: string, message: string, ...items: string[]) => {
    return ipcRenderer.invoke('open-dialog', title, message, ...items);
  },

});
