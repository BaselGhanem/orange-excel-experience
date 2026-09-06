export const xlookupFormula = {
  id: `xlookup`,
  displayName: `XLOOKUP`,
  order: 2,
  identity: {
    eyebrow: `Search · Locate · Retrieve`,
    mood: `Precision retrieval`,
    motion: `scanner`,
    heroParts: [
      { text: `X`, accent: true },
      { text: `LOOKUP` }
    ],
    anatomyTitle: `Find it.\nBring it back.`,
    anatomyCopy: `XLOOKUP separates the search path from the return path. Excel locates one key, then retrieves the value from the aligned row.`,
    outroTitle: `Search. Lock. Retrieve.`,
    theme: {
      accent: `#7bb8ff`,
      accentRgb: `123, 184, 255`,
      accent2: `#b8dcff`,
      accent3: `#86f7ff`
    }
  },
  syntax: `=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])`,
  syntaxParts: [
    `=XLOOKUP(`,
    `lookup_value`,
    `, `,
    `lookup_array`,
    `, `,
    `return_array`,
    `, [`,
    `if_not_found`,
    `], [`,
    `match_mode`,
    `], [`,
    `search_mode`,
    `])`
  ],
  arguments: [
    { id: `lookup_value`, name: `lookup_value`, description: `The value Excel must find.`, color: `#7bb8ff` },
    { id: `lookup_array`, name: `lookup_array`, description: `The column or row Excel searches.`, color: `#86f7ff` },
    { id: `return_array`, name: `return_array`, description: `The aligned column or row that contains the answer.`, color: `#b8dcff` },
    { id: `if_not_found`, name: `[if_not_found]`, description: `Optional fallback text when the key does not exist.`, color: `#ffd36b` },
    { id: `match_mode`, name: `[match_mode]`, description: `Optional control for exact, approximate, or wildcard matching.`, color: `#c6a7ff` }
  ],
  dataset: {
    range: `A1:E7`,
    columns: [
      { key: `code`, label: `Code`, letter: `A` },
      { key: `product`, label: `Product`, letter: `B` },
      { key: `category`, label: `Category`, letter: `C` },
      { key: `price`, label: `Price`, letter: `D`, numeric: true },
      { key: `stock`, label: `Stock`, letter: `E`, numeric: true }
    ],
    rows: [
      { code: `P101`, product: `Router`, category: `5G`, price: 89, stock: 14 },
      { code: `P102`, product: `ONT`, category: `Fiber`, price: 72, stock: 22 },
      { code: `P103`, product: `Mesh`, category: `Fiber`, price: 115, stock: 7 },
      { code: `P104`, product: `SIM`, category: `Mobile`, price: 5, stock: 180 },
      { code: `P105`, product: `Booster`, category: `5G`, price: 140, stock: 5 },
      { code: `P106`, product: `Switch`, category: `Business`, price: 95, stock: 9 }
    ],
    focusColumns: [`code`, `price`]
  },
  basic: {
    mode: `basic`,
    task: `Find the Price for product code “P103”`,
    result: 115,
    resultDisplay: `115`,
    resultSub: `Price returned from column D`,
    summary: `XLOOKUP found P103 in Code and returned the aligned Price.`,
    formula: `=XLOOKUP("P103", A2:A7, D2:D7)`,
    pieces: [
      { text: `=XLOOKUP(` },
      { text: `"P103"`, accent: true },
      { text: `, ` },
      { text: `A2:A7`, accent: true },
      { text: `, ` },
      { text: `D2:D7`, accent: true },
      { text: `)` }
    ],
    visual: {
      type: `lookup`,
      lookupColumn: `code`,
      lookupRange: `A2:A7`,
      lookupValue: `P103`,
      returnColumn: `price`,
      returnRange: `D2:D7`,
      matchedRow: 2,
      fallback: null,
      exact: false
    }
  },
  hard: {
    mode: `hard`,
    task: `Find the Price for “P105” with fallback text and explicit exact match`,
    result: 140,
    resultDisplay: `140`,
    resultSub: `Exact match · fallback protected`,
    summary: `The optional arguments make the lookup safer while preserving the same search-and-return architecture.`,
    transitionTitle: `Make the lookup safer.`,
    transitionCopy: `Add a fallback + force an exact match`,
    formula: `=XLOOKUP("P105", A2:A7, D2:D7, "Not listed", 0)`,
    pieces: [
      { text: `=XLOOKUP(` },
      { text: `"P105"`, accent: true },
      { text: `, ` },
      { text: `A2:A7`, accent: true },
      { text: `, ` },
      { text: `D2:D7`, accent: true },
      { text: `, ` },
      { text: `"Not listed"`, accent: true },
      { text: `, ` },
      { text: `0`, accent: true },
      { text: `)` }
    ],
    visual: {
      type: `lookup`,
      lookupColumn: `code`,
      lookupRange: `A2:A7`,
      lookupValue: `P105`,
      returnColumn: `price`,
      returnRange: `D2:D7`,
      matchedRow: 4,
      fallback: `Not listed`,
      exact: true
    }
  }
};
