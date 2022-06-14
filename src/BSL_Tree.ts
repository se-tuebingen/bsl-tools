// ######### LAYOUT AST AS TREE DIAGRAM ########
import * as BSL_AST from "./BSL_AST";
import * as BSL_Print from "./BSL_Print";
import {navigateDOM} from "./DOM_Helpers";
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
function extractCode(h: Hole): string {
  if (typeof h.code === 'string') h.code = [h.code];
  return evenlySpace(h.code.join(' '));
}
interface TreeNode {
  production: BSL_AST.Production;
  code: (string|Hole)[];
}
type treeNodeFn = (n: TreeNode) => string;

// regular node. state:
// span
//  - data-collapsed: Whether children are visible
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

function evenlySpace(s: string) {
  return s.split(' ')
    .map(c => c.trim())
    .filter(c => c.length > 0)
    .join(' ')
    .replaceAll('( ', '(')
    .replaceAll(' )',')');
}

// quiz node. state:
// <span>
//  - data-collapsed: whether children are visible
//  - data-holes: subexpressions that have not yet been selected
//  - data-quiz: state of the quiz:
//     "production" (select correct production)
//     -> "holes" (select subexpressions)
//     -> "done" (all correctly answered)
//  - data-wrong: quiz question has been answered wrong
function quizNode(n: TreeNode): string {
  const code = evenlySpace(n.code.map(c => typeof c === 'string' ? c : extractCode(c)).join(' '));
  const holes = JSON.stringify(n.code.filter(c => typeof c !== 'string').map(c => extractCode(c as Hole))).replaceAll('"','&quot;');
  return `
    <span data-collapsed="true"
          data-holes="${holes}"
          data-quiz="production">
      <div class="name">
         ${n.production}
         <select data-solution="${n.production}"
                 onchange="guessProduction(event)">
            <option>---</option>
            ${Object.values(BSL_AST.Production).map(k => `<option value="${k}">${k}</option>`)}
         </select>
         <div class="tip">
            First, select the correct production...
         </div>
      </div>
      <div class="codeblock">
        ${evenlySpace(n.code.map(c => typeof c === 'string' ? c : treeHole(c)).join(' '))}
        <div class="actualcode">
          ${code.split('').map(c =>
            `<span class="char"
                   onmouseup="endSelection(event)">${c}</span>`
          ).join('')}
        </div>
        <div class="tip">
           Second, select all subexpressions to expand the node!
        </div>
      </div>
    </span>
  `;
}
function guessProduction(e: Event) {
  // get context
  const sel = e.target as HTMLInputElement;
  const solution = sel.getAttribute('data-solution') as string;
  const div = sel.parentElement as HTMLElement;
  const span = div.parentElement as HTMLElement;

  if (sel.value === solution) {
    div.innerHTML = solution;
    span.removeAttribute('data-wrong');
    // update global state
    if (span.getAttribute('data-holes') === '[]') {
      span.setAttribute('data-quiz', 'done');
      span.removeAttribute('data-collapsed');
    } else {
      span.setAttribute('data-quiz', 'holes');
      demonstrateSelection(div.nextElementSibling as HTMLElement);
    }
  } else {
    span.setAttribute('data-wrong', 'true');
  }
}
(window as any).guessProduction = guessProduction;

function demonstrateSelection(div: HTMLElement) {
  // console.log('demonstrating selection');
  const spans = navigateDOM([div], '.actualcode/span');
  if (spans.length < 1) return;
  const range = document.createRange();
  range.setStart(spans[0],0);
  const max = spans.length < 10 ? spans.length : 10;
  const sel = window.getSelection() as Selection;
  for (let i = 0; i < max; i++) {
    window.setTimeout(() => {
      range.setEnd(spans[i],0);
      sel.addRange(range);
    },i * 100 );
  }
  window.setTimeout(() => sel.empty(), 1500);

}

function endSelection(e: Event) {
  // ### get context
  // current character
  const span = e.target as HTMLElement;
  // all code text
  const div = span.parentElement as HTMLElement;
  // node (span)
  const node = navigateDOM([div], '../..')[0];

  // ### only proceed if quiz is in right state
  if(node.getAttribute('data-quiz') !== 'holes') return;

  const sel = window.getSelection()
  // no selection? no need to worry
  if(!sel) return;

  const selectedSpans = Array.from(div.children).filter(c => sel.containsNode(c,true));
  const selection = selectedSpans.map(s => s.innerHTML).join('');
  let holes = JSON.parse((node.getAttribute('data-holes') as string).replaceAll('&quot;','"')) as string[];

  // no holes left? no need to worry
  if(!holes.length || holes.length < 1) return;

  // ### evaluate if selection is correct
  if(holes.includes(selection)) {
    // remove from todo-list
    holes = holes.filter(h => h !== selection);

    // style spans permanently
    selectedSpans.map(s => s.classList.add('correct-selection-middle'));
    const first = selectedSpans[0];
    first.classList.remove('correct-selection-middle');
    first.classList.remove('selection-start');
    first.classList.add('correct-selection-start');
    const last = selectedSpans[selectedSpans.length - 1];
    last.classList.remove('correct-selection-middle');
    last.classList.remove('selection-end');
    last.classList.add('correct-selection-end');

    // update global state
    if (holes.length <= 0) {
      node.removeAttribute('data-holes');
      node.setAttribute('data-quiz','done');
      window.setTimeout(() => node.removeAttribute('data-collapsed'), 1000);
    } else {
      node.setAttribute('data-holes', JSON.stringify(holes).replaceAll('"', "&quot;"));
    }
  } else {
    // give feedback that selection was wrong by styling spans...
    selectedSpans.map(s => s.classList.add('wrong-selection-middle'));
    const first = selectedSpans[0];
    first.classList.remove('wrong-selection-middle');
    first.classList.remove('selection-start');
    first.classList.add('wrong-selection-start');
    const last = selectedSpans[selectedSpans.length - 1];
    last.classList.remove('wrong-selection-middle');
    last.classList.remove('selection-end');
    last.classList.add('wrong-selection-end');

    // ... and then removing the styling again
    window.setTimeout(() => {
      selectedSpans.map(s => s.classList.remove('wrong-selection-middle'));
      first.classList.remove('wrong-selection-start');
      last.classList.remove('wrong-selection-end');
    }, 1000);
  }
  // remove user selection by browser to show own styling
  sel.empty();
}
(window as any).endSelection = endSelection;

function treeDefinition(d: BSL_AST.definition, nodeFn: treeNodeFn) {
  if(BSL_AST.isFunDef(d)) {
    const n = {
      production: d.type,
      code: [
        '( define (',
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
