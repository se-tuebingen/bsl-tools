import * as BSL_AST from "./BSL_AST";
import * as SI_STRUCT from "./SI_STRUCT";

// calculateAllSteps (for the whole program)
export function calculateProgram(
  program: BSL_AST.program,
  stepper: SI_STRUCT.Stepper
): SI_STRUCT.Stepper | Error {
  const copyProgram = JSON.parse(JSON.stringify(program));
  let env: SI_STRUCT.Environment = {};
  while (copyProgram.length > 0) {
    //program.forEach
    let stepperTree: SI_STRUCT.ProgStep[] = stepper.stepperTree;
    let defOrExpr = copyProgram.shift();
    //NEW APPROACH
    let progStep = calculateProgStep(defOrExpr, env);
    if (progStep instanceof Error) {
      return progStep;
    } else {
      env = progStep.env;
      stepperTree.push(progStep);
    }
    console.log("progStep", progStep);
    console.log("env", env);
    stepper.stepperTree = stepperTree;
  }
  const newStepper: SI_STRUCT.Stepper = {
    type: SI_STRUCT.Production.Stepper,
    root: stepper.root,
    originProgram: stepper.originProgram,
    stepperTree: stepper.stepperTree,
  };
  //newStepper.stepperTree.map((step, i) => (step.currentStep = i));
  return newStepper;
}

