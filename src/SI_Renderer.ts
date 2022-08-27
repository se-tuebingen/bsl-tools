import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";
import { parse } from './BSL_Parser';
import { dirtify } from './Production_Tree';
import { default as small_interpreter_css } from './ressources/small-interpreter.css';
import { calculateProgram, plug } from './SI';

// main function processing steppers
export function processSteppers() {
    Array.from(document.getElementsByTagName('stepper')).map(el => {
        try {
            const program: BSL_AST.program = parse(dirtify(el.innerHTML));
            setUpStepperGui(program, el as HTMLElement);
        } catch (e: any) {
            console.error(e);
            el.innerHTML = `${e}`;
            (el as HTMLElement).style.cssText = `
        padding: 2em;
        color: darkred;
        display: block;
      `;
        }
    });
}

// setUpStepperGUI
export function setUpStepperGui(program: BSL_AST.program, el: HTMLElement): void {
    // add css if necessary
    if (!document.getElementById('bsl-tools-stepper-style')) {
        const styleNode = document.createElement('style');
        styleNode.innerHTML = small_interpreter_css;
        styleNode.id = 'bsl-tools-stepper-style';
        document.getElementsByTagName('head')[0].appendChild(styleNode);
    }
    const emptyStepper: SI_STRUCT.Stepper = {
        type: SI_STRUCT.Production.Stepper,
        root: el,
        originProgram: program,
        stepperTree: [],
    };
    const stepper = calculateProgram(program, emptyStepper);
    console.log("stepper", stepper);
    if (SI_STRUCT.isStepper(stepper)) {
        el.innerHTML = renderStepper(stepper);
        const prevButton = el.querySelector("#prevButton") as HTMLButtonElement;
        const nextButton = el.querySelector("#nextButton") as HTMLButtonElement;
        prevButton.addEventListener("click", previousStep);
        nextButton.addEventListener("click", nextStep);
    } else {
        console.error(stepper);
        el.innerHTML = `${stepper}`;
        (el as HTMLElement).style.cssText = `
          padding: 2em;
          color: darkred;
          display: block;
        `;
    }
}

// ####### RENDER FUNCTIONS #######


function renderStepper(stepper: SI_STRUCT.Stepper): string {
    const stepperTree: SI_STRUCT.ProgStep[] = stepper.stepperTree;
    const originProgram: BSL_AST.defOrExpr[] = stepper.originProgram;
    console.log("originProgram", originProgram);
    const str =
        `<stepper>
        <div class="program-wrapper">
            Original Program:
            <pre><code>${originProgram.map(defOrExpr => (BSL_AST.isExpr(defOrExpr)) ? renderExpr(defOrExpr) : renderDef(defOrExpr)).join("\n")}</code></pre>
        </div>
        <div class="step-result-wrapper">
        ${renderProgStep(stepperTree[0])}
        </div>
        <div class="buttons">
            <button class="step-button" id="prevButton" style="visibility: hidden">Previous Step</button>
            <button class="step-button" id="nextButton">Next Step</button>
        </div>
    </stepper>`;
    return str;
}
function renderProgStep(step: SI_STRUCT.ProgStep): string {
    const stepList = step.stepList;
    const str = `
    <div class="step">
        ${stepList.map(step => SI_STRUCT.isExprStep(step) ? renderExprStep(stepList, step) : /*renderDefStep(step)*/"").join("\n")}
    </div>`;
    return str;
}

// function renderStepDef(stepperTree: SI_STRUCT.ProgStep[], ProgStep: SI_STRUCT.DefinitionStep): string {
//     const definition = ProgStep.result;
//     const currentStep = ProgStep;
//     const str = `<div class="step-result" currentStep="${currentStep}" visible=${(currentStep == 0) ? "true" : "false"}>
//                     <div class="program-overview">
//                         Program Overview:
//                         <ul>
//                         ${stepperTree.map(step =>
//         (step.currentStep <= currentStep) ? (
//             (SI_STRUCT.isExprStep(step) ?
//                 (SI_STRUCT.isValue(step.plugResult.expr) ? renderValue(step.plugResult.expr) : renderExpr(step.plugResult.expr))
//                 : renderDef(step.definition))) : "").join("<br>")}
//                         </ul>
//                     </div>
//                     <div class="split-rule-plug">
//                         PROG:
//                         ${renderDef(definition)}
//                     </div>
//                 </div>`;
//     return str;
// }
function renderExprStep(stepList: SI_STRUCT.Step[], step: SI_STRUCT.ExprStep): string {
    const rule = step.rule; //renderSplitResult
    const index = stepList.indexOf(step);
    const result = step.result; //renderPlugResult
    const str = `<div class="step-result" currentStep="${index}" visible=${(index == 0) ? "true" : "false"}>
                    <div class="program-overview">
                        Program Overview:
                        <ul>
                        ${stepList.map((step,i) => 
        ( i <= index) ? (
            (SI_STRUCT.isExprStep(step) ?
                (SI_STRUCT.isValue(step.result) ? renderValue(step.result) : renderExpr(step.result))
                : renderDef(step.result))) : "").join("<br>")}
                        </ul>
                    </div>
                    <div class="split-rule-plug">
                        <div class="split">
                            Split:
                            <div class="context">
                            Context: ${SI_STRUCT.isKong(rule) ? renderContext(rule.context) : "[ ]"}
                            </div>
                            <div class="redex">
                                Redex: ${SI_STRUCT.isKong(rule) ? renderRedex(rule.redexRule.redex) : renderRedex(rule.redex)}
                            </div>
                        </div>
                        <div class="rule">
                        ${SI_STRUCT.isOneRule(rule) ? renderOneRule(rule) : renderKong(rule)}
                    </div>
                    <div class="plug">
                         <pre><code>${(SI_STRUCT.isValue(result)) ? renderValue(result) : renderExpr(result)}</code></pre>
                    </div>
                    </div>
                </div>`;
    return str;
}

