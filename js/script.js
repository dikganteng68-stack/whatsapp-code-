const P={chat:"M4 5h16v11H9l-5 4z",story:"M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4",store:"M3 7l2-3h14l2 3v12H3zM3 7h18M10 12h4",ai:"M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z",arch:"M4 4h16v4H4zM5 8v12h14V8M12 11v6M9 14l3 3 3-3",search:"M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",plus:"M12 5v14M5 12h14",send:"M3 11l18-8-8 18-2-8z",user:"M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM5 20c1-4 4-5 7-5s6 1 7 5",cam:"M4 8h4l2-3h4l2 3h4v11H4zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",doc:"M7 3h7l4 4v14H7zM14 3v4h4"};
const I=n=>`<svg class="i" viewBox="0 0 24 24"><path d="${P[n]}"/></svg>`;
const $=id=>document.getElementById(id);
let S={chats:[],me:""},view="chat",flt="all",cur=null,tt;
try{S=JSON.parse(localStorage.getItem("wsc")||"null")||S}catch(e){}
if(!S.me)S.me=Math.random().toString(36).slice(2,10);
if(!S.name)S.name="Tamu";if(!S.stars)S.stars=[];
if(!S.items)S.items=[{id:"s1",by:"Rina",code:"rina2026",lang:"JavaScript",title:"Hitung diskon",body:"function diskon(harga, persen){\n  return harga - (harga * persen / 100);\n}\nconsole.log(diskon(100000, 15));",ts:2},{id:"s2",by:"Dimas",code:"dimas777",lang:"Python",title:"Cek bilangan genap",body:"def genap(n):\n    return n % 2 == 0\n\nprint(genap(10))",ts:1}];
if(!S.chats.some(c=>c.id=="ai"))S.chats.unshift({id:"ai",name:"AI Whatsschat",ai:1,msgs:[{t:"Halo! Aku AI Whatsschat. Fitur utamanya belum tersambung, ini masih tampilan HTML dulu.",time:hm()}],unread:0});
const save=()=>{try{localStorage.setItem("wsc",JSON.stringify(S))}catch(e){}};
function hm(){return new Date().toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}).replace(":",".")}
const ini=n=>(n[0]||"?").toUpperCase(),esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const nav=[["chat","chat","Chat"],["story","story","Update"],["store","store","Storage"],["ai","ai","AI"]];
$("rail").innerHTML=nav.map(n=>`<button data-v="${n[0]}" title="${n[2]}" aria-label="${n[2]}">${I(n[1])}<span class="dot hide" id="rd${n[0]}"></span></button>`).join("")+`<button data-v="arsip" title="Diarsipkan">${I("arch")}</button><hr><div class="sp"></div><button data-v="me" id="rMe" title="Pengaturan">${I("user")}</button>`;
$("bnav").innerHTML=nav.map(n=>`<button data-v="${n[0]}"><i>${I(n[1])}</i>${n[2]}</button>`).join("");
$("add").innerHTML=I("plus");$("snd").innerHTML=I("send");$("sri").innerHTML=I("search");$("arc").innerHTML=I("arch")+`<span>Diarsipkan</span><em id="ac"></em>`;
document.querySelector(".cam").innerHTML=I("cam");$("qi1").innerHTML=I("arch");$("qi2").innerHTML=I("ai");$("qi3").innerHTML=I("user");
$("chips").innerHTML=[["all","Semua"],["unread","Belum dibaca"],["fav","Favorit"],["group","Grup"]].map(c=>`<button data-f="${c[0]}">${c[1]}</button>`).join("");
const menu=[["grup","Grup baru"],["kom","Komunitas baru"],["upd","Detail update"],["perangkat","Perangkat tertaut"],["bintang","Berbintang"],["baca","Baca semua"],["teman","Tambah teman"],["arsip","Diarsipkan"],["storage","Storage"],["profil","Pengaturan"]];
$("pop").innerHTML=menu.map(m=>`<button data-a="${m[0]}">${m[1]}</button>`).join("");
$("my").textContent=S.me;

function toast(n,s,id){clearTimeout(tt);$("tAv").textContent=ini(n);$("tB").textContent=n;$("tS").textContent=s;const t=$("toast");t.onclick=()=>{t.classList.remove("show");if(id)open(id)};t.classList.add("show");tt=setTimeout(()=>t.classList.remove("show"),4000)}
function render(){
 const arch=view=="arsip",q=$("q").value.toLowerCase();
 let L=S.chats.filter(c=>!!c.arch==arch&&c.name.toLowerCase().includes(q));
 if(view=="ai")L=S.chats.filter(c=>c.ai);
 if(flt=="unread")L=L.filter(c=>c.unread);if(flt=="fav")L=L.filter(c=>c.fav);if(flt=="group")L=L.filter(c=>c.group);
 L.sort((a,b)=>(b.ai?1:0)-(a.ai?1:0)||(b.ts||0)-(a.ts||0));
 $("list").innerHTML=L.length?L.map(c=>{const m=c.msgs[c.msgs.length-1];return `<button class="ch ${cur==c.id?"on":""}" data-id="${c.id}"><div class="av ${c.ai?"ai":""}">${c.ai?"✦":ini(c.name)}</div><div class="mid"><div class="r1"><b>${esc(c.name)}</b><small>${m?m.time:""}</small></div><div class="r2"><span>${m?(m.me?"Anda: ":"")+esc(m.t):""}</span>${c.unread?`<i class="bd">${c.unread}</i>`:""}</div></div>${c.ai?"":`<span class="act"><span data-ar="${c.id}">${c.arch?"Keluarkan":"Arsipkan"}</span></span>`}</button>`}).join(""):`<div class="empty">${arch?"Belum ada chat yang diarsipkan. Arsipkan chat saat kamu sedang malas membalas.":"Belum ada teman. Ketuk + lalu masukkan kode teman untuk mulai DM."}</div>`;
 const n=S.chats.filter(c=>c.arch).length;$("ac").textContent=n||"";$("arc").classList.toggle("hide",arch||view=="ai");
 $("arc").querySelector("span").textContent="Diarsipkan";
 document.querySelectorAll("[data-f]").forEach(b=>b.classList.toggle("on",b.dataset.f==flt));
 document.querySelectorAll("[data-v]").forEach(b=>b.classList.toggle("on",b.dataset.v==view));
 $("stp").classList.toggle("hide",view!="story");document.body.classList.toggle("stv",view=="story");$("rdstory").classList.toggle("hide",!unseenAny());if(view=="story")storyDraw();
 const u=S.chats.some(c=>c.unread&&!c.arch);$("rdchat").classList.toggle("hide",!u);
 save();
}
function open(id){const c=S.chats.find(x=>x.id==id);if(!c)return;cur=id;c.unread=0;
 $("cA").textContent=c.ai?"✦":ini(c.name);$("cA").className="av"+(c.ai?" ai":"");$("cN").innerHTML=esc(c.name)+(c.ai?' <span class="vb">✓</span>':'');$("cS").textContent=c.ai?"Asisten AI · bisa menganalisis data":"Kode: "+(c.code||"-");
 $("cv").classList.add("show");{const a=c.ai?1:0;$("aiK").classList.toggle("hide",!a);$("aiQ").classList.toggle("hide",!a);$("attB").classList.toggle("hide",!a);$("msgs").classList.toggle("aiw",!!a);$("aiPop").classList.add("hide")}document.querySelector(".home").classList.add("hide");$("main").classList.add("open");draw(c);render()}
