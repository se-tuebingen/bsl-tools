module AST{
    export type program = defOrExpr[];

    export type defOrExpr = definition | e;
    export type definition = fdefine | cdefine | sdefine;

    export interface fdefine{
        fname: name;
        args: name[];
        body: e;
    }
    export interface cdefine{
        cname: name;
        value: e;
    }
    export interface sdefine{
        binding: name;
        properties: name[];
    };
    export type e = fcall | cond | name | v;

    export interface fcall{
        fname: name;
        args: e[];
    };
    export interface option{
        guard: e;
        value: e;
    }
    export interface cond{
        options: option[]
    }
    export interface name{
        symbol:string;
    };
    export type v = boolean | string | number | empty;
    export type empty = `'()`;

    // runtime type checking
    export function isDefinition(obj: any): obj is definition {
      return isFDefine(obj) || isCDefine(obj) || isSDefine(obj);
    }
    export function isFDefine(obj: any): obj is fdefine {
      return obj.body !== undefined;
    }
    export function isCDefine(obj: any): obj is cdefine {
      return obj.cname !== undefined;
    }
    export function isSDefine(obj: any): obj is sdefine {
      return obj.binding !== undefined;
    }

    export function isE(obj: any): obj is e {
      return isFCall(obj) || isCond(obj) || isName(obj) || isV(obj);
    }
    export function isFCall(obj: any): obj is fcall {
      return obj.fname !== undefined && obj.body === undefined;
    }
    export function isCond(obj: any): obj is cond {
      return obj.options !== undefined;
    }
    export function isName(obj: any): obj is name {
      return obj.symbol !== undefined;
    }
    export function isV(obj: any): obj is v {
      return ['boolean', 'string', 'number'].includes(typeof(obj)) || obj == `'()`;
    }
}
