(function (GT) {
  const el = GT.ui.el, icon = GT.icon, t = GT.t, esc = GT.util.esc, SEN = GT.ui.SENSOR;
  let currentId = null;

  GT.screens.intersection = (function () {
    function render(params) {
      currentId = params[0];
      const i = GT.state.intersection(currentId);
      if (!i) return el(`<div class="screen"><button class="back-btn" data-back>${icon("arrow-left", { size: 16 })}${esc(t("common.back"))}</button><div class="empty">Кръстовището не е намерено.</div></div>`);
      return i.status === "offline" ? disasterView(i) : detailView(i);
    }

    function detailView(i) {
      const mode = GT.timers.forIntersection(i.id);
      const manual = mode && mode.type === "manual";
      const ro = GT.state.isReadonly();

      const c = el(`<div class="screen">
        <button class="back-btn" data-back>${icon("arrow-left", { size: 16 })}${esc(t("common.back"))}</button>

        <div class="card">
          <div class="row row--between">
            <h1 class="screen__title">${esc(i.name)}</h1>
          </div>
          <div class="row" style="gap:var(--s3);margin:var(--s2) 0 var(--s4)">
            ${manual ? `<span class="badge badge--error">${icon("power", { size: 13 })}РЪЧЕН РЕЖИМ</span>`
                     : `<span class="badge badge--accent">${icon("cpu", { size: 13 })}AI РЕЖИМ</span>`}
            <span class="muted">${icon("bar-chart", { size: 14 })} ${i.load}%</span>
            ${manual ? `<span class="mono" id="detail-timer" style="margin-left:auto;color:var(--err);font-weight:700">${GT.util.mmss(mode.remaining)}</span>` : ""}
          </div>

          ${ro ? "" : manual
            ? `<button class="btn btn--ghost" data-return>${icon("cpu", { size: 18 })}${esc(t("top.returnAI"))}</button>`
            : `<div class="stack">
                 <button class="btn btn--primary" data-green>${icon("zap", { size: 18 })}Зелен коридор</button>
                 <button class="btn btn--danger" data-manual>${icon("power", { size: 18 })}Ръчен контрол</button>
               </div>`}

          <div class="camtile" style="margin-top:var(--s4)">
            <div class="camtile__bar">
              <span class="cam-id"><span class="rec"></span>${esc(i.cameras[0] ? i.cameras[0].id : "CAM 01")}</span>
              <span class="cam-ts" id="cam-ts">${GT.util.clockStr()}</span>
            </div>
            <div class="camtile__view">${GT.ui.signal(i.phase)}</div>
          </div>
        </div>

        <div class="card">
          <h2 class="card__title">${icon("cpu", { size: 20 })}AI Статус</h2>
          <div class="kv"><span class="k">Алгоритъм</span><span class="v">${esc(i.ai_status.algo)}</span></div>
          <div class="kv"><span class="k">Прогноза</span><span class="v" style="color:var(--warn)">${esc(i.ai_status.forecast)}</span></div>
          <div style="margin-top:var(--s3)">
            <div class="row row--between" style="font-size:var(--fs-cap);margin-bottom:6px"><span class="muted">Ефективност фази</span><b style="color:var(--ok)">${i.ai_status.efficiency}%</b></div>
            <div class="progress"><i style="width:${i.ai_status.efficiency}%"></i></div>
          </div>
        </div>

        <div class="card">
          <h2 class="card__title">${icon("shield", { size: 20 })}Сензори</h2>
          <div class="list">${i.sensors.map(s => {
            const m = SEN[s.status] || SEN.ok;
            return `<div class="list-row"><span class="list-row__body"><span class="list-row__title" style="font-weight:500">${esc(s.name)}</span></span>
              <span class="badge--${m.badge}" style="color:var(--${m.badge === "ok" ? "ok" : m.badge === "warn" ? "warn" : m.badge === "error" ? "err" : "offline"})">${icon(m.icon, { size: 18 })}</span></div>`;
          }).join("")}</div>
        </div>

        <div class="card">
          <h2 class="card__title">${icon("history", { size: 20 })}История на ръчни намеси</h2>
          ${i.manualHistory.length ? `<div class="list">${i.manualHistory.map(h => `
            <div class="list-row" style="align-items:flex-start">
              <span class="list-row__body">
                <span class="list-row__title" style="font-weight:600">${esc(h.action)}</span>
                <span class="list-row__meta">${esc(h.user)} · <span class="mono">${esc(h.ts)}</span></span>
                <span class="list-row__meta" style="color:var(--text-2)">${esc(h.reason)}</span>
              </span>
            </div>`).join("")}</div>`
            : `<p class="muted-3" style="font-size:var(--fs-cap)">Няма регистрирани ръчни намеси.</p>`}
        </div>
      </div>`);

      c.querySelector("[data-back]").addEventListener("click", () => history.length > 1 ? history.back() : (location.hash = "#/network"));
      const g = c.querySelector("[data-green]"); if (g) g.addEventListener("click", () => GT.flows.greenCorridor(i.id));
      const m = c.querySelector("[data-manual]"); if (m) m.addEventListener("click", () => GT.flows.manualControl(i.id));
      const r = c.querySelector("[data-return]"); if (r) r.addEventListener("click", () => GT.flows.returnToAI(mode));
      return c;
    }

    function disasterView(i) {
      const o = i.offlineInfo || {};
      const c = el(`<div class="screen">
        <button class="back-btn" data-back>${icon("arrow-left", { size: 16 })}${esc(t("common.back"))}</button>
        <div class="card disaster">
          <div class="row row--between">
            <h1 class="screen__title">${esc(i.name)}</h1>
            ${GT.ui.statusBadge("offline")}
          </div>
          <p class="muted" style="margin:var(--s2) 0 var(--s4)">${icon("wifi-off", { size: 14 })} Кръстовището е в автономен локален режим.</p>
          <div class="kv"><span class="k">Прекъсване</span><span class="v mono">${esc(o.disconnectedAt || "-")}</span></div>
          <div class="kv"><span class="k">Активен график</span><span class="v" style="color:var(--warn)">${esc(o.safeSchedule || "-")}</span></div>
          <div class="kv"><span class="k">Последно синхронизиране</span><span class="v mono">${esc(o.lastSync || "-")}</span></div>
          <div class="kv"><span class="k">Подобни инциденти</span><span class="v">${o.incidentsCount || 0}</span></div>
        </div>

        <div class="camtile">
          <div class="camtile__bar"><span class="cam-id" style="color:var(--warn);background:var(--warn-tint)">${icon("alert-triangle", { size: 13 })} Авариен режим</span></div>
          <div class="camtile__view">${GT.ui.signal("flash-yellow")}</div>
        </div>

        ${GT.state.isReadonly() ? "" : `<div class="stack" style="margin-top:var(--s4)">
          <button class="btn btn--primary" data-reconnect>${icon("refresh", { size: 18 })}Опит за reconnect</button>
          <button class="btn btn--ghost" data-diag>${icon("wrench", { size: 18 })}Диагностика</button>
        </div>`}
      </div>`);

      c.querySelector("[data-back]").addEventListener("click", () => history.length > 1 ? history.back() : (location.hash = "#/network"));
      const rc = c.querySelector("[data-reconnect]"); if (rc) rc.addEventListener("click", () => reconnect(i));
      const dg = c.querySelector("[data-diag]"); if (dg) dg.addEventListener("click", () => diagnostics(i));
      return c;
    }

    function reconnect(i) {
      const btn = document.querySelector("[data-reconnect]");
      if (btn) { btn.disabled = true; btn.innerHTML = icon("refresh", { size: 18 }) + "Свързване..."; }
      setTimeout(() => {
        const ok = Math.random() < 0.55;
        if (ok) {
          GT.state.setIntersection(i.id, { status: "warning", load: 41, ai: true, offlineInfo: null, phase: "green" });
          GT.state.appendAudit({ intersection: i.name, action: "Връзката е възстановена", source: "Manual", reason: "Ръчен reconnect от " + (GT.state.session ? GT.state.session.name : "оператор") });
          GT.state.notifications.unshift({ id: "n" + Date.now(), type: "info", icon: "check-circle", title: "Връзката е възстановена", body: "Кръстовище " + i.name + " е отново онлайн.", ts: GT.util.nowStr(), ageLabel: "току-що", read: false, intersectionId: i.id });
          GT.state.emit();
          GT.ui.toast("Връзката е възстановена");
          GT.router.rerender();
        } else {
          const tid = "T-" + (1042 + Math.floor(Math.random() * 50));
          GT.state.tickets.unshift({ id: tid, type: "connection_loss", icon: "wifi-off", title: "Неуспешен reconnect - нужен е техник", priority: "high", status: "new", location: i.name, intersectionId: i.id, ageMin: 0, assignedTeam: null, desc: "Автоматичният опит за повторно свързване се провали. Генериран е high-priority билет за физическа проверка." });
          GT.state.appendAudit({ intersection: i.name, action: "Неуспешен reconnect → билет " + tid, source: "AI", reason: "Retry неуспешен" });
          GT.state.emit();
          GT.ui.toast("Reconnect неуспешен. Създаден е билет " + tid, { kind: "err" });
          if (btn) { btn.disabled = false; btn.innerHTML = icon("refresh", { size: 18 }) + "Опит за reconnect"; }
        }
      }, 1400);
    }

    function diagnostics(i) {
      GT.ui.modal.open({
        title: "Диагностика - " + i.name, icon: "wrench", iconKind: "accent",
        body: `<div class="card"><div class="kv"><span class="k">Ping към контролер</span><span class="v" style="color:var(--err)">timeout</span></div>
          <div class="kv"><span class="k">Heartbeat</span><span class="v" style="color:var(--err)">липсва > 30 сек</span></div>
          <div class="kv"><span class="k">Локален UPS</span><span class="v" style="color:var(--ok)">OK (87%)</span></div>
          <div class="kv"><span class="k">Авариен график</span><span class="v">активен</span></div></div>`,
        actions: [{ label: t("common.close"), value: true, variant: "btn--ghost" }]
      });
    }

    function onMount() {
      document.addEventListener("gt:tick", tickDetail);
    }
    function onUnmount() {
      document.removeEventListener("gt:tick", tickDetail);
    }
    function tickDetail() {
      const tEl = document.getElementById("detail-timer");
      const m = GT.timers.forIntersection(currentId);
      if (tEl && m) tEl.textContent = GT.util.mmss(m.remaining);
      const cam = document.getElementById("cam-ts");
      if (cam) cam.textContent = GT.util.clockStr();
    }

    return { render, onMount, onUnmount };
  })();

  GT.flows = GT.flows || {};

  GT.flows.greenCorridor = function () {
    if (GT.state.isReadonly()) { GT.ui.toast("Само за преглед - действието е недостъпно.", { kind: "err" }); return; }
    GT.shell.closeNotifications();
    const routes = GT.data.routes;
    let routeId = "";

    const body = el(`<div>
      <div class="field">
        <label for="gc-route">Избор на маршрут</label>
        <select class="select" id="gc-route">
          <option value="">-- Изберете направление --</option>
          ${routes.map(r => `<option value="${r.id}">${esc(r.name)}</option>`).join("")}
        </select>
      </div>
      <div id="gc-preview"></div>
      <div class="field">
        <label for="gc-dur">Продължителност: <span class="slider-val" id="gc-durv">3:00</span></label>
        <input class="slider" id="gc-dur" type="range" min="60" max="600" step="30" value="180" />
      </div>
      <div class="field" id="gc-basis-field">
        <label for="gc-basis">Основание по закон ${esc(t("common.required"))}</label>
        <textarea class="textarea" id="gc-basis" placeholder="Въведете член/алинея или описание на спешната ситуация..."></textarea>
        <div class="field__error">Основанието е задължително (минимум 10 знака).</div>
      </div>
    </div>`);

    const previewBox = body.querySelector("#gc-preview");
    const durv = body.querySelector("#gc-durv");
    body.querySelector("#gc-dur").addEventListener("input", e => durv.textContent = GT.util.mmss(+e.target.value));
    body.querySelector("#gc-route").addEventListener("change", e => {
      routeId = e.target.value;
      const r = routes.find(x => x.id === routeId);
      if (!r) { previewBox.innerHTML = ""; return; }
      body.querySelector("#gc-dur").value = r.durationSec;
      durv.textContent = GT.util.mmss(r.durationSec);
      previewBox.innerHTML = `<div class="preview">
        <h3><span>Засегнати кръстовища</span><b>${r.intersections.length} бр. · ~${GT.util.mmss(r.durationSec)}</b></h3>
        <ol>${r.intersections.map(id => `<li>${esc(GT.data.intersectionById(id).name)}</li>`).join("")}</ol>
      </div>`;
    });

    GT.ui.modal.open({
      title: "Спешен Зелен коридор", icon: "shield-alert", iconKind: "danger",
      body, note: t("common.loggedToAudit"),
      actions: [
        { label: t("common.cancel"), value: null, variant: "btn--ghost" },
        {
          label: "Активирай веднага", variant: "btn--danger", icon: "zap",
          onClick: (b) => {
            const basis = b.querySelector("#gc-basis").value.trim();
            const field = b.querySelector("#gc-basis-field");
            const r = routes.find(x => x.id === routeId);
            if (!r) { GT.ui.toast("Изберете маршрут.", { kind: "err" }); return false; }
            if (basis.length < 10) { field.classList.add("is-invalid"); b.querySelector("#gc-basis").focus(); return false; }
            const dur = +b.querySelector("#gc-dur").value;
            activateCorridor(r, dur, basis);
          }
        }
      ]
    });
  };

  function activateCorridor(r, dur, basis) {
    GT.state.appendAudit({ intersection: r.name, action: "Зелен коридор активиран (" + r.intersections.length + " кръстовища)", source: "Manual", reason: basis });
    GT.timers.add({
      id: "gc-" + Date.now(), type: "green", label: "Зелен коридор: " + r.name, routeId: r.id, durationSec: dur,
      onExpire: () => { GT.state.appendAudit({ intersection: r.name, action: "Зелен коридор приключи", source: "AI", reason: "Изтекъл таймер" }); GT.ui.toast("Зелен коридор приключи"); }
    });
    GT.ui.toast("Зелен коридор активиран · " + GT.util.mmss(dur));
  }

  GT.flows.manualControl = function (id) {
    const i = GT.state.intersection(id);
    if (GT.state.isReadonly() || !GT.state.role().canManual) {
      GT.ui.modal.open({ title: "Недостатъчни права", icon: "lock", iconKind: "danger",
        body: `<p class="muted">Нямате достатъчно права за ръчно управление. Контактувайте администратор.</p>`,
        actions: [{ label: t("common.close"), value: true, variant: "btn--ghost" }] });
      return;
    }
    let phase = "red", scope = "single";
    const phases = [["red", "Червено", "dot-r"], ["green", "Зелено", "dot-g"], ["yellow", "Жълто", "dot-y"], ["flash-yellow", "Мигащо", "dot-fy"]];

    const body = el(`<div>
      <div class="field">
        <label>Светлинна фаза</label>
        <div class="phase-pick" role="group" aria-label="Светлинна фаза">
          ${phases.map(([v, lbl, dot]) => `<button type="button" class="phase-opt" data-phase="${v}" aria-pressed="${v === phase}"><span class="dot ${dot}"></span>${esc(lbl)}</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label>Обхват</label>
        <div class="segment" role="group" aria-label="Обхват">
          <button type="button" class="segment__opt" data-scope="single" aria-pressed="true">Само това кръстовище</button>
          <button type="button" class="segment__opt" data-scope="neighbors" aria-pressed="false">+ съседни</button>
        </div>
      </div>
      <div class="field" id="mc-basis-field">
        <label for="mc-basis">Основание по закон ${esc(t("common.required"))}</label>
        <textarea class="textarea" id="mc-basis" placeholder="напр. чл. 16 ал. 1 ЗДвП - отклоняване поради ПТП"></textarea>
        <div class="field__error">Основанието е задължително (минимум 10 знака).</div>
      </div>
    </div>`);

    body.querySelectorAll("[data-phase]").forEach(b => b.addEventListener("click", () => {
      phase = b.dataset.phase;
      body.querySelectorAll("[data-phase]").forEach(x => x.setAttribute("aria-pressed", x.dataset.phase === phase));
    }));
    body.querySelectorAll("[data-scope]").forEach(b => b.addEventListener("click", () => {
      scope = b.dataset.scope;
      body.querySelectorAll("[data-scope]").forEach(x => x.setAttribute("aria-pressed", x.dataset.scope === scope));
    }));

    GT.ui.modal.open({
      title: "Поемане на ръчен контрол", icon: "power", iconKind: "danger",
      body, note: t("common.loggedToAudit"),
      actions: [
        { label: t("common.cancel"), value: null, variant: "btn--ghost" },
        {
          label: "Поеми контрол", variant: "btn--danger", icon: "power",
          onClick: (b) => {
            const basis = b.querySelector("#mc-basis").value.trim();
            if (basis.length < 10) { b.querySelector("#mc-basis-field").classList.add("is-invalid"); b.querySelector("#mc-basis").focus(); return false; }
            engageManual(i, phase, scope, basis);
          }
        }
      ]
    });
  };

  function engageManual(i, phase, scope, basis) {
    const label = GT.ui.phaseLabel(phase) + (scope === "neighbors" ? " (+ съседни)" : "");
    GT.state.setIntersection(i.id, { mode: "manual", ai: false, phase });
    GT.state.appendAudit({ intersection: i.name, action: "Ръчно: " + label, source: "Manual", reason: basis });
    GT.timers.add({
      id: "mc-" + i.id, type: "manual", label: "Ръчен режим: " + i.name, intersectionId: i.id, durationSec: 300,
      onExpire: (m) => {
        GT.state.setIntersection(i.id, { mode: null, ai: true });
        GT.state.appendAudit({ intersection: i.name, action: "Ръчният режим изтече", source: "AI", reason: "Изтекъл таймер (5 мин)" });
        GT.ui.toast("Ръчният режим изтече - върнато към AI");
        if (GT.router.current() === "intersection" && currentId === i.id) GT.router.rerender();
      }
    });
    GT.ui.toast("Ръчен режим активиран · 5:00");
    if (GT.router.current() === "intersection" && currentId === i.id) GT.router.rerender();
  }

  GT.flows.returnToAI = function (mode) {
    if (!mode) return;
    const i = GT.state.intersection(mode.intersectionId);
    GT.timers.remove(mode.id);
    GT.state.setIntersection(mode.intersectionId, { mode: null, ai: true });
    GT.state.appendAudit({ intersection: i ? i.name : mode.intersectionId, action: "Връщане към AI режим", source: "Manual", reason: "Ръчно връщане от диспечер" });
    GT.ui.toast("Управлението е върнато към AI");
    if (GT.router.current() === "intersection" && currentId === mode.intersectionId) GT.router.rerender();
  };

  GT.flows.endMode = function (mode) {
    if (mode.type === "manual") return GT.flows.returnToAI(mode);

    GT.ui.modal.confirm({
      title: "Отмяна на Зелен коридор", message: "Сигурни ли сте, че искате да прекратите коридора предварително?",
      danger: true, confirmLabel: "Отмени коридора", confirmIcon: "x"
    }).then(ok => {
      if (!ok) return;
      const r = GT.data.routes.find(x => x.id === mode.routeId);
      GT.timers.remove(mode.id);
      GT.state.appendAudit({ intersection: r ? r.name : "-", action: "Зелен коридор отменен ръчно", source: "Manual", reason: "Прекратен от диспечер преди изтичане" });
      GT.ui.toast("Зелен коридор е отменен");
    });
  };
})(window.GT = window.GT || {});
