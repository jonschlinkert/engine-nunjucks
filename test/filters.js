'use strict';

var path = require('path');
var assert = require('assert');
var engine = require('..');

var fixtures = path.resolve.bind(path, __dirname, 'fixtures');

describe('filters', function() {
  beforeEach(function(cb) {
    engine.configure({base: fixtures()});
    cb();
  });

  describe('.addFilter', function() {
    it('should add a filter', function(cb) {
      engine.addFilter('foo', function(str) {
        return 'foo' + str;
      });

      engine('bar {{title | foo}}', {title: 'zzz'}, function(err, res) {
        if (err) return cb(err);
        assert.equal(res, 'bar foozzz');
        cb();
      });
    });
  });

  describe('.addFilters', function() {
    it('should add multiple filters', function(cb) {
      engine.addFilters({
        foo: function(str) {
          return 'foo' + str;
        },
        bar: function(str) {
          return 'bar' + str;
        }
      });

      engine('one {{title | foo}}', {title: 'zzz'}, function(err, res) {
        if (err) return cb(err);
        assert.equal(res, 'one foozzz');

        engine('two {{title | bar}}', {title: 'zzz'}, function(err, res) {
          if (err) return cb(err);
          assert.equal(res, 'two barzzz');
          cb();
        });
      });
    });
  });
});
