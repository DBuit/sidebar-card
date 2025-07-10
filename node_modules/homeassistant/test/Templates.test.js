'use strict';

const rewire = require('rewire');
const expect = require('chai').expect;

describe('Home Assistant - Templates class', () => {
  let module = rewire('../lib/Templates.js');

  let Templates;
  before(() => {
    Templates = module({ base: 'http://localhost' });
    Templates._get = (path, qs) => Promise.resolve({ path, qs });
    Templates._post = (path, qs, body) => Promise.resolve({ path, qs, body });
  });

  describe('Class Interface', () => {
    it('should expose a render method', done => {
      const methods = Object.getOwnPropertyNames(Templates.constructor.prototype);
      expect(methods).to.include.members(['constructor', 'render']);
      done();
    });
  });

  describe('render', () => {
    it('should POST to the /template endpoint using a string', () => {
      return Templates.render('This is a {{ states("test") }}.')
        .then(res => {
          expect(res.path).to.equal('/template');
        });
    });

    it('should POST to the /template endpoint using an object', () => {
      return Templates.render({ template: 'This is a {{ states("test") }}.' })
        .then(res => {
          expect(res.path).to.equal('/template');
        });
    });
  });
});
