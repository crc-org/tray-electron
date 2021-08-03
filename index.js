const {app, Menu, Tray, BrowserWindow} = require('electron').remote;
var ipc = require('electron').ipcRenderer;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const DaemonCommander = require('./commander')
const commander = new DaemonCommander()

const start = async function() {

  document.querySelector('#stop').onclick = async() => {
    statusDiv.innerHTML = await commander.stop();
  }

  document.querySelector('#start').onclick = async() => {
    statusDiv.innerHTML = await commander.start();
  }

  document.querySelector('#delete').onclick = async() => {
    statusDiv.innerHTML = await commander.delete();
  }

  while(true) {
    var state = await commander.status();
    statusDiv.innerHTML = state.CrcStatus;
    createTrayMenu(state.CrcStatus);
    await delay(1000);
  }

}


openAbout = function() {
  // open with 'ready-to-show'
  const childWindow = new BrowserWindow(
    {
      show: true,
      backgroundColor: '#ffffff'
    });
  childWindow.setMenuBarVisibility (false);
  const url = require('url').format({
    protocol: 'file',
    slashes: true,
    pathname: require('path').join(__dirname, 'about.html')
  })
  childWindow.loadURL(url);
}

openSettings = function() {
  // open with 'ready-to-show'
  const childWindow = new BrowserWindow(
    {
      show: true,
      backgroundColor: '#ffffff',
      webPreferences: {
	      nodeIntegration: true,
	      contextIsolation: false,
	      nativeWindowOpen: true,
        enableRemoteModule: true,
      }
    });
  childWindow.setMenuBarVisibility (false);
  const url = require('url').format({
    protocol: 'file',
    slashes: true,
    pathname: require('path').join(__dirname, 'settings.html')
  })
  childWindow.loadURL(url)
}

openStatus = function() {
  // open with 'ready-to-show'
  const childWindow = new BrowserWindow(
    {
      show: true,
      backgroundColor: '#ffffff',
      webPreferences: {
	      nodeIntegration: true,
	      contextIsolation: false,
	      nativeWindowOpen: true,
        enableRemoteModule: true,
      }
    });
  childWindow.setMenuBarVisibility (false);
  childWindow.webContents.openDevTools();
  const url = require('url').format({
    protocol: 'file',
    slashes: true,
    pathname: require('path').join(__dirname, 'status.html')
  })
  childWindow.loadURL(url)
}


function openWebConsole() {
  //
}

function clipLoginCommand() {
  //
}


mapStateForImage = function(state) {
  state = state.toLowerCase();

  switch(state) {
    case 'running':  // started
    case 'stopped':
    case 'unknown':
      return state;
    case 'starting':
    case 'stopping':
      return 'busy';
    default:
      return 'unknown';
  }
}

// Setup tray
tray = new Tray(`./assets/ocp-logo.png`)
tray.setToolTip('CodeReady Containers');

createTrayMenu = function(state) {

  if(state == '' || state == undefined) state = `Unknown`;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: state,
      click() { null },
      icon: "./assets/status-" + mapStateForImage(state) + ".png",
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Status and logs',
      click() { openStatus(); }
    },
    { type: 'separator' },
    {
      label: 'Start',
      click() { commander.start(); }
    },
    {
      label: 'Stop',
      click() { commander.stop(); }
    },
    {
      label: 'Delete',
      click() { commander.delete(); }
    },
    { type: 'separator' },
    {
      label: 'Launch Web Console',
      click() { openWebConsole(); }
    },
    {
      label: 'Copy OC Login Command',
      click() { clipLoginCommand(); }
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click() { openSettings(); }
    },
    { type: 'separator' },
    {
      label: 'About',
      click() { openAbout(); }
    },
    {
      label: 'Exit',
      click() { app.quit(); },
      accelerator: 'CommandOrControl+Q'
    }
  ]);

  tray.setContextMenu(contextMenu);
}

createTrayMenu("Unknown");
start();
