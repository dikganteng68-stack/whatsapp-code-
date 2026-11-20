function copyTxt(t){t=String(t==null?"":t);
 const fb=()=>new Promise((ok,no)=>{try{const a=document.createElement("textarea");a.value=t;a.setAttribute("readonly","");a.style.cssText="position:fixed;top:0;left:0;width:1px;height:1px;opacity:0";document.body.appendChild(a);a.focus();a.select();a.setSelectionRange(0,t.length);const r=document.execCommand("copy");a.remove();r?ok():no(new Error("copy"))}catch(e){no(e)}});
 if(navigator.clipboard&&window.isSecureContext){return navigator.clipboard.writeText(t).catch(fb)}return fb()}

(()=>{
const $=id=>document.getElementById(id);
const CH=[["umum","#","Umum","Bebas bahas apa saja, tanpa kata kasar"],["kode","</>","Kode","Khusus kirim kode saja"],["bantuan","?","Bantuan","Kode rusak? Minta bantuan di sini"],["santai","~","Santai","Bebas ngobrol, tanpa filter"]];
const RULES={umum:"🛡️ Chat Umum: bebas membahas apa saja, tapi tanpa kata kasar. Pesan yang mengandung kata kasar otomatis dihapus.",kode:"💻 Chat Kode: khusus untuk mengirim kode saja. Pesan tanpa kode akan ditolak.",bantuan:"🆘 Bantuan: kodemu rusak atau error? Kirim di sini (boleh teks dan kode) supaya yang lain bisa membantu. Pakai tombol Salin di bawah tiap pesan.",santai:"😎 Santai: ngobrol bebas, tidak ada filter kata."};
const BAD_EXACT=new Set(["babi","asu","puki","anj","anjg","anjk"]);
const BAD_STEM=["kontol","memek","ngentot","bangsat","bajingan","goblok","tolol","jancok","jancuk","pepek","brengsek","anjing","pukimak"];
const LEET={"0":"o","1":"i","3":"e","4":"a","5":"s","7":"t","@":"a","$":"s","!":"i"};
const purged=new Set();
function kasar(s){
 const tk=String(s).toLowerCase().replace(/[013457@$!]/g,c=>LEET[c]).split(/[^a-z]+/).filter(Boolean);
 const out=[];let run="";
 for(const w of tk){if(w.length===1)run+=w;else{if(run){out.push(run);run=""}out.push(w)}}
 if(run)out.push(run);
 return out.some(w=>{w=w.replace(/(.)\1+/g,"$1");return BAD_EXACT.has(w)||BAD_STEM.some(b=>w.startsWith(b))})}
function applyChannel(){$("ruleBar").textContent=RULES[cur]||(isGrp()?grpRule():"💬 Chat pribadi dengan "+(dmName()||"temanmu")+". Bebas ngobrol, tanpa filter.");$("gSet").classList.toggle("hide",!isGrp());if(cur==="kode"){setMode("code");if($("lang").value==="Teks biasa")$("lang").value="Python"}chkOff()}
let cur="umum",db=null,uid="lokal-"+Math.random().toString(36).slice(2,8),name="",mode="text",unsub=null,msgs=[],timer=null;
const LKRE=/^km(Name|Pw|About|User|Link|Code|Photo|Thumb|Friends|Groups|Star)$/;let lkSoonFn=null;
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}if(lkSoonFn&&LKRE.test(k))lkSoonFn()}};
let localUid=store.get("kmUid");if(!localUid){localUid="lokal-"+Math.random().toString(36).slice(2,10);store.set("kmUid",localUid)}uid=localUid;
function toast(t){const d=document.createElement("div");d.className="toast";d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2200)}
function hue(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))%360;return `hsl(${h} 85% 72%)`}
function drawChs(){const box=$("chs");box.textContent="";for(const [id,ic,n,d] of CH){const b=document.createElement("button");b.className="ch"+(id===cur?" on":"");b.innerHTML='<div class="av"></div><div><b></b><small></small></div>';b.querySelector(".av").textContent=ic;b.querySelector("b").textContent=n;b.querySelector("small").textContent=d;b.onclick=()=>{cur=id;$("side").classList.remove("open");drawChs();subscribe()};box.appendChild(b)}
 {const b=document.createElement("button");b.className="ch";b.innerHTML='<div class="av"></div><div><b></b><small></small></div>';b.querySelector(".av").textContent="🗄️";b.querySelector("b").textContent="Storage";b.querySelector("small").textContent="Kode & file untuk semua orang";b.onclick=()=>{$("side").classList.remove("open");openStore()};box.appendChild(b)}
 {const b=document.createElement("button");b.className="ch";b.innerHTML='<div class="av"></div><div><b></b><small></small></div>';b.querySelector(".av").textContent="🎬";b.querySelector("b").textContent="Story";b.querySelector("small").textContent="Foto & video 23 detik · hilang 24 jam";b.onclick=()=>{$("side").classList.remove("open");openStory()};box.appendChild(b)}
 if(groups.length){const h=document.createElement("div");h.className="sech";h.textContent="GRUP";box.appendChild(h)}
 for(const g of groups){const id="grp_"+g.id,b=document.createElement("button");b.className="ch"+(id===cur?" on":"");b.innerHTML='<div class="av"></div><div><b></b><small></small></div>';b.querySelector(".av").textContent="👥";b.querySelector("b").textContent=g.name;b.querySelector("small").textContent="Grup";b.onclick=()=>{cur=id;$("side").classList.remove("open");drawChs();subscribe()};box.appendChild(b)}
 if(friends.length){const h=document.createElement("div");h.className="sech";h.textContent="KONTAK";box.appendChild(h)}
 for(const f of friends){const id=dmId(f.code),b=document.createElement("button");b.className="ch"+(id===cur?" on":"");b.innerHTML='<div class="av"></div><div><b></b><small></small></div>';setAv(b.querySelector(".av"),f);b.querySelector("b").textContent=f.name||"Teman";b.querySelector("small").textContent="Chat pribadi";b.onclick=()=>{cur=id;$("side").classList.remove("open");drawChs();subscribe()};box.appendChild(b)}
 const c=CH.find(x=>x[0]===cur)||(()=>{const g=grpOf(cur);if(g)return["","👥",g.name,""];const f=friends.find(x=>dmId(x.code)===cur);return f?["",(f.name||"?").charAt(0).toUpperCase(),f.name||"Teman","",f.photo||""]:CH[0]})();{const av=$("chAv");av.style.backgroundImage=c[4]?"url("+c[4]+")":"";av.style.backgroundSize="cover";av.style.backgroundPosition="center";av.textContent=c[4]?"":c[1]}$("chName").textContent=c[2];stat();applyChannel()}
function setAv(el,f){const ph=f&&f.photo;el.style.backgroundImage=ph?"url("+ph+")":"";el.style.backgroundSize="cover";el.style.backgroundPosition="center";el.textContent=ph?"":((f&&f.name)||"?").charAt(0).toUpperCase()}
function mkThumb(src){return new Promise(res=>{const im=new Image();im.onload=()=>{try{const c=document.createElement("canvas");c.width=c.height=96;c.getContext("2d").drawImage(im,0,0,96,96);res(c.toDataURL("image/jpeg",.7))}catch(e){res("")}};im.onerror=()=>res("");im.src=src})}
function stat(){$("chStat").innerHTML=db?'<span class="dot"></span>Terhubung · dibagikan ke semua yang membuka halaman ini':'<span class="dot off"></span>Mode lokal · pesan tersimpan di perangkat ini'}
function render(){const L=$("list"),near=L.scrollHeight-L.scrollTop-L.clientHeight<120;L.textContent="";
 if(!msgs.length){const e=document.createElement("div");e.className="empty";e.textContent="Belum ada pesan di sini. Kirim pesan pertama atau tempel kode kamu!";L.appendChild(e)}
 for(const m of msgs){const own=isOwn(m),el=document.createElement("div");el.className="msg"+(own?" own":"");
  const w=document.createElement("div");w.className="who";w.style.color=own?"#ffd0d4":hue(m.name||"?");w.textContent=own?"Kamu":(m.name||"Tamu");el.appendChild(w);
  if(m.t==="code"){const c=document.createElement("div");c.className="code";const h=document.createElement("header");const s=document.createElement("span");s.textContent=m.lang||"Kode";const b=document.createElement("button");b.textContent="Salin";b.onclick=async()=>{try{await copyTxt(m.body);toast("Kode disalin")}catch(e){toast("Gagal menyalin")}};h.append(s,b);const p=document.createElement("pre"),cd=document.createElement("code");cd.textContent=m.body;p.appendChild(cd);c.append(h,p);el.appendChild(c)}
  else{const t=document.createElement("div");t.className="txt";t.textContent=m.body;el.appendChild(t)}
  if(cur==="bantuan"){const cb=document.createElement("button");cb.className="cpy";cb.textContent=m.t==="code"?"📋 Salin semua kode":"📋 Salin teks";cb.onclick=async()=>{try{await copyTxt(m.body);toast("Tersalin")}catch(e){toast("Gagal menyalin")}};el.appendChild(cb)}
  const mt=document.createElement("div");mt.className="meta";const d=new Date(m.ts||Date.now());mt.textContent=d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});el.appendChild(mt);
  if(own){const x=document.createElement("button");x.className="del";x.textContent="×";x.title="Hapus";x.onclick=()=>{if(x.dataset.arm){del(m)}else{x.dataset.arm="1";x.textContent="Hapus?";x.style.display="block";setTimeout(()=>{x.dataset.arm="";x.textContent="×";x.style.display=""},3000)}};el.appendChild(x)}
  {const sb=document.createElement("button"),on=isStar(m.id);sb.className="mstar"+(on?" on":"");sb.textContent=on?"★":"☆";sb.title="Berbintang";sb.setAttribute("aria-label","Bintangi pesan");
   sb.onclick=e=>{e.stopPropagation();if(!el.classList.contains("arm")){toast("Ketuk pesan 2 kali dulu, lalu tekan ⭐");return}toggleStar(m)};el.appendChild(sb);
   if(armedId===m.id)el.classList.add("arm");
   el.onclick=e=>{if(e.target.closest("button,a"))return;const n=Date.now();if(n-(el._t||0)<400){el._t=0;armMsg(el,m.id)}else el._t=n}}
  L.appendChild(el)}
 if(near||msgs.length<2)L.scrollTop=L.scrollHeight}
const MK="kmMsgs_",caches={};
let delIds=new Set();try{delIds=new Set(JSON.parse(store.get("kmDel")||"[]"))}catch(e){}
function saveDel(){store.set("kmDel",JSON.stringify([...delIds].slice(-5000)))}
function cacheOf(ch){if(!caches[ch]){const mp=new Map();try{for(const m of JSON.parse(store.get(MK+ch)||"[]")){if(m&&m.id&&!delIds.has(m.id))mp.set(m.id,m)}}catch(e){}caches[ch]=mp}return caches[ch]}
function cacheSave(ch){let a=[...cacheOf(ch).values()].sort((x,y)=>(x.ts||0)-(y.ts||0));for(let i=0;i<6;i++){try{localStorage.setItem(MK+ch,JSON.stringify(a));return}catch(e){a=a.slice(Math.ceil(a.length/4))}}}
function isOwn(m){return m.uid===uid||m.uid===localUid}
function view(ch){let a=[...cacheOf(ch).values()].sort((x,y)=>(x.ts||0)-(y.ts||0));if(ch==="umum")a=a.filter(m=>!kasar(m.body||""));else if(ch==="kode")a=a.filter(m=>m.t==="code");return a}
async function flush(ch){if(!db)return;const mp=cacheOf(ch);let chg=false;for(const m of [...mp.values()]){if(m.sent===false&&isOwn(m)){try{const {sent,...rest}=m;await db.collection("ch_"+ch).doc(m.id).set(rest);m.sent=true;chg=true}catch(e){break}}}if(chg){cacheSave(ch)}}
function subscribe(){if(unsub){unsub();unsub=null}const ch=cur;msgs=view(ch);render();$("list").scrollTop=$("list").scrollHeight;if(!db)return;flush(ch);
 try{unsub=db.collection("ch_"+ch).orderBy("ts","asc").onSnapshot(s=>{const mp=cacheOf(ch);let chg=false;
  for(const d of s.docs){const x={id:d.id,...d.data()};if(delIds.has(x.id))continue;const o=mp.get(x.id);if(!o||!o.sent){x.sent=true;mp.set(x.id,x);chg=true}
   if(ch==="umum"&&kasar(x.body||"")&&!purged.has(x.id)){purged.add(x.id);try{db.collection("ch_umum").doc(x.id).delete().catch(()=>{})}catch(e){}}}
  if(chg)cacheSave(ch);
  if(ch===cur){msgs=view(ch);render()}},e=>toast("Gagal memuat pesan"))}catch(e){toast("Gagal memuat pesan")}}
async function del(m){const ch=cur;delIds.add(m.id);saveDel();cacheOf(ch).delete(m.id);cacheSave(ch);msgs=view(ch);render();if(db){try{await db.collection("ch_"+ch).doc(m.id).delete()}catch(e){toast("Tidak bisa menghapus di server")}}}
async function send(){const ta=$("ta"),body=ta.value.replace(/\s+$/,"");if(!body.trim()||checking)return;
 {const g=grpOf(cur);if(g&&g.perms.send==="admin"&&!isAdmin(g)){chk("bad","⚠️ Di grup ini hanya admin yang boleh mengirim pesan baru.");return}}
 if(cur==="umum"&&kasar(body)){chk("bad","⚠️ Pesan mengandung kata kasar, jadi tidak dikirim. Chat Umum harus tetap sopan. Coba ubah kalimatmu, atau pindah ke channel Santai.");return}
 if(cur==="kode"&&(mode!=="code"||$("lang").value==="Teks biasa")){chk("bad","⚠️ Coba lagi, pesan ini hanya untuk mengirim kode saja. Pilih mode Kode dan bahasanya, lalu tempel kodenya.");return}
 if(mode==="code"&&$("lang").value!=="Teks biasa"&&!(await verify(body,$("lang").value)))return;
 const id=Date.now()+"-"+Math.random().toString(36).slice(2,7),m={id,t:mode,lang:mode==="code"?$("lang").value:"",body,name,uid,ts:Date.now(),sent:false};ta.value="";fit();
 const ch=cur;cacheOf(ch).set(id,m);cacheSave(ch);msgs=view(ch);render();$("list").scrollTop=$("list").scrollHeight;
 if(db){const {sent,...rest}=m;try{await db.collection("ch_"+ch).doc(id).set(rest);m.sent=true;cacheSave(ch)}catch(e){toast("Pesan tersimpan di perangkat, tapi belum terkirim ke server. Akan dicoba lagi otomatis.")}}}
