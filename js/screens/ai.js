(function (GT) {
  const el = GT.ui.el, icon = GT.icon, t = GT.t, esc = GT.util.esc, k = GT.ui.kpiCard;

  GT.screens.ai = (function () {
    function render() {
      if (GT.state._.aiActive === undefined) GT.state._.aiActive = true;
      const on = GT.state._.aiActive;
      const a = GT.data.aiKpis;
      const ro = GT.state.isReadonly();
      const canAI = GT.state.role() && GT.state.role().canAI && !ro;

      const sparks = (n, total) => `<div class="kpi__spark">${Array.from({ length: total }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</div>`;

      const c = el(`<div class="screen">
        <h1 class="screen__title">AI Мониторинг</h1>
        <p class="screen__subtitle">${esc(a.algo)}</p>

        <button class="btn ${on ? "btn--danger" : "btn--primary"}" id="ai-toggle" ${canAI ? "" : "disabled"} style="margin-bottom:var(--s4)">
          ${icon("power", { size: 18 })}${on ? "СПРИ AI ОПТИМИЗАЦИЯТА" : "СТАРТИРАЙ AI"}
        </button>
        ${canAI ? "" : `<p class="field__hint" style="margin-top:-8px;margin-bottom:var(--s4)">Контактувайте администратор - нямате права за това действие.</p>`}

        <div class="ai-hero ${on ? "on" : "off"}" style="margin-bottom:var(--s4)">
          <div class="ai-hero__ring">${icon("cpu", { size: 34 })}</div>
          <h2>${on ? "AI е АКТИВЕН" : "AI е ИЗКЛЮЧЕН"}</h2>
          <p>${on ? "Алгоритъмът управлява " + a.managedLights + " светофарни уредби." : "Системата работи на статичен график."}</p>
        </div>

        <div class="grid-2 grid-2--kpi">
          ${k({ label: "Задръствания", icon: "check-circle", value: a.congestion.value, help: a.congestion.tip })}
          ${k({ label: "AI Решения", icon: "bar-chart", value: a.decisions.value, help: a.decisions.tip })}
          <div class="card kpi kpi--clickable" data-anom tabindex="0" role="button">
            <div class="kpi__top"><span class="kpi__label">Аномалии</span><span class="kpi__icon">${icon("shield-alert", { size: 18 })}</span></div>
            <div class="kpi__value">${a.anomalies.value}</div>
            ${sparks(3, 6)}
          </div>
          ${k({ label: "Качество данни", icon: "database", value: a.dataQuality.value, help: a.dataQuality.tip })}
        </div>
      </div>`);

      c.querySelectorAll(".help").forEach(b => b.addEventListener("click", e => {
        e.stopPropagation();
        const tip = b.closest(".tip");
        c.querySelectorAll(".tip.is-open").forEach(x => { if (x !== tip) x.classList.remove("is-open"); });
        tip.classList.toggle("is-open");
      }));
      document.addEventListener("click", () => c.querySelectorAll(".tip.is-open").forEach(x => x.classList.remove("is-open")), { once: true });

      const anom = c.querySelector("[data-anom]");
      const openAnom = () => anomalies();
      anom.addEventListener("click", openAnom);
      anom.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openAnom(); } });

      const tg = c.querySelector("#ai-toggle");
      if (canAI) tg.addEventListener("click", () => toggle(on));
      return c;
    }

    function anomalies() {
      const items = GT.data.aiKpis.anomalies.items;
      GT.ui.modal.open({
        title: "Отчетени аномалии (24 ч)", icon: "shield-alert", iconKind: "danger",
        body: `<div class="list">${items.map(x => `<div class="list-row">
          <span class="list-row__icon" style="color:var(--warn)">${icon("alert-triangle", { size: 18 })}</span>
          <span class="list-row__body"><span class="list-row__title">${esc(x.where)}</span><span class="list-row__meta">${esc(x.what)}</span></span>
          <span class="mono muted-3">${esc(x.ts)}</span></div>`).join("")}</div>`,
        actions: [{ label: t("common.close"), value: true, variant: "btn--ghost" }]
      });
    }

    function toggle(currentlyOn) {
      if (currentlyOn) {
        let scope = "network";
        const body = el(`<div>
          <div class="banner banner--readonly" style="margin-bottom:var(--s4)">${icon("alert-triangle", { size: 18 })}<span>Системата ще премине на статичен график. Задръстванията може да нараснат с ~18%.</span></div>
          <div class="field"><label>Обхват на действието</label>
            <div class="segment" role="group" aria-label="Обхват">
              <button type="button" class="segment__opt" data-scope="network" aria-pressed="true">Цялата мрежа</button>
              <button type="button" class="segment__opt" data-scope="district" aria-pressed="false">Избран район</button>
            </div></div>
        </div>`);
        body.querySelectorAll("[data-scope]").forEach(b => b.addEventListener("click", () => {
          scope = b.dataset.scope;
          body.querySelectorAll("[data-scope]").forEach(x => x.setAttribute("aria-pressed", x.dataset.scope === scope));
        }));
        GT.ui.modal.open({
          title: "Спиране на AI оптимизацията", icon: "power", iconKind: "danger",
          body, note: t("common.loggedToAudit"),
          actions: [
            { label: t("common.cancel"), value: false, variant: "btn--ghost" },
            { label: "Потвърди спирането", value: true, variant: "btn--danger", icon: "power" }
          ]
        }).then(ok => {
          if (!ok) return;
          GT.state._.aiActive = false;
          GT.state.appendAudit({ intersection: scope === "network" ? "Цялата мрежа" : "Избран район", action: "AI оптимизацията е спряна", source: "Manual", reason: "Ръчно спиране (обхват: " + (scope === "network" ? "цяла мрежа" : "район") + ")" });
          GT.ui.toast("AI оптимизацията е спряна", { kind: "err" });
          GT.router.rerender();
        });
      } else {
        GT.ui.modal.confirm({ title: "Стартиране на AI", message: "Системата ще възобнови AI оптимизацията с плавен преход (yellow buffer 3 сек на всяко кръстовище). Продължавате ли?", icon: "cpu", iconKind: "accent", confirmLabel: "Стартирай AI", confirmIcon: "play", danger: false })
          .then(ok => {
            if (!ok) return;
            GT.state._.aiActive = true;
            GT.state.appendAudit({ intersection: "Цялата мрежа", action: "AI оптимизацията е стартирана", source: "Manual", reason: "Ръчно стартиране" });
            GT.ui.toast("AI оптимизацията е активна");
            GT.router.rerender();
          });
      }
    }

    return { render };
  })();
})(window.GT = window.GT || {});
