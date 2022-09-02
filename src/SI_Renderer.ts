// parsing and processing code input
import { dirtify } from './Production_Tree';
import { parse } from './BSL_Parser';
import * as BSL_AST from "./BSL_AST";
import * as BSL_Print from './BSL_Print';
// small-step interpreter back-end
import * as SI_STRUCT from "./SI_STRUCT";
import { calculateProgram } from './SI';
// styles & icon ressources
import { default as small_interpreter_css } from './ressources/small-interpreter.css';
import { default as angle_up } from './ressources/icons/angle-up-solid.svg';
import { default as angle_down } from './ressources/icons/angle-down-solid.svg';
import { default as plus_icon } from './ressources/icons/plus-solid.svg';
import { default as minus_icon } from './ressources/icons/minus-solid.svg';
import { default as circle_info } from './ressources/icons/circle-info-solid.svg';
import { default as circle_xmark } from './ressources/icons/circle-xmark-solid.svg';
// html helpers
import { getParentClassRecursive, navigateDOM } from './DOM_Helpers';

// ######### main function processing steppers ###########
export function processSteppers() {
  Array.from(document.getElementsByTagName('stepper')).map(el => {
    try {
      const program : BSL_AST.program = parse(dirtify(el.innerHTML));
      setUpStepperGui(program, el as HTMLElement);
    } catch (e:any) {
      let error;
      if(e) {
        console.error(e);
        error = `${e}`;
      } else {
        console.log('Unknown error');
        error = 'Unknown Error';
      }
      el.innerHTML = `
        <h3>Error turning Program into Stepper</h3>
        <div>${el.innerHTML}</div>
        <div>${error}</div>
      `;
      (el as HTMLElement).style.cssText = `
        padding: 2em;
        color: darkred;
        display: block;
      `;
    }
  });
}

// ### set up a single stepper ###
export function setUpStepperGui(program:BSL_AST.program, el: HTMLElement): void {
    // add css if necessary
    if (!document.getElementById('bsl-tools-stepper-style')) {
        const styleNode = document.createElement('style');
        styleNode.innerHTML = small_interpreter_css;
        styleNode.id = 'bsl-tools-stepper-style';
        document.getElementsByTagName('head')[0].appendChild(styleNode);
    }
    // calculate Steps
    const expr =  program[0] as BSL_AST.expr;
    console.log("expression", expr);
    const emptyStepper: SI_STRUCT.Stepper = {
        type: SI_STRUCT.Production.Stepper,
        root: el,
        originProgram: program,
        stepperTree: [],
    };
    const stepper = calculateProgram(program, emptyStepper);
    console.log("stepper", stepper);
    if (stepper instanceof Error) {
      throw stepper;
    }
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
    'previous step': 'Previous Step',
    'environment': 'Environment',
    'remaining program': 'Remaining Program',
    'start evaluation': 'Start Evaluation',
    'evaluation finished': 'Evaluation Finished',
    'go back': 'Go Back'
  },
  'de': {
    'current evaluation': 'Aktuelle Auswertung',
    'next step': 'Nächster Schritt',
    'previous step': 'Vorheriger Schritt',
    'environment': 'Umgebung',
    'remaining program': 'Übriges Programm',
    'start evaluation': 'Auswertung Starten',
    'evaluation finished': 'Auswertung Beendet',
    'go back': 'Schritt zurück'
  },
};

// ####### RENDER FUNCTIONS #######

