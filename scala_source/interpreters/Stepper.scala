package interpreters

import expressions.Exp._
import scala.util.{Failure, Success, Try}

object Stepper {
  
  /** Returns Redex as Split or Value */
  def searchRedex(env: Env, e: Exp): SplitResult = e match {
        case Add(l, r) =>
          (searchRedex(env, l), searchRedex(env, r)) match
            case (Value(x), Value(y)) => Split(AddRedex(x, y), Hole())
            case (Value(x), Split(y, z)) => Split(y, AddR(x, z))
            case (Split(x, y), Value(z)) => Split(x, AddL(y, z))
            case (Split(x, y), Split(p, q)) => Split(x, AddL(y, r))
        case Mul(l, r) =>
          (searchRedex(env, l), searchRedex(env, r)) match
            case (Value(x), Value(y)) => Split(MulRedex(x, y), Hole())
            case (Value(x), Split(y, z)) => Split(y, MulR(x, z))
            case (Split(x, y), Value(z)) => Split(x, MulL(y, z))
            case (Split(x, y), Split(p, q)) => Split(x, MulL(y, r))
        case Cond(l) =>
          searchRedex(env, l.head._1) match
            case Value(x) => Split(CondRedex(x, l.head._2, l.tail), Hole())
            case Split(x, y) => Split(x, CondContext(y, l.head._2, l.tail))
        case Lit(l) => Value(Lit(l))
        case Id(i) => Split(ConstRedex(i, env), Hole())
        case True() => Value(True())
        case False() => Value(False())
      }
  
  /** Perform one Step
   *
   *  Returns Exp and all Errors that should be rendered
   */
  def step(r: Redex): Try[Exp] =
    Try({
    r match {
    case AddRedex(Lit(l), Lit(r)) => Lit(l + r)
    case MulRedex(Lit(l), Lit(r)) => Lit(l * r)
    case AddRedex(_, _) => sys error "Die Addition erfordert Zahlen"
    case MulRedex(_, _) => sys error "Die Multiplikation erfordert Zahlen"
    case ConstRedex(i, env) =>
      if (env.contains(i)) {
        env(i)
      } else {
        sys error "Der Identifier " + i + " ist nicht gebunden"
      }
    case CondRedex(test, thenDo, rest) =>
      test match {
        case True() => thenDo
        case False() =>
          if (rest.isEmpty) {
            sys error "Alle Conditions evaluierten zu False"
          } else {
            Cond(rest)
          }
        case _ => sys error "Bedingung erfordert den Typ Boolean"
      }
    }
    })
  
  /** Rebuild Exp with Context and Exp */
  def plug(c: Context, e: Exp): Exp = c match {
    case Hole()       => e
    case AddL(cl, er) => Add(plug(cl, e), er)
    case AddR(el, cr) => Add(el, plug(cr, e))
    case MulL(cl, er) => Mul(plug(cl, e), er)
    case MulR(el, cr) => Mul(el, plug(cr, e))
    case CondContext(test, thenDo, tail) =>
      val oldHead = List((plug(test, e), thenDo))
      Cond(List.concat(oldHead, tail))
  }
  
  /** Rebuild Exp with Context and Redex */
  def plugWithRedex(c: Context, e: Redex): Exp =
    val exp = e match {
    case AddRedex(l, r) => Add(l, r)
    case MulRedex(l, r) => Mul(l, r)
    case ConstRedex(i, env) => Id(i)
    case CondRedex(test, thenDo, rest) =>
      val oldHead = List((test, thenDo))
      Cond(List.concat(oldHead, rest))
  }
    c match {
    case Hole()       => exp
    case AddL(cl, er) => Add(plugWithRedex(cl, e), er)
    case AddR(el, cr) => Add(el, plugWithRedex(cr, e))
    case MulL(cl, er) => Mul(plugWithRedex(cl, e), er)
    case MulR(el, cr) => Mul(el, plugWithRedex(cr, e))
    case CondContext(test, thenDo, tail) =>
      val oldHead = List((plugWithRedex(test, e), thenDo))
      Cond(List.concat(oldHead, tail))
  }
}
