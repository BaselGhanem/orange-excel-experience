export const ifFormula = {
  id: `if`,
  displayName: `IF`,
  order: 4,
  identity: {
    eyebrow: `Test · Decide · Return`,
    mood: `Binary decision`,
    motion: `branch`,
    heroParts: [
      { text: `IF`, accent: true }
    ],
    anatomyTitle: `One test.\nTwo outcomes.`,
    anatomyCopy: `IF evaluates a logical test, then routes the result to one of two branches: TRUE or FALSE.`,
    outroTitle: `Test. Choose. Return.`,
    theme: {
      accent: `#d29bff`,
      accentRgb: `210, 155, 255`,
      accent2: `#ecd1ff`,
      accent3: `#ff9fcf`
    }
  },
  syntax: `=IF(logical_test, value_if_true, value_if_false)`,
  syntaxParts: [
    `=IF(`,
    `logical_test`,
    `, `,
    `value_if_true`,
    `, `,
    `value_if_false`,
    `)`
  ],
  arguments: [
    { id: `logical_test`, name: `logical_test`, description: `The question Excel evaluates as TRUE or FALSE.`, color: `#d29bff` },
    { id: `value_if_true`, name: `value_if_true`, description: `What Excel returns when the test is TRUE.`, color: `#8ff0c8` },
    { id: `value_if_false`, name: `value_if_false`, description: `What Excel returns when the test is FALSE.`, color: `#ff9f9f` }
  ],
  dataset: {
    range: `A1:E7`,
    columns: [
      { key: `caseId`, label: `Case ID`, letter: `A` },
      { key: `status`, label: `Status`, letter: `B` },
      { key: `repeat`, label: `Repeat Contacts`, letter: `C`, numeric: true },
      { key: `resolution`, label: `Resolution`, letter: `D`, numeric: true },
      { key: `sla`, label: `SLA`, letter: `E`, numeric: true }
    ],
    rows: [
      { caseId: `C101`, status: `Open`, repeat: 2, resolution: 18, sla: 24 },
      { caseId: `C102`, status: `Open`, repeat: 4, resolution: 30, sla: 24 },
      { caseId: `C103`, status: `Closed`, repeat: 5, resolution: 20, sla: 24 },
      { caseId: `C104`, status: `Open`, repeat: 3, resolution: 27, sla: 24 },
      { caseId: `C105`, status: `Closed`, repeat: 1, resolution: 10, sla: 24 },
      { caseId: `C106`, status: `Open`, repeat: 1, resolution: 16, sla: 24 }
    ],
    focusColumns: [`resolution`, `sla`]
  },
  basic: {
    mode: `basic`,
    task: `For C104, return “Within SLA” if Resolution ≤ SLA; otherwise return “Late”`,
    result: `Late`,
    resultDisplay: `Late`,
    resultSub: `27 ≤ 24 is FALSE`,
    summary: `The logical test is FALSE, so IF follows the second branch and returns Late.`,
    formula: `=IF(D5<=E5, "Within SLA", "Late")`,
    pieces: [
      { text: `=IF(` },
      { text: `D5<=E5`, accent: true },
      { text: `, ` },
      { text: `"Within SLA"`, accent: true },
      { text: `, ` },
      { text: `"Late"`, accent: true },
      { text: `)` }
    ],
    visual: {
      type: `logic`,
      targetRow: 3,
      checks: [
        { columns: [`resolution`, `sla`], label: `27 ≤ 24`, passed: false }
      ],
      branch: `false`,
      trueLabel: `Within SLA`,
      falseLabel: `Late`
    }
  },
  hard: {
    mode: `hard`,
    task: `Escalate C104 only if Status is Open AND (Repeat Contacts ≥ 3 OR Resolution > SLA)`,
    result: `Escalate`,
    resultDisplay: `Escalate`,
    resultSub: `Open · TRUE AND (TRUE OR TRUE)`,
    summary: `The compound logical test resolves to TRUE, so IF routes C104 to Escalate.`,
    transitionTitle: `Turn one test into logic.`,
    transitionCopy: `AND + OR inside IF`,
    formula: `=IF(AND(B5="Open", OR(C5>=3, D5>E5)), "Escalate", "Standard")`,
    pieces: [
      { text: `=IF(` },
      { text: `AND(`, accent: true },
      { text: `B5="Open"`, accent: true },
      { text: `, OR(`, accent: true },
      { text: `C5>=3`, accent: true },
      { text: `, ` },
      { text: `D5>E5`, accent: true },
      { text: `))` },
      { text: `, "Escalate"`, accent: true },
      { text: `, "Standard"`, accent: true },
      { text: `)` }
    ],
    visual: {
      type: `logic`,
      targetRow: 3,
      checks: [
        { columns: [`status`], label: `Status = Open`, passed: true },
        { columns: [`repeat`], label: `Repeat ≥ 3`, passed: true },
        { columns: [`resolution`, `sla`], label: `Resolution > SLA`, passed: true }
      ],
      branch: `true`,
      trueLabel: `Escalate`,
      falseLabel: `Standard`
    }
  }
};
