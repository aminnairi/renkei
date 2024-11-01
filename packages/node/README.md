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
import { createNodeHttpServerAdapter } from "@superblue/node";
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
    clients: ["http://localhost:5173"]
  }),
  implementations: {
    createUser: createUserImplementation,
    userCreated: userCreatedImplementation
  }
});

server.start({ port: 8000, host: "0.0.0.0"});
```