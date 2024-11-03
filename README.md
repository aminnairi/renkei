# superblue

Effortless type-safe communication between client and server

## Packages

Package | Type | Description
---|---|---
[`@superblue/core`](./packages/core) | Core | Effortless type-safe communication between client and server
[`@superblue/fetch`](./packages/fetch) | Client | Web API Fetch adapter for superblue
[`@superblue/node`](./packages/node) | Server | Node.js adapter for superblue

## Example

Example | Type | Description
---|---|---
[`@example/shared`](./example/shared/) | Core | Shared code necessary for both the client and server
[`@example/react`](./example/react/) | Client | React.js example using Vite.js and the `fetch` Web API
[`@example/node`](./example/node/) | Server | Node.js example using the builtin `http` library

## License

See [`LICENSE`](./LICENSE).

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Code of conduct

See [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md).

## Security

See [`SECURITY.md`](./SECURITY.md).

## Todo

See [`TODO.md`](./TODO.md).

## Why

### Http does not scale

Traditional HTTP protocols are simple and universal, but they present challenges for building complex, scalable systems. In a microservices or multi-service architecture, the typical HTTP approach has several limitations:

- **Route Complexity and Schema Management**: In modern applications, each route has specific validation requirements. The HTTP protocol lacks a standard way to describe or validate these schemas, making scalability challenging.
- **Error and Status Handling**: HTTP error handling can become inconsistent or imprecise, especially in environments with numerous dependencies and potential error sources.
- **Consistency and Code Reuse**: As applications grow, maintaining consistent handling of routes, schemas, and error structures across multiple services becomes harder. Repeated configuration in each service leads to duplicated code and increases the risk of inconsistency.

`superblue` enhances the HTTP protocol by enabling you to directly write functions that can be called directly from the client. Internally, it uses the HTTP protocol in a way that enables you to write your code as a function rather than as an HTTP request, just like you would for any other function.

### JavaScript does not scale

JavaScript offers flexibility but lacks typing guarantees, making large-scale projects more challenging to maintain:

- **Dynamic Typing**: JavaScript’s dynamic typing can lead to runtime errors that are hard to diagnose, making code less reliable and more expensive to maintain.
- **Manual Validation**: Without static typing, request and response payloads require complex, manual validation, adding bug-prone code to each route.
- **Repetitive Code**: Handling requests and responses in a classic JavaScript system involves duplicative code that increases technical debt and reduces code readability.

`superblue` leverages Zod for static typing and runtime validation, ensuring each request and response adheres to defined schemas. This approach reduces errors, clarifies route contracts, and improves maintainability.

### Errors are hard to handle

Error handling is a complex aspect of modern application development, with unique challenges on both server and client sides:

- **Standardized Error Structures**: Without a unified structure, errors across services are inconsistent, making it difficult for clients to interpret and handle them accurately.
- **Centralized Control**: Configuring access controls and error handling in each service individually adds maintenance overhead and increases security risks. superblue allows centralized configuration of error handling, reducing redundancy and improving error clarity.
- **Detailed Error Messages for Clients**: Client applications, such as mobile and web apps, need structured, predictable error responses to provide feedback to users and make intelligent retry or fallback decisions.
- **Improved Security with Controlled Responses**: Detailed error messages must be managed carefully to avoid revealing sensitive information. With `superblue`, error responses can be configured to balance user feedback and security, ensuring that only necessary information is shared while maintaining safe practices.

With `superblue`, error handling becomes more manageable, consistent, and secure across both server and client applications. Centralized error structures reduce duplication and provide a more predictable experience for clients, while controlled error responses enhance security.

## Prior Art

### tRPC

tRPC is a popular library in the TypeScript community for building APIs with type-safe client consumption. It has gained traction in widely used stacks like T3 and Sidebase and is now a well-established, battle-tested choice. In contrast, Superblue is a newer library offering a similar advantage: end-to-end type safety, allowing developers to write APIs faster and with greater confidence by minimizing the risk of breaking changes.

