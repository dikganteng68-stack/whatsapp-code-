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

  // Model bawaan: pengganti resmi llama-3.3-70b-versatile. Kalau satu model ditolak, coba berikutnya.
  const models = [process.env.GROQ_MODEL, "openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"]
    .filter((m, i, a) => m && a.indexOf(m) === i);
  let lastErr = "Gagal memanggil AI", lastCode = 502;
  try {
    for (const model of models) {
      const payload = { model, messages, max_completion_tokens: 2000 };
      if (model.startsWith("openai/gpt-oss")) payload.reasoning_effort = "low"; // model "berpikir"; low = lebih cepat dan hemat kuota
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", "authorization": "Bearer " + key },
        body: JSON.stringify(payload)
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        const text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
        return res.status(200).json({ text: text.trim() || "(AI tidak memberi jawaban untuk pesan ini)" });
      }
      lastErr = (j.error && j.error.message) || lastErr;
      lastCode = r.status === 429 ? 429 : 502;
      // Hanya lanjut ke model berikutnya kalau modelnya yang bermasalah (tidak ada / dihentikan)
      const modelProblem = r.status === 404 || /does not exist|decommission|deprecat|not supported|no access/i.test(lastErr);
      if (!modelProblem) break;
    }
    return res.status(lastCode).json({ error: lastErr });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
};
