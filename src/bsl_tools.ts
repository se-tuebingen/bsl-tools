import {processBslTrees} from './BSL_Tree';
import {processGenerators} from './Generator';
import {processJsonTrees} from './JSON_Tree';
import {processSteppers} from './SI_Renderer';

// setup callbacks
// - do not set window.onload - other scripts might use it, too
// - 'load' and not 'DOMContentLoaded' since we want CSS to be ready when we "measure" layout-related stuff
window.addEventListener('load', () => {
  processBslTrees();
  processJsonTrees();
  processSteppers();
  processGenerators();
});
