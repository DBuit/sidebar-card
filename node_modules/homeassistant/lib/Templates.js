'use strict';

const Request = require('./Request');

class Templates extends Request {
  constructor(apiConfig) {
    super(apiConfig);
  }

  // POST /api/template
  // https://home-assistant.io/developers/rest_api/#post-apitemplate
  render(template) {
    if (typeof template === 'string') {
      template = { template };
    }
    return this._post('/template', null, template);
  }
}

module.exports = apiConfig => {
  return new Templates(apiConfig);
};
