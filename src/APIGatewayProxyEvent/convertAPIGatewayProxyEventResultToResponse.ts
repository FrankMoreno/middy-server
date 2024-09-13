import { APIGatewayProxyResult } from "aws-lambda";
import { ServerResponse } from "http";

export function convertAPIGatewayProxyEventResultToResponse(
  result: APIGatewayProxyResult,
  response: ServerResponse
) {
  response.statusCode = result.statusCode;

  if (result.headers) {
    Object.entries(result.headers).forEach(([key, value]) => {
      response.appendHeader(key, String(value));
    });
  }

  if (result.multiValueHeaders) {
    Object.entries(result.multiValueHeaders).forEach(([key, value]) => {
      response.appendHeader(key, value.map(String));
    });
  }

  response.end(result.body ?? null);
}
