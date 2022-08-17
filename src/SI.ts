import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";



// calculateAllSteps (for the whole program)
export function calculateProgram(program: BSL_AST.program, stepper:SI_STRUCT.Stepper): SI_STRUCT.Stepper | Error{
    const copyProgram = JSON.parse(JSON.stringify(program));
    while (copyProgram.length > 0) {
        let stepperTree: SI_STRUCT.StepResult[] = stepper.stepperTree;
        let defOrExpr = copyProgram.shift();
        if (BSL_AST.isExpr(defOrExpr)){
             let stepperTreeMaybe = calculateExprSteps(defOrExpr, stepperTree);
                if (stepperTreeMaybe instanceof Error) {
                    return stepperTreeMaybe;
                }else{
                    stepperTree = stepperTreeMaybe;
                }
        }else if (BSL_AST.isDefinition(defOrExpr)) {
            //stepperTree = prog(defOrExpr, stepperTree);
            return Error("calculateStep : definition not allowed, you didnt think it was that easy, did you?");
        }else {
            return Error("calculateStep: neither expression nor definition; how did you get here?");
        }
        stepper.stepperTree = stepperTree;
    }
    const newStepper: SI_STRUCT.Stepper = {
        type: SI_STRUCT.Production.Stepper,
        root: stepper.root,
        originProgram: stepper.originProgram,
        stepperTree: stepper.stepperTree,
    };
    newStepper.stepperTree.map((step, i) => (step.currentStep = i));
    return newStepper;
}
// calculateExprSteps
// expr, steppResult[] => stepResult[] | Error
export function calculateExprSteps(
    expr: BSL_AST.expr | SI_STRUCT.Value,
    stepperTree: SI_STRUCT.StepResult[]
): SI_STRUCT.StepResult[] | Error {
    if (SI_STRUCT.isValue(expr)) {
        return stepperTree;
    } else {
        while (!SI_STRUCT.isValue(expr)) {
            const stepResult = evaluateExpression(expr)
            if (SI_STRUCT.isValue(stepResult)) {
                expr = stepResult;
            } else if (SI_STRUCT.isStepResult(stepResult)) {
                expr = stepResult.plugResult.expr;
                stepperTree.push(stepResult);
            } else {
                return stepResult;
            }
        }
        return stepperTree;
    }
}

//evaluateExpression

export function evaluateExpression(expr: BSL_AST.expr): SI_STRUCT.ExprStep | SI_STRUCT.Value | Error {
    if (BSL_AST.isLiteral(expr)) {
        return expr.value;
    } else {
        const splitExpr = split(expr);
        console.log("splitExpr", splitExpr);
        if (SI_STRUCT.isSplit(splitExpr)) {
            const stepExpr = step(splitExpr.redex);
            console.log("stepExpr", stepExpr);
            if (SI_STRUCT.isOneRule(stepExpr)) {
                const plugExpr = plug(stepExpr, splitExpr.context);
                console.log("plugExpr", plugExpr);
                if (SI_STRUCT.isPlugResult(plugExpr)) {
                    const exprStep: SI_STRUCT.ExprStep = {
                        type: SI_STRUCT.Production.ExprStep,
                        splitResult: splitExpr,
                        plugResult: plugExpr,
                        currentStep: 0,
                    };
                    return exprStep;
                } else {
                    return plugExpr;
                }
            } else {
                return stepExpr;
            }
        } else {
            return splitExpr;
        }
    }
}
//prog
// Definition => void | Error
//split
// Expression = > SplitResult | Error
export function split(expr: BSL_AST.expr): SI_STRUCT.SplitResult | Error {
    const hole: SI_STRUCT.Hole = { type: SI_STRUCT.Production.Hole };
    if (BSL_AST.isCall(expr)) {
        const name = expr.name;
        const args = expr.args;
        const valueLst: SI_STRUCT.Value[] = [];
        const exprLst: BSL_AST.expr[] = [];
        // find position with map
        let pos = -1;
        let posFound = false;
        const valueMap = args.map((arg, i) => {
            if (!posFound && BSL_AST.isLiteral(arg)) {
                return "left";
            } else if (!posFound && !BSL_AST.isLiteral(arg)) {
                posFound = true;
                pos = i;
                return "middle";
            } else {
                return "right";
            }
        });
        valueMap.map((el, i) => {
            if (el == "left") {
                valueLst.push((args[i] as BSL_AST.Literal).value);
            } else if (el == "right") {
                exprLst.push(args[i]);
            }
        });
        // if there is no context, all arguments are values and the result is a value
        if (pos == -1) {
            const redex: SI_STRUCT.CallRedex = {
                type: SI_STRUCT.Production.CallRedex,
                name: name,
                args: valueLst,
            };
            return {
                type: SI_STRUCT.Production.Split,
                redex: redex,
                context: hole,
            };
            // else there is a context and the result is an expression
        } else {
            const expr: BSL_AST.expr = args[pos];
            const splitResult = split(expr);
            if (SI_STRUCT.isSplit(splitResult)) {
                return {
                    type: SI_STRUCT.Production.Split,
                    redex: splitResult.redex,
                    context: {
                        type: SI_STRUCT.Production.AppContext,
                        op: name,
                        values: valueLst,
                        ctx: splitResult.context,
                        args: exprLst,
                    },
                };
            } else {
                return splitResult;
            }
        }
    } else if (BSL_AST.isCond(expr)) {
        const clause = expr.options[0];
        // if condition is already reduced, build CondRedex
        if (BSL_AST.isLiteral(clause.condition)) {
            return {
                type: SI_STRUCT.Production.Split,
                redex: {
                    type: SI_STRUCT.Production.CondRedex,
                    options: expr.options,
                },
                context: hole,
            };
        }
        // else split condition
        else {
            const splitResult = split(clause.condition);
            if (SI_STRUCT.isSplit(splitResult)) {
                return {
                    type: SI_STRUCT.Production.Split,
                    redex: splitResult.redex,
                    context: {
                        type: SI_STRUCT.Production.CondContext,
                        options: expr.options,
                        ctx: splitResult.context,
                    },
                };
            } else {
                return splitResult;
            }
        }
    } else if (BSL_AST.isName(expr)) {
        console.log("split: expr is  Name");
        return Error("split: expr is Name");
    } else {
        return Error("split: something unexpected occured");
    }
}

