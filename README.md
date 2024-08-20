# Middy Server

Library to create an HTTP server from a [Middy](https://middy.js.org/) http router handler. Instead of deploying your handler to AWS or running locally with SAM, you can wrap it and run it as an http server.

## Installing

Using npm:

```bash
$ npm install middy-server
```

Using yarn:

```bash
$ yarn add middy-server
```

## Importing

Importing with ESM:

```javascript
import { middyServer } from "middy-server";
```

Importing with CJS:

```javascript
const middyServer = require("middy-server");
```

## Usage

This is designed to wrapp middy handlers that are using the [@middy/http-router](https://middy.js.org/docs/routers/http-router/) middleware. For example, take this middy handler:

```typescript
import middy, { type MiddyfiedHandler } from "@middy/core";
import httpRouterHandler from "@middy/http-router";
import type { Method } from "@middy/http-router";
import type {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

const getHandler = middy().handler(
  (event: APIGatewayEvent, context: Context): APIGatewayProxyResult => {
    return {
      statusCode: 200,
      body: '{"hello": "world"}',
    };
  }
);

const postHandler = middy().handler(
  (event: APIGatewayEvent, context: Context): APIGatewayProxyResult => {
    return {
      headers: { "content-type": "application/json" },
      statusCode: 201,
      body: String(event.body),
    };
  }
);

const routes = [
  {
    method: "GET" as Method,
    path: "/test",
    handler: getHandler,
  },
  {
    method: "POST" as Method,
    path: "/test",
    handler: postHandler,
  },
];

export const handler: MiddyfiedHandler = middy().handler(
  httpRouterHandler(routes)
);
```

To test this as an http server, you can create a new file:

```typescript
import { middyServer } from "middy-server";
import { handler } from "./middy_handler";

const server = middyServer(handler);
server.listen(3000, "localhost", () => {
  console.log("Server is running on http://localhost:3000");
});
```

That will start up an http server that will forward requests to your middy handler and convert both the requests and response.

```bash
$ curl http://localhost:3000/test
{"hello": "world"}

$ curl -d '{"test" : "123"}' http://localhost:3000/test
{"test" : "123"}
```

## Configuration

This is the available configuration for configuring the server:

```javascript
{
    // `eventType` is the type of lambda event being used by the Middy router
    // This defaults to APIGatewayProxyEventV2, but can also be set to APIGatewayProxyEvent or ALBEvent
    // This is dependent on what the event source is for your lambda in AWS
    eventType: "APIGatewayProxyEventV2",
}
```
