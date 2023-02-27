// ######### TREE & STEPPER ########
import { parse } from "./BSL_Parser";
import * as BSL_AST from "./BSL_AST";
import { getParentClassRecursive, navigateDOM } from "./DOM_Helpers";
import { setUpStepperGui } from "./SI_Renderer";
import { programToNode, productions } from "./BSL_Tree";
import { productionTree } from "./Production_Tree";

// # main function: generate a tree or a stepper through <generator> tag
export function processGenerators(): void {
  Array.from(document.getElementsByTagName("bsltoolsgenerator")).map((el) => {
    try {
      initGenerator(el);
    } catch (e) {
      console.error(e);
    }
  });
}

// ######### INITIALIZATION ########
export function initGenerator(el: Element) {
    el.innerHTML =  `
    <div class="bsl-tools-generator">
      <div class="input">
        <label>
          <p>Enter valid BSL Code here:</p>
          <textarea id="code" cols="80" rows="5">
(define (f x) (* x 2))
(f 21)
          </textarea>
        </label><br>
        <button onclick="bsl_tools_generate(event)" data-type="tree">
          Generate Tree
        </button> |
        <button onclick="bsl_tools_generate(event)" data-type="tree-quiz">
          Generate Tree Quiz
        </button> |
        <button onclick="bsl_tools_generate(event)" data-type="stepper">
          Generate Stepper
        </button>
      </div>
      <div class="output">
      </div>
    </div>`;
}
(window as any).bsl_tools_generate = (e: Event) => {
  // setup
  const button = e.target as HTMLElement;
  const type = button.getAttribute("data-type");
  if(!type || !['tree', 'tree-quiz', 'stepper'].includes(type)) {
    console.error("invalid attribute data-type, must be one of tree, tree-quiz, stepper", type);
    return;
  }
  const input = getParentClassRecursive(button, 'input');
  if (!input) {
    console.error("generate_tree called from button not within input div");
    return;
  }
  const textarea = input.getElementsByTagName("textarea")[0];
  const code = textarea.value;

  // parse Program
  let program: BSL_AST.program = [];
  try {
    program = parse(code);
  } catch (e) {
    window.alert(e);
    return;
  }

  // generate input piece
  const output = navigateDOM([input], '../.output')[0];
  const div = document.createElement('div');
  div.classList.add("generated");
  div.style.marginTop = "2em";
  div.style.borderBottom = "1px solid grey";
  output.prepend(div);
  const innerDiv = document.createElement('div');
  div.appendChild(innerDiv);
  const removePart = document.createElement('div');
  removePart.style.marginBottom = "1em";
  removePart.innerHTML = `
    <button onclick="bsl_tools_remove(event)">Remove ${type} above</button>
  `;
  div.appendChild(removePart);

  // actually generate stuff
  let quiz = false;
  switch(type) {
    case 'stepper':
      setUpStepperGui(program, innerDiv);
      return;
    case 'tree-quiz':
      quiz = true;
    case 'tree':
      const root = programToNode(program);
      productionTree(root, innerDiv, productions, quiz, 'en');
      return;
  }
}

(window as any).bsl_tools_remove = (e: Event) => {
  const button = e.target as HTMLElement;
  const generated = getParentClassRecursive(button, 'generated');
  if(!generated) {
    console.error("bsl_tools_remove called from button not within generated div");
    return;
  }
  generated.remove();
}
