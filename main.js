const { app, BrowserWindow } = require('electron')
const url = require('url');

app.once('ready', () => {
  var window = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#ffffff',
    webPreferences: {
	    nodeIntegration: true,
	    contextIsolation: false,
	    enableWebSQL: false,
	    nativeWindowOpen: true,
      enableRemoteModule: true,
    }
  })

  window.setMenuBarVisibility(false);
  window.loadURL(url.format({ pathname: 'index.html', protocol: 'file:', slashes: true }));
  window.webContents.openDevTools();
  window.once('closed', () => window = null);
});