function draw(c){$("msgs").innerHTML=c.msgs.map(m=>`<div class="m ${m.me?"me":""}">${c.ai&&!m.me?md(m.t):esc(m.t)}<small>${m.time}</small></div>`).join("");$("msgs").scrollTop=1e9}
function push(c,t,me){c.msgs.push({t,me,time:hm()});c.ts=Date.now();if(!me&&cur!=c.id){c.unread=(c.unread||0)+1;if(!c.arch&&nf().pesan)toast(c.name,nf().prev?t:"Pesan baru",c.id)}if(cur==c.id)draw(c);render()}
function send(){const t=$("ta").value.trim(),c=S.chats.find(x=>x.id==cur);if(!t||!c)return;$("ta").value="";push(c,t,1);
 if(c.ai)return askAI(c);setTimeout(()=>push(c,"Oke, pesanmu terkirim. 👍",0),900)}
function addFriend(){const code=$("code").value.trim().toLowerCase();if(!/^[a-z0-9]{8}$/.test(code)){$("code").style.borderColor="#e11d2e";return}
 if(code==S.me){toast("Kode ini milikmu","Masukkan kode teman, bukan kodemu.");return}
 let c=S.chats.find(x=>x.code==code);
 if(!c){c={id:code,code,name:$("nm").value.trim()||"Teman "+code.slice(0,4),msgs:[],unread:0,ts:Date.now()};S.chats.push(c)}
 $("ov").classList.add("hide");$("code").value=$("nm").value="";view="chat";open(c.id);
 setTimeout(()=>{push(c,"Hai! Kita sudah terhubung lewat kode "+code+".",0)},1800)}
function act(a){$("pop").classList.add("hide");
 if(a=="teman"){$("ov").classList.remove("hide");$("code").focus()}
 else if(a=="arsip"){view="arsip";flt="all";render()}
 else if(a=="ai"){view="ai";open("ai")}
 else if(a=="baca"){S.chats.forEach(c=>c.unread=0);render()}
 else if(a=="profil")settingsPage();
 else if(a=="storage")storagePage();else if(a=="upd")updPage();
 else if(a=="bintang")starPage();
 else toast(menu.find(m=>m[0]==a)?.[1]||"Fitur","Segera hadir. Beri tahu aku detailnya dan kubuat berikutnya.")}
document.addEventListener("click",e=>{const t=e.target;
 const ar=t.closest("[data-ar]");if(ar){e.stopPropagation();const c=S.chats.find(x=>x.id==ar.dataset.ar);c.arch=!c.arch;if(cur==c.id&&c.arch)goBack();render();return}
 const ch=t.closest(".ch");if(ch){open(ch.dataset.id);return}
 const a=t.closest("[data-a]");if(a){act(a.dataset.a);return}
 const f=t.closest("[data-f]");if(f){flt=f.dataset.f;render();return}
 const v=t.closest("[data-v]");if(v){const k=v.dataset.v;if(k=="ai")return act("ai");if(k=="store")return act("storage");if(k=="me")return act("profil");view=k;render();return}
 if(!t.closest("#pop")&&t.id!="kb")$("pop").classList.add("hide")});
$("kb").onclick=()=>$("pop").classList.toggle("hide");$("arc").onclick=()=>act("arsip");
$("add").onclick=$("h1").onclick=()=>act("teman");$("cl").onclick=()=>$("ov").classList.add("hide");$("go").onclick=addFriend;
$("code").oninput=()=>$("code").style.borderColor="";$("q").oninput=render;
function goBack(){cur=null;$("main").classList.remove("open");$("cv").classList.remove("show");document.querySelector(".home").classList.remove("hide");render()}
$("bk").onclick=goBack;$("snd").onclick=send;
$("ta").onkeydown=e=>{if(e.key=="Enter"&&!e.shiftKey&&innerWidth>760){e.preventDefault();send()}};
const LG=["JavaScript","Python","HTML","CSS","PHP","Java","C++","SQL","Bash","JSON"];
function page(t,h){$("pgT").textContent=t;$("pgB").innerHTML=h;$("pg").classList.remove("hide")}
$("pgBk").onclick=()=>$("pg").classList.add("hide");
function itemCard(i,full){const st=S.stars.includes(i.id),mine=i.code==S.me,body=full?i.body:i.body.split("\n").slice(0,4).join("\n");
 return `<div class="it"><b>${esc(i.title)}</b><small>${esc(i.lang)} · oleh ${esc(i.by)}${mine?" (kamu)":""}</small><pre>${esc(body)}</pre><div class="ir"><button data-st="${i.id}" class="${st?"on":""}">${st?"★ Berbintang":"☆ Beri bintang"}</button><button data-cp="${i.id}" ${st||mine?"":"disabled"}>Salin kode</button>${mine?`<button data-del="${i.id}">Hapus</button>`:""}</div></div>`}
function storagePage(){
 page("Storage",`<p class="nt">Hanya kode yang bisa diunggah, dan isinya harus sesuai bahasa yang dipilih. Kode yang diunggah di sini bisa dilihat semua orang, tanpa harus berteman. Untuk mengambil (menyalin) kodenya, beri bintang ⭐ dulu. Hasilnya tersimpan di ⋮ → Berbintang.</p><div class="up"><input id="uT" maxlength="60" placeholder="Judul kode" autocomplete="off"><select id="uL">${LG.map(l=>`<option>${l}</option>`).join("")}</select><textarea id="uC" rows="5" placeholder="Tempel kode di sini..." spellcheck="false"></textarea><button class="btn" id="uOk">Unggah ke Storage</button></div><div id="uList"></div>`);
 $("uOk").onclick=()=>{const t=$("uT").value.trim(),b=$("uC").value.trim();if(!t||!b){toast("Belum lengkap","Isi judul dan kodenya dulu.");return}
  const er=chkCode($("uL").value,b);if(er){codeErr(er);return}
  S.items.unshift({id:"i"+Date.now(),by:S.name,code:S.me,lang:$("uL").value,title:t,body:b,ts:Date.now()});save();storagePage();toast("Terunggah","Kodemu sekarang terlihat oleh semua orang.")};
 $("uList").innerHTML=[...S.items].sort((a,b)=>b.ts-a.ts).map(i=>itemCard(i,0)).join("")}
