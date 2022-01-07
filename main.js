const {
  app,
  clipboard,
  Menu,
  Tray,
  BrowserWindow,
  shell,
  ipcMain,
  session
} = require('electron');
const path = require('path');
const childProcess = require('child_process');
const { dialog } = require('electron')
const os = require('os');
const DaemonCommander = require('./commander');
const Config = require('./config');
const Telemetry = require('./telemetry');
const showNotification = require('./notification');

const config = new Config()
// create the telemetry object
const telemetry = new Telemetry(config.get('enableTelemetry'), getSegmentWriteKey())

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const commander = new DaemonCommander()


/* ----------------------------------------------------------------------------
// Platform specific
// ------------------------------------------------------------------------- */

var isMac = (os.platform() === "darwin")
var isWin = (os.platform() === "win32")

function crcBinary() {
  if (app.isPackaged) {
    if (isWin) {
      // This returns `crc` as located in c:\Program Files\CodeReady Containers\
      return path.join(app.getAppPath(), '..', '..', 'crc');
    }

    if (isMac) {
      // This returns `crc` as located in /Applications/CodeReady Containers.app/Contents/Resources
      return path.join(app.getAppPath(), '..', 'crc');
    }

    // This returns `crc` as located in the webapp folder
    return path.join(app.getAppPath(), 'crc');
  }

  // No path provided
  return "crc"
}

function getSegmentWriteKey() {
  if (app.isPackaged) {
    return 'cvpHsNcmGCJqVzf6YxrSnVlwFSAZaYtp'
  }
  return 'R7jGNYYO5gH0Nl5gDlMEuZ3gPlDJKQak'
}

/* ----------------------------------------------------------------------------
// Basic initilization
// ------------------------------------------------------------------------- */

let miniStatusWindow = undefined
let mainWindow = undefined
let podmanWindow = undefined

function getFrontEndUrl(route) {
  let frontEndUrl = 'http://localhost:3000'
  if (app.isPackaged) {
    frontEndUrl = `file://${path.join(app.getAppPath(), 'frontend', 'build', 'index.html')}`
  }
  return (!route || route === "") ? frontEndUrl : `${frontEndUrl}#/${route}`;
}


/* ----------------------------------------------------------------------------
// Onboarding / setup
// ------------------------------------------------------------------------- */

function needOnboarding() {
  try {
    const cp = childProcess.execFileSync(crcBinary(), ["setup", "--check-only"],
                  { windowsHide: true });
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

  mainWindow.on('close', async e => {
    e.preventDefault()
    const choice = dialog.showMessageBoxSync(mainWindow, {
      message: "Are you sure you want to close the on-boarding wizard?",
      title: "CodeReady Containers",
      type: "warning",
      buttons: ["Yes", "No"],
      defaultId: 1,
      cancelId: 1,
    })

    if (choice == 0) {
      mainWindow.destroy()
      app.quit()
    }
  })

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
    daemonStart();
    delay(4000);
    appStart();
  }
});

if (isMac) {
  app.dock.hide()
}

if (isWin) {
  app.setAppUserModelId("redhat.codereadycontainers.tray")
}

/* ----------------------------------------------------------------------------
// General application start
// ------------------------------------------------------------------------- */

const daemonStart = function() {
  // launching the daemon
  const daemonProcess = childProcess.spawn(crcBinary(), ["daemon", "--watchdog"], {
    detached: true,
    windowsHide: true
  })

  daemonProcess.on('error', err => {
    const msg = `Backend failure, Backend failed to start: ${err}`;
    dialog.showErrorBox(`Backend failure`, msg)
    telemetry.trackError(`Error at main.start(): ${msg}`)
  })

  daemonProcess.stdout.on('date', (data) => {
    // noop
  })

  daemonProcess.stderr.on('data', (data) => {
    // noop
  })
}

