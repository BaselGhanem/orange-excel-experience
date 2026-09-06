export const ifsFormula = {
  id: `ifs`,
  displayName: `IFS`,
  order: 5,
  identity: {
    eyebrow: `Evaluate · Progress · Classify`,
    mood: `Threshold routing`,
    motion: `ladder`,
    heroParts: [
      { text: `IFS`, accent: true }
    ],
    anatomyTitle: `Many tests.\nFirst TRUE wins.`,
    anatomyCopy: `IFS checks conditions from left to right and stops at the first TRUE condition. Order therefore becomes part of the logic.`,
    outroTitle: `Evaluate. Stop. Classify.`,
    theme: {
      accent: `#ff769d`,
      accentRgb: `255, 118, 157`,
      accent2: `#ffb7cb`,
      accent3: `#ffd36b`
    }
  },
  syntax: `=IFS(logical_test1, value_if_true1, [logical_test2, value_if_true2], ...)`,
  syntaxParts: [
    `=IFS(`,
    `logical_test1`,
    `, `,
    `value_if_true1`,
    `, [`,
    `logical_test2`,
    `, `,
    `value_if_true2`,
    `], ...)`
  ],
  arguments: [
    { id: `logical_test1`, name: `logical_test1`, description: `The first condition Excel tests.`, color: `#ff769d` },
    { id: `value_if_true1`, name: `value_if_true1`, description: `The result returned when the first test is TRUE.`, color: `#ffb7cb` },
    { id: `logical_test2`, name: `logical_test2`, description: `The next condition, evaluated only if earlier tests were FALSE.`, color: `#ffd36b` },
    { id: `value_if_true2`, name: `value_if_true2`, description: `The result associated with the next TRUE condition.`, color: `#c6a7ff` }
  ],
  dataset: {
    range: `A1:B7`,
    columns: [
      { key: `caseId`, label: `Case ID`, letter: `A` },
      { key: `ratio`, label: `SLA Ratio`, letter: `B`, format: `percent` }
    ],
    rows: [
      { caseId: `C201`, ratio: 0.62 },
      { caseId: `C202`, ratio: 0.90 },
      { caseId: `C203`, ratio: 1.12 },
      { caseId: `C204`, ratio: 1.38 },
      { caseId: `C205`, ratio: 0.75 },
      { caseId: `C206`, ratio: 1.00 }
    ],
    focusColumns: [`ratio`]
  },
  basic: {
    mode: `basic`,
    task: `Classify C202: Fast ≤75%, Within SLA ≤100%, otherwise Critical`,
    result: `Within SLA`,
    resultDisplay: `Within SLA`,
    resultSub: `90% passes the second test`,
    summary: `90% fails the Fast threshold, passes the ≤100% threshold, then IFS stops.`,
    formula: `=IFS(B3<=75%, "Fast", B3<=100%, "Within SLA", TRUE, "Critical")`,
    pieces: [
      { text: `=IFS(` },
      { text: `B3<=75%`, accent: true },
      { text: `, "Fast", ` },
      { text: `B3<=100%`, accent: true },
      { text: `, "Within SLA", ` },
      { text: `TRUE`, accent: true },
      { text: `, "Critical")` }
    ],
    visual: {
      type: `threshold`,
      targetRow: 1,
      valueColumn: `ratio`,
      valueDisplay: `90%`,
      bands: [
        { max: 0.75, test: `≤ 75%`, label: `Fast` },
        { max: 1.00, test: `≤ 100%`, label: `Within SLA` },
        { max: Infinity, test: `Otherwise`, label: `Critical` }
      ],
      selectedIndex: 1
    }
  },
  hard: {
    mode: `hard`,
    task: `Classify C203 with an added Watch band between 100% and 125%`,
    result: `Watch`,
    resultDisplay: `Watch`,
    resultSub: `112% reaches the third test`,
    summary: `112% fails the first two tests, passes ≤125%, and IFS returns Watch immediately.`,
    transitionTitle: `Insert another threshold.`,
    transitionCopy: `The order of tests now matters even more`,
    formula: `=IFS(B4<=75%, "Fast", B4<=100%, "Within SLA", B4<=125%, "Watch", TRUE, "Critical")`,
    pieces: [
      { text: `=IFS(` },
      { text: `B4<=75%`, accent: true },
      { text: `, "Fast", ` },
      { text: `B4<=100%`, accent: true },
      { text: `, "Within SLA", ` },
      { text: `B4<=125%`, accent: true },
      { text: `, "Watch", ` },
      { text: `TRUE`, accent: true },
      { text: `, "Critical")` }
    ],
    visual: {
      type: `threshold`,
      targetRow: 2,
      valueColumn: `ratio`,
      valueDisplay: `112%`,
      bands: [
        { max: 0.75, test: `≤ 75%`, label: `Fast` },
        { max: 1.00, test: `≤ 100%`, label: `Within SLA` },
        { max: 1.25, test: `≤ 125%`, label: `Watch` },
        { max: Infinity, test: `Otherwise`, label: `Critical` }
      ],
      selectedIndex: 2
    }
  }
};
