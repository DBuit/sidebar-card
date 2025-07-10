'use strict';

const rewire = require('rewire');
const expect = require('chai').expect;

describe('Home Assistant - History class', () => {
  let module = rewire('../lib/History.js');

  let History;
  before(() => {
    History = module({ base: 'http://localhost' });
    History._get = (path, qs) => Promise.resolve({ path, qs });
    History._post = (path, qs, body) => Promise.resolve({ path, qs, body });
  });

  describe('Class Interface', () => {
    it('should expose a state method', done => {
      const methods = Object.getOwnPropertyNames(History.constructor.prototype);
      expect(methods).to.include.members(['constructor', 'state']);
      done();
    });
  });

  describe('state', () => {
    it('should GET the state history from /history/period/{timestamp}', () => {
      return History.state('1985-06-06T12:03:00-05:00')
        .then(res => {
          expect(res.path).to.equal('/history/period/1985-06-06T12:03:00-05:00');
        });
    });

    it('should GET the state history from /history/period/{timestamp} with a entity filter', () => {
      return History.state('1985-06-06T12:03:00-05:00', 'switch.lights')
        .then(res => {
          expect(res.path).to.equal('/history/period/1985-06-06T12:03:00-05:00');
          expect(res.qs.filter_entity_id).to.equal('switch.lights');
        });
    });

    it('should reject on an invalid timestamp', () => {
      return History.state('1985-06-06')
        .catch(err => {
          expect(err).to.be.an('error');
        });
    });
  });
});
