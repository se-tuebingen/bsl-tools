import {navigateDOM, getParentTagRecursive, getParentClassRecursive} from "./DOM_Helpers";
import {default as tree_css} from './ressources/tree.css';
import {sanitize} from './BSL_Print';

// #### main api #####
// simple helper structure representing a printed tree
export interface node {
  production: string;
  code: string;
  holes: {start:number, end:number, content:node}[];
}
// object representing a grammar
export type grammar = {[key: string]: string[]};

// add production tree to html element
export function productionTree(
  root: node,
  target: HTMLElement,
  grammar: grammar | undefined,
  quiz=false,
  lang='en'){
  // infer grammar if necessary
  if(!grammar) grammar = extractProductions(root);
  // add css if necessary
  if(!document.getElementById('bsl-tools-tree-style')) {
    const styleNode = document.createElement('style');
    styleNode.innerHTML = tree_css;
    styleNode.id = 'bsl-tools-tree-style';
    document.getElementsByTagName('head')[0].appendChild(styleNode);
  }
  // check language availability
  if (!implementedLanguages.includes(lang)) {
    console.error(`
      Selected language "${lang}" is not implemented, defaulting to "en".
      Available language codes: ${implementedLanguages.join(', ')}
    `);
    lang = 'en';
  }
  // render HTML
  target.innerHTML = `
  <div class="tree-container">
    <ul class="tree ast">
      ${quiz
        ? renderQuizNode(root, lang as implementedLanguage, grammar as grammar)
        : renderNode(root, grammar as grammar)}
    </ul>
  </div>`;
  if (quiz) {
    // show first quiz node
    navigateDOM([target],'ul/li/ul/li').map(c =>
      c.setAttribute('data-collapsed','false'));
  }
  // align connectors horizontally
  adjustConnectors(target);
}

// ### traverse tree to get all occurring productions
function extractProductions(n: node): grammar {
  const productions = {};
  extractProductionsRecursive(n, productions);
  return productions;
}
function extractProductionsRecursive(n: node, p: grammar) {
  p[n.production] = [];
  n.holes.map(h => extractProductionsRecursive(h.content, p));
}

// ###### internationalization for this module #####
// mainly for quiz, currently
type implementedLanguage = 'en' | 'de';
const implementedLanguages = ['en', 'de'];

const dictionary = {
  'en': {
    'select production': 'Select production',
    'mark selected text as hole': 'Mark selected text as hole',
  },
  'de': {
    'select production': 'Produktion auswählen',
    'mark selected text as hole': 'Auswahl als Loch markieren',
  },
};

// ###### layout helper ########
// dynamically compute dimensions of connectors between nodes
// such that they point to the correct "hole"
// https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft
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
        // set css variables (usage see tree.css)
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

// ##### generate HTML ######

// ### regular node/tree
function renderNode(n: node, p: grammar, i:number=-1):string {
  return `
    <li class="${i >= 0 ? `child-${i+1}` : ''}"
        data-collapsed="${i >= 0 ? 'true' : 'false'}">
      <span class="${n.holes.length > 0 ? '' : 'terminal-symbol'}">

        ${renderProduction(n, p)}

        ${renderCode(n)}

      </span>
      ${n.holes.length > 0 ?
        `<ul>${
          n.holes.map((h, idx) =>
            renderNode(h.content, p, idx))
          .join('')
        }</ul>`
        : ''
      }
    </li>
  `;
}

// ### block of code in node
function renderCode(n: node):string {
  const spans = getSpans(n);
  return `
  <div class="code">${
    spans.map(s =>
      `<span class="char ${s.pos ? `hole hole-${s.pos}` : ''}"
             ${s.pos ? `onclick="toggleChild(event,${s.pos})"` : ''}
             >${n.code.slice(s.start, s.end)}</span>`)
    .join('')}
  </div>
  `;
}
(window as any).toggleChild = (e: Event,i:number) => {
  const hole = e.target as HTMLElement;
  const li = getParentTagRecursive(hole, 'li');
  const tree = getParentClassRecursive(hole, 'tree');
  if(!li || !tree) {
    console.error('toggleChild called from .hole not in .tree');
    return;
  };

  navigateDOM([li],`ul/.child-${i}`).map(c => {
    c.setAttribute('data-collapsed', c.getAttribute('data-collapsed') === 'true' ? 'false' : 'true');
  });
  adjustConnectors(tree);
}
interface span {
  pos: boolean | number;
  start: number;
  end: number;
}
function getSpans(n: node):span[] {
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
    spans.push({pos: false, start:position, end:n.code.length});
  }
  return spans;
}
// ### production name - with tooltip on hover
function renderProduction(n: node, p: grammar) {
  return `
    <div class="name">${sanitize(n.production)}${
      p[n.production] && p[n.production].length > 0 ?
      `<div class="tooltip">::= ${
        p[n.production].map(sanitize).join('<br>&nbsp;|&nbsp;&nbsp;')
      }</div>`
      : ''
    }</div>
  `;
}

