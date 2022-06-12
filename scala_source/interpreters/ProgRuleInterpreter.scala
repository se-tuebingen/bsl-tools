package interpreters

import Stepper.*
import expressions.ProgRule.*
import expressions.Exp.*
import scala.annotation.tailrec
import scala.collection.mutable.ListBuffer
import scala.util.{Failure, Success, Try}

object ProgRuleInterpreter {

  /** Transforms TopLevels into list of BSL-Rules */
  def evaluateProgRule(program: Program): List[TopLevelRule] = {
    val listTopLevels = program.tls
    val progRulesBuff: ListBuffer[TopLevelRule] = ListBuffer.empty[TopLevelRule]
    var env: Env = Map.empty

    listTopLevels foreach {
      case DefineConst(c, cDef) =>
        var expSteps = evaluateExp(cDef, env)

        /** Change Env of last step in Define for better UX */
        expSteps.last match {
          case LitRule(Lit(l), envTemp) =>
            expSteps = expSteps.dropRight(1)
            env += (c -> Lit(l))
            progRulesBuff += DefineRule(cDef, c, expSteps :+ LitRule(Lit(l), env))
          case _ => sys error "Keine Auflösung von Exp zu " + c + " am Ende von Define"
        }
      case TopLevelExp(e) =>
        val expSteps = evaluateExp(e, env)
        progRulesBuff += ExpRule(e, expSteps)
    }
    progRulesBuff.toList
  }

  /** Transforms Exp-Syntax-Tree into list of BSL-Rules */
  def evaluateExp(
                   exp: Exp,
                   env: Env
                 ): List[ProgStepRule] = {

    searchRedex(env, exp) match {
      case Value(Lit(l)) =>
        List(LitRule(Lit(l), env))
      case Value(True()) => List(BoolRule(True(), env))
      case Value(False()) => List(BoolRule(False(), env))
      case Split(redex: Redex, context: Context) =>
        step(redex) match {
          case Success(redexStepped) =>
            val expStep = context match {
              case Hole() =>
                redex match {
                  case ConstRedex(i, env) => Const(i, redexStepped, env)
                  case AddRedex(l, r) => Prim(redex, redexStepped, env)
                  case MulRedex(l, r) => Prim(redex, redexStepped, env)
                  case CondRedex(test, thenDo, rest) => CondRule(redex, redexStepped, env)
                }
              case _ =>
                redex match {
                  case ConstRedex(i, env) => Kong(context, Const(i, redexStepped, env))
                  case AddRedex(l, r) => Kong(context, Prim(redex, redexStepped, env))
                  case MulRedex(l, r) => Kong(context, Prim(redex, redexStepped, env))
                  case CondRedex(test, thenDo, rest) => Kong(context, CondRule(redex, redexStepped, env))
                }
            }
            val plugged = plug(context, redexStepped)
            expStep :: evaluateExp(plugged, env)
          case Failure(er) =>
            context match {
              case Hole() =>
                redex match {
                  case ConstRedex(i, env) => List(stepError(redex, er.getMessage, env, "Const"))
                  case CondRedex(test, thenDo, rest) => List(CondError(redex, er.getMessage, env))
                  case AddRedex(l, r) => List(stepError(redex, er.getMessage, env, "Prim"))
                  case MulRedex(l, r) => List(stepError(redex, er.getMessage, env, "Prim"))
                }
              case _ =>
                redex match {
                  case ConstRedex(i, env) => List(Kong(context, stepError(redex, er.getMessage, env, "Const")))
                  case AddRedex(l, e) => List(Kong(context, stepError(redex, er.getMessage, env, "Prim")))
                  case MulRedex(l, r) => List(Kong(context, stepError(redex, er.getMessage, env, "Prim")))
                  case CondRedex(test, thenDo, rest) => List(Kong(context, CondError(redex, er.getMessage, env)))
                }
            }
        }
    }
  }
}
