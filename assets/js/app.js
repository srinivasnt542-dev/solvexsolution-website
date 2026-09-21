/* =====================================================================
   SolvexSolution — site script
   Everything the team needs to edit lives in CONFIG and PROJECTS below.
   ===================================================================== */
(function(){
'use strict';
const IMG=window.__IMG||{},PAL=window.__PAL||{},STILLS={};
const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>Array.from((r||document).querySelectorAll(s));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function h(tag,attrs,html){const e=document.createElement(tag);if(typeof attrs==='string')e.className=attrs;else if(attrs)for(const k in attrs){if(k==='class')e.className=attrs[k];else e.setAttribute(k,attrs[k]);}if(html!=null)e.innerHTML=html;return e;}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const imgSrc=k=>IMG[k]||STILLS[k]||(/\.(jpe?g|png|webp|avif)$/i.test(k)?k:null);

/* ---------------- CONFIG (edit me) ---------------- */
const CONFIG={
  /* leave '' until real details are available; placeholders are shown automatically */
  contact:{
    phones:['8762289733','8904093932'],
    whatsapp:['8762289733','8904093932'],
    email:'hello.solvexsolution@gmail.com',
    address:'Krishna Reddy Layout, Arekere, Bengaluru, Karnataka 560076',
    instagram:'Solvex Solution',
    instagramUrl:''          /* add the full Instagram profile link here to make it clickable */
  },
  /* set value to a number to enable the animated counter, e.g. {label:'Projects completed',value:120,suffix:'+'} */
  stats:[
    {label:'Projects completed',value:30,suffix:'+'},
    {label:'Years of experience',value:4,suffix:'+'},
    {label:'Happy clients',value:null,suffix:'+'},
    {label:'Service area',text:'All Karnataka'}
  ],
  
  about:{
    headline:'Your home is personal. So your interior should be too.',
    story:[
      'At SolvexSolution, we don\u2019t believe in one-size-fits-all designs. We listen to what you want, understand your lifestyle and budget, and create a space around you.',
      'From the first idea to the final finishing touch, we\u2019re with you throughout the journey.',
      'Tell us what you\u2019re imagining. Let\u2019s build it together.'
    ],
    founder:{name:'Srivathsa N T',qual:'BE, Civil Engineering'},
    experience:'4+ years',projects:'30+ projects',locations:'All Karnataka'
  },
  projectTypes:['Residential interiors','Commercial interiors','Office interiors','Modular kitchen','Bedroom design','Living room design','Full turnkey project','Other'],
  budgets:['Prefer to discuss','Below \u20b95 lakh','\u20b95\u201310 lakh','\u20b910\u201325 lakh','\u20b925\u201350 lakh','Above \u20b950 lakh'],
  testimonials:[
    {quote:'Add a genuine customer review here.',who:'[Client name]',meta:'[Project type, location]'},
    {quote:'Add a genuine customer review here.',who:'[Client name]',meta:'[Project type, location]'},
    {quote:'Add a genuine customer review here.',who:'[Client name]',meta:'[Project type, location]'}
  ],
  /* Provide image URLs (or data URIs) to replace the concept before/after render with real site photos */
  beforeAfter:{before:null,after:null},
  /* If set, the form opens the visitor's email app addressed here. Connect a form service before launch. */
  formEmail:'hello.solvexsolution@gmail.com'
};

/* ---------------- content data ---------------- */
const ICON={
  design:['M8 6h20v8H8z','M28 10h4v8H20v4','M20 22v12h-4V22h4z'],
  viz:['M20 4l14 8v16l-14 8L6 28V12z','M6 12l14 8 14-8','M20 20v16'],
  home:['M5 19L20 6l15 13','M9 16v18h22V16','M17 34v-9h6v9'],
  building:['M10 35V6h14v29','M24 15h8v20','M14 11h2M18 11h2M14 17h2M18 17h2M14 23h2M18 23h2','M4 35h32'],
  office:['M6 8h28v18H6z','M14 33h12','M20 26v7','M11 20l5-4 4 3 6-6'],
  kitchen:['M5 6h30v11H5z','M5 21h30v14H5z','M20 6v11','M20 21v14','M11 12h2','M27 12h2','M11 28h2','M27 28h2'],
  bed:['M4 32V10','M4 24h32v8','M36 32v-9a5 5 0 0 0-5-5H16v6','M8 20a3 3 0 1 0 .01 0'],
  sofa:['M6 22a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v9H6z','M10 18v-4a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v4','M10 31v3M30 31v3'],
  bulb:['M20 4a10 10 0 0 0-5 18.5V27h10v-4.5A10 10 0 0 0 20 4z','M16 31h8','M17 35h6'],
  chair:['M12 6h16v14H12z','M10 20h20v6H10z','M13 26v10M27 26v10'],
  plan:['M6 6h28v28H6z','M6 18h12','M18 6v12','M26 18h8','M26 18v16'],
  expand:['M8 14V8h6','M32 14V8h-6','M8 26v6h6','M32 26v6h-6','M14 14h12v12H14z'],
  key:['M13 22a6 6 0 1 0 .01 0','M19 22h16','M31 22v6','M27 22v4'],
  layers:['M20 6l14 7-14 7-14-7z','M6 21l14 7 14-7','M6 28l14 7 14-7'],
  ruler:['M5 26L26 5l9 9L14 35z','M12 20l3 3M17 15l3 3M22 10l3 3'],
  hat:['M8 28a12 12 0 0 1 24 0z','M5 28h30v4H5z','M20 14v6'],
  sliders:['M8 10h24','M8 20h24','M8 30h24','M14 6v8','M26 16v8','M18 26v8'],
  pencil:['M6 34l2-8L28 6l6 6L14 32z','M24 10l6 6']
};
function icon(name){return'<svg viewBox="0 0 40 40" aria-hidden="true">'+ICON[name].map(d=>'<path pathLength="140" d="'+d+'"/>').join('')+'</svg>';}

const SERVICES=[
  ['Interior Design','design','Complete design direction for a home or workplace, from concept to finishing details.'],
  ['3D Visualization','viz','Photorealistic renders so you see the finished space before work begins.'],
  ['Residential Interiors','home','Apartments, villas and family homes planned around how you live.'],
  ['Commercial Interiors','building','Showrooms, retail and hospitality spaces that carry your brand.'],
  ['Office Interiors','office','Workplaces, cabins, boardrooms and receptions built for daily use.'],
  ['Modular Kitchens','kitchen','Storage-smart kitchens with durable finishes and considered layouts.'],
  ['Bedroom Design','bed','Restful rooms with built-in storage, layered lighting and soft materials.'],
  ['Living Room Design','sofa','Seating, media walls and lighting arranged for family and guests.'],
  ['Lighting Design','bulb','Cove, accent and task lighting planned together with the ceiling.'],
  ['Furniture Planning','chair','Loose and custom furniture sized and placed to suit the room.'],
  ['Space Planning','plan','Layouts that make every square foot earn its place.'],
  ['Turnkey Interior Solutions','key','One team handling design, materials, execution and handover.']
];
const WHY=[
  ['Creative Design','pencil','Layouts and details shaped around your brief.'],
  ['3D Visualization','viz','See the design in realistic detail before it is built.'],
  ['Quality Materials','layers','Finishes chosen for how they look, wear and clean.'],
  ['Detailed Planning','ruler','Measurements, drawings and schedules settled before site work starts.'],
  ['Professional Execution','hat','Coordinated site work from carpentry to final finishing.'],
  ['Customized Solutions','sliders','No fixed packages. Every space is designed to order.']
];
const PROCESS=[
  ['Consultation','We listen to your needs, taste and budget.'],
  ['Site Measurement','The space is measured and documented accurately.'],
  ['Concept & Planning','Layouts, mood boards and design direction.'],
  ['3D Visualization','Renders let you review the design in detail.'],
  ['Material Selection','Finishes, fixtures and lighting are chosen and approved.'],
  ['Execution','Carpentry, ceilings, electricals and finishing on site.'],
  ['Final Handover','A walkthrough and snag check before you move in.']
];
const CATS=['All','Residential','Commercial','Office','Luxury Interiors','Modular Kitchen','Bedroom','Living Room'];

/* Projects live in assets/js/projects.js */
const PROJECTS=window.__PROJECTS||[];

const ROOM_INFO={
  living:{name:'Living Room',concept:'A warm, layered lounge organised around a fluted walnut feature wall.',design:'The sofa sits against the feature wall with two lounge chairs facing a marble coffee table. A rug defines the seating zone.',materials:'Fluted walnut, marble side panels, oak flooring, textured fabric, brass details.',lighting:'LED edges on the feature wall, three pendants over the coffee table, a floor lamp and daylight from the window.',furniture:'Three-seat sofa, two lounge chairs, marble coffee table, sideboard, floor lamp.'},
  kitchen:{name:'Modular Kitchen',concept:'A dark, matte kitchen balanced with warm timber wall units and a marble island.',design:'A single run of base and wall units along one wall, a tall appliance unit at the end and an island with seating facing the room.',materials:'Charcoal laminate, walnut and oak veneer, marble-look countertops, brass handles, tile flooring.',lighting:'Pendants over the island and a warm strip under the wall cabinets for task light.',furniture:'Island with three stools, tall storage unit, open counter for plants and appliances.'},
  office:{name:'Office',concept:'A private office with a warm storage wall and a glass partition to the floor.',design:'The desk faces the room with visitor seating opposite. A full-height shelving wall holds books and files behind it.',materials:'Walnut veneer, stone-look credenza top, carpet flooring, leather seating, glass partition.',lighting:'A linear pendant above the desk, lit shelves and a warm task lamp.',furniture:'Executive desk with pedestals, task chair, two visitor chairs, credenza and shelving.'},
  bedroom:{name:'Master Bedroom',concept:'A restful room built around a fluted headboard wall and a full-height wardrobe.',design:'The bed is centred on the headboard wall with matching bedside tables. A bench, an armchair and a wardrobe wall complete the room.',materials:'Fluted walnut, upholstered headboard, walnut wardrobe, textured fabrics, oak flooring.',lighting:'Pendants on both sides of the bed, warm LED edges on the headboard wall and soft ambient light.',furniture:'Bed with bedside tables, wardrobe wall, upholstered bench, armchair, rug.'},
  bathroom:{name:'Bathroom',concept:'A spa-like bathroom in marble-look surfaces with a backlit mirror and a freestanding tub.',design:'A floating double vanity sits on the marble wall with a backlit mirror above. The tub and shower share the far side.',materials:'Marble-look wall tiles, dark stone-look floor, fluted timber accent, glass, brass fittings.',lighting:'A backlit mirror, warm ambient light and a rain shower head.',furniture:'Floating double vanity, freestanding tub, glass shower, timber stool, plant.'}
};
const ROOM_ORDER=['living','kitchen','office','bedroom','bathroom'];

const MATERIALS=[
  {id:'wood',name:'Wood',tex:'wood',o:{planks:5},desc:'Warm veneers and solid timber for floors, wardrobes, panelling and desks. Grain and tone are selected to match across a whole room.',apps:['Flooring','Wardrobes','Wall slats','Desks'],photo:['suite','28% 82%',300]},
  {id:'marble',name:'Marble',tex:'marble',o:{veins:9},desc:'Natural and engineered stone with bold veining for feature walls, counters and floors.',apps:['Feature walls','Countertops','Floors','Reception desks'],photo:['cabin','64% 42%',260]},
  {id:'tiles',name:'Tiles',tex:'tile',o:{n:4},desc:'Large-format and textured tiles for kitchens, bathrooms and high-traffic floors.',apps:['Backsplashes','Bathrooms','Floors'],photo:['kitchen','72% 70%',330]},
  {id:'glass',name:'Glass',tex:'glass',o:{},desc:'Clear, frosted and reflective glass for partitions, shutters and mirrors.',apps:['Partitions','Cabinet shutters','Shower screens'],photo:['boardroom','6% 55%',260]},
  {id:'metal',name:'Metal',tex:'metal',o:{},desc:'Brass, steel and bronze tones for handles, trims, frames and light fittings.',apps:['Handles','Trims','Furniture legs','Light fittings'],photo:['kitchen','86% 88%',420]},
  {id:'fabric',name:'Fabric',tex:'fabric',o:{},desc:'Upholstery, curtains and soft furnishings chosen for feel, durability and colour.',apps:['Sofas','Curtains','Headboards','Cushions'],photo:['living','84% 78%',320]},
  {id:'panels',name:'Wall Panels',tex:'slats',o:{n:14},desc:'Fluted, moulded and textured panels that add depth and hide services.',apps:['Feature walls','Wainscoting','Acoustic walls'],photo:['panels','14% 42%',250]},
  {id:'lighting',name:'Lighting',tex:'glow',o:{},desc:'Cove, linear, recessed and decorative lighting planned together with ceilings and walls.',apps:['Cove lights','Pendants','Downlights','Wall edges'],photo:['kitchen','62% 10%',280]}
];

/* ---------------- capability detection ---------------- */
function hasGL(){try{const c=document.createElement('canvas');return!!(c.getContext('webgl2')||c.getContext('webgl'));}catch(e){return false;}}
const GL=!!window.THREE&&hasGL();
const lite=matchMedia('(max-width:820px)').matches||(navigator.hardwareConcurrency||8)<=4;
const dpr=Math.min(window.devicePixelRatio||1,lite?1.25:1.75);

/* ---------------- images ---------------- */
function paintImgs(root){
  $$('img[data-img]',root||document).forEach(im=>{const s=imgSrc(im.dataset.img);if(s&&im.getAttribute('src')!==s){im.src=s;im.classList.add('ok');const w=im.closest('.wait');if(w)w.classList.remove('wait');}});
}
const stillWaiters=[];let stillsFailed=false;
function onStill(id,url){STILLS[id]=url;paintImgs(document);stillWaiters.slice().forEach(f=>f());}
function onStillsFail(){stillsFailed=true;renderProjects();stillWaiters.slice().forEach(f=>f());}

/* ---------------- nav ---------------- */
const nav=$('#nav'),burger=$('#burger');
function navState(){
  nav.classList.toggle('solid',scrollY>60||nav.classList.contains('open')&&false);
  const map={home:'home',about:'about',services:'services',projects:'projects',showroom:'showroom',transform:'showroom',why:'about',process:'process',materials:'services',beforeafter:'projects',testimonials:'about',contact:'contact'};
  let cur='home';const y=scrollY+140;
  Object.keys(map).forEach(id=>{const s=document.getElementById(id);if(s&&s.offsetTop<=y)cur=map[id];});
  $$('.nav-links a[href^="#"]').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur&&!a.classList.contains('btn')));
}
burger.addEventListener('click',()=>{const o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o);burger.setAttribute('aria-label',o?'Close menu':'Open menu');document.body.style.overflow=o?'hidden':'';});
$$('#navLinks a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');burger.setAttribute('aria-expanded','false');document.body.style.overflow='';}));
$('#year').textContent=new Date().getFullYear();

