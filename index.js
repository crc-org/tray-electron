const {Menu, Tray} = require('electron').remote;
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
    statusDiv.innerHTML = await commander.status();
    await delay(1000);
  }

}

start();

// Setup tray
tray = new Tray(`./assets/ocp-logo.png`)

const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Unknown',
      click() { null }
    },
    { type: 'separator' },
    { label: 'Status and logs' },
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
    { label: 'Launch Web COnsole' },
    { label: 'Copy OC Login Command' },
    { type: 'separator' },
    { label: 'Settings' },
    { type: 'separator' },
    { label: 'About' },
    { type: 'separator' },
    {
      label: 'Exit',
      click() { app.quit(); },
      accelerator: 'CommandOrControl+Q'
    }
  ]);

tray.setToolTip('CodeReady Containers')
tray.setContextMenu(contextMenu)