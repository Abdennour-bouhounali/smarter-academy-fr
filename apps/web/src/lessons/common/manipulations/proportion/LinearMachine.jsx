import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, CheckCheck, Ban } from 'lucide-react';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as Pr from '@smarter-academy/core/arithmetic/proportional.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import useDragInteraction from '../useDragInteraction';
import DraggableObject from '../primitives/DraggableObject';
import DropZone from '../primitives/DropZone';
import DragGhost from '../primitives/DragGhost';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import * as L from '../logic/linearMachine';

/**
 * linear-machine — LA MACHINE À RÈGLE CACHÉE (unité 6 « الدالة الخطية والتناسبية », leçon 2
 * « مفهوم وتعيين الدالة الخطية »).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève PORTE des cartes-nombres de SON choix dans la trémie d'une machine (glisser, ou toucher la
 *    carte puis la trémie, ou Entrée) — et une carte vierge dont il ÉTIRE lui-même la valeur. Il TOURNE
 *    le cadran a d'une machine-TÉMOIN x ⟼ a·x (étirer, −/+, flèches), ou y PORTE un couple de sa table.
 *    Il AFFIRME « آلتي تطابق الآلة: f(x) = a·x » ou « لا يوجد a ».
 * B. Idée : une machine dont la sortie est toujours a·x est une DALA KHATTIYA x ⟼ ax ; son tableau de
 *    valeurs est de proportionnalité ; UN couple (m ; f(m)) avec m ≠ 0 fixe a = f(m) ÷ m ; 0 ne fixe rien.
 * C. Chaque carte nourrit la machine : les engrenages tournent, l'étiquette de sortie se balance, une
 *    colonne (x ; f(x)) s'ajoute à la table de l'élève ; la ligne a·x de la machine-témoin suit le cadran
 *    EN DIRECT, colonne par colonne, verte ou rouge.
 * D. f(x) écrit sous la sortie ; la table x / f(x) / a·x ; à l'acceptation, f(x) = a·x.
 * E. À découvrir : la sortie est toujours le MÊME multiple de l'entrée — et ce n'est pas le cas de
 *    toutes les machines (x², 2x − 1 au niveau متقدم) ; f(0) = 0 ne suffit pas.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        la dala khattiya x ⟼ ax, l'image f(x) = ax, la détermination de a par a·m = n (m ≠ 0)
 *   OBJECT         une machine du souk (ou trois machines à nombres) et les cartes qu'on y glisse
 *   VARIABLE       l'ENTRÉE x (la carte choisie, la carte vierge étirée) et le cadran a de la machine-témoin
 *   INVARIANT      la règle cachée (une carte redonne toujours la même sortie) ; pour x ⟼ ax, le rapport
 *                  f(x) ÷ x de toute colonne non nulle ; 0 ⟼ 0
 *   TRANSFORMATION la table grandit d'une colonne par carte ; la ligne a·x suit le cadran
 *   CONSTRAINT     « f(x) = a·x » n'est accepté que si la règle EST x ⟼ a·x ; « لا يوجد a » qu'avec un témoin
 *                  de la table (f(0) ≠ 0, ou deux rapports f(x) ÷ x différents)
 *   RESISTANCE     l'affirmation refusée avec la colonne où a·x ≠ f(x) — ou, si la table n'en a pas, la machine
 *                  insère elle-même son témoin (f(0) ≠ 0, ou le double d'une entrée) ; le couple (0 ; 0)
 *                  posé sur le cadran est refusé : « a × 0 = 0 مهما كان a »
 *   EVIDENCE       la ligne a·x toute verte ; la table de l'élève
 *   CONTRAST       مبتدئ : la remise reconnue avec deux couples non nuls (même rapport), « une remise fixe »
 *                  réfutée par la table ; متقدم : une machine linéaire ET deux machines réfutées
 *   PREDICTION     avant la carte, l'élève peut annoncer la sortie avec son cadran (la ligne a·x)
 *   DISCOVERY      « صورة كل عدد هي جداؤه في العدد نفسه a » ; f(0) = 0 ne suffit pas (x²)
 *   FORMALIZATION  f : x ⟼ 0,8x, f(x) = 0,8x, دالة خطية معاملها 0,8 ; a = f(m) ÷ m (m ≠ 0)
 *   TRANSFER       معارف (x² / 2x / 2x − 1 en tableaux, g(−2) = 6 → a = −3), أوظّف (ex. 1, 6, 9)
 * Manuel (§6bis) : chaque carte est un choix, chaque affirmation une réponse — pas d'auto-complétion.
 *
 * Mondes (lus sur le NOMBRE de règles, logic/linearMachine.js) :
 *   souk     une règle (« 0,8x ») : l'étal de l'Aïd, des étiquettes de prix en DA, et les étiquettes-cibles
 *            (`targets`, « 6|1,4 ») que la machine doit produire — la marche arrière du نشاط 1 se fait avec la
 *            carte vierge, sans changer de scène ;
 *   numbers  plusieurs règles (« x^2|2x|2x-1 ») : trois machines colorées, des nombres relatifs.
 *
 * DÉCOR (exigence du propriétaire) : l'auvent rayé et la lanterne (fanous) du souk, les engrenages qui
 * tournent quand une carte entre, l'étiquette qui se balance, les voyants des machines — `aria-hidden`,
 * `tabIndex={-1}`, `[data-deco]`, aucun ne porte la réponse, immobiles sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : la machine, les cartes (bloc quasi carré,
 * `deckGrid`), la table, le cadran et les affirmations tiennent dans la hauteur de l'écran de leçon
 * (`useLessonViewport`) — large (≥ 620 px) : machine + cartes | table + cadran côte à côte ; sinon empilés,
 * machine en bande compacte. La table montre les colonnes qui tiennent dans la largeur ; la table entière
 * est dans un pli (`LabFold`) SOUS la manipulation. Mesuré au navigateur aux quatre viewports, deux niveaux.
 *
 * Props : `rules` (« 0,8x » | « x^2|2x|2x-1 »), `cards` (« 50|100|… »), `targets` (« 6|1,4 »), `theme`
 * ('souk'), `title`, `lead`, `mission`, `level`, `levels` (false : posé seul), `onTrial`, `onVerdict`,
 * `onReverse`, `onFinished` — tous par `state.report`.
 *
 * CONTRAT DOM : [data-linear-machine][data-world][data-machine][data-layout][data-verdict],
 * [data-lm-glance], [data-lm-machine-tab=i][data-lm-status], [data-drop-zone]… via DropZone :
 * [data-lm-hopper], [data-lm-dial-zone], [data-lm-card=<x>][data-fed], [data-lm-blank],
 * [data-lm-col=<x>][data-agree][data-by], [data-lm-output], [data-lm-target=<t>][data-hit],
 * [data-lm-claim=same|none], [data-lm-last=<kind>], [data-stretch-handle][data-lm-handle=dial|blank],
 * [data-lab-fold=linear-machine.table], [data-deco], [data-lm-formal].
 */
