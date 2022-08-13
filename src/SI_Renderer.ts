import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";
import { parse } from './BSL_Parser';
import { dirtify } from './Production_Tree';
import {default as small_interpreter_css} from './ressources/small-interpreter.css';
import { calculateAllSteps } from './SI';
import * as BSL_Print from './BSL_Print';

// main function processing steppers
export function processSteppers() {
  Array.from(document.getElementsByTagName('stepper')).map(el => {
    try {
      const program : BSL_AST.program = parse(dirtify(el.innerHTML));
      setUpStepperGui(program, el as HTMLElement);
    } catch (e:any) {
      if(e) {
        console.error(e);
        el.innerHTML = `${e}`;
      } else {
        console.log('Unknown error');
        el.innerHTML = 'Unknown Error';
      }
      (el as HTMLElement).style.cssText = `
        padding: 2em;
        color: darkred;
        display: block;
      `;
    }
  });
}

// setUpStepperGUI
export function setUpStepperGui(program:BSL_AST.program, el: HTMLElement):void{
    // add css if necessary
    if(!document.getElementById('bsl-tools-stepper-style')) {
      const styleNode = document.createElement('style');
      styleNode.innerHTML = small_interpreter_css;
      styleNode.id = 'bsl-tools-stepper-style';
      document.getElementsByTagName('head')[0].appendChild(styleNode);
    }
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
    // const prevButton = el.querySelector("#prevButton") as HTMLButtonElement;
    // const nextButton = el.querySelector("#nextButton") as HTMLButtonElement;
    // prevButton.addEventListener("click", previousStep);
    // nextButton.addEventListener("click", nextStep);
}

// ####### RENDER FUNCTIONS #######


function renderStepper(stepper: SI_STRUCT.Stepper): string{
    const stepperTree = stepper.stepperTree;
    const originExpr = stepper.originExpr;

    const str =
    `<div class="stepper">
        <div class="program-wrapper">
            Original Expression:
            <pre><code>${BSL_Print.printE(originExpr)}</code></pre>
        </div>
        <div class="steps">
        ${stepperTree.map(el => renderStep(el)).join('')}
        </div>
        <div class="buttons">
            <button class="step-button" id="prevButton" style="visibility: hidden">Previous Step</button>
            <button class="step-button" id="nextButton">Next Step</button>
        </div>
    </div>`;
    return str;
}

// one individual step
function renderStep(step: SI_STRUCT.StepResult): string {
  console.log(`Rendering step ${step.currentStep}`);
  return `
    <div class="step"
         step="${step.currentStep}">
      ${renderSplitResult(step.splitResult)}
      ${renderRule(step)}
      ${renderPlugResult(step.plugResult, step.splitResult)}
    </div>
  `;
}

// split result as code with redex highlighted
function renderSplitResult(split: SI_STRUCT.SplitResult): string {
  if (SI_STRUCT.isSplit(split)) {
    console.log(split);
    const context:Context = printContext(split.context);
    const redex = printRedex(split.redex);
    return `
      <div class="split-result">${
        context.left
      } <span class="hole">${redex}</span> ${
        context.right
      }</div>
    `;
  } else {
    return `${split}`;
  }
}

// recursive definition of printing the context
interface Context {
  left: string,
  right: string
}
function printContext(ctx: SI_STRUCT.Context, acc: Context = {left: '', right: ''}): Context {
  if (SI_STRUCT.isHole(ctx)) {
    return acc;
  } else if (SI_STRUCT.isAppContext(ctx)) {
    const left =
      `${acc.left ? `${acc.left} `: ''}(${BSL_Print.printName(ctx.op)} ${ctx.values.map(v => `${v}`).join(' ')}`;
    const right =
      `${ctx.args.map(BSL_Print.printE).join(' ')})${acc.right ? ` ${acc.right}` : ''}`;
    return printContext(ctx.ctx, {left: left, right: right});
  } else {
    throw "Invalid Input to renderContext!";
  }
}
// recursive definition of printing the redex
function printRedex(redex: SI_STRUCT.Redex): string {
  if (SI_STRUCT.isCallRedex(redex)) {
    return `(${BSL_Print.printName(redex.name)} ${redex.args.join(' ')})`;
  } else if (SI_STRUCT.isCondRedex(redex)) {
    return `(cond ${redex.options.map(BSL_Print.printOption).join(' ')})`;
  } else {
    throw "Invalid Input to printRedex";
  }
}

