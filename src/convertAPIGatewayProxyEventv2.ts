import type { APIGatewayProxyEventV2, APIGatewayProxyEventV2WithRequestContext } from "aws-lambda";
import type { IncomingHttpHeaders, IncomingMessage } from "http";

export function convertRequestToAPIGatewayProxyEventV2(req: IncomingMessage): APIGatewayProxyEventV2 {
    const url = getUrlPath(req.url);

    return {
        headers: convertHeaders(req.headers),
        body: undefined,// TODO: Handle this smart
        httpMethod: req.method ?? 'GET',
        isBase64Encoded: false, // TODO: Better handle this,
        path: getUrlPath(req.url),
        pathParameters: null,
        queryStringParameters: parsedUrl.query, // TODO: Handle this
        multiValueQueryStringParameters: null,
        stageVariables: null,
        requestContext: {} as unknown as APIGatewayProxyEventV2WithRequestContext,
        resource: getUrlPath(req.url)
    };
}

function convertHeaders(headers: IncomingHttpHeaders): Record<string, string | undefined> {
    let convertedHeaders: Record<string, string | undefined> = {};

    Object.entries(headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            convertedHeaders[key] = value.join(',');
        } else {
            convertedHeaders[key] = value;
        }
    })

    return convertedHeaders;
}

function getUrlPath(url: string | undefined): string {
    return url ?? '/';
}