package parser
import exceptions.CustomException._
import Tokens._

import scala.collection.mutable.ListBuffer
import scala.util.{Try, Success, Failure}

object Tokenizer {

  /** Tokenize Input
   *
   *  Space not considered
   */
  def tokenize(s: String): List[Token] = {
    var position = 0
    val tokens: ListBuffer[Token] = ListBuffer.empty[Token]

    while (position < s.length) {
      s(position) match {
        case '(' => tokens += TLParen()
        case ')' => tokens += TRParen()
        case ' ' => ()
        case '+' => tokens += TAdd()
        case '*' => tokens += TMul()
        case 't' => tokens += TTrue()
        case 'f' => tokens += TFalse()

        case _ if s(position).isDigit =>
          var number = ""
          while ((position < s.length) && s(position).isDigit) {
            number = number + s(position)
            position += 1
          }
          position -= 1
          tokens += TNum(number.toInt)

        case _ if s(position).isLetter =>
          var letter = ""
          while ((position < s.length) && s(position).isLetter) {
            letter = letter + s(position)
            position += 1
          }
          if (letter == "define") {
            position -= 1
            tokens += TDefine()
          } else if (letter == "cond") {
              position -= 1
              tokens += TCond()
          } else {
              position -= 1
              tokens += TConst(letter)
          }
        case '\n' =>
        case _ => throw InvalidTokenizeException("Unbekanntes Zeichen", position)
      }
      position += 1
    }
    tokens.toList
  }
}
