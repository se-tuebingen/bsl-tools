// ######### LAYOUT AST AS TREE DIAGRAM ########
import * as BSL_AST from "./BSL_AST";
import * as BSL_Print from "./BSL_Print";
import {navigateDOM, getParentTagRecursive, getParentClassRecursive} from "./DOM_Helpers";
// https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft

// #### main api #####
// add forest of program expressions to html element
export function treeProgram(program: BSL_AST.program, target: HTMLElement, quiz=false){
  // const nodeFn = quiz ? quizNode : treeNode;
  target.innerHTML = renderProgram(program, quiz);
  if (quiz) {
    // show first quiz node
    navigateDOM([target],'ul/li/ul/li').map(c =>
      c.setAttribute('data-collapsed','false'));
  }
  // align connectors horizontally
  adjustConnectors(target);
}


// ###### layout helper ########
// dynamically compute dimensions of connectors between nodes
// such that they point to the correct "hole"
function adjustConnectors(tree: HTMLElement) {
  const ydiff = parseFloat(getComputedStyle(tree).fontSize) * 3; // 3em
  for(let i = 1; ;i++) {
    const holes = Array.from(tree.getElementsByClassName(`hole-${i}`));
    if (holes.length < 1) return;
    holes.map(h => {
      const el: HTMLElement = h as HTMLElement;
      const xpos = 0.5 * (el.getBoundingClientRect().x + el.getBoundingClientRect().right);
      // no layout effect if hole is invisible
      if (xpos == 0) return;

      // navigate the DOM
      const li = getParentTagRecursive(el, 'li');
      // not inside a list node? probably wrong tag, return
      if(!li) return;

      // process children
      navigateDOM([li], `ul/.child-${i}/span`).map(c => {
        const child = c as HTMLElement;
        const xposChild = 0.5 * (child.getBoundingClientRect().x + child.getBoundingClientRect().right);
        const xdiff = xpos - xposChild;
        const angle = - Math.atan2(ydiff, xdiff);
        const amount = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
        const left = (xdiff/2) - (amount/2);
        child.style.cssText = `
          --connector-width: ${amount}px;
          --connector-left: calc(50% + ${left}px);
          --edgetext-right: calc(50% - ${xdiff/2}px);
          --connector-transform: rotate(${angle}rad);
        `;
      });

    });
  }
}

// ##### generate HTML
function renderProgram(p: BSL_AST.program, quiz: boolean = false):string {
  const root = programToNode(p);
  return `
    <ul class="tree ast">
      ${quiz ? renderQuizNode(root) : renderNode(root)}
    </ul>
  `;
}

// ##### simple helper structure representing a printed tree
interface node {
  production: string;
  code: string;
  holes: {start:number, end:number, content:node}[];
}

// ###### rendering a node/tree
function renderNode(n: node, i:number=-1):string {
  // slice text into holes
  const spans = [];
  let position = 0;
  for(let i = 0; i < n.holes.length; i++) {
    if (n.holes[i].start > position) {
      spans.push({pos: false, start:position, end:n.holes[i].start});
    }
    spans.push({pos: i+1, ...n.holes[i]});
    position = n.holes[i].end;
  }
  if (position < n.code.length) {
    spans.push({start:position, end:n.code.length});
  }
  return `
    <li class="${i >= 0 ? `child-${i+1}` : ''}"
        data-collapsed="${i >= 0 ? 'true' : 'false'}">
      <span class="${n.holes.length > 0 ? '' : 'terminal-symbol'}">
        <div class="name">${sanitize(n.production)}</div>
        <div>${spans.map(s => `
          <span class="char ${s.pos ? `hole hole-${s.pos}` : ''}"
                ${s.pos ? `onclick="toggleChild(event,${s.pos})"` : ''}>
            ${n.code.slice(s.start, s.end)}
          </span>`).join('')}
        </div>
      </span>
      ${n.holes.length > 0 ?
        `<ul>${n.holes.map((h, idx) => renderNode(h.content, idx)).join('')}</ul>`
        : ''
      }
    </li>
  `;
}

