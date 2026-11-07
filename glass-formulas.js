// ════════ PK คำนวณราง + กระจก — สูตร/Optimize (ไฟล์นี้ = source of truth ของสูตร · แยกจากหน้าจอ glass-calc.html) ════════
//  ที่มา: C:\Coding\คำนวณรางงานกระจก\คำนวณรางงานกระจก.html (ย้ายมาเข้าระบบ 6 พ.ย. 2026 · เนื้อสูตรคัดลอกตรงตัว ไม่แก้เลข)
//  ใช้ร่วม: หน้า glass-calc.html (แท็บ 🧮 คำนวณกระจก) · ต่อไปใบผลิตกระจกจะโหลดไฟล์นี้คำนวณด้วย · เทส tests/glasscalc_test.mjs
//
//  ── วิธีเพิ่มสูตรใหม่ (ตาราง GC_FORMULAS — ทำครบ 4 จุด แล้วรันเทส) ──
//   1. เขียนฟังก์ชันราง (คืน [{rail,len}] ขยายจำนวนแล้ว) + กระจก (คืน [{label,w,h,qty}])
//   2. เพิ่ม 1 แถวใน GC_FORMULAS (key/label/match/pieces/glass/probes) ก่อนแถว 'slide' — แถวเฉพาะเจาะจงต้องมาก่อน
//   3. หน้าจอ glass-calc.html: ตัวเลือกใน renderJobs + ค่าที่ยอมรับใน load()/normImportJob() (ข้อมูลเก่าต้องไม่พัง) + ข้อความเตือนใน gcJobWarn_ ถ้ามี
//   4. เพิ่มเลขตรวจมือใน tests/glasscalc_test.mjs แล้ว bump GC_FORMULAS_VER ใน glass-calc.html (กันมือถือใช้สูตรเก่าจาก cache)
//  ⚠ ไฟล์นี้เป็น global script ธรรมดา (ใช้ state ร่วมกับหน้าจอ) — ห้ามโหลดตรงใน app.html (ชื่อ state/render ชนกัน)

const QTY = {"บานตาย": {"ไม่เสริม": {"เฟรมบน (ไม่ติดกล่อง)": 1, "เฟรมล่าง (ไม่ติดกล่อง)": 1, "เฟรมข้าง (ไม่ติดกล่อง)": 2, "เสากุญแจ": 1, "เสาเกี่ยว": 2, "เสาตาย": 1, "ขวางบน": 2, "ขวางล่าง": 2, "ธรณี": 1}, "เสริม3": {"เฟรมล่าง (ไม่ติดกล่อง)": 1, "เฟรมบน (ติดกล่อง)": 1, "เฟรมข้าง (ติดกล่อง)": 2, "เสากุญแจ": 1, "เสาเกี่ยว": 2, "เสาตาย": 1, "ขวางบน": 2, "ขวางล่าง": 2, "ธรณี": 1}, "เสริม4": {"เฟรมบน (ติดกล่อง)": 1, "เฟรมล่าง (ติดกล่อง)": 1, "เฟรมข้าง (ติดกล่อง)": 2, "เสากุญแจ": 1, "เสาเกี่ยว": 2, "เสาตาย": 1, "ขวางบน": 2, "ขวางล่าง": 2, "ธรณี": 1}}, "สลับ": {"ไม่เสริม": {"เฟรมบน (ไม่ติดกล่อง)": 1, "เฟรมล่าง (ไม่ติดกล่อง)": 1, "เฟรมข้าง (ไม่ติดกล่อง)": 2, "เสากุญแจ": 2, "เสาเกี่ยว": 2, "ขวางบน": 2, "ขวางล่าง": 2}, "เสริม3": {"เฟรมล่าง (ไม่ติดกล่อง)": 1, "เฟรมบน (ติดกล่อง)": 1, "เฟรมข้าง (ติดกล่อง)": 2, "เสากุญแจ": 2, "เสาเกี่ยว": 2, "ขวางบน": 2, "ขวางล่าง": 2}, "เสริม4": {"เฟรมบน (ติดกล่อง)": 1, "เฟรมล่าง (ติดกล่อง)": 1, "เฟรมข้าง (ติดกล่อง)": 2, "เสากุญแจ": 2, "เสาเกี่ยว": 2, "ขวางบน": 2, "ขวางล่าง": 2}}, "แบ่ง4": {"ไม่เสริม": {"เฟรมบน (ไม่ติดกล่อง)": 1, "เฟรมล่าง (ไม่ติดกล่อง)": 1, "เฟรมข้าง (ไม่ติดกล่อง)": 2, "เสากุญแจ": 2, "เสาเกี่ยว": 4, "เสาตาย": 2, "ขวางบน": 4, "ขวางล่าง": 4, "ประกบกลาง": 1, "ธรณี": 1}, "เสริม3": {"เฟรมล่าง (ไม่ติดกล่อง)": 1, "เฟรมบน (ติดกล่อง)": 1, "เฟรมข้าง (ติดกล่อง)": 2, "เสากุญแจ": 2, "เสาเกี่ยว": 4, "เสาตาย": 2, "ขวางบน": 4, "ขวางล่าง": 4, "ประกบกลาง": 1, "ธรณี": 1}, "เสริม4": {"เฟรมบน (ติดกล่อง)": 1, "เฟรมล่าง (ติดกล่อง)": 1, "เฟรมข้าง (ติดกล่อง)": 2, "เสากุญแจ": 2, "เสาเกี่ยว": 4, "เสาตาย": 2, "ขวางบน": 4, "ขวางล่าง": 4, "ประกบกลาง": 1, "ธรณี": 1}}, "บานกระทุ้ง": {"ติดกล่อง": {"กล่องเรียบ": 4, "กรอบนอกบานกระทุ้ง": 4, "กรอบในบานกระทุ้ง": 4, "คิ้วบานกระทุ้ง": 4}, "ไม่ติดกล่อง": {"กรอบนอกบานกระทุ้ง": 4, "กรอบในบานกระทุ้ง": 4, "คิ้วบานกระทุ้ง": 4}}};
const STOCK_DEFAULT=640, KERF_DEFAULT=0.3;
const LS_KEY='pk_cut_v1';
const INCH=2.54;
const GLASS_SHEETS_DEFAULT="36x60\n36x72\n36x84\n36x96\n48x60\n48x72\n48x84\n48x96\n60x72\n60x84\n60x96\n72x120\n84x120\n96x120";
// กระจก single source of truth: v=ค่าที่เก็บใน job.glassThick · label=แสดงผล · key=คีย์ราคาใน pricing
// เพิ่มความหนาใหม่ = เพิ่มแถวที่นี่ที่เดียว (migration/import จะ default เป็น '5' ถ้าค่าไม่รู้จัก)
const GLASS_THICKS=[
  {v:'5',label:'5 มม.',key:'glassPerSqft',mm:5},
  {v:'6',label:'6 มม.',key:'glassPerSqft6',mm:6},
  {v:'6T',label:'6 มม. temper',key:'glassPerSqft6T',mm:6.5},
  {v:'8',label:'8 มม. temper',key:'glassPerSqft8',mm:8},
  {v:'10',label:'10 มม. temper',key:'glassPerSqft10',mm:10}
];
function thickInfo(t){return GLASS_THICKS.find(x=>x.v===String(t))||GLASS_THICKS[0];}
function normThick(t){return GLASS_THICKS.some(x=>x.v===String(t))?String(t):'5';}
function thickPrice(t){return +((state.pricing||{})[thickInfo(t).key])||0;}
function thickMm(t){return thickInfo(t).mm;}
const GLASS_COLORS_DEFAULT=['ใส','ใสเขียว','ชาดำ','ฝ้า','ลอน'];
// default pricing สร้างจาก GLASS_THICKS — เพิ่มความหนาใหม่ไม่ต้องแก้ที่นี่
function defaultPricing(){const p={colors:[],glassColors:GLASS_COLORS_DEFAULT.slice(),railWeight:{},barPrice:{}};GLASS_THICKS.forEach(t=>p[t.key]=0);return p;}
let state={settings:{stock:STOCK_DEFAULT,kerf:KERF_DEFAULT,plusTop:2,glassKerf:0,glassSheets:GLASS_SHEETS_DEFAULT},
  site:{name:'',mainColor:'',glassColor:''},
  pricing:defaultPricing(),jobs:[]};
