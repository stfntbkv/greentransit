(function (GT) {
  const el = GT.ui.el, icon = GT.icon, t = GT.t, esc = GT.util.esc;

  GT.screens = GT.screens || {};
  GT.flows = GT.flows || {};

  const TABS = [
    { id: "dashboard",  icon: "dashboard",  key: "nav.dashboard" },
    { id: "network",    icon: "network",    key: "nav.network" },
    { id: "signals",    icon: "signals",    key: "nav.signals", badge: () => GT.state.activeSignalsCount() },
    { id: "ai",         icon: "ai",         key: "nav.ai" },
    { id: "simulation", icon: "sim",        key: "nav.simulation" },
    { id: "menu",       icon: "menu",       key: "nav.menu" }
  ];

  function activeTab() {
    const h = (location.hash || "").replace(/^#\//, "").split("/")[0];
    if (h === "intersection") return "network";
    if (h === "audit") return "menu";
    return h || "dashboard";
  }

  function renderTop() {
    const host = document.getElementById("topbar");
    if (!host) return;
    if (!GT.state.session) { host.innerHTML = ""; return; }

    const u = GT.state.session;
    const roleMeta = GT.data.roles[u.role];
    const unread = GT.state.unreadCount();

    const row = el(`<div class="topbar"></div>`);
    row.innerHTML = `
      <button class="topbar__brand" data-go="dashboard" aria-label="${esc(t("nav.dashboard"))}">
        <img src="assets/logo.svg" alt="" />
      </button>
      <span class="user-chip">
        <span class="user-chip__meta"><span class="name">${esc(u.name)}</span></span>
        <span class="badge badge--${roleMeta.badge}">${esc(roleMeta.label)}</span>
      </span>
      <span class="topbar__actions">
        <button class="emergency-btn" data-emergency aria-label="${esc(t("top.emergency"))} - Зелен коридор">
          ${icon("shield-alert", { size: 16 })}<span>${esc(t("top.emergency"))}</span>
        </button>
        <button class="icon-btn" data-bell aria-label="${esc(t("top.notifications"))} (${unread})" aria-haspopup="true">
          ${icon("bell", { size: 22 })}${unread ? `<span class="badge-count">${unread}</span>` : ""}
        </button>
      </span>`;
    host.innerHTML = "";
    host.appendChild(row);
    const pills = el(`<div id="mode-pills"></div>`);
    host.appendChild(pills);
    renderPills(pills);

    row.querySelector("[data-go]").addEventListener("click", () => location.hash = "#/dashboard");
    row.querySelector("[data-emergency]").addEventListener("click", () => {
      if (GT.flows && GT.flows.greenCorridor) GT.flows.greenCorridor();
    });
    row.querySelector("[data-bell]").addEventListener("click", e => { e.stopPropagation(); toggleNotifications(); });
  }

  function renderPills(container) {
    const modes = GT.state.activeModes;
    container.innerHTML = "";
    modes.forEach(m => {
      const cls = m.type === "green" ? "is-green" : "is-manual";
      const action = m.type === "green" ? t("top.cancelCorridor") : t("top.returnAI");
      const pill = el(`<div class="mode-pill ${cls}" role="status">
        ${icon(m.type === "green" ? "zap" : "power", { size: 16 })}
        <span>${esc(m.label)}</span>
        <span class="time">${GT.util.mmss(m.remaining)}</span>
        <button type="button" data-end="${m.id}">${esc(action)}</button>
      </div>`);
      pill.querySelector("[data-end]").addEventListener("click", () => {
        if (GT.flows && GT.flows.endMode) GT.flows.endMode(m);
      });
      container.appendChild(pill);
    });
  }

  function updatePills() {
    const c = document.getElementById("mode-pills");
    if (c) renderPills(c);
  }

  function renderNav() {
    const host = document.getElementById("bottomnav");
    if (!host) return;
    if (!GT.state.session) { host.innerHTML = ""; return; }
    const cur = activeTab();
    host.innerHTML = "";
    TABS.forEach(tab => {
      const n = tab.badge ? tab.badge() : 0;
      const b = el(`<button class="navtab ${cur === tab.id ? "is-active" : ""}" role="tab" aria-selected="${cur === tab.id}" data-tab="${tab.id}">
        ${icon(tab.icon, { size: 22 })}<span>${esc(t(tab.key))}</span>
        ${n ? `<span class="badge-count">${n}</span>` : ""}
      </button>`);
      b.addEventListener("click", () => location.hash = "#/" + tab.id);
      host.appendChild(b);
    });
  }

  let ddOpen = false;
  function toggleNotifications() { ddOpen ? closeNotifications() : openNotifications(); }
  function closeNotifications() {
    ddOpen = false;
    document.getElementById("dropdown-host").innerHTML = "";
    document.removeEventListener("click", outsideClose, true);
  }
  function outsideClose(e) {
    const dd = document.querySelector(".dropdown");
    if (dd && !dd.contains(e.target) && !e.target.closest("[data-bell]")) closeNotifications();
  }
  function openNotifications() {
    ddOpen = true;
    const host = document.getElementById("dropdown-host");
    const items = GT.state.notifications;
    const unread = GT.state.unreadCount();
    const list = items.map(n => {
      const variant = GT.data.notifTypeBadge[n.type] || "info";
      return `<button class="notif ${n.read ? "" : "unread"}" data-notif="${n.id}">
        <span class="notif__icon badge--${variant}">${icon(n.icon || "info", { size: 16 })}</span>
        <span class="notif__body-wrap">
          <span class="notif__title">${esc(n.title)}</span>
          <span class="notif__body">${esc(n.body)}</span>
          <span class="notif__time">${esc(n.ts)} · ${esc(n.ageLabel)}</span>
        </span>
      </button>`;
    }).join("");

    const dd = el(`<div class="dropdown" role="dialog" aria-label="${esc(t("top.notifications"))}">
      <div class="dropdown__head">
        <b>${esc(t("top.notifications"))}</b>
        <span class="row" style="gap:8px">
          <span class="badge badge--neutral">${unread} нови</span>
          <button class="btn btn--sm btn--ghost" data-readall>Маркирай всички</button>
        </span>
      </div>
      <div class="dd-list">${list || `<div class="empty">Няма известия</div>`}</div>
      <div class="dropdown__foot"><a href="#/signals" data-seeall>Виж всички инциденти</a></div>
    </div>`);
    host.innerHTML = "";
    host.appendChild(dd);

    dd.querySelector("[data-readall]").addEventListener("click", () => {
      GT.state.notifications.forEach(n => n.read = true); GT.state.emit(); openNotifications();
    });
    dd.querySelectorAll("[data-notif]").forEach(b => b.addEventListener("click", () => {
      const n = GT.state.notifications.find(x => x.id === b.dataset.notif);
      if (n) { n.read = true; GT.state.emit(); }
      closeNotifications();
      if (n && n.intersectionId) location.hash = "#/intersection/" + n.intersectionId;
    }));
    dd.querySelector("[data-seeall]").addEventListener("click", e => { e.preventDefault(); closeNotifications(); location.hash = "#/signals"; });

    setTimeout(() => document.addEventListener("click", outsideClose, true), 0);
  }

  function render() { renderTop(); renderNav(); }
  function init() {
    GT.state.subscribe(() => { if (GT.state.session) render(); });
    document.addEventListener("gt:tick", updatePills);
  }

  GT.shell = { render, init, closeNotifications };
})(window.GT = window.GT || {});