// step
// Redex => OneRule | Error
export function step(r: SI_STRUCT.Redex): SI_STRUCT.OneRule | Error {
    if (SI_STRUCT.isCallRedex(r)) {
        const primResult = prim(r);
        if (SI_STRUCT.isValue(primResult)) {
            return {
                type: SI_STRUCT.Production.Prim,
                redex: r,
                result: primResult,
            };
        } else {
            return Error("error: prim is not applicable");
        }
    } else if (SI_STRUCT.isCondRedex(r)) {
        const condResult = cond(r);
        if (condResult == undefined) {
            const newOptions = r.options.slice(1);
            const newExpr: BSL_AST.Cond = {
                type: BSL_AST.Production.CondExpression,
                options: newOptions,
            };
            return {
                type: SI_STRUCT.Production.CondFalse,
                redex: r,
                result: newExpr,
            };
        } else if (BSL_AST.isExpr(condResult)) {
            return {
                type: SI_STRUCT.Production.CondTrue,
                redex: r,
                result: condResult,
            };
        } else {
            return Error("error: cond is not applicable");
        }

    } else {
        return Error("error: redex is neither a call nor cond");
    }
}

// plug
// plug(oneRule, c: Context): PlugResult | Error
export function plug(
    oneRule: SI_STRUCT.OneRule,
    c: SI_STRUCT.Context
): SI_STRUCT.PlugResult | Error {
    //check if context is a Hole
    if (SI_STRUCT.isHole(c)) {
        // Apply OneRule
        //console.log("plug: oneRule", oneRule);
        return {
            type: SI_STRUCT.Production.PlugResult,
            expr: oneRule.result,
            rule: oneRule,
        };
    } else {
        //Apply OneRule with KONG RULE
        const plugResult = plug(oneRule, c.ctx);
        //console.log("plug: plugResult", plugResult);
        if (SI_STRUCT.isPlugResult(plugResult)) {
            //AppContext
            if (SI_STRUCT.isAppContext(c)) {
                const args = [
                    c.values,
                    plugResult.expr,
                    c.args,
                ].flat();
                const newArgs = args.map(arg => {
                    if (SI_STRUCT.isValue(arg)) {
                        const newArg: BSL_AST.Literal = {
                            type: BSL_AST.Production.Literal,
                            value: arg,
                        };
                        return newArg;
                    } else {
                        return arg;
                    }
                });
                const finalExpr: BSL_AST.Call = {
                    type: BSL_AST.Production.FunctionCall,
                    name: c.op,
                    args: newArgs,
                };
                //console.log("finalExpr", finalExpr);
                return {
                    type: SI_STRUCT.Production.PlugResult,
                    expr: finalExpr,
                    rule: {
                        type: SI_STRUCT.Production.Kong,
                        redexRule: oneRule,
                    },
                };
                //CondContext
            } else if (SI_STRUCT.isCondContext(c)) {
                const options = c.options;
                const expr: BSL_AST.expr = (SI_STRUCT.isValue(plugResult.expr)) ? { type: BSL_AST.Production.Literal, value: plugResult.expr } : plugResult.expr;
                const firstClause: BSL_AST.Clause = {
                    type: BSL_AST.Production.CondOption,
                    condition: expr,
                    result: options[0].result,
                };
                const newOptions = [firstClause, ...options.slice(1)];
                const finalExpr: BSL_AST.Cond = {
                    type: BSL_AST.Production.CondExpression,
                    options: newOptions,
                };
                return {
                    type: SI_STRUCT.Production.PlugResult,
                    rule: {
                        type: SI_STRUCT.Production.Kong,
                        redexRule: oneRule,
                    },
                    expr: finalExpr,
                };


            } else {
                return Error("plug: context is not an AppContext or CondContext");
            }
        } else {
            return plugResult;
        }
    }
}

