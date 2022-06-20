import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";

//split

export function split (expr: BSL_AST.expr): SI_STRUCT.SplitResult | undefined {
    if(BSL_AST.isCall(expr)){
        const name = expr.name;
        const args = expr.args;
        const hole = {} as SI_STRUCT.Hole;
        for (let i = 0; i < args.length; i++){
            if (BSL_AST.isCall(args[i])){
                const call = args[i] as BSL_AST.Call;
                return {
                    redex: {
                        type: "Redex",
                        name: call.name,
                        args: call.args
                },
                context: {
                    type: "Context",
                    name: name,
                    //concat hole with args
                    args: [...args.slice(0, i), hole, ...args.slice(i + 1)]
                    }
                } 
            }   
        }
        return {
            redex: {
                type: "Redex",
                name: name,
                args: args
            },
            context: {
                type: "Context",
                name: null,
                args:[hole]
            }
        }
    }else if (BSL_AST.isLiteral(expr)){
        return expr;
    }else if (BSL_AST.isCond(expr) || BSL_AST.isName(expr) || expr == undefined){
        console.log("error: expr is either Cond, Name, or undefined");
        return undefined;
    }
}




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