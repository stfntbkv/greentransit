(function (GT) {

  const pad = n => String(n).padStart(2, "0");
  GT.util = {
    nowStr() {
      const d = new Date();
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
             `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    clockStr() { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; },
    hhmm() { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; },
    mmss(sec) { sec = Math.max(0, sec | 0); return `${pad((sec / 60) | 0)}:${pad(sec % 60)}`; },
    hash(str) { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0; return ("00000000" + h.toString(16)).slice(-8); },
    clone(o) { return JSON.parse(JSON.stringify(o)); },
    esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  };

  const S = {
    session: null,
    auditLog: [],
    notifications: [],
    tickets: [],
    iruntime: {},
    activeModes: [],
    simulation: { savedScenarios: [] },
    loginAttemptsLeft: 5,
    locked: false
  };

  const subs = new Set();
  function emit() { subs.forEach(fn => { try { fn(S); } catch (e) { console.error(e); } }); }
  function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }

  function appendAudit(p) {
    const ts = p.ts || GT.util.nowStr();
    const user = p.user || (S.session ? S.session.name : "Система");
    const role = p.role || (S.session ? GT.data.roles[S.session.role].label : "Система");
    const prevHash = S.auditLog.length ? S.auditLog[0].hash : "00000000";
    const entry = {
      ts, user, role,
      intersection: p.intersection || "-",
      action: p.action || "-",
      source: p.source || "Manual",
      reason: p.reason || "-",
      prevHash, hash: GT.util.hash(prevHash + ts + user + p.action + (p.reason || ""))
    };
    if (p.seed) { S.auditLog.push(entry); } else { S.auditLog.unshift(entry); emit(); }
    return entry;
  }

  function seedAudit() {
    const seeds = [
      ["2026-06-03 07:01:12", "Мария Петрова", "Оператор", "-", "Вход в системата", "Manual", "Начало на смяна"],
      ["2026-06-03 07:15:40", "Система", "Система", "Цариградско / Шипченски проход", "AI: оптимизация на фази", "AI", "Сутрешен пик"],
      ["2026-06-03 08:03:55", "Стефан Табаков", "Диспечер", "Руски паметник", "Зелен коридор (линейка)", "Manual", "Спешна помощ - чл. 91 ЗДвП"],
      ["2026-06-03 08:09:30", "Система", "Система", "Руски паметник", "Зелен коридор приключи", "AI", "Изтекъл таймер (3 мин)"],
      ["2026-06-03 09:22:18", "Система", "Система", "Орлов мост", "AI: пренасочване на поток", "AI", "Засечено задръстване"],
      ["2026-06-03 10:40:02", "Георги Стоянов", "Администратор", "-", "Промяна на роля: Н. Динев → Техник", "Manual", "Кадрова промяна"],
      ["2026-06-03 11:05:47", "Система", "Система", "бул. Витоша / Патриарх Евтимий", "AI: удължена зелена фаза", "AI", "Поток над прага"],
      ["2026-06-03 12:30:11", "Мария Петрова", "Оператор", "Орлов мост", "Създаден сервизен билет T-1039", "Manual", "Счупена камера"],
      ["2026-06-03 13:50:10", "Николай Динев", "Техник", "бул. Витоша / Патриарх Евтимий", "Билет T-1030 → Решен", "Manual", "Калибриран радар"],
      ["2026-06-03 14:32:17", "Система", "Система", "пл. Сточна гара", "Преминаване в автономен режим", "AI", "Heartbeat timeout > 30 сек"],
      ["2026-06-03 15:18:33", "Система", "Система", "НДК", "AI: синхронизация на зелена вълна", "AI", "Координация с пл. Македония"],
      ["2026-06-03 16:44:09", "Стефан Табаков", "Диспечер", "Руски паметник", "Ръчно: жълто", "Manual", "ПТП - чл. 16 ал. 1 ЗДвП"],
      ["2026-06-03 16:51:48", "Система", "Система", "Руски паметник", "Ръчният режим изтече", "AI", "Изтекъл таймер (5 мин)"],
      ["2026-06-03 17:45:00", "Система", "Система", "Руски паметник", "Засечена аномалия (сензор)", "AI", "Стойности извън граници"],
      ["2026-06-03 18:35:02", "Система", "Система", "Орлов мост", "Изолиран компонент: камера 2", "AI", "Вандализъм"],
      ["2026-06-03 19:08:44", "Система", "Система", "Руски паметник", "Превключване в мигащо жълто", "AI", "Изгоряла секция (ЗДвП)"]
    ];
    seeds.forEach(s => appendAudit({ ts: s[0], user: s[1], role: s[2], intersection: s[3], action: s[4], source: s[5], reason: s[6], seed: true }));

    S.auditLog.reverse();
  }

  function intersection(id) {
    const base = GT.data.intersectionById(id);
    if (!base) return null;
    return Object.assign({}, base, S.iruntime[id] || {});
  }
  function setIntersection(id, patch) {
    S.iruntime[id] = Object.assign({}, S.iruntime[id] || {}, patch);
    emit();
  }

  function setSession(sess) {
    S.session = sess;
    if (sess) localStorage.setItem("gt.session", JSON.stringify(sess));
    else localStorage.removeItem("gt.session");
    emit();
  }
  function restoreSession() {
    try { const raw = localStorage.getItem("gt.session"); if (raw) S.session = JSON.parse(raw); } catch (e) {}
    return S.session;
  }
  function role() { return S.session ? GT.data.roles[S.session.role] : null; }
  function isReadonly() { return !!(role() && role().readonly); }

  function init() {
    S.notifications = GT.util.clone(GT.data.notifications);
    S.tickets = GT.util.clone(GT.data.incidents);
    seedAudit();
  }

  GT.state = {
    _: S,
    subscribe, emit, init,
    appendAudit,
    intersection, setIntersection,
    setSession, restoreSession, role, isReadonly,
    get session() { return S.session; },
    get auditLog() { return S.auditLog; },
    get notifications() { return S.notifications; },
    get tickets() { return S.tickets; },
    get activeModes() { return S.activeModes; },
    unreadCount() { return S.notifications.filter(n => !n.read).length; },
    activeSignalsCount() { return S.tickets.filter(t => t.status === "new" || t.status === "in_progress").length; }
  };
})(window.GT = window.GT || {});