// rule showing what the redex becomes
function renderRule(step: SI_STRUCT.StepResult): string {
  console.log(step);
  return `
    <div class="rule"> todo: prim rule on redex </div>
  `;
}

// plug result as code with redex result highlighted
function renderPlugResult(res: SI_STRUCT.PlugResult, split: SI_STRUCT.SplitResult): string {
  let rule;
  if (SI_STRUCT.isKong(res.rule)) {
    rule = res.rule.redexRule;
  } else {
    rule = res.rule;
  }
  let result;
  if (SI_STRUCT.isPrim(rule)) {
    result = `${rule.result}`;
  } else if (SI_STRUCT.isCondRule(rule)) {
    result = BSL_Print.printE(rule.result);
  }
  if (SI_STRUCT.isSplit(split)) {
    const context:Context = printContext(split.context);
    return `
      <div class="split-result">${
        context.left
      } <span class="hole">${result}</span> ${
        context.right
      }</div>
    `;
  } else {
    return `${split}`;
  }
}

// function renderStepResult(stepperTree: SI_STRUCT.StepResult[], stepResult: SI_STRUCT.StepResult): string{
//     const currentStep = stepResult.currentStep;
//     const programExpr = stepperTree.slice(0, currentStep).map(stepResult => stepResult.plugResult.expr); //renderExprs
//     const splitResult = stepResult.splitResult; //renderSplitResult
//     const plugResult = stepResult.plugResult; //renderPlugResult
//     const str = `<div class="step-result" currentStep="${currentStep}" visible=${(currentStep == 0) ? "true" : "false"}>
//                     <div class="program-overview">
//                         Program Overview:
//                         <ul>
//                         ${programExpr.map(expr => SI_STRUCT.isValue(expr) ? renderValue(expr) : renderExpr(expr)).join("\n")}
//                         </ul>
//                     </div>
//                     <div class="split-rule-plug">
//                         <div class="split">
//                             Split:
//                             ${renderSplitResult(splitResult)}
//                         </div>
//                         ${renderPlugResult(plugResult)}
//                     </div>
//                 </div>`;
//         return str;
// }

// function renderExpr(expr: BSL_AST.expr):string{
//     if(BSL_AST.isCall(expr)){
//         const name = expr.name.symbol;
//         const args = expr.args.map(arg => renderExpr(arg)).join(" ");
//         const str = `(${name} ${args})`;
//         return str;
//     }else if(BSL_AST.isLiteral(expr)){
//         const str = `${expr.value}`;
//         return str;
//
//     }else if(SI_STRUCT.isValue(expr)){
//         const str = `${expr}`;
//         return str;
//     } else if (BSL_AST.isCond(expr)){
//         const str = expr.options.map(el => renderExpr(el.condition) + " -> " + renderExpr(el.result)).join("\n");
//         return str;
//     }else{
//         console.error("error: expr is neither Call nor Literal: " + expr);
//         return "Neither Call nor Literal";
//     }
// }
// function renderValue(val: SI_STRUCT.Value): string{
//     const str = `${val}`;
//     return str;
// }

// function renderSplitResult(splitResult: SI_STRUCT.SplitResult): string{
//     if (SI_STRUCT.isSplit(splitResult)){
//         const redex = splitResult.redex;
//         const context = splitResult.context;
//         const redexStr = renderRedex(redex);
//         const contextStr = (SI_STRUCT.isAppContext(context)) ? renderContext(context) : renderHole(context);
//         const str = `
//         <div class="context">
//             Context: ${contextStr}
//         </div>
//         <div class="redex">
//             Redex: ${redexStr}
//         </div>`;
//         return str;
//     } else{
//         return `${splitResult}`;
//     }
// }

