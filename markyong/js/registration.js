(function(){
var R=function(i){return document.getElementById(i)},DBr=null,ME=null,mine=null,LST=[],ADM=false,pick='';
function cols(){return (window.CUP&&CUP.t)||[{n:'สีแดง',col:'#e53935'},{n:'สีน้ำเงิน',col:'#1e88e5'},{n:'สีเขียว',col:'#43a047'},{n:'สีเหลือง',col:'#fdd835'}]}
function draw(){
  var w=R('rgWho');w.innerHTML='';
  if(!DBr||!ME||!ME.id){R('rgForm').hidden=true;var m=document.createElement('div');m.className='rgmsg';m.textContent='ยังไม่ได้เข้าสู่ระบบ: กรุณาเปิดลิงก์นี้ในแอป/เว็บ Claude ที่ล็อกอินอยู่ แล้วกลับมาลงทะเบียน (ใช้บัญชี Claude ที่ได้รับสิทธิ์เข้าหน้านี้)';w.appendChild(m);return}
  R('rgForm').hidden=false;
  var d=document.createElement('div');d.className='rgwho';var im=document.createElement('img');im.src=ME.avatarUrl;im.alt='';d.appendChild(im);
  var t=document.createElement('div'),b=document.createElement('b');b.textContent=ME.name||'ผู้ใช้';t.appendChild(b);
  var sm=document.createElement('div');sm.style.fontSize='.8rem';sm.textContent=mine?'✅ ลงทะเบียนแล้ว':'ยังไม่ได้ลงทะเบียน';t.appendChild(sm);d.appendChild(t);w.appendChild(d);
  if(mine&&!R('rgName').dataset.f){R('rgName').value=mine.n||'';R('rgRoom').value=mine.room||'';R('rgRole').value=mine.role||'นักเรียน';pick=mine.col||'';R('rgName').dataset.f='1'}
  if(!R('rgName').value&&ME.name&&!mine)R('rgName').value=ME.name;
  var c=R('rgCols');c.innerHTML='';
  cols().forEach(function(x){var bt=document.createElement('button'),i=document.createElement('i');i.style.background=x.col;bt.appendChild(i);bt.appendChild(document.createTextNode(x.n));if(pick===x.n)bt.className='on';bt.onclick=function(){pick=x.n;draw()};c.appendChild(bt)});
  drawAdm();
}
function drawAdm(){
  var l=R('rgList');if(!ADM){l.hidden=true;return}
  l.hidden=false;l.innerHTML='';var h=document.createElement('b');h.textContent='📋 ผู้ลงทะเบียนทั้งหมด ('+LST.length+')';l.appendChild(h);
  var cn={};LST.forEach(function(r){cn[r.col]=(cn[r.col]||0)+1});
  cols().forEach(function(x){var d=document.createElement('div'),i=document.createElement('i');i.style.background=x.col;d.appendChild(i);d.appendChild(document.createTextNode(x.n+': '+(cn[x.n]||0)+' คน'));l.appendChild(d)});
  LST.slice().sort(function(a,b){return b.at-a.at}).forEach(function(r){var d=document.createElement('div'),i=document.createElement('i'),cc=cols().filter(function(x){return x.n===r.col})[0];i.style.background=cc?cc.col:'#999';d.appendChild(i);var s=document.createElement('span');s.textContent=r.n+' • '+(r.room||'-')+' • '+r.role;d.appendChild(s);l.appendChild(d)});
}
R('rgSave').onclick=async function(){
  var n=R('rgName').value.trim(),m=R('rgMsg');
  if(!n||!pick){m.textContent='กรอกชื่อและเลือกสีที่สังกัดก่อน';return}
  try{await DBr.doc('regs/'+ME.id).set({uid:ME.id,n:n,room:R('rgRoom').value.trim(),role:R('rgRole').value,col:pick,at:Date.now()});m.textContent='บันทึกแล้ว ✓'}
  catch(e){m.textContent='บันทึกไม่ได้: บัญชีนี้อาจไม่มีสิทธิ์เขียนข้อมูล (ให้เจ้าของเพิ่มสิทธิ์ผู้ร่วมใช้)'}
};
function open(){R('regBack').hidden=false;draw()}
R('mReg').onclick=open;R('regX').onclick=function(){R('regBack').hidden=true};
R('regBack').onclick=function(e){if(e.target===R('regBack'))R('regBack').hidden=true};
(async function(){
  try{
    var u=await claude.use('user'),db=await claude.use('db');if(!u||!db)return;
    DBr=db;ME=await u.me();ADM=await u.canEdit();
    if(ME.id)db.doc('regs/'+ME.id).onSnapshot(function(sn){mine=sn.exists?sn.data():null;draw()},function(){});
    if(ADM)db.collection('regs').onSnapshot(function(q){LST=q.docs.map(function(x){return x.data()});drawAdm()},function(){});
  }catch(e){}
})();
})();
