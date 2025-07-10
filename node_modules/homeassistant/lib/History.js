'use strict';

const moment = require('moment');
const Request = require('./Request');

class History extends Request {
  constructor(apiConfig) {
    super(apiConfig);
  }

  // GET /api/history/period/<timestamp>
  // https://home-assistant.io/developers/rest_api/#get-apihistoryperiodlttimestamp
  state(timestamp, filter) {
    if (moment(timestamp, 'YYYY-MM-DDTHH:mm:ssZ', true).isValid() === false) {
      return Promise.reject(new Error('Invalid timestamp format.'));
    }

    const qs = filter ? { filter_entity_id: filter } : null;
    return this._get(`/history/period/${timestamp}`, qs);
  }
}

module.exports = apiConfig => {
  return new History(apiConfig);
};
