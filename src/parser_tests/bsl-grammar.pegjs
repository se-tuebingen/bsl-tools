Program
  = all:(DefOrExpr)+ {return {"program":all}}

DefOrExpr
  = all:(Definition / Expression){return {"DefOrExpr": all}}

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