// label ชุด: ชื่อหลัก_ตำแหน่ง (ว่างข้างไหนตัดข้างนั้น)
function jobLabel(j){
  const site=(state.site&&state.site.name||'').trim(), pos=(j.name||'').trim();
  const nm=site&&pos?site+'_'+pos:(site||pos);
  return ('#'+(j.seq||'')+(nm?' '+nm:'')).trim();
}
// สีที่ใช้จริง: สีของชุด > สีหลัก > ว่าง
function effectiveColor(j){
  return (j.color&&j.color.trim())||((state.site&&state.site.mainColor||'').trim())||'';
}
// สีกระจกที่ใช้จริง: สีของชุด > สีกระจกหลัก > ว่าง
function effectiveGlassColor(j){
  return (j.glassColor&&j.glassColor.trim())||((state.site&&state.site.glassColor||'').trim())||'';
}
// ---- pricing helpers (pure) ----
function findColor(name){return (state.pricing.colors||[]).find(c=>c.name===name)||null;}
// ต้นทุนต่อเส้นของราง rail สำหรับสี colorObj : โหมดกิโล = น้ำหนัก/เส้น(ของราง) × ราคา/กก.(ของสี) ; โหมดเส้น = ราคา/เส้น(ราง×สี)
function barCost(rail,colorObj){
  if(!colorObj)return 0;
  if(colorObj.mode==='กิโล'){const w=+((state.pricing.railWeight||{})[rail])||0; return w*(+colorObj.kg||0);}
  return +(((state.pricing.barPrice||{})[rail]||{})[colorObj.name])||0;
}
function fmt(n){return (+n||0).toLocaleString('th-TH',{maximumFractionDigits:2});}

function sideDed(box){return box==='ไม่เสริม'?0.7:3.8;}
function postLen(box,H){return H-(box==='ไม่เสริม'?2.2:(box==='เสริม3'?5.5:9.3));}
function crossLen(base,box,W){const s=sideDed(box);
  if(base==='บานตาย')return (W-2*s-12)/2;
  if(base==='สลับ')return (W-2*s-14)/2;
  return (W-2*s-24-0.8)/4;}
function frameTB(box,W){return W-2*sideDed(box);}
function r2(x){return Math.round(x*100)/100;}
// แปลงเลขกรณีลืมเปลี่ยนภาษา: เลขไทย ๐-๙ + แป้นไทย Kedmanee แถวตัวเลข (ๅ/-ภถุึคตจ) → อารบิก
// แล้วเก็บเฉพาะ 0-9 กับจุดเดียว (strip อักขระแปลก + เครื่องหมายลบ = กันค่าติดลบตั้งแต่พิมพ์)
const NUM_MAP={'๐':'0','๑':'1','๒':'2','๓':'3','๔':'4','๕':'5','๖':'6','๗':'7','๘':'8','๙':'9','ๅ':'1','/':'2','-':'3','ภ':'4','ถ':'5','ุ':'6','ึ':'7','ค':'8','ต':'9','จ':'0'};
function normNum(s){
  let out='';
  for(const ch of String(s==null?'':s)) out+=(NUM_MAP[ch]!==undefined?NUM_MAP[ch]:ch);
  out=out.replace(/[^0-9.]/g,'');
  const i=out.indexOf('.');
  if(i>=0) out=out.slice(0,i+1)+out.slice(i+1).replace(/\./g,'');
  return out;
}

