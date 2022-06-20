import * as BSL_AST from "./BSL_AST";

//Redex
// export interface AddRedex{
//     type: "AddRedex";
//     args: BSL_AST.expr[];
// }
// export interface MulRedex{
//     type: "MulRedex";
//     leftExpr: BSL_AST.expr;
//     rightExpr: BSL_AST.expr;
// }

export interface Redex{
    type: "Redex";
    name: BSL_AST.Name;
    args: BSL_AST.expr[];
}

//Context
export interface Hole{
    type: "Hole";
    symbol: "";
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


