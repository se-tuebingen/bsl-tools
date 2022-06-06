#lang racket/base
(require racket/contract)
(require 2htdp/universe)
(require racket/list)
(require racket/string)
(require racket/format)
(require scriblib/render-cond)
(require scribble/core
         scribble/html-properties
         (only-in xml cdata))
(require scribble/latex-properties)
(require scribble/base)

(provide bsl-ast)


(struct/contract bsl-string-container (
  [bsl-content sexp?])
  #:transparent)

; HTML
(define
  bsl-tag-wrapper
  (style "" (list (alt-tag "bsltree")))
)
; add substring
; sexpr->string
(define (sexpr->string sexpr)
(substring (~a sexpr) 1 (- (string-length (~a sexpr)) 1))
)
; render bsl-string
(define
  (bsl-ast sexpr)
           (cond-block
           [html (paragraph bsl-tag-wrapper (sexpr->string sexpr))]
           [latex (paragraph (style #f '()) (sexpr->string sexpr))]
         )
)

