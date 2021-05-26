var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = {exports: {}}).exports, mod), mod.exports;
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// node_modules/@actions/core/lib/command.js
var require_command = __commonJS({
  "node_modules/@actions/core/lib/command.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {value: true});
    var os = require("os");
    function issueCommand(command, properties, message) {
      const cmd = new Command(command, properties, message);
      process.stdout.write(cmd.toString() + os.EOL);
    }
    exports2.issueCommand = issueCommand;
    function issue(name, message = "") {
      issueCommand(name, {}, message);
    }
    exports2.issue = issue;
    var CMD_PREFIX = "##[";
    var Command = class {
      constructor(command, properties, message) {
        if (!command) {
          command = "missing.command";
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
      }
      toString() {
        let cmdStr = CMD_PREFIX + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
          cmdStr += " ";
          for (const key in this.properties) {
            if (this.properties.hasOwnProperty(key)) {
              const val = this.properties[key];
              if (val) {
                cmdStr += `${key}=${escape(`${val || ""}`)};`;
              }
            }
          }
        }
        cmdStr += "]";
        const message = `${this.message || ""}`;
        cmdStr += escapeData(message);
        return cmdStr;
      }
    };
    function escapeData(s) {
      return s.replace(/\r/g, "%0D").replace(/\n/g, "%0A");
    }
    function escape(s) {
      return s.replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/]/g, "%5D").replace(/;/g, "%3B");
    }
  }
});

// node_modules/@actions/core/lib/core.js
var require_core = __commonJS({
  "node_modules/@actions/core/lib/core.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", {value: true});
    var command_1 = require_command();
    var path = require("path");
    var ExitCode;
    (function(ExitCode2) {
      ExitCode2[ExitCode2["Success"] = 0] = "Success";
      ExitCode2[ExitCode2["Failure"] = 1] = "Failure";
    })(ExitCode = exports2.ExitCode || (exports2.ExitCode = {}));
    function exportVariable(name, val) {
      process.env[name] = val;
      command_1.issueCommand("set-env", {name}, val);
    }
    exports2.exportVariable = exportVariable;
    function exportSecret(name, val) {
      exportVariable(name, val);
      command_1.issueCommand("set-secret", {}, val);
      throw new Error("Not implemented.");
    }
    exports2.exportSecret = exportSecret;
    function addPath(inputPath) {
      command_1.issueCommand("add-path", {}, inputPath);
      process.env["PATH"] = `${inputPath}${path.delimiter}${process.env["PATH"]}`;
    }
    exports2.addPath = addPath;
    function getInput2(name, options) {
      const val = process.env[`INPUT_${name.replace(" ", "_").toUpperCase()}`] || "";
      if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
      }
      return val.trim();
    }
    exports2.getInput = getInput2;
    function setOutput(name, value) {
      command_1.issueCommand("set-output", {name}, value);
    }
    exports2.setOutput = setOutput;
    function setFailed2(message) {
      process.exitCode = ExitCode.Failure;
      error2(message);
    }
    exports2.setFailed = setFailed2;
    function debug2(message) {
      command_1.issueCommand("debug", {}, message);
    }
    exports2.debug = debug2;
    function error2(message) {
      command_1.issue("error", message);
    }
    exports2.error = error2;
    function warning2(message) {
      command_1.issue("warning", message);
    }
    exports2.warning = warning2;
    function startGroup2(name) {
      command_1.issue("group", name);
    }
    exports2.startGroup = startGroup2;
    function endGroup2() {
      command_1.issue("endgroup");
    }
    exports2.endGroup = endGroup2;
    function group(name, fn) {
      return __awaiter(this, void 0, void 0, function* () {
        startGroup2(name);
        let result;
        try {
          result = yield fn();
        } finally {
          endGroup2();
        }
        return result;
      });
    }
    exports2.group = group;
  }
});

// node_modules/deepmerge/dist/cjs.js
var require_cjs = __commonJS({
  "node_modules/deepmerge/dist/cjs.js"(exports2, module2) {
    "use strict";
    var isMergeableObject = function isMergeableObject2(value) {
      return isNonNullObject(value) && !isSpecial(value);
    };
    function isNonNullObject(value) {
      return !!value && typeof value === "object";
    }
    function isSpecial(value) {
      var stringValue = Object.prototype.toString.call(value);
      return stringValue === "[object RegExp]" || stringValue === "[object Date]" || isReactElement(value);
    }
    var canUseSymbol = typeof Symbol === "function" && Symbol.for;
    var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for("react.element") : 60103;
    function isReactElement(value) {
      return value.$$typeof === REACT_ELEMENT_TYPE;
    }
    function emptyTarget(val) {
      return Array.isArray(val) ? [] : {};
    }
    function cloneUnlessOtherwiseSpecified(value, options) {
      return options.clone !== false && options.isMergeableObject(value) ? deepmerge(emptyTarget(value), value, options) : value;
    }
    function defaultArrayMerge(target, source, options) {
      return target.concat(source).map(function(element) {
        return cloneUnlessOtherwiseSpecified(element, options);
      });
    }
    function getMergeFunction(key, options) {
      if (!options.customMerge) {
        return deepmerge;
      }
      var customMerge = options.customMerge(key);
      return typeof customMerge === "function" ? customMerge : deepmerge;
    }
    function getEnumerableOwnPropertySymbols(target) {
      return Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(target).filter(function(symbol) {
        return target.propertyIsEnumerable(symbol);
      }) : [];
    }
    function getKeys(target) {
      return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target));
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
      return destination;
    }
    function deepmerge(target, source, options) {
      options = options || {};
      options.arrayMerge = options.arrayMerge || defaultArrayMerge;
      options.isMergeableObject = options.isMergeableObject || isMergeableObject;
      var sourceIsArray = Array.isArray(source);
      var targetIsArray = Array.isArray(target);
      var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
      if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, options);
      } else if (sourceIsArray) {
        return options.arrayMerge(target, source, options);
      } else {
        return mergeObject(target, source, options);
      }
    }
    deepmerge.all = function deepmergeAll(array, options) {
      if (!Array.isArray(array)) {
        throw new Error("first argument should be an array");
      }
      return array.reduce(function(prev, next) {
        return deepmerge(prev, next, options);
      }, {});
    };
    var deepmerge_1 = deepmerge;
    module2.exports = deepmerge_1;
  }
});

// node_modules/is-plain-object/index.cjs.js
var require_index_cjs = __commonJS({
  "node_modules/is-plain-object/index.cjs.js"(exports2, module2) {
    "use strict";
    function isObject(val) {
      return val != null && typeof val === "object" && Array.isArray(val) === false;
    }
    function isObjectObject(o) {
      return isObject(o) === true && Object.prototype.toString.call(o) === "[object Object]";
    }
    function isPlainObject(o) {
      var ctor, prot;
      if (isObjectObject(o) === false)
        return false;
      ctor = o.constructor;
      if (typeof ctor !== "function")
        return false;
      prot = ctor.prototype;
      if (isObjectObject(prot) === false)
        return false;
      if (prot.hasOwnProperty("isPrototypeOf") === false) {
        return false;
      }
      return true;
    }
    module2.exports = isPlainObject;
  }
});

// node_modules/url-template/lib/url-template.js
var require_url_template = __commonJS({
  "node_modules/url-template/lib/url-template.js"(exports2, module2) {
    (function(root, factory) {
      if (typeof exports2 === "object") {
        module2.exports = factory();
      } else if (typeof define === "function" && define.amd) {
        define([], factory);
      } else {
        root.urltemplate = factory();
      }
    })(exports2, function() {
      function UrlTemplate() {
      }
      UrlTemplate.prototype.encodeReserved = function(str) {
        return str.split(/(%[0-9A-Fa-f]{2})/g).map(function(part) {
          if (!/%[0-9A-Fa-f]/.test(part)) {
            part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
          }
          return part;
        }).join("");
      };
      UrlTemplate.prototype.encodeUnreserved = function(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
          return "%" + c.charCodeAt(0).toString(16).toUpperCase();
        });
      };
      UrlTemplate.prototype.encodeValue = function(operator, value, key) {
        value = operator === "+" || operator === "#" ? this.encodeReserved(value) : this.encodeUnreserved(value);
        if (key) {
          return this.encodeUnreserved(key) + "=" + value;
        } else {
          return value;
        }
      };
      UrlTemplate.prototype.isDefined = function(value) {
        return value !== void 0 && value !== null;
      };
      UrlTemplate.prototype.isKeyOperator = function(operator) {
        return operator === ";" || operator === "&" || operator === "?";
      };
      UrlTemplate.prototype.getValues = function(context2, operator, key, modifier) {
        var value = context2[key], result = [];
        if (this.isDefined(value) && value !== "") {
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            value = value.toString();
            if (modifier && modifier !== "*") {
              value = value.substring(0, parseInt(modifier, 10));
            }
            result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
          } else {
            if (modifier === "*") {
              if (Array.isArray(value)) {
                value.filter(this.isDefined).forEach(function(value2) {
                  result.push(this.encodeValue(operator, value2, this.isKeyOperator(operator) ? key : null));
                }, this);
              } else {
                Object.keys(value).forEach(function(k) {
                  if (this.isDefined(value[k])) {
                    result.push(this.encodeValue(operator, value[k], k));
                  }
                }, this);
              }
            } else {
              var tmp = [];
              if (Array.isArray(value)) {
                value.filter(this.isDefined).forEach(function(value2) {
                  tmp.push(this.encodeValue(operator, value2));
                }, this);
              } else {
                Object.keys(value).forEach(function(k) {
                  if (this.isDefined(value[k])) {
                    tmp.push(this.encodeUnreserved(k));
                    tmp.push(this.encodeValue(operator, value[k].toString()));
                  }
                }, this);
              }
              if (this.isKeyOperator(operator)) {
                result.push(this.encodeUnreserved(key) + "=" + tmp.join(","));
              } else if (tmp.length !== 0) {
                result.push(tmp.join(","));
              }
            }
          }
        } else {
          if (operator === ";") {
            if (this.isDefined(value)) {
              result.push(this.encodeUnreserved(key));
            }
          } else if (value === "" && (operator === "&" || operator === "?")) {
            result.push(this.encodeUnreserved(key) + "=");
          } else if (value === "") {
            result.push("");
          }
        }
        return result;
      };
      UrlTemplate.prototype.parse = function(template) {
        var that = this;
        var operators = ["+", "#", ".", "/", ";", "?", "&"];
        return {
          expand: function(context2) {
            return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function(_, expression, literal) {
              if (expression) {
                var operator = null, values = [];
                if (operators.indexOf(expression.charAt(0)) !== -1) {
                  operator = expression.charAt(0);
                  expression = expression.substr(1);
                }
                expression.split(/,/g).forEach(function(variable) {
                  var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
                  values.push.apply(values, that.getValues(context2, operator, tmp[1], tmp[2] || tmp[3]));
                });
                if (operator && operator !== "+") {
                  var separator = ",";
                  if (operator === "?") {
                    separator = "&";
                  } else if (operator !== "#") {
                    separator = operator;
                  }
                  return (values.length !== 0 ? operator : "") + values.join(separator);
                } else {
                  return values.join(",");
                }
              } else {
                return that.encodeReserved(literal);
              }
            });
          }
        };
      };
      return new UrlTemplate();
    });
  }
});

// node_modules/macos-release/index.js
var require_macos_release = __commonJS({
  "node_modules/macos-release/index.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var nameMap = new Map([
      [19, "Catalina"],
      [18, "Mojave"],
      [17, "High Sierra"],
      [16, "Sierra"],
      [15, "El Capitan"],
      [14, "Yosemite"],
      [13, "Mavericks"],
      [12, "Mountain Lion"],
      [11, "Lion"],
      [10, "Snow Leopard"],
      [9, "Leopard"],
      [8, "Tiger"],
      [7, "Panther"],
      [6, "Jaguar"],
      [5, "Puma"]
    ]);
    var macosRelease = (release) => {
      release = Number((release || os.release()).split(".")[0]);
      return {
        name: nameMap.get(release),
        version: "10." + (release - 4)
      };
    };
    module2.exports = macosRelease;
    module2.exports.default = macosRelease;
  }
});

// node_modules/nice-try/src/index.js
var require_src = __commonJS({
  "node_modules/nice-try/src/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(fn) {
      try {
        return fn();
      } catch (e) {
      }
    };
  }
});

// node_modules/isexe/windows.js
var require_windows = __commonJS({
  "node_modules/isexe/windows.js"(exports2, module2) {
    module2.exports = isexe;
    isexe.sync = sync;
    var fs = require("fs");
    function checkPathExt(path, options) {
      var pathext = options.pathExt !== void 0 ? options.pathExt : process.env.PATHEXT;
      if (!pathext) {
        return true;
      }
      pathext = pathext.split(";");
      if (pathext.indexOf("") !== -1) {
        return true;
      }
      for (var i = 0; i < pathext.length; i++) {
        var p = pathext[i].toLowerCase();
        if (p && path.substr(-p.length).toLowerCase() === p) {
          return true;
        }
      }
      return false;
    }
    function checkStat(stat, path, options) {
      if (!stat.isSymbolicLink() && !stat.isFile()) {
        return false;
      }
      return checkPathExt(path, options);
    }
    function isexe(path, options, cb) {
      fs.stat(path, function(er, stat) {
        cb(er, er ? false : checkStat(stat, path, options));
      });
    }
    function sync(path, options) {
      return checkStat(fs.statSync(path), path, options);
    }
  }
});

// node_modules/isexe/mode.js
var require_mode = __commonJS({
  "node_modules/isexe/mode.js"(exports2, module2) {
    module2.exports = isexe;
    isexe.sync = sync;
    var fs = require("fs");
    function isexe(path, options, cb) {
      fs.stat(path, function(er, stat) {
        cb(er, er ? false : checkStat(stat, options));
      });
    }
    function sync(path, options) {
      return checkStat(fs.statSync(path), options);
    }
    function checkStat(stat, options) {
      return stat.isFile() && checkMode(stat, options);
    }
    function checkMode(stat, options) {
      var mod = stat.mode;
      var uid = stat.uid;
      var gid = stat.gid;
      var myUid = options.uid !== void 0 ? options.uid : process.getuid && process.getuid();
      var myGid = options.gid !== void 0 ? options.gid : process.getgid && process.getgid();
      var u = parseInt("100", 8);
      var g = parseInt("010", 8);
      var o = parseInt("001", 8);
      var ug = u | g;
      var ret = mod & o || mod & g && gid === myGid || mod & u && uid === myUid || mod & ug && myUid === 0;
      return ret;
    }
  }
});

// node_modules/isexe/index.js
var require_isexe = __commonJS({
  "node_modules/isexe/index.js"(exports2, module2) {
    var fs = require("fs");
    var core2;
    if (process.platform === "win32" || global.TESTING_WINDOWS) {
      core2 = require_windows();
    } else {
      core2 = require_mode();
    }
    module2.exports = isexe;
    isexe.sync = sync;
    function isexe(path, options, cb) {
      if (typeof options === "function") {
        cb = options;
        options = {};
      }
      if (!cb) {
        if (typeof Promise !== "function") {
          throw new TypeError("callback not provided");
        }
        return new Promise(function(resolve, reject) {
          isexe(path, options || {}, function(er, is) {
            if (er) {
              reject(er);
            } else {
              resolve(is);
            }
          });
        });
      }
      core2(path, options || {}, function(er, is) {
        if (er) {
          if (er.code === "EACCES" || options && options.ignoreErrors) {
            er = null;
            is = false;
          }
        }
        cb(er, is);
      });
    }
    function sync(path, options) {
      try {
        return core2.sync(path, options || {});
      } catch (er) {
        if (options && options.ignoreErrors || er.code === "EACCES") {
          return false;
        } else {
          throw er;
        }
      }
    }
  }
});

// node_modules/which/which.js
var require_which = __commonJS({
  "node_modules/which/which.js"(exports2, module2) {
    module2.exports = which;
    which.sync = whichSync;
    var isWindows = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
    var path = require("path");
    var COLON = isWindows ? ";" : ":";
    var isexe = require_isexe();
    function getNotFoundError(cmd) {
      var er = new Error("not found: " + cmd);
      er.code = "ENOENT";
      return er;
    }
    function getPathInfo(cmd, opt) {
      var colon = opt.colon || COLON;
      var pathEnv = opt.path || process.env.PATH || "";
      var pathExt = [""];
      pathEnv = pathEnv.split(colon);
      var pathExtExe = "";
      if (isWindows) {
        pathEnv.unshift(process.cwd());
        pathExtExe = opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM";
        pathExt = pathExtExe.split(colon);
        if (cmd.indexOf(".") !== -1 && pathExt[0] !== "")
          pathExt.unshift("");
      }
      if (cmd.match(/\//) || isWindows && cmd.match(/\\/))
        pathEnv = [""];
      return {
        env: pathEnv,
        ext: pathExt,
        extExe: pathExtExe
      };
    }
    function which(cmd, opt, cb) {
      if (typeof opt === "function") {
        cb = opt;
        opt = {};
      }
      var info = getPathInfo(cmd, opt);
      var pathEnv = info.env;
      var pathExt = info.ext;
      var pathExtExe = info.extExe;
      var found = [];
      (function F(i, l) {
        if (i === l) {
          if (opt.all && found.length)
            return cb(null, found);
          else
            return cb(getNotFoundError(cmd));
        }
        var pathPart = pathEnv[i];
        if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"')
          pathPart = pathPart.slice(1, -1);
        var p = path.join(pathPart, cmd);
        if (!pathPart && /^\.[\\\/]/.test(cmd)) {
          p = cmd.slice(0, 2) + p;
        }
        ;
        (function E(ii, ll) {
          if (ii === ll)
            return F(i + 1, l);
          var ext = pathExt[ii];
          isexe(p + ext, {pathExt: pathExtExe}, function(er, is) {
            if (!er && is) {
              if (opt.all)
                found.push(p + ext);
              else
                return cb(null, p + ext);
            }
            return E(ii + 1, ll);
          });
        })(0, pathExt.length);
      })(0, pathEnv.length);
    }
    function whichSync(cmd, opt) {
      opt = opt || {};
      var info = getPathInfo(cmd, opt);
      var pathEnv = info.env;
      var pathExt = info.ext;
      var pathExtExe = info.extExe;
      var found = [];
      for (var i = 0, l = pathEnv.length; i < l; i++) {
        var pathPart = pathEnv[i];
        if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"')
          pathPart = pathPart.slice(1, -1);
        var p = path.join(pathPart, cmd);
        if (!pathPart && /^\.[\\\/]/.test(cmd)) {
          p = cmd.slice(0, 2) + p;
        }
        for (var j = 0, ll = pathExt.length; j < ll; j++) {
          var cur = p + pathExt[j];
          var is;
          try {
            is = isexe.sync(cur, {pathExt: pathExtExe});
            if (is) {
              if (opt.all)
                found.push(cur);
              else
                return cur;
            }
          } catch (ex) {
          }
        }
      }
      if (opt.all && found.length)
        return found;
      if (opt.nothrow)
        return null;
      throw getNotFoundError(cmd);
    }
  }
});

// node_modules/path-key/index.js
var require_path_key = __commonJS({
  "node_modules/path-key/index.js"(exports2, module2) {
    "use strict";
    module2.exports = (opts) => {
      opts = opts || {};
      const env = opts.env || process.env;
      const platform = opts.platform || process.platform;
      if (platform !== "win32") {
        return "PATH";
      }
      return Object.keys(env).find((x) => x.toUpperCase() === "PATH") || "Path";
    };
  }
});

// node_modules/cross-spawn/lib/util/resolveCommand.js
var require_resolveCommand = __commonJS({
  "node_modules/cross-spawn/lib/util/resolveCommand.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    var which = require_which();
    var pathKey = require_path_key()();
    function resolveCommandAttempt(parsed, withoutPathExt) {
      const cwd = process.cwd();
      const hasCustomCwd = parsed.options.cwd != null;
      if (hasCustomCwd) {
        try {
          process.chdir(parsed.options.cwd);
        } catch (err) {
        }
      }
      let resolved;
      try {
        resolved = which.sync(parsed.command, {
          path: (parsed.options.env || process.env)[pathKey],
          pathExt: withoutPathExt ? path.delimiter : void 0
        });
      } catch (e) {
      } finally {
        process.chdir(cwd);
      }
      if (resolved) {
        resolved = path.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved);
      }
      return resolved;
    }
    function resolveCommand(parsed) {
      return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true);
    }
    module2.exports = resolveCommand;
  }
});