/* ---------------- about ---------------- */
$('#aboutH').textContent=CONFIG.about.headline;
$('#aboutStory').innerHTML=CONFIG.about.story.map((t,i)=>'<p'+(i===0?' class="lede"':'')+'>'+esc(t)+'</p>').join('');
$('#aboutFacts').innerHTML=[['Founder',CONFIG.about.founder.name+', '+CONFIG.about.founder.qual],['Experience',CONFIG.about.experience],['Projects',CONFIG.about.projects],['Service locations',CONFIG.about.locations]].map(r=>'<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>').join('');
$('#team').innerHTML='<figure><div class="ph">[Founder photograph]</div><figcaption><b>'+esc(CONFIG.about.founder.name)+'</b><br>Founder \u00b7 '+esc(CONFIG.about.founder.qual)+'</figcaption></figure>'+
  [1,2].map(()=>'<figure><div class="ph">[Team photograph]</div><figcaption>[Name and role]</figcaption></figure>').join('');

/* ---------------- services / why / process ---------------- */
$('#svcGrid').innerHTML=SERVICES.map(s=>'<article class="svc" tabindex="0">'+icon(s[1])+'<h3>'+esc(s[0])+'</h3><p>'+esc(s[2])+'</p></article>').join('');
$('#whyGrid').innerHTML=WHY.map(s=>'<div class="why">'+icon(s[1])+'<h3>'+esc(s[0])+'</h3><p>'+esc(s[2])+'</p></div>').join('');
$('#timeline').innerHTML=PROCESS.map((p,i)=>'<li class="step"><div class="n">0'+(i+1)+'</div><h3>'+esc(p[0])+'</h3><p>'+esc(p[1])+'</p></li>').join('');
$('#stats').innerHTML=CONFIG.stats.map(s=>{
  if(s.text)return'<div class="stat"><b class="txt">'+esc(s.text)+'</b><span>'+esc(s.label)+'</span></div>';
  const has=s.value!=null;
  return'<div class="stat"><b class="'+(has?'':'empty')+'" data-count="'+(has?s.value:'')+'" data-suffix="'+esc(s.suffix||'')+'">'+(has?'0'+esc(s.suffix||''):'[X]'+esc(s.suffix||''))+'</b><span>'+esc(s.label)+'</span>'+(has?'':'<small>Placeholder: add the real figure in CONFIG.stats</small>')+'</div>';
}).join('');
/* counters */
const cio=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;cio.unobserve(en.target);const el=en.target,to=+el.dataset.count,suf=el.dataset.suffix,t0=performance.now(),d=reduce?1:1600;
  (function tick(t){const k=clamp((t-t0)/d,0,1),e=1-Math.pow(1-k,3);el.textContent=Math.round(to*e)+suf;if(k<1)requestAnimationFrame(tick);})(t0);}),{threshold:.6});