// calculate ProgStep
// line is a line of program code -> ProgStep | Error
export function calculateProgStep(
  defOrExpr: BSL_AST.expr | BSL_AST.definition,
  env: SI_STRUCT.Environment
): SI_STRUCT.ProgStep | Error {
  if (BSL_AST.isExpr(defOrExpr)) {
    const evalStep = calculateEvalSteps(defOrExpr, env);
    console.log("exprStep:", evalStep);
    if (evalStep instanceof Error) {
      return evalStep;
    } else if (evalStep.length === 0) {
      return {
        type: SI_STRUCT.Production.ExprStep,
        env: env,
        evalSteps: [],
        originalDefOrExpr: defOrExpr,
        result: evaluateExpression(defOrExpr, env) as SI_STRUCT.Value,
      };
    } else {
      const result = evalStep[evalStep.length - 1].result;
      if (BSL_AST.isExpr(result)) {
        return new Error("Result is not a value");
      } else {
        return {
          type: SI_STRUCT.Production.ExprStep,
          env: evalStep[evalStep.length - 1].env,
          evalSteps: evalStep,
          originalDefOrExpr: defOrExpr,
          result: result,
        };
      }
    }
  } else {
    console.log("definition", defOrExpr);
    const defStep = calculateDefSteps(defOrExpr, env);
    if (defStep instanceof Error) {
      return defStep;
    } else {
      console.log("defStep", defStep);
      return defStep;
    }
  }
}
//calculateDefSteps
//definition, Environment => SI_STRUCT.DefStep
export function calculateDefSteps(
  def: BSL_AST.definition,
  env: SI_STRUCT.Environment
): SI_STRUCT.DefinitionStep | Error {
  if (BSL_AST.isConstDef(def)) {
    const name = def.name;
    const expr = def.value;
    console.log("name", name + "expr", expr);
    if (BSL_AST.isLiteral(expr)) {
      const value = expr.value;
      const newEnv = addToEnv(env, name.symbol, value);
      if (newEnv instanceof Error) {
        return newEnv;
      } else {
        return {
          type: SI_STRUCT.Production.DefinitionStep,
          env: newEnv,
          evalSteps: [],
          originalDefOrExpr: def,
          result: def,
        };
      }
    } else {
      let stepList = calculateEvalSteps(expr, env);
      if (stepList instanceof Error) {
        return stepList;
      } else {
        const value = stepList[stepList.length - 1].result;
        if (SI_STRUCT.isValue(value)) {
          const newEnv = addToEnv(env, name.symbol, value);
          if (newEnv instanceof Error) {
            return newEnv;
          } else {
            const newDef: BSL_AST.ConstDef = {
              type: BSL_AST.Production.ConstantDefinition,
              name: name,
              value: { type: BSL_AST.Production.Literal, value: value },
            };
            return {
              type: SI_STRUCT.Production.DefinitionStep,
              env: newEnv,
              evalSteps: stepList,
              originalDefOrExpr: def,
              result: newDef,
            };
          }
        } else {
          return Error(
            "calculateDefSteps: Last ExprStep is an Expr, not a Value"
          );
        }
      }
    }
  } else if (BSL_AST.isFunDef(def)) {
    const name = def.name;
    if (name.symbol in env) {
      return Error("calculateDefSteps: name already bound");
    } else {
      //add function definition to environment
      const funDef: SI_STRUCT.FunDef = {
        type: SI_STRUCT.Production.FunDef,
        params: def.args,
        body: def.body,
      };
      const newEnv = addToEnv(env, name.symbol, funDef);
      if (newEnv instanceof Error) {
        return newEnv;
      } else {
        const defStep: SI_STRUCT.DefinitionStep = {
          type: SI_STRUCT.Production.DefinitionStep,
          env: newEnv,
          evalSteps: [],
          originalDefOrExpr: def,
          result: def,
        };
        return defStep;
      }
    }
  } else {
    const binding = def.binding;
    const properties = def.properties;
    // add StructDef to environment
    const structDef: SI_STRUCT.StructDef = {
      type: SI_STRUCT.Production.StructDef,
      properties: properties,
    };
    let newEnv = addToEnv(env, binding.symbol, structDef);
    //check if newEnv is an Error before defining structFuns
    if (newEnv instanceof Error) {
      return newEnv;
    } else {
      const makeFunName = `make-${binding.symbol}`;
      const makeFunDef: SI_STRUCT.MakeFun = {
        type: SI_STRUCT.Production.MakeFun,
        structDef: structDef,
      };
      const predFunName = `${binding.symbol}?`;
      const predFunDef: SI_STRUCT.PredFun = {
        type: SI_STRUCT.Production.PredFun,
        structDef: structDef,
      };
      // reserve all possible struct-property names
      const selectFunNames: string[] = [];
      properties.forEach((property) => {
        selectFunNames.push(`${binding.symbol}-${property.symbol}`);
      });
      const selectFunDef: SI_STRUCT.SelectFun = {
        type: SI_STRUCT.Production.SelectFun,
        structDef: structDef,
      };
      const addList: [string, SI_STRUCT.StructFun][] = [
        [makeFunName, makeFunDef],
        [predFunName, predFunDef],
      ];
      selectFunNames.forEach((name) => {
        addList.push([name, selectFunDef]);
      });
      // add all structFuns to environment
      addList.forEach((entry) => {
        if (newEnv instanceof Error) {
          return newEnv;
        } else {
          newEnv = addToEnv(newEnv, entry[0], entry[1]);
        }
      });
      if (newEnv instanceof Error) {
        return newEnv;
      } else {
        const defStep: SI_STRUCT.DefinitionStep = {
          type: SI_STRUCT.Production.DefinitionStep,
          env: newEnv,
          evalSteps: [],
          originalDefOrExpr: def,
          result: def,
        };
        return defStep;
      }
    }
  }
}
// calculateExprSteps
// expr, steppResult[] => exprStep[] | Error
export function calculateEvalSteps(
  expr: BSL_AST.expr,
  env: SI_STRUCT.Environment
): SI_STRUCT.EvalStep[] | Error {
  let stepList: SI_STRUCT.EvalStep[] = [];
  let currentExpr: BSL_AST.expr | SI_STRUCT.Value = expr;
  while (!SI_STRUCT.isValue(currentExpr)) {
    const step = evaluateExpression(currentExpr, env);
    if (SI_STRUCT.isValue(step)) {
      currentExpr = step;
    } else if (SI_STRUCT.isEvalStep(step)) {
      if (step.result instanceof Error) {
        stepList.push(step);
        break;
      } else {
        currentExpr = step.result;
        stepList.push(step);
      }
    } else {
      return step;
    }
  }
  return stepList;
}

//evaluateExpression

