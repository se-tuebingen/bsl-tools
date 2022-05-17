#lang racket
(require json)
(require racket/match)
(require racket/string)
(require racket/contract)




; module sexpr->json
; gets sexpr and prints a json file
; JSON STRUCTURE
; {"data": ["+",
;              ["*", 4, 5],
;              3]}
;
;
;
;Js Expr Test
(define js-expr-test "cheesecake")
(define sexpr '(+ (* 4 5) 3))
(define sexpr2 '(1,2,3))
(define nested-sexpr
  "(+ (/ (* 2(+ 3 5)(-(* 8 4) 2) 2) 10) 2)"
    )

nested-sexpr
(jsexpr? nested-sexpr)

; sexpr->List of Lists and Symbols
; '(+
;     (* 4 5)
;   3)

(define (sexpr->list sexpr)
  (cond
    [(empty? sexpr)empty]
    [(symbol? (first sexpr))(cons(symbol->string (first sexpr))(sexpr->list(rest sexpr)))]
    [(cons? sexpr) (cons (first sexpr) (sexpr->list (rest sexpr)))]
    )
)

(list?(sexpr->list sexpr))
(jsexpr? (sexpr->list sexpr))
;list->jsexpr-list
; ListOfSymbols -> JSExpression List
; (define (slist->jslist slst)
;   (cond
;     [(empty? slst) empty]
;     [(and (list? (first slst)) (not (symbol? (first slst))))
;     (cons (string-join (first (first slst)))
;     (string-join (slist->jslist (first (rest slst)))))]
;
;     [(and (cons? slst) (not (symbol? (first slst))))
;     (cons(string-join (first slst))
;     (string-join (slist->jslist (rest slst))))]
;
;     [(cons? slst)(cons(string-append
;       (symbol->string(first slst)))
;       (string-join (slist->jslist (rest slst))))]
;     )
;     )
; (slist->jslist sexpr)
;(slist->string sexpr)

; output file test
;(define out (open-output-file "some.json"))

; Jsexpr->Json test
; (define json_output (write-json js-expr-test out))
; json_output
; (close-output-port out)



; ####YAML-TEST####
;yaml-expr-TEST
; (require yaml)
;
; (define lonely-string "# hallo")
; (string->yaml lonely-string)
;
; (define strings-for-yaml (string-append
;     "# Ranking of 1998 home runs\n"
;     "---\n"
;     "- Mark McGwire\n"
;     "- Sammy Sosa\n"
;     "- Ken Griffey\n"
;     "\n"
;     "# Team ranking\n"
;     "---\n"
;     "- Chicago Cubs\n"
;     "- St. Louis Cardinals\n"))
;
; (string->yaml* strings-for-yaml)
