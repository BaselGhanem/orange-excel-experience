import { formulas } from '../js/formulas/index.js';

const failures = [];
const passes = [];
const fail = (m) => failures.push(m);
const pass = (m) => passes.push(m);
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);

const byId = Object.fromEntries(formulas.map(f => [f.id, f]));

function rowsMatching(formula, criteria) {
  return formula.dataset.rows
    .map((row, index) => criteria.every(c => String(row[c.column]) === String(c.value)) ? index : null)
    .filter(index => index !== null);
}

for (const formula of formulas) {
  for (const mode of ['basic', 'hard']) {
    const example = formula[mode];
    const v = example.visual;
    const ctx = `${formula.id}/${mode}`;

    if (v.type === 'aggregate') {
      const matches = rowsMatching(formula, v.criteria);
      const values = matches.map(i => Number(formula.dataset.rows[i][v.sum.column]));
      const total = values.reduce((a,b) => a+b, 0);
      if (!same(matches, v.matchedRows)) fail(`${ctx}: displayed matched rows do not equal logical matches`);
      else pass(`${ctx}: displayed matched rows ${JSON.stringify(matches)} verified`);
      if (!same(values, v.matchedValues)) fail(`${ctx}: displayed matched values do not equal source values`);
      else pass(`${ctx}: displayed values ${JSON.stringify(values)} verified`);
      if (Number(example.result) !== total) fail(`${ctx}: displayed total ${example.result} != ${total}`);
      else pass(`${ctx}: displayed total ${total} verified`);
    }

    if (v.type === 'count') {
      const matches = rowsMatching(formula, v.criteria);
      if (!same(matches, v.matchedRows)) fail(`${ctx}: count highlighted rows mismatch`);
      else pass(`${ctx}: count highlights ${JSON.stringify(matches)} verified`);
      if (Number(example.result) !== matches.length) fail(`${ctx}: count result ${example.result} != ${matches.length}`);
      else pass(`${ctx}: count result ${matches.length} verified`);
    }

    if (v.type === 'lookup') {
      const rowIndex = formula.dataset.rows.findIndex(r => String(r[v.lookupColumn]) === String(v.lookupValue));
      const sourceValue = formula.dataset.rows[rowIndex]?.[v.returnColumn];
      if (rowIndex !== v.matchedRow) fail(`${ctx}: lookup matched row ${v.matchedRow} != ${rowIndex}`);
      else pass(`${ctx}: lookup row ${rowIndex} verified`);
      if (String(example.result) !== String(sourceValue)) fail(`${ctx}: lookup output ${example.result} != ${sourceValue}`);
      else pass(`${ctx}: lookup output ${sourceValue} verified`);
    }

    if (formula.id === 'if') {
      const row = formula.dataset.rows[v.targetRow];
      let condition;
      if (mode === 'basic') {
        condition = Number(row.resolution) <= Number(row.sla);
      } else {
        condition = row.status === 'Open' && (Number(row.repeat) >= 3 || Number(row.resolution) > Number(row.sla));
      }
      const expected = condition ? v.trueLabel : v.falseLabel;
      if (String(example.result) !== String(expected)) fail(`${ctx}: IF visible result ${example.result} != recomputed ${expected}`);
      else pass(`${ctx}: IF visible result ${expected} independently recomputed`);
    }

    if (v.type === 'threshold') {
      const value = Number(formula.dataset.rows[v.targetRow][v.valueColumn]);
      const selected = v.bands.findIndex(b => value <= b.max);
      const expected = v.bands[selected < 0 ? v.bands.length - 1 : selected].label;
      if (String(example.result) !== String(expected)) fail(`${ctx}: IFS visible result ${example.result} != recomputed ${expected}`);
      else pass(`${ctx}: IFS visible result ${expected} independently recomputed`);
    }

    if (v.type === 'filter') {
      const matches = rowsMatching(formula, v.criteria);
      const expectedRows = matches.map(index => formula.dataset.rows[index]);
      const configuredRows = v.matchedRows.map(index => formula.dataset.rows[index]);
      if (!same(matches, v.matchedRows)) fail(`${ctx}: FILTER row indexes ${JSON.stringify(v.matchedRows)} != logical ${JSON.stringify(matches)}`);
      else pass(`${ctx}: FILTER row indexes ${JSON.stringify(matches)} verified`);
      if (!same(configuredRows, expectedRows)) fail(`${ctx}: FILTER visible row payload differs from logical output`);
      else pass(`${ctx}: FILTER ${expectedRows.length} full row payloads verified`);
      const displayCount = Number(String(example.resultDisplay).match(/\d+/)?.[0]);
      if (displayCount !== expectedRows.length) fail(`${ctx}: FILTER result card says ${displayCount}, expected ${expectedRows.length}`);
      else pass(`${ctx}: FILTER result card count ${displayCount} matches spill rows`);
    }
  }
}

console.log(`PASS ${passes.length}`);
passes.forEach(p => console.log(`  ✓ ${p}`));
if (failures.length) {
  console.error(`FAIL ${failures.length}`);
  failures.forEach(f => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log('ALL VISIBLE OUTPUTS ARE LOGICALLY CONSISTENT WITH THEIR DATASETS');
