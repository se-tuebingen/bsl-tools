Beginning Student Language (BSL) is a programming language in DrRacket. This repository provides some useful BSL-Tools, such as

- Abstract Syntax Tree
- Stepper (Auswertungskontext)
- BSL "Try out" box (Generator)

and semantical support for other grammars.

The module is distributed as a single JavaScript file and an optional
additional Racket file for use with Scribble.

The documentation and demos are available at <https://se-tuebingen.github.io/bsl-tools/>. [![Compile and Publish Test Pages](https://github.com/se-tuebingen/bsl-tools/actions/workflows/publish.yml/badge.svg)](https://github.com/se-tuebingen/bsl-tools/actions/workflows/publish.yml)

You can download them from [Releases](https://github.com/se-tuebingen/bsl-tools/releases),
the current test build shows the "Development Build" and corresponds to the state
of the main branch, you can download semantic versioned editions.

## BSL Abstract Syntax Tree

Here we provide the grammar of the BSL Core Language from the Info 1 script, which was our motivation to develop these tools.

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