export function evaluateExpression(
  expr: BSL_AST.expr,
  env: SI_STRUCT.Environment
): SI_STRUCT.EvalStep | SI_STRUCT.Value | Error {
  if (BSL_AST.isLiteral(expr)) {
    console.log("evaluateExpression: Literal", expr);
    return expr.value;
  } else {
    const splitExpr = split(expr);
    //console.log("splitExpr", splitExpr);
    if (SI_STRUCT.isSplit(splitExpr)) {
      const stepExpr = step(splitExpr.redex, env);
      //console.log("stepExpr", stepExpr);
      if (SI_STRUCT.isOneRule(stepExpr)) {
        const exprStep = plug(stepExpr, splitExpr.context, env);
        console.log("exprStep", exprStep);
        if (SI_STRUCT.isEvalStep(exprStep)) {
          return exprStep;
        } else {
          return exprStep;
        }
      } else {
        return stepExpr;
      }
    } else {
      return splitExpr;
    }
  }
}

//split
// Expression = > SplitResult | Error
export function split(expr: BSL_AST.expr): SI_STRUCT.SplitResult | Error {
  const hole: SI_STRUCT.Hole = { type: SI_STRUCT.Production.Hole };
  if (BSL_AST.isCall(expr)) {
    const name = expr.name;
    const args = expr.args;
    const valueLst: SI_STRUCT.Value[] = [];
    let recExpr: BSL_AST.expr = {} as BSL_AST.expr;
    const exprLst: BSL_AST.expr[] = [];
    // local function split into value and expr
    // => Either(Value[], (Value[],expr, expr[]))
    // find position with map
    let posFound = false;
    args.map((arg) => {
      //if the argument is a value, add it to the value list
      if (!posFound && BSL_AST.isLiteral(arg)) {
        valueLst.push(arg.value);
        //else if the argument is neither a value nor a name, set the position
      } else if (!posFound) {
        posFound = true;
        recExpr = arg;
        // else the argument is an expression, add it to the expression list
      } else {
        exprLst.push(arg);
      }
    });
    // if there is no context, all arguments are values and the result is a value
    if (posFound == false) {
      const redex: SI_STRUCT.CallRedex = {
        type: SI_STRUCT.Production.CallRedex,
        name: name,
        args: valueLst,
      };
      return {
        type: SI_STRUCT.Production.Split,
        redex: redex,
        context: hole,
      };
      // else there is a context and the result is an expression
    } else {
      const splitResult = split(recExpr);
      if (SI_STRUCT.isSplit(splitResult)) {
        return {
          type: SI_STRUCT.Production.Split,
          redex: splitResult.redex,
          context: {
            type: SI_STRUCT.Production.AppContext,
            op: name,
            values: valueLst,
            ctx: splitResult.context,
            args: exprLst,
          },
        };
      } else {
        return splitResult;
      }
    }
  } else if (BSL_AST.isCond(expr)) {
    const clause = expr.options[0];
    // if condition is already reduced, build CondRedex
    if (BSL_AST.isLiteral(clause.condition)) {
      return {
        type: SI_STRUCT.Production.Split,
        redex: {
          type: SI_STRUCT.Production.CondRedex,
          options: expr.options,
        },
        context: hole,
      };
    }
    // else split condition
    else {
      const splitResult = split(clause.condition);
      if (SI_STRUCT.isSplit(splitResult)) {
        return {
          type: SI_STRUCT.Production.Split,
          redex: splitResult.redex,
          context: {
            type: SI_STRUCT.Production.CondContext,
            options: expr.options,
            ctx: splitResult.context,
          },
        };
      } else {
        return splitResult;
      }
    }
  } else if (BSL_AST.isName(expr)) {
    return {
      type: SI_STRUCT.Production.Split,
      context: hole,
      redex: {
        type: SI_STRUCT.Production.NameRedex,
        symbol: expr.symbol,
      },
    };
  } else {
    return Error("split: neither a call nor a cond nor name");
  }
}

