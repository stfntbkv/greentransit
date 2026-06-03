(function (GT) {
  GT.data = GT.data || {};

  GT.data.roles = {
    operator:   { label: "Оператор",   badge: "info",    canManual: false, canAI: false, canAudit: true,  canManage: false, readonly: false },
    dispatcher: { label: "Диспечер",   badge: "error",   canManual: true,  canAI: true,  canAudit: true,  canManage: false, readonly: false },
    admin:      { label: "Администратор", badge: "accent", canManual: true, canAI: true,  canAudit: true,  canManage: true,  readonly: false },
    technician: { label: "Техник",     badge: "warn",    canManual: false, canAI: false, canAudit: false, canManage: false, readonly: false },
    auditor:    { label: "Одитор",     badge: "neutral", canManual: false, canAI: false, canAudit: true,  canManage: false, readonly: true }
  };

  GT.data.users = [
    { id: "u1", name: "Иван Иванов",      email: "ivan@traffic-os.bg",       role: "dispatcher", regions: "Всички райони",      twofa: true,  active: true },
    { id: "u2", name: "Мария Петрова",    email: "operator@traffic-os.bg",   role: "operator",   regions: "Триадица, Средец",   twofa: true,  active: true },
    { id: "u3", name: "Стефан Табаков",   email: "dispatcher@traffic-os.bg", role: "dispatcher", regions: "Всички райони",      twofa: true,  active: true },
    { id: "u4", name: "Георги Стоянов",   email: "admin@traffic-os.bg",      role: "admin",      regions: "Всички райони",      twofa: true,  active: true },
    { id: "u5", name: "Николай Динев",    email: "tech@traffic-os.bg",       role: "technician", regions: "Изток",              twofa: false, active: true },
    { id: "u6", name: "insp. Д. Колев",   email: "auditor@traffic-os.bg",    role: "auditor",    regions: "Само одит лог",      twofa: true,  active: true }
  ];

  const creds = {};
  GT.data.users.forEach(u => { creds[u.email] = { password: "demo1234", token: "123456", userId: u.id }; });
  GT.data.credentials = creds;
})(window.GT = window.GT || {});
