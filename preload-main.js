const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  closeActiveWindow: () => { 
      ipcRenderer.send('close-active-window');
  },

  startInstance: (args) => {
    ipcRenderer.send('start-instance', args);
  },

  stopInstance: (args) => {
    ipcRenderer.send('stop-instance', args);
  },

  deleteInstance: (args) => {
    ipcRenderer.send('delete-instance', args);
  }
});
