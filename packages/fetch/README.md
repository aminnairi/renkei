# @superblue/fetch

## Requirements

- Node
- NPM

## Usage

```bash
mkdir -p example/client
touch example/client/package.json
```

```json
{
  "private": true,
  "type": "module",
  "name": "@example/client"
}
```

```bash
npm install
npm --workspace @example/client install --save --save-exact @superblue/fetch
touch example/client/tsconfig.json
```

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

```bash
touch example/client/index.ts
```

```typescript
import { createClient } from "@example/shared";
import { createFetchAdapter } from "@superblue/fetch";

export const client = createClient({
  server: "http://localhost:8000",
  adapter: createFetchAdapter()
});

const close = client.userCreated(({ identifier }) => {
  console.log(`User created with id ${identifier}.`);
});

setTimeout(() => {
  close();
}, 30_000);

const abortController = new AbortController();

const { identifier } = await client.createUser({
  firstname: "John",
  lastname: "DOE"
});

setTimeout(() => {
  abortController.abort();
}, 3_000);
```

## API

If you didn't yet, we highly suggest you start off by reading the documentation for [`@superblue/core`](../core) since this is the baseline for every other library like this one, so check it out!

### createClient

This is the function that will allow you to create the client-side of your application created using [`@superblue/core`](../core).

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

const { createClient } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

createClient({
  /* ... */
});
```

Creating a client needs at least two informations. The first one being the server to connect. This is done so that you can create multiple clients, connecting to multiple servers with redundancy.

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

const { createClient } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

createClient({
  server: "https://superblue.yourapp.com"
});
```

The second information needed for the `createClient` application to work is the adapter to use.

An adapter is simply an implementation of the way HTTP requests are made.

Fortunately, you don't have to write your own, you can simply use the one provided by this library which implements the Web API Fetch, which is now widely used in all major browsers and should work seamlessly between all of your customers' browser.

```typescript
import { createApplication, createHttpRoute, z } from "@superblue/core";
import { createFetchAdapter } from "@superblue/fetch";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: z.object({
    firstname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});

const { createClient } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

createClient({
  server: "https://superblue.yourapp.com",
  adapter: createFetchAdapter()
});
```

Once this has been all setup, you can grab the client that is returned by the `createClient` function.

```typescript
import { createApplication, createHttpRoute, z } from "@superblue/core";
import { createFetchAdapter } from "@superblue/fetch";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: z.object({
    firstname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});

const { createClient } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

const client = createClient({
  server: "https://superblue.yourapp.com",
  adapter: createFetchAdapter()
});
```

This is what you'll use in your client applications, like a React, Vue, Angular or JavaScript Web applications.

`client` here is an object that contains all of your route names defined in the `createApplication` function, so you can start and call it if you want.

```typescript
import { createApplication, createHttpRoute, z } from "@superblue/core";
import { createFetchAdapter } from "@superblue/fetch";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: z.object({
    firstname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});

const { createClient } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});

const client = createClient({
  server: "https://superblue.yourapp.com",
  adapter: createFetchAdapter()
});

const { identifier } = await client.createUser({
  firstname: "John"
});
```

In this case, it won't work because we haven't setup our server implementation, like [`@superblue/node`](../node) for instance, but this is a cool example of how you can use this object.

## What's next

Now that you setup your client, you may want to setup your server as well if this is not done already, head to [`@superblue/node`](../node) if you want to use the official Node.js `http` module for serving your client, or use any server adapter you want (or your own) in order to have a complete environment.

## License

See [`LICENSE`](./LICENSE).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).