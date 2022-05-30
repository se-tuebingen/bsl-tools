# Grammar matching expressions

For example:

`(+ (* 4 2))`

first step: Parser for expressions
A expression is one of:
  - Call <=> (name expr*) <later>
  - cond <=> (cond List-Of-[expr, expr])
  - name <=> name
  - Four primitive functions: `+, -, *, \`
  - One of four literals `v`: `boolean, string, number, empty`

# example peg.js

Expression
  = head:Term tail:(_ ("+" / "-") _ Term)* {
      return tail.reduce(function(result, element) {
        if (element[1] === "+") { return result + element[3]; }
        if (element[1] === "-") { return result - element[3]; }
      }, head);
    }

Term
  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
      return tail.reduce(function(result, element) {
        if (element[1] === "*") { return result * element[3]; }
        if (element[1] === "/") { return result / element[3]; }
      }, head);
    }

Factor
  = "(" _ expr:Expression _ ")" { return expr; }
  / Integer

Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*


# Implementation Arithmetic Expressions

Expression
  = head:"("  tail: "+" / "-" / "*" / "/"_ Expression / Integer)* {
    return tail.reduce(function(result, element){
      if (element[0] === "+"){return result + element[1];}
      if (element[0] === "-"){return result - element[1];}
      if (element[0] === "*"){return result * element[1];}
      if (element[0] === "/"){return result / element[1];}
      }, head);
  }

Integer "integer"
  = _ [0-9]+ {return parseInt(text(), 10);}

  _ "whitespace"
    = [ \t\n\r]*
second step: Parser for definitions and expressions