// node_modules/cross-spawn/lib/util/escape.js
var require_escape = __commonJS({
  "node_modules/cross-spawn/lib/util/escape.js"(exports2, module2) {
    "use strict";
    var metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g;
    function escapeCommand(arg) {
      arg = arg.replace(metaCharsRegExp, "^$1");
      return arg;
    }
    function escapeArgument(arg, doubleEscapeMetaChars) {
      arg = `${arg}`;
      arg = arg.replace(/(\\*)"/g, '$1$1\\"');
      arg = arg.replace(/(\\*)$/, "$1$1");
      arg = `"${arg}"`;
      arg = arg.replace(metaCharsRegExp, "^$1");
      if (doubleEscapeMetaChars) {
        arg = arg.replace(metaCharsRegExp, "^$1");
      }
      return arg;
    }
    module2.exports.command = escapeCommand;
    module2.exports.argument = escapeArgument;
  }
});

// node_modules/shebang-regex/index.js
var require_shebang_regex = __commonJS({
  "node_modules/shebang-regex/index.js"(exports2, module2) {
    "use strict";
    module2.exports = /^#!.*/;
  }
});

// node_modules/shebang-command/index.js
var require_shebang_command = __commonJS({
  "node_modules/shebang-command/index.js"(exports2, module2) {
    "use strict";
    var shebangRegex = require_shebang_regex();
    module2.exports = function(str) {
      var match = str.match(shebangRegex);
      if (!match) {
        return null;
      }
      var arr = match[0].replace(/#! ?/, "").split(" ");
      var bin = arr[0].split("/").pop();
      var arg = arr[1];
      return bin === "env" ? arg : bin + (arg ? " " + arg : "");
    };
  }
});

// node_modules/cross-spawn/lib/util/readShebang.js
var require_readShebang = __commonJS({
  "node_modules/cross-spawn/lib/util/readShebang.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var shebangCommand = require_shebang_command();
    function readShebang(command) {
      const size = 150;
      let buffer;
      if (Buffer.alloc) {
        buffer = Buffer.alloc(size);
      } else {
        buffer = new Buffer(size);
        buffer.fill(0);
      }
      let fd;
      try {
        fd = fs.openSync(command, "r");
        fs.readSync(fd, buffer, 0, size, 0);
        fs.closeSync(fd);
      } catch (e) {
      }
      return shebangCommand(buffer.toString());
    }
    module2.exports = readShebang;
  }
});

// node_modules/semver/semver.js
var require_semver = __commonJS({
  "node_modules/semver/semver.js"(exports2, module2) {
    exports2 = module2.exports = SemVer;
    var debug2;
    if (typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG)) {
      debug2 = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift("SEMVER");
        console.log.apply(console, args);
      };
    } else {
      debug2 = function() {
      };
    }
    exports2.SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var re = exports2.re = [];
    var src = exports2.src = [];
    var R = 0;
    var NUMERICIDENTIFIER = R++;
    src[NUMERICIDENTIFIER] = "0|[1-9]\\d*";
    var NUMERICIDENTIFIERLOOSE = R++;
    src[NUMERICIDENTIFIERLOOSE] = "[0-9]+";
    var NONNUMERICIDENTIFIER = R++;
    src[NONNUMERICIDENTIFIER] = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
    var MAINVERSION = R++;
    src[MAINVERSION] = "(" + src[NUMERICIDENTIFIER] + ")\\.(" + src[NUMERICIDENTIFIER] + ")\\.(" + src[NUMERICIDENTIFIER] + ")";
    var MAINVERSIONLOOSE = R++;
    src[MAINVERSIONLOOSE] = "(" + src[NUMERICIDENTIFIERLOOSE] + ")\\.(" + src[NUMERICIDENTIFIERLOOSE] + ")\\.(" + src[NUMERICIDENTIFIERLOOSE] + ")";
    var PRERELEASEIDENTIFIER = R++;
    src[PRERELEASEIDENTIFIER] = "(?:" + src[NUMERICIDENTIFIER] + "|" + src[NONNUMERICIDENTIFIER] + ")";
    var PRERELEASEIDENTIFIERLOOSE = R++;
    src[PRERELEASEIDENTIFIERLOOSE] = "(?:" + src[NUMERICIDENTIFIERLOOSE] + "|" + src[NONNUMERICIDENTIFIER] + ")";
    var PRERELEASE = R++;
    src[PRERELEASE] = "(?:-(" + src[PRERELEASEIDENTIFIER] + "(?:\\." + src[PRERELEASEIDENTIFIER] + ")*))";
    var PRERELEASELOOSE = R++;
    src[PRERELEASELOOSE] = "(?:-?(" + src[PRERELEASEIDENTIFIERLOOSE] + "(?:\\." + src[PRERELEASEIDENTIFIERLOOSE] + ")*))";
    var BUILDIDENTIFIER = R++;
    src[BUILDIDENTIFIER] = "[0-9A-Za-z-]+";
    var BUILD = R++;
    src[BUILD] = "(?:\\+(" + src[BUILDIDENTIFIER] + "(?:\\." + src[BUILDIDENTIFIER] + ")*))";
    var FULL = R++;
    var FULLPLAIN = "v?" + src[MAINVERSION] + src[PRERELEASE] + "?" + src[BUILD] + "?";
    src[FULL] = "^" + FULLPLAIN + "$";
    var LOOSEPLAIN = "[v=\\s]*" + src[MAINVERSIONLOOSE] + src[PRERELEASELOOSE] + "?" + src[BUILD] + "?";
    var LOOSE = R++;
    src[LOOSE] = "^" + LOOSEPLAIN + "$";
    var GTLT = R++;
    src[GTLT] = "((?:<|>)?=?)";
    var XRANGEIDENTIFIERLOOSE = R++;
    src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + "|x|X|\\*";
    var XRANGEIDENTIFIER = R++;
    src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + "|x|X|\\*";
    var XRANGEPLAIN = R++;
    src[XRANGEPLAIN] = "[v=\\s]*(" + src[XRANGEIDENTIFIER] + ")(?:\\.(" + src[XRANGEIDENTIFIER] + ")(?:\\.(" + src[XRANGEIDENTIFIER] + ")(?:" + src[PRERELEASE] + ")?" + src[BUILD] + "?)?)?";
    var XRANGEPLAINLOOSE = R++;
    src[XRANGEPLAINLOOSE] = "[v=\\s]*(" + src[XRANGEIDENTIFIERLOOSE] + ")(?:\\.(" + src[XRANGEIDENTIFIERLOOSE] + ")(?:\\.(" + src[XRANGEIDENTIFIERLOOSE] + ")(?:" + src[PRERELEASELOOSE] + ")?" + src[BUILD] + "?)?)?";
    var XRANGE = R++;
    src[XRANGE] = "^" + src[GTLT] + "\\s*" + src[XRANGEPLAIN] + "$";
    var XRANGELOOSE = R++;
    src[XRANGELOOSE] = "^" + src[GTLT] + "\\s*" + src[XRANGEPLAINLOOSE] + "$";
    var COERCE = R++;
    src[COERCE] = "(?:^|[^\\d])(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "})(?:\\.(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "}))?(?:\\.(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "}))?(?:$|[^\\d])";
    var LONETILDE = R++;
    src[LONETILDE] = "(?:~>?)";
    var TILDETRIM = R++;
    src[TILDETRIM] = "(\\s*)" + src[LONETILDE] + "\\s+";
    re[TILDETRIM] = new RegExp(src[TILDETRIM], "g");
    var tildeTrimReplace = "$1~";
    var TILDE = R++;
    src[TILDE] = "^" + src[LONETILDE] + src[XRANGEPLAIN] + "$";
    var TILDELOOSE = R++;
    src[TILDELOOSE] = "^" + src[LONETILDE] + src[XRANGEPLAINLOOSE] + "$";
    var LONECARET = R++;
    src[LONECARET] = "(?:\\^)";
    var CARETTRIM = R++;
    src[CARETTRIM] = "(\\s*)" + src[LONECARET] + "\\s+";
    re[CARETTRIM] = new RegExp(src[CARETTRIM], "g");
    var caretTrimReplace = "$1^";
    var CARET = R++;
    src[CARET] = "^" + src[LONECARET] + src[XRANGEPLAIN] + "$";
    var CARETLOOSE = R++;
    src[CARETLOOSE] = "^" + src[LONECARET] + src[XRANGEPLAINLOOSE] + "$";
    var COMPARATORLOOSE = R++;
    src[COMPARATORLOOSE] = "^" + src[GTLT] + "\\s*(" + LOOSEPLAIN + ")$|^$";
    var COMPARATOR = R++;
    src[COMPARATOR] = "^" + src[GTLT] + "\\s*(" + FULLPLAIN + ")$|^$";
    var COMPARATORTRIM = R++;
    src[COMPARATORTRIM] = "(\\s*)" + src[GTLT] + "\\s*(" + LOOSEPLAIN + "|" + src[XRANGEPLAIN] + ")";
    re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], "g");
    var comparatorTrimReplace = "$1$2$3";
    var HYPHENRANGE = R++;
    src[HYPHENRANGE] = "^\\s*(" + src[XRANGEPLAIN] + ")\\s+-\\s+(" + src[XRANGEPLAIN] + ")\\s*$";
    var HYPHENRANGELOOSE = R++;
    src[HYPHENRANGELOOSE] = "^\\s*(" + src[XRANGEPLAINLOOSE] + ")\\s+-\\s+(" + src[XRANGEPLAINLOOSE] + ")\\s*$";
    var STAR = R++;
    src[STAR] = "(<|>)?=?\\s*\\*";
    for (var i = 0; i < R; i++) {
      debug2(i, src[i]);
      if (!re[i]) {
        re[i] = new RegExp(src[i]);
      }
    }
    exports2.parse = parse;
    function parse(version, options) {
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version !== "string") {
        return null;
      }
      if (version.length > MAX_LENGTH) {
        return null;
      }
      var r = options.loose ? re[LOOSE] : re[FULL];
      if (!r.test(version)) {
        return null;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        return null;
      }
    }
    exports2.valid = valid;
    function valid(version, options) {
      var v = parse(version, options);
      return v ? v.version : null;
    }
    exports2.clean = clean;
    function clean(version, options) {
      var s = parse(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    }
    exports2.SemVer = SemVer;
    function SemVer(version, options) {
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (version instanceof SemVer) {
        if (version.loose === options.loose) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError("Invalid Version: " + version);
      }
      if (version.length > MAX_LENGTH) {
        throw new TypeError("version is longer than " + MAX_LENGTH + " characters");
      }
      if (!(this instanceof SemVer)) {
        return new SemVer(version, options);
      }
      debug2("SemVer", version, options);
      this.options = options;
      this.loose = !!options.loose;
      var m = version.trim().match(options.loose ? re[LOOSE] : re[FULL]);
      if (!m) {
        throw new TypeError("Invalid Version: " + version);
      }
      this.raw = version;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
        throw new TypeError("Invalid major version");
      }
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
        throw new TypeError("Invalid minor version");
      }
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
        throw new TypeError("Invalid patch version");
      }
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split(".").map(function(id) {
          if (/^[0-9]+$/.test(id)) {
            var num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num;
            }
          }
          return id;
        });
      }
      this.build = m[5] ? m[5].split(".") : [];
      this.format();
    }
    SemVer.prototype.format = function() {
      this.version = this.major + "." + this.minor + "." + this.patch;
      if (this.prerelease.length) {
        this.version += "-" + this.prerelease.join(".");
      }
      return this.version;
    };
    SemVer.prototype.toString = function() {
      return this.version;
    };
    SemVer.prototype.compare = function(other) {
      debug2("SemVer.compare", this.version, this.options, other);
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      return this.compareMain(other) || this.comparePre(other);
    };
    SemVer.prototype.compareMain = function(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
    };
    SemVer.prototype.comparePre = function(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.prerelease.length && !other.prerelease.length) {
        return -1;
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1;
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0;
      }
      var i2 = 0;
      do {
        var a = this.prerelease[i2];
        var b = other.prerelease[i2];
        debug2("prerelease compare", i2, a, b);
        if (a === void 0 && b === void 0) {
          return 0;
        } else if (b === void 0) {
          return 1;
        } else if (a === void 0) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i2);
    };
    SemVer.prototype.inc = function(release, identifier) {
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier);
          this.inc("pre", identifier);
          break;
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier);
          }
          this.inc("pre", identifier);
          break;
        case "major":
          if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
            this.major++;
          }
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break;
        case "minor":
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++;
          }
          this.patch = 0;
          this.prerelease = [];
          break;
        case "patch":
          if (this.prerelease.length === 0) {
            this.patch++;
          }
          this.prerelease = [];
          break;
        case "pre":
          if (this.prerelease.length === 0) {
            this.prerelease = [0];
          } else {
            var i2 = this.prerelease.length;
            while (--i2 >= 0) {
              if (typeof this.prerelease[i2] === "number") {
                this.prerelease[i2]++;
                i2 = -2;
              }
            }
            if (i2 === -1) {
              this.prerelease.push(0);
            }
          }
          if (identifier) {
            if (this.prerelease[0] === identifier) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = [identifier, 0];
              }
            } else {
              this.prerelease = [identifier, 0];
            }
          }
          break;
        default:
          throw new Error("invalid increment argument: " + release);
      }
      this.format();
      this.raw = this.version;
      return this;
    };
    exports2.inc = inc;
    function inc(version, release, loose, identifier) {
      if (typeof loose === "string") {
        identifier = loose;
        loose = void 0;
      }
      try {
        return new SemVer(version, loose).inc(release, identifier).version;
      } catch (er) {
        return null;
      }
    }
    exports2.diff = diff;
    function diff(version1, version2) {
      if (eq(version1, version2)) {
        return null;
      } else {
        var v1 = parse(version1);
        var v2 = parse(version2);
        var prefix = "";
        if (v1.prerelease.length || v2.prerelease.length) {
          prefix = "pre";
          var defaultResult = "prerelease";
        }
        for (var key in v1) {
          if (key === "major" || key === "minor" || key === "patch") {
            if (v1[key] !== v2[key]) {
              return prefix + key;
            }
          }
        }
        return defaultResult;
      }
    }
    exports2.compareIdentifiers = compareIdentifiers;
    var numeric = /^[0-9]+$/;
    function compareIdentifiers(a, b) {
      var anum = numeric.test(a);
      var bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    }
    exports2.rcompareIdentifiers = rcompareIdentifiers;
    function rcompareIdentifiers(a, b) {
      return compareIdentifiers(b, a);
    }
    exports2.major = major;
    function major(a, loose) {
      return new SemVer(a, loose).major;
    }
    exports2.minor = minor;
    function minor(a, loose) {
      return new SemVer(a, loose).minor;
    }
    exports2.patch = patch;
    function patch(a, loose) {
      return new SemVer(a, loose).patch;
    }
    exports2.compare = compare;
    function compare(a, b, loose) {
      return new SemVer(a, loose).compare(new SemVer(b, loose));
    }
    exports2.compareLoose = compareLoose;
    function compareLoose(a, b) {
      return compare(a, b, true);
    }
    exports2.rcompare = rcompare;
    function rcompare(a, b, loose) {
      return compare(b, a, loose);
    }
    exports2.sort = sort;
    function sort(list, loose) {
      return list.sort(function(a, b) {
        return exports2.compare(a, b, loose);
      });
    }
    exports2.rsort = rsort;
    function rsort(list, loose) {
      return list.sort(function(a, b) {
        return exports2.rcompare(a, b, loose);
      });
    }
    exports2.gt = gt;
    function gt(a, b, loose) {
      return compare(a, b, loose) > 0;
    }
    exports2.lt = lt;
    function lt(a, b, loose) {
      return compare(a, b, loose) < 0;
    }
    exports2.eq = eq;
    function eq(a, b, loose) {
      return compare(a, b, loose) === 0;
    }
    exports2.neq = neq;
    function neq(a, b, loose) {
      return compare(a, b, loose) !== 0;
    }
    exports2.gte = gte;
    function gte(a, b, loose) {
      return compare(a, b, loose) >= 0;
    }
    exports2.lte = lte;
    function lte(a, b, loose) {
      return compare(a, b, loose) <= 0;
    }
    exports2.cmp = cmp;
    function cmp(a, op, b, loose) {
      switch (op) {
        case "===":
          if (typeof a === "object")
            a = a.version;
          if (typeof b === "object")
            b = b.version;
          return a === b;
        case "!==":
          if (typeof a === "object")
            a = a.version;
          if (typeof b === "object")
            b = b.version;
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError("Invalid operator: " + op);
      }
    }
    exports2.Comparator = Comparator;
    function Comparator(comp, options) {
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      if (!(this instanceof Comparator)) {
        return new Comparator(comp, options);
      }
      debug2("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug2("comp", this);
    }
    var ANY = {};
    Comparator.prototype.parse = function(comp) {
      var r = this.options.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
      var m = comp.match(r);
      if (!m) {
        throw new TypeError("Invalid comparator: " + comp);
      }
      this.operator = m[1];
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY;
      } else {
        this.semver = new SemVer(m[2], this.options.loose);
      }
    };
    Comparator.prototype.toString = function() {
      return this.value;
    };
    Comparator.prototype.test = function(version) {
      debug2("Comparator.test", version, this.options.loose);
      if (this.semver === ANY) {
        return true;
      }
      if (typeof version === "string") {
        version = new SemVer(version, this.options);
      }
      return cmp(version, this.operator, this.semver, this.options);
    };
    Comparator.prototype.intersects = function(comp, options) {
      if (!(comp instanceof Comparator)) {
        throw new TypeError("a Comparator is required");
      }
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      var rangeTmp;
      if (this.operator === "") {
        rangeTmp = new Range(comp.value, options);
        return satisfies(this.value, rangeTmp, options);
      } else if (comp.operator === "") {
        rangeTmp = new Range(this.value, options);
        return satisfies(comp.semver, rangeTmp, options);
      }
      var sameDirectionIncreasing = (this.operator === ">=" || this.operator === ">") && (comp.operator === ">=" || comp.operator === ">");
      var sameDirectionDecreasing = (this.operator === "<=" || this.operator === "<") && (comp.operator === "<=" || comp.operator === "<");
      var sameSemVer = this.semver.version === comp.semver.version;
      var differentDirectionsInclusive = (this.operator === ">=" || this.operator === "<=") && (comp.operator === ">=" || comp.operator === "<=");
      var oppositeDirectionsLessThan = cmp(this.semver, "<", comp.semver, options) && ((this.operator === ">=" || this.operator === ">") && (comp.operator === "<=" || comp.operator === "<"));
      var oppositeDirectionsGreaterThan = cmp(this.semver, ">", comp.semver, options) && ((this.operator === "<=" || this.operator === "<") && (comp.operator === ">=" || comp.operator === ">"));
      return sameDirectionIncreasing || sameDirectionDecreasing || sameSemVer && differentDirectionsInclusive || oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
    };
    exports2.Range = Range;
    function Range(range, options) {
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (range instanceof Range) {
        if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
          return range;
        } else {
          return new Range(range.raw, options);
        }
      }
      if (range instanceof Comparator) {
        return new Range(range.value, options);
      }
      if (!(this instanceof Range)) {
        return new Range(range, options);
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range;
      this.set = range.split(/\s*\|\|\s*/).map(function(range2) {
        return this.parseRange(range2.trim());
      }, this).filter(function(c) {
        return c.length;
      });
      if (!this.set.length) {
        throw new TypeError("Invalid SemVer Range: " + range);
      }
      this.format();
    }
    Range.prototype.format = function() {
      this.range = this.set.map(function(comps) {
        return comps.join(" ").trim();
      }).join("||").trim();
      return this.range;
    };
    Range.prototype.toString = function() {
      return this.range;
    };
    Range.prototype.parseRange = function(range) {
      var loose = this.options.loose;
      range = range.trim();
      var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
      range = range.replace(hr, hyphenReplace);
      debug2("hyphen replace", range);
      range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
      debug2("comparator trim", range, re[COMPARATORTRIM]);
      range = range.replace(re[TILDETRIM], tildeTrimReplace);
      range = range.replace(re[CARETTRIM], caretTrimReplace);
      range = range.split(/\s+/).join(" ");
      var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
      var set = range.split(" ").map(function(comp) {
        return parseComparator(comp, this.options);
      }, this).join(" ").split(/\s+/);
      if (this.options.loose) {
        set = set.filter(function(comp) {
          return !!comp.match(compRe);
        });
      }
      set = set.map(function(comp) {
        return new Comparator(comp, this.options);
      }, this);
      return set;
    };
    Range.prototype.intersects = function(range, options) {
      if (!(range instanceof Range)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some(function(thisComparators) {
        return thisComparators.every(function(thisComparator) {
          return range.set.some(function(rangeComparators) {
            return rangeComparators.every(function(rangeComparator) {
              return thisComparator.intersects(rangeComparator, options);
            });
          });
        });
      });
    };
    exports2.toComparators = toComparators;
    function toComparators(range, options) {
      return new Range(range, options).set.map(function(comp) {
        return comp.map(function(c) {
          return c.value;
        }).join(" ").trim().split(" ");
      });
    }
    function parseComparator(comp, options) {
      debug2("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug2("caret", comp);
      comp = replaceTildes(comp, options);
      debug2("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug2("xrange", comp);
      comp = replaceStars(comp, options);
      debug2("stars", comp);
      return comp;
    }
    function isX(id) {
      return !id || id.toLowerCase() === "x" || id === "*";
    }
    function replaceTildes(comp, options) {
      return comp.trim().split(/\s+/).map(function(comp2) {
        return replaceTilde(comp2, options);
      }).join(" ");
    }
    function replaceTilde(comp, options) {
      var r = options.loose ? re[TILDELOOSE] : re[TILDE];
      return comp.replace(r, function(_, M, m, p, pr) {
        debug2("tilde", comp, _, M, m, p, pr);
        var ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
        } else if (isX(p)) {
          ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
        } else if (pr) {
          debug2("replaceTilde pr", pr);
          ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + (+m + 1) + ".0";
        } else {
          ret = ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0";
        }
        debug2("tilde return", ret);
        return ret;
      });
    }
    function replaceCarets(comp, options) {
      return comp.trim().split(/\s+/).map(function(comp2) {
        return replaceCaret(comp2, options);
      }).join(" ");
    }
    function replaceCaret(comp, options) {
      debug2("caret", comp, options);
      var r = options.loose ? re[CARETLOOSE] : re[CARET];
      return comp.replace(r, function(_, M, m, p, pr) {
        debug2("caret", comp, _, M, m, p, pr);
        var ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
        } else if (isX(p)) {
          if (M === "0") {
            ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
          } else {
            ret = ">=" + M + "." + m + ".0 <" + (+M + 1) + ".0.0";
          }
        } else if (pr) {
          debug2("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + m + "." + (+p + 1);
            } else {
              ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + (+m + 1) + ".0";
            }
          } else {
            ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + (+M + 1) + ".0.0";
          }
        } else {
          debug2("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = ">=" + M + "." + m + "." + p + " <" + M + "." + m + "." + (+p + 1);
            } else {
              ret = ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0";
            }
          } else {
            ret = ">=" + M + "." + m + "." + p + " <" + (+M + 1) + ".0.0";
          }
        }
        debug2("caret return", ret);
        return ret;
      });
    }
    function replaceXRanges(comp, options) {
      debug2("replaceXRanges", comp, options);
      return comp.split(/\s+/).map(function(comp2) {
        return replaceXRange(comp2, options);
      }).join(" ");
    }
    function replaceXRange(comp, options) {
      comp = comp.trim();
      var r = options.loose ? re[XRANGELOOSE] : re[XRANGE];
      return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
        debug2("xRange", comp, ret, gtlt, M, m, p, pr);
        var xM = isX(M);
        var xm = xM || isX(m);
        var xp = xm || isX(p);
        var anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          ret = gtlt + M + "." + m + "." + p;
        } else if (xm) {
          ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
        } else if (xp) {
          ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
        }
        debug2("xRange return", ret);
        return ret;
      });
    }
    function replaceStars(comp, options) {
      debug2("replaceStars", comp, options);
      return comp.trim().replace(re[STAR], "");
    }
    function hyphenReplace($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = ">=" + fM + ".0.0";
      } else if (isX(fp)) {
        from = ">=" + fM + "." + fm + ".0";
      } else {
        from = ">=" + from;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = "<" + (+tM + 1) + ".0.0";
      } else if (isX(tp)) {
        to = "<" + tM + "." + (+tm + 1) + ".0";
      } else if (tpr) {
        to = "<=" + tM + "." + tm + "." + tp + "-" + tpr;
      } else {
        to = "<=" + to;
      }
      return (from + " " + to).trim();
    }
    Range.prototype.test = function(version) {
      if (!version) {
        return false;
      }
      if (typeof version === "string") {
        version = new SemVer(version, this.options);
      }
      for (var i2 = 0; i2 < this.set.length; i2++) {
        if (testSet(this.set[i2], version, this.options)) {
          return true;
        }
      }
      return false;
    };
    function testSet(set, version, options) {
      for (var i2 = 0; i2 < set.length; i2++) {
        if (!set[i2].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (i2 = 0; i2 < set.length; i2++) {
          debug2(set[i2].semver);
          if (set[i2].semver === ANY) {
            continue;
          }
          if (set[i2].semver.prerelease.length > 0) {
            var allowed = set[i2].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    }
    exports2.satisfies = satisfies;
    function satisfies(version, range, options) {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    }
    exports2.maxSatisfying = maxSatisfying;
    function maxSatisfying(versions, range, options) {
      var max = null;
      var maxSV = null;
      try {
        var rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach(function(v) {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    }
    exports2.minSatisfying = minSatisfying;
    function minSatisfying(versions, range, options) {
      var min = null;
      var minSV = null;
      try {
        var rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach(function(v) {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    }
    exports2.minVersion = minVersion;
    function minVersion(range, loose) {
      range = new Range(range, loose);
      var minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (var i2 = 0; i2 < range.set.length; ++i2) {
        var comparators = range.set[i2];
        comparators.forEach(function(comparator) {
          var compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            case "":
            case ">=":
              if (!minver || gt(minver, compver)) {
                minver = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            default:
              throw new Error("Unexpected operation: " + comparator.operator);
          }
        });
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    }
    exports2.validRange = validRange;
    function validRange(range, options) {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    }
    exports2.ltr = ltr;
    function ltr(version, range, options) {
      return outside(version, range, "<", options);
    }
    exports2.gtr = gtr;
    function gtr(version, range, options) {
      return outside(version, range, ">", options);
    }
    exports2.outside = outside;
    function outside(version, range, hilo, options) {
      version = new SemVer(version, options);
      range = new Range(range, options);
      var gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version, range, options)) {
        return false;
      }
      for (var i2 = 0; i2 < range.set.length; ++i2) {
        var comparators = range.set[i2];
        var high = null;
        var low = null;
        comparators.forEach(function(comparator) {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    }
    exports2.prerelease = prerelease;
    function prerelease(version, options) {
      var parsed = parse(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    }
    exports2.intersects = intersects;
    function intersects(r1, r2, options) {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2);
    }
    exports2.coerce = coerce;
    function coerce(version) {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version !== "string") {
        return null;
      }
      var match = version.match(re[COERCE]);
      if (match == null) {
        return null;
      }
      return parse(match[1] + "." + (match[2] || "0") + "." + (match[3] || "0"));
    }
  }
});

// node_modules/cross-spawn/lib/parse.js
var require_parse = __commonJS({
  "node_modules/cross-spawn/lib/parse.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    var niceTry = require_src();
    var resolveCommand = require_resolveCommand();
    var escape = require_escape();
    var readShebang = require_readShebang();
    var semver = require_semver();
    var isWin = process.platform === "win32";
    var isExecutableRegExp = /\.(?:com|exe)$/i;
    var isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
    var supportsShellOption = niceTry(() => semver.satisfies(process.version, "^4.8.0 || ^5.7.0 || >= 6.0.0", true)) || false;
    function detectShebang(parsed) {
      parsed.file = resolveCommand(parsed);
      const shebang = parsed.file && readShebang(parsed.file);
      if (shebang) {
        parsed.args.unshift(parsed.file);
        parsed.command = shebang;
        return resolveCommand(parsed);
      }
      return parsed.file;
    }
    function parseNonShell(parsed) {
      if (!isWin) {
        return parsed;
      }
      const commandFile = detectShebang(parsed);
      const needsShell = !isExecutableRegExp.test(commandFile);
      if (parsed.options.forceShell || needsShell) {
        const needsDoubleEscapeMetaChars = isCmdShimRegExp.test(commandFile);
        parsed.command = path.normalize(parsed.command);
        parsed.command = escape.command(parsed.command);
        parsed.args = parsed.args.map((arg) => escape.argument(arg, needsDoubleEscapeMetaChars));
        const shellCommand = [parsed.command].concat(parsed.args).join(" ");
        parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
        parsed.command = process.env.comspec || "cmd.exe";
        parsed.options.windowsVerbatimArguments = true;
      }
      return parsed;
    }
    function parseShell(parsed) {
      if (supportsShellOption) {
        return parsed;
      }
      const shellCommand = [parsed.command].concat(parsed.args).join(" ");
      if (isWin) {
        parsed.command = typeof parsed.options.shell === "string" ? parsed.options.shell : process.env.comspec || "cmd.exe";
        parsed.args = ["/d", "/s", "/c", `"${shellCommand}"`];
        parsed.options.windowsVerbatimArguments = true;
      } else {
        if (typeof parsed.options.shell === "string") {
          parsed.command = parsed.options.shell;
        } else if (process.platform === "android") {
          parsed.command = "/system/bin/sh";
        } else {
          parsed.command = "/bin/sh";
        }
        parsed.args = ["-c", shellCommand];
      }
      return parsed;
    }
    function parse(command, args, options) {
      if (args && !Array.isArray(args)) {
        options = args;
        args = null;
      }
      args = args ? args.slice(0) : [];
      options = Object.assign({}, options);
      const parsed = {
        command,
        args,
        options,
        file: void 0,
        original: {
          command,
          args
        }
      };
      return options.shell ? parseShell(parsed) : parseNonShell(parsed);
    }
    module2.exports = parse;
  }
});

// node_modules/cross-spawn/lib/enoent.js
var require_enoent = __commonJS({
  "node_modules/cross-spawn/lib/enoent.js"(exports2, module2) {
    "use strict";
    var isWin = process.platform === "win32";
    function notFoundError(original, syscall) {
      return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
        code: "ENOENT",
        errno: "ENOENT",
        syscall: `${syscall} ${original.command}`,
        path: original.command,
        spawnargs: original.args
      });
    }
    function hookChildProcess(cp, parsed) {
      if (!isWin) {
        return;
      }
      const originalEmit = cp.emit;
      cp.emit = function(name, arg1) {
        if (name === "exit") {
          const err = verifyENOENT(arg1, parsed, "spawn");
          if (err) {
            return originalEmit.call(cp, "error", err);
          }
        }
        return originalEmit.apply(cp, arguments);
      };
    }
    function verifyENOENT(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawn");
      }
      return null;
    }
    function verifyENOENTSync(status, parsed) {
      if (isWin && status === 1 && !parsed.file) {
        return notFoundError(parsed.original, "spawnSync");
      }
      return null;
    }
    module2.exports = {
      hookChildProcess,
      verifyENOENT,
      verifyENOENTSync,
      notFoundError
    };
  }
});

// node_modules/cross-spawn/index.js
var require_cross_spawn = __commonJS({
  "node_modules/cross-spawn/index.js"(exports2, module2) {
    "use strict";
    var cp = require("child_process");
    var parse = require_parse();
    var enoent = require_enoent();
    function spawn(command, args, options) {
      const parsed = parse(command, args, options);
      const spawned = cp.spawn(parsed.command, parsed.args, parsed.options);
      enoent.hookChildProcess(spawned, parsed);
      return spawned;
    }
    function spawnSync(command, args, options) {
      const parsed = parse(command, args, options);
      const result = cp.spawnSync(parsed.command, parsed.args, parsed.options);
      result.error = result.error || enoent.verifyENOENTSync(result.status, parsed);
      return result;
    }
    module2.exports = spawn;
    module2.exports.spawn = spawn;
    module2.exports.sync = spawnSync;
    module2.exports._parse = parse;
    module2.exports._enoent = enoent;
  }
});

// node_modules/strip-eof/index.js
var require_strip_eof = __commonJS({
  "node_modules/strip-eof/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(x) {
      var lf = typeof x === "string" ? "\n" : "\n".charCodeAt();
      var cr = typeof x === "string" ? "\r" : "\r".charCodeAt();
      if (x[x.length - 1] === lf) {
        x = x.slice(0, x.length - 1);
      }
      if (x[x.length - 1] === cr) {
        x = x.slice(0, x.length - 1);
      }
      return x;
    };
  }
});

// node_modules/npm-run-path/index.js
var require_npm_run_path = __commonJS({
  "node_modules/npm-run-path/index.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    var pathKey = require_path_key();
    module2.exports = (opts) => {
      opts = Object.assign({
        cwd: process.cwd(),
        path: process.env[pathKey()]
      }, opts);
      let prev;
      let pth = path.resolve(opts.cwd);
      const ret = [];
      while (prev !== pth) {
        ret.push(path.join(pth, "node_modules/.bin"));
        prev = pth;
        pth = path.resolve(pth, "..");
      }
      ret.push(path.dirname(process.execPath));
      return ret.concat(opts.path).join(path.delimiter);
    };
    module2.exports.env = (opts) => {
      opts = Object.assign({
        env: process.env
      }, opts);
      const env = Object.assign({}, opts.env);
      const path2 = pathKey({env});
      opts.path = env[path2];
      env[path2] = module2.exports(opts);
      return env;
    };
  }
});

// node_modules/is-stream/index.js
var require_is_stream = __commonJS({
  "node_modules/is-stream/index.js"(exports2, module2) {
    "use strict";
    var isStream = module2.exports = function(stream) {
      return stream !== null && typeof stream === "object" && typeof stream.pipe === "function";
    };
    isStream.writable = function(stream) {
      return isStream(stream) && stream.writable !== false && typeof stream._write === "function" && typeof stream._writableState === "object";
    };
    isStream.readable = function(stream) {
      return isStream(stream) && stream.readable !== false && typeof stream._read === "function" && typeof stream._readableState === "object";
    };
    isStream.duplex = function(stream) {
      return isStream.writable(stream) && isStream.readable(stream);
    };
    isStream.transform = function(stream) {
      return isStream.duplex(stream) && typeof stream._transform === "function" && typeof stream._transformState === "object";
    };
  }
});

// node_modules/wrappy/wrappy.js
var require_wrappy = __commonJS({
  "node_modules/wrappy/wrappy.js"(exports2, module2) {
    module2.exports = wrappy;
    function wrappy(fn, cb) {
      if (fn && cb)
        return wrappy(fn)(cb);
      if (typeof fn !== "function")
        throw new TypeError("need wrapper function");
      Object.keys(fn).forEach(function(k) {
        wrapper[k] = fn[k];
      });
      return wrapper;
      function wrapper() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        var ret = fn.apply(this, args);
        var cb2 = args[args.length - 1];
        if (typeof ret === "function" && ret !== cb2) {
          Object.keys(cb2).forEach(function(k) {
            ret[k] = cb2[k];
          });
        }
        return ret;
      }
    }
  }
});

// node_modules/once/once.js
var require_once = __commonJS({
  "node_modules/once/once.js"(exports2, module2) {
    var wrappy = require_wrappy();
    module2.exports = wrappy(once);
    module2.exports.strict = wrappy(onceStrict);
    once.proto = once(function() {
      Object.defineProperty(Function.prototype, "once", {
        value: function() {
          return once(this);
        },
        configurable: true
      });
      Object.defineProperty(Function.prototype, "onceStrict", {
        value: function() {
          return onceStrict(this);
        },
        configurable: true
      });
    });
    function once(fn) {
      var f = function() {
        if (f.called)
          return f.value;
        f.called = true;
        return f.value = fn.apply(this, arguments);
      };
      f.called = false;
      return f;
    }
    function onceStrict(fn) {
      var f = function() {
        if (f.called)
          throw new Error(f.onceError);
        f.called = true;
        return f.value = fn.apply(this, arguments);
      };
      var name = fn.name || "Function wrapped with `once`";
      f.onceError = name + " shouldn't be called more than once";
      f.called = false;
      return f;
    }
  }
});

