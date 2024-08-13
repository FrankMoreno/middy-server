import middy, { type MiddyfiedHandler } from "@middy/core";
import httpRouterHandler from "@middy/http-router";
import type { Method } from "@middy/http-router";
import type { APIGatewayEvent, Context } from "aws-lambda";

const getHandler = middy().handler(
  (event: APIGatewayEvent, context: Context) => {
    console.log(event.pathParameters);
    return {
      statusCode: 200,
      body: "{}",
    };
  }
);

const postHandler = middy().handler(
  (event: APIGatewayEvent, context: Context) => {
    return {
      headers: { "content-type": "application/json" },
      statusCode: 201,
      body: '{"hello": "world"}',
    };
  }
);

const routes = [
  {
    method: "GET" as Method,
    path: "/user/{id}",
    handler: getHandler,
  },
  {
    method: "GET" as Method,
    path: "/user",
    handler: postHandler,
  },
];

export const handler: MiddyfiedHandler = middy().handler(
  httpRouterHandler(routes)
);
