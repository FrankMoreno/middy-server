import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { IncomingMessage } from "http";
import {
  convertHeaders,
  convertQueryParameters,
  getMethodFromRequest,
  getURLFromPath,
} from "../utils";

export function convertRequestToAPIGatewayProxyEvent(
  req: IncomingMessage,
  body?: string
): APIGatewayProxyEvent {
  const url = getURLFromPath(req.url, req.headers.host);

  return {
    body: body ? body : null,
    headers: convertHeaders(req.headers),
    multiValueHeaders: {},
    httpMethod: getMethodFromRequest(req.method),
    isBase64Encoded: false,
    path: url.pathname,
    pathParameters: null,
    queryStringParameters: convertQueryParamsOrNull(url.searchParams),
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: getRequestContext(req, url),
    resource: url.pathname,
  };
}

function getRequestContext(
  req: IncomingMessage,
  url: URL
): APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext> {
  return {
    accountId: "accountId",
    apiId: "apiId",
    authorizer: {},
    protocol: "http",
    httpMethod: getMethodFromRequest(req.method),
    identity: {
      apiKey: null,
      apiKeyId: null,
      accessKey: null,
      accountId: null,
      caller: null,
      cognitoAuthenticationProvider: null,
      cognitoAuthenticationType: null,
      cognitoIdentityId: null,
      cognitoIdentityPoolId: null,
      principalOrgId: null,
      sourceIp: "IP",
      user: null,
      userAgent: "user-agent",
      userArn: null,
      clientCert: {
        clientCertPem: "CERT_CONTENT",
        subjectDN: "www.example.com",
        issuerDN: "Example issuer",
        serialNumber: "a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1",
        validity: {
          notBefore: "May 28 12:30:02 2019 GMT",
          notAfter: "Aug  5 09:36:04 2021 GMT",
        },
      },
    },
    path: url.pathname,
    stage: "$default",
    requestId: "requestId",
    requestTimeEpoch: 0,
    resourceId: "resourceId",
    resourcePath: url.pathname,
  };
}

function convertQueryParamsOrNull(queryParams: URLSearchParams) {
  if (queryParams.size === 0) {
    return null;
  }

  return convertQueryParameters(queryParams);
}