$$('#stats b[data-count]').forEach(b=>{if(b.dataset.count!=='')cio.observe(b);});

/* ---------------- projects ---------------- */
let activeCat='All';
const visibleProjects=()=>PROJECTS.filter(p=>(GL&&!stillsFailed)||!p.concept3d);
$('#projChips').innerHTML=CATS.map(c=>'<button class="chip" type="button" aria-pressed="'+(c==='All')+'">'+esc(c)+'</button>').join('');
$('#projChips').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;activeCat=b.textContent;$$('#projChips .chip').forEach(x=>x.setAttribute('aria-pressed',x===b));renderProjects();});
function renderProjects(){
  const list=visibleProjects().filter(p=>activeCat==='All'||p.cats.includes(activeCat));
  const grid=$('#projGrid');
  grid.innerHTML=list.length?'':'<p class="lede">No projects in this category yet.</p>';
  list.forEach((p,i)=>{
    const wide=i%5===0,art=h('article','proj'+(wide?' wide':''));
    art.style.animationDelay=(i*50)+'ms';
    art.innerHTML='<button class="proj-media'+(imgSrc(p.img)?'':' wait')+'" type="button" aria-label="Open project: '+esc(p.title)+'"><img data-img="'+p.img+'" alt="'+esc(p.title)+'" '+(p.pos?'style="object-position:'+p.pos+'"':'')+' loading="lazy" decoding="async"><span class="badge">'+esc(p.badge)+'</span><span class="open" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 14L14 4M6 4h8v8"/></svg></span></button>'+
      '<div><div class="proj-top"><h3>'+esc(p.title)+'</h3><span>'+esc(p.loc)+'</span></div></div><p>'+esc(p.desc)+'</p><ul class="cats">'+p.cats.map(c=>'<li>'+esc(c)+'</li>').join('')+'</ul>';
    $('.proj-media',art).addEventListener('click',()=>openProject(p.id));
    grid.appendChild(art);
  });
  paintImgs(grid);
}

