export const countifsFormula = {
  id: `countifs`,
  displayName: `COUNTIFS`,
  order: 3,
  identity: {
    eyebrow: `Test · Match · Count`,
    mood: `Pattern counting`,
    motion: `counter`,
    heroParts: [
      { text: `COUNT`, accent: true },
      { text: `IFS` }
    ],
    anatomyTitle: `Match first.\nCount second.`,
    anatomyCopy: `COUNTIFS does not add values. It tests rows against one or more conditions and counts how many survive.`,
    outroTitle: `Test. Match. Count.`,
    theme: {
      accent: `#ffbf69`,
      accentRgb: `255, 191, 105`,
      accent2: `#ffe0ad`,
      accent3: `#ff8f70`
    }
  },
  syntax: `=COUNTIFS(criteria_range1, criteria1, [criteria_range2, criteria2], ...)`,
  syntaxParts: [
    `=COUNTIFS(`,
    `criteria_range1`,
    `, `,
    `criteria1`,
    `, [`,
    `criteria_range2`,
    `, `,
    `criteria2`,
    `], ...)`
  ],
  arguments: [
    { id: `criteria_range1`, name: `criteria_range1`, description: `The first range Excel tests.`, color: `#ffbf69` },
    { id: `criteria1`, name: `criteria1`, description: `The condition that must be true inside the first range.`, color: `#ffe0ad` },
    { id: `criteria_range2`, name: `criteria_range2`, description: `A second range to test when another condition is required.`, color: `#8cc8ff` },
    { id: `criteria2`, name: `criteria2`, description: `The second rule that must also be true.`, color: `#c6a7ff` }
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
    task: `Count rows where Area = “Amman”`,
    result: 3,
    resultDisplay: `3`,
    resultSub: `Matching rows`,
    summary: `Three rows satisfy the Amman condition. COUNTIFS counts matches, not values.`,
    formula: `=COUNTIFS(A2:A7, "Amman")`,
    pieces: [
      { text: `=COUNTIFS(` },
      { text: `A2:A7`, accent: true },
      { text: `, ` },
      { text: `"Amman"`, accent: true },
      { text: `)` }
    ],
    visual: {
      type: `count`,
      criteria: [
        { column: `area`, value: `Amman`, range: `A2:A7` }
      ],
      matchedRows: [0, 2, 4]
    }
  },
  hard: {
    mode: `hard`,
    task: `Count rows where Area = “Amman” AND Product = “5G”`,
    result: 2,
    resultDisplay: `2`,
    resultSub: `Rows satisfying both conditions`,
    summary: `Only two rows survive both tests: Amman and 5G.`,
    transitionTitle: `Add another gate.`,
    transitionCopy: `Area = Amman AND Product = 5G`,
    formula: `=COUNTIFS(A2:A7, "Amman", B2:B7, "5G")`,
    pieces: [
      { text: `=COUNTIFS(` },
      { text: `A2:A7`, accent: true },
      { text: `, ` },
      { text: `"Amman"`, accent: true },
      { text: `, ` },
      { text: `B2:B7`, accent: true },
      { text: `, ` },
      { text: `"5G"`, accent: true },
      { text: `)` }
    ],
    visual: {
      type: `count`,
      criteria: [
        { column: `area`, value: `Amman`, range: `A2:A7` },
        { column: `product`, value: `5G`, range: `B2:B7` }
      ],
      matchedRows: [2, 4]
    }
  }
};
