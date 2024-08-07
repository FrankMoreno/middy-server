import middy from "@middy/core";
import httpRouterHandler from "@middy/http-router";
import type { Method } from "@middy/http-router";
import type { APIGatewayEvent, Context } from "aws-lambda";

const getHandler = middy().handler(
  (event: APIGatewayEvent, context: Context) => {
    return {
      statusCode: 200,
      body: "{}",
    };
  }
);

const postHandler = middy().handler(
  (event: APIGatewayEvent, context: Context) => {
    return {
      statusCode: 200,
      body: "{}",
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
    method: "POST" as Method,
    path: "/user",
    handler: postHandler,
  },
];

export const handler = middy().handler(httpRouterHandler(routes));
