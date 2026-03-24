import { createRequire as _esbuildBannerCreateRequire } from 'node:module';globalThis['require'] ??= _esbuildBannerCreateRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// 
var require_fast_content_type_parse = __commonJS({
  ""(exports, module) {
    "use strict";
    var NullObject = function NullObject2() {
    };
    NullObject.prototype = /* @__PURE__ */ Object.create(null);
    var paramRE = /; *([!#$%&'*+.^\w`|~-]+)=("(?:[\v\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\v\u0020-\u00ff])*"|[!#$%&'*+.^\w`|~-]+) */gu;
    var quotedPairRE = /\\([\v\u0020-\u00ff])/gu;
    var mediaTypeRE = /^[!#$%&'*+.^\w|~-]+\/[!#$%&'*+.^\w|~-]+$/u;
    var defaultContentType = { type: "", parameters: new NullObject() };
    Object.freeze(defaultContentType.parameters);
    Object.freeze(defaultContentType);
    function parse2(header) {
      if (typeof header !== "string") {
        throw new TypeError("argument header is required and must be a string");
      }
      let index = header.indexOf(";");
      const type = index !== -1 ? header.slice(0, index).trim() : header.trim();
      if (mediaTypeRE.test(type) === false) {
        throw new TypeError("invalid media type");
      }
      const result = {
        type: type.toLowerCase(),
        parameters: new NullObject()
      };
      if (index === -1) {
        return result;
      }
      let key;
      let match;
      let value;
      paramRE.lastIndex = index;
      while (match = paramRE.exec(header)) {
        if (match.index !== index) {
          throw new TypeError("invalid parameter format");
        }
        index += match[0].length;
        key = match[1].toLowerCase();
        value = match[2];
        if (value[0] === '"') {
          value = value.slice(1, value.length - 1);
          quotedPairRE.test(value) && (value = value.replace(quotedPairRE, "$1"));
        }
        result.parameters[key] = value;
      }
      if (index !== header.length) {
        throw new TypeError("invalid parameter format");
      }
      return result;
    }
    function safeParse2(header) {
      if (typeof header !== "string") {
        return defaultContentType;
      }
      let index = header.indexOf(";");
      const type = index !== -1 ? header.slice(0, index).trim() : header.trim();
      if (mediaTypeRE.test(type) === false) {
        return defaultContentType;
      }
      const result = {
        type: type.toLowerCase(),
        parameters: new NullObject()
      };
      if (index === -1) {
        return result;
      }
      let key;
      let match;
      let value;
      paramRE.lastIndex = index;
      while (match = paramRE.exec(header)) {
        if (match.index !== index) {
          return defaultContentType;
        }
        index += match[0].length;
        key = match[1].toLowerCase();
        value = match[2];
        if (value[0] === '"') {
          value = value.slice(1, value.length - 1);
          quotedPairRE.test(value) && (value = value.replace(quotedPairRE, "$1"));
        }
        result.parameters[key] = value;
      }
      if (index !== header.length) {
        return defaultContentType;
      }
      return result;
    }
    module.exports.default = { parse: parse2, safeParse: safeParse2 };
    module.exports.parse = parse2;
    module.exports.safeParse = safeParse2;
    module.exports.defaultContentType = defaultContentType;
  }
});

// 
function getUserAgent() {
  if (typeof navigator === "object" && "userAgent" in navigator) {
    return navigator.userAgent;
  }
  if (typeof process === "object" && process.version !== void 0) {
    return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
  }
  return "<environment undetectable>";
}

// 
function register(state, name, method, options) {
  if (typeof method !== "function") {
    throw new Error("method for before hook must be a function");
  }
  if (!options) {
    options = {};
  }
  if (Array.isArray(name)) {
    return name.reverse().reduce((callback, name2) => {
      return register.bind(null, state, name2, callback, options);
    }, method)();
  }
  return Promise.resolve().then(() => {
    if (!state.registry[name]) {
      return method(options);
    }
    return state.registry[name].reduce((method2, registered) => {
      return registered.hook.bind(null, method2, options);
    }, method)();
  });
}

// 
function addHook(state, kind, name, hook2) {
  const orig = hook2;
  if (!state.registry[name]) {
    state.registry[name] = [];
  }
  if (kind === "before") {
    hook2 = (method, options) => {
      return Promise.resolve().then(orig.bind(null, options)).then(method.bind(null, options));
    };
  }
  if (kind === "after") {
    hook2 = (method, options) => {
      let result;
      return Promise.resolve().then(method.bind(null, options)).then((result_) => {
        result = result_;
        return orig(result, options);
      }).then(() => {
        return result;
      });
    };
  }
  if (kind === "error") {
    hook2 = (method, options) => {
      return Promise.resolve().then(method.bind(null, options)).catch((error) => {
        return orig(error, options);
      });
    };
  }
  state.registry[name].push({
    hook: hook2,
    orig
  });
}

// 
function removeHook(state, name, method) {
  if (!state.registry[name]) {
    return;
  }
  const index = state.registry[name].map((registered) => {
    return registered.orig;
  }).indexOf(method);
  if (index === -1) {
    return;
  }
  state.registry[name].splice(index, 1);
}

// 
var bind = Function.bind;
var bindable = bind.bind(bind);
function bindApi(hook2, state, name) {
  const removeHookRef = bindable(removeHook, null).apply(
    null,
    name ? [state, name] : [state]
  );
  hook2.api = { remove: removeHookRef };
  hook2.remove = removeHookRef;
  ["before", "error", "after", "wrap"].forEach((kind) => {
    const args = name ? [state, kind, name] : [state, kind];
    hook2[kind] = hook2.api[kind] = bindable(addHook, null).apply(null, args);
  });
}
function Singular() {
  const singularHookName = Symbol("Singular");
  const singularHookState = {
    registry: {}
  };
  const singularHook = register.bind(null, singularHookState, singularHookName);
  bindApi(singularHook, singularHookState, singularHookName);
  return singularHook;
}
function Collection() {
  const state = {
    registry: {}
  };
  const hook2 = register.bind(null, state);
  bindApi(hook2, state);
  return hook2;
}
var before_after_hook_default = { Singular, Collection };

// 
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
    format: ""
  }
};
function lowercaseKeys(object) {
  if (!object) {
    return {};
  }
  return Object.keys(object).reduce((newObj, key) => {
    newObj[key.toLowerCase()] = object[key];
    return newObj;
  }, {});
}
function isPlainObject(value) {
  if (typeof value !== "object" || value === null)
    return false;
  if (Object.prototype.toString.call(value) !== "[object Object]")
    return false;
  const proto = Object.getPrototypeOf(value);
  if (proto === null)
    return true;
  const Ctor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor === "function" && Ctor instanceof Ctor && Function.prototype.call(Ctor) === Function.prototype.call(value);
}
function mergeDeep(defaults, options) {
  const result = Object.assign({}, defaults);
  Object.keys(options).forEach((key) => {
    if (isPlainObject(options[key])) {
      if (!(key in defaults))
        Object.assign(result, { [key]: options[key] });
      else
        result[key] = mergeDeep(defaults[key], options[key]);
    } else {
      Object.assign(result, { [key]: options[key] });
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
    options = Object.assign(url ? { method, url } : { url: method }, options);
  } else {
    options = Object.assign({}, route);
  }
  options.headers = lowercaseKeys(options.headers);
  removeUndefinedProperties(options);
  removeUndefinedProperties(options.headers);
  const mergedOptions = mergeDeep(defaults || {}, options);
  if (options.url === "/graphql") {
    if (defaults && defaults.mediaType.previews?.length) {
      mergedOptions.mediaType.previews = defaults.mediaType.previews.filter(
        (preview) => !mergedOptions.mediaType.previews.includes(preview)
      ).concat(mergedOptions.mediaType.previews);
    }
    mergedOptions.mediaType.previews = (mergedOptions.mediaType.previews || []).map((preview) => preview.replace(/-preview/, ""));
  }
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
var urlVariableRegex = /\{[^{}}]+\}/g;
function removeNonChars(variableName) {
  return variableName.replace(/(?:^\W+)|(?:(?<!\W)\W+$)/g, "").split(/,/);
}
function extractUrlVariableNames(url) {
  const matches = url.match(urlVariableRegex);
  if (!matches) {
    return [];
  }
  return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
}
function omit(object, keysToOmit) {
  const result = { __proto__: null };
  for (const key of Object.keys(object)) {
    if (keysToOmit.indexOf(key) === -1) {
      result[key] = object[key];
    }
  }
  return result;
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
    if (typeof value === "string" || typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") {
      value = value.toString();
      if (modifier && modifier !== "*") {
        value = value.substring(0, parseInt(modifier, 10));
      }
      result.push(
        encodeValue(operator, value, isKeyOperator(operator) ? key : "")
      );
    } else {
      if (modifier === "*") {
        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function(value2) {
            result.push(
              encodeValue(operator, value2, isKeyOperator(operator) ? key : "")
            );
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
  template = template.replace(
    /\{([^\{\}]+)\}|([^\{\}]+)/g,
    function(_, expression, literal) {
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
    }
  );
  if (template === "/") {
    return template;
  } else {
    return template.replace(/\/$/, "");
  }
}
function parse(options) {
  let method = options.method.toUpperCase();
  let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
  let headers = Object.assign({}, options.headers);
  let body;
  let parameters = omit(options, [
    "method",
    "baseUrl",
    "url",
    "headers",
    "request",
    "mediaType"
  ]);
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
      headers.accept = headers.accept.split(/,/).map(
        (format) => format.replace(
          /application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/,
          `application/vnd$1$2.${options.mediaType.format}`
        )
      ).join(",");
    }
    if (url.endsWith("/graphql")) {
      if (options.mediaType.previews?.length) {
        const previewsFromAcceptHeader = headers.accept.match(/(?<![\w-])[\w-]+(?=-preview)/g) || [];
        headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map((preview) => {
          const format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
          return `application/vnd.github.${preview}-preview${format}`;
        }).join(",");
      }
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
      }
    }
  }
  if (!headers["content-type"] && typeof body !== "undefined") {
    headers["content-type"] = "application/json; charset=utf-8";
  }
  if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
    body = "";
  }
  return Object.assign(
    { method, url, headers },
    typeof body !== "undefined" ? { body } : null,
    options.request ? { request: options.request } : null
  );
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
var endpoint = withDefaults(null, DEFAULTS);

// 
var import_fast_content_type_parse = __toESM(require_fast_content_type_parse());

// 
var intRegex = /^-?\d+$/;
var noiseValue = /^-?\d+n+$/;
var originalStringify = JSON.stringify;
var originalParse = JSON.parse;
var customFormat = /^-?\d+n$/;
var bigIntsStringify = /([\[:])?"(-?\d+)n"($|([\\n]|\s)*(\s|[\\n])*[,\}\]])/g;
var noiseStringify = /([\[:])?("-?\d+n+)n("$|"([\\n]|\s)*(\s|[\\n])*[,\}\]])/g;
var JSONStringify = (value, replacer, space) => {
  if ("rawJSON" in JSON) {
    return originalStringify(
      value,
      (key, value2) => {
        if (typeof value2 === "bigint")
          return JSON.rawJSON(value2.toString());
        if (typeof replacer === "function")
          return replacer(key, value2);
        if (Array.isArray(replacer) && replacer.includes(key))
          return value2;
        return value2;
      },
      space
    );
  }
  if (!value)
    return originalStringify(value, replacer, space);
  const convertedToCustomJSON = originalStringify(
    value,
    (key, value2) => {
      const isNoise = typeof value2 === "string" && noiseValue.test(value2);
      if (isNoise)
        return value2.toString() + "n";
      if (typeof value2 === "bigint")
        return value2.toString() + "n";
      if (typeof replacer === "function")
        return replacer(key, value2);
      if (Array.isArray(replacer) && replacer.includes(key))
        return value2;
      return value2;
    },
    space
  );
  const processedJSON = convertedToCustomJSON.replace(
    bigIntsStringify,
    "$1$2$3"
  );
  const denoisedJSON = processedJSON.replace(noiseStringify, "$1$2$3");
  return denoisedJSON;
};
var featureCache = /* @__PURE__ */ new Map();
var isContextSourceSupported = () => {
  const parseFingerprint = JSON.parse.toString();
  if (featureCache.has(parseFingerprint)) {
    return featureCache.get(parseFingerprint);
  }
  try {
    const result = JSON.parse(
      "1",
      (_, __, context) => !!context?.source && context.source === "1"
    );
    featureCache.set(parseFingerprint, result);
    return result;
  } catch {
    featureCache.set(parseFingerprint, false);
    return false;
  }
};
var convertMarkedBigIntsReviver = (key, value, context, userReviver) => {
  const isCustomFormatBigInt = typeof value === "string" && customFormat.test(value);
  if (isCustomFormatBigInt)
    return BigInt(value.slice(0, -1));
  const isNoiseValue = typeof value === "string" && noiseValue.test(value);
  if (isNoiseValue)
    return value.slice(0, -1);
  if (typeof userReviver !== "function")
    return value;
  return userReviver(key, value, context);
};
var JSONParseV2 = (text, reviver) => {
  return JSON.parse(text, (key, value, context) => {
    const isBigNumber = typeof value === "number" && (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER);
    const isInt = context && intRegex.test(context.source);
    const isBigInt = isBigNumber && isInt;
    if (isBigInt)
      return BigInt(context.source);
    if (typeof reviver !== "function")
      return value;
    return reviver(key, value, context);
  });
};
var MAX_INT = Number.MAX_SAFE_INTEGER.toString();
var MAX_DIGITS = MAX_INT.length;
var stringsOrLargeNumbers = /"(?:\\.|[^"])*"|-?(0|[1-9][0-9]*)(\.[0-9]+)?([eE][+-]?[0-9]+)?/g;
var noiseValueWithQuotes = /^"-?\d+n+"$/;
var JSONParse = (text, reviver) => {
  if (!text)
    return originalParse(text, reviver);
  if (isContextSourceSupported())
    return JSONParseV2(text, reviver);
  const serializedData = text.replace(
    stringsOrLargeNumbers,
    (text2, digits, fractional, exponential) => {
      const isString = text2[0] === '"';
      const isNoise = isString && noiseValueWithQuotes.test(text2);
      if (isNoise)
        return text2.substring(0, text2.length - 1) + 'n"';
      const isFractionalOrExponential = fractional || exponential;
      const isLessThanMaxSafeInt = digits && (digits.length < MAX_DIGITS || digits.length === MAX_DIGITS && digits <= MAX_INT);
      if (isString || isFractionalOrExponential || isLessThanMaxSafeInt)
        return text2;
      return '"' + text2 + 'n"';
    }
  );
  return originalParse(
    serializedData,
    (key, value, context) => convertMarkedBigIntsReviver(key, value, context, reviver)
  );
};

// 
var RequestError = class extends Error {
  name;
  /**
   * http status code
   */
  status;
  /**
   * Request options that lead to the error.
   */
  request;
  /**
   * Response object if a response was received
   */
  response;
  constructor(message, statusCode, options) {
    super(message, { cause: options.cause });
    this.name = "HttpError";
    this.status = Number.parseInt(statusCode);
    if (Number.isNaN(this.status)) {
      this.status = 0;
    }
    if ("response" in options) {
      this.response = options.response;
    }
    const requestCopy = Object.assign({}, options.request);
    if (options.request.headers.authorization) {
      requestCopy.headers = Object.assign({}, options.request.headers, {
        authorization: options.request.headers.authorization.replace(
          /(?<! ) .*$/,
          " [REDACTED]"
        )
      });
    }
    requestCopy.url = requestCopy.url.replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]").replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
    this.request = requestCopy;
  }
};

// 
var VERSION2 = "10.0.8";
var defaults_default = {
  headers: {
    "user-agent": `octokit-request.js/${VERSION2} ${getUserAgent()}`
  }
};
function isPlainObject2(value) {
  if (typeof value !== "object" || value === null)
    return false;
  if (Object.prototype.toString.call(value) !== "[object Object]")
    return false;
  const proto = Object.getPrototypeOf(value);
  if (proto === null)
    return true;
  const Ctor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor === "function" && Ctor instanceof Ctor && Function.prototype.call(Ctor) === Function.prototype.call(value);
}
var noop = () => "";
async function fetchWrapper(requestOptions) {
  const fetch = requestOptions.request?.fetch || globalThis.fetch;
  if (!fetch) {
    throw new Error(
      "fetch is not set. Please pass a fetch implementation as new Octokit({ request: { fetch }}). Learn more at https://github.com/octokit/octokit.js/#fetch-missing"
    );
  }
  const log = requestOptions.request?.log || console;
  const parseSuccessResponseBody = requestOptions.request?.parseSuccessResponseBody !== false;
  const body = isPlainObject2(requestOptions.body) || Array.isArray(requestOptions.body) ? JSONStringify(requestOptions.body) : requestOptions.body;
  const requestHeaders = Object.fromEntries(
    Object.entries(requestOptions.headers).map(([name, value]) => [
      name,
      String(value)
    ])
  );
  let fetchResponse;
  try {
    fetchResponse = await fetch(requestOptions.url, {
      method: requestOptions.method,
      body,
      redirect: requestOptions.request?.redirect,
      headers: requestHeaders,
      signal: requestOptions.request?.signal,
      // duplex must be set if request.body is ReadableStream or Async Iterables.
      // See https://fetch.spec.whatwg.org/#dom-requestinit-duplex.
      ...requestOptions.body && { duplex: "half" }
    });
  } catch (error) {
    let message = "Unknown Error";
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        error.status = 500;
        throw error;
      }
      message = error.message;
      if (error.name === "TypeError" && "cause" in error) {
        if (error.cause instanceof Error) {
          message = error.cause.message;
        } else if (typeof error.cause === "string") {
          message = error.cause;
        }
      }
    }
    const requestError = new RequestError(message, 500, {
      request: requestOptions
    });
    requestError.cause = error;
    throw requestError;
  }
  const status = fetchResponse.status;
  const url = fetchResponse.url;
  const responseHeaders = {};
  for (const [key, value] of fetchResponse.headers) {
    responseHeaders[key] = value;
  }
  const octokitResponse = {
    url,
    status,
    headers: responseHeaders,
    data: ""
  };
  if ("deprecation" in responseHeaders) {
    const matches = responseHeaders.link && responseHeaders.link.match(/<([^<>]+)>; rel="deprecation"/);
    const deprecationLink = matches && matches.pop();
    log.warn(
      `[@octokit/request] "${requestOptions.method} ${requestOptions.url}" is deprecated. It is scheduled to be removed on ${responseHeaders.sunset}${deprecationLink ? `. See ${deprecationLink}` : ""}`
    );
  }
  if (status === 204 || status === 205) {
    return octokitResponse;
  }
  if (requestOptions.method === "HEAD") {
    if (status < 400) {
      return octokitResponse;
    }
    throw new RequestError(fetchResponse.statusText, status, {
      response: octokitResponse,
      request: requestOptions
    });
  }
  if (status === 304) {
    octokitResponse.data = await getResponseData(fetchResponse);
    throw new RequestError("Not modified", status, {
      response: octokitResponse,
      request: requestOptions
    });
  }
  if (status >= 400) {
    octokitResponse.data = await getResponseData(fetchResponse);
    throw new RequestError(toErrorMessage(octokitResponse.data), status, {
      response: octokitResponse,
      request: requestOptions
    });
  }
  octokitResponse.data = parseSuccessResponseBody ? await getResponseData(fetchResponse) : fetchResponse.body;
  return octokitResponse;
}
async function getResponseData(response) {
  const contentType = response.headers.get("content-type");
  if (!contentType) {
    return response.text().catch(noop);
  }
  const mimetype = (0, import_fast_content_type_parse.safeParse)(contentType);
  if (isJSONResponse(mimetype)) {
    let text = "";
    try {
      text = await response.text();
      return JSONParse(text);
    } catch (err) {
      return text;
    }
  } else if (mimetype.type.startsWith("text/") || mimetype.parameters.charset?.toLowerCase() === "utf-8") {
    return response.text().catch(noop);
  } else {
    return response.arrayBuffer().catch(
      /* v8 ignore next -- @preserve */
      () => new ArrayBuffer(0)
    );
  }
}
function isJSONResponse(mimetype) {
  return mimetype.type === "application/json" || mimetype.type === "application/scim+json";
}
function toErrorMessage(data) {
  if (typeof data === "string") {
    return data;
  }
  if (data instanceof ArrayBuffer) {
    return "Unknown error";
  }
  if ("message" in data) {
    const suffix = "documentation_url" in data ? ` - ${data.documentation_url}` : "";
    return Array.isArray(data.errors) ? `${data.message}: ${data.errors.map((v) => JSON.stringify(v)).join(", ")}${suffix}` : `${data.message}${suffix}`;
  }
  return `Unknown error: ${JSON.stringify(data)}`;
}
function withDefaults2(oldEndpoint, newDefaults) {
  const endpoint2 = oldEndpoint.defaults(newDefaults);
  const newApi = function(route, parameters) {
    const endpointOptions = endpoint2.merge(route, parameters);
    if (!endpointOptions.request || !endpointOptions.request.hook) {
      return fetchWrapper(endpoint2.parse(endpointOptions));
    }
    const request2 = (route2, parameters2) => {
      return fetchWrapper(
        endpoint2.parse(endpoint2.merge(route2, parameters2))
      );
    };
    Object.assign(request2, {
      endpoint: endpoint2,
      defaults: withDefaults2.bind(null, endpoint2)
    });
    return endpointOptions.request.hook(request2, endpointOptions);
  };
  return Object.assign(newApi, {
    endpoint: endpoint2,
    defaults: withDefaults2.bind(null, endpoint2)
  });
}
var request = withDefaults2(endpoint, defaults_default);

