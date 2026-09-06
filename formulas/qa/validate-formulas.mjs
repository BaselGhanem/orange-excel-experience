import { formulas } from '../js/formulas/index.js';
import { FormulaMotionEngine } from '../js/core/engine.js';

const failures = [];
const passes = [];
const fail = (msg) => failures.push(msg);
const pass = (msg) => passes.push(msg);

function parseArgs(formula) {
  const open = formula.indexOf('(');
  const close = formula.lastIndexOf(')');
  if (open < 0 || close <= open) return [];
  const inner = formula.slice(open + 1, close);
  const args = [];
  let current = '';
  let depth = 0;
  let inString = false;
  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    if (ch === '"') {
      if (inString && inner[i + 1] === '"') { current += '""'; i += 1; continue; }
      inString = !inString; current += ch; continue;
    }
    if (!inString) {
      if (ch === '(') depth += 1;
      else if (ch === ')') depth = Math.max(0, depth - 1);
      else if (ch === ',' && depth === 0) { args.push(current.trim()); current = ''; continue; }
    }
    current += ch;
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

function colByKey(f, key) { return f.dataset.columns.find(c => c.key === key); }
function rangeLetter(range) { return String(range).match(/^\$?([A-Z]+)/i)?.[1]?.toUpperCase() ?? null; }
function verifyRange(f, key, range, context) {
  const col = colByKey(f, key);
  if (!col) return fail(`${context}: dataset column '${key}' does not exist`);
  const letter = rangeLetter(range);
  if (letter !== col.letter) fail(`${context}: range ${range} points to ${letter}, but '${key}' is column ${col.letter}`);
  else pass(`${context}: ${range} → ${key}`);
}
function computedMatches(f, criteria) {
  return f.dataset.rows.map((row,i)=>criteria.every(c=>String(row[c.column])===String(c.value))?i:null).filter(i=>i!==null);
}
function eqArray(a,b){ return JSON.stringify(a)===JSON.stringify(b); }

for (const f of formulas) {
  const engineProbe = Object.create(FormulaMotionEngine.prototype);
  engineProbe.formula = f;
  const syntaxActions = engineProbe.syntaxArgumentActions();
  if (syntaxActions.length !== f.arguments.length) fail(`${f.id}: syntax argument beats ${syntaxActions.length} != argument definitions ${f.arguments.length}`);
  else pass(`${f.id}: syntax exposes exactly ${syntaxActions.length} argument beats`);
  if (!f.id || !f.displayName || !f.dataset?.columns?.length || !f.dataset?.rows?.length) fail(`${f.id ?? 'unknown'}: incomplete module`);
  const letters = f.dataset.columns.map(c=>c.letter);
  if (new Set(letters).size !== letters.length) fail(`${f.id}: duplicate column letters`);

  for (const mode of ['basic','hard']) {
    const e = f[mode];
    const ctx = `${f.id}/${mode}`;
    const args = FormulaMotionEngine.prototype.parseFormulaArguments.call({}, e.formula).args;
    const parserCrossCheck = parseArgs(e.formula);
    if (JSON.stringify(args) !== JSON.stringify(parserCrossCheck)) fail(`${ctx}: engine argument parser disagrees with independent QA parser`);
    if (!args.length) fail(`${ctx}: formula parser found no arguments`); else pass(`${ctx}: ${args.length} top-level arguments parsed`);
    const v = e.visual;

    if (v.type === 'aggregate') {
      verifyRange(f, v.sum.column, v.sum.range, `${ctx} sum_range`);
      v.criteria.forEach((c,i)=>verifyRange(f,c.column,c.range,`${ctx} criteria_range${i+1}`));
      const matches = computedMatches(f,v.criteria);
      if (!eqArray(matches,v.matchedRows)) fail(`${ctx}: matchedRows ${JSON.stringify(v.matchedRows)} != computed ${JSON.stringify(matches)}`);
      const values = matches.map(i=>f.dataset.rows[i][v.sum.column]);
      if (!eqArray(values,v.matchedValues)) fail(`${ctx}: matchedValues ${JSON.stringify(v.matchedValues)} != computed ${JSON.stringify(values)}`);
      const total = values.reduce((a,b)=>a+Number(b),0);
      if (Number(e.result)!==total) fail(`${ctx}: result ${e.result} != computed ${total}`); else pass(`${ctx}: result ${total} verified`);
      if (args.length !== 1 + v.criteria.length*2) fail(`${ctx}: argument count ${args.length} != expected ${1+v.criteria.length*2}`);
    }

    if (v.type === 'count') {
      v.criteria.forEach((c,i)=>verifyRange(f,c.column,c.range,`${ctx} criteria_range${i+1}`));
      const matches = computedMatches(f,v.criteria);
      if (!eqArray(matches,v.matchedRows)) fail(`${ctx}: matchedRows mismatch`);
      if (Number(e.result)!==matches.length) fail(`${ctx}: count result ${e.result} != ${matches.length}`); else pass(`${ctx}: count ${matches.length} verified`);
      if (args.length !== v.criteria.length*2) fail(`${ctx}: argument count ${args.length} != expected ${v.criteria.length*2}`);
    }

    if (v.type === 'lookup') {
      verifyRange(f,v.lookupColumn,v.lookupRange,`${ctx} lookup_array`);
      verifyRange(f,v.returnColumn,v.returnRange,`${ctx} return_array`);
      const row = f.dataset.rows.findIndex(r=>String(r[v.lookupColumn])===String(v.lookupValue));
      if (row!==v.matchedRow) fail(`${ctx}: matchedRow ${v.matchedRow} != computed ${row}`);
      const value = f.dataset.rows[row]?.[v.returnColumn];
      if (String(value)!==String(e.result)) fail(`${ctx}: lookup result ${e.result} != ${value}`); else pass(`${ctx}: lookup result ${value} verified`);
      const expectedArgs = mode==='basic' ? 3 : (v.fallback ? 4 : 3) + (v.exact ? 1 : 0);
      if (args.length!==expectedArgs) fail(`${ctx}: argument count ${args.length} != expected ${expectedArgs}`);
    }

    if (v.type === 'logic') {
      if (v.targetRow < 0 || v.targetRow >= f.dataset.rows.length) fail(`${ctx}: targetRow out of range`);
      v.checks.forEach((check,i)=>check.columns.forEach(key=>{ if(!colByKey(f,key)) fail(`${ctx}: check ${i+1} references missing column ${key}`); }));
      const expected = v.branch==='true' ? v.trueLabel : v.falseLabel;
      if (String(e.result)!==String(expected)) fail(`${ctx}: IF result ${e.result} != selected branch ${expected}`); else pass(`${ctx}: IF branch ${v.branch} → ${expected}`);
      if (args.length!==3) fail(`${ctx}: IF must have 3 top-level args, found ${args.length}`);
    }

    if (v.type === 'threshold') {
      const value = Number(f.dataset.rows[v.targetRow]?.[v.valueColumn]);
      let selected = v.bands.findIndex(b=>value <= b.max);
      if (selected<0) selected=v.bands.length-1;
      if (selected!==v.selectedIndex) fail(`${ctx}: selectedIndex ${v.selectedIndex} != computed ${selected}`);
      const expected = v.bands[selected]?.label;
      if (String(e.result)!==String(expected)) fail(`${ctx}: IFS result ${e.result} != ${expected}`); else pass(`${ctx}: IFS result ${expected} verified`);
      if (args.length !== v.bands.length*2) fail(`${ctx}: IFS args ${args.length} != band pairs ${v.bands.length*2}`);
    }

    if (v.type === 'filter') {
      const matches = computedMatches(f,v.criteria);
      if (!eqArray(matches,v.matchedRows)) fail(`${ctx}: FILTER matchedRows ${JSON.stringify(v.matchedRows)} != ${JSON.stringify(matches)}`);
      const resultCount = Number(String(e.resultDisplay).match(/\d+/)?.[0]);
      if (resultCount!==matches.length) fail(`${ctx}: FILTER resultDisplay ${e.resultDisplay} != ${matches.length} rows`); else pass(`${ctx}: FILTER ${matches.length} rows verified`);
      if (args.length!==3) fail(`${ctx}: FILTER must have 3 top-level args, found ${args.length}`);
      // array may span multiple columns, verify its first letter at least matches the dataset's first column.
      if (rangeLetter(args[0])!==f.dataset.columns[0].letter) fail(`${ctx}: FILTER array ${args[0]} does not begin at ${f.dataset.columns[0].letter}`);
    }
  }
}

console.log(`PASS ${passes.length}`);
passes.forEach(p=>console.log(`  ✓ ${p}`));
if (failures.length) {
  console.error(`FAIL ${failures.length}`);
  failures.forEach(f=>console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log('ALL FORMULA DATA / RANGE / RESULT CHECKS PASSED');
