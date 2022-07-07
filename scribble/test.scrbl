#lang scribble/manual
@(require "bsl_tools.rkt")
@; @(require scribble/eval)
@title[#:version ""]{Abstract Syntax Tree}
@author["Linus Szillat"]

In this manual we cover the functionality of BSL-Tools.
@table-of-contents[]

Here are some tests for the Show Feature of the Abstract Syntax Tree.

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

@jsontree[#:quiz #t #:lang "de"]{
  {
    "production": "Addition",
    "code": "|(2 - 3)| + |4|",
    "holes": [
      {
        "production": "Subtraction",
        "code": "(|2| - |3|)",
        "holes": [
          {
            "production": "Number",
            "code": "2"
          },
          {
            "production": "Number",
            "code": "3"
          }
        ]
      },
      {
        "production": "Number",
        "code": "4"
      }
    ]
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