function toggleChild(e: Event,i:number) {
  const hole = e.target as HTMLElement;
  const li = getParentTagRecursive(hole, 'li');
  const tree = getParentTagRecursive(hole, 'bsltree');
  if(!li || !tree) {
    console.error('toggleChild called from .hole not in li/bsltree');
    return;
  };

  navigateDOM([li],`ul/.child-${i}`).map(c => {
    c.setAttribute('data-collapsed', c.getAttribute('data-collapsed') === 'true' ? 'false' : 'true');
  });
  adjustConnectors(tree);
}
(window as any).toggleChild = toggleChild;

function sanitize(s: string):string {
  return s.replaceAll('<','&lt;').replaceAll('>','&gt;');
}

// ###### rendering a node/tree as a quiz
const productions = [
  '<program>',
  '<def-or-expr>*',
  '<def-or-expr>',
  '<definition>',
  '<e>',
  '<e>*',
  '{[<e>,<e>]}+',
  '<name>*',
  '<name>+',
  '<name>',
  '<v>'
];
function renderQuizNode(n: node, i:number=-1):string {
  // slice text into holes
  const spans = [];
  let position = 0;
  for(let i = 0; i < n.holes.length; i++) {
    if (n.holes[i].start > position) {
      spans.push({pos: false, start:position, end:n.holes[i].start});
    }
    spans.push({pos: i+1, ...n.holes[i]});
    position = n.holes[i].end;
  }
  if (position < n.code.length) {
    spans.push({start:position, end:n.code.length});
  }
  return `
    <li class="${i >= 0 ? `child-${i+1}` : ''}"
        data-collapsed="${i >= 0 ? 'true' : 'false'}">
      <span class="${n.holes.length > 0 ? '' : 'terminal-symbol'}"
            data-quiz-state="${i >= 0 ? 'production' : 'done'}">
        <div class="production">
          <select onchange="checkProduction(event, '${n.production}')">
            <option selected="true">Select production</option>
            ${productions.map(p => `
                <option value="${p}">${sanitize(p)}</option>
              `).join('')}
          </select>
        </div>
        <div class="hole-marking"
             data-holes="${JSON.stringify(n.holes.map(h => [h.start,h.end, false]))}">
          <div class="textarea-container">
            <textarea autocorrect="off"
                      spellcheck="false"
                      cols="${n.code.length}"
                      rows="1"
                      readonly="true">${n.code}</textarea>
            <div class="marker-container">
              ${spans.map(s => `
                <span class="char ${s.pos ? 'hole-marker' : ''} invisible"
                      data-hole="${s.pos ? s.pos : ''}"
                      >${n.code.slice(s.start, s.end)}</span>`).join('')}
            </div>

          </div>
          <button onclick="checkSelection(event)">
            Mark selected text as hole
          </button>
        </div>
        <div class="name">
          ${n.production.replaceAll('<', '&lt;').replaceAll('<','&gt;')}
        </div>
        <div class="code">${spans.map(s => `
          <span class="char ${s.pos ? `hole hole-${s.pos}` : ''}"
                ${s.pos ? `onclick="toggleChild(event,${s.pos})"` : ''}
                >${n.code.slice(s.start, s.end)}</span>`).join('')}
        </div>
      </span>
      ${n.holes.length > 0 ?
        `<ul>${n.holes.map((h, idx) => renderQuizNode(h.content, idx)).join('')}</ul>`
        : ''
      }
    </li>
  `;
}

