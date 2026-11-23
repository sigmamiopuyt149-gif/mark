var $=function(i){return document.getElementById(i)}, root=document.documentElement;
var S={A:0,B:0,sec:0,run:false,base:45,add:0,spd:1,last:0,sp:'football',cat:'m',sA:0,sB:0,sets:[]}, gt=null;
var SPORTS={
 football:{n:'ฟุตบอล',ic:'⚽',unit:'ประตู',steps:[1],big:'ประตู!',base:45},
 basketball:{n:'บาสเกตบอล',ic:'🏀',unit:'คะแนน',steps:[1,2,3],big:'',base:10},
 volleyball:{n:'วอลเลย์บอล',ic:'🏐',unit:'แต้ม',steps:[1],sets:true,need:3,to:25,big:'POINT'},
 takraw:{n:'เซปักตะกร้อ',ic:'🥎',unit:'แต้ม',steps:[1],sets:true,need:2,to:21,big:'POINT'}};
Object.keys(SPORTS).forEach(function(k){SPORTS[k].id=k});
var CATS={m:{n:'ชาย',ic:'👨',c:'#2563eb'},f:{n:'หญิง',ic:'👩',c:'#db2777'},x:{n:'ผสม',ic:'👫',c:'#7c3aed'}};
function SP(){return SPORTS[S.sp]||SPORTS.football}
function sc(){return SP().sets?{a:S.sA||0,b:S.sB||0}:{a:S.A,b:S.B}}
var BS='dash',TM=[],FX=[],VD=0,VT='matches',LVO=false,COL={},MDI=null,MDT='info',ROLE='view',DB=null,LIVE=false,CAN=false;
var _sk='',FSP='all',FCT='all',TSP='football',TCT='all',LU={A:[],B:[]},annT=null;
var V={on:false,start:0,wasRun:false,total:0,count:0,added:0,t:'A',n:'',spd:1};
var EV=[];

function pad(n){return (n<10?'0':'')+n}
function fmt(){
  if(SP().sets)return 'เซ็ต '+((S.sA||0)+(S.sB||0)+1);
  var s=Math.floor(S.sec), bs=S.base*60;
  if(s>=bs && (S.add>0 || s>bs)){var ex=Math.floor((s-bs)/60)+1;return S.base+'+'+ex+"'"}
  return pad(Math.floor(s/60))+':'+pad(s%60);
}
function stat(){
  var end=(S.base+S.add)*60, t=$('stat');
  if(SP().sets){t.textContent='ชนะเซ็ต '+(S.sA||0)+' - '+(S.sB||0);return}
  if(S.sec>=end) t.textContent='หมดเวลา';
  else if(V.on) t.textContent='⏸ VAR หยุดเวลา';
  else if(S.run) t.textContent='● LIVE';
  else t.textContent=S.sec>0?'หยุดเวลา':'พร้อม';
}
function render(){$('stopInfo').textContent='⏹ นาฬิกาจะหยุดที่ '+mmss((S.base+S.add)*60)+'  (เวลาปกติ '+S.base+' นาที + ทดเวลา '+S.add+' นาที)';$('time').textContent=fmt();stat();var b=$('run');b.textContent=S.run?'⏸ หยุด':'▶ เริ่ม';b.className=S.run?'stop':'go'}
function paint(){
  root.style.setProperty('--ca',$('colA').value);
  root.style.setProperty('--cb',$('colB').value);
  root.style.setProperty('--accent',$('colT').value);
  $('abA').textContent=($('inA').value||'เหย้า').toUpperCase();
  $('abB').textContent=($('inB').value||'เยือน').toUpperCase();
  uiSport();updateRes();
}
function save(){try{localStorage.setItem('sb2',JSON.stringify({A:S.A,B:S.B,sec:S.sec,base:S.base,add:S.add,spd:S.spd,fin:S.fin,sid:S.sid,sp:S.sp,cat:S.cat,sA:S.sA,sB:S.sB,sets:S.sets,f:['nameA','inA','colA','nameB','inB','colB','colT'].map(function(i){return $(i).value})}))}catch(e){}push()}

function tick(){
  if(!S.run)return;
  var now=Date.now(), end=(S.base+S.add)*60, prev=S.sec;
  S.sec+=(now-S.last)/1000*S.spd; S.last=now;
  if(S.sec>=end){S.sec=prev<end?end:prev;S.run=false;save();logEv({type:'time',title:'ถึงเวลาที่ตั้งไว้',detail:'นาฬิกาหยุดที่ '+fmt()})}
  render();
}
setInterval(tick,100);

function applyTime(){
  S.sec=Math.max(0,+$('inStart').value||0)*60;
  S.base=Math.max(1,+$('inStop').value||45);
  S.add=Math.max(0,+$('inAdd').value||0);
  S.spd=+$('inSpd').value||1;
  S.run=false;render();save();
}
$('apply').onclick=applyTime;
function syncLim(){S.base=Math.max(1,+$('inStop').value||S.base);S.add=Math.max(0,+$('inAdd').value||0);render();save()}
$('inStop').oninput=syncLim;$('inAdd').oninput=syncLim;
$('inSpd').onchange=function(){S.spd=+$('inSpd').value;save()};
$('run').onclick=function(){
  syncLim();var end=(S.base+S.add)*60;
  if(V.on||(!S.run && S.sec>=end)){return}
  S.run=!S.run;S.last=Date.now();render();save();logEv({type:'time',title:S.run?'เริ่มจับเวลา':'หยุดเวลา'});
};
$('resetT').onclick=function(){S.sec=0;S.run=false;$('inStart').value=0;render();save()};
document.querySelectorAll('[data-p]').forEach(function(b){
  b.onclick=function(){var p=b.dataset.p.split(',');$('inStart').value=p[0];$('inStop').value=p[1];applyTime()}
});

