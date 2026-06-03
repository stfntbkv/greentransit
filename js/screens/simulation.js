(function (GT) {
  const el = GT.ui.el, icon = GT.icon, t = GT.t, esc = GT.util.esc;

  GT.screens.simulation = (function () {
    const ui = { closures: new Set(), duration: "2", tod: "peak" };

    function render() {
      const inter = GT.data.intersections;
      const c = el(`<div class="screen">
        <div class="banner banner--sim sim-banner" style="margin-bottom:var(--s4)" role="status">
          ${icon("alert-triangle", { size: 18 })}<span>СИМУЛАЦИЯ - НЕ засяга реалните светофари</span>
        </div>

        <h1 class="screen__title">${esc(t("nav.simulation"))}</h1>
        <p class="screen__subtitle">Тествайте хипотетично затваряне на улица</p>

        <div class="card">
          <h2 class="card__title">${icon("map-pin", { size: 20 })}Затвори кръстовища</h2>
          <div class="sim-pick" id="sim-pick">
            ${inter.map(i => `<button type="button" class="sim-pick__opt" data-id="${i.id}" aria-pressed="${ui.closures.has(i.id)}">${esc(i.name)}</button>`).join("")}
          </div>
        </div>

        <div class="card">
          <div class="field" style="margin:0 0 var(--s3)">
            <label for="sim-dur">Продължителност</label>
            <select class="select" id="sim-dur"><option value="1">1 час</option><option value="2">2 часа</option><option value="4">4 часа</option></select>
          </div>
          <div class="field" style="margin:0">
            <label for="sim-tod">Натовареност (исторически данни)</label>
            <select class="select" id="sim-tod"><option value="peak">Пиков час</option><option value="offpeak">Извън пик</option><option value="night">Нощ</option></select>
          </div>
        </div>

        <button class="btn btn--primary" id="sim-run" style="background:linear-gradient(180deg,#fb8c3a,#ea6a12);color:#3a1700">${icon("play", { size: 18 })}Стартирай симулация</button>

        <div class="sim-result" id="sim-result"></div>

        ${savedHtml()}
      </div>`);

      c.querySelector("#sim-dur").value = ui.duration;
      c.querySelector("#sim-tod").value = ui.tod;
      c.querySelectorAll("[data-id]").forEach(b => b.addEventListener("click", () => {
        const id = b.dataset.id;
        ui.closures.has(id) ? ui.closures.delete(id) : ui.closures.add(id);
        b.setAttribute("aria-pressed", ui.closures.has(id));
      }));
      c.querySelector("#sim-dur").addEventListener("change", e => ui.duration = e.target.value);
      c.querySelector("#sim-tod").addEventListener("change", e => ui.tod = e.target.value);
      c.querySelector("#sim-run").addEventListener("click", () => run(c));
      wireSaved(c);
      return c;
    }

    function run(root) {
      if (!ui.closures.size) { GT.ui.toast("Изберете поне едно кръстовище.", { kind: "err" }); return; }
      const btn = root.querySelector("#sim-run");
      btn.disabled = true; btn.innerHTML = icon("refresh", { size: 18 }) + "Изчисляване...";

      setTimeout(() => {
        btn.disabled = false; btn.innerHTML = icon("play", { size: 18 }) + "Стартирай отново";
        const closed = [...ui.closures].map(id => GT.data.intersectionById(id));
        const affected = {};
        closed.forEach(ci => ci.neighbors.forEach(nid => {
          const factor = ui.tod === "peak" ? 1 : ui.tod === "offpeak" ? 0.6 : 0.3;
          affected[nid] = Math.min(99, (affected[nid] || GT.data.intersectionById(nid).load) + Math.round((14 + Math.random() * 16) * factor));
        }));
        const items = GT.data.intersections.map(i => {
          const sim = Object.assign({}, i);
          if (ui.closures.has(i.id)) sim.status = "offline";
          else if (affected[i.id] != null) { sim.load = affected[i.id]; sim.status = affected[i.id] >= 85 ? "error" : affected[i.id] >= 60 ? "warning" : "normal"; }
          return sim;
        });

        const res = root.querySelector("#sim-result");
        res.classList.add("show");
        res.innerHTML = `<div class="card" style="border-color:var(--sim)">
          <h2 class="card__title" style="color:var(--sim)">${icon("sim", { size: 20 })}Резултат от симулацията</h2>
          <div id="sim-map"></div>
          <h3 style="font-size:var(--fs-cap);color:var(--text-2);margin:var(--s4) 0 var(--s2)">Очаквано натоварване на съседните кръстовища</h3>
          <div class="list">${Object.keys(affected).length ? Object.keys(affected).map(nid => {
            const n = GT.data.intersectionById(nid), base = n.load, now = affected[nid], d = now - base;
            return `<div class="list-row"><span class="list-row__body"><span class="list-row__title" style="font-weight:500">${esc(n.name)}</span></span>
              <span class="mono">${base}% → <b style="color:${now >= 85 ? "var(--err)" : "var(--warn)"}">${now}%</b> <span class="delta-up">(+${d}%)</span></span></div>`;
          }).join("") : `<p class="muted-3">Няма съседни кръстовища за избора.</p>`}</div>
          <div class="banner banner--info" style="margin-top:var(--s4)">${icon("cpu", { size: 18 })}<span>AI препоръчва: временно удължаване на зелената фаза по обходните булеварди и пренасочване към ${esc(closed[0].neighbors.map(n => GT.data.intersectionById(n).name)[0] || "съседните възли")}.</span></div>
          <div class="row" style="gap:var(--s2);margin-top:var(--s4)">
            <button class="btn btn--sm btn--ghost" id="sim-save">${icon("download", { size: 14 })}Запази сценарий</button>
          </div>
        </div>`;
        const mapWrap = el(`<div></div>`);
        mapWrap.appendChild(GT.ui.mapView(items, { highlight: [...ui.closures], legend: true }));
        res.querySelector("#sim-map").appendChild(mapWrap);
        res.querySelector("#sim-save").addEventListener("click", () => saveScenario(root, closed));
        res.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 1300);
    }

    function saveScenario(root, closed) {
      const name = "Затваряне: " + closed.map(c => c.name).join(", ").slice(0, 40);
      GT.state._.simulation.savedScenarios.unshift({ id: "s" + Date.now(), name, duration: ui.duration, tod: ui.tod, when: GT.util.hhmm() });
      GT.ui.toast("Сценарият е запазен");
      const host = root.querySelector("#saved-wrap");
      if (host) { host.outerHTML = savedHtml(); wireSaved(root); }
    }

    function savedHtml() {
      const s = GT.state._.simulation.savedScenarios;
      if (!s.length) return `<div id="saved-wrap"></div>`;
      return `<div class="card" id="saved-wrap"><h2 class="card__title">${icon("history", { size: 20 })}Запазени сценарии</h2>
        <div class="list">${s.map(x => `<div class="list-row">
          <span class="list-row__body"><span class="list-row__title">${esc(x.name)}</span><span class="list-row__meta">${esc(x.when)} · ${esc(x.duration)} ч</span></span>
          <button class="btn btn--sm btn--ghost" data-cmp="${x.id}">Сравни</button></div>`).join("")}</div></div>`;
    }
    function wireSaved(root) {
      root.querySelectorAll("[data-cmp]").forEach(b => b.addEventListener("click", () => {
        GT.ui.modal.open({
          title: "Сравнение: прогноза vs реалност", icon: "bar-chart", iconKind: "accent",
          body: `<div class="card"><div class="kv"><span class="k">Прогнозирано забавяне</span><span class="v">+4.2 мин</span></div>
            <div class="kv"><span class="k">Реално забавяне</span><span class="v" style="color:var(--ok)">+3.8 мин</span></div>
            <div class="kv"><span class="k">Точност на модела</span><span class="v" style="color:var(--ok)">91%</span></div></div>
            <p class="muted" style="margin-top:var(--s3);font-size:var(--fs-cap)">Демонстрационни данни за сравнение след реално затваряне.</p>`,
          actions: [{ label: t("common.close"), value: true, variant: "btn--ghost" }]
        });
      }));
    }

    return { render };
  })();
})(window.GT = window.GT || {});
