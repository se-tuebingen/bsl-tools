function pprint(p: AST.program): string {
  return p.map(printDefOrExpr).join('\n');
}
function printDefOrExpr(eod: AST.defOrExpr) {
  if(AST.isDefinition(eod)) {
    return printDefinition(eod);
  } else {
    return printE(eod);
  }
}
function printDefinition(d: AST.definition) {
  if(AST.isFDefine(d)) {
    return `(define ${printName(d.fname)} (${d.args.map(printName).join(' ')}) ${printE(d.body)})`;
  } else if(AST.isCDefine(d)) {
    return `(define ${printName(d.cname)} ${printE(d.value)})`;
  } else if(AST.isSDefine(d)) {
    return `(define ${printName(d.binding)} (${d.properties.map(printName).join(' ')}))`
  } else {
    console.error('Invalid input to printDefinition');
  }
}
function printE(e: AST.e): string {
  if(AST.isFCall(e)) {
    return `(${printName(e.fname)} ${e.args.map(printE).join(' ')})`;
  } else if(AST.isCond(e)) {
    return `(cond ${e.options.map(printOption).join(' ')})`;
  } else if(AST.isName(e)) {
    return printName(e);
  } else if(AST.isV(e)) {
    if(typeof(e) === 'string' && e !== `'()`) {
      return `"${e}"`;
    } else {
      return `${e}`;
    }
  } else {
    console.error('Invalid input to printE');
    return `<${e}>`;
  }
}

function printOption(o: AST.option) {
  return `[${printE(o.guard)} ${printE(o.value)}]`;
}

function printName(s: AST.name): string {
  return s.symbol;
}

const testprogram: AST.program = [
  {
    fname:
    {symbol: 'f'},
    args: [{symbol: 'x'}, {symbol: 'y'}],
    body: {fname: {symbol: '+'}, args: [{symbol: 'x'}, {symbol: 'y'}]}
  },
  {
    options: [
      {
        guard: {
          fname: {symbol: '='},
          args: [{symbol: 'x'}, 3]
        },
        value: 'isThree'
      },
      {
        guard: false,
        value: `'()`
      }
    ]
  },
  {
    cname: {symbol: 'x'},
    value: 42
  },
  {
    binding: {symbol: 'name'},
    properties: [
      {symbol: 'firstName'},
      {symbol: 'lastName'}
    ]
  }
];
console.log('done');
console.log(pprint(testprogram));
