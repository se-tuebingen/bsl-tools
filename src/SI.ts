import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";


// ParseStepper
export function parseStepper(program:BSL_AST.program, el: HTMLElement):void{
    const expr =  program[0] as BSL_AST.expr;
    console.log("expression", expr);
    const emptyStepper = {
        type: SI_STRUCT.Production.Stepper, 
        root: el, 
        originExpr: expr, 
        stepperTree: [],
        currentStep: 0
    } as SI_STRUCT.Stepper;
    const stepper = calculateAllSteps(expr, emptyStepper);
    console.log("stepper", stepper);
    el.innerHTML = renderStepper(stepper);
}
// calculateAllSteps
// Literal | Expression, Stepper => Stepper
export function calculateAllSteps(litOrExpr: BSL_AST.Literal | BSL_AST.expr, stepper: SI_STRUCT.Stepper):SI_STRUCT.Stepper{
    if(BSL_AST.isLiteral(litOrExpr)){
        return stepper;
    }else{
        const stepResult = calculateStep(litOrExpr);
        const newExpr = BSL_AST.isLiteral(stepResult) ? stepResult as BSL_AST.Literal : stepResult.plugResult.expr as BSL_AST.expr;
        const newStepper = {
            type: SI_STRUCT.Production.Stepper,
            root: stepper.root,
            originExpr: stepper.originExpr,
            stepperTree: [...stepper.stepperTree, stepResult],
            currentStep: stepper.currentStep
        } as SI_STRUCT.Stepper;
        return calculateAllSteps(newExpr, newStepper);
    }
    
}
// calculateStep
// Expression => StepResult
export function calculateStep(expr: BSL_AST.expr):SI_STRUCT.StepResult | BSL_AST.Literal{
    const splitExpr = split(expr) as SI_STRUCT.SplitResult;
    if(SI_STRUCT.isSplit(splitExpr)){
        const stepExpr = step(splitExpr.redex) as SI_STRUCT.OneRule;
        const plugExpr = plug(stepExpr, splitExpr.context) as SI_STRUCT.PlugResult;
        const stepResult = {
            type: SI_STRUCT.Production.StepResult,
            splitResult: splitExpr,
            plugResult: plugExpr
        } as SI_STRUCT.StepResult;
        return stepResult;
    }else{
        return expr as BSL_AST.Literal;
    }
}

