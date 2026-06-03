(function (GT) {
  const el = GT.ui.el, icon = GT.icon, t = GT.t, esc = GT.util.esc, S = GT.ui.STATUS;

  GT.screens.network = (function () {
    const ui = { filter: "all", sort: "load" };
    const SEV = { error: 0, offline: 1, warning: 2, normal: 3 };

    function items() { return GT.data.intersections.map(i => GT.state.intersection(i.id)); }
    function counts() {
      const all = items(), c = { all: all.length, normal: 0, warning: 0, error: 0, offline: 0 };
      all.forEach(i => c[i.status]++);
      return c;
    }
    function loadClass(l) { return l >= 85 ? "var(--err)" : l >= 60 ? "var(--warn)" : "var(--ok)"; }

    function render() {
      const c = counts();
      const chips = [
        ["all", t("common.all"), c.all], ["normal", t("status.normal"), c.normal],
        ["warning", t("status.warning"), c.warning], ["error", t("status.error"), c.error],
        ["offline", t("status.offline"), c.offline]
      ].map(([id, label, n]) =>
        `<button class="chip" data-filter="${id}" aria-pressed="${ui.filter === id}">${esc(label)}<span class="count">${n}</span></button>`
      ).join("");

      const root = el(`<div class="screen">
        <h1 class="screen__title">${esc(t("net.title"))}</h1>
        <p class="screen__subtitle">${c.all} наблюдавани кръстовища</p>
        <div class="chips" role="group" aria-label="Филтър по статус" style="margin-bottom:var(--s3)">${chips}</div>
        <div class="row row--between" style="margin-bottom:var(--s3)">
          <label class="muted" for="net-sort" style="font-size:var(--fs-cap)">${esc(t("net.sortBy"))}</label>
          <select class="select" id="net-sort" style="width:auto;min-height:36px">
            <option value="load">${esc(t("net.sort.load"))}</option>
            <option value="name">${esc(t("net.sort.name"))}</option>
            <option value="status">${esc(t("net.sort.status"))}</option>
          </select>
        </div>
        <div class="stack" id="net-list"></div>
      </div>`);

      root.querySelector("#net-sort").value = ui.sort;
      root.querySelectorAll("[data-filter]").forEach(b => b.addEventListener("click", () => {
        ui.filter = b.dataset.filter;
        root.querySelectorAll("[data-filter]").forEach(x => x.setAttribute("aria-pressed", x.dataset.filter === ui.filter));
        fill(root);
      }));
      root.querySelector("#net-sort").addEventListener("change", e => { ui.sort = e.target.value; fill(root); });

      fill(root);
      return root;
    }

    function fill(root) {
      let list = items();
      if (ui.filter !== "all") list = list.filter(i => i.status === ui.filter);
      list.sort((a, b) =>
        ui.sort === "name" ? a.name.localeCompare(b.name, "bg") :
        ui.sort === "status" ? SEV[a.status] - SEV[b.status] :
        b.load - a.load
      );

      const host = root.querySelector("#net-list");
      if (!list.length) { host.innerHTML = `<div class="empty">${icon("search", { size: 40 })}<p>Няма кръстовища в тази категория.</p></div>`; return; }

      host.innerHTML = list.map(i => {
        const m = S[i.status];
        const sCls = { normal: "s-ok", warning: "s-warn", error: "s-error", offline: "s-offline" }[i.status];
        return `<button class="card card--status ${sCls}" data-go="${i.id}">
          <div class="row row--between">
            <span class="list-row__icon" style="color:var(--_c)">${icon("bar-chart", { size: 18 })}</span>
            ${GT.ui.statusBadge(i.status)}
          </div>
          <div class="list-row__title" style="font-size:var(--fs-h2);margin:var(--s2) 0">${esc(i.name)}</div>
          <div class="row row--between muted" style="font-size:var(--fs-cap);border-top:1px solid var(--border);padding-top:var(--s2)">
            <span>${esc(t("net.load"))}: <b style="color:${loadClass(i.load)}">${i.load}%</b></span>
            <span>${icon("cpu", { size: 14 })} AI: <b style="color:${i.ai ? "var(--ok)" : "var(--text-2)"}">${i.ai ? "Вкл" : "Изкл"}</b></span>
          </div>
        </button>`;
      }).join("");

      host.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => location.hash = "#/intersection/" + b.dataset.go));
    }

    return { render };
  })();
})(window.GT = window.GT || {});
