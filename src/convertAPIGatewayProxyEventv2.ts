import type {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithRequestContext,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import {
  type IncomingHttpHeaders,
  type IncomingMessage,
  type ServerResponse,
} from "http";

export function convertRequestToAPIGatewayProxyEventV2(
  req: IncomingMessage,
  body?: string
): APIGatewayProxyEventV2 {
  const url = getUrlPath(req.url);

  return {
    headers: convertHeaders(req.headers),
    body,
    httpMethod: req.method ?? "GET",
    isBase64Encoded: false, // TODO: Better handle this,
    path: getUrlPath(req.url),
    pathParameters: undefined,
    queryStringParameters: getQueryParameters(
      url,
      req.headers.host ?? "http//localhost:3000" // TODO: Handle this
    ),
    multiValueQueryStringParameters: null,
    stageVariables: undefined, // TODO: Probably handle this
    requestContext:
      {} as unknown as APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>, // TODO: Create a default for this, eventually allow someone to pass this in
    resource: url,
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

function getQueryParameters(url: string, host: string) {
  const fullURL = new URL(url, host);

  const queryParams = new URLSearchParams(fullURL.search);
  if (queryParams.size === 0) {
    return undefined;
  }

  const queryObject: { [key: string]: string } = {};
  queryParams.forEach((value, key) => {
    queryObject[key] = value;
  });

  return queryObject;
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
