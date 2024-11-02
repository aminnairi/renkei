# @superblue/core

Effortless type-safe communication between client and server

## Usage

```bash
touch package.json
```

```json
{
  "workspaces": [
    "example/shared",
    "example/client",
    "example/server"
  ]
}
```

```bash
mkdir -p example/shared
touch example/shared/package.json
```

```json
{
  "private": true,
  "type": "module",
  "name": "@example/node"
}
```

```bash
npm install
npm --workspace @example/node install --save --save-exact @superblue/core
touch example/shared/tsconfig.json
```

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

```bash
touch example/shared/index.ts
```

```ts
import { createApplication, createHttpRoute, createEventRoute, z } from "@superblue/core";

export const [ createUserRoute, implementCreateUser ] = createHttpRoute({
  input: z.object({
    firstname: z.string(),
    lastname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});

export const [ userCreatedRoute, implementUserCreated ] = createEventRoute({
  output: z.object({
    identifier: z.string()
  })
});

export const { createClient, createServer } = createApplication({
  routes: {
    createUser: createUserRoute,
    userCreated: userCreatedRoute
  }
});
```

## API

### createHttpRoute

With Superblue, you have access to two types of routes.

One of which being HTTP routes.

A HTTP route is simply the definition of a route that should receive HTTP requests, and send back an HTTP response.

In order to know what we will receive from the request, and what to send back as a response, we use `zod` in order to define the schema for the request (input) and response (output).

```typescript
import { createHttpRoute, z } from "@superblue/core";

createHttpRoute({
  input: z.object({
    firstname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});
```

Note that you can import everything from the `zod` library since `superblue` exports everything from `zod` and it is a direct dependency. If you need to know which version of `zod` is used, look at the [`package.json`](./package.json), in the `dependencies` object looking for `zod`.

When executing this function, you get back two functions, returned in an array that you can then destructure.

```typescript
import { createHttpRoute, z } from "@superblue/core";

const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
  input: z.object({
    firstname: z.string()
  }),
  output: z.object({
    identifier: z.string()
  })
});
```

The `createUserRoute` will be used later in the `createApplication` function explained below.

The `implementCreateUserRoute` can be used with any server adapter, as described in the [`@superblue/node`](../node) server adapter library for instance.

### createApplication

This function let's you create the core of your application.

```typescript
import { createApplication } from "@superblue/core";

createApplication({
  routes: {
    createUser: createUserRoute
  }
});
```

The name of the route, here `createUser` is important since it will be the name of the route that will be used by clients consuming your APIs, like the [`@superblue/fetch`](../fetch) library. Choose a name that suits your needs.

The `createApplication` function also returns a bunch of useful functions.

```typescript
import { createApplication } from "@superblue/core";

const { createClient, createServer } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});
```

Since the `createApplication` is simply the shell for your entire application, it separates the route schema, from the client implementation ([`@superblue/fetch`](../fetch) for instance) and the server implementation ([`@superblue/node`](../node) for instance).

That's it, you know know how to create your first `superblue` application. Don't forget to read the documentation below to finish setting up your application in order to create your seamless client/server communication environment!

## License

See [`LICENSE`](./LICENSE).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).