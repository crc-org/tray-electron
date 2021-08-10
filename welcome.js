const path = require('path');
const { spawn } = require('child_process');
const {ipcRenderer, remote} = require('electron')

function crcBinary() {
    if (remote.app.isPackaged) {
        return path.join(remote.app.getAppPath(), 'crc');
    }
    return "crc"
}

const start = async function () {
    document.querySelector('#setup').onclick = async () => {
        const setup = spawn(crcBinary(), ['setup'], {
            stdio: ['pipe']
        })

        setup.stderr.on('data', (data) => {
            document.getElementById("setup-logs").value += data
        });

        setup.on('close', (code) => {
            if (code !== 0) {
                document.getElementById("setup-logs").value += `Setup process exited with code ${code}`;
            }
        });
    }

    document.querySelector('#finish').onclick = async () => {
        remote.getCurrentWindow().hide()
        ipcRenderer.send('start-tray')
    }
}

start()