/* ---------------- before / after slider ---------------- */
function makeBA(o){
  const box=h('div','ba');box.style.setProperty('--pos','50%');
  box.innerHTML='<div class="ba-wait">Rendering the before / after concept\u2026</div>'+
    '<img class="before" alt="'+esc(o.altB)+'" decoding="async"><img class="after" alt="'+esc(o.altA)+'" decoding="async">'+
    '<span class="ba-label l">Before</span><span class="ba-label r">After</span>'+
    '<input type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after">'+
    '<div class="ba-line" aria-hidden="true"><div class="ba-knob"><svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 7l-6 6 6 6M17 7l6 6-6 6"/></svg></div></div>';
  const bi=$('.before',box),ai=$('.after',box),wait=$('.ba-wait',box),rng=$('input',box);
  function ready(){
    const b=o.before(),a=o.after();if(!b||!a)return false;
    bi.src=b;ai.src=a;wait.remove();return true;
  }
  if(o.fallback&&!GL){wait.remove();bi.src=o.fallback;ai.src=o.fallback;bi.style.filter='grayscale(1) contrast(.6) brightness(1.15) blur(1px)';}
  else if(!ready()){const f=()=>{const rm=()=>{const i=stillWaiters.indexOf(f);if(i>-1)stillWaiters.splice(i,1);};if(ready())rm();else if(stillsFailed&&o.fallback){wait.remove();bi.src=o.fallback;ai.src=o.fallback;bi.style.filter='grayscale(1) contrast(.6) brightness(1.15) blur(1px)';rm();}};stillWaiters.push(f);}
  rng.addEventListener('input',()=>box.style.setProperty('--pos',rng.value+'%'));
  if(!reduce){let done=false;new IntersectionObserver((es,ob)=>{if(!es[0].isIntersecting||done)return;done=true;ob.disconnect();const t0=performance.now();
    (function tick(t){const k=clamp((t-t0)/1800,0,1),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,v=90-40*e;if(document.activeElement!==rng){rng.value=v;box.style.setProperty('--pos',v+'%');}if(k<1)requestAnimationFrame(tick);})(t0);},{threshold:.5}).observe(box);}
  return box;
}
$('#baMain').appendChild(makeBA({altB:'Empty room before design',altA:'The same room as a finished interior',
  before:()=>CONFIG.beforeAfter.before||STILLS.lvEmpty,after:()=>CONFIG.beforeAfter.after||STILLS.lvFinal,fallback:IMG.living}));