var FILT='all',RTXT='รีเซ็ตทั้งหมด (คะแนน + เวลา + บันทึก)';
var GRP={all:null,goal:['goal','fix','set','og'],cancel:['cancel'],var:['var','ok'],time:['time'],player:['yc','rc','foul','sub','ast']};
var GLB={all:'ทั้งหมด',goal:'⚽ ประตู',cancel:'❌ ยกเลิก',var:'🖥 VAR',time:'⏱ เวลา',player:'👤 ผู้เล่น'};
var ICON={goal:'⚽',fix:'↩︎',cancel:'❌',var:'🖥',ok:'✅',time:'⏱',set:'🏁',og:'🥅',yc:'🟨',rc:'🟥',foul:'⚠️',sub:'🔁',ast:'👟'};
var TCOL={goal:'#1f9d55',ok:'#12a594',cancel:'#d93a3a',var:'#6a4fe0',fix:'#8a97a6',time:'#2f8fe0',set:'#0ea5a4',og:'#e5484d',yc:'#f5b301',rc:'#d93a3a',foul:'#f97316',sub:'#64748b',ast:'#0ea5a4'};
var TLB={goal:'ประตู',ok:'ยืนยันประตู',cancel:'ยกเลิกประตู',var:'VAR ตรวจ',fix:'แก้คะแนน',time:'เวลา',set:'จบเซ็ต',og:'ทำเข้าประตูตัวเอง',yc:'ใบเหลือง',rc:'ใบแดง',foul:'ฟาวล์',sub:'เปลี่ยนตัว',ast:'แอสซิสต์'};
var GC={all:'var(--accent)',goal:TCOL.goal,cancel:TCOL.cancel,var:TCOL.var,time:TCOL.time,player:TCOL.foul};
function saveEv(){try{localStorage.setItem('sb2ev',JSON.stringify(EV.slice(-300)))}catch(e){}push()}
function logEv(o){if(ROLE!=='admin')return;o.clock=fmt();o.score=S.A+' - '+S.B;o.real=Date.now();o.col=o.t?$('col'+o.t).value:$('colT').value;EV.push(o);saveEv();renderReport()}
function mk(tag,txt,cls){var e=document.createElement(tag);if(txt!==undefined)e.textContent=txt;if(cls)e.className=cls;return e}
function inGrp(e,g){return !GRP[g]||GRP[g].indexOf(e.type)>=0}
function renderReport(){
  if(ROLE!=='admin')vRender();else{renderHM();renderDash();renderTM();renderSet()}renderStand();$('fabN').textContent=EV.length;$('hN').textContent=H.length;$('evCount').textContent='บันทึกแล้ว '+EV.length+' เหตุการณ์ • ประวัติ '+H.length+' แมตช์';
  if(!$('rep').classList.contains('open'))return;
  if(TAB==='hist'){renderHist();return}
  if(TAB==='lu'){renderLineups();return}
  var rr=resInfo(),rb=$('resBox');rb.innerHTML='';var pill=mk('div',rr.ico+' '+rr.txt+(S.fin?'  • จบแมตช์':''),'rpill');pill.style.background=rr.col;rb.appendChild(pill);
  var g={A:0,B:0},can=0,vc=0,lost=0;
  EV.forEach(function(e){if(e.type==='goal'||e.type==='og')g[e.t]++;if(e.type==='cancel')can++;if(e.type==='var')vc++;if(e.varSec)lost+=e.varSec});
  var sum=$('sum');sum.innerHTML='';
  function card(l,v,w){var d=mk('div');if(w)d.className='wide';d.appendChild(mk('span',l));d.appendChild(mk('b',v));sum.appendChild(d)}
  card('คะแนนปัจจุบัน',$('nameA').value+'  '+S.A+' - '+S.B+'  '+$('nameB').value,true);
  card('ประตูที่บันทึก (เหย้า-เยือน)',g.A+' - '+g.B);
  card('ประตูที่ถูกยกเลิก',can+' ครั้ง');
  card('VAR ตรวจสอบ',vc+' ครั้ง');
  card('เวลาที่เสียจาก VAR',mmss(lost));
  [[1,'goal'],[2,'cancel'],[3,'var'],[4,'var']].forEach(function(p){var c=sum.children[p[0]];c.style.borderColor=TCOL[p[1]];c.style.background='color-mix(in srgb,'+TCOL[p[1]]+' 10%,transparent)'});
  var lg=$('legend');lg.innerHTML='';
  ['goal','ok','cancel','var','fix','time'].forEach(function(k){var s=mk('span');var i=mk('i');i.style.background=TCOL[k];s.appendChild(i);s.appendChild(document.createTextNode(TLB[k]));lg.appendChild(s)});
  var sp=mk('span');var dd=mk('i');dd.style.background='var(--accent)';dd.style.borderRadius='50%';sp.appendChild(dd);sp.appendChild(document.createTextNode('จุดสี = สีทีม'));lg.appendChild(sp);var sd=mk('span');var di=mk('i');di.style.background=DC;sd.appendChild(di);sd.appendChild(document.createTextNode('เสมอ'));lg.appendChild(sd);
  var ch=$('chips');ch.innerHTML='';
  Object.keys(GRP).forEach(function(k){
    var n=EV.filter(function(e){return inGrp(e,k)}).length;
    var b=mk('button',GLB[k]+' ('+n+')','chip'+(FILT===k?' on':''));
    b.style.borderColor=GC[k];if(FILT===k){b.style.background=GC[k];b.style.color='#fff'}
    b.onclick=function(){FILT=k;renderReport()};ch.appendChild(b);
  });
  var ul=$('evl');ul.innerHTML='';
  var list=EV.filter(function(e){return inGrp(e,FILT)}).reverse();
  if(!list.length){ul.appendChild(mk('li','ยังไม่มีเหตุการณ์','empty'));return}
  list.forEach(function(e){
    var tc=TCOL[e.type]||'#888';
    var li=mk('li');li.style.borderLeft='6px solid '+tc;li.style.background='color-mix(in srgb,'+tc+' 12%,transparent)';
    var mm=mk('div',e.clock,'m');mm.style.background=tc;mm.style.color='#fff';li.appendChild(mm);
    var d=mk('div',undefined,'d');var hd=mk('b');var tag=mk('span',TLB[e.type]||'','tag');tag.style.background=tc;hd.appendChild(tag);
    hd.appendChild(document.createTextNode(' '+(ICON[e.type]||'')+' '+e.title));
    if(e.t){var dot=mk('i',undefined,'dot');dot.style.background=e.col;hd.appendChild(dot)}
    d.appendChild(hd);
    if(e.detail)d.appendChild(mk('small',e.detail));
    var tm='';try{tm=new Date(e.real).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}catch(x){}
    d.appendChild(mk('small','สกอร์ '+e.score+(tm?'  •  เวลาจริง '+tm:'')));
    li.appendChild(d);ul.appendChild(li);
  });
}
function reportText(){
  var l=['รายงานการแข่งขัน: '+$('nameA').value+' '+S.A+' - '+S.B+' '+$('nameB').value,''];
  EV.forEach(function(e){l.push(e.clock+' | '+(ICON[e.type]||'')+' '+e.title+(e.detail?' — '+e.detail:'')+' ['+e.score+']')});
  return l.join('\n');
}
var H=[],TAB='ev',DC='#f0a500';
function saveH(){try{localStorage.setItem('sb2h',JSON.stringify(H.slice(-60).map(function(m,i,a){if(i<a.length-6&&m.lu){var c={};for(var k in m)if(k!=='lu')c[k]=m[k];return c}return m})))}catch(e){}}
function resInfo(){
  var e0=sc(),a=e0.a,b=e0.b,f=S.fin;
  if(a>b)return{k:'A',col:$('colA').value,txt:$('nameA').value+(f?' ชนะ ':' กำลังนำ ')+a+' - '+b,ico:f?'🏆':'🔥'};
  if(b>a)return{k:'B',col:$('colB').value,txt:$('nameB').value+(f?' ชนะ ':' กำลังนำ ')+b+' - '+a,ico:f?'🏆':'🔥'};
  return{k:'D',col:DC,txt:(f?'เสมอ ':'เสมอกัน ')+a+' - '+b,ico:'🤝'};
}
function updateRes(){
  var r=resInfo(),e=$('resLine');
  e.textContent=r.ico+' '+r.txt+(S.fin?'  • จบแมตช์':'');
  e.style.borderColor=r.col;e.style.background='color-mix(in srgb,'+r.col+' 16%,transparent)';
  if($('rep').classList.contains('open'))renderReport();
}
function arm(b,txt,fn){
  if(!b.dataset.arm){b.dataset.arm=1;b.dataset.o=b.textContent;b.textContent=txt;setTimeout(function(){if(b.dataset.arm){delete b.dataset.arm;b.textContent=b.dataset.o}},3500);return}
  delete b.dataset.arm;b.textContent=b.dataset.o;fn();
}
function finishMatch(){
  if(V.on)endVar();
  S.run=false;S.fin=true;render();
  var r=resInfo();
  logEv({type:'time',title:'จบแมตช์',detail:r.txt});
  var can=0,vc=0,lost=0;EV.forEach(function(e){if(e.type==='cancel')can++;if(e.type==='var')vc++;if(e.varSec)lost+=e.varSec});
  var m={id:S.sid||Date.now(),date:Date.now(),clock:fmt(),res:r.k,
    A:{n:$('nameA').value,ab:$('inA').value.toUpperCase(),col:$('colA').value,s:sc().a},
    B:{n:$('nameB').value,ab:$('inB').value.toUpperCase(),col:$('colB').value,s:sc().b},
    sp:S.sp,cat:S.cat,sets:(S.sets||[]).slice(),lu:JSON.parse(JSON.stringify(LU)),ev:EV.slice(),can:can,vc:vc,lost:lost};
  var i=-1;H.forEach(function(x,k){if(x.id===m.id)i=k});
  if(i>=0)H[i]=m;else H.push(m);
  S.sid=m.id;saveH();save();hset(m);
  banner('','🏁 จบการแข่งขัน',r.txt+' • '+m.clock,r.k==='B'?'B':'A');
  $('goalbar').style.setProperty('--gc',r.col);
  updateRes();
}
function newMatch(){
  V.on=false;V.total=0;V.count=0;V.added=0;
  S.A=0;S.B=0;S.sA=0;S.sB=0;S.sets=[];S.sec=0;S.run=false;S.fin=false;S.sid=null;S.add=0;
  $('inAdd').value=0;$('inStart').value=0;$('psA').textContent=0;$('psB').textContent=0;
  $('goalbar').classList.remove('show');
  ['A','B'].forEach(function(t){(LU[t]||[]).forEach(function(p){p.rt='';p.g=0;p.og=0;p.yc=0;p.rc=0;p.fl=0;p.as=0;p.out='';p.inn='';p.fr=''})});saveLU();
  EV=[];saveEv();render();save();updateRes();renderReport();
}
document.querySelectorAll('.btnFin').forEach(function(b){b.onclick=finishMatch});
document.querySelectorAll('.btnNew').forEach(function(b){b.onclick=function(){
  if(!S.fin&&(S.A+S.B>0||EV.length>0))arm(b,'แตะอีกครั้ง (แมตช์นี้ยังไม่ได้บันทึกประวัติ)',newMatch);else newMatch();
}});
function setTab(t){TAB=t;$('tabEv').className='chip'+(t==='ev'?' on':'');$('tabLu').className='chip'+(t==='lu'?' on':'');$('tabHist').className='chip'+(t==='hist'?' on':'');$('evView').style.display=t==='ev'?'':'none';$('luView').style.display=t==='lu'?'':'none';$('histView').style.display=t==='hist'?'':'none';renderReport()}
$('tabLu').onclick=function(){setTab('lu')};
$('tabEv').onclick=function(){setTab('ev')};$('tabHist').onclick=function(){setTab('hist')};
var MD=[{e:'🥇',n:'เหรียญทอง',g:'linear-gradient(135deg,#fde68a,#d4a017)',c:'#d4a017',tx:'#3b2a00'},
{e:'🥈',n:'เหรียญเงิน',g:'linear-gradient(135deg,#f3f4f6,#a3acba)',c:'#9aa5b4',tx:'#1f2937'},
{e:'🥉',n:'เหรียญทองแดง',g:'linear-gradient(135deg,#f0c19a,#b0652a)',c:'#b0652a',tx:'#2b1304'},
{e:'4',n:'อันดับ 4',g:'linear-gradient(135deg,#93c5fd,#2563eb)',c:'#2563eb',tx:'#fff'}];
function stRows(){
  var T={};
  H.forEach(function(m){if(!inFiltT(m))return;[['A','B'],['B','A']].forEach(function(p){
    var me=m[p[0]],op=m[p[1]],k=me.n.trim().toLowerCase();
    var t=T[k]||(T[k]={n:me.n,col:me.col,ab:me.ab,p:0,w:0,d:0,l:0,gf:0,ga:0});
    t.col=me.col;t.n=me.n;t.ab=me.ab;t.p++;t.gf+=me.s;t.ga+=op.s;
    if(me.s>op.s)t.w++;else if(me.s<op.s)t.l++;else t.d++;
  })});
  return Object.keys(T).map(function(k){var t=T[k];t.pts=t.w*3+t.d;return t}).sort(function(a,b){return b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||(a.n<b.n?-1:1)});
}
function tmFind(n){var k=nameKey(n);for(var i=0;i<TM.length;i++)if(nameKey(TM[i].n)===k)return TM[i];return null}
function logoNode(t,sz){
  var d=mk('div',undefined,'tlg'),tm=tmFind(t.n);d.style.width=d.style.height=sz+'px';
  if(tm&&tm.lg)d.style.backgroundImage='url("'+tm.lg+'")';else{d.style.background=t.col;d.textContent=(t.ab||abOf(t.n)).slice(0,3);d.style.fontSize=(sz/3.3)+'px'}
  return d;
}
function standNode(){
  var rows=stRows(),w=mk('div'),pod=mk('div',undefined,'pod');w.appendChild(filtBar(true));
  for(var i=0;i<4;i++){
    var r=rows[i],m=MD[i],c=mk('div',undefined,'pc');c.style.background=m.g;c.style.color=m.tx;
    c.appendChild(mk('span',m.e,'mk'));var bx=mk('div');
    bx.appendChild(mk('b',r?r.n:'—'));bx.appendChild(mk('small',r?r.pts+' แต้ม • ชนะ '+r.w+' เสมอ '+r.d+' แพ้ '+r.l:m.n));
    c.appendChild(bx);pod.appendChild(c);
  }
  w.appendChild(pod);
  if(!rows.length){w.appendChild(mk('div','ยังไม่มีผลการแข่งขัน — ตารางจะแสดงเมื่อมีการจบแมตช์','empty'));return w}
  var wr=mk('div',undefined,'pltw'),tb=mk('table',undefined,'plt'),hr=mk('tr'),th0=mk('thead'),tbd=mk('tbody');
  ['#','ทีม','P','W','D','L','GF','GA','GD','แต้ม'].forEach(function(x,i){var th=mk('th',x);if(i===1)th.className='tcol';hr.appendChild(th)});
  th0.appendChild(hr);tb.appendChild(th0);
  rows.forEach(function(t,i){
    var tr=mk('tr'),m=MD[i],gd=t.gf-t.ga;
    if(m){tr.style.boxShadow='inset 4px 0 0 '+m.c;tr.style.background='color-mix(in srgb,'+m.c+' 10%,transparent)'}
    var c0=mk('td'),rk=mk('span',String(i+1),'md');if(m){rk.style.background=m.g;rk.style.color=m.tx}c0.appendChild(rk);tr.appendChild(c0);
    var c1=mk('td',undefined,'tcol'),tc=mk('div',undefined,'tmc');tc.appendChild(logoNode(t,22));tc.appendChild(mk('span',t.n));c1.appendChild(tc);tr.appendChild(c1);
    [t.p,t.w,t.d,t.l,t.gf,t.ga,(gd>0?'+'+gd:String(gd)),t.pts].forEach(function(x,j){
      var td=mk('td',String(x));
      if(j===1)td.style.color=TCOL.goal;if(j===2)td.style.color=DC;if(j===3)td.style.color=TCOL.cancel;
      if(j===6&&gd!==0)td.style.color=gd>0?TCOL.goal:TCOL.cancel;
      if(j===7)td.className='pts';
      tr.appendChild(td);
    });
    tbd.appendChild(tr);
  });
  tb.appendChild(tbd);wr.appendChild(tb);w.appendChild(wr);
  var last=0;H.forEach(function(m){if(inFiltT(m)&&m.date>last)last=m.date});
  w.appendChild(mk('div','ชนะ 3 คะแนน • เสมอ 1 • แพ้ 0  |  เรียงตาม แต้ม → ผลต่างประตู (GD) → ประตูได้ (GF)  |  อัปเดตอัตโนมัติเมื่อบันทึกผล'+(last?'  |  ล่าสุด '+dlong(last):''),'stnote'));
  return w;
}
function renderStand(){var c=$('stand');if(c){c.innerHTML='';c.appendChild(standNode())}if(window.cupNode&&window.CUP&&CUP.t){var b=$('cupBox');if(b){b.innerHTML='';b.appendChild(cupNode())}}}
function renderHist(){
  var box=$('histView');box.innerHTML='';
  if(!H.length){box.appendChild(mk('div','ยังไม่มีประวัติการแข่งขัน — กด “จบแมตช์” เพื่อบันทึก','empty'));return}
  box.appendChild(standNode());
  var h2=mk('div','📜 ประวัติแต่ละแมตช์ (ล่าสุดก่อน)');h2.style.cssText='font-weight:800;color:var(--ak);margin-top:16px';box.appendChild(h2);
  H.slice().reverse().filter(inFilt).forEach(function(m){
    var win=m.res==='A'?m.A:(m.res==='B'?m.B:null),col=win?win.col:DC;
    var d=mk('div',undefined,'hm');d.style.borderLeftColor=col;
    var hd=mk('div',undefined,'hd'),bd=mk('span',win?'🏆 '+win.n+' ชนะ':'🤝 เสมอ','bd');bd.style.background=col;hd.appendChild(bd);
    var dt='';try{dt=new Date(m.date).toLocaleString('th-TH',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}catch(x){}
    hd.appendChild(mk('span',dt));d.appendChild(hd);
    var sk=SPORTS[m.sp||'football'],ck=CATS[m.cat||'m'];d.appendChild(mk('small',sk.ic+' '+sk.n+' • '+ck.ic+' '+ck.n,'ctag'));
    var sc=mk('div',undefined,'sc2');
    var d1=mk('i');d1.style.background=m.A.col;var d2=mk('i');d2.style.background=m.B.col;
    sc.appendChild(d1);sc.appendChild(document.createTextNode(m.A.n+'  '+m.A.s+' - '+m.B.s+'  '+m.B.n));sc.appendChild(d2);d.appendChild(sc);
    d.appendChild(mk('small','จบที่ '+m.clock+' • ยกเลิกประตู '+m.can+' • VAR '+m.vc+' ครั้ง • เสียเวลา '+mmss(m.lost)));
    if(m.sets&&m.sets.length)d.appendChild(mk('small','แต้มแต่ละเซ็ต: '+m.sets.join('  •  ')));
    var ul=mk('ul');ul.style.display='none';
    (m.ev||[]).forEach(function(e){var li=mk('li',e.clock+'  '+(ICON[e.type]||'')+' '+e.title+(e.detail?' — '+e.detail:'')+'  ['+e.score+']');var tc=TCOL[e.type]||'#888';li.style.borderLeftColor=tc;li.style.background='color-mix(in srgb,'+tc+' 12%,transparent)';ul.appendChild(li)});
    var acts=mk('div',undefined,'acts'),b1=mk('button','ดูเหตุการณ์ ('+(m.ev||[]).length+')'),b2=mk('button','ลบ','adm');
    b1.onclick=function(){ul.style.display=ul.style.display==='none'?'block':'none'};
    b2.onclick=function(){arm(b2,'แตะอีกครั้งเพื่อลบ',function(){hdel(m.id);H=H.filter(function(x){return x.id!==m.id});if(S.sid===m.id){S.sid=null;S.fin=false}saveH();save();updateRes();renderReport()})};
    acts.appendChild(b1);acts.appendChild(b2);d.appendChild(acts);d.appendChild(ul);box.appendChild(d);
  });
  var del=mk('button','ลบประวัติทั้งหมด','adm');del.style.cssText='margin-top:14px;width:100%;padding:10px;background:var(--bg);color:#d93a3a;border:2px solid #d93a3a';
  del.onclick=function(){arm(del,'แตะอีกครั้งเพื่อลบประวัติทั้งหมด',function(){H.forEach(function(x){hdel(x.id)});H=[];S.sid=null;saveH();save();renderReport()})};box.appendChild(del);
}
function openRep(){$('rep').classList.add('open');renderReport()}
$('fab').onclick=openRep;$('repOpen').onclick=openRep;
$('repClose').onclick=function(){$('rep').classList.remove('open')};
$('rep').onclick=function(e){if(e.target===this)this.classList.remove('open')};
$('repUndo').onclick=function(){EV.pop();saveEv();renderReport()};
$('repCopy').onclick=function(){
  var b=this,t=reportText();
  function done(ok){b.textContent=ok?'คัดลอกแล้ว ✓':'คัดลอกไม่ได้';setTimeout(function(){b.textContent='คัดลอกรายงาน'},1800)}
  try{navigator.clipboard.writeText(t).then(function(){done(true)},function(){fb()})}catch(x){fb()}
  function fb(){try{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();var ok=document.execCommand('copy');ta.remove();done(ok)}catch(x){done(false)}}
};
function pop(t){var e=$('ps'+t);e.textContent=S[t];e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');S.fin=false;updateRes()}
function setG1(t){var g=$('g1');g.innerHTML='';Array.from(t).forEach(function(ch,i){var e=document.createElement('span');e.textContent=ch===' '?'\u00a0':ch;e.style.setProperty('--i',i);g.appendChild(e)})}
function rollScore(t){var e=$('ps'+t);if(!e)return;e.classList.remove('roll');void e.offsetWidth;e.classList.add('roll')}
function banner(cls,title,sub,t,keep){
  var g=$('goalbar'),dur=cls==='no'?8000:5000;
  g.style.setProperty('--gc',$('col'+t).value);g.style.setProperty('--dur',dur+'ms');
  var sd=(cls!=='var'&&title.indexOf('จบการแข่งขัน')<0&&(t==='A'||t==='B'))?(t==='A'?' sl':' sr'):'';
  g.className='goalbar '+cls+sd+(keep?' kp':'');
  $('gbd').textContent=(($('in'+t)||{}).value||'').toUpperCase().slice(0,3);
  setG1(title);$('g2').textContent=sub;$('gart').textContent=(SPORTS[S.sp]||SPORTS.football).ic;
  void g.offsetWidth;g.classList.add('show');
  clearTimeout(gt);
  if(!keep)gt=setTimeout(function(){g.classList.remove('show');if(sd&&/GOAL|POINT|\+\d|OWN/.test(title))setTimeout(function(){rollScore(t)},350)},dur-450);
}
function goal(t){banner('','⚽ ประตู!',$('name'+t).value+' • '+fmt(),t)}
$('goalbar').onclick=function(){clearTimeout(gt);this.classList.remove('show')};
function mmss(s){s=Math.floor(s);return pad(Math.floor(s/60))+':'+pad(s%60)}
function varUi(){
  var cur=V.on?(Date.now()-V.start)/1000*V.spd:0,tot=V.total+cur;
  $('vNow').textContent=mmss(cur);$('vTot').textContent=mmss(tot);$('vCnt').textContent=V.count+(V.on?1:0);
  $('vAdd').textContent='+'+Math.ceil(tot/60)+' นาที';
  if(V.on&&$('goalbar').classList.contains('show')&&$('g1').textContent.indexOf('ตรวจสอบ VAR')>=0)$('g2').textContent='เวลาหยุดแล้ว • ตรวจสอบประตูของ '+V.n+' • เสียเวลา '+mmss(cur);
}
setInterval(varUi,250);
function endVar(){
  if(!V.on)return null;
  var el=(Date.now()-V.start)/1000*V.spd;
  V.on=false;V.total+=el;V.count++;
  if($('vAuto').checked){var need=Math.ceil(V.total/60);S.add+=need-V.added;V.added=need;$('inAdd').value=S.add}
  if(V.wasRun&&S.sec<(S.base+S.add)*60){S.run=true;S.last=Date.now()}
  render();varUi();save();return el;
}
$('vReset').onclick=function(){V.total=0;V.count=0;V.added=0;if(V.on)V.start=Date.now();varUi()};
function syncOpt(){var o=$('cxTeam').options;o[0].text=$('nameA').value;o[1].text=$('nameB').value;var q=$('luTeam').options;q[0].text=$('nameA').value;q[1].text=$('nameB').value;var q2=$('pvTeam').options;q2[0].text=$('nameA').value;q2[1].text=$('nameB').value}
function why(){var r=$('cxWhy').value;if(r==='อื่น ๆ')r=$('cxTxt').value.trim()||'ไม่ระบุเหตุผล';return r}
$('cxWhy').onchange=function(){$('cxBox').style.display=$('cxWhy').value==='อื่น ๆ'?'block':'none'};
$('nameA').addEventListener('input',syncOpt);$('nameB').addEventListener('input',syncOpt);
$('cxBtn').onclick=function(){
  var t=$('cxTeam').value,n=$('name'+t).value,by=$('cxBy').value,r=why();
  if(S[t]===0){banner('var','⚠ ยกเลิกไม่ได้',n+' ยังไม่มีประตู — เลือกทีมให้ถูกต้องก่อน',t);return}
  S[t]-=1;pop(t);
  var el=endVar(),vt=el===null?'':' • VAR '+mmss(el);
  banner('no','❌ ไม่เป็นประตู',r+' • '+by+' • '+n+' • '+fmt()+vt,t);
  logEv({type:'cancel',t:t,title:'ยกเลิกประตู '+n,detail:r+' • ตัดสินโดย '+by+(el===null?'':' • VAR ใช้เวลา '+mmss(el)),varSec:el===null?0:el});
  save();
};
$('varBtn').onclick=function(){
  var t=$('cxTeam').value,n=$('name'+t).value;
  if(V.on)return;
  V.on=true;V.start=Date.now();V.spd=S.spd||1;V.wasRun=S.run;V.t=t;V.n=n;S.run=false;render();save();
  banner('var','🖥 ตรวจสอบ VAR','เวลาหยุดแล้ว • ตรวจสอบประตูของ '+n+' • เสียเวลา 00:00',t,true);
  logEv({type:'var',t:t,title:'VAR ตรวจสอบประตูของ '+n,detail:'นาฬิกาหยุดทันที'});
};
$('okBtn').onclick=function(){
  var t=$('cxTeam').value,n=$('name'+t).value,by=$('cxBy').value;
  var el=endVar(),vt=el===null?'':' • VAR '+mmss(el);
  banner('ok','✅ ยืนยันประตู','ประตูสมบูรณ์ • '+n+' • '+by+' • '+fmt()+vt,t);
  logEv({type:'ok',t:t,title:'ยืนยันประตู '+n,detail:'ตัดสินโดย '+by+(el===null?'':' • VAR ใช้เวลา '+mmss(el)),varSec:el===null?0:el});
};
function bindScore(){document.querySelectorAll('[data-t]').forEach(function(b){b.onclick=function(){scoreClick(b)}})}
function setTarget(){var sp=SP();return (sp.id==='volleyball'&&(S.sA||0)+(S.sB||0)===sp.need*2-2)?15:sp.to}
function scoreClick(b){doScore(b.dataset.t,+b.dataset.d)}
function doScore(t,d,pi){
  var sp=SP(),pl=(pi!=null&&LU[t])?LU[t][pi]:null;
  if(d<0&&S[t]===0)return;
  S[t]+=d;pop(t);
  if(d>0){
    $('cxTeam').value=t;
    var bt=sp.ic+' '+(sp.big||'+'+d);
    banner('',bt,(pl?pl.n+' • ':'')+$('name'+t).value+' • '+fmt()+(sp.sets?' • '+S.A+'-'+S.B:''),t);
    if(pl){pl.g=(pl.g||0)+d;saveLU()}
    logEv({type:'goal',t:t,big:bt,title:(sp.id==='football'?'ประตู! ':'+'+d+' '+sp.unit+' ')+(pl?pl.n+' ('+$('name'+t).value+')':$('name'+t).value),pn:pl?pl.n:'',pi:pl?pi:null});
    if(sp.sets){var o=S[t==='A'?'B':'A'];if(S[t]>=setTarget()&&S[t]-o>=2){endSet();return}}
  }else logEv({type:'fix',t:t,title:'แก้คะแนน '+$('name'+t).value+' (−1)'});
  save();
}
function endSet(){
  var sp=SP();if(!sp.sets||S.A===S.B)return;
  var w=S.A>S.B?'A':'B',n=$('name'+w).value,pt=S.A+'-'+S.B;
  S.sets.push(pt);S['s'+w]++;
  logEv({type:'set',t:w,title:'จบเซ็ต '+S.sets.length+' • '+n+' ชนะเซ็ต',detail:'แต้มเซ็ต '+pt+' • ได้เซ็ต '+S.sA+'-'+S.sB});
  S.A=0;S.B=0;$('psA').textContent=0;$('psB').textContent=0;
  banner('','🏁 จบเซ็ต '+S.sets.length,n+' ชนะเซ็ต '+pt+' • ได้เซ็ต '+S.sA+'-'+S.sB,w);
  render();updateRes();
  if(S['s'+w]>=sp.need)finishMatch();
  save();
}
function uiSport(){
  var sp=SP(),c=CATS[S.cat]||CATS.m;
  document.body.classList.toggle('sets',!!sp.sets);
  var sl=$('spLine');sl.textContent=sp.ic+' '+sp.n+' • '+c.ic+' '+c.n;sl.style.background=c.c;
  $('spSel').value=S.sp;$('catSel').value=S.cat;
  if(S.sp!==_sk){_sk=S.sp;
    ['A','B'].forEach(function(t){var box=$('gb'+t);box.innerHTML='';
      var mn=mk('button','−1','minus');mn.dataset.t=t;mn.dataset.d='-1';box.appendChild(mn);
      sp.steps.forEach(function(d){var bt=mk('button','+'+d+' '+sp.unit,'plus');bt.dataset.t=t;bt.dataset.d=d;box.appendChild(bt)})});
    bindScore();
  }
}
$('spSel').onchange=function(){S.sp=this.value;var sp=SP();if(!sp.sets&&S.sec===0&&!S.run){S.base=sp.base||45;$('inStop').value=S.base}uiSport();render();updateRes();renderReport();save()};
$('catSel').onchange=function(){S.cat=this.value;uiSport();renderReport();save()};
$('endSetBtn').onclick=endSet;
['colA','colB','colT','inA','inB'].forEach(function(i){$(i).oninput=function(){paint();save()}});
['nameA','nameB'].forEach(function(i){$(i).oninput=save});
$('resetAll').onclick=function(){var b=this;if(!b.dataset.arm){b.dataset.arm=1;b.textContent='แตะอีกครั้งเพื่อยืนยันลบทั้งหมด';setTimeout(function(){delete b.dataset.arm;b.textContent=RTXT},3500);return}delete b.dataset.arm;b.textContent=RTXT;V.on=false;V.total=0;V.count=0;V.added=0;S.A=0;S.B=0;S.sA=0;S.sB=0;S.sets=[];S.sec=0;S.run=false;$('psA').textContent=0;$('psB').textContent=0;S.fin=false;S.sid=null;S.add=0;$('inAdd').value=0;EV=[];saveEv();updateRes();renderReport();$('goalbar').classList.remove('show');render();save()};

try{
  var d=JSON.parse(localStorage.getItem('sb2')||'null');
  if(d){
    S.A=d.A;S.B=d.B;S.sec=d.sec;S.base=d.base;S.add=d.add;S.spd=d.spd;S.fin=!!d.fin;S.sid=d.sid||null;S.sp=d.sp||'football';S.cat=d.cat||'m';S.sA=d.sA||0;S.sB=d.sB||0;S.sets=d.sets||[];
    ['nameA','inA','colA','nameB','inB','colB','colT'].forEach(function(i,k){$(i).value=(i==='colT'&&(d.f[k]==='#3aa0f0'||d.f[k]==='#1e5bb8'))?'#1d4ed8':d.f[k]});
    $('psA').textContent=S.A;$('psB').textContent=S.B;
    $('inStop').value=S.base;$('inAdd').value=S.add;$('inSpd').value=S.spd;$('inStart').value=Math.floor(S.sec/60);
  }
}catch(e){}
try{EV=JSON.parse(localStorage.getItem('sb2ev')||'[]')}catch(e){EV=[]}
try{H=JSON.parse(localStorage.getItem('sb2h')||'[]')}catch(e){H=[]}
paint();render();syncOpt();renderReport();

/* ===== ตัวจริง + ตัวกรองหมวดหมู่ ===== */
function inFiltT(m){return (TSP==='all'||(m.sp||'football')===TSP)&&(TCT==='all'||(m.cat||'m')===TCT)}
function inFilt(m){return (FSP==='all'||(m.sp||'football')===FSP)&&(FCT==='all'||(m.cat||'m')===FCT)}
function filtBar(tb){
  var w=mk('div');
  function row(opts,cur,set){var r=mk('div',undefined,'chips');r.style.margin='4px 0';opts.forEach(function(o){var b=mk('button',o[1],'chip'+(cur===o[0]?' on':''));b.onclick=function(){set(o[0]);renderReport()};r.appendChild(b)});return r}
  w.appendChild(row([['all','ทุกกีฬา']].concat(Object.keys(SPORTS).map(function(k){return [k,SPORTS[k].ic+' '+SPORTS[k].n]})),tb?TSP:FSP,function(v){if(tb)TSP=v;else FSP=v}));
  w.appendChild(row([['all','ทุกประเภท']].concat(Object.keys(CATS).map(function(k){return [k,CATS[k].ic+' '+CATS[k].n]})),tb?TCT:FCT,function(v){if(tb)TCT=v;else FCT=v}));
  return w;
}
try{LU=JSON.parse(localStorage.getItem('sb2lu')||'null')||{A:[],B:[]}}catch(e){LU={A:[],B:[]}}
function saveLU(){try{localStorage.setItem('sb2lu',JSON.stringify(LU))}catch(e){}if(DB&&ROLE==='admin'){try{DB.doc('live/lineup').set(JSON.parse(JSON.stringify(LU))).catch(function(e){luMsg('บันทึกขึ้นระบบสดไม่สำเร็จ: '+(e&&e.message||e))})}catch(e){}}}
function pTxt(p){return (p.rt!==''&&p.rt!=null?'⭐'+Number(p.rt).toFixed(1):'')+(p.g?' ⚽'+(p.g>1?'×'+p.g:''):'')+(p.og?' 🥅':'')+(p.as?' 👟':'')+(p.yc?' 🟨':'')+(p.rc?' 🟥':'')+(p.fl?' ⚠️'+p.fl:'')+(p.out?' 🔁'+p.out:'')+(p.inn?' 🔼'+p.inn:'')}
function newPl(no,n,pos,ph,bn){return {no:no,n:n,pos:pos,ph:ph||'',rt:'',g:0,og:0,yc:0,rc:0,fl:0,as:0,out:'',inn:'',fr:'',bn:!!bn}}
function luCard(p,i){
  var d=mk('div',undefined,'pl');d.style.animationDelay=(i*0.3)+'s';
  var im=mk('div',undefined,'pph');if(p.ph)im.style.backgroundImage='url("'+p.ph+'")';else im.textContent=(p.n||'?').charAt(0);
  if(p.no!==''&&p.no!=null)im.appendChild(mk('b',String(p.no),'pno'));
  d.appendChild(im);d.appendChild(mk('div',p.n,'pn'));if(p.pos)d.appendChild(mk('small',p.pos));if(p.bn)d.appendChild(mk('small','ตัวสำรอง'));
  var tx=pTxt(p);if(tx)d.appendChild(mk('small',tx));return d;
}
function luTeamNode(t,anim){
  var w=mk('div',undefined,'lut'),h=mk('div',$('name'+t).value+'  •  ตัวจริง','luh');h.style.background=$('col'+t).value;w.appendChild(h);
  var g=mk('div',undefined,'lug'+(anim?' anim':'')),all=LU[t].filter(function(p){return !p.bn}).concat(LU[t].filter(function(p){return p.bn}));
  if(!all.length)g.appendChild(mk('div','ยังไม่ได้ประกาศรายชื่อ','empty'));
  all.forEach(function(p,i){g.appendChild(luCard(p,i))});w.appendChild(g);return w;
}
function renderLineups(){var v=$('luView');v.innerHTML='';v.appendChild(luTeamNode('A'));v.appendChild(luTeamNode('B'))}
function luMsg(t,ok){var e=$('luSt');if(!e)return;e.textContent=t;e.style.color=ok?'#1f9d55':'#d93a3a'}
function renderLU(){
  var t=$('luTeam').value,box=$('luList');box.innerHTML='';var c=luCounts(t);$('luCnt').textContent='ตัวจริง '+c.ns+'/11 • สำรอง '+c.nb+'/12';
  LU[t].forEach(function(p,i){
    var r=mk('div',undefined,'lurow'),th=mk('div',undefined,'th');if(p.ph)th.style.backgroundImage='url("'+p.ph+'")';
    r.appendChild(th);var tx=mk('span',(p.bn?'[สำรอง] ':'')+'#'+(p.no===''?'-':p.no)+'  '+p.n+(p.pos?'  ('+p.pos+')':'')+(pTxt(p)?'  '+pTxt(p):''));tx.style.flex='1';r.appendChild(tx);
    function bt(txt,fn){var b=mk('button',txt);b.style.cssText='background:var(--bg);color:var(--text);border:2px solid var(--line);padding:4px 8px;font-size:.8rem';b.onclick=fn;r.appendChild(b)}
    bt('✏️',function(){luEdit={t:t,i:i};$('luNo').value=p.no;$('luName').value=p.n;$('luPos').value=p.pos||'';$('luRole').value=p.bn?'b':'s';$('luAdd').textContent='💾 บันทึกการแก้ไข';$('luCancel').style.display='';luMsg('กำลังแก้ไข: '+p.n+' (แก้ชื่อ เบอร์ ตำแหน่ง แล้วกดบันทึก ถ้าเลือกรูปใหม่ก็จะเปลี่ยนรูปด้วย)',true);$('luName').scrollIntoView({block:'center'})});
    bt('📷',function(){var fi=document.createElement('input');fi.type='file';fi.accept='image/*';fi.onchange=function(){if(fi.files[0])shrinkPh(fi.files[0],function(ph){p.ph=ph;saveLU();renderLU();renderReport()})};fi.click()});
    bt(p.bn?'⬆ ตัวจริง':'⬇ สำรอง',function(){var c2=luCounts(t);if(p.bn&&c2.ns>=11){luMsg('ตัวจริงครบ 11 คนแล้ว');return}if(!p.bn&&c2.nb>=12){luMsg('ตัวสำรองครบ 12 คนแล้ว');return}p.bn=!p.bn;saveLU();renderLU();renderPV();renderReport()});
    bt('✕',function(){luEditOff();LU[t].splice(i,1);saveLU();renderLU();renderPV();renderReport()});
    box.appendChild(r);
  });
}
function shrinkPh(file,cb){
  var done=false;function fin(v){if(!done){done=true;cb(v)}}
  setTimeout(function(){fin('')},15000);
  function draw(src,w,h,rel){try{var c=document.createElement('canvas');c.width=c.height=88;var x=c.getContext('2d'),m=Math.min(w,h);x.drawImage(src,(w-m)/2,(h-m)*0.25,m,m,0,0,88,88);fin(c.toDataURL('image/jpeg',0.62))}catch(e){fin('')}if(rel)rel()}
  function viaImg(){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){draw(im,im.naturalWidth,im.naturalHeight,function(){URL.revokeObjectURL(u)})};im.onerror=function(){URL.revokeObjectURL(u);fin('')};im.src=u}
  try{if(window.createImageBitmap){createImageBitmap(file).then(function(bm){draw(bm,bm.width,bm.height,function(){if(bm.close)bm.close()})},viaImg)}else viaImg()}catch(e){viaImg()}
}
$('luTeam').onchange=function(){luEditOff();renderLU()};
var luEdit=null;
function luEditOff(){luEdit=null;$('luCancel').style.display='none';$('luAdd').textContent='➕ เพิ่มผู้เล่น'}
$('luCancel').onclick=function(){luEditOff();$('luName').value='';$('luPos').value='';luMsg('ยกเลิกการแก้ไขแล้ว',true)};
var luBusy=false;
function luCounts(t){var ns=0,nb=0;LU[t].forEach(function(p){if(p.bn)nb++;else ns++});return {ns:ns,nb:nb}}
function luRoleFor(t,want){var c=luCounts(t);if(want==='b')return c.nb>=12?null:'b';if(c.ns>=11)return c.nb>=12?null:'bo';return 's'}
$('luAdd').onclick=function(){
  if(luBusy)return;
  var t=$('luTeam').value,n=$('luName').value.trim();
  if(!n){luMsg('กรุณาใส่ชื่อผู้เล่นก่อน');return}
  var ed=(luEdit&&luEdit.t===t)?LU[t][luEdit.i]:null,r='s';
  if(ed){var wb=$('luRole').value==='b',c0=luCounts(t);
    if(wb!==!!ed.bn){if(wb&&c0.nb>=12){luMsg('ตัวสำรองครบ 12 คนแล้ว');return}if(!wb&&c0.ns>=11){luMsg('ตัวจริงครบ 11 คนแล้ว — ปล่อยเป็นตัวสำรองไว้ก่อน');return}}
    r=wb?'b':'s'}
  else{r=luRoleFor(t,$('luRole').value);if(!r){luMsg('ตัวสำรองครบ 12 คนแล้ว');return}}
  var no=$('luNo').value,pos=$('luPos').value.trim(),f=$('luPh').files&&$('luPh').files[0],btn=this;
  luBusy=true;btn.disabled=true;btn.textContent='กำลังเพิ่ม...';
  function add(ph){
    try{
      if(ed){ed.no=no;ed.n=n;ed.pos=pos;ed.bn=(r!=='s');if(ph)ed.ph=ph;luEditOff();$('luNo').value=''}
      else{LU[t].push(newPl(no,n,pos,ph,r!=='s'));$('luNo').value=(no!==''&&!isNaN(parseInt(no)))?String(parseInt(no)+1):''}
      $('luName').value='';$('luPos').value='';try{$('luPh').value=''}catch(e){}
      saveLU();renderLU();renderPV();renderReport();var c=luCounts(t);
      luMsg((ed?'แก้ไขแล้ว':'เพิ่มแล้ว')+(r==='bo'?' เป็นตัวสำรอง (ตัวจริงครบ 11 คนแล้ว)':'')+' • ตัวจริง '+c.ns+'/11 • สำรอง '+c.nb+'/12'+(f&&!ph?' แต่รูปอ่านไม่ได้ — กด 📷 ที่แถวผู้เล่นเพื่อลองใหม่':''),!(f&&!ph));
    }catch(e){luMsg('เกิดข้อผิดพลาด: '+(e&&e.message||e))}
    luBusy=false;btn.disabled=false;btn.textContent='➕ เพิ่มผู้เล่น';
  }
  if(f)shrinkPh(f,add);else add('');
};
$('luBulkBtn').onclick=function(){
  var t=$('luTeam').value,c=0,ov=0;
  $('luBulk').value.split('\n').forEach(function(l){
    l=l.trim();if(!l)return;
    var r=luRoleFor(t,$('luRole').value);if(!r)return;
    var no='',n='',pos='',m,q;
    if(l.indexOf(',')>=0){q=l.split(',').map(function(x){return x.trim()});if(/^\d+$/.test(q[0])){no=q[0];n=q[1]||'';pos=q[2]||''}else{n=q[0];pos=q[1]||''}}
    else if((m=l.match(/^(\d+)\s+(.+)$/))){no=m[1];n=m[2]}else n=l;
    if(!n)return;LU[t].push(newPl(no,n,pos,'',r!=='s'));c++;if(r==='bo')ov++;
  });
  $('luBulk').value='';saveLU();renderLU();renderPV();renderReport();var k=luCounts(t);
  luMsg('เพิ่ม '+c+' คน'+(ov?' (ส่วนที่เกิน 11 ถูกใส่เป็นตัวสำรอง '+ov+' คน)':'')+' • ตัวจริง '+k.ns+'/11 • สำรอง '+k.nb+'/12',c>0);
};
$('luClr').onclick=function(){var t=$('luTeam').value;arm(this,'แตะอีกครั้งเพื่อลบทั้งทีม',function(){LU[t]=[];saveLU();renderLU();renderPV();renderReport()})};
function minLb(){
  if(SP().sets)return 'เซ็ต '+((S.sA||0)+(S.sB||0)+1);
  var s=Math.floor(S.sec),bs=S.base*60;
  if(s>=bs&&S.add>0)return S.base+'+'+(Math.floor((s-bs)/60)+1)+"'";
  return (Math.floor(s/60)+1)+"'";
}
function pEvent(t,i,ev,val){
  var p=LU[t][i],sp=SP();if(!p)return '';
  var tn=$('name'+t).value,who=p.n+' ('+tn+')';
  if(ev==='goal'){var d=sp.steps.length>1?(parseInt(val)||1):1;if(sp.steps.indexOf(d)<0)d=1;doScore(t,d,i);return 'บันทึกประตูของ '+p.n}
  if(ev==='og'){
    if(sp.sets)return 'กีฬานี้ไม่มีประตูเข้าตัวเอง';
    var o=t==='A'?'B':'A';p.og=(p.og||0)+1;S[o]+=1;pop(o);
    banner('','🥅 ทำเข้าประตูตัวเอง',who+' • '+fmt(),o);
    logEv({type:'og',t:o,pt:t,pi:i,pn:p.n,big:'🥅 ทำเข้าประตูตัวเอง',title:'ประตูเข้าตัวเอง • '+who,detail:'ให้ '+$('name'+o).value+' +1'});
    save();return 'บันทึกประตูเข้าตัวเองของ '+p.n;
  }
  if(ev==='yc'){p.yc=(p.yc||0)+1;banner('','🟨 ใบเหลือง',who+' • '+fmt(),t);logEv({type:'yc',t:t,pi:i,pn:p.n,title:'ใบเหลือง • '+who})}
  else if(ev==='rc'){p.rc=(p.rc||0)+1;banner('no','🟥 ใบแดง',who+' • '+fmt(),t);logEv({type:'rc',t:t,pi:i,pn:p.n,title:'ใบแดง • '+who})}
  else if(ev==='foul'){p.fl=(p.fl||0)+1;logEv({type:'foul',t:t,pi:i,pn:p.n,title:'ฟาวล์ • '+who,detail:'ฟาวล์ครั้งที่ '+p.fl})}
  else if(ev==='sub'){
    if(p.bn)return p.n+' เป็นตัวสำรอง ยังไม่ได้อยู่ในสนาม';
    if(p.out)return p.n+' ถูกเปลี่ยนออกไปแล้ว';
    var ii=$('pvIn').value,q=null;
    if(ii!==''&&LU[t][+ii])q=LU[t][+ii];
    else if(val){if(luCounts(t).nb>=12)return 'ตัวสำรองครบ 12 คนแล้ว';q=newPl('',val,'','',true);LU[t].push(q)}
    p.out=minLb();
    if(q){q.inn=minLb();q.fr=p.n;q.bn=true}
    banner('','🔁 เปลี่ยนตัว',(q?q.n+' แทน '+p.n:p.n+' ออก')+' • '+p.out,t);
    logEv({type:'sub',t:t,pi:i,pn:p.n,title:'เปลี่ยนตัว • ออก: '+p.n+(q?'  เข้า: '+q.n:'')+' ('+tn+')',detail:q?q.n+' ลงแทน '+p.n+' นาที '+p.out:''});
    saveLU();save();return 'เปลี่ยนตัวแล้ว: '+(q?p.n+' ออก  '+q.n+' เข้า':p.n+' ออก');
  }
  else if(ev==='ast'){p.as=(p.as||0)+1;logEv({type:'ast',t:t,pi:i,pn:p.n,title:'แอสซิสต์ • '+who})}
  else if(ev==='rate'){var r=parseFloat(val);if(isNaN(r))return 'กรุณาใส่คะแนน 0-10';p.rt=Math.max(0,Math.min(10,Math.round(r*10)/10));saveLU();return 'ให้คะแนน '+p.n+' = '+p.rt.toFixed(1)}
  saveLU();save();return 'บันทึกแล้ว';
}
function renderPV(){
  var t=$('pvTeam').value,sel=$('pvPl'),cur=sel.value,si=$('pvIn'),curIn=si.value;sel.innerHTML='';si.innerHTML='';
  LU[t].forEach(function(p,i){var o=document.createElement('option');o.value=i;o.textContent='#'+(p.no===''?'-':p.no)+' '+p.n+(p.bn?' (สำรอง)':'')+(p.out?' (ออกแล้ว)':'');sel.appendChild(o)});
  if(cur!==''&&sel.options[+cur])sel.value=cur;
  var o0=document.createElement('option');o0.value='';o0.textContent='— ไม่เลือก / พิมพ์ชื่อใหม่ในช่องค่าเพิ่มเติม —';si.appendChild(o0);
  LU[t].forEach(function(p,i){if(p.bn&&!p.inn){var o=document.createElement('option');o.value=i;o.textContent='#'+(p.no===''?'-':p.no)+' '+p.n;si.appendChild(o)}});
  if(curIn!==''&&si.querySelector('option[value="'+curIn+'"]'))si.value=curIn;
}
$('pvTeam').onchange=renderPV;
$('pvEv').onchange=function(){$('pvInWrap').style.display=this.value==='sub'?'':'none'};
$('pvGo').onclick=function(){
  var t=$('pvTeam').value,i=+$('pvPl').value;
  if(!LU[t].length){$('pvSt').textContent='ยังไม่มีรายชื่อผู้เล่นในทีมนี้';return}
  var m=pEvent(t,i,$('pvEv').value,$('pvVal').value.trim());
  $('pvVal').value='';saveLU();renderLU();renderPV();renderReport();$('pvSt').textContent=m;
};
renderPV();
function showAnn(t){
  var a=$('ann');a.innerHTML='';
  var h=mk('div',undefined,'ahd');h.appendChild(mk('div',undefined,'lg alg'));h.appendChild(mk('div','📣 ประกาศรายชื่อตัวจริง'));a.appendChild(h);
  a.appendChild(luTeamNode(t,true));a.appendChild(mk('button','แตะเพื่อปิด','aclose'));
  a.classList.add('show');clearTimeout(annT);annT=setTimeout(function(){a.classList.remove('show')},Math.max(9000,LU[t].length*350+7000));
  a.onclick=function(){clearTimeout(annT);a.classList.remove('show')};
}
document.querySelectorAll('[data-ann]').forEach(function(b){b.onclick=function(){
  var t=b.dataset.ann;showAnn(t);
  if(DB&&ROLE==='admin'){try{DB.doc('live/announce').set({team:t,at:Date.now()}).catch(function(){})}catch(e){}}
}});
renderLU();

/* ===== มุมมองผู้ชมแบบ FotMob ===== */
try{FX=JSON.parse(localStorage.getItem('sb2fx')||'[]')}catch(e){FX=[]}
function dayOf(o){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+o);return d}
function hhmm(ts){var d=new Date(ts);return pad(d.getHours())+':'+pad(d.getMinutes())+' น.'}
function dlong(ts){try{return new Date(ts).toLocaleString('th-TH',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}catch(e){return ''}}
function liveNow(){return !S.fin&&(S.run||V.on||S.A+S.B+(S.sA||0)+(S.sB||0)>0||EV.length>0)}
function abOf(n){return (n||'').replace(/\s+/g,'').slice(0,3).toUpperCase()||'---'}
function bdg(t,sz){var b=mk('div',t.ab||abOf(t.n),'bdg'),tm=tmFind(t.n);b.style.background=t.col;if(tm&&tm.lg){b.textContent='';b.style.background='#fff center/cover no-repeat url("'+tm.lg+'")'}if(sz){b.style.width=b.style.height=sz+'px';b.style.fontSize=(sz/3.4)+'px'}return b}
function mmFin(m){return {k:'fin',id:m.id,sp:m.sp||'football',cat:m.cat||'m',A:m.A,B:m.B,res:m.res,date:m.date,sets:m.sets||[],ev:m.ev||[],lu:m.lu||{A:[],B:[]},clock:m.clock}}
function mmLive(){var e=sc();return {k:'live',id:'live',sp:S.sp,cat:S.cat,A:{n:$('nameA').value,ab:$('inA').value.toUpperCase(),col:$('colA').value,s:e.a},B:{n:$('nameB').value,ab:$('inB').value.toUpperCase(),col:$('colB').value,s:e.b},res:e.a>e.b?'A':(e.b>e.a?'B':'D'),date:Date.now(),sets:S.sets||[],ev:EV,lu:LU,clock:fmt(),pts:[S.A,S.B]}}
function mmFx(f){return {k:'fx',id:f.id,sp:f.sp,cat:f.cat,A:{n:f.a,ab:abOf(f.a),col:f.ca,s:0},B:{n:f.b,ab:abOf(f.b),col:f.cb,s:0},res:'',date:f.date,sets:[],ev:[],lu:{A:[],B:[]},post:f.post}}
function findMM(r){
  var i;
  if(r.k==='live'){if(liveNow())return mmLive();if(S.sid)for(i=0;i<H.length;i++)if(H[i].id===S.sid)return mmFin(H[i]);return null}
  if(r.k==='fin'){for(i=0;i<H.length;i++)if(H[i].id===r.id)return mmFin(H[i]);return null}
  for(i=0;i<FX.length;i++)if(FX[i].id===r.id)return mmFx(FX[i]);return null;
}
function vRow(x){
  var r=mk('div',undefined,'vr'),tg=mk('div',undefined,'vt');
  if(x.k==='live'){tg.className+=' lv';tg.appendChild(mk('b','สด'));var sm=mk('small',fmt());sm.id='lvMin';tg.appendChild(sm)}
  else tg.textContent=x.k==='fin'?'จบ':(x.post?'เลื่อน':'');
  r.appendChild(tg);
  var pl=x.k!=='fx',aw=pl&&x.A.s>x.B.s,bw=pl&&x.B.s>x.A.s;
  r.appendChild(mk('div',x.A.n,'vn l'+(aw?' w':(bw?' lo':''))));r.appendChild(bdg(x.A));
  var c=mk('div',undefined,'vc'+(x.k==='live'?' lv':''));
  if(x.k==='fx'){c.textContent=hhmm(x.date);if(x.post)c.className+=' pp2'}
  else{c.textContent=x.A.s+' - '+x.B.s;if(x.k==='live'&&SPORTS[x.sp].sets)c.appendChild(mk('small','('+x.pts[0]+'-'+x.pts[1]+')'))}
  r.appendChild(c);r.appendChild(bdg(x.B));r.appendChild(mk('div',x.B.n,'vn rr'+(bw?' w':(aw?' lo':''))));
  r.onclick=function(){openMatch(x)};return r;
}
function vGroups(root,items){
  var G={},order=[];
  items.forEach(function(it){var x=it.k==='fin'?mmFin(it.m):(it.k==='live'?mmLive():mmFx(it.f)),key=x.sp+'|'+x.cat;if(!G[key]){G[key]={x:x,rows:[],t:it.t};order.push(key)}G[key].rows.push({x:x,t:it.t})});
  order.sort(function(a,b){return G[a].t-G[b].t});
  order.forEach(function(key){
    var g=G[key],sk=SPORTS[g.x.sp],ck=CATS[g.x.cat],box=mk('div',undefined,'vg'+(COL[key]?' cl':''));
    var h=mk('div',undefined,'vgh'),ic=mk('span',sk.ic,'vgi');ic.style.background=ck.c;h.appendChild(ic);h.appendChild(mk('b',sk.n+' - '+ck.n));h.appendChild(mk('span','⌃','chev'));
    h.onclick=function(){COL[key]=!COL[key];box.classList.toggle('cl')};box.appendChild(h);
    var rs=mk('div',undefined,'vrs');g.rows.sort(function(a,b){return a.t-b.t}).forEach(function(q){rs.appendChild(vRow(q.x))});box.appendChild(rs);root.appendChild(box);
  });
}
function vMatches(root){
  var T0=dayOf(VD).getTime(),T1=dayOf(VD+1).getTime(),items=[];
  if(LVO){if(liveNow())items.push({k:'live',t:Date.now()})}
  else{
    H.forEach(function(m){if(m.date>=T0&&m.date<T1)items.push({k:'fin',m:m,t:m.date})});
    if(liveNow()&&VD===0)items.push({k:'live',t:Date.now()});
    FX.forEach(function(f){if(f.date>=T0&&f.date<T1)items.push({k:'fx',f:f,t:f.date})});
  }
  if(!items.length){root.appendChild(mk('div',LVO?'ตอนนี้ไม่มีแมตช์ที่กำลังแข่งขัน':'ไม่มีแมตช์ในวันนี้','vg vempty'));return}
  vGroups(root,items);
}
function vHist(root){
  root.appendChild(mk('div','🏆 ประวัติผลการแข่งขัน','vh'));root.appendChild(filtBar());
  var list=H.slice().reverse().filter(inFilt);
  if(!list.length){root.appendChild(mk('div','ยังไม่มีประวัติการแข่งขัน','vg vempty'));return}
  list.forEach(function(m){
    var x=mmFin(m),sk=SPORTS[x.sp],ck=CATS[x.cat],win=x.res==='A'?x.A:(x.res==='B'?x.B:null),col=win?win.col:DC;
    var c=mk('div',undefined,'vg hc');
    c.appendChild(mk('div',dlong(m.date)+'  •  '+sk.ic+' '+sk.n+' '+ck.n,'hcd'));
    c.appendChild(vRow(x));
    if(x.sets.length)c.appendChild(mk('div','แต้มแต่ละเซ็ต: '+x.sets.join('  •  '),'hcs'));
    var w=mk('div',win?'🏆 '+win.n+' ชนะ':'🤝 เสมอ','hcw');w.style.background=col;c.appendChild(w);root.appendChild(c);
  });
}
var THM='auto';try{THM=localStorage.getItem('sb2theme')||'auto'}catch(e){}
function applyTheme(){
  var dk=THM==='dark'||(THM==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme',dk?'dark':'light');
  var b=$('thBtn');if(b){b.textContent=THM==='auto'?'🌓':(THM==='dark'?'🌙':'☀️');b.title='ธีมสี: '+(THM==='auto'?'อัตโนมัติ':(THM==='dark'?'มืด':'สว่าง'))}
  var mt=document.querySelector('meta[name=theme-color]');if(mt)mt.content=dk?'#071a3a':'#eaf4ff';
}
function setTheme(v){THM=v;try{localStorage.setItem('sb2theme',v)}catch(e){}applyTheme();renderReport()}
$('thBtn').onclick=function(){setTheme(THM==='auto'?'dark':(THM==='dark'?'light':'auto'))};
try{if(window.matchMedia)matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){if(THM==='auto')applyTheme()})}catch(e){}
applyTheme();
function vMore(root){
  var th=mk('div',undefined,'themes');
  [['auto','🌓 อัตโนมัติ'],['light','☀️ สว่าง'],['dark','🌙 มืด']].forEach(function(o){var b=mk('button',o[1],THM===o[0]?'on':'');b.onclick=function(){setTheme(o[0])};th.appendChild(b)});
  root.appendChild(mk('div','🎨 ธีมสี','vh'));root.appendChild(th);
  var c=mk('div',undefined,'vg vm');c.appendChild(mk('div',undefined,'lg vmlg'));
  c.appendChild(mk('b','เว็บไซต์สกอร์บอร์ด'));c.appendChild(mk('div','วิทยาลัยเทคนิคบ้านค่าย'));
  c.appendChild(mk('small','ติดตามผลการแข่งขัน ตารางคะแนน ตัวจริง และประวัติผู้ชนะแบบสด'));root.appendChild(c);
  if(!LIVE||CAN){var b=mk('button','🔐 เข้าสู่โหมดแอดมิน','vadm');b.onclick=function(){setRole('admin')};root.appendChild(b)}
}
function buildTabs(){
  var t=$('dtabs');t.innerHTML='';
  for(var o=-3;o<=5;o++){
    var d=dayOf(o),lb=o===-1?'เมื่อวาน':(o===0?'วันนี้':(o===1?'พรุ่งนี้':d.toLocaleDateString('th-TH',{weekday:'short',day:'numeric',month:'short'})));
    var b=mk('button',lb,'dt'+(o===VD?' on':''));(function(oo){b.onclick=function(){VD=oo;LVO=false;$('lvTg').classList.remove('on');buildTabs();vRender()}})(o);t.appendChild(b);
  }
  var on=t.querySelector('.on');if(on)t.scrollLeft=on.offsetLeft-t.clientWidth/2+on.clientWidth/2;
}
function vRender(){
  if(ROLE==='admin')return;
  document.body.classList.toggle('live',liveNow());document.body.classList.toggle('onm',VT==='matches');
  $('vtop').style.display=VT==='matches'?'':'none';
  document.querySelectorAll('#vnav button').forEach(function(b){b.classList.toggle('on',b.dataset.v===VT)});
  var r=$('vScreen');r.innerHTML='';
  if(VT==='matches')vMatches(r);
  else if(VT==='table'){r.appendChild(mk('div','🏅 ตารางคะแนน','vh'));var c=mk('div',undefined,'vg vtb');c.appendChild(standNode());r.appendChild(c);r.appendChild(mk('div','🏆 สายสี 4 ทีม • ชิงชนะเลิศ / ชิงที่ 3','vh'));var c2=mk('div',undefined,'vg vtb');c2.appendChild(cupNode());r.appendChild(c2)}
  else if(VT==='hist')vHist(r);else vMore(r);
  if(MDI)renderMD();
}
document.querySelectorAll('#vnav button').forEach(function(b){b.onclick=function(){VT=b.dataset.v;closeMD();vRender();window.scrollTo(0,0)}});
$('lvTg').onclick=function(){LVO=!LVO;this.classList.toggle('on',LVO);vRender()};
setInterval(function(){var e=$('lvMin');if(e)e.textContent=fmt();var m=$('mdSt');if(m&&MDI&&MDI.k==='live')m.textContent='สด • '+fmt()},1000);
/* --- รายละเอียดแมตช์ --- */
function openMatch(x){MDI={k:x.k,id:x.id};MDT='info';$('md').classList.add('open');$('md').scrollTop=0;renderMD()}
function closeMD(){MDI=null;$('md').classList.remove('open')}
function evLi(e){var li=mk('li'),tc=TCOL[e.type]||'#888';li.style.borderLeftColor=tc;li.style.background='color-mix(in srgb,'+tc+' 12%,var(--surf))';
  var m=mk('span',e.clock,'em');m.style.background=tc;li.appendChild(m);var d=mk('div');d.appendChild(mk('b',(ICON[e.type]||'')+' '+e.title));if(e.detail)d.appendChild(mk('small',e.detail));li.appendChild(d);return li}
