// Fungsi server untuk AI Whatsschat (Vercel). Kunci API disimpan di Environment Variables, tidak pernah dikirim ke browser.
// Env: ANTHROPIC_API_KEY (wajib), ANTHROPIC_MODEL (opsional), ALLOWED_ORIGIN (opsional, pisahkan dengan koma).
const hits = new Map();
const LIMIT = 20, WINDOW = 10 * 60 * 1000;

const SYSTEM = persona => `Kamu adalah AI Whatsschat, asisten AI di aplikasi chat Whatsschat. Gaya bicara: ${persona || "santai dan akrab seperti teman, tetap sopan dan tidak kasar."}
Balas dalam bahasa yang dipakai pengguna (default bahasa Indonesia). Jawaban ringan cukup singkat; jawaban teknis boleh lebih panjang tapi rapi.
Kemampuanmu: (1) menganalisis data yang dikirim pengguna dengan angka nyata dari data, masalah utama, penyebab yang mungkin, lalu solusi langkah demi langkah; jangan mengarang angka, dan kalau data kurang jelas tanyakan satu hal. (2) memberi solusi praktis, bukan hanya jawaban. (3) membuat kode lengkap dalam blok kode yang bisa langsung dijalankan. (4) menjelaskan pelajaran TKJ dan membuat caption story. Untuk masalah antar teman, beri saran yang menenangkan dan tidak memanas-manasi.
Format: **tebal** untuk poin penting, daftar bernomor atau bertanda -, kode di dalam blok kode. Kamu hanya melihat obrolan di chat ini.`;

function cors(req, res) {
  const allow = (process.env.ALLOWED_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
  const origin = req.headers.origin || "";
  if (allow.length && !allow.includes(origin)) return false;
  res.setHeader("Access-Control-Allow-Origin", allow.length ? origin : "*");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  return true;
}

function limited(ip) {
  const now = Date.now(), a = (hits.get(ip) || []).filter(t => now - t < WINDOW);
  a.push(now); hits.set(ip, a);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < WINDOW)) hits.delete(k);
  return a.length > LIMIT;
}

module.exports = async (req, res) => {
  if (!cors(req, res)) return res.status(403).json({ error: "origin_not_allowed" });
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "no_key" });
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "?").split(",")[0].trim();
  if (limited(ip)) return res.status(429).json({ error: "rate_limited" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const raw = body && Array.isArray(body.messages) ? body.messages.slice(-16) : null;
  if (!raw || !raw.length) return res.status(400).json({ error: "bad_request" });

  const msgs = [];
  let total = 0;
  for (const m of raw) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string" || !m.content.trim()) continue;
    total += m.content.length;
    const last = msgs[msgs.length - 1];
    if (last && last.role === m.role) last.content += "\n\n" + m.content; else msgs.push({ role: m.role, content: m.content });
  }
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return res.status(400).json({ error: "bad_request" });
  if (total > 60000) return res.status(413).json({ error: "too_large" });
  const persona = typeof body.persona === "string" ? body.persona.slice(0, 300) : "";

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5", max_tokens: 1500, system: SYSTEM(persona), messages: msgs })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: "upstream", status: r.status });
    const text = (j.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    return res.status(200).json({ text: text || "(kosong)" });
  } catch (e) {
    return res.status(502).json({ error: "upstream" });
  }
};
