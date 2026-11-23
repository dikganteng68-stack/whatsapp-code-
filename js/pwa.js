// Tombol "Pasang aplikasi" untuk PWA. Service worker didaftarkan di script.js (sw.js).
(() => {
  if (matchMedia("(display-mode: standalone)").matches || navigator.standalone) return;
  let ev = null, btn = null;
  const hideKey = "wsPwaHide";
  let hidden = false; try { hidden = localStorage.getItem(hideKey) === "1"; } catch (e) {}
  addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); ev = e; if (hidden) return;
    btn = document.createElement("button");
    btn.textContent = "📲 Pasang aplikasi";
    btn.setAttribute("style", "position:fixed;left:max(16px,env(safe-area-inset-left,0px));bottom:max(20px,calc(12px + env(safe-area-inset-bottom,0px)));z-index:8000;background:#e11d2e;color:#fff;border:0;border-radius:22px;padding:11px 18px;font:500 14px Roboto,system-ui,sans-serif;box-shadow:0 8px 24px #000a;cursor:pointer");
    btn.onclick = async () => { btn.remove(); ev.prompt(); try { await ev.userChoice; } catch (x) {} ev = null; };
    document.body.appendChild(btn);
  });
  addEventListener("appinstalled", () => { if (btn) btn.remove(); ev = null; });
})();
