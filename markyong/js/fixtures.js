(function(){
var $=function(i){return document.getElementById(i)};
var F={sp:'',st:'all',day:''},CD=0,WD=['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'],MO=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],RD={g:'รอบพบกันหมด',t:'ชิงที่ 3',f:'ชิงชนะเลิศ',x:'แมตช์พิเศษ'},INIT=false;
function two(n){return n<10?'0'+n:''+n}
function ymd(t){var d=new Date(t);return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()}
function tm(t){var d=new Date(t);return two(d.getHours())+':'+two(d.getMinutes())}
function dl(t){var d=new Date(t);return WD[d.getDay()]+' '+d.getDate()+' '+MO[d.getMonth()]}
function ldt(t){var d=new Date(t);return d.getFullYear()+'-'+two(d.getMonth()+1)+'-'+two(d.getDate())+'T'+two(d.getHours())+':'+two(d.getMinutes())}
function rel(t){var m=Math.round((t-Date.now())/60000);if(m<60)return 'อีก '+Math.max(m,1)+' นาที';if(m<1440)return 'อีก '+Math.round(m/60)+' ชม.';return 'อีก '+Math.round(m/1440)+' วัน'}
function toast(t){var e=mk('div',t,'sctoast');document.body.appendChild(e);setTimeout(function(){e.remove()},2600)}
function res(f){
  if(!f.ph)return f;
  var o=CSP,c=CCT;CSP=f.sp;CCT=f.cat;var r=cupRows();CSP=o;CCT=c;
  if(!r.every(function(x){return x.p>=3}))return null;
  var i=f.ph==='f'?0:2;return Object.assign({},f,{a:r[i].n,b:r[i+1].n,ca:r[i].col,cb:r[i+1].col});
}
function chip(n,c){var s=mk('span',undefined,'sct'),i=mk('i');i.style.background=c;s.appendChild(i);s.appendChild(document.createTextNode(n));return s}
function items(){
  var it=[];FX.forEach(function(f){it.push({k:'fx',f:f,t:f.date,sp:f.sp,cat:f.cat})});
  H.forEach(function(m){it.push({k:'fin',m:m,t:m.date,sp:m.sp||'football',cat:m.cat||'m'})});
  return it.sort(function(a,b){return a.t-b.t});
}
function ok(x){if(F.sp&&x.sp!==F.sp)return false;if(F.st==='up'&&x.k!=='fx')return false;if(F.st==='done'&&x.k==='fx')return false;return true}
function hero(box){
  var h=mk('div',undefined,'schero');CD=0;
  if(liveNow()){
    h.style.setProperty('--c1',$('colA').value);h.style.setProperty('--c2',$('colB').value);
    h.appendChild(mk('small','🔴 กำลังแข่งขันอยู่ตอนนี้'));
    var v=mk('div',undefined,'schv');v.appendChild(chip($('nameA').value,$('colA').value));v.appendChild(mk('span','vs'));v.appendChild(chip($('nameB').value,$('colB').value));h.appendChild(v);
  }else{
    var nx=FX.filter(function(f){return !f.post&&f.date>=Date.now()}).sort(function(a,b){return a.date-b.date})[0];
    if(!nx){h.appendChild(mk('small','⏭ แมตช์ถัดไป'));h.appendChild(mk('div','ยังไม่มีนัดแข่งที่กำลังจะมาถึง','schv'));box.appendChild(h);return}
    var r=res(nx)||nx,sk=SPORTS[nx.sp]||{ic:'🏅',n:nx.sp};
    h.style.setProperty('--c1',r.ca);h.style.setProperty('--c2',r.cb);
    h.appendChild(mk('small','⏭ แมตช์ถัดไป • '+sk.ic+' '+sk.n+(nx.rd?' • '+RD[nx.rd]:'')));
    var v2=mk('div',undefined,'schv');v2.appendChild(chip(r.a,r.ca));v2.appendChild(mk('span','vs'));v2.appendChild(chip(r.b,r.cb));h.appendChild(v2);
    h.appendChild(mk('small','🗓 '+dl(nx.date)+' เวลา '+tm(nx.date)+' น.'+(nx.v?'  📍 '+nx.v:'')));
    var cd=mk('div',undefined,'scd');
    [['scD','วัน'],['scH','ชม.'],['scM','นาที'],['scS','วินาที']].forEach(function(u){var d=mk('div'),b=mk('b','0');b.className='scdn';b.dataset.u=u[0];d.appendChild(b);d.appendChild(mk('small',u[1]));cd.appendChild(d)});
    h.appendChild(cd);CD=nx.date;if(window.Notification&&Notification.permission==='default'){var bl=mk('button','🔔 เปิดแจ้งเตือนก่อนแข่ง','scbell');bl.onclick=function(){try{Notification.requestPermission().then(function(){render()})}catch(e){}};h.appendChild(bl)}
    
  }
  box.appendChild(h);tick();
}
function tick(){
  if(!CD)return;
  var s=Math.max(0,Math.floor((CD-Date.now())/1000)),p={scD:Math.floor(s/86400),scH:Math.floor(s%86400/3600),scM:Math.floor(s%3600/60),scS:s%60};
  document.querySelectorAll('.scdn').forEach(function(e){var k=e.dataset.u;e.textContent=k==='scD'?p[k]:two(p[k])});
}
setInterval(tick,1000);
function card(x,i){
  var fin=x.k==='fin',f=fin?null:(res(x.f)||x.f),m=x.m,sk=SPORTS[x.sp]||{ic:'🏅'};
  var a=fin?{n:m.A.n,c:m.A.col||'#64748b'}:{n:f.a,c:f.ca},b=fin?{n:m.B.n,c:m.B.col||'#64748b'}:{n:f.b,c:f.cb};
  var c=mk('div',undefined,'scc'+(fin?' past':''));
  c.style.cssText='--c1:'+a.c+';--c2:'+b.c+';animation-delay:'+(Math.min(i,8)*.05)+'s';
  var tb=mk('div',undefined,'sctm');tb.appendChild(mk('span',sk.ic));tb.appendChild(mk('b',tm(x.t)));c.appendChild(tb);
  var mn=mk('div',undefined,'scm'),v=mk('div',undefined,'scv');
  v.appendChild(chip(a.n,a.c));
  if(fin)v.appendChild(mk('strong',m.A.s+' – '+m.B.s));else v.appendChild(mk('em','vs'));
  v.appendChild(chip(b.n,b.c));mn.appendChild(v);
  var mt=mk('div',undefined,'scs2');
  if(!fin&&x.f.rd==='f')mt.appendChild(mk('span','🏆 ชิงชนะเลิศ'));
  if(!fin&&x.f.rd==='t')mt.appendChild(mk('span','🥉 ชิงที่ 3'));
  if(!fin&&x.f.v)mt.appendChild(mk('span','📍 '+x.f.v));
  if(fin)mt.appendChild(mk('span','จบแล้ว','scst st-dn'));
  else if(x.f.post)mt.appendChild(mk('span','เลื่อน','scst st-po'));
  else if(x.f.ph&&!res(x.f))mt.appendChild(mk('span','รอผลพบกันหมด'));
  if(mt.firstChild)mn.appendChild(mt);
  if(!fin&&ROLE==='admin'){
    var ac=mk('div',undefined,'scact');
    var b0=mk('button','✏️ แก้ไข');b0.onclick=function(){startEdit(x.f)};ac.appendChild(b0);
    var b1=mk('button','▶ เริ่มแข่ง');function go(){if(startFx(x.f)!==false){$('scBack').hidden=true;setBS('live')}}
    b1.onclick=function(){if(liveNow())arm(b1,'ยังไม่จบ แตะอีกครั้ง',go);else go()};ac.appendChild(b1);
    var b3=mk('button','✕ ลบ');b3.onclick=function(){arm(b3,'แตะอีกครั้ง',function(){FX=FX.filter(function(q){return q.id!==x.f.id});saveFX();renderFX();render()})};ac.appendChild(b3);
    mn.appendChild(ac);
  }
  c.appendChild(mn);return c;
}
function renderInto(box,ov){
  var keep=ov?$('scBack').scrollTop:0;box.innerHTML='';
  if(ov){
    hero(box);
    var r1=mk('div',undefined,'scf');
    [['','ทุกกีฬา']].concat(Object.keys(SPORTS).map(function(k){return [k,SPORTS[k].ic+' '+SPORTS[k].n]})).forEach(function(o){var b=mk('button',o[1],F.sp===o[0]?'on':'');b.onclick=function(){F.sp=o[0];render()};r1.appendChild(b)});
    box.appendChild(r1);
  }
  var list=items().filter(function(x){return (!F.sp||x.sp===F.sp)&&(ov||x.k==='fx')});
  if(!list.length){box.appendChild(mk('div','📭 ยังไม่มีนัดแข่ง'+(ROLE==='admin'?' — เพิ่มได้ด้านล่าง':''),'scem'));return}
  var cur='',i=0,today=ymd(Date.now());
  list.forEach(function(x){
    var k=ymd(x.t);
    if(k!==cur){cur=k;var n=list.filter(function(q){return ymd(q.t)===k}).length,g=mk('div',(k===today?'📍 วันนี้ • ':'')+dl(x.t)+'  ','scg');g.appendChild(mk('span',n+' นัด'));box.appendChild(g)}
    box.appendChild(card(x,i++));
  });
  if(ov)$('scBack').scrollTop=keep;
}
var SIG='';
function wh(d,t){var x=$(d).value,y=$(t).value;return x&&y?x+'T'+y:''}
function syncTeams(){
  var sig=CUP.t.map(function(t){return t.n}).join('|');if(sig===SIG)return;var first=!SIG;SIG=sig;
  var a=$('scA').value,b=$('scB').value,tm2=CUP.t.map(function(t){return [t.n,t.n]});opts($('scA'),tm2);opts($('scB'),tm2);
  if(first){$('scB').selectedIndex=1;opts($('scSp'),Object.keys(SPORTS).map(function(k){return [k,k]}));opts($('scCt'),Object.keys(CATS).map(function(k){return [k,k]}))}else{if(a)$('scA').value=a;if(b)$('scB').value=b}
  drawSw();
}
function render(){syncTeams();if(!$('scBack').hidden)renderInto($('scMain'),true);var b2=$('scMain2');if(b2)renderInto(b2,false)}
function opts(sel,arr){sel.innerHTML='';arr.forEach(function(o){var e=document.createElement('option');e.value=o[0];e.textContent=o[1];sel.appendChild(e)})}
function qk(){var q=$('scQ');if(q.firstChild)return;
  [['วันนี้',0],['พรุ่งนี้',1],['มะรืน',2],['+3 วัน',3],['+7 วัน',7]].forEach(function(o){var b=mk('button',o[0]);b.type='button';b.onclick=function(){$('scDate').value=ldt(Date.now()+o[1]*86400000).slice(0,10)};q.appendChild(b)});
  ['08:30','09:30','13:00','15:30'].forEach(function(t){var b=mk('button',t);b.type='button';b.onclick=function(){$('scTime').value=t};q.appendChild(b)});
}
function initAdm(){
  var sp=Object.keys(SPORTS).map(function(k){return [k,SPORTS[k].ic+' '+SPORTS[k].n]}),ct=Object.keys(CATS).map(function(k){return [k,CATS[k].ic+' '+CATS[k].n]});
  ['scSp','gSp'].forEach(function(i){opts($(i),sp)});['scCt','gCt'].forEach(function(i){opts($(i),ct)});
  var td=ldt(Date.now()).slice(0,10);if(!$('scDate').value)$('scDate').value=td;if(!$('gDate').value)$('gDate').value=td;
  qk();syncTeams();drawSw();
}
var EDIT=null;
function drawSw(){
  [['swA','scA'],['swB','scB']].forEach(function(p){var c=$(p[0]),sel=$(p[1]);c.innerHTML='';CUP.t.forEach(function(t){var b=mk('button',t.n,'sw'+(sel.value===t.n?' on':'')),i=mk('i');b.type='button';i.style.background=t.col;b.insertBefore(i,b.firstChild);b.onclick=function(){sel.value=t.n;drawSw()};c.appendChild(b)})});
  [['swS','scSp',SPORTS],['swC','scCt',CATS]].forEach(function(p){var c=$(p[0]),sel=$(p[1]);c.innerHTML='';Object.keys(p[2]).forEach(function(k){var b=mk('button',p[2][k].ic+' '+p[2][k].n,sel.value===k?'on':'');b.type='button';b.onclick=function(){sel.value=k;drawSw()};c.appendChild(b)})});
}
function endEdit(){EDIT=null;$('scAdd').textContent='➕ เพิ่มนัดแข่ง';$('scCancel').hidden=true;$('scAdm').firstElementChild.textContent='➕ เพิ่มนัดแข่ง'}
function startEdit(f){
  EDIT=f.id;
  if(!f.ph){$('scA').value=f.a;$('scB').value=f.b}
  $('scSp').value=f.sp;$('scCt').value=f.cat;$('scRd').value=f.rd||'g';$('scV').value=f.v||'';
  var l=ldt(f.date);$('scDate').value=l.slice(0,10);$('scTime').value=l.slice(11,16);
  $('scAdd').textContent='💾 บันทึกการแก้ไข';$('scCancel').hidden=false;$('scAdm').open=true;$('scAdm').firstElementChild.textContent='✏️ แก้ไขนัดแข่ง';
  drawSw();$('scBack').hidden=true;setBS('sch');
  setTimeout(function(){$('scAdm').scrollIntoView({behavior:'smooth',block:'center'})},80);
}
$('scCancel').onclick=endEdit;
$('scAdd').onclick=function(){
  var w=wh('scDate','scTime'),a=$('scA').value,b=$('scB').value,ed=EDIT?FX.filter(function(q){return q.id===EDIT})[0]:null,ph=!!(ed&&ed.ph);
  if(!w||(!ph&&a===b)){toast('เลือกวันที่ เวลา และสองสีที่ต่างกัน');return}
  var ta=CUP.t.filter(function(t){return t.n===a})[0],tb=CUP.t.filter(function(t){return t.n===b})[0];
  var o={date:new Date(w).getTime(),sp:$('scSp').value,cat:$('scCt').value,rd:$('scRd').value,v:$('scV').value.trim()};
  if(ed){Object.assign(ed,o);if(!ph){ed.a=a;ed.b=b;ed.ca=ta.col;ed.cb=tb.col}endEdit();toast('บันทึกการแก้ไขแล้ว ✓')}
  else{FX.push(Object.assign({id:Date.now(),a:a,b:b,ca:ta.col,cb:tb.col,post:false},o));toast('เพิ่มนัดแข่งแล้ว ✓')}
  saveFX();renderFX();render();
};
$('scGen').onclick=function(){
  var w=wh('gDate','gTime');if(!w){toast('เลือกวันที่และเวลาเริ่ม');return}
  var t0=new Date(w).getTime(),gap=(+$('gGap').value||40)*60000,sp=$('gSp').value,ct=$('gCt').value,v=$('gV').value.trim(),T=CUP.t,id=Date.now(),n=0;
  [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]].forEach(function(p){FX.push({id:id+n,date:t0+n*gap,sp:sp,cat:ct,a:T[p[0]].n,b:T[p[1]].n,ca:T[p[0]].col,cb:T[p[1]].col,post:false,rd:'g',v:v});n++});
  [['t','อันดับ 3','อันดับ 4'],['f','อันดับ 1','อันดับ 2']].forEach(function(p){FX.push({id:id+n,date:t0+n*gap,sp:sp,cat:ct,a:p[1],b:p[2],ca:'#94a3b8',cb:'#94a3b8',post:false,rd:p[0],ph:p[0],v:v});n++});
  saveFX();renderFX();render();toast('สร้างโปรแกรมแล้ว '+n+' นัด ✓');
};
function open(){$('scBack').hidden=false;render();$('scBack').scrollTop=0}
window.SCH={res:res,tm:tm,dl:dl};window.openSC=open;
$('scX').onclick=function(){$('scBack').hidden=true};
var ms=$('mSched');if(ms)ms.onclick=open;
var _sf=window.startFx;window.startFx=function(f){var r=res(f);if(!r){toast('ยังไม่ทราบคู่ — ต้องแข่งพบกันหมดครบทุกทีมก่อน');return false}return _sf(r)};
var _vm=window.vMatches;window.vMatches=function(root){try{var b=mk('button','📅 ตารางนัดแข่งทั้งหมด','scbn');b.onclick=open;root.appendChild(b)}catch(e){}_vm(root)};
var _rr=window.renderReport;window.renderReport=function(){_rr.apply(this,arguments);try{render()}catch(e){}};
var DIS={},NOT={};
function notify(t,b,tag){try{if(window.Notification&&Notification.permission==='granted')new Notification(t,{body:b,tag:tag})}catch(e){}try{if(navigator.vibrate)navigator.vibrate([200,100,200])}catch(e){}}
function remind(){
  var now=Date.now(),nx=null,bn=$('scRem');
  FX.forEach(function(f){if(f.post)return;var d=f.date-now;if(d>-600000&&d<=1800000&&(!nx||f.date<nx.date))nx=f});
  var r=nx&&!DIS[nx.id]?res(nx):null;
  if(!r){if(bn)bn.remove();return}
  var d=nx.date-now,sk=SPORTS[nx.sp]||{ic:'🏅'},txt=d>0?'⏰ อีก '+Math.max(1,Math.ceil(d/60000))+' นาที':'🔴 ถึงเวลาแข่งแล้ว',line=sk.ic+' '+r.a+' vs '+r.b+' • '+tm(nx.date)+' น.';
  if(!bn){bn=mk('div',undefined,'screm');bn.id='scRem';document.body.appendChild(bn)}
  bn.innerHTML='';var t=mk('div',txt+'  '+line);t.onclick=function(){open()};bn.appendChild(t);
  var x=mk('button','✕');x.onclick=function(e){e.stopPropagation();DIS[nx.id]=1;bn.remove()};bn.appendChild(x);
  var fire=null;[30,10,0].forEach(function(m){var k=nx.id+'_'+m;if(!NOT[k]&&d<=m*60000){NOT[k]=1;fire=m}});
  if(fire!==null)notify(fire===0?'🔴 ถึงเวลาแข่งแล้ว':'⏰ อีก '+fire+' นาที แข่งขัน',line,'m'+nx.id);
}
setInterval(function(){try{remind()}catch(e){}},15000);setTimeout(function(){try{remind()}catch(e){}},1500);
initAdm();render();
})();
