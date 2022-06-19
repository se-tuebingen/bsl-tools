import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCTURES";

// split function

// expr = 
function split(expr: BSL_AST.expr): SI_STRUCT.Split{

    if (BSL_AST.isCall(expr)){
        if(expr.name.symbol == "+"){
            const args = expr.args;
           args.forEach(arg => {
            if (BSL_AST.isLiteral(arg)){    // argument is a literal
                //return redex 
            }else if (BSL_AST.isCall(arg)){ // argument is a call
                //return redex
            }
           });    
            }
        }

}