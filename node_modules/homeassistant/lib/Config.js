'use strict';

let Request = require('./Request');

class Config extends Request {
  constructor(apiConfig) {
    super(apiConfig);
  }

  // GET /api/
  // https://home-assistant.io/developers/rest_api/#get-api
  status() {
    return this._get('/');
  }

  // GET /api/config
  // https://home-assistant.io/developers/rest_api/#get-apiconfig
  config() {
    return this._get('/config');
  }

  // GET /api/discovery_info
  // https://home-assistant.io/developers/rest_api/#get-apidiscovery_info
  discoveryInfo() {
    return this._get('/discovery_info');
  }

  // GET /api/bootstrap
  // https://home-assistant.io/developers/rest_api/#get-apibootstrap
  bootstrap() {
    return this._get('/bootstrap');
  }
}

module.exports = apiConfig => {
  return new Config(apiConfig);
};
