import { z, ZodSchema } from "zod";

export class ClientError extends Error {
  public override name = "ClientError";

  public constructor(public readonly status: number, public readonly text: string) {
    super();
  }
}

export class ServerError extends Error {
  public override name = "ServerError";

  public constructor(public readonly status: number, public readonly text: string) {
    super();
  }
}

export class UnexpectedError extends Error {
  public override name = "UnexpectedError";

  public constructor(public override readonly message: string) {
    super();
  }
}

export interface HttpRoute<Input extends ZodSchema, Output extends ZodSchema> {
  type: "http",
  input: Input,
  output: Output
}

export type HttpImplementation<Input extends ZodSchema, Output extends ZodSchema> = (input: z.infer<Input>) => Promise<z.infer<Output>>

export type CreateHttpImplementation<Input extends ZodSchema, Output extends ZodSchema> = (implementation: HttpImplementation<Input, Output>) => HttpImplementation<Input, Output>

export interface EventRoute<Output extends ZodSchema> {
  type: "event",
  output: Output
}

export type EventImplementation<Output extends ZodSchema> = (send: (output: z.infer<Output>) => void) => void;

export type CreateEventImplementation<Output extends ZodSchema> = (implementation: EventImplementation<Output>) => EventImplementation<Output>

export type Implementations<Routes extends Record<string, HttpRoute<ZodSchema, ZodSchema> | EventRoute<ZodSchema>>> = {
  [RouteName in keyof Routes]: Routes[RouteName] extends HttpRoute<infer Input, infer Output>
  ? HttpImplementation<Input, Output>
  : Routes[RouteName] extends EventRoute<infer Output>
  ? EventImplementation<Output>
  : never
}

export type HttpClient<Input extends ZodSchema, Output extends ZodSchema> = (options: { input: z.infer<Input>, signal?: AbortSignal }) => Promise<ClientError | ServerError | UnexpectedError | z.infer<Output>>

export type EventClient<Output extends ZodSchema> = (onEvent: (output: z.infer<Output>) => void) => () => void

export type Client<Routes extends Record<string, HttpRoute<ZodSchema, ZodSchema> | EventRoute<ZodSchema>>> = {
  [RouteName in keyof Routes]: Routes[RouteName] extends HttpRoute<infer Input, infer Output>
  ? HttpClient<Input, Output>
  : Routes[RouteName] extends EventRoute<infer Output>
  ? EventClient<Output>
  : never
}

export interface Subscriber {
  onEvent: (callback: (data: unknown) => void) => void,
  close: () => void
}

export interface ClientAdapter {
  request: (options: { url: string, body: string, signal?: AbortSignal | undefined }) => Promise<Response>,
  subscribe: (options: { url: string }) => Subscriber
}

export type CreateClient<Routes extends Record<string, HttpRoute<ZodSchema, ZodSchema> | EventRoute<ZodSchema>>> = (options: { server: string, adapter: ClientAdapter }) => Client<Routes>

export interface ServerAdapter {
  onRequest: (callback: (request: Request) => Promise<Response>) => void,
  create: () => Server
}

type ServerCloseFunction = () => void

export interface Server {
  start: (options: { port: number, host: string }) => Promise<ServerCloseFunction>
}

export type CreateServer<Routes extends Record<string, HttpRoute<ZodSchema, ZodSchema> | EventRoute<ZodSchema>>> = (options: { adapter: ServerAdapter, implementations: Implementations<Routes>  }) => Server

export interface Application<Routes extends Record<string, HttpRoute<ZodSchema, ZodSchema> | EventRoute<ZodSchema>>> {
  createClient: CreateClient<Routes>,
  createServer: CreateServer<Routes>
}

export function getEntries<T extends Record<string, unknown>>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