// function renderPlugResult(plugResult: SI_STRUCT.PlugResult): string{
//     const expr = plugResult.expr;
//     const rule = plugResult.rule;
//     const str = `
//     <div class="rule">
//         ${SI_STRUCT.isOneRule(rule) ? renderOneRule(rule) : renderKong(rule)}
//     </div>
//     <div class="plug">
//         Plug Result: <pre><code>${SI_STRUCT.isValue(expr) ? renderValue(expr) : renderExpr(expr)}</code></pre>
//     </div>`;
//     return str;
// }
//
// function renderRedex(redex: SI_STRUCT.Redex): string{
//     if (SI_STRUCT.isCallRedex(redex)){
//         const name = redex.name.symbol;
//         const args = redex.args.map(arg => renderValue(arg)).join(" ");
//         const str = `<pre><code>(${name} ${args})</code></pre>`;
//         return str;
//     }else if(SI_STRUCT.isCondRedex(redex)){
//         return "Conditional Redex";
//     }else{
//         return "Something went wrong: renderRedex";
//     }
// }
// function renderContext(context: SI_STRUCT.AppContext): string{
//         const name = context.op ? context.op : "";
//         const args = context.args.map(arg => SI_STRUCT.isValue(arg) ? renderValue(arg) : renderExpr(arg)).join(" ");
//         const str = `<pre><code>(${name} ${args})</code></pre>`;
//         return str;
// }
// function renderHole(hole: SI_STRUCT.Hole): string{
//     return `<span class="hole">[    ]</span>`;
// }
// function renderOneRule(rule: SI_STRUCT.OneRule): string{
//     const type = rule.type;
//     const str = `${type}`;
//     console.log(str);
//     return str;
// }
// function renderKong(rule: SI_STRUCT.Kong): string{
//     const type = rule.type;
//     //const context = rule.context;
//     const redexRule = rule.redexRule;
//     const str = `${type} with ${renderOneRule(redexRule)} `;
//     return str;
// }
//
// // ####### EVENT HANDLER FUNCTIONS #######
//
// //previous step und nextstep function (nicht zusammenfassen in einer function)
// function previousStep(e:Event){
//     const button = e.target as HTMLButtonElement;
//     const wrapper = button.parentElement?.parentElement?.getElementsByClassName("step-result-wrapper")[0];
//     const visibleResult = wrapper?.querySelector(".step-result[visible=true]") as HTMLDivElement;
//     const prevVisibleResult = visibleResult?.previousElementSibling as HTMLDivElement;
//     // change Visibility
//     visibleResult?.setAttribute("visible", "false");
//     prevVisibleResult?.setAttribute("visible", "true");
//     // show next button if hidden
//     const nextButton = button.parentElement?.querySelector("#nextButton") as HTMLButtonElement;
//     if(nextButton.style.visibility == "hidden"){
//         nextButton.setAttribute("style","visibility: visible");
//     }
//     if (prevVisibleResult?.getAttribute("currentStep") == "0"){
//          button.setAttribute("style","visibility: hidden");
//     }
// }
//
// function nextStep(e: Event): void{
//     const button = e.target as HTMLButtonElement;
//     const wrapper = button.parentElement?.parentElement?.getElementsByClassName("step-result-wrapper")[0];
//     const visibleResult = wrapper?.querySelector(".step-result[visible=true]") as HTMLDivElement;
//     const nextVisibleResult = visibleResult?.nextElementSibling as HTMLDivElement;
//     const max = wrapper?.getElementsByClassName("step-result").length as number;
//     // change Visibility
//     visibleResult?.setAttribute("visible", "false");
//     nextVisibleResult?.setAttribute("visible", "true");
//     // show prev button if hidden
//     const prevButton = button.parentElement?.querySelector("#prevButton") as HTMLButtonElement;
//     if(prevButton.style.visibility == "hidden"){
//         prevButton.setAttribute("style","visibility: visible");
//     }
//     if (nextVisibleResult?.getAttribute("currentStep") == (max - 1).toString()){
//          button.setAttribute("style","visibility: hidden");
//      }
// }
