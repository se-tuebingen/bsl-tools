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
(require syntax/to-string)
(require syntax/stx)
(provide bsl-tree)

; predicate function sexpr
;;; (define (sexpr? sexpr)
;;;   (cond
;;;     [(boolean? sexpr) #t]
;;;     [(string? sexpr) #t]
;;;     [(symbol? sexpr) #t]
;;;     [(number? sexpr) #t]
;;;     [(empty? sexpr) #t]
;;;     [(and (string? (~a sexpr))
;;;         (string-prefix? (~a sexpr) "((")
;;;         (string-suffix? (~a sexpr) "))")
;;;     )#t]
;;;     [else #f]
;;;   )
;;; )

(struct/contract bsl-string-container (
  [bsl-content syntax?])
  #:transparent)

; HTML
(define
  bsl-tag-wrapper
  (style #f (list (alt-tag "bsltree")(js-addition "bsl_tools.js")
  ))
)
; helper: add substring
; sexpr->string
;;; (define (sexpr->string sexpr)
;;;   (cond
;;;     [(boolean? sexpr) (string-append "\n" (~a sexpr) "\n")]
;;;     [(string? sexpr) (string-append "\n" "\"" sexpr "\"" "\n")]
;;;     [(number? sexpr) (string-append "\n" (~a sexpr) "\n")]
;;;     [(empty? sexpr) (string-append "\n" "'()" "\n")]
;;;     [(symbol? sexpr) (string-append "\n" (~a sexpr)"\n")]
;;;     [else (string-append "\n" (substring (~a sexpr) 1 (- (string-length (~a sexpr)) 1)) "\n")]
;;;   )
;;; )

;List of Syntax or syntax -> List of String
(define (synlist->strlist lst)(cond
[(stx-list? lst)(stx-map 
  (lambda (x) 
   (string-append "(" (syntax->string x) ") \n "))lst)]
[(syntax? lst) (syntax->string lst)]
))

;List-of-String -> String
(define (strlist->str lst)
(cond
[(empty? lst) ""]
[else (string-append (first lst) (strlist->str (rest lst)))]
)
)



; render bsl-string
(define
  (bsl-tree stx)
  (cond
  [(not (syntax? stx)) (raise-argument-error 'bsl-tree "BSL-Tree only accepts Syntax-Expressions" stx)]
  [(cond-block
      [html (paragraph bsl-tag-wrapper (strlist->str(synlist->strlist stx)))]
      [latex (paragraph (style #f '()) (strlist->str(synlist->strlist stx)))]
  )]
  )
)
;;; ; RAM
;;; @subsection{Name Expression}
;;; @bsl-tree[
;;; #'(just-a-normal-not-intriguing-name)
;;; ]

;;; @subsection{List Expression}
;;; @bsl-tree[
;;;     #'((list 1 2 3 4 5))
;;; ]

;;; @subsection{Value Expressions}
;;; Boolean:

;;; @bsl-tree[
;;; #true
;;; ]


;;; Number:
;;; @bsl-tree[
;;; 42
;;; ]


;;; String:
;;; @bsl-tree[
;;;     "HalloWelt"
;;; ]

;;; ; WORK TODO
;;; Empty-List:
;;; @bsl-tree[
;;; #'((cons "hello" '()))
;;; ]




; Examples


(strlist->str (synlist->strlist    #'((define one 2)
 (define two 3)
 (+ one two))))

 (strlist->str (synlist->strlist    
 #'((define (swim-with-the-fish pool) 
(string-append "Coolpoolwithanumberof" (number->string (pool-fish pool)))))
))
 
 (strlist->str (synlist->strlist    #'((define one 2)
 (define two 3)
 (+ one two))))
 
 (strlist->str (synlist->strlist    #'((define one 2)
 (define two 3)
 (+ one two))))
 
 (strlist->str (synlist->strlist    #'((define one 2)
 (define two 3)
 (+ one two))))
 