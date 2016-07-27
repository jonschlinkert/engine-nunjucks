'use strict';

var filters = require('./lib/filters');
var merge = require('mixin-deep');
var configured;
var cache;

/**
 * Common Defaults (overridden by user-defined options)
 */

var defaults = {
  ext: '.html',
  name: 'nunjucks',
  base: 'templates/blocks',
  throwOnUndefined: true,
  autoescape: false,
  watch: false
};

/**
 * Nunjucks Support
 */

var engine = module.exports = function() {
  return engine.render.apply(engine, arguments);
};

/**
 * Options
 */

engine.options = {};

/**
 * Expose `nunjucks` as a getter
 */

Object.defineProperty(engine, 'nunjucks', {
  set: function(val) {
    cache = val;
  },
  get: function() {
    return cache || (cache = require('nunjucks'));
  }
});

/**
 * Initialize [Nunjucks][] with the given `options` and default settings from `engine-nunjucks`.
 *
 * ```js
 * engine.configure([options]);
 * ```
 * @param  {String} `options`
 * @api public
 */

engine.configure = function(options) {
  configured = true;
  engine.options = merge({}, defaults, options);
  var Loader = engine.options.loader;

  var base = engine.options.blocks || engine.options.base;
  if (typeof Loader === 'function') {
    engine.loader = new Loader(engine.options);
  } else if (typeof Loader === 'undefined') {
    engine.loader = new engine.nunjucks.FileSystemLoader(base);
  } else {
    engine.loader = Loader;
  }

  engine.env = engine.options.env || new engine.nunjucks.Environment(engine.loader);
  filters(engine);
  engine.__proto__ = engine.env;
  return engine;
};

/**
 * Lazily configure Nunjucks
 *
 * @param  {String} `relativeRootPath` Relative path to template cwd
 */

engine.lazyConfigure = function(options) {
  if (!configured) engine.configure(options);
  configured = true;
};

/**
 * Express Support
 */

engine.__express = engine.renderFile;

/**
 * Add a global value that will be available to all templates. Note: this will
 * overwrite any existing global called name. Returns `env` (the nunjucks instance)
 * for further method chaining.
 *
 * ```js
 * engine.addGlobal(name, value);
 * ```
 * @param  {String} `name`
 * @return {any} `value`
 * @api public
 */

engine.addGlobal = function(name, value) {
  engine.lazyConfigure();
  engine.env.addGlobal(name, value);
  return engine;
};

/**
 * Add a custom [nunjucks extension][docs]{api.html#custom-tags}. Also called "tags".
 * This exposes the parser API and allows you to do anything you want with the template.
 *
 * ```js
 * env.addExtension(name, fn);
 * ```
 * @param  {String} `name` The name of the extension to add
 * @return {Function} `fn` function
 * @api public
 */

engine.addExtension = function(name, fn) {
  engine.lazyConfigure();
  engine.env.addExtension(name, fn);
  return engine;
};

/**
 * Asynchronously compile the given `string`, with the given `options` and `callback`.
 * If no callback is passed, [.compileSync](#compileSync) is called with the given
 * arguments.
 *
 * ```js
 * engine.compile('foo {{title}} bar', function(err, fn) {
 *   console.log(fn({title: 'AAA'})); //=> 'foo AAA bar'
 *   console.log(fn({title: 'BBB'})); //=> 'foo BBB bar'
 *   console.log(fn({title: 'CCC'})); //=> 'foo CCC bar'
 * });
 * ```
 * @param {Object} `str` The string to compile
 * @param {Object|Function} `options` Options object to pass to [nunjucks][] or callback function
 * @param {Function} `cb` Callback function
 * @return {undefined}
 * @api public
 */

engine.compile = function(str, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  if (typeof cb !== 'function') {
    return engine.compileSync.apply(engine, arguments);
  }
  if (typeof str === 'function') {
    cb(null, str);
    return;
  }
  try {
    var fn = engine.compileSync(str, options);
    cb(null, fn);
  } catch (err) {
    cb(err);
  }
};