function starPage(){const L=S.items.filter(i=>S.stars.includes(i.id));
 page("Berbintang",`<p class="nt">Kode yang kamu beri bintang tersimpan di sini dan bisa disalin kapan saja.</p>`+(L.length?L.map(i=>itemCard(i,1)).join(""):`<div class="empty">Belum ada yang berbintang. Buka Storage lalu beri bintang pada kode yang kamu mau.</div>`))}
function profilePage(){
 page("Pengaturan profil",`<div class="pf"><div class="av big">${esc(ini(S.name))}</div><input id="pN" maxlength="24" value="${esc(S.name)}" placeholder="Nama kamu" autocomplete="off"><div class="cd">Kodemu: <b>${S.me}</b></div><button class="btn" id="pCp" style="background:var(--p2);margin-bottom:8px">Salin kodeku</button><button class="btn" id="pSv">Simpan profil</button></div>`);
 $("pCp").onclick=()=>{try{navigator.clipboard.writeText(S.me)}catch(e){}toast("Kode disalin",S.me)};
 $("pSv").onclick=()=>{S.name=$("pN").value.trim()||"Tamu";save();profilePage();toast("Tersimpan","Namamu sekarang "+S.name)}}
$("pgB").onclick=e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset,open=$("pgT").textContent;
 if(d.st){const i=S.stars.indexOf(d.st);i<0?S.stars.push(d.st):S.stars.splice(i,1);save();open=="Storage"?(()=>{const y=$("uList").innerHTML;drawStore()})():starPage()}
 else if(d.cp){const it=S.items.find(x=>x.id==d.cp);try{navigator.clipboard.writeText(it.body)}catch(e){}toast("Kode disalin",it.title)}
 else if(d.del){S.items=S.items.filter(x=>x.id!=d.del);S.stars=S.stars.filter(x=>x!=d.del);save();open=="Storage"?drawStore():starPage()}};
