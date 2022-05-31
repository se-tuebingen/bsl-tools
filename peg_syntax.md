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


# Implementation Arithmetic Expressions & more

Expression
  = _ all:("("
  (("+" / "-" / "*" / "/"))
  (Expression / Value)* ")" / Name / Value){
  if (all[1] === "+"){return all[2].reduce(function(result, element){
  return result + element;
  });}
  if (all[1] === "-"){return all[2].reduce(function(result, element){
  return result - element;
  });}
  if (all[1] === "*"){return all[2].reduce(function(result, element){
  return result * element;
  });}
  if (all[1] === "/"){return all[2].reduce(function(result, element){
  return result / element;
  });}
  else{
  return all.reduce(function(result, element){
  return result + element;
  });}
  }
Name "name"
  = _  name:[A-Za-z]+ {
  return name}
Value "value"
  = expr:(Integer / Boolean / Empty / String){
  return expr;
  }
Integer "integer"
  = _ [0-9]+ {return parseInt(text(), 10);}

Boolean
  =_ bool:("#true" / "#false"){
	if (bool === "#true"){return true}
    else{return false}
  }

Empty
  = _ "'()"{return null}

String
  = _ '"' str:[A-Za-z]+ '"'{
  return str}

  _ "whitespace"
    = [ \t\n\r]*



# Second step: Parser for definitions and expressions
