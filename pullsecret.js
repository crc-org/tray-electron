const DaemonCommander = require('./commander')
const { ipcRenderer } = require('electron')
const commander = new DaemonCommander()

document.getElementById('pullsecret-button').onclick = async() => {
    const pullsecret = JSON.parse(document.getElementById('pullsecret-textbox').value)
    if (pullsecret !== "") {
        try {
            commander.pullSecretPost(pullsecret)
        } catch (response) {
            // TODO: show error as notification to user
            console.log(response)
        }

        ipcRenderer.send('close-focused')
    } else {
        // TODO: show error as notification to user
        console.log("empty pull secret") 
    }    
}