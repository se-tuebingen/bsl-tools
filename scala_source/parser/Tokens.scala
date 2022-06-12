package parser

object Tokens {
  
  sealed trait Token
  case class TLParen() extends Token
  case class TRParen() extends Token
  case class TSpace() extends Token
  case class TNum(num: Int) extends Token
  case class TAdd() extends Token
  case class TMul() extends Token
  case class TConst(i: String) extends Token
  case class TDefine() extends Token
  case class TTrue() extends Token
  case class TFalse() extends Token
  case class TCond() extends Token
}
