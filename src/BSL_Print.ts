import * as BSL_AST from "./BSL_AST";

export function pprint(p: BSL_AST.program): string {
  return p.map(printDefOrExpr).join("\n");
}
export function printDefOrExpr(eod: BSL_AST.defOrExpr) {
  if (BSL_AST.isDefinition(eod)) {
    return printDefinition(eod);
  } else {
    return printE(eod);
  }
}
export function printDefinition(d: BSL_AST.definition): string {
  if (BSL_AST.isFunDef(d)) {
    return `(define (${printName(d.name)} ${d.args
      .map(printName)
      .join(" ")}) ${printE(d.body)})`;
  } else if (BSL_AST.isConstDef(d)) {
    return `(define ${printName(d.name)} ${printE(d.value)})`;
  } else if (BSL_AST.isStructDef(d)) {
    return `(define-struct ${printName(d.binding)} (${d.properties
      .map(printName)
      .join(" ")}))`;
  } else {
    console.error("Invalid input to printDefinition");
    return "";
  }
}
export function printE(e: BSL_AST.expr): string {
  if (BSL_AST.isCall(e)) {
    return `(${printName(e.name)} ${e.args.map(printE).join(" ")})`;
  } else if (BSL_AST.isCond(e)) {
    return `(cond ${e.options.map(printOption).join(" ")})`;
  } else if (BSL_AST.isName(e)) {
    return printName(e);
  } else if (BSL_AST.isLiteral(e)) {
      return printValue(e.value);
  } else {
    console.error("Invalid input to printE");
    return `<${e}>`;
  }
}

export function printValue(val: boolean | string | number | BSL_AST.StructValue) {
  if (typeof val === "string" && val !== `'()`) {
    return `"${val}"`;
  } else if (typeof val === "boolean") {
    return val ? "#true" : "#false";
  }
  if (BSL_AST.isStructValue(val)) {
  return `&lt;${printName(val.structDef)} ${val.properties.map(printE).join(" ")}&gt;`;
}
  else {
    return `${val}`;
  }
}

export function printOption(o: BSL_AST.Clause) {
  return `[${printE(o.condition)} ${printE(o.result)}]`;
}

export function printName(s: BSL_AST.Name): string {
  return s.symbol;
}

export const testprogram: BSL_AST.program = [
  {
    type: BSL_AST.Production.FunctionDefinition,
    name: {
      type: BSL_AST.Production.Symbol,
      symbol: "f",
    },
    args: [
      {
        type: BSL_AST.Production.Symbol,
        symbol: "x",
      },
      {
        type: BSL_AST.Production.Symbol,
        symbol: "y",
      },
    ],
    body: {
      type: BSL_AST.Production.FunctionCall,
      name: {
        type: BSL_AST.Production.Symbol,
        symbol: "+",
      },
      args: [
        {
          type: BSL_AST.Production.Symbol,
          symbol: "x",
        },
        {
          type: BSL_AST.Production.Symbol,
          symbol: "y",
        },
      ],
    },
  },
  {
    type: BSL_AST.Production.CondExpression,
    options: [
      {
        type: BSL_AST.Production.CondOption,
        condition: {
          type: BSL_AST.Production.FunctionCall,
          name: {
            type: BSL_AST.Production.Symbol,
            symbol: "=",
          },
          args: [
            {
              type: BSL_AST.Production.Symbol,
              symbol: "x",
            },
            {
              type: BSL_AST.Production.Literal,
              value: 3,
            },
          ],
        },
        result: {
          type: BSL_AST.Production.Literal,
          value: "isThree",
        },
      },
      {
        type: BSL_AST.Production.CondOption,
        condition: {
          type: BSL_AST.Production.Literal,
          value: false,
        },
        result: {
          type: BSL_AST.Production.Literal,
          value: `'()`,
        },
      },
    ],
  },
  {
    type: BSL_AST.Production.ConstantDefinition,
    name: {
      type: BSL_AST.Production.Symbol,
      symbol: "x",
    },
    value: {
      type: BSL_AST.Production.Literal,
      value: 42,
    },
  },
  {
    type: BSL_AST.Production.StructDefinition,
    binding: {
      type: BSL_AST.Production.Symbol,
      symbol: "name",
    },
    properties: [
      {
        type: BSL_AST.Production.Symbol,
        symbol: "firstName",
      },
      {
        type: BSL_AST.Production.Symbol,
        symbol: "lastName",
      },
    ],
  },
];

