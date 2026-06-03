(function (GT) {
  const el = GT.ui.el, icon = GT.icon, esc = GT.util.esc;

  function trap(e, modal) {
    const f = modal.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(opts) {
    opts = opts || {};
    return new Promise(resolve => {
      const overlay = document.getElementById("overlay");
      const prevFocus = document.activeElement;
      const dismissible = opts.dismissible !== false;

      overlay.innerHTML = "";
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");

      const backdrop = el(`<div class="overlay__backdrop"></div>`);
      const modal = el(`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"></div>`);

      const head = el(`<div class="modal__head"></div>`);
      if (opts.icon) head.appendChild(el(`<span class="ico ${opts.iconKind || ""}">${icon(opts.icon, { size: 20 })}</span>`));
      head.appendChild(el(`<h2 id="modal-title">${esc(opts.title || "")}</h2>`));
      const closeBtn = el(`<button class="modal__close" type="button" aria-label="${esc(GT.t("common.close"))}">${icon("x", { size: 18 })}</button>`);
      head.appendChild(closeBtn);
      modal.appendChild(head);

      const body = el(`<div class="modal__body"></div>`);
      if (typeof opts.body === "string") body.innerHTML = opts.body;
      else if (opts.body) body.appendChild(opts.body);
      modal.appendChild(body);

      if (opts.actions && opts.actions.length) {
        const foot = el(`<div class="modal__foot stack"></div>`);
        opts.actions.forEach((a, i) => {
          const b = el(`<button class="btn ${a.variant || "btn--ghost"}" type="button">${a.icon ? icon(a.icon, { size: 18 }) : ""}${esc(a.label)}</button>`);
          if (a.disabled) b.disabled = true;
          b.addEventListener("click", () => {
            if (a.onClick && a.onClick(body) === false) return;
            done(a.value !== undefined ? a.value : i);
          });
          foot.appendChild(b);
        });
        modal.appendChild(foot);
      }
      if (opts.note) modal.appendChild(el(`<div class="modal__note">${esc(opts.note)}</div>`));

      overlay.appendChild(backdrop);
      overlay.appendChild(modal);

      function done(val) {
        document.removeEventListener("keydown", onKey, true);
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        overlay.innerHTML = "";
        if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) {} }
        resolve(val);
      }
      function onKey(e) {
        if (e.key === "Escape" && dismissible) { e.preventDefault(); done(null); }
        else if (e.key === "Tab") trap(e, modal);
      }
      closeBtn.addEventListener("click", () => done(null));
      if (dismissible) backdrop.addEventListener("click", () => done(null));
      document.addEventListener("keydown", onKey, true);

      setTimeout(() => {
        const f = modal.querySelector("input,textarea,select,.btn");
        (f || closeBtn).focus();
      }, 30);

      if (opts.onMount) opts.onMount(body, { close: done });
    });
  }

  function confirm(opts) {
    return open({
      title: opts.title, icon: opts.icon || "alert-triangle", iconKind: opts.iconKind || "danger",
      body: `<p class="muted">${esc(opts.message || "")}</p>`,
      note: opts.note,
      actions: [
        { label: opts.cancelLabel || GT.t("common.cancel"), value: false, variant: "btn--ghost" },
        { label: opts.confirmLabel || GT.t("common.confirm"), value: true, variant: opts.danger ? "btn--danger" : "btn--primary", icon: opts.confirmIcon }
      ]
    });
  }

  GT.ui.modal = { open, confirm };
})(window.GT = window.GT || {});