let checking=false;
function chk(c,t){const e=$("chk");e.className="chk "+c;e.textContent=t}
function chkOff(){$("chk").className="chk hide"}
function detect(code,lang){
 const R=re=>{const m=code.match(re);return m?m.length:0},t=code.trim();
 let json=false;try{JSON.parse(t);json=/^[\[{]/.test(t)}catch(e){}
 const S={
  "Python":2*R(/^\s*def\s+\w+\s*\(.*\)\s*(->.*)?:/gm)+2*R(/^\s*(import\s+\w+|from\s+[\w.]+\s+import\s)/gm)+2*R(/\bprint\s*\(/g)+R(/^\s*(if|elif|else|for|while|class|try|except|finally|with)\b[^{};]*:\s*$/gm)+R(/\b(self|None|True|False|elif|lambda)\b/g)+R(/\b(input|range|len)\s*\(/g)-2*R(/;\s*$/gm),
  "JavaScript":2*R(/\b(const|let|var)\s+[\w$]+/g)+2*R(/=>/g)+2*R(/\bfunction\s*[\w$]*\s*\(/g)+2*R(/\bconsole\.\w+\(/g)+2*R(/\b(document|window)\./g)+R(/===|!==/g)+2*R(/\brequire\(|\bexport\s+(default|const|function)\b/g)+R(/\b(async|await)\b/g),
  "HTML":R(/<\/?(html|head|body|div|span|p|a|h[1-6]|ul|ol|li|img|br|hr|table|tr|td|th|form|input|button|label|section|header|footer|nav|main|script|style|link|meta|title|textarea|select|option|canvas|svg|video|audio|iframe|b|i|strong|em)(?=[\s\/>])[^<>]*>/gi)+3*R(/<!doctype html/gi),
  "CSS":2*R(/[\w\-.#:>+~*,][\w\-.#:>+~*,\s]*\{\s*[\w-]+\s*:[^{}]*\}/g)+R(/^\s*[\w-]+\s*:\s*[^;{}\n]+;\s*$/gm)+2*R(/@(media|import|keyframes|font-face)\b/g),
  "PHP":4*R(/<\?php/g)+R(/\$[a-zA-Z_]\w*/g)+2*R(/\becho\b[^;\n]*;/g)+R(/->\w+/g)+R(/::\w+/g)+R(/\barray\s*\(/g),
  "Java":3*R(/\b(public|private|protected)\s+(static\s+)?(final\s+)?(class|void|int|String|boolean|double)\b/g)+3*R(/System\.out\.print(ln)?\(/g)+2*R(/\bString\[\]\s+args/g)+2*R(/^\s*import\s+javax?\./gm)+R(/\b(int|double|boolean|String|long|float|char)\s+\w+\s*(=|;|\()/g)+R(/\bnew\s+[A-Z]\w*\(/g),
  "C++":4*R(/#include\s*[<"]/g)+3*R(/\bstd::/g)+3*R(/\b(cout|cin)\s*(<<|>>)/g)+3*R(/\bint\s+main\s*\(/g)+2*R(/using\s+namespace\s+std/g)+R(/\b(int|double|float|char|bool|long|string)\s+\w+\s*(=|;|\()/g),
  "SQL":3*R(/\bselect\s+(\*|[\w.,\s`]+)\s+from\s+\w+/gi)+3*R(/\binsert\s+into\b/gi)+3*R(/\bupdate\s+\w+\s+set\b/gi)+3*R(/\bdelete\s+from\b/gi)+3*R(/\b(create|alter|drop)\s+(table|database|index|view)\b/gi)+R(/\b(where|join|group by|order by|values)\b/gi),
  "Bash":4*R(/^#!\/bin\/(ba)?sh/gm)+2*R(/^\s*(sudo|apt|apt-get|cd|ls|chmod|chown|mkdir|rm|cp|mv|grep|curl|wget|git|npm|pip|echo|cat|touch)\b(?!\s*[=(.,:\[])/gm)+2*R(/^\s*export\s+\w+=/gm)+2*R(/\$\(/g)+R(/^\s*(fi|done|esac)\s*$/gm)+R(/\bthen\s*$/gm),
  "JSON":json?5:0
 };
 for(const k in S)S[k]=Math.max(0,S[k]);
 const sel=S[lang]||0;let best="",bs=0;for(const k in S)if(k!==lang&&S[k]>bs){best=k;bs=S[k]}
 const top=Math.max(sel,bs);
 if(lang==="JSON"?json:((sel>=2&&sel>=top*0.6)||(sel>=1&&sel>=top)))return{ok:true};
 if(best&&bs>=2)return{msg:"Terdeteksi kode "+best+", tapi kamu memilih "+lang+"."};
 return{msg:lang==="JSON"?"Format JSON tidak valid.":"Teks ini tidak terlihat seperti kode "+lang+"."}}
async function verify(code,lang){checking=true;$("send").disabled=true;chk("load","⏳ Memeriksa apakah ini benar-benar kode "+lang+"...");
 await new Promise(r=>setTimeout(r,800));checking=false;$("send").disabled=false;
 const r=detect(code,lang);if(r.ok){chkOff();return true}
 chk("bad","⚠️ "+r.msg+" Masukkan kode dengan benar."+(cur==="kode"?" Chat Kode hanya untuk mengirim kode.":""));return false}
function fit(){const t=$("ta");t.style.height="auto";t.style.height=Math.min(t.scrollHeight,200)+"px"}
function setMode(m){mode=m;chkOff();$("mT").classList.toggle("on",m==="text");$("mC").classList.toggle("on",m==="code");$("lang").classList.toggle("hide",m!=="code");$("ta").classList.toggle("mono",m==="code");$("ta").placeholder=m==="code"?"Tempel kode di sini...":"Ketik pesan...";$("hint").textContent=m==="code"?"Enter = baris baru, Ctrl+Enter = kirim":"Enter = kirim, Shift+Enter = baris baru"}
function setView(v){const reg=!store.get("kmPw");["vAuth","vCode","vRec"].forEach(i=>$(i).classList.toggle("hide",i!==v));
 $("dTitle").textContent=v==="vCode"?"Verifikasi lupa sandi":v==="vRec"?"Data akunmu":reg?"Buat akun WhatsApp Code":"Masuk ke WhatsApp Code";
 $("dSub").textContent=v==="vCode"?"Masukkan kode verifikasi untuk melihat nama dan sandi yang tersimpan di browser ini.":v==="vRec"?"Kamu bisa mengganti sandi. Tekan Simpan, lalu masuk kembali.":reg?"Pilih nama panggilan dan kata sandi. Keduanya disimpan di browser ini.":"Masukkan nama dan kata sandi yang kamu buat sebelumnya.";
 $("nameOk").textContent=reg?"Daftar & Masuk":"Masuk";$("forgot").classList.toggle("hide",reg)}
function showAuth(){$("nameOv").classList.remove("hide");$("nameIn").value=store.get("kmName")||"";$("pwIn").value="";$("pwIn").type="password";$("eye").textContent="👁️";setView("vAuth");$("nameIn").focus()}
let named=false;function setName(n){name=n;named=true;store.set("kmName",n);$("meName").textContent=n;if(db)registerMe()}
$("nameOk").onclick=()=>{const n=$("nameIn").value.trim(),p=$("pwIn").value,sp=store.get("kmPw");
 if(!n){toast("Nama tidak boleh kosong");return}if(!p){toast("Kata sandi tidak boleh kosong");return}
 if(sp===null){store.set("kmPw",p)}else if(n!==store.get("kmName")||p!==sp){toast("Nama atau kata sandi salah");return}
 setName(n);$("nameOv").classList.add("hide")};
$("forgot").onclick=()=>{$("codeIn").value="";setView("vCode");$("codeIn").focus()};
$("back1").onclick=()=>setView("vAuth");
$("codeOk").onclick=()=>{if($("codeIn").value.trim()!=="210002"){toast("Kode salah");return}
 $("recName").textContent=store.get("kmName")||"(belum ada)";$("recPw").textContent=store.get("kmPw")||"(belum ada)";$("newPw").value="";setView("vRec")};
$("pwSave").onclick=()=>{const v=$("newPw").value;if(v){store.set("kmPw",v);toast("Sandi baru disimpan")}showAuth()};
$("eye").onclick=()=>{const p=$("pwIn"),show=p.type==="password";p.type=show?"text":"password";$("eye").textContent=show?"🙈":"👁️";$("eye").setAttribute("aria-label",show?"Sembunyikan sandi":"Tampilkan sandi");p.focus()};
$("pwIn").onkeydown=e=>{if(e.key==="Enter")$("nameOk").click()};$("codeIn").onkeydown=e=>{if(e.key==="Enter")$("codeOk").click()};$("newPw").onkeydown=e=>{if(e.key==="Enter")$("pwSave").click()};
$("nameIn").onkeydown=e=>{if(e.key==="Enter")$("nameOk").click()};
$("rename").onclick=()=>{$("side").classList.remove("open");showAuth()};
const PK={name:"kmName",about:"kmAbout",user:"kmUser",pw:"kmPw",link:"kmLink",code:"kmCode"};
const PROWS=[["name","👤","Nama","Nama kamu"],["about","ℹ️","Tentang","Halo! Aku pakai WhatsApp Code"],["user","@","Nama pengguna","Tambah nama pengguna"],["pw","🔑","Kata sandi","Kata sandi"],["link","🔗","Tautan","Tambah tautan"],["code","🆔","Kode teman (tekan untuk menyalin)",""]];
let pwShow=false,editing="";
function pVal(k){return store.get(PK[k])||""}
function drawMe(){const p=store.get("kmPhoto"),a=$("meAv");a.style.backgroundImage=p?"url("+p+")":"";a.textContent=p?"":"👤"}
function drawProf(){
 const p=store.get("kmPhoto"),im=$("pImg");
 if(p){im.src=p;im.classList.remove("hide");$("pIni").textContent=""}else{im.classList.add("hide");$("pIni").textContent=(pVal("name")||"?").charAt(0).toUpperCase()}
 const box=$("pRows");box.textContent="";
 for(const [k,ic,label,ph] of PROWS){
  const r=document.createElement("div");r.className="prow";const i=document.createElement("i");i.textContent=ic;
  const c=document.createElement("div");c.className="pc";const b=document.createElement("b");b.textContent=label;c.appendChild(b);r.append(i,c);
  if(editing===k){
   const inp=document.createElement("input");inp.value=pVal(k);inp.maxLength=k==="name"?24:k==="about"?120:64;inp.placeholder=ph;
   const acts=document.createElement("div");acts.className="acts";const ok=document.createElement("button");ok.className="ok";ok.textContent="Simpan";const no=document.createElement("button");no.textContent="Batal";acts.append(ok,no);
   const save=()=>{const v=inp.value.trim();if((k==="name"||k==="pw")&&!v){toast(k==="name"?"Nama tidak boleh kosong":"Kata sandi tidak boleh kosong");return}if(k==="name")setName(v);else store.set(PK[k],v);editing="";drawProf();toast("Tersimpan")};
   ok.onclick=e=>{e.stopPropagation();save()};no.onclick=e=>{e.stopPropagation();editing="";drawProf()};
   inp.onclick=e=>e.stopPropagation();inp.onkeydown=e=>{if(e.key==="Enter")save();if(e.key==="Escape"){editing="";drawProf()}};
   c.append(inp,acts);setTimeout(()=>inp.focus(),0)
  }else{
   const v=document.createElement("div");v.className="v";const val=pVal(k);
   if(k==="pw")v.textContent=pwShow?val:"•".repeat(Math.min(val.length,24));else if(val)v.textContent=val;else{v.textContent=ph;v.classList.add("ph")}
   c.appendChild(v);
   if(k==="pw"){const e2=document.createElement("button");e2.className="eye2";e2.textContent=pwShow?"🙈":"👁️";e2.onclick=ev=>{ev.stopPropagation();pwShow=!pwShow;drawProf()};r.appendChild(e2)}
   r.onclick=k==="code"?()=>copyCode():()=>{editing=k;drawProf()}
  }
  box.appendChild(r)}}
function openProf(){$("side").classList.remove("open");editing="";pwShow=false;drawProf();$("prof").classList.remove("hide")}
$("kebab").onclick=e=>{e.stopPropagation();$("pop").classList.toggle("hide")};
document.addEventListener("click",()=>$("pop").classList.add("hide"));
$("pop").onclick=e=>{const a=e.target.closest("button");if(!a)return;$("pop").classList.add("hide");if(a.dataset.a==="set")openProf();else if(a.dataset.a==="teman")openFriend();else if(a.dataset.a==="grup")openGroup();else if(a.dataset.a==="siar")openSholat();else if(a.dataset.a==="perangkat")openLink();else if(a.dataset.a==="bintang")openStar();else toast("Fitur ini belum tersedia")};
$("pBack").onclick=()=>$("prof").classList.add("hide");
let friends=[];try{friends=JSON.parse(store.get("kmFriends")||"[]")}catch(e){}
function saveFriends(){store.set("kmFriends",JSON.stringify(friends))}
let groups=[];try{groups=JSON.parse(store.get("kmGroups")||"[]")}catch(e){}
function saveGroups(){store.set("kmGroups",JSON.stringify(groups))}
const DEFP={add:"all",invite:"admin",appr:"off",send:"all",edit:"all"};
function grpOf(id){return groups.find(g=>"grp_"+g.id===id)}
function isGrp(){return !!grpOf(cur)}
function isAdmin(g){return g.owner===myCode()}
function grpRule(){const g=grpOf(cur);return "👥 Grup "+g.name+" · Kirim pesan: "+(g.perms.send==="admin"?"hanya admin":"semua orang")+". Ketuk ⚙️ untuk melihat izin grup."}
const PSEC=[["Bergabung ke grup",[["add","👤","Tambah anggota baru"],["invite","🔗","Bagikan undangan grup"],["appr","⏳","Memerlukan persetujuan admin"]]],["Pengiriman pesan",[["send","💬","Kirim pesan baru"]]],["Mengelola grup",[["edit","✏️","Edit pengaturan grup"]]]];
function pLabel(k,v){return k==="appr"?(v==="on"?"Aktif":"Nonaktif"):(v==="admin"?"Hanya admin":"Semua orang")}
let pTarget=null,pCan=false,pDone=null;
function drawPerm(){const box=$("gpRows");box.textContent="";
 for(const [title,rows] of PSEC){const h=document.createElement("div");h.className="sech";h.textContent=title;box.appendChild(h);
  for(const [k,ic,label] of rows){const r=document.createElement("div");r.className="prow";const i=document.createElement("i");i.textContent=ic;const c=document.createElement("div");c.className="pc";const b=document.createElement("b");b.textContent=label;const v=document.createElement("div");v.className="v";v.textContent=pLabel(k,pTarget[k]);c.append(b,v);r.append(i,c);
   r.onclick=()=>{if(!pCan){toast("Hanya admin yang bisa mengubah izin");return}pTarget[k]=k==="appr"?(pTarget[k]==="on"?"off":"on"):(pTarget[k]==="admin"?"all":"admin");if(pDone)pDone();drawPerm()};
   box.appendChild(r)}}}
function openPerm(perms,can,done){pTarget=perms;pCan=can;pDone=done;drawPerm();$("gperm").classList.remove("hide")}
$("gpBack").onclick=()=>{$("gperm").classList.add("hide");sumPerm()};
$("gSet").onclick=()=>{const g=grpOf(cur);if(!g)return;openPerm(g.perms,isAdmin(g)||g.perms.edit==="all",()=>{g.ts=Date.now();saveGroups();pushGroup(g);drawChs()})};
let dPerms={...DEFP},dMem=new Set();
function sumPerm(){$("grSum").textContent=(dPerms.send==="admin"?"Kirim: admin":"Kirim: semua")+" ›"}
function openGroup(){$("side").classList.remove("open");dPerms={...DEFP};dMem=new Set();$("grName").value="";$("grMsg").className="chk bad hide";sumPerm();
 const box=$("grMem");box.textContent="";
 if(!friends.length){const e=document.createElement("div");e.className="gl";e.style.padding="10px 0";e.textContent="Belum ada kontak. Kamu bisa membuat grup dulu, lalu menambah teman lewat menu Tambah teman.";box.appendChild(e)}
 for(const f of friends){const l=document.createElement("label");l.className="mem";const c=document.createElement("input");c.type="checkbox";c.onchange=()=>{c.checked?dMem.add(f.code):dMem.delete(f.code)};const t=document.createElement("span");t.textContent=f.name||"Teman";l.append(c,t);box.appendChild(l)}
 $("grOv").classList.remove("hide");$("grName").focus()}
function pushGroup(g){if(!db)return;for(const code of g.members||[]){if(code===myCode())continue;try{db.collection("inbox_"+code).doc("g_"+g.id).set({grp:g,ts:Date.now()}).catch(()=>{})}catch(e){}}}
function createGroup(){const gn=$("grName").value.trim(),m=$("grMsg");
 if(!gn){m.textContent="⚠️ Nama grup tidak boleh kosong.";m.classList.remove("hide");return}
 if(kasar(gn)){m.textContent="⚠️ Nama grup mengandung kata kasar. Ganti namanya.";m.classList.remove("hide");return}
 const g={id:newCode(),name:gn,perms:{...dPerms},owner:myCode(),ownerName:name,members:[myCode(),...dMem],ts:Date.now()};
 groups.push(g);saveGroups();$("grOv").classList.add("hide");cur="grp_"+g.id;drawChs();subscribe();pushGroup(g);
 toast(db?"Grup dibuat":"Grup dibuat (mode lokal, anggota belum bisa melihat)")}
$("grGear").onclick=()=>openPerm(dPerms,true,null);
$("grOk").onclick=createGroup;$("grClose").onclick=()=>$("grOv").classList.add("hide");$("grName").onkeydown=e=>{if(e.key==="Enter")createGroup()};
function myCode(){return store.get("kmCode")||""}
function newCode(){const a="abcdefghijklmnopqrstuvwxyz0123456789",r=new Uint32Array(8);crypto.getRandomValues(r);let s="";for(const n of r)s+=a[n%36];return s}
if(!myCode())store.set("kmCode",newCode());
function dmId(code){return "dm_"+[myCode(),code].sort().join("_")}
function dmName(){const f=friends.find(x=>dmId(x.code)===cur);return f?f.name:""}
function copyCode(){copyTxt(myCode()).then(()=>toast("Kode disalin"),()=>toast("Gagal menyalin"))}
let inboxUnsub=null,watchedCode="";
function watchInbox(){try{inboxUnsub=db.collection("inbox_"+myCode()).onSnapshot(s=>{let ch=false;for(const d of s.docs){const f=d.data();if(f&&f.grp&&f.grp.id){const x=f.grp,ex=groups.find(q=>q.id===x.id);if(!ex){groups.push({...x});ch=true;toast("Kamu ditambahkan ke grup "+x.name)}else if((x.ts||0)>(ex.ts||0)){Object.assign(ex,x);ch=true}continue}if(f&&f.code&&f.code!==myCode()){const ex=friends.find(x=>x.code===f.code);if(!ex){friends.push({code:f.code,name:f.name||"Teman",photo:f.photo||""});ch=true;toast((f.name||"Teman")+" menambahkanmu sebagai teman")}else if((f.name&&ex.name!==f.name)||(f.photo||"")!==(ex.photo||"")){if(f.name)ex.name=f.name;ex.photo=f.photo||"";ch=true}}}if(ch){saveFriends();saveGroups();drawChs()}},()=>{})}catch(e){}}
function pushProfile(th){if(!db)return;for(const f of friends){try{db.collection("inbox_"+f.code).doc(myCode()).set({code:myCode(),name,photo:th||store.get("kmThumb")||"",ts:Date.now()}).catch(()=>{})}catch(e){}}}
async function registerMe(){if(!db||!named)return;try{
 let code=myCode();const ref=()=>db.collection("users").doc(code);let s=await ref().get();
 while(s.exists&&s.data().uid!==uid){code=newCode();store.set("kmCode",code);s=await ref().get()}
 let th=store.get("kmThumb")||"";if(!th&&store.get("kmPhoto")){th=await mkThumb(store.get("kmPhoto"));if(th)store.set("kmThumb",th)}
 await ref().set({code,name,uid,photo:th,ts:Date.now()});pushProfile(th);
 if(watchedCode!==code){if(inboxUnsub)inboxUnsub();watchedCode=code;watchInbox()}
 if(!$("prof").classList.contains("hide"))drawProf()}catch(e){}}
function openFriend(){$("side").classList.remove("open");$("myCode").textContent=myCode();$("frIn").value="";$("frMsg").className="chk hide";$("frOv").classList.remove("hide");$("frIn").focus()}
function frMsg(c,t){const e=$("frMsg");e.className="chk "+c;e.textContent=t}
let frBusy=false;
async function addFriend(){if(frBusy)return;const code=$("frIn").value.trim().toLowerCase();
 if(!/^[a-z0-9]{8}$/.test(code)){frMsg("bad","⚠️ Kode harus 8 karakter huruf/angka, contoh: dik34h82.");return}
 if(code===myCode()){frMsg("bad","⚠️ Itu kodemu sendiri. Berikan kode ini ke temanmu, lalu masukkan kode milik temanmu di sini.");return}
 if(friends.some(f=>f.code===code)){frMsg("bad","ℹ️ Dia sudah ada di kontakmu.");return}
 if(!db){frMsg("bad","⚠️ Server belum terhubung, jadi kode belum bisa diperiksa.");return}
 frBusy=true;$("frOk").disabled=true;frMsg("load","⏳ Server sedang menganalisis kode verifikasi...");
 try{await new Promise(r=>setTimeout(r,900));const s=await db.collection("users").doc(code).get();
  if(!s.exists){frMsg("bad","❌ Kode salah atau tidak ditemukan. Periksa lagi kode temanmu.")}
  else{const f=s.data();friends.push({code,name:f.name||"Teman",photo:f.photo||""});saveFriends();
   try{await db.collection("inbox_"+code).doc(myCode()).set({code:myCode(),name,photo:store.get("kmThumb")||"",ts:Date.now()})}catch(e){}
   frMsg("ok","✅ Kode benar! "+(f.name||"Teman")+" sekarang ada di daftar KONTAK, paling bawah di sidebar.");drawChs();$("frIn").value=""}
 }catch(e){frMsg("bad","⚠️ Gagal memeriksa kode. Coba lagi.")}
 frBusy=false;$("frOk").disabled=false}
$("frOk").onclick=addFriend;$("frIn").onkeydown=e=>{if(e.key==="Enter")addFriend()};$("frClose").onclick=()=>$("frOv").classList.add("hide");$("cpCode").onclick=copyCode;
$("pOut").onclick=()=>{$("prof").classList.add("hide");showAuth()};
$("pCam").onclick=()=>$("pFile").click();
$("pFile").onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d"),s=Math.min(im.width,im.height);x.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,256,256);const full=c.toDataURL("image/jpeg",.8);store.set("kmPhoto",full);mkThumb(full).then(t=>{store.set("kmThumb",t);if(db)registerMe()});drawProf();drawMe();toast("Foto diperbarui")};im.onerror=()=>toast("Gambar tidak valid");im.src=rd.result};rd.readAsDataURL(f);e.target.value=""};$("menu").onclick=()=>$("side").classList.toggle("open");
$("mT").onclick=()=>setMode("text");$("mC").onclick=()=>setMode("code");$("send").onclick=send;
$("ta").oninput=()=>{fit();if(!checking)chkOff()};$("lang").onchange=chkOff;
$("ta").onkeydown=e=>{if(e.key!=="Enter")return;if(mode==="code"){if(e.ctrlKey||e.metaKey){e.preventDefault();send()}}else if(!e.shiftKey){e.preventDefault();send()}};

const CTRY=[
["ID","Indonesia",20,["Jakarta","Bandung","Surabaya","Semarang","Yogyakarta","Medan","Makassar","Palembang","Denpasar","Banda Aceh","Lhokseumawe","Pematangsiantar","Padang","Bukittinggi","Pekanbaru","Dumai","Batam","Tanjung Pinang","Jambi","Bengkulu","Bandar Lampung","Pangkal Pinang","Bogor","Depok","Bekasi","Tangerang","Serang","Cirebon","Tasikmalaya","Sukabumi","Garut","Surakarta","Magelang","Pekalongan","Tegal","Purwokerto","Kudus","Malang","Kediri","Madiun","Jember","Banyuwangi","Probolinggo","Sidoarjo","Gresik","Mataram","Kupang","Pontianak","Palangka Raya","Banjarmasin","Balikpapan","Samarinda","Tarakan","Manado","Gorontalo","Palu","Parepare","Kendari","Mamuju","Ambon","Ternate","Jayapura","Sorong","Manokwari","Merauke"]],
["MY","Malaysia",17,["Kuala Lumpur","George Town","Johor Bahru","Ipoh","Kota Kinabalu","Kuching","Malacca","Shah Alam","Kuantan","Kota Bharu"]],
["SG","Singapura",11,["Singapore"]],
["BN","Brunei",3,["Bandar Seri Begawan"]],
["TH","Thailand",3,["Bangkok","Pattani","Yala","Chiang Mai","Phuket"]],
["PH","Filipina",3,["Manila","Marawi","Davao","Cotabato"]],
["SA","Arab Saudi",4,["Mecca","Medina","Riyadh","Jeddah","Dammam","Taif","Tabuk","Abha"]],
["AE","Uni Emirat Arab",16,["Dubai","Abu Dhabi","Sharjah","Al Ain"]],
["QA","Qatar",10,["Doha"]],
["KW","Kuwait",9,["Kuwait City"]],
["BH","Bahrain",8,["Manama"]],
["OM","Oman",8,["Muscat"]],
["YE","Yaman",3,["Sanaa","Aden"]],
["JO","Yordania",23,["Amman"]],
["LB","Lebanon",3,["Beirut"]],
["SY","Suriah",3,["Damascus"]],
["IQ","Irak",3,["Baghdad","Basra","Najaf","Karbala"]],
["IR","Iran",7,["Tehran","Mashhad","Isfahan","Shiraz","Qom"]],
["PS","Palestina",3,["Jerusalem","Gaza","Hebron","Ramallah"]],
["TR","Turki",13,["Istanbul","Ankara","Izmir","Bursa","Konya"]],
["EG","Mesir",5,["Cairo","Alexandria","Giza","Aswan"]],
["MA","Maroko",21,["Casablanca","Rabat","Marrakesh","Fes"]],
["DZ","Aljazair",19,["Algiers","Oran","Constantine"]],
["TN","Tunisia",18,["Tunis","Sfax"]],
["LY","Libya",3,["Tripoli","Benghazi"]],
["SD","Sudan",3,["Khartoum"]],
["SO","Somalia",3,["Mogadishu"]],
["ET","Ethiopia",3,["Addis Ababa"]],
["KE","Kenya",3,["Nairobi","Mombasa"]],
["NG","Nigeria",3,["Lagos","Kano","Abuja"]],
["ZA","Afrika Selatan",3,["Johannesburg","Cape Town","Durban"]],
["PK","Pakistan",1,["Karachi","Lahore","Islamabad","Peshawar","Quetta"]],
["IN","India",1,["Delhi","Mumbai","Hyderabad","Kolkata","Chennai"]],
["BD","Bangladesh",1,["Dhaka","Chittagong"]],
["AF","Afghanistan",1,["Kabul"]],
["UZ","Uzbekistan",3,["Tashkent","Samarkand"]],
["KZ","Kazakhstan",3,["Almaty","Astana"]],
["RU","Rusia",14,["Moscow","Kazan","Grozny"]],
["CN","Tiongkok",3,["Beijing","Shanghai","Urumqi"]],
["JP","Jepang",3,["Tokyo","Osaka"]],
["KR","Korea Selatan",3,["Seoul"]],
["AU","Australia",3,["Sydney","Melbourne","Perth","Brisbane"]],
["GB","Inggris Raya",3,["London","Birmingham","Manchester","Glasgow"]],
["FR","Prancis",12,["Paris","Marseille","Lyon"]],
["DE","Jerman",3,["Berlin","Munich","Hamburg","Cologne"]],
["NL","Belanda",3,["Amsterdam","Rotterdam"]],
["US","Amerika Serikat",2,["New York","Los Angeles","Chicago","Houston","Washington"]],
["CA","Kanada",2,["Toronto","Montreal","Vancouver"]]
];
const MNAME={20:"KEMENAG (Kementerian Agama RI)",17:"JAKIM (Malaysia)",11:"MUIS (Singapura)",4:"Umm al-Qura (Makkah)",3:"Muslim World League",2:"ISNA (Amerika Utara)",5:"Egyptian General Authority",13:"Diyanet (Turki)",1:"Univ. Ilmu Islam Karachi",7:"Univ. Teheran",8:"Wilayah Teluk",9:"Kuwait",10:"Qatar",12:"UOIF (Prancis)",14:"Spiritual Administration of Muslims of Russia",16:"Dubai",18:"Tunisia",19:"Aljazair",21:"Maroko",23:"Yordania"};
const ORD=[["Fajr","Subuh","✨"],["Dhuhr","Zuhur","☀️"],["Asr","Ashar","🌤️"],["Maghrib","Maghrib","🌇"],["Isha","Isya","🌙"]];
let sh={cc:"ID",city:"Jakarta",res:null,loading:false,err:"",h24:store.get("kmH24")==="1"};
try{const sv=JSON.parse(store.get("kmSholat")||"null");if(sv&&sv.cc&&sv.city){sh.cc=sv.cc;sh.city=sv.city}}catch(e){}
function ctry(cc){return CTRY.find(c=>c[0]===cc)||CTRY[0]}
function tzNow(tz){const pad=n=>String(n).padStart(2,"0");
 try{const f=new Intl.DateTimeFormat("en-GB",{timeZone:tz||undefined,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}),o={};for(const p of f.formatToParts(new Date()))o[p.type]=p.value;return{min:(+o.hour%24)*60+(+o.minute)+(+o.second)/60,dmY:o.day+"-"+o.month+"-"+o.year}}
 catch(e){const d=new Date();return{min:d.getHours()*60+d.getMinutes(),dmY:pad(d.getDate())+"-"+pad(d.getMonth()+1)+"-"+d.getFullYear()}}}
function hm(t){const m=/(\d{1,2}):(\d{2})/.exec(t||"");return m?(+m[1])*60+(+m[2]):null}
function fmtT(t){const v=hm(t);if(v==null)return"--:--";const h=Math.floor(v/60)%24,m=v%60,pad=n=>String(n).padStart(2,"0");return sh.h24?pad(h)+":"+pad(m):((h%12)||12)+":"+pad(m)+(h<12?"am":"pm")}
function fmtLeft(l){l=Math.max(0,Math.round(l));const h=Math.floor(l/60),m=l%60;return h?h+"j "+m+"m":m+"m"}
async function getJson(url){const c=new AbortController(),t=setTimeout(()=>c.abort(),15000);try{const r=await fetch(url,{signal:c.signal});return await r.json()}finally{clearTimeout(t)}}
let shSeq=0;
async function loadSholat(){const my=++shSeq,cc=sh.cc,city=sh.city,c=ctry(cc);sh.loading=true;sh.err="";drawSholat();
 const base="https://api.aladhan.com/v1/timingsByCity",q="city="+encodeURIComponent(city)+"&country="+encodeURIComponent(cc)+"&method="+c[2];
 try{let j=await getJson(base+"?"+q);if(!j||j.code!==200||!j.data||!j.data.timings)throw new Error("NF");
  const tz=(j.data.meta&&j.data.meta.timezone)||"",cd=tzNow(tz).dmY;
  if(j.data.date&&j.data.date.gregorian&&j.data.date.gregorian.date!==cd){try{const j2=await getJson(base+"/"+cd+"?"+q);if(j2&&j2.code===200&&j2.data&&j2.data.timings)j=j2}catch(e){}}
  if(my!==shSeq)return;
  sh.res={cc,city,d:j.data,tz,date:(j.data.date&&j.data.date.gregorian&&j.data.date.gregorian.date)||cd};
  store.set("kmSholat",JSON.stringify({cc,city}));store.set("kmSholatCache_"+cc+"_"+city,JSON.stringify(sh.res))
 }catch(e){if(my!==shSeq)return;let cached=null;try{cached=JSON.parse(store.get("kmSholatCache_"+cc+"_"+city)||"null")}catch(x){}
  if(cached&&e.message!=="NF"){sh.res=cached;sh.err="Tidak bisa terhubung ke server. Menampilkan jadwal tersimpan terakhir."}
  else{sh.res=null;sh.err=e.message==="NF"?'Kota "'+city+'" tidak ditemukan di '+c[1]+". Coba nama kota lain.":(e.name==="AbortError"?"Server terlalu lama merespons.":"Gagal mengambil jadwal. Periksa internet, lalu coba lagi.")}}
 if(my===shSeq){sh.loading=false;drawSholat()}}
function mk(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function drawSholat(){const B=$("shBody");B.textContent="";const c=ctry(sh.cc),r=sh.res;$("shFmt").textContent=sh.h24?"12j":"24j";
 const top=mk("div","sht"),L=mk("div"),R=mk("div","shr");L.append(mk("small","l","Waktu Salat di"),mk("h1","",sh.city),mk("div","ct",c[1]));top.append(L,R);
 if(r&&!sh.loading){const D=r.d,H=D.date&&D.date.hijri;let ds="";try{ds=new Intl.DateTimeFormat("id-ID",{timeZone:r.tz||undefined,weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date())}catch(e){ds=D.date.readable||""}
  R.appendChild(mk("div","shd",ds+(H?" | "+H.day+" "+(H.month&&H.month.en)+" "+H.year:"")));
  const mid=D.meta&&D.meta.method&&D.meta.method.id,b=mk("div","badge");b.append(mk("i","","✓"),mk("span","",MNAME[mid]||(D.meta&&D.meta.method&&D.meta.method.name)||"Metode resmi"));R.appendChild(b);
  R.appendChild(mk("div","pill","Imsak "+fmtT(D.timings.Imsak)+" | Iftar "+fmtT(D.timings.Maghrib)))}
 B.appendChild(top);
 const ctl=mk("div","shctl"),b1=mk("button","pk"),b2=mk("button","pk"),b3=mk("button","pk rf","🔄");
 b1.append(mk("small","","🌍 Negara"),mk("span","",c[1]+" ▾"));b2.append(mk("small","","📍 Kota"),mk("span","",sh.city+" ▾"));b3.title="Muat ulang";b3.setAttribute("aria-label","Muat ulang");
 b1.onclick=()=>openPick("c");b2.onclick=()=>openPick("k");b3.onclick=()=>loadSholat();ctl.append(b1,b2,b3);B.appendChild(ctl);
 if(sh.loading){const l=mk("div","shld");l.append(mk("div","spin"),mk("div","","Mencari jadwal salat "+sh.city+", "+c[1]+"..."));B.appendChild(l);const g=mk("div","pgrid");for(let i=0;i<5;i++)g.appendChild(mk("div","sk"));B.appendChild(g);return}
 if(sh.err){const e=mk("div","sherr");e.append(mk("span","",(r?"⚠️ ":"❌ ")+sh.err));const rb=mk("button","","Coba lagi");rb.onclick=()=>loadSholat();e.appendChild(rb);B.appendChild(e)}
 if(!r)return;
 const T=r.d.timings,now=tzNow(r.tz).min,mins=ORD.map(o=>hm(T[o[0]]));let cur=-1;for(let i=0;i<5;i++)if(mins[i]!=null&&mins[i]<=now)cur=i;
 let nx,left;if(cur===-1){nx=0;left=mins[0]-now;cur=4}else if(cur===4){nx=0;left=mins[0]+1440-now}else{nx=cur+1;left=mins[nx]-now}
 const g=mk("div","pgrid");
 ORD.forEach((o,i)=>{const cd=mk("div","pc2"+(i===cur?" now":""));if(i===cur)cd.appendChild(mk("span","tag","Sekarang"));const n=mk("div","n");n.append(mk("span","",o[1]),mk("span","",o[2]));cd.append(n,mk("div","tm",fmtT(T[o[0]])));if(i===nx&&isFinite(left))cd.appendChild(mk("div","nx","dalam "+fmtLeft(left)));g.appendChild(cd)});
 B.appendChild(g);B.appendChild(mk("div","shnote","Zona waktu: "+(r.tz||"setempat")+" · Sumber data: Aladhan · Waktu mengikuti kota yang dipilih, bukan jam perangkatmu."))}
function openSholat(){$("side").classList.remove("open");$("sholat").classList.remove("hide");if(!sh.res||sh.err||tzNow(sh.res.tz).dmY!==sh.res.date)loadSholat();else drawSholat()}
let pkMode="";
function openPick(m){pkMode=m;$("pkT").textContent=m==="c"?"Pilih negara":"Pilih kota · "+ctry(sh.cc)[1];$("pkIn").value="";$("pkIn").placeholder=m==="c"?"Cari negara...":"Cari kota, atau ketik kota lain...";drawPick();$("shPick").classList.remove("hide");setTimeout(()=>$("pkIn").focus(),0)}
function drawPick(){const raw=$("pkIn").value.trim(),q=raw.toLowerCase(),box=$("pkList");box.textContent="";
 const add=(label,sub,on,fn)=>{const b=document.createElement("button");if(on)b.className="on";b.appendChild(mk("span","",label));if(sub)b.appendChild(mk("small","",sub));b.onclick=fn;box.appendChild(b)};
 if(pkMode==="c"){for(const c of CTRY.slice().sort((a,b)=>a[1].localeCompare(b[1],"id"))){if(q&&!c[1].toLowerCase().includes(q))continue;add(c[1],c[3].length+" kota",c[0]===sh.cc,()=>pickCountry(c[0]))}}
 else{const c=ctry(sh.cc);let exact=false;for(const city of c[3].slice().sort()){if(city.toLowerCase()===q)exact=true;if(q&&!city.toLowerCase().includes(q))continue;add(city,"",city===sh.city,()=>pickCity(city))}
  if(q&&!exact)add('Cari "'+raw+'" di '+c[1],"cari di server",false,()=>pickCity(raw))}
 if(!box.children.length)box.appendChild(mk("div","gl","Tidak ditemukan."))}
function pickCountry(cc){const c=ctry(cc);if(cc===sh.cc){$("shPick").classList.add("hide");return}sh.cc=cc;sh.city=c[3][0];sh.res=null;loadSholat();if(c[3].length>1)openPick("k");else $("shPick").classList.add("hide")}
function pickCity(city){$("shPick").classList.add("hide");sh.city=city;sh.res=null;loadSholat()}
$("pkIn").oninput=drawPick;$("pkClose").onclick=()=>$("shPick").classList.add("hide");$("shPick").onclick=e=>{if(e.target===$("shPick"))$("shPick").classList.add("hide")};
$("shBack").onclick=()=>$("sholat").classList.add("hide");
$("shFmt").onclick=()=>{sh.h24=!sh.h24;store.set("kmH24",sh.h24?"1":"0");drawSholat()};
setInterval(()=>{if($("sholat").classList.contains("hide")||sh.loading||!sh.res)return;if(tzNow(sh.res.tz).dmY!==sh.res.date)loadSholat();else drawSholat()},20000);

const ST={items:[],rates:{},filter:"all",q:"",u1:null,u2:null,kind:"code",file:null,files:[]};
const MAXB=3*1024*1024,CHK=190000,MAXCODE=200*1024;
function lsSet(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
function fmtSize(n){n=+n||0;return n<1024?n+" B":n<1048576?(n/1024).toFixed(1)+" KB":(n/1048576).toFixed(2)+" MB"}
function bytesToB64(u){let t="";for(let i=0;i<u.length;i+=0x8000)t+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(t)}
function b64ToBytes(b){const t=atob(b),u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);return u}
function readBytes(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(new Uint8Array(r.result));r.onerror=()=>rej(r.error);r.readAsArrayBuffer(f)})}
const CRCT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRCT[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function makeZip(entries){const enc=new TextEncoder(),parts=[],cen=[];let off=0;const d=new Date(),dt=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate(),tm=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1);
 for(const e of entries){const nm=enc.encode(e.name),crc=crc32(e.data),sz=e.data.length;
  const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);lh.setUint16(10,tm,true);lh.setUint16(12,dt,true);lh.setUint32(14,crc,true);lh.setUint32(18,sz,true);lh.setUint32(22,sz,true);lh.setUint16(26,nm.length,true);lh.setUint16(28,0,true);
  parts.push(new Uint8Array(lh.buffer),nm,e.data);
  const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,0,true);ch.setUint16(12,tm,true);ch.setUint16(14,dt,true);ch.setUint32(16,crc,true);ch.setUint32(20,sz,true);ch.setUint32(24,sz,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
  cen.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+sz}
 let cs=0;for(const c of cen)cs+=c.length;
 const end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,entries.length,true);end.setUint16(10,entries.length,true);end.setUint32(12,cs,true);end.setUint32(16,off,true);
 const all=[...parts,...cen,new Uint8Array(end.buffer)];let tot=0;for(const a of all)tot+=a.length;const out=new Uint8Array(tot);let q=0;for(const a of all){out.set(a,q);q+=a.length}return out}
function toChunks(u){const b=bytesToB64(u),a=[];for(let i=0;i<b.length;i+=CHK)a.push(b.slice(i,i+CHK));return a}
function isMine(it){return it.uid===uid||it.uid===localUid}
function stLoad(){if(ST.u1){ST.u1();ST.u1=null}if(ST.u2){ST.u2();ST.u2=null}
 $("stStat").innerHTML=db?'<span class="dot"></span>Terhubung · dibagikan ke semua pengguna':'<span class="dot off"></span>Mode lokal · hanya terlihat di perangkat ini';
 if(db){try{ST.u1=db.collection("store_items").orderBy("ts","asc").onSnapshot(sn=>{ST.items=sn.docs.map(d=>({id:d.id,...d.data()}));drawStore()},()=>toast("Gagal memuat Storage"))}catch(e){toast("Gagal memuat Storage")}
  try{ST.u2=db.collection("store_rates").onSnapshot(sn=>{const r={};for(const d of sn.docs){const v=d.data();if(v&&v.item&&v.uid)(r[v.item]=r[v.item]||{})[v.uid]=v.stars}ST.rates=r;drawStore()},()=>{})}catch(e){}}
 else{try{ST.items=JSON.parse(store.get("kmSt_items")||"[]")}catch(e){ST.items=[]}try{ST.rates=JSON.parse(store.get("kmSt_rates")||"{}")}catch(e){ST.rates={}}drawStore()}}
function openStore(){$("store").classList.remove("hide");stLoad()}
function closeStore(){$("store").classList.add("hide");if(ST.u1){ST.u1();ST.u1=null}if(ST.u2){ST.u2();ST.u2=null}}
function starRow(it,my,mine){const w=mk("span","stars");for(let n=1;n<=5;n++){const b=mk("button",n<=(my||0)?"on":"","★");b.title=n+" bintang";b.setAttribute("aria-label",n+" bintang");b.onclick=()=>stRate(it,n);w.appendChild(b)}return w}
function stCard(it){const c=mk("div","stcard"),h=mk("h3"),rt=ST.rates[it.id]||{},arr=Object.entries(rt).filter(e=>e[0]!==it.uid).map(e=>e[1]),avg=arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0,my=rt[uid]||rt[localUid],mine=isMine(it);
 h.append(mk("span","",{code:"💻",file:"📄",folder:"📁"}[it.kind]||"📦"),mk("span","",it.title||"Tanpa judul"));if(it.kind==="code")h.appendChild(mk("span","chip",it.lang||"Kode"));c.appendChild(h);
 let ex="";if(it.kind==="file")ex=" · "+(it.fname||"")+" · "+fmtSize(it.size);else if(it.kind==="folder")ex=" · "+(it.count||0)+" file · "+fmtSize(it.size);
 c.appendChild(mk("div","stmeta","oleh "+(mine?"kamu":(it.by||"Tamu"))+" · "+new Date(it.ts||Date.now()).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})+ex));
 if(it.desc)c.appendChild(mk("div","stdesc",it.desc));
 if(it.kind==="code")c.appendChild(mk("pre","stpre",it.body||""));
 if(it.kind==="folder"&&it.names&&it.names.length){const ul=mk("ul","fl");for(const n of it.names)ul.appendChild(mk("li","",n));c.appendChild(ul)}
 const r=mk("div","strate");r.append(mk("span","",arr.length?"⭐ "+avg.toFixed(1)+" ("+arr.length+" penilaian)":"Belum ada penilaian"));
 if(!mine&&it.kind!=="code"){r.append(mk("span","","· Nilaimu:"),starRow(it,my,mine))}c.appendChild(r);
 const a=mk("div","stacts");
 if(it.kind==="code"){const b=mk("button","stbtn","📋 Salin kode");b.onclick=async()=>{try{await copyTxt(it.body||"");toast(ST.rates[it.id]&&(ST.rates[it.id][uid]||ST.rates[it.id][localUid])?"Kode disalin":"Kode disalin ✓ Beri bintang ⭐ ya")}catch(e){toast("Gagal menyalin")}};a.appendChild(b)}
 else{const ok=mine||my===5,b=mk("button","stbtn"+(ok?"":" lock"),ok?"⬇️ Ambil / Unduh":"🔒 Beri ⭐ 5 untuk mengambil");b.onclick=()=>{if(!ok){toast("Beri bintang 5 dulu sebagai dukungan, lalu file bisa diambil");return}stDownload(it,b)};a.appendChild(b)}
 if(mine){const d=mk("button","stbtn sec","🗑 Hapus");d.onclick=()=>{if(d.dataset.arm){stDelete(it)}else{d.dataset.arm="1";d.textContent="Yakin hapus?";setTimeout(()=>{d.dataset.arm="";d.textContent="🗑 Hapus"},3000)}};a.appendChild(d)}
 if(it.kind==="code"){const fb=mk("span","stfb");fb.append(mk("span","","Beri nilai"),starRow(it,my,mine));a.appendChild(fb)}
 c.appendChild(a);return c}
function drawStore(){const L=$("stList");if(!L)return;L.textContent="";const q=ST.q.toLowerCase();
 const list=ST.items.slice().sort((a,b)=>(b.ts||0)-(a.ts||0)).filter(it=>(ST.filter==="all"||it.kind===ST.filter)&&(!q||((it.title||"")+" "+(it.desc||"")+" "+(it.lang||"")+" "+(it.fname||"")+" "+(it.by||"")).toLowerCase().includes(q)));
 if(!list.length){L.appendChild(mk("div","empty",ST.items.length?"Tidak ada yang cocok dengan pencarianmu.":"Storage masih kosong. Tekan ＋ Unggah untuk membagikan kode, file, atau folder pertama."));return}
 for(const it of list)L.appendChild(stCard(it))}
async function stRate(it,n){const k=it.id+"_"+uid;(ST.rates[it.id]=ST.rates[it.id]||{})[uid]=n;drawStore();
 if(db){try{await db.collection("store_rates").doc(k).set({item:it.id,uid,name,stars:n,ts:Date.now()})}catch(e){toast("Penilaian gagal terkirim")}}else{lsSet("kmSt_rates",JSON.stringify(ST.rates))}
 if(n===5)toast("Terima kasih atas dukunganmu! ⭐")}
async function stChunk(id,i){if(db){const sn=await db.collection("store_chunks").doc(id+"_"+i).get();if(!sn.exists)throw new Error("x");return sn.data().d}const v=localStorage.getItem("kmSt_c_"+id+"_"+i);if(v==null)throw new Error("x");return v}
async function stDownload(it,btn){const rt=ST.rates[it.id]||{};if(!(isMine(it)||rt[uid]===5||rt[localUid]===5)){toast("Beri bintang 5 dulu untuk mengambil");return}
 if(btn){btn.disabled=true;btn.textContent="⏳ Menyiapkan..."}
 try{const parts=[];for(let i=0;i<(it.chunks||0);i++)parts.push(await stChunk(it.id,i));const bytes=b64ToBytes(parts.join("")),blob=new Blob([bytes],{type:it.kind==="folder"?"application/zip":(it.mime||"application/octet-stream")}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=it.kind==="folder"?(it.fname||it.title||"folder")+".zip":(it.fname||"file");document.body.appendChild(a);a.click();setTimeout(()=>{try{URL.revokeObjectURL(a.href)}catch(e){}a.remove()},1500);toast("Unduhan dimulai")}
 catch(e){toast("Gagal mengunduh, coba lagi")}
 if(btn){btn.disabled=false;btn.textContent="⬇️ Ambil / Unduh"}}
async function stDelete(it){ST.items=ST.items.filter(x=>x.id!==it.id);drawStore();
 if(db){try{await db.collection("store_items").doc(it.id).delete();for(let i=0;i<(it.chunks||0);i++)db.collection("store_chunks").doc(it.id+"_"+i).delete().catch(()=>{})}catch(e){toast("Gagal menghapus di server")}}
 else{lsSet("kmSt_items",JSON.stringify(ST.items));for(let i=0;i<(it.chunks||0);i++)try{localStorage.removeItem("kmSt_c_"+it.id+"_"+i)}catch(e){}}}
function suErr(t){const e=$("suErr");if(!t){e.className="chk bad hide";return}e.textContent="⚠️ "+t;e.className="chk bad"}
function suKind(k){ST.kind=k;ST.file=null;ST.files=[];suErr("");$("suInfo").textContent="";for(const b of $("suKind").children)b.classList.toggle("on",b.dataset.k===k);
 $("suCode").classList.toggle("hide",k!=="code");$("suPick").classList.toggle("hide",k==="code");$("suPickBtn").textContent=k==="file"?"📄 Pilih file":"📁 Pilih folder"}
function openUp(){$("suTitle").value="";$("suDesc").value="";$("suBody").value="";suKind("code");$("suOk").disabled=false;$("suOk").textContent="Unggah";$("stUp").classList.remove("hide");$("suTitle").focus()}
function skipPath(p){return /(^|\/)(node_modules|\.git)\//.test(p)}
async function stPost(){suErr("");const title=$("suTitle").value.trim(),desc=$("suDesc").value.trim(),k=ST.kind;
 if(!title){suErr("Judul tidak boleh kosong.");return}
 if(kasar(title+" "+desc)){suErr("Judul atau deskripsi mengandung kata kasar.");return}
 const it={id:Date.now()+"-"+Math.random().toString(36).slice(2,7),kind:k,title,desc,by:name,uid,ts:Date.now()};let chunks=[];
 try{
  if(k==="code"){const body=$("suBody").value;if(!body.trim()){suErr("Kode tidak boleh kosong.");return}if(body.length>MAXCODE){suErr("Kode terlalu besar (maks 200 KB). Unggah sebagai file saja.");return}it.body=body;it.lang=$("suLang").value}
  else if(k==="file"){const f=ST.file;if(!f){suErr("Pilih file dulu.");return}if(f.size>MAXB){suErr("File terlalu besar (maks 3 MB).");return}const u=await readBytes(f);it.fname=f.name;it.size=u.length;it.mime=f.type||"";chunks=toChunks(u)}
  else{const fs=ST.files.filter(f=>!skipPath(f.webkitRelativePath||f.name));if(!fs.length){suErr("Pilih folder yang berisi file.");return}let tot=0;for(const f of fs)tot+=f.size;if(tot>MAXB){suErr("Folder terlalu besar ("+fmtSize(tot)+"). Maksimal 3 MB.");return}
   const ents=[];for(const f of fs)ents.push({name:f.webkitRelativePath||f.name,data:await readBytes(f)});const z=makeZip(ents);if(z.length>MAXB){suErr("Hasil zip terlalu besar (maks 3 MB).");return}
   it.fname=(ents[0].name.split("/")[0])||title;it.count=ents.length;it.size=tot;it.names=ents.map(e=>e.name).slice(0,200);it.mime="application/zip";chunks=toChunks(z)}
 }catch(e){suErr("Gagal membaca file.");return}
 it.chunks=chunks.length;$("suOk").disabled=true;$("suOk").textContent="⏳ Mengunggah...";
 try{
  if(db){for(let i=0;i<chunks.length;i++)await db.collection("store_chunks").doc(it.id+"_"+i).set({item:it.id,i,d:chunks[i]});await db.collection("store_items").doc(it.id).set(it)}
  else{for(let i=0;i<chunks.length;i++){if(!lsSet("kmSt_c_"+it.id+"_"+i,chunks[i]))throw new Error("quota")}ST.items.push(it);if(!lsSet("kmSt_items",JSON.stringify(ST.items))){ST.items.pop();throw new Error("quota")}drawStore()}
  $("stUp").classList.add("hide");toast("Berhasil diunggah ke Storage")
 }catch(e){if(!db)for(let i=0;i<chunks.length;i++)try{localStorage.removeItem("kmSt_c_"+it.id+"_"+i)}catch(x){}suErr(e&&e.message==="quota"?"Penyimpanan perangkat penuh.":"Gagal mengunggah ke server. Coba lagi.");$("suOk").disabled=false;$("suOk").textContent="Unggah"}}
$("stBack").onclick=closeStore;$("stAdd").onclick=openUp;$("suClose").onclick=()=>$("stUp").classList.add("hide");$("suOk").onclick=stPost;
$("suKind").onclick=e=>{const b=e.target.closest("button");if(b)suKind(b.dataset.k)};
$("suPickBtn").onclick=()=>$(ST.kind==="file"?"fIn":"dIn").click();
$("fIn").onchange=e=>{const f=e.target.files[0];ST.file=f||null;if(f){$("suInfo").textContent=f.name+" · "+fmtSize(f.size);if(!$("suTitle").value)$("suTitle").value=f.name}e.target.value=""};
$("dIn").onchange=e=>{const a=[...e.target.files];ST.files=a;if(a.length){const use=a.filter(f=>!skipPath(f.webkitRelativePath||f.name));let t=0;for(const f of use)t+=f.size;const root=((a[0].webkitRelativePath||"").split("/")[0])||"folder";$("suInfo").textContent=root+" · "+use.length+" file · "+fmtSize(t)+(use.length<a.length?" ("+(a.length-use.length)+" file node_modules/.git dilewati)":"");if(!$("suTitle").value)$("suTitle").value=root}e.target.value=""};
$("stFil").onclick=e=>{const b=e.target.closest("button");if(!b)return;ST.filter=b.dataset.f;for(const x of $("stFil").children)x.classList.toggle("on",x===b);drawStore()};
$("stQ").oninput=()=>{ST.q=$("stQ").value.trim();drawStore()};

/* ===== STORY: video 23 detik, hilang setelah 24 jam ===== */
const SV={items:[],seen:new Set(),u1:null,file:null,meta:null,busy:false,urls:new Map(),cleaned:new Set(),play:[],gi:0,ii:0,tok:0,muted:false,pu:null,tick:null,TTL:24*3600*1000,MAXS:23,MAXV:3.5*1024*1024};
try{SV.seen=new Set(JSON.parse(store.get("kmSvSeen")||"[]"))}catch(e){}
function svSaveSeen(){store.set("kmSvSeen",JSON.stringify([...SV.seen].slice(-400)))}
function svExp(it){return it.exp||((it.ts||0)+SV.TTL)}
function svAlive(it){return svExp(it)>Date.now()}
function svAgo(ts){const m=Math.max(0,Math.floor((Date.now()-ts)/6e4));return m<1?"Baru saja":m<60?m+" mnt lalu":Math.floor(m/60)+" jam lalu"}
function svLeft(it){const m=Math.max(0,Math.ceil((svExp(it)-Date.now())/6e4));return m<60?m+" mnt":Math.ceil(m/60)+" jam"}
function svPurge(list){for(const it of list){if(SV.cleaned.has(it.id))continue;SV.cleaned.add(it.id);
 if(db){try{db.collection("story_items").doc(it.id).delete().catch(()=>{});for(let i=0;i<(it.chunks||0);i++)db.collection("story_chunks").doc(it.id+"_"+i).delete().catch(()=>{})}catch(e){}}
 else for(let i=0;i<(it.chunks||0);i++)try{localStorage.removeItem("kmSv_c_"+it.id+"_"+i)}catch(e){}}}
function svLoad(){if(SV.u1){SV.u1();SV.u1=null}
 $("svStat").innerHTML=db?'<span class="dot"></span>Terhubung · dibagikan ke semua pengguna':'<span class="dot off"></span>Mode lokal · hanya terlihat di perangkat ini';
 const set=arr=>{const dead=arr.filter(x=>!svAlive(x));if(dead.length)svPurge(dead);SV.items=arr.filter(svAlive);if(!db)lsSet("kmSv_items",JSON.stringify(SV.items));svDraw()};
 if(db){try{SV.u1=db.collection("story_items").orderBy("ts","asc").onSnapshot(sn=>set(sn.docs.map(d=>({id:d.id,...d.data()}))),()=>toast("Gagal memuat Story"))}catch(e){toast("Gagal memuat Story")}}
 else{let a=[];try{a=JSON.parse(store.get("kmSv_items")||"[]")}catch(e){}set(a)}}
function openStory(){$("story").classList.remove("hide");svLoad();clearInterval(SV.tick);SV.tick=setInterval(svDraw,60000)}
function closeStory(){$("story").classList.add("hide");if(SV.u1){SV.u1();SV.u1=null}clearInterval(SV.tick)}
function svGroups(){const m=new Map();for(const it of SV.items){const mine=isMine(it),k=mine?"me":it.uid;if(!m.has(k))m.set(k,{uid:k,by:it.by||"Tamu",mine,items:[]});m.get(k).items.push(it)}
 const g=[...m.values()];for(const x of g){x.items.sort((a,b)=>a.ts-b.ts);x.last=x.items[x.items.length-1];x.by=x.last.by||x.by}
 g.sort((a,b)=>(b.mine-a.mine)||(b.last.ts-a.last.ts));return g}
function svRow(g){const b=mk("button","svrow"),last=g.last,all=g.items.every(x=>SV.seen.has(x.id)),ring=mk("span","svring"+(g.mine?"":(all?" seen":""))),i=mk("i");
 if(last&&last.poster)i.style.backgroundImage="url("+last.poster+")";else i.textContent=(g.by||"?").charAt(0).toUpperCase();
 ring.appendChild(i);const w=mk("div");w.append(mk("b","",g.mine?"Story saya":g.by),mk("small","",g.items.length+" story · "+svAgo(last.ts)+" · sisa "+svLeft(last)));b.append(ring,w);b.onclick=()=>svOpen(g);return b}
function svDraw(){const box=$("svList"),mine=$("svMine");if(!box)return;SV.items=SV.items.filter(svAlive);box.textContent="";mine.textContent="";
 const gs=svGroups(),me=gs.find(g=>g.mine),others=gs.filter(g=>!g.mine);
 if(me)mine.appendChild(svRow(me));
 else{const b=mk("button","svrow"),r=mk("span","svring add"),i=mk("i","","＋");r.appendChild(i);const w=mk("div");w.append(mk("b","","Story saya"),mk("small","","Ketuk untuk menambahkan story"));b.append(r,w);b.onclick=svOpenUp;mine.appendChild(b)}
 if(!others.length){box.appendChild(mk("div","empty","Belum ada story dari orang lain. Story yang diposting akan muncul di sini selama 24 jam."));return}
 for(const g of others)box.appendChild(svRow(g))}
/* ---- penampil ---- */
async function svChunk(id,i){if(db){const sn=await db.collection("story_chunks").doc(id+"_"+i).get();if(!sn.exists)throw new Error("x");return sn.data().d}const v=localStorage.getItem("kmSv_c_"+id+"_"+i);if(v==null)throw new Error("x");return v}
async function svUrl(it){if(SV.urls.has(it.id))return SV.urls.get(it.id);const parts=[];for(let i=0;i<(it.chunks||0);i++)parts.push(await svChunk(it.id,i));
 const u=URL.createObjectURL(new Blob([b64ToBytes(parts.join(""))],{type:it.mime||"video/mp4"}));SV.urls.set(it.id,u);return u}
function svOpen(g){const gs=svGroups(),i=gs.findIndex(x=>x.uid===g.uid);if(i<0)return;SV.play=gs;SV.gi=i;let ii=g.items.findIndex(x=>!SV.seen.has(x.id));if(ii<0)ii=0;SV.ii=ii;$("svView").classList.remove("hide");svShow()}
function svMuteIcon(){$("svMute").textContent=SV.muted?"🔇":"🔊"}
function svClose(){clearInterval(SV.itv);const v=$("svVid");try{v.pause()}catch(e){}v.removeAttribute("src");try{v.load()}catch(e){}SV.tok++;$("svView").classList.add("hide");svDraw()}
function svNext(){const g=SV.play[SV.gi];if(!g){svClose();return}if(SV.ii+1<g.items.length)SV.ii++;else{SV.gi++;SV.ii=0;if(SV.gi>=SV.play.length){svClose();return}}svShow()}
function svPrev(){if(SV.ii>0)SV.ii--;else if(SV.gi>0){SV.gi--;SV.ii=0}else{try{$("svVid").currentTime=0}catch(e){}return}svShow()}
function svPre(g){const nx=g.items[SV.ii+1]||(SV.play[SV.gi+1]&&SV.play[SV.gi+1].items[0]);if(nx)svUrl(nx).catch(()=>{})}
function svImgStart(tok){const IMS=5000;SV.ie=0;SV.ip=false;SV.il=Date.now();clearInterval(SV.itv);SV.itv=setInterval(()=>{if(tok!==SV.tok){clearInterval(SV.itv);return}const n=Date.now();if(!SV.ip)SV.ie+=n-SV.il;SV.il=n;const bar=$("svBars").children[SV.ii];if(bar)bar.firstChild.style.width=Math.min(100,SV.ie/IMS*100)+"%";if(SV.ie>=IMS){clearInterval(SV.itv);svNext()}},50)}
function svHold(on){const g=SV.play[SV.gi],it=g&&g.items[SV.ii];if(it&&it.kind==="image"){SV.ip=on;return}const v=$("svVid");if(on){try{v.pause()}catch(e){}}else v.play().catch(()=>{})}
async function svShow(){const g=SV.play[SV.gi];if(!g){svClose();return}const it=g.items[SV.ii];if(!it){svNext();return}
 if(!svAlive(it)){svNext();return}
 const tok=++SV.tok,v=$("svVid"),isI=it.kind==="image";try{v.pause()}catch(e){}clearInterval(SV.itv);$("svImg").classList.toggle("hide",!isI);v.classList.toggle("hide",isI);$("svMute").classList.toggle("hide",isI);
 const bars=$("svBars");bars.textContent="";g.items.forEach((x,i)=>{const s=mk("span"),b=mk("b");b.style.width=i<SV.ii?"100%":"0";s.appendChild(b);bars.appendChild(s)});
 const av=$("svAv");av.style.backgroundImage=it.poster?"url("+it.poster+")":"";av.textContent=it.poster?"":(it.by||"?").charAt(0).toUpperCase();
 $("svWho").textContent=g.mine?"Kamu":(it.by||"Tamu");$("svWhen").textContent=svAgo(it.ts)+" · sisa "+svLeft(it);
 const cp=$("svCapT");cp.textContent=it.cap||"";cp.classList.toggle("hide",!it.cap);$("svDel").classList.toggle("hide",!isMine(it));svMuteIcon();
 $("svLoad").textContent="⏳ Memuat video...";
 try{const u=await svUrl(it);if(tok!==SV.tok)return;
  if(isI){const im=$("svImg");im.src=u;try{await im.decode()}catch(e){}if(tok!==SV.tok)return;v.removeAttribute("src");$("svLoad").textContent="";SV.seen.add(it.id);svSaveSeen();svImgStart(tok);svPre(g);return}
  v.src=u;v.muted=SV.muted;v.currentTime=0;
  try{await v.play()}catch(e){if(tok!==SV.tok)return;v.muted=true;SV.muted=true;svMuteIcon();try{await v.play()}catch(e2){}}
  if(tok!==SV.tok)return;$("svLoad").textContent="";SV.seen.add(it.id);svSaveSeen();
  svPre(g)
 }catch(e){if(tok===SV.tok)$("svLoad").textContent="Gagal memuat video. Ketuk untuk lanjut."}}
async function svDelete(it){SV.items=SV.items.filter(x=>x.id!==it.id);const g=SV.play[SV.gi];g.items=g.items.filter(x=>x.id!==it.id);SV.cleaned.add(it.id);
 const u=SV.urls.get(it.id);if(u){try{URL.revokeObjectURL(u)}catch(e){}SV.urls.delete(it.id)}
 if(db){try{await db.collection("story_items").doc(it.id).delete();for(let i=0;i<(it.chunks||0);i++)db.collection("story_chunks").doc(it.id+"_"+i).delete().catch(()=>{})}catch(e){toast("Gagal menghapus di server")}}
 else{for(let i=0;i<(it.chunks||0);i++)try{localStorage.removeItem("kmSv_c_"+it.id+"_"+i)}catch(e){}lsSet("kmSv_items",JSON.stringify(SV.items))}
 toast("Story dihapus");
 if(!g.items.length){SV.play.splice(SV.gi,1);SV.ii=0;if(SV.gi>=SV.play.length){svClose();return}}else if(SV.ii>=g.items.length)SV.ii=g.items.length-1;
 svShow()}
/* ---- unggah ---- */
function svErr(t){const e=$("svErr");if(!t){e.className="chk bad hide";return}e.textContent="⚠️ "+t;e.className="chk bad"}
function svPgSet(p,t){$("svPg").classList.remove("hide");$("svPgt").classList.toggle("hide",!t);$("svPgb").style.width=Math.round(p*100)+"%";$("svPgt").textContent=t||""}
function svOpenUp(){SV.file=null;SV.meta=null;SV.busy=false;$("svCap").value="";$("svInfo").textContent="";svErr("");$("svPrev").classList.add("hide");$("svPrevI").classList.add("hide");try{$("svPrev").removeAttribute("src")}catch(e){}$("svPg").classList.add("hide");$("svPgt").classList.add("hide");$("svOk").disabled=true;$("svOk").textContent="Posting story";$("svUp").classList.remove("hide")}
function svMeta(f){return new Promise((res,rej)=>{const u=URL.createObjectURL(f),v=document.createElement("video");v.muted=true;v.playsInline=true;v.preload="auto";let done=false,info=null;
 const fin=(ok,val)=>{if(done)return;done=true;clearTimeout(t);URL.revokeObjectURL(u);ok?res(val):rej(val)};
 const t=setTimeout(()=>info?fin(true,Object.assign(info,{poster:""})):fin(false,new Error("t")),12000);
 v.onerror=()=>fin(false,new Error("e"));
 v.onloadedmetadata=()=>{const dur=v.duration,w=v.videoWidth,h=v.videoHeight;if(!isFinite(dur)||!w){fin(false,new Error("m"));return}info={dur,w,h};v.currentTime=Math.min(1,dur/2)};
 v.onseeked=()=>{try{const k=Math.min(1,180/w0(v)),c=document.createElement("canvas");c.width=Math.max(2,Math.round(v.videoWidth*k));c.height=Math.max(2,Math.round(v.videoHeight*k));c.getContext("2d").drawImage(v,0,0,c.width,c.height);fin(true,Object.assign(info,{poster:c.toDataURL("image/jpeg",.6)}))}catch(e){fin(true,Object.assign(info||{dur:v.duration,w:0,h:0},{poster:""}))}};
 function w0(x){return x.videoWidth||180}
 v.src=u})}
async function svPicked(f){svErr("");SV.file=null;SV.meta=null;$("svOk").disabled=true;$("svPrev").classList.add("hide");$("svPrevI").classList.add("hide");if(!f)return;
 const isImg=/^image\//.test(f.type)||/\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(f.name);
 if(isImg){$("svInfo").textContent="Menyiapkan foto...";try{const m=await svImgPrep(f);SV.file=f;SV.meta=m;SV.blob=m.blob;$("svInfo").textContent=f.name+" · foto · "+fmtSize(m.blob.size);if(SV.pu)try{URL.revokeObjectURL(SV.pu)}catch(e){}SV.pu=URL.createObjectURL(m.blob);const pi=$("svPrevI");pi.src=SV.pu;pi.classList.remove("hide");$("svOk").disabled=false}catch(e){$("svInfo").textContent="";svErr("Foto tidak bisa dibaca di browser ini. Coba JPG atau PNG.")}return}
 if(!/^video\//.test(f.type)&&!/\.(mp4|mov|webm|m4v|3gp|mkv)$/i.test(f.name)){svErr("File harus berupa foto atau video.");return}
 $("svInfo").textContent="Memeriksa video...";
 try{const m=await svMeta(f);
  if(m.dur>SV.MAXS+.5){$("svInfo").textContent="";svErr("Video terlalu panjang ("+Math.round(m.dur)+" detik). Maksimal "+SV.MAXS+" detik.");return}
  SV.file=f;SV.meta=m;$("svInfo").textContent=f.name+" · "+m.dur.toFixed(1)+" dtk · "+fmtSize(f.size);
  if(SV.pu)try{URL.revokeObjectURL(SV.pu)}catch(e){}SV.pu=URL.createObjectURL(f);const pv=$("svPrev");pv.src=SV.pu;pv.classList.remove("hide");$("svOk").disabled=false
 }catch(e){$("svInfo").textContent="";svErr("Video tidak bisa dibaca di browser ini. Coba video MP4.")}}
function svImgPrep(f){return new Promise((res,rej)=>{const u=URL.createObjectURL(f),im=new Image();
 im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error("e"))};
 im.onload=async()=>{try{const w=im.naturalWidth,h=im.naturalHeight;if(!w||!h)throw new Error("e");
  const enc=(side,q)=>new Promise(r=>{const k=Math.min(1,side/Math.max(w,h)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));const x=c.getContext("2d");x.fillStyle="#000";x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);c.toBlob(b=>r(b),"image/jpeg",q)});
  let b=await enc(1080,.82);if(b&&b.size>700*1024)b=await enc(1080,.65);if(b&&b.size>700*1024)b=await enc(800,.55);if(!b)throw new Error("e");
  const k=Math.min(1,180/w),c=document.createElement("canvas");c.width=Math.max(2,Math.round(w*k));c.height=Math.max(2,Math.round(h*k));c.getContext("2d").drawImage(im,0,0,c.width,c.height);
  URL.revokeObjectURL(u);res({kind:"image",dur:0,w,h,blob:b,poster:c.toDataURL("image/jpeg",.6)})}catch(e){URL.revokeObjectURL(u);rej(e)}};
 im.src=u})}
function svEncode(file,meta,onP){return new Promise(async(res,rej)=>{
 const url=URL.createObjectURL(file),v=document.createElement("video");v.playsInline=true;v.preload="auto";v.src=url;
 let ac=null,raf=0,rec=null,stopped=false,guard=0;const parts=[];
 const clean=()=>{cancelAnimationFrame(raf);clearTimeout(guard);try{v.pause()}catch(e){}URL.revokeObjectURL(url);try{ac&&ac.close()}catch(e){}};
 const fail=e=>{if(stopped)return;stopped=true;clean();try{if(rec&&rec.state!=="inactive")rec.stop()}catch(x){}rej(e)};
 try{
  await new Promise((ok,no)=>{v.onloadeddata=ok;v.onerror=()=>no(new Error("e"))});
  const w=v.videoWidth,h=v.videoHeight,k=Math.min(1,480/Math.min(w,h)),W=Math.max(2,Math.round(w*k/2)*2),H=Math.max(2,Math.round(h*k/2)*2);
  const cv=document.createElement("canvas");cv.width=W;cv.height=H;const cx=cv.getContext("2d"),cs=cv.captureStream(30);
  try{ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==="suspended")ac.resume();const s=ac.createMediaElementSource(v),d=ac.createMediaStreamDestination();s.connect(d);d.stream.getAudioTracks().forEach(t=>cs.addTrack(t))}catch(e){ac=null}
  const dur=Math.min(meta.dur,SV.MAXS+.5),vbps=Math.max(250000,Math.min(1200000,Math.floor(2.7*1024*1024*8/dur)-(ac?64000:0)));
  const mt=["video/mp4;codecs=avc1.42E01E,mp4a.40.2","video/mp4","video/webm;codecs=vp8,opus","video/webm"].find(t=>{try{return MediaRecorder.isTypeSupported(t)}catch(e){return false}})||"";
  rec=new MediaRecorder(cs,Object.assign(mt?{mimeType:mt}:{},{videoBitsPerSecond:vbps,audioBitsPerSecond:64000}));
  rec.ondataavailable=e=>{if(e.data&&e.data.size)parts.push(e.data)};
  rec.onstop=()=>{if(stopped)return;stopped=true;clean();res(new Blob(parts,{type:(rec.mimeType||mt||"video/webm").split(";")[0]}))};
  rec.onerror=()=>fail(new Error("rec"));
  const draw=()=>{if(stopped)return;cx.drawImage(v,0,0,W,H);onP(Math.min(1,v.currentTime/dur));if(v.ended||v.currentTime>=dur-.05){if(rec.state!=="inactive")rec.stop();return}raf=requestAnimationFrame(draw)};
  rec.start(500);v.muted=false;
  try{await v.play()}catch(e){v.muted=true;await v.play()}
  guard=setTimeout(()=>{if(rec.state!=="inactive")rec.stop()},(dur+6)*1000);draw()
 }catch(e){fail(e)}})}
async function svPost(){if(SV.busy||!SV.file)return;const cap=$("svCap").value.trim();svErr("");
 if(kasar(cap)){svErr("Keterangan mengandung kata kasar.");return}
 SV.busy=true;$("svOk").disabled=true;$("svOk").textContent="⏳ Memproses...";
 const isImg=!!(SV.meta&&SV.meta.kind==="image");let blob=isImg?SV.blob:SV.file,mime=isImg?"image/jpeg":(SV.file.type||"video/mp4");
 try{
  const f=SV.file,pass=/^video\/(mp4|webm)$/.test(f.type)&&f.size<=2.5*1024*1024;
  if(!pass&&!isImg){
   if(typeof MediaRecorder==="undefined"||!HTMLCanvasElement.prototype.captureStream){if(f.size>SV.MAXV)throw new Error("norec")}
   else{svPgSet(0,"Memproses video… jangan tutup atau pindah tab");blob=await svEncode(f,SV.meta,p=>svPgSet(p,"Memproses video… "+Math.round(p*100)+"% (jangan tutup atau pindah tab)"));mime=blob.type||"video/webm"}}
  if(blob.size>SV.MAXV)throw new Error("big")
 }catch(e){svErr(e&&e.message==="big"?"Video masih terlalu besar setelah diperkecil. Coba video yang lebih pendek.":e&&e.message==="norec"?"Browser ini tidak bisa memperkecil video. Pilih video di bawah 3 MB.":"Gagal memproses video. Coba video lain.");$("svPg").classList.add("hide");$("svPgt").classList.add("hide");SV.busy=false;$("svOk").disabled=false;$("svOk").textContent="Posting story";return}
 let chunks=[];const now=Date.now();
 const it={id:now+"-"+Math.random().toString(36).slice(2,7),kind:isImg?"image":"video",uid,by:name,ts:now,exp:now+SV.TTL,cap,dur:+SV.meta.dur.toFixed(1),mime,poster:SV.meta.poster||""};
 try{const u=await readBytes(blob);it.size=u.length;chunks=toChunks(u)}catch(e){svErr("Gagal membaca video.");SV.busy=false;$("svOk").disabled=false;$("svOk").textContent="Posting story";return}
 it.chunks=chunks.length;$("svOk").textContent="⏳ Mengunggah...";
 try{
  if(db){for(let i=0;i<chunks.length;i++){svPgSet((i+1)/chunks.length,"Mengunggah "+(i+1)+"/"+chunks.length);await db.collection("story_chunks").doc(it.id+"_"+i).set({item:it.id,i,d:chunks[i]})}await db.collection("story_items").doc(it.id).set(it)}
  else{for(let i=0;i<chunks.length;i++){if(!lsSet("kmSv_c_"+it.id+"_"+i,chunks[i]))throw new Error("quota")}SV.items.push(it);if(!lsSet("kmSv_items",JSON.stringify(SV.items))){SV.items.pop();throw new Error("quota")}svDraw()}
  $("svUp").classList.add("hide");toast("Story diposting · aktif 24 jam");
 }catch(e){if(!db)for(let i=0;i<chunks.length;i++)try{localStorage.removeItem("kmSv_c_"+it.id+"_"+i)}catch(x){}svErr(e&&e.message==="quota"?"Penyimpanan perangkat penuh.":"Gagal mengunggah ke server. Coba lagi.");$("svOk").disabled=false;$("svOk").textContent="Posting story"}
 SV.busy=false;if(!$("svUp").classList.contains("hide")){$("svOk").disabled=false;$("svOk").textContent="Posting story"}}
$("svBack").onclick=closeStory;$("svAdd").onclick=svOpenUp;$("svUpX").onclick=()=>{if(!SV.busy)$("svUp").classList.add("hide")};$("svOk").onclick=svPost;
$("svPick").onclick=()=>$("svF").click();$("svRec").onclick=()=>$("svC").click();
$("svF").onchange=e=>{const f=e.target.files[0];e.target.value="";svPicked(f)};$("svC").onchange=e=>{const f=e.target.files[0];e.target.value="";svPicked(f)};
$("svX").onclick=svClose;
$("svMute").onclick=()=>{SV.muted=!SV.muted;$("svVid").muted=SV.muted;svMuteIcon()};
$("svDel").onclick=()=>{const b=$("svDel");const g=SV.play[SV.gi],it=g&&g.items[SV.ii];if(!it)return;if(!b.dataset.arm){b.dataset.arm="1";b.textContent="❓";setTimeout(()=>{b.dataset.arm="";b.textContent="🗑"},3000);return}b.dataset.arm="";b.textContent="🗑";svDelete(it)};
{const vid=$("svVid");vid.addEventListener("ended",svNext);vid.addEventListener("timeupdate",()=>{const g=SV.play[SV.gi],it=g&&g.items[SV.ii],bar=$("svBars").children[SV.ii];const d=isFinite(vid.duration)&&vid.duration>0?vid.duration:(it&&it.dur)||SV.MAXS;if(bar)bar.firstChild.style.width=Math.min(100,vid.currentTime/d*100)+"%"});
 const z=$("svZone");let held=false,hT=0;
 z.onpointerdown=()=>{held=false;clearTimeout(hT);hT=setTimeout(()=>{held=true;svHold(true)},220)};
 z.onpointerup=e=>{clearTimeout(hT);if(held){held=false;svHold(false);return}const r=z.getBoundingClientRect();(e.clientX-r.left)<r.width*.3?svPrev():svNext()};
 z.onpointercancel=z.onpointerleave=()=>{clearTimeout(hT);if(held){held=false;svHold(false)}}}
document.addEventListener("keydown",e=>{if($("svView").classList.contains("hide"))return;if(e.key==="Escape")svClose();else if(e.key==="ArrowRight")svNext();else if(e.key==="ArrowLeft")svPrev()});

/* ===== BERBINTANG ===== */
let STAR=[];try{STAR=JSON.parse(store.get("kmStar")||"[]")}catch(e){}
let armedId="",armTm=0;
function saveStar(){store.set("kmStar",JSON.stringify(STAR))}
function isStar(id){return STAR.some(s=>s.id===id)}
function armMsg(el,id){document.querySelectorAll(".msg.arm").forEach(x=>x.classList.remove("arm"));el.classList.add("arm");armedId=id;clearTimeout(armTm);armTm=setTimeout(()=>{if(armedId===id){armedId="";el.classList.remove("arm")}},6000);try{getSelection().removeAllRanges()}catch(e){}toast("Tekan ⭐ di pojok atas pesan untuk menyimpan")}
function toggleStar(m){armedId="";const was=isStar(m.id);if(was)STAR=STAR.filter(s=>s.id!==m.id);else STAR.push({id:m.id,ch:cur,t:m.t,lang:m.lang||"",body:m.body||"",name:m.name||"Tamu",ts:m.ts||Date.now(),st:Date.now()});saveStar();render();toast(was?"Bintang dihapus":"Disimpan ke Berbintang ⭐")}
function chTitle(ch){const c=CH.find(x=>x[0]===ch);if(c)return c[2];const g=groups.find(x=>"grp_"+x.id===ch);if(g)return g.name;const f=friends.find(x=>dmId(x.code)===ch);return f?(f.name||"Teman"):"Chat"}
function starDraw(){const L=$("starList");L.textContent="";$("starCt").textContent=STAR.length+" tersimpan";
 if(!STAR.length){L.appendChild(mk("div","empty","Belum ada pesan berbintang. Ketuk pesan 2 kali, lalu tekan ⭐ di pojok atas pesan."));return}
 for(const s of STAR.slice().sort((a,b)=>b.st-a.st)){const c=mk("div","stcard starcard"),h=mk("div","starhead"),isC=s.t==="code",first=(s.body||"").trim().split("\n")[0].slice(0,56)||"(kosong)";
  h.tabIndex=0;h.setAttribute("role","button");const w=mk("div");w.append(mk("b","",(isC?(s.lang||"Kode")+" · ":"")+first),mk("small","","dari "+s.name+" · "+chTitle(s.ch)+" · "+new Date(s.ts).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})));
  h.append(mk("span","",isC?"💻":"💬"),w,mk("span","chev","▾"));
  const bd=mk("div","starbody hide");bd.appendChild(isC?mk("pre","stpre",s.body):mk("div","stdesc",s.body));
  const a=mk("div","stacts"),cp=mk("button","stbtn","📋 Salin"),rm=mk("button","stbtn sec","⭐ Hapus bintang");
  cp.onclick=async()=>{try{await copyTxt(s.body||"");toast("Disalin")}catch(e){toast("Gagal menyalin")}};
  rm.onclick=()=>{STAR=STAR.filter(x=>x.id!==s.id);saveStar();starDraw();render();toast("Bintang dihapus")};
  a.append(cp,rm);bd.appendChild(a);
  const tg=()=>{bd.classList.toggle("hide");c.classList.toggle("open")};h.onclick=tg;h.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();tg()}};
  c.append(h,bd);L.appendChild(c)}}
function openStar(){$("side").classList.remove("open");$("starP").classList.remove("hide");starDraw()}
$("starBack").onclick=()=>$("starP").classList.add("hide");

/* ===== PERANGKAT TERTAUT (kode 8 angka, dienkripsi di perangkat sebelum masuk database) ===== */
const LKK=["kmName","kmPw","kmAbout","kmUser","kmLink","kmCode","kmPhoto","kmThumb","kmUid","kmFriends","kmGroups","kmStar"];
const LK={it:120000,CH:180000,busy:false,fails:0,until:0,arm:0,lock:false,tm:0,syncing:false};
const _te=new TextEncoder(),_td=new TextDecoder();
const hexOf=u=>[...new Uint8Array(u)].map(b=>b.toString(16).padStart(2,"0")).join("");
async function pbk(secret,salt,bits){const k=await crypto.subtle.importKey("raw",_te.encode(secret),"PBKDF2",false,["deriveBits"]);return crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt:_te.encode(salt),iterations:LK.it},k,bits)}
async function aesKey(secret,salt){return crypto.subtle.importKey("raw",await pbk(secret,salt,256),"AES-GCM",false,["encrypt","decrypt"])}
async function seal(secret,salt,text){const iv=crypto.getRandomValues(new Uint8Array(12)),ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},await aesKey(secret,salt),_te.encode(text));return{iv:bytesToB64(iv),d:bytesToB64(new Uint8Array(ct))}}
async function unseal(secret,salt,o){return _td.decode(await crypto.subtle.decrypt({name:"AES-GCM",iv:b64ToBytes(o.iv)},await aesKey(secret,salt),b64ToBytes(o.d)))}
const lkId=async c=>"L"+hexOf(await pbk(c,"wc-id-1",128));
const lkRid=async s=>"R"+hexOf(await pbk(s,"wc-rid-1",128));
function lkNewCode(){const r=new Uint32Array(1);crypto.getRandomValues(r);return String(r[0]%1e8).padStart(8,"0")}
function normName(s){return String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^\p{L}\s]/gu," ").replace(/\s+/g," ").trim()}
function validDob(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+"T00:00:00");return !isNaN(d)&&d.getFullYear()>=1900&&d<=new Date()}
function lkM(id,cls,t){const e=$(id);if(!t){e.className="chk hide";return}e.className="chk "+cls;e.textContent=t}
function lkSecure(){if(!db){return "Butuh koneksi server. Di mode lokal, akun tidak bisa dipindahkan antar perangkat."}if(!(window.crypto&&crypto.subtle))return "Browser ini tidak mendukung enkripsi. Buka lewat alamat https.";return ""}
async function lkPut(code){const snap={};for(const k of LKK){const v=store.get(k);if(v!=null)snap[k]=v}snap._ts=Date.now();
 const sl=await seal(code,"wc-key-1",JSON.stringify(snap)),id=await lkId(code),n=Math.max(1,Math.ceil(sl.d.length/LK.CH));
 for(let i=0;i<n;i++)await db.collection("link_parts").doc(id+"_"+i).set({d:sl.d.slice(i*LK.CH,(i+1)*LK.CH)});
 await db.collection("links").doc(id).set({iv:sl.iv,n,ts:Date.now()});return snap._ts}
async function lkGet(code){const id=await lkId(code),m=await db.collection("links").doc(id).get();if(!m.exists)return null;const h=m.data();let d="";
 for(let i=0;i<h.n;i++){const p=await db.collection("link_parts").doc(id+"_"+i).get();if(!p.exists)throw new Error("part");d+=p.data().d}
 return JSON.parse(await unseal(code,"wc-key-1",{iv:h.iv,d}))}
async function lkSync(manual){const code=store.get("kmLinkCode");if(!code||!db||LK.syncing||LK.lock)return;LK.syncing=true;
 try{const t=await lkPut(code);store.set("kmLinkAt",String(t));lkDrawT();if(manual)toast("Tersinkron ✓")}catch(e){if(manual)toast("Gagal menyinkronkan")}LK.syncing=false}
lkSoonFn=()=>{if(!db||LK.lock||!store.get("kmLinkCode"))return;clearTimeout(LK.tm);LK.tm=setTimeout(()=>lkSync(false),4000)};
function lkInit(){if(store.get("kmLinkCode")){clearTimeout(LK.tm);LK.tm=setTimeout(()=>lkSync(false),3000)}}
function lkDrawT(){const t=+store.get("kmLinkAt")||0;$("lkSyncT").textContent=t?"Terakhir disinkronkan: "+new Date(t).toLocaleString("id-ID",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):""}
let lkShow=false;
function lkDraw(){const code=store.get("kmLinkCode");$("lkNew").classList.toggle("hide",!!code);$("lkHave").classList.toggle("hide",!code);
 $("lkStat").innerHTML=db?'<span class="dot"></span>Terhubung · data akun dienkripsi sebelum disimpan':'<span class="dot off"></span>Mode lokal · butuh server untuk menautkan perangkat';
 $("lkCodeV").textContent=code?(lkShow?code:"••••••••"):"";$("lkEye").textContent=lkShow?"🙈 Sembunyikan":"👁️ Tampilkan";lkDrawT();
 $("lkDob").max=$("lkDob2").max=new Date().toISOString().slice(0,10)}
function openLink(){$("side").classList.remove("open");lkShow=false;$("linkP").classList.remove("hide");lkM("lkErr","");lkM("lkMsg","");lkM("lkMsg2","");$("lkRes").classList.add("hide");lkDraw();if(store.get("kmLinkCode"))lkSync(false)}
$("lkBack").onclick=()=>{$("linkP").classList.add("hide");if(!named)showAuth()};
$("authLink").onclick=()=>{$("nameOv").classList.add("hide");openLink()};
$("lkEye").onclick=()=>{lkShow=!lkShow;lkDraw()};
$("lkCopy").onclick=()=>copyTxt(store.get("kmLinkCode")||"").then(()=>toast("Kode disalin"),()=>toast("Gagal menyalin"));
$("lkSync").onclick=()=>{const e=lkSecure();if(e){toast(e);return}lkSync(true)};
for(const i of ["lkIn"])$(i).oninput=()=>{$(i).value=$(i).value.replace(/\D/g,"").slice(0,8)};
$("lkCreate").onclick=async()=>{if(LK.busy)return;const e=lkSecure();if(e){lkM("lkErr","bad","⚠️ "+e);return}
 const full=normName($("lkFull").value),dob=$("lkDob").value;
 if(full.split(" ").filter(Boolean).length<2){lkM("lkErr","bad","⚠️ Isi nama lengkap (minimal 2 kata).");return}
 if(!validDob(dob)){lkM("lkErr","bad","⚠️ Isi tanggal lahir yang valid.");return}
 LK.busy=true;$("lkCreate").disabled=true;lkM("lkErr","load","⏳ Membuat kode aman...");
 try{const sec=full+"|"+dob,rid=await lkRid(sec),ref=db.collection("link_rec").doc(rid),ex=await ref.get();
  if(ex.exists){let c0="";try{c0=await unseal(sec,"wc-rkey-1",ex.data())}catch(x){}if(/^\d{8}$/.test(c0)&&c0!==store.get("kmLinkCode")){lkM("lkErr","bad","⚠️ Nama lengkap dan tanggal lahir ini sudah terdaftar di akun lain. Kalau itu akunmu, pakai Lupa kode di bawah.");LK.busy=false;$("lkCreate").disabled=false;return}}
  let code="",tr=0;do{code=lkNewCode();const q=await db.collection("links").doc(await lkId(code)).get();if(!q.exists)break}while(++tr<6);
  await ref.set(await seal(sec,"wc-rkey-1",code));store.set("kmLinkCode",code);await lkPut(code);store.set("kmLinkAt",String(Date.now()));
  lkM("lkErr","");lkShow=true;lkDraw();toast("Kode tautan dibuat. Simpan dengan aman!")
 }catch(x){store.set("kmLinkCode","");lkM("lkErr","bad","⚠️ Gagal membuat kode. Coba lagi.")}
 LK.busy=false;$("lkCreate").disabled=false};
$("lkGo").onclick=async()=>{if(LK.busy)return;const code=$("lkIn").value.trim(),e=lkSecure();
 if(e){lkM("lkMsg","bad","⚠️ "+e);return}
 if(!/^\d{8}$/.test(code)){lkM("lkMsg","bad","⚠️ Kode harus 8 angka, contoh: 00100871.");return}
 if(store.get("kmPw")&&store.get("kmLinkCode")!==code&&!LK.arm){LK.arm=1;$("lkGo").textContent="Akun di perangkat ini akan diganti. Tekan lagi";setTimeout(()=>{LK.arm=0;$("lkGo").textContent="Tautkan"},6000);return}
 LK.arm=0;$("lkGo").textContent="Tautkan";LK.busy=true;$("lkGo").disabled=true;lkM("lkMsg","load","⏳ Memeriksa kode...");
 try{const snap=await lkGet(code);
  if(!snap){lkM("lkMsg","bad","❌ Kode tidak ditemukan. Periksa lagi kodenya.")}
  else{LK.lock=true;for(const k of LKK){if(snap[k]!=null)store.set(k,snap[k]);else try{localStorage.removeItem(k)}catch(x){}}
   store.set("kmLinkCode",code);store.set("kmLinkAt",String(snap._ts||Date.now()));store.set("kmAuto","1");lkM("lkMsg","ok","✅ Berhasil! Memuat akunmu...");
   setTimeout(()=>{try{location.reload()}catch(x){LK.lock=false;lkM("lkMsg","ok","✅ Tertaut. Muat ulang halaman ini.")}},700)}
 }catch(x){lkM("lkMsg","bad","❌ Kode salah atau data tidak bisa dibuka.")}
 LK.busy=false;$("lkGo").disabled=false};
$("lkRec").onclick=async()=>{if(LK.busy)return;const e=lkSecure();if(e){lkM("lkMsg2","bad","⚠️ "+e);return}
 if(Date.now()<LK.until){lkM("lkMsg2","bad","⚠️ Terlalu banyak percobaan. Tunggu "+Math.ceil((LK.until-Date.now())/1000)+" detik.");return}
 const full=normName($("lkFull2").value),dob=$("lkDob2").value;
 if(full.split(" ").filter(Boolean).length<2||!validDob(dob)){lkM("lkMsg2","bad","⚠️ Isi nama lengkap dan tanggal lahir dengan benar.");return}
 LK.busy=true;$("lkRec").disabled=true;$("lkRes").classList.add("hide");lkM("lkMsg2","load","⏳ Memverifikasi...");
 try{const sec=full+"|"+dob,s=await db.collection("link_rec").doc(await lkRid(sec)).get();let code="";if(s.exists){try{code=await unseal(sec,"wc-rkey-1",s.data())}catch(x){}}
  let ok=/^\d{8}$/.test(code);if(ok){const q=await db.collection("links").doc(await lkId(code)).get();if(!q.exists)ok=false}
  if(!ok){if(++LK.fails>=5){LK.fails=0;LK.until=Date.now()+60000}lkM("lkMsg2","bad","❌ Nama lengkap atau tanggal lahir tidak cocok.")}
  else{LK.fails=0;lkM("lkMsg2","ok","✅ Verifikasi benar. Ini kodemu, salin lalu isi di kolom tautan.");$("lkResCode").textContent=code;$("lkRes").classList.remove("hide")}
 }catch(x){lkM("lkMsg2","bad","⚠️ Gagal memverifikasi. Coba lagi.")}
 LK.busy=false;$("lkRec").disabled=false};
$("lkResCopy").onclick=()=>copyTxt($("lkResCode").textContent).then(()=>toast("Kode disalin"),()=>toast("Gagal menyalin"));
$("lkResUse").onclick=()=>{$("lkIn").value=$("lkResCode").textContent;$("lkIn").scrollIntoView({block:"center"});$("lkIn").focus()};

name="Tamu";drawMe();
if(store.get("kmAuto")==="1"&&store.get("kmName")&&store.get("kmPw")){store.set("kmAuto","");setName(store.get("kmName"));toast("Perangkat berhasil ditautkan")}else showAuth();
window.addEventListener("online",()=>flush(cur));setInterval(()=>{if(db)flush(cur)},20000);
drawChs();subscribe();
(()=>{try{const c=window.FIREBASE_CONFIG;if(!c||!c.apiKey||/ISI_/.test(c.apiKey)||!window.firebase)return;
 if(!firebase.apps.length)firebase.initializeApp(c);const d=firebase.firestore();db=d;stat();subscribe();registerMe();lkInit()}catch(e){console.error("Firebase gagal:",e)}})();
(async()=>{try{if(!window.claude||db)return;const [d,u]=await Promise.all([claude.use("db"),claude.use("user")]);if(u)try{uid=await u.id()}catch(e){}if(d){db=d;stat();subscribe();registerMe();lkInit()}}catch(e){}})();
})();
