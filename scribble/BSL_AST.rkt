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


(define value (or/c boolean? string? number? '()))
(define name (or/c symbol?))
(struct/contract bsl-string-container (
  [bsl-content (or/c value syntax?)])
  #:transparent)

; predicate function value
(define (value? value)
  (cond
    [(boolean? value) #t]
    [(string? value) #t]
    [(number? value) #t]
    [(empty? value) #t]
    [(symbol? value) #t]
    [else #f]
  )
)
; HTML
(define
  bsl-tag-wrapper
  (style #f (list (alt-tag "bsltree")(js-addition "bsl_tools.js")
  ))
)

; Either (List of Syntax) or (Value)-> Either (List of String) or (String)
(define (synlst-or-val->strlist-or-str lst)
  (cond
    [(or (number? lst) (boolean? lst)(symbol? lst))
    (string-append (~a lst) " \n")]
    [(string? lst) (string-append "\"" lst "\" \n")]
    [(empty? lst) " '() \n"]
    [(stx-list? lst)(stx-map 
      (lambda (x) 
      (string-append "(" (syntax->string x) ") \n "))lst)]
    [(syntax? lst) (syntax->string lst)]
  )
)

;Either (List-of-String) or (String) -> String
(define (strlist-or-str->str lst)
  (cond
    [(string? lst) lst]
    [(empty? lst) ""]
    [else (string-append (first lst) (strlist-or-str->str (rest lst)))]
  )
)



; render bsl-string
(define
  (bsl-tree stx)
  (cond
  [(not (or (syntax? stx) (value? stx))) (raise-argument-error 'bsl-tree "BSL-Tree only accepts Syntax-Expressions or Values" stx)]
  [(cond-block
      [html (paragraph bsl-tag-wrapper 
      (strlist-or-str->str
        (synlst-or-val->strlist-or-str stx))
      )]
     ;[latex (paragraph (style #f '()) (strlist-or-str->str(synlst-or-val->strlist-or-str stx)))]
  )]
  )
)





; OLD


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


;;; NOT USED
;;;
;;; #lang racket/base
;;; (require racket/contract)
;;; (require racket/list)
;;; (require scribble/core
;;;          scribble/html-properties
;;;          (only-in xml cdata))
;;; (require scribble/latex-properties)
;;; (require scribble/base)

;;; ; 
;;; ; <bsl-tree>
;;; ; (expression-or-def)
;;; ; (expression-or-def)
;;; ; (expression-or-def)
;;; ;<\bsl-tree>


;;; ; BSL-Tree data definitions

;;; (define bsl-tree (
;;;   flat-rec-contract tree-of()
;;; ))
;;; ; Value types
;;; (define v (or/c boolean? string? number? '()))

;;; ; name is a keyword
;;; (define name (or/c string?))

;;; ; Expr is call or cond or name or v
;;; ;(define expr (or/c call cond name v))

;;; (define expr (flat-rec-contract expr (or/c call cond name v)))


;;; ; clause is a pair of expr
;;; (define clause (cons/c expr expr))

;;; ; Cond: List of clauses
;;; (define cond (listof clause))

;;; ; call is a name and list of expr
;;; (define call (cons/c name (listof (or/c call cond name v))))

;;; ; funDef is a name a list of names and a expr
;;; (define funDef (cons/c name (cons/c (listof name) expr)))

;;; ; constDef is a name and a expr
;;; (define constDef (cons/c name expr))

;;; ; structDef is a name and a list of names
;;; (define structDef (cons/c name (listof name)))

;;; ; definition is either a funDef or constDef or structDef
;;; (define definition (or/c funDef constDef structDef))

;;; ;defOrExpr
;;; (define defOrExpr (or/c definition expr))

;;; ; program type
;;; (define program (listof defOrExpr))



;;; ; Example program
;;; ;
;;; (program (list (definition (funDef (cons (name "f") (list (name "x")) (expr (name ("x"))))))
;;;                 ))