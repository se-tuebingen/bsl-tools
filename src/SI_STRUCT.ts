import * as BSL_AST from "./BSL_AST";

export enum Production{
    Stepper = "Stepper",
    StepResult = "StepResult",
    Split = "Split",
    PlugResult = "PlugResult",
    CallRedex = "Redex",
    AppContext = "AppContext",
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
// StepResult is type = StepResult | Error
export interface StepResult{
    type: Production.StepResult;
    splitResult: SplitResult;
    plugResult: PlugResult;
    currentStep: number;
}

export type SplitResult = Split | BSL_AST.Literal;

export interface Split{
    type: Production.Split;
    redex: Redex;
    context: Context;
}

export interface PlugResult{
    type: Production.PlugResult;
    rule: Kong | OneRule;
    expr: BSL_AST.expr;
}
// Redex ist Summentyp: CallRedex | CondRedex, etc.
export type Redex = CallRedex;

export interface CallRedex{
    type: Production.CallRedex;
    name: BSL_AST.Name;
    args: BSL_AST.expr[];
}

// App value[] Context expr[]
// interface App {op: string; values: value[]; ctx: Context; args: expr[] }
// type Context = AppContext | Hole
// interface AppContext { operator: String; values: value[]; ctx: Context; args: expr[] }


export type Context = AppContext | Hole;

export interface AppContext{
    type: Production.AppContext;
    op: BSL_AST.Name;
    values: BSL_AST.Literal[];
    ctx: Context;
    args: BSL_AST.expr[];
}

/* export interface Context{
    type: Production.Context;
    name: BSL_AST.Name | null;
    args: exprOrHole[];

} */

export interface Hole{
    type: Production.Hole;
    //index: number //number[];
}

export type exprOrHole = BSL_AST.expr | Hole;

//######## OneRule(s) ########
export interface Prim{
    type: Production.Prim;
    //redex: Redex;
    //literal: BSL_AST.Literal;
}
export type OneRule = Prim;

// ####### ProgStepRule(s) ########
export interface Kong{
    type: Production.Kong;
    //context: Context;
    redexRule: OneRule;
}
// ##########################

// runtime type checking
export function isCallRedex(obj: any): obj is CallRedex {
    return obj.type === Production.CallRedex;
}
export function isHole(obj: any): obj is Hole {
    return obj.type === Production.Hole;
}
export function isAppContext(obj: any): obj is AppContext {
    return obj.type === Production.AppContext;
}
export function isSplit(obj: any): obj is Split {
    return obj.type === Production.Split;
}
export function isSplitResult(obj: any): obj is SplitResult {
    return isSplit(obj) || BSL_AST.isLiteral(obj);
}
export function isPrim(obj: any): obj is Prim {
    return obj.type === Production.Prim;
}
export function isKong(obj: any): obj is Kong {
    return obj.type === Production.Kong;
}
export function isPlugResult(obj: any): obj is PlugResult {
    return obj.type === Production.PlugResult;
}
export function isStepResult(obj: any): obj is StepResult {
    return obj.type === Production.StepResult;
}
export function isStepper(obj: any): obj is Stepper {
    return obj.type === Production.Stepper;
}
export function isOneRule(obj: any): obj is OneRule {
    return obj.type === Production.Prim;
}
