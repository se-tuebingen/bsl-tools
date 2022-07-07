import {node, productionTree, dirtify} from "./Production_Tree";

export function processJsonTrees() {
  Array.from(document.getElementsByTagName('jsontree')).map(el => {
    try {
      console.log('processing', el);
      const ret = parseJsonTree(dirtify(el.innerHTML));
      console.log('returned', ret);
      const root = ret.root;
      const productions = ret.productions;
      const quiz = el.getAttribute('quiz') === 'true' ? true : false;
      const lang = (el.getAttribute('lang') ? el.getAttribute('lang') : undefined) as string | undefined;
      productionTree(root, el as HTMLElement, productions, quiz, lang);
    } catch(e:any) {
      console.error(e);
      el.innerHTML = `${e}`;
    }
  });
}

function parseJsonTree(js: string): {root:node,productions:string[]} {
  const json = JSON.parse(js.trim());
  const root = processHolesRecursive(json);
  return {
    root: root,
    productions: extractProductions(root)
  };
}

// ### runtime type checking, extracting hole positions and removing
//     dividers (|) from code
function processHolesRecursive(n: node): node {
  // runtime type checking
  const p = n.production;
  if(!p || typeof(p) !== 'string') {
    throw `${JSON.stringify(n)} has wrong structure, production needs to be a string`;
  }
  const c = n.code;
  if(!c || typeof(c) !== 'string') {
    throw `${JSON.stringify(n)} has wrong structure, code needs to be a string`;
  }
  if (!n.holes) n.holes = [];

  // extracting hole positions and removing dividers || from code
  const codeParts = c.split('|');
  let code = '';
  let holes = [];
  for(let i = 0; i < codeParts.length; i++) {
    // start: not enclosed in ||
    code = `${code}${codeParts[i]}`;

    // next part: enter ||
    i++;
    if(i < codeParts.length && codeParts[i]) {
      const start = code.length;
      code = `${code}${codeParts[i]}`;
      const content = n.holes[holes.length] as any;
      if(!content) {
        throw `${JSON.stringify(n)} has wrong structure: less holes than marked with || in the code`;
      }
      holes.push({start: start, end: code.length, content: processHolesRecursive(content)});
    }
  }
  // return processed node
  return {
    production: p,
    code: code,
    holes: holes
  };

}

// ### traverse tree to get all occurring productions
function extractProductions(n: node): string[] {
  const productions: string[] = [];
  extractProductionsRecursive(n, productions);
  return productions;
}
function extractProductionsRecursive(n: node, p: string[]) {
  if(!p.includes(n.production)) p.push(n.production);
  n.holes.map(h => extractProductionsRecursive(h.content, p));
}