const appStart = async function() {
  miniStatusWindow = new BrowserWindow({
    width: 360,
    height: 245,
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

  podmanWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    resizable: false,
    show: false,
  })
  podmanWindow.setMenuBarVisibility(false)

  podmanWindow.on('close', async e => {
    e.preventDefault()
    podmanWindow.hide();
  })

  // Setup tray
  tray = new Tray(path.join(app.getAppPath(), 'assets', 'ocp-logo.png'))
  tray.setToolTip('CodeReady Containers');
  createTrayMenu({CrcStatus: "Unknown", Preset: "Unknown"});

  showMiniStatusWindow = function(e, location) {
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
  }

  tray.on('click', showMiniStatusWindow);
  const {x, y} = tray.getBounds();

  showNotification({
    body: "Tray is running",
    onClick: (e) => { showMiniStatusWindow(e, {x: x, y: y}) }
  })

  // polling status
  while(true) {
    try {
      var status = await commander.status();
      createTrayMenu(status);
      mainWindow.webContents.send('status-changed', status);
      miniStatusWindow.webContents.send('status-changed', status);
    } catch(e) {
      console.log("Status tick: " + e);
      const unknownStatus = { CrcStatus: "Stopped" };
      createTrayMenu(unknownStatus);
      mainWindow.webContents.send('status-changed', unknownStatus);
      miniStatusWindow.webContents.send('status-changed', unknownStatus);
    }
    await delay(1000);
  }
}

/* ----------------------------------------------------------------------------
// Tray menu functions
// ------------------------------------------------------------------------- */

openConfiguration = function() {
  let frontEndUrl = getFrontEndUrl("config");
  mainWindow.loadURL(frontEndUrl);

  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.show();
  });
}

openDetailedStatus = function() {
  let frontEndUrl = getFrontEndUrl("status");
  mainWindow.loadURL(frontEndUrl);

  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.show();
  });
}

openOpenShiftConsole = async function() {
  var result = await commander.consoleUrl();
  var url = result.ClusterConfig.WebConsoleURL;
  shell.openExternal(url);
}

clipOpenShiftLoginAdminCommand = async function() {
  var result = await commander.consoleUrl();
  var command = "oc.exe login -u kubeadmin -p " + result.ClusterConfig.KubeAdminPass + " " + result.ClusterConfig.ClusterAPI;
  clipboard.writeText(command);
}

