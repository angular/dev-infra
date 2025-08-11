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
  if (typeof value !== "object" || value === null) return false;
  if (Object.prototype.toString.call(value) !== "[object Object]") return false;
  const proto = Object.getPrototypeOf(value);
  if (proto === null) return true;
  const Ctor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return typeof Ctor === "function" && Ctor instanceof Ctor && Function.prototype.call(Ctor) === Function.prototype.call(value);
}
function mergeDeep(defaults, options) {
  const result = Object.assign({}, defaults);
  Object.keys(options).forEach((key) => {
    if (isPlainObject(options[key])) {
      if (!(key in defaults)) Object.assign(result, { [key]: options[key] });
      else result[key] = mergeDeep(defaults[key], options[key]);
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
  if (typeof value !== "object" || value === null) return false;
  if (Object.prototype.toString.call(value) !== "[object Object]") return false;
  const proto = Object.getPrototypeOf(value);
  if (proto === null) return true;
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
      if (!FORBIDDEN_VARIABLE_OPTIONS.includes(key)) continue;
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
var VERSION4 = "7.0.3";

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
  if (!responseNeedsNormalization) return response;
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
        if (!url) return { done: true };
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
          if (error.status !== 409) throw error;
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
var VERSION7 = "16.0.0";

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
    setSelectedReposForOrgSecret: [
      "PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories"
    ],
    updateAlert: [
      "PATCH /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"
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
    list: ["GET /issues"],
    listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
    listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
    listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
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
    deleteIssueType: ["DELETE /orgs/{org}/issue-types/{issue_type_id}"],
    deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
    enableOrDisableSecurityProductOnAllOrgRepos: [
      "POST /orgs/{org}/{security_product}/{enablement}",
      {},
      {
        deprecated: "octokit.rest.orgs.enableOrDisableSecurityProductOnAllOrgRepos() is deprecated, see https://docs.github.com/rest/orgs/orgs#enable-or-disable-a-security-feature-for-an-organization"
      }
    ],
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
    listAttestations: ["GET /orgs/{org}/attestations/{subject_digest}"],
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
    updateAlert: [
      "PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"
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
var VERSION8 = "22.0.0";

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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvZmFzdC1jb250ZW50LXR5cGUtcGFyc2VAMy4wLjAvbm9kZV9tb2R1bGVzL2Zhc3QtY29udGVudC10eXBlLXBhcnNlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL3VuaXZlcnNhbC11c2VyLWFnZW50QDcuMC4zL25vZGVfbW9kdWxlcy91bml2ZXJzYWwtdXNlci1hZ2VudC9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9iZWZvcmUtYWZ0ZXItaG9va0A0LjAuMC9ub2RlX21vZHVsZXMvYmVmb3JlLWFmdGVyLWhvb2svbGliL3JlZ2lzdGVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL2JlZm9yZS1hZnRlci1ob29rQDQuMC4wL25vZGVfbW9kdWxlcy9iZWZvcmUtYWZ0ZXItaG9vay9saWIvYWRkLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL2JlZm9yZS1hZnRlci1ob29rQDQuMC4wL25vZGVfbW9kdWxlcy9iZWZvcmUtYWZ0ZXItaG9vay9saWIvcmVtb3ZlLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL2JlZm9yZS1hZnRlci1ob29rQDQuMC4wL25vZGVfbW9kdWxlcy9iZWZvcmUtYWZ0ZXItaG9vay9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtlbmRwb2ludEAxMS4wLjAvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L2VuZHBvaW50L2Rpc3QtYnVuZGxlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3JlcXVlc3RAMTAuMC4zL25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9yZXF1ZXN0L2Rpc3QtYnVuZGxlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3JlcXVlc3QtZXJyb3JANy4wLjAvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L3JlcXVlc3QtZXJyb3IvZGlzdC1zcmMvaW5kZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrZ3JhcGhxbEA5LjAuMS9ub2RlX21vZHVsZXMvQG9jdG9raXQvZ3JhcGhxbC9kaXN0LWJ1bmRsZS9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCthdXRoLXRva2VuQDYuMC4wL25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9hdXRoLXRva2VuL2Rpc3QtYnVuZGxlL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K2NvcmVANy4wLjMvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L2NvcmUvZGlzdC1zcmMvdmVyc2lvbi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtjb3JlQDcuMC4zL25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9jb3JlL2Rpc3Qtc3JjL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3BsdWdpbi1yZXF1ZXN0LWxvZ0A2LjAuMF9hdF9vY3Rva2l0X2NvcmVfNy4wLjMvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L3BsdWdpbi1yZXF1ZXN0LWxvZy9kaXN0LXNyYy92ZXJzaW9uLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3BsdWdpbi1yZXF1ZXN0LWxvZ0A2LjAuMF9hdF9vY3Rva2l0X2NvcmVfNy4wLjMvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L3BsdWdpbi1yZXF1ZXN0LWxvZy9kaXN0LXNyYy9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtwbHVnaW4tcGFnaW5hdGUtcmVzdEAxMy4xLjFfYXRfb2N0b2tpdF9jb3JlXzcuMC4zL25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9wbHVnaW4tcGFnaW5hdGUtcmVzdC9kaXN0LWJ1bmRsZS9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtwbHVnaW4tcmVzdC1lbmRwb2ludC1tZXRob2RzQDE2LjAuMF9hdF9vY3Rva2l0X2NvcmVfNy4wLjMvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L3NyYy92ZXJzaW9uLnRzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8uYXNwZWN0X3J1bGVzX2pzL0BvY3Rva2l0K3BsdWdpbi1yZXN0LWVuZHBvaW50LW1ldGhvZHNAMTYuMC4wX2F0X29jdG9raXRfY29yZV83LjAuMy9ub2RlX21vZHVsZXMvQG9jdG9raXQvc3JjL2dlbmVyYXRlZC9lbmRwb2ludHMudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrcGx1Z2luLXJlc3QtZW5kcG9pbnQtbWV0aG9kc0AxNi4wLjBfYXRfb2N0b2tpdF9jb3JlXzcuMC4zL25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9zcmMvZW5kcG9pbnRzLXRvLW1ldGhvZHMudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrcGx1Z2luLXJlc3QtZW5kcG9pbnQtbWV0aG9kc0AxNi4wLjBfYXRfb2N0b2tpdF9jb3JlXzcuMC4zL25vZGVfbW9kdWxlcy9Ab2N0b2tpdC9zcmMvaW5kZXgudHMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5hc3BlY3RfcnVsZXNfanMvQG9jdG9raXQrcmVzdEAyMi4wLjAvbm9kZV9tb2R1bGVzL0BvY3Rva2l0L3Jlc3QvZGlzdC1zcmMvdmVyc2lvbi5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLmFzcGVjdF9ydWxlc19qcy9Ab2N0b2tpdCtyZXN0QDIyLjAuMC9ub2RlX21vZHVsZXMvQG9jdG9raXQvcmVzdC9kaXN0LXNyYy9pbmRleC5qcyIsICJsaWIvZmV0Y2gtd29ya2Zsb3ctYXJ0aWZhY3QudHMiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBRUEsUUFBTSxhQUFhLFNBQVNBLGNBQWM7QUFBQSxJQUFFO0FBQzVDLGVBQVcsWUFBWSx1QkFBTyxPQUFPLElBQUk7QUFnQnpDLFFBQU0sVUFBVTtBQVFoQixRQUFNLGVBQWU7QUFTckIsUUFBTSxjQUFjO0FBR3BCLFFBQU0scUJBQXFCLEVBQUUsTUFBTSxJQUFJLFlBQVksSUFBSSxXQUFXLEVBQUU7QUFDcEUsV0FBTyxPQUFPLG1CQUFtQixVQUFVO0FBQzNDLFdBQU8sT0FBTyxrQkFBa0I7QUFVaEMsYUFBU0MsT0FBTyxRQUFRO0FBQ3RCLFVBQUksT0FBTyxXQUFXLFVBQVU7QUFDOUIsY0FBTSxJQUFJLFVBQVUsa0RBQWtEO0FBQUEsTUFDeEU7QUFFQSxVQUFJLFFBQVEsT0FBTyxRQUFRLEdBQUc7QUFDOUIsWUFBTSxPQUFPLFVBQVUsS0FDbkIsT0FBTyxNQUFNLEdBQUcsS0FBSyxFQUFFLEtBQUssSUFDNUIsT0FBTyxLQUFLO0FBRWhCLFVBQUksWUFBWSxLQUFLLElBQUksTUFBTSxPQUFPO0FBQ3BDLGNBQU0sSUFBSSxVQUFVLG9CQUFvQjtBQUFBLE1BQzFDO0FBRUEsWUFBTSxTQUFTO0FBQUEsUUFDYixNQUFNLEtBQUssWUFBWTtBQUFBLFFBQ3ZCLFlBQVksSUFBSSxXQUFXO0FBQUEsTUFDN0I7QUFHQSxVQUFJLFVBQVUsSUFBSTtBQUNoQixlQUFPO0FBQUEsTUFDVDtBQUVBLFVBQUk7QUFDSixVQUFJO0FBQ0osVUFBSTtBQUVKLGNBQVEsWUFBWTtBQUVwQixhQUFRLFFBQVEsUUFBUSxLQUFLLE1BQU0sR0FBSTtB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V0FBVTs7O0FDT2hCLElBQU1DLFdBQVUsUUFBSyxPQUFPLFlBQVksMkJBQTJCLFlBQVksRUFBRTtBQUFBLEVBQy9FO0FBQUEsSUFDRSxXQUFXLG1CQUFtQkMsUUFBTztBQUFBLEVBQ3ZDO0FBQ0Y7OztBQ09BLGVBQWUsT0FBTztBQUNwQixRQUFNLENBQUMsT0FBTyxJQUFJLElBQUksUUFBUSxJQUFJLGtCQUFtQixNQUFNLEtBQUssQ0FBQztBQUNqRSxRQUFNLENBQUMsZUFBZSxZQUFZLElBQUksUUFBUSxLQUFLLE1BQU0sQ0FBQztBQUMxRCxRQUFNLGFBQWEsT0FBTyxhQUFhO0FBQ3ZDLFFBQU0sU0FBUyxJQUFJQyxTQUFRLEVBQUMsTUFBTSxRQUFRLElBQUksYUFBWSxDQUFDO0FBQzNELFFBQU0sWUFBWSxNQUFNLE9BQU8sUUFBUSx5QkFBeUI7QUFBQSxJQUM5RDtBQUFBLElBQ0E7QUFBQSxJQUNBLFFBQVE7QUFBQSxFQUNWLENBQUM7QUFFRCxRQUFNLGdCQUFnQixVQUFVLEtBQUssVUFBVSxLQUFLLENBQUMsYUFBYSxTQUFTLFNBQVMsWUFBWTtBQUVoRyxNQUFJLGtCQUFrQixRQUFXO0FBQy9CLFlBQVEsTUFBTSx3Q0FBd0MsVUFBVSxJQUFJLFlBQVksRUFBRTtBQUNsRixZQUFRLEtBQUssQ0FBQztBQUFBLEVBQ2hCO0FBRUEsUUFBTSxXQUFXLE1BQU0sT0FBTyxRQUFRLGlCQUFpQjtBQUFBLElBQ3JEO0FBQUEsSUFDQTtBQUFBLElBQ0EsYUFBYSxjQUFjO0FBQUEsSUFDM0IsZ0JBQWdCO0FBQUEsRUFDbEIsQ0FBQztBQUVELFVBQVEsT0FBTyxNQUFNLE9BQU8sS0FBSyxTQUFTLElBQWMsQ0FBQztBQUMzRDtBQUVBLElBQUk7QUFDRixRQUFNLEtBQUs7QUFDYixTQUFTLEdBQUc7QUFDVixVQUFRLE1BQU0sQ0FBQztBQUNmLFVBQVEsS0FBSyxDQUFDO0FBQ2hCOyIsCiAgIm5hbWVzIjogWyJOdWxsT2JqZWN0IiwgInBhcnNlIiwgInNhZmVQYXJzZSIsICJuYW1lIiwgIm1ldGhvZCIsICJob29rIiwgImhvb2siLCAiVkVSU0lPTiIsICJpc1BsYWluT2JqZWN0IiwgIndpdGhEZWZhdWx0cyIsICJWRVJTSU9OIiwgIndpdGhEZWZhdWx0cyIsICJyZXF1ZXN0IiwgImVuZHBvaW50IiwgIlZFUlNJT04iLCAiVkVSU0lPTiIsICJob29rIiwgImF1dGgiLCAiVkVSU0lPTiIsICJyZXF1ZXN0IiwgIlZFUlNJT04iLCAiVkVSU0lPTiIsICJWRVJTSU9OIiwgIlZFUlNJT04iLCAiZW5kcG9pbnQiLCAib3B0aW9ucyIsICJWRVJTSU9OIiwgIlZFUlNJT04iLCAiT2N0b2tpdCIsICJWRVJTSU9OIiwgIk9jdG9raXQiXQp9Cg==
