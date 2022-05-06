"use strict";
var AST;
(function (AST) {
    ;
    ;
    ;
    // runtime type checking
    function isDefinition(obj) {
        return isFDefine(obj) || isCDefine(obj) || isSDefine(obj);
    }
    AST.isDefinition = isDefinition;
    function isFDefine(obj) {
        return obj.body !== undefined;
    }
    AST.isFDefine = isFDefine;
    function isCDefine(obj) {
        return obj.cname !== undefined;
    }
    AST.isCDefine = isCDefine;
    function isSDefine(obj) {
        return obj.binding !== undefined;
    }
    AST.isSDefine = isSDefine;
    function isE(obj) {
        return isFCall(obj) || isCond(obj) || isName(obj) || isV(obj);
    }
    AST.isE = isE;
    function isFCall(obj) {
        return obj.fname !== undefined && obj.body === undefined;
    }
    AST.isFCall = isFCall;
    function isCond(obj) {
        return obj.options !== undefined;
    }
    AST.isCond = isCond;
    function isName(obj) {
        return obj.symbol !== undefined;
    }
    AST.isName = isName;
    function isV(obj) {
        return ['boolean', 'string', 'number'].includes(typeof (obj)) || obj == `'()`;
    }
    AST.isV = isV;
})(AST || (AST = {}));
