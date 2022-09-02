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
export function printDefinition(d: BSL_AST.definition): string {
  if(BSL_AST.isFunDef(d)) {
    return `(define (${printName(d.name)} ${d.args.map(printName).join(' ')}) ${printE(d.body)})`;
  } else if(BSL_AST.isConstDef(d)) {
    return `(define ${printName(d.name)} ${printE(d.value)})`;
  } else if(BSL_AST.isStructDef(d)) {
    return `(define-struct ${printName(d.binding)} (${d.properties.map(printName).join(' ')}))`
  } else {
    console.error('Invalid input to printDefinition');
    return '';
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

// indent code that is wider than maxLength characters
export function indent(code: string, maxWidth: number, mode: 'html' | 'text' = 'text'): string {
  // extract terms and their theoretical indentation level
  let terms: {term: string, level: number}[] = [];
  let level = 0;
  let nextLevel = 0;
  let maxLevel = 0;
  let acc = '';
  let inString = false;
  code.split('').forEach(char => {
    if(inString && char !== '"') {
      acc += char;
      return;
    }
    switch(char) {
      case '(':
      case '[':
        nextLevel++;
        acc += char;
        return;
      case ')':
      case ']':
        nextLevel--;
        acc += char;
        return;
      case '"':
        inString = !inString;
        acc += char;
        return;
      case ' ':
      case '\n':
      case '\t':
        terms.push({term: acc, level: level});
        if (level > maxLevel) maxLevel = level;
        acc = '';
        level = nextLevel;
        return;
      default:
        acc += char;
        return;
    }
  });
  if(acc !== '') {
    terms.push({term: acc, level: level});
    if (level > maxLevel) maxLevel = level;
  }
  console.log(terms);
  // append terms starting from the inside
  const joiner = mode === 'html' ? '<br>' : `
`;
  for(let level = maxLevel; level > 0; level--) {
    // group terms
    const newTerms: {term:string, level:number, subterms:string[]}[] = [];
    terms.forEach(t => {
      if (t.level < level) {
        newTerms.push({...t, subterms: []});
      } else {
        newTerms[newTerms.length - 1].subterms.push(t.term);
      }
    });
    // append and check if we need to start indenting
    terms = newTerms.map(t => {
      const alreadyIndenting = t.subterms.some(s => s.includes(joiner));
      if(alreadyIndenting ||
        `${t.term} ${t.subterms.join(' ')}`.length + t.level > maxWidth) {
        const sub = t.subterms.map(s => `${mode === 'html' ? repeat('&nbsp;', level) : repeat(' ', level)}${s}`);
        const joiner = mode === 'html' ? '<br>' : `
`;
        const all = `${t.term}${sub.length > 0 ? joiner : ''}${sub.join(joiner)}`;
        return {term: all, level: t.level};
      } else {
        return {term: `${t.term}${t.subterms.length > 0 ? ' ': ''}${t.subterms.join(' ')}`, level: t.level};
      }
    });
    console.log(terms);
  }
  // now there should be only top level terms left
  return terms.map(t => t.term).join(joiner);
}

function repeat(s: string, n: number):string {
  let acc = '';
  for(let i = 0; i < n; i++) {
    acc += s;
  }
  return acc;
}
