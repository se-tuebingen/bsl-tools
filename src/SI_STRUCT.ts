import * as BSL_AST from "./BSL_AST";

export enum Production {
    Stepper = "Stepper",
    ProgStep = "ProgStep",
    ExprStep = "ExprStep",
    DefinitionStep = "DefinitionStep",
    Split = "Split",
    PlugResult = "PlugResult",
    CallRedex = "CallRedex",
    CondRedex = "CondRedex",
    ConstRedex = "ConstRedex",
    CondOption = "CondOption",
    AppContext = "AppContext",
    CondContext = "CondContext",
    Hole = "Hole",
    Prim = "Prim",
    CondTrue = "CondTrue",
    CondFalse = "CondFalse",
    ProgRule = "ProgRule",
    Const = "Const",
    Kong = "Kong",
    FunClosure = "FunClosure",
    StructClosure = "StructClosure",
    Id = "Identifier",
}

export interface Stepper {
    type: Production.Stepper;
    root: HTMLElement;
    originProgram: BSL_AST.program;
    stepperTree:  ProgStep[];
}
// ProgStep represents a line of code in a BSL program
 export interface ProgStep {
     type: Production.ProgStep;
     stepList: Step[];
 }

// Step[]
// Step is type = ExprStep | DefinitionStep
export type Step = ExprStep | DefinitionStep;

export interface DefinitionStep {
    type: Production.DefinitionStep;
    env: Environment;
    rule: ProgRule;
    evalSteps: ExprStep[];
    result: BSL_AST.definition; //evaluated definition, which is given to env
}

export interface ExprStep {
   type: Production.ExprStep;
   env: Environment;
   rule: Kong | OneRule;
   result: BSL_AST.expr | Value;
}


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
export type Redex = CallRedex | CondRedex /* | ConstRedex */;

export interface CallRedex {
    type: Production.CallRedex;
    name: BSL_AST.Name;
    args: (Value | Id)[];
}

export interface CondRedex {
    type: Production.CondRedex;
    options: BSL_AST.Clause[];
}

// export interface ConstRedex{
//     type: Production.ConstRedex;
//     id: BSL_AST.Name;
//     expr: BSL_AST.expr;
// }
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
export type Value = number | string | boolean | `'()` /*| Closure | StructValue*/;
export interface Id{
    type: Production.Id;
    symbol: string;
}
export type Closure = FunClosure | StructClosure;
export interface FunClosure{
    type: Production.FunClosure;
    params: BSL_AST.Name[];
    body: BSL_AST.expr;
}
export interface StructClosure{
    type: Production.StructClosure;
    params: BSL_AST.Name[];
}
//######## OneRule(s) ########a
export interface Prim {
    type: Production.Prim;
    redex: CallRedex;
    result: Value;
}
export type CondRule = CondTrue | CondFalse /* | CondError*/;
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
export function isStepper(obj:any): obj is Stepper {
    return obj.type === Production.Stepper;
}
export function isProgStep(obj:any): obj is ProgStep {
    return obj.type === Production.ProgStep;
}
export function isStep(obj: any):obj is Step {
    return obj.type === Production.ExprStep || obj.type === Production.DefinitionStep;
}
export function isDefinitionStep(obj: any): obj is DefinitionStep {
    return obj.type === Production.DefinitionStep;
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
/* export function isPlugResult(obj: any): obj is PlugResult {
    return obj.type === Production.PlugResult;
} */
export function isOneRule(obj: any): obj is OneRule {
    return obj.type === Production.Prim || (obj.type === Production.CondTrue || obj.type === Production.CondFalse) || obj.type === Production.Const;
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