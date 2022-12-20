// parsing and processing code input
import { parse } from "./BSL_Parser";
import * as BSL_AST from "./BSL_AST";
import * as BSL_Print from "./BSL_Print";
// small-step interpreter back-end
import * as SI_STRUCT from "./SI_STRUCT";
import { calculateProgram } from "./SI";
// styles & icon ressources
import { default as stepper_css } from "./ressources/stepper.css";
import { default as angle_up } from "./ressources/icons/angle-up-solid.svg";
import { default as angle_down } from "./ressources/icons/angle-down-solid.svg";
import { default as plus_icon } from "./ressources/icons/plus-solid.svg";
import { default as minus_icon } from "./ressources/icons/minus-solid.svg";
import { default as circle_info } from "./ressources/icons/circle-info-solid.svg";
import { default as circle_xmark } from "./ressources/icons/circle-xmark-solid.svg";
// html helpers
import { getParentClassRecursive, navigateDOM } from "./DOM_Helpers";

// ######### main function processing steppers ###########
export function processSteppers() {
  Array.from(document.getElementsByTagName("stepper")).map((el) => {
    try {
      const program: BSL_AST.program = parse(BSL_Print.dirtify(el.innerHTML));
      console.log(program);
      setUpStepperGui(program, el as HTMLElement);
    } catch (e: any) {
      renderError(e, el as HTMLElement);
    }
  });
}

