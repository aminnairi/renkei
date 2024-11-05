# 🚀 Getting started

## Requirements

- [Node.js](https://nodejs.org)
- [NPM](https://npmjs.com)

::: info
This library has been written in TypeScript, but has no requirements on a specific TypeScript platform to be executed, you could in theory use any platform, such as Deno or Bun, though for now, adapters for such platforms have not yet been written, although you could write your own if you follow the `ServerAdapter` interfaces. If you are not confortable with creating your own adapter, we recommend you stick to Node.js for now, adapter for such platforms.
:::

## Workspace Initialization

We will assume you start from a brand new project. Let's create a new folder for our project. Open a terminal and type the following commands.

```bash
mkdir my-awesome-project
```

Once that is done, we will need to change the current directory of command execution to the directory previously created, or open a new terminal inside that directory.

```bash
cd my-awesome-project
```

From now, we will create a NPM workspace. Let's first create our root `package.json` file

```bash
touch package.json
```

Now, we can create the workspace.

```json
{
  "workspaces": [
    "client",
    "core",
    "server"
  ]
}
```

Once that is done, we need to create the necessary workspaces before installing them.

```bash
mkdir client core server
touch client/package.json core/package.json server/package.json
```

And now, we need to create the content of each `package.json` file for each worskpace separately.

```json
{
  "private": true,
  "type": "module",
  "name": "@app/client",
  "version": "0.1.0",
  "description": "Client application"
}
```

```json
{
  "private": true,
  "type": "module",
  "name": "@app/core",
  "version": "0.1.0",
  "description": "Core application"
}
```

```json
{
  "private": true,
  "type": "module",
  "name": "@app/server",
  "version": "0.1.0",
  "description": "Server application"
}
```

Now, we can run the command to install our workspace, this is the same command used to install packages.

```bash
npm install
```

That's it! Your workspaces are now ready to be used.

## Package Installation

We will be using `vite` as the bundler of choice for the client project as it will help us use TypeScript for our client application easily, feel free to use whatever bundler you want, or no bundler if you feel bold enough!

We will also be using `zod` as the validator library this example, but feel free to use any validator that you want, or even manually validate the data.

Lastly, we will use `tsx` in order to execute the TypeScript code and start the server.

```bash
npm -w @app/core i @renkei/core zod tsx
npm -w @app/client i vite @renkei/fetch
npm -w @app/server i @renkei/node
```

::: tip
We have used the `@renkei/fetch` package for the client, and the `@renkei/node` package for the server, but you can use whatever client & server package you want for each and every of those folders. For now, the project only contains a Web API Fetch & Node.js HTTP adapter, but more are expected to come and you can choose the one you want for your platform of course.
:::

## Core Workspace Setup

We will now create the entrypoint for our core workspace.

```bash
touch core/index.ts
```

We will create a simple example for sending a firstname, and getting back from the server an indentifier.

```typescript
import { createApplication, createHttpRoute } from "@renkei/core";
import { z } from "zod";

export const [ createUserRoute, implementCreateUserRoute ] = createHttpRoute({
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

const { createClient, createServer } = createApplication({
  createUser: createUserRoute
});
```

## Server Workspace Setup

Now that we have created that, we can implement the route from the server-side, and start our server.

```bash
touch server/index.ts
```

```typescript
import { createNodeHttpServerAdapter } from "@renkei/node";
import { implementCreateUserRoute, createServer } from "@app/core";

const server = createServer({
  adapter: createNodeHttpServerAdapter({
    clients: ["http://localhost:5173"]
  }),
  implementations: {
    createUser: implementCreateUserRoute(async ({ firstname }) => {
      return {
        identifier: `identifier${firstname}identifier`
      };
    })
  }
});

const port = 8000;
const host = "0.0.0.0";

await server.start({ port, host });

console.log(`Listening for HTTP requests on http://${host}:${port}.`);
```

## Client Workspace Setup

Lastly, we need to call the server route from the client. For that, we need to create a simple HTML application with some TypeScript code.

```bash
touch client/index.html
```

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Renkei Demo</title>
  </head>
  <body>
    <script type="module" src="/index.ts"></script>
  </body>
</html>
```

And now for the TypeScript entrypoint.

```bash
touch client/index.ts
```

```typescript
import { createFetchAdapter } from "@renkei/fetch";
import { createClient } from "@app/core";

const client = createClient({
  adapter: createFetchAdapter(),
  server: "http://localhost:8000"
});

const response = await client.createUser({
  firstname: "John"
});

if (response instanceof Error) {
  console.error("Something went wrong.");
} else {
  console.log(`Identifier: ${response.identifier}`);
}
```

## Server Startup

Before we can start the server, a little bit of modification for our `package.json` is necessary.

```json
{
  "private": true,
  "type": "module",
  "name": "@app/server",
  "version": "0.1.0",
  "description": "Server application",
  "scripts": {
    "start": "tsx index.ts"
  },
  "dependencies": {
    "@renkei/node": "...",
    "zod": "...",
    "tsx": "..."
  }
}
```

Now, we can start the server application.

```bash
npm -w @app/server start
```

## Client Startup

Let's do the same for the client, first we will need to setup our script.

```json
{
  "private": true,
  "type": "module",
  "name": "@app/client",
  "version": "0.1.0",
  "description": "Client application",
  "scripts": {
    "start": "vite"
  },
  "dependencies": {
    "@renkei/fetch": "...",
    "vite": "..."
  }
}
```

And now for starting the client.

```bash
npm -w @app/client start
```

If everything went accordingly, you should be able to open your client application at <a href="http://localhost:5173" target="_blank">localhost:5173</a> (the default Vite.js port) and see the result in your Developer Console!