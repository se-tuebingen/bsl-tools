import * as BSL_AST from './BSL_AST';
import * as BSL_Tree from './BSL_Tree';
import { parse } from './BSL_Parser';

// add css
import {default as tree} from './ressources/tree.css';
import {default as tree_quiz} from './ressources/tree-quiz.css';

const styleNode = document.createElement('style');
styleNode.innerHTML = tree;
styleNode.innerHTML += tree_quiz;
document.getElementsByTagName('head')[0].appendChild(styleNode);

// parse and print bsl trees
function processBslTrees() {
  Array.from(document.getElementsByTagName('bsltree')).map(el => {
    try {
      const program : BSL_AST.program = parse(el.innerHTML);
      const quiz = el.getAttribute('quiz') ? true : false;
      BSL_Tree.treeProgram(program, el as HTMLElement, quiz);
    } catch(e) {
      el.innerHTML += `<br>${e}`;
    }
  });
}

// setup callbacks
window.onload = () => {
  processBslTrees();
}
