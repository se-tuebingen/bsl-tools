// ######### LAYOUT AST AS TREE DIAGRAM ########
import * as BSL_AST from "./BSL_AST";
import * as BSL_Print from "./BSL_Print";
import {node, productionTree, dirtify} from "./Production_Tree";
import {parse} from "./BSL_Parser";
import {default as error_css} from './ressources/error.css';

// ### main api
export function processBslTrees() {
  Array.from(document.getElementsByTagName('bsltree')).map(el => {
    try {
      const program : BSL_AST.program = parse(dirtify(el.innerHTML));
      const root = programToNode(program);
      const quiz = el.getAttribute('quiz') === 'true' ? true : false;
      const lang = (el.getAttribute('lang') ? el.getAttribute('lang') : undefined) as string | undefined;
      productionTree(root, el as HTMLElement, productions, quiz, lang);
    } catch(e:any) {
      renderError(el as HTMLElement, `${e.location.start.line}:${e.location.start.column} ${e}`);
    }
  });
}
// ### error Render Function
function renderError(el: HTMLElement, error:string){
  // add css if necessary
  if(!document.getElementById('bsl-tools-error-style')) {
    const styleNode = document.createElement('style');
    styleNode.innerHTML = error_css;
    styleNode.id = 'bsl-tools-error-style';
    document.getElementsByTagName('head')[0].appendChild(styleNode);
  }

  const origin = el.innerHTML;
  el.innerHTML ="";
  //create error-wrapper
  const errorWrapper = document.createElement('div');
  errorWrapper.classList.add('error-wrapper');
  el.appendChild(errorWrapper);
  //create originDiv
  const message =`<p> BSL-Tree could not be parsed! </p>
                  <p> Input: <b style="font-size:0.9em;">${origin}</b> </p>`;
  const originDiv = document.createElement('div');
  originDiv.classList.add('origin');
  originDiv.innerHTML = message;
  errorWrapper.appendChild(originDiv);
  //Create errPre
  const errPre = document.createElement('pre');
  errPre.classList.add('error');
  const errCode = document.createElement('code');
  errCode.textContent = error;
  errorWrapper.appendChild(errPre);
  errPre.appendChild(errCode);
}

// ### known list of productions
const productions = {
  '<program>':      ['<def-or-expr>*'],
  '<def-or-expr>*': [], // ['<def-or-expr> <def-or-expr>*',
                        // ''],
  '<def-or-expr>':  ['<definition>',
                     '<e>'],
  '<definition>':   ['(define (<name> <name>+) <e>)',
                     '(define <name> <e>)',
                     '(define-struct <name> (<name>*))'],
  '<e>':            ['(name <e>*)',
                     '(cond {[<e>,<e>]}+)',
                     '<name>',
                     '<v>'],
  '<e>*':           [], //['<e> <e>*',
                        // ''],
  '{[ <e> <e> ]}+': [], //['[<e> <e>]',
                        // '[<e> <e>] {[<e>,<e>]}+'],
  '[ <e> <e> ]':    [], //['[<e> <e>]'],
  '<name>*':        [], //['',
                        // '<name> <name>*'],
  '<name>+':        [], //['<name>',
                        // '<name> <name>+'],
  '<name>':         [],
  '<v>':            []
};

// ### transform AST into node helper structure
function programToNode(p: BSL_AST.program): node {
  const expressions = p.map(BSL_Print.printDefOrExpr);
  const indices = [];
  let program = '';
  for(let i = 0; i < expressions.length; i++) {
    if (i > 0) program = `${program}\n`;
    const start = program.length;
    program = `${program}${expressions[i]}`;
    const end = program.length;
    indices.push({start:start,end:end});
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
    code = '(define (';
    let start = code.length;
    code = `${code}${BSL_Print.printName(d.name)}`;
    holes.push({start:start, end:code.length, content:nameToNode(d.name)});

    code = `${code} `;
    start = code.length;
    code = `${code}${d.args.map(BSL_Print.printName).join(' ')}`;
    holes.push({start:start, end:code.length, content:namePlusToNode(d.args)});

    code = `${code}) `;
    start = code.length;
    code = `${code}${BSL_Print.printE(d.body)}`;
    holes.push({start:start, end:code.length, content:expToNode(d.body)});

    code = `${code})`;
  } else if (BSL_AST.isConstDef(d)) {
    code = '(define ';
    let start = code.length;
    code = `${code}${BSL_Print.printName(d.name)}`;
    holes.push({start:start, end:code.length, content:nameToNode(d.name)});

    code = `${code} `;
    start = code.length;
    code = `${code}${BSL_Print.printE(d.value)}`;
    holes.push({start:start, end:code.length, content:expToNode(d.value)});

    code = `${code})`;
  } else {
    code = '(define-struct ';
    let start = code.length;
    code = `${code}${BSL_Print.printName(d.binding)}`;
    holes.push({start:start, end:code.length, content:nameToNode(d.binding)});

    code = `${code} (`;
    start = code.length;
    code = `${code}${d.properties.map(BSL_Print.printName).join(' ')}`;
    holes.push({start:start, end:code.length, content:nameStarToNode(d.properties)});

    code = `${code}))`;
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
    code = '(';
    let start = code.length;
    code = `${code}${BSL_Print.printName(e.name)}`;
    holes.push({start:start, end:code.length, content:nameToNode(e.name)});

    code = `${code} `;
    start = code.length;
    code = `${code}${e.args.map(BSL_Print.printE).join(' ')}`;
    holes.push({start:start, end:code.length, content:eStarToNode(e.args)});

    code = `${code})`;
  } else if (BSL_AST.isCond(e)) {
    code = '(cond ';
    let start = code.length;
    code = `${code}${e.options.map(BSL_Print.printOption).join(' ')}`;
    holes.push({start:start, end:code.length, content:optionsToNode(e.options)});
    code = `${code})`;
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
  code = `${code}[`;
  let start = code.length;
  code = `${code}${BSL_Print.printE(o.condition)}`;
  holes.push({start:start, end:code.length, content:expToNode(o.condition)});

  code = `${code} `;
  start = code.length;
  code = `${code}${BSL_Print.printE(o.result)}`;
  holes.push({start:start, end:code.length, content:expToNode(o.result)});

  code = `${code}]`;

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