// node_modules/end-of-stream/index.js
var require_end_of_stream = __commonJS({
  "node_modules/end-of-stream/index.js"(exports2, module2) {
    var once = require_once();
    var noop = function() {
    };
    var isRequest = function(stream) {
      return stream.setHeader && typeof stream.abort === "function";
    };
    var isChildProcess = function(stream) {
      return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3;
    };
    var eos = function(stream, opts, callback) {
      if (typeof opts === "function")
        return eos(stream, null, opts);
      if (!opts)
        opts = {};
      callback = once(callback || noop);
      var ws = stream._writableState;
      var rs = stream._readableState;
      var readable = opts.readable || opts.readable !== false && stream.readable;
      var writable = opts.writable || opts.writable !== false && stream.writable;
      var onlegacyfinish = function() {
        if (!stream.writable)
          onfinish();
      };
      var onfinish = function() {
        writable = false;
        if (!readable)
          callback.call(stream);
      };
      var onend = function() {
        readable = false;
        if (!writable)
          callback.call(stream);
      };
      var onexit = function(exitCode) {
        callback.call(stream, exitCode ? new Error("exited with error code: " + exitCode) : null);
      };
      var onerror = function(err) {
        callback.call(stream, err);
      };
      var onclose = function() {
        if (readable && !(rs && rs.ended))
          return callback.call(stream, new Error("premature close"));
        if (writable && !(ws && ws.ended))
          return callback.call(stream, new Error("premature close"));
      };
      var onrequest = function() {
        stream.req.on("finish", onfinish);
      };
      if (isRequest(stream)) {
        stream.on("complete", onfinish);
        stream.on("abort", onclose);
        if (stream.req)
          onrequest();
        else
          stream.on("request", onrequest);
      } else if (writable && !ws) {
        stream.on("end", onlegacyfinish);
        stream.on("close", onlegacyfinish);
      }
      if (isChildProcess(stream))
        stream.on("exit", onexit);
      stream.on("end", onend);
      stream.on("finish", onfinish);
      if (opts.error !== false)
        stream.on("error", onerror);
      stream.on("close", onclose);
      return function() {
        stream.removeListener("complete", onfinish);
        stream.removeListener("abort", onclose);
        stream.removeListener("request", onrequest);
        if (stream.req)
          stream.req.removeListener("finish", onfinish);
        stream.removeListener("end", onlegacyfinish);
        stream.removeListener("close", onlegacyfinish);
        stream.removeListener("finish", onfinish);
        stream.removeListener("exit", onexit);
        stream.removeListener("end", onend);
        stream.removeListener("error", onerror);
        stream.removeListener("close", onclose);
      };
    };
    module2.exports = eos;
  }
});

// node_modules/pump/index.js
var require_pump = __commonJS({
  "node_modules/pump/index.js"(exports2, module2) {
    var once = require_once();
    var eos = require_end_of_stream();
    var fs = require("fs");
    var noop = function() {
    };
    var ancient = /^v?\.0/.test(process.version);
    var isFn = function(fn) {
      return typeof fn === "function";
    };
    var isFS = function(stream) {
      if (!ancient)
        return false;
      if (!fs)
        return false;
      return (stream instanceof (fs.ReadStream || noop) || stream instanceof (fs.WriteStream || noop)) && isFn(stream.close);
    };
    var isRequest = function(stream) {
      return stream.setHeader && isFn(stream.abort);
    };
    var destroyer = function(stream, reading, writing, callback) {
      callback = once(callback);
      var closed = false;
      stream.on("close", function() {
        closed = true;
      });
      eos(stream, {readable: reading, writable: writing}, function(err) {
        if (err)
          return callback(err);
        closed = true;
        callback();
      });
      var destroyed = false;
      return function(err) {
        if (closed)
          return;
        if (destroyed)
          return;
        destroyed = true;
        if (isFS(stream))
          return stream.close(noop);
        if (isRequest(stream))
          return stream.abort();
        if (isFn(stream.destroy))
          return stream.destroy();
        callback(err || new Error("stream was destroyed"));
      };
    };
    var call = function(fn) {
      fn();
    };
    var pipe = function(from, to) {
      return from.pipe(to);
    };
    var pump = function() {
      var streams = Array.prototype.slice.call(arguments);
      var callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop;
      if (Array.isArray(streams[0]))
        streams = streams[0];
      if (streams.length < 2)
        throw new Error("pump requires two streams per minimum");
      var error2;
      var destroys = streams.map(function(stream, i) {
        var reading = i < streams.length - 1;
        var writing = i > 0;
        return destroyer(stream, reading, writing, function(err) {
          if (!error2)
            error2 = err;
          if (err)
            destroys.forEach(call);
          if (reading)
            return;
          destroys.forEach(call);
          callback(error2);
        });
      });
      return streams.reduce(pipe);
    };
    module2.exports = pump;
  }
});

