"use strict";
// ######### LAYOUT AST AS TREE DIAGRAM ########
// depends on pprint.ts for printing code
// https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft
// #### main api #####
// add forest of program expressions to html element
function treeProgram(program, target) {
    target.innerHTML = program.map(treeDefOrExpr).join('\n');
    // align connectors horizontally
    adjustConnectors('hole-1', 'child-1');
    adjustConnectors('hole-2', 'child-2');
    adjustConnectors('hole-3', 'child-3');
}
// #### render helpers (textual html generators) ####
function treeDefOrExpr(root) {
    return `<ul class="tree ast"><li>${BSL_AST.isDefinition(root) ? treeDefinition(root) : treeE(root)}</li></ul>`;
}
function treeDefinition(d) {
    if (BSL_AST.isFunDef(d)) {
        return `
      <span>
        <div class="name">Function Definition</div>
        <div>( define ( <div class="hole hole-1">name</div> <div class="hole hole-2">name+</div> ) <div class="hole hole-3">e</div> )</div>
      </span>
      <ul>
        <li class="child-1">${treeName(d.fname)}</li>
        <li class="child-2">${d.args.map(treeName).join('</li><li class="child-2">')}</li>
        <li class="child-3">${treeE(d.body)}</li>
      </ul>`;
    }
    else if (BSL_AST.isConstDef(d)) {
        return `
      <span>
        <div class="name">Constant Definition</div>
        <div>( define <div class="hole hole-1">name</div> <div class="hole hole-2">e</div> )</div>
      </span>
      <ul>
        <li class="child-1">${treeName(d.cname)}</li>
        <li class="child-2">${treeE(d.value)}</li>
      </ul>`;
    }
    else if (BSL_AST.isStructDef(d)) {
        return `
      <span>
        <div class="name">Struct Definition</div>
        <div>(define-struct <div class="hole hole-1">name</div> ( <div class="hole hole-2">name*</div> ) )</div>
      </span>
      <ul>
        <li class="child-1">${treeName(d.binding)}</li>
        <li class="child-2">${d.properties.map(treeName).join('</li><li class="child-2">')}</li>
      </ul>`;
    }
    else {
        console.error('Invalid input to printDefinition');
    }
}
function treeE(e) {
    if (BSL_AST.isCall(e)) {
        return `
      <span>
        <div class="name">Function Call</div>
        <div>( <div class="hole hole-1">name</div> <div class="hole hole-2">e*</div> )</div>
      </span>
      <ul>
        <li class="child-1">${treeName(e.fname)}</li>
        <li class="child-2">${e.args.map(treeE).join('</li><li class="child-2">')}</li>
      </ul>`;
    }
    else if (BSL_AST.isCond(e)) {
        return `
      <span>
        <div class="name">Cond-Expression</div>
        <div>( cond <div class="hole hole-2">[ e e ]+</div> )</div>
      </span>
      <ul>
        <li class="child-2">${e.options.map(treeOption).join('</li><li class="child-2">')}</li>
      </ul>`;
    }
    else if (BSL_AST.isName(e)) {
        return treeName(e);
    }
    else if (BSL_AST.isV(e)) {
        return `
      <span>
        <div class="name">Literal Value</div>
        <div>${pprint([e])}</div>
      </span>`;
    }
    else {
        console.error('Invalid input to treeE');
        return `<span>${e}</span>`;
    }
}
function treeOption(o) {
    return `
    <span>
      <div class="name">Cond-Option</div>
      <div>[ <div class="hole hole-1">e</div> <div class="hole hole-2">e</div> ]</div>
    </span>
    <ul>
      <li class="child-1">${treeE(o.condition)}</li>
      <li class="child-2">${treeE(o.result)}</li>
    </ul>
  `;
}
function treeName(s) {
    return `
    <span>
      <div class="name">Symbol</div>
      <div>${s.symbol}</div>
    </span>`;
}
// ###### layout helper ########
// dynamically compute dimensions of connectors between nodes
// such that they point to the correct "hole"
function adjustConnectors(holeClass, childClass) {
    Array.from(document.getElementsByClassName(holeClass)).map(h => {
        const el = h;
        const xpos = 0.5 * (el.getBoundingClientRect().x + el.getBoundingClientRect().right);
        // navigate the DOM
        const div = el.parentElement;
        if (!div) {
            console.error(`${holeClass} element in wrong structure, should be span > div > div.${holeClass}`, el);
            return;
        }
        const span = el.parentElement?.parentElement;
        if (!span) {
            console.error(`${holeClass} element in wrong structure, should be span > div > div.${holeClass}`, el);
            return;
        }
        const ul = span.nextElementSibling;
        if (!ul) {
            console.error(`${holeClass} element used in node without children ul list`);
            return;
        }
        ;
        // process children
        Array.from(ul.children).filter(c => c.classList.contains(childClass)).map(c => {
            const child = c;
            const xposChild = 0.5 * (child.getBoundingClientRect().x + child.getBoundingClientRect().right);
            const xdiff = xpos - xposChild;
            let cssText = '';
            if (xdiff < 0) {
                cssText += `
          --connector-left: auto;
          --connector-right: 50%;
          --connector-border-left-style: solid;
          --connector-border-right-style: none;`;
            }
            else {
                cssText += `
          --connector-left: 50%;
          --connector-right: auto;
          --connector-border-left-style: none;
          --connector-border-right-style: solid;`;
            }
            cssText += `--connector-width: ${Math.abs(xdiff) + 1}px;`;
            child.style.cssText = cssText;
        });
    });
}
