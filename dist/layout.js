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
    adjustAllConnectors();
    // add data where holes should move upon expanding
    addHoleTranslations();
    // add collapsers
    addCollapsers(target);
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
        <div>( define
          (
            <div class="part">${pprint([d.fname])}</div>
            <div class="hole hole-1">name</div>

            ${d.args.map(a => `<div class="part">${printName(a)}</div>`).join('')}
            <div class="hole hole-2">name+</div>
          )
          <div class="part">${pprint([d.body])}</div>
          <div class="hole hole-3">e</div>
        )</div>
      </span>
      <ul>
        <li class="child-1">${treeName(d.fname)}</li>
        ${d.args.map(a => `<li class="child-2">${treeName(a)}</li>`).join('')}
        <li class="child-3">${treeE(d.body)}</li>
      </ul>`;
    }
    else if (BSL_AST.isConstDef(d)) {
        return `
      <span>
        <div class="name">Constant Definition</div>
        <div>( define
          <div class="part">${pprint([d.cname])}</div>
          <div class="hole hole-1">name</div>

          <div class="part">${pprint([d.value])}</div>
          <div class="hole hole-2">e</div>
        )</div>
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

        <div>(define-struct

          <div class="part">${pprint([d.binding])}</div>
          <div class="hole hole-1">name</div>
          (
            ${d.properties.map(p => `<div class="part">${printName(p)}</div>`).join(' ')}
            <div class="hole hole-2">name*</div>
          )
        )</div>
      </span>
      <ul>
        <li class="child-1">${treeName(d.binding)}</li>
        ${d.properties.map(p => `<li class="child-2">${treeName(p)}</li>`).join('')}
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

        <div>(
          <div class="part">${pprint([e.fname])}</div>
          <div class="hole hole-1">name</div>

          ${e.args.map(a => `<div class="part">${printE(a)}</div>`).join(' ')}
          <div class="hole hole-2">e*</div>
        )</div>
      </span>
      <ul>
        <li class="child-1">${treeName(e.fname)}</li>
        ${e.args.map(a => `<li class="child-2">${treeE(a)}</li>`).join('')}
      </ul>`;
    }
    else if (BSL_AST.isCond(e)) {
        return `
      <span>
        <div class="name">Cond-Expression</div>
        <div>( cond
          ${e.options.map(o => `<div class="part">${printOption(o)}</div>`).join(' ')}
          <div class="hole hole-2">[ e e ]+</div>
         )</div>
      </span>
      <ul>
        ${e.options.map(o => `<li class="child-2">${treeOption(o)}</li>`).join(' ')}
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
      <div>[
        <div class="part">${pprint([o.condition])}</div>
        <div class="hole hole-1">e</div>

        <div class="part">${pprint([o.result])}</div>
        <div class="hole hole-2">e</div>
       ]
      </div>
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
function adjustAllConnectors() {
    adjustConnectors('hole-1', 'child-1');
    adjustConnectors('hole-2', 'child-2');
    adjustConnectors('hole-3', 'child-3');
}
function adjustConnectors(holeClass, childClass) {
    Array.from(document.getElementsByClassName(holeClass)).map(h => {
        const el = h;
        const xpos = 0.5 * (el.getBoundingClientRect().x + el.getBoundingClientRect().right);
        // no layout effect if hole is invisible
        if (xpos == 0)
            return;
        // navigate the DOM
        const ul = navigateDOM([el], '../../+')[0];
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
// add information on where holes should move on expansion
function addHoleTranslations() {
    // Array.from(document.getElementsByClassName('full')).map(d => {
    //   const div: HTMLElement = d as HTMLElement;
    //   const holes = Array.from(div.getElementsByClassName('hole'));
    //
    //   const span: HTMLElement = div.parentElement as HTMLElement;
    //   if(!span) { console.error("hole without parent"); return; }
    //   const ul: HTMLElement = span.nextElementSibling as HTMLElement;
    //   if(!ul) { console.error("hole in span without ul sibling"); return; }
    //
    //   const childNodes = Array.from(ul.children
    //     ).filter(c => c.tagName == 'LI'
    //     ).flatMap(c => Array.from(c.children)
    //     ).filter(c => c.tagName == 'SPAN'
    //   ).map(c => Array.from(c.children).filter(c => c.tagName == 'DIV')[1]);
    //
    //   if(holes.length != childNodes.length) {
    //     console.error(`Holes length: ${holes.length}, child Nodes length: ${childNodes.length}.`);
    //     return;
    //   }
    //   for(let i = 0; i < holes.length; i++) {
    //     console.log(`Matching up: ${holes[i].innerHTML} and ${childNodes[i].innerHTML}`);
    //     const childX = childNodes[i].getBoundingClientRect().x;
    //     const childY = childNodes[i].getBoundingClientRect().y;
    //
    //     holes[i].setAttribute('data-translate-x', `${childX}`);
    //     holes[i].setAttribute('data-translate-y', `${childY}`);
    //   }
    //
    // });
}
// navigate the DOM using path notation
// .. -> parent
// +  -> next sibling
// .class -> all children with a class
// tag -> all children of a certain tag
// divided by /
function navigateDOM(positions, path) {
    const steps = path.split('/');
    const currStep = steps.shift();
    if (currStep == '')
        return positions;
    const restSteps = steps.join('/');
    if (currStep == '..') {
        // navigate up
        const newPositions = positions.map(p => p.parentElement);
        if (newPositions.every(p => p)) {
            return navigateDOM(newPositions, restSteps);
        }
        else {
            console.error(`Error traversing ${path}: Missing parentElement`, positions);
            return [];
        }
    }
    else if (currStep == '+') {
        // navigate sideways
        const newPositions = positions.map(p => p.nextElementSibling);
        if (newPositions.every(p => p)) {
            return navigateDOM(newPositions, restSteps);
        }
        else {
            console.error(`Error traversing ${path}: Missing nextElementSibling`, positions);
            return [];
        }
    }
    else if (currStep.startsWith('.')) {
        // navigate down + filter for class
        const className = currStep.slice(1);
        const newPositions = positions.flatMap(p => Array.from(p.children).filter(c => c.classList.contains(className)));
        return navigateDOM(newPositions, restSteps);
    }
    else {
        // navigate down + filter for tag
        const newPositions = positions.flatMap(p => Array.from(p.children).filter(c => c.tagName == currStep.toUpperCase()));
        return navigateDOM(newPositions, restSteps);
    }
}
// collapse/expand nodes
function addCollapsers(target) {
    Array.from(target.getElementsByTagName('span')).map(l => {
        l.onclick = () => {
            const li = l;
            if (li.getAttribute('data-collapsed')) {
                // // move holes where children will be
                // const full = Array.from(li.children).filter(c => c.classList.contains('full'))[0] as HTMLElement;
                // if(!full) { console.error('expanding node without full div in span', li); return; }
                //
                // Array.from(full.children).filter(
                //   c => c.classList.contains('hole')
                // ).map(c => {
                //   console.log('Moving',c);
                //   const el = c as HTMLElement;
                //   const currX = c.getBoundingClientRect().x;
                //   const currY = c.getBoundingClientRect().y;
                //   const shouldX = Math.floor(parseFloat(el.getAttribute('data-translate-x') as string));
                //   const shouldY = Math.floor(parseFloat(el.getAttribute('data-translate-y') as string));
                //   el.style.cssText = `
                //     --translate-x: ${shouldX - currX}px;
                //     --translate-y: 3em;
                //   `; // TODO: fix y coordinate, handle centering
                //   console.log(el);
                //   window.setTimeout(() => {
                //     el.style.cssText = '';
                //   }, 1100);
                // });
                //
                // // wait until animation has finished
                // window.setTimeout(() => {
                //   li.removeAttribute('data-collapsed');
                // }, 1000);
                li.removeAttribute('data-collapsed');
            }
            else {
                li.setAttribute('data-collapsed', 'true');
                const ul = li.nextElementSibling;
                if (!ul)
                    return;
                Array.from(ul.getElementsByTagName('span')).map(s => {
                    s.setAttribute('data-collapsed', 'true');
                });
            }
            // adjustAllConnectors(); unnecessary for display:hidden
        };
    });
}
