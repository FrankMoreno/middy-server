import type {
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import type { ServerResponse } from "http";

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
