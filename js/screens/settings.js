(function (GT) {
  const el = GT.ui.el, icon = GT.icon, t = GT.t, esc = GT.util.esc;

  GT.screens.settings = (function () {
    function render() {
      const u = GT.state.session;
      const roleMeta = GT.data.roles[u.role];
      const isAdmin = roleMeta.canManage;

      const sections = [
        { id: "users", icon: "users", label: "Потребители и Роли" },
        { id: "security", icon: "shield", label: "Сигурност и 2FA" },
        { id: "api", icon: "key", label: "Интеграции (API)" },
        { id: "network", icon: "globe", label: "Мрежа и Контролери" },
        { id: "audit", icon: "database", label: "Архив и Одит Лог" }
      ];

      const c = el(`<div class="screen">
        <h1 class="screen__title">Настройки</h1>
        <p class="screen__subtitle">Управление на роли и достъп</p>

        <div class="card" style="padding:var(--s2)">
          <div class="list settings-list">
            ${sections.map(s => `<button class="list-row" data-sec="${s.id}">
              <span class="list-row__icon">${icon(s.icon, { size: 18 })}</span>
              <span class="list-row__body"><span class="list-row__title">${esc(s.label)}</span></span>
              <span class="chevron">${icon("chevron-right", { size: 18 })}</span>
            </button>`).join("")}
          </div>
        </div>

        <div class="card">
          <div class="row row--between" style="margin-bottom:var(--s2)">
            <h2 class="card__title" style="margin:0">${icon("users", { size: 20 })}Потребители</h2>
            ${isAdmin ? `<button class="btn btn--sm btn--primary" data-add>${icon("plus", { size: 14 })}Добави</button>` : ""}
          </div>
          <div id="users-list">${usersHtml()}</div>
        </div>

        <div class="card">
          <div class="row row--between" style="margin-bottom:var(--s3)">
            <span><span class="muted" style="font-size:var(--fs-cap)">Влязъл като</span><br><b>${esc(u.name)}</b> · <span class="badge badge--${roleMeta.badge}">${esc(roleMeta.label)}</span></span>
          </div>
          <button class="btn btn--ghost" data-logout>${icon("log-out", { size: 16 })}${esc(t("top.logout"))}</button>
        </div>
      </div>`);

      c.querySelectorAll("[data-sec]").forEach(b => b.addEventListener("click", () => section(b.dataset.sec, isAdmin)));
      const add = c.querySelector("[data-add]"); if (add) add.addEventListener("click", () => editUser(null, c));
      c.querySelector("[data-logout]").addEventListener("click", logout);
      wireUsers(c, isAdmin);
      return c;
    }

    function usersHtml() {
      return GT.data.users.map(x => {
        const rm = GT.data.roles[x.role];
        return `<div class="userline" ${GT.data.roles[GT.state.session.role].canManage ? `data-user="${x.id}" role="button" tabindex="0"` : ""}>
          <div class="row row--between"><span class="nm">${esc(x.name)}</span><span class="badge badge--${rm.badge}">${esc(rm.label)}</span></div>
          <div class="ac">Достъп: ${esc(x.regions)}${x.active ? "" : " · <span style='color:var(--err)'>деактивиран</span>"}</div>
          <div class="tfa" style="color:${x.twofa ? "var(--ok)" : "var(--text-3)"}">2FA: ${x.twofa ? "Активен" : "Неактивен"}</div>
        </div>`;
      }).join("");
    }
    function wireUsers(root, isAdmin) {
      if (!isAdmin) return;
      root.querySelectorAll("[data-user]").forEach(rowEl => {
        const open = () => editUser(rowEl.dataset.user, root);
        rowEl.addEventListener("click", open);
        rowEl.addEventListener("keydown", e => { if (e.key === "Enter") open(); });
      });
    }

    function section(id, isAdmin) {
      if (id === "audit") return (location.hash = "#/audit");
      if (id === "network") return (location.hash = "#/network");
      if (id === "users") return GT.ui.toast("Управление на потребители - вижте списъка по-долу.");
      if (id === "security") {
        return GT.ui.modal.open({
          title: "Сигурност и 2FA", icon: "shield", iconKind: "accent",
          body: `<div class="card"><div class="kv"><span class="k">Задължителна 2FA</span><span class="v" style="color:var(--ok)">Включена</span></div>
            <div class="kv"><span class="k">Session timeout</span><span class="v">15 мин неактивност</span></div>
            <div class="kv"><span class="k">Макс. неуспешни опити</span><span class="v">5 → 30 мин заключване</span></div>
            <div class="kv"><span class="k">Криптиране</span><span class="v">AES-256 / TLS 1.3</span></div></div>
            <p class="muted" style="margin-top:var(--s3);font-size:var(--fs-cap)">${isAdmin ? "Security dashboard: 2 неуспешни опита за вход за последните 24 ч." : "Само администратор може да променя тези настройки."}</p>`,
          actions: [{ label: t("common.close"), value: true, variant: "btn--ghost" }]
        });
      }
      if (id === "api") {
        return GT.ui.modal.open({
          title: "Интеграции (API)", icon: "key", iconKind: "accent",
          body: `<div class="list">
            <div class="list-row"><span class="list-row__body"><span class="list-row__title">Пътна полиция / КАТ</span><span class="list-row__meta">read-only одит достъп</span></span><span class="badge badge--ok">Активна</span></div>
            <div class="list-row"><span class="list-row__body"><span class="list-row__title">Спешна помощ (112)</span><span class="list-row__meta">заявки за Зелен коридор</span></span><span class="badge badge--ok">Активна</span></div>
            <div class="list-row"><span class="list-row__body"><span class="list-row__title">Метео API</span><span class="list-row__meta">прогноза за трафик</span></span><span class="badge badge--neutral">Изключена</span></div></div>`,
          actions: [{ label: t("common.close"), value: true, variant: "btn--ghost" }]
        });
      }
    }

    function editUser(id, root) {
      const u = id ? GT.data.users.find(x => x.id === id) : null;
      const roleOpts = Object.keys(GT.data.roles).map(r => `<option value="${r}" ${u && u.role === r ? "selected" : ""}>${esc(GT.data.roles[r].label)}</option>`).join("");
      const body = el(`<div>
        <div class="field"><label for="us-name">Име</label><input class="input" id="us-name" value="${u ? esc(u.name) : ""}" placeholder="Име Фамилия" /></div>
        <div class="field"><label for="us-email">Служебен имейл</label><input class="input" id="us-email" type="email" value="${u ? esc(u.email) : ""}" placeholder="вие@traffic-os.bg" />
          <div class="field__error">Имейлът трябва да е служебен (@traffic-os.bg).</div></div>
        <div class="field"><label for="us-role">Роля</label><select class="select" id="us-role">${roleOpts}</select></div>
        <div class="field"><label for="us-reg">Достъп до райони</label><input class="input" id="us-reg" value="${u ? esc(u.regions) : "Всички райони"}" /></div>
        <label class="row" style="gap:var(--s2)"><input type="checkbox" id="us-2fa" ${!u || u.twofa ? "checked" : ""} style="width:auto"> 2FA активен</label>
      </div>`);
      GT.ui.modal.open({
        title: id ? "Редакция на потребител" : "Нов потребител", icon: "users", iconKind: "accent",
        body, note: t("common.loggedToAudit"),
        actions: [
          { label: t("common.cancel"), value: null, variant: "btn--ghost" },
          {
            label: t("common.save"), variant: "btn--primary", icon: "check",
            onClick: (b) => {
              const name = b.querySelector("#us-name").value.trim();
              const email = b.querySelector("#us-email").value.trim().toLowerCase();
              const emailField = b.querySelector("#us-email").closest(".field");
              if (!name) { b.querySelector("#us-name").focus(); return false; }
              if (!/@traffic-os\.bg$/.test(email)) { emailField.classList.add("is-invalid"); return false; }
              const role = b.querySelector("#us-role").value, regions = b.querySelector("#us-reg").value.trim() || "-", twofa = b.querySelector("#us-2fa").checked;
              if (u) { Object.assign(u, { name, email, role, regions, twofa });
                GT.state.appendAudit({ action: "Редактиран потребител: " + name, source: "Manual", reason: "Роля: " + GT.data.roles[role].label }); }
              else { GT.data.users.push({ id: "u" + Date.now(), name, email, role, regions, twofa, active: true });
                GT.data.credentials[email] = { password: "demo1234", token: "123456", userId: "u" + Date.now() };
                GT.state.appendAudit({ action: "Създаден потребител: " + name, source: "Manual", reason: "Роля: " + GT.data.roles[role].label }); }
              GT.ui.toast("Записано · имейл с активация е изпратен (демо)");
            }
          }
        ]
      }).then(() => { if (GT.router.current() === "menu") GT.router.rerender(); });
    }

    function logout() {
      GT.ui.modal.confirm({ title: t("top.logout"), message: "Сигурни ли сте, че искате да излезете?", icon: "log-out", iconKind: "accent", confirmLabel: t("top.logout"), danger: false })
        .then(ok => {
          if (!ok) return;
          GT.state.appendAudit({ action: "Изход от системата", source: "Manual", reason: "Ръчен logout" });
          GT.state.setSession(null);
          location.hash = "#/login";
        });
    }

    return { render };
  })();
})(window.GT = window.GT || {});
