import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Hammer, Undo2 } from 'lucide-react';
import { InstancedMesh, BoxGeometry, MeshStandardMaterial, Object3D, Color, Group } from 'three';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { spread } from './spaceCp';
import MovablePanel from '../primitives/MovablePanel';
import MathText from '../../components/MathText';
import SpaceFigure from '../../components/SpaceFigure';
import { cuboidPoints, cuboidFaces } from '../../components/spaceFigure';
import Stage3D, { prefersReducedMotion } from './stage3d/Stage3D';
import * as Sp from '@smarter-academy/core/arithmetic/space.js';
import { toThree } from './stage3d/spaceStage';
import { box as box3, edges as edges3, handle as handle3, setAt } from './stage3d/solids3d';
import * as L from '../logic/scaleBlocks';

/**
 * scale-blocks — LES BLOCS DE CONSTRUCTION (unité 14 « الهندسة في الفضاء », درس « التكبير والتصغير وأثره على المقادير
 * الفضائية », manuel p. 165, نشاط 6 ; la معرفة absente du scan est un ajout déclaré de la leçon).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève TIENT le rapport k : il tire la poignée orange au coin du solide image, le long de sa diagonale, dans la scène 3D
 *    (`stage.draggable` + `onLine`) — ou − / + / flèches sur le curseur « k ». Avant de bâtir, il PRÉDIT le volume du solide
 *    image (trois volumes : V × k, V × k², V × k³), puis « ابنِ » : le jeu pose les cubes, couche après couche.
 * B. Idée : dans un agrandissement / une réduction de rapport k, les longueurs sont multipliées par k, les aires par k², les
 *    volumes par k³ (k > 1 تكبير, 0 < k < 1 تصغير).
 * C. Le cadre du solide image grandit / rétrécit sous le doigt (ses arêtes écrites k·a) ; au bâti, chaque cube du pavé devient
 *    un cube d'arête k — quand k est entier, un PAQUET de k³ cubes unités de la même couleur que le cube d'origine ; le
 *    compteur flotte sur la scène ; la lecture écrit arêtes, aire totale, volume, avant / après et leur rapport.
 * D. a′ = k·a ; 𝒜′ = k²·𝒜 ; 𝒱′ = k³·𝒱 — sur le نشاط 6 : 3 ; 2,4 ; 1,8 ; 33,84 = (3/5)²·94 ; 12,96 = (3/5)³·60.
 * E. Avant la règle : deux bâtis de rapports différents (les rapports visés du niveau), chacun PRÉDIT ; au niveau du pavé, le
 *    contraste « + 1 cm partout » (6 × 5 × 4 : 6/5 ≠ 5/4 ≠ 4/3, ce n'est pas un agrandissement).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        l'effet de k sur les longueurs (k), les aires (k²), les volumes (k³)
 *   OBJECT         un pavé bâti en cubes dans un jeu de construction sur téléphone ; son image bâtie à côté
 *   VARIABLE       k (1/2, 3/5, 1, 3/2, 2, 3 — bornés par le cadre du plus grand rapport visé), puis la prédiction du volume
 *   INVARIANT      la forme (les trois arêtes ont le MÊME rapport) ; le nombre de cubes d'origine (chacun a son image, sa couleur)
 *   TRANSFORMATION les arêtes × k sous le doigt ; au bâti, chaque cube → un cube d'arête k (k³ cubes unités si k entier)
 *   CONSTRAINT     on ne bâtit pas sans prédire ; k > 0 (la poignée ne passe jamais le coin fixe)
 *   RESISTANCE     « × k » et « × k² » réfutés par le décompte : « ضربت الحجم في k² … لكن الارتفاع أيضا ضُرب في k » ;
 *                  « + 1 cm » : le cadre rose 6 × 5 × 4 et ses trois rapports différents, « ليس تكبيرا »
 *   EVIDENCE       le compteur de cubes, les couleurs des paquets (un cube → k³ cubes), la colonne « الناتج ÷ الأصلي »
 *   CONTRAST       deux rapports visés (2 et 3 ; 3/5 et 2) et, sur le pavé, « + 1 cm » (logic › discoveryReady)
 *   PREDICTION     le volume choisi AVANT le bâti ; la lecture n'écrit l'aire et le volume du solide image qu'après le bâti
 *   DISCOVERY      « الحجم يُضرب في k³ »
 *   FORMALIZATION  a′ = k × a ; 𝒜′ = k² × 𝒜 ; 𝒱′ = k³ × 𝒱 (la معرفة de la plateforme, module 2 de la leçon)
 *   TRANSFER       طرائق (k depuis deux longueurs, √ du rapport des aires, ∛ du rapport des volumes), la section d'une pyramide
 *
 * Monde (`theme`) : `voxel-blocks` — le jeu de construction : ciel, nuages et soleil pixelisés, collines en blocs, la barre
 * d'objets du jeu (DÉCOR : `aria-hidden`, `[data-deco]`, hors clavier, aucune mesure, immobile sous reduced-motion). La scène
 * 3D (Stage3D, three.js) : le sol en dalles d'herbe, le pavé de départ en cubes, le solide image (cadre + verre, puis cubes),
 * la poignée orange. Sans WebGL : le repli SpaceFigure de la même situation ; toutes les commandes sont HTML.
 * MANUEL (§6bis) : chaque bâti est un essai jugé, aucune auto-complétion.
 *
 * D'UN SEUL REGARD (§8bis) : la hauteur de la scène est budgétée sur l'écran de leçon (`useLessonViewport` moins ce que le
 * bloc `[data-sb-glance]` occupe en plus de la scène), bornée à 55 % de la hauteur (le doigt sur la scène n'empêche pas de
 * faire défiler) ; le compteur flotte sur la scène (`MovablePanel`) ; sous la scène : k, la prédiction et « ابنِ », le
 * verdict, la lecture ; la liste des bâtis dans un `LabFold` SOUS le bloc mesuré.
 *
 * Props : `dims`, `ks` — à plat ou groupés dans `numbers` (levels.js) ; `theme`, `title`, `lead`, `mission`, `level`,
 * `levels`, `onTrial(evidence)` à chaque bâti et au contraste, `onFinished({ ks })` à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-scale-blocks][data-world][data-k][data-solved], [data-sb-glance], [data-stage3d] (Stage3D),
 * [data-sb-k] (role=slider), [data-sb-less|more], [data-sb-plus][aria-pressed], [data-sb-option=k|k2|k3][aria-pressed],
 * [data-sb-build], [data-sb-verdict=<kind>], [data-sb-readings], [data-sb-ratio=length|area|volume], [data-sb-counter],
 * [data-lab-fold=scale-blocks.trials], [data-sb-trial=<verdict>], [data-deco].
 */
