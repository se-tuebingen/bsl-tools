// parsing and processing code input
import { dirtify } from './Production_Tree';
import { parse } from './BSL_Parser';
import * as BSL_AST from "./BSL_AST";
import * as BSL_Print from './BSL_Print';
// small-step interpreter back-end
import * as SI_STRUCT from "./SI_STRUCT";
import { calculateAllSteps } from './SI';
// styles & icon ressources
import { default as small_interpreter_css } from './ressources/small-interpreter.css';
import { default as angle_up } from './ressources/icons/angle-up-solid.svg';
import { default as angle_down } from './ressources/icons/angle-down-solid.svg';
import { default as plus_icon } from './ressources/icons/plus-solid.svg';
import { default as minus_icon } from './ressources/icons/minus-solid.svg';
import { default as circle_info } from './ressources/icons/circle-info-solid.svg';
import { default as circle_xmark } from './ressources/icons/circle-xmark-solid.svg';
// html helpers
import { getParentClassRecursive } from './DOM_Helpers';

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

// ### set up a single stepper ###
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

// main function
function renderStepper(stepper: SI_STRUCT.Stepper, lang: implementedLanguage): string{
    const stepperTree = stepper.stepperTree;

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
  // acquire necessary information:
  // context and redex
  const finished = !SI_STRUCT.isSplit(step.splitResult);
  const context:Context =
    finished ? {left:'', right:''}
             : printContext((step.splitResult  as SI_STRUCT.Split).context);
  const redex =
    finished ? `${step.splitResult}`
             : printRedex((step.splitResult as SI_STRUCT.Split).redex);
  // rule
  let rule;
  if (SI_STRUCT.isKong(step.plugResult.rule)) {
    rule = step.plugResult.rule.redexRule;
  } else {
    rule = step.plugResult.rule;
  }
  // result and rule name
  let result;
  let ruleName = '';
  if (SI_STRUCT.isPrim(rule)) {
    result = `${rule.result}`;
    ruleName = 'Prim';
    // else-Fall gilt für alle anderen Regeln
  } else if (SI_STRUCT.isCondRule(rule)) {
    result = BSL_Print.printE(rule.result);
    ruleName = 'Cond';
  }
  // add whitespace to context if necessary
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

      <div class="plug-result"
           data-info-collapsed="true">${
          // if context is not empty, we are applying KONG
          context.left !== '' ? '<span class="rule rule-name left-arrowed kong">Kong</span>' : ''
        }${
          renderRuleInformation(ruleName, context.left !== '')
        }${
          context.left
        } <span class="hole hole-result">${
          result
          // adding rule explanation here so we can align it with result hole
          }<span class="rule left-arrowed"><span class="rule-name">${
            ruleName
          }</span>: <span class="rule-description"><span class="hole">${
            redex
            }</span> = <span class="hole hole-result">${
              result
            }</span></span></span></span>${
          context.right
      }</div>

    </div>
  `;
}
// event handlers
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

// rendering the rule tip
function renderRuleInformation(rule: string, kong: boolean):string {
  if (!availableRules.includes(rule)) return '';
  const ruleInfo = rules[rule as availableRules];
  return `<img src="${circle_info}"
               class="icon info-toggle info-expand"
               onclick="expandInfo(event)"
         ><img src="${circle_xmark}"
               class="icon info-toggle info-collapse"
               onclick="collapseInfo(event)"
         ><div class="rule-info">${ruleInfo}</div>`;
}
(window as any).expandInfo = (e: Event) => {
  const t = e.target as HTMLElement;
  const p = getParentClassRecursive(t, 'plug-result');
  if(p) p.setAttribute('data-info-collapsed', 'false');
}
(window as any).collapseInfo = (e: Event) => {
  const t = e.target as HTMLElement;
  const p = getParentClassRecursive(t, 'plug-result');
  if(p) p.setAttribute('data-info-collapsed', 'true');
}
// ### rules ###
// as taken from overview-reduction-and-equivalence.pdf, i.e. the script
// to be displayed as reference
type availableRules = 'Kong' | 'Prim' | 'Cond';
const availableRules = ['Kong', 'Prim', 'Cond'];
const rules = {
  'Kong': `Kong description here`,
  'Prim': `Prim description here`,
  'Cond': `Cond description here`,
}
