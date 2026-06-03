(function (GT) {
  GT.data = GT.data || {};
  GT.data.routes = [
    { id: "r-vma",  name: "пл. България → ВМА",        intersections: ["bulgaria", "ndk", "rp", "orlov"],            durationSec: 180 },
    { id: "r-pirog",name: "Лъвов мост → Пирогов",       intersections: ["lavov", "stochna", "ndk", "bulgaria"],       durationSec: 210 },
    { id: "r-isul", name: "Орлов мост → ИСУЛ",          intersections: ["orlov", "carigradsko", "journalist"],        durationSec: 150 },
    { id: "r-center",name:"Витоша → пл. Македония (център)", intersections: ["vitosha", "makedonia", "ndk"],          durationSec: 120 }
  ];
})(window.GT = window.GT || {});