function checkProduction(e: Event, p: string) {
  const sel = e.target as HTMLSelectElement;
  if (sel.value === p) {
    const span = getParentTagRecursive(sel, 'span');
    if (span) {
      span.setAttribute('data-quiz-state', 'hole-marking');
      const quiz = getParentClassRecursive(span, 'tree');
      if (quiz) adjustConnectors(quiz);
    }
  }
}
(window as any).checkProduction = checkProduction;
function checkSelection(e: Event) {
  // get context
  const btn = e.target as HTMLElement;
  const div = getParentClassRecursive(btn, 'hole-marking');
  if (!div) {
    console.error('checkProduction called from el. not wrapped in div.hole-marking');
    return;
  }
  // get holes to find
  const holes = JSON.parse(div.getAttribute('data-holes') as string) as [number,number,boolean][];
  console.log(holes);

  // get current selection
  const textarea = div.getElementsByTagName('textarea')[0] as HTMLTextAreaElement;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  // check if hole is found
  let found = -1;
  holes.map((h,i) => {
    if (h[0] === start && h[1] === end) {
      console.log('found hole ', h);
      h[2] = true;
      found = i;
    }
  });

  if (found >= 0) {
    // save changed state, show hole marker
    div.setAttribute('data-holes', JSON.stringify(holes));
    navigateDOM([div],'.textarea-container/.marker-container/.hole-marker').map(m => {
      if (m.getAttribute('data-hole') === `${found}`) {
        m.classList.remove('invisible');
      }
    });
  }
  if(holes.every(h => h[2])) {
    // move on to next phase == done
    const span = getParentTagRecursive(div, 'span');
    if (span) {
      span.setAttribute('data-quiz-state', 'done');
      const quiz = getParentClassRecursive(span, 'tree');
      if (quiz) adjustConnectors(quiz);
    }
  }

}
(window as any).checkSelection = checkSelection;

// ###### transform AST into helper structure
function programToNode(p: BSL_AST.program): node {
  const expressions = p.map(BSL_Print.printDefOrExpr);
  const indices = [];
  let program = '';
  for(let i = 0; i < expressions.length; i++) {
    const start = program.length;
    program = `${program}${expressions[i]}`;
    const end = program.length;
    indices.push({start:start,end:end});
    program = `${program}\n`;
  }
  return {
    production: '<program>',
    code: program,
    holes: [
      {
        start: 0,
        end: program.length,
        content: {
          production: '<def-or-expr>*',
          code: program,
          holes: indices.map((h,idx) => { return {
            start: h.start,
            end: h.end,
            content: defOrExprToNode(p[idx])
          }})
        }
      }
    ]
  };
}

function defOrExprToNode(de: BSL_AST.defOrExpr):node {
  const code = BSL_Print.printDefOrExpr(de) as string;
  return {
    production: '<def-or-expr>',
    code: code,
    holes: [{
      start: 0,
      end: code.length,
      content: BSL_AST.isDefinition(de) ? defToNode(de) : expToNode(de)
    }]
  }
}

function defToNode(d: BSL_AST.definition):node {
  let code = '';
  const holes = [];
  if (BSL_AST.isFunDef(d)) {
    code = '( define ( ';
    let start = code.length;
    code = `${code}${BSL_Print.printName(d.name)}`;
    holes.push({start:start, end:code.length, content:nameToNode(d.name)});

    code = `${code} `;
    start = code.length;
    code = `${code}${d.args.map(BSL_Print.printName).join(' ')}`;
    holes.push({start:start, end:code.length, content:namePlusToNode(d.args)});

    code = `${code} ) `;
    start = code.length;
    code = `${code}${BSL_Print.printE(d.body)}`;
    holes.push({start:start, end:code.length, content:expToNode(d.body)});

    code = `${code} )`;
  } else if (BSL_AST.isConstDef(d)) {
    code = '( define ';
    let start = code.length;
    code = `${code}${BSL_Print.printName(d.name)}`;
    holes.push({start:start, end:code.length, content:nameToNode(d.name)});

    code = `${code} `;
    start = code.length;
    code = `${code}${BSL_Print.printE(d.value)}`;
    holes.push({start:start, end:code.length, content:expToNode(d.value)});

    code = `${code} )`;
  } else {
    code = '( define-struct ';
    let start = code.length;
    code = `${code}${BSL_Print.printName(d.binding)}`;
    holes.push({start:start, end:code.length, content:nameToNode(d.binding)});

    code = `${code} ( `;
    start = code.length;
    code = `${code}${d.properties.map(BSL_Print.printName).join(' ')}`;
    holes.push({start:start, end:code.length, content:nameStarToNode(d.properties)});

    code = `${code} ) )`;
  }
  return {
    production: `<definition>`,
    code: code,
    holes: holes
  };
}