// node_modules/get-stream/buffer-stream.js
var require_buffer_stream = __commonJS({
  "node_modules/get-stream/buffer-stream.js"(exports2, module2) {
    "use strict";
    var {PassThrough} = require("stream");
    module2.exports = (options) => {
      options = Object.assign({}, options);
      const {array} = options;
      let {encoding} = options;
      const buffer = encoding === "buffer";
      let objectMode = false;
      if (array) {
        objectMode = !(encoding || buffer);
      } else {
        encoding = encoding || "utf8";
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
      stream.on("data", (chunk) => {
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
        return buffer ? Buffer.concat(ret, len) : ret.join("");
      };
      stream.getBufferedLength = () => len;
      return stream;
    };
  }
});

// node_modules/get-stream/index.js
var require_get_stream = __commonJS({
  "node_modules/get-stream/index.js"(exports2, module2) {
    "use strict";
    var pump = require_pump();
    var bufferStream = require_buffer_stream();
    var MaxBufferError = class extends Error {
      constructor() {
        super("maxBuffer exceeded");
        this.name = "MaxBufferError";
      }
    };
    function getStream(inputStream, options) {
      if (!inputStream) {
        return Promise.reject(new Error("Expected a stream"));
      }
      options = Object.assign({maxBuffer: Infinity}, options);
      const {maxBuffer} = options;
      let stream;
      return new Promise((resolve, reject) => {
        const rejectPromise = (error2) => {
          if (error2) {
            error2.bufferedData = stream.getBufferedValue();
          }
          reject(error2);
        };
        stream = pump(inputStream, bufferStream(options), (error2) => {
          if (error2) {
            rejectPromise(error2);
            return;
          }
          resolve();
        });
        stream.on("data", () => {
          if (stream.getBufferedLength() > maxBuffer) {
            rejectPromise(new MaxBufferError());
          }
        });
      }).then(() => stream.getBufferedValue());
    }
    module2.exports = getStream;
    module2.exports.buffer = (stream, options) => getStream(stream, Object.assign({}, options, {encoding: "buffer"}));
    module2.exports.array = (stream, options) => getStream(stream, Object.assign({}, options, {array: true}));
    module2.exports.MaxBufferError = MaxBufferError;
  }
});

// node_modules/p-finally/index.js
var require_p_finally = __commonJS({
  "node_modules/p-finally/index.js"(exports2, module2) {
    "use strict";
    module2.exports = (promise, onFinally) => {
      onFinally = onFinally || (() => {
      });
      return promise.then((val) => new Promise((resolve) => {
        resolve(onFinally());
      }).then(() => val), (err) => new Promise((resolve) => {
        resolve(onFinally());
      }).then(() => {
        throw err;
      }));
    };
  }
});

// node_modules/signal-exit/signals.js
var require_signals = __commonJS({
  "node_modules/signal-exit/signals.js"(exports2, module2) {
    module2.exports = [
      "SIGABRT",
      "SIGALRM",
      "SIGHUP",
      "SIGINT",
      "SIGTERM"
    ];
    if (process.platform !== "win32") {
      module2.exports.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
    }
    if (process.platform === "linux") {
      module2.exports.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
    }
  }
});

// node_modules/signal-exit/index.js
var require_signal_exit = __commonJS({
  "node_modules/signal-exit/index.js"(exports2, module2) {
    var assert = require("assert");
    var signals = require_signals();
    var EE = require("events");
    if (typeof EE !== "function") {
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
    if (!emitter.infinite) {
      emitter.setMaxListeners(Infinity);
      emitter.infinite = true;
    }
    module2.exports = function(cb, opts) {
      assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
      if (loaded === false) {
        load();
      }
      var ev = "exit";
      if (opts && opts.alwaysLast) {
        ev = "afterexit";
      }
      var remove = function() {
        emitter.removeListener(ev, cb);
        if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
          unload();
        }
      };
      emitter.on(ev, cb);
      return remove;
    };
    module2.exports.unload = unload;
    function unload() {
      if (!loaded) {
        return;
      }
      loaded = false;
      signals.forEach(function(sig) {
        try {
          process.removeListener(sig, sigListeners[sig]);
        } catch (er) {
        }
      });
      process.emit = originalProcessEmit;
      process.reallyExit = originalProcessReallyExit;
      emitter.count -= 1;
    }
    function emit(event, code, signal) {
      if (emitter.emitted[event]) {
        return;
      }
      emitter.emitted[event] = true;
      emitter.emit(event, code, signal);
    }
    var sigListeners = {};
    signals.forEach(function(sig) {
      sigListeners[sig] = function listener() {
        var listeners = process.listeners(sig);
        if (listeners.length === emitter.count) {
          unload();
          emit("exit", null, sig);
          emit("afterexit", null, sig);
          process.kill(process.pid, sig);
        }
      };
    });
    module2.exports.signals = function() {
      return signals;
    };
    module2.exports.load = load;
    var loaded = false;
    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      emitter.count += 1;
      signals = signals.filter(function(sig) {
        try {
          process.on(sig, sigListeners[sig]);
          return true;
        } catch (er) {
          return false;
        }
      });
      process.emit = processEmit;
      process.reallyExit = processReallyExit;
    }
    var originalProcessReallyExit = process.reallyExit;
    function processReallyExit(code) {
      process.exitCode = code || 0;
      emit("exit", process.exitCode, null);
      emit("afterexit", process.exitCode, null);
      originalProcessReallyExit.call(process, process.exitCode);
    }
    var originalProcessEmit = process.emit;
    function processEmit(ev, arg) {
      if (ev === "exit") {
        if (arg !== void 0) {
          process.exitCode = arg;
        }
        var ret = originalProcessEmit.apply(this, arguments);
        emit("exit", process.exitCode, null);
        emit("afterexit", process.exitCode, null);
        return ret;
      } else {
        return originalProcessEmit.apply(this, arguments);
      }
    }
  }
});

// node_modules/execa/lib/errname.js
var require_errname = __commonJS({
  "node_modules/execa/lib/errname.js"(exports2, module2) {
    "use strict";
    var util = require("util");
    var uv;
    if (typeof util.getSystemErrorName === "function") {
      module2.exports = util.getSystemErrorName;
    } else {
      try {
        uv = process.binding("uv");
        if (typeof uv.errname !== "function") {
          throw new TypeError("uv.errname is not a function");
        }
      } catch (err) {
        console.error("execa/lib/errname: unable to establish process.binding('uv')", err);
        uv = null;
      }
      module2.exports = (code) => errname(uv, code);
    }
    module2.exports.__test__ = errname;
    function errname(uv2, code) {
      if (uv2) {
        return uv2.errname(code);
      }
      if (!(code < 0)) {
        throw new Error("err >= 0");
      }
      return `Unknown system error ${code}`;
    }
  }
});

// node_modules/execa/lib/stdio.js
var require_stdio = __commonJS({
  "node_modules/execa/lib/stdio.js"(exports2, module2) {
    "use strict";
    var alias = ["stdin", "stdout", "stderr"];
    var hasAlias = (opts) => alias.some((x) => Boolean(opts[x]));
    module2.exports = (opts) => {
      if (!opts) {
        return null;
      }
      if (opts.stdio && hasAlias(opts)) {
        throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${alias.map((x) => `\`${x}\``).join(", ")}`);
      }
      if (typeof opts.stdio === "string") {
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
        if (stdio[i] !== void 0) {
          value = stdio[i];
        } else if (opts[alias[i]] !== void 0) {
          value = opts[alias[i]];
        }
        result[i] = value;
      }
      return result;
    };
  }
});

// node_modules/execa/index.js
var require_execa = __commonJS({
  "node_modules/execa/index.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    var childProcess = require("child_process");
    var crossSpawn = require_cross_spawn();
    var stripEof = require_strip_eof();
    var npmRunPath = require_npm_run_path();
    var isStream = require_is_stream();
    var _getStream = require_get_stream();
    var pFinally = require_p_finally();
    var onExit = require_signal_exit();
    var errname = require_errname();
    var stdio = require_stdio();
    var TEN_MEGABYTES = 1e3 * 1e3 * 10;
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
        encoding: "utf8",
        reject: true,
        cleanup: true
      }, parsed.options);
      opts.stdio = stdio(opts);
      if (opts.preferLocal) {
        opts.env = npmRunPath.env(Object.assign({}, opts, {cwd: opts.localDir}));
      }
      if (opts.detached) {
        opts.cleanup = false;
      }
      if (process.platform === "win32" && path.basename(parsed.command) === "cmd.exe") {
        parsed.args.unshift("/q");
      }
      return {
        cmd: parsed.command,
        args: parsed.args,
        opts,
        parsed
      };
    }
    function handleInput(spawned, input) {
      if (input === null || input === void 0) {
        return;
      }
      if (isStream(input)) {
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
      let file = "/bin/sh";
      let args = ["-c", cmd];
      opts = Object.assign({}, opts);
      if (process.platform === "win32") {
        opts.__winShell = true;
        file = process.env.comspec || "cmd.exe";
        args = ["/s", "/c", `"${cmd}"`];
        opts.windowsVerbatimArguments = true;
      }
      if (opts.shell) {
        file = opts.shell;
        delete opts.shell;
      }
      return fn(file, args, opts);
    }
    function getStream(process2, stream, {encoding, buffer, maxBuffer}) {
      if (!process2[stream]) {
        return null;
      }
      let ret;
      if (!buffer) {
        ret = new Promise((resolve, reject) => {
          process2[stream].once("end", resolve).once("error", reject);
        });
      } else if (encoding) {
        ret = _getStream(process2[stream], {
          encoding,
          maxBuffer
        });
      } else {
        ret = _getStream.buffer(process2[stream], {maxBuffer});
      }
      return ret.catch((err) => {
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
        let output = "";
        if (Array.isArray(parsed.opts.stdio)) {
          if (parsed.opts.stdio[2] !== "inherit") {
            output += output.length > 0 ? stderr : `
${stderr}`;
          }
          if (parsed.opts.stdio[1] !== "inherit") {
            output += `
${stdout}`;
          }
        } else if (parsed.opts.stdio !== "inherit") {
          output = `
${stderr}${stdout}`;
        }
        err = new Error(`Command failed: ${joinedCmd}${output}`);
        err.code = code < 0 ? errname(code) : code;
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
        joinedCmd += " " + args.join(" ");
      }
      return joinedCmd;
    }
    module2.exports = (cmd, args, opts) => {
      const parsed = handleArgs(cmd, args, opts);
      const {encoding, buffer, maxBuffer} = parsed.opts;
      const joinedCmd = joinCmd(cmd, args);
      let spawned;
      try {
        spawned = childProcess.spawn(parsed.cmd, parsed.args, parsed.opts);
      } catch (err) {
        return Promise.reject(err);
      }
      let removeExitHandler;
      if (parsed.opts.cleanup) {
        removeExitHandler = onExit(() => {
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
      const processDone = new Promise((resolve) => {
        spawned.on("exit", (code, signal) => {
          cleanup();
          resolve({code, signal});
        });
        spawned.on("error", (err) => {
          cleanup();
          resolve({error: err});
        });
        if (spawned.stdin) {
          spawned.stdin.on("error", (err) => {
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
        getStream(spawned, "stdout", {encoding, buffer, maxBuffer}),
        getStream(spawned, "stderr", {encoding, buffer, maxBuffer})
      ]).then((arr) => {
        const result = arr[0];
        result.stdout = arr[1];
        result.stderr = arr[2];
        if (result.error || result.code !== 0 || result.signal !== null) {
          const err = makeError(result, {
            joinedCmd,
            parsed,
            timedOut
          });
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
      spawned.catch = (onrejected) => handlePromise().catch(onrejected);
      return spawned;
    };
    module2.exports.stdout = (...args) => module2.exports(...args).then((x) => x.stdout);
    module2.exports.stderr = (...args) => module2.exports(...args).then((x) => x.stderr);
    module2.exports.shell = (cmd, opts) => handleShell(module2.exports, cmd, opts);
    module2.exports.sync = (cmd, args, opts) => {
      const parsed = handleArgs(cmd, args, opts);
      const joinedCmd = joinCmd(cmd, args);
      if (isStream(parsed.opts.input)) {
        throw new TypeError("The `input` option cannot be a stream in sync mode");
      }
      const result = childProcess.spawnSync(parsed.cmd, parsed.args, parsed.opts);
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
    module2.exports.shellSync = (cmd, opts) => handleShell(module2.exports.sync, cmd, opts);
  }
});

// node_modules/windows-release/index.js
var require_windows_release = __commonJS({
  "node_modules/windows-release/index.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var execa = require_execa();
    var names = new Map([
      ["10.0", "10"],
      ["6.3", "8.1"],
      ["6.2", "8"],
      ["6.1", "7"],
      ["6.0", "Vista"],
      ["5.2", "Server 2003"],
      ["5.1", "XP"],
      ["5.0", "2000"],
      ["4.9", "ME"],
      ["4.1", "98"],
      ["4.0", "95"]
    ]);
    var windowsRelease = (release) => {
      const version = /\d+\.\d/.exec(release || os.release());
      if (release && !version) {
        throw new Error("`release` argument doesn't match `n.n`");
      }
      const ver = (version || [])[0];
      if ((!release || release === os.release()) && ["6.1", "6.2", "6.3", "10.0"].includes(ver)) {
        const stdout = execa.sync("wmic", ["os", "get", "Caption"]).stdout || "";
        const year = (stdout.match(/2008|2012|2016/) || [])[0];
        if (year) {
          return `Server ${year}`;
        }
      }
      return names.get(ver);
    };
    module2.exports = windowsRelease;
  }
});

// node_modules/os-name/index.js
var require_os_name = __commonJS({
  "node_modules/os-name/index.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var macosRelease = require_macos_release();
    var winRelease = require_windows_release();
    var osName = (platform, release) => {
      if (!platform && release) {
        throw new Error("You can't specify a `release` without specifying `platform`");
      }
      platform = platform || os.platform();
      let id;
      if (platform === "darwin") {
        if (!release && os.platform() === "darwin") {
          release = os.release();
        }
        const prefix = release ? Number(release.split(".")[0]) > 15 ? "macOS" : "OS X" : "macOS";
        id = release ? macosRelease(release).name : "";
        return prefix + (id ? " " + id : "");
      }
      if (platform === "linux") {
        if (!release && os.platform() === "linux") {
          release = os.release();
        }
        id = release ? release.replace(/^(\d+\.\d+).*/, "$1") : "";
        return "Linux" + (id ? " " + id : "");
      }
      if (platform === "win32") {
        if (!release && os.platform() === "win32") {
          release = os.release();
        }
        id = release ? winRelease(release) : "";
        return "Windows" + (id ? " " + id : "");
      }
      return platform;
    };
    module2.exports = osName;
  }
});

// node_modules/universal-user-agent/index.js
var require_universal_user_agent = __commonJS({
  "node_modules/universal-user-agent/index.js"(exports2, module2) {
    module2.exports = getUserAgentNode;
    var osName = require_os_name();
    function getUserAgentNode() {
      try {
        return `Node.js/${process.version.substr(1)} (${osName()}; ${process.arch})`;
      } catch (error2) {
        if (/wmic os get Caption/.test(error2.message)) {
          return "Windows <version undetectable>";
        }
        throw error2;
      }
    }
  }
});

// node_modules/@octokit/endpoint/dist-node/index.js
var require_dist_node = __commonJS({
  "node_modules/@octokit/endpoint/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {value: true});
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var deepmerge = _interopDefault(require_cjs());
    var isPlainObject = _interopDefault(require_index_cjs());
    var urlTemplate = _interopDefault(require_url_template());
    var getUserAgent = _interopDefault(require_universal_user_agent());
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
        let [method, url] = route.split(" ");
        options = Object.assign(url ? {
          method,
          url
        } : {
          url: method
        }, options);
      } else {
        options = route || {};
      }
      options.headers = lowercaseKeys(options.headers);
      const mergedOptions = deepmerge.all([defaults, options].filter(Boolean), {
        isMergeableObject: isPlainObject
      });
      if (defaults && defaults.mediaType.previews.length) {
        mergedOptions.mediaType.previews = defaults.mediaType.previews.filter((preview) => !mergedOptions.mediaType.previews.includes(preview)).concat(mergedOptions.mediaType.previews);
      }
      mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map((preview) => preview.replace(/-preview/, ""));
      return mergedOptions;
    }
    function addQueryParameters(url, parameters) {
      const separator = /\?/.test(url) ? "&" : "?";
      const names = Object.keys(parameters);
      if (names.length === 0) {
        return url;
      }
      return url + separator + names.map((name) => {
        if (name === "q") {
          return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
        }
        return `${name}=${encodeURIComponent(parameters[name])}`;
      }).join("&");
    }
    var urlVariableRegex = /\{[^}]+\}/g;
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
      return Object.keys(object).filter((option) => !keysToOmit.includes(option)).reduce((obj, key) => {
        obj[key] = object[key];
        return obj;
      }, {});
    }
    function parse(options) {
      let method = options.method.toUpperCase();
      let url = options.url.replace(/:([a-z]\w+)/g, "{+$1}");
      let headers = Object.assign({}, options.headers);
      let body;
      let parameters = omit(options, ["method", "baseUrl", "url", "headers", "request", "mediaType"]);
      const urlVariableNames = extractUrlVariableNames(url);
      url = urlTemplate.parse(url).expand(parameters);
      if (!/^http/.test(url)) {
        url = options.baseUrl + url;
      }
      const omittedParameters = Object.keys(options).filter((option) => urlVariableNames.includes(option)).concat("baseUrl");
      const remainingParameters = omit(parameters, omittedParameters);
      const isBinaryRequset = /application\/octet-stream/i.test(headers.accept);
      if (!isBinaryRequset) {
        if (options.mediaType.format) {
          headers.accept = headers.accept.split(/,/).map((preview) => preview.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/, `application/vnd$1$2.${options.mediaType.format}`)).join(",");
        }
        if (options.mediaType.previews.length) {
          const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
          headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map((preview) => {
            const format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
            return `application/vnd.github.${preview}-preview${format}`;
          }).join(",");
        }
      }
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
      }
      if (!headers["content-type"] && typeof body !== "undefined") {
        headers["content-type"] = "application/json; charset=utf-8";
      }
      if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
        body = "";
      }
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
      return parse(merge(defaults, route, options));
    }
    function withDefaults(oldDefaults, newDefaults) {
      const DEFAULTS2 = merge(oldDefaults, newDefaults);
      const endpoint2 = endpointWithDefaults.bind(null, DEFAULTS2);
      return Object.assign(endpoint2, {
        DEFAULTS: DEFAULTS2,
        defaults: withDefaults.bind(null, DEFAULTS2),
        merge: merge.bind(null, DEFAULTS2),
        parse
      });
    }
    var VERSION = "0.0.0-development";
    var userAgent = `octokit-endpoint.js/${VERSION} ${getUserAgent()}`;
    var DEFAULTS = {
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
    var endpoint = withDefaults(null, DEFAULTS);
    exports2.endpoint = endpoint;
  }
});

// node_modules/node-fetch/lib/index.js
var require_lib = __commonJS({
  "node_modules/node-fetch/lib/index.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {value: true});
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var Stream = _interopDefault(require("stream"));
    var http = _interopDefault(require("http"));
    var Url = _interopDefault(require("url"));
    var https = _interopDefault(require("https"));
    var zlib = _interopDefault(require("zlib"));
    var Readable = Stream.Readable;
    var BUFFER = Symbol("buffer");
    var TYPE = Symbol("type");
    var Blob = class {
      constructor() {
        this[TYPE] = "";
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
              buffer = Buffer.from(typeof element === "string" ? element : String(element));
            }
            size += buffer.length;
            buffers.push(buffer);
          }
        }
        this[BUFFER] = Buffer.concat(buffers);
        let type = options && options.type !== void 0 && String(options.type).toLowerCase();
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
        readable._read = function() {
        };
        readable.push(this[BUFFER]);
        readable.push(null);
        return readable;
      }
      toString() {
        return "[object Blob]";
      }
      slice() {
        const size = this.size;
        const start = arguments[0];
        const end = arguments[1];
        let relativeStart, relativeEnd;
        if (start === void 0) {
          relativeStart = 0;
        } else if (start < 0) {
          relativeStart = Math.max(size + start, 0);
        } else {
          relativeStart = Math.min(start, size);
        }
        if (end === void 0) {
          relativeEnd = size;
        } else if (end < 0) {
          relativeEnd = Math.max(size + end, 0);
        } else {
          relativeEnd = Math.min(end, size);
        }
        const span = Math.max(relativeEnd - relativeStart, 0);
        const buffer = this[BUFFER];
        const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
        const blob = new Blob([], {type: arguments[2]});
        blob[BUFFER] = slicedBuffer;
        return blob;
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: {enumerable: true},
      type: {enumerable: true},
      slice: {enumerable: true}
    });
    Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
      value: "Blob",
      writable: false,
      enumerable: false,
      configurable: true
    });
    function FetchError(message, type, systemError) {
      Error.call(this, message);
      this.message = message;
      this.type = type;
      if (systemError) {
        this.code = this.errno = systemError.code;
      }
      Error.captureStackTrace(this, this.constructor);
    }
    FetchError.prototype = Object.create(Error.prototype);
    FetchError.prototype.constructor = FetchError;
    FetchError.prototype.name = "FetchError";
    var convert;
    try {
      convert = require("encoding").convert;
    } catch (e) {
    }
    var INTERNALS = Symbol("Body internals");
    var PassThrough = Stream.PassThrough;
    function Body(body) {
      var _this = this;
      var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref$size = _ref.size;
      let size = _ref$size === void 0 ? 0 : _ref$size;
      var _ref$timeout = _ref.timeout;
      let timeout2 = _ref$timeout === void 0 ? 0 : _ref$timeout;
      if (body == null) {
        body = null;
      } else if (isURLSearchParams(body)) {
        body = Buffer.from(body.toString());
      } else if (isBlob(body))
        ;
      else if (Buffer.isBuffer(body))
        ;
      else if (Object.prototype.toString.call(body) === "[object ArrayBuffer]") {
        body = Buffer.from(body);
      } else if (ArrayBuffer.isView(body)) {
        body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
      } else if (body instanceof Stream)
        ;
      else {
        body = Buffer.from(String(body));
      }
      this[INTERNALS] = {
        body,
        disturbed: false,
        error: null
      };
      this.size = size;
      this.timeout = timeout2;
      if (body instanceof Stream) {
        body.on("error", function(err) {
          const error2 = err.name === "AbortError" ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, "system", err);
          _this[INTERNALS].error = error2;
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
      arrayBuffer() {
        return consumeBody.call(this).then(function(buf) {
          return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        });
      },
      blob() {
        let ct = this.headers && this.headers.get("content-type") || "";
        return consumeBody.call(this).then(function(buf) {
          return Object.assign(new Blob([], {
            type: ct.toLowerCase()
          }), {
            [BUFFER]: buf
          });
        });
      },
      json() {
        var _this2 = this;
        return consumeBody.call(this).then(function(buffer) {
          try {
            return JSON.parse(buffer.toString());
          } catch (err) {
            return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, "invalid-json"));
          }
        });
      },
      text() {
        return consumeBody.call(this).then(function(buffer) {
          return buffer.toString();
        });
      },
      buffer() {
        return consumeBody.call(this);
      },
      textConverted() {
        var _this3 = this;
        return consumeBody.call(this).then(function(buffer) {
          return convertBody(buffer, _this3.headers);
        });
      }
    };
    Object.defineProperties(Body.prototype, {
      body: {enumerable: true},
      bodyUsed: {enumerable: true},
      arrayBuffer: {enumerable: true},
      blob: {enumerable: true},
      json: {enumerable: true},
      text: {enumerable: true}
    });
    Body.mixIn = function(proto) {
      for (const name of Object.getOwnPropertyNames(Body.prototype)) {
        if (!(name in proto)) {
          const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
          Object.defineProperty(proto, name, desc);
        }
      }
    };
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
      if (body === null) {
        return Body.Promise.resolve(Buffer.alloc(0));
      }
      if (isBlob(body)) {
        body = body.stream();
      }
      if (Buffer.isBuffer(body)) {
        return Body.Promise.resolve(body);
      }
      if (!(body instanceof Stream)) {
        return Body.Promise.resolve(Buffer.alloc(0));
      }
      let accum = [];
      let accumBytes = 0;
      let abort = false;
      return new Body.Promise(function(resolve, reject) {
        let resTimeout;
        if (_this4.timeout) {
          resTimeout = setTimeout(function() {
            abort = true;
            reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, "body-timeout"));
          }, _this4.timeout);
        }
        body.on("error", function(err) {
          if (err.name === "AbortError") {
            abort = true;
            reject(err);
          } else {
            reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, "system", err));
          }
        });
        body.on("data", function(chunk) {
          if (abort || chunk === null) {
            return;
          }
          if (_this4.size && accumBytes + chunk.length > _this4.size) {
            abort = true;
            reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, "max-size"));
            return;
          }
          accumBytes += chunk.length;
          accum.push(chunk);
        });
        body.on("end", function() {
          if (abort) {
            return;
          }
          clearTimeout(resTimeout);
          try {
            resolve(Buffer.concat(accum, accumBytes));
          } catch (err) {
            reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, "system", err));
          }
        });
      });
    }
    function convertBody(buffer, headers) {
      if (typeof convert !== "function") {
        throw new Error("The package `encoding` must be installed to use the textConverted() function");
      }
      const ct = headers.get("content-type");
      let charset = "utf-8";
      let res, str;
      if (ct) {
        res = /charset=([^;]*)/i.exec(ct);
      }
      str = buffer.slice(0, 1024).toString();
      if (!res && str) {
        res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
      }
      if (!res && str) {
        res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
        if (res) {
          res = /charset=(.*)/i.exec(res.pop());
        }
      }
      if (!res && str) {
        res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
      }
      if (res) {
        charset = res.pop();
        if (charset === "gb2312" || charset === "gbk") {
          charset = "gb18030";
        }
      }
      return convert(buffer, "UTF-8", charset).toString();
    }
    function isURLSearchParams(obj) {
      if (typeof obj !== "object" || typeof obj.append !== "function" || typeof obj.delete !== "function" || typeof obj.get !== "function" || typeof obj.getAll !== "function" || typeof obj.has !== "function" || typeof obj.set !== "function") {
        return false;
      }
      return obj.constructor.name === "URLSearchParams" || Object.prototype.toString.call(obj) === "[object URLSearchParams]" || typeof obj.sort === "function";
    }
    function isBlob(obj) {
      return typeof obj === "object" && typeof obj.arrayBuffer === "function" && typeof obj.type === "string" && typeof obj.stream === "function" && typeof obj.constructor === "function" && typeof obj.constructor.name === "string" && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
    }
    function clone(instance) {
      let p1, p2;
      let body = instance.body;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof Stream && typeof body.getBoundary !== "function") {
        p1 = new PassThrough();
        p2 = new PassThrough();
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS].body = p1;
        body = p2;
      }
      return body;
    }
    function extractContentType(body) {
      if (body === null) {
        return null;
      } else if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      } else if (isURLSearchParams(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      } else if (isBlob(body)) {
        return body.type || null;
      } else if (Buffer.isBuffer(body)) {
        return null;
      } else if (Object.prototype.toString.call(body) === "[object ArrayBuffer]") {
        return null;
      } else if (ArrayBuffer.isView(body)) {
        return null;
      } else if (typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      } else if (body instanceof Stream) {
        return null;
      } else {
        return "text/plain;charset=UTF-8";
      }
    }
    function getTotalBytes(instance) {
      const body = instance.body;
      if (body === null) {
        return 0;
      } else if (isBlob(body)) {
        return body.size;
      } else if (Buffer.isBuffer(body)) {
        return body.length;
      } else if (body && typeof body.getLengthSync === "function") {
        if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || body.hasKnownLength && body.hasKnownLength()) {
          return body.getLengthSync();
        }
        return null;
      } else {
        return null;
      }
    }
    function writeToStream(dest, instance) {
      const body = instance.body;
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    }
    Body.Promise = global.Promise;
    var invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
    var invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;
    function validateName(name) {
      name = `${name}`;
      if (invalidTokenRegex.test(name) || name === "") {
        throw new TypeError(`${name} is not a legal HTTP header name`);
      }
    }
    function validateValue(value) {
      value = `${value}`;
      if (invalidHeaderCharRegex.test(value)) {
        throw new TypeError(`${value} is not a legal HTTP header value`);
      }
    }
    function find(map, name) {
      name = name.toLowerCase();
      for (const key in map) {
        if (key.toLowerCase() === name) {
          return key;
        }
      }
      return void 0;
    }
    var MAP = Symbol("map");
    var Headers = class {
      constructor() {
        let init = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
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
        if (init == null)
          ;
        else if (typeof init === "object") {
          const method = init[Symbol.iterator];
          if (method != null) {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            const pairs = [];
            for (const pair of init) {
              if (typeof pair !== "object" || typeof pair[Symbol.iterator] !== "function") {
                throw new TypeError("Each header pair must be iterable");
              }
              pairs.push(Array.from(pair));
            }
            for (const pair of pairs) {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              this.append(pair[0], pair[1]);
            }
          } else {
            for (const key of Object.keys(init)) {
              const value = init[key];
              this.append(key, value);
            }
          }
        } else {
          throw new TypeError("Provided initializer must be an object");
        }
      }
      get(name) {
        name = `${name}`;
        validateName(name);
        const key = find(this[MAP], name);
        if (key === void 0) {
          return null;
        }
        return this[MAP][key].join(", ");
      }
      forEach(callback) {
        let thisArg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : void 0;
        let pairs = getHeaders(this);
        let i = 0;
        while (i < pairs.length) {
          var _pairs$i = pairs[i];
          const name = _pairs$i[0], value = _pairs$i[1];
          callback.call(thisArg, value, name, this);
          pairs = getHeaders(this);
          i++;
        }
      }
      set(name, value) {
        name = `${name}`;
        value = `${value}`;
        validateName(name);
        validateValue(value);
        const key = find(this[MAP], name);
        this[MAP][key !== void 0 ? key : name] = [value];
      }
      append(name, value) {
        name = `${name}`;
        value = `${value}`;
        validateName(name);
        validateValue(value);
        const key = find(this[MAP], name);
        if (key !== void 0) {
          this[MAP][key].push(value);
        } else {
          this[MAP][name] = [value];
        }
      }
      has(name) {
        name = `${name}`;
        validateName(name);
        return find(this[MAP], name) !== void 0;
      }
      delete(name) {
        name = `${name}`;
        validateName(name);
        const key = find(this[MAP], name);
        if (key !== void 0) {
          delete this[MAP][key];
        }
      }
      raw() {
        return this[MAP];
      }
      keys() {
        return createHeadersIterator(this, "key");
      }
      values() {
        return createHeadersIterator(this, "value");
      }
      [Symbol.iterator]() {
        return createHeadersIterator(this, "key+value");
      }
    };
    Headers.prototype.entries = Headers.prototype[Symbol.iterator];
    Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
      value: "Headers",
      writable: false,
      enumerable: false,
      configurable: true
    });
    Object.defineProperties(Headers.prototype, {
      get: {enumerable: true},
      forEach: {enumerable: true},
      set: {enumerable: true},
      append: {enumerable: true},
      has: {enumerable: true},
      delete: {enumerable: true},
      keys: {enumerable: true},
      values: {enumerable: true},
      entries: {enumerable: true}
    });
    function getHeaders(headers) {
      let kind = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "key+value";
      const keys = Object.keys(headers[MAP]).sort();
      return keys.map(kind === "key" ? function(k) {
        return k.toLowerCase();
      } : kind === "value" ? function(k) {
        return headers[MAP][k].join(", ");
      } : function(k) {
        return [k.toLowerCase(), headers[MAP][k].join(", ")];
      });
    }
    var INTERNAL = Symbol("internal");
    function createHeadersIterator(target, kind) {
      const iterator = Object.create(HeadersIteratorPrototype);
      iterator[INTERNAL] = {
        target,
        kind,
        index: 0
      };
      return iterator;
    }
    var HeadersIteratorPrototype = Object.setPrototypeOf({
      next() {
        if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
          throw new TypeError("Value of `this` is not a HeadersIterator");
        }
        var _INTERNAL = this[INTERNAL];
        const target = _INTERNAL.target, kind = _INTERNAL.kind, index = _INTERNAL.index;
        const values = getHeaders(target, kind);
        const len = values.length;
        if (index >= len) {
          return {
            value: void 0,
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
      value: "HeadersIterator",
      writable: false,
      enumerable: false,
      configurable: true
    });
    function exportNodeCompatibleHeaders(headers) {
      const obj = Object.assign({__proto__: null}, headers[MAP]);
      const hostHeaderKey = find(headers[MAP], "Host");
      if (hostHeaderKey !== void 0) {
        obj[hostHeaderKey] = obj[hostHeaderKey][0];
      }
      return obj;
    }
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
            if (headers[MAP][name] === void 0) {
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
    var INTERNALS$1 = Symbol("Response internals");
    var STATUS_CODES = http.STATUS_CODES;
    var Response = class {
      constructor() {
        let body = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : null;
        let opts = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        Body.call(this, body, opts);
        const status = opts.status || 200;
        const headers = new Headers(opts.headers);
        if (body != null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
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
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
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
    };
    Body.mixIn(Response.prototype);
    Object.defineProperties(Response.prototype, {
      url: {enumerable: true},
      status: {enumerable: true},
      ok: {enumerable: true},
      redirected: {enumerable: true},
      statusText: {enumerable: true},
      headers: {enumerable: true},
      clone: {enumerable: true}
    });
    Object.defineProperty(Response.prototype, Symbol.toStringTag, {
      value: "Response",
      writable: false,
      enumerable: false,
      configurable: true
    });
    var INTERNALS$2 = Symbol("Request internals");
    var parse_url = Url.parse;
    var format_url = Url.format;
    var streamDestructionSupported = "destroy" in Stream.Readable.prototype;
    function isRequest(input) {
      return typeof input === "object" && typeof input[INTERNALS$2] === "object";
    }
    function isAbortSignal(signal) {
      const proto = signal && typeof signal === "object" && Object.getPrototypeOf(signal);
      return !!(proto && proto.constructor.name === "AbortSignal");
    }
    var Request = class {
      constructor(input) {
        let init = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        let parsedURL;
        if (!isRequest(input)) {
          if (input && input.href) {
            parsedURL = parse_url(input.href);
          } else {
            parsedURL = parse_url(`${input}`);
          }
          input = {};
        } else {
          parsedURL = parse_url(input.url);
        }
        let method = init.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init.body != null || isRequest(input) && input.body !== null) && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;
        Body.call(this, inputBody, {
          timeout: init.timeout || input.timeout || 0,
          size: init.size || input.size || 0
        });
        const headers = new Headers(init.headers || input.headers || {});
        if (inputBody != null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init)
          signal = init.signal;
        if (signal != null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS$2] = {
          method,
          redirect: init.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init.follow !== void 0 ? init.follow : input.follow !== void 0 ? input.follow : 20;
        this.compress = init.compress !== void 0 ? init.compress : input.compress !== void 0 ? input.compress : true;
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
      clone() {
        return new Request(this);
      }
    };
    Body.mixIn(Request.prototype);
    Object.defineProperty(Request.prototype, Symbol.toStringTag, {
      value: "Request",
      writable: false,
      enumerable: false,
      configurable: true
    });
    Object.defineProperties(Request.prototype, {
      method: {enumerable: true},
      url: {enumerable: true},
      headers: {enumerable: true},
      redirect: {enumerable: true},
      clone: {enumerable: true},
      signal: {enumerable: true}
    });
    function getNodeRequestOptions(request) {
      const parsedURL = request[INTERNALS$2].parsedURL;
      const headers = new Headers(request[INTERNALS$2].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      if (!parsedURL.protocol || !parsedURL.hostname) {
        throw new TypeError("Only absolute URLs are supported");
      }
      if (!/^https?:$/.test(parsedURL.protocol)) {
        throw new TypeError("Only HTTP(S) protocols are supported");
      }
      if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
        throw new Error("Cancellation of streamed requests with AbortSignal is not supported in node < 8");
      }
      let contentLengthValue = null;
      if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body != null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number") {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate");
      }
      let agent = request.agent;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      return Object.assign({}, parsedURL, {
        method: request.method,
        headers: exportNodeCompatibleHeaders(headers),
        agent
      });
    }
    function AbortError(message) {
      Error.call(this, message);
      this.type = "aborted";
      this.message = message;
      Error.captureStackTrace(this, this.constructor);
    }
    AbortError.prototype = Object.create(Error.prototype);
    AbortError.prototype.constructor = AbortError;
    AbortError.prototype.name = "AbortError";
    var PassThrough$1 = Stream.PassThrough;
    var resolve_url = Url.resolve;
    function fetch(url, opts) {
      if (!fetch.Promise) {
        throw new Error("native promise missing, set fetch.Promise to your favorite alternative");
      }
      Body.Promise = fetch.Promise;
      return new fetch.Promise(function(resolve, reject) {
        const request = new Request(url, opts);
        const options = getNodeRequestOptions(request);
        const send = (options.protocol === "https:" ? https : http).request;
        const signal = request.signal;
        let response = null;
        const abort = function abort2() {
          let error2 = new AbortError("The user aborted a request.");
          reject(error2);
          if (request.body && request.body instanceof Stream.Readable) {
            request.body.destroy(error2);
          }
          if (!response || !response.body)
            return;
          response.body.emit("error", error2);
        };
        if (signal && signal.aborted) {
          abort();
          return;
        }
        const abortAndFinalize = function abortAndFinalize2() {
          abort();
          finalize();
        };
        const req = send(options);
        let reqTimeout;
        if (signal) {
          signal.addEventListener("abort", abortAndFinalize);
        }
        function finalize() {
          req.abort();
          if (signal)
            signal.removeEventListener("abort", abortAndFinalize);
          clearTimeout(reqTimeout);
        }
        if (request.timeout) {
          req.once("socket", function(socket) {
            reqTimeout = setTimeout(function() {
              reject(new FetchError(`network timeout at: ${request.url}`, "request-timeout"));
              finalize();
            }, request.timeout);
          });
        }
        req.on("error", function(err) {
          reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
          finalize();
        });
        req.on("response", function(res) {
          clearTimeout(reqTimeout);
          const headers = createHeadersLenient(res.headers);
          if (fetch.isRedirect(res.statusCode)) {
            const location = headers.get("Location");
            const locationURL = location === null ? null : resolve_url(request.url, location);
            switch (request.redirect) {
              case "error":
                reject(new FetchError(`redirect mode is set to error: ${request.url}`, "no-redirect"));
                finalize();
                return;
              case "manual":
                if (locationURL !== null) {
                  try {
                    headers.set("Location", locationURL);
                  } catch (err) {
                    reject(err);
                  }
                }
                break;
              case "follow":
                if (locationURL === null) {
                  break;
                }
                if (request.counter >= request.follow) {
                  reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
                  finalize();
                  return;
                }
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
                if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
                  reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
                  finalize();
                  return;
                }
                if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === "POST") {
                  requestOpts.method = "GET";
                  requestOpts.body = void 0;
                  requestOpts.headers.delete("content-length");
                }
                resolve(fetch(new Request(locationURL, requestOpts)));
                finalize();
                return;
            }
          }
          res.once("end", function() {
            if (signal)
              signal.removeEventListener("abort", abortAndFinalize);
          });
          let body = res.pipe(new PassThrough$1());
          const response_options = {
            url: request.url,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers,
            size: request.size,
            timeout: request.timeout,
            counter: request.counter
          };
          const codings = headers.get("Content-Encoding");
          if (!request.compress || request.method === "HEAD" || codings === null || res.statusCode === 204 || res.statusCode === 304) {
            response = new Response(body, response_options);
            resolve(response);
            return;
          }
          const zlibOptions = {
            flush: zlib.Z_SYNC_FLUSH,
            finishFlush: zlib.Z_SYNC_FLUSH
          };
          if (codings == "gzip" || codings == "x-gzip") {
            body = body.pipe(zlib.createGunzip(zlibOptions));
            response = new Response(body, response_options);
            resolve(response);
            return;
          }
          if (codings == "deflate" || codings == "x-deflate") {
            const raw = res.pipe(new PassThrough$1());
            raw.once("data", function(chunk) {
              if ((chunk[0] & 15) === 8) {
                body = body.pipe(zlib.createInflate());
              } else {
                body = body.pipe(zlib.createInflateRaw());
              }
              response = new Response(body, response_options);
              resolve(response);
            });
            return;
          }
          if (codings == "br" && typeof zlib.createBrotliDecompress === "function") {
            body = body.pipe(zlib.createBrotliDecompress());
            response = new Response(body, response_options);
            resolve(response);
            return;
          }
          response = new Response(body, response_options);
          resolve(response);
        });
        writeToStream(req, request);
      });
    }
    fetch.isRedirect = function(code) {
      return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
    };
    fetch.Promise = global.Promise;
    module2.exports = exports2 = fetch;
    Object.defineProperty(exports2, "__esModule", {value: true});
    exports2.default = exports2;
    exports2.Headers = Headers;
    exports2.Request = Request;
    exports2.Response = Response;
    exports2.FetchError = FetchError;
  }
});

// node_modules/deprecation/dist-node/index.js
var require_dist_node2 = __commonJS({
  "node_modules/deprecation/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {value: true});
    var Deprecation = class extends Error {
      constructor(message) {
        super(message);
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
        this.name = "Deprecation";
      }
    };
    exports2.Deprecation = Deprecation;
  }
});

// node_modules/@octokit/request-error/dist-node/index.js
var require_dist_node3 = __commonJS({
  "node_modules/@octokit/request-error/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {value: true});
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var deprecation = require_dist_node2();
    var once = _interopDefault(require_once());
    var logOnce = once((deprecation2) => console.warn(deprecation2));
    var RequestError = class extends Error {
      constructor(message, statusCode, options) {
        super(message);
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
        this.name = "HttpError";
        this.status = statusCode;
        Object.defineProperty(this, "code", {
          get() {
            logOnce(new deprecation.Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
            return statusCode;
          }
        });
        this.headers = options.headers;
        const requestCopy = Object.assign({}, options.request);
        if (options.request.headers.authorization) {
          requestCopy.headers = Object.assign({}, options.request.headers, {
            authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]")
          });
        }
        requestCopy.url = requestCopy.url.replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]").replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
        this.request = requestCopy;
      }
    };
    exports2.RequestError = RequestError;
  }
});

// node_modules/@octokit/request/dist-node/index.js
var require_dist_node4 = __commonJS({
  "node_modules/@octokit/request/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {value: true});
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var endpoint = require_dist_node();
    var getUserAgent = _interopDefault(require_universal_user_agent());
    var isPlainObject = _interopDefault(require_index_cjs());
    var nodeFetch = _interopDefault(require_lib());
    var requestError = require_dist_node3();
    var VERSION = "0.0.0-development";
    function getBufferResponse(response) {
      return response.arrayBuffer();
    }
    function fetchWrapper(requestOptions) {
      if (isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
        requestOptions.body = JSON.stringify(requestOptions.body);
      }
      let headers = {};
      let status;
      let url;
      const fetch = requestOptions.request && requestOptions.request.fetch || nodeFetch;
      return fetch(requestOptions.url, Object.assign({
        method: requestOptions.method,
        body: requestOptions.body,
        headers: requestOptions.headers,
        redirect: requestOptions.redirect
      }, requestOptions.request)).then((response) => {
        url = response.url;
        status = response.status;
        for (const keyAndValue of response.headers) {
          headers[keyAndValue[0]] = keyAndValue[1];
        }
        if (status === 204 || status === 205) {
          return;
        }
        if (requestOptions.method === "HEAD") {
          if (status < 400) {
            return;
          }
          throw new requestError.RequestError(response.statusText, status, {
            headers,
            request: requestOptions
          });
        }
        if (status === 304) {
          throw new requestError.RequestError("Not modified", status, {
            headers,
            request: requestOptions
          });
        }
        if (status >= 400) {
          return response.text().then((message) => {
            const error2 = new requestError.RequestError(message, status, {
              headers,
              request: requestOptions
            });
            try {
              Object.assign(error2, JSON.parse(error2.message));
            } catch (e) {
            }
            throw error2;
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
      }).then((data) => {
        return {
          status,
          url,
          headers,
          data
        };
      }).catch((error2) => {
        if (error2 instanceof requestError.RequestError) {
          throw error2;
        }
        throw new requestError.RequestError(error2.message, 500, {
          headers,
          request: requestOptions
        });
      });
    }
    function withDefaults(oldEndpoint, newDefaults) {
      const endpoint2 = oldEndpoint.defaults(newDefaults);
      const newApi = function(route, parameters) {
        const endpointOptions = endpoint2.merge(route, parameters);
        if (!endpointOptions.request || !endpointOptions.request.hook) {
          return fetchWrapper(endpoint2.parse(endpointOptions));
        }
        const request2 = (route2, parameters2) => {
          return fetchWrapper(endpoint2.parse(endpoint2.merge(route2, parameters2)));
        };
        Object.assign(request2, {
          endpoint: endpoint2,
          defaults: withDefaults.bind(null, endpoint2)
        });
        return endpointOptions.request.hook(request2, endpointOptions);
      };
      return Object.assign(newApi, {
        endpoint: endpoint2,
        defaults: withDefaults.bind(null, endpoint2)
      });
    }
    var request = withDefaults(endpoint.endpoint, {
      headers: {
        "user-agent": `octokit-request.js/${VERSION} ${getUserAgent()}`
      }
    });
    exports2.request = request;
  }
});

// node_modules/@octokit/graphql/node_modules/universal-user-agent/index.js
var require_universal_user_agent2 = __commonJS({
  "node_modules/@octokit/graphql/node_modules/universal-user-agent/index.js"(exports2, module2) {
    module2.exports = getUserAgentNode;
    var osName = require_os_name();
    function getUserAgentNode() {
      try {
        return `Node.js/${process.version.substr(1)} (${osName()}; ${process.arch})`;
      } catch (error2) {
        if (/wmic os get Caption/.test(error2.message)) {
          return "Windows <version undetectable>";
        }
        throw error2;
      }
    }
  }
});

// node_modules/@octokit/graphql/package.json
var require_package = __commonJS({
  "node_modules/@octokit/graphql/package.json"(exports2, module2) {
    module2.exports = {
      name: "@octokit/graphql",
      version: "2.1.3",
      publishConfig: {
        access: "public"
      },
      description: "GitHub GraphQL API client for browsers and Node",
      main: "index.js",
      scripts: {
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
      },
      repository: {
        type: "git",
        url: "https://github.com/octokit/graphql.js.git"
      },
      keywords: [
        "octokit",
        "github",
        "api",
        "graphql"
      ],
      author: "Gregor Martynus (https://github.com/gr2m)",
      license: "MIT",
      bugs: {
        url: "https://github.com/octokit/graphql.js/issues"
      },
      homepage: "https://github.com/octokit/graphql.js#readme",
      dependencies: {
        "@octokit/request": "^5.0.0",
        "universal-user-agent": "^2.0.3"
      },
      devDependencies: {
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
      },
      bundlesize: [
        {
          path: "./dist/octokit-graphql.min.js.gz",
          maxSize: "5KB"
        }
      ],
      release: {
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
      },
      standard: {
        globals: [
          "describe",
          "before",
          "beforeEach",
          "afterEach",
          "after",
          "it",
          "expect"
        ]
      },
      files: [
        "lib"
      ]
    };
  }
});

// node_modules/@octokit/graphql/lib/error.js
var require_error = __commonJS({
  "node_modules/@octokit/graphql/lib/error.js"(exports2, module2) {
    module2.exports = class GraphqlError extends Error {
      constructor(request, response) {
        const message = response.data.errors[0].message;
        super(message);
        Object.assign(this, response.data);
        this.name = "GraphqlError";
        this.request = request;
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
      }
    };
  }
});

// node_modules/@octokit/graphql/lib/graphql.js
var require_graphql = __commonJS({
  "node_modules/@octokit/graphql/lib/graphql.js"(exports2, module2) {
    module2.exports = graphql;
    var GraphqlError = require_error();
    var NON_VARIABLE_OPTIONS = ["method", "baseUrl", "url", "headers", "request", "query"];
    function graphql(request, query, options) {
      if (typeof query === "string") {
        options = Object.assign({query}, options);
      } else {
        options = query;
      }
      const requestOptions = Object.keys(options).reduce((result, key) => {
        if (NON_VARIABLE_OPTIONS.includes(key)) {
          result[key] = options[key];
          return result;
        }
        if (!result.variables) {
          result.variables = {};
        }
        result.variables[key] = options[key];
        return result;
      }, {});
      return request(requestOptions).then((response) => {
        if (response.data.errors) {
          throw new GraphqlError(requestOptions, response);
        }
        return response.data.data;
      });
    }
  }
});

// node_modules/@octokit/graphql/lib/with-defaults.js
var require_with_defaults = __commonJS({
  "node_modules/@octokit/graphql/lib/with-defaults.js"(exports2, module2) {
    module2.exports = withDefaults;
    var graphql = require_graphql();
    function withDefaults(request, newDefaults) {
      const newRequest = request.defaults(newDefaults);
      const newApi = function(query, options) {
        return graphql(newRequest, query, options);
      };
      newApi.defaults = withDefaults.bind(null, newRequest);
      return newApi;
    }
  }
});

// node_modules/@octokit/graphql/index.js
var require_graphql2 = __commonJS({
  "node_modules/@octokit/graphql/index.js"(exports2, module2) {
    var {request} = require_dist_node4();
    var getUserAgent = require_universal_user_agent2();
    var version = require_package().version;
    var userAgent = `octokit-graphql.js/${version} ${getUserAgent()}`;
    var withDefaults = require_with_defaults();
    module2.exports = withDefaults(request, {
      method: "POST",
      url: "/graphql",
      headers: {
        "user-agent": userAgent
      }
    });
  }
});

// node_modules/before-after-hook/lib/register.js
var require_register = __commonJS({
  "node_modules/before-after-hook/lib/register.js"(exports2, module2) {
    module2.exports = register;
    function register(state, name, method, options) {
      if (typeof method !== "function") {
        throw new Error("method for before hook must be a function");
      }
      if (!options) {
        options = {};
      }
      if (Array.isArray(name)) {
        return name.reverse().reduce(function(callback, name2) {
          return register.bind(null, state, name2, callback, options);
        }, method)();
      }
      return Promise.resolve().then(function() {
        if (!state.registry[name]) {
          return method(options);
        }
        return state.registry[name].reduce(function(method2, registered) {
          return registered.hook.bind(null, method2, options);
        }, method)();
      });
    }
  }
});

// node_modules/before-after-hook/lib/add.js
var require_add = __commonJS({
  "node_modules/before-after-hook/lib/add.js"(exports2, module2) {
    module2.exports = addHook;
    function addHook(state, kind, name, hook) {
      var orig = hook;
      if (!state.registry[name]) {
        state.registry[name] = [];
      }
      if (kind === "before") {
        hook = function(method, options) {
          return Promise.resolve().then(orig.bind(null, options)).then(method.bind(null, options));
        };
      }
      if (kind === "after") {
        hook = function(method, options) {
          var result;
          return Promise.resolve().then(method.bind(null, options)).then(function(result_) {
            result = result_;
            return orig(result, options);
          }).then(function() {
            return result;
          });
        };
      }
      if (kind === "error") {
        hook = function(method, options) {
          return Promise.resolve().then(method.bind(null, options)).catch(function(error2) {
            return orig(error2, options);
          });
        };
      }
      state.registry[name].push({
        hook,
        orig
      });
    }
  }
});

// node_modules/before-after-hook/lib/remove.js
var require_remove = __commonJS({
  "node_modules/before-after-hook/lib/remove.js"(exports2, module2) {
    module2.exports = removeHook;
    function removeHook(state, name, method) {
      if (!state.registry[name]) {
        return;
      }
      var index = state.registry[name].map(function(registered) {
        return registered.orig;
      }).indexOf(method);
      if (index === -1) {
        return;
      }
      state.registry[name].splice(index, 1);
    }
  }
});

// node_modules/before-after-hook/index.js
var require_before_after_hook = __commonJS({
  "node_modules/before-after-hook/index.js"(exports2, module2) {
    var register = require_register();
    var addHook = require_add();
    var removeHook = require_remove();
    var bind = Function.bind;
    var bindable = bind.bind(bind);
    function bindApi(hook, state, name) {
      var removeHookRef = bindable(removeHook, null).apply(null, name ? [state, name] : [state]);
      hook.api = {remove: removeHookRef};
      hook.remove = removeHookRef;
      ["before", "error", "after", "wrap"].forEach(function(kind) {
        var args = name ? [state, kind, name] : [state, kind];
        hook[kind] = hook.api[kind] = bindable(addHook, null).apply(null, args);
      });
    }
    function HookSingular() {
      var singularHookName = "h";
      var singularHookState = {
        registry: {}
      };
      var singularHook = register.bind(null, singularHookState, singularHookName);
      bindApi(singularHook, singularHookState, singularHookName);
      return singularHook;
    }
    function HookCollection() {
      var state = {
        registry: {}
      };
      var hook = register.bind(null, state);
      bindApi(hook, state);
      return hook;
    }
    var collectionHookDeprecationMessageDisplayed = false;
    function Hook() {
      if (!collectionHookDeprecationMessageDisplayed) {
        console.warn('[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4');
        collectionHookDeprecationMessageDisplayed = true;
      }
      return HookCollection();
    }
    Hook.Singular = HookSingular.bind();
    Hook.Collection = HookCollection.bind();
    module2.exports = Hook;
    module2.exports.Hook = Hook;
    module2.exports.Singular = Hook.Singular;
    module2.exports.Collection = Hook.Collection;
  }
});

// node_modules/@octokit/rest/package.json
var require_package2 = __commonJS({
  "node_modules/@octokit/rest/package.json"(exports2, module2) {
    module2.exports = {
      name: "@octokit/rest",
      version: "16.28.7",
      publishConfig: {
        access: "public"
      },
      description: "GitHub REST API client for Node.js",
      keywords: [
        "octokit",
        "github",
        "rest",
        "api-client"
      ],
      author: "Gregor Martynus (https://github.com/gr2m)",
      contributors: [
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
      ],
      repository: "https://github.com/octokit/rest.js",
      dependencies: {
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
      },
      devDependencies: {
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
      },
      types: "index.d.ts",
      scripts: {
        coverage: "nyc report --reporter=html && open coverage/index.html",
        pretest: "standard",
        test: 'nyc mocha test/mocha-node-setup.js "test/*/**/*-test.js"',
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
      },
      license: "MIT",
      files: [
        "index.js",
        "index.d.ts",
        "lib",
        "plugins"
      ],
      nyc: {
        ignore: [
          "test"
        ]
      },
      release: {
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
      },
      standard: {
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
      },
      bundlesize: [
        {
          path: "./dist/octokit-rest.min.js.gz",
          maxSize: "33 kB"
        }
      ]
    };
  }
});

// node_modules/@octokit/rest/lib/parse-client-options.js
var require_parse_client_options = __commonJS({
  "node_modules/@octokit/rest/lib/parse-client-options.js"(exports2, module2) {
    module2.exports = parseOptions;
    var {Deprecation} = require_dist_node2();
    var getUserAgent = require_universal_user_agent();
    var once = require_once();
    var pkg = require_package2();
    var deprecateOptionsTimeout = once((log, deprecation) => log.warn(deprecation));
    var deprecateOptionsAgent = once((log, deprecation) => log.warn(deprecation));
    var deprecateOptionsHeaders = once((log, deprecation) => log.warn(deprecation));
    function parseOptions(options, log, hook) {
      if (options.headers) {
        options.headers = Object.keys(options.headers).reduce((newObj, key) => {
          newObj[key.toLowerCase()] = options.headers[key];
          return newObj;
        }, {});
      }
      const clientDefaults = {
        headers: options.headers || {},
        request: options.request || {},
        mediaType: {
          previews: [],
          format: ""
        }
      };
      if (options.baseUrl) {
        clientDefaults.baseUrl = options.baseUrl;
      }
      if (options.userAgent) {
        clientDefaults.headers["user-agent"] = options.userAgent;
      }
      if (options.previews) {
        clientDefaults.mediaType.previews = options.previews;
      }
      if (options.timeout) {
        deprecateOptionsTimeout(log, new Deprecation("[@octokit/rest] new Octokit({timeout}) is deprecated. Use {request: {timeout}} instead. See https://github.com/octokit/request.js#request"));
        clientDefaults.request.timeout = options.timeout;
      }
      if (options.agent) {
        deprecateOptionsAgent(log, new Deprecation("[@octokit/rest] new Octokit({agent}) is deprecated. Use {request: {agent}} instead. See https://github.com/octokit/request.js#request"));
        clientDefaults.request.agent = options.agent;
      }
      if (options.headers) {
        deprecateOptionsHeaders(log, new Deprecation("[@octokit/rest] new Octokit({headers}) is deprecated. Use {userAgent, previews} instead. See https://github.com/octokit/request.js#request"));
      }
      const userAgentOption = clientDefaults.headers["user-agent"];
      const defaultUserAgent = `octokit.js/${pkg.version} ${getUserAgent()}`;
      clientDefaults.headers["user-agent"] = [userAgentOption, defaultUserAgent].filter(Boolean).join(" ");
      clientDefaults.request.hook = hook.bind(null, "request");
      return clientDefaults;
    }
  }
});

// node_modules/@octokit/rest/lib/constructor.js
var require_constructor = __commonJS({
  "node_modules/@octokit/rest/lib/constructor.js"(exports2, module2) {
    module2.exports = Octokit2;
    var {request} = require_dist_node4();
    var Hook = require_before_after_hook();
    var parseClientOptions = require_parse_client_options();
    function Octokit2(plugins, options) {
      options = options || {};
      const hook = new Hook.Collection();
      const log = Object.assign({
        debug: () => {
        },
        info: () => {
        },
        warn: console.warn,
        error: console.error
      }, options && options.log);
      const api = {
        hook,
        log,
        request: request.defaults(parseClientOptions(options, log, hook))
      };
      plugins.forEach((pluginFunction) => pluginFunction(api, options));
      return api;
    }
  }
});

// node_modules/@octokit/rest/lib/register-plugin.js
var require_register_plugin = __commonJS({
  "node_modules/@octokit/rest/lib/register-plugin.js"(exports2, module2) {
    module2.exports = registerPlugin;
    var factory = require_factory();
    function registerPlugin(plugins, pluginFunction) {
      return factory(plugins.includes(pluginFunction) ? plugins : plugins.concat(pluginFunction));
    }
  }
});

// node_modules/@octokit/rest/lib/factory.js
var require_factory = __commonJS({
  "node_modules/@octokit/rest/lib/factory.js"(exports2, module2) {
    module2.exports = factory;
    var Octokit2 = require_constructor();
    var registerPlugin = require_register_plugin();
    function factory(plugins) {
      const Api = Octokit2.bind(null, plugins || []);
      Api.plugin = registerPlugin.bind(null, plugins || []);
      return Api;
    }
  }
});

// node_modules/@octokit/rest/lib/core.js
var require_core2 = __commonJS({
  "node_modules/@octokit/rest/lib/core.js"(exports2, module2) {
    var factory = require_factory();
    module2.exports = factory();
  }
});

// node_modules/@octokit/rest/plugins/log/index.js
var require_log = __commonJS({
  "node_modules/@octokit/rest/plugins/log/index.js"(exports2, module2) {
    module2.exports = octokitDebug;
    function octokitDebug(octokit) {
      octokit.hook.wrap("request", (request, options) => {
        octokit.log.debug(`request`, options);
        const start = Date.now();
        const requestOptions = octokit.request.endpoint.parse(options);
        const path = requestOptions.url.replace(options.baseUrl, "");
        return request(options).then((response) => {
          octokit.log.info(`${requestOptions.method} ${path} - ${response.status} in ${Date.now() - start}ms`);
          return response;
        }).catch((error2) => {
          octokit.log.info(`${requestOptions.method} ${path} - ${error2.status} in ${Date.now() - start}ms`);
          throw error2;
        });
      });
    }
  }
});

// node_modules/@octokit/rest/plugins/authentication-deprecated/authenticate.js
var require_authenticate = __commonJS({
  "node_modules/@octokit/rest/plugins/authentication-deprecated/authenticate.js"(exports2, module2) {
    module2.exports = authenticate;
    var {Deprecation} = require_dist_node2();
    var once = require_once();
    var deprecateAuthenticate = once((log, deprecation) => log.warn(deprecation));
    function authenticate(state, options) {
      deprecateAuthenticate(state.octokit.log, new Deprecation('[@octokit/rest] octokit.authenticate() is deprecated. Use "auth" constructor option instead.'));
      if (!options) {
        state.auth = false;
        return;
      }
      switch (options.type) {
        case "basic":
          if (!options.username || !options.password) {
            throw new Error("Basic authentication requires both a username and password to be set");
          }
          break;
        case "oauth":
          if (!options.token && !(options.key && options.secret)) {
            throw new Error("OAuth2 authentication requires a token or key & secret to be set");
          }
          break;
        case "token":
        case "app":
          if (!options.token) {
            throw new Error("Token authentication requires a token to be set");
          }
          break;
        default:
          throw new Error("Invalid authentication type, must be 'basic', 'oauth', 'token' or 'app'");
      }
      state.auth = options;
    }
  }
});

// node_modules/btoa-lite/btoa-node.js
var require_btoa_node = __commonJS({
  "node_modules/btoa-lite/btoa-node.js"(exports2, module2) {
    module2.exports = function btoa(str) {
      return new Buffer(str).toString("base64");
    };
  }
});

// node_modules/lodash.uniq/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.uniq/index.js"(exports2, module2) {
    var LARGE_ARRAY_SIZE = 200;
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var INFINITY = 1 / 0;
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    function arrayIncludes(array, value) {
      var length = array ? array.length : 0;
      return !!length && baseIndexOf(array, value, 0) > -1;
    }
    function arrayIncludesWith(array, value, comparator) {
      var index = -1, length = array ? array.length : 0;
      while (++index < length) {
        if (comparator(value, array[index])) {
          return true;
        }
      }
      return false;
    }
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
      while (fromRight ? index-- : ++index < length) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }
    function baseIndexOf(array, value, fromIndex) {
      if (value !== value) {
        return baseFindIndex(array, baseIsNaN, fromIndex);
      }
      var index = fromIndex - 1, length = array.length;
      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }
    function baseIsNaN(value) {
      return value !== value;
    }
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
        } catch (e) {
        }
      }
      return result;
    }
    function setToArray(set) {
      var index = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    var arrayProto = Array.prototype;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectToString = objectProto.toString;
    var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
    var splice = arrayProto.splice;
    var Map2 = getNative(root, "Map");
    var Set = getNative(root, "Set");
    var nativeCreate = getNative(Object, "create");
    function Hash(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
    }
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
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
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    function mapCacheDelete(key) {
      return getMapData(this, key)["delete"](key);
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function SetCache(values) {
      var index = -1, length = values ? values.length : 0;
      this.__data__ = new MapCache();
      while (++index < length) {
        this.add(values[index]);
      }
    }
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }
    function setCacheHas(value) {
      return this.__data__.has(value);
    }
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseUniq(array, iteratee, comparator) {
      var index = -1, includes = arrayIncludes, length = array.length, isCommon = true, result = [], seen = result;
      if (comparator) {
        isCommon = false;
        includes = arrayIncludesWith;
      } else if (length >= LARGE_ARRAY_SIZE) {
        var set = iteratee ? null : createSet(array);
        if (set) {
          return setToArray(set);
        }
        isCommon = false;
        includes = cacheHas;
        seen = new SetCache();
      } else {
        seen = iteratee ? [] : result;
      }
      outer:
        while (++index < length) {
          var value = array[index], computed = iteratee ? iteratee(value) : value;
          value = comparator || value !== 0 ? value : 0;
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
          } else if (!includes(seen, computed, comparator)) {
            if (seen !== result) {
              seen.push(computed);
            }
            result.push(value);
          }
        }
      return result;
    }
    var createSet = !(Set && 1 / setToArray(new Set([, -0]))[1] == INFINITY) ? noop : function(values) {
      return new Set(values);
    };
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    function uniq(array) {
      return array && array.length ? baseUniq(array) : [];
    }
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    function isFunction(value) {
      var tag = isObject(value) ? objectToString.call(value) : "";
      return tag == funcTag || tag == genTag;
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function noop() {
    }
    module2.exports = uniq;
  }
});

// node_modules/@octokit/rest/plugins/authentication-deprecated/before-request.js
var require_before_request = __commonJS({
  "node_modules/@octokit/rest/plugins/authentication-deprecated/before-request.js"(exports2, module2) {
    module2.exports = authenticationBeforeRequest;
    var btoa = require_btoa_node();
    var uniq = require_lodash();
    function authenticationBeforeRequest(state, options) {
      if (!state.auth.type) {
        return;
      }
      if (state.auth.type === "basic") {
        const hash = btoa(`${state.auth.username}:${state.auth.password}`);
        options.headers["authorization"] = `Basic ${hash}`;
        return;
      }
      if (state.auth.type === "token") {
        options.headers["authorization"] = `token ${state.auth.token}`;
        return;
      }
      if (state.auth.type === "app") {
        options.headers["authorization"] = `Bearer ${state.auth.token}`;
        const acceptHeaders = options.headers["accept"].split(",").concat("application/vnd.github.machine-man-preview+json");
        options.headers["accept"] = uniq(acceptHeaders).filter(Boolean).join(",");
        return;
      }
      options.url += options.url.indexOf("?") === -1 ? "?" : "&";
      if (state.auth.token) {
        options.url += `access_token=${encodeURIComponent(state.auth.token)}`;
        return;
      }
      const key = encodeURIComponent(state.auth.key);
      const secret = encodeURIComponent(state.auth.secret);
      options.url += `client_id=${key}&client_secret=${secret}`;
    }
  }
});

// node_modules/@octokit/rest/plugins/authentication-deprecated/request-error.js
var require_request_error = __commonJS({
  "node_modules/@octokit/rest/plugins/authentication-deprecated/request-error.js"(exports2, module2) {
    module2.exports = authenticationRequestError;
    var {RequestError} = require_dist_node3();
    function authenticationRequestError(state, error2, options) {
      if (!error2.headers)
        throw error2;
      const otpRequired = /required/.test(error2.headers["x-github-otp"] || "");
      if (error2.status !== 401 || !otpRequired) {
        throw error2;
      }
      if (error2.status === 401 && otpRequired && error2.request && error2.request.headers["x-github-otp"]) {
        throw new RequestError("Invalid one-time password for two-factor authentication", 401, {
          headers: error2.headers,
          request: options
        });
      }
      if (typeof state.auth.on2fa !== "function") {
        throw new RequestError("2FA required, but options.on2fa is not a function. See https://github.com/octokit/rest.js#authentication", 401, {
          headers: error2.headers,
          request: options
        });
      }
      return Promise.resolve().then(() => {
        return state.auth.on2fa();
      }).then((oneTimePassword) => {
        const newOptions = Object.assign(options, {
          headers: Object.assign({"x-github-otp": oneTimePassword}, options.headers)
        });
        return state.octokit.request(newOptions);
      });
    }
  }
});

// node_modules/@octokit/rest/plugins/authentication-deprecated/index.js
var require_authentication_deprecated = __commonJS({
  "node_modules/@octokit/rest/plugins/authentication-deprecated/index.js"(exports2, module2) {
    module2.exports = authenticationPlugin;
    var {Deprecation} = require_dist_node2();
    var once = require_once();
    var deprecateAuthenticate = once((log, deprecation) => log.warn(deprecation));
    var authenticate = require_authenticate();
    var beforeRequest = require_before_request();
    var requestError = require_request_error();
    function authenticationPlugin(octokit, options) {
      if (options.auth) {
        octokit.authenticate = () => {
          deprecateAuthenticate(octokit.log, new Deprecation('[@octokit/rest] octokit.authenticate() is deprecated and has no effect when "auth" option is set on Octokit constructor'));
        };
        return;
      }
      const state = {
        octokit,
        auth: false
      };
      octokit.authenticate = authenticate.bind(null, state);
      octokit.hook.before("request", beforeRequest.bind(null, state));
      octokit.hook.error("request", requestError.bind(null, state));
    }
  }
});

// node_modules/atob-lite/atob-node.js
var require_atob_node = __commonJS({
  "node_modules/atob-lite/atob-node.js"(exports2, module2) {
    module2.exports = function atob(str) {
      return Buffer.from(str, "base64").toString("binary");
    };
  }
});

// node_modules/@octokit/rest/plugins/authentication/with-authorization-prefix.js
var require_with_authorization_prefix = __commonJS({
  "node_modules/@octokit/rest/plugins/authentication/with-authorization-prefix.js"(exports2, module2) {
    module2.exports = withAuthorizationPrefix;
    var atob = require_atob_node();
    var REGEX_IS_BASIC_AUTH = /^[\w-]+:/;
    function withAuthorizationPrefix(authorization) {
      if (/^(basic|bearer|token) /i.test(authorization)) {
        return authorization;
      }
      try {
        if (REGEX_IS_BASIC_AUTH.test(atob(authorization))) {
          return `basic ${authorization}`;
        }
      } catch (error2) {
      }
      if (authorization.split(/\./).length === 3) {
        return `bearer ${authorization}`;
      }
      return `token ${authorization}`;
    }
  }
});

// node_modules/@octokit/rest/plugins/authentication/before-request.js
var require_before_request2 = __commonJS({
  "node_modules/@octokit/rest/plugins/authentication/before-request.js"(exports2, module2) {
    module2.exports = authenticationBeforeRequest;
    var btoa = require_btoa_node();
    var withAuthorizationPrefix = require_with_authorization_prefix();
    function authenticationBeforeRequest(state, options) {
      if (typeof state.auth === "string") {
        options.headers["authorization"] = withAuthorizationPrefix(state.auth);
        if (/^bearer /i.test(state.auth) && !/machine-man/.test(options.headers["accept"])) {
          const acceptHeaders = options.headers["accept"].split(",").concat("application/vnd.github.machine-man-preview+json");
          options.headers["accept"] = acceptHeaders.filter(Boolean).join(",");
        }
        return;
      }
      if (state.auth.username) {
        const hash = btoa(`${state.auth.username}:${state.auth.password}`);
        options.headers["authorization"] = `Basic ${hash}`;
        if (state.otp) {
          options.headers["x-github-otp"] = state.otp;
        }
        return;
      }
      if (state.auth.clientId) {
        if (/\/applications\/:?[\w_]+\/tokens\/:?[\w_]+($|\?)/.test(options.url)) {
          const hash = btoa(`${state.auth.clientId}:${state.auth.clientSecret}`);
          options.headers["authorization"] = `Basic ${hash}`;
          return;
        }
        options.url += options.url.indexOf("?") === -1 ? "?" : "&";
        options.url += `client_id=${state.auth.clientId}&client_secret=${state.auth.clientSecret}`;
        return;
      }
      return Promise.resolve().then(() => {
        return state.auth();
      }).then((authorization) => {
        options.headers["authorization"] = withAuthorizationPrefix(authorization);
      });
    }
  }
});

// node_modules/@octokit/rest/plugins/authentication/request-error.js
var require_request_error2 = __commonJS({
  "node_modules/@octokit/rest/plugins/authentication/request-error.js"(exports2, module2) {
    module2.exports = authenticationRequestError;
    var {RequestError} = require_dist_node3();
    function authenticationRequestError(state, error2, options) {
      if (!error2.headers)
        throw error2;
      const otpRequired = /required/.test(error2.headers["x-github-otp"] || "");
      if (error2.status !== 401 || !otpRequired) {
        throw error2;
      }
      if (error2.status === 401 && otpRequired && error2.request && error2.request.headers["x-github-otp"]) {
        if (state.otp) {
          delete state.otp;
        } else {
          throw new RequestError("Invalid one-time password for two-factor authentication", 401, {
            headers: error2.headers,
            request: options
          });
        }
      }
      if (typeof state.auth.on2fa !== "function") {
        throw new RequestError("2FA required, but options.on2fa is not a function. See https://github.com/octokit/rest.js#authentication", 401, {
          headers: error2.headers,
          request: options
        });
      }
      return Promise.resolve().then(() => {
        return state.auth.on2fa();
      }).then((oneTimePassword) => {
        const newOptions = Object.assign(options, {
          headers: Object.assign(options.headers, {"x-github-otp": oneTimePassword})
        });
        return state.octokit.request(newOptions).then((response) => {
          state.otp = oneTimePassword;
          return response;
        });
      });
    }
  }
});

// node_modules/@octokit/rest/plugins/authentication/validate.js
var require_validate = __commonJS({
  "node_modules/@octokit/rest/plugins/authentication/validate.js"(exports2, module2) {
    module2.exports = validateAuth;
    function validateAuth(auth) {
      if (typeof auth === "string") {
        return;
      }
      if (typeof auth === "function") {
        return;
      }
      if (auth.username && auth.password) {
        return;
      }
      if (auth.clientId && auth.clientSecret) {
        return;
      }
      throw new Error(`Invalid "auth" option: ${JSON.stringify(auth)}`);
    }
  }
});

// node_modules/@octokit/rest/plugins/authentication/index.js
var require_authentication = __commonJS({
  "node_modules/@octokit/rest/plugins/authentication/index.js"(exports2, module2) {
    module2.exports = authenticationPlugin;
    var beforeRequest = require_before_request2();
    var requestError = require_request_error2();
    var validate = require_validate();
    function authenticationPlugin(octokit, options) {
      if (!options.auth) {
        return;
      }
      validate(options.auth);
      const state = {
        octokit,
        auth: options.auth
      };
      octokit.hook.before("request", beforeRequest.bind(null, state));
      octokit.hook.error("request", requestError.bind(null, state));
    }
  }
});

// node_modules/@octokit/rest/plugins/pagination/normalize-paginated-list-response.js
var require_normalize_paginated_list_response = __commonJS({
  "node_modules/@octokit/rest/plugins/pagination/normalize-paginated-list-response.js"(exports2, module2) {
    module2.exports = normalizePaginatedListResponse;
    var {Deprecation} = require_dist_node2();
    var once = require_once();
    var deprecateIncompleteResults = once((log, deprecation) => log.warn(deprecation));
    var deprecateTotalCount = once((log, deprecation) => log.warn(deprecation));
    var deprecateNamespace = once((log, deprecation) => log.warn(deprecation));
    var REGEX_IS_SEARCH_PATH = /^\/search\//;
    var REGEX_IS_CHECKS_PATH = /^\/repos\/[^/]+\/[^/]+\/commits\/[^/]+\/(check-runs|check-suites)/;
    var REGEX_IS_INSTALLATION_REPOSITORIES_PATH = /^\/installation\/repositories/;
    var REGEX_IS_USER_INSTALLATIONS_PATH = /^\/user\/installations/;
    function normalizePaginatedListResponse(octokit, url, response) {
      const path = url.replace(octokit.request.endpoint.DEFAULTS.baseUrl, "");
      if (!REGEX_IS_SEARCH_PATH.test(path) && !REGEX_IS_CHECKS_PATH.test(path) && !REGEX_IS_INSTALLATION_REPOSITORIES_PATH.test(path) && !REGEX_IS_USER_INSTALLATIONS_PATH.test(path)) {
        return;
      }
      const incompleteResults = response.data.incomplete_results;
      const repositorySelection = response.data.repository_selection;
      const totalCount = response.data.total_count;
      delete response.data.incomplete_results;
      delete response.data.repository_selection;
      delete response.data.total_count;
      const namespaceKey = Object.keys(response.data)[0];
      response.data = response.data[namespaceKey];
      Object.defineProperty(response.data, namespaceKey, {
        get() {
          deprecateNamespace(octokit.log, new Deprecation(`[@octokit/rest] "result.data.${namespaceKey}" is deprecated. Use "result.data" instead`));
          return response.data;
        }
      });
      if (typeof incompleteResults !== "undefined") {
        Object.defineProperty(response.data, "incomplete_results", {
          get() {
            deprecateIncompleteResults(octokit.log, new Deprecation('[@octokit/rest] "result.data.incomplete_results" is deprecated.'));
            return incompleteResults;
          }
        });
      }
      if (typeof repositorySelection !== "undefined") {
        Object.defineProperty(response.data, "repository_selection", {
          get() {
            deprecateTotalCount(octokit.log, new Deprecation('[@octokit/rest] "result.data.repository_selection" is deprecated.'));
            return repositorySelection;
          }
        });
      }
      Object.defineProperty(response.data, "total_count", {
        get() {
          deprecateTotalCount(octokit.log, new Deprecation('[@octokit/rest] "result.data.total_count" is deprecated.'));
          return totalCount;
        }
      });
    }
  }
});

// node_modules/@octokit/rest/plugins/pagination/iterator.js
var require_iterator = __commonJS({
  "node_modules/@octokit/rest/plugins/pagination/iterator.js"(exports2, module2) {
    module2.exports = iterator;
    var normalizePaginatedListResponse = require_normalize_paginated_list_response();
    function iterator(octokit, options) {
      const headers = options.headers;
      let url = octokit.request.endpoint(options).url;
      return {
        [Symbol.asyncIterator]: () => ({
          next() {
            if (!url) {
              return Promise.resolve({done: true});
            }
            return octokit.request({url, headers}).then((response) => {
              normalizePaginatedListResponse(octokit, url, response);
              url = ((response.headers.link || "").match(/<([^>]+)>;\s*rel="next"/) || [])[1];
              return {value: response};
            });
          }
        })
      };
    }
  }
});

// node_modules/@octokit/rest/plugins/pagination/paginate.js
var require_paginate = __commonJS({
  "node_modules/@octokit/rest/plugins/pagination/paginate.js"(exports2, module2) {
    module2.exports = paginate;
    var iterator = require_iterator();
    function paginate(octokit, route, options, mapFn) {
      if (typeof options === "function") {
        mapFn = options;
        options = void 0;
      }
      options = octokit.request.endpoint.merge(route, options);
      return gather(octokit, [], iterator(octokit, options)[Symbol.asyncIterator](), mapFn);
    }
    function gather(octokit, results, iterator2, mapFn) {
      return iterator2.next().then((result) => {
        if (result.done) {
          return results;
        }
        let earlyExit = false;
        function done() {
          earlyExit = true;
        }
        results = results.concat(mapFn ? mapFn(result.value, done) : result.value.data);
        if (earlyExit) {
          return results;
        }
        return gather(octokit, results, iterator2, mapFn);
      });
    }
  }
});

// node_modules/@octokit/rest/plugins/pagination/index.js
var require_pagination = __commonJS({
  "node_modules/@octokit/rest/plugins/pagination/index.js"(exports2, module2) {
    module2.exports = paginatePlugin;
    var iterator = require_iterator();
    var paginate = require_paginate();
    function paginatePlugin(octokit) {
      octokit.paginate = paginate.bind(null, octokit);
      octokit.paginate.iterator = iterator.bind(null, octokit);
    }
  }
});

// node_modules/@octokit/rest/plugins/normalize-git-reference-responses/index.js
var require_normalize_git_reference_responses = __commonJS({
  "node_modules/@octokit/rest/plugins/normalize-git-reference-responses/index.js"(exports2, module2) {
    module2.exports = octokitRestNormalizeGitReferenceResponses;
    var {RequestError} = require_dist_node3();
    function octokitRestNormalizeGitReferenceResponses(octokit) {
      octokit.hook.wrap("request", (request, options) => {
        const isGetOrListRefRequest = /\/repos\/:?\w+\/:?\w+\/git\/refs\/:?\w+/.test(options.url);
        if (!isGetOrListRefRequest) {
          return request(options);
        }
        const isGetRefRequest = "ref" in options;
        return request(options).then((response) => {
          if (isGetRefRequest) {
            if (Array.isArray(response.data)) {
              throw new RequestError(`More than one reference found for "${options.ref}"`, 404, {
                request: options
              });
            }
            return response;
          }
          if (!Array.isArray(response.data)) {
            response.data = [response.data];
          }
          return response;
        }).catch((error2) => {
          if (isGetRefRequest) {
            throw error2;
          }
          if (error2.status === 404) {
            return {
              status: 200,
              headers: error2.headers,
              data: []
            };
          }
          throw error2;
        });
      });
    }
  }
});

// node_modules/@octokit/rest/plugins/register-endpoints/register-endpoints.js
var require_register_endpoints = __commonJS({
  "node_modules/@octokit/rest/plugins/register-endpoints/register-endpoints.js"(exports2, module2) {
    module2.exports = registerEndpoints;
    var {Deprecation} = require_dist_node2();
    function registerEndpoints(octokit, routes) {
      Object.keys(routes).forEach((namespaceName) => {
        if (!octokit[namespaceName]) {
          octokit[namespaceName] = {};
        }
        Object.keys(routes[namespaceName]).forEach((apiName) => {
          const apiOptions = routes[namespaceName][apiName];
          const endpointDefaults = ["method", "url", "headers"].reduce((map, key) => {
            if (typeof apiOptions[key] !== "undefined") {
              map[key] = apiOptions[key];
            }
            return map;
          }, {});
          endpointDefaults.request = {
            validate: apiOptions.params
          };
          let request = octokit.request.defaults(endpointDefaults);
          const hasDeprecatedParam = Object.keys(apiOptions.params || {}).find((key) => apiOptions.params[key].deprecated);
          if (hasDeprecatedParam) {
            const patch = patchForDeprecation.bind(null, octokit, apiOptions);
            request = patch(octokit.request.defaults(endpointDefaults), `.${namespaceName}.${apiName}()`);
            request.endpoint = patch(request.endpoint, `.${namespaceName}.${apiName}.endpoint()`);
            request.endpoint.merge = patch(request.endpoint.merge, `.${namespaceName}.${apiName}.endpoint.merge()`);
          }
          if (apiOptions.deprecated) {
            octokit[namespaceName][apiName] = function deprecatedEndpointMethod() {
              octokit.log.warn(new Deprecation(`[@octokit/rest] ${apiOptions.deprecated}`));
              octokit[namespaceName][apiName] = request;
              return request.apply(null, arguments);
            };
            return;
          }
          octokit[namespaceName][apiName] = request;
        });
      });
    }
    function patchForDeprecation(octokit, apiOptions, method, methodName) {
      const patchedMethod = (options) => {
        options = Object.assign({}, options);
        Object.keys(options).forEach((key) => {
          if (apiOptions.params[key] && apiOptions.params[key].deprecated) {
            const aliasKey = apiOptions.params[key].alias;
            octokit.log.warn(new Deprecation(`[@octokit/rest] "${key}" parameter is deprecated for "${methodName}". Use "${aliasKey}" instead`));
            if (!(aliasKey in options)) {
              options[aliasKey] = options[key];
            }
            delete options[key];
          }
        });
        return method(options);
      };
      Object.keys(method).forEach((key) => {
        patchedMethod[key] = method[key];
      });
      return patchedMethod;
    }
  }
});

// node_modules/@octokit/rest/plugins/register-endpoints/index.js
var require_register_endpoints2 = __commonJS({
  "node_modules/@octokit/rest/plugins/register-endpoints/index.js"(exports2, module2) {
    module2.exports = octokitRegisterEndpoints;
    var registerEndpoints = require_register_endpoints();
    function octokitRegisterEndpoints(octokit) {
      octokit.registerEndpoints = registerEndpoints.bind(null, octokit);
    }
  }
});

// node_modules/@octokit/rest/plugins/rest-api-endpoints/routes.json
var require_routes = __commonJS({
  "node_modules/@octokit/rest/plugins/rest-api-endpoints/routes.json"(exports2, module2) {
    module2.exports = {
      activity: {
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
          params: {},
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
      },
      apps: {
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
          params: {},
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
      },
      checks: {
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
                "queued",
                "in_progress",
                "completed"
              ],
              type: "string"
            }
          },
          url: "/repos/:owner/:repo/check-runs/:check_run_id"
        }
      },
      codesOfConduct: {
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
          params: {},
          url: "/codes_of_conduct"
        }
      },
      emojis: {
        get: {
          method: "GET",
          params: {},
          url: "/emojis"
        }
      },
      gists: {
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
            public: {
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
        delete: {
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
      },
      git: {
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
      },
      gitignore: {
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
          params: {},
          url: "/gitignore/templates"
        }
      },
      interactions: {
        addOrUpdateRestrictionsForOrg: {
          headers: {
            accept: "application/vnd.github.sombra-preview+json"
          },
          method: "PUT",
          params: {
            limit: {
              enum: [
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
              enum: [
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
      },
      issues: {
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
              enum: [
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
              enum: [
                "asc",
                "desc"
              ],
              type: "string"
            },
            filter: {
              enum: [
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
              enum: [
                "created",
                "updated",
                "comments"
              ],
              type: "string"
            },
            state: {
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
                "asc",
                "desc"
              ],
              type: "string"
            },
            filter: {
              enum: [
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
              enum: [
                "created",
                "updated",
                "comments"
              ],
              type: "string"
            },
            state: {
              enum: [
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
              enum: [
                "asc",
                "desc"
              ],
              type: "string"
            },
            filter: {
              enum: [
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
              enum: [
                "created",
                "updated",
                "comments"
              ],
              type: "string"
            },
            state: {
              enum: [
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
              enum: [
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
              enum: [
                "created",
                "updated",
                "comments"
              ],
              type: "string"
            },
            state: {
              enum: [
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
              enum: [
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
              enum: [
                "due_on",
                "completeness"
              ],
              type: "string"
            },
            state: {
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
      },
      licenses: {
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
          params: {},
          url: "/licenses"
        },
        listCommonlyUsed: {
          method: "GET",
          params: {},
          url: "/licenses"
        }
      },
      markdown: {
        render: {
          method: "POST",
          params: {
            context: {
              type: "string"
            },
            mode: {
              enum: [
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
      },
      meta: {
        get: {
          method: "GET",
          params: {},
          url: "/meta"
        }
      },
      migrations: {
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
              enum: [
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
              enum: [
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
      },
      oauthAuthorizations: {
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
      },
      orgs: {
        addOrUpdateMembership: {
          method: "PUT",
          params: {
            org: {
              required: true,
              type: "string"
            },
            role: {
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
                "active"
              ],
              required: true,
              type: "string"
            }
          },
          url: "/user/memberships/orgs/:org"
        }
      },
      projects: {
        addCollaborator: {
          headers: {
            accept: "application/vnd.github.inertia-preview+json"
          },
          method: "PUT",
          params: {
            permission: {
              enum: [
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
        delete: {
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
            private: {
              type: "boolean"
            },
            project_id: {
              required: true,
              type: "integer"
            },
            state: {
              enum: [
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
      },
      pulls: {
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
              enum: [
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
              enum: [
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
              enum: [
                "created",
                "updated",
                "popularity",
                "long-running"
              ],
              type: "string"
            },
            state: {
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
      },
      rateLimit: {
        get: {
          method: "GET",
          params: {},
          url: "/rate_limit"
        }
      },
      reactions: {
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
        delete: {
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
      },
      repos: {
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
              enum: [
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
              enum: [
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
              enum: [
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
            private: {
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
            private: {
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
              enum: [
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
            private: {
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
        delete: {
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
              enum: [
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
              enum: [
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
          deprecated: '"Get the SHA-1 of a commit reference" will be removed. Use "Get a single commit" instead with media type format set to "sha" instead.',
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
              enum: [
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
              enum: [
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
              enum: [
                "created",
                "updated",
                "pushed",
                "full_name"
              ],
              type: "string"
            },
            type: {
              enum: [
                "all",
                "owner",
                "public",
                "private",
                "member"
              ],
              type: "string"
            },
            visibility: {
              enum: [
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
            protected: {
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
              enum: [
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
              enum: [
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
              enum: [
                "created",
                "updated",
                "pushed",
                "full_name"
              ],
              type: "string"
            },
            type: {
              enum: [
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
              enum: [
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
              enum: [
                "created",
                "updated",
                "pushed",
                "full_name"
              ],
              type: "string"
            },
            type: {
              enum: [
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
              enum: [
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
            private: {
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
              enum: [
                '"gh-pages"',
                '"master"',
                '"master /docs"'
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
              enum: [
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
      },
      search: {
        code: {
          method: "GET",
          params: {
            order: {
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
                "followers",
                "repositories",
                "joined"
              ],
              type: "string"
            }
          },
          url: "/search/users"
        }
      },
      teams: {
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
                "pull",
                "push",
                "admin"
              ],
              type: "string"
            },
            privacy: {
              enum: [
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
            private: {
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
        delete: {
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
              enum: [
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
              enum: [
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
              enum: [
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
              enum: [
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
      },
      users: {
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
          params: {},
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
              enum: [
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
          params: {},
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
      }
    };
  }
});

// node_modules/@octokit/rest/plugins/rest-api-endpoints/index.js
var require_rest_api_endpoints = __commonJS({
  "node_modules/@octokit/rest/plugins/rest-api-endpoints/index.js"(exports2, module2) {
    module2.exports = octokitRestApiEndpoints;
    var ROUTES = require_routes();
    function octokitRestApiEndpoints(octokit) {
      ROUTES.gitdata = ROUTES.git;
      ROUTES.authorization = ROUTES.oauthAuthorizations;
      ROUTES.pullRequests = ROUTES.pulls;
      octokit.registerEndpoints(ROUTES);
    }
  }
});

// node_modules/lodash.get/index.js
var require_lodash2 = __commonJS({
  "node_modules/lodash.get/index.js"(exports2, module2) {
    var FUNC_ERROR_TEXT = "Expected a function";
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var INFINITY = 1 / 0;
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var symbolTag = "[object Symbol]";
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
    var reIsPlainProp = /^\w*$/;
    var reLeadingDot = /^\./;
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reEscapeChar = /\\(\\)?/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
        } catch (e) {
        }
      }
      return result;
    }
    var arrayProto = Array.prototype;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectToString = objectProto.toString;
    var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
    var Symbol2 = root.Symbol;
    var splice = arrayProto.splice;
    var Map2 = getNative(root, "Map");
    var nativeCreate = getNative(Object, "create");
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolToString = symbolProto ? symbolProto.toString : void 0;
    function Hash(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
    }
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
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
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    function mapCacheDelete(key) {
      return getMapData(this, key)["delete"](key);
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseGet(object, path) {
      path = isKey(path, object) ? [path] : castPath(path);
      var index = 0, length = path.length;
      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return index && index == length ? object : void 0;
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseToString(value) {
      if (typeof value == "string") {
        return value;
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    function castPath(value) {
      return isArray(value) ? value : stringToPath(value);
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    var stringToPath = memoize(function(string) {
      string = toString(string);
      var result = [];
      if (reLeadingDot.test(string)) {
        result.push("");
      }
      string.replace(rePropName, function(match, number, quote, string2) {
        result.push(quote ? string2.replace(reEscapeChar, "$1") : number || match);
      });
      return result;
    });
    function toKey(value) {
      if (typeof value == "string" || isSymbol(value)) {
        return value;
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    function memoize(func, resolver) {
      if (typeof func != "function" || resolver && typeof resolver != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result);
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache)();
      return memoized;
    }
    memoize.Cache = MapCache;
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    var isArray = Array.isArray;
    function isFunction(value) {
      var tag = isObject(value) ? objectToString.call(value) : "";
      return tag == funcTag || tag == genTag;
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toString(value) {
      return value == null ? "" : baseToString(value);
    }
    function get(object, path, defaultValue) {
      var result = object == null ? void 0 : baseGet(object, path);
      return result === void 0 ? defaultValue : result;
    }
    module2.exports = get;
  }
});

// node_modules/lodash.set/index.js
var require_lodash3 = __commonJS({
  "node_modules/lodash.set/index.js"(exports2, module2) {
    var FUNC_ERROR_TEXT = "Expected a function";
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var INFINITY = 1 / 0;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var symbolTag = "[object Symbol]";
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
    var reIsPlainProp = /^\w*$/;
    var reLeadingDot = /^\./;
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reEscapeChar = /\\(\\)?/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
        } catch (e) {
        }
      }
      return result;
    }
    var arrayProto = Array.prototype;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectToString = objectProto.toString;
    var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
    var Symbol2 = root.Symbol;
    var splice = arrayProto.splice;
    var Map2 = getNative(root, "Map");
    var nativeCreate = getNative(Object, "create");
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolToString = symbolProto ? symbolProto.toString : void 0;
    function Hash(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
    }
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
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
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    function mapCacheDelete(key) {
      return getMapData(this, key)["delete"](key);
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
        object[key] = value;
      }
    }
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseSet(object, path, value, customizer) {
      if (!isObject(object)) {
        return object;
      }
      path = isKey(path, object) ? [path] : castPath(path);
      var index = -1, length = path.length, lastIndex = length - 1, nested = object;
      while (nested != null && ++index < length) {
        var key = toKey(path[index]), newValue = value;
        if (index != lastIndex) {
          var objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : void 0;
          if (newValue === void 0) {
            newValue = isObject(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
          }
        }
        assignValue(nested, key, newValue);
        nested = nested[key];
      }
      return object;
    }
    function baseToString(value) {
      if (typeof value == "string") {
        return value;
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    function castPath(value) {
      return isArray(value) ? value : stringToPath(value);
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    var stringToPath = memoize(function(string) {
      string = toString(string);
      var result = [];
      if (reLeadingDot.test(string)) {
        result.push("");
      }
      string.replace(rePropName, function(match, number, quote, string2) {
        result.push(quote ? string2.replace(reEscapeChar, "$1") : number || match);
      });
      return result;
    });
    function toKey(value) {
      if (typeof value == "string" || isSymbol(value)) {
        return value;
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    function memoize(func, resolver) {
      if (typeof func != "function" || resolver && typeof resolver != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result);
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache)();
      return memoized;
    }
    memoize.Cache = MapCache;
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    var isArray = Array.isArray;
    function isFunction(value) {
      var tag = isObject(value) ? objectToString.call(value) : "";
      return tag == funcTag || tag == genTag;
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toString(value) {
      return value == null ? "" : baseToString(value);
    }
    function set(object, path, value) {
      return object == null ? object : baseSet(object, path, value);
    }
    module2.exports = set;
  }
});

// node_modules/@octokit/rest/plugins/validate/validate.js
var require_validate2 = __commonJS({
  "node_modules/@octokit/rest/plugins/validate/validate.js"(exports2, module2) {
    "use strict";
    module2.exports = validate;
    var {RequestError} = require_dist_node3();
    var get = require_lodash2();
    var set = require_lodash3();
    function validate(octokit, options) {
      if (!options.request.validate) {
        return;
      }
      const {validate: params} = options.request;
      Object.keys(params).forEach((parameterName) => {
        const parameter = get(params, parameterName);
        const expectedType = parameter.type;
        let parentParameterName;
        let parentValue;
        let parentParamIsPresent = true;
        let parentParameterIsArray = false;
        if (/\./.test(parameterName)) {
          parentParameterName = parameterName.replace(/\.[^.]+$/, "");
          parentParameterIsArray = parentParameterName.slice(-2) === "[]";
          if (parentParameterIsArray) {
            parentParameterName = parentParameterName.slice(0, -2);
          }
          parentValue = get(options, parentParameterName);
          parentParamIsPresent = parentParameterName === "headers" || typeof parentValue === "object" && parentValue !== null;
        }
        const values = parentParameterIsArray ? (get(options, parentParameterName) || []).map((value) => value[parameterName.split(/\./).pop()]) : [get(options, parameterName)];
        values.forEach((value, i) => {
          const valueIsPresent = typeof value !== "undefined";
          const valueIsNull = value === null;
          const currentParameterName = parentParameterIsArray ? parameterName.replace(/\[\]/, `[${i}]`) : parameterName;
          if (!parameter.required && !valueIsPresent) {
            return;
          }
          if (!parentParamIsPresent) {
            return;
          }
          if (parameter.allowNull && valueIsNull) {
            return;
          }
          if (!parameter.allowNull && valueIsNull) {
            throw new RequestError(`'${currentParameterName}' cannot be null`, 400, {
              request: options
            });
          }
          if (parameter.required && !valueIsPresent) {
            throw new RequestError(`Empty value for parameter '${currentParameterName}': ${JSON.stringify(value)}`, 400, {
              request: options
            });
          }
          if (expectedType === "integer") {
            const unparsedValue = value;
            value = parseInt(value, 10);
            if (isNaN(value)) {
              throw new RequestError(`Invalid value for parameter '${currentParameterName}': ${JSON.stringify(unparsedValue)} is NaN`, 400, {
                request: options
              });
            }
          }
          if (parameter.enum && parameter.enum.indexOf(value) === -1) {
            throw new RequestError(`Invalid value for parameter '${currentParameterName}': ${JSON.stringify(value)}`, 400, {
              request: options
            });
          }
          if (parameter.validation) {
            const regex = new RegExp(parameter.validation);
            if (!regex.test(value)) {
              throw new RequestError(`Invalid value for parameter '${currentParameterName}': ${JSON.stringify(value)}`, 400, {
                request: options
              });
            }
          }
          if (expectedType === "object" && typeof value === "string") {
            try {
              value = JSON.parse(value);
            } catch (exception) {
              throw new RequestError(`JSON parse error of value for parameter '${currentParameterName}': ${JSON.stringify(value)}`, 400, {
                request: options
              });
            }
          }
          set(options, parameter.mapTo || currentParameterName, value);
        });
      });
      return options;
    }
  }
});

// node_modules/@octokit/rest/plugins/validate/index.js
var require_validate3 = __commonJS({
  "node_modules/@octokit/rest/plugins/validate/index.js"(exports2, module2) {
    module2.exports = octokitValidate;
    var validate = require_validate2();
    function octokitValidate(octokit) {
      octokit.hook.before("request", validate.bind(null, octokit));
    }
  }
});

// node_modules/octokit-pagination-methods/lib/deprecate.js
var require_deprecate = __commonJS({
  "node_modules/octokit-pagination-methods/lib/deprecate.js"(exports2, module2) {
    module2.exports = deprecate;
    var loggedMessages = {};
    function deprecate(message) {
      if (loggedMessages[message]) {
        return;
      }
      console.warn(`DEPRECATED (@octokit/rest): ${message}`);
      loggedMessages[message] = 1;
    }
  }
});

// node_modules/octokit-pagination-methods/lib/get-page-links.js
var require_get_page_links = __commonJS({
  "node_modules/octokit-pagination-methods/lib/get-page-links.js"(exports2, module2) {
    module2.exports = getPageLinks;
    function getPageLinks(link) {
      link = link.link || link.headers.link || "";
      const links = {};
      link.replace(/<([^>]*)>;\s*rel="([\w]*)"/g, (m, uri, type) => {
        links[type] = uri;
      });
      return links;
    }
  }
});

// node_modules/octokit-pagination-methods/lib/http-error.js
var require_http_error = __commonJS({
  "node_modules/octokit-pagination-methods/lib/http-error.js"(exports2, module2) {
    module2.exports = class HttpError extends Error {
      constructor(message, code, headers) {
        super(message);
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
        this.name = "HttpError";
        this.code = code;
        this.headers = headers;
      }
    };
  }
});

// node_modules/octokit-pagination-methods/lib/get-page.js
var require_get_page = __commonJS({
  "node_modules/octokit-pagination-methods/lib/get-page.js"(exports2, module2) {
    module2.exports = getPage;
    var deprecate = require_deprecate();
    var getPageLinks = require_get_page_links();
    var HttpError = require_http_error();
    function getPage(octokit, link, which, headers) {
      deprecate(`octokit.get${which.charAt(0).toUpperCase() + which.slice(1)}Page() \u2013 You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
      const url = getPageLinks(link)[which];
      if (!url) {
        const urlError = new HttpError(`No ${which} page found`, 404);
        return Promise.reject(urlError);
      }
      const requestOptions = {
        url,
        headers: applyAcceptHeader(link, headers)
      };
      const promise = octokit.request(requestOptions);
      return promise;
    }
    function applyAcceptHeader(res, headers) {
      const previous = res.headers && res.headers["x-github-media-type"];
      if (!previous || headers && headers.accept) {
        return headers;
      }
      headers = headers || {};
      headers.accept = "application/vnd." + previous.replace("; param=", ".").replace("; format=", "+");
      return headers;
    }
  }
});

// node_modules/octokit-pagination-methods/lib/get-first-page.js
var require_get_first_page = __commonJS({
  "node_modules/octokit-pagination-methods/lib/get-first-page.js"(exports2, module2) {
    module2.exports = getFirstPage;
    var getPage = require_get_page();
    function getFirstPage(octokit, link, headers) {
      return getPage(octokit, link, "first", headers);
    }
  }
});

// node_modules/octokit-pagination-methods/lib/get-last-page.js
var require_get_last_page = __commonJS({
  "node_modules/octokit-pagination-methods/lib/get-last-page.js"(exports2, module2) {
    module2.exports = getLastPage;
    var getPage = require_get_page();
    function getLastPage(octokit, link, headers) {
      return getPage(octokit, link, "last", headers);
    }
  }
});

// node_modules/octokit-pagination-methods/lib/get-next-page.js
var require_get_next_page = __commonJS({
  "node_modules/octokit-pagination-methods/lib/get-next-page.js"(exports2, module2) {
    module2.exports = getNextPage;
    var getPage = require_get_page();
    function getNextPage(octokit, link, headers) {
      return getPage(octokit, link, "next", headers);
    }
  }
});

// node_modules/octokit-pagination-methods/lib/get-previous-page.js
var require_get_previous_page = __commonJS({
  "node_modules/octokit-pagination-methods/lib/get-previous-page.js"(exports2, module2) {
    module2.exports = getPreviousPage;
    var getPage = require_get_page();
    function getPreviousPage(octokit, link, headers) {
      return getPage(octokit, link, "prev", headers);
    }
  }
});

// node_modules/octokit-pagination-methods/lib/has-first-page.js
var require_has_first_page = __commonJS({
  "node_modules/octokit-pagination-methods/lib/has-first-page.js"(exports2, module2) {
    module2.exports = hasFirstPage;
    var deprecate = require_deprecate();
    var getPageLinks = require_get_page_links();
    function hasFirstPage(link) {
      deprecate(`octokit.hasFirstPage() \u2013 You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
      return getPageLinks(link).first;
    }
  }
});

// node_modules/octokit-pagination-methods/lib/has-last-page.js
var require_has_last_page = __commonJS({
  "node_modules/octokit-pagination-methods/lib/has-last-page.js"(exports2, module2) {
    module2.exports = hasLastPage;
    var deprecate = require_deprecate();
    var getPageLinks = require_get_page_links();
    function hasLastPage(link) {
      deprecate(`octokit.hasLastPage() \u2013 You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
      return getPageLinks(link).last;
    }
  }
});

// node_modules/octokit-pagination-methods/lib/has-next-page.js
var require_has_next_page = __commonJS({
  "node_modules/octokit-pagination-methods/lib/has-next-page.js"(exports2, module2) {
    module2.exports = hasNextPage;
    var deprecate = require_deprecate();
    var getPageLinks = require_get_page_links();
    function hasNextPage(link) {
      deprecate(`octokit.hasNextPage() \u2013 You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
      return getPageLinks(link).next;
    }
  }
});

// node_modules/octokit-pagination-methods/lib/has-previous-page.js
var require_has_previous_page = __commonJS({
  "node_modules/octokit-pagination-methods/lib/has-previous-page.js"(exports2, module2) {
    module2.exports = hasPreviousPage;
    var deprecate = require_deprecate();
    var getPageLinks = require_get_page_links();
    function hasPreviousPage(link) {
      deprecate(`octokit.hasPreviousPage() \u2013 You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
      return getPageLinks(link).prev;
    }
  }
});

// node_modules/octokit-pagination-methods/index.js
var require_octokit_pagination_methods = __commonJS({
  "node_modules/octokit-pagination-methods/index.js"(exports2, module2) {
    module2.exports = paginationMethodsPlugin;
    function paginationMethodsPlugin(octokit) {
      octokit.getFirstPage = require_get_first_page().bind(null, octokit);
      octokit.getLastPage = require_get_last_page().bind(null, octokit);
      octokit.getNextPage = require_get_next_page().bind(null, octokit);
      octokit.getPreviousPage = require_get_previous_page().bind(null, octokit);
      octokit.hasFirstPage = require_has_first_page();
      octokit.hasLastPage = require_has_last_page();
      octokit.hasNextPage = require_has_next_page();
      octokit.hasPreviousPage = require_has_previous_page();
    }
  }
});

// node_modules/@octokit/rest/index.js
var require_rest = __commonJS({
  "node_modules/@octokit/rest/index.js"(exports2, module2) {
    var Octokit2 = require_core2();
    var CORE_PLUGINS = [
      require_log(),
      require_authentication_deprecated(),
      require_authentication(),
      require_pagination(),
      require_normalize_git_reference_responses(),
      require_register_endpoints2(),
      require_rest_api_endpoints(),
      require_validate3(),
      require_octokit_pagination_methods()
    ];
    module2.exports = Octokit2.plugin(CORE_PLUGINS);
  }
});

// node_modules/@actions/github/lib/context.js
var require_context = __commonJS({
  "node_modules/@actions/github/lib/context.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {value: true});
    var fs_1 = require("fs");
    var os_1 = require("os");
    var Context = class {
      constructor() {
        this.payload = {};
        if (process.env.GITHUB_EVENT_PATH) {
          if (fs_1.existsSync(process.env.GITHUB_EVENT_PATH)) {
            this.payload = JSON.parse(fs_1.readFileSync(process.env.GITHUB_EVENT_PATH, {encoding: "utf8"}));
          } else {
            process.stdout.write(`GITHUB_EVENT_PATH ${process.env.GITHUB_EVENT_PATH} does not exist${os_1.EOL}`);
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
        return Object.assign(Object.assign({}, this.repo), {number: (payload.issue || payload.pullRequest || payload).number});
      }
      get repo() {
        if (process.env.GITHUB_REPOSITORY) {
          const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
          return {owner, repo};
        }
        if (this.payload.repository) {
          return {
            owner: this.payload.repository.owner.login,
            repo: this.payload.repository.name
          };
        }
        throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
      }
    };
    exports2.Context = Context;
  }
});

// node_modules/@actions/github/lib/github.js
var require_github = __commonJS({
  "node_modules/@actions/github/lib/github.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : {"default": mod};
    };
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (Object.hasOwnProperty.call(mod, k))
            result[k] = mod[k];
      }
      result["default"] = mod;
      return result;
    };
    Object.defineProperty(exports2, "__esModule", {value: true});
    var graphql_1 = require_graphql2();
    var rest_1 = __importDefault(require_rest());
    var Context = __importStar(require_context());
    rest_1.default.prototype = new rest_1.default();
    exports2.context = new Context.Context();
    var GitHub = class extends rest_1.default {
      constructor(token, opts = {}) {
        super(Object.assign(Object.assign({}, opts), {auth: `token ${token}`}));
        this.graphql = graphql_1.defaults({
          headers: {authorization: `token ${token}`}
        });
      }
    };
    exports2.GitHub = GitHub;
  }
});

// node_modules/yallist/iterator.js
var require_iterator2 = __commonJS({
  "node_modules/yallist/iterator.js"(exports2, module2) {
    "use strict";
    module2.exports = function(Yallist) {
      Yallist.prototype[Symbol.iterator] = function* () {
        for (let walker = this.head; walker; walker = walker.next) {
          yield walker.value;
        }
      };
    };
  }
});

// node_modules/yallist/yallist.js
var require_yallist = __commonJS({
  "node_modules/yallist/yallist.js"(exports2, module2) {
    "use strict";
    module2.exports = Yallist;
    Yallist.Node = Node;
    Yallist.create = Yallist;
    function Yallist(list) {
      var self2 = this;
      if (!(self2 instanceof Yallist)) {
        self2 = new Yallist();
      }
      self2.tail = null;
      self2.head = null;
      self2.length = 0;
      if (list && typeof list.forEach === "function") {
        list.forEach(function(item) {
          self2.push(item);
        });
      } else if (arguments.length > 0) {
        for (var i = 0, l = arguments.length; i < l; i++) {
          self2.push(arguments[i]);
        }
      }
      return self2;
    }
    Yallist.prototype.removeNode = function(node) {
      if (node.list !== this) {
        throw new Error("removing node which does not belong to this list");
      }
      var next = node.next;
      var prev = node.prev;
      if (next) {
        next.prev = prev;
      }
      if (prev) {
        prev.next = next;
      }
      if (node === this.head) {
        this.head = next;
      }
      if (node === this.tail) {
        this.tail = prev;
      }
      node.list.length--;
      node.next = null;
      node.prev = null;
      node.list = null;
    };
    Yallist.prototype.unshiftNode = function(node) {
      if (node === this.head) {
        return;
      }
      if (node.list) {
        node.list.removeNode(node);
      }
      var head = this.head;
      node.list = this;
      node.next = head;
      if (head) {
        head.prev = node;
      }
      this.head = node;
      if (!this.tail) {
        this.tail = node;
      }
      this.length++;
    };
    Yallist.prototype.pushNode = function(node) {
      if (node === this.tail) {
        return;
      }
      if (node.list) {
        node.list.removeNode(node);
      }
      var tail = this.tail;
      node.list = this;
      node.prev = tail;
      if (tail) {
        tail.next = node;
      }
      this.tail = node;
      if (!this.head) {
        this.head = node;
      }
      this.length++;
    };
    Yallist.prototype.push = function() {
      for (var i = 0, l = arguments.length; i < l; i++) {
        push(this, arguments[i]);
      }
      return this.length;
    };
    Yallist.prototype.unshift = function() {
      for (var i = 0, l = arguments.length; i < l; i++) {
        unshift(this, arguments[i]);
      }
      return this.length;
    };
    Yallist.prototype.pop = function() {
      if (!this.tail) {
        return void 0;
      }
      var res = this.tail.value;
      this.tail = this.tail.prev;
      if (this.tail) {
        this.tail.next = null;
      } else {
        this.head = null;
      }
      this.length--;
      return res;
    };
    Yallist.prototype.shift = function() {
      if (!this.head) {
        return void 0;
      }
      var res = this.head.value;
      this.head = this.head.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
      this.length--;
      return res;
    };
    Yallist.prototype.forEach = function(fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.head, i = 0; walker !== null; i++) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.next;
      }
    };
    Yallist.prototype.forEachReverse = function(fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.prev;
      }
    };
    Yallist.prototype.get = function(n) {
      for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
        walker = walker.next;
      }
      if (i === n && walker !== null) {
        return walker.value;
      }
    };
    Yallist.prototype.getReverse = function(n) {
      for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
        walker = walker.prev;
      }
      if (i === n && walker !== null) {
        return walker.value;
      }
    };
    Yallist.prototype.map = function(fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.head; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.next;
      }
      return res;
    };
    Yallist.prototype.mapReverse = function(fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.tail; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.prev;
      }
      return res;
    };
    Yallist.prototype.reduce = function(fn, initial) {
      var acc;
      var walker = this.head;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.head) {
        walker = this.head.next;
        acc = this.head.value;
      } else {
        throw new TypeError("Reduce of empty list with no initial value");
      }
      for (var i = 0; walker !== null; i++) {
        acc = fn(acc, walker.value, i);
        walker = walker.next;
      }
      return acc;
    };
    Yallist.prototype.reduceReverse = function(fn, initial) {
      var acc;
      var walker = this.tail;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.tail) {
        walker = this.tail.prev;
        acc = this.tail.value;
      } else {
        throw new TypeError("Reduce of empty list with no initial value");
      }
      for (var i = this.length - 1; walker !== null; i--) {
        acc = fn(acc, walker.value, i);
        walker = walker.prev;
      }
      return acc;
    };
    Yallist.prototype.toArray = function() {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.head; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.next;
      }
      return arr;
    };
    Yallist.prototype.toArrayReverse = function() {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.tail; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.prev;
      }
      return arr;
    };
    Yallist.prototype.slice = function(from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret;
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
        walker = walker.next;
      }
      for (; walker !== null && i < to; i++, walker = walker.next) {
        ret.push(walker.value);
      }
      return ret;
    };
    Yallist.prototype.sliceReverse = function(from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret;
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
        walker = walker.prev;
      }
      for (; walker !== null && i > from; i--, walker = walker.prev) {
        ret.push(walker.value);
      }
      return ret;
    };
    Yallist.prototype.reverse = function() {
      var head = this.head;
      var tail = this.tail;
      for (var walker = head; walker !== null; walker = walker.prev) {
        var p = walker.prev;
        walker.prev = walker.next;
        walker.next = p;
      }
      this.head = tail;
      this.tail = head;
      return this;
    };
    function push(self2, item) {
      self2.tail = new Node(item, self2.tail, null, self2);
      if (!self2.head) {
        self2.head = self2.tail;
      }
      self2.length++;
    }
    function unshift(self2, item) {
      self2.head = new Node(item, null, self2.head, self2);
      if (!self2.tail) {
        self2.tail = self2.head;
      }
      self2.length++;
    }
    function Node(value, prev, next, list) {
      if (!(this instanceof Node)) {
        return new Node(value, prev, next, list);
      }
      this.list = list;
      this.value = value;
      if (prev) {
        prev.next = this;
        this.prev = prev;
      } else {
        this.prev = null;
      }
      if (next) {
        next.prev = this;
        this.next = next;
      } else {
        this.next = null;
      }
    }
    try {
      require_iterator2()(Yallist);
    } catch (er) {
    }
  }
});

