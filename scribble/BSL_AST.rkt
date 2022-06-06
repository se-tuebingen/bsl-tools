#lang racket/base
(require racket/contract)
(require racket/list)
(require racket/string)
(require racket/format)
(require scriblib/render-cond)
(require scribble/core
         scribble/html-properties
         (only-in xml cdata))
(require scribble/latex-properties)
(require scribble/base)

(provide bsl-tree)

; predicate function sexpr
(define (sexpr? sexpr)
  (cond
    [(boolean? sexpr) #t]
    [(string? sexpr) #t]
    [(symbol? sexpr) #t]
    [(number? sexpr) #t]
    [(empty? sexpr) #t]
    [(and (string? (~a sexpr))
        (string-prefix? (~a sexpr) "((")
        (string-suffix? (~a sexpr) "))")
    )#t]
    [else #f]
  )
)

(struct/contract bsl-string-container (
  [bsl-content sexpr?])
  #:transparent)

; HTML
(define
  bsl-tag-wrapper
  (style "" (list (alt-tag "bsltree")(js-addition "bsl_tools.js")))
)
; helper: add substring
; sexpr->string
(define (sexpr->string sexpr)
  (cond
    [(boolean? sexpr) (~a sexpr)]
    [(string? sexpr) (string-append "\"" sexpr "\"")]
    [(number? sexpr) (~a sexpr)]
    [(empty? sexpr) "empty"]
    [(symbol? sexpr) (~a sexpr)]
    [else (substring (~a sexpr) 1 (- (string-length (~a sexpr)) 1))]
  )
)

; render bsl-string
(define
  (bsl-tree sexpr)
  (cond
  [(not (sexpr? sexpr)) (raise-argument-error 'bsl-tree "BSL-Tree only accepts S-Expressions" sexpr)]
  [(cond-block
      [html (paragraph bsl-tag-wrapper (sexpr->string sexpr))]
      [latex (paragraph (style #f '()) (sexpr->string sexpr))]
  )]
  )
)

