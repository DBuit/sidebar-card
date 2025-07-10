'use strict';

class HomeAssistant {
  constructor(auth) {
    auth = auth || {};
    const host = auth.host || 'http://localhost';
    const port = auth.port || 8123;
    const password = auth.password;
    const rejectUnauthorized = auth.ignoreCert ? false : true;
    const apiConfig = {
      base: `${host}:${port}`,
      password,
      rejectUnauthorized
    };

    if (auth.hasOwnProperty('token')) {
      apiConfig.token = auth.token;
    }

    const Config = require('./Config')(apiConfig);
    const ConfigMethods = Object.getOwnPropertyNames(Config.constructor.prototype).filter(name => name !== 'constructor');
    ConfigMethods.reduce((obj, id) => {
      obj[id] = () => Config[id]();
      return obj;
    }, this);

    ['Camera', 'Events', 'History', 'Logs', 'Services', 'States', 'Templates'].reduce((obj, id) => {
      obj[id.toLowerCase()] = require(`./${id}`)(apiConfig);
      return obj;
    }, this);
  }
}

module.exports = HomeAssistant;
