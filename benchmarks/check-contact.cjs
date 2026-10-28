const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('dist/optimizer.js','utf8');
const context=vm.createContext({assert,console});
vm.runInContext(source.slice(0,source.indexOf('\nsetupResizableLayout();')),context);
vm.runInContext(`
const item={id:0,type:0,sku:'A',w:400,d:200,h:200,mass:10};
const first={...item,x:0,y:0,z:0,support:1,rot:0};
const gene={item:{...item,id:1},rot:0,contact:0};
const candidates=contactCandidates(gene,[first],800,800,600,0);
assert.deepEqual(candidates.map(q=>[q.x,q.y]),[[400,0],[0,200],[400,200]]);
assert.deepEqual(contactCandidates(gene,[first],800,800,600,0),candidates);
const base={item,rot:0,contact:.99};
let low=decodeContactChromosome([base,gene],800,800,600);
let high=decodeContactChromosome([base,{...gene,contact:.99}],800,800,600);
assert.equal(low[0].x,0);assert.equal(low[0].y,0);
assert.notDeepEqual([low[1].x,low[1].y],[high[1].x,high[1].y]);
assert.equal(contactCandidates({item:{...item,w:900,d:200},rot:0},[],800,1000,600,0).length,0);
assert.equal(contactCandidates({item:{...item,w:900,d:200},rot:1},[],800,1000,600,0).length,1);
assert.equal(contactCandidates(gene,[first],800,800,600,200).length,1);
const flat=decodeContactChromosome(Array.from({length:5},(_,id)=>({item:{...item,id,w:200,d:200},rot:0,contact:0})),400,400,600);
assert.equal(flat.filter(q=>q.z===0).length,4);assert.equal(flat[4].z,200);
assert.deepEqual(decodeContactChromosome([base,gene],800,800,600),low);
const parents=Array.from({length:8},(_,id)=>({item:{...item,id},rot:id%2,contact:id/8}));
const snapshot=JSON.stringify(parents);
for(let i=0;i<50;i++){
 const child=breed({genes:parents},{genes:parents.slice().reverse()}).genes;
 assert.equal(new Set(child.map(g=>g.item.id)).size,8);
 assert.ok(child.every(g=>(g.rot===0||g.rot===1)&&g.contact>=0&&g.contact<1));
}
assert.equal(JSON.stringify(parents),snapshot);
assert.equal(evaluateChromosome({genes:[]},800,800,600).score,-Infinity);
console.log('Contact enumeration, strict rotation, support, origin, lower-level filling, determinism and genetic integrity passed.');
`,context);
