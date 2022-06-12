package expressions

object Exp {

  /** BSL Syntax
   *
   *  Exp, Context, Redex
   */
  
  case class Program(tls: List[TopLevel])
  
  sealed trait TopLevel
  case class TopLevelExp(e: Exp) extends TopLevel
  sealed trait Define extends TopLevel
  case class DefineConst(c: String, cDef: Exp) extends Define

  sealed trait RedexOrExp
  sealed trait Exp extends RedexOrExp
  sealed trait ValueComps extends Exp

  case class Lit(v: Int) extends ValueComps
  case class True() extends ValueComps
  case class False() extends ValueComps
  case class Add(l: Exp, r: Exp) extends Exp
  case class Mul(l: Exp, r: Exp) extends Exp
  case class Id(i: String) extends Exp
  case class Cond(l: List[(Exp, Exp)]) extends Exp

  type Env = Map[String, Exp]

  sealed trait Context
  case class Hole() extends Context
  case class AddL(c: Context, r: Exp) extends Context
  case class AddR(l: Exp, r: Context) extends Context
  case class MulL(c: Context, r: Exp) extends Context
  case class MulR(l: Exp, r: Context) extends Context
  case class CondContext(test: Context, thenDo: Exp, tail: List[(Exp, Exp)]) extends Context
  
  sealed trait Redex extends RedexOrExp
  case class AddRedex(l: Exp, r: Exp) extends Redex
  case class MulRedex(l: Exp, r: Exp) extends Redex
  case class ConstRedex(i: String, env: Env) extends Redex
  case class CondRedex(test: Exp, thenDo: Exp, rest: List[(Exp, Exp)]) extends Redex

  sealed trait SplitResult
  case class Value(v: ValueComps) extends SplitResult
  case class Split(redex: Redex, context: Context) extends SplitResult

}
