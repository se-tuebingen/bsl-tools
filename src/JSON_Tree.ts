import {node, productionTree, dirtify} from "./Production_Tree";

export function processJsonTrees() {
  Array.from(document.getElementsByTagName('jsontree')).map(el => {
    try {
      const root = parseJsonTree(dirtify(el.innerHTML));
      const quiz = el.getAttribute('quiz') === 'true' ? true : false;
      const lang = (el.getAttribute('lang') ? el.getAttribute('lang') : undefined) as string | undefined;
      productionTree(root, el as HTMLElement, undefined, quiz, lang);
    } catch(e:any) {
      console.error(e);
      el.innerHTML = `${e}`;
      (el as HTMLElement).style.cssText = `
        padding: 2em;
        color: darkred;
        display: block;
      `;
    }
  });
}

function parseJsonTree(js: string): node {
  const json = JSON.parse(js.trim());
  const root = processHolesRecursive(json);
  return root;
}

// ### runtime type checking, extracting hole positions and removing
//     dividers (|) from code
function processHolesRecursive(n: node): node {
  // runtime type checking
  const p = n.production;
  if(!p || typeof(p) !== 'string') {
    throw `${JSON.stringify(n, undefined, 2).replaceAll('\n', '<br>')} has wrong structure, production needs to be a string`;
  }
  const c = n.code;
  if(!c || typeof(c) !== 'string') {
    throw `${JSON.stringify(n, undefined, 2).replaceAll('\n', '<br>')} has wrong structure, code needs to be a string`;
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
        throw `${JSON.stringify(n, undefined, 2).replaceAll('\n', '<br>')} has wrong structure: less holes than marked with || in the code`;
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
