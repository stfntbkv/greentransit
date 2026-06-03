(function (GT) {
  const el = GT.ui.el, icon = GT.icon, t = GT.t, esc = GT.util.esc, D = GT.data;

  GT.screens.signals = (function () {
    const ui = { priority: "all", status: "all" };

    function fmtAge(min) {
      if (min < 1) return "току-що";
      if (min < 60) return "преди " + min + " мин";
      const h = Math.floor(min / 60);
      return "преди " + h + " ч" + (min % 60 ? " " + (min % 60) + " мин" : "");
    }

    function render() {
      const ro = GT.state.isReadonly();
      const prChips = [["all", t("common.all")], ["high", "Висок"], ["medium", "Среден"], ["low", "Нисък"]]
        .map(([id, l]) => `<button class="chip" data-pr="${id}" aria-pressed="${ui.priority === id}">${esc(l)}</button>`).join("");

      const c = el(`<div class="screen">
        <h1 class="screen__title">Сигнали и инциденти</h1>
        <p class="screen__subtitle">Отразява проблеми с хардуера или трафика</p>

        ${ro ? "" : `<button class="btn btn--ghost" data-create style="margin-bottom:var(--s4)">${icon("plus", { size: 18 })}Създай сервизен билет</button>`}

        <div class="chips" role="group" aria-label="Филтър по приоритет" style="margin-bottom:var(--s3)">${prChips}</div>
        <div class="row row--between" style="margin-bottom:var(--s3)">
          <label class="muted" for="sg-status" style="font-size:var(--fs-cap)">Статус</label>
          <select class="select" id="sg-status" style="width:auto;min-height:36px">
            <option value="all">Всички</option>
            <option value="new">Нов</option><option value="in_progress">В процес</option>
            <option value="resolved">Решен</option><option value="closed">Затворен</option>
          </select>
        </div>
        <div class="stack" id="sg-list"></div>
      </div>`);

      c.querySelector("#sg-status").value = ui.status;
      c.querySelectorAll("[data-pr]").forEach(b => b.addEventListener("click", () => {
        ui.priority = b.dataset.pr;
        c.querySelectorAll("[data-pr]").forEach(x => x.setAttribute("aria-pressed", x.dataset.pr === ui.priority));
        fill(c);
      }));
      c.querySelector("#sg-status").addEventListener("change", e => { ui.status = e.target.value; fill(c); });
      const cr = c.querySelector("[data-create]"); if (cr) cr.addEventListener("click", createTicket);

      fill(c);
      return c;
    }

    function fill(root) {
      let list = GT.state.tickets.slice();
      if (ui.priority !== "all") list = list.filter(x => x.priority === ui.priority);
      if (ui.status !== "all") list = list.filter(x => x.status === ui.status);

      const host = root.querySelector("#sg-list");
      if (!list.length) { host.innerHTML = `<div class="empty">${icon("filter", { size: 40 })}<p>Няма сигнали за избраните филтри.</p></div>`; return; }
      const ro = GT.state.isReadonly();

      host.innerHTML = list.map(x => {
        const prB = D.priorityBadge[x.priority], stB = D.ticketStatusBadge[x.status];
        return `<div class="card incident">
          <div class="incident__head">
            <span class="ic badge--${prB}">${icon(x.icon || "alert-triangle", { size: 18 })}</span>
            <div style="flex:1;min-width:0">
              <div class="incident__title">${esc(x.title)}</div>
              <div class="incident__badges">
                ${GT.ui.badge(prB, D.priorityLabel[x.priority], "alert-triangle")}
                ${GT.ui.badge(stB, D.ticketStatusLabel[x.status], stB === "ok" ? "check-circle" : "clock")}
              </div>
            </div>
            <button class="icon-btn" data-detail="${x.id}" aria-label="Детайли за ${esc(x.title)}">${icon("external", { size: 18 })}</button>
          </div>
          <p class="muted" style="font-size:var(--fs-cap);margin-top:var(--s2)">${esc(x.desc)}</p>
          <div class="incident__foot">
            <span>${icon("map-pin", { size: 14 })}${esc(x.location)}</span>
            <span>${icon("clock", { size: 14 })}${esc(fmtAge(x.ageMin))}</span>
            ${x.assignedTeam ? `<span>${icon("users", { size: 14 })}${esc(x.assignedTeam)}</span>` : ""}
          </div>
          ${ro ? "" : `<div class="row" style="gap:var(--s2);margin-top:var(--s3)">
            <button class="btn btn--sm btn--ghost" data-status="${x.id}">${icon("sliders", { size: 14 })}Промени статус</button>
            ${x.intersectionId ? `<button class="btn btn--sm btn--ghost" data-go="${x.id}">${icon("map-pin", { size: 14 })}Виж кръстовище</button>` : ""}
          </div>`}
        </div>`;
      }).join("");

      host.querySelectorAll("[data-detail]").forEach(b => b.addEventListener("click", () => detail(b.dataset.detail)));
      host.querySelectorAll("[data-status]").forEach(b => b.addEventListener("click", () => changeStatus(root, b.dataset.status)));
      host.querySelectorAll("[data-go]").forEach(b => {
        const x = GT.state.tickets.find(y => y.id === b.dataset.go);
        b.addEventListener("click", () => location.hash = "#/intersection/" + x.intersectionId);
      });
    }

    function detail(id) {
      const x = GT.state.tickets.find(y => y.id === id); if (!x) return;
      GT.ui.modal.open({
        title: x.title, icon: x.icon || "alert-triangle", iconKind: "danger",
        body: `<div class="incident__badges" style="margin-bottom:var(--s3)">
            ${GT.ui.badge(D.priorityBadge[x.priority], D.priorityLabel[x.priority], "alert-triangle")}
            ${GT.ui.badge(D.ticketStatusBadge[x.status], D.ticketStatusLabel[x.status])}
          </div>
          <p class="muted">${esc(x.desc)}</p>
          <div class="card" style="margin-top:var(--s3)">
            <div class="kv"><span class="k">Билет №</span><span class="v mono">${esc(x.id)}</span></div>
            <div class="kv"><span class="k">Локация</span><span class="v">${esc(x.location)}</span></div>
            <div class="kv"><span class="k">Екип</span><span class="v">${esc(x.assignedTeam || "не е назначен")}</span></div>
          </div>`,
        actions: [{ label: t("common.close"), value: true, variant: "btn--ghost" }]
      });
    }

    function changeStatus(root, id) {
      const x = GT.state.tickets.find(y => y.id === id); if (!x) return;
      const body = el(`<div class="stack">${D.ticketStatusOrder.map(s =>
        `<button type="button" class="btn ${s === x.status ? "btn--primary" : "btn--ghost"}" data-set="${s}">${esc(D.ticketStatusLabel[s])}</button>`).join("")}</div>`);
      GT.ui.modal.open({
        title: "Статус на билет " + x.id, icon: "sliders", iconKind: "accent",
        body,
        onMount: (b, api) => b.querySelectorAll("[data-set]").forEach(btn => btn.addEventListener("click", () => {
          const ns = btn.dataset.set;
          if (ns !== x.status) {
            x.status = ns;
            GT.state.appendAudit({ intersection: x.location, action: "Билет " + x.id + " → " + D.ticketStatusLabel[ns], source: "Manual", reason: "Промяна на статус" });
            GT.state.emit();
            GT.ui.toast("Статусът е обновен: " + D.ticketStatusLabel[ns]);
          }
          api.close(true); fill(root);
        }))
      });
    }

    function createTicket() {
      const body = el(`<div>
        <div class="field"><label for="ct-title">Заглавие</label><input class="input" id="ct-title" placeholder="Кратко описание на проблема" /></div>
        <div class="field"><label for="ct-loc">Кръстовище</label>
          <select class="select" id="ct-loc">${GT.data.intersections.map(i => `<option value="${i.id}">${esc(i.name)}</option>`).join("")}</select></div>
        <div class="field"><label for="ct-pr">Приоритет</label>
          <select class="select" id="ct-pr"><option value="high">Висок</option><option value="medium" selected>Среден</option><option value="low">Нисък</option></select></div>
        <div class="field"><label for="ct-desc">Описание</label><textarea class="textarea" id="ct-desc" placeholder="Детайли..."></textarea></div>
      </div>`);
      GT.ui.modal.open({
        title: "Нов сервизен билет", icon: "plus", iconKind: "accent",
        body, note: t("common.loggedToAudit"),
        actions: [
          { label: t("common.cancel"), value: null, variant: "btn--ghost" },
          {
            label: "Създай билет", variant: "btn--primary", icon: "check",
            onClick: (b) => {
              const title = b.querySelector("#ct-title").value.trim();
              if (!title) { b.querySelector("#ct-title").focus(); return false; }
              const iid = b.querySelector("#ct-loc").value;
              const inter = GT.data.intersectionById(iid);
              const tid = "T-" + (1042 + Math.floor(Math.random() * 900));
              GT.state.tickets.unshift({ id: tid, type: "manual", icon: "wrench", title, priority: b.querySelector("#ct-pr").value, status: "new", location: inter.name, intersectionId: iid, ageMin: 0, assignedTeam: null, desc: b.querySelector("#ct-desc").value.trim() || "Ръчно създаден сервизен билет." });
              GT.state.appendAudit({ intersection: inter.name, action: "Създаден сервизен билет " + tid, source: "Manual", reason: title });
              GT.state.emit();
              GT.ui.toast("Билет " + tid + " е създаден");
            }
          }
        ]
      }).then(() => { const cur = GT.router.current(); if (cur === "signals") GT.router.rerender(); });
    }

    return { render };
  })();
})(window.GT = window.GT || {});
