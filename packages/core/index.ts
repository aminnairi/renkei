import { IncomingMessage, RequestListener, ServerResponse } from "http";
import { z, ZodSchema } from "zod";

export interface EventRoute<GenericResponse extends ZodSchema> {
  type: "event",
  response: GenericResponse
}

export interface HttpRoute<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema> {
  type: "http",
  request: GenericRequest,
  response: GenericResponse
}

export type Route<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema> =
  | EventRoute<GenericResponse>
  | HttpRoute<GenericRequest, GenericResponse>

export type Routes<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema> = Record<string, Route<GenericRequest, GenericResponse>>

export type ClientHttpRequest<GenericResponse extends ZodSchema> = () => Promise<z.infer<GenericResponse>>

export type ClientHttpCancelFunction = () => void

export interface ClientHttpRouteOutput<GenericResponse extends ZodSchema> {
  request: ClientHttpRequest<GenericResponse>,
  cancel: ClientHttpCancelFunction
}

export type HttpClientRoute<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema, GenericRoutes extends Routes<GenericRequest, GenericResponse>, GenericRouteName extends keyof GenericRoutes> = 
  GenericRoutes[GenericRouteName] extends HttpRoute<GenericRequest, GenericResponse>
  ? (request: z.infer<GenericRoutes[GenericRouteName]["request"]>, options?: RequestInit) => ClientHttpRouteOutput<GenericRoutes[GenericRouteName]["response"]>
  : never

export type EventClientCancelFunction = () => void

export type EventClientRoute<GenericResponse extends ZodSchema, GenericRoutes extends Routes<any, GenericResponse>, GenericRouteName extends keyof GenericRoutes> =
  GenericRoutes[GenericRouteName] extends EventRoute<GenericResponse>
  ? (callback: (response: z.infer<GenericRoutes[GenericRouteName]["response"]>) => void) => EventClientCancelFunction
  : never

export type Client<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema, GenericRoutes extends Routes<GenericRequest, GenericResponse>> = {
  [RouteName in keyof GenericRoutes]:
    GenericRoutes[RouteName] extends HttpRoute<GenericRequest, GenericResponse>
    ? HttpClientRoute<GenericRequest, GenericResponse, GenericRoutes, RouteName>
    : EventClientRoute<GenericResponse, GenericRoutes, RouteName>
}

export type CreateClient<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema, GenericRoutes extends Routes<GenericRequest, GenericResponse>> = (options: { server: string }) => Client<GenericRequest, GenericResponse, GenericRoutes>

export type HttpImplementation<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema, GenericRoutes extends Routes<GenericRequest, GenericResponse>, GenericRouteName extends keyof GenericRoutes> =
  GenericRoutes[GenericRouteName] extends HttpRoute<GenericRequest, GenericResponse>
  ? (request: z.infer<GenericRoutes[GenericRouteName]["request"]>) => Promise<z.infer<GenericRoutes[GenericRouteName]["response"]>>
  : never

export type EventImplementation<GenericResponse extends ZodSchema, GenericRoutes extends Routes<any, GenericResponse>, GenericRouteName extends keyof GenericRoutes> =
  GenericRoutes[GenericRouteName] extends EventRoute<GenericResponse> 
  ? (send: (response: z.infer<GenericResponse>) => void) => void
  : never

export type Implementations<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema, GenericRoutes extends Routes<GenericRequest, GenericResponse>> = {
  [RouteName in keyof GenericRoutes]:
  GenericRoutes[RouteName] extends HttpRoute<GenericRequest, GenericResponse>
  ? HttpImplementation<GenericRequest, GenericResponse, GenericRoutes, RouteName>
  : EventImplementation<GenericResponse, GenericRoutes, RouteName>
}

export type CreateRequestListener<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema, GenericRoutes extends Routes<GenericRequest, GenericResponse>> = (options: { clients: string[], implementations: Implementations<GenericRequest, GenericResponse, GenericRoutes> }) => RequestListener


export type CreateHttpImplementation<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema, GenericRoutes extends Routes<GenericRequest, GenericResponse>> = <GenericRouteName extends keyof GenericRoutes>(options: { route: GenericRouteName, implementation: GenericRoutes[GenericRouteName] extends HttpRoute<GenericRequest, GenericResponse> ? HttpImplementation<GenericRequest, GenericResponse, GenericRoutes, GenericRouteName> : never }) => 
    GenericRoutes[GenericRouteName] extends HttpRoute<GenericRequest, GenericResponse>
    ? HttpImplementation<GenericRequest, GenericResponse, GenericRoutes, GenericRouteName>
    : never