// step
// Redex => OneRule | Error
export function step(
  r: SI_STRUCT.Redex,
  env: SI_STRUCT.Environment
): SI_STRUCT.OneRule | Error {
  // before stepping check if the redex has no names in it
  // if it has, lookup in environment and construct Rule (Const, Fun, or Struct)
  if (SI_STRUCT.isCallRedex(r)) {
    //check if all args do not contain names
    const allArgsAreValues = r.args.every((arg) => {
      return SI_STRUCT.isValue(arg);
    });
    if (allArgsAreValues) {
      const args: SI_STRUCT.Value[] = r.args as SI_STRUCT.Value[];
      //check if r.name is primitive or in env
      const funDef = lookupEnv(env, r.name.symbol);
      //check if name is in Primitive List
      if (Object.values<string>(SI_STRUCT.PrimNames).includes(r.name.symbol)) {
        const primResult = prim(r.name, args);
        if (SI_STRUCT.isValue(primResult)) {
          return {
            type: SI_STRUCT.Production.Prim,
            redex: r,
            result: primResult,
          };
        } else {
          return Error("step: prim is not applicable");
        }
        //if name => function
      } else if (SI_STRUCT.isFunDef(funDef)) {
        console.log("step: env: " + JSON.stringify(funDef) + " args: " + args);
        //check if funDef is a defined function or a struct-predefined function
        //replace names in body with args
        const newExpr = substFun(r, env);
        if (newExpr instanceof Error) {
          return newExpr;
        } else {
          return {
            type: SI_STRUCT.Production.Fun,
            redex: r,
            result: newExpr,
          };
        }
        //if name => structFunction
      } else if (SI_STRUCT.isStructFun(funDef)) {
        //decide which struct Rule to use
        if (SI_STRUCT.isMakeFun(funDef)) {
          const structVal = makeStruct(r.name, funDef, args);
          if (structVal instanceof Error) {
            return structVal;
          } else {
            const makeStr: SI_STRUCT.StructMake = {
              type: SI_STRUCT.Production.StructMake,
              redex: r,
              result: structVal,
            };
            return makeStr;
          }
        } else if (SI_STRUCT.isPredFun(funDef)) {
          const predVal = predStruct(r.name, funDef, args);
          if (predVal instanceof Error) {
            return predVal;
          } else {
            if (predVal) {
              const predStr: SI_STRUCT.StructPredTrue = {
                type: SI_STRUCT.Production.StructPredTrue,
                redex: r,
                result: predVal,
              };
              return predStr;
            } else {
              const predStr: SI_STRUCT.StructPredFalse = {
                type: SI_STRUCT.Production.StructPredFalse,
                redex: r,
                result: predVal,
              };
              return predStr;
            }
          }
        } else {
          return Error("step: select is not implemented yet");
        }
      } else {
        return Error("step: name is neither primitive nor a defined function");
      }
    } else {
      console.log("step: env:" + JSON.stringify(env));
      const substRed: BSL_AST.expr | SI_STRUCT.Value | Error = substConst(
        r,
        env
      );
      if (substRed instanceof Error) {
        return substRed;
      } else {
        return {
          type: SI_STRUCT.Production.Const,
          redex: r,
          result: substRed,
        };
      }
    }
  } else if (SI_STRUCT.isCondRedex(r)) {
    //check if condition is a name
    if (BSL_AST.isLiteral(r.options[0].condition)) {
      const condResult = cond(r);
      if (condResult == undefined) {
        const newOptions = r.options.slice(1);
        if (newOptions.length < 1) {
          return {
            type: SI_STRUCT.Production.CondError,
            redex: r,
            result: Error("cond: all question results were false"),
          };
        }
        const newExpr: BSL_AST.Cond = {
          type: BSL_AST.Production.CondExpression,
          options: newOptions,
        };
        return {
          type: SI_STRUCT.Production.CondFalse,
          redex: r,
          result: newExpr,
        };
      } else if (BSL_AST.isExpr(condResult) || SI_STRUCT.isValue(condResult)) {
        return {
          type: SI_STRUCT.Production.CondTrue,
          redex: r,
          result: condResult,
        };
      } else {
        return Error("step: cond is not applicable");
      }
    } else {
      const substRed: BSL_AST.expr | SI_STRUCT.Value | Error = substConst(
        r,
        env
      );
      if (substRed instanceof Error) {
        return substRed;
      } else {
        return {
          type: SI_STRUCT.Production.Const,
          redex: r,
          result: substRed,
        };
      }
    }
  } else if (SI_STRUCT.isNameRedex(r)) {
    const substRed: BSL_AST.expr | SI_STRUCT.Value | Error = substConst(r, env);
    if (substRed instanceof Error) {
      return substRed;
    } else {
      return {
        type: SI_STRUCT.Production.Const,
        redex: r,
        result: substRed,
      };
    }
  } else {
    return Error("step: redex is neither a call nor cond nor name");
  }
}