// 
var VERSION3 = "0.0.0-development";
function _buildMessageForResponseErrors(data) {
  return `Request failed due to following response errors:
` + data.errors.map((e) => ` - ${e.message}`).join("\n");
}
var GraphqlResponseError = class extends Error {
  constructor(request2, headers, response) {
    super(_buildMessageForResponseErrors(response));
    this.request = request2;
    this.headers = headers;
    this.response = response;
    this.errors = response.errors;
    this.data = response.data;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  name = "GraphqlResponseError";
  errors;
  data;
};
var NON_VARIABLE_OPTIONS = [
  "method",
  "baseUrl",
  "url",
  "headers",
  "request",
  "query",
  "mediaType",
  "operationName"
];
var FORBIDDEN_VARIABLE_OPTIONS = ["query", "method", "url"];
var GHES_V3_SUFFIX_REGEX = /\/api\/v3\/?$/;
function graphql(request2, query, options) {
  if (options) {
    if (typeof query === "string" && "query" in options) {
      return Promise.reject(
        new Error(`[@octokit/graphql] "query" cannot be used as variable name`)
      );
    }
    for (const key in options) {
      if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key))
        continue;
      return Promise.reject(
        new Error(
          `[@octokit/graphql] "${key}" cannot be used as variable name`
        )
      );
    }
  }
  const parsedOptions = typeof query === "string" ? Object.assign({ query }, options) : query;
  const requestOptions = Object.keys(
    parsedOptions
  ).reduce((result, key) => {
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
      throw new GraphqlResponseError(
        requestOptions,
        headers,
        response.data
      );
    }
    return response.data.data;
  });
}
function withDefaults3(request2, newDefaults) {
  const newRequest = request2.defaults(newDefaults);
  const newApi = (query, options) => {
    return graphql(newRequest, query, options);
  };
  return Object.assign(newApi, {
    defaults: withDefaults3.bind(null, newRequest),
    endpoint: newRequest.endpoint
  });
}
var graphql2 = withDefaults3(request, {
  headers: {
    "user-agent": `octokit-graphql.js/${VERSION3} ${getUserAgent()}`
  },
  method: "POST",
  url: "/graphql"
});
function withCustomRequest(customRequest) {
  return withDefaults3(customRequest, {
    method: "POST",
    url: "/graphql"
  });
}

