/* ---------- 3D scenes (three.js r128, UMD build) ---------- */
function makeScenes(){
const T=window.THREE;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const easeOut=t=>1-Math.pow(1-t,3);
const M=o=>new T.MeshStandardMaterial(o);
function B(color,mul){const c=new T.Color(color).multiplyScalar(mul||1);const m=new T.MeshBasicMaterial({color:c.clone()});m.userData.glow=true;m.userData.base=c.toArray();return m;}
const _cv={};function cv(k,f){return _cv[k]||(_cv[k]=f());}
function tex(c,rx,ry){const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;}
function mesh(geo,mat,x,y,z,o){o=o||{};const m=new T.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.castShadow=o.cast!==false;m.receiveShadow=o.recv!==false;if(o.rx)m.rotation.x=o.rx;if(o.ry)m.rotation.y=o.ry;if(o.rz)m.rotation.z=o.rz;return m;}
const bx=(w,h,d,mat,x,y,z,o)=>mesh(new T.BoxGeometry(w,h,d),mat,x,y,z,o);
const cyl=(rt,rb,h,mat,x,y,z,o,s)=>mesh(new T.CylinderGeometry(rt,rb,h,s||28),mat,x,y,z,o);
const pln=(w,h,mat,x,y,z,o)=>mesh(new T.PlaneGeometry(w,h),mat,x,y,z,o);
const _g={};
function rboxGeo(w,h,d,r){
  const key=[w,h,d,r].join('_');if(_g[key])return _g[key];
  const b=Math.min(r,w/2-.002,h/2-.002,d/2-.002),iw=w-2*b,ih=h-2*b,rr=Math.max(.001,Math.min(b*.9,iw/2,ih/2));
  const x=-iw/2,y=-ih/2,s=new T.Shape();
  s.moveTo(x+rr,y);s.lineTo(x+iw-rr,y);s.quadraticCurveTo(x+iw,y,x+iw,y+rr);s.lineTo(x+iw,y+ih-rr);s.quadraticCurveTo(x+iw,y+ih,x+iw-rr,y+ih);
  s.lineTo(x+rr,y+ih);s.quadraticCurveTo(x,y+ih,x,y+ih-rr);s.lineTo(x,y+rr);s.quadraticCurveTo(x,y,x+rr,y);
  const dep=Math.max(.001,d-2*b);
  const g=new T.ExtrudeGeometry(s,{depth:dep,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:3,curveSegments:5});
  g.translate(0,0,-dep/2);return(_g[key]=g);
}
const rb=(w,h,d,r,mat,x,y,z,o)=>mesh(rboxGeo(w,h,d,r),mat,x,y,z,o);

/* exposure auto-calibration (keeps blind-tuned lighting from being too dark/bright) */
const probe=document.createElement('canvas');probe.width=32;probe.height=18;
const pctx=probe.getContext('2d',{willReadFrequently:true});
function meanLum(c){try{pctx.drawImage(c,0,0,32,18);const d=pctx.getImageData(0,0,32,18).data;let s=0;for(let i=0;i<d.length;i+=4)s+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];return s/(d.length/4)/255;}catch(e){return-1;}}
function autoExpose(r,scene,cam,target,iters){
  let L=-1;
  for(let i=0;i<(iters||4);i++){
    r.render(scene,cam);L=meanLum(r.domElement);if(L<0)return L;
    if(L<.015){r.toneMappingExposure=clamp(r.toneMappingExposure*2.5,.3,4);continue;}
    if(Math.abs(L-target)<.025)break;
    r.toneMappingExposure=clamp(r.toneMappingExposure*Math.pow(target/L,.85),.3,4);
  }
  r.render(scene,cam);L=meanLum(r.domElement);
  if(L>=0&&L<.03)throw new Error('3D render looks blank');
  return L;
}
function makeRenderer(canvas,o){
  const r=new T.WebGLRenderer({canvas,antialias:!o.lite,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:!!o.keep});
  r.setPixelRatio(o.dpr||1);r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=o.exposure||1;
  r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;return r;
}
function makeEnv(renderer){
  const pm=new T.PMREMGenerator(renderer),es=new T.Scene();
  es.add(new T.Mesh(new T.BoxGeometry(24,12,24),new T.MeshBasicMaterial({color:0x5b524a,side:T.BackSide})));
  const lm=(c,i)=>new T.MeshBasicMaterial({color:new T.Color(c).multiplyScalar(i),side:T.DoubleSide});
  const p1=new T.Mesh(new T.PlaneGeometry(12,7),lm(0xdfeaff,3.2));p1.position.set(-11.8,4,0);p1.rotation.y=Math.PI/2;es.add(p1);
  const p2=new T.Mesh(new T.PlaneGeometry(14,10),lm(0xffe0b8,2.2));p2.position.set(0,5.9,0);p2.rotation.x=Math.PI/2;es.add(p2);
  const p3=new T.Mesh(new T.PlaneGeometry(10,4),lm(0xffd6a0,1.4));p3.position.set(11.8,3,0);p3.rotation.y=-Math.PI/2;es.add(p3);
  const rt=pm.fromScene(es,.04);pm.dispose();return rt.texture;
}

/* ---------- shared materials ---------- */
function floorMat(kind,w,d){
  if(kind==='oak')return M({map:tex(cv('oakf',()=>TX.wood(512,512,{base:'#b48c5c',dark:'#7a5430',planks:6,seed:3})),w,d),roughness:.4});
  if(kind==='tile')return M({map:tex(cv('tilef',()=>TX.tile(512,512,{n:2,base:'#dcd6cb'})),w/1.2,d/1.2),roughness:.28});
  if(kind==='dark')return M({map:tex(cv('darkf',()=>TX.marble(512,512,{base:'#26272a',vein:'#b9a27a',veins:7,strength:1.2,seed:8})),w/2,d/2),roughness:.16});
  if(kind==='carpet')return M({map:tex(cv('carp',()=>TX.fabric(256,256,{base:'#6b6862'})),w*1.4,d*1.4),roughness:1});
  if(kind==='concrete')return M({map:tex(cv('conc',()=>TX.concrete(512,512)),w/2,d/2),roughness:.95});
  return M({color:0xcccccc});
}
function slatMat(w){return M({map:tex(cv('slat',()=>TX.slats(512,512,{n:16})),w/.96,1),roughness:.5});}
function makeMats(){
  const m={};
  m.walnut=M({map:tex(cv('wal',()=>TX.wood(512,512,{base:'#7b4d2b',dark:'#3d2211',planks:5,seed:12})),1,1),roughness:.42});
  m.oak=M({map:tex(cv('oakm',()=>TX.wood(512,512,{base:'#b9925f',dark:'#7a5430',planks:4,seed:14})),1,1),roughness:.45});
  m.paint=M({color:0xeee8dd,roughness:.92});m.paintB=M({color:0xd9ccb7,roughness:.92});m.paintD=M({color:0x34322f,roughness:.85});
  m.charc=M({color:0x2d2c2b,roughness:.5,metalness:.05});m.charcM=M({color:0x3b3a38,roughness:.8});
  m.marbleW=M({map:tex(cv('mw',()=>TX.marble(512,512,{})),1,1),roughness:.2});
  m.marbleB=M({map:tex(cv('mb',()=>TX.marble(512,512,{base:'#1a1b1d',vein:'#c9b38a',veins:8,strength:1.3,seed:5})),1,1),roughness:.18});
  m.brass=M({color:0xb8925a,roughness:.28,metalness:.95});m.chrome=M({color:0xd9d9d6,roughness:.16,metalness:1});
  m.black=M({color:0x0d0d0e,roughness:.2,metalness:.2});m.white=M({color:0xf3f1ec,roughness:.3});
  m.fabric=M({map:tex(cv('fab',()=>TX.fabric(256,256,{base:'#cfc2ae'})),3,3),roughness:.95});
  m.fabricD=M({map:tex(cv('fabd',()=>TX.fabric(256,256,{base:'#6f6a60'})),3,3),roughness:.95});
  m.fabricG=M({map:tex(cv('fabg',()=>TX.fabric(256,256,{base:'#8d9585'})),3,3),roughness:.95});
  m.leather=M({color:0x76503a,roughness:.5});
  m.glass=M({color:0xcfe3ea,roughness:.05,metalness:0,transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false});
  m.leaf=M({color:0x466f3e,roughness:.6});m.leaf2=M({color:0x5e8c4c,roughness:.6});m.pot=M({color:0xe6e0d6,roughness:.55});
  m.mirror=M({color:0xe3eaee,roughness:.04,metalness:1});
  m.warm=B(0xffd39a,1.7);m.warmSoft=B(0xffc47f,1.2);m.sky=new T.MeshBasicMaterial({map:tex(cv('sky',()=>TX.sky()),1,1)});
  m.win=B(0xfff6e6,1.9);
  return m;
}

