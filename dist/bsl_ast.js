"use strict";
var BSL_AST;
(function (BSL_AST) {
    let Production;
    (function (Production) {
        Production["FunctionDefinition"] = "Function Definition";
        Production["ConstantDefinition"] = "Constant Definition";
        Production["StructDefinition"] = "Struct Definition";
        Production["FunctionCall"] = "Function Call";
        Production["CondExpression"] = "Cond-Expression";
        Production["Symbol"] = "Symbol";
    })(Production = BSL_AST.Production || (BSL_AST.Production = {}));
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
        return obj.type === Production.FunctionDefinition;
    }
    BSL_AST.isFunDef = isFunDef;
    function isConstDef(obj) {
        return obj.type === Production.ConstantDefinition;
    }
    BSL_AST.isConstDef = isConstDef;
    function isStructDef(obj) {
        return obj.type === Production.StructDefinition;
    }
    BSL_AST.isStructDef = isStructDef;
    function isExpr(obj) {
        return isCall(obj) || isCond(obj) || isName(obj) || isV(obj);
    }
    BSL_AST.isExpr = isExpr;
    function isCall(obj) {
        return obj.type === Production.FunctionCall;
    }
    BSL_AST.isCall = isCall;
    function isCond(obj) {
        return obj.type === Production.CondExpression;
    }
    BSL_AST.isCond = isCond;
    function isName(obj) {
        return obj.type === Production.Symbol;
    }
    BSL_AST.isName = isName;
    function isV(obj) {
        return ['boolean', 'string', 'number'].includes(typeof (obj)) || obj == `'()`;
    }
    BSL_AST.isV = isV;
})(BSL_AST || (BSL_AST = {}));
