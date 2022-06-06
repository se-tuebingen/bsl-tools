#lang scribble/manual
@(require "BSL_AST.rkt")
@; @(require scribble/eval)
@title[#:version ""]{Questionnaire test manual}
@author["Linus Szillat"]

In this manual we cover the functionality of BSL-Tools.
@table-of-contents[]

@section{BSL-Syntax-Tree}
Here is the Show Feature for the Abstract Syntax Tree.

A simple bsl-tree example with Constants:

@bsl-ast[
    '((define one 2)
 (define two 3)
 (+ one two))
]

Now with Structs:
@bsl-ast[
'((define-struct pool (people fish water))(make-pool (2 1 "a lot")))
]