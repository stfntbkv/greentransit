(function (GT) {
  const esc = GT.util.esc;
  const icon = GT.icon;

  const STATUS = {
    normal:  { label: "Нормално", badge: "ok",      icon: "check-circle",   pin: "p-ok" },
    warning: { label: "Внимание", badge: "warn",    icon: "alert-triangle", pin: "p-warn" },
    error:   { label: "Грешка",   badge: "error",   icon: "alert-octagon",  pin: "p-error" },
    offline: { label: "Офлайн",   badge: "offline", icon: "wifi-off",       pin: "p-offline" }
  };
  const SENSOR = {
    ok:      { badge: "ok",      icon: "check-circle" },
    warning: { badge: "warn",    icon: "alert-triangle" },
    error:   { badge: "error",   icon: "shield-alert" },
    offline: { badge: "offline", icon: "wifi-off" }
  };

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = String(html).trim();
    return t.content.firstElementChild;
  }
  function frag(html) {
    const t = document.createElement("template");
    t.innerHTML = String(html).trim();
    return t.content;
  }

  function badge(variant, text, iconName) {
    return `<span class="badge badge--${variant}">${iconName ? icon(iconName, { size: 13 }) : ""}${esc(text)}</span>`;
  }
  function statusBadge(status) {
    const m = STATUS[status] || STATUS.normal;
    return badge(m.badge, (m.label || status).toUpperCase(), m.icon);
  }

  function kpiCard(o) {
    const sub = `<div class="kpi__sub ${o.subDir || ""}">${o.subDir ? icon(o.subDir === "up" ? "bar-chart" : "bar-chart", { size: 13 }) : ""}${esc(o.sub || "")}</div>`;
    const help = o.help ? helpTip(o.help) : "";
    return `
      <div class="card kpi ${o.clickable ? "kpi--clickable" : ""}" ${o.id ? `data-kpi="${o.id}"` : ""} ${o.clickable ? 'tabindex="0" role="button"' : ""}>
        <div class="kpi__top">
          <span class="kpi__label">${esc(o.label)}</span>
          <span class="kpi__top-right">${help}<span class="kpi__icon">${icon(o.icon || "bar-chart", { size: 16 })}</span></span>
        </div>
        <div class="kpi__value ${o.active ? "is-active" : ""}">${o.value}</div>
        ${sub}
        ${o.clickable ? `<span class="kpi__chevron">${icon("chevron-right", { size: 16 })}</span>` : ""}
      </div>`;
  }

  function helpTip(text) {
    return `<span class="tip"><button class="help" aria-label="Обяснение" type="button">?</button><span class="tip__pop" role="tooltip">${esc(text)}</span></span>`;
  }

  function signal(phase) {
    const on = { red: "r", green: "g", yellow: "y", "flash-yellow": "y" };
    const lit = on[phase] || "y";
    const flash = phase === "flash-yellow" ? " blink" : "";
    return `<div class="signal${flash}" role="img" aria-label="Светофар: ${esc(phaseLabel(phase))}">
      <span class="lamp r ${lit === "r" ? "on" : ""}"></span>
      <span class="lamp y ${lit === "y" ? "on" : ""}"></span>
      <span class="lamp g ${lit === "g" ? "on" : ""}"></span>
    </div>`;
  }
  function phaseLabel(p) {
    return { red: "Червено", green: "Зелено", yellow: "Жълто", "flash-yellow": "Мигащо жълто" }[p] || p;
  }

  function buildRoads(items) {
    const pos = {}; items.forEach(i => { pos[i.id] = { x: i.mx, y: i.my }; });
    const seen = {}; let lines = "";
    items.forEach(i => (i.neighbors || []).forEach(nid => {
      if (!pos[nid]) return;
      const key = i.id < nid ? i.id + "|" + nid : nid + "|" + i.id;
      if (seen[key]) return; seen[key] = 1;
      const a = pos[i.id], b = pos[nid];
      lines += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`;
    }));
    return `<svg class="roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <g class="road-bg">${lines}</g><g class="road-fg">${lines}</g></svg>`;
  }

  function legendEl() {
    return el(`<div class="map__legend" aria-hidden="false">
      <span><i style="background:var(--ok)"></i>Нормално</span>
      <span><i style="background:var(--warn)"></i>Внимание</span>
      <span><i style="background:var(--err)"></i>Грешка</span>
      <span><i style="background:var(--offline)"></i>Офлайн</span>
    </div>`);
  }

  function mapView(items, opts) {
    opts = opts || {};
    const wrap = el(`<div class="map"></div>`);
    const canvas = el(`<div class="map__canvas ${opts.full ? "is-full" : ""}"></div>`);
    canvas.insertAdjacentHTML("beforeend", buildRoads(items));

    let pop = null;
    const closePop = () => { if (pop) { pop.remove(); pop = null; } };

    items.forEach(it => {
      const m = STATUS[it.status] || STATUS.normal;
      const hl = opts.highlight && opts.highlight.indexOf(it.id) > -1 ? " highlight" : "";
      const pin = el(`<button class="pin ${m.pin}${hl}" style="left:${it.mx}%;top:${it.my}%" aria-label="${esc(it.name)} - ${esc(m.label)}, ${it.load}%"></button>`);
      pin.addEventListener("click", e => {
        e.stopPropagation();
        if (opts.onPick) return opts.onPick(it, pin);
        closePop();
        pop = el(`<div class="map__pop" style="left:${it.mx}%;top:${it.my}%">
          <b>${esc(it.name)}</b><span class="m">${esc(m.label)} · ${it.load}% натоварване</span>
          <button class="btn btn--primary btn--sm" data-open="${it.id}">Отвори детайл</button>
        </div>`);
        pop.querySelector("[data-open]").addEventListener("click", () => { location.hash = "#/intersection/" + it.id; });
        canvas.appendChild(pop);
      });
      canvas.appendChild(pin);
    });
    canvas.addEventListener("click", closePop);
    wrap.appendChild(canvas);
    if (opts.legend !== false) wrap.appendChild(legendEl());
    return wrap;
  }

  GT.ui = GT.ui || {};
  Object.assign(GT.ui, {
    el, frag, esc, icon, badge, statusBadge, kpiCard, helpTip, signal, phaseLabel, mapView, legendEl,
    STATUS, SENSOR
  });
})(window.GT = window.GT || {});
