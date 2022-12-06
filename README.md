# BSL Tools

Beginning Student Language is a programming language in DrRacket. This repository provides some useful BSL-Tools, such as
- Abstract Syntax Tree
- Stepper (Auswertungskontext)
- BSL "Try out" box (Interpreter)

The current test build can be seen at <https://se-tuebingen.github.io/bsl-tools/>. [![Compile and Publish Test Pages](https://github.com/se-tuebingen/bsl-tools/actions/workflows/publish.yml/badge.svg)](https://github.com/se-tuebingen/bsl-tools/actions/workflows/publish.yml)

The module is distributed as a single JavaScript file and an optional
additional Racket file for use with Scribble.
You can download them from [Releases](https://github.com/se-tuebingen/bsl-tools/releases),
the current test build shows the "Development Build" and corresponds to the state
of the main branch, we also try to provide semantic versioned editions.

## How to use: HTML

Currently, the collapsible AST tree view and the BSL-Stepper are implemented.
To use the tools, you need to add the script anywhere in your document as
follows:
```html
<!-- import the bsl_tools script somewhere on the page, ideally in the head -->
<script src="bsl_tools.js"></script>
```
Note that if you add one or more of the following tools to your page, the script
will add stylesheets to the `<head>` of your document which set styles for the
`.stepper` and `.tree` classes.
_We are working on better scoping those styles to prevent clashes with classes with the same name elsewhere in the document._

**`<` and `>` need to be replaced with `&lt;` and `&gt;` in order to not break your HTML!**

### AST tree view

The collapsible AST tree view has an
optional "quiz" mode that starts the tree collapsed and expands if you select
the correct production and mark all subexpressions ('holes').

It can be used with BSL code, which will be parsed for you,
or you can provide your own JSON structure.

The interface is as follows:
```html
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

### Stepper

The stepper accepts valid BSL programs. It precomputes the evaluation steps
and allows users to step through the evaluation of each expression until the
program is finished.

The interface is as follows:
```html
<stepper>
  (valid bsl syntax)
</stepper>

<!-- for displaying user text in german, do -->
<stepper lang="de">
  (valid bsl syntax)
</stepper>
```

## How to use: Scribble

To use the scribble module, you need to import it in your document:
```racket
@(require "bsl_tools.rkt")
```
The scribble module does only very little input sanitation and mostly just adds
the JavaScript-Module to your rendered HTML as well as wrapping the input in
the correct custom HTML tags. Both files (`bsl_tools.rkt` AND `bsl_tools.js`)
need to be in the same folder as your scribble file so that everything works.

### AST Tree View

For the collapsible AST Production Trees, the interface in Scribble is as follows:

- For BSL Expressions, we use Rackets Syntax Objects, which have a similar structure as S-Expressions
- For other Expressions, you need to provide a JSON object with the correct structure, which will _not_ be checked at compile-time!


```racket
@bsltree[
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

### Stepper

The stepper accepts valid BSL programs. It precomputes the evaluation steps
and allows users to step through the evaluation of each expression until the
program is finished.

Like with the tree view module, programs are entered as Racket Syntax Objects.

```racket
@stepper[
  #'((* (+ 1 2 (- 3 9 12) (/ 200 4 5)) (/ 1 2 3) 2)
  (cond [(>= 5 5) "isThree"]
  [#false 3]
  [(or #true #false) (* 2 3 4)]))
]

; or for German, do
@stepper[ #:lang "de"
  #'((* (+ 1 2 (- 3 9 12) (/ 200 4 5)) (/ 1 2 3) 2)
  (cond [(>= 5 5) "isThree"]
  [#false 3]
  [(or #true #false) (* 2 3 4)]))
]
```


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

You need to run `npm install` anytime dependencies might have changed.

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

### Publishing a version

Everytime a [tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging) starting with `v` is published, a github workflow similar to the one running when
something is pushed on main will kick off, compile and test the code.
If the tag has the form `vX.X.X` (3 numbers), the module will be released under
this name, otherwise, the workflow will fail.