// plug
// plug(oneRule, c: Context): ExprStep | Error
export function plug(
  oneRule: SI_STRUCT.OneRule,
  c: SI_STRUCT.Context,
  env: SI_STRUCT.Environment
): SI_STRUCT.EvalStep | Error {
  //check if context is a Hole
  console.log("plug: oneRule: " + JSON.stringify(oneRule));
  if (SI_STRUCT.isHole(c)) {
    return {
      type: SI_STRUCT.Production.EvalStep,
      env: env,
      rule: oneRule,
      result: oneRule.result,
    };
  } else {
    //Apply OneRule with KONG RULE
    const exprStep = plug(oneRule, c.ctx, env);
    if (SI_STRUCT.isEvalStep(exprStep)) {
      // Result is RuleError
      if (exprStep.result instanceof Error) {
        return exprStep;
      } else {
        //AppContext
        if (SI_STRUCT.isAppContext(c)) {
          const args = [c.values, exprStep.result, c.args].flat();
          const newArgs = args.map((arg) => {
            if (SI_STRUCT.isValue(arg)) {
              const newArg: BSL_AST.Literal = {
                type: BSL_AST.Production.Literal,
                value: arg,
              };
              return newArg;
            } else if (SI_STRUCT.isId(arg)) {
              const newArg: BSL_AST.Name = {
                type: BSL_AST.Production.Symbol,
                symbol: arg.symbol,
              };
              return newArg;
            } else {
              return arg;
            }
          });
          const finalExpr: BSL_AST.Call = {
            type: BSL_AST.Production.FunctionCall,
            name: c.op,
            args: newArgs,
          };
          console.log("plug: env: " + JSON.stringify(env));
          return {
            type: SI_STRUCT.Production.EvalStep,
            env: env,
            rule: {
              type: SI_STRUCT.Production.Kong,
              context: c,
              redexRule: oneRule,
            },
            result: finalExpr,
          };
          //CondContext
        } else if (SI_STRUCT.isCondContext(c)) {
          const options = c.options;
          const expr: BSL_AST.expr = SI_STRUCT.isValue(exprStep.result)
            ? { type: BSL_AST.Production.Literal, value: exprStep.result }
            : exprStep.result;
          const firstClause: BSL_AST.Clause = {
            type: BSL_AST.Production.CondOption,
            condition: expr,
            result: options[0].result,
          };
          const newOptions = [firstClause, ...options.slice(1)];
          const finalExpr: BSL_AST.Cond = {
            type: BSL_AST.Production.CondExpression,
            options: newOptions,
          };
          return {
            type: SI_STRUCT.Production.EvalStep,
            env: env,
            rule: {
              type: SI_STRUCT.Production.Kong,
              context: c,
              redexRule: oneRule,
            },
            result: finalExpr,
          };
        } else {
          return Error("plug: context is not an AppContext or CondContext");
        }
      }
    } else {
      return exprStep;
    }
  }
}

