const {ipcRenderer} = require('electron');
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
