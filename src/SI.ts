import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";


// ParseStepper
export function setUpStepperGui(program:BSL_AST.program, el: HTMLElement):void{
    const expr =  program[0] as BSL_AST.expr;
    console.log("expression", expr);
    const emptyStepper = {
        type: SI_STRUCT.Production.Stepper, 
        root: el, 
        originExpr: expr, 
        stepperTree: [],
    } as SI_STRUCT.Stepper;
    const stepper = calculateAllSteps(expr, emptyStepper, 0);
    console.log("stepper", stepper);
    el.innerHTML = renderStepper(stepper);
    const prevButton = el.querySelector("#prevButton") as HTMLButtonElement;
    const nextButton = el.querySelector("#nextButton") as HTMLButtonElement;
    prevButton.addEventListener("click", previousStep);
    nextButton.addEventListener("click", nextStep);
}
// calculateAllSteps
// Literal | Expression, Stepper => Stepper
export function calculateAllSteps(expr: BSL_AST.expr, stepper: SI_STRUCT.Stepper, currentStep: number):SI_STRUCT.Stepper{
    if(BSL_AST.isLiteral(expr)){
        return stepper;
    }else{
        const stepResult = calculateStep(expr, currentStep) as SI_STRUCT.StepResult;
        const newExpr = BSL_AST.isLiteral(stepResult) ? stepResult as BSL_AST.Literal : stepResult.plugResult.expr as BSL_AST.expr;
        const newStepper = {
            type: SI_STRUCT.Production.Stepper,
            root: stepper.root,
            originExpr: stepper.originExpr,
            stepperTree: [...stepper.stepperTree, stepResult]
        } as SI_STRUCT.Stepper;
        console.log("newExpr", newExpr);
        const allSteps = calculateAllSteps(newExpr, newStepper, currentStep+1);
        console.log(allSteps);
        return allSteps;
    }
    
}
// calculateStep
// Expression => OneRule | KongRule | Done | Error

export function calculateStep(expr: BSL_AST.expr, currentStep: number):SI_STRUCT.StepResult | BSL_AST.Literal{
    const splitExpr = split(expr) as SI_STRUCT.SplitResult;
    if(SI_STRUCT.isSplit(splitExpr)){
        const stepExpr = step(splitExpr.redex) as BSL_AST.expr;
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
            plugResult: plugExpr,
            currentStep: currentStep
        } as SI_STRUCT.StepResult;
        return stepResult;
    }else{
        return expr as BSL_AST.Literal;
    }
}