/* ---------- props ---------- */
function plant(m,h,seed){
  const g=new T.Group(),r=rng(seed||1);
  g.add(cyl(.2*h/1.6+.05,.15*h/1.6+.04,.4*h/1.6+.1,m.pot,0,(.4*h/1.6+.1)/2,0));
  const top=.4*h/1.6+.1;g.add(cyl(.016,.024,h-top,m.walnut,0,top+(h-top)/2,0,{cast:false},8));
  const n=Math.round(10+h*6);
  for(let i=0;i<n;i++){
    const y=top+(h-top)*(.3+.7*r()),a=r()*6.283,pv=new T.Group();pv.position.set(0,y,0);pv.rotation.y=a;
    const lf=mesh(new T.SphereGeometry(1,10,6),i%3?m.leaf:m.leaf2,.1+.13*(y/h),0,0,{recv:false});
    lf.scale.set(.17+r()*.08,.022,.1+r()*.04);lf.rotation.z=.35+r()*.5;pv.add(lf);g.add(pv);
  }
  return g;
}
function pendant(g,m,x,y,z,len,rad){
  g.add(cyl(.004,.004,len,m.brass,x,y+len/2+rad,z,{cast:false},6));
  g.add(mesh(new T.SphereGeometry(rad,16,12),m.warm,x,y,z,{cast:false,recv:false}));
  g.add(cyl(rad*.35,rad*.35,.05,m.brass,x,y+rad+.02,z,{cast:false},12));
}
function sofa(m,L,fab,dep){
  const g=new T.Group();dep=dep||1;
  g.add(rb(L,.34,dep,.07,fab,0,.3,0));
  g.add(rb(L,.6,.28,.1,fab,0,.72,-dep/2+.14));
  [-1,1].forEach(s=>g.add(rb(.26,.58,dep,.1,fab,s*(L/2-.13),.5,0)));
  const cw=(L-.6)/3;
  for(let i=0;i<3;i++){
    g.add(rb(cw-.02,.17,dep-.3,.07,fab,-cw+i*cw,.55,.1));
    const bk=rb(cw-.04,.44,.2,.08,fab,-cw+i*cw,.86,-dep/2+.32);bk.rotation.x=-.14;g.add(bk);
  }
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(a=>g.add(cyl(.02,.02,.12,m.brass,a[0]*(L/2-.1),.06,a[1]*(dep/2-.1),{cast:false},8)));
  return g;
}
function armchair(m,fab){
  const g=new T.Group();
  g.add(rb(.85,.3,.85,.09,fab,0,.36,0));g.add(rb(.85,.6,.2,.09,fab,0,.72,-.33));
  [-1,1].forEach(s=>g.add(rb(.14,.36,.7,.06,fab,s*.36,.54,.05)));
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(a=>g.add(cyl(.018,.014,.2,m.brass,a[0]*.34,.1,a[1]*.34,{cast:false},8)));
  return g;
}
function books(g,m,x,y,z,n,r,maxh){
  const cols=[0x8a6a4a,0x33413f,0xc9b79a,0x6d3b32,0xa4a89a,0x2e2e30];
  let cx=x;for(let i=0;i<n;i++){const w=.03+r()*.035,h=(maxh||.26)*(.6+r()*.4);g.add(bx(w,h,.2,M({color:cols[Math.floor(r()*cols.length)],roughness:.7}),cx+w/2,y+h/2,z,{cast:false}));cx+=w+.004;}
}

/* =====================================================================
   1. LIVING ROOM  (hero + transformation + stills)
   ===================================================================== */
