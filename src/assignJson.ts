import * as p from "./parser.js";
import * as BSL_AST from "./BSL_AST";
// parse String to JSON
interface BslTree{
  root: HTMLElement;
  text: string;
};
// Parse BSL Tree
function parseBslTree(el :HTMLElement) :BslTree{
  let root = el;
  let text  = el.innerText
  return {
    root: root,
    text: text,
  }
}

// Get BSL Trees
const bslHtmlCol = document.getElementsByTagName("bsl-tree") as HTMLCollection;
for (let i = 0; i < bslHtmlCol.length; i++){
  let bslHtml = bslHtmlCol[i] as HTMLElement;
  let bslTree = parseBslTree(bslHtml);

console.log(bslTree.text);
let json = p.parse(bslTree.text);
console.log(json);
}
// assign JSON parts to BSL_AST-Structures