Object.assign(P,{key:"M8 14a4 4 0 1 1 3.9-5H21v3h-2v2h-3v-2h-4.1A4 4 0 0 1 8 14z",lock:"M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3",bell:"M6 17v-6a6 6 0 0 1 12 0v6l2 2H4zM10 21h4",kbd:"M3 7h18v10H3zM7 11h1M11 11h1M15 11h1M8 14h8",help:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.1",out:"M10 4H4v16h6M15 8l4 4-4 4M19 12H9"});
const ROWS=[["profil","user","Profil","Nama, foto profil, nama pengguna"],["akun","key","Akun","Notifikasi keamanan, info akun"],["priv","lock","Privasi","Kontak diblokir, pesan sementara"],["chat","chat","Chat","Tema, wallpaper, pengaturan obrolan"],["notif","bell","Notifikasi","Pesan, grup, suara"],["kbd","kbd","Pintasan keyboard","Tindakan cepat"],["help","help","Bantuan dan masukan","Pusat Bantuan, hubungi kami, Kebijakan Privasi"]];
const avt=()=>S.photo?`<img class="ph" src="${S.photo}" alt="Foto profil">`:esc(ini(S.name));
function rail(){const b=$("rMe");if(b)b.innerHTML=S.photo?`<img class="ph" src="${S.photo}" alt="Profil">`:I("user")}
function setPhoto(f){if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas"),m=Math.min(im.width,im.height);c.width=c.height=256;c.getContext("2d").drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,256,256);S.photo=c.toDataURL("image/jpeg",.8);save();rail();$("set").dataset.v=="p"?profileEdit():settingsPage()};im.src=r.result};r.readAsDataURL(f)}
function avBlock(){return `<div class="pavw"><div class="av big2">${avt()}</div><button class="cam2" id="stCam" aria-label="Ganti foto">${I("cam")}</button><input type="file" id="stF" accept="image/*" class="hide"></div>`}
function settingsPage(f){const s=$("set"),q=(f||"").toLowerCase();s.dataset.v="s";s.classList.remove("hide");
 const rows=ROWS.filter(r=>(r[2]+" "+r[3]).toLowerCase().includes(q));
 s.innerHTML=`<div class="sth"><button class="ib" id="stBk" aria-label="Kembali">←</button><h2>${esc(S.name)}</h2></div><div class="sr"><span>${I("search")}</span><input id="stQ" placeholder="Cari" value="${esc(f||"")}" autocomplete="off"></div><div class="stb">${avBlock()}${rows.map(r=>`<button class="srow" data-r="${r[0]}">${I(r[1])}<div><b>${r[2]}</b><small>${r[3]}</small></div></button>`).join("")}<button class="srow out" data-lo="1">${I("out")}<div><b>Logout</b></div></button></div>`;
 if(f!=null){const i=$("stQ");i.focus();i.setSelectionRange(i.value.length,i.value.length)}}
function profileEdit(){const s=$("set");s.dataset.v="p";
 s.innerHTML=`<div class="sth"><button class="ib" id="stBk" aria-label="Kembali">←</button><h2>Profil</h2></div><div class="stb">${avBlock()}<div class="pf2"><label>Nama</label><input id="pN" maxlength="24" value="${esc(S.name)}" autocomplete="off"><label>Tentang</label><input id="pA" maxlength="80" value="${esc(S.about||"")}" placeholder="Tulis sesuatu tentang kamu" autocomplete="off"><label>Kode teman (nama pengguna)</label><input value="${S.me}" readonly><button class="btn" id="pSv">Simpan profil</button></div></div>`}
$("set").onclick=e=>{const t=e.target.closest("button");if(!t)return;const s=$("set");
 if(t.id=="stBk"){s.dataset.v!="s"?settingsPage():s.classList.add("hide")}
 else if(t.id=="stCam")$("stF").click();
 else if(t.id=="pSv"){S.name=$("pN").value.trim()||"Tamu";S.about=$("pA").value.trim();save();settingsPage();toast("Tersimpan","Profilmu sudah diperbarui.")}
 else if(t.dataset.r=="profil")profileEdit();
 else if(t.dataset.r=="akun")subPage("akun");
 else if(t.dataset.r=="priv")subPage("priv");
 else if(t.dataset.r=="help")subPage2("help");
 else if(t.dataset.r=="notif")subPage2("notif");
 else if(t.dataset.nc){const n=nf();n[t.dataset.nc]=n[t.dataset.nc]?0:1;save();subPage2(t.dataset.pg,$("set").querySelector(".stb").scrollTop)}
 else if(t.dataset.hl=="2"){$("set").classList.add("hide");act("ai")}
 else if(t.dataset.hl)toast(t.querySelector("b").textContent,"Segera hadir.")
 else if(t.dataset.test)testNotif();
 else if(t.dataset.pv){const k=t.dataset.pv,o=OPT[k]||VIS,v=pvd();v[k]=o[(o.indexOf(v[k])+1)%o.length];save();subPage("priv",$("set").querySelector(".stb").scrollTop)}
 else if(t.dataset.tg){const v=pvd();v[t.dataset.tg]=v[t.dataset.tg]?0:1;save();subPage("priv",$("set").querySelector(".stb").scrollTop)}
 else if(t.dataset.r)toast(t.querySelector("b").textContent,"Segera hadir. Nanti bisa kamu atur di sini.");
 else if(t.dataset.lo){if(t.dataset.ok){try{localStorage.removeItem("wsc")}catch(x){}location.reload()}else{t.dataset.ok=1;t.querySelector("b").textContent="Ketuk lagi untuk keluar"}}};
$("set").oninput=e=>{if(e.target.id=="stQ")settingsPage(e.target.value)};
$("set").onchange=e=>{if(e.target.id=="stF")setPhoto(e.target.files[0])};
Object.assign(P,{shield:"M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z",info:"M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.1"});
Object.assign(P,{phone:"M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",bug:"M9 9h6v7a3 3 0 0 1-6 0zM9 9a3 3 0 0 1 6 0M4 12h5M15 12h5M5 6l3 2M19 6l-3 2M5 19l3-2M19 19l-3-2",flag:"M5 21V4h12l-2 4 2 4H5",flask:"M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"});
const nf=()=>S.nf||(S.nf={pesan:1,grup:1,status:1,tel:1,prev:1,suara:0,sync:0,beta:0});
function testNotif(){toast("Notifikasi uji coba","Begini tampilan notifikasi pesan di atas layar.");
 try{if("Notification" in window){if(Notification.permission=="granted")new Notification("Whatsschat",{body:"Notifikasi uji coba"});else if(Notification.permission!="denied")Notification.requestPermission()}}catch(e){}}
function subPage2(k,y){const s=$("set"),n=nf();s.classList.remove("hide");s.dataset.v="n";
 const sw=(key,pg)=>`<i class="sw ${n[key]?"on":""}"></i>`,hd=t=>`<div class="sth"><button class="ib" id="stBk" aria-label="Kembali">←</button><h2>${t}</h2></div>`;let h;
 if(k=="notif"){h=hd("Notifikasi")+`<div class="stb">${[["pesan","chat","Pesan"],["grup","user","Grup"],["status","story","Status"],["tel","phone","Telepon"]].map(r=>`<button class="prow" data-nc="${r[0]}" data-pg="notif">${I(r[1])}<div><b>${r[2]}</b><small>${n[r[0]]?"Aktif":"Nonaktif"}</small></div><span class="chev">›</span></button>`).join("")}<div class="psec"></div>`+[["prev","Tampilkan pratinjau","Pratinjau isi pesan teks di notifikasi pesan."],["suara","Putar suara untuk pesan keluar",""],["sync","Sinkronisasi latar belakang","Pesan lebih cepat masuk karena disinkronkan di latar belakang."]].map(r=>`<button class="prow" data-nc="${r[0]}" data-pg="notif"><div><b>${r[1]}</b>${r[2]?`<small>${r[2]}</small>`:""}</div>${sw(r[0])}</button>`).join("")+`<div class="prow"><div><b>Kirim notifikasi uji coba</b></div><button class="pill" data-test="1">Kirim</button></div><div class="nt" style="margin:14px 24px;font-size:12px">Agar notifikasi muncul, pastikan notifikasi diizinkan di pengaturan browser dan perangkatmu.</div></div>`}
 else{h=hd("Bantuan dan masukan")+`<div class="stb">${[["help","Pusat Bantuan","Pertanyaan umum"],["chat","Hubungi kami","Ngobrol dengan AI Whatsschat untuk mendapat jawaban"],["bug","Kirim masukan","Masalah teknis, saran."],["doc","Ketentuan dan Kebijakan Privasi",""],["flag","Laporkan chat",""]].map((r,i)=>`<button class="srow" data-hl="${i}">${I(r[0])}<div><b>${r[1]}</b>${r[2]?`<small>${r[2]}</small>`:""}</div></button>`).join("")}<div class="psec"></div><button class="prow" data-nc="beta" data-pg="help">${I("flask")}<div><b>Gabung ke versi beta</b><small>Dapatkan fitur baru sebelum dirilis. Laporkan bug lewat Kirim masukan.</small></div>${sw("beta")}</button><div class="cd" style="text-align:center;color:var(--mu);font-size:12px;padding:16px">Versi 3.6.0</div></div>`}
 s.innerHTML=h;if(y)s.querySelector(".stb").scrollTop=y}
Object.assign(P,{pen:"M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"});
const SC={},MEM={},SW=["#7a1520","#2a3b7a","#1f6b4a","#6b3a8a","#8a5a1a","#2b2b31"];
const alive=x=>Date.now()-x.ts<864e5;
function tf(ts){const d=new Date(ts),h=d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}).replace(":",".");return (d.toDateString()==new Date().toDateString()?"Hari ini pukul ":"Kemarin pukul ")+h}
const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open("wsc",1);r.onupgradeneeded=()=>r.result.createObjectStore("m");r.onsuccess=()=>res(r.result);r.onerror=()=>rej()});
async function mput(k,b){try{const d=await idb();d.transaction("m","readwrite").objectStore("m").put(b,k)}catch(e){}}
async function mget(k){try{const d=await idb();return await new Promise(r=>{const q=d.transaction("m").objectStore("m").get(k);q.onsuccess=()=>r(q.result);q.onerror=()=>r()})}catch(e){}}
async function mdel(k){try{const d=await idb();d.transaction("m","readwrite").objectStore("m").delete(k)}catch(e){}}
function purge(){const dead=S.st.filter(x=>!alive(x));if(dead.length){dead.forEach(x=>{mdel(x.id);delete MEM[x.id]});S.st=S.st.filter(alive);save()}}
function seedSt(){const n=Date.now();if(!S.st.some(x=>x.demo&&alive(x))){S.st.push({id:"d"+n,demo:1,by:"Rina",code:"rina2026",type:"text",text:"Selamat pagi! Semangat ya hari ini ☀️",bg:"#7a1520",ts:n-72e5},{id:"e"+n,demo:1,by:"Dimas",code:"dimas777",type:"text",text:"Ada kode bagus? Cek Storage ya.",bg:"#2a3b7a",ts:n-324e5});save()}}
S.st=S.st||[];S.seen=S.seen||[];purge();seedSt();
function groups(){const m={};S.st.filter(alive).forEach(x=>{(m[x.code]=m[x.code]||{code:x.code,by:x.by,mine:x.code==S.me,l:[]}).l.push(x)});return Object.values(m).map(g=>{g.l.sort((a,b)=>a.ts-b.ts);g.last=g.l[g.l.length-1].ts;g.un=g.l.some(x=>!S.seen.includes(x.id));return g})}
const unseenAny=()=>groups().some(g=>!g.mine&&g.un);
const MAXLOG=3;/* Update baru: taruh di PALING ATAS array LOG dan ubah VER. Hanya 3 teratas yang tampil, yang paling bawah otomatis tergantikan. */
const VER="3.6.0",LOG=[{v:"3.6.0",d:"23 November 2026",t:["Kode dipisah: index.html, css/style.css, dan js/script.js.","AI jalan di situs yang di-push lewat server Vercel (api/ai.js), kunci API aman di server.","Cache offline PWA diperbarui."]},{v:"3.5.0",d:"23 November 2026",t:["Fitur PWA: Whatsschat bisa dipasang ke layar utama HP lewat Chrome.","Bisa dibuka tanpa bar browser, dengan ikon aplikasi sendiri.","Tampilan dasar tetap bisa dibuka saat offline."]},{v:"3.4.0",d:"23 November 2026",t:["Storage: kode yang bukan kode ditolak, pesan peringatan muncul di tengah layar lalu coba lagi.","Storage: isi kode harus sesuai bahasa yang dipilih (HTML hanya HTML, Python hanya Python).","Menu Daftar siaran diganti menjadi Detail update.","Tab Pembaruan diganti nama menjadi Update dan punya detail update.","Nomor versi aplikasi menjadi 3.4.0."]}];
function updPage(){page("Detail update",`<p class="nt">Versi aplikasi saat ini: <b>${VER}</b>. Catatan perubahan dimulai dari versi 3.4.0.</p>`+LOG.slice(0,MAXLOG).map(l=>`<div class="it"><b>Versi ${l.v}</b><small>${l.d}</small><ul style="margin:10px 0 0;padding-left:20px;font-size:14px;line-height:1.6">${l.t.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`).join(""))}
function storyDraw(){purge();seedSt();const G=groups(),me=G.find(g=>g.mine),oth=G.filter(g=>!g.mine).sort((a,b)=>b.last-a.last),nw=oth.filter(g=>g.un),sn=oth.filter(g=>!g.un);
 const row=g=>`<button class="ch" data-sv="${g.code}"><div class="av ring ${g.un?"":"seen"}">${esc(ini(g.by))}</div><div class="mid"><div class="r1"><b>${esc(g.by)}</b></div><div class="r2"><span>${tf(g.last)}</span></div></div></button>`;
 $("stp").innerHTML=`<div class="sth"><h2 style="flex:1;padding-left:8px">Story</h2><button class="ib" data-sa="menu" aria-label="Tambah story">${I("plus")}</button></div><div class="pop hide" id="stMenu"><button data-sa="t">Story teks</button><button data-sa="m">Foto dan video</button></div><div class="stb"><button class="ch" data-upd="1"><div class="av">✦</div><div class="mid"><div class="r1"><b>Detail update</b></div><div class="r2"><span>Versi ${VER} · lihat fitur baru</span></div></div></button><button class="ch" data-sv="${S.me}"><div class="av ${me?"ring":""}" style="position:relative;overflow:visible"><span style="width:100%;height:100%;border-radius:50%;overflow:hidden;display:grid;place-items:center">${avt()}</span><i class="pb" data-sa="menu">+</i></div><div class="mid"><div class="r1"><b>Story saya</b></div><div class="r2"><span>${me?tf(me.last):"Ketuk untuk menambah story"}</span></div></div></button>${nw.length?`<div class="psec">Terbaru</div>`+nw.map(row).join(""):""}${sn.length?`<div class="psec">Telah dilihat</div>`+sn.map(row).join(""):""}${oth.length?"":`<div class="empty">Belum ada story dari orang lain.</div>`}</div>`;
 $("rdstory").classList.toggle("hide",!unseenAny())}
