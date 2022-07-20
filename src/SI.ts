import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";


// setUpStepperGUI
export function setUpStepperGui(program:BSL_AST.program, el: HTMLElement):void{
    const expr =  program[0] as BSL_AST.expr;
    console.log("expression", expr);
    const emptyStepper = {
        type: SI_STRUCT.Production.Stepper, 
        root: el, 
        originExpr: expr, 
        stepperTree: [],
    } as SI_STRUCT.Stepper;
    const stepper = calculateAllSteps(expr, emptyStepper);
    console.log("stepper", stepper);
    el.innerHTML = renderStepper(stepper);
    const prevButton = el.querySelector("#prevButton") as HTMLButtonElement;
    const nextButton = el.querySelector("#nextButton") as HTMLButtonElement;
    prevButton.addEventListener("click", previousStep);
    nextButton.addEventListener("click", nextStep);
}
// calculateAllSteps
// Literal | Expression, Stepper => Stepper
export function calculateAllSteps(expr: BSL_AST.expr | SI_STRUCT.Value, stepper: SI_STRUCT.Stepper):SI_STRUCT.Stepper{
    if(SI_STRUCT.isValue(expr)){
        return stepper;
    }else{
        const stepResult = calculateStep(expr) as SI_STRUCT.StepResult;
        const newExpr = SI_STRUCT.isValue(stepResult) ? stepResult as SI_STRUCT.Value : stepResult.plugResult.expr as BSL_AST.expr;
        const newStepper = {
            type: SI_STRUCT.Production.Stepper,
            root: stepper.root,
            originExpr: stepper.originExpr,
            stepperTree: [...stepper.stepperTree, stepResult]
        } as SI_STRUCT.Stepper;
        console.log("newExpr", newExpr);
        const allSteps = calculateAllSteps(newExpr, newStepper);
        allSteps.stepperTree.map((step, i) => step.currentStep = i);
        return allSteps;
    }
    
}
// calculateStep
// Expression => OneRule | KongRule | Done | Error

export function calculateStep(expr: BSL_AST.expr):SI_STRUCT.StepResult | SI_STRUCT.Value{
    const splitExpr = split(expr) as SI_STRUCT.SplitResult;
    console.log("splitExpr", splitExpr);
    if(SI_STRUCT.isSplit(splitExpr)){
        const stepExpr = step(splitExpr.redex) as SI_STRUCT.Value;
                // if context is Hole, 
        // no KONG RULE => no plug
        // return StepExpr
        // else 
        // Kong Rule => plug 
        // return (context, stepExpr, PlugExpr) => KongExpr
        const plugExpr = plug(stepExpr, splitExpr.context) as SI_STRUCT.PlugResult;
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
            const hole = {type: SI_STRUCT.Production.Hole} as SI_STRUCT.Hole; 
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
    }else if (BSL_AST.isCond(expr) || BSL_AST.isName(expr)){
        console.log("error: expr is either Cond, Name, or undefined");
        return Error("error: expr is either Cond, Name, or undefined") as Error;
    }else{
        return Error("error: something unexpected occured") as Error;
    }
}

// step

export function step(r: SI_STRUCT.Redex): SI_STRUCT.Value| Error{
    if(SI_STRUCT.isCallRedex(r)){
        if(prim(r) != false){
            return prim(r);
        }else{
            return Error("error: prim is not applicable");
        }
    }else{
        return Error("error: redex is not a call");
    }
}

