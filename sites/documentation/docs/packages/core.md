# API Core

This page will describe in details, the API used by the function exposed by the `@renkei/core` library.

## createHttpRoute

### Definition

```typescript
createHttpRoute<Input, Output>({ input, output }: { input: Validator<Input>, output: Validator<Output> }): [HttpRoute<Input, Output>, CreateHttpImplementation<Input, Output>];
```

### Explanation

This function will create a tuple containing the route, and a function to implement the route from the server side.

It accepts the route definition, since an HTTP request contains both a request and a response, you have to define a request parser, and a response parser.

### Example

```typescript
import { createHttpRoute } from "@renkei/core";
import { z } from "zod";

createHttpRoute({
  input: value => {
    return z.object({
      firstname: z.string()
    }).parse(value);
  },
  output: value => {
    return z.object({
      identifier: z.string()
    });
  }
});
```

You can extract the created route by extracting the first returned value from the output array.

```typescript
import { createHttpRoute } from "@renkei/core";
import { z } from "zod";

const [ createUserRoute ] = createHttpRoute({
  input: value => {
    return z.object({
      firstname: z.string()
    }).parse(value);
  },
  output: value => {
    return z.object({
      identifier: z.string()
    });
  }
});
```

You can also get a function that will help you get the proper type of the output that needs to be implemented from the server side.

```typescript
import { createHttpRoute } from "@renkei/core";
import { z } from "zod";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: value => {
    return z.object({
      firstname: z.string()
    }).parse(value);
  },
  output: value => {
    return z.object({
      identifier: z.string()
    });
  }
});
```

## createEventRoute

### Definition

```typescript
function createEventRoute<Output>({ output }: { output: Validator<Output> }): [EventRoute<Output>, CreateEventImplementation<Output>];
```

### Explanation

If you only care about receiving notifications from the server without interuptions, you can create an event route. This is typically an implementation of an EventSource from the client side, but depending on the client adapter used, it can also be implemented using a WebSocket.

### Example

```typescript
import { createEventRoute } from "@renkei/core";
import { z } from "zod";

createEventRoute({
  output: value => {
    return z.object({
      identifier: z.string()
    });
  }
});
```

You can even extract, just like for the `createHttpRoute` the created route.

```typescript
import { createEventRoute } from "@renkei/core";
import { z } from "zod";

const [ userCreatedRoute ] = createEventRoute({
  output: value => {
    return z.object({
      identifier: z.string()
    });
  }
});
```

And even the resulting implementation helper function.

```typescript
import { createEventRoute } from "@renkei/core";
import { z } from "zod";

const [ userCreatedRoute, implementUserCreatedRoute ] = createEventRoute({
  output: value => {
    return z.object({
      identifier: z.string()
    });
  }
});
```

## createApplication

### Definition

```typescript
function createApplication<Routes extends Record<string, Route<unknown, unknown>>>(options: { routes: Routes }): Application<Routes>;
```

### Explanation

This function will help you create the base application that will serve as the base for implementing the client and server.

### Example

```typescript
import { createApplication, createHttpRoute } from "@renkei/core";
import { z } from "zod";

const [ createUserRoute ] = createHttpRoute({
  input: value => {
    return z.object({
      firstname: z.string()
    }).parse(value);
  },
  output: value => {
    return z.object({
      identifier: z.string()
    }).parse(value);
  }
});

createApplication({
  routes: {
    createUser: createUserRoute
  }
});
```

From there, you can extract the necessary function that will help you implement the client side, and the server side.

```typescript
import { createApplication, createHttpRoute } from "@renkei/core";
import { z } from "zod";

const [ createUserRoute ] = createHttpRoute({
  input: value => {
    return z.object({
      firstname: z.string()
    }).parse(value);
  },
  output: value => {
    return z.object({
      identifier: z.string()
    }).parse(value);
  }
});

const { createServer, createClient } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});
```

You typically want to use a `ClientAdapter` or a `ServerAdapter` in order to call these functions. This is explained in the sections `fetch` and `node`.

## ServerAdapter

### Definition

```typescript
type ServerCloseFunction = () => void

interface Server {
  start: (options: { port: number, host: string }) => Promise<ServerCloseFunction>
}

interface ServerAdapter {
  onRequest: (callback: (request: Request) => Promise<Response>) => void,
  create: () => Server
}
```

### Explanation

