import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import * as L from '../logic/shadowStick';

/**
 * shadow-stick — LE BÂTON ET L'OMBRE (unité 9 « خاصية طالس », le تحدّ p. 103 repris dans « أدمج تعلّماتي »).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève PLANTE un bâton de 1 m sur le sol (glisser son pied le long du sol, toucher le sol, −/+, flèches) ;
 *    puis, quand les ombres finissent ensemble, il fait glisser une PERCHE télescopique du bâton vers la minaret.
 * B. Idée : le bâton et la minaret sont verticaux (parallèles) ; si l'ombre du bâton finit là où finit celle de la
 *    minaret, un seul rayon de soleil passe par leurs sommets : les triangles OBE et OAM sont en situation de
 *    Thalès (sommet commun O) et h ÷ 1 = OA ÷ OB — la hauteur inaccessible se calcule par des longueurs au sol.
 * C. L'ombre du bâton se déplace avec lui (même longueur 1,6 m partout : le soleil est le même) ; le rayon qui
 *    passe par son sommet reste PARALLÈLE au rayon de la minaret et ne le rejoint qu'au bon endroit ; la perche,
 *    elle, grandit en avançant, son sommet toujours sur le rayon.
 * D. La ligne de lecture écrit où finit l'ombre du bâton (« قبل / بعد نهاية ظل المئذنة بـ … m »), puis, pour la
 *    perche, sa distance à O et sa hauteur, et l'égalité hauteur ÷ ombre = 1 ÷ 1,6 ; le tableau des essais.
 * E. Avant la règle : il faut UNE place exacte (contraste : ombre trop courte / trop longue), et la perche montre
 *    que le rapport hauteur ÷ ombre ne change pas — au pied de la minaret, la perche est la minaret.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        deux triangles en situation de Thalès (sommet commun, côtés opposés parallèles) donnent une
 *                  longueur inaccessible : AM ÷ BE = OA ÷ OB
 *   OBJECT         un bâton planté, son ombre ; une perche télescopique ; la minaret du quartier et son ombre
 *   VARIABLE       d = AB (la place du bâton, pas de 0,2 m) ; puis OP (la place de la perche, pas de ℓ ÷ 4)
 *   INVARIANT      le soleil (la direction des rayons), la longueur de l'ombre du bâton ℓ = 1,6 m, le rapport
 *                  hauteur ÷ ombre = 1 ÷ 1,6 pour tout objet vertical
 *   TRANSFORMATION l'ombre du bâton glisse ; la perche grandit avec sa distance à O
 *   CONSTRAINT     la perche n'existe que si les deux ombres finissent en O (sinon pas de sommet commun) ;
 *                  son sommet ne quitte jamais le rayon (sa hauteur n'est pas réglable)
 *   RESISTANCE     ailleurs qu'à 10 m, l'extrémité de l'ombre manque O : deux rayons parallèles DESSINÉS, l'écart
 *                  écrit en mètres ; la perche refusée tant que le bâton n'est pas à sa place
 *   EVIDENCE       les deux extrémités d'ombre confondues, le rayon unique par E et M, la perche qui touche M
 *   CONTRAST       une ombre trop courte ou trop longue avant la bonne place ; la perche en chemin puis au pied
 *   PREDICTION     « où planter le bâton ? » — les nombres du sol (10 m, 11,6 m) orientent, ne répondent pas
 *   DISCOVERY      « العصا والمئذنة متوازيتان ونهاية الظلين مشتركة: وضعية طالس »
 *   FORMALIZATION  AM ÷ BE = OA ÷ OB, donc AM = 1 × 11,6 ÷ 1,6 = 7,25 m
 *   TRANSFER       la وضعية (cône et cylindre, même sommet O), ex. 22 (largeur de l'oued), les pyramides de Thalès
 *
 * Monde (`theme`) : `minaret` — la mosquée du quartier un après-midi de soleil. Manuel (§6bis) : chaque place est
 * un essai jugé ; aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) : les pigeons du balcon de la minaret s'envolent quand on les touche, un nuage.
 * `aria-hidden`, hors clavier, `[data-deco]`, jamais une information (aucune longueur), immobiles sous
 * `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : la scène est budgétée sur l'écran de leçon (`useLessonViewport` moins ce que le bloc
 * mesuré `[data-sh-glance]` occupe en plus du dessin) ; les poignées sont SUR le dessin (pied du bâton sous le
 * sol, sommet de la perche sur le rayon), les −/+ et la lecture juste dessous ; le tableau des essais est dans un
 * `LabFold` SOUS le bloc mesuré.
 *
 * Props : `stick`, `stickAt`, `tip` (mètres, virgule ou point), `theme`, `title`, `lead`, `mission`, `level`,
 * `levels`, `onTrial(evidence)` à chaque essai, `onFinished({ h })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-shadow-stick][data-stage=stick|pole][data-meets][data-solved], [data-sh-glance],
 * [data-sh-stick-handle] (role=slider), [data-sh-stick-less|more], [data-sh-pole-handle] (role=slider),
 * [data-sh-pole-less|more], [data-sh-verdict=<kind>], [data-sh-tip], [data-sh-pole-height],
 * [data-lab-fold=shadow-stick.trials], [data-deco].
 */