// node_modules/lru-cache/index.js
var require_lru_cache = __commonJS({
  "node_modules/lru-cache/index.js"(exports2, module2) {
    "use strict";
    var Yallist = require_yallist();
    var MAX = Symbol("max");
    var LENGTH = Symbol("length");
    var LENGTH_CALCULATOR = Symbol("lengthCalculator");
    var ALLOW_STALE = Symbol("allowStale");
    var MAX_AGE = Symbol("maxAge");
    var DISPOSE = Symbol("dispose");
    var NO_DISPOSE_ON_SET = Symbol("noDisposeOnSet");
    var LRU_LIST = Symbol("lruList");
    var CACHE = Symbol("cache");
    var UPDATE_AGE_ON_GET = Symbol("updateAgeOnGet");
    var naiveLength = () => 1;
    var LRUCache = class {
      constructor(options) {
        if (typeof options === "number")
          options = {max: options};
        if (!options)
          options = {};
        if (options.max && (typeof options.max !== "number" || options.max < 0))
          throw new TypeError("max must be a non-negative number");
        const max = this[MAX] = options.max || Infinity;
        const lc = options.length || naiveLength;
        this[LENGTH_CALCULATOR] = typeof lc !== "function" ? naiveLength : lc;
        this[ALLOW_STALE] = options.stale || false;
        if (options.maxAge && typeof options.maxAge !== "number")
          throw new TypeError("maxAge must be a number");
        this[MAX_AGE] = options.maxAge || 0;
        this[DISPOSE] = options.dispose;
        this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
        this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
        this.reset();
      }
      set max(mL) {
        if (typeof mL !== "number" || mL < 0)
          throw new TypeError("max must be a non-negative number");
        this[MAX] = mL || Infinity;
        trim(this);
      }
      get max() {
        return this[MAX];
      }
      set allowStale(allowStale) {
        this[ALLOW_STALE] = !!allowStale;
      }
      get allowStale() {
        return this[ALLOW_STALE];
      }
      set maxAge(mA) {
        if (typeof mA !== "number")
          throw new TypeError("maxAge must be a non-negative number");
        this[MAX_AGE] = mA;
        trim(this);
      }
      get maxAge() {
        return this[MAX_AGE];
      }
      set lengthCalculator(lC) {
        if (typeof lC !== "function")
          lC = naiveLength;
        if (lC !== this[LENGTH_CALCULATOR]) {
          this[LENGTH_CALCULATOR] = lC;
          this[LENGTH] = 0;
          this[LRU_LIST].forEach((hit) => {
            hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
            this[LENGTH] += hit.length;
          });
        }
        trim(this);
      }
      get lengthCalculator() {
        return this[LENGTH_CALCULATOR];
      }
      get length() {
        return this[LENGTH];
      }
      get itemCount() {
        return this[LRU_LIST].length;
      }
      rforEach(fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].tail; walker !== null; ) {
          const prev = walker.prev;
          forEachStep(this, fn, walker, thisp);
          walker = prev;
        }
      }
      forEach(fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].head; walker !== null; ) {
          const next = walker.next;
          forEachStep(this, fn, walker, thisp);
          walker = next;
        }
      }
      keys() {
        return this[LRU_LIST].toArray().map((k) => k.key);
      }
      values() {
        return this[LRU_LIST].toArray().map((k) => k.value);
      }
      reset() {
        if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
          this[LRU_LIST].forEach((hit) => this[DISPOSE](hit.key, hit.value));
        }
        this[CACHE] = new Map();
        this[LRU_LIST] = new Yallist();
        this[LENGTH] = 0;
      }
      dump() {
        return this[LRU_LIST].map((hit) => isStale(this, hit) ? false : {
          k: hit.key,
          v: hit.value,
          e: hit.now + (hit.maxAge || 0)
        }).toArray().filter((h) => h);
      }
      dumpLru() {
        return this[LRU_LIST];
      }
      set(key, value, maxAge) {
        maxAge = maxAge || this[MAX_AGE];
        if (maxAge && typeof maxAge !== "number")
          throw new TypeError("maxAge must be a number");
        const now = maxAge ? Date.now() : 0;
        const len = this[LENGTH_CALCULATOR](value, key);
        if (this[CACHE].has(key)) {
          if (len > this[MAX]) {
            del(this, this[CACHE].get(key));
            return false;
          }
          const node = this[CACHE].get(key);
          const item = node.value;
          if (this[DISPOSE]) {
            if (!this[NO_DISPOSE_ON_SET])
              this[DISPOSE](key, item.value);
          }
          item.now = now;
          item.maxAge = maxAge;
          item.value = value;
          this[LENGTH] += len - item.length;
          item.length = len;
          this.get(key);
          trim(this);
          return true;
        }
        const hit = new Entry(key, value, len, now, maxAge);
        if (hit.length > this[MAX]) {
          if (this[DISPOSE])
            this[DISPOSE](key, value);
          return false;
        }
        this[LENGTH] += hit.length;
        this[LRU_LIST].unshift(hit);
        this[CACHE].set(key, this[LRU_LIST].head);
        trim(this);
        return true;
      }
      has(key) {
        if (!this[CACHE].has(key))
          return false;
        const hit = this[CACHE].get(key).value;
        return !isStale(this, hit);
      }
      get(key) {
        return get(this, key, true);
      }
      peek(key) {
        return get(this, key, false);
      }
      pop() {
        const node = this[LRU_LIST].tail;
        if (!node)
          return null;
        del(this, node);
        return node.value;
      }
      del(key) {
        del(this, this[CACHE].get(key));
      }
      load(arr) {
        this.reset();
        const now = Date.now();
        for (let l = arr.length - 1; l >= 0; l--) {
          const hit = arr[l];
          const expiresAt = hit.e || 0;
          if (expiresAt === 0)
            this.set(hit.k, hit.v);
          else {
            const maxAge = expiresAt - now;
            if (maxAge > 0) {
              this.set(hit.k, hit.v, maxAge);
            }
          }
        }
      }
      prune() {
        this[CACHE].forEach((value, key) => get(this, key, false));
      }
    };
    var get = (self2, key, doUse) => {
      const node = self2[CACHE].get(key);
      if (node) {
        const hit = node.value;
        if (isStale(self2, hit)) {
          del(self2, node);
          if (!self2[ALLOW_STALE])
            return void 0;
        } else {
          if (doUse) {
            if (self2[UPDATE_AGE_ON_GET])
              node.value.now = Date.now();
            self2[LRU_LIST].unshiftNode(node);
          }
        }
        return hit.value;
      }
    };
    var isStale = (self2, hit) => {
      if (!hit || !hit.maxAge && !self2[MAX_AGE])
        return false;
      const diff = Date.now() - hit.now;
      return hit.maxAge ? diff > hit.maxAge : self2[MAX_AGE] && diff > self2[MAX_AGE];
    };
    var trim = (self2) => {
      if (self2[LENGTH] > self2[MAX]) {
        for (let walker = self2[LRU_LIST].tail; self2[LENGTH] > self2[MAX] && walker !== null; ) {
          const prev = walker.prev;
          del(self2, walker);
          walker = prev;
        }
      }
    };
    var del = (self2, node) => {
      if (node) {
        const hit = node.value;
        if (self2[DISPOSE])
          self2[DISPOSE](hit.key, hit.value);
        self2[LENGTH] -= hit.length;
        self2[CACHE].delete(hit.key);
        self2[LRU_LIST].removeNode(node);
      }
    };
    var Entry = class {
      constructor(key, value, length, now, maxAge) {
        this.key = key;
        this.value = value;
        this.length = length;
        this.now = now;
        this.maxAge = maxAge || 0;
      }
    };
    var forEachStep = (self2, fn, node, thisp) => {
      let hit = node.value;
      if (isStale(self2, hit)) {
        del(self2, node);
        if (!self2[ALLOW_STALE])
          hit = void 0;
      }
      if (hit)
        fn.call(thisp, hit.value, hit.key, self2);
    };
    module2.exports = LRUCache;
  }
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports2, module2) {
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports2);
      exports2.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/jws/lib/data-stream.js
