#lang racket
(require json)
(require racket/match)

(define js-expr-test "cheesecake")
(define sexpr '(+ (* 4 5) 3))
(define sexpr2 '(1,2,3))
sexpr

; sexpr -> List-Of-sexpr
; (define sexpr->lst (sexpr)
; (match
; [( '(exp x)) "okay"]
; [else "No"]
;   )
; )

(sexp->list sexpr2)
