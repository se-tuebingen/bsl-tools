"use strict";
var BSL_AST;
(function (BSL_AST) {
    ;
    ;
    ;
    // export type empty = `'()`;
    // runtime type checking
    function isDefinition(obj) {
        return isFunDef(obj) || isConstDef(obj) || isStructDef(obj);
    }
    BSL_AST.isDefinition = isDefinition;
    function isFunDef(obj) {
        return obj.body !== undefined;
    }
    BSL_AST.isFunDef = isFunDef;
    function isConstDef(obj) {
        return obj.cname !== undefined;
    }
    BSL_AST.isConstDef = isConstDef;
    function isStructDef(obj) {
        return obj.binding !== undefined;
    }
    BSL_AST.isStructDef = isStructDef;
    function isExpr(obj) {
        return isCall(obj) || isCond(obj) || isName(obj) || isV(obj);
    }
    BSL_AST.isExpr = isExpr;
    function isCall(obj) {
        return obj.fname !== undefined && obj.body === undefined;
    }
    BSL_AST.isCall = isCall;
    function isCond(obj) {
        return obj.options !== undefined;
    }
    BSL_AST.isCond = isCond;
    function isName(obj) {
        return obj.symbol !== undefined;
    }
    BSL_AST.isName = isName;
    function isV(obj) {
        return ['boolean', 'string', 'number'].includes(typeof (obj)) || obj == `'()`;
    }
    BSL_AST.isV = isV;
})(BSL_AST || (BSL_AST = {}));
