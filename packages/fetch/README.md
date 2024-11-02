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