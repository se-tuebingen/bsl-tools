// ######### LAYOUT AST AS TREE DIAGRAM ########
// depends on pprint.ts for printing code
import * as BSL_AST from "./BSL_AST";
import * as Pprint from "./Pprint";
// https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft

// #### main api #####
// add forest of program expressions to html element
export function treeProgram(program: BSL_AST.program, target: HTMLElement){
  target.innerHTML = program.map(treeDefOrExpr).join('\n');
  // align connectors horizontally
  adjustAllConnectors(target);
  // add data where holes should move upon expanding
  addHoleTranslations(target);
  // add collapsers
  addCollapsers(target);
}

// #### render helpers (textual html generators) ####
function treeDefOrExpr(root: BSL_AST.defOrExpr) {
  return `<ul class="tree ast"><li>${BSL_AST.isDefinition(root) ? treeDefinition(root): treeE(root)}</li></ul>`;
}

function treeDefinition(d: BSL_AST.definition) {
  if(BSL_AST.isFunDef(d)) {
    return `
      <span>
        <div class="name">Function Definition</div>
        <div>( define
          (
            <div class="hole hole-1 hole-name">
              <div class="code">${Pprint.pprint([d.name])}</div>
              <div class="placeholder">name</div>
            </div>
            <div class="hole hole-2 hole-names">
              ${d.args.map(a =>
                `<div class="code">${Pprint.printName(a)}</div>`
              ).join(' ')}
              <div class="placeholder">name+</div>
            </div>
          )
          <div class="hole hole-3">
            <div class="code">${Pprint.pprint([d.body])}</div>
            <div class="placeholder">e</div>
          </div>
        )</div>
      </span>
      <ul>
        <li class="child-1">${treeName(d.name)}</li>
        ${d.args.map(a =>
          `<li class="child-2">${treeName(a)}</li>`
        ).join('')}
        <li class="child-3">${treeE(d.body)}</li>
      </ul>`;
  } else if(BSL_AST.isConstDef(d)) {
    return `
      <span>
        <div class="name">Constant Definition</div>
        <div>( define
          <div class="hole hole-1 hole-name">
            <div class="code">${Pprint.pprint([d.name])}</div>
            <div class="placeholder">name</div>
          </div>

          <div class="hole hole-2">
            <div class="code">${Pprint.pprint([d.value])}</div>
            <div class="placeholder">e</div>
          </div>
        )</div>
      </span>
      <ul>
        <li class="child-1">${treeName(d.name)}</li>
        <li class="child-2">${treeE(d.value)}</li>
      </ul>`;
  } else if(BSL_AST.isStructDef(d)) {
    return `
      <span>
        <div class="name">Struct Definition</div>

        <div>(define-struct
          <div class="hole hole-1 hole-name">
            <div class="code">${Pprint.pprint([d.binding])}</div>
            <div class="placeholder">name</div>
          </div>
          (
            <div class="hole hole-2 hole-names">
              ${d.properties.map(p =>
                `<div class="code">${Pprint.printName(p)}</div>`
              ).join(' ')}
              <div class="placeholder">name*</div>
            </div>
          )
        )</div>
      </span>
      <ul>
        <li class="child-1">${treeName(d.binding)}</li>
        ${d.properties.map(p =>
          `<li class="child-2">${treeName(p)}</li>`
        ).join('')}
      </ul>`;
  } else {
    console.error('Invalid input to printDefinition');
  }
}

function treeE(e: BSL_AST.expr): string {
  if(BSL_AST.isCall(e)) {
    return `
      <span>
        <div class="name">Function Call</div>

        <div>(
          <div class="hole hole-1 hole-name">
            <div class="code">${Pprint.pprint([e.name])}</div>
            <div class="placeholder">name</div>
          </div>

          <div class="hole hole-2">
            ${e.args.map(a =>
              `<div class="code">${Pprint.printE(a)}</div>`
            ).join(' ')}
            <div class="placeholder">e*</div>
          </div>
        )</div>
      </span>
      <ul>
        <li class="child-1">${treeName(e.name)}</li>
        ${e.args.map(a =>
          `<li class="child-2">${treeE(a)}</li>`
        ).join('')}
      </ul>`;
  } else if(BSL_AST.isCond(e)) {
    return `
      <span>
        <div class="name">Cond-Expression</div>
        <div>( cond
          <div class="hole hole-2">
            ${e.options.map(o =>
              `<div class="code">${Pprint.printOption(o)}</div>`
            ).join(' ')}
            <div class="placeholder">[ e e ]+</div>
          </div>
         )</div>
      </span>
      <ul>
        ${e.options.map(o =>
          `<li class="child-2">${treeOption(o)}</li>`
        ).join(' ')}
      </ul>`;
  } else if(BSL_AST.isName(e)) {
    return treeName(e);
  } else if(BSL_AST.isV(e)) {
    return `
      <span>
        <div class="name">Literal Value</div>
        <div>${Pprint.pprint([e])}</div>
      </span>`;
  } else {
    console.error('Invalid input to treeE');
    return `<span>${e}</span>`;
  }
}

