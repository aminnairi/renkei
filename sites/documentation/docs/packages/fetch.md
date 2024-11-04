# API Core

This page will describe in details, the API used by the function exposed by the `@renkei/core` library.

## createHttpRoute

### Definition

```typescript
createHttpRoute<Input, Output>({ input, output }: { input: Validator<Input>, output: Validator<Output> }): [HttpRoute<Input, Output>, CreateHttpImplementation<Input, Output>];
```

### Explanation

This function will create a tuple containing the route, and a function to implement the route from the server side.

It accepts the route definition, since an HTTP request contains both a request and a response, you have to define a request parser, and a response parser.

### Example

```typescript
import { createHttpRoute } from "@renkei/core";
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
    });
  }
});
```

You can extract the created route by extracting the first returned value from the output array.

```typescript
import { createHttpRoute } from "@renkei/core";
import { z } from "zod";

const [ createUserRoute ] = createHttpRoute({
  input: value => {
    return z.object({
      firstname: z.string()
    }).parse(value);
  },
  output: value => {
    return z.object({
      identifier: z.string()
    });
  }
});
```

You can also get a function that will help you get the proper type of the output that needs to be implemented from the server side.

```typescript
import { createHttpRoute } from "@renkei/core";
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
    });
  }
});
```

## createEventRoute

### Definition

```typescript
function createEventRoute<Output>({ output }: { output: Validator<Output> }): [EventRoute<Output>, CreateEventImplementation<Output>];
```

### Explanation

If you only care about receiving notifications from the server without interuptions, you can create an event route. This is typically an implementation of an EventSource from the client side, but depending on the client adapter used, it can also be implemented using a WebSocket.

### Example

```typescript
import { createEventRoute } from "@renkei/core";
import { z } from "zod";

createEventRoute({
  output: value => {
    return z.object({
      identifier: z.string()
    });
  }
});
```

You can even extract, just like for the `createHttpRoute` the created route.

```typescript
import { createEventRoute } from "@renkei/core";
import { z } from "zod";

const [ userCreatedRoute ] = createEventRoute({
  output: value => {
    return z.object({
      identifier: z.string()
    });
  }
});
```

And even the resulting implementation helper function.

```typescript
import { createEventRoute } from "@renkei/core";
import { z } from "zod";

const [ userCreatedRoute, implementUserCreatedRoute ] = createEventRoute({
  output: value => {
    return z.object({
      identifier: z.string()
    });
  }
});
```

## createApplication

### Definition

```typescript
function createApplication<Routes extends Record<string, Route<unknown, unknown>>>(options: { routes: Routes }): Application<Routes>;
```

### Explanation

This function will help you create the base application that will serve as the base for implementing the client and server.

### Example

```typescript
import { createApplication, createHttpRoute } from "@renkei/core";
import { z } from "zod";

const [ createUserRoute ] = createHttpRoute({
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

createApplication({
  routes: {
    createUser: createUserRoute
  }
});
```

From there, you can extract the necessary function that will help you implement the client side, and the server side.

```typescript
import { createApplication, createHttpRoute } from "@renkei/core";
import { z } from "zod";

const [ createUserRoute ] = createHttpRoute({
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

const { createServer, createClient } = createApplication({
  routes: {
    createUser: createUserRoute
  }
});
```

You typically want to use a `ClientAdapter` or a `ServerAdapter` in order to call these functions.