// AI Whatsschat. Memanggil fungsi server /api/ai (lihat api/ai.js). Kunci API tidak ada di browser.
(() => {
  const EP = window.AI_ENDPOINT || "api/ai", KEY = "wsAiHist", MAXH = 16;
  let hist = [], busy = false;
  try { hist = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(hist.slice(-40))); } catch (e) {} };
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.textContent = h; return e; };
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const WEL = "Halo! Aku AI Whatsschat. Kirim data, soal, atau ceritamu, nanti kubantu bedah, kasih solusi langkah demi langkah, sampai bikinin kode web. Ketuk 📎 untuk kirim file data (CSV, TXT, JSON).";

  function md(s) {
    const B = [];
    s = s.replace(/```(\w*)\n?([\s\S]*?)(```|$)/g, (_, l, c) => { B.push(c); return "\u0000" + (B.length - 1) + "\u0000"; });
    s = esc(s);
    const inl = t => t.replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    let o = "", li = null; const end = () => { if (li) { o += "</" + li + ">"; li = null; } };
    s.split("\n").forEach(L => {
      let m;
      if (m = L.match(/^\u0000(\d+)\u0000$/)) { end(); o += `<div class="ai-cb"><button class="ai-cp" data-i="${m[1]}">Salin</button><pre>${esc(B[m[1]].replace(/\n$/, ""))}</pre></div>`; }
      else if (m = L.match(/^\s*\d+\.\s+(.*)/)) { if (li != "ol") { end(); o += "<ol>"; li = "ol"; } o += `<li>${inl(m[1])}</li>`; }
      else if (m = L.match(/^\s*[-*]\s+(.*)/)) { if (li != "ul") { end(); o += "<ul>"; li = "ul"; } o += `<li>${inl(m[1])}</li>`; }
      else if (m = L.match(/^#{1,3}\s+(.*)/)) { end(); o += `<p><b>${inl(m[1])}</b></p>`; }
      else if (!L.trim()) end(); else { end(); o += `<p>${inl(L)}</p>`; }
    });
    end();
    return { html: o, blocks: B };
  }

  const fab = el("button", "ai-fab", "✦"); fab.setAttribute("aria-label", "Buka AI Whatsschat"); fab.title = "AI Whatsschat";
  const pn = el("div", "ai-pn"); pn.hidden = true; pn.setAttribute("role", "dialog"); pn.setAttribute("aria-label", "AI Whatsschat");
  const hd = el("div", "ai-hd");
  const av = el("div", "ai-av", "✦"), tt = el("div", "ai-t"); tt.innerHTML = "<b>AI Whatsschat</b><small>Asisten AI · bisa menganalisis data</small>";
  const clr = el("button", "ai-x", "🗑"); clr.title = "Hapus riwayat"; clr.setAttribute("aria-label", "Hapus riwayat");
  const cls = el("button", "ai-x", "✕"); cls.setAttribute("aria-label", "Tutup");
  hd.append(av, tt, clr, cls);
  const ms = el("div", "ai-ms"), qk = el("div", "ai-qk");
  [["Analisis data", "Aku punya data nilai siswa, bantu analisis dan kasih solusinya."], ["Bikin kode web", "Buatkan web kamus lengkap dalam satu file HTML."], ["Caption story", "Buatkan 5 caption story yang keren dan singkat."], ["Masalah grup", "Ada masalah di grup, aku bingung cara membalasnya."]]
    .forEach(([a, q]) => { const b = el("button", "", a); b.onclick = () => { ta.value = q; ta.focus(); }; qk.appendChild(b); });
  const row = el("div", "ai-in"), at = el("button", "ai-at", "📎"); at.setAttribute("aria-label", "Kirim file data");
  const fi = el("input"); fi.type = "file"; fi.hidden = true; fi.accept = ".txt,.csv,.tsv,.json,.md,.js,.html,.css,.py,.sql,.log";
  const ta = el("textarea"); ta.rows = 1; ta.placeholder = "Ketik pesan..."; ta.setAttribute("aria-label", "Pesan untuk AI");
  const sd = el("button", "ai-send", "➤"); sd.setAttribute("aria-label", "Kirim");
  row.append(at, fi, ta, sd);
  pn.append(hd, ms, qk, row);

  function bubble(m) {
    const b = el("div", "ai-m" + (m.me ? " me" : "") + (m.err ? " err" : ""));
    if (m.me || m.err) b.textContent = m.t;
    else { const r = md(m.t); b.innerHTML = r.html; b.querySelectorAll(".ai-cp").forEach(x => x.onclick = () => { try { navigator.clipboard.writeText(r.blocks[x.dataset.i].replace(/\n$/, "")); } catch (e) {} x.textContent = "Disalin"; setTimeout(() => x.textContent = "Salin", 1400); }); }
    return b;
  }
  function draw() { ms.replaceChildren(bubble({ t: WEL })); hist.forEach(m => ms.appendChild(bubble(m))); ms.scrollTop = 1e9; }

  const ERR = { 429: "Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi.", 404: "Server AI belum dipasang. Pasang api/ai.js di Vercel dan isi ANTHROPIC_API_KEY (lihat README).", 405: "Server AI belum dipasang. Pasang api/ai.js di Vercel dan isi ANTHROPIC_API_KEY (lihat README).", 500: "Server AI belum punya kunci API. Isi ANTHROPIC_API_KEY di Vercel lalu redeploy.", 413: "Pesan atau file terlalu besar. Potong dulu." };
  async function send(text, extra) {
    if (busy) return; busy = true; sd.disabled = true;
    hist.push({ t: text, me: 1, data: extra }); save(); draw();
    const wait = el("div", "ai-m"); wait.innerHTML = '<span class="ai-dots"><span></span><span></span><span></span></span>'; ms.appendChild(wait); ms.scrollTop = 1e9;
    const msgs = hist.filter(m => !m.err).slice(-MAXH).map(m => ({ role: m.me ? "user" : "assistant", content: m.me && m.data ? m.t + "\n\n[Isi file]\n" + m.data : m.t }));
    let out;
    try {
      const r = await fetch(EP, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: msgs, persona: localStorage.getItem("wsAiPersona") || "" }) });
      const j = await r.json().catch(() => ({}));
      out = r.ok && j.text ? { t: j.text } : { t: ERR[r.status] || "AI sedang bermasalah. Coba kirim ulang.", err: 1 };
    } catch (e) { out = { t: "Tidak bisa terhubung ke server AI. Cek koneksi internetmu.", err: 1 }; }
    hist.push(out); if (out.err) { /* tidak disimpan permanen */ } save(); busy = false; sd.disabled = false; draw();
  }
  const go = () => { const t = ta.value.trim(); if (!t) return; ta.value = ""; ta.style.height = ""; send(t); };
  sd.onclick = go;
  ta.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey && innerWidth > 820) { e.preventDefault(); go(); } };
  ta.oninput = () => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 120) + "px"; };
  at.onclick = () => fi.click();
  fi.onchange = async () => {
    const f = fi.files[0]; fi.value = ""; if (!f) return;
    if (f.size > 2e5) { hist.push({ t: "File terlalu besar. Maksimal 200 KB.", err: 1 }); draw(); return; }
    const tx = (await f.text()).slice(0, 30000); send("📎 " + f.name + " (" + tx.split("\n").length + " baris)", tx);
  };
  clr.onclick = () => { hist = []; save(); draw(); };
  const open = () => { pn.hidden = false; fab.hidden = true; draw(); setTimeout(() => ta.focus(), 50); };
  const shut = () => { pn.hidden = true; fab.hidden = false; };
  fab.onclick = open; cls.onclick = shut;
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !pn.hidden) shut(); });
  hist = hist.filter(m => !m.err);
  document.body.append(fab, pn);
})();
