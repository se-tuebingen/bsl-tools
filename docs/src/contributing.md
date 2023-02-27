## Building the project

For building the project, you need to have CMake or a similar tool that can handle
the `Makefile` installed. For Linux and MacOS, this should already be the case.

If you only changed something in the TypeScript Source Code or updated the Grammar,
and are on a 64bit Linux, MaxOS or Windows Computer, you can simply run `make fallback_build`,
which depends on binaries.
_Note that the command does not terminate, the TypeScript compiler keeps watching the source for changes._

If you are on another OS or want to change more, or update the fallback binaries,
you need to have [NodeJS](https://nodejs.org) installed.
_On Ubuntu, it is recommended to install it via [NodeSource](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)._

You need to run `npm install` anytime dependencies might have changed.

Then, you can run

- `make build` to compile grammar and TypeScript Sources (_Note that the command does not terminate, the TypeScript compiler keeps watching the source for changes._)
- `make update_fallback_build` to update the committed fallback binaries

## Dependencies

Install the latest TypeScript version via `npm`. Also see <https://www.typescriptlang.org/download>.

We are using [esbuild](https://esbuild.github.io/getting-started/#build-scripts)
to compile TypeScript and bundle all resources into one single JavaScript file.

For generating a BSL parser, we are using the [`ts-pegjs`](https://github.com/metadevpro/ts-pegjs) package, which builds upon `pegjs`.
This package installs a node script which compiles the grammar found in `src/grammar/bsl.pegjs` to a TypeScript parser module. The best way to test and edit the grammar is the [pegjs online version](https://pegjs.org/online), since it has syntax highlighting and live testing.

In order to generate a NodeJS-independent binary (effectively, a binary with
NodeJS bundled, so not exactly lightweight) out of `ts-pegjs`, we are using
the [`pkg`](https://github.com/vercel/pkg) package.

If you want to contribute to the scribble part of `bsl-tools` you need to install Racket first. See <https://download.racket-lang.org/>

You also need to install dependencies for Scribble, the Racket Documentation Tool, preferably with the racket package manager raco. On Linux distributions you can install Scribble with `raco pkg install --deps search-auto scribble-math`.

## Testing

Running `make test` copies the generated JavaScript file and the latest version
of the Scribble Plugin to the test folders and renders the Scribble test.

In order to be able to render the Scribble test pages, you need to have
[Racket](https://racket-lang.org) installed.

The HTML test pages load the JavaScript plugin from the `dist` folder if opened
locally (served via `file://`).

## Publishing a version

Everytime a [tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging) starting with `v` is published, a github workflow similar to the one running when
something is pushed on main will kick off, compile and test the code.
If the tag has the form `vX.X.X` (3 numbers), the module will be released under
this name, otherwise, the workflow will fail.
