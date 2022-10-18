import * as BSL_AST from "./BSL_AST";

export enum Production {
    Stepper = "Stepper",
    ExprStep = "ExprStep",
    DefinitionStep = "DefinitionStep",
    EvalStep = "EvalStep",
    Split = "Split",
    PlugResult = "PlugResult",
    CallRedex = "CallRedex",
    CondRedex = "CondRedex",
    NameRedex = "NameRedex",
    CondOption = "CondOption",
    AppContext = "AppContext",
    CondContext = "CondContext",
    Hole = "Hole",
    Prim = "Prim",
    CondTrue = "CondTrue",
    CondFalse = "CondFalse",
    CondError = "CondError",
    ProgRule = "ProgRule",
    Const = "Const",
    Kong = "Kong",
    FunValue = "FunValue",
    StructValue = "StructValue",
    Id = "Identifier",
}

export interface Stepper {
    type: Production.Stepper;
    root: HTMLElement;
    originProgram: BSL_AST.program;
    stepperTree:  ProgStep[];
}
// ProgStep represents a line of code in a BSL program
//  export interface ProgStep {
//      type: Production.ProgStep;
//      stepList: Step[];
//  }

// Step[]
// Step is type = ExprStep | DefinitionStep
export type ProgStep = ExprStep | DefinitionStep;

// DefinitionStep has ProgRule
export interface DefinitionStep {
    type: Production.DefinitionStep;
    env: Environment;
    evalSteps: EvalStep[];
    originalDefOrExpr: BSL_AST.definition;
    result: BSL_AST.definition; //evaluated definition, which is given to env
}
export interface ExprStep {
    type: Production.ExprStep;
    env: Environment;
    evalSteps: EvalStep[];
    originalDefOrExpr: BSL_AST.expr;
    result: Value | Error;
}

export interface EvalStep {
   type: Production.EvalStep;
   env: Environment;
   rule: Kong | OneRule;
   result: BSL_AST.expr | Value | Error;
}
// LOCAL-Rule für ISL

export type SplitResult = Split | Value;

export interface Split {
    type: Production.Split;
    redex: Redex;
    context: Context;
}

/* export interface PlugResult {
    type: Production.PlugResult;
    rule: Kong | OneRule;
    expr: BSL_AST.expr | Value;
} */
// Redex ist Summentyp: CallRedex | CondRedex, etc.
// ####### REDEX #######
export type Redex = CallRedex | CondRedex  | NameRedex;

export interface CallRedex {
    type: Production.CallRedex;
    name: BSL_AST.Name;
    args: (Value | Id)[];
}

export interface CondRedex {
    type: Production.CondRedex;
    options: BSL_AST.Clause[];
}

 export interface NameRedex{
     type: Production.NameRedex;
     symbol: string;
 }
// ####### Context #######
export type Context = AppContext | CondContext | Hole;

export interface AppContext {
    type: Production.AppContext;
    op: BSL_AST.Name;
    values: (Value | Id)[];
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
}
export type Value = number | string | boolean | `'()` /*| FunValue/*| Closure | StructValue*/;
export interface Id{
    type: Production.Id;
    symbol: string;
}
export interface FunValue{
    type: Production.FunValue;
    params: BSL_AST.Name[];
    body: BSL_AST.expr;
}
export interface StructValue{
    type: Production.StructValue;
    params: BSL_AST.Name[];
}
//######## OneRule(s) ########a
export interface Prim {
    type: Production.Prim;
    redex: CallRedex;
    result: Value;
}
export type CondRule = CondTrue | CondFalse  | CondError;
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
export interface CondError{
    type: Production.CondError;
    redex:CondRedex;
    result: Error;
}
export interface ProgRule {
    type: Production.ProgRule;
    definition: BSL_AST.definition;
}

export interface Const {
    type: Production.Const;
    redex: Redex;
    result: BSL_AST.expr | Value;
}

export type OneRule = Prim | CondRule | Const; /*| ProgRule*/

// ####### ProgStepRule(s) ########
export interface Kong {
    type: Production.Kong;
    context: Context;
    redexRule: OneRule;
}
// ######### DEFINITIONS ########

// definition is either structDef, funDef or constDef
// DefRules PROG, STRUCT, FUN, CONST


// ENVIRONMENT

export type Environment = { [key: string]: Value };
// BSL_AST.expr zuerst auswerten (call by value)
// ##########################

// runtime type checking
// Stepper and Steps
export function isStepper(obj:any): obj is Stepper {
    return obj.type === Production.Stepper;
}
export function isExprStep(obj:any): obj is ExprStep {
    return obj.type === Production.ExprStep;
}
export function isDefinitionStep(obj: any): obj is DefinitionStep {
    return obj.type === Production.DefinitionStep;
}
export function isEvalStep(obj: any): obj is EvalStep {
    return obj.type === Production.EvalStep;
}
//Redex
export function isCallRedex(obj: any): obj is CallRedex {
    return obj.type === Production.CallRedex;
}
export function isCondRedex(obj: any): obj is CondRedex {
    return obj.type === Production.CondRedex;
}
export function isNameRedex(obj: any): obj is NameRedex {
    return obj.type === Production.NameRedex;
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
/* export function isPlugResult(obj: any): obj is PlugResult {
    return obj.type === Production.PlugResult;
} */
export function isOneRule(obj: any): obj is OneRule {
    return obj.type === Production.Prim || (obj.type === Production.CondTrue || obj.type === Production.CondFalse || obj.type === Production.CondError) || obj.type === Production.Const;
}
export function isPrim(obj: any): obj is Prim {
    return obj.type === Production.Prim;
}
export function isCondRule(obj: any): obj is CondRule {
    return obj.type === Production.CondTrue || obj.type === Production.CondFalse;
}
export function isConst(obj: any): obj is Const {
    return obj.type === Production.Const;
}
export function isKong(obj: any): obj is Kong {
    return obj.type === Production.Kong;
}
export function isValue(obj: any): obj is Value {
    return typeof obj === 'number' || typeof obj === 'string' || typeof obj === 'boolean' || obj === `'()` //|| isClosure(obj);
}
export function isId(obj: any): obj is Id {
    return obj.type === Production.Id;
}
