import {processBslTrees} from './BSL_Tree';
import {processJsonTrees} from './JSON_Tree';
import {processSteppers} from './SI';

// setup callbacks
window.onload = () => {
  processBslTrees();
  processJsonTrees();
  processSteppers();
}
