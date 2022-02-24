import {
  app,
  clipboard,
  Menu,
  Tray,
  BrowserWindow,
  shell,
  ipcMain,
  session,
  dialog
} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as childProcess from 'child_process';
import * as os from 'os';
import { DaemonCommander } from './commander';
import { Config } from './config';
import { Telemetry} from './telemetry';
import {showNotification} from './notification';
import * as which from 'which';

import { showDialog } from './dialog';

const config = new Config()
// create the telemetry object
const telemetry = new Telemetry(config.get('enableTelemetry'), getSegmentWriteKey())

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const commander = new DaemonCommander()


/* ----------------------------------------------------------------------------
// Platform specific
// ------------------------------------------------------------------------- */

let isMac = (os.platform() === "darwin")
let isWin = (os.platform() === "win32")
let occommand = "oc";
if (isWin) {
  occommand = "oc.exe";
}

function crcBinary(): string {
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

let miniStatusWindow: BrowserWindow | undefined = undefined;
let logsWindow: BrowserWindow | undefined = undefined;
let configurationWindow: BrowserWindow | undefined = undefined;
let podmanWindow: BrowserWindow | undefined = undefined;
let setupWindow: BrowserWindow | undefined = undefined;
let pullsecretChangeWindow: BrowserWindow | undefined = undefined;
let aboutWindow: BrowserWindow | undefined = undefined;
let trayMenu: Menu | undefined = undefined;
let logTimer: NodeJS.Timeout | undefined = undefined;
let tray: Tray | undefined = undefined;

function getFrontEndUrl(route: string): string {
  let frontEndUrl = 'http://localhost:3000'
  if (app.isPackaged) {
    frontEndUrl = `file://${path.join(app.getAppPath(), 'frontend', 'build', 'index.html')}`
  }
  return (!route || route === "") ? frontEndUrl : `${frontEndUrl}#/${route}`;
}


/* ----------------------------------------------------------------------------
// Onboarding / setup
// ------------------------------------------------------------------------- */

let isOnboarding = false;

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
  // the onboarding process got started
  isOnboarding = true;

  // parent window to prevent app closing
  setupWindow = new BrowserWindow({
    width: 1024,
    height: 738,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload-setup.js")
    }
  })
  setupWindow.setMenuBarVisibility(false)

  setupWindow.on('close', async e => {
    if(!isOnboarding) {
      // onboarding finished
      return
    }

    // onboarding is active
    e.preventDefault()
    const choice = dialog.showMessageBoxSync(setupWindow!, {
      message: "Are you sure you want to close the on-boarding wizard?",
      title: "CodeReady Containers",
      type: "warning",
      buttons: ["Yes", "No"],
      defaultId: 1,
      cancelId: 1,
    })

    if (choice == 0) {
      setupWindow?.destroy()
      app.quit()
    }
  })

  setupWindow.loadURL(getFrontEndUrl("splash"));
  setupWindow.show()

  telemetry.trackSuccess("Successfully started the onboarding screen")
}


/* ----------------------------------------------------------------------------
// Main functions
// ------------------------------------------------------------------------- */

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (setupWindow && isOnboarding) {
      if (setupWindow.isMinimized()) setupWindow.restore()
      setupWindow.focus()
    } else {
      dialog.showMessageBox({
        title: "CodeReady Containers",
        message: "CodeReady Containers is already running. Please use the tray icon to intereact",
        type: "info"
      }).then(() => {})
      .catch(() => {})
    }
  })

  app.on('browser-window-focus', (e, w) => {
    w.webContents.on('did-fail-load', () => {
      w.webContents.reload()
    })
  })

  app.whenReady().then(() => {
    if (needOnboarding()) {
      showOnboarding()
    } else {
      daemonStart();
      // TODO: Startup delay, only show when daemon active
      delay(8000);
      appStart();
    }
  });

  if (isMac) {
    app.dock.hide()
  }
  
  if (isWin) {
    app.setAppUserModelId("redhat.codereadycontainers.tray")
  }
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


