# @superblue/node

Node.js adapters for superblue

## Requirements

- [Node](https://nodejs.org)
- [NPM](https://npmjs.com)

## Usage

```bash
mkdir -p example/server
touch example/server/package.json
```

```json
{
  "private": true,
  "type": "module",
  "name": "@example/server"
}
```

```bash
npm install
npm --workspace @example/server install --save --save-exact @superblue/node
touch example/server/tsconfig.json
```

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

```bash
touch example/server/index.ts
```

```typescript
import { createServer, implementCreateUser, implementUserCreated } from "@example/shared"
import { createNodeHttpServerAdapter, gzipCompression } from "@superblue/node";
import { EventEmitter } from "events";

const userCreatedEventEmitter = new EventEmitter();

const createUserImplementation = implementCreateUser(async ({ firstname, lastname }) => {
  const identifier = `${firstname}:${lastname}:`;

  userCreatedEventEmtiter.emit("userCreated", identifier);

  return {
    identifier
  }
});

const userCreatedImplementation = implementUserCreated(send => {
  userCreatedEventEmitter.on("userCreated", identifier => {
    send({
      identifier
    })
  });
});

const server = createServer({
  adapter: createNodeHttpServerAdapter({
    clients: ["http://localhost:5173"],
    compression: gzipCompression({
      exceptions: [
        "text/event-stream"
      ]
    })
  }),
  implementations: {
    createUser: createUserImplementation,
    userCreated: userCreatedImplementation
  }
});

server.start({ port: 8000, host: "0.0.0.0"});
```

## API

After defined your routes using `createHttpRoute` or `createEventRoute` and plugged them all using the `createApplication` function, you'll need to define the implementation for the server used to respond to those requests.

For that, you can use the `createServer` function.

```typescript
import { createApplication, createHttpRoute, z } from "@superblue/core";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: z.object({
    firstname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});

const { createServer } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

createServer(/* ... */);
```

This function takes one argument, which is an object defining the options for the server.

The first important thing to declare are concrete implementations of the routes that your created using the `createHttpRoute` or `createEventRoute` functions.

```typescript
import { createApplication, createHttpRoute, z } from "@superblue/core";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: z.object({
    firstname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});

const { createServer } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

createServer({
  implementations: {
    createUser: implementCreateUserRoute(async ({ firstname }) => {
      return {
        identifier: `id:${firstname}:id`
      }
    })
  }
});
```

These concrete implementations help separate the route definitions from the implementations.

Once that is done, you need to choose, or create your own, adapter for serving requests. Fortunately, you don't have to do this by yourself since this library has already an adapter based on the `http` Node.js builtin library.

```typescript
import { createApplication, createHttpRoute, z } from "@superblue/core";
import { createNodeHttpServerAdpater } from "@superblue/node";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: z.object({
    firstname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});

const { createServer } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

createServer({
  implementations: {
    createUser: implementCreateUserRoute(async ({ firstname }) => {
      return {
        identifier: `id:${firstname}:id`
      }
    })
  },
  adapter: createNodeHttpServerAdapter({
    /* ... */
  })
});
```

This adapter takes some options that may be important enough, depending on your use cases.

The first one is the clients that are connecting to your server.

```typescript
import { createApplication, createHttpRoute, z } from "@superblue/core";
import { createNodeHttpServerAdpater } from "@superblue/node";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: z.object({
    firstname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});

const { createServer } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

createServer({
  implementations: {
    createUser: implementCreateUserRoute(async ({ firstname }) => {
      return {
        identifier: `id:${firstname}:id`
      }
    })
  },
  adapter: createNodeHttpServerAdapter({
    clients: ["https://app.yourapp.com"]
  })
});
```

As you can see, the clients are simply an array of strings, containing the domain names, or IP addresses, with the scheme (`http` or `https`) from where the clients are connecting to your server. This, behind the scenes, will help with cross-origin resources sharing since browsers will check that the correct headers are sent from the server to the authorized clients when the IP of the server is different from the IP from the client.

The second information, that you can omit, is the compression strategy that you want to use for responding to your clients.

By default, the strategy is set to `noCompression`.

```typescript
import { createApplication, createHttpRoute, z } from "@superblue/core";
import { createNodeHttpServerAdpater, noCompression } from "@superblue/node";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: z.object({
    firstname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});

const { createServer } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

createServer({
  implementations: {
    createUser: implementCreateUserRoute(async ({ firstname }) => {
      return {
        identifier: `id:${firstname}:id`
      }
    })
  },
  adapter: createNodeHttpServerAdapter({
    clients: ["https://app.yourapp.com"],
    compression: noCompression()
  })
});
```

You can write your own `CompressionStrategy`, but fortunately, there are implementations for all major compression strategies supported by your browser such as `brotli`, `deflate` and `gzip`.

```typescript
import { createApplication, createHttpRoute, z } from "@superblue/core";
import { createNodeHttpServerAdpater, gzipCompression } from "@superblue/node";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: z.object({
    firstname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});

const { createServer } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

createServer({
  implementations: {
    createUser: implementCreateUserRoute(async ({ firstname }) => {
      return {
        identifier: `id:${firstname}:id`
      }
    })
  },
  adapter: createNodeHttpServerAdapter({
    clients: ["https://app.yourapp.com"],
    compression: gzipCompression()
  })
});
```

You might encouter some issue when serving events from your server when compressing responses for all requests.

As of today, I haven't understood why events that are compressed are not sent and received properly by both the server and the client, this is a problem that can be fixed by using no compression at all.

But if you still want to compress your regular HTTP requests, but leave aside the events, you can also pass an option to the compression functions in order to blacklist some requests from the compression.

```typescript
import { createApplication, createHttpRoute, z } from "@superblue/core";
import { createNodeHttpServerAdpater, gzipCompression } from "@superblue/node";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: z.object({
    firstname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});

const { createServer } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

createServer({
  implementations: {
    createUser: implementCreateUserRoute(async ({ firstname }) => {
      return {
        identifier: `id:${firstname}:id`
      }
    })
  },
  adapter: createNodeHttpServerAdapter({
    clients: ["https://app.yourapp.com"],
    compression: gzipCompression({
      exceptions: [
        "text/event-stream"
      ]
    })
  })
});
```

Here, `text/event-stream` is the `Content-Type` header sent when sending events to the client, so that they are ignored from the compression strategy properly and sent accordingly to the browser to be decoded normally.

## What's next

Now that you setup your server, you may want to setup your client as well if this is not done already, head to [`@superblue/fetch`](../fetch) if you want to use the official Web API `fetch` function for sending requests to your server, or use any client adapter you want (or your own) in order to have a complete environment.

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md).

## Code of conduct

See [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## Security

See [`SECURITY.md`](./SECURITY.md).