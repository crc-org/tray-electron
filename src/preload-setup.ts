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

  onSetupEnded: (cb: IpcEventHandler<unknown>) => {
    ipcRenderer.on('setup-ended', cb)
  },

  removeSetupLogListeners: () => {
    ipcRenderer.removeAllListeners('setup-logs-async')
  },

  closeSetupWizard: () => {
    ipcRenderer.send('close-setup-wizard')
  },
});
