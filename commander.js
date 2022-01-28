const got = require('got');
const os = require('os');

module.exports = class DaemonCommander {

   constructor() {
      this.apiPath = `http://unix:${process.env.HOME}/.crc/crc-http.sock:/api`;

      if(os.platform() === "win32")
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

   async version() {
      const options = {
         url: this.apiPath + `/version`,
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
      return body;
   }

   async configGet() {
      const options = {
         url: this.apiPath + `/config`,
         method: 'GET'
      };

      const {body} = await got(options);
      return JSON.parse(body);
   }

   async configSet(values) {
      const options = {
         url: this.apiPath + `/config`
      };

      const {body} = await got.post(options, {
         json: true,
		   responseType: 'json',
         body: values
      });
      return "OK";
   }

   async consoleUrl() {
      const options = {
         url: this.apiPath + `/webconsoleurl`,
         method: 'GET'
      };

      const {body} = await got(options);
      return JSON.parse(body);
   }

   async telemetryPost(values) {
      const options = {
         url: this.apiPath + `/telemetry`
      };

      const {body} = await got.post(options, {
         json: true,
		   responseType: 'json',
         body: values
      });
      return "OK";
   }

   async pullSecretStore(value) {
      const options = {
         url: this.apiPath + `/pull-secret`,
      };

      const {body} = await got.post(options, {
         body: value
      });
      return "OK";
   }

   async pullSecretAvailable() {
      const options = {
         url: this.apiPath + `/pull-secret`,
         method: 'GET'
      };

      const {body} = await got(options);
      return body;
   }

   async logs() {
      const options = {
         url: this.apiPath + `/logs`,
         method: 'GET'
      };

      const {body} = await got(options);
      return JSON.parse(body);
   }
}