# Example AST View

Here you can see a few examples of valid Abstract Syntax Trees in BSL Core Language.
<bsltree>
(cond [e1 #t]
[else (asBool e2)])
</bsltree>

## AST as a quiz

  <bsltree quiz="true">
    (define (f x y) (+ x y))
  </bsltree>

## AST in German

  <bsltree quiz="true" lang="de">
    (define-struct name (firstName lastName))
  </bsltree>

## Build your own grammar!

```json
    "grammar": {
      "<Number>": ["<PositiveNumber>", "-<PositiveNumber>"],
      "<PositiveNumber>": ["<Integer>", "<Decimal>"],
      "<Integer>": ["<DigitNotZero><Digit>*", "0"],
      "<Decimal>": ["<Integer>.<Digit>+"],
      "<DigitNotZero>": ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      "<Digit>": ["0", "<DigitNotZero>"]
    }
```
