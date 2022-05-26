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


(provide sexpr->json-container)

; Value types
(define v (or/c boolean? string? number? '()))
; 

; Expr type
(define expr (or/c keyword? v)) ; add call cond later

; add Definitions later

; Name Type
(define name (or/c keyword?))

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
