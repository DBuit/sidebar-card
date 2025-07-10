'use strict';

const rewire = require('rewire');
const expect = require('chai').expect;

describe('Home Assistant - Services class', () => {
  let module = rewire('../lib/Services.js');

  let Services;
  before(() => {
    Services = module({ base: 'http://localhost' });
    Services._get = (path, qs) => Promise.resolve({ path, qs });
    Services._post = (path, qs, body) => Promise.resolve({ path, qs, body });
  });

  describe('Class Interface', () => {
    it('should expose list and call methods', done => {
      const methods = Object.getOwnPropertyNames(Services.constructor.prototype);
      expect(methods).to.include.members(['constructor', 'list', 'call']);
      done();
    });
  });

  describe('list', () => {
    it('should GET a listing from /services', () => {
      return Services.list()
        .then(res => {
          expect(res.path).to.equal('/services');
        });
    });
  });

  describe('call', () => {
    it('should POST to the /services/{domain}/{service} endpoint for a domain and service with a serviceData object', () => {
      return Services.call('toggle', 'switch', { entity_id: 'switch.lights' })
        .then(res => {
          expect(res.path).to.equal('/services/switch/toggle');
          expect(res.body.entity_id).to.equal('switch.lights');
        });
    });

    it('should POST to the /services/{domain}/{service} endpoint for a domain and service with an domain.entityId string', () => {
      return Services.call('toggle', 'switch', 'switch.lights')
        .then(res => {
          expect(res.path).to.equal('/services/switch/toggle');
          expect(res.body.entity_id).to.equal('switch.lights');
        });
    });

    it('should POST to the /services/{domain}/{service} endpoint for a domain and service with an entityId string', () => {
      return Services.call('toggle', 'switch', 'lights')
        .then(res => {
          expect(res.path).to.equal('/services/switch/toggle');
          expect(res.body.entity_id).to.equal('switch.lights');
        });
    });
  });
});