/* ---------------- project modal ---------------- */
const modal=$('#modal'),panel=$('#mPanel');let lastFocus=null;
function palOf(p){const arr=p.pal||PAL[p.img]||[];return arr;}
function openProject(id){
  const p=PROJECTS.find(x=>x.id===id);if(!p)return;lastFocus=document.activeElement;
  const g=p.gallery.filter(k=>imgSrc(k)||p.concept3d);
  panel.innerHTML='<button class="m-close" type="button" aria-label="Close project" data-close><svg width="18" height="18" viewBox="0 0 18 18" stroke="currentColor" stroke-width="1.6" fill="none"><path d="M3 3l12 12M15 3L3 15"/></svg></button>'+
    '<div class="m-grid"><div class="m-gallery"><div class="m-main" id="mMain"><img id="mMainImg" alt="'+esc(p.title)+'" decoding="async"></div><div class="m-thumbs" id="mThumbs" role="group" aria-label="Project images"></div></div>'+
    '<div class="m-info"><div><p class="m-loc">'+esc(p.cats.join(' \u00b7 '))+'</p><h2 id="mTitle">'+esc(p.title)+'</h2></div>'+
    '<div><h4>Project overview</h4><p>'+esc(p.overview)+'</p></div><div><h4>Design concept</h4><p>'+esc(p.concept)+'</p></div>'+
    '<div><h4>Materials</h4><div class="mat-tags">'+p.materials.map(m=>'<span>'+esc(m)+'</span>').join('')+'</div></div>'+
    '<div><h4>Colour palette</h4><div class="swatches">'+palOf(p).map(c=>'<div class="swatch"><i style="background:'+c+'"></i>'+c.toUpperCase()+'</div>').join('')+'</div></div>'+
    '<div><h4>Lighting concept</h4><p>'+esc(p.lighting)+'</p></div>'+
    '<dl class="m-facts"><div><dt>Location</dt><dd>'+esc(p.loc)+'</dd></div>'+p.details.map(d=>'<div><dt>'+esc(d[0])+'</dt><dd>'+esc(d[1])+'</dd></div>').join('')+'</dl></div></div>'+
    '<div class="m-extra"><h3>Before and after</h3><div id="mBA"></div><p class="ba-cap">Illustrative concept. Replace with this project\u2019s own before and after photographs.</p>'+
    (g.length>1?'<div class="m-renders" id="mRenders"></div>':'')+'</div>';
  $('#mBA').appendChild(makeBA({altB:'Empty room before design',altA:'Finished interior',before:()=>CONFIG.beforeAfter.before||STILLS.lvEmpty,after:()=>CONFIG.beforeAfter.after||STILLS.lvFinal,fallback:IMG.living}));
  const main=$('#mMainImg'),mm=$('#mMain'),th=$('#mThumbs');
  function show(k){const s=imgSrc(k);if(s)main.src=s;$$('button',th).forEach(b=>b.setAttribute('aria-current',b.dataset.k===k));mm.classList.remove('zoom');}
  g.forEach((k,i)=>{const b=h('button',{type:'button','data-k':k,'aria-label':'Show image '+(i+1)});b.innerHTML='<img data-img="'+k+'" alt="" decoding="async">';b.addEventListener('click',()=>show(k));th.appendChild(b);});
  const rn=$('#mRenders');if(rn)g.forEach(k=>{const b=h('button',{type:'button','aria-label':'View larger'});b.innerHTML='<img data-img="'+k+'" alt="'+esc(p.title)+' interior" decoding="async" loading="lazy">';b.addEventListener('click',()=>{show(k);mm.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});});rn.appendChild(b);});
  mm.addEventListener('click',()=>mm.classList.toggle('zoom'));
  mm.addEventListener('mousemove',e=>{const r=mm.getBoundingClientRect();main.style.setProperty('--ox',((e.clientX-r.left)/r.width*100)+'%');main.style.setProperty('--oy',((e.clientY-r.top)/r.height*100)+'%');});
  paintImgs(panel);show(g[0]||p.img);
  const upd=()=>{paintImgs(panel);if(!main.getAttribute('src')&&imgSrc(g[0]))main.src=imgSrc(g[0]);};stillWaiters.push(upd);modal._upd=upd;
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';panel.scrollTop=0;panel.focus();
}
function closeModal(){
  modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';
  const i=stillWaiters.indexOf(modal._upd);if(i>-1)stillWaiters.splice(i,1);if(lastFocus)lastFocus.focus();
}
modal.addEventListener('click',e=>{if(e.target.closest('[data-close]'))closeModal();});
document.addEventListener('keydown',e=>{
  if(!modal.classList.contains('open'))return;
  if(e.key==='Escape')closeModal();
  if(e.key==='Tab'){const f=$$('button,[href],input,[tabindex]:not([tabindex="-1"])',panel).filter(x=>!x.disabled&&x.offsetParent!==null);if(!f.length)return;const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&(document.activeElement===a||document.activeElement===panel)){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}
});

