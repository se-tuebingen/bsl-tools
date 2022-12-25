import {processBslTrees} from './BSL_Tree';
import { ProcessGenerator } from './Generator';
import {processJsonTrees} from './JSON_Tree';
import {processSteppers} from './SI_Renderer';

// setup callbacks
window.onload = () => {
  processBslTrees();
  processJsonTrees();
  processSteppers();
  ProcessGenerator();
}
