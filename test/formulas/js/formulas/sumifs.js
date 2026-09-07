export const sumifsFormula = {
  id: `sumifs`,
  displayName: `SUMIFS`,
  order: 1,
  identity: {
    eyebrow: `Aggregation · Match · Combine`,
    mood: `Precision aggregation`,
    motion: `orbit`,
    heroParts: [
      { text: `SUM`, accent: true },
      { text: `IFS` }
    ],
    anatomyTitle: `Five parts.\nOne decision.`,
    anatomyCopy: `Build the formula by assigning each argument to a clear role: what to add, where to check, and what must match.`,
    outroTitle: `Match. Filter. Sum.`,
    theme: {
      accent: `#66f2c4`,
      accentRgb: `102, 242, 196`,
      accent2: `#9df7dd`,
      accent3: `#d6ff7d`
    }
  },
  syntax: `=SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)`,
  syntaxParts: [
    `=SUMIFS(`,
    `sum_range`,
    `, `,
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
    { id: `sum_range`, name: `sum_range`, description: `The numbers Excel will add after all conditions are satisfied.`, color: `#66f2c4` },
    { id: `criteria_range1`, name: `criteria_range1`, description: `The first column Excel checks for a match.`, color: `#8cc8ff` },
    { id: `criteria1`, name: `criteria1`, description: `The first value or rule that must match.`, color: `#ffd36b` },
    { id: `criteria_range2`, name: `criteria_range2`, description: `An additional column to test when more than one condition is needed.`, color: `#c6a7ff` },
    { id: `criteria2`, name: `criteria2`, description: `The second value or rule that must also match.`, color: `#ff9cc7` }
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
    focusColumns: [`sales`, `area`]
  },
  basic: {
    mode: `basic`,
    task: `Sum Sales where Area = “Amman”`,
    result: 2850,
    resultDisplay: `2,850`,
    resultSub: `Matched Sales total`,
    summary: `SUMIFS scanned Area, kept the Amman rows, then combined their Sales values.`,
    formula: `=SUMIFS(D2:D7, A2:A7, "Amman")`,
    pieces: [
      { text: `=SUMIFS(` },
      { text: `D2:D7`, accent: true },
      { text: `, ` },
      { text: `A2:A7`, accent: true },
      { text: `, ` },
      { text: `"Amman"`, accent: true },
      { text: `)` }
    ],
    visual: {
      type: `aggregate`,
      sum: { column: `sales`, range: `D2:D7` },
      criteria: [
        { column: `area`, value: `Amman`, range: `A2:A7` }
      ],
      matchedRows: [0, 2, 4],
      matchedValues: [1250, 940, 660]
    }
  },
  hard: {
    mode: `hard`,
    task: `Sum Sales where Area = “Amman” AND Product = “5G”`,
    result: 1600,
    resultDisplay: `1,600`,
    resultSub: `Two-condition Sales total`,
    summary: `Only rows satisfying both Area = Amman and Product = 5G contribute to the total.`,
    transitionTitle: `One more condition.`,
    transitionCopy: `Area = Amman AND Product = 5G`,
    formula: `=SUMIFS(D2:D7, A2:A7, "Amman", B2:B7, "5G")`,
    pieces: [
      { text: `=SUMIFS(` },
      { text: `D2:D7`, accent: true },
      { text: `, ` },
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
      type: `aggregate`,
      sum: { column: `sales`, range: `D2:D7` },
      criteria: [
        { column: `area`, value: `Amman`, range: `A2:A7` },
        { column: `product`, value: `5G`, range: `B2:B7` }
      ],
      matchedRows: [2, 4],
      matchedValues: [940, 660]
    }
  }
};
