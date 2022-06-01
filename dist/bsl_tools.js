// re-export public API
import * as BSL_AST from './BSL_AST';
window.BSL_AST = BSL_AST;
import * as Pprint from './Pprint';
window.Pprint = Pprint;
import * as Layout from './Layout';
window.Layout = Layout;
// add css
import { default as tree } from './ressources/tree.css';
const styleNode = document.createElement('style');
styleNode.innerHTML = tree;
document.getElementsByTagName('head')[0].appendChild(styleNode);
//# sourceMappingURL=bsl_tools.js.map