export type CreateEventImplementation<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema, GenericRoutes extends Routes<GenericRequest, GenericResponse>> = <GenericRouteName extends keyof GenericRoutes, GenericRoute extends GenericRoutes[GenericRouteName]>(options: { route: GenericRouteName, implementation: GenericRoute extends EventRoute<GenericResponse> ? EventImplementation<GenericRoute["response"], GenericRoutes, GenericRouteName> : never }) => 
  GenericRoute extends EventRoute<GenericResponse>
  ? EventImplementation<GenericRoute["response"], GenericRoutes, GenericRouteName>
  : never

export interface Application<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> {
  /**
   * Create an object that can later be used to send request to a server.
   */
  createClient: CreateClient<Request, Response, GenericRoutes>,
  /**
   * Create an implementation of a route that should return an http response.
   */
  createHttpImplementation: CreateHttpImplementation<Request, Response, GenericRoutes>
  /**
   * Create an implementation of a route that should return a Server-Sent Event response.
   */
  createEventImplementation: CreateEventImplementation<Request, Response, GenericRoutes>
  /**
   * Create a function that will be able to parse the request, and send response according to concrete implementation of your routes defined earlier.
   */
  createRequestListener: CreateRequestListener<Request, Response, GenericRoutes>
}

/**
 * Reassemble the body from the request's stream in the form of a raw string.
 */
export const getBody = async (request: IncomingMessage) => {
  let body = "";

  for await (const chunk of request) {
    body += chunk.toString();
  }

  return body;
};

/**
 * Serialize a JSON-compatible JavaScript object, or use the provided fallback value if it ever fails to serialize the object.
 */
export const toJsonOr = <Fallback>(fallback: Fallback, input: string): unknown => {
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
};

export function isEventRoute<GenericResponse extends ZodSchema>(route: Route<any, GenericResponse>): route is EventRoute<GenericResponse> {
  return route.type === "event";
}

export function isHttpRoute<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema>(route: Route<GenericRequest, GenericResponse>): route is HttpRoute<GenericRequest, GenericResponse> {
  return route.type === "http";
}

/**
 * Create a new application for communicating seamlessly between a client and a server.
 */