function buildLiving(renderer,o){
  o=o||{};
  const scene=new T.Scene();scene.background=new T.Color(0x100f0d);scene.environment=makeEnv(renderer);
  const m=makeMats(),root=new T.Group();scene.add(root);
  const W=8,D=7,H=3.2,X0=-4,X1=4,Z0=-5,Z1=2,parts=[],ramps=[];
  const camera=new T.PerspectiveCamera(42,16/9,.1,80);

  function reg(obj,a,b,mode){
    obj.traverse(c=>{if(c.isMesh){c.material=c.material.clone();c.material.userData.o0=c.material.opacity;c.material.userData.t0=c.material.transparent;}});
    parts.push({obj,a,b,mode,y0:obj.position.y,s0:obj.scale.clone()});root.add(obj);return obj;
  }
  function G(){return new T.Group();}

  /* raw shell (always visible) */
  const raw=M({map:tex(cv('rawc',()=>TX.concrete(512,512,{base:'#8f8c86'})),3,1.2),roughness:.96});
  const rawF=floorMat('concrete',W,D);
  root.add(mesh(new T.PlaneGeometry(W,D),rawF,0,0,(Z0+Z1)/2,{cast:false,rx:-Math.PI/2}));
  root.add(bx(W,H,.2,raw,0,H/2,Z0-.1));
  root.add(bx(.2,H,D,raw,X1+.1,H/2,(Z0+Z1)/2));
  const oz0=-3.9,oz1=.9;
  root.add(bx(.2,H,oz0-Z0,raw,X0-.1,H/2,(Z0+oz0)/2));
  root.add(bx(.2,H,Z1-oz1,raw,X0-.1,H/2,(oz1+Z1)/2));
  root.add(bx(.2,.1,oz1-oz0,raw,X0-.1,.05,(oz0+oz1)/2));
  root.add(bx(.2,H-2.95,oz1-oz0,raw,X0-.1,2.95+(H-2.95)/2,(oz0+oz1)/2));
  root.add(bx(W+.4,.2,D+.4,raw,0,H+.1,(Z0+Z1)/2));
  /* outside view */
  const sky=mesh(new T.PlaneGeometry(34,15),m.sky,-10,4,-1.5,{cast:false,recv:false,ry:Math.PI/2});root.add(sky);

  /* --- STAGE 1: flooring --- */
  const fl=G();const fm=mesh(new T.PlaneGeometry(W,D),floorMat('oak',W,D),X0,.012,(Z0+Z1)/2,{cast:false,rx:-Math.PI/2});
  fm.geometry.translate(W/2,0,0);fm.position.x=0;fl.add(fm);fl.position.x=X0;reg(fl,.1,.24,'wipeX');
  /* --- STAGE 2: walls --- */
  const paint=G();
  paint.add(pln(W,H,m.paint,0,H/2,Z0+.012,{cast:false}));
  paint.add(pln(D,H,m.paint,X1-.012,H/2,(Z0+Z1)/2,{cast:false,ry:-Math.PI/2}));
  [[Z0,oz0,0,H],[oz1,Z1,0,H]].forEach(s=>paint.add(pln(s[1]-s[0],H,m.paint,X0+.012,H/2,(s[0]+s[1])/2,{cast:false,ry:Math.PI/2})));
  paint.add(pln(oz1-oz0,.1,m.paint,X0+.012,.05,(oz0+oz1)/2,{cast:false,ry:Math.PI/2}));
  paint.add(pln(oz1-oz0,H-2.95,m.paint,X0+.012,2.95+(H-2.95)/2,(oz0+oz1)/2,{cast:false,ry:Math.PI/2}));
  reg(paint,.24,.31,'fade');
  const slatG=G();const sg=new T.PlaneGeometry(4.4,2.95);sg.translate(0,2.95/2,0);
  slatG.add(mesh(sg,slatMat(4.4),-1,0,Z0+.03,{cast:false}));slatG.position.y=0;reg(slatG,.29,.37,'wipeY');
  const marG=G();const mg=new T.PlaneGeometry(2.8,2.95);mg.translate(0,2.95/2,0);
  marG.add(mesh(mg,m.marbleW,2.6,0,Z0+.03,{cast:false}));reg(marG,.33,.4,'wipeY');
  const frames=G();
  [-4.05,-2.75,-1.45,-.15,1.15].forEach(z=>{
    const t=.045,fw=1.1,fh=1.7,cy0=1.9;
    frames.add(bx(.03,t,fw,m.white,X1-.03,cy0+fh/2,z,{cast:false}));frames.add(bx(.03,t,fw,m.white,X1-.03,cy0-fh/2,z,{cast:false}));
    frames.add(bx(.03,fh,t,m.white,X1-.03,cy0,z-fw/2,{cast:false}));frames.add(bx(.03,fh,t,m.white,X1-.03,cy0,z+fw/2,{cast:false}));
    frames.add(bx(.012,fh-.16,fw-.16,m.paintB,X1-.02,cy0,z,{cast:false}));
  });
  reg(frames,.3,.38,'fade');
  const wf=G();
  const wfm=m.charc;
  [oz0,oz0+1.2,oz0+2.4,oz0+3.6,oz1].forEach(z=>wf.add(bx(.06,2.85,.06,wfm,X0+.04,1.525,z)));
  [.1,2.95].forEach(y=>wf.add(bx(.06,.06,oz1-oz0,wfm,X0+.04,y,(oz0+oz1)/2)));
  wf.add(bx(.06,.04,oz1-oz0,wfm,X0+.04,2.1,(oz0+oz1)/2));
  reg(wf,.34,.4,'fade');

  /* --- STAGE 3: ceiling --- */
  const ce=G();
  ce.add(bx(6.4,.12,5.4,m.paint,0,H-.14,-1.5,{recv:true}));
  reg(ce,.4,.52,'lower');

  /* --- STAGE 4: lighting --- */
  const cove=G();
  const cs=B(0xffd08a,2.0),cw=6.52,cd=5.52,cz=-1.5,cyv=H-.06;
  cove.add(bx(cw,.03,.05,cs,0,cyv,cz-cd/2,{cast:false}));cove.add(bx(cw,.03,.05,cs,0,cyv,cz+cd/2,{cast:false}));
  cove.add(bx(.05,.03,cd,cs,-cw/2,cyv,cz,{cast:false}));cove.add(bx(.05,.03,cd,cs,cw/2,cyv,cz,{cast:false}));
  reg(cove,.52,.58,'glow');
  const track=G();const ts=B(0xfff0d8,2.4);
  track.add(bx(4.2,.012,.03,ts,0,2.994,-3.3,{cast:false}));track.add(bx(4.2,.012,.03,ts,0,2.994,.3,{cast:false}));
  track.add(bx(.03,.012,3.6,ts,-2.1,2.994,-1.5,{cast:false}));track.add(bx(.03,.012,3.6,ts,2.1,2.994,-1.5,{cast:false}));
  reg(track,.55,.61,'glow');
  const dl=G();const ds=B(0xfff0d8,2.6);
  [[-2.4,-3.9],[0,-3.9],[2.4,-3.9],[-2.4,-.9],[0,-.9],[2.4,-.9],[-1.2,-2.4],[1.2,-2.4]].forEach(p=>dl.add(cyl(.07,.07,.015,ds,p[0],2.993,p[1],{cast:false},18)));
  reg(dl,.57,.63,'glow');
  const led=G();const ls=B(0xffc27a,2.2);
  led.add(bx(.03,2.95,.02,ls,-3.2,1.475,Z0+.04,{cast:false}));led.add(bx(.03,2.95,.02,ls,1.2,1.475,Z0+.04,{cast:false}));
  led.add(bx(4.4,.02,.02,ls,-1,.06,Z0+.04,{cast:false}));
  reg(led,.6,.66,'glow');
  const ch=G();
  [.55,.38,.22].forEach((r,i)=>{const t=mesh(new T.TorusGeometry(r,.014,8,56),B(0xffe2b0,2.4),0,-i*.13,0,{cast:false,recv:false,rx:Math.PI/2});ch.add(t);});
  ch.add(cyl(.05,.05,.06,m.brass,0,.05,0,{cast:false},12));
  [0,2.1,4.2].forEach(a=>ch.add(cyl(.003,.003,.85,m.brass,Math.cos(a)*.3,.5,Math.sin(a)*.3,{cast:false},4)));
  ch.position.set(1.6,2.25,-2.3);reg(ch,.58,.66,'drop');
  const lightsG=[];
  function pl(color,int,dist,x,y,z){const l=new T.PointLight(color,0,dist,1.6);l.position.set(x,y,z);root.add(l);ramps.push({l,t:int,a:.52,b:.66});return l;}
  pl(0xffc98f,1.1,9,1.6,2.15,-2.3);pl(0xffcf95,.8,8,0,H-.3,-3.6);pl(0xffcf95,.8,8,0,H-.3,-.4);
  if(!o.lite)pl(0xffb56b,.9,4.5,-1,1.2,Z0+.4);

  /* --- STAGE 5: furniture --- */
  const sf=sofa(m,3.5,m.fabric,1.05);sf.position.set(3.35,0,-2.3);sf.rotation.y=-Math.PI/2;reg(sf,.66,.75,'drop');
  const a1=armchair(m,m.leather);a1.position.set(-.2,0,-.9);a1.rotation.y=Math.PI/2+.25;reg(a1,.7,.78,'drop');
  const a2=armchair(m,m.leather);a2.position.set(-.2,0,-3.7);a2.rotation.y=Math.PI/2-.25;reg(a2,.72,.8,'drop');
  const ct=G();ct.add(cyl(.62,.62,.045,m.marbleW,0,.42,0,null,48));ct.add(cyl(.16,.2,.4,m.brass,0,.2,0));ct.add(cyl(.34,.34,.03,m.marbleB,-.9,.28,.75,null,40));ct.add(cyl(.05,.05,.26,m.brass,-.9,.14,.75));
  ct.position.set(1.7,0,-2.3);reg(ct,.74,.82,'drop');
  const con=G();con.add(rb(3.2,.4,.44,.03,m.walnut,0,.5,0));con.add(bx(3.0,.02,.36,m.brass,0,.28,0,{cast:false}));
  con.add(bx(1.9,1.1,.05,m.black,0,1.55,-.36));con.add(bx(1.94,1.14,.02,m.charc,0,1.55,-.39));
  con.position.set(-1,0,Z0+.55);reg(con,.68,.78,'drop');
  const st=G();st.add(cyl(.3,.3,.5,m.marbleB,0,.25,0,null,32));st.position.set(3.4,0,-.35);reg(st,.76,.83,'drop');

  /* --- STAGE 6: decor --- */
  const rug=G();rug.add(pln(4.4,3.4,M({map:tex(cv('rug',()=>TX.rug(512,512)),1,1),roughness:1}),0,.014,0,{cast:false,rx:-Math.PI/2}));
  rug.position.set(1.2,0,-2.3);reg(rug,.82,.87,'fade');
  const r1=rng(4);
  [[-3.4,Z0+.5,2.0,1],[3.4,1.3,1.5,2],[-3.3,1.2,1.1,3]].forEach((p,i)=>{const pg=plant(m,p[2],p[3]);pg.position.set(p[0],0,p[1]);reg(pg,.83+i*.02,.9+i*.02,'grow');});
  const pil=G();
  [[.22,-1.3,.28,.5],[.15,-.9,.32,.85],[-.15,-3.7,.4,.55]].forEach((p,i)=>{
    const pw=rb(.14,.44,.44,.06,i===1?m.fabricG:m.fabricD,3.3-p[0]*.4,.72,p[1]+.0);pw.rotation.z=(i-1)*.12;pil.add(pw);
  });
  reg(pil,.84,.9,'drop');
  const vs=G();
  vs.add(cyl(.09,.06,.34,m.marbleW,-1.9,1.03,Z0+.5));vs.add(cyl(.06,.09,.28,m.brass,-.2,.98,Z0+.5));vs.add(bx(.5,.06,.3,m.charc,.7,.73,Z0+.55));
  books(vs,m,.55,.75,Z0+.55,4,r1,.22);vs.add(cyl(.22,.22,.02,m.brass,1.7,.46,-2.3,{cast:false}));
  reg(vs,.85,.91,'fade');
  const art=G();art.add(bx(1.15,1.55,.05,m.charc,2.6,1.85,Z0+.05));
  art.add(pln(1.02,1.42,M({map:tex(cv('art',()=>TX.art(384,512)),1,1),roughness:.8}),2.6,1.85,Z0+.08,{cast:false}));reg(art,.86,.92,'fade');
  const cur=G();
  for(let i=0;i<4;i++){
    const cg=new T.PlaneGeometry(1.2,2.95,26,1),p=cg.attributes.position;
    for(let k=0;k<p.count;k++)p.setZ(k,Math.sin(p.getX(k)*Math.PI*6)*.045);
    cg.computeVertexNormals();
    const cm=M({color:0xf4efe6,roughness:1,transparent:true,opacity:.62,side:T.DoubleSide,depthWrite:false});
    cur.add(mesh(cg,cm,X0+.2,1.5,oz0+.6+i*1.2,{cast:false,ry:Math.PI/2}));
  }
  reg(cur,.87,.93,'fade');
  const lamp=G();lamp.add(cyl(.15,.17,.02,m.brass,0,.01,0));lamp.add(cyl(.011,.011,1.5,m.brass,0,.76,0,null,8));
  const lsh=mesh(new T.CylinderGeometry(.2,.26,.3,28,1,true),M({color:0xf3e8d4,roughness:.9,side:T.DoubleSide,emissive:0xffb060,emissiveIntensity:.7}),0,1.6,0,{cast:false});lamp.add(lsh);
  lamp.position.set(3.35,0,-4.5);reg(lamp,.88,.94,'drop');
  const pf=G();pf.add(cyl(.32,.34,.4,m.fabricG,0,.22,0,null,32));pf.position.set(.7,0,-3.3);reg(pf,.9,.94,'grow');
  const tl=G();tl.add(cyl(.05,.07,.28,m.brass,0,.14,0));tl.add(mesh(new T.SphereGeometry(.14,16,12),m.warm,0,.42,0,{cast:false}));tl.position.set(3.4,.5,-.35);reg(tl,.9,.95,'grow');

  /* lights: sun + ambient */
  root.add(new T.HemisphereLight(0xfff1de,0x5b4d3f,.32));
  const sun=new T.DirectionalLight(0xfff0dd,2.3);sun.position.set(-13,9,-1.5);sun.target.position.set(0,0,-1.5);root.add(sun,sun.target);
  sun.castShadow=true;sun.shadow.mapSize.set(o.lite?1024:2048,o.lite?1024:2048);
  const sc=sun.shadow.camera;sc.left=-12;sc.right=12;sc.top=12;sc.bottom=-12;sc.near=1;sc.far=40;sun.shadow.bias=-.0006;sun.shadow.normalBias=.03;

  function setOp(obj,v){obj.traverse(c=>{if(c.isMesh){const mt=c.material;mt.opacity=(mt.userData.o0!==undefined?mt.userData.o0:1)*v;mt.transparent=v<.999||!!mt.userData.t0;}});}
  function setGlow(obj,e){obj.traverse(c=>{if(c.isMesh&&c.material.userData.glow){const b=c.material.userData.base;c.material.color.setRGB(b[0]*e,b[1]*e,b[2]*e);}});}
  function apply(P,t){
    const ob=P.obj;if(t<=0){ob.visible=false;return;}ob.visible=true;const e=easeOut(t);
    switch(P.mode){
      case'fade':setOp(ob,t);break;
      case'drop':ob.position.y=P.y0+(1-e)*1.5;setOp(ob,Math.min(1,t*2.5));break;
      case'lower':ob.position.y=P.y0+(1-e)*.6;setOp(ob,t);break;
      case'grow':ob.scale.set(P.s0.x*Math.max(e,.001),P.s0.y*Math.max(e,.001),P.s0.z*Math.max(e,.001));setOp(ob,Math.min(1,t*2));break;
      case'wipeY':ob.scale.y=Math.max(e,.001);break;
      case'wipeX':ob.scale.x=Math.max(e,.001);break;
      case'glow':setGlow(ob,e);break;
    }
    if(P.mode==='drop'&&P.a>=.58&&P.a<.67){setGlow(ob,e);}
  }
  function setProgress(p){
    parts.forEach(P=>apply(P,clamp((p-P.a)/(P.b-P.a),0,1)));
    ramps.forEach(R=>{R.l.intensity=R.t*easeOut(clamp((p-R.a)/(R.b-R.a),0,1));});
  }
  setProgress(1);
  return{scene,camera,setProgress,root};
}
/* camera rigs for the living room */
function livingCamHero(cam,s,mx,my,aspect){
  const x=.3+s*1.4+mx*.35,y=1.5-s*.15+my*.12,z=1.6-s*2.6;
  cam.position.set(x,y,z);cam.lookAt(-.4+s*.6+mx*.15,1.2,-5);
  cam.fov=aspect>=1.5?42:clamp(42*Math.pow(1.5/aspect,.8),42,78);cam.aspect=aspect;cam.updateProjectionMatrix();
}
function livingCamTf(cam,p,aspect){
  const q=easeIO(clamp(p,0,1)),a=q*.9;
  cam.position.set(lerp(3.0,.5,q)+Math.sin(a*2)*.25,lerp(1.9,1.5,q),lerp(1.6,1.7,q));
  cam.lookAt(lerp(-.6,-.4,q),lerp(1.05,1.25,q),-4);
  cam.fov=aspect>=1.5?44:clamp(44*Math.pow(1.5/aspect,.8),44,80);cam.aspect=aspect;cam.updateProjectionMatrix();
}