// indent code that is wider than maxLength characters
export function indent(
  code: string,
  maxWidth: number,
  mode: "html" | "text" = "text"
): string {
  // console.log('Code before indentation', code);
  // extract terms and their theoretical indentation level
  let terms: { term: string; level: number }[] = [];
  let level = 0;
  let nextLevel = 0;
  let maxLevel = 0;
  let acc = "";
  let inString = false;
  let inTag = false;
  code.split("").forEach((char) => {
    if (inString && char !== '"') {
      acc += char;
      return;
    }
    if (inTag && char !== ">") {
      acc += char;
      return;
    }
    switch (char) {
      case "(":
      case "[":
        nextLevel++;
        break;
      case ")":
      case "]":
        nextLevel--;
        break;
      case '"':
        inString = !inString;
        break;
      case "<":
        inTag = mode === "html";
        break;
      case ">":
        if (mode === "html") inTag = false;
        break;
      case " ":
      case "\n":
      case "\t":
        if (!acc) return;
        terms.push({ term: acc, level: level });
        if (level > maxLevel) maxLevel = level;
        acc = "";
        level = nextLevel;
        return;
    }
    acc += char;
    return;
  });
  if (acc !== "") {
    terms.push({ term: acc, level: level });
    if (level > maxLevel) maxLevel = level;
  }
  // console.log(terms);
  // append terms starting from the inside
  const joiner =
    mode === "html"
      ? "<br>"
      : `
`;
  for (let level = maxLevel; level > 0; level--) {
    // group terms
    const newTerms: { term: string; level: number; subterms: string[] }[] = [];
    terms.forEach((t) => {
      if (t.level < level) {
        newTerms.push({ ...t, subterms: [] });
      } else {
        newTerms[newTerms.length - 1].subterms.push(t.term);
      }
    });
    // append and check if we need to start indenting
    terms = newTerms.map((t) => {
      const alreadyIndenting = t.subterms.some((s) => s.includes(joiner));
      const unindented = `${t.term}${
        t.subterms.length > 0 ? " " : ""
      }${t.subterms.join(" ")}`;
      const unindentedLength =
        mode === "html" ? htmlIgnoringLength(unindented) : unindented.length;
      if (alreadyIndenting || unindentedLength + t.level > maxWidth) {
        const parts = t.subterms.map(
          (s) =>
            `${
              mode === "html" ? repeat("&nbsp;", level) : repeat(" ", level)
            }${s}`
        );
        parts.unshift(t.term);
        const joiner =
          mode === "html"
            ? "<br>"
            : `
`; // literal newline to be safe
        const all = `${parts.join(joiner)}`;
        return { term: all, level: t.level };
      } else {
        return { term: unindented, level: t.level };
      }
    });
    // console.log(terms);
  }
  // now there should be only top level terms left
  return terms.map((t) => t.term).join(joiner);
}

// repeat a string s n times
function repeat(s: string, n: number): string {
  let acc = "";
  for (let i = 0; i < n; i++) {
    acc += s;
  }
  return acc;
}
// measure the length of a string while ignoring html
function htmlIgnoringLength(s: string): number {
  const testDiv: HTMLElement = document.createElement("div");
  testDiv.innerHTML = s;
  return testDiv.textContent ? testDiv.textContent.length : 0;
}

// #### preventing problems with brackets
export function sanitize(s: string): string {
  return s.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
export function dirtify(s: string): string {
  return s
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ");
}