const showMiniStatusWindow = function(e: Electron.KeyboardEvent | Electron.Event, location: {x: number, y: number}) {
  const { x, y } = location;
  const { height, width } = miniStatusWindow!.getBounds();
  // const { trayh, trayw } = tray.getBounds();

  if(miniStatusWindow?.isVisible()) {
    miniStatusWindow.hide();
  } else {
    const yPosition = 20;
    miniStatusWindow?.setBounds({
      x: Math.round(x - width / 2), // all values should be an integer
      y: yPosition,
      height,
      width
    });
    miniStatusWindow?.show();
  }
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
      preload: path.join(__dirname, "preload-main.js"),
      enablePreferredSizeMode: true
    }
  })
  miniStatusWindow.setMenuBarVisibility(false)

  miniStatusWindow.on('close', async e => {
    e.preventDefault()
    miniStatusWindow?.hide();
  })
  miniStatusWindow.loadURL(getFrontEndUrl("ministatus"));
  
  // TODO: deal with duplication
  logsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload-main.js")
    }
  })
  logsWindow.setMenuBarVisibility(false)

  logsWindow.on('close', async e => {
    e.preventDefault()
    logsWindow?.hide();
    // clear log interval timer 
    if(logTimer) {
      clearInterval(logTimer);
      logTimer = undefined;
    }
  })
  logsWindow.loadURL(getFrontEndUrl("logs"));

  // TODO: deal with duplication
  configurationWindow = new BrowserWindow({
    width: 780,
    height: 440,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload-main.js")
    }
  })
  configurationWindow.setMenuBarVisibility(false)

  configurationWindow.on('close', async e => {
    e.preventDefault()
    configurationWindow?.hide();
  })
  configurationWindow.loadURL(getFrontEndUrl("configuration"));

  // TODO: deal with duplication
  pullsecretChangeWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload-main.js")
    }
  })
  pullsecretChangeWindow.setMenuBarVisibility(false)

  pullsecretChangeWindow.on('close', async e => {
    e.preventDefault()
    pullsecretChangeWindow?.hide();
  })
  pullsecretChangeWindow.loadURL(getFrontEndUrl("pullsecret"));

  // TODO: deal with duplication
  podmanWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    resizable: false,
    show: false,
  })
  podmanWindow.setMenuBarVisibility(false)

  podmanWindow.on('close', async e => {
    e.preventDefault()
    podmanWindow?.hide();
  })

  aboutWindow = new BrowserWindow({
    width: 600,
    height: 450,
    resizable: false,
    show: false,
    title: 'About',
    webPreferences: {
      preload: path.join(__dirname, "preload-main.js")
    }
  });

  aboutWindow.setMenuBarVisibility(false);
  aboutWindow.loadURL(getFrontEndUrl('about'));

  aboutWindow.on('close', async e => {
    e.preventDefault()
    aboutWindow?.hide();
  });

  // Setup tray
  tray = new Tray(path.join(app.getAppPath(), 'assets', 'ocp-logo.png'))
  tray.setToolTip('CodeReady Containers');
  createTrayMenu({CrcStatus: "Unknown", Preset: "Unknown"});

  //open tray menu
  tray.on('click', (e, bounds) => {
    tray?.popUpContextMenu(trayMenu);
  });

  tray.on('right-click', (e, bounds) => {
    tray?.popUpContextMenu(trayMenu);
  });

  // polling status
  while(true) {
    try {
      var status = await commander.status();
      createTrayMenu(status);
      miniStatusWindow.webContents.send('status-changed', status);
    } catch(e) {
      console.log("Status tick: " + e);
      const unknownStatus = { CrcStatus: "Stopped" };
      createTrayMenu(unknownStatus);
      miniStatusWindow.webContents.send('status-changed', unknownStatus);
    }
    await delay(1000);
  }
}

/* ----------------------------------------------------------------------------
// Tray menu functions
// ------------------------------------------------------------------------- */

const openConfigurationWindow = function() {
  configurationWindow?.show();
}

const openLogsWindow = function() {
  logsWindow?.show();
}

const openAboutWindow = () => {
  aboutWindow?.show();
}

const openOpenShiftConsole = async function() {
  var result = await commander.consoleUrl();
  var url = result.ClusterConfig.WebConsoleURL;
  shell.openExternal(url);
}

