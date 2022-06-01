Promise.resolve().then(function () { return require("./parser-bsl"); });
;
// Parse BSL Tree
function parseBslTree(el) {
    var root = el;
    var text = el.innerText;
    return {
        root: root,
        text: text
    };
}
// Get BSL Trees
function setup() {
    var bslHtmlCol = document.getElementsByTagName("bsl-tree");
    for (var i = 0; i < bslHtmlCol.length; i++) {
        var bslHtml = bslHtmlCol[i];
        var bslTree = parseBslTree(bslHtml);
        console.log(bslTree.text);
        var json = parser.parse(bslTree.text);
        //console.log(json);
        // assign JSON parts to BSL_AST-Structures
    }
}
window.onload = setup;
