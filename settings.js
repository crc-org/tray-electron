const DaemonCommander = require('./commander')
const commander = new DaemonCommander();

updateValues = function(config) {
  cpus.value = config.Configs.cpus;
  memory.value = config.Configs.memory;
  disksize.value = config.Configs["disk-size"];
  consentTelemetry.checked = config.Configs["consent-telemetry"] == "yes";
}

applyValues = function() {

  var configValues = {};
  configValues["cpus"] = cpus.value;
  configValues["memory"] = memory.value;
  configValues["disk-size"] = disksize.value;
  configValues["consent-telemetry"] = consentTelemetry.checked ? "yes" : "no";

  commander.configPost( { properties: configValues } );
}

const start = async function() {

  document.querySelector('#apply').onclick = async() => {
    applyValues();
  }

  document.querySelector('#refresh').onclick = async() => {
    var config = await commander.configGet();
    updateValues(config);
  }

  document.querySelector('#pullsecret').onclick = async() => {
    // change pullsecret
  }

  var config = await commander.configGet();
  updateValues(config);

}

start();