// ####### ONE RULE FUNCTIONS #######
//TODO: refactor prim with map instead of for loop
export function prim(
  name: BSL_AST.Name,
  args: SI_STRUCT.Value[]
): SI_STRUCT.Value | Error {
  // + - *
  if (name.symbol === "+") {
    let n = 0;
    args.forEach((el) => {
      if (typeof el == "number") {
        n += el;
      } else {
        return Error("error: argument is not a number: " + el);
      }
    });
    return n;
  } else if (name.symbol === "*") {
    let n = 1;
    args.forEach((el) => {
      if (typeof el == "number") {
        n *= el;
      } else {
        return Error("error: argument is not a number: " + el);
      }
    });
    return n;
  } else if (name.symbol === "-") {
    let n = args[0];
    for (let i = 1; i < args.length; i++) {
      let el = args[i];
      if (typeof el == "number" && typeof n == "number") {
        n -= el;
      } else {
        return Error("error: argument is not a number: " + args[i]);
      }
    }
    return n;
  } else if (name.symbol === "/") {
    let n = args[0];
    for (let i = 1; i < args.length; i++) {
      let el = args[i];
      if (typeof n == "number" && typeof el == "number" && el != 0) {
        n /= el;
      } else if (el == 0) {
        return Error("error: division by zero");
      } else {
        return Error("error: argument is not a number: " + el);
      }
    }
    return n;
  }
  // and, or, not
  else if (name.symbol === "and") {
    if (args.every((el) => typeof el == "boolean")) {
      if (args.length >= 2) {
        if (args.every((el) => el)) {
          return true;
        } else {
          return false;
        }
      } else {
        return Error(`prim: ${name.symbol} needs at least two arguments`);
      }
    } else {
      return Error("prim: 'and' needs boolean arguments");
    }
  } else if (name.symbol === "or") {
    if (args.every((el) => typeof el == "boolean")) {
      if (args.length >= 2) {
        if (args.some((el) => el)) {
          return true;
        } else {
          return false;
        }
      } else {
        return Error("prim: 'or' needs at least two arguments");
      }
    } else {
      return Error("prim: 'or' needs boolean arguments");
    }
  } else if (name.symbol === "not") {
    if (typeof args[0] == "boolean") {
      if (args.length == 1) {
        return !args[0];
      } else {
        return Error("prim: 'not' needs exactly one argument");
      }
    } else {
      return Error("prim: 'not' needs boolean argument");
    }
  }
  // less than and greater than, to test HTML escaping
  else if (["<", ">", "<=", ">="].includes(name.symbol)) {
    if (args.length !== 2) {
      return Error(`prim: ${name.symbol} needs exactly two arguments`);
    }
    const left = args[0];
    const right = args[1];
    if (typeof left !== "number" || typeof right !== "number") {
      return Error(
        `prim: ${name.symbol} needs two numbers, but received ${left} and ${right}`
      );
    }
    switch (name.symbol) {
      case "<":
        return left < right;
      case "<=":
        return left <= right;
      case ">=":
        return left >= right;
      case ">":
        return left > right;
      default:
        return true; // never reached but needed for compiler
    }
  }
  // else throw error
  else {
    return Error("prim: this function is not implemented");
  }
}

// cond
// cond Redex =>  BSL_AST.expr | false
function cond(
  r: SI_STRUCT.CondRedex
): BSL_AST.expr | SI_STRUCT.Value | undefined | Error {
  const clause = r.options[0];
  if (BSL_AST.isLiteral(clause.condition) && clause.condition.value == true) {
    const result = BSL_AST.isLiteral(clause.result)
      ? clause.result.value
      : clause.result;
    return result;
  } else if (
    BSL_AST.isLiteral(clause.condition) &&
    clause.condition.value == false
  ) {
    return undefined;
  } else {
    return Error("error: condition is not a boolean");
  }
}