/* =====================================================================
   2. DOLLHOUSE SHOWROOM
   ===================================================================== */
const RW=6,RDp=5,RH=2.8;
function shell(g,R,m){
  const{w,d,h}=RW?{w:RW,d:RDp,h:RH}:{};
  g.add(mesh(new T.PlaneGeometry(w,d),R.floor,0,0,0,{cast:false,rx:-Math.PI/2}));
  g.add(mesh(new T.PlaneGeometry(w,h),R.wall,0,h/2,-d/2,{cast:false}));
  g.add(mesh(new T.PlaneGeometry(d,h),R.wallL||R.wall,-w/2,h/2,0,{cast:false,ry:Math.PI/2}));
  g.add(mesh(new T.PlaneGeometry(d,h),R.wallR||R.wall,w/2,h/2,0,{cast:false,ry:-Math.PI/2}));
  g.add(mesh(new T.PlaneGeometry(w,d),R.ceil||m.paint,0,h,0,{cast:false,rx:Math.PI/2}));
  g.add(bx(w+.14,.09,.14,m.charc,0,h+.045,-d/2-.02,{cast:false}));
  g.add(bx(.14,.09,d,m.charc,-w/2-.02,h+.045,0,{cast:false}));g.add(bx(.14,.09,d,m.charc,w/2+.02,h+.045,0,{cast:false}));
  g.add(bx(w,.09,.03,m.walnut,0,.045,-d/2+.015,{cast:false}));
  g.add(bx(w+.3,.06,d+.3,m.charc,0,-.05,0,{cast:false,recv:true}));
}
function warmLight(g,int,x,y,z,dist,col){const l=new T.PointLight(col||0xffc98f,int,dist||9,1.5);l.position.set(x,y,z);g.add(l);return l;}
function windowPane(g,m,side,z0,z1,y0,y1){
  const w=Math.abs(z1-z0),h=y1-y0,x=side*(RW/2-.02);
  g.add(mesh(new T.PlaneGeometry(w,h),m.win,x,(y0+y1)/2,(z0+z1)/2,{cast:false,recv:false,ry:side<0?Math.PI/2:-Math.PI/2}));
  const n=3;for(let i=0;i<=n;i++)g.add(bx(.05,h,.05,m.charc,x-side*.02,(y0+y1)/2,z0+w*i/n,{cast:false}));
  [y0,y1].forEach(y=>g.add(bx(.05,.05,w,m.charc,x-side*.02,y,(z0+z1)/2,{cast:false})));
  for(let i=0;i<3;i++){
    const cg=new T.PlaneGeometry(w/3,h+.1,18,1),p=cg.attributes.position;
    for(let k=0;k<p.count;k++)p.setZ(k,Math.sin(p.getX(k)*Math.PI*8)*.04);cg.computeVertexNormals();
    const cm=M({color:0xf4efe6,roughness:1,transparent:true,opacity:.6,side:T.DoubleSide,depthWrite:false});
    g.add(mesh(cg,cm,x-side*.12,(y0+y1)/2,z0+w/6+i*w/3,{cast:false,ry:side<0?Math.PI/2:-Math.PI/2}));
  }
}
function roomLiving(g,m,lite){
  const w=RW,d=RDp,h=RH;shell(g,{floor:floorMat('oak',w,d),wall:m.paint},m);
  g.add(pln(3.4,h,slatMat(3.4),0,h/2,-d/2+.01,{cast:false}));
  [-2.3,2.3].forEach(x=>g.add(pln(1.2,h,m.marbleW,x,h/2,-d/2+.012,{cast:false})));
  const led=B(0xffc27a,2.2);[-1.7,1.7].forEach(x=>g.add(bx(.03,h,.02,led,x,h/2,-d/2+.03,{cast:false})));
  g.add(bx(1.5,1.0,.05,m.charc,0,1.75,-d/2+.05));
  g.add(pln(1.36,.86,M({map:tex(cv('art2',()=>TX.art(512,320,{seed:23,pal:['#b8925a','#2b3a3a','#e8e1d3','#7b4d2b','#a8b0a0']})),1,1),roughness:.8}),0,1.75,-d/2+.08,{cast:false}));
  const sf=sofa(m,2.7,m.fabric,1);sf.position.set(0,0,-1.85);g.add(sf);
  const ct=new T.Group();ct.add(cyl(.62,.62,.045,m.marbleW,0,.42,0,null,48));ct.add(cyl(.16,.2,.4,m.brass,0,.2,0));ct.position.set(0,0,-.4);g.add(ct);
  g.add(pln(3.6,2.5,M({map:tex(cv('rug',()=>TX.rug(512,512)),1,1),roughness:1}),0,.012,-.5,{cast:false,rx:-Math.PI/2}));
  const a1=armchair(m,m.leather);a1.position.set(-2.0,0,-.3);a1.rotation.y=Math.PI/2;g.add(a1);
  const a2=armchair(m,m.leather);a2.position.set(2.0,0,-.3);a2.rotation.y=-Math.PI/2;g.add(a2);
  g.add(rb(.45,.7,1.9,.03,m.walnut,2.7,.4,-1.7));g.add(cyl(.09,.06,.3,m.marbleW,2.7,.9,-1.4));
  const pg=plant(m,1.7,4);pg.position.set(-2.5,0,1.4);g.add(pg);const pg2=plant(m,1.1,9);pg2.position.set(2.6,0,-2.3);g.add(pg2);
  const lp=new T.Group();lp.add(cyl(.15,.17,.02,m.brass,0,.01,0));lp.add(cyl(.01,.01,1.5,m.brass,0,.76,0,null,8));
  lp.add(mesh(new T.CylinderGeometry(.2,.26,.3,24,1,true),M({color:0xf3e8d4,roughness:.9,side:T.DoubleSide,emissive:0xffb060,emissiveIntensity:.7}),0,1.6,0,{cast:false}));lp.position.set(-2.5,0,-2.1);g.add(lp);
  windowPane(g,m,-1,-1.6,1.2,.3,2.5);
  [-.8,0,.8].forEach(x=>pendant(g,m,x,1.95,-.4,h-1.95-.15,.13));
  warmLight(g,1.0,0,2.1,-.4,9);if(!lite)warmLight(g,.8,0,1.5,-2.2,4,0xffb56b);
}
function roomBedroom(g,m,lite){
  const w=RW,d=RDp,h=RH;shell(g,{floor:floorMat('oak',w,d),wall:m.paintB},m);
  g.add(pln(3.8,h,slatMat(3.8),0,h/2,-d/2+.01,{cast:false}));
  const led=B(0xffc27a,2.2);[-1.9,1.9].forEach(x=>g.add(bx(.03,h,.02,led,x,h/2,-d/2+.03,{cast:false})));
  g.add(rb(2.1,.3,2.25,.05,m.walnut,0,.25,-1.2));g.add(rb(1.95,.26,2.1,.08,m.white,0,.53,-1.2));
  g.add(rb(2.5,1.05,.14,.05,m.fabricD,0,.7,-2.33));
  [-.5,.5].forEach(x=>{g.add(rb(.7,.17,.42,.07,m.white,x,.74,-2.0));g.add(rb(.55,.15,.36,.07,m.fabricG,x,.85,-1.85));});
  g.add(rb(2.0,.13,1.4,.05,m.fabricD,0,.7,-.75));g.add(rb(2.0,.06,.38,.03,m.fabricG,0,.78,-.2));
  [-1.5,1.5].forEach(x=>{g.add(rb(.55,.42,.42,.03,m.walnut,x,.42,-2.2));[-1,1].forEach(a=>[-1,1].forEach(b=>g.add(cyl(.012,.012,.2,m.brass,x+a*.22,.1,-2.2+b*.17,{cast:false},6))));pendant(g,m,x,1.5,-2.15,h-1.5-.13,.11);});
  g.add(rb(.62,2.6,3.0,.02,m.walnut,-w/2+.34,1.35,-.4));
  for(let i=0;i<3;i++){g.add(bx(.02,2.5,.96,i===1?m.oak:m.charcM,-w/2+.66,1.35,-1.4+i*1.0));g.add(bx(.03,.4,.02,m.brass,-w/2+.68,1.3,-1.0+i*1.0,{cast:false}));}
  g.add(pln(3.2,2.4,M({map:tex(cv('rug',()=>TX.rug(512,512)),1,1),roughness:1}),0,.012,-.2,{cast:false,rx:-Math.PI/2}));
  g.add(rb(1.6,.4,.42,.06,m.fabricG,0,.22,.55));
  const ac=armchair(m,m.fabric);ac.position.set(2.2,0,1.2);ac.rotation.y=-Math.PI/2-.4;g.add(ac);
  const pg=plant(m,1.5,6);pg.position.set(2.6,0,-2.1);g.add(pg);
  windowPane(g,m,1,-.6,1.8,.4,2.4);
  warmLight(g,.85,0,2.1,-.4,9);if(!lite)warmLight(g,.6,0,1.3,-2.1,3.6,0xffb56b);
}
function roomKitchen(g,m,lite){
  const w=RW,d=RDp,h=RH;shell(g,{floor:floorMat('tile',w,d),wall:m.paint},m);
  const bz=-d/2+.3;
  for(let i=0;i<6;i++){const x=-2.25+i*.9;g.add(bx(.88,.86,.6,i%2?m.charc:m.charcM,x,.43,bz));g.add(bx(.36,.02,.02,m.brass,x,.76,bz+.31,{cast:false}));}
  g.add(bx(5.4,.05,.68,m.marbleW,0,.885,bz+.03));
  g.add(pln(5.4,.62,m.marbleB,0,1.2,-d/2+.012,{cast:false}));
  g.add(bx(.62,.012,.5,m.black,.45,.915,bz+.03,{cast:false}));[[-.14,-.1],[.14,-.1],[-.14,.1],[.14,.1]].forEach(p=>g.add(cyl(.05,.05,.012,m.chrome,.45+p[0],.925,bz+.03+p[1],{cast:false},14)));
  g.add(bx(.9,.5,.42,m.black,.45,1.95,-d/2+.22));g.add(bx(.22,.5,.26,m.black,.45,2.45,-d/2+.15));
  for(let i=0;i<4;i++){const x=-2.25+i*.9;g.add(bx(.88,.78,.36,i%2?m.walnut:m.oak,x,1.82,-d/2+.2));g.add(bx(.3,.02,.02,m.brass,x,1.5,-d/2+.4,{cast:false}));}
  g.add(bx(3.6,.015,.02,B(0xffd39a,2),-.45,1.42,-d/2+.36,{cast:false}));
  g.add(bx(.9,2.3,.65,m.chrome,2.25,1.15,bz+.03));g.add(bx(.02,1.1,.03,m.charc,1.85,1.2,bz+.36,{cast:false}));
  g.add(bx(2.3,.86,.85,m.walnut,0,.43,.2));g.add(bx(2.55,.05,1.05,m.marbleW,0,.885,.25));
  [-.8,0,.8].forEach(x=>{g.add(cyl(.2,.2,.05,m.leather,x,.66,1.1));g.add(cyl(.02,.02,.62,m.brass,x,.33,1.1,{cast:false},8));g.add(cyl(.14,.14,.02,m.brass,x,.01,1.1,{cast:false},16));pendant(g,m,x,1.75,.2,h-1.75-.15,.12);});
  const p1=plant(m,.7,2);p1.position.set(-2.4,.91,bz);p1.scale.setScalar(.6);g.add(p1);
  const p2=plant(m,1.5,3);p2.position.set(-2.6,0,1.6);g.add(p2);
  g.add(cyl(.16,.12,.12,m.white,.6,.97,.25,null,24));
  g.add(pln(2.2,1.3,m.win,-w/2+.02,1.6,-.6,{cast:false,recv:false,ry:Math.PI/2}));
  warmLight(g,.95,0,2.2,-.2,9,0xffd9b0);if(!lite)warmLight(g,.6,-.4,1.35,-d/2+.6,3.5,0xffb56b);
}
function roomOffice(g,m,lite){
  const w=RW,d=RDp,h=RH;shell(g,{floor:floorMat('carpet',w,d),wall:m.paintB},m);
  g.add(bx(3.8,2.35,.34,m.walnut,0,1.7,-d/2+.2));g.add(bx(3.66,2.2,.05,m.charc,0,1.7,-d/2+.36,{cast:false}));
  const r=rng(31);
  [.95,1.45,1.95,2.45].forEach((y,i)=>{g.add(bx(3.66,.03,.3,m.walnut,0,y-.1,-d/2+.36,{cast:false}));if(i<3)books(g,m,-1.7,y-.085,-d/2+.38,22,r,.34);});
  g.add(bx(3.8,.8,.5,m.walnut,0,.4,-d/2+.26));g.add(bx(3.9,.04,.54,m.marbleB,0,.82,-d/2+.28));
  g.add(bx(3.66,.012,.02,B(0xffc27a,2),0,1.0,-d/2+.53,{cast:false}));
  g.add(rb(2.3,.06,1.0,.02,m.walnut,0,.76,-.7));g.add(bx(2.2,.68,.04,m.walnut,0,.4,-.3));
  g.add(bx(.55,.68,.85,m.walnut,-.95,.4,-.85));g.add(bx(.55,.68,.85,m.walnut,.95,.4,-.85));
  g.add(bx(.7,.42,.025,m.black,0,1.02,-.95));g.add(bx(.06,.22,.06,m.charc,0,.87,-.95,{cast:false}));g.add(bx(.36,.012,.25,m.charc,.7,.795,-.6,{cast:false}));
  const ch=new T.Group();ch.add(rb(.62,.1,.62,.04,m.black,0,.5,0));ch.add(rb(.6,.75,.1,.05,m.black,0,.9,-.3));ch.add(cyl(.03,.03,.4,m.chrome,0,.25,0,null,10));ch.add(cyl(.28,.32,.03,m.chrome,0,.03,0,null,5));
  ch.position.set(0,0,-1.5);ch.rotation.y=Math.PI+.15;g.add(ch);
  [-.65,.65].forEach(x=>{const vc=new T.Group();vc.add(rb(.55,.09,.55,.04,m.leather,0,.46,0));vc.add(rb(.55,.55,.08,.04,m.leather,0,.75,-.25));vc.add(cyl(.02,.02,.4,m.brass,0,.24,0,null,8));vc.position.set(x,0,.6);vc.rotation.y=Math.PI+(x>0?-.15:.15);g.add(vc);});
  g.add(bx(2.4,.05,.09,B(0xfff0d8,2.4),0,1.95,-.6,{cast:false}));[-1.1,1.1].forEach(x=>g.add(cyl(.004,.004,h-1.95,m.chrome,x,1.95+(h-1.95)/2,-.6,{cast:false},4)));
  for(let i=0;i<4;i++)g.add(bx(.03,2.4,.03,m.charc,w/2-.06,1.25,-2.0+i*1.35));
  g.add(mesh(new T.PlaneGeometry(4.1,2.35),m.glass,w/2-.06,1.25,.05,{cast:false,recv:false,ry:-Math.PI/2}));
  g.add(bx(.04,.05,4.1,m.charc,w/2-.06,.05,.05,{cast:false}));g.add(bx(.04,.05,4.1,m.charc,w/2-.06,2.42,.05,{cast:false}));
  const pg=plant(m,1.6,12);pg.position.set(-2.5,0,1.2);g.add(pg);
  const lp=new T.Group();lp.add(cyl(.15,.17,.02,m.charc,0,.01,0));lp.add(cyl(.01,.01,1.4,m.charc,0,.7,0,null,8));lp.add(mesh(new T.SphereGeometry(.16,16,12),m.warm,0,1.45,0,{cast:false}));lp.position.set(-2.4,0,-2.0);g.add(lp);
  warmLight(g,.95,0,2.3,-.2,9,0xffe2c0);if(!lite)warmLight(g,.5,0,1.3,-d/2+.8,3.6,0xffb56b);
}
function roomBath(g,m,lite){
  const w=RW,d=RDp,h=RH,tileW=M({map:tex(cv('bt',()=>TX.tile(512,512,{n:3,base:'#e2ddd3',grout:'#b7b1a6'})),2,1.2),roughness:.3});
  shell(g,{floor:floorMat('dark',w,d),wall:m.marbleW,wallL:tileW,wallR:tileW},m);
  g.add(pln(2.2,h,slatMat(2.2),-2.0,h/2,-d/2+.02,{cast:false}));
  g.add(bx(1.9,.46,.52,m.walnut,.4,.86,-d/2+.3));g.add(bx(2.0,.05,.56,m.white,.4,1.12,-d/2+.3));
  [-.1,.9].forEach(x=>{g.add(cyl(.2,.17,.1,m.white,x,1.2,-d/2+.3,null,32));g.add(cyl(.014,.014,.26,m.brass,x,1.29,-d/2+.13,{cast:false},8));g.add(bx(.02,.02,.12,m.brass,x,1.41,-d/2+.19,{cast:false}));});
  g.add(bx(2.06,1.26,.02,B(0xffd9a6,1.6),.4,1.95,-d/2+.03,{cast:false}));g.add(pln(1.9,1.1,m.mirror,.4,1.95,-d/2+.045,{cast:false,recv:false}));
  const tub=new T.Group();tub.add(rb(.85,.62,1.75,.3,m.white,0,.33,0));tub.add(rb(.62,.08,1.5,.2,M({color:0xe8e4dc,roughness:.6}),0,.62,0,{cast:false}));tub.add(cyl(.02,.02,.9,m.brass,0,.5,-.95,null,8));
  tub.position.set(-2.0,0,-.3);g.add(tub);
  const gl=(x,z,ry,wd)=>{g.add(mesh(new T.PlaneGeometry(wd,2.3),m.glass,x,1.2,z,{cast:false,recv:false,ry:ry}));g.add(bx(ry?.02:wd,.03,ry?wd:.02,m.charc,x,2.35,z,{cast:false}));};
  gl(1.3,-1.25,Math.PI/2,2.4);gl(2.1,-.05,0,1.6);
  g.add(cyl(.17,.17,.03,m.chrome,2.2,2.4,-1.6,null,24));g.add(cyl(.012,.012,.4,m.chrome,2.2,2.6,-1.6,{cast:false},6));
  g.add(cyl(.11,.11,.01,m.charc,2.2,.01,-1.6,{cast:false},20));
  g.add(pln(1.0,2.1,slatMat(1.0),w/2-.03,1.2,-.3,{cast:false,ry:-Math.PI/2}));
  const stl=new T.Group();stl.add(cyl(.26,.26,.42,m.oak,0,.21,0,null,28));stl.add(rb(.4,.12,.3,.04,m.white,0,.5,0));stl.add(rb(.4,.1,.3,.04,m.fabricG,0,.6,0));stl.position.set(-1.0,0,1.5);g.add(stl);
  const pg=plant(m,1.3,15);pg.position.set(2.5,0,1.4);g.add(pg);
  warmLight(g,.9,0,2.2,-.3,9,0xffd6a8);if(!lite)warmLight(g,.5,.4,1.8,-d/2+.8,3.2,0xffb56b);
}
const ROOMS=[
  {id:'living',cx:-6.5,cz:-3.75,build:roomLiving,look:[0,1.0,-1.6],views:[{p:[1.1,1.5,2.6],l:[-.2,.9,-1.7],f:62},{p:[-2.0,1.4,1.9],l:[.8,.9,-1.6],f:62}]},
  {id:'kitchen',cx:0,cz:-3.75,build:roomKitchen,look:[0,1.0,-1.4],views:[{p:[1.4,1.55,2.5],l:[-.3,1.0,-1.8],f:62},{p:[-2.0,1.5,1.6],l:[1.1,1.0,-1.6],f:62}]},
  {id:'office',cx:6.5,cz:-3.75,build:roomOffice,look:[0,1.0,-1.4],views:[{p:[1.6,1.6,2.6],l:[-.2,.9,-1.3],f:60},{p:[-2.0,1.6,2.3],l:[.8,1.0,-1.5],f:60}]},
  {id:'bedroom',cx:-3.25,cz:3.75,build:roomBedroom,look:[0,.9,-1.3],views:[{p:[1.6,1.5,2.5],l:[-.3,.8,-1.5],f:62},{p:[-1.9,1.4,1.8],l:[.9,1.0,-1.6],f:62}]},
  {id:'bathroom',cx:3.25,cz:3.75,build:roomBath,look:[.3,1.0,-1.4],views:[{p:[.6,1.55,2.5],l:[.2,1.0,-1.6],f:62},{p:[-1.6,1.5,2.2],l:[1.0,1.0,-1.6],f:62}]}
];
function buildDollhouse(renderer,o){
  o=o||{};
  const scene=new T.Scene();scene.background=new T.Color(0x151412);scene.environment=makeEnv(renderer);
  const m=makeMats(),groups=[];
  const ground=mesh(new T.PlaneGeometry(90,90),M({color:0x1e1c1a,roughness:.9}),0,-.09,0,{cast:false});ground.rotation.x=-Math.PI/2;scene.add(ground);
  ROOMS.forEach(R=>{const g=new T.Group();g.position.set(R.cx,0,R.cz);R.build(g,m,!!o.lite);g.traverse(c=>{if(c.isMesh&&c.material===m.win){c.castShadow=false;}});scene.add(g);groups.push(g);});
  scene.add(new T.HemisphereLight(0xfff1de,0x4a3f34,.42));
  const sun=new T.DirectionalLight(0xfff0dd,1.0);sun.position.set(-12,24,14);sun.target.position.set(0,0,0);scene.add(sun,sun.target);
  sun.castShadow=true;sun.shadow.mapSize.set(o.lite?1024:2048,o.lite?1024:2048);
  const sc=sun.shadow.camera;sc.left=-17;sc.right=17;sc.top=17;sc.bottom=-17;sc.near=1;sc.far=70;sun.shadow.bias=-.0005;sun.shadow.normalBias=.04;
  const camera=new T.PerspectiveCamera(42,16/9,.1,220);
  return{scene,camera,groups};
}

