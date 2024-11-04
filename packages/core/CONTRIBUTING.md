# Contributing

## Requirements

- [Node.js](https://nodejs.org)
- [NPM](https://npmjs.com/)
- [Git](https://git-scm.com/)

Note that if you know what you are doing, you can also use other runtimes and package manager like [Deno](https://deno.com/), [Bun](https://bun.sh/), [PNPM](https://pnpm.io/fr/) or [Yarn](https://yarnpkg.com/).

## Clone the repository or fork the repository

```bash
git clone https://github.com/<username>/renkei
cd renkei
```

Where `<username>` is your GitHub's account user name. If only cloning from the official repository, replace `<username>` with `aminnairi`.

## Install the dependencies

Dependencies from all of the workspaces defined in the [`package.json`](./package.json) file will be installed and `node_modules` folders should appear for both the whole workspace, and each packages folder.

```bash
npm install
```

## Example

### Start the Node.js example server

This will start the application and listen to [`localhost:8000`](http://localhost:8000/) for requests from the client.

```bash
npm -w example/node start
```

### Start the Rect.js example server

This will start the application and listen to [`localhost:5173`](http://localhost:5173) for requests from the browser.

```bash
npm -w example/react start
```

## Sites

### Documentation

#### Start

```bash
npm -w sites/documentation start
```