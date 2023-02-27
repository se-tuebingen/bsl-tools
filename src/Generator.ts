// ######### TREE & STEPPER ########
import { parse } from "./BSL_Parser";
import * as BSL_AST from "./BSL_AST";
import { getParentClassRecursive, navigateDOM } from "./DOM_Helpers";

// # main function: generate a tree or a stepper through <generator> tag
export function processGenerators(): void {
  Array.from(document.getElementsByTagName("generator")).map((el) => {
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
            (define f (* x 2))
            (f 21)
          </textarea>
        </label><br>
        <button onclick="bsl_tools_generate(event)" data-type="tree">
          Generate Tree
        </button><br>
        <button onclick="bsl_tools_generate(event)" data-type="tree-quiz">
          Generate Tree Quiz
        </button><br>
        <button onclick="bsl_tools_generate(event)" data-type="stepper">
          Generate Stepper
        </button>
      </div>
      <div class="output">
      </div>
    </div>`;
}
(window as any).bsl_tools_generate = (e: Event) => {
  const button = e.target as HTMLElement;
  const type = button.getAttribute("data-type");
  const input = getParentClassRecursive(button, 'input');
  if (!input) {
    console.error("generate_tree called from button not within input div");
    return;
  }
  const textarea = input.getElementsByTagName("textarea")[0];
  const code = textarea.value;
  let program: BSL_AST.program = [];
  try {
    program = parse(code);
  } catch (e) {
    window.alert(e);
    return;
  }

  const output = navigateDOM([input], '../.output')[0];
  const div = document.createElement('div');
  div.classList.add("generated");
  output.appendChild(div);
  const innerDiv = document.createElement('div');
  div.appendChild(innerDiv);
  const removePart = document.createElement('div');
  removePart.innerHTML = `
    <button onclick="bsl_tools_remove(event)">Remove</button>
  `;
  div.appendChild(removePart);
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




// ######### RENDERING ########

export function renderGenerator(el: Element): string {
    return ``
}


// ######### EVENT HANDLERS ########
// # event handler for <generator> tag
/*export function onGeneratorClick(e: Event): void {
    e.preventDefault();
    const el = e.target as HTMLElement;
    const id = el.getAttribute("data-id");
    const type = el.getAttribute("data-type");
    const generator = document.getElementById(id);
    if (generator) {
        if (type === "tree") {
        generator.innerHTML = renderGenerator(generator);
        } else if (type === "stepper") {
        generator.innerHTML = renderGenerator(generator);
        }
    }
}*/
