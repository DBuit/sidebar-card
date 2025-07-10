'use strict';

const rewire = require('rewire');
const expect = require('chai').expect;

describe('Home Assistant - States class', () => {
  let module = rewire('../lib/States.js');

  let States;
  before(() => {
    States = module({ base: 'http://localhost' });
    States._get = (path, qs) => Promise.resolve({ path, qs });
    States._post = (path, qs, body) => Promise.resolve({ path, qs, body });
  });

  describe('Class Interface', () => {
    it('should expose list, get, and update methods', done => {
      const methods = Object.getOwnPropertyNames(States.constructor.prototype);
      expect(methods).to.include.members(['constructor', 'list', 'get', 'update']);
      done();
    });
  });

  describe('list', () => {
    it('should GET a listing from /states', () => {
      return States.list()
        .then(res => {
          expect(res.path).to.equal('/states');
        });
    });
  });

  describe('get', () => {
    it('should GET the state of a domain and entity from /states/{domain}.{entityId}', () => {
      return States.get('switch', 'lights')
        .then(res => {
          expect(res.path).to.equal('/states/switch.lights');
        });
    });

    it('should GET the state of a domain and domain.entity from /states/{domain}.{entityId}', () => {
      return States.get('switch', 'switch.lights')
        .then(res => {
          expect(res.path).to.equal('/states/switch.lights');
        });
    });
  });

  describe('update', () => {
    it('should POST to the /states/{domain}.{entityId} endpoint for a domain and entityId', () => {
      return States.update('switch', 'lights')
        .then(res => {
          expect(res.path).to.equal('/states/switch.lights');
        });
    });

    it('should POST to the /states/{domain}.{entityId} endpoint for a domain and domain.entityId', () => {
      return States.update('switch', 'switch.lights')
        .then(res => {
          expect(res.path).to.equal('/states/switch.lights');
        });
    });
  });
});