// main function
function renderStepper(stepper: SI_STRUCT.Stepper, lang: implementedLanguage): string{
    const stepperTree = stepper.stepperTree;

    const str =
    `<div class="stepper">
    
       <div class="box environment">
         <div class="boxlabel">${dictionary[lang]['environment']}</div>
         ${stepperTree.map(renderDefinition).join('')}
       </div>

       <div class="box expression-steps"
            data-progstep="-1"
            data-visible="true">
         <div class="boxlabel">${dictionary[lang]['current evaluation']}</div>
         <div class="step"
              data-currentStep="true">
           <div class="next-button"
                onclick="gotoExpression(event, 1)">
             ${dictionary[lang]['start evaluation']} <img class="icon" src="${angle_down}">
           </div>
         </div>
       </div>

       ${stepperTree.map((el, i) => renderExpressionSteps(el, i, lang)).join('')}

       <div class="box expression-steps"
            data-progstep="${stepperTree.length}"
            data-visible="false">
         <div class="boxlabel">${dictionary[lang]['current evaluation']}</div>
         <div class="step"
              data-currentStep="true">
            <div class="code">${dictionary[lang]['evaluation finished']}</div>
            <div class="prev-button"
                 onclick="gotoExpression(event, -1)">
              ${dictionary[lang]['go back']} <img class="icon" src="${angle_up}">
            </div>
         </div>
       </div>

       <div class="box program">
         <div class="boxlabel">${dictionary[lang]['remaining program']}</div>
         ${stepperTree.map(renderOriginalExpression).join('')}
       </div>

    </div>`;
    return str;
}
(window as any).gotoExpression = (e: Event, a: number) => {
  navigateExpression(e, a);
}
// render what remains of an expression after evaluation
function renderDefinition(progStep: SI_STRUCT.ProgStep, idx: number): string {
  const lastStep = progStep.stepList[progStep.stepList.length - 1];
  if (SI_STRUCT.isDefinitionStep(lastStep)) {
    return `
      <div class="step code"
           data-progstep="${idx}"
           data-visible="false">
        ${BSL_Print.printDefinition(lastStep.result)}
      </div>
    `;
  } else {
    return '';
  }
}

// render the part of the original Program that is being represented by a progstep
function renderOriginalExpression(progStep: SI_STRUCT.ProgStep, idx: number): string {
  const firstStep = progStep.stepList[0];
  let code = '';
  if (SI_STRUCT.isDefinitionStep(firstStep)) {
    code = BSL_Print.printDefinition(firstStep.result);
  } else {
    const context:Context =
      SI_STRUCT.isKong(firstStep.rule) ?
        printContext(firstStep.rule.context)
        : {left:'', right:''};
    const redexRule =
      SI_STRUCT.isKong(firstStep.rule) ?
        firstStep.rule.redexRule
        : firstStep.rule;
    const redex: string =
      printRedex(redexRule.redex);
    if (!context.right.startsWith(')')) context.right = ` ${context.right}`;
    code = `${context.left}${redex}${context.right}`;
  }
  return `
    <div class="step code"
         data-progstep="${idx}"
         data-visible="true">
      ${code}
    </div>
  `;
}
// one stepper for one expression
function renderExpressionSteps(progStep: SI_STRUCT.ProgStep, idx: number, lang: implementedLanguage): string {
  return `
    <div class="box expression-steps"
         data-progstep="${idx}"
         data-visible="false">
      <div class="boxlabel">${dictionary[lang]['current evaluation']}</div>
      ${progStep.stepList.filter(SI_STRUCT.isExprStep).length > 0 ?
          progStep.stepList.filter(SI_STRUCT.isExprStep).map((el, i) => renderStep(i, el, lang)).join('')
          : `
          <div class="step"
               data-step="0"
               data-currentStep="true"
               data-collapsed="false">
            <div class="prev-button"
                 onclick="prevStep(event)">
              ${dictionary[lang]['previous step']} <img class="icon" src="${angle_up}">
            </div>
            <div class="next-button"
                 onclick="nextStep(event)">
              ${dictionary[lang]['next step']} <img class="icon" src="${angle_down}">
            </div>

            <div class="split-result code">
              ${BSL_Print.printDefinition(progStep.stepList.filter(SI_STRUCT.isDefinitionStep)[0].result)}
            </div>
          </div>
          `
      }
    </div>
  `;
}
// navigate between expressions
function navigateExpression(e: Event, amount: number): void {
  const el = e.target as HTMLElement;
  const expressionDiv = getParentClassRecursive(el, 'expression-steps');
  if(!expressionDiv) {
    console.error('found no parent with class .expression-steps', el);
    return;
  }
  const idxString = expressionDiv.getAttribute('data-progstep');
  if(!idxString) {
    console.error('div with class .expression-steps has no data-progstep attribute', expressionDiv);
    return;
  }
  const idx = parseInt(idxString);
  const targetIdx = idx + amount;
  if(targetIdx < -1) {
    console.error(`cannot navigate to progStep ${targetIdx}: does not exist`);
    return;
  }
  // set visibility in environment
  navigateDOM([expressionDiv], '../.environment/div').map(def => {
    const idxString = def.getAttribute('data-progstep');
    if(idxString) {
      if(parseInt(idxString) < targetIdx) {
        def.setAttribute('data-visible', 'true');
      } else {
        def.setAttribute('data-visible', 'false');
      }
    }
  });
  // set visibility in program
  navigateDOM([expressionDiv], '../.program/div').map(prog => {
    const idxString = prog.getAttribute('data-progstep');
    if(idxString) {
      if(parseInt(idxString) <= targetIdx) {
        prog.setAttribute('data-visible', 'false');
      } else {
        prog.setAttribute('data-visible', 'true');
      }
    }
  });
  // show correct stepper
  navigateDOM([expressionDiv], '../.expression-steps').map(e => {
    const idxString = e.getAttribute('data-progstep');
    if(idxString) {
      if(parseInt(idxString) === targetIdx) {
        e.setAttribute('data-visible', 'true');
      } else {
        e.setAttribute('data-visible', 'false');
      }
    }
  });

}

