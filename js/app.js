(function (GT) {
  function boot() {
    GT.state.init();
    GT.state.restoreSession();
    GT.shell.init();
    GT.router.start();
    GT.router.go();
  }
  if (document.readyState !== "loading") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})(window.GT = window.GT || {});
