import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, RotateCcw, RotateCw, Camera } from 'lucide-react';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import * as L from '../logic/thalesBeam';

/**
 * thales-beam — LE FAISCEAU (unité 9 « خاصية طالس », درس « خاصية طالس وحساب الأطوال », نشاط 1 p. 104).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève fait GLISSER l'écran (B′C′) le long du faisceau issu de A : la poignée B′ court sur (d)
 *    (glisser n'importe où sur la scène, −/+, flèches, Page ±1 cm) ; une seconde poignée C′ INCLINE l'écran
 *    (C′ quitte la position parallèle sur (d′)) ; il ENREGISTRE un arrêt puis JUGE « les trois rapports sont-ils
 *    égaux ? ». En متقدم, il pousse l'écran À TRAVERS A (la chambre noire).
 * B. Idée : (B′C′) // (BC) ⇒ AB′/AB = AC′/AC = B′C′/BC = k, à toutes les positions, des deux côtés de A ;
 *    l'écran incliné sépare les rapports. AB′C′ est une réduction de ABC (k < 1).
 * C. L'écran se déplace et rétrécit / grandit sous le doigt ; les longueurs mesurées sur les règles des rayons
 *    changent ; incliné, il devient rose et perd ses chevrons de parallélisme ; derrière A la salle devient une
 *    chambre noire et l'écran est retourné (B′ en bas, C′ en haut).
 * D. Sous la scène, les trois rapports LUS (non simplifiés, « ≈ » quand la mesure est arrondie) ; après le
 *    jugement, k exact (8/15) ou le rapport qui diffère ; la liste des arrêts (repliable).
 * E. À découvrir avant la règle : l'égalité des rapports TIENT tant que l'écran est parallèle (deux arrêts au
 *    moins, et en متقدم l'arrêt du manuel AB′ = 3,2 et un arrêt derrière A) et CÈDE dès qu'il est incliné.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        خاصية طالس : deux sécantes en A coupées par deux parallèles ⇒ longueurs proportionnelles
 *   OBJECT         un écran (B′C′) dans le faisceau d'un projecteur (A), face à la grande toile (BC)
 *   VARIABLE       la position AB′ de l'écran (la main la tient : entier en مبتدئ, au dixième en متقدم, signée
 *                  derrière A) ; l'inclinaison t de l'écran (seconde poignée)
 *   INVARIANT      le triangle ABC ; tant que t = 0, AB′/AB = AC′/AC = B′C′/BC (k, exact, thales.ratio)
 *   TRANSFORMATION les trois longueurs AB′, AC′, B′C′ et leurs rapports, en direct
 *   CONSTRAINT     l'écran reste entre les deux rayons (B′ sur (d), C′ sur (d′)) ; en A il n'y a pas de triangle
 *   RESISTANCE     incliner l'écran sépare les rapports : le jugement « égales » est refusé avec le rapport qui
 *                  diffère (AC′/AC = 3/5 ≠ 1/2) ; l'arrêt sur A est refusé (pas de triangle)
 *   EVIDENCE       les rapports lus sous la scène, le k exact après chaque jugement, la liste des arrêts
 *   CONTRAST       parallèle / incliné ; un côté de A / l'autre (متقدم)
 *   PREDICTION     le JUGEMENT de l'élève avant que l'écran ne tranche (en متقدم sur des mesures arrondies)
 *   DISCOVERY      « parallèle ⇔ rapports égaux, où que soit l'écran » ; « la différence constante » réfutée
 *                  par SES nombres (6 − 3,2 ≠ 7 − 56/15)
 *   FORMALIZATION  AB′/AB = AC′/AC = B′C′/BC = k ; k < 1 réduction
 *   TRANSFER       les questions du نشاط 1 (cas 1 et 2) répondues depuis les arrêts de l'élève, معارف 1–2, طرائق
 *
 * Mondes : `cinema` (la projection en plein air du quartier : le projecteur en A, la grande toile (BC), une
 * toile mobile tenue par les amis) et `camera` (derrière A, la chambre noire au trou d'épingle : l'image
 * renversée). Manuel (§6bis) : chaque arrêt est un jugement — aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire, monde des jeunes du quartier) : guirlande d'ampoules, silhouettes du public,
 * le boîtier du projecteur, la chambre noire, un seau de pop-corn qui saute au toucher. `aria-hidden`, hors
 * clavier, `[data-deco]`, jamais une information, immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la hauteur de la scène vient de l'écran de leçon (`useLessonViewport`) moins ce que
 * le bloc `[data-tb-glance]` MESURE en plus du dessin ; les deux poignées sont SUR la figure, les −/+, « سجّل »,
 * le jugement et la lecture juste dessous ; la liste des arrêts est dans un `LabFold` sous le bloc mesuré.
 *
 * Props : `AB`, `AC`, `BC` (longueurs, décimales acceptées), `ABp` (la position du manuel, متقدم), `mode`
 * (`projector` | `projector|butterfly`), `theme` (`cinema`), `title`, `lead`, `mission`, `level`, `levels`,
 * `onTrial(evidence)` à chaque arrêt jugé, `onFinished({ k })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-thales-beam][data-mode][data-i][data-t][data-side=projector|camera][data-solved],
 * [data-tb-glance], [data-tb-scene], [data-tb-handle=pos|tilt] (role=slider), [data-tb-pos-less|more],
 * [data-tb-tilt-less|more], [data-tb-record], [data-tb-claim=equal|unequal], [data-tb-ratio=AB|AC|BC],
 * [data-tb-verdict=<kind>], [data-tb-screen][data-parallel], [data-tb-need], [data-lab-fold=thales-beam.stops],
 * [data-tb-stop=<n>][data-ok], [data-tb-formal], [data-deco].
 */
