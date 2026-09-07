export const filterFormula = {
  id: `filter`,
  displayName: `FILTER`,
  order: 6,
  identity: {
    eyebrow: `Scan · Narrow · Spill`,
    mood: `Dynamic extraction`,
    motion: `filter`,
    heroParts: [
      { text: `FIL`, accent: true },
      { text: `TER` }
    ],
    anatomyTitle: `Keep what passes.\nReveal the rest.`,
    anatomyCopy: `FILTER tests every row and spills only the rows that satisfy the include rule into a new dynamic array.`,
    outroTitle: `Test. Narrow. Spill.`,
    theme: {
      accent: `#78e6a4`,
      accentRgb: `120, 230, 164`,
      accent2: `#b3f7cc`,
      accent3: `#7be7ff`
    }
  },
  syntax: `=FILTER(array, include, [if_empty])`,
  syntaxParts: [
    `=FILTER(`,
    `array`,
    `, `,
    `include`,
    `, [`,
    `if_empty`,
    `])`
  ],
  arguments: [
    { id: `array`, name: `array`, description: `The full range of rows and columns you want returned.`, color: `#78e6a4` },
    { id: `include`, name: `include`, description: `A TRUE/FALSE test that decides which rows survive.`, color: `#7be7ff` },
    { id: `if_empty`, name: `[if_empty]`, description: `Optional message if no rows satisfy the test.`, color: `#ffd36b` }
  ],
  dataset: {
    range: `A1:D7`,
    columns: [
      { key: `area`, label: `Area`, letter: `A` },
      { key: `product`, label: `Product`, letter: `B` },
      { key: `rep`, label: `Rep`, letter: `C` },
      { key: `sales`, label: `Sales`, letter: `D`, numeric: true }
    ],
    rows: [
      { area: `Amman`, product: `Fiber`, rep: `Ali`, sales: 1250 },
      { area: `Aqaba`, product: `5G`, rep: `Lina`, sales: 830 },
      { area: `Amman`, product: `5G`, rep: `Omar`, sales: 940 },
      { area: `Irbid`, product: `Fiber`, rep: `Ali`, sales: 760 },
      { area: `Amman`, product: `5G`, rep: `Ali`, sales: 660 },
      { area: `Zarqa`, product: `Fiber`, rep: `Omar`, sales: 540 }
    ],
    focusColumns: [`area`, `product`]
  },
  basic: {
    mode: `basic`,
    task: `Return every row where Area = “Amman”`,
    result: `3 rows`,
    resultDisplay: `3 rows`,
    resultSub: `Dynamic array output`,
    summary: `FILTER keeps the three Amman rows and spills them as a new table.`,
    formula: `=FILTER(A2:D7, A2:A7="Amman", "No matches")`,
    pieces: [
      { text: `=FILTER(` },
      { text: `A2:D7`, accent: true },
      { text: `, ` },
      { text: `A2:A7="Amman"`, accent: true },
      { text: `, ` },
      { text: `"No matches"`, accent: true },
      { text: `)` }
    ],
    visual: {
      type: `filter`,
      criteria: [
        { column: `area`, value: `Amman`, range: `A2:A7` }
      ],
      matchedRows: [0, 2, 4]
    }
  },
  hard: {
    mode: `hard`,
    task: `Return rows where Area = “Amman” AND Product = “5G”`,
    result: `2 rows`,
    resultDisplay: `2 rows`,
    resultSub: `Two-condition dynamic array`,
    summary: `Multiplying the Boolean tests behaves like AND, leaving only the two rows that satisfy both rules.`,
    transitionTitle: `Stack two filters.`,
    transitionCopy: `TRUE × TRUE becomes the row that survives`,
    formula: `=FILTER(A2:D7, (A2:A7="Amman")*(B2:B7="5G"), "No matches")`,
    pieces: [
      { text: `=FILTER(` },
      { text: `A2:D7`, accent: true },
      { text: `, (` },
      { text: `A2:A7="Amman"`, accent: true },
      { text: `)*(` },
      { text: `B2:B7="5G"`, accent: true },
      { text: `), ` },
      { text: `"No matches"`, accent: true },
      { text: `)` }
    ],
    visual: {
      type: `filter`,
      criteria: [
        { column: `area`, value: `Amman`, range: `A2:A7` },
        { column: `product`, value: `5G`, range: `B2:B7` }
      ],
      matchedRows: [2, 4]
    }
  }
};
