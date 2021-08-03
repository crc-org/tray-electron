const DaemonCommander = require('./commander')
const commander = new DaemonCommander();

const start = async function() {

  var version = await commander.version();
  crcVersion.innerHTML = version.CrcVersion + "-" + version.CommitSha;
  ocpVersion.innerHTML = version.OpenshiftVersion;
  trayVersion.innerHTML = "0.0.1 WIP (Electron)"
}

start();
