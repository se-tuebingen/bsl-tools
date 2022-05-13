#lang racket
(require json)
(require racket/match)
; module sexpr->json
; gets sexpr and prints a json file
; JSON STRUCTURE
;
;
;
;
;
;Js Expr Test
(define js-expr-test "cheesecake")
(define sexpr '(+ (* 4 5) 3))
(define sexpr2 '(1,2,3))
(define nested-sexpr
  '(+
    (/
      (* 2
        (+ 3 5)
        (-
          (* 8 4)
            2)
          2)
        10)
      2)
    )
sexpr


; sexpr->List
; '(+
;     (* 4 5)
;   3)
; (define (sexpr->list sexpr)
; (match sexpr
;   [(cons a rest) (cons a (cons sexpr->list(rest)'()))]
;   [else empty]
;   )
; )

; output file test
(define out (open-output-file "some.json"))

; Jsexpr->Json test
(define json_output (write-json js-expr-test out))
json_output
(close-output-port out)



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
