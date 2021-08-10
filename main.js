const {app, clipboard, Menu, Tray, BrowserWindow, shell, ipcMain} = require('electron');
const path = require('path');
const childProcess = require('child_process');
const { dialog } = require('electron')
const fs = require("fs");
const k8s = require('@kubernetes/client-node');

const DaemonCommander = require('./commander')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const commander = new DaemonCommander()

function crcBinary() {
  if (app.isPackaged) {
    return path.join(app.getAppPath(), 'crc');
  }
  return "crc"
}

let parentWindow = undefined

function needOnboarding() {
  try {
    childProcess.execFileSync(crcBinary(), ["setup", "--check-only"])
    return false
  } catch (e) {
    return true
  }
}

function showOnboarding() {
  parentWindow.loadURL(`file://${path.join(app.getAppPath(), 'welcome.html')}`)
  parentWindow.show()
}

ipcMain.on('start-tray', (event, arg) => {
  start()
})

const start = async function() {
  // Setup tray
  tray = new Tray(path.join(app.getAppPath(), 'assets', 'ocp-logo.png'))
  tray.setToolTip('CodeReady Containers');
  refreshTrayMenu();

  tray.on('click', () => {
    try {
      const k8sConfig = new k8s.KubeConfig()
      const home = k8s.findHomeDir()
      const config = path.join(home, '.kube', 'config')
      k8sConfig.loadFromFile(config)

      contexts = k8sConfig.getContexts().map((c) => {
        return {
          label: c.name,
          type: 'checkbox',
          checked: c.name === k8sConfig.getCurrentContext(),
          click() {
            k8sConfig.setCurrentContext(c.name)
            fs.writeFile(config, k8s.dumpYaml(JSON.parse(k8sConfig.exportConfig())), () => {})
          }
        }
      })

      refreshTrayMenu()
    } catch (e) {
      console.log(`Cannot update Kubernetes menu: ${e}`)
    }
  })

  app.dock.hide()

  // launching the daemon
  childProcess.execFile(crcBinary(), ["daemon", "--watchdog"], function(err, data) {
    dialog.showErrorBox(`Backend failure`, `Backend failed to start: ${err}`)
  });

  // polling status
  while(true) {
    var ret = await commander.status();
    if (ret.CrcStatus) {
      state = ret.CrcStatus
      refreshTrayMenu()
    }
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

let state = 'Unknown'
let contexts = []

refreshTrayMenu = function() {
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
    {
      label: 'Kubernetes context',
      submenu: contexts
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
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: true,
      enableRemoteModule: true
    }
  })

  if (needOnboarding()) {
    showOnboarding()
  } else {
    start();
  }
});