export function jsonParseOr<Value>(fallback: Value, text: string): Value {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export function createApplication<Routes extends Record<string, HttpRoute<ZodSchema, ZodSchema> | EventRoute<ZodSchema>>>({ routes }: { routes: Routes}): Application<Routes> {
  return {
    createClient: (({ adapter, server }) => {
      return Object.fromEntries(Object.entries(routes).map(([routeName, route]: [keyof Routes, HttpRoute<ZodSchema, ZodSchema> | EventRoute<ZodSchema>]) => {
        if (route.type === "http") {
          const client: HttpClient<ZodSchema, ZodSchema> = async ({ input, signal }) => {
            try {
              const validatedInput = route.input.parse(input);
              const body = JSON.stringify(validatedInput);

              const responseFromAdapter = await adapter.request({
                url: `${server}/${String(routeName)}`,
                body,
                signal: signal
              });

              if (responseFromAdapter.status >= 400 && responseFromAdapter.status <= 499) {
                const text = await responseFromAdapter.text();
                return new ClientError(responseFromAdapter.status, text);
              }

              if (responseFromAdapter.status >= 500 && responseFromAdapter.status <= 599) {
                const text = await responseFromAdapter.text();
                return new ServerError(responseFromAdapter.status, text);
              }

              const json = await responseFromAdapter.json();
              const validatedOutput = route.output.parse(json);

              return validatedOutput;
            } catch (error) {
              if (error instanceof Error) {
                return new UnexpectedError(error.message);
              }

              return new UnexpectedError(String(error));
            }
          };

          return [routeName, client];
        }

        const client: EventClient<ZodSchema> = (onEvent) => {
          const subscription = adapter.subscribe({ url: `${server}/${String(routeName)}` });

          subscription.onEvent(data => {
            const validatedOutput = route.output.parse(typeof data === "string" ? jsonParseOr(null, data) : data);
            onEvent(validatedOutput);
          });

          return () => subscription.close();
        };

        return [routeName, client];
      }));
    }),
    createServer: (({ adapter, implementations }) => {
      const headers = new Headers();

      adapter.onRequest(async request => {
        const url = new URL(request.url);

        const foundRoute = getEntries(routes).find(([routeName]) => {
          return `/${String(routeName)}` === url.pathname;
        });

        if (!foundRoute) {
          headers.set("Content-Type", "application/json");

          return new Response(JSON.stringify({ error: "route not found" }), {
            headers,
            status: 404
          });
        }

        const [, route] = foundRoute;

        if (route.type === "http") {
          headers.set("Content-Type", "application/json");

          const body = await request.json();
          const validatedBody = route.input.parse(typeof body === "string" ? jsonParseOr(null, body) : body);

          const foundImplementation = getEntries(implementations).find(([routeName]) => {
            return `/${String(routeName)}` === url.pathname;
          });

          if (!foundImplementation) {
            return new Response(JSON.stringify({ error: "Implementation not found" }), {
              status: 404,
              headers
            });
          }

          const [, implementation] = foundImplementation;
          const httpImplementation = implementation;
          const output = await httpImplementation(validatedBody);

          return new Response(JSON.stringify(output), {
            status: 200,
            headers
          });
        }

        if (route.type === "event") {
          const foundImplementation = getEntries(implementations).find(([routeName]) => {
            return `/${String(routeName)}` === url.pathname;
          });

          if (!foundImplementation) {
            headers.set("Content-Type", "application/json");

            return new Response(JSON.stringify({ error: `Implementation not found for route ${url.pathname}` }), {
              status: 404,
              headers
            });
          }

          const [, implementation] = foundImplementation;
          const eventImplementation = implementation;

          const stream = new ReadableStream({
            start(controller) {
              eventImplementation(async (output) => {
                const validatedOutput = await route.output.parse(typeof output === "string" ? jsonParseOr(null, output) : output);
                controller.enqueue(`event: message\ndata: ${JSON.stringify(validatedOutput)}\n\n`);
              });
            }
          });

          headers.set("Content-Type", "text/event-stream");
          headers.set("Connection", "keep-alive");
          headers.set("Cache-Control", "no-cache");

          return new Response(stream, {
            status: 200,
            headers
          });
        }

        return new Response(JSON.stringify({ error: "Type not found" }), {
          status: 404,
          headers
        });
      });

      return adapter.create();
    })
  };
}

export const createHttpRoute = <Input extends ZodSchema, Output extends ZodSchema>({ input, output }: { input: Input, output: Output }): [HttpRoute<Input, Output>, CreateHttpImplementation<Input, Output>] => {
  const route: HttpRoute<Input, Output> = {
    type: "http",
    input,
    output
  };

  const implement: CreateHttpImplementation<Input, Output> = implementation => implementation;

  return [
    route,
    implement
  ];
};

export function createEventRoute<Output extends ZodSchema>({ output }: { output: Output }): [EventRoute<Output>, CreateEventImplementation<Output>] {
  const route: EventRoute<Output> = {
    type: "event",
    output
  };

  const implement: CreateEventImplementation<Output> = implementation => implementation;

  return [
    route,
    implement
  ];
}

export * from "zod";