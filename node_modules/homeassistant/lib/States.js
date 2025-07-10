'use strict';

const Request = require('./Request');

class States extends Request {
  constructor(apiConfig) {
    super(apiConfig);
  }

  // GET /api/states
  // https://home-assistant.io/developers/rest_api/#get-apistates
  list() {
    return this._get('/states');
  }

  // GET /api/states/<entity_id>
  // https://home-assistant.io/developers/rest_api/#get-apistatesltentity_id
  get(domain, entityId) {
    if (!entityId.startsWith(`${domain}.`)) {
      entityId = `${domain}.${entityId}`;
    }
    return this._get(`/states/${entityId}`)
  }

  // POST /api/states/<entity_id>
  // https://home-assistant.io/developers/rest_api/#post-apistatesltentity_id
  update(domain, entityId, stateData) {
    if (!entityId.startsWith(`${domain}.`)) {
      entityId = `${domain}.${entityId}`;
    }
    return this._post(`/states/${entityId}`, null, stateData);
  }
}

module.exports = apiConfig => {
  return new States(apiConfig);
};
