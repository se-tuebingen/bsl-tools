import * as parser from "./parser_tests/bsl-grammar";
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
function setup() {
    const bslHtmlCol = document.getElementsByTagName("bsl-tree");
    for (let i = 0; i < bslHtmlCol.length; i++) {
        let bslHtml = bslHtmlCol[i];
        let bslTree = parseBslTree(bslHtml);
        console.log(bslTree.text);
        let json = parser.parse(bslTree.text);
        //console.log(json);
        // assign JSON parts to BSL_AST-Structures
    }
}
window.onload = setup;
//# sourceMappingURL=assignJson.js.map