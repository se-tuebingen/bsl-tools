import * as BSL_AST from "./BSL_AST";

//Redex
export interface AddRedex{
    leftExpr: BSL_AST.expr;
    rightExpr: BSL_AST.expr;
}
export interface MulRedex{
    leftExpr: BSL_AST.expr;
    rightExpr: BSL_AST.expr;
}
export type Redex = AddRedex | MulRedex;

//Context
export interface Hole{
symbol: "";
}

export interface AddL {
    context: Context;
    expr: BSL_AST.expr;
}
export interface AddR {
    context: Context;
    expr: BSL_AST.expr;
}
export type Context = Hole | AddL | AddR

// Split

export interface Split{
    redex: Redex;
    context: Context;
}