However, tRPC and Superblue operate quite differently. Superblue relies heavily on Zod for schema definitions, which are then used both on the client and server to validate data, while tRPC is more flexible with schema tooling, allowing you to choose your preferred schema library for type-checking.

On the client side, tRPC doesn’t enforce any special validation with the server; it simply imports types that guide data structures for requests, leaving it up to the server to validate incoming data against the schema. Superblue, by comparison, validates data both client- and server-side, adding a layer of runtime checks. This dual validation ensures that even if a server response differs unexpectedly (e.g., due to a crash or unexpected error), the client will still validate the data before using it, providing a bit more safety at the cost of some runtime overhead.

Both tRPC and Superblue work with major frameworks and server environments. While tRPC is somewhat tied to Node.js primitives, Superblue takes a more modular approach with its `@superblue/core` package, which remains implementation-agnostic. Instead, Superblue provides abstract interfaces implemented by various adapters, like `@superblue/fetch` and `@superblue/node`, with more likely to follow.

One unique feature of tRPC is request batching, which allows multiple requests to be grouped and sent as a single request, enhancing performance and reducing request overhead. Currently, Superblue doesn’t support batching, though it may be added in the future.

### GraphQL

GraphQL is a distinctive solution in the API landscape, designed to provide a more flexible and efficient approach to data fetching. Unlike traditional REST APIs, where the server defines the structure of the response, GraphQL empowers clients to request precisely the data they need. 

This client-driven flexibility can help reduce network data transfer and minimize the number of requests required to gather related information. However, it introduces complexities, such as the need for more robust querying mechanisms and the overhead of managing a schema.

While GraphQL excels in applications needing complex data interactions, it operates differently from Superblue. Superblue focuses on type-safe remote procedure calls, aiming for straightforward and type-checked server-client communication.

### gRPC

gRPC is a powerful solution designed for performance-oriented, cross-language communications, making it a popular choice in microservices architectures. Its primary advantage lies in its multi-language support, enabling developers to build services in various programming languages while maintaining seamless interoperability.

gRPC leverages Protocol Buffers for serialization, ensuring efficient data exchange and enabling automatic generation of client libraries for languages like Java, Python, Go, and C#. This versatility makes gRPC especially appealing to organizations with diverse technology stacks.

However, it’s worth noting that gRPC operates outside of the HTTP protocol, which limits its primary use to server-to-server communications rather than client-facing applications.

While Superblue and gRPC both emphasize type-safe, structured communication, gRPC focuses on inter-service connectivity and broad multi-language compatibility. In contrast, Superblue centers on facilitating type-safe remote procedure calls that are equally suited for both client and server applications.

### Hono

Hono is a lightweight framework designed to support remote procedure calls (RPC) and facilitate seamless client-server communication through its built-in libraries. It offers a range of features, including libraries for both client and server functionality, making it a convenient choice for straightforward RPC solutions.

However, Hono currently falls short of Superblue in terms of type safety and validation for incoming data. This gap in type safety makes it less robust for applications that require strict data validation and type consistency.

Despite this, Hono’s simplicity and effective RPC approach make it an appealing alternative for developers seeking a streamlined solution. As Hono continues to develop, it may close the gap in type safety, potentially broadening its use cases and aligning more closely with the capabilities offered by Superblue.

### TS Rest

TS Rest is perhaps the most similar library to Superblue, as both emphasize the importance of contracts in API communication. TS Rest enables developers to define a contract that both the client and server must follow, providing a clear structure for interaction.

One of TS Rest's strengths is its support for defining both the request body and status codes, adding an extra layer of type discrimination and enhancing overall type safety in communication.

Superblue, on the other hand, promotes flexibility by encouraging users to manage type definitions themselves, giving them greater freedom in API design. Superblue’s approach is heavily inspired by TS Rest’s design philosophy, underscoring the demand for robust, type-safe communication solutions in modern development.

### Others?

There are certainly more libraries out there, in other programming languages as well that have been forgotten here, but these represents the main inspiration source for building Superblue.