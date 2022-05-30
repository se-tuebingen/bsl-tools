// re-export public API
import * as BSL_AST from './BSL_AST';
(window as any).BSL_AST = BSL_AST;
import * as Pprint from './Pprint';
(window as any).Pprint = Pprint;
import * as Layout from './Layout';
(window as any).Layout = Layout;

// add css
import {default as tree} from './ressources/tree.css';
const styleNode = document.createElement('style');
styleNode.innerHTML = tree as string;
document.getElementsByTagName('head')[0].appendChild(styleNode);
