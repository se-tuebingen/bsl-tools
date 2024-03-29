#lang scribble/manual
@(require "bsl_tools.rkt")
@(require scribble/bnf)
@(require scribble/eval)
@(require scribble/core)
@title[#:version ""]{Abstract Syntax Tree}
@author["Linus Szillat"]

In this manual we cover the functionality of BSL-Tools.
@table-of-contents[]

Here are some tests for the Show Feature of the Abstract Syntax Tree, as well as
for the BSL Stepper.

@section{BSL Tree Tests}

@subsection{Constant Definition}

@bsltree[
    #'((define one 2)
 (define two 3)
 (+ one two))
]

@subsection{Struct Definition}

@bsltree[
#'((define-struct pool (people fish water))(make-pool 2 1 "a lot"))
]

@subsection{Function Definition}

@bsltree[
#'((define (swim-with-the-fish pool)
(string-append "Cool pool with a number of:" (number-string (pool-fish pool)))))
]

@subsection{Conditional Expression}
@bsltree[
#'((cond
[(< 1 0) "Chocolate is the best"]
[(< 0 0) "But Ice Cream is way better!"]
[(> 1000 200) "Still Pizza's the best!!!"]
[else #false]
))
]

@subsection{Function Call Expression}
@bsltree[
#'((swim-with-the-fish (make-pool 2 20 "a little less than much, but still much")))
]

@subsection{List Expression}
@bsltree[
#'((list 1 2 3 4 5))
]

@subsection{Name Expression}
@bsltree[
'just-a-normal-name
]

@subsection{Value Expressions}

@bsltree[
#true
]

@bsltree[
42
]

@bsltree[
"Hallo Welt"
]

@bsltree[
'()
]

@section{BSL-Error-Tests}

@subsection{Parsing Error}

@bsltree[
#'((define f (y x) (+ y x)))
]

@section{Quiz-Mode}

@subsection{Quiz Mode}