function resCard(x){
  var w=mk('div',undefined,'rc'),col,txt;
  if(x.k==='fx'){col='#64748b';txt=x.post?'⏸ แมตช์นี้เลื่อนการแข่งขัน':'🕒 ยังไม่เริ่มการแข่งขัน'}
  else{var f=x.k==='fin',win=x.res==='A'?x.A:(x.res==='B'?x.B:null),hi=Math.max(x.A.s,x.B.s),lo=Math.min(x.A.s,x.B.s);col=win?win.col:DC;
    txt=win?(f?'🏆 '+win.n+' ชนะ '+hi+' - '+lo:'🔥 '+win.n+' กำลังนำ '+hi+' - '+lo):(f?'🤝 เสมอ ':'🤝 เสมอกัน ')+x.A.s+' - '+x.B.s}
  w.style.background=col;w.textContent=txt;return w;
}
function mdInfo(b,x){
  b.appendChild(resCard(x));
  var c=mk('div',undefined,'mc'),sk=SPORTS[x.sp],ck=CATS[x.cat];
  [['กีฬา',sk.ic+' '+sk.n],['หมวดหมู่',ck.ic+' '+ck.n],['วัน-เวลา',dlong(x.date)]].forEach(function(r){var l=mk('div',undefined,'ir');l.appendChild(mk('span',r[0]));l.appendChild(mk('b',r[1]));c.appendChild(l)});
  if(x.sets.length){var l=mk('div',undefined,'ir');l.appendChild(mk('span','แต้มแต่ละเซ็ต'));l.appendChild(mk('b',x.sets.join('  •  ')));c.appendChild(l)}
  b.appendChild(c);
  var ks=x.ev.filter(function(e){return e.type==='goal'||e.type==='cancel'||e.type==='ok'||e.type==='set'||e.type==='og'||e.type==='yc'||e.type==='rc'||e.type==='sub'});
  if(ks.length){var t=mk('div',undefined,'mc');t.appendChild(mk('div','เหตุการณ์สำคัญ','mh'));var ul=mk('ul',undefined,'evu');ks.forEach(function(e){ul.appendChild(evLi(e))});t.appendChild(ul);b.appendChild(t)}
}
function mdEv(b,x){
  if(!x.ev.length){b.appendChild(mk('div','ยังไม่มีเหตุการณ์','vg vempty'));return}
  var c=mk('div',undefined,'mc'),ul=mk('ul',undefined,'evu');x.ev.slice().reverse().forEach(function(e){ul.appendChild(evLi(e))});c.appendChild(ul);b.appendChild(c);
}
function plRows(n,sp){
  if(n===11&&sp==='football')return [1,4,4,2];
  var r=[],k,j;
  if(sp==='football'&&n>1){r.push(1);var rem=n-1;k=rem<=4?1:(rem<=8?2:3);for(j=0;j<k;j++)r.push(Math.floor(rem/k)+(j<rem%k?1:0))}
  else{k=n<=3?1:(n<=6?2:3);for(j=0;j<k;j++)r.push(Math.floor(n/k)+(j<n%k?1:0))}
  return r;
}
function ppl(p,top){
  var d=mk('div',undefined,'pp'),w=mk('div',undefined,'ppw'),im=mk('div',undefined,'ppi');
  if(p.ph)im.style.backgroundImage='url("'+p.ph+'")';else im.textContent=(p.n||'?').charAt(0);
  w.appendChild(im);
  function ic(cls,txt){w.appendChild(mk('span',txt,cls))}
  if(p.rt!==''&&p.rt!=null)ic('rt '+(top?'top':(p.rt>=7?'g':(p.rt>=6?'o':'r'))),Number(p.rt).toFixed(1)+(top?' ★':''));
  if(p.out){ic('ico sub','⬅');ic('min',p.out)}
  if(p.inn){ic('ico subin','➡');ic('min',p.inn)}
  if(p.rc)ic('ico rcard','');else if(p.yc)ic('ico ycard',p.yc>1?String(p.yc):'');
  if(p.g)ic('ico gl','⚽'+(p.g>1?p.g:''));
  if(p.og)ic('ico og','⚽');
  if(p.as)ic('ico as','👟');
  if(p.fl)ic('ico fl',String(p.fl));
  d.appendChild(w);d.appendChild(mk('div',((p.no!==''&&p.no!=null)?p.no+' ':'')+p.n,'ppn'));return d;
}
function pitchSide(list,sp,rev,col,name,mx){
  var w=mk('div',undefined,'pside'),rows=plRows(list.length,sp),i=0,bl=[];
  rows.forEach(function(c){var row=mk('div',undefined,'prow');for(var q=0;q<c;q++){row.appendChild(ppl(list[i],mx>0&&list[i].rt===mx));i++}bl.push(row)});
  if(rev)bl.reverse();
  var lab=mk('div',name,'plab');lab.style.background=col;
  if(!rev)w.appendChild(lab);bl.forEach(function(r){w.appendChild(r)});if(rev)w.appendChild(lab);return w;
}
function mdLu(b,x){
  if(!x.lu.A.length&&!x.lu.B.length){b.appendChild(mk('div','ยังไม่มีการประกาศรายชื่อตัวจริง','vg vempty'));return}
  var st=function(l){return l.filter(function(p){return !p.bn})},bn=function(l){return l.filter(function(p){return p.bn})};
  var pt=mk('div',undefined,'pitch c-'+x.sp);
  var mx=0;x.lu.A.concat(x.lu.B).forEach(function(p){if(p.rt!==''&&p.rt!=null&&Number(p.rt)>=8&&Number(p.rt)>mx)mx=Number(p.rt)});
  pt.appendChild(pitchSide(st(x.lu.A),x.sp,false,x.A.col,x.A.n,mx));pt.appendChild(mk('div',undefined,'pmid'));pt.appendChild(pitchSide(st(x.lu.B),x.sp,true,x.B.col,x.B.n,mx));b.appendChild(pt);
  if(bn(x.lu.A).length||bn(x.lu.B).length){
    var bx=mk('div',undefined,'mc benchbox');bx.appendChild(mk('div','ตัวสำรอง','mh'));
    [['A',x.A],['B',x.B]].forEach(function(q){var l=bn(x.lu[q[0]]);if(!l.length)return;var h=mk('div',q[1].n,'plab');h.style.background=q[1].col;bx.appendChild(h);var row=mk('div',undefined,'brow');l.forEach(function(p){row.appendChild(ppl(p,false))});bx.appendChild(row)});
    b.appendChild(bx);
  }
}
function mdStat(b,x){
  var cnt=function(ty,t){return x.ev.filter(function(e){return e.type===ty&&e.t===t}).length},sets=SPORTS[x.sp].sets,rows=[];
  rows.push([sets?'เซ็ตที่ชนะ':(x.sp==='football'?'ประตู':'คะแนน'),x.A.s,x.B.s]);
  if(sets&&x.sets.length){var a=0,c=0;x.sets.forEach(function(p){var q=p.split('-');a+=+q[0];c+=+q[1]});rows.push(['แต้มรวมทุกเซ็ต',a,c])}
  rows.push(['ประตู/แต้มที่ถูกยกเลิก',cnt('cancel','A'),cnt('cancel','B')],['VAR ตรวจสอบ',cnt('var','A'),cnt('var','B')],['ยืนยันหลัง VAR',cnt('ok','A'),cnt('ok','B')]);
  var su=function(t,k){return (x.lu[t]||[]).reduce(function(a,p){return a+(p[k]||0)},0)};
  rows.push(['ฟาวล์',su('A','fl'),su('B','fl')],['ใบเหลือง',su('A','yc'),su('B','yc')],['ใบแดง',su('A','rc'),su('B','rc')]);
  var c0=mk('div',undefined,'mc');
  rows.forEach(function(r){
    var w=mk('div',undefined,'sr'),t=r[1]+r[2],h=mk('div',undefined,'sh');h.appendChild(mk('b',String(r[1])));h.appendChild(mk('span',r[0]));h.appendChild(mk('b',String(r[2])));w.appendChild(h);
    var bar=mk('div',undefined,'sbar'),s1=mk('i'),s2=mk('i');s1.style.background=x.A.col;s2.style.background=x.B.col;s1.style.width=(t?r[1]/t*100:50)+'%';s2.style.width=(t?r[2]/t*100:50)+'%';if(!t){s1.style.opacity=s2.style.opacity=.25}
    bar.appendChild(s1);bar.appendChild(s2);w.appendChild(bar);c0.appendChild(w);
  });
  b.appendChild(c0);
}
function nameKey(n){return (n||'').trim().toLowerCase()}
function mdH2h(b,x){
  var ka=nameKey(x.A.n),kb=nameKey(x.B.n);
  var list=H.filter(function(m){if(m.id===x.id)return false;var a=nameKey(m.A.n),c=nameKey(m.B.n);return (a===ka&&c===kb)||(a===kb&&c===ka)}).sort(function(a,c){return c.date-a.date});
  var wa=0,wb=0,d=0;
  list.forEach(function(m){var wn=m.res==='A'?nameKey(m.A.n):(m.res==='B'?nameKey(m.B.n):'');if(!wn)d++;else if(wn===ka)wa++;else wb++});
  var c=mk('div',undefined,'mc');c.appendChild(mk('div','การเจอกันในประวัติ','mh'));
  var s=mk('div',undefined,'h2s');[[wa,x.A.col,x.A.n+' ชนะ'],[d,DC,'เสมอ'],[wb,x.B.col,x.B.n+' ชนะ']].forEach(function(q){var e=mk('div',undefined,'h2c');e.style.background=q[1];e.appendChild(mk('b',String(q[0])));e.appendChild(mk('small',q[2]));s.appendChild(e)});c.appendChild(s);
  if(!list.length)c.appendChild(mk('div','ยังไม่เคยเจอกันในประวัติ','empty'));
  list.forEach(function(m){
    var r=mk('div',undefined,'h2r'),wn=m.res==='A'?m.A:(m.res==='B'?m.B:null);
    r.appendChild(mk('small',dlong(m.date)));r.appendChild(mk('b',m.A.n+'  '+m.A.s+' - '+m.B.s+'  '+m.B.n));
    var t=mk('span',wn?'🏆 '+wn.n:'🤝 เสมอ','h2w');t.style.background=wn?wn.col:DC;r.appendChild(t);c.appendChild(r);
  });
  b.appendChild(c);
  var rc=mk('div',undefined,'mc');rc.appendChild(mk('div','ผลงานรวมในประวัติ','mh'));
  [x.A,x.B].forEach(function(t){var w0=0,d0=0,l0=0,k=nameKey(t.n);H.forEach(function(m){var me=nameKey(m.A.n)===k?m.A:(nameKey(m.B.n)===k?m.B:null);if(!me)return;var op=me===m.A?m.B:m.A;if(me.s>op.s)w0++;else if(me.s<op.s)l0++;else d0++});
    var l=mk('div',undefined,'ir');l.appendChild(mk('span',t.n));l.appendChild(mk('b','ชนะ '+w0+' • เสมอ '+d0+' • แพ้ '+l0));rc.appendChild(l)});
  b.appendChild(rc);
}
function renderMD(){
  if(!MDI)return;
  var x=findMM(MDI),md=$('md');if(!x){closeMD();return}
  var keep=md.scrollTop;md.innerHTML='';
  var sk=SPORTS[x.sp],ck=CATS[x.cat],hd=mk('div',undefined,'mhd'),top=mk('div',undefined,'mtop'),bk=mk('button','←','mbk');
  bk.onclick=closeMD;top.appendChild(bk);top.appendChild(mk('div',sk.ic+' '+sk.n+' • '+ck.n,'mcomp'));hd.appendChild(top);
  var tm=mk('div',undefined,'mteams');
  function side(t){var s=mk('div',undefined,'mside');s.appendChild(bdg(t,54));s.appendChild(mk('div',t.n,'mnm'));return s}
  tm.appendChild(side(x.A));
  var mid=mk('div',undefined,'mscore');
  if(x.k==='fx'){mid.appendChild(mk('b',hhmm(x.date)));mid.appendChild(mk('small',x.post?'เลื่อน':''))}
  else{mid.appendChild(mk('b',x.A.s+'  -  '+x.B.s));var st=mk('small',x.k==='live'?'สด • '+fmt():'จบการแข่งขัน');st.id='mdSt';mid.appendChild(st)}
  tm.appendChild(mid);tm.appendChild(side(x.B));hd.appendChild(tm);
  var tabs=mk('div',undefined,'mtabs');
  [['info','ข้อมูล'],['live','สด'],['lu','ตัวจริง'],['st','สถิติ'],['h2h','เฮดทูเฮด']].forEach(function(t){var b=mk('button',t[1],MDT===t[0]?'on':'');b.onclick=function(){MDT=t[0];renderMD()};tabs.appendChild(b)});
  hd.appendChild(tabs);md.appendChild(hd);
  var body=mk('div',undefined,'mbody');
  ({info:mdInfo,live:mdEv,lu:mdLu,st:mdStat,h2h:mdH2h})[MDT](body,x);
  md.appendChild(body);md.scrollTop=keep;
}
/* --- ตารางแข่งล่วงหน้า (แอดมิน) --- */
function saveFX(){try{localStorage.setItem('sb2fx',JSON.stringify(FX))}catch(e){}if(DB&&ROLE==='admin'){try{DB.doc('live/fixtures').set({list:JSON.parse(JSON.stringify(FX))}).catch(function(){})}catch(e){}}}
function startFx(f){
  $('nameA').value=f.a;$('nameB').value=f.b;$('inA').value=abOf(f.a);$('inB').value=abOf(f.b);$('colA').value=f.ca;$('colB').value=f.cb;
  S.sp=f.sp;S.cat=f.cat;newMatch();_sk='';if(!SPORTS[S.sp].sets){S.base=SPORTS[S.sp].base||45;$('inStop').value=S.base}
  paint();syncOpt();FX=FX.filter(function(x){return x.id!==f.id});saveFX();renderFX();save();
}
function renderFX(){
  var box=$('fxList');if(!box)return;box.innerHTML='';
  FX.slice().sort(function(a,b){return a.date-b.date}).forEach(function(f){
    var r=mk('div',undefined,'lurow'),sk=SPORTS[f.sp],ck=CATS[f.cat];
    var t=mk('span',dlong(f.date)+'  '+sk.ic+ck.ic+'  '+f.a+' vs '+f.b+(f.post?'  (เลื่อน)':''));t.style.flex='1';r.appendChild(t);
    function btn(txt,fn){var b=mk('button',txt);b.style.cssText='background:var(--bg);color:var(--text);border:2px solid var(--line);padding:4px 8px;font-size:.78rem';b.onclick=function(){fn(b)};r.appendChild(b)}
    btn('▶ เริ่ม',function(b){if(liveNow())arm(b,'ยังไม่จบ แตะอีกครั้ง',function(){startFx(f)});else startFx(f)});
    btn(f.post?'ยกเลิกเลื่อน':'เลื่อน',function(){f.post=!f.post;saveFX();renderFX()});
    btn('✕',function(){FX=FX.filter(function(x){return x.id!==f.id});saveFX();renderFX()});
    box.appendChild(r);
  });
}
$('fxAdd').onclick=function(){
  var w=$('fxWhen').value,a=$('fxA').value.trim(),b=$('fxB').value.trim();if(!w||!a||!b)return;
  FX.push({id:Date.now(),date:new Date(w).getTime(),sp:S.sp,cat:S.cat,a:a,b:b,ca:$('fxCA').value,cb:$('fxCB').value,post:false});
  $('fxA').value='';$('fxB').value='';saveFX();renderFX();
};
renderFX();
function delMatch(id){hdel(id);H=H.filter(function(x){return x.id!==id});if(S.sid===id){S.sid=null;S.fin=false}saveH();save();updateRes();renderReport()}
function renderHM(){
  var box=$('hmList');if(!box)return;box.innerHTML='';
  if(!H.length){box.appendChild(mk('div','ยังไม่มีประวัติ','empty'));return}
  H.slice().reverse().forEach(function(m){
    var r=mk('div',undefined,'hmr'),sk=SPORTS[m.sp||'football'],ck=CATS[m.cat||'m'],d=mk('span');
    d.appendChild(document.createTextNode(m.A.n+'  '+m.A.s+' - '+m.B.s+'  '+m.B.n));d.appendChild(mk('small',dlong(m.date)+'  •  '+sk.ic+' '+sk.n+' '+ck.n+'  •  '+(m.res==='A'?m.A.n+' ชนะ':(m.res==='B'?m.B.n+' ชนะ':'เสมอ'))));
    r.appendChild(d);var x=mk('button','🗑 ลบ');x.style.cssText='background:var(--bg);color:#d93a3a;border:2px solid #d93a3a;padding:6px 10px;font-size:.8rem';
    x.onclick=function(){arm(x,'แตะอีกครั้ง',function(){delMatch(m.id)})};r.appendChild(x);box.appendChild(r);
  });
}
$('hmAll').onclick=function(){arm(this,'แตะอีกครั้งเพื่อลบประวัติทั้งหมด',function(){H.slice().forEach(function(x){hdel(x.id)});H=[];S.sid=null;S.fin=false;saveH();save();updateRes();renderReport()})};