const clipOpenShiftLoginAdminCommand = async function() {
  var result = await commander.consoleUrl();
  var command = `${occommand} login -u kubeadmin -p ` + result.ClusterConfig.KubeAdminPass + " " + result.ClusterConfig.ClusterAPI;
  clipboard.writeText(command);
}

const clipOpenShiftLoginDeveloperCommand = async function() {
  var result = await commander.consoleUrl();
  var command = `${occommand} login -u developer -p developer ` + result.ClusterConfig.ClusterAPI;
  clipboard.writeText(command);
}

const openOpenshiftDevTerminal = async function() {
  prepareDevTerminalForPreset("openshift")
}

const openPodmanDevTerminal = async function() {
  prepareDevTerminalForPreset("podman")
}

type DevTerminalType = "openshift" | "podman";
// preset is either openshift or podman
const prepareDevTerminalForPreset = async function(preset: DevTerminalType) {
  var command = "";

  switch(preset) {
    case "openshift":
      command = "oc-env"
      break
    case "podman":
      command = "podman-env"
      break
    default:
      return false
  }
  //TODO: use iterm or iterm2 for macOS
  if (isWin) {
    var poshPath = which.sync("powershell.exe", { nothrow: true })
    if (poshPath !== null) {
      const posh = childProcess.spawn(poshPath, [`-NoExit -command "& {${crcBinary()} ${command} | Invoke-Expression}"`], {
        detached: true,
        shell: true,
        cwd: os.homedir(),
        stdio: 'ignore'
      })

      posh.unref()
    }
  } else if (isMac) {
    var script = `tell application "Terminal"
    do script "eval $(${crcBinary()} ${command})"
end tell

tell application "System events"
    try
        set frontmost of application process "Terminal" to true
    end try
end`

    const scriptFileName = path.join(os.tmpdir(), 'crc-mac-terminal-script')
    fs.writeFile(scriptFileName, script, (err) => {
      if (err) {
        showNotification({
          body: "Failed to open Developer terminal" + err.message
        })
      } else {
        const terminal = childProcess.spawn('osascript', [scriptFileName], {
          detached: true,
          shell: true,
          stdio: 'ignore'
        })

        terminal.unref()
      }
    })
  } else {
    showNotification({
      body: "Only supported on Windows and macOS currently"
    })
  }
}


/* ----------------------------------------------------------------------------
// Tray menu
// ------------------------------------------------------------------------- */

const mapStateForImage = function(state: string): string {
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

const isRunning = function(state: string): boolean {
  state = state.toLowerCase();
  return state === "running";
}

const isStopped = function(state: string): boolean {
  state = state.toLowerCase();
  return state === "stopped" || state === "unknown";
}

const isBusy = function(state: string): boolean {
  state = state.toLowerCase();
  return state === "starting" || state === "stopping";
}

const quitApp = () => {
  miniStatusWindow?.destroy()
  logsWindow?.destroy();
  configurationWindow?.destroy();
  podmanWindow?.destroy();
  pullsecretChangeWindow?.destroy();
  aboutWindow?.destroy();
  app.releaseSingleInstanceLock();
  app.quit()
}

// copied from frontend/src/types.d.ts
interface State {
  readonly CrcStatus: string;
  readonly Preset?: string;
  readonly OpenshiftStatus?: string;
  readonly OpenshiftVersion?: string;
  readonly PodmanVersion?: string;
  readonly DiskUse?: number;
  readonly DiskSize?: number;
}


const onToggleInstanceState = function(state: string) {
  if (isRunning(state)) {
    console.log("stop")
    stopInstance();
  } 
  if (isStopped(state)) {
    startInstance();
  }
}

const onInstanceDelete = function() {
  deleteInstance();
}

const createTrayMenu = function(status: State) {
  var state = status.CrcStatus;
  var preset = status.Preset;

  if(state == "" || state == undefined) state = "Unknown";
  var enabledWhenRunning = isRunning(state);

  const podmanOptions = [{
    label: '  Open Console',
    click() { openPodmanConsole(); },
    enabled: enabledWhenRunning
  },
  {
    label: '  Open developer terminal',
    click() { openPodmanDevTerminal() },
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
  },
  {
    label: '  Open developer terminal',
    click() { openOpenshiftDevTerminal(); },
    enabled: enabledWhenRunning
  }];

  let presetOptions: Electron.MenuItemConstructorOptions[] = [];
  if (preset !== undefined && preset !== "Unknown") {
    presetOptions = (preset === "openshift") ? openShiftOptions : podmanOptions;
  }

  // TODO: tray should exist
  const {x, y} = (tray as any).getBounds();

  var labelAction = ""
  if (isRunning(state)) {
    labelAction = "  Stop"
  }
  if (isStopped(state)) {
    labelAction = "  Start"
  }
  if (isBusy(state)) {
    labelAction = "  Stop"
  } 

  let menuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: state,
      click(mi, bw, event) { showMiniStatusWindow(event, {x: x, y: y}); },
      icon: path.join(app.getAppPath(), 'assets', `status-${mapStateForImage(state)}.png`),
    },
    {
      label: labelAction,
      click() { onToggleInstanceState(state); },
    },
    {
      label: "  Delete",
      click() { onInstanceDelete(); },
    },
    {
      label: '  Open logs',
      click() { openLogsWindow(); },
    },
    ...presetOptions,
    {
      label: '  Configuration',
      click() { openConfigurationWindow(); }
    },
    {
      type: 'separator'
    },
    {
      label: 'About',
      click() { openAboutWindow(); },
      accelerator: "Shift+A"
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click() { quitApp(); },
      accelerator: 'CommandOrControl+Q'
    }
  ]

  trayMenu = Menu.buildFromTemplate(menuTemplate);
}


