# @superblue/core

Effortless type-safe communication between client and server

## Requirements

- [Node](https://nodejs.org)
- [NPM](https://npmjs.com)

## Installation

Create your project's folder.

```bash
mkdir my-awesome-project
cd my-awesome-project
```

Create the main `package.json` for defining the workspace.

```bash
touch package.json
```

```json
{
  "private": true,
  "workspaces": [
    "example/shared",
    "example/client",
    "example/server"
  ]
}
```

Create the first workspace (note that other workspace's creation are defined in [`@superblue/fetch`](../fetch) and [`@superblue/node`](../node)).

```bash
mkdir -p example/shared
```

Create the shared workspace's `package.json`.

``` bash
touch example/shared/package.json
```

```json
{
  "private": true,
  "type": "module",
  "name": "@example/node"
}
```

Install the workspaces.

```bash
npm install
```

Install `@superblue/core` for the `shared` workspace.

```bash
npm --workspace @example/node install --save --save-exact @superblue/core
```

Create the TypeScript configuration for the `shared` workspace.

```bash
touch example/shared/tsconfig.json
```

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

This is the mandatory option for working properly with `@superblue/core`, you can add other options as well.

Create the main entrypoint for the `shared` workspace.

```bash
touch example/shared/index.ts
```

Initialize a new application to be consumed by any client or server implementation.

```ts
import { createApplication, createHttpRoute, createEventRoute } from "@superblue/core";
import { z } from "zod";

export const [ createUserRoute, implementCreateUser ] = createHttpRoute({
  input: value => {
    return z.object({
      firstname: z.string(),
      lastname: z.string()
    }).parse(value);
  },
  output: value => {
    return z.object({
      identifier: z.string()
    }).parse(value);
  }
});

export const [ userCreatedRoute, implementUserCreated ] = createEventRoute({
  output: value => {
    return z.object({
      identifier: z.string()
    }).parse(value);
  }
});

export const { createClient, createServer } = createApplication({
  routes: {
    createUser: createUserRoute,
    userCreated: userCreatedRoute
  }
});
```

## What's next

Choose and initialize a client, like [`@superblue/fetch`](../fetch), and a server, like [`@superblue/node`](../node).

## API

With Superblue, you have access to two types of routes.

One of which being HTTP routes.

A HTTP route is simply the definition of a route that should receive HTTP requests, and send back an HTTP response.

In order to know what we will receive from the request, and what to send back as a response, we use `zod` here in order to define the schema for the request (input) and response (output).

```typescript
import { createHttpRoute } from "@superblue/core";
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
    }).parse(value);
  }
});
```

Notice here that we are using Zod in order to validate the data: you can use any library that you want from here, it only needs to parse the value that will be received from the sevrer or from the clients to be validated and adds an extra layer of security.

We intend on releasing soon a library that will handle the validation for you, as well as providing safe schemas to be used for serialization since this library serializes its data using JSON, and this library might not work with all schemas offered by Zod.

When executing this function, you get back two functions, returned in an array that you can then destructure.

```typescript
import { createHttpRoute } from "@superblue/core";
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
```

The `createUserRoute` will be used later in the `createApplication` function explained below.

The `implementCreateUserRoute` can be used with any server adapter, as described in the [`@superblue/node`](../node) server adapter library for instance.

Next, you have to use these route in the application definition using the `createApplication` function.

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

That's it, you know know how to create your first `superblue` application. Don't forget to read the documentation for the packages above to finish setting up your application in order to create your seamless client/server communication environment!

## License

See [`LICENSE`](./LICENSE).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md).

## Code of conduct

See [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## Security

See [`SECURITY.md`](./SECURITY.md).