@bsltree[ #:quiz #t
#'((define (f x y) (+ x y))
(cond [(= x 3) "isThree"] [#false '()])
(define x 42)
(define-struct name (firstName lastName)))
]

@section{Internationalization}

Internationalization currently only applies to quiz mode, since the regular tree does not contain any natural language elements.

@subsection{German}

@bsltree[ #:quiz #t #:lang "de"
#'((define (f x y) (< x "42")))
]

@section{JSON-Tree Tests}

@jsontree[#:quiz #t #:lang "de" #:extrastyle ".bsl-tools-tree span { margin-left: 2em; margin-right: 2em;}"]{
  {
    "grammar": {
      "<Expression>": ["<Addition>", "<Subtraction>", "<Number>"],
      "<Subexpression>": ["(<Addition>)", "(<Subtraction>)"],
      "<Addition>": ["<Subexpression> + <Subexpression>",
                   "<Number> + <Subexpression>",
                   "<Subexpression> + <Number>",
                   "<Number> + <Number>"],
      "<Subtraction>": ["<Subexpression> - <Subexpression>",
                      "<Number> - <Subexpression>",
                      "<Subexpression> - <Number>",
                      "<Number> - <Number>"],
      "<Number>": []
    },
    "production": "<Expression>",
    "code": "|(2 - 3) + 4|",
    "holes": [{
      "production": "<Addition>",
      "code": "|(2 - 3)| + |4|",
      "holes": [
        {
          "production": "<Subexpression>",
          "code": "(|2 - 3|)",
          "holes": [{
            "production": "<Subtraction>",
            "code": "|2| - |3|",
            "holes": [
              {
                "production": "<Number>",
                "code": "2"
              },
              {
                "production": "<Number>",
                "code": "3"
              }
            ]
          }]
        },
        {
          "production": "<Number>",
          "code": "4"
        }
      ]
    }]
  }
}

Errors in JSON will not be caught by Scribble!
@jsontree[]{
  {
    "production": "Subtraction",
    "code": "(|2| - |3|)",
    "holes": [
      {
        "production": "Number",
        "code": "2"
      }
    ]
  }
}

@section{Stepper Tests}

@subsection{English}

Here is some example text - this way, we can compare how the font sizes match
or do not match. A longer paragraph should give a better impression of how text
looks like.

I even threw in an extra paragraph, that's how generous I am!

@stepper[
#'((* (+ 1 2 (- 3 9 12) (/ 200 4 5)) (/ 1 2 3) 2)
(cond [(>= 5 5) "isThree"]
[#false 3]
[(or #true #false) (* 2 3 4)])
(cond
  [(cond
  [(and #false #true) #false]
  [#false 3]
  [(or #true #false) #false])
  "isThree"]
[#false 3]
[(< 2 3) (* 2 3 4)])
(define x (+ 40 2))
(define y "hallo")
(> 2 4))
]

@subsection{German}

Mit ein bisschen Text über dem Stepper können wir die Schriftgrößen vergleichen
und ein bisschen so tun, als wüssten wir jetzt wie es in einem richtigen Dokument
aussähe.

Hier ist noch ein extra-Absatz!

@stepper[ #:lang "de"
#'((* (+ 1 2 (- 3 9 12) (/ 200 4 5)) (/ 1 2 3) 2)
(cond [(>= 5 5) "isThree"]
[#false 3]
[(or #true #false) (* 2 3 4)])
(cond
  [(cond
  [(and #false #true) #false]
  [#false 3]
  [(or #true #false) #false])
  "isThree"]
[#false 3]
[(< 2 3) (* 2 3 4)])
(define x (+ 40 2))
(define y "hallo")
(> 2 4))
]

@section{Build your own Grammar!}
@subsection{Example of a context free grammar}
Below is an example for a grammar for numbers:
@BNF[
  (list @nonterm{Number}
          @nonterm{PositiveNumber}
          @(make-element #f (list @litchar{-} @nonterm{PositiveNumber})))
  (list @nonterm{PositiveNumber}
          @nonterm{Integer}
          @nonterm{Decimal})
  (list @nonterm{Integer}
          @BNF-seq[@nonterm{DigitNotZero} @kleenestar[@nonterm{Digit}]]
          @litchar{0})
  (list @nonterm{Decimal}
          @BNF-seq[@nonterm{Integer} @litchar{.} @kleeneplus[@nonterm{Digit}]])
  (list @nonterm{DigitNotZero}
        @BNF-alt[@litchar{1} @litchar{2} @litchar{3} @litchar{4} @litchar{5} @litchar{6} @litchar{7} @litchar{8} @litchar{9}])
  (list @nonterm{Digit}
        @BNF-alt[@litchar{0} @nonterm{DigitNotZero}])]
Examples for Strings that fulfill the @nonterm{Number} definition of this grammar are: @litchar{0}, @litchar{420}, @litchar{-87}, @litchar{3.1416}, @litchar{-2.09900}.

Examples for Strings that do not fulfill the @nonterm{Number} definition of this grammar are: @litchar{007}, @litchar{-.65}, @litchar{13.}, @litchar{zwölf}, @litchar{111Nonsense222}.

Here is an example of an AST based on the previous grammar.

@jsontree[
  #:extrastyle "jsontree .bsl-tools-tree span {margin-left: 2.5em; margin-right: 2.5em}"
]{
  {
    "production": "<Number>",
    "code": "-|3,14|",
    "holes": [
      {
        "production": "<PositiveNumber>",
        "code": "|3,14|",
        "holes": [{
          "production": "<Decimal>",
          "code": "|3|,|1||4|",
          "holes": [
            {
              "production": "<Integer>",
              "code": "|3|",
              "holes":[{
                "production": "<DigitNotZero>",
                "code": "3"
                }]
            },
            {
              "production": "<Digit>",
              "code": "|1|",
              "holes":[{
                "production": "<DigitNotZero>",
                "code": "1"
                }]
            },
            {
              "production": "<Digit>",
              "code": "|4|",
              "holes":[{
                "production": "<DigitNotZero>",
                "code": "4"
                }]
            }
          ]
        }]
      }
    ],
    "grammar": {
      "<Number>": ["<PositiveNumber>", "-<PositiveNumber>"],
      "<PositiveNumber>": ["<Integer>", "<Decimal>"],
      "<Integer>": ["<DigitNotZero><Digit>*", "0"],
      "<Decimal>": ["<Integer>.<Digit>+"],
      "<DigitNotZero>": ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      "<Digit>": ["0", "<DigitNotZero>"]
    }
  }
}

@jsontree[
 #:quiz #t
 #:lang "de"
 #:extrastyle "jsontree .bsl-tools-tree span {margin-left: 2.5em; margin-right: 2.5em}"
]{
  {
    "production": "<Number>",
    "code": "|420|",
    "holes": [
      {
        "production": "<PositiveNumber>",
        "code": "|420|",
        "holes": [{
          "production": "<Integer>",
          "code": "|4||2||0|",
          "holes": [
            {
              "production": "<DigitNotZero>",
              "code": "4"
            },
            {
              "production": "<Digit>",
              "code": "|2|",
              "holes": [{
                "production": "<DigitNotZero>",
                "code": "2"
              }]
            },
            {
              "production": "<Digit>",
              "code": "0"
            }
          ]
        }]
      }
    ],
    "grammar": {
      "<Number>": ["<PositiveNumber>", "-<PositiveNumber>"],
      "<PositiveNumber>": ["<Integer>", "<Decimal>"],
      "<Integer>": ["<DigitNotZero><Digit>*", "0"],
      "<Decimal>": ["<Integer>.<Digit>+"],
      "<DigitNotZero>": ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      "<Digit>": ["0", "<DigitNotZero>"]
    }
  }
}
