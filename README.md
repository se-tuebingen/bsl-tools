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

It can be used with BSL code, which will be parsed for you,
or you can provide your own JSON structure.

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

<!-- for displaying user text in german, do -->
<bsltree quiz="true" lang="de">
  (valid bsl syntax)
</bsltree>

<!-- displaying code trees for stuff that is not BSL -->
<jsontree quiz="true" lang="de"><!-- same options as for bsltree -->
  {
    "production": "Subtraction",
    "code": "(|2| - |3|)",
    "holes": [
      { "production": "Number", "code": "2"},
      { "production": "Number", "code": "3"}
    ]
  }
</jsontree>
```
Anything inside the `<bsltree>` tag is parsed according to the  BSL Core Language as documented below.

If you use `<jsontree>`, you need to provide valid JSON - so use double quotes (`"`)!
`"code"` always needs to be a string, mark holes (code of children) by putting `|`s
around it. If you want to, you can provide your own grammar in the `"grammar"` field
of the root node, like this:
```
...
"grammar": {
  "production name": ["rule 1", "rule 2"],
  ...,
  "terminal symbol": [],
  ...
}
...
```
Note that the object keys need to match exactly the productions you use in your
nodes. The Rules are shown as tooltips on hover, and the keys are used as
options in quiz mode. If no grammar is specified, quiz mode options are inferred
from all occurring productions.

The `lang` attribute is only applicable for Quiz mode, since the regular tree does not display any text in natural language. Currently implemented codes are `en`(English, default) and `de`(German).

## How to use: Scribble

For the collapsible AST Production Trees, the interface in Scribble is as follows:

- For BSL Expressions, we use Rackets Syntax Objects, which have a similar structure as S-Expressions
- For other Expressions, you need to provide a JSON object with the correct structure, which will _not_ be checked at compile-time!


```racket
(require bsl_tools.rkt)

@bsl-tree [
  #:quiz #t   @; optional keyword argument, default is #f
  #:lang "de" @; optional keyword argument, default is "en"
  #'((valid bsl syntax))
]

@jsontree[
  #:quiz #t   @; optional keyword argument, default is #f
  #:lang "de" @; optional keyword argument, default is "en"
]{
  {
    "production": "Subtraction",
    "code": "(|2| - |3|)",
    "holes": [
      { "production": "Number", "code": "2"},
      { "production": "Number", "code": "3"}
    ]
  }
}
```

It is necessary to wrap the BSL-Syntax with a ``#'()``, especially when there are multiple `<def-or-expr>`,
however literal values, such as ``2`` don't need to be wrapped.
The Scribble module parses the BSL-Syntax to a string in a ``<bsltree>`` and adds the javascript module as dependency.

The JSON structure for non-BSL-Syntax needs to contain

- a `"production"` name (string)
- some `"code"` (string) optionally with holes fenced by `|`
- optionally under `"holes"` a list of children with the same structure
- optionally the root node can contain a custom `"grammar"` as described in the html API above

If you set the optional keyword argument `#:quiz` to `#t`, it will add `quiz="true"` which displays the tree in quiz mode.

Similarly, the `#:lang` keyword argument can be used to set the language code. This is only applicable for Quiz mode, since the regular tree does not display any text in natural language. Currently implemented codes are `en`(English, default) and `de`(German).

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

### Building the project

For building the project, you need to have CMake or a similar tool that can handle
the `Makefile` installed. For Linux and MacOS, this should already be the case.

If you only changed something in the TypeScript Source Code or updated the Grammar,
and are on a 64bit Linux, MaxOS or Windows Computer, you can simply run `make fallback_build`,
which depends on binaries.
_Note that the command does not terminate, the TypeScript compiler keeps watching the source for changes._

If you are on another OS or want to change more, or update the fallback binaries,
you need to have [NodeJS](nodejs.org) installed.
_On Ubuntu, it is recommended to install it via [NodeSource](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)._

Since the `package.json` contains packages for different architectures in order to
be able to update the `fallback_build`-binaries, you need to run `npm install` with
the `--force` option. You need to run `npm install` anytime dependencies might have changed.

Then, you can run
- `make build` to compile grammar and TypeScript Sources (_Note that the command does not terminate, the TypeScript compiler keeps watching the source for changes._)
- `make update_fallback_build` to update the committed fallback binaries

### Dependencies

We are using [esbuild](https://esbuild.github.io/getting-started/#build-scripts)
to compile TypeScript and bundle all resources into one single JavaScript file.

For generating a BSL parser, we are using the [`ts-pegjs`](https://github.com/metadevpro/ts-pegjs) package, which builds upon `pegjs`.
This package installs a node script which compiles the grammar found in `src/grammar/bsl.pegjs` to a TypeScript parser module. The best way to test and edit the grammar is the [pegjs online version](https://pegjs.org/online), since it has syntax highlighting and live testing.

In order to generate a NodeJS-independent binary (effectively, a binary with
NodeJS bundled, so not exactly lightweight) out of `ts-pegjs`, we are using
the [`pkg`](https://github.com/vercel/pkg) package.

### Testing

Running `make test` copies the generated JavaScript file and the latest version
of the Scribble Plugin to the test folders and renders the Scribble test.

In order to be able to render the Scribble test pages, you need to have
[Racket](https://racket-lang.org) installed.

The HTML test pages load the JavaScript plugin from the `dist` folder if opened
locally (served via `file://`).

# Meeting Notes
## Meeting 19.05.22

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

- Darstellung Skriptnah
- Idee: Game-Like stats in Quiz Mode