const NUMBER_KEYS = ['dims', 'ks'];
const tx = (s) => String(s).replace(/,/g, '{,}');
const btn = 'inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 bg-white px-2 disabled:opacity-40 focus:outline-none focus-visible:ring-2';
/** Couleurs des paquets (le cube d'origine et tous ses cubes images) et du sol. */
const PALETTE = ['#f97316', '#facc15'];
const GRASS = ['#4ade80', '#22c55e'];

/** k en LaTeX compact (\tfrac) et une longueur / aire / volume en LaTeX (« 2{,}4 »). */
const kTex = (k) => { const s = L.kText(k); return s.includes('/') ? `\\tfrac{${s.split('/')[0]}}{${s.split('/')[1]}}` : s; };
const qTex = (q) => { const s = L.decText(q); return s.includes('/') ? `\\tfrac{${s.split('/')[0]}}{${s.split('/')[1]}}` : tx(s); };

export default function ScaleBlocks(props) {
  const { numbers: grouped, theme = 'voxel-blocks', title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
    initialMode = 'student', allowModeSwitch = false, onTrial, onFinished } = props;
  const authored = useMemo(() => {
    const out = {};
    for (const key of NUMBER_KEYS) {
      const v = grouped?.[key] ?? props[key];
      if (v != null) out[key] = v;
    }
    return out;
  }, [grouped, props]); // eslint-disable-line react-hooks/exhaustive-deps
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.scaleBlocks.${key}`, o), [t]);
  const state = useManipulation({ type: 'scale-blocks', initialNumbers: authored, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numKey = JSON.stringify(NUMBER_KEYS.map((x) => nums[x] ?? null));
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${numKey}|${state.epoch}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [doneIds, setDoneIds] = useState({});
  // « إعادة » (epoch), un autre niveau ou d'autres nombres : TOUT recommence — les bâtis, les étapes et les questions du labo
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); setDoneIds({}); }

  const ready = L.discoveryReady(lab);
  const cpSettings = useLabCheckpointSettings('scale-blocks');   // obligatoires pour tout élève ; l'enseignant seul les coupe, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    state.report(onFinished, { ks: lab.ks.map(L.kText) });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const e = L.evidenceOf(lab);
    if (e) state.report(onTrial, e);
  }, [lab.n]); // eslint-disable-line react-hooks/exhaustive-deps

  const cube = L.readings(lab).cube;
  const solid = cube ? 'cube' : 'cuboid';
  // la découverte : les « pourquoi » sont écrits avec les bâtis de l'élève
  const proof = lab.builds.filter((b) => b.prediction).slice(-1)[0] ?? null;
  const proofArgs = proof ? { k: kTex(proof.k), v: qTex(proof.volume), r: qTex(L.volumeRatio(lab, proof.volume)) } : null;
  const discoveryOptions = useMemo(() => [
    { text: <MathText>{k('dOptK')}</MathText>, why: <MathText>{proofArgs ? k('dWhyK', proofArgs) : k('dWhyKPlain')}</MathText> },
    { text: <MathText>{k('dOptK2')}</MathText>, why: <MathText>{k('dWhyK2')}</MathText> },
    { text: <MathText>{k('dOptK3')}</MathText>, correct: true },
  ], [k, proofArgs?.k, proofArgs?.v]); // eslint-disable-line react-hooks/exhaustive-deps

  const r0 = L.readings(L.setK(lab, lab.ks[0]));
  const formal = (
    <div className="space-y-2" data-sb-formal>
      <EquationDisplay tone="result" tex={"a' = k \\times a"} note={k('fLength')} />
      <EquationDisplay tone="result" tex={"\\mathcal{A}' = k^2 \\times \\mathcal{A}"} note={k('fArea')} />
      <EquationDisplay tone="result" tex={"\\mathcal{V}' = k^3 \\times \\mathcal{V}"} note={k('fVolume')} />
      <EquationDisplay tone="neutral" tex={`\\mathcal{V}' = \\left(${L.kLatex(lab.ks[0])}\\right)^3 \\times ${qTex(r0.volume)} = ${qTex(r0.volume2)}`} />
      <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
    </div>
  );

  /* ── les étapes et leurs questions : chaque rapport visé bâti (puis le contraste « + 1 cm ») ouvre sa suite, dans l'ordre ── */
  const stepList = L.stepsOf(lab).map((st, i, all) => ({ ...st, chain: chainOf(st.id, i, all.length, all[all.length - 1].id) }));
  const stepDone = stepList.map((st) => !!doneIds[st.id] || (!cpLive && st.reached));
  const nextStep = cpLive ? stepList.find((st) => !doneIds[st.id]) : null;
  const cpId = nextStep && nextStep.reached ? nextStep.id : null;
  const chain = cpId ? nextStep.chain : null;
  const cp = useLabCheckpoint({
    id: cpId,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ lab, step: nextStep, options: discoveryOptions, formal }, k)) : null,
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
  if (lab.n === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  const doneKey = stepDone.join();
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: i + 1, total: stepList.length });
    });
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le son : un déclic quand k change de cran, « flag » au bâti prédit juste, « over » au bâti raté ou au cadre « + 1 cm » (pas un agrandissement),
     « bell » quand une étape est finie. Muet sauf « الصوت ». ── */
  const tick = useRef({ key: null, at: 0 });
  const kKey = L.kText(lab.k);
  useEffect(() => {
    const p = tick.current;
    if (p.key === null) { p.key = kKey; return; }
    if (p.key === kKey) return;
    p.key = kKey;
    const now = performance.now();
    if (now - p.at > 35) { playSfx('tooth'); p.at = now; }
  }, [kKey]);
  const heard = useRef(0);
  useEffect(() => {
    if (lab.n < heard.current) heard.current = 0;
    if (lab.n === 0 || lab.n === heard.current) return;
    heard.current = lab.n;
    const e = lab.last;
    playSfx(e?.kind === 'build' && (e.verdict === 'ok' || e.verdict === 'identity') ? 'flag' : 'over');
  }, [lab.n]); // eslint-disable-line react-hooks/exhaustive-deps
  const bells = useRef(0);
  useEffect(() => {
    const n = stepDone.filter(Boolean).length;
    if (n > bells.current) playSfx('bell');
    bells.current = n;
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const overlay = (
    <>
      {party.node}
      {cp.node}
      <LabStepper count={stepList.length} current={Math.max(0, stepDone.indexOf(false) < 0 ? stepList.length - 1 : stepDone.indexOf(false))} done={stepDone} stepAttr="data-sb-step" />
    </>
  );

  return (
    <ManipulationShell
      type="scale-blocks"
      title={title ?? k('title')}
      mission={mission ?? <MathText>{k(`mission_${solid}`, { d: lab.dims.map(L.kText).join(' \\times '), ks: lab.ks.map((x) => `$k = ${L.kLatex(x)}$`).join(' ثم ') })}</MathText>}
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
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white" minHeight="min-h-[150px]">
        <Blocks lab={lab} setLab={setLab} k={k} theme={theme} solved={ready} formal={state.isFormal} overlay={overlay} />
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── la mesure : largeur du bloc ; hauteur = écran de leçon − ce que le bloc glance prend en plus de la scène ── */
function useBudget(min, max) {
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const drawnH = useRef(300);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(260);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(150, Math.ceil(glanceRef.current.getBoundingClientRect().height) - drawnH.current));
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
  const budget = Math.round(Math.max(min, Math.min(max, screenH * 0.55, screenH - overhead - 24)));
  return { boxRef, glanceRef, drawnH, width, budget };
}

function Blocks({ lab, setLab, k, theme, solved, formal, overlay }) {
  const { boxRef, glanceRef, drawnH, width, budget } = useBudget(170, 420);
  const H = budget;
  drawnH.current = H;
  const narrow = width < 380;
  const sceneRef = useRef(null);
  const rd = L.readings(lab);
  const opts = L.options(lab);
  const built = lab.built;
  const kIndex = lab.list.findIndex((x) => x.n === lab.k.n && x.d === lab.k.d);

  // le compteur suit le jeu qui pose les cubes (la scène rappelle `onReveal`)
  const [shown, setShown] = useState(0);
  const layout = useMemo(() => (built ? L.blockLayout(lab.dims, built.k) : null), [built, lab.dims]);
  const total = layout ? layout.cubes.length : 0;
  useEffect(() => { setShown(prefersReducedMotion() ? total : 0); }, [built?.i]); // eslint-disable-line react-hooks/exhaustive-deps
  const onK = useCallback((kk) => setLab((s) => L.setK(s, kk)), [setLab]);

  const scene3d = useMemo(() => ({
    dims: lab.dims.map((d) => d.n / d.d), k: lab.k.n / lab.k.d, list: lab.list.map((x) => x.n / x.d),
    buildId: built ? built.i : null, layout, plus: lab.plus, frame: L.frameSize(lab), fracs: lab.list,
  }), [lab.dims, lab.k, lab.list, built, layout, lab.plus]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (dir, big = false) => setLab((s) => L.stepK(s, dir * (big ? 2 : 1)));
  const onSliderKey = (e) => {
    const more = ['ArrowRight', 'ArrowUp', 'PageUp'].includes(e.key);
    const less = ['ArrowLeft', 'ArrowDown', 'PageDown'].includes(e.key);
    if (more || less) { e.preventDefault(); set(more ? 1 : -1, e.shiftKey || e.key.startsWith('Page')); }
    if (e.key === 'Home') { e.preventDefault(); onK(lab.list[0]); }
    if (e.key === 'End') { e.preventDefault(); onK(lab.list[lab.list.length - 1]); }
  };

  const verdict = verdictOf(lab);
  const dimsTex = (ds) => ds.map(qTex).join(' \\;;\\; ');

  return (
    <div ref={boxRef} className="relative space-y-2" data-scale-blocks data-world={theme} data-k={L.kText(lab.k)} data-solved={solved ? 'true' : 'false'}>
      {overlay}
      <div ref={glanceRef} className="space-y-1.5" data-sb-glance>
        <div ref={sceneRef} className="relative overflow-hidden rounded-2xl border border-sky-200" style={{ height: H }}>
          <VoxelDecor reduce={prefersReducedMotion()} hotbar={H >= 230} />
          <Stage3D
            build={(stage) => buildScene(stage, { onK, onReveal: setShown })}
            state={scene3d}
            fallback={<SpaceFigure {...fallbackFigure(lab)} maxWidth={Math.min(width, Math.round(H * 1.6))} />}
            view={{ azimuth: -58, elevation: 24, distance: 14 }}
            ariaLabel={k('sceneLabel', { d: lab.dims.map(L.kText).join(' × '), k: L.kText(lab.k) })}
            style={{ height: H }}
          />
          {/* le compteur flotte sur la scène ; sous 380 px la scène est trop basse : la ligne « الحجم » de la lecture le remplace */}
          {!narrow && (
            <MovablePanel id="scale-blocks.counter" bounds={sceneRef} title={k('counterTitle')} className="absolute right-1 top-1">
              <Counter lab={lab} built={built} layout={layout} shown={shown} k={k} />
            </MovablePanel>
          )}
        </div>

        {/* k : − [k] + — le contraste « + 1 cm » (pavé seulement) — la prédiction et « ابنِ » */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <div className="flex items-center gap-1.5" dir="ltr">
            <button type="button" onClick={() => set(-1)} disabled={kIndex <= 0} aria-label={k('less')} data-sb-less className={`${btn} border-orange-300 focus-visible:ring-orange-500`}><Minus className="h-4 w-4" aria-hidden="true" /></button>
            <div role="slider" tabIndex={0} aria-label={k('slider')} aria-valuemin={0} aria-valuemax={lab.list.length - 1} aria-valuenow={Math.max(0, kIndex)}
              aria-valuetext={k('sliderText', { k: L.kText(lab.k) })} onKeyDown={onSliderKey} data-sb-k={L.kText(lab.k)}
              className={`flex h-11 ${narrow ? 'min-w-[4.75rem] px-2 text-sm' : 'min-w-[6.5rem] px-3 text-base'} items-center justify-center rounded-full bg-orange-100 font-mono font-extrabold text-orange-900 outline-none focus-visible:ring-4 focus-visible:ring-orange-300`}>
              <MathText>{`$k = ${kTex(lab.k)}$`}</MathText>
            </div>
            <button type="button" onClick={() => set(1)} disabled={kIndex >= lab.list.length - 1} aria-label={k('more')} data-sb-more className={`${btn} border-orange-300 focus-visible:ring-orange-500`}><Plus className="h-4 w-4" aria-hidden="true" /></button>
          </div>
          {!rd.cube && (
            <button type="button" onClick={() => setLab(L.plusOne)} aria-pressed={lab.plus ? 'true' : 'false'} aria-label={k(lab.plus ? 'plusOffSr' : 'plusOnSr')} data-sb-plus
              className={`inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 ${narrow ? 'px-2' : 'px-3'} text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${lab.plus ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-rose-300 bg-white text-rose-700'}`}>
              {lab.plus ? <Undo2 className="h-4 w-4" aria-hidden="true" /> : !narrow && <Plus className="h-4 w-4" aria-hidden="true" />}
              <span aria-hidden="true"><MathText>{lab.plus ? k(narrow ? 'plusOffShort' : 'plusOff') : k(narrow ? 'plusOnShort' : 'plusOn')}</MathText></span>
            </button>
          )}

        </div>

        {opts && !lab.plus && (
          <div className="flex flex-wrap items-center justify-center gap-1.5" role="group" aria-label={k('predictLabel')} data-sb-predict>
            <span className={narrow ? 'sr-only' : 'text-sm font-bold text-slate-700'}>{k('predictLabel')}</span>
            <div className={`flex flex-wrap justify-center ${narrow ? 'gap-1' : 'gap-1.5'}`}>
              {opts.map((o) => (
                <button key={o.id} type="button" onClick={() => setLab((s) => L.predict(s, o.id))} aria-pressed={lab.prediction === o.id ? 'true' : 'false'} data-sb-option={o.id}
                  className={`inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 ${narrow ? 'px-1.5 text-xs' : 'px-2.5 text-sm'} font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${lab.prediction === o.id ? 'border-indigo-700 bg-indigo-600 text-white shadow' : 'border-indigo-200 bg-white text-indigo-900'}`}>
                  <MathText>{narrow ? `$${qTex(o.value)}$` : `$${qTex(o.value)}\\,\\mathrm{cm}^3$`}</MathText>
                </button>
              ))}
            </div>
            <BuildButton lab={lab} setLab={setLab} k={k} narrow={narrow} />
          </div>
        )}

        <Verdict verdict={verdict} lab={lab} k={k} narrow={narrow} />
        <Readings lab={lab} rd={rd} built={built} k={k} dimsTex={dimsTex} formal={formal} narrow={narrow} />
      </div>
      {lab.n > 0 && (
        <LabFold id="scale-blocks.trials" title={k('trialsTitle')}>
          <ul className="flex flex-wrap gap-1.5 text-xs" data-sb-trials={lab.builds.length}>
            {lab.builds.map((b) => (
              <li key={b.i} className={`rounded-lg border px-2 py-0.5 ${b.verdict === 'ok' || b.verdict === 'identity' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`} data-sb-trial={b.verdict}>
                <MathText>{k(`trial_${b.verdict}`, { k: kTex(b.k), p: b.predicted ? qTex(b.predicted) : '', v: qTex(b.volume) })}</MathText>
              </li>
            ))}
            {lab.plusTried && (
              <li className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-0.5 text-rose-900" data-sb-trial="plus">
                <MathText>{k('trial_plus', { d: lab.dims.map(qTex).join(' \\times '), i: L.plusReading(lab.dims).image.map(qTex).join(' \\times ') })}</MathText>
              </li>
            )}
          </ul>
        </LabFold>
      )}
    </div>
  );
}

function BuildButton({ lab, setLab, k, narrow }) {
  const can = L.canBuild(lab);
  return (
    <button type="button" onClick={() => setLab(L.build)} disabled={can !== true} data-sb-build
      className={`inline-flex h-11 items-center gap-1.5 rounded-xl border-2 border-emerald-700 bg-emerald-600 ${narrow ? 'px-2.5' : 'px-4'} text-sm font-extrabold text-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400`}>
      <Hammer className="h-4 w-4" aria-hidden="true" /> {k('build')}
    </button>
  );
}

/** Le verdict (une seule ligne vivante) : départ, choisir, prêt, juste, refusé (× k, × k²), « + 1 cm ». */
function verdictOf(lab) {
  if (lab.plus) return 'plus';
  if (lab.built) return lab.built.verdict;
  if (lab.k.n === lab.k.d) return lab.builds.length ? 'back' : 'start';
  return lab.prediction ? 'ready' : 'choose';
}

function Verdict({ verdict, lab, k, narrow }) {
  const b = lab.built;
  const args = {
    k: kTex(lab.k),
    p: b?.predicted ? qTex(b.predicted) : lab.prediction ? qTex(L.volumes(lab)[lab.prediction]) : '',
    v: b ? qTex(b.volume) : '',
    r: b ? qTex(L.volumeRatio(lab, b.volume)) : '',
  };
  if (verdict === 'plus') {
    const p = L.plusReading(lab.dims);
    Object.assign(args, { d: p.dims.map(qTex).join(' \\times '), i: p.image.map(qTex).join(' \\times '), q: p.ratios.map((x) => `\\tfrac{${x.n}}{${x.d}}`).join(' \\;;\\; ') });
  }
  const tone = ['ok', 'identity'].includes(verdict) ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
    : ['k', 'k2', 'plus'].includes(verdict) ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-slate-200 bg-white text-slate-700';
  return (
    <p className={`rounded-xl border-2 ${narrow ? 'px-2 py-1 text-xs leading-snug' : 'px-3 py-1.5 text-sm'} ${tone}`} aria-live="polite" data-sb-verdict={verdict}>
      <MathText>{k((narrow && ['start', 'choose'].includes(verdict)) ? `v_${verdict}Short` : `v_${verdict}`, args)}</MathText>
    </p>
  );
}

/** La lecture : arêtes (vivantes), aire totale et volume (après le bâti), et le rapport image ÷ départ. */
function Readings({ lab, rd, built, k, dimsTex, formal, narrow }) {
  const size = narrow ? 'text-[11px] leading-tight' : 'text-sm';
  const show = !!built && !lab.plus;
  if (lab.plus) {
    const p = L.plusReading(lab.dims);
    return (
      <div className={`overflow-hidden rounded-xl border border-rose-200 bg-white ${size}`} data-sb-readings="plus">
        <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-2 border-b border-rose-100 bg-rose-50 px-2 py-0.5 font-bold text-rose-700">
          <span />
          <span>{k('colOriginal')}</span>
          <span>{k('colPlus')}</span>
          <span>{k(narrow ? 'colRatioShort' : 'colRatio')}</span>
        </div>
        <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-2 px-2 py-1" data-sb-row="length">
          <span className="font-bold text-slate-700">{k('rowEdges')}</span>
          <span className="text-slate-600"><MathText>{`$${dimsTex(p.dims)}\\,\\mathrm{cm}$`}</MathText></span>
          <span className="font-bold text-rose-800"><MathText>{`$${dimsTex(p.image)}\\,\\mathrm{cm}$`}</MathText></span>
          <span className="font-bold text-rose-800" data-sb-ratio="plus"><MathText>{`$${p.ratios.map(qTexFrac).join(' \\;;\\; ')}$`}</MathText></span>
        </div>
      </div>
    );
  }
  const rowsOf = () => [
    { id: 'length', label: k(rd.cube ? 'rowEdge' : 'rowEdges'), a: rd.cube ? qTex(rd.dims[0]) : dimsTex(rd.dims), b: rd.cube ? qTex(rd.dims2[0]) : dimsTex(rd.dims2), r: qTexFrac(rd.ratio.length), name: 'k', live: true, unit: '\\mathrm{cm}' },
    { id: 'area', label: k('rowArea'), a: qTex(rd.area), b: qTex(rd.area2), r: qTexFrac(rd.ratio.area), name: 'k^2', unit: '\\mathrm{cm}^2' },
    { id: 'volume', label: k('rowVolume'), a: qTex(rd.volume), b: qTex(rd.volume2), r: qTexFrac(rd.ratio.volume), name: 'k^3', unit: '\\mathrm{cm}^3' },
  ];
  const rows = rowsOf();
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white ${size}`} data-sb-readings>
      <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-2 border-b border-slate-100 bg-slate-50 px-2 py-0.5 font-bold text-slate-500">
        <span />
        <span>{k('colOriginal')}</span>
        <span>{k('colImage')}</span>
        <span>{k(narrow ? 'colRatioShort' : 'colRatio')}</span>
      </div>
      {rows.map((row) => {
        const visible = row.live || show;
        return (
          <div key={row.id} className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-2 px-2 py-0.5" data-sb-row={row.id}>
            <span className="font-bold text-slate-700">{row.label}{narrow && <> <MathText>{`$(${row.unit})$`}</MathText></>}</span>
            <span className="text-slate-600"><MathText>{narrow ? `$${row.a}$` : `$${row.a}\\,${row.unit}$`}</MathText></span>
            <span className="font-bold text-indigo-900"><MathText>{visible ? (narrow ? `$${row.b}$` : `$${row.b}\\,${row.unit}$`) : '؟'}</MathText></span>
            <span className="font-bold text-orange-800" data-sb-ratio={row.id}>
              <MathText>{visible ? `$${formal ? `${row.name} = ` : ''}${row.r}$` : '؟'}</MathText>
            </span>
          </div>
        );
      })}
    </div>
  );
}
const qTexFrac = (q) => (q.d === 1 ? String(q.n) : `\\tfrac{${q.n}}{${q.d}}`);

/** Le compteur flottant : les cubes posés (unités) ou les cubes d'arête k ; « ؟ » avant le bâti. */
function Counter({ lab, built, layout, shown, k, narrow }) {
  const text = !built || !layout || lab.plus ? k('counterEmpty')
    : built.k.d === 1 ? k('counterUnit', { count: shown })
      : k('counterBlocks', { count: shown, s: qTex(built.k) });
  return (
    <div className={`px-2 py-1 ${narrow ? 'max-w-[9.5rem]' : 'max-w-[13rem]'} text-xs font-bold text-slate-800`} data-sb-counter={built ? shown : ''}>
      <span aria-hidden="true">🧱 </span><MathText>{text}</MathText>
      {built && <span className="sr-only">{k('counterDone', { v: L.decText(built.volume) })}</span>}
      <span className="hidden">{lab.n}</span>
    </div>
  );
}

/* ═══════════════════════════════ LA SCÈNE 3D (three.js, sur le kit stage3d) ═══════════════════════════════ */

/** Le repli sans WebGL : le pavé de départ et son image (rapport courant) côte à côte, SpaceFigure. */
function fallbackFigure(lab) {
  const [a, b, c] = lab.dims.map((d) => d.n / d.d);
  const kk = lab.k.n / lab.k.d;
  const gap = Math.max(1, a * 0.4);
  const P = { ...cuboidPoints('ABCDEFGH', { length: a, width: b, height: c }), ...cuboidPoints('IJKLMNOP', { length: a * kk, width: b * kk, height: c * kk, origin: [a + gap, 0, 0] }) };
  return {
    kind: 'space', view: { azimuth: -58, elevation: 24 }, points: P,
    solids: [{ type: 'polyhedron', faces: cuboidFaces('ABCDEFGH'), tone: 'amber' }, { type: 'polyhedron', faces: cuboidFaces('IJKLMNOP'), tone: 'indigo' }],
    hidden: Object.keys(P), ariaLabel: 'متوازي مستطيلات ومجسمه الناتج بالنسبة k جنبا إلى جنب',
  };
}

/** Un nuage de cubes (InstancedMesh) : positions = coin minimal, arête `size`, couleurs par paquet, assombries vers le bas. */
function makeCubes(cubes, size, origin, maxLayer) {
  const geo = new BoxGeometry(size * 0.9, size * 0.9, size * 0.9);
  const mat = new MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 });
  const mesh = new InstancedMesh(geo, mat, Math.max(1, cubes.length));
  const o = new Object3D();
  const col = new Color();
  cubes.forEach((cb, idx) => {
    o.position.copy(toThree([origin[0] + cb.at[0] + size / 2, origin[1] + cb.at[1] + size / 2, origin[2] + cb.at[2] + size / 2]));
    o.updateMatrix();
    mesh.setMatrixAt(idx, o.matrix);
    col.set(PALETTE[cb.cluster]);
    col.multiplyScalar(0.78 + 0.22 * (maxLayer ? cb.layer / maxLayer : 1));
    mesh.setColorAt(idx, col);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.count = cubes.length;
  return mesh;
}

/**
 * Construit la scène (une fois) : sol en dalles d'herbe, le pavé de départ en cubes (à gauche), le solide image (cadre +
 * verre, à droite, ancré à son coin), la poignée au coin opposé (glissée le long de la diagonale), le cadre « + 1 cm ».
 * Rend `{ update(state), dispose() }`.
 */
function buildScene(stage, { onK, onReveal }) {
  let dims = null; let anchor = null; let fitted = null;
  let original = null; let ground = null; let image = null; let lastBuild = null; let stopAnim = null;
  const frame = edges3(box3([1, 1, 1], { opacity: 0.2 }), { color: '#4338ca', opacity: 0.95 });
  const glassBox = box3([1, 1, 1], { color: '#a5b4fc', opacity: 0.16 });
  const plusFrame = edges3(box3([1, 1, 1], { opacity: 0.2 }), { color: '#e11d48', opacity: 1 });
  let grip = null;
  const labels = new Group();
  stage.add(glassBox); stage.add(frame); stage.add(plusFrame); stage.add(labels);
  const lab = { ax: stage.label('', [0, 0, 0], { color: '#3730a3', size: 13, background: 'rgba(255,255,255,0.85)' }),
    by: stage.label('', [0, 0, 0], { color: '#3730a3', size: 13, background: 'rgba(255,255,255,0.85)' }),
    cz: stage.label('', [0, 0, 0], { color: '#3730a3', size: 13, background: 'rgba(255,255,255,0.85)' }),
    o: stage.label('', [0, 0, 0], { color: '#9a3412', size: 12, background: 'rgba(255,255,255,0.8)' }) };
  Object.values(lab).forEach((l) => labels.add(l));
  let current = { k: 1, list: [1] };
  let undrag = null;

  const place = (obj, size, at) => { setAt(obj, at); obj.scale.set(size[0], size[2], size[1]); };
  const fmt = (x) => String(Math.round(x * 1000) / 1000).replace('.', ',');

  const dragHandlers = {
    move: ({ onLine }) => {
      if (!dims) return;
      const len = Math.hypot(...dims);
      const t = onLine(anchor, dims) / len;
      if (!Number.isFinite(t)) return;
      let best = current.list[0]; let gap = Infinity;
      for (const x of current.list) { const g = Math.abs(x - t); if (g < gap) { gap = g; best = x; } }
      if (best !== current.k) onK(fracOf(best, current));
    },
  };

  /** Le monde visible : le pavé de départ, l'écart, et le plus grand solide image du niveau. */
  function bounds(state) {
    const [a, b, c] = state.dims;
    const [fa, fb, fc] = state.frame;
    const ax = a + Math.max(1.2, fa * 0.18);
    return { min: [-0.4, -0.4, -0.2], max: [ax + fa + 0.4, Math.max(fb, b) + 0.4, Math.max(fc, c) + 0.3] };
  }
  /** La caméra cadre exactement ce monde (projection des huit coins), vue fixe (−58°, 24°). */
  function fit(state) {
    const { min, max } = bounds(state);
    const target = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
    const az = (-58 * Math.PI) / 180; const el = (24 * Math.PI) / 180;
    const d = [Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el)];
    const u = [-Math.sin(az), Math.cos(az), 0];
    const v = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
    const dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
    const tanV = Math.tan((stage.camera.fov * Math.PI) / 360);
    const tanH = tanV * stage.camera.aspect;
    let D = 1;
    for (const x of [min[0], max[0]]) for (const y of [min[1], max[1]]) for (const z of [min[2], max[2]]) {
      const q = [x - target[0], y - target[1], z - target[2]];
      D = Math.max(D, dot(q, d) + Math.abs(dot(q, u)) / tanH, dot(q, d) + Math.abs(dot(q, v)) / tanV);
    }
    const view = { azimuth: -58, elevation: 24, distance: D * 1.04 };
    stage.options.view = view; stage.options.target = target;
    stage.setView(view, target);
    fitted = { aspect: stage.camera.aspect, key: state.frame.join(',') };
  }

  function rebuildStatic(state) {
    stage.remove(original); stage.remove(ground);
    const [a, b, c] = state.dims;
    const [fa, fb] = state.frame;
    anchor = [a + Math.max(1.2, fa * 0.18), 0, 0];
    const lay = L.blockLayout(state.dims, 1);
    original = makeCubes(lay.cubes, 1, [0, 0, 0], c - 1);
    stage.add(original);
    // le sol : des dalles d'herbe en damier sous les deux solides
    const W = Math.ceil(anchor[0] + fa + 0.5); const D = Math.ceil(Math.max(fb, b) + 0.5);
    const tiles = [];
    for (let j = 0; j < D; j += 1) for (let i = 0; i < W; i += 1) tiles.push({ at: [i, j], cluster: (i + j) % 2 });
    const geo = new BoxGeometry(1, 0.2, 1);
    const mat = new MeshStandardMaterial({ roughness: 0.9 });
    ground = new InstancedMesh(geo, mat, tiles.length);
    const o = new Object3D(); const col = new Color();
    tiles.forEach((tl, idx) => {
      o.position.copy(toThree([tl.at[0] + 0.5, tl.at[1] + 0.5, -0.11])); o.updateMatrix();
      ground.setMatrixAt(idx, o.matrix); col.set(GRASS[tl.cluster]); ground.setColorAt(idx, col);
    });
    ground.instanceMatrix.needsUpdate = true;
    if (ground.instanceColor) ground.instanceColor.needsUpdate = true;
    stage.add(ground);
    lab.o.element.textContent = `${fmt(a)} × ${fmt(b)} × ${fmt(c)}`;
    lab.o.position.copy(toThree([a / 2, -0.2, c + 0.45]));
  }

  function update(state) {
    if (!state) return;
    const dimsKey = state.dims.join(',');
    if (!dims || dims.join(',') !== dimsKey) {
      dims = state.dims; rebuildStatic(state); fitted = null;
      // la poignée : une bille orange, à la taille du monde (cible ≥ 44 px : la scène la dessine assez grande)
      if (grip) { undrag?.(); stage.remove(grip); }
      const [fa, fb, fc] = state.frame;
      grip = handle3([0, 0, 0], { radius: Math.min(0.42, Math.max(0.14, 0.032 * Math.hypot(fa, fb, fc))), color: '#f97316' });
      stage.add(grip);
      undrag = stage.draggable(grip, dragHandlers);
    }
    if (!fitted || fitted.key !== state.frame.join(',') || Math.abs(fitted.aspect - stage.camera.aspect) > 0.15) fit(state);
    current = state;
    const s = dims.map((d) => d * state.k);
    place(frame, s, anchor); place(glassBox, s, anchor);
    glassBox.visible = !state.buildId && !state.plus;
    frame.visible = !state.plus;
    setAt(grip, [anchor[0] + s[0], anchor[1] + s[1], anchor[2] + s[2]]);
    grip.visible = !state.plus;
    const p = dims.map((d) => d + 1);
    place(plusFrame, p, anchor);
    plusFrame.visible = !!state.plus;
    const show = state.plus ? p : s;
    lab.ax.element.textContent = fmt(show[0]); lab.ax.position.copy(toThree([anchor[0] + show[0] / 2, -0.35, 0]));
    lab.by.element.textContent = fmt(show[1]); lab.by.position.copy(toThree([anchor[0] + show[0] + 0.35, show[1] / 2, 0]));
    lab.cz.element.textContent = fmt(show[2]); lab.cz.position.copy(toThree([anchor[0] + show[0] + 0.3, -0.15, show[2] / 2]));
    [lab.ax, lab.by, lab.cz].forEach((l) => { l.element.style.color = state.plus ? '#be123c' : '#3730a3'; });

    if (state.buildId !== lastBuild) {
      lastBuild = state.buildId;
      stopAnim?.(); stopAnim = null;
      stage.remove(image); image = null;
      if (state.buildId && state.layout) {
        const sorted = [...state.layout.cubes].sort((u, v) => u.at[2] - v.at[2] || u.at[1] - v.at[1] || u.at[0] - v.at[0]);
        const maxLayer = Math.max(1, ...sorted.map((cb) => cb.at[2]));
        image = makeCubes(sorted.map((cb) => ({ ...cb, layer: cb.at[2] })), state.layout.size, anchor, maxLayer);
        stage.add(image);
        if (prefersReducedMotion()) { onReveal(sorted.length); } else {
          image.count = 0;
          const n = sorted.length; const ms = Math.min(1600, 500 + n * 3); let t0 = null; let lastShown = -1;
          stopAnim = stage.animate((time) => {
            if (t0 === null) t0 = time;
            const shown = Math.min(n, Math.ceil(((time - t0) / ms) * n));
            image.count = shown;
            if (shown !== lastShown) { lastShown = shown; onReveal(shown); }
            return shown < n;
          });
        }
      }
    }
    if (image) image.visible = !state.plus;
    stage.requestRender();
    markHandle();
  }

  /** La position À L'ÉCRAN de la poignée (pixels, relative à la scène) : `data-sb-handle` — pour l'e2e qui la tire au doigt. */
  function markHandle() {
    if (!grip) return;
    stage.camera.updateMatrixWorld();
    const v = grip.position.clone().project(stage.camera);
    const w = stage.container.clientWidth; const h = stage.container.clientHeight;
    stage.container.dataset.sbHandle = `${Math.round(((v.x + 1) / 2) * w)},${Math.round(((1 - v.y) / 2) * h)}`;
  }
  stage.controls.addEventListener('change', markHandle);

  // un écran tourné / redimensionné : la caméra recadre le monde (seulement si la forme de la fenêtre a vraiment changé)
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => requestAnimationFrame(() => {
    if (current.frame && fitted && Math.abs(fitted.aspect - stage.camera.aspect) > 0.15) fit(current);
    markHandle();
  })) : null;
  ro?.observe(stage.container);

  return {
    update,
    dispose() { stopAnim?.(); ro?.disconnect(); },
  };
}

/** Le rapport de la liste (fraction) qui correspond à un réel de la liste numérique. */
function fracOf(x, state) {
  const i = state.list.indexOf(x);
  return state.fracs?.[i] ?? x;
}

/* ═══════════════════════════════ LE DÉCOR (aria-hidden) ═══════════════════════════════ */

/** Le jeu de construction : ciel, soleil et nuages pixelisés, collines en blocs, la barre d'objets. Aucune mesure. */
function VoxelDecor({ reduce, hotbar = true }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false" data-deco="voxel-blocks">
      <defs>
        <linearGradient id={`sb-sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="0.7" stopColor="#e0f2fe" />
          <stop offset="1" stopColor="#f0fdf4" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#sb-sky-${uid})`} />
      {/* soleil carré */}
      <rect x="330" y="18" width="34" height="34" fill="#fde047" />
      <rect x="336" y="24" width="22" height="22" fill="#facc15" />
      {/* nuages en blocs */}
      <g fill="#ffffff" opacity="0.9" className={reduce ? undefined : 'sb-drift'}>
        <rect x="40" y="30" width="56" height="12" /><rect x="52" y="22" width="28" height="10" />
        <rect x="180" y="46" width="44" height="10" /><rect x="190" y="38" width="20" height="9" />
      </g>
      {/* collines en blocs, au loin */}
      <g opacity="0.55">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <rect key={i} x={i * 40} y={150 - ((i * 37) % 5) * 9} width="40" height="100" fill={i % 2 ? '#86efac' : '#a7f3d0'} />
        ))}
      </g>
      {/* la barre d'objets du jeu (9 cases), en bas */}
      {hotbar && <g transform="translate(110 214)" opacity="0.75">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <g key={i} transform={`translate(${i * 20} 0)`}>
            <rect width="18" height="18" fill="#1e293b" opacity="0.55" stroke={i === 4 ? '#ffffff' : '#475569'} strokeWidth={i === 4 ? 2 : 1} />
            {i < 4 && <rect x="4" y="4" width="10" height="10" fill={[PALETTE[0], PALETTE[1], GRASS[1], '#a16207'][i]} />}
          </g>
        ))}
      </g>}
      <style>{'@keyframes sb-drift{from{transform:translateX(0)}to{transform:translateX(18px)}}.sb-drift{animation:sb-drift 9s ease-in-out infinite alternate}@media (prefers-reduced-motion: reduce){.sb-drift{animation:none}}'}</style>
    </svg>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque étape : la 1re (arête · aire), les suivantes (arête · volume) ; la dernière finit par la RÈGLE (le contraste « + 1 cm » du pavé, ou le volume du cube). */
