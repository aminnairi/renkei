# superblue

Effortless type-safe communication between client and server

## Packages

Package | Description
---|---
[`@superblue/core`](./packages/core) | Effortless type-safe communication between client and server
[`@superblue/fetch`](./packages/fetch) | Web API Fetch adapter for superblue
[`@superblue/node`](./packages/node) | Node.js adapter for superblue

## Example

See [`example`](./example).

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

tRPC is a library that helps you write APIs that are type-safe to consume on the client.

It is now well known in the TypeScript community, it is especially used in stacks like the T3 or Sidebase and is now a battle-tested library, in the contrary of superblue which is still at its young age.

Superblue is very similar in the sense that it helps you build APIs with end-to-end type safety, enabling you to write code faster and safer, without fearing breaking something.

However, the way tRPC works compared to superblue are very different.

Superblue highly relies on Zod in order to create a schema that you can then use on the client and the server to communicate and receive data. This is not the case for tRPC since it enabled you to choose whatever you want to create the schema that is then used to type check your data.

On the other hand, tRPC on the client does not do anything special with the server, it only import the types that help you send the correct data to the server, that will then validate that the data is aligned according to the schema.

Superblue does things in a little more paranoid fashion: it checks for the data on both the client and the server, because if something happens, and the server has to send something totally different (in case of a crash for example), you can be sure that the data is still validated on the client, and so at runtime. This adds some runtime slowdown, but at the cost of more data safety.

Both tRPC and superblue works with major framework and servers. While tRPC is somewhat coupled to some Node.js primitives, on the other hand superblue, in its package `@superblue/core` is not tied to any specific implementation, and rather relies on abstract interfaces that are then implemented by libraries such as `@superblue/fetch` and `@superblue/node`, and more to come!

tRPC does something very interesting to enhance request performance when sending multiple requests at the same time: batching. This enables you to have multiple requests sent as one, decreasing the number of requests and data needed to perform your actions. This is something that is actually missing in superblue, but maybe implemented in a near future.

### GraphQL

GraphQL stands out as a unique solution in the landscape of APIs, designed primarily to provide a more flexible and efficient way of handling data fetching. Unlike traditional REST APIs, where the server dictates the structure of the response, GraphQL allows clients to specify exactly what data they need. This flexibility can reduce the amount of data transferred over the network and minimize the number of requests required to gather related information. However, this comes with its own complexities, including the need for more robust querying mechanisms and the overhead of managing the schema. While GraphQL is excellent for applications that require complex data interactions, it operates in a different realm compared to Superblue, which emphasizes type-safe remote procedure calls with straightforward server-client communication.

### gRPC

gRPC stands out as a powerful solution for performance-oriented, cross-language communications, making it a favored choice in microservices architectures. One of its key advantages is its support for multiple programming languages, allowing developers to build services in various languages while still maintaining seamless interoperability. gRPC utilizes Protocol Buffers for serialization, which ensures efficient data exchange and enables automatic generation of client libraries across languages such as Java, Python, Go, and C#. This multi-language capability makes gRPC particularly appealing for organizations that leverage diverse technology stacks. However, it's important to note that gRPC operates outside the constraints of the HTTP protocol, limiting its use primarily to server-to-server communications rather than client-facing applications. While Superblue and gRPC share common ground in providing type-safe, structured communication, gRPC’s emphasis on inter-service connectivity and its broad multi-language support further distinguish it from Superblue, which focuses on facilitating type-safe remote procedure calls for both client and server applications.

### Hono

Hono is a lightweight framework that supports remote procedure calls (RPC) and facilitates seamless communication between client and server through its built-in libraries. While it boasts an impressive feature set, including a client and server library, Hono currently lags behind Superblue in terms of type safety and validation for incoming data. The framework's approach to RPC makes it an interesting alternative for developers looking for a simple yet effective solution. As Hono continues to evolve, it could bridge the gap in type safety, potentially expanding its use cases and aligning more closely with the capabilities offered by Superblue.

### TS Rest

TS Rest is perhaps the closest library to Superblue in terms of shared principles, as it emphasizes the importance of contracts in API communication. By allowing developers to define a contract that both the client and server must adhere to, TS Rest provides a clear structure for interaction. Its support for defining both the request body and status codes adds an additional layer of type discrimination, enhancing the overall type safety of the communication. However, Superblue encourages users to manage type definitions on their own, promoting flexibility in API design. The design philosophies of TS Rest have greatly inspired Superblue’s approach, highlighting the need for robust type-safe communication solutions in modern development.

### Others?

There are certainly more libraries out there, in other programming languages as well that have been forgotten here, but these represents the main inspiration source for building Superblue.