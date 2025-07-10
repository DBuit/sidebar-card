'use strict';

const rewire = require('rewire');
const expect = require('chai').expect;

describe('Home Assistant - Events class', () => {
  let module = rewire('../lib/Events.js');

  let Events;
  before(() => {
    Events = module({ base: 'http://localhost' });
    Events._get = (path, qs) => Promise.resolve({ path, qs });
    Events._post = (path, qs, body) => Promise.resolve({ path, qs, body });
  });

  describe('Class Interface', () => {
    it('should expose list and fire methods', done => {
      const methods = Object.getOwnPropertyNames(Events.constructor.prototype);
      expect(methods).to.include.members(['constructor', 'list', 'fire']);
      done();
    });
  });

  describe('list', () => {
    it('should GET a listing from /events', () => {
      return Events.list()
        .then(res => {
          expect(res.path).to.equal('/events');
        });
    });
  });

  describe('fire', () => {
    it('should POST to the /events/{eventType} endpoint', () => {
      return Events.fire('eventType', { eventData: 'data' })
        .then(res => {
          expect(res.path).to.equal('/events/eventType');
        });
    });
  });
});
