import { useCallback, useEffect, useImperativeHandle, useReducer, useRef, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  CaptureUpdateAction, convertToExcalidrawElements, getSceneVersion, newElementWith,
} from '@excalidraw/excalidraw';
import {
  UNITS_PER_CM, add, sub, scale, dist, angleOf, unit, normalizeAngle, toDegrees, toRadians, formatLength, formatNumber,
  arcPoints, len, dot,
} from './geoMath.js';
import {
  INSTRUMENT_KINDS, PENCIL_WIDTHS, sanitizeDesk, instrumentGeometry, instrumentEdges, instrumentBounds,
  translateInstrument, rotateInstrumentAround, placeAnchorAt, keepReachable, isAnchorVisible, clampRadius,
  protractorGeometry, protractorDegreeOf, measureAngleWithProtractor, snapRulerToPoints, dockSetSquare, compassGeometry,
  snapOn, fitToView, RULER_WIDTH,
} from './instruments.js';
import {
  readGeoScene, pointSkeletons, linearSkeleton, circleSkeleton, arcSkeleton, measureSkeleton, missingMeasureSkeletons,
  solveDependents, nextLabel, nextSeq, constructionSteps, geoOf, drawnEnds,
} from './constructions.js';
import {
  SNAP_PX, collectSnapTargets, snapPoint, snapDirection, snapRotation,
} from './snap.js';
import { buildTimeline, frameAt, drawPhase, rulerPoseFor } from './replay.js';
import {
  RulerShape, ProtractorShape, SetSquareShape, CompassShape, PencilCursor, poseTransform,
} from './InstrumentShapes.jsx';
import GeometryToolbar from './GeometryToolbar.jsx';
import {
  ATTACH_PX, DETACH_PX, constraintsFor, pickConstraint, cmTolerance,
} from './constraints.js';

/**
 * LE BUREAU DE GÉOMÉTRIE — des instruments posés sur la سبّورة.
 *
 * Excalidraw reste le moteur du dessin. Le bureau ajoute par-dessus une
 * couche SVG, glissée DANS le conteneur d'Excalidraw (`host`) entre son
 * canevas (z 2) et son interface (z 4) : les instruments sont au-dessus du
 * dessin, sous les barres et les menus d'Excalidraw. Une molette sur un
 * instrument remonte au conteneur : le zoom et le défilement d'Excalidraw
 * continuent de marcher.
 *
 * ── Deux états, jamais mélangés ─────────────────────────────────────────
 *   · le DESSIN : éléments Excalidraw (constructions comprises, avec leur
 *     sens dans `customData.geo` — constructions.js). Annulable, exporté.
 *   · le BUREAU : où sont les instruments, leur ouverture, les réglages
 *     (`desk`, instruments.js). Déplacer une règle n'écrit RIEN dans
 *     l'historique d'Excalidraw — cent mouvements ne font pas cent « تراجع ».
 *
 * ── Performance ──────────────────────────────────────────────────────────
 * L'état vit dans des refs ; un geste le modifie à chaque mouvement et
 * demande UN rendu par image (`schedule`, requestAnimationFrame). Les
 * dessins d'instruments sont mémoïsés : pendant un glisser, seule leur
 * transformation change. Le bureau n'est enregistré qu'à la FIN d'un geste.
 *
 * ── Qui voit quoi ─────────────────────────────────────────────────────────
 * Il n'existe pas de synchronisation temps réel dans la plateforme : l'élève
 * voit la سبّورة de l'enseignant projetée (plein écran du مختبر). C'est pour
 * cela que les instruments se DESSINENT à l'écran et que le trait se fait
 * devant la classe. L'état du bureau est enregistré avec le document : une
 * سبّورة rouverte retrouve ses instruments là où on les avait laissés.
 */
