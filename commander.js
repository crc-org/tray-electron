const got = require('got');

module.exports = class DaemonCommander {

    constructor() {
      this.apiPath = 'http://unix://?/pipe/crc-http:/api';

    }

    async status() {
       const options = {
          url: this.apiPath + `/status`,
          method: 'GET'
        };

        const {body} = await got(options);
        var status = JSON.parse(body);
    
        return status.CrcStatus;
    }

    async start() {
       const options = {
          url: this.apiPath + `/start`,
          method: 'GET'
        };

        const {body} = await got(options);
        var status = JSON.parse(body);
        
        return "Starting";
    }

    async stop() {
       const options = {
          url: this.apiPath + `/stop`,
          method: 'GET'
        };

        const {body} = await got(options);
        var status = JSON.parse(body);
    

        return "Stopping";
    }

    async delete() {
       const options = {
          url: this.apiPath + `/delete`,
          method: 'GET'
        };

        const {body} = await got(options);
        var status = JSON.parse(body);

        return "Deleting";
    }
}