/* ---------------- materials ---------------- */
const matCache={};
function drawTex(cv,m,w,hh){
  const key=m.id+w+'x'+hh;let src=matCache[key];
  if(!src){const s=Math.max(w,hh);src=TX[m.tex](s,s,m.o);matCache[key]=src;}
  const ctx=cv.getContext('2d');cv.width=w;cv.height=hh;const s=src.width;ctx.drawImage(src,0,(s-s*hh/w)/2,s,s*hh/w,0,0,w,hh);
}
let matSel=0;
$('#matTiles').innerHTML='';
MATERIALS.forEach((m,i)=>{
  const b=h('button',{class:'mat-tile',type:'button','aria-pressed':i===0,'aria-label':m.name});b.innerHTML='<canvas aria-hidden="true"></canvas><span>'+esc(m.name)+'</span>';
  drawTex($('canvas',b),m,300,300);
  const pick=()=>selectMat(i);b.addEventListener('click',pick);b.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches)pick();});b.addEventListener('focus',pick);
  $('#matTiles').appendChild(b);
});
function selectMat(i){
  matSel=i;const m=MATERIALS[i];
  $$('#matTiles .mat-tile').forEach((b,j)=>b.setAttribute('aria-pressed',j===i));
  const d=$('#matDetail'),ph=m.photo,src=imgSrc(ph[0]);
  d.innerHTML='<div class="mat-prev"><canvas aria-label="'+esc(m.name)+' texture sample" role="img"></canvas></div><div><h3>'+esc(m.name)+'</h3><p>'+esc(m.desc)+'</p></div>'+
    '<div class="mat-tags">'+m.apps.map(a=>'<span>'+esc(a)+'</span>').join('')+'</div>'+
    '<div class="mat-ex"><div class="thumb" role="img" aria-label="'+esc(m.name)+' in a finished project" style="background-image:url('+(src||'')+');background-size:'+ph[2]+'%;background-position:'+ph[1]+'"></div><div><h4>In a finished project</h4><p>Detail from one of our project photographs.</p></div></div>';
  drawTex($('.mat-prev canvas',d),m,960,600);
}
selectMat(0);

/* ---------------- testimonials ---------------- */
$('#tmGrid').innerHTML=CONFIG.testimonials.map(t=>'<figure class="tm" style="margin:0"><span class="flag">Placeholder</span><blockquote>\u201c'+esc(t.quote)+'\u201d</blockquote><figcaption class="who">'+esc(t.who)+'<br>'+esc(t.meta)+'</figcaption></figure>').join('');

