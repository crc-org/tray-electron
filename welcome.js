const path = require('path');
const { spawn } = require('child_process');
const {ipcRenderer, remote} = require('electron')

var options = {
    Bundle: "",
    ConsentTelemetry: false
}

var currentTab = 0

function crcBinary() {
    if (remote.app.isPackaged) {
        return path.join(remote.app.getAppPath(), 'crc');
    }
    return "crc"
}

function showTab(n) {
    // This function will display the specified tab of the form ...
    var x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    // ... and fix the Previous/Next buttons:
    if (n == 0) {
      document.getElementById("prev-button").style.display = "none";
    } else {
      document.getElementById("prev-button").style.display = "inline";
    }
    if (n >= x.length - 1) {
      document.getElementById("next-button").innerHTML = "Finish";
    } else {
      document.getElementById("next-button").innerHTML = "Next";
    }
}

async function nextPrev(n) {
    // This function will figure out which tab to display
    var x = document.getElementsByClassName("tab");
    if (currentTab == 1 && !validateInput()) return false;
    x[currentTab].style.display = "none";
    currentTab = currentTab + n;

    if (currentTab == x.length - 2) {
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

    if (currentTab >= x.length) {
        remote.getCurrentWindow().close()
        return false
    }
    // Otherwise, display the correct tab:
    showTab(currentTab);
}

async function showNext() {
    nextPrev(1)
}

async function showPrevious() {
    nextPrev(-1)
}

function showCurrentTab() {
    showTab(currentTab)
}

function validateInput() {
    if (options.Bundle === "") {
        return false
    }
    return true
}

const start = async function () {
    document.getElementById("next-button").onclick = async () => {
        showNext()
    }
    document.getElementById("prev-button").onclick = async () => {
        showPrevious()
    }
    document.getElementById("openshift-button").onclick = async () => {
        options.Bundle = "ocp"
    }
    document.getElementById("podman-button").onclick = async () => {
        options.Bundle = "podman"
    }
}

showCurrentTab()
start()