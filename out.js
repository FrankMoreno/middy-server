"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var local_middy_wrapper_exports = {};
__export(local_middy_wrapper_exports, {
  middyServer: () => middyServer
});
module.exports = __toCommonJS(local_middy_wrapper_exports);
var import_http = require("http");

// node_modules/@middy/core/index.js
var import_node_stream = require("node:stream");
var import_promises = require("node:stream/promises");
var import_promises2 = require("node:timers/promises");
var defaultLambdaHandler = () => {
};
var defaultPlugin = {
  timeoutEarlyInMillis: 5,
  timeoutEarlyResponse: () => {
    throw new Error("Timeout");
  },
  streamifyResponse: false
  // Deprecate need for this when AWS provides a flag for when it's looking for it
};
var middy = (lambdaHandler = defaultLambdaHandler, plugin = {}) => {
  if (typeof lambdaHandler !== "function") {
    plugin = lambdaHandler;
    lambdaHandler = defaultLambdaHandler;
  }
  plugin = {
    ...defaultPlugin,
    ...plugin
  };
  plugin.timeoutEarly = plugin.timeoutEarlyInMillis > 0;
  plugin.beforePrefetch?.();
  const beforeMiddlewares = [];
  const afterMiddlewares = [];
  const onErrorMiddlewares = [];
  const middyHandler = (event = {}, context = {}) => {
    plugin.requestStart?.();
    const request = {
      event,
      context,
      response: void 0,
      error: void 0,
      internal: plugin.internal ?? {}
    };
    return runRequest(request, [
      ...beforeMiddlewares
    ], lambdaHandler, [
      ...afterMiddlewares
    ], [
      ...onErrorMiddlewares
    ], plugin);
  };
  const middy2 = plugin.streamifyResponse ? awslambda.streamifyResponse(async (event, responseStream, context) => {
    const handlerResponse = await middyHandler(event, context);
    let handlerBody = handlerResponse;
    if (handlerResponse.statusCode) {
      handlerBody = handlerResponse.body ?? "";
      responseStream = awslambda.HttpResponseStream.from(responseStream, handlerResponse);
    }
    let handlerStream;
    if (handlerBody._readableState) {
      handlerStream = handlerBody;
    } else if (typeof handlerBody === "string") {
      function* iterator(input) {
        const size = 16384;
        let position = 0;
        const length = input.length;
        while (position < length) {
          yield input.substring(position, position + size);
          position += size;
        }
      }
      handlerStream = import_node_stream.Readable.from(iterator(handlerBody));
    }
    if (!handlerStream) {
      throw new Error("handler response not a ReadableStream");
    }
    await (0, import_promises.pipeline)(handlerStream, responseStream);
  }) : middyHandler;
  middy2.use = (middlewares) => {
    if (!Array.isArray(middlewares)) {
      middlewares = [
        middlewares
      ];
    }
    for (const middleware of middlewares) {
      const { before, after, onError } = middleware;
      if (!before && !after && !onError) {
        throw new Error('Middleware must be an object containing at least one key among "before", "after", "onError"');
      }
      if (before) middy2.before(before);
      if (after) middy2.after(after);
      if (onError) middy2.onError(onError);
    }
    return middy2;
  };
  middy2.before = (beforeMiddleware) => {
    beforeMiddlewares.push(beforeMiddleware);
    return middy2;
  };
  middy2.after = (afterMiddleware) => {
    afterMiddlewares.unshift(afterMiddleware);
    return middy2;
  };
  middy2.onError = (onErrorMiddleware) => {
    onErrorMiddlewares.unshift(onErrorMiddleware);
    return middy2;
  };
  middy2.handler = (replaceLambdaHandler) => {
    lambdaHandler = replaceLambdaHandler;
    return middy2;
  };
  return middy2;
};
var runRequest = async (request, beforeMiddlewares, lambdaHandler, afterMiddlewares, onErrorMiddlewares, plugin) => {
  let timeoutAbort;
  const timeoutEarly = plugin.timeoutEarly && request.context.getRemainingTimeInMillis;
  try {
    await runMiddlewares(request, beforeMiddlewares, plugin);
    if (typeof request.response === "undefined") {
      plugin.beforeHandler?.();
      const handlerAbort = new AbortController();
      if (timeoutEarly) timeoutAbort = new AbortController();
      request.response = await Promise.race([
        lambdaHandler(request.event, request.context, {
          signal: handlerAbort.signal
        }),
        timeoutEarly ? (0, import_promises2.setTimeout)(request.context.getRemainingTimeInMillis() - plugin.timeoutEarlyInMillis, void 0, {
          signal: timeoutAbort.signal
        }).then(() => {
          handlerAbort.abort();
          return plugin.timeoutEarlyResponse();
        }) : Promise.race([])
      ]);
      timeoutAbort?.abort();
      plugin.afterHandler?.();
      await runMiddlewares(request, afterMiddlewares, plugin);
    }
  } catch (e) {
    timeoutAbort?.abort();
    request.response = void 0;
    request.error = e;
    try {
      await runMiddlewares(request, onErrorMiddlewares, plugin);
    } catch (e2) {
      e2.originalError = request.error;
      request.error = e2;
      throw request.error;
    }
    if (typeof request.response === "undefined") throw request.error;
  } finally {
    await plugin.requestEnd?.(request);
  }
  return request.response;
};
var runMiddlewares = async (request, middlewares, plugin) => {
  for (const nextMiddleware of middlewares) {
    plugin.beforeMiddleware?.(nextMiddleware.name);
    const res = await nextMiddleware(request);
    plugin.afterMiddleware?.(nextMiddleware.name);
    if (typeof res !== "undefined") {
      request.response = res;
      return;
    }
  }
};
var core_default = middy;