export const createApplication = <GenericRequest extends ZodSchema, GenericResponse extends ZodSchema, GenericRoutes extends Routes<GenericRequest, GenericResponse>>(routes: GenericRoutes): Application<GenericRequest, GenericResponse, GenericRoutes> => {
  const createClient: CreateClient<GenericRequest, GenericResponse, GenericRoutes> = ({ server }) => {
    return new Proxy({} as Client<GenericRequest, GenericResponse, GenericRoutes>, {
      get: (_, routeName: string) => {
        const route = routes[routeName];

        if (route === undefined) {
          throw new Error(`Route not found: ${routeName}.`);
        }

        if (isHttpRoute(route)) {
          const abortController = new AbortController();

          return {
            request: async (requestData: unknown) => {
              const requestSchema = route.request;
              const responseSchema = route.response;

              const parsedRequest = requestSchema.parse(requestData);

              const response = await fetch(`${server}/${routeName}`, {
                method: "POST",
                signal: abortController.signal,
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                },
                body: JSON.stringify(parsedRequest),
              });

              if (!response.ok) {
                const text = await response.text();
                throw new Error(text);
              }

              const responseData = await response.json();
              return responseSchema.parse(responseData);
            },
            cancel: () => {
              abortController.abort();
            }
          };
        }
        
        if (isEventRoute(route)) {
          return (onData: (data: z.infer<GenericResponse>) => void) => {
            const eventSource = new EventSource(`${server}/${routeName}`);

            eventSource.addEventListener("message", (event) => {
              const data = route.response.parse(JSON.parse(event.data));
              onData(data);
            });

            return () => {
              eventSource.close();
            };
          };
        }

        throw new Error(`Invalid route type for ${routeName}, expected http or serverSentEvent`);
      }
    });
  };


  const createRequestListener: CreateRequestListener<GenericRequest, GenericResponse, GenericRoutes> = ({ clients, implementations }) => {
    return async (request: IncomingMessage, response: ServerResponse) => {
      const headers = new Map();

      try {
        headers.set("Access-Control-Allow-Headers", "Content-Type");

        if (request.headers.origin && clients.includes(request.headers.origin)) {
          headers.set("Access-Control-Allow-Origin", request.headers.origin);
        }

        if (request.method === "OPTIONS") {
          headers.set("Content-Type", "application/json");

          response.writeHead(200, Object.fromEntries(headers.entries()));
          response.end();

          return;
        }

        if (!["GET", "POST"].includes(request.method ?? "")) {
          headers.set("Content-Type", "application/json");

          response.writeHead(405, Object.fromEntries(headers.entries()));
          response.end(JSON.stringify({ error: "Method Not Allowed" }));

          return;/**
          * The definition of a route that should be implemented as a Server-Sent Event.
          */
        }

        const routePath = request.url?.slice(1);

        if (!routePath || !(routePath in implementations)) {
          headers.set("Content-Type", "application/json");

          response.writeHead(404, Object.fromEntries(headers.entries()));
          response.end(JSON.stringify({ error: "Route Not Found" }));

          return;
        }

        const route = routes[routePath];

        if (route === undefined) {
          throw new Error(`Route not found: ${routePath}.`);
        }

        if (isEventRoute(route)) {
          const implementation = implementations[routePath];

          if (implementation === undefined) {
            throw new Error(`Implementation not found for route ${routePath}`);
          }

          headers.set("Content-Type", "text/event-stream");
          headers.set("Cache-Control", "no-cache");
          headers.set("Connection", "keep-alive");
          response.writeHead(200, Object.fromEntries(headers.entries()));

          implementation((unvalidatedResponse: unknown) => {
            const validatedResponse = route.response.parse(unvalidatedResponse);

            response.write(`event: message\ndata: ${JSON.stringify(validatedResponse)}\n\n`);
          });

          return;
        }

        if (isHttpRoute(route)) {
          const body = await getBody(request);
          const parsedRequest = toJsonOr(undefined, body);
          const requestSchema = route.request;
          const validatedRequest = requestSchema.parse(parsedRequest);
          const implementation = implementations[routePath] as HttpImplementation<GenericRequest, GenericResponse, GenericRoutes, keyof GenericRoutes>;
          const result = await implementation(validatedRequest);

          headers.set("Content-Type", "application/json");
          response.writeHead(200, Object.fromEntries(headers.entries()));
          response.end(JSON.stringify(result));
          return;
        }

        throw new Error("Bad route type, should be either serventSentEvent or http.");
      } catch (error) {
        headers.set("Content-Type", "application/json");

        response.writeHead(500, Object.fromEntries(headers.entries()));

        response.end(JSON.stringify({
          error: "Internal Server Error",
          details: error instanceof Error ? error.message : String(error)
        }));
      }
    };
  };

  const createHttpImplementation = <GenericRouteName extends keyof GenericRoutes, GenericRoute extends GenericRoutes[GenericRouteName]>({ implementation }: { route: GenericRouteName, implementation: GenericRoute extends HttpRoute<GenericRequest, GenericResponse> ? HttpImplementation<GenericRequest, GenericResponse, GenericRoutes, GenericRouteName> : never }): GenericRoute extends HttpRoute<GenericRequest, GenericResponse> ? HttpImplementation<GenericRequest, GenericResponse, GenericRoutes, GenericRouteName> : never => {
    return implementation;
  };

  const createEventImplementation = <GenericRouteName extends keyof GenericRoutes, GenericRoute extends GenericRoutes[GenericRouteName]>({ implementation }: { route: GenericRouteName, implementation: GenericRoute extends EventRoute<GenericResponse> ? EventImplementation<GenericRoute["response"], GenericRoutes, GenericRouteName> : never }): GenericRoute extends EventRoute<GenericResponse> ? EventImplementation<GenericRoute["response"], GenericRoutes, GenericRouteName> : never => {
    return implementation;
  };

  return {
    createClient,
    createHttpImplementation,
    createEventImplementation,
    createRequestListener
  };
};

/**
 * Create a route that accept requests, and sends responses.
 */
export const createHttpRoute = <GenericRequest extends ZodSchema, GenericResponse extends ZodSchema>({ request, response }: { request: GenericRequest, response: GenericResponse }): HttpRoute<GenericRequest, GenericResponse> => {
  return {
    type: "http",
    request,
    response
  };
};

/**
 * Create a route that sends Server-Sent Events (SSE).
 */
export const createEventRoute = <Response extends ZodSchema>({ response }: { response: Response }): EventRoute<Response> => {
  return {
    type: "event",
    response
  };
};

export * from "zod";