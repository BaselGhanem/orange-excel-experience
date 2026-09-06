import { formulas } from '../js/formulas/index.js';
import { FormulaMotionEngine } from '../js/core/engine.js';

const failures=[]; const passes=[];
const fail=m=>failures.push(m); const pass=m=>passes.push(m);
const dummy={
  textContent:'',
  classList:{add(){},remove(){},toggle(){}},
  children:[],
  dataset:{},
};
const scene={querySelector(){return dummy;},querySelectorAll(){return [];}};

function makeProbe(formula){
  const e=Object.create(FormulaMotionEngine.prototype);
  e.formula=formula;
  e.logs=[];
  const log=(name,...args)=>e.logs.push([name,...args]);
  e.clearTableState=(...a)=>log('clearTableState',...a.slice(1));
  e.highlightColumn=(_scene,key)=>log('highlightColumn',key);
  e.highlightCriterionMatches=(_scene,c)=>log('highlightCriterionMatches',c.column,c.value);
  e.activateChip=(_scene,i)=>log('activateChip',i);
  e.revealFormulaArgument=(_scene,i)=>log('revealArg',i);
  e.applyMatches=(_scene,rows,valueCol=-1)=>log('applyMatches',rows,valueCol);
  e.setEquation=(_scene,v)=>log('setEquation',v);
  e.revealResult=(_scene,v)=>log('revealResult',v);
  e.flyMatchedValues=()=>log('flyMatchedValues');
  e.flyRowsToResult=()=>log('flyRowsToResult');
  e.animateCounter=()=>log('animateCounter');
  e.focusRow=(_scene,row)=>log('focusRow',row);
  e.highlightCell=(_scene,row,key)=>log('highlightCell',row,key);
  e.setLookupTrack=(_scene,state,v)=>log('setLookupTrack',state,v);
  e.scanColumn=(_scene,key,row)=>log('scanColumn',key,row);
  e.flyCellToResult=()=>log('flyCellToResult');
  e.later=(fn)=>{fn();return 0;};
  e.columnIndex=(key)=>formula.dataset.columns.findIndex(c=>c.key===key);
  e.columnLabel=(key)=>formula.dataset.columns.find(c=>c.key===key)?.label ?? key;
  e.cellDisplay=(v)=>String(v);
  return e;
}

for(const formula of formulas){
  for(const mode of ['basic','hard']){
    const example=formula[mode];
    const probe=makeProbe(formula);
    const args=probe.parseFormulaArguments(example.formula).args;
    const steps=probe.workedSteps(scene,example);
    const ctx=`${formula.id}/${mode}`;
    if(steps.length!==args.length+1) fail(`${ctx}: ${steps.length} worked steps != ${args.length} arguments + solve`);
    else pass(`${ctx}: ${args.length} one-click arguments + one solve beat`);

    for(let i=0;i<args.length;i++){
      probe.logs=[];
      steps[i].run(true);
      const revealed=probe.logs.filter(x=>x[0]==='revealArg').map(x=>x[1]);
      if(JSON.stringify(revealed)!==JSON.stringify([i])) fail(`${ctx} arg ${i+1}: reveal calls ${JSON.stringify(revealed)}; expected only [${i}]`);

      const label=steps[i].label;
      const highlighted=probe.logs.filter(x=>x[0]==='highlightColumn').map(x=>x[1]);
      const v=example.visual;
      let expected=null;
      if(v.type==='aggregate'){
        if(i===0) expected=[v.sum.column];
        else expected=[v.criteria[Math.floor((i-1)/2)]?.column].filter(Boolean);
      } else if(v.type==='count'){
        expected=[v.criteria[Math.floor(i/2)]?.column].filter(Boolean);
      } else if(v.type==='lookup'){
        if(i===1) expected=[v.lookupColumn];
        else if(i===2) expected=[v.returnColumn];
        else expected=[];
      } else if(v.type==='filter'){
        if(i===1) expected=v.criteria.map(c=>c.column);
        else expected=[];
      }
      if(expected){
        const got=[...new Set(highlighted)].sort(); const exp=[...new Set(expected)].sort();
        if(JSON.stringify(got)!==JSON.stringify(exp)) fail(`${ctx} arg ${i+1} '${label}': highlights ${JSON.stringify(got)} != ${JSON.stringify(exp)}`);
      }
    }
  }
}

console.log(`PASS ${passes.length}`); passes.forEach(p=>console.log(`  ✓ ${p}`));
if(failures.length){console.error(`FAIL ${failures.length}`);failures.forEach(f=>console.error(`  ✗ ${f}`));process.exit(1);} 
console.log('ALL ARGUMENT-BEAT INTERACTION MAPPINGS PASSED');
