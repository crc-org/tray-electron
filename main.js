const {
  app,
  clipboard,
  Menu,
  Tray,
  BrowserWindow,
  shell,
  ipcMain 
} = require('electron');
const path = require('path');
const childProcess = require('child_process');
const { dialog } = require('electron')
const os = require('os');
const DaemonCommander = require('./commander');
const Config = require('./config');
const Telemetry = require('./telemetry');

const config = new Config()
// create the telemetry object
const telemetry = new Telemetry(config.get('enableTelemetry'))

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const commander = new DaemonCommander()

function crcBinary() {
  if (app.isPackaged) {
    return path.join(app.getAppPath(), 'crc');
  }
  return "crc"
}

let miniStatusWindow = undefined
let mainWindow = undefined
var isMac = (os.platform() === "darwin")

function getFrontEndUrl(route) {
  let frontEndUrl = 'http://localhost:3000'
  if (app.isPackaged) {
    frontEndUrl = `file://${path.join(app.getAppPath(), 'frontend', 'build', 'index.html')}`
  }
  return (!route || route === "") ? frontEndUrl : `${frontEndUrl}#/${route}`;
}

function needOnboarding() {
  try {
    const cp = childProcess.execFileSync(crcBinary(), ["daemon", "--watchdog"])
    cp.kill()
    return false
  } catch (e) {

    return true
  }
}

function showOnboarding() {
  // parent window to prevent app closing
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 738,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload-setup.js")
    }
  })
  mainWindow.setMenuBarVisibility(false)

  let frontEndUrl = getFrontEndUrl();
  mainWindow.loadURL(frontEndUrl)
  mainWindow.show()

  telemetry.trackSuccess("Successfully started the onboarding screen")
}


/* ----------------------------------------------------------------------------
// Main functions
// ------------------------------------------------------------------------- */

app.whenReady().then(() => {
  if (needOnboarding()) {
    showOnboarding()
  } else {
    appStart();
  }
});

if (isMac) {
  app.dock.hide()
}

const appStart = async function() {
  miniStatusWindow = new BrowserWindow({
    width: 360,
    height: 250,
    resizable: false,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, "preload-main.js")
    }
  })
  miniStatusWindow.setMenuBarVisibility(false)

  miniStatusWindow.on('close', async e => {
    e.preventDefault()
    miniStatusWindow.hide();
  })
  miniStatusWindow.loadURL(getFrontEndUrl("ministatus"));
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload-main.js")
    }
  })
  mainWindow.setMenuBarVisibility(false)

  mainWindow.on('close', async e => {
    e.preventDefault()
    mainWindow.hide();
  })

  // Setup tray
  tray = new Tray(path.join(app.getAppPath(), 'assets', 'ocp-logo.png'))
  tray.setToolTip('CodeReady Containers');
  createTrayMenu("Unknown");

  tray.on('click', function(e, location) {
    const { x, y } = location;
    const { height, width } = miniStatusWindow.getBounds();
    const { trayh, trayw } = tray.getBounds();

    if(miniStatusWindow.isVisible()) {
      miniStatusWindow.hide();
    } else {
      const yPosition = 20;
      miniStatusWindow.setBounds({
        x: x - width / 2,
        y: yPosition,
        height,
        width
      });
      miniStatusWindow.show();
    }
  });

  // launching the daemon
  childProcess.execFile(crcBinary(), ["daemon", "--watchdog"], function(err, data) {
    const msg = `Backend failure, Backend failed to start: ${err}`;
    dialog.showErrorBox(`Backend failure`, msg)
    telemetry.trackError(`Error at main.start(): ${msg}`)
  });

  // polling status
  while(true) {
    var state = await commander.status();
    createTrayMenu(state.CrcStatus);
    await delay(1000);
    mainWindow.webContents.send('status-changed', state);
    miniStatusWindow.webContents.send('status-changed', state);
  }
}

/* ----------------------------------------------------------------------------
// Tray menu functions
// ------------------------------------------------------------------------- */

openConfiguration = function() {
  let frontEndUrl = getFrontEndUrl("config");
  mainWindow.loadURL(frontEndUrl);

    // when ready
  mainWindow.show();
}

openDetailedStatus = function() {
  let frontEndUrl = getFrontEndUrl("status");
  mainWindow.loadURL(frontEndUrl);

  // when ready
  mainWindow.show();
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


/* ----------------------------------------------------------------------------
// Tray menu
// ------------------------------------------------------------------------- */

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

isRunning = function(state) {
  state = state.toLowerCase();
  return state === "running";
}

createTrayMenu = function(state) {
  if(state == '' || state == undefined) state = `Unknown`;
  var enabledWhenRunning = isRunning(state);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: state,
      click() { openDetailedStatus(); },
      icon: path.join(app.getAppPath(), 'assets', `status-${mapStateForImage(state)}.png`),
    },
    {
      label: '  Launch Console',
      click() { openWebConsole(); },
      enabled: enabledWhenRunning
    },
    {
      label: '  Copy OC login command (admin)',
      click() { clipLoginAdminCommand(); },
      enabled: enabledWhenRunning
    },
    {
      label: '  Copy OC login command (developer)',
      click() { clipLoginDeveloperCommand(); },
      enabled: enabledWhenRunning
    },
    {
      label: '  Configuration',
      click() { openConfiguration(); }
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click() { app.quit(); },
      accelerator: 'CommandOrControl+Q'
    }
  ]);

  tray.setContextMenu(contextMenu);
}


/* ----------------------------------------------------------------------------
// Generic events
// ------------------------------------------------------------------------- */

ipcMain.on('close-active-window', () => {
  BrowserWindow.getFocusedWindow().close();
});

ipcMain.on('hide-active-window', () => {
  BrowserWindow.getFocusedWindow().hide();
});

ipcMain.on('start-tray', (event, arg) => {
  appStart()
})


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
    childProcess.execFileSync(crcBinary(), ["config", "set", "preset", args.bundle])
  } catch (e) {
    event.reply('setup-logs-async', e.message)
  }

  // run `crc setup`
  let child = childProcess.execFile(crcBinary(), ["setup"])
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  child.on('exit', function() {
    event.reply('setup-ended');
  })
  
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
  appStart()
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
