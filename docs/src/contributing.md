## Building the project

For building the project, you need to have CMake or a similar tool that can handle
the `Makefile` installed. For Linux and MacOS, this should already be the case.

You also need to have [NodeJS and NPM](https://nodejs.org) installed.
_On Ubuntu, it is recommended to install it via [NodeSource](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)._

You need to run `npm install` in a newly cloned project and
anytime dependencies might have changed.

Then, you can run:

- `make build` to compile and bundle everything under `src` - grammar, TypeScript
sources and assets - into `dist/bsl_tools.js`. (_Note that the command does not terminate, the TypeScript compiler keeps watching the source for changes._)
- `make test` to compile the Scribble Demo (requires Racket as described below). This also copies the current version of the JavaScript file to the HTML Test files directory (which is not required for them to load the latest version locally, but for distribution e.g. via Github workflow to test on mobile devices).
- `make doc` to compile the documentation under `docs/src` and `docs/demo` to `docs/book` (result is opened in your browser automatically). For the scribble demo to be included, you need to have run `make test` first.

## Dependencies

Install the latest TypeScript version via `npm`. Also see <https://www.typescriptlang.org/download>.

We are using [esbuild](https://esbuild.github.io/getting-started/#build-scripts)
to compile TypeScript and bundle all resources into one single JavaScript file.

For generating a BSL parser, we are using the [`ts-pegjs`](https://github.com/metadevpro/ts-pegjs) package, which builds upon `pegjs`.
This package installs a node script which compiles the grammar found in `src/grammar/bsl.pegjs` to a TypeScript parser module. The best way to test and edit the grammar is the [pegjs online version](https://pegjs.org/online), since it has syntax highlighting and live testing.

In order to generate a NodeJS-independent binary
(effectively, a binary with
NodeJS bundled, so not exactly lightweight) for the fallback build
out of `ts-pegjs`, we are using
the [`pkg`](https://github.com/vercel/pkg) package.

If you want to contribute to the scribble part of `bsl-tools` you need to install Racket first. See <https://download.racket-lang.org/>

You also need to install dependencies for Scribble, the Racket Documentation Tool, preferably with the racket package manager raco. On Linux distributions you can install Scribble with `raco pkg install --deps search-auto scribble-math`.

### Fallback build

In the branch `fallback_build`, there are binaries of `tspegjs`, `esbuild` and
`mdbook` for Mac, Windows and Linux 64bit systems as well as Makefile entries
for using (`fallback_build` and `fallback_doc`) and updating them.
This is to future-proof the toolchain, if updates
break something or a tool is no longer supported.

If the regular build **does**
still work, it might be a good idea to checkout the branch and
run `make update_fallback_build` to keep the binaries up-to-date from time to time.
We split this to a separate branch, however, to make the repo a little bit more
lightweight and spare you unnecessary megabytes of downloads.

## Testing

Running `make test` copies the generated JavaScript file and the latest version
of the Scribble Plugin to the test folders and renders the Scribble test.

In order to be able to render the Scribble test pages, you need to have
[Racket](https://racket-lang.org) installed.

The HTML test pages load the JavaScript plugin from the `dist` folder if opened
locally (served via `file://`), so you do not need to run `make test` to update
it - leaving the `make build` command running works fine.

## Publishing a version

Everytime a [tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging) starting with `v` is published, a github workflow similar to the one running when
something is pushed on main will kick off, compile and test the code.
If the tag has the form `vX.X.X` (3 numbers), the module will be released under
this name, otherwise, the workflow will fail.
