import * as BSL_AST from "./BSL_AST";

export enum Production {
  Stepper = "Stepper",
  ExprStep = "ExprStep",
  DefinitionStep = "DefinitionStep",
  EvalStep = "EvalStep",
  Split = "Split",
  CallRedex = "CallRedex",
  CondRedex = "CondRedex",
  NameRedex = "NameRedex",
  CondOption = "CondOption",
  AppContext = "AppContext",
  CondContext = "CondContext",
  Hole = "Hole",
  PrimDef = "PrimDef",
  FunDef = "FunEnv",
  StructDef = "StructDef",
  MakeFun = "MakeFun",
  PredFun = "PredFun",
  SelectFun = "SelectFun",
  Id = "Identifier",
}

export enum Decomposition {
  Stepper = "Stepper",
  ExprStep = "ExprStep",
  DefinitionStep = "DefinitionStep",
  EvalStep = "EvalStep",
  Split = "Split",
  CallRedex = "CallRedex",
  CondRedex = "CondRedex",
  NameRedex = "NameRedex",
  CondOption = "CondOption",
  AppContext = "AppContext",
  CondContext = "CondContext",
  Hole = "Hole",
  Id = "Identifier",
}
export enum EnvironmentValue {
  FunDef = "FunEnv",
  StructDef = "StructDef",
  MakeFun = "MakeFun",
  PredFun = "PredFun",
  SelectFun = "SelectFun",
}
export enum Rule {
  Kong = "Kong",
  Prim = "Prim",
  PrimError = "PrimError",
  CondTrue = "CondTrue",
  CondFalse = "CondFalse",
  CondError = "CondError",
  Prog = "Prog",
  ProgError = "ProgError",
  Const = "Const",
  ConstError = "ConstError",
  Fun = "Fun",
  FunError = "FunError",
  StructMake = "StructMake",
  StructMakeError = "StructMakeError",
  StructPredTrue = "StructPredTrue",
  StructPredFalse = "StructPredFalse",
  StructPredError = "StructPredError",
  StructSelect = "StructSelect",
  StructSelectError = "StructSelectError",
}
export enum PrimFuns {
  Add = "+",
  Sub = "-",
  Mul = "*",
  Div = "/",
  And = "and",
  Or = "or",
  Not = "not",
  Leq = "<=",
  Geq = ">=",
  Lt = "<",
  Gt = ">",
}
export interface Stepper {
  type: Production.Stepper;
  originProgram: BSL_AST.program;
  progSteps: ProgStep[];
}
export type ProgStep = ExprStep | DefinitionStep;
// DefinitionStep has ProgRule
export interface DefinitionStep {
  type: Production.DefinitionStep;
  env: Environment;
  evalSteps: EvalStep[];
  rule: Prog | ProgError;
  originalDefOrExpr: BSL_AST.definition;
  result: BSL_AST.definition | Error; //evaluated definition, which is given to env
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
export type SplitResult = Split | Value;
export interface Split {
  type: Production.Split;
  redex: Redex;
  context: Context;
}

// Redex ist Summentyp: CallRedex | CondRedex, etc.
// ####### REDEX #######
export type Redex = CallRedex | CondRedex | NameRedex;

export interface CallRedex {
  type: Production.CallRedex;
  name: BSL_AST.Name;
  args: (Value | Id)[];
}

export interface CondRedex {
  type: Production.CondRedex;
  options: BSL_AST.Clause[];
}

export interface NameRedex {
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
export type Value =
  | number
  | string
  | boolean
  | `'()`
  | BSL_AST.StructValue /*| FunValue/*| Closure */;

export type EnvValue = Value | PrimDef | FunDef | StructDef | StructFun;
export interface Id {
  type: Production.Id;
  symbol: string;
}
export interface PrimDef {
  type: Production.PrimDef;
}
export interface FunDef {
  type: Production.FunDef;
  params: BSL_AST.Name[];
  body: BSL_AST.expr;
}
export interface StructDef {
  type: Production.StructDef;
  properties: BSL_AST.Name[];
}
export type StructFun = MakeFun | PredFun | SelectFun;

export interface MakeFun {
  type: Production.MakeFun;
  structDef: StructDef;
}
export interface PredFun {
  type: Production.PredFun;
  structDef: StructDef;
}
export interface SelectFun {
  type: Production.SelectFun;
  structDef: StructDef;
}

//######## OneRule(s) ########
export type PrimRule = Prim | PrimError;
export interface Prim {
  type: Rule.Prim;
  redex: CallRedex;
  result: Value;
}
export interface PrimError {
  type: Rule.PrimError;
  redex: CallRedex;
  result: Error;
}
export type CondRule = CondTrue | CondFalse | CondError;
export interface CondTrue {
  type: Rule.CondTrue;
  redex: CondRedex;
  result: BSL_AST.expr | Value;
}
export interface CondFalse {
  type: Rule.CondFalse;
  redex: CondRedex;
  result: BSL_AST.Cond;
}
export interface CondError {
  type: Rule.CondError;
  redex: CondRedex;
  result: Error;
}
export type ProgRule = Prog | ProgError;
export interface Prog {
  type: Rule.Prog;
  result: BSL_AST.definition;
}
export interface ProgError {
  type: Rule.ProgError;
  result: Error;
}
export type ConstRule = Const | ConstError;
export interface Const {
  type: Rule.Const;
  redex: Redex;
  result: BSL_AST.expr | Value;
}
export interface ConstError {
  type: Rule.ConstError;
  redex: Redex;
  result: Error;
}
export type FunRule = Fun | FunError;
export interface Fun {
  type: Rule.Fun;
  redex: CallRedex;
  result: BSL_AST.expr;
}
export interface FunError {
  type: Rule.FunError;
  redex: CallRedex;
  result: Error;
}
type StructRule =
  | StructMake
  | StructMakeError
  | StructPredTrue
  | StructPredFalse
  | StructPredError
  | StructSelect
  | StructSelectError;
export interface StructMake {
  type: Rule.StructMake;
  redex: CallRedex;
  result: Value;
}
export interface StructMakeError {
  type: Rule.StructMakeError;
  redex: CallRedex;
  result: Error;
}
export interface StructPredTrue {
  type: Rule.StructPredTrue;
  redex: CallRedex;
  result: true;
}
export interface StructPredFalse {
  type: Rule.StructPredFalse;
  redex: CallRedex;
  result: false;
}
export interface StructPredError {
  type: Rule.StructPredError;
  redex: CallRedex;
  result: Error;
}
export interface StructSelect {
  type: Rule.StructSelect;
  redex: CallRedex;
  result: BSL_AST.expr | Value;
}
export interface StructSelectError {
  type: Rule.StructSelectError;
  redex: CallRedex;
  result: Error;
}

export type OneRule = PrimRule | CondRule | ConstRule | FunRule | StructRule;

// ####### ProgStepRule(s) ########
export interface Kong {
  type: Rule.Kong;
  context: Context;
  redexRule: OneRule;
}
// ######### DEFINITIONS ########

// definition is either structDef, funDef or constDef
// DefRules PROG, STRUCT, FUN, CONST

// ENVIRONMENT

export type Environment = { [key: string]: EnvValue };
// BSL_AST.expr is evaluated first (call by value)
// ##########################

// runtime type checking
// Stepper and Steps
export function isStepper(obj: any): obj is Stepper {
  return obj.type === Production.Stepper;
}
export function isExprStep(obj: any): obj is ExprStep {
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
  return (
    obj.type === Production.AppContext || obj.type === Production.CondContext
  );
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
export function isOneRule(obj: any): obj is OneRule {
  return (
    obj.type === Rule.Prim ||
    obj.type === Rule.PrimError ||
    obj.type === Rule.CondTrue ||
    obj.type === Rule.CondFalse ||
    obj.type === Rule.CondError ||
    obj.type === Rule.Const ||
    obj.type === Rule.ConstError ||
    obj.type === Rule.Fun ||
    obj.type === Rule.FunError ||
    obj.type === Rule.StructMake ||
    obj.type === Rule.StructMakeError ||
    obj.type === Rule.StructPredTrue ||
    obj.type === Rule.StructPredFalse ||
    obj.type === Rule.StructPredError ||
    obj.type === Rule.StructSelect ||
    obj.type === Rule.StructSelectError
  );
}
export function isProgRule(obj: any): obj is ProgRule {
  return obj.type === Rule.Prog || obj.type === Rule.ProgError;
}
export function isProg(obj: any): obj is Prog {
  return obj.type === Rule.Prog;
}
export function isProgError(obj: any): obj is ProgError {
  return obj.type === Rule.ProgError;
}
export function isKong(obj: any): obj is Kong {
  return obj.type === Rule.Kong;
}
export function isValue(obj: any): obj is Value {
  return (
    typeof obj === "number" ||
    typeof obj === "string" ||
    typeof obj === "boolean" ||
    obj === `'()` ||
    BSL_AST.isStructValue(obj)
  ); //|| isClosure(obj);
}
export function isPrimDef(obj: any): obj is PrimDef {
  return obj.type === Production.PrimDef;
}
export function isFunDef(obj: any): obj is FunDef {
  return obj.type === Production.FunDef;
}
export function isStructDef(obj: any): obj is StructDef {
  return obj.type === Production.StructDef;
}
export function isId(obj: any): obj is Id {
  return obj.type === Production.Id;
}
export function isStructFun(obj: any): obj is StructFun {
  return (
    obj.type === Production.MakeFun ||
    obj.type === Production.PredFun ||
    obj.type === Production.SelectFun
  );
}
export function isMakeFun(obj: any): obj is MakeFun {
  return obj.type === Production.MakeFun;
}
export function isPredFun(obj: any): obj is PredFun {
  return obj.type === Production.PredFun;
}
export function isSelectFun(obj: any): obj is SelectFun {
  return obj.type === Production.SelectFun;
}