// ####### ONE RULE FUNCTIONS #######
//TODO: refactor prim with map instead of for loop
export function prim(r: SI_STRUCT.CallRedex): SI_STRUCT.Value | Error {
    // + - * /
    if (r.name.symbol === "+") {
        let n = 0;
        r.args.forEach((el) => {
            if (typeof el == "number") {
                n += el;
            } else {
                return Error("error: argument is not a number: " + el);
            }
        });
        return n;
    } else if (r.name.symbol === "*") {
        let n = 1;
        r.args.forEach((el) => {
            if (typeof el == "number") {
                n *= el;
            } else {
                return Error("error: argument is not a number: " + el);
            }
        });
        return n;
    } else if (r.name.symbol === "-") {
        let n = r.args[0];
        for (let i = 1; i < r.args.length; i++) {
            let el = r.args[i];
            if (typeof el == "number" && typeof n == "number") {
                n -= el;
            } else {
                return Error("error: argument is not a number: " + r.args[i]);
            }
        }
        return n;
    } else if (r.name.symbol === "/") {
        let n = r.args[0];
        for (let i = 1; i < r.args.length; i++) {
            let el = r.args[i];
            if (typeof n == "number" && typeof el == "number" && el != 0) {
                n /= el;
            } else if (el == 0) {
                return Error("error: division by zero");
            } else {
                return Error("error: argument is not a number: " + el);
            }
        }
        return n;
    }
    // and, or, not
    else if (r.name.symbol === "and") {
        if (r.args.every(el => typeof el == "boolean")) {
            if (r.args.length >= 2) {
                if (r.args.every(el => el)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return Error("prim: 'and' needs at least two arguments");
            }
        } else {
            return Error("prim: 'and' needs boolean arguments");
        }
    } else if (r.name.symbol === "or") {
        if (r.args.every(el => typeof el == "boolean")) {
            if (r.args.length >= 2) {
                if (r.args.some(el => el)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return Error("prim: 'or' needs at least two arguments");
            }
        } else {
            return Error("prim: 'or' needs boolean arguments");
        }
    } else if (r.name.symbol === "not") {
        if (typeof r.args[0] == "boolean") {
            if (r.args.length == 1) {
                return !r.args[0];
            } else {
                return Error("prim: 'not' needs exactly one argument");
            }
        } else {
            return Error("prim: 'not' needs boolean argument");
        }
    } else {
        return Error("prim: this function is not implemented");
    }
}

// cond
// cond Redex =>  BSL_AST.expr | false
function cond(r: SI_STRUCT.CondRedex): BSL_AST.expr | undefined | Error {
    const clause = r.options[0];
    if (BSL_AST.isLiteral(clause.condition) && clause.condition.value == true) {
        return clause.result;
    } else if (
        BSL_AST.isLiteral(clause.condition) &&
        clause.condition.value == false
    ) {
        return undefined;
    } else {
        return Error("error: condition is not a boolean");
    }
}


/* OLD CODE */

/* for (let i = pos + 1; i < args.length; i++) {
    let arg = args[i];
    if (BSL_AST.isExpr(arg)) {
        exprLst.push(arg);
    } else {
        return new Error("split: argument is not an expression " + arg + i);
    }
} */
/* for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (BSL_AST.isLiteral(arg)) {
        valueLst.push(arg.value);
    } else if (SI_STRUCT.isValue(arg)) {
        valueLst.push(arg);
    } else {
        pos = i;
        break;
    }
} */