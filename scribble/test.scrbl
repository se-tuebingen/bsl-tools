#lang scribble/manual
@(require "bsl_tree.rkt")
@; @(require scribble/eval)
@title[#:version ""]{Questionnaire test manual}
@author["Linus Szillat"]

In this manual we cover the functionality of BSL-Tools.
@table-of-contents[]

@section{BSL-Syntax-Tree}
Here is the Show Feature for the Abstract Syntax Tree.

@bsl-tree[
"((define me 2)(define two 3)(+ me two))"
]
