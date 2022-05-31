"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testprogram = exports.printName = exports.printOption = exports.printE = exports.printDefinition = exports.printDefOrExpr = exports.pprint = void 0;
const BSL_AST = __importStar(require("./BSL_AST"));
function pprint(p) {
    return p.map(printDefOrExpr).join('\n');
}
exports.pprint = pprint;
function printDefOrExpr(eod) {
    if (BSL_AST.isDefinition(eod)) {
        return printDefinition(eod);
    }
    else {
        return printE(eod);
    }
}
exports.printDefOrExpr = printDefOrExpr;
function printDefinition(d) {
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
exports.printDefinition = printDefinition;
function printE(e) {
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
exports.printE = printE;
function printOption(o) {
    return `[${printE(o.condition)} ${printE(o.result)}]`;
}
exports.printOption = printOption;
function printName(s) {
    return s.symbol;
}
exports.printName = printName;
exports.testprogram = [
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