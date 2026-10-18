## Description



## Project setup

```bash
$ npm install
$ cp .env.example .env
```
Then fill out .env

You can run the database container with:
```bash
$ docker compose up -d
```

```bash
$ npm run migration:run
```
## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
