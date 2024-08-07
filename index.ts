import type { MiddyfiedHandler } from "@middy/core";
import { createServer, IncomingMessage, ServerResponse, type IncomingHttpHeaders } from "http";
import { handler } from "./middy_handler";
import type { Context } from "aws-lambda";
import { convertRequestToAPIGatewayProxyEventV2 } from "./convertAPIGatewayProxyEventv2";

export function middyServer(handler: MiddyfiedHandler) {
  const hostname = "localhost";
  const port = 3000;

  // TODO: Add option to merge duplicate requests
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const convertedRequest = convertRequestToAPIGatewayProxyEventV2(req);
    const response = handler(convertedRequest, {} as Context, () => { });
    console.log(response);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello World");
  });

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

middyServer(handler);