/* ===== ระบบหลังบ้าน ===== */
try{TM=JSON.parse(localStorage.getItem('sb2tm')||'[]')}catch(e){TM=[]}
function copyTxt(t,b){
  var o=b.textContent;function done(ok){b.textContent=ok?'คัดลอกแล้ว ✓':'คัดลอกไม่ได้';setTimeout(function(){b.textContent=o},1800)}
  function fb(){try{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();var ok=document.execCommand('copy');ta.remove();done(ok)}catch(x){done(false)}}
  try{navigator.clipboard.writeText(t).then(function(){done(true)},fb)}catch(x){fb()}
}
function setBS(sec){
  BS=sec;
  document.querySelectorAll('[data-sec]').forEach(function(e){e.classList.toggle('bs-h',e.dataset.sec!==sec)});
  document.body.classList.toggle('bs-off',sec!=='live'&&sec!=='dash');
  document.querySelectorAll('#bnav button').forEach(function(b){b.classList.toggle('on',b.dataset.bs===sec)});
}
document.querySelectorAll('#bnav button').forEach(function(b){b.onclick=function(){setBS(b.dataset.bs);window.scrollTo(0,0)}});
document.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){setBS(b.dataset.go);window.scrollTo(0,0)}});
function renderDash(){
  var sum=$('dashSum');if(!sum)return;sum.innerHTML='';
  var tot=0;H.forEach(function(m){tot+=m.A.s+m.B.s});
  var st=liveNow()?'🔴 กำลังแข่งขัน':(S.fin?'🏁 จบแล้ว':'⚪ ยังไม่เริ่ม');
  [['แมตช์ปัจจุบัน',st],['แมตช์ที่บันทึกไว้',H.length+' นัด'],['ประตู/แต้มรวมทุกนัด',String(tot)],['นัดล่วงหน้า',FX.length+' นัด'],['ผู้เล่นตัวจริง',(LU.A.length+LU.B.length)+' คน'],['ทีมในทะเบียน',TM.length+' ทีม']].forEach(function(r){var d=mk('div');d.appendChild(mk('span',r[0]));d.appendChild(mk('b',r[1]));sum.appendChild(d)});
  var ul=$('dashEv');ul.innerHTML='';
  if(!EV.length)ul.appendChild(mk('li','ยังไม่มีเหตุการณ์','empty'));
  EV.slice(-6).reverse().forEach(function(e){ul.appendChild(evLi(e))});
  var r=$('dashRes');r.innerHTML='';
  if(!H.length)r.appendChild(mk('div','ยังไม่มีผลการแข่งขัน','empty'));
  H.slice(-3).reverse().forEach(function(m){var x=mmFin(m),w=x.res==='A'?x.A.n+' ชนะ':(x.res==='B'?x.B.n+' ชนะ':'เสมอ');var d=mk('div',undefined,'hmr'),sp=mk('span');sp.appendChild(document.createTextNode(m.A.n+'  '+m.A.s+' - '+m.B.s+'  '+m.B.n));sp.appendChild(mk('small',dlong(m.date)+'  •  🏆 '+w));d.appendChild(sp);r.appendChild(d)});
}
function saveTM(){try{localStorage.setItem('sb2tm',JSON.stringify(TM))}catch(e){}if(DB&&ROLE==='admin'){try{DB.doc('live/teams').set({list:JSON.parse(JSON.stringify(TM))}).catch(function(){})}catch(e){}}}
function loadTeam(t,tm){$('name'+t).value=tm.n;$('in'+t).value=tm.ab;$('col'+t).value=tm.col;paint();syncOpt();save()}
function shrinkLogo(file,cb){
  var done=false;function fin(v){if(!done){done=true;cb(v)}}
  setTimeout(function(){fin('')},15000);
  function draw(src,w,h,rel){try{var c=document.createElement('canvas');c.width=c.height=64;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,64,64);var k=Math.min(60/w,60/h),dw=w*k,dh=h*k;x.drawImage(src,(64-dw)/2,(64-dh)/2,dw,dh);fin(c.toDataURL('image/jpeg',0.8))}catch(e){fin('')}if(rel)rel()}
  function viaImg(){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){draw(im,im.naturalWidth,im.naturalHeight,function(){URL.revokeObjectURL(u)})};im.onerror=function(){URL.revokeObjectURL(u);fin('')};im.src=u}
  try{if(window.createImageBitmap){createImageBitmap(file).then(function(bm){draw(bm,bm.width,bm.height,function(){if(bm.close)bm.close()})},viaImg)}else viaImg()}catch(e){viaImg()}
}
function renderTM(){
  var box=$('tmList');if(!box)return;box.innerHTML='';
  if(!TM.length)box.appendChild(mk('div','ยังไม่มีทีมในทะเบียน','empty'));
  TM.forEach(function(tm){
    var r=mk('div',undefined,'lurow'),lg=logoNode({n:tm.n,col:tm.col,ab:tm.ab},26);lg.style.flex='none';r.appendChild(lg);
    var tx=mk('span',tm.n+'  ('+tm.ab+')');tx.style.flex='1';r.appendChild(tx);
    function bt(txt,fn){var b=mk('button',txt);b.style.cssText='background:var(--bg);color:var(--text);border:2px solid var(--line);padding:4px 8px;font-size:.78rem';b.onclick=function(){fn(b)};r.appendChild(b)}
    bt('เหย้า',function(){loadTeam('A',tm)});bt('เยือน',function(){loadTeam('B',tm)});
    bt('📷',function(){var fi=document.createElement('input');fi.type='file';fi.accept='image/*';fi.onchange=function(){if(fi.files[0])shrinkLogo(fi.files[0],function(g){if(g){tm.lg=g;saveTM();renderTM();renderReport()}})};fi.click()});
    bt('✕',function(b){arm(b,'ลบ?',function(){TM=TM.filter(function(x){return x.id!==tm.id});saveTM();renderTM();renderDash();renderReport()})});
    box.appendChild(r);
  });
  ['fxSelA','fxSelB'].forEach(function(id){var sel=$(id);if(!sel)return;var cur=sel.value;sel.innerHTML='';var o0=document.createElement('option');o0.value='';o0.textContent='— เลือกทีม —';sel.appendChild(o0);TM.forEach(function(tm){var o=document.createElement('option');o.value=tm.id;o.textContent=tm.n;sel.appendChild(o)});sel.value=cur})
}
$('tmAdd').onclick=function(){
  var n=$('tmName').value.trim();if(!n)return;
  var ab=($('tmAb').value.trim()||abOf(n)).toUpperCase().slice(0,3),f=$('tmLg').files&&$('tmLg').files[0],btn=this;
  function add(lg){TM.push({id:Date.now(),n:n,ab:ab,col:$('tmCol').value,lg:lg||''});$('tmName').value='';$('tmAb').value='';try{$('tmLg').value=''}catch(e){}saveTM();renderTM();renderDash();renderReport();btn.disabled=false}
  btn.disabled=true;if(f)shrinkLogo(f,add);else add('');
};
$('fxSelA').onchange=function(){var tm=TM.filter(function(x){return String(x.id)===$('fxSelA').value})[0];if(tm){$('fxA').value=tm.n;$('fxCA').value=tm.col}};
$('fxSelB').onchange=function(){var tm=TM.filter(function(x){return String(x.id)===$('fxSelB').value})[0];if(tm){$('fxB').value=tm.n;$('fxCB').value=tm.col}};
function histCSV(){
  var rows=[['วันที่','กีฬา','หมวดหมู่','ทีมเหย้า','คะแนนเหย้า','คะแนนเยือน','ทีมเยือน','ผู้ชนะ']];
  H.forEach(function(m){var sk=SPORTS[m.sp||'football'],ck=CATS[m.cat||'m'];rows.push([new Date(m.date).toLocaleString('th-TH'),sk.n,ck.n,m.A.n,m.A.s,m.B.s,m.B.n,m.res==='A'?m.A.n:(m.res==='B'?m.B.n:'เสมอ')])});
  return rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"'}).join(',')}).join('\n');
}
$('hmCsv').onclick=function(){copyTxt(histCSV(),this)};
function renderSet(){
  var th=$('stThemes');if(!th)return;th.innerHTML='';
  [['auto','🌓 อัตโนมัติ'],['light','☀️ สว่าง'],['dark','🌙 มืด']].forEach(function(o){var b=mk('button',o[1],THM===o[0]?'on':'');b.onclick=function(){setTheme(o[0])};th.appendChild(b)});
  var i=$('stInfo');i.innerHTML='';
  [['การเชื่อมต่อ',LIVE?'🟢 ออนไลน์ (ซิงก์ข้อมูลสดกับผู้ชม)':'🟠 ออฟไลน์ (ข้อมูลอยู่ในเครื่องนี้)'],['สิทธิ์ของคุณ',LIVE?(CAN?'แอดมิน (เจ้าของ/บรรณาธิการ)':'ผู้ชม'):'แอดมินในเครื่อง'],['ข้อมูลในระบบ',H.length+' แมตช์ • '+FX.length+' นัดล่วงหน้า • '+TM.length+' ทีม']].forEach(function(r){var d=mk('div',undefined,'ir');d.appendChild(mk('span',r[0]));d.appendChild(mk('b',r[1]));i.appendChild(d)});
}
$('bkCopy').onclick=function(){copyTxt(JSON.stringify({v:1,at:Date.now(),H:H,FX:FX,LU:LU,TM:TM}),this)};
$('bkRestore').onclick=function(){
  arm(this,'แตะอีกครั้งเพื่อกู้คืน (ทับข้อมูลเดิม)',function(){
    var m=$('bkMsg');
    try{
      var o=JSON.parse($('bkTxt').value);if(!o||o.v!==1)throw new Error('รูปแบบไม่ถูกต้อง');
      H=o.H||[];FX=o.FX||[];LU=o.LU||{A:[],B:[]};TM=o.TM||[];
      saveH();H.forEach(hset);saveFX();saveLU();saveTM();renderLU();renderPV();renderFX();renderTM();renderReport();
      $('bkTxt').value='';m.style.color='#1f9d55';m.textContent='กู้คืนข้อมูลสำเร็จ';
    }catch(e){m.style.color='#d93a3a';m.textContent='กู้คืนไม่ได้: '+(e&&e.message||'ข้อมูลไม่ถูกต้อง')}
  });
};
renderTM();renderDash();renderSet();