This interface let's you create a server adapter from scratch. If you feel that the distributed server adapters, like `@renkei/node` are not a good fit for your usecases, you can implement one yourself.

### Example

Let's try to implement an Express adapter.

First, we will install express.

```bash
npm install express body-parser
npm install --save-dev @types/express @types/body-parser
```

Next, we need to implement a function (or a class) that implements the interface.

```typescript
import { ServerAdapter } from "@renkei/core";

function createExpressAdapter(): ServerAdapter {
  //...
}
```

We know from the interface that a `ServerAdapter` needs to implement one function that handles the requests. Let's try to implement that.

```typescript
import { ServerAdapter } from "@renkei/core";
import express from "express";
import bodyParser from "body-parser";

function createExpressAdapter(): ServerAdapter {
  const server = express();

  server.use(bodyParser.json());

  return {
    onRequest: (getResponse) => {
      server.all("*", (expressRequest, expressResponse) => {
        const headers = new Headers(Object.fromEntries(Object.entries(expressRequest).map(([key, value]) => {
          return [key, String(value)]
        })));

        const request = new Request(expressRequest.body, {
          headers,
          status: expressRequest.status
        });

        const response = await getResponse(request);
        const body = await response.json();

        expressResponse.setHeaders(response.headers);
        expressResponse.status(response.status);
        expressResponse.json(body);
      });
    }
  };
}
```

Of course, this adapter is very simple and does not account for the many things that you can do with `express`.

::: warning
This adapter has not been tested and should not be used for production
:::

As you can see, this method is responsible for translating the request as received from the library, and should send a Web API `Request` object to the core library, in order to get back a Web API `Response` object that can then be translated into the needed format for the library's response.

One thing that we forgot was to also implement the `create` method, let's do this.

```typescript
import { ServerAdapter } from "@renkei/core";
import express from "express";
import bodyParser from "body-parser";

function createExpressAdapter(): ServerAdapter {
  const server = express();

  server.use(bodyParser.json());

  return {
    onRequest: (getResponse) => {
      server.all("*", (expressRequest, expressResponse) => {
        const headers = new Headers(Object.fromEntries(Object.entries(expressRequest).map(([key, value]) => {
          return [key, String(value)]
        })));

        const request = new Request(expressRequest.body, {
          headers,
          status: expressRequest.status
        });

        const response = await getResponse(request);
        const body = await response.json();

        expressResponse.setHeaders(response.headers);
        expressResponse.status(response.status);
        expressResponse.json(body);
      });
    },
    create: () => {
      return {
        start: ({ port, host }) => {
          return new Promise(resolve => {
            server.listen(port, host, () => {
              resolve(() => {
                server.close();
              });
            });
          });
        }
      };
    }
  };
}
```

Ok, this one has a lot of callbacks in it, but simply put, the goal of this method is simply to return a `Server` interface, from which the user can call the `start` method providing a port and host in order to start the server.

This is a promise, so it needs to be awaited by the user of your adapter. Once that is done, you get back a function that is a `ServerCloseFunction` which, when called, should close the server as its name implies.

You can now start using your adapter right now.

```typescript
import { createApplication, createHttpRoute } from "@renkei/core";
import { z } from "zod";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: value => {
    return z.object({
      firstname: z.string()
    }).parse(value);
  },
  output: value => {
    return z.object({
      identifier: z.string()
    }).parse(value);
  }
});

const { createServer } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

const server = createServer({
  adapter: createExpressAdapter(),
  implementations: {
    createUser: implementCreateUserRoute(({ firstname }) => {
      return Promise.resolve({
        identifier: "RandomIdentifierHere"
      });
    })
  }
});

const close = await server.start({
  port: 8000,
  host: "0.0.0.0"
});

setTimeout(() => {
  close();
}, 30_000);
```

In this example, we have used our own adapter in order to run an `express` server.

This server is then started, and after 30 seconds, we shutdown the server, stopping any client from sending requests to this port and host.

And that's it! All the heavy lifting of bridging the implementations with the requests, checking that everything is right according to the schema, is done by this library. You simply have to use one of the builtin adapters, or create yours.

## ClientAdapter

### Definition

```typescript
interface Subscriber {
  onEvent: (callback: (data: unknown) => void) => void,
  close: () => void
}

interface ClientAdapter {
  request: (options: { url: string, body: string, signal?: AbortSignal | undefined }) => Promise<Response>,
  subscribe: (options: { url: string }) => Subscriber
}
```

