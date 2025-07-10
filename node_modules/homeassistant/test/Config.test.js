'use strict';

const rewire = require('rewire');
const expect = require('chai').expect;

describe('Home Assistant - Config class', () => {
  let module = rewire('../lib/Config.js');

  let Config;
  before(() => {
    Config = module({ base: 'http://localhost' });
    Config._get = (path, qs) => Promise.resolve({ path, qs });
    Config._post = (path, qs, body) => Promise.resolve({ path, qs, body });
  });

  describe('Class Interface', () => {
    it('should expose status, config, discoveryInfo, and bootstrap methods', done => {
      const methods = Object.getOwnPropertyNames(Config.constructor.prototype);
      expect(methods).to.include.members(['constructor', 'status', 'config', 'discoveryInfo', 'bootstrap']);
      done();
    });
  });

  describe('status', () => {
    it('should GET the API status from /', () => {
      return Config.status()
        .then(res => {
          expect(res.path).to.equal('/');
        });
    });
  });

  describe('config', () => {
    it('should GET the config from /config', () => {
      return Config.config()
        .then(res => {
          expect(res.path).to.equal('/config');
        });
    });
  });

  describe('discoveryInfo', () => {
    it('should GET the discovery information from /discovery_info', () => {
      return Config.discoveryInfo()
        .then(res => {
          expect(res.path).to.equal('/discovery_info');
        });
    });
  });

  describe('bootstrap', () => {
    it('should GET the bootstrap information from /bootstrap', () => {
      return Config.bootstrap()
        .then(res => {
          expect(res.path).to.equal('/bootstrap');
        });
    });
  });
});
