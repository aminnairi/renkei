import { IncomingMessage, ServerResponse } from "http";
import { z, ZodSchema } from "zod";

export type ServerSentEventRoute<Response extends ZodSchema> = {
  type: "serverSentEvent",
  response: Response
}

export type HttpRoute<Request extends ZodSchema, Response extends ZodSchema> = {
  type: "http",
  request: Request,
  response: Response
}

export function isServerSentEventRoute<Response extends ZodSchema>(route: Route<any, Response>): route is ServerSentEventRoute<Response> {
  return route.type === "serverSentEvent";
}

export function isHttpRoute<Request extends ZodSchema, Response extends ZodSchema>(route: Route<Request, Response>): route is HttpRoute<Request, Response> {
  return route.type === "http";
}

export type Route<Request extends ZodSchema, Response extends ZodSchema> =
  | ServerSentEventRoute<Response>
  | HttpRoute<Request, Response>

export type Routes<Request extends ZodSchema, Response extends ZodSchema> = Record<string, Route<Request, Response>>

export type Client<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> = {
  [Route in keyof GenericRoutes]: GenericRoutes[Route] extends HttpRoute<Request, Response>
    ? (request: z.infer<GenericRoutes[Route]["request"]>, options?: RequestInit) => Promise<z.infer<GenericRoutes[Route]["response"]>>
    : (callback: (response: z.infer<GenericRoutes[Route]["response"]>) => void) => void
}

export type CreateClient<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> = (options: { server: string }) => Client<Request, Response, GenericRoutes>

export type HttpImplementation<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>, GenericRoute extends keyof GenericRoutes> = GenericRoutes[GenericRoute] extends HttpRoute<Request, Response> ? (request: z.infer<GenericRoutes[GenericRoute]["request"]>) => Promise<z.infer<GenericRoutes[GenericRoute]["response"]>> : never

export type ServerSentEventImplementation<GenericResponse extends ZodSchema> = (emit: (response: z.infer<GenericResponse>) => void) => void

export type Implementations<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> = {
  [Route in keyof GenericRoutes]:
  GenericRoutes[Route] extends HttpRoute<Request, Response>
  ? HttpImplementation<Request, Response, GenericRoutes, Route>
  : GenericRoutes[Route] extends ServerSentEventRoute<Response>
  ? ServerSentEventImplementation<Response>
  : never
}

export type CreateHandler<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> = (options: { clients: Array<string>, implementations: Implementations<Request, Response, GenericRoutes> }) => (request: IncomingMessage, Response: ServerResponse) => void

export type CreateHttpImplementation<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> = <GenericRoute extends keyof GenericRoutes>(options: { route: GenericRoute, implementation: HttpImplementation<Request, Response, GenericRoutes, GenericRoute> }) => HttpImplementation<Request, Response, GenericRoutes, GenericRoute>

export type CreateServerSentEventImplementation<GenericRequest extends ZodSchema, GenericResponse extends ZodSchema, GenericRoutes extends Routes<GenericRequest, GenericResponse>> = <GenericRouteName extends keyof GenericRoutes, GenericRoute extends GenericRoutes[GenericRouteName]>(options: { route: GenericRouteName, implementation: ServerSentEventImplementation<GenericRoute["response"]> }) => ServerSentEventImplementation<GenericRoute["response"]>

export type Application<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> = {
  /**
   * Create an object that can be used to call routes, in order to receive data and perform actions from the server.
   */
  createClient: CreateClient<Request, Response, GenericRoutes>,
  /**
   * Create a concrete implementation of a route by defining what to do when reciveing a request.
   */
  createHttpImplementation: CreateHttpImplementation<Request, Response, GenericRoutes>
  /**
   * Create a concrete implementation of a route that should emit Server-Sent Events by defining what to do when reciveing a request.
   */
  createServerSentEventImplementation: CreateServerSentEventImplementation<Request, Response, GenericRoutes>
  /**
   * Create a function that will be able to parse the request, and interact with the client through the response.
   */
  createHandler: CreateHandler<Request, Response, GenericRoutes>
}

