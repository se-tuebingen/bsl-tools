# Stepper Example

<stepper>
    (* (+ 1 2 (- 3 9 12) (/ 200 4 5)) (/ 1 2 3) 2)
    (cond [(&gt;= 5 5) "isThree"]
    [#false 3]
    [(or #true #false) (* 2 3 4)])
    (cond
      [(cond
      [(and #false #true) #false]
      [#false 3]
      [(or #true #false) #false])
      "isThree"]
    [#false 3]
    [(&lt; 2 3) (* 2 3 4)])
    (define x (+ 40 2))
    (define y "hallo")
    (define-struct p (x y))
    (define p1 (make-p 1 2))
    (p? p1)
    (p-y p1)
    (&gt; 2 4)
</stepper>
