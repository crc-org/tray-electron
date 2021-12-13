const {app, clipboard, Menu, Tray, BrowserWindow, shell, ipcMain, ipcRenderer} = require('electron');
const path = require('path');
const childProcess = require('child_process');
const { dialog } = require('electron')
const os = require('os');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const DaemonCommander = require('./commander');
const commander = new DaemonCommander()

function crcBinary() {
  if (app.isPackaged) {
    return path.join(app.getAppPath(), 'crc');
  }
  return "crc"
}

let mainWindow = undefined
var isMac = (os.platform() === "darwin")

function needOnboarding() {
  try {
    const cp = childProcess.execFileSync(crcBinary(), ["daemon", "--watchdog"])
    cp.kill()
    return false
  } catch (e) {
    return true
  }
}

function getFrontEndUrl(route) {
  let frontEndUrl = 'http://localhost:3000'
  if (app.isPackaged) {
    frontEndUrl = `file://${path.join(app.getAppPath(), 'frontend', 'build', 'index.html')}`
  }
  return (!route || route === "") ? frontEndUrl : `${frontEndUrl}#/${route}`;
}

function showOnboarding() {
  let frontEndUrl = getFrontEndUrl();
  mainWindow.loadURL(frontEndUrl)
  mainWindow.show()
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

openConfiguration = function() {
  let frontEndUrl = getFrontEndUrl("config");
  mainWindow.loadURL(frontEndUrl)
  mainWindow.show()
}

openDetailedStatus = function() {
  let frontEndUrl = getFrontEndUrl("status");
  mainWindow.loadURL(frontEndUrl)
  mainWindow.show()
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
      click() { openDetailedStatus(); },
      icon: path.join(app.getAppPath(), 'assets', `status-${mapStateForImage(state)}.png`)
    },
    {
      label: 'Launch Console',
      click() { openWebConsole(); }
    },
    {
      label: 'Copy OC login command (admin)',
      click() { clipLoginAdminCommand(); }
    },
    {
      label: 'Copy OC login command (developer)',
      click() { clipLoginDeveloperCommand(); }
    },
    {
      label: 'Configuration',
      click() { openConfiguration(); }
    },
    { type: 'separator' },
    /*{
      label: 'Settings',
      click() { openSettings(); }
    },*/
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
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 738,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  })
  mainWindow.setMenuBarVisibility(false)

  //if (needOnboarding()) {
  //  showOnboarding()
  //} else {
    start();
  //}
});

if (isMac) {
  app.dock.hide()
}

ipcMain.on('close-active-window', () => {
  BrowserWindow.getFocusedWindow().hide();
});


/* ----------------------------------------------------------------------------
// Setup
// ------------------------------------------------------------------------- */

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
  mainWindow.hide();
  start()
})


/* ----------------------------------------------------------------------------
// VM interaction
// ------------------------------------------------------------------------- */

ipcMain.on('start-instance', async (event, args) => {
  commander.start();
});

ipcMain.on('stop-instance', async (event, args) => {
  commander.stop();
});

ipcMain.on('delete-instance', async (event, args) => {
  commander.delete();
});
