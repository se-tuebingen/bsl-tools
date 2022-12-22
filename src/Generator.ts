// ######### TREE & STEPPER ########
import * as SI_Renderer from "./SI_Renderer";
import * as BSL_Tree from "./BSL_Tree";

// # main function: generate a tree or a stepper through <generator> tag
export function ProcessGenerator(): void {
  Array.from(document.getElementsByTagName("generator")).map((el) => {
    try {
      el.innerHTML = initGenerator(el);
    } catch (e) {
      console.error(e);
    }
  });
}

// ######### INITIALIZATION ########
export function initGenerator(el: Element): string {
    return `<div class="generator">`

}




// ######### RENDERING ########

export function renderGenerator(el: Element): string {
    return ``
}


// ######### EVENT HANDLERS ########
// # event handler for <generator> tag
export function onGeneratorClick(e: Event): void {
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
}