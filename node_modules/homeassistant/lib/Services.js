'use strict';

const Request = require('./Request');

class Services extends Request {
  constructor(apiConfig) {
    super(apiConfig);
  }

  // GET /api/services
  // https://home-assistant.io/developers/rest_api/#get-apiservices
  list() {
    return this._get('/services');
  }

  // POST /api/services/<domain>/<service>
  // https://home-assistant.io/developers/rest_api/#post-apiservicesltdomainltservice
  call(service, domain, serviceData) {
    if (typeof serviceData === 'string') {
      if (!serviceData.startsWith(`${domain}.`)) {
        serviceData = `${domain}.${serviceData}`;
      }
      serviceData = {
        entity_id: serviceData
      };
    }

    return this._post(`/services/${domain}/${service}`, null, serviceData);
  }
}

module.exports = apiConfig => {
  return new Services(apiConfig);
};
