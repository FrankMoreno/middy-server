import type {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import type { IncomingMessage } from "http";
import {
  convertHeaders,
  convertQueryParameters,
  getMethodFromRequest,
  getURLFromPath,
} from "../utils";

export function convertRequestToAPIGatewayProxyEventV2(
  req: IncomingMessage,
  body?: string
): APIGatewayProxyEventV2 {
  const url = getURLFromPath(req.url, req.headers.host);

  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: url.pathname,
    rawQueryString: url.search,
    cookies: undefined,
    headers: convertHeaders(req.headers),
    queryStringParameters: convertQueryParamsOrUndefined(url.searchParams),
    requestContext: getRequestContext(req, url), // TODO: Create a default for this, eventually allow someone to pass this in
    body,
    pathParameters: undefined,
    isBase64Encoded: false, // TODO: Better handle this,
    stageVariables: undefined, // TODO: Probably handle this
  };
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
      method: getMethodFromRequest(req.method),
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

function convertQueryParamsOrUndefined(queryParams: URLSearchParams) {
  if (queryParams.size === 0) {
    return undefined;
  }

  return convertQueryParameters(queryParams);
}
