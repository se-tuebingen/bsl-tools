# BSL Tools

Beginning Student Language is a programming language in DrRacket. This repository provides some useful BSL-Tools, such as
- Abstract Syntax Tree
- Stepper (Auswertungskontext)
- BSL "Try out" box (Interpreter)

The current test build can be seen at <https://se-tuebingen.github.io/bsl-tools/>. [![Compile and Publish Test Pages](https://github.com/se-tuebingen/bsl-tools/actions/workflows/publish.yml/badge.svg)](https://github.com/se-tuebingen/bsl-tools/actions/workflows/publish.yml)

## How to use: HTML

Currently, the only implemented module is the collapsible AST tree view, with an
optional "quiz" mode that starts the tree collapsed and expands if you select
the correct production and mark all subexpressions ('holes').

The interface is as follows:
```html
<!-- import the bsl_tools script somewhere on the page, ideally in the head -->
<script src="bsl_tools.js"></script>

<!-- anywhere else in the document -->
<bsltree>
  (valid bsl syntax)
</bsltree>

<!-- if you want to display it in quiz mode, do -->
<bsltree quiz="true">
  (valid bsl syntax)
</bsltree>
```
Anything inside the `<bsltree>` tag is parsed according to the  BSL Core Language as documented below.

## How to use: Scribble

For the implemented scribble module we use Rackets Syntax Objects, which have a similar structure as S-Expressions.
The interface in scribble is as follows:

```racket
(require bsl_tools.rkt)

@bsl-tree [ #:quiz #t @; optional keyword argument, default is #f
  #'((valid bsl syntax))
]
```

It is necessary to wrap the BSL-Syntax with a ``#'()``, especially when there are multiple `<def-or-expr>`,
however literal values, such as ``2`` don't need to be wrapped.
The Scribble module parses the BSL-Syntax to a string in a ``<bsltree>`` and adds the javascript module as dependency.
If you set the optional keyword argument `#:quiz` to `#t`, it will add `quiz="true"`.

## BSL Abstract Syntax Tree

BSL Core Language from the Info 1 script:

```
<program>     ::=    <def-or-expr>*
<def-or-expr> ::=    <definition> | <e>
<definition>  ::=    ( define ( <name> <name>+ ) <e> )
               |     ( define <name> <e> )
               |     ( define-struct <name> ( <name>* ) )
<e>           ::=    ( <name> <e>*)
               |     ( cond {[<e>,<e>]}+)
               |     <name>
               |     <v>
```

For reference see also the [Racket webpage for BSL](https://docs.racket-lang.org/htdp-langs/beginner.html)
and the [Info 1 script at 8.3](https://ps-tuebingen.github.io/informatik-1-skript/bsl-semantics.html)

## Development Setup

### Building from Source

We are using [esbuild](https://esbuild.github.io/getting-started/#build-scripts) to bundle all TypeScript ressources into one single JavaScript file.

You need to have [NodeJS](nodejs.org) installed, on Ubuntu it is recommended to install it via [NodeSource](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions).

The first time you clone the project, and every time you pull changes that might add new dependencies, you need to run `npm install` in the project.

To compile sources, run `make build` or `npm run build`. Notice that the command does not terminate: esbuild keeps watching your input files and recompiles if you save any changes.

For generating a BSL parser, we are using the [`ts-pegjs`](https://github.com/metadevpro/ts-pegjs) package, which builds upon `pegjs`.
This package installs a node script which compiles the grammar found in `src/grammar/bsl.pegjs` to a TypeScript parser module. The best way to test and edit the grammar is the [pegjs online version](https://pegjs.org/online), since it has syntax highlighting and live testing.

The command to compile the parser is included in the `npm run build` script (see `package.json` for details), but will not automatically be executed on save by esbuild.

### Testing

Running `make test` copies the generated JavaScript file and the latest version of the Scribble Plugin to the test folders and renders the Scribble test.

The HTML test pages load the JavaScript plugin from the `dist` folder if opened locally (served via `file://`).

### Building from Source - Fallback

For the unlikely case that one or more of the node modules are no longer distributed or no longer distributed in a compatible version, the `build_backup` folder contains a more or less current version of them.

- The `ts-pegjs`-module which generates the parser distributes JavaScript code and therefore requires node to be installed. The required node version is saved in `build_backup/node_version.txt`.
- `esbuild` is a binary distribution. The backup contains the binary for Linux(64bit), which has been tested with Ubuntu 20.04. The current OS and architecture are saved in `build_backup/os.txt` and `arch.txt` respectively.

To prevent changes on other platforms to update to e.g. Windows or Mac versions of these binaries, they need to be copied manually via `make update_build_fallback`.
If your commit contains changes to `arch.txt` or `os.txt`, better double check if you accidentally replaced the Linux binaries.

- Use `make fallback_build_parser` to generate the parser typescript module from the pegjs grammar
- Use `make fallback_build_ts` to compile and bundle the typescript and css sources into one JavaScript module


# Meeting 19.05.22

- Parser in JS/TS bauen
- Scribble Plugin bauen für ("string" / sexpr -> Tree)


## Nice to have
- PNG Vollbild von Tree für PDF



# Meeting 09.06.

- Vergleich zu Vorlesung theorethische Informatik bei der Darstellung von Auswertungsbäumen
- Small-Step-Interpreter nach Vorbild von der einen Bachelorarbeit
- (done in front-end) BSL-Grammatik ``&lt; &gt;`` escapen
- (mvp steht) Zwei Ansätze zu Darstellung des AST (Programmiernah / Skriptnah (Grammatiksyntaxnah))
- (done) backup skript für node_modules im Fall der Fälle

## todos tree

- Deutsch/Englisch (i18n)
- Darstellung Skriptnah
- Idee: Game-Like stats in Quiz Mode
