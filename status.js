const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const DaemonCommander = require('./commander')
const commander = new DaemonCommander()

const start = async function() {
  diskUsage.innerHTML = "";
  cacheUsage.innerHTML = "";
  cacheFolder.innerHTML = "";

  while(true) {
    var state = await commander.status();
    crcStatus.innerHTML = state.CrcStatus;
    openShiftStatus.innerHTML = state.OpenshiftStatus;

    var logs = await commander.logs();
    logsTextbox.innerHTML = logs.Messages;
     
    await delay(1000);
  }

}

start();
