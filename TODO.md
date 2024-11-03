# Todo

- Add a workflow to build the packages
- Add a audit routine in the workflow created above for all packages
- Publish the library
- Add a docker compose infrastructure

## @superblue/core

- Add a custom error for when the network is down
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
- Add security headers configuration
- Make the cors checking stricter
- Add the ability to rate limit the requests
- Add a static file server

## @example/node

- Add Drizzle ORM
- Add an SQLite database

## @example/react

- Separate the `getUsers` logic from the `createUser` logic and the `userCreated` logic