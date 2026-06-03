(function (GT) {
  const el = GT.ui.el, icon = GT.icon, t = GT.t, esc = GT.util.esc;

  GT.screens.login = (function () {
    let method = "token";
    let bioOk = false;

    function render() {
      method = "token"; bioOk = false;
      const c = el(`<div class="screen login">
        <div class="login__brand">
          <img src="assets/logo.svg" alt="GreenTransit" />
          <h1>Green<span class="accent">Transit</span></h1>
          <p>${esc(t("app.tagline"))}</p>
        </div>

        <div class="card">
          <h1 class="screen__title" style="margin-bottom:var(--s4)">${esc(t("login.title"))}</h1>

          <div class="banner banner--readonly" id="login-error" style="display:none;margin-bottom:var(--s4)">
            ${icon("alert-triangle", { size: 18 })}<span id="login-error-msg"></span>
          </div>

          <div class="field">
            <label for="lg-email">${esc(t("login.email"))}</label>
            <div class="input-wrap">${icon("mail", { cls: "lead", size: 18 })}
              <input class="input" id="lg-email" type="email" autocomplete="username" placeholder="operator@traffic-os.bg" value="dispatcher@traffic-os.bg" />
            </div>
          </div>

          <div class="field">
            <label for="lg-pass">${esc(t("login.password"))}</label>
            <div class="input-wrap">${icon("lock", { cls: "lead", size: 18 })}
              <input class="input" id="lg-pass" type="password" autocomplete="current-password" placeholder="••••••••" value="demo1234" />
              <button class="input-icon-btn" type="button" id="lg-eye" aria-label="Покажи паролата">${icon("eye", { size: 18 })}</button>
            </div>
          </div>

          <div class="field">
            <label>${esc(t("login.twofa"))}</label>
            <div class="segment" role="group" aria-label="${esc(t("login.twofa"))}">
              <button type="button" class="segment__opt" data-m="token" aria-pressed="true">${icon("key", { size: 20 })}${esc(t("login.token"))}</button>
              <button type="button" class="segment__opt" data-m="biometric" aria-pressed="false">${icon("fingerprint", { size: 20 })}${esc(t("login.biometric"))}</button>
            </div>
          </div>

          <div id="twofa-extra"></div>

          <div class="login__links">
            <a href="#" data-forgot>${esc(t("login.forgotPass"))}</a>
            <a href="#" data-lost>${esc(t("login.lostToken"))}</a>
          </div>

          <button class="btn btn--primary" id="lg-submit">${icon("shield-check", { size: 18 })}${esc(t("login.submit"))}</button>
          <p class="field__hint" style="margin-top:var(--s3)">${esc(t("login.demo"))}</p>
        </div>

        <div class="login__foot">
          <span>© 2026 GreenTransit</span>
          <span class="muted-3" style="font-size:var(--fs-cap)">демо прототип</span>
        </div>
      </div>`);

      const extra = c.querySelector("#twofa-extra");
      renderExtra(extra);

      c.querySelector("#lg-eye").addEventListener("click", () => {
        const inp = c.querySelector("#lg-pass");
        const show = inp.type === "password";
        inp.type = show ? "text" : "password";
        c.querySelector("#lg-eye").innerHTML = icon(show ? "eye-off" : "eye", { size: 18 });
      });

      c.querySelectorAll(".segment__opt").forEach(b => b.addEventListener("click", () => {
        method = b.dataset.m; bioOk = false;
        c.querySelectorAll(".segment__opt").forEach(x => x.setAttribute("aria-pressed", x.dataset.m === method));
        renderExtra(extra);
      }));

      c.querySelector("[data-forgot]").addEventListener("click", e => { e.preventDefault(); recover("pass"); });
      c.querySelector("[data-lost]").addEventListener("click", e => { e.preventDefault(); recover("token"); });

      c.querySelector("#lg-submit").addEventListener("click", () => submit(c));
      c.addEventListener("keydown", e => { if (e.key === "Enter") submit(c); });

      return c;
    }

    function renderExtra(host) {
      if (method === "token") {
        host.innerHTML = `<div class="field">
          <label for="lg-code">${esc(t("login.tokenCode"))}</label>
          <div class="input-wrap">${icon("key", { cls: "lead", size: 18 })}
            <input class="input code-input" id="lg-code" inputmode="numeric" maxlength="6" placeholder="0 0 0 0 0 0" value="123456" aria-describedby="lg-code-hint" />
          </div>
          <p class="field__hint" id="lg-code-hint">${esc(t("login.tokenHint"))}</p>
        </div>`;
      } else {
        host.innerHTML = `<div class="field">
          <label>${esc(t("login.biometric"))}</label>
          <button type="button" class="btn btn--ghost" id="lg-bio">${icon("fingerprint", { size: 18 })}<span>${esc(t("login.bioBtn"))}</span></button>
          <p class="field__hint">${esc(t("login.bioHint"))}</p>
        </div>`;
        host.querySelector("#lg-bio").addEventListener("click", e => {
          bioOk = true;
          e.currentTarget.classList.remove("btn--ghost"); e.currentTarget.classList.add("btn--primary");
          e.currentTarget.querySelector("span").textContent = "Разпознат ✓";
        });
      }
    }

    function showError(msg) {
      const box = document.getElementById("login-error");
      document.getElementById("login-error-msg").textContent = msg;
      box.style.display = "flex";
    }

    function submit(c) {
      if (GT.state._.locked) { showError(t("login.locked")); return; }
      const email = c.querySelector("#lg-email").value.trim().toLowerCase();
      const pass = c.querySelector("#lg-pass").value;
      const codeEl = c.querySelector("#lg-code");
      const code = codeEl ? codeEl.value.trim() : "";
      const cred = GT.data.credentials[email];

      const second = method === "biometric" ? bioOk : (code === (cred && cred.token));
      const ok = cred && cred.password === pass && second;

      if (ok) {
        const u = GT.data.users.find(x => x.id === cred.userId);
        GT.state._.loginAttemptsLeft = 5;
        GT.state.setSession({ userId: u.id, name: u.name, email: u.email, role: u.role });
        GT.state.appendAudit({ action: "Вход в системата", source: "Manual", reason: method === "biometric" ? "2FA: биометрия" : "2FA: хардуерен токен" });
        location.hash = u.role === "auditor" ? "#/audit" : "#/dashboard";
        return;
      }

      if (method === "biometric" && !bioOk) { showError("Моля, потвърдете с биометрия."); return; }
      const left = --GT.state._.loginAttemptsLeft;
      if (left <= 0) { GT.state._.locked = true; showError(t("login.locked")); }
      else showError(t("login.attempts", { n: left }));
    }

    function recover(kind) {
      GT.ui.modal.open({
        title: kind === "pass" ? t("login.forgotPass") : t("login.lostToken"),
        icon: kind === "pass" ? "mail" : "key", iconKind: "accent",
        body: kind === "pass"
          ? `<p class="muted">Въведете служебния си имейл. Ще получите линк за нулиране на паролата.</p>
             <div class="field" style="margin-top:var(--s4)"><label>Служебен имейл</label>
             <div class="input-wrap">${icon("mail", { cls: "lead", size: 18 })}<input class="input" type="email" placeholder="вие@traffic-os.bg"></div></div>`
          : `<p class="muted">Заявка за временен достъп ще бъде изпратена на администратора. След одобрение ще можете да влезете с биометрия за 24 часа, докато получите нов токен.</p>`,
        actions: [
          { label: t("common.cancel"), value: false, variant: "btn--ghost" },
          { label: kind === "pass" ? "Изпрати линк" : "Заяви достъп", value: true, variant: "btn--primary", icon: "shield-check" }
        ]
      }).then(r => { if (r) GT.ui.toast(kind === "pass" ? "Линк за нулиране е изпратен (демо)." : "Заявката е изпратена на администратора (демо)."); });
    }

    return { render };
  })();
})(window.GT = window.GT || {});
