import * as BSL_AST from "./BSL_AST";
export function pprint(p) {
    return p.map(printDefOrExpr).join('\n');
}
export function printDefOrExpr(eod) {
    if (BSL_AST.isDefinition(eod)) {
        return printDefinition(eod);
    }
    else {
        return printE(eod);
    }
}
export function printDefinition(d) {
    if (BSL_AST.isFunDef(d)) {
        return `(define ${printName(d.name)} (${d.args.map(printName).join(' ')}) ${printE(d.body)})`;
    }
    else if (BSL_AST.isConstDef(d)) {
        return `(define ${printName(d.name)} ${printE(d.value)})`;
    }
    else if (BSL_AST.isStructDef(d)) {
        return `(define ${printName(d.binding)} (${d.properties.map(printName).join(' ')}))`;
    }
    else {
        console.error('Invalid input to printDefinition');
    }
}
export function printE(e) {
    if (BSL_AST.isCall(e)) {
        return `(${printName(e.name)} ${e.args.map(printE).join(' ')})`;
    }
    else if (BSL_AST.isCond(e)) {
        return `(cond ${e.options.map(printOption).join(' ')})`;
    }
    else if (BSL_AST.isName(e)) {
        return printName(e);
    }
    else if (BSL_AST.isV(e)) {
        if (typeof (e) === 'string' && e !== `'()`) {
            return `"${e}"`;
        }
        else {
            return `${e}`;
        }
    }
    else {
        console.error('Invalid input to printE');
        return `<${e}>`;
    }
}
export function printOption(o) {
    return `[${printE(o.condition)} ${printE(o.result)}]`;
}
export function printName(s) {
    return s.symbol;
}
export const testprogram = [
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
                }]
        }
    },
    {
        type: BSL_AST.Production.CondExpression,
        options: [
            {
                condition: {
                    type: BSL_AST.Production.FunctionCall,
                    name: {
                        type: BSL_AST.Production.Symbol,
                        symbol: '='
                    },
                    args: [{
                            type: BSL_AST.Production.Symbol,
                            symbol: 'x'
                        }, 3]
                },
                result: 'isThree'
            },
            {
                condition: false,
                result: `'()`
            }
        ]
    },
    {
        type: BSL_AST.Production.ConstantDefinition,
        name: {
            type: BSL_AST.Production.Symbol,
            symbol: 'x'
        },
        value: 42
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
//# sourceMappingURL=Pprint.js.map