setInterval(()=>{if(view=="story"&&$("sv").classList.contains("hide"))storyDraw()},60000);
$("sh1").innerHTML=I("pen");$("sh2").innerHTML=I("cam");
function compose(m){SC.mode=m;SC.file=null;SC.bg=SW[0];$("scT").textContent=m=="text"?"Story teks":"Foto dan video";$("scTx").classList.toggle("hide",m!="text");$("scMd").classList.toggle("hide",m=="text");$("scTa").value="";$("scCap").value="";$("scPv").innerHTML="";$("scF").value="";$("scE").textContent="";swDraw();$("sc").classList.remove("hide")}
function swDraw(){$("scTa").style.background=SC.bg;$("scSw").innerHTML=SW.map(c=>`<button data-bg="${c}" style="background:${c};${c==SC.bg?"outline:2px solid #fff":""}" aria-label="Warna"></button>`).join("")}
const err=t=>{$("scE").textContent=t};
$("scSw").onclick=e=>{const b=e.target.closest("button");if(b){SC.bg=b.dataset.bg;swDraw()}};
$("scPick").onclick=()=>$("scF").click();$("scX").onclick=()=>$("sc").classList.add("hide");$("scOk").onclick=scPost;
$("scF").onchange=e=>{const f=e.target.files[0];if(!f)return;err("");SC.file=null;$("scPv").innerHTML="";
 if(f.type.startsWith("image/")){const im=new Image();im.onload=()=>{const c=document.createElement("canvas"),k=Math.min(1,960/Math.max(im.width,im.height));c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);SC.data=c.toDataURL("image/jpeg",.8);SC.kind="img";SC.file=f;$("scPv").innerHTML=`<img class="scp" src="${SC.data}" alt="Pratinjau">`};im.onerror=()=>err("Foto tidak bisa dibaca.");im.src=URL.createObjectURL(f)}
 else if(f.type.startsWith("video/")){const u=URL.createObjectURL(f),v=document.createElement("video");v.preload="metadata";v.onloadedmetadata=()=>{if(v.duration>20.5)err("Video terlalu panjang ("+Math.round(v.duration)+" detik). Maksimal 20 detik.");else{SC.kind="vid";SC.file=f;$("scPv").innerHTML=`<video class="scp" src="${u}" controls playsinline muted></video>`}};v.onerror=()=>err("Video tidak bisa dibaca.");v.src=u}
 else err("Pilih file foto atau video.")};
async function scPost(){if(S.st.filter(x=>x.code==S.me&&alive(x)).length>=30)return err("Maksimal 30 story aktif. Hapus salah satu dulu.");const id="st"+Date.now(),b={id,by:S.name,code:S.me,ts:Date.now()};
 if(SC.mode=="text"){const t=$("scTa").value.trim();if(!t)return err("Tulis sesuatu dulu.");b.type="text";b.text=t;b.bg=SC.bg}
 else{if(!SC.file)return err("Pilih foto atau video dulu.");b.cap=$("scCap").value.trim();if(SC.kind=="img"){b.type="img";b.img=SC.data}else{b.type="vid";MEM[id]=SC.file;await mput(id,SC.file)}}
 S.st.push(b);simViews(id);save();$("sc").classList.add("hide");view="story";render();toast("Story diposting","Hilang otomatis setelah 24 jam.")}
