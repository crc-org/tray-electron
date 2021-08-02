const got = require('got');
const {ipcRenderer} = require('electron');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const options = {
  url: `http://unix://?/pipe/crc-http:/api/status`,
  method: 'GET'
};


const start = async function() {
  while(true) {

    const {body} = await got(options);
    var status = JSON.parse(body);

    statusDiv.innerHTML = status.CrcStatus;

    await delay(1000);
  }

}

start();
