/* Genetic mixed-orientation layer packing: gene 0 = normal, 1 = rotated 90°. */
let currentPlan,sceneDrag,gaRunning=false,gaCancel=false,gaRunId=0;
function setupGaProgress(){
  let panel=document.createElement('div');panel.id='ga-progress';panel.style.cssText='display:none;margin-top:10px;padding:10px;border:1px solid #dce2e5;border-radius:8px;background:#f7faf9;font:10px "DM Mono";color:#59666d';
  panel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px"><span id="ga-label">GENETİK ARAMA</span><button id="ga-cancel" style="border:0;border-radius:5px;background:#172025;color:#fff;padding:5px 7px;font:10px Manrope;cursor:pointer">İptal</button></div><div style="height:5px;background:#dce2e5;border-radius:4px"><i id="ga-bar" style="display:block;width:0;height:100%;background:#ff5a1f;border-radius:4px"></i></div>';
  $('run').insertAdjacentElement('afterend',panel);$('ga-cancel').onclick=()=>{gaCancel=true;$('ga-label').textContent='İPTAL EDİLİYOR…'};
}
function showGaProgress(percent,generation){$('ga-progress').style.display='block';$('ga-label').textContent='GENETİK ARAMA · '+percent+'% · NESİL '+generation;$('ga-bar').style.width=percent+'%'}
function tetrisPack(genes,pw,pd,bw,bd){
  let boxes=[];
  for(let gene of genes){
    let rot=gene===1,w=rot?bd:bw,d=rot?bw:bd,xs=[0],ys=[0];
    boxes.forEach(b=>{xs.push(b.x+b.w);ys.push(b.y+b.d)});
    let candidates=[];
    for(let y of ys)for(let x of xs){
      let inside=x+w<=pw&&y+d<=pd,clear=boxes.every(b=>x+w<=b.x||b.x+b.w<=x||y+d<=b.y||b.y+b.d<=y);
      if(inside&&clear)candidates.push({x,y});
    }
    candidates.sort((a,b)=>a.y-b.y||a.x-b.x);
    if(candidates.length)boxes.push({...candidates[0],w,d,rot});
  }
  return boxes;
}
async function geneticLayer(pw,pd,bw,bd,runId){
  let length=Math.min(80,Math.ceil(pw*pd/Math.max(bw*bd,1))+12),pop=[];
  for(let i=0;i<56;i++)pop.push(Array.from({length},()=>Math.random()<.5?0:1));
  const rank=p=>p.map(g=>{let boxes=tetrisPack(g,pw,pd,bw,bd),right=Math.max(0,...boxes.map(b=>b.x+b.w)),bottom=Math.max(0,...boxes.map(b=>b.y+b.d));return{g,boxes,score:boxes.length*1000000-right*bottom}}).sort((a,b)=>b.score-a.score);
  for(let gen=0;gen<42;gen++){
    if(gaCancel||runId!==gaRunId)return null;
    let ranked=rank(pop),next=ranked.slice(0,8).map(x=>x.g);
    while(next.length<pop.length){let a=ranked[(Math.random()*12)|0].g,b=ranked[(Math.random()*12)|0].g,cut=(Math.random()*length)|0,c=a.slice(0,cut).concat(b.slice(cut));for(let j=0;j<length;j++)if(Math.random()<.025)c[j]^=1;next.push(c)}pop=next;
    showGaProgress(Math.round((gen+1)/42*100),gen+1);await new Promise(requestAnimationFrame);
  }
  return rank(pop)[0].boxes;
}
async function solve(){
  if(gaRunning)gaCancel=true;
  let runId=++gaRunId;
  let pw=+$('pw').value,pd=+$('ph').value,mh=+$('maxh').value,bw=+$('bw').value,bd=+$('bd').value,bh=+$('bh').value;if(!pw||!pd||!mh||!bw||!bd||!bh)return;
  let a=fit(bw,bd,pw,pd),b=fit(bd,bw,pw,pd),boxes;
  if(mode==='genetic'){gaRunning=true;gaCancel=false;showGaProgress(0,0);boxes=await geneticLayer(pw,pd,bw,bd,runId);if(runId!==gaRunId)return;gaRunning=false;$('ga-progress').style.display='none';if(!boxes){$('status').textContent='İPTAL EDİLDİ';return}}else{let best=a.n>=b.n?a:b;boxes=[];for(let y=0;y<best.ny;y++)for(let x=0;x<best.nx;x++)boxes.push({x:x*best.w,y:y*best.d,w:best.w,d:best.d,rot:best.w!==bw})}
  currentPlan={pw,pd,mh,bw,bd,bh,boxes,layers:Math.floor(mh/bh)};
  render(currentPlan);
}
function render(v){
  let s=$('scene');s.innerHTML='';let cap=120,boxes=[];for(let layer=0;layer<v.layers;layer++)v.boxes.forEach(q=>boxes.push({x:q.x,y:q.y,z:layer*v.bh,w:q.w,d:q.d,h:v.bh,rot:q.rot}));let sw=560/v.pw,sh=310/v.mh;
  // Every entry is a physical box (x, y, z, width, depth, height), not a 2D tile.
  // Draw upper boxes after lower ones, then traverse each layer from the rear corner.
  boxes.slice(0,cap).sort((a,b)=>a.z-b.z||(a.x+a.y)-(b.x+b.y)).forEach(q=>s.append(box(q.x*sw,q.y*sw,q.z*sh,q.w*sw,q.d*sw,q.h*sh)));
  let A=P(0,0,0),B=P(v.pw*sw,0,0),C=P(v.pw*sw,v.pd*sw,0),D=P(0,v.pd*sw,0);s.insertBefore(poly([A,B,C,D],'#b76e37','#7b3f19'),s.firstChild);
  let total=v.boxes.length*v.layers,u=total*v.bw*v.bd*v.bh/(v.pw*v.pd*v.mh)*100,rot=v.boxes.filter(q=>q.rot).length;
  $('util').textContent=u.toFixed(1)+'%';$('bar').style.width=u+'%';$('count').textContent=total+' adet';$('layers').textContent=v.layers+' katman';$('height').textContent=(v.layers*v.bh)+' mm';$('orient').textContent=mode==='genetic'?rot+' adet 90° / '+(v.boxes.length-rot)+' adet düz':'Tek yön';$('scoretxt').textContent=mode==='genetic'?'Genetik: 0 düz, 1 = 90° döndürülmüş':'Deterministik optimum';$('layout').textContent=mode==='genetic'?'Karışık yönelimli genetik katman':'Katman başına en iyi grid';$('status').textContent='OPTİMUM';$('note').textContent=boxes.length>cap?'Görsel performans için ilk '+cap+' kutu çizildi; hesaplamada toplam '+total+' kutu yer alır.':'Yük görünümü '+total+' kutunun '+v.layers+' katmana dağılımını gösterir.';
}
setupGaProgress();
solve();
$('run').onclick=solve;
document.querySelectorAll('input').forEach(e=>e.onchange=solve);
document.querySelectorAll('.mode button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.mode button').forEach(x=>x.classList.remove('active'));b.classList.add('active');mode=b.dataset.mode;solve()});
document.querySelectorAll('.pill').forEach(b=>b.onclick=()=>{document.querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));b.classList.add('active');let a=b.dataset.p.split(',');$('pw').value=a[0];$('ph').value=a[1];$('maxh').value=a[2];solve()});
$('scene').onpointerdown=e=>sceneDrag=e.clientX;
$('scene').onpointermove=e=>{if(sceneDrag!=null){yaw+=(e.clientX-sceneDrag)/180;sceneDrag=e.clientX;if(currentPlan)render(currentPlan)}};
window.onpointerup=()=>sceneDrag=null;
$('scene').onwheel=e=>{e.preventDefault();scale=Math.max(.65,Math.min(1.45,scale-e.deltaY*.001));if(currentPlan)render(currentPlan)};