export const getBody = async (request: IncomingMessage) => {
  let body = "";

  for await (const chunk of request) {
    body += chunk.toString();
  }

  return body;
};

export const toJsonOr = <Fallback>(fallback: Fallback, input: string): unknown => {
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
};

/**
 * Create a new application for communicating seamlessly between a client and a server.
 */
export const createApplication = <Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>>(routes: GenericRoutes): Application<Request, Response, GenericRoutes> => {
  /**
   * Create an object that can later be used to send request to a server.
   */
  const createClient: CreateClient<Request, Response, GenericRoutes> = ({ server }) => {
    return new Proxy({} as Client<Request, Response, GenericRoutes>, {
      get: (_, routeName: string) => {
        const route = routes[routeName];

        if (route === undefined) {
          throw new Error(`Route not found: ${routeName}.`);
        }

        if (isHttpRoute(route)) {
          return async (requestData: unknown) => {
            const requestSchema = route.request;
            const responseSchema = route.response;

            const parsedRequest = requestSchema.parse(requestData);

            const response = await fetch(`${server}/${routeName}`, {
              method: "POST",
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
          }
        }
        
        if (isServerSentEventRoute(route)) {
          return (onData: (data: Response) => void) => {
            const eventSource = new EventSource(`${server}/${routeName}`);

            eventSource.addEventListener("message", (event) => {
              const data = route.response.parse(JSON.parse(event.data));
              onData(data);
            });

            return () => {
              eventSource.close();
            }
          }
        }

        throw new Error(`Invalid route type for ${routeName}, expected http or serverSentEvent`);
      }
    });
  };


  /**
   * Create a function that will be able to parse the request, and send response according to concrete implementation of your routes defined earlier.
   */
  const createHandler: CreateHandler<Request, Response, GenericRoutes> = ({ clients, implementations }) => {
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

          return;
        }

        const routePath = request.url?.slice(1);

        console.log({ routePath, impl: Object.keys(implementations) });

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

        if (isServerSentEventRoute(route)) {
          const implementation = implementations[routePath];

          if (implementation === undefined) {
            throw new Error(`Implementation not found for route ${routePath}`);
          }

          headers.set("Content-Type", "text/event-stream");
          headers.set("Cache-Control", "no-cache");
          headers.set("Connection", "keep-alive");
          response.writeHead(200, Object.fromEntries(headers.entries()));

          implementation((unvalidatedResponse: unknown) => {
            const validatedResponse = route.response.parse(unvalidatedResponse)

            response.write(`event: message\ndata: ${JSON.stringify(validatedResponse)}\n\n`);
          });

          return;
        }

        if (isHttpRoute(route)) {
          const body = await getBody(request);
          const parsedRequest = toJsonOr(undefined, body);
          const requestSchema = route.request
          const validatedRequest = requestSchema.parse(parsedRequest)
          const implementation = implementations[routePath] as HttpImplementation<Request, Response, GenericRoutes, keyof GenericRoutes>;
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

  const createHttpImplementation = <GenericRoute extends keyof GenericRoutes>({ implementation }: { route: GenericRoute, implementation: HttpImplementation<Request, Response, GenericRoutes, GenericRoute> }): HttpImplementation<Request, Response, GenericRoutes, GenericRoute> => {
    return implementation;
  };

  const createServerSentEventImplementation = <GenericRouteName extends keyof GenericRoutes, GenericRoute extends GenericRoutes[GenericRouteName]>({ implementation }: { route: GenericRouteName, implementation: ServerSentEventImplementation<GenericRoute["response"]> }): ServerSentEventImplementation<GenericRoute["response"]> => {
    return implementation;
  };

  return {
    createClient,
    createHttpImplementation,
    createServerSentEventImplementation,
    createHandler
  };
}

export const createHttpRoute = <Request extends ZodSchema, Response extends ZodSchema>({ request, response }: { request: Request, response: Response }): HttpRoute<Request, Response> => {
  return {
    type: "http",
    request,
    response
  }
}

export const createServerSentEventRoute = <Response extends ZodSchema>({ response }: { response: Response }): ServerSentEventRoute<Response> => {
  return {
    type: "serverSentEvent",
    response
  }
}

export * from "zod";