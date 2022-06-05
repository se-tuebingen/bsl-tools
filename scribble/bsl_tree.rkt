#lang racket/base
(require racket/contract)
(require scriblib/render-cond)
(require scribble/core
         scribble/html-properties
         (only-in xml cdata))
(require scribble/latex-properties)
(require scribble/base)

(provide bsl-tree)
; bsl-tree


(struct/contract bsl-tree-container (
  [bsl-content string?])
  #:transparent)

; HTML
(define
  bsl-tag-wrapper
  (style "" (list (alt-tag "bsltree")))
)

;;; (define/contract
;;;   (bsl-tag content)
;;;   (-> content? content?)
;;;   (paragraph bsl-tag-wrapper bsl-tree-container)
;;; )

;;; (define/contract
;;;   (render-html bsl-tree-container)
;;;   (-> bsl-tree-container block?)
;;;   (nested-flow
;;;     (style #f (list (js-addition "questionnaire.js")))
;;;     (list
;;;       (bsl-tag (bsl-tree-container-bsl-content bsl-tree-container)))
;;;   )
;;; )

; questionnaire
(define
  (bsl-tree content)
   (cond ;[(not (andmap question-container? questions))
          ;(raise-argument-error 'questions "A list of @question s (question-container)" questions)]
         ;[(not (string? key))
          ;(raise-argument-error 'key "A string key for retrieving the bsl-tree with @texquestions" key)]
         [else
         (cond-block
           [html ;(render-html 
           (paragraph bsl-tag-wrapper content);)
           ]
           ;[latex (save-questionnaire key (questionnaire-container questions))]
         )
         ]
   )
)