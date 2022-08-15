import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";

// calculateAllSteps
// Value | Expression, Stepper => Stepper
export function calculateAllSteps(
    expr: BSL_AST.expr | SI_STRUCT.Value,
    stepper: SI_STRUCT.Stepper
): SI_STRUCT.Stepper | Error {
    if (SI_STRUCT.isValue(expr)) {
        return stepper;
    } else {
        const stepperTree = stepper.stepperTree;
        while (!SI_STRUCT.isValue(expr)) {
            const stepResult = calculateStep(expr);
            if (SI_STRUCT.isValue(stepResult)) {
                expr = stepResult;
            } else if (SI_STRUCT.isStepResult(stepResult)) {
                expr = stepResult.plugResult.expr;
                stepperTree.push(stepResult);
            } else {
                return stepResult;
            }
        }
        const newStepper: SI_STRUCT.Stepper = {
            type: SI_STRUCT.Production.Stepper,
            root: stepper.root,
            originExpr: stepper.originExpr,
            stepperTree: stepperTree,
        };
        newStepper.stepperTree.map((step, i) => (step.currentStep = i));
        return newStepper;
    }
}
// calculateStep
// Expression => OneRule | KongRule | Done | Error
// Kein Value sondern stattdessen nur StepResults
export function calculateStep(
    expr: BSL_AST.expr
): SI_STRUCT.StepResult | SI_STRUCT.Value | Error {
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
                    const stepResult: SI_STRUCT.StepResult = {
                        type: SI_STRUCT.Production.StepResult,
                        splitResult: splitExpr,
                        plugResult: plugExpr,
                        currentStep: 0,
                    };
                    return stepResult;
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
        // if there is no context, if all arguments are values
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
            // else get all expressions from the right side
        } else {
            /* for (let i = pos + 1; i < args.length; i++) {
                let arg = args[i];
                if (BSL_AST.isExpr(arg)) {
                    exprLst.push(arg);
                } else {
                    return new Error("split: argument is not an expression " + arg + i);
                }
            } */
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
            return Error("not implemented");
        }
    } else if (BSL_AST.isName(expr)) {
        console.log("error: expr is  Name, or undefined");
        return Error("error: expr is Name, or undefined");
    } else {
        return Error("error: something unexpected occured");
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
        const clause = r.options[0];
        const condResult = cond(r);
        if (BSL_AST.isExpr(condResult)) {
            return {
                type: SI_STRUCT.Production.CondRule,
                redex: r,
                result: condResult,
            };
        } else {
            return Error("error: cond is not applicable");
        }
        return Error("Cond not implemented yet");
    } else {
        return Error("error: redex is neither a call nor cond");
    }
}

// plug
// plug(oneRule, c: Context): Expression, pRule
export function plug(
    oneRule: SI_STRUCT.OneRule,
    c: SI_STRUCT.Context
): SI_STRUCT.PlugResult | Error {
    //check if context is a Hole
    if (SI_STRUCT.isHole(c)) {
        // Apply OneRule
        console.log("plug: oneRule", oneRule);
        return {
            type: SI_STRUCT.Production.PlugResult,
            expr: oneRule.result,
            rule: oneRule,
        };
    } else {
        //Apply OneRule with KONG RULE
        const plugResult = plug(oneRule, c.ctx);
        if (SI_STRUCT.isPlugResult(plugResult)) {
            const args = [
                c.values,
                plugResult.expr,
                c.args,
            ].flat();
            const newArgs = args.map(el => {
                if (SI_STRUCT.isValue(el)) {
                    const newEl: BSL_AST.Literal = {
                        type: BSL_AST.Production.Literal,
                        value: el,
                    };
                    return newEl;
                }
                else { return el; }
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
        } else {
            return plugResult;
        }
    }
}

// ####### ONE RULE FUNCTIONS #######
//TODO: refactor prim with map instead of for loop
export function prim(r: SI_STRUCT.CallRedex): SI_STRUCT.Value | null | Error {
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
    } else {
        return null;
    }
}

// cond
// cond Redex => Value | BSL_AST.cond | Error
function cond(r: SI_STRUCT.CondRedex): BSL_AST.expr | Error {
    const clause = r.options[0];
    if (BSL_AST.isLiteral(clause.condition) && clause.condition.value == true) {
        return clause.result;
    } else if (
        BSL_AST.isLiteral(clause.condition) &&
        clause.condition.value == false
    ) {
        console.log("r.options", r.options);
        const newOptions: BSL_AST.Clause[] = r.options.slice(1).map((el) => {
            return {
                type: BSL_AST.Production.CondOption,
                condition: el.condition,
                result: el.result,
            };
        });
        console.log("newOptions", newOptions);
        return {
            type: BSL_AST.Production.CondExpression,
            options: newOptions,
        };
    } else {
        return Error("error: condition is not a boolean");
    }
}
