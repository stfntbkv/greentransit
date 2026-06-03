(function (GT) {
  GT.data = GT.data || {};
  GT.data.notifications = [
    {
      id: "n1", type: "warning", icon: "alert-triangle",
      title: "Изгоряла секция - мигащо жълто",
      body: "Светофарът на Руски паметник е преминал в авариен режим (мигащо жълто) поради изгоряла зелена секция.",
      ts: "2026-06-03 19:08:44", ageLabel: "преди 12 мин",
      read: false, intersectionId: "rp", ticketId: "T-1041"
    },
    {
      id: "n2", type: "info", icon: "camera",
      title: "Счупена камера (изолирана)",
      body: "Вандалска проява по камера на Орлов мост. AI модулът временно премина на данни само от съседните сензори.",
      ts: "2026-06-03 18:35:02", ageLabel: "преди 45 мин",
      read: false, intersectionId: "orlov", ticketId: "T-1039"
    },
    {
      id: "n3", type: "error", icon: "wifi-off",
      title: "Загуба на връзка с контролер",
      body: "Кръстовище пл. Сточна гара е преминало в автономен локален режим поради прекъсната връзка с централата.",
      ts: "2026-06-03 14:32:17", ageLabel: "преди 2 ч 04 мин",
      read: false, intersectionId: "stochna", ticketId: "T-1036"
    },
    {
      id: "n4", type: "info", icon: "check-circle",
      title: "Калибриране завършено",
      body: "Радарният сензор на бул. Витоша е калибриран успешно и върнат в експлоатация.",
      ts: "2026-06-03 13:50:10", ageLabel: "преди 3 ч",
      read: true, intersectionId: "vitosha", ticketId: "T-1030"
    }
  ];

  GT.data.notifTypeBadge = { error: "error", warning: "warn", info: "info" };
})(window.GT = window.GT || {});
