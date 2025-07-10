'use strict';

const Request = require('./Request');

class Events extends Request {
  constructor(apiConfig) {
    super(apiConfig);
  }

  // GET /api/events
  // https://home-assistant.io/developers/rest_api/#get-apievents
  list() {
    return this._get('/events');
  }

  // POST /api/events/<event_type>
  // https://home-assistant.io/developers/rest_api/#post-apieventsltevent_type
  fire(eventType, eventData) {
    return this._post(`/events/${eventType}`, null, eventData);
  }
}

module.exports = apiConfig => {
  return new Events(apiConfig);
};
