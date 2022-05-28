#lang racket/base
(require racket/contract)
(require racket/list)
(require scribble/core
         scribble/html-properties
         (only-in xml cdata))
(require scribble/latex-properties)
(require scribble/base)

; sexpr->HTML
;
;HTML-STRUCTURE
; DEPRECATED
; <bsl-tree>
; <ul>              (
;   <op></op>        +
;   <li></li>        a
;   <li></li>        b
;   <ul>             (
;     <op></op>       *
;     <li></li>       2
;     <ul>             (
;       <op></op>       -
;       <li></li>       2
;       <li></li>       3
;     </ul>            )
;     <li></li>       3
;   </ul>             )
; </ul>              )
; </bsl-tree>


; NEW (IF IN HTML)
;
;<bsl-tree>
;   <ul>
;       <li>            (+
;        <ul>
;           <li></li>       (* a b)
;           <li></li>       2
;        </ul>
;       </li>           )
;   </ul>
;</bsl-tree>

; Possible JSON
;
; JSON STRUCTURE
; {"data": [define,
;                [x],
;                [2],
;          ]
;
;            [+,
;              [*, 4, 5],
;              3]}
;

; BSL-Tree data definitions

; name is a keyword
(define name (keyword?))

; Value types
(define v (or/c name boolean? string? number? '()))

; Expr is call or cond or name or v
(define expr (or/c call cond name v))

; clause is a pair of expr
(define clause (pair expr expr))

; Cond: List of clauses
(define cond (list? clause))

; call is a name and list of expr
(define call (pair name (list expr)))

; funDef is a name a list of names and a expr
(define funDef (pair name (pair (list name) expr)))

; constDef is a name and a expr
(define constDef (pair name expr))

; structDef is a name and a list of names
(define structDef (pair name (list name)))

; definition is either a funDef or constDef or structDef
(define definition (or/c funDef constDef structDef))

;definitions
(define definition (or/c FunDef ConstDef StructDef))

;defOrExpr
(define defOrExpr (or/c definition expr))

; program type
(define program (listof defOrExpr))



; Example program
;
(program (list (funDef (name (keyword "x2"))
                          (list (name (keyword "x")))
                          (expr (name (keyword "x"))))
                (call (name (keyword "+"))
                      (list (expr (v 2))))))






;;; ;sexpr->program
;;; (define sexpr->program
;;;   (lambda (sexpr)
;;;     (cond
;;;       ((and (keyword? sexpr)
;;;             (keyword? (keyword "define")))
;;;        (list (name (keyword "define"))
;;;              (sexpr->program (cdr sexpr))
;;;              (sexpr->program (cddr sexpr))))
;;;       ((and (keyword? sexpr)
;;;             (keyword? (keyword "call")))
;;;        (list (name (keyword "call"))
;;;              (sexpr->program (cdr sexpr))
;;;              (sexpr->program (cddr sexpr))))
;;;       ((and (keyword? sexpr)
;;;             (keyword? (keyword "cond")))
;;;        (list (name (keyword "cond"))
;;;              (sexpr->program (cdr sexpr))))
;;;       ((and (keyword? sexpr)
;;;             (keyword? (keyword "let")))
;;;        (list (name (keyword "let"))
;;;              (sexpr->program (cdr sexpr))
;;;              (sexpr->program (cddr sexpr))))
;;;       ((and (keyword? sexpr)
;;;             (keyword? (keyword "letrec")))
;;;        (list (name (keyword "letrec"))
;;;              (sexpr->program (cdr sexpr))
;;;              (sexpr->program (cddr sexpr))))
;;;       ((and (keyword? sexpr)
;;;             (keyword? (keyword "let*")))
;;;        (list (name (keyword "let*"))
;;;              (sexpr->program (cdr sexpr))
;;;              (sexpr->program (cddr sexpr))))
;;;       ((and (keyword? sexpr)
;;;             (keyword? (keyword "letrec*")))
;;;        (list (name (keyword "letrec*"))
;;;              (sexpr->program (cdr sexpr))
;;;              (sexpr->program (cddr sexpr))))
;;;       ((and (keyword? sexpr)
;;;             (keyword? (keyword "let-values")))
;;;        (list (name (keyword "let-values"))
;;;              (sexpr-> program (cdr sexpr))  ; bindings  (listof (pair name expr))


; JSON container
(struct/contract JSON-container
([expr-list (listof expr)]))

; for now its only
; sexpr->sexpr
; shall be:
; sexpr->JSON-container
(define (sexpr->json-container sexpr)
  (cond
    [(empty? sexpr)empty]
    [(keyword? (first sexpr))
    (cons(first sexpr)(sexpr->json-container (rest sexpr)))]
    [(cons? sexpr) (cons (first sexpr)
    (sexpr->json-container (rest sexpr)))]
    )
)

; Extract Expr

; simple example

(define sexpr '(+ (* 4 5) 3))

; define a function to extract the expr
(define (extract-expr sexpr)
  (cond
    [(empty? sexpr)empty]
    [(keyword? (first sexpr))
    (cons(first sexpr)(extract-expr (rest sexpr)))]
    [(cons? sexpr) (cons (first sexpr)
    (extract-expr (rest sexpr)))]
    )
)
