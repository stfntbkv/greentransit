(function (GT) {
  const list = [
    {
      id: "rp", name: "Руски паметник", district: "Триадица",
      status: "error", load: 95, ai: false, phase: "yellow",
      mx: 38, my: 64, lat: 42.6862, lng: 23.3142,
      cameras: [{ id: "CAM 01", online: true }, { id: "CAM 02", online: true }],
      ai_status: { algo: "DQL v3.2", forecast: "Пик след 15 мин", efficiency: 92 },
      sensors: [
        { name: "Камера 1 (Север)", status: "ok" },
        { name: "Индуктивна рамка B2", status: "error" },
        { name: "Радар (Изток)", status: "warning" }
      ],
      neighbors: ["ndk", "orlov", "makedonia"],
      manualHistory: [
        { ts: "2026-06-03 18:42:11", user: "В. Апостолов", action: "Ръчно: червено (всички посоки)", reason: "чл. 16 ал. 1 ЗДвП - отклоняване поради ПТП" },
        { ts: "2026-05-29 08:03:55", user: "С. Табаков", action: "Зелен коридор (линейка)", reason: "Спешна помощ - чл. 91 ЗДвП" }
      ],
      offlineInfo: null
    },
    {
      id: "stochna", name: "пл. Сточна гара", district: "Сердика",
      status: "offline", load: 0, ai: false, phase: "flash-yellow",
      mx: 56, my: 22, lat: 42.7129, lng: 23.3331,
      cameras: [{ id: "CAM 01", online: false }],
      ai_status: { algo: "-", forecast: "няма данни", efficiency: 0 },
      sensors: [
        { name: "Камера 1 (Юг)", status: "offline" },
        { name: "Индуктивна рамка A1", status: "offline" }
      ],
      neighbors: ["lavov", "carigradsko"],
      manualHistory: [],
      offlineInfo: {
        disconnectedAt: "2026-06-03 14:32:17",
        safeSchedule: "Мигащо жълто (авариен график)",
        lastSync: "2026-06-03 14:31:50",
        incidentsCount: 3
      }
    },
    {
      id: "vitosha", name: "бул. Витоша / Патриарх Евтимий", district: "Триадица",
      status: "warning", load: 60, ai: true, phase: "green",
      mx: 30, my: 50, lat: 42.6892, lng: 23.3193,
      cameras: [{ id: "CAM 01", online: true }, { id: "CAM 02", online: true }],
      ai_status: { algo: "DQL v3.2", forecast: "Стабилно", efficiency: 88 },
      sensors: [
        { name: "Камера 1 (Север)", status: "ok" },
        { name: "Индуктивна рамка B1", status: "ok" },
        { name: "Радар (Запад)", status: "warning" }
      ],
      neighbors: ["ndk", "makedonia"],
      manualHistory: [], offlineInfo: null
    },
    {
      id: "orlov", name: "Орлов мост", district: "Средец",
      status: "warning", load: 72, ai: true, phase: "red",
      mx: 60, my: 58, lat: 42.6907, lng: 23.3385,
      cameras: [{ id: "CAM 01", online: true }],
      ai_status: { algo: "DQL v3.2", forecast: "Пик след 25 мин", efficiency: 84 },
      sensors: [
        { name: "Камера 1 (Изток)", status: "ok" },
        { name: "Камера 2 (Запад)", status: "error" },
        { name: "Индуктивна рамка C2", status: "ok" }
      ],
      neighbors: ["rp", "ndk", "carigradsko"],
      manualHistory: [], offlineInfo: null
    },
    {
      id: "makedonia", name: "пл. Македония", district: "Триадица",
      status: "normal", load: 48, ai: true, phase: "green",
      mx: 40, my: 46, lat: 42.6921, lng: 23.3169,
      cameras: [{ id: "CAM 01", online: true }],
      ai_status: { algo: "DQL v3.2", forecast: "Стабилно", efficiency: 94 },
      sensors: [{ name: "Камера 1 (Център)", status: "ok" }, { name: "Индуктивна рамка A3", status: "ok" }],
      neighbors: ["vitosha", "rp", "ndk"], manualHistory: [], offlineInfo: null
    },
    {
      id: "ndk", name: "НДК", district: "Триадица",
      status: "normal", load: 55, ai: true, phase: "green",
      mx: 46, my: 56, lat: 42.6849, lng: 23.3187,
      cameras: [{ id: "CAM 01", online: true }, { id: "CAM 02", online: true }],
      ai_status: { algo: "DQL v3.2", forecast: "Стабилно", efficiency: 91 },
      sensors: [{ name: "Камера 1 (Север)", status: "ok" }, { name: "Радар (Юг)", status: "ok" }],
      neighbors: ["rp", "orlov", "vitosha", "makedonia"], manualHistory: [], offlineInfo: null
    },
    {
      id: "bulgaria", name: "пл. България", district: "Триадица",
      status: "normal", load: 40, ai: true, phase: "green",
      mx: 34, my: 78, lat: 42.6681, lng: 23.3118,
      cameras: [{ id: "CAM 01", online: true }],
      ai_status: { algo: "DQL v3.2", forecast: "Спокойно", efficiency: 96 },
      sensors: [{ name: "Камера 1 (Юг)", status: "ok" }], neighbors: ["rp", "ndk"], manualHistory: [], offlineInfo: null
    },
    {
      id: "lavov", name: "Лъвов мост", district: "Сердика",
      status: "normal", load: 38, ai: true, phase: "red",
      mx: 50, my: 30, lat: 42.7083, lng: 23.3231,
      cameras: [{ id: "CAM 01", online: true }],
      ai_status: { algo: "DQL v3.2", forecast: "Спокойно", efficiency: 93 },
      sensors: [{ name: "Камера 1 (Север)", status: "ok" }, { name: "Индуктивна рамка D1", status: "ok" }],
      neighbors: ["stochna", "carigradsko"], manualHistory: [], offlineInfo: null
    },
    {
      id: "seminariata", name: "Семинарията", district: "Лозенец",
      status: "normal", load: 33, ai: true, phase: "green",
      mx: 70, my: 74, lat: 42.6661, lng: 23.3331,
      cameras: [{ id: "CAM 01", online: true }],
      ai_status: { algo: "DQL v3.2", forecast: "Спокойно", efficiency: 95 },
      sensors: [{ name: "Камера 1 (Изток)", status: "ok" }], neighbors: ["carigradsko"], manualHistory: [], offlineInfo: null
    },
    {
      id: "carigradsko", name: "Цариградско / Шипченски проход", district: "Слатина",
      status: "normal", load: 51, ai: true, phase: "green",
      mx: 76, my: 50, lat: 42.6803, lng: 23.3621,
      cameras: [{ id: "CAM 01", online: true }, { id: "CAM 02", online: true }],
      ai_status: { algo: "DQL v3.2", forecast: "Пик след 40 мин", efficiency: 89 },
      sensors: [{ name: "Камера 1 (Изток)", status: "ok" }, { name: "Радар (Запад)", status: "ok" }],
      neighbors: ["orlov", "lavov", "seminariata"], manualHistory: [], offlineInfo: null
    },
    {
      id: "journalist", name: "пл. Журналист", district: "Лозенец",
      status: "normal", load: 29, ai: true, phase: "green",
      mx: 64, my: 68, lat: 42.6797, lng: 23.3411,
      cameras: [{ id: "CAM 01", online: true }],
      ai_status: { algo: "DQL v3.2", forecast: "Спокойно", efficiency: 97 },
      sensors: [{ name: "Камера 1 (Юг)", status: "ok" }], neighbors: ["orlov", "carigradsko"], manualHistory: [], offlineInfo: null
    },
    {
      id: "popa", name: "пл. Попа", district: "Средец",
      status: "normal", load: 44, ai: true, phase: "red",
      mx: 54, my: 44, lat: 42.6914, lng: 23.3268,
      cameras: [{ id: "CAM 01", online: true }],
      ai_status: { algo: "DQL v3.2", forecast: "Стабилно", efficiency: 90 },
      sensors: [{ name: "Камера 1 (Център)", status: "ok" }], neighbors: ["ndk", "orlov"], manualHistory: [], offlineInfo: null
    }
  ];

  const byId = {};
  list.forEach(i => { byId[i.id] = i; });

  GT.data = GT.data || {};
  GT.data.intersections = list;
  GT.data.intersectionById = id => byId[id];

  GT.data.networkTotals = { all: 120, normal: 85, warning: 22, error: 8, offline: 5 };
})(window.GT = window.GT || {});