// ###### rendering a node/tree as a quiz
function renderQuizNode(n: node, lang: implementedLanguage, grammar: grammar, i:number=-1):string {
  return `
    <li class="${i >= 0 ? `child-${i+1}` : ''}"
        data-collapsed="${i >= 0 ? 'true' : 'false'}">
      <span class="${n.holes.length > 0 ? '' : 'terminal-symbol'}"
            data-quiz-state="${i >= 0 ? 'production' : 'done'}"
            data-is-terminal="${n.holes.length <= 0}"
            data-is-trivial-hole="${n.holes.length === 1 && n.holes[0].start === 0 && n.holes[0].end === n.code.length}">

        ${renderProductionQuiz(n, lang, grammar)}

        ${renderHoleQuiz(n, lang)}

        ${renderProduction(n, grammar)}
        ${renderCode(n)}
      </span>
      ${n.holes.length > 0 ?
        `<ul>${
          n.holes.map((h, idx) =>
            renderQuizNode(h.content, lang, grammar, idx))
            .join('')
         }</ul>`
        : ''
      }
    </li>
  `;
}

// ### first part of the quiz
function renderProductionQuiz(n: node, lang: implementedLanguage, grammar: grammar):string {
  return `
  <div class="production">
    <select onchange="checkProduction(event, '${n.production}')">
      <option selected="true">${dictionary[lang]['select production']}</option>
      ${Object.keys(grammar).map(p => `
          <option value="${p}">${sanitize(p)}</option>
        `).join('')}
    </select>
  </div>
  `;
}

(window as any).checkProduction = (e: Event, p: string) => {
  const sel = e.target as HTMLSelectElement;
  if (sel.value === p) {
    // answer correct
    const span = getParentTagRecursive(sel, 'span');
    if (span) {
      if (span.getAttribute('data-is-terminal') === 'true') {
        // we're done
        span.setAttribute('data-quiz-state', 'done');
      } else if (span.getAttribute('data-is-trivial-hole') === 'true') {
        // we're done
        span.setAttribute('data-quiz-state', 'done');
        // but we also need to expand the child
        navigateDOM([span],'+/li',true).map(c =>
          c.setAttribute('data-collapsed', 'false'));
      } else {
        // move on to selecting holes
        span.setAttribute('data-quiz-state', 'hole-marking');
      }

      // expand next sibling (if present)
      navigateDOM([span], '../+').map(l =>
        l.setAttribute('data-collapsed', 'false'));

      // adjust connectors
      const quiz = getParentClassRecursive(span, 'tree');
      if (quiz) adjustConnectors(quiz);
    }
  } else {
    // mark option as tried-and-wrong
    Array.from(sel.selectedOptions).map(o =>
      o.remove());
    // give visual feedback
    const span = getParentTagRecursive(sel, 'span');
    if (span) {
      span.classList.add('wrong');
      window.setTimeout(() => {
        span.classList.remove('wrong');
      }, 100);
    }
  }
}

// ### second part of the quiz
function renderHoleQuiz(n: node, lang: implementedLanguage):string {
  return `
  <div class="hole-marking"
       data-holes="${btoa(JSON.stringify(n.holes.map(h => [h.start,h.end, false])))}">
    <div class="textarea-container">
      <div class="marker-container">
        ${n.code.split('\n')
            .map(l => l.split('').map(c =>
              `<span class="char marker">${c}</span>`
            ).join(''))
            .join('<span class="char marker"></span><br>')}
      </div>
      <textarea autocorrect="off"
                spellcheck="false"
                cols="${n.code.split('\n').map(l => l.length).reduce((x,y) => x > y ? x : y)}"
                rows="${n.code.split('\n').length}"
                oninput="stopInput(event, '${btoa(n.code)}')">${n.code}</textarea>
    </div><br>
    <button onclick="checkSelection(event)">
      ${dictionary[lang]['mark selected text as hole']}
    </button>
  </div>
  `;
}
(window as any).stopInput = (e: Event, oldVal: string) => {
  (e.target as HTMLTextAreaElement).value = atob(oldVal);
}
(window as any).checkSelection = (e: Event) => {
  // get context
  const btn = e.target as HTMLElement;
  const div = getParentClassRecursive(btn, 'hole-marking');
  if (!div) {
    console.error('checkProduction called from el. not wrapped in div.hole-marking');
    return;
  }
  // get holes to find
  const holes = JSON.parse(atob(div.getAttribute('data-holes') as string)) as [number,number,boolean][];

  // get current selection
  const textarea = div.getElementsByTagName('textarea')[0] as HTMLTextAreaElement;
  const selStart = textarea.selectionStart;
  const selEnd = textarea.selectionEnd;
  const start = selStart < selEnd ? selStart : selEnd;
  const end = selStart < selEnd ? selEnd : selStart;

  // check if hole is found
  let found = -1;
  holes.map((h,i) => {
    if (h[0] === start && h[1] === end) {
      h[2] = true;
      found = i;
    }
  });

  if (found >= 0) {
    // save changed state
    div.setAttribute('data-holes', btoa(JSON.stringify(holes)));
    // mark hole as correct
    navigateDOM([div], '.textarea-container/.marker-container/.marker', true)
      .slice(start, end)
      .map(m => m.classList.add('correct'));
  } else {
    // give feedback about wrong selection
    const markers = navigateDOM([div], '.textarea-container/.marker-container/.marker', true)
      .slice(start, end);

    markers.map(m => m.classList.add('wrong'));
    window.setTimeout(() => {
      markers.map(m => m.classList.remove('wrong'));
    }, 100);
  }
  if(holes.every(h => h[2])) {
    // move on to next phase == done
    const span = getParentTagRecursive(div, 'span');
    if (span) {
      span.setAttribute('data-quiz-state', 'done');
      // expand first child
      navigateDOM([span], '../ul/.child-1').map(c =>
        c.setAttribute('data-collapsed', 'false'));

      // adjust connectors for width change
      const quiz = getParentClassRecursive(span, 'tree');
      if (quiz) adjustConnectors(quiz);
    }
  }
}