// one individual step
function renderStep(currentStep: number, step: SI_STRUCT.ExprStep, lang: implementedLanguage): string {
  console.log(`Rendering step ${currentStep}`);
  // acquire necessary information:
  // context and redex
  const context:Context =
    SI_STRUCT.isKong(step.rule) ?
      printContext(step.rule.context)
      : {left:'', right:''};
  const redexRule = SI_STRUCT.isKong(step.rule) ? step.rule.redexRule : step.rule;
  // result and rule name
  const redex: string =
    printRedex(redexRule.redex);
  const result: string = SI_STRUCT.isValue(redexRule.result)
      ? `${redexRule.result}`
      : BSL_Print.printE(redexRule.result);
  const ruleName = redexRule.type;
  // add whitespace to context if necessary
  if (!context.right.startsWith(')')) context.right = ` ${context.right}`;
  return `
    <div class="step"
         data-step="${currentStep}"
         data-currentStep="${currentStep === 0 ? 'true' : 'false'}"
         data-collapsed="false">
      <div class="prev-button"
           onclick="prevStep(event)">
        ${dictionary[lang]['previous step']} <img class="icon" src="${angle_up}">
      </div>
      <div class="next-button"
           onclick="nextStep(event)">
        ${dictionary[lang]['next step']} <img class="icon" src="${angle_down}">
      </div>

      <div class="split-result code">${
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

      <div class="plug-result code"
           data-info-collapsed="true">${
          // if context is not empty, we are applying KONG
          context.left !== '' ? `<span class="rule rule-name left-arrowed kong">${rules['Kong']['name']}</span>` : ''
        }${
          renderRuleInformation(ruleName, context.left !== '')
        }${
          context.left
        } <span class="hole hole-result">${
          result
          // adding rule explanation here so we can align it with result hole
          }<span class="rule left-arrowed"><span class="rule-name">${
            rules[ruleName]['name']
          }</span>: <span class="rule-description"><span class="hole">${
            redex
            }</span> → <span class="hole hole-result">${
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
  } else if (currentStep && !currentStep.nextElementSibling) {
    // continue with next expression
    navigateExpression(e, 1);
  }
}
(window as any).prevStep = (e: Event) => {
  const button = e.target as HTMLElement;
  const currentStep = getParentClassRecursive(button, 'step');
  if(!currentStep) {
    console.error('prevStep not called from within an element of the .step class');
    return;
  } else {
    const position = currentStep.getAttribute('data-step');
    if(position === '0') {
      navigateExpression(e, -1);
      return;
    } else if(currentStep.previousElementSibling) {
      currentStep.setAttribute('data-currentStep', 'false');
      currentStep.setAttribute('data-collapsed', 'true');
      currentStep.previousElementSibling.setAttribute('data-currentStep', 'true');
      currentStep.previousElementSibling.setAttribute('data-collapsed', 'false');
    } else {
      console.error('prevStep called on a step with no previous html element');
      return;
    }
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
  }
  if (acc.left) acc.left = `${acc.left} `;
  if (acc.right) acc.right = ` ${acc.right}`;
  if (SI_STRUCT.isAppContext(ctx)) {
    acc.left =
      `${acc.left}(${BSL_Print.printName(ctx.op)} ${ctx.values.map(v => `${v}`).join(' ')}`;
    acc.right =
      `${ctx.args.map(BSL_Print.printE).join(' ')})${acc.right}`;
  } else if (SI_STRUCT.isCondContext(ctx)) {
    acc.left =
      `${acc.left}(cond [`;
    acc.right =
      ` ${BSL_Print.printE(ctx.options[0].result)}] ${ctx.options.slice(1).map(BSL_Print.printOption).join(' ')})${acc.right}`;
  } else {
    console.error('Printing this context is not implemented yet', ctx);
    throw(`Printing ${ctx['type']} context is not implemented yet!`);
  }
  return printContext(ctx.ctx, acc);
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
function renderRuleInformation(rule: availableRules, kong: boolean):string {
  const ruleInfo = rules[rule];
  return `<img src="${circle_info}"
               class="icon info-toggle info-expand"
               onclick="expandInfo(event)"
         ><img src="${circle_xmark}"
               class="icon info-toggle info-collapse"
               onclick="collapseInfo(event)"
         ><div class="rule-info">${
           kong ? `
            <div class="rule-info-text-container">
              <div class="rule-info-rule-name">${rules['Kong']['name']}</div>
              <div class="rule-info-rule-text">${rules['Kong']['text']}</div>
            </div>
           ` : ''
         }
         <div class="rule-info-text-container">
           <div class="rule-info-rule-name">${ruleInfo['name']}</div>
           <div class="rule-info-rule-text">${ruleInfo['text']}</div>
         </div>
         </div>`;
}
(window as any).expandInfo = (e: Event) => {
  const t = e.target as HTMLElement;
  const p = getParentClassRecursive(t, 'plug-result');
  if(!p) return;
  p.setAttribute('data-info-collapsed', 'false');
  const info = p.querySelector('.rule-info');
  if(!info) return;
  p.style.cssText = `--rule-info-height: ${info.getBoundingClientRect().height}px`;
}
(window as any).collapseInfo = (e: Event) => {
  const t = e.target as HTMLElement;
  const p = getParentClassRecursive(t, 'plug-result');
  if(p) p.setAttribute('data-info-collapsed', 'true');
}
// ### rules ###
// as taken from overview-reduction-and-equivalence.pdf, i.e. the script
// to be displayed as reference
type availableRules = 'Kong' | 'Fun' | 'Prim' | 'Const' | 'CondTrue' | 'CondFalse' | 'StructMake' | 'StructSelect' | 'StructPredTrue' | 'StructPredFalse' | 'ProgRule';
const rules = {
  'Kong': {
    'name': `<cap>Kong</cap>`,
    'text': `
      <em>E[e<small>1</small>] → E[e<small>2</small>] falls e<small>1</small> → e<small>2</small></em><br>
      <em>‹E› ::= []<br>
      &nbsp;&nbsp;&nbsp;| (‹name› ‹v›* ‹E› ‹e›*)<br>
      &nbsp;&nbsp;&nbsp;| (<strong>cond</strong> [‹E› ‹e› ]{[ ‹e› ‹e›]}*)</em>
    `
  },
  'Fun': {
    'name': `<cap>Fun</cap>`,
    'text': `
      <em>(name v<small>1</small> … v<small>n</small>) →
      e[name<small>1</small> := v<small>1</small> … name<small>n</small> := v<small>n</small> ]</em>
      falls
      <em>(</em> <strong>define</strong> <em>(name name<small>1</small> … name<small>n</small>) e)</em> in Umgebung
    `
  },
  'Prim': {
    'name': `<cap>Prim</cap>`,
    'text': `
      <em>(name v<small>1</small> … v<small>n</small>) → v</em> falls
      <em>name</em> eine primitive Funktion <em>f</em> ist und
      <em>f(v<small>1</small> … v<small>n</small>) = v</em>
    `
  },
  'Const': {
    'name': `<cap>Const</cap>`,
    'text': `
      <em>name → v</em> falls <em>(<strong>define</strong> name v)</em> in Umgebung.
    `
  },
  'CondTrue': {
    'name': `<cap>Cond</cap>-True`,
    'text': `
      <em>(<strong>cond</strong> [<strong>#true</strong> e] …) → e</em>
    `
  },
  'CondFalse': {
    'name': `<cap>Cond</cap>-False`,
    'text': `
      <em>(<strong>cond</strong> [<strong>#false</strong> e<small>1</small>]
         [e<small>2</small> e<small>3</small>] …) →
         (<strong>cond</strong> [e<small>2</small> e<small>3</small>] …)</em>
    `
  },
  'StructMake': {
    'name': `<cap>Struct</cap>-make`,
    'text': `
      <em>(<strong>make</strong>-name v<small>1</small> … v<small>n</small>) →
      &lt;<strong>make</strong>-name v<small>1</small> … v<small>n</small>&gt;</em>
      falls <em>(<strong>define-struct</strong> name (name<small>1</small> … name<small>n</small>))</em> in Umgebung
    `
  },
  'StructSelect': {
    'name': `<cap>Struct</cap>-select`,
    'text': `
      <em>(name-name<small>i</small> &lt;<strong>make</strong>-name
        v<small>1</small> … v<small>n</small>&gt;) → v<small>i</small></em>
        falls <em>(<strong>define-struct</strong> name
          (name<small>1</small> … name<small>n</small>))</em> in Umgebung
    `
  },
  'StructPredTrue': {
    'name': `<cap>Struct</cap>-predtrue`,
    'text': `
      <em>(name? &lt;<strong>make</strong>-name …&gt;) → <strong>#true</strong></em>
    `
  },
  'StructPredFalse': {
    'name': `<cap>Struct</cap>-predfalse`,
    'text': `
      <em>(name? v) → <strong>#false</strong></em> falls <em>v</em> nicht
      <em>&lt;<strong>make</strong>-name …&gt;</em> ist
    `
  },
  'ProgRule': {
    'name': `<cap>Prog</cap>`,
    'text': `
      Ein Programm wird von links nach rechts ausgeführt und startet mit der
      leeren Umgebung. Ist das nächste Programmelement eine Funktions- oder
      Strukturdefinition, so wird diese Definition in die Umgebung aufgenommen
      und die Ausführung mit dem nächsten Programmelement in der erweiterten
      Umgebung fortgesetzt. Ist das nächste Programmelement ein Ausdruck, so
      wird dieser gemäß der unten stehenden Regeln in der aktuellen Umgebung zu
      einem Wert ausgewert. Ist das nächste Programmelement eine
      Konstantendefinition <em>(<strong>define</strong> x e)</em>, so wird in
      der aktuellen Umgebung zunächst <em>e</em> zu einem Wert <em>v</em>
      ausgewertet und dann <em>(<strong>define</strong> x v)</em> zur aktuellen
      Umgebung hinzugefügt.
    `
  },
}
