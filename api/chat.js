// Vercel Serverless Function: jembatan antara Whatsschat dan Groq API (kompatibel OpenAI).
// Kunci API disimpan di Vercel (Environment Variables), TIDAK di browser.
const hits = new Map();

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(500).json({ error: "GROQ_API_KEY belum diatur di Vercel" });

  // Batasi per IP: 15 permintaan per menit supaya kuota gratis tidak cepat habis
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "x";
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 60000);
  if (list.length >= 15) return res.status(429).json({ error: "Terlalu cepat" });
  list.push(now); hits.set(ip, list);

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const msgs = body && Array.isArray(body.messages) ? body.messages.slice(-16) : null;
  if (!msgs || !msgs.length) return res.status(400).json({ error: "Pesan kosong" });

  const messages = msgs.map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content || "").slice(0, 30000)
  }));

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": "Bearer " + key },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        messages,
        max_tokens: 1000
      })
    });
    const j = await r.json();
    if (!r.ok) {
      const code = r.status === 429 ? 429 : 502;
      return res.status(code).json({ error: (j.error && j.error.message) || "Gagal memanggil AI" });
    }
    const text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
    return res.status(200).json({ text: text || "(AI tidak memberi jawaban untuk pesan ini)" });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
};
