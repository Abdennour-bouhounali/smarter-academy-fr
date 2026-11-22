import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Group, Mesh, TorusGeometry, CylinderGeometry, Vector3, Quaternion } from 'three';
import * as space from '@smarter-academy/core/arithmetic/space.js';
import * as LN from '@smarter-academy/core/arithmetic/linear.js';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { spread } from './spaceCp';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MovablePanel from '../primitives/MovablePanel';
import MathText from '../../components/MathText';
import { mathToPlain } from '../../../../utils/mathPlain';
import SpaceFigure from '../../components/SpaceFigure';
import Stage3D, { prefersReducedMotion } from './stage3d/Stage3D';
import { toThree } from './stage3d/spaceStage';
import * as S3 from './stage3d/solids3d';
import * as L from '../logic/bucketFill';

/**
 * bucket-fill — LE SEAU DE PLAGE DE TIPAZA (unité 14 « الهندسة في الفضاء », « أدمج تعلّماتي », le تحدّ p. 163 : un دلو en
 * مخروط مبتور, Ø 40 cm au bord, Ø 30 cm au fond, l'eau 7 cm sous le bord et 28 cm au-dessus du fond).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève fait MONTER l'eau dans un vrai seau 3D (il tire la surface dans la scène, ou le curseur) jusqu'au niveau de la
 *    وضعية ; puis il « complète le cône » : il DESCEND le sommet S sur l'axe, sous le fond, jusqu'à ce que les deux génératrices
 *    issues de S et passant par le bord du fond passent par le bord du seau ; enfin il CHOISIT comment calculer le volume.
 * B. Idée : un tronc de cône est un grand cône privé d'un petit ; le petit est une RÉDUCTION du grand de rapport k = SO/SW
 *    (Thalès dans la coupe axiale) ; son volume est k³ fois celui du grand : V = V₁ − V₂ = V₁(1 − k³).
 * C. Pendant le geste : l'eau monte et sa surface s'élargit (le bord est une droite) ; les deux génératrices pivotent autour du
 *    bord du fond et arrivent au plan du bord trop loin / trop près — l'écart est dessiné en rouge et chiffré ; une fois S trouvé,
 *    le grand cône (S → surface) et le petit (S → fond, rose) apparaissent ; la bonne carte fait disparaître le petit cône.
 * D. La lecture écrit la profondeur, puis où la génératrice coupe le plan du bord (r·(a + H)/a, exact), puis k et ρ, puis
 *    V = V₁ − V₂ = …π ≈ … cm³ ≈ … L ; la règle : SO/SO₁ = r/R, k = SO/SW, V = V₁(1 − k³).
 * E. Avant la règle : le sommet trouvé, la bonne carte, ET un contraste (un niveau, un sommet ou une carte refusés).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        le volume d'un tronc de cône = différence de deux cônes, le petit étant une réduction (k³) du grand
 *   OBJECT         un seau de plage orange sur le sable de Tipaza, de l'eau de mer dedans ; son cône complété sous le sable
 *   VARIABLE       la profondeur d (cm) ; la position a = SO du sommet (cm) ; la méthode de calcul (carte)
 *   INVARIANT      le bord du seau est une droite : r → R sur H, la surface ρ = r + (R − r)·d/H à tout niveau ; SO ne dépend
 *                  PAS du niveau d'eau (c'est le seau qui fixe S) ; V₂ = k³·V₁ pour tout k
 *   TRANSFORMATION l'eau monte et s'élargit ; S descend et les génératrices pivotent autour du bord du fond
 *   CONSTRAINT     l'eau reste dans le seau ; S reste sur l'axe, sous le fond ; un pas = 1 cm
 *   RESISTANCE     « ثبّت » refuse un niveau autre que celui de la وضعية en chiffrant l'écart au bord (7 cm au-dessus du FOND :
 *                  nommé comme tel) ; un S faux laisse les génératrices passer à côté du bord (écart rouge, « ≈ 26,17 cm au lieu
 *                  de 20 cm ») ; une carte fausse (k au lieu de k³, le rayon moyen, le rayon de la surface) est refusée avec la
 *                  valeur qu'elle donne contre le vrai volume
 *   EVIDENCE       les génératrices passent par le bord (vert) ; le petit cône s'efface ; 24388π/3 ≈ 25 539,1 cm³ ≈ 25,54 L
 *   CONTRAST       un S trop haut contre un S trop bas ; le rayon moyen (≈ 25 421,8 — TRÈS proche) contre le vrai volume ;
 *                  k contre k³
 *   PREDICTION     la carte est choisie AVANT de voir le volume
 *   DISCOVERY      « on complète le cône : V = V₁ − V₂, et V₂ = k³·V₁ »
 *   FORMALIZATION  SO/SO₁ = r/R ⇒ SO ; ρ = r·SW/SO ; k = SO/SW ; V = V₁(1 − k³)
 *   TRANSFER       le إختبار أولي (un verre de frappé à Oran), « أتعمّق » (le cornet de glace : boule + cône + réduction)
 *
 * Monde (`theme`) : `beach-bucket` — la plage de Tipaza : ciel, mer, ruines romaines au loin, parasol, château de sable, un
 * téléphone qui filme sur la serviette, une mouette qui passe quand le seau est rempli « par le calcul ». Le décor est un SVG
 * DERRIÈRE la toile 3D (fond transparent), `aria-hidden`, `[data-deco]`, ne porte jamais une longueur ni un volume ; immobile
 * sous `prefers-reduced-motion`.
 * Manuel (§6bis) : chaque geste est un essai jugé (« ثبّت », « تحقّق » ou le lâcher de S, une carte) — aucune auto-complétion.
 *
 * D'UN SEUL REGARD (§8bis) : la fenêtre 3D a une hauteur budgétée sur l'écran (`clamp(190px, 44dvh, 400px)`, ≤ 55 % de la
 * hauteur : la page défile encore autour sur un téléphone) ; le curseur et ses −/+, les boutons de phase, la lecture et le
 * verdict sont juste dessous dans le bloc `[data-bf-glance]` ; la liste des essais est dans un `LabFold` SOUS le bloc.
 *
 * Props : `r`, `R`, `H`, `depth` (à plat ou dans `numbers`), `theme`, `title`, `lead`, `mission`, `level`, `levels`,
 * `onTrial(evidence)` à chaque geste jugé, `onFinished({ volume, approx, litres })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-bucket-fill][data-world][data-phase=level|apex|volume][data-level-ok][data-apex-ok][data-card-ok],
 * [data-bf-glance], [data-bf-depth=d], [data-bf-level-slider], [data-bf-level-minus|plus], [data-bf-fix], [data-bf-to-apex],
 * [data-bf-apex-slider], [data-bf-apex-minus|plus], [data-bf-check], [data-bf-to-volume], [data-bf-back=<phase>],
 * [data-bf-card=<id>], [data-bf-reading], [data-bf-verdict=<kind>], [data-lab-fold=bucket-fill.trials], [data-deco].
 */
