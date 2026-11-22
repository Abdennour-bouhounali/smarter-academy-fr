import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import * as L from '../logic/trigCalculator';

/**
 * trig-calculator — LA CALCULATRICE DU DRONE (unité 10 « حساب المثلثات في المثلث القائم », درس « استعمال الحاسبة
 * لحساب النسب المثلثية وتعيين قياس زاوية » : نشاط 4 p. 117, معارف 3 p. 120).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève TAPE de vraies séquences de touches sur une calculatrice dessinée (ON, DRG, 2nd, sin / cos / tan,
 *    chiffres, =) — au doigt, à la souris ou au clavier physique —, puis il fait GLISSER un trait de coupe sur
 *    les chiffres de l'écran (la précision) et décide « أحتفظ بالرقم » ou « أضيف 1 ».
 * B. Idée : une calculatrice RÉGLÉE EN DEGRÉS donne une valeur approchée du rapport d'un angle connu (sin 54 =) ;
 *    les touches INVERSES (2nd puis sin⁻¹ …) donnent l'angle dont on connaît un rapport ; on ARRONDIT ensuite à la
 *    précision demandée (le chiffre suivant ≥ 5 : on ajoute 1).
 * C. La nacelle de la caméra du drone s'incline de l'angle calculé : le drone se déplace sur un arc autour de sa
 *    cible (le faisceau, l'hypoténuse, garde sa longueur), son altitude (l'opposé) et sa distance au sol
 *    (l'adjacent) changent ; le côté que le nombre de l'écran PRÉTEND est dessiné par-dessus — il coïncide (vert)
 *    ou il dépasse, voire passe sous le sol (rouge).
 * D. L'écran (10 chiffres, `screen()`), la valeur arrondie écrite dans le tableau du نشاط 4, la ligne de l'angle
 *    aux trois précisions ; la ligne de lecture dit ce que mesure le dessin.
 * E. Avant la règle : la calculatrice part en mode R (radians) — sin 30 = −0,988 que le dessin contredit —, il faut
 *    changer d'unité ; à l'étape des angles, sin 0,52 (sans 2nd) fait raser le sol au drone ; un même écran arrondi
 *    à trois précisions donne trois réponses (31,33 / 31,3 / 31).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        la calculatrice en degrés : angle → rapport (sin, cos, tan) ; rapport → angle (sin⁻¹ …) ; l'arrondi
 *   OBJECT         une calculatrice scientifique dessinée (touches ≥ 44 px, LTR) et le drone qui filme la Corniche
 *   VARIABLE       la séquence de touches (unité D / R, fonction directe ou inverse, le nombre) ; la position du trait
 *                  de coupe (0 à 4 chiffres après la virgule) et la décision garder / ajouter 1
 *   INVARIANT      dans le triangle du drone, le rapport de deux côtés ne dépend que de l'angle (la longueur du
 *                  faisceau ne change rien) ; l'aller-retour sin(sin⁻¹ v) = v
 *   TRANSFORMATION la nacelle s'incline, le drone glisse sur son arc, le côté prétendu par l'écran se dessine
 *   CONSTRAINT     une case du tableau ne s'écrit que si le calcul est fait en D, sur un angle du tableau, puis
 *                  ARRONDI correctement ; un angle de l'étape 2 ne s'écrit que par la touche inverse de son rapport
 *   RESISTANCE     mode R : refusé, le côté prétendu (−0,988 × faisceau) passe sous le sol ; sin 0,52 sans 2nd :
 *                  refusé, le drone (0,52°) rase le sol sous la ligne-cible ; cos⁻¹ pour un sinus : refusé ;
 *                  sin⁻¹ 1,33 : « خطأ رياضي » ; garder 0,80 quand le 9 suit : refusé (troncature) ; trait ailleurs que la
 *                  précision demandée : refusé
 *   EVIDENCE       l'écran et le dessin qui coïncident ; le tableau rempli par l'élève ; trois arrondis d'un même écran
 *   CONTRAST       R contre D (la calculatrice démarre en R) ; directe contre inverse ; trois précisions
 *   PREDICTION     le dessin montre déjà « à peu près » le rapport (le faisceau, la hauteur) : l'élève voit si l'écran
 *                  est plausible avant de l'arrondir
 *   DISCOVERY      « on programme la calculatrice en degrés, puis fonction, angle, = » ; « pour l'angle : 2nd puis
 *                  sin⁻¹ (ou cos⁻¹, tan⁻¹), puis on arrondit à la précision demandée »
 *   FORMALIZATION  les séquences du manuel ON sin 54 = ; ON 2nd sin⁻¹ 0,4 = ; l'arrondi au centième, au dixième, à l'unité
 *   TRANSFER       معارف 3, ex. 3 (mesurer puis calculer 40°), ex. 7 (écrire le programme), ex. 8, 11, 23 (Leila et Rida)
 *
 * Monde (`theme`) : `drone` — un drone filme la Corniche (la mer, la promenade, un ballon au sol : la cible).
 * Manuel (§6bis) : chaque calcul et chaque arrondi est un essai jugé ; aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire, jeunes Algériens de la génération Alpha) : les hélices tournent, le voyant
 * d'enregistrement clignote, les mouettes passent, toucher le drone allume ses feux. `aria-hidden`, `[data-deco]`,
 * hors du chemin clavier, jamais une information (aucun nombre), immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : le bloc mesuré `[data-tc-glance]` = la scène + la calculatrice (écran, trait de coupe,
 * touches) + les deux décisions + les tâches de l'étape 2 + la ligne de lecture ; la scène est budgétée sur l'écran
 * de leçon (`useLessonViewport` moins ce que le bloc occupe en plus du dessin). Large : scène et calculatrice côte à
 * côte ; étroit : la scène au-dessus, plus basse. Le tableau du نشاط 4 et la ligne des angles sont dans des
 * `LabFold` SOUS le bloc mesuré (matériel secondaire).
 *
 * Props : `angles` (le tableau), `inverse` ({ sin, cos, tan } : l'étape 2, متقدم), `digits` (la précision du tableau),
 * `theme`, `title`, `lead`, `mission`, `level`, `levels`, `onTrial(evidence)` à chaque essai jugé, `onFinished(evidence)`
 * à la règle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-trig-calculator][data-stage=table|inverse][data-mode=RAD|DEG][data-solved], [data-tc-glance],
 * [data-tc-key=<touche>] (boutons), [data-tc-screen], [data-tc-expr], [data-tc-result], [data-tc-mode-flag],
 * [data-tc-cut-handle] (role=slider), [data-tc-keep], [data-tc-up], [data-tc-verdict=<kind>], [data-tc-task=<kind>],
 * [data-tc-next], [data-tc-back], [data-tc-cell="<angle>|<kind>"], [data-tc-scene][data-agrees], [data-deco],
 * [data-lab-fold=trig-calculator.table|trig-calculator.angles].
 */
