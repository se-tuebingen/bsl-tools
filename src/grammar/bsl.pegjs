Program
  = all:(DefOrExpr)+ { return all } /* simply return the parsed list */

DefOrExpr
  = all:(Definition / Expression) [\t \n \r]+ { return all } /* union type: return transparently */

Definition
  = _ def: (StructDef / FunDef / ConstDef){ return def } /* union type: return transparently */

StructDef
  = "(define-struct" binding:Name _ "(" properties:(Name)+ ")" _ ")"{
  return {
    "type": "Struct Definition",
  	"binding": binding,
    "properties": properties
    }
  }

FunDef
  = "(define" name:Name _ "(" args:(Name)+ ")" body:Expression ")" {
  return {
    "type": "Function Definition",
  	"name": name,
    "args": args,
    "body": body
    }
  }

ConstDef
  = "(define" name:Name value:Expression ")" {
  return {
    "type": "Constant Definition",
  	"name": name,
    "value": value
    }
  }

Expression
  = _ expr: (Cond / Call / Name / Value) { return expr }

Cond
  = "(cond" options:(Option)+ _")" {
    return {
      "type": "Cond-Expression",
      "options": options
    }
  }

Option
  = _ "[" _ condition:Expression _ result:Expression "]" {
    return {
      "type": "Cond-Option",
      "condition": condition,
      "result":result
    }
  }

Call
  = "(" name:Name args:(Expression)* ")" {
  return {
    "type": "Function Call",
    "name": name,
    "args": args
    }
  }

Name
  = _ symbol:[A-Za-z\+\-\/\*\=\<\>]+ {
  return {
    "type": "Symbol",
  	"symbol":symbol.join("")
    }
  }

Value
  = val:(Number / Boolean / Empty / String){
  return {
    "type": "Literal Value",
    "value": val
    }
  }

Number
  = _ [0-9]+ {return parseInt(text(), 10)}

Boolean
  =_ bool:("#true" / "#false" / "#t" / "#f"){ return (bool === "#true" || bool === "#t") }

Empty
  = _ "'()"{ return "'()" }

String
  = _ '"' str:[A-Za-z \r \t \n 0-9\!\(\)\?\,\;\.\:\-\']+ '"'{ return str.join("") }


_ "whitespace"
  = [\t \n \r]* {return undefined}
