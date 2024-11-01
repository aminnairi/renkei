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
import { createHttpClientAdapter } from "@superblue/fetch";

export const client = createClient({
  server: "http://localhost:8000",
  adapter: createHttpClientAdapter()
});
```