const KEY_ARIA = {
  '2nd': 'k2nd', DRG: 'kDrg', sin: 'kSin', cos: 'kCos', tan: 'kTan', DEL: 'kDel', ON: 'kOn', '=': 'kEq', ',': 'kComma',
};
const TONES = {
  rose: 'bg-rose-50 text-rose-900', emerald: 'bg-emerald-50 text-emerald-900', sky: 'bg-sky-50 text-sky-900', slate: 'bg-slate-50 text-slate-800',
};
const tex = (s) => String(s).replace(',', '{,}');
const iso = (x) => `\u2066${x}\u2069`;
const fnTex = (fn) => (fn ? `\\${fn.kind}${fn.inverse ? '^{-1}' : ''}` : '');

export default function TrigCalculator({
  angles: angles0 = [30, 45, 60], inverse: inverse0 = null, digits: digits0 = 2, theme = 'drone', title, lead, mission, level,
  levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.trigCalculator.${key}`, o), [t]);
  const state = useManipulation({
    type: 'trig-calculator', initialNumbers: { angles: angles0, inverse: inverse0, digits: digits0 }, initialMode, initialLevel: level, withLevels, hintCount: 3,
  });
  const { angles, inverse, digits } = state.numbers;
  const make = () => L.initLab({ angles, inverse, digits });
  const [lab, setLab] = useState(make);
  const sceneKey = `${JSON.stringify([angles, inverse, digits])}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [liveCut, setLiveCut] = useState(null);
  const [inits, setInits] = useState(0);
  const [doneIds, setDoneIds] = useState([]);
  // « إعادة », un autre niveau ou d'autres nombres : TOUT recommence — le tableau, les angles, les questions et les fêtes
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setLiveCut(null); setInits((n) => n + 1); setDoneIds([]); }

  /* ── les questions pendant le labo (primitives/LabCheckpoint) : une suite par étape, posée PAR-DESSUS le labo ── */
  const cpSettings = useLabCheckpointSettings('trig-calculator');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpId = cpOn && cpSettings.enabled ? (lab.stage === 'inverse' ? 'inv' : 'tbl') : null;
  const cpReached = cpId === 'inv' ? L.inverseReady(lab) : L.tableReady(lab);
  const ruleByCheckpoint = cpOn && cpSettings.enabled;
  const cp = useLabCheckpoint({
    id: cpId,
    questions: cpId && cpReached ? chainFor(lab, cpId).map((q) => QUESTIONS[q](lab, k)) : null,
    reached: cpReached,
    resetKey: inits,
    onRetry: () => setLab(L.restartStage),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => (d.includes(id) ? d : [...d, id]));
      if (chainFor(lab, id).includes('rule')) { state.discover(); state.formalize(); }
    },
  });

  const ready = L.discoveryReady(lab) && !ruleByCheckpoint;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, L.evidenceOf(lab)); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (lab.n > 0) state.report(onTrial, L.evidenceOf(lab)); }, [lab.n]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur ; hauteur de scène = écran de leçon − ce que le bloc glance prend en plus ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const sceneHRef = useRef(150);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(380);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(240, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(150, Math.ceil(glanceRef.current.getBoundingClientRect().height) - sceneHRef.current));
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
  const wide = width >= 600;
  const avail = width;
  const calcW = wide ? 300 : Math.min(avail, 360);
  const sceneW = wide ? width - calcW - 12 : avail;
  const sceneH = wide
    ? Math.round(Math.max(230, Math.min(340, screenH - 230)))
    : Math.round(Math.max(92, Math.min(200, screenH - overhead - 16)));
  sceneHRef.current = wide ? 0 : sceneH;
  const narrow = width < 380;

  /* ── les gestes ── */
  const lastTick = useRef(0);
  const act = useCallback((key) => {
    const now = performance.now();
    if (now - lastTick.current > 35) { playSfx('tooth', { pitch: key === 'DEL' || key === 'ON' ? 0.75 : 1 }); lastTick.current = now; }
    setLab((s) => L.key(s, key));
  }, []);
  const onCalcKey = (e) => {
    const map = { Enter: '=', '=': '=', Backspace: 'DEL', Escape: 'ON', '.': ',', ',': ',' };
    const keyName = /^[0-9]$/.test(e.key) ? e.key : map[e.key];
    if (!keyName) return;
    e.preventDefault();
    act(keyName);
  };
  const pending = lab.pending;
  const shownCut = liveCut ?? lab.cut;
  const result = lab.calc.result;
  const screenStr = result?.status === 'ok' ? result.screen : null;
  const cutSt = useStretchInteraction({
    value: shownCut ?? L.MAX_CUT, range: { min: 0, max: L.MAX_CUT }, direction: 'ltr', pageStep: 1,
    toValue: (cx, _cy, rect) => {
      const s = padded(screenStr ?? '0', L.MAX_CUT);
      const cw = rect.width / Math.max(1, s.length);
      const intLen = s.indexOf(',') < 0 ? s.length : s.indexOf(',');
      const b = (cx - rect.left) / cw; // nombre de caractères à gauche du trait
      return b <= intLen + 0.5 ? 0 : b - intLen - 1;
    },
    onChange: (v) => setLiveCut(v),
    onCommit: (v) => { setLiveCut(null); setLab((s) => L.setCut(s, v)); },
  });

  /* ── les étapes (1 : le tableau ; 2 : les angles, متقدم), la fête, le son ── */
  const nSteps = L.hasInverse(lab) ? 2 : 1;
  const stepDone = [cpId ? doneIds.includes('tbl') : L.tableReady(lab), cpId ? doneIds.includes('inv') : L.inverseReady(lab)].slice(0, nSteps);
  const steps = <LabStepper count={nSteps} current={lab.stage === 'inverse' ? 1 : 0} done={stepDone} stepAttr="data-tc-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.n === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: i + 1, total: nSteps });
    });
  }, [stepDone[0], stepDone[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : un tic par touche (ci-dessus), `flag` quand un arrondi est accepté, `over` quand la calculatrice ou l'arrondi est refusé, `bell` quand une étape est complète
  const tr = lab.trials[lab.trials.length - 1];
  useEffect(() => {
    if (!tr) return;
    if (tr.type === 'refused') playSfx('over'); else playSfx('flag');
  }, [lab.n]); // eslint-disable-line react-hooks/exhaustive-deps
  const stageReady = L.tableReady(lab) || L.inverseReady(lab);
  useEffect(() => { if (stageReady) playSfx('bell'); }, [stageReady, lab.stage]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la lecture ── */
  const sc = L.sceneOf(lab);
  const last = lab.last;
  const kindWord = (kind) => k(`name_${kind}`);
  const possWord = (kind) => k(`poss_${kind}`);
  const precName = (cut) => k(`prec_${cut}`);
  const verdictKind = last?.kind ?? (lab.stage === 'inverse' ? 'inverseStart' : 'start');
  const tone = {
    rad: 'rose', radInverse: 'rose', forgot2nd: 'rose', wrongKind: 'rose', domain: 'rose', precision: 'rose', truncate: 'rose', overRound: 'rose',
    cell: 'emerald', angle: 'emerald', roundTrip: 'emerald', toRound: 'sky', toRoundAngle: 'sky',
  }[verdictKind] ?? 'slate';
  const SHORT = ['toRound', 'toRoundAngle', 'rad', 'radInverse', 'forgot2nd', 'truncate', 'start', 'inverseStart'];
  const kv = (name, o) => k(narrow && SHORT.includes(name.slice(1, 2).toLowerCase() + name.slice(2)) ? `${name}Short` : name, o);
  const verdictText = (() => {
    const v = last ?? {};
    const f = fnTex(v.fn);
    switch (verdictKind) {
      case 'mode': return k(v.mode === 'DEG' ? 'vModeDeg' : 'vModeRad');
      case 'syntax': return kv('vSyntax');
      case 'number': return kv('vNumber');
      case 'domain': return kv('vDomain', { f, x: tex(L.dec(v.x)), poss: possWord(v.fn.kind) });
      case 'rad': return kv('vRad', { f, x: tex(L.dec(v.x)), screen: tex(v.screen), drawn: tex(v.expectedScreen.slice(0, 6)) });
      case 'radInverse': return kv('vRadInverse', { f, x: tex(L.dec(v.x)), screen: tex(v.screen), poss: possWord(v.fn.kind) });
      case 'toRound': return kv('vToRound', { f, x: tex(L.dec(v.x)), screen: tex(v.screen), prec: precName(lab.digits) });
      case 'offTable': return kv('vOffTable', { f, x: tex(L.dec(v.x)), screen: tex(v.screen) });
      case 'angleInTable': return kv('vAngleInTable', { f, x: tex(L.dec(v.x)), screen: tex(v.screen) });
      case 'forgot2nd': return kv('vForgot2nd', { f, x: tex(L.dec(v.x)), screen: tex(v.screen), name: kindWord(v.fn.kind), poss: possWord(v.fn.kind) });
      case 'wrongKind': return kv('vWrongKind', { f, x: tex(L.dec(v.x)), poss: possWord(v.fn.kind), taskPoss: possWord(v.task.kind) });
      case 'noTask': return kv('vNoTask', { f, x: tex(L.dec(v.x)), screen: tex(v.screen) });
      case 'direct': return kv('vDirect', { f, x: tex(L.dec(v.x)), screen: tex(v.screen) });
      case 'roundTrip': return kv('vRoundTrip', { f, x: tex(L.dec(v.x)), screen: tex(v.screen), target: tex(L.dec(v.task.value)) });
      case 'toRoundAngle': return kv('vToRoundAngle', { x: tex(L.dec(v.x)), screen: tex(v.screen), poss: possWord(v.fn.kind) });
      case 'noCut': return kv('vNoCut');
      case 'precision': return kv('vPrecision', { need: v.need.length === 1 ? precName(v.need[0]) : k('precThree') });
      case 'truncate': return kv('vTruncate', { next: v.next, truncated: tex(v.truncated) });
      case 'overRound': return kv('vOverRound', { next: v.next });
      case 'cell': return kv('vCell', { f: `\\${v.ratio}`, x: v.angle, rounded: tex(v.rounded) });
      case 'angle': return kv('vAngle', { rounded: tex(v.rounded), prec: precName(v.cut) });
      case 'inverseStart': return kv('vInverseStart');
      default: return kv('vStart');
    }
  })();
  const drawnLine = !narrow && sc.drawn != null && sc.kind && ['rad', 'radInverse', 'toRound', 'offTable', 'forgot2nd', 'toRoundAngle', 'direct', 'roundTrip', 'wrongKind', 'noTask'].includes(verdictKind)
    ? k(sc.inverse ? 'drawnReadsX' : 'drawnReads', { name: kindWord(sc.kind), x: tex(L.dec(Math.round(sc.angle * 100) / 100)), drawn: tex(L.dec(Math.round(sc.drawn * 100) / 100)) })
    : null;

  /* ── la découverte : distracteurs réfutés par les essais de l'élève ── */
  const discoveryOptions = useMemo(() => discoveryOptionsOf(lab, k), [lab, k]);

  const formal = formalOf(lab, k);

  /* ── la calculatrice ── */
  const shift = lab.calc.shift;
  const expr = L.exprText(lab.calc);
  const errorMsg = result?.status === 'error' ? k('screenMathError') : result?.status === 'syntax' ? k('screenSyntaxError') : null;
  const canDecide = !!pending && lab.cut != null && liveCut == null;
  const keyLabel = (key) => (shift && ['sin', 'cos', 'tan'].includes(key) ? L.INV_LABEL[key] : key);
  const keyTone = (key) => {
    if (key === '2nd') return shift ? 'bg-amber-400 text-slate-900 border-amber-500' : 'bg-amber-100 text-amber-900 border-amber-300';
    if (key === 'DRG') return 'bg-sky-100 text-sky-900 border-sky-300';
    if (['sin', 'cos', 'tan'].includes(key)) return 'bg-slate-700 text-white border-slate-800';
    if (key === '=') return 'bg-indigo-600 text-white border-indigo-700';
    if (key === 'ON' || key === 'DEL') return 'bg-rose-100 text-rose-900 border-rose-300';
    return 'bg-white text-slate-900 border-slate-300';
  };
  const keyH = narrow ? 'h-11' : 'h-12';

  /* ── la scène du drone ── */
  const sceneSvg = <DroneScene w={sceneW} h={sceneH} sc={sc} k={k} />;

  const backBtn = (
    <button type="button" onClick={() => setLab((s) => L.backToTable(s))} data-tc-back aria-label={k('backToTable')}
      className={`min-h-[44px] rounded-xl border-2 border-slate-200 bg-white ${narrow ? 'px-0.5 text-lg' : 'px-3 text-sm'} font-bold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}>
      {narrow ? '↩' : k('backToTable')}
    </button>
  );
  /* ── étape 2 : les trois tâches (choisir celle qu'on vise) ; passage d'une étape à l'autre ── */
  const tasks = lab.stage === 'inverse' && (
    <div className={narrow ? 'grid grid-cols-4 gap-1' : 'flex flex-wrap items-center justify-center gap-1.5'} data-tc-tasks>
      {lab.tasks.map((tk) => {
        const n = L.taskDone(lab, tk.kind);
        const on = lab.active === tk.kind;
        return (
          <button key={tk.kind} type="button" onClick={() => setLab((s) => L.setActive(s, tk.kind))} data-tc-task={tk.kind} aria-pressed={on}
            className={`min-h-[44px] rounded-xl border-2 ${narrow ? 'px-0.5 text-[10px] leading-tight' : 'px-2 text-sm'} font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${on ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white text-slate-700'}`}>
            {narrow
              ? <span className="flex flex-col items-center"><MathText>{`$\\${tk.kind} x$`}</MathText><MathText>{`$${tex(L.dec(tk.value))}$`}</MathText></span>
              : <MathText>{`$\\${tk.kind} x = ${tex(L.dec(tk.value))}$`}</MathText>}
            <span className={narrow ? 'block text-[10px]' : 'ms-1 text-xs'} aria-label={k('taskProgress', { n })}>{['•', '•', '•'].map((d, i) => <span key={i} className={i < n ? 'text-emerald-600' : 'text-slate-300'}>{d}</span>)}</span>
          </button>
        );
      })}
      {narrow && backBtn}
    </div>
  );
  const stageNav = L.hasInverse(lab) && (lab.stage === 'table'
    ? (L.tableReady(lab) && !cp.blocking && (
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-2 py-1 text-sm" data-tc-next-card>
        {!narrow && <span className="text-indigo-950">{k('nextCard')}</span>}
        <button type="button" onClick={() => setLab((s) => L.openInverse(s))} data-tc-next
          className="min-h-[44px] rounded-xl bg-indigo-600 px-3 font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">{k('toAngles')}</button>
      </div>
    ))
    : (!narrow && <div className="flex justify-center">{backBtn}</div>));

  const decisions = (
      <div className="mt-1.5 grid grid-cols-2 gap-1.5" dir="rtl">
        <button type="button" disabled={!canDecide} onClick={() => setLab((s) => L.decide(s, 'keep'))} data-tc-keep
          className="min-h-[44px] rounded-xl border-2 border-emerald-300 bg-emerald-50 px-1 text-sm font-extrabold text-emerald-900 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
          {k('keep')}
        </button>
        <button type="button" disabled={!canDecide} onClick={() => setLab((s) => L.decide(s, 'up'))} data-tc-up
          className="min-h-[44px] rounded-xl border-2 border-amber-300 bg-amber-50 px-1 text-sm font-extrabold text-amber-900 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
          {k('up')}
        </button>
      </div>
  );
  // Téléphone de 320 px : une seule rangée sous l'écran sert, selon le moment, aux deux décisions de l'arrondi (un
  // résultat attend), aux trois tâches + retour (étape des angles) ou au passage « إلى الزوايا » — même hauteur.
  const tinySlot = !narrow || pending ? null
    : lab.stage === 'inverse' ? tasks
      : (L.hasInverse(lab) && L.tableReady(lab) ? stageNav : null);
  const calculator = (
    <div className="rounded-3xl border-2 border-slate-700 bg-slate-800 p-2 shadow-lg" style={{ width: calcW, maxWidth: '100%' }}
      role="group" aria-label={k('calcLabel')} onKeyDown={onCalcKey} dir="ltr" data-tc-calculator>
      {/* l'écran : unité, 2nd, expression, résultat ; le trait de coupe sur les chiffres */}
      <div className="rounded-xl bg-[#C7D9B8] px-2 pt-1 pb-1.5 font-mono text-slate-900" data-tc-screen aria-live="polite">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="flex items-center gap-1.5">
            <span className={`rounded px-1 ${lab.calc.mode === 'RAD' ? 'bg-rose-700 text-white' : 'bg-slate-900 text-[#C7D9B8]'}`} data-tc-mode-flag={lab.calc.mode} aria-label={k(lab.calc.mode === 'DEG' ? 'modeDegAria' : 'modeRadAria')}>
              {lab.calc.mode === 'DEG' ? 'D' : 'R'}
            </span>
            {shift && <span className="rounded bg-amber-500 px-1 text-slate-900" aria-label={k('shiftAria')}>2nd</span>}
          </span>
          <span className="truncate text-sm" data-tc-expr>{expr || ' '}</span>
        </div>
        <div className="relative flex min-h-[2.4rem] items-end justify-end">
          {errorMsg ? (
            <span className="text-base font-bold" dir="rtl" data-tc-result="error">{errorMsg}</span>
          ) : screenStr ? (
            <ScreenLine s={screenStr} cut={shownCut} st={pending ? cutSt : null} label={k('cutHandle')}
              valueText={k('cutValueText', { prec: precName(shownCut ?? L.MAX_CUT) })} big={!narrow} placed={lab.cut != null || liveCut != null} />
          ) : (
            <span className={`${narrow ? 'text-xl' : 'text-2xl'} font-bold opacity-40`} data-tc-result="">0</span>
          )}
        </div>
      </div>
      {tinySlot ? <div className="mt-1.5" dir="rtl">{tinySlot}</div> : decisions}
      {/* le clavier (5 colonnes, 4 sur un téléphone de 320 px ; « = » sur deux rangées) */}
      <div className="mt-1.5 grid grid-cols-5 gap-1">
        {L.keyGrid(L.KEY_ROWS).map(({ key, row, col, span }) => (
          <button key={key} type="button" onClick={() => act(key)} data-tc-key={key}
            aria-label={KEY_ARIA[key] ? k(shift && ['sin', 'cos', 'tan'].includes(key) ? `${KEY_ARIA[key]}Inv` : KEY_ARIA[key]) : key}
            aria-pressed={key === '2nd' ? shift : undefined}
            className={`${span > 1 ? 'h-full' : keyH} min-w-[44px] rounded-xl border-2 font-mono text-base font-extrabold shadow-sm active:translate-y-px focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${keyTone(key)}`}
            style={{ gridRow: `${row} / span ${span}`, gridColumn: `${col}` }}>
            {['sin', 'cos', 'tan'].includes(key) ? (
              <span className="flex flex-col items-center leading-none">
                <span className="text-[9px] font-bold text-amber-300">{L.INV_LABEL[key]}</span>
                <span>{keyLabel(key)}</span>
              </span>
            ) : key}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <ManipulationShell
      type="trig-calculator"
      title={title ?? k('title')}
      mission={mission ?? <MathText>{k(L.hasInverse(lab) ? (lab.stage === 'inverse' ? 'missionInverse' : 'missionTableAdv') : 'mission')}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={!!cpId}
      hints={(lab.stage === 'inverse' ? ['hintI1', 'hintI2', 'hintI3'] : ['hint1', 'hint2', 'hint3']).map((hk) => <MathText key={hk}>{k(hk)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={<MathText>{k(L.hasInverse(lab) ? 'dPromptInverse' : 'dPrompt')}</MathText>} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/70 to-white" minHeight="min-h-[150px]">
        <div ref={boxRef} className="relative space-y-2" data-trig-calculator data-world={theme} data-stage={lab.stage} data-mode={lab.calc.mode}
          data-solved={ready ? 'true' : 'false'}>
          {party.node}
          {cp.node}
          <div ref={glanceRef} className="space-y-1.5" data-tc-glance>
            {steps}
            <div className={wide ? 'flex items-start justify-center gap-3' : 'flex flex-col items-center gap-1.5'}>
              {sceneSvg}
              {calculator}
            </div>
            {!narrow && tasks}
            <p role="status" className={`min-h-[2.5rem] rounded-xl px-2 py-1 ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug ${TONES[tone]}`} data-tc-verdict={verdictKind}>
              <MathText>{verdictText}</MathText>
              {drawnLine && <span className="block text-[0.92em] font-semibold text-slate-700"><MathText>{drawnLine}</MathText></span>}
            </p>
            {!narrow && stageNav}
          </div>

          <LabFold id="trig-calculator.table" title={k('tableTitle', { prec: precName(lab.digits) })}>
            <div className="overflow-x-auto" dir="ltr">
              <table className="mx-auto border-collapse text-center text-sm" data-tc-table>
                <thead>
                  <tr>
                    <th className="border border-slate-200 bg-slate-50 px-1.5 py-1" dir="rtl">{k('colAngle')}</th>
                    {lab.angles.map((a) => <th key={a} className="border border-slate-200 bg-slate-50 px-1.5 py-1 font-mono"><MathText>{`$${a}^{\\circ}$`}</MathText></th>)}
                  </tr>
                </thead>
                <tbody>
                  {L.KINDS.map((kind) => (
                    <tr key={kind}>
                      <th className="border border-slate-200 bg-slate-50 px-1.5 py-1" dir="rtl">{kindWord(kind)}</th>
                      {lab.angles.map((a) => {
                        const c = L.cellOf(lab, a, kind);
                        return (
                          <td key={a} className={`border border-slate-200 px-1.5 py-1 font-mono ${c ? 'bg-emerald-50 font-bold text-emerald-900' : 'text-slate-300'}`} data-tc-cell={`${a}|${kind}`}>
                            {c ? <MathText>{`$${tex(c.rounded)}$`}</MathText> : '…'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LabFold>
          {L.hasInverse(lab) && lab.stage === 'inverse' && (
            <LabFold id="trig-calculator.angles" title={k('anglesTitle')}>
              <table className="mx-auto border-collapse text-center text-sm" data-tc-angles>
                <thead>
                  <tr>
                    <th className="border border-slate-200 bg-slate-50 px-1.5 py-1" aria-label={k('colRatio')} />
                    {L.PRECISIONS.map((p) => <th key={p} className="border border-slate-200 bg-slate-50 px-1.5 py-1">{precName(p)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {lab.tasks.map((tk) => (
                    <tr key={tk.kind}>
                      <th className="border border-slate-200 bg-slate-50 px-1.5 py-1"><MathText>{`$\\${tk.kind} x = ${tex(L.dec(tk.value))}$`}</MathText></th>
                      {L.PRECISIONS.map((p) => {
                        const v = lab.inv[tk.kind]?.[p];
                        return <td key={p} className={`border border-slate-200 px-1.5 py-1 font-mono ${v ? 'bg-emerald-50 font-bold text-emerald-900' : 'text-slate-300'}`} data-tc-angle={`${tk.kind}|${p}`}>{v ? <MathText>{`$${tex(v)}^{\\circ}$`}</MathText> : '…'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}


/* ══════════════ La découverte et la règle (aussi la dernière question de la suite) ══════════════ */

export function discoveryOptionsOf(lab, k) {
    if (!L.hasInverse(lab)) {
      const rad = lab.rad;
      const any = Object.values(lab.cells)[0];
      return [
        { text: <MathText>{k('dOptAnyMode')}</MathText>, why: <MathText>{rad ? k('dWhyAnyMode', { f: fnTex(rad.fn), x: tex(L.dec(rad.x)), screen: tex(rad.screen), drawn: tex(rad.expectedScreen.slice(0, 6)) }) : k('dWhyAnyModeNone')}</MathText> },
        { text: <MathText>{k('dOptRight')}</MathText>, correct: true },
        { text: <MathText>{k('dOptExact')}</MathText>, why: <MathText>{any ? k('dWhyExact', { f: `\\${any.kind}`, x: any.angle, screen: tex(any.screen), rounded: tex(any.rounded) }) : k('dWhyExactNone')}</MathText> },
      ];
    }
    const task = lab.tasks[0];
    return [
      { text: <MathText>{k('dOptDirect', { x: tex(L.dec(task.value)) })}</MathText>, why: <MathText>{k('dWhyDirect', { x: tex(L.dec(task.value)), screen: tex(L.evaluate({ fn: { kind: task.kind, inverse: false }, entry: L.dec(task.value), mode: 'DEG' }).screen) })}</MathText> },
      { text: <MathText>{k('dOptRatioIsAngle', { x: tex(L.dec(task.value)) })}</MathText>, why: <MathText>{k('dWhyRatioIsAngle', { x: tex(L.dec(task.value)), angle: tex(lab.inv[task.kind]?.[2] ?? lab.inv[task.kind]?.[1] ?? lab.inv[task.kind]?.[0] ?? '') })}</MathText> },
      { text: <MathText>{k('dOptInverse', { x: tex(L.dec(task.value)) })}</MathText>, correct: true },
    ];
}

export function formalOf(lab, k) {
  return (
    <div className="space-y-2" data-tc-formal>
      {L.hasInverse(lab) ? (
        <>
          {lab.tasks.map((tk) => (
            <div key={tk.kind} className="flex flex-wrap items-center gap-2 text-sm">
              <Keys seq={['ON', '2nd', L.INV_LABEL[tk.kind], L.dec(tk.value), '=']} />
              <MathText>{`$x \\approx ${tex(lab.inv[tk.kind]?.[2] ?? '…')}^{\\circ} \\approx ${tex(lab.inv[tk.kind]?.[1] ?? '…')}^{\\circ} \\approx ${tex(lab.inv[tk.kind]?.[0] ?? '…')}^{\\circ}$`}</MathText>
            </div>
          ))}
          <p className="text-sm text-emerald-900"><MathText>{k('fRuleInverse')}</MathText></p>
        </>
      ) : (
        <>
          {Object.values(lab.cells).slice(0, 3).map((c) => (
            <div key={`${c.angle}${c.kind}`} className="flex flex-wrap items-center gap-2 text-sm">
              <Keys seq={['ON', c.kind, String(c.angle), '=']} />
              <MathText>{`$\\${c.kind} ${c.angle}^{\\circ} \\approx ${tex(c.rounded)}$`}</MathText>
            </div>
          ))}
          <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
        </>
      )}
    </div>
  );
}

/** L'écran complété de zéros (invisibles sur une vraie calculatrice) jusqu'à `max + 1` décimales. */
function padded(s, max) {
  const [i, f = ''] = s.split(',');
  return `${i},${f.padEnd(max + 1, '0')}`;
}

/**
 * La ligne du résultat. Sans arrondi en attente : l'écran tel quel. Avec : les chiffres complétés de zéros pâles
 * (police à chasse fixe), les chiffres gardés (noirs), le chiffre suivant (ambre), le reste (pâle), et le trait de
 * coupe ✂ — une poignée `role=slider` posée ENTRE deux chiffres (piste = la ligne elle-même).
 */
function ScreenLine({ s, cut, st, label, valueText, big, placed }) {
  const cls = `${big ? 'text-2xl' : 'text-xl'} font-bold`;
  if (!st) return <span className={cls} style={{ fontVariantNumeric: 'tabular-nums' }} data-tc-result={s}>{s}</span>;
  const shown = padded(s, L.MAX_CUT);
  const commaAt = shown.indexOf(',');
  const c = cut ?? L.MAX_CUT;
  const boundary = c === 0 ? commaAt : commaAt + 1 + c; // caractères à gauche du trait
  const real = s.length;
  const chars = shown.split('').map((ch, i) => {
    let tone = '';
    if (cut != null) {
      if (i === commaAt && c === 0) tone = 'opacity-35';
      else if (i >= boundary) tone = (i === boundary || (c === 0 && i === commaAt + 1)) ? 'text-amber-700' : 'opacity-35';
    }
    if (i >= real) tone += ' opacity-40';
    return <span key={i} className={tone}>{ch}</span>;
  });
  return (
    <span {...st.trackProps} className={`relative inline-block select-none ${cls}`} style={{ ...st.trackProps.style, fontVariantNumeric: 'tabular-nums' }} data-tc-result={s}>
      {chars}
      <span {...st.handleProps({ label, valueText })} data-tc-cut-handle={cut ?? ''}
        className={`absolute -top-1.5 flex h-11 w-11 -translate-x-1/2 justify-center rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${placed ? '' : 'opacity-60'}`}
        style={{ left: `${boundary}ch`, cursor: st.dragging ? 'grabbing' : 'grab' }}>
        <span aria-hidden="true" className="block h-full w-[3px] rounded bg-rose-600" />
        <span aria-hidden="true" className="absolute -top-2 text-xs leading-none text-rose-700">✂</span>
      </span>
    </span>
  );
}

/** Une suite de touches de la calculatrice, en code LTR. */
function Keys({ seq }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1" dir="ltr">
      {seq.map((kk, i) => <code key={`${kk}${i}`} className="rounded-md border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-bold text-slate-800">{kk}</code>)}
    </span>
  );
}

/** Le drone qui filme la Corniche : la nacelle à l'angle calculé, le triangle (faisceau, altitude, sol), le côté prétendu. */
function DroneScene({ w, h, sc, k }) {
  const reduce = useReducedMotion();
  const [lights, setLights] = useState(false);
  const idle = sc.angle == null; // avant tout calcul : le triangle du drone à un angle x quelconque, sans nombre
  const g = L.droneGeometry(idle ? 35 : sc.angle, { width: w, height: h });
  const [T, D, H] = [g.T, g.D, g.H];
  const yG = g.groundY;
  const textP = { style: { direction: 'ltr', unicodeBidi: 'isolate' }, fontFamily: 'ui-monospace, monospace' };
  const arP = { style: { direction: 'rtl' } };
  const ang = g.angle;
  const s = Math.max(10, Math.min(22, w / 20)); // taille du drone (décor : sa POSITION seule est mathématique)
  // le côté que l'écran PRÉTEND (sc.claimed), dessiné à partir du triangle réel
  let ghost = null;
  if (sc.kind && sc.claimed != null && Number.isFinite(sc.claimed)) {
    const c = Math.max(-1.6, Math.min(2.4, sc.claimed));
    if (sc.kind === 'sin') ghost = { x1: H[0] + 7, y1: yG, x2: H[0] + 7, y2: yG - c * g.L };
    if (sc.kind === 'cos') ghost = { x1: T[0], y1: yG + 6, x2: T[0] + c * g.L, y2: yG + 6 };
    if (sc.kind === 'tan') ghost = { x1: H[0] + 7, y1: yG, x2: H[0] + 7, y2: yG - Math.max(-2, Math.min(4, sc.claimed)) * (H[0] - T[0]) };
  }
  const agree = sc.agrees;
  const ghostColor = agree ? '#059669' : '#E11D48';
  const arcR = Math.min(28, g.L * 0.22);
  const rad = (ang * Math.PI) / 180;
  const arcEnd = [T[0] + arcR * Math.cos(rad), T[1] - arcR * Math.sin(rad)];
  const target = sc.target;
  return (
    <div className="relative shrink-0" style={{ width: w, height: h }} data-tc-scene data-agrees={agree == null ? '' : String(agree)}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 rounded-2xl" style={{ direction: 'ltr' }} role="img"
        aria-label={idle || sc.inverse ? k('sceneIdle') : k('sceneLabel', { x: L.dec(Math.round(ang * 100) / 100) })}>
        <defs>
          <linearGradient id="tc-sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#BAE6FD" /><stop offset="1" stopColor="#F0F9FF" /></linearGradient>
        </defs>
        <rect x={0} y={0} width={w} height={yG} fill="url(#tc-sky)" />
        <SeaDeco w={w} yG={yG} reduce={reduce} />
        <rect x={0} y={yG} width={w} height={h - yG} fill="#FDE68A" />
        <line x1={0} x2={w} y1={yG} y2={yG} stroke="#B45309" strokeWidth={2} />
        {/* la cible (un ballon sur la promenade) */}
        <g aria-hidden="true"><circle cx={T[0]} cy={yG - 5} r={5} fill="#FFFFFF" stroke="#0F172A" strokeWidth={1.2} /><path d={`M${T[0] - 3} ${yG - 7} l3 2 l3 -2`} stroke="#0F172A" fill="none" strokeWidth={0.8} /></g>
          <g data-tc-triangle={idle ? 'idle' : 'live'}>
            {/* le triangle : faisceau (hypoténuse), altitude (opposé), sol (adjacent) */}
            <polygon points={`${T[0]},${T[1]} ${D[0]},${D[1]} ${H[0]},${H[1]}`} fill="#FDE68A" opacity={0.35} />
            <line x1={T[0]} y1={T[1]} x2={D[0]} y2={D[1]} stroke="#D97706" strokeWidth={2.4} strokeDasharray="6 4" />
            <line x1={D[0]} y1={D[1]} x2={H[0]} y2={H[1]} stroke="#0284C7" strokeWidth={2} strokeDasharray="3 3" />
            <path d={`M${H[0] - 8} ${yG} v-8 h8`} fill="none" stroke="#334155" strokeWidth={1.2} />
            <path d={`M${T[0] + arcR} ${T[1]} A${arcR} ${arcR} 0 0 0 ${arcEnd[0]} ${arcEnd[1]}`} fill="none" stroke="#7C3AED" strokeWidth={1.8} />
            <text x={T[0] + arcR + 4} y={T[1] - 4} fontSize={11} fontWeight="bold" fill="#5B21B6" {...textP}>{idle || sc.inverse ? 'x' : `${L.dec(Math.round(ang * 100) / 100)}°`}</text>
            {g.L > 90 && (
              <>
                <text x={(T[0] + D[0]) / 2 - 6} y={(T[1] + D[1]) / 2 - 6} fontSize={10} fill="#92400E" textAnchor="end" {...arP}>{k('sideHyp')}</text>
                {D[1] < yG - 24 && <text x={H[0] - 4} y={(D[1] + yG) / 2} fontSize={10} fill="#075985" textAnchor="end" {...arP}>{k('sideOpp')}</text>}
                {H[0] - T[0] > 50 && <text x={(T[0] + H[0]) / 2 + 10} y={yG + 14} fontSize={10} fill="#78350F" textAnchor="middle" {...arP}>{k('sideAdj')}</text>}
              </>
        )}
            {ghost && <line {...ghost} stroke={ghostColor} strokeWidth={agree ? 4 : 3} strokeDasharray={agree ? undefined : '5 3'} opacity={0.9} data-tc-ghost={agree ? 'agrees' : 'contradicts'} />}
          </g>
        {/* la cible de l'étape 2 : la hauteur (sin) ou la distance au sol (cos) que la nacelle doit donner */}
        {target && target.kind === 'sin' && <line x1={0} x2={w} y1={yG - target.value * g.L} y2={yG - target.value * g.L} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="2 4" data-tc-target="sin" />}
        {target && target.kind === 'cos' && <line x1={T[0] + target.value * g.L} x2={T[0] + target.value * g.L} y1={0} y2={yG} stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="2 4" data-tc-target="cos" />}
        <Drone x={D[0]} y={D[1]} s={s} toward={T} reduce={reduce} lights={lights} onToggle={() => setLights((v) => !v)} />
        <Hud w={w} reduce={reduce} />
      </svg>
    </div>
  );
}

/** Le drone : corps, bras, hélices (tournent), nacelle orientée vers la cible, feux (au toucher) — décor sauf la position. */
function Drone({ x, y, s, toward, reduce, lights, onToggle }) {
  const dir = Math.atan2(toward[1] - y, toward[0] - x) * (180 / Math.PI);
  return (
    <g data-deco="drone">
      <style>{'.tc-prop{transform-box:fill-box;transform-origin:center;animation:tc-spin .35s linear infinite}@keyframes tc-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion: reduce){.tc-prop{animation:none}}'}</style>
      <g aria-hidden="true" tabIndex={-1} onClick={onToggle} style={{ cursor: 'pointer' }}>
        {[-1, 1].map((sx) => (
          <g key={sx}>
            <line x1={x} y1={y - s * 0.3} x2={x + sx * s * 1.3} y2={y - s * 0.7} stroke="#334155" strokeWidth={2} />
            <ellipse className={reduce ? undefined : 'tc-prop'} cx={x + sx * s * 1.3} cy={y - s * 0.78} rx={s * 0.7} ry={s * 0.16} fill="#94A3B8" opacity={0.8} />
          </g>
        ))}
        <rect x={x - s * 0.7} y={y - s * 0.55} width={s * 1.4} height={s * 0.6} rx={s * 0.25} fill="#0F172A" />
        <circle cx={x - s * 0.45} cy={y - s * 0.25} r={1.8} fill={lights ? '#22C55E' : '#14532D'} />
        <circle cx={x + s * 0.45} cy={y - s * 0.25} r={1.8} fill={lights ? '#EF4444' : '#7F1D1D'} />
        {/* la nacelle : la caméra pointe vers la cible */}
        <g transform={`rotate(${dir} ${x} ${y + s * 0.15})`}>
          <rect x={x - s * 0.15} y={y - s * 0.05} width={s * 0.75} height={s * 0.42} rx={2} fill="#1E293B" />
          <circle cx={x + s * 0.6} cy={y + s * 0.16} r={s * 0.14} fill="#38BDF8" />
        </g>
      </g>
    </g>
  );
}

/** La mer de la Corniche, deux mouettes : décor pur. */
function SeaDeco({ w, yG, reduce }) {
  return (
    <g aria-hidden="true" data-deco="corniche">
      <style>{'.tc-gull{animation:tc-gull 9s linear infinite}@keyframes tc-gull{from{transform:translateX(0)}to{transform:translateX(-40px)}}@media (prefers-reduced-motion: reduce){.tc-gull{animation:none}}'}</style>
      <circle cx={w * 0.82} cy={Math.min(34, yG * 0.25)} r={Math.min(14, yG * 0.1)} fill="#FDE047" opacity={0.9} />
      {/* la colline au bout de la Corniche et son fort, au loin */}
      <path d={`M${w * 0.58} ${yG - Math.min(26, yG * 0.22)} Q${w * 0.76} ${yG - Math.min(26, yG * 0.22) - Math.min(48, yG * 0.36)} ${w} ${yG - Math.min(26, yG * 0.22) - Math.min(30, yG * 0.24)} L${w} ${yG - Math.min(26, yG * 0.22)} Z`} fill="#86EFAC" opacity={0.7} />
      <rect x={w * 0.8} y={yG - Math.min(26, yG * 0.22) - Math.min(48, yG * 0.36) * 0.62} width={10} height={7} fill="#E7E5E4" stroke="#A8A29E" />
      <rect x={0} y={yG - Math.min(26, yG * 0.22)} width={w} height={Math.min(26, yG * 0.22)} fill="#38BDF8" opacity={0.55} />
      <path d={`M0 ${yG - 8} q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0`} stroke="#FFFFFF" fill="none" opacity={0.7} />
      {/* deux palmiers de la promenade */}
      {[w * 0.04, w * 0.95].map((px) => (
        <g key={px} transform={`translate(${px} ${yG})`}>
          <rect x={-1.5} y={-Math.min(40, yG * 0.3)} width={3} height={Math.min(40, yG * 0.3)} fill="#92400E" />
          <path d={`M0 ${-Math.min(40, yG * 0.3)} q-10 -2 -14 6 M0 ${-Math.min(40, yG * 0.3)} q10 -2 14 6 M0 ${-Math.min(40, yG * 0.3)} q-4 -8 -10 -8 M0 ${-Math.min(40, yG * 0.3)} q4 -8 10 -8`} stroke="#15803D" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </g>
      ))}
      <g className={reduce ? undefined : 'tc-gull'}>
        <path d={`M${w * 0.62} 20 q4 -4 8 0 q4 -4 8 0`} stroke="#475569" fill="none" strokeWidth={1.3} />
        <path d={`M${w * 0.74} 32 q3 -3 6 0 q3 -3 6 0`} stroke="#475569" fill="none" strokeWidth={1.1} />
      </g>
    </g>
  );
}

/** L'interface de pilotage : voyant d'enregistrement qui clignote, batterie — décor sans mot ni nombre. */
function Hud({ w, reduce }) {
  return (
    <g aria-hidden="true" data-deco="hud">
      <style>{'.tc-rec{animation:tc-rec 1.2s steps(2) infinite}@keyframes tc-rec{50%{opacity:.15}}@media (prefers-reduced-motion: reduce){.tc-rec{animation:none}}'}</style>
      <circle className={reduce ? undefined : 'tc-rec'} cx={12} cy={12} r={5} fill="#EF4444" />
      <rect x={w - 30} y={7} width={20} height={10} rx={2} fill="none" stroke="#334155" strokeWidth={1.3} />
      <rect x={w - 10} y={10} width={2.5} height={4} fill="#334155" />
      <rect x={w - 28} y={9} width={12} height={6} fill="#22C55E" />
    </g>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque étape : le tableau (مبتدئ : finit par la règle), les angles (متقدم : finit par la règle). */
export function chainFor(lab, id) {
  if (id === 'inv') return ['readAngle', 'key', 'tenth', 'rule'];
  return L.hasInverse(lab) ? ['read', 'mode', 'round'] : ['read', 'mode', 'round', 'rule'];
}

const $$ = (s) => `$${s}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const numTex = (s) => String(s).replace(',', '{,}');
const Code = ({ children }) => <code dir="ltr" className="rounded-md border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-sm font-bold text-slate-800">{children}</code>;
const asNum = (s) => Number(String(s).replace(',', '.'));
/** Le pas de la dernière décimale (0,01 pour 2 chiffres). */
const unit = (d) => 10 ** -d;
const fixed = (x, d) => x.toFixed(d).replace('.', ',');

/** La cellule dont l'arrondi a le plus à dire : le chiffre suivant ≥ 5 (on ajoute 1), de préférence un sinus ou un cosinus. */
function bestCell(lab) {
  const cells = Object.values(lab.cells);
  const up = cells.filter((c) => L.roundingOf(asNum(c.screen), lab.digits).up);
  return up.find((c) => c.kind !== 'tan') ?? up[0] ?? cells[0];
}

export const QUESTIONS = {
  read: (lab, k) => {
    const c = bestCell(lab);
    const f = $$(`\\${c.kind}\\,${c.angle}^{\\circ}`);
    const prec = k(`prec_${lab.digits}`);
    const cut = L.cutScreen(c.screen, lab.digits);
    return {
      id: 'read', kind: 'number', expected: c.rounded, answer: <MathText>{$$(numTex(c.rounded))}</MathText>,
      prompt: Mx(k, 'read.prompt', { f, prec }),
      hints: [Mx(k, 'read.hint1', { f }), Mx(k, 'read.hint2', { screen: $$(numTex(c.screen)), prec })],
      explain: Mx(k, 'read.explain', { screen: $$(numTex(c.screen)), next: iso(cut.next), rounded: $$(numTex(c.rounded)), prec }),
    };
  },
  mode: (lab, k) => {
    const c = bestCell(lab);
    return {
      id: 'mode', kind: 'choice',
      prompt: Mx(k, 'mode.prompt'),
      options: [
        { text: Mx(k, 'mode.digits'), why: Mx(k, 'mode.whyDigits', { f: $$(`\\${c.kind}\\,${c.angle}^{\\circ}`), screen: $$(numTex(c.screen)) }) },
        { text: Mx(k, 'mode.right'), correct: true },
        { text: Mx(k, 'mode.keys'), why: Mx(k, 'mode.whyKeys') },
      ],
      hints: [Mx(k, 'mode.hint1'), Mx(k, 'mode.hint2')],
      explain: Mx(k, 'mode.explain'),
    };
  },
  round: (lab, k) => {
    const c = bestCell(lab);
    const d = lab.digits;
    const v = asNum(c.screen);
    const { rounded, truncated } = L.roundingOf(v, d);
    const cut = L.cutScreen(c.screen, d);
    const alt = [truncated !== rounded ? truncated : fixed(asNum(rounded) - unit(d), d), L.roundingOf(v, d + 1).rounded];
    const wrong = [...new Set(alt.filter((x) => x !== rounded))];
    while (wrong.length < 2) wrong.push(fixed(asNum(rounded) + unit(d) * (wrong.length + 1), d));
    const o = { f: $$(`\\${c.kind}\\,${c.angle}^{\\circ}`), screen: $$(numTex(c.screen)), next: iso(cut.next), prec: k(`prec_${d}`) };
    const items = [
      { text: <MathText>{$$(numTex(wrong[0]))}</MathText>, why: Mx(k, truncated !== rounded ? 'round.whyTrunc' : 'round.whyLow', { ...o, v: $$(numTex(wrong[0])) }) },
      { text: <MathText>{$$(numTex(rounded))}</MathText>, correct: true },
      { text: <MathText>{$$(numTex(wrong[1]))}</MathText>, why: Mx(k, 'round.whyMore', { ...o, v: $$(numTex(wrong[1])) }) },
    ];
    return {
      id: 'round', kind: 'choice', cols: 3,
      prompt: Mx(k, 'round.prompt', o),
      options: items,
      hints: [Mx(k, 'round.hint1', o), Mx(k, 'round.hint2', o)],
      explain: Mx(k, 'round.explain', { ...o, rounded: $$(numTex(rounded)), add: cut.next >= 5 ? k('cp.round.addYes') : k('cp.round.addNo') }),
    };
  },
  rule: (lab, k) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k(L.hasInverse(lab) ? 'dPromptInverse' : 'dPrompt')}</MathText>,
    options: discoveryOptionsOf(lab, k),
    hints: [Mx(k, L.hasInverse(lab) ? 'rule.hintInv1' : 'rule.hint1'), Mx(k, L.hasInverse(lab) ? 'rule.hintInv2' : 'rule.hint2')],
    explain: formalOf(lab, k),
  }),
  /** La tâche aux trois précisions (celle qui montre 31,33 / 31,3 / 31). */
  readAngle: (lab, k) => {
    const t = angleTask(lab);
    const f = $$(`\\${t.kind}\\,x=${numTex(L.dec(t.value))}`);
    const row = lab.inv[t.kind];
    return {
      id: 'readAngle', kind: 'number', expected: row[0], answer: <MathText>{$$(`${numTex(row[0])}^{\\circ}`)}</MathText>,
      prompt: Mx(k, 'readAngle.prompt', { f }),
      hints: [Mx(k, 'readAngle.hint1'), Mx(k, 'readAngle.hint2', { hundredth: $$(`${numTex(row[2])}^{\\circ}`) })],
      explain: Mx(k, 'readAngle.explain', { f, hundredth: $$(`${numTex(row[2])}^{\\circ}`), unit: $$(`${numTex(row[0])}^{\\circ}`) }),
    };
  },
  key: (lab, k) => {
    const t = angleTask(lab);
    const x = L.dec(t.value);
    const other = t.kind === 'cos' ? 'sin' : 'cos';
    const direct = L.evaluate({ fn: { kind: t.kind, inverse: false }, entry: x, mode: 'DEG' });
    const swapped = L.evaluate({ fn: { kind: other, inverse: true }, entry: x, mode: 'DEG' });
    const o = { f: $$(`\\${t.kind}\\,x=${numTex(x)}`), x: iso(x), kind: k(`name_${t.kind}`), other: k(`name_${other}`) };
    return {
      id: 'key', kind: 'choice', cols: 1,
      prompt: Mx(k, 'key.prompt', o),
      options: [
        { text: <span className="inline-flex flex-wrap items-center gap-1" dir="ltr"><Code>{t.kind}</Code><Code>{x}</Code><Code>=</Code></span>, why: Mx(k, 'key.whyDirect', { ...o, screen: $$(numTex(direct.screen)) }) },
        { text: <span className="inline-flex flex-wrap items-center gap-1" dir="ltr"><Code>2nd</Code><Code>{L.INV_LABEL[t.kind]}</Code><Code>{x}</Code><Code>=</Code></span>, correct: true },
        { text: <span className="inline-flex flex-wrap items-center gap-1" dir="ltr"><Code>2nd</Code><Code>{L.INV_LABEL[other]}</Code><Code>{x}</Code><Code>=</Code></span>, why: Mx(k, 'key.whyOther', { ...o, screen: $$(numTex(swapped.status === 'ok' ? swapped.screen.slice(0, 6) : '…')) }) },
      ],
      hints: [Mx(k, 'key.hint1', o), Mx(k, 'key.hint2', o)],
      explain: Mx(k, 'key.explain', o),
    };
  },
  tenth: (lab, k) => {
    const t = angleTask(lab);
    const row = lab.inv[t.kind];
    const f = $$(`\\${t.kind}\\,x=${numTex(L.dec(t.value))}`);
    const cut = L.cutScreen(row[2], 1);
    return {
      id: 'tenth', kind: 'number', expected: row[1], answer: <MathText>{$$(`${numTex(row[1])}^{\\circ}`)}</MathText>,
      prompt: Mx(k, 'tenth.prompt', { f }),
      hints: [Mx(k, 'tenth.hint1', { hundredth: $$(`${numTex(row[2])}^{\\circ}`) }), Mx(k, 'tenth.hint2', { next: iso(cut.next) })],
      explain: Mx(k, 'tenth.explain', { hundredth: $$(`${numTex(row[2])}^{\\circ}`), tenth: $$(`${numTex(row[1])}^{\\circ}`), next: iso(cut.next) }),
    };
  },
};

function angleTask(lab) {
  return lab.tasks.find((t) => L.taskDone(lab, t.kind) === L.PRECISIONS.length) ?? lab.tasks[0];
}
