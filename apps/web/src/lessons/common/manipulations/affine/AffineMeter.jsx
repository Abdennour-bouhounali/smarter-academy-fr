import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import * as L from '../logic/affineMeter';

/**
 * affine-meter — LE COMPTEUR À PARTIE FIXE (unité 7 « الدالة التآلفية », leçon 1
 * « مفهوم وتعيين دالة تآلفية »). Deux mondes : `ride` — une course en taxi-application dans une rue
 * d'Alger (100 DA de prise en charge + 40 DA le km, plateforme) ; `payroll` — la paie du نشاط 1
 * (35000 DA de base + 185 DA par heure supplémentaire, manuel p. 78).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève FAIT AVANCER x : il conduit la voiture le long de la règle des kilomètres (ou pousse la
 *    carte de pointage le long de la règle des heures) — useStretchInteraction : glisser, toucher la
 *    règle, −/+, flèches. À l'étape « classify » il tient AUSSI les boutons a et b (deux réglettes).
 * B. Idée : f(x) = ax + b — un bloc b payé UNE fois, plus x blocs de a. Le nombre dont l'image est m
 *    se trouve par le programme inverse « اطرح b ثم اقسم على a ». b = 0 : خطية ; a = 0 : ثابتة.
 * C. Pendant le geste le compteur se CONSTRUIT : le bloc b est déjà là à 0, une tuile a s'ajoute à
 *    chaque unité ; l'écran du compteur écrit f(x) = a × x + b = total. En antecedent un total m est
 *    affiché avec l'écart (« ينقص … » / « تجاوزت … ») ; en classify quatre compteurs (x = 0, ⅓, ⅔, fin)
 *    montrent si le compteur part de 0 (b = 0) ou ne monte plus (a = 0).
 * D. Chaque valeur validée est un ESSAI (`onTrial`) ; atteindre m écrit le programme inverse en deux
 *    lignes ; la conjecture « c'est proportionnel » est réfutée par les propres essais (0 → b, ou
 *    f(2x) ≠ 2f(x)), « m ÷ a − b » par son résultat.
 * E. À découvrir : la forme ax + b (jamais (a + b)x), la partie fixe qui casse la proportionnalité,
 *    l'ordre inverse des opérations, et que خطية et ثابتة sont des cas PARTICULIERS de تآلفية.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        دالة تآلفية x ⟼ ax + b : partie fixe b + partie variable ax ; antécédent (m − b) ÷ a ;
 *                  b = 0 → خطية, a = 0 → ثابتة
 *   OBJECT         un compteur (taximètre / fiche de paie) fait d'un bloc b et de x tuiles a ; la voiture
 *                  (la carte de pointage) sur sa règle ; deux boutons a et b
 *   VARIABLE       x (km / heures, entiers 0 → 12 / 20) ; puis a et b (classify)
 *   INVARIANT      le bloc b ne change jamais avec x ; chaque tuile vaut a ; f(x + 1) − f(x) = a
 *   TRANSFORMATION le nombre de tuiles, le total à l'écran, l'écart à la cible, la forme des 4 compteurs
 *   CONSTRAINT     x entier sur la règle ; la cible m n'est atteinte qu'en UN x
 *   RESISTANCE     à x = 0 le compteur n'est pas vide (b) ; la cible dépassée affiche « تجاوزت بـ … » ; la
 *                  conjecture proportionnelle et « m ÷ a − b » réfutées avec les nombres de l'élève
 *   EVIDENCE       l'écran f(x) = a × x + b ; le tableau des essais (LabFold) ; les deux lignes inverses
 *   CONTRAST       x = 0 (ou x et 2x) face aux autres essais ; b = 0 face à a = 0 (classify)
 *   PREDICTION     le total d'une marque du tableau (5, 8, 10, 12, 15) avant d'y conduire
 *   DISCOVERY      « المبلغ = a × x + b : جزء ثابت b وجزء a عن كل وحدة »
 *   FORMALIZATION  f(x) = ax + b, دالة تآلفية ; (m − b) ÷ a ; b = 0 : خطية ; a = 0 : ثابتة
 *   TRANSFER       act-2 (six règles à classer), معارف de la leçon, la droite de la leçon 2 (b = الترتيب
 *                  عند المبدأ), les tarifs de la leçon 5
 * Manuel (§6bis) : chaque valeur validée est un essai, chaque réglage un choix — pas d'auto-complétion.
 * Niveaux : مبتدئ = `40x+100`, image seule, règle 0–12 km ; متقدم = `185x+35000`, trois étapes
 * enchaînées PAR L'ÉLÈVE (carte « التالي » et retour, §7quater), marques du tableau du manuel, cible 37775.
 *
 * DÉCOR (exigence du propriétaire) : `ride` — immeubles blancs aux volets bleus, un palmier, la voiture
 * dont les roues tournent avec x et qui s'incline pendant le glisser ; `payroll` — l'atelier, une
 * horloge murale dont les aiguilles tournent avec x. `aria-hidden`, `[data-deco]`, hors du chemin
 * clavier, immobile sous `prefers-reduced-motion`, jamais une information du lab.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : `[data-am-glance]` = scène + règle + compteur +
 * commandes + lecture. Large (≥ 640 px) : scène et compteur à gauche, commandes à droite ; sinon empilés,
 * la hauteur du compteur venant de ce qui reste (écran de leçon − scène − commandes mesurées). Les
 * tuiles forment un bloc presque carré (L.tileGrid) dont la taille suit la place. Le tableau des essais
 * est dans un `LabFold` sous le bloc.
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 4) : quand une étape est accomplie, une suite de questions se pose PAR-DESSUS le labo
 * (`CHAINS` : image → la partie fixe lue à x = 0 (ou au double), le pas par unité ; antécédent → la première opération, ce qui reste ;
 * classify → b = 0, a = 0). La dernière étape de découverte (image seule, ou antécédent) finit par LA RÈGLE ax + b et remplace la découverte
 * automatique. Les étapes sont des `LabStepper` (`[data-am-step=<i>]`, fête à chaque étape faite) ; « التالي » n'apparaît qu'une fois la suite
 * finie ; « إعادة » repart de zéro. Obligatoires pour tout élève, coupées par l'enseignant pour SON compte (`useLabCheckpointSettings`) ;
 * `checkpoints` = false les coupe aussi. `onCheckpoint(ev)` : la trace pour les étapes du module.
 * Props : `rule` (« 40x+100 », « 185x+35000 »), `mode` (« image » | « image|antecedent|classify »),
 * `target` (le total m, string), `marks` (« 5|8|10|12|15 »), `xMax`, `theme` ('ride' | 'payroll'),
 * `title`, `lead`, `mission`, `level`, `levels` (false : seul sans sélecteur), `onTrial(t)`
 * ({ kind: 'image', x, fx } | { kind: 'hit' | 'below' | 'above', x, fx } | { kind: 'knobs', which, a, b }),
 * `onFinished({ rule })` à la règle formelle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-affine-meter][data-rule][data-stage][data-x][data-fx][data-layout][data-world],
 * [data-am-glance], [data-am-scene], [data-stretch-handle][data-am-handle], [data-am-less|more],
 * [data-am-mark=<x>], [data-am-meter][data-tiles], [data-am-base], [data-am-tile], [data-am-screen],
 * [data-am-stage-tab=<stage>][aria-pressed], [data-am-next], [data-am-target][data-gap], [data-am-inverse],
 * [data-am-knob=a|b][data-value], [data-am-knob-less|more=a|b], [data-am-kind=affine|linear|constant][data-on],
 * [data-am-sweep], [data-am-verdict=<kind>], [data-am-trials], [data-am-formal], [data-deco],
 * [data-lab-fold=affine-meter.trials].
 */
