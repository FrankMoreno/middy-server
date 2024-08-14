import type {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import {
  type IncomingHttpHeaders,
  type IncomingMessage,
  type ServerResponse,
} from "http";
import type { MiddyServerOptions } from ".";

export function convertRequestToAPIGatewayProxyEventV2(
  req: IncomingMessage,
  options: MiddyServerOptions,
  body?: string
): APIGatewayProxyEventV2 {
  const url = new URL(getUrlPath(req.url), `http://localhost:${options.port}`);

  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: url.pathname,
    rawQueryString: url.search,
    cookies: undefined,
    headers: convertHeaders(req.headers),
    queryStringParameters: convertQueryParameters(url.searchParams),
    requestContext: getRequestContext(req, url), // TODO: Create a default for this, eventually allow someone to pass this in
    body,
    pathParameters: undefined,
    isBase64Encoded: false, // TODO: Better handle this,
    stageVariables: undefined, // TODO: Probably handle this
  };
}

function convertHeaders(
  headers: IncomingHttpHeaders
): Record<string, string | undefined> {
  let convertedHeaders: Record<string, string | undefined> = {};

  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      convertedHeaders[key] = value.join(",");
    } else {
      convertedHeaders[key] = value;
    }
  });

  return convertedHeaders;
}

function convertQueryParameters(queryParams: URLSearchParams) {
  if (queryParams.size === 0) {
    return undefined;
  }

  const queryObject: Record<string, string | undefined> = {};
  queryParams.forEach((value, key) => {
    queryObject[key] = value;
  });

  return queryObject;
}

// TODO: Add better defaults
function getRequestContext(
  req: IncomingMessage,
  url: URL
): APIGatewayEventRequestContextV2 {
  return {
    accountId: "accountId",
    apiId: "apiId",
    domainName: "domainName",
    domainPrefix: "domainPrefix",
    http: {
      method: req.method ?? "GET",
      path: url.pathname,
      protocol: "http",
      sourceIp: "sourceIp",
      userAgent: req.headers["user-agent"] ?? "",
    },
    requestId: "requestId",
    routeKey: "routeKey",
    stage: "stage",
    time: "time",
    timeEpoch: 0,
  };
}

function getUrlPath(url: string | undefined): string {
  return url ?? "/";
}

export function convertAPIGatewayProxyResultV2(
  result: APIGatewayProxyResultV2,
  response: ServerResponse
) {
  if (typeof result === "string") {
    response.statusCode = 200;
    response.end(result);
  }

  result = result as APIGatewayProxyStructuredResultV2;

  response.statusCode = result.statusCode ?? 200;

  if (result.headers) {
    Object.entries(result.headers).forEach(([key, value]) => {
      response.appendHeader(key, String(value));
    });
  }

  response.end(result.body ?? null);
}
