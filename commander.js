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
        return JSON.parse(body);
   }

    async logs() {
       const options = {
          url: this.apiPath + `/logs`,
          method: 'GET'
        };

        const {body} = await got(options);
        return  JSON.parse(body);
    }

    async start() {
       const options = {
          url: this.apiPath + `/start`,
          method: 'GET'
        };

        const {body} = await got(options);
        return JSON.parse(body);
    }

    async stop() {
       const options = {
          url: this.apiPath + `/stop`,
          method: 'GET'
        };

        const {body} = await got(options);
        return JSON.parse(body);
    }

    async delete() {
       const options = {
          url: this.apiPath + `/delete`,
          method: 'GET'
        };

        const {body} = await got(options);
        return JSON.parse(body);
    }
}