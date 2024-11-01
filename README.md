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

### ts-rest, gRPC, GraphQL, Hono, ...

Well, I don't think about any other libraries in particular.

GraphQL is in its own league, and has a totally different use case to cover.

gRPC also is in its own category, although it is the closest to both superblue and tRPC, it works with way more programming language, and is not supported by the HTTP protocol, so it is reserved for server-to-server communications, often a popular choice when in a microservice architecture.

Hono does support RPC, and has both a server and client library for seamless communication between the two. Although the type safety is not yet at the level of superblue or tRPC when it comes to receiving data, it is still an interesting thing to see that a framework as popular and complete as Hono is doing a similar job, and I hope to see more from them in the future!

TS Rest is maybe the closest form of a library that we could find if we compare it to superblue. It enabled you to write a contract, that you have to fulfill both on the client and the server, and even has the concept of adapters. One key difference is that it lets you define both the body and the status code that are used to discriminate the type that you get in the end. We believe that this should be something that the user should do himself, but this is an interesting way of seeing the communication and has been a great source of inspiration for this library.

I think that's it, I may not have explored the entire world of type-safe communication, but this is a very interesting topic and I hope to see more library out there working on the subject!