/* ===== ตาราง 4 สี + ชิงชนะเลิศ / ชิงที่ 3 ทุกกีฬา ===== */
var CUP={t:[{n:'สีแดง',col:'#e53935'},{n:'สีน้ำเงิน',col:'#1e88e5'},{n:'สีเขียว',col:'#43a047'},{n:'สีเหลือง',col:'#fdd835'}],res:{}},CSP='football',CCT='m';
try{var _cp=JSON.parse(localStorage.getItem('sb2cup')||'null');if(_cp&&_cp.t&&_cp.t.length===4){CUP=_cp;CUP.res=CUP.res||{}}}catch(e){}
function saveCUP(){try{localStorage.setItem('sb2cup',JSON.stringify(CUP))}catch(e){}if(DB&&ROLE==='admin'){try{DB.doc('live/cup').set(JSON.parse(JSON.stringify(CUP))).catch(function(){})}catch(e){}}}
function cupRows(){
  var rows=CUP.t.map(function(t){return {n:t.n,col:t.col,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}}),by={};
  rows.forEach(function(r){by[r.n]=r});
  H.forEach(function(m){
    if((m.sp||'football')!==CSP||(m.cat||'m')!==CCT)return;
    var a=by[m.A.n],b=by[m.B.n];if(!a||!b||a===b)return;
    a.p++;b.p++;a.gf+=m.A.s;a.ga+=m.B.s;b.gf+=m.B.s;b.ga+=m.A.s;
    if(m.A.s>m.B.s){a.w++;b.l++;a.pts+=3}else if(m.A.s<m.B.s){b.w++;a.l++;b.pts+=3}else{a.d++;b.d++;a.pts++;b.pts++}
  });
  return rows.sort(function(x,y){return y.pts-x.pts||(y.gf-y.ga)-(x.gf-x.ga)||y.gf-x.gf});
}
function cupMatch(title,a,b,k){
  var key=CSP+'_'+CCT,cur=(a&&b)?a.n+'|'+b.n:'',o=CUP.res[key]||{},r=(o[k]&&o[k].p===cur)?o[k]:{sa:'',sb:''};
  var box=mk('div',undefined,'cpm'),res={win:null,lose:null};box.appendChild(mk('div',title,'cph'));
  var done=r.sa!==''&&r.sb!==''&&+r.sa!==+r.sb,wa=done&&+r.sa>+r.sb,wb=done&&+r.sb>+r.sa;
  function side(t,sk,w){
    var d=mk('div',undefined,'cps'+(w?' win':''));
    if(t){d.style.borderLeftColor=t.col;d.appendChild(logoNode({n:t.n,col:t.col,ab:abOf(t.n)},24));d.appendChild(mk('b',t.n))}else d.appendChild(mk('b','—'));
    if(ROLE==='admin'&&a&&b){
      var i=document.createElement('input');i.type='number';i.min=0;i.value=r[sk];i.setAttribute('aria-label','คะแนน '+t.n);
      i.onchange=function(){var q=CUP.res[key]=CUP.res[key]||{};var x=q[k]=(q[k]&&q[k].p===cur)?q[k]:{p:cur,sa:'',sb:''};x[sk]=i.value;saveCUP();renderCup()};
      d.appendChild(i);
    }else d.appendChild(mk('span',r[sk]===''?'–':String(r[sk]),'cpn'));
    return d;
  }
  box.appendChild(side(a,'sa',wa));box.appendChild(side(b,'sb',wb));
  if(done){res.win=wa?a:b;res.lose=wa?b:a}else if(a&&b&&r.sa!==''&&r.sb!==''){box.appendChild(mk('div','เสมอ — ต้องมีผู้ชนะ (ต่อเวลา/จุดโทษ) แล้วแก้คะแนน','stnote'))}
  if(ROLE==='admin'&&a&&b){
    var bt=mk('button','▶ เริ่มแข่งขัน (โหลดเข้าสกอร์บอร์ด)');bt.style.cssText='background:var(--bg);color:var(--text);border:2px solid var(--line);padding:6px 10px;font-size:.8rem;margin-top:4px';
    function go(){startFx({id:'cup'+Date.now(),a:a.n,b:b.n,ca:a.col,cb:b.col,sp:CSP,cat:CCT});setBS('live')}
    bt.onclick=function(){if(liveNow())arm(bt,'ยังไม่จบ แตะอีกครั้ง',go);else go()};box.appendChild(bt);
  }
  return {node:box,win:res.win,lose:res.lose};
}
function cupNode(){
  var w=mk('div',undefined,'cup'),rows=cupRows();
  if(ROLE==='admin'){
    w.appendChild(mk('div','🎨 เลือกสีและชื่อ 4 ทีม','cph'));
    CUP.t.forEach(function(t,i){
      var r=mk('div',undefined,'cte'),n=document.createElement('input'),c=document.createElement('input');
      n.type='text';n.value=t.n;n.maxLength=18;c.type='color';c.value=t.col;
      n.onchange=function(){CUP.t[i].n=n.value.trim()||t.n;saveCUP();renderCup()};
      c.onchange=function(){CUP.t[i].col=c.value;saveCUP();renderCup()};
      r.appendChild(c);r.appendChild(n);w.appendChild(r);
    });
  }
  var ch=mk('div',undefined,'chips');
  Object.keys(SPORTS).forEach(function(k){var b=mk('button',SPORTS[k].ic+' '+SPORTS[k].n,'chip'+(CSP===k?' on':''));b.onclick=function(){CSP=k;renderCup()};ch.appendChild(b)});
  w.appendChild(ch);
  var ch2=mk('div',undefined,'chips');
  Object.keys(CATS).forEach(function(k){var b=mk('button',CATS[k].ic+' '+CATS[k].n,'chip'+(CCT===k?' on':''));b.onclick=function(){CCT=k;renderCup()};ch2.appendChild(b)});
  w.appendChild(ch2);
  var wr=mk('div',undefined,'pltw'),tb=mk('table',undefined,'plt'),hr=mk('tr'),th=mk('thead'),tbd=mk('tbody');
  ['#','ทีม','P','W','D','L','GD','แต้ม'].forEach(function(x,i){var h=mk('th',x);if(i===1)h.className='tcol';hr.appendChild(h)});
  th.appendChild(hr);tb.appendChild(th);
  rows.forEach(function(t,i){
    var tr=mk('tr'),gd=t.gf-t.ga;tr.style.boxShadow='inset 6px 0 0 '+t.col;
    tr.appendChild(mk('td',String(i+1)));
    var c1=mk('td',undefined,'tcol'),tc=mk('div',undefined,'tmc');tc.appendChild(logoNode({n:t.n,col:t.col,ab:abOf(t.n)},22));tc.appendChild(mk('span',t.n));c1.appendChild(tc);tr.appendChild(c1);
    [t.p,t.w,t.d,t.l,(gd>0?'+'+gd:String(gd)),t.pts].forEach(function(x,j){var td=mk('td',String(x));if(j===5)td.className='pts';tr.appendChild(td)});
    tbd.appendChild(tr);
  });
  tb.appendChild(tbd);wr.appendChild(tb);w.appendChild(wr);
  var full=rows.every(function(r){return r.p>=3});
  w.appendChild(mk('div','พบกันหมด 4 ทีม (ทีมละ 3 นัด) • ชนะ 3 เสมอ 1 แพ้ 0 • '+(full?'คู่ชิงสรุปแล้ว':'คู่ชิงด้านล่างเป็นอันดับปัจจุบัน จะแน่นอนเมื่อแข่งครบ'),'stnote'));
  var f=cupMatch('🏆 ชิงชนะเลิศ (อันดับ 1 พบ 2)',rows[0],rows[1],'f'),t3=cupMatch('🥉 ชิงที่ 3 (อันดับ 3 พบ 4)',rows[2],rows[3],'t');
  window.__cf=window.__cf||{};var ck=CSP+'_'+CCT+(f.win?f.win.n:'');if(f.win&&!window.__cf[ck]){window.__cf[ck]=1;if(window.__cfReady)confetti()}f.node.insertBefore(trophy(f.win?f.win.col:null,64),f.node.firstChild);var g=mk('div',undefined,'cpg');g.appendChild(f.node);g.appendChild(t3.node);w.appendChild(g);
  if(f.win||t3.win){
    var pd=mk('div',undefined,'cpod');
    [['🥇 แชมป์',f.win],['🥈 รองฯ',f.lose],['🥉 ที่ 3',t3.win],['4',t3.lose]].forEach(function(x){
      var d=mk('div',x[0]);d.appendChild(mk('b',x[1]?x[1].n:'—'));if(x[1])d.style.borderColor=x[1].col;pd.appendChild(d);
    });
    w.appendChild(pd);
  }
  var sep=mk('div');sep.style.cssText='height:2px;background:var(--line);margin:16px 0';w.appendChild(sep);w.appendChild(medalNode());
  return w;
}
function confetti(){var cs=['#f5b301','#e53935','#1e88e5','#43a047','#fdd835','#0284c7'],bx=document.createElement('div');bx.className='cfw';for(var i=0;i<48;i++){var p=document.createElement('i');p.style.cssText='left:'+(Math.random()*100)+'%;background:'+cs[i%6]+';animation-delay:'+(Math.random()*.5)+'s;animation-duration:'+(1.6+Math.random()*1.4)+'s;--dx:'+(Math.random()*160-80)+'px';bx.appendChild(p)}document.body.appendChild(bx);setTimeout(function(){bx.remove()},3600)}
setTimeout(function(){window.__cfReady=true},2000);
function trophy(col,sz){
  col=/^#[0-9a-f]{6}$/i.test(col||'')?col:'#7a5a00';
  var d=mk('div',undefined,'cpt');
  d.innerHTML='<svg viewBox="0 0 64 80" width="'+sz*0.8+'" height="'+sz+'" role="img" aria-label="ถ้วยรางวัล"><defs><linearGradient id="tg" x1="0" x2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset=".5" stop-color="#f5b301"/><stop offset="1" stop-color="#b8860b"/></linearGradient></defs><path d="M14 8h36v18c0 11-8 19-18 19s-18-8-18-19z" fill="url(#tg)"/><path d="M14 12H6c0 12 4 20 12 22M50 12h8c0 12-4 20-12 22" fill="none" stroke="url(#tg)" stroke-width="4" stroke-linecap="round"/><path d="M28 44h8v12h-8z" fill="url(#tg)"/><path d="M20 56h24l3 8H17z" fill="url(#tg)"/><rect x="16" y="64" width="32" height="9" rx="2" fill="'+col+'"/><path d="M32 15l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#fff8d6"/></svg>';
  return d;
}
function cupMedals(){
  var M={};CUP.t.forEach(function(t){M[t.n]={n:t.n,col:t.col,g:0,s:0,b:0}});
  var list=[];
  function dec(x){if(!x||!x.p||x.sa===''||x.sb===''||+x.sa===+x.sb)return null;var q=x.p.split('|'),a=+x.sa>+x.sb;return {w:q[a?0:1],l:q[a?1:0]}}
  Object.keys(CUP.res).forEach(function(key){
    var i=key.lastIndexOf('_'),o=CUP.res[key],row={sp:key.slice(0,i),ct:key.slice(i+1)},f=dec(o.f),t=dec(o.t);
    if(f){row.g=f.w;row.s=f.l;if(M[f.w])M[f.w].g++;if(M[f.l])M[f.l].s++}
    if(t){row.b=t.w;if(M[t.w])M[t.w].b++}
    if(f||t)list.push(row);
  });
  var rows=Object.keys(M).map(function(k){var r=M[k];r.tot=r.g+r.s+r.b;return r}).sort(function(a,b){return b.g-a.g||b.s-a.s||b.b-a.b});
  return {rows:rows,list:list};
}
function medalNode(){
  var w=mk('div'),m=cupMedals(),rows=m.rows;
  w.appendChild(trophy(rows[0]&&rows[0].tot?rows[0].col:null,64));
  var h=mk('div','🏅 ตารางเหรียญและถ้วยรางวัล (ทุกกีฬา)','cph');h.style.textAlign='center';w.appendChild(h);
  var wr=mk('div',undefined,'pltw'),tb=mk('table',undefined,'plt'),th=mk('thead'),hr=mk('tr'),tbd=mk('tbody');
  ['#','สี','🏆 ถ้วย','🥇','🥈','🥉','รวม'].forEach(function(x,i){var e=mk('th',x);if(i===1)e.className='tcol';hr.appendChild(e)});
  th.appendChild(hr);tb.appendChild(th);
  rows.forEach(function(r,i){
    var tr=mk('tr');tr.style.boxShadow='inset 6px 0 0 '+r.col;tr.appendChild(mk('td',String(i+1)));
    var c1=mk('td',undefined,'tcol'),tc=mk('div',undefined,'tmc');tc.appendChild(logoNode({n:r.n,col:r.col,ab:abOf(r.n)},22));tc.appendChild(mk('span',r.n));c1.appendChild(tc);tr.appendChild(c1);
    [r.g,r.g,r.s,r.b,r.tot].forEach(function(x,j){var td=mk('td',String(x));if(j===4)td.className='pts';tr.appendChild(td)});
    tbd.appendChild(tr);
  });
  tb.appendChild(tbd);wr.appendChild(tb);w.appendChild(wr);
  var mx=Math.max.apply(null,rows.map(function(r){return r.tot})),top=rows.filter(function(r){return r.tot===mx});
  if(mx>0){
    var l1=rows[0],tie=rows.filter(function(r){return r.g===l1.g&&r.s===l1.s&&r.b===l1.b});
    w.appendChild(mk('div','👑 สีนำ: '+(tie.length>1?tie.map(function(r){return r.n}).join(' / ')+' (เท่ากัน)':l1.n+' (🥇'+l1.g+' 🥈'+l1.s+' 🥉'+l1.b+')')+' • เหรียญรวมมากที่สุด: '+top.map(function(r){return r.n+' '+r.tot}).join(', '),'cld'));
  }else w.appendChild(mk('div','ยังไม่มีผลชิงชนะเลิศ/ชิงที่ 3 ที่บันทึกไว้','stnote'));
  w.appendChild(mk('div','จัดอันดับตามเหรียญทอง → เงิน → ทองแดง • แชมป์ได้ถ้วย+เหรียญทอง รองฯ ได้เงิน อันดับ 3 ได้ทองแดง','stnote'));
  var sk=Object.keys(SPORTS);
  m.list.sort(function(a,b){return sk.indexOf(a.sp)-sk.indexOf(b.sp)}).forEach(function(r){
    var d=mk('div',undefined,'cmr');d.appendChild(mk('b',((SPORTS[r.sp]&&SPORTS[r.sp].ic)||'')+' '+((SPORTS[r.sp]&&SPORTS[r.sp].n)||r.sp)+' • '+((CATS[r.ct]&&CATS[r.ct].n)||r.ct)));
    [['🏆',r.g],['🥈',r.s],['🥉',r.b]].forEach(function(x){if(!x[1])return;var sp=mk('span',x[0]+' '+x[1]),t=CUP.t.filter(function(q){return q.n===x[1]})[0];if(t)sp.style.borderLeftColor=t.col;d.appendChild(sp)});
    w.appendChild(d);
  });
  return w;
}
function renderCup(){var c=$('cupBox');if(c){c.innerHTML='';c.appendChild(cupNode())}if(ROLE!=='admin'&&typeof vRender==='function'&&VT==='table')vRender()}

