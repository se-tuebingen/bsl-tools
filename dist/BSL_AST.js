"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isV = exports.isName = exports.isCond = exports.isCall = exports.isExpr = exports.isStructDef = exports.isConstDef = exports.isFunDef = exports.isDefinition = exports.Production = void 0;
var Production;
(function (Production) {
    Production["FunctionDefinition"] = "Function Definition";
    Production["ConstantDefinition"] = "Constant Definition";
    Production["StructDefinition"] = "Struct Definition";
    Production["FunctionCall"] = "Function Call";
    Production["CondExpression"] = "Cond-Expression";
    Production["Symbol"] = "Symbol";
})(Production = exports.Production || (exports.Production = {}));
;
;
;
// export type empty = `'()`;
// runtime type checking
function isDefinition(obj) {
    return isFunDef(obj) || isConstDef(obj) || isStructDef(obj);
}
exports.isDefinition = isDefinition;
function isFunDef(obj) {
    return obj.type === Production.FunctionDefinition;
}
exports.isFunDef = isFunDef;
function isConstDef(obj) {
    return obj.type === Production.ConstantDefinition;
}
exports.isConstDef = isConstDef;
function isStructDef(obj) {
    return obj.type === Production.StructDefinition;
}
exports.isStructDef = isStructDef;
function isExpr(obj) {
    return isCall(obj) || isCond(obj) || isName(obj) || isV(obj);
}
exports.isExpr = isExpr;
function isCall(obj) {
    return obj.type === Production.FunctionCall;
}
exports.isCall = isCall;
function isCond(obj) {
    return obj.type === Production.CondExpression;
}
exports.isCond = isCond;
function isName(obj) {
    return obj.type === Production.Symbol;
}
exports.isName = isName;
function isV(obj) {
    return ['boolean', 'string', 'number'].includes(typeof (obj)) || obj == `'()`;
}
exports.isV = isV;
//# sourceMappingURL=BSL_AST.js.map