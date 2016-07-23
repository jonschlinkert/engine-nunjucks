'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var assemble = require('assemble');
var templates = require('templates');
var engine = require('..');
var app;

var fixtures = path.resolve.bind(path, __dirname, 'fixtures');
var fixture = fixtures('list.njk');
var str = fs.readFileSync(fixture, 'utf-8');
var locals = {
  list: ['alpha', 'beta', 'gamma']
};
var expected = [
  '<ul>',
  '  <li>alpha</li>',
  '  <li>beta</li>',
  '  <li>gamma</li>',
  '</ul>',
  ''
].join('\n');

describe('filters', function() {
  beforeEach(function(cb) {
    engine.configure({base: fixtures()});
    cb();
  });

  describe('render()', function() {
    it('should render nunjucks templates', function(cb) {
      engine(str, locals, function(err, html) {
        if (err) return cb(err);
        assert.equal(html, expected);
        cb();
      });
    });
  });

  describe('.compileSync()', function() {
    it('should synchronously compile nunjucks templates', function() {
      var fn = engine.compileSync('a {{name}} b');
      assert.equal(fn({name: 'foo'}), 'a foo b');
      assert.equal(fn({name: 'bar'}), 'a bar b');
      assert.equal(fn({name: 'baz'}), 'a baz b');
    });
  });

  describe('.compile()', function() {
    it('should asynchronously compile nunjucks templates', function(cb) {
      engine.compile('a {{name}} b', function(err, fn) {
        if (err) return cb(err);
        assert.equal(fn({name: 'foo'}), 'a foo b');
        cb();
      });
    });
  });

  describe('.renderString()', function() {
    it('should synchronously render a nunjucks templates string', function() {
      var res = engine.renderString(str, locals);
      assert.equal(res, expected);
    });

    it('should asynchronously render a nunjucks templates string', function(cb) {
      engine.renderString(str, locals, function(err, res) {
        if (err) return cb(err);
        assert.equal(res, expected);
        cb();
      });
    });
  });

  describe('.render()', function() {
    it('should render a nunjucks templates.', function(cb) {
      engine.render(str, locals, function(err, res) {
        if (err) return cb(err);
        assert.equal(res, expected);
        cb();
      });
    });
  });

  describe('.renderFile()', function() {
    it('should render a nunjucks file from a filepath', function(cb) {
      engine.renderFile('list.njk', locals, function(err, res) {
        if (err) return cb(err);
        assert.equal(res, expected);
        cb();
      });
    });
  });

  describe('.renderSync()', function() {
    it('should synchronously render a nunjucks string.', function(cb) {
      var res = engine.renderSync(str, locals);
      assert.equal(res, expected);
      cb();
    });
  });

  describe('templates usage', function() {
    beforeEach(function() {
      app = templates();
      app.engine('njk', engine);
      app.create('pages');
      app.data(locals);
      app.page({path: fixture, contents: str});
    });

    it('should work with templates', function(cb) {
      app.render('list.njk', function(err, res) {
        if (err) return cb(err);
        assert(res);
        assert(res.content);
        assert.equal(res.content.trim(), expected.trim());
        cb();
      });
    });
  });

  describe('assemble usage', function() {
    beforeEach(function() {
      app = assemble();
      app.engine('njk', engine);
      app.create('pages');
      app.data(locals);
      app.page({path: 'list.njk', contents: str});
    });

    it('should work with assemble `.render`', function(cb) {
      app.render('list.njk', function(err, res) {
        if (err) return cb(err);
        assert(res);
        assert(res.content);
        assert.equal(res.content.trim(), expected.trim());
        cb();
      });
    });

    it('should work with assemble `.renderFile`', function(cb) {
      var files = [];
      app.src('./test/fixtures/*.njk')
        .pipe(app.renderFile())
        .on('error', cb)
        .on('data', function(file) {
          files.push(file);
        })
        .on('end', function() {
          assert(files[0]);
          assert(files[0].path);
          assert(files[0].contents);
          assert.equal(String(files[0].contents), expected);
          cb();
        });
    });
  });
});
