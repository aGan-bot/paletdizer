const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('dist/optimizer.js','utf8');
const context = vm.createContext({assert,console});
vm.runInContext(source.slice(0,source.indexOf('\nsetupResizableLayout();')),context);
vm.runInContext(`
  const x={x:400,y:0,centerOffset:20,support:1};
  const y={x:0,y:400,centerOffset:10,support:1};
  assert.equal(preferPlacement(x,y,0,0),true);
  assert.equal(preferPlacement(x,y,0,1),false);
  assert.equal(preferPlacement(x,y,200,0),true);
  assert.equal(preferPlacement(x,y,200,undefined),false);
  const items=[{id:0,sku:'A',w:400,d:300,h:200,mass:5},{id:1,sku:'A',w:400,d:300,h:200,mass:5}];
  for(let i=0;i<30;i++)assert.ok(makeChromosome(items).genes.every(g=>g.placement===0||g.placement===1));
  const a=items.map(item=>({item,rot:0,placement:0}));
  const b=items.map(item=>({item,rot:1,placement:1}));
  for(let i=0;i<30;i++){
    const child=orderCrossover(a,b);
    assert.equal(new Set(child.map(g=>g.item.id)).size,2);
    assert.ok(child.every(g=>g.placement===g.rot));
  }
  Math.random=()=>0;
  const mutated=breed({genes:a},{genes:a}).genes;
  assert.ok(mutated.every(g=>g.placement===1));
  assert.ok(a.every(g=>g.placement===0));
  console.log('Preference direction, legacy fallback, inheritance, mutation and parent isolation passed.');
`, context);