// plug
// plug(Redex, c: Context): Expression, pRule
export function plug(evalExpr: SI_STRUCT.Value, c: SI_STRUCT.Context): SI_STRUCT.PlugResult | Error{
    //check if context is a Hole
    if (SI_STRUCT.isHole(c)){
        return {
            type: SI_STRUCT.Production.PlugResult,
            expr: evalExpr,
            rule: {
                type: SI_STRUCT.Production.Prim,
            }
        } as SI_STRUCT.PlugResult;
    }else{
        const finalExpr = {
            type: BSL_AST.Production.FunctionCall,
            name: c.op,
            args: [c.values, (plug(evalExpr, c.ctx) as SI_STRUCT.PlugResult).expr, c.args].flat() as BSL_AST.expr[]
        }
        console.log("finalExpr", finalExpr);
        return {
            type: SI_STRUCT.Production.PlugResult,
            expr: finalExpr as BSL_AST.expr,
            rule: {
                type: SI_STRUCT.Production.Kong,
                redexRule: {
                    type: SI_STRUCT.Production.Prim
                }
            }
        } as SI_STRUCT.PlugResult;
    }
}
/* //old
   }else if(SI_STRUCT.isHole(c.ctx)){
    const exprArgs = [c.values, evalExpr, c.args].flat() as BSL_AST.expr[];
    console.log("exprArgs", exprArgs);
    return {
        type: SI_STRUCT.Production.PlugResult,
        expr: {
            type: BSL_AST.Production.FunctionCall,
            name: c.op,
            args:exprArgs

        },
        rule: {
            type: SI_STRUCT.Production.Kong,
            redexRule: {
                type: SI_STRUCT.Production.Prim
            }
        }
    } as SI_STRUCT.PlugResult;
 */

// ####### ONE RULE FUNCTIONS #######

export function prim(r:SI_STRUCT.Redex): SI_STRUCT.Value | Error{
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
        console.log("n in /", n);
        return n;
    } else{
        return false;
    }

}

// ####### RENDER FUNCTIONS #######


function renderStepper(stepper: SI_STRUCT.Stepper): string{
    const stepperTree = stepper.stepperTree;
    const originExpr = stepper.originExpr;

    const str = 
    `<stepper>
        <div class="program-wrapper">
            Original Expression:
            <pre><code>${renderExpr(originExpr)}</code></pre>
        </div>
        <div class="step-result-wrapper">
        ${stepperTree.map(el => renderStepResult(stepperTree, el as SI_STRUCT.StepResult)).join("")}
        </div>
        <div class="buttons">
            <button class="step-button" id="prevButton" style="visibility: hidden">Previous Step</button>
            <button class="step-button" id="nextButton">Next Step</button>
        </div>
    </stepper>`;
    return str;
}
function renderStepResult(stepperTree: SI_STRUCT.StepResult[], stepResult: SI_STRUCT.StepResult): string{
    const currentStep = stepResult.currentStep;
    const programExpr = stepperTree.slice(0, currentStep).map(stepResult => stepResult.plugResult.expr); //renderExprs
    const splitResult = stepResult.splitResult; //renderSplitResult
    const plugResult = stepResult.plugResult; //renderPlugResult
    const str = `<div class="step-result" currentStep="${currentStep}" visible=${(currentStep == 0) ? "true" : "false"}>
                    <div class="program-overview">
                        Program Overview:
                        <ul>
                        ${programExpr.map(expr => SI_STRUCT.isValue(expr) ? renderValue(expr) : renderExpr(expr)).join("\n")}
                        </ul>
                    </div>
                    <div class="split-rule-plug">
                        <div class="split">
                            Split:
                            ${renderSplitResult(splitResult)}
                        </div>
                        ${renderPlugResult(plugResult)}
                    </div>
                </div>`;
        return str;
}

function renderExpr(expr: BSL_AST.expr):string{
    if(BSL_AST.isCall(expr)){
        const name = expr.name.symbol;
        const args = expr.args.map(arg => renderExpr(arg)).join(" ");
        const str = `(${name} ${args})`;
        return str;
    }else if(BSL_AST.isLiteral(expr)){
        const str = `${expr.value}`;
        return str;
    
    }else if(SI_STRUCT.isValue(expr)){
        const str = `${expr}`;
        return str;
    }else{
        console.error("error: expr is neither Call nor Literal: " + expr);
        return "Neither Call nor Literal";
    }
}
function renderValue(val: SI_STRUCT.Value): string{
    const str = `${val}`;
    return str;
}

