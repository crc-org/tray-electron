const path = require('path');
const childProcess = require('child_process');
const {ipcRenderer, remote} = require('electron')

function crcBinary() {
    if (remote.app.isPackaged) {
        return path.join(remote.app.getAppPath(), 'crc');
    }
    return "crc"
}

const start = async function () {
    document.querySelector('#setup').onclick = async () => {
        childProcess.execFile(crcBinary(), ["setup"])
    }

    document.querySelector('#finish').onclick = async () => {
        remote.getCurrentWindow().hide()
        ipcRenderer.send('start-tray')
    }
}

start()