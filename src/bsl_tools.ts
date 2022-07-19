import * as BSL_AST from './BSL_AST';
import * as BSL_Tree from './BSL_Tree';
import { parse } from './BSL_Parser';

// small-step-interpreter functionality
import * as SI_STRUCT from './SI_STRUCT';
import * as SI from './SI';

// add css
import {default as tree} from './ressources/tree.css';
import {default as tree_quiz} from './ressources/tree-quiz.css';
import {default as error} from './ressources/error.css';
import {default as small_interpreter} from './ressources/small-interpreter.css';

const styleNode = document.createElement('style');
styleNode.innerHTML = tree;
styleNode.innerHTML += tree_quiz;
styleNode.innerHTML += error;
styleNode.innerHTML += small_interpreter;
document.getElementsByTagName('head')[0].appendChild(styleNode);

// parse and print bsl trees
function processBslTrees() {
  Array.from(document.getElementsByTagName('bsltree')).map(el => {
    try {
      const program : BSL_AST.program = parse(el.innerHTML);
      const quiz = el.getAttribute('quiz') === 'true' ? true : false;
      BSL_Tree.treeProgram(program, el as HTMLElement, quiz);
    } catch(e:any) {
      renderError(el as HTMLElement, `${e.location.start.line}:${e.location.start.column} ${e}`);
    }
  });
}
// parse stepper
function processStepper() {
  Array.from(document.getElementsByTagName('stepper')).map(el => {
      //parse to AST
    try{
      const program : BSL_AST.program = parse(el.innerHTML);
      SI.setUpStepperGui(program, el as HTMLElement);
    } catch(e:any) {
      renderError(el as HTMLElement, `${e.location.start.line}:${e.location.start.column} ${e}`);
    }
  });
}

// setup callbacks
window.onload = () => {
  processBslTrees();
  processStepper();
}

// error Render Function

function renderError(el: HTMLElement, error:string){
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
