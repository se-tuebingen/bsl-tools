"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const p = __importStar(require("./parser.js"));
;
// Parse BSL Tree
function parseBslTree(el) {
    let root = el;
    let text = el.innerText;
    return {
        root: root,
        text: text,
    };
}
// Get BSL Trees
const bslHtmlCol = document.getElementsByTagName("bsl-tree");
for (let i = 0; i < bslHtmlCol.length; i++) {
    let bslHtml = bslHtmlCol[i];
    let bslTree = parseBslTree(bslHtml);
    console.log(bslTree.text);
    let json = p.parse(bslTree.text);
    console.log(json);
}
// assign JSON parts to BSL_AST-Structures
//# sourceMappingURL=assignJson.js.map