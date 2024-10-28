import { IncomingMessage, ServerResponse } from "http";
import { z, ZodSchema } from "zod";

export type Route<Request extends ZodSchema, Response extends ZodSchema> = {
  request: Request,
  response: Response
}

export type Routes<Request extends ZodSchema, Response extends ZodSchema> = Record<string, Route<Request, Response>>

export type Client<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> = {
  [Route in keyof GenericRoutes]: (request: z.infer<GenericRoutes[Route]["request"]>, options?: RequestInit) => Promise<z.infer<GenericRoutes[Route]["response"]>>
}

export type CreateClient<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> = (options: { server: string }) => Client<Request, Response, GenericRoutes>

export type Implementation<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>, GenericRoute extends keyof GenericRoutes> = (request: z.infer<GenericRoutes[GenericRoute]["request"]>) => Promise<z.infer<GenericRoutes[GenericRoute]["response"]>>


export type Implementations<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> = {
  [Route in keyof GenericRoutes]: Implementation<Request, Response, GenericRoutes, Route>
}

export type CreateHandler<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> = (options: { clients: Array<string>, implementations: Implementations<Request, Response, GenericRoutes> }) => (request: IncomingMessage, Response: ServerResponse) => void

export type CreateImplementation<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> = <GenericRoute extends keyof GenericRoutes>(options: { route: GenericRoute, implementation: Implementation<Request, Response, GenericRoutes, GenericRoute> }) => Implementation<Request, Response, GenericRoutes, GenericRoute>

export type Application<Request extends ZodSchema, Response extends ZodSchema, GenericRoutes extends Routes<Request, Response>> = {
  /**
   * Create an object that can be used to call routes, in order to receive data and perform actions from the server.
   */
  createClient: CreateClient<Request, Response, GenericRoutes>,
  /**
   * Create a concrete implementation of a route by defining what to do when reciveing a request.
   */
  createImplementation: CreateImplementation<Request, Response, GenericRoutes>
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
    const client: Partial<Client<Request, Response, GenericRoutes>> = {};

    for (const route in routes) {
      client[route] = async (requestData, options = {}) => {
        const requestSchema = routes[route].request;
        const responseSchema = routes[route].response;

        const parsedRequest = requestSchema.parse(requestData);

        const response = await fetch(`${server}/${route}`, {
          ...options,
          method: "POST",
          headers: {
            ...options.headers,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(parsedRequest),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }

        const responseData = await response.json();
        return responseSchema.parse(responseData);
      };
    }
    return client as Client<Request, Response, GenericRoutes>;
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

        if (request.method !== "POST") {
          headers.set("Content-Type", "application/json");

          response.writeHead(405, Object.fromEntries(headers.entries()));
          response.end(JSON.stringify({ error: "Method Not Allowed" }));

          return;
        }

        const routePath = request.url?.slice(1);

        if (!routePath || !(routePath in implementations)) {
          headers.set("Content-Type", "application/json");

          response.writeHead(404, Object.fromEntries(headers.entries()));
          response.end(JSON.stringify({ error: "Route Not Found" }));

          return;
        }

        const body = await getBody(request);
        const parsedRequest = toJsonOr(undefined, body);
        const requestSchema = routes[routePath]["request"];
        const validatedRequest = requestSchema.parse(parsedRequest)
        const implementation = implementations[routePath];
        const result = await implementation(validatedRequest);

        headers.set("Content-Type", "application/json");

        response.writeHead(200, Object.fromEntries(headers.entries()));
        response.end(JSON.stringify(result));
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

  const createImplementation = <GenericRoute extends keyof GenericRoutes>({ implementation }: { route: GenericRoute, implementation: Implementation<Request, Response, GenericRoutes, GenericRoute> }): Implementation<Request, Response, GenericRoutes, GenericRoute> => {
    return implementation;
  };

  return {
    createClient,
    createImplementation,
    createHandler
  };
}

export const createRoute = <Request extends ZodSchema, Response extends ZodSchema>({ request, response }: { request: Request, response: Response }): Route<Request, Response> => {
  return {
    request,
    response
  }
}
export * from "zod";