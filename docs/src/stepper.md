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

**`<` and `>` need to be replaced with `&lt;` and `&gt;` in order to not break your HTML!**

###

The interface is as follows:

```html
<stepper> (valid bsl syntax) </stepper>

<!-- for displaying user text in german, do -->
<stepper lang="de"> (valid bsl syntax) </stepper>
```

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
