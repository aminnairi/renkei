# @superblue/node

## Requirements

- Node
- NPM

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

## FAQ

### Why are my events not firing from the server to the client?

This maybe caused by the compression. As of today, I haven't understand why events that are compressed are not sent and received properly by both the server and the client, this is a problem that can be fixed by using no compression at all.

```typescript
//...
import { createNodeHttpServerAdapter, noCompression } from "@superblue/node";

const server = createServer({
  adapter: createNodeHttpServerAdapter({
    clients: ["http://localhost:5173"],
    compression: noCompression()
  }),
  implementations: {
    //...
  }
});
```

If you still want to compress your regular HTTP requests, but leave aside the events, you can also pass an option to the compression functions in order to blacklist some requests from the compression.

```typescript
//...
import { createNodeHttpServerAdapter, gzipCompression } from "@superblue/node";

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
    //...
  }
});
```