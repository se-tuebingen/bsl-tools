package parser

import expressions.Exp.*
import Tokenizer.*
import Tokens.*
import exceptions.CustomException._

import scala.collection.mutable.ListBuffer

class Parser(tokens: List[Token]) {
  private var position = 0

  /** Parse all Tokens*/
  def parseProgram(): Program = {
    val topLevelBuff: ListBuffer[TopLevel] = ListBuffer.empty[TopLevel]
    while (position < tokens.length) {
      topLevelBuff += parseTopLevel()
    }
    Program(topLevelBuff.toList)
  }

  /** Returns Syntax-Tree of Exp
   *
   *  Either Define, TopLevelExp or Parse-Error for rendering
   */
  def parseTopLevel(): TopLevel = {
    peek() match {
      case TNum(n) => TopLevelExp(parseLit(n))
      case TConst(i) => TopLevelExp(parseId(i))
      case TTrue() => TopLevelExp(parseTrue())
      case TFalse() => TopLevelExp(parseFalse())
      case TLParen() =>
        next()
        peek() match {
          case TAdd()    => TopLevelExp(parseAdd())
          case TMul()    => TopLevelExp(parseMul())
          case TDefine() => parseDefine()
          case TCond() => TopLevelExp(parseCond())
          case _         => throw InvalidParseException("Erwartet wurde eine Expression oder ein Define", 0)
        }
      case _ => throw InvalidParseException("Erwartet wurde eine Konstante, eine Zahl oder eine öffnende Klammer", 0)
    }
  }

  /** Returns Syntax-Tree of Exp */
  def parseExp(): Exp = {
    peek() match {
      case TNum(n) => parseLit(n)
      case TConst(i) => parseId(i)
      case TTrue() => parseTrue()
      case TFalse() => parseFalse()
      case TLParen() =>
        next()
        peek() match {
          case TAdd()    => parseAdd()
          case TMul()    => parseMul()
          case TCond() => parseCond()
          case _         => throw InvalidParseException("Erwartet wurde eine Funktion", 0)
        }
      case _ => throw InvalidParseException("Erwartet wurde eine Konstante, eine Zahl oder eine öffnende Klammer", 0)
    }
  }

  def parseCond(): Exp = {
    val conditionList: ListBuffer[(Exp, Exp)] = ListBuffer.empty[(Exp, Exp)]
    next()
    /** Empty Cond's are possible because the Error should occur at Runtime */
    while (peek() != TRParen()) {
      consume(TLParen())
      val left = parseExp()
      val right = parseExp()
      consume(TRParen())
      conditionList += ((left, right))
    }
    consume(TRParen())
    Cond(conditionList.toList)
  }

  def parseMul(): Exp = {
    next()
    val left = parseExp()
    val right = parseExp()
    consume(TRParen())
    Mul(left, right)
  }

  def parseAdd(): Exp = {
    next()

    val left = parseExp()
    val right = parseExp()
    consume(TRParen())
    Add(left, right)
  }

  def parseDefine(): Define = {
    next()
    peek() match {
      case TConst(i) =>
        next()
        val iDef = parseExp()
        consume(TRParen())
        DefineConst(i, iDef)
      case _ => throw InvalidParseException(" Identifier expected", 0)
    }
  }

  def parseLit(l: Int): Exp = {
    next()
    Lit(l)
  }

  def parseId(i: String): Exp = {
    next()
    Id(i)
  }

  def parseTrue(): Exp = {
    next()
    True()
  }

  def parseFalse(): Exp = {
    next()
    False()
  }

  def next(): Unit = {
    position += 1
  }

  def peek(): Token = {
    tokens(position)
  }

  def consume(t: Token): Unit = {
    if (t != tokens(position)) {
      throw InvalidParseException("Erwartet wurde " + tokenDescription(t) + ", aber es ist " + tokenDescription(
        tokens(position)
      ), 0)
    }
    next()
  }

  def tokenDescription(t: Token): String = {
    t match {
      case TLParen() => "eine öffnende Klammer"
      case TRParen() => "eine schließende Klammer"
      case TSpace()  => "ein Leerzeichen"
      case TNum(n)   => "Eine Zahl"
      case TAdd()    => "eine Addition"
      case TDefine() => "ein Define"
      case TMul()    => "eine Multiplikation"
      case TConst(c)    => "eine Konstante " + c
      case TTrue()    => "der boolsche Wert True"
      case TFalse()    => "der boolsche Wert False"
      case TCond()    => " eine Kondition"
    }
  }
}

object Parser {
  def parseProgram(s: String): Program =
    new Parser(tokenize(s)).parseProgram()
}
