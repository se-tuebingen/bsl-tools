export var Production;
(function (Production) {
    Production["FunctionDefinition"] = "Function Definition";
    Production["ConstantDefinition"] = "Constant Definition";
    Production["StructDefinition"] = "Struct Definition";
    Production["FunctionCall"] = "Function Call";
    Production["CondExpression"] = "Cond-Expression";
    Production["Symbol"] = "Symbol";
})(Production || (Production = {}));
;
;
;
// export type empty = `'()`;
// runtime type checking
export function isDefinition(obj) {
    return isFunDef(obj) || isConstDef(obj) || isStructDef(obj);
}
export function isFunDef(obj) {
    return obj.type === Production.FunctionDefinition;
}
export function isConstDef(obj) {
    return obj.type === Production.ConstantDefinition;
}
export function isStructDef(obj) {
    return obj.type === Production.StructDefinition;
}
export function isExpr(obj) {
    return isCall(obj) || isCond(obj) || isName(obj) || isV(obj);
}
export function isCall(obj) {
    return obj.type === Production.FunctionCall;
}
export function isCond(obj) {
    return obj.type === Production.CondExpression;
}
export function isName(obj) {
    return obj.type === Production.Symbol;
}
export function isV(obj) {
    return ['boolean', 'string', 'number'].includes(typeof (obj)) || obj == `'()`;
}
//# sourceMappingURL=BSL_AST.js.map