/* =====================================================================
   3. RUNTIME WRAPPERS
   ===================================================================== */
function viewport(el){const r=el.getBoundingClientRect();return{w:Math.max(2,Math.round(r.width)),h:Math.max(2,Math.round(r.height))};}

function createHero(canvas,o){
  const r=makeRenderer(canvas,o),S=buildLiving(r,o);
  let mx=0,my=0,tx=0,ty=0,s=0;
  const box=canvas.parentElement;
  function size(){const v=viewport(box);r.setSize(v.w,v.h,false);S.aspect=v.w/v.h;}
  size();livingCamHero(S.camera,0,0,0,S.aspect);
  autoExpose(r,S.scene,S.camera,.36,4);
  window.addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*2;},{passive:true});
  return{
    resize:size,
    render(dt){
      const rect=box.getBoundingClientRect();s=clamp(-rect.top/Math.max(1,rect.height),0,1);
      const k=1-Math.exp(-dt*3);mx+=(tx-mx)*k;my+=(ty-my)*k;
      livingCamHero(S.camera,s,mx,my,S.aspect);r.render(S.scene,S.camera);
    },
    renderOnce(){livingCamHero(S.camera,0,0,0,S.aspect);r.render(S.scene,S.camera);}
  };
}
function createTransform(canvas,o){
  const r=makeRenderer(canvas,o),S=buildLiving(r,o);
  const box=canvas.parentElement;let p=0;
  function size(){const v=viewport(box);r.setSize(v.w,v.h,false);S.aspect=v.w/v.h;}
  size();livingCamTf(S.camera,1,S.aspect);autoExpose(r,S.scene,S.camera,.36,4);S.setProgress(0);
  let last=-1,dirty=true;
  return{resize(){size();dirty=true;},setP(v){p=v;},render(){if(p!==last){S.setProgress(p);last=p;dirty=true;}if(!dirty)return;livingCamTf(S.camera,p,S.aspect);r.render(S.scene,S.camera);dirty=false;}};
}
function createShowroom(canvas,stage,o,onPick){
  const r=makeRenderer(canvas,o),S=buildDollhouse(r,o),cam=S.camera;
  let mode=-1,yaw=0,pitch=.85,zoom=1,lyaw=0,lpitch=0,aspect=16/9;
  const cur={p:new T.Vector3(),l:new T.Vector3()},goal={p:new T.Vector3(),l:new T.Vector3()};
  const tv=new T.Vector3();
  function fitR(){return Math.max(21,20/(2*Math.tan(20*Math.PI/180)*Math.min(aspect,1.8)))*zoom;}
  function goalFor(){
    if(mode<0){
      const R=fitR();goal.l.set(0,.4,0);
      goal.p.set(Math.sin(yaw)*Math.cos(pitch)*R,Math.sin(pitch)*R,Math.cos(yaw)*Math.cos(pitch)*R);
    }else{
      const RM=ROOMS[mode],v=RM.views[0],back=aspect<1.2?clamp(3.4/(Math.tan(31*Math.PI/180)*aspect)-4.2,0,7):0;
      goal.p.set(RM.cx+v.p[0]*.6,v.p[1],RM.cz+v.p[2]+back);
      const dir=new T.Vector3(RM.cx+v.l[0]-goal.p.x,v.l[1]-goal.p.y,RM.cz+v.l[2]-goal.p.z);
      const q=new T.Euler(lpitch,lyaw,0,'YXZ');dir.applyEuler(q);goal.l.copy(goal.p).add(dir);
    }
  }
  function snap(){goalFor();cur.p.copy(goal.p);cur.l.copy(goal.l);cam.position.copy(cur.p);cam.lookAt(cur.l);}
  function size(){const v=viewport(stage);r.setSize(v.w,v.h,false);aspect=v.w/v.h;cam.aspect=aspect;cam.fov=mode<0?40:(aspect<1.2?64:52);cam.updateProjectionMatrix();}
  size();
  mode=0;snap();autoExpose(r,S.scene,cam,.36,4);mode=-1;snap();
  /* input */
  let drag=null;
  stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;drag={x:e.clientX,y:e.clientY};stage.classList.add('drag');try{stage.setPointerCapture(e.pointerId);}catch(_){}});
  stage.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
    if(mode<0){yaw=clamp(yaw-dx*.005,-1.25,1.25);pitch=clamp(pitch+dy*.004,.28,1.3);}
    else{lyaw=clamp(lyaw-dx*.003,-.55,.55);lpitch=clamp(lpitch-dy*.002,-.25,.25);}});
  const end=()=>{drag=null;stage.classList.remove('drag');};
  stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
  stage.addEventListener('wheel',e=>{if(mode>=0||!(e.ctrlKey||e.metaKey))return;e.preventDefault();zoom=clamp(zoom*(1+e.deltaY*.0012),.55,1.3);},{passive:false});
  const pins=[];
  return{
    resize(){size();},
    setMode(i){mode=i;lyaw=0;lpitch=0;cam.fov=mode<0?40:(aspect<1.2?64:52);cam.updateProjectionMatrix();},
    get mode(){return mode;},
    project(i,out){const R=ROOMS[i];tv.set(R.cx,2.6,R.cz+.6).project(cam);out.x=(tv.x*.5+.5)*stage.clientWidth;out.y=(-tv.y*.5+.5)*stage.clientHeight;out.vis=tv.z<1&&mode<0;},
    render(dt){
      goalFor();const k=1-Math.exp(-dt*3.4);cur.p.lerp(goal.p,k);cur.l.lerp(goal.l,k);
      const f=mode<0?40:(aspect<1.2?64:52);if(Math.abs(cam.fov-f)>.05){cam.fov+=(f-cam.fov)*k;cam.updateProjectionMatrix();}
      cam.position.copy(cur.p);cam.lookAt(cur.l);r.render(S.scene,cam);
    }
  };
}

