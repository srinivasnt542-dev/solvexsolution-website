/* ---------- Procedural textures (no external files needed) ---------- */
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function rgba(h,a){const c=hex2rgb(h);return`rgba(${c[0]},${c[1]},${c[2]},${a})`;}
function shade(h,amt){const c=hex2rgb(h).map(v=>Math.max(0,Math.min(255,Math.round(v+amt))));return`rgb(${c[0]},${c[1]},${c[2]})`;}
function mkc(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')];}
function noise(x,w,h,amt,seed){const r=rng(seed||3);const id=x.getImageData(0,0,w,h),d=id.data;for(let i=0;i<d.length;i+=4){const n=(r()-.5)*amt;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}x.putImageData(id,0,0);}

const TX={
  wood(w=512,h=512,o={}){
    const[c,x]=mkc(w,h),r=rng(o.seed||7),base=o.base||'#a67a4a',dark=o.dark||'#6e4726',n=o.planks||6,ph=h/n;
    for(let i=0;i<n;i++){
      const y0=i*ph;x.fillStyle=shade(base,(r()-.5)*34);x.fillRect(0,y0,w,ph);
      for(let k=0;k<64;k++){const gy=y0+r()*ph;x.strokeStyle=rgba(dark,.05+r()*.15);x.lineWidth=.5+r()*1.5;x.beginPath();x.moveTo(0,gy);let px=0;while(px<w){px+=30+r()*60;x.lineTo(px,gy+(r()-.5)*3.5);}x.stroke();}
      x.fillStyle='rgba(18,9,2,.55)';x.fillRect(0,y0,w,1.6);x.fillRect(r()*w,y0,1.6,ph);
    }
    return c;
  },
  slats(w=512,h=512,o={}){
    const[c,x]=mkc(w,h),r=rng(o.seed||11),base=o.base||'#7a4d2c',n=o.n||16,sw=w/n;
    for(let i=0;i<n;i++){
      const g=x.createLinearGradient(i*sw,0,(i+1)*sw,0);
      g.addColorStop(0,shade(base,-40));g.addColorStop(.18,shade(base,14));g.addColorStop(.55,shade(base,26));g.addColorStop(1,shade(base,-52));
      x.fillStyle=g;x.fillRect(i*sw,0,sw,h);
      for(let k=0;k<26;k++){x.strokeStyle=rgba('#2b170a',.05+r()*.12);x.lineWidth=.6+r();const gx=i*sw+sw*(.15+r()*.7);x.beginPath();x.moveTo(gx,0);x.lineTo(gx+(r()-.5)*4,h);x.stroke();}
    }
    return c;
  },
  marble(w=512,h=512,o={}){
    const[c,x]=mkc(w,h),r=rng(o.seed||21),base=o.base||'#ece8e1',vein=o.vein||'#8d8880',nv=o.veins||9;
    x.fillStyle=base;x.fillRect(0,0,w,h);
    for(let i=0;i<14;i++){const g=x.createRadialGradient(r()*w,r()*h,0,r()*w,r()*h,w*(.2+r()*.4));g.addColorStop(0,rgba(vein,.07));g.addColorStop(1,rgba(vein,0));x.fillStyle=g;x.fillRect(0,0,w,h);}
    for(let v=0;v<nv;v++){
      let px=r()*w,py=-10,ang=Math.PI/2+(r()-.5)*1.6;const pts=[[px,py]];
      for(let s=0;s<60;s++){ang+=(r()-.5)*.9;px+=Math.cos(ang)*(9+r()*10);py+=Math.sin(ang)*(9+r()*10);pts.push([px,py]);if(py>h+20)break;}
      [[9,.05],[4,.12],[1.6,.42],[.6,.7]].forEach(([lw,al])=>{x.strokeStyle=rgba(v%3===0&&o.gold?o.gold:vein,al*(o.strength||1));x.lineWidth=lw*(.6+r()*.8);x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();});
    }
    return c;
  },
  concrete(w=512,h=512,o={}){
    const[c,x]=mkc(w,h),r=rng(o.seed||5),base=o.base||'#8c8983';
    x.fillStyle=base;x.fillRect(0,0,w,h);
    for(let i=0;i<260;i++){const s=8+r()*60;x.fillStyle=r()>.5?'rgba(255,255,255,.035)':'rgba(0,0,0,.04)';x.fillRect(r()*w,r()*h,s,s*(.4+r()));}
    for(let i=0;i<90;i++){x.fillStyle='rgba(30,28,25,.16)';x.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}
    noise(x,w,h,18,9);return c;
  },
  plaster(w=256,h=256,base='#eee8de'){const[c,x]=mkc(w,h);x.fillStyle=base;x.fillRect(0,0,w,h);noise(x,w,h,7,4);return c;},
  fabric(w=256,h=256,o={}){
    const[c,x]=mkc(w,h),base=o.base||'#cdbfab',r=rng(2);
    x.fillStyle=base;x.fillRect(0,0,w,h);
    for(let i=0;i<w;i+=3){x.fillStyle='rgba(0,0,0,.06)';x.fillRect(i,0,1,h);}
    for(let j=0;j<h;j+=3){x.fillStyle='rgba(255,255,255,.05)';x.fillRect(0,j,w,1);}
    for(let i=0;i<900;i++){x.fillStyle=r()>.5?'rgba(255,255,255,.08)':'rgba(0,0,0,.08)';x.fillRect(r()*w,r()*h,2,1);}
    noise(x,w,h,10,8);return c;
  },
  tile(w=512,h=512,o={}){
    const[c,x]=mkc(w,h),r=rng(o.seed||31),n=o.n||4,tw=w/n,base=o.base||'#d8d3ca';
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){
      x.fillStyle=shade(base,(r()-.5)*16);x.fillRect(i*tw,j*tw,tw,tw);
      const g=x.createLinearGradient(i*tw,j*tw,(i+1)*tw,(j+1)*tw);g.addColorStop(0,'rgba(255,255,255,.14)');g.addColorStop(1,'rgba(0,0,0,.08)');x.fillStyle=g;x.fillRect(i*tw,j*tw,tw,tw);
      x.strokeStyle=rgba(o.vein||'#8a857c',.22);x.lineWidth=1;x.beginPath();let px=i*tw+r()*tw,py=j*tw;x.moveTo(px,py);for(let s=0;s<6;s++){px+=(r()-.5)*40;py+=tw/6;x.lineTo(px,py);}x.stroke();
    }
    x.fillStyle=o.grout||'#9a958c';for(let i=0;i<=n;i++){x.fillRect(i*tw-1.5,0,3,h);x.fillRect(0,i*tw-1.5,w,3);}
    return c;
  },
  metal(w=512,h=512,o={}){
    const[c,x]=mkc(w,h),r=rng(6),base=o.base||'#b59760';
    const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,shade(base,-30));g.addColorStop(.35,shade(base,40));g.addColorStop(.6,shade(base,-10));g.addColorStop(1,shade(base,30));
    x.fillStyle=g;x.fillRect(0,0,w,h);
    for(let i=0;i<700;i++){x.strokeStyle=r()>.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)';x.lineWidth=.5+r();const y=r()*h;x.beginPath();x.moveTo(0,y);x.lineTo(w,y+(r()-.5)*3);x.stroke();}
    return c;
  },
  glass(w=512,h=512){
    const[c,x]=mkc(w,h);
    const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#bfd7dc');g.addColorStop(.5,'#8fb2ba');g.addColorStop(1,'#6b8f98');x.fillStyle=g;x.fillRect(0,0,w,h);
    [[.15,.09],[.32,.05],[.62,.11]].forEach(([o,wd])=>{const s=x.createLinearGradient(w*o,0,w*(o+wd)+h*.4,h);s.addColorStop(0,'rgba(255,255,255,0)');s.addColorStop(.5,'rgba(255,255,255,.5)');s.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=s;x.beginPath();x.moveTo(w*o,0);x.lineTo(w*(o+wd),0);x.lineTo(w*(o+wd)-w*.3,h);x.lineTo(w*o-w*.3,h);x.fill();});
    x.strokeStyle='rgba(20,30,32,.5)';x.lineWidth=8;x.strokeRect(4,4,w-8,h-8);
    return c;
  },
  glow(w=512,h=512){
    const[c,x]=mkc(w,h);x.fillStyle='#1a1714';x.fillRect(0,0,w,h);
    [[.3,.35,.5],[.68,.6,.42],[.5,.2,.28]].forEach(([a,b,s])=>{const g=x.createRadialGradient(w*a,h*b,0,w*a,h*b,w*s);g.addColorStop(0,'rgba(255,214,150,1)');g.addColorStop(.12,'rgba(255,190,110,.7)');g.addColorStop(1,'rgba(255,170,80,0)');x.fillStyle=g;x.fillRect(0,0,w,h);});
    x.strokeStyle='rgba(255,236,200,.95)';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(w*.12,h*.82);x.lineTo(w*.88,h*.82);x.stroke();
    return c;
  },
  panel(w=512,h=512){
    const[c,x]=mkc(w,h);x.fillStyle='#e9e3d8';x.fillRect(0,0,w,h);
    const rects=[[.06,.06,.4,.52],[.54,.06,.4,.52],[.06,.66,.4,.28],[.54,.66,.4,.28]];
    rects.forEach(([a,b,cw,ch])=>{x.fillStyle='#f4efe6';x.fillRect(w*a,h*b,w*cw,h*ch);x.strokeStyle='#b9936a';x.lineWidth=5;x.strokeRect(w*a,h*b,w*cw,h*ch);x.strokeStyle='rgba(0,0,0,.1)';x.lineWidth=2;x.strokeRect(w*a+9,h*b+9,w*cw-18,h*ch-18);x.strokeStyle='rgba(255,255,255,.9)';x.strokeRect(w*a+11,h*b+11,w*cw-22,h*ch-22);});
    return c;
  },
  rug(w=512,h=512,o={}){
    const[c,x]=mkc(w,h),r=rng(4),base=o.base||'#d9d0c1';
    x.fillStyle=base;x.fillRect(0,0,w,h);
    x.strokeStyle=rgba('#8a7a64',.5);x.lineWidth=6;x.strokeRect(24,24,w-48,h-48);x.lineWidth=2;x.strokeRect(38,38,w-76,h-76);
    for(let i=0;i<500;i++){x.fillStyle=r()>.5?'rgba(255,255,255,.1)':'rgba(70,55,35,.09)';x.fillRect(r()*w,r()*h,3+r()*10,1);}
    noise(x,w,h,10,3);return c;
  },
  art(w=384,h=512,o={}){
    const[c,x]=mkc(w,h),r=rng(o.seed||17),pal=o.pal||['#c9a26b','#2f3a3a','#e6ded0','#8a5a3a','#b7b9a8'];
    x.fillStyle=pal[2];x.fillRect(0,0,w,h);
    for(let i=0;i<6;i++){x.fillStyle=rgba(pal[i%pal.length],.75);x.beginPath();x.arc(r()*w,r()*h,30+r()*120,0,7);x.fill();}
    x.fillStyle=pal[1];x.fillRect(w*.12,h*.68,w*.76,h*.02);
    x.strokeStyle=rgba(pal[0],.9);x.lineWidth=3;x.beginPath();x.arc(w*.55,h*.4,w*.28,3.4,6.1);x.stroke();
    return c;
  },
  sky(w=64,h=256){
    const[c,x]=mkc(w,h);const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#a9c9e3');g.addColorStop(.55,'#f0ece2');g.addColorStop(.72,'#d5dbc6');g.addColorStop(.8,'#5f7a55');g.addColorStop(1,'#3f5a3c');x.fillStyle=g;x.fillRect(0,0,w,h);return c;
  }
};
