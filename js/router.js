(function (GT) {
  let currentName = null, currentMod = null;

  const ROUTES = {
    login:        { screen: "login",      auth: false },
    dashboard:    { screen: "dashboard",  auth: true },
    network:      { screen: "network",    auth: true },
    intersection: { screen: "intersection", auth: true },
    signals:      { screen: "signals",    auth: true },
    ai:           { screen: "ai",         auth: true },
    simulation:   { screen: "simulation", auth: true },
    menu:         { screen: "settings",   auth: true },
    audit:        { screen: "audit",      auth: true }
  };

  function parse() {
    const h = (location.hash || "").replace(/^#\/?/, "");
    const parts = h.split("/").filter(Boolean);
    return { name: parts[0] || "", params: parts.slice(1) };
  }

  function go() {
    let { name, params } = parse();
    const sess = GT.state.session;
    if (!name) name = sess ? "dashboard" : "login";
    let route = ROUTES[name];
    if (!route) { name = sess ? "dashboard" : "login"; route = ROUTES[name]; }

    if (route.auth && !sess) { location.hash = "#/login"; return; }
    if (name === "login" && sess) { location.hash = "#/dashboard"; return; }

    render(name, route, params);
  }

  function render(name, route, params) {
    const mod = GT.screens[route.screen];
    const host = document.getElementById("screen");
    if (!mod) { host.innerHTML = `<div class="screen"><div class="empty">Екранът не е намерен.</div></div>`; return; }

    if (currentMod && currentMod.onUnmount) { try { currentMod.onUnmount(); } catch (e) { console.error(e); } }
    if (GT.shell && GT.shell.closeNotifications) GT.shell.closeNotifications();

    const app = document.getElementById("app");
    app.classList.toggle("app--auth", name === "login");
    app.classList.toggle("app--sim", name === "simulation");

    host.innerHTML = "";
    const node = mod.render(params || []);
    host.appendChild(node);
    host.scrollTop = 0;

    currentName = name; currentMod = mod;
    GT.shell.render();
    if (mod.onMount) { try { mod.onMount(params || []); } catch (e) { console.error(e); } }
  }

  GT.router = {
    start() { window.addEventListener("hashchange", go); },
    go,
    current() { return currentName; },
    rerender() { go(); }
  };

  GT.rerender = function () { if (GT.shell) GT.shell.render(); GT.router.rerender(); };
})(window.GT = window.GT || {});
