(function (GT) {
  GT.data = GT.data || {};
  GT.data.incidents = [
    {
      id: "T-1041", type: "burnt_section", icon: "alert-octagon",
      title: "Изгоряла секция - мигащо жълто",
      priority: "high", status: "new",
      location: "Руски паметник", intersectionId: "rp",
      ageMin: 12, assignedTeam: null,
      desc: "Светофарът на Руски паметник е преминал в авариен режим (мигащо жълто) поради изгоряла зелена секция в посока юг. Кръстовището е обезопасено по ЗДвП."
    },
    {
      id: "T-1039", type: "broken_camera", icon: "camera",
      title: "Счупена камера (изолирана)",
      priority: "medium", status: "in_progress",
      location: "Орлов мост", intersectionId: "orlov",
      ageMin: 45, assignedTeam: "Екип Изток",
      desc: "Вандалска проява по камера 2 на Орлов мост. AI модулът временно компенсира с данни от съседните сензори. Камерата е изключена от алгоритъма."
    },
    {
      id: "T-1036", type: "connection_loss", icon: "wifi-off",
      title: "Загуба на връзка с контролер",
      priority: "high", status: "new",
      location: "пл. Сточна гара", intersectionId: "stochna",
      ageMin: 124, assignedTeam: null,
      desc: "Кръстовище пл. Сточна гара е преминало в автономен локален режим поради прекъсната връзка с централата. Активен е авариен график 'мигащо жълто'."
    },
    {
      id: "T-1030", type: "sensor_fault", icon: "radar",
      title: "Аномалия в радарен сензор",
      priority: "low", status: "resolved",
      location: "бул. Витоша / Патриарх Евтимий", intersectionId: "vitosha",
      ageMin: 320, assignedTeam: "Екип Център",
      desc: "Радарът в посока запад отчиташе стойности извън физическите граници. Сензорът е калибриран и върнат в експлоатация."
    },
    {
      id: "T-1024", type: "sensor_fault", icon: "radar",
      title: "Индуктивна рамка - прекъсване",
      priority: "medium", status: "closed",
      location: "Цариградско / Шипченски проход", intersectionId: "carigradsko",
      ageMin: 980, assignedTeam: "Екип Изток",
      desc: "Индуктивна рамка с прекъсване в кабела. Подменена и тествана успешно. Билетът е затворен."
    }
  ];

  GT.data.ticketStatusOrder = ["new", "in_progress", "resolved", "closed"];
  GT.data.ticketStatusLabel = {
    new: "Нов", in_progress: "В процес", resolved: "Решен", closed: "Затворен"
  };
  GT.data.ticketStatusBadge = {
    new: "error", in_progress: "warn", resolved: "ok", closed: "neutral"
  };
  GT.data.priorityLabel = { high: "Висок приоритет", medium: "Среден приоритет", low: "Нисък приоритет" };
  GT.data.priorityBadge = { high: "error", medium: "warn", low: "neutral" };
})(window.GT = window.GT || {});
