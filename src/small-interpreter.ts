import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCTURES";

// // searchRedex
// function searchRedex(expr: BSL_AST.expr): SI_STRUCT.SplitResult{
// // expression is either Call or Value
//     if (BSL_AST.isCall(expr)){
//         if(expr.name.symbol == "+"){
//             const args = expr.args;
            
//         }
//     }else if (BSL_AST.isLiteral(expr)){
//             //return Literal
//             return expr;
//         }

// }

// step

// function step(r: SI_STRUCT.Redex): BSL_AST.expr{
//     switch (r.type) {
//         case "AddRedex":
//             if (BSL_AST.isLiteral(r.leftExpr && BSL_AST.isLiteral(r.rightExpr))){
//                 return r.leftExpr + r.rightExpr;
//             }
           
//             }
//         case "MulRedex":
//             return r.leftExpr;
//     }
// }