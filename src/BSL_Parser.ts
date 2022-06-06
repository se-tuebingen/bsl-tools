
// Generated by peggy v. 1.2.0 (ts-pegjs plugin v. 1.2.2 )
//
// https://peggyjs.org/   https://github.com/metadevpro/ts-pegjs

export interface IFilePosition {
  offset: number;
  line: number;
  column: number;
}

export interface IFileRange {
  start: IFilePosition;
  end: IFilePosition;
  source: string;
}

export interface ILiteralExpectation {
  type: "literal";
  text: string;
  ignoreCase: boolean;
}

export interface IClassParts extends Array<string | IClassParts> {}

export interface IClassExpectation {
  type: "class";
  parts: IClassParts;
  inverted: boolean;
  ignoreCase: boolean;
}

export interface IAnyExpectation {
  type: "any";
}

export interface IEndExpectation {
  type: "end";
}

export interface IOtherExpectation {
  type: "other";
  description: string;
}

export type Expectation = ILiteralExpectation | IClassExpectation | IAnyExpectation | IEndExpectation | IOtherExpectation;

function peg$padEnd(str: string, targetLength: number, padString: string) {
  padString = padString || ' ';
  if (str.length > targetLength) {
    return str;
  }
  targetLength -= str.length;
  padString += padString.repeat(targetLength);
  return str + padString.slice(0, targetLength);
}

export class SyntaxError extends Error {
  public static buildMessage(expected: Expectation[], found: string | null) {
    function hex(ch: string): string {
      return ch.charCodeAt(0).toString(16).toUpperCase();
    }

    function literalEscape(s: string): string {
      return s
        .replace(/\\/g, "\\\\")
        .replace(/"/g,  "\\\"")
        .replace(/\0/g, "\\0")
        .replace(/\t/g, "\\t")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/[\x00-\x0F]/g,            (ch) => "\\x0" + hex(ch) )
        .replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x"  + hex(ch) );
    }

    function classEscape(s: string): string {
      return s
        .replace(/\\/g, "\\\\")
        .replace(/\]/g, "\\]")
        .replace(/\^/g, "\\^")
        .replace(/-/g,  "\\-")
        .replace(/\0/g, "\\0")
        .replace(/\t/g, "\\t")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/[\x00-\x0F]/g,            (ch) => "\\x0" + hex(ch) )
        .replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x"  + hex(ch) );
    }

    function describeExpectation(expectation: Expectation) {
      switch (expectation.type) {
        case "literal":
          return "\"" + literalEscape(expectation.text) + "\"";
        case "class":
          const escapedParts = expectation.parts.map((part) => {
            return Array.isArray(part)
              ? classEscape(part[0] as string) + "-" + classEscape(part[1] as string)
              : classEscape(part);
          });

          return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
        case "any":
          return "any character";
        case "end":
          return "end of input";
        case "other":
          return expectation.description;
      }
    }

    function describeExpected(expected1: Expectation[]) {
      const descriptions = expected1.map(describeExpectation);
      let i: number;
      let j: number;

      descriptions.sort();

      if (descriptions.length > 0) {
        for (i = 1, j = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }

      switch (descriptions.length) {
        case 1:
          return descriptions[0];

        case 2:
          return descriptions[0] + " or " + descriptions[1];

        default:
          return descriptions.slice(0, -1).join(", ")
            + ", or "
            + descriptions[descriptions.length - 1];
      }
    }

    function describeFound(found1: string | null) {
      return found1 ? "\"" + literalEscape(found1) + "\"" : "end of input";
    }

    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  }

  public message: string;
  public expected: Expectation[];
  public found: string | null;
  public location: IFileRange;
  public name: string;

  constructor(message: string, expected: Expectation[], found: string | null, location: IFileRange) {
    super();
    this.message = message;
    this.expected = expected;
    this.found = found;
    this.location = location;
    this.name = "SyntaxError";

    if (typeof (Object as any).setPrototypeOf === "function") {
      (Object as any).setPrototypeOf(this, SyntaxError.prototype);
    } else {
      (this as any).__proto__ = SyntaxError.prototype;
    }
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, SyntaxError);
    }
  }

  format(sources: { source: string; text: string }[]): string {
    let str = 'Error: ' + this.message;
    if (this.location) {
      let src: string[] | null = null;
      let k;
      for (k = 0; k < sources.length; k++) {
        if (sources[k].source === this.location.source) {
          src = sources[k].text.split(/\r\n|\n|\r/g);
          break;
        }
      }
      let s = this.location.start;
      let loc = this.location.source + ':' + s.line + ':' + s.column;
      if (src) {
        let e = this.location.end;
        let filler = peg$padEnd('', s.line.toString().length, ' ');
        let line = src[s.line - 1];
        let last = s.line === e.line ? e.column : line.length + 1;
        str += '\n --> ' + loc + '\n' + filler + ' |\n' + s.line + ' | ' + line + '\n' + filler + ' | ' +
          peg$padEnd('', s.column - 1, ' ') +
          peg$padEnd('', last - s.column, '^');
      } else {
        str += '\n at ' + loc;
      }
    }
    return str;
  }
}