function renderDef(def: BSL_AST.definition): string {
    if (BSL_AST.isConstDef(def)) {
        return `(define ${def.name.symbol} ${renderExpr(def.value)})`;
    } else if (BSL_AST.isFunDef(def)) {
        return `FunDef not implemented yet`;
    } else {
        return `StructDef not implemented yet`;
    }
}
function renderExpr(expr: BSL_AST.expr): string {
    if (BSL_AST.isCall(expr)) {
        const name = expr.name.symbol;
        const args = expr.args.map(arg => renderExpr(arg)).join(" ");
        const str = `(${name} ${args})`;
        return str;
    } else if (BSL_AST.isLiteral(expr)) {
        const str = `${expr.value}`;
        return str;

    } else if (SI_STRUCT.isValue(expr)) {
        const str = `${expr}`;
        return str;
    } else if (BSL_AST.isCond(expr)) {
        const str = `(cond ${expr.options.map(el => "[" + renderExpr(el.condition) + " " + renderExpr(el.result) + "]").join("\n")})`;
        return str;
    } else {
        console.error("error: expr is neither Call nor Literal: " + expr);
        return "Neither Call nor Literal";
    }
}
function renderValue(val: SI_STRUCT.Value): string {
    const str = `${val}`;
    return str;
}

function renderSplitResult(splitResult: SI_STRUCT.SplitResult): string {
    if (SI_STRUCT.isSplit(splitResult)) {
        const redex = splitResult.redex;
        const context = splitResult.context;
        const redexStr = renderRedex(redex);
        const contextStr = (SI_STRUCT.isContext(context)) ? renderContext(context) : renderHole(context);
        const str = `
        <div class="context">
            Context: ${contextStr}
        </div>
        <div class="redex">
            Redex: ${redexStr}
        </div>`;
        return str;
    } else {
        return `${splitResult}`;
    }
}

/* function renderPlugResult(plugResult: SI_STRUCT.PlugResult): string {
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
} */

function renderRedex(redex: SI_STRUCT.Redex): string {
    if (SI_STRUCT.isCallRedex(redex)) {
        const name = redex.name.symbol;
        const args = redex.args.map(arg => renderValue(arg)).join(" ");
        const str = `<pre><code>(${name} ${args})</code></pre>`;
        return str;
    } else if (SI_STRUCT.isCondRedex(redex)) {
        const str = `<pre><code>(cond ${redex.options.map(el => "[" + renderExpr(el.condition) + " " + renderExpr(el.result) + "]").join("\n")})</code></pre>`;
        return str;
    } else {
        return "Something went wrong: renderRedex";
    }
}
function renderContext(context: SI_STRUCT.Context): string {
    if (SI_STRUCT.isAppContext(context)) {
        const name = context.op ? context.op : "";
        const args = context.args.map(arg => SI_STRUCT.isValue(arg) ? renderValue(arg) : renderExpr(arg)).join(" ");
        const str = `<pre><code>(${name} ${args})</code></pre>`;
        return str;
    } else if (SI_STRUCT.isCondContext(context)) {
        const options = context.options.map(el => "[" + renderExpr(el.condition) + " " + renderExpr(el.result) + "]").join("\n");
        const str = `<pre><code>(cond ${options})</code></pre>`;
        return str;
    } else {
        return "Something went wrong: renderContext";
    }
}
function renderHole(hole: SI_STRUCT.Hole): string {
    return `<span class="hole">[    ]</span>`;
}
function renderOneRule(rule: SI_STRUCT.OneRule): string {
    const type = rule.type;
    const str = `${type}`;
    console.log(str);
    return str;
}
function renderKong(rule: SI_STRUCT.Kong): string {
    const type = rule.type;
    //const context = rule.context;
    const redexRule = rule.redexRule;
    const str = `${type} with ${renderOneRule(redexRule)} `;
    return str;
}

// ####### EVENT HANDLER FUNCTIONS #######

//previous step und nextstep function (nicht zusammenfassen in einer function)
function previousStep(e: Event) {
    const button = e.target as HTMLButtonElement;
    const wrapper = button.parentElement?.parentElement?.getElementsByClassName("step-result-wrapper")[0];
    const visibleResult = wrapper?.querySelector(".step-result[visible=true]") as HTMLDivElement;
    const prevVisibleResult = visibleResult?.previousElementSibling as HTMLDivElement;
    // change Visibility
    visibleResult?.setAttribute("visible", "false");
    prevVisibleResult?.setAttribute("visible", "true");
    // show next button if hidden
    const nextButton = button.parentElement?.querySelector("#nextButton") as HTMLButtonElement;
    if (nextButton.style.visibility == "hidden") {
        nextButton.setAttribute("style", "visibility: visible");
    }
    if (prevVisibleResult?.getAttribute("currentStep") == "0") {
        button.setAttribute("style", "visibility: hidden");
    }
}

function nextStep(e: Event): void {
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
    if (prevButton.style.visibility == "hidden") {
        prevButton.setAttribute("style", "visibility: visible");
    }
    if (nextVisibleResult?.getAttribute("currentStep") == (max - 1).toString()) {
        button.setAttribute("style", "visibility: hidden");
    }
}