const tx = (p) => LIN.fracLatex(p);
const dec = (p) => { const d = LIN.fracDecimal(p, 2); return d == null ? LIN.fracLatex(p) : d.replace(',', '{,}'); };

export default function ThalesBeam({
  AB = 4, AC = 5, BC = 3, ABp = null, mode = 'projector', theme = 'cinema', title, lead, mission, level,
  levels: withLevels = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.thalesBeam.${key}`, o), [t]);
  const initialNumbers = ABp == null ? { AB, AC, BC, mode } : { AB, AC, BC, ABp, mode };
  const state = useManipulation({ type: 'thales-beam', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nb = state.numbers;
  const make = () => L.init(nb);
  const [lab, setLab] = useState(make);
  const sceneKey = `${nb.AB}|${nb.AC}|${nb.BC}|${nb.ABp ?? ''}|${nb.mode}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); }

  const ready = L.discoveryReady(lab);
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    const w = L.witnesses(lab).par;
    state.report(onFinished, { k: w ? LIN.fracText(L.reading(lab, w.i, 0).k) : null });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nStops = lab.stops.length;
  useEffect(() => { if (nStops > 0) state.report(onTrial, L.evidenceOf(lab, lab.stops.at(-1))); }, [nStops]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur, hauteur de l'écran de leçon, ce que le bloc mesure en plus du dessin ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const svgHRef = useRef(200);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(300);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(150, Math.ceil(glanceRef.current.getBoundingClientRect().height) - svgHRef.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 640;
  const narrow = width < 380;
  const maxH = Math.max(130, Math.min(Math.round(width * 0.95), 400, screenH - overhead - 24));
  const lay = useMemo(() => L.layout(lab, { width, maxHeight: maxH, pad: narrow ? 18 : 24 }), [lab.tri, lab.butterfly, width, maxH, narrow]); // eslint-disable-line react-hooks/exhaustive-deps
  svgHRef.current = lay.H;

  /* ── les deux gestes ── */
  const svgRef = useRef(null);
  const toLocal = (cx, cy) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || !r.width) return null;
    return [((cx - r.left) * lay.W) / r.width, ((cy - r.top) * lay.H) / r.height];
  };
  const posTo = useCallback((cx, cy) => { const p = toLocal(cx, cy); return p ? L.iFromPoint(lab, lay, p) : lab.i; }, [lab, lay]); // eslint-disable-line react-hooks/exhaustive-deps
  const tiltTo = useCallback((cx, cy) => { const p = toLocal(cx, cy); return p ? L.tFromPoint(lab, lay, p) : lab.t; }, [lab, lay]); // eslint-disable-line react-hooks/exhaustive-deps
  const move = (i) => setLab((s) => L.setPosition(s, i));
  const tilt = (tt) => setLab((s) => L.setTilt(s, tt));
  const pageStep = Math.max(1, Math.round(1 / LIN.toNumber(lab.step)));
  const pos = useStretchInteraction({ value: lab.i, range: { min: lab.iMin, max: lab.iMax }, toValue: posTo, direction: 'ltr', pageStep, settleMs: 300, onChange: move, onCommit: move });
  const tr = L.tiltRange(lab);
  const tl = useStretchInteraction({ value: lab.t, range: { min: tr.min, max: tr.max }, toValue: tiltTo, direction: 'ltr', pageStep: 1, settleMs: 300, onChange: tilt, onCommit: tilt });
  const tiltTrack = {
    ...tl.trackProps,
    onPointerDown: (e) => { e.stopPropagation(); tl.trackProps.onPointerDown(e); },
    onPointerMove: (e) => { e.stopPropagation(); tl.trackProps.onPointerMove(e); },
    onPointerUp: (e) => { e.stopPropagation(); tl.trackProps.onPointerUp(e); },
  };
  const record = () => { pos.flush(); tl.flush(); setLab((s) => L.record(s)); };
  const claim = (says) => setLab((s) => L.claim(s, says));

  /* ── la lecture ── */
  const r = L.reading(lab);
  const rt = L.readingTex(lab);
  const approx = rt && (!rt.AC.len.exact || !rt.BC.len.exact);
  const fly = lab.i < 0;
  const side = fly ? 'camera' : 'projector';

  /* ── le verdict ── */
  // sur téléphone, les fractions du verdict en \tfrac (une ligne de moins à 320 px)
  const V = (str) => (narrow ? str.replace(/\\dfrac/g, '\\tfrac') : str);
  const last = lab.last;
  const verdict = (() => {
    if (!last) return null;
    const st = last.stop;
    const rr = st ? L.reading(lab, st.i, st.t) : null;
    const o = rr ? { k: tx(rr.k), rB: tx(rr.rB), rC: tx(rr.rC) } : {};
    switch (last.kind) {
      case 'tilt': return <span className="text-rose-800">{<MathText>{k('vTilt')}</MathText>}</span>;
      case 'parallelAgain': return <span className="text-emerald-800"><MathText>{k('vParallelAgain')}</MathText></span>;
      case 'tiltAtA': return <span className="text-amber-800">{k('vTiltAtA')}</span>;
      case 'atA': return <span className="text-amber-800">{k('vAtA')}</span>;
      case 'dup': return <span className="text-amber-800">{k('vDup')}</span>;
      case 'recorded': return <span className="text-indigo-900">{k('vRecorded')}</span>;
      case 'claimOk': return <span className="text-emerald-800"><MathText>{V(k(st.equal ? 'vOkEqual' : 'vOkUnequal', o))}</MathText></span>;
      case 'claimWrong': return <span className="text-rose-800"><MathText>{V(k(st.equal ? 'vWrongUnequal' : 'vWrongEqual', o))}</MathText></span>;
      case 'move': return fly ? <span className="text-slate-700">{k('flyNote')}</span> : null;
      default: return null;
    }
  })();
  const verdictKind = last?.kind ?? '';

  /* ── ce qu'il reste à faire (orientation, jamais la réponse) ── */
  const pr = L.progress(lab);
  const needs = [
    !pr.twoParallel && k('needTwo'),
    !pr.tilted && k('needTilt'),
    !pr.target && k('needTarget', { v: dec(lab.target) }),
    !pr.fly && k('needFly'),
  ].filter(Boolean);

  /* ── la découverte ── */
  const discoveryOptions = useMemo(() => {
    const { par, tilt: tw } = L.witnesses(lab);
    if (!par || !tw) return [{ text: <MathText>{k('dRight')}</MathText>, correct: true }];
    const rt2 = L.reading(lab, tw.i, tw.t);
    const d = L.differenceWitness(lab, par);
    return [
      { text: <MathText>{k('dAlways')}</MathText>, why: <MathText>{k('dWhyAlways', { rB: tx(rt2.rB), rC: tx(rt2.rC) })}</MathText> },
      { text: <MathText>{k('dRight')}</MathText>, correct: true },
      { text: k('dDiff'), why: <MathText>{k('dWhyDiff', { dB: dec(d.dB), dC: dec(d.dC) })}</MathText> },
    ];
  }, [lab, k]);
  const wPar = L.witnesses(lab).par;
  const formal = (
    <div className="space-y-2" data-tb-formal>
      <EquationDisplay tone="result" tex={"\\dfrac{AB'}{AB} = \\dfrac{AC'}{AC} = \\dfrac{B'C'}{BC} = k"} />
      {wPar && (() => {
        const rw = L.reading(lab, wPar.i, 0);
        const w = L.readingTex(lab, wPar.i, 0);
        const ac = rw.ACp.d !== 1 && LIN.fracDecimal(rw.ACp, 2) == null ? `\\dfrac{${tx(rw.ACp)}}{${dec(lab.tri.AC)}}` : `\\dfrac{${w.AC.len.tex}}{${dec(lab.tri.AC)}}`;
        return <EquationDisplay tone="ok" note={k('fMine')} tex={`\\dfrac{${w.AB.len.tex}}{${dec(lab.tri.AB)}} = ${ac} = ${tx(rw.k)}`} />;
      })()}
      <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
      {lab.butterfly && <p className="text-sm text-emerald-900">{k('fFly')}</p>}
    </div>
  );

  const missionText = mission ?? (lab.butterfly ? k('missionAdvanced', { target: dec(lab.target ?? lab.tri.AB) }) : k('missionBeginner'));
  const hints = ['hint1', 'hint2', lab.butterfly ? 'hint3Adv' : 'hint3'].map((h) => <MathText key={h}>{k(h, { v: lab.target ? dec(lab.target) : '' })}</MathText>);

  /* ── points du dessin ── */
  const P = (x, onDp = false) => lay.px(onDp ? lay.R.onDp(x) : lay.R.onD(x));
  const ABn = LIN.toNumber(lab.tri.AB); const ACn = LIN.toNumber(lab.tri.AC);
  const bN = LIN.toNumber(L.bOf(lab)); const cN = LIN.toNumber(L.cOf(lab));
  const A = P(0); const B = P(ABn); const C = P(ACn, true);
  const Bp = P(bN); const Cp = P(cN, true);
  const handle = 44;

  return (
    <ManipulationShell
      type="thales-beam"
      title={title ?? k('title')}
      mission={<MathText>{missionText}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      hints={hints}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={k('dPrompt')} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-indigo-50/60 to-white">
        <div ref={boxRef} className="space-y-2" data-thales-beam data-mode={lab.butterfly ? 'projector|butterfly' : 'projector'}
          data-i={lab.i} data-t={lab.t} data-side={side} data-solved={ready ? 'true' : 'false'} data-world={theme} data-layout={narrow ? 'narrow' : 'wide'}>
          <div ref={glanceRef} className="space-y-2" data-tb-glance>
            {/* LA SCÈNE : toucher / glisser n'importe où place l'écran ; C′ incline */}
            <div {...pos.trackProps} className="relative mx-auto" style={{ ...pos.trackProps.style, width: lay.W, height: lay.H, maxWidth: '100%' }} data-tb-scene>
              <svg ref={svgRef} width={lay.W} height={lay.H} viewBox={`0 0 ${lay.W} ${lay.H}`} className="absolute inset-0 block" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
                <Decor lab={lab} lay={lay} fly={fly} A={A} />
                {/* la lumière : le faisceau du projecteur (et, derrière A, celle qui passe par le trou) */}
                <polygon points={[A, B, C].map((p) => p.join(',')).join(' ')} fill="#FDE68A" opacity={fly ? 0.25 : 0.45} />
                {fly && <polygon points={[A, Bp, Cp].map((p) => p.join(',')).join(' ')} fill="#FDE68A" opacity={0.55} />}
                <Ray lab={lab} lay={lay} onDp={false} color="#BE123C" />
                <Ray lab={lab} lay={lay} onDp color="#0369A1" />
                {/* la grande toile (BC) */}
                <line x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} stroke="#334155" strokeWidth={5} strokeLinecap="round" />
                {lab.t === 0 && lab.i !== 0 && <Chevrons a={B} b={C} color="#334155" />}
                {/* la cible du manuel (orientation, pas une réponse) */}
                {lab.target && (() => { const m = P(LIN.toNumber(lab.target)); return (
                  <g><path d={`M${m[0]} ${m[1] - 4} l-5 -10 l10 0 z`} fill="#7C3AED" /><text x={m[0]} y={m[1] - 17} fontSize="11" textAnchor="middle" fill="#6D28D9" fontWeight="bold" style={{ direction: 'ltr' }}>{dec(lab.target).replace('{,}', ',')}</text></g>
                ); })()}
                {/* l'écran (B′C′) */}
                {lab.i !== 0 ? (
                  <g data-tb-screen data-parallel={lab.t === 0 ? 'true' : 'false'}>
                    <line x1={Bp[0]} y1={Bp[1]} x2={Cp[0]} y2={Cp[1]} stroke={lab.t === 0 ? '#D97706' : '#E11D48'} strokeWidth={6} strokeLinecap="round" strokeDasharray={lab.t === 0 ? undefined : '9 5'} />
                    {lab.t === 0 && <Chevrons a={Bp} b={Cp} color="#B45309" />}
                    <circle cx={Bp[0]} cy={Bp[1]} r={4} fill="#BE123C" />
                    <circle cx={Cp[0]} cy={Cp[1]} r={4} fill="#0369A1" />
                  </g>
                ) : <circle cx={A[0]} cy={A[1]} r={6} fill="#E11D48" data-tb-screen data-parallel="none" />}
                {/* les noms */}
                <Lbl p={A} t="A" dx={0} dy={20} />
                <Lbl p={B} t="B" dx={6} dy={-8} color="#BE123C" />
                <Lbl p={C} t="C" dx={6} dy={16} color="#0369A1" />
                {lab.i !== 0 && <Lbl p={Bp} t="B′" dx={-6} dy={fly ? 18 : -10} color="#BE123C" />}
                {lab.i !== 0 && <Lbl p={Cp} t="C′" dx={-6} dy={fly ? -10 : 18} color="#0369A1" />}
              </svg>
              {!r.atA && (
                <span className={`pointer-events-none absolute end-1 top-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${r.parallel ? 'bg-amber-100/90 text-amber-900' : 'bg-rose-100/90 text-rose-800'}`} data-tb-parallel={r.parallel ? 'true' : 'false'}>
                  <MathText>{k(r.parallel ? 'badgeParallel' : 'badgeTilted')}</MathText>
                </span>
              )}
              {/* la poignée de POSITION (B′) */}
              <div {...pos.handleProps({ label: k('handlePos'), valueText: lab.i === 0 ? k('posAtA') : k(fly ? 'posValueFly' : 'posValue', { v: dec(LIN.neg(L.bOf(lab))).replace('{,}', ',').replace('-', '') }) })}
                data-tb-handle="pos"
                className="absolute flex items-center justify-center rounded-full border-2 border-rose-600 bg-white/80 shadow outline-none focus-visible:ring-4 focus-visible:ring-rose-300"
                style={{ left: `${(Bp[0] / lay.W) * 100}%`, top: Bp[1], width: handle, height: handle, transform: 'translate(-50%, -50%)', cursor: pos.dragging ? 'grabbing' : 'grab', touchAction: 'none' }}>
                <span aria-hidden="true" className="text-[11px] font-black text-rose-700" style={{ direction: 'ltr' }}>B′</span>
              </div>
              {/* la poignée d'INCLINAISON (C′) */}
              {lab.i !== 0 && (
                <div {...tiltTrack} {...tl.handleProps({ label: k('handleTilt'), valueText: lab.t === 0 ? k('tiltValue0') : k('tiltValue', { t: lab.t }) })}
                  data-tb-handle="tilt"
                  className="absolute flex items-center justify-center rounded-full border-2 border-dashed border-sky-600 bg-white/80 shadow outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
                  style={{ ...tiltTrack.style, left: `${(Cp[0] / lay.W) * 100}%`, top: Cp[1], width: handle, height: handle, transform: 'translate(-50%, -50%)', cursor: tl.dragging ? 'grabbing' : 'grab' }}>
                  <span aria-hidden="true" className="text-[11px] font-black text-sky-700" style={{ direction: 'ltr' }}>C′</span>
                </div>
              )}
            </div>

            {/* LES COMMANDES : position, inclinaison, enregistrer (téléphone : deux rangées compactes) */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <div className="flex items-center gap-1" role="group" aria-label={k('posLabel')}>
                <span className={narrow ? 'sr-only' : 'text-xs font-bold text-rose-800'}>{k('posLabel')}</span>
                <div dir="ltr" className="flex items-center gap-1">
                  <IconBtn onClick={() => pos.nudge(-1)} label={k('posLess')} tone="rose" data-tb-pos-less disabled={lab.i <= lab.iMin}><Minus className="h-4 w-4" /></IconBtn>
                  <IconBtn onClick={() => pos.nudge(1)} label={k('posMore')} tone="rose" data-tb-pos-more disabled={lab.i >= lab.iMax}><Plus className="h-4 w-4" /></IconBtn>
                </div>
              </div>
              <div className="flex items-center gap-1" role="group" aria-label={k('tiltLabel')}>
                <span className={narrow ? 'sr-only' : 'text-xs font-bold text-sky-800'}>{k('tiltLabel')}</span>
                <div dir="ltr" className="flex items-center gap-1">
                  <IconBtn onClick={() => tl.nudge(-1)} label={k('tiltLess')} tone="sky" data-tb-tilt-less disabled={lab.i === 0 || lab.t <= tr.min}><RotateCcw className="h-4 w-4" /></IconBtn>
                  <IconBtn onClick={() => tl.nudge(1)} label={k('tiltMore')} tone="sky" data-tb-tilt-more disabled={lab.i === 0 || lab.t >= tr.max}><RotateCw className="h-4 w-4" /></IconBtn>
                </div>
              </div>
              {lab.pending ? (
                <div className="flex items-center gap-1" role="group" aria-label={k('claimAsk')} data-tb-claim-row>
                  <button type="button" onClick={() => claim('equal')} data-tb-claim="equal"
                    className={`h-11 min-w-[44px] rounded-xl border-2 border-emerald-600 bg-white font-bold text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${narrow ? 'px-2 text-xs' : 'px-3 text-sm'}`}>{k('claimEqual')}</button>
                  <button type="button" onClick={() => claim('unequal')} data-tb-claim="unequal"
                    className={`h-11 min-w-[44px] rounded-xl border-2 border-rose-500 bg-white font-bold text-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${narrow ? 'px-2 text-xs' : 'px-3 text-sm'}`}>{k('claimUnequal')}</button>
                </div>
              ) : (
                <button type="button" onClick={record} data-tb-record
                  className={`inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 border-indigo-700 bg-indigo-700 font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${narrow ? 'px-2 text-xs' : 'px-3 text-sm'}`}>
                  <Camera className="h-4 w-4" aria-hidden="true" />{k('record')}
                </button>
              )}
              {!narrow && <Popcorn />}
            </div>

            {/* LA LECTURE : les trois rapports lus */}
            <div className="rounded-xl border border-slate-200 bg-white/90 px-2 py-1.5" aria-live="polite">
              {r.atA ? (
                <p className="text-sm font-bold text-amber-800">{k('readAtA')}</p>
              ) : (
                <div className="grid grid-cols-3 gap-1" dir="ltr">
                  {['AB', 'AC', 'BC'].map((w) => (
                    <bdi key={w} dir="ltr" className={`rounded-lg bg-slate-50 px-1 text-center ${narrow ? 'text-[11px]' : 'text-sm'}`} data-tb-ratio={w}>
                      <MathText>{`$${{ AB: "\\tfrac{AB'}{AB}", AC: "\\tfrac{AC'}{AC}", BC: "\\tfrac{B'C'}{BC}" }[w]} ${rt[w].tex.startsWith('\\approx') ? '' : '= '}${rt[w].tex.replace(/\\dfrac/g, '\\tfrac')}$`}</MathText>
                    </bdi>
                  ))}
                </div>
              )}
            </div>
            <p role="status" className={`min-h-[1.75rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-tb-verdict={verdictKind}>
              {verdict}
              {approx && (last?.kind === 'claimWrong' || (!narrow && last?.kind === 'recorded')) && <span className="block text-[11px] font-semibold text-slate-600">{k('approxNote')}</span>}
            </p>
            {!narrow && !ready && !lab.pending && needs.length > 0 && (
              <p className="text-[11px] text-slate-600" data-tb-need>
                <span className="font-bold">{k('needTitle')}</span> <MathText>{needs.join(' ، ')}</MathText>
              </p>
            )}
          </div>

          {narrow && !ready && !lab.pending && needs.length > 0 && (
            <p className="text-[11px] text-slate-600" data-tb-need>
              <span className="font-bold">{k('needTitle')}</span> <MathText>{needs.join(' ، ')}</MathText>
            </p>
          )}
          {lab.stops.length > 0 && (
            <LabFold id="thales-beam.stops" title={k('trialsTitle')}>
              <ol className="space-y-1 text-xs">
                {lab.stops.map((st) => {
                  const rr = L.reading(lab, st.i, st.t);
                  const w = L.readingTex(lab, st.i, st.t);
                  return (
                    <li key={st.n} data-tb-stop={st.n} data-ok={String(st.ok)} className={st.ok ? 'text-emerald-900' : 'text-rose-800'}>
                      <MathText>{k('trialRow', { n: st.n, ab: w.AB.len.tex, ac: `${w.AC.len.exact ? '' : '\\approx '}${w.AC.len.tex}`, bc: `${w.BC.len.exact ? '' : '\\approx '}${w.BC.len.tex}` })}</MathText>
                      {st.butterfly && <span> {k('trialFly')}</span>}
                      {' — '}
                      <MathText>{st.equal ? k('trialK', { k: tx(rr.k) }) : k('trialDiff', { rB: tx(rr.rB), rC: tx(rr.rC) })}</MathText>
                      {' · '}<span className="text-slate-600">{k(st.says === 'equal' ? 'saidEqual' : 'saidUnequal')} {st.ok ? '✓' : '✗'}</span>
                    </li>
                  );
                })}
              </ol>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

function IconBtn({ onClick, label, disabled, children, tone = 'slate', ...rest }) {
  const border = { rose: 'border-rose-300 text-rose-800', sky: 'border-sky-300 text-sky-800', slate: 'border-slate-300' }[tone];
  return (
    <button type="button" onClick={onClick} aria-label={label} disabled={disabled} {...rest}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 ${border} bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}>
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

function Lbl({ p, t, dx = 0, dy = 0, color = '#0F172A' }) {
  return <text x={p[0] + dx} y={p[1] + dy} fontSize="14" fontWeight="bold" fill={color} textAnchor="middle" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{t}</text>;
}

/** Les chevrons de parallélisme (l'HYPOTHÈSE de Thalès, pas sa conclusion). */
function Chevrons({ a, b, color }) {
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const tt = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const n = [-tt[1], tt[0]];
  const ch = (off) => {
    const tip = [m[0] + tt[0] * off, m[1] + tt[1] * off];
    return `${tip[0] - tt[0] * 7 + n[0] * 5},${tip[1] - tt[1] * 7 + n[1] * 5} ${tip[0]},${tip[1]} ${tip[0] - tt[0] * 7 - n[0] * 5},${tip[1] - tt[1] * 7 - n[1] * 5}`;
  };
  return <g><polyline points={ch(-2)} fill="none" stroke={color} strokeWidth={2} /><polyline points={ch(5)} fill="none" stroke={color} strokeWidth={2} /></g>;
}

/** Un rayon (ou une droite entière s'il y a une chambre noire) gradué : chiffres = longueurs depuis A. */
function Ray({ lab, lay, onDp, color }) {
  const at = (x) => lay.px(onDp ? lay.R.onDp(x) : lay.R.onD(x));
  const box = lay.box;
  const dir = onDp ? lay.R.v : lay.R.u;
  const xEnd = box.xMax / dir[0];
  const xStart = lab.butterfly ? box.xMin / dir[0] : 0;
  const a = at(xStart); const b = at(xEnd);
  const len = Math.max(LIN.toNumber(onDp ? lab.tri.AC : lab.tri.AB), Math.abs(xStart), xEnd);
  const unitPx = lay.scale;
  const nrm = [-(b[1] - a[1]), b[0] - a[0]];
  const nl = Math.hypot(nrm[0], nrm[1]) || 1;
  const N = [nrm[0] / nl, nrm[1] / nl];
  const out = onDp ? 1 : -1; // les chiffres à l'extérieur du faisceau
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={1.8} />
      {L.ticks(lab, len).filter((tk) => tk.x >= xStart && tk.x <= xEnd).map((tk) => {
        if (!tk.major && unitPx < 18) return null;
        const p = at(tk.x);
        const h = tk.major ? 5 : 3;
        const showNum = tk.major && (unitPx >= 16 || Math.round(Math.abs(tk.x)) % 2 === 0);
        return (
          <g key={tk.x}>
            <line x1={p[0] - N[0] * h} y1={p[1] - N[1] * h} x2={p[0] + N[0] * h} y2={p[1] + N[1] * h} stroke={color} strokeWidth={1.2} />
            {showNum && <text x={p[0] - N[0] * 12 * out} y={p[1] - N[1] * 12 * out + 3.5} fontSize="9.5" fill={color} textAnchor="middle" style={{ direction: 'ltr' }}>{Math.abs(tk.x)}</text>}
          </g>
        );
      })}
      <text x={b[0] - 4} y={b[1] + (onDp ? -6 : 14)} fontSize="12" fontStyle="italic" fill={color} textAnchor="end" style={{ direction: 'ltr' }}>{onDp ? '(d′)' : '(d)'}</text>
    </g>
  );
}

/** Le décor du quartier : guirlande, public, projecteur ; derrière A la chambre noire. Jamais une information. */
function Decor({ lab, lay, fly, A }) {
  const reduce = useReducedMotion();
  const bulbs = Array.from({ length: 9 }, (_, j) => [lay.W * (0.08 + j * 0.105), 8 + (j % 2) * 4]);
  const heads = Array.from({ length: 6 }, (_, j) => [lay.W * (0.5 + j * 0.08), lay.H - 4]);
  return (
    <g aria-hidden="true" data-deco={fly ? 'camera' : 'cinema'}>
      <style>{'.tb-bulb{animation:tb-b 1.8s ease-in-out infinite alternate}@keyframes tb-b{from{opacity:.45}to{opacity:1}}@media (prefers-reduced-motion: reduce){.tb-bulb{animation:none}}'}</style>
      <path d={`M0 6 Q${lay.W / 2} 22 ${lay.W} 6`} fill="none" stroke="#94A3B8" strokeWidth={1} />
      {bulbs.map(([x, y], j) => <circle key={j} className={reduce ? undefined : 'tb-bulb'} cx={x} cy={y + 4} r={3} fill={['#F59E0B', '#F43F5E', '#22C55E'][j % 3]} style={{ animationDelay: `${j * 0.2}s` }} />)}
      {heads.map(([x, y], j) => <path key={j} d={`M${x - 9} ${y} q9 -16 18 0 z`} fill="#CBD5E1" />)}
      {lab.butterfly && (
        <g opacity={fly ? 1 : 0.35}>
          <rect x={0} y={0} width={A[0]} height={lay.H} fill="#0F172A" opacity={fly ? 0.12 : 0.05} />
          <line x1={A[0]} y1={14} x2={A[0]} y2={A[1] - 7} stroke="#475569" strokeWidth={3} />
          <line x1={A[0]} y1={A[1] + 7} x2={A[0]} y2={lay.H - 14} stroke="#475569" strokeWidth={3} />
        </g>
      )}
      {!fly && (
        <g transform={`translate(${A[0] - 44} ${A[1] - 10})`}>
          <rect x={0} y={0} width={24} height={20} rx={4} fill="#475569" />
          <circle cx={24} cy={10} r={5} fill="#FBBF24" stroke="#334155" />
        </g>
      )}
    </g>
  );
}

/** Le seau de pop-corn : il saute au toucher. Décor seulement. */
function Popcorn() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setN((v) => v + 1)} data-deco="cinema" className="h-10 w-10 shrink-0 rounded-xl focus:outline-none">
      <svg viewBox="0 0 40 40" width="100%" height="100%">
        <style>{'.tb-pop{animation:tb-p .5s ease-out 1}@keyframes tb-p{0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}}@media (prefers-reduced-motion: reduce){.tb-pop{animation:none}}'}</style>
        <path d="M10 16 L30 16 L27 37 L13 37 Z" fill="#FFFFFF" stroke="#E11D48" strokeWidth="1.5" />
        <path d="M14 16 L15 37 M20 16 L20 37 M26 16 L25 37" stroke="#E11D48" strokeWidth="2" />
        <g key={n} className={n > 0 && !reduce ? 'tb-pop' : undefined}>
          {[[13, 13], [18, 10], [23, 12], [27, 14], [20, 15]].map(([x, y], j) => <circle key={j} cx={x} cy={y} r={3.5} fill="#FEF3C7" stroke="#F59E0B" />)}
        </g>
      </svg>
    </button>
  );
}
