import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld("dialogApi", {
  getDialogOptions: (): Promise<{}> => {
    return ipcRenderer.invoke('dialog-options');
  },
  buttonClicked: (value: string): void => {
    ipcRenderer.send('dialog-button', value);
  }
});
