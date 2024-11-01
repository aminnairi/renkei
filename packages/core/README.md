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

## License

See [`LICENSE`](./LICENSE).

## Contributing

See [`CONTRIBUTING.md`](../../CONTRIBUTING.md).