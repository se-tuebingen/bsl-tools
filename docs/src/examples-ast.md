# Examples AST View

<bsltree>
    (cond [e1 #t]
    [else (asBool e2)])
  </bsltree>
  <bsltree>
    (define (f x y) (+ x y))
  </bsltree>
  <bsltree>
    (cond [(= x 3) "isThree"] [#false '()])
  </bsltree>
  <bsltree>
    (define x 42)
  </bsltree>
  <bsltree>
    (define-struct name (firstName lastName))
  </bsltree>

  <h2>AST as a quiz</h2>
  <bsltree quiz="true">
    (define (f x y) (+ x y))
  </bsltree>
  <bsltree quiz="true">
    (cond [(< x 3) "isThree"] [#false '()])
  </bsltree>
  <bsltree quiz="true">
    (define x 42)
  </bsltree>
  <bsltree quiz="true">
    (define-struct name (firstName lastName))
  </bsltree>

  <h2>Internationalization</h2>
  <h3>German</h3>
  <bsltree quiz="true" lang="de">
    (define-struct name (firstName lastName))
  </bsltree>
