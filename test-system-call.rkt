#lang racket/base

(require racket/system)

(system "node screenshot-test.js" #:set-pwd? #t)
