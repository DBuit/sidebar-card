'use strict';

const rewire = require('rewire');
const expect = require('chai').expect;

describe('Home Assistant - Request class', () => {
  let module = rewire('../lib/Request.js');

  before(() => {
    module.__set__('request', (options, callback) => {
      if (options.qs && options.qs.error) {
        return callback(new Error('Error'));
      }
      return callback(null, 200, options);
    });
  });

  describe('Class Interface', () => {
    it('should expose get and post methods', done => {
      const Request = new module({ base: 'http://localhost' });
      const methods = Object.getOwnPropertyNames(Request.constructor.prototype);
      expect(methods).to.include.members(['constructor', '_get', '_post']);
      done();
    });
  });

  describe('_get', () => {
    it('should make a GET request', () => {
      const Request = new module({ base: 'http://localhost' });
      return Request._get('/path')
        .then(res => {
          expect(res.method).to.equal('GET');
          expect(res.url).to.equal('http://localhost/api/path');
        });
    });
  });

  describe('_post', () => {
    it('should make a POST request', () => {
      const Request = new module({ base: 'http://localhost' });
      return Request._post('/path', null, {})
        .then(res => {
          expect(res.method).to.equal('POST');
          expect(res.url).to.equal('http://localhost/api/path');
        });
    });
  });

  describe('_request', () => {
    it('should properly set rejectUnauthorized option if provided', () => {
      const Request = new module({ base: 'http://localhost', rejectUnauthorized: true });
      return Request._get('/path')
        .then(res => {
          expect(res.rejectUnauthorized).to.equal(true);
        });
    });

    it('should properly set the x-ha-access header if an API password is set', () => {
      const Request = new module({ base: 'http://localhost', password: 'password' });
      return Request._get('/path')
        .then(res => {
          expect(res.headers).to.contain.keys(['x-ha-access']);
          expect(res.headers['x-ha-access']).to.equal('password');
        });
    });

    it('should properly pass on a query string if a valid one is provided', () => {
      const Request = new module({ base: 'http://localhost' });
      return Request._get('/path', { key: 'value' })
        .then(res => {
          expect(res.qs.key).to.equal('value');
        });
    });

    it('should pass on the body when an object is POSTed', () => {
      const Request = new module({ base: 'http://localhost' });
      return Request._post('/path', null, { body: 'json' })
        .then(res => {
          expect(res.body.body).to.equal('json');
        });
    });

    it('should convert a JSON string when POSTed', () => {
      const Request = new module({ base: 'http://localhost' });
      return Request._post('/path', null, '{ "body": "json" }')
        .then(res => {
          expect(res.body.body).to.equal('json');
        });
    });

    it('should reject if an invalid JSON string is POSTed', () => {
      const Request = new module({ base: 'http://localhost' });
      return Request._post('/path', null, 'Not JSON')
        .catch(err => {
          expect(err).to.be.an('error');
        });
    });

    it('should reject if a non-string or non-object is POSTed', () => {
      const Request = new module({ base: 'http://localhost' });
      return Request._post('/path', null, [])
        .catch(err => {
          expect(err).to.be.an('error');
        });
    });

    it('should reject if the request library throws an error', () => {
      const Request = new module({ base: 'http://localhost' });
      return Request._post('/path', { error: true }, {})
        .catch(err => {
          expect(err).to.be.an('error');
        });
    });
  });
});
