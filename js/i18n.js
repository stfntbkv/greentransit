(function (GT) {
  const DICT = {
    bg: {
      "app.name": "GreenTransit",
      "app.tagline": "Система за управление на градския трафик",

      "nav.dashboard": "Табло",
      "nav.network": "Мрежа",
      "nav.signals": "Сигнали",
      "nav.ai": "AI",
      "nav.simulation": "Симулация",
      "nav.menu": "Меню",

      "top.emergency": "Спешен",
      "top.notifications": "Известия",
      "top.logout": "Излез",
      "top.online": "Онлайн",
      "top.cancelCorridor": "Отмени",
      "top.returnAI": "Върни към AI",

      "common.cancel": "Отказ",
      "common.confirm": "Потвърди",
      "common.save": "Запази",
      "common.close": "Затвори",
      "common.back": "Назад",
      "common.search": "Търсене",
      "common.all": "Всички",
      "common.required": "(задължително)",
      "common.savedToAudit": "Записано в одит лога",
      "common.loggedToAudit": "* Всяко действие се записва в одит лога.",

      "login.title": "Защитен вход в системата",
      "login.email": "Служебен имейл адрес",
      "login.password": "Парола",
      "login.twofa": "Двуфакторна автентикация",
      "login.token": "Токен",
      "login.biometric": "Биометрия",
      "login.tokenCode": "Код от хардуерен токен",
      "login.tokenHint": "Въведете 6-цифрения код от токена",
      "login.bioBtn": "Сканирай отпечатък",
      "login.bioHint": "Докоснете сензора за пръстов отпечатък",
      "login.submit": "Защитен вход",
      "login.forgotPass": "Забравена парола?",
      "login.lostToken": "Загубен токен?",
      "login.attempts": "Грешни данни. Имате {n} опита преди заключване.",
      "login.locked": "Акаунтът е заключен за 30 минути. Администраторът е уведомен.",
      "login.demo": "Демо: dispatcher@traffic-os.bg · demo1234 · токен 123456",

      "dash.title": "Табло",
      "dash.kpi.connected": "Свързани кръстовища",
      "dash.kpi.load": "Средно натоварване",
      "dash.kpi.signals": "Активни сигнали",
      "dash.kpi.ai": "AI оптимизация",
      "dash.map": "Карта на трафика",
      "dash.fullscreen": "Пълен екран",
      "dash.updated": "Последно обновено",
      "dash.refresh": "Обнови",
      "dash.vsYesterday": "спрямо {n}% вчера",

      "net.title": "Мрежа",
      "net.sortBy": "Подреди по",
      "net.sort.load": "Натоварване",
      "net.sort.name": "Име",
      "net.sort.status": "Статус",
      "net.load": "Натоварване",

      "status.normal": "Нормално",
      "status.warning": "Внимание",
      "status.error": "Грешка",
      "status.offline": "Офлайн"
    },
    en: {
      "app.name": "GreenTransit",
      "app.tagline": "Urban traffic management system",

      "nav.dashboard": "Dashboard",
      "nav.network": "Network",
      "nav.signals": "Signals",
      "nav.ai": "AI",
      "nav.simulation": "Simulation",
      "nav.menu": "Menu",

      "top.emergency": "Emergency",
      "top.notifications": "Notifications",
      "top.logout": "Log out",
      "top.online": "Online",
      "top.cancelCorridor": "Cancel",
      "top.returnAI": "Return to AI",

      "common.cancel": "Cancel",
      "common.confirm": "Confirm",
      "common.save": "Save",
      "common.close": "Close",
      "common.back": "Back",
      "common.search": "Search",
      "common.all": "All",
      "common.required": "(required)",
      "common.savedToAudit": "Saved to the audit log",
      "common.loggedToAudit": "* Every action is recorded in the audit log.",

      "login.title": "Secure sign-in",
      "login.email": "Work email address",
      "login.password": "Password",
      "login.twofa": "Two-factor authentication",
      "login.token": "Token",
      "login.biometric": "Biometric",
      "login.tokenCode": "Hardware token code",
      "login.tokenHint": "Enter the 6-digit code from the token",
      "login.bioBtn": "Scan fingerprint",
      "login.bioHint": "Touch the fingerprint sensor",
      "login.submit": "Secure sign-in",
      "login.forgotPass": "Forgot password?",
      "login.lostToken": "Lost token?",
      "login.attempts": "Wrong credentials. {n} attempts left before lockout.",
      "login.locked": "Account locked for 30 minutes. The administrator was notified.",
      "login.demo": "Demo: dispatcher@traffic-os.bg · demo1234 · token 123456",

      "dash.title": "Dashboard",
      "dash.kpi.connected": "Connected intersections",
      "dash.kpi.load": "Average load",
      "dash.kpi.signals": "Active signals",
      "dash.kpi.ai": "AI optimization",
      "dash.map": "Traffic map",
      "dash.fullscreen": "Full screen",
      "dash.updated": "Last updated",
      "dash.refresh": "Refresh",
      "dash.vsYesterday": "vs {n}% yesterday",

      "net.title": "Network",
      "net.sortBy": "Sort by",
      "net.sort.load": "Load",
      "net.sort.name": "Name",
      "net.sort.status": "Status",
      "net.load": "Load",

      "status.normal": "Normal",
      "status.warning": "Warning",
      "status.error": "Error",
      "status.offline": "Offline"
    }
  };

  let lang = localStorage.getItem("gt.lang") || "bg";

  GT.getLang = () => lang;
  GT.setLang = function (l) {
    if (!DICT[l] || l === lang) return;
    lang = l;
    localStorage.setItem("gt.lang", l);
    document.documentElement.lang = l;
    if (GT.rerender) GT.rerender();
  };
  GT.t = function (key, vars) {
    let s = (DICT[lang] && DICT[lang][key]) || (DICT.bg[key]) || key;
    if (vars) for (const k in vars) s = s.replace("{" + k + "}", vars[k]);
    return s;
  };

  document.documentElement.lang = lang;
})(window.GT = window.GT || {});
