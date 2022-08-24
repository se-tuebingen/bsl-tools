import * as BSL_AST from "./BSL_AST";

export enum Production {
    Stepper = "Stepper",
    ExprStep = "ExprStep",
    DefinitionStep = "DefinitionStep",
    Split = "Split",
    PlugResult = "PlugResult",
    CallRedex = "CallRedex",
    CondRedex = "CondRedex",
    CondOption = "CondOption",
    AppContext = "AppContext",
    CondContext = "CondContext",
    Hole = "Hole",
    Prim = "Prim",
    CondTrue = "CondTrue",
    CondFalse = "CondFalse", 
    ProgRule = "ProgRule",
    Kong = "Kong",
    Nothing = "Nothing",
}

export interface Stepper {
    type: Production.Stepper;
    root: HTMLElement;
    originProgram: BSL_AST.program;
    stepperTree: StepResult[];
}
// ProgStep is type = ExprStep | DefinitionStep
export type StepResult = ExprStep | DefinitionStep;
export interface ExprStep {
    type: Production.ExprStep;
    env: Environment;
    splitResult: SplitResult;
    plugResult: PlugResult;
    currentStep: number;
}
export interface DefinitionStep {
    type: Production.DefinitionStep;
    env: Environment;
    definition: BSL_AST.definition;
    currentStep: number;
}


export type SplitResult = Split | Value;

export interface Split {
    type: Production.Split;
    redex: Redex;
    context: Context;
}

export interface PlugResult {
    type: Production.PlugResult;
    rule: Kong | OneRule;
    expr: BSL_AST.expr | Value;
}
// Redex ist Summentyp: CallRedex | CondRedex, etc.
// ####### REDEX #######
export type Redex = CallRedex | CondRedex;

export interface CallRedex {
    type: Production.CallRedex;
    name: BSL_AST.Name;
    args: Value[];
}

export interface CondRedex {
    type: Production.CondRedex;
    options: BSL_AST.Clause[];
}

// ####### Context #######
export type Context = AppContext | CondContext | Hole;

export interface AppContext {
    type: Production.AppContext;
    op: BSL_AST.Name;
    values: Value[];
    ctx: Context;
    args: BSL_AST.expr[];
}
export interface CondContext {
    type: Production.CondContext;
    options: BSL_AST.Clause[];
    ctx: Context;
}
export interface Hole {
    type: Production.Hole;
    //index: number //number[];
}

export type Value = number | string | boolean | `'()` /*| Nothing*/;
/*export interface Nothing {
    type: Production.Nothing;
}*/
//######## OneRule(s) ########
export interface Prim {
    type: Production.Prim;
    redex: CallRedex;
    result: Value;
}
export type CondRule = CondTrue | CondFalse;
export interface CondTrue{
    type: Production.CondTrue;
    redex:CondRedex;
    result:BSL_AST.expr | Value;
}
export interface CondFalse{
    type: Production.CondFalse;
    redex:CondRedex;
    result: BSL_AST.Cond;
}
export interface ProgRule {
    type: Production.ProgRule;
    definition: BSL_AST.definition;
}
export type OneRule = Prim | CondRule; /*| ProgRule*/

// ####### ProgStepRule(s) ########
export interface Kong {
    type: Production.Kong;
    //context: Context;
    redexRule: OneRule;
}
// ######### DEFINITIONS ########

// definition is either structDef, funDef or constDef
// DefRules PROG, STRUCT, FUN, CONST


// ENVIRONMENT
// interface Environment :Map = {[key: string]: Value};

export type Environment = Map<string, Value | BSL_AST.expr>; // BSL_AST.expr zuerst auswerten (call by value)
// ##########################

// runtime type checking
export function isStepper(obj:any): obj is Stepper {
    return obj.type === Production.Stepper;
}
export function isStepResult(obj: any):obj is StepResult {
    return obj.type === Production.ExprStep || obj.type === Production.DefinitionStep;
}
export function isExprStep(obj: any): obj is ExprStep {
    return obj.type === Production.ExprStep;
}
export function isCallRedex(obj: any): obj is CallRedex {
    return obj.type === Production.CallRedex;
}
export function isCondRedex(obj: any): obj is CondRedex {
    return obj.type === Production.CondRedex;
}
export function isHole(obj: any): obj is Hole {
    return obj.type === Production.Hole;
} 
export function isContext(obj: any): obj is Context {
    return obj.type === Production.AppContext || obj.type === Production.CondContext;
}
export function isAppContext(obj: any): obj is AppContext {
    return obj.type === Production.AppContext;
}
export function isCondContext(obj: any): obj is CondContext {
    return obj.type === Production.CondContext;
}
export function isSplit(obj: any): obj is Split {
    return obj.type === Production.Split;
}
export function isPlugResult(obj: any): obj is PlugResult {
    return obj.type === Production.PlugResult;
}
export function isOneRule(obj: any): obj is OneRule {
    return obj.type === Production.Prim || (obj.type === Production.CondTrue || obj.type === Production.CondFalse);
}
export function isPrim(obj: any): obj is Prim {
    return obj.type === Production.Prim;
}
export function isCondRule(obj: any): obj is CondRule {
    return obj.type === Production.CondTrue || obj.type === Production.CondFalse;
}
export function isKong(obj: any): obj is Kong {
    return obj.type === Production.Kong;
}
export function isValue(obj: any): obj is Value {
    return typeof obj === "number" || typeof obj === "string" || typeof obj === "boolean" || obj === `'()`;
}
