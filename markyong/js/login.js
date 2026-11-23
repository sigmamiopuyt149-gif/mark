(function(){
var $=function(i){return document.getElementById(i)};
function msg(t){$('lgMsg').textContent=t}
function need(){msg('ปุ่มนี้ยังไม่เปิดใช้งานในหน้านี้')}
function err(e){var c=(e&&e.code)||'',M=[['wrong-password','อีเมลหรือรหัสผ่านไม่ถูกต้อง'],['invalid-credential','อีเมลหรือรหัสผ่านไม่ถูกต้อง'],['user-not-found','ยังไม่มีบัญชีนี้ กด "สมัครสมาชิก"'],['email-already','อีเมลนี้สมัครแล้ว ลองเข้าสู่ระบบ'],['weak-password','รหัสผ่านต้องยาวอย่างน้อย 6 ตัว'],['invalid-email','กรุณากรอกอีเมลให้ถูกต้อง (ใช้อีเมลแทนชื่อผู้ใช้)'],['account-exists','อีเมลนี้เคยสมัครด้วยวิธีอื่น ให้เข้าด้วยวิธีเดิม'],['popup-closed','ปิดหน้าต่างล็อกอินก่อนเสร็จ ลองอีกครั้ง'],['unauthorized-domain','โดเมนนี้ยังไม่ได้เพิ่มใน Firebase → Authentication → Settings → Authorized domains'],['operation-not-allowed','ยังไม่ได้เปิดวิธีล็อกอินนี้ใน Firebase → Authentication → Sign-in method'],['network-request-failed','เชื่อมต่ออินเทอร์เน็ตไม่ได้ ตรวจสัญญาณแล้วลองใหม่'],['invalid-api-key','ค่า apiKey ใน config.js ไม่ถูกต้อง'],['too-many-requests','ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่'],['popup-blocked','เบราว์เซอร์บล็อกหน้าต่างล็อกอิน อนุญาต popup แล้วลองใหม่'],['configuration-not-found','ยังไม่ได้เปิดบริการล็อกอินใน Firebase'],['invalid-oauth','ค่า App ID/Secret ของผู้ให้บริการไม่ถูกต้อง']];
  for(var i=0;i<M.length;i++)if(c.indexOf(M[i][0])>=0){msg(M[i][1]);return}
  msg('ไม่สำเร็จ ('+(c||'ไม่ทราบสาเหตุ')+') ลองใหม่อีกครั้ง')}
function stat(){var st=window.AUTH_STATUS,e=$('lgSt');if(!e)return;
  e.textContent=st==='ok'?'🟢 เชื่อมต่อระบบล็อกอินแล้ว':st==='noconfig'?'🟠 ยังไม่ได้ใส่ค่า Firebase ในไฟล์ config.js':st==='nosdk'?'🟠 โหลดระบบล็อกอินไม่ได้ (ตรวจอินเทอร์เน็ต)':st==='error'?'🔴 ระบบล็อกอินเริ่มต้นไม่สำเร็จ ตรวจค่าใน config.js':'ℹ️ หน้านี้ใช้บัญชี Claude • ปุ่ม Google/Facebook/LINE ใช้ได้เฉพาะแอปที่โฮสต์เอง (ดู README)';
  document.querySelectorAll('.lgs button').forEach(function(b){b.style.opacity=st==='ok'?'1':'.55'});
  if(window.AUTH_LAST&&st==='ok')err(window.AUTH_LAST)}
function vals(){return [$('lgU').value.trim(),$('lgP').value]}
$('mLogin').onclick=function(){adminLogin()};
$('lgX').onclick=function(){$('lgBack').hidden=true};
$('lgBack').onclick=function(e){if(e.target===$('lgBack'))$('lgBack').hidden=true};
$('lgEye').onclick=function(){var p=$('lgP');p.type=p.type==='password'?'text':'password'};
$('lgG').onclick=function(){window.GOOGLE_LOGIN?Promise.resolve(window.GOOGLE_LOGIN()).catch(err):need()};
$('lgF').onclick=function(){window.FACEBOOK_LOGIN?Promise.resolve(window.FACEBOOK_LOGIN()).catch(err):need()};
$('lgL').onclick=function(){window.LINE_LOGIN?window.LINE_LOGIN().catch(err):need()};
$('lgGo').onclick=function(){
  var v=vals();
  if(window.EMAIL_LOGIN){if(!v[0]||!v[1]){msg('กรอกอีเมลและรหัสผ่าน');return}window.EMAIL_LOGIN(v[0],v[1]).catch(err);return}
  try{claude.use('user').then(function(u){return u&&u.me()}).then(function(m){if(m&&m.id){msg('เข้าสู่ระบบแล้วในชื่อ '+(m.name||'ผู้ใช้')+' ✓');setTimeout(function(){$('lgBack').hidden=true;$('mReg').click()},700)}else need()}).catch(need)}catch(e){need()}
};
$('lgFg').onclick=function(){var v=vals();if(!window.EMAIL_RESET){need();return}if(!v[0]){msg('กรอกอีเมลก่อน แล้วกด "ลืมรหัสผ่าน?"');return}window.EMAIL_RESET(v[0]).then(function(){msg('ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลแล้ว')}).catch(err)};
$('lgReg').onclick=function(){var v=vals();if(!window.EMAIL_REGISTER){need();return}if(!v[0]||!v[1]){msg('กรอกอีเมลและตั้งรหัสผ่าน แล้วกด "สมัครสมาชิก"');return}window.EMAIL_REGISTER(v[0],v[1]).catch(err)};
})();