clipOpenShiftLoginDeveloperCommand = async function() {
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

quitApp = () => {
  miniStatusWindow.destroy()
  mainWindow.destroy()
  podmanWindow.destroy();
  app.quit()
}

createTrayMenu = function(status) {
  var state = status.CrcStatus;
  var preset = status.Preset;

  if(state == "" || state == undefined) state = "Unknown";
  var enabledWhenRunning = isRunning(state);

  const podmanOptions = [{
    label: '  Open Console',
    click() { openPodmanConsole(); },
    enabled: enabledWhenRunning
  }];

  const openShiftOptions = [{
    label: '  Open Console',
    click() { openOpenShiftConsole(); },
    enabled: enabledWhenRunning
  },
  {
    label: '  Copy OC login command (admin)',
    click() { clipOpenShiftLoginAdminCommand(); },
    enabled: enabledWhenRunning
  },
  {
    label: '  Copy OC login command (developer)',
    click() { clipOpenShiftLoginDeveloperCommand(); },
    enabled: enabledWhenRunning
  }];

  let presetOptions = [];
  if (preset !== undefined && preset !== "Unknown") {
    presetOptions = (preset === "openshift") ? openShiftOptions : podmanOptions;
  }

  let menuTemplate = [
    {
      label: state,
      click() { openDetailedStatus(); },
      icon: path.join(app.getAppPath(), 'assets', `status-${mapStateForImage(state)}.png`),
    },
    ...presetOptions,
    {
      label: '  Configuration',
      click() { openConfiguration(); }
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click() { quitApp(); },
      accelerator: 'CommandOrControl+Q'
    }
  ]

  const contextMenu = Menu.buildFromTemplate(menuTemplate);
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

ipcMain.on('open-link', (event, arg) => {
  shell.openExternal(arg)
})


/* ----------------------------------------------------------------------------
// Setup
// ------------------------------------------------------------------------- */

ipcMain.on('start-setup', async (event, args) => {
  // configure telemetry
  let allowTelemetry = args.consentTelemetry ? "yes" : "no";
  try {
    childProcess.execFileSync(crcBinary(), ["config", "set", "consent-telemetry", allowTelemetry],
      { windowsHide: true })
  } catch (e) {
    event.reply('setup-logs-async', e.message)
  }

  // configure preset
  try {
    childProcess.execFileSync(crcBinary(), ["config", "set", "preset", args.preset],
      { windowsHide: true })
  } catch (e) {
    event.reply('setup-logs-async', e.message)
  }

  // run `crc setup`
  let child = childProcess.execFile(crcBinary(), ["setup"])
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  child.on('exit', function() {

    // make sure we start the daemon and store the pull secret
    // if(daemonAvailable()) {
    event.reply('setup-logs-async', "Starting daemon process ...");
    if (daemonStart()) {
      if(args.pullsecret !== "") {  // when no pull-secret given let's continue
        setTimeout(() => {
          commander.pullSecretStore(args.pullsecret).then(value => {
            if(value === "OK") {
              event.reply('setup-logs-async', "Pull secret stored in keyring");
            }
            event.reply('setup-ended');
          }).catch(err => {
            event.reply('setup-logs-async', "Pull secret not stored; Please restart");
          });
        }, 8000);
      } else {
        setTimeout(() => {
          event.reply('setup-logs-async', "Ready.");  // Press Play On Tape ;-P
          event.reply('setup-ended');
        }, 8000);
      }
    }
    //
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
  try {
    commander.start();
    showNotification({
      body: "CodeReady Containers instance is starting"
    })
  }
  catch(e) {
    console.log("Action error: " + e)
  }
});

ipcMain.on('stop-instance', async (event, args) => {
  try {
    commander.stop();
    showNotification({
      body: "CodeReady Containers instance is stopping"
    })
  }
  catch(e) {
    console.log("Action error: " + e)
  }
});

ipcMain.on('delete-instance', async (event, args) => {
  try {
    commander.delete();
    showNotification({
      body: "CodeReady Containers instance is being deleted"
    })
  }
  catch(e) {
    console.log("Action error: " + e)
  }
});


/* ----------------------------------------------------------------------------
// configuration
// ------------------------------------------------------------------------- */

ipcMain.on('config-save', async (event, args) => {
    const values = Object.entries(args).filter(values => values[1] != "");
    commander.configSet({ properties: Object.fromEntries(values) })
          .then(reply => {
            event.reply('config-saved', {});
            showNotification({
              body: "Configuration saved"
            })
          })
          .catch(ex => {
            showNotification({
              body: "Configuation not saved"
            })
            console.log("Failed to set config");
          });
});

ipcMain.on('config-load', async (event, args) => {
    commander.configGet()
          .then(reply => {
            event.reply('config-loaded', reply);
            showNotification({
              body: "Configuration loaded"
            })
          })
          .catch(ex => {
            showNotification({
              body: "Configuation not loaded"
            })
            console.log("Failed to get config");
          });
});

ipcMain.on('pullsecret-change', async (event, args) => {
    commander.pullSecretStore(args.pullsecret)
          .then(value => {
            event.reply('pullsecret-changed', {});
            showNotification({
              body: "Pull secret stored"
            })
          }).catch(err => {
            // error
            showNotification({
              body: "Pull secret not stored"
            })
          });
});


/* ----------------------------------------------------------------------------
// Podman specific
// ------------------------------------------------------------------------- */

const podmanHost = "podman.crc.testing";

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith(`https://${podmanHost}:9090/`)) {
    event.preventDefault()
    callback(true)
  } else {
    callback(false)
  }
})

const podmanSetup = async function() {
  const filter = {
    urls: [`http://${podmanHost}:9090/*`]
  }

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['Authorization'] = 'Bearer Y29yZQ=='
    callback({ requestHeaders: details.requestHeaders })
  });
}

openPodmanConsole = function() {
  podmanSetup();

  var url = `http://${podmanHost}:9090/cockpit/@localhost/podman/index.html`;
  podmanWindow.loadURL(url)

  podmanWindow.webContents.on('did-finish-load', function() {
    podmanWindow.show();
  });
}

/* ----------------------------------------------------------------------------
// Logs
// ------------------------------------------------------------------------- */

// TODO: perhaps move this to renderer process
ipcMain.on('logs-retrieve', async (event, args) => {
  // ouch
  while(true) {
    try {
      var logs = await commander.logs();
      mainWindow.webContents.send('logs-retrieved', logs);
    } catch(e) {
        console.log("Logs tick: " + e)
    }
    await delay(3000);
  }
});

/* ----------------------------------------------------------------------------
// Telemetry
// ------------------------------------------------------------------------- */

ipcMain.on('track-error', async (event, arg) => {
  telemetry.trackError(arg)
})

ipcMain.on('track-success', async (event, arg) => {
  telemetry.trackSuccess(arg)
})