export default function ShadowStick({
  stick: stick0 = 1, stickAt: stickAt0 = 10, tip: tip0 = 11.6, theme = 'minaret', title, lead, mission, level, levels: withLevels = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.shadowStick.${key}`, o), [t]);
  const state = useManipulation({ type: 'shadow-stick', initialNumbers: { stick: stick0, stickAt: stickAt0, tip: tip0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { stick, stickAt, tip } = state.numbers;
  const make = () => L.init({ stick, stickAt, tip });
  const [lab, setLab] = useState(make);
  const sceneKey = `${stick}|${stickAt}|${tip}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [liveI, setLiveI] = useState(null);
  const [liveJ, setLiveJ] = useState(null);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setLiveI(null); setLiveJ(null); }

  const ready = L.discoveryReady(lab);
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { h: L.dec(lab.h) }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  // Miroir synchrone de `lab` : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu.
  const labRef = useRef(lab);
  labRef.current = lab;
  const nEvents = lab.trials.length + lab.poleTrials.length;
  useEffect(() => { if (nEvents > 0) state.report(onTrial, L.evidenceOf(lab)); }, [nEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur de la scène ; hauteur = écran de leçon − ce que le bloc glance prend en plus ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const svgHRef = useRef(220);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(190);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(240, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(120, Math.ceil(glanceRef.current.getBoundingClientRect().height) - svgHRef.current));
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
  const budget = Math.round(Math.max(150, Math.min(360, screenH - overhead - 24)));
  const G = L.layout(lab, { width, height: budget, bottom: 48 });
  const svgW = Math.min(width, Math.round(G.width));
  const svgH = Math.round(G.height);
  svgHRef.current = svgH;

  /* ── les deux gestes (moteur « étirer ») ── */
  const I = liveI ?? lab.i;
  const meetsNow = L.meets(lab, I);
  const poleOn = L.meets(lab) && liveI == null;
  const J = liveJ ?? L.poleIndex(lab);
  const xToMeters = useCallback((cx, rect) => ((cx - rect.left) * (svgW / rect.width) - G.x0) / G.k, [svgW, G.x0, G.k]);
  const stepM = Number(lab.step.n) / Number(lab.step.d);
  const poleStepM = Number(lab.poleStep.n) / Number(lab.poleStep.d);
  const tipM = Number(lab.tip.n) / Number(lab.tip.d);
  const stickSt = useStretchInteraction({
    value: I, range: { min: lab.iMin, max: lab.iMax }, direction: 'ltr', pageStep: 5,
    toValue: (cx, _cy, rect) => xToMeters(cx, rect) / stepM,
    onChange: (v) => setLiveI(v),
    onCommit: (v) => { setLiveI(null); setLab((s) => L.placeStick(s, v)); },
  });
  const poleSt = useStretchInteraction({
    value: J, range: { min: lab.jMin, max: lab.jA }, direction: 'rtl', pageStep: 4,
    toValue: (cx, _cy, rect) => (tipM - xToMeters(cx, rect)) / poleStepM,
    onChange: (v) => setLiveJ(v),
    onCommit: (v) => { setLiveJ(null); setLab((s) => L.placePole(s, v)); },
  });

  /* ── la lecture ── */
  const last = lab.last;
  const d = L.stickAtIndex(lab, I);
  const tipAt = L.stickTipAt(lab, I);
  const pole = poleOn ? L.poleAt(lab, J) : null;
  const verdictKind = liveI != null ? 'live' : last?.kind === 'pole' ? (last.pole.atMinaret ? 'poleAtA' : 'pole') : last?.kind === 'poleFirst' ? 'poleFirst' : last?.kind === 'stick' ? last.trial.kind : '';
  const gapTex = L.tex(LIN_abs(L.tipGap(lab)));
  const verdict = (() => {
    switch (verdictKind) {
      case 'before': return <span className="text-rose-800"><MathText>{k('vBefore', { tip: L.tex(L.stickTipAt(lab, lab.i)), O: L.tex(lab.tip), gap: gapTex })}</MathText></span>;
      case 'after': return <span className="text-rose-800"><MathText>{k('vAfter', { tip: L.tex(L.stickTipAt(lab, lab.i)), O: L.tex(lab.tip), gap: gapTex })}</MathText></span>;
      case 'meet': return <span className="text-emerald-800"><MathText>{k('vMeet')}</MathText></span>;
      case 'poleFirst': return <span className="text-amber-800">{k('vPoleFirst')}</span>;
      case 'pole': return <span className="text-slate-900"><MathText>{k('vPole', { dist: L.tex(last.pole.dist), height: L.tex(last.pole.height), shadow: L.tex(lab.shadow), stick: L.tex(lab.stick) })}</MathText></span>;
      case 'poleAtA': return <span className="text-emerald-800"><MathText>{k('vPoleAtA', { height: L.tex(last.pole.height), k: L.tex(last.pole.k) })}</MathText></span>;
      case 'live': return <span className="text-slate-700"><MathText>{k('vLive', { d: L.tex(d), tip: L.tex(tipAt) })}</MathText></span>;
      default: return <span className="text-slate-600">{k('vStart')}</span>;
    }
  })();

  /* ── la découverte : des distracteurs réfutés par les essais de l'élève ── */
  const discoveryOptions = useMemo(() => {
    const miss = lab.trials.find((tr) => tr.kind !== 'meet');
    return [
      { text: <MathText>{k('dOptAnywhere')}</MathText>, why: <MathText>{miss ? k('dWhyAnywhere', { d: L.tex(miss.d), tip: L.tex(miss.tipAt), O: L.tex(lab.tip) }) : k('dWhyAnywhereNone')}</MathText> },
      { text: <MathText>{k('dOptRight')}</MathText>, correct: true },
      { text: <MathText>{k('dOptShadowEq')}</MathText>, why: <MathText>{k('dWhyShadowEq', { O: L.tex(lab.tip), h: L.tex(lab.h) })}</MathText> },
    ];
  }, [lab, k]);

  const formal = (
    <div className="space-y-2" data-sh-formal>
      <EquationDisplay tone="result" tex={'\\dfrac{AM}{BE} = \\dfrac{OA}{OB}'} />
      <EquationDisplay tone="result" tex={`AM = ${L.tex(lab.stick)} \\times \\dfrac{${L.tex(lab.tip)}}{${L.tex(lab.shadow)}} = ${L.tex(lab.h)}\\,\\mathrm{m}`} />
      <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
    </div>
  );

  /* ── le dessin ── */
  const X = G.X; const Y = G.Y; const yG = G.yGround;
  const h = Number(lab.h.n) / Number(lab.h.d);
  const S = Number(lab.stick.n) / Number(lab.stick.d);
  const dM = Number(d.n) / Number(d.d);
  const tipAtM = Number(tipAt.n) / Number(tipAt.d);
  // la direction du soleil : du point O vers M, prolongée au-delà de M (le soleil est sur cette droite)
  const ext = 0.92 * Math.min((X(0) - 2) / (X(tipM) - X(0)), (Y(h) - 2) / (yG - Y(h)));
  const rayEnd = [X(0) - (X(tipM) - X(0)) * ext, Y(h) - (yG - Y(h)) * ext];
  const grads = [];
  const maxM = Math.floor(tipM + Number(lab.shadow.n) / Number(lab.shadow.d) + 0.4);
  for (let m = 0; m <= maxM; m += 1) grads.push(m);
  const labelEvery = narrow ? (maxM > 8 ? 4 : 2) : maxM > 8 ? 2 : 1;
  const textP = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const poleM = pole ? Number(pole.x.n) / Number(pole.x.d) : null;
  const poleH = pole ? Number(pole.height.n) / Number(pole.height.d) : null;

  const btn = 'inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2';

  return (
    <ManipulationShell
      type="shadow-stick"
      title={title ?? k('title')}
      mission={mission ?? k('mission', { stick: L.dec(lab.stick) })}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      hints={['hint1', 'hint2', 'hint3'].map((hk) => <MathText key={hk}>{k(hk)}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        autoComplete: {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
          remaining: L.tryAllPlan(lab).length,
          // une place par pas : on VOIT l'ombre du bâton glisser puis la perche avancer
          intervalMs: 480,
          maxTicks: 80,
          step: () => {
            const next = L.tryAllPlan(labRef.current)[0];
            if (!next) return;
            labRef.current = L.tryAllApply(labRef.current, next);
            setLiveI(null); setLiveJ(null);
            setLab((s) => L.tryAllApply(s, next));
          },
          finish: () => {
            let cur = labRef.current;
            for (let guard = 0; guard < 2000; guard += 1) {
              const next = L.tryAllPlan(cur)[0];
              if (!next) break;
              cur = L.tryAllApply(cur, next);
            }
            labRef.current = cur;
            setLiveI(null); setLiveJ(null);
            setLab(cur);
          },
        },
      }}
      discovery={<ManipulationDiscovery state={state} prompt={k('dPrompt')} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white" minHeight="min-h-[150px]">
        <div ref={boxRef} className="space-y-2" data-shadow-stick data-world={theme} data-stage={poleOn ? 'pole' : 'stick'}
          data-meets={meetsNow ? 'true' : 'false'} data-solved={ready ? 'true' : 'false'} data-scene-h={svgH}>
          <div ref={glanceRef} className="space-y-1.5" data-sh-glance>
            <div className="relative mx-auto" style={{ width: svgW, height: svgH }}>
              <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="absolute inset-0" style={{ direction: 'ltr' }}
                role="img" aria-label={k('sceneLabel', { d: L.dec(d), tip: L.dec(tipAt), O: L.dec(lab.tip) })}>
                <defs>
                  <linearGradient id="sh-sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#E0F2FE" /><stop offset="1" stopColor="#FFFFFF" /></linearGradient>
                </defs>
                <rect x={0} y={0} width={svgW} height={yG} fill="url(#sh-sky)" />
                <rect x={0} y={yG} width={svgW} height={svgH - yG} fill="#FEF3C7" />
                <Deco x={X(-0.2)} y={Y(h * 0.74)} k={G.k} cloudX={svgW * 0.62} />
                <g aria-hidden="true"><circle cx={16} cy={14} r={10} fill="#FACC15" stroke="#F59E0B" strokeWidth={2} /></g>
                {/* l'ombre de la minaret (A → O) et celle du bâton */}
                <rect x={X(0)} y={yG - 3} width={X(tipM) - X(0)} height={6} fill="#475569" opacity={0.55} rx={2} />
                <rect x={X(dM)} y={yG - 3} width={X(tipAtM) - X(dM)} height={6} fill={meetsNow ? '#065F46' : '#B45309'} opacity={0.75} rx={2} data-sh-stick-shadow />
                {/* le rayon de la minaret (M → O), prolongé vers le soleil */}
                <line x1={rayEnd[0]} y1={rayEnd[1]} x2={X(0)} y2={Y(h)} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="5 4" />
                <line x1={X(0)} y1={Y(h)} x2={X(tipM)} y2={yG} stroke="#D97706" strokeWidth={2.2} />
                {/* le rayon du bâton (parallèle) */}
                <line x1={X(dM)} y1={Y(S)} x2={X(tipAtM)} y2={yG} stroke={meetsNow ? '#059669' : '#E11D48'} strokeWidth={2} strokeDasharray={meetsNow ? undefined : '4 3'} />
                {/* la graduation du sol (mètres depuis A) */}
                {grads.map((m) => (
                  <g key={m}>
                    <line x1={X(m)} x2={X(m)} y1={yG} y2={yG + (m % labelEvery === 0 ? 7 : 4)} stroke="#92400E" />
                    {m % labelEvery === 0 && <text x={X(m)} y={yG + 18} textAnchor="middle" fontSize={10} fill="#78350F" {...textP}>{m}</text>}
                  </g>
                ))}
                <line x1={0} x2={svgW} y1={yG} y2={yG} stroke="#92400E" strokeWidth={2} />
                {/* la minaret */}
                <Minaret x={X(0)} yG={yG} top={Y(h)} k={G.k} />
                {/* la perche télescopique */}
                {pole && (
                  <g data-sh-pole={J}>
                    <rect x={X(poleM) - 2.5} y={Y(poleH)} width={5} height={yG - Y(poleH)} fill="#6366F1" opacity={pole.atMinaret ? 0.55 : 0.9} rx={2} />
                    <text x={X(poleM) + (pole.atMinaret ? 10 : -6)} y={Y(poleH) - 6} textAnchor={pole.atMinaret ? 'start' : 'end'} fontSize={11} fontWeight="bold" fill="#3730A3" {...textP} data-sh-pole-height={L.dec(pole.height)}>{`${L.dec(pole.height)} m`}</text>
                  </g>
                )}
                {/* le bâton */}
                <rect x={X(dM) - 2.5} y={Y(S)} width={5} height={yG - Y(S)} fill="#7C2D12" rx={1.5} />
                <text x={X(dM) + 5} y={Y(S) + 2} fontSize={10} fill="#7C2D12" {...textP}>1 m</text>
                {/* les points nommés */}
                <text x={X(0) - Math.max(8, Math.min(0.9 * G.k, 26)) / 2 - 3} y={yG - 5} textAnchor="end" fontSize={12} fontWeight="bold" fill="#0F172A" {...textP}>A</text>
                <text x={X(0) + 10} y={Y(h) - 2} fontSize={12} fontWeight="bold" fill="#0F172A" {...textP}>M</text>
                <text x={X(dM) - 9} y={Y(S) - 4} fontSize={12} fontWeight="bold" fill="#0F172A" {...textP}>E</text>
                <text x={X(dM) - 5} y={yG - 6} textAnchor="end" fontSize={12} fontWeight="bold" fill="#0F172A" {...textP}>B</text>
                <circle cx={X(tipM)} cy={yG} r={4} fill={meetsNow ? '#059669' : '#334155'} />
                <text x={X(tipM) + 4} y={yG - 7} fontSize={12} fontWeight="bold" fill={meetsNow ? '#047857' : '#334155'} {...textP} data-sh-tip={L.dec(lab.tip)}>O</text>
                {!meetsNow && <circle cx={X(tipAtM)} cy={yG} r={3.5} fill="#E11D48" />}
              </svg>
              {/* la piste du bâton : la bande du sol ; la poignée : le pied du bâton */}
              <div {...stickSt.trackProps} className="absolute left-0 right-0" style={{ ...stickSt.trackProps.style, top: yG + 2, height: Math.max(36, svgH - yG - 2) }} data-sh-stick-track>
                <div {...stickSt.handleProps({ label: k('stickHandle'), valueText: k('stickValueText', { d: L.dec(d), tip: L.dec(tipAt) }) })}
                  data-sh-stick-handle={I}
                  className="absolute flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-2 border-amber-700 bg-white/90 outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
                  style={{ left: X(dM), top: 0, cursor: stickSt.dragging ? 'grabbing' : 'grab' }}>
                  <span aria-hidden="true" className="text-sm font-black text-amber-800">⇆</span>
                </div>
              </div>
              {/* la piste de la perche : le ciel entre O et A ; la poignée : le sommet de la perche */}
              {pole && (
                <div {...poleSt.trackProps} className="absolute" style={{ ...poleSt.trackProps.style, left: X(0) + 8, width: X(tipM) - X(0) - 8, top: 0, height: yG - 8 }} data-sh-pole-track>
                  <div {...poleSt.handleProps({ label: k('poleHandle'), valueText: k('poleValueText', { dist: L.dec(pole.dist), height: L.dec(pole.height) }) })}
                    data-sh-pole-handle={J}
                    className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-indigo-600 bg-white/85 outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
                    style={{ left: X(poleM) - X(0) - 8, top: Y(poleH), cursor: poleSt.dragging ? 'grabbing' : 'grab' }}>
                    <span aria-hidden="true" className="text-sm font-black text-indigo-700">↕</span>
                  </div>
                </div>
              )}
            </div>
            {/* les commandes sans glisser, juste sous la scène */}
            <div className="flex flex-wrap items-center justify-center gap-1.5" dir="ltr">
              <button type="button" onClick={() => stickSt.nudge(-1)} disabled={I <= lab.iMin} aria-label={k('stickLess')} data-sh-stick-less className={`${btn} border-amber-300 focus-visible:ring-amber-500`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
              <span className="min-w-[5.5rem] rounded-full bg-amber-100 px-2 text-center font-mono text-sm font-extrabold text-amber-900" data-sh-stick-value={L.dec(d)}>
                <MathText>{`$AB = ${L.tex(d)}\\,\\mathrm{m}$`}</MathText>
              </span>
              <button type="button" onClick={() => stickSt.nudge(1)} disabled={I >= lab.iMax} aria-label={k('stickMore')} data-sh-stick-more className={`${btn} border-amber-300 focus-visible:ring-amber-500`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
              {pole && (
                <>
                  <span className="mx-1 h-6 w-px bg-slate-300" aria-hidden="true" />
                  <button type="button" onClick={() => poleSt.nudge(-1)} disabled={J <= lab.jMin} aria-label={k('poleLess')} data-sh-pole-less className={`${btn} border-indigo-300 focus-visible:ring-indigo-500`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
                  <span className="min-w-[5.5rem] rounded-full bg-indigo-100 px-2 text-center font-mono text-sm font-extrabold text-indigo-900" data-sh-pole-value={L.dec(pole.dist)}>
                    <MathText>{`$OP = ${L.tex(pole.dist)}\\,\\mathrm{m}$`}</MathText>
                  </span>
                  <button type="button" onClick={() => poleSt.nudge(1)} disabled={J >= lab.jA} aria-label={k('poleMore')} data-sh-pole-more className={`${btn} border-indigo-300 focus-visible:ring-indigo-500`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
                </>
              )}
            </div>
            <p role="status" className={`min-h-[2.5rem] ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug`} data-sh-verdict={verdictKind}>{verdict}</p>
          </div>

          {nEvents > 0 && (
            <LabFold id="shadow-stick.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-sh-trials={nEvents}>
                {lab.trials.map((tr, i) => (
                  <li key={`s${i}`} className={tr.kind === 'meet' ? 'text-emerald-800' : 'text-rose-800'}>
                    <MathText>{k(tr.kind === 'meet' ? 'trialMeet' : 'trialMiss', { d: L.tex(tr.d), tip: L.tex(tr.tipAt) })}</MathText>
                  </li>
                ))}
                {lab.poleTrials.map((p, i) => (
                  <li key={`p${i}`} className="text-indigo-900">
                    <MathText>{k('trialPole', { dist: L.tex(p.dist), height: L.tex(p.height) })}</MathText>
                  </li>
                ))}
              </ul>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/** |p| d'une fraction de linear.js (pour écrire un écart). */
function LIN_abs(p) { return p.n < 0 ? { n: -p.n, d: p.d } : p; }

/** La minaret du quartier : fût, balcon, lanterne, flèche dont la POINTE est M (le rayon y passe). */
function Minaret({ x, yG, top, k }) {
  const H = yG - top;
  const w = Math.max(8, Math.min(0.9 * k, 26));
  const shaftTop = yG - H * 0.78;
  const balcony = yG - H * 0.72;
  const lantern = yG - H * 0.9;
  return (
    <g aria-hidden="true" data-sh-minaret>
      <rect x={x - w / 2} y={shaftTop} width={w} height={yG - shaftTop} fill="#F1F5F9" stroke="#64748B" strokeWidth={1.2} />
      <rect x={x - w * 0.75} y={balcony - 3} width={w * 1.5} height={5} fill="#CBD5E1" stroke="#64748B" strokeWidth={1} />
      <rect x={x - w * 0.36} y={lantern} width={w * 0.72} height={shaftTop - lantern} fill="#E2E8F0" stroke="#64748B" strokeWidth={1} />
      <path d={`M${x - w * 0.42} ${lantern} L${x} ${top} L${x + w * 0.42} ${lantern} Z`} fill="#10B981" stroke="#047857" strokeWidth={1} />
      {[0.2, 0.45].map((f) => <rect key={f} x={x - w * 0.15} y={yG - H * f - 5} width={w * 0.3} height={8} rx={w * 0.15} fill="#94A3B8" />)}
    </g>
  );
}

/** Les pigeons du balcon (ils s'envolent au toucher) et un nuage : décor pur, jamais une longueur. */
function Deco({ x, y, k, cloudX }) {
  const reduce = useReducedMotion();
  const [flown, setFlown] = useState(0);
  const up = flown % 2 === 1;
  const s = Math.max(6, Math.min(12, k * 0.5));
  return (
    <g data-deco="minaret">
      <style>{'.sh-fly{transition:transform .9s ease-out}@media (prefers-reduced-motion: reduce){.sh-fly{transition:none}}'}</style>
      <g aria-hidden="true" opacity={0.85}>
        <ellipse cx={cloudX} cy={22} rx={26} ry={9} fill="#FFFFFF" />
        <ellipse cx={cloudX + 18} cy={17} rx={16} ry={8} fill="#FFFFFF" />
      </g>
      <g className={reduce ? undefined : 'sh-fly'} style={{ transform: up ? `translate(${3 * s}px, ${-3 * s}px)` : 'none', cursor: 'pointer' }}
        onClick={() => setFlown((n) => n + 1)} aria-hidden="true" tabIndex={-1}>
        {[0, 1].map((i) => (
          <g key={i} transform={`translate(${x - s * 1.6 + i * s * 1.5}, ${y - s * 0.8})`}>
            <ellipse cx={s / 2} cy={s / 2} rx={s / 2} ry={s / 3} fill="#94A3B8" />
            <circle cx={s} cy={s / 3} r={s / 5} fill="#64748B" />
            {up && <path d={`M${s * 0.2} ${s * 0.4} L${s * 0.5} ${-s * 0.2} L${s * 0.8} ${s * 0.4}`} stroke="#64748B" fill="none" />}
          </g>
        ))}
      </g>
    </g>
  );
}
