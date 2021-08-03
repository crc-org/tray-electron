const DaemonCommander = require('./commander')
const commander = new DaemonCommander();

updateFields = function(config) {
  cpus.value = config.Configs.cpus;
  memory.value = config.Configs.memory;
  disksize.value = config.Configs["disk-size"];
  consentTelemetry.checked = config.Configs["consent-telemetry"];
}

const start = async function() {

  document.querySelector('#apply').onclick = async() => {
    //
  }

  document.querySelector('#refresh').onclick = async() => {
    var config = await commander.configGet();
    updateFields(config);
  }

  document.querySelector('#pullsecret').onclick = async() => {
    // change pullsecret
  }

  var config = await commander.configGet();
  updateFields(config);

}

start();
