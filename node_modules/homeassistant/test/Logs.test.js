'use strict';

const rewire = require('rewire');
const expect = require('chai').expect;

describe('Home Assistant - Logs class', () => {
  let module = rewire('../lib/Logs.js');

  let Logs;
  before(() => {
    Logs = module({ base: 'http://localhost' });
    Logs._get = (path, qs) => Promise.resolve({ path, qs });
    Logs._post = (path, qs, body) => Promise.resolve({ path, qs, body });
  });

  describe('Class Interface', () => {
    it('should expose an errors method', done => {
      const methods = Object.getOwnPropertyNames(Logs.constructor.prototype);
      expect(methods).to.include.members(['constructor', 'errors']);
      done();
    });
  });

  describe('errors', () => {
    it('should GET the current error logs from /error_log', () => {
      return Logs.errors()
        .then(res => {
          expect(res.path).to.equal('/error_log');
        });
    });
  });
});
