'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var os = _interopDefault(require('os'));
var path = _interopDefault(require('path'));
var child_process = _interopDefault(require('child_process'));
var fs = _interopDefault(require('fs'));
var Stream = _interopDefault(require('stream'));
var assert = _interopDefault(require('assert'));
var events = _interopDefault(require('events'));
var util = _interopDefault(require('util'));
var http = _interopDefault(require('http'));
var Url = _interopDefault(require('url'));
var https = _interopDefault(require('https'));
var zlib = _interopDefault(require('zlib'));
var buffer$1 = _interopDefault(require('buffer'));
var crypto = _interopDefault(require('crypto'));

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

var command = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

/**
 * Commands
 *
 * Command Format:
 *   ##[name key=value;key=value]message
 *
 * Examples:
 *   ##[warning]This is the user warning message
 *   ##[set-secret name=mypassword]definitelyNotAPassword!
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_PREFIX = '##[';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_PREFIX + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        // safely append the val - avoid blowing up when attempting to
                        // call .replace() if message is not a string for some reason
                        cmdStr += `${key}=${escape(`${val || ''}`)};`;
                    }
                }
            }
        }
        cmdStr += ']';
        // safely append the message - avoid blowing up when attempting to
        // call .replace() if message is not a string for some reason
        const message = `${this.message || ''}`;
        cmdStr += escapeData(message);
        return cmdStr;
    }
}
function escapeData(s) {
    return s.replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
function escape(s) {
    return s
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/]/g, '%5D')
        .replace(/;/g, '%3B');
}

});

unwrapExports(command);
var command_1 = command.issueCommand;
var command_2 = command.issue;

var core = createCommonjsModule(function (module, exports) {
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });


/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable
 */
function exportVariable(name, val) {
    process.env[name] = val;
    command.issueCommand('set-env', { name }, val);
}
exports.exportVariable = exportVariable;
/**
 * exports the variable and registers a secret which will get masked from logs
 * @param name the name of the variable to set
 * @param val value of the secret
 */
function exportSecret(name, val) {
    exportVariable(name, val);
    // the runner will error with not implemented
    // leaving the function but raising the error earlier
    command.issueCommand('set-secret', {}, val);
    throw new Error('Not implemented.');
}
exports.exportSecret = exportSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(' ', '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store
 */
function setOutput(name, value) {
    command.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message
 */
function error(message) {
    command.issue('error', message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message
 */
function warning(message) {
    command.issue('warning', message);
}
exports.warning = warning;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;

});

unwrapExports(core);
var core_1 = core.ExitCode;
var core_2 = core.exportVariable;
var core_3 = core.exportSecret;
var core_4 = core.addPath;
var core_5 = core.getInput;
var core_6 = core.setOutput;
var core_7 = core.setFailed;
var core_8 = core.debug;
var core_9 = core.error;
var core_10 = core.warning;
var core_11 = core.startGroup;
var core_12 = core.endGroup;
var core_13 = core.group;

var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key);
	return typeof customMerge === 'function' ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return target.propertyIsEnumerable(symbol)
		})
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	getKeys(source).forEach(function(key) {
		if (!options.isMergeableObject(source[key]) || !target[key]) {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		} else {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

var cjs = deepmerge_1;

/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}

/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
  var ctor,prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

var urlTemplate = createCommonjsModule(function (module, exports) {
(function (root, factory) {
    {
        module.exports = factory();
    }
}(commonjsGlobal, function () {
  /**
   * @constructor
   */
  function UrlTemplate() {
  }

  /**
   * @private
   * @param {string} str
   * @return {string}
   */
  UrlTemplate.prototype.encodeReserved = function (str) {
    return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
      if (!/%[0-9A-Fa-f]/.test(part)) {
        part = encodeURI(part).replace(/%5B/g, '[').replace(/%5D/g, ']');
      }
      return part;
    }).join('');
  };

  /**
   * @private
   * @param {string} str
   * @return {string}
   */
  UrlTemplate.prototype.encodeUnreserved = function (str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
  };

  /**
   * @private
   * @param {string} operator
   * @param {string} value
   * @param {string} key
   * @return {string}
   */
  UrlTemplate.prototype.encodeValue = function (operator, value, key) {
    value = (operator === '+' || operator === '#') ? this.encodeReserved(value) : this.encodeUnreserved(value);

    if (key) {
      return this.encodeUnreserved(key) + '=' + value;
    } else {
      return value;
    }
  };

  /**
   * @private
   * @param {*} value
   * @return {boolean}
   */
  UrlTemplate.prototype.isDefined = function (value) {
    return value !== undefined && value !== null;
  };

  /**
   * @private
   * @param {string}
   * @return {boolean}
   */
  UrlTemplate.prototype.isKeyOperator = function (operator) {
    return operator === ';' || operator === '&' || operator === '?';
  };

  /**
   * @private
   * @param {Object} context
   * @param {string} operator
   * @param {string} key
   * @param {string} modifier
   */
  UrlTemplate.prototype.getValues = function (context, operator, key, modifier) {
    var value = context[key],
        result = [];

    if (this.isDefined(value) && value !== '') {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        value = value.toString();

        if (modifier && modifier !== '*') {
          value = value.substring(0, parseInt(modifier, 10));
        }

        result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
      } else {
        if (modifier === '*') {
          if (Array.isArray(value)) {
            value.filter(this.isDefined).forEach(function (value) {
              result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
            }, this);
          } else {
            Object.keys(value).forEach(function (k) {
              if (this.isDefined(value[k])) {
                result.push(this.encodeValue(operator, value[k], k));
              }
            }, this);
          }
        } else {
          var tmp = [];

          if (Array.isArray(value)) {
            value.filter(this.isDefined).forEach(function (value) {
              tmp.push(this.encodeValue(operator, value));
            }, this);
          } else {
            Object.keys(value).forEach(function (k) {
              if (this.isDefined(value[k])) {
                tmp.push(this.encodeUnreserved(k));
                tmp.push(this.encodeValue(operator, value[k].toString()));
              }
            }, this);
          }

          if (this.isKeyOperator(operator)) {
            result.push(this.encodeUnreserved(key) + '=' + tmp.join(','));
          } else if (tmp.length !== 0) {
            result.push(tmp.join(','));
          }
        }
      }
    } else {
      if (operator === ';') {
        if (this.isDefined(value)) {
          result.push(this.encodeUnreserved(key));
        }
      } else if (value === '' && (operator === '&' || operator === '?')) {
        result.push(this.encodeUnreserved(key) + '=');
      } else if (value === '') {
        result.push('');
      }
    }
    return result;
  };

  /**
   * @param {string} template
   * @return {function(Object):string}
   */
  UrlTemplate.prototype.parse = function (template) {
    var that = this;
    var operators = ['+', '#', '.', '/', ';', '?', '&'];

    return {
      expand: function (context) {
        return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
          if (expression) {
            var operator = null,
                values = [];

            if (operators.indexOf(expression.charAt(0)) !== -1) {
              operator = expression.charAt(0);
              expression = expression.substr(1);
            }

            expression.split(/,/g).forEach(function (variable) {
              var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
              values.push.apply(values, that.getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
            });

            if (operator && operator !== '+') {
              var separator = ',';

              if (operator === '?') {
                separator = '&';
              } else if (operator !== '#') {
                separator = operator;
              }
              return (values.length !== 0 ? operator : '') + values.join(separator);
            } else {
              return values.join(',');
            }
          } else {
            return that.encodeReserved(literal);
          }
        });
      }
    };
  };

  return new UrlTemplate();
}));
});

const nameMap = new Map([
	[19, 'Catalina'],
	[18, 'Mojave'],
	[17, 'High Sierra'],
	[16, 'Sierra'],
	[15, 'El Capitan'],
	[14, 'Yosemite'],
	[13, 'Mavericks'],
	[12, 'Mountain Lion'],
	[11, 'Lion'],
	[10, 'Snow Leopard'],
	[9, 'Leopard'],
	[8, 'Tiger'],
	[7, 'Panther'],
	[6, 'Jaguar'],
	[5, 'Puma']
]);

const macosRelease = release => {
	release = Number((release || os.release()).split('.')[0]);
	return {
		name: nameMap.get(release),
		version: '10.' + (release - 4)
	};
};

var macosRelease_1 = macosRelease;
// TODO: remove this in the next major version
var default_1 = macosRelease;
macosRelease_1.default = default_1;

/**
 * Tries to execute a function and discards any error that occurs.
 * @param {Function} fn - Function that might or might not throw an error.
 * @returns {?*} Return-value of the function when no error occurred.
 */
var src = function(fn) {

	try { return fn() } catch (e) {}

};

var windows = isexe;
isexe.sync = sync;



function checkPathExt (path, options) {
  var pathext = options.pathExt !== undefined ?
    options.pathExt : process.env.PATHEXT;

  if (!pathext) {
    return true
  }

  pathext = pathext.split(';');
  if (pathext.indexOf('') !== -1) {
    return true
  }
  for (var i = 0; i < pathext.length; i++) {
    var p = pathext[i].toLowerCase();
    if (p && path.substr(-p.length).toLowerCase() === p) {
      return true
    }
  }
  return false
}

function checkStat (stat, path, options) {
  if (!stat.isSymbolicLink() && !stat.isFile()) {
    return false
  }
  return checkPathExt(path, options)
}

function isexe (path, options, cb) {
  fs.stat(path, function (er, stat) {
    cb(er, er ? false : checkStat(stat, path, options));
  });
}

function sync (path, options) {
  return checkStat(fs.statSync(path), path, options)
}

var mode = isexe$1;
isexe$1.sync = sync$1;



function isexe$1 (path, options, cb) {
  fs.stat(path, function (er, stat) {
    cb(er, er ? false : checkStat$1(stat, options));
  });
}

function sync$1 (path, options) {
  return checkStat$1(fs.statSync(path), options)
}

function checkStat$1 (stat, options) {
  return stat.isFile() && checkMode(stat, options)
}

function checkMode (stat, options) {
  var mod = stat.mode;
  var uid = stat.uid;
  var gid = stat.gid;

  var myUid = options.uid !== undefined ?
    options.uid : process.getuid && process.getuid();
  var myGid = options.gid !== undefined ?
    options.gid : process.getgid && process.getgid();

  var u = parseInt('100', 8);
  var g = parseInt('010', 8);
  var o = parseInt('001', 8);
  var ug = u | g;

  var ret = (mod & o) ||
    (mod & g) && gid === myGid ||
    (mod & u) && uid === myUid ||
    (mod & ug) && myUid === 0;

  return ret
}

var core$1;
if (process.platform === 'win32' || commonjsGlobal.TESTING_WINDOWS) {
  core$1 = windows;
} else {
  core$1 = mode;
}

var isexe_1 = isexe$2;
isexe$2.sync = sync$2;

function isexe$2 (path, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  if (!cb) {
    if (typeof Promise !== 'function') {
      throw new TypeError('callback not provided')
    }

    return new Promise(function (resolve, reject) {
      isexe$2(path, options || {}, function (er, is) {
        if (er) {
          reject(er);
        } else {
          resolve(is);
        }
      });
    })
  }

  core$1(path, options || {}, function (er, is) {
    // ignore EACCES because that just means we aren't allowed to run it
    if (er) {
      if (er.code === 'EACCES' || options && options.ignoreErrors) {
        er = null;
        is = false;
      }
    }
    cb(er, is);
  });
}

function sync$2 (path, options) {
  // my kingdom for a filtered catch
  try {
    return core$1.sync(path, options || {})
  } catch (er) {
    if (options && options.ignoreErrors || er.code === 'EACCES') {
      return false
    } else {
      throw er
    }
  }
}

var which_1 = which;
which.sync = whichSync;

var isWindows = process.platform === 'win32' ||
    process.env.OSTYPE === 'cygwin' ||
    process.env.OSTYPE === 'msys';


var COLON = isWindows ? ';' : ':';


function getNotFoundError (cmd) {
  var er = new Error('not found: ' + cmd);
  er.code = 'ENOENT';

  return er
}

function getPathInfo (cmd, opt) {
  var colon = opt.colon || COLON;
  var pathEnv = opt.path || process.env.PATH || '';
  var pathExt = [''];

  pathEnv = pathEnv.split(colon);

  var pathExtExe = '';
  if (isWindows) {
    pathEnv.unshift(process.cwd());
    pathExtExe = (opt.pathExt || process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM');
    pathExt = pathExtExe.split(colon);


    // Always test the cmd itself first.  isexe will check to make sure
    // it's found in the pathExt set.
    if (cmd.indexOf('.') !== -1 && pathExt[0] !== '')
      pathExt.unshift('');
  }

  // If it has a slash, then we don't bother searching the pathenv.
  // just check the file itself, and that's it.
  if (cmd.match(/\//) || isWindows && cmd.match(/\\/))
    pathEnv = [''];

  return {
    env: pathEnv,
    ext: pathExt,
    extExe: pathExtExe
  }
}

function which (cmd, opt, cb) {
  if (typeof opt === 'function') {
    cb = opt;
    opt = {};
  }

  var info = getPathInfo(cmd, opt);
  var pathEnv = info.env;
  var pathExt = info.ext;
  var pathExtExe = info.extExe;
  var found = []

  ;(function F (i, l) {
    if (i === l) {
      if (opt.all && found.length)
        return cb(null, found)
      else
        return cb(getNotFoundError(cmd))
    }

    var pathPart = pathEnv[i];
    if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"')
      pathPart = pathPart.slice(1, -1);

    var p = path.join(pathPart, cmd);
    if (!pathPart && (/^\.[\\\/]/).test(cmd)) {
      p = cmd.slice(0, 2) + p;
    }
(function E (ii, ll) {
      if (ii === ll) return F(i + 1, l)
      var ext = pathExt[ii];
      isexe_1(p + ext, { pathExt: pathExtExe }, function (er, is) {
        if (!er && is) {
          if (opt.all)
            found.push(p + ext);
          else
            return cb(null, p + ext)
        }
        return E(ii + 1, ll)
      });
    })(0, pathExt.length);
  })(0, pathEnv.length);
}

function whichSync (cmd, opt) {
  opt = opt || {};

  var info = getPathInfo(cmd, opt);
  var pathEnv = info.env;
  var pathExt = info.ext;
  var pathExtExe = info.extExe;
  var found = [];

  for (var i = 0, l = pathEnv.length; i < l; i ++) {
    var pathPart = pathEnv[i];
    if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"')
      pathPart = pathPart.slice(1, -1);

    var p = path.join(pathPart, cmd);
    if (!pathPart && /^\.[\\\/]/.test(cmd)) {
      p = cmd.slice(0, 2) + p;
    }
    for (var j = 0, ll = pathExt.length; j < ll; j ++) {
      var cur = p + pathExt[j];
      var is;
      try {
        is = isexe_1.sync(cur, { pathExt: pathExtExe });
        if (is) {
          if (opt.all)
            found.push(cur);
          else
            return cur
        }
      } catch (ex) {}
    }
  }

  if (opt.all && found.length)
    return found

  if (opt.nothrow)
    return null

  throw getNotFoundError(cmd)
}

var pathKey = opts => {
	opts = opts || {};

	const env = opts.env || process.env;
	const platform = opts.platform || process.platform;

	if (platform !== 'win32') {
		return 'PATH';
	}

	return Object.keys(env).find(x => x.toUpperCase() === 'PATH') || 'Path';
};

const pathKey$1 = pathKey();

function resolveCommandAttempt(parsed, withoutPathExt) {
    const cwd = process.cwd();
    const hasCustomCwd = parsed.options.cwd != null;

    // If a custom `cwd` was specified, we need to change the process cwd
    // because `which` will do stat calls but does not support a custom cwd
    if (hasCustomCwd) {
        try {
            process.chdir(parsed.options.cwd);
        } catch (err) {
            /* Empty */
        }
    }

    let resolved;

    try {
        resolved = which_1.sync(parsed.command, {
            path: (parsed.options.env || process.env)[pathKey$1],
            pathExt: withoutPathExt ? path.delimiter : undefined,
        });
    } catch (e) {
        /* Empty */
    } finally {
        process.chdir(cwd);
    }

    // If we successfully resolved, ensure that an absolute path is returned
    // Note that when a custom `cwd` was used, we need to resolve to an absolute path based on it
    if (resolved) {
        resolved = path.resolve(hasCustomCwd ? parsed.options.cwd : '', resolved);
    }

    return resolved;
}

function resolveCommand(parsed) {
    return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
}

var resolveCommand_1 = resolveCommand;

// See http://www.robvanderwoude.com/escapechars.php
const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;

function escapeCommand(arg) {
    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    return arg;
}

function escapeArgument(arg, doubleEscapeMetaChars) {
    // Convert to string
    arg = `${arg}`;

    // Algorithm below is based on https://qntm.org/cmd

    // Sequence of backslashes followed by a double quote:
    // double up all the backslashes and escape the double quote
    arg = arg.replace(/(\\*)"/g, '$1$1\\"');

    // Sequence of backslashes followed by the end of the string
    // (which will become a double quote later):
    // double up all the backslashes
    arg = arg.replace(/(\\*)$/, '$1$1');

    // All other backslashes occur literally

    // Quote the whole thing:
    arg = `"${arg}"`;

    // Escape meta chars
    arg = arg.replace(metaCharsRegExp, '^$1');

    // Double escape meta chars if necessary
    if (doubleEscapeMetaChars) {
        arg = arg.replace(metaCharsRegExp, '^$1');
    }

    return arg;
}

var command$1 = escapeCommand;
var argument = escapeArgument;

var _escape = {
	command: command$1,
	argument: argument
};

var shebangRegex = /^#!.*/;

var shebangCommand = function (str) {
	var match = str.match(shebangRegex);

	if (!match) {
		return null;
	}

	var arr = match[0].replace(/#! ?/, '').split(' ');
	var bin = arr[0].split('/').pop();
	var arg = arr[1];

	return (bin === 'env' ?
		arg :
		bin + (arg ? ' ' + arg : '')
	);
};

function readShebang(command) {
    // Read the first 150 bytes from the file
    const size = 150;
    let buffer;

    if (Buffer.alloc) {
        // Node.js v4.5+ / v5.10+
        buffer = Buffer.alloc(size);
    } else {
        // Old Node.js API
        buffer = new Buffer(size);
        buffer.fill(0); // zero-fill
    }

    let fd;

    try {
        fd = fs.openSync(command, 'r');
        fs.readSync(fd, buffer, 0, size, 0);
        fs.closeSync(fd);
    } catch (e) { /* Empty */ }

    // Attempt to extract shebang (null is returned if not a shebang)
    return shebangCommand(buffer.toString());
}

var readShebang_1 = readShebang;

var semver = createCommonjsModule(function (module, exports) {
exports = module.exports = SemVer;

var debug;
/* istanbul ignore next */
if (typeof process === 'object' &&
    process.env &&
    process.env.NODE_DEBUG &&
    /\bsemver\b/i.test(process.env.NODE_DEBUG)) {
  debug = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('SEMVER');
    console.log.apply(console, args);
  };
} else {
  debug = function () {};
}

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0';

var MAX_LENGTH = 256;
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
  /* istanbul ignore next */ 9007199254740991;

// Max safe segment length for coercion.
var MAX_SAFE_COMPONENT_LENGTH = 16;

// The actual regexps go on exports.re
var re = exports.re = [];
var src = exports.src = [];
var R = 0;

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

var NUMERICIDENTIFIER = R++;
src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
var NUMERICIDENTIFIERLOOSE = R++;
src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

var NONNUMERICIDENTIFIER = R++;
src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';

// ## Main Version
// Three dot-separated numeric identifiers.

var MAINVERSION = R++;
src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')';

var MAINVERSIONLOOSE = R++;
src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

var PRERELEASEIDENTIFIER = R++;
src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
                            '|' + src[NONNUMERICIDENTIFIER] + ')';

var PRERELEASEIDENTIFIERLOOSE = R++;
src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[NONNUMERICIDENTIFIER] + ')';

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

var PRERELEASE = R++;
src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

var PRERELEASELOOSE = R++;
src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

var BUILDIDENTIFIER = R++;
src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

var BUILD = R++;
src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

var FULL = R++;
var FULLPLAIN = 'v?' + src[MAINVERSION] +
                src[PRERELEASE] + '?' +
                src[BUILD] + '?';

src[FULL] = '^' + FULLPLAIN + '$';

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
                 src[PRERELEASELOOSE] + '?' +
                 src[BUILD] + '?';

var LOOSE = R++;
src[LOOSE] = '^' + LOOSEPLAIN + '$';

var GTLT = R++;
src[GTLT] = '((?:<|>)?=?)';

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
var XRANGEIDENTIFIERLOOSE = R++;
src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
var XRANGEIDENTIFIER = R++;
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

var XRANGEPLAIN = R++;
src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:' + src[PRERELEASE] + ')?' +
                   src[BUILD] + '?' +
                   ')?)?';

var XRANGEPLAINLOOSE = R++;
src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:' + src[PRERELEASELOOSE] + ')?' +
                        src[BUILD] + '?' +
                        ')?)?';

var XRANGE = R++;
src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
var XRANGELOOSE = R++;
src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
var COERCE = R++;
src[COERCE] = '(?:^|[^\\d])' +
              '(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '})' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:$|[^\\d])';

// Tilde ranges.
// Meaning is "reasonably at or greater than"
var LONETILDE = R++;
src[LONETILDE] = '(?:~>?)';

var TILDETRIM = R++;
src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
var tildeTrimReplace = '$1~';

var TILDE = R++;
src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
var TILDELOOSE = R++;
src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

// Caret ranges.
// Meaning is "at least and backwards compatible with"
var LONECARET = R++;
src[LONECARET] = '(?:\\^)';

var CARETTRIM = R++;
src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
var caretTrimReplace = '$1^';

var CARET = R++;
src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
var CARETLOOSE = R++;
src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

// A simple gt/lt/eq thing, or just "" to indicate "any version"
var COMPARATORLOOSE = R++;
src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
var COMPARATOR = R++;
src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
var COMPARATORTRIM = R++;
src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

// this one has to use the /g flag
re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
var comparatorTrimReplace = '$1$2$3';

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
var HYPHENRANGE = R++;
src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[XRANGEPLAIN] + ')' +
                   '\\s*$';

var HYPHENRANGELOOSE = R++;
src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s*$';

// Star ranges basically just allow anything at all.
var STAR = R++;
src[STAR] = '(<|>)?=?\\s*\\*';

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  debug(i, src[i]);
  if (!re[i]) {
    re[i] = new RegExp(src[i]);
  }
}

exports.parse = parse;
function parse (version, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }

  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  if (version.length > MAX_LENGTH) {
    return null
  }

  var r = options.loose ? re[LOOSE] : re[FULL];
  if (!r.test(version)) {
    return null
  }

  try {
    return new SemVer(version, options)
  } catch (er) {
    return null
  }
}

exports.valid = valid;
function valid (version, options) {
  var v = parse(version, options);
  return v ? v.version : null
}

exports.clean = clean;
function clean (version, options) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), options);
  return s ? s.version : null
}

exports.SemVer = SemVer;

function SemVer (version, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }
  if (version instanceof SemVer) {
    if (version.loose === options.loose) {
      return version
    } else {
      version = version.version;
    }
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version)
  }

  if (version.length > MAX_LENGTH) {
    throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters')
  }

  if (!(this instanceof SemVer)) {
    return new SemVer(version, options)
  }

  debug('SemVer', version, options);
  this.options = options;
  this.loose = !!options.loose;

  var m = version.trim().match(options.loose ? re[LOOSE] : re[FULL]);

  if (!m) {
    throw new TypeError('Invalid Version: ' + version)
  }

  this.raw = version;

  // these are actually numbers
  this.major = +m[1];
  this.minor = +m[2];
  this.patch = +m[3];

  if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
    throw new TypeError('Invalid major version')
  }

  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
    throw new TypeError('Invalid minor version')
  }

  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
    throw new TypeError('Invalid patch version')
  }

  // numberify any prerelease numeric ids
  if (!m[4]) {
    this.prerelease = [];
  } else {
    this.prerelease = m[4].split('.').map(function (id) {
      if (/^[0-9]+$/.test(id)) {
        var num = +id;
        if (num >= 0 && num < MAX_SAFE_INTEGER) {
          return num
        }
      }
      return id
    });
  }

  this.build = m[5] ? m[5].split('.') : [];
  this.format();
}

SemVer.prototype.format = function () {
  this.version = this.major + '.' + this.minor + '.' + this.patch;
  if (this.prerelease.length) {
    this.version += '-' + this.prerelease.join('.');
  }
  return this.version
};

SemVer.prototype.toString = function () {
  return this.version
};

SemVer.prototype.compare = function (other) {
  debug('SemVer.compare', this.version, this.options, other);
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options);
  }

  return this.compareMain(other) || this.comparePre(other)
};

SemVer.prototype.compareMain = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options);
  }

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch)
};

SemVer.prototype.comparePre = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options);
  }

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length) {
    return -1
  } else if (!this.prerelease.length && other.prerelease.length) {
    return 1
  } else if (!this.prerelease.length && !other.prerelease.length) {
    return 0
  }

  var i = 0;
  do {
    var a = this.prerelease[i];
    var b = other.prerelease[i];
    debug('prerelease compare', i, a, b);
    if (a === undefined && b === undefined) {
      return 0
    } else if (b === undefined) {
      return 1
    } else if (a === undefined) {
      return -1
    } else if (a === b) {
      continue
    } else {
      return compareIdentifiers(a, b)
    }
  } while (++i)
};

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function (release, identifier) {
  switch (release) {
    case 'premajor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor = 0;
      this.major++;
      this.inc('pre', identifier);
      break
    case 'preminor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor++;
      this.inc('pre', identifier);
      break
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0;
      this.inc('patch', identifier);
      this.inc('pre', identifier);
      break
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0) {
        this.inc('patch', identifier);
      }
      this.inc('pre', identifier);
      break

    case 'major':
      // If this is a pre-major version, bump up to the same major version.
      // Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      if (this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0) {
        this.major++;
      }
      this.minor = 0;
      this.patch = 0;
      this.prerelease = [];
      break
    case 'minor':
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      if (this.patch !== 0 || this.prerelease.length === 0) {
        this.minor++;
      }
      this.patch = 0;
      this.prerelease = [];
      break
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0) {
        this.patch++;
      }
      this.prerelease = [];
      break
    // This probably shouldn't be used publicly.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0) {
        this.prerelease = [0];
      } else {
        var i = this.prerelease.length;
        while (--i >= 0) {
          if (typeof this.prerelease[i] === 'number') {
            this.prerelease[i]++;
            i = -2;
          }
        }
        if (i === -1) {
          // didn't increment anything
          this.prerelease.push(0);
        }
      }
      if (identifier) {
        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
        if (this.prerelease[0] === identifier) {
          if (isNaN(this.prerelease[1])) {
            this.prerelease = [identifier, 0];
          }
        } else {
          this.prerelease = [identifier, 0];
        }
      }
      break

    default:
      throw new Error('invalid increment argument: ' + release)
  }
  this.format();
  this.raw = this.version;
  return this
};

exports.inc = inc;
function inc (version, release, loose, identifier) {
  if (typeof (loose) === 'string') {
    identifier = loose;
    loose = undefined;
  }

  try {
    return new SemVer(version, loose).inc(release, identifier).version
  } catch (er) {
    return null
  }
}

exports.diff = diff;
function diff (version1, version2) {
  if (eq(version1, version2)) {
    return null
  } else {
    var v1 = parse(version1);
    var v2 = parse(version2);
    var prefix = '';
    if (v1.prerelease.length || v2.prerelease.length) {
      prefix = 'pre';
      var defaultResult = 'prerelease';
    }
    for (var key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return prefix + key
        }
      }
    }
    return defaultResult // may be undefined
  }
}

exports.compareIdentifiers = compareIdentifiers;

var numeric = /^[0-9]+$/;
function compareIdentifiers (a, b) {
  var anum = numeric.test(a);
  var bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

exports.rcompareIdentifiers = rcompareIdentifiers;
function rcompareIdentifiers (a, b) {
  return compareIdentifiers(b, a)
}

exports.major = major;
function major (a, loose) {
  return new SemVer(a, loose).major
}

exports.minor = minor;
function minor (a, loose) {
  return new SemVer(a, loose).minor
}

exports.patch = patch;
function patch (a, loose) {
  return new SemVer(a, loose).patch
}

exports.compare = compare;
function compare (a, b, loose) {
  return new SemVer(a, loose).compare(new SemVer(b, loose))
}

exports.compareLoose = compareLoose;
function compareLoose (a, b) {
  return compare(a, b, true)
}

exports.rcompare = rcompare;
function rcompare (a, b, loose) {
  return compare(b, a, loose)
}

exports.sort = sort;
function sort (list, loose) {
  return list.sort(function (a, b) {
    return exports.compare(a, b, loose)
  })
}

exports.rsort = rsort;
function rsort (list, loose) {
  return list.sort(function (a, b) {
    return exports.rcompare(a, b, loose)
  })
}

exports.gt = gt;
function gt (a, b, loose) {
  return compare(a, b, loose) > 0
}

exports.lt = lt;
function lt (a, b, loose) {
  return compare(a, b, loose) < 0
}

exports.eq = eq;
function eq (a, b, loose) {
  return compare(a, b, loose) === 0
}

exports.neq = neq;
function neq (a, b, loose) {
  return compare(a, b, loose) !== 0
}

exports.gte = gte;
function gte (a, b, loose) {
  return compare(a, b, loose) >= 0
}

exports.lte = lte;
function lte (a, b, loose) {
  return compare(a, b, loose) <= 0
}

exports.cmp = cmp;
function cmp (a, op, b, loose) {
  switch (op) {
    case '===':
      if (typeof a === 'object')
        a = a.version;
      if (typeof b === 'object')
        b = b.version;
      return a === b

    case '!==':
      if (typeof a === 'object')
        a = a.version;
      if (typeof b === 'object')
        b = b.version;
      return a !== b

    case '':
    case '=':
    case '==':
      return eq(a, b, loose)

    case '!=':
      return neq(a, b, loose)

    case '>':
      return gt(a, b, loose)

    case '>=':
      return gte(a, b, loose)

    case '<':
      return lt(a, b, loose)

    case '<=':
      return lte(a, b, loose)

    default:
      throw new TypeError('Invalid operator: ' + op)
  }
}

exports.Comparator = Comparator;
function Comparator (comp, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }

  if (comp instanceof Comparator) {
    if (comp.loose === !!options.loose) {
      return comp
    } else {
      comp = comp.value;
    }
  }

  if (!(this instanceof Comparator)) {
    return new Comparator(comp, options)
  }

  debug('comparator', comp, options);
  this.options = options;
  this.loose = !!options.loose;
  this.parse(comp);

  if (this.semver === ANY) {
    this.value = '';
  } else {
    this.value = this.operator + this.semver.version;
  }

  debug('comp', this);
}

var ANY = {};
Comparator.prototype.parse = function (comp) {
  var r = this.options.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var m = comp.match(r);

  if (!m) {
    throw new TypeError('Invalid comparator: ' + comp)
  }

  this.operator = m[1];
  if (this.operator === '=') {
    this.operator = '';
  }

  // if it literally is just '>' or '' then allow anything.
  if (!m[2]) {
    this.semver = ANY;
  } else {
    this.semver = new SemVer(m[2], this.options.loose);
  }
};

Comparator.prototype.toString = function () {
  return this.value
};

Comparator.prototype.test = function (version) {
  debug('Comparator.test', version, this.options.loose);

  if (this.semver === ANY) {
    return true
  }

  if (typeof version === 'string') {
    version = new SemVer(version, this.options);
  }

  return cmp(version, this.operator, this.semver, this.options)
};

Comparator.prototype.intersects = function (comp, options) {
  if (!(comp instanceof Comparator)) {
    throw new TypeError('a Comparator is required')
  }

  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }

  var rangeTmp;

  if (this.operator === '') {
    rangeTmp = new Range(comp.value, options);
    return satisfies(this.value, rangeTmp, options)
  } else if (comp.operator === '') {
    rangeTmp = new Range(this.value, options);
    return satisfies(comp.semver, rangeTmp, options)
  }

  var sameDirectionIncreasing =
    (this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '>=' || comp.operator === '>');
  var sameDirectionDecreasing =
    (this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '<=' || comp.operator === '<');
  var sameSemVer = this.semver.version === comp.semver.version;
  var differentDirectionsInclusive =
    (this.operator === '>=' || this.operator === '<=') &&
    (comp.operator === '>=' || comp.operator === '<=');
  var oppositeDirectionsLessThan =
    cmp(this.semver, '<', comp.semver, options) &&
    ((this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '<=' || comp.operator === '<'));
  var oppositeDirectionsGreaterThan =
    cmp(this.semver, '>', comp.semver, options) &&
    ((this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '>=' || comp.operator === '>'));

  return sameDirectionIncreasing || sameDirectionDecreasing ||
    (sameSemVer && differentDirectionsInclusive) ||
    oppositeDirectionsLessThan || oppositeDirectionsGreaterThan
};

exports.Range = Range;
function Range (range, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }

  if (range instanceof Range) {
    if (range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease) {
      return range
    } else {
      return new Range(range.raw, options)
    }
  }

  if (range instanceof Comparator) {
    return new Range(range.value, options)
  }

  if (!(this instanceof Range)) {
    return new Range(range, options)
  }

  this.options = options;
  this.loose = !!options.loose;
  this.includePrerelease = !!options.includePrerelease;

  // First, split based on boolean or ||
  this.raw = range;
  this.set = range.split(/\s*\|\|\s*/).map(function (range) {
    return this.parseRange(range.trim())
  }, this).filter(function (c) {
    // throw out any that are not relevant for whatever reason
    return c.length
  });

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + range)
  }

  this.format();
}

Range.prototype.format = function () {
  this.range = this.set.map(function (comps) {
    return comps.join(' ').trim()
  }).join('||').trim();
  return this.range
};

Range.prototype.toString = function () {
  return this.range
};

Range.prototype.parseRange = function (range) {
  var loose = this.options.loose;
  range = range.trim();
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
  range = range.replace(hr, hyphenReplace);
  debug('hyphen replace', range);
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
  debug('comparator trim', range, re[COMPARATORTRIM]);

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(re[TILDETRIM], tildeTrimReplace);

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(re[CARETTRIM], caretTrimReplace);

  // normalize spaces
  range = range.split(/\s+/).join(' ');

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var set = range.split(' ').map(function (comp) {
    return parseComparator(comp, this.options)
  }, this).join(' ').split(/\s+/);
  if (this.options.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function (comp) {
      return !!comp.match(compRe)
    });
  }
  set = set.map(function (comp) {
    return new Comparator(comp, this.options)
  }, this);

  return set
};

Range.prototype.intersects = function (range, options) {
  if (!(range instanceof Range)) {
    throw new TypeError('a Range is required')
  }

  return this.set.some(function (thisComparators) {
    return thisComparators.every(function (thisComparator) {
      return range.set.some(function (rangeComparators) {
        return rangeComparators.every(function (rangeComparator) {
          return thisComparator.intersects(rangeComparator, options)
        })
      })
    })
  })
};

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators;
function toComparators (range, options) {
  return new Range(range, options).set.map(function (comp) {
    return comp.map(function (c) {
      return c.value
    }).join(' ').trim().split(' ')
  })
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator (comp, options) {
  debug('comp', comp, options);
  comp = replaceCarets(comp, options);
  debug('caret', comp);
  comp = replaceTildes(comp, options);
  debug('tildes', comp);
  comp = replaceXRanges(comp, options);
  debug('xrange', comp);
  comp = replaceStars(comp, options);
  debug('stars', comp);
  return comp
}

function isX (id) {
  return !id || id.toLowerCase() === 'x' || id === '*'
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    return replaceTilde(comp, options)
  }).join(' ')
}

function replaceTilde (comp, options) {
  var r = options.loose ? re[TILDELOOSE] : re[TILDE];
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr);
    var ret;

    if (isX(M)) {
      ret = '';
    } else if (isX(m)) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (isX(p)) {
      // ~1.2 == >=1.2.0 <1.3.0
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    } else if (pr) {
      debug('replaceTilde pr', pr);
      ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
            ' <' + M + '.' + (+m + 1) + '.0';
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0
      ret = '>=' + M + '.' + m + '.' + p +
            ' <' + M + '.' + (+m + 1) + '.0';
    }

    debug('tilde return', ret);
    return ret
  })
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    return replaceCaret(comp, options)
  }).join(' ')
}