function renderSplitResult(splitResult: SI_STRUCT.SplitResult): string{
    if (SI_STRUCT.isSplit(splitResult)){
        const redex = splitResult.redex;
        const context = splitResult.context;
        const redexStr = renderRedex(redex);
        const contextStr = (SI_STRUCT.isAppContext(context)) ? renderContext(context) : renderHole(context);
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

function renderPlugResult(plugResult: SI_STRUCT.PlugResult): string{
    const expr = plugResult.expr;
    const rule = plugResult.rule;
    const str = `
    <div class="rule">
        ${SI_STRUCT.isOneRule(rule) ? renderOneRule(rule) : renderKong(rule)}
    </div>
    <div class="plug">
        Plug Result: <pre><code>${SI_STRUCT.isValue(expr) ? renderValue(expr) : renderExpr(expr)}</code></pre>
    </div>`;
    return str;
}

function renderRedex(redex: SI_STRUCT.Redex): string{
    const name = redex.name.symbol;
    const args = redex.args.map(arg => renderValue(arg)).join(" ");
    const str = `<pre><code>(${name} ${args})</code></pre>`;
    return str;
}
function renderContext(context: SI_STRUCT.AppContext): string{
        const name = context.op ? context.op : "";
        const args = context.args.map(arg => SI_STRUCT.isValue(arg) ? renderValue(arg) : renderExpr(arg)).join(" ");
        const str = `<pre><code>(${name} ${args})</code></pre>`;
        return str;
}
function renderHole(hole: SI_STRUCT.Hole): string{
    return `<span class="hole">[    ]</span>`; 
}
function renderOneRule(rule: SI_STRUCT.OneRule): string{
    const type = rule.type;
    const str = `${type}`;
    console.log(str);
    return str;
}
function renderKong(rule: SI_STRUCT.Kong): string{
    const type = rule.type;
    //const context = rule.context;
    const redexRule = rule.redexRule;
    const str = `${type} with ${redexRule.type}:
                 ${renderOneRule(redexRule)} `; 
    return str;
}

// ####### EVENT HANDLER FUNCTIONS #######

//previous step und nextstep function (nicht zusammenfassen in einer function)
function previousStep(e:Event){
    const button = e.target as HTMLButtonElement;
    const wrapper = button.parentElement?.parentElement?.getElementsByClassName("step-result-wrapper")[0];
    const visibleResult = wrapper?.querySelector(".step-result[visible=true]") as HTMLDivElement;
    const prevVisibleResult = visibleResult?.previousElementSibling as HTMLDivElement;
    // change Visibility
    visibleResult?.setAttribute("visible", "false");
    prevVisibleResult?.setAttribute("visible", "true");
    // show next button if hidden
    const nextButton = button.parentElement?.querySelector("#nextButton") as HTMLButtonElement;
    if(nextButton.style.visibility == "hidden"){
        nextButton.setAttribute("style","visibility: visible");
    }
    if (prevVisibleResult?.getAttribute("currentStep") == "0"){
         button.setAttribute("style","visibility: hidden");
    }
}

function nextStep(e: Event): void{
    const button = e.target as HTMLButtonElement;
    const wrapper = button.parentElement?.parentElement?.getElementsByClassName("step-result-wrapper")[0];
    const visibleResult = wrapper?.querySelector(".step-result[visible=true]") as HTMLDivElement;
    const nextVisibleResult = visibleResult?.nextElementSibling as HTMLDivElement;
    const max = wrapper?.getElementsByClassName("step-result").length as number;
    // change Visibility
    visibleResult?.setAttribute("visible", "false");
    nextVisibleResult?.setAttribute("visible", "true");        
    // show prev button if hidden
    const prevButton = button.parentElement?.querySelector("#prevButton") as HTMLButtonElement;
    if(prevButton.style.visibility == "hidden"){
        prevButton.setAttribute("style","visibility: visible");
    }
    if (nextVisibleResult?.getAttribute("currentStep") == (max - 1).toString()){
         button.setAttribute("style","visibility: hidden");
     }
}