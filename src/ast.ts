module AST{
    type program = defOrExpr[];

    type defOrExpr = definition | e;
    type definition = fdefine | cdefine | sdefine;

    interface fdefine{
        fname: name;
        args: name[];
        body: e;
    }
    interface cdefine{
        cname: name;
        value: e;
    }
    interface sdefine{
        binding: name;
        properties: name[];
    };
    type e = fcall | cond | name | v;

    interface fcall{
        fname: name;
        args: e[];
    };
    interface option{
        guard: e;
        value: e;
    }
    interface cond{
        options: option[]
    }
    interface name{
        symbol:string;
    };
    type v = boolean | string | number | empty;
    type empty = `'()`;
}