const PAYROLL_RULE = '185x+35000';
const guessTheme = (rule) => (L.init({ rule }).f.b.n >= 1000 ? 'payroll' : 'ride');

export default function AffineMeter({
  rule: rule0 = '40x+100', mode: mode0 = 'image', target: target0, marks: marks0, xMax, theme: theme0,
  title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false,
  onTrial, onFinished, onCheckpoint,
}) {
  const { t } = useTranslation('lesson');
  const initialNumbers = target0 != null ? { rule: rule0, mode: mode0, target: String(target0) } : { rule: rule0, mode: mode0 };
  const state = useManipulation({ type: 'affine-meter', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { rule, mode, target } = state.numbers;
  const own = rule === rule0;
  const theme = own && theme0 ? theme0 : (rule === PAYROLL_RULE ? 'payroll' : guessTheme(rule));
  const marks = own ? marks0 : (rule === PAYROLL_RULE ? '5|8|10|12|15' : undefined);
  const k = useCallback((key, o) => t(`manipulation.affineMeter.${key}`, o), [t]);
  const w = useCallback((key, o) => t(`manipulation.affineMeter.worlds.${theme}.${key}`, o), [t, theme]);
  const FN0 = w('fn');

  const make = () => L.init({ rule, mode, target, marks, xMax: own ? xMax : undefined });
  const [lab, setLab] = useState(make);
  const sceneKey = `${rule}:${mode}:${target}:${state.epoch}:${state.resetCount}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [liveX, setLiveX] = useState(null);
  const [cleared, setCleared] = useState([]);   // les étapes dont la suite de questions est finie
  // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la règle, les essais et les questions du labo
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(make()); setLiveX(null); setCleared([]); }

  const ready = L.discoveryReady(lab);
  const stageOf = lab.stage;
  const cpSettings = useLabCheckpointSettings('affine-meter');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  const ruleStage = lab.modes.filter((m) => m !== 'classify').at(-1);
  const reachedStage = L.stageDone(lab, stageOf);
  const cp = useLabCheckpoint({
    id: cpLive ? stageOf : null,
    questions: cpLive && reachedStage ? chainOf(lab, stageOf).map((q) => QUESTIONS[q](lab, k, w, FN0)) : null,
    reached: reachedStage,
    resetKey: scene.inits,
    onRetry: () => { setLab(L.restartStage); setLiveX(null); },
    onEvent: (ev) => state.report(onCheckpoint, ev),   // {tk:'checkpoint'|'checkpoint-done', id: étape, …} — la TRACE que les étapes du module relisent
    onDone: (id) => {
      setCleared((c) => (c.includes(id) ? c : [...c, id]));
      if (id === ruleStage) { state.discover(); state.formalize(); }
    },
  });
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  // une étape est FAITE quand son objectif est atteint ET sa suite de questions répondue : la pastille passe au vert et on fête
  const stepDone = lab.modes.map((m) => L.stageDone(lab, m) && (!cpLive || cleared.includes(m)));
  const nDone = stepDone.findIndex((d) => !d) < 0 ? stepDone.length : stepDone.findIndex((d) => !d);
  const party = useStepCelebration();
  const celebrated = useRef({ n: 0, inits: scene.inits });
  if (celebrated.current.inits !== scene.inits) celebrated.current = { n: 0, inits: scene.inits };   // « إعادة » : on refête
  useEffect(() => {
    if (nDone <= celebrated.current.n) return;
    celebrated.current.n = nDone;
    party.celebrate({ n: nDone, total: stepDone.length });
  }, [nDone]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { rule }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const last = lab.last;
    if (!last) return;
    // le son du GESTE (muet sans « الصوت ») : un pas par valeur validée, le drapeau à l'objectif, la cloche pour un cas complet, « over » au-delà
    if (last.kind === 'hit') playSfx('flag');
    else if (last.kind === 'above') playSfx('over');
    else if (last.kind === 'knobs') playSfx(last.which === 'affine' ? 'tooth' : 'bell');
    else if (last.kind === 'image' || last.kind === 'below') playSfx('tooth');
    if (last.kind === 'image' || last.kind === 'hit' || last.kind === 'below' || last.kind === 'above') {
      state.report(onTrial, { kind: last.kind, x: last.x, fx: L.numText(last.fx) });
    } else if (last.kind === 'knobs') {
      state.report(onTrial, { kind: 'knobs', which: last.which, a: L.numText(last.a), b: L.numText(last.b) });
    }
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur du bloc, hauteur de l'écran de leçon, hauteur des commandes ── */
  const boxRef = useRef(null);
  const ctrlRef = useRef(null);
  const [width, setWidth] = useState(300);
  const [ctrlH, setCtrlH] = useState(220);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      if (ctrlRef.current) setCtrlH(Math.ceil(ctrlRef.current.getBoundingClientRect().height));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (ctrlRef.current) ro.observe(ctrlRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 576;
  const budget = Math.max(320, screenH - 12);
  const wide = width >= 640;
  const narrow = width < 360;
  const GAP = 12;
  const colW = wide ? Math.floor((width - GAP) * 0.56) : width;
  const sceneH = wide
    ? Math.round(Math.min(150, Math.max(104, colW * 0.3)))
    : Math.round(Math.min(narrow ? 92 : 112, Math.max(80, width * 0.27)));
  const meterH = wide
    ? Math.round(Math.max(150, Math.min(250, budget - sceneH - GAP - 8)))
    : Math.round(Math.max(118, Math.min(210, budget - sceneH - ctrlH - 2 * GAP - 8)));

  /* ── x : la voiture (la carte de pointage) sur la règle ── */
  const EDGE = 22;
  const range = lab.range;
  const mu = (colW - 2 * EDGE) / Math.max(1, range.max - range.min);
  const toValue = useCallback((cx, _y, rect) => range.min + (cx - rect.left - EDGE) / mu, [range.min, mu]);
  const commitX = useCallback((v) => { setLiveX(v); setLab((s) => L.commit(s, v)); }, []);
  const X = liveX ?? L.defaultX(lab);
  const stretch = useStretchInteraction({ value: X, range, toValue, onChange: setLiveX, onCommit: commitX, direction: 'ltr' });
  // Un x PAR DÉFAUT : le compteur n'est jamais vide à l'ouverture (2026-10-09). Ce n'est pas un essai
  // (rien dans `trials` / `antTrials`) et jamais une marque du manuel ni la cible.
  // Miroir synchrone de `lab` pour « جرّب كل الإمكانيات ».
  const labRef = useRef(lab);
  labRef.current = lab;
  const sweepStep = (x) => { labRef.current = L.commit(labRef.current, x); setLiveX(x); setLab((s) => L.commit(s, x)); };
  const untried = L.untriedXs(lab);

  /* ── a et b : les deux boutons de l'étape classify ── */
  const knobA = useKnob(lab, setLab, 'a');
  const knobB = useKnob(lab, setLab, 'b');

  const f = L.current(lab);
  const fx = X == null ? null : L.meterAt(lab, X);
  const FN = w('fn');
  const $ = (tex) => `$${tex}$`;
  const multi = lab.modes.length > 1;

  /* ── l'écran du compteur : f(x) = a × x + b = total ── */
  const screenTex = X == null
    ? `${FN}(x) = \\;?`
    : `${FN}(${X}) = ${L.numTex(f.a)} \\times ${X} + ${L.numTex(f.b)} = ${L.numTex(fx)}`;

  const last = lab.last;
  const unitCount = (x) => w('units', { count: x });
  const verdict = last && (() => {
    switch (last.kind) {
      case 'image': return <span className="text-slate-700"><MathText>{k('vImage', { x: unitCount(last.x), fx: L.numText(last.fx), fn: $(`${FN}(${last.x}) = ${L.numTex(last.fx)}`) })}</MathText></span>;
      case 'below': return <span className="text-amber-800"><MathText>{k('vBelow', { gap: L.numText(last.gap) })}</MathText></span>;
      case 'above': return <span className="text-amber-800"><MathText>{k('vAbove', { gap: L.numText(Lin.neg(last.gap)) })}</MathText></span>;
      case 'hit': return <span className="text-emerald-800"><MathText>{k('vHit', { x: unitCount(last.x), m: L.numText(lab.target) })}</MathText></span>;
      case 'knobs': return <span className={last.which === 'affine' ? 'text-slate-700' : 'text-emerald-800'}><MathText>{k(`vKnobs_${last.which}`, { f: $(`${FN}(x) = ${L.ruleTex(lab)}`) })}</MathText></span>;
      case 'stage': return <span className="text-slate-700">{k(`vStage_${last.stage}`)}</span>;
      case 'noX': return <span className="text-slate-600">{k('vNoX')}</span>;
      default: return null;
    }
  })();

  /* ── la découverte : distracteurs réfutés par les essais de l'élève ── */
  const discoveryOptions = useMemo(() => discoveryOptionsOf(lab, k, w, FN), [lab, k, w, FN]);

  /* ── commandes ── */
  const nudgeBtn = (d) => (
    <button type="button" onClick={() => stretch.nudge(d)} aria-label={w(d < 0 ? 'less' : 'more')}
      disabled={X != null && (d < 0 ? X <= range.min : X >= range.max)}
      {...(d < 0 ? { 'data-am-less': '' } : { 'data-am-more': '' })}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white/90 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
      {d < 0 ? <Minus className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
    </button>
  );

  const nxt = L.nextStage(lab);
  const stageDone = L.stageDone(lab, stageOf);
  const prevStage = lab.modes[lab.modes.indexOf(stageOf) - 1];
  const stageTabs = multi && (
    <div className="flex flex-wrap items-center gap-2" data-am-stages>
      <LabStepper count={lab.modes.length} current={lab.modes.indexOf(stageOf)} done={stepDone} stepAttr="data-am-step" />
      {prevStage && (
        <button type="button" onClick={() => setLab((st) => L.setStage(st, prevStage))} data-am-stage-tab={prevStage}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-2 text-xs font-bold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
          {k('stageBack')}
        </button>
      )}
    </div>
  );

  const targetBox = stageOf === 'antecedent' && lab.hit && (
    <div className="space-y-1 rounded-xl border-2 border-emerald-300 bg-emerald-50/60 px-2 py-1" data-am-inverse>
      <span className={`block font-bold text-emerald-900 ${narrow ? 'text-[11px] leading-tight' : 'text-xs'}`}><MathText>{k('inverseLabel')}</MathText></span>
      {L.inverseLines(lab).map((tex) => (
        <span key={tex} dir="ltr" className={`block whitespace-nowrap font-mono text-emerald-900 ${narrow ? 'text-[11px]' : 'text-sm'}`}><MathText>{`$${tex}$`}</MathText></span>
      ))}
    </div>
  );

  const kindRow = stageOf === 'classify' && (
    <div className="flex flex-wrap gap-1" data-am-kinds>
      {['affine', 'linear', 'constant'].map((kd) => {
        const on = L.kinds(lab)[kd];
        return (
          <span key={kd} data-am-kind={kd} data-on={on ? 'true' : 'false'}
            className={`rounded-full border px-1.5 py-0.5 ${narrow ? 'text-[11px]' : 'text-xs'} font-bold ${on ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-400'}`}>
            {on ? '✓' : '✗'} {k(`kind_${kd}`)}
          </span>
        );
      })}
    </div>
  );

  const knobs = stageOf === 'classify' && (
    <div className="space-y-1" data-am-knobs>
      <Knob id="a" knob={knobA} lab={lab} k={k} label={k('knobA')} narrow={narrow} />
      <Knob id="b" knob={knobB} lab={lab} k={k} label={k('knobB')} narrow={narrow} />
      {kindRow}
    </div>
  );

  const nextCard = stageDone && nxt && !cp.blocking && (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-2 py-1" data-am-next={nxt}>
      <span className={narrow ? 'sr-only' : 'text-xs font-bold text-emerald-900'}><MathText>{k(`next_${stageOf}`)}</MathText></span>
      <button type="button" onClick={() => setLab((s) => L.setStage(s, nxt))}
        className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-emerald-700 bg-emerald-700 px-2 text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
        {k(`stage_${nxt}`)} <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );

  const controls = (
    <div ref={ctrlRef} className="space-y-2" data-am-controls>
      {stageTabs}
      <div className="flex flex-wrap items-center gap-2">
        <div dir="ltr" className="flex items-center gap-1">
          {nudgeBtn(-1)}
          <span className="min-w-[3.4rem] rounded-xl bg-slate-900 px-2 py-1 text-center font-mono text-base font-extrabold text-amber-300" aria-label={w('xAria')} data-am-x={X ?? ''}>
            {X == null ? '–' : X}<span className="text-[10px] text-amber-100"> {w('unitShort')}</span>
          </span>
          {nudgeBtn(1)}
        </div>
        {!narrow && <span className="text-xs text-slate-600">{w('xName')}</span>}
      </div>
      {targetBox}
      {knobs}
      {nextCard}
      <p role="status" className={`min-h-[2.25rem] font-bold leading-snug ${narrow ? 'text-xs' : 'text-sm'}`} data-am-verdict={last?.kind ?? ''}>{verdict}</p>
    </div>
  );

  const meter = (
    <MeterPanel lab={lab} x={X} fx={fx} height={meterH} width={colW} screenTex={screenTex} narrow={narrow} k={k} w={w} />
  );

  const sol = state.isFormal || state.isDiscovered;
  const wt = L.proportionWitness(lab);

  return (
    <ManipulationShell
      type="affine-meter"
      title={title ?? w('title')}
      mission={mission ?? w(multi ? 'missionMulti' : 'mission')}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={[w('hint1'), k(lab.marks.length ? 'hint2Marks' : 'hint2'), k(lab.target ? 'hint3Target' : 'hint3')].map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{
        autoStep: () => false,
        canAutoStep: () => false,
        autoComplete: stageOf === 'image' || stageOf === 'antecedent' ? {
          label: t('manipulation.autoComplete.tryAll'),
          ready: true,
          remaining: untried.length,
          intervalMs: 480,
          maxTicks: 80,
          step: () => { const x = L.untriedXs(labRef.current)[0]; if (x !== undefined) sweepStep(x); },
          finish: () => { L.untriedXs(labRef.current).forEach(sweepStep); },
        } : undefined,
      }}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={w('dPrompt')}
          options={discoveryOptions}
          formal={sol && (
            <div className="space-y-2" data-am-formal>
              <EquationDisplay tone="result" tex={`${FN}(x) = ${L.ruleTex({ ...lab, stage: 'image' })}`} note={<MathText>{k('fRule', { a: $(L.numTex(lab.f.a)), b: $(L.numTex(lab.f.b)) })}</MathText>} />
              {wt && (
                <EquationDisplay tone="ko" tex={wt.kind === 'zero' ? `${FN}(0) = ${L.numTex(wt.fx)} \\neq 0` : `${FN}(${2 * wt.x}) = ${L.numTex(wt.f2x)} \\neq 2 \\times ${FN}(${wt.x})`} note={<MathText>{k('fNotProp')}</MathText>} />
              )}
              {lab.hit && L.inverseLines(lab).map((tex) => <EquationDisplay key={tex} tone="neutral" tex={tex} />)}
              {lab.hit && <p className="text-sm text-emerald-900"><MathText>{k('fInverse')}</MathText></p>}
              {lab.visited.linear && <EquationDisplay tone="neutral" tex={`b = 0 : \\; ${FN}(x) = ${L.numTex(lab.f.a)}x`} note={<MathText>{k('fLinear')}</MathText>} />}
              {lab.visited.constant && <EquationDisplay tone="neutral" tex={`a = 0 : \\; ${FN}(x) = ${L.numTex(lab.f.b)}`} note={<MathText>{k('fConstant')}</MathText>} />}
            </div>
          )}
        />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white" data-dragging={stretch.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="relative space-y-2" data-affine-meter data-rule={rule} data-stage={stageOf} data-x={X ?? ''} data-fx={fx == null ? '' : L.numText(fx)}
          data-layout={wide ? 'side' : narrow ? 'narrow' : 'stack'} data-world={theme} data-budget={budget}>
          {party.node}
          {cp.node}
          <div className={wide ? 'grid items-start gap-3' : 'space-y-2'} style={wide ? { gridTemplateColumns: `${colW}px 1fr` } : undefined} data-am-glance>
            <div className="space-y-2">
              <Street theme={theme} width={colW} height={sceneH} edge={EDGE} range={range} x={X} marks={lab.marks} stretch={stretch}
                handleLabel={w('handle')} valueText={X == null ? k('notSet') : unitCount(X)} />
              {meter}
            </div>
            {controls}
          </div>
          <LabFold id="affine-meter.trials" title={k('trialsTitle')}>
            <TrialsTable lab={lab} fn={FN} k={k} w={w} />
          </LabFold>
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── un bouton (a ou b) : une réglette, −/+, clavier ── */
function useKnob(lab, setLab, which) {
  const g = which === 'a' ? lab.aGrid : lab.bGrid;
  const range = useMemo(() => ({ min: 0, max: g.max }), [g.max]);
  const toValue = useCallback((cx, _y, rect) => ((cx - rect.left - 10) / Math.max(1, rect.width - 20)) * g.max, [g.max]);
  const s = useStretchInteraction({
    value: lab.knobs[which], range, toValue, direction: 'ltr',
    onChange: (v) => setLab((st) => L.setKnob(st, which, v)),
    onCommit: (v) => setLab((st) => L.commitKnobs(L.setKnob(st, which, v))),
  });
  return { ...s, which, step: g.step, max: g.max };
}

function Knob({ id, knob, lab, k, label, narrow }) {
  const v = lab.knobs[id] * knob.step;
  const pct = (lab.knobs[id] / Math.max(1, knob.max)) * 100;
  return (
    <div className="flex items-center gap-1" dir="ltr" data-am-knob={id} data-value={v}>
      <span className="w-6 text-center font-mono text-sm font-extrabold text-slate-800" aria-hidden="true">{id}</span>
      {!narrow && <button type="button" onClick={() => knob.nudge(-1)} aria-label={k(`knobLess_${id}`)} data-am-knob-less={id} disabled={lab.knobs[id] <= 0}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>}
      <div {...knob.trackProps} className="relative h-11 min-w-[72px] flex-1" style={{ ...knob.trackProps.style }}>
        <div className="absolute inset-x-2 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" aria-hidden="true" />
        <div className="absolute start-2 top-1/2 h-2 -translate-y-1/2 rounded-full bg-amber-500" style={{ width: `calc(${pct}% - ${pct * 0.16}px)` }} aria-hidden="true" />
        <div {...knob.handleProps({ label, valueText: String(v) })}
          className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-amber-700 bg-white outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
          style={{ left: `calc(10px + (100% - 20px) * ${pct / 100})` }} />
      </div>
      {!narrow && <button type="button" onClick={() => knob.nudge(1)} aria-label={k(`knobMore_${id}`)} data-am-knob-more={id} disabled={lab.knobs[id] >= knob.max}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>}
      <bdi className={`${narrow ? 'min-w-[2.8rem] text-xs' : 'min-w-[3.6rem] text-sm'} text-end font-mono font-extrabold text-slate-900`}>{v}</bdi>
    </div>
  );
}

/* ── le compteur : l'écran, le bloc b (une fois) et x tuiles de a — ou, en classify, quatre compteurs ── */
function MeterPanel({ lab, x, fx, height, width, screenTex, narrow, k, w }) {
  const reduce = useReducedMotion();
  const f = L.current(lab);
  const goal = lab.stage === 'antecedent';
  const twoLines = narrow && fx != null;
  const screenH = (twoLines ? 40 : 40) + (goal ? 24 : 0);
  const inner = Math.max(60, height - screenH - 12);
  const classify = lab.stage === 'classify';
  // Étroit : « a × x + b » puis « f(x) = total » (deux lignes courtes, jamais rognées).
  const parts = screenTex.split(' = ');
  const [lhs, total] = twoLines ? [parts[1], `${parts[0]} = ${parts[2]}`] : [screenTex, null];
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-800 p-1.5" style={{ height }} data-am-meter data-tiles={x ?? 0}>
      <div dir="ltr" className={`flex flex-col items-center justify-center overflow-hidden rounded-lg bg-slate-950 px-1 font-mono text-amber-300 ${narrow ? 'text-[11px]' : ''}`} style={{ height: screenH }} data-am-screen>
        <span className="whitespace-nowrap"><MathText>{`$${lhs}$`}</MathText>{fx != null && !twoLines && <span className="ms-1 text-xs font-bold">DA</span>}</span>
        {twoLines && <span className="whitespace-nowrap"><MathText>{`$${total}$`}</MathText><span className="ms-1 text-xs font-bold">DA</span></span>}
        {goal && (
          <span dir="rtl" className="mt-0.5 flex w-full items-center justify-center gap-1 rounded border border-dashed border-rose-400 px-1 text-[11px] font-bold text-rose-200"
            data-am-target={L.numText(lab.target)} data-gap={fx == null ? '' : L.numText(Lin.sub(lab.target, fx))}>
            {k('targetLabel')} <bdi dir="ltr">{L.numText(lab.target)} DA</bdi>
            {fx != null && !Lin.eq(lab.target, fx) && <bdi dir="ltr">({Lin.cmp(fx, lab.target) < 0 ? '−' : '+'}{L.numText(Lin.cmp(fx, lab.target) < 0 ? Lin.sub(lab.target, fx) : Lin.sub(fx, lab.target))})</bdi>}
            {fx != null && Lin.eq(lab.target, fx) && <span aria-hidden="true">✓</span>}
          </span>
        )}
      </div>
      {classify ? (
        <SweepBars lab={lab} height={inner} width={width - 12} k={k} />
      ) : (
        <BlockMeter b={f.b} a={f.a} n={x ?? 0} height={inner} width={width - 12} base={width < 272 ? k('baseShort') : w('base')} per={w('per')} reduce={reduce} />
      )}
    </div>
  );
}

