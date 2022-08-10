import {processBslTrees} from './BSL_Tree';
import {processJsonTrees} from './JSON_Tree';

// setup callbacks
window.onload = () => {
  processBslTrees();
  processJsonTrees();
}
