// parsing and processing code input
import { parse } from "./BSL_Parser";
import * as BSL_AST from "./BSL_AST";
import * as BSL_Print from "./BSL_Print";
// small-step interpreter back-end
import * as SI_STRUCT from "./SI_STRUCT";
import { calculateProgram } from "./SI";
// styles & icon ressources
import { default as small_interpreter_css } from "./ressources/small-interpreter.css";
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
      console.log(BSL_Print.indent(BSL_Print.pprint(program), 30));
      setUpStepperGui(program, el as HTMLElement);
    } catch (e: any) {
      let error;
      if (e) {
        console.error(e);
        error = `${e}`;
      } else {
        console.log("Unknown error");
        error = "Unknown Error";
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
export function setUpStepperGui(
  program: BSL_AST.program,
  el: HTMLElement
): void {
  // add css if necessary
  if (!document.getElementById("bsl-tools-stepper-style")) {
    const styleNode = document.createElement("style");
    styleNode.innerHTML = small_interpreter_css;
    styleNode.id = "bsl-tools-stepper-style";
    document.getElementsByTagName("head")[0].appendChild(styleNode);
  }
  // calculate Steps
  const expr = program[0] as BSL_AST.expr;
  console.log("expression", expr);
  const stepper = calculateProgram(program);
  if (stepper instanceof Error) {
    throw stepper;
  }
  console.log("stepper", stepper);
  // set language
  let lang = el.getAttribute("lang");
  if (!lang) {
    lang = "en";
  } else if (!implementedLanguages.includes(lang)) {
    console.error(`
        Language ${lang} is not implemented for this module,
        you can choose from ${implementedLanguages.join(",")}.
        Defaulting to 'en'.
      `);
    lang = "en";
  }
  // get width of single character for dynamic maxwidth indentation
  setCharPxWidth(el);
  // render and attach
  el.innerHTML = renderStepper(stepper, lang as implementedLanguage);
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
    "remaining program": "Übriges Programm",
    "start evaluation": "Auswertung Starten",
    "evaluation finished": "Auswertung Beendet",
    "go back": "Schritt zurück",
  },
};

// ####### RENDER FUNCTIONS #######
// helper for getting width of em in px
let charPxWidth = 12; // arbitrary default
let maxWidthInChars = 80;
function setCharPxWidth(el: HTMLElement): void {
  el.innerHTML = `
    <div class="stepper" style="width: 100%;">
      <div class="box">
        <div class="step code"
             data-currentStep="true">
          <p style="display: inline-block;">Loading...</p>
        </div>
      </div>
    </div>
  `;
  const p = el.getElementsByTagName("p")[0];
  const stepper = el.getElementsByClassName("stepper")[0];
  if (!p || !stepper) {
    console.error("failed to inject measuring HTML into", el);
    return;
  }
  charPxWidth = p.clientWidth / "Loading...".length;
  console.log(`Found that 1em is ${charPxWidth} wide`);
  const factor = 0.9;
  maxWidthInChars = Math.round((factor * stepper.clientWidth) / charPxWidth);
  console.log(`
    That means to fill ${factor} of the available width,
    we may print at most ${maxWidthInChars} characters.
  `);
}

// main function
function renderStepper(
  stepper: SI_STRUCT.Stepper,
  lang: implementedLanguage
): string {
  const progSteps = stepper.progSteps;

  const str = `<div class="stepper">

       <div class="box environment">
         <div class="boxlabel">${dictionary[lang]["environment"]}</div>
         ${progSteps.map(renderDefinition).join("")}
       </div>

       <div class="box expression-steps"
            data-progstep="-1"
            data-visible="true">
         <div class="boxlabel">${dictionary[lang]["current evaluation"]}</div>
         <div class="step"
              data-currentStep="true">
           <div class="next-button"
                onclick="gotoExpression(event, 1)">
             ${
               dictionary[lang]["start evaluation"]
             } <img class="icon" src="${angle_down}">
           </div>
         </div>
       </div>

       ${progSteps.map((el, i) => renderEvalSteps(el, i, lang)).join("")}

       <div class="box expression-steps"
            data-progstep="${progSteps.length}"
            data-visible="false">
         <div class="boxlabel">${dictionary[lang]["current evaluation"]}</div>
         <div class="step"
              data-currentStep="true">
            <div class="code">${dictionary[lang]["evaluation finished"]}</div>
            <div class="prev-button"
                 onclick="gotoExpression(event, -1)">
              ${
                dictionary[lang]["go back"]
              } <img class="icon" src="${angle_up}">
            </div>
         </div>
       </div>

       <div class="box program">
         <div class="boxlabel">${dictionary[lang]["remaining program"]}</div>
         ${progSteps.map(renderOriginalExpression).join("")}
       </div>

    </div>`;
  return str;
}
(window as any).gotoExpression = (e: Event, a: number) => {
  navigateExpression(e, a);
};
// render what remains of an expression after evaluation
function renderDefinition(progStep: SI_STRUCT.ProgStep, idx: number): string {
  // filtering at this position in order to keep correct implicit progStep index
  if (SI_STRUCT.isDefinitionStep(progStep)) {
    return `
      <div class="step code"
           data-progstep="${idx}"
           data-visible="false">
        ${BSL_Print.indent(
          BSL_Print.sanitize(BSL_Print.printDefinition(progStep.result)),
          maxWidthInChars,
          "html"
        )}
      </div>
    `;
  } else {
    return "";
  }
}

// render the part of the original Program that is being represented by a progstep
function renderOriginalExpression(
  progStep: SI_STRUCT.ProgStep,
  idx: number
): string {
  return `
    <div class="step code"
         data-progstep="${idx}"
         data-visible="true">
      ${BSL_Print.indent(
        BSL_Print.sanitize(
          BSL_Print.printDefOrExpr(progStep.originalDefOrExpr)
        ),
        maxWidthInChars,
        "html"
      )}
    </div>
  `;
}
// one stepper for one expression
function renderEvalSteps(
  progStep: SI_STRUCT.ProgStep,
  idx: number,
  lang: implementedLanguage
): string {
  function renderDefinitionContext(def: BSL_AST.definition): Context {
    if (BSL_AST.isConstDef(def)) {
      return { left: `(define ${def.name.symbol} `, right: ")" };
    } else {
      // does not matter, no eval steps here anyway
      return { left: "", right: "" };
    }
  }
  const ctx = SI_STRUCT.isDefinitionStep(progStep)
    ? renderDefinitionContext(progStep.originalDefOrExpr)
    : { left: "", right: "" };
  return `
    <div class="box expression-steps"
         data-progstep="${idx}"
         data-visible="false">
      <div class="boxlabel">${dictionary[lang]["current evaluation"]}</div>
      ${
        // all evaluation steps
        progStep.evalSteps
          .map((el, i) => renderStep(i, el, lang, { ...ctx }))
          .join("")
        // result
      }
      <div class="step"
           data-step="${progStep.evalSteps.length}"
           data-currentStep="${
             progStep.evalSteps.length === 0 ? "true" : "false"
           }"
           data-collapsed="false">
        <div class="prev-button"
             onclick="prevStep(event)">
          ${
            dictionary[lang]["previous step"]
          } <img class="icon" src="${angle_up}">
        </div>
        <div class="next-button"
             onclick="nextStep(event)">
          ${
            dictionary[lang]["next step"]
          } <img class="icon" src="${angle_down}">
        </div>

        <div class="split-result code">
          ${
            SI_STRUCT.isDefinitionStep(progStep)
              ? BSL_Print.printDefinition(progStep.result)
              : `${
                  progStep.result instanceof Error
                    ? progStep.result
                    : BSL_Print.printValue(progStep.result)
                }`
          }
        </div>
      </div>
    </div>
  `;
}
// navigate between expressions
function navigateExpression(e: Event, amount: number): void {
  const el = e.target as HTMLElement;
  // el will be a button
  const oldButtonPosition = el.getBoundingClientRect().y;
  const expressionDiv = getParentClassRecursive(el, "expression-steps");
  if (!expressionDiv) {
    console.error("found no parent with class .expression-steps", el);
    return;
  }
  const idxString = expressionDiv.getAttribute("data-progstep");
  if (!idxString) {
    console.error(
      "div with class .expression-steps has no data-progstep attribute",
      expressionDiv
    );
    return;
  }
  const idx = parseInt(idxString);
  const targetIdx = idx + amount;
  if (targetIdx < -1) {
    console.error(`cannot navigate to progStep ${targetIdx}: does not exist`);
    return;
  }
  // set visibility in environment
  navigateDOM([expressionDiv], "../.environment/div").map((def) => {
    const idxString = def.getAttribute("data-progstep");
    if (idxString) {
      if (parseInt(idxString) < targetIdx) {
        def.setAttribute("data-visible", "true");
      } else {
        def.setAttribute("data-visible", "false");
      }
    }
  });
  // set visibility in program
  navigateDOM([expressionDiv], "../.program/div").map((prog) => {
    const idxString = prog.getAttribute("data-progstep");
    if (idxString) {
      if (parseInt(idxString) <= targetIdx) {
        prog.setAttribute("data-visible", "false");
      } else {
        prog.setAttribute("data-visible", "true");
      }
    }
  });
  // show correct stepper
  navigateDOM([expressionDiv], "../.expression-steps").map((e) => {
    const idxString = e.getAttribute("data-progstep");
    if (idxString) {
      if (parseInt(idxString) === targetIdx) {
        e.setAttribute("data-visible", "true");
        // move prev/next-button to stay under mouse
        Array.from(e.children)
          .filter((c) => c.getAttribute("data-currentstep") === "true")
          .map((c) => {
            const newButton = c.querySelector(
              amount > 0 ? ".next-button" : ".prev-button"
            );
            if (!newButton) return;
            const newButtonPosition = newButton.getBoundingClientRect().y;
            window.scrollBy(0, newButtonPosition - oldButtonPosition);
          });
      } else {
        e.setAttribute("data-visible", "false");
      }
    }
  });
}

// one individual step
function renderStep(
  currentStep: number,
  step: SI_STRUCT.EvalStep,
  lang: implementedLanguage,
  ctx: Context = { left: "", right: "" }
): string {
  // console.log(`Rendering step ${currentStep}`);
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
  function renderResult(res: BSL_AST.expr | SI_STRUCT.Value | Error): string {
    if (SI_STRUCT.isValue(res)) {
      return `${
        context.left
      }<span class="hole hole-result">${BSL_Print.printValue(res)}</span>${
        context.right
      }`;
    } else if (res instanceof Error) {
      return `<span class="hole hole-result hole-error">"${res}"</span>`; // to prevent indentation issues
    } else {
      return `${
        context.left
      }<span class="hole hole-result">${BSL_Print.sanitize(
        BSL_Print.printE(res)
      )}</span>${context.right}`;
    }
  }
  const result: string = renderResult(redexRule.result);
  const ruleName = redexRule.type;
  // prepare indented code expressions
  const code_before = BSL_Print.indent(
    `${context.left}<span class="hole">${redex}</span>${context.right}`,
    maxWidthInChars,
    "html"
  );
  const code_after = BSL_Print.indent(result, maxWidthInChars, "html");

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
  const space_left = // 3 for the arrow, 2 for the icon ---v
    maxWidthInChars - left_offset_arrow - rules[ruleName]["name"].length - 5;
  const renderHolesInRule = redex.length + result.length <= space_left;

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
                  left_offset_arrow * charPxWidth
                }px">
             <span class="rule-name">${rules[ruleName]["name"]}</span>${
    renderHolesInRule
      ? `:
               <span class="rule-description">
                 <span class="hole rule-hole">${redex}</span> →
                 <span class="hole hole-result rule-hole">${result}</span>
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
  if (currentStep && currentStep.nextElementSibling) {
    currentStep.setAttribute("data-currentStep", "false");
    currentStep.setAttribute("data-collapsed", "true");
    currentStep.nextElementSibling.setAttribute("data-currentStep", "true");
    currentStep.nextElementSibling.setAttribute("data-collapsed", "false");
    // move "next" button under mouse
    const newButton =
      currentStep.nextElementSibling.querySelector(".next-button");
    if (!newButton) return;
    const newButtonPosition = newButton.getBoundingClientRect().y;
    window.scrollBy(0, newButtonPosition - oldButtonPosition);
  } else if (currentStep && !currentStep.nextElementSibling) {
    // continue with next expression
    navigateExpression(e, 1);
  }
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
  } else {
    const position = currentStep.getAttribute("data-step");
    if (position === "0") {
      navigateExpression(e, -1);
      return;
    } else if (currentStep.previousElementSibling) {
      currentStep.setAttribute("data-currentStep", "false");
      currentStep.setAttribute("data-collapsed", "true");
      currentStep.previousElementSibling.setAttribute(
        "data-currentStep",
        "true"
      );
      currentStep.previousElementSibling.setAttribute(
        "data-collapsed",
        "false"
      );
      // move "prev" button to be under mouse
      const newButton =
        currentStep.previousElementSibling.querySelector(".prev-button");
      if (!newButton) return;
      const newButtonPosition = newButton.getBoundingClientRect().y;
      window.scrollBy(0, newButtonPosition - oldButtonPosition);
    } else {
      console.error("prevStep called on a step with no previous html element");
      return;
    }
  }
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
      ...ctx.values.map((v) => `${v}`),
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
// recursive definition of printing the redex
function printRedex(redex: SI_STRUCT.Redex): string {
  if (SI_STRUCT.isCallRedex(redex)) {
    return `(${BSL_Print.printName(redex.name)} ${redex.args
      .map((arg) => (SI_STRUCT.isValue(arg) ? `${arg}` : printIdentifier(arg)))
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