// 
var b64url = "(?:[a-zA-Z0-9_-]+)";
var sep = "\\.";
var jwtRE = new RegExp(`^${b64url}${sep}${b64url}${sep}${b64url}$`);
var isJWT = jwtRE.test.bind(jwtRE);
async function auth(token) {
  const isApp = isJWT(token);
  const isInstallation = token.startsWith("v1.") || token.startsWith("ghs_");
  const isUserToServer = token.startsWith("ghu_");
  const tokenType = isApp ? "app" : isInstallation ? "installation" : isUserToServer ? "user-to-server" : "oauth";
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
async function hook(token, request2, route, parameters) {
  const endpoint2 = request2.endpoint.merge(
    route,
    parameters
  );
  endpoint2.headers.authorization = withAuthorizationPrefix(token);
  return request2(endpoint2);
}
var createTokenAuth = function createTokenAuth2(token) {
  if (!token) {
    throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
  }
  if (typeof token !== "string") {
    throw new Error(
      "[@octokit/auth-token] Token passed to createTokenAuth is not a string"
    );
  }
  token = token.replace(/^(token|bearer) +/i, "");
  return Object.assign(auth.bind(null, token), {
    hook: hook.bind(null, token)
  });
};

// 
var VERSION4 = "7.0.6";

// 
var noop2 = () => {
};
var consoleWarn = console.warn.bind(console);
var consoleError = console.error.bind(console);
function createLogger(logger = {}) {
  if (typeof logger.debug !== "function") {
    logger.debug = noop2;
  }
  if (typeof logger.info !== "function") {
    logger.info = noop2;
  }
  if (typeof logger.warn !== "function") {
    logger.warn = consoleWarn;
  }
  if (typeof logger.error !== "function") {
    logger.error = consoleError;
  }
  return logger;
}
var userAgentTrail = `octokit-core.js/${VERSION4} ${getUserAgent()}`;
var Octokit = class {
  static VERSION = VERSION4;
  static defaults(defaults) {
    const OctokitWithDefaults = class extends this {
      constructor(...args) {
        const options = args[0] || {};
        if (typeof defaults === "function") {
          super(defaults(options));
          return;
        }
        super(
          Object.assign(
            {},
            defaults,
            options,
            options.userAgent && defaults.userAgent ? {
              userAgent: `${options.userAgent} ${defaults.userAgent}`
            } : null
          )
        );
      }
    };
    return OctokitWithDefaults;
  }
  static plugins = [];
  /**
   * Attach a plugin (or many) to your Octokit instance.
   *
   * @example
   * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
   */
  static plugin(...newPlugins) {
    const currentPlugins = this.plugins;
    const NewOctokit = class extends this {
      static plugins = currentPlugins.concat(
        newPlugins.filter((plugin) => !currentPlugins.includes(plugin))
      );
    };
    return NewOctokit;
  }
  constructor(options = {}) {
    const hook2 = new before_after_hook_default.Collection();
    const requestDefaults = {
      baseUrl: request.endpoint.DEFAULTS.baseUrl,
      headers: {},
      request: Object.assign({}, options.request, {
        // @ts-ignore internal usage only, no need to type
        hook: hook2.bind(null, "request")
      }),
      mediaType: {
        previews: [],
        format: ""
      }
    };
    requestDefaults.headers["user-agent"] = options.userAgent ? `${options.userAgent} ${userAgentTrail}` : userAgentTrail;
    if (options.baseUrl) {
      requestDefaults.baseUrl = options.baseUrl;
    }
    if (options.previews) {
      requestDefaults.mediaType.previews = options.previews;
    }
    if (options.timeZone) {
      requestDefaults.headers["time-zone"] = options.timeZone;
    }
    this.request = request.defaults(requestDefaults);
    this.graphql = withCustomRequest(this.request).defaults(requestDefaults);
    this.log = createLogger(options.log);
    this.hook = hook2;
    if (!options.authStrategy) {
      if (!options.auth) {
        this.auth = async () => ({
          type: "unauthenticated"
        });
      } else {
        const auth2 = createTokenAuth(options.auth);
        hook2.wrap("request", auth2.hook);
        this.auth = auth2;
      }
    } else {
      const { authStrategy, ...otherOptions } = options;
      const auth2 = authStrategy(
        Object.assign(
          {
            request: this.request,
            log: this.log,
            // we pass the current octokit instance as well as its constructor options
            // to allow for authentication strategies that return a new octokit instance
            // that shares the same internal state as the current one. The original
            // requirement for this was the "event-octokit" authentication strategy
            // of https://github.com/probot/octokit-auth-probot.
            octokit: this,
            octokitOptions: otherOptions
          },
          options.auth
        )
      );
      hook2.wrap("request", auth2.hook);
      this.auth = auth2;
    }
    const classConstructor = this.constructor;
    for (let i = 0; i < classConstructor.plugins.length; ++i) {
      Object.assign(this, classConstructor.plugins[i](this, options));
    }
  }
  // assigned during constructor
  request;
  graphql;
  log;
  hook;
  // TODO: type `octokit.auth` based on passed options.authStrategy
  auth;
};

// 
var VERSION5 = "6.0.0";

// 
function requestLog(octokit) {
  octokit.hook.wrap("request", (request2, options) => {
    octokit.log.debug("request", options);
    const start = Date.now();
    const requestOptions = octokit.request.endpoint.parse(options);
    const path = requestOptions.url.replace(options.baseUrl, "");
    return request2(options).then((response) => {
      const requestId = response.headers["x-github-request-id"];
      octokit.log.info(
        `${requestOptions.method} ${path} - ${response.status} with id ${requestId} in ${Date.now() - start}ms`
      );
      return response;
    }).catch((error) => {
      const requestId = error.response?.headers["x-github-request-id"] || "UNKNOWN";
      octokit.log.error(
        `${requestOptions.method} ${path} - ${error.status} with id ${requestId} in ${Date.now() - start}ms`
      );
      throw error;
    });
  });
}
requestLog.VERSION = VERSION5;

// 
var VERSION6 = "0.0.0-development";
function normalizePaginatedListResponse(response) {
  if (!response.data) {
    return {
      ...response,
      data: []
    };
  }
  const responseNeedsNormalization = ("total_count" in response.data || "total_commits" in response.data) && !("url" in response.data);
  if (!responseNeedsNormalization)
    return response;
  const incompleteResults = response.data.incomplete_results;
  const repositorySelection = response.data.repository_selection;
  const totalCount = response.data.total_count;
  const totalCommits = response.data.total_commits;
  delete response.data.incomplete_results;
  delete response.data.repository_selection;
  delete response.data.total_count;
  delete response.data.total_commits;
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
  response.data.total_commits = totalCommits;
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
          return { done: true };
        try {
          const response = await requestMethod({ method, url, headers });
          const normalizedResponse = normalizePaginatedListResponse(response);
          url = ((normalizedResponse.headers.link || "").match(
            /<([^<>]+)>;\s*rel="next"/
          ) || [])[1];
          if (!url && "total_commits" in normalizedResponse.data) {
            const parsedUrl = new URL(normalizedResponse.url);
            const params = parsedUrl.searchParams;
            const page = parseInt(params.get("page") || "1", 10);
            const per_page = parseInt(params.get("per_page") || "250", 10);
            if (page * per_page < normalizedResponse.data.total_commits) {
              params.set("page", String(page + 1));
              url = parsedUrl.toString();
            }
          }
          return { value: normalizedResponse };
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
  return gather(
    octokit,
    [],
    iterator(octokit, route, parameters)[Symbol.asyncIterator](),
    mapFn
  );
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
    results = results.concat(
      mapFn ? mapFn(result.value, done) : result.value.data
    );
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
paginateRest.VERSION = VERSION6;

// 
var VERSION7 = "17.0.0";

// 
var Endpoints = {
  actions: {
    addCustomLabelsToSelfHostedRunnerForOrg: [
      "POST /orgs/{org}/actions/runners/{runner_id}/labels"
    ],
    addCustomLabelsToSelfHostedRunnerForRepo: [
      "POST /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"
    ],
    addRepoAccessToSelfHostedRunnerGroupInOrg: [
      "PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}"
    ],
    addSelectedRepoToOrgSecret: [
      "PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"
    ],
    addSelectedRepoToOrgVariable: [
      "PUT /orgs/{org}/actions/variables/{name}/repositories/{repository_id}"
    ],
    approveWorkflowRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve"
    ],
    cancelWorkflowRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"
    ],
    createEnvironmentVariable: [
      "POST /repos/{owner}/{repo}/environments/{environment_name}/variables"
    ],
    createHostedRunnerForOrg: ["POST /orgs/{org}/actions/hosted-runners"],
    createOrUpdateEnvironmentSecret: [
      "PUT /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"
    ],
    createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
    createOrUpdateRepoSecret: [
      "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"
    ],
    createOrgVariable: ["POST /orgs/{org}/actions/variables"],
    createRegistrationTokenForOrg: [
      "POST /orgs/{org}/actions/runners/registration-token"
    ],
    createRegistrationTokenForRepo: [
      "POST /repos/{owner}/{repo}/actions/runners/registration-token"
    ],
    createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
    createRemoveTokenForRepo: [
      "POST /repos/{owner}/{repo}/actions/runners/remove-token"
    ],
    createRepoVariable: ["POST /repos/{owner}/{repo}/actions/variables"],
    createWorkflowDispatch: [
      "POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"
    ],
    deleteActionsCacheById: [
      "DELETE /repos/{owner}/{repo}/actions/caches/{cache_id}"
    ],
    deleteActionsCacheByKey: [
      "DELETE /repos/{owner}/{repo}/actions/caches{?key,ref}"
    ],
    deleteArtifact: [
      "DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"
    ],
    deleteCustomImageFromOrg: [
      "DELETE /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}"
    ],
    deleteCustomImageVersionFromOrg: [
      "DELETE /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version}"
    ],
    deleteEnvironmentSecret: [
      "DELETE /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"
    ],
    deleteEnvironmentVariable: [
      "DELETE /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"
    ],
    deleteHostedRunnerForOrg: [
      "DELETE /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"
    ],
    deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
    deleteOrgVariable: ["DELETE /orgs/{org}/actions/variables/{name}"],
    deleteRepoSecret: [
      "DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}"
    ],
    deleteRepoVariable: [
      "DELETE /repos/{owner}/{repo}/actions/variables/{name}"
    ],
    deleteSelfHostedRunnerFromOrg: [
      "DELETE /orgs/{org}/actions/runners/{runner_id}"
    ],
    deleteSelfHostedRunnerFromRepo: [
      "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"
    ],
    deleteWorkflowRun: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],
    deleteWorkflowRunLogs: [
      "DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"
    ],
    disableSelectedRepositoryGithubActionsOrganization: [
      "DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}"
    ],
    disableWorkflow: [
      "PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable"
    ],
    downloadArtifact: [
      "GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}"
    ],
    downloadJobLogsForWorkflowRun: [
      "GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"
    ],
    downloadWorkflowRunAttemptLogs: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs"
    ],
    downloadWorkflowRunLogs: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"
    ],
    enableSelectedRepositoryGithubActionsOrganization: [
      "PUT /orgs/{org}/actions/permissions/repositories/{repository_id}"
    ],
    enableWorkflow: [
      "PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable"
    ],
    forceCancelWorkflowRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/force-cancel"
    ],
    generateRunnerJitconfigForOrg: [
      "POST /orgs/{org}/actions/runners/generate-jitconfig"
    ],
    generateRunnerJitconfigForRepo: [
      "POST /repos/{owner}/{repo}/actions/runners/generate-jitconfig"
    ],
    getActionsCacheList: ["GET /repos/{owner}/{repo}/actions/caches"],
    getActionsCacheUsage: ["GET /repos/{owner}/{repo}/actions/cache/usage"],
    getActionsCacheUsageByRepoForOrg: [
      "GET /orgs/{org}/actions/cache/usage-by-repository"
    ],
    getActionsCacheUsageForOrg: ["GET /orgs/{org}/actions/cache/usage"],
    getAllowedActionsOrganization: [
      "GET /orgs/{org}/actions/permissions/selected-actions"
    ],
    getAllowedActionsRepository: [
      "GET /repos/{owner}/{repo}/actions/permissions/selected-actions"
    ],
    getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
    getCustomImageForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}"
    ],
    getCustomImageVersionForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version}"
    ],
    getCustomOidcSubClaimForRepo: [
      "GET /repos/{owner}/{repo}/actions/oidc/customization/sub"
    ],
    getEnvironmentPublicKey: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/public-key"
    ],
    getEnvironmentSecret: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"
    ],
    getEnvironmentVariable: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"
    ],
    getGithubActionsDefaultWorkflowPermissionsOrganization: [
      "GET /orgs/{org}/actions/permissions/workflow"
    ],
    getGithubActionsDefaultWorkflowPermissionsRepository: [
      "GET /repos/{owner}/{repo}/actions/permissions/workflow"
    ],
    getGithubActionsPermissionsOrganization: [
      "GET /orgs/{org}/actions/permissions"
    ],
    getGithubActionsPermissionsRepository: [
      "GET /repos/{owner}/{repo}/actions/permissions"
    ],
    getHostedRunnerForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"
    ],
    getHostedRunnersGithubOwnedImagesForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/images/github-owned"
    ],
    getHostedRunnersLimitsForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/limits"
    ],
    getHostedRunnersMachineSpecsForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/machine-sizes"
    ],
    getHostedRunnersPartnerImagesForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/images/partner"
    ],
    getHostedRunnersPlatformsForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/platforms"
    ],
    getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
    getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
    getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
    getOrgVariable: ["GET /orgs/{org}/actions/variables/{name}"],
    getPendingDeploymentsForRun: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"
    ],
    getRepoPermissions: [
      "GET /repos/{owner}/{repo}/actions/permissions",
      {},
      { renamed: ["actions", "getGithubActionsPermissionsRepository"] }
    ],
    getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
    getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
    getRepoVariable: ["GET /repos/{owner}/{repo}/actions/variables/{name}"],
    getReviewsForRun: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals"
    ],
    getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
    getSelfHostedRunnerForRepo: [
      "GET /repos/{owner}/{repo}/actions/runners/{runner_id}"
    ],
    getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
    getWorkflowAccessToRepository: [
      "GET /repos/{owner}/{repo}/actions/permissions/access"
    ],
    getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
    getWorkflowRunAttempt: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}"
    ],
    getWorkflowRunUsage: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"
    ],
    getWorkflowUsage: [
      "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"
    ],
    listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
    listCustomImageVersionsForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions"
    ],
    listCustomImagesForOrg: [
      "GET /orgs/{org}/actions/hosted-runners/images/custom"
    ],
    listEnvironmentSecrets: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/secrets"
    ],
    listEnvironmentVariables: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/variables"
    ],
    listGithubHostedRunnersInGroupForOrg: [
      "GET /orgs/{org}/actions/runner-groups/{runner_group_id}/hosted-runners"
    ],
    listHostedRunnersForOrg: ["GET /orgs/{org}/actions/hosted-runners"],
    listJobsForWorkflowRun: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"
    ],
    listJobsForWorkflowRunAttempt: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs"
    ],
    listLabelsForSelfHostedRunnerForOrg: [
      "GET /orgs/{org}/actions/runners/{runner_id}/labels"
    ],
    listLabelsForSelfHostedRunnerForRepo: [
      "GET /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"
    ],
    listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
    listOrgVariables: ["GET /orgs/{org}/actions/variables"],
    listRepoOrganizationSecrets: [
      "GET /repos/{owner}/{repo}/actions/organization-secrets"
    ],
    listRepoOrganizationVariables: [
      "GET /repos/{owner}/{repo}/actions/organization-variables"
    ],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
    listRepoVariables: ["GET /repos/{owner}/{repo}/actions/variables"],
    listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
    listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
    listRunnerApplicationsForRepo: [
      "GET /repos/{owner}/{repo}/actions/runners/downloads"
    ],
    listSelectedReposForOrgSecret: [
      "GET /orgs/{org}/actions/secrets/{secret_name}/repositories"
    ],
    listSelectedReposForOrgVariable: [
      "GET /orgs/{org}/actions/variables/{name}/repositories"
    ],
    listSelectedRepositoriesEnabledGithubActionsOrganization: [
      "GET /orgs/{org}/actions/permissions/repositories"
    ],
    listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
    listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
    listWorkflowRunArtifacts: [
      "GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"
    ],
    listWorkflowRuns: [
      "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"
    ],
    listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
    reRunJobForWorkflowRun: [
      "POST /repos/{owner}/{repo}/actions/jobs/{job_id}/rerun"
    ],
    reRunWorkflow: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun"],
    reRunWorkflowFailedJobs: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs"
    ],
    removeAllCustomLabelsFromSelfHostedRunnerForOrg: [
      "DELETE /orgs/{org}/actions/runners/{runner_id}/labels"
    ],
    removeAllCustomLabelsFromSelfHostedRunnerForRepo: [
      "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"
    ],
    removeCustomLabelFromSelfHostedRunnerForOrg: [
      "DELETE /orgs/{org}/actions/runners/{runner_id}/labels/{name}"
    ],
    removeCustomLabelFromSelfHostedRunnerForRepo: [
      "DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels/{name}"
    ],
    removeSelectedRepoFromOrgSecret: [
      "DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"
    ],
    removeSelectedRepoFromOrgVariable: [
      "DELETE /orgs/{org}/actions/variables/{name}/repositories/{repository_id}"
    ],
    reviewCustomGatesForRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/deployment_protection_rule"
    ],
    reviewPendingDeploymentsForRun: [
      "POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"
    ],
    setAllowedActionsOrganization: [
      "PUT /orgs/{org}/actions/permissions/selected-actions"
    ],
    setAllowedActionsRepository: [
      "PUT /repos/{owner}/{repo}/actions/permissions/selected-actions"
    ],
    setCustomLabelsForSelfHostedRunnerForOrg: [
      "PUT /orgs/{org}/actions/runners/{runner_id}/labels"
    ],
    setCustomLabelsForSelfHostedRunnerForRepo: [
      "PUT /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"
    ],
    setCustomOidcSubClaimForRepo: [
      "PUT /repos/{owner}/{repo}/actions/oidc/customization/sub"
    ],
    setGithubActionsDefaultWorkflowPermissionsOrganization: [
      "PUT /orgs/{org}/actions/permissions/workflow"
    ],
    setGithubActionsDefaultWorkflowPermissionsRepository: [
      "PUT /repos/{owner}/{repo}/actions/permissions/workflow"
    ],
    setGithubActionsPermissionsOrganization: [
      "PUT /orgs/{org}/actions/permissions"
    ],
    setGithubActionsPermissionsRepository: [
      "PUT /repos/{owner}/{repo}/actions/permissions"
    ],
    setSelectedReposForOrgSecret: [
      "PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"
    ],
    setSelectedReposForOrgVariable: [
      "PUT /orgs/{org}/actions/variables/{name}/repositories"
    ],
    setSelectedRepositoriesEnabledGithubActionsOrganization: [
      "PUT /orgs/{org}/actions/permissions/repositories"
    ],
    setWorkflowAccessToRepository: [
      "PUT /repos/{owner}/{repo}/actions/permissions/access"
    ],
    updateEnvironmentVariable: [
      "PATCH /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"
    ],
    updateHostedRunnerForOrg: [
      "PATCH /orgs/{org}/actions/hosted-runners/{hosted_runner_id}"
    ],
    updateOrgVariable: ["PATCH /orgs/{org}/actions/variables/{name}"],
    updateRepoVariable: [
      "PATCH /repos/{owner}/{repo}/actions/variables/{name}"
    ]
  },
  activity: {
    checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
    deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
    deleteThreadSubscription: [
      "DELETE /notifications/threads/{thread_id}/subscription"
    ],
    getFeeds: ["GET /feeds"],
    getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
    getThread: ["GET /notifications/threads/{thread_id}"],
    getThreadSubscriptionForAuthenticatedUser: [
      "GET /notifications/threads/{thread_id}/subscription"
    ],
    listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
    listNotificationsForAuthenticatedUser: ["GET /notifications"],
    listOrgEventsForAuthenticatedUser: [
      "GET /users/{username}/events/orgs/{org}"
    ],
    listPublicEvents: ["GET /events"],
    listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
    listPublicEventsForUser: ["GET /users/{username}/events/public"],
    listPublicOrgEvents: ["GET /orgs/{org}/events"],
    listReceivedEventsForUser: ["GET /users/{username}/received_events"],
    listReceivedPublicEventsForUser: [
      "GET /users/{username}/received_events/public"
    ],
    listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
    listRepoNotificationsForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/notifications"
    ],
    listReposStarredByAuthenticatedUser: ["GET /user/starred"],
    listReposStarredByUser: ["GET /users/{username}/starred"],
    listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
    listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
    listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
    listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
    markNotificationsAsRead: ["PUT /notifications"],
    markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
    markThreadAsDone: ["DELETE /notifications/threads/{thread_id}"],
    markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
    setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
    setThreadSubscription: [
      "PUT /notifications/threads/{thread_id}/subscription"
    ],
    starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
    unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"]
  },
  apps: {
    addRepoToInstallation: [
      "PUT /user/installations/{installation_id}/repositories/{repository_id}",
      {},
      { renamed: ["apps", "addRepoToInstallationForAuthenticatedUser"] }
    ],
    addRepoToInstallationForAuthenticatedUser: [
      "PUT /user/installations/{installation_id}/repositories/{repository_id}"
    ],
    checkToken: ["POST /applications/{client_id}/token"],
    createFromManifest: ["POST /app-manifests/{code}/conversions"],
    createInstallationAccessToken: [
      "POST /app/installations/{installation_id}/access_tokens"
    ],
    deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
    deleteInstallation: ["DELETE /app/installations/{installation_id}"],
    deleteToken: ["DELETE /applications/{client_id}/token"],
    getAuthenticated: ["GET /app"],
    getBySlug: ["GET /apps/{app_slug}"],
    getInstallation: ["GET /app/installations/{installation_id}"],
    getOrgInstallation: ["GET /orgs/{org}/installation"],
    getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
    getSubscriptionPlanForAccount: [
      "GET /marketplace_listing/accounts/{account_id}"
    ],
    getSubscriptionPlanForAccountStubbed: [
      "GET /marketplace_listing/stubbed/accounts/{account_id}"
    ],
    getUserInstallation: ["GET /users/{username}/installation"],
    getWebhookConfigForApp: ["GET /app/hook/config"],
    getWebhookDelivery: ["GET /app/hook/deliveries/{delivery_id}"],
    listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
    listAccountsForPlanStubbed: [
      "GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"
    ],
    listInstallationReposForAuthenticatedUser: [
      "GET /user/installations/{installation_id}/repositories"
    ],
    listInstallationRequestsForAuthenticatedApp: [
      "GET /app/installation-requests"
    ],
    listInstallations: ["GET /app/installations"],
    listInstallationsForAuthenticatedUser: ["GET /user/installations"],
    listPlans: ["GET /marketplace_listing/plans"],
    listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
    listReposAccessibleToInstallation: ["GET /installation/repositories"],
    listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
    listSubscriptionsForAuthenticatedUserStubbed: [
      "GET /user/marketplace_purchases/stubbed"
    ],
    listWebhookDeliveries: ["GET /app/hook/deliveries"],
    redeliverWebhookDelivery: [
      "POST /app/hook/deliveries/{delivery_id}/attempts"
    ],
    removeRepoFromInstallation: [
      "DELETE /user/installations/{installation_id}/repositories/{repository_id}",
      {},
      { renamed: ["apps", "removeRepoFromInstallationForAuthenticatedUser"] }
    ],
    removeRepoFromInstallationForAuthenticatedUser: [
      "DELETE /user/installations/{installation_id}/repositories/{repository_id}"
    ],
    resetToken: ["PATCH /applications/{client_id}/token"],
    revokeInstallationAccessToken: ["DELETE /installation/token"],
    scopeToken: ["POST /applications/{client_id}/token/scoped"],
    suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
    unsuspendInstallation: [
      "DELETE /app/installations/{installation_id}/suspended"
    ],
    updateWebhookConfigForApp: ["PATCH /app/hook/config"]
  },
  billing: {
    getGithubActionsBillingOrg: ["GET /orgs/{org}/settings/billing/actions"],
    getGithubActionsBillingUser: [
      "GET /users/{username}/settings/billing/actions"
    ],
    getGithubBillingPremiumRequestUsageReportOrg: [
      "GET /organizations/{org}/settings/billing/premium_request/usage"
    ],
    getGithubBillingPremiumRequestUsageReportUser: [
      "GET /users/{username}/settings/billing/premium_request/usage"
    ],
    getGithubBillingUsageReportOrg: [
      "GET /organizations/{org}/settings/billing/usage"
    ],
    getGithubBillingUsageReportUser: [
      "GET /users/{username}/settings/billing/usage"
    ],
    getGithubPackagesBillingOrg: ["GET /orgs/{org}/settings/billing/packages"],
    getGithubPackagesBillingUser: [
      "GET /users/{username}/settings/billing/packages"
    ],
    getSharedStorageBillingOrg: [
      "GET /orgs/{org}/settings/billing/shared-storage"
    ],
    getSharedStorageBillingUser: [
      "GET /users/{username}/settings/billing/shared-storage"
    ]
  },
  campaigns: {
    createCampaign: ["POST /orgs/{org}/campaigns"],
    deleteCampaign: ["DELETE /orgs/{org}/campaigns/{campaign_number}"],
    getCampaignSummary: ["GET /orgs/{org}/campaigns/{campaign_number}"],
    listOrgCampaigns: ["GET /orgs/{org}/campaigns"],
    updateCampaign: ["PATCH /orgs/{org}/campaigns/{campaign_number}"]
  },
  checks: {
    create: ["POST /repos/{owner}/{repo}/check-runs"],
    createSuite: ["POST /repos/{owner}/{repo}/check-suites"],
    get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}"],
    getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}"],
    listAnnotations: [
      "GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations"
    ],
    listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"],
    listForSuite: [
      "GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs"
    ],
    listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites"],
    rerequestRun: [
      "POST /repos/{owner}/{repo}/check-runs/{check_run_id}/rerequest"
    ],
    rerequestSuite: [
      "POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest"
    ],
    setSuitesPreferences: [
      "PATCH /repos/{owner}/{repo}/check-suites/preferences"
    ],
    update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}"]
  },
  codeScanning: {
    commitAutofix: [
      "POST /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix/commits"
    ],
    createAutofix: [
      "POST /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix"
    ],
    createVariantAnalysis: [
      "POST /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses"
    ],
    deleteAnalysis: [
      "DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}{?confirm_delete}"
    ],
    deleteCodeqlDatabase: [
      "DELETE /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}"
    ],
    getAlert: [
      "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}",
      {},
      { renamedParameters: { alert_id: "alert_number" } }
    ],
    getAnalysis: [
      "GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}"
    ],
    getAutofix: [
      "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix"
    ],
    getCodeqlDatabase: [
      "GET /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}"
    ],
    getDefaultSetup: ["GET /repos/{owner}/{repo}/code-scanning/default-setup"],
    getSarif: ["GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}"],
    getVariantAnalysis: [
      "GET /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}"
    ],
    getVariantAnalysisRepoTask: [
      "GET /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}/repos/{repo_owner}/{repo_name}"
    ],
    listAlertInstances: [
      "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances"
    ],
    listAlertsForOrg: ["GET /orgs/{org}/code-scanning/alerts"],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"],
    listAlertsInstances: [
      "GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",
      {},
      { renamed: ["codeScanning", "listAlertInstances"] }
    ],
    listCodeqlDatabases: [
      "GET /repos/{owner}/{repo}/code-scanning/codeql/databases"
    ],
    listRecentAnalyses: ["GET /repos/{owner}/{repo}/code-scanning/analyses"],
    updateAlert: [
      "PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}"
    ],
    updateDefaultSetup: [
      "PATCH /repos/{owner}/{repo}/code-scanning/default-setup"
    ],
    uploadSarif: ["POST /repos/{owner}/{repo}/code-scanning/sarifs"]
  },
  codeSecurity: {
    attachConfiguration: [
      "POST /orgs/{org}/code-security/configurations/{configuration_id}/attach"
    ],
    attachEnterpriseConfiguration: [
      "POST /enterprises/{enterprise}/code-security/configurations/{configuration_id}/attach"
    ],
    createConfiguration: ["POST /orgs/{org}/code-security/configurations"],
    createConfigurationForEnterprise: [
      "POST /enterprises/{enterprise}/code-security/configurations"
    ],
    deleteConfiguration: [
      "DELETE /orgs/{org}/code-security/configurations/{configuration_id}"
    ],
    deleteConfigurationForEnterprise: [
      "DELETE /enterprises/{enterprise}/code-security/configurations/{configuration_id}"
    ],
    detachConfiguration: [
      "DELETE /orgs/{org}/code-security/configurations/detach"
    ],
    getConfiguration: [
      "GET /orgs/{org}/code-security/configurations/{configuration_id}"
    ],
    getConfigurationForRepository: [
      "GET /repos/{owner}/{repo}/code-security-configuration"
    ],
    getConfigurationsForEnterprise: [
      "GET /enterprises/{enterprise}/code-security/configurations"
    ],
    getConfigurationsForOrg: ["GET /orgs/{org}/code-security/configurations"],
    getDefaultConfigurations: [
      "GET /orgs/{org}/code-security/configurations/defaults"
    ],
    getDefaultConfigurationsForEnterprise: [
      "GET /enterprises/{enterprise}/code-security/configurations/defaults"
    ],
    getRepositoriesForConfiguration: [
      "GET /orgs/{org}/code-security/configurations/{configuration_id}/repositories"
    ],
    getRepositoriesForEnterpriseConfiguration: [
      "GET /enterprises/{enterprise}/code-security/configurations/{configuration_id}/repositories"
    ],
    getSingleConfigurationForEnterprise: [
      "GET /enterprises/{enterprise}/code-security/configurations/{configuration_id}"
    ],
    setConfigurationAsDefault: [
      "PUT /orgs/{org}/code-security/configurations/{configuration_id}/defaults"
    ],
    setConfigurationAsDefaultForEnterprise: [
      "PUT /enterprises/{enterprise}/code-security/configurations/{configuration_id}/defaults"
    ],
    updateConfiguration: [
      "PATCH /orgs/{org}/code-security/configurations/{configuration_id}"
    ],
    updateEnterpriseConfiguration: [
      "PATCH /enterprises/{enterprise}/code-security/configurations/{configuration_id}"
    ]
  },
  codesOfConduct: {
    getAllCodesOfConduct: ["GET /codes_of_conduct"],
    getConductCode: ["GET /codes_of_conduct/{key}"]
  },
  codespaces: {
    addRepositoryForSecretForAuthenticatedUser: [
      "PUT /user/codespaces/secrets/{secret_name}/repositories/{repository_id}"
    ],
    addSelectedRepoToOrgSecret: [
      "PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}"
    ],
    checkPermissionsForDevcontainer: [
      "GET /repos/{owner}/{repo}/codespaces/permissions_check"
    ],
    codespaceMachinesForAuthenticatedUser: [
      "GET /user/codespaces/{codespace_name}/machines"
    ],
    createForAuthenticatedUser: ["POST /user/codespaces"],
    createOrUpdateOrgSecret: [
      "PUT /orgs/{org}/codespaces/secrets/{secret_name}"
    ],
    createOrUpdateRepoSecret: [
      "PUT /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"
    ],
    createOrUpdateSecretForAuthenticatedUser: [
      "PUT /user/codespaces/secrets/{secret_name}"
    ],
    createWithPrForAuthenticatedUser: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/codespaces"
    ],
    createWithRepoForAuthenticatedUser: [
      "POST /repos/{owner}/{repo}/codespaces"
    ],
    deleteForAuthenticatedUser: ["DELETE /user/codespaces/{codespace_name}"],
    deleteFromOrganization: [
      "DELETE /orgs/{org}/members/{username}/codespaces/{codespace_name}"
    ],
    deleteOrgSecret: ["DELETE /orgs/{org}/codespaces/secrets/{secret_name}"],
    deleteRepoSecret: [
      "DELETE /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"
    ],
    deleteSecretForAuthenticatedUser: [
      "DELETE /user/codespaces/secrets/{secret_name}"
    ],
    exportForAuthenticatedUser: [
      "POST /user/codespaces/{codespace_name}/exports"
    ],
    getCodespacesForUserInOrg: [
      "GET /orgs/{org}/members/{username}/codespaces"
    ],
    getExportDetailsForAuthenticatedUser: [
      "GET /user/codespaces/{codespace_name}/exports/{export_id}"
    ],
    getForAuthenticatedUser: ["GET /user/codespaces/{codespace_name}"],
    getOrgPublicKey: ["GET /orgs/{org}/codespaces/secrets/public-key"],
    getOrgSecret: ["GET /orgs/{org}/codespaces/secrets/{secret_name}"],
    getPublicKeyForAuthenticatedUser: [
      "GET /user/codespaces/secrets/public-key"
    ],
    getRepoPublicKey: [
      "GET /repos/{owner}/{repo}/codespaces/secrets/public-key"
    ],
    getRepoSecret: [
      "GET /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"
    ],
    getSecretForAuthenticatedUser: [
      "GET /user/codespaces/secrets/{secret_name}"
    ],
    listDevcontainersInRepositoryForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/codespaces/devcontainers"
    ],
    listForAuthenticatedUser: ["GET /user/codespaces"],
    listInOrganization: [
      "GET /orgs/{org}/codespaces",
      {},
      { renamedParameters: { org_id: "org" } }
    ],
    listInRepositoryForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/codespaces"
    ],
    listOrgSecrets: ["GET /orgs/{org}/codespaces/secrets"],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/codespaces/secrets"],
    listRepositoriesForSecretForAuthenticatedUser: [
      "GET /user/codespaces/secrets/{secret_name}/repositories"
    ],
    listSecretsForAuthenticatedUser: ["GET /user/codespaces/secrets"],
    listSelectedReposForOrgSecret: [
      "GET /orgs/{org}/codespaces/secrets/{secret_name}/repositories"
    ],
    preFlightWithRepoForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/codespaces/new"
    ],
    publishForAuthenticatedUser: [
      "POST /user/codespaces/{codespace_name}/publish"
    ],
    removeRepositoryForSecretForAuthenticatedUser: [
      "DELETE /user/codespaces/secrets/{secret_name}/repositories/{repository_id}"
    ],
    removeSelectedRepoFromOrgSecret: [
      "DELETE /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}"
    ],
    repoMachinesForAuthenticatedUser: [
      "GET /repos/{owner}/{repo}/codespaces/machines"
    ],
    setRepositoriesForSecretForAuthenticatedUser: [
      "PUT /user/codespaces/secrets/{secret_name}/repositories"
    ],
    setSelectedReposForOrgSecret: [
      "PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories"
    ],
    startForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/start"],
    stopForAuthenticatedUser: ["POST /user/codespaces/{codespace_name}/stop"],
    stopInOrganization: [
      "POST /orgs/{org}/members/{username}/codespaces/{codespace_name}/stop"
    ],
    updateForAuthenticatedUser: ["PATCH /user/codespaces/{codespace_name}"]
  },
  copilot: {
    addCopilotSeatsForTeams: [
      "POST /orgs/{org}/copilot/billing/selected_teams"
    ],
    addCopilotSeatsForUsers: [
      "POST /orgs/{org}/copilot/billing/selected_users"
    ],
    cancelCopilotSeatAssignmentForTeams: [
      "DELETE /orgs/{org}/copilot/billing/selected_teams"
    ],
    cancelCopilotSeatAssignmentForUsers: [
      "DELETE /orgs/{org}/copilot/billing/selected_users"
    ],
    copilotMetricsForOrganization: ["GET /orgs/{org}/copilot/metrics"],
    copilotMetricsForTeam: ["GET /orgs/{org}/team/{team_slug}/copilot/metrics"],
    getCopilotOrganizationDetails: ["GET /orgs/{org}/copilot/billing"],
    getCopilotSeatDetailsForUser: [
      "GET /orgs/{org}/members/{username}/copilot"
    ],
    listCopilotSeats: ["GET /orgs/{org}/copilot/billing/seats"]
  },
  credentials: { revoke: ["POST /credentials/revoke"] },
  dependabot: {
    addSelectedRepoToOrgSecret: [
      "PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}"
    ],
    createOrUpdateOrgSecret: [
      "PUT /orgs/{org}/dependabot/secrets/{secret_name}"
    ],
    createOrUpdateRepoSecret: [
      "PUT /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"
    ],
    deleteOrgSecret: ["DELETE /orgs/{org}/dependabot/secrets/{secret_name}"],
    deleteRepoSecret: [
      "DELETE /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"
    ],
    getAlert: ["GET /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"],
    getOrgPublicKey: ["GET /orgs/{org}/dependabot/secrets/public-key"],
    getOrgSecret: ["GET /orgs/{org}/dependabot/secrets/{secret_name}"],
    getRepoPublicKey: [
      "GET /repos/{owner}/{repo}/dependabot/secrets/public-key"
    ],
    getRepoSecret: [
      "GET /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"
    ],
    listAlertsForEnterprise: [
      "GET /enterprises/{enterprise}/dependabot/alerts"
    ],
    listAlertsForOrg: ["GET /orgs/{org}/dependabot/alerts"],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/dependabot/alerts"],
    listOrgSecrets: ["GET /orgs/{org}/dependabot/secrets"],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/dependabot/secrets"],
    listSelectedReposForOrgSecret: [
      "GET /orgs/{org}/dependabot/secrets/{secret_name}/repositories"
    ],
    removeSelectedRepoFromOrgSecret: [
      "DELETE /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}"
    ],
    repositoryAccessForOrg: [
      "GET /organizations/{org}/dependabot/repository-access"
    ],
    setRepositoryAccessDefaultLevel: [
      "PUT /organizations/{org}/dependabot/repository-access/default-level"
    ],
    setSelectedReposForOrgSecret: [
      "PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories"
    ],
    updateAlert: [
      "PATCH /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"
    ],
    updateRepositoryAccessForOrg: [
      "PATCH /organizations/{org}/dependabot/repository-access"
    ]
  },
  dependencyGraph: {
    createRepositorySnapshot: [
      "POST /repos/{owner}/{repo}/dependency-graph/snapshots"
    ],
    diffRange: [
      "GET /repos/{owner}/{repo}/dependency-graph/compare/{basehead}"
    ],
    exportSbom: ["GET /repos/{owner}/{repo}/dependency-graph/sbom"]
  },
  emojis: { get: ["GET /emojis"] },
  enterpriseTeamMemberships: {
    add: [
      "PUT /enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}"
    ],
    bulkAdd: [
      "POST /enterprises/{enterprise}/teams/{enterprise-team}/memberships/add"
    ],
    bulkRemove: [
      "POST /enterprises/{enterprise}/teams/{enterprise-team}/memberships/remove"
    ],
    get: [
      "GET /enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}"
    ],
    list: ["GET /enterprises/{enterprise}/teams/{enterprise-team}/memberships"],
    remove: [
      "DELETE /enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}"
    ]
  },
  enterpriseTeamOrganizations: {
    add: [
      "PUT /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}"
    ],
    bulkAdd: [
      "POST /enterprises/{enterprise}/teams/{enterprise-team}/organizations/add"
    ],
    bulkRemove: [
      "POST /enterprises/{enterprise}/teams/{enterprise-team}/organizations/remove"
    ],
    delete: [
      "DELETE /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}"
    ],
    getAssignment: [
      "GET /enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}"
    ],
    getAssignments: [
      "GET /enterprises/{enterprise}/teams/{enterprise-team}/organizations"
    ]
  },
  enterpriseTeams: {
    create: ["POST /enterprises/{enterprise}/teams"],
    delete: ["DELETE /enterprises/{enterprise}/teams/{team_slug}"],
    get: ["GET /enterprises/{enterprise}/teams/{team_slug}"],
    list: ["GET /enterprises/{enterprise}/teams"],
    update: ["PATCH /enterprises/{enterprise}/teams/{team_slug}"]
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
  hostedCompute: {
    createNetworkConfigurationForOrg: [
      "POST /orgs/{org}/settings/network-configurations"
    ],
    deleteNetworkConfigurationFromOrg: [
      "DELETE /orgs/{org}/settings/network-configurations/{network_configuration_id}"
    ],
    getNetworkConfigurationForOrg: [
      "GET /orgs/{org}/settings/network-configurations/{network_configuration_id}"
    ],
    getNetworkSettingsForOrg: [
      "GET /orgs/{org}/settings/network-settings/{network_settings_id}"
    ],
    listNetworkConfigurationsForOrg: [
      "GET /orgs/{org}/settings/network-configurations"
    ],
    updateNetworkConfigurationForOrg: [
      "PATCH /orgs/{org}/settings/network-configurations/{network_configuration_id}"
    ]
  },
  interactions: {
    getRestrictionsForAuthenticatedUser: ["GET /user/interaction-limits"],
    getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits"],
    getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits"],
    getRestrictionsForYourPublicRepos: [
      "GET /user/interaction-limits",
      {},
      { renamed: ["interactions", "getRestrictionsForAuthenticatedUser"] }
    ],
    removeRestrictionsForAuthenticatedUser: ["DELETE /user/interaction-limits"],
    removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits"],
    removeRestrictionsForRepo: [
      "DELETE /repos/{owner}/{repo}/interaction-limits"
    ],
    removeRestrictionsForYourPublicRepos: [
      "DELETE /user/interaction-limits",
      {},
      { renamed: ["interactions", "removeRestrictionsForAuthenticatedUser"] }
    ],
    setRestrictionsForAuthenticatedUser: ["PUT /user/interaction-limits"],
    setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits"],
    setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits"],
    setRestrictionsForYourPublicRepos: [
      "PUT /user/interaction-limits",
      {},
      { renamed: ["interactions", "setRestrictionsForAuthenticatedUser"] }
    ]
  },
  issues: {
    addAssignees: [
      "POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"
    ],
    addBlockedByDependency: [
      "POST /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by"
    ],
    addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    addSubIssue: [
      "POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues"
    ],
    checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
    checkUserCanBeAssignedToIssue: [
      "GET /repos/{owner}/{repo}/issues/{issue_number}/assignees/{assignee}"
    ],
    create: ["POST /repos/{owner}/{repo}/issues"],
    createComment: [
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments"
    ],
    createLabel: ["POST /repos/{owner}/{repo}/labels"],
    createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
    deleteComment: [
      "DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"
    ],
    deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
    deleteMilestone: [
      "DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"
    ],
    get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
    getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
    getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
    getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
    getParent: ["GET /repos/{owner}/{repo}/issues/{issue_number}/parent"],
    list: ["GET /issues"],
    listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
    listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
    listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
    listDependenciesBlockedBy: [
      "GET /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by"
    ],
    listDependenciesBlocking: [
      "GET /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocking"
    ],
    listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
    listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
    listEventsForTimeline: [
      "GET /repos/{owner}/{repo}/issues/{issue_number}/timeline"
    ],
    listForAuthenticatedUser: ["GET /user/issues"],
    listForOrg: ["GET /orgs/{org}/issues"],
    listForRepo: ["GET /repos/{owner}/{repo}/issues"],
    listLabelsForMilestone: [
      "GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"
    ],
    listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
    listLabelsOnIssue: [
      "GET /repos/{owner}/{repo}/issues/{issue_number}/labels"
    ],
    listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
    listSubIssues: [
      "GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues"
    ],
    lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    removeAllLabels: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"
    ],
    removeAssignees: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"
    ],
    removeDependencyBlockedBy: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by/{issue_id}"
    ],
    removeLabel: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"
    ],
    removeSubIssue: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/sub_issue"
    ],
    reprioritizeSubIssue: [
      "PATCH /repos/{owner}/{repo}/issues/{issue_number}/sub_issues/priority"
    ],
    setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
    updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
    updateMilestone: [
      "PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"
    ]
  },
  licenses: {
    get: ["GET /licenses/{license}"],
    getAllCommonlyUsed: ["GET /licenses"],
    getForRepo: ["GET /repos/{owner}/{repo}/license"]
  },
  markdown: {
    render: ["POST /markdown"],
    renderRaw: [
      "POST /markdown/raw",
      { headers: { "content-type": "text/plain; charset=utf-8" } }
    ]
  },
  meta: {
    get: ["GET /meta"],
    getAllVersions: ["GET /versions"],
    getOctocat: ["GET /octocat"],
    getZen: ["GET /zen"],
    root: ["GET /"]
  },
  migrations: {
    deleteArchiveForAuthenticatedUser: [
      "DELETE /user/migrations/{migration_id}/archive"
    ],
    deleteArchiveForOrg: [
      "DELETE /orgs/{org}/migrations/{migration_id}/archive"
    ],
    downloadArchiveForOrg: [
      "GET /orgs/{org}/migrations/{migration_id}/archive"
    ],
    getArchiveForAuthenticatedUser: [
      "GET /user/migrations/{migration_id}/archive"
    ],
    getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}"],
    getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}"],
    listForAuthenticatedUser: ["GET /user/migrations"],
    listForOrg: ["GET /orgs/{org}/migrations"],
    listReposForAuthenticatedUser: [
      "GET /user/migrations/{migration_id}/repositories"
    ],
    listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories"],
    listReposForUser: [
      "GET /user/migrations/{migration_id}/repositories",
      {},
      { renamed: ["migrations", "listReposForAuthenticatedUser"] }
    ],
    startForAuthenticatedUser: ["POST /user/migrations"],
    startForOrg: ["POST /orgs/{org}/migrations"],
    unlockRepoForAuthenticatedUser: [
      "DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock"
    ],
    unlockRepoForOrg: [
      "DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock"
    ]
  },
  oidc: {
    getOidcCustomSubTemplateForOrg: [
      "GET /orgs/{org}/actions/oidc/customization/sub"
    ],
    updateOidcCustomSubTemplateForOrg: [
      "PUT /orgs/{org}/actions/oidc/customization/sub"
    ]
  },
  orgs: {
    addSecurityManagerTeam: [
      "PUT /orgs/{org}/security-managers/teams/{team_slug}",
      {},
      {
        deprecated: "octokit.rest.orgs.addSecurityManagerTeam() is deprecated, see https://docs.github.com/rest/orgs/security-managers#add-a-security-manager-team"
      }
    ],
    assignTeamToOrgRole: [
      "PUT /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}"
    ],
    assignUserToOrgRole: [
      "PUT /orgs/{org}/organization-roles/users/{username}/{role_id}"
    ],
    blockUser: ["PUT /orgs/{org}/blocks/{username}"],
    cancelInvitation: ["DELETE /orgs/{org}/invitations/{invitation_id}"],
    checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
    checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
    checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
    convertMemberToOutsideCollaborator: [
      "PUT /orgs/{org}/outside_collaborators/{username}"
    ],
    createArtifactStorageRecord: [
      "POST /orgs/{org}/artifacts/metadata/storage-record"
    ],
    createInvitation: ["POST /orgs/{org}/invitations"],
    createIssueType: ["POST /orgs/{org}/issue-types"],
    createWebhook: ["POST /orgs/{org}/hooks"],
    customPropertiesForOrgsCreateOrUpdateOrganizationValues: [
      "PATCH /organizations/{org}/org-properties/values"
    ],
    customPropertiesForOrgsGetOrganizationValues: [
      "GET /organizations/{org}/org-properties/values"
    ],
    customPropertiesForReposCreateOrUpdateOrganizationDefinition: [
      "PUT /orgs/{org}/properties/schema/{custom_property_name}"
    ],
    customPropertiesForReposCreateOrUpdateOrganizationDefinitions: [
      "PATCH /orgs/{org}/properties/schema"
    ],
    customPropertiesForReposCreateOrUpdateOrganizationValues: [
      "PATCH /orgs/{org}/properties/values"
    ],
    customPropertiesForReposDeleteOrganizationDefinition: [
      "DELETE /orgs/{org}/properties/schema/{custom_property_name}"
    ],
    customPropertiesForReposGetOrganizationDefinition: [
      "GET /orgs/{org}/properties/schema/{custom_property_name}"
    ],
    customPropertiesForReposGetOrganizationDefinitions: [
      "GET /orgs/{org}/properties/schema"
    ],
    customPropertiesForReposGetOrganizationValues: [
      "GET /orgs/{org}/properties/values"
    ],
    delete: ["DELETE /orgs/{org}"],
    deleteAttestationsBulk: ["POST /orgs/{org}/attestations/delete-request"],
    deleteAttestationsById: [
      "DELETE /orgs/{org}/attestations/{attestation_id}"
    ],
    deleteAttestationsBySubjectDigest: [
      "DELETE /orgs/{org}/attestations/digest/{subject_digest}"
    ],
    deleteIssueType: ["DELETE /orgs/{org}/issue-types/{issue_type_id}"],
    deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
    disableSelectedRepositoryImmutableReleasesOrganization: [
      "DELETE /orgs/{org}/settings/immutable-releases/repositories/{repository_id}"
    ],
    enableSelectedRepositoryImmutableReleasesOrganization: [
      "PUT /orgs/{org}/settings/immutable-releases/repositories/{repository_id}"
    ],
    get: ["GET /orgs/{org}"],
    getImmutableReleasesSettings: [
      "GET /orgs/{org}/settings/immutable-releases"
    ],
    getImmutableReleasesSettingsRepositories: [
      "GET /orgs/{org}/settings/immutable-releases/repositories"
    ],
    getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
    getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
    getOrgRole: ["GET /orgs/{org}/organization-roles/{role_id}"],
    getOrgRulesetHistory: ["GET /orgs/{org}/rulesets/{ruleset_id}/history"],
    getOrgRulesetVersion: [
      "GET /orgs/{org}/rulesets/{ruleset_id}/history/{version_id}"
    ],
    getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
    getWebhookConfigForOrg: ["GET /orgs/{org}/hooks/{hook_id}/config"],
    getWebhookDelivery: [
      "GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}"
    ],
    list: ["GET /organizations"],
    listAppInstallations: ["GET /orgs/{org}/installations"],
    listArtifactStorageRecords: [
      "GET /orgs/{org}/artifacts/{subject_digest}/metadata/storage-records"
    ],
    listAttestationRepositories: ["GET /orgs/{org}/attestations/repositories"],
    listAttestations: ["GET /orgs/{org}/attestations/{subject_digest}"],
    listAttestationsBulk: [
      "POST /orgs/{org}/attestations/bulk-list{?per_page,before,after}"
    ],
    listBlockedUsers: ["GET /orgs/{org}/blocks"],
    listFailedInvitations: ["GET /orgs/{org}/failed_invitations"],
    listForAuthenticatedUser: ["GET /user/orgs"],
    listForUser: ["GET /users/{username}/orgs"],
    listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
    listIssueTypes: ["GET /orgs/{org}/issue-types"],
    listMembers: ["GET /orgs/{org}/members"],
    listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
    listOrgRoleTeams: ["GET /orgs/{org}/organization-roles/{role_id}/teams"],
    listOrgRoleUsers: ["GET /orgs/{org}/organization-roles/{role_id}/users"],
    listOrgRoles: ["GET /orgs/{org}/organization-roles"],
    listOrganizationFineGrainedPermissions: [
      "GET /orgs/{org}/organization-fine-grained-permissions"
    ],
    listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
    listPatGrantRepositories: [
      "GET /orgs/{org}/personal-access-tokens/{pat_id}/repositories"
    ],
    listPatGrantRequestRepositories: [
      "GET /orgs/{org}/personal-access-token-requests/{pat_request_id}/repositories"
    ],
    listPatGrantRequests: ["GET /orgs/{org}/personal-access-token-requests"],
    listPatGrants: ["GET /orgs/{org}/personal-access-tokens"],
    listPendingInvitations: ["GET /orgs/{org}/invitations"],
    listPublicMembers: ["GET /orgs/{org}/public_members"],
    listSecurityManagerTeams: [
      "GET /orgs/{org}/security-managers",
      {},
      {
        deprecated: "octokit.rest.orgs.listSecurityManagerTeams() is deprecated, see https://docs.github.com/rest/orgs/security-managers#list-security-manager-teams"
      }
    ],
    listWebhookDeliveries: ["GET /orgs/{org}/hooks/{hook_id}/deliveries"],
    listWebhooks: ["GET /orgs/{org}/hooks"],
    pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
    redeliverWebhookDelivery: [
      "POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"
    ],
    removeMember: ["DELETE /orgs/{org}/members/{username}"],
    removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
    removeOutsideCollaborator: [
      "DELETE /orgs/{org}/outside_collaborators/{username}"
    ],
    removePublicMembershipForAuthenticatedUser: [
      "DELETE /orgs/{org}/public_members/{username}"
    ],
    removeSecurityManagerTeam: [
      "DELETE /orgs/{org}/security-managers/teams/{team_slug}",
      {},
      {
        deprecated: "octokit.rest.orgs.removeSecurityManagerTeam() is deprecated, see https://docs.github.com/rest/orgs/security-managers#remove-a-security-manager-team"
      }
    ],
    reviewPatGrantRequest: [
      "POST /orgs/{org}/personal-access-token-requests/{pat_request_id}"
    ],
    reviewPatGrantRequestsInBulk: [
      "POST /orgs/{org}/personal-access-token-requests"
    ],
    revokeAllOrgRolesTeam: [
      "DELETE /orgs/{org}/organization-roles/teams/{team_slug}"
    ],
    revokeAllOrgRolesUser: [
      "DELETE /orgs/{org}/organization-roles/users/{username}"
    ],
    revokeOrgRoleTeam: [
      "DELETE /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}"
    ],
    revokeOrgRoleUser: [
      "DELETE /orgs/{org}/organization-roles/users/{username}/{role_id}"
    ],
    setImmutableReleasesSettings: [
      "PUT /orgs/{org}/settings/immutable-releases"
    ],
    setImmutableReleasesSettingsRepositories: [
      "PUT /orgs/{org}/settings/immutable-releases/repositories"
    ],
    setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
    setPublicMembershipForAuthenticatedUser: [
      "PUT /orgs/{org}/public_members/{username}"
    ],
    unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
    update: ["PATCH /orgs/{org}"],
    updateIssueType: ["PUT /orgs/{org}/issue-types/{issue_type_id}"],
    updateMembershipForAuthenticatedUser: [
      "PATCH /user/memberships/orgs/{org}"
    ],
    updatePatAccess: ["POST /orgs/{org}/personal-access-tokens/{pat_id}"],
    updatePatAccesses: ["POST /orgs/{org}/personal-access-tokens"],
    updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"],
    updateWebhookConfigForOrg: ["PATCH /orgs/{org}/hooks/{hook_id}/config"]
  },
  packages: {
    deletePackageForAuthenticatedUser: [
      "DELETE /user/packages/{package_type}/{package_name}"
    ],
    deletePackageForOrg: [
      "DELETE /orgs/{org}/packages/{package_type}/{package_name}"
    ],
    deletePackageForUser: [
      "DELETE /users/{username}/packages/{package_type}/{package_name}"
    ],
    deletePackageVersionForAuthenticatedUser: [
      "DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    deletePackageVersionForOrg: [
      "DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    deletePackageVersionForUser: [
      "DELETE /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    getAllPackageVersionsForAPackageOwnedByAnOrg: [
      "GET /orgs/{org}/packages/{package_type}/{package_name}/versions",
      {},
      { renamed: ["packages", "getAllPackageVersionsForPackageOwnedByOrg"] }
    ],
    getAllPackageVersionsForAPackageOwnedByTheAuthenticatedUser: [
      "GET /user/packages/{package_type}/{package_name}/versions",
      {},
      {
        renamed: [
          "packages",
          "getAllPackageVersionsForPackageOwnedByAuthenticatedUser"
        ]
      }
    ],
    getAllPackageVersionsForPackageOwnedByAuthenticatedUser: [
      "GET /user/packages/{package_type}/{package_name}/versions"
    ],
    getAllPackageVersionsForPackageOwnedByOrg: [
      "GET /orgs/{org}/packages/{package_type}/{package_name}/versions"
    ],
    getAllPackageVersionsForPackageOwnedByUser: [
      "GET /users/{username}/packages/{package_type}/{package_name}/versions"
    ],
    getPackageForAuthenticatedUser: [
      "GET /user/packages/{package_type}/{package_name}"
    ],
    getPackageForOrganization: [
      "GET /orgs/{org}/packages/{package_type}/{package_name}"
    ],
    getPackageForUser: [
      "GET /users/{username}/packages/{package_type}/{package_name}"
    ],
    getPackageVersionForAuthenticatedUser: [
      "GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    getPackageVersionForOrganization: [
      "GET /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    getPackageVersionForUser: [
      "GET /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"
    ],
    listDockerMigrationConflictingPackagesForAuthenticatedUser: [
      "GET /user/docker/conflicts"
    ],
    listDockerMigrationConflictingPackagesForOrganization: [
      "GET /orgs/{org}/docker/conflicts"
    ],
    listDockerMigrationConflictingPackagesForUser: [
      "GET /users/{username}/docker/conflicts"
    ],
    listPackagesForAuthenticatedUser: ["GET /user/packages"],
    listPackagesForOrganization: ["GET /orgs/{org}/packages"],
    listPackagesForUser: ["GET /users/{username}/packages"],
    restorePackageForAuthenticatedUser: [
      "POST /user/packages/{package_type}/{package_name}/restore{?token}"
    ],
    restorePackageForOrg: [
      "POST /orgs/{org}/packages/{package_type}/{package_name}/restore{?token}"
    ],
    restorePackageForUser: [
      "POST /users/{username}/packages/{package_type}/{package_name}/restore{?token}"
    ],
    restorePackageVersionForAuthenticatedUser: [
      "POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"
    ],
    restorePackageVersionForOrg: [
      "POST /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"
    ],
    restorePackageVersionForUser: [
      "POST /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"
    ]
  },
  privateRegistries: {
    createOrgPrivateRegistry: ["POST /orgs/{org}/private-registries"],
    deleteOrgPrivateRegistry: [
      "DELETE /orgs/{org}/private-registries/{secret_name}"
    ],
    getOrgPrivateRegistry: ["GET /orgs/{org}/private-registries/{secret_name}"],
    getOrgPublicKey: ["GET /orgs/{org}/private-registries/public-key"],
    listOrgPrivateRegistries: ["GET /orgs/{org}/private-registries"],
    updateOrgPrivateRegistry: [
      "PATCH /orgs/{org}/private-registries/{secret_name}"
    ]
  },
  projects: {
    addItemForOrg: ["POST /orgs/{org}/projectsV2/{project_number}/items"],
    addItemForUser: [
      "POST /users/{username}/projectsV2/{project_number}/items"
    ],
    deleteItemForOrg: [
      "DELETE /orgs/{org}/projectsV2/{project_number}/items/{item_id}"
    ],
    deleteItemForUser: [
      "DELETE /users/{username}/projectsV2/{project_number}/items/{item_id}"
    ],
    getFieldForOrg: [
      "GET /orgs/{org}/projectsV2/{project_number}/fields/{field_id}"
    ],
    getFieldForUser: [
      "GET /users/{username}/projectsV2/{project_number}/fields/{field_id}"
    ],
    getForOrg: ["GET /orgs/{org}/projectsV2/{project_number}"],
    getForUser: ["GET /users/{username}/projectsV2/{project_number}"],
    getOrgItem: ["GET /orgs/{org}/projectsV2/{project_number}/items/{item_id}"],
    getUserItem: [
      "GET /users/{username}/projectsV2/{project_number}/items/{item_id}"
    ],
    listFieldsForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/fields"],
    listFieldsForUser: [
      "GET /users/{username}/projectsV2/{project_number}/fields"
    ],
    listForOrg: ["GET /orgs/{org}/projectsV2"],
    listForUser: ["GET /users/{username}/projectsV2"],
    listItemsForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/items"],
    listItemsForUser: [
      "GET /users/{username}/projectsV2/{project_number}/items"
    ],
    updateItemForOrg: [
      "PATCH /orgs/{org}/projectsV2/{project_number}/items/{item_id}"
    ],
    updateItemForUser: [
      "PATCH /users/{username}/projectsV2/{project_number}/items/{item_id}"
    ]
  },
  pulls: {
    checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    create: ["POST /repos/{owner}/{repo}/pulls"],
    createReplyForReviewComment: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies"
    ],
    createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    createReviewComment: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"
    ],
    deletePendingReview: [
      "DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"
    ],
    deleteReviewComment: [
      "DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"
    ],
    dismissReview: [
      "PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals"
    ],
    get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
    getReview: [
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"
    ],
    getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
    list: ["GET /repos/{owner}/{repo}/pulls"],
    listCommentsForReview: [
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments"
    ],
    listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
    listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
    listRequestedReviewers: [
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"
    ],
    listReviewComments: [
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"
    ],
    listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
    listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    removeRequestedReviewers: [
      "DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"
    ],
    requestReviewers: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"
    ],
    submitReview: [
      "POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"
    ],
    update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
    updateBranch: [
      "PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch"
    ],
    updateReview: [
      "PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"
    ],
    updateReviewComment: [
      "PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"
    ]
  },
  rateLimit: { get: ["GET /rate_limit"] },
  reactions: {
    createForCommitComment: [
      "POST /repos/{owner}/{repo}/comments/{comment_id}/reactions"
    ],
    createForIssue: [
      "POST /repos/{owner}/{repo}/issues/{issue_number}/reactions"
    ],
    createForIssueComment: [
      "POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"
    ],
    createForPullRequestReviewComment: [
      "POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"
    ],
    createForRelease: [
      "POST /repos/{owner}/{repo}/releases/{release_id}/reactions"
    ],
    createForTeamDiscussionCommentInOrg: [
      "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"
    ],
    createForTeamDiscussionInOrg: [
      "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"
    ],
    deleteForCommitComment: [
      "DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}"
    ],
    deleteForIssue: [
      "DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}"
    ],
    deleteForIssueComment: [
      "DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}"
    ],
    deleteForPullRequestComment: [
      "DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}"
    ],
    deleteForRelease: [
      "DELETE /repos/{owner}/{repo}/releases/{release_id}/reactions/{reaction_id}"
    ],
    deleteForTeamDiscussion: [
      "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}"
    ],
    deleteForTeamDiscussionComment: [
      "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}"
    ],
    listForCommitComment: [
      "GET /repos/{owner}/{repo}/comments/{comment_id}/reactions"
    ],
    listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions"],
    listForIssueComment: [
      "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"
    ],
    listForPullRequestReviewComment: [
      "GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"
    ],
    listForRelease: [
      "GET /repos/{owner}/{repo}/releases/{release_id}/reactions"
    ],
    listForTeamDiscussionCommentInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"
    ],
    listForTeamDiscussionInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"
    ]
  },
  repos: {
    acceptInvitation: [
      "PATCH /user/repository_invitations/{invitation_id}",
      {},
      { renamed: ["repos", "acceptInvitationForAuthenticatedUser"] }
    ],
    acceptInvitationForAuthenticatedUser: [
      "PATCH /user/repository_invitations/{invitation_id}"
    ],
    addAppAccessRestrictions: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
      {},
      { mapToData: "apps" }
    ],
    addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
    addStatusCheckContexts: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
      {},
      { mapToData: "contexts" }
    ],
    addTeamAccessRestrictions: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
      {},
      { mapToData: "teams" }
    ],
    addUserAccessRestrictions: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
      {},
      { mapToData: "users" }
    ],
    cancelPagesDeployment: [
      "POST /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}/cancel"
    ],
    checkAutomatedSecurityFixes: [
      "GET /repos/{owner}/{repo}/automated-security-fixes"
    ],
    checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
    checkImmutableReleases: ["GET /repos/{owner}/{repo}/immutable-releases"],
    checkPrivateVulnerabilityReporting: [
      "GET /repos/{owner}/{repo}/private-vulnerability-reporting"
    ],
    checkVulnerabilityAlerts: [
      "GET /repos/{owner}/{repo}/vulnerability-alerts"
    ],
    codeownersErrors: ["GET /repos/{owner}/{repo}/codeowners/errors"],
    compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
    compareCommitsWithBasehead: [
      "GET /repos/{owner}/{repo}/compare/{basehead}"
    ],
    createAttestation: ["POST /repos/{owner}/{repo}/attestations"],
    createAutolink: ["POST /repos/{owner}/{repo}/autolinks"],
    createCommitComment: [
      "POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"
    ],
    createCommitSignatureProtection: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"
    ],
    createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
    createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
    createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
    createDeploymentBranchPolicy: [
      "POST /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies"
    ],
    createDeploymentProtectionRule: [
      "POST /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules"
    ],
    createDeploymentStatus: [
      "POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"
    ],
    createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
    createForAuthenticatedUser: ["POST /user/repos"],
    createFork: ["POST /repos/{owner}/{repo}/forks"],
    createInOrg: ["POST /orgs/{org}/repos"],
    createOrUpdateEnvironment: [
      "PUT /repos/{owner}/{repo}/environments/{environment_name}"
    ],
    createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
    createOrgRuleset: ["POST /orgs/{org}/rulesets"],
    createPagesDeployment: ["POST /repos/{owner}/{repo}/pages/deployments"],
    createPagesSite: ["POST /repos/{owner}/{repo}/pages"],
    createRelease: ["POST /repos/{owner}/{repo}/releases"],
    createRepoRuleset: ["POST /repos/{owner}/{repo}/rulesets"],
    createUsingTemplate: [
      "POST /repos/{template_owner}/{template_repo}/generate"
    ],
    createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
    customPropertiesForReposCreateOrUpdateRepositoryValues: [
      "PATCH /repos/{owner}/{repo}/properties/values"
    ],
    customPropertiesForReposGetRepositoryValues: [
      "GET /repos/{owner}/{repo}/properties/values"
    ],
    declineInvitation: [
      "DELETE /user/repository_invitations/{invitation_id}",
      {},
      { renamed: ["repos", "declineInvitationForAuthenticatedUser"] }
    ],
    declineInvitationForAuthenticatedUser: [
      "DELETE /user/repository_invitations/{invitation_id}"
    ],
    delete: ["DELETE /repos/{owner}/{repo}"],
    deleteAccessRestrictions: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"
    ],
    deleteAdminBranchProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"
    ],
    deleteAnEnvironment: [
      "DELETE /repos/{owner}/{repo}/environments/{environment_name}"
    ],
    deleteAutolink: ["DELETE /repos/{owner}/{repo}/autolinks/{autolink_id}"],
    deleteBranchProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection"
    ],
    deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
    deleteCommitSignatureProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"
    ],
    deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
    deleteDeployment: [
      "DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"
    ],
    deleteDeploymentBranchPolicy: [
      "DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"
    ],
    deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
    deleteInvitation: [
      "DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"
    ],
    deleteOrgRuleset: ["DELETE /orgs/{org}/rulesets/{ruleset_id}"],
    deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages"],
    deletePullRequestReviewProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"
    ],
    deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
    deleteReleaseAsset: [
      "DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"
    ],
    deleteRepoRuleset: ["DELETE /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
    deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
    disableAutomatedSecurityFixes: [
      "DELETE /repos/{owner}/{repo}/automated-security-fixes"
    ],
    disableDeploymentProtectionRule: [
      "DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}"
    ],
    disableImmutableReleases: [
      "DELETE /repos/{owner}/{repo}/immutable-releases"
    ],
    disablePrivateVulnerabilityReporting: [
      "DELETE /repos/{owner}/{repo}/private-vulnerability-reporting"
    ],
    disableVulnerabilityAlerts: [
      "DELETE /repos/{owner}/{repo}/vulnerability-alerts"
    ],
    downloadArchive: [
      "GET /repos/{owner}/{repo}/zipball/{ref}",
      {},
      { renamed: ["repos", "downloadZipballArchive"] }
    ],
    downloadTarballArchive: ["GET /repos/{owner}/{repo}/tarball/{ref}"],
    downloadZipballArchive: ["GET /repos/{owner}/{repo}/zipball/{ref}"],
    enableAutomatedSecurityFixes: [
      "PUT /repos/{owner}/{repo}/automated-security-fixes"
    ],
    enableImmutableReleases: ["PUT /repos/{owner}/{repo}/immutable-releases"],
    enablePrivateVulnerabilityReporting: [
      "PUT /repos/{owner}/{repo}/private-vulnerability-reporting"
    ],
    enableVulnerabilityAlerts: [
      "PUT /repos/{owner}/{repo}/vulnerability-alerts"
    ],
    generateReleaseNotes: [
      "POST /repos/{owner}/{repo}/releases/generate-notes"
    ],
    get: ["GET /repos/{owner}/{repo}"],
    getAccessRestrictions: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"
    ],
    getAdminBranchProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"
    ],
    getAllDeploymentProtectionRules: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules"
    ],
    getAllEnvironments: ["GET /repos/{owner}/{repo}/environments"],
    getAllStatusCheckContexts: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts"
    ],
    getAllTopics: ["GET /repos/{owner}/{repo}/topics"],
    getAppsWithAccessToProtectedBranch: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps"
    ],
    getAutolink: ["GET /repos/{owner}/{repo}/autolinks/{autolink_id}"],
    getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
    getBranchProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection"
    ],
    getBranchRules: ["GET /repos/{owner}/{repo}/rules/branches/{branch}"],
    getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
    getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
    getCollaboratorPermissionLevel: [
      "GET /repos/{owner}/{repo}/collaborators/{username}/permission"
    ],
    getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
    getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
    getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
    getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
    getCommitSignatureProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"
    ],
    getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile"],
    getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
    getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
    getCustomDeploymentProtectionRule: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}"
    ],
    getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
    getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
    getDeploymentBranchPolicy: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"
    ],
    getDeploymentStatus: [
      "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}"
    ],
    getEnvironment: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}"
    ],
    getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
    getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
    getOrgRuleSuite: ["GET /orgs/{org}/rulesets/rule-suites/{rule_suite_id}"],
    getOrgRuleSuites: ["GET /orgs/{org}/rulesets/rule-suites"],
    getOrgRuleset: ["GET /orgs/{org}/rulesets/{ruleset_id}"],
    getOrgRulesets: ["GET /orgs/{org}/rulesets"],
    getPages: ["GET /repos/{owner}/{repo}/pages"],
    getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
    getPagesDeployment: [
      "GET /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}"
    ],
    getPagesHealthCheck: ["GET /repos/{owner}/{repo}/pages/health"],
    getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
    getPullRequestReviewProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"
    ],
    getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
    getReadme: ["GET /repos/{owner}/{repo}/readme"],
    getReadmeInDirectory: ["GET /repos/{owner}/{repo}/readme/{dir}"],
    getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
    getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
    getRepoRuleSuite: [
      "GET /repos/{owner}/{repo}/rulesets/rule-suites/{rule_suite_id}"
    ],
    getRepoRuleSuites: ["GET /repos/{owner}/{repo}/rulesets/rule-suites"],
    getRepoRuleset: ["GET /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
    getRepoRulesetHistory: [
      "GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history"
    ],
    getRepoRulesetVersion: [
      "GET /repos/{owner}/{repo}/rulesets/{ruleset_id}/history/{version_id}"
    ],
    getRepoRulesets: ["GET /repos/{owner}/{repo}/rulesets"],
    getStatusChecksProtection: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"
    ],
    getTeamsWithAccessToProtectedBranch: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams"
    ],
    getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
    getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
    getUsersWithAccessToProtectedBranch: [
      "GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users"
    ],
    getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
    getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
    getWebhookConfigForRepo: [
      "GET /repos/{owner}/{repo}/hooks/{hook_id}/config"
    ],
    getWebhookDelivery: [
      "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}"
    ],
    listActivities: ["GET /repos/{owner}/{repo}/activity"],
    listAttestations: [
      "GET /repos/{owner}/{repo}/attestations/{subject_digest}"
    ],
    listAutolinks: ["GET /repos/{owner}/{repo}/autolinks"],
    listBranches: ["GET /repos/{owner}/{repo}/branches"],
    listBranchesForHeadCommit: [
      "GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head"
    ],
    listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
    listCommentsForCommit: [
      "GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"
    ],
    listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
    listCommitStatusesForRef: [
      "GET /repos/{owner}/{repo}/commits/{ref}/statuses"
    ],
    listCommits: ["GET /repos/{owner}/{repo}/commits"],
    listContributors: ["GET /repos/{owner}/{repo}/contributors"],
    listCustomDeploymentRuleIntegrations: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/apps"
    ],
    listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
    listDeploymentBranchPolicies: [
      "GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies"
    ],
    listDeploymentStatuses: [
      "GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"
    ],
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
    listPullRequestsAssociatedWithCommit: [
      "GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls"
    ],
    listReleaseAssets: [
      "GET /repos/{owner}/{repo}/releases/{release_id}/assets"
    ],
    listReleases: ["GET /repos/{owner}/{repo}/releases"],
    listTags: ["GET /repos/{owner}/{repo}/tags"],
    listTeams: ["GET /repos/{owner}/{repo}/teams"],
    listWebhookDeliveries: [
      "GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries"
    ],
    listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
    merge: ["POST /repos/{owner}/{repo}/merges"],
    mergeUpstream: ["POST /repos/{owner}/{repo}/merge-upstream"],
    pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
    redeliverWebhookDelivery: [
      "POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"
    ],
    removeAppAccessRestrictions: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
      {},
      { mapToData: "apps" }
    ],
    removeCollaborator: [
      "DELETE /repos/{owner}/{repo}/collaborators/{username}"
    ],
    removeStatusCheckContexts: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
      {},
      { mapToData: "contexts" }
    ],
    removeStatusCheckProtection: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"
    ],
    removeTeamAccessRestrictions: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
      {},
      { mapToData: "teams" }
    ],
    removeUserAccessRestrictions: [
      "DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
      {},
      { mapToData: "users" }
    ],
    renameBranch: ["POST /repos/{owner}/{repo}/branches/{branch}/rename"],
    replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics"],
    requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
    setAdminBranchProtection: [
      "POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"
    ],
    setAppAccessRestrictions: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",
      {},
      { mapToData: "apps" }
    ],
    setStatusCheckContexts: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",
      {},
      { mapToData: "contexts" }
    ],
    setTeamAccessRestrictions: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",
      {},
      { mapToData: "teams" }
    ],
    setUserAccessRestrictions: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",
      {},
      { mapToData: "users" }
    ],
    testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
    transfer: ["POST /repos/{owner}/{repo}/transfer"],
    update: ["PATCH /repos/{owner}/{repo}"],
    updateBranchProtection: [
      "PUT /repos/{owner}/{repo}/branches/{branch}/protection"
    ],
    updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
    updateDeploymentBranchPolicy: [
      "PUT /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"
    ],
    updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
    updateInvitation: [
      "PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"
    ],
    updateOrgRuleset: ["PUT /orgs/{org}/rulesets/{ruleset_id}"],
    updatePullRequestReviewProtection: [
      "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"
    ],
    updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
    updateReleaseAsset: [
      "PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"
    ],
    updateRepoRuleset: ["PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}"],
    updateStatusCheckPotection: [
      "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",
      {},
      { renamed: ["repos", "updateStatusCheckProtection"] }
    ],
    updateStatusCheckProtection: [
      "PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"
    ],
    updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
    updateWebhookConfigForRepo: [
      "PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config"
    ],
    uploadReleaseAsset: [
      "POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}",
      { baseUrl: "https://uploads.github.com" }
    ]
  },
  search: {
    code: ["GET /search/code"],
    commits: ["GET /search/commits"],
    issuesAndPullRequests: ["GET /search/issues"],
    labels: ["GET /search/labels"],
    repos: ["GET /search/repositories"],
    topics: ["GET /search/topics"],
    users: ["GET /search/users"]
  },
  secretScanning: {
    createPushProtectionBypass: [
      "POST /repos/{owner}/{repo}/secret-scanning/push-protection-bypasses"
    ],
    getAlert: [
      "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"
    ],
    getScanHistory: ["GET /repos/{owner}/{repo}/secret-scanning/scan-history"],
    listAlertsForOrg: ["GET /orgs/{org}/secret-scanning/alerts"],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/secret-scanning/alerts"],
    listLocationsForAlert: [
      "GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations"
    ],
    listOrgPatternConfigs: [
      "GET /orgs/{org}/secret-scanning/pattern-configurations"
    ],
    updateAlert: [
      "PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"
    ],
    updateOrgPatternConfigs: [
      "PATCH /orgs/{org}/secret-scanning/pattern-configurations"
    ]
  },
  securityAdvisories: {
    createFork: [
      "POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/forks"
    ],
    createPrivateVulnerabilityReport: [
      "POST /repos/{owner}/{repo}/security-advisories/reports"
    ],
    createRepositoryAdvisory: [
      "POST /repos/{owner}/{repo}/security-advisories"
    ],
    createRepositoryAdvisoryCveRequest: [
      "POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/cve"
    ],
    getGlobalAdvisory: ["GET /advisories/{ghsa_id}"],
    getRepositoryAdvisory: [
      "GET /repos/{owner}/{repo}/security-advisories/{ghsa_id}"
    ],
    listGlobalAdvisories: ["GET /advisories"],
    listOrgRepositoryAdvisories: ["GET /orgs/{org}/security-advisories"],
    listRepositoryAdvisories: ["GET /repos/{owner}/{repo}/security-advisories"],
    updateRepositoryAdvisory: [
      "PATCH /repos/{owner}/{repo}/security-advisories/{ghsa_id}"
    ]
  },
  teams: {
    addOrUpdateMembershipForUserInOrg: [
      "PUT /orgs/{org}/teams/{team_slug}/memberships/{username}"
    ],
    addOrUpdateRepoPermissionsInOrg: [
      "PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"
    ],
    checkPermissionsForRepoInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"
    ],
    create: ["POST /orgs/{org}/teams"],
    createDiscussionCommentInOrg: [
      "POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"
    ],
    createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
    deleteDiscussionCommentInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"
    ],
    deleteDiscussionInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"
    ],
    deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
    getByName: ["GET /orgs/{org}/teams/{team_slug}"],
    getDiscussionCommentInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"
    ],
    getDiscussionInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"
    ],
    getMembershipForUserInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/memberships/{username}"
    ],
    list: ["GET /orgs/{org}/teams"],
    listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
    listDiscussionCommentsInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"
    ],
    listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
    listForAuthenticatedUser: ["GET /user/teams"],
    listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
    listPendingInvitationsInOrg: [
      "GET /orgs/{org}/teams/{team_slug}/invitations"
    ],
    listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
    removeMembershipForUserInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"
    ],
    removeRepoInOrg: [
      "DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"
    ],
    updateDiscussionCommentInOrg: [
      "PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"
    ],
    updateDiscussionInOrg: [
      "PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"
    ],
    updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"]
  },
  users: {
    addEmailForAuthenticated: [
      "POST /user/emails",
      {},
      { renamed: ["users", "addEmailForAuthenticatedUser"] }
    ],
    addEmailForAuthenticatedUser: ["POST /user/emails"],
    addSocialAccountForAuthenticatedUser: ["POST /user/social_accounts"],
    block: ["PUT /user/blocks/{username}"],
    checkBlocked: ["GET /user/blocks/{username}"],
    checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
    checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
    createGpgKeyForAuthenticated: [
      "POST /user/gpg_keys",
      {},
      { renamed: ["users", "createGpgKeyForAuthenticatedUser"] }
    ],
    createGpgKeyForAuthenticatedUser: ["POST /user/gpg_keys"],
    createPublicSshKeyForAuthenticated: [
      "POST /user/keys",
      {},
      { renamed: ["users", "createPublicSshKeyForAuthenticatedUser"] }
    ],
    createPublicSshKeyForAuthenticatedUser: ["POST /user/keys"],
    createSshSigningKeyForAuthenticatedUser: ["POST /user/ssh_signing_keys"],
    deleteAttestationsBulk: [
      "POST /users/{username}/attestations/delete-request"
    ],
    deleteAttestationsById: [
      "DELETE /users/{username}/attestations/{attestation_id}"
    ],
    deleteAttestationsBySubjectDigest: [
      "DELETE /users/{username}/attestations/digest/{subject_digest}"
    ],
    deleteEmailForAuthenticated: [
      "DELETE /user/emails",
      {},
      { renamed: ["users", "deleteEmailForAuthenticatedUser"] }
    ],
    deleteEmailForAuthenticatedUser: ["DELETE /user/emails"],
    deleteGpgKeyForAuthenticated: [
      "DELETE /user/gpg_keys/{gpg_key_id}",
      {},
      { renamed: ["users", "deleteGpgKeyForAuthenticatedUser"] }
    ],
    deleteGpgKeyForAuthenticatedUser: ["DELETE /user/gpg_keys/{gpg_key_id}"],
    deletePublicSshKeyForAuthenticated: [
      "DELETE /user/keys/{key_id}",
      {},
      { renamed: ["users", "deletePublicSshKeyForAuthenticatedUser"] }
    ],
    deletePublicSshKeyForAuthenticatedUser: ["DELETE /user/keys/{key_id}"],
    deleteSocialAccountForAuthenticatedUser: ["DELETE /user/social_accounts"],
    deleteSshSigningKeyForAuthenticatedUser: [
      "DELETE /user/ssh_signing_keys/{ssh_signing_key_id}"
    ],
    follow: ["PUT /user/following/{username}"],
    getAuthenticated: ["GET /user"],
    getById: ["GET /user/{account_id}"],
    getByUsername: ["GET /users/{username}"],
    getContextForUser: ["GET /users/{username}/hovercard"],
    getGpgKeyForAuthenticated: [
      "GET /user/gpg_keys/{gpg_key_id}",
      {},
      { renamed: ["users", "getGpgKeyForAuthenticatedUser"] }
    ],
    getGpgKeyForAuthenticatedUser: ["GET /user/gpg_keys/{gpg_key_id}"],
    getPublicSshKeyForAuthenticated: [
      "GET /user/keys/{key_id}",
      {},
      { renamed: ["users", "getPublicSshKeyForAuthenticatedUser"] }
    ],
    getPublicSshKeyForAuthenticatedUser: ["GET /user/keys/{key_id}"],
    getSshSigningKeyForAuthenticatedUser: [
      "GET /user/ssh_signing_keys/{ssh_signing_key_id}"
    ],
    list: ["GET /users"],
    listAttestations: ["GET /users/{username}/attestations/{subject_digest}"],
    listAttestationsBulk: [
      "POST /users/{username}/attestations/bulk-list{?per_page,before,after}"
    ],
    listBlockedByAuthenticated: [
      "GET /user/blocks",
      {},
      { renamed: ["users", "listBlockedByAuthenticatedUser"] }
    ],
    listBlockedByAuthenticatedUser: ["GET /user/blocks"],
    listEmailsForAuthenticated: [
      "GET /user/emails",
      {},
      { renamed: ["users", "listEmailsForAuthenticatedUser"] }
    ],
    listEmailsForAuthenticatedUser: ["GET /user/emails"],
    listFollowedByAuthenticated: [
      "GET /user/following",
      {},
      { renamed: ["users", "listFollowedByAuthenticatedUser"] }
    ],
    listFollowedByAuthenticatedUser: ["GET /user/following"],
    listFollowersForAuthenticatedUser: ["GET /user/followers"],
    listFollowersForUser: ["GET /users/{username}/followers"],
    listFollowingForUser: ["GET /users/{username}/following"],
    listGpgKeysForAuthenticated: [
      "GET /user/gpg_keys",
      {},
      { renamed: ["users", "listGpgKeysForAuthenticatedUser"] }
    ],
    listGpgKeysForAuthenticatedUser: ["GET /user/gpg_keys"],
    listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
    listPublicEmailsForAuthenticated: [
      "GET /user/public_emails",
      {},
      { renamed: ["users", "listPublicEmailsForAuthenticatedUser"] }
    ],
    listPublicEmailsForAuthenticatedUser: ["GET /user/public_emails"],
    listPublicKeysForUser: ["GET /users/{username}/keys"],
    listPublicSshKeysForAuthenticated: [
      "GET /user/keys",
      {},
      { renamed: ["users", "listPublicSshKeysForAuthenticatedUser"] }
    ],
    listPublicSshKeysForAuthenticatedUser: ["GET /user/keys"],
    listSocialAccountsForAuthenticatedUser: ["GET /user/social_accounts"],
    listSocialAccountsForUser: ["GET /users/{username}/social_accounts"],
    listSshSigningKeysForAuthenticatedUser: ["GET /user/ssh_signing_keys"],
    listSshSigningKeysForUser: ["GET /users/{username}/ssh_signing_keys"],
    setPrimaryEmailVisibilityForAuthenticated: [
      "PATCH /user/email/visibility",
      {},
      { renamed: ["users", "setPrimaryEmailVisibilityForAuthenticatedUser"] }
    ],
    setPrimaryEmailVisibilityForAuthenticatedUser: [
      "PATCH /user/email/visibility"
    ],
    unblock: ["DELETE /user/blocks/{username}"],
    unfollow: ["DELETE /user/following/{username}"],
    updateAuthenticated: ["PATCH /user"]
  }
};
var endpoints_default = Endpoints;