function peg$parse(input: string, options?: IParseOptions) {
  options = options !== undefined ? options : {};

  const peg$FAILED: Readonly<any> = {};
  const peg$source = options.grammarSource;

  const peg$startRuleFunctions: {[id: string]: any} = { Program: peg$parseProgram };
  let peg$startRuleFunction: () => any = peg$parseProgram;

  const peg$c0 = function(all: any): any { return all };
  const peg$c1 = /^[\t \n \r]/;
  const peg$c2 = peg$classExpectation(["\t", " ", "\n", " ", "\r"], false, false);
  const peg$c3 = function(def: any): any { return def };
  const peg$c4 = "(define-struct";
  const peg$c5 = peg$literalExpectation("(define-struct", false);
  const peg$c6 = "(";
  const peg$c7 = peg$literalExpectation("(", false);
  const peg$c8 = ")";
  const peg$c9 = peg$literalExpectation(")", false);
  const peg$c10 = function(binding: any, properties: any): any {
    return {
      "type": "Struct Definition",
    	"binding": binding,
      "properties": properties
      }
    };
  const peg$c11 = "(define";
  const peg$c12 = peg$literalExpectation("(define", false);
  const peg$c13 = function(name: any, args: any, body: any): any {
    return {
      "type": "Function Definition",
    	"name": name,
      "args": args,
      "body": body
      }
    };
  const peg$c14 = function(name: any, value: any): any {
    return {
      "type": "Constant Definition",
    	"name": name,
      "value": value
      }
    };
  const peg$c15 = function(expr: any): any { return expr };
  const peg$c16 = "(cond";
  const peg$c17 = peg$literalExpectation("(cond", false);
  const peg$c18 = function(options: any): any {
      return {
        "type": "Cond-Expression",
        "options": options
      }
    };
  const peg$c19 = "[";
  const peg$c20 = peg$literalExpectation("[", false);
  const peg$c21 = "]";
  const peg$c22 = peg$literalExpectation("]", false);
  const peg$c23 = function(condition: any, result: any): any {
      return {
        "type": "Cond-Option",
        "condition": condition,
        "result":result
      }
    };
  const peg$c24 = function(name: any, args: any): any {
    return {
      "type": "Function Call",
      "name": name,
      "args": args
      }
    };
  const peg$c25 = /^[A-Za-z+-\/*=]/;
  const peg$c26 = peg$classExpectation([["A", "Z"], ["a", "z"], ["+", "/"], "*", "="], false, false);
  const peg$c27 = function(symbol: any): any {
    return {
      "type": "Symbol",
    	"symbol":symbol.join("")
      }
    };
  const peg$c28 = function(val: any): any {
    return {
      "type": "Literal Value",
      "value": val
      }
    };
  const peg$c29 = /^[0-9]/;
  const peg$c30 = peg$classExpectation([["0", "9"]], false, false);
  const peg$c31 = function(): any {return parseInt(text(), 10)};
  const peg$c32 = "#t";
  const peg$c33 = peg$literalExpectation("#t", false);
  const peg$c34 = "#f";
  const peg$c35 = peg$literalExpectation("#f", false);
  const peg$c36 = function(bool: any): any { return bool === "#true" };
  const peg$c37 = "'()";
  const peg$c38 = peg$literalExpectation("'()", false);
  const peg$c39 = function(): any { return "'()" };
  const peg$c40 = "\"";
  const peg$c41 = peg$literalExpectation("\"", false);
  const peg$c42 = /^[A-Za-z]/;
  const peg$c43 = peg$classExpectation([["A", "Z"], ["a", "z"]], false, false);
  const peg$c44 = function(str: any): any { return str.join("") };
  const peg$c45 = peg$otherExpectation("whitespace");
  const peg$c46 = function(): any {return undefined};

  let peg$currPos = 0;
  let peg$savedPos = 0;
  const peg$posDetailsCache = [{ line: 1, column: 1 }];
  let peg$maxFailPos = 0;
  let peg$maxFailExpected: Expectation[] = [];
  let peg$silentFails = 0;

  let peg$result;

  if (options.startRule !== undefined) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text(): string {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function location(): IFileRange {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function expected(description: string, location1?: IFileRange) {
    location1 = location1 !== undefined
      ? location1
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location1
    );
  }

  function error(message: string, location1?: IFileRange) {
    location1 = location1 !== undefined
      ? location1
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildSimpleError(message, location1);
  }

  function peg$literalExpectation(text1: string, ignoreCase: boolean): ILiteralExpectation {
    return { type: "literal", text: text1, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts: IClassParts, inverted: boolean, ignoreCase: boolean): IClassExpectation {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$anyExpectation(): IAnyExpectation {
    return { type: "any" };
  }

  function peg$endExpectation(): IEndExpectation {
    return { type: "end" };
  }

  function peg$otherExpectation(description: string): IOtherExpectation {
    return { type: "other", description: description };
  }

  function peg$computePosDetails(pos: number) {
    let details = peg$posDetailsCache[pos];
    let p;

    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;

      return details;
    }
  }

  function peg$computeLocation(startPos: number, endPos: number): IFileRange {
    const startPosDetails = peg$computePosDetails(startPos);
    const endPosDetails = peg$computePosDetails(endPos);

    return {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
  }

  function peg$fail(expected1: Expectation) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected1);
  }

  function peg$buildSimpleError(message: string, location1: IFileRange) {
    return new SyntaxError(message, [], "", location1);
  }

  function peg$buildStructuredError(expected1: Expectation[], found: string | null, location1: IFileRange) {
    return new SyntaxError(
      SyntaxError.buildMessage(expected1, found),
      expected1,
      found,
      location1
    );
  }

  function peg$parseProgram(): any {
    let s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseDefOrExpr();
    if (s2 as any !== peg$FAILED) {
      while (s2 as any !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseDefOrExpr();
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 as any !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c0(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseDefOrExpr(): any {
    let s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseDefinition();
    if (s1 as any === peg$FAILED) {
      s1 = peg$parseExpression();
    }
    if (s1 as any !== peg$FAILED) {
      s2 = [];
      if (peg$c1.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c2); }
      }
      if (s3 as any !== peg$FAILED) {
        while (s3 as any !== peg$FAILED) {
          s2.push(s3);
          if (peg$c1.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c2); }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 as any !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c0(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseDefinition(): any {
    let s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 as any !== peg$FAILED) {
      s2 = peg$parseStructDef();
      if (s2 as any === peg$FAILED) {
        s2 = peg$parseFunDef();
        if (s2 as any === peg$FAILED) {
          s2 = peg$parseConstDef();
        }
      }
      if (s2 as any !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c3(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseStructDef(): any {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 14) === peg$c4) {
      s1 = peg$c4;
      peg$currPos += 14;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c5); }
    }
    if (s1 as any !== peg$FAILED) {
      s2 = peg$parseName();
      if (s2 as any !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 as any !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 40) {
            s4 = peg$c6;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c7); }
          }
          if (s4 as any !== peg$FAILED) {
            s5 = [];
            s6 = peg$parseName();
            if (s6 as any !== peg$FAILED) {
              while (s6 as any !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$parseName();
              }
            } else {
              s5 = peg$FAILED;
            }
            if (s5 as any !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s6 = peg$c8;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c9); }
              }
              if (s6 as any !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 as any !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s8 = peg$c8;
                    peg$currPos++;
                  } else {
                    s8 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c9); }
                  }
                  if (s8 as any !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c10(s2, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseFunDef(): any {
    let s0, s1, s2, s3, s4, s5, s6, s7, s8;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c11) {
      s1 = peg$c11;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c12); }
    }
    if (s1 as any !== peg$FAILED) {
      s2 = peg$parseName();
      if (s2 as any !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 as any !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 40) {
            s4 = peg$c6;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c7); }
          }
          if (s4 as any !== peg$FAILED) {
            s5 = [];
            s6 = peg$parseName();
            if (s6 as any !== peg$FAILED) {
              while (s6 as any !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$parseName();
              }
            } else {
              s5 = peg$FAILED;
            }
            if (s5 as any !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s6 = peg$c8;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c9); }
              }
              if (s6 as any !== peg$FAILED) {
                s7 = peg$parseExpression();
                if (s7 as any !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s8 = peg$c8;
                    peg$currPos++;
                  } else {
                    s8 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c9); }
                  }
                  if (s8 as any !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c13(s2, s5, s7);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseConstDef(): any {
    let s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c11) {
      s1 = peg$c11;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c12); }
    }
    if (s1 as any !== peg$FAILED) {
      s2 = peg$parseName();
      if (s2 as any !== peg$FAILED) {
        s3 = peg$parseExpression();
        if (s3 as any !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s4 = peg$c8;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c9); }
          }
          if (s4 as any !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c14(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseExpression(): any {
    let s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 as any !== peg$FAILED) {
      s2 = peg$parseCond();
      if (s2 as any === peg$FAILED) {
        s2 = peg$parseCall();
        if (s2 as any === peg$FAILED) {
          s2 = peg$parseName();
          if (s2 as any === peg$FAILED) {
            s2 = peg$parseValue();
          }
        }
      }
      if (s2 as any !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c15(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseCond(): any {
    let s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c16) {
      s1 = peg$c16;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c17); }
    }
    if (s1 as any !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseOption();
      if (s3 as any !== peg$FAILED) {
        while (s3 as any !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseOption();
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 as any !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 as any !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s4 = peg$c8;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c9); }
          }
          if (s4 as any !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c18(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseOption(): any {
    let s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 as any !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 91) {
        s2 = peg$c19;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c20); }
      }
      if (s2 as any !== peg$FAILED) {
        s3 = peg$parse_();
        if (s3 as any !== peg$FAILED) {
          s4 = peg$parseExpression();
          if (s4 as any !== peg$FAILED) {
            s5 = peg$parse_();
            if (s5 as any !== peg$FAILED) {
              s6 = peg$parseExpression();
              if (s6 as any !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 93) {
                  s7 = peg$c21;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c22); }
                }
                if (s7 as any !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c23(s4, s6);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseCall(): any {
    let s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 40) {
      s1 = peg$c6;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c7); }
    }
    if (s1 as any !== peg$FAILED) {
      s2 = peg$parseName();
      if (s2 as any !== peg$FAILED) {
        s3 = [];
        s4 = peg$parseExpression();
        while (s4 as any !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parseExpression();
        }
        if (s3 as any !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s4 = peg$c8;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c9); }
          }
          if (s4 as any !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c24(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseName(): any {
    let s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 as any !== peg$FAILED) {
      s2 = [];
      if (peg$c25.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c26); }
      }
      if (s3 as any !== peg$FAILED) {
        while (s3 as any !== peg$FAILED) {
          s2.push(s3);
          if (peg$c25.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c26); }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 as any !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c27(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseValue(): any {
    let s0, s1;

    s0 = peg$currPos;
    s1 = peg$parseNumber();
    if (s1 as any === peg$FAILED) {
      s1 = peg$parseBoolean();
      if (s1 as any === peg$FAILED) {
        s1 = peg$parseEmpty();
        if (s1 as any === peg$FAILED) {
          s1 = peg$parseString();
        }
      }
    }
    if (s1 as any !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c28(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseNumber(): any {
    let s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 as any !== peg$FAILED) {
      s2 = [];
      if (peg$c29.test(input.charAt(peg$currPos))) {
        s3 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c30); }
      }
      if (s3 as any !== peg$FAILED) {
        while (s3 as any !== peg$FAILED) {
          s2.push(s3);
          if (peg$c29.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c30); }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 as any !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c31();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseBoolean(): any {
    let s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 as any !== peg$FAILED) {
      if (input.substr(peg$currPos, 2) === peg$c32) {
        s2 = peg$c32;
        peg$currPos += 2;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c33); }
      }
      if (s2 as any === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c34) {
          s2 = peg$c34;
          peg$currPos += 2;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c35); }
        }
      }
      if (s2 as any !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c36(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseEmpty(): any {
    let s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 as any !== peg$FAILED) {
      if (input.substr(peg$currPos, 3) === peg$c37) {
        s2 = peg$c37;
        peg$currPos += 3;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c38); }
      }
      if (s2 as any !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c39();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseString(): any {
    let s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$parse_();
    if (s1 as any !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 34) {
        s2 = peg$c40;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }
      if (s2 as any !== peg$FAILED) {
        s3 = [];
        if (peg$c42.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c43); }
        }
        if (s4 as any !== peg$FAILED) {
          while (s4 as any !== peg$FAILED) {
            s3.push(s4);
            if (peg$c42.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c43); }
            }
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 as any !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s4 = peg$c40;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
          if (s4 as any !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c44(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parse_(): any {
    let s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = [];
    if (peg$c1.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c2); }
    }
    while (s2 as any !== peg$FAILED) {
      s1.push(s2);
      if (peg$c1.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c2); }
      }
    }
    if (s1 as any !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c46();
    }
    s0 = s1;
    peg$silentFails--;
    if (s0 as any === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c45); }
    }

    return s0;
  }

  peg$result = peg$startRuleFunction();

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

export interface IParseOptions {
  filename?: string;
  startRule?: string;
  tracer?: any;
  [key: string]: any;
}
export type ParseFunction = (input: string, options?: IParseOptions) => any;
export const parse: ParseFunction = peg$parse;
