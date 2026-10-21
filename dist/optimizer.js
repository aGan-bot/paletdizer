/* Genetic mixed-orientation layer packing: gene 0 = normal, 1 = rotated 90°. */
let currentPlan,sceneDrag,gaRunning=false,gaCancel=false,gaRunId=0;
let productRows=[{sku:'Kutu A',qty:12,w:400,d:300,h:240,mass:8}];
function setupStabilityMetrics(){let note=document.querySelector('.note');note.insertAdjacentHTML('beforebegin','<div id="stability-metrics" style="display:none"><div class="metric"><span>Ağırlık merkezi X / Y</span><b id="com-xy">—</b></div><div class="metric"><span>Ağırlık merkezi yüksekliği</span><b id="com-z">—</b></div><div class="metric"><span>Ortalama destek</span><b id="support-score">—</b></div><div class="metric"><span>Ön stabilite skoru</span><b id="stability-score">—</b></div></div>')}
function analyzeLoad(v){let boxes=v.boxes3d||[],mass=boxes.reduce((n,q)=>n+q.mass,0);if(!mass)return null;let c=boxes.reduce((a,q)=>({x:a.x+q.mass*(q.x+q.w/2-v.pw/2),y:a.y+q.mass*(q.y+q.d/2-v.pd/2),z:a.z+q.mass*(q.z+q.h/2)}),{x:0,y:0,z:0}),x=c.x/mass,y=c.y/mass,z=c.z/mass,offset=Math.hypot(x,y),maxOffset=Math.hypot(v.pw/2,v.pd/2),support=boxes.reduce((n,q)=>n+(q.support??1),0)/boxes.length,score=Math.max(0,Math.min(100,100*(.5*(1-offset/maxOffset)+.25*(1-z/v.mh)+.25*support)));return{mass,x,y,z,offset,support,score}}
function axisLabel(text,color,x,y,z){let canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;let c=canvas.getContext('2d');c.font='bold 34px Arial';c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.strokeStyle='#fff';c.lineWidth=5;c.strokeText(text,64,32);c.fillText(text,64,32);let sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthTest:false}));sprite.position.set(x,y,z);sprite.scale.set(.34,.17,1);return sprite}
function setupResizableLayout(){
  let app=document.querySelector('.app'),controls=document.querySelector('.controls'),visual=document.querySelector('.visual'),stats=document.querySelector('.stats'),split=document.createElement('div'),left=480;
  split.id='pane-resizer';split.title='Sol paneli sürükleyerek genişletin veya daraltın';split.style.cssText='width:9px;cursor:col-resize;background:linear-gradient(90deg,transparent 3px,#dce2e5 3px,#dce2e5 5px,transparent 5px);touch-action:none';controls.insertAdjacentElement('afterend',split);
  let apply=()=>{if(innerWidth<1000){app.style.gridTemplateColumns='';visual.style.gridColumn='';stats.style.gridColumn='';split.style.display='none'}else{split.style.display='block';app.style.gridTemplateColumns=left+'px 9px minmax(360px,1fr) 270px';visual.style.gridColumn='3';stats.style.gridColumn='4';resizeThree()}};apply();window.addEventListener('resize',apply);
  split.onpointerdown=e=>{let start=e.clientX,initial=left;split.setPointerCapture?.(e.pointerId);let move=x=>{left=Math.max(390,Math.min(680,initial+x-start));apply()};let up=()=>{window.removeEventListener('pointermove',onmove);window.removeEventListener('pointerup',up)};let onmove=e=>move(e.clientX);window.addEventListener('pointermove',onmove);window.addEventListener('pointerup',up)};
}
function setupProductList(){
  let legacy=[...document.querySelectorAll('.controls .sec')].find(x=>x.querySelector('.label')?.textContent.trim().startsWith('Kutu'));if(legacy)legacy.style.display='none';
  let panel=document.createElement('section');panel.className='sec';panel.id='product-panel';panel.style.cssText='max-height:285px;overflow:auto';
  panel.innerHTML='<p class="label">Kutu listesi <span class="unit" id="sku-count"></span></p><div style="display:grid;grid-template-columns:minmax(90px,1.4fr) 54px repeat(4,minmax(62px,1fr)) 20px;gap:4px;align-items:center;font:9px DM Mono;color:#77838a;margin-bottom:5px;min-width:430px"><span>SKU</span><span>ADET</span><span>EN</span><span>BOY</span><span>YÜK.</span><span>KG</span><span></span></div><div id="product-rows"></div><button type="button" id="add-product" style="width:100%;margin-top:8px;border:1px dashed #b8c2c6;background:#fff;border-radius:6px;padding:8px;font:10px DM Mono;cursor:pointer">+ KUTU TÜRÜ EKLE</button><div style="display:flex;gap:5px;margin-top:6px"><button type="button" id="import-products" style="flex:1;border:1px solid #dce2e5;background:#fff;border-radius:6px;padding:7px;font:9px DM Mono;cursor:pointer">DOSYA YÜKLE</button><button type="button" id="random-products" style="flex:1;border:1px solid #dce2e5;background:#fff;border-radius:6px;padding:7px;font:9px DM Mono;cursor:pointer">ÖRNEK SET</button></div><input id="product-file" type="file" accept=".csv,.json,application/json,text/csv" style="display:none"><div id="product-summary" style="margin-top:7px;font:9px DM Mono;color:#77838a"></div>';
  $('run').insertAdjacentElement('beforebegin',panel);$('add-product').onclick=()=>{if(productRows.length<30){productRows.push({sku:'Kutu '+(productRows.length+1),qty:1,w:200,d:200,h:200,mass:1});drawProductRows()}};$('import-products').onclick=()=>$('product-file').click();$('random-products').onclick=()=>{productRows=makeSampleProducts();drawProductRows()};$('product-file').onchange=importProductFile;drawProductRows();
}
function drawProductRows(){
  let host=$('product-rows');host.innerHTML=productRows.map((p,i)=>'<div data-row="'+i+'" style="display:grid;grid-template-columns:minmax(90px,1.4fr) 54px repeat(4,minmax(62px,1fr)) 20px;gap:4px;margin-bottom:4px;min-width:430px"><input data-k="sku" value="'+p.sku+'" aria-label="SKU '+(i+1)+'" style="min-width:0;padding:6px 5px;border:1px solid #dce2e5;border-radius:4px;font:10px DM Mono"><input data-k="qty" value="'+p.qty+'" type="number" min="1" step="1" aria-label="Adet" style="min-width:0;padding:6px 5px;border:1px solid #dce2e5;border-radius:4px;font:10px DM Mono"><input data-k="w" value="'+p.w+'" type="number" min="1" step="1" aria-label="En mm" style="min-width:0;padding:6px 5px;border:1px solid #dce2e5;border-radius:4px;font:10px DM Mono"><input data-k="d" value="'+p.d+'" type="number" min="1" step="1" aria-label="Boy mm" style="min-width:0;padding:6px 5px;border:1px solid #dce2e5;border-radius:4px;font:10px DM Mono"><input data-k="h" value="'+p.h+'" type="number" min="1" step="1" aria-label="Yükseklik mm" style="min-width:0;padding:6px 5px;border:1px solid #dce2e5;border-radius:4px;font:10px DM Mono"><input data-k="mass" value="'+p.mass+'" type="number" min="1" step="1" aria-label="Ağırlık kg" style="min-width:0;padding:6px 5px;border:1px solid #dce2e5;border-radius:4px;font:10px DM Mono"><button data-remove="'+i+'" type="button" aria-label="Satırı sil" style="border:0;background:transparent;color:#b04a27;cursor:pointer">×</button></div>').join('');
  host.querySelectorAll('input').forEach(input=>input.oninput=()=>{let row=input.closest('[data-row]'),p=productRows[+row.dataset.row],k=input.dataset.k;p[k]=k==='sku'?input.value:+input.value;input.style.borderColor=k==='sku'||Number.isInteger(p[k])&&p[k]>0?'#dce2e5':'#d94632';syncProductSummary()});host.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{productRows.splice(+b.dataset.remove,1);drawProductRows()});syncProductSummary();
}
function getProducts(){
  let valid=productRows.filter(p=>p.sku.trim()&&[p.qty,p.w,p.d,p.h,p.mass].every(Number.isInteger)&&[p.qty,p.w,p.d,p.h,p.mass].every(x=>x>0));return valid;
}
function syncProductSummary(){let ps=getProducts(),qty=ps.reduce((n,p)=>n+p.qty,0),kg=ps.reduce((n,p)=>n+p.qty*p.mass,0);$('sku-count').textContent=ps.length+'/30 SKU';$('product-summary').textContent=qty+' kutu · '+kg+' kg toplam';}
function makeSampleProducts(){return Array.from({length:8},(_,i)=>({sku:'SKU-'+String(i+1).padStart(2,'0'),qty:2+Math.floor(Math.random()*5),w:200+50*Math.floor(Math.random()*7),d:200+50*Math.floor(Math.random()*7),h:150+50*Math.floor(Math.random()*5),mass:2+Math.floor(Math.random()*19)}))}
function normalKey(key){return key.toLocaleLowerCase('tr-TR').replaceAll('_','').replaceAll('-','').replaceAll('ı','i').replaceAll('ş','s').replaceAll('ğ','g').replaceAll('ü','u').replaceAll('ö','o').replaceAll('ç','c')}
function normalizeProduct(row){let value=(...keys)=>{let found=Object.entries(row).find(([k])=>keys.includes(normalKey(k)));return found?.[1]};return{sku:String(value('sku','kod','urun','product')??'').trim(),qty:+value('adet','qty','quantity'),w:+value('en','w','width','enmm'),d:+value('boy','d','depth','boymm'),h:+value('yukseklik','h','height','yukseklikmm'),mass:+value('agirlik','mass','weight','agirlikkg')}}
function importProductFile(event){let file=event.target.files?.[0];if(!file)return;let reader=new FileReader();reader.onload=()=>{try{let text=String(reader.result).replace(/^\uFEFF/,''),rows;if(file.name.toLowerCase().endsWith('.json')){let parsed=JSON.parse(text);rows=Array.isArray(parsed)?parsed:parsed.products}else{let lines=text.trim().split(/\r?\n/),delimiter=lines[0].includes(';')?';':',',headers=lines.shift().split(delimiter);rows=lines.filter(Boolean).map(line=>Object.fromEntries(headers.map((h,i)=>[h,line.split(delimiter)[i]?.trim()])))}let next=(rows||[]).map(normalizeProduct).filter(p=>p.sku&&[p.qty,p.w,p.d,p.h,p.mass].every(Number.isInteger)&&[p.qty,p.w,p.d,p.h,p.mass].every(x=>x>0)).slice(0,30);if(!next.length)throw new Error('Geçerli satır bulunamadı');productRows=next;drawProductRows();$('status').textContent='DOSYA YÜKLENDİ'}catch(error){$('status').textContent='DOSYA FORMATI GEÇERSİZ'}};reader.readAsText(file);event.target.value=''}
function setupGaProgress(){
  let panel=document.createElement('div');panel.id='ga-progress';panel.style.cssText='display:none;margin-top:10px;padding:10px;border:1px solid #dce2e5;border-radius:8px;background:#f7faf9;font:10px "DM Mono";color:#59666d';
  panel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px"><span id="ga-label">GENETİK ARAMA</span><button id="ga-cancel" style="border:0;border-radius:5px;background:#172025;color:#fff;padding:5px 7px;font:10px Manrope;cursor:pointer">İptal</button></div><div style="height:5px;background:#dce2e5;border-radius:4px"><i id="ga-bar" style="display:block;width:0;height:100%;background:#ff5a1f;border-radius:4px"></i></div>';
  $('run').insertAdjacentElement('afterend',panel);$('ga-cancel').onclick=()=>{gaCancel=true;$('ga-label').textContent='İPTAL EDİLİYOR…'};
}
function showGaProgress(percent,generation){$('ga-progress').style.display='block';$('ga-label').textContent='GENETİK ARAMA · '+percent+'% · NESİL '+generation;$('ga-bar').style.width=percent+'%'}
let threeView,orbit={azimuth:-.75,elevation:.62,distance:22},threeDrag;
function initThree(){
  if(threeView||!window.THREE)return !!threeView;let host=$('scene');host.replaceWith(Object.assign(document.createElement('div'),{id:'scene',className:'scene'}));host=$('scene');
  let renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.append(renderer.domElement);
  let scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,200),world=new THREE.Group();scene.add(world);scene.add(new THREE.HemisphereLight(0xffffff,0x405050,2));let sun=new THREE.DirectionalLight(0xffffff,2.4);sun.position.set(12,18,10);sun.castShadow=true;scene.add(sun);
  let ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.ShadowMaterial({color:0x16252b,opacity:.16}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);threeView={host,renderer,scene,camera,world};window.addEventListener('resize',resizeThree);resizeThree();return true;
}
function resizeThree(){if(!threeView)return;let {host,renderer,camera}=threeView,w=host.clientWidth||700,h=host.clientHeight||520;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(currentPlan)renderThree(currentPlan)}
function woodPallet(v,s){
  let g=new THREE.Group(),w=v.pw*s,d=v.pd*s,h=.11*1000*s,wood=new THREE.MeshStandardMaterial({color:0xa66b3e,roughness:.82}),dark=new THREE.MeshStandardMaterial({color:0x704224,roughness:.9}),add=(x,y,z,a,b,c,m=wood)=>{let q=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),m);q.position.set(x,y,z);q.castShadow=q.receiveShadow=true;g.add(q)};
  for(let i=0;i<5;i++)add(0,h-.07,-d/2+d*(i+.5)/5,w-.08,.14,d/5-.035);
  for(let i=0;i<3;i++)add(0,.07,-d/2+d*(i+.5)/3,w-.22,.14,d/3-.05,dark);
  [-w*.38,0,w*.38].forEach(x=>[-d*.34,0,d*.34].forEach(z=>add(x,h*.47,z,w*.16,h*.55,d*.18,dark)));return{group:g,height:h};
}
function renderThree(v){
  let {world,scene,camera,renderer}=threeView;while(world.children.length)world.remove(world.children[0]);let s=.01,pallet=woodPallet(v,s);world.add(pallet.group);
  let boxMat=[new THREE.MeshStandardMaterial({color:0x3777ee,roughness:.55,metalness:.04,transparent:true,opacity:.72,depthWrite:false}),new THREE.MeshStandardMaterial({color:0xff6a35,roughness:.58,metalness:.03,transparent:true,opacity:.72,depthWrite:false})];
  let sceneBoxes=v.boxes3d||Array.from({length:v.layers},(_,layer)=>v.boxes.map(q=>({...q,z:layer*v.bh,h:v.bh}))).flat();
  for(let q of sceneBoxes){let m=new THREE.Mesh(new THREE.BoxGeometry(q.w*s,q.h*s,q.d*s),boxMat[q.rot?1:0]),x=-v.pw*s/2+(q.x+q.w/2)*s,z=-v.pd*s/2+(q.y+q.d/2)*s,y=pallet.height+(q.z+q.h/2)*s;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;world.add(m);let e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.82}));e.position.copy(m.position);world.add(e)}
  let load=v.boxes3d&&analyzeLoad(v);if(load){let mx=load.x*s,my=pallet.height+load.z*s,mz=load.y*s,origin=new THREE.Vector3(mx,my,mz),marker=new THREE.Mesh(new THREE.SphereGeometry(.16,24,18),new THREE.MeshStandardMaterial({color:0x111111,roughness:.45,metalness:.2}));marker.position.copy(origin);world.add(marker);let axes=[['+X',new THREE.Vector3(1,0,0),0xd93636],['-X',new THREE.Vector3(-1,0,0),0xd93636],['+Z',new THREE.Vector3(0,1,0),0x1f9d55],['-Z',new THREE.Vector3(0,-1,0),0x1f9d55],['+Y',new THREE.Vector3(0,0,1),0x2864e8],['-Y',new THREE.Vector3(0,0,-1),0x2864e8]];axes.forEach(([label,dir,color])=>{let length=.72,arrow=new THREE.ArrowHelper(dir,origin,length,color,.14,.08);world.add(arrow);world.add(axisLabel(label,'#'+color.toString(16).padStart(6,'0'),mx+dir.x*.9,my+dir.y*.9,mz+dir.z*.9))})}
  let top=pallet.height+Math.max(0,...sceneBoxes.map(q=>q.z+q.h))*s,cx=load?load.x*s:0,cy=load?pallet.height+load.z*s:top*.48,cz=load?load.y*s:0,ce=Math.cos(orbit.elevation),se=Math.sin(orbit.elevation);camera.position.set(cx+orbit.distance*ce*Math.sin(orbit.azimuth),cy+orbit.distance*se,cz+orbit.distance*ce*Math.cos(orbit.azimuth));camera.lookAt(cx,cy,cz);renderer.render(scene,camera);
}
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
function packProductList(products,pw,pd,mh){
  let queue=[];products.forEach((p,type)=>{for(let i=0;i<p.qty&&queue.length<180;i++)queue.push({...p,type,id:queue.length})});queue.sort((a,b)=>b.mass-a.mass||b.h-a.h||b.w*b.d-a.w*a.d);let placed=[];
  for(let item of queue){let xs=[0],ys=[0],zs=[0];placed.forEach(b=>{xs.push(b.x+b.w);ys.push(b.y+b.d);zs.push(b.z+b.h)});let best=null;
    for(let rot of [0,1]){let w=rot?item.d:item.w,d=rot?item.w:item.d;for(let z of zs)for(let y of ys)for(let x of xs){if(x+w>pw||y+d>pd||z+item.h>mh)continue;let clear=placed.every(b=>x+w<=b.x||b.x+b.w<=x||y+d<=b.y||b.y+b.d<=y||z+item.h<=b.z||b.z+b.h<=z);if(!clear)continue;let support=z===0?1:placed.filter(b=>b.z+b.h===z).reduce((a,b)=>a+Math.max(0,Math.min(x+w,b.x+b.w)-Math.max(x,b.x))*Math.max(0,Math.min(y+d,b.y+b.d)-Math.max(y,b.y)),0)/(w*d);if(support<.75)continue;let candidate={...item,x,y,z,w,d,rot,support};if(!best||candidate.z<best.z||candidate.z===best.z&&(candidate.y<best.y||candidate.y===best.y&&candidate.x<best.x))best=candidate}}if(best)placed.push(best)}
  return placed;
}
async function geneticLayer(pw,pd,bw,bd,runId){
  // One gene represents one physical box; it cannot exceed the area-based box upper bound.
  let length=Math.min(80,Math.floor(pw*pd/Math.max(bw*bd,1))),pop=[];
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
  let pw=+$('pw').value,pd=+$('ph').value,mh=+$('maxh').value,products=getProducts();if(!pw||!pd||!mh||!products.length){$('status').textContent='LİSTEYİ KONTROL EDİN';return}
  let boxes3d=packProductList(products,pw,pd,mh);
  currentPlan={pw,pd,mh,products,boxes3d,requested:products.reduce((n,p)=>n+p.qty,0),boxes:[],layers:0};
  render(currentPlan);
}
function render(v){
  if(initThree())renderThree(v);else{let s=$('scene');s.innerHTML='';let cap=120,boxes=[];for(let layer=0;layer<v.layers;layer++)v.boxes.forEach(q=>boxes.push({x:q.x,y:q.y,z:layer*v.bh,w:q.w,d:q.d,h:v.bh,rot:q.rot}));let sw=560/v.pw,sh=310/v.mh;
  // Every entry is a physical box (x, y, z, width, depth, height), not a 2D tile.
  // Draw upper boxes after lower ones, then traverse each layer from the rear corner.
  boxes.slice(0,cap).sort((a,b)=>a.z-b.z||(a.x+a.y)-(b.x+b.y)).forEach(q=>s.append(box(q.x*sw,q.y*sw,q.z*sh,q.w*sw,q.d*sw,q.h*sh)));
  let A=P(0,0,0),B=P(v.pw*sw,0,0),C=P(v.pw*sw,v.pd*sw,0),D=P(0,v.pd*sw,0);s.insertBefore(poly([A,B,C,D],'#b76e37','#7b3f19'),s.firstChild);}
  let multi=!!v.boxes3d,total=multi?v.boxes3d.length:v.boxes.length*v.layers,volume=multi?v.boxes3d.reduce((n,q)=>n+q.w*q.d*q.h,0):total*v.bw*v.bd*v.bh,u=volume/(v.pw*v.pd*v.mh)*100,rot=multi?v.boxes3d.filter(q=>q.rot).length:v.boxes.filter(q=>q.rot).length,top=multi?Math.max(0,...v.boxes3d.map(q=>q.z+q.h)):v.layers*v.bh,mass=multi?v.boxes3d.reduce((n,q)=>n+q.mass,0):0;
  let load=multi?analyzeLoad(v):null;$('util').textContent=u.toFixed(1)+'%';$('bar').style.width=u+'%';$('count').textContent=multi?total+' / '+v.requested+' adet':total+' adet';$('layers').textContent=multi?'3B yerleşim':v.layers+' katman';$('height').textContent=top+' mm';$('orient').textContent=rot+' adet 90° / '+(total-rot)+' adet düz';$('scoretxt').textContent=multi?mass+' kg yerleştirildi':'Deterministik optimum';$('layout').textContent=multi?'Çoklu SKU · temas noktası yerleştirici':'Katman başına en iyi grid';$('status').textContent='OPTİMUM';$('stability-metrics').style.display=load?'block':'none';if(load){$('com-xy').textContent=load.x.toFixed(0)+' / '+load.y.toFixed(0)+' mm';$('com-z').textContent=load.z.toFixed(0)+' mm';$('support-score').textContent=(load.support*100).toFixed(0)+'%';$('stability-score').textContent=load.score.toFixed(0)+' / 100'}$('note').textContent=multi?(total<v.requested?v.requested-total+' kutu yerleştirilemedi. ':'')+'Stabilite skoru karar desteğidir; gerçek palet ve robot güvenlik doğrulaması yerine geçmez.':'Yük görünümü '+total+' kutunun '+v.layers+' katmana dağılımını gösterir.';
}
setupResizableLayout();
setupProductList();
setupStabilityMetrics();
setupGaProgress();
solve();
$('run').onclick=solve;
document.querySelectorAll('input').forEach(e=>e.onchange=solve);
document.querySelectorAll('.mode button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.mode button').forEach(x=>x.classList.remove('active'));b.classList.add('active');mode=b.dataset.mode;solve()});
document.querySelectorAll('.pill').forEach(b=>b.onclick=()=>{document.querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));b.classList.add('active');let a=b.dataset.p.split(',');$('pw').value=a[0];$('ph').value=a[1];$('maxh').value=a[2];solve()});
$('scene').onpointerdown=e=>{sceneDrag={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture?.(e.pointerId)};
$('scene').onpointermove=e=>{if(sceneDrag!=null){let dx=e.clientX-sceneDrag.x,dy=e.clientY-sceneDrag.y;sceneDrag={x:e.clientX,y:e.clientY};if(threeView){orbit.azimuth-=dx*.008;orbit.elevation=Math.max(.16,Math.min(1.32,orbit.elevation-dy*.008));if(currentPlan)renderThree(currentPlan)}else{yaw+=dx/180;if(currentPlan)render(currentPlan)}}};
window.onpointerup=()=>sceneDrag=null;
$('scene').onwheel=e=>{e.preventDefault();if(threeView){orbit.distance=Math.max(8,Math.min(42,orbit.distance+e.deltaY*.012));if(currentPlan)renderThree(currentPlan)}else{scale=Math.max(.65,Math.min(1.45,scale-e.deltaY*.001));if(currentPlan)render(currentPlan)}};
