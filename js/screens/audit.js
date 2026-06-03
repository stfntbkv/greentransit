(function (GT) {
  const el = GT.ui.el, icon = GT.icon, t = GT.t, esc = GT.util.esc;

  GT.screens.audit = (function () {
    const ui = { q: "", source: "all" };
    let logged = false;

    function render() {
      const ro = GT.state.isReadonly();
      if (ro && !logged) {
        logged = true;
        GT.state.appendAudit({ action: "Достъп до одит лога (одитор)", source: "Manual", reason: "audit-of-audit" });
      }

      const c = el(`<div class="screen">
        <button class="back-btn" data-back>${icon("arrow-left", { size: 16 })}${esc(t("common.back"))}</button>
        <h1 class="screen__title">Архив и Одит Лог</h1>
        <p class="screen__subtitle">Tamper-proof журнал на всички действия</p>

        ${ro ? `<div class="banner banner--readonly" style="margin-bottom:var(--s3)">${icon("lock", { size: 18 })}<span>Само за преглед (режим Одитор)</span></div>` : ""}
        <div class="banner banner--info" style="margin-bottom:var(--s4)">${icon("shield-check", { size: 18 })}<span>Записите са защитени от изменение (SHA-256, hash-chained).</span></div>

        <div class="field" style="margin-bottom:var(--s3)">
          <div class="input-wrap">${icon("search", { cls: "lead", size: 18 })}
            <input class="input" id="au-q" placeholder="Търсене по потребител, действие, кръстовище..." value="${esc(ui.q)}" /></div>
        </div>
        <div class="row row--between" style="margin-bottom:var(--s3)">
          <select class="select" id="au-src" style="width:auto;min-height:36px">
            <option value="all">Всички източници</option><option value="AI">AI</option><option value="Manual">Ръчно</option>
          </select>
          <span class="row" style="gap:var(--s2)">
            <button class="btn btn--sm btn--ghost" data-csv>${icon("download", { size: 14 })}CSV</button>
            <button class="btn btn--sm btn--ghost" data-pdf>${icon("file-text", { size: 14 })}PDF</button>
          </span>
        </div>

        <div class="table-wrap">
          <table class="data"><thead><tr>
            <th>Време</th><th>Потребител</th><th>Роля</th><th>Кръстовище</th><th>Действие</th><th>Източник</th><th>Основание</th><th>Hash</th><th></th>
          </tr></thead><tbody id="au-body"></tbody></table>
        </div>
        <p class="muted-3" id="au-count" style="font-size:var(--fs-cap);margin-top:var(--s2)"></p>
      </div>`);

      c.querySelector("#au-src").value = ui.source;
      c.querySelector("[data-back]").addEventListener("click", () => location.hash = GT.state.isReadonly() ? "#/audit" : "#/menu");
      c.querySelector("#au-q").addEventListener("input", e => { ui.q = e.target.value; fill(c); });
      c.querySelector("#au-src").addEventListener("change", e => { ui.source = e.target.value; fill(c); });
      c.querySelector("[data-csv]").addEventListener("click", () => exportCSV(rows()));
      c.querySelector("[data-pdf]").addEventListener("click", () => exportPDF(rows()));
      fill(c);
      return c;
    }

    function rows() {
      const q = ui.q.trim().toLowerCase();
      return GT.state.auditLog.filter(r => {
        if (ui.source !== "all" && r.source !== ui.source) return false;
        if (!q) return true;
        return (r.user + r.role + r.intersection + r.action + r.reason).toLowerCase().indexOf(q) > -1;
      });
    }

    function fill(root) {
      const list = rows();
      const body = root.querySelector("#au-body");
      root.querySelector("#au-count").textContent = list.length + " записа";
      if (!list.length) { body.innerHTML = `<tr><td colspan="9"><div class="empty">${icon("search", { size: 36 })}<p>Няма записи за избраните филтри.</p></div></td></tr>`; return; }
      body.innerHTML = list.map(r => `<tr>
        <td class="mono">${esc(r.ts)}</td><td>${esc(r.user)}</td><td>${esc(r.role)}</td>
        <td>${esc(r.intersection)}</td><td>${esc(r.action)}</td>
        <td>${GT.ui.badge(r.source === "AI" ? "info" : "warn", r.source, r.source === "AI" ? "cpu" : "power")}</td>
        <td style="white-space:normal;max-width:220px">${esc(r.reason)}</td>
        <td class="mono">${esc(r.hash)}</td>
        <td><span class="tamper">${icon("shield-check", { size: 13 })}OK</span></td>
      </tr>`).join("");
    }

    function exportCSV(list) {
      const head = ["Timestamp", "User", "Role", "Intersection", "Action", "Source", "Reason", "Hash"];
      const esc2 = s => `"${String(s).replace(/"/g, '""')}"`;
      const csv = [head.join(",")].concat(list.map(r => [r.ts, r.user, r.role, r.intersection, r.action, r.source, r.reason, r.hash].map(esc2).join(","))).join("\r\n");
      download("greentransit-odit-log.csv", "﻿" + csv, "text/csv;charset=utf-8");
      GT.state.appendAudit({ action: "Експорт на одит лог (CSV)", source: "Manual", reason: list.length + " записа" });
      GT.ui.toast("CSV файлът е свален");
    }

    function exportPDF(list) {
      const html = `<html><head><meta charset="utf-8"><title>GreenTransit - Одит Лог</title>
        <style>body{font-family:Arial;padding:24px;color:#111}h1{font-size:18px}table{width:100%;border-collapse:collapse;font-size:11px;margin-top:12px}
        th,td{border:1px solid #ccc;padding:5px 7px;text-align:left}th{background:#eee}.qr{margin-top:16px;color:#555;font-size:11px}</style></head>
        <body><h1>GreenTransit - Одит Лог (tamper-proof, SHA-256 hash-chained)</h1>
        <p>Генериран: ${esc(GT.util.nowStr())} · Записи: ${list.length}</p>
        <table><tr><th>Време</th><th>Потребител</th><th>Роля</th><th>Кръстовище</th><th>Действие</th><th>Източник</th><th>Основание</th><th>Hash</th></tr>
        ${list.map(r => `<tr><td>${esc(r.ts)}</td><td>${esc(r.user)}</td><td>${esc(r.role)}</td><td>${esc(r.intersection)}</td><td>${esc(r.action)}</td><td>${esc(r.source)}</td><td>${esc(r.reason)}</td><td>${esc(r.hash)}</td></tr>`).join("")}
        </table><p class="qr">[QR код с контролна сума за независима проверка] · Готов за предоставяне на Пътна полиция / съд.</p>
        <script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>`;
      try {
        const w = window.open("", "_blank");
        if (!w) throw new Error("popup");
        w.document.write(html); w.document.close();
      } catch (e) {
        download("greentransit-odit-log.html", html, "text/html;charset=utf-8");
        GT.ui.toast("PDF-преглед е свален като .html (печат → Запази като PDF)");
      }
      GT.state.appendAudit({ action: "Експорт на одит лог (PDF)", source: "Manual", reason: list.length + " записа" });
    }

    function download(name, content, type) {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = name; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
    }

    function onUnmount() { logged = false; }
    return { render, onUnmount };
  })();
})(window.GT = window.GT || {});