export function chainOf(id, index, total, lastId) {
  if (id === 'plus') return ['plusRatio', 'rule'];
  if (id === lastId) return total === 1 ? ['edge', 'area', 'vol', 'rule'] : ['vol', 'rule'];
  return index === 0 ? ['edge', 'area'] : ['edge', 'vol'];
}

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const num = (k, id, o, expected, answer) => ({
  id, kind: 'number', expected, answer: <MathText>{$(answer)}</MathText>,
  prompt: Cq(k, `${id}.prompt`, o), hints: [Cq(k, `${id}.hint1`, o), Cq(k, `${id}.hint2`, o)], explain: Cq(k, `${id}.explain`, o),
});

/** Chaque question est construite sur LES rapports et les dimensions de l'élève (rien n'est écrit en dur) ; `k` : les textes de `scaleBlocks`. */
export const QUESTIONS = {
  edge: ({ lab, step }, k) => {
    const g = L.scaledAt(lab, step.k);
    const o = { k: $(kTex(step.k)), a: $(qTex(g.edge0)), a2: $(qTex(g.edge1)) };
    return num(k, 'edge', o, L.kText(g.edge1), qTex(g.edge1));
  },
  area: ({ lab, step }, k) => {
    const g = L.scaledAt(lab, step.k);
    const dims = Sp.scaleAll(lab.dims, step.k).map((d) => qTex(d)).join(' \\times ');
    const o = { k: $(kTex(step.k)), dims: $(dims), A: $(qTex(g.area0)), A2: $(qTex(g.area1)) };
    return num(k, 'area', o, L.kText(g.area1), qTex(g.area1));
  },
  vol: ({ lab, step }, k) => {
    const g = L.scaledAt(lab, step.k);
    const dims = Sp.scaleAll(lab.dims, step.k).map((d) => qTex(d)).join(' \\times ');
    const o = { k: $(kTex(step.k)), dims: $(dims), V: $(qTex(g.vol0)), V2: $(qTex(g.vol1)) };
    return num(k, 'vol', o, L.kText(g.vol1), qTex(g.vol1));
  },
  plusRatio: ({ lab, step }, k) => {
    const r = step.trial.ratios.map((x) => $(qTex(x)));
    const o = { a: $(qTex(lab.dims[0])), b: $(qTex(lab.dims[1])), c: $(qTex(lab.dims[2])), r1: r[0], r2: r[1], r3: r[2] };
    return {
      id: 'plusRatio', kind: 'choice', cols: 1, prompt: Cq(k, 'plusRatio.prompt', o),
      options: spread([
        { text: Cq(k, 'plusRatio.no', o), correct: true },
        { text: Cq(k, 'plusRatio.yes', o), why: Cq(k, 'plusRatio.whyYes', o) },
        { text: Cq(k, 'plusRatio.bigger', o), why: Cq(k, 'plusRatio.whyBigger', o) },
      ], 1),
      hints: [Cq(k, 'plusRatio.hint1', o), Cq(k, 'plusRatio.hint2', o)], explain: Cq(k, 'plusRatio.explain', o),
    };
  },
  rule: ({ options, formal }, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('dPrompt')}</MathText>, options,
    hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2')], explain: formal,
  }),
};