/**
 * Synchronously compile the given `string` with `options`.
 *
 * ```js
 * var fn = engine.compileSync('foo {{title}} bar');
 * console.log(fn({title: 'AAA'})); //=> 'foo AAA bar'
 * console.log(fn({title: 'BBB'})); //=> 'foo BBB bar'
 * console.log(fn({title: 'CCC'})); //=> 'foo CCC bar'
 * ```
 * @param {Object} `str` The string to compile
 * @param {Object} `options` Options object to pass to [nunjucks][]
 * @return {Function} returns the compiled function
 * @api public
 */

engine.compileSync = function(str, locals) {
  try {
    var ctx = merge({path: 'string'}, engine.options, locals);
    engine.lazyConfigure(ctx);
    var compiled = engine.nunjucks.compile(str, engine.env, ctx.base);
    return function(data) {
      return compiled.render(merge({}, ctx, data));
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Asynchronously render the given template `string` with `locals` and callback.
 *
 * ```js
 * var locals = {name: 'engine-nunjucks'};
 * engine.render('abc {{name}} xyz', locals, function(err, html) {
 *  console.log(html);
 *  //=> '[foo:bar]'
 * })
 * ```
 * @param  {String} `str`
 * @param  {Object|Function} `options` or callback function
 * @param  {Function} `callback`
 * @api public
 */

engine.render = function(str, locals, cb) {
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  if (typeof cb !== 'function') {
    return engine.renderSync.apply(engine, arguments);
  }

  try {
    var fn = str;
    var ctx = merge({}, engine.options, locals);
    engine.lazyConfigure(ctx);
    if (typeof str !== 'function') {
      fn = engine.compileSync(str, ctx);
    }
    cb(null, fn(ctx));
  } catch (err) {
    cb(err);
  }
};

/**
 * Asynchronously or synchronously render the given `str` with `locals` and
 * optional callback.
 *
 * ```js
 * var engine = require('engine-nunjucks');
 * engine.renderString('{{ name }}', {name: 'engine-nunjucks'}, function(err, str) {
 *   console.log(str);
 *   //=> 'engine-nunjucks'
 * });
 * // or
 * var str = engine.renderString('{{ name }}', {name: 'engine-nunjucks'});
 * console.log(str);
 * //=> 'engine-nunjucks'
 * ```
 * @param  {Object|Function} `str` The string to render or compiled function.
 * @param  {Object} `locals`
 * @return {String} Rendered string.
 * @api public
 */

engine.renderString = function(str, locals, cb) {
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }

  if (typeof cb !== 'function') {
    return engine.renderSync.apply(engine, arguments);
  }

  try {
    if (typeof str === 'function') {
      var ctx = merge({}, engine.options, locals);
      engine.lazyConfigure(ctx);
      cb(null, str(ctx));
      return;
    }
    cb(null, engine.renderSync(str, locals));
  } catch (err) {
    cb(err);
  }
};

/**
 * Synchronously render the given `str` (or compiled function) with `locals`.
 *
 * ```js
 * var engine = require('engine-nunjucks');
 * engine.renderSync('{{ name }}', {name: 'engine-nunjucks'});
 * //=> 'engine-nunjucks'
 * ```
 * @param  {String|Function} `str` The string to render or compiled function.
 * @param  {Object} `locals`
 * @return {String} Rendered string.
 * @api public
 */

engine.renderSync = function(str, locals) {
  try {
    var ctx = merge({}, engine.options, locals);
    engine.lazyConfigure(ctx);
    return engine.env.renderString(str, ctx);
  } catch (err) {
    throw err;
  }
};

/**
 * Render the contents of the file at the given `filepath`, with `locals`
 * and optional `callback`.
 *
 * @param  {String} `filepath`
 * @param  {Object|Function} `options` or callback function
 * @param  {Function} `cb`
 * @api public
 */

engine.renderFile = function(filepath, locals, cb) {
  if (typeof locals === 'function') {
    cb = locals;
    locals = {};
  }
  try {
    var ctx = merge({}, engine.options, locals);
    engine.lazyConfigure(ctx);
    engine.env.render(filepath, ctx, cb);
  } catch (err) {
    cb(err);
  }
};
