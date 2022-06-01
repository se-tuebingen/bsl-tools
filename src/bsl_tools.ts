// re-export public API
import * as BSL_AST from './BSL_AST';
// (window as any).BSL_AST = BSL_AST;
// import * as Pprint from './Pprint';
// (window as any).Pprint = Pprint;
import * as Layout from './Layout';
// (window as any).Layout = Layout;
import { parse } from './BSL_parser';

// add css
import {default as tree} from './ressources/tree.css';
const styleNode = document.createElement('style');
styleNode.innerHTML = tree as string;
document.getElementsByTagName('head')[0].appendChild(styleNode);

// parse and print bsl trees
function processBslTrees() {
  Array.from(document.getElementsByTagName('bsl-tree')).map(el => {
    try {
      const program : BSL_AST.program = parse(el.innerHTML);
      Layout.treeProgram(program,el as HTMLElement);
    } catch(e) {
      el.innerHTML += `<br>${e}`;
    }
  });
}

// setup callbacks
window.onload = () => {
  processBslTrees();
}