function substConst(
  r: SI_STRUCT.Redex,
  env: SI_STRUCT.Environment
): BSL_AST.expr | SI_STRUCT.Value | Error {
  if (SI_STRUCT.isCallRedex(r)) {
    // get the identifier argument
    const idLst: SI_STRUCT.Id[] = r.args.filter((el) =>
      SI_STRUCT.isId(el)
    ) as SI_STRUCT.Id[];
    const id: SI_STRUCT.Id = idLst[0];
    const value = lookupConst(env, id.symbol);
    if (value instanceof Error) {
      return value;
    } else {
      const newArgs: BSL_AST.expr[] = r.args.map((el) => {
        if (SI_STRUCT.isId(el) && el.symbol === id.symbol) {
          let newLit: BSL_AST.Literal = {
            type: BSL_AST.Production.Literal,
            value: value,
          };
          return newLit;
        } else if (SI_STRUCT.isId(el)) {
          let newName: BSL_AST.Name = {
            type: BSL_AST.Production.Symbol,
            symbol: el.symbol,
          };
          return newName;
        } else {
          let newLit: BSL_AST.Literal = {
            type: BSL_AST.Production.Literal,
            value: el,
          };
          return newLit;
        }
      });
      return {
        type: BSL_AST.Production.FunctionCall,
        name: r.name,
        args: newArgs,
      };
    }
  } else if (SI_STRUCT.isCondRedex(r)) {
    const name = r.options[0].condition;
    if (BSL_AST.isName(name)) {
      const value = lookupConst(env, name.symbol);
      if (value instanceof Error) {
        return value;
      } else {
        let newLit: BSL_AST.Literal = {
          type: BSL_AST.Production.Literal,
          value: value,
        };
        let newOpt: BSL_AST.Clause = {
          type: BSL_AST.Production.CondOption,
          condition: newLit,
          result: r.options[0].result,
        };
        let newCond: BSL_AST.Cond = {
          type: BSL_AST.Production.CondExpression,
          options: [newOpt],
        };
        return newCond;
      }
    } else {
      return Error("substConst: condition is not a name");
    }
  } else if (SI_STRUCT.isNameRedex(r)) {
    const value = lookupConst(env, r.symbol);
    if (value instanceof Error) {
      return value;
    } else {
      return value;
    }
  } else {
    return Error("substConst: redex is not a call or cond or name");
  }
}

//fun
function substFun(
  r: SI_STRUCT.CallRedex,
  env: SI_STRUCT.Environment
): BSL_AST.expr | Error {
  const funDef = lookupFun(env, r.name.symbol);
  if (funDef instanceof Error) {
    return funDef;
  } else {
    const params = funDef.params;
    const body = funDef.body;
    // 1. check if the number of arguments is equal to parameters (done)
    // 2. check if the arguments are all literals and/or replace global constants (already done in step)
    // 3. create a new environment with the parameters and the arguments (done)
    if (r.args.length == params.length) {
      let newEnv: SI_STRUCT.Environment = {};
      params.map((param, i) => {
        let tempEnv = addToEnv(
          newEnv,
          param.symbol,
          r.args[i] as SI_STRUCT.Value
        );
        if (tempEnv instanceof Error) {
          return tempEnv;
        } else {
          newEnv = tempEnv;
        }
      });
      // 4. subst the body with the new environment
      const newExpr = substExpr(body, newEnv);
      return newExpr;
    } else {
      return Error("substFun: number of arguments doesn't match");
    }
  }
}

//structRules
function makeStruct(
  name: BSL_AST.Name,
  funDef: SI_STRUCT.MakeFun,
  args: SI_STRUCT.Value[]
): BSL_AST.StructValue | Error {
  const params = funDef.structDef.properties;
  if (params.length == args.length) {
    const structVal: BSL_AST.StructValue = {
      type: BSL_AST.Production.StructValue,
      structDef: name,
      properties: args.map((arg) => {
        const lit: BSL_AST.Literal = {
          type: BSL_AST.Production.Literal,
          value: arg,
        };
        return lit;
      }),
    };
    return structVal;
  } else {
    return Error("makeStruct: number of arguments doesn't match");
  }
}

