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

second step: parser for definitions

A Definition is one of:
  - FunDef <=> (define (name args+) expr)
  - ConstDef <=> (define name expr)
  - StructDef <=> (define-struct name (name+))

  Additional things:
  - Vergleichsoperationen für cond ((= 2 3) sowie (and / or) z.B.)
  -


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


# Implementation BSL (more or less)
Program
  = all:DefOrExpr{return {"program":all}}

DefOrExpr
  = all:(Definition / Expression){return {"def-or-expr": all}}

Definition
  = _ def: (StructDef / FunDef / ConstDef){return {"Definition": def}}

StructDef
  = struct:("(define-struct" _ Name (Name)+)")"{return {"StructDef": struct}}

FunDef
  = fun:("(define" Name ("(" Name) ")" + Expression ")"){return {"FunDef": fun}}

ConstDef
  = con:( "(define" Name Expression ")"){return {"ConstDef":con}}
    
Expression
  = _ expr: (Primitive / Cond / Call / Name / Value){return {"Expression": expr}}

Primitive
  = prim:("("
  ("+" / "-" / "*" / "/")
  (Expression)* ")"){return prim}

Cond
  = cond:("(cond" _("[" _ condition: Expression result: Expression _"]"_)+ _")"){return {"cond": cond}}

Call
  = call:("(" Name Expression* ")"){return {"call":call}}

Name "name"
  = _ name:[A-Za-z]+ {
  return {"Name":name.join("")}}

Value "value"
  = val:(Number / Boolean / Empty / String){
  return {"Value": val}
  }
Number "number"
  = _ [0-9]+ {return {"Number":parseInt(text(), 10)}}

Boolean
  =_ bool:("#true" / "#false"){
	if (bool === "#true"){return {"boolean":true}}
    else{return {"boolean":false}}
  }

Empty
  = _ "'()"{return {"empty": null}}

String
  = _ '"' str: [A-Za-z]+ '"'{
  return {"string": str.join("")}}


_ "whitespace"
  = [\t \n \r]* {return undefined}


# Second step: JSON to BSL_AST objects






# Interpreter beginnings

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
  return all}
  }
Name "name"
  = _  name:[A-Za-z]+ {
  return name.join("")}
Value "value"
  = val:(Integer / Boolean / Empty / String){
  return val;
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
  = _ '"' str: [A-Za-z]+ '"'{
  return str.join("")}

  _ "whitespace"
    = [ \t\n\r]*