const C = { bucket: '#fb923c', rim: '#ea580c', ok: '#10b981', ko: '#e11d48', live: '#f59e0b', axis: '#334155' };
const AZ = -70;

/** Un nombre à la virgule, dans un îlot KaTeX : 25 539,1 → « 25\,539{,}1 ». */
function decTex(x, digits = 2) {
  const s = space.roundTo(x, digits);
  const [i, f] = s.split(',');
  const grouped = i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
  return f != null ? `${grouped}{,}${f}` : grouped;
}
const fracTex = (p) => LN.fracLatex(p);

export default function BucketFill({
  r: r0, R: R0, H: H0, depth: d0, numbers: nums, theme = 'beach-bucket', title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.bucketFill.${key}`, o), [t]);
  const initialNumbers = {
    r: r0 ?? nums?.r ?? 15, R: R0 ?? nums?.R ?? 20, H: H0 ?? nums?.H ?? 35, depth: d0 ?? nums?.depth ?? 28,
  };
  const state = useManipulation({ type: 'bucket-fill', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { r, R, H, depth } = state.numbers;
  const NUMS = useMemo(() => ({ r, R, H, depth }), [r, R, H, depth]);
  const make = () => L.init(NUMS);
  const [lab, setLab] = useState(make);
  const sceneKey = `${r}|${R}|${H}|${depth}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState({});
  // « إعادة » (epoch), un autre niveau ou d'autres nombres : TOUT recommence — le seau, les étapes et les questions du labo
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); setDoneIds({}); }
  const reduce = useReducedMotion();
  const stageBoxRef = useRef(null);
  // La largeur réelle du bloc (sur un téléphone, ≈ 180 px au fond d'un module) : en dessous de 420 px, la fenêtre 3D est
  // un peu plus basse, les cartes ne montrent que leur formule et la coupe axiale est réduite.
  const glanceRef = useRef(null);
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const el = glanceRef.current;
    if (!el) return undefined;
    const measure = () => setNarrow(el.clientWidth > 0 && el.clientWidth < 420);
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const F = useMemo(() => L.facts(NUMS), [NUMS]);
  const range = useMemo(() => L.apexRange(NUMS), [NUMS]);
  const cardList = useMemo(() => L.cards(NUMS), [NUMS]);
  const apexExact = LN.toNumber(F.apex);

  const ready = L.discoveryReady(lab);
  const cpSettings = useLabCheckpointSettings('bucket-fill');   // obligatoires pour tout élève ; l'enseignant seul les coupe, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    state.report(onFinished, { volume: F.volume.latex, approx: space.roundTo(F.volume.number, 1), litres: space.roundTo(F.litres, 2) });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (lab.trials.length > 0) state.report(onTrial, L.evidenceOf(lab)); }, [lab.trials.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les gestes, partagés par la scène 3D (draggable) et les commandes HTML ── */
  const actions = useRef({});
  actions.current = {
    setLevel: (d) => setLab((s) => L.setLevel(s, d)),
    setApex: (a) => setLab((s) => L.setApex(s, a)),
    commitApex: () => setLab((s) => L.commitApex(s)),
  };
  const [dragging, setDragging] = useState(null);
  const dragRef = useRef(setDragging);
  dragRef.current = setDragging;

  const phase = lab.phase;
  const verdictNow = phase === 'apex' ? L.apexVerdict(NUMS, lab.apex) : null;
  // Le cadrage de la caméra suit S quand la main le LÂCHE (pas pendant le geste) : le cône complété remplit la fenêtre.
  const [frameA, setFrameA] = useState(lab.apex);
  useEffect(() => {
    if (dragging) return undefined;
    const id = setTimeout(() => setFrameA(lab.apex), 350);
    return () => clearTimeout(id);
  }, [lab.apex, dragging]);
  const sceneState = useMemo(() => ({
    phase, level: lab.level, apex: lab.apex, apexKind: phase === 'level' ? null : L.apexVerdict(NUMS, lab.apex).kind,
    apexOk: lab.apexOk, cardOk: lab.cardOk, reduce: !!reduce, frameA: phase === 'level' ? null : frameA, narrow,
  }), [phase, lab.level, lab.apex, lab.apexOk, lab.cardOk, NUMS, reduce, frameA, narrow]);

  /* ── la scène 3D (construite UNE fois) ── */
  const build = useCallback((stage) => buildBucketScene(stage, NUMS, range, actions, dragRef), []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le clavier des curseurs : flèches ±1, Maj + flèche ±5 ; Entrée valide S ── */
  const sliderKey = (kind) => (e) => {
    const big = e.shiftKey ? 5 : 1;
    const dd = { ArrowRight: big, ArrowUp: big, ArrowLeft: -big, ArrowDown: -big }[e.key];
    if (dd != null && e.shiftKey) {
      e.preventDefault();
      if (kind === 'level') actions.current.setLevel(lab.level + dd);
      else actions.current.setApex(lab.apex + dd);
    }
    if (kind === 'apex' && e.key === 'Enter') { e.preventDefault(); actions.current.commitApex(); }
  };

  /* ── ce que l'écran écrit ── */
  const cm = '\\,\\mathrm{cm}';
  const rimGap = H - lab.level;
  const reading = (() => {
    if (phase === 'level') return k('readLevel', { d: lab.level, gap: rimGap });
    if (phase === 'apex') {
      if (verdictNow.kind === 'ok') return k('readApexOk', { a: lab.apex, aH: lab.apex + H, r, R });
      return k('readApex', { a: lab.apex, reach: decTex(verdictNow.reachNumber, 2), R });
    }
    const sw = apexExact + depth;
    const base = k('readVolume', { a: apexExact, sw, k: fracTex(F.k), rho: fracTex(F.rho) });
    if (!lab.cardOk) return base;
    return k('readVolumeOk', { V: F.volume.latex, Vd: decTex(F.volume.number, 1), L: decTex(F.litres, 2) });
  })();

  const last = lab.last;
  const verdictKind = dragging ? 'live' : last ? last.kind : `start-${phase}`;
  const verdict = (() => {
    switch (verdictKind) {
      case 'live': return <span className="text-amber-900">{k(dragging === 'apex' ? 'vLiveApex' : 'vLiveLevel')}</span>;
      case 'start-level': return <span className="text-slate-800"><MathText>{H - depth === 0 ? k('vStartLevelFull') : k('vStartLevel', { want: H - depth })}</MathText></span>;
      case 'start-apex': return <span className="text-slate-800"><MathText>{k('vStartApex')}</MathText></span>;
      case 'start-volume': return <span className="text-slate-800">{k('vStartVolume')}</span>;
      case 'levelKo': return (
        <span className="text-rose-800">
          <MathText>{last.fromBottom ? k('vLevelBottom', { d: last.d, want: last.want }) : last.want === 0 ? k('vLevelNotFull', { gap: last.gap }) : k('vLevelKo', { gap: last.gap, want: last.want })}</MathText>
        </span>
      );
      case 'levelOk': return <span className="text-emerald-800"><MathText>{k('vLevelOk', { d: last.d })}</MathText></span>;
      case 'apexKo': return <span className="text-rose-800"><MathText>{k(last.dir === 'wide' ? 'vApexWide' : 'vApexNarrow', { a: last.a, reach: decTex(last.reach, 2), R: last.R })}</MathText></span>;
      case 'apexOk': return <span className="text-emerald-800"><MathText>{k('vApexOk', { a: last.a })}</MathText></span>;
      case 'cardKo': return <span className="text-rose-800"><MathText>{k(`vCardKo.${last.id}`, { v: decTex(last.value, 1), right: decTex(last.right, 1) })}</MathText></span>;
      case 'cardOk': return <span className="text-emerald-800"><MathText>{k('vCardOk', { k: fracTex(F.k) })}</MathText></span>;
      default: return <span className="text-slate-700">{k('vStartVolume')}</span>;
    }
  })();

  /* ── la découverte : distracteurs réfutés par les nombres de la scène ── */
  const discoveryOptions = useMemo(() => {
    const val = (id) => cardList.find((c) => c.id === id).value.number;
    const opts = [
      { text: k('dOptAvg'), why: <MathText>{k('dWhyAvg', { v: decTex(val('avg'), 1), right: decTex(F.volume.number, 1) })}</MathText> },
      { text: <MathText>{k('dOptK')}</MathText>, why: <MathText>{k('dWhyK', { v: decTex(val('k'), 1), right: decTex(F.volume.number, 1) })}</MathText> },
      { text: <MathText>{k('dOptRight')}</MathText>, correct: true },
    ];
    if (depth < H) {
      const prop = F.bucket.number * (depth / H);
      opts.push({ text: k('dOptHeight'), why: <MathText>{k('dWhyHeight', { v: decTex(prop, 1), right: decTex(F.volume.number, 1) })}</MathText> });
    }
    return opts;
  }, [cardList, F, depth, H, k]);

  const formal = (
    <div className="space-y-2" data-bf-formal>
      <EquationDisplay tone="result" tex={`\\dfrac{SO}{SO_1} = \\dfrac{OA}{O_1B} \\;\\Rightarrow\\; \\dfrac{SO}{SO + ${H}} = \\dfrac{${r}}{${R}} \\;\\Rightarrow\\; SO = ${apexExact}${cm}`} note={k('fNoteApex')} />
      <EquationDisplay tone="result" tex={`k = \\dfrac{SO}{SW} = \\dfrac{${apexExact}}{${apexExact + depth}} = ${fracTex(F.k)} \\qquad \\rho = \\dfrac{${r}}{k} = ${fracTex(F.rho)}${cm}`} note={k('fNoteK')} />
      <EquationDisplay tone="result" tex={`V = V_1 - V_2 = V_1\\left(1 - k^3\\right) = ${F.volume.latex} \\approx ${decTex(F.volume.number, 1)}\\,\\mathrm{cm}^3`} note={k('fNoteV')} />
      <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
    </div>
  );

  /* ── les étapes et leurs questions : le niveau fixé, le sommet trouvé, le volume (puis la règle) ── */
  const stepList = L.stepsOf(lab).map((st) => ({ ...st, chain: chainOf(st.id) }));
  const stepDone = stepList.map((st) => !!doneIds[st.id] || (!cpLive && st.reached));
  const nextStep = cpLive ? stepList.find((st) => !doneIds[st.id]) : null;
  const cpId = nextStep && nextStep.reached ? nextStep.id : null;
  const chain = cpId ? nextStep.chain : null;
  const cp = useLabCheckpoint({
    id: cpId,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ lab, nums: NUMS, F, options: discoveryOptions, formal }, k)) : null,
    reached: !!cpId,
    resetKey: scene.inits,
    onRetry: () => setLab((cur) => L.retryStep(cur, cpId)),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => ({ ...d, [id]: true }));
      if (stepList.find((st) => st.id === id)?.chain.includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  const doneKey = stepDone.join();
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: i + 1, total: stepList.length });
    });
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son : un déclic quand l'eau monte ou que S descend d'un centimètre (au plus un toutes les 35 ms), « flag » au geste jugé juste,
     « over » au geste refusé, « bell » quand une étape est finie. Muet sauf « الصوت ». ── */
  const tick = useRef({ key: null, at: 0 });
  const gestureKey = `${lab.level}|${lab.apex}`;
  useEffect(() => {
    const p = tick.current;
    if (p.key === null) { p.key = gestureKey; return; }
    if (p.key === gestureKey) return;
    p.key = gestureKey;
    const now = performance.now();
    if (now - p.at > 35) { playSfx('tooth'); p.at = now; }
  }, [gestureKey]);
  const heard = useRef(0);
  useEffect(() => {
    const n = lab.trials.length;
    if (n < heard.current) heard.current = 0;
    if (n === 0 || n === heard.current) return;
    heard.current = n;
    playSfx(lab.trials[n - 1].ok ? 'flag' : 'over');
  }, [lab.trials.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const bells = useRef(0);
  useEffect(() => {
    const n = stepDone.filter(Boolean).length;
    if (n > bells.current) playSfx('bell');
    bells.current = n;
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const fallback = <SpaceFigure {...L.fallbackFigure(NUMS, lab.level, k('figureAria'))} />;
  const sceneLabel = k('sceneLabel', { d: lab.level, phase: k(`phaseName.${phase}`) });
  const btn = 'inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-1 rounded-xl border-2 px-3 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-45';
  const sliderCls = 'h-11 min-w-0 flex-1 cursor-pointer accent-orange-500';

  return (
    <ManipulationShell
      type="bucket-fill"
      title={title ?? k('title')}
      mission={mission ?? <MathText>{k(`mission.${phase}`)}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={['hint1', 'hint2', 'hint3'].map((hk) => <MathText key={hk}>{k(hk)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={k('dPrompt')} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50 to-amber-50" minHeight="min-h-[180px]">
        <div className="relative space-y-2" data-bucket-fill data-world={theme} data-phase={phase} data-level-ok={lab.levelOk ? 'true' : 'false'}
          data-apex-ok={lab.apexOk ? 'true' : 'false'} data-card-ok={lab.cardOk ? 'true' : 'false'} data-bf-depth={lab.level}>
          {party.node}
          {cp.node}
          <LabStepper count={stepList.length} current={Math.max(0, stepDone.indexOf(false) < 0 ? stepList.length - 1 : stepDone.indexOf(false))} done={stepDone} stepAttr="data-bf-step" />
          <div ref={glanceRef} className="space-y-1.5" data-bf-glance>
            <div ref={stageBoxRef} className="relative overflow-hidden rounded-2xl ring-1 ring-sky-200" style={{ height: narrow ? 'clamp(170px, 40dvh, 340px)' : 'clamp(190px, 44dvh, 400px)' }}>
              <BeachDecor uid={uid} lit={lab.cardOk} phase={phase} reduce={!!reduce} />
              <Stage3D
                build={build}
                state={sceneState}
                fallback={fallback}
                view={{ azimuth: AZ, elevation: 22, distance: levelDistance(NUMS) }}
                target={[0, 0, 3 * 0.75]}
                ariaLabel={sceneLabel}
                style={{ position: 'absolute', inset: 0 }}
              />
              {phase !== 'level' && (
                <MovablePanel id="bucket-fill.axial" bounds={stageBoxRef} title={k('axialTitle')} className={`absolute bottom-2 end-2 z-20 ${narrow ? 'w-[100px]' : ''}`}>
                  <AxialPanel nums={NUMS} a={lab.apex} phase={phase} cardOk={lab.cardOk} aria={k('axialAria', { a: lab.apex })} note={k('axialNote')} narrow={narrow} />
                </MovablePanel>
              )}
              {phase === 'level' ? (
                <span className="pointer-events-none absolute start-2 top-2 z-10 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-bold text-slate-700 shadow-sm" aria-hidden="true">
                  {k(`phaseName.${phase}`)}
                </span>
              ) : (
                // le chemin de retour (§7quater), posé sur la scène pour ne pas coûter une ligne au bloc
                <button type="button" data-bf-back={phase === 'apex' ? 'level' : 'apex'} onClick={() => setLab((s) => L.openPhase(s, phase === 'apex' ? 'level' : 'apex'))}
                  aria-label={k(phase === 'apex' ? 'backLevel' : 'backApex')}
                  className="absolute start-2 top-2 z-10 inline-flex min-h-[44px] items-center rounded-full bg-white/90 px-3 text-xs font-bold text-slate-800 shadow ring-1 ring-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300">
                  {k(phase === 'apex' ? (narrow ? 'backLevelShort' : 'backLevel') : (narrow ? 'backApexShort' : 'backApex'))}
                </button>
              )}
            </div>

            {/* le curseur de la phase (le même geste que dans la scène) */}
            {phase !== 'volume' && (
              <div className="flex items-center gap-1.5" dir="ltr">
                <button type="button" className={`${btn} border-orange-200 bg-white text-orange-900`}
                  {...(phase === 'level' ? { 'data-bf-level-minus': true } : { 'data-bf-apex-minus': true })}
                  aria-label={k(phase === 'level' ? 'levelDown' : 'apexUp')}
                  onClick={() => (phase === 'level' ? actions.current.setLevel(lab.level - 1) : actions.current.setApex(lab.apex - 1))}>−</button>
                {phase === 'level' ? (
                  <input type="range" min={0} max={H} step={1} value={lab.level} className={sliderCls} data-bf-level-slider
                    aria-label={k('levelAria')} aria-valuetext={k('levelValue', { d: lab.level, gap: rimGap })}
                    onChange={(e) => actions.current.setLevel(Number(e.target.value))} onKeyDown={sliderKey('level')} />
                ) : (
                  <input type="range" min={range.lo} max={range.hi} step={1} value={lab.apex} className={sliderCls} data-bf-apex-slider
                    aria-label={k('apexAria')} aria-valuetext={k('apexValue', { a: lab.apex })}
                    onChange={(e) => actions.current.setApex(Number(e.target.value))} onKeyDown={sliderKey('apex')}
                    onPointerUp={() => actions.current.commitApex()} />
                )}
                <button type="button" className={`${btn} border-orange-200 bg-white text-orange-900`}
                  {...(phase === 'level' ? { 'data-bf-level-plus': true } : { 'data-bf-apex-plus': true })}
                  aria-label={k(phase === 'level' ? 'levelUp' : 'apexDown')}
                  onClick={() => (phase === 'level' ? actions.current.setLevel(lab.level + 1) : actions.current.setApex(lab.apex + 1))}>+</button>
                <span className="min-w-[4.5rem] text-center font-mono text-sm font-bold text-slate-800 inline-block" aria-hidden="true">
                  {phase === 'level' ? `d = ${lab.level}` : `SO = ${lab.apex}`}
                </span>
              </div>
            )}

            {/* les boutons de la phase */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {phase === 'level' && (
                <>
                  <button type="button" data-bf-fix onClick={() => setLab((s) => L.fixLevel(s))} className={`${btn} border-orange-400 bg-orange-400 text-slate-900`}>{k('fix')}</button>
                  {L.canOpenApex(lab) && (
                    <button type="button" data-bf-to-apex onClick={() => setLab((s) => L.openPhase(s, 'apex'))} className={`${btn} border-sky-300 bg-white text-sky-900`}>{k('toApex')}</button>
                  )}
                </>
              )}
              {phase === 'apex' && (
                <>
                  <button type="button" data-bf-check onClick={() => actions.current.commitApex()} className={`${btn} border-amber-400 bg-amber-300 text-slate-900`}>{k('check')}</button>
                  {L.canOpenVolume(lab) && (
                    <button type="button" data-bf-to-volume onClick={() => setLab((s) => L.openPhase(s, 'volume'))} className={`${btn} border-sky-300 bg-white text-sky-900`}>{k('toVolume')}</button>
                  )}
                </>
              )}
              {phase === 'volume' && (
                <>
                  <div className="grid w-full grid-cols-2 gap-1.5" role="group" aria-label={k('cardsTitle')}>
                    {cardList.map((c) => {
                      const picked = lab.card === c.id;
                      const tone = picked ? (c.ok ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-rose-400 bg-rose-50 text-rose-900') : 'border-orange-200 bg-white text-slate-800';
                      return (
                        <button key={c.id} type="button" data-bf-card={c.id} disabled={lab.cardOk && !picked} aria-pressed={picked}
                          onClick={() => setLab((s) => L.pickCard(s, c.id))}
                          aria-label={mathToPlain(`${k(`cardName.${c.id}`)} ${k(`card.${c.id}`)}`)}
                          className={`min-h-[44px] rounded-xl border-2 px-1.5 py-1 text-center font-semibold leading-snug [&_.katex]:whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-40 text-sm ${tone}`}>
                          {!narrow && <span className="block text-[11px] text-slate-600" aria-hidden="true">{k(`cardName.${c.id}`)}</span>}
                          <span aria-hidden="true"><MathText>{k(`card.${c.id}`)}</MathText></span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <p className={`min-h-[1.5rem] text-center text-slate-800 [&_.katex]:whitespace-nowrap ${narrow ? 'text-[11px]' : 'text-sm'}`} data-bf-reading aria-live="polite"><MathText>{reading}</MathText></p>
            <p role="status" className={`min-h-[2.5rem] rounded-xl bg-white/95 px-2 py-1 font-bold leading-snug [&_.katex]:whitespace-nowrap ${narrow ? 'text-[11px]' : 'text-sm'}`} data-bf-verdict={verdictKind}>{verdict}</p>
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="bucket-fill.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-bf-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => (
                  <li key={i} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'}>
                    <MathText>{k(`trial.${tr.kind}`, { d: tr.d, gap: tr.gap, a: tr.a, reach: tr.reach != null ? decTex(tr.reach, 2) : '', v: tr.value != null ? decTex(tr.value, 1) : '', card: tr.id ? k(`cardShort.${tr.id}`) : '' })}</MathText>
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

/** La distance de la caméra qui montre le seau entier (phase « مستوى الماء »). */
function levelDistance({ H, R }) {
  const f = 3 / H;
  return 3.0 * Math.max(H, 2 * R) * f;
}

/**
 * LA SCÈNE 3D — construite une fois (Stage3D › build). Unité de dessin : la hauteur du seau vaut 3 (f = 3/H par cm) ; le
 * repère est mathématique (z en haut), O au centre du fond. Le contrôleur rend `update(state)` : il redessine l'eau, le cône
 * complété et ses génératrices quand leur clé change, recadre la caméra quand la phase change, et ne rend déplaçable que l'objet
 * de la phase (la surface de l'eau, puis S).
 */
/** Une génératrice ÉPAISSE (un fin cylindre de a à b, coordonnées mathématiques) : un trait WebGL ne fait qu'un pixel. */
function rod(a, b, radius, color) {
  const A = toThree(a); const Bv = toThree(b);
  const m = new Mesh(new CylinderGeometry(radius, radius, A.distanceTo(Bv), 10), S3.solidMat(color));
  m.position.copy(A.clone().add(Bv).multiplyScalar(0.5));
  m.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), Bv.clone().sub(A).normalize()));
  return m;
}

function buildBucketScene(stage, NUMS, range, actions, dragRef) {
  const { r, R, H } = NUMS;
  const f = 3 / H;
  const P = (x, y, z) => [x * f, y * f, z * f];
  const world = new Group();
  stage.add(world);

  // le seau : un tronc de cône ouvert, translucide, son bord épais, son fond, son anse (décor)
  world.add(S3.frustum(r * f, R * f, H * f, { color: C.bucket, opacity: 0.3, open: true }));
  world.add(S3.ring(P(0, 0, H), R * f, { color: C.rim, tube: 0.05 }));
  world.add(S3.ring(P(0, 0, 0), r * f, { color: C.rim, tube: 0.035 }));
  world.add(S3.disc(P(0, 0, 0.01 * H), r * f, { color: '#fdba74', opacity: 0.85 }));
  const arc = new Mesh(new TorusGeometry(R * f * 0.98, 0.03, 8, 64, Math.PI), S3.solidMat('#dc2626'));
  arc.position.copy(toThree(P(0, 0, H)));
  world.add(arc);
  const lO = stage.label('O', P(0, 0, 0), { size: 13 });
  lO.position.copy(toThree([0.18, 0, -0.1]));
  world.add(lO);

  const water = new Group(); world.add(water);
  const apexG = new Group(); world.add(apexG);
  // la poignée de S : un objet PERSISTANT (le seul que la main saisit en phase « الرأس »), déplacé sur l'axe
  const sGrip = new Group(); world.add(sGrip);
  let waterKey = ''; let apexKey = ''; let lastPhase = null; let lastFrame = null; let unDrag = null; let fade = null;

  const clear = (g) => [...g.children].forEach((c) => stage.remove(c));
  const front = (rad, z) => [rad * f * Math.cos((AZ * Math.PI) / 180), rad * f * Math.sin((AZ * Math.PI) / 180), z * f];

  function drawWater(d, glow) {
    const key = `${d}|${glow}`;
    if (key === waterKey) return;
    waterKey = key;
    clear(water);
    if (d <= 0) return;
    const rho = L.drawRadius(NUMS, d);
    water.add(S3.frustum(r * f, rho * f, d * f, { color: 'water', opacity: glow ? 0.62 : 0.5, open: false }));
    water.add(S3.disc(P(0, 0, d), rho * f, { color: '#bae6fd', opacity: 0.8 }));
    water.add(S3.ring(P(0, 0, d), rho * f, { color: 'sky', tube: 0.03 }));
    water.add(S3.handle(front(rho, d), { color: 'sky', radius: 0.2 }));
  }

  function drawApex(st) {
    const show = st.phase !== 'level';
    const key = show ? `${st.phase}|${st.apex}|${st.apexKind}|${st.cardOk}|${st.level}|${st.frameA}` : 'none';
    if (key === apexKey) return;
    apexKey = key;
    fade?.(); fade = null;
    clear(apexG);
    clear(sGrip);
    sGrip.visible = show;
    if (!show) return;
    const a = st.apex;
    const ok = st.apexKind === 'ok';
    const reach = L.apexVerdict(NUMS, a).reachNumber;
    const tone = ok ? C.ok : C.ko;
    apexG.add(S3.segment(P(0, 0, -a), P(0, 0, H), { color: C.axis, dashed: true, dash: 0.12, gap: 0.1 }));
    const ext = extentOf(st.frameA ?? a);
    const w = 0.0055 * ext; // l'épaisseur suit le cadrage (≈ 3 px)
    for (const sx of [-1, 1]) {
      apexG.add(rod(P(0, 0, -a), P(sx * reach, 0, H), w, tone));
      if (!ok) {
        apexG.add(rod(P(sx * reach, 0, H), P(sx * R, 0, H), w * 1.6, C.ko));
        apexG.add(S3.dot(P(sx * reach, 0, H), { radius: w * 3, color: C.ko }));
      }
    }
    apexG.add(S3.dot(P(r, 0, 0), { radius: w * 2.5, color: C.axis }));
    apexG.add(S3.dot(P(R, 0, H), { radius: w * 3, color: ok ? C.ok : C.axis }));
    apexG.add(stage.label('A', P(r, 0, 0).map((v, i) => v + [0.2, 0, -0.12][i]), { size: 13 }));
    apexG.add(stage.label('B', P(R, 0, H).map((v, i) => v + [0.22, 0, 0.12][i]), { size: 13 }));
    sGrip.position.copy(toThree(P(0, 0, -a)));
    sGrip.add(S3.handle([0, 0, 0], { color: ok ? 'emerald' : 'amber', radius: 0.028 * ext }));
    apexG.add(stage.label('S', P(0, 0, -a).map((v, i) => v + [0.07 * ext, 0, 0][i]), { size: 15, color: ok ? '#047857' : '#92400e' }));
    if (ok && st.phase === 'volume') {
      const d = NUMS.depth;
      const rho = L.drawRadius(NUMS, d);
      // le grand cône (S → surface de l'eau) et le petit (S → fond) : la réduction de rapport k
      apexG.add(S3.frustum(0.0001, rho * f, (a + d) * f, { at: P(0, 0, -a), color: 'sky', opacity: 0.12, open: true }));
      const small = S3.frustum(0.0001, r * f, a * f, { at: P(0, 0, -a), color: 'rose', opacity: st.cardOk ? 0.08 : 0.38, open: false });
      apexG.add(small);
      apexG.add(stage.label('W', P(0, 0, d).map((v, i) => v + [0.2, 0, 0.12][i]), { size: 13 }));
      if (st.cardOk && !st.reduce && !prefersReducedMotion()) {
        // la soustraction V₁ − V₂ : le petit cône s'efface (0,8 s)
        const t0 = performance.now();
        small.material.opacity = 0.38;
        fade = stage.animate((time) => {
          const u = Math.min(1, (time - t0) / 800);
          small.material.opacity = 0.38 - 0.3 * u;
          return u < 1;
        });
      }
    }
  }

  /** La hauteur (unités de dessin) de ce que la caméra doit montrer : du sommet S à l'anse au-dessus du bord. */
  function extentOf(a) { return (a + H + R * 0.95) * f; }
  function frame(phase, a, narrow) {
    const view = phase === 'level'
      ? { azimuth: AZ, elevation: 22, distance: levelDistance(NUMS) }
      : { azimuth: AZ, elevation: 10, distance: Math.max(levelDistance(NUMS), 1.85 * extentOf(a)) };
    const z = phase === 'level' ? 3 * 0.75 : ((H + R * 0.95 - a) * f) / 2;
    // Sur un téléphone la coupe axiale flotte du côté gauche : le cône se décale vers la droite de l'écran (on décale la cible
    // vers la gauche, le long de la droite de l'écran u = (−sin az, cos az, 0)).
    let shift = 0;
    if (narrow && phase !== 'level') {
      const el = stage.container; const aspect = el.clientWidth / Math.max(1, el.clientHeight);
      shift = 0.2 * 2 * view.distance * Math.tan((17.5 * Math.PI) / 180) * aspect;
    }
    const az = (AZ * Math.PI) / 180;
    const target = [Math.sin(az) * shift, -Math.cos(az) * shift, z];
    stage.options.view = view;
    stage.options.target = target;
    stage.setView(view, target);
  }

  function arm(phase) {
    unDrag?.();
    unDrag = null;
    if (phase === 'level') {
      unDrag = stage.draggable(water, {
        start: () => dragRef.current('level'),
        move: ({ onLine }) => actions.current.setLevel(onLine([0, 0, 0], [0, 0, 1]) / f),
        end: () => dragRef.current(null),
      });
    } else if (phase === 'apex') {
      unDrag = stage.draggable(sGrip, {
        start: () => dragRef.current('apex'),
        move: ({ onLine }) => actions.current.setApex(-onLine([0, 0, 0], [0, 0, 1]) / f),
        end: () => { dragRef.current(null); actions.current.commitApex(); },
      });
    }
  }

  return {
    update(st) {
      drawWater(st.phase === 'level' ? st.level : NUMS.depth, st.cardOk);
      drawApex(st);
      if (st.phase !== lastPhase) { arm(st.phase); }
      const fk = `${st.phase}|${st.frameA}|${st.narrow}`;
      if (fk !== lastFrame) { frame(st.phase, st.frameA ?? st.apex, st.narrow); lastFrame = fk; }
      lastPhase = st.phase;
    },
    dispose() { unDrag?.(); fade?.(); },
  };
}

/**
 * LA COUPE AXIALE, À PLAT (un panneau que l'élève déplace) : là où Thalès se lit. Le seau A′ABB′, l'axe, S, les deux génératrices
 * (SA) prolongées jusqu'au plan du bord, l'écart au bord en rouge tant que S est faux ; au volume, le petit triangle (le petit
 * cône, rose) dans le grand (le grand cône, bleu). Échelles différentes en largeur et en hauteur (une affinité garde le
 * parallélisme et les rapports sur chaque droite) : le dessin agrandit l'écart que la scène 3D montre à l'échelle.
 */
function AxialPanel({ nums, a, phase, cardOk, aria, note, narrow }) {
  const { r, R, H, depth } = nums;
  const W = 150; const Hh = 196; const m = 16;
  const sx = (W / 2 - 14) / R; const sy = (Hh - 2 * m) / (a + H);
  const X = (x) => W / 2 + x * sx; const Y = (z) => m + (H - z) * sy;
  const v = L.apexVerdict(nums, a);
  const ok = v.kind === 'ok';
  const reach = v.reachNumber;
  const rho = L.drawRadius(nums, depth);
  const tone = ok ? '#059669' : '#e11d48';
  const txt = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const reachX = Math.min(reach, R * 1.9);
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} className={`block h-auto ${narrow ? 'w-[74px]' : 'w-[150px]'}`} role="img" aria-label={aria} data-bf-axial>
      {phase === 'volume' && ok && (
        <g>
          <polygon points={`${X(0)},${Y(-a)} ${X(-rho)},${Y(depth)} ${X(rho)},${Y(depth)}`} fill="#38bdf8" fillOpacity={0.22} />
          <polygon points={`${X(0)},${Y(-a)} ${X(-r)},${Y(0)} ${X(r)},${Y(0)}`} fill="#e11d48" fillOpacity={cardOk ? 0.08 : 0.3} />
        </g>
      )}
      <line x1={X(0)} y1={Y(-a)} x2={X(0)} y2={Y(H)} stroke="#334155" strokeWidth={1} strokeDasharray="3 3" />
      <polyline points={`${X(-R)},${Y(H)} ${X(-r)},${Y(0)} ${X(r)},${Y(0)} ${X(R)},${Y(H)}`} fill="none" stroke="#ea580c" strokeWidth={2.6} strokeLinejoin="round" />
      <line x1={X(-R)} y1={Y(H)} x2={X(R)} y2={Y(H)} stroke="#ea580c" strokeWidth={1.4} />
      <line x1={X(-rho)} y1={Y(depth)} x2={X(rho)} y2={Y(depth)} stroke="#0284c7" strokeWidth={2} />
      {[-1, 1].map((sg) => (
        <g key={sg}>
          <line x1={X(0)} y1={Y(-a)} x2={X(sg * reachX)} y2={Y(H)} stroke={tone} strokeWidth={1.6} />
          {!ok && <line x1={X(sg * reachX)} y1={Y(H)} x2={X(sg * R)} y2={Y(H)} stroke="#e11d48" strokeWidth={3.2} strokeLinecap="round" />}
        </g>
      ))}
      <circle cx={X(0)} cy={Y(-a)} r={4} fill={ok ? '#059669' : '#f59e0b'} />
      <circle cx={X(R)} cy={Y(H)} r={2.6} fill={ok ? '#059669' : '#0f172a'} />
      <circle cx={X(r)} cy={Y(0)} r={2.2} fill="#0f172a" />
      <text x={X(0) + 7} y={Y(-a) + 4} fontSize={12} fontWeight="bold" fill="#0f172a" {...txt}>S</text>
      <text x={X(r) + 5} y={Y(0) + 11} fontSize={10} fontWeight="bold" fill="#0f172a" {...txt}>A</text>
      <text x={X(R) - 3} y={Y(H) - 5} fontSize={10} fontWeight="bold" fill="#0f172a" textAnchor="end" {...txt}>B</text>
      <text x={X(0) - 4} y={(Y(-a) + Y(0)) / 2} fontSize={10} fontWeight="bold" fill="#334155" textAnchor="end" {...txt}>{`SO = ${a}`}</text>
      <text x={X(0) + 4} y={Y(0) - 3} fontSize={9} fill="#334155" {...txt}>{r}</text>
      <text x={X(0) + 4} y={Y(H) - 3} fontSize={9} fill="#334155" {...txt}>{R}</text>
      {!narrow && <text x={W / 2} y={Hh - 2} fontSize={8.5} fill="#64748b" textAnchor="middle" direction="rtl">{note}</text>}
    </svg>
  );
}

/**
 * Le DÉCOR (exigence du propriétaire, monde Gen-Alpha) : la plage de Tipaza — ciel, soleil, mer, les ruines romaines au loin,
 * un parasol, un château de sable, une serviette avec un téléphone qui filme (point rouge), des tongs ; une mouette passe et le
 * soleil brille quand le volume est trouvé par le calcul. DERRIÈRE la toile 3D (fond transparent), `aria-hidden`, hors clavier,
 * sans aucune mesure ; ids de dégradés par `useId` (les deux niveaux d'un workspace sont montés ensemble).
 */
function BeachDecor({ uid, lit, phase, reduce }) {
  // Le fond s'étire à toute fenêtre (ciel, mer à l'horizon 45 %, sable dès 62 %) ; les objets gardent leurs proportions et
  // s'accrochent aux coins — la scène reste juste en paysage (ordinateur) comme en portrait (téléphone).
  const box = (style, w, h, children, extra = {}) => (
    <svg className="absolute" style={style} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" {...extra}>{children}</svg>
  );
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true" data-deco="beach-bucket">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`bfSky${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#fef3c7" />
          </linearGradient>
          <linearGradient id={`bfSea${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0284c7" /><stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id={`bfSand${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <rect width="100" height="46" fill={`url(#bfSky${uid})`} />
        <rect y="45" width="100" height="19" fill={`url(#bfSea${uid})`} />
        <path d="M0 62 Q25 59 50 61.5 T100 61 V100 H0 Z" fill={`url(#bfSand${uid})`} />
        {phase !== 'level' && <rect y="61" width="100" height="39" fill="#fff7ed" opacity="0.4" />}
      </svg>
      <style>{'.bf-wave{animation:bfWave 5s ease-in-out infinite alternate}@keyframes bfWave{from{transform:translateX(0)}to{transform:translateX(-18px)}}.bf-gull{animation:bfGull 3.5s ease-out both}@keyframes bfGull{from{transform:translate(-50px,14px);opacity:0}to{transform:translate(0,0);opacity:1}}@media (prefers-reduced-motion: reduce){.bf-wave,.bf-gull{animation:none}}'}</style>
      {/* les vagues, sur la bande de mer */}
      <svg className="absolute inset-x-0" style={{ top: '49%', height: '12%', width: '100%' }} viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
        <g className={reduce ? undefined : 'bf-wave'} stroke="#e0f2fe" strokeWidth="2.5" fill="none" opacity="0.85">
          <path d="M0 10 q15 -7 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" />
          <path d="M-10 28 q15 -7 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0" />
        </g>
      </svg>
      {/* le soleil (il brille quand le volume est trouvé par le calcul) */}
      {box({ top: 8, left: 10 }, 64, 64, (
        <g transform="translate(32 32)">
          {lit && [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r = (a * Math.PI) / 180;
            return <line key={a} x1={Math.cos(r) * 21} y1={Math.sin(r) * 21} x2={Math.cos(r) * 29} y2={Math.sin(r) * 29} stroke="#facc15" strokeWidth="3" strokeLinecap="round" />;
          })}
          <circle r={lit ? 17 : 14} fill="#fde047" opacity="0.95" />
        </g>
      ))}
      {/* les ruines romaines de Tipaza, posées sur l'horizon */}
      {box({ bottom: '54%', right: '6%' }, 92, 46, (
        <g fill="#c2b49a" opacity="0.8">
          <rect x="4" y="10" width="7" height="36" /><rect x="18" y="4" width="7" height="42" /><rect x="32" y="14" width="7" height="32" />
          <rect x="0" y="2" width="44" height="6" rx="1" />
          <path d="M54 46 v-24 a12 12 0 0 1 24 0 v24 h-6 v-20 a6 6 0 0 0 -12 0 v20 z" />
        </g>
      ))}
      {/* le parasol (vert, blanc, rouge) */}
      {box({ bottom: '6%', right: '2%' }, 84, 92, (
        <g transform="translate(42 24)">
          <line x1="0" y1="0" x2="0" y2="68" stroke="#78350f" strokeWidth="3" />
          <path d="M-40 6 Q0 -34 40 6 Z" fill="#16a34a" />
          <path d="M-14 -10 Q0 -30 14 -10 L8 4 L-8 4 Z" fill="#f8fafc" />
          <circle cx="0" cy="-12" r="3.5" fill="#dc2626" />
        </g>
      ))}
      {/* le château de sable */}
      {box({ bottom: '4%', left: '3%' }, 58, 50, (
        <g transform="translate(8 16)" fill="#d97706">
          <rect x="0" y="12" width="40" height="22" /><rect x="-2" y="2" width="10" height="12" /><rect x="32" y="2" width="10" height="12" />
          <rect x="15" y="-6" width="10" height="20" /><path d="M20 -16 v10" stroke="#dc2626" strokeWidth="1.5" /><path d="M20 -16 l8 3 l-8 3 z" fill="#dc2626" />
        </g>
      ))}
      {/* la serviette, le téléphone qui filme (point rouge), les tongs */}
      {box({ bottom: '3%', right: '24%' }, 80, 36, (
        <g transform="translate(4 3)">
          <rect x="0" y="0" width="72" height="30" rx="4" fill="#a855f7" opacity="0.9" />
          <rect x="0" y="9" width="72" height="5" fill="#f0abfc" />
          <rect x="48" y="4" width="13" height="22" rx="3" fill="#0f172a" />
          <circle cx="54.5" cy="9" r="2.4" fill="#ef4444" />
          <rect x="10" y="17" width="9" height="12" rx="4" fill="#f43f5e" /><rect x="22" y="17" width="9" height="12" rx="4" fill="#f43f5e" />
        </g>
      ))}
      {/* la mouette : elle passe quand le seau est rempli par le calcul */}
      {lit && box({ top: '14%', left: '38%' }, 48, 20, (
        <path d="M4 14 q10 -12 20 0 q10 -12 20 0" stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round" />
      ), { className: `absolute ${reduce ? '' : 'bf-gull'}` })}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque étape : le niveau (hauteur · rayon de la surface), le sommet (SO · k), le volume (k³ · 1 − k³ · règle). */
export function chainOf(id) {
  return ({ level: ['lvAbove', 'lvRadius'], apex: ['apexSO', 'apexK'], volume: ['kCube', 'oneMinus', 'rule'] })[id];
}

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const fx = (p) => LN.fracText(p);
const tex = (p) => LN.fracLatex(p).replace('\\dfrac', '\\frac');
const choice = (k, id, o, texts) => ({
  id, kind: 'choice', cols: 1, prompt: Cq(k, `${id}.prompt`, o),
  options: spread(texts.map(([key, why], i) => ({ text: Cq(k, `${id}.${key}`, o), correct: i === 0, why: i === 0 ? undefined : Cq(k, `${id}.${why}`, o) })), id.length),
  hints: [Cq(k, `${id}.hint1`, o), Cq(k, `${id}.hint2`, o)], explain: Cq(k, `${id}.explain`, o),
});
const num = (k, id, o, expected, answer) => ({
  id, kind: 'number', expected, answer: <MathText>{$(answer)}</MathText>,
  prompt: Cq(k, `${id}.prompt`, o), hints: [Cq(k, `${id}.hint1`, o), Cq(k, `${id}.hint2`, o)], explain: Cq(k, `${id}.explain`, o),
});

/** Chaque question est construite sur LES nombres du seau (rien n'est écrit en dur) ; `k` : les textes de `bucketFill`. */
export const QUESTIONS = {
  lvAbove: ({ nums }, k) => {
    const gap = nums.H - nums.depth;
    return num(k, 'lvAbove', { H: nums.H, gap, d: nums.depth, where: gap === 0 ? k('cp.lvAbove.atRim') : k('cp.lvAbove.below', { gap }) }, String(nums.depth), String(nums.depth));
  },
  lvRadius: ({ nums }, k) => {
    const rho = L.surfaceRadiusAt(nums, nums.depth);
    const o = { r: nums.r, R: nums.R, H: nums.H, d: nums.depth, step: $(tex(LN.div(LN.frac(nums.R - nums.r), LN.frac(nums.H)))), rho: tex(rho) };
    return num(k, 'lvRadius', o, fx(rho), tex(rho));
  },
  apexSO: ({ nums, F }, k) => {
    const o = { r: nums.r, R: nums.R, H: nums.H, a: tex(F.apex) };
    return num(k, 'apexSO', o, fx(F.apex), tex(F.apex));
  },
  apexK: ({ nums, F }, k) => {
    const sw = LN.add(F.apex, LN.frac(nums.depth));
    const o = { a: tex(F.apex), sw: tex(sw), d: nums.depth, k: tex(F.k), r: nums.r, rho: tex(F.rho) };
    return num(k, 'apexK', o, fx(F.k), tex(F.k));
  },
  kCube: ({ F }, k) => {
    const k3 = LN.mul(F.k, LN.mul(F.k, F.k));
    const o = { k: $(tex(F.k)), k3: $(tex(k3)), k1: $(tex(F.k)), k3k: $(tex(LN.mul(F.k, LN.frac(3)))) };
    return choice(k, 'kCube', o, [['cube', ''], ['one', 'whyOne'], ['three', 'whyThree']]);
  },
  oneMinus: ({ F }, k) => {
    const k3 = LN.mul(F.k, LN.mul(F.k, F.k));
    const o = { k3: $(tex(k3)), res: $(tex(LN.sub(LN.frac(1), k3))), wrong1: $(tex(LN.sub(LN.frac(1), F.k))), V1: $(F.big.latex) };
    return choice(k, 'oneMinus', o, [['right', ''], ['oneK', 'whyOneK'], ['small', 'whySmall']]);
  },
  rule: ({ options, formal }, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('dPrompt')}</MathText>, options,
    hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2')], explain: formal,
  }),
};
