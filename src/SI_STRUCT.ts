import * as BSL_AST from "./BSL_AST";

export interface Redex{
    type: "Redex";
    name: BSL_AST.Name;
    args: BSL_AST.expr[];
}

//Context
export interface Hole{
    type: "Hole";
    index: number;
}


export type exprOrHole = BSL_AST.expr | Hole;

export interface Context{
    type: "Context";
    name: BSL_AST.Name | null;
    args: exprOrHole[];

}

// Split

export interface Split{
    redex: Redex;
    context: Context;
}

//SplitResult

export type SplitResult = Split | BSL_AST.Literal;


// runtime type checking
export function isRedex(obj: any): obj is Redex {
    return obj.type === "Redex";
}
export function isHole(obj: any): obj is Hole {
    return obj.type === "Hole";
}
export function isContext(obj: any): obj is Context {
    return obj.type === "Context";
}
export function isSplit(obj: any): obj is Split {
    return obj.type === "Split";
}
export function isSplitResult(obj: any): obj is SplitResult {
    return isSplit(obj) || BSL_AST.isLiteral(obj);
}