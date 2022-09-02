import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";



// calculateAllSteps (for the whole program)
export function calculateProgram(program: BSL_AST.program, stepper: SI_STRUCT.Stepper): SI_STRUCT.Stepper | Error {
    const copyProgram = JSON.parse(JSON.stringify(program));
    const env: SI_STRUCT.Environment = new Map();
    while (copyProgram.length > 0) {
        //program.forEach
        let stepperTree: SI_STRUCT.ProgStep[] = stepper.stepperTree;
        let defOrExpr = copyProgram.shift();
        /*if (BSL_AST.isExpr(defOrExpr)) {
            let stepList = calculateExprSteps(defOrExpr, stepperTree);
            if (stepList instanceof Error) {
                return stepList;
            } else {
                stepperTree = stepList;
            }
        } else if (BSL_AST.isDefinition(defOrExpr)) {
            console.log("definition", defOrExpr);
            console.log("prog", prog(defOrExpr, env))
            let stepList = prog(defOrExpr, env);
            if (stepList instanceof Error) {
                return stepList;
            } else {
                let progResult = stepList;
                stepperTree.push(progResult);
                //return Error("error: definition not implemented");
            }
        }
        stepper.stepperTree = stepperTree; */
        //NEW APPROACH
        let progStep = calculateProgStep(defOrExpr, env);
        if (progStep instanceof Error) {
            return progStep;
        } else {
            stepperTree.push(progStep);
        }
        console.log("progStep", progStep);
        stepper.stepperTree = stepperTree;
    }
    const newStepper: SI_STRUCT.Stepper = {
        type: SI_STRUCT.Production.Stepper,
        root: stepper.root,
        originProgram: stepper.originProgram,
        stepperTree: stepper.stepperTree,
    };
    //newStepper.stepperTree.map((step, i) => (step.currentStep = i));
    return newStepper;
}

// calculate ProgStep
// line is a line of program code -> ProgStep | Error
export function calculateProgStep(defOrExpr: BSL_AST.expr | BSL_AST.definition, env: SI_STRUCT.Environment): SI_STRUCT.ProgStep | Error {
        if (BSL_AST.isExpr(defOrExpr)) {
            let stepList = calculateExprSteps(defOrExpr);
            if (stepList instanceof Error) {
                return stepList;
            } else {
                return {
                    type: SI_STRUCT.Production.ProgStep,
                    stepList: stepList,
                };
            }
        } else{
            console.log("definition", defOrExpr);
            console.log("prog", calculateDefSteps(defOrExpr, env))
            let stepList = calculateDefSteps(defOrExpr, env);
            if (stepList instanceof Error) {
                return stepList;
            } else {
                return {
                    type: SI_STRUCT.Production.ProgStep,
                    stepList: stepList,
                };
            }
        }
    }
//prog
//definition, Environment => SI_STRUCT.DefStep
 export function calculateDefSteps(
    def: BSL_AST.definition,
    env: SI_STRUCT.Environment
): SI_STRUCT.DefinitionStep[] | Error {
    if (BSL_AST.isConstDef(def)) {
        const name = def.name;
        const value = def.value;
        if (name.symbol in env) {
            return Error("prog: name already bound");
        } else {
            const newEnv = new Map(env);
            env.set(name.symbol, value);
            let stepList: SI_STRUCT.DefinitionStep[] = [];
            stepList.push({
                type: SI_STRUCT.Production.DefinitionStep,
                env: newEnv,
                result: def,
                rule: {
                    type: SI_STRUCT.Production.ProgRule,
                    definition: def},
            });
            return stepList;
        }
    } else if (BSL_AST.isFunDef(def)) {
        const name = def.name;
        const args = def.args;
        const body = def.body;
        if (name.symbol in env) {
            return Error("prog: name already bound");
        } else {
            return Error("prog: function definition not defined");
        }
    } else {
        return Error("prog: struct definition not defined");
    }
}
// calculateExprSteps
// expr, steppResult[] => exprStep[] | Error
export function calculateExprSteps(
    expr: BSL_AST.expr | SI_STRUCT.Value
): SI_STRUCT.ExprStep[] | Error {
    let stepList: SI_STRUCT.ExprStep[] = [];
    if (SI_STRUCT.isValue(expr)) {
        return stepList;
    } else {
        while (!SI_STRUCT.isValue(expr)) {
            const step = evaluateExpression(expr)
            if (SI_STRUCT.isValue(step)) {
                expr = step;
            } else if (SI_STRUCT.isExprStep(step)) {
                expr = step.result;
                stepList.push(step);
            } else {
                return step;
            }
        }
        return stepList;
    }
}

//evaluateExpression

export function evaluateExpression(expr: BSL_AST.expr): SI_STRUCT.ExprStep | SI_STRUCT.Value | Error {
    if (BSL_AST.isLiteral(expr)) {
        return expr.value;
    } else {
        const splitExpr = split(expr);
        //console.log("splitExpr", splitExpr);
        if (SI_STRUCT.isSplit(splitExpr)) {
            const stepExpr = step(splitExpr.redex);
            //console.log("stepExpr", stepExpr);
            if (SI_STRUCT.isOneRule(stepExpr)) {
                const exprStep = plug(stepExpr, splitExpr.context);
                console.log("exprStep", exprStep);
                if (SI_STRUCT.isExprStep(exprStep)) {
                    return exprStep;
                } else {
                    return exprStep;
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
        valueMap.forEach((el, i) => {
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
            if(newOptions.length < 1) {
              return Error('error: no Cond-Option applies');
            }
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
// plug(oneRule, c: Context): ExprStep | Error
export function plug(
    oneRule: SI_STRUCT.OneRule,
    c: SI_STRUCT.Context
): SI_STRUCT.ExprStep | Error {
    //check if context is a Hole
    if (SI_STRUCT.isHole(c)) {
        // Apply OneRule
        //console.log("plug: oneRule", oneRule);
        return {
            type: SI_STRUCT.Production.ExprStep,
            env: new Map(),
            rule: oneRule,
            result: oneRule.result,
        };
    } else {
        //Apply OneRule with KONG RULE
        const plugResult = plug(oneRule, c.ctx);
        //console.log("plug: plugResult", plugResult);
        if (SI_STRUCT.isStep(plugResult)) {
            //AppContext
            if (SI_STRUCT.isAppContext(c)) {
                const args = [
                    c.values,
                    plugResult.result,
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
                    type: SI_STRUCT.Production.ExprStep,
                    env: new Map(),
                    rule: {
                        type: SI_STRUCT.Production.Kong,
                        context: c,
                        redexRule: oneRule,
                    },
                    result: finalExpr
                };
                //CondContext
            } else if (SI_STRUCT.isCondContext(c)) {
                const options = c.options;
                const expr: BSL_AST.expr = (SI_STRUCT.isValue(plugResult.result)) ? { type: BSL_AST.Production.Literal, value: plugResult.result } : plugResult.result;
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
                    type: SI_STRUCT.Production.ExprStep,
                    env: new Map(),
                    rule: {
                        type: SI_STRUCT.Production.Kong,
                        context: c,
                        redexRule: oneRule,
                    },
                    result: finalExpr,
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
