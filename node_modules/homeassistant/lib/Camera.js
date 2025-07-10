'use strict';

const Request = require('./Request');

class Camera extends Request {
  constructor(apiConfig) {
    super(apiConfig);
  }

  // GET /api/camera_proxy/camera.<entity_id>
  // https://home-assistant.io/developers/rest_api/#get-apicamera_proxycameraltentity_id
  image(entityId) {
    return this._get(`/camera_proxy/camera.${entityId}`);
  }
}

module.exports = apiConfig => {
  return new Camera(apiConfig);
};
