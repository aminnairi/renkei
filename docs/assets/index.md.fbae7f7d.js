import{_ as e,c as a,o as i,a as r}from"./app.ddbf6e84.js";const m=JSON.parse('{"title":"Home","description":"","frontmatter":{"title":"Home"},"headers":[{"level":2,"title":"\u{1F914} What is Renkei?","slug":"\u{1F914}-what-is-renkei","link":"#\u{1F914}-what-is-renkei","children":[]},{"level":2,"title":"\u2728 Features","slug":"\u2728-features","link":"#\u2728-features","children":[{"level":3,"title":"\u{1F4C8} Scalability","slug":"\u{1F4C8}-scalability","link":"#\u{1F4C8}-scalability","children":[]},{"level":3,"title":"\u{1F6E1}\uFE0F Type-safety","slug":"\u{1F6E1}\uFE0F-type-safety","link":"#\u{1F6E1}\uFE0F-type-safety","children":[]},{"level":3,"title":"\u{1F41E} Error handling","slug":"\u{1F41E}-error-handling","link":"#\u{1F41E}-error-handling","children":[]},{"level":3,"title":"\u2699\uFE0F Platform agnosticism","slug":"\u2699\uFE0F-platform-agnosticism","link":"#\u2699\uFE0F-platform-agnosticism","children":[]}]}],"relativePath":"index.md","lastUpdated":1730664411000}'),t={name:"index.md"},n=r('<h1 id="\u{1F91D}-renkei" tabindex="-1">\u{1F91D} Renkei <a class="header-anchor" href="#\u{1F91D}-renkei" aria-hidden="true">#</a></h1><p>Effortless type-safe communication between client and server</p><h2 id="\u{1F914}-what-is-renkei" tabindex="-1">\u{1F914} What is Renkei? <a class="header-anchor" href="#\u{1F914}-what-is-renkei" aria-hidden="true">#</a></h2><p>Renkei comes from the japanese word \u9023\u643A, which translates to coordination, collaboration.</p><p>This library allows you to create a client &amp; server bridge using TypeScript, so that you can reliably exchange informations in a seamless way that enables you to confidently update code from one of those part, without having the fear of forgetting something thanks to the type-safety offered by this library.</p><h2 id="\u2728-features" tabindex="-1">\u2728 Features <a class="header-anchor" href="#\u2728-features" aria-hidden="true">#</a></h2><h3 id="\u{1F4C8}-scalability" tabindex="-1">\u{1F4C8} Scalability <a class="header-anchor" href="#\u{1F4C8}-scalability" aria-hidden="true">#</a></h3><p>Traditional HTTP protocols are simple and universal, but they present challenges for building complex, scalable systems. In a microservices or multi-service architecture, the typical HTTP approach has several limitations:</p><ul><li><strong>Route Complexity and Schema Management</strong>: In modern applications, each route has specific validation requirements. The HTTP protocol lacks a standard way to describe or validate these schemas, making scalability challenging.</li><li><strong>Error and Status Handling</strong>: HTTP error handling can become inconsistent or imprecise, especially in environments with numerous dependencies and potential error sources.</li><li><strong>Consistency and Code Reuse</strong>: As applications grow, maintaining consistent handling of routes, schemas, and error structures across multiple services becomes harder. Repeated configuration in each service leads to duplicated code and increases the risk of inconsistency.</li></ul><p><code>superblue</code> enhances the HTTP protocol by enabling you to directly write functions that can be called directly from the client. Internally, it uses the HTTP protocol in a way that enables you to write your code as a function rather than as an HTTP request, just like you would for any other function.</p><h3 id="\u{1F6E1}\uFE0F-type-safety" tabindex="-1">\u{1F6E1}\uFE0F Type-safety <a class="header-anchor" href="#\u{1F6E1}\uFE0F-type-safety" aria-hidden="true">#</a></h3><p>JavaScript offers flexibility but lacks typing guarantees, making large-scale projects more challenging to maintain:</p><ul><li><strong>Dynamic Typing</strong>: JavaScript\u2019s dynamic typing can lead to runtime errors that are hard to diagnose, making code less reliable and more expensive to maintain.</li><li><strong>Manual Validation</strong>: Without static typing, request and response payloads require complex, manual validation, adding bug-prone code to each route.</li><li><strong>Repetitive Code</strong>: Handling requests and responses in a classic JavaScript system involves duplicative code that increases technical debt and reduces code readability.</li></ul><p><code>superblue</code> validates each and every one of your requests, from and to the server &amp; clietn, ensuring each request and response adheres to defined schemas. This approach reduces errors, clarifies route contracts, and improves maintainability.</p><h3 id="\u{1F41E}-error-handling" tabindex="-1">\u{1F41E} Error handling <a class="header-anchor" href="#\u{1F41E}-error-handling" aria-hidden="true">#</a></h3><p>Error handling is a complex aspect of modern application development, with unique challenges on both server and client sides:</p><ul><li><strong>Standardized Error Structures</strong>: Without a unified structure, errors across services are inconsistent, making it difficult for clients to interpret and handle them accurately.</li><li><strong>Centralized Control</strong>: Configuring access controls and error handling in each service individually adds maintenance overhead and increases security risks. superblue allows centralized configuration of error handling, reducing redundancy and improving error clarity.</li><li><strong>Detailed Error Messages for Clients</strong>: Client applications, such as mobile and web apps, need structured, predictable error responses to provide feedback to users and make intelligent retry or fallback decisions.</li><li><strong>Improved Security with Controlled Responses</strong>: Detailed error messages must be managed carefully to avoid revealing sensitive information. With <code>superblue</code>, error responses can be configured to balance user feedback and security, ensuring that only necessary information is shared while maintaining safe practices.</li></ul><p>With <code>superblue</code>, error handling becomes more manageable, consistent, and secure across both server and client applications. Centralized error structures reduce duplication and provide a more predictable experience for clients, while controlled error responses enhance security.</p><h3 id="\u2699\uFE0F-platform-agnosticism" tabindex="-1">\u2699\uFE0F Platform agnosticism <a class="header-anchor" href="#\u2699\uFE0F-platform-agnosticism" aria-hidden="true">#</a></h3><p>Supporting a wide range of platforms and environments is essential in modern API development, and <code>superblue</code> achieves this with an agnostic approach that benefits both server and client:</p><ul><li><strong>Abstracted Interfaces for Flexibility</strong>: Rather than relying on specific frameworks or environments, <code>superblue</code> uses abstract interfaces, ensuring that core functionalities remain compatible across platforms and libraries.</li><li><strong>Plug-and-Play Adapters for Popular Environments</strong>: With adapters like <code>@superblue/fetch</code> and <code>@superblue/node</code>, <code>superblue</code> integrates easily with commonly used libraries. Developers can add these adapters as needed, enabling seamless setup for diverse environments.</li><li><strong>No Vendor Lock-In</strong>: By remaining independent of particular frameworks, <code>superblue</code> allows teams to switch or combine libraries and runtimes without modifying API logic. This is ideal for applications that evolve or require varied deployment models.</li><li><strong>Future-Proof and Extensible Design</strong>: <code>superblue</code>&#39;s roadmap includes more adapters and extensions, ensuring compatibility with upcoming platforms and new architecture patterns, providing developers with a long-term, adaptable API solution.</li></ul><p>With <code>superblue</code>, teams gain a robust, platform-agnostic framework that reduces dependencies and enhances flexibility, making it ideal for projects that need to adapt to changing technologies or scale across different environments.</p>',22),s=[n];function o(l,c,d,h,u,p){return i(),a("div",null,s)}const f=e(t,[["render",o]]);export{m as __pageData,f as default};
