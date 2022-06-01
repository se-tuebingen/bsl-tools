import * as parser from "./parser_tests/bsl-grammar";
;
// Parse BSL Tree
function parseBslTree(el) {
    let root = el;
    let text = el.innerText;
    return {
        root: root,
        text: text,
    };
}
// Get BSL Trees
function setup() {
    const bslHtmlCol = document.getElementsByTagName("bsl-tree");
    for (let i = 0; i < bslHtmlCol.length; i++) {
        let bslHtml = bslHtmlCol[i];
        let bslTree = parseBslTree(bslHtml);
        console.log(bslTree.text);
        let json = parser.parse(bslTree.text);
        console.log(json);
        //console.log(json);
        // assign JSON parts to BSL_AST-Structures
    }
}
window.onload = setup;
const example = {
    "program": [
        {
            "DefOrExpr": {
                "Expression": {
                    "cond": [
                        "(cond",
                        undefined,
                        [
                            [
                                "[",
                                undefined,
                                {
                                    "Expression": [
                                        "(",
                                        "*",
                                        [
                                            {
                                                "Expression": {
                                                    "Value": {
                                                        "Number": 2
                                                    }
                                                }
                                            },
                                            {
                                                "Expression": {
                                                    "Value": {
                                                        "Number": 4
                                                    }
                                                }
                                            }
                                        ],
                                        ")"
                                    ]
                                },
                                {
                                    "Expression": {
                                        "Value": {
                                            "boolean": true
                                        }
                                    }
                                },
                                undefined,
                                "]",
                                undefined
                            ],
                            [
                                "[",
                                undefined,
                                {
                                    "Expression": {
                                        "Value": {
                                            "boolean": true
                                        }
                                    }
                                },
                                {
                                    "Expression": {
                                        "Value": {
                                            "boolean": false
                                        }
                                    }
                                },
                                undefined,
                                "]",
                                undefined
                            ]
                        ],
                        undefined,
                        ")"
                    ]
                }
            }
        }
    ]
};
// Parser Functions
/*
function parseValue(val:any) :boolean | string | number | `'()`{
if (val.hasOwnProperty("boolean") && val != undefined){
   return val.boolean;
}else if(val.hasOwnProperty("number") && val != undefined){
   return val.number;
}else if(val.hasOwnProperty("string") && val != undefined){
   return val.string;
}else if(val.hasOwnProperty("empty") && val != undefined){
   return `'()`;
}else{
   console.log("There is no valid value!");
   return undefined;
}
}
function parseCall(call:any) : BSL_AST.Call {
   if (call.hasOwnProperty("name") && call.hasOwnProperty("Expression"))
}

function parseExpression(expr: any) : BSL_AST.Cond | BSL_AST.Name | BSL_AST.Call | BSL_AST.v{
   if (expr.hasOwnProperty("cond")) {
      return parseCond(expr.cond);
   } else if (expr.hasOwnProperty("name")) {
      return parseName(expr.name);
   } else if (expr.hasOwnProperty("call")) {
      return parseCall(expr.call);
   } else if (expr.hasOwnProperty("value") && parseValue(expr.value) != undefined) {
      return parseValue(expr.value);
   } else {
      console.log("There is no valid expression!");
      return undefined;
   }
}
function parseDefinition(def: any) :BSL_AST.definition{
if(def.hasOwnProperty("StructDef" && parseStructDef() != undefined)){
}else if(def.hasOwnProperty("FunDef" && parseFunDef() != undefined)){
}else if (def.hasOwnProperty("ConstDef" && parseConstDef() != undefined)){
}
}


function parseDefOrExpr(program: any): BSL_AST.expr | BSL_AST.definition {
   for (let i = 0; i < program.length; i++) {
      let defOrExpr = program[i];
      if (defOrExpr.hasOwnProperty("Expression") && (parseExpression (defOrExpr.Expression) != undefined)) {
         return parseExpression(defOrExpr.Expression);
      } else if (defOrExpr.hasOwnProperty("Definition") && (parseDefinition (defOrExpr.Definition) != undefined)) {
         let def = program[i].Definition as any;
         return parseDefinition(defOrExpr.Definition);
      }
   }
}


function parseProgram(json: any): BSL_AST.program | undefined {
   const program = json.program as any;

   if (parseDefOrExpr(program) != undefined) {
      return [parseDefOrExpr(program)];
}
} */ 
//# sourceMappingURL=assignJson.js.map