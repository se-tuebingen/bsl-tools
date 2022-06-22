import * as BSL_AST from "./BSL_AST";

export enum Production{
    Stepper = "Stepper",
    StepResult = "StepResult",
    Split = "Split",
    PlugResult = "PlugResult",
    Redex = "Redex",
    Context = "Context",
    Hole = "Hole",
    Prim = "Prim",
    Kong = "Kong"
}

export interface Stepper{
    type: Production.Stepper;
    root: HTMLElement;
    originExpr: BSL_AST.expr;
    stepperTree: StepResult[];
}

export interface StepResult{
    type: Production.StepResult;
    splitResult: SplitResult;
    plugResult: PlugResult;
}

export type SplitResult = Split | BSL_AST.Literal;

export interface Split{
    type: Production.Split;
    redex: Redex;
    context: Context;
}

export interface PlugResult{
    type: Production.PlugResult;
    rule: ProgStepRule | OneRule;
    expr: BSL_AST.expr;
}

export interface Redex{
    type: Production.Redex;
    name: BSL_AST.Name;
    args: BSL_AST.expr[];
}

export interface Context{
    type: Production.Context;
    name: BSL_AST.Name | null;
    args: exprOrHole[];

}

export interface Hole{
    type: Production.Hole;
    index: number;
}

export type exprOrHole = BSL_AST.expr | Hole;

//######## OneRule(s) ########
export interface Prim{
    type: Production.Prim;
    redex: Redex;
    literal: BSL_AST.Literal;
}
export type OneRule = Prim;

// ####### ProgStepRule(s) ########
export interface Kong{
    type: Production.Kong;
    context: Context;
    redexRule: OneRule;
}
export type ProgStepRule = Kong;

// ##########################

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
export function isPrim(obj: any): obj is Prim {
    return obj.type === "Prim";
}
export function isKong(obj: any): obj is Kong {
    return obj.type === "Kong";
}
export function isPlugResult(obj: any): obj is PlugResult {
    return obj.type === "PlugResult";
}
export function isStepResult(obj: any): obj is StepResult {
    return obj.type === "StepResult";
}
export function isStepper(obj: any): obj is Stepper {
    return obj.type === "Stepper";
}
export function isOneRule(obj: any): obj is OneRule {
    return obj.type === "Prim";
}
export function isProgStepRule(obj: any): obj is ProgStepRule {
    return obj.type === "Kong";
}
export function isProgStepRules(obj: any): obj is ProgStepRule[] {
    return Array.isArray(obj);
}
