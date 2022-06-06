"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BSL_Tree = __importStar(require("./BSL_Tree"));
const BSL_Parser_1 = require("./BSL_Parser");
// add css
const tree_css_1 = __importDefault(require("./ressources/tree.css"));
const tree_quiz_css_1 = __importDefault(require("./ressources/tree-quiz.css"));
const styleNode = document.createElement('style');
styleNode.innerHTML = tree_css_1.default;
styleNode.innerHTML += tree_quiz_css_1.default;
document.getElementsByTagName('head')[0].appendChild(styleNode);
// parse and print bsl trees
function processBslTrees() {
    Array.from(document.getElementsByTagName('bsltree')).map(el => {
        try {
            const program = BSL_Parser_1.parse(el.innerHTML);
            const quiz = el.getAttribute('quiz') ? true : false;
            BSL_Tree.treeProgram(program, el, quiz);
        }
        catch (e) {
            el.innerHTML += `<br>${e}`;
        }
    });
}
// setup callbacks
window.onload = () => {
    processBslTrees();
};
//# sourceMappingURL=bsl_tools.js.map