function expToNode(e: BSL_AST.expr):node {
  let code = '';
  const holes = [];
  if(BSL_AST.isCall(e)) {
    code = '( ';
    let start = code.length;
    code = `${code}${BSL_Print.printName(e.name)}`;
    holes.push({start:start, end:code.length, content:nameToNode(e.name)});

    code = `${code} `;
    start = code.length;
    code = `${code}${e.args.map(BSL_Print.printE).join(' ')}`;
    holes.push({start:start, end:code.length, content:eStarToNode(e.args)});

    code = `${code} )`;
  } else if (BSL_AST.isCond(e)) {
    code = '( cond ';
    let start = code.length;
    code = `${code}${e.options.map(BSL_Print.printOption).join(' ')}`;
    holes.push({start:start, end:code.length, content:optionsToNode(e.options)});
    code = `${code} )`;
  } else if (BSL_AST.isName(e)) {
    code = BSL_Print.printName(e);
    holes.push({start:0, end:code.length, content:nameToNode(e)});
  } else {
    code = BSL_Print.printE(e);
    holes.push({start:0, end:code.length, content:literalToNode(e)});
  }
  return {
    production: '<e>',
    code: code,
    holes: holes
  };
}

function nameToNode(n: BSL_AST.Name):node {
  return {
    production: '<name>',
    code: BSL_Print.printName(n),
    holes: []
  };
}

function namePlusToNode(ns: BSL_AST.Name[]):node {
  if (ns.length < 1) console.error('<name>+ but used but names are empty');
  let code = '';
  const holes = [];
  for(let i = 0; i < ns.length; i++) {
    const start = code.length;
    code = `${code}${BSL_Print.printName(ns[i])}`;
    holes.push({start:start, end:code.length, content:nameToNode(ns[i])});

    if(i < ns.length - 1) code = `${code} `;
  }
  return {
    production: '<name>+',
    code: code,
    holes: holes
  }
}

function nameStarToNode(ns: BSL_AST.Name[]):node {
  let code = '';
  const holes = [];
  for(let i = 0; i < ns.length; i++) {
    const start = code.length;
    code = `${code}${BSL_Print.printName(ns[i])}`;
    holes.push({start:start, end:code.length, content:nameToNode(ns[i])});

    if(i < ns.length - 1) code = `${code} `;
  }
  return {
    production: '<name>*',
    code: code,
    holes: holes
  }
}

function eStarToNode(es: BSL_AST.expr[]):node {
  let code = '';
  const holes = [];
  for(let i = 0; i < es.length; i++) {
    const start = code.length;
    code = `${code}${BSL_Print.printE(es[i])}`;
    holes.push({start:start, end:code.length, content:expToNode(es[i])});

    if(i < es.length - 1) code = `${code} `;
  }
  return {
    production: '<e>*',
    code: code,
    holes: holes
  }
}

function optionsToNode(os: BSL_AST.Clause[]):node {
  let code = '';
  const holes = [];
  for(let i = 0; i < os.length; i++) {
    const start = code.length;
    code = `${code}${BSL_Print.printOption(os[i])}`;
    holes.push({start:start, end:code.length, content:optionToNode(os[i])});

    if(i < os.length - 1) code = `${code} `;
  }
  return {
    production: '{[ <e> <e> ]}+',
    code: code,
    holes: holes
  }
}

function optionToNode(o: BSL_AST.Clause):node {
  let code = '';
  const holes = [];
  code = `${code}[ `;
  let start = code.length;
  code = `${code}${BSL_Print.printE(o.condition)}`;
  holes.push({start:start, end:code.length, content:expToNode(o.condition)});

  code = `${code} `;
  start = code.length;
  code = `${code}${BSL_Print.printE(o.result)}`;
  holes.push({start:start, end:code.length, content:expToNode(o.result)});

  code = `${code} ]`;

  return {
    production: '[ <e> <e> ]',
    code: code,
    holes: holes
  };

}

function literalToNode(v: BSL_AST.Literal):node {
  return {
    production: '<v>',
    code: BSL_Print.printE(v),
    holes: []
  }
}
