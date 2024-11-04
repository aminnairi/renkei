# Getting started

## Requirements

- [Node.js](https://nodejs.org)
- [NPM](https://npmjs.com)

> [!NOTE]
> This library has been written in TypeScript, but has no requirements on a specific TypeScript platform to be executed, you could in theory use any platform, such as Node.js or Bun, though for now, adapters for such platforms have not yet been written, although you could write your own if you follow the `ServerAdapter` interfaces. If you are not confortable with creating your own adapter, we recommend you stick to Node.js for now, adapter for such platforms.

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
  "name": "client",
  "version": "0.1.0",
  "description": "Client application"
}
```

```json
{
  "private": true,
  "type": "module",
  "name": "core",
  "version": "0.1.0",
  "description": "Core application"
}
```

```json
{
  "private": true,
  "type": "module",
  "name": "server",
  "version": "0.1.0",
  "description": "Server application"
}
```

Now, we can run the command to install our workspace, this is the same command used to install packages.

## Package Installation

```bash
npm --workspace core install --save --save-exact @renkey/core
npm --workspace client install --save --save-exact vite @renkey/fetch
npm --workspace server install --save --save-exact @renkey/node
```

> [!NOTE]
> We have used the `@renkei/fetch` package for the client, and the `@renkei/node` package for the server, but you can use whatever client & server package you want for each and every of those folders. For now, the project only contains a Web API Fetch & Node.js HTTP adapter, but more are expected to come and you can choose the one you want for your platform of course.

> [!NOTE]
> We are using `vite` as the bundler of choice for the client project as it will help us use TypeScript for our client application easily, feel free to use whatever bundler you want, or no bundler if you feel bold enough!

## Core Workspace Setup

## Client Workspace Setup

## Server Workspace Setup

## Client Startup

## Server Startup