function renderError(err: any, el: HTMLElement) {
  console.error(err);
  const error = err ? `${err}` : "Unknown Error";
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

// ### set up a single stepper ###
export function setUpStepperGui(
  program: BSL_AST.program,
  el: HTMLElement
): void | Error {
  addStylesheet();
  const stepper = calculateProgram(program);
  console.log(BSL_Print.indent(BSL_Print.pprint(program), 30));
  console.log(stepper);
  if (stepper instanceof Error) throw stepper;
  const lang = getLanguage(el);
  const measures = getPixelMeasurements(el); // for static maxwidth indentation & clipping
  el.innerHTML = renderStepper(stepper, lang, measures);
}

function addStylesheet() {
  if (!document.getElementById("bsl-tools-stepper-style")) {
    const styleNode = document.createElement("style");
    styleNode.innerHTML = stepper_css;
    styleNode.id = "bsl-tools-stepper-style";
    document.getElementsByTagName("head")[0].appendChild(styleNode);
  }
}

function getLanguage(el: HTMLElement): implementedLanguage {
  const lang = el.getAttribute("lang");
  if (!lang) {
    return "en";
  } else if (!implementedLanguages.includes(lang)) {
    console.error(`
        Language ${lang} is not implemented for this module,
        you can choose from ${implementedLanguages.join(",")}.
        Defaulting to 'en'.
      `);
    return "en";
  }
  return lang as implementedLanguage;
}

// helper for getting width of em in px
interface PixelMeasurements {
  charWidth: number;
  maxChars: number;
}
function getPixelMeasurements(el: HTMLElement): PixelMeasurements {
  const measureText = "Loading...";
  el.innerHTML = `
    <div class="bsl-tools-stepper" style="width: 100%;">
      <div class="box">
        <div class="step code"
             data-currentStep="true">
          <p style="display: inline-block;">${measureText}</p>
        </div>
      </div>
    </div>
  `;
  const p = el.getElementsByTagName("p")[0];
  const stepper = el.getElementsByClassName("bsl-tools-stepper")[0];
  if (!p || !stepper) {
    console.error("failed to inject measuring HTML into", el);
    return { charWidth: 12, maxChars: 80 }; // arbitrary value
  }
  const charPxWidth = p.clientWidth / measureText.length;
  const factor = 0.9;
  const maxWidthInChars = Math.round(
    (factor * stepper.clientWidth) / charPxWidth
  );
  return { charWidth: charPxWidth, maxChars: maxWidthInChars };
}

// ###### internationalization for this module #####
type implementedLanguage = "en" | "de";
const implementedLanguages = ["en", "de"];

const dictionary = {
  en: {
    "current evaluation": "Current Evaluation",
    "next step": "Next Step",
    "previous step": "Previous Step",
    environment: "Environment",
    "remaining program": "Remaining Program",
    "start evaluation": "Start Evaluation",
    "evaluation finished": "Evaluation Finished",
    "go back": "Go Back",
  },
  de: {
    "current evaluation": "Aktuelle Auswertung",
    "next step": "Nächster Schritt",
    "previous step": "Vorheriger Schritt",
    environment: "Umgebung",
    "remaining program": "Verbleibendes Programm",
    "start evaluation": "Auswertung Starten",
    "evaluation finished": "Auswertung Beendet",
    "go back": "Schritt zurück",
  },
};

// ####### RENDER FUNCTIONS #######

// main function
function renderStepper(
  stepper: SI_STRUCT.Stepper,
  lang: implementedLanguage,
  measures: PixelMeasurements
): string {
  const progSteps = stepper.progSteps;

  return `
    <div class="bsl-tools-stepper">

       <div class="box environment">
         <div class="boxlabel">${dictionary[lang]["environment"]}</div>
         ${progSteps.map((s, i) => renderDefinition(s, i, measures)).join("")}
       </div>

       <div class="box eval-steps"
            data-progstep="-1"
            data-visible="true">
         <div class="boxlabel">${dictionary[lang]["current evaluation"]}</div>
         <div class="step"
              data-currentStep="true">
           <div class="next-button"
                onclick="takeProgSteps(event, 1)">
             <cap>Prog</cap>: ${
               dictionary[lang]["start evaluation"]
             } <img class="icon" src="${angle_down}">
           </div>
           <div class="plug-result code"
                data-info-collapsed="true">
             <img class="icon info-toggle info-expand"
                     src="${circle_info}"
                     onclick="expandInfo(event)">
             <img class="icon info-toggle info-collapse"
                     src="${circle_xmark}"
                     onclick="collapseInfo(event)">
             ${renderRuleInformation("Prog", false)}
           </div>
         </div>
       </div>

       ${progSteps
         .map((el, i) => renderEvalSteps(el, i, lang, measures))
         .join("")}

       <div class="box eval-steps"
            data-progstep="${progSteps.length}"
            data-visible="false">
         <div class="boxlabel">${dictionary[lang]["current evaluation"]}</div>
         <div class="step"
              data-currentStep="true">
            <div class="code">${dictionary[lang]["evaluation finished"]}</div>
            <div class="prev-button"
                 onclick="takeProgSteps(event, -1)">
              ${
                dictionary[lang]["go back"]
              } <img class="icon" src="${angle_up}">
            </div>
         </div>
       </div>

       <div class="box program">
         <div class="boxlabel">${dictionary[lang]["remaining program"]}</div>
         ${stepper.originProgram
           .map((s, i) => renderOriginalExpression(s, i, measures))
           .join("")}
       </div>

    </div>`;
}
(window as any).takeProgSteps = (e: Event, a: number) => {
  takeProgSteps(e, a);
};
// render what remains of an expression after evaluation
function renderDefinition(
  progStep: SI_STRUCT.ProgStep,
  idx: number,
  measures: PixelMeasurements
): string {
  // filtering at this position in order to keep correct implicit progStep index
  if (!SI_STRUCT.isDefinitionStep(progStep) || progStep.result instanceof Error)
    return "";
  return `
      <div class="step code"
           data-progstep="${idx}"
           data-visible="false">
        ${BSL_Print.indent(
          BSL_Print.sanitize(BSL_Print.printDefinition(progStep.result)),
          measures.maxChars,
          "html"
        )}
      </div>
    `;
}

// render the part of the original Program that is being represented by a progstep
function renderOriginalExpression(
  expression: BSL_AST.defOrExpr,
  idx: number,
  measures: PixelMeasurements
): string {
  return `
    <div class="step code"
         data-progstep="${idx}"
         data-visible="true">
      ${BSL_Print.indent(
        BSL_Print.sanitize(BSL_Print.printDefOrExpr(expression)),
        measures.maxChars,
        "html"
      )}
    </div>
  `;
}
// one stepper for one expression
function renderEvalSteps(
  progStep: SI_STRUCT.ProgStep,
  idx: number,
  lang: implementedLanguage,
  measures: PixelMeasurements
): string {
  const ctx =
    SI_STRUCT.isDefinitionStep(progStep) &&
    BSL_AST.isConstDef(progStep.originalDefOrExpr)
      ? {
          left: `(define ${progStep.originalDefOrExpr.name.symbol} `,
          right: ")",
        }
      : { left: "", right: "" };
  return `
    <div class="box eval-steps"
         data-progstep="${idx}"
         data-visible="false">
      <div class="boxlabel">${dictionary[lang]["current evaluation"]}</div>
      ${progStep.evalSteps
        .map((el, i) => renderStep(i, el, lang, { ...ctx }, measures))
        .join("")}
      ${renderLastStep(progStep, lang, measures)}

    </div>
  `;
}

function renderLastStep(
  progStep: SI_STRUCT.ProgStep,
  lang: implementedLanguage,
  measures: PixelMeasurements
): string {
  return `
  <div class="step"
       data-step="${progStep.evalSteps.length}"
       data-currentStep="${progStep.evalSteps.length === 0 ? "true" : "false"}"
       data-collapsed="false">
    <div class="prev-button"
         onclick="prevStep(event)">
      ${dictionary[lang]["previous step"]} <img class="icon" src="${angle_up}">
    </div>
    <div class="next-button"
         onclick="nextStep(event)">
      <cap>Prog</cap>: ${
        dictionary[lang]["next step"]
      } <img class="icon" src="${angle_down}">
    </div>

    <div class="plug-result code"
         data-info-collapsed="true">
      ${BSL_Print.indent(
        BSL_Print.sanitize(
          SI_STRUCT.isDefinitionStep(progStep) &&
            !(progStep.result instanceof Error)
            ? BSL_Print.printDefinition(progStep.result)
            : `${
                progStep.result instanceof Error
                  ? progStep.result
                  : BSL_Print.printValue(progStep.result as SI_STRUCT.Value)
              }`
        ),
        measures.maxChars
      )}
      <img class="icon info-toggle info-expand"
              src="${circle_info}"
              onclick="expandInfo(event)">
      <img class="icon info-toggle info-collapse"
              src="${circle_xmark}"
              onclick="collapseInfo(event)">
      ${
        SI_STRUCT.isDefinitionStep(progStep) && SI_STRUCT.isProg(progStep.rule)
          ? renderRuleInformation("Prog", false)
          : renderRuleInformation("ProgError", false)
      }
    </div>
  </div>
  `;
}

/*
  update visibility of expressions in environment/remaining program and steppers
  amount: number of ProgSteps to move forward/backwards
*/
function takeProgSteps(e: Event, amount: number): void {
  const button = e.target as HTMLElement;
  // el will be a button
  const oldButtonPosition = button.getBoundingClientRect().y;
  const currentStep = getParentClassRecursive(button, "eval-steps");
  if (!currentStep) {
    console.error("found no parent with class .eval-steps", button);
    return;
  }
  const idxString = currentStep.getAttribute("data-progstep");
  if (!idxString) {
    console.error(
      "div with class .eval-steps has no data-progstep attribute",
      currentStep
    );
    return;
  }
  const idx = parseInt(idxString);
  const targetIdx = idx + amount;
  if (targetIdx < -1) {
    console.error(`cannot navigate to progStep ${targetIdx}: does not exist`);
    return;
  }
  const root = currentStep.parentElement;
  if (!root) return;
  showEnvironment(root, targetIdx);
  showRemainingProgram(root, targetIdx);
  const newCurrentStep = showProgStep(root, targetIdx);
  moveProgStepButton(newCurrentStep, oldButtonPosition, amount > 0);
}

function showEnvironment(root: HTMLElement, step: number) {
  navigateDOM([root], ".environment/div").forEach((def) => {
    const idxString = def.getAttribute("data-progstep");
    if (idxString) {
      def.setAttribute(
        "data-visible",
        parseInt(idxString) < step ? "true" : "false"
      );
    }
  });
}

function showRemainingProgram(root: HTMLElement, step: number) {
  navigateDOM([root], ".program/div").forEach((prog) => {
    const idxString = prog.getAttribute("data-progstep");
    if (idxString) {
      prog.setAttribute(
        "data-visible",
        parseInt(idxString) > step ? "true" : "false"
      );
    }
  });
}

function showProgStep(root: HTMLElement, index: number): HTMLElement {
  return navigateDOM([root], ".eval-steps").filter((progStep) => {
    const idxString = progStep.getAttribute("data-progstep");
    const current = idxString && parseInt(idxString) === index;
    progStep.setAttribute("data-visible", current ? "true" : "false");
    return current;
  })[0];
}

function moveProgStepButton(
  progStep: HTMLElement,
  oldButtonPosition: number,
  forward: boolean
) {
  // move prev/next-button to stay under mouse
  const currentStep = Array.from(progStep.children).filter(
    (c) => c.getAttribute("data-currentstep") === "true"
  )[0];
  if (!currentStep) return;
  const newButton = currentStep.querySelector(
    forward ? ".next-button" : ".prev-button"
  );
  if (!newButton) return;
  const newButtonPosition = newButton.getBoundingClientRect().y;
  window.scrollBy(0, newButtonPosition - oldButtonPosition);
}

// one individual step
function renderStep(
  currentStep: number,
  step: SI_STRUCT.EvalStep,
  lang: implementedLanguage,
  ctx: Context = { left: "", right: "" },
  measures: PixelMeasurements
): string {
  // acquire necessary information:
  // context and redex
  const context: Context = SI_STRUCT.isKong(step.rule)
    ? printContext(step.rule.context, ctx)
    : ctx;
  const redexRule = SI_STRUCT.isKong(step.rule)
    ? step.rule.redexRule
    : step.rule;
  // result and rule name
  const redex: string = BSL_Print.sanitize(printRedex(redexRule.redex));
  function renderResult(res: BSL_AST.expr | SI_STRUCT.Value | Error): {
    html: string;
    redex: string;
  } {
    if (SI_STRUCT.isValue(res)) {
      const redexResult = BSL_Print.printValue(res);
      const resultHtml = `${
        context.left
      }<span class="hole hole-result">${BSL_Print.sanitize(
        redexResult
      )}</span>${context.right}`;
      return { html: resultHtml, redex: redexResult };
    } else if (res instanceof Error) {
      const redexResult = `${res}`;
      const resultHtml = `<span class="hole hole-result hole-error">"${res}"</span>`; // to prevent indentation issues
      return { redex: redexResult, html: resultHtml };
    } else {
      const redexResult = BSL_Print.printE(res);
      const resultHtml = `${
        context.left
      }<span class="hole hole-result">${BSL_Print.sanitize(
        redexResult
      )}</span>${context.right}`;
      return { redex: redexResult, html: resultHtml };
    }
  }
  const result = renderResult(redexRule.result);
  const ruleName = redexRule.type;
  // prepare indented code expressions
  const code_before = BSL_Print.indent(
    `${context.left}<span class="hole">${redex}</span>${context.right}`,
    measures.maxChars,
    "html"
  );
  const code_after = BSL_Print.indent(result.html, measures.maxChars, "html");

  // find out where to position the rule arrow so that it points at the hole
  const code_before_hole = code_after
    .slice(0, code_after.indexOf('<span class="hole hole-result'))
    .split("<br>")
    .reverse()[0];
  const hole_position = code_before_hole
    ? BSL_Print.dirtify(code_before_hole).length
    : 0;
  const KONG_WIDTH = 4;
  const left_offset_arrow =
    context.left.length > 0 && hole_position < KONG_WIDTH
      ? KONG_WIDTH
      : hole_position;
  // find out if we have place to repeat the holes
  const ruleNameOnlyText = rules[ruleName]["name"]
    .replaceAll("<cap>", "")
    .replaceAll("</cap>", "");
  const space_left = // 3 for the arrow, 2 for the icon ---v
    measures.maxChars - left_offset_arrow - ruleNameOnlyText.length - 5;
  const renderHolesInRule = redex.length + result.redex.length <= space_left;

  return `
    <div class="step"
         data-step="${currentStep}"
         data-currentStep="${currentStep === 0 ? "true" : "false"}"
         data-collapsed="false">
      <div class="prev-button"
           onclick="prevStep(event)">
        ${
          dictionary[lang]["previous step"]
        } <img class="icon" src="${angle_up}">
      </div>
      <div class="next-button"
           onclick="nextStep(event)">
        ${dictionary[lang]["next step"]} <img class="icon" src="${angle_down}">
      </div>

      <div class="split-result code">${code_before}<img class="icon expander"
              src="${plus_icon}"
              onclick="expand(event)"
        ><img class="icon collapser"
              src="${minus_icon}"
              onclick="collapse(event)"
      ></div>

      <div class="plug-result code"
           data-info-collapsed="true">
        <div>
          ${
            // if context is not empty, we are applying KONG
            context.left !== ""
              ? `<span class="rule rule-name left-arrowed kong">
                 ${rules["Kong"]["name"]}
              </span>`
              : ""
          }

          <span class="rule left-arrowed one-rule"
                style="--one-rule-margin-left: ${
                  left_offset_arrow * measures.charWidth
                }px">
             <span class="rule-name">${rules[ruleName]["name"]}</span>${
    renderHolesInRule
      ? `:
                   <span class="rule-description">
                     <span class="hole rule-hole">${redex}</span> →
                     <span class="hole hole-result rule-hole">${BSL_Print.sanitize(
                       result.redex
                     )}</span>
                   </span>`
      : ""
  }
           </span>

           <img src="${circle_info}"
                class="icon info-toggle info-expand"
                onclick="expandInfo(event)">
           <img src="${circle_xmark}"
                class="icon info-toggle info-collapse"
                onclick="collapseInfo(event)">

        </div>
        ${renderRuleInformation(ruleName, context.left !== "")}
        <div>${code_after}</div>
      </div>

    </div>
  `;
}
// event handlers
(window as any).nextStep = (e: Event) => {
  const button = e.target as HTMLElement;
  const oldButtonPosition = button.getBoundingClientRect().y;
  const currentStep = getParentClassRecursive(button, "step");
  if (!currentStep) return;
  const newCurrentStep = currentStep.nextElementSibling;
  if (!newCurrentStep) {
    // continue with next expression
    takeProgSteps(e, 1);
    return;
  }
  currentStep.setAttribute("data-currentStep", "false");
  currentStep.setAttribute("data-collapsed", "true");
  newCurrentStep.setAttribute("data-currentStep", "true");
  newCurrentStep.setAttribute("data-collapsed", "false");
  // move "next" button under mouse
  const newButton = newCurrentStep.querySelector(".next-button");
  if (!newButton) return;
  const newButtonPosition = newButton.getBoundingClientRect().y;
  window.scrollBy(0, newButtonPosition - oldButtonPosition);
};
(window as any).prevStep = (e: Event) => {
  const button = e.target as HTMLElement;
  const oldButtonPosition = button.getBoundingClientRect().y;
  const currentStep = getParentClassRecursive(button, "step");
  if (!currentStep) {
    console.error(
      "prevStep not called from within an element of the .step class"
    );
    return;
  }
  const position = currentStep.getAttribute("data-step");
  if (position === "0") {
    takeProgSteps(e, -1);
    return;
  }
  const newCurrentStep = currentStep.previousElementSibling;
  if (!newCurrentStep) {
    console.error("prevStep called on a step with no previous html element");
    return;
  }
  currentStep.setAttribute("data-currentStep", "false");
  currentStep.setAttribute("data-collapsed", "true");
  newCurrentStep.setAttribute("data-currentStep", "true");
  newCurrentStep.setAttribute("data-collapsed", "false");
  // move "prev" button to be under mouse
  const newButton = newCurrentStep.querySelector(".prev-button");
  if (!newButton) return;
  const newButtonPosition = newButton.getBoundingClientRect().y;
  window.scrollBy(0, newButtonPosition - oldButtonPosition);
};
(window as any).collapse = (e: Event) => {
  const button = e.target as HTMLElement;
  const step = getParentClassRecursive(button, "step");
  if (step) {
    step.setAttribute("data-collapsed", "true");
  }
};
(window as any).expand = (e: Event) => {
  const button = e.target as HTMLElement;
  const step = getParentClassRecursive(button, "step");
  if (step) {
    step.setAttribute("data-collapsed", "false");
  }
};

// recursive definition of printing the context
interface Context {
  left: string;
  right: string;
}
function printContext(
  ctx: SI_STRUCT.Context,
  acc: Context = { left: "", right: "" }
): Context {
  if (SI_STRUCT.isHole(ctx)) {
    return {
      left: BSL_Print.sanitize(acc.left),
      right: BSL_Print.sanitize(acc.right),
    };
  }
  if (SI_STRUCT.isAppContext(ctx)) {
    const leftEls = [
      BSL_Print.printName(ctx.op),
      ...ctx.values.map((v) =>
        BSL_AST.isStructValue(v) ? BSL_Print.printValue(v) : `${v}`
      ),
    ];
    acc.left = `${acc.left}(${leftEls.join(" ")} `;
    acc.right =
      ctx.args.length > 0
        ? ` ${ctx.args.map(BSL_Print.printE).join(" ")})${acc.right}`
        : `)${acc.right}`;
  } else if (SI_STRUCT.isCondContext(ctx)) {
    acc.left = `${acc.left}(cond [`;
    const rest = [
      `${BSL_Print.printE(ctx.options[0].result)}]`,
      ...ctx.options.slice(1).map(BSL_Print.printOption),
    ];
    acc.right = ` ${rest.join(" ")})${acc.right}`;
  } else {
    console.error("Printing this context is not implemented yet", ctx);
    throw `Printing ${ctx["type"]} context is not implemented yet!`;
  }
  return printContext(ctx.ctx, acc);
}
function printValueOrId(vOrId: SI_STRUCT.Value | SI_STRUCT.Id): string {
  if (SI_STRUCT.isValue(vOrId)) {
    return BSL_Print.printValue(vOrId);
  } else {
    return printIdentifier(vOrId);
  }
}
// recursive definition of printing the redex
function printRedex(redex: SI_STRUCT.Redex): string {
  if (SI_STRUCT.isCallRedex(redex)) {
    return `(${BSL_Print.printName(redex.name)} ${redex.args
      .map(printValueOrId)
      .join(" ")})`;
  } else if (SI_STRUCT.isCondRedex(redex)) {
    return `(cond ${redex.options.map(BSL_Print.printOption).join(" ")})`;
  } else if (SI_STRUCT.isNameRedex(redex)) {
    return redex.symbol;
  } else {
    throw "Invalid Input to printRedex";
  }
}
// Print Identifier
function printIdentifier(id: SI_STRUCT.Id): string {
  return id.symbol;
}

// rendering the rule tip
function renderRuleInformation(rule: availableRules, kong: boolean): string {
  const ruleInfo = rules[rule];
  return `<div class="rule-info">${
    kong
      ? `
            <div class="rule-info-text-container">
              <div class="rule-info-rule-name">${rules["Kong"]["name"]}</div>
              <div class="rule-info-rule-text">${rules["Kong"]["text"]}</div>
            </div>
           `
      : ""
  }
         <div class="rule-info-text-container">
           <div class="rule-info-rule-name">${ruleInfo["name"]}</div>
           <div class="rule-info-rule-text">${ruleInfo["text"]}</div>
         </div>
         </div>`;
}
(window as any).expandInfo = (e: Event) => {
  const t = e.target as HTMLElement;
  const p = getParentClassRecursive(t, "plug-result");
  if (!p) return;
  p.setAttribute("data-info-collapsed", "false");
};
(window as any).collapseInfo = (e: Event) => {
  const t = e.target as HTMLElement;
  const p = getParentClassRecursive(t, "plug-result");
  if (p) p.setAttribute("data-info-collapsed", "true");
};
// ### rules ###
// as taken from overview-reduction-and-equivalence.pdf, i.e. the script
// to be displayed as reference
type availableRules =
  | "Kong"
  | "Fun"
  | "FunError"
  | "Prim"
  | "PrimError"
  | "Const"
  | "ConstError"
  | "CondTrue"
  | "CondFalse"
  | "CondError"
  | "StructMake"
  | "StructMakeError"
  | "StructSelect"
  | "StructSelectError"
  | "StructPredTrue"
  | "StructPredFalse"
  | "StructPredError"
  | "Prog"
  | "ProgError";
const rules = {
  Kong: {
    name: `<cap>Kong</cap>`,
    text: `
      <em>E[e<small>1</small>] → E[e<small>2</small>] falls e<small>1</small> → e<small>2</small></em><br>
      <em>‹E› ::= []<br>
      &nbsp;&nbsp;&nbsp;| (‹name› ‹v›* ‹E› ‹e›*)<br>
      &nbsp;&nbsp;&nbsp;| (<strong>cond</strong> [‹E› ‹e› ]{[ ‹e› ‹e›]}*)</em>
    `,
  },
  Fun: {
    name: `<cap>Fun</cap>`,
    text: `
      <em>(name v<small>1</small> … v<small>n</small>) →
      e[name<small>1</small> := v<small>1</small> … name<small>n</small> := v<small>n</small> ]</em>
      falls
      <em>(</em> <strong>define</strong> <em>(name name<small>1</small> … name<small>n</small>) e)</em> in Umgebung
    `,
  },
  FunError: {
    name: `<cap>FunError</cap>`,
    text: `
      <em>(name v<small>1</small> … v<small>n</small>) → Error</em>
      falls
      <em>(</em> <strong>define</strong> <em>(name name<small>1</small> … name<small>n</small>) e)</em> nicht in Umgebung.
    `,
  },
  Prim: {
    name: `<cap>Prim</cap>`,
    text: `
      <em>(name v<small>1</small> … v<small>n</small>) → v</em> falls
      <em>name</em> eine primitive Funktion <em>f</em> ist und
      <em>f(v<small>1</small> … v<small>n</small>) = v</em>
    `,
  },
  PrimError: {
    name: `<cap>Prim</cap>-Error`,
    text: `
      <em>(name v<small>1</small> … v<small>n</small>) → Error</em> falls
      <em>name</em> eine primitive Funktion <em>f</em> ist und
      <em>f(v<small>1</small> … v<small>n</small>) = Error</em>
    `,
  },
  Const: {
    name: `<cap>Const</cap>`,
    text: `
      <em>name → v</em> falls <em>(<strong>define</strong> name v)</em> in Umgebung.
    `,
  },
  ConstError: {
    name: `<cap>Const</cap>-Error`,
    text: `
      <em>name → Error</em> falls <em>(<strong>define</strong> name v)</em>
      nicht in Umgebung.
    `,
  },
  CondTrue: {
    name: `<cap>Cond</cap>-True`,
    text: `
      <em>(<strong>cond</strong> [<strong>#true</strong> e] …) → e</em>
    `,
  },
  CondFalse: {
    name: `<cap>Cond</cap>-False`,
    text: `
      <em>(<strong>cond</strong> [<strong>#false</strong> e<small>1</small>]
         [e<small>2</small> e<small>3</small>] …) →
         (<strong>cond</strong> [e<small>2</small> e<small>3</small>] …)</em>
    `,
  },
  CondError: {
    name: `<cap>Cond</cap>-Error`,
    text: `
      <em>(<strong>cond</strong> [e<small>1</small> e<small>2</small>] …) →
          (<strong>error</strong> "cond: all conditions false")</em>
    `,
  },
  StructMake: {
    name: `<cap>Struct</cap>-make`,
    text: `
      <em>(<strong>make</strong>-name v<small>1</small> … v<small>n</small>) →
      &lt;<strong>make</strong>-name v<small>1</small> … v<small>n</small>&gt;</em>
      falls <em>(<strong>define-struct</strong> name (name<small>1</small> … name<small>n</small>))</em> in Umgebung
    `,
  },
  StructMakeError: {
    name: `<cap>Struct</cap>-make-Error`,
    text: ``,
  },
  StructSelect: {
    name: `<cap>Struct</cap>-select`,
    text: `
      <em>(name-name<small>i</small> &lt;<strong>make</strong>-name
        v<small>1</small> … v<small>n</small>&gt;) → v<small>i</small></em>
        falls <em>(<strong>define-struct</strong> name
          (name<small>1</small> … name<small>n</small>))</em> in Umgebung
    `,
  },
  StructSelectError: {
    name: `<cap>Struct</cap>-select-Error`,
    text: ``,
  },
  StructPredTrue: {
    name: `<cap>Struct</cap>-predtrue`,
    text: `
      <em>(name? &lt;<strong>make</strong>-name …&gt;) → <strong>#true</strong></em>
    `,
  },
  StructPredFalse: {
    name: `<cap>Struct</cap>-predfalse`,
    text: `
      <em>(name? v) → <strong>#false</strong></em> falls <em>v</em> nicht
      <em>&lt;<strong>make</strong>-name …&gt;</em> ist
    `,
  },
  StructPredError: {
    name: `<cap>Struct</cap>-prederror`,
    text: ``,
  },
  Prog: {
    name: `<cap>Prog</cap>`,
    text: `
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
    `,
  },
  ProgError: {
    name: `<cap>Prog</cap>-Error`,
    text: `
    Ein Programm wird von links nach rechts ausgeführt und startet mit der
    leeren Umgebung. Ist das nächste Programmelement eine Funktions- oder
    Strukturdefinition, so wird diese Definition in die Umgebung aufgenommen
    und die Ausführung mit dem nächsten Programmelement in der erweiterten
    Umgebung fortgesetzt. Sofern die Definition allerdings schon in der Umgebung
    vorhanden ist, wird ein Fehler ausgegeben.
    `,
  },
};
// execute the const rule = ...-definition in a js console (e.g. Dev Tools)
// and then run the following snippet to
// verify it contains no invalid HTML with open tags
// Object.keys(rules).forEach(name => {
//   const rule = rules[name];
//   const text = `${rule.name}${rule.text}`;
//   const tags = text
//     .split('<')
//     .slice(1)
//     .map(s => s.split('>')[0])
//     .filter(s => s != 'br');
//   let tagStack = [];
//   tags.forEach(t => {
//     if(!t.startsWith('/')) return tagStack.push(t);
//     const tag = t.slice(1);
//     if(tagStack.pop() != tag) throw Error(
//       `Rule ${name} contains invalid HTML: ${t} has no corresponding open tag`);
//   });
//   if (tagStack.length > 0)
//     throw Error(`Rule ${name} contains invalid HTML: ${tagStack.join(',')} are opened but not closed`);
// });