const GeometryDesk = forwardRef(function GeometryDesk({ api, host, initialDesk, onDeskChange }, ref) {
  const { t } = useTranslation('mathlab');
  const [, force] = useReducer((x) => x + 1, 0);
  const rafRef = useRef(0);
  const schedule = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      force();
    });
  }, []);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const deskRef = useRef(null);
  if (deskRef.current === null) deskRef.current = sanitizeDesk(initialDesk);
  const uiRef = useRef({
    tool: null, // null | 'pencil' | 'compass'
    focus: null, // l'instrument dont la barre montre les réglages
    preview: null, marker: null, hint: null, rotating: null,
    compassCenterId: null,
    pen: 'idle', // idle | near | drawing | released — la machine d'état du crayon
    near: null, // la contrainte qui tient (ou va tenir) le crayon
    replay: null,
  });
  const viewRef = useRef({ scrollX: 0, scrollY: 0, zoom: 1, width: 0, height: 0, grid: 0 });
  const sceneRef = useRef({ version: -1, elements: [], geo: null, targets: null });
  const gestureRef = useRef(null);
  const svgRef = useRef(null);
  const onDeskChangeRef = useRef(onDeskChange);
  onDeskChangeRef.current = onDeskChange;
  const lastExToolRef = useRef(null);

  const desk = deskRef.current;
  const ui = uiRef.current;

  const persist = useCallback(() => {
    onDeskChangeRef.current?.(JSON.parse(JSON.stringify(deskRef.current)));
  }, []);

  const setInstrument = (kind, next) => {
    deskRef.current = { ...deskRef.current, instruments: { ...deskRef.current.instruments, [kind]: next } };
  };

  // ── La scène, lue paresseusement ────────────────────────────────────
  const geo = () => {
    const s = sceneRef.current;
    if (!s.geo) s.geo = readGeoScene(s.elements);

    return s.geo;
  };
  const targets = () => {
    const s = sceneRef.current;
    if (!s.targets) s.targets = collectSnapTargets(geo());

    return s.targets;
  };

  // ── Suivre Excalidraw : la vue, la scène, l'outil ───────────────────
  useEffect(() => {
    if (!api) return undefined;
    const anchors = new Map();
    let rounds = 0;
    const sync = (elements, appState) => {
      const v = viewRef.current;
      const zoom = appState.zoom?.value ?? 1;
      const grid = appState.gridModeEnabled ? (appState.gridSize ?? 20) : 0;
      if (v.scrollX !== appState.scrollX || v.scrollY !== appState.scrollY || v.zoom !== zoom
        || v.width !== appState.width || v.height !== appState.height || v.grid !== grid) {
        viewRef.current = { scrollX: appState.scrollX, scrollY: appState.scrollY, zoom, width: appState.width, height: appState.height, grid };
        schedule();
      }
      // L'enseignant a pris un outil d'Excalidraw : le bureau lâche le sien.
      const exTool = appState.activeTool?.type ?? null;
      if (exTool !== lastExToolRef.current) {
        lastExToolRef.current = exTool;
        uiRef.current.tool = null;
        uiRef.current.near = null;
        uiRef.current.pen = 'idle';
        schedule();
      }
      const version = getSceneVersion(elements);
      if (version === sceneRef.current.version) return;
      sceneRef.current = { version, elements, geo: null, targets: null };
      schedule();

      // Les dépendances : A a bougé, AB le suit. Garde-fou contre une boucle
      // (la passe est idempotente, mais une erreur d'arrondi ne doit pas geler l'onglet).
      const selected = appState.selectedElementIds ?? {};
      const updates = solveDependents(elements, {
        selectedIds: new Set(Object.keys(selected).filter((id) => selected[id])),
        dragging: Boolean(appState.selectedElementsAreBeingDragged),
        anchors,
      });
      if (updates.length === 0) {
        rounds = 0;

        return;
      }
      rounds += 1;
      if (rounds > 4) return;
      const patches = new Map(updates.map((u) => [u.id, u.patch]));
      const next = api.getSceneElementsIncludingDeleted().map((el) => (patches.has(el.id) ? newElementWith(el, patches.get(el.id)) : el));
      api.updateScene({ elements: next, captureUpdate: CaptureUpdateAction.EVENTUALLY });
    };
    sync(api.getSceneElements(), api.getAppState());

    return api.onChange(sync);
  }, [api, schedule]);

  // ── Coordonnées ─────────────────────────────────────────────────────
  const toScene = (event) => {
    const rect = svgRef.current.getBoundingClientRect();
    const v = viewRef.current;

    return { x: (event.clientX - rect.left) / v.zoom - v.scrollX, y: (event.clientY - rect.top) / v.zoom - v.scrollY };
  };
  const viewRect = () => {
    const v = viewRef.current;
    const rect = svgRef.current?.getBoundingClientRect();
    const w = rect?.width || v.width || 800;
    const h = rect?.height || v.height || 600;

    return { minX: -v.scrollX, minY: -v.scrollY, maxX: w / v.zoom - v.scrollX, maxY: h / v.zoom - v.scrollY };
  };
  const viewCenter = () => {
    const r = viewRect();

    return { x: (r.minX + r.maxX) / 2, y: (r.minY + r.maxY) / 2 };
  };
  const px = (n) => n / viewRef.current.zoom;

  // ── Ajouter au dessin (une entrée d'historique par geste) ──────────
  const addToScene = useCallback((skeletons, { withMeasures = false } = {}) => {
    if (!api || skeletons.length === 0) return [];
    const created = convertToExcalidrawElements(skeletons, { regenerateIds: false });
    let extra = [];
    if (withMeasures) {
      extra = convertToExcalidrawElements(missingMeasureSkeletons([...api.getSceneElements(), ...created]), { regenerateIds: false });
    }
    api.updateScene({
      elements: [...api.getSceneElementsIncludingDeleted(), ...created, ...extra],
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });

    return created;
  }, [api]);

  /** Le point sur lequel on s'est aimanté, ou un nouveau point (nommé si « تسمية النقاط »). */
  const pointMaker = (via) => {
    const used = [...geo().points.values()].map((p) => p.label).filter(Boolean);
    let seq = nextSeq(sceneRef.current.elements);
    const skeletons = [];

    return {
      skeletons,
      nextSeq: () => seq++,
      ensure: (snap, p) => {
        if (snap?.kind === 'point' && snap.id) return snap.id;
        const label = deskRef.current.settings.autoLabels ? nextLabel(used) : '';
        if (label) used.push(label);
        const made = pointSkeletons(p, { label, seq: seq++, via });
        skeletons.push(...made.skeletons);

        return made.id;
      },
    };
  };

  const pencilStyle = () => ({ width: PENCIL_WIDTHS[deskRef.current.pencil.width], style: deskRef.current.pencil.style });

  // ── Les outils ──────────────────────────────────────────────────────
  const setTool = useCallback((tool) => {
    uiRef.current.tool = tool;
    uiRef.current.preview = null;
    uiRef.current.marker = null;
    schedule();
  }, [schedule]);

  const showInstrument = (kind) => {
    const inst = deskRef.current.instruments[kind];
    const view = viewRect();
    let next = fitToView(kind, { ...inst, visible: true }, view);
    if (!isAnchorVisible(kind, next, view) || (inst.x === 0 && inst.y === 0)) {
      next = placeAnchorAt(kind, next, viewCenter());
      // Le ZÉRO de la règle toujours à l'écran : c'est de là qu'on trace.
      const box = instrumentBounds(kind, next);
      if (box.minX < view.minX) next = translateInstrument(next, { x: view.minX - box.minX + px(12), y: 0 });
    }
    setInstrument(kind, next);
  };

  const toggleInstrument = useCallback((kind) => {
    const inst = deskRef.current.instruments[kind];
    if (inst.visible) {
      setInstrument(kind, { ...inst, visible: false });
      if (uiRef.current.focus === kind) uiRef.current.focus = null;
      if (kind === 'compass' && uiRef.current.tool === 'compass') uiRef.current.tool = null;
    } else {
      showInstrument(kind);
      uiRef.current.focus = kind;
      // Le compas se POSE d'un clic (la pointe sèche va où l'on touche). Les
      // autres instruments ne changent pas l'outil : on garde son crayon, et
      // c'est l'instrument qui le guidera.
      if (kind === 'compass') uiRef.current.tool = 'compass';
    }
    uiRef.current.preview = null;
    schedule();
    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persist, schedule]);

  const pickExcalidrawTool = useCallback((type) => {
    uiRef.current.tool = null;
    api?.setActiveTool({ type });
    schedule();
  }, [api, schedule]);

  const recenter = useCallback((kinds) => {
    for (const kind of kinds) {
      const inst = deskRef.current.instruments[kind];
      if (inst.visible) setInstrument(kind, placeAnchorAt(kind, inst, viewCenter()));
    }
    schedule();
    persist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persist, schedule]);

  const updateDesk = useCallback((mutate) => {
    deskRef.current = mutate(deskRef.current);
    schedule();
    persist();
  }, [persist, schedule]);

  const updateInstrument = useCallback((kind, patch) => {
    updateDesk((d) => ({ ...d, instruments: { ...d.instruments, [kind]: { ...d.instruments[kind], ...patch } } }));
  }, [updateDesk]);

  /** « إظهار القياسات » : des mesures SUR le dessin (exportées, annulables), ou aucune. */
  const toggleMeasures = useCallback(() => {
    const on = !deskRef.current.settings.measures;
    updateDesk((d) => ({ ...d, settings: { ...d.settings, measures: on } }));
    if (!api) return;
    if (on) {
      addToScene(missingMeasureSkeletons(api.getSceneElements()));
    } else {
      const all = api.getSceneElementsIncludingDeleted();
      if (all.some((el) => geoOf(el)?.kind === 'measure')) {
        api.updateScene({
          elements: all.map((el) => (geoOf(el)?.kind === 'measure' ? newElementWith(el, { isDeleted: true }) : el)),
          captureUpdate: CaptureUpdateAction.IMMEDIATELY,
        });
      }
    }
  }, [api, addToScene, updateDesk]);

  // ── Ce que lit la منقلة ─────────────────────────────────────────────
  const protractorReading = () => {
    const p = deskRef.current.instruments.protractor;
    if (!p.visible) return null;
    const g = geo();
    let vertex = null;
    for (const pt of g.points.values()) {
      if (dist(pt.p, p) <= px(SNAP_PX) && (!vertex || dist(pt.p, p) < dist(vertex.p, p))) vertex = pt;
    }
    if (!vertex) return null;
    const arms = [];
    for (const l of g.linears) {
      const atA = l.from === vertex.id || dist(l.a, vertex.p) < 0.5;
      const atB = l.to === vertex.id || dist(l.b, vertex.p) < 0.5;
      if (atA) arms.push({ id: l.id, d: sub(l.b, l.a) });
      if (atB) arms.push({ id: l.id, d: sub(l.a, l.b) });
      if (l.kind === 'line' && (atA || atB)) arms.push({ id: l.id, d: atA ? sub(l.a, l.b) : sub(l.b, l.a) });
    }
    const reading = measureAngleWithProtractor(p, vertex.p, arms.map((a) => a.d), px(SNAP_PX));
    if (!reading) return { vertex, arms, reading: null };
    const from = arms.find((a) => a.d === reading.from);
    const to = arms.find((a) => a.d === reading.to);

    return { vertex, arms, reading, fromId: from?.id, toId: to?.id };
  };

  /** « ضع علامة » / « ارسم الضلع » : la منقلة aide à CONSTRUIRE un angle. */
  const protractorConstruct = useCallback((withRay) => {
    const p = deskRef.current.instruments.protractor;
    if (!p.visible || !api) return;
    const g = protractorGeometry(p);
    const markAt = add(g.center, scale(g.directionOf(p.needleDeg), g.R));
    const via = { tool: 'protractor', pose: { ...p } };
    const maker = pointMaker(via);
    const found = protractorReading();
    const centerSnap = found?.vertex ? { kind: 'point', id: found.vertex.id } : null;
    const markId = maker.ensure(null, markAt);
    if (!withRay) {
      addToScene(maker.skeletons);

      return;
    }
    const vertexId = maker.ensure(centerSnap, g.center);
    const ray = linearSkeleton('ray', found?.vertex?.p ?? g.center, markAt, pencilStyle(), { from: vertexId, to: markId, seq: maker.nextSeq(), via });
    const skeletons = [...maker.skeletons, ray];
    // L'angle construit, mesuré sur la سبّورة — s'il a un premier côté.
    const base = found?.arms?.find((a) => {
      const deg = protractorDegreeOf(p, a.d);

      return deg !== null && (deg < 4 || deg > 176);
    });
    if (deskRef.current.settings.measures && base && found?.vertex) {
      const scene = readGeoScene([...sceneRef.current.elements, ...convertToExcalidrawElements(skeletons, { regenerateIds: false })]);
      const m = measureSkeleton(scene, { what: 'angle', vertex: found.vertex.id, arms: [base.id, ray.id] });
      if (m) skeletons.push(m);
    }
    addToScene(skeletons, { withMeasures: deskRef.current.settings.measures });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, addToScene]);

  /** « ثبّت القياس » : la lecture de la منقلة devient une étiquette ∠ABC = 42° sur la سبّورة. */
  const pinProtractorReading = useCallback(() => {
    const found = protractorReading();
    if (!found?.reading || !found.fromId || !found.toId) return;
    const m = measureSkeleton(geo(), { what: 'angle', vertex: found.vertex.id, arms: [found.fromId, found.toId] });
    if (m) addToScene([m]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addToScene]);

  // ── « إعادة البناء » ────────────────────────────────────────────────
  const stopReplay = useCallback(() => {
    uiRef.current.replay = null;
    schedule();
  }, [schedule]);

  const startReplay = useCallback(() => {
    const steps = constructionSteps(sceneRef.current.elements);
    if (steps.length === 0) return;
    uiRef.current.replay = { timeline: buildTimeline(steps), started: performance.now(), t: 0 };
    uiRef.current.tool = null;
    const tick = () => {
      const r = uiRef.current.replay;
      if (!r) return;
      r.t = performance.now() - r.started;
      force();
      if (r.t < r.timeline.total + 900) requestAnimationFrame(tick);
      else stopReplay();
    };
    requestAnimationFrame(tick);
  }, [stopReplay]);

  // ── L'API vers la سبّورة (export) ──────────────────────────────────
  useImperativeHandle(ref, () => ({
    includeInstruments: () => deskRef.current.settings.exportInstruments,
    instrumentsBounds: () => {
      const boxes = INSTRUMENT_KINDS.filter((k) => deskRef.current.instruments[k].visible).map((k) => instrumentBounds(k, deskRef.current.instruments[k]));
      if (boxes.length === 0) return null;

      return {
        minX: Math.min(...boxes.map((b) => b.minX)), minY: Math.min(...boxes.map((b) => b.minY)),
        maxX: Math.max(...boxes.map((b) => b.maxX)), maxY: Math.max(...boxes.map((b) => b.maxY)),
      };
    },
    /** Le balisage SVG des instruments, en coordonnées de scène, sans poignées ni lectures. */
    instrumentsMarkup: () => {
      const node = svgRef.current?.querySelector('[data-geo-instruments]');
      if (!node) return '';
      const clone = node.cloneNode(true);
      clone.querySelectorAll('[data-geo-handle], [data-geo-ui]').forEach((n) => n.remove());

      return new XMLSerializer().serializeToString(clone);
    },
  }), []);

  // ── Les gestes ──────────────────────────────────────────────────────
  const partOf = (event) => event.target.closest?.('[data-geo-hit]')?.getAttribute('data-geo-hit') ?? null;

  const lineDirections = () => geo().linears.map((l) => angleOf(sub(l.b, l.a)));

  // ── Le crayon et l'instrument qui le conduit ────────────────────────
  //
  // La machine d'état du crayon (`ui.pen`, exposée en `data-geo-pen`) :
  //
  //   idle ──(la mine approche d'un bord, d'une pointe, d'un sommet)──▶ near
  //   near ──(appui)──▶ drawing   la contrainte tient la mine jusqu'au lever
  //   drawing ──(la mine s'éloigne franchement du bord)──▶ released
  //   drawing | released ──(lever)──▶ idle     le trait est posé
  //
  // Hors de portée d'un instrument, l'appui n'arrive même pas ici : il va à
  // Excalidraw, et le القلم dessine à main levée comme avant.

  /** Le crayon est-il en main ? Le قلم الهندسة, ou le القلم d'Excalidraw. */
  const penInHand = () => (uiRef.current.tool === 'pencil' ? 'geo' : (!uiRef.current.tool && lastExToolRef.current === 'freedraw' ? 'free' : null));

  const settingOn = (key) => snapOn(deskRef.current.settings, key);

  const activeConstraints = () => (settingOn('attach') ? constraintsFor(deskRef.current.instruments) : []);

  const constraintOpts = () => ({
    graduations: settingOn('graduations'),
    angles: settingOn('angles'),
    cmTolerance: cmTolerance(viewRef.current.zoom),
    detachDistance: px(DETACH_PX),
  });

  /** Le style du trait : celui du القلم d'Excalidraw (couleur, épaisseur, tirets) ou celui du قلم الهندسة. */
  const strokeStyleFor = (pen) => {
    if (pen === 'geo' || !api) return pencilStyle();
    const s = api.getAppState();

    return { color: s.currentItemStrokeColor, width: s.currentItemStrokeWidth, style: s.currentItemStrokeStyle };
  };

  /** Un point de la construction posé SUR la droite de la contrainte, près de p : la mine s'y arrête. */
  const pointOnConstraint = (c, p) => {
    if (!settingOn('points') || c.family === 'arc') return null;
    const onLine = targets().filter((tg) => {
      const d = sub(tg.p, c.origin);

      return Math.abs(d.x * -c.u.y + d.y * c.u.x) < 1 && (c.family !== 'ray' || dot(d, c.u) >= -1);
    });

    return snapPoint(p, onLine, px(SNAP_PX));
  };

  const beginStroke = (event, p, pen, constraint) => {
    const d = deskRef.current;
    const opts = constraintOpts();
    const base = {
      type: 'stroke', pen, pointerId: event.pointerId, lastClient: { x: event.clientX, y: event.clientY },
      kind: pen === 'geo' ? d.pencil.kind : 'segment', constraint: constraint ?? null, released: false,
    };
    if (constraint) {
      const state = constraint.attach(p, opts);
      const hit = pointOnConstraint(constraint, p);
      if (hit) {
        state.point = hit.point;
        state.s = dot(sub(hit.point, constraint.origin), constraint.u);
      }
      gestureRef.current = { ...base, state: { ...state, s0: state.s }, start: state.point, startSnap: hit, end: state.point, endSnap: hit };
      uiRef.current.focus = constraint.instrument;
      uiRef.current.pen = 'drawing';
      uiRef.current.near = constraint.id;
      uiRef.current.marker = hit ? { kind: hit.kind, p: hit.point } : null;
    } else {
      const startSnap = settingOn('points') ? snapPoint(p, targets(), px(SNAP_PX), { grid: viewRef.current.grid }) : null;
      const start = startSnap?.point ?? p;
      gestureRef.current = { ...base, start, startSnap, end: start, endSnap: startSnap, dirSnap: null };
      uiRef.current.pen = 'drawing';
      uiRef.current.marker = startSnap ? { kind: startSnap.kind, p: startSnap.point } : null;
    }
    updateStrokePreview(gestureRef.current);
    schedule();
  };

  const updateStrokePreview = (g) => {
    const c = g.constraint;
    if (c?.family === 'arc') {
      uiRef.current.preview = {
        kind: 'arc', c: c.center, r: c.radius, start: g.state.startAngle ?? c.startAngle, sweep: g.state.sweep ?? 0,
        pen: g.pen, style: strokeStyleFor(g.pen), measure: c.measure(g.state), instrument: c.instrument,
      };
    } else {
      const kind = c?.family === 'ray' ? 'ray' : (c && (g.kind === 'point' || g.kind === 'circle') ? 'segment' : g.kind);
      uiRef.current.preview = {
        kind, start: g.start, end: g.end, edge: c?.id ?? null, pen: g.pen, style: strokeStyleFor(g.pen),
        // La mesure s'écrit du côté OPPOSÉ à l'instrument : elle ne cache pas ses graduations.
        awayFrom: c ? instrumentGeometry(c.instrument, deskRef.current.instruments[c.instrument])?.anchor ?? null : null,
        measure: c ? c.measure(g.state) : { length: dist(g.start, g.end) },
      };
    }
  };

  const moveStroke = (g, q) => {
    if (g.released) return;
    const c = g.constraint;
    if (c) {
      const next = c.constrain(q, g.state, constraintOpts());
      if (next.away) {
        // La mine a quitté la règle : le trait s'arrête là où elle l'a quittée.
        g.released = true;
        uiRef.current.pen = 'released';
        schedule();

        return;
      }
      g.state = { ...g.state, ...next };
      let end = next.point;
      let endSnap = null;
      if (c.family !== 'arc') {
        endSnap = pointOnConstraint(c, end);
        if (endSnap && endSnap.id !== g.startSnap?.id) {
          end = endSnap.point;
          g.state.s = dot(sub(end, c.origin), c.u);
        } else endSnap = null;
      } else if (c.instrument === 'compass') {
        // Le compas tourne AVEC la mine : c'est l'instrument qui trace.
        const comp = deskRef.current.instruments.compass;
        setInstrument('compass', { ...comp, angle: c.startAngle + (next.sweep ?? 0) });
      }
      g.end = end;
      g.endSnap = endSnap;
      uiRef.current.marker = endSnap ? { kind: endSnap.kind, p: endSnap.point } : null;
      updateStrokePreview(g);

      return;
    }
    // Sans instrument : le قلم الهندسة seul — points, directions.
    let end = q;
    let endSnap = null;
    let dirSnap = null;
    const exclude = g.startSnap?.id ? new Set([g.startSnap.id]) : null;
    if (settingOn('points')) endSnap = snapPoint(q, targets(), px(SNAP_PX), { grid: viewRef.current.grid, exclude });
    if (endSnap) end = endSnap.point;
    else if (settingOn('angles') && g.kind !== 'point' && g.kind !== 'circle') {
      dirSnap = snapDirection(g.start, q, geo().linears.slice(0, 80));
      if (dirSnap) end = dirSnap.end;
    }
    if (g.kind === 'point') g.start = end;
    g.end = end;
    g.endSnap = endSnap;
    uiRef.current.marker = endSnap
      ? { kind: endSnap.kind, p: endSnap.point }
      : dirSnap ? { kind: dirSnap.kind, p: g.start, dir: angleOf(sub(end, g.start)) } : null;
    updateStrokePreview(g);
  };

  const endStroke = (g) => {
    uiRef.current.preview = null;
    uiRef.current.marker = null;
    const d = deskRef.current;
    const c = g.constraint;
    const style = strokeStyleFor(g.pen);
    const via = c ? { tool: c.instrument, edge: c.id, pose: { ...d.instruments[c.instrument] } } : { tool: 'pencil' };
    const maker = pointMaker(via);
    // Le crayon ordinaire ne pose des points (A, B…) que si on les nomme ; le قلم الهندسة toujours.
    const ensure = (snap, p) => (g.pen === 'geo' || d.settings.autoLabels || snap?.kind === 'point' ? maker.ensure(snap, p) : null);

    if (c?.family === 'arc') {
      const sweep = g.state.sweep ?? 0;
      if (Math.abs(sweep) <= toRadians(0.5)) return;
      // Le centre est un POINT de la construction si l'instrument y est posé : l'arc le suivra.
      const centerPoint = [...geo().points.values()].find((pt) => dist(pt.p, c.center) < 0.5);
      const centerId = c.instrument === 'compass'
        ? (uiRef.current.compassCenterId && geo().points.has(uiRef.current.compassCenterId) ? uiRef.current.compassCenterId : centerPoint?.id ?? null)
        : centerPoint?.id ?? null;
      // Seul le compas ferme un cercle ; la منقلة est un demi-disque.
      const full = c.instrument === 'compass' && Math.abs(sweep) >= 2 * Math.PI - toRadians(1);
      const start = g.state.startAngle ?? c.startAngle;
      const skeleton = full
        ? circleSkeleton(c.center, c.radius, style, { centerId, seq: maker.nextSeq(), via })
        : arcSkeleton(c.center, c.radius, start, sweep, style, { centerId, seq: maker.nextSeq(), via });
      addToScene([skeleton], { withMeasures: d.settings.measures });

      return;
    }
    if (!c && g.kind === 'point') {
      maker.ensure(g.endSnap, g.end);
      addToScene(maker.skeletons);

      return;
    }
    if (dist(g.start, g.end) < px(6)) return;
    if (!c && g.kind === 'circle') {
      const centerId = maker.ensure(g.startSnap, g.start);
      addToScene([...maker.skeletons, circleSkeleton(g.start, dist(g.start, g.end), style, { centerId, seq: maker.nextSeq(), via })], { withMeasures: d.settings.measures });

      return;
    }
    const kind = c?.family === 'ray' ? 'ray' : (g.kind === 'point' || g.kind === 'circle' ? 'segment' : g.kind);
    const from = ensure(g.startSnap, g.start);
    const to = ensure(g.endSnap, g.end);
    const line = linearSkeleton(kind, g.start, g.end, style, { from, to, seq: maker.nextSeq(), via });
    addToScene([...maker.skeletons, line], { withMeasures: d.settings.measures });
  };

  /** Le survol : la mine approche d'un instrument (« near »), le bord s'allume. */
  const hoverPen = (p) => {
    const pen = penInHand();
    const c = pen ? pickConstraint(p, activeConstraints(), px(ATTACH_PX), uiRef.current.focus) : null;
    const near = c?.id ?? null;
    if (near !== uiRef.current.near || (uiRef.current.pen === 'near') !== Boolean(near)) {
      uiRef.current.near = near;
      uiRef.current.pen = near ? 'near' : 'idle';
      schedule();
    }
  };

  const beginInstrument = (event, kind, what, p) => {
    const inst = deskRef.current.instruments[kind];
    uiRef.current.focus = kind;
    const pivot = instrumentGeometry(kind, inst).pivot;
    switch (what) {
      case 'rotate':
        gestureRef.current = { type: 'rotate', kind, pointerId: event.pointerId, pivot, grab: angleOf(sub(p, pivot)), start: inst };
        break;
      case 'needle':
        gestureRef.current = { type: 'needle', pointerId: event.pointerId };
        break;
      case 'tip':
        gestureRef.current = inst.locked
          ? { type: 'compassDraw', pointerId: event.pointerId, startAngle: inst.angle, last: angleOf(sub(p, inst)), sweep: 0 }
          : { type: 'compassOpen', pointerId: event.pointerId };
        break;
      case 'knob':
        gestureRef.current = { type: 'compassDraw', pointerId: event.pointerId, startAngle: inst.angle, last: angleOf(sub(p, inst)), sweep: 0 };
        break;
      default:
        gestureRef.current = { type: 'move', kind, pointers: new Map([[event.pointerId, p]]), grabOffset: sub({ x: inst.x, y: inst.y }, p) };
    }
    schedule();
  };

  /** Déplacer un instrument : glisser (1 doigt) ou glisser + tourner (2 doigts). */
  const moveInstrument = (g, pointerId, q) => {
    const kind = g.kind;
    let inst = deskRef.current.instruments[kind];
    const prev = g.pointers.get(pointerId);
    if (!prev) return;
    if (g.pointers.size >= 2) {
      const ids = [...g.pointers.keys()];
      const other = ids.find((id) => id !== pointerId);
      const o = g.pointers.get(other);
      const before = angleOf(sub(prev, o));
      const after = angleOf(sub(q, o));
      const m0 = scale(add(prev, o), 0.5);
      const m1 = scale(add(q, o), 0.5);
      inst = rotateInstrumentAround(translateInstrument(inst, sub(m1, m0)), m1, normalizeAngle(after - before));
      g.pointers.set(pointerId, q);
      setInstrument(kind, inst);

      return;
    }
    g.pointers.set(pointerId, q);
    // La position est celle du doigt + l'écart saisi : aucun glissement cumulé.
    inst = { ...inst, x: q.x + g.grabOffset.x, y: q.y + g.grabOffset.y };
    uiRef.current.marker = null;
    uiRef.current.hint = null;
    if (settingOn('points') && (kind === 'ruler' || kind === 'protractor' || kind === 'compass')) {
      // Le ZÉRO de la règle, le CENTRE de la منقلة, la POINTE du compas se posent sur un point.
      const hit = snapPoint({ x: inst.x, y: inst.y }, targets(), px(SNAP_PX));
      if (hit) {
        inst = { ...inst, x: hit.point.x, y: hit.point.y };
        uiRef.current.marker = { kind: hit.kind, p: hit.point };
      }
      if (kind === 'compass') uiRef.current.compassCenterId = hit?.kind === 'point' ? hit.id : null;
    } else if (kind === 'compass') {
      uiRef.current.compassCenterId = null;
    }
    if (kind === 'setSquare') {
      const ruler = deskRef.current.instruments.ruler;
      const guides = instrumentEdges('ruler', ruler).map((e) => ({ ...e, source: 'ruler' }));
      if (settingOn('perpSnap')) guides.push(...geo().linears.map((l) => ({ id: l.id, a: l.a, b: l.b, source: 'line' })));
      // Une fois plaqué, le كوس TIENT contre son guide : la main peut dériver
      // un peu pendant le glissement sans le décoller (hystérésis).
      const held = g.dockedTo ? guides.filter((gd) => gd.id === g.dockedTo) : [];
      const docked = (held.length ? dockSetSquare(inst, held, px(36), toRadians(6)) : null) ?? dockSetSquare(inst, guides, px(10), toRadians(3));
      g.dockedTo = docked?.guide.id ?? null;
      if (docked) {
        inst = docked.inst;
        const leg = docked.edgeId !== 'setSquare:hyp';
        uiRef.current.hint = docked.guide.source === 'ruler' ? 'slide' : leg ? 'perpendicular' : null;
        const sg = instrumentGeometry('setSquare', inst);
        uiRef.current.marker = docked.guide.source === 'ruler'
          ? { kind: 'parallel', p: sg.anchor, dir: angleOf(sub(docked.guide.b, docked.guide.a)) }
          : leg ? { kind: 'right', p: sg.v, dir: inst.angle } : null;
      }
    }
    setInstrument(kind, inst);
  };

  const rotateInstrument = (g, q) => {
    const kind = g.kind;
    let angle = g.start.angle + normalizeAngle(angleOf(sub(q, g.pivot)) - g.grab);
    uiRef.current.marker = null;
    if (settingOn('angles')) {
      let snapped = null;
      if (kind === 'ruler') {
        const hit = snapRulerToPoints(g.pivot, angle, [...geo().points.values()].map((pt) => pt.p), px(SNAP_PX), (g.start.lengthCm + 0.5) * UNITS_PER_CM);
        if (hit) {
          snapped = hit.angle;
          uiRef.current.marker = { kind: 'point', p: hit.point };
        }
      }
      if (snapped === null) {
        const lines = kind === 'protractor'
          ? geo().linears.filter((l) => dist(l.a, g.pivot) < 1 || dist(l.b, g.pivot) < 1).map((l) => angleOf(sub(l.b, l.a)))
          : lineDirections();
        const perp = kind === 'setSquare' ? lines.map((a) => a + Math.PI / 2) : [];
        const hit = snapRotation(angle, { stepDeg: 15, directions: [...lines, ...perp], tolerance: toRadians(kind === 'protractor' ? 4 : 2) });
        if (hit) snapped = hit.angle;
      }
      if (snapped !== null) angle = snapped;
    }
    const inst = rotateInstrumentAround(g.start, g.pivot, angle - g.start.angle);
    uiRef.current.rotating = { kind, p: g.pivot, deg: ((-toDegrees(angle) % 360) + 360) % 360 };
    setInstrument(kind, inst);
  };

  const handlePointerDown = (event) => {
    if (uiRef.current.replay) return;
    const p = toScene(event);
    const g = gestureRef.current;
    // Un second doigt : tourner l'instrument tenu, ou zoomer la سبّورة.
    if (g) {
      if (g.type === 'move' && g.pointers.size < 2) {
        g.pointers.set(event.pointerId, p);
        svgRef.current.setPointerCapture?.(event.pointerId);
      } else if (g.type === 'stroke' || g.type === 'pinch') {
        startPinch(event, g);
      }
      event.preventDefault();

      return;
    }
    const part = partOf(event);
    const tool = uiRef.current.tool;
    svgRef.current.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    const what = part?.split(':')[1] ?? null;
    // Le crayon en main, près d'un bord, de la pointe du compas ou du sommet de
    // la منقلة : l'INSTRUMENT conduit le trait. Les poignées (tourner, ouvrir,
    // l'aiguille) restent des poignées.
    const pen = penInHand();
    if (pen && (!what || what === 'body' || what === 'tip')) {
      const c = pickConstraint(p, activeConstraints(), px(ATTACH_PX), uiRef.current.focus);
      if (c) {
        beginStroke(event, p, pen, c);

        return;
      }
    }
    // Le المدوّر en main, un clic sur un point (A, une intersection) y pose la
    // pointe sèche — même si ce point est sous une règle ou un كوس.
    if (tool === 'compass' && !part?.startsWith('compass:') && settingOn('points')) {
      const hit = snapPoint(p, targets(), px(SNAP_PX));
      if (hit) {
        placeCompassPivot(event, hit);

        return;
      }
    }
    if (part) {
      const [kind] = part.split(':');
      beginInstrument(event, kind, what, p);

      return;
    }
    if (tool === 'pencil') {
      beginStroke(event, p, 'geo', null);

      return;
    }
    if (tool === 'compass') {
      // « انقر لتضع الرأس » : la pointe sèche va là où l'on touche.
      placeCompassPivot(event, settingOn('points') ? snapPoint(p, targets(), px(SNAP_PX)) : null, p);
    }
  };

  /** « انقر لتضع الرأس » : la pointe sèche va là où l'on touche (sur le point visé s'il y en a un). */
  const placeCompassPivot = (event, hit, raw = null) => {
    const at = hit?.point ?? raw;
    const c = deskRef.current.instruments.compass;
    setInstrument('compass', { ...c, visible: true, x: at.x, y: at.y });
    uiRef.current.compassCenterId = hit?.kind === 'point' ? hit.id : null;
    uiRef.current.focus = 'compass';
    gestureRef.current = { type: 'move', kind: 'compass', pointers: new Map([[event.pointerId, at]]), grabOffset: { x: 0, y: 0 } };
    schedule();
  };

  const startPinch = (event, g) => {
    const v = viewRef.current;
    const first = g.type === 'pinch' ? null : { id: g.pointerId, client: g.lastClient };
    if (g.type === 'stroke') {
      uiRef.current.pen = 'idle';
      uiRef.current.preview = null;
      uiRef.current.marker = null;
    }
    const clients = new Map(g.type === 'pinch' ? g.clients : (first?.client ? [[first.id, first.client]] : []));
    clients.set(event.pointerId, { x: event.clientX, y: event.clientY });
    svgRef.current.setPointerCapture?.(event.pointerId);
    if (clients.size < 2) {
      gestureRef.current = { type: 'pinch', clients, start: null };

      return;
    }
    const [a, b] = [...clients.values()];
    const rect = svgRef.current.getBoundingClientRect();
    const mid = { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top };
    gestureRef.current = {
      type: 'pinch', clients,
      start: { d: Math.max(1, dist(a, b)), zoom: v.zoom, scene: { x: mid.x / v.zoom - v.scrollX, y: mid.y / v.zoom - v.scrollY } },
    };
  };

  const movePinch = (g, event) => {
    if (!g.clients.has(event.pointerId)) return;
    g.clients.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (!g.start || g.clients.size < 2 || !api) return;
    const [a, b] = [...g.clients.values()];
    const rect = svgRef.current.getBoundingClientRect();
    const mid = { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top };
    const zoom = Math.min(30, Math.max(0.1, g.start.zoom * (dist(a, b) / g.start.d)));
    api.updateScene({
      appState: { zoom: { value: zoom }, scrollX: mid.x / zoom - g.start.scene.x, scrollY: mid.y / zoom - g.start.scene.y },
      captureUpdate: CaptureUpdateAction.NEVER,
    });
  };

  const handlePointerMove = (event) => {
    const g = gestureRef.current;
    if (!g) {
      hoverPen(toScene(event));

      return;
    }
    if (g.type === 'pinch') {
      movePinch(g, event);

      return;
    }
    const q = toScene(event);
    switch (g.type) {
      case 'stroke':
        if (event.pointerId !== g.pointerId) return;
        g.lastClient = { x: event.clientX, y: event.clientY };
        moveStroke(g, q);
        break;
      case 'move':
        moveInstrument(g, event.pointerId, q);
        break;
      case 'rotate':
        if (event.pointerId === g.pointerId) rotateInstrument(g, q);
        break;
      case 'needle': {
        const p = deskRef.current.instruments.protractor;
        const d = sub(q, p);
        const deg = protractorDegreeOf(p, d);
        // Sous le diamètre, l'aiguille reste en butée sur 0° ou 180°.
        const raw = deg ?? (d.x * Math.cos(p.angle) + d.y * Math.sin(p.angle) < 0 ? 180 : 0);
        setInstrument('protractor', { ...p, needleDeg: Math.min(180, Math.max(0, Math.round(raw))) });
        break;
      }
      case 'compassOpen': {
        const c = deskRef.current.instruments.compass;
        const hit = settingOn('points') ? snapPoint(q, targets(), px(SNAP_PX), { exclude: uiRef.current.compassCenterId ? new Set([uiRef.current.compassCenterId]) : null }) : null;
        const at = hit?.point ?? q;
        uiRef.current.marker = hit ? { kind: hit.kind, p: hit.point } : null;
        const r = dist(at, c);
        if (r > 1) setInstrument('compass', { ...c, radius: clampRadius(r), angle: angleOf(sub(at, c)) });
        break;
      }
      case 'compassDraw': {
        const c = deskRef.current.instruments.compass;
        const a = angleOf(sub(q, c));
        g.sweep += normalizeAngle(a - g.last);
        g.last = a;
        g.sweep = Math.max(-2 * Math.PI, Math.min(2 * Math.PI, g.sweep));
        setInstrument('compass', { ...c, angle: g.startAngle + g.sweep });
        uiRef.current.preview = { kind: 'arc', c: { x: c.x, y: c.y }, r: c.radius, start: g.startAngle, sweep: g.sweep };
        break;
      }
      default: break;
    }
    schedule();
  };

  const finishGesture = (event, cancelled) => {
    const g = gestureRef.current;
    if (!g) return;
    if (g.type === 'pinch') {
      g.clients.delete(event.pointerId);
      if (g.clients.size === 0) gestureRef.current = null;
      else g.start = null;

      return;
    }
    if (g.type === 'move' && !g.pointers.has(event.pointerId)) return;
    if (g.type === 'move' && g.pointers.size > 1) {
      g.pointers.delete(event.pointerId);
      // Le doigt restant reprend le glisser là où il est.
      const [[, rest]] = [...g.pointers.entries()];
      const inst = deskRef.current.instruments[g.kind];
      g.grabOffset = sub({ x: inst.x, y: inst.y }, rest);

      return;
    }
    if (g.pointerId !== undefined && g.pointerId !== event.pointerId && g.type !== 'move') return;
    gestureRef.current = null;
    uiRef.current.rotating = null;
    uiRef.current.hint = null;
    switch (g.type) {
      case 'stroke':
        if (!cancelled) endStroke(g);
        uiRef.current.preview = null;
        uiRef.current.marker = null;
        uiRef.current.pen = 'idle';
        uiRef.current.near = null;
        break;
      case 'compassDraw': {
        uiRef.current.preview = null;
        const c = deskRef.current.instruments.compass;
        if (!cancelled && Math.abs(g.sweep) > toRadians(3)) {
          const via = { tool: 'compass' };
          const seq = nextSeq(sceneRef.current.elements);
          const centerId = uiRef.current.compassCenterId && geo().points.has(uiRef.current.compassCenterId) ? uiRef.current.compassCenterId : null;
          const full = Math.abs(g.sweep) >= 2 * Math.PI - toRadians(1);
          const skeleton = full
            ? circleSkeleton({ x: c.x, y: c.y }, c.radius, pencilStyle(), { centerId, seq, via })
            : arcSkeleton({ x: c.x, y: c.y }, c.radius, g.startAngle, g.sweep, pencilStyle(), { centerId, seq, via });
          addToScene([skeleton], { withMeasures: deskRef.current.settings.measures && full });
        }
        break;
      }
      default: {
        uiRef.current.marker = null;
        const kind = g.kind ?? (g.type === 'needle' ? 'protractor' : 'compass');
        const inst = deskRef.current.instruments[kind];
        // Après un geste, l'instrument reste ATTEIGNABLE (§26 du brief).
        if (inst?.visible) setInstrument(kind, keepReachable(kind, inst, viewRect(), px(48)));
        // La منقلة posée sur un sommet s'aligne sur un côté : elle a « trouvé » la base.
        if (kind === 'protractor' && g.type === 'move' && settingOn('angles')) {
          const p = deskRef.current.instruments.protractor;
          const through = geo().linears.filter((l) => dist(l.a, p) < 1 || dist(l.b, p) < 1).map((l) => angleOf(sub(l.b, l.a)));
          const hit = snapRotation(p.angle, { stepDeg: 0, directions: through, tolerance: toRadians(12) });
          if (hit) setInstrument('protractor', rotateInstrumentAround(p, p, hit.angle - p.angle));
        }
        persist();
      }
    }
    schedule();
    // Le clavier revient à Excalidraw : Ctrl+Z annule le trait qu'on vient de faire.
    host?.focus?.({ preventScroll: true });
  };

  // Échap : lâcher l'outil du bureau AVANT de fermer quoi que ce soit.
  useEffect(() => {
    if (!host) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (uiRef.current.replay) {
        event.stopPropagation();
        stopReplay();
      } else if (uiRef.current.tool || gestureRef.current) {
        event.stopPropagation();
        gestureRef.current = null;
        setTool(null);
      }
    };
    host.addEventListener('keydown', onKey, true);

    return () => host.removeEventListener('keydown', onKey, true);
  }, [host, setTool, stopReplay]);

  /** Le clavier sur un instrument : flèches = glisser (1 mm, Maj : 1 cm), [ ] = tourner (1°, Maj : 15°). */
  const handleInstrumentKey = (kind) => (event) => {
    const inst = deskRef.current.instruments[kind];
    const step = event.shiftKey ? UNITS_PER_CM : UNITS_PER_CM / 10;
    const turn = toRadians(event.shiftKey ? 15 : 1);
    const pivot = instrumentGeometry(kind, inst).pivot;
    let next = null;
    switch (event.key) {
      case 'ArrowLeft': next = translateInstrument(inst, { x: -step, y: 0 }); break;
      case 'ArrowRight': next = translateInstrument(inst, { x: step, y: 0 }); break;
      case 'ArrowUp': next = translateInstrument(inst, { x: 0, y: -step }); break;
      case 'ArrowDown': next = translateInstrument(inst, { x: 0, y: step }); break;
      case '[': next = rotateInstrumentAround(inst, pivot, -turn); break;
      case ']': next = rotateInstrumentAround(inst, pivot, turn); break;
      case '+': case '=': if (kind === 'compass') next = { ...inst, radius: clampRadius(inst.radius + step) }; break;
      case '-': if (kind === 'compass') next = { ...inst, radius: clampRadius(inst.radius - step) }; break;
      case 'Delete': case 'Backspace': next = { ...inst, visible: false }; break;
      default: return;
    }
    if (!next) return;
    event.preventDefault();
    event.stopPropagation();
    setInstrument(kind, next);
    uiRef.current.focus = kind;
    schedule();
    persist();
  };

  // ── Le rendu ────────────────────────────────────────────────────────
  const v = viewRef.current;
  const z = v.zoom;
  const inst = desk.instruments;
  const found = inst.protractor.visible ? protractorReading() : null;
  const offscreen = INSTRUMENT_KINDS.filter((k) => inst[k].visible && svgRef.current && !isAnchorVisible(k, inst[k], viewRect()));
  const steps = sceneRef.current.elements.length ? constructionSteps(sceneRef.current.elements).filter((s) => s.kind !== 'measure') : [];
  const capture = Boolean(ui.tool) || Boolean(ui.replay);
  const penNow = penInHand();
  const zones = penNow ? activeConstraints() : [];
  const holder = ui.near ? zones.find((c) => c.id === ui.near)?.instrument ?? ui.near.split(':')[0] : null;
  const handleR = px(15);

  const toolbar = (
    <GeometryToolbar
      onAfterAction={() => requestAnimationFrame(() => host?.focus?.({ preventScroll: true }))}
      tool={ui.tool}
      exTool={lastExToolRef.current}
      focus={ui.focus}
      desk={desk}
      reading={found?.reading ? Math.round(found.reading.degrees) : null}
      hint={ui.hint}
      penState={penNow && INSTRUMENT_KINDS.some((kk) => inst[kk].visible) ? ui.pen : null}
      holder={holder}
      offscreen={offscreen}
      canReplay={steps.length > 0}
      replaying={Boolean(ui.replay)}
      onPickExcalidraw={pickExcalidrawTool}
      onPencil={() => setTool(ui.tool === 'pencil' ? null : 'pencil')}
      onToggleInstrument={toggleInstrument}
      onRecenter={recenter}
      onUpdateDesk={updateDesk}
      onUpdateInstrument={updateInstrument}
      onToggleMeasures={toggleMeasures}
      onProtractorConstruct={protractorConstruct}
      onPinReading={pinProtractorReading}
      onReplay={ui.replay ? stopReplay : startReplay}
    />
  );

  const layer = host ? (
    <svg
      ref={svgRef}
      className={`sa-geo-layer${capture ? ' sa-geo-layer--capture' : ''}${ui.tool ? ` sa-geo-layer--${ui.tool}` : ''}`}
      data-geo-layer
      data-geo-tool={ui.tool ?? ''}
      data-geo-pen={penNow ? ui.pen : 'none'}
      data-geo-gesture={gestureRef.current?.type ?? ''}
      data-geo-holder={holder ?? ''}
      dir="ltr"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerOut={(e) => { if (!gestureRef.current) hoverPen(toScene(e)); }}
      onPointerUp={(e) => finishGesture(e, false)}
      onPointerCancel={(e) => finishGesture(e, true)}
      onLostPointerCapture={(e) => { if (gestureRef.current && gestureRef.current.pointerId === e.pointerId) finishGesture(e, true); }}
    >
      {capture && <rect className="sa-geo-capture" x={0} y={0} width="100%" height="100%" data-geo-capture />}
      <g transform={`scale(${z}) translate(${v.scrollX} ${v.scrollY})`} data-geo-world>
        {ui.replay ? (
          <ReplayStage replay={ui.replay} view={viewRect()} zoom={z} />
        ) : (
          <>
            <g data-geo-instruments>
              {inst.ruler.visible && (
                <g transform={poseTransform(inst.ruler)} tabIndex={0} role="button" aria-label={t('tools.whiteboard.geo.ruler')} onKeyDown={handleInstrumentKey('ruler')} data-geo-instrument="ruler" className="sa-geo-instrument">
                  <RulerShape lengthCm={inst.ruler.lengthCm} highlight={ui.preview?.edge?.startsWith('ruler')} />
                </g>
              )}
              {inst.setSquare.visible && (
                <g transform={poseTransform(inst.setSquare)} tabIndex={0} role="button" aria-label={t('tools.whiteboard.geo.setSquare')} onKeyDown={handleInstrumentKey('setSquare')} data-geo-instrument="setSquare" className="sa-geo-instrument">
                  <SetSquareShape kind={inst.setSquare.kind} sizeCm={inst.setSquare.sizeCm} />
                </g>
              )}
              {inst.protractor.visible && (
                <g tabIndex={0} role="button" aria-label={t('tools.whiteboard.geo.protractor')} onKeyDown={handleInstrumentKey('protractor')} data-geo-instrument="protractor" className="sa-geo-instrument">
                  <g transform={poseTransform(inst.protractor)}>
                    <ProtractorShape radiusCm={inst.protractor.radiusCm} />
                  </g>
                  <ProtractorOverlay p={inst.protractor} found={found} z={z} />
                </g>
              )}
              {inst.compass.visible && (
                <g tabIndex={0} role="button" aria-label={t('tools.whiteboard.geo.compass')} onKeyDown={handleInstrumentKey('compass')} data-geo-instrument="compass" className="sa-geo-instrument">
                  <CompassShape compass={inst.compass} drawing={gestureRef.current?.type === 'compassDraw'} />
                </g>
              )}
            </g>
            {penNow && <ConstraintZones constraints={zones} z={z} near={ui.near} />}
            <Handles inst={inst} r={handleR} t={t} tool={ui.tool} pen={penNow} view={svgRef.current ? viewRect() : null} />
            <Preview preview={ui.preview} z={z} desk={desk} t={t} />
            <Marker marker={ui.marker} z={z} />
            <Readouts inst={inst} ui={ui} z={z} gesture={gestureRef.current} />
          </>
        )}
      </g>
    </svg>
  ) : null;

  return (
    <>
      {toolbar}
      {layer && createPortal(layer, host)}
    </>
  );
});

