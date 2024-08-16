import { ALBResult } from "aws-lambda";
import { ServerResponse } from "http";

export function converALBResultToResponse(
  result: ALBResult,
  response: ServerResponse
) {
  response.statusCode = result.statusCode;

  if (result.statusDescription) {
    response.statusMessage = result.statusDescription;
  }

  if (result.headers) {
    Object.entries(result.headers).forEach(([key, value]) => {
      response.appendHeader(key, String(value));
    });
  }

  if (result.multiValueHeaders) {
    Object.entries(result.multiValueHeaders).forEach(([key, value]) => {
      response.appendHeader(key, value);
    });
  }

  response.end(result.body ?? null);
}