let VQ=[],VI=0,VT,VURL;
function openV_unused(){}
function closeV(){clearTimeout(VT);if(VURL){URL.revokeObjectURL(VURL);VURL=null}$("svBody").innerHTML="";$("sv").classList.add("hide");render()}
async function showV(i){clearTimeout(VT);if(i<0)return nextU(-1);if(i>=VQ.length)return nextU(1);VI=i;const x=VQ[i];$("svVw").classList.add("hide");
 if(!S.seen.includes(x.id)){S.seen.push(x.id);save()}
 $("svB").innerHTML=VQ.map((_,k)=>`<span><i style="width:${k<i?100:0}%"></i></span>`).join("");const bar=$("svB").children[i].firstChild;
 $("svN").textContent=x.code==S.me?"Story saya":x.by;$("svM").textContent=tf(x.ts);$("svA").innerHTML=x.code==S.me?avt():esc(ini(x.by));$("svD").classList.toggle("hide",x.code!=S.me);$("svE").classList.toggle("hide",x.code!=S.me);$("svEN").textContent=(x.views||[]).length;
 const go=ms=>{bar.style.transition="width "+ms+"ms linear";requestAnimationFrame(()=>requestAnimationFrame(()=>bar.style.width="100%"));VT=setTimeout(()=>showV(VI+1),ms)},body=$("svBody");
 if(x.type=="text"){body.innerHTML=`<div class="svtx" style="background:${x.bg}"><p>${esc(x.text)}</p></div>`;go(5000)}
 else if(x.type=="img"){body.innerHTML=`<img src="${x.img}" alt="Story">${x.cap?`<div class="svcap">${esc(x.cap)}</div>`:""}`;go(5000)}
 else{body.innerHTML="";const b=MEM[x.id]||await mget(x.id);if(VQ[VI]!==x)return;if(!b){body.innerHTML=`<div class="svtx"><p>Video tidak tersedia.</p></div>`;go(3000);return}
  if(VURL)URL.revokeObjectURL(VURL);VURL=URL.createObjectURL(b);const v=document.createElement("video");v.src=VURL;v.playsInline=true;body.appendChild(v);
  if(x.cap){const c=document.createElement("div");c.className="svcap";c.textContent=x.cap;body.appendChild(c)}
  v.ontimeupdate=()=>{if(v.duration)bar.style.width=(v.currentTime/v.duration*100)+"%"};v.onended=()=>showV(VI+1);v.onerror=()=>showV(VI+1);
  v.play().catch(()=>{v.muted=true;v.play().catch(()=>{})})}}
function openV(code){purge();const G=groups(),by=(a,b)=>b.last-a.last;VU=[...G.filter(g=>g.mine),...G.filter(g=>!g.mine&&g.un).sort(by),...G.filter(g=>!g.mine&&!g.un).sort(by)].map(g=>g.code);
 VQ=S.st.filter(x=>x.code==code&&alive(x)).sort((a,b)=>a.ts-b.ts);if(!VQ.length)return;const un=VQ.findIndex(x=>!S.seen.includes(x.id));$("sv").classList.remove("hide");showV(code==S.me||un<0?0:un)}
let VU=[];
function nextU(d){const c=VQ[0]?VQ[0].code:S.me,k=VU.indexOf(c)+d;if(k>=VU.length)return closeV();if(k<0)return showV(0);const q=S.st.filter(x=>x.code==VU[k]&&alive(x)).sort((a,b)=>a.ts-b.ts);if(!q.length)return closeV();VQ=q;showV(0)}
function simViews(id){const names=[...new Set(["Rina","Dimas",...S.chats.filter(c=>!c.ai).map(c=>c.name)])];names.forEach((n,i)=>setTimeout(()=>{const x=S.st.find(s=>s.id==id);if(!x)return;x.views=x.views||[];if(x.views.some(v=>v.n==n))return;x.views.push({n,ts:Date.now()});save();if(VQ[VI]&&VQ[VI].id==id)$("svEN").textContent=x.views.length},4000+i*6000+Math.random()*4000))}
$("svE").onclick=()=>{clearTimeout(VT);const v=$("svBody").querySelector("video");if(v)v.pause();const x=VQ[VI],L=x.views||[];$("svVn").textContent="Dilihat oleh "+L.length;
 $("svVl").innerHTML=L.length?L.map(w=>`<div class="vr"><div class="av" style="width:40px;height:40px;font-size:15px">${esc(ini(w.n))}</div><div><b>${esc(w.n)}</b><small>${tf(w.ts)}</small></div></div>`).join(""):`<div class="empty">Belum ada yang melihat story ini.</div>`;$("svVw").classList.remove("hide")};
$("svVx").onclick=()=>{$("svVw").classList.add("hide");showV(VI)};
$("svZ").onclick=e=>{const d=e.target.dataset.d;if(d)showV(VI+ +d)};$("svC").onclick=closeV;
$("svD").onclick=()=>{const x=VQ[VI];S.st=S.st.filter(s=>s.id!=x.id);mdel(x.id);delete MEM[x.id];save();VQ.splice(VI,1);VQ.length?showV(Math.min(VI,VQ.length-1)):closeV()};
document.addEventListener("click",e=>{if(e.target.closest("[data-upd]"))return updPage();const t=e.target.closest("[data-sa],[data-sv]"),mn=$("stMenu");
 if(!t){if(mn&&!e.target.closest("#stMenu"))mn.classList.add("hide");return}
 if(t.dataset.sa=="menu"){mn.classList.toggle("hide");return}
 if(mn)mn.classList.add("hide");
 if(t.dataset.sa)return compose(t.dataset.sa=="t"?"text":"media");
 const c=t.dataset.sv;if(c==S.me&&!S.st.some(x=>x.code==S.me&&alive(x)))return mn.classList.remove("hide");openV(c)});
