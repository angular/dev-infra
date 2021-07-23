var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/@actions/core/lib/utils.js
var require_utils = __commonJS({
  "node_modules/@actions/core/lib/utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.toCommandValue = void 0;
    function toCommandValue(input) {
      if (input === null || input === void 0) {
        return "";
      } else if (typeof input === "string" || input instanceof String) {
        return input;
      }
      return JSON.stringify(input);
    }
    exports2.toCommandValue = toCommandValue;
  }
});

// node_modules/@actions/core/lib/command.js
var require_command = __commonJS({
  "node_modules/@actions/core/lib/command.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.issue = exports2.issueCommand = void 0;
    var os = __importStar(require("os"));
    var utils_1 = require_utils();
    function issueCommand(command, properties, message) {
      const cmd = new Command(command, properties, message);
      process.stdout.write(cmd.toString() + os.EOL);
    }
    exports2.issueCommand = issueCommand;
    function issue(name, message = "") {
      issueCommand(name, {}, message);
    }
    exports2.issue = issue;
    var CMD_STRING = "::";
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
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
          cmdStr += " ";
          let first = true;
          for (const key in this.properties) {
            if (this.properties.hasOwnProperty(key)) {
              const val = this.properties[key];
              if (val) {
                if (first) {
                  first = false;
                } else {
                  cmdStr += ",";
                }
                cmdStr += `${key}=${escapeProperty(val)}`;
              }
            }
          }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
      }
    };
    function escapeData(s) {
      return utils_1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
    }
    function escapeProperty(s) {
      return utils_1.toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
    }
  }
});

// node_modules/@actions/core/lib/file-command.js
var require_file_command = __commonJS({
  "node_modules/@actions/core/lib/file-command.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.issueCommand = void 0;
    var fs = __importStar(require("fs"));
    var os = __importStar(require("os"));
    var utils_1 = require_utils();
    function issueCommand(command, message) {
      const filePath = process.env[`GITHUB_${command}`];
      if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
      }
      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
      }
      fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: "utf8"
      });
    }
    exports2.issueCommand = issueCommand;
  }
});

// node_modules/@actions/core/lib/core.js
var require_core = __commonJS({
  "node_modules/@actions/core/lib/core.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
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
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getState = exports2.saveState = exports2.group = exports2.endGroup = exports2.startGroup = exports2.info = exports2.warning = exports2.error = exports2.debug = exports2.isDebug = exports2.setFailed = exports2.setCommandEcho = exports2.setOutput = exports2.getBooleanInput = exports2.getMultilineInput = exports2.getInput = exports2.addPath = exports2.setSecret = exports2.exportVariable = exports2.ExitCode = void 0;
    var command_1 = require_command();
    var file_command_1 = require_file_command();
    var utils_1 = require_utils();
    var os = __importStar(require("os"));
    var path = __importStar(require("path"));
    var ExitCode;
    (function(ExitCode2) {
      ExitCode2[ExitCode2["Success"] = 0] = "Success";
      ExitCode2[ExitCode2["Failure"] = 1] = "Failure";
    })(ExitCode = exports2.ExitCode || (exports2.ExitCode = {}));
    function exportVariable(name, val) {
      const convertedVal = utils_1.toCommandValue(val);
      process.env[name] = convertedVal;
      const filePath = process.env["GITHUB_ENV"] || "";
      if (filePath) {
        const delimiter = "_GitHubActionsFileCommandDelimeter_";
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand("ENV", commandValue);
      } else {
        command_1.issueCommand("set-env", { name }, convertedVal);
      }
    }
    exports2.exportVariable = exportVariable;
    function setSecret(secret) {
      command_1.issueCommand("add-mask", {}, secret);
    }
    exports2.setSecret = setSecret;
    function addPath(inputPath) {
      const filePath = process.env["GITHUB_PATH"] || "";
      if (filePath) {
        file_command_1.issueCommand("PATH", inputPath);
      } else {
        command_1.issueCommand("add-path", {}, inputPath);
      }
      process.env["PATH"] = `${inputPath}${path.delimiter}${process.env["PATH"]}`;
    }
    exports2.addPath = addPath;
    function getInput(name, options) {
      const val = process.env[`INPUT_${name.replace(/ /g, "_").toUpperCase()}`] || "";
      if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
      }
      if (options && options.trimWhitespace === false) {
        return val;
      }
      return val.trim();
    }
    exports2.getInput = getInput;
    function getMultilineInput(name, options) {
      const inputs = getInput(name, options).split("\n").filter((x) => x !== "");
      return inputs;
    }
    exports2.getMultilineInput = getMultilineInput;
    function getBooleanInput(name, options) {
      const trueValue = ["true", "True", "TRUE"];
      const falseValue = ["false", "False", "FALSE"];
      const val = getInput(name, options);
      if (trueValue.includes(val))
        return true;
      if (falseValue.includes(val))
        return false;
      throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}
Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
    }
    exports2.getBooleanInput = getBooleanInput;
    function setOutput(name, value) {
      process.stdout.write(os.EOL);
      command_1.issueCommand("set-output", { name }, value);
    }
    exports2.setOutput = setOutput;
    function setCommandEcho(enabled) {
      command_1.issue("echo", enabled ? "on" : "off");
    }
    exports2.setCommandEcho = setCommandEcho;
    function setFailed(message) {
      process.exitCode = ExitCode.Failure;
      error(message);
    }
    exports2.setFailed = setFailed;
    function isDebug() {
      return process.env["RUNNER_DEBUG"] === "1";
    }
    exports2.isDebug = isDebug;
    function debug(message) {
      command_1.issueCommand("debug", {}, message);
    }
    exports2.debug = debug;
    function error(message) {
      command_1.issue("error", message instanceof Error ? message.toString() : message);
    }
    exports2.error = error;
    function warning(message) {
      command_1.issue("warning", message instanceof Error ? message.toString() : message);
    }
    exports2.warning = warning;
    function info(message) {
      process.stdout.write(message + os.EOL);
    }
    exports2.info = info;
    function startGroup(name) {
      command_1.issue("group", name);
    }
    exports2.startGroup = startGroup;
    function endGroup() {
      command_1.issue("endgroup");
    }
    exports2.endGroup = endGroup;
    function group(name, fn) {
      return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
          result = yield fn();
        } finally {
          endGroup();
        }
        return result;
      });
    }
    exports2.group = group;
    function saveState(name, value) {
      command_1.issueCommand("save-state", { name }, value);
    }
    exports2.saveState = saveState;
    function getState(name) {
      return process.env[`STATE_${name}`] || "";
    }
    exports2.getState = getState;
  }
});

// node_modules/@actions/github/lib/context.js
var require_context = __commonJS({
  "node_modules/@actions/github/lib/context.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Context = void 0;
    var fs_1 = require("fs");
    var os_1 = require("os");
    var Context = class {
      constructor() {
        var _a, _b, _c;
        this.payload = {};
        if (process.env.GITHUB_EVENT_PATH) {
          if (fs_1.existsSync(process.env.GITHUB_EVENT_PATH)) {
            this.payload = JSON.parse(fs_1.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }));
          } else {
            const path = process.env.GITHUB_EVENT_PATH;
            process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${os_1.EOL}`);
          }
        }
        this.eventName = process.env.GITHUB_EVENT_NAME;
        this.sha = process.env.GITHUB_SHA;
        this.ref = process.env.GITHUB_REF;
        this.workflow = process.env.GITHUB_WORKFLOW;
        this.action = process.env.GITHUB_ACTION;
        this.actor = process.env.GITHUB_ACTOR;
        this.job = process.env.GITHUB_JOB;
        this.runNumber = parseInt(process.env.GITHUB_RUN_NUMBER, 10);
        this.runId = parseInt(process.env.GITHUB_RUN_ID, 10);
        this.apiUrl = (_a = process.env.GITHUB_API_URL) !== null && _a !== void 0 ? _a : `https://api.github.com`;
        this.serverUrl = (_b = process.env.GITHUB_SERVER_URL) !== null && _b !== void 0 ? _b : `https://github.com`;
        this.graphqlUrl = (_c = process.env.GITHUB_GRAPHQL_URL) !== null && _c !== void 0 ? _c : `https://api.github.com/graphql`;
      }
      get issue() {
        const payload = this.payload;
        return Object.assign(Object.assign({}, this.repo), { number: (payload.issue || payload.pull_request || payload).number });
      }
      get repo() {
        if (process.env.GITHUB_REPOSITORY) {
          const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
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
    };
    exports2.Context = Context;
  }
});

// node_modules/@actions/http-client/proxy.js
var require_proxy = __commonJS({
  "node_modules/@actions/http-client/proxy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function getProxyUrl(reqUrl) {
      let usingSsl = reqUrl.protocol === "https:";
      let proxyUrl;
      if (checkBypass(reqUrl)) {
        return proxyUrl;
      }
      let proxyVar;
      if (usingSsl) {
        proxyVar = process.env["https_proxy"] || process.env["HTTPS_PROXY"];
      } else {
        proxyVar = process.env["http_proxy"] || process.env["HTTP_PROXY"];
      }
      if (proxyVar) {
        proxyUrl = new URL(proxyVar);
      }
      return proxyUrl;
    }
    exports2.getProxyUrl = getProxyUrl;
    function checkBypass(reqUrl) {
      if (!reqUrl.hostname) {
        return false;
      }
      let noProxy = process.env["no_proxy"] || process.env["NO_PROXY"] || "";
      if (!noProxy) {
        return false;
      }
      let reqPort;
      if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
      } else if (reqUrl.protocol === "http:") {
        reqPort = 80;
      } else if (reqUrl.protocol === "https:") {
        reqPort = 443;
      }
      let upperReqHosts = [reqUrl.hostname.toUpperCase()];
      if (typeof reqPort === "number") {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
      }
      for (let upperNoProxyItem of noProxy.split(",").map((x) => x.trim().toUpperCase()).filter((x) => x)) {
        if (upperReqHosts.some((x) => x === upperNoProxyItem)) {
          return true;
        }
      }
      return false;
    }
    exports2.checkBypass = checkBypass;
  }
});

// node_modules/tunnel/lib/tunnel.js
var require_tunnel = __commonJS({
  "node_modules/tunnel/lib/tunnel.js"(exports2) {
    "use strict";
    var net = require("net");
    var tls = require("tls");
    var http = require("http");
    var https = require("https");
    var events = require("events");
    var assert = require("assert");
    var util = require("util");
    exports2.httpOverHttp = httpOverHttp;
    exports2.httpsOverHttp = httpsOverHttp;
    exports2.httpOverHttps = httpOverHttps;
    exports2.httpsOverHttps = httpsOverHttps;
    function httpOverHttp(options) {
      var agent = new TunnelingAgent(options);
      agent.request = http.request;
      return agent;
    }
    function httpsOverHttp(options) {
      var agent = new TunnelingAgent(options);
      agent.request = http.request;
      agent.createSocket = createSecureSocket;
      agent.defaultPort = 443;
      return agent;
    }
    function httpOverHttps(options) {
      var agent = new TunnelingAgent(options);
      agent.request = https.request;
      return agent;
    }
    function httpsOverHttps(options) {
      var agent = new TunnelingAgent(options);
      agent.request = https.request;
      agent.createSocket = createSecureSocket;
      agent.defaultPort = 443;
      return agent;
    }
    function TunnelingAgent(options) {
      var self = this;
      self.options = options || {};
      self.proxyOptions = self.options.proxy || {};
      self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
      self.requests = [];
      self.sockets = [];
      self.on("free", function onFree(socket, host, port, localAddress) {
        var options2 = toOptions(host, port, localAddress);
        for (var i = 0, len = self.requests.length; i < len; ++i) {
          var pending = self.requests[i];
          if (pending.host === options2.host && pending.port === options2.port) {
            self.requests.splice(i, 1);
            pending.request.onSocket(socket);
            return;
          }
        }
        socket.destroy();
        self.removeSocket(socket);
      });
    }
    util.inherits(TunnelingAgent, events.EventEmitter);
    TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
      var self = this;
      var options = mergeOptions({ request: req }, self.options, toOptions(host, port, localAddress));
      if (self.sockets.length >= this.maxSockets) {
        self.requests.push(options);
        return;
      }
      self.createSocket(options, function(socket) {
        socket.on("free", onFree);
        socket.on("close", onCloseOrRemove);
        socket.on("agentRemove", onCloseOrRemove);
        req.onSocket(socket);
        function onFree() {
          self.emit("free", socket, options);
        }
        function onCloseOrRemove(err) {
          self.removeSocket(socket);
          socket.removeListener("free", onFree);
          socket.removeListener("close", onCloseOrRemove);
          socket.removeListener("agentRemove", onCloseOrRemove);
        }
      });
    };
    TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
      var self = this;
      var placeholder = {};
      self.sockets.push(placeholder);
      var connectOptions = mergeOptions({}, self.proxyOptions, {
        method: "CONNECT",
        path: options.host + ":" + options.port,
        agent: false,
        headers: {
          host: options.host + ":" + options.port
        }
      });
      if (options.localAddress) {
        connectOptions.localAddress = options.localAddress;
      }
      if (connectOptions.proxyAuth) {
        connectOptions.headers = connectOptions.headers || {};
        connectOptions.headers["Proxy-Authorization"] = "Basic " + new Buffer(connectOptions.proxyAuth).toString("base64");
      }
      debug("making CONNECT request");
      var connectReq = self.request(connectOptions);
      connectReq.useChunkedEncodingByDefault = false;
      connectReq.once("response", onResponse);
      connectReq.once("upgrade", onUpgrade);
      connectReq.once("connect", onConnect);
      connectReq.once("error", onError);
      connectReq.end();
      function onResponse(res) {
        res.upgrade = true;
      }
      function onUpgrade(res, socket, head) {
        process.nextTick(function() {
          onConnect(res, socket, head);
        });
      }
      function onConnect(res, socket, head) {
        connectReq.removeAllListeners();
        socket.removeAllListeners();
        if (res.statusCode !== 200) {
          debug("tunneling socket could not be established, statusCode=%d", res.statusCode);
          socket.destroy();
          var error = new Error("tunneling socket could not be established, statusCode=" + res.statusCode);
          error.code = "ECONNRESET";
          options.request.emit("error", error);
          self.removeSocket(placeholder);
          return;
        }
        if (head.length > 0) {
          debug("got illegal response body from proxy");
          socket.destroy();
          var error = new Error("got illegal response body from proxy");
          error.code = "ECONNRESET";
          options.request.emit("error", error);
          self.removeSocket(placeholder);
          return;
        }
        debug("tunneling connection has established");
        self.sockets[self.sockets.indexOf(placeholder)] = socket;
        return cb(socket);
      }
      function onError(cause) {
        connectReq.removeAllListeners();
        debug("tunneling socket could not be established, cause=%s\n", cause.message, cause.stack);
        var error = new Error("tunneling socket could not be established, cause=" + cause.message);
        error.code = "ECONNRESET";
        options.request.emit("error", error);
        self.removeSocket(placeholder);
      }
    };
    TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
      var pos = this.sockets.indexOf(socket);
      if (pos === -1) {
        return;
      }
      this.sockets.splice(pos, 1);
      var pending = this.requests.shift();
      if (pending) {
        this.createSocket(pending, function(socket2) {
          pending.request.onSocket(socket2);
        });
      }
    };
    function createSecureSocket(options, cb) {
      var self = this;
      TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
        var hostHeader = options.request.getHeader("host");
        var tlsOptions = mergeOptions({}, self.options, {
          socket,
          servername: hostHeader ? hostHeader.replace(/:.*$/, "") : options.host
        });
        var secureSocket = tls.connect(0, tlsOptions);
        self.sockets[self.sockets.indexOf(socket)] = secureSocket;
        cb(secureSocket);
      });
    }
    function toOptions(host, port, localAddress) {
      if (typeof host === "string") {
        return {
          host,
          port,
          localAddress
        };
      }
      return host;
    }
    function mergeOptions(target) {
      for (var i = 1, len = arguments.length; i < len; ++i) {
        var overrides = arguments[i];
        if (typeof overrides === "object") {
          var keys = Object.keys(overrides);
          for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
            var k = keys[j];
            if (overrides[k] !== void 0) {
              target[k] = overrides[k];
            }
          }
        }
      }
      return target;
    }
    var debug;
    if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
      debug = function() {
        var args = Array.prototype.slice.call(arguments);
        if (typeof args[0] === "string") {
          args[0] = "TUNNEL: " + args[0];
        } else {
          args.unshift("TUNNEL:");
        }
        console.error.apply(console, args);
      };
    } else {
      debug = function() {
      };
    }
    exports2.debug = debug;
  }
});

// node_modules/tunnel/index.js
var require_tunnel2 = __commonJS({
  "node_modules/tunnel/index.js"(exports2, module2) {
    module2.exports = require_tunnel();
  }
});

// node_modules/@actions/http-client/index.js
var require_http_client = __commonJS({
  "node_modules/@actions/http-client/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var http = require("http");
    var https = require("https");
    var pm = require_proxy();
    var tunnel;
    var HttpCodes;
    (function(HttpCodes2) {
      HttpCodes2[HttpCodes2["OK"] = 200] = "OK";
      HttpCodes2[HttpCodes2["MultipleChoices"] = 300] = "MultipleChoices";
      HttpCodes2[HttpCodes2["MovedPermanently"] = 301] = "MovedPermanently";
      HttpCodes2[HttpCodes2["ResourceMoved"] = 302] = "ResourceMoved";
      HttpCodes2[HttpCodes2["SeeOther"] = 303] = "SeeOther";
      HttpCodes2[HttpCodes2["NotModified"] = 304] = "NotModified";
      HttpCodes2[HttpCodes2["UseProxy"] = 305] = "UseProxy";
      HttpCodes2[HttpCodes2["SwitchProxy"] = 306] = "SwitchProxy";
      HttpCodes2[HttpCodes2["TemporaryRedirect"] = 307] = "TemporaryRedirect";
      HttpCodes2[HttpCodes2["PermanentRedirect"] = 308] = "PermanentRedirect";
      HttpCodes2[HttpCodes2["BadRequest"] = 400] = "BadRequest";
      HttpCodes2[HttpCodes2["Unauthorized"] = 401] = "Unauthorized";
      HttpCodes2[HttpCodes2["PaymentRequired"] = 402] = "PaymentRequired";
      HttpCodes2[HttpCodes2["Forbidden"] = 403] = "Forbidden";
      HttpCodes2[HttpCodes2["NotFound"] = 404] = "NotFound";
      HttpCodes2[HttpCodes2["MethodNotAllowed"] = 405] = "MethodNotAllowed";
      HttpCodes2[HttpCodes2["NotAcceptable"] = 406] = "NotAcceptable";
      HttpCodes2[HttpCodes2["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
      HttpCodes2[HttpCodes2["RequestTimeout"] = 408] = "RequestTimeout";
      HttpCodes2[HttpCodes2["Conflict"] = 409] = "Conflict";
      HttpCodes2[HttpCodes2["Gone"] = 410] = "Gone";
      HttpCodes2[HttpCodes2["TooManyRequests"] = 429] = "TooManyRequests";
      HttpCodes2[HttpCodes2["InternalServerError"] = 500] = "InternalServerError";
      HttpCodes2[HttpCodes2["NotImplemented"] = 501] = "NotImplemented";
      HttpCodes2[HttpCodes2["BadGateway"] = 502] = "BadGateway";
      HttpCodes2[HttpCodes2["ServiceUnavailable"] = 503] = "ServiceUnavailable";
      HttpCodes2[HttpCodes2["GatewayTimeout"] = 504] = "GatewayTimeout";
    })(HttpCodes = exports2.HttpCodes || (exports2.HttpCodes = {}));
    var Headers;
    (function(Headers2) {
      Headers2["Accept"] = "accept";
      Headers2["ContentType"] = "content-type";
    })(Headers = exports2.Headers || (exports2.Headers = {}));
    var MediaTypes;
    (function(MediaTypes2) {
      MediaTypes2["ApplicationJson"] = "application/json";
    })(MediaTypes = exports2.MediaTypes || (exports2.MediaTypes = {}));
    function getProxyUrl(serverUrl) {
      let proxyUrl = pm.getProxyUrl(new URL(serverUrl));
      return proxyUrl ? proxyUrl.href : "";
    }
    exports2.getProxyUrl = getProxyUrl;
    var HttpRedirectCodes = [
      HttpCodes.MovedPermanently,
      HttpCodes.ResourceMoved,
      HttpCodes.SeeOther,
      HttpCodes.TemporaryRedirect,
      HttpCodes.PermanentRedirect
    ];
    var HttpResponseRetryCodes = [
      HttpCodes.BadGateway,
      HttpCodes.ServiceUnavailable,
      HttpCodes.GatewayTimeout
    ];
    var RetryableHttpVerbs = ["OPTIONS", "GET", "DELETE", "HEAD"];
    var ExponentialBackoffCeiling = 10;
    var ExponentialBackoffTimeSlice = 5;
    var HttpClientError = class extends Error {
      constructor(message, statusCode) {
        super(message);
        this.name = "HttpClientError";
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HttpClientError.prototype);
      }
    };
    exports2.HttpClientError = HttpClientError;
    var HttpClientResponse = class {
      constructor(message) {
        this.message = message;
      }
      readBody() {
        return new Promise(async (resolve, reject) => {
          let output = Buffer.alloc(0);
          this.message.on("data", (chunk) => {
            output = Buffer.concat([output, chunk]);
          });
          this.message.on("end", () => {
            resolve(output.toString());
          });
        });
      }
    };
    exports2.HttpClientResponse = HttpClientResponse;
    function isHttps(requestUrl) {
      let parsedUrl = new URL(requestUrl);
      return parsedUrl.protocol === "https:";
    }
    exports2.isHttps = isHttps;
    var HttpClient = class {
      constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
          if (requestOptions.ignoreSslError != null) {
            this._ignoreSslError = requestOptions.ignoreSslError;
          }
          this._socketTimeout = requestOptions.socketTimeout;
          if (requestOptions.allowRedirects != null) {
            this._allowRedirects = requestOptions.allowRedirects;
          }
          if (requestOptions.allowRedirectDowngrade != null) {
            this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
          }
          if (requestOptions.maxRedirects != null) {
            this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
          }
          if (requestOptions.keepAlive != null) {
            this._keepAlive = requestOptions.keepAlive;
          }
          if (requestOptions.allowRetries != null) {
            this._allowRetries = requestOptions.allowRetries;
          }
          if (requestOptions.maxRetries != null) {
            this._maxRetries = requestOptions.maxRetries;
          }
        }
      }
      options(requestUrl, additionalHeaders) {
        return this.request("OPTIONS", requestUrl, null, additionalHeaders || {});
      }
      get(requestUrl, additionalHeaders) {
        return this.request("GET", requestUrl, null, additionalHeaders || {});
      }
      del(requestUrl, additionalHeaders) {
        return this.request("DELETE", requestUrl, null, additionalHeaders || {});
      }
      post(requestUrl, data, additionalHeaders) {
        return this.request("POST", requestUrl, data, additionalHeaders || {});
      }
      patch(requestUrl, data, additionalHeaders) {
        return this.request("PATCH", requestUrl, data, additionalHeaders || {});
      }
      put(requestUrl, data, additionalHeaders) {
        return this.request("PUT", requestUrl, data, additionalHeaders || {});
      }
      head(requestUrl, additionalHeaders) {
        return this.request("HEAD", requestUrl, null, additionalHeaders || {});
      }
      sendStream(verb, requestUrl, stream, additionalHeaders) {
        return this.request(verb, requestUrl, stream, additionalHeaders);
      }
      async getJson(requestUrl, additionalHeaders = {}) {
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        let res = await this.get(requestUrl, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      }
      async postJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.post(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      }
      async putJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.put(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      }
      async patchJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.patch(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
      }
      async request(verb, requestUrl, data, headers) {
        if (this._disposed) {
          throw new Error("Client has already been disposed.");
        }
        let parsedUrl = new URL(requestUrl);
        let info = this._prepareRequest(verb, parsedUrl, headers);
        let maxTries = this._allowRetries && RetryableHttpVerbs.indexOf(verb) != -1 ? this._maxRetries + 1 : 1;
        let numTries = 0;
        let response;
        while (numTries < maxTries) {
          response = await this.requestRaw(info, data);
          if (response && response.message && response.message.statusCode === HttpCodes.Unauthorized) {
            let authenticationHandler;
            for (let i = 0; i < this.handlers.length; i++) {
              if (this.handlers[i].canHandleAuthentication(response)) {
                authenticationHandler = this.handlers[i];
                break;
              }
            }
            if (authenticationHandler) {
              return authenticationHandler.handleAuthentication(this, info, data);
            } else {
              return response;
            }
          }
          let redirectsRemaining = this._maxRedirects;
          while (HttpRedirectCodes.indexOf(response.message.statusCode) != -1 && this._allowRedirects && redirectsRemaining > 0) {
            const redirectUrl = response.message.headers["location"];
            if (!redirectUrl) {
              break;
            }
            let parsedRedirectUrl = new URL(redirectUrl);
            if (parsedUrl.protocol == "https:" && parsedUrl.protocol != parsedRedirectUrl.protocol && !this._allowRedirectDowngrade) {
              throw new Error("Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.");
            }
            await response.readBody();
            if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
              for (let header in headers) {
                if (header.toLowerCase() === "authorization") {
                  delete headers[header];
                }
              }
            }
            info = this._prepareRequest(verb, parsedRedirectUrl, headers);
            response = await this.requestRaw(info, data);
            redirectsRemaining--;
          }
          if (HttpResponseRetryCodes.indexOf(response.message.statusCode) == -1) {
            return response;
          }
          numTries += 1;
          if (numTries < maxTries) {
            await response.readBody();
            await this._performExponentialBackoff(numTries);
          }
        }
        return response;
      }
      dispose() {
        if (this._agent) {
          this._agent.destroy();
        }
        this._disposed = true;
      }
      requestRaw(info, data) {
        return new Promise((resolve, reject) => {
          let callbackForResult = function(err, res) {
            if (err) {
              reject(err);
            }
            resolve(res);
          };
          this.requestRawWithCallback(info, data, callbackForResult);
        });
      }
      requestRawWithCallback(info, data, onResult) {
        let socket;
        if (typeof data === "string") {
          info.options.headers["Content-Length"] = Buffer.byteLength(data, "utf8");
        }
        let callbackCalled = false;
        let handleResult = (err, res) => {
          if (!callbackCalled) {
            callbackCalled = true;
            onResult(err, res);
          }
        };
        let req = info.httpModule.request(info.options, (msg) => {
          let res = new HttpClientResponse(msg);
          handleResult(null, res);
        });
        req.on("socket", (sock) => {
          socket = sock;
        });
        req.setTimeout(this._socketTimeout || 3 * 6e4, () => {
          if (socket) {
            socket.end();
          }
          handleResult(new Error("Request timeout: " + info.options.path), null);
        });
        req.on("error", function(err) {
          handleResult(err, null);
        });
        if (data && typeof data === "string") {
          req.write(data, "utf8");
        }
        if (data && typeof data !== "string") {
          data.on("close", function() {
            req.end();
          });
          data.pipe(req);
        } else {
          req.end();
        }
      }
      getAgent(serverUrl) {
        let parsedUrl = new URL(serverUrl);
        return this._getAgent(parsedUrl);
      }
      _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === "https:";
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port ? parseInt(info.parsedUrl.port) : defaultPort;
        info.options.path = (info.parsedUrl.pathname || "") + (info.parsedUrl.search || "");
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
          info.options.headers["user-agent"] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        if (this.handlers) {
          this.handlers.forEach((handler) => {
            handler.prepareRequest(info.options);
          });
        }
        return info;
      }
      _mergeHeaders(headers) {
        const lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => (c[k.toLowerCase()] = obj[k], c), {});
        if (this.requestOptions && this.requestOptions.headers) {
          return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers));
        }
        return lowercaseKeys(headers || {});
      }
      _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        const lowercaseKeys = (obj) => Object.keys(obj).reduce((c, k) => (c[k.toLowerCase()] = obj[k], c), {});
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
          clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
      }
      _getAgent(parsedUrl) {
        let agent;
        let proxyUrl = pm.getProxyUrl(parsedUrl);
        let useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
          agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
          agent = this._agent;
        }
        if (!!agent) {
          return agent;
        }
        const usingSsl = parsedUrl.protocol === "https:";
        let maxSockets = 100;
        if (!!this.requestOptions) {
          maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        if (useProxy) {
          if (!tunnel) {
            tunnel = require_tunnel2();
          }
          const agentOptions = {
            maxSockets,
            keepAlive: this._keepAlive,
            proxy: __spreadProps(__spreadValues({}, (proxyUrl.username || proxyUrl.password) && {
              proxyAuth: `${proxyUrl.username}:${proxyUrl.password}`
            }), {
              host: proxyUrl.hostname,
              port: proxyUrl.port
            })
          };
          let tunnelAgent;
          const overHttps = proxyUrl.protocol === "https:";
          if (usingSsl) {
            tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
          } else {
            tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
          }
          agent = tunnelAgent(agentOptions);
          this._proxyAgent = agent;
        }
        if (this._keepAlive && !agent) {
          const options = { keepAlive: this._keepAlive, maxSockets };
          agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
          this._agent = agent;
        }
        if (!agent) {
          agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
          agent.options = Object.assign(agent.options || {}, {
            rejectUnauthorized: false
          });
        }
        return agent;
      }
      _performExponentialBackoff(retryNumber) {
        retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
        const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
        return new Promise((resolve) => setTimeout(() => resolve(), ms));
      }
      static dateTimeDeserializer(key, value) {
        if (typeof value === "string") {
          let a = new Date(value);
          if (!isNaN(a.valueOf())) {
            return a;
          }
        }
        return value;
      }
      async _processResponse(res, options) {
        return new Promise(async (resolve, reject) => {
          const statusCode = res.message.statusCode;
          const response = {
            statusCode,
            result: null,
            headers: {}
          };
          if (statusCode == HttpCodes.NotFound) {
            resolve(response);
          }
          let obj;
          let contents;
          try {
            contents = await res.readBody();
            if (contents && contents.length > 0) {
              if (options && options.deserializeDates) {
                obj = JSON.parse(contents, HttpClient.dateTimeDeserializer);
              } else {
                obj = JSON.parse(contents);
              }
              response.result = obj;
            }
            response.headers = res.message.headers;
          } catch (err) {
          }
          if (statusCode > 299) {
            let msg;
            if (obj && obj.message) {
              msg = obj.message;
            } else if (contents && contents.length > 0) {
              msg = contents;
            } else {
              msg = "Failed request: (" + statusCode + ")";
            }
            let err = new HttpClientError(msg, statusCode);
            err.result = response.result;
            reject(err);
          } else {
            resolve(response);
          }
        });
      }
    };
    exports2.HttpClient = HttpClient;
  }
});

// node_modules/@actions/github/lib/internal/utils.js
var require_utils2 = __commonJS({
  "node_modules/@actions/github/lib/internal/utils.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getApiBaseUrl = exports2.getProxyAgent = exports2.getAuthString = void 0;
    var httpClient = __importStar(require_http_client());
    function getAuthString(token, options) {
      if (!token && !options.auth) {
        throw new Error("Parameter token or opts.auth is required");
      } else if (token && options.auth) {
        throw new Error("Parameters token and opts.auth may not both be specified");
      }
      return typeof options.auth === "string" ? options.auth : `token ${token}`;
    }
    exports2.getAuthString = getAuthString;
    function getProxyAgent(destinationUrl) {
      const hc = new httpClient.HttpClient();
      return hc.getAgent(destinationUrl);
    }
    exports2.getProxyAgent = getProxyAgent;
    function getApiBaseUrl() {
      return process.env["GITHUB_API_URL"] || "https://api.github.com";
    }
    exports2.getApiBaseUrl = getApiBaseUrl;
  }
});

// node_modules/universal-user-agent/dist-node/index.js
var require_dist_node = __commonJS({
  "node_modules/universal-user-agent/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function getUserAgent() {
      if (typeof navigator === "object" && "userAgent" in navigator) {
        return navigator.userAgent;
      }
      if (typeof process === "object" && "version" in process) {
        return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
      }
      return "<environment undetectable>";
    }
    exports2.getUserAgent = getUserAgent;
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
          return Promise.resolve().then(method.bind(null, options)).catch(function(error) {
            return orig(error, options);
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
      hook.api = { remove: removeHookRef };
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

// node_modules/is-plain-object/dist/is-plain-object.js
var require_is_plain_object = __commonJS({
  "node_modules/is-plain-object/dist/is-plain-object.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function isObject(o) {
      return Object.prototype.toString.call(o) === "[object Object]";
    }
    function isPlainObject(o) {
      var ctor, prot;
      if (isObject(o) === false)
        return false;
      ctor = o.constructor;
      if (ctor === void 0)
        return true;
      prot = ctor.prototype;
      if (isObject(prot) === false)
        return false;
      if (prot.hasOwnProperty("isPrototypeOf") === false) {
        return false;
      }
      return true;
    }
    exports2.isPlainObject = isPlainObject;
  }
});

// node_modules/@octokit/endpoint/dist-node/index.js
var require_dist_node2 = __commonJS({
  "node_modules/@octokit/endpoint/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var isPlainObject = require_is_plain_object();
    var universalUserAgent = require_dist_node();
    function lowercaseKeys(object) {
      if (!object) {
        return {};
      }
      return Object.keys(object).reduce((newObj, key) => {
        newObj[key.toLowerCase()] = object[key];
        return newObj;
      }, {});
    }
    function mergeDeep(defaults, options) {
      const result = Object.assign({}, defaults);
      Object.keys(options).forEach((key) => {
        if (isPlainObject.isPlainObject(options[key])) {
          if (!(key in defaults))
            Object.assign(result, {
              [key]: options[key]
            });
          else
            result[key] = mergeDeep(defaults[key], options[key]);
        } else {
          Object.assign(result, {
            [key]: options[key]
          });
        }
      });
      return result;
    }
    function removeUndefinedProperties(obj) {
      for (const key in obj) {
        if (obj[key] === void 0) {
          delete obj[key];
        }
      }
      return obj;
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
        options = Object.assign({}, route);
      }
      options.headers = lowercaseKeys(options.headers);
      removeUndefinedProperties(options);
      removeUndefinedProperties(options.headers);
      const mergedOptions = mergeDeep(defaults || {}, options);
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
    function encodeReserved(str) {
      return str.split(/(%[0-9A-Fa-f]{2})/g).map(function(part) {
        if (!/%[0-9A-Fa-f]/.test(part)) {
          part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
        }
        return part;
      }).join("");
    }
    function encodeUnreserved(str) {
      return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
      });
    }
    function encodeValue(operator, value, key) {
      value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);
      if (key) {
        return encodeUnreserved(key) + "=" + value;
      } else {
        return value;
      }
    }
    function isDefined(value) {
      return value !== void 0 && value !== null;
    }
    function isKeyOperator(operator) {
      return operator === ";" || operator === "&" || operator === "?";
    }
    function getValues(context, operator, key, modifier) {
      var value = context[key], result = [];
      if (isDefined(value) && value !== "") {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          value = value.toString();
          if (modifier && modifier !== "*") {
            value = value.substring(0, parseInt(modifier, 10));
          }
          result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
        } else {
          if (modifier === "*") {
            if (Array.isArray(value)) {
              value.filter(isDefined).forEach(function(value2) {
                result.push(encodeValue(operator, value2, isKeyOperator(operator) ? key : ""));
              });
            } else {
              Object.keys(value).forEach(function(k) {
                if (isDefined(value[k])) {
                  result.push(encodeValue(operator, value[k], k));
                }
              });
            }
          } else {
            const tmp = [];
            if (Array.isArray(value)) {
              value.filter(isDefined).forEach(function(value2) {
                tmp.push(encodeValue(operator, value2));
              });
            } else {
              Object.keys(value).forEach(function(k) {
                if (isDefined(value[k])) {
                  tmp.push(encodeUnreserved(k));
                  tmp.push(encodeValue(operator, value[k].toString()));
                }
              });
            }
            if (isKeyOperator(operator)) {
              result.push(encodeUnreserved(key) + "=" + tmp.join(","));
            } else if (tmp.length !== 0) {
              result.push(tmp.join(","));
            }
          }
        }
      } else {
        if (operator === ";") {
          if (isDefined(value)) {
            result.push(encodeUnreserved(key));
          }
        } else if (value === "" && (operator === "&" || operator === "?")) {
          result.push(encodeUnreserved(key) + "=");
        } else if (value === "") {
          result.push("");
        }
      }
      return result;
    }
    function parseUrl(template) {
      return {
        expand: expand.bind(null, template)
      };
    }
    function expand(template, context) {
      var operators = ["+", "#", ".", "/", ";", "?", "&"];
      return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function(_, expression, literal) {
        if (expression) {
          let operator = "";
          const values = [];
          if (operators.indexOf(expression.charAt(0)) !== -1) {
            operator = expression.charAt(0);
            expression = expression.substr(1);
          }
          expression.split(/,/g).forEach(function(variable) {
            var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
            values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
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
          return encodeReserved(literal);
        }
      });
    }
    function parse(options) {
      let method = options.method.toUpperCase();
      let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
      let headers = Object.assign({}, options.headers);
      let body;
      let parameters = omit(options, ["method", "baseUrl", "url", "headers", "request", "mediaType"]);
      const urlVariableNames = extractUrlVariableNames(url);
      url = parseUrl(url).expand(parameters);
      if (!/^http/.test(url)) {
        url = options.baseUrl + url;
      }
      const omittedParameters = Object.keys(options).filter((option) => urlVariableNames.includes(option)).concat("baseUrl");
      const remainingParameters = omit(parameters, omittedParameters);
      const isBinaryRequest = /application\/octet-stream/i.test(headers.accept);
      if (!isBinaryRequest) {
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
    var VERSION = "6.0.12";
    var userAgent = `octokit-endpoint.js/${VERSION} ${universalUserAgent.getUserAgent()}`;
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
    Object.defineProperty(exports2, "__esModule", { value: true });
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
        const blob = new Blob([], { type: arguments[2] });
        blob[BUFFER] = slicedBuffer;
        return blob;
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
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
          const error = err.name === "AbortError" ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, "system", err);
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
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
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
        if (!res) {
          res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
          if (res) {
            res.pop();
          }
        }
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
      const obj = Object.assign({ __proto__: null }, headers[MAP]);
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
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
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
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
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
          let error = new AbortError("The user aborted a request.");
          reject(error);
          if (request.body && request.body instanceof Stream.Readable) {
            request.body.destroy(error);
          }
          if (!response || !response.body)
            return;
          response.body.emit("error", error);
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
                reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
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
                  timeout: request.timeout,
                  size: request.size
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
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.default = exports2;
    exports2.Headers = Headers;
    exports2.Request = Request;
    exports2.Response = Response;
    exports2.FetchError = FetchError;
  }
});

// node_modules/deprecation/dist-node/index.js
var require_dist_node3 = __commonJS({
  "node_modules/deprecation/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
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

// node_modules/@octokit/request-error/dist-node/index.js
var require_dist_node4 = __commonJS({
  "node_modules/@octokit/request-error/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var deprecation = require_dist_node3();
    var once = _interopDefault(require_once());
    var logOnceCode = once((deprecation2) => console.warn(deprecation2));
    var logOnceHeaders = once((deprecation2) => console.warn(deprecation2));
    var RequestError = class extends Error {
      constructor(message, statusCode, options) {
        super(message);
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
        this.name = "HttpError";
        this.status = statusCode;
        let headers;
        if ("headers" in options && typeof options.headers !== "undefined") {
          headers = options.headers;
        }
        if ("response" in options) {
          this.response = options.response;
          headers = options.response.headers;
        }
        const requestCopy = Object.assign({}, options.request);
        if (options.request.headers.authorization) {
          requestCopy.headers = Object.assign({}, options.request.headers, {
            authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]")
          });
        }
        requestCopy.url = requestCopy.url.replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]").replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
        this.request = requestCopy;
        Object.defineProperty(this, "code", {
          get() {
            logOnceCode(new deprecation.Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
            return statusCode;
          }
        });
        Object.defineProperty(this, "headers", {
          get() {
            logOnceHeaders(new deprecation.Deprecation("[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`."));
            return headers || {};
          }
        });
      }
    };
    exports2.RequestError = RequestError;
  }
});

// node_modules/@octokit/request/dist-node/index.js
var require_dist_node5 = __commonJS({
  "node_modules/@octokit/request/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function _interopDefault(ex) {
      return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
    }
    var endpoint = require_dist_node2();
    var universalUserAgent = require_dist_node();
    var isPlainObject = require_is_plain_object();
    var nodeFetch = _interopDefault(require_lib());
    var requestError = require_dist_node4();
    var VERSION = "5.6.0";
    function getBufferResponse(response) {
      return response.arrayBuffer();
    }
    function fetchWrapper(requestOptions) {
      const log = requestOptions.request && requestOptions.request.log ? requestOptions.request.log : console;
      if (isPlainObject.isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
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
      }, requestOptions.request)).then(async (response) => {
        url = response.url;
        status = response.status;
        for (const keyAndValue of response.headers) {
          headers[keyAndValue[0]] = keyAndValue[1];
        }
        if ("deprecation" in headers) {
          const matches = headers.link && headers.link.match(/<([^>]+)>; rel="deprecation"/);
          const deprecationLink = matches && matches.pop();
          log.warn(`[@octokit/request] "${requestOptions.method} ${requestOptions.url}" is deprecated. It is scheduled to be removed on ${headers.sunset}${deprecationLink ? `. See ${deprecationLink}` : ""}`);
        }
        if (status === 204 || status === 205) {
          return;
        }
        if (requestOptions.method === "HEAD") {
          if (status < 400) {
            return;
          }
          throw new requestError.RequestError(response.statusText, status, {
            response: {
              url,
              status,
              headers,
              data: void 0
            },
            request: requestOptions
          });
        }
        if (status === 304) {
          throw new requestError.RequestError("Not modified", status, {
            response: {
              url,
              status,
              headers,
              data: await getResponseData(response)
            },
            request: requestOptions
          });
        }
        if (status >= 400) {
          const data = await getResponseData(response);
          const error = new requestError.RequestError(toErrorMessage(data), status, {
            response: {
              url,
              status,
              headers,
              data
            },
            request: requestOptions
          });
          throw error;
        }
        return getResponseData(response);
      }).then((data) => {
        return {
          status,
          url,
          headers,
          data
        };
      }).catch((error) => {
        if (error instanceof requestError.RequestError)
          throw error;
        throw new requestError.RequestError(error.message, 500, {
          request: requestOptions
        });
      });
    }
    async function getResponseData(response) {
      const contentType = response.headers.get("content-type");
      if (/application\/json/.test(contentType)) {
        return response.json();
      }
      if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
        return response.text();
      }
      return getBufferResponse(response);
    }
    function toErrorMessage(data) {
      if (typeof data === "string")
        return data;
      if ("message" in data) {
        if (Array.isArray(data.errors)) {
          return `${data.message}: ${data.errors.map(JSON.stringify).join(", ")}`;
        }
        return data.message;
      }
      return `Unknown error: ${JSON.stringify(data)}`;
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
        "user-agent": `octokit-request.js/${VERSION} ${universalUserAgent.getUserAgent()}`
      }
    });
    exports2.request = request;
  }
});

// node_modules/@octokit/graphql/dist-node/index.js
var require_dist_node6 = __commonJS({
  "node_modules/@octokit/graphql/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var request = require_dist_node5();
    var universalUserAgent = require_dist_node();
    var VERSION = "4.6.4";
    var GraphqlError = class extends Error {
      constructor(request2, response) {
        const message = response.data.errors[0].message;
        super(message);
        Object.assign(this, response.data);
        Object.assign(this, {
          headers: response.headers
        });
        this.name = "GraphqlError";
        this.request = request2;
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
      }
    };
    var NON_VARIABLE_OPTIONS = ["method", "baseUrl", "url", "headers", "request", "query", "mediaType"];
    var FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"];
    var GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
    function graphql(request2, query, options) {
      if (options) {
        if (typeof query === "string" && "query" in options) {
          return Promise.reject(new Error(`[@octokit/graphql] "query" cannot be used as variable name`));
        }
        for (const key in options) {
          if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key))
            continue;
          return Promise.reject(new Error(`[@octokit/graphql] "${key}" cannot be used as variable name`));
        }
      }
      const parsedOptions = typeof query === "string" ? Object.assign({
        query
      }, options) : query;
      const requestOptions = Object.keys(parsedOptions).reduce((result, key) => {
        if (NON_VARIABLE_OPTIONS.includes(key)) {
          result[key] = parsedOptions[key];
          return result;
        }
        if (!result.variables) {
          result.variables = {};
        }
        result.variables[key] = parsedOptions[key];
        return result;
      }, {});
      const baseUrl = parsedOptions.baseUrl || request2.endpoint.DEFAULTS.baseUrl;
      if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
        requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
      }
      return request2(requestOptions).then((response) => {
        if (response.data.errors) {
          const headers = {};
          for (const key of Object.keys(response.headers)) {
            headers[key] = response.headers[key];
          }
          throw new GraphqlError(requestOptions, {
            headers,
            data: response.data
          });
        }
        return response.data.data;
      });
    }
    function withDefaults(request$1, newDefaults) {
      const newRequest = request$1.defaults(newDefaults);
      const newApi = (query, options) => {
        return graphql(newRequest, query, options);
      };
      return Object.assign(newApi, {
        defaults: withDefaults.bind(null, newRequest),
        endpoint: request.request.endpoint
      });
    }
    var graphql$1 = withDefaults(request.request, {
      headers: {
        "user-agent": `octokit-graphql.js/${VERSION} ${universalUserAgent.getUserAgent()}`
      },
      method: "POST",
      url: "/graphql"
    });
    function withCustomRequest(customRequest) {
      return withDefaults(customRequest, {
        method: "POST",
        url: "/graphql"
      });
    }
    exports2.graphql = graphql$1;
    exports2.withCustomRequest = withCustomRequest;
  }
});

// node_modules/@octokit/auth-token/dist-node/index.js
var require_dist_node7 = __commonJS({
  "node_modules/@octokit/auth-token/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    async function auth(token) {
      const tokenType = token.split(/\./).length === 3 ? "app" : /^v\d+\./.test(token) ? "installation" : "oauth";
      return {
        type: "token",
        token,
        tokenType
      };
    }
    function withAuthorizationPrefix(token) {
      if (token.split(/\./).length === 3) {
        return `bearer ${token}`;
      }
      return `token ${token}`;
    }
    async function hook(token, request, route, parameters) {
      const endpoint = request.endpoint.merge(route, parameters);
      endpoint.headers.authorization = withAuthorizationPrefix(token);
      return request(endpoint);
    }
    var createTokenAuth = function createTokenAuth2(token) {
      if (!token) {
        throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
      }
      if (typeof token !== "string") {
        throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
      }
      token = token.replace(/^(token|bearer) +/i, "");
      return Object.assign(auth.bind(null, token), {
        hook: hook.bind(null, token)
      });
    };
    exports2.createTokenAuth = createTokenAuth;
  }
});

// node_modules/@octokit/core/dist-node/index.js
var require_dist_node8 = __commonJS({
  "node_modules/@octokit/core/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var universalUserAgent = require_dist_node();
    var beforeAfterHook = require_before_after_hook();
    var request = require_dist_node5();
    var graphql = require_dist_node6();
    var authToken = require_dist_node7();
    function _objectWithoutPropertiesLoose(source, excluded) {
      if (source == null)
        return {};
      var target = {};
      var sourceKeys = Object.keys(source);
      var key, i;
      for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0)
          continue;
        target[key] = source[key];
      }
      return target;
    }
    function _objectWithoutProperties(source, excluded) {
      if (source == null)
        return {};
      var target = _objectWithoutPropertiesLoose(source, excluded);
      var key, i;
      if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for (i = 0; i < sourceSymbolKeys.length; i++) {
          key = sourceSymbolKeys[i];
          if (excluded.indexOf(key) >= 0)
            continue;
          if (!Object.prototype.propertyIsEnumerable.call(source, key))
            continue;
          target[key] = source[key];
        }
      }
      return target;
    }
    var VERSION = "3.5.1";
    var _excluded = ["authStrategy"];
    var Octokit = class {
      constructor(options = {}) {
        const hook = new beforeAfterHook.Collection();
        const requestDefaults = {
          baseUrl: request.request.endpoint.DEFAULTS.baseUrl,
          headers: {},
          request: Object.assign({}, options.request, {
            hook: hook.bind(null, "request")
          }),
          mediaType: {
            previews: [],
            format: ""
          }
        };
        requestDefaults.headers["user-agent"] = [options.userAgent, `octokit-core.js/${VERSION} ${universalUserAgent.getUserAgent()}`].filter(Boolean).join(" ");
        if (options.baseUrl) {
          requestDefaults.baseUrl = options.baseUrl;
        }
        if (options.previews) {
          requestDefaults.mediaType.previews = options.previews;
        }
        if (options.timeZone) {
          requestDefaults.headers["time-zone"] = options.timeZone;
        }
        this.request = request.request.defaults(requestDefaults);
        this.graphql = graphql.withCustomRequest(this.request).defaults(requestDefaults);
        this.log = Object.assign({
          debug: () => {
          },
          info: () => {
          },
          warn: console.warn.bind(console),
          error: console.error.bind(console)
        }, options.log);
        this.hook = hook;
        if (!options.authStrategy) {
          if (!options.auth) {
            this.auth = async () => ({
              type: "unauthenticated"
            });
          } else {
            const auth = authToken.createTokenAuth(options.auth);
            hook.wrap("request", auth.hook);
            this.auth = auth;
          }
        } else {
          const {
            authStrategy
          } = options, otherOptions = _objectWithoutProperties(options, _excluded);
          const auth = authStrategy(Object.assign({
            request: this.request,
            log: this.log,
            octokit: this,
            octokitOptions: otherOptions
          }, options.auth));
          hook.wrap("request", auth.hook);
          this.auth = auth;
        }
        const classConstructor = this.constructor;
        classConstructor.plugins.forEach((plugin) => {
          Object.assign(this, plugin(this, options));
        });
      }
      static defaults(defaults) {
        const OctokitWithDefaults = class extends this {
          constructor(...args) {
            const options = args[0] || {};
            if (typeof defaults === "function") {
              super(defaults(options));
              return;
            }
            super(Object.assign({}, defaults, options, options.userAgent && defaults.userAgent ? {
              userAgent: `${options.userAgent} ${defaults.userAgent}`
            } : null));
          }
        };
        return OctokitWithDefaults;
      }
      static plugin(...newPlugins) {
        var _a;
        const currentPlugins = this.plugins;
        const NewOctokit = (_a = class extends this {
        }, _a.plugins = currentPlugins.concat(newPlugins.filter((plugin) => !currentPlugins.includes(plugin))), _a);
        return NewOctokit;
      }
    };
    Octokit.VERSION = VERSION;
    Octokit.plugins = [];
    exports2.Octokit = Octokit;
  }
});

// node_modules/@octokit/plugin-rest-endpoint-methods/dist-node/index.js
var require_dist_node9 = __commonJS({
  "node_modules/@octokit/plugin-rest-endpoint-methods/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
          symbols = symbols.filter(function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          });
        }
        keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        if (i % 2) {
          ownKeys(Object(source), true).forEach(function(key) {
            _defineProperty(target, key, source[key]);
          });
        } else if (Object.getOwnPropertyDescriptors) {
          Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
          ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    var Endpoints = {
      actions: {
        addSelectedRepoToOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
        approveWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve"],
        cancelWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"],
        createOrUpdateEnvironmentSecret: ["PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}"],
        createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
        createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
        createRegistrationTokenForOrg: ["POST /orgs/{org}/actions/runners/registration-token"],
        createRegistrationTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/registration-token"],
        createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
        createRemoveTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/remove-token"],
        createWorkflowDispatch: ["POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"],
        deleteArtifact: ["DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
        deleteEnvironmentSecret: ["DELETE /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}"],
        deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
        deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
        deleteSelfHostedRunnerFromOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}"],
        deleteSelfHostedRunnerFromRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"],
        deleteWorkflowRun: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],
        deleteWorkflowRunLogs: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
        disableSelectedRepositoryGithubActionsOrganization: ["DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}"],
        disableWorkflow: ["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable"],
        downloadArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}"],
        downloadJobLogsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"],
        downloadWorkflowRunLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
        enableSelectedRepositoryGithubActionsOrganization: ["PUT /orgs/{org}/actions/permissions/repositories/{repository_id}"],
        enableWorkflow: ["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable"],
        getAllowedActionsOrganization: ["GET /orgs/{org}/actions/permissions/selected-actions"],
        getAllowedActionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions/selected-actions"],
        getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
        getEnvironmentPublicKey: ["GET /repositories/{repository_id}/environments/{environment_name}/secrets/public-key"],
        getEnvironmentSecret: ["GET /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}"],
        getGithubActionsPermissionsOrganization: ["GET /orgs/{org}/actions/permissions"],
        getGithubActionsPermissionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions"],
        getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
        getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
        getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
        getPendingDeploymentsForRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"],
        getRepoPermissions: ["GET /repos/{owner}/{repo}/actions/permissions", {}, {
          renamed: ["actions", "getGithubActionsPermissionsRepository"]
        }],
        getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
        getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
        getReviewsForRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals"],
        getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
        getSelfHostedRunnerForRepo: ["GET /repos/{owner}/{repo}/actions/runners/{runner_id}"],
        getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
        getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
        getWorkflowRunUsage: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"],
        getWorkflowUsage: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"],
        listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
        listEnvironmentSecrets: ["GET /repositories/{repository_id}/environments/{environment_name}/secrets"],
        listJobsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"],
        listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
        listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
        listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
        listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
        listRunnerApplicationsForRepo: ["GET /repos/{owner}/{repo}/actions/runners/downloads"],
        listSelectedReposForOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}/repositories"],
        listSelectedRepositoriesEnabledGithubActionsOrganization: ["GET /orgs/{org}/actions/permissions/repositories"],
        listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
        listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
        listWorkflowRunArtifacts: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"],
        listWorkflowRuns: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"],
        listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
        reRunWorkflow: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun"],
        removeSelectedRepoFromOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
        reviewPendingDeploymentsForRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"],
        setAllowedActionsOrganization: ["PUT /orgs/{org}/actions/permissions/selected-actions"],
        setAllowedActionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions/selected-actions"],
        setGithubActionsPermissionsOrganization: ["PUT /orgs/{org}/actions/permissions"],
        setGithubActionsPermissionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions"],
        setSelectedReposForOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"],
        setSelectedRepositoriesEnabledGithubActionsOrganization: ["PUT /orgs/{org}/actions/permissions/repositories"]
      },
      activity: {
        checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
        deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
        deleteThreadSubscription: ["DELETE /notifications/threads/{thread_id}/subscription"],
        getFeeds: ["GET /feeds"],
        getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
        getThread: ["GET /notifications/threads/{thread_id}"],
        getThreadSubscriptionForAuthenticatedUser: ["GET /notifications/threads/{thread_id}/subscription"],
        listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
        listNotificationsForAuthenticatedUser: ["GET /notifications"],
        listOrgEventsForAuthenticatedUser: ["GET /users/{username}/events/orgs/{org}"],
        listPublicEvents: ["GET /events"],
        listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
        listPublicEventsForUser: ["GET /users/{username}/events/public"],
        listPublicOrgEvents: ["GET /orgs/{org}/events"],
        listReceivedEventsForUser: ["GET /users/{username}/received_events"],
        listReceivedPublicEventsForUser: ["GET /users/{username}/received_events/public"],
        listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
        listRepoNotificationsForAuthenticatedUser: ["GET /repos/{owner}/{repo}/notifications"],
        listReposStarredByAuthenticatedUser: ["GET /user/starred"],
        listReposStarredByUser: ["GET /users/{username}/starred"],
        listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
        listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
        listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
        listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
        markNotificationsAsRead: ["PUT /notifications"],
        markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
        markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
        setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
        setThreadSubscription: ["PUT /notifications/threads/{thread_id}/subscription"],
        starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
        unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"]
      },
      apps: {
        addRepoToInstallation: ["PUT /user/installations/{installation_id}/repositories/{repository_id}"],
        checkToken: ["POST /applications/{client_id}/token"],
        createContentAttachment: ["POST /content_references/{content_reference_id}/attachments", {
          mediaType: {
            previews: ["corsair"]
          }
        }],
        createContentAttachmentForRepo: ["POST /repos/{owner}/{repo}/content_references/{content_reference_id}/attachments", {
          mediaType: {
            previews: ["corsair"]
          }
        }],
        createFromManifest: ["POST /app-manifests/{code}/conversions"],
        createInstallationAccessToken: ["POST /app/installations/{installation_id}/access_tokens"],
        deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
        deleteInstallation: ["DELETE /app/installations/{installation_id}"],
        deleteToken: ["DELETE /applications/{client_id}/token"],
        getAuthenticated: ["GET /app"],
        getBySlug: ["GET /apps/{app_slug}"],
        getInstallation: ["GET /app/installations/{installation_id}"],
        getOrgInstallation: ["GET /orgs/{org}/installation"],
        getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
        getSubscriptionPlanForAccount: ["GET /marketplace_listing/accounts/{account_id}"],
        getSubscriptionPlanForAccountStubbed: ["GET /marketplace_listing/stubbed/accounts/{account_id}"],
        getUserInstallation: ["GET /users/{username}/installation"],
        getWebhookConfigForApp: ["GET /app/hook/config"],
        getWebhookDelivery: ["GET /app/hook/deliveries/{delivery_id}"],
        listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
        listAccountsForPlanStubbed: ["GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"],
        listInstallationReposForAuthenticatedUser: ["GET /user/installations/{installation_id}/repositories"],
        listInstallations: ["GET /app/installations"],
        listInstallationsForAuthenticatedUser: ["GET /user/installations"],
        listPlans: ["GET /marketplace_listing/plans"],
        listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
        listReposAccessibleToInstallation: ["GET /installation/repositories"],
        listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
        listSubscriptionsForAuthenticatedUserStubbed: ["GET /user/marketplace_purchases/stubbed"],
        listWebhookDeliveries: ["GET /app/hook/deliveries"],
        redeliverWebhookDelivery: ["POST /app/hook/deliveries/{delivery_id}/attempts"],
        removeRepoFromInstallation: ["DELETE /user/installations/{installation_id}/repositories/{repository_id}"],
        resetToken: ["PATCH /applications/{client_id}/token"],
        revokeInstallationAccessToken: ["DELETE /installation/token"],
        scopeToken: ["POST /applications/{client_id}/token/scoped"],
        suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
        unsuspendInstallation: ["DELETE /app/installations/{installation_id}/suspended"],
        updateWebhookConfigForApp: ["PATCH /app/hook/config"]
      },
      billing: {
        getGithubActionsBillingOrg: ["GET /orgs/{org}/settings/billing/actions"],
        getGithubActionsBillingUser: ["GET /users/{username}/settings/billing/actions"],
        getGithubPackagesBillingOrg: ["GET /orgs/{org}/settings/billing/packages"],
        getGithubPackagesBillingUser: ["GET /users/{username}/settings/billing/packages"],
        getSharedStorageBillingOrg: ["GET /orgs/{org}/settings/billing/shared-storage"],
        getSharedStorageBillingUser: ["GET /users/{username}/settings/billing/shared-storage"]
      },
      checks: {
        create: ["POST /repos/{owner}/{repo}/check-runs"],
        createSuite: ["POST /repos/{owner}/{repo}/check-suites"],
        get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}"],
        getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}"],
        listAnnotations: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations"],
        listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"],
        listForSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs"],
        listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites"],
        rerequestSuite: ["POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest"],
        setSuitesPreferences: ["PATCH /repos/{owner}/{repo}/check-suites/preferences"],
        update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}"]
      },
      codeScanning: {
        deleteAnalysis: ["DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}{?confirm_delete}"],
        getAlert: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}", {}, {
          renamedParameters: {
            alert_id: "alert_number"
          }
        }],
        getAnalysis: ["GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}"],
        getSarif: ["GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}"],
        listAlertInstances: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances"],
        listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"],
        listAlertsInstances: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances", {}, {
          renamed: ["codeScanning", "listAlertInstances"]
        }],
        listRecentAnalyses: ["GET /repos/{owner}/{repo}/code-scanning/analyses"],
        updateAlert: ["PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}"],
        uploadSarif: ["POST /repos/{owner}/{repo}/code-scanning/sarifs"]
      },
      codesOfConduct: {
        getAllCodesOfConduct: ["GET /codes_of_conduct"],
        getConductCode: ["GET /codes_of_conduct/{key}"],
        getForRepo: ["GET /repos/{owner}/{repo}/community/code_of_conduct", {
          mediaType: {
            previews: ["scarlet-witch"]
          }
        }]
      },
      emojis: {
        get: ["GET /emojis"]
      },
      enterpriseAdmin: {
        disableSelectedOrganizationGithubActionsEnterprise: ["DELETE /enterprises/{enterprise}/actions/permissions/organizations/{org_id}"],
        enableSelectedOrganizationGithubActionsEnterprise: ["PUT /enterprises/{enterprise}/actions/permissions/organizations/{org_id}"],
        getAllowedActionsEnterprise: ["GET /enterprises/{enterprise}/actions/permissions/selected-actions"],
        getGithubActionsPermissionsEnterprise: ["GET /enterprises/{enterprise}/actions/permissions"],
        listSelectedOrganizationsEnabledGithubActionsEnterprise: ["GET /enterprises/{enterprise}/actions/permissions/organizations"],
        setAllowedActionsEnterprise: ["PUT /enterprises/{enterprise}/actions/permissions/selected-actions"],
        setGithubActionsPermissionsEnterprise: ["PUT /enterprises/{enterprise}/actions/permissions"],
        setSelectedOrganizationsEnabledGithubActionsEnterprise: ["PUT /enterprises/{enterprise}/actions/permissions/organizations"]
      },
      gists: {
        checkIsStarred: ["GET /gists/{gist_id}/star"],
        create: ["POST /gists"],
        createComment: ["POST /gists/{gist_id}/comments"],
        delete: ["DELETE /gists/{gist_id}"],
        deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
        fork: ["POST /gists/{gist_id}/forks"],
        get: ["GET /gists/{gist_id}"],
        getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
        getRevision: ["GET /gists/{gist_id}/{sha}"],
        list: ["GET /gists"],
        listComments: ["GET /gists/{gist_id}/comments"],
        listCommits: ["GET /gists/{gist_id}/commits"],
        listForUser: ["GET /users/{username}/gists"],
        listForks: ["GET /gists/{gist_id}/forks"],
        listPublic: ["GET /gists/public"],
        listStarred: ["GET /gists/starred"],
        star: ["PUT /gists/{gist_id}/star"],
        unstar: ["DELETE /gists/{gist_id}/star"],
        update: ["PATCH /gists/{gist_id}"],
        updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"]
      },
      git: {
        createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
        createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
        createRef: ["POST /repos/{owner}/{repo}/git/refs"],
        createTag: ["POST /repos/{owner}/{repo}/git/tags"],
        createTree: ["POST /repos/{owner}/{repo}/git/trees"],
        deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
        getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
        getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
        getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
        getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
        getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
        listMatchingRefs: ["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],
        updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"]
      },
      gitignore: {
        getAllTemplates: ["GET /gitignore/templates"],
        getTemplate: ["GET /gitignore/templates/{name}"]
      },
      interactions: {
        getRestrictionsForAuthenticatedUser: ["GET /user/interaction-limits"],
        getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits"],
        getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits"],
        getRestrictionsForYourPublicRepos: ["GET /user/interaction-limits", {}, {
          renamed: ["interactions", "getRestrictionsForAuthenticatedUser"]
        }],
        removeRestrictionsForAuthenticatedUser: ["DELETE /user/interaction-limits"],
        removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits"],
        removeRestrictionsForRepo: ["DELETE /repos/{owner}/{repo}/interaction-limits"],
        removeRestrictionsForYourPublicRepos: ["DELETE /user/interaction-limits", {}, {
          renamed: ["interactions", "removeRestrictionsForAuthenticatedUser"]
        }],
        setRestrictionsForAuthenticatedUser: ["PUT /user/interaction-limits"],
        setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits"],
        setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits"],
        setRestrictionsForYourPublicRepos: ["PUT /user/interaction-limits", {}, {
          renamed: ["interactions", "setRestrictionsForAuthenticatedUser"]
        }]
      },
      issues: {
        addAssignees: ["POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
        addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
        checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
        create: ["POST /repos/{owner}/{repo}/issues"],
        createComment: ["POST /repos/{owner}/{repo}/issues/{issue_number}/comments"],
        createLabel: ["POST /repos/{owner}/{repo}/labels"],
        createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
        deleteComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"],
        deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
        deleteMilestone: ["DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"],
        get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
        getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
        getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
        getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
        getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
        list: ["GET /issues"],
        listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
        listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
        listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
        listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
        listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
        listEventsForTimeline: ["GET /repos/{owner}/{repo}/issues/{issue_number}/timeline", {
          mediaType: {
            previews: ["mockingbird"]
          }
        }],
        listForAuthenticatedUser: ["GET /user/issues"],
        listForOrg: ["GET /orgs/{org}/issues"],
        listForRepo: ["GET /repos/{owner}/{repo}/issues"],
        listLabelsForMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"],
        listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
        listLabelsOnIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/labels"],
        listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
        lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
        removeAllLabels: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"],
        removeAssignees: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
        removeLabel: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"],
        setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
        unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
        update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
        updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
        updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
        updateMilestone: ["PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"]
      },
      licenses: {
        get: ["GET /licenses/{license}"],
        getAllCommonlyUsed: ["GET /licenses"],
        getForRepo: ["GET /repos/{owner}/{repo}/license"]
      },
      markdown: {
        render: ["POST /markdown"],
        renderRaw: ["POST /markdown/raw", {
          headers: {
            "content-type": "text/plain; charset=utf-8"
          }
        }]
      },
      meta: {
        get: ["GET /meta"],
        getOctocat: ["GET /octocat"],
        getZen: ["GET /zen"],
        root: ["GET /"]
      },
      migrations: {
        cancelImport: ["DELETE /repos/{owner}/{repo}/import"],
        deleteArchiveForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/archive", {
          mediaType: {
            previews: ["wyandotte"]
          }
        }],
        deleteArchiveForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/archive", {
          mediaType: {
            previews: ["wyandotte"]
          }
        }],
        downloadArchiveForOrg: ["GET /orgs/{org}/migrations/{migration_id}/archive", {
          mediaType: {
            previews: ["wyandotte"]
          }
        }],
        getArchiveForAuthenticatedUser: ["GET /user/migrations/{migration_id}/archive", {
          mediaType: {
            previews: ["wyandotte"]
          }
        }],
        getCommitAuthors: ["GET /repos/{owner}/{repo}/import/authors"],
        getImportStatus: ["GET /repos/{owner}/{repo}/import"],
        getLargeFiles: ["GET /repos/{owner}/{repo}/import/large_files"],
        getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}", {
          mediaType: {
            previews: ["wyandotte"]
          }
        }],
        getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}", {
          mediaType: {
            previews: ["wyandotte"]
          }
        }],
        listForAuthenticatedUser: ["GET /user/migrations", {
          mediaType: {
            previews: ["wyandotte"]
          }
        }],
        listForOrg: ["GET /orgs/{org}/migrations", {
          mediaType: {
            previews: ["wyandotte"]
          }
        }],
        listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories", {
          mediaType: {
            previews: ["wyandotte"]
          }
        }],
        listReposForUser: ["GET /user/migrations/{migration_id}/repositories", {
          mediaType: {
            previews: ["wyandotte"]
          }
        }],
        mapCommitAuthor: ["PATCH /repos/{owner}/{repo}/import/authors/{author_id}"],
        setLfsPreference: ["PATCH /repos/{owner}/{repo}/import/lfs"],
        startForAuthenticatedUser: ["POST /user/migrations"],
        startForOrg: ["POST /orgs/{org}/migrations"],
        startImport: ["PUT /repos/{owner}/{repo}/import"],
        unlockRepoForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock", {
          mediaType: {
            previews: ["wyandotte"]
          }
        }],
        unlockRepoForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock", {
          mediaType: {
            previews: ["wyandotte"]
          }
        }],
        updateImport: ["PATCH /repos/{owner}/{repo}/import"]
      },
      orgs: {
        blockUser: ["PUT /orgs/{org}/blocks/{username}"],
        cancelInvitation: ["DELETE /orgs/{org}/invitations/{invitation_id}"],
        checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
        checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
        checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
        convertMemberToOutsideCollaborator: ["PUT /orgs/{org}/outside_collaborators/{username}"],
        createInvitation: ["POST /orgs/{org}/invitations"],
        createWebhook: ["POST /orgs/{org}/hooks"],
        deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
        get: ["GET /orgs/{org}"],
        getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
        getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
        getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
        getWebhookConfigForOrg: ["GET /orgs/{org}/hooks/{hook_id}/config"],
        getWebhookDelivery: ["GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}"],
        list: ["GET /organizations"],
        listAppInstallations: ["GET /orgs/{org}/installations"],
        listBlockedUsers: ["GET /orgs/{org}/blocks"],
        listFailedInvitations: ["GET /orgs/{org}/failed_invitations"],
        listForAuthenticatedUser: ["GET /user/orgs"],
        listForUser: ["GET /users/{username}/orgs"],
        listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
        listMembers: ["GET /orgs/{org}/members"],
        listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
        listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
        listPendingInvitations: ["GET /orgs/{org}/invitations"],
        listPublicMembers: ["GET /orgs/{org}/public_members"],
        listWebhookDeliveries: ["GET /orgs/{org}/hooks/{hook_id}/deliveries"],
        listWebhooks: ["GET /orgs/{org}/hooks"],
        pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
        redeliverWebhookDelivery: ["POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"],
        removeMember: ["DELETE /orgs/{org}/members/{username}"],
        removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
        removeOutsideCollaborator: ["DELETE /orgs/{org}/outside_collaborators/{username}"],
        removePublicMembershipForAuthenticatedUser: ["DELETE /orgs/{org}/public_members/{username}"],
        setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
        setPublicMembershipForAuthenticatedUser: ["PUT /orgs/{org}/public_members/{username}"],
        unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
        update: ["PATCH /orgs/{org}"],
        updateMembershipForAuthenticatedUser: ["PATCH /user/memberships/orgs/{org}"],
        updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"],
        updateWebhookConfigForOrg: ["PATCH /orgs/{org}/hooks/{hook_id}/config"]
      },
      packages: {
        deletePackageForAuthenticatedUser: ["DELETE /user/packages/{package_type}/{package_name}"],
        deletePackageForOrg: ["DELETE /orgs/{org}/packages/{package_type}/{package_name}"],
        deletePackageVersionForAuthenticatedUser: ["DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}"],
        deletePackageVersionForOrg: ["DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
        getAllPackageVersionsForAPackageOwnedByAnOrg: ["GET /orgs/{org}/packages/{package_type}/{package_name}/versions", {}, {
          renamed: ["packages", "getAllPackageVersionsForPackageOwnedByOrg"]
        }],
        getAllPackageVersionsForAPackageOwnedByTheAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}/versions", {}, {
          renamed: ["packages", "getAllPackageVersionsForPackageOwnedByAuthenticatedUser"]
        }],
        getAllPackageVersionsForPackageOwnedByAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}/versions"],
        getAllPackageVersionsForPackageOwnedByOrg: ["GET /orgs/{org}/packages/{package_type}/{package_name}/versions"],
        getAllPackageVersionsForPackageOwnedByUser: ["GET /users/{username}/packages/{package_type}/{package_name}/versions"],
        getPackageForAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}"],
        getPackageForOrganization: ["GET /orgs/{org}/packages/{package_type}/{package_name}"],
        getPackageForUser: ["GET /users/{username}/packages/{package_type}/{package_name}"],
        getPackageVersionForAuthenticatedUser: ["GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}"],
        getPackageVersionForOrganization: ["GET /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
        getPackageVersionForUser: ["GET /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"],
        restorePackageForAuthenticatedUser: ["POST /user/packages/{package_type}/{package_name}/restore{?token}"],
        restorePackageForOrg: ["POST /orgs/{org}/packages/{package_type}/{package_name}/restore{?token}"],
        restorePackageVersionForAuthenticatedUser: ["POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"],
        restorePackageVersionForOrg: ["POST /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"]
      },
      projects: {
        addCollaborator: ["PUT /projects/{project_id}/collaborators/{username}", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        createCard: ["POST /projects/columns/{column_id}/cards", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        createColumn: ["POST /projects/{project_id}/columns", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        createForAuthenticatedUser: ["POST /user/projects", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        createForOrg: ["POST /orgs/{org}/projects", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        createForRepo: ["POST /repos/{owner}/{repo}/projects", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        delete: ["DELETE /projects/{project_id}", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        deleteCard: ["DELETE /projects/columns/cards/{card_id}", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        deleteColumn: ["DELETE /projects/columns/{column_id}", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        get: ["GET /projects/{project_id}", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        getCard: ["GET /projects/columns/cards/{card_id}", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        getColumn: ["GET /projects/columns/{column_id}", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        getPermissionForUser: ["GET /projects/{project_id}/collaborators/{username}/permission", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        listCards: ["GET /projects/columns/{column_id}/cards", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        listCollaborators: ["GET /projects/{project_id}/collaborators", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        listColumns: ["GET /projects/{project_id}/columns", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        listForOrg: ["GET /orgs/{org}/projects", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        listForRepo: ["GET /repos/{owner}/{repo}/projects", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        listForUser: ["GET /users/{username}/projects", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        moveCard: ["POST /projects/columns/cards/{card_id}/moves", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        moveColumn: ["POST /projects/columns/{column_id}/moves", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        removeCollaborator: ["DELETE /projects/{project_id}/collaborators/{username}", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        update: ["PATCH /projects/{project_id}", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        updateCard: ["PATCH /projects/columns/cards/{card_id}", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        updateColumn: ["PATCH /projects/columns/{column_id}", {
          mediaType: {
            previews: ["inertia"]
          }
        }]
      },
      pulls: {
        checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
        create: ["POST /repos/{owner}/{repo}/pulls"],
        createReplyForReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies"],
        createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
        createReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
        deletePendingReview: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
        deleteReviewComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
        dismissReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals"],
        get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
        getReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
        getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
        list: ["GET /repos/{owner}/{repo}/pulls"],
        listCommentsForReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments"],
        listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
        listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
        listRequestedReviewers: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
        listReviewComments: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
        listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
        listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
        merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
        removeRequestedReviewers: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
        requestReviewers: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
        submitReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"],
        update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
        updateBranch: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch", {
          mediaType: {
            previews: ["lydian"]
          }
        }],
        updateReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
        updateReviewComment: ["PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"]
      },
      rateLimit: {
        get: ["GET /rate_limit"]
      },
      reactions: {
        createForCommitComment: ["POST /repos/{owner}/{repo}/comments/{comment_id}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        createForIssue: ["POST /repos/{owner}/{repo}/issues/{issue_number}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        createForIssueComment: ["POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        createForPullRequestReviewComment: ["POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        createForRelease: ["POST /repos/{owner}/{repo}/releases/{release_id}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        createForTeamDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        createForTeamDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        deleteForCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        deleteForIssue: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        deleteForIssueComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        deleteForPullRequestComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        deleteForTeamDiscussion: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        deleteForTeamDiscussionComment: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        deleteLegacy: ["DELETE /reactions/{reaction_id}", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }, {
          deprecated: "octokit.rest.reactions.deleteLegacy() is deprecated, see https://docs.github.com/rest/reference/reactions/#delete-a-reaction-legacy"
        }],
        listForCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        listForIssueComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        listForPullRequestReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        listForTeamDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }],
        listForTeamDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions", {
          mediaType: {
            previews: ["squirrel-girl"]
          }
        }]
      },
      repos: {
        acceptInvitation: ["PATCH /user/repository_invitations/{invitation_id}"],
        addAppAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
          mapToData: "apps"
        }],
        addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
        addStatusCheckContexts: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
          mapToData: "contexts"
        }],
        addTeamAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
          mapToData: "teams"
        }],
        addUserAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
          mapToData: "users"
        }],
        checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
        checkVulnerabilityAlerts: ["GET /repos/{owner}/{repo}/vulnerability-alerts", {
          mediaType: {
            previews: ["dorian"]
          }
        }],
        compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
        compareCommitsWithBasehead: ["GET /repos/{owner}/{repo}/compare/{basehead}"],
        createCommitComment: ["POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
        createCommitSignatureProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
          mediaType: {
            previews: ["zzzax"]
          }
        }],
        createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
        createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
        createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
        createDeploymentStatus: ["POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
        createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
        createForAuthenticatedUser: ["POST /user/repos"],
        createFork: ["POST /repos/{owner}/{repo}/forks"],
        createInOrg: ["POST /orgs/{org}/repos"],
        createOrUpdateEnvironment: ["PUT /repos/{owner}/{repo}/environments/{environment_name}"],
        createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
        createPagesSite: ["POST /repos/{owner}/{repo}/pages", {
          mediaType: {
            previews: ["switcheroo"]
          }
        }],
        createRelease: ["POST /repos/{owner}/{repo}/releases"],
        createUsingTemplate: ["POST /repos/{template_owner}/{template_repo}/generate", {
          mediaType: {
            previews: ["baptiste"]
          }
        }],
        createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
        declineInvitation: ["DELETE /user/repository_invitations/{invitation_id}"],
        delete: ["DELETE /repos/{owner}/{repo}"],
        deleteAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
        deleteAdminBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
        deleteAnEnvironment: ["DELETE /repos/{owner}/{repo}/environments/{environment_name}"],
        deleteBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"],
        deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
        deleteCommitSignatureProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
          mediaType: {
            previews: ["zzzax"]
          }
        }],
        deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
        deleteDeployment: ["DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"],
        deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
        deleteInvitation: ["DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"],
        deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages", {
          mediaType: {
            previews: ["switcheroo"]
          }
        }],
        deletePullRequestReviewProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
        deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
        deleteReleaseAsset: ["DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"],
        deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
        disableAutomatedSecurityFixes: ["DELETE /repos/{owner}/{repo}/automated-security-fixes", {
          mediaType: {
            previews: ["london"]
          }
        }],
        disableVulnerabilityAlerts: ["DELETE /repos/{owner}/{repo}/vulnerability-alerts", {
          mediaType: {
            previews: ["dorian"]
          }
        }],
        downloadArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}", {}, {
          renamed: ["repos", "downloadZipballArchive"]
        }],
        downloadTarballArchive: ["GET /repos/{owner}/{repo}/tarball/{ref}"],
        downloadZipballArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}"],
        enableAutomatedSecurityFixes: ["PUT /repos/{owner}/{repo}/automated-security-fixes", {
          mediaType: {
            previews: ["london"]
          }
        }],
        enableVulnerabilityAlerts: ["PUT /repos/{owner}/{repo}/vulnerability-alerts", {
          mediaType: {
            previews: ["dorian"]
          }
        }],
        get: ["GET /repos/{owner}/{repo}"],
        getAccessRestrictions: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
        getAdminBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
        getAllEnvironments: ["GET /repos/{owner}/{repo}/environments"],
        getAllStatusCheckContexts: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts"],
        getAllTopics: ["GET /repos/{owner}/{repo}/topics", {
          mediaType: {
            previews: ["mercy"]
          }
        }],
        getAppsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps"],
        getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
        getBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection"],
        getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
        getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
        getCollaboratorPermissionLevel: ["GET /repos/{owner}/{repo}/collaborators/{username}/permission"],
        getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
        getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
        getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
        getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
        getCommitSignatureProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
          mediaType: {
            previews: ["zzzax"]
          }
        }],
        getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile"],
        getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
        getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
        getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
        getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
        getDeploymentStatus: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}"],
        getEnvironment: ["GET /repos/{owner}/{repo}/environments/{environment_name}"],
        getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
        getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
        getPages: ["GET /repos/{owner}/{repo}/pages"],
        getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
        getPagesHealthCheck: ["GET /repos/{owner}/{repo}/pages/health"],
        getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
        getPullRequestReviewProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
        getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
        getReadme: ["GET /repos/{owner}/{repo}/readme"],
        getReadmeInDirectory: ["GET /repos/{owner}/{repo}/readme/{dir}"],
        getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
        getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
        getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
        getStatusChecksProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
        getTeamsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams"],
        getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
        getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
        getUsersWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users"],
        getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
        getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
        getWebhookConfigForRepo: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/config"],
        getWebhookDelivery: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}"],
        listBranches: ["GET /repos/{owner}/{repo}/branches"],
        listBranchesForHeadCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head", {
          mediaType: {
            previews: ["groot"]
          }
        }],
        listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
        listCommentsForCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
        listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
        listCommitStatusesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/statuses"],
        listCommits: ["GET /repos/{owner}/{repo}/commits"],
        listContributors: ["GET /repos/{owner}/{repo}/contributors"],
        listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
        listDeploymentStatuses: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
        listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
        listForAuthenticatedUser: ["GET /user/repos"],
        listForOrg: ["GET /orgs/{org}/repos"],
        listForUser: ["GET /users/{username}/repos"],
        listForks: ["GET /repos/{owner}/{repo}/forks"],
        listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
        listInvitationsForAuthenticatedUser: ["GET /user/repository_invitations"],
        listLanguages: ["GET /repos/{owner}/{repo}/languages"],
        listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
        listPublic: ["GET /repositories"],
        listPullRequestsAssociatedWithCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls", {
          mediaType: {
            previews: ["groot"]
          }
        }],
        listReleaseAssets: ["GET /repos/{owner}/{repo}/releases/{release_id}/assets"],
        listReleases: ["GET /repos/{owner}/{repo}/releases"],
        listTags: ["GET /repos/{owner}/{repo}/tags"],
        listTeams: ["GET /repos/{owner}/{repo}/teams"],
        listWebhookDeliveries: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries"],
        listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
        merge: ["POST /repos/{owner}/{repo}/merges"],
        pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
        redeliverWebhookDelivery: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"],
        removeAppAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
          mapToData: "apps"
        }],
        removeCollaborator: ["DELETE /repos/{owner}/{repo}/collaborators/{username}"],
        removeStatusCheckContexts: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
          mapToData: "contexts"
        }],
        removeStatusCheckProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
        removeTeamAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
          mapToData: "teams"
        }],
        removeUserAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
          mapToData: "users"
        }],
        renameBranch: ["POST /repos/{owner}/{repo}/branches/{branch}/rename"],
        replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics", {
          mediaType: {
            previews: ["mercy"]
          }
        }],
        requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
        setAdminBranchProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
        setAppAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
          mapToData: "apps"
        }],
        setStatusCheckContexts: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
          mapToData: "contexts"
        }],
        setTeamAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
          mapToData: "teams"
        }],
        setUserAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
          mapToData: "users"
        }],
        testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
        transfer: ["POST /repos/{owner}/{repo}/transfer"],
        update: ["PATCH /repos/{owner}/{repo}"],
        updateBranchProtection: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection"],
        updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
        updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
        updateInvitation: ["PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"],
        updatePullRequestReviewProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
        updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
        updateReleaseAsset: ["PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"],
        updateStatusCheckPotection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks", {}, {
          renamed: ["repos", "updateStatusCheckProtection"]
        }],
        updateStatusCheckProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
        updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
        updateWebhookConfigForRepo: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config"],
        uploadReleaseAsset: ["POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}", {
          baseUrl: "https://uploads.github.com"
        }]
      },
      search: {
        code: ["GET /search/code"],
        commits: ["GET /search/commits", {
          mediaType: {
            previews: ["cloak"]
          }
        }],
        issuesAndPullRequests: ["GET /search/issues"],
        labels: ["GET /search/labels"],
        repos: ["GET /search/repositories"],
        topics: ["GET /search/topics", {
          mediaType: {
            previews: ["mercy"]
          }
        }],
        users: ["GET /search/users"]
      },
      secretScanning: {
        getAlert: ["GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"],
        listAlertsForRepo: ["GET /repos/{owner}/{repo}/secret-scanning/alerts"],
        updateAlert: ["PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"]
      },
      teams: {
        addOrUpdateMembershipForUserInOrg: ["PUT /orgs/{org}/teams/{team_slug}/memberships/{username}"],
        addOrUpdateProjectPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        addOrUpdateRepoPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
        checkPermissionsForProjectInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects/{project_id}", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        checkPermissionsForRepoInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
        create: ["POST /orgs/{org}/teams"],
        createDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
        createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
        deleteDiscussionCommentInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
        deleteDiscussionInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
        deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
        getByName: ["GET /orgs/{org}/teams/{team_slug}"],
        getDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
        getDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
        getMembershipForUserInOrg: ["GET /orgs/{org}/teams/{team_slug}/memberships/{username}"],
        list: ["GET /orgs/{org}/teams"],
        listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
        listDiscussionCommentsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
        listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
        listForAuthenticatedUser: ["GET /user/teams"],
        listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
        listPendingInvitationsInOrg: ["GET /orgs/{org}/teams/{team_slug}/invitations"],
        listProjectsInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects", {
          mediaType: {
            previews: ["inertia"]
          }
        }],
        listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
        removeMembershipForUserInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"],
        removeProjectInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/projects/{project_id}"],
        removeRepoInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
        updateDiscussionCommentInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
        updateDiscussionInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
        updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"]
      },
      users: {
        addEmailForAuthenticated: ["POST /user/emails"],
        block: ["PUT /user/blocks/{username}"],
        checkBlocked: ["GET /user/blocks/{username}"],
        checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
        checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
        createGpgKeyForAuthenticated: ["POST /user/gpg_keys"],
        createPublicSshKeyForAuthenticated: ["POST /user/keys"],
        deleteEmailForAuthenticated: ["DELETE /user/emails"],
        deleteGpgKeyForAuthenticated: ["DELETE /user/gpg_keys/{gpg_key_id}"],
        deletePublicSshKeyForAuthenticated: ["DELETE /user/keys/{key_id}"],
        follow: ["PUT /user/following/{username}"],
        getAuthenticated: ["GET /user"],
        getByUsername: ["GET /users/{username}"],
        getContextForUser: ["GET /users/{username}/hovercard"],
        getGpgKeyForAuthenticated: ["GET /user/gpg_keys/{gpg_key_id}"],
        getPublicSshKeyForAuthenticated: ["GET /user/keys/{key_id}"],
        list: ["GET /users"],
        listBlockedByAuthenticated: ["GET /user/blocks"],
        listEmailsForAuthenticated: ["GET /user/emails"],
        listFollowedByAuthenticated: ["GET /user/following"],
        listFollowersForAuthenticatedUser: ["GET /user/followers"],
        listFollowersForUser: ["GET /users/{username}/followers"],
        listFollowingForUser: ["GET /users/{username}/following"],
        listGpgKeysForAuthenticated: ["GET /user/gpg_keys"],
        listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
        listPublicEmailsForAuthenticated: ["GET /user/public_emails"],
        listPublicKeysForUser: ["GET /users/{username}/keys"],
        listPublicSshKeysForAuthenticated: ["GET /user/keys"],
        setPrimaryEmailVisibilityForAuthenticated: ["PATCH /user/email/visibility"],
        unblock: ["DELETE /user/blocks/{username}"],
        unfollow: ["DELETE /user/following/{username}"],
        updateAuthenticated: ["PATCH /user"]
      }
    };
    var VERSION = "5.5.0";
    function endpointsToMethods(octokit, endpointsMap) {
      const newMethods = {};
      for (const [scope, endpoints] of Object.entries(endpointsMap)) {
        for (const [methodName, endpoint] of Object.entries(endpoints)) {
          const [route, defaults, decorations] = endpoint;
          const [method, url] = route.split(/ /);
          const endpointDefaults = Object.assign({
            method,
            url
          }, defaults);
          if (!newMethods[scope]) {
            newMethods[scope] = {};
          }
          const scopeMethods = newMethods[scope];
          if (decorations) {
            scopeMethods[methodName] = decorate(octokit, scope, methodName, endpointDefaults, decorations);
            continue;
          }
          scopeMethods[methodName] = octokit.request.defaults(endpointDefaults);
        }
      }
      return newMethods;
    }
    function decorate(octokit, scope, methodName, defaults, decorations) {
      const requestWithDefaults = octokit.request.defaults(defaults);
      function withDecorations(...args) {
        let options = requestWithDefaults.endpoint.merge(...args);
        if (decorations.mapToData) {
          options = Object.assign({}, options, {
            data: options[decorations.mapToData],
            [decorations.mapToData]: void 0
          });
          return requestWithDefaults(options);
        }
        if (decorations.renamed) {
          const [newScope, newMethodName] = decorations.renamed;
          octokit.log.warn(`octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`);
        }
        if (decorations.deprecated) {
          octokit.log.warn(decorations.deprecated);
        }
        if (decorations.renamedParameters) {
          const options2 = requestWithDefaults.endpoint.merge(...args);
          for (const [name, alias] of Object.entries(decorations.renamedParameters)) {
            if (name in options2) {
              octokit.log.warn(`"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`);
              if (!(alias in options2)) {
                options2[alias] = options2[name];
              }
              delete options2[name];
            }
          }
          return requestWithDefaults(options2);
        }
        return requestWithDefaults(...args);
      }
      return Object.assign(withDecorations, requestWithDefaults);
    }
    function restEndpointMethods(octokit) {
      const api = endpointsToMethods(octokit, Endpoints);
      return {
        rest: api
      };
    }
    restEndpointMethods.VERSION = VERSION;
    function legacyRestEndpointMethods(octokit) {
      const api = endpointsToMethods(octokit, Endpoints);
      return _objectSpread2(_objectSpread2({}, api), {}, {
        rest: api
      });
    }
    legacyRestEndpointMethods.VERSION = VERSION;
    exports2.legacyRestEndpointMethods = legacyRestEndpointMethods;
    exports2.restEndpointMethods = restEndpointMethods;
  }
});

// node_modules/@octokit/plugin-paginate-rest/dist-node/index.js
var require_dist_node10 = __commonJS({
  "node_modules/@octokit/plugin-paginate-rest/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var VERSION = "2.14.0";
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
          symbols = symbols.filter(function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          });
        }
        keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        if (i % 2) {
          ownKeys(Object(source), true).forEach(function(key) {
            _defineProperty(target, key, source[key]);
          });
        } else if (Object.getOwnPropertyDescriptors) {
          Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
          ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    function normalizePaginatedListResponse(response) {
      if (!response.data) {
        return _objectSpread2(_objectSpread2({}, response), {}, {
          data: []
        });
      }
      const responseNeedsNormalization = "total_count" in response.data && !("url" in response.data);
      if (!responseNeedsNormalization)
        return response;
      const incompleteResults = response.data.incomplete_results;
      const repositorySelection = response.data.repository_selection;
      const totalCount = response.data.total_count;
      delete response.data.incomplete_results;
      delete response.data.repository_selection;
      delete response.data.total_count;
      const namespaceKey = Object.keys(response.data)[0];
      const data = response.data[namespaceKey];
      response.data = data;
      if (typeof incompleteResults !== "undefined") {
        response.data.incomplete_results = incompleteResults;
      }
      if (typeof repositorySelection !== "undefined") {
        response.data.repository_selection = repositorySelection;
      }
      response.data.total_count = totalCount;
      return response;
    }
    function iterator(octokit, route, parameters) {
      const options = typeof route === "function" ? route.endpoint(parameters) : octokit.request.endpoint(route, parameters);
      const requestMethod = typeof route === "function" ? route : octokit.request;
      const method = options.method;
      const headers = options.headers;
      let url = options.url;
      return {
        [Symbol.asyncIterator]: () => ({
          async next() {
            if (!url)
              return {
                done: true
              };
            try {
              const response = await requestMethod({
                method,
                url,
                headers
              });
              const normalizedResponse = normalizePaginatedListResponse(response);
              url = ((normalizedResponse.headers.link || "").match(/<([^>]+)>;\s*rel="next"/) || [])[1];
              return {
                value: normalizedResponse
              };
            } catch (error) {
              if (error.status !== 409)
                throw error;
              url = "";
              return {
                value: {
                  status: 200,
                  headers: {},
                  data: []
                }
              };
            }
          }
        })
      };
    }
    function paginate(octokit, route, parameters, mapFn) {
      if (typeof parameters === "function") {
        mapFn = parameters;
        parameters = void 0;
      }
      return gather(octokit, [], iterator(octokit, route, parameters)[Symbol.asyncIterator](), mapFn);
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
    var composePaginateRest = Object.assign(paginate, {
      iterator
    });
    var paginatingEndpoints = ["GET /app/hook/deliveries", "GET /app/installations", "GET /applications/grants", "GET /authorizations", "GET /enterprises/{enterprise}/actions/permissions/organizations", "GET /enterprises/{enterprise}/actions/runner-groups", "GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/organizations", "GET /enterprises/{enterprise}/actions/runner-groups/{runner_group_id}/runners", "GET /enterprises/{enterprise}/actions/runners", "GET /enterprises/{enterprise}/actions/runners/downloads", "GET /events", "GET /gists", "GET /gists/public", "GET /gists/starred", "GET /gists/{gist_id}/comments", "GET /gists/{gist_id}/commits", "GET /gists/{gist_id}/forks", "GET /installation/repositories", "GET /issues", "GET /marketplace_listing/plans", "GET /marketplace_listing/plans/{plan_id}/accounts", "GET /marketplace_listing/stubbed/plans", "GET /marketplace_listing/stubbed/plans/{plan_id}/accounts", "GET /networks/{owner}/{repo}/events", "GET /notifications", "GET /organizations", "GET /orgs/{org}/actions/permissions/repositories", "GET /orgs/{org}/actions/runner-groups", "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories", "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/runners", "GET /orgs/{org}/actions/runners", "GET /orgs/{org}/actions/runners/downloads", "GET /orgs/{org}/actions/secrets", "GET /orgs/{org}/actions/secrets/{secret_name}/repositories", "GET /orgs/{org}/blocks", "GET /orgs/{org}/credential-authorizations", "GET /orgs/{org}/events", "GET /orgs/{org}/failed_invitations", "GET /orgs/{org}/hooks", "GET /orgs/{org}/hooks/{hook_id}/deliveries", "GET /orgs/{org}/installations", "GET /orgs/{org}/invitations", "GET /orgs/{org}/invitations/{invitation_id}/teams", "GET /orgs/{org}/issues", "GET /orgs/{org}/members", "GET /orgs/{org}/migrations", "GET /orgs/{org}/migrations/{migration_id}/repositories", "GET /orgs/{org}/outside_collaborators", "GET /orgs/{org}/projects", "GET /orgs/{org}/public_members", "GET /orgs/{org}/repos", "GET /orgs/{org}/team-sync/groups", "GET /orgs/{org}/teams", "GET /orgs/{org}/teams/{team_slug}/discussions", "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments", "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions", "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions", "GET /orgs/{org}/teams/{team_slug}/invitations", "GET /orgs/{org}/teams/{team_slug}/members", "GET /orgs/{org}/teams/{team_slug}/projects", "GET /orgs/{org}/teams/{team_slug}/repos", "GET /orgs/{org}/teams/{team_slug}/team-sync/group-mappings", "GET /orgs/{org}/teams/{team_slug}/teams", "GET /projects/columns/{column_id}/cards", "GET /projects/{project_id}/collaborators", "GET /projects/{project_id}/columns", "GET /repos/{owner}/{repo}/actions/artifacts", "GET /repos/{owner}/{repo}/actions/runners", "GET /repos/{owner}/{repo}/actions/runners/downloads", "GET /repos/{owner}/{repo}/actions/runs", "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts", "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs", "GET /repos/{owner}/{repo}/actions/secrets", "GET /repos/{owner}/{repo}/actions/workflows", "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs", "GET /repos/{owner}/{repo}/assignees", "GET /repos/{owner}/{repo}/branches", "GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations", "GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs", "GET /repos/{owner}/{repo}/code-scanning/alerts", "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances", "GET /repos/{owner}/{repo}/code-scanning/analyses", "GET /repos/{owner}/{repo}/collaborators", "GET /repos/{owner}/{repo}/comments", "GET /repos/{owner}/{repo}/comments/{comment_id}/reactions", "GET /repos/{owner}/{repo}/commits", "GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head", "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments", "GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls", "GET /repos/{owner}/{repo}/commits/{ref}/check-runs", "GET /repos/{owner}/{repo}/commits/{ref}/check-suites", "GET /repos/{owner}/{repo}/commits/{ref}/statuses", "GET /repos/{owner}/{repo}/contributors", "GET /repos/{owner}/{repo}/deployments", "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses", "GET /repos/{owner}/{repo}/events", "GET /repos/{owner}/{repo}/forks", "GET /repos/{owner}/{repo}/git/matching-refs/{ref}", "GET /repos/{owner}/{repo}/hooks", "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries", "GET /repos/{owner}/{repo}/invitations", "GET /repos/{owner}/{repo}/issues", "GET /repos/{owner}/{repo}/issues/comments", "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions", "GET /repos/{owner}/{repo}/issues/events", "GET /repos/{owner}/{repo}/issues/{issue_number}/comments", "GET /repos/{owner}/{repo}/issues/{issue_number}/events", "GET /repos/{owner}/{repo}/issues/{issue_number}/labels", "GET /repos/{owner}/{repo}/issues/{issue_number}/reactions", "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline", "GET /repos/{owner}/{repo}/keys", "GET /repos/{owner}/{repo}/labels", "GET /repos/{owner}/{repo}/milestones", "GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels", "GET /repos/{owner}/{repo}/notifications", "GET /repos/{owner}/{repo}/pages/builds", "GET /repos/{owner}/{repo}/projects", "GET /repos/{owner}/{repo}/pulls", "GET /repos/{owner}/{repo}/pulls/comments", "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions", "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments", "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits", "GET /repos/{owner}/{repo}/pulls/{pull_number}/files", "GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers", "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews", "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments", "GET /repos/{owner}/{repo}/releases", "GET /repos/{owner}/{repo}/releases/{release_id}/assets", "GET /repos/{owner}/{repo}/secret-scanning/alerts", "GET /repos/{owner}/{repo}/stargazers", "GET /repos/{owner}/{repo}/subscribers", "GET /repos/{owner}/{repo}/tags", "GET /repos/{owner}/{repo}/teams", "GET /repositories", "GET /repositories/{repository_id}/environments/{environment_name}/secrets", "GET /scim/v2/enterprises/{enterprise}/Groups", "GET /scim/v2/enterprises/{enterprise}/Users", "GET /scim/v2/organizations/{org}/Users", "GET /search/code", "GET /search/commits", "GET /search/issues", "GET /search/labels", "GET /search/repositories", "GET /search/topics", "GET /search/users", "GET /teams/{team_id}/discussions", "GET /teams/{team_id}/discussions/{discussion_number}/comments", "GET /teams/{team_id}/discussions/{discussion_number}/comments/{comment_number}/reactions", "GET /teams/{team_id}/discussions/{discussion_number}/reactions", "GET /teams/{team_id}/invitations", "GET /teams/{team_id}/members", "GET /teams/{team_id}/projects", "GET /teams/{team_id}/repos", "GET /teams/{team_id}/team-sync/group-mappings", "GET /teams/{team_id}/teams", "GET /user/blocks", "GET /user/emails", "GET /user/followers", "GET /user/following", "GET /user/gpg_keys", "GET /user/installations", "GET /user/installations/{installation_id}/repositories", "GET /user/issues", "GET /user/keys", "GET /user/marketplace_purchases", "GET /user/marketplace_purchases/stubbed", "GET /user/memberships/orgs", "GET /user/migrations", "GET /user/migrations/{migration_id}/repositories", "GET /user/orgs", "GET /user/public_emails", "GET /user/repos", "GET /user/repository_invitations", "GET /user/starred", "GET /user/subscriptions", "GET /user/teams", "GET /users", "GET /users/{username}/events", "GET /users/{username}/events/orgs/{org}", "GET /users/{username}/events/public", "GET /users/{username}/followers", "GET /users/{username}/following", "GET /users/{username}/gists", "GET /users/{username}/gpg_keys", "GET /users/{username}/keys", "GET /users/{username}/orgs", "GET /users/{username}/projects", "GET /users/{username}/received_events", "GET /users/{username}/received_events/public", "GET /users/{username}/repos", "GET /users/{username}/starred", "GET /users/{username}/subscriptions"];
    function isPaginatingEndpoint(arg) {
      if (typeof arg === "string") {
        return paginatingEndpoints.includes(arg);
      } else {
        return false;
      }
    }
    function paginateRest(octokit) {
      return {
        paginate: Object.assign(paginate.bind(null, octokit), {
          iterator: iterator.bind(null, octokit)
        })
      };
    }
    paginateRest.VERSION = VERSION;
    exports2.composePaginateRest = composePaginateRest;
    exports2.isPaginatingEndpoint = isPaginatingEndpoint;
    exports2.paginateRest = paginateRest;
    exports2.paginatingEndpoints = paginatingEndpoints;
  }
});

// node_modules/@actions/github/lib/utils.js
var require_utils3 = __commonJS({
  "node_modules/@actions/github/lib/utils.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getOctokitOptions = exports2.GitHub = exports2.context = void 0;
    var Context = __importStar(require_context());
    var Utils = __importStar(require_utils2());
    var core_1 = require_dist_node8();
    var plugin_rest_endpoint_methods_1 = require_dist_node9();
    var plugin_paginate_rest_1 = require_dist_node10();
    exports2.context = new Context.Context();
    var baseUrl = Utils.getApiBaseUrl();
    var defaults = {
      baseUrl,
      request: {
        agent: Utils.getProxyAgent(baseUrl)
      }
    };
    exports2.GitHub = core_1.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods, plugin_paginate_rest_1.paginateRest).defaults(defaults);
    function getOctokitOptions(token, options) {
      const opts = Object.assign({}, options || {});
      const auth = Utils.getAuthString(token, opts);
      if (auth) {
        opts.auth = auth;
      }
      return opts;
    }
    exports2.getOctokitOptions = getOctokitOptions;
  }
});

// node_modules/@actions/github/lib/github.js
var require_github = __commonJS({
  "node_modules/@actions/github/lib/github.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getOctokit = exports2.context = void 0;
    var Context = __importStar(require_context());
    var utils_1 = require_utils3();
    exports2.context = new Context.Context();
    function getOctokit(token, options) {
      return new utils_1.GitHub(utils_1.getOctokitOptions(token, options));
    }
    exports2.getOctokit = getOctokit;
  }
});

// node_modules/@octokit/plugin-request-log/dist-node/index.js
var require_dist_node11 = __commonJS({
  "node_modules/@octokit/plugin-request-log/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var VERSION = "1.0.4";
    function requestLog(octokit) {
      octokit.hook.wrap("request", (request, options) => {
        octokit.log.debug("request", options);
        const start = Date.now();
        const requestOptions = octokit.request.endpoint.parse(options);
        const path = requestOptions.url.replace(options.baseUrl, "");
        return request(options).then((response) => {
          octokit.log.info(`${requestOptions.method} ${path} - ${response.status} in ${Date.now() - start}ms`);
          return response;
        }).catch((error) => {
          octokit.log.info(`${requestOptions.method} ${path} - ${error.status} in ${Date.now() - start}ms`);
          throw error;
        });
      });
    }
    requestLog.VERSION = VERSION;
    exports2.requestLog = requestLog;
  }
});

// node_modules/@octokit/rest/dist-node/index.js
var require_dist_node12 = __commonJS({
  "node_modules/@octokit/rest/dist-node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var core2 = require_dist_node8();
    var pluginRequestLog = require_dist_node11();
    var pluginPaginateRest = require_dist_node10();
    var pluginRestEndpointMethods = require_dist_node9();
    var VERSION = "18.7.0";
    var Octokit = core2.Octokit.plugin(pluginRequestLog.requestLog, pluginRestEndpointMethods.legacyRestEndpointMethods, pluginPaginateRest.paginateRest).defaults({
      userAgent: `octokit-rest.js/${VERSION}`
    });
    exports2.Octokit = Octokit;
  }
});

// node_modules/github-app-installation-token/dist/index.js
var require_dist = __commonJS({
  "node_modules/github-app-installation-token/dist/index.js"(exports2) {
    var __create = Object.create;
    var __defProp2 = Object.defineProperty;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __markAsModule = (target) => __defProp2(target, "__esModule", { value: true });
    var __commonJS2 = (callback, module22) => () => {
      if (!module22) {
        module22 = { exports: {} };
        callback(module22.exports, module22);
      }
      return module22.exports;
    };
    var __export = (target, all) => {
      __markAsModule(target);
      for (var name2 in all)
        __defProp2(target, name2, { get: all[name2], enumerable: true });
    };
    var __exportStar = (target, module22, desc) => {
      __markAsModule(target);
      if (module22 && typeof module22 === "object" || typeof module22 === "function") {
        for (let key of __getOwnPropNames(module22))
          if (!__hasOwnProp2.call(target, key) && key !== "default")
            __defProp2(target, key, { get: () => module22[key], enumerable: !(desc = __getOwnPropDesc(module22, key)) || desc.enumerable });
      }
      return target;
    };
    var __toModule = (module22) => {
      if (module22 && module22.__esModule)
        return module22;
      return __exportStar(__defProp2(module22 != null ? __create(__getProtoOf(module22)) : {}, "default", { value: module22, enumerable: true }), module22);
    };
    var require_color_name = __commonJS2((exports22, module22) => {
      "use strict";
      module22.exports = {
        aliceblue: [240, 248, 255],
        antiquewhite: [250, 235, 215],
        aqua: [0, 255, 255],
        aquamarine: [127, 255, 212],
        azure: [240, 255, 255],
        beige: [245, 245, 220],
        bisque: [255, 228, 196],
        black: [0, 0, 0],
        blanchedalmond: [255, 235, 205],
        blue: [0, 0, 255],
        blueviolet: [138, 43, 226],
        brown: [165, 42, 42],
        burlywood: [222, 184, 135],
        cadetblue: [95, 158, 160],
        chartreuse: [127, 255, 0],
        chocolate: [210, 105, 30],
        coral: [255, 127, 80],
        cornflowerblue: [100, 149, 237],
        cornsilk: [255, 248, 220],
        crimson: [220, 20, 60],
        cyan: [0, 255, 255],
        darkblue: [0, 0, 139],
        darkcyan: [0, 139, 139],
        darkgoldenrod: [184, 134, 11],
        darkgray: [169, 169, 169],
        darkgreen: [0, 100, 0],
        darkgrey: [169, 169, 169],
        darkkhaki: [189, 183, 107],
        darkmagenta: [139, 0, 139],
        darkolivegreen: [85, 107, 47],
        darkorange: [255, 140, 0],
        darkorchid: [153, 50, 204],
        darkred: [139, 0, 0],
        darksalmon: [233, 150, 122],
        darkseagreen: [143, 188, 143],
        darkslateblue: [72, 61, 139],
        darkslategray: [47, 79, 79],
        darkslategrey: [47, 79, 79],
        darkturquoise: [0, 206, 209],
        darkviolet: [148, 0, 211],
        deeppink: [255, 20, 147],
        deepskyblue: [0, 191, 255],
        dimgray: [105, 105, 105],
        dimgrey: [105, 105, 105],
        dodgerblue: [30, 144, 255],
        firebrick: [178, 34, 34],
        floralwhite: [255, 250, 240],
        forestgreen: [34, 139, 34],
        fuchsia: [255, 0, 255],
        gainsboro: [220, 220, 220],
        ghostwhite: [248, 248, 255],
        gold: [255, 215, 0],
        goldenrod: [218, 165, 32],
        gray: [128, 128, 128],
        green: [0, 128, 0],
        greenyellow: [173, 255, 47],
        grey: [128, 128, 128],
        honeydew: [240, 255, 240],
        hotpink: [255, 105, 180],
        indianred: [205, 92, 92],
        indigo: [75, 0, 130],
        ivory: [255, 255, 240],
        khaki: [240, 230, 140],
        lavender: [230, 230, 250],
        lavenderblush: [255, 240, 245],
        lawngreen: [124, 252, 0],
        lemonchiffon: [255, 250, 205],
        lightblue: [173, 216, 230],
        lightcoral: [240, 128, 128],
        lightcyan: [224, 255, 255],
        lightgoldenrodyellow: [250, 250, 210],
        lightgray: [211, 211, 211],
        lightgreen: [144, 238, 144],
        lightgrey: [211, 211, 211],
        lightpink: [255, 182, 193],
        lightsalmon: [255, 160, 122],
        lightseagreen: [32, 178, 170],
        lightskyblue: [135, 206, 250],
        lightslategray: [119, 136, 153],
        lightslategrey: [119, 136, 153],
        lightsteelblue: [176, 196, 222],
        lightyellow: [255, 255, 224],
        lime: [0, 255, 0],
        limegreen: [50, 205, 50],
        linen: [250, 240, 230],
        magenta: [255, 0, 255],
        maroon: [128, 0, 0],
        mediumaquamarine: [102, 205, 170],
        mediumblue: [0, 0, 205],
        mediumorchid: [186, 85, 211],
        mediumpurple: [147, 112, 219],
        mediumseagreen: [60, 179, 113],
        mediumslateblue: [123, 104, 238],
        mediumspringgreen: [0, 250, 154],
        mediumturquoise: [72, 209, 204],
        mediumvioletred: [199, 21, 133],
        midnightblue: [25, 25, 112],
        mintcream: [245, 255, 250],
        mistyrose: [255, 228, 225],
        moccasin: [255, 228, 181],
        navajowhite: [255, 222, 173],
        navy: [0, 0, 128],
        oldlace: [253, 245, 230],
        olive: [128, 128, 0],
        olivedrab: [107, 142, 35],
        orange: [255, 165, 0],
        orangered: [255, 69, 0],
        orchid: [218, 112, 214],
        palegoldenrod: [238, 232, 170],
        palegreen: [152, 251, 152],
        paleturquoise: [175, 238, 238],
        palevioletred: [219, 112, 147],
        papayawhip: [255, 239, 213],
        peachpuff: [255, 218, 185],
        peru: [205, 133, 63],
        pink: [255, 192, 203],
        plum: [221, 160, 221],
        powderblue: [176, 224, 230],
        purple: [128, 0, 128],
        rebeccapurple: [102, 51, 153],
        red: [255, 0, 0],
        rosybrown: [188, 143, 143],
        royalblue: [65, 105, 225],
        saddlebrown: [139, 69, 19],
        salmon: [250, 128, 114],
        sandybrown: [244, 164, 96],
        seagreen: [46, 139, 87],
        seashell: [255, 245, 238],
        sienna: [160, 82, 45],
        silver: [192, 192, 192],
        skyblue: [135, 206, 235],
        slateblue: [106, 90, 205],
        slategray: [112, 128, 144],
        slategrey: [112, 128, 144],
        snow: [255, 250, 250],
        springgreen: [0, 255, 127],
        steelblue: [70, 130, 180],
        tan: [210, 180, 140],
        teal: [0, 128, 128],
        thistle: [216, 191, 216],
        tomato: [255, 99, 71],
        turquoise: [64, 224, 208],
        violet: [238, 130, 238],
        wheat: [245, 222, 179],
        white: [255, 255, 255],
        whitesmoke: [245, 245, 245],
        yellow: [255, 255, 0],
        yellowgreen: [154, 205, 50]
      };
    });
    var require_conversions = __commonJS2((exports22, module22) => {
      var cssKeywords = require_color_name();
      var reverseKeywords = {};
      for (const key of Object.keys(cssKeywords)) {
        reverseKeywords[cssKeywords[key]] = key;
      }
      var convert = {
        rgb: { channels: 3, labels: "rgb" },
        hsl: { channels: 3, labels: "hsl" },
        hsv: { channels: 3, labels: "hsv" },
        hwb: { channels: 3, labels: "hwb" },
        cmyk: { channels: 4, labels: "cmyk" },
        xyz: { channels: 3, labels: "xyz" },
        lab: { channels: 3, labels: "lab" },
        lch: { channels: 3, labels: "lch" },
        hex: { channels: 1, labels: ["hex"] },
        keyword: { channels: 1, labels: ["keyword"] },
        ansi16: { channels: 1, labels: ["ansi16"] },
        ansi256: { channels: 1, labels: ["ansi256"] },
        hcg: { channels: 3, labels: ["h", "c", "g"] },
        apple: { channels: 3, labels: ["r16", "g16", "b16"] },
        gray: { channels: 1, labels: ["gray"] }
      };
      module22.exports = convert;
      for (const model of Object.keys(convert)) {
        if (!("channels" in convert[model])) {
          throw new Error("missing channels property: " + model);
        }
        if (!("labels" in convert[model])) {
          throw new Error("missing channel labels property: " + model);
        }
        if (convert[model].labels.length !== convert[model].channels) {
          throw new Error("channel and label counts mismatch: " + model);
        }
        const { channels, labels } = convert[model];
        delete convert[model].channels;
        delete convert[model].labels;
        Object.defineProperty(convert[model], "channels", { value: channels });
        Object.defineProperty(convert[model], "labels", { value: labels });
      }
      convert.rgb.hsl = function(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const delta = max - min;
        let h;
        let s;
        if (max === min) {
          h = 0;
        } else if (r === max) {
          h = (g - b) / delta;
        } else if (g === max) {
          h = 2 + (b - r) / delta;
        } else if (b === max) {
          h = 4 + (r - g) / delta;
        }
        h = Math.min(h * 60, 360);
        if (h < 0) {
          h += 360;
        }
        const l = (min + max) / 2;
        if (max === min) {
          s = 0;
        } else if (l <= 0.5) {
          s = delta / (max + min);
        } else {
          s = delta / (2 - max - min);
        }
        return [h, s * 100, l * 100];
      };
      convert.rgb.hsv = function(rgb) {
        let rdif;
        let gdif;
        let bdif;
        let h;
        let s;
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const v = Math.max(r, g, b);
        const diff = v - Math.min(r, g, b);
        const diffc = function(c) {
          return (v - c) / 6 / diff + 1 / 2;
        };
        if (diff === 0) {
          h = 0;
          s = 0;
        } else {
          s = diff / v;
          rdif = diffc(r);
          gdif = diffc(g);
          bdif = diffc(b);
          if (r === v) {
            h = bdif - gdif;
          } else if (g === v) {
            h = 1 / 3 + rdif - bdif;
          } else if (b === v) {
            h = 2 / 3 + gdif - rdif;
          }
          if (h < 0) {
            h += 1;
          } else if (h > 1) {
            h -= 1;
          }
        }
        return [
          h * 360,
          s * 100,
          v * 100
        ];
      };
      convert.rgb.hwb = function(rgb) {
        const r = rgb[0];
        const g = rgb[1];
        let b = rgb[2];
        const h = convert.rgb.hsl(rgb)[0];
        const w = 1 / 255 * Math.min(r, Math.min(g, b));
        b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
        return [h, w * 100, b * 100];
      };
      convert.rgb.cmyk = function(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const k = Math.min(1 - r, 1 - g, 1 - b);
        const c = (1 - r - k) / (1 - k) || 0;
        const m = (1 - g - k) / (1 - k) || 0;
        const y = (1 - b - k) / (1 - k) || 0;
        return [c * 100, m * 100, y * 100, k * 100];
      };
      function comparativeDistance(x, y) {
        return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
      }
      convert.rgb.keyword = function(rgb) {
        const reversed = reverseKeywords[rgb];
        if (reversed) {
          return reversed;
        }
        let currentClosestDistance = Infinity;
        let currentClosestKeyword;
        for (const keyword of Object.keys(cssKeywords)) {
          const value = cssKeywords[keyword];
          const distance = comparativeDistance(rgb, value);
          if (distance < currentClosestDistance) {
            currentClosestDistance = distance;
            currentClosestKeyword = keyword;
          }
        }
        return currentClosestKeyword;
      };
      convert.keyword.rgb = function(keyword) {
        return cssKeywords[keyword];
      };
      convert.rgb.xyz = function(rgb) {
        let r = rgb[0] / 255;
        let g = rgb[1] / 255;
        let b = rgb[2] / 255;
        r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
        g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
        b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
        const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
        const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
        const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
        return [x * 100, y * 100, z * 100];
      };
      convert.rgb.lab = function(rgb) {
        const xyz = convert.rgb.xyz(rgb);
        let x = xyz[0];
        let y = xyz[1];
        let z = xyz[2];
        x /= 95.047;
        y /= 100;
        z /= 108.883;
        x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
        y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
        z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
        const l = 116 * y - 16;
        const a = 500 * (x - y);
        const b = 200 * (y - z);
        return [l, a, b];
      };
      convert.hsl.rgb = function(hsl) {
        const h = hsl[0] / 360;
        const s = hsl[1] / 100;
        const l = hsl[2] / 100;
        let t2;
        let t3;
        let val;
        if (s === 0) {
          val = l * 255;
          return [val, val, val];
        }
        if (l < 0.5) {
          t2 = l * (1 + s);
        } else {
          t2 = l + s - l * s;
        }
        const t1 = 2 * l - t2;
        const rgb = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
          t3 = h + 1 / 3 * -(i - 1);
          if (t3 < 0) {
            t3++;
          }
          if (t3 > 1) {
            t3--;
          }
          if (6 * t3 < 1) {
            val = t1 + (t2 - t1) * 6 * t3;
          } else if (2 * t3 < 1) {
            val = t2;
          } else if (3 * t3 < 2) {
            val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
          } else {
            val = t1;
          }
          rgb[i] = val * 255;
        }
        return rgb;
      };
      convert.hsl.hsv = function(hsl) {
        const h = hsl[0];
        let s = hsl[1] / 100;
        let l = hsl[2] / 100;
        let smin = s;
        const lmin = Math.max(l, 0.01);
        l *= 2;
        s *= l <= 1 ? l : 2 - l;
        smin *= lmin <= 1 ? lmin : 2 - lmin;
        const v = (l + s) / 2;
        const sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
        return [h, sv * 100, v * 100];
      };
      convert.hsv.rgb = function(hsv) {
        const h = hsv[0] / 60;
        const s = hsv[1] / 100;
        let v = hsv[2] / 100;
        const hi = Math.floor(h) % 6;
        const f = h - Math.floor(h);
        const p = 255 * v * (1 - s);
        const q = 255 * v * (1 - s * f);
        const t = 255 * v * (1 - s * (1 - f));
        v *= 255;
        switch (hi) {
          case 0:
            return [v, t, p];
          case 1:
            return [q, v, p];
          case 2:
            return [p, v, t];
          case 3:
            return [p, q, v];
          case 4:
            return [t, p, v];
          case 5:
            return [v, p, q];
        }
      };
      convert.hsv.hsl = function(hsv) {
        const h = hsv[0];
        const s = hsv[1] / 100;
        const v = hsv[2] / 100;
        const vmin = Math.max(v, 0.01);
        let sl;
        let l;
        l = (2 - s) * v;
        const lmin = (2 - s) * vmin;
        sl = s * vmin;
        sl /= lmin <= 1 ? lmin : 2 - lmin;
        sl = sl || 0;
        l /= 2;
        return [h, sl * 100, l * 100];
      };
      convert.hwb.rgb = function(hwb) {
        const h = hwb[0] / 360;
        let wh = hwb[1] / 100;
        let bl = hwb[2] / 100;
        const ratio = wh + bl;
        let f;
        if (ratio > 1) {
          wh /= ratio;
          bl /= ratio;
        }
        const i = Math.floor(6 * h);
        const v = 1 - bl;
        f = 6 * h - i;
        if ((i & 1) !== 0) {
          f = 1 - f;
        }
        const n = wh + f * (v - wh);
        let r;
        let g;
        let b;
        switch (i) {
          default:
          case 6:
          case 0:
            r = v;
            g = n;
            b = wh;
            break;
          case 1:
            r = n;
            g = v;
            b = wh;
            break;
          case 2:
            r = wh;
            g = v;
            b = n;
            break;
          case 3:
            r = wh;
            g = n;
            b = v;
            break;
          case 4:
            r = n;
            g = wh;
            b = v;
            break;
          case 5:
            r = v;
            g = wh;
            b = n;
            break;
        }
        return [r * 255, g * 255, b * 255];
      };
      convert.cmyk.rgb = function(cmyk) {
        const c = cmyk[0] / 100;
        const m = cmyk[1] / 100;
        const y = cmyk[2] / 100;
        const k = cmyk[3] / 100;
        const r = 1 - Math.min(1, c * (1 - k) + k);
        const g = 1 - Math.min(1, m * (1 - k) + k);
        const b = 1 - Math.min(1, y * (1 - k) + k);
        return [r * 255, g * 255, b * 255];
      };
      convert.xyz.rgb = function(xyz) {
        const x = xyz[0] / 100;
        const y = xyz[1] / 100;
        const z = xyz[2] / 100;
        let r;
        let g;
        let b;
        r = x * 3.2406 + y * -1.5372 + z * -0.4986;
        g = x * -0.9689 + y * 1.8758 + z * 0.0415;
        b = x * 0.0557 + y * -0.204 + z * 1.057;
        r = r > 31308e-7 ? 1.055 * r ** (1 / 2.4) - 0.055 : r * 12.92;
        g = g > 31308e-7 ? 1.055 * g ** (1 / 2.4) - 0.055 : g * 12.92;
        b = b > 31308e-7 ? 1.055 * b ** (1 / 2.4) - 0.055 : b * 12.92;
        r = Math.min(Math.max(0, r), 1);
        g = Math.min(Math.max(0, g), 1);
        b = Math.min(Math.max(0, b), 1);
        return [r * 255, g * 255, b * 255];
      };
      convert.xyz.lab = function(xyz) {
        let x = xyz[0];
        let y = xyz[1];
        let z = xyz[2];
        x /= 95.047;
        y /= 100;
        z /= 108.883;
        x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
        y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
        z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
        const l = 116 * y - 16;
        const a = 500 * (x - y);
        const b = 200 * (y - z);
        return [l, a, b];
      };
      convert.lab.xyz = function(lab) {
        const l = lab[0];
        const a = lab[1];
        const b = lab[2];
        let x;
        let y;
        let z;
        y = (l + 16) / 116;
        x = a / 500 + y;
        z = y - b / 200;
        const y2 = y ** 3;
        const x2 = x ** 3;
        const z2 = z ** 3;
        y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
        x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
        z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
        x *= 95.047;
        y *= 100;
        z *= 108.883;
        return [x, y, z];
      };
      convert.lab.lch = function(lab) {
        const l = lab[0];
        const a = lab[1];
        const b = lab[2];
        let h;
        const hr = Math.atan2(b, a);
        h = hr * 360 / 2 / Math.PI;
        if (h < 0) {
          h += 360;
        }
        const c = Math.sqrt(a * a + b * b);
        return [l, c, h];
      };
      convert.lch.lab = function(lch) {
        const l = lch[0];
        const c = lch[1];
        const h = lch[2];
        const hr = h / 360 * 2 * Math.PI;
        const a = c * Math.cos(hr);
        const b = c * Math.sin(hr);
        return [l, a, b];
      };
      convert.rgb.ansi16 = function(args, saturation = null) {
        const [r, g, b] = args;
        let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation;
        value = Math.round(value / 50);
        if (value === 0) {
          return 30;
        }
        let ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
        if (value === 2) {
          ansi += 60;
        }
        return ansi;
      };
      convert.hsv.ansi16 = function(args) {
        return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
      };
      convert.rgb.ansi256 = function(args) {
        const r = args[0];
        const g = args[1];
        const b = args[2];
        if (r === g && g === b) {
          if (r < 8) {
            return 16;
          }
          if (r > 248) {
            return 231;
          }
          return Math.round((r - 8) / 247 * 24) + 232;
        }
        const ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
        return ansi;
      };
      convert.ansi16.rgb = function(args) {
        let color = args % 10;
        if (color === 0 || color === 7) {
          if (args > 50) {
            color += 3.5;
          }
          color = color / 10.5 * 255;
          return [color, color, color];
        }
        const mult = (~~(args > 50) + 1) * 0.5;
        const r = (color & 1) * mult * 255;
        const g = (color >> 1 & 1) * mult * 255;
        const b = (color >> 2 & 1) * mult * 255;
        return [r, g, b];
      };
      convert.ansi256.rgb = function(args) {
        if (args >= 232) {
          const c = (args - 232) * 10 + 8;
          return [c, c, c];
        }
        args -= 16;
        let rem;
        const r = Math.floor(args / 36) / 5 * 255;
        const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
        const b = rem % 6 / 5 * 255;
        return [r, g, b];
      };
      convert.rgb.hex = function(args) {
        const integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
        const string = integer.toString(16).toUpperCase();
        return "000000".substring(string.length) + string;
      };
      convert.hex.rgb = function(args) {
        const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
        if (!match) {
          return [0, 0, 0];
        }
        let colorString = match[0];
        if (match[0].length === 3) {
          colorString = colorString.split("").map((char) => {
            return char + char;
          }).join("");
        }
        const integer = parseInt(colorString, 16);
        const r = integer >> 16 & 255;
        const g = integer >> 8 & 255;
        const b = integer & 255;
        return [r, g, b];
      };
      convert.rgb.hcg = function(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const max = Math.max(Math.max(r, g), b);
        const min = Math.min(Math.min(r, g), b);
        const chroma = max - min;
        let grayscale;
        let hue;
        if (chroma < 1) {
          grayscale = min / (1 - chroma);
        } else {
          grayscale = 0;
        }
        if (chroma <= 0) {
          hue = 0;
        } else if (max === r) {
          hue = (g - b) / chroma % 6;
        } else if (max === g) {
          hue = 2 + (b - r) / chroma;
        } else {
          hue = 4 + (r - g) / chroma;
        }
        hue /= 6;
        hue %= 1;
        return [hue * 360, chroma * 100, grayscale * 100];
      };
      convert.hsl.hcg = function(hsl) {
        const s = hsl[1] / 100;
        const l = hsl[2] / 100;
        const c = l < 0.5 ? 2 * s * l : 2 * s * (1 - l);
        let f = 0;
        if (c < 1) {
          f = (l - 0.5 * c) / (1 - c);
        }
        return [hsl[0], c * 100, f * 100];
      };
      convert.hsv.hcg = function(hsv) {
        const s = hsv[1] / 100;
        const v = hsv[2] / 100;
        const c = s * v;
        let f = 0;
        if (c < 1) {
          f = (v - c) / (1 - c);
        }
        return [hsv[0], c * 100, f * 100];
      };
      convert.hcg.rgb = function(hcg) {
        const h = hcg[0] / 360;
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        if (c === 0) {
          return [g * 255, g * 255, g * 255];
        }
        const pure = [0, 0, 0];
        const hi = h % 1 * 6;
        const v = hi % 1;
        const w = 1 - v;
        let mg = 0;
        switch (Math.floor(hi)) {
          case 0:
            pure[0] = 1;
            pure[1] = v;
            pure[2] = 0;
            break;
          case 1:
            pure[0] = w;
            pure[1] = 1;
            pure[2] = 0;
            break;
          case 2:
            pure[0] = 0;
            pure[1] = 1;
            pure[2] = v;
            break;
          case 3:
            pure[0] = 0;
            pure[1] = w;
            pure[2] = 1;
            break;
          case 4:
            pure[0] = v;
            pure[1] = 0;
            pure[2] = 1;
            break;
          default:
            pure[0] = 1;
            pure[1] = 0;
            pure[2] = w;
        }
        mg = (1 - c) * g;
        return [
          (c * pure[0] + mg) * 255,
          (c * pure[1] + mg) * 255,
          (c * pure[2] + mg) * 255
        ];
      };
      convert.hcg.hsv = function(hcg) {
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        const v = c + g * (1 - c);
        let f = 0;
        if (v > 0) {
          f = c / v;
        }
        return [hcg[0], f * 100, v * 100];
      };
      convert.hcg.hsl = function(hcg) {
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        const l = g * (1 - c) + 0.5 * c;
        let s = 0;
        if (l > 0 && l < 0.5) {
          s = c / (2 * l);
        } else if (l >= 0.5 && l < 1) {
          s = c / (2 * (1 - l));
        }
        return [hcg[0], s * 100, l * 100];
      };
      convert.hcg.hwb = function(hcg) {
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        const v = c + g * (1 - c);
        return [hcg[0], (v - c) * 100, (1 - v) * 100];
      };
      convert.hwb.hcg = function(hwb) {
        const w = hwb[1] / 100;
        const b = hwb[2] / 100;
        const v = 1 - b;
        const c = v - w;
        let g = 0;
        if (c < 1) {
          g = (v - c) / (1 - c);
        }
        return [hwb[0], c * 100, g * 100];
      };
      convert.apple.rgb = function(apple) {
        return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
      };
      convert.rgb.apple = function(rgb) {
        return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
      };
      convert.gray.rgb = function(args) {
        return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
      };
      convert.gray.hsl = function(args) {
        return [0, 0, args[0]];
      };
      convert.gray.hsv = convert.gray.hsl;
      convert.gray.hwb = function(gray) {
        return [0, 100, gray[0]];
      };
      convert.gray.cmyk = function(gray) {
        return [0, 0, 0, gray[0]];
      };
      convert.gray.lab = function(gray) {
        return [gray[0], 0, 0];
      };
      convert.gray.hex = function(gray) {
        const val = Math.round(gray[0] / 100 * 255) & 255;
        const integer = (val << 16) + (val << 8) + val;
        const string = integer.toString(16).toUpperCase();
        return "000000".substring(string.length) + string;
      };
      convert.rgb.gray = function(rgb) {
        const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
        return [val / 255 * 100];
      };
    });
    var require_route = __commonJS2((exports22, module22) => {
      var conversions = require_conversions();
      function buildGraph() {
        const graph = {};
        const models = Object.keys(conversions);
        for (let len = models.length, i = 0; i < len; i++) {
          graph[models[i]] = {
            distance: -1,
            parent: null
          };
        }
        return graph;
      }
      function deriveBFS(fromModel) {
        const graph = buildGraph();
        const queue = [fromModel];
        graph[fromModel].distance = 0;
        while (queue.length) {
          const current = queue.pop();
          const adjacents = Object.keys(conversions[current]);
          for (let len = adjacents.length, i = 0; i < len; i++) {
            const adjacent = adjacents[i];
            const node = graph[adjacent];
            if (node.distance === -1) {
              node.distance = graph[current].distance + 1;
              node.parent = current;
              queue.unshift(adjacent);
            }
          }
        }
        return graph;
      }
      function link(from, to) {
        return function(args) {
          return to(from(args));
        };
      }
      function wrapConversion(toModel, graph) {
        const path = [graph[toModel].parent, toModel];
        let fn = conversions[graph[toModel].parent][toModel];
        let cur = graph[toModel].parent;
        while (graph[cur].parent) {
          path.unshift(graph[cur].parent);
          fn = link(conversions[graph[cur].parent][cur], fn);
          cur = graph[cur].parent;
        }
        fn.conversion = path;
        return fn;
      }
      module22.exports = function(fromModel) {
        const graph = deriveBFS(fromModel);
        const conversion = {};
        const models = Object.keys(graph);
        for (let len = models.length, i = 0; i < len; i++) {
          const toModel = models[i];
          const node = graph[toModel];
          if (node.parent === null) {
            continue;
          }
          conversion[toModel] = wrapConversion(toModel, graph);
        }
        return conversion;
      };
    });
    var require_color_convert = __commonJS2((exports22, module22) => {
      var conversions = require_conversions();
      var route = require_route();
      var convert = {};
      var models = Object.keys(conversions);
      function wrapRaw(fn) {
        const wrappedFn = function(...args) {
          const arg0 = args[0];
          if (arg0 === void 0 || arg0 === null) {
            return arg0;
          }
          if (arg0.length > 1) {
            args = arg0;
          }
          return fn(args);
        };
        if ("conversion" in fn) {
          wrappedFn.conversion = fn.conversion;
        }
        return wrappedFn;
      }
      function wrapRounded(fn) {
        const wrappedFn = function(...args) {
          const arg0 = args[0];
          if (arg0 === void 0 || arg0 === null) {
            return arg0;
          }
          if (arg0.length > 1) {
            args = arg0;
          }
          const result = fn(args);
          if (typeof result === "object") {
            for (let len = result.length, i = 0; i < len; i++) {
              result[i] = Math.round(result[i]);
            }
          }
          return result;
        };
        if ("conversion" in fn) {
          wrappedFn.conversion = fn.conversion;
        }
        return wrappedFn;
      }
      models.forEach((fromModel) => {
        convert[fromModel] = {};
        Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
        Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
        const routes = route(fromModel);
        const routeModels = Object.keys(routes);
        routeModels.forEach((toModel) => {
          const fn = routes[toModel];
          convert[fromModel][toModel] = wrapRounded(fn);
          convert[fromModel][toModel].raw = wrapRaw(fn);
        });
      });
      module22.exports = convert;
    });
    var require_ansi_styles = __commonJS2((exports22, module22) => {
      "use strict";
      var wrapAnsi16 = (fn, offset) => (...args) => {
        const code = fn(...args);
        return `[${code + offset}m`;
      };
      var wrapAnsi256 = (fn, offset) => (...args) => {
        const code = fn(...args);
        return `[${38 + offset};5;${code}m`;
      };
      var wrapAnsi16m = (fn, offset) => (...args) => {
        const rgb = fn(...args);
        return `[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
      };
      var ansi2ansi = (n) => n;
      var rgb2rgb = (r, g, b) => [r, g, b];
      var setLazyProperty = (object, property, get) => {
        Object.defineProperty(object, property, {
          get: () => {
            const value = get();
            Object.defineProperty(object, property, {
              value,
              enumerable: true,
              configurable: true
            });
            return value;
          },
          enumerable: true,
          configurable: true
        });
      };
      var colorConvert;
      var makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
        if (colorConvert === void 0) {
          colorConvert = require_color_convert();
        }
        const offset = isBackground ? 10 : 0;
        const styles = {};
        for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
          const name2 = sourceSpace === "ansi16" ? "ansi" : sourceSpace;
          if (sourceSpace === targetSpace) {
            styles[name2] = wrap(identity, offset);
          } else if (typeof suite === "object") {
            styles[name2] = wrap(suite[targetSpace], offset);
          }
        }
        return styles;
      };
      function assembleStyles() {
        const codes = new Map();
        const styles = {
          modifier: {
            reset: [0, 0],
            bold: [1, 22],
            dim: [2, 22],
            italic: [3, 23],
            underline: [4, 24],
            inverse: [7, 27],
            hidden: [8, 28],
            strikethrough: [9, 29]
          },
          color: {
            black: [30, 39],
            red: [31, 39],
            green: [32, 39],
            yellow: [33, 39],
            blue: [34, 39],
            magenta: [35, 39],
            cyan: [36, 39],
            white: [37, 39],
            blackBright: [90, 39],
            redBright: [91, 39],
            greenBright: [92, 39],
            yellowBright: [93, 39],
            blueBright: [94, 39],
            magentaBright: [95, 39],
            cyanBright: [96, 39],
            whiteBright: [97, 39]
          },
          bgColor: {
            bgBlack: [40, 49],
            bgRed: [41, 49],
            bgGreen: [42, 49],
            bgYellow: [43, 49],
            bgBlue: [44, 49],
            bgMagenta: [45, 49],
            bgCyan: [46, 49],
            bgWhite: [47, 49],
            bgBlackBright: [100, 49],
            bgRedBright: [101, 49],
            bgGreenBright: [102, 49],
            bgYellowBright: [103, 49],
            bgBlueBright: [104, 49],
            bgMagentaBright: [105, 49],
            bgCyanBright: [106, 49],
            bgWhiteBright: [107, 49]
          }
        };
        styles.color.gray = styles.color.blackBright;
        styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
        styles.color.grey = styles.color.blackBright;
        styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;
        for (const [groupName, group] of Object.entries(styles)) {
          for (const [styleName, style] of Object.entries(group)) {
            styles[styleName] = {
              open: `[${style[0]}m`,
              close: `[${style[1]}m`
            };
            group[styleName] = styles[styleName];
            codes.set(style[0], style[1]);
          }
          Object.defineProperty(styles, groupName, {
            value: group,
            enumerable: false
          });
        }
        Object.defineProperty(styles, "codes", {
          value: codes,
          enumerable: false
        });
        styles.color.close = "[39m";
        styles.bgColor.close = "[49m";
        setLazyProperty(styles.color, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, false));
        setLazyProperty(styles.color, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, false));
        setLazyProperty(styles.color, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, false));
        setLazyProperty(styles.bgColor, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, true));
        setLazyProperty(styles.bgColor, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, true));
        setLazyProperty(styles.bgColor, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, true));
        return styles;
      }
      Object.defineProperty(module22, "exports", {
        enumerable: true,
        get: assembleStyles
      });
    });
    var require_has_flag = __commonJS2((exports22, module22) => {
      "use strict";
      module22.exports = (flag, argv = process.argv) => {
        const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
        const position = argv.indexOf(prefix + flag);
        const terminatorPosition = argv.indexOf("--");
        return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
      };
    });
    var require_supports_color = __commonJS2((exports22, module22) => {
      "use strict";
      var os = require("os");
      var tty = require("tty");
      var hasFlag = require_has_flag();
      var { env } = process;
      var forceColor;
      if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
        forceColor = 0;
      } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
        forceColor = 1;
      }
      if ("FORCE_COLOR" in env) {
        if (env.FORCE_COLOR === "true") {
          forceColor = 1;
        } else if (env.FORCE_COLOR === "false") {
          forceColor = 0;
        } else {
          forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
        }
      }
      function translateLevel(level) {
        if (level === 0) {
          return false;
        }
        return {
          level,
          hasBasic: true,
          has256: level >= 2,
          has16m: level >= 3
        };
      }
      function supportsColor(haveStream, streamIsTTY) {
        if (forceColor === 0) {
          return 0;
        }
        if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
          return 3;
        }
        if (hasFlag("color=256")) {
          return 2;
        }
        if (haveStream && !streamIsTTY && forceColor === void 0) {
          return 0;
        }
        const min = forceColor || 0;
        if (env.TERM === "dumb") {
          return min;
        }
        if (process.platform === "win32") {
          const osRelease = os.release().split(".");
          if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
            return Number(osRelease[2]) >= 14931 ? 3 : 2;
          }
          return 1;
        }
        if ("CI" in env) {
          if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
            return 1;
          }
          return min;
        }
        if ("TEAMCITY_VERSION" in env) {
          return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
        }
        if (env.COLORTERM === "truecolor") {
          return 3;
        }
        if ("TERM_PROGRAM" in env) {
          const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
          switch (env.TERM_PROGRAM) {
            case "iTerm.app":
              return version >= 3 ? 3 : 2;
            case "Apple_Terminal":
              return 2;
          }
        }
        if (/-256(color)?$/i.test(env.TERM)) {
          return 2;
        }
        if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
          return 1;
        }
        if ("COLORTERM" in env) {
          return 1;
        }
        return min;
      }
      function getSupportLevel(stream) {
        const level = supportsColor(stream, stream && stream.isTTY);
        return translateLevel(level);
      }
      module22.exports = {
        supportsColor: getSupportLevel,
        stdout: translateLevel(supportsColor(true, tty.isatty(1))),
        stderr: translateLevel(supportsColor(true, tty.isatty(2)))
      };
    });
    var require_util = __commonJS2((exports22, module22) => {
      "use strict";
      var stringReplaceAll = (string, substring, replacer) => {
        let index = string.indexOf(substring);
        if (index === -1) {
          return string;
        }
        const substringLength = substring.length;
        let endIndex = 0;
        let returnValue = "";
        do {
          returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
          endIndex = index + substringLength;
          index = string.indexOf(substring, endIndex);
        } while (index !== -1);
        returnValue += string.substr(endIndex);
        return returnValue;
      };
      var stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
        let endIndex = 0;
        let returnValue = "";
        do {
          const gotCR = string[index - 1] === "\r";
          returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
          endIndex = index + 1;
          index = string.indexOf("\n", endIndex);
        } while (index !== -1);
        returnValue += string.substr(endIndex);
        return returnValue;
      };
      module22.exports = {
        stringReplaceAll,
        stringEncaseCRLFWithFirstIndex
      };
    });
    var require_templates = __commonJS2((exports22, module22) => {
      "use strict";
      var TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
      var STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
      var STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
      var ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;
      var ESCAPES = new Map([
        ["n", "\n"],
        ["r", "\r"],
        ["t", "	"],
        ["b", "\b"],
        ["f", "\f"],
        ["v", "\v"],
        ["0", "\0"],
        ["\\", "\\"],
        ["e", ""],
        ["a", "\x07"]
      ]);
      function unescape(c) {
        const u = c[0] === "u";
        const bracket = c[1] === "{";
        if (u && !bracket && c.length === 5 || c[0] === "x" && c.length === 3) {
          return String.fromCharCode(parseInt(c.slice(1), 16));
        }
        if (u && bracket) {
          return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
        }
        return ESCAPES.get(c) || c;
      }
      function parseArguments(name2, arguments_) {
        const results = [];
        const chunks = arguments_.trim().split(/\s*,\s*/g);
        let matches;
        for (const chunk of chunks) {
          const number = Number(chunk);
          if (!Number.isNaN(number)) {
            results.push(number);
          } else if (matches = chunk.match(STRING_REGEX)) {
            results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
          } else {
            throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name2}')`);
          }
        }
        return results;
      }
      function parseStyle(style) {
        STYLE_REGEX.lastIndex = 0;
        const results = [];
        let matches;
        while ((matches = STYLE_REGEX.exec(style)) !== null) {
          const name2 = matches[1];
          if (matches[2]) {
            const args = parseArguments(name2, matches[2]);
            results.push([name2].concat(args));
          } else {
            results.push([name2]);
          }
        }
        return results;
      }
      function buildStyle(chalk, styles) {
        const enabled = {};
        for (const layer of styles) {
          for (const style of layer.styles) {
            enabled[style[0]] = layer.inverse ? null : style.slice(1);
          }
        }
        let current = chalk;
        for (const [styleName, styles2] of Object.entries(enabled)) {
          if (!Array.isArray(styles2)) {
            continue;
          }
          if (!(styleName in current)) {
            throw new Error(`Unknown Chalk style: ${styleName}`);
          }
          current = styles2.length > 0 ? current[styleName](...styles2) : current[styleName];
        }
        return current;
      }
      module22.exports = (chalk, temporary) => {
        const styles = [];
        const chunks = [];
        let chunk = [];
        temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
          if (escapeCharacter) {
            chunk.push(unescape(escapeCharacter));
          } else if (style) {
            const string = chunk.join("");
            chunk = [];
            chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
            styles.push({ inverse, styles: parseStyle(style) });
          } else if (close) {
            if (styles.length === 0) {
              throw new Error("Found extraneous } in Chalk template literal");
            }
            chunks.push(buildStyle(chalk, styles)(chunk.join("")));
            chunk = [];
            styles.pop();
          } else {
            chunk.push(character);
          }
        });
        chunks.push(chunk.join(""));
        if (styles.length > 0) {
          const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? "" : "s"} (\`}\`)`;
          throw new Error(errMessage);
        }
        return chunks.join("");
      };
    });
    var require_source = __commonJS2((exports22, module22) => {
      "use strict";
      var ansiStyles = require_ansi_styles();
      var { stdout: stdoutColor, stderr: stderrColor } = require_supports_color();
      var {
        stringReplaceAll,
        stringEncaseCRLFWithFirstIndex
      } = require_util();
      var { isArray } = Array;
      var levelMapping = [
        "ansi",
        "ansi",
        "ansi256",
        "ansi16m"
      ];
      var styles = Object.create(null);
      var applyOptions = (object, options = {}) => {
        if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
          throw new Error("The `level` option should be an integer from 0 to 3");
        }
        const colorLevel = stdoutColor ? stdoutColor.level : 0;
        object.level = options.level === void 0 ? colorLevel : options.level;
      };
      var ChalkClass = class {
        constructor(options) {
          return chalkFactory(options);
        }
      };
      var chalkFactory = (options) => {
        const chalk2 = {};
        applyOptions(chalk2, options);
        chalk2.template = (...arguments_) => chalkTag(chalk2.template, ...arguments_);
        Object.setPrototypeOf(chalk2, Chalk.prototype);
        Object.setPrototypeOf(chalk2.template, chalk2);
        chalk2.template.constructor = () => {
          throw new Error("`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.");
        };
        chalk2.template.Instance = ChalkClass;
        return chalk2.template;
      };
      function Chalk(options) {
        return chalkFactory(options);
      }
      for (const [styleName, style] of Object.entries(ansiStyles)) {
        styles[styleName] = {
          get() {
            const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
            Object.defineProperty(this, styleName, { value: builder });
            return builder;
          }
        };
      }
      styles.visible = {
        get() {
          const builder = createBuilder(this, this._styler, true);
          Object.defineProperty(this, "visible", { value: builder });
          return builder;
        }
      };
      var usedModels = ["rgb", "hex", "keyword", "hsl", "hsv", "hwb", "ansi", "ansi256"];
      for (const model of usedModels) {
        styles[model] = {
          get() {
            const { level } = this;
            return function(...arguments_) {
              const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
              return createBuilder(this, styler, this._isEmpty);
            };
          }
        };
      }
      for (const model of usedModels) {
        const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
        styles[bgModel] = {
          get() {
            const { level } = this;
            return function(...arguments_) {
              const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
              return createBuilder(this, styler, this._isEmpty);
            };
          }
        };
      }
      var proto = Object.defineProperties(() => {
      }, __spreadProps(__spreadValues({}, styles), {
        level: {
          enumerable: true,
          get() {
            return this._generator.level;
          },
          set(level) {
            this._generator.level = level;
          }
        }
      }));
      var createStyler = (open, close, parent) => {
        let openAll;
        let closeAll;
        if (parent === void 0) {
          openAll = open;
          closeAll = close;
        } else {
          openAll = parent.openAll + open;
          closeAll = close + parent.closeAll;
        }
        return {
          open,
          close,
          openAll,
          closeAll,
          parent
        };
      };
      var createBuilder = (self, _styler, _isEmpty) => {
        const builder = (...arguments_) => {
          if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
            return applyStyle(builder, chalkTag(builder, ...arguments_));
          }
          return applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
        };
        Object.setPrototypeOf(builder, proto);
        builder._generator = self;
        builder._styler = _styler;
        builder._isEmpty = _isEmpty;
        return builder;
      };
      var applyStyle = (self, string) => {
        if (self.level <= 0 || !string) {
          return self._isEmpty ? "" : string;
        }
        let styler = self._styler;
        if (styler === void 0) {
          return string;
        }
        const { openAll, closeAll } = styler;
        if (string.indexOf("") !== -1) {
          while (styler !== void 0) {
            string = stringReplaceAll(string, styler.close, styler.open);
            styler = styler.parent;
          }
        }
        const lfIndex = string.indexOf("\n");
        if (lfIndex !== -1) {
          string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
        }
        return openAll + string + closeAll;
      };
      var template;
      var chalkTag = (chalk2, ...strings) => {
        const [firstString] = strings;
        if (!isArray(firstString) || !isArray(firstString.raw)) {
          return strings.join(" ");
        }
        const arguments_ = strings.slice(1);
        const parts = [firstString.raw[0]];
        for (let i = 1; i < firstString.length; i++) {
          parts.push(String(arguments_[i - 1]).replace(/[{}\\]/g, "\\$&"), String(firstString.raw[i]));
        }
        if (template === void 0) {
          template = require_templates();
        }
        return template(chalk2, parts.join(""));
      };
      Object.defineProperties(Chalk.prototype, styles);
      var chalk = Chalk();
      chalk.supportsColor = stdoutColor;
      chalk.stderr = Chalk({ level: stderrColor ? stderrColor.level : 0 });
      chalk.stderr.supportsColor = stderrColor;
      module22.exports = chalk;
    });
    var require_mimic_fn = __commonJS2((exports22, module22) => {
      "use strict";
      var mimicFn = (to, from) => {
        for (const prop of Reflect.ownKeys(from)) {
          Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(from, prop));
        }
        return to;
      };
      module22.exports = mimicFn;
      module22.exports.default = mimicFn;
    });
    var require_onetime = __commonJS2((exports22, module22) => {
      "use strict";
      var mimicFn = require_mimic_fn();
      var calledFunctions = new WeakMap();
      var oneTime = (fn, options = {}) => {
        if (typeof fn !== "function") {
          throw new TypeError("Expected a function");
        }
        let ret;
        let isCalled = false;
        let callCount = 0;
        const functionName = fn.displayName || fn.name || "<anonymous>";
        const onetime = function(...args) {
          calledFunctions.set(onetime, ++callCount);
          if (isCalled) {
            if (options.throw === true) {
              throw new Error(`Function \`${functionName}\` can only be called once`);
            }
            return ret;
          }
          isCalled = true;
          ret = fn.apply(this, args);
          fn = null;
          return ret;
        };
        mimicFn(onetime, fn);
        calledFunctions.set(onetime, callCount);
        return onetime;
      };
      module22.exports = oneTime;
      module22.exports.default = oneTime;
      module22.exports.callCount = (fn) => {
        if (!calledFunctions.has(fn)) {
          throw new Error(`The given function \`${fn.name}\` is not wrapped by the \`onetime\` package`);
        }
        return calledFunctions.get(fn);
      };
    });
    var require_signals = __commonJS2((exports22, module22) => {
      module22.exports = [
        "SIGABRT",
        "SIGALRM",
        "SIGHUP",
        "SIGINT",
        "SIGTERM"
      ];
      if (process.platform !== "win32") {
        module22.exports.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
      }
      if (process.platform === "linux") {
        module22.exports.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
      }
    });
    var require_signal_exit = __commonJS2((exports22, module22) => {
      var assert = require("assert");
      var signals = require_signals();
      var isWin = /^win/i.test(process.platform);
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
      module22.exports = function(cb, opts) {
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
      module22.exports.unload = unload;
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
            if (isWin && sig === "SIGHUP") {
              sig = "SIGINT";
            }
            process.kill(process.pid, sig);
          }
        };
      });
      module22.exports.signals = function() {
        return signals;
      };
      module22.exports.load = load;
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
    });
    var require_restore_cursor = __commonJS2((exports22, module22) => {
      "use strict";
      var onetime = require_onetime();
      var signalExit = require_signal_exit();
      module22.exports = onetime(() => {
        signalExit(() => {
          process.stderr.write("[?25h");
        }, { alwaysLast: true });
      });
    });
    var require_cli_cursor = __commonJS2((exports22) => {
      "use strict";
      var restoreCursor = require_restore_cursor();
      var isHidden = false;
      exports22.show = (writableStream = process.stderr) => {
        if (!writableStream.isTTY) {
          return;
        }
        isHidden = false;
        writableStream.write("[?25h");
      };
      exports22.hide = (writableStream = process.stderr) => {
        if (!writableStream.isTTY) {
          return;
        }
        restoreCursor();
        isHidden = true;
        writableStream.write("[?25l");
      };
      exports22.toggle = (force, writableStream) => {
        if (force !== void 0) {
          isHidden = force;
        }
        if (isHidden) {
          exports22.show(writableStream);
        } else {
          exports22.hide(writableStream);
        }
      };
    });
    var require_spinners = __commonJS2((exports22, module22) => {
      module22.exports = {
        dots: {
          interval: 80,
          frames: [
            "\u280B",
            "\u2819",
            "\u2839",
            "\u2838",
            "\u283C",
            "\u2834",
            "\u2826",
            "\u2827",
            "\u2807",
            "\u280F"
          ]
        },
        dots2: {
          interval: 80,
          frames: [
            "\u28FE",
            "\u28FD",
            "\u28FB",
            "\u28BF",
            "\u287F",
            "\u28DF",
            "\u28EF",
            "\u28F7"
          ]
        },
        dots3: {
          interval: 80,
          frames: [
            "\u280B",
            "\u2819",
            "\u281A",
            "\u281E",
            "\u2816",
            "\u2826",
            "\u2834",
            "\u2832",
            "\u2833",
            "\u2813"
          ]
        },
        dots4: {
          interval: 80,
          frames: [
            "\u2804",
            "\u2806",
            "\u2807",
            "\u280B",
            "\u2819",
            "\u2838",
            "\u2830",
            "\u2820",
            "\u2830",
            "\u2838",
            "\u2819",
            "\u280B",
            "\u2807",
            "\u2806"
          ]
        },
        dots5: {
          interval: 80,
          frames: [
            "\u280B",
            "\u2819",
            "\u281A",
            "\u2812",
            "\u2802",
            "\u2802",
            "\u2812",
            "\u2832",
            "\u2834",
            "\u2826",
            "\u2816",
            "\u2812",
            "\u2810",
            "\u2810",
            "\u2812",
            "\u2813",
            "\u280B"
          ]
        },
        dots6: {
          interval: 80,
          frames: [
            "\u2801",
            "\u2809",
            "\u2819",
            "\u281A",
            "\u2812",
            "\u2802",
            "\u2802",
            "\u2812",
            "\u2832",
            "\u2834",
            "\u2824",
            "\u2804",
            "\u2804",
            "\u2824",
            "\u2834",
            "\u2832",
            "\u2812",
            "\u2802",
            "\u2802",
            "\u2812",
            "\u281A",
            "\u2819",
            "\u2809",
            "\u2801"
          ]
        },
        dots7: {
          interval: 80,
          frames: [
            "\u2808",
            "\u2809",
            "\u280B",
            "\u2813",
            "\u2812",
            "\u2810",
            "\u2810",
            "\u2812",
            "\u2816",
            "\u2826",
            "\u2824",
            "\u2820",
            "\u2820",
            "\u2824",
            "\u2826",
            "\u2816",
            "\u2812",
            "\u2810",
            "\u2810",
            "\u2812",
            "\u2813",
            "\u280B",
            "\u2809",
            "\u2808"
          ]
        },
        dots8: {
          interval: 80,
          frames: [
            "\u2801",
            "\u2801",
            "\u2809",
            "\u2819",
            "\u281A",
            "\u2812",
            "\u2802",
            "\u2802",
            "\u2812",
            "\u2832",
            "\u2834",
            "\u2824",
            "\u2804",
            "\u2804",
            "\u2824",
            "\u2820",
            "\u2820",
            "\u2824",
            "\u2826",
            "\u2816",
            "\u2812",
            "\u2810",
            "\u2810",
            "\u2812",
            "\u2813",
            "\u280B",
            "\u2809",
            "\u2808",
            "\u2808"
          ]
        },
        dots9: {
          interval: 80,
          frames: [
            "\u28B9",
            "\u28BA",
            "\u28BC",
            "\u28F8",
            "\u28C7",
            "\u2867",
            "\u2857",
            "\u284F"
          ]
        },
        dots10: {
          interval: 80,
          frames: [
            "\u2884",
            "\u2882",
            "\u2881",
            "\u2841",
            "\u2848",
            "\u2850",
            "\u2860"
          ]
        },
        dots11: {
          interval: 100,
          frames: [
            "\u2801",
            "\u2802",
            "\u2804",
            "\u2840",
            "\u2880",
            "\u2820",
            "\u2810",
            "\u2808"
          ]
        },
        dots12: {
          interval: 80,
          frames: [
            "\u2880\u2800",
            "\u2840\u2800",
            "\u2804\u2800",
            "\u2882\u2800",
            "\u2842\u2800",
            "\u2805\u2800",
            "\u2883\u2800",
            "\u2843\u2800",
            "\u280D\u2800",
            "\u288B\u2800",
            "\u284B\u2800",
            "\u280D\u2801",
            "\u288B\u2801",
            "\u284B\u2801",
            "\u280D\u2809",
            "\u280B\u2809",
            "\u280B\u2809",
            "\u2809\u2819",
            "\u2809\u2819",
            "\u2809\u2829",
            "\u2808\u2899",
            "\u2808\u2859",
            "\u2888\u2829",
            "\u2840\u2899",
            "\u2804\u2859",
            "\u2882\u2829",
            "\u2842\u2898",
            "\u2805\u2858",
            "\u2883\u2828",
            "\u2843\u2890",
            "\u280D\u2850",
            "\u288B\u2820",
            "\u284B\u2880",
            "\u280D\u2841",
            "\u288B\u2801",
            "\u284B\u2801",
            "\u280D\u2809",
            "\u280B\u2809",
            "\u280B\u2809",
            "\u2809\u2819",
            "\u2809\u2819",
            "\u2809\u2829",
            "\u2808\u2899",
            "\u2808\u2859",
            "\u2808\u2829",
            "\u2800\u2899",
            "\u2800\u2859",
            "\u2800\u2829",
            "\u2800\u2898",
            "\u2800\u2858",
            "\u2800\u2828",
            "\u2800\u2890",
            "\u2800\u2850",
            "\u2800\u2820",
            "\u2800\u2880",
            "\u2800\u2840"
          ]
        },
        dots8Bit: {
          interval: 80,
          frames: [
            "\u2800",
            "\u2801",
            "\u2802",
            "\u2803",
            "\u2804",
            "\u2805",
            "\u2806",
            "\u2807",
            "\u2840",
            "\u2841",
            "\u2842",
            "\u2843",
            "\u2844",
            "\u2845",
            "\u2846",
            "\u2847",
            "\u2808",
            "\u2809",
            "\u280A",
            "\u280B",
            "\u280C",
            "\u280D",
            "\u280E",
            "\u280F",
            "\u2848",
            "\u2849",
            "\u284A",
            "\u284B",
            "\u284C",
            "\u284D",
            "\u284E",
            "\u284F",
            "\u2810",
            "\u2811",
            "\u2812",
            "\u2813",
            "\u2814",
            "\u2815",
            "\u2816",
            "\u2817",
            "\u2850",
            "\u2851",
            "\u2852",
            "\u2853",
            "\u2854",
            "\u2855",
            "\u2856",
            "\u2857",
            "\u2818",
            "\u2819",
            "\u281A",
            "\u281B",
            "\u281C",
            "\u281D",
            "\u281E",
            "\u281F",
            "\u2858",
            "\u2859",
            "\u285A",
            "\u285B",
            "\u285C",
            "\u285D",
            "\u285E",
            "\u285F",
            "\u2820",
            "\u2821",
            "\u2822",
            "\u2823",
            "\u2824",
            "\u2825",
            "\u2826",
            "\u2827",
            "\u2860",
            "\u2861",
            "\u2862",
            "\u2863",
            "\u2864",
            "\u2865",
            "\u2866",
            "\u2867",
            "\u2828",
            "\u2829",
            "\u282A",
            "\u282B",
            "\u282C",
            "\u282D",
            "\u282E",
            "\u282F",
            "\u2868",
            "\u2869",
            "\u286A",
            "\u286B",
            "\u286C",
            "\u286D",
            "\u286E",
            "\u286F",
            "\u2830",
            "\u2831",
            "\u2832",
            "\u2833",
            "\u2834",
            "\u2835",
            "\u2836",
            "\u2837",
            "\u2870",
            "\u2871",
            "\u2872",
            "\u2873",
            "\u2874",
            "\u2875",
            "\u2876",
            "\u2877",
            "\u2838",
            "\u2839",
            "\u283A",
            "\u283B",
            "\u283C",
            "\u283D",
            "\u283E",
            "\u283F",
            "\u2878",
            "\u2879",
            "\u287A",
            "\u287B",
            "\u287C",
            "\u287D",
            "\u287E",
            "\u287F",
            "\u2880",
            "\u2881",
            "\u2882",
            "\u2883",
            "\u2884",
            "\u2885",
            "\u2886",
            "\u2887",
            "\u28C0",
            "\u28C1",
            "\u28C2",
            "\u28C3",
            "\u28C4",
            "\u28C5",
            "\u28C6",
            "\u28C7",
            "\u2888",
            "\u2889",
            "\u288A",
            "\u288B",
            "\u288C",
            "\u288D",
            "\u288E",
            "\u288F",
            "\u28C8",
            "\u28C9",
            "\u28CA",
            "\u28CB",
            "\u28CC",
            "\u28CD",
            "\u28CE",
            "\u28CF",
            "\u2890",
            "\u2891",
            "\u2892",
            "\u2893",
            "\u2894",
            "\u2895",
            "\u2896",
            "\u2897",
            "\u28D0",
            "\u28D1",
            "\u28D2",
            "\u28D3",
            "\u28D4",
            "\u28D5",
            "\u28D6",
            "\u28D7",
            "\u2898",
            "\u2899",
            "\u289A",
            "\u289B",
            "\u289C",
            "\u289D",
            "\u289E",
            "\u289F",
            "\u28D8",
            "\u28D9",
            "\u28DA",
            "\u28DB",
            "\u28DC",
            "\u28DD",
            "\u28DE",
            "\u28DF",
            "\u28A0",
            "\u28A1",
            "\u28A2",
            "\u28A3",
            "\u28A4",
            "\u28A5",
            "\u28A6",
            "\u28A7",
            "\u28E0",
            "\u28E1",
            "\u28E2",
            "\u28E3",
            "\u28E4",
            "\u28E5",
            "\u28E6",
            "\u28E7",
            "\u28A8",
            "\u28A9",
            "\u28AA",
            "\u28AB",
            "\u28AC",
            "\u28AD",
            "\u28AE",
            "\u28AF",
            "\u28E8",
            "\u28E9",
            "\u28EA",
            "\u28EB",
            "\u28EC",
            "\u28ED",
            "\u28EE",
            "\u28EF",
            "\u28B0",
            "\u28B1",
            "\u28B2",
            "\u28B3",
            "\u28B4",
            "\u28B5",
            "\u28B6",
            "\u28B7",
            "\u28F0",
            "\u28F1",
            "\u28F2",
            "\u28F3",
            "\u28F4",
            "\u28F5",
            "\u28F6",
            "\u28F7",
            "\u28B8",
            "\u28B9",
            "\u28BA",
            "\u28BB",
            "\u28BC",
            "\u28BD",
            "\u28BE",
            "\u28BF",
            "\u28F8",
            "\u28F9",
            "\u28FA",
            "\u28FB",
            "\u28FC",
            "\u28FD",
            "\u28FE",
            "\u28FF"
          ]
        },
        line: {
          interval: 130,
          frames: [
            "-",
            "\\",
            "|",
            "/"
          ]
        },
        line2: {
          interval: 100,
          frames: [
            "\u2802",
            "-",
            "\u2013",
            "\u2014",
            "\u2013",
            "-"
          ]
        },
        pipe: {
          interval: 100,
          frames: [
            "\u2524",
            "\u2518",
            "\u2534",
            "\u2514",
            "\u251C",
            "\u250C",
            "\u252C",
            "\u2510"
          ]
        },
        simpleDots: {
          interval: 400,
          frames: [
            ".  ",
            ".. ",
            "...",
            "   "
          ]
        },
        simpleDotsScrolling: {
          interval: 200,
          frames: [
            ".  ",
            ".. ",
            "...",
            " ..",
            "  .",
            "   "
          ]
        },
        star: {
          interval: 70,
          frames: [
            "\u2736",
            "\u2738",
            "\u2739",
            "\u273A",
            "\u2739",
            "\u2737"
          ]
        },
        star2: {
          interval: 80,
          frames: [
            "+",
            "x",
            "*"
          ]
        },
        flip: {
          interval: 70,
          frames: [
            "_",
            "_",
            "_",
            "-",
            "`",
            "`",
            "'",
            "\xB4",
            "-",
            "_",
            "_",
            "_"
          ]
        },
        hamburger: {
          interval: 100,
          frames: [
            "\u2631",
            "\u2632",
            "\u2634"
          ]
        },
        growVertical: {
          interval: 120,
          frames: [
            "\u2581",
            "\u2583",
            "\u2584",
            "\u2585",
            "\u2586",
            "\u2587",
            "\u2586",
            "\u2585",
            "\u2584",
            "\u2583"
          ]
        },
        growHorizontal: {
          interval: 120,
          frames: [
            "\u258F",
            "\u258E",
            "\u258D",
            "\u258C",
            "\u258B",
            "\u258A",
            "\u2589",
            "\u258A",
            "\u258B",
            "\u258C",
            "\u258D",
            "\u258E"
          ]
        },
        balloon: {
          interval: 140,
          frames: [
            " ",
            ".",
            "o",
            "O",
            "@",
            "*",
            " "
          ]
        },
        balloon2: {
          interval: 120,
          frames: [
            ".",
            "o",
            "O",
            "\xB0",
            "O",
            "o",
            "."
          ]
        },
        noise: {
          interval: 100,
          frames: [
            "\u2593",
            "\u2592",
            "\u2591"
          ]
        },
        bounce: {
          interval: 120,
          frames: [
            "\u2801",
            "\u2802",
            "\u2804",
            "\u2802"
          ]
        },
        boxBounce: {
          interval: 120,
          frames: [
            "\u2596",
            "\u2598",
            "\u259D",
            "\u2597"
          ]
        },
        boxBounce2: {
          interval: 100,
          frames: [
            "\u258C",
            "\u2580",
            "\u2590",
            "\u2584"
          ]
        },
        triangle: {
          interval: 50,
          frames: [
            "\u25E2",
            "\u25E3",
            "\u25E4",
            "\u25E5"
          ]
        },
        arc: {
          interval: 100,
          frames: [
            "\u25DC",
            "\u25E0",
            "\u25DD",
            "\u25DE",
            "\u25E1",
            "\u25DF"
          ]
        },
        circle: {
          interval: 120,
          frames: [
            "\u25E1",
            "\u2299",
            "\u25E0"
          ]
        },
        squareCorners: {
          interval: 180,
          frames: [
            "\u25F0",
            "\u25F3",
            "\u25F2",
            "\u25F1"
          ]
        },
        circleQuarters: {
          interval: 120,
          frames: [
            "\u25F4",
            "\u25F7",
            "\u25F6",
            "\u25F5"
          ]
        },
        circleHalves: {
          interval: 50,
          frames: [
            "\u25D0",
            "\u25D3",
            "\u25D1",
            "\u25D2"
          ]
        },
        squish: {
          interval: 100,
          frames: [
            "\u256B",
            "\u256A"
          ]
        },
        toggle: {
          interval: 250,
          frames: [
            "\u22B6",
            "\u22B7"
          ]
        },
        toggle2: {
          interval: 80,
          frames: [
            "\u25AB",
            "\u25AA"
          ]
        },
        toggle3: {
          interval: 120,
          frames: [
            "\u25A1",
            "\u25A0"
          ]
        },
        toggle4: {
          interval: 100,
          frames: [
            "\u25A0",
            "\u25A1",
            "\u25AA",
            "\u25AB"
          ]
        },
        toggle5: {
          interval: 100,
          frames: [
            "\u25AE",
            "\u25AF"
          ]
        },
        toggle6: {
          interval: 300,
          frames: [
            "\u101D",
            "\u1040"
          ]
        },
        toggle7: {
          interval: 80,
          frames: [
            "\u29BE",
            "\u29BF"
          ]
        },
        toggle8: {
          interval: 100,
          frames: [
            "\u25CD",
            "\u25CC"
          ]
        },
        toggle9: {
          interval: 100,
          frames: [
            "\u25C9",
            "\u25CE"
          ]
        },
        toggle10: {
          interval: 100,
          frames: [
            "\u3282",
            "\u3280",
            "\u3281"
          ]
        },
        toggle11: {
          interval: 50,
          frames: [
            "\u29C7",
            "\u29C6"
          ]
        },
        toggle12: {
          interval: 120,
          frames: [
            "\u2617",
            "\u2616"
          ]
        },
        toggle13: {
          interval: 80,
          frames: [
            "=",
            "*",
            "-"
          ]
        },
        arrow: {
          interval: 100,
          frames: [
            "\u2190",
            "\u2196",
            "\u2191",
            "\u2197",
            "\u2192",
            "\u2198",
            "\u2193",
            "\u2199"
          ]
        },
        arrow2: {
          interval: 80,
          frames: [
            "\u2B06\uFE0F ",
            "\u2197\uFE0F ",
            "\u27A1\uFE0F ",
            "\u2198\uFE0F ",
            "\u2B07\uFE0F ",
            "\u2199\uFE0F ",
            "\u2B05\uFE0F ",
            "\u2196\uFE0F "
          ]
        },
        arrow3: {
          interval: 120,
          frames: [
            "\u25B9\u25B9\u25B9\u25B9\u25B9",
            "\u25B8\u25B9\u25B9\u25B9\u25B9",
            "\u25B9\u25B8\u25B9\u25B9\u25B9",
            "\u25B9\u25B9\u25B8\u25B9\u25B9",
            "\u25B9\u25B9\u25B9\u25B8\u25B9",
            "\u25B9\u25B9\u25B9\u25B9\u25B8"
          ]
        },
        bouncingBar: {
          interval: 80,
          frames: [
            "[    ]",
            "[=   ]",
            "[==  ]",
            "[=== ]",
            "[ ===]",
            "[  ==]",
            "[   =]",
            "[    ]",
            "[   =]",
            "[  ==]",
            "[ ===]",
            "[====]",
            "[=== ]",
            "[==  ]",
            "[=   ]"
          ]
        },
        bouncingBall: {
          interval: 80,
          frames: [
            "( \u25CF    )",
            "(  \u25CF   )",
            "(   \u25CF  )",
            "(    \u25CF )",
            "(     \u25CF)",
            "(    \u25CF )",
            "(   \u25CF  )",
            "(  \u25CF   )",
            "( \u25CF    )",
            "(\u25CF     )"
          ]
        },
        smiley: {
          interval: 200,
          frames: [
            "\u{1F604} ",
            "\u{1F61D} "
          ]
        },
        monkey: {
          interval: 300,
          frames: [
            "\u{1F648} ",
            "\u{1F648} ",
            "\u{1F649} ",
            "\u{1F64A} "
          ]
        },
        hearts: {
          interval: 100,
          frames: [
            "\u{1F49B} ",
            "\u{1F499} ",
            "\u{1F49C} ",
            "\u{1F49A} ",
            "\u2764\uFE0F "
          ]
        },
        clock: {
          interval: 100,
          frames: [
            "\u{1F55B} ",
            "\u{1F550} ",
            "\u{1F551} ",
            "\u{1F552} ",
            "\u{1F553} ",
            "\u{1F554} ",
            "\u{1F555} ",
            "\u{1F556} ",
            "\u{1F557} ",
            "\u{1F558} ",
            "\u{1F559} ",
            "\u{1F55A} "
          ]
        },
        earth: {
          interval: 180,
          frames: [
            "\u{1F30D} ",
            "\u{1F30E} ",
            "\u{1F30F} "
          ]
        },
        material: {
          interval: 17,
          frames: [
            "\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581",
            "\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581",
            "\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581",
            "\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588",
            "\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588",
            "\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588",
            "\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588",
            "\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588",
            "\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588",
            "\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588",
            "\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581",
            "\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2588",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581",
            "\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581\u2581"
          ]
        },
        moon: {
          interval: 80,
          frames: [
            "\u{1F311} ",
            "\u{1F312} ",
            "\u{1F313} ",
            "\u{1F314} ",
            "\u{1F315} ",
            "\u{1F316} ",
            "\u{1F317} ",
            "\u{1F318} "
          ]
        },
        runner: {
          interval: 140,
          frames: [
            "\u{1F6B6} ",
            "\u{1F3C3} "
          ]
        },
        pong: {
          interval: 80,
          frames: [
            "\u2590\u2802       \u258C",
            "\u2590\u2808       \u258C",
            "\u2590 \u2802      \u258C",
            "\u2590 \u2820      \u258C",
            "\u2590  \u2840     \u258C",
            "\u2590  \u2820     \u258C",
            "\u2590   \u2802    \u258C",
            "\u2590   \u2808    \u258C",
            "\u2590    \u2802   \u258C",
            "\u2590    \u2820   \u258C",
            "\u2590     \u2840  \u258C",
            "\u2590     \u2820  \u258C",
            "\u2590      \u2802 \u258C",
            "\u2590      \u2808 \u258C",
            "\u2590       \u2802\u258C",
            "\u2590       \u2820\u258C",
            "\u2590       \u2840\u258C",
            "\u2590      \u2820 \u258C",
            "\u2590      \u2802 \u258C",
            "\u2590     \u2808  \u258C",
            "\u2590     \u2802  \u258C",
            "\u2590    \u2820   \u258C",
            "\u2590    \u2840   \u258C",
            "\u2590   \u2820    \u258C",
            "\u2590   \u2802    \u258C",
            "\u2590  \u2808     \u258C",
            "\u2590  \u2802     \u258C",
            "\u2590 \u2820      \u258C",
            "\u2590 \u2840      \u258C",
            "\u2590\u2820       \u258C"
          ]
        },
        shark: {
          interval: 120,
          frames: [
            "\u2590|\\____________\u258C",
            "\u2590_|\\___________\u258C",
            "\u2590__|\\__________\u258C",
            "\u2590___|\\_________\u258C",
            "\u2590____|\\________\u258C",
            "\u2590_____|\\_______\u258C",
            "\u2590______|\\______\u258C",
            "\u2590_______|\\_____\u258C",
            "\u2590________|\\____\u258C",
            "\u2590_________|\\___\u258C",
            "\u2590__________|\\__\u258C",
            "\u2590___________|\\_\u258C",
            "\u2590____________|\\\u258C",
            "\u2590____________/|\u258C",
            "\u2590___________/|_\u258C",
            "\u2590__________/|__\u258C",
            "\u2590_________/|___\u258C",
            "\u2590________/|____\u258C",
            "\u2590_______/|_____\u258C",
            "\u2590______/|______\u258C",
            "\u2590_____/|_______\u258C",
            "\u2590____/|________\u258C",
            "\u2590___/|_________\u258C",
            "\u2590__/|__________\u258C",
            "\u2590_/|___________\u258C",
            "\u2590/|____________\u258C"
          ]
        },
        dqpb: {
          interval: 100,
          frames: [
            "d",
            "q",
            "p",
            "b"
          ]
        },
        weather: {
          interval: 100,
          frames: [
            "\u2600\uFE0F ",
            "\u2600\uFE0F ",
            "\u2600\uFE0F ",
            "\u{1F324} ",
            "\u26C5\uFE0F ",
            "\u{1F325} ",
            "\u2601\uFE0F ",
            "\u{1F327} ",
            "\u{1F328} ",
            "\u{1F327} ",
            "\u{1F328} ",
            "\u{1F327} ",
            "\u{1F328} ",
            "\u26C8 ",
            "\u{1F328} ",
            "\u{1F327} ",
            "\u{1F328} ",
            "\u2601\uFE0F ",
            "\u{1F325} ",
            "\u26C5\uFE0F ",
            "\u{1F324} ",
            "\u2600\uFE0F ",
            "\u2600\uFE0F "
          ]
        },
        christmas: {
          interval: 400,
          frames: [
            "\u{1F332}",
            "\u{1F384}"
          ]
        },
        grenade: {
          interval: 80,
          frames: [
            "\u060C   ",
            "\u2032   ",
            " \xB4 ",
            " \u203E ",
            "  \u2E0C",
            "  \u2E0A",
            "  |",
            "  \u204E",
            "  \u2055",
            " \u0DF4 ",
            "  \u2053",
            "   ",
            "   ",
            "   "
          ]
        },
        point: {
          interval: 125,
          frames: [
            "\u2219\u2219\u2219",
            "\u25CF\u2219\u2219",
            "\u2219\u25CF\u2219",
            "\u2219\u2219\u25CF",
            "\u2219\u2219\u2219"
          ]
        },
        layer: {
          interval: 150,
          frames: [
            "-",
            "=",
            "\u2261"
          ]
        },
        betaWave: {
          interval: 80,
          frames: [
            "\u03C1\u03B2\u03B2\u03B2\u03B2\u03B2\u03B2",
            "\u03B2\u03C1\u03B2\u03B2\u03B2\u03B2\u03B2",
            "\u03B2\u03B2\u03C1\u03B2\u03B2\u03B2\u03B2",
            "\u03B2\u03B2\u03B2\u03C1\u03B2\u03B2\u03B2",
            "\u03B2\u03B2\u03B2\u03B2\u03C1\u03B2\u03B2",
            "\u03B2\u03B2\u03B2\u03B2\u03B2\u03C1\u03B2",
            "\u03B2\u03B2\u03B2\u03B2\u03B2\u03B2\u03C1"
          ]
        }
      };
    });
    var require_cli_spinners = __commonJS2((exports22, module22) => {
      "use strict";
      var spinners = Object.assign({}, require_spinners());
      var spinnersList = Object.keys(spinners);
      Object.defineProperty(spinners, "random", {
        get() {
          const randomIndex = Math.floor(Math.random() * spinnersList.length);
          const spinnerName = spinnersList[randomIndex];
          return spinners[spinnerName];
        }
      });
      module22.exports = spinners;
      module22.exports.default = spinners;
    });
    var require_color_name2 = __commonJS2((exports22, module22) => {
      "use strict";
      module22.exports = {
        aliceblue: [240, 248, 255],
        antiquewhite: [250, 235, 215],
        aqua: [0, 255, 255],
        aquamarine: [127, 255, 212],
        azure: [240, 255, 255],
        beige: [245, 245, 220],
        bisque: [255, 228, 196],
        black: [0, 0, 0],
        blanchedalmond: [255, 235, 205],
        blue: [0, 0, 255],
        blueviolet: [138, 43, 226],
        brown: [165, 42, 42],
        burlywood: [222, 184, 135],
        cadetblue: [95, 158, 160],
        chartreuse: [127, 255, 0],
        chocolate: [210, 105, 30],
        coral: [255, 127, 80],
        cornflowerblue: [100, 149, 237],
        cornsilk: [255, 248, 220],
        crimson: [220, 20, 60],
        cyan: [0, 255, 255],
        darkblue: [0, 0, 139],
        darkcyan: [0, 139, 139],
        darkgoldenrod: [184, 134, 11],
        darkgray: [169, 169, 169],
        darkgreen: [0, 100, 0],
        darkgrey: [169, 169, 169],
        darkkhaki: [189, 183, 107],
        darkmagenta: [139, 0, 139],
        darkolivegreen: [85, 107, 47],
        darkorange: [255, 140, 0],
        darkorchid: [153, 50, 204],
        darkred: [139, 0, 0],
        darksalmon: [233, 150, 122],
        darkseagreen: [143, 188, 143],
        darkslateblue: [72, 61, 139],
        darkslategray: [47, 79, 79],
        darkslategrey: [47, 79, 79],
        darkturquoise: [0, 206, 209],
        darkviolet: [148, 0, 211],
        deeppink: [255, 20, 147],
        deepskyblue: [0, 191, 255],
        dimgray: [105, 105, 105],
        dimgrey: [105, 105, 105],
        dodgerblue: [30, 144, 255],
        firebrick: [178, 34, 34],
        floralwhite: [255, 250, 240],
        forestgreen: [34, 139, 34],
        fuchsia: [255, 0, 255],
        gainsboro: [220, 220, 220],
        ghostwhite: [248, 248, 255],
        gold: [255, 215, 0],
        goldenrod: [218, 165, 32],
        gray: [128, 128, 128],
        green: [0, 128, 0],
        greenyellow: [173, 255, 47],
        grey: [128, 128, 128],
        honeydew: [240, 255, 240],
        hotpink: [255, 105, 180],
        indianred: [205, 92, 92],
        indigo: [75, 0, 130],
        ivory: [255, 255, 240],
        khaki: [240, 230, 140],
        lavender: [230, 230, 250],
        lavenderblush: [255, 240, 245],
        lawngreen: [124, 252, 0],
        lemonchiffon: [255, 250, 205],
        lightblue: [173, 216, 230],
        lightcoral: [240, 128, 128],
        lightcyan: [224, 255, 255],
        lightgoldenrodyellow: [250, 250, 210],
        lightgray: [211, 211, 211],
        lightgreen: [144, 238, 144],
        lightgrey: [211, 211, 211],
        lightpink: [255, 182, 193],
        lightsalmon: [255, 160, 122],
        lightseagreen: [32, 178, 170],
        lightskyblue: [135, 206, 250],
        lightslategray: [119, 136, 153],
        lightslategrey: [119, 136, 153],
        lightsteelblue: [176, 196, 222],
        lightyellow: [255, 255, 224],
        lime: [0, 255, 0],
        limegreen: [50, 205, 50],
        linen: [250, 240, 230],
        magenta: [255, 0, 255],
        maroon: [128, 0, 0],
        mediumaquamarine: [102, 205, 170],
        mediumblue: [0, 0, 205],
        mediumorchid: [186, 85, 211],
        mediumpurple: [147, 112, 219],
        mediumseagreen: [60, 179, 113],
        mediumslateblue: [123, 104, 238],
        mediumspringgreen: [0, 250, 154],
        mediumturquoise: [72, 209, 204],
        mediumvioletred: [199, 21, 133],
        midnightblue: [25, 25, 112],
        mintcream: [245, 255, 250],
        mistyrose: [255, 228, 225],
        moccasin: [255, 228, 181],
        navajowhite: [255, 222, 173],
        navy: [0, 0, 128],
        oldlace: [253, 245, 230],
        olive: [128, 128, 0],
        olivedrab: [107, 142, 35],
        orange: [255, 165, 0],
        orangered: [255, 69, 0],
        orchid: [218, 112, 214],
        palegoldenrod: [238, 232, 170],
        palegreen: [152, 251, 152],
        paleturquoise: [175, 238, 238],
        palevioletred: [219, 112, 147],
        papayawhip: [255, 239, 213],
        peachpuff: [255, 218, 185],
        peru: [205, 133, 63],
        pink: [255, 192, 203],
        plum: [221, 160, 221],
        powderblue: [176, 224, 230],
        purple: [128, 0, 128],
        rebeccapurple: [102, 51, 153],
        red: [255, 0, 0],
        rosybrown: [188, 143, 143],
        royalblue: [65, 105, 225],
        saddlebrown: [139, 69, 19],
        salmon: [250, 128, 114],
        sandybrown: [244, 164, 96],
        seagreen: [46, 139, 87],
        seashell: [255, 245, 238],
        sienna: [160, 82, 45],
        silver: [192, 192, 192],
        skyblue: [135, 206, 235],
        slateblue: [106, 90, 205],
        slategray: [112, 128, 144],
        slategrey: [112, 128, 144],
        snow: [255, 250, 250],
        springgreen: [0, 255, 127],
        steelblue: [70, 130, 180],
        tan: [210, 180, 140],
        teal: [0, 128, 128],
        thistle: [216, 191, 216],
        tomato: [255, 99, 71],
        turquoise: [64, 224, 208],
        violet: [238, 130, 238],
        wheat: [245, 222, 179],
        white: [255, 255, 255],
        whitesmoke: [245, 245, 245],
        yellow: [255, 255, 0],
        yellowgreen: [154, 205, 50]
      };
    });
    var require_conversions2 = __commonJS2((exports22, module22) => {
      var cssKeywords = require_color_name2();
      var reverseKeywords = {};
      for (const key of Object.keys(cssKeywords)) {
        reverseKeywords[cssKeywords[key]] = key;
      }
      var convert = {
        rgb: { channels: 3, labels: "rgb" },
        hsl: { channels: 3, labels: "hsl" },
        hsv: { channels: 3, labels: "hsv" },
        hwb: { channels: 3, labels: "hwb" },
        cmyk: { channels: 4, labels: "cmyk" },
        xyz: { channels: 3, labels: "xyz" },
        lab: { channels: 3, labels: "lab" },
        lch: { channels: 3, labels: "lch" },
        hex: { channels: 1, labels: ["hex"] },
        keyword: { channels: 1, labels: ["keyword"] },
        ansi16: { channels: 1, labels: ["ansi16"] },
        ansi256: { channels: 1, labels: ["ansi256"] },
        hcg: { channels: 3, labels: ["h", "c", "g"] },
        apple: { channels: 3, labels: ["r16", "g16", "b16"] },
        gray: { channels: 1, labels: ["gray"] }
      };
      module22.exports = convert;
      for (const model of Object.keys(convert)) {
        if (!("channels" in convert[model])) {
          throw new Error("missing channels property: " + model);
        }
        if (!("labels" in convert[model])) {
          throw new Error("missing channel labels property: " + model);
        }
        if (convert[model].labels.length !== convert[model].channels) {
          throw new Error("channel and label counts mismatch: " + model);
        }
        const { channels, labels } = convert[model];
        delete convert[model].channels;
        delete convert[model].labels;
        Object.defineProperty(convert[model], "channels", { value: channels });
        Object.defineProperty(convert[model], "labels", { value: labels });
      }
      convert.rgb.hsl = function(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const delta = max - min;
        let h;
        let s;
        if (max === min) {
          h = 0;
        } else if (r === max) {
          h = (g - b) / delta;
        } else if (g === max) {
          h = 2 + (b - r) / delta;
        } else if (b === max) {
          h = 4 + (r - g) / delta;
        }
        h = Math.min(h * 60, 360);
        if (h < 0) {
          h += 360;
        }
        const l = (min + max) / 2;
        if (max === min) {
          s = 0;
        } else if (l <= 0.5) {
          s = delta / (max + min);
        } else {
          s = delta / (2 - max - min);
        }
        return [h, s * 100, l * 100];
      };
      convert.rgb.hsv = function(rgb) {
        let rdif;
        let gdif;
        let bdif;
        let h;
        let s;
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const v = Math.max(r, g, b);
        const diff = v - Math.min(r, g, b);
        const diffc = function(c) {
          return (v - c) / 6 / diff + 1 / 2;
        };
        if (diff === 0) {
          h = 0;
          s = 0;
        } else {
          s = diff / v;
          rdif = diffc(r);
          gdif = diffc(g);
          bdif = diffc(b);
          if (r === v) {
            h = bdif - gdif;
          } else if (g === v) {
            h = 1 / 3 + rdif - bdif;
          } else if (b === v) {
            h = 2 / 3 + gdif - rdif;
          }
          if (h < 0) {
            h += 1;
          } else if (h > 1) {
            h -= 1;
          }
        }
        return [
          h * 360,
          s * 100,
          v * 100
        ];
      };
      convert.rgb.hwb = function(rgb) {
        const r = rgb[0];
        const g = rgb[1];
        let b = rgb[2];
        const h = convert.rgb.hsl(rgb)[0];
        const w = 1 / 255 * Math.min(r, Math.min(g, b));
        b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
        return [h, w * 100, b * 100];
      };
      convert.rgb.cmyk = function(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const k = Math.min(1 - r, 1 - g, 1 - b);
        const c = (1 - r - k) / (1 - k) || 0;
        const m = (1 - g - k) / (1 - k) || 0;
        const y = (1 - b - k) / (1 - k) || 0;
        return [c * 100, m * 100, y * 100, k * 100];
      };
      function comparativeDistance(x, y) {
        return (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2;
      }
      convert.rgb.keyword = function(rgb) {
        const reversed = reverseKeywords[rgb];
        if (reversed) {
          return reversed;
        }
        let currentClosestDistance = Infinity;
        let currentClosestKeyword;
        for (const keyword of Object.keys(cssKeywords)) {
          const value = cssKeywords[keyword];
          const distance = comparativeDistance(rgb, value);
          if (distance < currentClosestDistance) {
            currentClosestDistance = distance;
            currentClosestKeyword = keyword;
          }
        }
        return currentClosestKeyword;
      };
      convert.keyword.rgb = function(keyword) {
        return cssKeywords[keyword];
      };
      convert.rgb.xyz = function(rgb) {
        let r = rgb[0] / 255;
        let g = rgb[1] / 255;
        let b = rgb[2] / 255;
        r = r > 0.04045 ? ((r + 0.055) / 1.055) ** 2.4 : r / 12.92;
        g = g > 0.04045 ? ((g + 0.055) / 1.055) ** 2.4 : g / 12.92;
        b = b > 0.04045 ? ((b + 0.055) / 1.055) ** 2.4 : b / 12.92;
        const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
        const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
        const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
        return [x * 100, y * 100, z * 100];
      };
      convert.rgb.lab = function(rgb) {
        const xyz = convert.rgb.xyz(rgb);
        let x = xyz[0];
        let y = xyz[1];
        let z = xyz[2];
        x /= 95.047;
        y /= 100;
        z /= 108.883;
        x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
        y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
        z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
        const l = 116 * y - 16;
        const a = 500 * (x - y);
        const b = 200 * (y - z);
        return [l, a, b];
      };
      convert.hsl.rgb = function(hsl) {
        const h = hsl[0] / 360;
        const s = hsl[1] / 100;
        const l = hsl[2] / 100;
        let t2;
        let t3;
        let val;
        if (s === 0) {
          val = l * 255;
          return [val, val, val];
        }
        if (l < 0.5) {
          t2 = l * (1 + s);
        } else {
          t2 = l + s - l * s;
        }
        const t1 = 2 * l - t2;
        const rgb = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
          t3 = h + 1 / 3 * -(i - 1);
          if (t3 < 0) {
            t3++;
          }
          if (t3 > 1) {
            t3--;
          }
          if (6 * t3 < 1) {
            val = t1 + (t2 - t1) * 6 * t3;
          } else if (2 * t3 < 1) {
            val = t2;
          } else if (3 * t3 < 2) {
            val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
          } else {
            val = t1;
          }
          rgb[i] = val * 255;
        }
        return rgb;
      };
      convert.hsl.hsv = function(hsl) {
        const h = hsl[0];
        let s = hsl[1] / 100;
        let l = hsl[2] / 100;
        let smin = s;
        const lmin = Math.max(l, 0.01);
        l *= 2;
        s *= l <= 1 ? l : 2 - l;
        smin *= lmin <= 1 ? lmin : 2 - lmin;
        const v = (l + s) / 2;
        const sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
        return [h, sv * 100, v * 100];
      };
      convert.hsv.rgb = function(hsv) {
        const h = hsv[0] / 60;
        const s = hsv[1] / 100;
        let v = hsv[2] / 100;
        const hi = Math.floor(h) % 6;
        const f = h - Math.floor(h);
        const p = 255 * v * (1 - s);
        const q = 255 * v * (1 - s * f);
        const t = 255 * v * (1 - s * (1 - f));
        v *= 255;
        switch (hi) {
          case 0:
            return [v, t, p];
          case 1:
            return [q, v, p];
          case 2:
            return [p, v, t];
          case 3:
            return [p, q, v];
          case 4:
            return [t, p, v];
          case 5:
            return [v, p, q];
        }
      };
      convert.hsv.hsl = function(hsv) {
        const h = hsv[0];
        const s = hsv[1] / 100;
        const v = hsv[2] / 100;
        const vmin = Math.max(v, 0.01);
        let sl;
        let l;
        l = (2 - s) * v;
        const lmin = (2 - s) * vmin;
        sl = s * vmin;
        sl /= lmin <= 1 ? lmin : 2 - lmin;
        sl = sl || 0;
        l /= 2;
        return [h, sl * 100, l * 100];
      };
      convert.hwb.rgb = function(hwb) {
        const h = hwb[0] / 360;
        let wh = hwb[1] / 100;
        let bl = hwb[2] / 100;
        const ratio = wh + bl;
        let f;
        if (ratio > 1) {
          wh /= ratio;
          bl /= ratio;
        }
        const i = Math.floor(6 * h);
        const v = 1 - bl;
        f = 6 * h - i;
        if ((i & 1) !== 0) {
          f = 1 - f;
        }
        const n = wh + f * (v - wh);
        let r;
        let g;
        let b;
        switch (i) {
          default:
          case 6:
          case 0:
            r = v;
            g = n;
            b = wh;
            break;
          case 1:
            r = n;
            g = v;
            b = wh;
            break;
          case 2:
            r = wh;
            g = v;
            b = n;
            break;
          case 3:
            r = wh;
            g = n;
            b = v;
            break;
          case 4:
            r = n;
            g = wh;
            b = v;
            break;
          case 5:
            r = v;
            g = wh;
            b = n;
            break;
        }
        return [r * 255, g * 255, b * 255];
      };
      convert.cmyk.rgb = function(cmyk) {
        const c = cmyk[0] / 100;
        const m = cmyk[1] / 100;
        const y = cmyk[2] / 100;
        const k = cmyk[3] / 100;
        const r = 1 - Math.min(1, c * (1 - k) + k);
        const g = 1 - Math.min(1, m * (1 - k) + k);
        const b = 1 - Math.min(1, y * (1 - k) + k);
        return [r * 255, g * 255, b * 255];
      };
      convert.xyz.rgb = function(xyz) {
        const x = xyz[0] / 100;
        const y = xyz[1] / 100;
        const z = xyz[2] / 100;
        let r;
        let g;
        let b;
        r = x * 3.2406 + y * -1.5372 + z * -0.4986;
        g = x * -0.9689 + y * 1.8758 + z * 0.0415;
        b = x * 0.0557 + y * -0.204 + z * 1.057;
        r = r > 31308e-7 ? 1.055 * r ** (1 / 2.4) - 0.055 : r * 12.92;
        g = g > 31308e-7 ? 1.055 * g ** (1 / 2.4) - 0.055 : g * 12.92;
        b = b > 31308e-7 ? 1.055 * b ** (1 / 2.4) - 0.055 : b * 12.92;
        r = Math.min(Math.max(0, r), 1);
        g = Math.min(Math.max(0, g), 1);
        b = Math.min(Math.max(0, b), 1);
        return [r * 255, g * 255, b * 255];
      };
      convert.xyz.lab = function(xyz) {
        let x = xyz[0];
        let y = xyz[1];
        let z = xyz[2];
        x /= 95.047;
        y /= 100;
        z /= 108.883;
        x = x > 8856e-6 ? x ** (1 / 3) : 7.787 * x + 16 / 116;
        y = y > 8856e-6 ? y ** (1 / 3) : 7.787 * y + 16 / 116;
        z = z > 8856e-6 ? z ** (1 / 3) : 7.787 * z + 16 / 116;
        const l = 116 * y - 16;
        const a = 500 * (x - y);
        const b = 200 * (y - z);
        return [l, a, b];
      };
      convert.lab.xyz = function(lab) {
        const l = lab[0];
        const a = lab[1];
        const b = lab[2];
        let x;
        let y;
        let z;
        y = (l + 16) / 116;
        x = a / 500 + y;
        z = y - b / 200;
        const y2 = y ** 3;
        const x2 = x ** 3;
        const z2 = z ** 3;
        y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
        x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
        z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
        x *= 95.047;
        y *= 100;
        z *= 108.883;
        return [x, y, z];
      };
      convert.lab.lch = function(lab) {
        const l = lab[0];
        const a = lab[1];
        const b = lab[2];
        let h;
        const hr = Math.atan2(b, a);
        h = hr * 360 / 2 / Math.PI;
        if (h < 0) {
          h += 360;
        }
        const c = Math.sqrt(a * a + b * b);
        return [l, c, h];
      };
      convert.lch.lab = function(lch) {
        const l = lch[0];
        const c = lch[1];
        const h = lch[2];
        const hr = h / 360 * 2 * Math.PI;
        const a = c * Math.cos(hr);
        const b = c * Math.sin(hr);
        return [l, a, b];
      };
      convert.rgb.ansi16 = function(args, saturation = null) {
        const [r, g, b] = args;
        let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation;
        value = Math.round(value / 50);
        if (value === 0) {
          return 30;
        }
        let ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
        if (value === 2) {
          ansi += 60;
        }
        return ansi;
      };
      convert.hsv.ansi16 = function(args) {
        return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
      };
      convert.rgb.ansi256 = function(args) {
        const r = args[0];
        const g = args[1];
        const b = args[2];
        if (r === g && g === b) {
          if (r < 8) {
            return 16;
          }
          if (r > 248) {
            return 231;
          }
          return Math.round((r - 8) / 247 * 24) + 232;
        }
        const ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
        return ansi;
      };
      convert.ansi16.rgb = function(args) {
        let color = args % 10;
        if (color === 0 || color === 7) {
          if (args > 50) {
            color += 3.5;
          }
          color = color / 10.5 * 255;
          return [color, color, color];
        }
        const mult = (~~(args > 50) + 1) * 0.5;
        const r = (color & 1) * mult * 255;
        const g = (color >> 1 & 1) * mult * 255;
        const b = (color >> 2 & 1) * mult * 255;
        return [r, g, b];
      };
      convert.ansi256.rgb = function(args) {
        if (args >= 232) {
          const c = (args - 232) * 10 + 8;
          return [c, c, c];
        }
        args -= 16;
        let rem;
        const r = Math.floor(args / 36) / 5 * 255;
        const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
        const b = rem % 6 / 5 * 255;
        return [r, g, b];
      };
      convert.rgb.hex = function(args) {
        const integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
        const string = integer.toString(16).toUpperCase();
        return "000000".substring(string.length) + string;
      };
      convert.hex.rgb = function(args) {
        const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
        if (!match) {
          return [0, 0, 0];
        }
        let colorString = match[0];
        if (match[0].length === 3) {
          colorString = colorString.split("").map((char) => {
            return char + char;
          }).join("");
        }
        const integer = parseInt(colorString, 16);
        const r = integer >> 16 & 255;
        const g = integer >> 8 & 255;
        const b = integer & 255;
        return [r, g, b];
      };
      convert.rgb.hcg = function(rgb) {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;
        const max = Math.max(Math.max(r, g), b);
        const min = Math.min(Math.min(r, g), b);
        const chroma = max - min;
        let grayscale;
        let hue;
        if (chroma < 1) {
          grayscale = min / (1 - chroma);
        } else {
          grayscale = 0;
        }
        if (chroma <= 0) {
          hue = 0;
        } else if (max === r) {
          hue = (g - b) / chroma % 6;
        } else if (max === g) {
          hue = 2 + (b - r) / chroma;
        } else {
          hue = 4 + (r - g) / chroma;
        }
        hue /= 6;
        hue %= 1;
        return [hue * 360, chroma * 100, grayscale * 100];
      };
      convert.hsl.hcg = function(hsl) {
        const s = hsl[1] / 100;
        const l = hsl[2] / 100;
        const c = l < 0.5 ? 2 * s * l : 2 * s * (1 - l);
        let f = 0;
        if (c < 1) {
          f = (l - 0.5 * c) / (1 - c);
        }
        return [hsl[0], c * 100, f * 100];
      };
      convert.hsv.hcg = function(hsv) {
        const s = hsv[1] / 100;
        const v = hsv[2] / 100;
        const c = s * v;
        let f = 0;
        if (c < 1) {
          f = (v - c) / (1 - c);
        }
        return [hsv[0], c * 100, f * 100];
      };
      convert.hcg.rgb = function(hcg) {
        const h = hcg[0] / 360;
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        if (c === 0) {
          return [g * 255, g * 255, g * 255];
        }
        const pure = [0, 0, 0];
        const hi = h % 1 * 6;
        const v = hi % 1;
        const w = 1 - v;
        let mg = 0;
        switch (Math.floor(hi)) {
          case 0:
            pure[0] = 1;
            pure[1] = v;
            pure[2] = 0;
            break;
          case 1:
            pure[0] = w;
            pure[1] = 1;
            pure[2] = 0;
            break;
          case 2:
            pure[0] = 0;
            pure[1] = 1;
            pure[2] = v;
            break;
          case 3:
            pure[0] = 0;
            pure[1] = w;
            pure[2] = 1;
            break;
          case 4:
            pure[0] = v;
            pure[1] = 0;
            pure[2] = 1;
            break;
          default:
            pure[0] = 1;
            pure[1] = 0;
            pure[2] = w;
        }
        mg = (1 - c) * g;
        return [
          (c * pure[0] + mg) * 255,
          (c * pure[1] + mg) * 255,
          (c * pure[2] + mg) * 255
        ];
      };
      convert.hcg.hsv = function(hcg) {
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        const v = c + g * (1 - c);
        let f = 0;
        if (v > 0) {
          f = c / v;
        }
        return [hcg[0], f * 100, v * 100];
      };
      convert.hcg.hsl = function(hcg) {
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        const l = g * (1 - c) + 0.5 * c;
        let s = 0;
        if (l > 0 && l < 0.5) {
          s = c / (2 * l);
        } else if (l >= 0.5 && l < 1) {
          s = c / (2 * (1 - l));
        }
        return [hcg[0], s * 100, l * 100];
      };
      convert.hcg.hwb = function(hcg) {
        const c = hcg[1] / 100;
        const g = hcg[2] / 100;
        const v = c + g * (1 - c);
        return [hcg[0], (v - c) * 100, (1 - v) * 100];
      };
      convert.hwb.hcg = function(hwb) {
        const w = hwb[1] / 100;
        const b = hwb[2] / 100;
        const v = 1 - b;
        const c = v - w;
        let g = 0;
        if (c < 1) {
          g = (v - c) / (1 - c);
        }
        return [hwb[0], c * 100, g * 100];
      };
      convert.apple.rgb = function(apple) {
        return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
      };
      convert.rgb.apple = function(rgb) {
        return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
      };
      convert.gray.rgb = function(args) {
        return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
      };
      convert.gray.hsl = function(args) {
        return [0, 0, args[0]];
      };
      convert.gray.hsv = convert.gray.hsl;
      convert.gray.hwb = function(gray) {
        return [0, 100, gray[0]];
      };
      convert.gray.cmyk = function(gray) {
        return [0, 0, 0, gray[0]];
      };
      convert.gray.lab = function(gray) {
        return [gray[0], 0, 0];
      };
      convert.gray.hex = function(gray) {
        const val = Math.round(gray[0] / 100 * 255) & 255;
        const integer = (val << 16) + (val << 8) + val;
        const string = integer.toString(16).toUpperCase();
        return "000000".substring(string.length) + string;
      };
      convert.rgb.gray = function(rgb) {
        const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
        return [val / 255 * 100];
      };
    });
    var require_route2 = __commonJS2((exports22, module22) => {
      var conversions = require_conversions2();
      function buildGraph() {
        const graph = {};
        const models = Object.keys(conversions);
        for (let len = models.length, i = 0; i < len; i++) {
          graph[models[i]] = {
            distance: -1,
            parent: null
          };
        }
        return graph;
      }
      function deriveBFS(fromModel) {
        const graph = buildGraph();
        const queue = [fromModel];
        graph[fromModel].distance = 0;
        while (queue.length) {
          const current = queue.pop();
          const adjacents = Object.keys(conversions[current]);
          for (let len = adjacents.length, i = 0; i < len; i++) {
            const adjacent = adjacents[i];
            const node = graph[adjacent];
            if (node.distance === -1) {
              node.distance = graph[current].distance + 1;
              node.parent = current;
              queue.unshift(adjacent);
            }
          }
        }
        return graph;
      }
      function link(from, to) {
        return function(args) {
          return to(from(args));
        };
      }
      function wrapConversion(toModel, graph) {
        const path = [graph[toModel].parent, toModel];
        let fn = conversions[graph[toModel].parent][toModel];
        let cur = graph[toModel].parent;
        while (graph[cur].parent) {
          path.unshift(graph[cur].parent);
          fn = link(conversions[graph[cur].parent][cur], fn);
          cur = graph[cur].parent;
        }
        fn.conversion = path;
        return fn;
      }
      module22.exports = function(fromModel) {
        const graph = deriveBFS(fromModel);
        const conversion = {};
        const models = Object.keys(graph);
        for (let len = models.length, i = 0; i < len; i++) {
          const toModel = models[i];
          const node = graph[toModel];
          if (node.parent === null) {
            continue;
          }
          conversion[toModel] = wrapConversion(toModel, graph);
        }
        return conversion;
      };
    });
    var require_color_convert2 = __commonJS2((exports22, module22) => {
      var conversions = require_conversions2();
      var route = require_route2();
      var convert = {};
      var models = Object.keys(conversions);
      function wrapRaw(fn) {
        const wrappedFn = function(...args) {
          const arg0 = args[0];
          if (arg0 === void 0 || arg0 === null) {
            return arg0;
          }
          if (arg0.length > 1) {
            args = arg0;
          }
          return fn(args);
        };
        if ("conversion" in fn) {
          wrappedFn.conversion = fn.conversion;
        }
        return wrappedFn;
      }
      function wrapRounded(fn) {
        const wrappedFn = function(...args) {
          const arg0 = args[0];
          if (arg0 === void 0 || arg0 === null) {
            return arg0;
          }
          if (arg0.length > 1) {
            args = arg0;
          }
          const result = fn(args);
          if (typeof result === "object") {
            for (let len = result.length, i = 0; i < len; i++) {
              result[i] = Math.round(result[i]);
            }
          }
          return result;
        };
        if ("conversion" in fn) {
          wrappedFn.conversion = fn.conversion;
        }
        return wrappedFn;
      }
      models.forEach((fromModel) => {
        convert[fromModel] = {};
        Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
        Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
        const routes = route(fromModel);
        const routeModels = Object.keys(routes);
        routeModels.forEach((toModel) => {
          const fn = routes[toModel];
          convert[fromModel][toModel] = wrapRounded(fn);
          convert[fromModel][toModel].raw = wrapRaw(fn);
        });
      });
      module22.exports = convert;
    });
    var require_ansi_styles2 = __commonJS2((exports22, module22) => {
      "use strict";
      var wrapAnsi16 = (fn, offset) => (...args) => {
        const code = fn(...args);
        return `[${code + offset}m`;
      };
      var wrapAnsi256 = (fn, offset) => (...args) => {
        const code = fn(...args);
        return `[${38 + offset};5;${code}m`;
      };
      var wrapAnsi16m = (fn, offset) => (...args) => {
        const rgb = fn(...args);
        return `[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
      };
      var ansi2ansi = (n) => n;
      var rgb2rgb = (r, g, b) => [r, g, b];
      var setLazyProperty = (object, property, get) => {
        Object.defineProperty(object, property, {
          get: () => {
            const value = get();
            Object.defineProperty(object, property, {
              value,
              enumerable: true,
              configurable: true
            });
            return value;
          },
          enumerable: true,
          configurable: true
        });
      };
      var colorConvert;
      var makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
        if (colorConvert === void 0) {
          colorConvert = require_color_convert2();
        }
        const offset = isBackground ? 10 : 0;
        const styles = {};
        for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
          const name2 = sourceSpace === "ansi16" ? "ansi" : sourceSpace;
          if (sourceSpace === targetSpace) {
            styles[name2] = wrap(identity, offset);
          } else if (typeof suite === "object") {
            styles[name2] = wrap(suite[targetSpace], offset);
          }
        }
        return styles;
      };
      function assembleStyles() {
        const codes = new Map();
        const styles = {
          modifier: {
            reset: [0, 0],
            bold: [1, 22],
            dim: [2, 22],
            italic: [3, 23],
            underline: [4, 24],
            inverse: [7, 27],
            hidden: [8, 28],
            strikethrough: [9, 29]
          },
          color: {
            black: [30, 39],
            red: [31, 39],
            green: [32, 39],
            yellow: [33, 39],
            blue: [34, 39],
            magenta: [35, 39],
            cyan: [36, 39],
            white: [37, 39],
            blackBright: [90, 39],
            redBright: [91, 39],
            greenBright: [92, 39],
            yellowBright: [93, 39],
            blueBright: [94, 39],
            magentaBright: [95, 39],
            cyanBright: [96, 39],
            whiteBright: [97, 39]
          },
          bgColor: {
            bgBlack: [40, 49],
            bgRed: [41, 49],
            bgGreen: [42, 49],
            bgYellow: [43, 49],
            bgBlue: [44, 49],
            bgMagenta: [45, 49],
            bgCyan: [46, 49],
            bgWhite: [47, 49],
            bgBlackBright: [100, 49],
            bgRedBright: [101, 49],
            bgGreenBright: [102, 49],
            bgYellowBright: [103, 49],
            bgBlueBright: [104, 49],
            bgMagentaBright: [105, 49],
            bgCyanBright: [106, 49],
            bgWhiteBright: [107, 49]
          }
        };
        styles.color.gray = styles.color.blackBright;
        styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
        styles.color.grey = styles.color.blackBright;
        styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;
        for (const [groupName, group] of Object.entries(styles)) {
          for (const [styleName, style] of Object.entries(group)) {
            styles[styleName] = {
              open: `[${style[0]}m`,
              close: `[${style[1]}m`
            };
            group[styleName] = styles[styleName];
            codes.set(style[0], style[1]);
          }
          Object.defineProperty(styles, groupName, {
            value: group,
            enumerable: false
          });
        }
        Object.defineProperty(styles, "codes", {
          value: codes,
          enumerable: false
        });
        styles.color.close = "[39m";
        styles.bgColor.close = "[49m";
        setLazyProperty(styles.color, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, false));
        setLazyProperty(styles.color, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, false));
        setLazyProperty(styles.color, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, false));
        setLazyProperty(styles.bgColor, "ansi", () => makeDynamicStyles(wrapAnsi16, "ansi16", ansi2ansi, true));
        setLazyProperty(styles.bgColor, "ansi256", () => makeDynamicStyles(wrapAnsi256, "ansi256", ansi2ansi, true));
        setLazyProperty(styles.bgColor, "ansi16m", () => makeDynamicStyles(wrapAnsi16m, "rgb", rgb2rgb, true));
        return styles;
      }
      Object.defineProperty(module22, "exports", {
        enumerable: true,
        get: assembleStyles
      });
    });
    var require_has_flag2 = __commonJS2((exports22, module22) => {
      "use strict";
      module22.exports = (flag, argv = process.argv) => {
        const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
        const position = argv.indexOf(prefix + flag);
        const terminatorPosition = argv.indexOf("--");
        return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
      };
    });
    var require_supports_color2 = __commonJS2((exports22, module22) => {
      "use strict";
      var os = require("os");
      var tty = require("tty");
      var hasFlag = require_has_flag2();
      var { env } = process;
      var forceColor;
      if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
        forceColor = 0;
      } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
        forceColor = 1;
      }
      if ("FORCE_COLOR" in env) {
        if (env.FORCE_COLOR === "true") {
          forceColor = 1;
        } else if (env.FORCE_COLOR === "false") {
          forceColor = 0;
        } else {
          forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
        }
      }
      function translateLevel(level) {
        if (level === 0) {
          return false;
        }
        return {
          level,
          hasBasic: true,
          has256: level >= 2,
          has16m: level >= 3
        };
      }
      function supportsColor(haveStream, streamIsTTY) {
        if (forceColor === 0) {
          return 0;
        }
        if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
          return 3;
        }
        if (hasFlag("color=256")) {
          return 2;
        }
        if (haveStream && !streamIsTTY && forceColor === void 0) {
          return 0;
        }
        const min = forceColor || 0;
        if (env.TERM === "dumb") {
          return min;
        }
        if (process.platform === "win32") {
          const osRelease = os.release().split(".");
          if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
            return Number(osRelease[2]) >= 14931 ? 3 : 2;
          }
          return 1;
        }
        if ("CI" in env) {
          if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
            return 1;
          }
          return min;
        }
        if ("TEAMCITY_VERSION" in env) {
          return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
        }
        if ("GITHUB_ACTIONS" in env) {
          return 1;
        }
        if (env.COLORTERM === "truecolor") {
          return 3;
        }
        if ("TERM_PROGRAM" in env) {
          const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
          switch (env.TERM_PROGRAM) {
            case "iTerm.app":
              return version >= 3 ? 3 : 2;
            case "Apple_Terminal":
              return 2;
          }
        }
        if (/-256(color)?$/i.test(env.TERM)) {
          return 2;
        }
        if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
          return 1;
        }
        if ("COLORTERM" in env) {
          return 1;
        }
        return min;
      }
      function getSupportLevel(stream) {
        const level = supportsColor(stream, stream && stream.isTTY);
        return translateLevel(level);
      }
      module22.exports = {
        supportsColor: getSupportLevel,
        stdout: translateLevel(supportsColor(true, tty.isatty(1))),
        stderr: translateLevel(supportsColor(true, tty.isatty(2)))
      };
    });
    var require_util2 = __commonJS2((exports22, module22) => {
      "use strict";
      var stringReplaceAll = (string, substring, replacer) => {
        let index = string.indexOf(substring);
        if (index === -1) {
          return string;
        }
        const substringLength = substring.length;
        let endIndex = 0;
        let returnValue = "";
        do {
          returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
          endIndex = index + substringLength;
          index = string.indexOf(substring, endIndex);
        } while (index !== -1);
        returnValue += string.substr(endIndex);
        return returnValue;
      };
      var stringEncaseCRLFWithFirstIndex = (string, prefix, postfix, index) => {
        let endIndex = 0;
        let returnValue = "";
        do {
          const gotCR = string[index - 1] === "\r";
          returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
          endIndex = index + 1;
          index = string.indexOf("\n", endIndex);
        } while (index !== -1);
        returnValue += string.substr(endIndex);
        return returnValue;
      };
      module22.exports = {
        stringReplaceAll,
        stringEncaseCRLFWithFirstIndex
      };
    });
    var require_templates2 = __commonJS2((exports22, module22) => {
      "use strict";
      var TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
      var STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
      var STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
      var ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;
      var ESCAPES = new Map([
        ["n", "\n"],
        ["r", "\r"],
        ["t", "	"],
        ["b", "\b"],
        ["f", "\f"],
        ["v", "\v"],
        ["0", "\0"],
        ["\\", "\\"],
        ["e", ""],
        ["a", "\x07"]
      ]);
      function unescape(c) {
        const u = c[0] === "u";
        const bracket = c[1] === "{";
        if (u && !bracket && c.length === 5 || c[0] === "x" && c.length === 3) {
          return String.fromCharCode(parseInt(c.slice(1), 16));
        }
        if (u && bracket) {
          return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
        }
        return ESCAPES.get(c) || c;
      }
      function parseArguments(name2, arguments_) {
        const results = [];
        const chunks = arguments_.trim().split(/\s*,\s*/g);
        let matches;
        for (const chunk of chunks) {
          const number = Number(chunk);
          if (!Number.isNaN(number)) {
            results.push(number);
          } else if (matches = chunk.match(STRING_REGEX)) {
            results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
          } else {
            throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name2}')`);
          }
        }
        return results;
      }
      function parseStyle(style) {
        STYLE_REGEX.lastIndex = 0;
        const results = [];
        let matches;
        while ((matches = STYLE_REGEX.exec(style)) !== null) {
          const name2 = matches[1];
          if (matches[2]) {
            const args = parseArguments(name2, matches[2]);
            results.push([name2].concat(args));
          } else {
            results.push([name2]);
          }
        }
        return results;
      }
      function buildStyle(chalk, styles) {
        const enabled = {};
        for (const layer of styles) {
          for (const style of layer.styles) {
            enabled[style[0]] = layer.inverse ? null : style.slice(1);
          }
        }
        let current = chalk;
        for (const [styleName, styles2] of Object.entries(enabled)) {
          if (!Array.isArray(styles2)) {
            continue;
          }
          if (!(styleName in current)) {
            throw new Error(`Unknown Chalk style: ${styleName}`);
          }
          current = styles2.length > 0 ? current[styleName](...styles2) : current[styleName];
        }
        return current;
      }
      module22.exports = (chalk, temporary) => {
        const styles = [];
        const chunks = [];
        let chunk = [];
        temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
          if (escapeCharacter) {
            chunk.push(unescape(escapeCharacter));
          } else if (style) {
            const string = chunk.join("");
            chunk = [];
            chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
            styles.push({ inverse, styles: parseStyle(style) });
          } else if (close) {
            if (styles.length === 0) {
              throw new Error("Found extraneous } in Chalk template literal");
            }
            chunks.push(buildStyle(chalk, styles)(chunk.join("")));
            chunk = [];
            styles.pop();
          } else {
            chunk.push(character);
          }
        });
        chunks.push(chunk.join(""));
        if (styles.length > 0) {
          const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? "" : "s"} (\`}\`)`;
          throw new Error(errMessage);
        }
        return chunks.join("");
      };
    });
    var require_source2 = __commonJS2((exports22, module22) => {
      "use strict";
      var ansiStyles = require_ansi_styles2();
      var { stdout: stdoutColor, stderr: stderrColor } = require_supports_color2();
      var {
        stringReplaceAll,
        stringEncaseCRLFWithFirstIndex
      } = require_util2();
      var { isArray } = Array;
      var levelMapping = [
        "ansi",
        "ansi",
        "ansi256",
        "ansi16m"
      ];
      var styles = Object.create(null);
      var applyOptions = (object, options = {}) => {
        if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
          throw new Error("The `level` option should be an integer from 0 to 3");
        }
        const colorLevel = stdoutColor ? stdoutColor.level : 0;
        object.level = options.level === void 0 ? colorLevel : options.level;
      };
      var ChalkClass = class {
        constructor(options) {
          return chalkFactory(options);
        }
      };
      var chalkFactory = (options) => {
        const chalk2 = {};
        applyOptions(chalk2, options);
        chalk2.template = (...arguments_) => chalkTag(chalk2.template, ...arguments_);
        Object.setPrototypeOf(chalk2, Chalk.prototype);
        Object.setPrototypeOf(chalk2.template, chalk2);
        chalk2.template.constructor = () => {
          throw new Error("`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.");
        };
        chalk2.template.Instance = ChalkClass;
        return chalk2.template;
      };
      function Chalk(options) {
        return chalkFactory(options);
      }
      for (const [styleName, style] of Object.entries(ansiStyles)) {
        styles[styleName] = {
          get() {
            const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
            Object.defineProperty(this, styleName, { value: builder });
            return builder;
          }
        };
      }
      styles.visible = {
        get() {
          const builder = createBuilder(this, this._styler, true);
          Object.defineProperty(this, "visible", { value: builder });
          return builder;
        }
      };
      var usedModels = ["rgb", "hex", "keyword", "hsl", "hsv", "hwb", "ansi", "ansi256"];
      for (const model of usedModels) {
        styles[model] = {
          get() {
            const { level } = this;
            return function(...arguments_) {
              const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
              return createBuilder(this, styler, this._isEmpty);
            };
          }
        };
      }
      for (const model of usedModels) {
        const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
        styles[bgModel] = {
          get() {
            const { level } = this;
            return function(...arguments_) {
              const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
              return createBuilder(this, styler, this._isEmpty);
            };
          }
        };
      }
      var proto = Object.defineProperties(() => {
      }, __spreadProps(__spreadValues({}, styles), {
        level: {
          enumerable: true,
          get() {
            return this._generator.level;
          },
          set(level) {
            this._generator.level = level;
          }
        }
      }));
      var createStyler = (open, close, parent) => {
        let openAll;
        let closeAll;
        if (parent === void 0) {
          openAll = open;
          closeAll = close;
        } else {
          openAll = parent.openAll + open;
          closeAll = close + parent.closeAll;
        }
        return {
          open,
          close,
          openAll,
          closeAll,
          parent
        };
      };
      var createBuilder = (self, _styler, _isEmpty) => {
        const builder = (...arguments_) => {
          if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
            return applyStyle(builder, chalkTag(builder, ...arguments_));
          }
          return applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
        };
        Object.setPrototypeOf(builder, proto);
        builder._generator = self;
        builder._styler = _styler;
        builder._isEmpty = _isEmpty;
        return builder;
      };
      var applyStyle = (self, string) => {
        if (self.level <= 0 || !string) {
          return self._isEmpty ? "" : string;
        }
        let styler = self._styler;
        if (styler === void 0) {
          return string;
        }
        const { openAll, closeAll } = styler;
        if (string.indexOf("") !== -1) {
          while (styler !== void 0) {
            string = stringReplaceAll(string, styler.close, styler.open);
            styler = styler.parent;
          }
        }
        const lfIndex = string.indexOf("\n");
        if (lfIndex !== -1) {
          string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
        }
        return openAll + string + closeAll;
      };
      var template;
      var chalkTag = (chalk2, ...strings) => {
        const [firstString] = strings;
        if (!isArray(firstString) || !isArray(firstString.raw)) {
          return strings.join(" ");
        }
        const arguments_ = strings.slice(1);
        const parts = [firstString.raw[0]];
        for (let i = 1; i < firstString.length; i++) {
          parts.push(String(arguments_[i - 1]).replace(/[{}\\]/g, "\\$&"), String(firstString.raw[i]));
        }
        if (template === void 0) {
          template = require_templates2();
        }
        return template(chalk2, parts.join(""));
      };
      Object.defineProperties(Chalk.prototype, styles);
      var chalk = Chalk();
      chalk.supportsColor = stdoutColor;
      chalk.stderr = Chalk({ level: stderrColor ? stderrColor.level : 0 });
      chalk.stderr.supportsColor = stderrColor;
      module22.exports = chalk;
    });
    var require_log_symbols = __commonJS2((exports22, module22) => {
      "use strict";
      var chalk = require_source2();
      var isSupported = process.platform !== "win32" || process.env.CI || process.env.TERM === "xterm-256color";
      var main = {
        info: chalk.blue("\u2139"),
        success: chalk.green("\u2714"),
        warning: chalk.yellow("\u26A0"),
        error: chalk.red("\u2716")
      };
      var fallbacks = {
        info: chalk.blue("i"),
        success: chalk.green("\u221A"),
        warning: chalk.yellow("\u203C"),
        error: chalk.red("\xD7")
      };
      module22.exports = isSupported ? main : fallbacks;
    });
    var require_ansi_regex = __commonJS2((exports22, module22) => {
      "use strict";
      module22.exports = ({ onlyFirst = false } = {}) => {
        const pattern = [
          "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
          "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
        ].join("|");
        return new RegExp(pattern, onlyFirst ? void 0 : "g");
      };
    });
    var require_strip_ansi = __commonJS2((exports22, module22) => {
      "use strict";
      var ansiRegex = require_ansi_regex();
      module22.exports = (string) => typeof string === "string" ? string.replace(ansiRegex(), "") : string;
    });
    var require_clone = __commonJS2((exports22, module22) => {
      var clone = function() {
        "use strict";
        function clone2(parent, circular, depth, prototype) {
          var filter;
          if (typeof circular === "object") {
            depth = circular.depth;
            prototype = circular.prototype;
            filter = circular.filter;
            circular = circular.circular;
          }
          var allParents = [];
          var allChildren = [];
          var useBuffer = typeof Buffer != "undefined";
          if (typeof circular == "undefined")
            circular = true;
          if (typeof depth == "undefined")
            depth = Infinity;
          function _clone(parent2, depth2) {
            if (parent2 === null)
              return null;
            if (depth2 == 0)
              return parent2;
            var child;
            var proto;
            if (typeof parent2 != "object") {
              return parent2;
            }
            if (clone2.__isArray(parent2)) {
              child = [];
            } else if (clone2.__isRegExp(parent2)) {
              child = new RegExp(parent2.source, __getRegExpFlags(parent2));
              if (parent2.lastIndex)
                child.lastIndex = parent2.lastIndex;
            } else if (clone2.__isDate(parent2)) {
              child = new Date(parent2.getTime());
            } else if (useBuffer && Buffer.isBuffer(parent2)) {
              if (Buffer.allocUnsafe) {
                child = Buffer.allocUnsafe(parent2.length);
              } else {
                child = new Buffer(parent2.length);
              }
              parent2.copy(child);
              return child;
            } else {
              if (typeof prototype == "undefined") {
                proto = Object.getPrototypeOf(parent2);
                child = Object.create(proto);
              } else {
                child = Object.create(prototype);
                proto = prototype;
              }
            }
            if (circular) {
              var index = allParents.indexOf(parent2);
              if (index != -1) {
                return allChildren[index];
              }
              allParents.push(parent2);
              allChildren.push(child);
            }
            for (var i in parent2) {
              var attrs;
              if (proto) {
                attrs = Object.getOwnPropertyDescriptor(proto, i);
              }
              if (attrs && attrs.set == null) {
                continue;
              }
              child[i] = _clone(parent2[i], depth2 - 1);
            }
            return child;
          }
          return _clone(parent, depth);
        }
        clone2.clonePrototype = function clonePrototype(parent) {
          if (parent === null)
            return null;
          var c = function() {
          };
          c.prototype = parent;
          return new c();
        };
        function __objToStr(o) {
          return Object.prototype.toString.call(o);
        }
        ;
        clone2.__objToStr = __objToStr;
        function __isDate(o) {
          return typeof o === "object" && __objToStr(o) === "[object Date]";
        }
        ;
        clone2.__isDate = __isDate;
        function __isArray(o) {
          return typeof o === "object" && __objToStr(o) === "[object Array]";
        }
        ;
        clone2.__isArray = __isArray;
        function __isRegExp(o) {
          return typeof o === "object" && __objToStr(o) === "[object RegExp]";
        }
        ;
        clone2.__isRegExp = __isRegExp;
        function __getRegExpFlags(re) {
          var flags = "";
          if (re.global)
            flags += "g";
          if (re.ignoreCase)
            flags += "i";
          if (re.multiline)
            flags += "m";
          return flags;
        }
        ;
        clone2.__getRegExpFlags = __getRegExpFlags;
        return clone2;
      }();
      if (typeof module22 === "object" && module22.exports) {
        module22.exports = clone;
      }
    });
    var require_defaults = __commonJS2((exports22, module22) => {
      var clone = require_clone();
      module22.exports = function(options, defaults) {
        options = options || {};
        Object.keys(defaults).forEach(function(key) {
          if (typeof options[key] === "undefined") {
            options[key] = clone(defaults[key]);
          }
        });
        return options;
      };
    });
    var require_combining = __commonJS2((exports22, module22) => {
      module22.exports = [
        [768, 879],
        [1155, 1158],
        [1160, 1161],
        [1425, 1469],
        [1471, 1471],
        [1473, 1474],
        [1476, 1477],
        [1479, 1479],
        [1536, 1539],
        [1552, 1557],
        [1611, 1630],
        [1648, 1648],
        [1750, 1764],
        [1767, 1768],
        [1770, 1773],
        [1807, 1807],
        [1809, 1809],
        [1840, 1866],
        [1958, 1968],
        [2027, 2035],
        [2305, 2306],
        [2364, 2364],
        [2369, 2376],
        [2381, 2381],
        [2385, 2388],
        [2402, 2403],
        [2433, 2433],
        [2492, 2492],
        [2497, 2500],
        [2509, 2509],
        [2530, 2531],
        [2561, 2562],
        [2620, 2620],
        [2625, 2626],
        [2631, 2632],
        [2635, 2637],
        [2672, 2673],
        [2689, 2690],
        [2748, 2748],
        [2753, 2757],
        [2759, 2760],
        [2765, 2765],
        [2786, 2787],
        [2817, 2817],
        [2876, 2876],
        [2879, 2879],
        [2881, 2883],
        [2893, 2893],
        [2902, 2902],
        [2946, 2946],
        [3008, 3008],
        [3021, 3021],
        [3134, 3136],
        [3142, 3144],
        [3146, 3149],
        [3157, 3158],
        [3260, 3260],
        [3263, 3263],
        [3270, 3270],
        [3276, 3277],
        [3298, 3299],
        [3393, 3395],
        [3405, 3405],
        [3530, 3530],
        [3538, 3540],
        [3542, 3542],
        [3633, 3633],
        [3636, 3642],
        [3655, 3662],
        [3761, 3761],
        [3764, 3769],
        [3771, 3772],
        [3784, 3789],
        [3864, 3865],
        [3893, 3893],
        [3895, 3895],
        [3897, 3897],
        [3953, 3966],
        [3968, 3972],
        [3974, 3975],
        [3984, 3991],
        [3993, 4028],
        [4038, 4038],
        [4141, 4144],
        [4146, 4146],
        [4150, 4151],
        [4153, 4153],
        [4184, 4185],
        [4448, 4607],
        [4959, 4959],
        [5906, 5908],
        [5938, 5940],
        [5970, 5971],
        [6002, 6003],
        [6068, 6069],
        [6071, 6077],
        [6086, 6086],
        [6089, 6099],
        [6109, 6109],
        [6155, 6157],
        [6313, 6313],
        [6432, 6434],
        [6439, 6440],
        [6450, 6450],
        [6457, 6459],
        [6679, 6680],
        [6912, 6915],
        [6964, 6964],
        [6966, 6970],
        [6972, 6972],
        [6978, 6978],
        [7019, 7027],
        [7616, 7626],
        [7678, 7679],
        [8203, 8207],
        [8234, 8238],
        [8288, 8291],
        [8298, 8303],
        [8400, 8431],
        [12330, 12335],
        [12441, 12442],
        [43014, 43014],
        [43019, 43019],
        [43045, 43046],
        [64286, 64286],
        [65024, 65039],
        [65056, 65059],
        [65279, 65279],
        [65529, 65531],
        [68097, 68099],
        [68101, 68102],
        [68108, 68111],
        [68152, 68154],
        [68159, 68159],
        [119143, 119145],
        [119155, 119170],
        [119173, 119179],
        [119210, 119213],
        [119362, 119364],
        [917505, 917505],
        [917536, 917631],
        [917760, 917999]
      ];
    });
    var require_wcwidth = __commonJS2((exports22, module22) => {
      "use strict";
      var defaults = require_defaults();
      var combining = require_combining();
      var DEFAULTS = {
        nul: 0,
        control: 0
      };
      module22.exports = function wcwidth2(str) {
        return wcswidth(str, DEFAULTS);
      };
      module22.exports.config = function(opts) {
        opts = defaults(opts || {}, DEFAULTS);
        return function wcwidth2(str) {
          return wcswidth(str, opts);
        };
      };
      function wcswidth(str, opts) {
        if (typeof str !== "string")
          return wcwidth(str, opts);
        var s = 0;
        for (var i = 0; i < str.length; i++) {
          var n = wcwidth(str.charCodeAt(i), opts);
          if (n < 0)
            return -1;
          s += n;
        }
        return s;
      }
      function wcwidth(ucs, opts) {
        if (ucs === 0)
          return opts.nul;
        if (ucs < 32 || ucs >= 127 && ucs < 160)
          return opts.control;
        if (bisearch(ucs))
          return 0;
        return 1 + (ucs >= 4352 && (ucs <= 4447 || ucs == 9001 || ucs == 9002 || ucs >= 11904 && ucs <= 42191 && ucs != 12351 || ucs >= 44032 && ucs <= 55203 || ucs >= 63744 && ucs <= 64255 || ucs >= 65040 && ucs <= 65049 || ucs >= 65072 && ucs <= 65135 || ucs >= 65280 && ucs <= 65376 || ucs >= 65504 && ucs <= 65510 || ucs >= 131072 && ucs <= 196605 || ucs >= 196608 && ucs <= 262141));
      }
      function bisearch(ucs) {
        var min = 0;
        var max = combining.length - 1;
        var mid;
        if (ucs < combining[0][0] || ucs > combining[max][1])
          return false;
        while (max >= min) {
          mid = Math.floor((min + max) / 2);
          if (ucs > combining[mid][1])
            min = mid + 1;
          else if (ucs < combining[mid][0])
            max = mid - 1;
          else
            return true;
        }
        return false;
      }
    });
    var require_is_interactive = __commonJS2((exports22, module22) => {
      "use strict";
      module22.exports = ({ stream = process.stdout } = {}) => {
        return Boolean(stream && stream.isTTY && process.env.TERM !== "dumb" && !("CI" in process.env));
      };
    });
    var require_mute = __commonJS2((exports22, module22) => {
      var Stream = require("stream");
      module22.exports = MuteStream;
      function MuteStream(opts) {
        Stream.apply(this);
        opts = opts || {};
        this.writable = this.readable = true;
        this.muted = false;
        this.on("pipe", this._onpipe);
        this.replace = opts.replace;
        this._prompt = opts.prompt || null;
        this._hadControl = false;
      }
      MuteStream.prototype = Object.create(Stream.prototype);
      Object.defineProperty(MuteStream.prototype, "constructor", {
        value: MuteStream,
        enumerable: false
      });
      MuteStream.prototype.mute = function() {
        this.muted = true;
      };
      MuteStream.prototype.unmute = function() {
        this.muted = false;
      };
      Object.defineProperty(MuteStream.prototype, "_onpipe", {
        value: onPipe,
        enumerable: false,
        writable: true,
        configurable: true
      });
      function onPipe(src) {
        this._src = src;
      }
      Object.defineProperty(MuteStream.prototype, "isTTY", {
        get: getIsTTY,
        set: setIsTTY,
        enumerable: true,
        configurable: true
      });
      function getIsTTY() {
        return this._dest ? this._dest.isTTY : this._src ? this._src.isTTY : false;
      }
      function setIsTTY(isTTY) {
        Object.defineProperty(this, "isTTY", {
          value: isTTY,
          enumerable: true,
          writable: true,
          configurable: true
        });
      }
      Object.defineProperty(MuteStream.prototype, "rows", {
        get: function() {
          return this._dest ? this._dest.rows : this._src ? this._src.rows : void 0;
        },
        enumerable: true,
        configurable: true
      });
      Object.defineProperty(MuteStream.prototype, "columns", {
        get: function() {
          return this._dest ? this._dest.columns : this._src ? this._src.columns : void 0;
        },
        enumerable: true,
        configurable: true
      });
      MuteStream.prototype.pipe = function(dest, options) {
        this._dest = dest;
        return Stream.prototype.pipe.call(this, dest, options);
      };
      MuteStream.prototype.pause = function() {
        if (this._src)
          return this._src.pause();
      };
      MuteStream.prototype.resume = function() {
        if (this._src)
          return this._src.resume();
      };
      MuteStream.prototype.write = function(c) {
        if (this.muted) {
          if (!this.replace)
            return true;
          if (c.match(/^\u001b/)) {
            if (c.indexOf(this._prompt) === 0) {
              c = c.substr(this._prompt.length);
              c = c.replace(/./g, this.replace);
              c = this._prompt + c;
            }
            this._hadControl = true;
            return this.emit("data", c);
          } else {
            if (this._prompt && this._hadControl && c.indexOf(this._prompt) === 0) {
              this._hadControl = false;
              this.emit("data", this._prompt);
              c = c.substr(this._prompt.length);
            }
            c = c.toString().replace(/./g, this.replace);
          }
        }
        this.emit("data", c);
      };
      MuteStream.prototype.end = function(c) {
        if (this.muted) {
          if (c && this.replace) {
            c = c.toString().replace(/./g, this.replace);
          } else {
            c = null;
          }
        }
        if (c)
          this.emit("data", c);
        this.emit("end");
      };
      function proxy(fn) {
        return function() {
          var d = this._dest;
          var s = this._src;
          if (d && d[fn])
            d[fn].apply(d, arguments);
          if (s && s[fn])
            s[fn].apply(s, arguments);
        };
      }
      MuteStream.prototype.destroy = proxy("destroy");
      MuteStream.prototype.destroySoon = proxy("destroySoon");
      MuteStream.prototype.close = proxy("close");
    });
    var require_ora = __commonJS2((exports22, module22) => {
      "use strict";
      var readline = require("readline");
      var chalk = require_source();
      var cliCursor = require_cli_cursor();
      var cliSpinners = require_cli_spinners();
      var logSymbols = require_log_symbols();
      var stripAnsi = require_strip_ansi();
      var wcwidth = require_wcwidth();
      var isInteractive = require_is_interactive();
      var MuteStream = require_mute();
      var TEXT = Symbol("text");
      var PREFIX_TEXT = Symbol("prefixText");
      var ASCII_ETX_CODE = 3;
      var StdinDiscarder = class {
        constructor() {
          this.requests = 0;
          this.mutedStream = new MuteStream();
          this.mutedStream.pipe(process.stdout);
          this.mutedStream.mute();
          const self = this;
          this.ourEmit = function(event, data, ...args) {
            const { stdin } = process;
            if (self.requests > 0 || stdin.emit === self.ourEmit) {
              if (event === "keypress") {
                return;
              }
              if (event === "data" && data.includes(ASCII_ETX_CODE)) {
                process.emit("SIGINT");
              }
              Reflect.apply(self.oldEmit, this, [event, data, ...args]);
            } else {
              Reflect.apply(process.stdin.emit, this, [event, data, ...args]);
            }
          };
        }
        start() {
          this.requests++;
          if (this.requests === 1) {
            this.realStart();
          }
        }
        stop() {
          if (this.requests <= 0) {
            throw new Error("`stop` called more times than `start`");
          }
          this.requests--;
          if (this.requests === 0) {
            this.realStop();
          }
        }
        realStart() {
          if (process.platform === "win32") {
            return;
          }
          this.rl = readline.createInterface({
            input: process.stdin,
            output: this.mutedStream
          });
          this.rl.on("SIGINT", () => {
            if (process.listenerCount("SIGINT") === 0) {
              process.emit("SIGINT");
            } else {
              this.rl.close();
              process.kill(process.pid, "SIGINT");
            }
          });
        }
        realStop() {
          if (process.platform === "win32") {
            return;
          }
          this.rl.close();
          this.rl = void 0;
        }
      };
      var stdinDiscarder;
      var Ora = class {
        constructor(options) {
          if (!stdinDiscarder) {
            stdinDiscarder = new StdinDiscarder();
          }
          if (typeof options === "string") {
            options = {
              text: options
            };
          }
          this.options = __spreadValues({
            text: "",
            color: "cyan",
            stream: process.stderr,
            discardStdin: true
          }, options);
          this.spinner = this.options.spinner;
          this.color = this.options.color;
          this.hideCursor = this.options.hideCursor !== false;
          this.interval = this.options.interval || this.spinner.interval || 100;
          this.stream = this.options.stream;
          this.id = void 0;
          this.isEnabled = typeof this.options.isEnabled === "boolean" ? this.options.isEnabled : isInteractive({ stream: this.stream });
          this.isSilent = typeof this.options.isSilent === "boolean" ? this.options.isSilent : false;
          this.text = this.options.text;
          this.prefixText = this.options.prefixText;
          this.linesToClear = 0;
          this.indent = this.options.indent;
          this.discardStdin = this.options.discardStdin;
          this.isDiscardingStdin = false;
        }
        get indent() {
          return this._indent;
        }
        set indent(indent = 0) {
          if (!(indent >= 0 && Number.isInteger(indent))) {
            throw new Error("The `indent` option must be an integer from 0 and up");
          }
          this._indent = indent;
        }
        _updateInterval(interval) {
          if (interval !== void 0) {
            this.interval = interval;
          }
        }
        get spinner() {
          return this._spinner;
        }
        set spinner(spinner) {
          this.frameIndex = 0;
          if (typeof spinner === "object") {
            if (spinner.frames === void 0) {
              throw new Error("The given spinner must have a `frames` property");
            }
            this._spinner = spinner;
          } else if (process.platform === "win32") {
            this._spinner = cliSpinners.line;
          } else if (spinner === void 0) {
            this._spinner = cliSpinners.dots;
          } else if (cliSpinners[spinner]) {
            this._spinner = cliSpinners[spinner];
          } else {
            throw new Error(`There is no built-in spinner named '${spinner}'. See https://github.com/sindresorhus/cli-spinners/blob/master/spinners.json for a full list.`);
          }
          this._updateInterval(this._spinner.interval);
        }
        get text() {
          return this[TEXT];
        }
        get prefixText() {
          return this[PREFIX_TEXT];
        }
        get isSpinning() {
          return this.id !== void 0;
        }
        getFullPrefixText(prefixText = this[PREFIX_TEXT], postfix = " ") {
          if (typeof prefixText === "string") {
            return prefixText + postfix;
          }
          if (typeof prefixText === "function") {
            return prefixText() + postfix;
          }
          return "";
        }
        updateLineCount() {
          const columns = this.stream.columns || 80;
          const fullPrefixText = this.getFullPrefixText(this.prefixText, "-");
          this.lineCount = stripAnsi(fullPrefixText + "--" + this[TEXT]).split("\n").reduce((count, line) => {
            return count + Math.max(1, Math.ceil(wcwidth(line) / columns));
          }, 0);
        }
        set text(value) {
          this[TEXT] = value;
          this.updateLineCount();
        }
        set prefixText(value) {
          this[PREFIX_TEXT] = value;
          this.updateLineCount();
        }
        get isEnabled() {
          return this._isEnabled && !this.isSilent;
        }
        set isEnabled(value) {
          if (typeof value !== "boolean") {
            throw new TypeError("The `isEnabled` option must be a boolean");
          }
          this._isEnabled = value;
        }
        get isSilent() {
          return this._isSilent;
        }
        set isSilent(value) {
          if (typeof value !== "boolean") {
            throw new TypeError("The `isSilent` option must be a boolean");
          }
          this._isSilent = value;
        }
        frame() {
          const { frames } = this.spinner;
          let frame = frames[this.frameIndex];
          if (this.color) {
            frame = chalk[this.color](frame);
          }
          this.frameIndex = ++this.frameIndex % frames.length;
          const fullPrefixText = typeof this.prefixText === "string" && this.prefixText !== "" ? this.prefixText + " " : "";
          const fullText = typeof this.text === "string" ? " " + this.text : "";
          return fullPrefixText + frame + fullText;
        }
        clear() {
          if (!this.isEnabled || !this.stream.isTTY) {
            return this;
          }
          for (let i = 0; i < this.linesToClear; i++) {
            if (i > 0) {
              this.stream.moveCursor(0, -1);
            }
            this.stream.clearLine();
            this.stream.cursorTo(this.indent);
          }
          this.linesToClear = 0;
          return this;
        }
        render() {
          if (this.isSilent) {
            return this;
          }
          this.clear();
          this.stream.write(this.frame());
          this.linesToClear = this.lineCount;
          return this;
        }
        start(text) {
          if (text) {
            this.text = text;
          }
          if (this.isSilent) {
            return this;
          }
          if (!this.isEnabled) {
            if (this.text) {
              this.stream.write(`- ${this.text}
`);
            }
            return this;
          }
          if (this.isSpinning) {
            return this;
          }
          if (this.hideCursor) {
            cliCursor.hide(this.stream);
          }
          if (this.discardStdin && process.stdin.isTTY) {
            this.isDiscardingStdin = true;
            stdinDiscarder.start();
          }
          this.render();
          this.id = setInterval(this.render.bind(this), this.interval);
          return this;
        }
        stop() {
          if (!this.isEnabled) {
            return this;
          }
          clearInterval(this.id);
          this.id = void 0;
          this.frameIndex = 0;
          this.clear();
          if (this.hideCursor) {
            cliCursor.show(this.stream);
          }
          if (this.discardStdin && process.stdin.isTTY && this.isDiscardingStdin) {
            stdinDiscarder.stop();
            this.isDiscardingStdin = false;
          }
          return this;
        }
        succeed(text) {
          return this.stopAndPersist({ symbol: logSymbols.success, text });
        }
        fail(text) {
          return this.stopAndPersist({ symbol: logSymbols.error, text });
        }
        warn(text) {
          return this.stopAndPersist({ symbol: logSymbols.warning, text });
        }
        info(text) {
          return this.stopAndPersist({ symbol: logSymbols.info, text });
        }
        stopAndPersist(options = {}) {
          if (this.isSilent) {
            return this;
          }
          const prefixText = options.prefixText || this.prefixText;
          const text = options.text || this.text;
          const fullText = typeof text === "string" ? " " + text : "";
          this.stop();
          this.stream.write(`${this.getFullPrefixText(prefixText, " ")}${options.symbol || " "}${fullText}
`);
          return this;
        }
      };
      var oraFactory = function(options) {
        return new Ora(options);
      };
      module22.exports = oraFactory;
      module22.exports.promise = (action, options) => {
        if (typeof action.then !== "function") {
          throw new TypeError("Parameter `action` must be a Promise");
        }
        const spinner = new Ora(options);
        spinner.start();
        (async () => {
          try {
            await action;
            spinner.succeed();
          } catch (_) {
            spinner.fail();
          }
        })();
        return spinner;
      };
    });
    var require_dist_node13 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      function getUserAgent() {
        if (typeof navigator === "object" && "userAgent" in navigator) {
          return navigator.userAgent;
        }
        if (typeof process === "object" && "version" in process) {
          return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
        }
        return "<environment undetectable>";
      }
      exports22.getUserAgent = getUserAgent;
    });
    var require_register2 = __commonJS2((exports22, module22) => {
      module22.exports = register;
      function register(state, name2, method, options) {
        if (typeof method !== "function") {
          throw new Error("method for before hook must be a function");
        }
        if (!options) {
          options = {};
        }
        if (Array.isArray(name2)) {
          return name2.reverse().reduce(function(callback, name3) {
            return register.bind(null, state, name3, callback, options);
          }, method)();
        }
        return Promise.resolve().then(function() {
          if (!state.registry[name2]) {
            return method(options);
          }
          return state.registry[name2].reduce(function(method2, registered) {
            return registered.hook.bind(null, method2, options);
          }, method)();
        });
      }
    });
    var require_add2 = __commonJS2((exports22, module22) => {
      module22.exports = addHook;
      function addHook(state, kind, name2, hook) {
        var orig = hook;
        if (!state.registry[name2]) {
          state.registry[name2] = [];
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
            return Promise.resolve().then(method.bind(null, options)).catch(function(error) {
              return orig(error, options);
            });
          };
        }
        state.registry[name2].push({
          hook,
          orig
        });
      }
    });
    var require_remove2 = __commonJS2((exports22, module22) => {
      module22.exports = removeHook;
      function removeHook(state, name2, method) {
        if (!state.registry[name2]) {
          return;
        }
        var index = state.registry[name2].map(function(registered) {
          return registered.orig;
        }).indexOf(method);
        if (index === -1) {
          return;
        }
        state.registry[name2].splice(index, 1);
      }
    });
    var require_before_after_hook2 = __commonJS2((exports22, module22) => {
      var register = require_register2();
      var addHook = require_add2();
      var removeHook = require_remove2();
      var bind = Function.bind;
      var bindable = bind.bind(bind);
      function bindApi(hook, state, name2) {
        var removeHookRef = bindable(removeHook, null).apply(null, name2 ? [state, name2] : [state]);
        hook.api = { remove: removeHookRef };
        hook.remove = removeHookRef;
        ["before", "error", "after", "wrap"].forEach(function(kind) {
          var args = name2 ? [state, kind, name2] : [state, kind];
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
      module22.exports = Hook;
      module22.exports.Hook = Hook;
      module22.exports.Singular = Hook.Singular;
      module22.exports.Collection = Hook.Collection;
    });
    var require_is_plain_object2 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      function isObject2(o) {
        return Object.prototype.toString.call(o) === "[object Object]";
      }
      function isPlainObject(o) {
        var ctor, prot;
        if (isObject2(o) === false)
          return false;
        ctor = o.constructor;
        if (ctor === void 0)
          return true;
        prot = ctor.prototype;
        if (isObject2(prot) === false)
          return false;
        if (prot.hasOwnProperty("isPrototypeOf") === false) {
          return false;
        }
        return true;
      }
      exports22.isPlainObject = isPlainObject;
    });
    var require_dist_node22 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      var isPlainObject = require_is_plain_object2();
      var universalUserAgent = require_dist_node13();
      function lowercaseKeys(object) {
        if (!object) {
          return {};
        }
        return Object.keys(object).reduce((newObj, key) => {
          newObj[key.toLowerCase()] = object[key];
          return newObj;
        }, {});
      }
      function mergeDeep(defaults, options) {
        const result = Object.assign({}, defaults);
        Object.keys(options).forEach((key) => {
          if (isPlainObject.isPlainObject(options[key])) {
            if (!(key in defaults))
              Object.assign(result, {
                [key]: options[key]
              });
            else
              result[key] = mergeDeep(defaults[key], options[key]);
          } else {
            Object.assign(result, {
              [key]: options[key]
            });
          }
        });
        return result;
      }
      function removeUndefinedProperties(obj) {
        for (const key in obj) {
          if (obj[key] === void 0) {
            delete obj[key];
          }
        }
        return obj;
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
          options = Object.assign({}, route);
        }
        options.headers = lowercaseKeys(options.headers);
        removeUndefinedProperties(options);
        removeUndefinedProperties(options.headers);
        const mergedOptions = mergeDeep(defaults || {}, options);
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
        return url + separator + names.map((name2) => {
          if (name2 === "q") {
            return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
          }
          return `${name2}=${encodeURIComponent(parameters[name2])}`;
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
      function encodeReserved(str) {
        return str.split(/(%[0-9A-Fa-f]{2})/g).map(function(part) {
          if (!/%[0-9A-Fa-f]/.test(part)) {
            part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
          }
          return part;
        }).join("");
      }
      function encodeUnreserved(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
          return "%" + c.charCodeAt(0).toString(16).toUpperCase();
        });
      }
      function encodeValue(operator, value, key) {
        value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);
        if (key) {
          return encodeUnreserved(key) + "=" + value;
        } else {
          return value;
        }
      }
      function isDefined(value) {
        return value !== void 0 && value !== null;
      }
      function isKeyOperator(operator) {
        return operator === ";" || operator === "&" || operator === "?";
      }
      function getValues(context, operator, key, modifier) {
        var value = context[key], result = [];
        if (isDefined(value) && value !== "") {
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            value = value.toString();
            if (modifier && modifier !== "*") {
              value = value.substring(0, parseInt(modifier, 10));
            }
            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
          } else {
            if (modifier === "*") {
              if (Array.isArray(value)) {
                value.filter(isDefined).forEach(function(value2) {
                  result.push(encodeValue(operator, value2, isKeyOperator(operator) ? key : ""));
                });
              } else {
                Object.keys(value).forEach(function(k) {
                  if (isDefined(value[k])) {
                    result.push(encodeValue(operator, value[k], k));
                  }
                });
              }
            } else {
              const tmp = [];
              if (Array.isArray(value)) {
                value.filter(isDefined).forEach(function(value2) {
                  tmp.push(encodeValue(operator, value2));
                });
              } else {
                Object.keys(value).forEach(function(k) {
                  if (isDefined(value[k])) {
                    tmp.push(encodeUnreserved(k));
                    tmp.push(encodeValue(operator, value[k].toString()));
                  }
                });
              }
              if (isKeyOperator(operator)) {
                result.push(encodeUnreserved(key) + "=" + tmp.join(","));
              } else if (tmp.length !== 0) {
                result.push(tmp.join(","));
              }
            }
          }
        } else {
          if (operator === ";") {
            if (isDefined(value)) {
              result.push(encodeUnreserved(key));
            }
          } else if (value === "" && (operator === "&" || operator === "?")) {
            result.push(encodeUnreserved(key) + "=");
          } else if (value === "") {
            result.push("");
          }
        }
        return result;
      }
      function parseUrl(template) {
        return {
          expand: expand.bind(null, template)
        };
      }
      function expand(template, context) {
        var operators = ["+", "#", ".", "/", ";", "?", "&"];
        return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function(_, expression, literal) {
          if (expression) {
            let operator = "";
            const values = [];
            if (operators.indexOf(expression.charAt(0)) !== -1) {
              operator = expression.charAt(0);
              expression = expression.substr(1);
            }
            expression.split(/,/g).forEach(function(variable) {
              var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
              values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
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
            return encodeReserved(literal);
          }
        });
      }
      function parse(options) {
        let method = options.method.toUpperCase();
        let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
        let headers = Object.assign({}, options.headers);
        let body;
        let parameters = omit(options, ["method", "baseUrl", "url", "headers", "request", "mediaType"]);
        const urlVariableNames = extractUrlVariableNames(url);
        url = parseUrl(url).expand(parameters);
        if (!/^http/.test(url)) {
          url = options.baseUrl + url;
        }
        const omittedParameters = Object.keys(options).filter((option) => urlVariableNames.includes(option)).concat("baseUrl");
        const remainingParameters = omit(parameters, omittedParameters);
        const isBinaryRequest = /application\/octet-stream/i.test(headers.accept);
        if (!isBinaryRequest) {
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
      var VERSION = "6.0.10";
      var userAgent = `octokit-endpoint.js/${VERSION} ${universalUserAgent.getUserAgent()}`;
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
      exports22.endpoint = endpoint;
    });
    var require_is_plain_object22 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      function isObject2(o) {
        return Object.prototype.toString.call(o) === "[object Object]";
      }
      function isPlainObject(o) {
        var ctor, prot;
        if (isObject2(o) === false)
          return false;
        ctor = o.constructor;
        if (ctor === void 0)
          return true;
        prot = ctor.prototype;
        if (isObject2(prot) === false)
          return false;
        if (prot.hasOwnProperty("isPrototypeOf") === false) {
          return false;
        }
        return true;
      }
      exports22.isPlainObject = isPlainObject;
    });
    var require_lib2 = __commonJS2((exports22) => {
      __export(exports22, {
        FetchError: () => FetchError,
        Headers: () => Headers,
        Request: () => Request,
        Response: () => Response,
        default: () => lib_default
      });
      var stream = __toModule(require("stream"));
      var http2 = __toModule(require("http"));
      var url = __toModule(require("url"));
      var https2 = __toModule(require("https"));
      var zlib2 = __toModule(require("zlib"));
      var Readable = stream.default.Readable;
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
          const blob = new Blob([], { type: arguments[2] });
          blob[BUFFER] = slicedBuffer;
          return blob;
        }
      };
      Object.defineProperties(Blob.prototype, {
        size: { enumerable: true },
        type: { enumerable: true },
        slice: { enumerable: true }
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
      var PassThrough = stream.default.PassThrough;
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
        } else if (body instanceof stream.default)
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
        if (body instanceof stream.default) {
          body.on("error", function(err) {
            const error = err.name === "AbortError" ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, "system", err);
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
        body: { enumerable: true },
        bodyUsed: { enumerable: true },
        arrayBuffer: { enumerable: true },
        blob: { enumerable: true },
        json: { enumerable: true },
        text: { enumerable: true }
      });
      Body.mixIn = function(proto) {
        for (const name2 of Object.getOwnPropertyNames(Body.prototype)) {
          if (!(name2 in proto)) {
            const desc = Object.getOwnPropertyDescriptor(Body.prototype, name2);
            Object.defineProperty(proto, name2, desc);
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
        if (!(body instanceof stream.default)) {
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
          if (!res) {
            res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
            if (res) {
              res.pop();
            }
          }
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
        if (body instanceof stream.default && typeof body.getBoundary !== "function") {
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
        } else if (body instanceof stream.default) {
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
      function validateName(name2) {
        name2 = `${name2}`;
        if (invalidTokenRegex.test(name2) || name2 === "") {
          throw new TypeError(`${name2} is not a legal HTTP header name`);
        }
      }
      function validateValue(value) {
        value = `${value}`;
        if (invalidHeaderCharRegex.test(value)) {
          throw new TypeError(`${value} is not a legal HTTP header value`);
        }
      }
      function find(map, name2) {
        name2 = name2.toLowerCase();
        for (const key in map) {
          if (key.toLowerCase() === name2) {
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
        get(name2) {
          name2 = `${name2}`;
          validateName(name2);
          const key = find(this[MAP], name2);
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
            const name2 = _pairs$i[0], value = _pairs$i[1];
            callback.call(thisArg, value, name2, this);
            pairs = getHeaders(this);
            i++;
          }
        }
        set(name2, value) {
          name2 = `${name2}`;
          value = `${value}`;
          validateName(name2);
          validateValue(value);
          const key = find(this[MAP], name2);
          this[MAP][key !== void 0 ? key : name2] = [value];
        }
        append(name2, value) {
          name2 = `${name2}`;
          value = `${value}`;
          validateName(name2);
          validateValue(value);
          const key = find(this[MAP], name2);
          if (key !== void 0) {
            this[MAP][key].push(value);
          } else {
            this[MAP][name2] = [value];
          }
        }
        has(name2) {
          name2 = `${name2}`;
          validateName(name2);
          return find(this[MAP], name2) !== void 0;
        }
        delete(name2) {
          name2 = `${name2}`;
          validateName(name2);
          const key = find(this[MAP], name2);
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
        const obj = Object.assign({ __proto__: null }, headers[MAP]);
        const hostHeaderKey = find(headers[MAP], "Host");
        if (hostHeaderKey !== void 0) {
          obj[hostHeaderKey] = obj[hostHeaderKey][0];
        }
        return obj;
      }
      function createHeadersLenient(obj) {
        const headers = new Headers();
        for (const name2 of Object.keys(obj)) {
          if (invalidTokenRegex.test(name2)) {
            continue;
          }
          if (Array.isArray(obj[name2])) {
            for (const val of obj[name2]) {
              if (invalidHeaderCharRegex.test(val)) {
                continue;
              }
              if (headers[MAP][name2] === void 0) {
                headers[MAP][name2] = [val];
              } else {
                headers[MAP][name2].push(val);
              }
            }
          } else if (!invalidHeaderCharRegex.test(obj[name2])) {
            headers[MAP][name2] = [obj[name2]];
          }
        }
        return headers;
      }
      var INTERNALS$1 = Symbol("Response internals");
      var STATUS_CODES = http2.default.STATUS_CODES;
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
        url: { enumerable: true },
        status: { enumerable: true },
        ok: { enumerable: true },
        redirected: { enumerable: true },
        statusText: { enumerable: true },
        headers: { enumerable: true },
        clone: { enumerable: true }
      });
      Object.defineProperty(Response.prototype, Symbol.toStringTag, {
        value: "Response",
        writable: false,
        enumerable: false,
        configurable: true
      });
      var INTERNALS$2 = Symbol("Request internals");
      var parse_url = url.default.parse;
      var format_url = url.default.format;
      var streamDestructionSupported = "destroy" in stream.default.Readable.prototype;
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
        method: { enumerable: true },
        url: { enumerable: true },
        headers: { enumerable: true },
        redirect: { enumerable: true },
        clone: { enumerable: true },
        signal: { enumerable: true }
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
        if (request.signal && request.body instanceof stream.default.Readable && !streamDestructionSupported) {
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
      var PassThrough$1 = stream.default.PassThrough;
      var resolve_url = url.default.resolve;
      function fetch(url2, opts) {
        if (!fetch.Promise) {
          throw new Error("native promise missing, set fetch.Promise to your favorite alternative");
        }
        Body.Promise = fetch.Promise;
        return new fetch.Promise(function(resolve, reject) {
          const request = new Request(url2, opts);
          const options = getNodeRequestOptions(request);
          const send = (options.protocol === "https:" ? https2.default : http2.default).request;
          const signal = request.signal;
          let response = null;
          const abort = function abort2() {
            let error = new AbortError("The user aborted a request.");
            reject(error);
            if (request.body && request.body instanceof stream.default.Readable) {
              request.body.destroy(error);
            }
            if (!response || !response.body)
              return;
            response.body.emit("error", error);
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
                  reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
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
                    timeout: request.timeout,
                    size: request.size
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
              flush: zlib2.default.Z_SYNC_FLUSH,
              finishFlush: zlib2.default.Z_SYNC_FLUSH
            };
            if (codings == "gzip" || codings == "x-gzip") {
              body = body.pipe(zlib2.default.createGunzip(zlibOptions));
              response = new Response(body, response_options);
              resolve(response);
              return;
            }
            if (codings == "deflate" || codings == "x-deflate") {
              const raw = res.pipe(new PassThrough$1());
              raw.once("data", function(chunk) {
                if ((chunk[0] & 15) === 8) {
                  body = body.pipe(zlib2.default.createInflate());
                } else {
                  body = body.pipe(zlib2.default.createInflateRaw());
                }
                response = new Response(body, response_options);
                resolve(response);
              });
              return;
            }
            if (codings == "br" && typeof zlib2.default.createBrotliDecompress === "function") {
              body = body.pipe(zlib2.default.createBrotliDecompress());
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
      var lib_default = fetch;
    });
    var require_dist_node32 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      var Deprecation = class extends Error {
        constructor(message) {
          super(message);
          if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
          }
          this.name = "Deprecation";
        }
      };
      exports22.Deprecation = Deprecation;
    });
    var require_wrappy2 = __commonJS2((exports22, module22) => {
      module22.exports = wrappy;
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
    });
    var require_once2 = __commonJS2((exports22, module22) => {
      var wrappy = require_wrappy2();
      module22.exports = wrappy(once);
      module22.exports.strict = wrappy(onceStrict);
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
        var name2 = fn.name || "Function wrapped with `once`";
        f.onceError = name2 + " shouldn't be called more than once";
        f.called = false;
        return f;
      }
    });
    var require_dist_node42 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      function _interopDefault(ex) {
        return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
      }
      var deprecation = require_dist_node32();
      var once = _interopDefault(require_once2());
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
          this.headers = options.headers || {};
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
      exports22.RequestError = RequestError;
    });
    var require_dist_node52 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      function _interopDefault(ex) {
        return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
      }
      var endpoint = require_dist_node22();
      var universalUserAgent = require_dist_node13();
      var isPlainObject = require_is_plain_object22();
      var nodeFetch = _interopDefault(require_lib2());
      var requestError = require_dist_node42();
      var VERSION = "5.4.12";
      function getBufferResponse(response) {
        return response.arrayBuffer();
      }
      function fetchWrapper(requestOptions) {
        if (isPlainObject.isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
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
              const error = new requestError.RequestError(message, status, {
                headers,
                request: requestOptions
              });
              try {
                let responseBody = JSON.parse(error.message);
                Object.assign(error, responseBody);
                let errors = responseBody.errors;
                error.message = error.message + ": " + errors.map(JSON.stringify).join(", ");
              } catch (e) {
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
        }).then((data) => {
          return {
            status,
            url,
            headers,
            data
          };
        }).catch((error) => {
          if (error instanceof requestError.RequestError) {
            throw error;
          }
          throw new requestError.RequestError(error.message, 500, {
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
          "user-agent": `octokit-request.js/${VERSION} ${universalUserAgent.getUserAgent()}`
        }
      });
      exports22.request = request;
    });
    var require_index_cjs = __commonJS2((exports22, module22) => {
      "use strict";
      function isObject2(o) {
        return Object.prototype.toString.call(o) === "[object Object]";
      }
      function isPlainObject(o) {
        var ctor, prot;
        if (isObject2(o) === false)
          return false;
        ctor = o.constructor;
        if (ctor === void 0)
          return true;
        prot = ctor.prototype;
        if (isObject2(prot) === false)
          return false;
        if (prot.hasOwnProperty("isPrototypeOf") === false) {
          return false;
        }
        return true;
      }
      module22.exports = isPlainObject;
    });
    var require_dist_node62 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      function getUserAgent() {
        if (typeof navigator === "object" && "userAgent" in navigator) {
          return navigator.userAgent;
        }
        if (typeof process === "object" && "version" in process) {
          return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
        }
        return "<environment undetectable>";
      }
      exports22.getUserAgent = getUserAgent;
    });
    var require_dist_node72 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      function _interopDefault(ex) {
        return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
      }
      var isPlainObject = _interopDefault(require_index_cjs());
      var universalUserAgent = require_dist_node62();
      function lowercaseKeys(object) {
        if (!object) {
          return {};
        }
        return Object.keys(object).reduce((newObj, key) => {
          newObj[key.toLowerCase()] = object[key];
          return newObj;
        }, {});
      }
      function mergeDeep(defaults, options) {
        const result = Object.assign({}, defaults);
        Object.keys(options).forEach((key) => {
          if (isPlainObject(options[key])) {
            if (!(key in defaults))
              Object.assign(result, {
                [key]: options[key]
              });
            else
              result[key] = mergeDeep(defaults[key], options[key]);
          } else {
            Object.assign(result, {
              [key]: options[key]
            });
          }
        });
        return result;
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
          options = Object.assign({}, route);
        }
        options.headers = lowercaseKeys(options.headers);
        const mergedOptions = mergeDeep(defaults || {}, options);
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
        return url + separator + names.map((name2) => {
          if (name2 === "q") {
            return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
          }
          return `${name2}=${encodeURIComponent(parameters[name2])}`;
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
      function encodeReserved(str) {
        return str.split(/(%[0-9A-Fa-f]{2})/g).map(function(part) {
          if (!/%[0-9A-Fa-f]/.test(part)) {
            part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
          }
          return part;
        }).join("");
      }
      function encodeUnreserved(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
          return "%" + c.charCodeAt(0).toString(16).toUpperCase();
        });
      }
      function encodeValue(operator, value, key) {
        value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);
        if (key) {
          return encodeUnreserved(key) + "=" + value;
        } else {
          return value;
        }
      }
      function isDefined(value) {
        return value !== void 0 && value !== null;
      }
      function isKeyOperator(operator) {
        return operator === ";" || operator === "&" || operator === "?";
      }
      function getValues(context, operator, key, modifier) {
        var value = context[key], result = [];
        if (isDefined(value) && value !== "") {
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            value = value.toString();
            if (modifier && modifier !== "*") {
              value = value.substring(0, parseInt(modifier, 10));
            }
            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
          } else {
            if (modifier === "*") {
              if (Array.isArray(value)) {
                value.filter(isDefined).forEach(function(value2) {
                  result.push(encodeValue(operator, value2, isKeyOperator(operator) ? key : ""));
                });
              } else {
                Object.keys(value).forEach(function(k) {
                  if (isDefined(value[k])) {
                    result.push(encodeValue(operator, value[k], k));
                  }
                });
              }
            } else {
              const tmp = [];
              if (Array.isArray(value)) {
                value.filter(isDefined).forEach(function(value2) {
                  tmp.push(encodeValue(operator, value2));
                });
              } else {
                Object.keys(value).forEach(function(k) {
                  if (isDefined(value[k])) {
                    tmp.push(encodeUnreserved(k));
                    tmp.push(encodeValue(operator, value[k].toString()));
                  }
                });
              }
              if (isKeyOperator(operator)) {
                result.push(encodeUnreserved(key) + "=" + tmp.join(","));
              } else if (tmp.length !== 0) {
                result.push(tmp.join(","));
              }
            }
          }
        } else {
          if (operator === ";") {
            if (isDefined(value)) {
              result.push(encodeUnreserved(key));
            }
          } else if (value === "" && (operator === "&" || operator === "?")) {
            result.push(encodeUnreserved(key) + "=");
          } else if (value === "") {
            result.push("");
          }
        }
        return result;
      }
      function parseUrl(template) {
        return {
          expand: expand.bind(null, template)
        };
      }
      function expand(template, context) {
        var operators = ["+", "#", ".", "/", ";", "?", "&"];
        return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function(_, expression, literal) {
          if (expression) {
            let operator = "";
            const values = [];
            if (operators.indexOf(expression.charAt(0)) !== -1) {
              operator = expression.charAt(0);
              expression = expression.substr(1);
            }
            expression.split(/,/g).forEach(function(variable) {
              var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
              values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
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
            return encodeReserved(literal);
          }
        });
      }
      function parse(options) {
        let method = options.method.toUpperCase();
        let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{+$1}");
        let headers = Object.assign({}, options.headers);
        let body;
        let parameters = omit(options, ["method", "baseUrl", "url", "headers", "request", "mediaType"]);
        const urlVariableNames = extractUrlVariableNames(url);
        url = parseUrl(url).expand(parameters);
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
      var VERSION = "6.0.5";
      var userAgent = `octokit-endpoint.js/${VERSION} ${universalUserAgent.getUserAgent()}`;
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
      exports22.endpoint = endpoint;
    });
    var require_dist_node82 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      function _interopDefault(ex) {
        return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
      }
      var endpoint = require_dist_node72();
      var universalUserAgent = require_dist_node62();
      var isPlainObject = _interopDefault(require_index_cjs());
      var nodeFetch = _interopDefault(require_lib2());
      var requestError = require_dist_node42();
      var VERSION = "5.4.7";
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
              const error = new requestError.RequestError(message, status, {
                headers,
                request: requestOptions
              });
              try {
                let responseBody = JSON.parse(error.message);
                Object.assign(error, responseBody);
                let errors = responseBody.errors;
                error.message = error.message + ": " + errors.map(JSON.stringify).join(", ");
              } catch (e) {
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
        }).then((data) => {
          return {
            status,
            url,
            headers,
            data
          };
        }).catch((error) => {
          if (error instanceof requestError.RequestError) {
            throw error;
          }
          throw new requestError.RequestError(error.message, 500, {
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
          "user-agent": `octokit-request.js/${VERSION} ${universalUserAgent.getUserAgent()}`
        }
      });
      exports22.request = request;
    });
    var require_dist_node92 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      var request = require_dist_node82();
      var universalUserAgent = require_dist_node13();
      var VERSION = "4.5.8";
      var GraphqlError = class extends Error {
        constructor(request2, response) {
          const message = response.data.errors[0].message;
          super(message);
          Object.assign(this, response.data);
          Object.assign(this, {
            headers: response.headers
          });
          this.name = "GraphqlError";
          this.request = request2;
          if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
          }
        }
      };
      var NON_VARIABLE_OPTIONS = ["method", "baseUrl", "url", "headers", "request", "query", "mediaType"];
      var GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
      function graphql(request2, query, options) {
        if (typeof query === "string" && options && "query" in options) {
          return Promise.reject(new Error(`[@octokit/graphql] "query" cannot be used as variable name`));
        }
        const parsedOptions = typeof query === "string" ? Object.assign({
          query
        }, options) : query;
        const requestOptions = Object.keys(parsedOptions).reduce((result, key) => {
          if (NON_VARIABLE_OPTIONS.includes(key)) {
            result[key] = parsedOptions[key];
            return result;
          }
          if (!result.variables) {
            result.variables = {};
          }
          result.variables[key] = parsedOptions[key];
          return result;
        }, {});
        const baseUrl = parsedOptions.baseUrl || request2.endpoint.DEFAULTS.baseUrl;
        if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
          requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
        }
        return request2(requestOptions).then((response) => {
          if (response.data.errors) {
            const headers = {};
            for (const key of Object.keys(response.headers)) {
              headers[key] = response.headers[key];
            }
            throw new GraphqlError(requestOptions, {
              headers,
              data: response.data
            });
          }
          return response.data.data;
        });
      }
      function withDefaults(request$1, newDefaults) {
        const newRequest = request$1.defaults(newDefaults);
        const newApi = (query, options) => {
          return graphql(newRequest, query, options);
        };
        return Object.assign(newApi, {
          defaults: withDefaults.bind(null, newRequest),
          endpoint: request.request.endpoint
        });
      }
      var graphql$1 = withDefaults(request.request, {
        headers: {
          "user-agent": `octokit-graphql.js/${VERSION} ${universalUserAgent.getUserAgent()}`
        },
        method: "POST",
        url: "/graphql"
      });
      function withCustomRequest(customRequest) {
        return withDefaults(customRequest, {
          method: "POST",
          url: "/graphql"
        });
      }
      exports22.graphql = graphql$1;
      exports22.withCustomRequest = withCustomRequest;
    });
    var require_dist_node102 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      async function auth(token) {
        const tokenType = token.split(/\./).length === 3 ? "app" : /^v\d+\./.test(token) ? "installation" : "oauth";
        return {
          type: "token",
          token,
          tokenType
        };
      }
      function withAuthorizationPrefix(token) {
        if (token.split(/\./).length === 3) {
          return `bearer ${token}`;
        }
        return `token ${token}`;
      }
      async function hook(token, request, route, parameters) {
        const endpoint = request.endpoint.merge(route, parameters);
        endpoint.headers.authorization = withAuthorizationPrefix(token);
        return request(endpoint);
      }
      var createTokenAuth = function createTokenAuth2(token) {
        if (!token) {
          throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
        }
        if (typeof token !== "string") {
          throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
        }
        token = token.replace(/^(token|bearer) +/i, "");
        return Object.assign(auth.bind(null, token), {
          hook: hook.bind(null, token)
        });
      };
      exports22.createTokenAuth = createTokenAuth;
    });
    var require_dist_node112 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      var universalUserAgent = require_dist_node13();
      var beforeAfterHook = require_before_after_hook2();
      var request = require_dist_node52();
      var graphql = require_dist_node92();
      var authToken = require_dist_node102();
      function _objectWithoutPropertiesLoose(source, excluded) {
        if (source == null)
          return {};
        var target = {};
        var sourceKeys = Object.keys(source);
        var key, i;
        for (i = 0; i < sourceKeys.length; i++) {
          key = sourceKeys[i];
          if (excluded.indexOf(key) >= 0)
            continue;
          target[key] = source[key];
        }
        return target;
      }
      function _objectWithoutProperties(source, excluded) {
        if (source == null)
          return {};
        var target = _objectWithoutPropertiesLoose(source, excluded);
        var key, i;
        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
          for (i = 0; i < sourceSymbolKeys.length; i++) {
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0)
              continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key))
              continue;
            target[key] = source[key];
          }
        }
        return target;
      }
      var VERSION = "3.2.4";
      var Octokit2 = class {
        constructor(options = {}) {
          const hook = new beforeAfterHook.Collection();
          const requestDefaults = {
            baseUrl: request.request.endpoint.DEFAULTS.baseUrl,
            headers: {},
            request: Object.assign({}, options.request, {
              hook: hook.bind(null, "request")
            }),
            mediaType: {
              previews: [],
              format: ""
            }
          };
          requestDefaults.headers["user-agent"] = [options.userAgent, `octokit-core.js/${VERSION} ${universalUserAgent.getUserAgent()}`].filter(Boolean).join(" ");
          if (options.baseUrl) {
            requestDefaults.baseUrl = options.baseUrl;
          }
          if (options.previews) {
            requestDefaults.mediaType.previews = options.previews;
          }
          if (options.timeZone) {
            requestDefaults.headers["time-zone"] = options.timeZone;
          }
          this.request = request.request.defaults(requestDefaults);
          this.graphql = graphql.withCustomRequest(this.request).defaults(requestDefaults);
          this.log = Object.assign({
            debug: () => {
            },
            info: () => {
            },
            warn: console.warn.bind(console),
            error: console.error.bind(console)
          }, options.log);
          this.hook = hook;
          if (!options.authStrategy) {
            if (!options.auth) {
              this.auth = async () => ({
                type: "unauthenticated"
              });
            } else {
              const auth = authToken.createTokenAuth(options.auth);
              hook.wrap("request", auth.hook);
              this.auth = auth;
            }
          } else {
            const {
              authStrategy
            } = options, otherOptions = _objectWithoutProperties(options, ["authStrategy"]);
            const auth = authStrategy(Object.assign({
              request: this.request,
              log: this.log,
              octokit: this,
              octokitOptions: otherOptions
            }, options.auth));
            hook.wrap("request", auth.hook);
            this.auth = auth;
          }
          const classConstructor = this.constructor;
          classConstructor.plugins.forEach((plugin) => {
            Object.assign(this, plugin(this, options));
          });
        }
        static defaults(defaults) {
          const OctokitWithDefaults = class extends this {
            constructor(...args) {
              const options = args[0] || {};
              if (typeof defaults === "function") {
                super(defaults(options));
                return;
              }
              super(Object.assign({}, defaults, options, options.userAgent && defaults.userAgent ? {
                userAgent: `${options.userAgent} ${defaults.userAgent}`
              } : null));
            }
          };
          return OctokitWithDefaults;
        }
        static plugin(...newPlugins) {
          var _a;
          const currentPlugins = this.plugins;
          const NewOctokit = (_a = class extends this {
          }, _a.plugins = currentPlugins.concat(newPlugins.filter((plugin) => !currentPlugins.includes(plugin))), _a);
          return NewOctokit;
        }
      };
      Octokit2.VERSION = VERSION;
      Octokit2.plugins = [];
      exports22.Octokit = Octokit2;
    });
    var require_dist_node122 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      var VERSION = "1.0.2";
      function requestLog(octokit) {
        octokit.hook.wrap("request", (request, options) => {
          octokit.log.debug("request", options);
          const start = Date.now();
          const requestOptions = octokit.request.endpoint.parse(options);
          const path = requestOptions.url.replace(options.baseUrl, "");
          return request(options).then((response) => {
            octokit.log.info(`${requestOptions.method} ${path} - ${response.status} in ${Date.now() - start}ms`);
            return response;
          }).catch((error) => {
            octokit.log.info(`${requestOptions.method} ${path} - ${error.status} in ${Date.now() - start}ms`);
            throw error;
          });
        });
      }
      requestLog.VERSION = VERSION;
      exports22.requestLog = requestLog;
    });
    var require_dist_node132 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      var VERSION = "2.6.2";
      function normalizePaginatedListResponse(response) {
        const responseNeedsNormalization = "total_count" in response.data && !("url" in response.data);
        if (!responseNeedsNormalization)
          return response;
        const incompleteResults = response.data.incomplete_results;
        const repositorySelection = response.data.repository_selection;
        const totalCount = response.data.total_count;
        delete response.data.incomplete_results;
        delete response.data.repository_selection;
        delete response.data.total_count;
        const namespaceKey = Object.keys(response.data)[0];
        const data = response.data[namespaceKey];
        response.data = data;
        if (typeof incompleteResults !== "undefined") {
          response.data.incomplete_results = incompleteResults;
        }
        if (typeof repositorySelection !== "undefined") {
          response.data.repository_selection = repositorySelection;
        }
        response.data.total_count = totalCount;
        return response;
      }
      function iterator(octokit, route, parameters) {
        const options = typeof route === "function" ? route.endpoint(parameters) : octokit.request.endpoint(route, parameters);
        const requestMethod = typeof route === "function" ? route : octokit.request;
        const method = options.method;
        const headers = options.headers;
        let url = options.url;
        return {
          [Symbol.asyncIterator]: () => ({
            async next() {
              if (!url)
                return {
                  done: true
                };
              const response = await requestMethod({
                method,
                url,
                headers
              });
              const normalizedResponse = normalizePaginatedListResponse(response);
              url = ((normalizedResponse.headers.link || "").match(/<([^>]+)>;\s*rel="next"/) || [])[1];
              return {
                value: normalizedResponse
              };
            }
          })
        };
      }
      function paginate(octokit, route, parameters, mapFn) {
        if (typeof parameters === "function") {
          mapFn = parameters;
          parameters = void 0;
        }
        return gather(octokit, [], iterator(octokit, route, parameters)[Symbol.asyncIterator](), mapFn);
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
      var composePaginateRest = Object.assign(paginate, {
        iterator
      });
      function paginateRest(octokit) {
        return {
          paginate: Object.assign(paginate.bind(null, octokit), {
            iterator: iterator.bind(null, octokit)
          })
        };
      }
      paginateRest.VERSION = VERSION;
      exports22.composePaginateRest = composePaginateRest;
      exports22.paginateRest = paginateRest;
    });
    var require_dist_node14 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      var Endpoints = {
        actions: {
          addSelectedRepoToOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
          cancelWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"],
          createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
          createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
          createRegistrationTokenForOrg: ["POST /orgs/{org}/actions/runners/registration-token"],
          createRegistrationTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/registration-token"],
          createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
          createRemoveTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/remove-token"],
          createWorkflowDispatch: ["POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"],
          deleteArtifact: ["DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
          deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
          deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
          deleteSelfHostedRunnerFromOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}"],
          deleteSelfHostedRunnerFromRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"],
          deleteWorkflowRun: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],
          deleteWorkflowRunLogs: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
          disableSelectedRepositoryGithubActionsOrganization: ["DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}"],
          disableWorkflow: ["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable"],
          downloadArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}"],
          downloadJobLogsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"],
          downloadWorkflowRunLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
          enableSelectedRepositoryGithubActionsOrganization: ["PUT /orgs/{org}/actions/permissions/repositories/{repository_id}"],
          enableWorkflow: ["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable"],
          getAllowedActionsOrganization: ["GET /orgs/{org}/actions/permissions/selected-actions"],
          getAllowedActionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions/selected-actions"],
          getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
          getGithubActionsPermissionsOrganization: ["GET /orgs/{org}/actions/permissions"],
          getGithubActionsPermissionsRepository: ["GET /repos/{owner}/{repo}/actions/permissions"],
          getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
          getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
          getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
          getRepoPermissions: ["GET /repos/{owner}/{repo}/actions/permissions", {}, {
            renamed: ["actions", "getGithubActionsPermissionsRepository"]
          }],
          getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
          getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
          getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
          getSelfHostedRunnerForRepo: ["GET /repos/{owner}/{repo}/actions/runners/{runner_id}"],
          getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
          getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
          getWorkflowRunUsage: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"],
          getWorkflowUsage: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"],
          listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
          listJobsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"],
          listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
          listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
          listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
          listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
          listRunnerApplicationsForRepo: ["GET /repos/{owner}/{repo}/actions/runners/downloads"],
          listSelectedReposForOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}/repositories"],
          listSelectedRepositoriesEnabledGithubActionsOrganization: ["GET /orgs/{org}/actions/permissions/repositories"],
          listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
          listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
          listWorkflowRunArtifacts: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"],
          listWorkflowRuns: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"],
          listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
          reRunWorkflow: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun"],
          removeSelectedRepoFromOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
          setAllowedActionsOrganization: ["PUT /orgs/{org}/actions/permissions/selected-actions"],
          setAllowedActionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions/selected-actions"],
          setGithubActionsPermissionsOrganization: ["PUT /orgs/{org}/actions/permissions"],
          setGithubActionsPermissionsRepository: ["PUT /repos/{owner}/{repo}/actions/permissions"],
          setSelectedReposForOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"],
          setSelectedRepositoriesEnabledGithubActionsOrganization: ["PUT /orgs/{org}/actions/permissions/repositories"]
        },
        activity: {
          checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
          deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
          deleteThreadSubscription: ["DELETE /notifications/threads/{thread_id}/subscription"],
          getFeeds: ["GET /feeds"],
          getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
          getThread: ["GET /notifications/threads/{thread_id}"],
          getThreadSubscriptionForAuthenticatedUser: ["GET /notifications/threads/{thread_id}/subscription"],
          listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
          listNotificationsForAuthenticatedUser: ["GET /notifications"],
          listOrgEventsForAuthenticatedUser: ["GET /users/{username}/events/orgs/{org}"],
          listPublicEvents: ["GET /events"],
          listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
          listPublicEventsForUser: ["GET /users/{username}/events/public"],
          listPublicOrgEvents: ["GET /orgs/{org}/events"],
          listReceivedEventsForUser: ["GET /users/{username}/received_events"],
          listReceivedPublicEventsForUser: ["GET /users/{username}/received_events/public"],
          listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
          listRepoNotificationsForAuthenticatedUser: ["GET /repos/{owner}/{repo}/notifications"],
          listReposStarredByAuthenticatedUser: ["GET /user/starred"],
          listReposStarredByUser: ["GET /users/{username}/starred"],
          listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
          listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
          listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
          listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
          markNotificationsAsRead: ["PUT /notifications"],
          markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
          markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
          setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
          setThreadSubscription: ["PUT /notifications/threads/{thread_id}/subscription"],
          starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
          unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"]
        },
        apps: {
          addRepoToInstallation: ["PUT /user/installations/{installation_id}/repositories/{repository_id}"],
          checkToken: ["POST /applications/{client_id}/token"],
          createContentAttachment: ["POST /content_references/{content_reference_id}/attachments", {
            mediaType: {
              previews: ["corsair"]
            }
          }],
          createFromManifest: ["POST /app-manifests/{code}/conversions"],
          createInstallationAccessToken: ["POST /app/installations/{installation_id}/access_tokens"],
          deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
          deleteInstallation: ["DELETE /app/installations/{installation_id}"],
          deleteToken: ["DELETE /applications/{client_id}/token"],
          getAuthenticated: ["GET /app"],
          getBySlug: ["GET /apps/{app_slug}"],
          getInstallation: ["GET /app/installations/{installation_id}"],
          getOrgInstallation: ["GET /orgs/{org}/installation"],
          getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
          getSubscriptionPlanForAccount: ["GET /marketplace_listing/accounts/{account_id}"],
          getSubscriptionPlanForAccountStubbed: ["GET /marketplace_listing/stubbed/accounts/{account_id}"],
          getUserInstallation: ["GET /users/{username}/installation"],
          getWebhookConfigForApp: ["GET /app/hook/config"],
          listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
          listAccountsForPlanStubbed: ["GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"],
          listInstallationReposForAuthenticatedUser: ["GET /user/installations/{installation_id}/repositories"],
          listInstallations: ["GET /app/installations"],
          listInstallationsForAuthenticatedUser: ["GET /user/installations"],
          listPlans: ["GET /marketplace_listing/plans"],
          listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
          listReposAccessibleToInstallation: ["GET /installation/repositories"],
          listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
          listSubscriptionsForAuthenticatedUserStubbed: ["GET /user/marketplace_purchases/stubbed"],
          removeRepoFromInstallation: ["DELETE /user/installations/{installation_id}/repositories/{repository_id}"],
          resetToken: ["PATCH /applications/{client_id}/token"],
          revokeInstallationAccessToken: ["DELETE /installation/token"],
          suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
          unsuspendInstallation: ["DELETE /app/installations/{installation_id}/suspended"],
          updateWebhookConfigForApp: ["PATCH /app/hook/config"]
        },
        billing: {
          getGithubActionsBillingOrg: ["GET /orgs/{org}/settings/billing/actions"],
          getGithubActionsBillingUser: ["GET /users/{username}/settings/billing/actions"],
          getGithubPackagesBillingOrg: ["GET /orgs/{org}/settings/billing/packages"],
          getGithubPackagesBillingUser: ["GET /users/{username}/settings/billing/packages"],
          getSharedStorageBillingOrg: ["GET /orgs/{org}/settings/billing/shared-storage"],
          getSharedStorageBillingUser: ["GET /users/{username}/settings/billing/shared-storage"]
        },
        checks: {
          create: ["POST /repos/{owner}/{repo}/check-runs"],
          createSuite: ["POST /repos/{owner}/{repo}/check-suites"],
          get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}"],
          getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}"],
          listAnnotations: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations"],
          listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"],
          listForSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs"],
          listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites"],
          rerequestSuite: ["POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest"],
          setSuitesPreferences: ["PATCH /repos/{owner}/{repo}/check-suites/preferences"],
          update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}"]
        },
        codeScanning: {
          getAlert: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}", {}, {
            renamedParameters: {
              alert_id: "alert_number"
            }
          }],
          listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"],
          listRecentAnalyses: ["GET /repos/{owner}/{repo}/code-scanning/analyses"],
          updateAlert: ["PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}"],
          uploadSarif: ["POST /repos/{owner}/{repo}/code-scanning/sarifs"]
        },
        codesOfConduct: {
          getAllCodesOfConduct: ["GET /codes_of_conduct", {
            mediaType: {
              previews: ["scarlet-witch"]
            }
          }],
          getConductCode: ["GET /codes_of_conduct/{key}", {
            mediaType: {
              previews: ["scarlet-witch"]
            }
          }],
          getForRepo: ["GET /repos/{owner}/{repo}/community/code_of_conduct", {
            mediaType: {
              previews: ["scarlet-witch"]
            }
          }]
        },
        emojis: {
          get: ["GET /emojis"]
        },
        enterpriseAdmin: {
          disableSelectedOrganizationGithubActionsEnterprise: ["DELETE /enterprises/{enterprise}/actions/permissions/organizations/{org_id}"],
          enableSelectedOrganizationGithubActionsEnterprise: ["PUT /enterprises/{enterprise}/actions/permissions/organizations/{org_id}"],
          getAllowedActionsEnterprise: ["GET /enterprises/{enterprise}/actions/permissions/selected-actions"],
          getGithubActionsPermissionsEnterprise: ["GET /enterprises/{enterprise}/actions/permissions"],
          listSelectedOrganizationsEnabledGithubActionsEnterprise: ["GET /enterprises/{enterprise}/actions/permissions/organizations"],
          setAllowedActionsEnterprise: ["PUT /enterprises/{enterprise}/actions/permissions/selected-actions"],
          setGithubActionsPermissionsEnterprise: ["PUT /enterprises/{enterprise}/actions/permissions"],
          setSelectedOrganizationsEnabledGithubActionsEnterprise: ["PUT /enterprises/{enterprise}/actions/permissions/organizations"]
        },
        gists: {
          checkIsStarred: ["GET /gists/{gist_id}/star"],
          create: ["POST /gists"],
          createComment: ["POST /gists/{gist_id}/comments"],
          delete: ["DELETE /gists/{gist_id}"],
          deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
          fork: ["POST /gists/{gist_id}/forks"],
          get: ["GET /gists/{gist_id}"],
          getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
          getRevision: ["GET /gists/{gist_id}/{sha}"],
          list: ["GET /gists"],
          listComments: ["GET /gists/{gist_id}/comments"],
          listCommits: ["GET /gists/{gist_id}/commits"],
          listForUser: ["GET /users/{username}/gists"],
          listForks: ["GET /gists/{gist_id}/forks"],
          listPublic: ["GET /gists/public"],
          listStarred: ["GET /gists/starred"],
          star: ["PUT /gists/{gist_id}/star"],
          unstar: ["DELETE /gists/{gist_id}/star"],
          update: ["PATCH /gists/{gist_id}"],
          updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"]
        },
        git: {
          createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
          createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
          createRef: ["POST /repos/{owner}/{repo}/git/refs"],
          createTag: ["POST /repos/{owner}/{repo}/git/tags"],
          createTree: ["POST /repos/{owner}/{repo}/git/trees"],
          deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
          getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
          getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
          getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
          getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
          getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
          listMatchingRefs: ["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],
          updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"]
        },
        gitignore: {
          getAllTemplates: ["GET /gitignore/templates"],
          getTemplate: ["GET /gitignore/templates/{name}"]
        },
        interactions: {
          getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits"],
          getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits"],
          getRestrictionsForYourPublicRepos: ["GET /user/interaction-limits"],
          removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits"],
          removeRestrictionsForRepo: ["DELETE /repos/{owner}/{repo}/interaction-limits"],
          removeRestrictionsForYourPublicRepos: ["DELETE /user/interaction-limits"],
          setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits"],
          setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits"],
          setRestrictionsForYourPublicRepos: ["PUT /user/interaction-limits"]
        },
        issues: {
          addAssignees: ["POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
          addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
          checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
          create: ["POST /repos/{owner}/{repo}/issues"],
          createComment: ["POST /repos/{owner}/{repo}/issues/{issue_number}/comments"],
          createLabel: ["POST /repos/{owner}/{repo}/labels"],
          createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
          deleteComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"],
          deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
          deleteMilestone: ["DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"],
          get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
          getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
          getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
          getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
          getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
          list: ["GET /issues"],
          listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
          listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
          listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
          listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
          listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
          listEventsForTimeline: ["GET /repos/{owner}/{repo}/issues/{issue_number}/timeline", {
            mediaType: {
              previews: ["mockingbird"]
            }
          }],
          listForAuthenticatedUser: ["GET /user/issues"],
          listForOrg: ["GET /orgs/{org}/issues"],
          listForRepo: ["GET /repos/{owner}/{repo}/issues"],
          listLabelsForMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"],
          listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
          listLabelsOnIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/labels"],
          listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
          lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
          removeAllLabels: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"],
          removeAssignees: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
          removeLabel: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"],
          setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
          unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
          update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
          updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
          updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
          updateMilestone: ["PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"]
        },
        licenses: {
          get: ["GET /licenses/{license}"],
          getAllCommonlyUsed: ["GET /licenses"],
          getForRepo: ["GET /repos/{owner}/{repo}/license"]
        },
        markdown: {
          render: ["POST /markdown"],
          renderRaw: ["POST /markdown/raw", {
            headers: {
              "content-type": "text/plain; charset=utf-8"
            }
          }]
        },
        meta: {
          get: ["GET /meta"],
          getOctocat: ["GET /octocat"],
          getZen: ["GET /zen"],
          root: ["GET /"]
        },
        migrations: {
          cancelImport: ["DELETE /repos/{owner}/{repo}/import"],
          deleteArchiveForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/archive", {
            mediaType: {
              previews: ["wyandotte"]
            }
          }],
          deleteArchiveForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/archive", {
            mediaType: {
              previews: ["wyandotte"]
            }
          }],
          downloadArchiveForOrg: ["GET /orgs/{org}/migrations/{migration_id}/archive", {
            mediaType: {
              previews: ["wyandotte"]
            }
          }],
          getArchiveForAuthenticatedUser: ["GET /user/migrations/{migration_id}/archive", {
            mediaType: {
              previews: ["wyandotte"]
            }
          }],
          getCommitAuthors: ["GET /repos/{owner}/{repo}/import/authors"],
          getImportStatus: ["GET /repos/{owner}/{repo}/import"],
          getLargeFiles: ["GET /repos/{owner}/{repo}/import/large_files"],
          getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}", {
            mediaType: {
              previews: ["wyandotte"]
            }
          }],
          getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}", {
            mediaType: {
              previews: ["wyandotte"]
            }
          }],
          listForAuthenticatedUser: ["GET /user/migrations", {
            mediaType: {
              previews: ["wyandotte"]
            }
          }],
          listForOrg: ["GET /orgs/{org}/migrations", {
            mediaType: {
              previews: ["wyandotte"]
            }
          }],
          listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories", {
            mediaType: {
              previews: ["wyandotte"]
            }
          }],
          listReposForUser: ["GET /user/migrations/{migration_id}/repositories", {
            mediaType: {
              previews: ["wyandotte"]
            }
          }],
          mapCommitAuthor: ["PATCH /repos/{owner}/{repo}/import/authors/{author_id}"],
          setLfsPreference: ["PATCH /repos/{owner}/{repo}/import/lfs"],
          startForAuthenticatedUser: ["POST /user/migrations"],
          startForOrg: ["POST /orgs/{org}/migrations"],
          startImport: ["PUT /repos/{owner}/{repo}/import"],
          unlockRepoForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock", {
            mediaType: {
              previews: ["wyandotte"]
            }
          }],
          unlockRepoForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock", {
            mediaType: {
              previews: ["wyandotte"]
            }
          }],
          updateImport: ["PATCH /repos/{owner}/{repo}/import"]
        },
        orgs: {
          blockUser: ["PUT /orgs/{org}/blocks/{username}"],
          checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
          checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
          checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
          convertMemberToOutsideCollaborator: ["PUT /orgs/{org}/outside_collaborators/{username}"],
          createInvitation: ["POST /orgs/{org}/invitations"],
          createWebhook: ["POST /orgs/{org}/hooks"],
          deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
          get: ["GET /orgs/{org}"],
          getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
          getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
          getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
          getWebhookConfigForOrg: ["GET /orgs/{org}/hooks/{hook_id}/config"],
          list: ["GET /organizations"],
          listAppInstallations: ["GET /orgs/{org}/installations"],
          listBlockedUsers: ["GET /orgs/{org}/blocks"],
          listForAuthenticatedUser: ["GET /user/orgs"],
          listForUser: ["GET /users/{username}/orgs"],
          listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
          listMembers: ["GET /orgs/{org}/members"],
          listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
          listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
          listPendingInvitations: ["GET /orgs/{org}/invitations"],
          listPublicMembers: ["GET /orgs/{org}/public_members"],
          listWebhooks: ["GET /orgs/{org}/hooks"],
          pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
          removeMember: ["DELETE /orgs/{org}/members/{username}"],
          removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
          removeOutsideCollaborator: ["DELETE /orgs/{org}/outside_collaborators/{username}"],
          removePublicMembershipForAuthenticatedUser: ["DELETE /orgs/{org}/public_members/{username}"],
          setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
          setPublicMembershipForAuthenticatedUser: ["PUT /orgs/{org}/public_members/{username}"],
          unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
          update: ["PATCH /orgs/{org}"],
          updateMembershipForAuthenticatedUser: ["PATCH /user/memberships/orgs/{org}"],
          updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"],
          updateWebhookConfigForOrg: ["PATCH /orgs/{org}/hooks/{hook_id}/config"]
        },
        projects: {
          addCollaborator: ["PUT /projects/{project_id}/collaborators/{username}", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          createCard: ["POST /projects/columns/{column_id}/cards", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          createColumn: ["POST /projects/{project_id}/columns", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          createForAuthenticatedUser: ["POST /user/projects", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          createForOrg: ["POST /orgs/{org}/projects", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          createForRepo: ["POST /repos/{owner}/{repo}/projects", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          delete: ["DELETE /projects/{project_id}", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          deleteCard: ["DELETE /projects/columns/cards/{card_id}", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          deleteColumn: ["DELETE /projects/columns/{column_id}", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          get: ["GET /projects/{project_id}", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          getCard: ["GET /projects/columns/cards/{card_id}", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          getColumn: ["GET /projects/columns/{column_id}", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          getPermissionForUser: ["GET /projects/{project_id}/collaborators/{username}/permission", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          listCards: ["GET /projects/columns/{column_id}/cards", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          listCollaborators: ["GET /projects/{project_id}/collaborators", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          listColumns: ["GET /projects/{project_id}/columns", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          listForOrg: ["GET /orgs/{org}/projects", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          listForRepo: ["GET /repos/{owner}/{repo}/projects", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          listForUser: ["GET /users/{username}/projects", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          moveCard: ["POST /projects/columns/cards/{card_id}/moves", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          moveColumn: ["POST /projects/columns/{column_id}/moves", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          removeCollaborator: ["DELETE /projects/{project_id}/collaborators/{username}", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          update: ["PATCH /projects/{project_id}", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          updateCard: ["PATCH /projects/columns/cards/{card_id}", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          updateColumn: ["PATCH /projects/columns/{column_id}", {
            mediaType: {
              previews: ["inertia"]
            }
          }]
        },
        pulls: {
          checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
          create: ["POST /repos/{owner}/{repo}/pulls"],
          createReplyForReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies"],
          createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
          createReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
          deletePendingReview: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
          deleteReviewComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
          dismissReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals"],
          get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
          getReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
          getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
          list: ["GET /repos/{owner}/{repo}/pulls"],
          listCommentsForReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments"],
          listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
          listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
          listRequestedReviewers: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
          listReviewComments: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
          listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
          listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
          merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
          removeRequestedReviewers: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
          requestReviewers: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
          submitReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"],
          update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
          updateBranch: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch", {
            mediaType: {
              previews: ["lydian"]
            }
          }],
          updateReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
          updateReviewComment: ["PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"]
        },
        rateLimit: {
          get: ["GET /rate_limit"]
        },
        reactions: {
          createForCommitComment: ["POST /repos/{owner}/{repo}/comments/{comment_id}/reactions", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          createForIssue: ["POST /repos/{owner}/{repo}/issues/{issue_number}/reactions", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          createForIssueComment: ["POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          createForPullRequestReviewComment: ["POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          createForTeamDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          createForTeamDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          deleteForCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          deleteForIssue: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          deleteForIssueComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          deleteForPullRequestComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          deleteForTeamDiscussion: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          deleteForTeamDiscussionComment: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          deleteLegacy: ["DELETE /reactions/{reaction_id}", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }, {
            deprecated: "octokit.reactions.deleteLegacy() is deprecated, see https://docs.github.com/v3/reactions/#delete-a-reaction-legacy"
          }],
          listForCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}/reactions", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          listForIssueComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          listForPullRequestReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          listForTeamDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }],
          listForTeamDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions", {
            mediaType: {
              previews: ["squirrel-girl"]
            }
          }]
        },
        repos: {
          acceptInvitation: ["PATCH /user/repository_invitations/{invitation_id}"],
          addAppAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
            mapToData: "apps"
          }],
          addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
          addStatusCheckContexts: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
            mapToData: "contexts"
          }],
          addTeamAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
            mapToData: "teams"
          }],
          addUserAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
            mapToData: "users"
          }],
          checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
          checkVulnerabilityAlerts: ["GET /repos/{owner}/{repo}/vulnerability-alerts", {
            mediaType: {
              previews: ["dorian"]
            }
          }],
          compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
          createCommitComment: ["POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
          createCommitSignatureProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
            mediaType: {
              previews: ["zzzax"]
            }
          }],
          createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
          createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
          createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
          createDeploymentStatus: ["POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
          createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
          createForAuthenticatedUser: ["POST /user/repos"],
          createFork: ["POST /repos/{owner}/{repo}/forks"],
          createInOrg: ["POST /orgs/{org}/repos"],
          createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
          createPagesSite: ["POST /repos/{owner}/{repo}/pages", {
            mediaType: {
              previews: ["switcheroo"]
            }
          }],
          createRelease: ["POST /repos/{owner}/{repo}/releases"],
          createUsingTemplate: ["POST /repos/{template_owner}/{template_repo}/generate", {
            mediaType: {
              previews: ["baptiste"]
            }
          }],
          createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
          declineInvitation: ["DELETE /user/repository_invitations/{invitation_id}"],
          delete: ["DELETE /repos/{owner}/{repo}"],
          deleteAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
          deleteAdminBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
          deleteBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"],
          deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
          deleteCommitSignatureProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
            mediaType: {
              previews: ["zzzax"]
            }
          }],
          deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
          deleteDeployment: ["DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"],
          deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
          deleteInvitation: ["DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"],
          deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages", {
            mediaType: {
              previews: ["switcheroo"]
            }
          }],
          deletePullRequestReviewProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
          deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
          deleteReleaseAsset: ["DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"],
          deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
          disableAutomatedSecurityFixes: ["DELETE /repos/{owner}/{repo}/automated-security-fixes", {
            mediaType: {
              previews: ["london"]
            }
          }],
          disableVulnerabilityAlerts: ["DELETE /repos/{owner}/{repo}/vulnerability-alerts", {
            mediaType: {
              previews: ["dorian"]
            }
          }],
          downloadArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}", {}, {
            renamed: ["repos", "downloadZipballArchive"]
          }],
          downloadTarballArchive: ["GET /repos/{owner}/{repo}/tarball/{ref}"],
          downloadZipballArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}"],
          enableAutomatedSecurityFixes: ["PUT /repos/{owner}/{repo}/automated-security-fixes", {
            mediaType: {
              previews: ["london"]
            }
          }],
          enableVulnerabilityAlerts: ["PUT /repos/{owner}/{repo}/vulnerability-alerts", {
            mediaType: {
              previews: ["dorian"]
            }
          }],
          get: ["GET /repos/{owner}/{repo}"],
          getAccessRestrictions: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
          getAdminBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
          getAllStatusCheckContexts: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts"],
          getAllTopics: ["GET /repos/{owner}/{repo}/topics", {
            mediaType: {
              previews: ["mercy"]
            }
          }],
          getAppsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps"],
          getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
          getBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection"],
          getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
          getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
          getCollaboratorPermissionLevel: ["GET /repos/{owner}/{repo}/collaborators/{username}/permission"],
          getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
          getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
          getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
          getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
          getCommitSignatureProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
            mediaType: {
              previews: ["zzzax"]
            }
          }],
          getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile"],
          getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
          getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
          getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
          getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
          getDeploymentStatus: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}"],
          getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
          getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
          getPages: ["GET /repos/{owner}/{repo}/pages"],
          getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
          getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
          getPullRequestReviewProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
          getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
          getReadme: ["GET /repos/{owner}/{repo}/readme"],
          getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
          getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
          getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
          getStatusChecksProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
          getTeamsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams"],
          getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
          getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
          getUsersWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users"],
          getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
          getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
          getWebhookConfigForRepo: ["GET /repos/{owner}/{repo}/hooks/{hook_id}/config"],
          listBranches: ["GET /repos/{owner}/{repo}/branches"],
          listBranchesForHeadCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head", {
            mediaType: {
              previews: ["groot"]
            }
          }],
          listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
          listCommentsForCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
          listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
          listCommitStatusesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/statuses"],
          listCommits: ["GET /repos/{owner}/{repo}/commits"],
          listContributors: ["GET /repos/{owner}/{repo}/contributors"],
          listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
          listDeploymentStatuses: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
          listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
          listForAuthenticatedUser: ["GET /user/repos"],
          listForOrg: ["GET /orgs/{org}/repos"],
          listForUser: ["GET /users/{username}/repos"],
          listForks: ["GET /repos/{owner}/{repo}/forks"],
          listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
          listInvitationsForAuthenticatedUser: ["GET /user/repository_invitations"],
          listLanguages: ["GET /repos/{owner}/{repo}/languages"],
          listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
          listPublic: ["GET /repositories"],
          listPullRequestsAssociatedWithCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls", {
            mediaType: {
              previews: ["groot"]
            }
          }],
          listReleaseAssets: ["GET /repos/{owner}/{repo}/releases/{release_id}/assets"],
          listReleases: ["GET /repos/{owner}/{repo}/releases"],
          listTags: ["GET /repos/{owner}/{repo}/tags"],
          listTeams: ["GET /repos/{owner}/{repo}/teams"],
          listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
          merge: ["POST /repos/{owner}/{repo}/merges"],
          pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
          removeAppAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
            mapToData: "apps"
          }],
          removeCollaborator: ["DELETE /repos/{owner}/{repo}/collaborators/{username}"],
          removeStatusCheckContexts: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
            mapToData: "contexts"
          }],
          removeStatusCheckProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
          removeTeamAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
            mapToData: "teams"
          }],
          removeUserAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
            mapToData: "users"
          }],
          replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics", {
            mediaType: {
              previews: ["mercy"]
            }
          }],
          requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
          setAdminBranchProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
          setAppAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
            mapToData: "apps"
          }],
          setStatusCheckContexts: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
            mapToData: "contexts"
          }],
          setTeamAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
            mapToData: "teams"
          }],
          setUserAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
            mapToData: "users"
          }],
          testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
          transfer: ["POST /repos/{owner}/{repo}/transfer"],
          update: ["PATCH /repos/{owner}/{repo}"],
          updateBranchProtection: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection"],
          updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
          updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
          updateInvitation: ["PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"],
          updatePullRequestReviewProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
          updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
          updateReleaseAsset: ["PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"],
          updateStatusCheckPotection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks", {}, {
            renamed: ["repos", "updateStatusCheckProtection"]
          }],
          updateStatusCheckProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
          updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
          updateWebhookConfigForRepo: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config"],
          uploadReleaseAsset: ["POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}", {
            baseUrl: "https://uploads.github.com"
          }]
        },
        search: {
          code: ["GET /search/code"],
          commits: ["GET /search/commits", {
            mediaType: {
              previews: ["cloak"]
            }
          }],
          issuesAndPullRequests: ["GET /search/issues"],
          labels: ["GET /search/labels"],
          repos: ["GET /search/repositories"],
          topics: ["GET /search/topics", {
            mediaType: {
              previews: ["mercy"]
            }
          }],
          users: ["GET /search/users"]
        },
        secretScanning: {
          getAlert: ["GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"],
          listAlertsForRepo: ["GET /repos/{owner}/{repo}/secret-scanning/alerts"],
          updateAlert: ["PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"]
        },
        teams: {
          addOrUpdateMembershipForUserInOrg: ["PUT /orgs/{org}/teams/{team_slug}/memberships/{username}"],
          addOrUpdateProjectPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          addOrUpdateRepoPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
          checkPermissionsForProjectInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects/{project_id}", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          checkPermissionsForRepoInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
          create: ["POST /orgs/{org}/teams"],
          createDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
          createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
          deleteDiscussionCommentInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
          deleteDiscussionInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
          deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
          getByName: ["GET /orgs/{org}/teams/{team_slug}"],
          getDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
          getDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
          getMembershipForUserInOrg: ["GET /orgs/{org}/teams/{team_slug}/memberships/{username}"],
          list: ["GET /orgs/{org}/teams"],
          listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
          listDiscussionCommentsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
          listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
          listForAuthenticatedUser: ["GET /user/teams"],
          listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
          listPendingInvitationsInOrg: ["GET /orgs/{org}/teams/{team_slug}/invitations"],
          listProjectsInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects", {
            mediaType: {
              previews: ["inertia"]
            }
          }],
          listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
          removeMembershipForUserInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"],
          removeProjectInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/projects/{project_id}"],
          removeRepoInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
          updateDiscussionCommentInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
          updateDiscussionInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
          updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"]
        },
        users: {
          addEmailForAuthenticated: ["POST /user/emails"],
          block: ["PUT /user/blocks/{username}"],
          checkBlocked: ["GET /user/blocks/{username}"],
          checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
          checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
          createGpgKeyForAuthenticated: ["POST /user/gpg_keys"],
          createPublicSshKeyForAuthenticated: ["POST /user/keys"],
          deleteEmailForAuthenticated: ["DELETE /user/emails"],
          deleteGpgKeyForAuthenticated: ["DELETE /user/gpg_keys/{gpg_key_id}"],
          deletePublicSshKeyForAuthenticated: ["DELETE /user/keys/{key_id}"],
          follow: ["PUT /user/following/{username}"],
          getAuthenticated: ["GET /user"],
          getByUsername: ["GET /users/{username}"],
          getContextForUser: ["GET /users/{username}/hovercard"],
          getGpgKeyForAuthenticated: ["GET /user/gpg_keys/{gpg_key_id}"],
          getPublicSshKeyForAuthenticated: ["GET /user/keys/{key_id}"],
          list: ["GET /users"],
          listBlockedByAuthenticated: ["GET /user/blocks"],
          listEmailsForAuthenticated: ["GET /user/emails"],
          listFollowedByAuthenticated: ["GET /user/following"],
          listFollowersForAuthenticatedUser: ["GET /user/followers"],
          listFollowersForUser: ["GET /users/{username}/followers"],
          listFollowingForUser: ["GET /users/{username}/following"],
          listGpgKeysForAuthenticated: ["GET /user/gpg_keys"],
          listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
          listPublicEmailsForAuthenticated: ["GET /user/public_emails"],
          listPublicKeysForUser: ["GET /users/{username}/keys"],
          listPublicSshKeysForAuthenticated: ["GET /user/keys"],
          setPrimaryEmailVisibilityForAuthenticated: ["PATCH /user/email/visibility"],
          unblock: ["DELETE /user/blocks/{username}"],
          unfollow: ["DELETE /user/following/{username}"],
          updateAuthenticated: ["PATCH /user"]
        }
      };
      var VERSION = "4.4.1";
      function endpointsToMethods(octokit, endpointsMap) {
        const newMethods = {};
        for (const [scope, endpoints] of Object.entries(endpointsMap)) {
          for (const [methodName, endpoint] of Object.entries(endpoints)) {
            const [route, defaults, decorations] = endpoint;
            const [method, url] = route.split(/ /);
            const endpointDefaults = Object.assign({
              method,
              url
            }, defaults);
            if (!newMethods[scope]) {
              newMethods[scope] = {};
            }
            const scopeMethods = newMethods[scope];
            if (decorations) {
              scopeMethods[methodName] = decorate(octokit, scope, methodName, endpointDefaults, decorations);
              continue;
            }
            scopeMethods[methodName] = octokit.request.defaults(endpointDefaults);
          }
        }
        return newMethods;
      }
      function decorate(octokit, scope, methodName, defaults, decorations) {
        const requestWithDefaults = octokit.request.defaults(defaults);
        function withDecorations(...args) {
          let options = requestWithDefaults.endpoint.merge(...args);
          if (decorations.mapToData) {
            options = Object.assign({}, options, {
              data: options[decorations.mapToData],
              [decorations.mapToData]: void 0
            });
            return requestWithDefaults(options);
          }
          if (decorations.renamed) {
            const [newScope, newMethodName] = decorations.renamed;
            octokit.log.warn(`octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`);
          }
          if (decorations.deprecated) {
            octokit.log.warn(decorations.deprecated);
          }
          if (decorations.renamedParameters) {
            const options2 = requestWithDefaults.endpoint.merge(...args);
            for (const [name2, alias] of Object.entries(decorations.renamedParameters)) {
              if (name2 in options2) {
                octokit.log.warn(`"${name2}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`);
                if (!(alias in options2)) {
                  options2[alias] = options2[name2];
                }
                delete options2[name2];
              }
            }
            return requestWithDefaults(options2);
          }
          return requestWithDefaults(...args);
        }
        return Object.assign(withDecorations, requestWithDefaults);
      }
      function restEndpointMethods(octokit) {
        return endpointsToMethods(octokit, Endpoints);
      }
      restEndpointMethods.VERSION = VERSION;
      exports22.restEndpointMethods = restEndpointMethods;
    });
    var require_dist_node15 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      var core2 = require_dist_node112();
      var pluginRequestLog = require_dist_node122();
      var pluginPaginateRest = require_dist_node132();
      var pluginRestEndpointMethods = require_dist_node14();
      var VERSION = "18.0.12";
      var Octokit2 = core2.Octokit.plugin(pluginRequestLog.requestLog, pluginRestEndpointMethods.restEndpointMethods, pluginPaginateRest.paginateRest).defaults({
        userAgent: `octokit-rest.js/${VERSION}`
      });
      exports22.Octokit = Octokit2;
    });
    var require_safe_buffer = __commonJS2((exports22, module22) => {
      var buffer = require("buffer");
      var Buffer2 = buffer.Buffer;
      function copyProps(src, dst) {
        for (var key in src) {
          dst[key] = src[key];
        }
      }
      if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
        module22.exports = buffer;
      } else {
        copyProps(buffer, exports22);
        exports22.Buffer = SafeBuffer;
      }
      function SafeBuffer(arg, encodingOrOffset, length) {
        return Buffer2(arg, encodingOrOffset, length);
      }
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
    });
    var require_data_stream = __commonJS2((exports22, module22) => {
      var Buffer2 = require_safe_buffer().Buffer;
      var Stream = require("stream");
      var util2 = require("util");
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
      util2.inherits(DataStream, Stream);
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
      module22.exports = DataStream;
    });
    var require_buffer_equal_constant_time = __commonJS2((exports22, module22) => {
      "use strict";
      var Buffer2 = require("buffer").Buffer;
      var SlowBuffer = require("buffer").SlowBuffer;
      module22.exports = bufferEq;
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
    });
    var require_param_bytes_for_alg = __commonJS2((exports22, module22) => {
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
      module22.exports = getParamBytesForAlg;
    });
    var require_ecdsa_sig_formatter = __commonJS2((exports22, module22) => {
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
      module22.exports = {
        derToJose,
        joseToDer
      };
    });
    var require_jwa = __commonJS2((exports22, module22) => {
      var bufferEqual = require_buffer_equal_constant_time();
      var Buffer2 = require_safe_buffer().Buffer;
      var crypto = require("crypto");
      var formatEcdsa = require_ecdsa_sig_formatter();
      var util2 = require("util");
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
        var errMsg = util2.format.bind(util2, template).apply(null, args);
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
      module22.exports = function jwa(algorithm) {
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
    });
    var require_tostring = __commonJS2((exports22, module22) => {
      var Buffer2 = require("buffer").Buffer;
      module22.exports = function toString(obj) {
        if (typeof obj === "string")
          return obj;
        if (typeof obj === "number" || Buffer2.isBuffer(obj))
          return obj.toString();
        return JSON.stringify(obj);
      };
    });
    var require_sign_stream = __commonJS2((exports22, module22) => {
      var Buffer2 = require_safe_buffer().Buffer;
      var DataStream = require_data_stream();
      var jwa = require_jwa();
      var Stream = require("stream");
      var toString = require_tostring();
      var util2 = require("util");
      function base64url(string, encoding) {
        return Buffer2.from(string, encoding).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }
      function jwsSecuredInput(header, payload, encoding) {
        encoding = encoding || "utf8";
        var encodedHeader = base64url(toString(header), "binary");
        var encodedPayload = base64url(toString(payload), encoding);
        return util2.format("%s.%s", encodedHeader, encodedPayload);
      }
      function jwsSign(opts) {
        var header = opts.header;
        var payload = opts.payload;
        var secretOrKey = opts.secret || opts.privateKey;
        var encoding = opts.encoding;
        var algo = jwa(header.alg);
        var securedInput = jwsSecuredInput(header, payload, encoding);
        var signature = algo.sign(securedInput, secretOrKey);
        return util2.format("%s.%s", securedInput, signature);
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
      util2.inherits(SignStream, Stream);
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
      module22.exports = SignStream;
    });
    var require_verify_stream = __commonJS2((exports22, module22) => {
      var Buffer2 = require_safe_buffer().Buffer;
      var DataStream = require_data_stream();
      var jwa = require_jwa();
      var Stream = require("stream");
      var toString = require_tostring();
      var util2 = require("util");
      var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;
      function isObject2(thing) {
        return Object.prototype.toString.call(thing) === "[object Object]";
      }
      function safeJsonParse(thing) {
        if (isObject2(thing))
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
      util2.inherits(VerifyStream, Stream);
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
      module22.exports = VerifyStream;
    });
    var require_jws = __commonJS2((exports22) => {
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
      exports22.ALGORITHMS = ALGORITHMS;
      exports22.sign = SignStream.sign;
      exports22.verify = VerifyStream.verify;
      exports22.decode = VerifyStream.decode;
      exports22.isValid = VerifyStream.isValid;
      exports22.createSign = function createSign(opts) {
        return new SignStream(opts);
      };
      exports22.createVerify = function createVerify(opts) {
        return new VerifyStream(opts);
      };
    });
    var require_decode = __commonJS2((exports22, module22) => {
      var jws = require_jws();
      module22.exports = function(jwt, options) {
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
    });
    var require_JsonWebTokenError = __commonJS2((exports22, module22) => {
      var JsonWebTokenError = function(message, error) {
        Error.call(this, message);
        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
        this.name = "JsonWebTokenError";
        this.message = message;
        if (error)
          this.inner = error;
      };
      JsonWebTokenError.prototype = Object.create(Error.prototype);
      JsonWebTokenError.prototype.constructor = JsonWebTokenError;
      module22.exports = JsonWebTokenError;
    });
    var require_NotBeforeError = __commonJS2((exports22, module22) => {
      var JsonWebTokenError = require_JsonWebTokenError();
      var NotBeforeError = function(message, date) {
        JsonWebTokenError.call(this, message);
        this.name = "NotBeforeError";
        this.date = date;
      };
      NotBeforeError.prototype = Object.create(JsonWebTokenError.prototype);
      NotBeforeError.prototype.constructor = NotBeforeError;
      module22.exports = NotBeforeError;
    });
    var require_TokenExpiredError = __commonJS2((exports22, module22) => {
      var JsonWebTokenError = require_JsonWebTokenError();
      var TokenExpiredError = function(message, expiredAt) {
        JsonWebTokenError.call(this, message);
        this.name = "TokenExpiredError";
        this.expiredAt = expiredAt;
      };
      TokenExpiredError.prototype = Object.create(JsonWebTokenError.prototype);
      TokenExpiredError.prototype.constructor = TokenExpiredError;
      module22.exports = TokenExpiredError;
    });
    var require_ms = __commonJS2((exports22, module22) => {
      var s = 1e3;
      var m = s * 60;
      var h = m * 60;
      var d = h * 24;
      var w = d * 7;
      var y = d * 365.25;
      module22.exports = function(val, options) {
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
      function plural(ms, msAbs, n, name2) {
        var isPlural = msAbs >= n * 1.5;
        return Math.round(ms / n) + " " + name2 + (isPlural ? "s" : "");
      }
    });
    var require_timespan = __commonJS2((exports22, module22) => {
      var ms = require_ms();
      module22.exports = function(time, iat) {
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
    });
    var require_semver = __commonJS2((exports22, module22) => {
      exports22 = module22.exports = SemVer;
      var debug7;
      if (typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG)) {
        debug7 = function() {
          var args = Array.prototype.slice.call(arguments, 0);
          args.unshift("SEMVER");
          console.log.apply(console, args);
        };
      } else {
        debug7 = function() {
        };
      }
      exports22.SEMVER_SPEC_VERSION = "2.0.0";
      var MAX_LENGTH = 256;
      var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
      var MAX_SAFE_COMPONENT_LENGTH = 16;
      var re = exports22.re = [];
      var src = exports22.src = [];
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
        debug7(i, src[i]);
        if (!re[i]) {
          re[i] = new RegExp(src[i]);
        }
      }
      exports22.parse = parse;
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
      exports22.valid = valid;
      function valid(version, options) {
        var v = parse(version, options);
        return v ? v.version : null;
      }
      exports22.clean = clean;
      function clean(version, options) {
        var s = parse(version.trim().replace(/^[=v]+/, ""), options);
        return s ? s.version : null;
      }
      exports22.SemVer = SemVer;
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
        debug7("SemVer", version, options);
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
        debug7("SemVer.compare", this.version, this.options, other);
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
          debug7("prerelease compare", i2, a, b);
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
      exports22.inc = inc;
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
      exports22.diff = diff;
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
      exports22.compareIdentifiers = compareIdentifiers;
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
      exports22.rcompareIdentifiers = rcompareIdentifiers;
      function rcompareIdentifiers(a, b) {
        return compareIdentifiers(b, a);
      }
      exports22.major = major;
      function major(a, loose) {
        return new SemVer(a, loose).major;
      }
      exports22.minor = minor;
      function minor(a, loose) {
        return new SemVer(a, loose).minor;
      }
      exports22.patch = patch;
      function patch(a, loose) {
        return new SemVer(a, loose).patch;
      }
      exports22.compare = compare;
      function compare(a, b, loose) {
        return new SemVer(a, loose).compare(new SemVer(b, loose));
      }
      exports22.compareLoose = compareLoose;
      function compareLoose(a, b) {
        return compare(a, b, true);
      }
      exports22.rcompare = rcompare;
      function rcompare(a, b, loose) {
        return compare(b, a, loose);
      }
      exports22.sort = sort;
      function sort(list, loose) {
        return list.sort(function(a, b) {
          return exports22.compare(a, b, loose);
        });
      }
      exports22.rsort = rsort;
      function rsort(list, loose) {
        return list.sort(function(a, b) {
          return exports22.rcompare(a, b, loose);
        });
      }
      exports22.gt = gt;
      function gt(a, b, loose) {
        return compare(a, b, loose) > 0;
      }
      exports22.lt = lt;
      function lt(a, b, loose) {
        return compare(a, b, loose) < 0;
      }
      exports22.eq = eq;
      function eq(a, b, loose) {
        return compare(a, b, loose) === 0;
      }
      exports22.neq = neq;
      function neq(a, b, loose) {
        return compare(a, b, loose) !== 0;
      }
      exports22.gte = gte;
      function gte(a, b, loose) {
        return compare(a, b, loose) >= 0;
      }
      exports22.lte = lte;
      function lte(a, b, loose) {
        return compare(a, b, loose) <= 0;
      }
      exports22.cmp = cmp;
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
      exports22.Comparator = Comparator;
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
        debug7("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug7("comp", this);
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
        debug7("Comparator.test", version, this.options.loose);
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
      exports22.Range = Range;
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
        debug7("hyphen replace", range);
        range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
        debug7("comparator trim", range, re[COMPARATORTRIM]);
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
      exports22.toComparators = toComparators;
      function toComparators(range, options) {
        return new Range(range, options).set.map(function(comp) {
          return comp.map(function(c) {
            return c.value;
          }).join(" ").trim().split(" ");
        });
      }
      function parseComparator(comp, options) {
        debug7("comp", comp, options);
        comp = replaceCarets(comp, options);
        debug7("caret", comp);
        comp = replaceTildes(comp, options);
        debug7("tildes", comp);
        comp = replaceXRanges(comp, options);
        debug7("xrange", comp);
        comp = replaceStars(comp, options);
        debug7("stars", comp);
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
          debug7("tilde", comp, _, M, m, p, pr);
          var ret;
          if (isX(M)) {
            ret = "";
          } else if (isX(m)) {
            ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
          } else if (isX(p)) {
            ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
          } else if (pr) {
            debug7("replaceTilde pr", pr);
            ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + (+m + 1) + ".0";
          } else {
            ret = ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0";
          }
          debug7("tilde return", ret);
          return ret;
        });
      }
      function replaceCarets(comp, options) {
        return comp.trim().split(/\s+/).map(function(comp2) {
          return replaceCaret(comp2, options);
        }).join(" ");
      }
      function replaceCaret(comp, options) {
        debug7("caret", comp, options);
        var r = options.loose ? re[CARETLOOSE] : re[CARET];
        return comp.replace(r, function(_, M, m, p, pr) {
          debug7("caret", comp, _, M, m, p, pr);
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
            debug7("replaceCaret pr", pr);
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
            debug7("no pr");
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
          debug7("caret return", ret);
          return ret;
        });
      }
      function replaceXRanges(comp, options) {
        debug7("replaceXRanges", comp, options);
        return comp.split(/\s+/).map(function(comp2) {
          return replaceXRange(comp2, options);
        }).join(" ");
      }
      function replaceXRange(comp, options) {
        comp = comp.trim();
        var r = options.loose ? re[XRANGELOOSE] : re[XRANGE];
        return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
          debug7("xRange", comp, ret, gtlt, M, m, p, pr);
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
          debug7("xRange return", ret);
          return ret;
        });
      }
      function replaceStars(comp, options) {
        debug7("replaceStars", comp, options);
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
            debug7(set[i2].semver);
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
      exports22.satisfies = satisfies;
      function satisfies(version, range, options) {
        try {
          range = new Range(range, options);
        } catch (er) {
          return false;
        }
        return range.test(version);
      }
      exports22.maxSatisfying = maxSatisfying;
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
      exports22.minSatisfying = minSatisfying;
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
      exports22.minVersion = minVersion;
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
      exports22.validRange = validRange;
      function validRange(range, options) {
        try {
          return new Range(range, options).range || "*";
        } catch (er) {
          return null;
        }
      }
      exports22.ltr = ltr;
      function ltr(version, range, options) {
        return outside(version, range, "<", options);
      }
      exports22.gtr = gtr;
      function gtr(version, range, options) {
        return outside(version, range, ">", options);
      }
      exports22.outside = outside;
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
      exports22.prerelease = prerelease;
      function prerelease(version, options) {
        var parsed = parse(version, options);
        return parsed && parsed.prerelease.length ? parsed.prerelease : null;
      }
      exports22.intersects = intersects;
      function intersects(r1, r2, options) {
        r1 = new Range(r1, options);
        r2 = new Range(r2, options);
        return r1.intersects(r2);
      }
      exports22.coerce = coerce;
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
    });
    var require_psSupported = __commonJS2((exports22, module22) => {
      var semver = require_semver();
      module22.exports = semver.satisfies(process.version, "^6.12.0 || >=8.0.0");
    });
    var require_verify = __commonJS2((exports22, module22) => {
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
      module22.exports = function(jwtString, secretOrPublicKey, options, callback) {
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
          decodedToken = decode(jwtString, { complete: true });
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
    });
    var require_lodash = __commonJS2((exports22, module22) => {
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
        var tag = isObject2(value) ? objectToString.call(value) : "";
        return tag == funcTag || tag == genTag;
      }
      function isLength(value) {
        return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
      }
      function isObject2(value) {
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
        if (isObject2(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject2(other) ? other + "" : other;
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
      module22.exports = includes;
    });
    var require_lodash2 = __commonJS2((exports22, module22) => {
      var boolTag = "[object Boolean]";
      var objectProto = Object.prototype;
      var objectToString = objectProto.toString;
      function isBoolean(value) {
        return value === true || value === false || isObjectLike(value) && objectToString.call(value) == boolTag;
      }
      function isObjectLike(value) {
        return !!value && typeof value == "object";
      }
      module22.exports = isBoolean;
    });
    var require_lodash3 = __commonJS2((exports22, module22) => {
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
      function isObject2(value) {
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
        if (isObject2(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject2(other) ? other + "" : other;
        }
        if (typeof value != "string") {
          return value === 0 ? value : +value;
        }
        value = value.replace(reTrim, "");
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }
      module22.exports = isInteger;
    });
    var require_lodash4 = __commonJS2((exports22, module22) => {
      var numberTag = "[object Number]";
      var objectProto = Object.prototype;
      var objectToString = objectProto.toString;
      function isObjectLike(value) {
        return !!value && typeof value == "object";
      }
      function isNumber(value) {
        return typeof value == "number" || isObjectLike(value) && objectToString.call(value) == numberTag;
      }
      module22.exports = isNumber;
    });
    var require_lodash5 = __commonJS2((exports22, module22) => {
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
      module22.exports = isPlainObject;
    });
    var require_lodash6 = __commonJS2((exports22, module22) => {
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
      module22.exports = isString;
    });
    var require_lodash7 = __commonJS2((exports22, module22) => {
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
      function isObject2(value) {
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
        if (isObject2(value)) {
          var other = typeof value.valueOf == "function" ? value.valueOf() : value;
          value = isObject2(other) ? other + "" : other;
        }
        if (typeof value != "string") {
          return value === 0 ? value : +value;
        }
        value = value.replace(reTrim, "");
        var isBinary = reIsBinary.test(value);
        return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
      }
      module22.exports = once;
    });
    var require_sign = __commonJS2((exports22, module22) => {
      var timespan = require_timespan();
      var PS_SUPPORTED = require_psSupported();
      var jws = require_jws();
      var includes = require_lodash();
      var isBoolean = require_lodash2();
      var isInteger = require_lodash3();
      var isNumber = require_lodash4();
      var isPlainObject = require_lodash5();
      var isString = require_lodash6();
      var once = require_lodash7();
      var SUPPORTED_ALGS = ["RS256", "RS384", "RS512", "ES256", "ES384", "ES512", "HS256", "HS384", "HS512", "none"];
      if (PS_SUPPORTED) {
        SUPPORTED_ALGS.splice(3, 0, "PS256", "PS384", "PS512");
      }
      var sign_options_schema = {
        expiresIn: { isValid: function(value) {
          return isInteger(value) || isString(value) && value;
        }, message: '"expiresIn" should be a number of seconds or string representing a timespan' },
        notBefore: { isValid: function(value) {
          return isInteger(value) || isString(value) && value;
        }, message: '"notBefore" should be a number of seconds or string representing a timespan' },
        audience: { isValid: function(value) {
          return isString(value) || Array.isArray(value);
        }, message: '"audience" must be a string or array' },
        algorithm: { isValid: includes.bind(null, SUPPORTED_ALGS), message: '"algorithm" must be a valid string enum value' },
        header: { isValid: isPlainObject, message: '"header" must be an object' },
        encoding: { isValid: isString, message: '"encoding" must be a string' },
        issuer: { isValid: isString, message: '"issuer" must be a string' },
        subject: { isValid: isString, message: '"subject" must be a string' },
        jwtid: { isValid: isString, message: '"jwtid" must be a string' },
        noTimestamp: { isValid: isBoolean, message: '"noTimestamp" must be a boolean' },
        keyid: { isValid: isString, message: '"keyid" must be a string' },
        mutatePayload: { isValid: isBoolean, message: '"mutatePayload" must be a boolean' }
      };
      var registered_claims_schema = {
        iat: { isValid: isNumber, message: '"iat" should be a number of seconds' },
        exp: { isValid: isNumber, message: '"exp" should be a number of seconds' },
        nbf: { isValid: isNumber, message: '"nbf" should be a number of seconds' }
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
        audience: "aud",
        issuer: "iss",
        subject: "sub",
        jwtid: "jti"
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
      module22.exports = function(payload, secretOrPrivateKey, options, callback) {
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
          } catch (error) {
            return failure(error);
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
        } catch (error) {
          return failure(error);
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
          return jws.sign({ header, payload, secret: secretOrPrivateKey, encoding });
        }
      };
    });
    var require_jsonwebtoken = __commonJS2((exports22, module22) => {
      module22.exports = {
        decode: require_decode(),
        verify: require_verify(),
        sign: require_sign(),
        JsonWebTokenError: require_JsonWebTokenError(),
        NotBeforeError: require_NotBeforeError(),
        TokenExpiredError: require_TokenExpiredError()
      };
    });
    var require_dist_node16 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      function _interopDefault(ex) {
        return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
      }
      var jsonwebtoken = _interopDefault(require_jsonwebtoken());
      async function getToken3({
        privateKey,
        payload
      }) {
        return jsonwebtoken.sign(payload, privateKey, {
          algorithm: "RS256"
        });
      }
      async function githubAppJwt({
        id,
        privateKey,
        now = Math.floor(Date.now() / 1e3)
      }) {
        const nowWithSafetyMargin = now - 30;
        const expiration = nowWithSafetyMargin + 60 * 10;
        const payload = {
          iat: nowWithSafetyMargin,
          exp: expiration,
          iss: id
        };
        const token = await getToken3({
          privateKey,
          payload
        });
        return {
          appId: id,
          expiration,
          token
        };
      }
      exports22.githubAppJwt = githubAppJwt;
    });
    var require_iterator = __commonJS2((exports22, module22) => {
      "use strict";
      module22.exports = function(Yallist) {
        Yallist.prototype[Symbol.iterator] = function* () {
          for (let walker = this.head; walker; walker = walker.next) {
            yield walker.value;
          }
        };
      };
    });
    var require_yallist = __commonJS2((exports22, module22) => {
      "use strict";
      module22.exports = Yallist;
      Yallist.Node = Node;
      Yallist.create = Yallist;
      function Yallist(list) {
        var self = this;
        if (!(self instanceof Yallist)) {
          self = new Yallist();
        }
        self.tail = null;
        self.head = null;
        self.length = 0;
        if (list && typeof list.forEach === "function") {
          list.forEach(function(item) {
            self.push(item);
          });
        } else if (arguments.length > 0) {
          for (var i = 0, l = arguments.length; i < l; i++) {
            self.push(arguments[i]);
          }
        }
        return self;
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
        return next;
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
      Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
        if (start > this.length) {
          start = this.length - 1;
        }
        if (start < 0) {
          start = this.length + start;
        }
        for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
          walker = walker.next;
        }
        var ret = [];
        for (var i = 0; walker && i < deleteCount; i++) {
          ret.push(walker.value);
          walker = this.removeNode(walker);
        }
        if (walker === null) {
          walker = this.tail;
        }
        if (walker !== this.head && walker !== this.tail) {
          walker = walker.prev;
        }
        for (var i = 0; i < nodes.length; i++) {
          walker = insert(this, walker, nodes[i]);
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
      function insert(self, node, value) {
        var inserted = node === self.head ? new Node(value, null, node, self) : new Node(value, node, node.next, self);
        if (inserted.next === null) {
          self.tail = inserted;
        }
        if (inserted.prev === null) {
          self.head = inserted;
        }
        self.length++;
        return inserted;
      }
      function push(self, item) {
        self.tail = new Node(item, self.tail, null, self);
        if (!self.head) {
          self.head = self.tail;
        }
        self.length++;
      }
      function unshift(self, item) {
        self.head = new Node(item, null, self.head, self);
        if (!self.tail) {
          self.tail = self.head;
        }
        self.length++;
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
        require_iterator()(Yallist);
      } catch (er) {
      }
    });
    var require_lru_cache = __commonJS2((exports22, module22) => {
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
            options = { max: options };
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
      var get = (self, key, doUse) => {
        const node = self[CACHE].get(key);
        if (node) {
          const hit = node.value;
          if (isStale(self, hit)) {
            del(self, node);
            if (!self[ALLOW_STALE])
              return void 0;
          } else {
            if (doUse) {
              if (self[UPDATE_AGE_ON_GET])
                node.value.now = Date.now();
              self[LRU_LIST].unshiftNode(node);
            }
          }
          return hit.value;
        }
      };
      var isStale = (self, hit) => {
        if (!hit || !hit.maxAge && !self[MAX_AGE])
          return false;
        const diff = Date.now() - hit.now;
        return hit.maxAge ? diff > hit.maxAge : self[MAX_AGE] && diff > self[MAX_AGE];
      };
      var trim = (self) => {
        if (self[LENGTH] > self[MAX]) {
          for (let walker = self[LRU_LIST].tail; self[LENGTH] > self[MAX] && walker !== null; ) {
            const prev = walker.prev;
            del(self, walker);
            walker = prev;
          }
        }
      };
      var del = (self, node) => {
        if (node) {
          const hit = node.value;
          if (self[DISPOSE])
            self[DISPOSE](hit.key, hit.value);
          self[LENGTH] -= hit.length;
          self[CACHE].delete(hit.key);
          self[LRU_LIST].removeNode(node);
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
      var forEachStep = (self, fn, node, thisp) => {
        let hit = node.value;
        if (isStale(self, hit)) {
          del(self, node);
          if (!self[ALLOW_STALE])
            hit = void 0;
        }
        if (hit)
          fn.call(thisp, hit.value, hit.key, self);
      };
      module22.exports = LRUCache;
    });
    var require_dist_node17 = __commonJS2((exports22) => {
      "use strict";
      Object.defineProperty(exports22, "__esModule", { value: true });
      function _interopDefault(ex) {
        return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
      }
      var universalUserAgent = require_dist_node13();
      var request = require_dist_node82();
      var universalGithubAppJwt = require_dist_node16();
      var LRU = _interopDefault(require_lru_cache());
      var requestError = require_dist_node42();
      async function getAppAuthentication({
        id,
        privateKey,
        timeDifference
      }) {
        const appAuthentication = await universalGithubAppJwt.githubAppJwt({
          id: +id,
          privateKey,
          now: timeDifference && Math.floor(Date.now() / 1e3) + timeDifference
        });
        return {
          type: "app",
          token: appAuthentication.token,
          appId: appAuthentication.appId,
          expiresAt: new Date(appAuthentication.expiration * 1e3).toISOString()
        };
      }
      function getCache() {
        return new LRU({
          max: 15e3,
          maxAge: 1e3 * 60 * 59
        });
      }
      async function get(cache, options) {
        const cacheKey = optionsToCacheKey(options);
        const result = await cache.get(cacheKey);
        if (!result) {
          return;
        }
        const [token, createdAt, expiresAt, repositorySelection, permissionsString, singleFileName] = result.split("|");
        const permissions = options.permissions || permissionsString.split(/,/).reduce((permissions2, string) => {
          if (/!$/.test(string)) {
            permissions2[string.slice(0, -1)] = "write";
          } else {
            permissions2[string] = "read";
          }
          return permissions2;
        }, {});
        return {
          token,
          createdAt,
          expiresAt,
          permissions,
          repositoryIds: options.repositoryIds,
          singleFileName,
          repositorySelection
        };
      }
      async function set(cache, options, data) {
        const key = optionsToCacheKey(options);
        const permissionsString = options.permissions ? "" : Object.keys(data.permissions).map((name2) => `${name2}${data.permissions[name2] === "write" ? "!" : ""}`).join(",");
        const value = [data.token, data.createdAt, data.expiresAt, data.repositorySelection, permissionsString, data.singleFileName].join("|");
        await cache.set(key, value);
      }
      function optionsToCacheKey({
        installationId,
        permissions = {},
        repositoryIds = []
      }) {
        const permissionsString = Object.keys(permissions).sort().map((name2) => permissions[name2] === "read" ? name2 : `${name2}!`).join(",");
        const repositoryIdsString = repositoryIds.sort().join(",");
        return [installationId, repositoryIdsString, permissionsString].filter(Boolean).join("|");
      }
      function toTokenAuthentication({
        installationId,
        token,
        createdAt,
        expiresAt,
        repositorySelection,
        permissions,
        repositoryIds,
        singleFileName
      }) {
        return Object.assign({
          type: "token",
          tokenType: "installation",
          token,
          installationId,
          permissions,
          createdAt,
          expiresAt,
          repositorySelection
        }, repositoryIds ? {
          repositoryIds
        } : null, singleFileName ? {
          singleFileName
        } : null);
      }
      async function getInstallationAuthentication(state, options, customRequest) {
        const installationId = Number(options.installationId || state.installationId);
        if (!installationId) {
          throw new Error("[@octokit/auth-app] installationId option is required for installation authentication.");
        }
        if (options.factory) {
          return options.factory({
            cache: state.cache,
            id: state.id,
            privateKey: state.privateKey,
            log: state.log,
            request: state.request,
            clientId: state.clientId,
            clientSecret: state.clientSecret,
            timeDifference: state.timeDifference,
            installationId
          });
        }
        const optionsWithInstallationTokenFromState = Object.assign({
          installationId
        }, options);
        if (!options.refresh) {
          const result = await get(state.cache, optionsWithInstallationTokenFromState);
          if (result) {
            const {
              token: token2,
              createdAt: createdAt2,
              expiresAt: expiresAt2,
              permissions: permissions2,
              repositoryIds: repositoryIds2,
              singleFileName: singleFileName2,
              repositorySelection: repositorySelection2
            } = result;
            return toTokenAuthentication({
              installationId,
              token: token2,
              createdAt: createdAt2,
              expiresAt: expiresAt2,
              permissions: permissions2,
              repositorySelection: repositorySelection2,
              repositoryIds: repositoryIds2,
              singleFileName: singleFileName2
            });
          }
        }
        const appAuthentication = await getAppAuthentication(state);
        const request2 = customRequest || state.request;
        const {
          data: {
            token,
            expires_at: expiresAt,
            repositories,
            permissions,
            repository_selection: repositorySelection,
            single_file: singleFileName
          }
        } = await request2("POST /app/installations/:installation_id/access_tokens", {
          installation_id: installationId,
          repository_ids: options.repositoryIds,
          permissions: options.permissions,
          mediaType: {
            previews: ["machine-man"]
          },
          headers: {
            authorization: `bearer ${appAuthentication.token}`
          }
        });
        const repositoryIds = repositories ? repositories.map((r) => r.id) : void 0;
        const createdAt = new Date().toISOString();
        await set(state.cache, optionsWithInstallationTokenFromState, {
          token,
          createdAt,
          expiresAt,
          repositorySelection,
          permissions,
          repositoryIds,
          singleFileName
        });
        return toTokenAuthentication({
          installationId,
          token,
          createdAt,
          expiresAt,
          repositorySelection,
          permissions,
          repositoryIds,
          singleFileName
        });
      }
      async function getOAuthAuthentication(state, options, customRequest) {
        const request2 = customRequest || state.request;
        const route = /^https:\/\/(api\.)?github\.com$/.test(state.request.endpoint.DEFAULTS.baseUrl) ? "POST https://github.com/login/oauth/access_token" : `POST ${state.request.endpoint.DEFAULTS.baseUrl.replace("/api/v3", "/login/oauth/access_token")}`;
        const parameters = {
          headers: {
            accept: `application/json`
          },
          client_id: state.clientId,
          client_secret: state.clientSecret,
          code: options.code,
          state: options.state,
          redirect_uri: options.redirectUrl
        };
        const response = await request2(route, parameters);
        if (response.data.error !== void 0) {
          throw new requestError.RequestError(`${response.data.error_description} (${response.data.error})`, response.status, {
            headers: response.headers,
            request: request2.endpoint(route, parameters)
          });
        }
        const {
          data: {
            access_token: token,
            scope
          }
        } = response;
        return {
          type: "token",
          tokenType: "oauth",
          token,
          scopes: scope.split(/,\s*/).filter(Boolean)
        };
      }
      async function auth(state, options) {
        if (options.type === "app") {
          return getAppAuthentication(state);
        }
        if (options.type === "installation") {
          return getInstallationAuthentication(state, options);
        }
        return getOAuthAuthentication(state, options);
      }
      function _defineProperty(obj, key, value) {
        if (key in obj) {
          Object.defineProperty(obj, key, {
            value,
            enumerable: true,
            configurable: true,
            writable: true
          });
        } else {
          obj[key] = value;
        }
        return obj;
      }
      function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(object);
          if (enumerableOnly)
            symbols = symbols.filter(function(sym) {
              return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
          keys.push.apply(keys, symbols);
        }
        return keys;
      }
      function _objectSpread2(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i] != null ? arguments[i] : {};
          if (i % 2) {
            ownKeys(Object(source), true).forEach(function(key) {
              _defineProperty(target, key, source[key]);
            });
          } else if (Object.getOwnPropertyDescriptors) {
            Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
          } else {
            ownKeys(Object(source)).forEach(function(key) {
              Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
          }
        }
        return target;
      }
      var PATHS = ["/app", "/app/installations", "/app/installations/:installation_id", "/app/installations/:installation_id/access_tokens", "/marketplace_listing/accounts/:account_id", "/marketplace_listing/plan", "/marketplace_listing/plans/:plan_id/accounts", "/marketplace_listing/stubbed/accounts/:account_id", "/marketplace_listing/stubbed/plan", "/marketplace_listing/stubbed/plans/:plan_id/accounts", "/orgs/:org/installation", "/repos/:owner/:repo/installation", "/users/:username/installation"];
      function routeMatcher(paths) {
        const regexes = paths.map((p) => p.split("/").map((c) => c.startsWith(":") ? "(?:.+?)" : c).join("/"));
        const regex = `^(?:${regexes.map((r) => `(?:${r})`).join("|")})[^/]*$`;
        return new RegExp(regex, "i");
      }
      var REGEX = routeMatcher(PATHS);
      function requiresAppAuth(url) {
        return !!url && REGEX.test(url);
      }
      var FIVE_SECONDS_IN_MS = 5 * 1e3;
      function isNotTimeSkewError(error) {
        return !(error.message.match(/'Expiration time' claim \('exp'\) must be a numeric value representing the future time at which the assertion expires/) || error.message.match(/'Issued at' claim \('iat'\) must be an Integer representing the time that the assertion was issued/));
      }
      async function hook(state, request2, route, parameters) {
        let endpoint = request2.endpoint.merge(route, parameters);
        if (requiresAppAuth(endpoint.url.replace(request2.endpoint.DEFAULTS.baseUrl, ""))) {
          const {
            token: token2
          } = await getAppAuthentication(state);
          endpoint.headers.authorization = `bearer ${token2}`;
          let response;
          try {
            response = await request2(endpoint);
          } catch (error) {
            if (isNotTimeSkewError(error)) {
              throw error;
            }
            if (typeof error.headers.date === "undefined") {
              throw error;
            }
            const diff = Math.floor((Date.parse(error.headers.date) - Date.parse(new Date().toString())) / 1e3);
            state.log.warn(error.message);
            state.log.warn(`[@octokit/auth-app] GitHub API time and system time are different by ${diff} seconds. Retrying request with the difference accounted for.`);
            const {
              token: token3
            } = await getAppAuthentication(_objectSpread2(_objectSpread2({}, state), {}, {
              timeDifference: diff
            }));
            endpoint.headers.authorization = `bearer ${token3}`;
            return request2(endpoint);
          }
          return response;
        }
        const {
          token,
          createdAt
        } = await getInstallationAuthentication(state, {}, request2);
        endpoint.headers.authorization = `token ${token}`;
        return sendRequestWithRetries(state, request2, endpoint, createdAt);
      }
      async function sendRequestWithRetries(state, request2, options, createdAt, retries = 0) {
        const timeSinceTokenCreationInMs = +new Date() - +new Date(createdAt);
        try {
          return await request2(options);
        } catch (error) {
          if (error.status !== 401) {
            throw error;
          }
          if (timeSinceTokenCreationInMs >= FIVE_SECONDS_IN_MS) {
            if (retries > 0) {
              error.message = `After ${retries} retries within ${timeSinceTokenCreationInMs / 1e3}s of creating the installation access token, the response remains 401. At this point, the cause may be an authentication problem or a system outage. Please check https://www.githubstatus.com for status information`;
            }
            throw error;
          }
          ++retries;
          const awaitTime = retries * 1e3;
          state.log.warn(`[@octokit/auth-app] Retrying after 401 response to account for token replication delay (retry: ${retries}, wait: ${awaitTime / 1e3}s)`);
          await new Promise((resolve) => setTimeout(resolve, awaitTime));
          return sendRequestWithRetries(state, request2, options, createdAt, retries);
        }
      }
      var VERSION = "2.8.0";
      var createAppAuth2 = function createAppAuth3(options) {
        const state = Object.assign({
          request: request.request.defaults({
            headers: {
              "user-agent": `octokit-auth-app.js/${VERSION} ${universalUserAgent.getUserAgent()}`
            }
          }),
          cache: getCache()
        }, options, {
          id: Number(options.id)
        }, options.installationId ? {
          installationId: Number(options.installationId)
        } : {}, {
          log: Object.assign({
            warn: console.warn.bind(console)
          }, options.log)
        });
        return Object.assign(auth.bind(null, state), {
          hook: hook.bind(null, state)
        });
      };
      exports22.createAppAuth = createAppAuth2;
    });
    var require_utils4 = __commonJS2((exports22, module22) => {
      var crypt = require("crypto");
      module22.exports.linebrk = function(str, maxLen) {
        var res = "";
        var i = 0;
        while (i + maxLen < str.length) {
          res += str.substring(i, i + maxLen) + "\n";
          i += maxLen;
        }
        return res + str.substring(i, str.length);
      };
      module22.exports.detectEnvironment = function() {
        if (typeof window !== "undefined" && window && !(process && process.title === "node")) {
          return "browser";
        }
        return "node";
      };
      module22.exports.get32IntFromBuffer = function(buffer, offset) {
        offset = offset || 0;
        var size = 0;
        if ((size = buffer.length - offset) > 0) {
          if (size >= 4) {
            return buffer.readUIntBE(offset, size);
          } else {
            var res = 0;
            for (var i = offset + size, d = 0; i > offset; i--, d += 2) {
              res += buffer[i - 1] * Math.pow(16, d);
            }
            return res;
          }
        } else {
          return NaN;
        }
      };
      module22.exports._ = {
        isObject: function(value) {
          var type = typeof value;
          return !!value && (type == "object" || type == "function");
        },
        isString: function(value) {
          return typeof value == "string" || value instanceof String;
        },
        isNumber: function(value) {
          return typeof value == "number" || !isNaN(parseFloat(value)) && isFinite(value);
        },
        omit: function(obj, removeProp) {
          var newObj = {};
          for (var prop in obj) {
            if (!obj.hasOwnProperty(prop) || prop === removeProp) {
              continue;
            }
            newObj[prop] = obj[prop];
          }
          return newObj;
        }
      };
      module22.exports.trimSurroundingText = function(data, opening, closing) {
        var trimStartIndex = 0;
        var trimEndIndex = data.length;
        var openingBoundaryIndex = data.indexOf(opening);
        if (openingBoundaryIndex >= 0) {
          trimStartIndex = openingBoundaryIndex + opening.length;
        }
        var closingBoundaryIndex = data.indexOf(closing, openingBoundaryIndex);
        if (closingBoundaryIndex >= 0) {
          trimEndIndex = closingBoundaryIndex;
        }
        return data.substring(trimStartIndex, trimEndIndex);
      };
    });
    var require_jsbn = __commonJS2((exports22, module22) => {
      var crypt = require("crypto");
      var _ = require_utils4()._;
      var dbits;
      var canary = 244837814094590;
      var j_lm = (canary & 16777215) == 15715070;
      function BigInteger(a, b) {
        if (a != null) {
          if (typeof a == "number") {
            this.fromNumber(a, b);
          } else if (Buffer.isBuffer(a)) {
            this.fromBuffer(a);
          } else if (b == null && typeof a != "string") {
            this.fromByteArray(a);
          } else {
            this.fromString(a, b);
          }
        }
      }
      function nbi() {
        return new BigInteger(null);
      }
      function am3(i, x, w, j, c, n) {
        var xl = x & 16383, xh = x >> 14;
        while (--n >= 0) {
          var l = this[i] & 16383;
          var h = this[i++] >> 14;
          var m = xh * l + h * xl;
          l = xl * l + ((m & 16383) << 14) + w[j] + c;
          c = (l >> 28) + (m >> 14) + xh * h;
          w[j++] = l & 268435455;
        }
        return c;
      }
      BigInteger.prototype.am = am3;
      dbits = 28;
      BigInteger.prototype.DB = dbits;
      BigInteger.prototype.DM = (1 << dbits) - 1;
      BigInteger.prototype.DV = 1 << dbits;
      var BI_FP = 52;
      BigInteger.prototype.FV = Math.pow(2, BI_FP);
      BigInteger.prototype.F1 = BI_FP - dbits;
      BigInteger.prototype.F2 = 2 * dbits - BI_FP;
      var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
      var BI_RC = new Array();
      var rr;
      var vv;
      rr = "0".charCodeAt(0);
      for (vv = 0; vv <= 9; ++vv)
        BI_RC[rr++] = vv;
      rr = "a".charCodeAt(0);
      for (vv = 10; vv < 36; ++vv)
        BI_RC[rr++] = vv;
      rr = "A".charCodeAt(0);
      for (vv = 10; vv < 36; ++vv)
        BI_RC[rr++] = vv;
      function int2char(n) {
        return BI_RM.charAt(n);
      }
      function intAt(s, i) {
        var c = BI_RC[s.charCodeAt(i)];
        return c == null ? -1 : c;
      }
      function bnpCopyTo(r) {
        for (var i = this.t - 1; i >= 0; --i)
          r[i] = this[i];
        r.t = this.t;
        r.s = this.s;
      }
      function bnpFromInt(x) {
        this.t = 1;
        this.s = x < 0 ? -1 : 0;
        if (x > 0)
          this[0] = x;
        else if (x < -1)
          this[0] = x + DV;
        else
          this.t = 0;
      }
      function nbv(i) {
        var r = nbi();
        r.fromInt(i);
        return r;
      }
      function bnpFromString(data, radix, unsigned) {
        var k;
        switch (radix) {
          case 2:
            k = 1;
            break;
          case 4:
            k = 2;
            break;
          case 8:
            k = 3;
            break;
          case 16:
            k = 4;
            break;
          case 32:
            k = 5;
            break;
          case 256:
            k = 8;
            break;
          default:
            this.fromRadix(data, radix);
            return;
        }
        this.t = 0;
        this.s = 0;
        var i = data.length;
        var mi = false;
        var sh = 0;
        while (--i >= 0) {
          var x = k == 8 ? data[i] & 255 : intAt(data, i);
          if (x < 0) {
            if (data.charAt(i) == "-")
              mi = true;
            continue;
          }
          mi = false;
          if (sh === 0)
            this[this.t++] = x;
          else if (sh + k > this.DB) {
            this[this.t - 1] |= (x & (1 << this.DB - sh) - 1) << sh;
            this[this.t++] = x >> this.DB - sh;
          } else
            this[this.t - 1] |= x << sh;
          sh += k;
          if (sh >= this.DB)
            sh -= this.DB;
        }
        if (!unsigned && k == 8 && (data[0] & 128) != 0) {
          this.s = -1;
          if (sh > 0)
            this[this.t - 1] |= (1 << this.DB - sh) - 1 << sh;
        }
        this.clamp();
        if (mi)
          BigInteger.ZERO.subTo(this, this);
      }
      function bnpFromByteArray(a, unsigned) {
        this.fromString(a, 256, unsigned);
      }
      function bnpFromBuffer(a) {
        this.fromString(a, 256, true);
      }
      function bnpClamp() {
        var c = this.s & this.DM;
        while (this.t > 0 && this[this.t - 1] == c)
          --this.t;
      }
      function bnToString(b) {
        if (this.s < 0)
          return "-" + this.negate().toString(b);
        var k;
        if (b == 16)
          k = 4;
        else if (b == 8)
          k = 3;
        else if (b == 2)
          k = 1;
        else if (b == 32)
          k = 5;
        else if (b == 4)
          k = 2;
        else
          return this.toRadix(b);
        var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
        var p = this.DB - i * this.DB % k;
        if (i-- > 0) {
          if (p < this.DB && (d = this[i] >> p) > 0) {
            m = true;
            r = int2char(d);
          }
          while (i >= 0) {
            if (p < k) {
              d = (this[i] & (1 << p) - 1) << k - p;
              d |= this[--i] >> (p += this.DB - k);
            } else {
              d = this[i] >> (p -= k) & km;
              if (p <= 0) {
                p += this.DB;
                --i;
              }
            }
            if (d > 0)
              m = true;
            if (m)
              r += int2char(d);
          }
        }
        return m ? r : "0";
      }
      function bnNegate() {
        var r = nbi();
        BigInteger.ZERO.subTo(this, r);
        return r;
      }
      function bnAbs() {
        return this.s < 0 ? this.negate() : this;
      }
      function bnCompareTo(a) {
        var r = this.s - a.s;
        if (r != 0)
          return r;
        var i = this.t;
        r = i - a.t;
        if (r != 0)
          return this.s < 0 ? -r : r;
        while (--i >= 0)
          if ((r = this[i] - a[i]) != 0)
            return r;
        return 0;
      }
      function nbits(x) {
        var r = 1, t;
        if ((t = x >>> 16) != 0) {
          x = t;
          r += 16;
        }
        if ((t = x >> 8) != 0) {
          x = t;
          r += 8;
        }
        if ((t = x >> 4) != 0) {
          x = t;
          r += 4;
        }
        if ((t = x >> 2) != 0) {
          x = t;
          r += 2;
        }
        if ((t = x >> 1) != 0) {
          x = t;
          r += 1;
        }
        return r;
      }
      function bnBitLength() {
        if (this.t <= 0)
          return 0;
        return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM);
      }
      function bnpDLShiftTo(n, r) {
        var i;
        for (i = this.t - 1; i >= 0; --i)
          r[i + n] = this[i];
        for (i = n - 1; i >= 0; --i)
          r[i] = 0;
        r.t = this.t + n;
        r.s = this.s;
      }
      function bnpDRShiftTo(n, r) {
        for (var i = n; i < this.t; ++i)
          r[i - n] = this[i];
        r.t = Math.max(this.t - n, 0);
        r.s = this.s;
      }
      function bnpLShiftTo(n, r) {
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << cbs) - 1;
        var ds = Math.floor(n / this.DB), c = this.s << bs & this.DM, i;
        for (i = this.t - 1; i >= 0; --i) {
          r[i + ds + 1] = this[i] >> cbs | c;
          c = (this[i] & bm) << bs;
        }
        for (i = ds - 1; i >= 0; --i)
          r[i] = 0;
        r[ds] = c;
        r.t = this.t + ds + 1;
        r.s = this.s;
        r.clamp();
      }
      function bnpRShiftTo(n, r) {
        r.s = this.s;
        var ds = Math.floor(n / this.DB);
        if (ds >= this.t) {
          r.t = 0;
          return;
        }
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << bs) - 1;
        r[0] = this[ds] >> bs;
        for (var i = ds + 1; i < this.t; ++i) {
          r[i - ds - 1] |= (this[i] & bm) << cbs;
          r[i - ds] = this[i] >> bs;
        }
        if (bs > 0)
          r[this.t - ds - 1] |= (this.s & bm) << cbs;
        r.t = this.t - ds;
        r.clamp();
      }
      function bnpSubTo(a, r) {
        var i = 0, c = 0, m = Math.min(a.t, this.t);
        while (i < m) {
          c += this[i] - a[i];
          r[i++] = c & this.DM;
          c >>= this.DB;
        }
        if (a.t < this.t) {
          c -= a.s;
          while (i < this.t) {
            c += this[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
          }
          c += this.s;
        } else {
          c += this.s;
          while (i < a.t) {
            c -= a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
          }
          c -= a.s;
        }
        r.s = c < 0 ? -1 : 0;
        if (c < -1)
          r[i++] = this.DV + c;
        else if (c > 0)
          r[i++] = c;
        r.t = i;
        r.clamp();
      }
      function bnpMultiplyTo(a, r) {
        var x = this.abs(), y = a.abs();
        var i = x.t;
        r.t = i + y.t;
        while (--i >= 0)
          r[i] = 0;
        for (i = 0; i < y.t; ++i)
          r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
        r.s = 0;
        r.clamp();
        if (this.s != a.s)
          BigInteger.ZERO.subTo(r, r);
      }
      function bnpSquareTo(r) {
        var x = this.abs();
        var i = r.t = 2 * x.t;
        while (--i >= 0)
          r[i] = 0;
        for (i = 0; i < x.t - 1; ++i) {
          var c = x.am(i, x[i], r, 2 * i, 0, 1);
          if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
            r[i + x.t] -= x.DV;
            r[i + x.t + 1] = 1;
          }
        }
        if (r.t > 0)
          r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
        r.s = 0;
        r.clamp();
      }
      function bnpDivRemTo(m, q, r) {
        var pm = m.abs();
        if (pm.t <= 0)
          return;
        var pt = this.abs();
        if (pt.t < pm.t) {
          if (q != null)
            q.fromInt(0);
          if (r != null)
            this.copyTo(r);
          return;
        }
        if (r == null)
          r = nbi();
        var y = nbi(), ts = this.s, ms = m.s;
        var nsh = this.DB - nbits(pm[pm.t - 1]);
        if (nsh > 0) {
          pm.lShiftTo(nsh, y);
          pt.lShiftTo(nsh, r);
        } else {
          pm.copyTo(y);
          pt.copyTo(r);
        }
        var ys = y.t;
        var y0 = y[ys - 1];
        if (y0 === 0)
          return;
        var yt = y0 * (1 << this.F1) + (ys > 1 ? y[ys - 2] >> this.F2 : 0);
        var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
        var i = r.t, j = i - ys, t = q == null ? nbi() : q;
        y.dlShiftTo(j, t);
        if (r.compareTo(t) >= 0) {
          r[r.t++] = 1;
          r.subTo(t, r);
        }
        BigInteger.ONE.dlShiftTo(ys, t);
        t.subTo(y, y);
        while (y.t < ys)
          y[y.t++] = 0;
        while (--j >= 0) {
          var qd = r[--i] == y0 ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
          if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
            y.dlShiftTo(j, t);
            r.subTo(t, r);
            while (r[i] < --qd)
              r.subTo(t, r);
          }
        }
        if (q != null) {
          r.drShiftTo(ys, q);
          if (ts != ms)
            BigInteger.ZERO.subTo(q, q);
        }
        r.t = ys;
        r.clamp();
        if (nsh > 0)
          r.rShiftTo(nsh, r);
        if (ts < 0)
          BigInteger.ZERO.subTo(r, r);
      }
      function bnMod(a) {
        var r = nbi();
        this.abs().divRemTo(a, null, r);
        if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0)
          a.subTo(r, r);
        return r;
      }
      function Classic(m) {
        this.m = m;
      }
      function cConvert(x) {
        if (x.s < 0 || x.compareTo(this.m) >= 0)
          return x.mod(this.m);
        else
          return x;
      }
      function cRevert(x) {
        return x;
      }
      function cReduce(x) {
        x.divRemTo(this.m, null, x);
      }
      function cMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
      }
      function cSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
      }
      Classic.prototype.convert = cConvert;
      Classic.prototype.revert = cRevert;
      Classic.prototype.reduce = cReduce;
      Classic.prototype.mulTo = cMulTo;
      Classic.prototype.sqrTo = cSqrTo;
      function bnpInvDigit() {
        if (this.t < 1)
          return 0;
        var x = this[0];
        if ((x & 1) === 0)
          return 0;
        var y = x & 3;
        y = y * (2 - (x & 15) * y) & 15;
        y = y * (2 - (x & 255) * y) & 255;
        y = y * (2 - ((x & 65535) * y & 65535)) & 65535;
        y = y * (2 - x * y % this.DV) % this.DV;
        return y > 0 ? this.DV - y : -y;
      }
      function Montgomery(m) {
        this.m = m;
        this.mp = m.invDigit();
        this.mpl = this.mp & 32767;
        this.mph = this.mp >> 15;
        this.um = (1 << m.DB - 15) - 1;
        this.mt2 = 2 * m.t;
      }
      function montConvert(x) {
        var r = nbi();
        x.abs().dlShiftTo(this.m.t, r);
        r.divRemTo(this.m, null, r);
        if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0)
          this.m.subTo(r, r);
        return r;
      }
      function montRevert(x) {
        var r = nbi();
        x.copyTo(r);
        this.reduce(r);
        return r;
      }
      function montReduce(x) {
        while (x.t <= this.mt2)
          x[x.t++] = 0;
        for (var i = 0; i < this.m.t; ++i) {
          var j = x[i] & 32767;
          var u0 = j * this.mpl + ((j * this.mph + (x[i] >> 15) * this.mpl & this.um) << 15) & x.DM;
          j = i + this.m.t;
          x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
          while (x[j] >= x.DV) {
            x[j] -= x.DV;
            x[++j]++;
          }
        }
        x.clamp();
        x.drShiftTo(this.m.t, x);
        if (x.compareTo(this.m) >= 0)
          x.subTo(this.m, x);
      }
      function montSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
      }
      function montMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
      }
      Montgomery.prototype.convert = montConvert;
      Montgomery.prototype.revert = montRevert;
      Montgomery.prototype.reduce = montReduce;
      Montgomery.prototype.mulTo = montMulTo;
      Montgomery.prototype.sqrTo = montSqrTo;
      function bnpIsEven() {
        return (this.t > 0 ? this[0] & 1 : this.s) === 0;
      }
      function bnpExp(e, z) {
        if (e > 4294967295 || e < 1)
          return BigInteger.ONE;
        var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
        g.copyTo(r);
        while (--i >= 0) {
          z.sqrTo(r, r2);
          if ((e & 1 << i) > 0)
            z.mulTo(r2, g, r);
          else {
            var t = r;
            r = r2;
            r2 = t;
          }
        }
        return z.revert(r);
      }
      function bnModPowInt(e, m) {
        var z;
        if (e < 256 || m.isEven())
          z = new Classic(m);
        else
          z = new Montgomery(m);
        return this.exp(e, z);
      }
      function bnClone() {
        var r = nbi();
        this.copyTo(r);
        return r;
      }
      function bnIntValue() {
        if (this.s < 0) {
          if (this.t == 1)
            return this[0] - this.DV;
          else if (this.t === 0)
            return -1;
        } else if (this.t == 1)
          return this[0];
        else if (this.t === 0)
          return 0;
        return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
      }
      function bnByteValue() {
        return this.t == 0 ? this.s : this[0] << 24 >> 24;
      }
      function bnShortValue() {
        return this.t == 0 ? this.s : this[0] << 16 >> 16;
      }
      function bnpChunkSize(r) {
        return Math.floor(Math.LN2 * this.DB / Math.log(r));
      }
      function bnSigNum() {
        if (this.s < 0)
          return -1;
        else if (this.t <= 0 || this.t == 1 && this[0] <= 0)
          return 0;
        else
          return 1;
      }
      function bnpToRadix(b) {
        if (b == null)
          b = 10;
        if (this.signum() === 0 || b < 2 || b > 36)
          return "0";
        var cs = this.chunkSize(b);
        var a = Math.pow(b, cs);
        var d = nbv(a), y = nbi(), z = nbi(), r = "";
        this.divRemTo(d, y, z);
        while (y.signum() > 0) {
          r = (a + z.intValue()).toString(b).substr(1) + r;
          y.divRemTo(d, y, z);
        }
        return z.intValue().toString(b) + r;
      }
      function bnpFromRadix(s, b) {
        this.fromInt(0);
        if (b == null)
          b = 10;
        var cs = this.chunkSize(b);
        var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
        for (var i = 0; i < s.length; ++i) {
          var x = intAt(s, i);
          if (x < 0) {
            if (s.charAt(i) == "-" && this.signum() === 0)
              mi = true;
            continue;
          }
          w = b * w + x;
          if (++j >= cs) {
            this.dMultiply(d);
            this.dAddOffset(w, 0);
            j = 0;
            w = 0;
          }
        }
        if (j > 0) {
          this.dMultiply(Math.pow(b, j));
          this.dAddOffset(w, 0);
        }
        if (mi)
          BigInteger.ZERO.subTo(this, this);
      }
      function bnpFromNumber(a, b) {
        if (typeof b == "number") {
          if (a < 2)
            this.fromInt(1);
          else {
            this.fromNumber(a);
            if (!this.testBit(a - 1))
              this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
            if (this.isEven())
              this.dAddOffset(1, 0);
            while (!this.isProbablePrime(b)) {
              this.dAddOffset(2, 0);
              if (this.bitLength() > a)
                this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
            }
          }
        } else {
          var x = crypt.randomBytes((a >> 3) + 1);
          var t = a & 7;
          if (t > 0)
            x[0] &= (1 << t) - 1;
          else
            x[0] = 0;
          this.fromByteArray(x);
        }
      }
      function bnToByteArray() {
        var i = this.t, r = new Array();
        r[0] = this.s;
        var p = this.DB - i * this.DB % 8, d, k = 0;
        if (i-- > 0) {
          if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
            r[k++] = d | this.s << this.DB - p;
          while (i >= 0) {
            if (p < 8) {
              d = (this[i] & (1 << p) - 1) << 8 - p;
              d |= this[--i] >> (p += this.DB - 8);
            } else {
              d = this[i] >> (p -= 8) & 255;
              if (p <= 0) {
                p += this.DB;
                --i;
              }
            }
            if ((d & 128) != 0)
              d |= -256;
            if (k === 0 && (this.s & 128) != (d & 128))
              ++k;
            if (k > 0 || d != this.s)
              r[k++] = d;
          }
        }
        return r;
      }
      function bnToBuffer(trimOrSize) {
        var res = Buffer.from(this.toByteArray());
        if (trimOrSize === true && res[0] === 0) {
          res = res.slice(1);
        } else if (_.isNumber(trimOrSize)) {
          if (res.length > trimOrSize) {
            for (var i = 0; i < res.length - trimOrSize; i++) {
              if (res[i] !== 0) {
                return null;
              }
            }
            return res.slice(res.length - trimOrSize);
          } else if (res.length < trimOrSize) {
            var padded = Buffer.alloc(trimOrSize);
            padded.fill(0, 0, trimOrSize - res.length);
            res.copy(padded, trimOrSize - res.length);
            return padded;
          }
        }
        return res;
      }
      function bnEquals(a) {
        return this.compareTo(a) == 0;
      }
      function bnMin(a) {
        return this.compareTo(a) < 0 ? this : a;
      }
      function bnMax(a) {
        return this.compareTo(a) > 0 ? this : a;
      }
      function bnpBitwiseTo(a, op, r) {
        var i, f, m = Math.min(a.t, this.t);
        for (i = 0; i < m; ++i)
          r[i] = op(this[i], a[i]);
        if (a.t < this.t) {
          f = a.s & this.DM;
          for (i = m; i < this.t; ++i)
            r[i] = op(this[i], f);
          r.t = this.t;
        } else {
          f = this.s & this.DM;
          for (i = m; i < a.t; ++i)
            r[i] = op(f, a[i]);
          r.t = a.t;
        }
        r.s = op(this.s, a.s);
        r.clamp();
      }
      function op_and(x, y) {
        return x & y;
      }
      function bnAnd(a) {
        var r = nbi();
        this.bitwiseTo(a, op_and, r);
        return r;
      }
      function op_or(x, y) {
        return x | y;
      }
      function bnOr(a) {
        var r = nbi();
        this.bitwiseTo(a, op_or, r);
        return r;
      }
      function op_xor(x, y) {
        return x ^ y;
      }
      function bnXor(a) {
        var r = nbi();
        this.bitwiseTo(a, op_xor, r);
        return r;
      }
      function op_andnot(x, y) {
        return x & ~y;
      }
      function bnAndNot(a) {
        var r = nbi();
        this.bitwiseTo(a, op_andnot, r);
        return r;
      }
      function bnNot() {
        var r = nbi();
        for (var i = 0; i < this.t; ++i)
          r[i] = this.DM & ~this[i];
        r.t = this.t;
        r.s = ~this.s;
        return r;
      }
      function bnShiftLeft(n) {
        var r = nbi();
        if (n < 0)
          this.rShiftTo(-n, r);
        else
          this.lShiftTo(n, r);
        return r;
      }
      function bnShiftRight(n) {
        var r = nbi();
        if (n < 0)
          this.lShiftTo(-n, r);
        else
          this.rShiftTo(n, r);
        return r;
      }
      function lbit(x) {
        if (x === 0)
          return -1;
        var r = 0;
        if ((x & 65535) === 0) {
          x >>= 16;
          r += 16;
        }
        if ((x & 255) === 0) {
          x >>= 8;
          r += 8;
        }
        if ((x & 15) === 0) {
          x >>= 4;
          r += 4;
        }
        if ((x & 3) === 0) {
          x >>= 2;
          r += 2;
        }
        if ((x & 1) === 0)
          ++r;
        return r;
      }
      function bnGetLowestSetBit() {
        for (var i = 0; i < this.t; ++i)
          if (this[i] != 0)
            return i * this.DB + lbit(this[i]);
        if (this.s < 0)
          return this.t * this.DB;
        return -1;
      }
      function cbit(x) {
        var r = 0;
        while (x != 0) {
          x &= x - 1;
          ++r;
        }
        return r;
      }
      function bnBitCount() {
        var r = 0, x = this.s & this.DM;
        for (var i = 0; i < this.t; ++i)
          r += cbit(this[i] ^ x);
        return r;
      }
      function bnTestBit(n) {
        var j = Math.floor(n / this.DB);
        if (j >= this.t)
          return this.s != 0;
        return (this[j] & 1 << n % this.DB) != 0;
      }
      function bnpChangeBit(n, op) {
        var r = BigInteger.ONE.shiftLeft(n);
        this.bitwiseTo(r, op, r);
        return r;
      }
      function bnSetBit(n) {
        return this.changeBit(n, op_or);
      }
      function bnClearBit(n) {
        return this.changeBit(n, op_andnot);
      }
      function bnFlipBit(n) {
        return this.changeBit(n, op_xor);
      }
      function bnpAddTo(a, r) {
        var i = 0, c = 0, m = Math.min(a.t, this.t);
        while (i < m) {
          c += this[i] + a[i];
          r[i++] = c & this.DM;
          c >>= this.DB;
        }
        if (a.t < this.t) {
          c += a.s;
          while (i < this.t) {
            c += this[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
          }
          c += this.s;
        } else {
          c += this.s;
          while (i < a.t) {
            c += a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
          }
          c += a.s;
        }
        r.s = c < 0 ? -1 : 0;
        if (c > 0)
          r[i++] = c;
        else if (c < -1)
          r[i++] = this.DV + c;
        r.t = i;
        r.clamp();
      }
      function bnAdd(a) {
        var r = nbi();
        this.addTo(a, r);
        return r;
      }
      function bnSubtract(a) {
        var r = nbi();
        this.subTo(a, r);
        return r;
      }
      function bnMultiply(a) {
        var r = nbi();
        this.multiplyTo(a, r);
        return r;
      }
      function bnSquare() {
        var r = nbi();
        this.squareTo(r);
        return r;
      }
      function bnDivide(a) {
        var r = nbi();
        this.divRemTo(a, r, null);
        return r;
      }
      function bnRemainder(a) {
        var r = nbi();
        this.divRemTo(a, null, r);
        return r;
      }
      function bnDivideAndRemainder(a) {
        var q = nbi(), r = nbi();
        this.divRemTo(a, q, r);
        return new Array(q, r);
      }
      function bnpDMultiply(n) {
        this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
        ++this.t;
        this.clamp();
      }
      function bnpDAddOffset(n, w) {
        if (n === 0)
          return;
        while (this.t <= w)
          this[this.t++] = 0;
        this[w] += n;
        while (this[w] >= this.DV) {
          this[w] -= this.DV;
          if (++w >= this.t)
            this[this.t++] = 0;
          ++this[w];
        }
      }
      function NullExp() {
      }
      function nNop(x) {
        return x;
      }
      function nMulTo(x, y, r) {
        x.multiplyTo(y, r);
      }
      function nSqrTo(x, r) {
        x.squareTo(r);
      }
      NullExp.prototype.convert = nNop;
      NullExp.prototype.revert = nNop;
      NullExp.prototype.mulTo = nMulTo;
      NullExp.prototype.sqrTo = nSqrTo;
      function bnPow(e) {
        return this.exp(e, new NullExp());
      }
      function bnpMultiplyLowerTo(a, n, r) {
        var i = Math.min(this.t + a.t, n);
        r.s = 0;
        r.t = i;
        while (i > 0)
          r[--i] = 0;
        var j;
        for (j = r.t - this.t; i < j; ++i)
          r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
        for (j = Math.min(a.t, n); i < j; ++i)
          this.am(0, a[i], r, i, 0, n - i);
        r.clamp();
      }
      function bnpMultiplyUpperTo(a, n, r) {
        --n;
        var i = r.t = this.t + a.t - n;
        r.s = 0;
        while (--i >= 0)
          r[i] = 0;
        for (i = Math.max(n - this.t, 0); i < a.t; ++i)
          r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
        r.clamp();
        r.drShiftTo(1, r);
      }
      function Barrett(m) {
        this.r2 = nbi();
        this.q3 = nbi();
        BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
        this.mu = this.r2.divide(m);
        this.m = m;
      }
      function barrettConvert(x) {
        if (x.s < 0 || x.t > 2 * this.m.t)
          return x.mod(this.m);
        else if (x.compareTo(this.m) < 0)
          return x;
        else {
          var r = nbi();
          x.copyTo(r);
          this.reduce(r);
          return r;
        }
      }
      function barrettRevert(x) {
        return x;
      }
      function barrettReduce(x) {
        x.drShiftTo(this.m.t - 1, this.r2);
        if (x.t > this.m.t + 1) {
          x.t = this.m.t + 1;
          x.clamp();
        }
        this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
        this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
        while (x.compareTo(this.r2) < 0)
          x.dAddOffset(1, this.m.t + 1);
        x.subTo(this.r2, x);
        while (x.compareTo(this.m) >= 0)
          x.subTo(this.m, x);
      }
      function barrettSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
      }
      function barrettMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
      }
      Barrett.prototype.convert = barrettConvert;
      Barrett.prototype.revert = barrettRevert;
      Barrett.prototype.reduce = barrettReduce;
      Barrett.prototype.mulTo = barrettMulTo;
      Barrett.prototype.sqrTo = barrettSqrTo;
      function bnModPow(e, m) {
        var i = e.bitLength(), k, r = nbv(1), z;
        if (i <= 0)
          return r;
        else if (i < 18)
          k = 1;
        else if (i < 48)
          k = 3;
        else if (i < 144)
          k = 4;
        else if (i < 768)
          k = 5;
        else
          k = 6;
        if (i < 8)
          z = new Classic(m);
        else if (m.isEven())
          z = new Barrett(m);
        else
          z = new Montgomery(m);
        var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1;
        g[1] = z.convert(this);
        if (k > 1) {
          var g2 = nbi();
          z.sqrTo(g[1], g2);
          while (n <= km) {
            g[n] = nbi();
            z.mulTo(g2, g[n - 2], g[n]);
            n += 2;
          }
        }
        var j = e.t - 1, w, is1 = true, r2 = nbi(), t;
        i = nbits(e[j]) - 1;
        while (j >= 0) {
          if (i >= k1)
            w = e[j] >> i - k1 & km;
          else {
            w = (e[j] & (1 << i + 1) - 1) << k1 - i;
            if (j > 0)
              w |= e[j - 1] >> this.DB + i - k1;
          }
          n = k;
          while ((w & 1) === 0) {
            w >>= 1;
            --n;
          }
          if ((i -= n) < 0) {
            i += this.DB;
            --j;
          }
          if (is1) {
            g[w].copyTo(r);
            is1 = false;
          } else {
            while (n > 1) {
              z.sqrTo(r, r2);
              z.sqrTo(r2, r);
              n -= 2;
            }
            if (n > 0)
              z.sqrTo(r, r2);
            else {
              t = r;
              r = r2;
              r2 = t;
            }
            z.mulTo(r2, g[w], r);
          }
          while (j >= 0 && (e[j] & 1 << i) === 0) {
            z.sqrTo(r, r2);
            t = r;
            r = r2;
            r2 = t;
            if (--i < 0) {
              i = this.DB - 1;
              --j;
            }
          }
        }
        return z.revert(r);
      }
      function bnGCD(a) {
        var x = this.s < 0 ? this.negate() : this.clone();
        var y = a.s < 0 ? a.negate() : a.clone();
        if (x.compareTo(y) < 0) {
          var t = x;
          x = y;
          y = t;
        }
        var i = x.getLowestSetBit(), g = y.getLowestSetBit();
        if (g < 0)
          return x;
        if (i < g)
          g = i;
        if (g > 0) {
          x.rShiftTo(g, x);
          y.rShiftTo(g, y);
        }
        while (x.signum() > 0) {
          if ((i = x.getLowestSetBit()) > 0)
            x.rShiftTo(i, x);
          if ((i = y.getLowestSetBit()) > 0)
            y.rShiftTo(i, y);
          if (x.compareTo(y) >= 0) {
            x.subTo(y, x);
            x.rShiftTo(1, x);
          } else {
            y.subTo(x, y);
            y.rShiftTo(1, y);
          }
        }
        if (g > 0)
          y.lShiftTo(g, y);
        return y;
      }
      function bnpModInt(n) {
        if (n <= 0)
          return 0;
        var d = this.DV % n, r = this.s < 0 ? n - 1 : 0;
        if (this.t > 0)
          if (d === 0)
            r = this[0] % n;
          else
            for (var i = this.t - 1; i >= 0; --i)
              r = (d * r + this[i]) % n;
        return r;
      }
      function bnModInverse(m) {
        var ac = m.isEven();
        if (this.isEven() && ac || m.signum() === 0)
          return BigInteger.ZERO;
        var u = m.clone(), v = this.clone();
        var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
        while (u.signum() != 0) {
          while (u.isEven()) {
            u.rShiftTo(1, u);
            if (ac) {
              if (!a.isEven() || !b.isEven()) {
                a.addTo(this, a);
                b.subTo(m, b);
              }
              a.rShiftTo(1, a);
            } else if (!b.isEven())
              b.subTo(m, b);
            b.rShiftTo(1, b);
          }
          while (v.isEven()) {
            v.rShiftTo(1, v);
            if (ac) {
              if (!c.isEven() || !d.isEven()) {
                c.addTo(this, c);
                d.subTo(m, d);
              }
              c.rShiftTo(1, c);
            } else if (!d.isEven())
              d.subTo(m, d);
            d.rShiftTo(1, d);
          }
          if (u.compareTo(v) >= 0) {
            u.subTo(v, u);
            if (ac)
              a.subTo(c, a);
            b.subTo(d, b);
          } else {
            v.subTo(u, v);
            if (ac)
              c.subTo(a, c);
            d.subTo(b, d);
          }
        }
        if (v.compareTo(BigInteger.ONE) != 0)
          return BigInteger.ZERO;
        if (d.compareTo(m) >= 0)
          return d.subtract(m);
        if (d.signum() < 0)
          d.addTo(m, d);
        else
          return d;
        if (d.signum() < 0)
          return d.add(m);
        else
          return d;
      }
      var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
      var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];
      function bnIsProbablePrime(t) {
        var i, x = this.abs();
        if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
          for (i = 0; i < lowprimes.length; ++i)
            if (x[0] == lowprimes[i])
              return true;
          return false;
        }
        if (x.isEven())
          return false;
        i = 1;
        while (i < lowprimes.length) {
          var m = lowprimes[i], j = i + 1;
          while (j < lowprimes.length && m < lplim)
            m *= lowprimes[j++];
          m = x.modInt(m);
          while (i < j)
            if (m % lowprimes[i++] === 0)
              return false;
        }
        return x.millerRabin(t);
      }
      function bnpMillerRabin(t) {
        var n1 = this.subtract(BigInteger.ONE);
        var k = n1.getLowestSetBit();
        if (k <= 0)
          return false;
        var r = n1.shiftRight(k);
        t = t + 1 >> 1;
        if (t > lowprimes.length)
          t = lowprimes.length;
        var a = nbi();
        for (var i = 0; i < t; ++i) {
          a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
          var y = a.modPow(r, this);
          if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
            var j = 1;
            while (j++ < k && y.compareTo(n1) != 0) {
              y = y.modPowInt(2, this);
              if (y.compareTo(BigInteger.ONE) === 0)
                return false;
            }
            if (y.compareTo(n1) != 0)
              return false;
          }
        }
        return true;
      }
      BigInteger.prototype.copyTo = bnpCopyTo;
      BigInteger.prototype.fromInt = bnpFromInt;
      BigInteger.prototype.fromString = bnpFromString;
      BigInteger.prototype.fromByteArray = bnpFromByteArray;
      BigInteger.prototype.fromBuffer = bnpFromBuffer;
      BigInteger.prototype.clamp = bnpClamp;
      BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
      BigInteger.prototype.drShiftTo = bnpDRShiftTo;
      BigInteger.prototype.lShiftTo = bnpLShiftTo;
      BigInteger.prototype.rShiftTo = bnpRShiftTo;
      BigInteger.prototype.subTo = bnpSubTo;
      BigInteger.prototype.multiplyTo = bnpMultiplyTo;
      BigInteger.prototype.squareTo = bnpSquareTo;
      BigInteger.prototype.divRemTo = bnpDivRemTo;
      BigInteger.prototype.invDigit = bnpInvDigit;
      BigInteger.prototype.isEven = bnpIsEven;
      BigInteger.prototype.exp = bnpExp;
      BigInteger.prototype.chunkSize = bnpChunkSize;
      BigInteger.prototype.toRadix = bnpToRadix;
      BigInteger.prototype.fromRadix = bnpFromRadix;
      BigInteger.prototype.fromNumber = bnpFromNumber;
      BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
      BigInteger.prototype.changeBit = bnpChangeBit;
      BigInteger.prototype.addTo = bnpAddTo;
      BigInteger.prototype.dMultiply = bnpDMultiply;
      BigInteger.prototype.dAddOffset = bnpDAddOffset;
      BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
      BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
      BigInteger.prototype.modInt = bnpModInt;
      BigInteger.prototype.millerRabin = bnpMillerRabin;
      BigInteger.prototype.toString = bnToString;
      BigInteger.prototype.negate = bnNegate;
      BigInteger.prototype.abs = bnAbs;
      BigInteger.prototype.compareTo = bnCompareTo;
      BigInteger.prototype.bitLength = bnBitLength;
      BigInteger.prototype.mod = bnMod;
      BigInteger.prototype.modPowInt = bnModPowInt;
      BigInteger.prototype.clone = bnClone;
      BigInteger.prototype.intValue = bnIntValue;
      BigInteger.prototype.byteValue = bnByteValue;
      BigInteger.prototype.shortValue = bnShortValue;
      BigInteger.prototype.signum = bnSigNum;
      BigInteger.prototype.toByteArray = bnToByteArray;
      BigInteger.prototype.toBuffer = bnToBuffer;
      BigInteger.prototype.equals = bnEquals;
      BigInteger.prototype.min = bnMin;
      BigInteger.prototype.max = bnMax;
      BigInteger.prototype.and = bnAnd;
      BigInteger.prototype.or = bnOr;
      BigInteger.prototype.xor = bnXor;
      BigInteger.prototype.andNot = bnAndNot;
      BigInteger.prototype.not = bnNot;
      BigInteger.prototype.shiftLeft = bnShiftLeft;
      BigInteger.prototype.shiftRight = bnShiftRight;
      BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
      BigInteger.prototype.bitCount = bnBitCount;
      BigInteger.prototype.testBit = bnTestBit;
      BigInteger.prototype.setBit = bnSetBit;
      BigInteger.prototype.clearBit = bnClearBit;
      BigInteger.prototype.flipBit = bnFlipBit;
      BigInteger.prototype.add = bnAdd;
      BigInteger.prototype.subtract = bnSubtract;
      BigInteger.prototype.multiply = bnMultiply;
      BigInteger.prototype.divide = bnDivide;
      BigInteger.prototype.remainder = bnRemainder;
      BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
      BigInteger.prototype.modPow = bnModPow;
      BigInteger.prototype.modInverse = bnModInverse;
      BigInteger.prototype.pow = bnPow;
      BigInteger.prototype.gcd = bnGCD;
      BigInteger.prototype.isProbablePrime = bnIsProbablePrime;
      BigInteger.int2char = int2char;
      BigInteger.ZERO = nbv(0);
      BigInteger.ONE = nbv(1);
      BigInteger.prototype.square = bnSquare;
      module22.exports = BigInteger;
    });
    var require_pkcs1 = __commonJS2((exports22, module22) => {
      var BigInteger = require_jsbn();
      var crypt = require("crypto");
      var constants2 = require("constants");
      var SIGN_INFO_HEAD = {
        md2: Buffer.from("3020300c06082a864886f70d020205000410", "hex"),
        md5: Buffer.from("3020300c06082a864886f70d020505000410", "hex"),
        sha1: Buffer.from("3021300906052b0e03021a05000414", "hex"),
        sha224: Buffer.from("302d300d06096086480165030402040500041c", "hex"),
        sha256: Buffer.from("3031300d060960864801650304020105000420", "hex"),
        sha384: Buffer.from("3041300d060960864801650304020205000430", "hex"),
        sha512: Buffer.from("3051300d060960864801650304020305000440", "hex"),
        ripemd160: Buffer.from("3021300906052b2403020105000414", "hex"),
        rmd160: Buffer.from("3021300906052b2403020105000414", "hex")
      };
      var SIGN_ALG_TO_HASH_ALIASES = {
        ripemd160: "rmd160"
      };
      var DEFAULT_HASH_FUNCTION = "sha256";
      module22.exports = {
        isEncryption: true,
        isSignature: true
      };
      module22.exports.makeScheme = function(key, options) {
        function Scheme(key2, options2) {
          this.key = key2;
          this.options = options2;
        }
        Scheme.prototype.maxMessageLength = function() {
          if (this.options.encryptionSchemeOptions && this.options.encryptionSchemeOptions.padding == constants2.RSA_NO_PADDING) {
            return this.key.encryptedDataLength;
          }
          return this.key.encryptedDataLength - 11;
        };
        Scheme.prototype.encPad = function(buffer, options2) {
          options2 = options2 || {};
          var filled;
          if (buffer.length > this.key.maxMessageLength) {
            throw new Error("Message too long for RSA (n=" + this.key.encryptedDataLength + ", l=" + buffer.length + ")");
          }
          if (this.options.encryptionSchemeOptions && this.options.encryptionSchemeOptions.padding == constants2.RSA_NO_PADDING) {
            filled = Buffer.alloc(this.key.maxMessageLength - buffer.length);
            filled.fill(0);
            return Buffer.concat([filled, buffer]);
          }
          if (options2.type === 1) {
            filled = Buffer.alloc(this.key.encryptedDataLength - buffer.length - 1);
            filled.fill(255, 0, filled.length - 1);
            filled[0] = 1;
            filled[filled.length - 1] = 0;
            return Buffer.concat([filled, buffer]);
          } else {
            filled = Buffer.alloc(this.key.encryptedDataLength - buffer.length);
            filled[0] = 0;
            filled[1] = 2;
            var rand = crypt.randomBytes(filled.length - 3);
            for (var i = 0; i < rand.length; i++) {
              var r = rand[i];
              while (r === 0) {
                r = crypt.randomBytes(1)[0];
              }
              filled[i + 2] = r;
            }
            filled[filled.length - 1] = 0;
            return Buffer.concat([filled, buffer]);
          }
        };
        Scheme.prototype.encUnPad = function(buffer, options2) {
          options2 = options2 || {};
          var i = 0;
          if (this.options.encryptionSchemeOptions && this.options.encryptionSchemeOptions.padding == constants2.RSA_NO_PADDING) {
            var unPad;
            if (typeof buffer.lastIndexOf == "function") {
              unPad = buffer.slice(buffer.lastIndexOf("\0") + 1, buffer.length);
            } else {
              unPad = buffer.slice(String.prototype.lastIndexOf.call(buffer, "\0") + 1, buffer.length);
            }
            return unPad;
          }
          if (buffer.length < 4) {
            return null;
          }
          if (options2.type === 1) {
            if (buffer[0] !== 0 || buffer[1] !== 1) {
              return null;
            }
            i = 3;
            while (buffer[i] !== 0) {
              if (buffer[i] != 255 || ++i >= buffer.length) {
                return null;
              }
            }
          } else {
            if (buffer[0] !== 0 || buffer[1] !== 2) {
              return null;
            }
            i = 3;
            while (buffer[i] !== 0) {
              if (++i >= buffer.length) {
                return null;
              }
            }
          }
          return buffer.slice(i + 1, buffer.length);
        };
        Scheme.prototype.sign = function(buffer) {
          var hashAlgorithm = this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
          if (this.options.environment === "browser") {
            hashAlgorithm = SIGN_ALG_TO_HASH_ALIASES[hashAlgorithm] || hashAlgorithm;
            var hasher = crypt.createHash(hashAlgorithm);
            hasher.update(buffer);
            var hash = this.pkcs1pad(hasher.digest(), hashAlgorithm);
            var res = this.key.$doPrivate(new BigInteger(hash)).toBuffer(this.key.encryptedDataLength);
            return res;
          } else {
            var signer = crypt.createSign("RSA-" + hashAlgorithm.toUpperCase());
            signer.update(buffer);
            return signer.sign(this.options.rsaUtils.exportKey("private"));
          }
        };
        Scheme.prototype.verify = function(buffer, signature, signature_encoding) {
          if (this.options.encryptionSchemeOptions && this.options.encryptionSchemeOptions.padding == constants2.RSA_NO_PADDING) {
            return false;
          }
          var hashAlgorithm = this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
          if (this.options.environment === "browser") {
            hashAlgorithm = SIGN_ALG_TO_HASH_ALIASES[hashAlgorithm] || hashAlgorithm;
            if (signature_encoding) {
              signature = Buffer.from(signature, signature_encoding);
            }
            var hasher = crypt.createHash(hashAlgorithm);
            hasher.update(buffer);
            var hash = this.pkcs1pad(hasher.digest(), hashAlgorithm);
            var m = this.key.$doPublic(new BigInteger(signature));
            return m.toBuffer().toString("hex") == hash.toString("hex");
          } else {
            var verifier = crypt.createVerify("RSA-" + hashAlgorithm.toUpperCase());
            verifier.update(buffer);
            return verifier.verify(this.options.rsaUtils.exportKey("public"), signature, signature_encoding);
          }
        };
        Scheme.prototype.pkcs0pad = function(buffer) {
          var filled = Buffer.alloc(this.key.maxMessageLength - buffer.length);
          filled.fill(0);
          return Buffer.concat([filled, buffer]);
        };
        Scheme.prototype.pkcs0unpad = function(buffer) {
          var unPad;
          if (typeof buffer.lastIndexOf == "function") {
            unPad = buffer.slice(buffer.lastIndexOf("\0") + 1, buffer.length);
          } else {
            unPad = buffer.slice(String.prototype.lastIndexOf.call(buffer, "\0") + 1, buffer.length);
          }
          return unPad;
        };
        Scheme.prototype.pkcs1pad = function(hashBuf, hashAlgorithm) {
          var digest = SIGN_INFO_HEAD[hashAlgorithm];
          if (!digest) {
            throw Error("Unsupported hash algorithm");
          }
          var data = Buffer.concat([digest, hashBuf]);
          if (data.length + 10 > this.key.encryptedDataLength) {
            throw Error("Key is too short for signing algorithm (" + hashAlgorithm + ")");
          }
          var filled = Buffer.alloc(this.key.encryptedDataLength - data.length - 1);
          filled.fill(255, 0, filled.length - 1);
          filled[0] = 1;
          filled[filled.length - 1] = 0;
          var res = Buffer.concat([filled, data]);
          return res;
        };
        return new Scheme(key, options);
      };
    });
    var require_oaep = __commonJS2((exports22, module22) => {
      var BigInteger = require_jsbn();
      var crypt = require("crypto");
      module22.exports = {
        isEncryption: true,
        isSignature: false
      };
      module22.exports.digestLength = {
        md4: 16,
        md5: 16,
        ripemd160: 20,
        rmd160: 20,
        sha1: 20,
        sha224: 28,
        sha256: 32,
        sha384: 48,
        sha512: 64
      };
      var DEFAULT_HASH_FUNCTION = "sha1";
      module22.exports.eme_oaep_mgf1 = function(seed, maskLength, hashFunction) {
        hashFunction = hashFunction || DEFAULT_HASH_FUNCTION;
        var hLen = module22.exports.digestLength[hashFunction];
        var count = Math.ceil(maskLength / hLen);
        var T = Buffer.alloc(hLen * count);
        var c = Buffer.alloc(4);
        for (var i = 0; i < count; ++i) {
          var hash = crypt.createHash(hashFunction);
          hash.update(seed);
          c.writeUInt32BE(i, 0);
          hash.update(c);
          hash.digest().copy(T, i * hLen);
        }
        return T.slice(0, maskLength);
      };
      module22.exports.makeScheme = function(key, options) {
        function Scheme(key2, options2) {
          this.key = key2;
          this.options = options2;
        }
        Scheme.prototype.maxMessageLength = function() {
          return this.key.encryptedDataLength - 2 * module22.exports.digestLength[this.options.encryptionSchemeOptions.hash || DEFAULT_HASH_FUNCTION] - 2;
        };
        Scheme.prototype.encPad = function(buffer) {
          var hash = this.options.encryptionSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
          var mgf = this.options.encryptionSchemeOptions.mgf || module22.exports.eme_oaep_mgf1;
          var label = this.options.encryptionSchemeOptions.label || Buffer.alloc(0);
          var emLen = this.key.encryptedDataLength;
          var hLen = module22.exports.digestLength[hash];
          if (buffer.length > emLen - 2 * hLen - 2) {
            throw new Error("Message is too long to encode into an encoded message with a length of " + emLen + " bytes, increaseemLen to fix this error (minimum value for given parameters and options: " + (emLen - 2 * hLen - 2) + ")");
          }
          var lHash = crypt.createHash(hash);
          lHash.update(label);
          lHash = lHash.digest();
          var PS = Buffer.alloc(emLen - buffer.length - 2 * hLen - 1);
          PS.fill(0);
          PS[PS.length - 1] = 1;
          var DB = Buffer.concat([lHash, PS, buffer]);
          var seed = crypt.randomBytes(hLen);
          var mask = mgf(seed, DB.length, hash);
          for (var i = 0; i < DB.length; i++) {
            DB[i] ^= mask[i];
          }
          mask = mgf(DB, hLen, hash);
          for (i = 0; i < seed.length; i++) {
            seed[i] ^= mask[i];
          }
          var em = Buffer.alloc(1 + seed.length + DB.length);
          em[0] = 0;
          seed.copy(em, 1);
          DB.copy(em, 1 + seed.length);
          return em;
        };
        Scheme.prototype.encUnPad = function(buffer) {
          var hash = this.options.encryptionSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
          var mgf = this.options.encryptionSchemeOptions.mgf || module22.exports.eme_oaep_mgf1;
          var label = this.options.encryptionSchemeOptions.label || Buffer.alloc(0);
          var hLen = module22.exports.digestLength[hash];
          if (buffer.length < 2 * hLen + 2) {
            throw new Error("Error decoding message, the supplied message is not long enough to be a valid OAEP encoded message");
          }
          var seed = buffer.slice(1, hLen + 1);
          var DB = buffer.slice(1 + hLen);
          var mask = mgf(DB, hLen, hash);
          for (var i = 0; i < seed.length; i++) {
            seed[i] ^= mask[i];
          }
          mask = mgf(seed, DB.length, hash);
          for (i = 0; i < DB.length; i++) {
            DB[i] ^= mask[i];
          }
          var lHash = crypt.createHash(hash);
          lHash.update(label);
          lHash = lHash.digest();
          var lHashEM = DB.slice(0, hLen);
          if (lHashEM.toString("hex") != lHash.toString("hex")) {
            throw new Error("Error decoding message, the lHash calculated from the label provided and the lHash in the encrypted data do not match.");
          }
          i = hLen;
          while (DB[i++] === 0 && i < DB.length)
            ;
          if (DB[i - 1] != 1) {
            throw new Error("Error decoding message, there is no padding message separator byte");
          }
          return DB.slice(i);
        };
        return new Scheme(key, options);
      };
    });
    var require_pss = __commonJS2((exports22, module22) => {
      var BigInteger = require_jsbn();
      var crypt = require("crypto");
      module22.exports = {
        isEncryption: false,
        isSignature: true
      };
      var DEFAULT_HASH_FUNCTION = "sha1";
      var DEFAULT_SALT_LENGTH = 20;
      module22.exports.makeScheme = function(key, options) {
        var OAEP = require_schemes().pkcs1_oaep;
        function Scheme(key2, options2) {
          this.key = key2;
          this.options = options2;
        }
        Scheme.prototype.sign = function(buffer) {
          var mHash = crypt.createHash(this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION);
          mHash.update(buffer);
          var encoded = this.emsa_pss_encode(mHash.digest(), this.key.keySize - 1);
          return this.key.$doPrivate(new BigInteger(encoded)).toBuffer(this.key.encryptedDataLength);
        };
        Scheme.prototype.verify = function(buffer, signature, signature_encoding) {
          if (signature_encoding) {
            signature = Buffer.from(signature, signature_encoding);
          }
          signature = new BigInteger(signature);
          var emLen = Math.ceil((this.key.keySize - 1) / 8);
          var m = this.key.$doPublic(signature).toBuffer(emLen);
          var mHash = crypt.createHash(this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION);
          mHash.update(buffer);
          return this.emsa_pss_verify(mHash.digest(), m, this.key.keySize - 1);
        };
        Scheme.prototype.emsa_pss_encode = function(mHash, emBits) {
          var hash = this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
          var mgf = this.options.signingSchemeOptions.mgf || OAEP.eme_oaep_mgf1;
          var sLen = this.options.signingSchemeOptions.saltLength || DEFAULT_SALT_LENGTH;
          var hLen = OAEP.digestLength[hash];
          var emLen = Math.ceil(emBits / 8);
          if (emLen < hLen + sLen + 2) {
            throw new Error("Output length passed to emBits(" + emBits + ") is too small for the options specified(" + hash + ", " + sLen + "). To fix this issue increase the value of emBits. (minimum size: " + (8 * hLen + 8 * sLen + 9) + ")");
          }
          var salt = crypt.randomBytes(sLen);
          var Mapostrophe = Buffer.alloc(8 + hLen + sLen);
          Mapostrophe.fill(0, 0, 8);
          mHash.copy(Mapostrophe, 8);
          salt.copy(Mapostrophe, 8 + mHash.length);
          var H = crypt.createHash(hash);
          H.update(Mapostrophe);
          H = H.digest();
          var PS = Buffer.alloc(emLen - salt.length - hLen - 2);
          PS.fill(0);
          var DB = Buffer.alloc(PS.length + 1 + salt.length);
          PS.copy(DB);
          DB[PS.length] = 1;
          salt.copy(DB, PS.length + 1);
          var dbMask = mgf(H, DB.length, hash);
          var maskedDB = Buffer.alloc(DB.length);
          for (var i = 0; i < dbMask.length; i++) {
            maskedDB[i] = DB[i] ^ dbMask[i];
          }
          var bits = 8 * emLen - emBits;
          var mask = 255 ^ 255 >> 8 - bits << 8 - bits;
          maskedDB[0] = maskedDB[0] & mask;
          var EM = Buffer.alloc(maskedDB.length + H.length + 1);
          maskedDB.copy(EM, 0);
          H.copy(EM, maskedDB.length);
          EM[EM.length - 1] = 188;
          return EM;
        };
        Scheme.prototype.emsa_pss_verify = function(mHash, EM, emBits) {
          var hash = this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
          var mgf = this.options.signingSchemeOptions.mgf || OAEP.eme_oaep_mgf1;
          var sLen = this.options.signingSchemeOptions.saltLength || DEFAULT_SALT_LENGTH;
          var hLen = OAEP.digestLength[hash];
          var emLen = Math.ceil(emBits / 8);
          if (emLen < hLen + sLen + 2 || EM[EM.length - 1] != 188) {
            return false;
          }
          var DB = Buffer.alloc(emLen - hLen - 1);
          EM.copy(DB, 0, 0, emLen - hLen - 1);
          var mask = 0;
          for (var i = 0, bits = 8 * emLen - emBits; i < bits; i++) {
            mask |= 1 << 7 - i;
          }
          if ((DB[0] & mask) !== 0) {
            return false;
          }
          var H = EM.slice(emLen - hLen - 1, emLen - 1);
          var dbMask = mgf(H, DB.length, hash);
          for (i = 0; i < DB.length; i++) {
            DB[i] ^= dbMask[i];
          }
          bits = 8 * emLen - emBits;
          mask = 255 ^ 255 >> 8 - bits << 8 - bits;
          DB[0] = DB[0] & mask;
          for (i = 0; DB[i] === 0 && i < DB.length; i++)
            ;
          if (DB[i] != 1) {
            return false;
          }
          var salt = DB.slice(DB.length - sLen);
          var Mapostrophe = Buffer.alloc(8 + hLen + sLen);
          Mapostrophe.fill(0, 0, 8);
          mHash.copy(Mapostrophe, 8);
          salt.copy(Mapostrophe, 8 + mHash.length);
          var Hapostrophe = crypt.createHash(hash);
          Hapostrophe.update(Mapostrophe);
          Hapostrophe = Hapostrophe.digest();
          return H.toString("hex") === Hapostrophe.toString("hex");
        };
        return new Scheme(key, options);
      };
    });
    var require_schemes = __commonJS2((exports22, module22) => {
      module22.exports = {
        pkcs1: require_pkcs1(),
        pkcs1_oaep: require_oaep(),
        pss: require_pss(),
        isEncryption: function(scheme) {
          return module22.exports[scheme] && module22.exports[scheme].isEncryption;
        },
        isSignature: function(scheme) {
          return module22.exports[scheme] && module22.exports[scheme].isSignature;
        }
      };
    });
    var require_js = __commonJS2((exports22, module22) => {
      var BigInteger = require_jsbn();
      var schemes = require_schemes();
      module22.exports = function(keyPair, options) {
        var pkcs1Scheme = schemes.pkcs1.makeScheme(keyPair, options);
        return {
          encrypt: function(buffer, usePrivate) {
            var m, c;
            if (usePrivate) {
              m = new BigInteger(pkcs1Scheme.encPad(buffer, { type: 1 }));
              c = keyPair.$doPrivate(m);
            } else {
              m = new BigInteger(keyPair.encryptionScheme.encPad(buffer));
              c = keyPair.$doPublic(m);
            }
            return c.toBuffer(keyPair.encryptedDataLength);
          },
          decrypt: function(buffer, usePublic) {
            var m, c = new BigInteger(buffer);
            if (usePublic) {
              m = keyPair.$doPublic(c);
              return pkcs1Scheme.encUnPad(m.toBuffer(keyPair.encryptedDataLength), { type: 1 });
            } else {
              m = keyPair.$doPrivate(c);
              return keyPair.encryptionScheme.encUnPad(m.toBuffer(keyPair.encryptedDataLength));
            }
          }
        };
      };
    });
    var require_io = __commonJS2((exports22, module22) => {
      var crypto = require("crypto");
      var constants2 = require("constants");
      var schemes = require_schemes();
      module22.exports = function(keyPair, options) {
        var pkcs1Scheme = schemes.pkcs1.makeScheme(keyPair, options);
        return {
          encrypt: function(buffer, usePrivate) {
            var padding;
            if (usePrivate) {
              padding = constants2.RSA_PKCS1_PADDING;
              if (options.encryptionSchemeOptions && options.encryptionSchemeOptions.padding) {
                padding = options.encryptionSchemeOptions.padding;
              }
              return crypto.privateEncrypt({
                key: options.rsaUtils.exportKey("private"),
                padding
              }, buffer);
            } else {
              padding = constants2.RSA_PKCS1_OAEP_PADDING;
              if (options.encryptionScheme === "pkcs1") {
                padding = constants2.RSA_PKCS1_PADDING;
              }
              if (options.encryptionSchemeOptions && options.encryptionSchemeOptions.padding) {
                padding = options.encryptionSchemeOptions.padding;
              }
              var data = buffer;
              if (padding === constants2.RSA_NO_PADDING) {
                data = pkcs1Scheme.pkcs0pad(buffer);
              }
              return crypto.publicEncrypt({
                key: options.rsaUtils.exportKey("public"),
                padding
              }, data);
            }
          },
          decrypt: function(buffer, usePublic) {
            var padding;
            if (usePublic) {
              padding = constants2.RSA_PKCS1_PADDING;
              if (options.encryptionSchemeOptions && options.encryptionSchemeOptions.padding) {
                padding = options.encryptionSchemeOptions.padding;
              }
              return crypto.publicDecrypt({
                key: options.rsaUtils.exportKey("public"),
                padding
              }, buffer);
            } else {
              padding = constants2.RSA_PKCS1_OAEP_PADDING;
              if (options.encryptionScheme === "pkcs1") {
                padding = constants2.RSA_PKCS1_PADDING;
              }
              if (options.encryptionSchemeOptions && options.encryptionSchemeOptions.padding) {
                padding = options.encryptionSchemeOptions.padding;
              }
              var res = crypto.privateDecrypt({
                key: options.rsaUtils.exportKey("private"),
                padding
              }, buffer);
              if (padding === constants2.RSA_NO_PADDING) {
                return pkcs1Scheme.pkcs0unpad(res);
              }
              return res;
            }
          }
        };
      };
    });
    var require_node12 = __commonJS2((exports22, module22) => {
      var crypto = require("crypto");
      var constants2 = require("constants");
      var schemes = require_schemes();
      module22.exports = function(keyPair, options) {
        var jsEngine = require_js()(keyPair, options);
        var pkcs1Scheme = schemes.pkcs1.makeScheme(keyPair, options);
        return {
          encrypt: function(buffer, usePrivate) {
            if (usePrivate) {
              return jsEngine.encrypt(buffer, usePrivate);
            }
            var padding = constants2.RSA_PKCS1_OAEP_PADDING;
            if (options.encryptionScheme === "pkcs1") {
              padding = constants2.RSA_PKCS1_PADDING;
            }
            if (options.encryptionSchemeOptions && options.encryptionSchemeOptions.padding) {
              padding = options.encryptionSchemeOptions.padding;
            }
            var data = buffer;
            if (padding === constants2.RSA_NO_PADDING) {
              data = pkcs1Scheme.pkcs0pad(buffer);
            }
            return crypto.publicEncrypt({
              key: options.rsaUtils.exportKey("public"),
              padding
            }, data);
          },
          decrypt: function(buffer, usePublic) {
            if (usePublic) {
              return jsEngine.decrypt(buffer, usePublic);
            }
            var padding = constants2.RSA_PKCS1_OAEP_PADDING;
            if (options.encryptionScheme === "pkcs1") {
              padding = constants2.RSA_PKCS1_PADDING;
            }
            if (options.encryptionSchemeOptions && options.encryptionSchemeOptions.padding) {
              padding = options.encryptionSchemeOptions.padding;
            }
            var res = crypto.privateDecrypt({
              key: options.rsaUtils.exportKey("private"),
              padding
            }, buffer);
            if (padding === constants2.RSA_NO_PADDING) {
              return pkcs1Scheme.pkcs0unpad(res);
            }
            return res;
          }
        };
      };
    });
    var require_encryptEngines = __commonJS2((exports22, module22) => {
      var crypt = require("crypto");
      module22.exports = {
        getEngine: function(keyPair, options) {
          var engine = require_js();
          if (options.environment === "node") {
            if (typeof crypt.publicEncrypt === "function" && typeof crypt.privateDecrypt === "function") {
              if (typeof crypt.privateEncrypt === "function" && typeof crypt.publicDecrypt === "function") {
                engine = require_io();
              } else {
                engine = require_node12();
              }
            }
          }
          return engine(keyPair, options);
        }
      };
    });
    var require_rsa = __commonJS2((exports22, module22) => {
      var _ = require_utils4()._;
      var crypt = require("crypto");
      var BigInteger = require_jsbn();
      var utils = require_utils4();
      var schemes = require_schemes();
      var encryptEngines = require_encryptEngines();
      exports22.BigInteger = BigInteger;
      module22.exports.Key = function() {
        function RSAKey() {
          this.n = null;
          this.e = 0;
          this.d = null;
          this.p = null;
          this.q = null;
          this.dmp1 = null;
          this.dmq1 = null;
          this.coeff = null;
        }
        RSAKey.prototype.setOptions = function(options) {
          var signingSchemeProvider = schemes[options.signingScheme];
          var encryptionSchemeProvider = schemes[options.encryptionScheme];
          if (signingSchemeProvider === encryptionSchemeProvider) {
            this.signingScheme = this.encryptionScheme = encryptionSchemeProvider.makeScheme(this, options);
          } else {
            this.encryptionScheme = encryptionSchemeProvider.makeScheme(this, options);
            this.signingScheme = signingSchemeProvider.makeScheme(this, options);
          }
          this.encryptEngine = encryptEngines.getEngine(this, options);
        };
        RSAKey.prototype.generate = function(B, E) {
          var qs = B >> 1;
          this.e = parseInt(E, 16);
          var ee = new BigInteger(E, 16);
          while (true) {
            while (true) {
              this.p = new BigInteger(B - qs, 1);
              if (this.p.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) === 0 && this.p.isProbablePrime(10))
                break;
            }
            while (true) {
              this.q = new BigInteger(qs, 1);
              if (this.q.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) === 0 && this.q.isProbablePrime(10))
                break;
            }
            if (this.p.compareTo(this.q) <= 0) {
              var t = this.p;
              this.p = this.q;
              this.q = t;
            }
            var p1 = this.p.subtract(BigInteger.ONE);
            var q1 = this.q.subtract(BigInteger.ONE);
            var phi = p1.multiply(q1);
            if (phi.gcd(ee).compareTo(BigInteger.ONE) === 0) {
              this.n = this.p.multiply(this.q);
              if (this.n.bitLength() < B) {
                continue;
              }
              this.d = ee.modInverse(phi);
              this.dmp1 = this.d.mod(p1);
              this.dmq1 = this.d.mod(q1);
              this.coeff = this.q.modInverse(this.p);
              break;
            }
          }
          this.$$recalculateCache();
        };
        RSAKey.prototype.setPrivate = function(N, E, D, P, Q, DP, DQ, C) {
          if (N && E && D && N.length > 0 && (_.isNumber(E) || E.length > 0) && D.length > 0) {
            this.n = new BigInteger(N);
            this.e = _.isNumber(E) ? E : utils.get32IntFromBuffer(E, 0);
            this.d = new BigInteger(D);
            if (P && Q && DP && DQ && C) {
              this.p = new BigInteger(P);
              this.q = new BigInteger(Q);
              this.dmp1 = new BigInteger(DP);
              this.dmq1 = new BigInteger(DQ);
              this.coeff = new BigInteger(C);
            } else {
            }
            this.$$recalculateCache();
          } else {
            throw Error("Invalid RSA private key");
          }
        };
        RSAKey.prototype.setPublic = function(N, E) {
          if (N && E && N.length > 0 && (_.isNumber(E) || E.length > 0)) {
            this.n = new BigInteger(N);
            this.e = _.isNumber(E) ? E : utils.get32IntFromBuffer(E, 0);
            this.$$recalculateCache();
          } else {
            throw Error("Invalid RSA public key");
          }
        };
        RSAKey.prototype.$doPrivate = function(x) {
          if (this.p || this.q) {
            return x.modPow(this.d, this.n);
          }
          var xp = x.mod(this.p).modPow(this.dmp1, this.p);
          var xq = x.mod(this.q).modPow(this.dmq1, this.q);
          while (xp.compareTo(xq) < 0) {
            xp = xp.add(this.p);
          }
          return xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq);
        };
        RSAKey.prototype.$doPublic = function(x) {
          return x.modPowInt(this.e, this.n);
        };
        RSAKey.prototype.encrypt = function(buffer, usePrivate) {
          var buffers = [];
          var results = [];
          var bufferSize = buffer.length;
          var buffersCount = Math.ceil(bufferSize / this.maxMessageLength) || 1;
          var dividedSize = Math.ceil(bufferSize / buffersCount || 1);
          if (buffersCount == 1) {
            buffers.push(buffer);
          } else {
            for (var bufNum = 0; bufNum < buffersCount; bufNum++) {
              buffers.push(buffer.slice(bufNum * dividedSize, (bufNum + 1) * dividedSize));
            }
          }
          for (var i = 0; i < buffers.length; i++) {
            results.push(this.encryptEngine.encrypt(buffers[i], usePrivate));
          }
          return Buffer.concat(results);
        };
        RSAKey.prototype.decrypt = function(buffer, usePublic) {
          if (buffer.length % this.encryptedDataLength > 0) {
            throw Error("Incorrect data or key");
          }
          var result = [];
          var offset = 0;
          var length = 0;
          var buffersCount = buffer.length / this.encryptedDataLength;
          for (var i = 0; i < buffersCount; i++) {
            offset = i * this.encryptedDataLength;
            length = offset + this.encryptedDataLength;
            result.push(this.encryptEngine.decrypt(buffer.slice(offset, Math.min(length, buffer.length)), usePublic));
          }
          return Buffer.concat(result);
        };
        RSAKey.prototype.sign = function(buffer) {
          return this.signingScheme.sign.apply(this.signingScheme, arguments);
        };
        RSAKey.prototype.verify = function(buffer, signature, signature_encoding) {
          return this.signingScheme.verify.apply(this.signingScheme, arguments);
        };
        RSAKey.prototype.isPrivate = function() {
          return this.n && this.e && this.d && true || false;
        };
        RSAKey.prototype.isPublic = function(strict) {
          return this.n && this.e && !(strict && this.d) || false;
        };
        Object.defineProperty(RSAKey.prototype, "keySize", {
          get: function() {
            return this.cache.keyBitLength;
          }
        });
        Object.defineProperty(RSAKey.prototype, "encryptedDataLength", {
          get: function() {
            return this.cache.keyByteLength;
          }
        });
        Object.defineProperty(RSAKey.prototype, "maxMessageLength", {
          get: function() {
            return this.encryptionScheme.maxMessageLength();
          }
        });
        RSAKey.prototype.$$recalculateCache = function() {
          this.cache = this.cache || {};
          this.cache.keyBitLength = this.n.bitLength();
          this.cache.keyByteLength = this.cache.keyBitLength + 6 >> 3;
        };
        return RSAKey;
      }();
    });
    var require_errors = __commonJS2((exports22, module22) => {
      module22.exports = {
        newInvalidAsn1Error: function(msg) {
          var e = new Error();
          e.name = "InvalidAsn1Error";
          e.message = msg || "";
          return e;
        }
      };
    });
    var require_types = __commonJS2((exports22, module22) => {
      module22.exports = {
        EOC: 0,
        Boolean: 1,
        Integer: 2,
        BitString: 3,
        OctetString: 4,
        Null: 5,
        OID: 6,
        ObjectDescriptor: 7,
        External: 8,
        Real: 9,
        Enumeration: 10,
        PDV: 11,
        Utf8String: 12,
        RelativeOID: 13,
        Sequence: 16,
        Set: 17,
        NumericString: 18,
        PrintableString: 19,
        T61String: 20,
        VideotexString: 21,
        IA5String: 22,
        UTCTime: 23,
        GeneralizedTime: 24,
        GraphicString: 25,
        VisibleString: 26,
        GeneralString: 28,
        UniversalString: 29,
        CharacterString: 30,
        BMPString: 31,
        Constructor: 32,
        Context: 128
      };
    });
    var require_safer = __commonJS2((exports22, module22) => {
      "use strict";
      var buffer = require("buffer");
      var Buffer2 = buffer.Buffer;
      var safer = {};
      var key;
      for (key in buffer) {
        if (!buffer.hasOwnProperty(key))
          continue;
        if (key === "SlowBuffer" || key === "Buffer")
          continue;
        safer[key] = buffer[key];
      }
      var Safer = safer.Buffer = {};
      for (key in Buffer2) {
        if (!Buffer2.hasOwnProperty(key))
          continue;
        if (key === "allocUnsafe" || key === "allocUnsafeSlow")
          continue;
        Safer[key] = Buffer2[key];
      }
      safer.Buffer.prototype = Buffer2.prototype;
      if (!Safer.from || Safer.from === Uint8Array.from) {
        Safer.from = function(value, encodingOrOffset, length) {
          if (typeof value === "number") {
            throw new TypeError('The "value" argument must not be of type number. Received type ' + typeof value);
          }
          if (value && typeof value.length === "undefined") {
            throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
          }
          return Buffer2(value, encodingOrOffset, length);
        };
      }
      if (!Safer.alloc) {
        Safer.alloc = function(size, fill, encoding) {
          if (typeof size !== "number") {
            throw new TypeError('The "size" argument must be of type number. Received type ' + typeof size);
          }
          if (size < 0 || size >= 2 * (1 << 30)) {
            throw new RangeError('The value "' + size + '" is invalid for option "size"');
          }
          var buf = Buffer2(size);
          if (!fill || fill.length === 0) {
            buf.fill(0);
          } else if (typeof encoding === "string") {
            buf.fill(fill, encoding);
          } else {
            buf.fill(fill);
          }
          return buf;
        };
      }
      if (!safer.kStringMaxLength) {
        try {
          safer.kStringMaxLength = process.binding("buffer").kStringMaxLength;
        } catch (e) {
        }
      }
      if (!safer.constants) {
        safer.constants = {
          MAX_LENGTH: safer.kMaxLength
        };
        if (safer.kStringMaxLength) {
          safer.constants.MAX_STRING_LENGTH = safer.kStringMaxLength;
        }
      }
      module22.exports = safer;
    });
    var require_reader = __commonJS2((exports22, module22) => {
      var assert = require("assert");
      var Buffer2 = require_safer().Buffer;
      var ASN1 = require_types();
      var errors = require_errors();
      var newInvalidAsn1Error = errors.newInvalidAsn1Error;
      function Reader(data) {
        if (!data || !Buffer2.isBuffer(data))
          throw new TypeError("data must be a node Buffer");
        this._buf = data;
        this._size = data.length;
        this._len = 0;
        this._offset = 0;
      }
      Object.defineProperty(Reader.prototype, "length", {
        enumerable: true,
        get: function() {
          return this._len;
        }
      });
      Object.defineProperty(Reader.prototype, "offset", {
        enumerable: true,
        get: function() {
          return this._offset;
        }
      });
      Object.defineProperty(Reader.prototype, "remain", {
        get: function() {
          return this._size - this._offset;
        }
      });
      Object.defineProperty(Reader.prototype, "buffer", {
        get: function() {
          return this._buf.slice(this._offset);
        }
      });
      Reader.prototype.readByte = function(peek) {
        if (this._size - this._offset < 1)
          return null;
        var b = this._buf[this._offset] & 255;
        if (!peek)
          this._offset += 1;
        return b;
      };
      Reader.prototype.peek = function() {
        return this.readByte(true);
      };
      Reader.prototype.readLength = function(offset) {
        if (offset === void 0)
          offset = this._offset;
        if (offset >= this._size)
          return null;
        var lenB = this._buf[offset++] & 255;
        if (lenB === null)
          return null;
        if ((lenB & 128) === 128) {
          lenB &= 127;
          if (lenB === 0)
            throw newInvalidAsn1Error("Indefinite length not supported");
          if (lenB > 4)
            throw newInvalidAsn1Error("encoding too long");
          if (this._size - offset < lenB)
            return null;
          this._len = 0;
          for (var i = 0; i < lenB; i++)
            this._len = (this._len << 8) + (this._buf[offset++] & 255);
        } else {
          this._len = lenB;
        }
        return offset;
      };
      Reader.prototype.readSequence = function(tag) {
        var seq = this.peek();
        if (seq === null)
          return null;
        if (tag !== void 0 && tag !== seq)
          throw newInvalidAsn1Error("Expected 0x" + tag.toString(16) + ": got 0x" + seq.toString(16));
        var o = this.readLength(this._offset + 1);
        if (o === null)
          return null;
        this._offset = o;
        return seq;
      };
      Reader.prototype.readInt = function() {
        return this._readTag(ASN1.Integer);
      };
      Reader.prototype.readBoolean = function() {
        return this._readTag(ASN1.Boolean) === 0 ? false : true;
      };
      Reader.prototype.readEnumeration = function() {
        return this._readTag(ASN1.Enumeration);
      };
      Reader.prototype.readString = function(tag, retbuf) {
        if (!tag)
          tag = ASN1.OctetString;
        var b = this.peek();
        if (b === null)
          return null;
        if (b !== tag)
          throw newInvalidAsn1Error("Expected 0x" + tag.toString(16) + ": got 0x" + b.toString(16));
        var o = this.readLength(this._offset + 1);
        if (o === null)
          return null;
        if (this.length > this._size - o)
          return null;
        this._offset = o;
        if (this.length === 0)
          return retbuf ? Buffer2.alloc(0) : "";
        var str = this._buf.slice(this._offset, this._offset + this.length);
        this._offset += this.length;
        return retbuf ? str : str.toString("utf8");
      };
      Reader.prototype.readOID = function(tag) {
        if (!tag)
          tag = ASN1.OID;
        var b = this.readString(tag, true);
        if (b === null)
          return null;
        var values = [];
        var value = 0;
        for (var i = 0; i < b.length; i++) {
          var byte = b[i] & 255;
          value <<= 7;
          value += byte & 127;
          if ((byte & 128) === 0) {
            values.push(value);
            value = 0;
          }
        }
        value = values.shift();
        values.unshift(value % 40);
        values.unshift(value / 40 >> 0);
        return values.join(".");
      };
      Reader.prototype._readTag = function(tag) {
        assert.ok(tag !== void 0);
        var b = this.peek();
        if (b === null)
          return null;
        if (b !== tag)
          throw newInvalidAsn1Error("Expected 0x" + tag.toString(16) + ": got 0x" + b.toString(16));
        var o = this.readLength(this._offset + 1);
        if (o === null)
          return null;
        if (this.length > 4)
          throw newInvalidAsn1Error("Integer too long: " + this.length);
        if (this.length > this._size - o)
          return null;
        this._offset = o;
        var fb = this._buf[this._offset];
        var value = 0;
        for (var i = 0; i < this.length; i++) {
          value <<= 8;
          value |= this._buf[this._offset++] & 255;
        }
        if ((fb & 128) === 128 && i !== 4)
          value -= 1 << i * 8;
        return value >> 0;
      };
      module22.exports = Reader;
    });
    var require_writer = __commonJS2((exports22, module22) => {
      var assert = require("assert");
      var Buffer2 = require_safer().Buffer;
      var ASN1 = require_types();
      var errors = require_errors();
      var newInvalidAsn1Error = errors.newInvalidAsn1Error;
      var DEFAULT_OPTS = {
        size: 1024,
        growthFactor: 8
      };
      function merge(from, to) {
        assert.ok(from);
        assert.equal(typeof from, "object");
        assert.ok(to);
        assert.equal(typeof to, "object");
        var keys = Object.getOwnPropertyNames(from);
        keys.forEach(function(key) {
          if (to[key])
            return;
          var value = Object.getOwnPropertyDescriptor(from, key);
          Object.defineProperty(to, key, value);
        });
        return to;
      }
      function Writer(options) {
        options = merge(DEFAULT_OPTS, options || {});
        this._buf = Buffer2.alloc(options.size || 1024);
        this._size = this._buf.length;
        this._offset = 0;
        this._options = options;
        this._seq = [];
      }
      Object.defineProperty(Writer.prototype, "buffer", {
        get: function() {
          if (this._seq.length)
            throw newInvalidAsn1Error(this._seq.length + " unended sequence(s)");
          return this._buf.slice(0, this._offset);
        }
      });
      Writer.prototype.writeByte = function(b) {
        if (typeof b !== "number")
          throw new TypeError("argument must be a Number");
        this._ensure(1);
        this._buf[this._offset++] = b;
      };
      Writer.prototype.writeInt = function(i, tag) {
        if (typeof i !== "number")
          throw new TypeError("argument must be a Number");
        if (typeof tag !== "number")
          tag = ASN1.Integer;
        var sz = 4;
        while (((i & 4286578688) === 0 || (i & 4286578688) === 4286578688 >> 0) && sz > 1) {
          sz--;
          i <<= 8;
        }
        if (sz > 4)
          throw newInvalidAsn1Error("BER ints cannot be > 0xffffffff");
        this._ensure(2 + sz);
        this._buf[this._offset++] = tag;
        this._buf[this._offset++] = sz;
        while (sz-- > 0) {
          this._buf[this._offset++] = (i & 4278190080) >>> 24;
          i <<= 8;
        }
      };
      Writer.prototype.writeNull = function() {
        this.writeByte(ASN1.Null);
        this.writeByte(0);
      };
      Writer.prototype.writeEnumeration = function(i, tag) {
        if (typeof i !== "number")
          throw new TypeError("argument must be a Number");
        if (typeof tag !== "number")
          tag = ASN1.Enumeration;
        return this.writeInt(i, tag);
      };
      Writer.prototype.writeBoolean = function(b, tag) {
        if (typeof b !== "boolean")
          throw new TypeError("argument must be a Boolean");
        if (typeof tag !== "number")
          tag = ASN1.Boolean;
        this._ensure(3);
        this._buf[this._offset++] = tag;
        this._buf[this._offset++] = 1;
        this._buf[this._offset++] = b ? 255 : 0;
      };
      Writer.prototype.writeString = function(s, tag) {
        if (typeof s !== "string")
          throw new TypeError("argument must be a string (was: " + typeof s + ")");
        if (typeof tag !== "number")
          tag = ASN1.OctetString;
        var len = Buffer2.byteLength(s);
        this.writeByte(tag);
        this.writeLength(len);
        if (len) {
          this._ensure(len);
          this._buf.write(s, this._offset);
          this._offset += len;
        }
      };
      Writer.prototype.writeBuffer = function(buf, tag) {
        if (typeof tag !== "number")
          throw new TypeError("tag must be a number");
        if (!Buffer2.isBuffer(buf))
          throw new TypeError("argument must be a buffer");
        this.writeByte(tag);
        this.writeLength(buf.length);
        this._ensure(buf.length);
        buf.copy(this._buf, this._offset, 0, buf.length);
        this._offset += buf.length;
      };
      Writer.prototype.writeStringArray = function(strings) {
        if (!strings instanceof Array)
          throw new TypeError("argument must be an Array[String]");
        var self = this;
        strings.forEach(function(s) {
          self.writeString(s);
        });
      };
      Writer.prototype.writeOID = function(s, tag) {
        if (typeof s !== "string")
          throw new TypeError("argument must be a string");
        if (typeof tag !== "number")
          tag = ASN1.OID;
        if (!/^([0-9]+\.){3,}[0-9]+$/.test(s))
          throw new Error("argument is not a valid OID string");
        function encodeOctet(bytes2, octet) {
          if (octet < 128) {
            bytes2.push(octet);
          } else if (octet < 16384) {
            bytes2.push(octet >>> 7 | 128);
            bytes2.push(octet & 127);
          } else if (octet < 2097152) {
            bytes2.push(octet >>> 14 | 128);
            bytes2.push((octet >>> 7 | 128) & 255);
            bytes2.push(octet & 127);
          } else if (octet < 268435456) {
            bytes2.push(octet >>> 21 | 128);
            bytes2.push((octet >>> 14 | 128) & 255);
            bytes2.push((octet >>> 7 | 128) & 255);
            bytes2.push(octet & 127);
          } else {
            bytes2.push((octet >>> 28 | 128) & 255);
            bytes2.push((octet >>> 21 | 128) & 255);
            bytes2.push((octet >>> 14 | 128) & 255);
            bytes2.push((octet >>> 7 | 128) & 255);
            bytes2.push(octet & 127);
          }
        }
        var tmp = s.split(".");
        var bytes = [];
        bytes.push(parseInt(tmp[0], 10) * 40 + parseInt(tmp[1], 10));
        tmp.slice(2).forEach(function(b) {
          encodeOctet(bytes, parseInt(b, 10));
        });
        var self = this;
        this._ensure(2 + bytes.length);
        this.writeByte(tag);
        this.writeLength(bytes.length);
        bytes.forEach(function(b) {
          self.writeByte(b);
        });
      };
      Writer.prototype.writeLength = function(len) {
        if (typeof len !== "number")
          throw new TypeError("argument must be a Number");
        this._ensure(4);
        if (len <= 127) {
          this._buf[this._offset++] = len;
        } else if (len <= 255) {
          this._buf[this._offset++] = 129;
          this._buf[this._offset++] = len;
        } else if (len <= 65535) {
          this._buf[this._offset++] = 130;
          this._buf[this._offset++] = len >> 8;
          this._buf[this._offset++] = len;
        } else if (len <= 16777215) {
          this._buf[this._offset++] = 131;
          this._buf[this._offset++] = len >> 16;
          this._buf[this._offset++] = len >> 8;
          this._buf[this._offset++] = len;
        } else {
          throw newInvalidAsn1Error("Length too long (> 4 bytes)");
        }
      };
      Writer.prototype.startSequence = function(tag) {
        if (typeof tag !== "number")
          tag = ASN1.Sequence | ASN1.Constructor;
        this.writeByte(tag);
        this._seq.push(this._offset);
        this._ensure(3);
        this._offset += 3;
      };
      Writer.prototype.endSequence = function() {
        var seq = this._seq.pop();
        var start = seq + 3;
        var len = this._offset - start;
        if (len <= 127) {
          this._shift(start, len, -2);
          this._buf[seq] = len;
        } else if (len <= 255) {
          this._shift(start, len, -1);
          this._buf[seq] = 129;
          this._buf[seq + 1] = len;
        } else if (len <= 65535) {
          this._buf[seq] = 130;
          this._buf[seq + 1] = len >> 8;
          this._buf[seq + 2] = len;
        } else if (len <= 16777215) {
          this._shift(start, len, 1);
          this._buf[seq] = 131;
          this._buf[seq + 1] = len >> 16;
          this._buf[seq + 2] = len >> 8;
          this._buf[seq + 3] = len;
        } else {
          throw newInvalidAsn1Error("Sequence too long");
        }
      };
      Writer.prototype._shift = function(start, len, shift) {
        assert.ok(start !== void 0);
        assert.ok(len !== void 0);
        assert.ok(shift);
        this._buf.copy(this._buf, start + shift, start, start + len);
        this._offset += shift;
      };
      Writer.prototype._ensure = function(len) {
        assert.ok(len);
        if (this._size - this._offset < len) {
          var sz = this._size * this._options.growthFactor;
          if (sz - this._offset < len)
            sz += len;
          var buf = Buffer2.alloc(sz);
          this._buf.copy(buf, 0, 0, this._offset);
          this._buf = buf;
          this._size = sz;
        }
      };
      module22.exports = Writer;
    });
    var require_ber = __commonJS2((exports22, module22) => {
      var errors = require_errors();
      var types = require_types();
      var Reader = require_reader();
      var Writer = require_writer();
      module22.exports = {
        Reader,
        Writer
      };
      for (var t in types) {
        if (types.hasOwnProperty(t))
          module22.exports[t] = types[t];
      }
      for (var e in errors) {
        if (errors.hasOwnProperty(e))
          module22.exports[e] = errors[e];
      }
    });
    var require_lib22 = __commonJS2((exports22, module22) => {
      var Ber = require_ber();
      module22.exports = {
        Ber,
        BerReader: Ber.Reader,
        BerWriter: Ber.Writer
      };
    });
    var require_pkcs12 = __commonJS2((exports22, module22) => {
      var ber = require_lib22().Ber;
      var _ = require_utils4()._;
      var utils = require_utils4();
      var PRIVATE_OPENING_BOUNDARY = "-----BEGIN RSA PRIVATE KEY-----";
      var PRIVATE_CLOSING_BOUNDARY = "-----END RSA PRIVATE KEY-----";
      var PUBLIC_OPENING_BOUNDARY = "-----BEGIN RSA PUBLIC KEY-----";
      var PUBLIC_CLOSING_BOUNDARY = "-----END RSA PUBLIC KEY-----";
      module22.exports = {
        privateExport: function(key, options) {
          options = options || {};
          var n = key.n.toBuffer();
          var d = key.d.toBuffer();
          var p = key.p.toBuffer();
          var q = key.q.toBuffer();
          var dmp1 = key.dmp1.toBuffer();
          var dmq1 = key.dmq1.toBuffer();
          var coeff = key.coeff.toBuffer();
          var length = n.length + d.length + p.length + q.length + dmp1.length + dmq1.length + coeff.length + 512;
          var writer = new ber.Writer({ size: length });
          writer.startSequence();
          writer.writeInt(0);
          writer.writeBuffer(n, 2);
          writer.writeInt(key.e);
          writer.writeBuffer(d, 2);
          writer.writeBuffer(p, 2);
          writer.writeBuffer(q, 2);
          writer.writeBuffer(dmp1, 2);
          writer.writeBuffer(dmq1, 2);
          writer.writeBuffer(coeff, 2);
          writer.endSequence();
          if (options.type === "der") {
            return writer.buffer;
          } else {
            return PRIVATE_OPENING_BOUNDARY + "\n" + utils.linebrk(writer.buffer.toString("base64"), 64) + "\n" + PRIVATE_CLOSING_BOUNDARY;
          }
        },
        privateImport: function(key, data, options) {
          options = options || {};
          var buffer;
          if (options.type !== "der") {
            if (Buffer.isBuffer(data)) {
              data = data.toString("utf8");
            }
            if (_.isString(data)) {
              var pem = utils.trimSurroundingText(data, PRIVATE_OPENING_BOUNDARY, PRIVATE_CLOSING_BOUNDARY).replace(/\s+|\n\r|\n|\r$/gm, "");
              buffer = Buffer.from(pem, "base64");
            } else {
              throw Error("Unsupported key format");
            }
          } else if (Buffer.isBuffer(data)) {
            buffer = data;
          } else {
            throw Error("Unsupported key format");
          }
          var reader = new ber.Reader(buffer);
          reader.readSequence();
          reader.readString(2, true);
          key.setPrivate(reader.readString(2, true), reader.readString(2, true), reader.readString(2, true), reader.readString(2, true), reader.readString(2, true), reader.readString(2, true), reader.readString(2, true), reader.readString(2, true));
        },
        publicExport: function(key, options) {
          options = options || {};
          var n = key.n.toBuffer();
          var length = n.length + 512;
          var bodyWriter = new ber.Writer({ size: length });
          bodyWriter.startSequence();
          bodyWriter.writeBuffer(n, 2);
          bodyWriter.writeInt(key.e);
          bodyWriter.endSequence();
          if (options.type === "der") {
            return bodyWriter.buffer;
          } else {
            return PUBLIC_OPENING_BOUNDARY + "\n" + utils.linebrk(bodyWriter.buffer.toString("base64"), 64) + "\n" + PUBLIC_CLOSING_BOUNDARY;
          }
        },
        publicImport: function(key, data, options) {
          options = options || {};
          var buffer;
          if (options.type !== "der") {
            if (Buffer.isBuffer(data)) {
              data = data.toString("utf8");
            }
            if (_.isString(data)) {
              var pem = utils.trimSurroundingText(data, PUBLIC_OPENING_BOUNDARY, PUBLIC_CLOSING_BOUNDARY).replace(/\s+|\n\r|\n|\r$/gm, "");
              buffer = Buffer.from(pem, "base64");
            }
          } else if (Buffer.isBuffer(data)) {
            buffer = data;
          } else {
            throw Error("Unsupported key format");
          }
          var body = new ber.Reader(buffer);
          body.readSequence();
          key.setPublic(body.readString(2, true), body.readString(2, true));
        },
        autoImport: function(key, data) {
          if (/^[\S\s]*-----BEGIN RSA PRIVATE KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END RSA PRIVATE KEY-----[\S\s]*$/g.test(data)) {
            module22.exports.privateImport(key, data);
            return true;
          }
          if (/^[\S\s]*-----BEGIN RSA PUBLIC KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END RSA PUBLIC KEY-----[\S\s]*$/g.test(data)) {
            module22.exports.publicImport(key, data);
            return true;
          }
          return false;
        }
      };
    });
    var require_pkcs8 = __commonJS2((exports22, module22) => {
      var ber = require_lib22().Ber;
      var _ = require_utils4()._;
      var PUBLIC_RSA_OID = "1.2.840.113549.1.1.1";
      var utils = require_utils4();
      var PRIVATE_OPENING_BOUNDARY = "-----BEGIN PRIVATE KEY-----";
      var PRIVATE_CLOSING_BOUNDARY = "-----END PRIVATE KEY-----";
      var PUBLIC_OPENING_BOUNDARY = "-----BEGIN PUBLIC KEY-----";
      var PUBLIC_CLOSING_BOUNDARY = "-----END PUBLIC KEY-----";
      module22.exports = {
        privateExport: function(key, options) {
          options = options || {};
          var n = key.n.toBuffer();
          var d = key.d.toBuffer();
          var p = key.p.toBuffer();
          var q = key.q.toBuffer();
          var dmp1 = key.dmp1.toBuffer();
          var dmq1 = key.dmq1.toBuffer();
          var coeff = key.coeff.toBuffer();
          var length = n.length + d.length + p.length + q.length + dmp1.length + dmq1.length + coeff.length + 512;
          var bodyWriter = new ber.Writer({ size: length });
          bodyWriter.startSequence();
          bodyWriter.writeInt(0);
          bodyWriter.writeBuffer(n, 2);
          bodyWriter.writeInt(key.e);
          bodyWriter.writeBuffer(d, 2);
          bodyWriter.writeBuffer(p, 2);
          bodyWriter.writeBuffer(q, 2);
          bodyWriter.writeBuffer(dmp1, 2);
          bodyWriter.writeBuffer(dmq1, 2);
          bodyWriter.writeBuffer(coeff, 2);
          bodyWriter.endSequence();
          var writer = new ber.Writer({ size: length });
          writer.startSequence();
          writer.writeInt(0);
          writer.startSequence();
          writer.writeOID(PUBLIC_RSA_OID);
          writer.writeNull();
          writer.endSequence();
          writer.writeBuffer(bodyWriter.buffer, 4);
          writer.endSequence();
          if (options.type === "der") {
            return writer.buffer;
          } else {
            return PRIVATE_OPENING_BOUNDARY + "\n" + utils.linebrk(writer.buffer.toString("base64"), 64) + "\n" + PRIVATE_CLOSING_BOUNDARY;
          }
        },
        privateImport: function(key, data, options) {
          options = options || {};
          var buffer;
          if (options.type !== "der") {
            if (Buffer.isBuffer(data)) {
              data = data.toString("utf8");
            }
            if (_.isString(data)) {
              var pem = utils.trimSurroundingText(data, PRIVATE_OPENING_BOUNDARY, PRIVATE_CLOSING_BOUNDARY).replace("-----END PRIVATE KEY-----", "").replace(/\s+|\n\r|\n|\r$/gm, "");
              buffer = Buffer.from(pem, "base64");
            } else {
              throw Error("Unsupported key format");
            }
          } else if (Buffer.isBuffer(data)) {
            buffer = data;
          } else {
            throw Error("Unsupported key format");
          }
          var reader = new ber.Reader(buffer);
          reader.readSequence();
          reader.readInt(0);
          var header = new ber.Reader(reader.readString(48, true));
          if (header.readOID(6, true) !== PUBLIC_RSA_OID) {
            throw Error("Invalid Public key format");
          }
          var body = new ber.Reader(reader.readString(4, true));
          body.readSequence();
          body.readString(2, true);
          key.setPrivate(body.readString(2, true), body.readString(2, true), body.readString(2, true), body.readString(2, true), body.readString(2, true), body.readString(2, true), body.readString(2, true), body.readString(2, true));
        },
        publicExport: function(key, options) {
          options = options || {};
          var n = key.n.toBuffer();
          var length = n.length + 512;
          var bodyWriter = new ber.Writer({ size: length });
          bodyWriter.writeByte(0);
          bodyWriter.startSequence();
          bodyWriter.writeBuffer(n, 2);
          bodyWriter.writeInt(key.e);
          bodyWriter.endSequence();
          var writer = new ber.Writer({ size: length });
          writer.startSequence();
          writer.startSequence();
          writer.writeOID(PUBLIC_RSA_OID);
          writer.writeNull();
          writer.endSequence();
          writer.writeBuffer(bodyWriter.buffer, 3);
          writer.endSequence();
          if (options.type === "der") {
            return writer.buffer;
          } else {
            return PUBLIC_OPENING_BOUNDARY + "\n" + utils.linebrk(writer.buffer.toString("base64"), 64) + "\n" + PUBLIC_CLOSING_BOUNDARY;
          }
        },
        publicImport: function(key, data, options) {
          options = options || {};
          var buffer;
          if (options.type !== "der") {
            if (Buffer.isBuffer(data)) {
              data = data.toString("utf8");
            }
            if (_.isString(data)) {
              var pem = utils.trimSurroundingText(data, PUBLIC_OPENING_BOUNDARY, PUBLIC_CLOSING_BOUNDARY).replace(/\s+|\n\r|\n|\r$/gm, "");
              buffer = Buffer.from(pem, "base64");
            }
          } else if (Buffer.isBuffer(data)) {
            buffer = data;
          } else {
            throw Error("Unsupported key format");
          }
          var reader = new ber.Reader(buffer);
          reader.readSequence();
          var header = new ber.Reader(reader.readString(48, true));
          if (header.readOID(6, true) !== PUBLIC_RSA_OID) {
            throw Error("Invalid Public key format");
          }
          var body = new ber.Reader(reader.readString(3, true));
          body.readByte();
          body.readSequence();
          key.setPublic(body.readString(2, true), body.readString(2, true));
        },
        autoImport: function(key, data) {
          if (/^[\S\s]*-----BEGIN PRIVATE KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END PRIVATE KEY-----[\S\s]*$/g.test(data)) {
            module22.exports.privateImport(key, data);
            return true;
          }
          if (/^[\S\s]*-----BEGIN PUBLIC KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END PUBLIC KEY-----[\S\s]*$/g.test(data)) {
            module22.exports.publicImport(key, data);
            return true;
          }
          return false;
        }
      };
    });
    var require_components = __commonJS2((exports22, module22) => {
      var _ = require_utils4()._;
      var utils = require_utils4();
      module22.exports = {
        privateExport: function(key, options) {
          return {
            n: key.n.toBuffer(),
            e: key.e,
            d: key.d.toBuffer(),
            p: key.p.toBuffer(),
            q: key.q.toBuffer(),
            dmp1: key.dmp1.toBuffer(),
            dmq1: key.dmq1.toBuffer(),
            coeff: key.coeff.toBuffer()
          };
        },
        privateImport: function(key, data, options) {
          if (data.n && data.e && data.d && data.p && data.q && data.dmp1 && data.dmq1 && data.coeff) {
            key.setPrivate(data.n, data.e, data.d, data.p, data.q, data.dmp1, data.dmq1, data.coeff);
          } else {
            throw Error("Invalid key data");
          }
        },
        publicExport: function(key, options) {
          return {
            n: key.n.toBuffer(),
            e: key.e
          };
        },
        publicImport: function(key, data, options) {
          if (data.n && data.e) {
            key.setPublic(data.n, data.e);
          } else {
            throw Error("Invalid key data");
          }
        },
        autoImport: function(key, data) {
          if (data.n && data.e) {
            if (data.d && data.p && data.q && data.dmp1 && data.dmq1 && data.coeff) {
              module22.exports.privateImport(key, data);
              return true;
            } else {
              module22.exports.publicImport(key, data);
              return true;
            }
          }
          return false;
        }
      };
    });
    var require_openssh = __commonJS2((exports22, module22) => {
      var _ = require_utils4()._;
      var utils = require_utils4();
      var BigInteger = require_jsbn();
      var PRIVATE_OPENING_BOUNDARY = "-----BEGIN OPENSSH PRIVATE KEY-----";
      var PRIVATE_CLOSING_BOUNDARY = "-----END OPENSSH PRIVATE KEY-----";
      module22.exports = {
        privateExport: function(key, options) {
          const nbuf = key.n.toBuffer();
          let ebuf = Buffer.alloc(4);
          ebuf.writeUInt32BE(key.e, 0);
          while (ebuf[0] === 0)
            ebuf = ebuf.slice(1);
          const dbuf = key.d.toBuffer();
          const coeffbuf = key.coeff.toBuffer();
          const pbuf = key.p.toBuffer();
          const qbuf = key.q.toBuffer();
          let commentbuf;
          if (typeof key.sshcomment !== "undefined") {
            commentbuf = Buffer.from(key.sshcomment);
          } else {
            commentbuf = Buffer.from([]);
          }
          const pubkeyLength = 11 + 4 + ebuf.byteLength + 4 + nbuf.byteLength;
          const privateKeyLength = 8 + 11 + 4 + nbuf.byteLength + 4 + ebuf.byteLength + 4 + dbuf.byteLength + 4 + coeffbuf.byteLength + 4 + pbuf.byteLength + 4 + qbuf.byteLength + 4 + commentbuf.byteLength;
          let length = 15 + 16 + 4 + 4 + 4 + pubkeyLength + 4 + privateKeyLength;
          const paddingLength = Math.ceil(privateKeyLength / 8) * 8 - privateKeyLength;
          length += paddingLength;
          const buf = Buffer.alloc(length);
          const writer = { buf, off: 0 };
          buf.write("openssh-key-v1", "utf8");
          buf.writeUInt8(0, 14);
          writer.off += 15;
          writeOpenSSHKeyString(writer, Buffer.from("none"));
          writeOpenSSHKeyString(writer, Buffer.from("none"));
          writeOpenSSHKeyString(writer, Buffer.from(""));
          writer.off = writer.buf.writeUInt32BE(1, writer.off);
          writer.off = writer.buf.writeUInt32BE(pubkeyLength, writer.off);
          writeOpenSSHKeyString(writer, Buffer.from("ssh-rsa"));
          writeOpenSSHKeyString(writer, ebuf);
          writeOpenSSHKeyString(writer, nbuf);
          writer.off = writer.buf.writeUInt32BE(length - 47 - pubkeyLength, writer.off);
          writer.off += 8;
          writeOpenSSHKeyString(writer, Buffer.from("ssh-rsa"));
          writeOpenSSHKeyString(writer, nbuf);
          writeOpenSSHKeyString(writer, ebuf);
          writeOpenSSHKeyString(writer, dbuf);
          writeOpenSSHKeyString(writer, coeffbuf);
          writeOpenSSHKeyString(writer, pbuf);
          writeOpenSSHKeyString(writer, qbuf);
          writeOpenSSHKeyString(writer, commentbuf);
          let pad = 1;
          while (writer.off < length) {
            writer.off = writer.buf.writeUInt8(pad++, writer.off);
          }
          if (options.type === "der") {
            return writer.buf;
          } else {
            return PRIVATE_OPENING_BOUNDARY + "\n" + utils.linebrk(buf.toString("base64"), 70) + "\n" + PRIVATE_CLOSING_BOUNDARY + "\n";
          }
        },
        privateImport: function(key, data, options) {
          options = options || {};
          var buffer;
          if (options.type !== "der") {
            if (Buffer.isBuffer(data)) {
              data = data.toString("utf8");
            }
            if (_.isString(data)) {
              var pem = utils.trimSurroundingText(data, PRIVATE_OPENING_BOUNDARY, PRIVATE_CLOSING_BOUNDARY).replace(/\s+|\n\r|\n|\r$/gm, "");
              buffer = Buffer.from(pem, "base64");
            } else {
              throw Error("Unsupported key format");
            }
          } else if (Buffer.isBuffer(data)) {
            buffer = data;
          } else {
            throw Error("Unsupported key format");
          }
          const reader = { buf: buffer, off: 0 };
          if (buffer.slice(0, 14).toString("ascii") !== "openssh-key-v1")
            throw "Invalid file format.";
          reader.off += 15;
          if (readOpenSSHKeyString(reader).toString("ascii") !== "none")
            throw Error("Unsupported key type");
          if (readOpenSSHKeyString(reader).toString("ascii") !== "none")
            throw Error("Unsupported key type");
          if (readOpenSSHKeyString(reader).toString("ascii") !== "")
            throw Error("Unsupported key type");
          reader.off += 4;
          reader.off += 4;
          if (readOpenSSHKeyString(reader).toString("ascii") !== "ssh-rsa")
            throw Error("Unsupported key type");
          readOpenSSHKeyString(reader);
          readOpenSSHKeyString(reader);
          reader.off += 12;
          if (readOpenSSHKeyString(reader).toString("ascii") !== "ssh-rsa")
            throw Error("Unsupported key type");
          const n = readOpenSSHKeyString(reader);
          const e = readOpenSSHKeyString(reader);
          const d = readOpenSSHKeyString(reader);
          const coeff = readOpenSSHKeyString(reader);
          const p = readOpenSSHKeyString(reader);
          const q = readOpenSSHKeyString(reader);
          const dint = new BigInteger(d);
          const qint = new BigInteger(q);
          const pint = new BigInteger(p);
          const dp = dint.mod(pint.subtract(BigInteger.ONE));
          const dq = dint.mod(qint.subtract(BigInteger.ONE));
          key.setPrivate(n, e, d, p, q, dp.toBuffer(), dq.toBuffer(), coeff);
          key.sshcomment = readOpenSSHKeyString(reader).toString("ascii");
        },
        publicExport: function(key, options) {
          let ebuf = Buffer.alloc(4);
          ebuf.writeUInt32BE(key.e, 0);
          while (ebuf[0] === 0)
            ebuf = ebuf.slice(1);
          const nbuf = key.n.toBuffer();
          const buf = Buffer.alloc(ebuf.byteLength + 4 + nbuf.byteLength + 4 + "ssh-rsa".length + 4);
          const writer = { buf, off: 0 };
          writeOpenSSHKeyString(writer, Buffer.from("ssh-rsa"));
          writeOpenSSHKeyString(writer, ebuf);
          writeOpenSSHKeyString(writer, nbuf);
          let comment = key.sshcomment || "";
          if (options.type === "der") {
            return writer.buf;
          } else {
            return "ssh-rsa " + buf.toString("base64") + " " + comment + "\n";
          }
        },
        publicImport: function(key, data, options) {
          options = options || {};
          var buffer;
          if (options.type !== "der") {
            if (Buffer.isBuffer(data)) {
              data = data.toString("utf8");
            }
            if (_.isString(data)) {
              if (data.substring(0, 8) !== "ssh-rsa ")
                throw Error("Unsupported key format");
              let pemEnd = data.indexOf(" ", 8);
              if (pemEnd === -1) {
                pemEnd = data.length;
              } else {
                key.sshcomment = data.substring(pemEnd + 1).replace(/\s+|\n\r|\n|\r$/gm, "");
              }
              const pem = data.substring(8, pemEnd).replace(/\s+|\n\r|\n|\r$/gm, "");
              buffer = Buffer.from(pem, "base64");
            } else {
              throw Error("Unsupported key format");
            }
          } else if (Buffer.isBuffer(data)) {
            buffer = data;
          } else {
            throw Error("Unsupported key format");
          }
          const reader = { buf: buffer, off: 0 };
          const type = readOpenSSHKeyString(reader).toString("ascii");
          if (type !== "ssh-rsa")
            throw Error("Invalid key type: " + type);
          const e = readOpenSSHKeyString(reader);
          const n = readOpenSSHKeyString(reader);
          key.setPublic(n, e);
        },
        autoImport: function(key, data) {
          if (/^[\S\s]*-----BEGIN OPENSSH PRIVATE KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END OPENSSH PRIVATE KEY-----[\S\s]*$/g.test(data)) {
            module22.exports.privateImport(key, data);
            return true;
          }
          if (/^[\S\s]*ssh-rsa \s*(?=(([A-Za-z0-9+/=]+\s*)+))\1[\S\s]*$/g.test(data)) {
            module22.exports.publicImport(key, data);
            return true;
          }
          return false;
        }
      };
      function readOpenSSHKeyString(reader) {
        const len = reader.buf.readInt32BE(reader.off);
        reader.off += 4;
        const res = reader.buf.slice(reader.off, reader.off + len);
        reader.off += len;
        return res;
      }
      function writeOpenSSHKeyString(writer, data) {
        writer.buf.writeInt32BE(data.byteLength, writer.off);
        writer.off += 4;
        writer.off += data.copy(writer.buf, writer.off);
      }
    });
    var require_formats = __commonJS2((exports22, module22) => {
      var _ = require_utils4()._;
      function formatParse(format) {
        format = format.split("-");
        var keyType = "private";
        var keyOpt = { type: "default" };
        for (var i = 1; i < format.length; i++) {
          if (format[i]) {
            switch (format[i]) {
              case "public":
                keyType = format[i];
                break;
              case "private":
                keyType = format[i];
                break;
              case "pem":
                keyOpt.type = format[i];
                break;
              case "der":
                keyOpt.type = format[i];
                break;
            }
          }
        }
        return { scheme: format[0], keyType, keyOpt };
      }
      module22.exports = {
        pkcs1: require_pkcs12(),
        pkcs8: require_pkcs8(),
        components: require_components(),
        openssh: require_openssh(),
        isPrivateExport: function(format) {
          return module22.exports[format] && typeof module22.exports[format].privateExport === "function";
        },
        isPrivateImport: function(format) {
          return module22.exports[format] && typeof module22.exports[format].privateImport === "function";
        },
        isPublicExport: function(format) {
          return module22.exports[format] && typeof module22.exports[format].publicExport === "function";
        },
        isPublicImport: function(format) {
          return module22.exports[format] && typeof module22.exports[format].publicImport === "function";
        },
        detectAndImport: function(key, data, format) {
          if (format === void 0) {
            for (var scheme in module22.exports) {
              if (typeof module22.exports[scheme].autoImport === "function" && module22.exports[scheme].autoImport(key, data)) {
                return true;
              }
            }
          } else if (format) {
            var fmt = formatParse(format);
            if (module22.exports[fmt.scheme]) {
              if (fmt.keyType === "private") {
                module22.exports[fmt.scheme].privateImport(key, data, fmt.keyOpt);
              } else {
                module22.exports[fmt.scheme].publicImport(key, data, fmt.keyOpt);
              }
            } else {
              throw Error("Unsupported key format");
            }
          }
          return false;
        },
        detectAndExport: function(key, format) {
          if (format) {
            var fmt = formatParse(format);
            if (module22.exports[fmt.scheme]) {
              if (fmt.keyType === "private") {
                if (!key.isPrivate()) {
                  throw Error("This is not private key");
                }
                return module22.exports[fmt.scheme].privateExport(key, fmt.keyOpt);
              } else {
                if (!key.isPublic()) {
                  throw Error("This is not public key");
                }
                return module22.exports[fmt.scheme].publicExport(key, fmt.keyOpt);
              }
            } else {
              throw Error("Unsupported key format");
            }
          }
        }
      };
    });
    var require_NodeRSA = __commonJS2((exports22, module22) => {
      var constants2 = require("constants");
      var rsa = require_rsa();
      var crypt = require("crypto");
      var ber = require_lib22().Ber;
      var _ = require_utils4()._;
      var utils = require_utils4();
      var schemes = require_schemes();
      var formats = require_formats();
      if (typeof constants2.RSA_NO_PADDING === "undefined") {
        constants2.RSA_NO_PADDING = 3;
      }
      module22.exports = function() {
        var SUPPORTED_HASH_ALGORITHMS = {
          node10: ["md4", "md5", "ripemd160", "sha1", "sha224", "sha256", "sha384", "sha512"],
          node: ["md4", "md5", "ripemd160", "sha1", "sha224", "sha256", "sha384", "sha512"],
          iojs: ["md4", "md5", "ripemd160", "sha1", "sha224", "sha256", "sha384", "sha512"],
          browser: ["md5", "ripemd160", "sha1", "sha256", "sha512"]
        };
        var DEFAULT_ENCRYPTION_SCHEME = "pkcs1_oaep";
        var DEFAULT_SIGNING_SCHEME = "pkcs1";
        var DEFAULT_EXPORT_FORMAT = "private";
        var EXPORT_FORMAT_ALIASES = {
          private: "pkcs1-private-pem",
          "private-der": "pkcs1-private-der",
          public: "pkcs8-public-pem",
          "public-der": "pkcs8-public-der"
        };
        function NodeRSA2(key, format, options) {
          if (!(this instanceof NodeRSA2)) {
            return new NodeRSA2(key, format, options);
          }
          if (_.isObject(format)) {
            options = format;
            format = void 0;
          }
          this.$options = {
            signingScheme: DEFAULT_SIGNING_SCHEME,
            signingSchemeOptions: {
              hash: "sha256",
              saltLength: null
            },
            encryptionScheme: DEFAULT_ENCRYPTION_SCHEME,
            encryptionSchemeOptions: {
              hash: "sha1",
              label: null
            },
            environment: utils.detectEnvironment(),
            rsaUtils: this
          };
          this.keyPair = new rsa.Key();
          this.$cache = {};
          if (Buffer.isBuffer(key) || _.isString(key)) {
            this.importKey(key, format);
          } else if (_.isObject(key)) {
            this.generateKeyPair(key.b, key.e);
          }
          this.setOptions(options);
        }
        NodeRSA2.prototype.setOptions = function(options) {
          options = options || {};
          if (options.environment) {
            this.$options.environment = options.environment;
          }
          if (options.signingScheme) {
            if (_.isString(options.signingScheme)) {
              var signingScheme = options.signingScheme.toLowerCase().split("-");
              if (signingScheme.length == 1) {
                if (SUPPORTED_HASH_ALGORITHMS.node.indexOf(signingScheme[0]) > -1) {
                  this.$options.signingSchemeOptions = {
                    hash: signingScheme[0]
                  };
                  this.$options.signingScheme = DEFAULT_SIGNING_SCHEME;
                } else {
                  this.$options.signingScheme = signingScheme[0];
                  this.$options.signingSchemeOptions = {
                    hash: null
                  };
                }
              } else {
                this.$options.signingSchemeOptions = {
                  hash: signingScheme[1]
                };
                this.$options.signingScheme = signingScheme[0];
              }
            } else if (_.isObject(options.signingScheme)) {
              this.$options.signingScheme = options.signingScheme.scheme || DEFAULT_SIGNING_SCHEME;
              this.$options.signingSchemeOptions = _.omit(options.signingScheme, "scheme");
            }
            if (!schemes.isSignature(this.$options.signingScheme)) {
              throw Error("Unsupported signing scheme");
            }
            if (this.$options.signingSchemeOptions.hash && SUPPORTED_HASH_ALGORITHMS[this.$options.environment].indexOf(this.$options.signingSchemeOptions.hash) === -1) {
              throw Error("Unsupported hashing algorithm for " + this.$options.environment + " environment");
            }
          }
          if (options.encryptionScheme) {
            if (_.isString(options.encryptionScheme)) {
              this.$options.encryptionScheme = options.encryptionScheme.toLowerCase();
              this.$options.encryptionSchemeOptions = {};
            } else if (_.isObject(options.encryptionScheme)) {
              this.$options.encryptionScheme = options.encryptionScheme.scheme || DEFAULT_ENCRYPTION_SCHEME;
              this.$options.encryptionSchemeOptions = _.omit(options.encryptionScheme, "scheme");
            }
            if (!schemes.isEncryption(this.$options.encryptionScheme)) {
              throw Error("Unsupported encryption scheme");
            }
            if (this.$options.encryptionSchemeOptions.hash && SUPPORTED_HASH_ALGORITHMS[this.$options.environment].indexOf(this.$options.encryptionSchemeOptions.hash) === -1) {
              throw Error("Unsupported hashing algorithm for " + this.$options.environment + " environment");
            }
          }
          this.keyPair.setOptions(this.$options);
        };
        NodeRSA2.prototype.generateKeyPair = function(bits, exp) {
          bits = bits || 2048;
          exp = exp || 65537;
          if (bits % 8 !== 0) {
            throw Error("Key size must be a multiple of 8.");
          }
          this.keyPair.generate(bits, exp.toString(16));
          this.$cache = {};
          return this;
        };
        NodeRSA2.prototype.importKey = function(keyData, format) {
          if (!keyData) {
            throw Error("Empty key given");
          }
          if (format) {
            format = EXPORT_FORMAT_ALIASES[format] || format;
          }
          if (!formats.detectAndImport(this.keyPair, keyData, format) && format === void 0) {
            throw Error("Key format must be specified");
          }
          this.$cache = {};
          return this;
        };
        NodeRSA2.prototype.exportKey = function(format) {
          format = format || DEFAULT_EXPORT_FORMAT;
          format = EXPORT_FORMAT_ALIASES[format] || format;
          if (!this.$cache[format]) {
            this.$cache[format] = formats.detectAndExport(this.keyPair, format);
          }
          return this.$cache[format];
        };
        NodeRSA2.prototype.isPrivate = function() {
          return this.keyPair.isPrivate();
        };
        NodeRSA2.prototype.isPublic = function(strict) {
          return this.keyPair.isPublic(strict);
        };
        NodeRSA2.prototype.isEmpty = function(strict) {
          return !(this.keyPair.n || this.keyPair.e || this.keyPair.d);
        };
        NodeRSA2.prototype.encrypt = function(buffer, encoding, source_encoding) {
          return this.$$encryptKey(false, buffer, encoding, source_encoding);
        };
        NodeRSA2.prototype.decrypt = function(buffer, encoding) {
          return this.$$decryptKey(false, buffer, encoding);
        };
        NodeRSA2.prototype.encryptPrivate = function(buffer, encoding, source_encoding) {
          return this.$$encryptKey(true, buffer, encoding, source_encoding);
        };
        NodeRSA2.prototype.decryptPublic = function(buffer, encoding) {
          return this.$$decryptKey(true, buffer, encoding);
        };
        NodeRSA2.prototype.$$encryptKey = function(usePrivate, buffer, encoding, source_encoding) {
          try {
            var res = this.keyPair.encrypt(this.$getDataForEncrypt(buffer, source_encoding), usePrivate);
            if (encoding == "buffer" || !encoding) {
              return res;
            } else {
              return res.toString(encoding);
            }
          } catch (e) {
            throw Error("Error during encryption. Original error: " + e);
          }
        };
        NodeRSA2.prototype.$$decryptKey = function(usePublic, buffer, encoding) {
          try {
            buffer = _.isString(buffer) ? Buffer.from(buffer, "base64") : buffer;
            var res = this.keyPair.decrypt(buffer, usePublic);
            if (res === null) {
              throw Error("Key decrypt method returns null.");
            }
            return this.$getDecryptedData(res, encoding);
          } catch (e) {
            throw Error("Error during decryption (probably incorrect key). Original error: " + e);
          }
        };
        NodeRSA2.prototype.sign = function(buffer, encoding, source_encoding) {
          if (!this.isPrivate()) {
            throw Error("This is not private key");
          }
          var res = this.keyPair.sign(this.$getDataForEncrypt(buffer, source_encoding));
          if (encoding && encoding != "buffer") {
            res = res.toString(encoding);
          }
          return res;
        };
        NodeRSA2.prototype.verify = function(buffer, signature, source_encoding, signature_encoding) {
          if (!this.isPublic()) {
            throw Error("This is not public key");
          }
          signature_encoding = !signature_encoding || signature_encoding == "buffer" ? null : signature_encoding;
          return this.keyPair.verify(this.$getDataForEncrypt(buffer, source_encoding), signature, signature_encoding);
        };
        NodeRSA2.prototype.getKeySize = function() {
          return this.keyPair.keySize;
        };
        NodeRSA2.prototype.getMaxMessageSize = function() {
          return this.keyPair.maxMessageLength;
        };
        NodeRSA2.prototype.$getDataForEncrypt = function(buffer, encoding) {
          if (_.isString(buffer) || _.isNumber(buffer)) {
            return Buffer.from("" + buffer, encoding || "utf8");
          } else if (Buffer.isBuffer(buffer)) {
            return buffer;
          } else if (_.isObject(buffer)) {
            return Buffer.from(JSON.stringify(buffer));
          } else {
            throw Error("Unexpected data type");
          }
        };
        NodeRSA2.prototype.$getDecryptedData = function(buffer, encoding) {
          encoding = encoding || "buffer";
          if (encoding == "buffer") {
            return buffer;
          } else if (encoding == "json") {
            return JSON.parse(buffer.toString());
          } else {
            return buffer.toString(encoding);
          }
        };
        return NodeRSA2;
      }();
    });
    var require_common = __commonJS2((exports22, module22) => {
      function setup(env) {
        createDebug.debug = createDebug;
        createDebug.default = createDebug;
        createDebug.coerce = coerce;
        createDebug.disable = disable;
        createDebug.enable = enable;
        createDebug.enabled = enabled;
        createDebug.humanize = require_ms();
        createDebug.destroy = destroy;
        Object.keys(env).forEach((key) => {
          createDebug[key] = env[key];
        });
        createDebug.names = [];
        createDebug.skips = [];
        createDebug.formatters = {};
        function selectColor(namespace) {
          let hash = 0;
          for (let i = 0; i < namespace.length; i++) {
            hash = (hash << 5) - hash + namespace.charCodeAt(i);
            hash |= 0;
          }
          return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
        }
        createDebug.selectColor = selectColor;
        function createDebug(namespace) {
          let prevTime;
          let enableOverride = null;
          function debug7(...args) {
            if (!debug7.enabled) {
              return;
            }
            const self = debug7;
            const curr = Number(new Date());
            const ms = curr - (prevTime || curr);
            self.diff = ms;
            self.prev = prevTime;
            self.curr = curr;
            prevTime = curr;
            args[0] = createDebug.coerce(args[0]);
            if (typeof args[0] !== "string") {
              args.unshift("%O");
            }
            let index = 0;
            args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
              if (match === "%%") {
                return "%";
              }
              index++;
              const formatter = createDebug.formatters[format];
              if (typeof formatter === "function") {
                const val = args[index];
                match = formatter.call(self, val);
                args.splice(index, 1);
                index--;
              }
              return match;
            });
            createDebug.formatArgs.call(self, args);
            const logFn = self.log || createDebug.log;
            logFn.apply(self, args);
          }
          debug7.namespace = namespace;
          debug7.useColors = createDebug.useColors();
          debug7.color = createDebug.selectColor(namespace);
          debug7.extend = extend;
          debug7.destroy = createDebug.destroy;
          Object.defineProperty(debug7, "enabled", {
            enumerable: true,
            configurable: false,
            get: () => enableOverride === null ? createDebug.enabled(namespace) : enableOverride,
            set: (v) => {
              enableOverride = v;
            }
          });
          if (typeof createDebug.init === "function") {
            createDebug.init(debug7);
          }
          return debug7;
        }
        function extend(namespace, delimiter) {
          const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
          newDebug.log = this.log;
          return newDebug;
        }
        function enable(namespaces) {
          createDebug.save(namespaces);
          createDebug.names = [];
          createDebug.skips = [];
          let i;
          const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
          const len = split.length;
          for (i = 0; i < len; i++) {
            if (!split[i]) {
              continue;
            }
            namespaces = split[i].replace(/\*/g, ".*?");
            if (namespaces[0] === "-") {
              createDebug.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
            } else {
              createDebug.names.push(new RegExp("^" + namespaces + "$"));
            }
          }
        }
        function disable() {
          const namespaces = [
            ...createDebug.names.map(toNamespace),
            ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
          ].join(",");
          createDebug.enable("");
          return namespaces;
        }
        function enabled(name2) {
          if (name2[name2.length - 1] === "*") {
            return true;
          }
          let i;
          let len;
          for (i = 0, len = createDebug.skips.length; i < len; i++) {
            if (createDebug.skips[i].test(name2)) {
              return false;
            }
          }
          for (i = 0, len = createDebug.names.length; i < len; i++) {
            if (createDebug.names[i].test(name2)) {
              return true;
            }
          }
          return false;
        }
        function toNamespace(regexp) {
          return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
        }
        function coerce(val) {
          if (val instanceof Error) {
            return val.stack || val.message;
          }
          return val;
        }
        function destroy() {
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
        createDebug.enable(createDebug.load());
        return createDebug;
      }
      module22.exports = setup;
    });
    var require_browser = __commonJS2((exports22, module22) => {
      exports22.formatArgs = formatArgs;
      exports22.save = save;
      exports22.load = load;
      exports22.useColors = useColors;
      exports22.storage = localstorage();
      exports22.destroy = (() => {
        let warned = false;
        return () => {
          if (!warned) {
            warned = true;
            console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
          }
        };
      })();
      exports22.colors = [
        "#0000CC",
        "#0000FF",
        "#0033CC",
        "#0033FF",
        "#0066CC",
        "#0066FF",
        "#0099CC",
        "#0099FF",
        "#00CC00",
        "#00CC33",
        "#00CC66",
        "#00CC99",
        "#00CCCC",
        "#00CCFF",
        "#3300CC",
        "#3300FF",
        "#3333CC",
        "#3333FF",
        "#3366CC",
        "#3366FF",
        "#3399CC",
        "#3399FF",
        "#33CC00",
        "#33CC33",
        "#33CC66",
        "#33CC99",
        "#33CCCC",
        "#33CCFF",
        "#6600CC",
        "#6600FF",
        "#6633CC",
        "#6633FF",
        "#66CC00",
        "#66CC33",
        "#9900CC",
        "#9900FF",
        "#9933CC",
        "#9933FF",
        "#99CC00",
        "#99CC33",
        "#CC0000",
        "#CC0033",
        "#CC0066",
        "#CC0099",
        "#CC00CC",
        "#CC00FF",
        "#CC3300",
        "#CC3333",
        "#CC3366",
        "#CC3399",
        "#CC33CC",
        "#CC33FF",
        "#CC6600",
        "#CC6633",
        "#CC9900",
        "#CC9933",
        "#CCCC00",
        "#CCCC33",
        "#FF0000",
        "#FF0033",
        "#FF0066",
        "#FF0099",
        "#FF00CC",
        "#FF00FF",
        "#FF3300",
        "#FF3333",
        "#FF3366",
        "#FF3399",
        "#FF33CC",
        "#FF33FF",
        "#FF6600",
        "#FF6633",
        "#FF9900",
        "#FF9933",
        "#FFCC00",
        "#FFCC33"
      ];
      function useColors() {
        if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
          return true;
        }
        if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
          return false;
        }
        return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
      }
      function formatArgs(args) {
        args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module22.exports.humanize(this.diff);
        if (!this.useColors) {
          return;
        }
        const c = "color: " + this.color;
        args.splice(1, 0, c, "color: inherit");
        let index = 0;
        let lastC = 0;
        args[0].replace(/%[a-zA-Z%]/g, (match) => {
          if (match === "%%") {
            return;
          }
          index++;
          if (match === "%c") {
            lastC = index;
          }
        });
        args.splice(lastC, 0, c);
      }
      exports22.log = console.debug || console.log || (() => {
      });
      function save(namespaces) {
        try {
          if (namespaces) {
            exports22.storage.setItem("debug", namespaces);
          } else {
            exports22.storage.removeItem("debug");
          }
        } catch (error) {
        }
      }
      function load() {
        let r;
        try {
          r = exports22.storage.getItem("debug");
        } catch (error) {
        }
        if (!r && typeof process !== "undefined" && "env" in process) {
          r = process.env.DEBUG;
        }
        return r;
      }
      function localstorage() {
        try {
          return localStorage;
        } catch (error) {
        }
      }
      module22.exports = require_common()(exports22);
      var { formatters } = module22.exports;
      formatters.j = function(v) {
        try {
          return JSON.stringify(v);
        } catch (error) {
          return "[UnexpectedJSONParseError]: " + error.message;
        }
      };
    });
    var require_has_flag3 = __commonJS2((exports22, module22) => {
      "use strict";
      module22.exports = (flag, argv) => {
        argv = argv || process.argv;
        const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
        const pos = argv.indexOf(prefix + flag);
        const terminatorPos = argv.indexOf("--");
        return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
      };
    });
    var require_supports_color3 = __commonJS2((exports22, module22) => {
      "use strict";
      var os = require("os");
      var hasFlag = require_has_flag3();
      var env = process.env;
      var forceColor;
      if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false")) {
        forceColor = false;
      } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
        forceColor = true;
      }
      if ("FORCE_COLOR" in env) {
        forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
      }
      function translateLevel(level) {
        if (level === 0) {
          return false;
        }
        return {
          level,
          hasBasic: true,
          has256: level >= 2,
          has16m: level >= 3
        };
      }
      function supportsColor(stream) {
        if (forceColor === false) {
          return 0;
        }
        if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
          return 3;
        }
        if (hasFlag("color=256")) {
          return 2;
        }
        if (stream && !stream.isTTY && forceColor !== true) {
          return 0;
        }
        const min = forceColor ? 1 : 0;
        if (process.platform === "win32") {
          const osRelease = os.release().split(".");
          if (Number(process.versions.node.split(".")[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
            return Number(osRelease[2]) >= 14931 ? 3 : 2;
          }
          return 1;
        }
        if ("CI" in env) {
          if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
            return 1;
          }
          return min;
        }
        if ("TEAMCITY_VERSION" in env) {
          return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
        }
        if (env.COLORTERM === "truecolor") {
          return 3;
        }
        if ("TERM_PROGRAM" in env) {
          const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
          switch (env.TERM_PROGRAM) {
            case "iTerm.app":
              return version >= 3 ? 3 : 2;
            case "Apple_Terminal":
              return 2;
          }
        }
        if (/-256(color)?$/i.test(env.TERM)) {
          return 2;
        }
        if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
          return 1;
        }
        if ("COLORTERM" in env) {
          return 1;
        }
        if (env.TERM === "dumb") {
          return min;
        }
        return min;
      }
      function getSupportLevel(stream) {
        const level = supportsColor(stream);
        return translateLevel(level);
      }
      module22.exports = {
        supportsColor: getSupportLevel,
        stdout: getSupportLevel(process.stdout),
        stderr: getSupportLevel(process.stderr)
      };
    });
    var require_node = __commonJS2((exports22, module22) => {
      var tty = require("tty");
      var util2 = require("util");
      exports22.init = init;
      exports22.log = log;
      exports22.formatArgs = formatArgs;
      exports22.save = save;
      exports22.load = load;
      exports22.useColors = useColors;
      exports22.destroy = util2.deprecate(() => {
      }, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      exports22.colors = [6, 2, 3, 4, 5, 1];
      try {
        const supportsColor = require_supports_color3();
        if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
          exports22.colors = [
            20,
            21,
            26,
            27,
            32,
            33,
            38,
            39,
            40,
            41,
            42,
            43,
            44,
            45,
            56,
            57,
            62,
            63,
            68,
            69,
            74,
            75,
            76,
            77,
            78,
            79,
            80,
            81,
            92,
            93,
            98,
            99,
            112,
            113,
            128,
            129,
            134,
            135,
            148,
            149,
            160,
            161,
            162,
            163,
            164,
            165,
            166,
            167,
            168,
            169,
            170,
            171,
            172,
            173,
            178,
            179,
            184,
            185,
            196,
            197,
            198,
            199,
            200,
            201,
            202,
            203,
            204,
            205,
            206,
            207,
            208,
            209,
            214,
            215,
            220,
            221
          ];
        }
      } catch (error) {
      }
      exports22.inspectOpts = Object.keys(process.env).filter((key) => {
        return /^debug_/i.test(key);
      }).reduce((obj, key) => {
        const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
          return k.toUpperCase();
        });
        let val = process.env[key];
        if (/^(yes|on|true|enabled)$/i.test(val)) {
          val = true;
        } else if (/^(no|off|false|disabled)$/i.test(val)) {
          val = false;
        } else if (val === "null") {
          val = null;
        } else {
          val = Number(val);
        }
        obj[prop] = val;
        return obj;
      }, {});
      function useColors() {
        return "colors" in exports22.inspectOpts ? Boolean(exports22.inspectOpts.colors) : tty.isatty(process.stderr.fd);
      }
      function formatArgs(args) {
        const { namespace: name2, useColors: useColors2 } = this;
        if (useColors2) {
          const c = this.color;
          const colorCode = "[3" + (c < 8 ? c : "8;5;" + c);
          const prefix = `  ${colorCode};1m${name2} [0m`;
          args[0] = prefix + args[0].split("\n").join("\n" + prefix);
          args.push(colorCode + "m+" + module22.exports.humanize(this.diff) + "[0m");
        } else {
          args[0] = getDate() + name2 + " " + args[0];
        }
      }
      function getDate() {
        if (exports22.inspectOpts.hideDate) {
          return "";
        }
        return new Date().toISOString() + " ";
      }
      function log(...args) {
        return process.stderr.write(util2.format(...args) + "\n");
      }
      function save(namespaces) {
        if (namespaces) {
          process.env.DEBUG = namespaces;
        } else {
          delete process.env.DEBUG;
        }
      }
      function load() {
        return process.env.DEBUG;
      }
      function init(debug7) {
        debug7.inspectOpts = {};
        const keys = Object.keys(exports22.inspectOpts);
        for (let i = 0; i < keys.length; i++) {
          debug7.inspectOpts[keys[i]] = exports22.inspectOpts[keys[i]];
        }
      }
      module22.exports = require_common()(exports22);
      var { formatters } = module22.exports;
      formatters.o = function(v) {
        this.inspectOpts.colors = this.useColors;
        return util2.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
      };
      formatters.O = function(v) {
        this.inspectOpts.colors = this.useColors;
        return util2.inspect(v, this.inspectOpts);
      };
    });
    var require_src = __commonJS2((exports22, module22) => {
      if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
        module22.exports = require_browser();
      } else {
        module22.exports = require_node();
      }
    });
    __export(exports2, {
      getToken: () => getToken2,
      getTokenCommand: () => command
    });
    var ora = __toModule(require_ora());
    var rest = __toModule(require_dist_node15());
    var auth_app = __toModule(require_dist_node17());
    var node_rsa = __toModule(require_NodeRSA());
    var SUCCESS_SYMBOL = "\u{1F4AB}";
    var debug = __toModule(require_src());
    var name = "github-app-installation-token";
    function logger(nameSpace) {
      const log = debug.default(`${name}:${nameSpace}`);
      log.log = console.log.bind(console);
      return log;
    }
    var isObject = (value) => {
      return !!value && typeof value === "object";
    };
    var isAppsCreateInstallationAccessTokenResponse = (response) => {
      return isObject(response) && typeof (response == null ? void 0 : response.token) === "string";
    };
    var fs = __toModule(require("fs"));
    var util = __toModule(require("util"));
    var debug4 = logger("READ_FILE");
    var readFile = util.promisify(fs.default.readFile);
    var readContent = async (filePath) => {
      debug4("reading...", filePath);
      const rawContent = await readFile(filePath);
      const content = rawContent.toString();
      return content;
    };
    var debug6 = logger("generate");
    async function getToken2({ appId, installationId, privateKey }, requestOptions) {
      const key = new node_rsa.default(privateKey);
      let request;
      if (requestOptions == null ? void 0 : requestOptions.rawResponse) {
        const _a = requestOptions, { rawResponse: _rawResponse } = _a, rest2 = __objRest(_a, ["rawResponse"]);
        request = rest2;
      } else {
        request = requestOptions;
      }
      const octokit = new rest.Octokit({
        authStrategy: auth_app.createAppAuth,
        auth: {
          appId,
          id: appId,
          privateKey: key.exportKey("pkcs8-private-pem")
        },
        request
      });
      const response = await octokit.auth({
        type: "installation",
        installationId
      });
      if (!isAppsCreateInstallationAccessTokenResponse(response)) {
        debug6(`response is missing the token, we got ${response}`);
        throw new Error("Something went wrong on the token retrieval, enable debug to inspect further");
      }
      return (requestOptions == null ? void 0 : requestOptions.rawResponse) ? response : { token: response.token };
    }
    var isValidInput = (input) => {
      return !!(input.privateKey || input.privateKeyLocation);
    };
    var command = async (input) => {
      debug6("input:", input);
      const loader = ora.default("Retrieving token...").start();
      try {
        let privateKey;
        const { privateKeyLocation, installationId, appId, rawResponse } = input;
        if (!isValidInput(input)) {
          loader.fail("Input is not valid, either privateKey or privateKeyLocation should be provided");
          process.exit(1);
        }
        if (!input.privateKey && privateKeyLocation) {
          privateKey = await readContent(privateKeyLocation);
        } else {
          privateKey = input.privateKey;
        }
        const response = await getToken2({ privateKey, installationId, appId }, { rawResponse: true });
        loader.stopAndPersist({
          text: `The token is: ${response.token} and expires ${response.expiresAt}`,
          symbol: SUCCESS_SYMBOL
        });
        console.log(rawResponse ? response : response.token);
      } catch (e) {
        loader.fail(`We encountered an error: ${e}`);
        process.exit(1);
      }
    };
  }
});

// bazel-out/k8-fastbuild/bin/github-actions/lock-closed/main.js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core = require_core();
var github_1 = require_github();
var rest_1 = require_dist_node12();
var { getToken } = require_dist();
async function lockIssue(client, issue, message) {
  await client.issues.createComment({
    owner: github_1.context.repo.owner,
    repo: github_1.context.repo.repo,
    issue_number: issue,
    body: message
  });
  await client.issues.lock({
    owner: github_1.context.repo.owner,
    repo: github_1.context.repo.repo,
    issue_number: issue
  });
}
function timeout(ms) {
  return setTimeout.__promisify__(ms);
}
async function run() {
  try {
    const days = 30;
    const policyUrl = "https://github.com/angular/angular/blob/8f24bc9443b3872fe095d9f7f77b308a361a13b4/docs/GITHUB_PROCESS.md#conversation-locking";
    const message = `This issue has been automatically locked due to inactivity.
Please file a new issue if you are encountering a similar or related problem.

Read more about our [automatic conversation locking policy](${policyUrl}).

<sub>_This action has been performed automatically by a bot._</sub>`;
    const appId = 40213;
    const installationId = 1772826;
    const privateKey = core.getInput("lock-bot-key", { required: true });
    const { token } = await getToken({ installationId, appId, privateKey });
    const client = new rest_1.Octokit({ auth: token });
    const maxPerExecution = Math.min(+core.getInput("locks-per-execution") || 1, 100);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);
    const repositoryName = github_1.context.repo.owner + "/" + github_1.context.repo.repo;
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
      } catch (error) {
        core.debug(error);
        core.warning(`Unable to lock ${itemType} #${item.number}: ${error.message}`);
        if (typeof error.request === "object") {
          core.error(JSON.stringify(error.request, null, 2));
        }
      }
    }
    core.endGroup();
    console.info(`Locked ${lockCount} item(s)`);
  } catch (error) {
    core.debug(error);
    core.setFailed(error.message);
    if (typeof error.request === "object") {
      core.error(JSON.stringify(error.request, null, 2));
    }
  }
  console.info(`End of locking task`);
}
if (github_1.context.repo.owner === "angular" || github_1.context.eventName === "workflow_dispatch") {
  run();
} else {
  core.warning("The Automatic Locking Closed issues was skipped as this action is only meant to run in repos belonging to the Angular organization.");
}
/*!
 * RSA library for Node.js
 *
 * Author: rzcoder
 * License MIT
 */
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */
//# sourceMappingURL=bundle_esbuild.js.map
