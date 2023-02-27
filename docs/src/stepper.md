# Small Step Interpreter (Stepper)

The Small Step Interpreter (Stepper) shows each step of BSL programs.

The stepper accepts only syntactic valid BSL programs. It precomputes the evaluation steps
and allows users to step through the evaluation of each expression until the
program is finished.

## Using the Stepper with HTML

### Including bsl_tools.js

To use the AST-View, you need to add the script anywhere in your document as
follows:

```html
<!-- import the bsl_tools script somewhere on the page, ideally in the head -->
<script src="bsl_tools.js"></script>
```

Note that if you add one or more of the following tools to your page, the script
will add stylesheets to the `<head>` of your document which set styles for the
`.bsl-tools-stepper` and `.bsl-tools-tree` classes.

### Reducing BSL programs with &lt;stepper&gt;

The interface is as follows:

```html
<stepper> (valid bsl syntax) </stepper>

<!-- for displaying user text in german, do -->
<stepper lang="de"> (valid bsl syntax) </stepper>
```

**`<` and `>` need to be replaced with `&lt;` and `&gt;` in order to not break your HTML!**

Font sizes and styles are deliberately left unset wherever possible in order to
just conform to the styling of the rest of the document.

For the code and explanation formats, however, setting the `font-family` attributes
is a must. The current stylesheets has chosen some specific fonts, if you do not
agree with them or want to choose your own font, you simply need to override the CSS
variable:

```css
.bsl-tools-stepper {
  --font-family-monospace: monospace; /* to use the system default */
  --font-family-rule-description: "My fancy font", serif; /* to use your own choice */
}
```

Place this somewhere where it overrides the default stylesheet that is added to the
document head, e.g. in a `style` tag above the first stepper. Other CSS variables
that can be set can be found at the head of [`src/ressources/small-interpreter.css`](src/ressources/small-interpreter.css).

## Using the Stepper with Scribble

### Including the Files

To use the provided scribble module, you need to import it in your document:

```racket
@(require "bsl_tools.rkt")
```

The scribble module does only very little input sanitation and mostly just adds
the JavaScript-Module to your rendered HTML as well as wrapping the input in
the correct custom HTML tags. Both files (`bsl_tools.rkt` **AND** `bsl_tools.js`)
need to be in the same folder as well as your scribble file so that everything works.

###

Similar to the AST view functionality, programs are entered as Racket Syntax Objects.

```racket
@stepper[
  #'((* (+ 1 2 (- 3 9 12) (/ 200 4 5)) (/ 1 2 3) 2)
  (cond [(>= 5 5) "isThree"]
  [#false 3]
  [(or #true #false) (* 2 3 4)]))
]
```

For German Language support add `#:lang "de"` as additional parameter:

```racket
@stepper[ #:lang "de"
#'((_ (+ 1 2 (- 3 9 12) (/ 200 4 5)) (/ 1 2 3) 2)
(cond [(>= 5 5) "isThree"]
[#false 3]
[(or #true #false) (_ 2 3 4)]))
]
```
