# split, step & plug


## split
Split consumes the Abstract Syntax Tree and returns __Redex__ and __Context__.
:: AST-Expression -> Redex, Context

An expression splits up to a context and a redex like a binary tree.

For example: ``(+ 2 (* 4 3))``splits up to context: ``(+ 2 Hole()))`` and redex: ``(* 4 3)``.

### Scala Source

``` scala
  /** Returns Redex as Split or Value */
  def searchRedex(env: Env, e: Exp): SplitResult = e match {
        case Add(l, r) =>
          (searchRedex(env, l), searchRedex(env, r)) match
            case (Value(x), Value(y)) => Split(AddRedex(x, y), Hole())
            case (Value(x), Split(y, z)) => Split(y, AddR(x, z))
            case (Split(x, y), Value(z)) => Split(x, AddL(y, z))
            case (Split(x, y), Split(p, q)) => Split(x, AddL(y, r))
        case Mul(l, r) =>
          (searchRedex(env, l), searchRedex(env, r)) match
            case (Value(x), Value(y)) => Split(MulRedex(x, y), Hole())
            case (Value(x), Split(y, z)) => Split(y, MulR(x, z))
            case (Split(x, y), Value(z)) => Split(x, MulL(y, z))
            case (Split(x, y), Split(p, q)) => Split(x, MulL(y, r))
        case Cond(l) =>
          searchRedex(env, l.head._1) match
            case Value(x) => Split(CondRedex(x, l.head._2, l.tail), Hole())
            case Split(x, y) => Split(x, CondContext(y, l.head._2, l.tail))
        case Lit(l) => Value(Lit(l))
        case Id(i) => Split(ConstRedex(i, env), Hole())
        case True() => Value(True())
        case False() => Value(False())
      }
  ```





## step

Step consumes a Redex and reduces the expression (to a value f.e.).

:: Redex -> RuleApplication -> (Redex, Rule)

## plug

Plug consumes RuleApplication and Context and returns Context, Rule, Explanation.

:: RuleApplication, Context -> Context, Rule, Explanation

# Goal

Writing first a functional small-step interpreter specifically for KONG + PRIM and addition only, which should work with the following example:

```
(+ 2 (+ 3 4)) // should evaluate to 9
```

# Data Structures

We need following structures:
- AST (already exists)
- REDEX
- CONTEXT
- SPLIT

  
# Documentation

The BSL-Small-Step-Interpreter uses the custom tag ``<stepper>`` to mark the expression for Small-Step-Interpreter use.
The expression first get parsed by the ts-pegjs Parser.

Expression ``(+ 2 (+ 4 6))`` parsed to:

```ts

{
  "type": "Function Call",
  "name": {
    "type": "Symbol",
    "symbol": "+"
  },
  "args": [
    {
      "type": "Literal Value",
      "value": 2
    },
    {
      "type": "Function Call",
      "name": {
        "type": "Symbol",
        "symbol": "+"
      },
      "args": [
        {
          "type": "Literal Value",
          "value": 4
        },
        {
          "type": "Literal Value",
          "value": 6
        }
      ]
    }
  ]
}

```

Split object:

```ts
{
  "redex": {
    "type": "Redex",
    "name": {
      "type": "Symbol",
      "symbol": "+"
    },
    "args": [
      {
        "type": "Literal Value",
        "value": 4
      },
      {
        "type": "Literal Value",
        "value": 6
      }
    ]
  },
  "context": {
    "type": "Context",
    "name": {
      "type": "Symbol",
      "symbol": "+"
    },
    "args": [
      {
        "type": "Literal Value",
        "value": 2
      },
      {}
    ]
  }
}
```