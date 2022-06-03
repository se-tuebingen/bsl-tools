import * as BSL_AST from "./BSL_AST";

export function pprint(p: BSL_AST.program): string {
  return p.map(printDefOrExpr).join('\n');
}
export function printDefOrExpr(eod: BSL_AST.defOrExpr) {
  if(BSL_AST.isDefinition(eod)) {
    return printDefinition(eod);
  } else {
    return printE(eod);
  }
}
export function printDefinition(d: BSL_AST.definition) {
  if(BSL_AST.isFunDef(d)) {
    return `(define ${printName(d.name)} (${d.args.map(printName).join(' ')}) ${printE(d.body)})`;
  } else if(BSL_AST.isConstDef(d)) {
    return `(define ${printName(d.name)} ${printE(d.value)})`;
  } else if(BSL_AST.isStructDef(d)) {
    return `(define-struct ${printName(d.binding)} (${d.properties.map(printName).join(' ')}))`
  } else {
    console.error('Invalid input to printDefinition');
  }
}
export function printE(e: BSL_AST.expr): string {
  if(BSL_AST.isCall(e)) {
    return `(${printName(e.name)} ${e.args.map(printE).join(' ')})`;
  } else if(BSL_AST.isCond(e)) {
    return `(cond ${e.options.map(printOption).join(' ')})`;
  } else if(BSL_AST.isName(e)) {
    return printName(e);
  } else if(BSL_AST.isLiteral(e)) {
    if(typeof(e.value) === 'string' && e.value !== `'()`) {
      return `"${e.value}"`;
    } else if(typeof(e.value) === 'boolean') {
      return e.value ? '#true' : '#false';
    } else {
      return `${e.value}`;
    }
  } else {
    console.error('Invalid input to printE');
    return `<${e}>`;
  }
}

export function printOption(o: BSL_AST.Clause) {
  return `[${printE(o.condition)} ${printE(o.result)}]`;
}

export function printName(s: BSL_AST.Name): string {
  return s.symbol;
}

export const testprogram: BSL_AST.program = [
  {
    type: BSL_AST.Production.FunctionDefinition,
    name: {
      type: BSL_AST.Production.Symbol,
      symbol: 'f'
    },
    args: [{
      type: BSL_AST.Production.Symbol,
      symbol: 'x'
    }, {
      type: BSL_AST.Production.Symbol,
      symbol: 'y'
    }],
    body: {
      type: BSL_AST.Production.FunctionCall,
      name: {
        type: BSL_AST.Production.Symbol,
        symbol: '+'
      },
      args: [{
        type: BSL_AST.Production.Symbol,
        symbol: 'x'
      }, {
        type: BSL_AST.Production.Symbol,
        symbol: 'y'
      }]}
  },
  {
    type: BSL_AST.Production.CondExpression,
    options: [
      {
        type: BSL_AST.Production.CondOption,
        condition: {
          type: BSL_AST.Production.FunctionCall,
          name: {
            type: BSL_AST.Production.Symbol,
            symbol: '='
          },
          args: [{
            type: BSL_AST.Production.Symbol,
            symbol: 'x'
          },
          {
            type: BSL_AST.Production.Literal,
            value: 3
          }]
        },
        result: {
          type: BSL_AST.Production.Literal,
          value: 'isThree'
        }
      },
      {
        type: BSL_AST.Production.CondOption,
        condition: {
          type: BSL_AST.Production.Literal,
          value: false
        },
        result: {
          type: BSL_AST.Production.Literal,
          value: `'()`
        }
      }
    ]
  },
  {
    type: BSL_AST.Production.ConstantDefinition,
    name: {
      type: BSL_AST.Production.Symbol,
      symbol: 'x'
    },
    value: {
      type: BSL_AST.Production.Literal,
      value: 42
    }
  },
  {
    type: BSL_AST.Production.StructDefinition,
    binding: {
      type: BSL_AST.Production.Symbol,
      symbol: 'name'
    },
    properties: [
      {
        type: BSL_AST.Production.Symbol,
        symbol: 'firstName'
      },
      {
        type: BSL_AST.Production.Symbol,
        symbol: 'lastName'
      }
    ]
  }
];