/* render still images (concept renders) using an offscreen renderer */
function renderStills(o,onStill,onDone,onFail){
  const cv0=document.createElement('canvas');const W=o.w||1280,Hh=o.h||800;cv0.width=W;cv0.height=Hh;
  const r=makeRenderer(cv0,{lite:o.lite,dpr:1,keep:true});r.setSize(W,Hh,false);
  const jobs=[];
  let bad=false;const grab=(id)=>{const L=meanLum(cv0);if(L>=0&&L<.03){if(!bad){bad=true;onFail&&onFail();}return;}onStill(id,cv0.toDataURL('image/jpeg',.86));};
  const L=buildLiving(r,{lite:false});
  const cams=[{id:'lvA',p:[.6,1.5,1.7],l:[-.3,1.15,-5],f:44},{id:'lvB',p:[2.6,1.45,-.2],l:[-1.6,1.05,-3.6],f:50}];
  const baCam={p:[1.0,1.55,1.6],l:[-.4,1.2,-4],f:50};
  jobs.push(()=>{const c=L.camera;c.aspect=W/Hh;c.fov=baCam.f;c.position.set(...baCam.p);c.lookAt(...baCam.l);c.updateProjectionMatrix();autoExpose(r,L.scene,c,.36,4);L.setProgress(0);r.render(L.scene,c);grab('lvEmpty');L.setProgress(1);r.render(L.scene,c);grab('lvFinal');});
  cams.forEach(cm=>jobs.push(()=>{const c=L.camera;L.setProgress(1);c.aspect=W/Hh;c.fov=cm.f;c.position.set(...cm.p);c.lookAt(...cm.l);c.updateProjectionMatrix();r.render(L.scene,c);grab(cm.id);}));
  jobs.push(()=>{
    const D=buildDollhouse(r,{lite:false});D.groups.forEach(g=>g.visible=false);
    const c=D.camera;c.aspect=W/Hh;
    const seq=[];
    ROOMS.forEach((R,i)=>{if(R.id==='living'||R.id==='bathroom'&&false)return;R.views.forEach((v,k)=>seq.push({i,v,id:R.id+(k+1)}));});
    let first=true;
    (function next(){
      const it=seq.shift();if(!it){r.dispose();if(r.forceContextLoss)r.forceContextLoss();onDone&&onDone();return;}
      D.groups.forEach((g,gi)=>g.visible=gi===it.i);
      const R=ROOMS[it.i];c.fov=it.v.f;c.updateProjectionMatrix();c.position.set(R.cx+it.v.p[0],it.v.p[1],R.cz+it.v.p[2]);c.lookAt(R.cx+it.v.l[0],it.v.l[1],R.cz+it.v.l[2]);
      if(first){autoExpose(r,D.scene,c,.38,4);first=false;}
      r.render(D.scene,c);grab(it.id);setTimeout(next,40);
    })();
  });
  let i=0;
  (function run(){if(i<jobs.length){const j=jobs[i++];try{j();}catch(e){console.warn('still failed',e);}setTimeout(run,60);}})();
}

return{createHero,createTransform,createShowroom,renderStills,ROOMS};
}
