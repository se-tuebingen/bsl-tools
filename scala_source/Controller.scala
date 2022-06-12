import expressions.Exp._
import interpreters.Stepper
import parser.Parser
import scala.util.{Try, Success, Failure}



/** not needed right now but maybe for future use as
 * connection/interface between JS-part and the rest*/
object Controller {

  def parseProgram(in: String): Try[Program] = Try(Parser.parseProgram(in))

}
