const {app, clipboard, Menu, Tray, BrowserWindow, shell, ipcMain, ipcRenderer} = require('electron');
const path = require('path');
const childProcess = require('child_process');
const { dialog } = require('electron')
const os = require('os');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const DaemonCommander = require('./commander')
const commander = new DaemonCommander()

function crcBinary() {
  if (app.isPackaged) {
    return path.join(app.getAppPath(), 'crc');
  }
  return "crc"
}

let parentWindow = undefined
var isMac = (os.platform() === "darwin")

function needOnboarding() {
  try {
    childProcess.execFileSync(crcBinary(), ["setup", "--check-only"])
    return false
  } catch (e) {
    return true
  }
}

function showOnboarding() {
  parentWindow.loadURL(`file://${path.join(app.getAppPath(), 'src', 'build', 'index.html')}`)
  parentWindow.show()
}


ipcMain.on('start-tray', (event, arg) => {
  start()
})

const start = async function() {
  // Setup tray
  tray = new Tray(path.join(app.getAppPath(), 'assets', 'ocp-logo.png'))
  tray.setToolTip('CodeReady Containers');
  createTrayMenu("Unknown");

  // launching the daemon
  childProcess.execFile(crcBinary(), ["daemon", "--watchdog"], function(err, data) {
    dialog.showErrorBox(`Backend failure`, `Backend failed to start: ${err}`)
  });

  // polling status
  while(true) {
    var state = await commander.status();
    createTrayMenu(state.CrcStatus);
    await delay(1000);
  }
}

openAbout = function() {
  // open with 'ready-to-show'
  const childWindow = new BrowserWindow(
    {
      show: true,
      backgroundColor: '#ffffff',
      webPreferences: {
	      nodeIntegration: true,
	      contextIsolation: false,
	      nativeWindowOpen: true,
        enableRemoteModule: true 
      }
    });
  childWindow.setMenuBarVisibility(false);
  childWindow.loadURL(`file://${path.join(app.getAppPath(), 'about.html')}`)
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
  childWindow.setMenuBarVisibility(false);
  childWindow.loadURL(`file://${path.join(app.getAppPath(), 'settings.html')}`)
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
  childWindow.setMenuBarVisibility(false);
  childWindow.loadURL(`file://${path.join(app.getAppPath(), 'status.html')}`)
}


openWebConsole = async function() {
  var result = await commander.consoleUrl();
  var url = result.ClusterConfig.WebConsoleURL;
  shell.openExternal(url);
}

clipLoginAdminCommand = async function() {
  var result = await commander.consoleUrl();
  var command = "oc.exe login -u kubeadmin -p " + result.ClusterConfig.KubeAdminPass + " " + result.ClusterConfig.ClusterAPI;
  clipboard.writeText(command);
}

clipLoginDeveloperCommand = async function() {
  var result = await commander.consoleUrl();
  var command = "oc.exe login -u developer -p developer " + result.ClusterConfig.ClusterAPI;
  clipboard.writeText(command);
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

createTrayMenu = function(state) {

  if(state == '' || state == undefined) state = `Unknown`;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: state,
      click() { null },
      icon: path.join(app.getAppPath(), 'assets', `status-${mapStateForImage(state)}.png`),
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
      submenu: [
        {
          label: 'Admin',
          click() { clipLoginAdminCommand(); }
        },
        {
          label: 'Developer',
          click() { clipLoginDeveloperCommand(); }
        }
      ]
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

app.whenReady().then(() => {
  // parent window to prevent app closing
  parentWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  })
  parentWindow.setMenuBarVisibility(false)

  if (needOnboarding()) {
    showOnboarding()
  } else {
    start();
  }
});

if (isMac) {
  app.dock.hide()
}

ipcMain.on('close-active-window', () => {
  BrowserWindow.getFocusedWindow().close();
});

ipcMain.on('start-setup', async (event, args) => {
  // configure telemetry
  let allowTelemetry = args.consentTelemetry ? "yes" : "no";
  try {
    childProcess.execFileSync(crcBinary(), ["config", "set", "consent-telemetry", allowTelemetry])
  } catch (e) {
    event.reply('setup-logs-async', e.message)
  }

  // configure preset
  try {
    childProcess.execFileSync(crcBinary(), ["config", "set", "bundle", args.bundle])
  } catch (e) {
    event.reply('setup-logs-async', e.message)
  }

  // run `crc setup`
  let child = childProcess.execFile(crcBinary(), ["setup"])
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  
  // send back stdout async on channel 'setup-logs-async'
  child.stdout.on('data', (data) => {
    event.reply('setup-logs-async', data)
  });

  child.stderr.on('data', (data) => {
    event.reply('setup-logs-async', data)
  });
})

ipcMain.once('close-setup-wizard', () => {
  parentWindow.hide();
  start()
})