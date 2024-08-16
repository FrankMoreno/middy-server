import { ALBEvent, ALBEventRequestContext } from "aws-lambda";
import { IncomingMessage } from "http";
import {
  convertHeaders,
  convertQueryParameters,
  getURLFromPath,
} from "../utils";

export function converRequestToALBEvent(
  req: IncomingMessage,
  body?: string
): ALBEvent {
  const url = getURLFromPath(req.url, req.headers.host);

  return {
    requestContext: getALBRequestContext(),
    httpMethod: req.method ?? "GET",
    path: url.pathname,
    headers: convertHeaders(req.headers),
    queryStringParameters: convertQueryParameters(url.searchParams),
    multiValueHeaders: undefined,
    multiValueQueryStringParameters: undefined,
    body: body ?? null,
    isBase64Encoded: false,
  };
}

function getALBRequestContext(): ALBEventRequestContext {
  return {
    elb: {
      targetGroupArn: "targetGroupArn",
    },
  };
}