// 
var endpointMethodsMap = /* @__PURE__ */ new Map();
for (const [scope, endpoints] of Object.entries(endpoints_default)) {
  for (const [methodName, endpoint2] of Object.entries(endpoints)) {
    const [route, defaults, decorations] = endpoint2;
    const [method, url] = route.split(/ /);
    const endpointDefaults = Object.assign(
      {
        method,
        url
      },
      defaults
    );
    if (!endpointMethodsMap.has(scope)) {
      endpointMethodsMap.set(scope, /* @__PURE__ */ new Map());
    }
    endpointMethodsMap.get(scope).set(methodName, {
      scope,
      methodName,
      endpointDefaults,
      decorations
    });
  }
}
var handler = {
  has({ scope }, methodName) {
    return endpointMethodsMap.get(scope).has(methodName);
  },
  getOwnPropertyDescriptor(target, methodName) {
    return {
      value: this.get(target, methodName),
      // ensures method is in the cache
      configurable: true,
      writable: true,
      enumerable: true
    };
  },
  defineProperty(target, methodName, descriptor) {
    Object.defineProperty(target.cache, methodName, descriptor);
    return true;
  },
  deleteProperty(target, methodName) {
    delete target.cache[methodName];
    return true;
  },
  ownKeys({ scope }) {
    return [...endpointMethodsMap.get(scope).keys()];
  },
  set(target, methodName, value) {
    return target.cache[methodName] = value;
  },
  get({ octokit, scope, cache }, methodName) {
    if (cache[methodName]) {
      return cache[methodName];
    }
    const method = endpointMethodsMap.get(scope).get(methodName);
    if (!method) {
      return void 0;
    }
    const { endpointDefaults, decorations } = method;
    if (decorations) {
      cache[methodName] = decorate(
        octokit,
        scope,
        methodName,
        endpointDefaults,
        decorations
      );
    } else {
      cache[methodName] = octokit.request.defaults(endpointDefaults);
    }
    return cache[methodName];
  }
};
function endpointsToMethods(octokit) {
  const newMethods = {};
  for (const scope of endpointMethodsMap.keys()) {
    newMethods[scope] = new Proxy({ octokit, scope, cache: {} }, handler);
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
      octokit.log.warn(
        `octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`
      );
    }
    if (decorations.deprecated) {
      octokit.log.warn(decorations.deprecated);
    }
    if (decorations.renamedParameters) {
      const options2 = requestWithDefaults.endpoint.merge(...args);
      for (const [name, alias] of Object.entries(
        decorations.renamedParameters
      )) {
        if (name in options2) {
          octokit.log.warn(
            `"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`
          );
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

// 
function restEndpointMethods(octokit) {
  const api = endpointsToMethods(octokit);
  return {
    rest: api
  };
}
restEndpointMethods.VERSION = VERSION7;
function legacyRestEndpointMethods(octokit) {
  const api = endpointsToMethods(octokit);
  return {
    ...api,
    rest: api
  };
}
legacyRestEndpointMethods.VERSION = VERSION7;

// 
var VERSION8 = "22.0.1";

// 
var Octokit2 = Octokit.plugin(requestLog, legacyRestEndpointMethods, paginateRest).defaults(
  {
    userAgent: `octokit-rest.js/${VERSION8}`
  }
);

// github-actions/previews/upload-artifacts-to-firebase/lib/fetch-workflow-artifact.ts
async function main() {
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/", 2);
  const [workflowIdRaw, artifactName] = process.argv.slice(2);
  const workflowId = Number(workflowIdRaw);
  const github = new Octokit2({ auth: process.env.GITHUB_TOKEN });
  const artifacts = await github.actions.listWorkflowRunArtifacts({
    owner,
    repo,
    run_id: workflowId
  });
  const matchArtifact = artifacts.data.artifacts.find((artifact) => artifact.name === artifactName);
  if (matchArtifact === void 0) {
    console.error(`Could not find artifact in workflow: ${workflowId}@${artifactName}`);
    process.exit(1);
  }
  const download = await github.actions.downloadArtifact({
    owner,
    repo,
    artifact_id: matchArtifact.id,
    archive_format: "zip"
  });
  process.stdout.write(Buffer.from(download.data));
}
try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/*! Bundled license information:

@octokit/request-error/dist-src/index.js:
  (* v8 ignore else -- @preserve -- Bug with vitest coverage where it sees an else branch that doesn't exist *)

@octokit/request/dist-bundle/index.js:
  (* v8 ignore next -- @preserve *)
  (* v8 ignore else -- @preserve *)
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvZmFzdC1jb250ZW50LXR5cGUtcGFyc2VAMy4wLjAvbm9kZV9tb2R1bGVzL2Zhc3QtY29udGVudC10eXBlLXBhcnNlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL3VuaXZlcnNhbC11c2VyLWFnZW50QDcuMC4zL25vZGVfbW9kdWxlcy91bml2ZXJzYWwtdXNlci1hZ2VudC9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9iZWZvcmUtYWZ0ZXItaG9va0A0LjAuMC9ub2RlX21vZHVsZXMvYmVmb3JlLWFmdGVyLWhvb2svbGliL3JlZ2lzdGVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL2JlZm9yZS1hZnRlci1ob29rQDQuMC4wL25vZGVfbW9kdWxlcy9iZWZvcmUtYWZ0ZXItaG9vay9saWIvYWRkLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL2JlZm9yZS1hZnRlci1ob29rQDQuMC4wL25vZGVfbW9kdWxlcy9iZWZvcmUtYWZ0ZXItaG9vay9saWIvcmVtb3ZlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL2JlZm9yZS1hZnRlci1ob29rQDQuMC4wL25vZGVfbW9kdWxlcy9iZWZvcmUtYWZ0ZXItaG9vay9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtlbmRwb2ludEAxMS4wLjMvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L2VuZHBvaW50L2Rpc3QtYnVuZGxlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3JlcXVlc3RAMTAuMC44L25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9yZXF1ZXN0L2Rpc3QtYnVuZGxlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL2pzb24td2l0aC1iaWdpbnRAMy41Ljgvbm9kZV9tb2R1bGVzL2pzb24td2l0aC1iaWdpbnQvanNvbi13aXRoLWJpZ2ludC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtyZXF1ZXN0LWVycm9yQDcuMS4wL25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9yZXF1ZXN0LWVycm9yL2Rpc3Qtc3JjL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K2dyYXBocWxAOS4wLjMvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L2dyYXBocWwvZGlzdC1idW5kbGUvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrYXV0aC10b2tlbkA2LjAuMC9ub2RlX21vZHVsZXMvQG9jdG9raXQvYXV0aC10b2tlbi9kaXN0LWJ1bmRsZS9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtjb3JlQDcuMC42L25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9jb3JlL2Rpc3Qtc3JjL3ZlcnNpb24uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrY29yZUA3LjAuNi9ub2RlX21vZHVsZXMvQG9jdG9raXQvY29yZS9kaXN0LXNyYy9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtwbHVnaW4tcmVxdWVzdC1sb2dANi4wLjBfQG9jdG9raXQrY29yZUA3LjAuNi9ub2RlX21vZHVsZXMvQG9jdG9raXQvcGx1Z2luLXJlcXVlc3QtbG9nL2Rpc3Qtc3JjL3ZlcnNpb24uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrcGx1Z2luLXJlcXVlc3QtbG9nQDYuMC4wX0BvY3Rva2l0K2NvcmVANy4wLjYvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L3BsdWdpbi1yZXF1ZXN0LWxvZy9kaXN0LXNyYy9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtwbHVnaW4tcGFnaW5hdGUtcmVzdEAxNC4wLjBfQG9jdG9raXQrY29yZUA3LjAuNi9ub2RlX21vZHVsZXMvQG9jdG9raXQvcGx1Z2luLXBhZ2luYXRlLXJlc3QvZGlzdC1idW5kbGUvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrcGx1Z2luLXJlc3QtZW5kcG9pbnQtbWV0aG9kc0AxNy4wLjBfQG9jdG9raXQrY29yZUA3LjAuNi9ub2RlX21vZHVsZXMvQG9jdG9raXQvc3JjL3ZlcnNpb24udHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrcGx1Z2luLXJlc3QtZW5kcG9pbnQtbWV0aG9kc0AxNy4wLjBfQG9jdG9raXQrY29yZUA3LjAuNi9ub2RlX21vZHVsZXMvQG9jdG9raXQvc3JjL2dlbmVyYXRlZC9lbmRwb2ludHMudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrcGx1Z2luLXJlc3QtZW5kcG9pbnQtbWV0aG9kc0AxNy4wLjBfQG9jdG9raXQrY29yZUA3LjAuNi9ub2RlX21vZHVsZXMvQG9jdG9raXQvc3JjL2VuZHBvaW50cy10by1tZXRob2RzLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3BsdWdpbi1yZXN0LWVuZHBvaW50LW1ldGhvZHNAMTcuMC4wX0BvY3Rva2l0K2NvcmVANy4wLjYvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L3NyYy9pbmRleC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtyZXN0QDIyLjAuMS9ub2RlX21vZHVsZXMvQG9jdG9raXQvcmVzdC9kaXN0LXNyYy92ZXJzaW9uLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3Jlc3RAMjIuMC4xL25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9yZXN0L2Rpc3Qtc3JjL2luZGV4LmpzIiwgImxpYi9mZXRjaC13b3JrZmxvdy1hcnRpZmFjdC50cyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFFQSxRQUFNLGFBQWEsU0FBU0EsY0FBYztBQUFBLElBQUU7QUFDNUMsZUFBVyxZQUFZLHVCQUFPLE9BQU8sSUFBSTtBQWdCekMsUUFBTSxVQUFVO0FBUWhCLFFBQU0sZUFBZTtBQVNyQixRQUFNLGNBQWM7QUFHcEIsUUFBTSxxQkFBcUIsRUFBRSxNQUFNLElBQUksWUFBWSxJQUFJLFdBQVcsRUFBRTtBQUNwRSxXQUFPLE9BQU8sbUJBQW1CLFVBQVU7QUFDM0MsV0FBTyxPQUFPLGtCQUFrQjtBQVVoQyxhQUFTQyxPQUFPLFFBQVE7QUFDdEIsVUFBSSxPQUFPLFdBQVcsVUFBVTtBQUM5QixjQUFNLElBQUksVUFBVSxrREFBa0Q7QUFBQSxNQUN4RTtBQUVBLFVBQUksUUFBUSxPQUFPLFFBQVEsR0FBRztBQUM5QixZQUFNLE9BQU8sVUFBVSxLQUNuQixPQUFPLE1BQU0sR0FBRyxLQUFLLEVBQUUsS0FBSyxJQUM1QixPQUFPLEtBQUs7QUFFaEIsVUFBSSxZQUFZLEtBQUssSUFBSSxNQUFNLE9BQU87QUFDcEMsY0FBTSxJQUFJLFVBQVUsb0JBQW9CO0FBQUEsTUFDMUM7QUFFQSxZQUFNLFNBQVM7QUFBQSxRQUNiLE1BQU0sS0FBSyxZQUFZO0FBQUEsUUFDdkIsWUFBWSxJQUFJLFdBQVc7QUFBQSxNQUM3QjtBQUdBLFVBQUksVUFBVSxJQUFJO0FB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QUFBLEVBQ3ZDO0FBQ0Y7OztBQ09BLGVBQWUsT0FBTztBQUNwQixRQUFNLENBQUMsT0FBTyxJQUFJLElBQUksUUFBUSxJQUFJLGtCQUFtQixNQUFNLEtBQUssQ0FBQztBQUNqRSxRQUFNLENBQUMsZUFBZSxZQUFZLElBQUksUUFBUSxLQUFLLE1BQU0sQ0FBQztBQUMxRCxRQUFNLGFBQWEsT0FBTyxhQUFhO0FBQ3ZDLFFBQU0sU0FBUyxJQUFJQyxTQUFRLEVBQUMsTUFBTSxRQUFRLElBQUksYUFBWSxDQUFDO0FBQzNELFFBQU0sWUFBWSxNQUFNLE9BQU8sUUFBUSx5QkFBeUI7QUFBQSxJQUM5RDtBQUFBLElBQ0E7QUFBQSxJQUNBLFFBQVE7QUFBQSxFQUNWLENBQUM7QUFFRCxRQUFNLGdCQUFnQixVQUFVLEtBQUssVUFBVSxLQUFLLENBQUMsYUFBYSxTQUFTLFNBQVMsWUFBWTtBQUVoRyxNQUFJLGtCQUFrQixRQUFXO0FBQy9CLFlBQVEsTUFBTSx3Q0FBd0MsVUFBVSxJQUFJLFlBQVksRUFBRTtBQUNsRixZQUFRLEtBQUssQ0FBQztBQUFBLEVBQ2hCO0FBRUEsUUFBTSxXQUFXLE1BQU0sT0FBTyxRQUFRLGlCQUFpQjtBQUFBLElBQ3JEO0FBQUEsSUFDQTtBQUFBLElBQ0EsYUFBYSxjQUFjO0FBQUEsSUFDM0IsZ0JBQWdCO0FBQUEsRUFDbEIsQ0FBQztBQUVELFVBQVEsT0FBTyxNQUFNLE9BQU8sS0FBSyxTQUFTLElBQWMsQ0FBQztBQUMzRDtBQUVBLElBQUk7QUFDRixRQUFNLEtBQUs7QUFDYixTQUFTLEdBQUc7QUFDVixVQUFRLE1BQU0sQ0FBQztBQUNmLFVBQVEsS0FBSyxDQUFDO0FBQ2hCOyIsCiAgIm5hbWVzIjogWyJOdWxsT2JqZWN0IiwgInBhcnNlIiwgInNhZmVQYXJzZSIsICJuYW1lIiwgIm1ldGhvZCIsICJob29rIiwgImhvb2siLCAidmFsdWUiLCAidGV4dCIsICJWRVJTSU9OIiwgImlzUGxhaW5PYmplY3QiLCAid2l0aERlZmF1bHRzIiwgIlZFUlNJT04iLCAid2l0aERlZmF1bHRzIiwgInJlcXVlc3QiLCAiZW5kcG9pbnQiLCAiVkVSU0lPTiIsICJub29wIiwgIlZFUlNJT04iLCAiaG9vayIsICJhdXRoIiwgIlZFUlNJT04iLCAicmVxdWVzdCIsICJWRVJTSU9OIiwgIlZFUlNJT04iLCAiVkVSU0lPTiIsICJWRVJTSU9OIiwgImVuZHBvaW50IiwgIm9wdGlvbnMiLCAiVkVSU0lPTiIsICJWRVJTSU9OIiwgIk9jdG9raXQiLCAiVkVSU0lPTiIsICJPY3Rva2l0Il0KfQo=