// returns array of pieces {rail,len} for one job (qty expanded)
function railLen(rail,base,box,W,H){
  if(rail.indexOf('เฟรมบน')===0||rail.indexOf('เฟรมล่าง')===0)return frameTB(box,W);
  if(rail.indexOf('เฟรมข้าง')===0)return H;
  if(rail==='เสากุญแจ'||rail==='เสาเกี่ยว'||rail==='เสาตาย'||rail==='ประกบกลาง')return postLen(box,H);
  if(rail==='ขวางบน'||rail==='ขวางล่าง')return crossLen(base,box,W);
  if(rail==='ธรณี')return W/2;
  return 0;
}
function slidingPieces(base,box,W,H){
  const out=[]; const tab=(QTY[base]||{})[box]||{};
  for(const rail in tab){const n=tab[rail],L=railLen(rail,base,box,W,H);
    for(let i=0;i<n;i++)out.push({rail,len:r2(L)});}
  return out;
}
function isClear(job){return job.type==='บานเลื่อน'&&job.clear&&job.clear!=='ไม่มี';}
function clearSupported(job){
  if(!isClear(job))return false;
  if(job.base==='บานตาย'||job.base==='สลับ')return true;
  if(job.base==='แบ่ง4'&&job.clear==='บน')return true;
  return false;
}
function isClearTop(job){return clearSupported(job)&&job.clear==='บน';}
function isSideTop(job){return job.type==='บานเลื่อน'&&job.clear==='ข้าง+บน';}
// โหมดกรอกส่วนล่าง (botMode='ล่าง') = กรอกขนาดช่องบานล่าง (botH) แล้วคำนวณช่องแสงบนกลับ (สูตรกลับด้านจาก forward เดิม)
function clearTopDc(job){ // บานเลื่อน ช่องแสงบน: Dc = H−Hp−9.3(ภายใน)/13.8(ภายนอก)
  if(job.botMode==='ล่าง')return r2((+job.H)-(+job.botH)-((job.clVariant||'ภายใน')==='ภายนอก'?13.8:9.3));
  return +job.clearSize;
}
function sideTopH1(job){ // ข้าง+บน: h1 = H−Hp−9.2
  if(job.botMode==='ล่าง')return r2((+job.H)-(+job.botH)-9.2);
  return +job.h1;
}
function fixTopDc(job){ // บานฟิกซ์ ช่องแสงบน: Dc = H−Bo−13.5
  if(job.botMode==='ล่าง')return r2((+job.H)-(+job.botH)-13.5);
  return +job.clearSize;
}
// ช่องแสงบน (ทุกฐาน: บานตาย/สลับ/แบ่ง4) — 2 variants ภายใน/ภายนอก, ซอย n. returns {outer,Wp,Hp}
function clearTop(job){
  const W=+job.W,H=+job.H,Dc=clearTopDc(job),plus=(+state.settings.plusTop)||0;
  const n=Math.max(2,parseInt(job.nSlit)||4), variant=job.clVariant||'ภายใน';
  const outer=[{rail:'กล่องร่อง',len:r2(H)},{rail:'กล่องร่อง',len:r2(H)},{rail:'กล่องร่อง',len:r2(W-9)}];
  for(let i=0;i<n-1;i++)outer.push({rail:'กล่องร่อง',len:r2(Dc+2.5)});
  for(let i=0;i<n-1;i++)outer.push({rail:'ตบร่อง',len:r2(Dc)});
  outer.push({rail:'กล่องเปิด',len:r2(W-9)},{rail:'ฝาปิด',len:r2(W-9)});
  if(variant==='ภายนอก')outer.push({rail:'กล่องเรียบ',len:r2(W-9)});
  const Wp=r2(W-9-0.3);
  const Hp=variant==='ภายนอก'?r2(H-13.5-Dc-0.3):r2(H-9-Dc-0.3);
  return {outer,Wp,Hp};
}
// returns {outer:[{rail,len}], Wp, Hp} for clear-light (Wp/Hp = inner pane dims)
function clearParts(job){
  const W=+job.W,H=+job.H,Dc=+job.clearSize,plus=(+state.settings.plusTop)||0;
  const outer=[];
  if(job.clear==='บน'){
    outer.push({rail:'กล่องร่อง',len:r2(W-9)},{rail:'กล่องร่อง',len:r2(W-9)},
               {rail:'กล่องร่อง',len:r2(H)},{rail:'กล่องร่อง',len:r2(H)},
               {rail:'กล่องร่อง',len:r2(Dc+plus)},{rail:'ตบร่อง',len:r2(Dc+plus)},
               {rail:'กล่องเปิด',len:r2(W-9)},{rail:'ฝาปิด',len:r2(W-9)});
    return {outer,Wp:r2(W-9-0.3),Hp:r2(H-13.5-Dc-0.3)};
  }
  outer.push({rail:'กล่องร่อง',len:r2(Dc)},{rail:'กล่องร่อง',len:r2(H)},
             {rail:'ตบร่อง',len:r2(H)},{rail:'กล่องเปิด',len:r2(Dc)},{rail:'ฝาปิด',len:r2(Dc)},
             {rail:'กล่องเรียบ',len:r2(W-13.5-Dc)},{rail:'กล่องเรียบ',len:r2(W-13.5-Dc)},
             {rail:'กล่องเรียบ',len:r2(H)},{rail:'กล่องเรียบ',len:r2(H)});
  return {outer,Wp:r2(W-13.5-Dc-0.3),Hp:r2(H-9-0.3)};
}
// บานเลื่อน + ช่องแสง ข้าง+บน (ซ้าย w1 · ขวา w2 · บน h1 ซอย n) + บานเลื่อนกลาง (เลือกฐาน box ไม่เสริม) · ไม่มีฉากกันตก
function sideTopPieces(job){
  const W=+job.W,H=+job.H,w1=+job.w1,w2=+job.w2,h1=sideTopH1(job);
  const n=Math.min(60,Math.max(2,parseInt(job.nSlit)||2));
  const Wmid=W-w1-w2-18;
  const out=[];const push=(rail,len,k)=>{for(let i=0;i<k;i++)out.push({rail,len:r2(len)});};
  push('กล่องร่อง',H,2);
  push('กล่องร่อง',H-2,2);
  push('กล่องร่อง',W-9,1);
  push('กล่องร่อง',h1+2.5,n-1);
  push('กล่องเปิด',w1,2);push('กล่องเปิด',w2,2);push('กล่องเปิด',Wmid,1);
  push('ฝาปิด',w1,2);push('ฝาปิด',w2,2);push('ฝาปิด',Wmid,1);
  push('ตบร่อง',w1,1);push('ตบร่อง',w2,1);push('ตบร่อง',H-2,2);
  push('ตบเรียบ',Wmid,1);
  return out.concat(slidingPieces(job.base,'ไม่เสริม',Wmid-0.2,H-h1-9-0.2));
}
function sideTopGlass(job){
  const W=+job.W,H=+job.H,w1=+job.w1,w2=+job.w2,h1=sideTopH1(job);
  const n=Math.min(60,Math.max(2,parseInt(job.nSlit)||2));
  const sideH=r2(H-h1-13.5+1.2), Wp=W-w1-w2-18-0.2, Hp=H-h1-9-0.2, base=job.base;
  const g=[];
  const panes=((QTY[base]||{})['ไม่เสริม']||{})['ขวางบน']||0;
  if(panes)g.push({label:'บานเลื่อน',w:r2(crossLen(base,'ไม่เสริม',Wp)+1.5),h:r2(postLen('ไม่เสริม',Hp)-8),qty:panes});
  g.push({label:'ช่องแสงซ้าย',w:r2(w1+1.5),h:sideH,qty:1});
  g.push({label:'ช่องแสงขวา',w:r2(w2+1.5),h:sideH,qty:1});
  const topH=r2(h1+1.2);
  g.push({label:'ช่องแสงบนซ้าย',w:r2(w1+1.5),h:topH,qty:1});
  g.push({label:'ช่องแสงบนขวา',w:r2(w2+1.5),h:topH,qty:1});
  g.push({label:'ช่องแสงบนกลาง',w:r2((W-18-w1-w2-4.5*(n-1))/n+1.5),h:topH,qty:n});
  return g;
}
// บานเลื่อน 3 รางเปิดอิสระ — 2 variants: เสริมเรียบ / เสริมกล่อง 1"*4"
// 3 ราง: '3 รางอิสระ' (เดิม) / '3 ราง ฟิกข้าง' — ต่างกันที่ขวาง; '3 ราง' (ชื่อเก่า) = อิสระ
function is3Track(b){return b==='3 รางอิสระ'||b==='3 ราง ฟิกข้าง'||b==='3 ราง';}
function threeTrackCross(base,Wp){return base==='3 ราง ฟิกข้าง'?(Wp-1.4-16)/3:(Wp-1.4-18)/3;}
// กล่อง/แบบ: เสริมเรียบ/เสริมกล่อง 1"*4" × 3 ด้าน/4 ด้าน (ชื่อเก่าไม่มี "ด้าน" = 3 ด้าน)
function threeTrackDims(job){
  const W=+job.W,H=+job.H,box=job.box||'';
  const isBox14=box.indexOf('เสริมกล่อง')===0;
  const four=box.indexOf('4 ด้าน')>=0;
  return {
    railName:isBox14?'กล่อง 1"*4"':'กล่องเรียบ',
    wCut:isBox14?W-5:W-9, nW:four?2:1, H,
    Wp:isBox14?W-5-0.3:W-9-0.3,
    Hp:isBox14?(four?H-5-0.3:H-2.5-0.3):(four?H-9-0.3:H-4.5-0.3)
  };
}
function threeTrack(job){
  const d=threeTrackDims(job),out=[];
  out.push({rail:d.railName,len:r2(d.H)},{rail:d.railName,len:r2(d.H)});
  for(let i=0;i<d.nW;i++)out.push({rail:d.railName,len:r2(d.wCut)});
  const Wp=d.Wp,Hp=d.Hp;
  const ftb=r2(Wp-1.4), side=r2(Hp-2.3), sideFrame=r2(Hp), cross=r2(threeTrackCross(job.base,Wp));
  out.push({rail:'เฟรมบน 3 ราง',len:ftb},{rail:'เฟรมล่าง 3 ราง',len:ftb},
           {rail:'เฟรมข้าง 3 ราง',len:sideFrame},{rail:'เฟรมข้าง 3 ราง',len:sideFrame});
  if(job.base==='3 ราง ฟิกข้าง'){
    out.push({rail:'เสากุญแจ',len:side});
    for(let i=0;i<4;i++)out.push({rail:'เสาเกี่ยว',len:side});
    out.push({rail:'เสาตาย',len:side});
  }else{
    for(let i=0;i<2;i++)out.push({rail:'เสากุญแจ',len:side});
    for(let i=0;i<4;i++)out.push({rail:'เสาเกี่ยว',len:side});
  }
  for(let i=0;i<3;i++)out.push({rail:'ขวางบน',len:cross});
  for(let i=0;i<3;i++)out.push({rail:'ขวางล่าง',len:cross});
  return out;
}
// ฉากกันตก: ติดกล่อง(เสริม3/4 หรือ ช่องแสง) = W-9 ; ไม่ติดกล่อง(ไม่เสริม) = W ; 1 เส้น. บานกระทุ้งไม่มี
function antiFallLen(job){
  const W=+job.W;
  const boxed = isClear(job) ? true : (job.box==='เสริม3'||job.box==='เสริม4');
  return r2(boxed? W-9 : W);
}
// บานกระทุ้ง pieces (reusable) for box=ติดกล่อง/ไม่ติดกล่อง
function awningPieces(W,H,box){
  const out=[],tab=QTY['บานกระทุ้ง'][box]||{};
  const lenK={'กล่องเรียบ':[W-9,H],
    'กรอบนอกบานกระทุ้ง':box==='ติดกล่อง'?[W-9-0.3+0.6,H-9-0.3+0.6]:[W+0.6,H+0.6],
    'กรอบในบานกระทุ้ง':box==='ติดกล่อง'?[W-11.6,H-11.6]:[W-2.4,H-2.4],
    'คิ้วบานกระทุ้ง':box==='ติดกล่อง'?[W-11.6,H-11.6]:[W-2.4,H-2.4]};
  for(const rail in tab){const half=tab[rail]/2,pair=lenK[rail];
    for(let i=0;i<half;i++)out.push({rail,len:r2(pair[0])});
    for(let i=0;i<half;i++)out.push({rail,len:r2(pair[1])});}
  return out;
}
// บานกระทุ้ง + ช่องแสงบน/ล่าง : กรอบนอก+คิ้วช่องแสง + บานกระทุ้งไม่ติดกล่อง(บนขนาดแปลง)
function kraToongClear(job){
  const W=+job.W,H=+job.H,Dc=+job.clearSize;
  return {Wp:r2(W-9-0.3), Hp:r2(H-27-Dc-0.3)};
}
function kraToongClearPieces(job){
  const W=+job.W,H=+job.H,Dc=+job.clearSize;
  const {Wp,Hp}=kraToongClear(job);
  const out=[
    {rail:'กล่องเรียบ',len:r2(H)},{rail:'กล่องเรียบ',len:r2(H)},
    {rail:'กล่องเรียบ',len:r2(W-9)},{rail:'กล่องเรียบ',len:r2(W-9)},{rail:'กล่องเรียบ',len:r2(W-9)},
    {rail:'ตบเรียบ',len:r2(W-9)},
    {rail:'คิ้วลอยเทใหญ่',len:r2(Dc-0.1)},{rail:'คิ้วลอยเทใหญ่',len:r2(Dc-0.1)},
    {rail:'คิ้วลอยเทใหญ่',len:r2(W-9-0.1-2.8)},{rail:'คิ้วลอยเทใหญ่',len:r2(W-9-0.1-2.8)},
    {rail:'คิ้วลอยเทเล็ก',len:r2(Dc-0.1)},{rail:'คิ้วลอยเทเล็ก',len:r2(Dc-0.1)},
    {rail:'คิ้วลอยเทเล็ก',len:r2(W-9-0.1-2.8)},{rail:'คิ้วลอยเทเล็ก',len:r2(W-9-0.1-2.8)}
  ];
  return out.concat(awningPieces(Wp,Hp,'ไม่ติดกล่อง'));
}
// บานเลื่อนรางแขวน (เดี่ยว / แยกกลาง) · box='ไม่เสริม'|'เสริมกล่อง 2 ด้าน'
// กล่อง 1.6"×1.6" (ข้าง) = H+8.8 · จำนวน: แยกกลาง=2 เสมอ · เดี่ยว ไม่เสริม=1 / เสริมกล่อง 2 ด้าน=2
function hangPieces(base,W,H,box){
  const out=[];
  const push=(rail,len,n)=>{for(let i=0;i<n;i++)out.push({rail,len:r2(len)});};
  const reinforce=box==='เสริมกล่อง 2 ด้าน';
  if(base==='รางแขวนแยกกลาง'){
    push('รางแขวน',2*W,1);
    push('กล่อง 1.6"*1.6"',2*W,1);
    push('กล่อง 1.6"*1.6"',H+8.8,2);
    push('เสาประตู',H-0.8,4);
    push('ขวางบน',(W-5-5-0.2)/2,2);
    push('ขวางล่าง',(W-5-5-0.2)/2,2);
    push('คิ้วประตู',(W-5-5)/2,8);
    push('คิ้วประตู',H-5.1-8-0.8,8);
  }else{
    push('รางแขวน',2*W,1);
    push('กล่อง 1.6"*1.6"',2*W,1);
    push('กล่อง 1.6"*1.6"',H+8.8,reinforce?2:1);
    push('เสาประตู',H-0.8,2);
    push('ขวางบน',W-5,1);
    push('ขวางล่าง',W-5,1);
    push('คิ้วประตู',W-5,4);
    push('คิ้วประตู',H-5.1-8-0.8,4);
  }
  return out;
}
// บานฟิกซ์ (กระจกตาย) — 3 โหมดผ่าน box: 'ธรรมดา' | 'ช่องแสงบน' | 'แบ่งหลายช่อง' · 9 = หน้าร่อง
function fixPieces(job){
  const W=+job.W,H=+job.H,mode=job.box||'ธรรมดา';
  const out=[]; const push=(rail,len,n)=>{for(let i=0;i<n;i++)out.push({rail,len:r2(len)});};
  if(mode==='ช่องแสงบน'){
    push('กล่องร่อง',H,2);
    push('กล่องร่อง',W-9,1);
    push('กล่องเปิด',W-9,2);
    push('ฝาปิด',W-9,2);
    push('ตบร่อง',W-9,1);
  }else if(mode==='ช่องแสงบน+ซอย'){
    const n=Math.min(60,Math.max(2,parseInt(job.nSlit)||2));
    const nh=Math.min(20,Math.max(1,parseInt(job.nh)||1));
    const colW=(W-9-(n-1)*4.5)/n;
    push('กล่องร่อง',W-9,1);
    push('กล่องร่อง',H,2);
    push('กล่องร่อง',H-9+2.5,n-1);
    push('กล่องเปิด',colW,n*nh);
    push('กล่องเปิด',W-9,1);
    push('ฝาปิด',colW,n*nh);
    push('ฝาปิด',W-9,1);
    push('ตบร่อง',colW,n*nh);
    push('ตบร่อง',H-9+2.5,n-1);
  }else if(mode==='แบ่งหลายช่อง'){
    const n=Math.min(60,Math.max(2,parseInt(job.nSlit)||2));
    push('กล่องร่อง',H,2);
    push('กล่องร่อง',W-9,1);
    push('กล่องร่อง',H-9+2.5,n-1);
    push('ตบร่อง',H-9+2.5,n-1);
    push('กล่องเปิด',W-9,1);
    push('ฝาปิด',W-9,1);
  }else{
    push('กล่องร่อง',H,2);
    push('กล่องร่อง',W-9,1);
    push('กล่องเปิด',W-9,1);
    push('ฝาปิด',W-9,1);
  }
  return out;
}
function fixGlass(job){
  const W=+job.W,H=+job.H,mode=job.box||'ธรรมดา';
  if(mode==='ช่องแสงบน'){
    const Dc=fixTopDc(job);
    return [{label:'บานฟิกซ์',w:r2(W-9+1.5),h:r2(H-Dc-13.5+1.2),qty:1},
            {label:'ช่องแสง',w:r2(W-9+1.5),h:r2(Dc+1.2),qty:1}];
  }
  if(mode==='ช่องแสงบน+ซอย'){
    const n=Math.min(60,Math.max(2,parseInt(job.nSlit)||2)),nh=Math.min(20,Math.max(1,parseInt(job.nh)||1));
    const w=r2((W-9-(n-1)*4.5)/n+1.5);
    const hs=[];
    if(job.botMode==='ล่าง'){ // กรอกบานล่าง Bo + h1..h(nh-1) → ชั้นสุดท้ายคำนวณให้
      for(let i=0;i<nh-1;i++)hs.push(+((job.clearSizes||[])[i])||0);
      hs.push(r2(H-9-4.5*nh-(+job.botH)-hs.reduce((a,b)=>a+b,0)));
    }else{ for(let i=0;i<nh;i++)hs.push(+((job.clearSizes||[])[i])||0); }
    const sumH=hs.reduce((a,b)=>a+b,0);
    const g=[{label:'บานฟิกซ์',w:w,h:r2(H-9-4.5*nh-sumH+1.2),qty:n}];
    hs.forEach((hi,idx)=>g.push({label:nh>1?'ช่องแสง'+(idx+1):'ช่องแสง',w:w,h:r2(hi+1.2),qty:n}));
    return g;
  }
  if(mode==='แบ่งหลายช่อง'){
    const n=Math.min(60,Math.max(2,parseInt(job.nSlit)||2));
    return [{label:'บานฟิกซ์',w:r2((W-9-4.5*(n-1)+1.5)/n),h:r2(H-9+1.2),qty:n}];
  }
  return [{label:'บานฟิกซ์',w:r2(W-9+1.5),h:r2(H-9+1.2),qty:1}];
}
// ════════ [GLWO] ตารางลงทะเบียนสูตร (registry · 6 พ.ย. 2026) ════════
//  1 แถว = 1 รูปแบบงาน: match(job) ใช้สูตรนี้ไหม · pieces(job) → ราง [{rail,len}] · glass(job) → กระจก [{label,w,h,qty}] · probes = งานตัวอย่าง (รายชื่อรางในหน้าราคา)
//  ⚠ ลำดับแถว = ลำดับเลือกสูตร (แถวเฉพาะเจาะจงต้องมาก่อน) · เพิ่มรูปแบบใหม่ = เพิ่มแถวก่อนแถว 'slide' (ตัวตั้งต้นท้ายสุด)
//  ⚠ คงพฤติกรรมเดิม: เครื่องมือเดิมเช็ค "ช่องแสงข้าง+บน" ของกระจกก่อนรางแขวน/3 ราง (ฝั่งรางเช็คทีหลัง) → glass ของ 2 แถวนั้นใช้ gcSideTopFirst_
function hangGlass(job){const W=+job.W,H=+job.H;return [{label:'กระจก',w:r2(W-5-0.7),h:r2(H-0.8-5.1-8-0.7),qty:1}];}
function hangSplitGlass(job){const W=+job.W,H=+job.H;return [{label:'กระจก',w:r2((W-5-5-0.2)/2-0.7),h:r2(H-5.1-8-0.8-0.7),qty:2}];}
function threeTrackGlass(job){
  const d=threeTrackDims(job);
  const cross=threeTrackCross(job.base,d.Wp), post=d.Hp-2.3;
  return [{label:'บานเลื่อน',w:r2(cross+1.5),h:r2(post-8),qty:3}];
}
function awningClearGlass(job){
  const W=+job.W,Dc=+job.clearSize,{Wp,Hp}=kraToongClear(job);
  return [{label:'ช่องแสง',w:r2(W-9-1),h:r2(Dc-1),qty:1},
          Object.assign({},awningGlass(Wp,Hp,'ไม่ติดกล่อง'),{label:'กระจกบานกระทุ้ง'})];
}
function clearTopGlass(job){
  const base=job.base,W=+job.W,g=[];
  const {Wp,Hp}=clearTop(job);
  const n=Math.max(2,parseInt(job.nSlit)||4);
  const panes=((QTY[base]||{})['ไม่เสริม']||{})['ขวางบน']||0;
  if(panes)g.push({label:'บานเลื่อน',w:r2(crossLen(base,'ไม่เสริม',Wp)+1.5),h:r2(postLen('ไม่เสริม',Hp)-8),qty:panes});
  g.push({label:'ช่องแสง',w:r2(((W-9-(n-1)*4.5)/n)+1.6),h:r2(clearTopDc(job)+1.2),qty:n});
  return g;
}
function clearSideGlass(job){
  const base=job.base,H=+job.H,Dc=+job.clearSize,g=[];
  const {Wp,Hp}=clearParts(job);
  const panes=((QTY[base]||{})['ไม่เสริม']||{})['ขวางบน']||0;
  if(panes)g.push({label:'บานเลื่อน',w:r2(crossLen(base,'ไม่เสริม',Wp)+1.5),h:r2(postLen('ไม่เสริม',Hp)-8),qty:panes});
  g.push({label:'ช่องแสง',w:r2(Dc+1.5),h:r2(H-9+1.2),qty:1});
  return g;
}
function clearPiecesFor(job){
  const {outer,Wp,Hp}=isClearTop(job)?clearTop(job):clearParts(job);
  return outer.concat(slidingPieces(job.base,'ไม่เสริม',Wp,Hp)).concat([{rail:'ฉากกันตก',len:antiFallLen(job)}]);
}
function slideGlass(job){
  const base=job.base,box=job.box,W=+job.W,H=+job.H,panes=((QTY[base]||{})[box]||{})['ขวางบน']||0;
  if(!panes)return [];
  return [{label:'บานเลื่อน',w:r2(crossLen(base,box,W)+1.5),h:r2(postLen(box,H)-8),qty:panes}];
}
// ── [SCREEN] พร้อมมุ้ง: บานเลื่อน บานตาย เสริมกล่อง 4 ด้าน (เจ้าของกำหนด 7 พ.ย. 2026) ──
//  ขนาดมุ้ง: กว้าง = (กว้างบานเลื่อน − 7.6)/2 + 4 · สูง = สูง − 10.4 · 1 บานต่อชุด
//  ชิ้นตัด = สูตร "มุ้งบานเลื่อน" ของ PK Dispatch (PKP_SCUT['มุ้งบานเลื่อน'] ใน app.html) — ⚠ แก้ที่โน่นต้องแก้ที่นี่ด้วย (เทสเทียบให้)
//  ปัดทศนิยม 1 ตำแหน่งต่อชิ้นแบบ PK Dispatch (Math.round(x*10)/10)
function screenAllowed(job){return job.type==='บานเลื่อน'&&job.base==='บานตาย'&&job.box==='เสริม4'&&(!job.clear||job.clear==='ไม่มี');}
function hasScreen(job){return screenAllowed(job)&&job.screen==='พร้อมมุ้ง';}
function screenSize(job){return {w:r2((+job.W-7.6)/2+4),h:r2(+job.H-10.4)};}
const SCREEN_SLIDE=[
  {rail:'เส้นมุ้งบานเลื่อน',fn:(w,h)=>w+0.6,qty:2},   // บน/ล่าง (กว้าง+0.6)
  {rail:'เส้นมุ้งบานเลื่อน',fn:(w,h)=>h+0.6,qty:2},   // ข้าง (สูง+0.6)
  {rail:'เส้นกลาง (มุ้ง)',fn:(w,h)=>w-5,qty:1}         // กลาง (กว้าง-5)
];
function screenPieces(job){
  const s=screenSize(job),out=[];
  if(!(s.w>0&&s.h>0))return out;
  SCREEN_SLIDE.forEach(r=>{const len=Math.round(r.fn(s.w,s.h)*10)/10;if(len>0)for(let i=0;i<r.qty;i++)out.push({rail:r.rail,len});});
  return out;
}
function gcSideTopFirst_(fn){return job=>isSideTop(job)?sideTopGlass(job):fn(job);}
const _PW=300,_PH=220;
const GC_FORMULAS=[
  { key:'fix', label:'บานฟิกซ์', match:j=>j.type==='บานฟิกซ์', pieces:fixPieces, glass:fixGlass,
    probes:['ธรรมดา','ช่องแสงบน','แบ่งหลายช่อง','ช่องแสงบน+ซอย'].map(box=>({type:'บานฟิกซ์',box,clearSize:40,nSlit:3,W:100,H:200})) },
  { key:'awningClear', label:'บานกระทุ้ง ช่องแสงบน/ล่าง', match:j=>j.type==='บานกระทุ้ง'&&j.box==='ช่องแสงบน/ล่าง', pieces:kraToongClearPieces, glass:awningClearGlass,
    probes:[{type:'บานกระทุ้ง',box:'ช่องแสงบน/ล่าง',clearSize:40,W:100,H:200}] },
  { key:'awning', label:'บานกระทุ้ง', match:j=>j.type==='บานกระทุ้ง', pieces:j=>awningPieces(+j.W,+j.H,j.box), glass:j=>[awningGlass(+j.W,+j.H,j.box)],
    probes:['ติดกล่อง','ไม่ติดกล่อง'].map(box=>({type:'บานกระทุ้ง',box,clearSize:40,W:100,H:200})) },
  { key:'hang', label:'รางแขวน', match:j=>j.base==='รางแขวน', pieces:j=>hangPieces(j.base,+j.W,+j.H,j.box), glass:gcSideTopFirst_(hangGlass),
    probes:[{type:'บานเลื่อน',base:'รางแขวน',box:'ไม่เสริม',clear:'ไม่มี',W:_PW,H:_PH}] },
  { key:'hangSplit', label:'รางแขวนแยกกลาง', match:j=>j.base==='รางแขวนแยกกลาง', pieces:j=>hangPieces(j.base,+j.W,+j.H,j.box), glass:gcSideTopFirst_(hangSplitGlass),
    probes:[{type:'บานเลื่อน',base:'รางแขวนแยกกลาง',box:'ไม่เสริม',clear:'ไม่มี',W:_PW,H:_PH}] },
  { key:'track3', label:'3 ราง', match:j=>is3Track(j.base), pieces:threeTrack, glass:gcSideTopFirst_(threeTrackGlass),
    probes:['3 รางอิสระ','3 ราง ฟิกข้าง'].reduce((a,base)=>a.concat(['เสริมเรียบ 3 ด้าน','เสริมเรียบ 4 ด้าน','เสริมกล่อง 1"*4" 3 ด้าน','เสริมกล่อง 1"*4" 4 ด้าน'].map(box=>({type:'บานเลื่อน',base,box,clear:'ไม่มี',W:_PW,H:_PH}))),[]) },
  { key:'sideTop', label:'บานเลื่อน ช่องแสงข้าง+บน', match:isSideTop, pieces:sideTopPieces, glass:sideTopGlass,
    probes:['บานตาย','สลับ','แบ่ง4'].map(base=>({type:'บานเลื่อน',base,clear:'ข้าง+บน',w1:30,w2:30,h1:40,nSlit:3,W:300,H:220})) },
  { key:'clearTop', label:'บานเลื่อน ช่องแสงบน', match:isClearTop, pieces:clearPiecesFor, glass:clearTopGlass,
    probes:['บานตาย','สลับ','แบ่ง4'].reduce((a,base)=>a.concat(['ภายใน','ภายนอก'].map(v=>({type:'บานเลื่อน',base,box:'ไม่เสริม',clear:'บน',clVariant:v,nSlit:3,clearSize:40,W:_PW,H:_PH}))),[]) },
  { key:'clearSide', label:'บานเลื่อน ช่องแสงข้าง', match:clearSupported, pieces:clearPiecesFor, glass:clearSideGlass,
    probes:['บานตาย','สลับ'].map(base=>({type:'บานเลื่อน',base,box:'ไม่เสริม',clear:'ข้าง',clearSize:40,W:_PW,H:_PH})) },
  { key:'slideScreen', label:'บานเลื่อน บานตาย เสริมกล่อง 4 ด้าน + มุ้ง', match:hasScreen,
    pieces:j=>slidingPieces(j.base,j.box,+j.W,+j.H).concat([{rail:'ฉากกันตก',len:antiFallLen(j)}]).concat(screenPieces(j)), glass:slideGlass,
    probes:[{type:'บานเลื่อน',base:'บานตาย',box:'เสริม4',clear:'ไม่มี',screen:'พร้อมมุ้ง',W:_PW,H:_PH}] },
  { key:'slide', label:'บานเลื่อน', match:()=>true, pieces:j=>slidingPieces(j.base,j.box,+j.W,+j.H).concat([{rail:'ฉากกันตก',len:antiFallLen(j)}]), glass:slideGlass,
    probes:['บานตาย','สลับ','แบ่ง4'].reduce((a,base)=>a.concat(['ไม่เสริม','เสริม3','เสริม4'].map(box=>({type:'บานเลื่อน',base,box,clear:'ไม่มี',W:_PW,H:_PH}))),[]) }
];
function gcFormulaOf(job){return GC_FORMULAS.find(r=>r.match(job));}
function piecesFor(job){return gcFormulaOf(job).pieces(job);}
// กระจกต่อชุด (บานเลื่อน: จำนวน = จำนวนบาน (ขวางบน) · ช่องแสงตามสูตรของแถว)
function glassFor(job){
  // ⚠ คงพฤติกรรมเดิม: กระจกของงานกระทุ้ง/ฟิกซ์ตัดสินด้วยชนิดงานก่อน ไม่สนฐาน (ฝั่งรางก็เหมือนกัน)
  return gcFormulaOf(job).glass(job);
}
let _ALL_RAILS=null;
function allKnownRails(){
  if(_ALL_RAILS)return _ALL_RAILS;
  const s=new Set();
  // ลำดับรางในหน้าราคา = ลำดับ probe ของเครื่องมือเดิม (แถวใหม่ที่ไม่อยู่ในรายการ ต่อท้าย)
  const ORDER=['slide','clearTop','clearSide','sideTop','track3','hang','hangSplit','awning','awningClear','fix'];
  GC_FORMULAS.slice().sort((a,b)=>{const ia=ORDER.indexOf(a.key),ib=ORDER.indexOf(b.key);return (ia<0?99:ia)-(ib<0?99:ib);}).forEach(r=>(r.probes||[]).forEach(j=>{try{piecesFor(j).forEach(p=>s.add(p.rail));}catch(e){}}));
  s.add('ลูกฟูก'); // จากวัสดุบาน
  _ALL_RAILS=[...s];
  return _ALL_RAILS;
}

