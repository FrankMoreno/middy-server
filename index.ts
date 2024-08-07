import type { MiddyfiedHandler } from "@middy/core";
import { createServer, IncomingMessage } from "http";
import { handler } from "./middy_handler";
import type { APIGatewayEvent } from "aws-lambda";

export function middyServer(handler: MiddyfiedHandler) {
  const hostname = "localhost";
  const port = 3000;

  const server = createServer((req, res) => {
    req;
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello World");
  });

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

export function convertRequestToAPIGatewayEvent(req: IncomingMessage) {
  let event: APIGatewayEvent = {
    headers: req.headers,
    body:
  };

  event.headers = req.headers;
  event.path = req.url as string;
}
middyServer(handler);
