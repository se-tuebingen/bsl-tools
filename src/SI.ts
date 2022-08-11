import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";

// calculateAllSteps
// Value | Expression, Stepper => Stepper
export function calculateAllSteps(expr: BSL_AST.expr | SI_STRUCT.Value, stepper: SI_STRUCT.Stepper):SI_STRUCT.Stepper{
    if(SI_STRUCT.isValue(expr)){
        return stepper;
    }else{
        const stepperTree = stepper.stepperTree;
        while(!SI_STRUCT.isValue(expr)){
            const stepResult = calculateStep(expr) as SI_STRUCT.StepResult;
            expr = SI_STRUCT.isValue(stepResult) ? stepResult as SI_STRUCT.Value : stepResult.plugResult.expr as BSL_AST.expr;
            stepperTree.push(stepResult);
    }
    const newStepper = {
        type: SI_STRUCT.Production.Stepper,
        root: stepper.root,
        originExpr: stepper.originExpr,
        stepperTree: stepperTree
    } as SI_STRUCT.Stepper;
        newStepper.stepperTree.map((step, i) => step.currentStep = i);
        return newStepper;
    }

}
// calculateStep
// Expression => OneRule | KongRule | Done | Error

export function calculateStep(expr: BSL_AST.expr):SI_STRUCT.StepResult | SI_STRUCT.Value{
    const splitExpr = split(expr) as SI_STRUCT.SplitResult;
    console.log("splitExpr", splitExpr);
    if(SI_STRUCT.isSplit(splitExpr)){
        const stepExpr = step(splitExpr.redex) as SI_STRUCT.OneRule;
        console.log("stepExpr", stepExpr);
        const plugExpr = plug(stepExpr, splitExpr.context) as SI_STRUCT.PlugResult;
        console.log("plugExpr", plugExpr);
        const stepResult = {
            type: SI_STRUCT.Production.StepResult,
            splitResult: splitExpr,
            plugResult: plugExpr
        } as SI_STRUCT.StepResult;
        return stepResult;
    }else{
        return (expr as BSL_AST.Literal).value as SI_STRUCT.Value;
    }
}

//split
// Expression => SplitResult | Error
export function split (expr: BSL_AST.expr): SI_STRUCT.SplitResult | Error {
    const hole = {type: SI_STRUCT.Production.Hole} as SI_STRUCT.Hole;
    if(BSL_AST.isCall(expr)){
        const name = expr.name;
        const args = expr.args;
        let pos = -1;

        const valueLst = [] as SI_STRUCT.Value[];
        const exprLst = [] as BSL_AST.expr[];
        // get all values from the left side
        for (let i = 0; i < args.length; i++) {
            let arg = args[i];
            if(BSL_AST.isLiteral(arg)){
                valueLst.push(arg.value);
            }else if (SI_STRUCT.isValue(arg)){
                valueLst.push(arg);
            }else{
                pos = i;
                break;
            }
        }
        // if there is no context, if all arguments are values
        if (pos == -1){
            const redex = {
                type: SI_STRUCT.Production.CallRedex,
                name: name,
                args: valueLst
            } as SI_STRUCT.CallRedex;
            return {
                type: SI_STRUCT.Production.Split,
                redex: redex,
                context: hole
            } as SI_STRUCT.Split;
        // else get all expressions from the right side
        }else{
            for (let i = pos + 1; i < args.length; i++) {
                let arg = args[i];
                if(BSL_AST.isExpr(arg)){
                    exprLst.push(arg);
                }else{
                    return new Error("split: argument is not an expression " + arg + i);
                }
            }

            const call = args[pos] as BSL_AST.Call;
            const splitResult = split(call) as SI_STRUCT.Split;
            return {
                type: SI_STRUCT.Production.Split,
                redex: splitResult.redex,
                context: {
                    type: SI_STRUCT.Production.AppContext,
                    op: name,
                    values: valueLst,
                    ctx: splitResult.context as SI_STRUCT.AppContext | SI_STRUCT.Hole,
                    args: exprLst
                }
            } as SI_STRUCT.Split;
        }
    }else if (BSL_AST.isCond(expr)){
        const clause = expr.options[0];
        // if condition is already reduced, build CondRedex
        if(BSL_AST.isLiteral(clause.condition)){
            const condition = clause.condition as BSL_AST.Literal;
            return {
                type: SI_STRUCT.Production.Split,
                redex: {
                    type: SI_STRUCT.Production.CondRedex,
                    options: [{condition: condition, result: clause.result}, ...expr.options.slice(1)]
                 } as SI_STRUCT.CondRedex,
                context: hole} as SI_STRUCT.Split;
        }
        // else build other Redex
        else{
            return Error("not implemented");
        }
    }else if (BSL_AST.isName(expr)){
        console.log("error: expr is  Name, or undefined");
        return Error("error: expr is Name, or undefined") as Error;
    }else{
        return Error("error: something unexpected occured") as Error;
    }
}

