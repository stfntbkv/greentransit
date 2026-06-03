(function (GT) {
  const S = GT.state._;
  let iv = null;

  function tick() {
    const now = Date.now();
    let expired = false;
    for (let i = S.activeModes.length - 1; i >= 0; i--) {
      const m = S.activeModes[i];
      m.remaining = Math.max(0, Math.round((m.endsAt - now) / 1000));
      if (m.endsAt <= now) {
        S.activeModes.splice(i, 1);
        expired = true;
        if (typeof m.onExpire === "function") { try { m.onExpire(m); } catch (e) { console.error(e); } }
      }
    }
    document.dispatchEvent(new CustomEvent("gt:tick"));
    if (expired && S.activeModes.length === 0) { clearInterval(iv); iv = null; }
    if (expired) GT.state.emit();
  }

  function start() { if (!iv) iv = setInterval(tick, 1000); }

  function add(mode) {

    mode.endsAt = Date.now() + mode.durationSec * 1000;
    mode.remaining = mode.durationSec;
    S.activeModes.push(mode);
    start();
    GT.state.emit();
    document.dispatchEvent(new CustomEvent("gt:tick"));
    return mode;
  }

  function remove(id) {
    const i = S.activeModes.findIndex(m => m.id === id);
    if (i > -1) {
      const m = S.activeModes.splice(i, 1)[0];
      if (S.activeModes.length === 0 && iv) { clearInterval(iv); iv = null; }
      GT.state.emit();
      document.dispatchEvent(new CustomEvent("gt:tick"));
      return m;
    }
    return null;
  }

  function get(id) { return S.activeModes.find(m => m.id === id); }
  function forIntersection(id) { return S.activeModes.find(m => m.intersectionId === id); }

  GT.timers = { start, add, remove, get, forIntersection, tick };
})(window.GT = window.GT || {});
