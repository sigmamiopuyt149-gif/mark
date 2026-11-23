(function(){try{
var $=function(i){return document.getElementById(i)},cur='A',sig='';
function lum(h){var n=parseInt(h.slice(1),16);return (.299*(n>>16)+.587*(n>>8&255)+.114*(n&255))/255}
function fire(el){['input','change'].forEach(function(t){el.dispatchEvent(new Event(t,{bubbles:true}))})}
function setSlot(s,t){$('name'+s).value=t.n;$('in'+s).value=window.abOf?abOf(t.n):t.n.slice(0,3);$('col'+s).value=t.col;['name','in','col'].forEach(function(p){fire($(p+s))})}
function find(s){var n=$('name'+s).value;return CUP.t.filter(function(t){return t.n===n})[0]||null}
function draw(){
  var g=$('tpkg');if(!g||!window.CUP)return;g.innerHTML='';
  var a=find('A'),b=find('B');
  CUP.t.forEach(function(t){
    var c=document.createElement('button');c.type='button';c.className='tpc'+((cur==='A'?a:b)===t?' sel':'');
    c.style.background=t.col;c.style.color=lum(t.col)>.62?'#1b1b1b':'#fff';c.appendChild(document.createTextNode(t.n));
    if(a===t){var x=document.createElement('span');x.className='bd';x.textContent='A';c.appendChild(x)}
    if(b===t){var y=document.createElement('span');y.className='bd';y.textContent='B';c.appendChild(y)}
    c.onclick=function(){
      var o=cur==='A'?'B':'A',mine=find(cur),other=find(o);
      if(other===t){var alt=mine&&mine!==t?mine:CUP.t.filter(function(q){return q!==t})[0];setSlot(o,alt)}
      setSlot(cur,t);
      if(cur==='A'){cur='B';mark()}
      draw();
    };
    g.appendChild(c);
  });
  sig=CUP.t.map(function(t){return t.n+t.col}).join('|')+$('nameA').value+$('colA').value+$('nameB').value+$('colB').value+cur;
}
function mark(){document.querySelectorAll('#tpks button').forEach(function(b){b.classList.toggle('on',b.dataset.s===cur)})}
document.querySelectorAll('#tpks button').forEach(function(b){b.onclick=function(){cur=b.dataset.s;mark();draw()}});
setInterval(function(){try{if(!window.CUP)return;var s=CUP.t.map(function(t){return t.n+t.col}).join('|')+$('nameA').value+$('colA').value+$('nameB').value+$('colB').value+cur;if(s!==sig)draw()}catch(e){}},1200);
setTimeout(draw,300);draw();
}catch(e){}})();
