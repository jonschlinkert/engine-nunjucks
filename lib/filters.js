'use strict';

var debug = require('debug')('engine-nunjucks:filters');
var loader = require('load-helpers');

module.exports = function(engine) {
  var asyncFilters = {};
  var filters = {};

  /**
   * Create loader objects
   */

  var async = loader(asyncFilters, {async: true});
  var sync = loader(filters);

  /**
   * Listen for filters registered on `load-helpers`
   */

  sync.on('helper', function(name, fn) {
    engine.env.addFilter(name, fn);
  });

  async.on('helper', function(name, fn) {
    engine.env.addFilter(name, fn, true);
  });

  /**
   * Register custom filter `name` with the given `fn`.
   * [nunjucks][docs]{api.html#addfilter} filters are technically
   * similar to [handlebars][] helpers, but they're used
   * differently in templates. This method is also aliased as `.filter`.
   *
   * ```js
   * engine.addFilter('foo', function(str) {
   *   // do stuff to `str`
   *   return str;
   * });
   * ```
   * @name .addFilter
   * @param {String} `name` Filter name
   * @param {Function} `fn` Filter function.
   * @api public
   */

  engine.filter = engine.addFilter = function(name) {
    debug('registering sync filter "%s"', name);
    sync.apply(sync, arguments);
    return engine;
  };

  /**
   * Register multiple template filters. Also aliased as `.filters`.
   *
   * ```js
   * engine.addFilters({
   *   foo: function() {},
   *   bar: function() {},
   *   baz: function() {}
   * });
   * ```
   * @name .addFilters
   * @param {Object|Array} `filters` Object, array of objects, or glob patterns.
   * @api public
   */

  engine.filters = engine.addFilters = function() {
    sync.apply(sync, arguments);
    return engine;
  };

  /**
   * Register an async filter function. Also aliased as `.asyncFilter`.
   *
   * ```js
   * engine.addAsyncFilter('upper', function(str, next) {
   *   next(null, str.toUpperCase());
   * });
   * ```
   * @name .addAsyncFilter
   * @param {String} `name` Filter name.
   * @param {Function} `fn` Filter function
   * @api public
   */

  engine.asyncFilter = engine.addAsyncFilter = function(name) {
    debug('registering async filter "%s"', name);
    async.apply(sync, arguments);
    return engine;
  };

  /**
   * Register multiple async template filters. Also aliased as `.asyncFilters`.
   *
   * ```js
   * engine.addAsyncFilters({
   *   foo: function() {},
   *   bar: function() {},
   *   baz: function() {}
   * });
   * ```
   * @name .addAsyncFilters
   * @param {Object|Array} `filters` Object, array of objects, or glob patterns.
   * @api public
   */

  engine.asyncFilters = engine.addAsyncFilters = function() {
    async.apply(async, arguments);
    return engine;
  };

  /**
   * Get a previously registered filter.
   *
   * ```js
   * var fn = engine.getFilter('foo');
   * ```
   * @name .getFilter
   * @param {String} `name` Filter name
   * @returns {Function} Returns the registered filter function.
   * @api public
   */

  engine.getFilter = function(name) {
    debug('getting sync filter "%s"', name);
    return sync[name];
  };

  /**
   * Get a previously registered async filter.
   *
   * ```js
   * var fn = engine.getAsyncFilter('foo');
   * ```
   * @name .getAsyncFilter
   * @param {String} `name` Filter name
   * @returns {Function} Returns the registered filter function.
   * @api public
   */

  engine.getAsyncFilter = function(name) {
    debug('getting async filter "%s"', name);
    return async[name];
  };
};
