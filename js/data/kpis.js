(function (GT) {
  GT.data = GT.data || {};

  GT.data.dashboardKpis = {
    connected: { value: 6, sub: "1 офлайн възел" },
    avgLoad:   { value: 53, yesterday: 45 },
    signals:   { value: 4, sub: "2 изискват внимание" },
    ai:        { managedPct: 85 }
  };

  GT.data.aiKpis = {
    algo: "Deep Q-Learning v3.2",
    managedLights: 120,
    congestion:  { value: "-18%", dir: "down", tip: "Намаление на задръстванията за 24 ч спрямо статичен график." },
    decisions:   { value: "14.2k", tip: "14.2k решения за последните 24 ч (базова линия 12k)." },
    anomalies:   { value: 23, tip: "23 отчетени аномалии за 24 ч. Натиснете за списък.",
      items: [
        { ts: "19:02", where: "Орлов мост", what: "Несъответствие камера/радар" },
        { ts: "18:21", where: "Цариградско", what: "Скок в потока > 3σ" },
        { ts: "17:45", where: "Руски паметник", what: "Сензор извън граници" }
      ] },
    dataQuality: { value: "98%", tip: "Дял на валидните входни данни от всички сензори." }
  };
})(window.GT = window.GT || {});
