# 📜 Prior Art

## tRPC

tRPC is a popular library in the TypeScript community for building APIs with type-safe client consumption. It has gained traction in widely used stacks like T3 and Sidebase and is now a well-established, battle-tested choice. In contrast, `renkei` is a newer library offering a similar advantage: end-to-end type safety, allowing developers to write APIs faster and with greater confidence by minimizing the risk of breaking changes.

However, tRPC and `renkei` operate quite differently. `renkei` relies on schema definitions, which are then used both on the client and server to validate data, while tRPC is more flexible with schema tooling, allowing you to choose your preferred schema library for type-checking.

On the client side, tRPC doesn’t enforce any special validation with the server; it simply imports types that guide data structures for requests, leaving it up to the server to validate incoming data against the schema. `renkei`, by comparison, validates data both client- and server-side, adding a layer of runtime checks. This dual validation ensures that even if a server response differs unexpectedly (e.g., due to a crash or unexpected error), the client will still validate the data before using it, providing a bit more safety at the cost of some runtime overhead.

Both tRPC and `renkei` work with major frameworks and server environments. While tRPC is somewhat tied to Node.js primitives, `renkei` takes a more modular approach with its `@renkei/core` package, which remains implementation-agnostic. Instead, `renkei` provides abstract interfaces implemented by various adapters, like `@renkei/fetch` and `@renkei/node`, with more likely to follow.

One unique feature of tRPC is request batching, which allows multiple requests to be grouped and sent as a single request, enhancing performance and reducing request overhead. Currently, `renkei` doesn’t support batching, though it may be added in the future.

## GraphQL

GraphQL is a distinctive solution in the API landscape, designed to provide a more flexible and efficient approach to data fetching. Unlike traditional REST APIs, where the server defines the structure of the response, GraphQL empowers clients to request precisely the data they need. 

This client-driven flexibility can help reduce network data transfer and minimize the number of requests required to gather related information. However, it introduces complexities, such as the need for more robust querying mechanisms and the overhead of managing a schema.

While GraphQL excels in applications needing complex data interactions, it operates differently from `renkei`. `renkei` focuses on type-safe remote procedure calls, aiming for straightforward and type-checked server-client communication.

## gRPC

gRPC is a powerful solution designed for performance-oriented, cross-language communications, making it a popular choice in microservices architectures. Its primary advantage lies in its multi-language support, enabling developers to build services in various programming languages while maintaining seamless interoperability.

gRPC leverages Protocol Buffers for serialization, ensuring efficient data exchange and enabling automatic generation of client libraries for languages like Java, Python, Go, and C#. This versatility makes gRPC especially appealing to organizations with diverse technology stacks.

However, it’s worth noting that gRPC operates outside of the HTTP protocol, which limits its primary use to server-to-server communications rather than client-facing applications.

While `renkei` and gRPC both emphasize type-safe, structured communication, gRPC focuses on inter-service connectivity and broad multi-language compatibility. In contrast, `renkei` centers on facilitating type-safe remote procedure calls that are equally suited for both client and server applications.

## Hono

Hono is a lightweight framework designed to support remote procedure calls (RPC) and facilitate seamless client-server communication through its built-in libraries. It offers a range of features, including libraries for both client and server functionality, making it a convenient choice for straightforward RPC solutions.

However, Hono currently falls short of `renkei` in terms of type safety and validation for incoming data. This gap in type safety makes it less robust for applications that require strict data validation and type consistency.

Despite this, Hono’s simplicity and effective RPC approach make it an appealing alternative for developers seeking a streamlined solution. As Hono continues to develop, it may close the gap in type safety, potentially broadening its use cases and aligning more closely with the capabilities offered by `renkei`.

## TS Rest

TS Rest is perhaps the most similar library to `renkei`, as both emphasize the importance of contracts in API communication. TS Rest enables developers to define a contract that both the client and server must follow, providing a clear structure for interaction.

One of TS Rest's strengths is its support for defining both the request body and status codes, adding an extra layer of type discrimination and enhancing overall type safety in communication.

`renkei`, on the other hand, promotes flexibility by encouraging users to manage type definitions themselves, giving them greater freedom in API design. `renkei`’s approach is heavily inspired by TS Rest’s design philosophy, underscoring the demand for robust, type-safe communication solutions in modern development.

## Others?

There are certainly more libraries out there, in other programming languages as well that have been forgotten here, but these represents the main inspiration source for building `renkei`.