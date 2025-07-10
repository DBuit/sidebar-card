'use strict';

const Request = require('./Request');

class Logs extends Request {
  constructor(apiConfig) {
    super(apiConfig);
  }

  // GET /api/error_log
  // https://home-assistant.io/developers/rest_api/#get-apierror_log
  errors() {
    return this._get('/error_log');
  }
}

module.exports = apiConfig => {
  return new Logs(apiConfig);
};
