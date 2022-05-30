export enum Production {
  FunctionDefinition = 'Function Definition',
  ConstantDefinition = 'Constant Definition',
  StructDefinition = 'Struct Definition',
  FunctionCall = 'Function Call',
  CondExpression = 'Cond-Expression',
  Symbol = 'Symbol'
}

export type program = defOrExpr[];

export type defOrExpr = definition | expr;
export type definition = FunDef | ConstDef | StructDef;

export interface FunDef{
    type: Production.FunctionDefinition;
    name: Name;
    args: Name[];
    body: expr;
}
export interface ConstDef{
    type: Production.ConstantDefinition;
    name: Name;
    value: expr;
}
export interface StructDef{
    type: Production.StructDefinition;
    binding: Name;
    properties: Name[];
};
export type expr = Call | Cond | Name | v;

export interface Call{
    type: Production.FunctionCall;
    name: Name;
    args: expr[];
};
export interface Clause{
    condition: expr;
    result: expr;
}
export interface Cond{
    type: Production.CondExpression;
    options: Clause[]
}
export interface Name{
    type: Production.Symbol;
    symbol:string;
};
export type v = boolean | string | number | `'()`;
// export type empty = `'()`;

// runtime type checking
export function isDefinition(obj: any): obj is definition {
  return isFunDef(obj) || isConstDef(obj) || isStructDef(obj);
}
export function isFunDef(obj: any): obj is FunDef {
  return obj.type === Production.FunctionDefinition;
}
export function isConstDef(obj: any): obj is ConstDef {
  return obj.type === Production.ConstantDefinition;
}
export function isStructDef(obj: any): obj is StructDef {
  return obj.type === Production.StructDefinition;
}

export function isExpr(obj: any): obj is expr {
  return isCall(obj) || isCond(obj) || isName(obj) || isV(obj);
}
export function isCall(obj: any): obj is Call {
  return obj.type === Production.FunctionCall;
}
export function isCond(obj: any): obj is Cond {
  return obj.type === Production.CondExpression;
}
export function isName(obj: any): obj is Name {
  return obj.type === Production.Symbol;
}
export function isV(obj: any): obj is v {
  return ['boolean', 'string', 'number'].includes(typeof(obj)) || obj == `'()`;
}
