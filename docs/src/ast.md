# AST View

The Abstract Syntax Tree View shows the Abstract Syntax Tree of a given expression in the BSL grammar (or another given grammar in JSON).

## Using AST View with HTML

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

### Planting the &lt;bsltree&gt;

The collapsible AST view can be used with BSL code, which will be parsed for you,
or you can provide your own JSON structure.

The interface is as follows:

```html
<bsltree> (valid bsl syntax) </bsltree>
```

The collapsible AST view also provides an
optional "quiz" mode that starts the tree collapsed and expands if you select
the correct production and mark all subexpressions ('holes').

```html
<!-- if you want to display it in quiz mode, do -->
<bsltree quiz="true"> (valid bsl syntax) </bsltree>

<!-- for displaying user text in german, do -->
<bsltree quiz="true" lang="de"> (valid bsl syntax) </bsltree>

<!-- displaying code trees for stuff that is not BSL -->
<jsontree quiz="true" lang="de"
  ><!-- same options as for bsltree -->
  { "production": "Subtraction", "code": "(|2| - |3|)", "holes": [ {
  "production": "Number", "code": "2"}, { "production": "Number", "code": "3"} ]
  }
</jsontree>
```

Anything inside the `<bsltree>` tag is parsed according to the BSL Core Language as documented below.

**`<` and `>` need to be replaced with `&lt;` and `&gt;` in order to not break your HTML!**

If you want to use `<jsontree>`, you need to provide valid JSON - so use double quotes (`"`)!
`"code"` always needs to be a string, mark holes (code of children) by putting `|`s
around it. If you want to, you can provide your own grammar in the `"grammar"` field
of the root node, like this:

```
...
"grammar": {
  "production name": ["rule 1", "rule 2"],
  ...,
  "terminal symbol": [],
  ...
}
...
```

Note that the object keys need to match exactly the productions you use in your
nodes. The Rules are shown as tooltips on hover, and the keys are used as
options in quiz mode. If no grammar is specified, quiz mode options are inferred
from all occurring productions.

The `lang` attribute is only applicable for Quiz mode, since the regular tree does not display any text in natural language. Currently implemented codes are `en`(English, default) and `de`(German).

## Using AST View with Scribble

### Including the Files

To use the provided scribble module, you need to import it in your document:

```racket
@(require "bsl_tools.rkt")
```

The scribble module does only very little input sanitation and mostly just adds
the JavaScript-Module to your rendered HTML as well as wrapping the input in
the correct custom HTML tags. Both files (`bsl_tools.rkt` **AND** `bsl_tools.js`)
need to be in the same folder as well as your scribble file so that everything works.

### Scribbling the Trees

For the collapsible AST Production Trees, the interface in Scribble is as follows:

- For BSL Expressions, we use Rackets Syntax Objects, which have a similar structure as S-Expressions
- For other Expressions, you need to provide a JSON object with the correct structure, which will **not** be checked at compile-time!

```racket
@bsltree[
  #:quiz #t   @; optional keyword argument, default is #f
  #:lang "de" @; optional keyword argument, default is "en"
  #'((valid bsl syntax))
]

@jsontree[
  #:quiz #t   @; optional keyword argument, default is #f
  #:lang "de" @; optional keyword argument, default is "en"
]{
  {
    "production": "Subtraction",
    "code": "(|2| - |3|)",
    "holes": [
      { "production": "Number", "code": "2"},
      { "production": "Number", "code": "3"}
    ]
  }
}
```

It is necessary to wrap the BSL-Syntax with a `#'()`, especially when there are multiple `<def-or-expr>`,
however literal values, such as `2` don't need to be wrapped.
The Scribble module parses the BSL-Syntax to a string in a `<bsltree>` and adds the javascript module as dependency.

The JSON structure for non-BSL-Syntax needs to contain

- a `"production"` name (string)
- some `"code"` (string) optionally with holes fenced by `|`
- optionally under `"holes"` a list of children with the same structure
- optionally the root node can contain a custom `"grammar"` as described in the html API above

If you set the optional keyword argument `#:quiz` to `#t`, it will add `quiz="true"` which displays the tree in quiz mode.

Similarly, the `#:lang` keyword argument can be used to set the language code. This is only applicable for Quiz mode, since the regular tree does not display any text in natural language. Currently implemented codes are `en`(English, default) and `de`(German).

For the `@jsontree`-helper, there also is the `#:extrastyle` option, whose string
argument will be added inside a HTML `<style>` tag above the HTML that is processed
by the Javascript part. This way, you can override some styles, but not set CSS
variables (`--` will be converted to `&ndash;`, sadly).
If, for example, your production labels are significantly larger than the text in
your nodes, you can give the nodes (represented by `<span>` elements)
greater horizontal spacing with

```
#:extrastyle "jsontree .bsl-tools-tree span { margin-left: 2em; margin-right: 2em;}"
```

Note that you need to scope your styles to `.bsl-tools-tree`, or they are less
specific than those in the general stylesheet and will be overridden.
Also note that inline CSS is not scoped and will apply to all your `jsontree` elements (or whatever you specify).
