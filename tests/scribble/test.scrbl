#lang scribble/manual
@(require "BSL_AST.rkt")
@; @(require scribble/eval)
@title[#:version ""]{Abstract Syntax Tree}
@author["Linus Szillat"]

In this manual we cover the functionality of BSL-Tools.
@table-of-contents[]

Here are some tests for the Show Feature of the Abstract Syntax Tree.

@section{BSL Tree Tests}

@subsection{Constant Definition}

@bsl-tree[
    #'((define one 2)
 (define two 3)
 (+ one two))
]

@subsection{Struct Definition}

@bsl-tree[
#'((define-struct pool (people fish water))(make-pool 2 1 "a lot"))
]

@subsection{Function Definition}

@bsl-tree[
#'((define (swim-with-the-fish pool) 
(string-append "Cool pool with a number of:" (number-string (pool-fish pool)))))
]

@subsection{Conditional Expression}
@bsl-tree[
#'((cond
[(< 1 0) "Chocolate is the best"]
[(< 0 0) "But Ice Cream is way better!"]
[(> 1000 200) "Still Pizza is the best!!!"]
[else #false]
))
]

@subsection{Function Call Expression}
@bsl-tree[
#'((swim-with-the-fish (make-pool 2 20 "a little less than much, but still much")))
]

@subsection{List Expression}
@bsl-tree[
#'((list 1 2 3 4 5))
]

@subsection{Name Expression}
@bsl-tree[
'just-a-normal-name
]

@subsection{Value Expressions}

@bsl-tree[
#true
]

@bsl-tree[
42
]

@bsl-tree[
"Hallo Welt"
]

@bsl-tree[
'()
]