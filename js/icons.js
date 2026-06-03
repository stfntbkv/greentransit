(function (GT) {
  const P = {
    dashboard: '<path d="M3 13h4l2-7 4 14 2-7h6"/>',
    network:   '<polygon points="1 6 8 3 16 6 23 3 23 18 16 21 8 18 1 21"/><line x1="8" y1="3" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="21"/>',
    signals:   '<path d="M12 2 3 6v6c0 5 3.8 8.5 9 10 5.2-1.5 9-5 9-10V6z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="16.5" r=".6" fill="currentColor"/>',
    ai:        '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/><rect x="10" y="10" width="4" height="4" rx="1"/>',
    sim:       '<path d="M9 3h6M10 3v6L4.6 18A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.8-3L14 9V3"/><line x1="8" y1="14" x2="16" y2="14"/>',
    menu:      '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H23a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    shield:    '<path d="M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5z"/>',
    "shield-alert": '<path d="M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5z"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="15.5" r=".6" fill="currentColor"/>',
    "shield-check": '<path d="M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5z"/><path d="m9 12 2 2 4-4"/>',
    bell:      '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    mail:      '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    lock:      '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    key:       '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.5 12.5 8-8M16 5l3 3M14 7l3 3"/>',
    fingerprint:'<path d="M12 10a2 2 0 0 0-2 2c0 2-1 4-1 4"/><path d="M5 12a7 7 0 0 1 14 0c0 2 0 4-.5 5.5"/><path d="M8.5 19c1-2 1.5-4 1.5-7a2 2 0 0 1 4 0c0 3 .5 5 0 7"/><path d="M3 14c0-5 4-9 9-9"/>',
    eye:       '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c6.5 0 10 7 10 7a17 17 0 0 1-3 3.7M6.6 6.6A17 17 0 0 0 2 11s3.5 7 10 7a10 10 0 0 0 4.4-1M3 3l18 18"/><path d="M9.5 9.5a3 3 0 0 0 4.2 4.2"/>',
    "check-circle":'<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    "alert-triangle":'<path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><line x1="12" y1="9" x2="12" y2="13.5"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    "alert-octagon":'<path d="M7.9 2h8.2L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9z"/><line x1="12" y1="8" x2="12" y2="12.5"/><circle cx="12" cy="16" r=".6" fill="currentColor"/>',
    info:      '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r=".7" fill="currentColor"/>',
    x:         '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
    "chevron-right":'<polyline points="9 6 15 12 9 18"/>',
    "chevron-down":'<polyline points="6 9 12 15 18 9"/>',
    "arrow-left":'<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    "map-pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    camera:    '<path d="M3 7h3l2-2h8l2 2h3v12H3z"/><circle cx="12" cy="13" r="4"/>',
    cpu:       '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>',
    gauge:     '<path d="M12 14 16 9"/><circle cx="12" cy="13" r="9"/><circle cx="12" cy="13" r="1" fill="currentColor"/>',
    "bar-chart":'<line x1="6" y1="20" x2="6" y2="12"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="18" y1="20" x2="18" y2="9"/>',
    database:  '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    users:     '<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.5 3.1-6 7-6s7 2.5 7 6"/><path d="M16 5.5a3.5 3.5 0 0 1 0 6.8M22 21c0-2.8-1.6-4.8-4-5.6"/>',
    globe:     '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>',
    power:     '<path d="M12 3v9"/><path d="M6.4 6.4a8 8 0 1 0 11.2 0"/>',
    zap:       '<polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2"/>',
    sliders:   '<line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="9" cy="8" r="2.5" fill="var(--surface-1)"/><circle cx="15" cy="16" r="2.5" fill="var(--surface-1)"/>',
    refresh:   '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><polyline points="21 3 21 9 15 9"/>',
    download:  '<path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/><path d="M5 21h14"/>',
    "file-text":'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="14 3 14 9 20 9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>',
    search:    '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>',
    filter:    '<polygon points="3 4 21 4 14 12.5 14 19 10 21 10 12.5 3 4"/>',
    plus:      '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    clock:     '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>',
    "wifi-off":'<path d="M2 8.8a16 16 0 0 1 5-3M22 8.8a16 16 0 0 0-6.8-3.6M8.5 12.5a8 8 0 0 1 3-1.4M12 16h.01"/><line x1="2" y1="2" x2="22" y2="22"/>',
    wrench:    '<path d="M14.5 6.5a4 4 0 0 1-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2-2z"/>',
    "external":'<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
    "log-out": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    play:      '<polygon points="6 4 20 12 6 20 6 4"/>',
    lock2:     '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1.3" fill="currentColor"/>',
    radar:     '<path d="M19.07 4.93A10 10 0 1 0 21 12"/><path d="M12 12 16 8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
    history:   '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="3 3 3 8 8 8"/><polyline points="12 8 12 12 15 14"/>',
    check:     '<polyline points="20 6 9 17 4 12"/>'
  };

  GT.icon = function (name, opts) {
    opts = opts || {};
    const size = opts.size || 24;
    const cls = opts.cls ? ' class="' + opts.cls + '"' : '';
    const body = P[name] || P.info;
    return '<svg' + cls + ' width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + body + '</svg>';
  };
})(window.GT = window.GT || {});