/* ----------------------------------------------------------------------------
// Generic events
// ------------------------------------------------------------------------- */

ipcMain.on('close-active-window', () => {
  BrowserWindow.getFocusedWindow()?.close();
});

ipcMain.on('hide-active-window', () => {
  BrowserWindow.getFocusedWindow()?.hide();
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
  } catch (e: unknown) {
    let message;
    if(e instanceof Error) {
      message = e.message;
    } else {
      message = "" + e;
    }
    event.reply('setup-logs-async', message)
  }

  // configure preset
  try {
    childProcess.execFileSync(crcBinary(), ["config", "set", "preset", args.preset],
      { windowsHide: true })
  } catch (e: unknown) {
    let message;
    if(e instanceof Error) {
      message = e.message;
    } else {
      message = "" + e;
    }
    event.reply('setup-logs-async', message)
  }

  // run `crc setup`
  let child = childProcess.execFile(crcBinary(), ["setup"])
  child.stdout?.setEncoding('utf8')
  child.stderr?.setEncoding('utf8')
  child.on('exit', function() {

    // make sure we start the daemon and store the pull secret
    // if(daemonAvailable()) {
    event.reply('setup-logs-async', "Starting daemon process ...");
    daemonStart();
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
  })
  
  // send back stdout async on channel 'setup-logs-async'
  child.stdout?.on('data', (data) => {
    event.reply('setup-logs-async', data)
  });

  child.stderr?.on('data', (data) => {
    event.reply('setup-logs-async', data)
  });
})

ipcMain.once('close-setup-wizard', () => {
  // onboarding finished
  isOnboarding = false;

  setupWindow?.hide();
  appStart();
  setupWindow?.destroy();
})


/* ----------------------------------------------------------------------------
// VM interaction
// ------------------------------------------------------------------------- */

const startInstance = async function() {
  if(await isPullsecretMissing()) {
    /*
    showNotification({
      body: "Unable to start as pull secret is not given."
    })
    */

    pullsecretChangeWindow?.show();

    return; 
  }

  try {
    commander.start();
    /*
    showNotification({
      body: "CodeReady Containers instance is starting"
    })
    */
  }
  catch(e) {
    console.log("Action error: " + e)
  }
}

ipcMain.on('start-instance', async (event, args) => {
  startInstance();
});

const stopInstance = function() {
  try {
    commander.stop();
    /*
    showNotification({
      body: "CodeReady Containers instance is stopping"
    })
    */
  }
  catch(e) {
    console.log("Action error: " + e)
  }
}

ipcMain.on('stop-instance', async (event, args) => {
  stopInstance();
});

