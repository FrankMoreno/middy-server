import type { MiddyfiedHandler } from "@middy/core";
import { createServer, IncomingMessage, Server, ServerResponse } from "http";
import type {
  ALBResult,
  APIGatewayProxyResult,
  APIGatewayProxyResultV2,
  Context,
} from "aws-lambda";
import {
  convertALBResultToResponse,
  converRequestToALBEvent,
} from "./ALBEvent";
import {
  convertAPIGatewayProxyResultV2,
  convertRequestToAPIGatewayProxyEventV2,
} from "./APIGatewayProxyEventV2";

export type ServerEvent =
  | "APIGatewayProxyEvent"
  | "APIGatewayProxyEventV2"
  | "ALBEvent";

export type ServerResult =
  | "APIGatewayProxyResult"
  | "APIGatewayProxyResultV2"
  | "ALBResult";

export interface MiddyServerOptions {
  eventType?: ServerEvent;
}

export function middyServer(
  handler: MiddyfiedHandler,
  options: MiddyServerOptions = {
    eventType: "APIGatewayProxyEventV2",
  }
): Server<typeof IncomingMessage, typeof ServerResponse> {
  // TODO: Add option to merge duplicate requests
  const server = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const buffer: Buffer[] = [];

      req.on("error", (err) => {
        console.log(err);
      });

      req.on("data", (chunk) => {
        buffer.push(chunk);
      });

      req.on("end", async () => {
        try {
          const body = Buffer.concat(buffer).toString();

          const convertedRequest = getConvertedRequest(req, options, body);

          const result = await handler(convertedRequest, {} as Context);

          convertResponse(res, result, "APIGatewayProxyResultV2");
        } catch (error) {
          console.error(error);
          const e = error as Error;
          res.statusCode = 500;
          res.end(e.message);
        }
      });
    }
  );

  return server;
}

function getConvertedRequest(
  req: IncomingMessage,
  options: MiddyServerOptions,
  body?: string
) {
  switch (options.eventType) {
    case "APIGatewayProxyEvent":
      return null;
    case "APIGatewayProxyEventV2":
      return convertRequestToAPIGatewayProxyEventV2(req, body);
    case "ALBEvent":
      return converRequestToALBEvent(req, body);
  }
}

function convertResponse(
  res: ServerResponse,
  result: APIGatewayProxyResultV2 | APIGatewayProxyResult | ALBResult,
  serverResult: ServerResult
) {
  switch (serverResult) {
    case "APIGatewayProxyResult":
      return null;
    case "APIGatewayProxyResultV2":
      return convertAPIGatewayProxyResultV2(
        result as APIGatewayProxyResultV2,
        res
      );
    case "ALBResult":
      return convertALBResultToResponse(result as ALBResult, res);
  }
}
