# BSL Tools
Beginning Student Language is a programming language in DrRacket. This repository provides some useful BSL-Tools, such as
- Abstract Syntax Tree
- Stepper (Auswertungskontext)
- BSL "Try out" box (Interpreter)

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

We are using [webpack](https://webpack.js.org/guides/ecma-script-modules/) to bundle all TypeScript ressources into one single JavaScript file.

You need to have [NodeJS](nodejs.org) installed, on Ubuntu it is recommended to install it via [NodeSource](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions).

The first time you clone the project, and everytime you pull changes that might add new dependencies, you need to run `npm install` in the project.

To compile sources, run `npm run build`. Notice that the command does not terminate: Webpack keeps watching your input files and recompiles if you save any changes.

## ToDos

[] Abstract Syntax Tree als Datentyp in TypeScript beschreiben
[] Show Tree Structure BSL
[] Transform Racket sexpr -> JSON / other datat structure

# Meeting 19.05.22

- Parser in JS/TS bauen
- Scribble Plugin bauen für ("string" / sexpr -> Tree)


## Nice to have
- PNG Vollbild von Tree für PDF