const deleteInstance = function() {
  try {
    commander.delete();
    /*
    showNotification({
      body: "CodeReady Containers instance is being deleted"
    })
    */
  }
  catch(e) {
    console.log("Action error: " + e)
  }
}

ipcMain.on('delete-instance', async (event, args) => {
  deleteInstance();
});


/* ----------------------------------------------------------------------------
// configuration
// ------------------------------------------------------------------------- */

ipcMain.on('config-save', async (event, args) => {
    const values = Object.entries(args).filter(values => values[1] != "");
    commander.configSet({ properties: Object.fromEntries(values) })
          .then(reply => {
            event.reply('config-saved', {});
            /*
            showNotification({
              body: "Configuration saved"
            })
            */
          })
          .catch(ex => {
            /*
            showNotification({
              body: "Configuation not saved"
            })
            */
            console.log("Failed to set config");
          });
});

ipcMain.on('config-load', async (event, args) => {
    commander.configGet()
          .then(reply => {
            event.reply('config-loaded', reply);
            /*
            showNotification({
              body: "Configuration loaded"
            })
            */
          })
          .catch(ex => {
            /*
            showNotification({
              body: "Configuation not loaded"
            })
            */
            console.log("Failed to get config");
          });
});


/* ----------------------------------------------------------------------------
// Pull secret specific
// ------------------------------------------------------------------------- */

const isPullsecretMissing = async function() {
  let isPullsecretMissing = true;
  await commander.pullSecretAvailable()
  .then(reply => {
    isPullsecretMissing = false;
  })
  .catch(ex => {
    isPullsecretMissing = true;
  });

  return isPullsecretMissing;
}

ipcMain.on('open-pullsecret-window', async (event, args) => {
  pullsecretChangeWindow?.show();
});

ipcMain.on('pullsecret-change', async (event, args) => {
    commander.pullSecretStore(args.pullsecret)
          .then(value => {
            event.reply('pullsecret-changed', {});
            /*
            showNotification({
              body: "Pull secret stored"
            })
            */
            console.log("Pull-secret stored");
          }).catch(err => {
            // error
            /*
            showNotification({
              body: "Pull secret not stored"
            })
            */
            console.log("Pull-secret not stored");
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
  const tokenPath = path.join(os.homedir(), '.crc', 'machines', 'crc', 'cockpit-bearer-token')
  const token = fs.readFileSync(tokenPath, { encoding: 'utf-8' })

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['Authorization'] = `Bearer ${token.trim()}`
    callback({ requestHeaders: details.requestHeaders })
  });
}

const openPodmanConsole = function() {
  podmanSetup();

  var url = `http://${podmanHost}:9090/cockpit/@localhost/podman/index.html`;
  podmanWindow?.loadURL(url)

  podmanWindow?.webContents.on('did-finish-load', function() {
    podmanWindow?.show();
  });
}

/* ----------------------------------------------------------------------------
// Logs
// ------------------------------------------------------------------------- */

// TODO: perhaps move this to renderer process
ipcMain.on('logs-retrieve', async (event, args) => {
  if(logTimer){
    clearInterval(logTimer);
  }
  let lastLogLine = 0;
  logTimer = setInterval(async () => {
    try {
      let logs = await commander.logs();
      const logsDiff = logs.Messages.slice(lastLogLine, logs.Messages.length - 1);
      lastLogLine = logs.Messages.length;
      logsWindow?.webContents.send('logs-retrieved', logsDiff);
    } catch(e) {
        console.log("Logs tick: " + e)
    }
  }, 3000);
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

/* ----------------------------------------------------------------------------
// About
// ------------------------------------------------------------------------- */

ipcMain.handle('get-about', async () => {
  const version = await commander.version();
  return {
    appVersion: app.getVersion(),
    crcVersion: version.CrcVersion,
    crcCommit: version.CommitSha,
    ocpBundleVersion: version.OpenshiftVersion,
    podmanVersion: version.PodmanVersion
  };
});

/* ----------------------------------------------------------------------------
// Dialog
// ------------------------------------------------------------------------- */

ipcMain.handle('open-dialog', async (event, title, message, ...items) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  return showDialog(window!, {title, message, type: "question"}, ...items);
});
