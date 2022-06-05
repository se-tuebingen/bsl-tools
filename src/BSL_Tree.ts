// ######### LAYOUT AST AS TREE DIAGRAM ########
import * as BSL_AST from "./BSL_AST";
import * as BSL_Print from "./BSL_Print";
// https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft

// #### main api #####
// add forest of program expressions to html element
export function treeProgram(program: BSL_AST.program, target: HTMLElement, quiz=false){
  const nodeFn = quiz ? quizNode : treeNode;
  target.innerHTML = program.map(e => treeDefOrExpr(e, nodeFn)).join('\n');
  // align connectors horizontally
  adjustAllConnectors(target);
  // add data where holes should move upon expanding
  addHoleTranslations(target);
  // add collapsers
  if (!quiz) addCollapsers(target);
}

// #### render helpers (textual html generators) ####
function treeDefOrExpr(root: BSL_AST.defOrExpr, nodeFn: treeNodeFn) {
  return `<ul class="tree ast"><li>${BSL_AST.isDefinition(root) ? treeDefinition(root, nodeFn): treeE(root, nodeFn)}</li></ul>`;
}

interface Hole {
  pos?: number;
  code: string | string[];
  placeholder: string;
}
function treeHole(h: Hole) {
  if (typeof h.code === 'string') h.code = [h.code];
  const classes = [
    'hole',
    (h.pos ? `hole-${h.pos}` : ''),
    (h.placeholder === 'name' ? 'hole-name' : ''),
    (['name+','name*'].includes(h.placeholder) ? 'hole-names' : '')
  ].join(' ');
  return `
    <div class="${classes}">
      ${h.code.map(c => `<div class="code">${c}</div>`).join(' ')}
      <div class="placeholder">${h.placeholder}</div>
    </div>
  `;
}
interface TreeNode {
  production: BSL_AST.Production;
  code: (string|Hole)[];
}
type treeNodeFn = (n: TreeNode) => string;

function treeNode(n: TreeNode): string {
  return `
    <span>
      <div class="name">${n.production}</div>
      <div>
        ${n.code.map(c => typeof c === 'string' ? c : treeHole(c)).join(' ')}
      </div>
    </span>
  `;
}

function quizNode(n: TreeNode): string {
  return `
    <span data-collapsed="true">
      <div class="name">${n.production}</div>
      <div>
        ${n.code.map(c => typeof c === 'string' ? c : treeHole(c)).join(' ')}
      </div>
    </span>
  `;
}

function treeDefinition(d: BSL_AST.definition, nodeFn: treeNodeFn) {
  if(BSL_AST.isFunDef(d)) {
    const n = {
      production: d.type,
      code: [
        '( define ( ',
        {
          pos: 1,
          code: BSL_Print.pprint([d.name]),
          placeholder: 'name'
        },
        {
          pos: 2,
          code: d.args.map(BSL_Print.printName),
          placeholder: 'name+'
        },
        ') ',
        {
          pos: 3,
          code: BSL_Print.pprint([d.body]),
          placeholder: 'e'
        },
        ')'
      ]
    };
    return `
      ${nodeFn(n)}
      <ul>
        <li class="child-1">${treeName(d.name, nodeFn)}</li>
        ${d.args.map(a =>
          `<li class="child-2">${treeName(a, nodeFn)}</li>`
        ).join('')}
        <li class="child-3">${treeE(d.body, nodeFn)}</li>
      </ul>`;
  } else if(BSL_AST.isConstDef(d)) {
    const n = {
      production: d.type,
      code: [
        '( define ',
        {pos:1, code:BSL_Print.pprint([d.name]), placeholder: 'name'},
        {pos:2, code:BSL_Print.pprint([d.value]), placeholder: 'e'},
        ')'
      ]
    };
    return `
      ${nodeFn(n)}
      <ul>
        <li class="child-1">${treeName(d.name, nodeFn)}</li>
        <li class="child-2">${treeE(d.value, nodeFn)}</li>
      </ul>`;
  } else if(BSL_AST.isStructDef(d)) {
    const n = {
      production: d.type,
      code: [
        '( define-struct ',
        {pos: 1, code: BSL_Print.pprint([d.binding]), placeholder: 'name'},
        '(',
        {pos: 2, code: d.properties.map(BSL_Print.printName), placeholder: 'name*'},
        ') )'
      ]
    };
    return `
      ${nodeFn(n)}
      <ul>
        <li class="child-1">${treeName(d.binding, nodeFn)}</li>
        ${d.properties.map(p =>
          `<li class="child-2">${treeName(p, nodeFn)}</li>`
        ).join('')}
      </ul>`;
  } else {
    console.error('Invalid input to printDefinition');
  }
}

function treeE(e: BSL_AST.expr, nodeFn: treeNodeFn): string {
  if(BSL_AST.isCall(e)) {
    const n = {
      production: e.type,
      code: [
        '( ',
        {pos: 1, code: BSL_Print.pprint([e.name]), placeholder: 'name'},
        ' ',
        {pos: 2, code: e.args.map(BSL_Print.printE), placeholder: 'e*'},
        ')'
      ]
    };
    return `
      ${nodeFn(n)}
      <ul>
        <li class="child-1">${treeName(e.name, nodeFn)}</li>
        ${e.args.map(a =>
          `<li class="child-2">${treeE(a, nodeFn)}</li>`
        ).join('')}
      </ul>`;
  } else if(BSL_AST.isCond(e)) {
    const n = {
      production: e.type,
      code: [
        '( cond ',
        {pos: 2, code: e.options.map(BSL_Print.printOption), placeholder: '[ e e ]+'},
        ')'
      ]
    }
    return `
      ${nodeFn(n)}
      <ul>
        ${e.options.map(o =>
          `<li class="child-2">${treeOption(o, nodeFn)}</li>`
        ).join(' ')}
      </ul>`;
  } else if(BSL_AST.isName(e)) {
    return treeName(e, nodeFn);
  } else if(BSL_AST.isLiteral(e)) {
    const n = {
      production: e.type,
      code: [BSL_Print.printE(e)]
    }
    return nodeFn(n);
  } else {
    console.error('Invalid input to treeE');
    console.error(e);
    return `
      <span>
        <div class="name">Invalid input to treeE</div>
        <div>${e}</div>
      </span>
    `;
  }
}

function treeOption(o: BSL_AST.Clause, nodeFn: treeNodeFn) {
  const n = {
    production: o.type,
    code: [
      '[',
      {pos:1, code: BSL_Print.printE(o.condition), placeholder: 'e'},
      ' ',
      {pos:2, code: BSL_Print.printE(o.result), placeholder: 'e'},
      ']'
    ]
  }
  return `
    ${nodeFn(n)}
    <ul>
      <li class="child-1">${treeE(o.condition, nodeFn)}</li>
      <li class="child-2">${treeE(o.result, nodeFn)}</li>
    </ul>
  `;
}

function treeName(s: BSL_AST.Name, nodeFn: treeNodeFn): string {
  const n = {
    production: s.type,
    code: [BSL_Print.printName(s)]
  }
  return nodeFn(n);
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