function replaceCaret (comp, options) {
  debug('caret', comp, options);
  var r = options.loose ? re[CARETLOOSE] : re[CARET];
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr);
    var ret;

    if (isX(M)) {
      ret = '';
    } else if (isX(m)) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (isX(p)) {
      if (M === '0') {
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
      } else {
        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
      }
    } else if (pr) {
      debug('replaceCaret pr', pr);
      if (M === '0') {
        if (m === '0') {
          ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
                ' <' + M + '.' + m + '.' + (+p + 1);
        } else {
          ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
                ' <' + M + '.' + (+m + 1) + '.0';
        }
      } else {
        ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
              ' <' + (+M + 1) + '.0.0';
      }
    } else {
      debug('no pr');
      if (M === '0') {
        if (m === '0') {
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + m + '.' + (+p + 1);
        } else {
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + (+m + 1) + '.0';
        }
      } else {
        ret = '>=' + M + '.' + m + '.' + p +
              ' <' + (+M + 1) + '.0.0';
      }
    }

    debug('caret return', ret);
    return ret
  })
}

function replaceXRanges (comp, options) {
  debug('replaceXRanges', comp, options);
  return comp.split(/\s+/).map(function (comp) {
    return replaceXRange(comp, options)
  }).join(' ')
}

function replaceXRange (comp, options) {
  comp = comp.trim();
  var r = options.loose ? re[XRANGELOOSE] : re[XRANGE];
  return comp.replace(r, function (ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr);
    var xM = isX(M);
    var xm = xM || isX(m);
    var xp = xm || isX(p);
    var anyX = xp;

    if (gtlt === '=' && anyX) {
      gtlt = '';
    }

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0';
      } else {
        // nothing is forbidden
        ret = '*';
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0;
      }
      p = 0;

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        // >1.2.3 => >= 1.2.4
        gtlt = '>=';
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<';
        if (xm) {
          M = +M + 1;
        } else {
          m = +m + 1;
        }
      }

      ret = gtlt + M + '.' + m + '.' + p;
    } else if (xm) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    }

    debug('xRange return', ret);

    return ret
  })
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars (comp, options) {
  debug('replaceStars', comp, options);
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[STAR], '')
}

// This function is passed to string.replace(re[HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
function hyphenReplace ($0,
  from, fM, fm, fp, fpr, fb,
  to, tM, tm, tp, tpr, tb) {
  if (isX(fM)) {
    from = '';
  } else if (isX(fm)) {
    from = '>=' + fM + '.0.0';
  } else if (isX(fp)) {
    from = '>=' + fM + '.' + fm + '.0';
  } else {
    from = '>=' + from;
  }

  if (isX(tM)) {
    to = '';
  } else if (isX(tm)) {
    to = '<' + (+tM + 1) + '.0.0';
  } else if (isX(tp)) {
    to = '<' + tM + '.' + (+tm + 1) + '.0';
  } else if (tpr) {
    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
  } else {
    to = '<=' + to;
  }

  return (from + ' ' + to).trim()
}

// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function (version) {
  if (!version) {
    return false
  }

  if (typeof version === 'string') {
    version = new SemVer(version, this.options);
  }

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this.set[i], version, this.options)) {
      return true
    }
  }
  return false
};

function testSet (set, version, options) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (i = 0; i < set.length; i++) {
      debug(set[i].semver);
      if (set[i].semver === ANY) {
        continue
      }

      if (set[i].semver.prerelease.length > 0) {
        var allowed = set[i].semver;
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
}

exports.satisfies = satisfies;
function satisfies (version, range, options) {
  try {
    range = new Range(range, options);
  } catch (er) {
    return false
  }
  return range.test(version)
}

exports.maxSatisfying = maxSatisfying;
function maxSatisfying (versions, range, options) {
  var max = null;
  var maxSV = null;
  try {
    var rangeObj = new Range(range, options);
  } catch (er) {
    return null
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v;
        maxSV = new SemVer(max, options);
      }
    }
  });
  return max
}

exports.minSatisfying = minSatisfying;
function minSatisfying (versions, range, options) {
  var min = null;
  var minSV = null;
  try {
    var rangeObj = new Range(range, options);
  } catch (er) {
    return null
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v;
        minSV = new SemVer(min, options);
      }
    }
  });
  return min
}

exports.minVersion = minVersion;
function minVersion (range, loose) {
  range = new Range(range, loose);

  var minver = new SemVer('0.0.0');
  if (range.test(minver)) {
    return minver
  }

  minver = new SemVer('0.0.0-0');
  if (range.test(minver)) {
    return minver
  }

  minver = null;
  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    comparators.forEach(function (comparator) {
      // Clone to avoid manipulating the comparator's semver object.
      var compver = new SemVer(comparator.semver.version);
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++;
          } else {
            compver.prerelease.push(0);
          }
          compver.raw = compver.format();
          /* fallthrough */
        case '':
        case '>=':
          if (!minver || gt(minver, compver)) {
            minver = compver;
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error('Unexpected operation: ' + comparator.operator)
      }
    });
  }

  if (minver && range.test(minver)) {
    return minver
  }

  return null
}

exports.validRange = validRange;
function validRange (range, options) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*'
  } catch (er) {
    return null
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr;
function ltr (version, range, options) {
  return outside(version, range, '<', options)
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr;
function gtr (version, range, options) {
  return outside(version, range, '>', options)
}

exports.outside = outside;
function outside (version, range, hilo, options) {
  version = new SemVer(version, options);
  range = new Range(range, options);

  var gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case '>':
      gtfn = gt;
      ltefn = lte;
      ltfn = lt;
      comp = '>';
      ecomp = '>=';
      break
    case '<':
      gtfn = lt;
      ltefn = gte;
      ltfn = gt;
      comp = '<';
      ecomp = '<=';
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, options)) {
    return false
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    var high = null;
    var low = null;

    comparators.forEach(function (comparator) {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0');
      }
      high = high || comparator;
      low = low || comparator;
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator;
      }
    });

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false
    }
  }
  return true
}

exports.prerelease = prerelease;
function prerelease (version, options) {
  var parsed = parse(version, options);
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}

exports.intersects = intersects;
function intersects (r1, r2, options) {
  r1 = new Range(r1, options);
  r2 = new Range(r2, options);
  return r1.intersects(r2)
}

exports.coerce = coerce;
function coerce (version) {
  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  var match = version.match(re[COERCE]);

  if (match == null) {
    return null
  }

  return parse(match[1] +
    '.' + (match[2] || '0') +
    '.' + (match[3] || '0'))
}
});
var semver_1 = semver.SEMVER_SPEC_VERSION;
var semver_2 = semver.re;
var semver_3 = semver.src;
var semver_4 = semver.parse;
var semver_5 = semver.valid;
var semver_6 = semver.clean;
var semver_7 = semver.SemVer;
var semver_8 = semver.inc;
var semver_9 = semver.diff;
var semver_10 = semver.compareIdentifiers;
var semver_11 = semver.rcompareIdentifiers;
var semver_12 = semver.major;
var semver_13 = semver.minor;
var semver_14 = semver.patch;
var semver_15 = semver.compare;
var semver_16 = semver.compareLoose;
var semver_17 = semver.rcompare;
var semver_18 = semver.sort;
var semver_19 = semver.rsort;
var semver_20 = semver.gt;
var semver_21 = semver.lt;
var semver_22 = semver.eq;
var semver_23 = semver.neq;
var semver_24 = semver.gte;
var semver_25 = semver.lte;
var semver_26 = semver.cmp;
var semver_27 = semver.Comparator;
var semver_28 = semver.Range;
var semver_29 = semver.toComparators;
var semver_30 = semver.satisfies;
var semver_31 = semver.maxSatisfying;
var semver_32 = semver.minSatisfying;
var semver_33 = semver.minVersion;
var semver_34 = semver.validRange;
var semver_35 = semver.ltr;
var semver_36 = semver.gtr;
var semver_37 = semver.outside;
var semver_38 = semver.prerelease;
var semver_39 = semver.intersects;
var semver_40 = semver.coerce;

const isWin = process.platform === 'win32';
const isExecutableRegExp = /\.(?:com|exe)$/i;
const isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;

// `options.shell` is supported in Node ^4.8.0, ^5.7.0 and >= 6.0.0
const supportsShellOption = src(() => semver.satisfies(process.version, '^4.8.0 || ^5.7.0 || >= 6.0.0', true)) || false;

function detectShebang(parsed) {
    parsed.file = resolveCommand_1(parsed);

    const shebang = parsed.file && readShebang_1(parsed.file);

    if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;

        return resolveCommand_1(parsed);
    }

    return parsed.file;
}

function parseNonShell(parsed) {
    if (!isWin) {
        return parsed;
    }

    // Detect & add support for shebangs
    const commandFile = detectShebang(parsed);

    // We don't need a shell if the command filename is an executable
    const needsShell = !isExecutableRegExp.test(commandFile);

    // If a shell is required, use cmd.exe and take care of escaping everything correctly
    // Note that `forceShell` is an hidden option used only in tests
    if (parsed.options.forceShell || needsShell) {
        // Need to double escape meta chars if the command is a cmd-shim located in `node_modules/.bin/`
        // The cmd-shim simply calls execute the package bin file with NodeJS, proxying any argument
        // Because the escape of metachars with ^ gets interpreted when the cmd.exe is first called,
        // we need to double escape them
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);

        // Normalize posix paths into OS compatible paths (e.g.: foo/bar -> foo\bar)
        // This is necessary otherwise it will always fail with ENOENT in those cases
        parsed.command = path.normalize(parsed.command);

        // Escape command & arguments
        parsed.command = _escape.command(parsed.command);
        parsed.args = parsed.args.map((arg) => _escape.argument(arg, needsDoubleEscapeMetaChars));

        const shellCommand = [parsed.command].concat(parsed.args).join(' ');

        parsed.args = ['/d', '/s', '/c', `"${shellCommand}"`];
        parsed.command = process.env.comspec || 'cmd.exe';
        parsed.options.windowsVerbatimArguments = true; // Tell node's spawn that the arguments are already escaped
    }

    return parsed;
}

function parseShell(parsed) {
    // If node supports the shell option, there's no need to mimic its behavior
    if (supportsShellOption) {
        return parsed;
    }

    // Mimic node shell option
    // See https://github.com/nodejs/node/blob/b9f6a2dc059a1062776133f3d4fd848c4da7d150/lib/child_process.js#L335
    const shellCommand = [parsed.command].concat(parsed.args).join(' ');

    if (isWin) {
        parsed.command = typeof parsed.options.shell === 'string' ? parsed.options.shell : process.env.comspec || 'cmd.exe';
        parsed.args = ['/d', '/s', '/c', `"${shellCommand}"`];
        parsed.options.windowsVerbatimArguments = true; // Tell node's spawn that the arguments are already escaped
    } else {
        if (typeof parsed.options.shell === 'string') {
            parsed.command = parsed.options.shell;
        } else if (process.platform === 'android') {
            parsed.command = '/system/bin/sh';
        } else {
            parsed.command = '/bin/sh';
        }

        parsed.args = ['-c', shellCommand];
    }

    return parsed;
}

function parse(command, args, options) {
    // Normalize arguments, similar to nodejs
    if (args && !Array.isArray(args)) {
        options = args;
        args = null;
    }

    args = args ? args.slice(0) : []; // Clone array to avoid changing the original
    options = Object.assign({}, options); // Clone object to avoid changing the original

    // Build our parsed object
    const parsed = {
        command,
        args,
        options,
        file: undefined,
        original: {
            command,
            args,
        },
    };

    // Delegate further parsing to shell or non-shell
    return options.shell ? parseShell(parsed) : parseNonShell(parsed);
}

var parse_1 = parse;

const isWin$1 = process.platform === 'win32';

function notFoundError(original, syscall) {
    return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: 'ENOENT',
        errno: 'ENOENT',
        syscall: `${syscall} ${original.command}`,
        path: original.command,
        spawnargs: original.args,
    });
}

function hookChildProcess(cp, parsed) {
    if (!isWin$1) {
        return;
    }

    const originalEmit = cp.emit;

    cp.emit = function (name, arg1) {
        // If emitting "exit" event and exit code is 1, we need to check if
        // the command exists and emit an "error" instead
        // See https://github.com/IndigoUnited/node-cross-spawn/issues/16
        if (name === 'exit') {
            const err = verifyENOENT(arg1, parsed);

            if (err) {
                return originalEmit.call(cp, 'error', err);
            }
        }

        return originalEmit.apply(cp, arguments); // eslint-disable-line prefer-rest-params
    };
}

function verifyENOENT(status, parsed) {
    if (isWin$1 && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, 'spawn');
    }

    return null;
}

function verifyENOENTSync(status, parsed) {
    if (isWin$1 && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, 'spawnSync');
    }

    return null;
}

var enoent = {
    hookChildProcess,
    verifyENOENT,
    verifyENOENTSync,
    notFoundError,
};

function spawn(command, args, options) {
    // Parse the arguments
    const parsed = parse_1(command, args, options);

    // Spawn the child process
    const spawned = child_process.spawn(parsed.command, parsed.args, parsed.options);

    // Hook into child process "exit" event to emit an error if the command
    // does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    enoent.hookChildProcess(spawned, parsed);

    return spawned;
}

function spawnSync(command, args, options) {
    // Parse the arguments
    const parsed = parse_1(command, args, options);

    // Spawn the child process
    const result = child_process.spawnSync(parsed.command, parsed.args, parsed.options);

    // Analyze if the command does not exist, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
    result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);

    return result;
}

var crossSpawn = spawn;
var spawn_1 = spawn;
var sync$3 = spawnSync;

var _parse = parse_1;
var _enoent = enoent;
crossSpawn.spawn = spawn_1;
crossSpawn.sync = sync$3;
crossSpawn._parse = _parse;
crossSpawn._enoent = _enoent;

var stripEof = function (x) {
	var lf = typeof x === 'string' ? '\n' : '\n'.charCodeAt();
	var cr = typeof x === 'string' ? '\r' : '\r'.charCodeAt();

	if (x[x.length - 1] === lf) {
		x = x.slice(0, x.length - 1);
	}

	if (x[x.length - 1] === cr) {
		x = x.slice(0, x.length - 1);
	}

	return x;
};

var npmRunPath = createCommonjsModule(function (module) {



module.exports = opts => {
	opts = Object.assign({
		cwd: process.cwd(),
		path: process.env[pathKey()]
	}, opts);

	let prev;
	let pth = path.resolve(opts.cwd);
	const ret = [];

	while (prev !== pth) {
		ret.push(path.join(pth, 'node_modules/.bin'));
		prev = pth;
		pth = path.resolve(pth, '..');
	}

	// ensure the running `node` binary is used
	ret.push(path.dirname(process.execPath));

	return ret.concat(opts.path).join(path.delimiter);
};

module.exports.env = opts => {
	opts = Object.assign({
		env: process.env
	}, opts);

	const env = Object.assign({}, opts.env);
	const path = pathKey({env});

	opts.path = env[path];
	env[path] = module.exports(opts);

	return env;
};
});
var npmRunPath_1 = npmRunPath.env;

var isStream_1 = createCommonjsModule(function (module) {

var isStream = module.exports = function (stream) {
	return stream !== null && typeof stream === 'object' && typeof stream.pipe === 'function';
};

isStream.writable = function (stream) {
	return isStream(stream) && stream.writable !== false && typeof stream._write === 'function' && typeof stream._writableState === 'object';
};

isStream.readable = function (stream) {
	return isStream(stream) && stream.readable !== false && typeof stream._read === 'function' && typeof stream._readableState === 'object';
};

isStream.duplex = function (stream) {
	return isStream.writable(stream) && isStream.readable(stream);
};

isStream.transform = function (stream) {
	return isStream.duplex(stream) && typeof stream._transform === 'function' && typeof stream._transformState === 'object';
};
});

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
var wrappy_1 = wrappy;
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k];
  });

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    var ret = fn.apply(this, args);
    var cb = args[args.length-1];
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k];
      });
    }
    return ret
  }
}

var once_1 = wrappy_1(once);
var strict = wrappy_1(onceStrict);

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  });

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  });
});

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true;
    return f.value = fn.apply(this, arguments)
  };
  f.called = false;
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true;
    return f.value = fn.apply(this, arguments)
  };
  var name = fn.name || 'Function wrapped with `once`';
  f.onceError = name + " shouldn't be called more than once";
  f.called = false;
  return f
}
once_1.strict = strict;

var noop = function() {};

var isRequest = function(stream) {
	return stream.setHeader && typeof stream.abort === 'function';
};

var isChildProcess = function(stream) {
	return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
};

var eos = function(stream, opts, callback) {
	if (typeof opts === 'function') return eos(stream, null, opts);
	if (!opts) opts = {};

	callback = once_1(callback || noop);

	var ws = stream._writableState;
	var rs = stream._readableState;
	var readable = opts.readable || (opts.readable !== false && stream.readable);
	var writable = opts.writable || (opts.writable !== false && stream.writable);

	var onlegacyfinish = function() {
		if (!stream.writable) onfinish();
	};

	var onfinish = function() {
		writable = false;
		if (!readable) callback.call(stream);
	};

	var onend = function() {
		readable = false;
		if (!writable) callback.call(stream);
	};

	var onexit = function(exitCode) {
		callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
	};

	var onerror = function(err) {
		callback.call(stream, err);
	};

	var onclose = function() {
		if (readable && !(rs && rs.ended)) return callback.call(stream, new Error('premature close'));
		if (writable && !(ws && ws.ended)) return callback.call(stream, new Error('premature close'));
	};

	var onrequest = function() {
		stream.req.on('finish', onfinish);
	};

	if (isRequest(stream)) {
		stream.on('complete', onfinish);
		stream.on('abort', onclose);
		if (stream.req) onrequest();
		else stream.on('request', onrequest);
	} else if (writable && !ws) { // legacy streams
		stream.on('end', onlegacyfinish);
		stream.on('close', onlegacyfinish);
	}

	if (isChildProcess(stream)) stream.on('exit', onexit);

	stream.on('end', onend);
	stream.on('finish', onfinish);
	if (opts.error !== false) stream.on('error', onerror);
	stream.on('close', onclose);

	return function() {
		stream.removeListener('complete', onfinish);
		stream.removeListener('abort', onclose);
		stream.removeListener('request', onrequest);
		if (stream.req) stream.req.removeListener('finish', onfinish);
		stream.removeListener('end', onlegacyfinish);
		stream.removeListener('close', onlegacyfinish);
		stream.removeListener('finish', onfinish);
		stream.removeListener('exit', onexit);
		stream.removeListener('end', onend);
		stream.removeListener('error', onerror);
		stream.removeListener('close', onclose);
	};
};

var endOfStream = eos;

// we only need fs to get the ReadStream and WriteStream prototypes

var noop$1 = function () {};
var ancient = /^v?\.0/.test(process.version);

var isFn = function (fn) {
  return typeof fn === 'function'
};

var isFS = function (stream) {
  if (!ancient) return false // newer node version do not need to care about fs is a special way
  if (!fs) return false // browser
  return (stream instanceof (fs.ReadStream || noop$1) || stream instanceof (fs.WriteStream || noop$1)) && isFn(stream.close)
};

var isRequest$1 = function (stream) {
  return stream.setHeader && isFn(stream.abort)
};

var destroyer = function (stream, reading, writing, callback) {
  callback = once_1(callback);

  var closed = false;
  stream.on('close', function () {
    closed = true;
  });

  endOfStream(stream, {readable: reading, writable: writing}, function (err) {
    if (err) return callback(err)
    closed = true;
    callback();
  });

  var destroyed = false;
  return function (err) {
    if (closed) return
    if (destroyed) return
    destroyed = true;

    if (isFS(stream)) return stream.close(noop$1) // use close for fs streams to avoid fd leaks
    if (isRequest$1(stream)) return stream.abort() // request.destroy just do .end - .abort is what we want

    if (isFn(stream.destroy)) return stream.destroy()

    callback(err || new Error('stream was destroyed'));
  }
};

var call = function (fn) {
  fn();
};

var pipe = function (from, to) {
  return from.pipe(to)
};

var pump = function () {
  var streams = Array.prototype.slice.call(arguments);
  var callback = isFn(streams[streams.length - 1] || noop$1) && streams.pop() || noop$1;

  if (Array.isArray(streams[0])) streams = streams[0];
  if (streams.length < 2) throw new Error('pump requires two streams per minimum')

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return
      destroys.forEach(call);
      callback(error);
    })
  });

  return streams.reduce(pipe)
};

var pump_1 = pump;

const {PassThrough} = Stream;