var require_data_stream = __commonJS({
  "node_modules/jws/lib/data-stream.js"(exports2, module2) {
    var Buffer2 = require_safe_buffer().Buffer;
    var Stream = require("stream");
    var util = require("util");
    function DataStream(data) {
      this.buffer = null;
      this.writable = true;
      this.readable = true;
      if (!data) {
        this.buffer = Buffer2.alloc(0);
        return this;
      }
      if (typeof data.pipe === "function") {
        this.buffer = Buffer2.alloc(0);
        data.pipe(this);
        return this;
      }
      if (data.length || typeof data === "object") {
        this.buffer = data;
        this.writable = false;
        process.nextTick(function() {
          this.emit("end", data);
          this.readable = false;
          this.emit("close");
        }.bind(this));
        return this;
      }
      throw new TypeError("Unexpected data type (" + typeof data + ")");
    }
    util.inherits(DataStream, Stream);
    DataStream.prototype.write = function write(data) {
      this.buffer = Buffer2.concat([this.buffer, Buffer2.from(data)]);
      this.emit("data", data);
    };
    DataStream.prototype.end = function end(data) {
      if (data)
        this.write(data);
      this.emit("end", data);
      this.emit("close");
      this.writable = false;
      this.readable = false;
    };
    module2.exports = DataStream;
  }
});