/* ===== ผู้ชม / แอดมิน + ซิงก์ข้อมูลสด ===== */

var ADMINP=location.hash==='#admin';window.addEventListener('hashchange',function(){location.reload()});
function rt(){return ADMINP&&(CAN||!LIVE)?'admin':'view'}
var ROLE='view',LIVE=false,CAN=false,DB=null,RS=null,pt=null,FST=true,FSH=true;
function snap(){return {S:{A:S.A,B:S.B,sec:S.sec,run:!!S.run,base:S.base,add:S.add,spd:S.spd,fin:!!S.fin,sid:S.sid||null,sp:S.sp,cat:S.cat,sA:S.sA||0,sB:S.sB||0,sets:S.sets||[]},at:Date.now(),
  f:['nameA','inA','colA','nameB','inB','colB','colT'].map(function(i){return $(i).value}),
  ev:EV.slice(-80).map(function(e){return {type:e.type,t:e.t||null,title:e.title,detail:e.detail||'',clock:e.clock,score:e.score,col:e.col,real:e.real,varSec:e.varSec||0,big:e.big||'',pn:e.pn||'',pi:e.pi==null?null:e.pi,pt:e.pt||null}})}}
function push(){if(!DB||ROLE!=='admin')return;clearTimeout(pt);pt=setTimeout(function(){try{DB.doc('live/state').set(snap()).catch(function(){})}catch(e){}},250)}
function hset(m){if(!DB||ROLE!=='admin')return;try{DB.doc('history/'+m.id).set(JSON.parse(JSON.stringify(m))).catch(function(){})}catch(e){}}
function hdel(id){if(!DB||ROLE!=='admin')return;try{DB.doc('history/'+id).delete().catch(function(){})}catch(e){}}
function evBanner(e){
  var m={goal:['','⚽ ประตู!'],cancel:['no','❌ ไม่เป็นประตู'],var:['var','🖥 ตรวจสอบ VAR'],ok:['ok','✅ ยืนยันประตู'],set:['','🏁 จบเซ็ต'],og:['','🥅 ทำเข้าประตูตัวเอง'],yc:['','🟨 ใบเหลือง'],rc:['no','🟥 ใบแดง'],sub:['','🔁 เปลี่ยนตัว']}[e.type];
  if(!m)return;if(e.big)m[1]=e.big;
  banner(m[0],m[1],e.title+(e.detail?' • '+e.detail:'')+' • '+e.clock,e.t||'A',e.type==='var');
  $('goalbar').style.setProperty('--gc',e.col);
}
function applyRemote(d,init){
  var r=d.S,last=EV.length?EV[EV.length-1].real:0;
  S.A=r.A;S.B=r.B;S.base=r.base;S.add=r.add;S.spd=r.spd;S.fin=r.fin;S.sid=r.sid;S.sp=r.sp||'football';S.cat=r.cat||'m';S.sA=r.sA||0;S.sB=r.sB||0;S.sets=r.sets||[];S.run=r.run;
  S.sec=r.sec+(r.run?(Date.now()-d.at)/1000*r.spd:0);S.last=Date.now();
  ['nameA','inA','colA','nameB','inB','colB','colT'].forEach(function(i,k){$(i).value=(i==='colT'&&(d.f[k]==='#3aa0f0'||d.f[k]==='#1e5bb8'))?'#1d4ed8':d.f[k]});
  $('psA').textContent=S.A;$('psB').textContent=S.B;
  $('inStop').value=S.base;$('inAdd').value=S.add;$('inSpd').value=S.spd;
  EV=d.ev.slice();paint();render();renderReport();
  if(!init){var nw=EV.filter(function(e){return e.real>last}),e=nw[nw.length-1];if(e)evBanner(e)}
}
function setRole(r){
  ROLE=r;document.body.classList.toggle('view',r!=='admin');
  if(r==='admin')setBS(BS);
  var vn='';try{vn=localStorage.getItem('sbviewer')||''}catch(e){}$('roleTag').textContent=r==='admin'?'แอดมิน':(vn||'ผู้ชม');
  $('mAdmin').textContent='👁 ไปหน้าผู้ชม';
  $('mAdmin').style.display=ADMINP?'':'none';
  $('liveNote').textContent=(ADMINP&&LIVE&&!CAN)?'ยังไม่ได้เข้าสู่ระบบแอดมิน — ต้องล็อกอินบัญชี Claude ของเจ้าของหรือบรรณาธิการ แล้วเปิดหน้านี้ใหม่':(LIVE||!ADMINP)?'':'ออฟไลน์: ข้อมูลบันทึกในเครื่องนี้เท่านั้น';
  if(r!=='admin'&&RS)applyRemote(RS,true);
  if(r!=='admin')buildTabs();
  renderReport();
}
$('menuB').onclick=function(e){e.stopPropagation();$('menu').classList.toggle('open')};
document.addEventListener('click',function(){$('menu').classList.remove('open')});
$('mHome').onclick=function(){$('rep').classList.remove('open');window.scrollTo({top:0,behavior:'smooth'})};
$('mEv').onclick=function(){setTab('ev');openRep()};
$('mTbl').onclick=function(){$('rep').classList.remove('open');$('standPanel').scrollIntoView({behavior:'smooth'})};
$('mLu').onclick=function(){setTab('lu');openRep()};
$('mHist').onclick=function(){setTab('hist');openRep()};
$('mAdmin').onclick=function(){location.hash=''};
setRole(rt());
(async function(){
  try{
    var u=await claude.use('user'),db=await claude.use('db');
    if(!db){setRole(rt());return}
    DB=db;LIVE=true;CAN=u?await u.canEdit():false;
    db.doc('live/state').onSnapshot(function(sn){
      if(!sn.exists){if(CAN&&FST)DB.doc('live/state').set(snap()).catch(function(){})}
      else{RS=sn.data();if(FST||ROLE!=='admin')applyRemote(RS,FST)}
      FST=false;
    },function(){});
    var FCU=true,FLU=true,FAN=true,ANNAT=0,FFX=true,FTM=true;
    db.doc('live/teams').onSnapshot(function(sn){
      if(!sn.exists){if(CAN&&FTM&&TM.length)saveTM()}
      else if(FTM||ROLE!=='admin'){TM=sn.data().list||[];renderTM()}
      FTM=false;
    },function(){});
    db.doc('live/fixtures').onSnapshot(function(sn){
      if(!sn.exists){if(CAN&&FFX&&FX.length)saveFX()}
      else if(FFX||ROLE!=='admin'){FX=sn.data().list||[];renderFX()}
      FFX=false;renderReport();
    },function(){});
    db.doc('live/cup').onSnapshot(function(sn){if(sn.exists&&(ROLE!=='admin'||FCU)){var d=sn.data();if(d&&d.t&&d.t.length===4){CUP=d;CUP.res=CUP.res||{};renderReport()}}else if(!sn.exists&&CAN&&FCU)saveCUP();FCU=false},function(){});
    db.doc('live/lineup').onSnapshot(function(sn){
      if(!sn.exists){if(CAN&&FLU&&(LU.A.length||LU.B.length))saveLU()}
      else if(FLU||ROLE!=='admin'){var d=sn.data();LU={A:d.A||[],B:d.B||[]};renderLU()}
      FLU=false;renderReport();
    },function(){});
    db.doc('live/announce').onSnapshot(function(sn){
      if(sn.exists){var a=sn.data();if(!FAN&&ROLE!=='admin'&&a.at>ANNAT)showAnn(a.team);ANNAT=a.at}
      FAN=false;
    },function(){});
    db.collection('history').onSnapshot(function(q){
      var arr=q.docs.map(function(x){return x.data()}).sort(function(a,b){return a.date-b.date});
      if(FSH&&CAN&&!arr.length&&H.length)H.forEach(hset);
      else if(arr.length||ROLE!=='admin')H=arr;
      FSH=false;renderReport();
    },function(){});
    setRole(rt());
  }catch(e){LIVE=false;setRole(rt())}
})();
