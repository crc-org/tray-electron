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
    var state = await commander.status();
    statusDiv.innerHTML = state;
    createTrayMenu(state);
    await delay(1000);
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
      icon: "./assets/status-" + state + ".png",
      enabled: false
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
    { label: 'Launch Web Console' },
    { label: 'Copy OC Login Command' },
    { type: 'separator' },
    { label: 'Settings' },
    { type: 'separator' },
    { label: 'About' },
    {
      label: 'Exit',
      click() { app.quit(); },
      accelerator: 'CommandOrControl+Q'
    }
  ]);

  tray.setContextMenu(contextMenu);
}

createTrayMenu();
start();