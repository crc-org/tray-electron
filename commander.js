const got = require('got');

module.exports = class DaemonCommander {

    constructor() {

    }

    async status() {
       const options = {
          url: `http://unix://?/pipe/crc-http:/api/status`,
          method: 'GET'
        };

        const {body} = await got(options);
        var status = JSON.parse(body);
    
        return status.CrcStatus;
    }

    start() {
        return "Starting";
    }

    stop() {
        return "Stopping";
    }

    delete() {
        return "Deleting";
    }
}