'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var engine = require('..');

var fixtures = path.resolve.bind(path, __dirname, 'fixtures');

describe('filters', function() {
  beforeEach(function(cb) {
    engine.configure({base: fixtures()});
    cb();
  });

  describe('.asyncFilter', function() {
    it('should add a filter', function(cb) {
      engine.asyncFilter('foo', function(str, next) {
        next(null, 'foo' + str);
      });

      engine('bar {{title | foo}}', {title: 'zzz'}, function(err, res) {
        if (err) return cb(err);
        assert.equal(res, 'bar foozzz');
        cb();
      });
    });
  });

  describe('.asyncFilters', function() {
    it('should add multiple filters', function(cb) {
      engine.asyncFilters({
        foo: function(str, next) {
          next(null, 'foo' + str);
        },
        bar: function(str, next) {
          next(null, 'bar' + str);
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