//split
export function split (expr: BSL_AST.expr): SI_STRUCT.SplitResult | undefined {
    if(BSL_AST.isCall(expr)){
        const name = expr.name;
        const args = expr.args;
        const hole = {type: "Hole", index: 0};
        console.log("split", expr);
        for (let i = 0; i < args.length; i++){
            if (BSL_AST.isCall(args[i])){
                const call = args[i] as BSL_AST.Call;
                hole.index = i;
                return {
                    type: SI_STRUCT.Production.Split,
                    redex: {
                        type: SI_STRUCT.Production.Redex,
                        name: call.name,
                        args: call.args
                },
                context: {
                    type: SI_STRUCT.Production.Context,
                    name: name,
                    //concat hole with args
                    args: [...args.slice(0, i), hole, ...args.slice(i + 1)] as SI_STRUCT.exprOrHole[]
                    }
                } 
            }   
        }
        return {
            type: SI_STRUCT.Production.Split,
            redex: {
                type: SI_STRUCT.Production.Redex,
                name: name,
                args: args
            },
            context: {
                type: SI_STRUCT.Production.Context,
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

export function step(r: SI_STRUCT.Redex): SI_STRUCT.OneRule | undefined{
    if (r.name.symbol === "+"){
        // PRIM
        let n = 0;
        r.args.forEach(el => {
            if (BSL_AST.isLiteral(el)){
                n += el.value as number;
            }else{
                console.error("error: argument is not a literal: " + el);
                return undefined;
            }
        });
        return {
            type: SI_STRUCT.Production.Prim,
            redex: r,
            literal: {
                type: BSL_AST.Production.Literal,
                value: n
            }
    }
    }else{
        console.error("error: Operation is not +");
        return undefined;
    }
}

// plug

export function plug(pRule: SI_STRUCT.OneRule, c: SI_STRUCT.Context): SI_STRUCT.PlugResult | undefined{
    const args = c.args;
    const name = c.name;
    const r_val = pRule.literal;
    for(let i=0; i < args.length; i++){
        if(name == null){
            return{
                type: SI_STRUCT.Production.PlugResult,
                rule: pRule,
                expr: r_val
            }
        }
        else if (SI_STRUCT.isHole(args[i])){
            const new_args = [...args.slice(0, i), r_val, ...args.slice(i + 1)] as BSL_AST.expr[];
            const expr = {
                type: BSL_AST.Production.FunctionCall,
                name: name as BSL_AST.Name,
                args: new_args
            } as BSL_AST.expr;
            const rule :SI_STRUCT.Kong = {
                type: SI_STRUCT.Production.Kong,
                context: c,
                redexRule: pRule
            }
            return {
                type: SI_STRUCT.Production.PlugResult,
                rule: rule,
                expr: expr
            } as SI_STRUCT.PlugResult;
        }
    }
    console.error("error: no hole found");
    return undefined;
}



// ####### RENDER FUNCTIONS #######


function renderStepper(stepper: SI_STRUCT.Stepper): string{
    const stepperTree = stepper.stepperTree;
    const originExpr = stepper.originExpr;
    const currentStep = stepper.currentStep;
    const programExpr = stepperTree.slice(0, currentStep).map(stepResult => stepResult.plugResult.expr); //renderExprs
    const splitResult = stepperTree[currentStep].splitResult; //renderSplitResult
    const rule = stepperTree[currentStep].plugResult.rule; //renderRule
    const pluggedExpr = stepperTree[currentStep].plugResult.expr;
    const str = 
    `<stepper>
        <div class="program-wrapper">
            Original Expression:
            <pre><code>${renderExpr(originExpr)}</code></pre>
        </div>
        <div class="eval-wrapper">
            <div class="program-overview">
                <ul>
                ${programExpr.map(expr => renderExpr(expr)).join("\n")}
                </ul>
            </div>
            <div class="split-rule-plug">
                <div class="split">
                    Split:
                    ${renderSplitResult(splitResult)}
                </div>
                <div class="rule">
                    ${SI_STRUCT.isOneRule(rule) ? renderOneRule(rule) : renderProgStep(rule)}
                </div>
                <div class="plug">
                    Plug Result: <pre><code>${renderExpr(pluggedExpr)}</code></pre>
                </div>
            </div>
        </div>
    </stepper>`;
    return str;
}

function renderExpr(expr: BSL_AST.expr):string{
    if(BSL_AST.isCall(expr)){
        const name = expr.name.symbol;
        const args = expr.args.map(arg => renderExpr(arg)).join(" ");
        const str = `(${name} ${args})`;
        return str;
    }else if(BSL_AST.isLiteral(expr)){
        const value = expr.value;
        const str = `${value}`;
        return str;
    }else{
        console.error("error: expr is neither Call nor Literal");
        return "Neither Call nor Literal";
    }
}

function renderSplitResult(splitResult: SI_STRUCT.SplitResult): string{
    if (SI_STRUCT.isSplit(splitResult)){
        const redex = splitResult.redex;
        const context = splitResult.context;
        const redexStr = renderRedex(redex);
        const contextStr = renderContext(context);
        const str = `
        <div class="context">
            Context: ${contextStr}
        </div>
        <div class="redex">
            Redex: ${redexStr}
        </div>`;
        return str;
    } else{
        return `${splitResult}`;
    }
}

function renderRedex(redex: SI_STRUCT.Redex): string{
    const name = redex.name.symbol;
    const args = redex.args.map(arg => renderExpr(arg)).join(" ");
    const str = `<pre><code>(${name} ${args})</code></pre>`;
    return str;
}
function renderContext(context: SI_STRUCT.Context): string{
    const name = context.name ? context.name.symbol : "";
    const args = context.args.map(arg => (BSL_AST.isExpr(arg)) ? renderExpr(arg) : `<span class="hole">[    ]</span>`).join(" ");
    const str = `<pre><code>(${name} ${args})</code></pre>`;
    return str;
}
function renderOneRule(rule: SI_STRUCT.OneRule): string{
    const type = rule.type;
    const str = `${type}
                Redex:
                ${renderRedex(rule.redex)}
                Evaluated Redex:
                <pre><code>${renderExpr(rule.literal)}</code></pre>`;
    console.log(str);
    return str;
}
function renderProgStep(rule: SI_STRUCT.ProgStepRule): string{
    const type = rule.type;
    const context = rule.context;
    const redexRule = rule.redexRule;
    const str = `<p>${type} with ${redexRule.type}:</p>
                 ${renderContext(context)} 
                 ${renderOneRule(redexRule)} `; 
    return str;
}

/* //render original expression
const div = document.createElement("div");
div.className = "origin";
div.innerHTML = el.innerHTML;
el.innerHTML = "";
el.appendChild(div);

// render splitted expression
const split = document.createElement("div");
split.className = "split";
el.appendChild(split);

// render context
const context = document.createElement("div");
context.className = "context";
split.appendChild(context);

// render redex
const redex = document.createElement("div");
redex.className = "redex";
split.appendChild(redex);

//render plugged expression
const plug = document.createElement("div");
plug.className = "plug";
el.appendChild(plug); */


// ####### EVENT HANDLER FUNCTIONS #######