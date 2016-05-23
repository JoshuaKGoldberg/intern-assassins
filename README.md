# Intern Assassins

Microsoft 2016 ISC Intern Assassins. Go wild or go home.

## Project Structure

### Front-end

Under `src/site` is a React-based TypeScript application.
It's served by an `expressjs` server.

### Back-end

Under `src/server` is an `expressjs` server.


## Running

Settings for the server are read from `assassins.json` at startup.
This file contains the server `port` and a list of server `admins`. 

Before running the app, copy `assassins.default.json` to `assassins.json`.
You'll also need to build first.

```shell
node src\main
```


## Build Process

[Gulp](http://gulpjs.com/) is used to automate building, which requires [Node.js](http://node.js.org).

To build from scratch, install Node.js and run the following commands:

```
npm install
gulp
```

### Individual Gulp tasks

* `gulp browserify` - Compresses and converts compiled .js files under `src/site` from the `tsc` task into a browser-compatible bundle.
* `gulp less` - Runes the [Less](http://lesscss.org/) compiler.
* `gulp test` - Runs tests in `tests/` *(currently none)*. 
* `gulp tsc` - Runs the [TypeScript](https://typescriptlang.org/) compiler.
* `gulp tslint` - Runs [TSLint](https://github.com/palantir/tslint).
* `gulp watch` - Runs the appropriate `less` or `tsc`+`tslint` tasks when a source file changes.

