// Runs the application's unchanged decoder, GA, metrics and JSON exporter without UI.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const root = path.resolve(__dirname, '..');
const output = process.argv[2];
const revision = process.argv[3];
if (!output || !revision) throw Error('Usage: node benchmarks/run.cjs OUTPUT REVISION');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.mkdirSync(output, { recursive: false });
const source = fs.readFileSync(path.join(root, 'dist/optimizer.js'), 'utf8');
const boundary = source.indexOf('\nsetupResizableLayout();');
if (boundary < 0) throw Error('UI initialization boundary not found');
let exported;
const context = vm.createContext({
  Math, Blob, Date, setTimeout,
  requestAnimationFrame: callback => setImmediate(() => callback(performance.now())),
  URL: { createObjectURL: blob => { exported = blob; return 'benchmark:plan'; }, revokeObjectURL() {} },
  document: { createElement: () => ({ click() {} }) },
});
vm.runInContext(source.slice(0, boundary), context);
vm.runInContext('showGaProgress = () => {};', context);
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
const manifest = { revision, sourceSha256: sha(source), runtime: process.version,
  startedAt: new Date().toISOString(), pallet: { pw: 1200, pd: 800, mh: 1000 },
  ga: { population: 30, generations: 30, runsPerOrder: 10 },
  randomness: 'Unmodified Math.random; no fixed seed',
  timing: 'Algorithm only, excludes rendering, file export and validation', orders: {} };
fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2));
function validate(boxes, products) {
  const errors = [], ids = new Set(), counts = new Map();
  const overlap = (a, b, axis, size) => Math.max(0, Math.min(a[axis]+a[size], b[axis]+b[size])-Math.max(a[axis], b[axis]));
  for (const a of boxes) {
    const p = products[a.type];
    if (!p || a.sku !== p.sku || a.mass !== p.mass || a.h !== p.h ||
      a.w !== (a.rot ? p.d : p.w) || a.d !== (a.rot ? p.w : p.d)) errors.push(`dimensions/product ${a.id}`);
    if (ids.has(a.id)) errors.push(`duplicate ${a.id}`);
    ids.add(a.id); counts.set(a.type, (counts.get(a.type)||0)+1);
    if (![a.x,a.y,a.z,a.w,a.d,a.h].every(Number.isFinite) || a.x<0 || a.y<0 || a.z<0 || a.x+a.w>1200 || a.y+a.d>800 || a.z+a.h>1000) errors.push(`bounds ${a.id}`);
    const support = a.z === 0 ? 1 : boxes.filter(b=>b!==a && b.z+b.h===a.z).reduce((s,b)=>s+overlap(a,b,'x','w')*overlap(a,b,'y','d'),0)/(a.w*a.d);
    if (support < .75-1e-9 || Math.abs(support-a.support)>1e-9) errors.push(`support ${a.id}`);
  }
  for (let i=0;i<boxes.length;i++) for(let j=i+1;j<boxes.length;j++) {
    if (overlap(boxes[i],boxes[j],'x','w')>0 && overlap(boxes[i],boxes[j],'y','d')>0 && overlap(boxes[i],boxes[j],'z','h')>0) errors.push(`collision ${i}/${j}`);
  }
  for (const [type,count] of counts) if(count>products[type].qty) errors.push(`quantity ${type}`);
  return { valid: errors.length===0, errors };
}
(async () => {
  const rows=[];
  for(const filename of fs.readdirSync(path.join(__dirname,'orders')).filter(f=>f.endsWith('.json')).sort()) {
    const input=fs.readFileSync(path.join(__dirname,'orders',filename),'utf8');
    manifest.orders[filename]=sha(input);
    const products=JSON.parse(input).map(r=>({sku:r.sku,qty:r.adet,w:r.en,d:r.boy,h:r.yukseklik,mass:r.agirlik}));
    context.products=products;
    for(let run=0;run<=10;run++) {
      const mode=run===0?'analytic':'ga', scenario=path.basename(filename,'.json');
      const start=performance.now();
      const boxes=run===0 ? vm.runInContext('packProductList(products,1200,800,1000)',context)
        : (await vm.runInContext('geneticMultiSku(products,1200,800,1000,gaRunId)',context)).boxes;
      const seconds=(performance.now()-start)/1000;
      const validation=validate(boxes,products);
      context.plan={pw:1200,pd:800,mh:1000,products,boxes3d:boxes,requested:products.reduce((s,p)=>s+p.qty,0),algorithm:run===0?'deterministic':'GA'};
      vm.runInContext('currentPlan=plan; exportPlanJson()',context);
      const payload=JSON.parse(await exported.text());
      const planFile=`${scenario}-${mode}-${String(run||1).padStart(2,'0')}.json`;
      fs.writeFileSync(path.join(output,planFile),JSON.stringify({ ...payload, benchmark:{revision,scenario,mode,run:run||1,durationSeconds:seconds,validation}},null,2));
      const s=payload.summary,c=s.centerOfMassMm;
      rows.push({revision,scenario,mode,run:run||1,placed:s.placedBoxes,requested:s.requestedBoxes,utilization_percent:s.utilizationPercent,com_offset_mm:Math.hypot(c.x,c.y),com_height_mm:c.z,average_support_percent:s.averageSupportPercent,sku_transitions:s.skuTransitions,duration_seconds:seconds,valid:validation.valid,plan_file:planFile});
      const keys=Object.keys(rows[0]);
      fs.writeFileSync(path.join(output,'results.csv'),keys.join(',')+'\n'+rows.map(r=>keys.map(k=>r[k]).join(',')).join('\n')+'\n');
      console.log(`${scenario} ${mode} ${run||1}: ${boxes.length}/${context.plan.requested}, ${seconds.toFixed(2)}s, valid=${validation.valid}`);
      if(!validation.valid) throw Error(JSON.stringify(validation));
    }
  }
  manifest.completedAt=new Date().toISOString();
  fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2));
  console.log('Completed 33 runs.');
})().catch(error=>{console.error(error);process.exitCode=1;});