/* ---------------- contact ---------------- */
(function(){
  const c=CONFIG.contact;
  const fmt=n=>n.replace(/\D/g,'').slice(-10).replace(/(\d{5})(\d{5})/,'$1 $2');
  const links=(arr,mk)=>(arr||[]).map(n=>'<a href="'+mk(n.replace(/\D/g,'').slice(-10))+'">'+fmt(n)+'</a>').join('<span aria-hidden="true"> \u00b7 </span>');
  const ig=c.instagram?(c.instagramUrl?'<a href="'+esc(c.instagramUrl)+'" rel="noopener">'+esc(c.instagram)+'</a>':'<span>'+esc(c.instagram)+'</span>'):'';
  const rows=[
    ['Phone',links(c.phones,n=>'tel:+91'+n),'[Add phone number]'],
    ['WhatsApp',links(c.whatsapp,n=>'https://wa.me/91'+n),'[Add WhatsApp number]'],
    ['Email',c.email?'<a href="mailto:'+esc(c.email)+'">'+esc(c.email)+'</a>':'','[Add email address]'],
    ['Office',c.address?'<span>'+esc(c.address)+'</span>':'','[Add office address]'],
    ['Instagram',ig,'[Add Instagram handle]']
  ];
  $('#cList').innerHTML=rows.map(r=>'<li><span>'+r[0]+'</span>'+(r[1]?'<span>'+r[1]+'</span>':'<span class="empty">'+r[2]+'</span>')+'</li>').join('');
  $('#f-type').innerHTML='<option value="">Select project type</option>'+CONFIG.projectTypes.map(t=>'<option>'+esc(t)+'</option>').join('');
  $('#f-budget').innerHTML=CONFIG.budgets.map(t=>'<option>'+esc(t)+'</option>').join('');
  const form=$('#form'),st=$('#formStatus');
  form.addEventListener('submit',e=>{
    e.preventDefault();const f=new FormData(form),err={};
    if(!(f.get('name')||'').trim())err.name='Please enter your name.';
    if((f.get('phone')||'').replace(/\D/g,'').length<7)err.phone='Please enter a valid phone number.';
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((f.get('email')||'').trim()))err.email='Please enter a valid email address.';
    if(!f.get('type'))err.type='Please choose a project type.';
    $$('.err',form).forEach(x=>x.textContent=err[x.dataset.err]||'');
    st.className='form-status';
    if(Object.keys(err).length){st.textContent='Please fix the highlighted fields.';const first=form.querySelector('[name="'+Object.keys(err)[0]+'"]');if(first)first.focus();return;}
    const body='Name: '+f.get('name')+'\nPhone: '+f.get('phone')+'\nEmail: '+f.get('email')+'\nProject type: '+f.get('type')+'\nBudget: '+f.get('budget')+'\n\n'+(f.get('message')||'');
    if(CONFIG.formEmail){location.href='mailto:'+CONFIG.formEmail+'?subject='+encodeURIComponent('Consultation request \u2014 '+f.get('type'))+'&body='+encodeURIComponent(body);st.textContent='Opening your email app with the details filled in\u2026';st.className='form-status ok';}
    else{st.textContent='Thank you, '+String(f.get('name')).trim()+'. This preview form is not connected to an inbox yet. Set CONFIG.formEmail or connect a form service before launch.';st.className='form-status ok';form.reset();}
  });
})();

/* ---------------- parallax + scroll effects ---------------- */
const paras=$$('[data-parallax]'),tl=$('#timeline'),tfSec=$('#transform');
let ticking=false;
function onScroll(){
  navState();
  if(!reduce)paras.forEach(el=>{const r=el.getBoundingClientRect();if(r.bottom<-100||r.top>innerHeight+100)return;el.style.transform='translateY('+(-(r.top+r.height/2-innerHeight/2)*parseFloat(el.dataset.parallax)).toFixed(1)+'px)';});
  const r=tl.getBoundingClientRect();tl.style.setProperty('--fill',clamp((innerHeight*.75-r.top)/Math.max(r.height,1),0,1).toFixed(3));
}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{ticking=false;onScroll();});}},{passive:true});

/* ---------------- 3D ---------------- */
const STAGES=['Empty room','Flooring','Walls','Ceiling','Lighting','Furniture','Decorative elements','Final interior'],STAGE_AT=[0,.10,.24,.40,.52,.66,.82,.94];
$('#tfRail').innerHTML=STAGES.map(s=>'<li>'+s+'</li>').join('');
function stageOf(p){let k=0;STAGE_AT.forEach((a,i)=>{if(p>=a)k=i;});return k;}
let lastStage=-1;
function setStageUI(p){
  const k=stageOf(p);if(k!==lastStage){lastStage=k;$('#tfName').textContent=STAGES[k];$$('#tfRail li').forEach((li,i)=>li.classList.toggle('on',i<=k));}
  $('#tfHint').style.opacity=p>.02?0:1;
}
function tfProgress(){const r=tfSec.getBoundingClientRect(),total=r.height-innerHeight;return clamp(-r.top/Math.max(total,1),0,1);}

const views=[];
function watch(el,view){new IntersectionObserver(es=>{view.visible=es[0].isIntersecting;},{rootMargin:'100px'}).observe(el);views.push(view);}
let S=null;
if(GL){try{S=makeScenes();}catch(e){console.warn('3D unavailable',e);S=null;}}

/* hero */
const heroEl=$('#home');
(function(){
  let ok=false;
  if(S){try{
    const hv=S.createHero($('#heroCanvas'),{lite,dpr,exposure:1});
    const view={visible:true,render:dt=>hv.render(dt),resize:hv.resize};watch(heroEl,view);
    if(reduce)hv.renderOnce();hv.renderOnce();heroEl.classList.add('ready');ok=true;
  }catch(e){console.warn('hero 3D failed',e);}}
  if(!ok){
    const po=$('.hero-poster');po.innerHTML='<img data-img="living" alt="" decoding="async">';paintImgs(po);heroEl.classList.add('ready');$('#heroCanvas').remove();$('#heroNote').textContent='';
    if(!reduce)addEventListener('scroll',()=>{$('.hero-poster img').style.transform='scale(1.08) translateY('+(scrollY*.12)+'px)';},{passive:true});
  }
})();

