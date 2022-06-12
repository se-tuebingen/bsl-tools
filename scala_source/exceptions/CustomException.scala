package exceptions

object CustomException {
  
  case class InvalidParseException(msg: String, pos: Int) extends Exception(msg) {}
  case class InvalidTokenizeException(msg: String, pos: Int) extends Exception(msg) {}
}