const WEL='Halo! Aku AI Whatsschat. Kirim data, soal, atau ceritamu, nanti kubantu bedah, kasih solusi langkah demi langkah, sampai bikinin kode web. Ketuk 📎 untuk kirim file data (CSV, TXT, JSON).';
const ai=()=>S.ai||(S.ai={name:'AI Whatsschat',persona:'santai dan akrab seperti teman. Boleh pakai bahasa gaul atau Jawa kalau pengguna memakainya, tetap sopan dan tidak kasar.'});
{const a=S.chats.find(c=>c.ai);if(a){a.msgs=a.msgs.filter(m=>!m.pending&&!/belum tersambung|belum aktif/.test(m.t));if(!a.msgs.length)a.msgs.push({t:WEL,me:0,time:hm()});a.name=ai().name}}
const SYS=()=>`Kamu adalah ${ai().name}, asisten AI di aplikasi chat Whatsschat. Gaya bicara: ${ai().persona}\nBalas dalam bahasa yang dipakai pengguna (default bahasa Indonesia). Jawaban ringan cukup singkat; jawaban teknis boleh lebih panjang tapi rapi.\nKemampuanmu: (1) menganalisis data yang dikirim pengguna (nilai, absen, penjualan, data grup, isi file): tulis temuan dengan angka nyata dari data, masalah utama, penyebab yang mungkin, lalu solusi langkah demi langkah; jangan mengarang angka, dan kalau data kurang jelas tanyakan satu hal. (2) memberi solusi praktis, bukan hanya jawaban, misalnya masalah motor, masalah di grup, atau error kode. (3) membuat kode web lengkap dalam satu blok kode yang bisa langsung dijalankan, dan menjelaskan cara mengubahnya jadi APK (WebView, Capacitor, atau Kodular). (4) menjelaskan pelajaran TKJ dan membuat caption story. Untuk masalah antar teman, beri saran yang menenangkan dan tidak memanas-manasi. Format: **tebal** untuk poin penting, daftar bernomor atau bertanda -, kode di dalam blok kode. Kamu hanya melihat obrolan di chat ini dan file yang dikirim.`;
function md(s){const B=[];s=s.replace(/```(\w*)\n?([\s\S]*?)(```|$)/g,(_,l,c)=>{B.push(c);return '\u0000'+(B.length-1)+'\u0000'});s=esc(s);
 const inl=t=>t.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');let o='',li=null;const end=()=>{if(li){o+='</'+li+'>';li=null}};
 s.split('\n').forEach(L=>{let m;
  if(m=L.match(/^\u0000(\d+)\u0000$/)){end();const c=B[m[1]].replace(/\n$/,'');o+=`<div class='cb'><button class='cpb' data-c='${esc(c)}'>Salin</button><pre>${esc(c)}</pre></div>`}
  else if(m=L.match(/^\s*\d+\.\s+(.*)/)){if(li!='ol'){end();o+='<ol>';li='ol'}o+=`<li>${inl(m[1])}</li>`}
  else if(m=L.match(/^\s*[-*]\s+(.*)/)){if(li!='ul'){end();o+='<ul>';li='ul'}o+=`<li>${inl(m[1])}</li>`}
  else if(m=L.match(/^&gt;\s?(.*)/)){end();o+=`<blockquote>${inl(m[1])}</blockquote>`}
  else if(m=L.match(/^#{1,3}\s+(.*)/)){end();o+=`<p><b>${inl(m[1])}</b></p>`}
  else if(!L.trim())end();else{end();o+=`<p>${inl(L)}</p>`}});end();return `<div class='md'>${o}</div>`}
let AIP=0;
const AI_EP=window.AI_ENDPOINT||"api/ai";
async function srvAsk(raw){let r;try{r=await fetch(AI_EP,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:raw,persona:ai().persona})})}catch(e){throw{msg:"Tidak bisa terhubung ke server AI. Cek koneksi internetmu."}}
 const j=await r.json().catch(()=>({}));if(r.ok&&j.text)return{text:j.text};
 throw r.status==429?{code:"rate_limited"}:{msg:r.status==404||r.status==405?"Server AI belum dipasang. Deploy di Vercel dan isi ANTHROPIC_API_KEY (lihat README).":r.status==500?"Server AI belum punya kunci API. Isi ANTHROPIC_API_KEY di Vercel lalu redeploy.":r.status==413?"Pesan atau file terlalu besar. Potong dulu.":"AI sedang bermasalah. Coba kirim ulang."}}
async function askAI(c){if(AIP)return;const sm=window.claude?await Promise.race([window.claude.use('sample').catch(()=>null),new Promise(r=>setTimeout(()=>r(null),8000))]):null;
 const msgs=[];c.msgs.slice(-16).forEach(m=>{let t=m.t;if(m.data)t+='\n\n[Isi file '+m.fname+']\n'+m.data;const r=m.me?'user':'assistant',l=msgs[msgs.length-1];if(l&&l.role==r)l.content+='\n\n'+t;else msgs.push({role:r,content:t})});
 while(msgs.length&&msgs[0].role!='user')msgs.shift();if(!msgs.length)return;const raw=msgs.map(m=>({role:m.role,content:m.content}));msgs[0].content=SYS()+'\n\n---\n\n'+msgs[0].content;
 const ph={t:'Sedang mengetik...',me:0,time:hm(),pending:1};c.msgs.push(ph);draw(c);AIP=1;
 try{const r=sm?await sm(msgs,{cache:false,onText:({text})=>{ph.t=text;if(cur==c.id)draw(c)}}):await srvAsk(raw);ph.t=r.text||'(kosong)'}
 catch(e){ph.t=e&&e.msg?e.msg:e&&e.code=='not_granted'?'Izin AI belum diberikan. Kirim pesan lagi dan pilih Izinkan.':e&&e.code=='rate_limited'?'Terlalu cepat. Tunggu sebentar lalu coba lagi.':'AI sedang bermasalah. Coba kirim ulang.'}
 delete ph.pending;ph.time=hm();AIP=0;c.ts=Date.now();if(cur!=c.id){c.unread=(c.unread||0)+1;if(!c.arch&&nf().pesan)toast(c.name,nf().prev?ph.t.slice(0,80):'Pesan baru',c.id)}
 if(cur==c.id)draw(c);render()}
$('attB').onclick=()=>$('attF').click();
$('attF').onchange=async e=>{const f=e.target.files[0];e.target.value='';const c=S.chats.find(x=>x.id==cur);if(!f||!c||!c.ai)return;
 if(f.size>2e5){toast('File terlalu besar','Maksimal 200 KB. Potong datanya dulu.');return}
 const tx=(await f.text()).slice(0,30000);push(c,'📎 '+f.name+' ('+tx.split('\n').length+' baris)',1);const m=c.msgs[c.msgs.length-1];m.data=tx;m.fname=f.name;askAI(c)};
$('aiS').onclick=()=>{const a=ai();a.name=$('aiN').value.trim()||'AI Whatsschat';a.persona=$('aiP').value.trim()||a.persona;S.chats.find(x=>x.ai).name=a.name;save();$('aiOv').classList.add('hide');if(cur=='ai')$('cN').innerHTML=esc(a.name)+' <span class="vb">✓</span>';render();toast('Tersimpan','Kepribadian AI diperbarui.')};
$('aiX').onclick=()=>$('aiOv').classList.add('hide');
document.addEventListener('click',e=>{const t=e.target,ap=$('aiPop');
 if(t.closest('#aiK')){ap.classList.toggle('hide');return}
 if(!t.closest('#aiPop'))ap.classList.add('hide');
 const b=t.closest('[data-ai],[data-q],[data-c]');if(!b)return;
 if(b.hasAttribute('data-c')){try{navigator.clipboard.writeText(b.dataset.c)}catch(x){}b.textContent='Disalin';setTimeout(()=>{b.textContent='Salin'},1400)}
 else if(b.dataset.q){$('ta').value=b.dataset.q;$('ta').focus()}
 else if(b.dataset.ai=='persona'){$('aiN').value=ai().name;$('aiP').value=ai().persona;$('aiOv').classList.remove('hide')}
 else if(b.dataset.ai=='clear'){const c=S.chats.find(x=>x.ai);c.msgs=[{t:WEL,me:0,time:hm()}];if(cur=='ai')draw(c);render();toast('Riwayat dihapus','Chat AI dimulai dari awal.')}});
