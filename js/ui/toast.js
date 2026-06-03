(function (GT) {
  const el = GT.ui.el, icon = GT.icon, esc = GT.util.esc;
  GT.ui.toast = function (message, opts) {
    opts = opts || {};
    const host = document.getElementById("toast-host");
    if (!host) return;
    const t = el(`<div class="toast ${opts.kind === "err" ? "is-err" : ""}" role="status">${icon(opts.icon || (opts.kind === "err" ? "alert-triangle" : "check-circle"), { size: 16 })}<span>${esc(message)}</span></div>`);
    host.appendChild(t);
    setTimeout(() => { t.style.transition = "opacity .25s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 250); }, opts.duration || 2600);
  };
})(window.GT = window.GT || {});