function treeOption(o: BSL_AST.Clause) {
  return `
    <span>
      <div class="name">Cond-Option</div>
      <div>[
        <div class="hole hole-1">
          <div class="code">${Pprint.pprint([o.condition])}</div>
          <div class="placeholder">e</div>
        </div>

        <div class="hole hole-2">
          <div class="code">${Pprint.pprint([o.result])}</div>
          <div class="placeholder">e</div>
        </div>
       ]
      </div>
    </span>
    <ul>
      <li class="child-1">${treeE(o.condition)}</li>
      <li class="child-2">${treeE(o.result)}</li>
    </ul>
  `;
}

function treeName(s: BSL_AST.Name): string {
  return `
    <span>
      <div class="name">Symbol</div>
      <div>${s.symbol}</div>
    </span>`;
}

// ###### layout helper ########
// dynamically compute dimensions of connectors between nodes
// such that they point to the correct "hole"
function adjustAllConnectors(tree: HTMLElement) {
  adjustConnectors(tree,'hole-1','child-1');
  adjustConnectors(tree,'hole-2','child-2');
  adjustConnectors(tree,'hole-3','child-3');
}
function adjustConnectors(tree: HTMLElement, holeClass:string, childClass: string) {
  Array.from(tree.getElementsByClassName(holeClass)).map(h => {
    const el: HTMLElement = h as HTMLElement;
    const xpos = 0.5 * (el.getBoundingClientRect().x + el.getBoundingClientRect().right) ;
    // no layout effect if hole is invisible
    if (xpos == 0) return;

    // navigate the DOM
    const ul = navigateDOM([el], '../../+')[0];

    // process children
    Array.from(ul.children).filter(c => c.classList.contains(childClass)).map(c => {
      const child = c as HTMLElement;
      const xposChild = 0.5 * (child.getBoundingClientRect().x + child.getBoundingClientRect().right);
      const xdiff = xpos - xposChild;
      let cssText = '';
      if (xdiff < 0) {
        cssText += `
          --connector-left: auto;
          --connector-right: 50%;
          --connector-border-left-style: solid;
          --connector-border-right-style: none;`;
      } else {
        cssText += `
          --connector-left: 50%;
          --connector-right: auto;
          --connector-border-left-style: none;
          --connector-border-right-style: solid;`;
      }
      cssText += `--connector-width: ${Math.abs(xdiff) + 1}px;`;
      child.style.cssText = cssText;
    });

  });
}
// add information on where holes should move on expansion
function addHoleTranslations(tree: HTMLElement) {
  Array.from(tree.getElementsByClassName('name')).map(e => {
    // code figments in parent node
    const codes = navigateDOM([e as HTMLElement], '+/.hole/.code');
    if(codes.length == 0) return;
    // corresponding child node elements
    const children = navigateDOM([e as HTMLElement], '../+/li/span/.name/+');

    if(codes.length != children.length) {
      console.error('Error: More or less children than code figments', e, codes, children);
      return;
    }

    for(let i = 0; i < codes.length; i++) {
      const code = codes[i];
      const child = children[i];

      const codePos = code.getBoundingClientRect();
      const childPos = child.getBoundingClientRect();

      code.style.cssText = `
        --translate-x: ${(childPos.x + childPos.right)/2 - (codePos.x + codePos.right)/2}px;
        --translate-y: ${childPos.y - codePos.y}px;
      `;
    }

  });
}

// navigate the DOM using path notation
// .. -> parent
// +  -> next sibling
// .class -> all children with a class
// tag -> all children of a certain tag
// divided by /
function navigateDOM(positions: HTMLElement[], path: string): HTMLElement[] {
  const steps = path.split('/');
  const currStep = steps.shift() as string;
  if (currStep == '') return positions;
  const restSteps = steps.join('/');

  if (currStep == '..') {
    // navigate up
    const newPositions = positions.map(p => p.parentElement);
    if (newPositions.every(p => p)) {
      return navigateDOM(newPositions as HTMLElement[], restSteps);
    } else {
      console.error(`Error traversing ${path}: Missing parentElement`, positions);
      return [];
    }
  } else if (currStep == '+') {
    // navigate sideways
    const newPositions = positions.map(p => p.nextElementSibling);
    if (newPositions.every(p => p)) {
      return navigateDOM(newPositions as HTMLElement[], restSteps);
    } else {
      console.error(`Error traversing ${path}: Missing nextElementSibling`, positions);
      return [];
    }
  } else if (currStep.startsWith('.')) {
    // navigate down + filter for class
    const className = currStep.slice(1);
    const newPositions = positions.flatMap(p => Array.from(p.children).filter(c => c.classList.contains(className)));
    return navigateDOM(newPositions as HTMLElement[], restSteps);
  } else {
    // navigate down + filter for tag
    const newPositions = positions.flatMap(p => Array.from(p.children).filter(c => c.tagName == currStep.toUpperCase()));
    return navigateDOM(newPositions as HTMLElement[], restSteps);
  }
}

// collapse/expand nodes
function addCollapsers(target: HTMLElement) {
  Array.from(target.getElementsByTagName('span')).map(l => {
    l.onclick = () => {
      const li : HTMLElement  = l as HTMLElement;
      if(li.getAttribute('data-collapsed')) {
        li.removeAttribute('data-collapsed');
      } else {
        li.setAttribute('data-collapsed', 'true');
        const ul = li.nextElementSibling as HTMLElement;
        if(!ul) return;
        // recursively close children
        Array.from(ul.getElementsByTagName('span')).map(s => {
          s.setAttribute('data-collapsed', 'true');
        });
      }
    }
  });
}