// glass per job (sliding only; clear-light glass is v2). count = #panes (ขวางบน qty)
// v2 clear-light glass rule (recorded): FIX ข้าง -> w=clear+1.5, h=H-9+1.5 ; FIX บน -> h=clear+1.5, w=W-9+1.5
function awningGlass(W,H,box){
  const base = box==='ติดกล่อง'?[W-9-0.3,H-9-0.3]:[W,H];
  return {label:'กระจก',w:r2(base[0]-3-6.5),h:r2(base[1]-3-6.5),qty:1};
}

// Best-Fit-Decreasing per rail. pieces:[{len,label}], stock,kerf
function optimizeRail(pieces,stock,kerf){
  const sorted=pieces.slice().sort((a,b)=>b.len-a.len);
  const bins=[]; const over=[];
  for(const p of sorted){
    if(p.len>stock){over.push(p);continue;}
    let best=-1,bestRem=Infinity;
    for(let i=0;i<bins.length;i++){
      const b=bins[i];
      const need=b.pieces.length===0?p.len:b.used+kerf+p.len;
      const rem=stock-need;
      if(rem>=-1e-9 && rem<bestRem){bestRem=rem;best=i;}
    }
    if(best===-1){bins.push({pieces:[p],used:p.len});}
    else{const b=bins[best]; b.used=b.used+kerf+p.len; b.pieces.push(p);}
  }
  return {bins,over};
}

