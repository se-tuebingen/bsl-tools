import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";

//split

export function split (expr: BSL_AST.expr): SI_STRUCT.SplitResult | undefined {
    if(BSL_AST.isCall(expr)){
        const name = expr.name;
        const args = expr.args;
        const hole = {type: "Hole", index: 0};
        for (let i = 0; i < args.length; i++){
            if (BSL_AST.isCall(args[i])){
                const call = args[i] as BSL_AST.Call;
                hole.index = i;
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
                    args: [...args.slice(0, i), hole, ...args.slice(i + 1)] as SI_STRUCT.exprOrHole[]
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
                args: [hole] as SI_STRUCT.exprOrHole[]
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

export function step(r: SI_STRUCT.Redex): BSL_AST.expr | undefined{
    if (r.name.symbol == "+"){
        // PRIM
        let new_r = 0;
        
        r.args.forEach(el => {
            if (BSL_AST.isLiteral(el)){
                new_r += el.value as number;
            }else{
                console.error("error: argument is not a literal");
                return undefined;
            }
        });
        return {
            value: new_r
        } as BSL_AST.Literal
    }
}

// plug

export function plug(r_val:BSL_AST.Literal, c: SI_STRUCT.Context): BSL_AST.expr | undefined{
    const args = c.args;
    const name = c.name;
    for(let i=0; i < args.length; i++){
        if (SI_STRUCT.isHole(args[i])){
            const new_args = [...args.slice(0, i), r_val.value, ...args.slice(i + 1)] as BSL_AST.expr[];
            console.log("new_args" + new_args);
            return {
                type: BSL_AST.Production.FunctionCall,
                name: name as BSL_AST.Name,
                args: new_args
            }
        }
    }
    console.error("error: no hole found");
    return undefined;
}