module BSL_AST{
    export type program = defOrExpr[];

    export type defOrExpr = definition | expr;
    export type definition = FunDef | ConstDef | StructDef;

    export interface FunDef{
        fname: Name;
        args: Name[];
        body: expr;
    }
    export interface ConstDef{
        cname: Name;
        value: expr;
    }
    export interface StructDef{
        binding: Name;
        properties: Name[];
    };
    export type expr = Call | Cond | Name | v;

    export interface Call{
        fname: Name;
        args: expr[];
    };
    export interface Clause{
        condition: expr;
        result: expr;
    }
    export interface Cond{
        options: Clause[]
    }
    export interface Name{
        symbol:string;
    };
    export type v = boolean | string | number | `'()`;
    // export type empty = `'()`;

    // runtime type checking
    export function isDefinition(obj: any): obj is definition {
      return isFunDef(obj) || isConstDef(obj) || isStructDef(obj);
    }
    export function isFunDef(obj: any): obj is FunDef {
      return obj.body !== undefined;
    }
    export function isConstDef(obj: any): obj is ConstDef {
      return obj.cname !== undefined;
    }
    export function isStructDef(obj: any): obj is StructDef {
      return obj.binding !== undefined;
    }

    export function isExpr(obj: any): obj is expr {
      return isCall(obj) || isCond(obj) || isName(obj) || isV(obj);
    }
    export function isCall(obj: any): obj is Call {
      return obj.fname !== undefined && obj.body === undefined;
    }
    export function isCond(obj: any): obj is Cond {
      return obj.options !== undefined;
    }
    export function isName(obj: any): obj is Name {
      return obj.symbol !== undefined;
    }
    export function isV(obj: any): obj is v {
      return ['boolean', 'string', 'number'].includes(typeof(obj)) || obj == `'()`;
    }
}