// node_modules/buffer-equal-constant-time/index.js
var require_buffer_equal_constant_time = __commonJS({
  "node_modules/buffer-equal-constant-time/index.js"(exports2, module2) {
    "use strict";
    var Buffer2 = require("buffer").Buffer;
    var SlowBuffer = require("buffer").SlowBuffer;
    module2.exports = bufferEq;
    function bufferEq(a, b) {
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
        return false;
      }
      if (a.length !== b.length) {
        return false;
      }
      var c = 0;
      for (var i = 0; i < a.length; i++) {
        c |= a[i] ^ b[i];
      }
      return c === 0;
    }
    bufferEq.install = function() {
      Buffer2.prototype.equal = SlowBuffer.prototype.equal = function equal(that) {
        return bufferEq(this, that);
      };
    };
    var origBufEqual = Buffer2.prototype.equal;
    var origSlowBufEqual = SlowBuffer.prototype.equal;
    bufferEq.restore = function() {
      Buffer2.prototype.equal = origBufEqual;
      SlowBuffer.prototype.equal = origSlowBufEqual;
    };
  }
});

// node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js
var require_param_bytes_for_alg = __commonJS({
  "node_modules/ecdsa-sig-formatter/src/param-bytes-for-alg.js"(exports2, module2) {
    "use strict";
    function getParamSize(keySize) {
      var result = (keySize / 8 | 0) + (keySize % 8 === 0 ? 0 : 1);
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
    module2.exports = getParamBytesForAlg;
  }
});

// node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.js
var require_ecdsa_sig_formatter = __commonJS({
  "node_modules/ecdsa-sig-formatter/src/ecdsa-sig-formatter.js"(exports2, module2) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var getParamBytesForAlg = require_param_bytes_for_alg();
    var MAX_OCTET = 128;
    var CLASS_UNIVERSAL = 0;
    var PRIMITIVE_BIT = 32;
    var TAG_SEQ = 16;
    var TAG_INT = 2;
    var ENCODED_TAG_SEQ = TAG_SEQ | PRIMITIVE_BIT | CLASS_UNIVERSAL << 6;
    var ENCODED_TAG_INT = TAG_INT | CLASS_UNIVERSAL << 6;
    function base64Url(base64) {
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function signatureAsBuffer(signature) {
      if (Buffer2.isBuffer(signature)) {
        return signature;
      } else if (typeof signature === "string") {
        return Buffer2.from(signature, "base64");
      }
      throw new TypeError("ECDSA signature must be a Base64 string or a Buffer");
    }
    function derToJose(signature, alg) {
      signature = signatureAsBuffer(signature);
      var paramBytes = getParamBytesForAlg(alg);
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
      var rPadding = paramBytes - rLength, sPadding = paramBytes - sLength;
      var dst = Buffer2.allocUnsafe(rPadding + rLength + sPadding + sLength);
      for (offset = 0; offset < rPadding; ++offset) {
        dst[offset] = 0;
      }
      signature.copy(dst, offset, rOffset + Math.max(-rPadding, 0), rOffset + rLength);
      offset = paramBytes;
      for (var o = offset; offset < o + sPadding; ++offset) {
        dst[offset] = 0;
      }
      signature.copy(dst, offset, sOffset + Math.max(-sPadding, 0), sOffset + sLength);
      dst = dst.toString("base64");
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
      var paramBytes = getParamBytesForAlg(alg);
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
      var dst = Buffer2.allocUnsafe((shortLength ? 2 : 3) + rsBytes);
      var offset = 0;
      dst[offset++] = ENCODED_TAG_SEQ;
      if (shortLength) {
        dst[offset++] = rsBytes;
      } else {
        dst[offset++] = MAX_OCTET | 1;
        dst[offset++] = rsBytes & 255;
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
    module2.exports = {
      derToJose,
      joseToDer
    };
  }
});

// node_modules/jwa/index.js
var require_jwa = __commonJS({
  "node_modules/jwa/index.js"(exports2, module2) {
    var bufferEqual = require_buffer_equal_constant_time();
    var Buffer2 = require_safe_buffer().Buffer;
    var crypto = require("crypto");
    var formatEcdsa = require_ecdsa_sig_formatter();
    var util = require("util");
    var MSG_INVALID_ALGORITHM = '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".';
    var MSG_INVALID_SECRET = "secret must be a string or buffer";
    var MSG_INVALID_VERIFIER_KEY = "key must be a string or a buffer";
    var MSG_INVALID_SIGNER_KEY = "key must be a string, a buffer or an object";
    var supportsKeyObjects = typeof crypto.createPublicKey === "function";
    if (supportsKeyObjects) {
      MSG_INVALID_VERIFIER_KEY += " or a KeyObject";
      MSG_INVALID_SECRET += "or a KeyObject";
    }
    function checkIsPublicKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return;
      }
      if (!supportsKeyObjects) {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key !== "object") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.type !== "string") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.asymmetricKeyType !== "string") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
      if (typeof key.export !== "function") {
        throw typeError(MSG_INVALID_VERIFIER_KEY);
      }
    }
    function checkIsPrivateKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return;
      }
      if (typeof key === "object") {
        return;
      }
      throw typeError(MSG_INVALID_SIGNER_KEY);
    }
    function checkIsSecretKey(key) {
      if (Buffer2.isBuffer(key)) {
        return;
      }
      if (typeof key === "string") {
        return key;
      }
      if (!supportsKeyObjects) {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (typeof key !== "object") {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (key.type !== "secret") {
        throw typeError(MSG_INVALID_SECRET);
      }
      if (typeof key.export !== "function") {
        throw typeError(MSG_INVALID_SECRET);
      }
    }
    function fromBase64(base64) {
      return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function toBase64(base64url) {
      base64url = base64url.toString();
      var padding = 4 - base64url.length % 4;
      if (padding !== 4) {
        for (var i = 0; i < padding; ++i) {
          base64url += "=";
        }
      }
      return base64url.replace(/\-/g, "+").replace(/_/g, "/");
    }
    function typeError(template) {
      var args = [].slice.call(arguments, 1);
      var errMsg = util.format.bind(util, template).apply(null, args);
      return new TypeError(errMsg);
    }
    function bufferOrString(obj) {
      return Buffer2.isBuffer(obj) || typeof obj === "string";
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
        var hmac = crypto.createHmac("sha" + bits, secret);
        var sig = (hmac.update(thing), hmac.digest("base64"));
        return fromBase64(sig);
      };
    }
    function createHmacVerifier(bits) {
      return function verify(thing, signature, secret) {
        var computedSig = createHmacSigner(bits)(thing, secret);
        return bufferEqual(Buffer2.from(signature), Buffer2.from(computedSig));
      };
    }
    function createKeySigner(bits) {
      return function sign(thing, privateKey) {
        checkIsPrivateKey(privateKey);
        thing = normalizeInput(thing);
        var signer = crypto.createSign("RSA-SHA" + bits);
        var sig = (signer.update(thing), signer.sign(privateKey, "base64"));
        return fromBase64(sig);
      };
    }
    function createKeyVerifier(bits) {
      return function verify(thing, signature, publicKey) {
        checkIsPublicKey(publicKey);
        thing = normalizeInput(thing);
        signature = toBase64(signature);
        var verifier = crypto.createVerify("RSA-SHA" + bits);
        verifier.update(thing);
        return verifier.verify(publicKey, signature, "base64");
      };
    }
    function createPSSKeySigner(bits) {
      return function sign(thing, privateKey) {
        checkIsPrivateKey(privateKey);
        thing = normalizeInput(thing);
        var signer = crypto.createSign("RSA-SHA" + bits);
        var sig = (signer.update(thing), signer.sign({
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
        }, "base64"));
        return fromBase64(sig);
      };
    }
    function createPSSKeyVerifier(bits) {
      return function verify(thing, signature, publicKey) {
        checkIsPublicKey(publicKey);
        thing = normalizeInput(thing);
        signature = toBase64(signature);
        var verifier = crypto.createVerify("RSA-SHA" + bits);
        verifier.update(thing);
        return verifier.verify({
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
        }, signature, "base64");
      };
    }
    function createECDSASigner(bits) {
      var inner = createKeySigner(bits);
      return function sign() {
        var signature = inner.apply(null, arguments);
        signature = formatEcdsa.derToJose(signature, "ES" + bits);
        return signature;
      };
    }
    function createECDSAVerifer(bits) {
      var inner = createKeyVerifier(bits);
      return function verify(thing, signature, publicKey) {
        signature = formatEcdsa.joseToDer(signature, "ES" + bits).toString("base64");
        var result = inner(thing, signature, publicKey);
        return result;
      };
    }
    function createNoneSigner() {
      return function sign() {
        return "";
      };
    }
    function createNoneVerifier() {
      return function verify(thing, signature) {
        return signature === "";
      };
    }
    module2.exports = function jwa(algorithm) {
      var signerFactories = {
        hs: createHmacSigner,
        rs: createKeySigner,
        ps: createPSSKeySigner,
        es: createECDSASigner,
        none: createNoneSigner
      };
      var verifierFactories = {
        hs: createHmacVerifier,
        rs: createKeyVerifier,
        ps: createPSSKeyVerifier,
        es: createECDSAVerifer,
        none: createNoneVerifier
      };
      var match = algorithm.match(/^(RS|PS|ES|HS)(256|384|512)$|^(none)$/i);
      if (!match)
        throw typeError(MSG_INVALID_ALGORITHM, algorithm);
      var algo = (match[1] || match[3]).toLowerCase();
      var bits = match[2];
      return {
        sign: signerFactories[algo](bits),
        verify: verifierFactories[algo](bits)
      };
    };
  }
});

// node_modules/jws/lib/tostring.js
var require_tostring = __commonJS({
  "node_modules/jws/lib/tostring.js"(exports2, module2) {
    var Buffer2 = require("buffer").Buffer;
    module2.exports = function toString(obj) {
      if (typeof obj === "string")
        return obj;
      if (typeof obj === "number" || Buffer2.isBuffer(obj))
        return obj.toString();
      return JSON.stringify(obj);
    };
  }
});

