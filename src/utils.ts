import { IncomingHttpHeaders } from "http";

export function convertHeaders(
  headers: IncomingHttpHeaders
): Record<string, string | undefined> {
  let convertedHeaders: Record<string, string | undefined> = {};

  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      convertedHeaders[key] = value.join(",");
    } else {
      convertedHeaders[key] = value;
    }
  });

  return convertedHeaders;
}

export function convertQueryParameters(queryParams: URLSearchParams) {
  const queryObject: Record<string, string | undefined> = {};
  queryParams.forEach((value, key) => {
    queryObject[key] = value;
  });

  return queryObject;
}

export function getURLFromPath(path?: string, hostName?: string): URL {
  const host = hostName ? `http://${hostName}` : "http://localhost:3000";
  return new URL(path ?? "/", host);
}

export function getMethodFromRequest(method?: string) {
  return method ?? "GET";
}
