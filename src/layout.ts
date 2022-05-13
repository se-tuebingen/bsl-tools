// // layout boxes as a tree
// interface node {
//   el: HTMLElement;
//   children: node[];
//   childrenContainer?: HTMLElement;
// }

// https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft
function treeProgram(program: BSL_AST.program, target: HTMLElement){
  target.innerHTML = program.map(treeDefOrExpr).join('\n');
}
function treeDefOrExpr(root: BSL_AST.defOrExpr) {
  return `<ul class="tree"><li>${BSL_AST.isDefinition(root) ? treeDefinition(root): treeE(root)}</li></ul>`;
}
function treeDefinition(d: BSL_AST.definition) {
  if(BSL_AST.isFunDef(d)) {
    return `
      <span>${pprint([d])}</span>
      <ul>
        <li>${treeName(d.fname)}</li>
        <li>${d.args.map(treeName).join('</li><li>')}</li>
        <li>${treeE(d.body)}</li>
      </ul>`;
  } else if(BSL_AST.isConstDef(d)) {
    return `
      <span>${pprint([d])}</span>
      <ul>
        <li>${treeName(d.cname)}</li>
        <li>${treeE(d.value)}</li>
      </ul>`;
  } else if(BSL_AST.isStructDef(d)) {
    return `
      <span>${pprint([d])}</span>
      <ul>
        <li>${treeName(d.binding)}</li>
        <li>${d.properties.map(treeName).join('</li><li>')}</li>
      </ul>`;
  } else {
    console.error('Invalid input to printDefinition');
  }
}
function treeE(e: BSL_AST.expr): string {
  if(BSL_AST.isCall(e)) {
    return `
      <span>${pprint([e])}</span>
      <ul>
        <li>${treeName(e.fname)}</li>
        <li>${e.args.map(treeE).join('</li><li>')}</li>
      </ul>`;
  } else if(BSL_AST.isCond(e)) {
    return `
      <span>${pprint([e])}</span>
      <ul>
        <li>${e.options.map(treeOption).join('</li><li>')}</li>
      </ul>`;
  } else if(BSL_AST.isName(e)) {
    return treeName(e);
  } else if(BSL_AST.isV(e)) {
    return `<span>${pprint([e])}</span>`;
  } else {
    console.error('Invalid input to treeE');
    return `<span>${e}</span>`;
  }
}

function treeOption(o: BSL_AST.Clause) {
  return `
    <span>${printOption(o)}</span>
    <ul>
      <li>${treeE(o.condition)}</li>
      <li>${treeE(o.result)}</li>
    </ul>
  `;
}

function treeName(s: BSL_AST.Name): string {
  return `<span>${s.symbol}</span>`;
}