// ---------- glass 2D guillotine optimizer (rotation allowed, minimize waste area) ----------
function parseSheets(txt){
  const out=[];
  (txt||'').split(/\n+/).forEach(line=>{
    const m=line.trim().match(/^(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/i);
    if(m){const wi=+m[1],hi=+m[2]; if(wi>0&&hi>0)out.push({wi,hi,w:r2(wi*INCH),h:r2(hi*INCH)});}
  });
  return out;
}
// pack as many pieces as possible into ONE sheet; guillotine split, rotation allowed
function packSheet(SW,SH,pieces){
  const free=[{x:0,y:0,w:SW,h:SH}];
  const placed=[],usedIds={};
  const order=pieces.slice().sort((a,b)=>(b.w*b.h)-(a.w*a.h));
  for(const p of order){
    let bi=-1,brot=false,bscore=Infinity;
    for(let i=0;i<free.length;i++){const f=free[i];
      if(p.w<=f.w+1e-9&&p.h<=f.h+1e-9){const s=f.w*f.h-p.w*p.h; if(s<bscore){bscore=s;bi=i;brot=false;}}
      if(p.h<=f.w+1e-9&&p.w<=f.h+1e-9){const s=f.w*f.h-p.h*p.w; if(s<bscore){bscore=s;bi=i;brot=true;}}
    }
    if(bi<0)continue;
    const f=free[bi], pw=brot?p.h:p.w, ph=brot?p.w:p.h;
    placed.push({x:f.x,y:f.y,w:pw,h:ph,rot:brot,id:p.id,label:p.label,piece:p});
    usedIds[p.id]=true;
    const right={x:f.x+pw,y:f.y,w:f.w-pw,h:ph};   // guillotine: right strip (piece height)
    const top={x:f.x,y:f.y+ph,w:f.w,h:f.h-ph};    //            + top strip (full width)
    free.splice(bi,1);
    if(right.w>1e-6&&right.h>1e-6)free.push(right);
    if(top.w>1e-6&&top.h>1e-6)free.push(top);
  }
  return {placed,placedArea:placed.reduce((s,p)=>s+p.w*p.h,0),usedIds};
}
// sizes:[{w,h,qty}] (cm) ; sheets:[{wi,hi,w,h}] ; gkerf cm
function optimizeGlass(sizes,sheets,gkerf){
  let rects=[],nid=0;
  sizes.forEach(s=>{for(let i=0;i<s.qty;i++)rects.push({id:nid++,w:s.w,h:s.h,gw:s.w+gkerf,gh:s.h+gkerf,label:r2(s.w)+'×'+r2(s.h)});});
  const fits=(r,sh)=>(r.gw<=sh.w+1e-9&&r.gh<=sh.h+1e-9)||(r.gh<=sh.w+1e-9&&r.gw<=sh.h+1e-9);
  const oversized=rects.filter(r=>!sheets.some(sh=>fits(r,sh)));
  let remaining=rects.filter(r=>sheets.some(sh=>fits(r,sh)));
  const used=[]; let guard=0;
  while(remaining.length&&guard++<3000){
    remaining.sort((a,b)=>(b.gw*b.gh)-(a.gw*a.gh));
    const big=remaining[0];
    const cands=sheets.filter(sh=>fits(big,sh));
    let best=null;
    for(const sh of cands){
      const packIn=remaining.map(r=>({id:r.id,w:r.gw,h:r.gh,label:r.label,ref:r}));
      const res=packSheet(sh.w,sh.h,packIn);
      const waste=sh.w*sh.h-res.placedArea, area=sh.w*sh.h;
      if(!best||waste<best.waste-1e-6||(Math.abs(waste-best.waste)<1e-6&&area<best.area))best={sh,res,waste,area};
    }
    if(!best)break;
    used.push({sheet:best.sh,placed:best.res.placed});
    remaining=remaining.filter(r=>!best.res.usedIds[r.id]);
  }
  return {used,oversized,leftover:remaining};
}

