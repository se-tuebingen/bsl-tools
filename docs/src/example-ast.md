# Example AST View

Here you can see a few examples of valid Abstract Syntax Trees in BSL Core Language.
<bsltree>
(cond [e1 #t]
[else (asBool e2)])
</bsltree>

## AST as a quiz

  <bsltree quiz="true">
    (define (f x y) (+ x y))
  </bsltree>

## AST in German

  <bsltree quiz="true" lang="de">
    (define-struct name (firstName lastName))
  </bsltree>

## Build your own grammar!

Given is the following Grammar:

```json
    "grammar": {
      "<FavouriteNumber>": ["<RoundedNumber>", "<Mystery>"],
      "<RoundedNumber>": ["0", "3", "6", "8", "9"],
      "<Mystery>": ["<Pair>+", "7"],
      "<Pair>": ["<RoundedNumber><RoundedNumber>"],
    }
```

We can also make quizzes based on this custom Grammar. For example, why is **68087** a FavouriteNumber?

<style>
jsontree .bsl-tools-tree span {
  margin-left: 5.5em; 
  margin-right: 5.5em;
  }
  </style>
<jsontree quiz="false" lang="de">
{
	"grammar": {
		"FavouriteNumber": ["RoundedNumber", "Mystery"],
		"RoundedNumber": ["0", "3", "6", "8", "9"],
		"Mystery": ["Pair+7"],
		"Pair": ["RoundedNumberRoundedNumber"]
	},
	"production": "FavouriteNumber",
	"code": "|68087|",
	"holes": [{
		"production": "Mystery",
		"code": "|6808|7",
		"holes": [{
			"production": "Pair+",
			"code": "|68||08|",
			"holes": [{
					"production": "Pair",
					"code": "|6||8|",
					"holes": [{
							"production": "RoundedNumber",
							"code": "6"
						},
						{
							"production": "RoundedNumber",
							"code": "8"
						}
					]
				},
				{
					"production": "Pair",
					"code": "|0||8|",
					"holes": [{
							"production": "RoundedNumber",
							"code": "0"
						},
						{
							"production": "RoundedNumber",
							"code": "8"
						}
					]
				}
			]
		}]
	}]
}
</jsontree>