/* showroom */
(function(){
  const stage=$('#stage'),info=$('#srInfo'),tabs=$('#roomTabs'),back=$('#srBack'),pins=$('#pins'),hint=$('#stageHint');
  const intro='<h3>The showroom apartment</h3><p class="lede" style="font-size:1.1rem">A virtual apartment with five rooms. Rotate it, then select a room to walk in.</p><dl><div><dt>Rooms</dt><dd>Living room, modular kitchen, office, master bedroom and bathroom.</dd></div><div><dt>Design concepts</dt><dd>Each room shows its design, materials, lighting and furniture. These are concept designs, not completed projects.</dd></div></dl>';
  info.innerHTML=intro;
  let sv=null;
  function pick(i){
    const room=ROOM_INFO[ROOM_ORDER[i]];
    if(sv)sv.setMode(i);
    stage.classList.add('inside');back.hidden=false;hint.textContent='Drag to look around';
    $$('.pin',pins).forEach((b,j)=>b.setAttribute('aria-pressed',j===i));$$('.chip',tabs).forEach((b,j)=>b.setAttribute('aria-pressed',j===i));
    info.innerHTML='<h3>'+esc(room.name)+'</h3><p class="lede" style="font-size:1.1rem">'+esc(room.concept)+'</p><dl><div><dt>Design</dt><dd>'+esc(room.design)+'</dd></div><div><dt>Materials</dt><dd>'+esc(room.materials)+'</dd></div><div><dt>Lighting</dt><dd>'+esc(room.lighting)+'</dd></div><div><dt>Furniture</dt><dd>'+esc(room.furniture)+'</dd></div></dl>';
    if(!sv)stage.style.backgroundImage='url('+(imgSrc(FALL[ROOM_ORDER[i]])||'')+')';
  }
  function overview(){
    if(sv)sv.setMode(-1);stage.classList.remove('inside');back.hidden=true;hint.textContent='Drag to rotate \u00b7 Ctrl + scroll to zoom';
    $$('.pin',pins).forEach(b=>b.setAttribute('aria-pressed','false'));$$('.chip',tabs).forEach(b=>b.setAttribute('aria-pressed','false'));info.innerHTML=intro;
  }
  const FALL={living:'living',kitchen:'kitchen',office:'suite',bedroom:'bedroom',bathroom:'reception'};
  ROOM_ORDER.forEach((id,i)=>{
    const p=h('button',{class:'pin',type:'button','aria-pressed':'false'},esc(ROOM_INFO[id].name));p.addEventListener('click',()=>pick(i));pins.appendChild(p);
    const t=h('button',{class:'chip',type:'button','aria-pressed':'false'},esc(ROOM_INFO[id].name));t.addEventListener('click',()=>pick(i));tabs.appendChild(t);
  });
  back.addEventListener('click',overview);
  if(S){try{
    sv=S.createShowroom($('#srCanvas'),stage,{lite,dpr},pick);
    const pos={x:0,y:0,vis:false},pinEls=$$('.pin',pins);
    watch(stage,{visible:false,resize:sv.resize,render(dt){sv.render(dt);
      pinEls.forEach((el,i)=>{sv.project(i,pos);el.style.transform='translate('+pos.x.toFixed(1)+'px,'+pos.y.toFixed(1)+'px) translate(-50%,-50%)';el.style.opacity=pos.vis?1:0;el.style.pointerEvents=pos.vis?'auto':'none';});}});
  }catch(e){console.warn('showroom 3D failed',e);sv=null;}}
  if(!sv){
    $('#srCanvas').remove();pins.remove();stage.style.cssText+=';background-size:cover;background-position:center;cursor:default';
    stage.style.backgroundImage='url('+(imgSrc('living')||'')+')';hint.textContent='3D view is not available on this device. Showing project photographs.';
  }
})();

/* transformation */
(function(){
  const sticky=$('.tf-sticky');let tv=null;
  if(S){try{
    tv=S.createTransform($('#tfCanvas'),{lite,dpr:Math.min(dpr,1.5)});
    watch(tfSec,{visible:false,resize:tv.resize,render(){const p=tfProgress();tv.setP(p);tv.render();setStageUI(p);}});
  }catch(e){console.warn('transform 3D failed',e);tv=null;}}
  if(!tv){
    $('#tfCanvas').remove();const im=h('img','tf-img');im.setAttribute('data-img','living');im.alt='';sticky.prepend(im);paintImgs(sticky);
    addEventListener('scroll',()=>{const p=tfProgress();im.style.filter='grayscale('+(1-p).toFixed(2)+') brightness('+(.55+.45*p).toFixed(2)+') contrast('+(.7+.3*p).toFixed(2)+')';setStageUI(p);},{passive:true});
    setStageUI(0);
  }else setStageUI(0);
})();

/* main render loop */
let lastT=performance.now();
function loop(t){
  const dt=Math.min(.1,(t-lastT)/1000);lastT=t;
  if(!document.hidden)views.forEach(v=>{if(v.visible){try{v.render(dt);}catch(e){v.visible=false;console.warn('render error',e);}}});
  requestAnimationFrame(loop);
}
if(views.length)requestAnimationFrame(loop);
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{views.forEach(v=>v.resize&&v.resize());onScroll();},150);});

/* concept renders (offscreen, after the page has settled) */
renderProjects();
if(S){
  const go=()=>{try{S.renderStills({lite,w:lite?960:1280,h:lite?600:800},onStill,()=>{},onStillsFail);}catch(e){console.warn('stills failed',e);}};
  const start=()=>setTimeout(go,900);
  if(document.readyState==='complete')start();else addEventListener('load',start);
}
paintImgs(document);
onScroll();
})();