export default GeometryDesk;

// ── Les morceaux du calque ──────────────────────────────────────────────

/**
 * Les zones d'ACCROCHE du crayon : une bande de ±ATTACH_PX px d'écran le long
 * de chaque bord, un disque autour de la mine du compas et du sommet de la
 * منقلة. Transparentes — ce qui se voit, c'est le bord qui s'allume quand la
 * mine s'approche (« near ») et pendant qu'il la tient.
 */
function ConstraintZones({ constraints, z, near }) {
  const w = (2 * ATTACH_PX) / z;
  const glow = { stroke: '#3b82f6', strokeOpacity: 0.6, strokeWidth: 3 / z, strokeLinecap: 'round', pointerEvents: 'none' };

  return (
    <g data-geo-zones>
      {constraints.map((c) => {
        const active = c.id === near;
        if (c.family === 'straight') {
          const a = add(c.origin, scale(c.u, c.from));
          const b = add(c.origin, scale(c.u, c.to));

          return (
            <g key={c.id}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={w} className="sa-geo-zone" data-geo-zone={c.id} />
              {active && <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} {...glow} data-geo-glow={c.id} />}
            </g>
          );
        }
        if (c.family === 'ray') {
          const b = add(c.origin, scale(c.u, c.reach));

          return (
            <g key={c.id}>
              <line x1={c.origin.x} y1={c.origin.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={w} className="sa-geo-zone" data-geo-zone={c.id} />
              <circle cx={c.origin.x} cy={c.origin.y} r={(ATTACH_PX * 1.2) / z} fill="transparent" className="sa-geo-zone" data-geo-zone={c.id} />
              {active && <line x1={c.origin.x} y1={c.origin.y} x2={b.x} y2={b.y} {...glow} data-geo-glow={c.id} />}
            </g>
          );
        }
        if (c.instrument === 'protractor') {
          // Le bord COURBE de la منقلة : un demi-cercle, du côté de ses graduations.
          const pts = arcPoints(c.center, c.radius, c.baseAngle, -Math.PI, 60);
          const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q.x} ${q.y}`).join('');

          return (
            <g key={c.id}>
              <path d={d} fill="none" stroke="transparent" strokeWidth={w} className="sa-geo-zone" data-geo-zone={c.id} />
              {active && <path d={d} fill="none" {...glow} stroke="#f08c00" data-geo-glow={c.id} />}
            </g>
          );
        }
        const tip = add(c.center, scale(unit(c.startAngle), c.radius));

        return (
          <g key={c.id}>
            <circle cx={tip.x} cy={tip.y} r={(ATTACH_PX * 1.3) / z} fill="transparent" className="sa-geo-zone" data-geo-zone={c.id} />
            {active && <circle cx={tip.x} cy={tip.y} r={(ATTACH_PX * 0.9) / z} fill="none" {...glow} data-geo-glow={c.id} />}
          </g>
        );
      })}
    </g>
  );
}

/** Les poignées : tourner, ouvrir, lire. Taille constante à l'écran (doigt de 30 px). */
function Handles({ inst, r, t, tool, pen, view }) {
  const out = [];
  const knob = (key, p, part, label, color = '#1971c2') => (
    <g key={key} data-geo-handle data-geo-hit={part} className="sa-geo-handle" aria-label={label}>
      <title>{label}</title>
      <circle cx={p.x} cy={p.y} r={r} fill="#ffffff" fillOpacity={0.92} stroke={color} strokeWidth={r * 0.12} />
      <path
        d={`M${p.x - r * 0.45} ${p.y}A${r * 0.45} ${r * 0.45} 0 1 1 ${p.x} ${p.y + r * 0.45}`}
        fill="none" stroke={color} strokeWidth={r * 0.13} strokeLinecap="round" pointerEvents="none"
      />
    </g>
  );
  if (inst.ruler.visible) {
    // La poignée de rotation est au bout de la règle — sauf si ce bout est
    // hors de l'écran (un téléphone) : elle glisse alors vers le zéro, pour
    // rester sous le doigt.
    const g = instrumentGeometry('ruler', inst.ruler);
    const m = r * 1.4;
    const inView = (q) => !view || (q.x >= view.minX + m && q.x <= view.maxX - m && q.y >= view.minY + m && q.y <= view.maxY - m);
    let at = g.rotateHandle;
    for (let s = g.L - 0.2 * UNITS_PER_CM; s >= 2 * UNITS_PER_CM && !inView(at); s -= 0.5 * UNITS_PER_CM) {
      at = add(add(g.o, scale(g.u, s)), scale(g.n, RULER_WIDTH * 0.62));
    }
    out.push(knob('r', at, 'ruler:rotate', t('tools.whiteboard.geo.rotate')));
  }
  if (inst.setSquare.visible) out.push(knob('s', instrumentGeometry('setSquare', inst.setSquare).rotateHandle, 'setSquare:rotate', t('tools.whiteboard.geo.rotate'), '#2b8a3e'));
  if (inst.protractor.visible) {
    const g = protractorGeometry(inst.protractor);
    out.push(knob('p', g.rotateHandle, 'protractor:rotate', t('tools.whiteboard.geo.rotate')));
    if (inst.protractor.mode === 'construct') out.push(
      <g key="n" data-geo-handle data-geo-hit="protractor:needle" className="sa-geo-handle" aria-label={t('tools.whiteboard.geo.needle')}>
        <title>{t('tools.whiteboard.geo.needle')}</title>
        <circle cx={g.needleHandle.x} cy={g.needleHandle.y} r={r * 0.8} fill="#fff5f5" fillOpacity={0.95} stroke="#e03131" strokeWidth={r * 0.12} />
      </g>,
    );
  }
  if (inst.compass.visible) {
    const g = compassGeometry(inst.compass);
    // Crayon en main, la mine du compas est l'endroit où il s'ACCROCHE pour tracer ;
    // sinon, la tirer ouvre le compas.
    const tipKey = pen || inst.compass.locked ? 'tools.whiteboard.geo.compassDrawHint' : 'tools.whiteboard.geo.compassOpenHint';
    out.push(
      <g key="ct" data-geo-handle data-geo-hit="compass:tip" className="sa-geo-handle" aria-label={t(tipKey)}>
        <title>{t(tipKey)}</title>
        <circle cx={g.tip.x} cy={g.tip.y} r={r} fill="#fff9db" fillOpacity={0.35} stroke="#f08c00" strokeWidth={r * 0.1} strokeDasharray={`${r * 0.3} ${r * 0.2}`} />
      </g>,
      <g key="ck" data-geo-handle data-geo-hit="compass:knob" className="sa-geo-handle" aria-label={t('tools.whiteboard.geo.compassTurnHint')}>
        <title>{t('tools.whiteboard.geo.compassTurnHint')}</title>
        <circle cx={g.knob.x} cy={g.knob.y} r={r} fill="#ffffff" fillOpacity={0.9} stroke="#495057" strokeWidth={r * 0.12} />
        <path
          d={`M${g.knob.x - r * 0.45} ${g.knob.y}A${r * 0.45} ${r * 0.45} 0 1 1 ${g.knob.x} ${g.knob.y + r * 0.45}`}
          fill="none" stroke="#495057" strokeWidth={r * 0.13} strokeLinecap="round" pointerEvents="none"
        />
      </g>,
      <g key="cp" data-geo-handle data-geo-hit="compass:pivot" className="sa-geo-handle" aria-label={t('tools.whiteboard.geo.compassMoveHint')}>
        <title>{t('tools.whiteboard.geo.compassMoveHint')}</title>
        <circle cx={g.pivot.x} cy={g.pivot.y} r={r * 0.8} fill="#ffffff" fillOpacity={tool === 'compass' ? 0.25 : 0.01} stroke="#c92a2a" strokeWidth={r * 0.08} />
      </g>,
    );
  }

  return <g data-geo-handles>{out}</g>;
}

/** L'aiguille de la منقلة, la lecture de l'angle posé et son secteur. */
function ProtractorOverlay({ p, found, z }) {
  const g = protractorGeometry(p);
  const tipN = add(g.center, scale(g.directionOf(p.needleDeg), g.R * 0.97));
  const construct = p.mode === 'construct';
  const out = [
    construct && <line key="needle" x1={g.center.x} y1={g.center.y} x2={tipN.x} y2={tipN.y} stroke="#e03131" strokeWidth={1.4 / z} strokeDasharray={`${6 / z} ${4 / z}`} pointerEvents="none" />,
  ];
  if (found?.reading) {
    const r = Math.min(g.R * 0.35, 1.6 * UNITS_PER_CM);
    const a0 = angleOf(found.reading.from);
    const a1 = angleOf(found.reading.to);
    const sweep = normalizeAngle(a1 - a0);
    const pts = arcPoints(g.center, r, a0, sweep, 60);
    const d = `M${g.center.x} ${g.center.y}${pts.map((q) => `L${q.x} ${q.y}`).join('')}Z`;
    out.push(<path key="wedge" d={d} fill="#fa5252" fillOpacity={0.18} stroke="#e03131" strokeWidth={1.2 / z} pointerEvents="none" data-geo-ui />);
    const mid = add(g.center, scale(unit(a0 + sweep / 2), r + 18 / z));
    out.push(<Pill key="read" at={mid} z={z} text={`${Math.round(found.reading.degrees)}°`} color="#c92a2a" data-reading />);
  }
  if (construct) out.push(<Pill key="needleValue" at={add(g.needleHandle, scale(g.directionOf(p.needleDeg), 26 / z))} z={z} text={`${p.needleDeg}°`} color="#e03131" small />);

  return <g data-geo-ui>{out}</g>;
}

/** Une étiquette lisible au tableau : fond blanc, taille constante à l'écran. */
function Pill({ at, z, text, color = '#1e1e1e', small = false, rtl = false, ...rest }) {
  const fs = (small ? 12 : 15) / z;
  const w = (text.length * (small ? 7.4 : rtl ? 8 : 9) + 16) / z;
  const h = fs * 1.7;

  return (
    <g pointerEvents="none" data-geo-ui {...rest}>
      <rect x={at.x - w / 2} y={at.y - h / 2} width={w} height={h} rx={h / 2} fill="#ffffff" fillOpacity={0.94} stroke={color} strokeWidth={1 / z} />
      <text x={at.x} y={at.y} fontSize={fs} textAnchor="middle" dominantBaseline="central" fill={color} fontFamily={rtl ? 'Cairo, Nunito, sans-serif' : 'Nunito, Inter, sans-serif'} fontWeight={700} direction={rtl ? 'rtl' : 'ltr'}>{text}</text>
    </g>
  );
}

/** Le trait en cours : ce que le crayon, ou le compas, est en train de tracer. */
function Preview({ preview, z, desk, t }) {
  if (!preview) return null;
  // Le trait prend le style du crayon qui le fait : celui du القلم d'Excalidraw, ou du قلم الهندسة.
  const style = preview.style ?? { width: PENCIL_WIDTHS[desk.pencil.width], style: desk.pencil.style, color: '#1e1e1e' };
  const stroke = style.color ?? '#1e1e1e';
  const width = style.width ?? 1.5;
  const dash = style.style === 'dashed' ? '8 6' : style.style === 'dotted' ? '1.5 5' : undefined;
  const lengthLabel = (units) => `${t('tools.whiteboard.geo.segmentLength')} ${formatLength(units)} ${t('tools.whiteboard.geo.unitShort')}`;
  if (preview.kind === 'arc') {
    const pts = arcPoints(preview.c, preview.r, preview.start, preview.sweep);
    const d = pts.map((q, i) => `${i ? 'L' : 'M'}${q.x} ${q.y}`).join('');
    const end = pts[pts.length - 1];

    return (
      <g pointerEvents="none" data-geo-preview="arc">
        <path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
        <Pill
          at={add(end, scale(unit(preview.start + preview.sweep), 26 / z))} z={z} color="#1971c2" data-geo-live="arc"
          data-geo-degrees={formatNumber(Math.abs(toDegrees(preview.sweep)), 0)}
          rtl={preview.instrument === 'protractor'}
          text={preview.instrument === 'protractor'
            ? `${t('tools.whiteboard.geo.arcSpan')} ${formatNumber(Math.abs(toDegrees(preview.sweep)), 0)}°`
            : `r = ${formatLength(preview.r)} · ${formatNumber(Math.abs(toDegrees(preview.sweep)), 0)}°`}
        />
      </g>
    );
  }
  const { start, end, kind } = preview;
  if (kind === 'point') {
    return <g pointerEvents="none"><circle cx={end.x} cy={end.y} r={3.5} fill={stroke} /><PencilCursor at={end} zoom={z} /></g>;
  }
  if (kind === 'circle') {
    const r = dist(start, end);

    return (
      <g pointerEvents="none" data-geo-preview="circle">
        <circle cx={start.x} cy={start.y} r={r} fill="none" stroke={stroke} strokeWidth={width} strokeDasharray={dash} />
        <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#1971c2" strokeWidth={1 / z} strokeDasharray={`${4 / z} ${4 / z}`} />
        <Pill at={add(scale(add(start, end), 0.5), { x: 0, y: -16 / z })} z={z} text={`r = ${formatLength(r)}`} color="#1971c2" />
        <PencilCursor at={end} zoom={z} />
      </g>
    );
  }
  const [p0, p1] = dist(start, end) > 1e-6 ? drawnEnds(kind, start, end) : [start, end];
  // Le long d'un instrument gradué, la longueur est celle que la RÈGLE lit.
  const length = preview.measure?.length ?? dist(start, end);
  const label = preview.measure?.angle !== undefined ? `${preview.measure.angle}° · ${lengthLabel(length)}` : lengthLabel(length);

  return (
    <g pointerEvents="none" data-geo-preview={kind}>
      <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={stroke} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />
      <circle cx={start.x} cy={start.y} r={3} fill={stroke} />
      <circle cx={end.x} cy={end.y} r={3} fill={stroke} />
      {dist(start, end) > 4 / z && (
        <Pill at={add(scale(add(start, end), 0.5), scale(labelSide(sub(end, start), scale(add(start, end), 0.5), preview.awayFrom), 22 / z))} z={z} text={label} color="#1971c2" rtl data-geo-live="length" data-geo-length={formatLength(length)} />
      )}
      <PencilCursor at={end} zoom={z} />
    </g>
  );
}

/** La normale du trait qui s'éloigne de `awayFrom` (l'instrument) — ou qui monte, sans instrument. */
const labelSide = (d, mid, awayFrom) => {
  const n = perpUp(d);
  if (!awayFrom) return n;

  return dot(sub(awayFrom, mid), n) > 0 ? scale(n, -1) : n;
};

const perpUp = (d) => {
  const l = len(d) || 1;
  const n = { x: d.y / l, y: -d.x / l };

  return n.y > 0 ? scale(n, -1) : n;
};

/** L'indice d'aimantation : discret, jamais une animation. */
function Marker({ marker, z }) {
  if (!marker) return null;
  const s = 1 / z;
  const { p } = marker;
  switch (marker.kind) {
    case 'point': case 'intersection': case 'endpoint': case 'center': case 'grid':
      return (
        <g pointerEvents="none" data-geo-marker={marker.kind}>
          <circle cx={p.x} cy={p.y} r={9 * s} fill="none" stroke={marker.kind === 'intersection' ? '#e8590c' : '#1971c2'} strokeWidth={1.6 * s} />
          {marker.kind === 'intersection' && <path d={`M${p.x - 5 * s} ${p.y - 5 * s}L${p.x + 5 * s} ${p.y + 5 * s}M${p.x + 5 * s} ${p.y - 5 * s}L${p.x - 5 * s} ${p.y + 5 * s}`} stroke="#e8590c" strokeWidth={1.4 * s} />}
        </g>
      );
    case 'perpendicular': case 'right': {
      const u = unit(marker.dir ?? 0);
      const n = { x: u.y, y: -u.x };
      const a = add(p, scale(u, 12 * s));
      const b = add(a, scale(n, 12 * s));
      const c = add(p, scale(n, 12 * s));

      return <path pointerEvents="none" data-geo-marker="perpendicular" d={`M${a.x} ${a.y}L${b.x} ${b.y}L${c.x} ${c.y}`} fill="none" stroke="#2b8a3e" strokeWidth={1.8 * s} />;
    }
    case 'parallel': case 'horizontal': case 'vertical': {
      const u = unit(marker.dir ?? 0);
      const n = { x: u.y, y: -u.x };
      const mk = (k) => {
        const c = add(p, scale(n, k * 5 * s));
        const a = sub(c, scale(u, 9 * s));
        const b = add(c, scale(u, 9 * s));

        return `M${a.x} ${a.y}L${b.x} ${b.y}`;
      };

      return <path pointerEvents="none" data-geo-marker={marker.kind} d={`${mk(-1)}${mk(1)}`} stroke="#7048e8" strokeWidth={1.6 * s} />;
    }
    default: return null;
  }
}

/** Les lectures pour la classe : l'ouverture du compas, l'angle pendant qu'on tourne. */
function Readouts({ inst, ui, z, gesture }) {
  const out = [];
  if (inst.compass.visible) {
    const g = compassGeometry(inst.compass);
    out.push(<Pill key="r" at={add(g.knob, scale(g.n, 22 / z))} z={z} text={`r = ${formatLength(inst.compass.radius)}`} color="#1971c2" data-compass-radius />);
    if (gesture?.type === 'compassOpen' || gesture?.type === 'compassDraw') {
      out.push(<line key="rl" x1={g.pivot.x} y1={g.pivot.y} x2={g.tip.x} y2={g.tip.y} stroke="#1971c2" strokeWidth={1 / z} strokeDasharray={`${4 / z} ${4 / z}`} pointerEvents="none" />);
    }
  }
  if (ui.rotating) {
    out.push(<Pill key="rot" at={add(ui.rotating.p, { x: 0, y: 30 / z })} z={z} text={`${formatNumber(ui.rotating.deg, 0)}°`} color="#495057" />);
  }

  return <g data-geo-ui>{out}</g>;
}

/** « إعادة البناء » : la construction se refait devant la classe, instrument en main. */
function ReplayStage({ replay, view, zoom }) {
  const { done, current } = frameAt(replay.timeline, replay.t);
  const pad = 200;

  return (
    <g pointerEvents="none" data-geo-replay>
      <rect x={view.minX - pad} y={view.minY - pad} width={view.maxX - view.minX + 2 * pad} height={view.maxY - view.minY + 2 * pad} fill="#ffffff" />
      {done.map((s) => <StepDrawing key={s.id} step={s} progress={1} zoom={zoom} />)}
      {current && <StepDrawing key={current.step.id} step={current.step} progress={current.progress} zoom={zoom} live />}
    </g>
  );
}

function StepDrawing({ step, progress, zoom, live = false }) {
  const stroke = step.style?.color ?? '#1e1e1e';
  const width = step.style?.width ?? 1.5;
  const dash = step.style?.style === 'dashed' ? '8 6' : step.style?.style === 'dotted' ? '1.5 5' : undefined;
  switch (step.kind) {
    case 'point':
      return (
        <g opacity={Math.min(1, progress * 2)}>
          <circle cx={step.p.x} cy={step.p.y} r={3.5} fill="#1e1e1e" />
          {step.label && <text x={step.p.x + 6} y={step.p.y - 10} fontSize={20} fill="#1e1e1e" fontFamily="Nunito, sans-serif" direction="ltr">{step.label}</text>}
        </g>
      );
    case 'segment': case 'line': case 'ray': {
      const { settling, drawn } = live ? drawPhase(progress) : { settling: 1, drawn: 1 };
      const end = add(step.p0, scale(sub(step.p1, step.p0), drawn));
      const tool = step.via?.tool;
      let instrument = null;
      if (live && tool === 'setSquare' && step.via.pose) {
        instrument = <g transform={poseTransform(step.via.pose)} opacity={settling}><SetSquareShape kind={step.via.pose.kind} sizeCm={step.via.pose.sizeCm} /></g>;
      } else if (live && tool === 'protractor' && step.via.pose) {
        instrument = <g transform={poseTransform(step.via.pose)} opacity={settling}><ProtractorShape radiusCm={step.via.pose.radiusCm} /></g>;
      } else if (live) {
        const pose = rulerPoseFor(step);
        instrument = <g transform={poseTransform(pose)} opacity={settling}><RulerShape lengthCm={pose.lengthCm} /></g>;
      }

      return (
        <g>
          {instrument}
          {drawn > 0 && <line x1={step.p0.x} y1={step.p0.y} x2={end.x} y2={end.y} stroke={stroke} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" />}
          {live && drawn > 0 && drawn < 1 && <PencilCursor at={end} zoom={zoom} />}
        </g>
      );
    }
    case 'arc': case 'circle': {
      const { settling, drawn } = live ? drawPhase(progress, 0.25) : { settling: 1, drawn: 1 };
      const sweep = step.sweep * drawn;
      const pts = drawn > 0 ? arcPoints(step.c, step.r, step.start, sweep) : [];
      const compass = live ? { x: step.c.x, y: step.c.y, radius: Math.max(1, step.r * Math.min(1, 0.3 + settling * 0.7)), angle: step.start + sweep, visible: true } : null;

      return (
        <g>
          {pts.length > 1 && <path d={pts.map((q, i) => `${i ? 'L' : 'M'}${q.x} ${q.y}`).join('')} fill="none" stroke={stroke} strokeWidth={width} strokeDasharray={dash} />}
          {compass && <CompassShape compass={compass} drawing={drawn > 0} />}
        </g>
      );
    }
    case 'measure':
      return <text x={step.p.x} y={step.p.y} fontSize={18} fill="#1971c2" fontFamily="Nunito, sans-serif" direction="ltr" opacity={progress}>{step.text}</text>;
    default:
      return null;
  }
}