// node_modules/@middy/util/index.js
var createErrorRegexp = /[^a-zA-Z]/g;
var HttpError = class extends Error {
  constructor(code, message, options = {}) {
    if (message && typeof message !== "string") {
      options = message;
      message = void 0;
    }
    message ??= httpErrorCodes[code];
    super(message, options);
    const name = httpErrorCodes[code].replace(createErrorRegexp, "");
    this.name = name.substr(-5) !== "Error" ? name + "Error" : name;
    this.status = this.statusCode = code;
    this.expose = options.expose ?? code < 500;
  }
};
var createError = (code, message, properties = {}) => {
  return new HttpError(code, message, properties);
};
var httpErrorCodes = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  306: "(Unused)",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot",
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Unordered Collection",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  509: "Bandwidth Limit Exceeded",
  510: "Not Extended",
  511: "Network Authentication Required"
};

// node_modules/@middy/http-router/index.js
var httpRouteHandler = (routes2) => {
  const routesStatic = {};
  const routesDynamic = {};
  const enumMethods = methods.concat("ANY");
  for (const route of routes2) {
    let { method, path, handler: handler2 } = route;
    if (!enumMethods.includes(method)) {
      throw new Error("[http-router] Method not allowed");
    }
    if (path.endsWith("/") && path !== "/") {
      path = path.substr(0, path.length - 1);
    }
    if (path.indexOf("{") < 0) {
      attachStaticRoute(method, path, handler2, routesStatic);
      continue;
    }
    attachDynamicRoute(method, path, handler2, routesDynamic);
  }
  return (event, context, abort) => {
    const { method, path } = getVersionRoute[pickVersion(event)]?.(event);
    if (!method) {
      throw new Error("[http-router] Unknown http event format");
    }
    const handler2 = routesStatic[method]?.[path];
    if (typeof handler2 !== "undefined") {
      return handler2(event, context, abort);
    }
    for (const route of routesDynamic[method] ?? []) {
      const match = path.match(route.path);
      if (match) {
        event.pathParameters = {
          ...match.groups,
          ...event.pathParameters
        };
        return route.handler(event, context, abort);
      }
    }
    throw createError(404, "Route does not exist");
  };
};
var regexpDynamicWildcards = /\/\{(proxy)\+\}$/;
var regexpDynamicParameters = /\/\{([^/]+)\}/g;
var methods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD"
];
var attachStaticRoute = (method, path, handler2, routesType) => {
  if (method === "ANY") {
    for (const method2 of methods) {
      attachStaticRoute(method2, path, handler2, routesType);
    }
    return;
  }
  if (!routesType[method]) {
    routesType[method] = {};
  }
  routesType[method][path] = handler2;
  routesType[method][path + "/"] = handler2;
};
var attachDynamicRoute = (method, path, handler2, routesType) => {
  if (method === "ANY") {
    for (const method2 of methods) {
      attachDynamicRoute(method2, path, handler2, routesType);
    }
    return;
  }
  if (!routesType[method]) {
    routesType[method] = [];
  }
  path = path.replace(regexpDynamicWildcards, "/?(?<$1>.*)").replace(regexpDynamicParameters, "/(?<$1>[^/]+)");
  path = new RegExp(`^${path}/?$`);
  routesType[method].push({
    path,
    handler: handler2
  });
};
var pickVersion = (event) => {
  return event.version ?? (event.method ? "vpc" : "1.0");
};
var getVersionRoute = {
  "1.0": (event) => ({
    method: event.httpMethod,
    path: event.path
  }),
  "2.0": (event) => ({
    method: event.requestContext.http.method,
    path: event.requestContext.http.path
  }),
  vpc: (event) => ({
    method: event.method,
    path: event.raw_path.split("?")[0]
  })
};
var http_router_default = httpRouteHandler;

// middy_handler.ts
var getHandler = core_default().handler(
  (event, context) => {
    return {
      statusCode: 200,
      body: "{}"
    };
  }
);
var postHandler = core_default().handler(
  (event, context) => {
    return {
      statusCode: 200,
      body: "{...}"
    };
  }
);
var routes = [
  {
    method: "GET",
    path: "/user/{id}",
    handler: getHandler
  },
  {
    method: "POST",
    path: "/user",
    handler: postHandler
  }
];
var handler = core_default().handler(http_router_default(routes));

// index.ts
function middyServer(handler2) {
  const hostname = "localhost";
  const port = 3e3;
  const server = (0, import_http.createServer)((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello World");
  });
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}
middyServer(handler);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  middyServer
});