### Explanation

The `ClientAdapter` interface has a similar role than the `ServerAdapter`, in the sense that it is an interface that, when implemented, should translate the request from the library used, into a Web API `Request` and `Response` objects.

The adapter also has a definition for a `Subscriber`, this is useful when using an event route, which is in fact an implementation of an `EventSource` behind the scene when using the `@renkei/fetch` adapter.

### Example

For this example, let's try to implement what the `@renkei/fetch` library does, in its simplest form using instead the Web API `XMLHttpRequest`.

Let's create our adapter using the `ClientAdapter` interface.

```typescript
import { ClientAdapter } from "@renkei/core";

function createXmlHttpRequestAdapter() {
  const xmlHttpRequest = const new XMLHttpRequest();

  return {
    request: ({ url, body }) => {
      return new Promise(resolve => {
        xmlHttpRequest.open(url);
        xmlHttpRequest.send(JSON.stringify(body));

        xmlHttpRequest.addEventListener("load", () => {
          const text = xmlHttpRequest.responseText;

          const headers = new Headers(xmlHttpRequest.getResponseHeaders().split("\n").map(header => {
            return header.split(": ");
          }));

          resolve(new Response(text, {
            status: xmlHttpRequest.response,
            headers
          }));
        });
      });
    }
  };
}
```

As you can see, the `request` method here is responsible for sending the request to the core library.

It will wait for the actual request made from the `XMLHttpRequest` Web API, and will send back a promise that resolves to a Web API `Response` object.

Of course, back in the time, the `XMLHttpRequest` Web API didn't return any `Response` object, but this is required to be returned as a `Promise` by the core library, so we simply translate the informations from this old API to a `Response` object.

But this is not finished, since the `ClientAdapter` needs an implementation for the `subscribe` method here.

For this method, we have to implement an `EventSource` as this is what is used (and returned) by the core library internally. The implementation below is pretty much what is used internally by the `@renkei/fetch` adapter, and here is the final code with the `subscribe` method required by the `ClientAdapter` interface.

```typescript
import { ClientAdapter } from "@renkei/core";

function createXmlHttpRequestAdapter() {
  const xmlHttpRequest = const new XMLHttpRequest();

  return {
    request: ({ url, body }) => {
      return new Promise(resolve => {
        xmlHttpRequest.open(url);
        xmlHttpRequest.send(JSON.stringify(body));

        xmlHttpRequest.addEventListener("load", () => {
          const text = xmlHttpRequest.responseText;

          const headers = new Headers(xmlHttpRequest.getResponseHeaders().split("\n").map(header => {
            return header.split(": ");
          }));

          resolve(new Response(text, {
            status: xmlHttpRequest.response,
            headers
          }));
        });
      });
    },
    subscribe: ({ url }) => {
      const eventSource = new EventSource(url);

      return {
        onEvent: (send) => {
          eventSource.addEventListener("message", event => {
            send(event.data);
          });          
        },
        close: () => {
          eventSource.close();
        }
      }
    }
  };
}
```

Now that this is done, we can finally use it as our own custom adapter for creating the client.

```typescript
import { createApplication, createHttpRoute, createEventRoute } from "@renkei/core";
import { z } from "zod";

const [ createUserRoute ] = createHttpRoute({
  input: value => {
    return z.object({
      firstname: z.string()
    }).parse(value);
  },
  output: value => {
    return z.object({
      identifier: z.string()
    }).parse(value);
  }
});

const [ userCreatedRoute ] = createEventRoute({
  output: value => {
    return z.object({
      identifier: z.string()
    }).parse(value);
  }
});

const { createClient } = createApplication({
  routes: {
    createUser: createUserRoute,
    userCreated: userCreatedRoute
  }
});

const client = createClient({
  server: "https://renkei.domain.com",
  adapter: createXmlHttpRequestAdapter()
});

client.userCreated(({ identifier }) => {
  console.log(`New user created with id ${identifier}`);
});

const response = await client.createUser({
  firstname: "John"
});

if (response instanceof Error) {
  console.error("Something went wrong");
} else {
  const { identifier } = response;

  console.log(`Created a new user with id: ${identifier}`);
}
```

As you can see in this example, we created two routes in order to showcase what we could do.

Now you know how to create your own adapter, and you can adapt this to match your tools, for instance, your could create an adapter that leverage the `axios` library, or any library that you currently use to request data from a server.