// node_modules/jws/lib/sign-stream.js
var require_sign_stream = __commonJS({
  "node_modules/jws/lib/sign-stream.js"(exports2, module2) {
    var Buffer2 = require_safe_buffer().Buffer;
    var DataStream = require_data_stream();
    var jwa = require_jwa();
    var Stream = require("stream");
    var toString = require_tostring();
    var util = require("util");
    function base64url(string, encoding) {
      return Buffer2.from(string, encoding).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function jwsSecuredInput(header, payload, encoding) {
      encoding = encoding || "utf8";
      var encodedHeader = base64url(toString(header), "binary");
      var encodedPayload = base64url(toString(payload), encoding);
      return util.format("%s.%s", encodedHeader, encodedPayload);
    }
    function jwsSign(opts) {
      var header = opts.header;
      var payload = opts.payload;
      var secretOrKey = opts.secret || opts.privateKey;
      var encoding = opts.encoding;
      var algo = jwa(header.alg);
      var securedInput = jwsSecuredInput(header, payload, encoding);
      var signature = algo.sign(securedInput, secretOrKey);
      return util.format("%s.%s", securedInput, signature);
    }
    function SignStream(opts) {
      var secret = opts.secret || opts.privateKey || opts.key;
      var secretStream = new DataStream(secret);
      this.readable = true;
      this.header = opts.header;
      this.encoding = opts.encoding;
      this.secret = this.privateKey = this.key = secretStream;
      this.payload = new DataStream(opts.payload);
      this.secret.once("close", function() {
        if (!this.payload.writable && this.readable)
          this.sign();
      }.bind(this));
      this.payload.once("close", function() {
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
        this.emit("done", signature);
        this.emit("data", signature);
        this.emit("end");
        this.readable = false;
        return signature;
      } catch (e) {
        this.readable = false;
        this.emit("error", e);
        this.emit("close");
      }
    };
    SignStream.sign = jwsSign;
    module2.exports = SignStream;
  }
});

// node_modules/jws/lib/verify-stream.js
var require_verify_stream = __commonJS({
  "node_modules/jws/lib/verify-stream.js"(exports2, module2) {
    var Buffer2 = require_safe_buffer().Buffer;
    var DataStream = require_data_stream();
    var jwa = require_jwa();
    var Stream = require("stream");
    var toString = require_tostring();
    var util = require("util");
    var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
    function isObject(thing) {
      return Object.prototype.toString.call(thing) === "[object Object]";
    }
    function safeJsonParse(thing) {
      if (isObject(thing))
        return thing;
      try {
        return JSON.parse(thing);
      } catch (e) {
        return void 0;
      }
    }
    function headerFromJWS(jwsSig) {
      var encodedHeader = jwsSig.split(".", 1)[0];
      return safeJsonParse(Buffer2.from(encodedHeader, "base64").toString("binary"));
    }
    function securedInputFromJWS(jwsSig) {
      return jwsSig.split(".", 2).join(".");
    }
    function signatureFromJWS(jwsSig) {
      return jwsSig.split(".")[2];
    }
    function payloadFromJWS(jwsSig, encoding) {
      encoding = encoding || "utf8";
      var payload = jwsSig.split(".")[1];
      return Buffer2.from(payload, "base64").toString(encoding);
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
      jwsSig = toString(jwsSig);
      var signature = signatureFromJWS(jwsSig);
      var securedInput = securedInputFromJWS(jwsSig);
      var algo = jwa(algorithm);
      return algo.verify(securedInput, signature, secretOrKey);
    }
    function jwsDecode(jwsSig, opts) {
      opts = opts || {};
      jwsSig = toString(jwsSig);
      if (!isValidJws(jwsSig))
        return null;
      var header = headerFromJWS(jwsSig);
      if (!header)
        return null;
      var payload = payloadFromJWS(jwsSig);
      if (header.typ === "JWT" || opts.json)
        payload = JSON.parse(payload, opts.encoding);
      return {
        header,
        payload,
        signature: signatureFromJWS(jwsSig)
      };
    }
    function VerifyStream(opts) {
      opts = opts || {};
      var secretOrKey = opts.secret || opts.publicKey || opts.key;
      var secretStream = new DataStream(secretOrKey);
      this.readable = true;
      this.algorithm = opts.algorithm;
      this.encoding = opts.encoding;
      this.secret = this.publicKey = this.key = secretStream;
      this.signature = new DataStream(opts.signature);
      this.secret.once("close", function() {
        if (!this.signature.writable && this.readable)
          this.verify();
      }.bind(this));
      this.signature.once("close", function() {
        if (!this.secret.writable && this.readable)
          this.verify();
      }.bind(this));
    }
    util.inherits(VerifyStream, Stream);
    VerifyStream.prototype.verify = function verify() {
      try {
        var valid = jwsVerify(this.signature.buffer, this.algorithm, this.key.buffer);
        var obj = jwsDecode(this.signature.buffer, this.encoding);
        this.emit("done", valid, obj);
        this.emit("data", valid);
        this.emit("end");
        this.readable = false;
        return valid;
      } catch (e) {
        this.readable = false;
        this.emit("error", e);
        this.emit("close");
      }
    };
    VerifyStream.decode = jwsDecode;
    VerifyStream.isValid = isValidJws;
    VerifyStream.verify = jwsVerify;
    module2.exports = VerifyStream;
  }
});

// node_modules/jws/index.js
var require_jws = __commonJS({
  "node_modules/jws/index.js"(exports2) {
    var SignStream = require_sign_stream();
    var VerifyStream = require_verify_stream();
    var ALGORITHMS = [
      "HS256",
      "HS384",
      "HS512",
      "RS256",
      "RS384",
      "RS512",
      "PS256",
      "PS384",
      "PS512",
      "ES256",
      "ES384",
      "ES512"
    ];
    exports2.ALGORITHMS = ALGORITHMS;
    exports2.sign = SignStream.sign;
    exports2.verify = VerifyStream.verify;
    exports2.decode = VerifyStream.decode;
    exports2.isValid = VerifyStream.isValid;
    exports2.createSign = function createSign(opts) {
      return new SignStream(opts);
    };
    exports2.createVerify = function createVerify(opts) {
      return new VerifyStream(opts);
    };
  }
});

// node_modules/jsonwebtoken/decode.js
var require_decode = __commonJS({
  "node_modules/jsonwebtoken/decode.js"(exports2, module2) {
    var jws = require_jws();
    module2.exports = function(jwt, options) {
      options = options || {};
      var decoded = jws.decode(jwt, options);
      if (!decoded) {
        return null;
      }
      var payload = decoded.payload;
      if (typeof payload === "string") {
        try {
          var obj = JSON.parse(payload);
          if (obj !== null && typeof obj === "object") {
            payload = obj;
          }
        } catch (e) {
        }
      }
      if (options.complete === true) {
        return {
          header: decoded.header,
          payload,
          signature: decoded.signature
        };
      }
      return payload;
    };
  }
});

// node_modules/jsonwebtoken/lib/JsonWebTokenError.js
var require_JsonWebTokenError = __commonJS({
  "node_modules/jsonwebtoken/lib/JsonWebTokenError.js"(exports2, module2) {
    var JsonWebTokenError = function(message, error2) {
      Error.call(this, message);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
      this.name = "JsonWebTokenError";
      this.message = message;
      if (error2)
        this.inner = error2;
    };
    JsonWebTokenError.prototype = Object.create(Error.prototype);
    JsonWebTokenError.prototype.constructor = JsonWebTokenError;
    module2.exports = JsonWebTokenError;
  }
});

// node_modules/jsonwebtoken/lib/NotBeforeError.js
var require_NotBeforeError = __commonJS({
  "node_modules/jsonwebtoken/lib/NotBeforeError.js"(exports2, module2) {
    var JsonWebTokenError = require_JsonWebTokenError();
    var NotBeforeError = function(message, date) {
      JsonWebTokenError.call(this, message);
      this.name = "NotBeforeError";
      this.date = date;
    };
    NotBeforeError.prototype = Object.create(JsonWebTokenError.prototype);
    NotBeforeError.prototype.constructor = NotBeforeError;
    module2.exports = NotBeforeError;
  }
});

// node_modules/jsonwebtoken/lib/TokenExpiredError.js
var require_TokenExpiredError = __commonJS({
  "node_modules/jsonwebtoken/lib/TokenExpiredError.js"(exports2, module2) {
    var JsonWebTokenError = require_JsonWebTokenError();
    var TokenExpiredError = function(message, expiredAt) {
      JsonWebTokenError.call(this, message);
      this.name = "TokenExpiredError";
      this.expiredAt = expiredAt;
    };
    TokenExpiredError.prototype = Object.create(JsonWebTokenError.prototype);
    TokenExpiredError.prototype.constructor = TokenExpiredError;
    module2.exports = TokenExpiredError;
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports2, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/jsonwebtoken/lib/timespan.js
var require_timespan = __commonJS({
  "node_modules/jsonwebtoken/lib/timespan.js"(exports2, module2) {
    var ms = require_ms();
    module2.exports = function(time, iat) {
      var timestamp = iat || Math.floor(Date.now() / 1e3);
      if (typeof time === "string") {
        var milliseconds = ms(time);
        if (typeof milliseconds === "undefined") {
          return;
        }
        return Math.floor(timestamp + milliseconds / 1e3);
      } else if (typeof time === "number") {
        return timestamp + time;
      } else {
        return;
      }
    };
  }
});

// node_modules/jsonwebtoken/lib/psSupported.js
var require_psSupported = __commonJS({
  "node_modules/jsonwebtoken/lib/psSupported.js"(exports2, module2) {
    var semver = require_semver();
    module2.exports = semver.satisfies(process.version, "^6.12.0 || >=8.0.0");
  }
});

// node_modules/jsonwebtoken/verify.js
var require_verify = __commonJS({
  "node_modules/jsonwebtoken/verify.js"(exports2, module2) {
    var JsonWebTokenError = require_JsonWebTokenError();
    var NotBeforeError = require_NotBeforeError();
    var TokenExpiredError = require_TokenExpiredError();
    var decode = require_decode();
    var timespan = require_timespan();
    var PS_SUPPORTED = require_psSupported();
    var jws = require_jws();
    var PUB_KEY_ALGS = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512"];
    var RSA_KEY_ALGS = ["RS256", "RS384", "RS512"];
    var HS_ALGS = ["HS256", "HS384", "HS512"];
    if (PS_SUPPORTED) {
      PUB_KEY_ALGS.splice(3, 0, "PS256", "PS384", "PS512");
      RSA_KEY_ALGS.splice(3, 0, "PS256", "PS384", "PS512");
    }
    module2.exports = function(jwtString, secretOrPublicKey, options, callback) {
      if (typeof options === "function" && !callback) {
        callback = options;
        options = {};
      }
      if (!options) {
        options = {};
      }
      options = Object.assign({}, options);
      var done;
      if (callback) {
        done = callback;
      } else {
        done = function(err, data) {
          if (err)
            throw err;
          return data;
        };
      }
      if (options.clockTimestamp && typeof options.clockTimestamp !== "number") {
        return done(new JsonWebTokenError("clockTimestamp must be a number"));
      }
      if (options.nonce !== void 0 && (typeof options.nonce !== "string" || options.nonce.trim() === "")) {
        return done(new JsonWebTokenError("nonce must be a non-empty string"));
      }
      var clockTimestamp = options.clockTimestamp || Math.floor(Date.now() / 1e3);
      if (!jwtString) {
        return done(new JsonWebTokenError("jwt must be provided"));
      }
      if (typeof jwtString !== "string") {
        return done(new JsonWebTokenError("jwt must be a string"));
      }
      var parts = jwtString.split(".");
      if (parts.length !== 3) {
        return done(new JsonWebTokenError("jwt malformed"));
      }
      var decodedToken;
      try {
        decodedToken = decode(jwtString, {complete: true});
      } catch (err) {
        return done(err);
      }
      if (!decodedToken) {
        return done(new JsonWebTokenError("invalid token"));
      }
      var header = decodedToken.header;
      var getSecret;
      if (typeof secretOrPublicKey === "function") {
        if (!callback) {
          return done(new JsonWebTokenError("verify must be called asynchronous if secret or public key is provided as a callback"));
        }
        getSecret = secretOrPublicKey;
      } else {
        getSecret = function(header2, secretCallback) {
          return secretCallback(null, secretOrPublicKey);
        };
      }
      return getSecret(header, function(err, secretOrPublicKey2) {
        if (err) {
          return done(new JsonWebTokenError("error in secret or public key callback: " + err.message));
        }
        var hasSignature = parts[2].trim() !== "";
        if (!hasSignature && secretOrPublicKey2) {
          return done(new JsonWebTokenError("jwt signature is required"));
        }
        if (hasSignature && !secretOrPublicKey2) {
          return done(new JsonWebTokenError("secret or public key must be provided"));
        }
        if (!hasSignature && !options.algorithms) {
          options.algorithms = ["none"];
        }
        if (!options.algorithms) {
          options.algorithms = ~secretOrPublicKey2.toString().indexOf("BEGIN CERTIFICATE") || ~secretOrPublicKey2.toString().indexOf("BEGIN PUBLIC KEY") ? PUB_KEY_ALGS : ~secretOrPublicKey2.toString().indexOf("BEGIN RSA PUBLIC KEY") ? RSA_KEY_ALGS : HS_ALGS;
        }
        if (!~options.algorithms.indexOf(decodedToken.header.alg)) {
          return done(new JsonWebTokenError("invalid algorithm"));
        }
        var valid;
        try {
          valid = jws.verify(jwtString, decodedToken.header.alg, secretOrPublicKey2);
        } catch (e) {
          return done(e);
        }
        if (!valid) {
          return done(new JsonWebTokenError("invalid signature"));
        }
        var payload = decodedToken.payload;
        if (typeof payload.nbf !== "undefined" && !options.ignoreNotBefore) {
          if (typeof payload.nbf !== "number") {
            return done(new JsonWebTokenError("invalid nbf value"));
          }
          if (payload.nbf > clockTimestamp + (options.clockTolerance || 0)) {
            return done(new NotBeforeError("jwt not active", new Date(payload.nbf * 1e3)));
          }
        }
        if (typeof payload.exp !== "undefined" && !options.ignoreExpiration) {
          if (typeof payload.exp !== "number") {
            return done(new JsonWebTokenError("invalid exp value"));
          }
          if (clockTimestamp >= payload.exp + (options.clockTolerance || 0)) {
            return done(new TokenExpiredError("jwt expired", new Date(payload.exp * 1e3)));
          }
        }
        if (options.audience) {
          var audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
          var target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
          var match = target.some(function(targetAudience) {
            return audiences.some(function(audience) {
              return audience instanceof RegExp ? audience.test(targetAudience) : audience === targetAudience;
            });
          });
          if (!match) {
            return done(new JsonWebTokenError("jwt audience invalid. expected: " + audiences.join(" or ")));
          }
        }
        if (options.issuer) {
          var invalid_issuer = typeof options.issuer === "string" && payload.iss !== options.issuer || Array.isArray(options.issuer) && options.issuer.indexOf(payload.iss) === -1;
          if (invalid_issuer) {
            return done(new JsonWebTokenError("jwt issuer invalid. expected: " + options.issuer));
          }
        }
        if (options.subject) {
          if (payload.sub !== options.subject) {
            return done(new JsonWebTokenError("jwt subject invalid. expected: " + options.subject));
          }
        }
        if (options.jwtid) {
          if (payload.jti !== options.jwtid) {
            return done(new JsonWebTokenError("jwt jwtid invalid. expected: " + options.jwtid));
          }
        }
        if (options.nonce) {
          if (payload.nonce !== options.nonce) {
            return done(new JsonWebTokenError("jwt nonce invalid. expected: " + options.nonce));
          }
        }
        if (options.maxAge) {
          if (typeof payload.iat !== "number") {
            return done(new JsonWebTokenError("iat required when maxAge is specified"));
          }
          var maxAgeTimestamp = timespan(options.maxAge, payload.iat);
          if (typeof maxAgeTimestamp === "undefined") {
            return done(new JsonWebTokenError('"maxAge" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
          }
          if (clockTimestamp >= maxAgeTimestamp + (options.clockTolerance || 0)) {
            return done(new TokenExpiredError("maxAge exceeded", new Date(maxAgeTimestamp * 1e3)));
          }
        }
        if (options.complete === true) {
          var signature = decodedToken.signature;
          return done(null, {
            header,
            payload,
            signature
          });
        }
        return done(null, payload);
      });
    };
  }
});

// node_modules/lodash.includes/index.js
var require_lodash4 = __commonJS({
  "node_modules/lodash.includes/index.js"(exports2, module2) {
    var INFINITY = 1 / 0;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var MAX_INTEGER = 17976931348623157e292;
    var NAN = 0 / 0;
    var argsTag = "[object Arguments]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var freeParseInt = parseInt;
    function arrayMap(array, iteratee) {
      var index = -1, length = array ? array.length : 0, result = Array(length);
      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
      while (fromRight ? index-- : ++index < length) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }
    function baseIndexOf(array, value, fromIndex) {
      if (value !== value) {
        return baseFindIndex(array, baseIsNaN, fromIndex);
      }
      var index = fromIndex - 1, length = array.length;
      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }
    function baseIsNaN(value) {
      return value !== value;
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseValues(object, props) {
      return arrayMap(props, function(key) {
        return object[key];
      });
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectToString = objectProto.toString;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var nativeKeys = overArg(Object.keys, Object);
    var nativeMax = Math.max;
    function arrayLikeKeys(value, inherited) {
      var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];
      var length = result.length, skipIndexes = !!length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    function includes(collection, value, fromIndex, guard) {
      collection = isArrayLike(collection) ? collection : values(collection);
      fromIndex = fromIndex && !guard ? toInteger(fromIndex) : 0;
      var length = collection.length;
      if (fromIndex < 0) {
        fromIndex = nativeMax(length + fromIndex, 0);
      }
      return isString(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf(collection, value, fromIndex) > -1;
    }
    function isArguments(value) {
      return isArrayLikeObject(value) && hasOwnProperty.call(value, "callee") && (!propertyIsEnumerable.call(value, "callee") || objectToString.call(value) == argsTag);
    }
    var isArray = Array.isArray;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    function isFunction(value) {
      var tag = isObject(value) ? objectToString.call(value) : "";
      return tag == funcTag || tag == genTag;
    }
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isString(value) {
      return typeof value == "string" || !isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag;
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    function toInteger(value) {
      var result = toFinite(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    function values(object) {
      return object ? baseValues(object, keys(object)) : [];
    }
    module2.exports = includes;
  }
});

// node_modules/lodash.isboolean/index.js
var require_lodash5 = __commonJS({
  "node_modules/lodash.isboolean/index.js"(exports2, module2) {
    var boolTag = "[object Boolean]";
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    function isBoolean(value) {
      return value === true || value === false || isObjectLike(value) && objectToString.call(value) == boolTag;
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    module2.exports = isBoolean;
  }
});

// node_modules/lodash.isinteger/index.js
var require_lodash6 = __commonJS({
  "node_modules/lodash.isinteger/index.js"(exports2, module2) {
    var INFINITY = 1 / 0;
    var MAX_INTEGER = 17976931348623157e292;
    var NAN = 0 / 0;
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    function isInteger(value) {
      return typeof value == "number" && value == toInteger(value);
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    function toInteger(value) {
      var result = toFinite(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    module2.exports = isInteger;
  }
});

// node_modules/lodash.isnumber/index.js
var require_lodash7 = __commonJS({
  "node_modules/lodash.isnumber/index.js"(exports2, module2) {
    var numberTag = "[object Number]";
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isNumber(value) {
      return typeof value == "number" || isObjectLike(value) && objectToString.call(value) == numberTag;
    }
    module2.exports = isNumber;
  }
});

// node_modules/lodash.isplainobject/index.js
var require_lodash8 = __commonJS({
  "node_modules/lodash.isplainobject/index.js"(exports2, module2) {
    var objectTag = "[object Object]";
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
        } catch (e) {
        }
      }
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectCtorString = funcToString.call(Object);
    var objectToString = objectProto.toString;
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isPlainObject(value) {
      if (!isObjectLike(value) || objectToString.call(value) != objectTag || isHostObject(value)) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    module2.exports = isPlainObject;
  }
});

// node_modules/lodash.isstring/index.js
var require_lodash9 = __commonJS({
  "node_modules/lodash.isstring/index.js"(exports2, module2) {
    var stringTag = "[object String]";
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    var isArray = Array.isArray;
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isString(value) {
      return typeof value == "string" || !isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag;
    }
    module2.exports = isString;
  }
});

// node_modules/lodash.once/index.js
var require_lodash10 = __commonJS({
  "node_modules/lodash.once/index.js"(exports2, module2) {
    var FUNC_ERROR_TEXT = "Expected a function";
    var INFINITY = 1 / 0;
    var MAX_INTEGER = 17976931348623157e292;
    var NAN = 0 / 0;
    var symbolTag = "[object Symbol]";
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    var objectProto = Object.prototype;
    var objectToString = objectProto.toString;
    function before(n, func) {
      var result;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      n = toInteger(n);
      return function() {
        if (--n > 0) {
          result = func.apply(this, arguments);
        }
        if (n <= 1) {
          func = void 0;
        }
        return result;
      };
    }
    function once(func) {
      return before(2, func);
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    function toInteger(value) {
      var result = toFinite(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, "");
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    module2.exports = once;
  }
});

// node_modules/jsonwebtoken/sign.js
var require_sign = __commonJS({
  "node_modules/jsonwebtoken/sign.js"(exports2, module2) {
    var timespan = require_timespan();
    var PS_SUPPORTED = require_psSupported();
    var jws = require_jws();
    var includes = require_lodash4();
    var isBoolean = require_lodash5();
    var isInteger = require_lodash6();
    var isNumber = require_lodash7();
    var isPlainObject = require_lodash8();
    var isString = require_lodash9();
    var once = require_lodash10();
    var SUPPORTED_ALGS = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "HS256", "HS384", "HS512", "none"];
    if (PS_SUPPORTED) {
      SUPPORTED_ALGS.splice(3, 0, "PS256", "PS384", "PS512");
    }
    var sign_options_schema = {
      expiresIn: {isValid: function(value) {
        return isInteger(value) || isString(value) && value;
      }, message: '"expiresIn" should be a number of seconds or string representing a timespan'},
      notBefore: {isValid: function(value) {
        return isInteger(value) || isString(value) && value;
      }, message: '"notBefore" should be a number of seconds or string representing a timespan'},
      audience: {isValid: function(value) {
        return isString(value) || Array.isArray(value);
      }, message: '"audience" must be a string or array'},
      algorithm: {isValid: includes.bind(null, SUPPORTED_ALGS), message: '"algorithm" must be a valid string enum value'},
      header: {isValid: isPlainObject, message: '"header" must be an object'},
      encoding: {isValid: isString, message: '"encoding" must be a string'},
      issuer: {isValid: isString, message: '"issuer" must be a string'},
      subject: {isValid: isString, message: '"subject" must be a string'},
      jwtid: {isValid: isString, message: '"jwtid" must be a string'},
      noTimestamp: {isValid: isBoolean, message: '"noTimestamp" must be a boolean'},
      keyid: {isValid: isString, message: '"keyid" must be a string'},
      mutatePayload: {isValid: isBoolean, message: '"mutatePayload" must be a boolean'}
    };
    var registered_claims_schema = {
      iat: {isValid: isNumber, message: '"iat" should be a number of seconds'},
      exp: {isValid: isNumber, message: '"exp" should be a number of seconds'},
      nbf: {isValid: isNumber, message: '"nbf" should be a number of seconds'}
    };
    function validate(schema, allowUnknown, object, parameterName) {
      if (!isPlainObject(object)) {
        throw new Error('Expected "' + parameterName + '" to be a plain object.');
      }
      Object.keys(object).forEach(function(key) {
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
      return validate(sign_options_schema, false, options, "options");
    }
    function validatePayload(payload) {
      return validate(registered_claims_schema, true, payload, "payload");
    }
    var options_to_payload = {
      "audience": "aud",
      "issuer": "iss",
      "subject": "sub",
      "jwtid": "jti"
    };
    var options_for_objects = [
      "expiresIn",
      "notBefore",
      "noTimestamp",
      "audience",
      "issuer",
      "subject",
      "jwtid"
    ];
    module2.exports = function(payload, secretOrPrivateKey, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else {
        options = options || {};
      }
      var isObjectPayload = typeof payload === "object" && !Buffer.isBuffer(payload);
      var header = Object.assign({
        alg: options.algorithm || "HS256",
        typ: isObjectPayload ? "JWT" : void 0,
        kid: options.keyid
      }, options.header);
      function failure(err) {
        if (callback) {
          return callback(err);
        }
        throw err;
      }
      if (!secretOrPrivateKey && options.algorithm !== "none") {
        return failure(new Error("secretOrPrivateKey must have a value"));
      }
      if (typeof payload === "undefined") {
        return failure(new Error("payload is required"));
      } else if (isObjectPayload) {
        try {
          validatePayload(payload);
        } catch (error2) {
          return failure(error2);
        }
        if (!options.mutatePayload) {
          payload = Object.assign({}, payload);
        }
      } else {
        var invalid_options = options_for_objects.filter(function(opt) {
          return typeof options[opt] !== "undefined";
        });
        if (invalid_options.length > 0) {
          return failure(new Error("invalid " + invalid_options.join(",") + " option for " + typeof payload + " payload"));
        }
      }
      if (typeof payload.exp !== "undefined" && typeof options.expiresIn !== "undefined") {
        return failure(new Error('Bad "options.expiresIn" option the payload already has an "exp" property.'));
      }
      if (typeof payload.nbf !== "undefined" && typeof options.notBefore !== "undefined") {
        return failure(new Error('Bad "options.notBefore" option the payload already has an "nbf" property.'));
      }
      try {
        validateOptions(options);
      } catch (error2) {
        return failure(error2);
      }
      var timestamp = payload.iat || Math.floor(Date.now() / 1e3);
      if (options.noTimestamp) {
        delete payload.iat;
      } else if (isObjectPayload) {
        payload.iat = timestamp;
      }
      if (typeof options.notBefore !== "undefined") {
        try {
          payload.nbf = timespan(options.notBefore, timestamp);
        } catch (err) {
          return failure(err);
        }
        if (typeof payload.nbf === "undefined") {
          return failure(new Error('"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
        }
      }
      if (typeof options.expiresIn !== "undefined" && typeof payload === "object") {
        try {
          payload.exp = timespan(options.expiresIn, timestamp);
        } catch (err) {
          return failure(err);
        }
        if (typeof payload.exp === "undefined") {
          return failure(new Error('"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
        }
      }
      Object.keys(options_to_payload).forEach(function(key) {
        var claim = options_to_payload[key];
        if (typeof options[key] !== "undefined") {
          if (typeof payload[claim] !== "undefined") {
            return failure(new Error('Bad "options.' + key + '" option. The payload already has an "' + claim + '" property.'));
          }
          payload[claim] = options[key];
        }
      });
      var encoding = options.encoding || "utf8";
      if (typeof callback === "function") {
        callback = callback && once(callback);
        jws.createSign({
          header,
          privateKey: secretOrPrivateKey,
          payload,
          encoding
        }).once("error", callback).once("done", function(signature) {
          callback(null, signature);
        });
      } else {
        return jws.sign({header, payload, secret: secretOrPrivateKey, encoding});
      }
    };
  }
});

// node_modules/jsonwebtoken/index.js
var require_jsonwebtoken = __commonJS({
  "node_modules/jsonwebtoken/index.js"(exports2, module2) {
    module2.exports = {
      decode: require_decode(),
      verify: require_verify(),
      sign: require_sign(),
      JsonWebTokenError: require_JsonWebTokenError(),
      NotBeforeError: require_NotBeforeError(),
      TokenExpiredError: require_TokenExpiredError()
    };
  }
});

// node_modules/@octokit/app/dist-node/index.js
var require_dist_node5 = __commonJS({
  "node_modules/@octokit/app/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {value: true});
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var request = require_dist_node4();
    var LRU = _interopDefault(require_lru_cache());
    var jsonwebtoken = _interopDefault(require_jsonwebtoken());
    function getCache() {
      return new LRU({
        max: 15e3,
        maxAge: 1e3 * 60 * 59
      });
    }
    function getSignedJsonWebToken({
      id,
      privateKey
    }) {
      const now = Math.floor(Date.now() / 1e3);
      const payload = {
        iat: now,
        exp: now + 60 * 10 - 30,
        iss: id
      };
      const token = jsonwebtoken.sign(payload, privateKey, {
        algorithm: "RS256"
      });
      return token;
    }
    function getInstallationAccessToken(state, {
      installationId,
      repositoryIds,
      permissions
    }) {
      const token = state.cache.get(installationId);
      if (token) {
        return Promise.resolve(token);
      }
      return state.request({
        method: "POST",
        url: "/app/installations/:installation_id/access_tokens",
        installation_id: installationId,
        headers: {
          accept: "application/vnd.github.machine-man-preview+json",
          authorization: `bearer ${getSignedJsonWebToken(state)}`
        },
        repository_ids: repositoryIds,
        permissions
      }).then((response) => {
        state.cache.set(installationId, response.data.token);
        return response.data.token;
      });
    }
    var App2 = class {
      constructor({
        id,
        privateKey,
        baseUrl,
        cache
      }) {
        const state = {
          id,
          privateKey,
          request: baseUrl ? request.request.defaults({
            baseUrl
          }) : request.request,
          cache: cache || getCache()
        };
        this.getSignedJsonWebToken = getSignedJsonWebToken.bind(null, state);
        this.getInstallationAccessToken = getInstallationAccessToken.bind(null, state);
      }
    };
    exports2.App = App2;
  }
});

// src/main.ts
var core = __toModule(require_core());
var import_github = __toModule(require_github());
var import_rest = __toModule(require_rest());
var import_app = __toModule(require_dist_node5());
async function lockIssue(client, issue, message) {
  await client.issues.createComment({
    owner: import_github.context.repo.owner,
    repo: import_github.context.repo.repo,
    issue_number: issue,
    body: message
  });
  await client.issues.lock({
    owner: import_github.context.repo.owner,
    repo: import_github.context.repo.repo,
    issue_number: issue
  });
}
function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function run() {
  try {
    const days = 30;
    const policyUrl = "https://github.com/angular/angular/blob/8f24bc9443b3872fe095d9f7f77b308a361a13b4/docs/GITHUB_PROCESS.md#conversation-locking";
    const message = `This issue has been automatically locked due to inactivity.
Please file a new issue if you are encountering a similar or related problem.

Read more about our [automatic conversation locking policy](${policyUrl}).

<sub>_This action has been performed automatically by a bot._</sub>`;
    const lockBotAppId = 40213;
    const installationId = 1772826;
    const lockBotKey = core.getInput("lock-bot-key", {required: true});
    const githubApp = new import_app.App({id: lockBotAppId, privateKey: lockBotKey});
    const githubToken = await githubApp.getInstallationAccessToken({installationId});
    const client = new import_rest.default({auth: githubToken});
    const maxPerExecution = Math.min(+core.getInput("locks-per-execution") || 1, 100);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    const repositoryName = import_github.context.repo.owner + "/" + import_github.context.repo.repo;
    const updatedAt = threshold.toISOString().split("T")[0];
    const query = `repo:${repositoryName}+is:closed+is:unlocked+updated:<${updatedAt}+sort:updated-asc`;
    console.info("Query: " + query);
    let lockCount = 0;
    let issueResponse = await client.search.issuesAndPullRequests({
      q: query,
      per_page: maxPerExecution
    });
    console.info(`Query found ${issueResponse.data.total_count} items`);
    if (!issueResponse.data.items.length) {
      console.info(`No items to lock`);
      return;
    }
    console.info(`Attempting to lock ${issueResponse.data.items.length} item(s)`);
    core.startGroup("Locking items");
    for (const item of issueResponse.data.items) {
      let itemType;
      try {
        itemType = item.pull_request ? "pull request" : "issue";
        if (item.locked) {
          console.info(`Skipping ${itemType} #${item.number}, already locked`);
          continue;
        }
        console.info(`Locking ${itemType} #${item.number}`);
        await lockIssue(client, item.number, message);
        await timeout(500);
        ++lockCount;
      } catch (error2) {
        core.debug(error2);
        core.warning(`Unable to lock ${itemType} #${item.number}: ${error2.message}`);
        if (typeof error2.request === "object") {
          core.error(JSON.stringify(error2.request, null, 2));
        }
      }
    }
    core.endGroup();
    console.info(`Locked ${lockCount} item(s)`);
  } catch (error2) {
    core.debug(error2);
    core.setFailed(error2.message);
    if (typeof error2.request === "object") {
      core.error(JSON.stringify(error2.request, null, 2));
    }
  }
  console.info(`End of locking task`);
}
if (import_github.context.repo.owner === "josephperrott") {
  run();
} else {
  core.warning("The Automatic Locking Closed issues was skipped as this action is only meant to run in repos belonging to the Angular organization.");
}
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */
