#lang racket/base
(require racket/contract)
(require racket/list)
(require scribble/core
         scribble/html-properties
         (only-in xml cdata))
(require scribble/latex-properties)
(require scribble/base)

; 
; <bsl-tree>
; (expression-or-def)
; (expression-or-def)
; (expression-or-def)
;<\bsl-tree>


; BSL-Tree data definitions

(define bsl-tree (
  flat-rec-contract tree-of()
))
; Value types
(define v (or/c boolean? string? number? '()))

; name is a keyword
(define name (or/c string?))

; Expr is call or cond or name or v
;(define expr (or/c call cond name v))

(define expr (flat-rec-contract expr (or/c call cond name v)))


; clause is a pair of expr
(define clause (cons/c expr expr))

; Cond: List of clauses
(define cond (listof clause))

; call is a name and list of expr
(define call (cons/c name (listof (or/c call cond name v))))

; funDef is a name a list of names and a expr
(define funDef (cons/c name (cons/c (listof name) expr)))

; constDef is a name and a expr
(define constDef (cons/c name expr))

; structDef is a name and a list of names
(define structDef (cons/c name (listof name)))

; definition is either a funDef or constDef or structDef
(define definition (or/c funDef constDef structDef))

;defOrExpr
(define defOrExpr (or/c definition expr))

; program type
(define program (listof defOrExpr))



; Example program
;
(program (list (definition (funDef (cons (name "f") (list (name "x")) (expr (name ("x"))))))
                ))