// step
// Redex => OneRule | Error
export function step(r: SI_STRUCT.Redex): SI_STRUCT.OneRule | Error{
    if(SI_STRUCT.isCallRedex(r)){
        if(prim(r) != null){
            return {
                type: SI_STRUCT.Production.Prim,
                redex: r,
                result: prim(r) as SI_STRUCT.Value
            };
        }else{
            return Error("error: prim is not applicable");
        }
    }else if(SI_STRUCT.isCondRedex(r)){
        const clause = r.options[0];
            return {
                type: SI_STRUCT.Production.CondRule,
                redex: r,
                result: cond(r) as BSL_AST.expr
            }
        return Error("Cond not implemented yet");
    }else{
        return Error("error: redex is neither a call nor cond");
    }
}

// plug
// plug(oneRule, c: Context): Expression, pRule
export function plug(oneRule: SI_STRUCT.OneRule, c: SI_STRUCT.Context): SI_STRUCT.PlugResult | Error{
    //check if context is a Hole
    if (SI_STRUCT.isHole(c)){
        // Apply OneRule
        return {
            type: SI_STRUCT.Production.PlugResult,
            expr: oneRule.result,
            rule: oneRule
        } as SI_STRUCT.PlugResult;
    }else{
        //Apply OneRule with KONG RULE
        const finalExpr = {
            type: BSL_AST.Production.FunctionCall,
            name: c.op,
            args: [c.values, (plug(oneRule, c.ctx) as SI_STRUCT.PlugResult).expr, c.args].flat() as BSL_AST.expr[]
        }
        //console.log("finalExpr", finalExpr);
        return {
            type: SI_STRUCT.Production.PlugResult,
            expr: finalExpr as BSL_AST.expr,
            rule: {
                type: SI_STRUCT.Production.Kong,
                redexRule: oneRule
            }
        } as SI_STRUCT.PlugResult;
    }
}

// ####### ONE RULE FUNCTIONS #######

export function prim(r:SI_STRUCT.CallRedex): SI_STRUCT.Value | null |Error{
    // + - * /
    if (r.name.symbol === "+"){
        let n = 0;
        r.args.forEach(el => {
            if (SI_STRUCT.isValue(el)){
                n += el as number;
            }else{
                return Error("error: argument is not a literal: " + el);
            }
        });
        return n;
    }else if(r.name.symbol === "*"){
        let n = 1;
        r.args.forEach(el => {
            if (SI_STRUCT.isValue(el)){
                n *= el as number;
            }else{
                return Error("error: argument is not a literal: " + el);
            }
        });
        return n;
    }else if (r.name.symbol === "-"){
        let n = r.args[0] as number;
        for (let i = 1; i < r.args.length; i++) {
            let el = r.args[i];
            if (SI_STRUCT.isValue(el)){
            n -= el as number;
            }else{
                return Error("error: argument is not a literal: " + r.args[i]);
            }
        }
        return n;
    } else if(r.name.symbol === "/"){
        let n = r.args[0] as number;
        for(let i = 1; i < r.args.length; i++){
            let el = r.args[i];
            if (SI_STRUCT.isValue(el) && el as number != 0){
                n /= el as number;
            }else if (SI_STRUCT.isValue(el) && el as number == 0){
                return Error("error: division by zero");
            }else{
                return Error("error: argument is not a literal: " + el);
            }
        }
        return n;
    } else{
        return null;
    }
}

// cond
// cond Redex => Value | BSL_AST.cond | Error
function cond (r: SI_STRUCT.CondRedex): BSL_AST.expr | Error{
    const clause = r.options[0];
    if (BSL_AST.isLiteral(clause.condition) && clause.condition.value == true){
        return clause.result;
    }else if (BSL_AST.isLiteral(clause.condition) && clause.condition.value == false){
        console.log("r.options", r.options);
        const newOptions:BSL_AST.Clause[] =  r.options.slice(1).map(el => {
            return {type: BSL_AST.Production.CondOption, condition: el.condition, result: el.result};
        });
        console.log("newOptions", newOptions);
        return {
            type: BSL_AST.Production.CondExpression,
            options: newOptions
        }
    }else{
        return Error("error: condition is not a boolean");
    }
}