const LGX={
 HTML:t=>/^\s*(<!doctype\s+html|<!--|<[a-z][\w-]*(\s|>|\/))/i.test(t),
 CSS:t=>{t=t.replace(/\/\*[\s\S]*?\*\//g,'');return !/^\s*</.test(t)&&/(^|[{}])\s*[.#@*\w:](?:[^{};=\[]|\[[^\]]*\])*\{\s*[\w-]+\s*:[^{}]*\}/.test(t)},
 JavaScript:t=>!/^\s*</.test(t)&&!/<\?php/.test(t)&&/\b(function\s*\*?\s*[\w$]*\s*\(|(const|let|var)\s+[\w$]+\s*=|console\.\w+\(|document\.\w+|window\.\w+|require\(|module\.exports|addEventListener)|=>|\bexport\s+(default|const|function)\b|\bimport\s+.+\s+from\s+['"]/.test(t),
 Python:t=>!/(<\?php|#include|\bfunction\b|console\.|System\.out|\b(const|let|var)\b)/.test(t)&&/^\s*(def\s+\w+\s*\(.*\)\s*(->\s*[^:]+)?:|class\s+\w+\s*(\(.*\))?\s*:|from\s+[\w.]+\s+import\s+\w|import\s+[\w.]+(\s+as\s+\w+)?\s*$|print\s*\(|elif\s+.+:\s*$|else\s*:\s*$|try\s*:\s*$|except\b.*:\s*$|for\s+\w+\s+in\s+.+:\s*$|if\s+__name__\s*==|@\w+\s*$)/m.test(t),
 PHP:t=>/<\?php|<\?=|\$\w+\s*=\s*[^;\n]+;|\becho\s+["'$]/.test(t),
 Java:t=>/\b(public|private|protected)\s+(static\s+)?(final\s+)?(class|void|int|String)\b|System\.out\.print|\bimport\s+java\./.test(t),
 'C++':t=>/#include\s*[<"]|\bstd::|\bcout\s*<<|\bcin\s*>>|\bint\s+main\s*\(|using\s+namespace\s+std/.test(t),
 SQL:t=>/\b(SELECT[\s\S]+?FROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+(TABLE|DATABASE|VIEW|INDEX)|ALTER\s+TABLE|DROP\s+(TABLE|DATABASE))\b/.test(t)||(/;\s*$/m.test(t)&&/\b(select\b[\s\S]+?\bfrom|insert\s+into|update\s+\w+\s+set|delete\s+from|create\s+table|alter\s+table|drop\s+table)\b/i.test(t)),
 Bash:t=>/^#!.*\b(ba|z)?sh\b/.test(t)||/^\s*(sudo|apt-get|apt|npm|npx|pip3?|git|chmod|chown|curl|wget)\s+\w/m.test(t)||/^\s*(echo|cd|ls|mkdir|rm|cp|mv|cat|export|source|grep)\s+\S*[-.\/~$"'=]\S*/m.test(t),
 JSON:t=>{try{const v=JSON.parse(t);return !!v&&typeof v=='object'}catch(e){return false}}
};
function chkCode(l,t){const ok=k=>{try{return LGX[k](t)}catch(e){return false}};if(ok(l))return null;const f=Object.keys(LGX).filter(ok);
 if(!f.length)return{t:'Itu bukan kode',m:'Storage hanya menerima kode. Tempel kode '+l+' yang asli, lalu coba lagi.'};
 return{t:'Bukan kode '+l,m:'Isi yang kamu tempel terdeteksi sebagai '+f.join(' / ')+', bukan '+l+'. Ganti bahasanya atau tempel kode '+l+', lalu coba lagi.'}}
function codeErr(e){$('seT').textContent=e.t;$('seM').textContent=e.m;$('stErr').classList.remove('hide')}
$('seOk').onclick=()=>{$('stErr').classList.add('hide');const a=$('uC');if(a)a.focus()};
const VIS=["Semua orang","Kontak saya","Tidak ada"],OPT={timer:["Mati","24 jam","7 hari","90 hari"]};
const pvd=()=>S.pv||(S.pv={last:"Semua orang",foto:"Semua orang",about:"Kontak saya",status:"Kontak saya",read:1,timer:"Mati",grup:"Kontak saya",tel:"Semua orang",lock:0,block:0,ip:0,prev:0});
const PRIV=[["h","Siapa yang bisa melihat informasi pribadi saya"],["o","last","Terakhir dilihat dan online"],["o","foto","Foto profil"],["o","about","Tentang"],["o","status","Status"],["t","read","Tanda dibaca","Jika dimatikan, kamu tidak mengirim atau menerima tanda dibaca. Di chat grup, tanda dibaca tetap dikirim."],["h","Pesan sementara"],["o","timer","Timer pesan default"],["h","Interaksi"],["o","grup","Grup"],["o","tel","Telepon"],["t","lock","Kunci aplikasi","Minta kata sandi untuk membuka Whatsschat."],["h","Tingkat lanjut"],["t","block","Blokir pesan dari akun tak dikenal","Melindungi akunmu dengan memblokir pesan dari akun tak dikenal jika jumlahnya melewati batas tertentu."],["t","ip","Lindungi alamat IP saat menelepon","Panggilan diteruskan lewat server agar lokasimu tidak terlihat. Kualitas panggilan bisa berkurang."],["t","prev","Nonaktifkan pratinjau tautan","Pratinjau tautan di chat tidak dibuat, supaya alamat IP-mu tidak terdeteksi situs pihak ketiga."]];
function subPage(k,y){const s=$("set"),v=pvd();s.classList.remove("hide");let h;
 if(k=="akun"){s.dataset.v="a";h=`<div class="sth"><button class="ib" id="stBk" aria-label="Kembali">←</button><h2>Akun</h2></div><div class="stb">${[["shield","Notifikasi keamanan"],["doc","Minta info akun"],["info","Cara menghapus permanen akun saya"]].map((r,i)=>`<button class="srow" data-r="ak${i}">${I(r[0])}<div><b>${r[1]}</b></div></button>`).join("")}</div>`}
 else{s.dataset.v="v";h=`<div class="sth"><button class="ib" id="stBk" aria-label="Kembali">←</button><h2>Privasi</h2></div><div class="stb">${PRIV.map(r=>r[0]=="h"?`<div class="psec">${r[1]}</div>`:r[0]=="o"?`<button class="prow" data-pv="${r[1]}"><div><b>${r[2]}</b><small>${v[r[1]]}</small></div><span class="chev">›</span></button>`:`<button class="prow" data-tg="${r[1]}"><div><b>${r[2]}</b><small>${r[3]}</small></div><i class="sw ${v[r[1]]?"on":""}"></i></button>`).join("")}</div>`}
 s.innerHTML=h;if(y)s.querySelector(".stb").scrollTop=y}
rail();
render();
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
