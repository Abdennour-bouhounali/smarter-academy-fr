import React, { useEffect, useRef, useCallback, useState } from 'react';

const GGB_SCRIPT_ID = 'ggb-deploy-script';
const GGB_SCRIPT_SRC = 'https://www.geogebra.org/apps/deployggb.js';
const GRAPH_HEIGHT = 260; // px — must match the container height in Hero.jsx

/**
 * GeoGebraGraph
 *
 * Embeds a GeoGebra Graphing applet and keeps f(x) = ax + b in sync.
 *
 * Key fixes vs. v1:
 *  - width is read as an integer (offsetWidth) — GGBApplet rejects '100%'
 *  - a RAF + small timeout ensures the container is fully laid out before measuring
 *  - initialization guard prevents double-injection on StrictMode double-mount
 */
export default function GeoGebraGraph({ a, b, id = 'ggb-hero', onLoad }) {
  const containerRef = useRef(null);
  const apiRef       = useRef(null);
  const initDoneRef  = useRef(false);

  // ── Update the line inside a running applet ─────────────────────
  const applyLine = useCallback((api, newA, newB) => {
    if (!api) return;
    try {
      // Redefine function — GeoGebra updates geometry automatically
      api.evalCommand(`f(x) = ${newA} * x + ${newB}`);
      api.setColor('f', 16, 185, 129);   // emerald-500
      api.setLineThickness('f', 5);
      api.setLabelVisible('f', false);

      // Y-intercept point (amber)
      api.evalCommand(`B = (0, ${newB})`);
      api.setColor('B', 245, 158, 11);   // amber-400
      api.setPointSize('B', 7);
      api.setLabelVisible('B', false);

      // Slope illustration point (blue) at x = 2
      api.evalCommand(`P = (2, ${newA} * 2 + ${newB})`);
      api.setColor('P', 59, 130, 246);   // blue-500
      api.setPointSize('P', 5);
      api.setLabelVisible('P', false);
    } catch (_) {
      // Applet not ready yet; the `a`/`b` effect will retry
    }
  }, []);

  // ── Bootstrap the applet (runs once) ────────────────────────────
  useEffect(() => {
    // StrictMode fires effects twice — guard against double injection
    if (initDoneRef.current) return;

    const inject = () => {
      if (initDoneRef.current) return;
      if (!containerRef.current) return;
      if (typeof window.GGBApplet === 'undefined') return;

      // Read actual pixel width AFTER layout
      const width = containerRef.current.offsetWidth || 620;

      initDoneRef.current = true;

      const applet = new window.GGBApplet(
        {
          appName: 'classic',
          id,
          width,          // ← must be a number
          height: GRAPH_HEIGHT,
          borderColor: 'none',
          enableRightClick: false,
          enableShiftDragZoom: false,
          showZoomButtons: false,
          showMenuBar: false,
          showToolBar: false,
          showAlgebraInput: false,
          showResetIcon: false,
          enableLabelDrags: false,
          useBrowserForJS: false,
          language: 'fr',
          views: {
            is3D: 0,
            AV: 0,    // Algebra View hidden
            SV: 0,
            CV: 0,
            EV2: 0,
            CP: 0,
          },
          appletOnLoad(api) {
            apiRef.current = api;
            // Force Geometry perspective (Graphics view only, no Algebra sidebar)
            api.setPerspective('G');
            // Set a clean ±6 window with grid
            api.setCoordSystem(-6, 6, -6, 6);
            api.setGridVisible(true);
            api.setAxesVisible(true, true);
            // Draw initial state
            applyLine(api, a, b);
            
            // Applet API is ready, but give the canvas a moment to visually paint 
            setTimeout(() => {
              if (onLoad) onLoad();
            }, 500);
          },
        },
        true, // true = use API
      );

      applet.inject(id);
    };

    // Use RAF + setTimeout to ensure browser has finished layout
    const raf = requestAnimationFrame(() => {
      setTimeout(() => {
        if (typeof window.GGBApplet !== 'undefined') {
          inject();
          return;
        }

        // Load deployggb.js if not already in DOM
        if (!document.getElementById(GGB_SCRIPT_ID)) {
          const script = document.createElement('script');
          script.id = GGB_SCRIPT_ID;
          script.src = GGB_SCRIPT_SRC;
          script.onload = inject;
          script.onerror = () =>
            console.error('[GeoGebraGraph] Failed to load deployggb.js');
          document.head.appendChild(script);
        } else {
          // Script tag present but GGBApplet not yet defined — poll
          const poll = setInterval(() => {
            if (typeof window.GGBApplet !== 'undefined') {
              clearInterval(poll);
              inject();
            }
          }, 80);
        }
      }, 0);
    });

    return () => {
      cancelAnimationFrame(raf);
      initDoneRef.current = false;
      // Tear down the injected iframe so GeoGebra can re-inject cleanly
      const el = document.getElementById(id);
      if (el) el.innerHTML = '';
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // only re-run if the DOM id changes

  // ── Sync a / b to the running applet ────────────────────────────
  useEffect(() => {
    applyLine(apiRef.current, a, b);
  }, [a, b, applyLine]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: `${GRAPH_HEIGHT}px` }} className="relative">
      {/* GeoGebra replaces this div's content with its iframe */}
      <div id={id} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
