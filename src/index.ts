import type { MiddyfiedHandler } from "@middy/core";
import { createServer, IncomingMessage, request, ServerResponse } from "http";
import type {
  ALBEvent,
  ALBResult,
  APIGatewayProxyEvent,
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  APIGatewayProxyResultV2,
  Context,
} from "aws-lambda";
import {
  convertAPIGatewayProxyResultV2,
  convertRequestToAPIGatewayProxyEventV2,
} from "./convertAPIGatewayProxyEventv2";

export type ServerEvent =
  | "APIGatewayProxyEvent"
  | "APIGatewayProxyEventV2"
  | "ALBEvent";

export type ServerResult =
  | "APIGatewayProxyResult"
  | "APIGatewayProxyResultV2"
  | "ALBResult";

export interface middyServerOptions {
  host: string;
  port: number;
  eventType: ServerEvent;
}

export function middyServer(
  handler: MiddyfiedHandler,
  options: middyServerOptions = {
    host: "localhost",
    port: 3000,
    eventType: "APIGatewayProxyEventV2",
  }
) {
  const hostname = "localhost";
  const port = 3000;

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
        const body = Buffer.concat(buffer).toString();
        const convertedRequest = getConvertedRequest(
          req,
          options.eventType,
          body
        );
        console.log(convertedRequest);
        try {
          const result = await handler(
            convertedRequest,
            {} as Context,
            () => {}
          );
          convertResponse(res, result, "APIGatewayProxyResultV2");
        } catch (error) {
          console.log(error);
          res.statusCode = 500;
          res.end();
        }
      });
    }
  );

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

function getConvertedRequest(
  req: IncomingMessage,
  eventType: ServerEvent,
  body?: string
) {
  switch (eventType) {
    case "APIGatewayProxyEvent":
      return null;
    case "APIGatewayProxyEventV2":
      return convertRequestToAPIGatewayProxyEventV2(req, body);
    case "ALBEvent":
      return null;
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
      return convertAPIGatewayProxyResultV2(result, res);
    case "ALBResult":
  }
}
