# engine-nunjucks [![NPM version](https://img.shields.io/npm/v/engine-nunjucks.svg?style=flat)](https://www.npmjs.com/package/engine-nunjucks) [![NPM downloads](https://img.shields.io/npm/dm/engine-nunjucks.svg?style=flat)](https://npmjs.org/package/engine-nunjucks) [![Build Status](https://img.shields.io/travis/jonschlinkert/engine-nunjucks.svg?style=flat)](https://travis-ci.org/jonschlinkert/engine-nunjucks)

More comprehensive consolidate-style engine support for nunjucks. Should work with express, assemble, verb, generate, update, and any other app that follows consolidate conventions.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save engine-nunjucks
```

## Usage

```js
var engine = require('engine-nunjucks');
```

## API

### [.configure](index.js#L58)

Initialize [Nunjucks](https://github.com/mozilla/nunjucks) with the given `options` and default settings from `engine-nunjucks`.

**Params**

* `options` **{String}**

**Example**

```js
engine.configure([options]);
```

### [.addGlobal](index.js#L107)

Add a global value that will be available to all templates. Note: this will overwrite any existing global called name. Returns `env` (the nunjucks instance) for further method chaining.

**Params**

* `name` **{String}**
* `returns` **{any}** `value`

**Example**

```js
engine.addGlobal(name, value);
```

### [.addExtension](index.js#L125)

Add a custom [nunjucks extension](http://mozilla.github.io/nunjucks/api.html#custom-tags). Also called "tags". This exposes the parser API and allows you to do anything you want with the template.

**Params**

* `name` **{String}**: The name of the extension to add
* `returns` **{Function}** `fn`: function

**Example**

```js
env.addExtension(name, fn);
```

### [.compile](index.js#L150)

Asynchronously compile the given `string`, with the given `options` and `callback`. If no callback is passed, [.compileSync](#compileSync) is called with the given arguments.

**Params**

* `str` **{Object}**: The string to compile
* `options` **{Object|Function}**: Options object to pass to [nunjucks](https://github.com/mozilla/nunjucks) or callback function
* `cb` **{Function}**: Callback function
* `returns` **{undefined}**

**Example**

```js
engine.compile('foo {{title}} bar', function(err, fn) {
  console.log(fn({title: 'AAA'})); //=> 'foo AAA bar'
  console.log(fn({title: 'BBB'})); //=> 'foo BBB bar'
  console.log(fn({title: 'CCC'})); //=> 'foo CCC bar'
});
```

### [.compileSync](index.js#L185)

Synchronously compile the given `string` with `options`.

**Params**

* `str` **{Object}**: The string to compile
* `options` **{Object}**: Options object to pass to [nunjucks](https://github.com/mozilla/nunjucks)
* `returns` **{Function}**: returns the compiled function

**Example**

```js
var fn = engine.compileSync('foo {{title}} bar');
console.log(fn({title: 'AAA'})); //=> 'foo AAA bar'
console.log(fn({title: 'BBB'})); //=> 'foo BBB bar'
console.log(fn({title: 'CCC'})); //=> 'foo CCC bar'
```

### [.render](index.js#L214)

Asynchronously render the given template `string` with `locals` and callback.

**Params**

* `str` **{String}**
* `options` **{Object|Function}**: or callback function
* `callback` **{Function}**

**Example**

```js
var locals = {name: 'engine-nunjucks'};
engine.render('abc {{name}} xyz', locals, function(err, html) {
 console.log(html);
 //=> '[foo:bar]'
})
```

### [.renderString](index.js#L258)

Asynchronously or synchronously render the given `str` with `locals` and optional callback.

**Params**

* `str` **{Object|Function}**: The string to render or compiled function.
* `locals` **{Object}**
* `returns` **{String}**: Rendered string.

**Example**

```js
var engine = require('engine-nunjucks');
engine.renderString('{{ name }}', {name: 'engine-nunjucks'}, function(err, str) {
  console.log(str);
  //=> 'engine-nunjucks'
});
// or
var str = engine.renderString('{{ name }}', {name: 'engine-nunjucks'});
console.log(str);
//=> 'engine-nunjucks'
```

### [.renderSync](index.js#L295)

Synchronously render the given `str` (or compiled function) with `locals`.

**Params**

* `str` **{String|Function}**: The string to render or compiled function.
* `locals` **{Object}**
* `returns` **{String}**: Rendered string.

**Example**

```js
var engine = require('engine-nunjucks');
engine.renderSync('{{ name }}', {name: 'engine-nunjucks'});
//=> 'engine-nunjucks'
```

### [.renderFile](index.js#L315)

Render the contents of the file at the given `filepath`, with `locals`
and optional `callback`.

**Params**

* `filepath` **{String}**
* `options` **{Object|Function}**: or callback function
* `cb` **{Function}**

### [.addFilter](lib/filters.js#L47)

Register custom filter `name` with the given `fn`. [nunjucks](http://mozilla.github.io/nunjucks/api.html#addfilter) filters are technically similar to [handlebars](http://www.handlebarsjs.com/) helpers, but they're used differently in templates. This method is also aliased as `.filter`.

**Params**

* `name` **{String}**: Filter name
* `fn` **{Function}**: Filter function.

**Example**

```js
engine.addFilter('foo', function(str) {
  // do stuff to `str`
  return str;
});
```

### [.addFilters](lib/filters.js#L68)

Register multiple template filters. Also aliased as `.filters`.

**Params**

* `filters` **{Object|Array}**: Object, array of objects, or glob patterns.

**Example**

```js
engine.addFilters({
  foo: function() {},
  bar: function() {},
  baz: function() {}
});
```

### [.addAsyncFilter](lib/filters.js#L87)

Register an async filter function. Also aliased as `.asyncFilter`.

**Params**

* `name` **{String}**: Filter name.
* `fn` **{Function}**: Filter function

**Example**

```js
engine.addAsyncFilter('upper', function(str, next) {
  next(null, str.toUpperCase());
});
```

### [.addAsyncFilters](lib/filters.js#L108)

Register multiple async template filters. Also aliased as `.asyncFilters`.

**Params**

* `filters` **{Object|Array}**: Object, array of objects, or glob patterns.

**Example**

```js
engine.addAsyncFilters({
  foo: function() {},
  bar: function() {},
  baz: function() {}
});
```

### [.getFilter](lib/filters.js#L125)

Get a previously registered filter.

**Params**

* `name` **{String}**: Filter name
* `returns` **{Function}**: Returns the registered filter function.

**Example**

```js
var fn = engine.getFilter('foo');
```

### [.getAsyncFilter](lib/filters.js#L142)

Get a previously registered async filter.

**Params**

* `name` **{String}**: Filter name
* `returns` **{Function}**: Returns the registered filter function.

**Example**

```js
var fn = engine.getAsyncFilter('foo');
```

### Default options

These are the actual default options used. These can be overridden with custom values on any of the methods.

```js
var defaults = {
  ext: '.html',
  name: 'nunjucks',
  nunjucks: {
    base: 'templates',
    throwOnUndefined: true,
    autoescape: false,
    watch: false
  }
};
```

## About

### Related projects

* [assemble](https://www.npmjs.com/package/assemble): Get the rocks out of your socks! Assemble makes you fast at creating web projects… [more](https://github.com/assemble/assemble) | [homepage](https://github.com/assemble/assemble "Get the rocks out of your socks! Assemble makes you fast at creating web projects. Assemble is used by thousands of projects for rapid prototyping, creating themes, scaffolds, boilerplates, e-books, UI components, API documentation, blogs, building websit")
* [generate](https://www.npmjs.com/package/generate): Command line tool and developer framework for scaffolding out new GitHub projects. Generate offers the… [more](https://github.com/generate/generate) | [homepage](https://github.com/generate/generate "Command line tool and developer framework for scaffolding out new GitHub projects. Generate offers the robustness and configurability of Yeoman, the expressiveness and simplicity of Slush, and more powerful flow control and composability than either.")
* [update](https://www.npmjs.com/package/update): Be scalable! Update is a new, open source developer framework and CLI for automating updates… [more](https://github.com/update/update) | [homepage](https://github.com/update/update "Be scalable! Update is a new, open source developer framework and CLI for automating updates of any kind in code projects.")
* [verb](https://www.npmjs.com/package/verb): Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used… [more](https://github.com/verbose/verb) | [homepage](https://github.com/verbose/verb "Documentation generator for GitHub projects. Verb is extremely powerful, easy to use, and is used on hundreds of projects of all sizes to generate everything from API docs to readmes.")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

### Building docs

_(This document was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme) (a [verb](https://github.com/verbose/verb) generator), please don't edit the readme directly. Any changes to the readme must be made in [.verb.md](.verb.md).)_

To generate the readme and API documentation with [verb](https://github.com/verbose/verb):

```sh
$ npm install -g verb verb-generate-readme && verb
```

### Running tests

Install dev dependencies:

```sh
$ npm install -d && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

### License

Copyright © 2016, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT license](https://github.com/jonschlinkert/engine-nunjucks/blob/master/LICENSE).

***

_This file was generated by [verb](https://github.com/verbose/verb), v0.9.0, on July 23, 2016._