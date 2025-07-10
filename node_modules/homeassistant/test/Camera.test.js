'use strict';

const rewire = require('rewire');
const expect = require('chai').expect;

describe('Home Assistant - Camera class', () => {
  let module = rewire('../lib/Camera.js');

  let Camera;
  before(() => {
    Camera = module({ base: 'http://localhost' });
    Camera._get = (path, qs) => Promise.resolve({ path, qs });
    Camera._post = (path, qs, body) => Promise.resolve({ path, qs, body });
  });

  describe('Class Interface', () => {
    it('should expose an image method', done => {
      const methods = Object.getOwnPropertyNames(Camera.constructor.prototype);
      expect(methods).to.include.members(['constructor', 'image']);
      done();
    });
  });

  describe('image', () => {
    it('should GET an image from /camera_proxy/camera.{entityId}', () => {
      return Camera.image('myCamera')
        .then(res => {
          expect(res.path).to.equal('/camera_proxy/camera.myCamera');
        });
    });
  });
});
