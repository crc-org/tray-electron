import { BrowserWindow, app, ipcMain} from 'electron';
import * as path from 'path';

export type DialogType =  "none" | "info" |  "error" | "question" | "warning"
export interface DialogOptions {
  message: string;
  title: string;
  type: DialogType;
}
let dialogWindow: BrowserWindow | undefined;

// TODO: extract this in separate module
function getFrontEndUrl(route: string) {
  let frontEndUrl = 'http://localhost:3000'
  if (app.isPackaged) {
    frontEndUrl = `file://${path.join(app.getAppPath(), 'frontend', 'build', 'index.html')}`
  }
  return (!route || route === "") ? frontEndUrl : `${frontEndUrl}#/${route}`;
}

/**
 * Show Dialog Window. 
 * If parentWindow is provided, dialog will be modal
 * @param parentWindow if set dialog will be modal, optional
 * @param options the dialog options
 * @param items the items, which will be a Buttons in dialog
 * @returns promise which resolve one of 'items' or undefined
 */
export async function showDialog(parentWindow: BrowserWindow | undefined, options: DialogOptions, ...items: string[]): Promise<string | undefined> {
  if(dialogWindow) {
    return Promise.reject('Only one dialog could be displayed at same time!');
  }
  return new Promise(async (resolve, reject) => {
    let itemSelected = false;
    ipcMain.handleOnce('dialog-options', () => {
      return {...options, buttons: items};
    });

    ipcMain.once('dialog-button', (_, value: string) => {
      if(dialogWindow) {
        itemSelected = true;
        dialogWindow.close();
        dialogWindow = undefined;
      }
      if(items.includes(value)) {
        resolve(value);
      } else {
        reject(`Dialog return unknown item: '${value}'!`);
      }
    });

    dialogWindow = new BrowserWindow({
      width: 800,
      height: 200,
      modal: parentWindow !== undefined,
      parent: parentWindow,
      resizable: false,
      maximizable: false,
      minimizable: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, "preload-dialog.js")
      }
      //icon TODO: add icon
    });
    dialogWindow.on('close',  e => {
      if(!itemSelected) {
        dialogWindow = undefined;
        resolve(undefined);
      }
    });

    dialogWindow.setMenuBarVisibility(false)
    await dialogWindow.loadURL(getFrontEndUrl('dialog'));

    dialogWindow.show();
  });
  
}
