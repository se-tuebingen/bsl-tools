import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";
import { parse } from './BSL_Parser';
import { dirtify } from './Production_Tree';
import {default as small_interpreter_css} from './ressources/small-interpreter.css';
import { default as angle_up } from './ressources/icons/angle-up-solid.svg';
import { default as angle_down } from './ressources/icons/angle-down-solid.svg';
import { default as plus_icon } from './ressources/icons/plus-solid.svg';
import { default as minus_icon } from './ressources/icons/minus-solid.svg';
import { calculateAllSteps } from './SI';
import * as BSL_Print from './BSL_Print';
import {getParentClassRecursive} from './DOM_Helpers';

// ######### main function processing steppers ###########
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
    // calculate Steps
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
    // set language
    let lang = el.getAttribute('lang');
    if (!lang) {
      lang = 'en';
    } else if (!implementedLanguages.includes(lang)) {
      console.error(`
        Language ${lang} is not implemented for this module,
        you can choose from ${implementedLanguages.join(',')}.
        Defaulting to 'en'.
      `);
      lang = 'en';
    }
    // render and attach
    el.innerHTML = renderStepper(stepper, lang as implementedLanguage);
}

// ###### internationalization for this module #####
// mainly for quiz, currently
type implementedLanguage = 'en' | 'de';
const implementedLanguages = ['en', 'de'];

const dictionary = {
  'en': {
    'current evaluation': 'Current Evaluation',
    'next step': 'Next Step',
    'previous step': 'Previous Step'
  },
  'de': {
    'current evaluation': 'Aktuelle Auswertung',
    'next step': 'Nächster Schritt',
    'previous step': 'Vorheriger Schritt'
  },
};

// ####### RENDER FUNCTIONS #######


function renderStepper(stepper: SI_STRUCT.Stepper, lang: implementedLanguage): string{
    const stepperTree = stepper.stepperTree;
    const originExpr = stepper.originExpr;

    const str =
    `<div class="stepper">
        <div class="steps">
          <div class="blocklabel">${dictionary[lang]['current evaluation']}</div>
          ${stepperTree.map(el => renderStep(el, lang)).join('')}
        </div>
    </div>`;
    return str;
}

// one individual step
function renderStep(step: SI_STRUCT.StepResult, lang: implementedLanguage): string {
  console.log(`Rendering step ${step.currentStep}`);
  const finished = !SI_STRUCT.isSplit(step.splitResult);
  const context:Context =
    finished ? {left:'', right:''}
             : printContext((step.splitResult  as SI_STRUCT.Split).context);
  const redex =
    finished ? `${step.splitResult}`
             : printRedex((step.splitResult as SI_STRUCT.Split).redex);
  let rule;
  if (SI_STRUCT.isKong(step.plugResult.rule)) {
    rule = step.plugResult.rule.redexRule;
  } else {
    rule = step.plugResult.rule;
  }
  let result;
  let ruleName = '';
  if (SI_STRUCT.isPrim(rule)) {
    result = `${rule.result}`;
    ruleName = 'Prim';
  } else if (SI_STRUCT.isCondRule(rule)) {
    result = BSL_Print.printE(rule.result);
    ruleName = 'Cond';
  }
  if (!context.right.startsWith(')')) context.right = ` ${context.right}`;
  return `
    <div class="step"
         data-step="${step.currentStep}"
         data-currentStep="${step.currentStep === 0 ? 'true' : 'false'}"
         data-collapsed="false">
      <div class="prev-button"
           onclick="prevStep(event)">
        ${dictionary[lang]['previous step']} <img class="icon" src="${angle_up}">
      </div>
      <div class="next-button"
           onclick="nextStep(event)">
        ${dictionary[lang]['next step']} <img class="icon" src="${angle_down}">
      </div>

      <div class="split-result">${
        context.left
      } <span class="hole">${redex}</span>${
        context.right
      }<img class="icon expander"
            src="${plus_icon}"
            onclick="expand(event)"
      ><img class="icon collapser"
            src="${minus_icon}"
            onclick="collapse(event)"
      ></div>

      <div class="plug-result">${
        context.left !== '' ? '<span class="rule left-arrowed kong">Kong</span>' : ''
      }${
        context.left
      } <span class="hole">${result}<span class="rule left-arrowed">${ruleName}</span></span>${
        context.right
      }</div>

    </div>
  `;
}
(window as any).nextStep = (e: Event) => {
  const button = e.target as HTMLElement;
  const currentStep = getParentClassRecursive(button, 'step');
  if(currentStep && currentStep.nextElementSibling) {
    currentStep.setAttribute('data-currentStep', 'false');
    currentStep.setAttribute('data-collapsed', 'true');
    currentStep.nextElementSibling.setAttribute('data-currentStep', 'true');
    currentStep.nextElementSibling.setAttribute('data-collapsed','false');
  }
}
(window as any).prevStep = (e: Event) => {
  const button = e.target as HTMLElement;
  const currentStep = getParentClassRecursive(button, 'step');
  if(currentStep && currentStep.previousElementSibling) {
    currentStep.setAttribute('data-currentStep', 'false');
    currentStep.setAttribute('data-collapsed', 'true');
    currentStep.previousElementSibling.setAttribute('data-currentStep', 'true');
    currentStep.previousElementSibling.setAttribute('data-collapsed', 'false');
  }
}
(window as any).collapse = (e: Event) => {
  const button = e.target as HTMLElement;
  const step = getParentClassRecursive(button, 'step');
  if(step) {
    step.setAttribute('data-collapsed', 'true');
  }
}
(window as any).expand = (e: Event) => {
  const button = e.target as HTMLElement;
  const step = getParentClassRecursive(button, 'step');
  if(step) {
    step.setAttribute('data-collapsed', 'false');
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
