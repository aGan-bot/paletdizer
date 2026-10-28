const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('dist/optimizer.js','utf8');
let exported,frames=[];
const context=vm.createContext({assert,console,Blob,setTimeout,
  requestAnimationFrame:callback=>frames.push(callback),
  URL:{createObjectURL:blob=>{exported=blob;return 'test:plan'},revokeObjectURL(){}},
  document:{createElement:()=>({click(){}})},
});
vm.runInContext(source.slice(0,source.indexOf('\nsetupResizableLayout();')),context);
vm.runInContext(`
let draws=0,feedback='';
setMoveFeedback=text=>feedback=text;
threeView={scene:{},camera:{},tooltip:{style:{display:'none'}},renderer:{render(){draws++}}};
render=()=>requestThreeFrame();
currentPlan={pw:1200,pd:800,mh:1000,requested:2,algorithm:'GA',
 boxes3d:[
 {id:0,sequence:0,sku:'A',x:0,y:0,z:0,w:200,d:200,h:200,mass:10,rot:0,support:1},
 {id:1,sequence:1,sku:'A',x:400,y:0,z:0,w:200,d:200,h:200,mass:10,rot:0,support:1}
 ]};
currentPlan.skuFlow={transitions:999,score:-1};
selectedBoxIds=new Set([1]);
moveSelectedBoxes(10,0);
assert.equal(currentPlan.boxes3d[1].x,410);
assert.equal(currentPlan.skuFlow.transitions,0);
moveSelectedBoxes(10,0);
assert.equal(currentPlan.boxes3d[1].x,420);
assert.equal(draws,0);
`,context);
assert.equal(frames.length,1,'keyboard moves schedule a coalesced paint');
frames.shift()();
vm.runInContext(`
assert.equal(draws,1);
moveSelectedBoxes(-300,0); // collision: no partial move or repaint
assert.equal(currentPlan.boxes3d[1].x,420);
assert.ok(feedback.includes('engellendi'));
// Regression: upper boxes invoke the support intersection helper (floor boxes do not).
currentPlan.boxes3d=[
 {id:0,sequence:0,sku:'A',x:0,y:0,z:0,w:200,d:200,h:200,mass:10,rot:0,support:1},
 {id:1,sequence:1,sku:'A',x:0,y:0,z:200,w:200,d:200,h:200,mass:10,rot:0,support:1}
];
moveSelectedBoxes(10,0);
assert.equal(currentPlan.boxes3d[1].x,10);
assert.equal(currentPlan.boxes3d[1].support,.95);
moveSelectedBoxes(50,0); // 70% support: reject and restore both coordinates and support.
assert.equal(currentPlan.boxes3d[1].x,10);
assert.equal(currentPlan.boxes3d[1].support,.95);
assert.ok(feedback.includes('engellendi'));
currentPlan.boxes3d[1].x=420;currentPlan.boxes3d[1].z=0;currentPlan.boxes3d[1].support=1;
exportPlanJson();
`,context);
(async()=>{
  const payload=JSON.parse(await exported.text());
  assert.equal(payload.placements[1].positionMm.x,420);
  assert.equal(payload.placements[0].positionMm.x,0);
  assert.deepEqual(payload.placements.map(p=>p.sequence),[1,2]);
  assert.equal(payload.summary.skuTransitions,0);
  assert.equal(payload.coordinateSystem.unit,'mm');
  console.log('Manual coordinates, rejected move rollback, scheduled paint and live JSON export passed.');
})().catch(error=>{console.error(error);process.exitCode=1});