const MACHINE_TONES = [
  { fill: '#DC2626', soft: '#FEE2E2', ring: 'border-rose-500', text: 'text-rose-800' },
  { fill: '#2563EB', soft: '#DBEAFE', ring: 'border-blue-500', text: 'text-blue-800' },
  { fill: '#059669', soft: '#D1FAE5', ring: 'border-emerald-500', text: 'text-emerald-800' },
  { fill: '#7C3AED', soft: '#EDE9FE', ring: 'border-violet-500', text: 'text-violet-800' },
];
export default function LinearMachine({
  rules: rules0 = '0,8x', cards, targets, title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onVerdict, onReverse, onFinished, onCheckpoint,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.linearMachine.${key}`, o), [t]);
  const state = useManipulation({ type: 'linear-machine', initialNumbers: { rules: rules0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { rules } = state.numbers;
  // Sur l'autre niveau (préréglage de levels.js) : ni cartes ni cibles propres à la leçon.
  const cardsHere = state.isAuthoredLevel ? cards : undefined;
  const targetsHere = state.isAuthoredLevel ? targets : undefined;

  const make = () => L.init({ rules, cards: cardsHere, targets: targetsHere });
  const [lab, setLab] = useState(make);
  const sceneKey = `${rules}:${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [liveA, setLiveA] = useState(null);
  // Valeur PAR DÉFAUT de la carte vierge (jamais une cible) : ce n'est pas un essai, seule une carte portée en est un.
  const [blankI, setBlankI] = useState(() => L.defaultBlankIndex(make()));
  const [spin, setSpin] = useState(0);
  const [inits, setInits] = useState(0);        // « إعادة », un autre niveau : les questions du labo repartent aussi
  const [cleared, setCleared] = useState([]);   // les étapes dont la suite de questions est répondue
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setLiveA(null); setBlankI(L.defaultBlankIndex(make())); setInits((n) => n + 1); setCleared([]); }

  const W = lab.world;
  const w = (key, o) => k(`worlds.${W}.${key}`, o);
  const m = lab.machines[lab.current];
  const many = lab.machines.length > 1;
  const tone = MACHINE_TONES[lab.current % MACHINE_TONES.length];

  useEffect(() => { if (state.isFormal) state.report(onFinished, rules); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chaque NOUVEL essai, chaque verdict, chaque étiquette atteinte : rapportés à la leçon.
  const last = lab.last;
  useEffect(() => {
    if (!last) return;
    const base = { machine: lab.current, rules };
    if (last.kind === 'fed' || (last.kind === 'refusedLinear' && last.byMachine)) {
      state.report(onTrial, { ...base, x: L.numText(last.x), fx: L.numText(last.fx), byMachine: last.kind !== 'fed' });
    }
    if (last.kind === 'acceptedLinear') state.report(onVerdict, { ...base, kind: 'linear', a: L.numText(last.a) });
    if (last.kind === 'acceptedNot') state.report(onVerdict, { ...base, kind: 'notLinear' });
    if (last.kind === 'fed' && last.hit) state.report(onReverse, { ...base, target: L.numText(last.hit), x: L.numText(last.x) });
  }, [last]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : la largeur de la scène, la hauteur de l'écran de leçon ── */
  const boxRef = useRef(null);
  const [width, setWidth] = useState(300);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(200, Math.floor(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 576;
  const wide = width >= 620;
  const GAP = 12;
  const colW = wide ? Math.floor((width - GAP) / 2) : width;

  /* ── le geste « porter » : cartes → trémie, colonnes → cadran ── */
  const fedSet = useMemo(() => new Set(m.trials.filter((u) => u.by === 'student').map((u) => Lin.fracText(u.x))), [m.trials]);
  const blankDial = L.BLANKS[W];
  const blankValue = blankI == null ? null : L.dialValue(blankDial, blankI);
  const valueOf = (src) => {
    if (src === 'blank') return blankValue;
    if (src.startsWith('card:')) return lab.deck[Number(src.slice(5))];
    if (src.startsWith('col:')) return Lin.parseNumber(src.slice(4));
    return null;
  };
  const accepts = (src, zone) => {
    if (zone === 'hopper') return src.startsWith('col:') ? '' : (src === 'blank' && blankValue == null ? k('rBlankUnset') : true);
    if (zone === 'dial') {
      if (!src.startsWith('col:')) return '';
      return L.canFixFrom(valueOf(src)) === true ? true : k('rZero');
    }
    return '';
  };
  const drag = useDragInteraction({
    accepts,
    onDrop: (src, zone) => {
      const v = valueOf(src);
      if (v == null) return;
      if (zone === 'hopper') { setLab((s) => L.feed(s, v)); setSpin((n) => n + 1); }
      if (zone === 'dial') { setLab((s) => L.fixFrom(s, v)); setLiveA(null); }
    },
    onReject: (src, zone) => {
      // Le couple (0 ; f(0)) posé sur le cadran : le REFUS vient de la logique (une seule source).
      if (zone === 'dial' && src.startsWith('col:')) setLab((s) => L.fixFrom(s, valueOf(src)));
    },
  });

  /* ── le cadran a de la machine-témoin, la carte vierge ── */
  const dial = lab.dial;
  // Le cadran s'ouvre sur un a PAR DÉFAUT (jamais le coefficient caché) ; il n'est écrit nulle part tant que l'élève ne l'a pas validé.
  const defIdx = L.defaultDialIndex(lab);
  const aIndex = liveA ?? (m.a == null ? defIdx : L.dialIndex(dial, m.a));
  const aNow = liveA != null ? L.dialValue(dial, liveA) : (m.a ?? L.dialValue(dial, defIdx));
  const trackW = Math.max(80, colW - 104);
  const EDGE = 18;
  const toIndex = (r) => (cx, _y, rect) => r.min + ((cx - rect.left - EDGE) / Math.max(1, trackW - 2 * EDGE)) * (r.max - r.min);
  const sDial = useStretchInteraction({
    value: aIndex, range: { min: dial.min, max: dial.max }, toValue: toIndex(dial), onChange: setLiveA,
    onCommit: (i) => { setLiveA(null); setLab((s) => L.setDial(s, L.dialValue(dial, i))); }, direction: 'ltr',
  });
  const sBlank = useStretchInteraction({
    value: blankI, range: { min: blankDial.min, max: blankDial.max }, toValue: toIndex(blankDial), onChange: setBlankI,
    onCommit: setBlankI, direction: 'ltr',
  });

  const claimSame = () => { sDial.flush(); setLab((s) => L.claimLinear(s.machines[s.current].a == null ? L.setDial(s, L.dialValue(s.dial, L.defaultDialIndex(s))) : s)); };
  const claimNone = () => { sDial.flush(); setLab((s) => L.claimNotLinear(s)); };

  /* « جرّب كل الإمكانيات » : les cartes de la pioche, une à une, dans la trémie de la machine courante. */
  const labRef = useRef(lab);
  labRef.current = lab;
  const unfed = () => { const cm = labRef.current.machines[labRef.current.current]; return labRef.current.deck.filter((x) => !cm.trials.some((u) => Lin.eq(u.x, x))); };
  const reportFed = (s0) => {
    const lt = s0.last;
    if (!lt || lt.kind !== 'fed') return;
    const base = { machine: s0.current, rules };
    state.report(onTrial, { ...base, x: L.numText(lt.x), fx: L.numText(lt.fx), byMachine: false });
    if (lt.hit) state.report(onReverse, { ...base, target: L.numText(lt.hit), x: L.numText(lt.x) });
  };
  const autoStep = () => {
    const next = unfed()[0];
    if (next === undefined) return;
    labRef.current = L.feed(labRef.current, next);
    setLab((s) => L.feed(s, next));
    setSpin((n) => n + 1);
  };
  const autoFinish = () => {
    const todo = unfed();
    if (todo.length === 0) return;
    let acc = labRef.current;
    todo.forEach((x, i) => { acc = L.feed(acc, x); if (i < todo.length - 1) reportFed(acc); });
    labRef.current = acc;
    setLab((s) => todo.reduce((a, x) => L.feed(a, x), s));
    setSpin((n) => n + 1);
  };

  /* ── l'écriture ── */
  const $ = (tex) => `$${tex}$`;
  const N = L.numTex;
  const verdictLine = last && renderLast(last, { k, w, N, $, a: m.a, lab, W });

  /* ── la découverte : distracteurs réfutés par la table de l'élève ── */
  const discoveryOptions = useMemo(() => {
    if (!many) {
      const pair = L.twoNonZero(lab.machines[0]);
      const a = lab.machines[0].verdict?.a ?? lab.machines[0].a ?? Lin.frac(1);
      const opts = [{ text: <MathText>{k('dOptRight', { a: $(N(a)), ax: $(`f(x) = ${L.axTex(a)}`) })}</MathText>, correct: true }];
      if (pair) {
        const [p, q] = pair;
        opts.push({ text: <MathText>{w('dOptFixed')}</MathText>, why: <MathText>{w('dWhyFixed', { x1: $(N(p.x)), d1: $(N(Lin.sub(p.x, p.fx))), x2: $(N(q.x)), d2: $(N(Lin.sub(q.x, q.fx))) })}</MathText> });
      }
      opts.push({ text: <MathText>{k('dOptZero')}</MathText>, why: <MathText>{k('dWhyZero')}</MathText> });
      return opts;
    }
    const opts = [{ text: <MathText>{k('dOptRightMany')}</MathText>, correct: true }];
    const z = L.zeroButNotLinear(lab);
    if (z) opts.push({ text: <MathText>{k('dOptZeroOnly')}</MathText>, why: <MathText>{k('dWhyZeroOnly', { n: z.machine + 1, f2: $(N(z.f2)), d: $(N(Lin.mul(z.f1, 2))) })}</MathText> });
    const nz = L.zeroNotZero(lab);
    if (nz) opts.push({ text: <MathText>{k('dOptGrows')}</MathText>, why: <MathText>{k('dWhyGrows', { n: nz.machine + 1, f0: $(N(nz.f0)) })}</MathText> });
    return opts;
  }, [lab, k]); // eslint-disable-line react-hooks/exhaustive-deps

  const formal = (
    <div className="space-y-2" data-lm-formal>
      {lab.machines.map((u) => {
        const lin = u.verdict?.kind === 'linear';
        const label = many ? k('machineN', { n: u.id + 1 }) : w('machine');
        return (
          <EquationDisplay key={u.id} tone={lin ? 'result' : 'neutral'} tex={`x \\longmapsto ${L.ruleTex(u.rule)}`}
            note={<MathText>{lin ? k('fLinear', { name: label, a: $(N(u.rule.a)) }) : k('fNotLinear', { name: label })}</MathText>} />
        );
      })}
      {!many && <EquationDisplay tone="neutral" tex={`f(x) = ${L.axTex(lab.machines[0].rule.a)}`} note={<MathText>{k('fImage')}</MathText>} />}
      <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
      <p className="text-sm text-slate-800"><MathText>{k('fZero')}</MathText></p>
      {lab.reverse.hits.length > 0 && (
        <p className="text-sm text-slate-800" data-lm-formal-reverse>
          <MathText>{lab.reverse.hits.map((h) => k('fReverse', { t: $(N(h.target)), x: $(N(h.x)), eq: $(`${N(lab.machines[0].rule.a)} \\times ${N(h.x)} = ${N(h.target)}`) })).join(' ')}</MathText>
        </p>
      )}
    </div>
  );

  /* ── les questions PENDANT le labo (primitives/LabCheckpoint) : « nourrir » puis « affirmer » (souk) ; une suite par machine (numbers) ── */
  const cpSettings = useLabCheckpointSettings('linear-machine');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  const stageIds = many ? lab.machines.map((u) => `m${u.id}`) : ['feed', 'claim'];
  const reachedOf = (id) => (many ? lab.machines[Number(id.slice(1))].verdict != null : id === 'feed' ? L.feedReached(lab) : lab.machines[0].verdict?.kind === 'linear');
  const activeId = many ? `m${lab.current}` : (cleared.includes('feed') ? 'claim' : 'feed');
  const activeReached = reachedOf(activeId);
  const readyNow = L.discoveryReady(lab);
  const chain = cpLive && activeReached ? chainOf(lab, activeId, readyNow) : null;
  const ruleByCheckpoint = cpLive;
  const cp = useLabCheckpoint({
    id: cpLive ? activeId : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, k, { w, rulePrompt: many ? k('dPromptMany') : w('dPrompt'), ruleOptions: discoveryOptions, formal })) : null,
    reached: activeReached,
    resetKey: inits,
    onRetry: () => {
      if (activeId === 'feed') { setLab(make()); setLiveA(null); setBlankI(L.defaultBlankIndex(make())); } else setLab(L.reopen);
    },
    onEvent: (ev) => state.report(onCheckpoint, ev),   // {tk:'checkpoint'|'checkpoint-done', id, …} — la TRACE que les étapes du module relisent
    onDone: (id) => {
      setCleared((c) => (c.includes(id) ? c : [...c, id]));
      if (chainOf(lab, id, readyNow).includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  useEffect(() => { if (readyNow && !cpLive) state.discover(); }, [readyNow, cpLive, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  // une étape est FAITE quand son objectif est atteint ET sa suite répondue : la pastille passe au vert et on fête
  const stepDone = stageIds.map((id) => reachedOf(id) && (!cpLive || cleared.includes(id)));
  const nDone = stepDone.findIndex((d) => !d) < 0 ? stepDone.length : stepDone.findIndex((d) => !d);
  const party = useStepCelebration();
  const celebrated = useRef({ n: 0, inits });
  if (celebrated.current.inits !== inits) celebrated.current = { n: 0, inits };   // « إعادة » : on refête
  useEffect(() => {
    if (nDone <= celebrated.current.n) return;
    celebrated.current.n = nDone;
    party.celebrate({ n: nDone, total: stepDone.length });
  }, [nDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const stepCurrent = many ? lab.current : (cleared.includes('feed') ? 1 : 0);

  // le son du GESTE (muet sans « الصوت ») : « tooth » une carte, « bell » une étiquette atteinte, « flag » l'affirmation acceptée, « over » un refus
  useEffect(() => {
    const kind = last?.kind;
    if (!kind) return;
    if (kind === 'fed') playSfx(last.hit ? 'bell' : 'tooth');
    else if (kind === 'acceptedLinear' || kind === 'acceptedNot') playSfx('flag');
    else if (kind === 'refusedLinear' || kind === 'refusedNot' || kind === 'zeroFixesNothing') playSfx('over');
    else if (kind === 'fixed' || kind === 'again') playSfx('tooth');
  }, [last]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la représentation vivante ── */
  const repTex = m.verdict?.kind === 'linear'
    ? `f(x) = ${L.axTex(m.verdict.a)}`
    : last && (last.kind === 'fed' || last.kind === 'again') ? `f(${N(last.x)}) = ${N(last.fx)}` : 'f(x) = \\;?';

  /* ── la table : les colonnes qui tiennent ── */
  const labelW = 64;
  const colCell = 46;
  const maxCols = Math.max(2, Math.floor((colW - labelW - 8) / (colCell + 4)));
  const shown = L.visibleColumns(m.trials, maxCols);
  const grid = L.deckGrid(lab.deck.length + 1, wide ? colW : Math.min(colW, 360), { minCell: 44, gap: 6 });

  const machineBlock = (
    <div className="space-y-2" data-lm-machine-block>
      {many && (
        <div role="tablist" aria-label={k('machinesAria')} className="flex gap-1.5">
          {lab.machines.map((u, i) => {
            const tn = MACHINE_TONES[i % MACHINE_TONES.length];
            const status = u.verdict?.kind ?? 'open';
            return (
              <button key={u.id} type="button" role="tab" aria-selected={i === lab.current} onClick={() => { sDial.flush(); setLiveA(null); setLab((s) => L.select(s, i)); }}
                data-lm-machine-tab={i} data-lm-status={status}
                className={`inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center gap-1 rounded-xl border-2 px-1 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${i === lab.current ? `${tn.ring} bg-white` : 'border-slate-200 bg-slate-50'}`}>
                <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full" style={{ background: tn.fill }} />
                <span className={tn.text}>{k('machineN', { n: i + 1 })}</span>
                <span aria-hidden="true" className="text-xs">{status === 'linear' ? '✓' : status === 'notLinear' ? '✗' : ''}</span>
                <span className="sr-only">{k(`status.${status}`)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* LA MACHINE : trémie (cible), corps (engrenages), sortie (étiquette) — le flux va de droite à gauche */}
      <div className="flex items-stretch gap-1.5" data-lm-machine={lab.current}>
        <DropZone drag={drag} id="hopper" label={k('hopperAria', { name: many ? k('machineN', { n: lab.current + 1 }) : w('machine') })} tone="amber"
          minHeight="min-h-[84px]' className='flex w-[30%] shrink-0 flex-col items-center justify-center p-1" data-lm-hopper>
          <Hopper tone={tone} world={W} />
          <span className="text-[11px] font-bold leading-tight text-slate-600">{k('hopper')}</span>
        </DropZone>
        <div className="relative flex min-w-0 flex-1 items-center justify-center rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-slate-50 to-slate-100" style={{ minHeight: 84 }}>
          <MachineBody world={W} tone={tone} spin={spin} />
          <Deco world={W} />
        </div>
        <div className="flex w-[30%] shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-1" data-lm-output aria-live="polite">
          <span className="text-[11px] font-bold text-slate-500">{k('output')}</span>
          <OutputTag world={W} last={last} spin={spin} />
        </div>
      </div>

      {/* LES CARTES : un bloc quasi carré ; la carte vierge et sa règle en dernier */}
      <div className="space-y-1.5">
        <div dir="ltr" className="mx-auto grid" style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(44px, ${grid.cell}px))`, gap: 6, justifyContent: 'center' }} data-lm-deck data-cols={grid.cols}>
          {lab.deck.map((x, i) => {
            const fed = fedSet.has(Lin.fracText(x));
            return (
              <DraggableObject key={Lin.fracText(x)} drag={drag} id={`card:${i}`} label={w('cardAria', { x: L.numText(x) })}
                className={`relative flex min-h-[44px] items-center justify-center rounded-lg border-2 px-1 font-mono text-sm font-extrabold ${W === 'souk' ? 'border-amber-500 bg-amber-50 text-amber-950' : 'border-slate-400 bg-white text-slate-900'}`}>
                <span data-lm-card={L.numText(x)} data-fed={fed ? 'true' : 'false'}>{L.numText(x)}</span>
                {fed && <span aria-hidden="true" className="absolute -top-1 -end-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />}
              </DraggableObject>
            );
          })}
          <DraggableObject drag={drag} id="blank" label={k('blankAria', { x: blankValue == null ? k('notSet') : L.numText(blankValue) })}
            className="flex min-h-[44px] items-center justify-center rounded-lg border-2 border-dashed border-violet-500 bg-violet-50 px-1 font-mono text-sm font-extrabold text-violet-900">
            <span data-lm-blank={blankValue == null ? '' : L.numText(blankValue)}>{blankValue == null ? '؟' : L.numText(blankValue)}</span>
          </DraggableObject>
        </div>
        <div className="flex items-center gap-1.5" data-lm-blank-row>
          <Ruler stretch={sBlank} dial={blankDial} index={blankI} width={Math.max(80, colW - 96)} edge={EDGE} label={k('blankHandle')} notSet={k('notSet')}
            less={k('blankLess')} more={k('blankMore')} color="#7C3AED" which="blank" />
        </div>
      </div>
    </div>
  );

  const targetsRow = lab.targets.length > 0 && (
    <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-700" data-lm-targets>
      <span>{w('targets')}</span>
      {lab.targets.map((tg) => {
        const hit = lab.reverse.hits.find((h) => Lin.eq(h.target, tg));
        return (
          <span key={Lin.fracText(tg)} data-lm-target={L.numText(tg)} data-hit={hit ? 'true' : 'false'}
            className={`rounded-full border-2 px-2 py-0.5 font-mono ${hit ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-amber-400 bg-white text-amber-900'}`}>
            {L.numText(tg)}{hit && (<>← <bdi dir="ltr">{L.numText(hit.x)}</bdi></>)}
          </span>
        );
      })}
    </div>
  );

  const tableBlock = (
    <div className="space-y-2" data-lm-work>
      <table dir="rtl" className="w-full table-fixed border-separate text-center text-sm" style={{ borderSpacing: 4 }} data-lm-table>
        <tbody>
          <tr>
            <th scope="row" className="rounded-md bg-slate-100 px-1 text-xs font-bold text-slate-700" style={{ width: labelW }}>{w('rowX')}</th>
            {shown.map((u) => (
              <td key={`x${Lin.fracText(u.x)}`} className="p-0">
                <DraggableObject drag={drag} id={`col:${Lin.fracText(u.x)}`} label={k('colAria', { x: L.numText(u.x), fx: L.numText(u.fx) })}
                  className={`flex min-h-[44px] w-full flex-col items-center justify-center rounded-lg border-2 font-mono text-xs font-extrabold ${u.by === 'machine' ? 'border-dashed border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'}`}>
                  <span data-lm-col={L.numText(u.x)} data-by={u.by} data-agree={aNow == null ? '' : String(Lin.eq(Lin.mul(aNow, u.x), u.fx))} dir="ltr">{L.numText(u.x)}</span>
                  <span dir="ltr" className={tone.text}>{L.numText(u.fx)}</span>
                </DraggableObject>
              </td>
            ))}
            {shown.length === 0 && <td className="text-xs text-slate-500">{k('tableEmpty')}</td>}
          </tr>
          <tr>
            <th scope="row" className="rounded-md bg-violet-50 px-1 text-[11px] font-bold leading-tight text-violet-800">{aNow == null ? k('rowTwinUnset') : <bdi dir="ltr"><MathText>{$(L.axTex(aNow))}</MathText></bdi>}</th>
            {shown.map((u) => {
              const v = aNow == null ? null : Lin.mul(aNow, u.x);
              const ok = v != null && Lin.eq(v, u.fx);
              return (
                <td key={`a${Lin.fracText(u.x)}`} dir="ltr" data-lm-twin={L.numText(u.x)} data-ok={v == null ? '' : String(ok)}
                  className={`rounded-md font-mono text-xs font-bold ${v == null ? 'text-slate-400' : ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                  {v == null ? '·' : <>{L.numText(v)} {ok ? '✓' : '✗'}</>}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      {/* LA MACHINE-TÉMOIN : le cadran a (cible d'un couple porté) et sa règle */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <DropZone drag={drag} id="dial" label={k('dialAria')} tone="emerald" minHeight="min-h-[44px]"
          className="flex items-center justify-center gap-1 px-1 py-1 min-w-[96px]" data-lm-dial-zone>
          <DialFace a={aNow} />
          <span dir="ltr" className="font-mono text-sm font-extrabold text-slate-900" data-lm-a={aNow == null ? '' : L.numText(aNow)}>a = {aNow == null ? '?' : L.numText(aNow)}</span>
        </DropZone>
        <button type="button" onClick={claimSame} data-lm-claim="same" aria-label={k('claimSameAria', { ax: aNow == null ? 'a × x' : `${L.numText(aNow)} × x` })}
          className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-xl border-2 border-emerald-600 bg-white text-sm font-bold text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 px-2">
          <CheckCheck className="h-4 w-4" aria-hidden="true" />
          <span aria-hidden="true"><MathText>{k('claimSame', { ax: $(aNow == null ? 'ax' : L.axTex(aNow)) })}</MathText></span>
        </button>
        {many && (
          <button type="button" onClick={claimNone} data-lm-claim="none" aria-label={k('claimNone')}
            className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-xl border-2 border-slate-500 bg-white text-sm font-bold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 px-2">
            <Ban className="h-4 w-4" aria-hidden="true" /><span aria-hidden="true">{k('claimNone')}</span>
          </button>
        )}
      </div>
      <Ruler stretch={sDial} dial={dial} index={aIndex} width={trackW} edge={EDGE} label={k('dialHandle')} notSet={k('notSet')}
        less={k('dialLess')} more={k('dialMore')} color="#059669" which="dial" />
      <p role="status" className="min-h-[2.5rem] text-sm font-bold leading-snug" data-lm-last={last?.kind ?? ''}>{verdictLine}</p>
      {targetsRow}
    </div>
  );

  return (
    <ManipulationShell
      type="linear-machine"
      title={title ?? k('title')}
      mission={<MathText>{mission ?? w('mission')}</MathText>}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={ruleByCheckpoint}
      hints={[k('hint1'), k('hint2'), w('hint3')].map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        autoComplete: { label: t('manipulation.autoComplete.tryAll'), ready: true, remaining: unfed().length, intervalMs: 480, maxTicks: 80, step: autoStep, finish: autoFinish },
      }}
      representation={<EquationDisplay tone={m.verdict?.kind === 'linear' ? 'ok' : 'neutral'} tex={repTex} note={<MathText>{many ? k('machineN', { n: lab.current + 1 }) : w('machine')}</MathText>} />}
      discovery={(
        <ManipulationDiscovery state={state} prompt={many ? k('dPromptMany') : w('dPrompt')} options={discoveryOptions} formal={formal} />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white" data-dragging={drag.dragging || sDial.dragging || sBlank.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="relative space-y-3" data-linear-machine data-world={W} data-machine={lab.current} data-rules={rules}
          data-layout={wide ? 'side' : 'stack'} data-screen-h={screenH}
          data-verdict={lab.machines.map((u) => u.verdict?.kind ?? 'open').join('|')}>
          {party.node}
          {cp.node}
          <LabStepper count={stageIds.length} current={stepCurrent} done={stepDone} stepAttr="data-lm-step" />
          <div className={wide ? 'grid grid-cols-2 items-start gap-3' : 'space-y-2'} data-lm-glance>
            {machineBlock}
            {tableBlock}
          </div>
          {m.trials.length > shown.length && (
            <LabFold id="linear-machine.table" title={k('allTrials', { n: m.trials.length })}>
              <ul className="flex flex-wrap gap-1.5" data-lm-all>
                {m.trials.map((u) => (
                  <li key={Lin.fracText(u.x)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-800">
                    <bdi dir="ltr" className="font-mono"><MathText>{$(`f(${N(u.x)}) = ${N(u.fx)}`)}</MathText></bdi>
                  </li>
                ))}
              </ul>
            </LabFold>
          )}
        </div>
        <DragGhost ghost={drag.ghost}>
          <span className="inline-flex min-h-[40px] min-w-[44px] items-center justify-center rounded-lg border-2 border-amber-500 bg-amber-50 px-2 font-mono font-extrabold">
            {drag.held ? (valueOf(drag.held) == null ? '؟' : L.numText(valueOf(drag.held))) : ''}
          </span>
        </DragGhost>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/** La phrase du dernier geste, avec ses nombres (le refus EXPLIQUÉ, jamais un rouge muet). */
function renderLast(last, { k, w, N, $, lab }) {
  const T = (key, o, cls) => <span className={cls}><MathText>{key.startsWith('w:') ? w(key.slice(2), o) : k(key, o)}</MathText></span>;
  switch (last.kind) {
    case 'fed':
      return last.hit
        ? T('w:vReverseHit', { x: $(N(last.x)), t: $(N(last.hit)), eq: $(`${N(last.hit)} \\div ${N(lab.machines[0].rule.a)} = ${N(last.x)}`) }, 'text-emerald-800')
        : T('w:vFed', { x: $(N(last.x)), fx: $(N(last.fx)) }, 'text-slate-800');
    case 'again': return T('vAgain', { x: $(N(last.x)), fx: $(N(last.fx)) }, 'text-slate-700');
    case 'dial': return null;
    case 'zeroFixesNothing':
      return Lin.isZero(last.fx)
        ? T('vZero', {}, 'text-rose-800')
        : T('vZeroImpossible', { fx: $(N(last.fx)) }, 'text-rose-800');
    case 'fixed': return T('vFixed', { x: $(N(last.x)), fx: $(N(last.fx)), eq: $(`a \\times ${L.factorTex(last.x)} = ${N(last.fx)}`), a: $(`a = ${N(last.fx)} \\div ${L.factorTex(last.x)} = ${N(last.a)}`) }, 'text-emerald-800');
    case 'needTrial': return T('vNeedTrial', {}, 'text-slate-700');
    case 'needDial': return T('vNeedDial', {}, 'text-slate-700');
    case 'refusedLinear':
      return T(last.byMachine ? 'vRefusedMachine' : 'vRefused', { x: $(N(last.x)), ax: $(`${L.factorTex(last.a)} \\times ${L.factorTex(last.x)} = ${N(last.ax)}`), fx: $(`f(${N(last.x)}) = ${N(last.fx)}`) }, 'text-rose-800');
    case 'acceptedLinear': return T('vAccepted', { fx: $(`f(x) = ${L.axTex(last.a)}`) }, 'text-emerald-800');
    case 'refusedNot': return T('vRefusedNot', {}, 'text-rose-800');
    case 'needWitness': return T('vNeedWitness', {}, 'text-slate-700');
    case 'acceptedNot': {
      const wi = last.witness;
      if (wi.kind === 'zero') return T('vNotZero', { f0: $(`f(0) = ${N(wi.fx)}`) }, 'text-emerald-800');
      return T('vNotRatio', { r1: $(`${N(wi.p.fx)} \\div ${L.factorTex(wi.p.x)} = ${N(wi.r1)}`), r2: $(`${N(wi.q.fx)} \\div ${L.factorTex(wi.q.x)} = ${N(wi.r2)}`) }, 'text-emerald-800');
    }
    default: return null;
  }
}

/* ── une règle graduée, une poignée (le cadran a, la carte vierge) ── */
function Ruler({ stretch, dial, index, width, edge, label, notSet, less, more, color, which }) {
  const steps = Math.max(1, dial.max - dial.min);
  const mu = (width - 2 * edge) / steps;
  const px = (i) => edge + (i - dial.min) * mu;
  const every = steps <= 12 ? 1 : steps <= 20 ? (width >= 220 ? 2 : 5) : (width >= 260 ? 4 : 8);
  const shownI = index ?? dial.min;
  const grads = Array.from({ length: steps + 1 }, (_, i) => dial.min + i);
  const valueText = index == null ? notSet : L.numText(L.dialValue(dial, index));
  return (
    <div dir="ltr" className="flex min-w-0 flex-1 items-center gap-1" data-lm-ruler={which}>
      <button type="button" onClick={() => stretch.nudge(-1)} aria-label={less} disabled={index != null && index <= dial.min} data-lm-less={which}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
      <div {...stretch.trackProps} className="relative shrink-0" style={{ ...stretch.trackProps.style, height: 44, width }}>
        <svg width={width} height={44} className="absolute inset-0" aria-hidden="true" focusable="false">
          <rect x={edge - 4} y={22} width={steps * mu + 8} height={4} rx={2} fill={color} opacity={0.8} />
          {grads.map((i) => {
            const major = width < 140 ? (i === dial.min || i === dial.max) : (i - dial.min) % every === 0 || i === dial.max;
            return (
              <g key={i}>
                <line x1={px(i)} x2={px(i)} y1={27} y2={major ? 33 : 30} stroke="#64748B" strokeWidth={major ? 1.3 : 0.8} />
                {major && <text x={px(i)} y={43} textAnchor="middle" fontSize={9} fill="#334155" fontFamily="ui-monospace, monospace">{L.numText(L.dialValue(dial, i))}</text>}
              </g>
            );
          })}
        </svg>
        <div {...stretch.handleProps({ label, valueText })} data-lm-handle={which}
          className={`absolute top-0 flex h-[22px] min-w-[44px] -translate-x-1/2 items-center justify-center rounded-full border-2 outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${stretch.dragging ? 'border-blue-500' : 'border-white'}`}
          style={{ left: px(shownI), background: color, cursor: stretch.dragging ? 'grabbing' : 'grab' }}>
          <span className="whitespace-nowrap px-1 font-mono text-[11px] font-extrabold text-white">{index == null ? '?' : L.numText(L.dialValue(dial, index))}</span>
        </div>
      </div>
      <button type="button" onClick={() => stretch.nudge(1)} aria-label={more} disabled={index != null && index >= dial.max} data-lm-more={which}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
    </div>
  );
}

/* ── les objets dessinés (SVG paramétré, jamais une image) ── */
function Hopper({ tone, world }) {
  return (
    <svg viewBox="0 0 40 28" width={40} height={28} aria-hidden="true" focusable="false">
      <path d="M2 2 H38 L26 18 V26 H14 V18 Z" fill={world === 'souk' ? '#FDE68A' : tone.soft} stroke={world === 'souk' ? '#B45309' : tone.fill} strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 6 V14 M16 10 L20 14 L24 10" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Le corps de la machine : deux engrenages qui tournent d'un cran à chaque carte (geste de l'élève). */
function MachineBody({ world, tone, spin }) {
  const reduce = useReducedMotion();
  const turn = reduce ? 0 : spin * 60;
  const gear = (cx, cy, r, dir) => (
    <g style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${dir * turn}deg)`, transition: reduce ? 'none' : 'transform 500ms ease-out' }}>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={cx - 2} y={cy - r - 3} width={4} height={6} rx={1} fill="#475569" transform={`rotate(${i * 45} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={r} fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={r / 3} fill="#F8FAFC" />
    </g>
  );
  return (
    <svg viewBox="0 0 120 60" width="100%' height={72} aria-hidden='true" focusable="false" data-lm-body>
      <rect x="6" y="8" width="108" height="46" rx="10" fill={world === 'souk' ? '#FEF3C7' : tone.soft} stroke={world === 'souk' ? '#B45309' : tone.fill} strokeWidth="2" />
      {gear(42, 31, 11, 1)}
      {gear(68, 28, 8, -1)}
      <circle cx="96" cy="20" r="4" fill={spin % 2 ? '#22C55E' : '#FDE047'} stroke="#334155" />
      <circle cx="96" cy="34" r="4" fill={spin % 2 ? '#FDE047' : '#F97316'} stroke="#334155" />
      <text x="96" y="50" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#334155" fontFamily="ui-monospace, monospace">f</text>
    </svg>
  );
}

/** L'étiquette de sortie : f(x) de la dernière carte ; elle se balance (décor) quand une carte sort. */
function OutputTag({ world, last, spin }) {
  const reduce = useReducedMotion();
  const fx = last && (last.kind === 'fed' || last.kind === 'again') ? L.numText(last.fx) : null;
  return (
    <div key={reduce ? 'still' : spin} className={reduce ? '' : 'lm-swing'} style={{ transformOrigin: '50% 0%' }}>
      <style>{'.lm-swing{animation:lm-sw .7s ease-out 1}@keyframes lm-sw{0%{transform:rotate(-14deg)}50%{transform:rotate(9deg)}100%{transform:rotate(0)}}@media (prefers-reduced-motion: reduce){.lm-swing{animation:none}}'}</style>
      <span dir="ltr" data-lm-out={fx ?? ''}
        className={`inline-flex items-center justify-center rounded-md border-2 px-2 font-mono font-extrabold min-h-[36px] text-base ${world === 'souk' ? 'border-rose-500 bg-rose-50 text-rose-900' : 'border-slate-500 bg-slate-900 text-lime-300'}`}>
        {fx ?? '…'}
      </span>
    </div>
  );
}

/** La face du cadran : l'aiguille suit a (elle lit la valeur, elle ne la donne pas). */
function DialFace({ a }) {
  const v = a == null ? 0 : Math.max(-3, Math.min(5, Lin.toNumber(a)));
  const ang = -120 + ((v + 3) / 8) * 240;
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="#ECFDF5" stroke="#059669" strokeWidth="2" />
      <line x1="12" y1="12" x2="12" y2="4" stroke="#065F46" strokeWidth="2" strokeLinecap="round" transform={`rotate(${ang} 12 12)`} />
      <circle cx="12" cy="12" r="1.8" fill="#065F46" />
    </svg>
  );
}

/**
 * Le DÉCOR — sans information, sans état du lab. Souk : la lanterne (fanous) se balance, l'auvent rayé.
 * Nombres : les voyants clignotent. `aria-hidden`, hors du clavier, immobile sous `prefers-reduced-motion`.
 */
function Deco({ world }) {
  const reduce = useReducedMotion();
  const [taps, setTaps] = useState(0);
  const anim = taps > 0 && !reduce;
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => { if (!reduce) setTaps((n) => n + 1); }} data-deco={world}
      className="absolute -top-2 start-1 h-8 w-12 rounded-lg focus:outline-none">
      <svg viewBox="0 0 60 40" width="100%" height="100%">
        <style>{'.lm-lamp{transform-origin:30px 2px;animation:lm-l .5s ease-in-out 3}@keyframes lm-l{0%,100%{transform:rotate(0)}25%{transform:rotate(12deg)}75%{transform:rotate(-12deg)}}.lm-blink{animation:lm-b .3s steps(2) 4}@keyframes lm-b{50%{opacity:.2}}@media (prefers-reduced-motion: reduce){.lm-lamp,.lm-blink{animation:none}}'}</style>
        {world === 'souk' ? (
          <g>
            {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={i * 10} y="0" width="10" height="6" fill={i % 2 ? '#F8FAFC' : '#DC2626'} />)}
            <g key={taps} className={anim ? 'lm-lamp' : undefined}>
              <line x1="30" y1="6" x2="30" y2="14" stroke="#92400E" strokeWidth="1.5" />
              <path d="M24 14 H36 L34 30 H26 Z" fill="#FBBF24" stroke="#92400E" strokeWidth="1.5" />
              <path d="M27 18 H33 M27 23 H33" stroke="#B45309" strokeWidth="1" />
            </g>
          </g>
        ) : (
          <g key={taps} className={anim ? 'lm-blink' : undefined}>
            {[0, 1, 2, 3].map((i) => <circle key={i} cx={12 + i * 12} cy="10" r="4" fill={['#F43F5E', '#3B82F6', '#10B981', '#FACC15'][i]} />)}
          </g>
        )}
      </svg>
    </button>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/**
 * La suite de questions de chaque étape. Souk : « feed » (deux cartes non nulles passées) puis « claim » (f(x) = a·x acceptée, finit par LA RÈGLE) ;
 * numbers : une suite par machine jugée (`m0`, `m1`, `m2`), la dernière finit par la règle quand la découverte est prête.
 */
export function chainOf(lab, id, ready) {
  if (id === 'feed') return Pr.isLinear(lab.machines[0].rule) ? ['ratio', 'again', 'kind'] : ['ratio', 'again'];
  if (id === 'claim') return ['image', 'zero', 'rule'];
  const m = lab.machines[Number(id.slice(1))];
  const base = m.verdict?.kind === 'linear' ? ['evidence', 'image'] : ['evidence', 'witness'];
  return ready ? [...base, 'rule'] : base;
}

const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const D = (x) => `$${x}$`;
const spread = (list, seed) => { const r = seed % list.length; return [...list.slice(r), ...list.slice(0, r)]; };
const seedOf = (lab) => lab.machines.reduce((n, m) => n + m.trials.length, 0) + lab.current;
const T = (x) => <MathText>{D(L.numTex(x))}</MathText>;

/** Une valeur à calculer : saisie libre si elle est ≥ 0 (une réponse saisie ne peut être négative), sinon trois choix aux erreurs réelles (signe, décalage). */
function valueQ(lab, k, { id, v, prompt, hints, explain }) {
  if (Lin.cmp(v, 0) >= 0) return { id, kind: 'number', expected: Lin.fracText(v), answer: T(v), prompt, hints, explain };
  const opts = [
    { text: T(v), correct: true },
    { text: T(Lin.neg(v)), why: Cq(k, 'sign') },
    { text: T(Lin.add(v, 1)), why: Cq(k, 'off') },
  ];
  return { id, kind: 'choice', cols: 3, prompt, options: spread(opts, seedOf(lab)), hints, explain };
}

export const QUESTIONS = {
  ratio: (lab, k) => {
    const m = lab.machines[0];
    const [p] = L.studentNonZero(m);
    const r = Pr.ratio(p.x, p.fx);
    const o = { x: D(L.numTex(p.x)), fx: D(L.numTex(p.fx)), q: D(`${L.numTex(p.fx)} \\div ${L.numTex(p.x)}`), a: D(L.numTex(r)), calc: D(`${L.numTex(p.fx)} \\div ${L.numTex(p.x)} = ${L.numTex(r)}`) };
    return valueQ(lab, k, { id: 'ratio', v: r, prompt: Cq(k, 'ratio.prompt', o), hints: [Cq(k, 'ratio.hint1', o), Cq(k, 'ratio.hint2', o)], explain: Cq(k, 'ratio.explain', o) });
  },
  again: (lab, k) => {
    const nz = L.studentNonZero(lab.machines[0]);
    const p = nz[0]; const q = nz[nz.length - 1];
    const r1 = Pr.ratio(p.x, p.fx); const r2 = Pr.ratio(q.x, q.fx);
    const c = Lin.cmp(r2, r1);
    const o = { x: D(L.numTex(q.x)), fx: D(L.numTex(q.fx)), q: D(`${L.numTex(q.fx)} \\div ${L.numTex(q.x)}`), r1: D(L.numTex(r1)), r2: D(L.numTex(r2)), calc: D(`${L.numTex(q.fx)} \\div ${L.numTex(q.x)} = ${L.numTex(r2)}`) };
    const opts = [
      { text: Cq(k, 'again.same', o), ...(c === 0 ? { correct: true } : { why: Cq(k, 'again.whyCompare', o) }) },
      { text: Cq(k, 'again.bigger'), ...(c > 0 ? { correct: true } : { why: Cq(k, 'again.whyCompare', o) }) },
      { text: Cq(k, 'again.smaller'), ...(c < 0 ? { correct: true } : { why: Cq(k, 'again.whyCompare', o) }) },
    ];
    return { id: 'again', kind: 'choice', cols: 3, prompt: Cq(k, 'again.prompt', o), options: spread(opts, seedOf(lab) + 1), hints: [Cq(k, 'again.hint1', o), Cq(k, 'again.hint2', o)], explain: Cq(k, 'again.explain', o) };
  },
  kind: (lab, k) => {
    const nz = L.studentNonZero(lab.machines[0]);
    const p = nz[0]; const q = nz[nz.length - 1];
    const d1 = Lin.sub(p.x, p.fx); const d2 = Lin.sub(q.x, q.fx);
    const o = {
      x1: D(L.numTex(p.x)), f1: D(L.numTex(p.fx)), x2: D(L.numTex(q.x)), f2: D(L.numTex(q.fx)), p1: D(`(${L.numTex(p.x)} \\,;\\, ${L.numTex(p.fx)})`), p2: D(`(${L.numTex(q.x)} \\,;\\, ${L.numTex(q.fx)})`), d1: D(L.numTex(d1)), d2: D(L.numTex(d2)),
      a: D(L.numTex(Pr.ratio(p.x, p.fx))),
    };
    const opts = [{ text: Cq(k, 'kind.times', o), correct: true }];
    if (!Lin.eq(d1, d2)) opts.push({ text: Cq(k, 'kind.minus'), why: Cq(k, 'kind.whyMinus', o) });
    if (!Lin.eq(p.fx, q.fx)) opts.push({ text: Cq(k, 'kind.const'), why: Cq(k, 'kind.whyConst', o) });
    return { id: 'kind', kind: 'choice', cols: 3, prompt: Cq(k, 'kind.prompt', o), options: spread(opts, seedOf(lab)), hints: [Cq(k, 'kind.hint1', o), Cq(k, 'kind.hint2', o)], explain: Cq(k, 'kind.explain', o) };
  },
  image: (lab, k) => {
    const m = lab.machines[lab.current];
    const a = m.verdict?.a ?? m.rule.a;
    const used = m.trials.map((t) => Lin.fracText(t.x));
    const mm = lab.world === 'souk' ? (['30', '40', '60', '12'].find((c) => !used.includes(c)) ?? '70') : (['3', '4', '5', '6'].find((c) => !used.includes(c)) ?? '7');
    const x = Lin.parseNumber(mm);
    const v = Pr.image(a, x);
    const o = { a: D(L.numTex(a)), m: D(L.numTex(x)), ax: D(`${L.numTex(a)} \\times ${L.numTex(x)}`), calc: D(`${L.numTex(a)} \\times ${L.numTex(x)} = ${L.numTex(v)}`) };
    return valueQ(lab, k, { id: 'image', v, prompt: Cq(k, 'image.prompt', o), hints: [Cq(k, 'image.hint1', o), Cq(k, 'image.hint2', o)], explain: Cq(k, 'image.explain', o) });
  },
  zero: (lab, k) => {
    const a = lab.machines[0].verdict?.a ?? lab.machines[0].rule.a;
    const o = { a: D(L.numTex(a)), calc: D(`${L.numTex(a)} \\times 0 = 0`) };
    const opts = [
      { text: T(0), correct: true },
      { text: T(a), why: Cq(k, 'zero.whyA', o) },
      { text: Cq(k, 'zero.refuse'), why: Cq(k, 'zero.whyRefuse', o) },
    ];
    return { id: 'zero', kind: 'choice', cols: 3, prompt: Cq(k, 'zero.prompt'), options: spread(opts, seedOf(lab)), hints: [Cq(k, 'zero.hint1', o), Cq(k, 'zero.hint2')], explain: Cq(k, 'zero.explain', o) };
  },
  evidence: (lab, k) => {
    const m = lab.machines[lab.current];
    const kind = m.verdict?.kind === 'linear' ? 'same' : m.verdict?.witness?.kind === 'zero' ? 'zero' : 'ratios';
    const o = { n: lab.current + 1 };
    const opts = [
      { text: Cq(k, 'evidence.same'), ...(kind === 'same' ? { correct: true } : { why: Cq(k, 'evidence.whySame', o) }) },
      { text: Cq(k, 'evidence.zero'), ...(kind === 'zero' ? { correct: true } : { why: Cq(k, 'evidence.whyZero', o) }) },
      { text: Cq(k, 'evidence.ratios'), ...(kind === 'ratios' ? { correct: true } : { why: Cq(k, 'evidence.whyRatios', o) }) },
    ];
    return { id: 'evidence', kind: 'choice', cols: 3, prompt: Cq(k, 'evidence.prompt', o), options: spread(opts, seedOf(lab)), hints: [Cq(k, 'evidence.hint1', o), Cq(k, 'evidence.hint2', o)], explain: Cq(k, `evidence.explain.${kind}`, o) };
  },
  witness: (lab, k) => {
    const m = lab.machines[lab.current];
    const wi = m.verdict?.witness;
    const o = { n: lab.current + 1 };
    if (wi?.kind === 'zero') {
      const oo = { ...o, f0: D(`f(0) = ${L.numTex(wi.fx)}`) };
      return valueQ(lab, k, { id: 'witness', v: wi.fx, prompt: Cq(k, 'witness.zeroPrompt', o), hints: [Cq(k, 'witness.zeroHint1'), Cq(k, 'witness.zeroHint2', o)], explain: Cq(k, 'witness.zeroExplain', oo) });
    }
    const p = wi.p;
    const r = Pr.ratio(p.x, p.fx);
    const oo = { ...o, x: D(L.numTex(p.x)), fx: D(L.numTex(p.fx)), calc: D(`${L.numTex(p.fx)} \\div ${L.numTex(p.x)} = ${L.numTex(r)}`) };
    return valueQ(lab, k, { id: 'witness', v: r, prompt: Cq(k, 'witness.ratioPrompt', oo), hints: [Cq(k, 'witness.ratioHint1', oo), Cq(k, 'witness.ratioHint2', oo)], explain: Cq(k, 'witness.ratioExplain', oo) });
  },
  rule: (lab, k, ctx) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{ctx.rulePrompt}</MathText>,
    options: spread(ctx.ruleOptions, seedOf(lab) + 2),
    hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2')],
    explain: ctx.formal,
  }),
};
