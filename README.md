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

## ToDos

[] Abstract Syntax Tree als Datentyp in TypeScript beschreiben
[] Show Tree Structure BSL
[] Transform Racket sexpr -> JSON / other datat structure

## Exporting to PDF from Scribble

To also include the HTML graphs rendered by the JavaScript module(s) in a
PDF generated by Scribble, we use the nodejs [puppeteer](https://pptr.dev/)
package. In order for it to work, nodejs needs to be installed via [NodeSource](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions) and not as snap on Linux Systems.

We are planning to do this automatically via racket [`system*`](https://docs.racket-lang.org/reference/subprocess.html#%28def._%28%28lib._racket%2Fsystem..rkt%29._system%2A%29%29)
calls.
