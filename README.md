# FacetJS

[![Build Status](https://github.com/Facet-MUD-Project/facetjs/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/Facet-MUD-Project/facetjs/actions?query=workflow%3A%22Node.js+CI%22)
[![Codecov](https://img.shields.io/codecov/c/github/Facet-MUD-Project/facetjs)](https://codecov.io/gh/Facet-MUD-Project/facetjs)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/7a57c5f7e6024635aeb40b480edd6018)](https://www.codacy.com/gh/Facet-MUD-Project/facetjs?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Facet-MUD-Project/facetjs&amp;utm_campaign=Badge_Grade)
[![License](https://img.shields.io/github/license/Facet-MUD-Project/facetjs)](https://github.com/Facet-MUD-Project/facetjs/blob/master/LICENSE)

An implementation of the Facet MUD Project in JavaScript.

## Development

To work on this project, you will need NodeJS installed. There is no
specific version required, but it is being built consistently against the
latest available.

With Node installed, all you need to do is run the standard command from
any old NPM project:

```sh
$ npm install
added 401 packages from 914 contributors and audited 402 packages in 4.886s
```

To run tests, you will similarly want to run a standard command:

```sh
$ npm test

> facetjs@0.0.1 test /home/jwilhelm/Documents/workspace/facetmud/facetjs
> nyc mocha

# ... a whole lot of test output here
  54 passing (354ms)
# Code coverage will show here. Be sure this stays high!
>
```

You can also check the code style by running:

```sh
$ npm run lint

> facetjs@0.0.1 lint /home/jwilhelm/Documents/workspace/facetmud/facetjs
> eslint .

$
```

You can generate a full docs site for the code by running:

```sh
$ npm run docs

> facetjs@0.0.1 docs /facetmud/facetjs
> typedoc src/


Using TypeScript 3.9.3 from /facetmud/facetjs/node_modules/typescript/lib
Rendering [========================================] 100%

Documentation generated at /facetmud/facetjs/docs

$
```

## Running a Server

To start up a server, you can run the following:

```sh
$ npm start

> facetjs@0.0.1 start /facetmud/facetjs
> ts-node .

[info] Server started on :::8000
```
