import * as BSL_AST from './BSL_AST';
import * as BSL_Tree from './BSL_Tree';
import * as BSL_Tree_Quiz from './BSL_Tree_Quiz';
import { parse } from './BSL_Parser';

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
      if(el.getAttribute('quiz')) {
        BSL_Tree_Quiz.treeProgram(program, el as HTMLElement);
      } else {        
        BSL_Tree.treeProgram(program,el as HTMLElement);
      }
    } catch(e) {
      el.innerHTML += `<br>${e}`;
    }
  });
}

// setup callbacks
window.onload = () => {
  processBslTrees();
}
