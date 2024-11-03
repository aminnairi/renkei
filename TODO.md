# Todo

- Add link to contributor covenant
- Add a link to the security policy
- Add some issue templates
- Add a pull requests template
- Add a security policy template
- Add a workflow to build the packages
- Add linting routines in the workflow created above
- Add a audit routine in the workflow created above for all packages
- Publish the library
- Add the correction description for all `README.md` files of `packages`
- Add links to the relevant requirements in all `README.md` files of `packages`
- Create a hard link for the `CONTRIBUTING.md` and `LICENSE` files instead of soft links

## @superblue/core

- Add more rules for eslint
- Run eslint on push
- Add a custom error for when the status code is wrong
- Add a custom error for when the network is down
- Add a custom error for when the request is canceled
- Return error instead of throwing them for both the client & server
- Add an example explaining how to create its own server adapter
- Add an example explaining how to create its own client adapter
- Make the `createServer` function return whatever is the type of the output of the `ServerAdapter` used 
- Add unit tests
- Add badges
- Add documentation about how to create a custom `ServerAdapter`
- Add documentation about how to create a custom `ClientAdapter`
- Add documentation for `createEventRoute`

## @superblue/fetch

- Allow passing options for the `createFetchAdapter` function
- Allow compressing the data if possible
- Show an example of a file upload
- Add integration tests
- Add badges

## @superblue/node

- Account for compressed requests (see above) if possible
- Add an example explaining how to create its own compression strategy
- Add integration tests
- Add badges