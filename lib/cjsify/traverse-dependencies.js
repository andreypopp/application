// Generated by CoffeeScript 2.0.0-beta6
void function () {
  var badRequireError, canonicalise, CoffeeScript, esprima, estraverse, fs, md5, path, relativeResolve;
  fs = require('fs');
  path = require('path');
  // MONKEY: we don't need that...
  //CoffeeScript = require('coffee-script-redux');
  esprima = require('esprima');
  estraverse = require('estraverse');
  md5 = require('MD5');
  canonicalise = require('./canonicalise');
  relativeResolve = require('./relative-resolve');
  badRequireError = function (filename, node, msg) {
    if (null != node.loc && null != (null != node.loc ? node.loc.start : void 0))
      filename = '' + filename + ':' + node.loc.start.line + ':' + node.loc.start.column;
    throw 'illegal require: ' + msg + '\n  `' + require('escodegen').generate(node) + '`\n  in ' + filename + '';
  };
  module.exports = function (entryPoint, root, options) {
    var aliases, ast, astOrJs, cache$, cache$1, canonicalName, digest, ext, extensions, extname, fileContents, filename, handler, handlers, processed, worklist;
    if (null == root)
      root = process.cwd();
    if (null == options)
      options = {};
    aliases = null != options.aliases ? options.aliases : {};
    handlers = {
      '.coffee': function (coffee, canonicalName) {
        return CoffeeScript.compile(CoffeeScript.parse(coffee, { raw: true }), { bare: true });
      },
      '.json': function (json, canonicalName) {
        return esprima.parse('module.exports = ' + json, {
          loc: true,
          source: canonicalName
        });
      }
    };
    for (ext in cache$ = null != options.handlers ? options.handlers : {}) {
      if (!isOwn$(cache$, ext))
        continue;
      handler = cache$[ext];
      handlers[ext] = handler;
    }
    extensions = ['.js'].concat([].slice.call(function (accum$) {
      for (ext in handlers) {
        if (!isOwn$(handlers, ext))
          continue;
        accum$.push(ext);
      }
      return accum$;
    }.call(this, [])));
    worklist = [relativeResolve({
        extensions: extensions,
        aliases: aliases,
        root: root,
        path: entryPoint
      })];
    processed = {};
    while (worklist.length) {
      cache$1 = worklist.pop();
      filename = cache$1.filename;
      canonicalName = cache$1.canonicalName;
      if (!filename)
        continue;
      if ({}.hasOwnProperty.call(processed, filename))
        continue;
      extname = path.extname(filename);
      fileContents = fs.readFileSync(filename).toString();
      if (options.cache) {
        digest = md5(fileContents.toString());
        if (options.cache[filename] === digest)
          continue;
        options.cache[filename] = digest;
      }
      astOrJs = {}.hasOwnProperty.call(handlers, extname) ? handlers[extname](fileContents, canonicalName) : fileContents;
      ast = typeof astOrJs === 'string' ? function () {
        var e;
        try {
          return esprima.parse(astOrJs, {
            loc: true,
            source: canonicalName
          });
        } catch (e$) {
          e = e$;
          throw new Error('Syntax error in ' + filename + ' at line ' + e.lineNumber + ', column ' + e.column + e.message.slice(e.message.indexOf(':')));
        }
      }.call(this) : astOrJs;
      processed[filename] = {
        canonicalName: canonicalName,
        ast: ast,
        fileContents: fileContents
      };
      if (null != ast.loc)
        ast.loc;
      else
        ast.loc = {};
      estraverse.replace(ast, {
        enter: function (node, parents) {
          var cwd, e, resolved;
          if (null != node.loc)
            node.loc.source = canonicalName;
          if (!(node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'require'))
            return;
          if (!(node['arguments'].length === 1))
            badRequireError(filename, node, 'require must be given exactly one argument');
          if (!(node['arguments'][0].type === 'Literal' && typeof node['arguments'][0].value === 'string'))
            badRequireError(filename, node, 'argument of require must be a constant string');
          cwd = path.dirname(fs.realpathSync(filename));
          if (options.verbose)
            console.error('required "' + node['arguments'][0].value + '" from "' + canonicalName + '"');
          var resolveOptions = {
              extensions: extensions,
              aliases: aliases,
              root: root,
              cwd: cwd,
              path: node['arguments'][0].value
            };
          try {
            resolved = relativeResolve(resolveOptions)
            worklist.push(resolved);
          } catch (e$) {
            console.error("Error in relativeResolve(", resolveOptions, ")");
            e = e$;
            if (options.ignoreMissing) {
              return {
                type: 'Literal',
                value: null
              };
            } else {
              throw e;
            }
          }
          return {
            type: 'CallExpression',
            callee: node.callee,
            'arguments': [
              {
                type: 'Literal',
                value: resolved.canonicalName
              },
              {
                type: 'Identifier',
                name: 'module'
              }
            ]
          };
        }
      });
    }
    return processed;
  };
  function isOwn$(o, p) {
    return {}.hasOwnProperty.call(o, p);
  }
}.call(this);
