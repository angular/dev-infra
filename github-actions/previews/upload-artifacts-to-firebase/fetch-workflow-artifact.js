import { createRequire } from 'node:module';globalThis['require'] ??= createRequire(import.meta.url);
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
    function parse3(header) {
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
    function safeParse3(header) {
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
    module.exports.default = { parse: parse3, safeParse: safeParse3 };
    module.exports.parse = parse3;
    module.exports.safeParse = safeParse3;
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
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
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
  const DEFAULTS22 = merge(oldDefaults, newDefaults);
  const endpoint22 = endpointWithDefaults.bind(null, DEFAULTS22);
  return Object.assign(endpoint22, {
    DEFAULTS: DEFAULTS22,
    defaults: withDefaults.bind(null, DEFAULTS22),
    merge: merge.bind(null, DEFAULTS22),
    parse
  });
}
var endpoint = withDefaults(null, DEFAULTS);

// 
var import_fast_content_type_parse = __toESM(require_fast_content_type_parse());

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
    super(message);
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
var VERSION2 = "10.0.3";
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
async function fetchWrapper(requestOptions) {
  const fetch = requestOptions.request?.fetch || globalThis.fetch;
  if (!fetch) {
    throw new Error(
      "fetch is not set. Please pass a fetch implementation as new Octokit({ request: { fetch }}). Learn more at https://github.com/octokit/octokit.js/#fetch-missing"
    );
  }
  const log = requestOptions.request?.log || console;
  const parseSuccessResponseBody = requestOptions.request?.parseSuccessResponseBody !== false;
  const body = isPlainObject2(requestOptions.body) || Array.isArray(requestOptions.body) ? JSON.stringify(requestOptions.body) : requestOptions.body;
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
    return response.text().catch(() => "");
  }
  const mimetype = (0, import_fast_content_type_parse.safeParse)(contentType);
  if (isJSONResponse(mimetype)) {
    let text = "";
    try {
      text = await response.text();
      return JSON.parse(text);
    } catch (err) {
      return text;
    }
  } else if (mimetype.type.startsWith("text/") || mimetype.parameters.charset?.toLowerCase() === "utf-8") {
    return response.text().catch(() => "");
  } else {
    return response.arrayBuffer().catch(() => new ArrayBuffer(0));
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
  const endpoint22 = oldEndpoint.defaults(newDefaults);
  const newApi = function(route, parameters) {
    const endpointOptions = endpoint22.merge(route, parameters);
    if (!endpointOptions.request || !endpointOptions.request.hook) {
      return fetchWrapper(endpoint22.parse(endpointOptions));
    }
    const request22 = (route2, parameters2) => {
      return fetchWrapper(
        endpoint22.parse(endpoint22.merge(route2, parameters2))
      );
    };
    Object.assign(request22, {
      endpoint: endpoint22,
      defaults: withDefaults2.bind(null, endpoint22)
    });
    return endpointOptions.request.hook(request22, endpointOptions);
  };
  return Object.assign(newApi, {
    endpoint: endpoint22,
    defaults: withDefaults2.bind(null, endpoint22)
  });
}
var request = withDefaults2(endpoint, defaults_default);

// 
var VERSION3 = "0.0.0-development";
var userAgent2 = `octokit-endpoint.js/${VERSION3} ${getUserAgent()}`;
var DEFAULTS2 = {
  method: "GET",
  baseUrl: "https://api.github.com",
  headers: {
    accept: "application/vnd.github.v3+json",
    "user-agent": userAgent2
  },
  mediaType: {
    format: ""
  }
};
function lowercaseKeys2(object) {
  if (!object) {
    return {};
  }
  return Object.keys(object).reduce((newObj, key) => {
    newObj[key.toLowerCase()] = object[key];
    return newObj;
  }, {});
}
function isPlainObject3(value) {
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
function mergeDeep2(defaults, options) {
  const result = Object.assign({}, defaults);
  Object.keys(options).forEach((key) => {
    if (isPlainObject3(options[key])) {
      if (!(key in defaults))
        Object.assign(result, { [key]: options[key] });
      else
        result[key] = mergeDeep2(defaults[key], options[key]);
    } else {
      Object.assign(result, { [key]: options[key] });
    }
  });
  return result;
}
function removeUndefinedProperties2(obj) {
  for (const key in obj) {
    if (obj[key] === void 0) {
      delete obj[key];
    }
  }
  return obj;
}
function merge2(defaults, route, options) {
  if (typeof route === "string") {
    let [method, url] = route.split(" ");
    options = Object.assign(url ? { method, url } : { url: method }, options);
  } else {
    options = Object.assign({}, route);
  }
  options.headers = lowercaseKeys2(options.headers);
  removeUndefinedProperties2(options);
  removeUndefinedProperties2(options.headers);
  const mergedOptions = mergeDeep2(defaults || {}, options);
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
function addQueryParameters2(url, parameters) {
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
var urlVariableRegex2 = /\{[^{}}]+\}/g;
function removeNonChars2(variableName) {
  return variableName.replace(/(?:^\W+)|(?:(?<!\W)\W+$)/g, "").split(/,/);
}
function extractUrlVariableNames2(url) {
  const matches = url.match(urlVariableRegex2);
  if (!matches) {
    return [];
  }
  return matches.map(removeNonChars2).reduce((a, b) => a.concat(b), []);
}
function omit2(object, keysToOmit) {
  const result = { __proto__: null };
  for (const key of Object.keys(object)) {
    if (keysToOmit.indexOf(key) === -1) {
      result[key] = object[key];
    }
  }
  return result;
}
function encodeReserved2(str) {
  return str.split(/(%[0-9A-Fa-f]{2})/g).map(function(part) {
    if (!/%[0-9A-Fa-f]/.test(part)) {
      part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
    }
    return part;
  }).join("");
}
function encodeUnreserved2(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });
}
function encodeValue2(operator, value, key) {
  value = operator === "+" || operator === "#" ? encodeReserved2(value) : encodeUnreserved2(value);
  if (key) {
    return encodeUnreserved2(key) + "=" + value;
  } else {
    return value;
  }
}
function isDefined2(value) {
  return value !== void 0 && value !== null;
}
function isKeyOperator2(operator) {
  return operator === ";" || operator === "&" || operator === "?";
}
function getValues2(context, operator, key, modifier) {
  var value = context[key], result = [];
  if (isDefined2(value) && value !== "") {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      value = value.toString();
      if (modifier && modifier !== "*") {
        value = value.substring(0, parseInt(modifier, 10));
      }
      result.push(
        encodeValue2(operator, value, isKeyOperator2(operator) ? key : "")
      );
    } else {
      if (modifier === "*") {
        if (Array.isArray(value)) {
          value.filter(isDefined2).forEach(function(value2) {
            result.push(
              encodeValue2(operator, value2, isKeyOperator2(operator) ? key : "")
            );
          });
        } else {
          Object.keys(value).forEach(function(k) {
            if (isDefined2(value[k])) {
              result.push(encodeValue2(operator, value[k], k));
            }
          });
        }
      } else {
        const tmp = [];
        if (Array.isArray(value)) {
          value.filter(isDefined2).forEach(function(value2) {
            tmp.push(encodeValue2(operator, value2));
          });
        } else {
          Object.keys(value).forEach(function(k) {
            if (isDefined2(value[k])) {
              tmp.push(encodeUnreserved2(k));
              tmp.push(encodeValue2(operator, value[k].toString()));
            }
          });
        }
        if (isKeyOperator2(operator)) {
          result.push(encodeUnreserved2(key) + "=" + tmp.join(","));
        } else if (tmp.length !== 0) {
          result.push(tmp.join(","));
        }
      }
    }
  } else {
    if (operator === ";") {
      if (isDefined2(value)) {
        result.push(encodeUnreserved2(key));
      }
    } else if (value === "" && (operator === "&" || operator === "?")) {
      result.push(encodeUnreserved2(key) + "=");
    } else if (value === "") {
      result.push("");
    }
  }
  return result;
}
function parseUrl2(template) {
  return {
    expand: expand2.bind(null, template)
  };
}
function expand2(template, context) {
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
          values.push(getValues2(context, operator, tmp[1], tmp[2] || tmp[3]));
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
        return encodeReserved2(literal);
      }
    }
  );
  if (template === "/") {
    return template;
  } else {
    return template.replace(/\/$/, "");
  }
}
function parse2(options) {
  let method = options.method.toUpperCase();
  let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{$1}");
  let headers = Object.assign({}, options.headers);
  let body;
  let parameters = omit2(options, [
    "method",
    "baseUrl",
    "url",
    "headers",
    "request",
    "mediaType"
  ]);
  const urlVariableNames = extractUrlVariableNames2(url);
  url = parseUrl2(url).expand(parameters);
  if (!/^http/.test(url)) {
    url = options.baseUrl + url;
  }
  const omittedParameters = Object.keys(options).filter((option) => urlVariableNames.includes(option)).concat("baseUrl");
  const remainingParameters = omit2(parameters, omittedParameters);
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
    url = addQueryParameters2(url, remainingParameters);
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
function endpointWithDefaults2(defaults, route, options) {
  return parse2(merge2(defaults, route, options));
}
function withDefaults3(oldDefaults, newDefaults) {
  const DEFAULTS22 = merge2(oldDefaults, newDefaults);
  const endpoint22 = endpointWithDefaults2.bind(null, DEFAULTS22);
  return Object.assign(endpoint22, {
    DEFAULTS: DEFAULTS22,
    defaults: withDefaults3.bind(null, DEFAULTS22),
    merge: merge2.bind(null, DEFAULTS22),
    parse: parse2
  });
}
var endpoint2 = withDefaults3(null, DEFAULTS2);

// 
var import_fast_content_type_parse2 = __toESM(require_fast_content_type_parse());
var VERSION4 = "10.0.5";
var defaults_default2 = {
  headers: {
    "user-agent": `octokit-request.js/${VERSION4} ${getUserAgent()}`
  }
};
function isPlainObject4(value) {
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
async function fetchWrapper2(requestOptions) {
  const fetch = requestOptions.request?.fetch || globalThis.fetch;
  if (!fetch) {
    throw new Error(
      "fetch is not set. Please pass a fetch implementation as new Octokit({ request: { fetch }}). Learn more at https://github.com/octokit/octokit.js/#fetch-missing"
    );
  }
  const log = requestOptions.request?.log || console;
  const parseSuccessResponseBody = requestOptions.request?.parseSuccessResponseBody !== false;
  const body = isPlainObject4(requestOptions.body) || Array.isArray(requestOptions.body) ? JSON.stringify(requestOptions.body) : requestOptions.body;
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
    octokitResponse.data = await getResponseData2(fetchResponse);
    throw new RequestError("Not modified", status, {
      response: octokitResponse,
      request: requestOptions
    });
  }
  if (status >= 400) {
    octokitResponse.data = await getResponseData2(fetchResponse);
    throw new RequestError(toErrorMessage2(octokitResponse.data), status, {
      response: octokitResponse,
      request: requestOptions
    });
  }
  octokitResponse.data = parseSuccessResponseBody ? await getResponseData2(fetchResponse) : fetchResponse.body;
  return octokitResponse;
}
async function getResponseData2(response) {
  const contentType = response.headers.get("content-type");
  if (!contentType) {
    return response.text().catch(() => "");
  }
  const mimetype = (0, import_fast_content_type_parse2.safeParse)(contentType);
  if (isJSONResponse2(mimetype)) {
    let text = "";
    try {
      text = await response.text();
      return JSON.parse(text);
    } catch (err) {
      return text;
    }
  } else if (mimetype.type.startsWith("text/") || mimetype.parameters.charset?.toLowerCase() === "utf-8") {
    return response.text().catch(() => "");
  } else {
    return response.arrayBuffer().catch(() => new ArrayBuffer(0));
  }
}
function isJSONResponse2(mimetype) {
  return mimetype.type === "application/json" || mimetype.type === "application/scim+json";
}
function toErrorMessage2(data) {
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
function withDefaults4(oldEndpoint, newDefaults) {
  const endpoint22 = oldEndpoint.defaults(newDefaults);
  const newApi = function(route, parameters) {
    const endpointOptions = endpoint22.merge(route, parameters);
    if (!endpointOptions.request || !endpointOptions.request.hook) {
      return fetchWrapper2(endpoint22.parse(endpointOptions));
    }
    const request22 = (route2, parameters2) => {
      return fetchWrapper2(
        endpoint22.parse(endpoint22.merge(route2, parameters2))
      );
    };
    Object.assign(request22, {
      endpoint: endpoint22,
      defaults: withDefaults4.bind(null, endpoint22)
    });
    return endpointOptions.request.hook(request22, endpointOptions);
  };
  return Object.assign(newApi, {
    endpoint: endpoint22,
    defaults: withDefaults4.bind(null, endpoint22)
  });
}
var request2 = withDefaults4(endpoint2, defaults_default2);

// 
var VERSION5 = "0.0.0-development";
function _buildMessageForResponseErrors(data) {
  return `Request failed due to following response errors:
` + data.errors.map((e) => ` - ${e.message}`).join("\n");
}
var GraphqlResponseError = class extends Error {
  constructor(request22, headers, response) {
    super(_buildMessageForResponseErrors(response));
    this.request = request22;
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
function graphql(request22, query, options) {
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
  const baseUrl = parsedOptions.baseUrl || request22.endpoint.DEFAULTS.baseUrl;
  if (GHES_V3_SUFFIX_REGEX.test(baseUrl)) {
    requestOptions.url = baseUrl.replace(GHES_V3_SUFFIX_REGEX, "/api/graphql");
  }
  return request22(requestOptions).then((response) => {
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
function withDefaults5(request22, newDefaults) {
  const newRequest = request22.defaults(newDefaults);
  const newApi = (query, options) => {
    return graphql(newRequest, query, options);
  };
  return Object.assign(newApi, {
    defaults: withDefaults5.bind(null, newRequest),
    endpoint: newRequest.endpoint
  });
}
var graphql2 = withDefaults5(request2, {
  headers: {
    "user-agent": `octokit-graphql.js/${VERSION5} ${getUserAgent()}`
  },
  method: "POST",
  url: "/graphql"
});
function withCustomRequest(customRequest) {
  return withDefaults5(customRequest, {
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
async function hook(token, request3, route, parameters) {
  const endpoint3 = request3.endpoint.merge(
    route,
    parameters
  );
  endpoint3.headers.authorization = withAuthorizationPrefix(token);
  return request3(endpoint3);
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
var VERSION6 = "7.0.4";

// 
var noop = () => {
};
var consoleWarn = console.warn.bind(console);
var consoleError = console.error.bind(console);
function createLogger(logger = {}) {
  if (typeof logger.debug !== "function") {
    logger.debug = noop;
  }
  if (typeof logger.info !== "function") {
    logger.info = noop;
  }
  if (typeof logger.warn !== "function") {
    logger.warn = consoleWarn;
  }
  if (typeof logger.error !== "function") {
    logger.error = consoleError;
  }
  return logger;
}
var userAgentTrail = `octokit-core.js/${VERSION6} ${getUserAgent()}`;
var Octokit = class {
  static VERSION = VERSION6;
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
var VERSION7 = "6.0.0";

// 
function requestLog(octokit) {
  octokit.hook.wrap("request", (request3, options) => {
    octokit.log.debug("request", options);
    const start = Date.now();
    const requestOptions = octokit.request.endpoint.parse(options);
    const path = requestOptions.url.replace(options.baseUrl, "");
    return request3(options).then((response) => {
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
requestLog.VERSION = VERSION7;

// 
var VERSION8 = "0.0.0-development";
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
paginateRest.VERSION = VERSION8;

// 
var VERSION9 = "16.1.0";

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
    createOrUpdateCustomProperties: ["PATCH /orgs/{org}/properties/schema"],
    createOrUpdateCustomPropertiesValuesForRepos: [
      "PATCH /orgs/{org}/properties/values"
    ],
    createOrUpdateCustomProperty: [
      "PUT /orgs/{org}/properties/schema/{custom_property_name}"
    ],
    createWebhook: ["POST /orgs/{org}/hooks"],
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
    get: ["GET /orgs/{org}"],
    getAllCustomProperties: ["GET /orgs/{org}/properties/schema"],
    getCustomProperty: [
      "GET /orgs/{org}/properties/schema/{custom_property_name}"
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
    listAttestations: ["GET /orgs/{org}/attestations/{subject_digest}"],
    listAttestationsBulk: [
      "POST /orgs/{org}/attestations/bulk-list{?per_page,before,after}"
    ],
    listBlockedUsers: ["GET /orgs/{org}/blocks"],
    listCustomPropertiesValuesForRepos: ["GET /orgs/{org}/properties/values"],
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
    removeCustomProperty: [
      "DELETE /orgs/{org}/properties/schema/{custom_property_name}"
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
    addItemForUser: ["POST /users/{user_id}/projectsV2/{project_number}/items"],
    deleteItemForOrg: [
      "DELETE /orgs/{org}/projectsV2/{project_number}/items/{item_id}"
    ],
    deleteItemForUser: [
      "DELETE /users/{user_id}/projectsV2/{project_number}/items/{item_id}"
    ],
    getFieldForOrg: [
      "GET /orgs/{org}/projectsV2/{project_number}/fields/{field_id}"
    ],
    getFieldForUser: [
      "GET /users/{user_id}/projectsV2/{project_number}/fields/{field_id}"
    ],
    getForOrg: ["GET /orgs/{org}/projectsV2/{project_number}"],
    getForUser: ["GET /users/{user_id}/projectsV2/{project_number}"],
    getOrgItem: ["GET /orgs/{org}/projectsV2/{project_number}/items/{item_id}"],
    getUserItem: [
      "GET /users/{user_id}/projectsV2/{project_number}/items/{item_id}"
    ],
    listFieldsForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/fields"],
    listFieldsForUser: [
      "GET /users/{user_id}/projectsV2/{project_number}/fields"
    ],
    listForOrg: ["GET /orgs/{org}/projectsV2"],
    listForUser: ["GET /users/{username}/projectsV2"],
    listItemsForOrg: ["GET /orgs/{org}/projectsV2/{project_number}/items"],
    listItemsForUser: [
      "GET /users/{user_id}/projectsV2/{project_number}/items"
    ],
    updateItemForOrg: [
      "PATCH /orgs/{org}/projectsV2/{project_number}/items/{item_id}"
    ],
    updateItemForUser: [
      "PATCH /users/{user_id}/projectsV2/{project_number}/items/{item_id}"
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
    createOrUpdateCustomPropertiesValues: [
      "PATCH /repos/{owner}/{repo}/properties/values"
    ],
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
    getCustomPropertiesValues: ["GET /repos/{owner}/{repo}/properties/values"],
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
    issuesAndPullRequests: [
      "GET /search/issues",
      {},
      {
        deprecated: "octokit.rest.search.issuesAndPullRequests() is deprecated, see https://docs.github.com/rest/search/search#search-issues-and-pull-requests"
      }
    ],
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
    listAlertsForEnterprise: [
      "GET /enterprises/{enterprise}/secret-scanning/alerts"
    ],
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
  for (const [methodName, endpoint3] of Object.entries(endpoints)) {
    const [route, defaults, decorations] = endpoint3;
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
restEndpointMethods.VERSION = VERSION9;
function legacyRestEndpointMethods(octokit) {
  const api = endpointsToMethods(octokit);
  return {
    ...api,
    rest: api
  };
}
legacyRestEndpointMethods.VERSION = VERSION9;

// 
var VERSION10 = "22.0.0";

// 
var Octokit2 = Octokit.plugin(requestLog, legacyRestEndpointMethods, paginateRest).defaults(
  {
    userAgent: `octokit-rest.js/${VERSION10}`
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvZmFzdC1jb250ZW50LXR5cGUtcGFyc2VAMy4wLjAvbm9kZV9tb2R1bGVzL2Zhc3QtY29udGVudC10eXBlLXBhcnNlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL3VuaXZlcnNhbC11c2VyLWFnZW50QDcuMC4zL25vZGVfbW9kdWxlcy91bml2ZXJzYWwtdXNlci1hZ2VudC9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9iZWZvcmUtYWZ0ZXItaG9va0A0LjAuMC9ub2RlX21vZHVsZXMvYmVmb3JlLWFmdGVyLWhvb2svbGliL3JlZ2lzdGVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL2JlZm9yZS1hZnRlci1ob29rQDQuMC4wL25vZGVfbW9kdWxlcy9iZWZvcmUtYWZ0ZXItaG9vay9saWIvYWRkLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL2JlZm9yZS1hZnRlci1ob29rQDQuMC4wL25vZGVfbW9kdWxlcy9iZWZvcmUtYWZ0ZXItaG9vay9saWIvcmVtb3ZlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL2JlZm9yZS1hZnRlci1ob29rQDQuMC4wL25vZGVfbW9kdWxlcy9iZWZvcmUtYWZ0ZXItaG9vay9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtlbmRwb2ludEAxMS4wLjAvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L2VuZHBvaW50L2Rpc3QtYnVuZGxlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3JlcXVlc3RAMTAuMC4zL25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9yZXF1ZXN0L2Rpc3QtYnVuZGxlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3JlcXVlc3QtZXJyb3JANy4wLjEvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L3JlcXVlc3QtZXJyb3IvZGlzdC1zcmMvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrZW5kcG9pbnRAMTEuMC4xL25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9lbmRwb2ludC9kaXN0LWJ1bmRsZS9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtyZXF1ZXN0QDEwLjAuNS9ub2RlX21vZHVsZXMvQG9jdG9raXQvcmVxdWVzdC9kaXN0LWJ1bmRsZS9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtncmFwaHFsQDkuMC4yL25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9ncmFwaHFsL2Rpc3QtYnVuZGxlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K2F1dGgtdG9rZW5ANi4wLjAvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L2F1dGgtdG9rZW4vZGlzdC1idW5kbGUvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrY29yZUA3LjAuNC9ub2RlX21vZHVsZXMvQG9jdG9raXQvY29yZS9kaXN0LXNyYy92ZXJzaW9uLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K2NvcmVANy4wLjQvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L2NvcmUvZGlzdC1zcmMvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrcGx1Z2luLXJlcXVlc3QtbG9nQDYuMC4wX2F0X29jdG9raXRfY29yZV83LjAuNC9ub2RlX21vZHVsZXMvQG9jdG9raXQvcGx1Z2luLXJlcXVlc3QtbG9nL2Rpc3Qtc3JjL3ZlcnNpb24uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrcGx1Z2luLXJlcXVlc3QtbG9nQDYuMC4wX2F0X29jdG9raXRfY29yZV83LjAuNC9ub2RlX21vZHVsZXMvQG9jdG9raXQvcGx1Z2luLXJlcXVlc3QtbG9nL2Rpc3Qtc3JjL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3BsdWdpbi1wYWdpbmF0ZS1yZXN0QDEzLjEuMV9hdF9vY3Rva2l0X2NvcmVfNy4wLjQvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L3BsdWdpbi1wYWdpbmF0ZS1yZXN0L2Rpc3QtYnVuZGxlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3BsdWdpbi1yZXN0LWVuZHBvaW50LW1ldGhvZHNAMTYuMS4wX2F0X29jdG9raXRfY29yZV83LjAuNC9ub2RlX21vZHVsZXMvQG9jdG9raXQvc3JjL3ZlcnNpb24udHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrcGx1Z2luLXJlc3QtZW5kcG9pbnQtbWV0aG9kc0AxNi4xLjBfYXRfb2N0b2tpdF9jb3JlXzcuMC40L25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9zcmMvZ2VuZXJhdGVkL2VuZHBvaW50cy50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtwbHVnaW4tcmVzdC1lbmRwb2ludC1tZXRob2RzQDE2LjEuMF9hdF9vY3Rva2l0X2NvcmVfNy4wLjQvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L3NyYy9lbmRwb2ludHMtdG8tbWV0aG9kcy50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtwbHVnaW4tcmVzdC1lbmRwb2ludC1tZXRob2RzQDE2LjEuMF9hdF9vY3Rva2l0X2NvcmVfNy4wLjQvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L3NyYy9pbmRleC50cyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtyZXN0QDIyLjAuMC9ub2RlX21vZHVsZXMvQG9jdG9raXQvcmVzdC9kaXN0LXNyYy92ZXJzaW9uLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3Jlc3RAMjIuMC4wL25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9yZXN0L2Rpc3Qtc3JjL2luZGV4LmpzIiwgImxpYi9mZXRjaC13b3JrZmxvdy1hcnRpZmFjdC50cyJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFFQSxRQUFNLGFBQWEsU0FBU0EsY0FBYztBQUFBLElBQUU7QUFDNUMsZUFBVyxZQUFZLHVCQUFPLE9BQU8sSUFBSTtBQWdCekMsUUFBTSxVQUFVO0FBUWhCLFFBQU0sZUFBZTtBQVNyQixRQUFNLGNBQWM7QUFHcEIsUUFBTSxxQkFBcUIsRUFBRSxNQUFNLElBQUksWUFBWSxJQUFJLFdBQVcsRUFBRTtBQUNwRSxXQUFPLE9BQU8sbUJBQW1CLFVBQVU7QUFDM0MsV0FBTyxPQUFPLGtCQUFrQjtBQVVoQyxhQUFTQyxPQUFPLFFBQVE7QUFDdEIsVUFBSSxPQUFPLFdBQVcsVUFBVTtBQUM5QixjQUFNLElBQUksVUFBVSxrREFBa0Q7QUFBQSxNQUN4RTtBQUVBLFVBQUksUUFBUSxPQUFPLFFBQVEsR0FBRztBQUM5QixZQUFNLE9BQU8sVUFBVSxLQUNuQixPQUFPLE1BQU0sR0FBRyxLQUFLLEVBQUUsS0FBSyxJQUM1QixPQUFPLEtBQUs7QUFFaEIsVUFBSSxZQUFZLEtBQUssSUFBSSxNQUFNLE9BQU87QUFD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QUMsTUFBTSxRQUFRLElBQUksYUFBWSxDQUFDO0FBQzNELFFBQU0sWUFBWSxNQUFNLE9BQU8sUUFBUSx5QkFBeUI7QUFBQSxJQUM5RDtBQUFBLElBQ0E7QUFBQSxJQUNBLFFBQVE7QUFBQSxFQUNWLENBQUM7QUFFRCxRQUFNLGdCQUFnQixVQUFVLEtBQUssVUFBVSxLQUFLLENBQUMsYUFBYSxTQUFTLFNBQVMsWUFBWTtBQUVoRyxNQUFJLGtCQUFrQixRQUFXO0FBQy9CLFlBQVEsTUFBTSx3Q0FBd0MsVUFBVSxJQUFJLFlBQVksRUFBRTtBQUNsRixZQUFRLEtBQUssQ0FBQztBQUFBLEVBQ2hCO0FBRUEsUUFBTSxXQUFXLE1BQU0sT0FBTyxRQUFRLGlCQUFpQjtBQUFBLElBQ3JEO0FBQUEsSUFDQTtBQUFBLElBQ0EsYUFBYSxjQUFjO0FBQUEsSUFDM0IsZ0JBQWdCO0FBQUEsRUFDbEIsQ0FBQztBQUVELFVBQVEsT0FBTyxNQUFNLE9BQU8sS0FBSyxTQUFTLElBQWMsQ0FBQztBQUMzRDtBQUVBLElBQUk7QUFDRixRQUFNLEtBQUs7QUFDYixTQUFTLEdBQUc7QUFDVixVQUFRLE1BQU0sQ0FBQztBQUNmLFVBQVEsS0FBSyxDQUFDO0FBQ2hCOyIsCiAgIm5hbWVzIjogWyJOdWxsT2JqZWN0IiwgInBhcnNlIiwgInNhZmVQYXJzZSIsICJuYW1lIiwgIm1ldGhvZCIsICJob29rIiwgImhvb2siLCAiREVGQVVMVFMyIiwgImVuZHBvaW50MiIsICJWRVJTSU9OIiwgImlzUGxhaW5PYmplY3QiLCAid2l0aERlZmF1bHRzIiwgImVuZHBvaW50MiIsICJyZXF1ZXN0MiIsICJWRVJTSU9OIiwgInVzZXJBZ2VudCIsICJERUZBVUxUUyIsICJsb3dlcmNhc2VLZXlzIiwgImlzUGxhaW5PYmplY3QiLCAibWVyZ2VEZWVwIiwgInJlbW92ZVVuZGVmaW5lZFByb3BlcnRpZXMiLCAibWVyZ2UiLCAiYWRkUXVlcnlQYXJhbWV0ZXJzIiwgInVybFZhcmlhYmxlUmVnZXgiLCAicmVtb3ZlTm9uQ2hhcnMiLCAiZXh0cmFjdFVybFZhcmlhYmxlTmFtZXMiLCAib21pdCIsICJlbmNvZGVSZXNlcnZlZCIsICJlbmNvZGVVbnJlc2VydmVkIiwgImVuY29kZVZhbHVlIiwgImlzRGVmaW5lZCIsICJpc0tleU9wZXJhdG9yIiwgImdldFZhbHVlcyIsICJwYXJzZVVybCIsICJleHBhbmQiLCAicGFyc2UiLCAiZW5kcG9pbnRXaXRoRGVmYXVsdHMiLCAid2l0aERlZmF1bHRzIiwgIkRFRkFVTFRTMiIsICJlbmRwb2ludDIiLCAiZW5kcG9pbnQiLCAiaW1wb3J0X2Zhc3RfY29udGVudF90eXBlX3BhcnNlIiwgIlZFUlNJT04iLCAiZGVmYXVsdHNfZGVmYXVsdCIsICJpc1BsYWluT2JqZWN0IiwgImZldGNoV3JhcHBlciIsICJnZXRSZXNwb25zZURhdGEiLCAidG9FcnJvck1lc3NhZ2UiLCAiaXNKU09OUmVzcG9uc2UiLCAid2l0aERlZmF1bHRzIiwgImVuZHBvaW50MiIsICJyZXF1ZXN0MiIsICJyZXF1ZXN0IiwgImVuZHBvaW50IiwgIlZFUlNJT04iLCAicmVxdWVzdDIiLCAid2l0aERlZmF1bHRzIiwgInJlcXVlc3QiLCAicmVxdWVzdCIsICJlbmRwb2ludCIsICJWRVJTSU9OIiwgIlZFUlNJT04iLCAiaG9vayIsICJhdXRoIiwgIlZFUlNJT04iLCAicmVxdWVzdCIsICJWRVJTSU9OIiwgIlZFUlNJT04iLCAiVkVSU0lPTiIsICJWRVJTSU9OIiwgImVuZHBvaW50IiwgIm9wdGlvbnMiLCAiVkVSU0lPTiIsICJWRVJTSU9OIiwgIk9jdG9raXQiLCAiVkVSU0lPTiIsICJPY3Rva2l0Il0KfQo=
