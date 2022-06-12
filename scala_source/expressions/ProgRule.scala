package expressions

import expressions.Exp.{Context, Env, Exp, Lit, Redex}

object ProgRule {

  /** BSL-Rules
   *
   *  + ProgParseError, ConstError for rendering
   */
  sealed trait TopLevelRule
  case class DefineRule(original: Exp, c: String, steps: List[ProgStepRule]) extends TopLevelRule
  case class ExpRule(original: Exp, steps: List[ProgStepRule]) extends TopLevelRule
  case class ProgParseError(corrString: String, pos: Int, msg: String) extends TopLevelRule

  sealed trait ProgStepRule
  case class Kong(context: Context, redexRule: OneRule) extends ProgStepRule

  sealed trait OneRule extends ProgStepRule
  case class Prim(f: Redex, e: Exp, env: Env) extends OneRule
  case class Const(id: String, e: Exp, env: Env) extends OneRule
  case class LitRule(l: Lit, env: Env) extends OneRule
  case class BoolRule(b: Exp, env: Env) extends OneRule
  case class stepError(redex: Redex, s: String, env: Env, errtype: String) extends OneRule
  case class CondRule(c: Redex, e: Exp, env: Env) extends OneRule
  case class CondError(redex: Redex, s: String, env: Env) extends OneRule

}