//split
// Expression => SplitResult | Error
export function split (expr: BSL_AST.expr): SI_STRUCT.SplitResult | Error {
    if(BSL_AST.isCall(expr)){
        const name = expr.name;
        const args = expr.args;
        let count = 0;
        
        const valueLst = [] as BSL_AST.Literal[];
        const exprLst = [] as BSL_AST.expr[];
        // get all values from the left side
        for (let i = 0; i < args.length; i++) {
            let arg = args[i];
            if(BSL_AST.isLiteral(arg)){
                valueLst.push(arg);
            }else{
                count = i;
                break;
            }
        }
        //get all expressions from the right side
        for (let i = count + 1; i < args.length; i++) {
            let arg = args[i];
            if(BSL_AST.isExpr(arg)){
                exprLst.push(arg);
            }else{
                return new Error("split: argument is not an expression");
            }
        }

        // if there is no context, return Hole and redex
        if (count == 0){
            console.log("hole found: recursion end");
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
        // else get Split
    }else{
        const call = args[count] as BSL_AST.Call;
        const splitLst = [] as SI_STRUCT.Split[];
        const currentSplit = {
            type: SI_STRUCT.Production.Split,
            redex: {
                type: SI_STRUCT.Production.CallRedex,
                name: call.name,
                args: call.args
            },
            context: {
                type: SI_STRUCT.Production.AppContext,
                op: name,
                values: valueLst,
                ctx: (split(args[count])as SI_STRUCT.Split).context as SI_STRUCT.AppContext | SI_STRUCT.Hole,
                args: exprLst
            }
        } as SI_STRUCT.Split;
        splitLst.push(currentSplit, split(args[count]) as SI_STRUCT.Split);

        return {
            type: SI_STRUCT.Production.Split,
            redex: splitLst[splitLst.length - 1].redex,
            context: splitLst[0].context
        }
    }
    }else if (BSL_AST.isCond(expr) || BSL_AST.isName(expr)){
        console.log("error: expr is either Cond, Name, or undefined");
        return Error("error: expr is either Cond, Name, or undefined") as Error;
    }else{
        return Error("error: something unexpected occured") as Error;
    }
}
/* 
function searchRedex(originExpr:BSL_AST.expr, expr:BSL_AST.expr, hole: SI_STRUCT.Hole): SI_STRUCT.SplitResult | undefined {
    if(BSL_AST.isCall(expr)){
        const name = expr.name;
        const args = expr.args;
        const isCallArr = args.map(arg => (BSL_AST.isCall(arg) ? true : false));
        const anyCall = isCallArr.reduce((a, b) => a || b, false);
        console.log("anyCall",anyCall);
        //multiple level call
        if(anyCall){
            //where was the first call
            const firstCallIndex = isCallArr.indexOf(true);
            hole.index.push(firstCallIndex);
            console.log("hole", hole);
            //recursive call
            searchRedex(originExpr, args[firstCallIndex] as BSL_AST.expr, hole);
        //single level call
        }else{
            const split ={
                type: SI_STRUCT.Production.Split,
                redex: {
                    type: SI_STRUCT.Production.Redex,
                    name: name,
                    args: args
            },
            context: {
                type: SI_STRUCT.Production.Context,
                name: (originExpr as BSL_AST.Call).name,
                //concat hole with args
                args: setHolePosition(hole, originExpr as BSL_AST.Call, (originExpr as BSL_AST.Call).args)
                }
            } as SI_STRUCT.Split;
            console.log("split", split);
            return split;
        }
    }else if(BSL_AST.isLiteral(expr)){
        return expr;
    }
/*             return {
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
            } as SI_STRUCT.SplitResult; 
}
 */
/*  function setHolePosition(hole: SI_STRUCT.Hole, originExpr: BSL_AST.Call, argList: BSL_AST.expr[]): SI_STRUCT.exprOrHole[]{
    for(let i=0; i<argList.length; i++){
        let expr = argList[hole.index[i]];
        let argList = (expr as BSL_AST.Call).args;
    }

    
    // find hole in expr
    const newExpr = argList[hole.index.shift() as number]
    hole.index.length > 0;

        return setHolePosition(hole, originExpr, ;
    }
 */
// step

export function step(r: SI_STRUCT.Redex): BSL_AST.expr | Error{
    if(SI_STRUCT.isCallRedex(r)){
        if (r.name.symbol === "+"){
            // PRIM
            let n = 0;
            r.args.forEach(el => {
                if (BSL_AST.isLiteral(el)){
                    n += el.value as number;
                }else{
                    return Error("error: argument is not a literal: " + el);
                }
            });
            return {
                type: BSL_AST.Production.Literal,
                value: n
        }
        }else{
            return Error("error: Operation is not +");
        }
    }else{
        return Error("error: redex is not a call");
    }
}

// plug
// plug(Redex, c: Context): Expression, pRule
export function plug(evalExpr: BSL_AST.expr, c: SI_STRUCT.Context): SI_STRUCT.PlugResult | Error{

    //check if context is a Hole
    if (SI_STRUCT.isHole(c)){
        return {
            type: SI_STRUCT.Production.PlugResult,
            expr: evalExpr,
            rule: {
                type: SI_STRUCT.Production.Prim,
            }
        } as SI_STRUCT.PlugResult;
        //check if next Context is a Hole
    }else if(SI_STRUCT.isHole(c.ctx)){
        const exprArgs = [c.values, evalExpr, c.args].flat() as BSL_AST.expr[];
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
                        ${programExpr.map(expr => renderExpr(expr)).join("\n")}
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
        Plug Result: <pre><code>${renderExpr(expr)}</code></pre>
    </div>`;
    return str;
}

function renderRedex(redex: SI_STRUCT.Redex): string{
    const name = redex.name.symbol;
    const args = redex.args.map(arg => renderExpr(arg)).join(" ");
    const str = `<pre><code>(${name} ${args})</code></pre>`;
    return str;
}
function renderContext(context: SI_STRUCT.AppContext): string{
        const name = context.op ? context.op : "";
        const args = context.args.map(arg => renderExpr(arg)).join(" ");
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