function BlockMeter({ a, b, n, height, width, base, per, reduce }) {
  const baseW = width < 260 ? 52 : Math.max(64, Math.min(120, Math.round(width * 0.26)));
  const areaW = width - baseW - 10;
  const areaH = height - 6;
  const g = L.tileGrid(n, areaW / Math.max(1, areaH));
  const size = n ? Math.max(12, Math.min(46, Math.floor(Math.min(areaW / g.cols, areaH / g.rows)) - 3)) : 0;
  const showText = size >= 28;
  return (
    <div className="mt-1.5 flex gap-2.5" dir="ltr" style={{ height: areaH }}>
      <div className="flex shrink-0 flex-col items-center justify-center rounded-lg border-2 border-sky-300 bg-sky-500 px-1 text-center text-white" style={{ width: baseW }} data-am-base>
        <span className={`font-mono ${baseW < 64 ? "text-xs" : "text-sm"} font-extrabold`}>{L.numText(b)}</span>
        <span dir="rtl" className={`${baseW < 64 ? "text-[9px]" : "text-[10px]"} break-words font-bold leading-tight`}>{base}</span>
      </div>
      <div className="relative flex-1" data-am-tiles-area>
        {n === 0 ? (
          <p dir="rtl" className="flex h-full items-center justify-center text-center text-[11px] font-bold text-slate-300">{per}</p>
        ) : (
          <div className="grid content-start gap-[3px]" style={{ gridTemplateColumns: `repeat(${g.cols}, ${size}px)` }}>
            {Array.from({ length: n }, (_, i) => (
              <span key={i} data-am-tile className="flex items-center justify-center rounded-md border border-amber-200 bg-amber-400 font-mono text-[10px] font-extrabold text-slate-900"
                style={{ width: size, height: size, transition: reduce ? 'none' : 'opacity 160ms', opacity: 1 }}>
                {showText ? L.numText(a) : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SweepBars({ lab, height, width, k }) {
  const xs = L.sweep(lab);
  const f = L.current(lab);
  const aMax = lab.aGrid.max * lab.aGrid.step;
  const top = Math.max(1, aMax * lab.range.max);
  const baseH = Lin.toNumber(f.b) > 0 ? 22 : 0;
  const labelH = 16;
  const barArea = height - labelH * 2 - 6;
  const colW = Math.floor((width - 10) / xs.length);
  return (
    <div className="mt-1.5 flex items-end justify-around" dir="ltr" style={{ height: height - 4 }} data-am-sweep aria-label={k('sweepAria')}>
      {xs.map((x) => {
        const v = L.meterAt(lab, x);
        const varH = Math.round(((Lin.toNumber(f.a) * x) / top) * (barArea - 22));
        return (
          <div key={x} className="flex flex-col items-center" style={{ width: colW }}>
            <span className="font-mono text-[10px] font-bold text-amber-200">{L.numText(v)}</span>
            {varH > 0 && <span className="w-3/5 rounded-t bg-amber-400" style={{ height: varH }} />}
            {baseH > 0 && <span className={`w-3/5 bg-sky-500 ${varH > 0 ? '' : 'rounded-t'}`} style={{ height: baseH }} />}
            {varH === 0 && baseH === 0 && <span className="w-3/5 border-t-2 border-dashed border-slate-400" />}
            <span className="font-mono text-[10px] text-slate-300">x = {x}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── les essais de l'élève (LabFold) ── */
function TrialsTable({ lab, fn, k, w }) {
  const xs = lab.trials;
  if (!xs.length) return <p className="text-xs text-slate-500" data-am-trials>{k('trialsEmpty')}</p>;
  return (
    <div className="overflow-x-auto" data-am-trials>
      <table dir="ltr" className="w-full border-collapse text-center font-mono text-xs">
        <tbody>
          <tr>
            <th scope="row" className="border border-slate-200 bg-slate-100 px-1.5 py-1 text-start font-bold" dir="rtl">{w('xName')}</th>
            {xs.map((x) => <td key={x} className="border border-slate-200 px-1.5 py-1 font-bold">{x}</td>)}
          </tr>
          <tr>
            <th scope="row" className="border border-slate-200 bg-slate-100 px-1.5 py-1 text-start font-bold"><MathText>{`$${fn}(x)$`}</MathText></th>
            {xs.map((x) => <td key={x} className="border border-slate-200 px-1.5 py-1" data-am-trial={x}>{L.numText(L.meterAt({ ...lab, stage: 'image' }, x))}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ── la rue (ride) ou l'atelier (payroll) : la règle de x et sa poignée ── */
function Street({ theme, width, height, edge, range, x, marks, stretch, handleLabel, valueText }) {
  const reduce = useReducedMotion();
  const steps = Math.max(1, range.max - range.min);
  const mu = (width - 2 * edge) / steps;
  const px = (v) => edge + (v - range.min) * mu;
  const shown = x ?? range.min;
  const groundY = Math.round(height * 0.62);
  const rulerY = Math.round(height * 0.8);
  const every = steps <= 12 ? 1 : width < 340 ? 5 : 2;
  const grads = Array.from({ length: steps + 1 }, (_, i) => range.min + i);
  const handleH = Math.max(30, Math.min(48, Math.round(height * 0.36)));
  const ride = theme !== 'payroll';
  const turn = (x ?? 0) * 150;
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-200" style={{ height }} data-am-scene>
      <div {...stretch.trackProps} dir="ltr" className="absolute inset-0" style={{ ...stretch.trackProps.style }}>
        <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" data-deco={ride ? 'street' : 'workshop'}>
          {ride ? (
            <>
              <rect x="0" y="0" width={width} height={groundY} fill="#E0F2FE" />
              {Array.from({ length: Math.ceil(width / 46) }, (_, i) => {
                const bh = groundY * (0.55 + ((i * 37) % 30) / 100);
                return (
                  <g key={i}>
                    <rect x={i * 46 + 2} y={groundY - bh} width="42" height={bh} fill="#F8FAFC" stroke="#CBD5E1" />
                    {Array.from({ length: Math.max(1, Math.floor(bh / 16)) }, (_, j) => (
                      <rect key={j} x={i * 46 + 9} y={groundY - bh + 5 + j * 16} width="9" height="8" fill="#2563EB" opacity="0.75" />
                    ))}
                    {Array.from({ length: Math.max(1, Math.floor(bh / 16)) }, (_, j) => (
                      <rect key={`r${j}`} x={i * 46 + 26} y={groundY - bh + 5 + j * 16} width="9" height="8" fill="#2563EB" opacity="0.75" />
                    ))}
                  </g>
                );
              })}
              <rect x="0" y={groundY} width={width} height={rulerY - groundY} fill="#475569" />
              {Array.from({ length: Math.ceil(width / 28) }, (_, i) => <rect key={i} x={i * 28 + 4} y={(groundY + rulerY) / 2 - 1} width="14" height="2" fill="#F8FAFC" />)}
            </>
          ) : (
            <>
              <rect x="0" y="0" width={width} height={groundY} fill="#FEF3C7" />
              <rect x="0" y={groundY - 10} width={width} height="10" fill="#D6D3D1" />
              <g transform={`translate(${width - 34} ${Math.max(20, groundY * 0.42)})`}>
                <circle r="16" fill="#FFFFFF" stroke="#78350F" strokeWidth="2" />
                <line x1="0" y1="0" x2="0" y2="-11" stroke="#1E293B" strokeWidth="2" strokeLinecap="round"
                  style={{ transform: `rotate(${turn}deg)`, transition: reduce ? 'none' : 'transform 200ms' }} />
                <line x1="0" y1="0" x2="7" y2="0" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round"
                  style={{ transform: `rotate(${(x ?? 0) * 12.5}deg)`, transition: reduce ? 'none' : 'transform 200ms' }} />
              </g>
              {/* Le tableau de pointage : une case tamponnée par heure supplémentaire réglée (l'écho de x,
                  jamais le salaire) ; à droite une étagère d'atelier. Les deux anciens rectangles blancs vides
                  se lisaient comme des « tableaux vides » (retour du propriétaire, 2026-10-02). */}
              {(() => {
                const cols = Math.ceil(steps / 2);
                const bw = Math.min(width * 0.36, cols * 14 + 10);
                const cw = (bw - 10) / cols;
                const top = groundY * 0.18;
                const ch = Math.min(cw, (groundY * 0.62 - 10) / 2);
                return (
                  <g data-deco="timeboard">
                    <rect x={width * 0.06} y={top} width={bw} height={ch * 2 + 10} rx="4" fill="#78350F" />
                    {Array.from({ length: cols * 2 }, (_, i) => {
                      const on = i < (x ?? 0) - range.min;
                      return (
                        <rect key={i} x={width * 0.06 + 5 + (i % cols) * cw + 1} y={top + 5 + Math.floor(i / cols) * ch + 1}
                          width={Math.max(2, cw - 2)} height={Math.max(2, ch - 2)} rx="1.5"
                          fill={on ? '#F59E0B' : '#FEF3C7'} style={{ transition: reduce ? 'none' : 'fill 150ms' }} />
                      );
                    })}
                  </g>
                );
              })()}
              <g data-deco="shelf">
                {[0.34, 0.62].map((fy) => (
                  <g key={fy}>
                    <rect x={width * 0.5} y={groundY * fy} width={width * 0.3} height="4" fill="#92400E" />
                    {[0, 1, 2].map((k) => (
                      <rect key={k} x={width * (0.52 + k * 0.09)} y={groundY * fy - 14 - ((k + Math.round(fy * 10)) % 2) * 4}
                        width={width * 0.06} height={14 + ((k + Math.round(fy * 10)) % 2) * 4} rx="2"
                        fill={['#D97706', '#B45309', '#FBBF24'][(k + Math.round(fy * 10)) % 3]} />
                    ))}
                  </g>
                ))}
              </g>
              <rect x="0" y={groundY} width={width} height={rulerY - groundY} fill="#E7E5E4" />
            </>
          )}
          <rect x="0" y={rulerY} width={width} height={height - rulerY} fill="#FFFBEB" />
          <line x1={edge} x2={width - edge} y1={rulerY + 3} y2={rulerY + 3} stroke="#B45309" strokeWidth="3" />
          {x != null && <rect x={edge} y={rulerY + 1} width={Math.max(0, px(x) - edge)} height="5" rx="2" fill="#F59E0B" />}
          {grads.map((u) => {
            const major = (u - range.min) % every === 0 || u === range.max;
            return (
              <g key={u}>
                <line x1={px(u)} x2={px(u)} y1={rulerY + 3} y2={rulerY + (major ? 9 : 6)} stroke="#475569" strokeWidth={major ? 1.4 : 1} />
                {major && <text x={px(u)} y={Math.min(height - 2, rulerY + 18)} textAnchor="middle" fontSize="10" fill="#334155" fontFamily="ui-monospace, monospace">{u}</text>}
              </g>
            );
          })}
          {marks.map((m) => <path key={m} d={`M${px(m) - 4} ${rulerY - 2} h8 l-4 5 z`} fill="#DC2626" data-am-mark={m} />)}
        </svg>
        <div
          {...stretch.handleProps({ label: handleLabel, valueText })}
          data-am-handle
          className={`absolute flex -translate-x-1/2 items-end justify-center rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${stretch.dragging ? 'bg-amber-500/10' : ''}`}
          style={{ left: px(shown), top: rulerY - handleH - 2, width: Math.max(44, handleH * 1.3), height: handleH + 4, cursor: stretch.dragging ? 'grabbing' : 'grab', transition: stretch.dragging || reduce ? 'none' : 'left 160ms ease-out' }}
        >
          {ride ? (
            <svg viewBox="0 0 64 40" width={handleH * 1.3} height={handleH * 0.82} aria-hidden="true" focusable="false" data-deco="car"
              style={{ transform: stretch.dragging && !reduce ? 'rotate(-3deg)' : 'none', transition: reduce ? 'none' : 'transform 150ms' }}>
              <path d="M6 26 L10 16 Q14 9 22 9 H40 Q48 9 52 16 L58 22 Q62 23 62 28 V31 H4 V28 Q4 26 6 26 Z" fill="#FACC15" stroke="#854D0E" strokeWidth="1.5" />
              <path d="M15 17 Q17 12 23 12 H31 V18 H15 Z M34 12 H40 Q45 12 48 18 H34 Z" fill="#BAE6FD" />
              <rect x="27" y="5" width="11" height="5" rx="1.5" fill="#1E293B" />
              {[16, 48].map((cx) => (
                <g key={cx} style={{ transformOrigin: `${cx}px 31px`, transform: `rotate(${turn}deg)`, transition: reduce ? 'none' : 'transform 200ms linear' }}>
                  <circle cx={cx} cy="31" r="6.5" fill="#1E293B" />
                  <circle cx={cx} cy="31" r="2.6" fill="#CBD5E1" />
                  <line x1={cx} y1="25.5" x2={cx} y2="36.5" stroke="#94A3B8" strokeWidth="1" />
                </g>
              ))}
            </svg>
          ) : (
            <svg viewBox="0 0 40 44" width={handleH * 0.9} height={handleH} aria-hidden="true" focusable="false" data-deco="timecard">
              <rect x="4" y="2" width="32" height="40" rx="3" fill="#FFFFFF" stroke="#78350F" strokeWidth="2" />
              <circle cx="20" cy="15" r="8" fill="#FDE68A" stroke="#78350F" strokeWidth="1.5" />
              <path d="M20 15 V10 M20 15 L24 17" stroke="#78350F" strokeWidth="1.6" strokeLinecap="round" />
              {[28, 33, 38].map((yy) => <line key={yy} x1="9" x2="31" y1={yy} y2={yy} stroke="#A8A29E" strokeWidth="1.4" />)}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════ la découverte (hors labo et dans la suite de questions) ══════════════ */

function discoveryOptionsOf(lab, k, w, FN) {
  const $ = (tex) => `$${tex}$`;
    const a = L.numText(lab.f.a); const b = L.numText(lab.f.b);
    const fTex = $(`${FN}(x) = ${L.numTex(lab.f.a)}x + ${L.numTex(lab.f.b)}`);
    const opts = [{ text: <MathText>{k(lab.target ? 'dRightInverse' : 'dRight', { f: fTex, a, b, m: lab.target ? L.numText(lab.target) : '' })}</MathText>, correct: true }];
    const wt = L.proportionWitness(lab);
    if (wt) {
      opts.unshift({
        text: <MathText>{w('dProp')}</MathText>,
        why: <MathText>{wt.kind === 'zero'
          ? k('dWhyPropZero', { line: $(`${FN}(0) = ${L.numTex(wt.fx)} \\neq 0`) })
          : k('dWhyPropDouble', { line: $(`${FN}(${2 * wt.x}) = ${L.numTex(wt.f2x)} \\neq 2 \\times ${L.numTex(wt.fx)}`) })}</MathText>,
      });
    }
    const xs = lab.trials.filter((x) => x > 0);
    const x1 = xs[0] ?? 1;
    const sum = L.perUnitSum(lab);
    opts.push({
      text: <MathText>{k('dSum', { s: $(`${FN}(x) = ${L.numTex(sum)}x`) })}</MathText>,
      why: <MathText>{k('dWhySum', { line: $(`${L.numTex(sum)} \\times ${x1} = ${L.numTex(Lin.mul(sum, x1))} \\neq ${L.numTex(L.meterAt({ ...lab, stage: 'image' }, x1))}`) })}</MathText>,
    });
    if (lab.target) {
      opts.push({
        text: <MathText>{k('dOrder', { m: L.numText(lab.target), a, b })}</MathText>,
        why: <MathText>{k('dWhyOrder', { b, line: $(`${L.numTex(lab.target)} \\div ${L.numTex(lab.f.a)} \\approx ${Lin.toNumber(L.divideOnly(lab)).toFixed(1).replace('.', '{,}')}`) })}</MathText>,
      });
    }
    return opts;
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque étape ; l'étape qui ferme la découverte (image seule, ou antécédent) finit par LA RÈGLE. */
export function chainOf(lab, stage) {
  const base = { image: ['fixed', 'step'], antecedent: ['first', 'rest'], classify: ['linear', 'constant'] }[stage];
  const ruleStage = lab.modes.filter((m) => m !== 'classify').at(-1);
  return stage === ruleStage ? [...base, 'rule'] : base;
}
export const CHAINS = Object.freeze({ image: ['fixed', 'step'], antecedent: ['first', 'rest'], classify: ['linear', 'constant'] });

const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const T = (x) => <MathText>{`$${x}$`}</MathText>;
const D = (x) => `$${x}$`;

/** Chaque question est construite sur LES essais de l'élève (rien n'est écrit en dur) ; `k`, `w` : les textes de `affineMeter`. */
export const QUESTIONS = {
  fixed: (lab, k, w, FN) => {
    const wt = L.proportionWitness(lab);
    const b = lab.f.b;
    if (wt.kind === 'zero') {
      return {
        id: 'fixed', kind: 'number', expected: Lin.fracText(b), answer: T(L.numTex(b)),
        prompt: Cq(k, 'fixed.promptZero'), hints: [Cq(k, 'fixed.hint1'), Cq(k, 'fixed.hint2')],
        explain: Cq(k, 'fixed.explainZero', { line: D(`${FN}(0) = ${L.numTex(b)}`) }),
      };
    }
    const dbl = Lin.mul(wt.fx, 2);
    const o = { x: wt.x, x2: 2 * wt.x, fx: D(L.numTex(wt.fx)), f2x: D(L.numTex(wt.f2x)), dbl: D(L.numTex(dbl)) };
    return {
      id: 'fixed', kind: 'number', expected: Lin.fracText(b), answer: T(L.numTex(b)),
      prompt: Cq(k, 'fixed.promptDouble', o), hints: [Cq(k, 'fixed.hint1Double', o), Cq(k, 'fixed.hint2')],
      explain: Cq(k, 'fixed.explainDouble', { ...o, b: D(L.numTex(b)) }),
    };
  },
  step: (lab, k, w) => {
    const [x1, x2] = lab.trials;
    const f1 = L.meterAt({ ...lab, stage: 'image' }, x1);
    const f2 = L.meterAt({ ...lab, stage: 'image' }, x2);
    const diff = Lin.sub(f2, f1);
    const o = { x1, x2, f1: D(L.numTex(f1)), f2: D(L.numTex(f2)), diff: D(L.numTex(diff)), d: x2 - x1, unit: w('cpUnit') };
    return {
      id: 'step', kind: 'number', expected: Lin.fracText(lab.f.a), answer: T(L.numTex(lab.f.a)),
      prompt: Cq(k, 'step.prompt', o), hints: [Cq(k, 'step.hint1', o), Cq(k, 'step.hint2', o)],
      explain: Cq(k, 'step.explain', { ...o, a: D(L.numTex(lab.f.a)), calc: D(`${L.numTex(diff)} \\div ${x2 - x1} = ${L.numTex(lab.f.a)}`) }),
    };
  },
  first: (lab, k) => {
    const m = L.numText(lab.target); const a = L.numText(lab.f.a); const b = L.numText(lab.f.b);
    const x = lab.targetX;
    const quo = Lin.toNumber(L.divideOnly(lab)).toFixed(1).replace('.', '{,}');
    const o = { m, a, b, x };
    const opts = [
      { text: Cq(k, 'first.sub', o), correct: true },
      { text: Cq(k, 'first.div', o), why: Cq(k, 'first.whyDiv', { ...o, line: D(`${L.numTex(lab.target)} \\div ${L.numTex(lab.f.a)} \\approx ${quo}`) }) },
      { text: Cq(k, 'first.add', o), why: Cq(k, 'first.whyAdd', { ...o, line: D(`${L.numTex(lab.target)} + ${L.numTex(lab.f.b)} = ${L.numTex(Lin.add(lab.target, lab.f.b))}`) }) },
    ];
    const rot = lab.targetX % 3;
    return {
      id: 'first', kind: 'choice', cols: 1,
      prompt: Cq(k, 'first.prompt', o), options: [...opts.slice(rot), ...opts.slice(0, rot)],
      hints: [Cq(k, 'first.hint1', o), Cq(k, 'first.hint2', o)],
      explain: Cq(k, 'first.explain', { ...o, line: D(L.inverseLines(lab)[0]) }),
    };
  },
  rest: (lab, k) => {
    const r = Lin.sub(lab.target, lab.f.b);
    const o = { m: L.numText(lab.target), b: L.numText(lab.f.b), a: L.numText(lab.f.a), x: lab.targetX };
    return {
      id: 'rest', kind: 'number', expected: Lin.fracText(r), answer: T(L.numTex(r)),
      prompt: Cq(k, 'rest.prompt', o), hints: [Cq(k, 'rest.hint1', o), Cq(k, 'rest.hint2', o)],
      explain: Cq(k, 'rest.explain', { ...o, r: D(L.numTex(r)), calc: D(L.inverseLines(lab)[1]) }),
    };
  },
  linear: (lab, k) => {
    const opts = [
      { text: Cq(k, 'linear.linear'), correct: true },
      { text: Cq(k, 'linear.constant'), why: Cq(k, 'linear.whyConstant') },
      { text: Cq(k, 'linear.neither'), why: Cq(k, 'linear.whyNeither') },
    ];
    const rot = Number(lab.f.a.n) % 3;
    return {
      id: 'linear', kind: 'choice', cols: 1,
      prompt: Cq(k, 'linear.prompt'), options: [...opts.slice(rot), ...opts.slice(0, rot)],
      hints: [Cq(k, 'linear.hint1'), Cq(k, 'linear.hint2')], explain: Cq(k, 'linear.explain'),
    };
  },
  constant: (lab, k) => {
    const opts = [
      { text: Cq(k, 'constant.constant'), correct: true },
      { text: Cq(k, 'constant.grows'), why: Cq(k, 'constant.whyGrows') },
      { text: Cq(k, 'constant.shrinks'), why: Cq(k, 'constant.whyShrinks') },
    ];
    const rot = (Number(lab.f.a.n) + 1) % 3;
    return {
      id: 'constant', kind: 'choice', cols: 1,
      prompt: Cq(k, 'constant.prompt'), options: [...opts.slice(rot), ...opts.slice(0, rot)],
      hints: [Cq(k, 'constant.hint1'), Cq(k, 'constant.hint2')], explain: Cq(k, 'constant.explain'),
    };
  },
  rule: (lab, k, w, FN) => {
    const fTex = D(`${FN}(x) = ${L.numTex(lab.f.a)}x + ${L.numTex(lab.f.b)}`);
    const opts = discoveryOptionsOf(lab, k, w, FN);
    const ci = opts.findIndex((o) => o.correct);
    const rot = ci > 0 ? 0 : Number(lab.f.b.n) % opts.length;
    return {
      id: 'rule', kind: 'choice', cols: 1,
      prompt: <MathText>{w('dPrompt')}</MathText>, options: [...opts.slice(rot), ...opts.slice(0, rot)],
      hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2', { a: L.numText(lab.f.a), b: L.numText(lab.f.b) })],
      explain: Cq(k, 'rule.explain', { f: fTex, a: L.numText(lab.f.a), b: L.numText(lab.f.b) }),
    };
  },
};
