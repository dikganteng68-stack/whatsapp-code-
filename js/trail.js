/* Efek seretan: garis merah-hitam saat layar digeser/diseret, lalu bunga berdarah yang meleleh di ujungnya. */
(() => {
  "use strict";
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = document.createElement("canvas");
  cv.id = "trail"; cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  const cx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  function fit() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + "px"; cv.style.height = H + "px";
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fit(); addEventListener("resize", fit);

  const segs = [], drips = [], blooms = [];
  let last = null, down = false, dist = 0, raf = 0, lastDrip = 0;
  const LIFE = 950, BLOOM_LIFE = 2400;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const skip = t => t && t.closest && t.closest("textarea,input,select");

  function start(x, y, t) { if (skip(t)) return; down = true; dist = 0; last = { x, y }; }
  function move(x, y) {
    if (!down || !last) return;
    const d = Math.hypot(x - last.x, y - last.y);
    if (d < 3) return;
    dist += d;
    const now = performance.now();
    segs.push({ x0: last.x, y0: last.y, x1: x, y1: y, t: now, w: Math.min(1.5, .6 + d / 36) });
    if (segs.length > 260) segs.shift();
    if (now - lastDrip > 70 && Math.random() < .45 && drips.length < 40) {
      lastDrip = now;
      drips.push({ x: x + rnd(-4, 4), y, len: 2, vy: rnd(.35, 1), w: rnd(1.6, 4), t: now, max: rnd(40, 110) });
    }
    last = { x, y }; kick();
  }
  function end() {
    if (down && last && dist > 70) {
      blooms.push({ x: last.x, y: last.y, t: performance.now(), rot: rnd(0, 6.28), R: rnd(24, 32), dripped: false });
      kick();
    }
    down = false; last = null;
  }

  function petal(R) {
    cx.beginPath();
    cx.moveTo(0, 0);
    cx.bezierCurveTo(R * .95, -R * .3, R * .75, -R * 1.5, 0, -R * 1.75);
    cx.bezierCurveTo(-R * .75, -R * 1.5, -R * .95, -R * .3, 0, 0);
    cx.closePath();
  }

  function drawBloom(b, now) {
    const p = (now - b.t) / BLOOM_LIFE;
    if (p >= 1) return false;
    const sc = Math.min(1, p * 3.2), ease = 1 - Math.pow(1 - sc, 3);
    const a = p < .55 ? 1 : 1 - (p - .55) / .45;
    cx.save(); cx.globalAlpha = a * .8; { const h = cx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.R * 2.6 * ease + 1); h.addColorStop(0, "rgba(0,0,0,.85)"); h.addColorStop(.65, "rgba(0,0,0,.55)"); h.addColorStop(1, "rgba(0,0,0,0)"); cx.fillStyle = h; cx.beginPath(); cx.arc(b.x, b.y, b.R * 2.6 * ease + 1, 0, 7); cx.fill(); }
    cx.globalAlpha = a; cx.translate(b.x, b.y); cx.rotate(b.rot); cx.scale(ease, ease);
    for (let k = 0; k < 6; k++) {
      cx.save(); cx.rotate(k * Math.PI / 3);
      const g = cx.createLinearGradient(0, 0, 0, -b.R * 1.75);
      g.addColorStop(0, "#080102"); g.addColorStop(.5, "#6e0818"); g.addColorStop(1, "#e01a38");
      petal(b.R); cx.fillStyle = g; cx.fill();
      cx.lineWidth = 1.6; cx.strokeStyle = "rgba(255,120,135,.85)"; cx.stroke();
      cx.restore();
    }
    cx.beginPath(); cx.arc(0, 0, b.R * .28, 0, 7); cx.fillStyle = "#050001"; cx.fill();
    cx.lineWidth = 1.5; cx.strokeStyle = "rgba(255,42,61,.9)"; cx.stroke();
    cx.restore();
    if (!b.dripped && p > .22) {
      b.dripped = true;
      for (let k = 0; k < 6; k++) {
        const ang = b.rot + k * Math.PI / 3, r = b.R * 1.6 * ease;
        drips.push({ x: b.x + Math.sin(ang) * r, y: b.y - Math.cos(ang) * r, len: 3, vy: rnd(.25, .7), w: rnd(3.4, 5.6), t: now, max: rnd(90, 190), big: true });
      }
    }
    return true;
  }

  function frame(now) {
    cx.clearRect(0, 0, W, H);
    cx.lineCap = "round"; cx.lineJoin = "round";
    while (segs.length && now - segs[0].t > LIFE) segs.shift();
    for (const s of segs) {
      const a = Math.pow(1 - (now - s.t) / LIFE, 1.3), w = s.w * (.5 + .5 * a);
      cx.beginPath(); cx.moveTo(s.x0, s.y0); cx.lineTo(s.x1, s.y1);
      cx.strokeStyle = "rgba(0,0,0," + (.78 * a) + ")"; cx.lineWidth = 22 * w; cx.stroke();
      cx.strokeStyle = "rgba(150,12,32," + (.95 * a) + ")"; cx.lineWidth = 11 * w; cx.stroke();
      cx.strokeStyle = "rgba(255,51,71," + (.95 * a) + ")"; cx.lineWidth = 4.2 * w; cx.stroke();
      cx.strokeStyle = "rgba(255,205,210," + (.7 * a) + ")"; cx.lineWidth = 1.4 * w; cx.stroke();
    }
    for (let i = blooms.length - 1; i >= 0; i--) if (!drawBloom(blooms[i], now)) blooms.splice(i, 1);
    for (let i = drips.length - 1; i >= 0; i--) {
      const d = drips[i], age = now - d.t, life = d.big ? 2600 : 2000;
      if (age > life) { drips.splice(i, 1); continue; }
      d.len = Math.min(d.max, d.len + d.vy * 1.1);
      const a = age < life * .55 ? 1 : 1 - (age - life * .55) / (life * .45);
      cx.globalAlpha = a;
      cx.beginPath(); cx.moveTo(d.x, d.y); cx.lineTo(d.x, d.y + d.len);
      cx.strokeStyle = "#8d0c1f"; cx.lineWidth = d.w; cx.stroke();
      cx.beginPath(); cx.moveTo(d.x - d.w * .2, d.y); cx.lineTo(d.x - d.w * .2, d.y + d.len);
      cx.strokeStyle = "rgba(255,60,80,.55)"; cx.lineWidth = Math.max(.8, d.w * .28); cx.stroke();
      cx.beginPath(); cx.arc(d.x, d.y + d.len, d.w * .95, 0, 7); cx.fillStyle = "#b01226"; cx.fill();
      cx.beginPath(); cx.arc(d.x - d.w * .3, d.y + d.len - d.w * .3, d.w * .3, 0, 7); cx.fillStyle = "rgba(255,200,205,.6)"; cx.fill();
      cx.globalAlpha = 1;
    }
    return segs.length || drips.length || blooms.length || down;
  }
  function loop(now) { raf = 0; if (frame(now)) raf = requestAnimationFrame(loop); else cx.clearRect(0, 0, W, H); }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }

  const o = { passive: true };
  addEventListener("mousedown", e => { if (e.button === 0) start(e.clientX, e.clientY, e.target); }, o);
  addEventListener("mousemove", e => { if (e.buttons & 1) move(e.clientX, e.clientY); else if (down) end(); }, o);
  addEventListener("mouseup", end, o);
  addEventListener("touchstart", e => { const t = e.touches[0]; if (t) start(t.clientX, t.clientY, e.target); }, o);
  addEventListener("touchmove", e => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); }, o);
  addEventListener("touchend", end, o);
  addEventListener("touchcancel", end, o);
})();