var bufferStream = options => {
	options = Object.assign({}, options);

	const {array} = options;
	let {encoding} = options;
	const buffer = encoding === 'buffer';
	let objectMode = false;

	if (array) {
		objectMode = !(encoding || buffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (buffer) {
		encoding = null;
	}

	let len = 0;
	const ret = [];
	const stream = new PassThrough({objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	stream.on('data', chunk => {
		ret.push(chunk);

		if (objectMode) {
			len = ret.length;
		} else {
			len += chunk.length;
		}
	});

	stream.getBufferedValue = () => {
		if (array) {
			return ret;
		}

		return buffer ? Buffer.concat(ret, len) : ret.join('');
	};

	stream.getBufferedLength = () => len;

	return stream;
};

class MaxBufferError extends Error {
	constructor() {
		super('maxBuffer exceeded');
		this.name = 'MaxBufferError';
	}
}

function getStream(inputStream, options) {
	if (!inputStream) {
		return Promise.reject(new Error('Expected a stream'));
	}

	options = Object.assign({maxBuffer: Infinity}, options);

	const {maxBuffer} = options;

	let stream;
	return new Promise((resolve, reject) => {
		const rejectPromise = error => {
			if (error) { // A null check
				error.bufferedData = stream.getBufferedValue();
			}
			reject(error);
		};

		stream = pump_1(inputStream, bufferStream(options), error => {
			if (error) {
				rejectPromise(error);
				return;
			}

			resolve();
		});

		stream.on('data', () => {
			if (stream.getBufferedLength() > maxBuffer) {
				rejectPromise(new MaxBufferError());
			}
		});
	}).then(() => stream.getBufferedValue());
}

var getStream_1 = getStream;
var buffer = (stream, options) => getStream(stream, Object.assign({}, options, {encoding: 'buffer'}));
var array = (stream, options) => getStream(stream, Object.assign({}, options, {array: true}));
var MaxBufferError_1 = MaxBufferError;
getStream_1.buffer = buffer;
getStream_1.array = array;
getStream_1.MaxBufferError = MaxBufferError_1;

var pFinally = (promise, onFinally) => {
	onFinally = onFinally || (() => {});

	return promise.then(
		val => new Promise(resolve => {
			resolve(onFinally());
		}).then(() => val),
		err => new Promise(resolve => {
			resolve(onFinally());
		}).then(() => {
			throw err;
		})
	);
};

var signals = createCommonjsModule(function (module) {
// This is not the set of all possible signals.
//
// It IS, however, the set of all signals that trigger
// an exit on either Linux or BSD systems.  Linux is a
// superset of the signal names supported on BSD, and
// the unknown signals just fail to register, so we can
// catch that easily enough.
//
// Don't bother with SIGKILL.  It's uncatchable, which
// means that we can't fire any callbacks anyway.
//
// If a user does happen to register a handler on a non-
// fatal signal like SIGWINCH or something, and then
// exit, it'll end up firing `process.emit('exit')`, so
// the handler will be fired anyway.
//
// SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
// artificially, inherently leave the process in a
// state from which it is not safe to try and enter JS
// listeners.
module.exports = [
  'SIGABRT',
  'SIGALRM',
  'SIGHUP',
  'SIGINT',
  'SIGTERM'
];

if (process.platform !== 'win32') {
  module.exports.push(
    'SIGVTALRM',
    'SIGXCPU',
    'SIGXFSZ',
    'SIGUSR2',
    'SIGTRAP',
    'SIGSYS',
    'SIGQUIT',
    'SIGIOT'
    // should detect profiler and enable/disable accordingly.
    // see #21
    // 'SIGPROF'
  );
}

if (process.platform === 'linux') {
  module.exports.push(
    'SIGIO',
    'SIGPOLL',
    'SIGPWR',
    'SIGSTKFLT',
    'SIGUNUSED'
  );
}
});

// Note: since nyc uses this module to output coverage, any lines
// that are in the direct sync flow of nyc's outputCoverage are
// ignored, since we can never get coverage for them.

var signals$1 = signals;

var EE = events;
/* istanbul ignore if */
if (typeof EE !== 'function') {
  EE = EE.EventEmitter;
}

var emitter;
if (process.__signal_exit_emitter__) {
  emitter = process.__signal_exit_emitter__;
} else {
  emitter = process.__signal_exit_emitter__ = new EE();
  emitter.count = 0;
  emitter.emitted = {};
}

// Because this emitter is a global, we have to check to see if a
// previous version of this library failed to enable infinite listeners.
// I know what you're about to say.  But literally everything about
// signal-exit is a compromise with evil.  Get used to it.
if (!emitter.infinite) {
  emitter.setMaxListeners(Infinity);
  emitter.infinite = true;
}

var signalExit = function (cb, opts) {
  assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler');

  if (loaded === false) {
    load();
  }

  var ev = 'exit';
  if (opts && opts.alwaysLast) {
    ev = 'afterexit';
  }

  var remove = function () {
    emitter.removeListener(ev, cb);
    if (emitter.listeners('exit').length === 0 &&
        emitter.listeners('afterexit').length === 0) {
      unload();
    }
  };
  emitter.on(ev, cb);

  return remove
};

var unload_1 = unload;
function unload () {
  if (!loaded) {
    return
  }
  loaded = false;

  signals$1.forEach(function (sig) {
    try {
      process.removeListener(sig, sigListeners[sig]);
    } catch (er) {}
  });
  process.emit = originalProcessEmit;
  process.reallyExit = originalProcessReallyExit;
  emitter.count -= 1;
}

function emit (event, code, signal) {
  if (emitter.emitted[event]) {
    return
  }
  emitter.emitted[event] = true;
  emitter.emit(event, code, signal);
}

// { <signal>: <listener fn>, ... }
var sigListeners = {};
signals$1.forEach(function (sig) {
  sigListeners[sig] = function listener () {
    // If there are no other listeners, an exit is coming!
    // Simplest way: remove us and then re-send the signal.
    // We know that this will kill the process, so we can
    // safely emit now.
    var listeners = process.listeners(sig);
    if (listeners.length === emitter.count) {
      unload();
      emit('exit', null, sig);
      /* istanbul ignore next */
      emit('afterexit', null, sig);
      /* istanbul ignore next */
      process.kill(process.pid, sig);
    }
  };
});

var signals_1 = function () {
  return signals$1
};

var load_1 = load;

var loaded = false;

function load () {
  if (loaded) {
    return
  }
  loaded = true;

  // This is the number of onSignalExit's that are in play.
  // It's important so that we can count the correct number of
  // listeners on signals, and don't wait for the other one to
  // handle it instead of us.
  emitter.count += 1;

  signals$1 = signals$1.filter(function (sig) {
    try {
      process.on(sig, sigListeners[sig]);
      return true
    } catch (er) {
      return false
    }
  });

  process.emit = processEmit;
  process.reallyExit = processReallyExit;
}

var originalProcessReallyExit = process.reallyExit;
function processReallyExit (code) {
  process.exitCode = code || 0;
  emit('exit', process.exitCode, null);
  /* istanbul ignore next */
  emit('afterexit', process.exitCode, null);
  /* istanbul ignore next */
  originalProcessReallyExit.call(process, process.exitCode);
}

var originalProcessEmit = process.emit;
function processEmit (ev, arg) {
  if (ev === 'exit') {
    if (arg !== undefined) {
      process.exitCode = arg;
    }
    var ret = originalProcessEmit.apply(this, arguments);
    emit('exit', process.exitCode, null);
    /* istanbul ignore next */
    emit('afterexit', process.exitCode, null);
    return ret
  } else {
    return originalProcessEmit.apply(this, arguments)
  }
}
signalExit.unload = unload_1;
signalExit.signals = signals_1;
signalExit.load = load_1;

var errname_1 = createCommonjsModule(function (module) {
// Older verions of Node.js might not have `util.getSystemErrorName()`.
// In that case, fall back to a deprecated internal.


let uv;

if (typeof util.getSystemErrorName === 'function') {
	module.exports = util.getSystemErrorName;
} else {
	try {
		uv = process.binding('uv');

		if (typeof uv.errname !== 'function') {
			throw new TypeError('uv.errname is not a function');
		}
	} catch (err) {
		console.error('execa/lib/errname: unable to establish process.binding(\'uv\')', err);
		uv = null;
	}

	module.exports = code => errname(uv, code);
}

// Used for testing the fallback behavior
module.exports.__test__ = errname;

function errname(uv, code) {
	if (uv) {
		return uv.errname(code);
	}

	if (!(code < 0)) {
		throw new Error('err >= 0');
	}

	return `Unknown system error ${code}`;
}
});
var errname_2 = errname_1.__test__;

const alias = ['stdin', 'stdout', 'stderr'];

const hasAlias = opts => alias.some(x => Boolean(opts[x]));

var stdio = opts => {
	if (!opts) {
		return null;
	}

	if (opts.stdio && hasAlias(opts)) {
		throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${alias.map(x => `\`${x}\``).join(', ')}`);
	}

	if (typeof opts.stdio === 'string') {
		return opts.stdio;
	}

	const stdio = opts.stdio || [];

	if (!Array.isArray(stdio)) {
		throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
	}

	const result = [];
	const len = Math.max(stdio.length, alias.length);

	for (let i = 0; i < len; i++) {
		let value = null;

		if (stdio[i] !== undefined) {
			value = stdio[i];
		} else if (opts[alias[i]] !== undefined) {
			value = opts[alias[i]];
		}

		result[i] = value;
	}

	return result;
};

var execa = createCommonjsModule(function (module) {












const TEN_MEGABYTES = 1000 * 1000 * 10;

function handleArgs(cmd, args, opts) {
	let parsed;

	opts = Object.assign({
		extendEnv: true,
		env: {}
	}, opts);

	if (opts.extendEnv) {
		opts.env = Object.assign({}, process.env, opts.env);
	}

	if (opts.__winShell === true) {
		delete opts.__winShell;
		parsed = {
			command: cmd,
			args,
			options: opts,
			file: cmd,
			original: {
				cmd,
				args
			}
		};
	} else {
		parsed = crossSpawn._parse(cmd, args, opts);
	}

	opts = Object.assign({
		maxBuffer: TEN_MEGABYTES,
		buffer: true,
		stripEof: true,
		preferLocal: true,
		localDir: parsed.options.cwd || process.cwd(),
		encoding: 'utf8',
		reject: true,
		cleanup: true
	}, parsed.options);

	opts.stdio = stdio(opts);

	if (opts.preferLocal) {
		opts.env = npmRunPath.env(Object.assign({}, opts, {cwd: opts.localDir}));
	}

	if (opts.detached) {
		// #115
		opts.cleanup = false;
	}

	if (process.platform === 'win32' && path.basename(parsed.command) === 'cmd.exe') {
		// #116
		parsed.args.unshift('/q');
	}

	return {
		cmd: parsed.command,
		args: parsed.args,
		opts,
		parsed
	};
}

function handleInput(spawned, input) {
	if (input === null || input === undefined) {
		return;
	}

	if (isStream_1(input)) {
		input.pipe(spawned.stdin);
	} else {
		spawned.stdin.end(input);
	}
}

function handleOutput(opts, val) {
	if (val && opts.stripEof) {
		val = stripEof(val);
	}

	return val;
}

function handleShell(fn, cmd, opts) {
	let file = '/bin/sh';
	let args = ['-c', cmd];

	opts = Object.assign({}, opts);

	if (process.platform === 'win32') {
		opts.__winShell = true;
		file = process.env.comspec || 'cmd.exe';
		args = ['/s', '/c', `"${cmd}"`];
		opts.windowsVerbatimArguments = true;
	}

	if (opts.shell) {
		file = opts.shell;
		delete opts.shell;
	}

	return fn(file, args, opts);
}

function getStream(process, stream, {encoding, buffer, maxBuffer}) {
	if (!process[stream]) {
		return null;
	}

	let ret;

	if (!buffer) {
		// TODO: Use `ret = util.promisify(stream.finished)(process[stream]);` when targeting Node.js 10
		ret = new Promise((resolve, reject) => {
			process[stream]
				.once('end', resolve)
				.once('error', reject);
		});
	} else if (encoding) {
		ret = getStream_1(process[stream], {
			encoding,
			maxBuffer
		});
	} else {
		ret = getStream_1.buffer(process[stream], {maxBuffer});
	}

	return ret.catch(err => {
		err.stream = stream;
		err.message = `${stream} ${err.message}`;
		throw err;
	});
}

function makeError(result, options) {
	const {stdout, stderr} = result;

	let err = result.error;
	const {code, signal} = result;

	const {parsed, joinedCmd} = options;
	const timedOut = options.timedOut || false;

	if (!err) {
		let output = '';

		if (Array.isArray(parsed.opts.stdio)) {
			if (parsed.opts.stdio[2] !== 'inherit') {
				output += output.length > 0 ? stderr : `\n${stderr}`;
			}

			if (parsed.opts.stdio[1] !== 'inherit') {
				output += `\n${stdout}`;
			}
		} else if (parsed.opts.stdio !== 'inherit') {
			output = `\n${stderr}${stdout}`;
		}

		err = new Error(`Command failed: ${joinedCmd}${output}`);
		err.code = code < 0 ? errname_1(code) : code;
	}

	err.stdout = stdout;
	err.stderr = stderr;
	err.failed = true;
	err.signal = signal || null;
	err.cmd = joinedCmd;
	err.timedOut = timedOut;

	return err;
}

function joinCmd(cmd, args) {
	let joinedCmd = cmd;

	if (Array.isArray(args) && args.length > 0) {
		joinedCmd += ' ' + args.join(' ');
	}

	return joinedCmd;
}

module.exports = (cmd, args, opts) => {
	const parsed = handleArgs(cmd, args, opts);
	const {encoding, buffer, maxBuffer} = parsed.opts;
	const joinedCmd = joinCmd(cmd, args);

	let spawned;
	try {
		spawned = child_process.spawn(parsed.cmd, parsed.args, parsed.opts);
	} catch (err) {
		return Promise.reject(err);
	}

	let removeExitHandler;
	if (parsed.opts.cleanup) {
		removeExitHandler = signalExit(() => {
			spawned.kill();
		});
	}

	let timeoutId = null;
	let timedOut = false;

	const cleanup = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}

		if (removeExitHandler) {
			removeExitHandler();
		}
	};

	if (parsed.opts.timeout > 0) {
		timeoutId = setTimeout(() => {
			timeoutId = null;
			timedOut = true;
			spawned.kill(parsed.opts.killSignal);
		}, parsed.opts.timeout);
	}

	const processDone = new Promise(resolve => {
		spawned.on('exit', (code, signal) => {
			cleanup();
			resolve({code, signal});
		});

		spawned.on('error', err => {
			cleanup();
			resolve({error: err});
		});

		if (spawned.stdin) {
			spawned.stdin.on('error', err => {
				cleanup();
				resolve({error: err});
			});
		}
	});

	function destroy() {
		if (spawned.stdout) {
			spawned.stdout.destroy();
		}

		if (spawned.stderr) {
			spawned.stderr.destroy();
		}
	}

	const handlePromise = () => pFinally(Promise.all([
		processDone,
		getStream(spawned, 'stdout', {encoding, buffer, maxBuffer}),
		getStream(spawned, 'stderr', {encoding, buffer, maxBuffer})
	]).then(arr => {
		const result = arr[0];
		result.stdout = arr[1];
		result.stderr = arr[2];

		if (result.error || result.code !== 0 || result.signal !== null) {
			const err = makeError(result, {
				joinedCmd,
				parsed,
				timedOut
			});

			// TODO: missing some timeout logic for killed
			// https://github.com/nodejs/node/blob/master/lib/child_process.js#L203
			// err.killed = spawned.killed || killed;
			err.killed = err.killed || spawned.killed;

			if (!parsed.opts.reject) {
				return err;
			}

			throw err;
		}

		return {
			stdout: handleOutput(parsed.opts, result.stdout),
			stderr: handleOutput(parsed.opts, result.stderr),
			code: 0,
			failed: false,
			killed: false,
			signal: null,
			cmd: joinedCmd,
			timedOut: false
		};
	}), destroy);

	crossSpawn._enoent.hookChildProcess(spawned, parsed.parsed);

	handleInput(spawned, parsed.opts.input);

	spawned.then = (onfulfilled, onrejected) => handlePromise().then(onfulfilled, onrejected);
	spawned.catch = onrejected => handlePromise().catch(onrejected);

	return spawned;
};

// TODO: set `stderr: 'ignore'` when that option is implemented
module.exports.stdout = (...args) => module.exports(...args).then(x => x.stdout);

// TODO: set `stdout: 'ignore'` when that option is implemented
module.exports.stderr = (...args) => module.exports(...args).then(x => x.stderr);

module.exports.shell = (cmd, opts) => handleShell(module.exports, cmd, opts);

module.exports.sync = (cmd, args, opts) => {
	const parsed = handleArgs(cmd, args, opts);
	const joinedCmd = joinCmd(cmd, args);

	if (isStream_1(parsed.opts.input)) {
		throw new TypeError('The `input` option cannot be a stream in sync mode');
	}

	const result = child_process.spawnSync(parsed.cmd, parsed.args, parsed.opts);
	result.code = result.status;

	if (result.error || result.status !== 0 || result.signal !== null) {
		const err = makeError(result, {
			joinedCmd,
			parsed
		});

		if (!parsed.opts.reject) {
			return err;
		}

		throw err;
	}

	return {
		stdout: handleOutput(parsed.opts, result.stdout),
		stderr: handleOutput(parsed.opts, result.stderr),
		code: 0,
		failed: false,
		signal: null,
		cmd: joinedCmd,
		timedOut: false
	};
};

module.exports.shellSync = (cmd, opts) => handleShell(module.exports.sync, cmd, opts);
});
var execa_1 = execa.stdout;
var execa_2 = execa.stderr;
var execa_3 = execa.shell;
var execa_4 = execa.sync;
var execa_5 = execa.shellSync;

// Reference: https://www.gaijin.at/en/lstwinver.php
const names = new Map([
	['10.0', '10'],
	['6.3', '8.1'],
	['6.2', '8'],
	['6.1', '7'],
	['6.0', 'Vista'],
	['5.2', 'Server 2003'],
	['5.1', 'XP'],
	['5.0', '2000'],
	['4.9', 'ME'],
	['4.1', '98'],
	['4.0', '95']
]);

const windowsRelease = release => {
	const version = /\d+\.\d/.exec(release || os.release());

	if (release && !version) {
		throw new Error('`release` argument doesn\'t match `n.n`');
	}

	const ver = (version || [])[0];

	// Server 2008, 2012 and 2016 versions are ambiguous with desktop versions and must be detected at runtime.
	// If `release` is omitted or we're on a Windows system, and the version number is an ambiguous version
	// then use `wmic` to get the OS caption: https://msdn.microsoft.com/en-us/library/aa394531(v=vs.85).aspx
	// If the resulting caption contains the year 2008, 2012 or 2016, it is a server version, so return a server OS name.
	if ((!release || release === os.release()) && ['6.1', '6.2', '6.3', '10.0'].includes(ver)) {
		const stdout = execa.sync('wmic', ['os', 'get', 'Caption']).stdout || '';
		const year = (stdout.match(/2008|2012|2016/) || [])[0];
		if (year) {
			return `Server ${year}`;
		}
	}

	return names.get(ver);
};

var windowsRelease_1 = windowsRelease;

const osName = (platform, release) => {
	if (!platform && release) {
		throw new Error('You can\'t specify a `release` without specifying `platform`');
	}

	platform = platform || os.platform();

	let id;

	if (platform === 'darwin') {
		if (!release && os.platform() === 'darwin') {
			release = os.release();
		}

		const prefix = release ? (Number(release.split('.')[0]) > 15 ? 'macOS' : 'OS X') : 'macOS';
		id = release ? macosRelease_1(release).name : '';
		return prefix + (id ? ' ' + id : '');
	}

	if (platform === 'linux') {
		if (!release && os.platform() === 'linux') {
			release = os.release();
		}

		id = release ? release.replace(/^(\d+\.\d+).*/, '$1') : '';
		return 'Linux' + (id ? ' ' + id : '');
	}

	if (platform === 'win32') {
		if (!release && os.platform() === 'win32') {
			release = os.release();
		}

		id = release ? windowsRelease_1(release) : '';
		return 'Windows' + (id ? ' ' + id : '');
	}

	return platform;
};

var osName_1 = osName;

var universalUserAgent = getUserAgentNode;



function getUserAgentNode () {
  try {
    return `Node.js/${process.version.substr(1)} (${osName_1()}; ${process.arch})`
  } catch (error) {
    if (/wmic os get Caption/.test(error.message)) {
      return 'Windows <version undetectable>'
    }

    throw error
  }
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function lowercaseKeys(object) {
  if (!object) {
    return {};
  }

  return Object.keys(object).reduce((newObj, key) => {
    newObj[key.toLowerCase()] = object[key];
    return newObj;
  }, {});
}

function merge(defaults, route, options) {
  if (typeof route === "string") {
    let _route$split = route.split(" "),
        _route$split2 = _slicedToArray(_route$split, 2),
        method = _route$split2[0],
        url = _route$split2[1];

    options = Object.assign(url ? {
      method,
      url
    } : {
      url: method
    }, options);
  } else {
    options = route || {};
  } // lowercase header names before merging with defaults to avoid duplicates


  options.headers = lowercaseKeys(options.headers);
  const mergedOptions = cjs.all([defaults, options].filter(Boolean), {
    isMergeableObject: isPlainObject
  }); // mediaType.previews arrays are merged, instead of overwritten

  if (defaults && defaults.mediaType.previews.length) {
    mergedOptions.mediaType.previews = defaults.mediaType.previews.filter(preview => !mergedOptions.mediaType.previews.includes(preview)).concat(mergedOptions.mediaType.previews);
  }

  mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map(preview => preview.replace(/-preview/, ""));
  return mergedOptions;
}

function addQueryParameters(url, parameters) {
  const separator = /\?/.test(url) ? "&" : "?";
  const names = Object.keys(parameters);

  if (names.length === 0) {
    return url;
  }

  return url + separator + names.map(name => {
    if (name === "q") {
      return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
    }

    return "".concat(name, "=").concat(encodeURIComponent(parameters[name]));
  }).join("&");
}

const urlVariableRegex = /\{[^}]+\}/g;

function removeNonChars(variableName) {
  return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
}

function extractUrlVariableNames(url) {
  const matches = url.match(urlVariableRegex);

  if (!matches) {
    return [];
  }

  return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
}

function omit(object, keysToOmit) {
  return Object.keys(object).filter(option => !keysToOmit.includes(option)).reduce((obj, key) => {
    obj[key] = object[key];
    return obj;
  }, {});
}

function parse$1(options) {
  // https://fetch.spec.whatwg.org/#methods
  let method = options.method.toUpperCase(); // replace :varname with {varname} to make it RFC 6570 compatible

  let url = options.url.replace(/:([a-z]\w+)/g, "{+$1}");
  let headers = Object.assign({}, options.headers);
  let body;
  let parameters = omit(options, ["method", "baseUrl", "url", "headers", "request", "mediaType"]); // extract variable names from URL to calculate remaining variables later

  const urlVariableNames = extractUrlVariableNames(url);
  url = urlTemplate.parse(url).expand(parameters);

  if (!/^http/.test(url)) {
    url = options.baseUrl + url;
  }

  const omittedParameters = Object.keys(options).filter(option => urlVariableNames.includes(option)).concat("baseUrl");
  const remainingParameters = omit(parameters, omittedParameters);
  const isBinaryRequset = /application\/octet-stream/i.test(headers.accept);

  if (!isBinaryRequset) {
    if (options.mediaType.format) {
      // e.g. application/vnd.github.v3+json => application/vnd.github.v3.raw
      headers.accept = headers.accept.split(/,/).map(preview => preview.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/, "application/vnd$1$2.".concat(options.mediaType.format))).join(",");
    }

    if (options.mediaType.previews.length) {
      const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
      headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map(preview => {
        const format = options.mediaType.format ? ".".concat(options.mediaType.format) : "+json";
        return "application/vnd.github.".concat(preview, "-preview").concat(format);
      }).join(",");
    }
  } // for GET/HEAD requests, set URL query parameters from remaining parameters
  // for PATCH/POST/PUT/DELETE requests, set request body from remaining parameters


  if (["GET", "HEAD"].includes(method)) {
    url = addQueryParameters(url, remainingParameters);
  } else {
    if ("data" in remainingParameters) {
      body = remainingParameters.data;
    } else {
      if (Object.keys(remainingParameters).length) {
        body = remainingParameters;
      } else {
        headers["content-length"] = 0;
      }
    }
  } // default content-type for JSON if body is set


  if (!headers["content-type"] && typeof body !== "undefined") {
    headers["content-type"] = "application/json; charset=utf-8";
  } // GitHub expects 'content-length: 0' header for PUT/PATCH requests without body.
  // fetch does not allow to set `content-length` header, but we can set body to an empty string


  if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
    body = "";
  } // Only return body/request keys if present


  return Object.assign({
    method,
    url,
    headers
  }, typeof body !== "undefined" ? {
    body
  } : null, options.request ? {
    request: options.request
  } : null);
}

function endpointWithDefaults(defaults, route, options) {
  return parse$1(merge(defaults, route, options));
}

function withDefaults(oldDefaults, newDefaults) {
  const DEFAULTS = merge(oldDefaults, newDefaults);
  const endpoint = endpointWithDefaults.bind(null, DEFAULTS);
  return Object.assign(endpoint, {
    DEFAULTS,
    defaults: withDefaults.bind(null, DEFAULTS),
    merge: merge.bind(null, DEFAULTS),
    parse: parse$1
  });
}

const VERSION = "0.0.0-development";

const userAgent = "octokit-endpoint.js/".concat(VERSION, " ").concat(universalUserAgent());
const DEFAULTS = {
  method: "GET",
  baseUrl: "https://api.github.com",
  headers: {
    accept: "application/vnd.github.v3+json",
    "user-agent": userAgent
  },
  mediaType: {
    format: "",
    previews: []
  }
};

const endpoint = withDefaults(null, DEFAULTS);

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = require('encoding').convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough$1 = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough$1();
		p2 = new PassThrough$1();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest$2(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest$2(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest$2(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest$2(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest$2(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

class Deprecation extends Error {
  constructor(message) {
    super(message); // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = 'Deprecation';
  }

}

var distWeb = /*#__PURE__*/Object.freeze({
	Deprecation: Deprecation
});

const logOnce = once_1(deprecation => console.warn(deprecation));
/**
 * Error with extra properties to help with debugging
 */

class RequestError extends Error {
  constructor(message, statusCode, options) {
    super(message); // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = "HttpError";
    this.status = statusCode;
    Object.defineProperty(this, "code", {
      get() {
        logOnce(new Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
        return statusCode;
      }

    });
    this.headers = options.headers; // redact request credentials without mutating original request options

    const requestCopy = Object.assign({}, options.request);

    if (options.request.headers.authorization) {
      requestCopy.headers = Object.assign({}, options.request.headers, {
        authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]")
      });
    }

    requestCopy.url = requestCopy.url // client_id & client_secret can be passed as URL query parameters to increase rate limit
    // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
    .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]") // OAuth tokens can be passed as URL query parameters, although it is not recommended
    // see https://developer.github.com/v3/#oauth2-token-sent-in-a-header
    .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
    this.request = requestCopy;
  }

}

var distWeb$1 = /*#__PURE__*/Object.freeze({
	RequestError: RequestError
});

const VERSION$1 = "0.0.0-development";

function getBufferResponse(response) {
    return response.arrayBuffer();
}

function fetchWrapper(requestOptions) {
    if (isPlainObject(requestOptions.body) ||
        Array.isArray(requestOptions.body)) {
        requestOptions.body = JSON.stringify(requestOptions.body);
    }
    let headers = {};
    let status;
    let url;
    const fetch$1 = (requestOptions.request && requestOptions.request.fetch) || fetch;
    return fetch$1(requestOptions.url, Object.assign({
        method: requestOptions.method,
        body: requestOptions.body,
        headers: requestOptions.headers,
        redirect: requestOptions.redirect
    }, requestOptions.request))
        .then(response => {
        url = response.url;
        status = response.status;
        for (const keyAndValue of response.headers) {
            headers[keyAndValue[0]] = keyAndValue[1];
        }
        if (status === 204 || status === 205) {
            return;
        }
        // GitHub API returns 200 for HEAD requsets
        if (requestOptions.method === "HEAD") {
            if (status < 400) {
                return;
            }
            throw new RequestError(response.statusText, status, {
                headers,
                request: requestOptions
            });
        }
        if (status === 304) {
            throw new RequestError("Not modified", status, {
                headers,
                request: requestOptions
            });
        }
        if (status >= 400) {
            return response
                .text()
                .then(message => {
                const error = new RequestError(message, status, {
                    headers,
                    request: requestOptions
                });
                try {
                    Object.assign(error, JSON.parse(error.message));
                }
                catch (e) {
                    // ignore, see octokit/rest.js#684
                }
                throw error;
            });
        }
        const contentType = response.headers.get("content-type");
        if (/application\/json/.test(contentType)) {
            return response.json();
        }
        if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
            return response.text();
        }
        return getBufferResponse(response);
    })
        .then(data => {
        return {
            status,
            url,
            headers,
            data
        };
    })
        .catch(error => {
        if (error instanceof RequestError) {
            throw error;
        }
        throw new RequestError(error.message, 500, {
            headers,
            request: requestOptions
        });
    });
}

function withDefaults$1(oldEndpoint, newDefaults) {
    const endpoint = oldEndpoint.defaults(newDefaults);
    const newApi = function (route, parameters) {
        const endpointOptions = endpoint.merge(route, parameters);
        if (!endpointOptions.request || !endpointOptions.request.hook) {
            return fetchWrapper(endpoint.parse(endpointOptions));
        }
        const request = (route, parameters) => {
            return fetchWrapper(endpoint.parse(endpoint.merge(route, parameters)));
        };
        Object.assign(request, {
            endpoint,
            defaults: withDefaults$1.bind(null, endpoint)
        });
        return endpointOptions.request.hook(request, endpointOptions);
    };
    return Object.assign(newApi, {
        endpoint,
        defaults: withDefaults$1.bind(null, endpoint)
    });
}

const request = withDefaults$1(endpoint, {
    headers: {
        "user-agent": `octokit-request.js/${VERSION$1} ${universalUserAgent()}`
    }
});

var distWeb$2 = /*#__PURE__*/Object.freeze({
	request: request
});

var universalUserAgent$1 = getUserAgentNode$1;



function getUserAgentNode$1 () {
  try {
    return `Node.js/${process.version.substr(1)} (${osName_1()}; ${process.arch})`
  } catch (error) {
    if (/wmic os get Caption/.test(error.message)) {
      return 'Windows <version undetectable>'
    }

    throw error
  }
}

var name = "@octokit/graphql";
var version = "2.1.3";
var publishConfig = {
	access: "public"
};
var description = "GitHub GraphQL API client for browsers and Node";
var main = "index.js";
var scripts = {
	prebuild: "mkdirp dist/",
	build: "npm-run-all build:*",
	"build:development": "webpack --mode development --entry . --output-library=octokitGraphql --output=./dist/octokit-graphql.js --profile --json > dist/bundle-stats.json",
	"build:production": "webpack --mode production --entry . --plugin=compression-webpack-plugin --output-library=octokitGraphql --output-path=./dist --output-filename=octokit-graphql.min.js --devtool source-map",
	"bundle-report": "webpack-bundle-analyzer dist/bundle-stats.json --mode=static --no-open --report dist/bundle-report.html",
	coverage: "nyc report --reporter=html && open coverage/index.html",
	"coverage:upload": "nyc report --reporter=text-lcov | coveralls",
	pretest: "standard",
	test: "nyc mocha test/*-test.js",
	"test:browser": "cypress run --browser chrome"
};
var repository = {
	type: "git",
	url: "https://github.com/octokit/graphql.js.git"
};
var keywords = [
	"octokit",
	"github",
	"api",
	"graphql"
];
var author = "Gregor Martynus (https://github.com/gr2m)";
var license = "MIT";
var bugs = {
	url: "https://github.com/octokit/graphql.js/issues"
};
var homepage = "https://github.com/octokit/graphql.js#readme";
var dependencies = {
	"@octokit/request": "^5.0.0",
	"universal-user-agent": "^2.0.3"
};
var devDependencies = {
	chai: "^4.2.0",
	"compression-webpack-plugin": "^2.0.0",
	coveralls: "^3.0.3",
	cypress: "^3.1.5",
	"fetch-mock": "^7.3.1",
	mkdirp: "^0.5.1",
	mocha: "^6.0.0",
	"npm-run-all": "^4.1.3",
	nyc: "^14.0.0",
	"semantic-release": "^15.13.3",
	"simple-mock": "^0.8.0",
	standard: "^12.0.1",
	webpack: "^4.29.6",
	"webpack-bundle-analyzer": "^3.1.0",
	"webpack-cli": "^3.2.3"
};
var bundlesize = [
	{
		path: "./dist/octokit-graphql.min.js.gz",
		maxSize: "5KB"
	}
];
var release = {
	publish: [
		"@semantic-release/npm",
		{
			path: "@semantic-release/github",
			assets: [
				"dist/*",
				"!dist/*.map.gz"
			]
		}
	]
};
var standard = {
	globals: [
		"describe",
		"before",
		"beforeEach",
		"afterEach",
		"after",
		"it",
		"expect"
	]
};
var files = [
	"lib"
];
var _package = {
	name: name,
	version: version,
	publishConfig: publishConfig,
	description: description,
	main: main,
	scripts: scripts,
	repository: repository,
	keywords: keywords,
	author: author,
	license: license,
	bugs: bugs,
	homepage: homepage,
	dependencies: dependencies,
	devDependencies: devDependencies,
	bundlesize: bundlesize,
	release: release,
	standard: standard,
	files: files
};

var _package$1 = /*#__PURE__*/Object.freeze({
	name: name,
	version: version,
	publishConfig: publishConfig,
	description: description,
	main: main,
	scripts: scripts,
	repository: repository,
	keywords: keywords,
	author: author,
	license: license,
	bugs: bugs,
	homepage: homepage,
	dependencies: dependencies,
	devDependencies: devDependencies,
	bundlesize: bundlesize,
	release: release,
	standard: standard,
	files: files,
	'default': _package
});

var error = class GraphqlError extends Error {
  constructor (request, response) {
    const message = response.data.errors[0].message;
    super(message);

    Object.assign(this, response.data);
    this.name = 'GraphqlError';
    this.request = request;

    // Maintains proper stack trace (only available on V8)
    /* istanbul ignore next */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};

var graphql_1 = graphql;



const NON_VARIABLE_OPTIONS = ['method', 'baseUrl', 'url', 'headers', 'request', 'query'];

function graphql (request, query, options) {
  if (typeof query === 'string') {
    options = Object.assign({ query }, options);
  } else {
    options = query;
  }

  const requestOptions = Object.keys(options).reduce((result, key) => {
    if (NON_VARIABLE_OPTIONS.includes(key)) {
      result[key] = options[key];
      return result
    }

    if (!result.variables) {
      result.variables = {};
    }

    result.variables[key] = options[key];
    return result
  }, {});

  return request(requestOptions)
    .then(response => {
      if (response.data.errors) {
        throw new error(requestOptions, response)
      }

      return response.data.data
    })
}

var withDefaults_1 = withDefaults$2;



function withDefaults$2 (request, newDefaults) {
  const newRequest = request.defaults(newDefaults);
  const newApi = function (query, options) {
    return graphql_1(newRequest, query, options)
  };

  newApi.defaults = withDefaults$2.bind(null, newRequest);
  return newApi
}

var require$$1 = getCjsExportFromNamespace(_package$1);

const { request: request$1 } = distWeb$2;


const version$1 = require$$1.version;
const userAgent$1 = `octokit-graphql.js/${version$1} ${universalUserAgent$1()}`;



var graphql$1 = withDefaults_1(request$1, {
  method: 'POST',
  url: '/graphql',
  headers: {
    'user-agent': userAgent$1
  }
});

var register_1 = register;

function register (state, name, method, options) {
  if (typeof method !== 'function') {
    throw new Error('method for before hook must be a function')
  }

  if (!options) {
    options = {};
  }

  if (Array.isArray(name)) {
    return name.reverse().reduce(function (callback, name) {
      return register.bind(null, state, name, callback, options)
    }, method)()
  }

  return Promise.resolve()
    .then(function () {
      if (!state.registry[name]) {
        return method(options)
      }

      return (state.registry[name]).reduce(function (method, registered) {
        return registered.hook.bind(null, method, options)
      }, method)()
    })
}

var add = addHook;

function addHook (state, kind, name, hook) {
  var orig = hook;
  if (!state.registry[name]) {
    state.registry[name] = [];
  }

  if (kind === 'before') {
    hook = function (method, options) {
      return Promise.resolve()
        .then(orig.bind(null, options))
        .then(method.bind(null, options))
    };
  }

  if (kind === 'after') {
    hook = function (method, options) {
      var result;
      return Promise.resolve()
        .then(method.bind(null, options))
        .then(function (result_) {
          result = result_;
          return orig(result, options)
        })
        .then(function () {
          return result
        })
    };
  }

  if (kind === 'error') {
    hook = function (method, options) {
      return Promise.resolve()
        .then(method.bind(null, options))
        .catch(function (error) {
          return orig(error, options)
        })
    };
  }

  state.registry[name].push({
    hook: hook,
    orig: orig
  });
}

var remove = removeHook;

function removeHook (state, name, method) {
  if (!state.registry[name]) {
    return
  }

  var index = state.registry[name]
    .map(function (registered) { return registered.orig })
    .indexOf(method);

  if (index === -1) {
    return
  }

  state.registry[name].splice(index, 1);
}

// bind with array of arguments: https://stackoverflow.com/a/21792913
var bind = Function.bind;
var bindable = bind.bind(bind);

function bindApi (hook, state, name) {
  var removeHookRef = bindable(remove, null).apply(null, name ? [state, name] : [state]);
  hook.api = { remove: removeHookRef };
  hook.remove = removeHookRef

  ;['before', 'error', 'after', 'wrap'].forEach(function (kind) {
    var args = name ? [state, kind, name] : [state, kind];
    hook[kind] = hook.api[kind] = bindable(add, null).apply(null, args);
  });
}

function HookSingular () {
  var singularHookName = 'h';
  var singularHookState = {
    registry: {}
  };
  var singularHook = register_1.bind(null, singularHookState, singularHookName);
  bindApi(singularHook, singularHookState, singularHookName);
  return singularHook
}

function HookCollection () {
  var state = {
    registry: {}
  };

  var hook = register_1.bind(null, state);
  bindApi(hook, state);

  return hook
}

var collectionHookDeprecationMessageDisplayed = false;
function Hook () {
  if (!collectionHookDeprecationMessageDisplayed) {
    console.warn('[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4');
    collectionHookDeprecationMessageDisplayed = true;
  }
  return HookCollection()
}

Hook.Singular = HookSingular.bind();
Hook.Collection = HookCollection.bind();

var beforeAfterHook = Hook;
// expose constructors as a named property for TypeScript
var Hook_1 = Hook;
var Singular = Hook.Singular;
var Collection = Hook.Collection;
beforeAfterHook.Hook = Hook_1;
beforeAfterHook.Singular = Singular;
beforeAfterHook.Collection = Collection;

var name$1 = "@octokit/rest";
var version$2 = "16.28.7";
var publishConfig$1 = {
	access: "public"
};
var description$1 = "GitHub REST API client for Node.js";
var keywords$1 = [
	"octokit",
	"github",
	"rest",
	"api-client"
];
var author$1 = "Gregor Martynus (https://github.com/gr2m)";
var contributors = [
	{
		name: "Mike de Boer",
		email: "info@mikedeboer.nl"
	},
	{
		name: "Fabian Jakobs",
		email: "fabian@c9.io"
	},
	{
		name: "Joe Gallo",
		email: "joe@brassafrax.com"
	},
	{
		name: "Gregor Martynus",
		url: "https://github.com/gr2m"
	}
];
var repository$1 = "https://github.com/octokit/rest.js";
var dependencies$1 = {
	"@octokit/request": "^5.0.0",
	"@octokit/request-error": "^1.0.2",
	"atob-lite": "^2.0.0",
	"before-after-hook": "^2.0.0",
	"btoa-lite": "^1.0.0",
	deprecation: "^2.0.0",
	"lodash.get": "^4.4.2",
	"lodash.set": "^4.3.2",
	"lodash.uniq": "^4.5.0",
	"octokit-pagination-methods": "^1.1.0",
	once: "^1.4.0",
	"universal-user-agent": "^3.0.0",
	"url-template": "^2.0.8"
};
var devDependencies$1 = {
	"@gimenete/type-writer": "^0.1.3",
	"@octokit/fixtures-server": "^5.0.1",
	"@octokit/routes": "20.9.2",
	"@types/node": "^12.0.0",
	bundlesize: "^0.18.0",
	chai: "^4.1.2",
	"compression-webpack-plugin": "^3.0.0",
	coveralls: "^3.0.0",
	glob: "^7.1.2",
	"http-proxy-agent": "^2.1.0",
	"lodash.camelcase": "^4.3.0",
	"lodash.merge": "^4.6.1",
	"lodash.upperfirst": "^4.3.1",
	mkdirp: "^0.5.1",
	mocha: "^6.0.0",
	mustache: "^3.0.0",
	nock: "^10.0.0",
	"npm-run-all": "^4.1.2",
	nyc: "^14.0.0",
	prettier: "^1.14.2",
	proxy: "^0.2.4",
	"semantic-release": "^15.0.0",
	sinon: "^7.2.4",
	"sinon-chai": "^3.0.0",
	"sort-keys": "^3.0.0",
	standard: "^13.0.1",
	"string-to-arraybuffer": "^1.0.0",
	"string-to-jsdoc-comment": "^1.0.0",
	typescript: "^3.3.1",
	webpack: "^4.0.0",
	"webpack-bundle-analyzer": "^3.0.0",
	"webpack-cli": "^3.0.0"
};
var types = "index.d.ts";
var scripts$1 = {
	coverage: "nyc report --reporter=html && open coverage/index.html",
	pretest: "standard",
	test: "nyc mocha test/mocha-node-setup.js \"test/*/**/*-test.js\"",
	"test:browser": "cypress run --browser chrome",
	"test:memory": "mocha test/memory-test",
	build: "npm-run-all build:*",
	"build:ts": "node scripts/generate-types",
	"prebuild:browser": "mkdirp dist/",
	"build:browser": "npm-run-all build:browser:*",
	"build:browser:development": "webpack --mode development --entry . --output-library=Octokit --output=./dist/octokit-rest.js --profile --json > dist/bundle-stats.json",
	"build:browser:production": "webpack --mode production --entry . --plugin=compression-webpack-plugin --output-library=Octokit --output-path=./dist --output-filename=octokit-rest.min.js --devtool source-map",
	"generate-bundle-report": "webpack-bundle-analyzer dist/bundle-stats.json --mode=static --no-open --report dist/bundle-report.html",
	"generate-routes": "node scripts/generate-routes",
	"prevalidate:ts": "npm run -s build:ts",
	"validate:ts": "tsc --target es6 --noImplicitAny index.d.ts",
	"postvalidate:ts": "tsc --noEmit --target es6 test/typescript-validate.ts",
	"start-fixtures-server": "octokit-fixtures-server"
};
var license$1 = "MIT";
var files$1 = [
	"index.js",
	"index.d.ts",
	"lib",
	"plugins"
];
var nyc = {
	ignore: [
		"test"
	]
};
var release$1 = {
	publish: [
		"@semantic-release/npm",
		{
			path: "@semantic-release/github",
			assets: [
				"dist/*",
				"!dist/*.map.gz"
			]
		}
	]
};
var standard$1 = {
	globals: [
		"describe",
		"before",
		"beforeEach",
		"afterEach",
		"after",
		"it",
		"expect",
		"cy"
	],
	ignore: [
		"/docs"
	]
};
var bundlesize$1 = [
	{
		path: "./dist/octokit-rest.min.js.gz",
		maxSize: "33 kB"
	}
];
var _package$2 = {
	name: name$1,
	version: version$2,
	publishConfig: publishConfig$1,
	description: description$1,
	keywords: keywords$1,
	author: author$1,
	contributors: contributors,
	repository: repository$1,
	dependencies: dependencies$1,
	devDependencies: devDependencies$1,
	types: types,
	scripts: scripts$1,
	license: license$1,
	files: files$1,
	nyc: nyc,
	release: release$1,
	standard: standard$1,
	bundlesize: bundlesize$1
};

var _package$3 = /*#__PURE__*/Object.freeze({
	name: name$1,
	version: version$2,
	publishConfig: publishConfig$1,
	description: description$1,
	keywords: keywords$1,
	author: author$1,
	contributors: contributors,
	repository: repository$1,
	dependencies: dependencies$1,
	devDependencies: devDependencies$1,
	types: types,
	scripts: scripts$1,
	license: license$1,
	files: files$1,
	nyc: nyc,
	release: release$1,
	standard: standard$1,
	bundlesize: bundlesize$1,
	'default': _package$2
});

var pkg = getCjsExportFromNamespace(_package$3);

var parseClientOptions = parseOptions;

const { Deprecation: Deprecation$1 } = distWeb;





const deprecateOptionsTimeout = once_1((log, deprecation) => log.warn(deprecation));
const deprecateOptionsAgent = once_1((log, deprecation) => log.warn(deprecation));
const deprecateOptionsHeaders = once_1((log, deprecation) => log.warn(deprecation));

function parseOptions (options, log, hook) {
  if (options.headers) {
    options.headers = Object.keys(options.headers).reduce((newObj, key) => {
      newObj[key.toLowerCase()] = options.headers[key];
      return newObj
    }, {});
  }

  const clientDefaults = {
    headers: options.headers || {},
    request: options.request || {},
    mediaType: {
      previews: [],
      format: ''
    }
  };

  if (options.baseUrl) {
    clientDefaults.baseUrl = options.baseUrl;
  }

  if (options.userAgent) {
    clientDefaults.headers['user-agent'] = options.userAgent;
  }

  if (options.previews) {
    clientDefaults.mediaType.previews = options.previews;
  }

  if (options.timeout) {
    deprecateOptionsTimeout(log, new Deprecation$1('[@octokit/rest] new Octokit({timeout}) is deprecated. Use {request: {timeout}} instead. See https://github.com/octokit/request.js#request'));
    clientDefaults.request.timeout = options.timeout;
  }

  if (options.agent) {
    deprecateOptionsAgent(log, new Deprecation$1('[@octokit/rest] new Octokit({agent}) is deprecated. Use {request: {agent}} instead. See https://github.com/octokit/request.js#request'));
    clientDefaults.request.agent = options.agent;
  }

  if (options.headers) {
    deprecateOptionsHeaders(log, new Deprecation$1('[@octokit/rest] new Octokit({headers}) is deprecated. Use {userAgent, previews} instead. See https://github.com/octokit/request.js#request'));
  }

  const userAgentOption = clientDefaults.headers['user-agent'];
  const defaultUserAgent = `octokit.js/${pkg.version} ${universalUserAgent()}`;

  clientDefaults.headers['user-agent'] = [userAgentOption, defaultUserAgent].filter(Boolean).join(' ');

  clientDefaults.request.hook = hook.bind(null, 'request');

  return clientDefaults
}

var constructor_1 = Octokit;

const { request: request$2 } = distWeb$2;




function Octokit (plugins, options) {
  options = options || {};
  const hook = new beforeAfterHook.Collection();
  const log = Object.assign({
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error
  }, options && options.log);
  const api = {
    hook,
    log,
    request: request$2.defaults(parseClientOptions(options, log, hook))
  };

  plugins.forEach(pluginFunction => pluginFunction(api, options));

  return api
}

var registerPlugin_1 = registerPlugin;



function registerPlugin (plugins, pluginFunction) {
  return factory_1(plugins.includes(pluginFunction) ? plugins : plugins.concat(pluginFunction))
}

var factory_1 = factory;




function factory (plugins) {
  const Api = constructor_1.bind(null, plugins || []);
  Api.plugin = registerPlugin_1.bind(null, plugins || []);
  return Api
}

var core$2 = factory_1();

var log = octokitDebug;

function octokitDebug (octokit) {
  octokit.hook.wrap('request', (request, options) => {
    octokit.log.debug(`request`, options);
    const start = Date.now();
    const requestOptions = octokit.request.endpoint.parse(options);
    const path = requestOptions.url.replace(options.baseUrl, '');

    return request(options)

      .then(response => {
        octokit.log.info(`${requestOptions.method} ${path} - ${response.status} in ${Date.now() - start}ms`);
        return response
      })

      .catch(error => {
        octokit.log.info(`${requestOptions.method} ${path} - ${error.status} in ${Date.now() - start}ms`);
        throw error
      })
  });
}

var authenticate_1 = authenticate;

const { Deprecation: Deprecation$2 } = distWeb;


const deprecateAuthenticate = once_1((log, deprecation) => log.warn(deprecation));

function authenticate (state, options) {
  deprecateAuthenticate(state.octokit.log, new Deprecation$2('[@octokit/rest] octokit.authenticate() is deprecated. Use "auth" constructor option instead.'));

  if (!options) {
    state.auth = false;
    return
  }

  switch (options.type) {
    case 'basic':
      if (!options.username || !options.password) {
        throw new Error('Basic authentication requires both a username and password to be set')
      }
      break

    case 'oauth':
      if (!options.token && !(options.key && options.secret)) {
        throw new Error('OAuth2 authentication requires a token or key & secret to be set')
      }
      break

    case 'token':
    case 'app':
      if (!options.token) {
        throw new Error('Token authentication requires a token to be set')
      }
      break

    default:
      throw new Error("Invalid authentication type, must be 'basic', 'oauth', 'token' or 'app'")
  }

  state.auth = options;
}

var btoaNode = function btoa(str) {
  return new Buffer(str).toString('base64')
};

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array ? array.length : 0;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return baseFindIndex(array, baseIsNaN, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * Checks if a cache value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var splice = arrayProto.splice;

/* Built-in method references that are verified to be native. */
var Map$1 = getNative(root, 'Map'),
    Set = getNative(root, 'Set'),
    nativeCreate = getNative(Object, 'create');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map$1 || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject$1(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop$2 : function(values) {
  return new Set(values);
};

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a duplicate-free version of an array, using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons, in which only the first occurrence of each
 * element is kept.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniq([2, 1, 2]);
 * // => [2, 1]
 */
function uniq(array) {
  return (array && array.length)
    ? baseUniq(array)
    : [];
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject$1(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$1(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop$2() {
  // No operation performed.
}

var lodash_uniq = uniq;

var beforeRequest = authenticationBeforeRequest;




function authenticationBeforeRequest (state, options) {
  if (!state.auth.type) {
    return
  }

  if (state.auth.type === 'basic') {
    const hash = btoaNode(`${state.auth.username}:${state.auth.password}`);
    options.headers['authorization'] = `Basic ${hash}`;
    return
  }

  if (state.auth.type === 'token') {
    options.headers['authorization'] = `token ${state.auth.token}`;
    return
  }

  if (state.auth.type === 'app') {
    options.headers['authorization'] = `Bearer ${state.auth.token}`;
    const acceptHeaders = options.headers['accept'].split(',')
      .concat('application/vnd.github.machine-man-preview+json');
    options.headers['accept'] = lodash_uniq(acceptHeaders).filter(Boolean).join(',');
    return
  }

  options.url += options.url.indexOf('?') === -1 ? '?' : '&';

  if (state.auth.token) {
    options.url += `access_token=${encodeURIComponent(state.auth.token)}`;
    return
  }

  const key = encodeURIComponent(state.auth.key);
  const secret = encodeURIComponent(state.auth.secret);
  options.url += `client_id=${key}&client_secret=${secret}`;
}

var requestError = authenticationRequestError;

const { RequestError: RequestError$1 } = distWeb$1;

function authenticationRequestError (state, error, options) {
  /* istanbul ignore next */
  if (!error.headers) throw error

  const otpRequired = /required/.test(error.headers['x-github-otp'] || '');
  // handle "2FA required" error only
  if (error.status !== 401 || !otpRequired) {
    throw error
  }

  if (error.status === 401 && otpRequired && error.request && error.request.headers['x-github-otp']) {
    throw new RequestError$1('Invalid one-time password for two-factor authentication', 401, {
      headers: error.headers,
      request: options
    })
  }

  if (typeof state.auth.on2fa !== 'function') {
    throw new RequestError$1('2FA required, but options.on2fa is not a function. See https://github.com/octokit/rest.js#authentication', 401, {
      headers: error.headers,
      request: options
    })
  }

  return Promise.resolve()
    .then(() => {
      return state.auth.on2fa()
    })
    .then((oneTimePassword) => {
      const newOptions = Object.assign(options, {
        headers: Object.assign({ 'x-github-otp': oneTimePassword }, options.headers)
      });
      return state.octokit.request(newOptions)
    })
}

var authenticationDeprecated = authenticationPlugin;

const { Deprecation: Deprecation$3 } = distWeb;


const deprecateAuthenticate$1 = once_1((log, deprecation) => log.warn(deprecation));





function authenticationPlugin (octokit, options) {
  if (options.auth) {
    octokit.authenticate = () => {
      deprecateAuthenticate$1(octokit.log, new Deprecation$3('[@octokit/rest] octokit.authenticate() is deprecated and has no effect when "auth" option is set on Octokit constructor'));
    };
    return
  }
  const state = {
    octokit,
    auth: false
  };
  octokit.authenticate = authenticate_1.bind(null, state);
  octokit.hook.before('request', beforeRequest.bind(null, state));
  octokit.hook.error('request', requestError.bind(null, state));
}

var atobNode = function atob(str) {
  return Buffer.from(str, 'base64').toString('binary')
};

var withAuthorizationPrefix_1 = withAuthorizationPrefix;



const REGEX_IS_BASIC_AUTH = /^[\w-]+:/;

function withAuthorizationPrefix (authorization) {
  if (/^(basic|bearer|token) /i.test(authorization)) {
    return authorization
  }

  try {
    if (REGEX_IS_BASIC_AUTH.test(atobNode(authorization))) {
      return `basic ${authorization}`
    }
  } catch (error) { }

  if (authorization.split(/\./).length === 3) {
    return `bearer ${authorization}`
  }

  return `token ${authorization}`
}

var beforeRequest$1 = authenticationBeforeRequest$1;





function authenticationBeforeRequest$1 (state, options) {
  if (typeof state.auth === 'string') {
    options.headers['authorization'] = withAuthorizationPrefix_1(state.auth);

    // https://developer.github.com/v3/previews/#integrations
    if (/^bearer /i.test(state.auth) && !/machine-man/.test(options.headers['accept'])) {
      const acceptHeaders = options.headers['accept'].split(',')
        .concat('application/vnd.github.machine-man-preview+json');
      options.headers['accept'] = acceptHeaders.filter(Boolean).join(',');
    }

    return
  }

  if (state.auth.username) {
    const hash = btoaNode(`${state.auth.username}:${state.auth.password}`);
    options.headers['authorization'] = `Basic ${hash}`;
    if (state.otp) {
      options.headers['x-github-otp'] = state.otp;
    }
    return
  }

  if (state.auth.clientId) {
    // There is a special case for OAuth applications, when `clientId` and `clientSecret` is passed as
    // Basic Authorization instead of query parameters. The only routes where that applies share the same
    // URL though: `/applications/:client_id/tokens/:access_token`.
    //
    //  1. [Check an authorization](https://developer.github.com/v3/oauth_authorizations/#check-an-authorization)
    //  2. [Reset an authorization](https://developer.github.com/v3/oauth_authorizations/#reset-an-authorization)
    //  3. [Revoke an authorization for an application](https://developer.github.com/v3/oauth_authorizations/#revoke-an-authorization-for-an-application)
    //
    // We identify by checking the URL. It must merge both "/applications/:client_id/tokens/:access_token"
    // as well as "/applications/123/tokens/token456"
    if (/\/applications\/:?[\w_]+\/tokens\/:?[\w_]+($|\?)/.test(options.url)) {
      const hash = btoaNode(`${state.auth.clientId}:${state.auth.clientSecret}`);
      options.headers['authorization'] = `Basic ${hash}`;
      return
    }

    options.url += options.url.indexOf('?') === -1 ? '?' : '&';
    options.url += `client_id=${state.auth.clientId}&client_secret=${state.auth.clientSecret}`;
    return
  }

  return Promise.resolve()

    .then(() => {
      return state.auth()
    })

    .then((authorization) => {
      options.headers['authorization'] = withAuthorizationPrefix_1(authorization);
    })
}

var requestError$1 = authenticationRequestError$1;

const { RequestError: RequestError$2 } = distWeb$1;

function authenticationRequestError$1 (state, error, options) {
  if (!error.headers) throw error

  const otpRequired = /required/.test(error.headers['x-github-otp'] || '');
  // handle "2FA required" error only
  if (error.status !== 401 || !otpRequired) {
    throw error
  }

  if (error.status === 401 && otpRequired && error.request && error.request.headers['x-github-otp']) {
    if (state.otp) {
      delete state.otp; // no longer valid, request again
    } else {
      throw new RequestError$2('Invalid one-time password for two-factor authentication', 401, {
        headers: error.headers,
        request: options
      })
    }
  }

  if (typeof state.auth.on2fa !== 'function') {
    throw new RequestError$2('2FA required, but options.on2fa is not a function. See https://github.com/octokit/rest.js#authentication', 401, {
      headers: error.headers,
      request: options
    })
  }

  return Promise.resolve()
    .then(() => {
      return state.auth.on2fa()
    })
    .then((oneTimePassword) => {
      const newOptions = Object.assign(options, {
        headers: Object.assign(options.headers, { 'x-github-otp': oneTimePassword })
      });
      return state.octokit.request(newOptions)
        .then(response => {
          // If OTP still valid, then persist it for following requests
          state.otp = oneTimePassword;
          return response
        })
    })
}

var validate = validateAuth;

function validateAuth (auth) {
  if (typeof auth === 'string') {
    return
  }

  if (typeof auth === 'function') {
    return
  }

  if (auth.username && auth.password) {
    return
  }

  if (auth.clientId && auth.clientSecret) {
    return
  }

  throw new Error(`Invalid "auth" option: ${JSON.stringify(auth)}`)
}

var authentication = authenticationPlugin$1;





function authenticationPlugin$1 (octokit, options) {
  if (!options.auth) {
    return
  }

  validate(options.auth);

  const state = {
    octokit,
    auth: options.auth
  };

  octokit.hook.before('request', beforeRequest$1.bind(null, state));
  octokit.hook.error('request', requestError$1.bind(null, state));
}

/**
 * Some “list” response that can be paginated have a different response structure
 *
 * They have a `total_count` key in the response (search also has `incomplete_results`,
 * /installation/repositories also has `repository_selection`), as well as a key with
 * the list of the items which name varies from endpoint to endpoint:
 *
 * - https://developer.github.com/v3/search/#example (key `items`)
 * - https://developer.github.com/v3/checks/runs/#response-3 (key: `check_runs`)
 * - https://developer.github.com/v3/checks/suites/#response-1 (key: `check_suites`)
 * - https://developer.github.com/v3/apps/installations/#list-repositories (key: `repositories`)
 * - https://developer.github.com/v3/apps/installations/#list-installations-for-a-user (key `installations`)
 *
 * Octokit normalizes these responses so that paginated results are always returned following
 * the same structure. One challenge is that if the list response has only one page, no Link
 * header is provided, so this header alone is not sufficient to check wether a response is
 * paginated or not. For the exceptions with the namespace, a fallback check for the route
 * paths has to be added in order to normalize the response. We cannot check for the total_count
 * property because it also exists in the response of Get the combined status for a specific ref.
 */

var normalizePaginatedListResponse_1 = normalizePaginatedListResponse;

const { Deprecation: Deprecation$4 } = distWeb;


const deprecateIncompleteResults = once_1((log, deprecation) => log.warn(deprecation));
const deprecateTotalCount = once_1((log, deprecation) => log.warn(deprecation));
const deprecateNamespace = once_1((log, deprecation) => log.warn(deprecation));

const REGEX_IS_SEARCH_PATH = /^\/search\//;
const REGEX_IS_CHECKS_PATH = /^\/repos\/[^/]+\/[^/]+\/commits\/[^/]+\/(check-runs|check-suites)/;
const REGEX_IS_INSTALLATION_REPOSITORIES_PATH = /^\/installation\/repositories/;
const REGEX_IS_USER_INSTALLATIONS_PATH = /^\/user\/installations/;

function normalizePaginatedListResponse (octokit, url, response) {
  const path = url.replace(octokit.request.endpoint.DEFAULTS.baseUrl, '');
  if (
    !REGEX_IS_SEARCH_PATH.test(path) &&
    !REGEX_IS_CHECKS_PATH.test(path) &&
    !REGEX_IS_INSTALLATION_REPOSITORIES_PATH.test(path) &&
    !REGEX_IS_USER_INSTALLATIONS_PATH.test(path)
  ) {
    return
  }

  // keep the additional properties intact to avoid a breaking change,
  // but log a deprecation warning when accessed
  const incompleteResults = response.data.incomplete_results;
  const repositorySelection = response.data.repository_selection;
  const totalCount = response.data.total_count;
  delete response.data.incomplete_results;
  delete response.data.repository_selection;
  delete response.data.total_count;

  const namespaceKey = Object.keys(response.data)[0];

  response.data = response.data[namespaceKey];

  Object.defineProperty(response.data, namespaceKey, {
    get () {
      deprecateNamespace(octokit.log, new Deprecation$4(`[@octokit/rest] "result.data.${namespaceKey}" is deprecated. Use "result.data" instead`));
      return response.data
    }
  });

  if (typeof incompleteResults !== 'undefined') {
    Object.defineProperty(response.data, 'incomplete_results', {
      get () {
        deprecateIncompleteResults(octokit.log, new Deprecation$4('[@octokit/rest] "result.data.incomplete_results" is deprecated.'));
        return incompleteResults
      }
    });
  }

  if (typeof repositorySelection !== 'undefined') {
    Object.defineProperty(response.data, 'repository_selection', {
      get () {
        deprecateTotalCount(octokit.log, new Deprecation$4('[@octokit/rest] "result.data.repository_selection" is deprecated.'));
        return repositorySelection
      }
    });
  }

  Object.defineProperty(response.data, 'total_count', {
    get () {
      deprecateTotalCount(octokit.log, new Deprecation$4('[@octokit/rest] "result.data.total_count" is deprecated.'));
      return totalCount
    }
  });
}

var iterator_1 = iterator;



function iterator (octokit, options) {
  const headers = options.headers;
  let url = octokit.request.endpoint(options).url;

  return {
    [Symbol.asyncIterator]: () => ({
      next () {
        if (!url) {
          return Promise.resolve({ done: true })
        }

        return octokit.request({ url, headers })

          .then((response) => {
            normalizePaginatedListResponse_1(octokit, url, response);

            // `response.headers.link` format:
            // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
            // sets `url` to undefined if "next" URL is not present or `link` header is not set
            url = ((response.headers.link || '').match(/<([^>]+)>;\s*rel="next"/) || [])[1];

            return { value: response }
          })
      }
    })
  }
}

var paginate_1 = paginate;



function paginate (octokit, route, options, mapFn) {
  if (typeof options === 'function') {
    mapFn = options;
    options = undefined;
  }
  options = octokit.request.endpoint.merge(route, options);
  return gather(octokit, [], iterator_1(octokit, options)[Symbol.asyncIterator](), mapFn)
}

function gather (octokit, results, iterator, mapFn) {
  return iterator.next()
    .then(result => {
      if (result.done) {
        return results
      }

      let earlyExit = false;
      function done () {
        earlyExit = true;
      }

      results = results.concat(mapFn ? mapFn(result.value, done) : result.value.data);

      if (earlyExit) {
        return results
      }

      return gather(octokit, results, iterator, mapFn)
    })
}

var pagination = paginatePlugin;




function paginatePlugin (octokit) {
  octokit.paginate = paginate_1.bind(null, octokit);
  octokit.paginate.iterator = iterator_1.bind(null, octokit);
}

var normalizeGitReferenceResponses = octokitRestNormalizeGitReferenceResponses;

const { RequestError: RequestError$3 } = distWeb$1;

function octokitRestNormalizeGitReferenceResponses (octokit) {
  octokit.hook.wrap('request', (request, options) => {
    const isGetOrListRefRequest = /\/repos\/:?\w+\/:?\w+\/git\/refs\/:?\w+/.test(options.url);

    if (!isGetOrListRefRequest) {
      return request(options)
    }

    const isGetRefRequest = 'ref' in options;

    return request(options)
      .then(response => {
        // request single reference
        if (isGetRefRequest) {
          if (Array.isArray(response.data)) {
            throw new RequestError$3(`More than one reference found for "${options.ref}"`, 404, {
              request: options
            })
          }

          // ✅ received single reference
          return response
        }

        // request list of references
        if (!Array.isArray(response.data)) {
          response.data = [response.data];
        }

        return response
      })

      .catch(error => {
        if (isGetRefRequest) {
          throw error
        }

        if (error.status === 404) {
          return {
            status: 200,
            headers: error.headers,
            data: []
          }
        }

        throw error
      })
  });
}

var registerEndpoints_1 = registerEndpoints;

const { Deprecation: Deprecation$5 } = distWeb;

function registerEndpoints (octokit, routes) {
  Object.keys(routes).forEach(namespaceName => {
    if (!octokit[namespaceName]) {
      octokit[namespaceName] = {};
    }

    Object.keys(routes[namespaceName]).forEach(apiName => {
      const apiOptions = routes[namespaceName][apiName];

      const endpointDefaults = ['method', 'url', 'headers'].reduce((map, key) => {
        if (typeof apiOptions[key] !== 'undefined') {
          map[key] = apiOptions[key];
        }

        return map
      }, {});

      endpointDefaults.request = {
        validate: apiOptions.params
      };

      let request = octokit.request.defaults(endpointDefaults);

      // patch request & endpoint methods to support deprecated parameters.
      // Not the most elegant solution, but we don’t want to move deprecation
      // logic into octokit/endpoint.js as it’s out of scope
      const hasDeprecatedParam = Object.keys(apiOptions.params || {}).find(key => apiOptions.params[key].deprecated);
      if (hasDeprecatedParam) {
        const patch = patchForDeprecation.bind(null, octokit, apiOptions);
        request = patch(
          octokit.request.defaults(endpointDefaults),
          `.${namespaceName}.${apiName}()`
        );
        request.endpoint = patch(
          request.endpoint,
          `.${namespaceName}.${apiName}.endpoint()`
        );
        request.endpoint.merge = patch(
          request.endpoint.merge,
          `.${namespaceName}.${apiName}.endpoint.merge()`
        );
      }

      if (apiOptions.deprecated) {
        octokit[namespaceName][apiName] = function deprecatedEndpointMethod () {
          octokit.log.warn(new Deprecation$5(`[@octokit/rest] ${apiOptions.deprecated}`));
          octokit[namespaceName][apiName] = request;
          return request.apply(null, arguments)
        };

        return
      }

      octokit[namespaceName][apiName] = request;
    });
  });
}

function patchForDeprecation (octokit, apiOptions, method, methodName) {
  const patchedMethod = (options) => {
    options = Object.assign({}, options);

    Object.keys(options).forEach(key => {
      if (apiOptions.params[key] && apiOptions.params[key].deprecated) {
        const aliasKey = apiOptions.params[key].alias;

        octokit.log.warn(new Deprecation$5(`[@octokit/rest] "${key}" parameter is deprecated for "${methodName}". Use "${aliasKey}" instead`));

        if (!(aliasKey in options)) {
          options[aliasKey] = options[key];
        }
        delete options[key];
      }
    });

    return method(options)
  };
  Object.keys(method).forEach(key => {
    patchedMethod[key] = method[key];
  });

  return patchedMethod
}

var registerEndpoints_1$1 = octokitRegisterEndpoints;



function octokitRegisterEndpoints (octokit) {
  octokit.registerEndpoints = registerEndpoints_1.bind(null, octokit);
}

var activity = {
	checkStarringRepo: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/user/starred/:owner/:repo"
	},
	deleteRepoSubscription: {
		method: "DELETE",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/subscription"
	},
	deleteThreadSubscription: {
		method: "DELETE",
		params: {
			thread_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/notifications/threads/:thread_id/subscription"
	},
	getRepoSubscription: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/subscription"
	},
	getThread: {
		method: "GET",
		params: {
			thread_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/notifications/threads/:thread_id"
	},
	getThreadSubscription: {
		method: "GET",
		params: {
			thread_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/notifications/threads/:thread_id/subscription"
	},
	listEventsForOrg: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/events/orgs/:org"
	},
	listEventsForUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/events"
	},
	listFeeds: {
		method: "GET",
		params: {
		},
		url: "/feeds"
	},
	listNotifications: {
		method: "GET",
		params: {
			all: {
				type: "boolean"
			},
			before: {
				type: "string"
			},
			page: {
				type: "integer"
			},
			participating: {
				type: "boolean"
			},
			per_page: {
				type: "integer"
			},
			since: {
				type: "string"
			}
		},
		url: "/notifications"
	},
	listNotificationsForRepo: {
		method: "GET",
		params: {
			all: {
				type: "boolean"
			},
			before: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			participating: {
				type: "boolean"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			since: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/notifications"
	},
	listPublicEvents: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/events"
	},
	listPublicEventsForOrg: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/orgs/:org/events"
	},
	listPublicEventsForRepoNetwork: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/networks/:owner/:repo/events"
	},
	listPublicEventsForUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/events/public"
	},
	listReceivedEventsForUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/received_events"
	},
	listReceivedPublicEventsForUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/received_events/public"
	},
	listRepoEvents: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/events"
	},
	listReposStarredByAuthenticatedUser: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			sort: {
				"enum": [
					"created",
					"updated"
				],
				type: "string"
			}
		},
		url: "/user/starred"
	},
	listReposStarredByUser: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			sort: {
				"enum": [
					"created",
					"updated"
				],
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/starred"
	},
	listReposWatchedByUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/subscriptions"
	},
	listStargazersForRepo: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/stargazers"
	},
	listWatchedReposForAuthenticatedUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/subscriptions"
	},
	listWatchersForRepo: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/subscribers"
	},
	markAsRead: {
		method: "PUT",
		params: {
			last_read_at: {
				type: "string"
			}
		},
		url: "/notifications"
	},
	markNotificationsAsReadForRepo: {
		method: "PUT",
		params: {
			last_read_at: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/notifications"
	},
	markThreadAsRead: {
		method: "PATCH",
		params: {
			thread_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/notifications/threads/:thread_id"
	},
	setRepoSubscription: {
		method: "PUT",
		params: {
			ignored: {
				type: "boolean"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			subscribed: {
				type: "boolean"
			}
		},
		url: "/repos/:owner/:repo/subscription"
	},
	setThreadSubscription: {
		method: "PUT",
		params: {
			ignored: {
				type: "boolean"
			},
			thread_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/notifications/threads/:thread_id/subscription"
	},
	starRepo: {
		method: "PUT",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/user/starred/:owner/:repo"
	},
	unstarRepo: {
		method: "DELETE",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/user/starred/:owner/:repo"
	}
};
var apps = {
	addRepoToInstallation: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "PUT",
		params: {
			installation_id: {
				required: true,
				type: "integer"
			},
			repository_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/user/installations/:installation_id/repositories/:repository_id"
	},
	checkAccountIsAssociatedWithAny: {
		method: "GET",
		params: {
			account_id: {
				required: true,
				type: "integer"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/marketplace_listing/accounts/:account_id"
	},
	checkAccountIsAssociatedWithAnyStubbed: {
		method: "GET",
		params: {
			account_id: {
				required: true,
				type: "integer"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/marketplace_listing/stubbed/accounts/:account_id"
	},
	createContentAttachment: {
		headers: {
			accept: "application/vnd.github.corsair-preview+json"
		},
		method: "POST",
		params: {
			body: {
				required: true,
				type: "string"
			},
			content_reference_id: {
				required: true,
				type: "integer"
			},
			title: {
				required: true,
				type: "string"
			}
		},
		url: "/content_references/:content_reference_id/attachments"
	},
	createFromManifest: {
		headers: {
			accept: "application/vnd.github.fury-preview+json"
		},
		method: "POST",
		params: {
			code: {
				required: true,
				type: "string"
			}
		},
		url: "/app-manifests/:code/conversions"
	},
	createInstallationToken: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "POST",
		params: {
			installation_id: {
				required: true,
				type: "integer"
			},
			permissions: {
				type: "object"
			},
			repository_ids: {
				type: "integer[]"
			}
		},
		url: "/app/installations/:installation_id/access_tokens"
	},
	deleteInstallation: {
		headers: {
			accept: "application/vnd.github.gambit-preview+json,application/vnd.github.machine-man-preview+json"
		},
		method: "DELETE",
		params: {
			installation_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/app/installations/:installation_id"
	},
	findOrgInstallation: {
		deprecated: "octokit.apps.findOrgInstallation() has been renamed to octokit.apps.getOrgInstallation() (2019-04-10)",
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/installation"
	},
	findRepoInstallation: {
		deprecated: "octokit.apps.findRepoInstallation() has been renamed to octokit.apps.getRepoInstallation() (2019-04-10)",
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/installation"
	},
	findUserInstallation: {
		deprecated: "octokit.apps.findUserInstallation() has been renamed to octokit.apps.getUserInstallation() (2019-04-10)",
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/installation"
	},
	getAuthenticated: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
		},
		url: "/app"
	},
	getBySlug: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
			app_slug: {
				required: true,
				type: "string"
			}
		},
		url: "/apps/:app_slug"
	},
	getInstallation: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
			installation_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/app/installations/:installation_id"
	},
	getOrgInstallation: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/installation"
	},
	getRepoInstallation: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/installation"
	},
	getUserInstallation: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/installation"
	},
	listAccountsUserOrOrgOnPlan: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			plan_id: {
				required: true,
				type: "integer"
			},
			sort: {
				"enum": [
					"created",
					"updated"
				],
				type: "string"
			}
		},
		url: "/marketplace_listing/plans/:plan_id/accounts"
	},
	listAccountsUserOrOrgOnPlanStubbed: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			plan_id: {
				required: true,
				type: "integer"
			},
			sort: {
				"enum": [
					"created",
					"updated"
				],
				type: "string"
			}
		},
		url: "/marketplace_listing/stubbed/plans/:plan_id/accounts"
	},
	listInstallationReposForAuthenticatedUser: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
			installation_id: {
				required: true,
				type: "integer"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/installations/:installation_id/repositories"
	},
	listInstallations: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/app/installations"
	},
	listInstallationsForAuthenticatedUser: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/installations"
	},
	listMarketplacePurchasesForAuthenticatedUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/marketplace_purchases"
	},
	listMarketplacePurchasesForAuthenticatedUserStubbed: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/marketplace_purchases/stubbed"
	},
	listPlans: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/marketplace_listing/plans"
	},
	listPlansStubbed: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/marketplace_listing/stubbed/plans"
	},
	listRepos: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/installation/repositories"
	},
	removeRepoFromInstallation: {
		headers: {
			accept: "application/vnd.github.machine-man-preview+json"
		},
		method: "DELETE",
		params: {
			installation_id: {
				required: true,
				type: "integer"
			},
			repository_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/user/installations/:installation_id/repositories/:repository_id"
	}
};
var checks = {
	create: {
		headers: {
			accept: "application/vnd.github.antiope-preview+json"
		},
		method: "POST",
		params: {
			actions: {
				type: "object[]"
			},
			"actions[].description": {
				required: true,
				type: "string"
			},
			"actions[].identifier": {
				required: true,
				type: "string"
			},
			"actions[].label": {
				required: true,
				type: "string"
			},
			completed_at: {
				type: "string"
			},
			conclusion: {
				"enum": [
					"success",
					"failure",
					"neutral",
					"cancelled",
					"timed_out",
					"action_required"
				],
				type: "string"
			},
			details_url: {
				type: "string"
			},
			external_id: {
				type: "string"
			},
			head_sha: {
				required: true,
				type: "string"
			},
			name: {
				required: true,
				type: "string"
			},
			output: {
				type: "object"
			},
			"output.annotations": {
				type: "object[]"
			},
			"output.annotations[].annotation_level": {
				"enum": [
					"notice",
					"warning",
					"failure"
				],
				required: true,
				type: "string"
			},
			"output.annotations[].end_column": {
				type: "integer"
			},
			"output.annotations[].end_line": {
				required: true,
				type: "integer"
			},
			"output.annotations[].message": {
				required: true,
				type: "string"
			},
			"output.annotations[].path": {
				required: true,
				type: "string"
			},
			"output.annotations[].raw_details": {
				type: "string"
			},
			"output.annotations[].start_column": {
				type: "integer"
			},
			"output.annotations[].start_line": {
				required: true,
				type: "integer"
			},
			"output.annotations[].title": {
				type: "string"
			},
			"output.images": {
				type: "object[]"
			},
			"output.images[].alt": {
				required: true,
				type: "string"
			},
			"output.images[].caption": {
				type: "string"
			},
			"output.images[].image_url": {
				required: true,
				type: "string"
			},
			"output.summary": {
				required: true,
				type: "string"
			},
			"output.text": {
				type: "string"
			},
			"output.title": {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			started_at: {
				type: "string"
			},
			status: {
				"enum": [
					"queued",
					"in_progress",
					"completed"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/check-runs"
	},
	createSuite: {
		headers: {
			accept: "application/vnd.github.antiope-preview+json"
		},
		method: "POST",
		params: {
			head_sha: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/check-suites"
	},
	get: {
		headers: {
			accept: "application/vnd.github.antiope-preview+json"
		},
		method: "GET",
		params: {
			check_run_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/check-runs/:check_run_id"
	},
	getSuite: {
		headers: {
			accept: "application/vnd.github.antiope-preview+json"
		},
		method: "GET",
		params: {
			check_suite_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/check-suites/:check_suite_id"
	},
	listAnnotations: {
		headers: {
			accept: "application/vnd.github.antiope-preview+json"
		},
		method: "GET",
		params: {
			check_run_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/check-runs/:check_run_id/annotations"
	},
	listForRef: {
		headers: {
			accept: "application/vnd.github.antiope-preview+json"
		},
		method: "GET",
		params: {
			check_name: {
				type: "string"
			},
			filter: {
				"enum": [
					"latest",
					"all"
				],
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			ref: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			status: {
				"enum": [
					"queued",
					"in_progress",
					"completed"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/commits/:ref/check-runs"
	},
	listForSuite: {
		headers: {
			accept: "application/vnd.github.antiope-preview+json"
		},
		method: "GET",
		params: {
			check_name: {
				type: "string"
			},
			check_suite_id: {
				required: true,
				type: "integer"
			},
			filter: {
				"enum": [
					"latest",
					"all"
				],
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			status: {
				"enum": [
					"queued",
					"in_progress",
					"completed"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/check-suites/:check_suite_id/check-runs"
	},
	listSuitesForRef: {
		headers: {
			accept: "application/vnd.github.antiope-preview+json"
		},
		method: "GET",
		params: {
			app_id: {
				type: "integer"
			},
			check_name: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			ref: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/commits/:ref/check-suites"
	},
	rerequestSuite: {
		headers: {
			accept: "application/vnd.github.antiope-preview+json"
		},
		method: "POST",
		params: {
			check_suite_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/check-suites/:check_suite_id/rerequest"
	},
	setSuitesPreferences: {
		headers: {
			accept: "application/vnd.github.antiope-preview+json"
		},
		method: "PATCH",
		params: {
			auto_trigger_checks: {
				type: "object[]"
			},
			"auto_trigger_checks[].app_id": {
				required: true,
				type: "integer"
			},
			"auto_trigger_checks[].setting": {
				required: true,
				type: "boolean"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/check-suites/preferences"
	},
	update: {
		headers: {
			accept: "application/vnd.github.antiope-preview+json"
		},
		method: "PATCH",
		params: {
			actions: {
				type: "object[]"
			},
			"actions[].description": {
				required: true,
				type: "string"
			},
			"actions[].identifier": {
				required: true,
				type: "string"
			},
			"actions[].label": {
				required: true,
				type: "string"
			},
			check_run_id: {
				required: true,
				type: "integer"
			},
			completed_at: {
				type: "string"
			},
			conclusion: {
				"enum": [
					"success",
					"failure",
					"neutral",
					"cancelled",
					"timed_out",
					"action_required"
				],
				type: "string"
			},
			details_url: {
				type: "string"
			},
			external_id: {
				type: "string"
			},
			name: {
				type: "string"
			},
			output: {
				type: "object"
			},
			"output.annotations": {
				type: "object[]"
			},
			"output.annotations[].annotation_level": {
				"enum": [
					"notice",
					"warning",
					"failure"
				],
				required: true,
				type: "string"
			},
			"output.annotations[].end_column": {
				type: "integer"
			},
			"output.annotations[].end_line": {
				required: true,
				type: "integer"
			},
			"output.annotations[].message": {
				required: true,
				type: "string"
			},
			"output.annotations[].path": {
				required: true,
				type: "string"
			},
			"output.annotations[].raw_details": {
				type: "string"
			},
			"output.annotations[].start_column": {
				type: "integer"
			},
			"output.annotations[].start_line": {
				required: true,
				type: "integer"
			},
			"output.annotations[].title": {
				type: "string"
			},
			"output.images": {
				type: "object[]"
			},
			"output.images[].alt": {
				required: true,
				type: "string"
			},
			"output.images[].caption": {
				type: "string"
			},
			"output.images[].image_url": {
				required: true,
				type: "string"
			},
			"output.summary": {
				required: true,
				type: "string"
			},
			"output.text": {
				type: "string"
			},
			"output.title": {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			started_at: {
				type: "string"
			},
			status: {
				"enum": [
					"queued",
					"in_progress",
					"completed"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/check-runs/:check_run_id"
	}
};
var codesOfConduct = {
	getConductCode: {
		headers: {
			accept: "application/vnd.github.scarlet-witch-preview+json"
		},
		method: "GET",
		params: {
			key: {
				required: true,
				type: "string"
			}
		},
		url: "/codes_of_conduct/:key"
	},
	getForRepo: {
		headers: {
			accept: "application/vnd.github.scarlet-witch-preview+json"
		},
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/community/code_of_conduct"
	},
	listConductCodes: {
		headers: {
			accept: "application/vnd.github.scarlet-witch-preview+json"
		},
		method: "GET",
		params: {
		},
		url: "/codes_of_conduct"
	}
};
var emojis = {
	get: {
		method: "GET",
		params: {
		},
		url: "/emojis"
	}
};
var gists = {
	checkIsStarred: {
		method: "GET",
		params: {
			gist_id: {
				required: true,
				type: "string"
			}
		},
		url: "/gists/:gist_id/star"
	},
	create: {
		method: "POST",
		params: {
			description: {
				type: "string"
			},
			files: {
				required: true,
				type: "object"
			},
			"files.content": {
				type: "string"
			},
			"public": {
				type: "boolean"
			}
		},
		url: "/gists"
	},
	createComment: {
		method: "POST",
		params: {
			body: {
				required: true,
				type: "string"
			},
			gist_id: {
				required: true,
				type: "string"
			}
		},
		url: "/gists/:gist_id/comments"
	},
	"delete": {
		method: "DELETE",
		params: {
			gist_id: {
				required: true,
				type: "string"
			}
		},
		url: "/gists/:gist_id"
	},
	deleteComment: {
		method: "DELETE",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			gist_id: {
				required: true,
				type: "string"
			}
		},
		url: "/gists/:gist_id/comments/:comment_id"
	},
	fork: {
		method: "POST",
		params: {
			gist_id: {
				required: true,
				type: "string"
			}
		},
		url: "/gists/:gist_id/forks"
	},
	get: {
		method: "GET",
		params: {
			gist_id: {
				required: true,
				type: "string"
			}
		},
		url: "/gists/:gist_id"
	},
	getComment: {
		method: "GET",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			gist_id: {
				required: true,
				type: "string"
			}
		},
		url: "/gists/:gist_id/comments/:comment_id"
	},
	getRevision: {
		method: "GET",
		params: {
			gist_id: {
				required: true,
				type: "string"
			},
			sha: {
				required: true,
				type: "string"
			}
		},
		url: "/gists/:gist_id/:sha"
	},
	list: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			since: {
				type: "string"
			}
		},
		url: "/gists"
	},
	listComments: {
		method: "GET",
		params: {
			gist_id: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/gists/:gist_id/comments"
	},
	listCommits: {
		method: "GET",
		params: {
			gist_id: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/gists/:gist_id/commits"
	},
	listForks: {
		method: "GET",
		params: {
			gist_id: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/gists/:gist_id/forks"
	},
	listPublic: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			since: {
				type: "string"
			}
		},
		url: "/gists/public"
	},
	listPublicForUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			since: {
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/gists"
	},
	listStarred: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			since: {
				type: "string"
			}
		},
		url: "/gists/starred"
	},
	star: {
		method: "PUT",
		params: {
			gist_id: {
				required: true,
				type: "string"
			}
		},
		url: "/gists/:gist_id/star"
	},
	unstar: {
		method: "DELETE",
		params: {
			gist_id: {
				required: true,
				type: "string"
			}
		},
		url: "/gists/:gist_id/star"
	},
	update: {
		method: "PATCH",
		params: {
			description: {
				type: "string"
			},
			files: {
				type: "object"
			},
			"files.content": {
				type: "string"
			},
			"files.filename": {
				type: "string"
			},
			gist_id: {
				required: true,
				type: "string"
			}
		},
		url: "/gists/:gist_id"
	},
	updateComment: {
		method: "PATCH",
		params: {
			body: {
				required: true,
				type: "string"
			},
			comment_id: {
				required: true,
				type: "integer"
			},
			gist_id: {
				required: true,
				type: "string"
			}
		},
		url: "/gists/:gist_id/comments/:comment_id"
	}
};
var git = {
	createBlob: {
		method: "POST",
		params: {
			content: {
				required: true,
				type: "string"
			},
			encoding: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/blobs"
	},
	createCommit: {
		method: "POST",
		params: {
			author: {
				type: "object"
			},
			"author.date": {
				type: "string"
			},
			"author.email": {
				type: "string"
			},
			"author.name": {
				type: "string"
			},
			committer: {
				type: "object"
			},
			"committer.date": {
				type: "string"
			},
			"committer.email": {
				type: "string"
			},
			"committer.name": {
				type: "string"
			},
			message: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			parents: {
				required: true,
				type: "string[]"
			},
			repo: {
				required: true,
				type: "string"
			},
			signature: {
				type: "string"
			},
			tree: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/commits"
	},
	createRef: {
		method: "POST",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			ref: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			sha: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/refs"
	},
	createTag: {
		method: "POST",
		params: {
			message: {
				required: true,
				type: "string"
			},
			object: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			tag: {
				required: true,
				type: "string"
			},
			tagger: {
				type: "object"
			},
			"tagger.date": {
				type: "string"
			},
			"tagger.email": {
				type: "string"
			},
			"tagger.name": {
				type: "string"
			},
			type: {
				"enum": [
					"commit",
					"tree",
					"blob"
				],
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/tags"
	},
	createTree: {
		method: "POST",
		params: {
			base_tree: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			tree: {
				required: true,
				type: "object[]"
			},
			"tree[].content": {
				type: "string"
			},
			"tree[].mode": {
				"enum": [
					"100644",
					"100755",
					"040000",
					"160000",
					"120000"
				],
				type: "string"
			},
			"tree[].path": {
				type: "string"
			},
			"tree[].sha": {
				type: "string"
			},
			"tree[].type": {
				"enum": [
					"blob",
					"tree",
					"commit"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/trees"
	},
	deleteRef: {
		method: "DELETE",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			ref: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/refs/:ref"
	},
	getBlob: {
		method: "GET",
		params: {
			file_sha: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/blobs/:file_sha"
	},
	getCommit: {
		method: "GET",
		params: {
			commit_sha: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/commits/:commit_sha"
	},
	getRef: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			ref: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/refs/:ref"
	},
	getTag: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			tag_sha: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/tags/:tag_sha"
	},
	getTree: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			recursive: {
				"enum": [
					1
				],
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			tree_sha: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/trees/:tree_sha"
	},
	listRefs: {
		method: "GET",
		params: {
			namespace: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/refs/:namespace"
	},
	updateRef: {
		method: "PATCH",
		params: {
			force: {
				type: "boolean"
			},
			owner: {
				required: true,
				type: "string"
			},
			ref: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			sha: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/git/refs/:ref"
	}
};
var gitignore = {
	getTemplate: {
		method: "GET",
		params: {
			name: {
				required: true,
				type: "string"
			}
		},
		url: "/gitignore/templates/:name"
	},
	listTemplates: {
		method: "GET",
		params: {
		},
		url: "/gitignore/templates"
	}
};
var interactions = {
	addOrUpdateRestrictionsForOrg: {
		headers: {
			accept: "application/vnd.github.sombra-preview+json"
		},
		method: "PUT",
		params: {
			limit: {
				"enum": [
					"existing_users",
					"contributors_only",
					"collaborators_only"
				],
				required: true,
				type: "string"
			},
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/interaction-limits"
	},
	addOrUpdateRestrictionsForRepo: {
		headers: {
			accept: "application/vnd.github.sombra-preview+json"
		},
		method: "PUT",
		params: {
			limit: {
				"enum": [
					"existing_users",
					"contributors_only",
					"collaborators_only"
				],
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/interaction-limits"
	},
	getRestrictionsForOrg: {
		headers: {
			accept: "application/vnd.github.sombra-preview+json"
		},
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/interaction-limits"
	},
	getRestrictionsForRepo: {
		headers: {
			accept: "application/vnd.github.sombra-preview+json"
		},
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/interaction-limits"
	},
	removeRestrictionsForOrg: {
		headers: {
			accept: "application/vnd.github.sombra-preview+json"
		},
		method: "DELETE",
		params: {
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/interaction-limits"
	},
	removeRestrictionsForRepo: {
		headers: {
			accept: "application/vnd.github.sombra-preview+json"
		},
		method: "DELETE",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/interaction-limits"
	}
};
var issues = {
	addAssignees: {
		method: "POST",
		params: {
			assignees: {
				type: "string[]"
			},
			issue_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/assignees"
	},
	addLabels: {
		method: "POST",
		params: {
			issue_number: {
				required: true,
				type: "integer"
			},
			labels: {
				required: true,
				type: "string[]"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/labels"
	},
	checkAssignee: {
		method: "GET",
		params: {
			assignee: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/assignees/:assignee"
	},
	create: {
		method: "POST",
		params: {
			assignee: {
				type: "string"
			},
			assignees: {
				type: "string[]"
			},
			body: {
				type: "string"
			},
			labels: {
				type: "string[]"
			},
			milestone: {
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			title: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues"
	},
	createComment: {
		method: "POST",
		params: {
			body: {
				required: true,
				type: "string"
			},
			issue_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/comments"
	},
	createLabel: {
		method: "POST",
		params: {
			color: {
				required: true,
				type: "string"
			},
			description: {
				type: "string"
			},
			name: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/labels"
	},
	createMilestone: {
		method: "POST",
		params: {
			description: {
				type: "string"
			},
			due_on: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			state: {
				"enum": [
					"open",
					"closed"
				],
				type: "string"
			},
			title: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/milestones"
	},
	deleteComment: {
		method: "DELETE",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/comments/:comment_id"
	},
	deleteLabel: {
		method: "DELETE",
		params: {
			name: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/labels/:name"
	},
	deleteMilestone: {
		method: "DELETE",
		params: {
			milestone_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "milestone_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/milestones/:milestone_number"
	},
	get: {
		method: "GET",
		params: {
			issue_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number"
	},
	getComment: {
		method: "GET",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/comments/:comment_id"
	},
	getEvent: {
		method: "GET",
		params: {
			event_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/events/:event_id"
	},
	getLabel: {
		method: "GET",
		params: {
			name: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/labels/:name"
	},
	getMilestone: {
		method: "GET",
		params: {
			milestone_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "milestone_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/milestones/:milestone_number"
	},
	list: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			filter: {
				"enum": [
					"assigned",
					"created",
					"mentioned",
					"subscribed",
					"all"
				],
				type: "string"
			},
			labels: {
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			since: {
				type: "string"
			},
			sort: {
				"enum": [
					"created",
					"updated",
					"comments"
				],
				type: "string"
			},
			state: {
				"enum": [
					"open",
					"closed",
					"all"
				],
				type: "string"
			}
		},
		url: "/issues"
	},
	listAssignees: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/assignees"
	},
	listComments: {
		method: "GET",
		params: {
			issue_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			since: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/comments"
	},
	listCommentsForRepo: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			since: {
				type: "string"
			},
			sort: {
				"enum": [
					"created",
					"updated"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/comments"
	},
	listEvents: {
		method: "GET",
		params: {
			issue_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/events"
	},
	listEventsForRepo: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/events"
	},
	listEventsForTimeline: {
		headers: {
			accept: "application/vnd.github.mockingbird-preview+json"
		},
		method: "GET",
		params: {
			issue_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/timeline"
	},
	listForAuthenticatedUser: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			filter: {
				"enum": [
					"assigned",
					"created",
					"mentioned",
					"subscribed",
					"all"
				],
				type: "string"
			},
			labels: {
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			since: {
				type: "string"
			},
			sort: {
				"enum": [
					"created",
					"updated",
					"comments"
				],
				type: "string"
			},
			state: {
				"enum": [
					"open",
					"closed",
					"all"
				],
				type: "string"
			}
		},
		url: "/user/issues"
	},
	listForOrg: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			filter: {
				"enum": [
					"assigned",
					"created",
					"mentioned",
					"subscribed",
					"all"
				],
				type: "string"
			},
			labels: {
				type: "string"
			},
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			since: {
				type: "string"
			},
			sort: {
				"enum": [
					"created",
					"updated",
					"comments"
				],
				type: "string"
			},
			state: {
				"enum": [
					"open",
					"closed",
					"all"
				],
				type: "string"
			}
		},
		url: "/orgs/:org/issues"
	},
	listForRepo: {
		method: "GET",
		params: {
			assignee: {
				type: "string"
			},
			creator: {
				type: "string"
			},
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			labels: {
				type: "string"
			},
			mentioned: {
				type: "string"
			},
			milestone: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			since: {
				type: "string"
			},
			sort: {
				"enum": [
					"created",
					"updated",
					"comments"
				],
				type: "string"
			},
			state: {
				"enum": [
					"open",
					"closed",
					"all"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues"
	},
	listLabelsForMilestone: {
		method: "GET",
		params: {
			milestone_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "milestone_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/milestones/:milestone_number/labels"
	},
	listLabelsForRepo: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/labels"
	},
	listLabelsOnIssue: {
		method: "GET",
		params: {
			issue_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/labels"
	},
	listMilestonesForRepo: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			sort: {
				"enum": [
					"due_on",
					"completeness"
				],
				type: "string"
			},
			state: {
				"enum": [
					"open",
					"closed",
					"all"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/milestones"
	},
	lock: {
		method: "PUT",
		params: {
			issue_number: {
				required: true,
				type: "integer"
			},
			lock_reason: {
				"enum": [
					"off-topic",
					"too heated",
					"resolved",
					"spam"
				],
				type: "string"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/lock"
	},
	removeAssignees: {
		method: "DELETE",
		params: {
			assignees: {
				type: "string[]"
			},
			issue_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/assignees"
	},
	removeLabel: {
		method: "DELETE",
		params: {
			issue_number: {
				required: true,
				type: "integer"
			},
			name: {
				required: true,
				type: "string"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/labels/:name"
	},
	removeLabels: {
		method: "DELETE",
		params: {
			issue_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/labels"
	},
	replaceLabels: {
		method: "PUT",
		params: {
			issue_number: {
				required: true,
				type: "integer"
			},
			labels: {
				type: "string[]"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/labels"
	},
	unlock: {
		method: "DELETE",
		params: {
			issue_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/lock"
	},
	update: {
		method: "PATCH",
		params: {
			assignee: {
				type: "string"
			},
			assignees: {
				type: "string[]"
			},
			body: {
				type: "string"
			},
			issue_number: {
				required: true,
				type: "integer"
			},
			labels: {
				type: "string[]"
			},
			milestone: {
				allowNull: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			state: {
				"enum": [
					"open",
					"closed"
				],
				type: "string"
			},
			title: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number"
	},
	updateComment: {
		method: "PATCH",
		params: {
			body: {
				required: true,
				type: "string"
			},
			comment_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/comments/:comment_id"
	},
	updateLabel: {
		method: "PATCH",
		params: {
			color: {
				type: "string"
			},
			current_name: {
				required: true,
				type: "string"
			},
			description: {
				type: "string"
			},
			name: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/labels/:current_name"
	},
	updateMilestone: {
		method: "PATCH",
		params: {
			description: {
				type: "string"
			},
			due_on: {
				type: "string"
			},
			milestone_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "milestone_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			state: {
				"enum": [
					"open",
					"closed"
				],
				type: "string"
			},
			title: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/milestones/:milestone_number"
	}
};
var licenses = {
	get: {
		method: "GET",
		params: {
			license: {
				required: true,
				type: "string"
			}
		},
		url: "/licenses/:license"
	},
	getForRepo: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/license"
	},
	list: {
		deprecated: "octokit.licenses.list() has been renamed to octokit.licenses.listCommonlyUsed() (2019-03-05)",
		method: "GET",
		params: {
		},
		url: "/licenses"
	},
	listCommonlyUsed: {
		method: "GET",
		params: {
		},
		url: "/licenses"
	}
};
var markdown = {
	render: {
		method: "POST",
		params: {
			context: {
				type: "string"
			},
			mode: {
				"enum": [
					"markdown",
					"gfm"
				],
				type: "string"
			},
			text: {
				required: true,
				type: "string"
			}
		},
		url: "/markdown"
	},
	renderRaw: {
		headers: {
			"content-type": "text/plain; charset=utf-8"
		},
		method: "POST",
		params: {
			data: {
				mapTo: "data",
				required: true,
				type: "string"
			}
		},
		url: "/markdown/raw"
	}
};
var meta = {
	get: {
		method: "GET",
		params: {
		},
		url: "/meta"
	}
};
var migrations = {
	cancelImport: {
		headers: {
			accept: "application/vnd.github.barred-rock-preview+json"
		},
		method: "DELETE",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/import"
	},
	deleteArchiveForAuthenticatedUser: {
		headers: {
			accept: "application/vnd.github.wyandotte-preview+json"
		},
		method: "DELETE",
		params: {
			migration_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/user/migrations/:migration_id/archive"
	},
	deleteArchiveForOrg: {
		headers: {
			accept: "application/vnd.github.wyandotte-preview+json"
		},
		method: "DELETE",
		params: {
			migration_id: {
				required: true,
				type: "integer"
			},
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/migrations/:migration_id/archive"
	},
	getArchiveForAuthenticatedUser: {
		headers: {
			accept: "application/vnd.github.wyandotte-preview+json"
		},
		method: "GET",
		params: {
			migration_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/user/migrations/:migration_id/archive"
	},
	getArchiveForOrg: {
		headers: {
			accept: "application/vnd.github.wyandotte-preview+json"
		},
		method: "GET",
		params: {
			migration_id: {
				required: true,
				type: "integer"
			},
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/migrations/:migration_id/archive"
	},
	getCommitAuthors: {
		headers: {
			accept: "application/vnd.github.barred-rock-preview+json"
		},
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			since: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/import/authors"
	},
	getImportProgress: {
		headers: {
			accept: "application/vnd.github.barred-rock-preview+json"
		},
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/import"
	},
	getLargeFiles: {
		headers: {
			accept: "application/vnd.github.barred-rock-preview+json"
		},
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/import/large_files"
	},
	getStatusForAuthenticatedUser: {
		headers: {
			accept: "application/vnd.github.wyandotte-preview+json"
		},
		method: "GET",
		params: {
			migration_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/user/migrations/:migration_id"
	},
	getStatusForOrg: {
		headers: {
			accept: "application/vnd.github.wyandotte-preview+json"
		},
		method: "GET",
		params: {
			migration_id: {
				required: true,
				type: "integer"
			},
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/migrations/:migration_id"
	},
	listForAuthenticatedUser: {
		headers: {
			accept: "application/vnd.github.wyandotte-preview+json"
		},
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/migrations"
	},
	listForOrg: {
		headers: {
			accept: "application/vnd.github.wyandotte-preview+json"
		},
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/orgs/:org/migrations"
	},
	mapCommitAuthor: {
		headers: {
			accept: "application/vnd.github.barred-rock-preview+json"
		},
		method: "PATCH",
		params: {
			author_id: {
				required: true,
				type: "integer"
			},
			email: {
				type: "string"
			},
			name: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/import/authors/:author_id"
	},
	setLfsPreference: {
		headers: {
			accept: "application/vnd.github.barred-rock-preview+json"
		},
		method: "PATCH",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			use_lfs: {
				"enum": [
					"opt_in",
					"opt_out"
				],
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/import/lfs"
	},
	startForAuthenticatedUser: {
		method: "POST",
		params: {
			exclude_attachments: {
				type: "boolean"
			},
			lock_repositories: {
				type: "boolean"
			},
			repositories: {
				required: true,
				type: "string[]"
			}
		},
		url: "/user/migrations"
	},
	startForOrg: {
		method: "POST",
		params: {
			exclude_attachments: {
				type: "boolean"
			},
			lock_repositories: {
				type: "boolean"
			},
			org: {
				required: true,
				type: "string"
			},
			repositories: {
				required: true,
				type: "string[]"
			}
		},
		url: "/orgs/:org/migrations"
	},
	startImport: {
		headers: {
			accept: "application/vnd.github.barred-rock-preview+json"
		},
		method: "PUT",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			tfvc_project: {
				type: "string"
			},
			vcs: {
				"enum": [
					"subversion",
					"git",
					"mercurial",
					"tfvc"
				],
				type: "string"
			},
			vcs_password: {
				type: "string"
			},
			vcs_url: {
				required: true,
				type: "string"
			},
			vcs_username: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/import"
	},
	unlockRepoForAuthenticatedUser: {
		headers: {
			accept: "application/vnd.github.wyandotte-preview+json"
		},
		method: "DELETE",
		params: {
			migration_id: {
				required: true,
				type: "integer"
			},
			repo_name: {
				required: true,
				type: "string"
			}
		},
		url: "/user/migrations/:migration_id/repos/:repo_name/lock"
	},
	unlockRepoForOrg: {
		headers: {
			accept: "application/vnd.github.wyandotte-preview+json"
		},
		method: "DELETE",
		params: {
			migration_id: {
				required: true,
				type: "integer"
			},
			org: {
				required: true,
				type: "string"
			},
			repo_name: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/migrations/:migration_id/repos/:repo_name/lock"
	},
	updateImport: {
		headers: {
			accept: "application/vnd.github.barred-rock-preview+json"
		},
		method: "PATCH",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			vcs_password: {
				type: "string"
			},
			vcs_username: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/import"
	}
};
var oauthAuthorizations = {
	checkAuthorization: {
		method: "GET",
		params: {
			access_token: {
				required: true,
				type: "string"
			},
			client_id: {
				required: true,
				type: "string"
			}
		},
		url: "/applications/:client_id/tokens/:access_token"
	},
	createAuthorization: {
		method: "POST",
		params: {
			client_id: {
				type: "string"
			},
			client_secret: {
				type: "string"
			},
			fingerprint: {
				type: "string"
			},
			note: {
				required: true,
				type: "string"
			},
			note_url: {
				type: "string"
			},
			scopes: {
				type: "string[]"
			}
		},
		url: "/authorizations"
	},
	deleteAuthorization: {
		method: "DELETE",
		params: {
			authorization_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/authorizations/:authorization_id"
	},
	deleteGrant: {
		method: "DELETE",
		params: {
			grant_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/applications/grants/:grant_id"
	},
	getAuthorization: {
		method: "GET",
		params: {
			authorization_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/authorizations/:authorization_id"
	},
	getGrant: {
		method: "GET",
		params: {
			grant_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/applications/grants/:grant_id"
	},
	getOrCreateAuthorizationForApp: {
		method: "PUT",
		params: {
			client_id: {
				required: true,
				type: "string"
			},
			client_secret: {
				required: true,
				type: "string"
			},
			fingerprint: {
				type: "string"
			},
			note: {
				type: "string"
			},
			note_url: {
				type: "string"
			},
			scopes: {
				type: "string[]"
			}
		},
		url: "/authorizations/clients/:client_id"
	},
	getOrCreateAuthorizationForAppAndFingerprint: {
		method: "PUT",
		params: {
			client_id: {
				required: true,
				type: "string"
			},
			client_secret: {
				required: true,
				type: "string"
			},
			fingerprint: {
				required: true,
				type: "string"
			},
			note: {
				type: "string"
			},
			note_url: {
				type: "string"
			},
			scopes: {
				type: "string[]"
			}
		},
		url: "/authorizations/clients/:client_id/:fingerprint"
	},
	getOrCreateAuthorizationForAppFingerprint: {
		deprecated: "octokit.oauthAuthorizations.getOrCreateAuthorizationForAppFingerprint() has been renamed to octokit.oauthAuthorizations.getOrCreateAuthorizationForAppAndFingerprint() (2018-12-27)",
		method: "PUT",
		params: {
			client_id: {
				required: true,
				type: "string"
			},
			client_secret: {
				required: true,
				type: "string"
			},
			fingerprint: {
				required: true,
				type: "string"
			},
			note: {
				type: "string"
			},
			note_url: {
				type: "string"
			},
			scopes: {
				type: "string[]"
			}
		},
		url: "/authorizations/clients/:client_id/:fingerprint"
	},
	listAuthorizations: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/authorizations"
	},
	listGrants: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/applications/grants"
	},
	resetAuthorization: {
		method: "POST",
		params: {
			access_token: {
				required: true,
				type: "string"
			},
			client_id: {
				required: true,
				type: "string"
			}
		},
		url: "/applications/:client_id/tokens/:access_token"
	},
	revokeAuthorizationForApplication: {
		method: "DELETE",
		params: {
			access_token: {
				required: true,
				type: "string"
			},
			client_id: {
				required: true,
				type: "string"
			}
		},
		url: "/applications/:client_id/tokens/:access_token"
	},
	revokeGrantForApplication: {
		method: "DELETE",
		params: {
			access_token: {
				required: true,
				type: "string"
			},
			client_id: {
				required: true,
				type: "string"
			}
		},
		url: "/applications/:client_id/grants/:access_token"
	},
	updateAuthorization: {
		method: "PATCH",
		params: {
			add_scopes: {
				type: "string[]"
			},
			authorization_id: {
				required: true,
				type: "integer"
			},
			fingerprint: {
				type: "string"
			},
			note: {
				type: "string"
			},
			note_url: {
				type: "string"
			},
			remove_scopes: {
				type: "string[]"
			},
			scopes: {
				type: "string[]"
			}
		},
		url: "/authorizations/:authorization_id"
	}
};
var orgs = {
	addOrUpdateMembership: {
		method: "PUT",
		params: {
			org: {
				required: true,
				type: "string"
			},
			role: {
				"enum": [
					"admin",
					"member"
				],
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/memberships/:username"
	},
	blockUser: {
		method: "PUT",
		params: {
			org: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/blocks/:username"
	},
	checkBlockedUser: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/blocks/:username"
	},
	checkMembership: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/members/:username"
	},
	checkPublicMembership: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/public_members/:username"
	},
	concealMembership: {
		method: "DELETE",
		params: {
			org: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/public_members/:username"
	},
	convertMemberToOutsideCollaborator: {
		method: "PUT",
		params: {
			org: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/outside_collaborators/:username"
	},
	createHook: {
		method: "POST",
		params: {
			active: {
				type: "boolean"
			},
			config: {
				required: true,
				type: "object"
			},
			"config.content_type": {
				type: "string"
			},
			"config.insecure_ssl": {
				type: "string"
			},
			"config.secret": {
				type: "string"
			},
			"config.url": {
				required: true,
				type: "string"
			},
			events: {
				type: "string[]"
			},
			name: {
				required: true,
				type: "string"
			},
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/hooks"
	},
	createInvitation: {
		method: "POST",
		params: {
			email: {
				type: "string"
			},
			invitee_id: {
				type: "integer"
			},
			org: {
				required: true,
				type: "string"
			},
			role: {
				"enum": [
					"admin",
					"direct_member",
					"billing_manager"
				],
				type: "string"
			},
			team_ids: {
				type: "integer[]"
			}
		},
		url: "/orgs/:org/invitations"
	},
	deleteHook: {
		method: "DELETE",
		params: {
			hook_id: {
				required: true,
				type: "integer"
			},
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/hooks/:hook_id"
	},
	get: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org"
	},
	getHook: {
		method: "GET",
		params: {
			hook_id: {
				required: true,
				type: "integer"
			},
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/hooks/:hook_id"
	},
	getMembership: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/memberships/:username"
	},
	getMembershipForAuthenticatedUser: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/user/memberships/orgs/:org"
	},
	list: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			since: {
				type: "string"
			}
		},
		url: "/organizations"
	},
	listBlockedUsers: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/blocks"
	},
	listForAuthenticatedUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/orgs"
	},
	listForUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/orgs"
	},
	listHooks: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/orgs/:org/hooks"
	},
	listInvitationTeams: {
		method: "GET",
		params: {
			invitation_id: {
				required: true,
				type: "integer"
			},
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/orgs/:org/invitations/:invitation_id/teams"
	},
	listMembers: {
		method: "GET",
		params: {
			filter: {
				"enum": [
					"2fa_disabled",
					"all"
				],
				type: "string"
			},
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			role: {
				"enum": [
					"all",
					"admin",
					"member"
				],
				type: "string"
			}
		},
		url: "/orgs/:org/members"
	},
	listMemberships: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			state: {
				"enum": [
					"active",
					"pending"
				],
				type: "string"
			}
		},
		url: "/user/memberships/orgs"
	},
	listOutsideCollaborators: {
		method: "GET",
		params: {
			filter: {
				"enum": [
					"2fa_disabled",
					"all"
				],
				type: "string"
			},
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/orgs/:org/outside_collaborators"
	},
	listPendingInvitations: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/orgs/:org/invitations"
	},
	listPublicMembers: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/orgs/:org/public_members"
	},
	pingHook: {
		method: "POST",
		params: {
			hook_id: {
				required: true,
				type: "integer"
			},
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/hooks/:hook_id/pings"
	},
	publicizeMembership: {
		method: "PUT",
		params: {
			org: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/public_members/:username"
	},
	removeMember: {
		method: "DELETE",
		params: {
			org: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/members/:username"
	},
	removeMembership: {
		method: "DELETE",
		params: {
			org: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/memberships/:username"
	},
	removeOutsideCollaborator: {
		method: "DELETE",
		params: {
			org: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/outside_collaborators/:username"
	},
	unblockUser: {
		method: "DELETE",
		params: {
			org: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/blocks/:username"
	},
	update: {
		method: "PATCH",
		params: {
			billing_email: {
				type: "string"
			},
			company: {
				type: "string"
			},
			default_repository_permission: {
				"enum": [
					"read",
					"write",
					"admin",
					"none"
				],
				type: "string"
			},
			description: {
				type: "string"
			},
			email: {
				type: "string"
			},
			has_organization_projects: {
				type: "boolean"
			},
			has_repository_projects: {
				type: "boolean"
			},
			location: {
				type: "string"
			},
			members_allowed_repository_creation_type: {
				"enum": [
					"all",
					"private",
					"none"
				],
				type: "string"
			},
			members_can_create_repositories: {
				type: "boolean"
			},
			name: {
				type: "string"
			},
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org"
	},
	updateHook: {
		method: "PATCH",
		params: {
			active: {
				type: "boolean"
			},
			config: {
				type: "object"
			},
			"config.content_type": {
				type: "string"
			},
			"config.insecure_ssl": {
				type: "string"
			},
			"config.secret": {
				type: "string"
			},
			"config.url": {
				required: true,
				type: "string"
			},
			events: {
				type: "string[]"
			},
			hook_id: {
				required: true,
				type: "integer"
			},
			org: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/hooks/:hook_id"
	},
	updateMembership: {
		method: "PATCH",
		params: {
			org: {
				required: true,
				type: "string"
			},
			state: {
				"enum": [
					"active"
				],
				required: true,
				type: "string"
			}
		},
		url: "/user/memberships/orgs/:org"
	}
};
var projects = {
	addCollaborator: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "PUT",
		params: {
			permission: {
				"enum": [
					"read",
					"write",
					"admin"
				],
				type: "string"
			},
			project_id: {
				required: true,
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/projects/:project_id/collaborators/:username"
	},
	createCard: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "POST",
		params: {
			column_id: {
				required: true,
				type: "integer"
			},
			content_id: {
				type: "integer"
			},
			content_type: {
				type: "string"
			},
			note: {
				type: "string"
			}
		},
		url: "/projects/columns/:column_id/cards"
	},
	createColumn: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "POST",
		params: {
			name: {
				required: true,
				type: "string"
			},
			project_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/projects/:project_id/columns"
	},
	createForAuthenticatedUser: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "POST",
		params: {
			body: {
				type: "string"
			},
			name: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/projects"
	},
	createForOrg: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "POST",
		params: {
			body: {
				type: "string"
			},
			name: {
				required: true,
				type: "string"
			},
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/orgs/:org/projects"
	},
	createForRepo: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "POST",
		params: {
			body: {
				type: "string"
			},
			name: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/projects"
	},
	"delete": {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "DELETE",
		params: {
			project_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/projects/:project_id"
	},
	deleteCard: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "DELETE",
		params: {
			card_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/projects/columns/cards/:card_id"
	},
	deleteColumn: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "DELETE",
		params: {
			column_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/projects/columns/:column_id"
	},
	get: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			project_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/projects/:project_id"
	},
	getCard: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "GET",
		params: {
			card_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/projects/columns/cards/:card_id"
	},
	getColumn: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "GET",
		params: {
			column_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/projects/columns/:column_id"
	},
	listCards: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "GET",
		params: {
			archived_state: {
				"enum": [
					"all",
					"archived",
					"not_archived"
				],
				type: "string"
			},
			column_id: {
				required: true,
				type: "integer"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/projects/columns/:column_id/cards"
	},
	listCollaborators: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "GET",
		params: {
			affiliation: {
				"enum": [
					"outside",
					"direct",
					"all"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			project_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/projects/:project_id/collaborators"
	},
	listColumns: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			project_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/projects/:project_id/columns"
	},
	listForOrg: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			state: {
				"enum": [
					"open",
					"closed",
					"all"
				],
				type: "string"
			}
		},
		url: "/orgs/:org/projects"
	},
	listForRepo: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			state: {
				"enum": [
					"open",
					"closed",
					"all"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/projects"
	},
	listForUser: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			state: {
				"enum": [
					"open",
					"closed",
					"all"
				],
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/projects"
	},
	moveCard: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "POST",
		params: {
			card_id: {
				required: true,
				type: "integer"
			},
			column_id: {
				type: "integer"
			},
			position: {
				required: true,
				type: "string",
				validation: "^(top|bottom|after:\\d+)$"
			}
		},
		url: "/projects/columns/cards/:card_id/moves"
	},
	moveColumn: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "POST",
		params: {
			column_id: {
				required: true,
				type: "integer"
			},
			position: {
				required: true,
				type: "string",
				validation: "^(first|last|after:\\d+)$"
			}
		},
		url: "/projects/columns/:column_id/moves"
	},
	removeCollaborator: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "DELETE",
		params: {
			project_id: {
				required: true,
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/projects/:project_id/collaborators/:username"
	},
	reviewUserPermissionLevel: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "GET",
		params: {
			project_id: {
				required: true,
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/projects/:project_id/collaborators/:username/permission"
	},
	update: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "PATCH",
		params: {
			body: {
				type: "string"
			},
			name: {
				type: "string"
			},
			organization_permission: {
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			"private": {
				type: "boolean"
			},
			project_id: {
				required: true,
				type: "integer"
			},
			state: {
				"enum": [
					"open",
					"closed"
				],
				type: "string"
			}
		},
		url: "/projects/:project_id"
	},
	updateCard: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "PATCH",
		params: {
			archived: {
				type: "boolean"
			},
			card_id: {
				required: true,
				type: "integer"
			},
			note: {
				type: "string"
			}
		},
		url: "/projects/columns/cards/:card_id"
	},
	updateColumn: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "PATCH",
		params: {
			column_id: {
				required: true,
				type: "integer"
			},
			name: {
				required: true,
				type: "string"
			}
		},
		url: "/projects/columns/:column_id"
	}
};
var pulls = {
	checkIfMerged: {
		method: "GET",
		params: {
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/merge"
	},
	create: {
		method: "POST",
		params: {
			base: {
				required: true,
				type: "string"
			},
			body: {
				type: "string"
			},
			draft: {
				type: "boolean"
			},
			head: {
				required: true,
				type: "string"
			},
			maintainer_can_modify: {
				type: "boolean"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			title: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls"
	},
	createComment: {
		method: "POST",
		params: {
			body: {
				required: true,
				type: "string"
			},
			commit_id: {
				required: true,
				type: "string"
			},
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			path: {
				required: true,
				type: "string"
			},
			position: {
				required: true,
				type: "integer"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/comments"
	},
	createCommentReply: {
		method: "POST",
		params: {
			body: {
				required: true,
				type: "string"
			},
			in_reply_to: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/comments"
	},
	createFromIssue: {
		method: "POST",
		params: {
			base: {
				required: true,
				type: "string"
			},
			draft: {
				type: "boolean"
			},
			head: {
				required: true,
				type: "string"
			},
			issue: {
				required: true,
				type: "integer"
			},
			maintainer_can_modify: {
				type: "boolean"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls"
	},
	createReview: {
		method: "POST",
		params: {
			body: {
				type: "string"
			},
			comments: {
				type: "object[]"
			},
			"comments[].body": {
				required: true,
				type: "string"
			},
			"comments[].path": {
				required: true,
				type: "string"
			},
			"comments[].position": {
				required: true,
				type: "integer"
			},
			commit_id: {
				type: "string"
			},
			event: {
				"enum": [
					"APPROVE",
					"REQUEST_CHANGES",
					"COMMENT"
				],
				type: "string"
			},
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/reviews"
	},
	createReviewRequest: {
		method: "POST",
		params: {
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			reviewers: {
				type: "string[]"
			},
			team_reviewers: {
				type: "string[]"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/requested_reviewers"
	},
	deleteComment: {
		method: "DELETE",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/comments/:comment_id"
	},
	deletePendingReview: {
		method: "DELETE",
		params: {
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			review_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id"
	},
	deleteReviewRequest: {
		method: "DELETE",
		params: {
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			reviewers: {
				type: "string[]"
			},
			team_reviewers: {
				type: "string[]"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/requested_reviewers"
	},
	dismissReview: {
		method: "PUT",
		params: {
			message: {
				required: true,
				type: "string"
			},
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			review_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id/dismissals"
	},
	get: {
		method: "GET",
		params: {
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number"
	},
	getComment: {
		method: "GET",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/comments/:comment_id"
	},
	getCommentsForReview: {
		method: "GET",
		params: {
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			review_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id/comments"
	},
	getReview: {
		method: "GET",
		params: {
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			review_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id"
	},
	list: {
		method: "GET",
		params: {
			base: {
				type: "string"
			},
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			head: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			sort: {
				"enum": [
					"created",
					"updated",
					"popularity",
					"long-running"
				],
				type: "string"
			},
			state: {
				"enum": [
					"open",
					"closed",
					"all"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls"
	},
	listComments: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			since: {
				type: "string"
			},
			sort: {
				"enum": [
					"created",
					"updated"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/comments"
	},
	listCommentsForRepo: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			since: {
				type: "string"
			},
			sort: {
				"enum": [
					"created",
					"updated"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/comments"
	},
	listCommits: {
		method: "GET",
		params: {
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/commits"
	},
	listFiles: {
		method: "GET",
		params: {
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/files"
	},
	listReviewRequests: {
		method: "GET",
		params: {
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/requested_reviewers"
	},
	listReviews: {
		method: "GET",
		params: {
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/reviews"
	},
	merge: {
		method: "PUT",
		params: {
			commit_message: {
				type: "string"
			},
			commit_title: {
				type: "string"
			},
			merge_method: {
				"enum": [
					"merge",
					"squash",
					"rebase"
				],
				type: "string"
			},
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			sha: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/merge"
	},
	submitReview: {
		method: "POST",
		params: {
			body: {
				type: "string"
			},
			event: {
				"enum": [
					"APPROVE",
					"REQUEST_CHANGES",
					"COMMENT"
				],
				required: true,
				type: "string"
			},
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			review_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id/events"
	},
	update: {
		method: "PATCH",
		params: {
			base: {
				type: "string"
			},
			body: {
				type: "string"
			},
			maintainer_can_modify: {
				type: "boolean"
			},
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			state: {
				"enum": [
					"open",
					"closed"
				],
				type: "string"
			},
			title: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number"
	},
	updateBranch: {
		headers: {
			accept: "application/vnd.github.lydian-preview+json"
		},
		method: "PUT",
		params: {
			expected_head_sha: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/update-branch"
	},
	updateComment: {
		method: "PATCH",
		params: {
			body: {
				required: true,
				type: "string"
			},
			comment_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/comments/:comment_id"
	},
	updateReview: {
		method: "PUT",
		params: {
			body: {
				required: true,
				type: "string"
			},
			number: {
				alias: "pull_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			pull_number: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			review_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id"
	}
};
var rateLimit = {
	get: {
		method: "GET",
		params: {
		},
		url: "/rate_limit"
	}
};
var reactions = {
	createForCommitComment: {
		headers: {
			accept: "application/vnd.github.squirrel-girl-preview+json"
		},
		method: "POST",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			content: {
				"enum": [
					"+1",
					"-1",
					"laugh",
					"confused",
					"heart",
					"hooray",
					"rocket",
					"eyes"
				],
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/comments/:comment_id/reactions"
	},
	createForIssue: {
		headers: {
			accept: "application/vnd.github.squirrel-girl-preview+json"
		},
		method: "POST",
		params: {
			content: {
				"enum": [
					"+1",
					"-1",
					"laugh",
					"confused",
					"heart",
					"hooray",
					"rocket",
					"eyes"
				],
				required: true,
				type: "string"
			},
			issue_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/reactions"
	},
	createForIssueComment: {
		headers: {
			accept: "application/vnd.github.squirrel-girl-preview+json"
		},
		method: "POST",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			content: {
				"enum": [
					"+1",
					"-1",
					"laugh",
					"confused",
					"heart",
					"hooray",
					"rocket",
					"eyes"
				],
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/comments/:comment_id/reactions"
	},
	createForPullRequestReviewComment: {
		headers: {
			accept: "application/vnd.github.squirrel-girl-preview+json"
		},
		method: "POST",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			content: {
				"enum": [
					"+1",
					"-1",
					"laugh",
					"confused",
					"heart",
					"hooray",
					"rocket",
					"eyes"
				],
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/comments/:comment_id/reactions"
	},
	createForTeamDiscussion: {
		headers: {
			accept: "application/vnd.github.echo-preview+json,application/vnd.github.squirrel-girl-preview+json"
		},
		method: "POST",
		params: {
			content: {
				"enum": [
					"+1",
					"-1",
					"laugh",
					"confused",
					"heart",
					"hooray",
					"rocket",
					"eyes"
				],
				required: true,
				type: "string"
			},
			discussion_number: {
				required: true,
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/discussions/:discussion_number/reactions"
	},
	createForTeamDiscussionComment: {
		headers: {
			accept: "application/vnd.github.echo-preview+json,application/vnd.github.squirrel-girl-preview+json"
		},
		method: "POST",
		params: {
			comment_number: {
				required: true,
				type: "integer"
			},
			content: {
				"enum": [
					"+1",
					"-1",
					"laugh",
					"confused",
					"heart",
					"hooray",
					"rocket",
					"eyes"
				],
				required: true,
				type: "string"
			},
			discussion_number: {
				required: true,
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number/reactions"
	},
	"delete": {
		headers: {
			accept: "application/vnd.github.echo-preview+json,application/vnd.github.squirrel-girl-preview+json"
		},
		method: "DELETE",
		params: {
			reaction_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/reactions/:reaction_id"
	},
	listForCommitComment: {
		headers: {
			accept: "application/vnd.github.squirrel-girl-preview+json"
		},
		method: "GET",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			content: {
				"enum": [
					"+1",
					"-1",
					"laugh",
					"confused",
					"heart",
					"hooray",
					"rocket",
					"eyes"
				],
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/comments/:comment_id/reactions"
	},
	listForIssue: {
		headers: {
			accept: "application/vnd.github.squirrel-girl-preview+json"
		},
		method: "GET",
		params: {
			content: {
				"enum": [
					"+1",
					"-1",
					"laugh",
					"confused",
					"heart",
					"hooray",
					"rocket",
					"eyes"
				],
				type: "string"
			},
			issue_number: {
				required: true,
				type: "integer"
			},
			number: {
				alias: "issue_number",
				deprecated: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/:issue_number/reactions"
	},
	listForIssueComment: {
		headers: {
			accept: "application/vnd.github.squirrel-girl-preview+json"
		},
		method: "GET",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			content: {
				"enum": [
					"+1",
					"-1",
					"laugh",
					"confused",
					"heart",
					"hooray",
					"rocket",
					"eyes"
				],
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/issues/comments/:comment_id/reactions"
	},
	listForPullRequestReviewComment: {
		headers: {
			accept: "application/vnd.github.squirrel-girl-preview+json"
		},
		method: "GET",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			content: {
				"enum": [
					"+1",
					"-1",
					"laugh",
					"confused",
					"heart",
					"hooray",
					"rocket",
					"eyes"
				],
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pulls/comments/:comment_id/reactions"
	},
	listForTeamDiscussion: {
		headers: {
			accept: "application/vnd.github.echo-preview+json,application/vnd.github.squirrel-girl-preview+json"
		},
		method: "GET",
		params: {
			content: {
				"enum": [
					"+1",
					"-1",
					"laugh",
					"confused",
					"heart",
					"hooray",
					"rocket",
					"eyes"
				],
				type: "string"
			},
			discussion_number: {
				required: true,
				type: "integer"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/discussions/:discussion_number/reactions"
	},
	listForTeamDiscussionComment: {
		headers: {
			accept: "application/vnd.github.echo-preview+json,application/vnd.github.squirrel-girl-preview+json"
		},
		method: "GET",
		params: {
			comment_number: {
				required: true,
				type: "integer"
			},
			content: {
				"enum": [
					"+1",
					"-1",
					"laugh",
					"confused",
					"heart",
					"hooray",
					"rocket",
					"eyes"
				],
				type: "string"
			},
			discussion_number: {
				required: true,
				type: "integer"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number/reactions"
	}
};
var repos = {
	acceptInvitation: {
		method: "PATCH",
		params: {
			invitation_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/user/repository_invitations/:invitation_id"
	},
	addCollaborator: {
		method: "PUT",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			permission: {
				"enum": [
					"pull",
					"push",
					"admin"
				],
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/collaborators/:username"
	},
	addDeployKey: {
		method: "POST",
		params: {
			key: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			read_only: {
				type: "boolean"
			},
			repo: {
				required: true,
				type: "string"
			},
			title: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/keys"
	},
	addProtectedBranchAdminEnforcement: {
		method: "POST",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/enforce_admins"
	},
	addProtectedBranchRequiredSignatures: {
		headers: {
			accept: "application/vnd.github.zzzax-preview+json"
		},
		method: "POST",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_signatures"
	},
	addProtectedBranchRequiredStatusChecksContexts: {
		method: "POST",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			contexts: {
				mapTo: "data",
				required: true,
				type: "string[]"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks/contexts"
	},
	addProtectedBranchTeamRestrictions: {
		method: "POST",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			teams: {
				mapTo: "data",
				required: true,
				type: "string[]"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/teams"
	},
	addProtectedBranchUserRestrictions: {
		method: "POST",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			users: {
				mapTo: "data",
				required: true,
				type: "string[]"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/users"
	},
	checkCollaborator: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/collaborators/:username"
	},
	checkVulnerabilityAlerts: {
		headers: {
			accept: "application/vnd.github.dorian-preview+json"
		},
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/vulnerability-alerts"
	},
	compareCommits: {
		method: "GET",
		params: {
			base: {
				required: true,
				type: "string"
			},
			head: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/compare/:base...:head"
	},
	createCommitComment: {
		method: "POST",
		params: {
			body: {
				required: true,
				type: "string"
			},
			commit_sha: {
				required: true,
				type: "string"
			},
			line: {
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			path: {
				type: "string"
			},
			position: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			sha: {
				alias: "commit_sha",
				deprecated: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/commits/:commit_sha/comments"
	},
	createDeployment: {
		method: "POST",
		params: {
			auto_merge: {
				type: "boolean"
			},
			description: {
				type: "string"
			},
			environment: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			payload: {
				type: "string"
			},
			production_environment: {
				type: "boolean"
			},
			ref: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			required_contexts: {
				type: "string[]"
			},
			task: {
				type: "string"
			},
			transient_environment: {
				type: "boolean"
			}
		},
		url: "/repos/:owner/:repo/deployments"
	},
	createDeploymentStatus: {
		method: "POST",
		params: {
			auto_inactive: {
				type: "boolean"
			},
			deployment_id: {
				required: true,
				type: "integer"
			},
			description: {
				type: "string"
			},
			environment: {
				"enum": [
					"production",
					"staging",
					"qa"
				],
				type: "string"
			},
			environment_url: {
				type: "string"
			},
			log_url: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			state: {
				"enum": [
					"error",
					"failure",
					"inactive",
					"in_progress",
					"queued",
					"pending",
					"success"
				],
				required: true,
				type: "string"
			},
			target_url: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/deployments/:deployment_id/statuses"
	},
	createFile: {
		deprecated: "octokit.repos.createFile() has been renamed to octokit.repos.createOrUpdateFile() (2019-06-07)",
		method: "PUT",
		params: {
			author: {
				type: "object"
			},
			"author.email": {
				required: true,
				type: "string"
			},
			"author.name": {
				required: true,
				type: "string"
			},
			branch: {
				type: "string"
			},
			committer: {
				type: "object"
			},
			"committer.email": {
				required: true,
				type: "string"
			},
			"committer.name": {
				required: true,
				type: "string"
			},
			content: {
				required: true,
				type: "string"
			},
			message: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			path: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			sha: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/contents/:path"
	},
	createForAuthenticatedUser: {
		method: "POST",
		params: {
			allow_merge_commit: {
				type: "boolean"
			},
			allow_rebase_merge: {
				type: "boolean"
			},
			allow_squash_merge: {
				type: "boolean"
			},
			auto_init: {
				type: "boolean"
			},
			description: {
				type: "string"
			},
			gitignore_template: {
				type: "string"
			},
			has_issues: {
				type: "boolean"
			},
			has_projects: {
				type: "boolean"
			},
			has_wiki: {
				type: "boolean"
			},
			homepage: {
				type: "string"
			},
			is_template: {
				type: "boolean"
			},
			license_template: {
				type: "string"
			},
			name: {
				required: true,
				type: "string"
			},
			"private": {
				type: "boolean"
			},
			team_id: {
				type: "integer"
			}
		},
		url: "/user/repos"
	},
	createFork: {
		method: "POST",
		params: {
			organization: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/forks"
	},
	createHook: {
		method: "POST",
		params: {
			active: {
				type: "boolean"
			},
			config: {
				required: true,
				type: "object"
			},
			"config.content_type": {
				type: "string"
			},
			"config.insecure_ssl": {
				type: "string"
			},
			"config.secret": {
				type: "string"
			},
			"config.url": {
				required: true,
				type: "string"
			},
			events: {
				type: "string[]"
			},
			name: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/hooks"
	},
	createInOrg: {
		method: "POST",
		params: {
			allow_merge_commit: {
				type: "boolean"
			},
			allow_rebase_merge: {
				type: "boolean"
			},
			allow_squash_merge: {
				type: "boolean"
			},
			auto_init: {
				type: "boolean"
			},
			description: {
				type: "string"
			},
			gitignore_template: {
				type: "string"
			},
			has_issues: {
				type: "boolean"
			},
			has_projects: {
				type: "boolean"
			},
			has_wiki: {
				type: "boolean"
			},
			homepage: {
				type: "string"
			},
			is_template: {
				type: "boolean"
			},
			license_template: {
				type: "string"
			},
			name: {
				required: true,
				type: "string"
			},
			org: {
				required: true,
				type: "string"
			},
			"private": {
				type: "boolean"
			},
			team_id: {
				type: "integer"
			}
		},
		url: "/orgs/:org/repos"
	},
	createOrUpdateFile: {
		method: "PUT",
		params: {
			author: {
				type: "object"
			},
			"author.email": {
				required: true,
				type: "string"
			},
			"author.name": {
				required: true,
				type: "string"
			},
			branch: {
				type: "string"
			},
			committer: {
				type: "object"
			},
			"committer.email": {
				required: true,
				type: "string"
			},
			"committer.name": {
				required: true,
				type: "string"
			},
			content: {
				required: true,
				type: "string"
			},
			message: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			path: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			sha: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/contents/:path"
	},
	createRelease: {
		method: "POST",
		params: {
			body: {
				type: "string"
			},
			draft: {
				type: "boolean"
			},
			name: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			prerelease: {
				type: "boolean"
			},
			repo: {
				required: true,
				type: "string"
			},
			tag_name: {
				required: true,
				type: "string"
			},
			target_commitish: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/releases"
	},
	createStatus: {
		method: "POST",
		params: {
			context: {
				type: "string"
			},
			description: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			sha: {
				required: true,
				type: "string"
			},
			state: {
				"enum": [
					"error",
					"failure",
					"pending",
					"success"
				],
				required: true,
				type: "string"
			},
			target_url: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/statuses/:sha"
	},
	createUsingTemplate: {
		headers: {
			accept: "application/vnd.github.baptiste-preview+json"
		},
		method: "POST",
		params: {
			description: {
				type: "string"
			},
			name: {
				required: true,
				type: "string"
			},
			owner: {
				type: "string"
			},
			"private": {
				type: "boolean"
			},
			template_owner: {
				required: true,
				type: "string"
			},
			template_repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:template_owner/:template_repo/generate"
	},
	declineInvitation: {
		method: "DELETE",
		params: {
			invitation_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/user/repository_invitations/:invitation_id"
	},
	"delete": {
		method: "DELETE",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo"
	},
	deleteCommitComment: {
		method: "DELETE",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/comments/:comment_id"
	},
	deleteDownload: {
		method: "DELETE",
		params: {
			download_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/downloads/:download_id"
	},
	deleteFile: {
		method: "DELETE",
		params: {
			author: {
				type: "object"
			},
			"author.email": {
				type: "string"
			},
			"author.name": {
				type: "string"
			},
			branch: {
				type: "string"
			},
			committer: {
				type: "object"
			},
			"committer.email": {
				type: "string"
			},
			"committer.name": {
				type: "string"
			},
			message: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			path: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			sha: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/contents/:path"
	},
	deleteHook: {
		method: "DELETE",
		params: {
			hook_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/hooks/:hook_id"
	},
	deleteInvitation: {
		method: "DELETE",
		params: {
			invitation_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/invitations/:invitation_id"
	},
	deleteRelease: {
		method: "DELETE",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			release_id: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/releases/:release_id"
	},
	deleteReleaseAsset: {
		method: "DELETE",
		params: {
			asset_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/releases/assets/:asset_id"
	},
	disableAutomatedSecurityFixes: {
		headers: {
			accept: "application/vnd.github.london-preview+json"
		},
		method: "DELETE",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/automated-security-fixes"
	},
	disablePagesSite: {
		headers: {
			accept: "application/vnd.github.switcheroo-preview+json"
		},
		method: "DELETE",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pages"
	},
	disableVulnerabilityAlerts: {
		headers: {
			accept: "application/vnd.github.dorian-preview+json"
		},
		method: "DELETE",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/vulnerability-alerts"
	},
	enableAutomatedSecurityFixes: {
		headers: {
			accept: "application/vnd.github.london-preview+json"
		},
		method: "PUT",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/automated-security-fixes"
	},
	enablePagesSite: {
		headers: {
			accept: "application/vnd.github.switcheroo-preview+json"
		},
		method: "POST",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			source: {
				type: "object"
			},
			"source.branch": {
				"enum": [
					"master",
					"gh-pages"
				],
				type: "string"
			},
			"source.path": {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pages"
	},
	enableVulnerabilityAlerts: {
		headers: {
			accept: "application/vnd.github.dorian-preview+json"
		},
		method: "PUT",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/vulnerability-alerts"
	},
	get: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo"
	},
	getArchiveLink: {
		method: "GET",
		params: {
			archive_format: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			ref: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/:archive_format/:ref"
	},
	getBranch: {
		method: "GET",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch"
	},
	getBranchProtection: {
		method: "GET",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection"
	},
	getClones: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			per: {
				"enum": [
					"day",
					"week"
				],
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/traffic/clones"
	},
	getCodeFrequencyStats: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/stats/code_frequency"
	},
	getCollaboratorPermissionLevel: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/collaborators/:username/permission"
	},
	getCombinedStatusForRef: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			ref: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/commits/:ref/status"
	},
	getCommit: {
		method: "GET",
		params: {
			commit_sha: {
				alias: "ref",
				deprecated: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			ref: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			sha: {
				alias: "commit_sha",
				deprecated: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/commits/:ref"
	},
	getCommitActivityStats: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/stats/commit_activity"
	},
	getCommitComment: {
		method: "GET",
		params: {
			comment_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/comments/:comment_id"
	},
	getCommitRefSha: {
		deprecated: "\"Get the SHA-1 of a commit reference\" will be removed. Use \"Get a single commit\" instead with media type format set to \"sha\" instead.",
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			ref: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/commits/:ref"
	},
	getContents: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			path: {
				required: true,
				type: "string"
			},
			ref: {
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/contents/:path"
	},
	getContributorsStats: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/stats/contributors"
	},
	getDeployKey: {
		method: "GET",
		params: {
			key_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/keys/:key_id"
	},
	getDeployment: {
		method: "GET",
		params: {
			deployment_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/deployments/:deployment_id"
	},
	getDeploymentStatus: {
		method: "GET",
		params: {
			deployment_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			status_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/repos/:owner/:repo/deployments/:deployment_id/statuses/:status_id"
	},
	getDownload: {
		method: "GET",
		params: {
			download_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/downloads/:download_id"
	},
	getHook: {
		method: "GET",
		params: {
			hook_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/hooks/:hook_id"
	},
	getLatestPagesBuild: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pages/builds/latest"
	},
	getLatestRelease: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/releases/latest"
	},
	getPages: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pages"
	},
	getPagesBuild: {
		method: "GET",
		params: {
			build_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pages/builds/:build_id"
	},
	getParticipationStats: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/stats/participation"
	},
	getProtectedBranchAdminEnforcement: {
		method: "GET",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/enforce_admins"
	},
	getProtectedBranchPullRequestReviewEnforcement: {
		method: "GET",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_pull_request_reviews"
	},
	getProtectedBranchRequiredSignatures: {
		headers: {
			accept: "application/vnd.github.zzzax-preview+json"
		},
		method: "GET",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_signatures"
	},
	getProtectedBranchRequiredStatusChecks: {
		method: "GET",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks"
	},
	getProtectedBranchRestrictions: {
		method: "GET",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/restrictions"
	},
	getPunchCardStats: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/stats/punch_card"
	},
	getReadme: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			ref: {
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/readme"
	},
	getRelease: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			release_id: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/releases/:release_id"
	},
	getReleaseAsset: {
		method: "GET",
		params: {
			asset_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/releases/assets/:asset_id"
	},
	getReleaseByTag: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			tag: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/releases/tags/:tag"
	},
	getTopPaths: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/traffic/popular/paths"
	},
	getTopReferrers: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/traffic/popular/referrers"
	},
	getViews: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			per: {
				"enum": [
					"day",
					"week"
				],
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/traffic/views"
	},
	list: {
		method: "GET",
		params: {
			affiliation: {
				type: "string"
			},
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			sort: {
				"enum": [
					"created",
					"updated",
					"pushed",
					"full_name"
				],
				type: "string"
			},
			type: {
				"enum": [
					"all",
					"owner",
					"public",
					"private",
					"member"
				],
				type: "string"
			},
			visibility: {
				"enum": [
					"all",
					"public",
					"private"
				],
				type: "string"
			}
		},
		url: "/user/repos"
	},
	listAssetsForRelease: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			release_id: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/releases/:release_id/assets"
	},
	listBranches: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			"protected": {
				type: "boolean"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches"
	},
	listBranchesForHeadCommit: {
		headers: {
			accept: "application/vnd.github.groot-preview+json"
		},
		method: "GET",
		params: {
			commit_sha: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/commits/:commit_sha/branches-where-head"
	},
	listCollaborators: {
		method: "GET",
		params: {
			affiliation: {
				"enum": [
					"outside",
					"direct",
					"all"
				],
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/collaborators"
	},
	listCommentsForCommit: {
		method: "GET",
		params: {
			commit_sha: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			ref: {
				alias: "commit_sha",
				deprecated: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/commits/:commit_sha/comments"
	},
	listCommitComments: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/comments"
	},
	listCommits: {
		method: "GET",
		params: {
			author: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			path: {
				type: "string"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			sha: {
				type: "string"
			},
			since: {
				type: "string"
			},
			until: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/commits"
	},
	listContributors: {
		method: "GET",
		params: {
			anon: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/contributors"
	},
	listDeployKeys: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/keys"
	},
	listDeploymentStatuses: {
		method: "GET",
		params: {
			deployment_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/deployments/:deployment_id/statuses"
	},
	listDeployments: {
		method: "GET",
		params: {
			environment: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			ref: {
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			sha: {
				type: "string"
			},
			task: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/deployments"
	},
	listDownloads: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/downloads"
	},
	listForOrg: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			sort: {
				"enum": [
					"created",
					"updated",
					"pushed",
					"full_name"
				],
				type: "string"
			},
			type: {
				"enum": [
					"all",
					"public",
					"private",
					"forks",
					"sources",
					"member"
				],
				type: "string"
			}
		},
		url: "/orgs/:org/repos"
	},
	listForUser: {
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			sort: {
				"enum": [
					"created",
					"updated",
					"pushed",
					"full_name"
				],
				type: "string"
			},
			type: {
				"enum": [
					"all",
					"owner",
					"member"
				],
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/repos"
	},
	listForks: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			sort: {
				"enum": [
					"newest",
					"oldest",
					"stargazers"
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/forks"
	},
	listHooks: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/hooks"
	},
	listInvitations: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/invitations"
	},
	listInvitationsForAuthenticatedUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/repository_invitations"
	},
	listLanguages: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/languages"
	},
	listPagesBuilds: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pages/builds"
	},
	listProtectedBranchRequiredStatusChecksContexts: {
		method: "GET",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks/contexts"
	},
	listProtectedBranchTeamRestrictions: {
		method: "GET",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/teams"
	},
	listProtectedBranchUserRestrictions: {
		method: "GET",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/users"
	},
	listPublic: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			since: {
				type: "string"
			}
		},
		url: "/repositories"
	},
	listPullRequestsAssociatedWithCommit: {
		headers: {
			accept: "application/vnd.github.groot-preview+json"
		},
		method: "GET",
		params: {
			commit_sha: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/commits/:commit_sha/pulls"
	},
	listReleases: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/releases"
	},
	listStatusesForRef: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			ref: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/commits/:ref/statuses"
	},
	listTags: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/tags"
	},
	listTeams: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/teams"
	},
	listTopics: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/topics"
	},
	merge: {
		method: "POST",
		params: {
			base: {
				required: true,
				type: "string"
			},
			commit_message: {
				type: "string"
			},
			head: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/merges"
	},
	pingHook: {
		method: "POST",
		params: {
			hook_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/hooks/:hook_id/pings"
	},
	removeBranchProtection: {
		method: "DELETE",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection"
	},
	removeCollaborator: {
		method: "DELETE",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/collaborators/:username"
	},
	removeDeployKey: {
		method: "DELETE",
		params: {
			key_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/keys/:key_id"
	},
	removeProtectedBranchAdminEnforcement: {
		method: "DELETE",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/enforce_admins"
	},
	removeProtectedBranchPullRequestReviewEnforcement: {
		method: "DELETE",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_pull_request_reviews"
	},
	removeProtectedBranchRequiredSignatures: {
		headers: {
			accept: "application/vnd.github.zzzax-preview+json"
		},
		method: "DELETE",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_signatures"
	},
	removeProtectedBranchRequiredStatusChecks: {
		method: "DELETE",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks"
	},
	removeProtectedBranchRequiredStatusChecksContexts: {
		method: "DELETE",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			contexts: {
				mapTo: "data",
				required: true,
				type: "string[]"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks/contexts"
	},
	removeProtectedBranchRestrictions: {
		method: "DELETE",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/restrictions"
	},
	removeProtectedBranchTeamRestrictions: {
		method: "DELETE",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			teams: {
				mapTo: "data",
				required: true,
				type: "string[]"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/teams"
	},
	removeProtectedBranchUserRestrictions: {
		method: "DELETE",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			users: {
				mapTo: "data",
				required: true,
				type: "string[]"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/users"
	},
	replaceProtectedBranchRequiredStatusChecksContexts: {
		method: "PUT",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			contexts: {
				mapTo: "data",
				required: true,
				type: "string[]"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks/contexts"
	},
	replaceProtectedBranchTeamRestrictions: {
		method: "PUT",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			teams: {
				mapTo: "data",
				required: true,
				type: "string[]"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/teams"
	},
	replaceProtectedBranchUserRestrictions: {
		method: "PUT",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			users: {
				mapTo: "data",
				required: true,
				type: "string[]"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/users"
	},
	replaceTopics: {
		method: "PUT",
		params: {
			names: {
				required: true,
				type: "string[]"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/topics"
	},
	requestPageBuild: {
		headers: {
			accept: "application/vnd.github.mister-fantastic-preview+json"
		},
		method: "POST",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pages/builds"
	},
	retrieveCommunityProfileMetrics: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/community/profile"
	},
	testPushHook: {
		method: "POST",
		params: {
			hook_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/hooks/:hook_id/tests"
	},
	transfer: {
		headers: {
			accept: "application/vnd.github.nightshade-preview+json"
		},
		method: "POST",
		params: {
			new_owner: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			team_ids: {
				type: "integer[]"
			}
		},
		url: "/repos/:owner/:repo/transfer"
	},
	update: {
		method: "PATCH",
		params: {
			allow_merge_commit: {
				type: "boolean"
			},
			allow_rebase_merge: {
				type: "boolean"
			},
			allow_squash_merge: {
				type: "boolean"
			},
			archived: {
				type: "boolean"
			},
			default_branch: {
				type: "string"
			},
			description: {
				type: "string"
			},
			has_issues: {
				type: "boolean"
			},
			has_projects: {
				type: "boolean"
			},
			has_wiki: {
				type: "boolean"
			},
			homepage: {
				type: "string"
			},
			is_template: {
				type: "boolean"
			},
			name: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			"private": {
				type: "boolean"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo"
	},
	updateBranchProtection: {
		method: "PUT",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			enforce_admins: {
				allowNull: true,
				required: true,
				type: "boolean"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			required_pull_request_reviews: {
				allowNull: true,
				required: true,
				type: "object"
			},
			"required_pull_request_reviews.dismiss_stale_reviews": {
				type: "boolean"
			},
			"required_pull_request_reviews.dismissal_restrictions": {
				type: "object"
			},
			"required_pull_request_reviews.dismissal_restrictions.teams": {
				type: "string[]"
			},
			"required_pull_request_reviews.dismissal_restrictions.users": {
				type: "string[]"
			},
			"required_pull_request_reviews.require_code_owner_reviews": {
				type: "boolean"
			},
			"required_pull_request_reviews.required_approving_review_count": {
				type: "integer"
			},
			required_status_checks: {
				allowNull: true,
				required: true,
				type: "object"
			},
			"required_status_checks.contexts": {
				required: true,
				type: "string[]"
			},
			"required_status_checks.strict": {
				required: true,
				type: "boolean"
			},
			restrictions: {
				allowNull: true,
				required: true,
				type: "object"
			},
			"restrictions.teams": {
				type: "string[]"
			},
			"restrictions.users": {
				type: "string[]"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection"
	},
	updateCommitComment: {
		method: "PATCH",
		params: {
			body: {
				required: true,
				type: "string"
			},
			comment_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/comments/:comment_id"
	},
	updateFile: {
		deprecated: "octokit.repos.updateFile() has been renamed to octokit.repos.createOrUpdateFile() (2019-06-07)",
		method: "PUT",
		params: {
			author: {
				type: "object"
			},
			"author.email": {
				required: true,
				type: "string"
			},
			"author.name": {
				required: true,
				type: "string"
			},
			branch: {
				type: "string"
			},
			committer: {
				type: "object"
			},
			"committer.email": {
				required: true,
				type: "string"
			},
			"committer.name": {
				required: true,
				type: "string"
			},
			content: {
				required: true,
				type: "string"
			},
			message: {
				required: true,
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			path: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			sha: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/contents/:path"
	},
	updateHook: {
		method: "PATCH",
		params: {
			active: {
				type: "boolean"
			},
			add_events: {
				type: "string[]"
			},
			config: {
				type: "object"
			},
			"config.content_type": {
				type: "string"
			},
			"config.insecure_ssl": {
				type: "string"
			},
			"config.secret": {
				type: "string"
			},
			"config.url": {
				required: true,
				type: "string"
			},
			events: {
				type: "string[]"
			},
			hook_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			remove_events: {
				type: "string[]"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/hooks/:hook_id"
	},
	updateInformationAboutPagesSite: {
		method: "PUT",
		params: {
			cname: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			source: {
				"enum": [
					"\"gh-pages\"",
					"\"master\"",
					"\"master /docs\""
				],
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/pages"
	},
	updateInvitation: {
		method: "PATCH",
		params: {
			invitation_id: {
				required: true,
				type: "integer"
			},
			owner: {
				required: true,
				type: "string"
			},
			permissions: {
				"enum": [
					"read",
					"write",
					"admin"
				],
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/invitations/:invitation_id"
	},
	updateProtectedBranchPullRequestReviewEnforcement: {
		method: "PATCH",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			dismiss_stale_reviews: {
				type: "boolean"
			},
			dismissal_restrictions: {
				type: "object"
			},
			"dismissal_restrictions.teams": {
				type: "string[]"
			},
			"dismissal_restrictions.users": {
				type: "string[]"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			require_code_owner_reviews: {
				type: "boolean"
			},
			required_approving_review_count: {
				type: "integer"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_pull_request_reviews"
	},
	updateProtectedBranchRequiredStatusChecks: {
		method: "PATCH",
		params: {
			branch: {
				required: true,
				type: "string"
			},
			contexts: {
				type: "string[]"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			strict: {
				type: "boolean"
			}
		},
		url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks"
	},
	updateRelease: {
		method: "PATCH",
		params: {
			body: {
				type: "string"
			},
			draft: {
				type: "boolean"
			},
			name: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			prerelease: {
				type: "boolean"
			},
			release_id: {
				required: true,
				type: "integer"
			},
			repo: {
				required: true,
				type: "string"
			},
			tag_name: {
				type: "string"
			},
			target_commitish: {
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/releases/:release_id"
	},
	updateReleaseAsset: {
		method: "PATCH",
		params: {
			asset_id: {
				required: true,
				type: "integer"
			},
			label: {
				type: "string"
			},
			name: {
				type: "string"
			},
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			}
		},
		url: "/repos/:owner/:repo/releases/assets/:asset_id"
	},
	uploadReleaseAsset: {
		method: "POST",
		params: {
			file: {
				mapTo: "data",
				required: true,
				type: "string | object"
			},
			headers: {
				required: true,
				type: "object"
			},
			"headers.content-length": {
				required: true,
				type: "integer"
			},
			"headers.content-type": {
				required: true,
				type: "string"
			},
			label: {
				type: "string"
			},
			name: {
				required: true,
				type: "string"
			},
			url: {
				required: true,
				type: "string"
			}
		},
		url: ":url"
	}
};
var search = {
	code: {
		method: "GET",
		params: {
			order: {
				"enum": [
					"desc",
					"asc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			q: {
				required: true,
				type: "string"
			},
			sort: {
				"enum": [
					"indexed"
				],
				type: "string"
			}
		},
		url: "/search/code"
	},
	commits: {
		headers: {
			accept: "application/vnd.github.cloak-preview+json"
		},
		method: "GET",
		params: {
			order: {
				"enum": [
					"desc",
					"asc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			q: {
				required: true,
				type: "string"
			},
			sort: {
				"enum": [
					"author-date",
					"committer-date"
				],
				type: "string"
			}
		},
		url: "/search/commits"
	},
	issues: {
		deprecated: "octokit.search.issues() has been renamed to octokit.search.issuesAndPullRequests() (2018-12-27)",
		method: "GET",
		params: {
			order: {
				"enum": [
					"desc",
					"asc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			q: {
				required: true,
				type: "string"
			},
			sort: {
				"enum": [
					"comments",
					"reactions",
					"reactions-+1",
					"reactions--1",
					"reactions-smile",
					"reactions-thinking_face",
					"reactions-heart",
					"reactions-tada",
					"interactions",
					"created",
					"updated"
				],
				type: "string"
			}
		},
		url: "/search/issues"
	},
	issuesAndPullRequests: {
		method: "GET",
		params: {
			order: {
				"enum": [
					"desc",
					"asc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			q: {
				required: true,
				type: "string"
			},
			sort: {
				"enum": [
					"comments",
					"reactions",
					"reactions-+1",
					"reactions--1",
					"reactions-smile",
					"reactions-thinking_face",
					"reactions-heart",
					"reactions-tada",
					"interactions",
					"created",
					"updated"
				],
				type: "string"
			}
		},
		url: "/search/issues"
	},
	labels: {
		method: "GET",
		params: {
			order: {
				"enum": [
					"desc",
					"asc"
				],
				type: "string"
			},
			q: {
				required: true,
				type: "string"
			},
			repository_id: {
				required: true,
				type: "integer"
			},
			sort: {
				"enum": [
					"created",
					"updated"
				],
				type: "string"
			}
		},
		url: "/search/labels"
	},
	repos: {
		method: "GET",
		params: {
			order: {
				"enum": [
					"desc",
					"asc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			q: {
				required: true,
				type: "string"
			},
			sort: {
				"enum": [
					"stars",
					"forks",
					"help-wanted-issues",
					"updated"
				],
				type: "string"
			}
		},
		url: "/search/repositories"
	},
	topics: {
		method: "GET",
		params: {
			q: {
				required: true,
				type: "string"
			}
		},
		url: "/search/topics"
	},
	users: {
		method: "GET",
		params: {
			order: {
				"enum": [
					"desc",
					"asc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			q: {
				required: true,
				type: "string"
			},
			sort: {
				"enum": [
					"followers",
					"repositories",
					"joined"
				],
				type: "string"
			}
		},
		url: "/search/users"
	}
};
var teams = {
	addMember: {
		method: "PUT",
		params: {
			team_id: {
				required: true,
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/teams/:team_id/members/:username"
	},
	addOrUpdateMembership: {
		method: "PUT",
		params: {
			role: {
				"enum": [
					"member",
					"maintainer"
				],
				type: "string"
			},
			team_id: {
				required: true,
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/teams/:team_id/memberships/:username"
	},
	addOrUpdateProject: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "PUT",
		params: {
			permission: {
				"enum": [
					"read",
					"write",
					"admin"
				],
				type: "string"
			},
			project_id: {
				required: true,
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/projects/:project_id"
	},
	addOrUpdateRepo: {
		method: "PUT",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			permission: {
				"enum": [
					"pull",
					"push",
					"admin"
				],
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/repos/:owner/:repo"
	},
	checkManagesRepo: {
		method: "GET",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/repos/:owner/:repo"
	},
	create: {
		method: "POST",
		params: {
			description: {
				type: "string"
			},
			maintainers: {
				type: "string[]"
			},
			name: {
				required: true,
				type: "string"
			},
			org: {
				required: true,
				type: "string"
			},
			parent_team_id: {
				type: "integer"
			},
			permission: {
				"enum": [
					"pull",
					"push",
					"admin"
				],
				type: "string"
			},
			privacy: {
				"enum": [
					"secret",
					"closed"
				],
				type: "string"
			},
			repo_names: {
				type: "string[]"
			}
		},
		url: "/orgs/:org/teams"
	},
	createDiscussion: {
		headers: {
			accept: "application/vnd.github.echo-preview+json"
		},
		method: "POST",
		params: {
			body: {
				required: true,
				type: "string"
			},
			"private": {
				type: "boolean"
			},
			team_id: {
				required: true,
				type: "integer"
			},
			title: {
				required: true,
				type: "string"
			}
		},
		url: "/teams/:team_id/discussions"
	},
	createDiscussionComment: {
		headers: {
			accept: "application/vnd.github.echo-preview+json"
		},
		method: "POST",
		params: {
			body: {
				required: true,
				type: "string"
			},
			discussion_number: {
				required: true,
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/discussions/:discussion_number/comments"
	},
	"delete": {
		method: "DELETE",
		params: {
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id"
	},
	deleteDiscussion: {
		headers: {
			accept: "application/vnd.github.echo-preview+json"
		},
		method: "DELETE",
		params: {
			discussion_number: {
				required: true,
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/discussions/:discussion_number"
	},
	deleteDiscussionComment: {
		headers: {
			accept: "application/vnd.github.echo-preview+json"
		},
		method: "DELETE",
		params: {
			comment_number: {
				required: true,
				type: "integer"
			},
			discussion_number: {
				required: true,
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number"
	},
	get: {
		method: "GET",
		params: {
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id"
	},
	getByName: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			team_slug: {
				required: true,
				type: "string"
			}
		},
		url: "/orgs/:org/teams/:team_slug"
	},
	getDiscussion: {
		headers: {
			accept: "application/vnd.github.echo-preview+json"
		},
		method: "GET",
		params: {
			discussion_number: {
				required: true,
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/discussions/:discussion_number"
	},
	getDiscussionComment: {
		headers: {
			accept: "application/vnd.github.echo-preview+json"
		},
		method: "GET",
		params: {
			comment_number: {
				required: true,
				type: "integer"
			},
			discussion_number: {
				required: true,
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number"
	},
	getMember: {
		method: "GET",
		params: {
			team_id: {
				required: true,
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/teams/:team_id/members/:username"
	},
	getMembership: {
		method: "GET",
		params: {
			team_id: {
				required: true,
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/teams/:team_id/memberships/:username"
	},
	list: {
		method: "GET",
		params: {
			org: {
				required: true,
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/orgs/:org/teams"
	},
	listChild: {
		headers: {
			accept: "application/vnd.github.hellcat-preview+json"
		},
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/teams"
	},
	listDiscussionComments: {
		headers: {
			accept: "application/vnd.github.echo-preview+json"
		},
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			discussion_number: {
				required: true,
				type: "integer"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/discussions/:discussion_number/comments"
	},
	listDiscussions: {
		headers: {
			accept: "application/vnd.github.echo-preview+json"
		},
		method: "GET",
		params: {
			direction: {
				"enum": [
					"asc",
					"desc"
				],
				type: "string"
			},
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/discussions"
	},
	listForAuthenticatedUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/teams"
	},
	listMembers: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			role: {
				"enum": [
					"member",
					"maintainer",
					"all"
				],
				type: "string"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/members"
	},
	listPendingInvitations: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/invitations"
	},
	listProjects: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/projects"
	},
	listRepos: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/repos"
	},
	removeMember: {
		method: "DELETE",
		params: {
			team_id: {
				required: true,
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/teams/:team_id/members/:username"
	},
	removeMembership: {
		method: "DELETE",
		params: {
			team_id: {
				required: true,
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/teams/:team_id/memberships/:username"
	},
	removeProject: {
		method: "DELETE",
		params: {
			project_id: {
				required: true,
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/projects/:project_id"
	},
	removeRepo: {
		method: "DELETE",
		params: {
			owner: {
				required: true,
				type: "string"
			},
			repo: {
				required: true,
				type: "string"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/repos/:owner/:repo"
	},
	reviewProject: {
		headers: {
			accept: "application/vnd.github.inertia-preview+json"
		},
		method: "GET",
		params: {
			project_id: {
				required: true,
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/projects/:project_id"
	},
	update: {
		method: "PATCH",
		params: {
			description: {
				type: "string"
			},
			name: {
				required: true,
				type: "string"
			},
			parent_team_id: {
				type: "integer"
			},
			permission: {
				"enum": [
					"pull",
					"push",
					"admin"
				],
				type: "string"
			},
			privacy: {
				type: "string"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id"
	},
	updateDiscussion: {
		headers: {
			accept: "application/vnd.github.echo-preview+json"
		},
		method: "PATCH",
		params: {
			body: {
				type: "string"
			},
			discussion_number: {
				required: true,
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			},
			title: {
				type: "string"
			}
		},
		url: "/teams/:team_id/discussions/:discussion_number"
	},
	updateDiscussionComment: {
		headers: {
			accept: "application/vnd.github.echo-preview+json"
		},
		method: "PATCH",
		params: {
			body: {
				required: true,
				type: "string"
			},
			comment_number: {
				required: true,
				type: "integer"
			},
			discussion_number: {
				required: true,
				type: "integer"
			},
			team_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number"
	}
};
var users = {
	addEmails: {
		method: "POST",
		params: {
			emails: {
				required: true,
				type: "string[]"
			}
		},
		url: "/user/emails"
	},
	block: {
		method: "PUT",
		params: {
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/user/blocks/:username"
	},
	checkBlocked: {
		method: "GET",
		params: {
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/user/blocks/:username"
	},
	checkFollowing: {
		method: "GET",
		params: {
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/user/following/:username"
	},
	checkFollowingForUser: {
		method: "GET",
		params: {
			target_user: {
				required: true,
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/following/:target_user"
	},
	createGpgKey: {
		method: "POST",
		params: {
			armored_public_key: {
				type: "string"
			}
		},
		url: "/user/gpg_keys"
	},
	createPublicKey: {
		method: "POST",
		params: {
			key: {
				type: "string"
			},
			title: {
				type: "string"
			}
		},
		url: "/user/keys"
	},
	deleteEmails: {
		method: "DELETE",
		params: {
			emails: {
				required: true,
				type: "string[]"
			}
		},
		url: "/user/emails"
	},
	deleteGpgKey: {
		method: "DELETE",
		params: {
			gpg_key_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/user/gpg_keys/:gpg_key_id"
	},
	deletePublicKey: {
		method: "DELETE",
		params: {
			key_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/user/keys/:key_id"
	},
	follow: {
		method: "PUT",
		params: {
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/user/following/:username"
	},
	getAuthenticated: {
		method: "GET",
		params: {
		},
		url: "/user"
	},
	getByUsername: {
		method: "GET",
		params: {
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username"
	},
	getContextForUser: {
		headers: {
			accept: "application/vnd.github.hagar-preview+json"
		},
		method: "GET",
		params: {
			subject_id: {
				type: "string"
			},
			subject_type: {
				"enum": [
					"organization",
					"repository",
					"issue",
					"pull_request"
				],
				type: "string"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/hovercard"
	},
	getGpgKey: {
		method: "GET",
		params: {
			gpg_key_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/user/gpg_keys/:gpg_key_id"
	},
	getPublicKey: {
		method: "GET",
		params: {
			key_id: {
				required: true,
				type: "integer"
			}
		},
		url: "/user/keys/:key_id"
	},
	list: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			since: {
				type: "string"
			}
		},
		url: "/users"
	},
	listBlocked: {
		method: "GET",
		params: {
		},
		url: "/user/blocks"
	},
	listEmails: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/emails"
	},
	listFollowersForAuthenticatedUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/followers"
	},
	listFollowersForUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/followers"
	},
	listFollowingForAuthenticatedUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/following"
	},
	listFollowingForUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/following"
	},
	listGpgKeys: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/gpg_keys"
	},
	listGpgKeysForUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/gpg_keys"
	},
	listPublicEmails: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/public_emails"
	},
	listPublicKeys: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			}
		},
		url: "/user/keys"
	},
	listPublicKeysForUser: {
		method: "GET",
		params: {
			page: {
				type: "integer"
			},
			per_page: {
				type: "integer"
			},
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/users/:username/keys"
	},
	togglePrimaryEmailVisibility: {
		method: "PATCH",
		params: {
			email: {
				required: true,
				type: "string"
			},
			visibility: {
				required: true,
				type: "string"
			}
		},
		url: "/user/email/visibility"
	},
	unblock: {
		method: "DELETE",
		params: {
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/user/blocks/:username"
	},
	unfollow: {
		method: "DELETE",
		params: {
			username: {
				required: true,
				type: "string"
			}
		},
		url: "/user/following/:username"
	},
	updateAuthenticated: {
		method: "PATCH",
		params: {
			bio: {
				type: "string"
			},
			blog: {
				type: "string"
			},
			company: {
				type: "string"
			},
			email: {
				type: "string"
			},
			hireable: {
				type: "boolean"
			},
			location: {
				type: "string"
			},
			name: {
				type: "string"
			}
		},
		url: "/user"
	}
};
var routes = {
	activity: activity,
	apps: apps,
	checks: checks,
	codesOfConduct: codesOfConduct,
	emojis: emojis,
	gists: gists,
	git: git,
	gitignore: gitignore,
	interactions: interactions,
	issues: issues,
	licenses: licenses,
	markdown: markdown,
	meta: meta,
	migrations: migrations,
	oauthAuthorizations: oauthAuthorizations,
	orgs: orgs,
	projects: projects,
	pulls: pulls,
	rateLimit: rateLimit,
	reactions: reactions,
	repos: repos,
	search: search,
	teams: teams,
	users: users
};

var routes$1 = /*#__PURE__*/Object.freeze({
	activity: activity,
	apps: apps,
	checks: checks,
	codesOfConduct: codesOfConduct,
	emojis: emojis,
	gists: gists,
	git: git,
	gitignore: gitignore,
	interactions: interactions,
	issues: issues,
	licenses: licenses,
	markdown: markdown,
	meta: meta,
	migrations: migrations,
	oauthAuthorizations: oauthAuthorizations,
	orgs: orgs,
	projects: projects,
	pulls: pulls,
	rateLimit: rateLimit,
	reactions: reactions,
	repos: repos,
	search: search,
	teams: teams,
	users: users,
	'default': routes
});

var ROUTES = getCjsExportFromNamespace(routes$1);

var restApiEndpoints = octokitRestApiEndpoints;



function octokitRestApiEndpoints (octokit) {
  // Aliasing scopes for backward compatibility
  // See https://github.com/octokit/rest.js/pull/1134
  ROUTES.gitdata = ROUTES.git;
  ROUTES.authorization = ROUTES.oauthAuthorizations;
  ROUTES.pullRequests = ROUTES.pulls;

  octokit.registerEndpoints(ROUTES);
}

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0;

/** `Object#toString` result references. */
var funcTag$1 = '[object Function]',
    genTag$1 = '[object GeneratorFunction]',
    symbolTag = '[object Symbol]';

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    reLeadingDot = /^\./,
    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar$1 = /[\\^$.*+?()[\]{}|]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor$1 = /^\[object .+?Constructor\]$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf$1 = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$1 = freeGlobal$1 || freeSelf$1 || Function('return this')();

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue$1(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject$1(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/** Used for built-in method references. */
var arrayProto$1 = Array.prototype,
    funcProto$1 = Function.prototype,
    objectProto$1 = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData$1 = root$1['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey$1 = (function() {
  var uid = /[^.]+$/.exec(coreJsData$1 && coreJsData$1.keys && coreJsData$1.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$1 = objectProto$1.toString;

/** Used to detect if a method is native. */
var reIsNative$1 = RegExp('^' +
  funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar$1, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol$1 = root$1.Symbol,
    splice$1 = arrayProto$1.splice;

/* Built-in method references that are verified to be native. */
var Map$2 = getNative$1(root$1, 'Map'),
    nativeCreate$1 = getNative$1(Object, 'create');

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash$1(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear$1() {
  this.__data__ = nativeCreate$1 ? nativeCreate$1(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete$1(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet$1(key) {
  var data = this.__data__;
  if (nativeCreate$1) {
    var result = data[key];
    return result === HASH_UNDEFINED$1 ? undefined : result;
  }
  return hasOwnProperty$1.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas$1(key) {
  var data = this.__data__;
  return nativeCreate$1 ? data[key] !== undefined : hasOwnProperty$1.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet$1(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate$1 && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

// Add methods to `Hash`.
Hash$1.prototype.clear = hashClear$1;
Hash$1.prototype['delete'] = hashDelete$1;
Hash$1.prototype.get = hashGet$1;
Hash$1.prototype.has = hashHas$1;
Hash$1.prototype.set = hashSet$1;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache$1(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear$1() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete$1(key) {
  var data = this.__data__,
      index = assocIndexOf$1(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice$1.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet$1(key) {
  var data = this.__data__,
      index = assocIndexOf$1(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas$1(key) {
  return assocIndexOf$1(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet$1(key, value) {
  var data = this.__data__,
      index = assocIndexOf$1(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache$1.prototype.clear = listCacheClear$1;
ListCache$1.prototype['delete'] = listCacheDelete$1;
ListCache$1.prototype.get = listCacheGet$1;
ListCache$1.prototype.has = listCacheHas$1;
ListCache$1.prototype.set = listCacheSet$1;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache$1(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear$1() {
  this.__data__ = {
    'hash': new Hash$1,
    'map': new (Map$2 || ListCache$1),
    'string': new Hash$1
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete$1(key) {
  return getMapData$1(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet$1(key) {
  return getMapData$1(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas$1(key) {
  return getMapData$1(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet$1(key, value) {
  getMapData$1(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache$1.prototype.clear = mapCacheClear$1;
MapCache$1.prototype['delete'] = mapCacheDelete$1;
MapCache$1.prototype.get = mapCacheGet$1;
MapCache$1.prototype.has = mapCacheHas$1;
MapCache$1.prototype.set = mapCacheSet$1;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf$1(array, key) {
  var length = array.length;
  while (length--) {
    if (eq$1(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative$1(value) {
  if (!isObject$2(value) || isMasked$1(value)) {
    return false;
  }
  var pattern = (isFunction$1(value) || isHostObject$1(value)) ? reIsNative$1 : reIsHostCtor$1;
  return pattern.test(toSource$1(value));
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData$1(map, key) {
  var data = map.__data__;
  return isKeyable$1(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative$1(object, key) {
  var value = getValue$1(object, key);
  return baseIsNative$1(value) ? value : undefined;
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable$1(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked$1(func) {
  return !!maskSrcKey$1 && (maskSrcKey$1 in func);
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoize(function(string) {
  string = toString(string);

  var result = [];
  if (reLeadingDot.test(string)) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource$1(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache$1);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache$1;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq$1(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction$1(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject$2(value) ? objectToString$1.call(value) : '';
  return tag == funcTag$1 || tag == genTag$1;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$2(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString$1.call(value) == symbolTag);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

var lodash_get = get;

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT$1 = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var INFINITY$2 = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var funcTag$2 = '[object Function]',
    genTag$2 = '[object GeneratorFunction]',
    symbolTag$1 = '[object Symbol]';

/** Used to match property names within property paths. */
var reIsDeepProp$1 = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp$1 = /^\w*$/,
    reLeadingDot$1 = /^\./,
    rePropName$1 = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar$2 = /[\\^$.*+?()[\]{}|]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar$1 = /\\(\\)?/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor$2 = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal$2 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf$2 = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$2 = freeGlobal$2 || freeSelf$2 || Function('return this')();

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue$2(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject$2(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/** Used for built-in method references. */
var arrayProto$2 = Array.prototype,
    funcProto$2 = Function.prototype,
    objectProto$2 = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData$2 = root$2['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey$2 = (function() {
  var uid = /[^.]+$/.exec(coreJsData$2 && coreJsData$2.keys && coreJsData$2.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString$2 = funcProto$2.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$2 = objectProto$2.toString;

/** Used to detect if a method is native. */
var reIsNative$2 = RegExp('^' +
  funcToString$2.call(hasOwnProperty$2).replace(reRegExpChar$2, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol$2 = root$2.Symbol,
    splice$2 = arrayProto$2.splice;

/* Built-in method references that are verified to be native. */
var Map$3 = getNative$2(root$2, 'Map'),
    nativeCreate$2 = getNative$2(Object, 'create');

/** Used to convert symbols to primitives and strings. */
var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : undefined,
    symbolToString$1 = symbolProto$1 ? symbolProto$1.toString : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash$2(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear$2() {
  this.__data__ = nativeCreate$2 ? nativeCreate$2(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete$2(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet$2(key) {
  var data = this.__data__;
  if (nativeCreate$2) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? undefined : result;
  }
  return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas$2(key) {
  var data = this.__data__;
  return nativeCreate$2 ? data[key] !== undefined : hasOwnProperty$2.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet$2(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate$2 && value === undefined) ? HASH_UNDEFINED$2 : value;
  return this;
}

// Add methods to `Hash`.
Hash$2.prototype.clear = hashClear$2;
Hash$2.prototype['delete'] = hashDelete$2;
Hash$2.prototype.get = hashGet$2;
Hash$2.prototype.has = hashHas$2;
Hash$2.prototype.set = hashSet$2;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache$2(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear$2() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete$2(key) {
  var data = this.__data__,
      index = assocIndexOf$2(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice$2.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet$2(key) {
  var data = this.__data__,
      index = assocIndexOf$2(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas$2(key) {
  return assocIndexOf$2(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet$2(key, value) {
  var data = this.__data__,
      index = assocIndexOf$2(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache$2.prototype.clear = listCacheClear$2;
ListCache$2.prototype['delete'] = listCacheDelete$2;
ListCache$2.prototype.get = listCacheGet$2;
ListCache$2.prototype.has = listCacheHas$2;
ListCache$2.prototype.set = listCacheSet$2;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache$2(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear$2() {
  this.__data__ = {
    'hash': new Hash$2,
    'map': new (Map$3 || ListCache$2),
    'string': new Hash$2
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete$2(key) {
  return getMapData$2(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet$2(key) {
  return getMapData$2(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas$2(key) {
  return getMapData$2(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet$2(key, value) {
  getMapData$2(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache$2.prototype.clear = mapCacheClear$2;
MapCache$2.prototype['delete'] = mapCacheDelete$2;
MapCache$2.prototype.get = mapCacheGet$2;
MapCache$2.prototype.has = mapCacheHas$2;
MapCache$2.prototype.set = mapCacheSet$2;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$2.call(object, key) && eq$2(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf$2(array, key) {
  var length = array.length;
  while (length--) {
    if (eq$2(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative$2(value) {
  if (!isObject$3(value) || isMasked$2(value)) {
    return false;
  }
  var pattern = (isFunction$2(value) || isHostObject$2(value)) ? reIsNative$2 : reIsHostCtor$2;
  return pattern.test(toSource$2(value));
}

/**
 * The base implementation of `_.set`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseSet(object, path, value, customizer) {
  if (!isObject$3(object)) {
    return object;
  }
  path = isKey$1(path, object) ? [path] : castPath$1(path);

  var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

  while (nested != null && ++index < length) {
    var key = toKey$1(path[index]),
        newValue = value;

    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = isObject$3(objValue)
          ? objValue
          : (isIndex(path[index + 1]) ? [] : {});
      }
    }
    assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString$1(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol$1(value)) {
    return symbolToString$1 ? symbolToString$1.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$2) ? '-0' : result;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath$1(value) {
  return isArray$1(value) ? value : stringToPath$1(value);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData$2(map, key) {
  var data = map.__data__;
  return isKeyable$2(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative$2(object, key) {
  var value = getValue$2(object, key);
  return baseIsNative$2(value) ? value : undefined;
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey$1(value, object) {
  if (isArray$1(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol$1(value)) {
    return true;
  }
  return reIsPlainProp$1.test(value) || !reIsDeepProp$1.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable$2(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked$2(func) {
  return !!maskSrcKey$2 && (maskSrcKey$2 in func);
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath$1 = memoize$1(function(string) {
  string = toString$1(string);

  var result = [];
  if (reLeadingDot$1.test(string)) {
    result.push('');
  }
  string.replace(rePropName$1, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar$1, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey$1(value) {
  if (typeof value == 'string' || isSymbol$1(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$2) ? '-0' : result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource$2(func) {
  if (func != null) {
    try {
      return funcToString$2.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize$1(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize$1.Cache || MapCache$2);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize$1.Cache = MapCache$2;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq$2(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray$1 = Array.isArray;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction$2(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject$3(value) ? objectToString$2.call(value) : '';
  return tag == funcTag$2 || tag == genTag$2;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$3(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$1(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$1(value) {
  return typeof value == 'symbol' ||
    (isObjectLike$1(value) && objectToString$2.call(value) == symbolTag$1);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString$1(value) {
  return value == null ? '' : baseToString$1(value);
}

/**
 * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
 * it's created. Arrays are created for missing index properties while objects
 * are created for all other missing properties. Use `_.setWith` to customize
 * `path` creation.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.set(object, 'a[0].b.c', 4);
 * console.log(object.a[0].b.c);
 * // => 4
 *
 * _.set(object, ['x', '0', 'y', 'z'], 5);
 * console.log(object.x[0].y.z);
 * // => 5
 */
function set(object, path, value) {
  return object == null ? object : baseSet(object, path, value);
}

var lodash_set = set;

var validate_1 = validate$1;

const { RequestError: RequestError$4 } = distWeb$1;



function validate$1 (octokit, options) {
  if (!options.request.validate) {
    return
  }
  const { validate: params } = options.request;

  Object.keys(params).forEach(parameterName => {
    const parameter = lodash_get(params, parameterName);

    const expectedType = parameter.type;
    let parentParameterName;
    let parentValue;
    let parentParamIsPresent = true;
    let parentParameterIsArray = false;

    if (/\./.test(parameterName)) {
      parentParameterName = parameterName.replace(/\.[^.]+$/, '');
      parentParameterIsArray = parentParameterName.slice(-2) === '[]';
      if (parentParameterIsArray) {
        parentParameterName = parentParameterName.slice(0, -2);
      }
      parentValue = lodash_get(options, parentParameterName);
      parentParamIsPresent = parentParameterName === 'headers' || (typeof parentValue === 'object' && parentValue !== null);
    }

    const values = parentParameterIsArray
      ? (lodash_get(options, parentParameterName) || []).map(value => value[parameterName.split(/\./).pop()])
      : [lodash_get(options, parameterName)];

    values.forEach((value, i) => {
      const valueIsPresent = typeof value !== 'undefined';
      const valueIsNull = value === null;
      const currentParameterName = parentParameterIsArray
        ? parameterName.replace(/\[\]/, `[${i}]`)
        : parameterName;

      if (!parameter.required && !valueIsPresent) {
        return
      }

      // if the parent parameter is of type object but allows null
      // then the child parameters can be ignored
      if (!parentParamIsPresent) {
        return
      }

      if (parameter.allowNull && valueIsNull) {
        return
      }

      if (!parameter.allowNull && valueIsNull) {
        throw new RequestError$4(`'${currentParameterName}' cannot be null`, 400, {
          request: options
        })
      }

      if (parameter.required && !valueIsPresent) {
        throw new RequestError$4(`Empty value for parameter '${currentParameterName}': ${JSON.stringify(value)}`, 400, {
          request: options
        })
      }

      // parse to integer before checking for enum
      // so that string "1" will match enum with number 1
      if (expectedType === 'integer') {
        const unparsedValue = value;
        value = parseInt(value, 10);
        if (isNaN(value)) {
          throw new RequestError$4(`Invalid value for parameter '${currentParameterName}': ${JSON.stringify(unparsedValue)} is NaN`, 400, {
            request: options
          })
        }
      }

      if (parameter.enum && parameter.enum.indexOf(value) === -1) {
        throw new RequestError$4(`Invalid value for parameter '${currentParameterName}': ${JSON.stringify(value)}`, 400, {
          request: options
        })
      }

      if (parameter.validation) {
        const regex = new RegExp(parameter.validation);
        if (!regex.test(value)) {
          throw new RequestError$4(`Invalid value for parameter '${currentParameterName}': ${JSON.stringify(value)}`, 400, {
            request: options
          })
        }
      }

      if (expectedType === 'object' && typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch (exception) {
          throw new RequestError$4(`JSON parse error of value for parameter '${currentParameterName}': ${JSON.stringify(value)}`, 400, {
            request: options
          })
        }
      }

      lodash_set(options, parameter.mapTo || currentParameterName, value);
    });
  });

  return options
}

var validate_1$1 = octokitValidate;



function octokitValidate (octokit) {
  octokit.hook.before('request', validate_1.bind(null, octokit));
}

var deprecate_1 = deprecate;

const loggedMessages = {};

function deprecate (message) {
  if (loggedMessages[message]) {
    return
  }

  console.warn(`DEPRECATED (@octokit/rest): ${message}`);
  loggedMessages[message] = 1;
}

var getPageLinks_1 = getPageLinks;

function getPageLinks (link) {
  link = link.link || link.headers.link || '';

  const links = {};

  // link format:
  // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
  link.replace(/<([^>]*)>;\s*rel="([\w]*)"/g, (m, uri, type) => {
    links[type] = uri;
  });

  return links
}

var httpError = class HttpError extends Error {
  constructor (message, code, headers) {
    super(message);

    // Maintains proper stack trace (only available on V8)
    /* istanbul ignore next */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = 'HttpError';
    this.code = code;
    this.headers = headers;
  }
};

var getPage_1 = getPage;





function getPage (octokit, link, which, headers) {
  deprecate_1(`octokit.get${which.charAt(0).toUpperCase() + which.slice(1)}Page() – You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
  const url = getPageLinks_1(link)[which];

  if (!url) {
    const urlError = new httpError(`No ${which} page found`, 404);
    return Promise.reject(urlError)
  }

  const requestOptions = {
    url,
    headers: applyAcceptHeader(link, headers)
  };

  const promise = octokit.request(requestOptions);

  return promise
}

function applyAcceptHeader (res, headers) {
  const previous = res.headers && res.headers['x-github-media-type'];

  if (!previous || (headers && headers.accept)) {
    return headers
  }
  headers = headers || {};
  headers.accept = 'application/vnd.' + previous
    .replace('; param=', '.')
    .replace('; format=', '+');

  return headers
}

var getFirstPage_1 = getFirstPage;



function getFirstPage (octokit, link, headers) {
  return getPage_1(octokit, link, 'first', headers)
}

var getLastPage_1 = getLastPage;



function getLastPage (octokit, link, headers) {
  return getPage_1(octokit, link, 'last', headers)
}

var getNextPage_1 = getNextPage;



function getNextPage (octokit, link, headers) {
  return getPage_1(octokit, link, 'next', headers)
}

var getPreviousPage_1 = getPreviousPage;



function getPreviousPage (octokit, link, headers) {
  return getPage_1(octokit, link, 'prev', headers)
}

var hasFirstPage_1 = hasFirstPage;




function hasFirstPage (link) {
  deprecate_1(`octokit.hasFirstPage() – You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
  return getPageLinks_1(link).first
}

var hasLastPage_1 = hasLastPage;




function hasLastPage (link) {
  deprecate_1(`octokit.hasLastPage() – You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
  return getPageLinks_1(link).last
}

var hasNextPage_1 = hasNextPage;




function hasNextPage (link) {
  deprecate_1(`octokit.hasNextPage() – You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
  return getPageLinks_1(link).next
}

var hasPreviousPage_1 = hasPreviousPage;




function hasPreviousPage (link) {
  deprecate_1(`octokit.hasPreviousPage() – You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
  return getPageLinks_1(link).prev
}

var octokitPaginationMethods = paginationMethodsPlugin;

function paginationMethodsPlugin (octokit) {
  octokit.getFirstPage = getFirstPage_1.bind(null, octokit);
  octokit.getLastPage = getLastPage_1.bind(null, octokit);
  octokit.getNextPage = getNextPage_1.bind(null, octokit);
  octokit.getPreviousPage = getPreviousPage_1.bind(null, octokit);
  octokit.hasFirstPage = hasFirstPage_1;
  octokit.hasLastPage = hasLastPage_1;
  octokit.hasNextPage = hasNextPage_1;
  octokit.hasPreviousPage = hasPreviousPage_1;
}

const CORE_PLUGINS = [
  log,
  authenticationDeprecated, // deprecated: remove in v17
  authentication,
  pagination,
  normalizeGitReferenceResponses,
  registerEndpoints_1$1,
  restApiEndpoints,
  validate_1$1,

  octokitPaginationMethods // deprecated: remove in v17
];

var rest = core$2.plugin(CORE_PLUGINS);

var context = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


class Context {
    /**
     * Hydrate the context from the environment
     */
    constructor() {
        this.payload = {};
        if (process.env.GITHUB_EVENT_PATH) {
            if (fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
                this.payload = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' }));
            }
            else {
                process.stdout.write(`GITHUB_EVENT_PATH ${process.env.GITHUB_EVENT_PATH} does not exist${os.EOL}`);
            }
        }
        this.eventName = process.env.GITHUB_EVENT_NAME;
        this.sha = process.env.GITHUB_SHA;
        this.ref = process.env.GITHUB_REF;
        this.workflow = process.env.GITHUB_WORKFLOW;
        this.action = process.env.GITHUB_ACTION;
        this.actor = process.env.GITHUB_ACTOR;
    }
    get issue() {
        const payload = this.payload;
        return Object.assign(Object.assign({}, this.repo), { number: (payload.issue || payload.pullRequest || payload).number });
    }
    get repo() {
        if (process.env.GITHUB_REPOSITORY) {
            const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
            return { owner, repo };
        }
        if (this.payload.repository) {
            return {
                owner: this.payload.repository.owner.login,
                repo: this.payload.repository.name
            };
        }
        throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
    }
}
exports.Context = Context;

});

unwrapExports(context);
var context_1 = context.Context;

var github = createCommonjsModule(function (module, exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Originally pulled from https://github.com/JasonEtco/actions-toolkit/blob/master/src/github.ts

const rest_1 = __importDefault(rest);
const Context = __importStar(context);
// We need this in order to extend Octokit
rest_1.default.prototype = new rest_1.default();
exports.context = new Context.Context();
class GitHub extends rest_1.default {
    constructor(token, opts = {}) {
        super(Object.assign(Object.assign({}, opts), { auth: `token ${token}` }));
        this.graphql = graphql$1.defaults({
            headers: { authorization: `token ${token}` }
        });
    }
}
exports.GitHub = GitHub;

});

unwrapExports(github);
var github_1 = github.context;
var github_2 = github.GitHub;

var safeBuffer = createCommonjsModule(function (module, exports) {
/* eslint-disable node/no-deprecated-api */

var Buffer = buffer$1.Buffer;

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer$1;
} else {
  // Copy properties from require('buffer')
  copyProps(buffer$1, exports);
  exports.Buffer = SafeBuffer;
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype);

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer);

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
};

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size);
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }
  return buf
};

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
};

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer$1.SlowBuffer(size)
};
});
var safeBuffer_1 = safeBuffer.Buffer;

/*global module, process*/
var Buffer$1 = safeBuffer.Buffer;



function DataStream(data) {
  this.buffer = null;
  this.writable = true;
  this.readable = true;

  // No input
  if (!data) {
    this.buffer = Buffer$1.alloc(0);
    return this;
  }

  // Stream
  if (typeof data.pipe === 'function') {
    this.buffer = Buffer$1.alloc(0);
    data.pipe(this);
    return this;
  }

  // Buffer or String
  // or Object (assumedly a passworded key)
  if (data.length || typeof data === 'object') {
    this.buffer = data;
    this.writable = false;
    process.nextTick(function () {
      this.emit('end', data);
      this.readable = false;
      this.emit('close');
    }.bind(this));
    return this;
  }

  throw new TypeError('Unexpected data type ('+ typeof data + ')');
}
util.inherits(DataStream, Stream);

DataStream.prototype.write = function write(data) {
  this.buffer = Buffer$1.concat([this.buffer, Buffer$1.from(data)]);
  this.emit('data', data);
};

DataStream.prototype.end = function end(data) {
  if (data)
    this.write(data);
  this.emit('end', data);
  this.emit('close');
  this.writable = false;
  this.readable = false;
};

var dataStream = DataStream;

var Buffer$2 = buffer$1.Buffer; // browserify
var SlowBuffer = buffer$1.SlowBuffer;

var bufferEqualConstantTime = bufferEq;

function bufferEq(a, b) {

  // shortcutting on type is necessary for correctness
  if (!Buffer$2.isBuffer(a) || !Buffer$2.isBuffer(b)) {
    return false;
  }

  // buffer sizes should be well-known information, so despite this
  // shortcutting, it doesn't leak any information about the *contents* of the
  // buffers.
  if (a.length !== b.length) {
    return false;
  }

  var c = 0;
  for (var i = 0; i < a.length; i++) {
    /*jshint bitwise:false */
    c |= a[i] ^ b[i]; // XOR
  }
  return c === 0;
}

bufferEq.install = function() {
  Buffer$2.prototype.equal = SlowBuffer.prototype.equal = function equal(that) {
    return bufferEq(this, that);
  };
};

var origBufEqual = Buffer$2.prototype.equal;
var origSlowBufEqual = SlowBuffer.prototype.equal;
bufferEq.restore = function() {
  Buffer$2.prototype.equal = origBufEqual;
  SlowBuffer.prototype.equal = origSlowBufEqual;
};

function getParamSize(keySize) {
	var result = ((keySize / 8) | 0) + (keySize % 8 === 0 ? 0 : 1);
	return result;
}

var paramBytesForAlg = {
	ES256: getParamSize(256),
	ES384: getParamSize(384),
	ES512: getParamSize(521)
};

function getParamBytesForAlg(alg) {
	var paramBytes = paramBytesForAlg[alg];
	if (paramBytes) {
		return paramBytes;
	}

	throw new Error('Unknown algorithm "' + alg + '"');
}

var paramBytesForAlg_1 = getParamBytesForAlg;

var Buffer$3 = safeBuffer.Buffer;



var MAX_OCTET = 0x80,
	CLASS_UNIVERSAL = 0,
	PRIMITIVE_BIT = 0x20,
	TAG_SEQ = 0x10,
	TAG_INT = 0x02,
	ENCODED_TAG_SEQ = (TAG_SEQ | PRIMITIVE_BIT) | (CLASS_UNIVERSAL << 6),
	ENCODED_TAG_INT = TAG_INT | (CLASS_UNIVERSAL << 6);

function base64Url(base64) {
	return base64
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
}

function signatureAsBuffer(signature) {
	if (Buffer$3.isBuffer(signature)) {
		return signature;
	} else if ('string' === typeof signature) {
		return Buffer$3.from(signature, 'base64');
	}

	throw new TypeError('ECDSA signature must be a Base64 string or a Buffer');
}

function derToJose(signature, alg) {
	signature = signatureAsBuffer(signature);
	var paramBytes = paramBytesForAlg_1(alg);

	// the DER encoded param should at most be the param size, plus a padding
	// zero, since due to being a signed integer
	var maxEncodedParamLength = paramBytes + 1;

	var inputLength = signature.length;

	var offset = 0;
	if (signature[offset++] !== ENCODED_TAG_SEQ) {
		throw new Error('Could not find expected "seq"');
	}

	var seqLength = signature[offset++];
	if (seqLength === (MAX_OCTET | 1)) {
		seqLength = signature[offset++];
	}

	if (inputLength - offset < seqLength) {
		throw new Error('"seq" specified length of "' + seqLength + '", only "' + (inputLength - offset) + '" remaining');
	}

	if (signature[offset++] !== ENCODED_TAG_INT) {
		throw new Error('Could not find expected "int" for "r"');
	}

	var rLength = signature[offset++];

	if (inputLength - offset - 2 < rLength) {
		throw new Error('"r" specified length of "' + rLength + '", only "' + (inputLength - offset - 2) + '" available');
	}

	if (maxEncodedParamLength < rLength) {
		throw new Error('"r" specified length of "' + rLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
	}

	var rOffset = offset;
	offset += rLength;

	if (signature[offset++] !== ENCODED_TAG_INT) {
		throw new Error('Could not find expected "int" for "s"');
	}

	var sLength = signature[offset++];

	if (inputLength - offset !== sLength) {
		throw new Error('"s" specified length of "' + sLength + '", expected "' + (inputLength - offset) + '"');
	}

	if (maxEncodedParamLength < sLength) {
		throw new Error('"s" specified length of "' + sLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
	}

	var sOffset = offset;
	offset += sLength;

	if (offset !== inputLength) {
		throw new Error('Expected to consume entire buffer, but "' + (inputLength - offset) + '" bytes remain');
	}

	var rPadding = paramBytes - rLength,
		sPadding = paramBytes - sLength;

	var dst = Buffer$3.allocUnsafe(rPadding + rLength + sPadding + sLength);

	for (offset = 0; offset < rPadding; ++offset) {
		dst[offset] = 0;
	}
	signature.copy(dst, offset, rOffset + Math.max(-rPadding, 0), rOffset + rLength);

	offset = paramBytes;

	for (var o = offset; offset < o + sPadding; ++offset) {
		dst[offset] = 0;
	}
	signature.copy(dst, offset, sOffset + Math.max(-sPadding, 0), sOffset + sLength);

	dst = dst.toString('base64');
	dst = base64Url(dst);

	return dst;
}

function countPadding(buf, start, stop) {
	var padding = 0;
	while (start + padding < stop && buf[start + padding] === 0) {
		++padding;
	}

	var needsSign = buf[start + padding] >= MAX_OCTET;
	if (needsSign) {
		--padding;
	}

	return padding;
}

function joseToDer(signature, alg) {
	signature = signatureAsBuffer(signature);
	var paramBytes = paramBytesForAlg_1(alg);

	var signatureBytes = signature.length;
	if (signatureBytes !== paramBytes * 2) {
		throw new TypeError('"' + alg + '" signatures must be "' + paramBytes * 2 + '" bytes, saw "' + signatureBytes + '"');
	}

	var rPadding = countPadding(signature, 0, paramBytes);
	var sPadding = countPadding(signature, paramBytes, signature.length);
	var rLength = paramBytes - rPadding;
	var sLength = paramBytes - sPadding;

	var rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;

	var shortLength = rsBytes < MAX_OCTET;

	var dst = Buffer$3.allocUnsafe((shortLength ? 2 : 3) + rsBytes);

	var offset = 0;
	dst[offset++] = ENCODED_TAG_SEQ;
	if (shortLength) {
		// Bit 8 has value "0"
		// bits 7-1 give the length.
		dst[offset++] = rsBytes;
	} else {
		// Bit 8 of first octet has value "1"
		// bits 7-1 give the number of additional length octets.
		dst[offset++] = MAX_OCTET	| 1;
		// length, base 256
		dst[offset++] = rsBytes & 0xff;
	}
	dst[offset++] = ENCODED_TAG_INT;
	dst[offset++] = rLength;
	if (rPadding < 0) {
		dst[offset++] = 0;
		offset += signature.copy(dst, offset, 0, paramBytes);
	} else {
		offset += signature.copy(dst, offset, rPadding, paramBytes);
	}
	dst[offset++] = ENCODED_TAG_INT;
	dst[offset++] = sLength;
	if (sPadding < 0) {
		dst[offset++] = 0;
		signature.copy(dst, offset, paramBytes);
	} else {
		signature.copy(dst, offset, paramBytes + sPadding);
	}

	return dst;
}

var ecdsaSigFormatter = {
	derToJose: derToJose,
	joseToDer: joseToDer
};

var Buffer$4 = safeBuffer.Buffer;




var MSG_INVALID_ALGORITHM = '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".';
var MSG_INVALID_SECRET = 'secret must be a string or buffer';
var MSG_INVALID_VERIFIER_KEY = 'key must be a string or a buffer';
var MSG_INVALID_SIGNER_KEY = 'key must be a string, a buffer or an object';

var supportsKeyObjects = typeof crypto.createPublicKey === 'function';
if (supportsKeyObjects) {
  MSG_INVALID_VERIFIER_KEY += ' or a KeyObject';
  MSG_INVALID_SECRET += 'or a KeyObject';
}

function checkIsPublicKey(key) {
  if (Buffer$4.isBuffer(key)) {
    return;
  }

  if (typeof key === 'string') {
    return;
  }

  if (!supportsKeyObjects) {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }

  if (typeof key !== 'object') {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }

  if (typeof key.type !== 'string') {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }

  if (typeof key.asymmetricKeyType !== 'string') {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }

  if (typeof key.export !== 'function') {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }
}
function checkIsPrivateKey(key) {
  if (Buffer$4.isBuffer(key)) {
    return;
  }

  if (typeof key === 'string') {
    return;
  }

  if (typeof key === 'object') {
    return;
  }

  throw typeError(MSG_INVALID_SIGNER_KEY);
}
function checkIsSecretKey(key) {
  if (Buffer$4.isBuffer(key)) {
    return;
  }

  if (typeof key === 'string') {
    return key;
  }

  if (!supportsKeyObjects) {
    throw typeError(MSG_INVALID_SECRET);
  }

  if (typeof key !== 'object') {
    throw typeError(MSG_INVALID_SECRET);
  }

  if (key.type !== 'secret') {
    throw typeError(MSG_INVALID_SECRET);
  }

  if (typeof key.export !== 'function') {
    throw typeError(MSG_INVALID_SECRET);
  }
}

function fromBase64(base64) {
  return base64
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function toBase64(base64url) {
  base64url = base64url.toString();

  var padding = 4 - base64url.length % 4;
  if (padding !== 4) {
    for (var i = 0; i < padding; ++i) {
      base64url += '=';
    }
  }

  return base64url
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
}

function typeError(template) {
  var args = [].slice.call(arguments, 1);
  var errMsg = util.format.bind(util, template).apply(null, args);
  return new TypeError(errMsg);
}

function bufferOrString(obj) {
  return Buffer$4.isBuffer(obj) || typeof obj === 'string';
}

function normalizeInput(thing) {
  if (!bufferOrString(thing))
    thing = JSON.stringify(thing);
  return thing;
}

function createHmacSigner(bits) {
  return function sign(thing, secret) {
    checkIsSecretKey(secret);
    thing = normalizeInput(thing);
    var hmac = crypto.createHmac('sha' + bits, secret);
    var sig = (hmac.update(thing), hmac.digest('base64'));
    return fromBase64(sig);
  }
}

function createHmacVerifier(bits) {
  return function verify(thing, signature, secret) {
    var computedSig = createHmacSigner(bits)(thing, secret);
    return bufferEqualConstantTime(Buffer$4.from(signature), Buffer$4.from(computedSig));
  }
}

function createKeySigner(bits) {
 return function sign(thing, privateKey) {
    checkIsPrivateKey(privateKey);
    thing = normalizeInput(thing);
    // Even though we are specifying "RSA" here, this works with ECDSA
    // keys as well.
    var signer = crypto.createSign('RSA-SHA' + bits);
    var sig = (signer.update(thing), signer.sign(privateKey, 'base64'));
    return fromBase64(sig);
  }
}

function createKeyVerifier(bits) {
  return function verify(thing, signature, publicKey) {
    checkIsPublicKey(publicKey);
    thing = normalizeInput(thing);
    signature = toBase64(signature);
    var verifier = crypto.createVerify('RSA-SHA' + bits);
    verifier.update(thing);
    return verifier.verify(publicKey, signature, 'base64');
  }
}

function createPSSKeySigner(bits) {
  return function sign(thing, privateKey) {
    checkIsPrivateKey(privateKey);
    thing = normalizeInput(thing);
    var signer = crypto.createSign('RSA-SHA' + bits);
    var sig = (signer.update(thing), signer.sign({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
    }, 'base64'));
    return fromBase64(sig);
  }
}

function createPSSKeyVerifier(bits) {
  return function verify(thing, signature, publicKey) {
    checkIsPublicKey(publicKey);
    thing = normalizeInput(thing);
    signature = toBase64(signature);
    var verifier = crypto.createVerify('RSA-SHA' + bits);
    verifier.update(thing);
    return verifier.verify({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
    }, signature, 'base64');
  }
}

function createECDSASigner(bits) {
  var inner = createKeySigner(bits);
  return function sign() {
    var signature = inner.apply(null, arguments);
    signature = ecdsaSigFormatter.derToJose(signature, 'ES' + bits);
    return signature;
  };
}

function createECDSAVerifer(bits) {
  var inner = createKeyVerifier(bits);
  return function verify(thing, signature, publicKey) {
    signature = ecdsaSigFormatter.joseToDer(signature, 'ES' + bits).toString('base64');
    var result = inner(thing, signature, publicKey);
    return result;
  };
}

function createNoneSigner() {
  return function sign() {
    return '';
  }
}

function createNoneVerifier() {
  return function verify(thing, signature) {
    return signature === '';
  }
}

var jwa = function jwa(algorithm) {
  var signerFactories = {
    hs: createHmacSigner,
    rs: createKeySigner,
    ps: createPSSKeySigner,
    es: createECDSASigner,
    none: createNoneSigner,
  };
  var verifierFactories = {
    hs: createHmacVerifier,
    rs: createKeyVerifier,
    ps: createPSSKeyVerifier,
    es: createECDSAVerifer,
    none: createNoneVerifier,
  };
  var match = algorithm.match(/^(RS|PS|ES|HS)(256|384|512)$|^(none)$/i);
  if (!match)
    throw typeError(MSG_INVALID_ALGORITHM, algorithm);
  var algo = (match[1] || match[3]).toLowerCase();
  var bits = match[2];

  return {
    sign: signerFactories[algo](bits),
    verify: verifierFactories[algo](bits),
  }
};

/*global module*/
var Buffer$5 = buffer$1.Buffer;

var tostring = function toString(obj) {
  if (typeof obj === 'string')
    return obj;
  if (typeof obj === 'number' || Buffer$5.isBuffer(obj))
    return obj.toString();
  return JSON.stringify(obj);
};

/*global module*/
var Buffer$6 = safeBuffer.Buffer;






function base64url(string, encoding) {
  return Buffer$6
    .from(string, encoding)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function jwsSecuredInput(header, payload, encoding) {
  encoding = encoding || 'utf8';
  var encodedHeader = base64url(tostring(header), 'binary');
  var encodedPayload = base64url(tostring(payload), encoding);
  return util.format('%s.%s', encodedHeader, encodedPayload);
}

function jwsSign(opts) {
  var header = opts.header;
  var payload = opts.payload;
  var secretOrKey = opts.secret || opts.privateKey;
  var encoding = opts.encoding;
  var algo = jwa(header.alg);
  var securedInput = jwsSecuredInput(header, payload, encoding);
  var signature = algo.sign(securedInput, secretOrKey);
  return util.format('%s.%s', securedInput, signature);
}

function SignStream(opts) {
  var secret = opts.secret||opts.privateKey||opts.key;
  var secretStream = new dataStream(secret);
  this.readable = true;
  this.header = opts.header;
  this.encoding = opts.encoding;
  this.secret = this.privateKey = this.key = secretStream;
  this.payload = new dataStream(opts.payload);
  this.secret.once('close', function () {
    if (!this.payload.writable && this.readable)
      this.sign();
  }.bind(this));

  this.payload.once('close', function () {
    if (!this.secret.writable && this.readable)
      this.sign();
  }.bind(this));
}
util.inherits(SignStream, Stream);

SignStream.prototype.sign = function sign() {
  try {
    var signature = jwsSign({
      header: this.header,
      payload: this.payload.buffer,
      secret: this.secret.buffer,
      encoding: this.encoding
    });
    this.emit('done', signature);
    this.emit('data', signature);
    this.emit('end');
    this.readable = false;
    return signature;
  } catch (e) {
    this.readable = false;
    this.emit('error', e);
    this.emit('close');
  }
};

SignStream.sign = jwsSign;

var signStream = SignStream;

/*global module*/
var Buffer$7 = safeBuffer.Buffer;





var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;

function isObject$4(thing) {
  return Object.prototype.toString.call(thing) === '[object Object]';
}

function safeJsonParse(thing) {
  if (isObject$4(thing))
    return thing;
  try { return JSON.parse(thing); }
  catch (e) { return undefined; }
}

function headerFromJWS(jwsSig) {
  var encodedHeader = jwsSig.split('.', 1)[0];
  return safeJsonParse(Buffer$7.from(encodedHeader, 'base64').toString('binary'));
}

function securedInputFromJWS(jwsSig) {
  return jwsSig.split('.', 2).join('.');
}

function signatureFromJWS(jwsSig) {
  return jwsSig.split('.')[2];
}

function payloadFromJWS(jwsSig, encoding) {
  encoding = encoding || 'utf8';
  var payload = jwsSig.split('.')[1];
  return Buffer$7.from(payload, 'base64').toString(encoding);
}

function isValidJws(string) {
  return JWS_REGEX.test(string) && !!headerFromJWS(string);
}

function jwsVerify(jwsSig, algorithm, secretOrKey) {
  if (!algorithm) {
    var err = new Error("Missing algorithm parameter for jws.verify");
    err.code = "MISSING_ALGORITHM";
    throw err;
  }
  jwsSig = tostring(jwsSig);
  var signature = signatureFromJWS(jwsSig);
  var securedInput = securedInputFromJWS(jwsSig);
  var algo = jwa(algorithm);
  return algo.verify(securedInput, signature, secretOrKey);
}

function jwsDecode(jwsSig, opts) {
  opts = opts || {};
  jwsSig = tostring(jwsSig);

  if (!isValidJws(jwsSig))
    return null;

  var header = headerFromJWS(jwsSig);

  if (!header)
    return null;

  var payload = payloadFromJWS(jwsSig);
  if (header.typ === 'JWT' || opts.json)
    payload = JSON.parse(payload, opts.encoding);

  return {
    header: header,
    payload: payload,
    signature: signatureFromJWS(jwsSig)
  };
}

function VerifyStream(opts) {
  opts = opts || {};
  var secretOrKey = opts.secret||opts.publicKey||opts.key;
  var secretStream = new dataStream(secretOrKey);
  this.readable = true;
  this.algorithm = opts.algorithm;
  this.encoding = opts.encoding;
  this.secret = this.publicKey = this.key = secretStream;
  this.signature = new dataStream(opts.signature);
  this.secret.once('close', function () {
    if (!this.signature.writable && this.readable)
      this.verify();
  }.bind(this));

  this.signature.once('close', function () {
    if (!this.secret.writable && this.readable)
      this.verify();
  }.bind(this));
}
util.inherits(VerifyStream, Stream);
VerifyStream.prototype.verify = function verify() {
  try {
    var valid = jwsVerify(this.signature.buffer, this.algorithm, this.key.buffer);
    var obj = jwsDecode(this.signature.buffer, this.encoding);
    this.emit('done', valid, obj);
    this.emit('data', valid);
    this.emit('end');
    this.readable = false;
    return valid;
  } catch (e) {
    this.readable = false;
    this.emit('error', e);
    this.emit('close');
  }
};

VerifyStream.decode = jwsDecode;
VerifyStream.isValid = isValidJws;
VerifyStream.verify = jwsVerify;

var verifyStream = VerifyStream;

/*global exports*/



var ALGORITHMS = [
  'HS256', 'HS384', 'HS512',
  'RS256', 'RS384', 'RS512',
  'PS256', 'PS384', 'PS512',
  'ES256', 'ES384', 'ES512'
];

var ALGORITHMS_1 = ALGORITHMS;
var sign = signStream.sign;
var verify = verifyStream.verify;
var decode = verifyStream.decode;
var isValid = verifyStream.isValid;
var createSign = function createSign(opts) {
  return new signStream(opts);
};
var createVerify = function createVerify(opts) {
  return new verifyStream(opts);
};

var jws = {
	ALGORITHMS: ALGORITHMS_1,
	sign: sign,
	verify: verify,
	decode: decode,
	isValid: isValid,
	createSign: createSign,
	createVerify: createVerify
};

var decode$1 = function (jwt, options) {
  options = options || {};
  var decoded = jws.decode(jwt, options);
  if (!decoded) { return null; }
  var payload = decoded.payload;

  //try parse the payload
  if(typeof payload === 'string') {
    try {
      var obj = JSON.parse(payload);
      if(obj !== null && typeof obj === 'object') {
        payload = obj;
      }
    } catch (e) { }
  }

  //return header if `complete` option is enabled.  header includes claims
  //such as `kid` and `alg` used to select the key within a JWKS needed to
  //verify the signature
  if (options.complete === true) {
    return {
      header: decoded.header,
      payload: payload,
      signature: decoded.signature
    };
  }
  return payload;
};

var JsonWebTokenError = function (message, error) {
  Error.call(this, message);
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
  this.name = 'JsonWebTokenError';
  this.message = message;
  if (error) this.inner = error;
};

JsonWebTokenError.prototype = Object.create(Error.prototype);
JsonWebTokenError.prototype.constructor = JsonWebTokenError;

var JsonWebTokenError_1 = JsonWebTokenError;

var NotBeforeError = function (message, date) {
  JsonWebTokenError_1.call(this, message);
  this.name = 'NotBeforeError';
  this.date = date;
};

NotBeforeError.prototype = Object.create(JsonWebTokenError_1.prototype);

NotBeforeError.prototype.constructor = NotBeforeError;

var NotBeforeError_1 = NotBeforeError;

var TokenExpiredError = function (message, expiredAt) {
  JsonWebTokenError_1.call(this, message);
  this.name = 'TokenExpiredError';
  this.expiredAt = expiredAt;
};

TokenExpiredError.prototype = Object.create(JsonWebTokenError_1.prototype);

TokenExpiredError.prototype.constructor = TokenExpiredError;

var TokenExpiredError_1 = TokenExpiredError;

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var ms = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse$2(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse$2(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

var timespan = function (time, iat) {
  var timestamp = iat || Math.floor(Date.now() / 1000);

  if (typeof time === 'string') {
    var milliseconds = ms(time);
    if (typeof milliseconds === 'undefined') {
      return;
    }
    return Math.floor(timestamp + milliseconds / 1000);
  } else if (typeof time === 'number') {
    return timestamp + time;
  } else {
    return;
  }

};

var psSupported = semver.satisfies(process.version, '^6.12.0 || >=8.0.0');

var PUB_KEY_ALGS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'];
var RSA_KEY_ALGS = ['RS256', 'RS384', 'RS512'];
var HS_ALGS = ['HS256', 'HS384', 'HS512'];

if (psSupported) {
  PUB_KEY_ALGS.splice(3, 0, 'PS256', 'PS384', 'PS512');
  RSA_KEY_ALGS.splice(3, 0, 'PS256', 'PS384', 'PS512');
}

var verify$1 = function (jwtString, secretOrPublicKey, options, callback) {
  if ((typeof options === 'function') && !callback) {
    callback = options;
    options = {};
  }

  if (!options) {
    options = {};
  }

  //clone this object since we are going to mutate it.
  options = Object.assign({}, options);

  var done;

  if (callback) {
    done = callback;
  } else {
    done = function(err, data) {
      if (err) throw err;
      return data;
    };
  }

  if (options.clockTimestamp && typeof options.clockTimestamp !== 'number') {
    return done(new JsonWebTokenError_1('clockTimestamp must be a number'));
  }

  if (options.nonce !== undefined && (typeof options.nonce !== 'string' || options.nonce.trim() === '')) {
    return done(new JsonWebTokenError_1('nonce must be a non-empty string'));
  }

  var clockTimestamp = options.clockTimestamp || Math.floor(Date.now() / 1000);

  if (!jwtString){
    return done(new JsonWebTokenError_1('jwt must be provided'));
  }

  if (typeof jwtString !== 'string') {
    return done(new JsonWebTokenError_1('jwt must be a string'));
  }

  var parts = jwtString.split('.');

  if (parts.length !== 3){
    return done(new JsonWebTokenError_1('jwt malformed'));
  }

  var decodedToken;

  try {
    decodedToken = decode$1(jwtString, { complete: true });
  } catch(err) {
    return done(err);
  }

  if (!decodedToken) {
    return done(new JsonWebTokenError_1('invalid token'));
  }

  var header = decodedToken.header;
  var getSecret;

  if(typeof secretOrPublicKey === 'function') {
    if(!callback) {
      return done(new JsonWebTokenError_1('verify must be called asynchronous if secret or public key is provided as a callback'));
    }

    getSecret = secretOrPublicKey;
  }
  else {
    getSecret = function(header, secretCallback) {
      return secretCallback(null, secretOrPublicKey);
    };
  }

  return getSecret(header, function(err, secretOrPublicKey) {
    if(err) {
      return done(new JsonWebTokenError_1('error in secret or public key callback: ' + err.message));
    }

    var hasSignature = parts[2].trim() !== '';

    if (!hasSignature && secretOrPublicKey){
      return done(new JsonWebTokenError_1('jwt signature is required'));
    }

    if (hasSignature && !secretOrPublicKey) {
      return done(new JsonWebTokenError_1('secret or public key must be provided'));
    }

    if (!hasSignature && !options.algorithms) {
      options.algorithms = ['none'];
    }

    if (!options.algorithms) {
      options.algorithms = ~secretOrPublicKey.toString().indexOf('BEGIN CERTIFICATE') ||
        ~secretOrPublicKey.toString().indexOf('BEGIN PUBLIC KEY') ? PUB_KEY_ALGS :
        ~secretOrPublicKey.toString().indexOf('BEGIN RSA PUBLIC KEY') ? RSA_KEY_ALGS : HS_ALGS;

    }

    if (!~options.algorithms.indexOf(decodedToken.header.alg)) {
      return done(new JsonWebTokenError_1('invalid algorithm'));
    }

    var valid;

    try {
      valid = jws.verify(jwtString, decodedToken.header.alg, secretOrPublicKey);
    } catch (e) {
      return done(e);
    }

    if (!valid) {
      return done(new JsonWebTokenError_1('invalid signature'));
    }

    var payload = decodedToken.payload;

    if (typeof payload.nbf !== 'undefined' && !options.ignoreNotBefore) {
      if (typeof payload.nbf !== 'number') {
        return done(new JsonWebTokenError_1('invalid nbf value'));
      }
      if (payload.nbf > clockTimestamp + (options.clockTolerance || 0)) {
        return done(new NotBeforeError_1('jwt not active', new Date(payload.nbf * 1000)));
      }
    }

    if (typeof payload.exp !== 'undefined' && !options.ignoreExpiration) {
      if (typeof payload.exp !== 'number') {
        return done(new JsonWebTokenError_1('invalid exp value'));
      }
      if (clockTimestamp >= payload.exp + (options.clockTolerance || 0)) {
        return done(new TokenExpiredError_1('jwt expired', new Date(payload.exp * 1000)));
      }
    }

    if (options.audience) {
      var audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
      var target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

      var match = target.some(function (targetAudience) {
        return audiences.some(function (audience) {
          return audience instanceof RegExp ? audience.test(targetAudience) : audience === targetAudience;
        });
      });

      if (!match) {
        return done(new JsonWebTokenError_1('jwt audience invalid. expected: ' + audiences.join(' or ')));
      }
    }

    if (options.issuer) {
      var invalid_issuer =
              (typeof options.issuer === 'string' && payload.iss !== options.issuer) ||
              (Array.isArray(options.issuer) && options.issuer.indexOf(payload.iss) === -1);

      if (invalid_issuer) {
        return done(new JsonWebTokenError_1('jwt issuer invalid. expected: ' + options.issuer));
      }
    }

    if (options.subject) {
      if (payload.sub !== options.subject) {
        return done(new JsonWebTokenError_1('jwt subject invalid. expected: ' + options.subject));
      }
    }

    if (options.jwtid) {
      if (payload.jti !== options.jwtid) {
        return done(new JsonWebTokenError_1('jwt jwtid invalid. expected: ' + options.jwtid));
      }
    }

    if (options.nonce) {
      if (payload.nonce !== options.nonce) {
        return done(new JsonWebTokenError_1('jwt nonce invalid. expected: ' + options.nonce));
      }
    }

    if (options.maxAge) {
      if (typeof payload.iat !== 'number') {
        return done(new JsonWebTokenError_1('iat required when maxAge is specified'));
      }

      var maxAgeTimestamp = timespan(options.maxAge, payload.iat);
      if (typeof maxAgeTimestamp === 'undefined') {
        return done(new JsonWebTokenError_1('"maxAge" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
      }
      if (clockTimestamp >= maxAgeTimestamp + (options.clockTolerance || 0)) {
        return done(new TokenExpiredError_1('maxAge exceeded', new Date(maxAgeTimestamp * 1000)));
      }
    }

    if (options.complete === true) {
      var signature = decodedToken.signature;

      return done(null, {
        header: header,
        payload: payload,
        signature: signature
      });
    }

    return done(null, payload);
  });
};

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY$3 = 1 / 0,
    MAX_SAFE_INTEGER$1 = 9007199254740991,
    MAX_INTEGER = 1.7976931348623157e+308,
    NAN = 0 / 0;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag$3 = '[object Function]',
    genTag$3 = '[object GeneratorFunction]',
    stringTag = '[object String]',
    symbolTag$2 = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Used to detect unsigned integer values. */
var reIsUint$1 = /^(?:0|[1-9]\d*)$/;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex$1(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf$1(array, value, fromIndex) {
  if (value !== value) {
    return baseFindIndex$1(array, baseIsNaN$1, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN$1(value) {
  return value !== value;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */
function baseValues(object, props) {
  return arrayMap(props, function(key) {
    return object[key];
  });
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$3 = objectProto$3.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object),
    nativeMax = Math.max;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray$2(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$3.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex$1(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex$1(value, length) {
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length &&
    (typeof value == 'number' || reIsUint$1.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$3;

  return value === proto;
}

/**
 * Checks if `value` is in `collection`. If `collection` is a string, it's
 * checked for a substring of `value`, otherwise
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * is used for equality comparisons. If `fromIndex` is negative, it's used as
 * the offset from the end of `collection`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object|string} collection The collection to inspect.
 * @param {*} value The value to search for.
 * @param {number} [fromIndex=0] The index to search from.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
 * @returns {boolean} Returns `true` if `value` is found, else `false`.
 * @example
 *
 * _.includes([1, 2, 3], 1);
 * // => true
 *
 * _.includes([1, 2, 3], 1, 2);
 * // => false
 *
 * _.includes({ 'a': 1, 'b': 2 }, 1);
 * // => true
 *
 * _.includes('abcd', 'bc');
 * // => true
 */
function includes(collection, value, fromIndex, guard) {
  collection = isArrayLike(collection) ? collection : values(collection);
  fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

  var length = collection.length;
  if (fromIndex < 0) {
    fromIndex = nativeMax(length + fromIndex, 0);
  }
  return isString(collection)
    ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
    : (!!length && baseIndexOf$1(collection, value, fromIndex) > -1);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty$3.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString$3.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray$2 = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction$3(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike$2(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction$3(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject$5(value) ? objectToString$3.call(value) : '';
  return tag == funcTag$3 || tag == genTag$3;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$5(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$2(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray$2(value) && isObjectLike$2(value) && objectToString$3.call(value) == stringTag);
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$2(value) {
  return typeof value == 'symbol' ||
    (isObjectLike$2(value) && objectToString$3.call(value) == symbolTag$2);
}

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY$3 || value === -INFINITY$3) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol$2(value)) {
    return NAN;
  }
  if (isObject$5(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$5(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * Creates an array of the own enumerable string keyed property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.values(new Foo);
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * _.values('hi');
 * // => ['h', 'i']
 */
function values(object) {
  return object ? baseValues(object, keys(object)) : [];
}

var lodash_includes = includes;

/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var boolTag = '[object Boolean]';

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$4 = objectProto$4.toString;

/**
 * Checks if `value` is classified as a boolean primitive or object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isBoolean(false);
 * // => true
 *
 * _.isBoolean(null);
 * // => false
 */
function isBoolean(value) {
  return value === true || value === false ||
    (isObjectLike$3(value) && objectToString$4.call(value) == boolTag);
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$3(value) {
  return !!value && typeof value == 'object';
}

var lodash_isboolean = isBoolean;

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY$4 = 1 / 0,
    MAX_INTEGER$1 = 1.7976931348623157e+308,
    NAN$1 = 0 / 0;

/** `Object#toString` result references. */
var symbolTag$3 = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim$1 = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex$1 = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary$1 = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal$1 = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt$1 = parseInt;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$5 = objectProto$5.toString;

/**
 * Checks if `value` is an integer.
 *
 * **Note:** This method is based on
 * [`Number.isInteger`](https://mdn.io/Number/isInteger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an integer, else `false`.
 * @example
 *
 * _.isInteger(3);
 * // => true
 *
 * _.isInteger(Number.MIN_VALUE);
 * // => false
 *
 * _.isInteger(Infinity);
 * // => false
 *
 * _.isInteger('3');
 * // => false
 */
function isInteger(value) {
  return typeof value == 'number' && value == toInteger$1(value);
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$6(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$4(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$3(value) {
  return typeof value == 'symbol' ||
    (isObjectLike$4(value) && objectToString$5.call(value) == symbolTag$3);
}

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite$1(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber$1(value);
  if (value === INFINITY$4 || value === -INFINITY$4) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER$1;
  }
  return value === value ? value : 0;
}

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger$1(value) {
  var result = toFinite$1(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber$1(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol$3(value)) {
    return NAN$1;
  }
  if (isObject$6(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$6(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim$1, '');
  var isBinary = reIsBinary$1.test(value);
  return (isBinary || reIsOctal$1.test(value))
    ? freeParseInt$1(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex$1.test(value) ? NAN$1 : +value);
}

var lodash_isinteger = isInteger;

/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var numberTag = '[object Number]';

/** Used for built-in method references. */
var objectProto$6 = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$6 = objectProto$6.toString;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$5(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
 * as numbers, use the `_.isFinite` method.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isNumber(3);
 * // => true
 *
 * _.isNumber(Number.MIN_VALUE);
 * // => true
 *
 * _.isNumber(Infinity);
 * // => true
 *
 * _.isNumber('3');
 * // => false
 */
function isNumber(value) {
  return typeof value == 'number' ||
    (isObjectLike$5(value) && objectToString$6.call(value) == numberTag);
}

var lodash_isnumber = isNumber;

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject$3(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg$1(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Used for built-in method references. */
var funcProto$3 = Function.prototype,
    objectProto$7 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$3 = funcProto$3.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$7.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString$3.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$7 = objectProto$7.toString;

/** Built-in value references. */
var getPrototype = overArg$1(Object.getPrototypeOf, Object);

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$6(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject$1(value) {
  if (!isObjectLike$6(value) ||
      objectToString$7.call(value) != objectTag || isHostObject$3(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$4.call(proto, 'constructor') && proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString$3.call(Ctor) == objectCtorString);
}

var lodash_isplainobject = isPlainObject$1;

/**
 * lodash 4.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var stringTag$1 = '[object String]';

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$8 = objectProto$8.toString;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray$3 = Array.isArray;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$7(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString$1(value) {
  return typeof value == 'string' ||
    (!isArray$3(value) && isObjectLike$7(value) && objectToString$8.call(value) == stringTag$1);
}

var lodash_isstring = isString$1;

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT$2 = 'Expected a function';

/** Used as references for various `Number` constants. */
var INFINITY$5 = 1 / 0,
    MAX_INTEGER$2 = 1.7976931348623157e+308,
    NAN$2 = 0 / 0;

/** `Object#toString` result references. */
var symbolTag$4 = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim$2 = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex$2 = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary$2 = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal$2 = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt$2 = parseInt;

/** Used for built-in method references. */
var objectProto$9 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$9 = objectProto$9.toString;

/**
 * Creates a function that invokes `func`, with the `this` binding and arguments
 * of the created function, while it's called less than `n` times. Subsequent
 * calls to the created function return the result of the last `func` invocation.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Function
 * @param {number} n The number of calls at which `func` is no longer invoked.
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * jQuery(element).on('click', _.before(5, addContactToList));
 * // => Allows adding up to 4 contacts to the list.
 */
function before(n, func) {
  var result;
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT$2);
  }
  n = toInteger$2(n);
  return function() {
    if (--n > 0) {
      result = func.apply(this, arguments);
    }
    if (n <= 1) {
      func = undefined;
    }
    return result;
  };
}

/**
 * Creates a function that is restricted to invoking `func` once. Repeat calls
 * to the function return the value of the first invocation. The `func` is
 * invoked with the `this` binding and arguments of the created function.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * var initialize = _.once(createApplication);
 * initialize();
 * initialize();
 * // => `createApplication` is invoked once
 */
function once$1(func) {
  return before(2, func);
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$7(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$8(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$4(value) {
  return typeof value == 'symbol' ||
    (isObjectLike$8(value) && objectToString$9.call(value) == symbolTag$4);
}

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite$2(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber$2(value);
  if (value === INFINITY$5 || value === -INFINITY$5) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER$2;
  }
  return value === value ? value : 0;
}

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger$2(value) {
  var result = toFinite$2(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber$2(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol$4(value)) {
    return NAN$2;
  }
  if (isObject$7(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$7(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim$2, '');
  var isBinary = reIsBinary$2.test(value);
  return (isBinary || reIsOctal$2.test(value))
    ? freeParseInt$2(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex$2.test(value) ? NAN$2 : +value);
}

var lodash_once = once$1;

var SUPPORTED_ALGS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'HS256', 'HS384', 'HS512', 'none'];
if (psSupported) {
  SUPPORTED_ALGS.splice(3, 0, 'PS256', 'PS384', 'PS512');
}

var sign_options_schema = {
  expiresIn: { isValid: function(value) { return lodash_isinteger(value) || (lodash_isstring(value) && value); }, message: '"expiresIn" should be a number of seconds or string representing a timespan' },
  notBefore: { isValid: function(value) { return lodash_isinteger(value) || (lodash_isstring(value) && value); }, message: '"notBefore" should be a number of seconds or string representing a timespan' },
  audience: { isValid: function(value) { return lodash_isstring(value) || Array.isArray(value); }, message: '"audience" must be a string or array' },
  algorithm: { isValid: lodash_includes.bind(null, SUPPORTED_ALGS), message: '"algorithm" must be a valid string enum value' },
  header: { isValid: lodash_isplainobject, message: '"header" must be an object' },
  encoding: { isValid: lodash_isstring, message: '"encoding" must be a string' },
  issuer: { isValid: lodash_isstring, message: '"issuer" must be a string' },
  subject: { isValid: lodash_isstring, message: '"subject" must be a string' },
  jwtid: { isValid: lodash_isstring, message: '"jwtid" must be a string' },
  noTimestamp: { isValid: lodash_isboolean, message: '"noTimestamp" must be a boolean' },
  keyid: { isValid: lodash_isstring, message: '"keyid" must be a string' },
  mutatePayload: { isValid: lodash_isboolean, message: '"mutatePayload" must be a boolean' }
};

var registered_claims_schema = {
  iat: { isValid: lodash_isnumber, message: '"iat" should be a number of seconds' },
  exp: { isValid: lodash_isnumber, message: '"exp" should be a number of seconds' },
  nbf: { isValid: lodash_isnumber, message: '"nbf" should be a number of seconds' }
};

function validate$2(schema, allowUnknown, object, parameterName) {
  if (!lodash_isplainobject(object)) {
    throw new Error('Expected "' + parameterName + '" to be a plain object.');
  }
  Object.keys(object)
    .forEach(function(key) {
      var validator = schema[key];
      if (!validator) {
        if (!allowUnknown) {
          throw new Error('"' + key + '" is not allowed in "' + parameterName + '"');
        }
        return;
      }
      if (!validator.isValid(object[key])) {
        throw new Error(validator.message);
      }
    });
}

function validateOptions(options) {
  return validate$2(sign_options_schema, false, options, 'options');
}

function validatePayload(payload) {
  return validate$2(registered_claims_schema, true, payload, 'payload');
}

var options_to_payload = {
  'audience': 'aud',
  'issuer': 'iss',
  'subject': 'sub',
  'jwtid': 'jti'
};

var options_for_objects = [
  'expiresIn',
  'notBefore',
  'noTimestamp',
  'audience',
  'issuer',
  'subject',
  'jwtid',
];

var sign$1 = function (payload, secretOrPrivateKey, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  } else {
    options = options || {};
  }

  var isObjectPayload = typeof payload === 'object' &&
                        !Buffer.isBuffer(payload);

  var header = Object.assign({
    alg: options.algorithm || 'HS256',
    typ: isObjectPayload ? 'JWT' : undefined,
    kid: options.keyid
  }, options.header);

  function failure(err) {
    if (callback) {
      return callback(err);
    }
    throw err;
  }

  if (!secretOrPrivateKey && options.algorithm !== 'none') {
    return failure(new Error('secretOrPrivateKey must have a value'));
  }

  if (typeof payload === 'undefined') {
    return failure(new Error('payload is required'));
  } else if (isObjectPayload) {
    try {
      validatePayload(payload);
    }
    catch (error) {
      return failure(error);
    }
    if (!options.mutatePayload) {
      payload = Object.assign({},payload);
    }
  } else {
    var invalid_options = options_for_objects.filter(function (opt) {
      return typeof options[opt] !== 'undefined';
    });

    if (invalid_options.length > 0) {
      return failure(new Error('invalid ' + invalid_options.join(',') + ' option for ' + (typeof payload ) + ' payload'));
    }
  }

  if (typeof payload.exp !== 'undefined' && typeof options.expiresIn !== 'undefined') {
    return failure(new Error('Bad "options.expiresIn" option the payload already has an "exp" property.'));
  }

  if (typeof payload.nbf !== 'undefined' && typeof options.notBefore !== 'undefined') {
    return failure(new Error('Bad "options.notBefore" option the payload already has an "nbf" property.'));
  }

  try {
    validateOptions(options);
  }
  catch (error) {
    return failure(error);
  }

  var timestamp = payload.iat || Math.floor(Date.now() / 1000);

  if (options.noTimestamp) {
    delete payload.iat;
  } else if (isObjectPayload) {
    payload.iat = timestamp;
  }

  if (typeof options.notBefore !== 'undefined') {
    try {
      payload.nbf = timespan(options.notBefore, timestamp);
    }
    catch (err) {
      return failure(err);
    }
    if (typeof payload.nbf === 'undefined') {
      return failure(new Error('"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
    }
  }

  if (typeof options.expiresIn !== 'undefined' && typeof payload === 'object') {
    try {
      payload.exp = timespan(options.expiresIn, timestamp);
    }
    catch (err) {
      return failure(err);
    }
    if (typeof payload.exp === 'undefined') {
      return failure(new Error('"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
    }
  }

  Object.keys(options_to_payload).forEach(function (key) {
    var claim = options_to_payload[key];
    if (typeof options[key] !== 'undefined') {
      if (typeof payload[claim] !== 'undefined') {
        return failure(new Error('Bad "options.' + key + '" option. The payload already has an "' + claim + '" property.'));
      }
      payload[claim] = options[key];
    }
  });

  var encoding = options.encoding || 'utf8';

  if (typeof callback === 'function') {
    callback = callback && lodash_once(callback);

    jws.createSign({
      header: header,
      privateKey: secretOrPrivateKey,
      payload: payload,
      encoding: encoding
    }).once('error', callback)
      .once('done', function (signature) {
        callback(null, signature);
      });
  } else {
    return jws.sign({header: header, payload: payload, secret: secretOrPrivateKey, encoding: encoding});
  }
};

var jsonwebtoken = {
  decode: decode$1,
  verify: verify$1,
  sign: sign$1,
  JsonWebTokenError: JsonWebTokenError_1,
  NotBeforeError: NotBeforeError_1,
  TokenExpiredError: TokenExpiredError_1,
};
var jsonwebtoken_3 = jsonwebtoken.sign;

async function lockIssue(client, issue, message) {
    await client.issues.createComment({
        owner: github_1.repo.owner,
        repo: github_1.repo.repo,
        issue_number: issue,
        body: message,
    });
    // Actually lock the issue
    await client.issues.lock({
        owner: github_1.repo.owner,
        repo: github_1.repo.repo,
        issue_number: issue,
    });
}
/** Creates a promise which resolves after a set period of time. */
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/** Creates a JWT token expiring one hour in the future, for authentication as an installation (Github App). */
function createJWT(privateKey, id) {
    const now = Math.floor(Date.now() / 1000);
    return jsonwebtoken_3({
        // Issued at time
        iat: now,
        // JWT expiration time (10 minutes in the future)
        exp: now + 10 * 60,
        // Githup App id
        iss: id,
    }, privateKey, {
        algorithm: 'RS256',
    });
}
async function run() {
    try {
        // NOTE: `days` and `message` must not be changed without dev-rel and dev-infra concurrence
        // Fixed amount of days a closed issue must be inactive before being locked
        const days = 30;
        // Standardized Angular Team message for locking issues
        const policyUrl = 'https://github.com/angular/angular/blob/67d80f/docs/GITHUB_PROCESS.md#conversation-locking';
        const message = 'This issue has been automatically locked due to inactivity.\n' +
            'Please file a new issue if you are encountering a similar or related problem.\n\n' +
            `Read more about our [automatic conversation locking policy](${policyUrl}).\n\n` +
            '<sub>_This action has been performed automatically by a bot._</sub>';
        // Github App Id of the Lock Bot App
        const lockBotAppId = 40213;
        // Installation Id of the Lock Bot App
        const installationId = 1772826;
        // Create unauthenticated Github client.
        const client = new rest();
        // Create JWT Token with provided private key.
        const lockBotKey = core_5('lock-bot-key', { required: true });
        const lockBotJWT = createJWT(lockBotKey, lockBotAppId);
        // Create Installation Token using JWT Token
        client.authenticate({
            type: 'app',
            token: lockBotJWT,
        });
        const installToken = await client.apps.createInstallationToken({
            installation_id: installationId,
        });
        // Authenticate using as `angular-automatic-lock-bot` Github App Installation Token
        client.authenticate({
            type: 'token',
            token: installToken.data.token,
        });
        const maxPerExecution = Math.min(+core_5('locks-per-execution') || 1, 100);
        // Set the threshold date based on the days inactive
        const threshold = new Date();
        threshold.setDate(threshold.getDate() - days);
        const repositoryName = github_1.repo.owner + '/' + github_1.repo.repo;
        const updatedAt = threshold.toISOString().split('T')[0];
        const query = `repo:${repositoryName}+is:closed+is:unlocked+updated:<${updatedAt}+sort:updated-asc`;
        console.info('Query: ' + query);
        let lockCount = 0;
        let issueResponse = await client.search.issuesAndPullRequests({
            q: query,
            per_page: maxPerExecution,
        });
        if (!issueResponse.data.items.length) {
            console.info(`No items found to lock`);
            return;
        }
        console.info(`Attempting to lock ${issueResponse.data.items.length} item(s)`);
        core_11('Locking items');
        for (const item of issueResponse.data.items) {
            ++lockCount;
            let itemType;
            try {
                if (item.locked) {
                    console.info(`Skipping ${itemType} #${item.number}, already locked`);
                    continue;
                }
                itemType = item.pull_request ? 'pull request' : 'issue';
                console.info(`Locking ${itemType} #${item.number}`);
                await lockIssue(client, item.number, message);
                await timeout(500);
            }
            catch (error) {
                core_8(error);
                core_10(`Unable to lock ${itemType} #${item.number}: ${error.message}`);
                if (typeof error.request === 'object') {
                    core_9(JSON.stringify(error.request, null, 2));
                }
            }
        }
        core_12();
        console.info(`Locked ${lockCount} item(s)`);
    }
    catch (error) {
        core_8(error);
        core_7(error.message);
        if (typeof error.request === 'object') {
            core_9(JSON.stringify(error.request, null, 2));
        }
    }
    console.info(`End of locking task`);
}
// Only run if the action is executed in a repository with is in the Angular org. This is in place
// to prevent the action from actually running in a fork of a repository with this action set up.
if (github_1.repo.owner === 'angular') {
    run();
}
else {
    core_10('The Automatic Locking Closed issues was skipped as this action is only meant to run ' +
        'in repos belonging to the Angular organization.');
}