function predStruct(
  name: BSL_AST.Name,
  funDef: SI_STRUCT.PredFun,
  args: SI_STRUCT.Value[]
): boolean | Error {
  const params = funDef.structDef.properties;
  if (args.length != 1) {
    return Error("predStruct: number of arguments doesn't match");
  } else {
    if (!BSL_AST.isStructValue(args[0])) {
      return Error("predStruct: argument is not a struct value");
    } else {
      const structVal = args[0];
      const structName = structVal.structDef.symbol.slice(5);
      const predName = name.symbol.slice(0, name.symbol.length - 1);
      if (structName == predName) {
        if (params.length == structVal.properties.length) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }
}
//substExpr
//substitute all names in an expression with the values of a given environment
function substExpr(
  expr: BSL_AST.expr,
  env: SI_STRUCT.Environment
): BSL_AST.expr | Error {
  if (BSL_AST.isLiteral(expr)) {
    return expr;
  } else if (BSL_AST.isName(expr)) {
    const value = lookupConst(env, expr.symbol);
    if (value instanceof Error) {
      substFun;
      return value;
    } else {
      let newLit: BSL_AST.Literal = {
        type: BSL_AST.Production.Literal,
        value: value,
      };
      return newLit;
    }
  } else if (BSL_AST.isCall(expr)) {
    let args = expr.args.map((arg) => {
      let newExpr = substExpr(arg, env);
      if (newExpr instanceof Error) {
        return arg;
      } else {
        return newExpr;
      }
    });
    //need case for names, who are in the other dictionary as well
    /*if (args.some((arg) => arg instanceof Error)) {
      return Error("substExpr: error in args");
    } else {*/
    let newCall: BSL_AST.Call = {
      type: BSL_AST.Production.FunctionCall,
      name: expr.name,
      args: args as BSL_AST.expr[],
    };
    return newCall;
    /*}*/
  } else {
    let options = expr.options.map((clause) => {
      let newCondition = substExpr(clause.condition, env);
      let newResult = substExpr(clause.result, env);
      if (newCondition instanceof Error || newResult instanceof Error) {
        return Error("substExpr: error in cond");
      } else {
        let newClause: BSL_AST.Clause = {
          type: BSL_AST.Production.CondOption,
          condition: newCondition,
          result: newResult,
        };
        return newClause;
      }
    });
    if (options.some((clause) => clause instanceof Error)) {
      return Error("substExpr: error in cond");
    } else {
      let newCond: BSL_AST.Cond = {
        type: BSL_AST.Production.CondExpression,
        options: options as BSL_AST.Clause[],
      };
      return newCond;
    }
  }
}

// ####### Environment Functions #######

//adds a Value to an Environment
function addToEnv(
  env: SI_STRUCT.Environment,
  name: string,
  value: SI_STRUCT.EnvValue
): SI_STRUCT.Environment | Error {
  if (env[name] === undefined) {
    const newEnv = { ...env };
    newEnv[name] = value;
    console.warn(
      "addToEnv: " + name + ":" + value + " added to " + JSON.stringify(env)
    );
    console.warn("addToEnv: newEnv = " + JSON.stringify(newEnv));
    return newEnv;
  } else {
    return Error("addToEnv: name already exists in environment");
  }
}

function lookupEnv(
  env: SI_STRUCT.Environment,
  name: string
): SI_STRUCT.EnvValue | Error {
  if (name in env) {
    console.warn("lookupEnv: " + name + " found in " + JSON.stringify(env));
    return env[name];
  } else {
    return Error("lookupEnv: name is not bound in environment");
  }
}

//LookUp helper functions

function lookupConst(
  env: SI_STRUCT.Environment,
  name: string
): SI_STRUCT.Value | Error {
  const value = lookupEnv(env, name);
  if (value instanceof Error) {
    return value;
  } else if (SI_STRUCT.isValue(value)) {
    return value;
  } else {
    return Error("lookupConst: name is not bound to a Value");
  }
}

function lookupFun(
  env: SI_STRUCT.Environment,
  name: string
): SI_STRUCT.FunDef | Error {
  const value = lookupEnv(env, name);
  if (value instanceof Error) {
    return value;
  } else if (SI_STRUCT.isFunDef(value)) {
    return value;
  } else {
    return Error("lookupFun: name is not bound to a Fun");
  }
}

function lookupStruct(
  env: SI_STRUCT.Environment,
  name: string
): SI_STRUCT.StructDef | Error {
  const value = lookupEnv(env, name);
  if (value instanceof Error) {
    return value;
  } else if (SI_STRUCT.isStructDef(value)) {
    return value;
  } else {
    return Error("lookupStruct: name is not bound to a Struct");
  }
}
