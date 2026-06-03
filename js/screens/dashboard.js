(function (GT) {
  const el = GT.ui.el, icon = GT.icon, t = GT.t, esc = GT.util.esc, k = GT.ui.kpiCard;

  GT.screens.dashboard = (function () {
    function render() {
      const d = GT.data.dashboardKpis;
      const signals = GT.state.activeSignalsCount();
      const offline = GT.data.intersections.filter(i => i.status === "offline").length;
      const loadDir = d.avgLoad.value >= d.avgLoad.yesterday ? "up" : "down";

      const c = el(`<div class="screen">
        <div class="screen__head">
          <h1 class="screen__title">${esc(t("dash.title"))}</h1>
          <span class="online-dot">${esc(t("top.online"))}</span>
        </div>

        <div class="grid-2 grid-2--kpi" id="kpis">
          ${k({ id: "connected", label: t("dash.kpi.connected"), icon: "check-circle", value: d.connected.value, sub: d.connected.sub, clickable: true })}
          ${k({ id: "load", label: t("dash.kpi.load"), icon: "bar-chart", value: d.avgLoad.value + "%", sub: t("dash.vsYesterday", { n: d.avgLoad.yesterday }), subDir: loadDir, clickable: true })}
          ${k({ id: "signals", label: t("dash.kpi.signals"), icon: "shield-alert", value: signals, sub: d.signals.sub, clickable: true })}
          ${k({ id: "ai", label: t("dash.kpi.ai"), icon: "cpu", value: "Активна", active: true, sub: "Управлява " + d.ai.managedPct + "% от мрежата", clickable: true })}
        </div>

        <div class="card" style="margin-top:var(--s5)">
          <div class="row row--between" style="margin-bottom:var(--s3)">
            <h2 class="card__title" style="margin:0">${icon("map-pin", { size: 20 })}${esc(t("dash.map"))}</h2>
            <button class="btn btn--sm btn--ghost" data-full>${esc(t("dash.fullscreen"))}</button>
          </div>
          <div id="map-slot"></div>
          <div class="map__updated">
            <span>${esc(t("dash.updated"))}: <b class="mono" id="upd">${GT.util.hhmm()}</b></span>
            <button class="btn btn--sm btn--ghost" data-refresh>${icon("refresh", { size: 14 })}${esc(t("dash.refresh"))}</button>
          </div>
        </div>
      </div>`);

      c.querySelector("#map-slot").appendChild(GT.ui.mapView(GT.data.intersections, {}));

      c.querySelectorAll("[data-kpi]").forEach(card => {
        const act = () => drill(card.dataset.kpi);
        card.addEventListener("click", act);
        card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } });
      });

      c.querySelector("[data-full]").addEventListener("click", openFullMap);
      c.querySelector("[data-refresh]").addEventListener("click", () => {
        c.querySelector("#upd").textContent = GT.util.hhmm();
        GT.ui.toast("Данните са обновени");
      });

      return c;
    }

    function drill(id) {
      if (id === "signals") return (location.hash = "#/signals");
      if (id === "ai") return (location.hash = "#/ai");
      if (id === "connected") return (location.hash = "#/network");

      GT.ui.modal.open({
        title: "Средно натоварване", icon: "bar-chart", iconKind: "accent",
        body: `<p class="muted">Тренд за последните часове (демо данни):</p>
          <div class="card" style="margin-top:var(--s3)">
            <div class="kv"><span class="k">Преди 1 ч</span><span class="v">47%</span></div>
            <div class="kv"><span class="k">Преди 30 мин</span><span class="v">51%</span></div>
            <div class="kv"><span class="k">Сега</span><span class="v" style="color:var(--warn)">53%</span></div>
            <div class="kv"><span class="k">Вчера (същия час)</span><span class="v">45%</span></div>
          </div>`,
        actions: [{ label: t("common.close"), value: true, variant: "btn--ghost" }]
      });
    }

    function openFullMap() {
      const wrap = el(`<div></div>`);
      wrap.appendChild(GT.ui.mapView(GT.data.intersections, { full: true }));
      GT.ui.modal.open({
        title: t("dash.map"), icon: "map-pin", iconKind: "accent",
        body: wrap,
        actions: [{ label: t("common.close"), value: true, variant: "btn--ghost" }]
      });
    }

    return { render };
  })();
})(window.GT = window.GT || {});
