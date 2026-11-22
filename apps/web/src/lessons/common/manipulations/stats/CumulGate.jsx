import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, ArrowUpNarrowWide, DoorOpen } from 'lucide-react';
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
import * as L from '../logic/cumulGate';

/**
 * cumul-gate — LA TOISE DU MANÈGE (unité 8 « الإحصاء », leçon 1 « التكرار المجمع والتواتر المجمع
 * (الصاعد والنازل) »). Monde `funpark` (مبتدئ) : huit enfants dans la file d'un manège d'une حديقة
 * التسلية algérienne, sous le panneau « يجب أن تكون قامتك 130cm على الأقل » ; monde `school` (متقدم,
 * نشاط 1 du manuel) : les 20 élèves d'une classe et leurs tailles, dans l'ordre où le manuel les donne.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève FAIT GLISSER la barre de la toise : sa hauteur EST le seuil t (useStretchInteraction : la barre,
 *    toucher la toise, −/+, flèches ; toucher une personne pose la barre à SA taille). Il choisit le côté
 *    (« على الأكثر » ≤ t / « على الأقل » ≥ t), RANGE la file par taille, puis ANNONCE à la porte combien
 *    passent — la porte vérifie.
 * B. Idée : التكرار المجمع الصاعد de t = le nombre de valeurs ≤ t (la somme des effectifs de t et des valeurs
 *    plus petites), النازل = le nombre de valeurs ≥ t ; t lui-même compte DES DEUX côtés.
 * C. Pendant le geste, les personnes du côté choisi s'allument (sarcelle ≤ t, orange ≥ t), celles qui ont
 *    EXACTEMENT t portent les deux couleurs ; une fois la file rangée, les allumées forment UN bloc.
 * D. Chaque annonce est un ESSAI (`onTrial`) ; acceptée, elle s'écrit comme la somme des effectifs
 *    (« 3 + 4 + 5 = 12 ») et remplit la case de SON tableau (mode `table`).
 * E. À découvrir : au même t, الصاعد + النازل = N + تكرار t (t est compté deux fois) ; le dernier صاعد et
 *    le premier نازل valent N.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        التكرار المجمع الصاعد / النازل d'une valeur t : effectif cumulé de ≤ t / de ≥ t
 *   OBJECT         une toise de manège (sa barre) et la file des personnes dessinées à leur taille
 *   VARIABLE       le seuil t (en cm entiers, de min − 3 à max + 3) — la main tient la barre ; le côté ≤ / ≥
 *   INVARIANT      N (personne n'entre ni ne sort de la file) ; up(t) + down(t) = N + f(t) ; up(max) = down(min) = N
 *   TRANSFORMATION les personnes allumées, le bloc allumé dans la file rangée, la somme écrite à l'acceptation
 *   CONSTRAINT     la porte n'accepte que le compte exact du côté choisi
 *   RESISTANCE     la porte reste fermée et montre son TÉMOIN : les personnes de taille EXACTEMENT t oubliées
 *                  (« على الأقل » les inclut — MISC-IHSA-SARAMA), les groupes allumés à additionner (compte
 *                  trop petit), les personnes NON allumées comptées (compte trop grand), l'autre côté compté
 *   EVIDENCE       la somme des effectifs écrite à chaque compte accepté ; le tableau de l'élève
 *   CONTRAST       une même VALEUR t comptée des deux côtés : 12 + 13 = 25 ≠ 20 ; un t hors série (158) donne
 *                  le même compte que 157 (palier)
 *   PREDICTION     annoncer avant que la porte ne compte ; ranger la file avant de compter
 *   DISCOVERY      « الصاعد + النازل = التكرار الكلي + تكرار t » (distracteurs réfutés par les propres comptes :
 *                  « = N », « الصاعد = النازل »)
 *   FORMALIZATION  12 + 13 = 20 + 5 ; الصاعد لأكبر قيمة = N ; ÷ N → التواتر المجمع (bascule du tableau)
 *   TRANSFER       نشاط 2 (العلامات ÷ 30), معارف 1–2, les فئات (طرائق), ex-1 « تفوق 34 » (strict) en أوظّف
 * Manuel (§6bis) : chaque annonce est une réponse — pas d'auto-complétion.
 * Niveaux : مبتدئ = 8 enfants (4 tailles), file déjà dans l'ordre de la file d'attente, sans tableau ; متقدم =
 * les 20 élèves du manuel dans SON ordre, le tableau du manuel (cases imprimées données) à compléter par ses
 * propres comptes, aucune case suggérée.
 *
 * DÉCOR (exigence du propriétaire) : `funpark` — une grande roue dont la nacelle se balance quand la porte
 * s'ouvre, une guirlande d'ampoules qui clignote ; `school` — une guirlande de fanions qui ondule. Tout est
 * `aria-hidden`, `[data-deco]`, hors du chemin clavier, immobile sous `prefers-reduced-motion`, et ne porte
 * jamais une information du lab.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : la scène (toise + bloc quasi carré de personnes : 20 →
 * 5 × 4, 8 → 3 × 3, `blockLayout`), le côté, t, −/+, l'annonce et le verdict forment le bloc
 * `[data-cg-glance]`, dont la hauteur est budgétée sur l'écran de leçon (`useLessonViewport`) : large
 * (≥ 620 px) scène et commandes côte à côte ; sinon les commandes sous la scène, dont la hauteur est ce qui
 * reste. Les personnes sont dimensionnées par la cellule (jamais un nombre fixe de pixels). Le tableau est un
 * `LabFold` (secondaire), à côté des commandes en large, sous le bloc sinon. Mesuré par
 * apps/web/e2e/lesson-kit/4am-ihsa.mjs aux quatre viewports, deux niveaux.
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 5 ; `primitives/LabCheckpoint`) : `checkpoints` (défaut true). Scène libre, DEUX étapes (`LabStepper`) :
 *   1. le premier compte accepté → `CHAINS.s1` (combien restent dehors · ceux de taille exactement t sont-ils dans le compte) ;
 *   2. une même valeur comptée des DEUX côtés (`discoveryReady`) → `CHAINS.s2` (la somme des deux comptes · de combien elle dépasse N · la règle, qui
 *      remplace la découverte et formalise). Les événements `{ tk: 'checkpoint' | 'checkpoint-done', … }` partent vers `onCheckpoint` (jamais `onTrial` :
 *      ils ne doivent pas entrer dans la liste des annonces). OBLIGATOIRES pour tout élève ; l'ENSEIGNANT les coupe pour SON compte (interrupteur en en-tête).
 * Props : `series` (« 120:2|130:3 » ou les valeurs brutes « 160|165|154|… » dans l'ordre du manuel), `mode`
 * (« up|down » | « up|down|table »), `given` (les cases imprimées : « up:154|down:165 »), `theme`
 * ('funpark' | 'school'), `title`, `lead`, `mission`, `level`, `levels` (false : posé seul sans sélecteur),
 * `onTrial({ t, side, n, ok, kind, want })` à chaque annonce, `onFinished({ t, up, down, N, f })` à la règle
 * formelle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-cumul-gate][data-series][data-t][data-side][data-sorted][data-layout][data-claims],
 * [data-cg-glance], [data-cg-scene], [data-cg-gauge], [data-stretch-handle][data-cg-handle], [data-cg-less|more],
 * [data-cg-side=up|down][aria-pressed], [data-cg-sort], [data-cg-person=<id>][data-v][data-lit][data-exact],
 * [data-cg-input], [data-cg-check], [data-cg-verdict=<kind>], [data-cg-table], [data-cg-col=<v>],
 * [data-cg-cell=<side>:<v>], [data-cg-rel], [data-cg-formal], [data-deco], [data-lab-fold=cumul-gate.table].
 */
const COLORS = { up: '#0F766E', down: '#C2410C' };
const SHIRTS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#14B8A6'];
const HAIR = ['#1E293B', '#78350F', '#0F172A', '#451A03'];

export default function CumulGate({
  series: series0 = '120:2|130:3|140:2|150:1', mode: mode0 = 'up|down', given = '', theme = 'funpark', unit = 'cm',
  title, lead, mission, level, levels: withLevels = true, initialMode = 'student', allowModeSwitch = false,
  onTrial, onFinished, checkpoints: cpOn = true, onCheckpoint,
}) {
  const { t: tr } = useTranslation('lesson');
  const k = useCallback((key, o) => tr(`manipulation.cumulGate.${key}`, o), [tr]);
  const w = useCallback((key, o) => tr(`manipulation.cumulGate.worlds.${theme}.${key}`, o), [tr, theme]);
  const state = useManipulation({ type: 'cumul-gate', initialNumbers: { series: series0, mode: mode0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { series, mode } = state.numbers;
  const givenNow = series === series0 ? given : '';

  const make = () => L.init({ series, mode, given: givenNow });
  const [lab, setLab] = useState(make);
  const sceneKey = `${series}:${mode}:${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  // Le seuil s'ouvre PAR DÉFAUT sous la plus petite taille (personne n'est allumé, aucun compte n'est donné) : ce n'est pas une annonce.
  const [liveT, setT] = useState(null);
  const [side, setSide] = useState('up');
  const [raw, setRaw] = useState('');
  const [rel, setRel] = useState(false);
  const [inits, setInits] = useState(0);
  const [done1, setDone1] = useState(false);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setT(null); setSide('up'); setRaw(''); setRel(false); setInits((n) => n + 1); setDone1(false); }

  const T = liveT ?? L.rangeOf(lab).min;
  // les questions pendant le labo : obligatoires pour tout élève, l'enseignant seul les coupe pour SON compte
  const cpSettings = useLabCheckpointSettings('cumul-gate');
  const cpActive = cpOn && cpSettings.enabled;
  const stage = lab.claims.length === 0 || !done1 ? 's1' : 's2';
  const cpReached = stage === 's1' ? lab.claims.length > 0 : L.discoveryReady(lab);
  const dTnow = L.discoveryT(lab);
  const cp = useLabCheckpoint({
    id: cpActive ? stage : null,
    questions: cpActive && cpReached ? CHAINS[stage].map((q) => QUESTIONS[q](lab, k)) : null,
    reached: cpReached,
    resetKey: inits,
    // « أعِد التجربة » : l'étape recommence — les comptes de l'étape sont retirés (la carte revient quand elle est de nouveau atteinte)
    onRetry: () => setLab((s) => (stage === 's1' ? { ...make(), sorted: s.sorted, people: s.people } : { ...s, last: null, claims: s.claims.filter((c) => c.t !== dTnow), cells: { up: { ...s.cells.up, [dTnow]: s.given.up[dTnow] ? s.cells.up[dTnow] : undefined }, down: { ...s.cells.down, [dTnow]: s.given.down[dTnow] ? s.cells.down[dTnow] : undefined } } })),
    onEvent: (ev) => state.report(onCheckpoint, ev),
    onDone: (id) => { if (id === 's1') setDone1(true); else { state.discover(); state.formalize(); } },
  });
  const ruleByCheckpoint = cpActive;
  const ready = L.discoveryReady(lab) && !ruleByCheckpoint;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  const dT = L.discoveryT(lab);
  useEffect(() => { if (state.isFormal && dT != null) state.report(onFinished, L.invariantAt(lab, dT)); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chaque ANNONCE (acceptée ou refusée) est rapportée à la leçon (sa liste `[data-activity-evidence]`).
  const [trials, setTrials] = useState(0);
  useEffect(() => {
    const last = lab.last;
    if (!last || !['ok', 'strict', 'under', 'over', 'otherSide'].includes(last.kind)) return;
    playSfx(last.kind === 'ok' ? 'flag' : 'over');
    state.report(onTrial, { t: last.t, side: last.side, n: last.n, ok: last.kind === 'ok', kind: last.kind, want: L.count(lab, last.t, last.side) });
  }, [trials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : la largeur de la manipulation et la HAUTEUR de l'écran de leçon ── */
  const boxRef = useRef(null);
  const ctrlRef = useRef(null);
  const [width, setWidth] = useState(300);
  const [ctrlH, setCtrlH] = useState(210);
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
  const screenH = vp.ready && vp.height > 0 ? vp.height : 560;
  const budget = Math.max(300, screenH - 12);
  const wide = width >= 620;
  const GAP = 12;
  const sceneW = wide ? Math.floor((width - GAP) * 0.56) : width;
  const sceneH = wide
    ? Math.round(Math.min(400, Math.max(220, sceneW * 0.82), budget - 16))
    : Math.round(Math.max(170, Math.min(width * 1.05, 380, budget - ctrlH - GAP - 12)));

  /* ── le seuil : la barre de la toise ── */
  const range = L.rangeOf(lab);
  const GAUGE_W = 58;
  const EDGE = 14;
  const mu = (sceneH - 2 * EDGE - 18) / Math.max(1, range.max - range.min);
  const toValue = useCallback((_x, cy, rect) => range.min + (rect.bottom - EDGE - 18 - cy) / mu, [range.min, mu]);
  const stretch = useStretchInteraction({ value: T, range, toValue, onChange: setT, onCommit: setT, direction: 'ltr' });

  // le geste : un cran de la barre = un pas (au plus un son toutes les 35 ms), plus grave en descendant
  const tick = useRef({ t: null, at: 0 });
  useEffect(() => {
    const p = tick.current;
    if (p.t != null && T != null && T !== p.t) {
      const now = Date.now();
      if (now - p.at > 35) { playSfx('tooth', { pitch: T > p.t ? 1 : 0.75 }); p.at = now; }
    }
    p.t = T;
  }, [T]);

  const doSort = () => setLab((s) => L.sortQueue(s));
  const doClaim = (e) => {
    e?.preventDefault?.();
    stretch.flush();
    setLab((s) => L.claim(s, T, side, raw));
    setTrials((n) => n + 1);
  };
  const pickPerson = (v) => { stretch.set(v); stretch.flush(); };

  /* ── les mots ── */
  const $ = (tex) => `$${tex}$`;
  const sideRel = (sd, t = T) => (t == null ? (sd === 'up' ? '\\leq t' : '\\geq t') : `${sd === 'up' ? '\\leq' : '\\geq'} ${t}`);
  const sumText = (groups) => `${groups.map((g) => g.f).join(' + ')} = ${groups.reduce((s, g) => s + g.f, 0)}`;
  const listV = (groups) => groups.map((g) => g.v).join(' ، ');
  const last = lab.last;
  const verdict = last && (() => {
    switch (last.kind) {
      case 'ok': return (
        <span className="text-emerald-800">
          {k('vOkHead')} <bdi dir="ltr" className="whitespace-nowrap font-mono" data-cg-sum>{sumText(last.groups)}</bdi>{' '}
          <MathText>{k(last.value || !lab.withTable ? 'vOk' : 'vOkStep', { cond: $(`${sideRel(last.side, last.t)}`), n: last.n })}</MathText>
        </span>
      );
      case 'strict': return <span className="text-rose-800" data-cg-refused="strict"><MathText>{k(last.side === 'up' ? 'vStrictUp' : 'vStrictDown', { t: last.t, f: last.f, unit })}</MathText></span>;
      case 'under': return <span className="text-rose-800" data-cg-refused="under"><MathText>{k('vUnder', { list: $(listV(last.groups)) })}</MathText></span>;
      case 'over': {
        const unlit = lab.values.map((v, i) => ({ v, f: lab.freqs[i] })).filter((g) => !L.isLit(g.v, last.t, last.side));
        return <span className="text-rose-800" data-cg-refused="over"><MathText>{k(unlit.length ? 'vOver' : 'vOverAll', { list: $(listV(unlit)), n: lab.N })}</MathText></span>;
      }
      case 'otherSide': return <span className="text-rose-800" data-cg-refused="otherSide">{k(last.side === 'up' ? 'vOtherUp' : 'vOtherDown')}</span>;
      case 'noT': return <span className="text-slate-700">{k('vNoT')}</span>;
      case 'syntax': return <span className="text-slate-700">{k('vSyntax')}</span>;
      case 'sorted': return <span className="text-slate-700">{k('vSorted')}</span>;
      default: return null;
    }
  })();

  /* ── la découverte : distracteurs réfutés par les comptes de l'élève ── */
  const discoveryOptions = useMemo(() => {
    if (dT == null) return [];
    const inv = L.invariantAt(lab, dT);
    const opts = [
      { text: <MathText>{k('dN')}</MathText>, why: <MathText>{k('dWhyN', { line: $(`${inv.up} + ${inv.down} = ${inv.up + inv.down} \\neq ${inv.N}`), t: inv.t, f: inv.f })}</MathText> },
      { text: <MathText>{k('dRight')}</MathText>, correct: true },
    ];
    const pair = L.unequalPair(lab);
    if (pair) opts.push({ text: <MathText>{k('dEqual')}</MathText>, why: <MathText>{k('dWhyEqual', { line: $(`${pair.up} \\neq ${pair.down}`), t: pair.t })}</MathText> });
    return opts;
  }, [lab, k, dT]); // eslint-disable-line react-hooks/exhaustive-deps

  const inv = dT != null ? L.invariantAt(lab, dT) : null;
  const representation = (
    <EquationDisplay tone="neutral" tex={T == null ? 't = \\;?' : `t = ${T}\\,\\mathrm{${unit}}`}
      note={<MathText>{k(side === 'up' ? 'repUp' : 'repDown', { cond: $(`x ${sideRel(side)}`) })}</MathText>} />
  );

  const nudgeBtn = (d) => (
    <button type="button" onClick={() => stretch.nudge(d)} aria-label={k(d < 0 ? 'less' : 'more')} disabled={T != null && (d < 0 ? T <= range.min : T >= range.max)}
      {...(d < 0 ? { 'data-cg-less': '' } : { 'data-cg-more': '' })}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
      {d < 0 ? <Minus className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
    </button>
  );

  const controls = (
    <div ref={ctrlRef} className="space-y-2" data-cg-controls>
      {/* le côté du seuil */}
      <div className="grid grid-cols-2 gap-1.5" role="group" aria-label={k('sideGroup')}>
        {L.SIDES.map((sd) => (
          <button key={sd} type="button" onClick={() => setSide(sd)} aria-pressed={side === sd} data-cg-side={sd}
            className={`inline-flex min-h-[44px] items-center justify-center gap-1 whitespace-nowrap rounded-xl border-2 px-1.5 font-extrabold focus:outline-none focus-visible:ring-2 text-sm ${side === sd ? 'text-white' : 'bg-white'}`}
            style={{ borderColor: COLORS[sd], background: side === sd ? COLORS[sd] : undefined, color: side === sd ? '#fff' : COLORS[sd] }}>
            <span>{k(sd === 'up' ? 'sideUp' : 'sideDown')}</span>
            <bdi dir="ltr" className="font-mono text-xs">{sd === 'up' ? '≤ t' : '≥ t'}</bdi>
          </button>
        ))}
      </div>
      {/* t, −/+ et ranger la file */}
      <div className="flex flex-wrap items-center gap-2">
        <div dir="ltr" className="flex items-center gap-1">
          {nudgeBtn(-1)}
          <span className="min-w-[4.4rem] whitespace-nowrap rounded-xl bg-slate-900 px-2 py-1.5 text-center font-mono font-extrabold text-lime-300 text-base" data-cg-t={T ?? ''}>
            {T == null ? 't = ?' : `t = ${T}`}<span className="text-[10px] text-lime-200"> {unit}</span>
          </span>
          {nudgeBtn(1)}
        </div>
        <button type="button" onClick={doSort} disabled={lab.sorted} data-cg-sort
          className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-indigo-500 bg-white px-2 text-xs font-bold text-indigo-800 disabled:border-slate-200 disabled:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
          <ArrowUpNarrowWide className="h-4 w-4" aria-hidden="true" /> {lab.sorted ? k('sorted') : w('sort')}
        </button>
      </div>
      {/* l'annonce à la porte */}
      <form onSubmit={doClaim} className="flex flex-wrap items-center gap-1.5" data-cg-claim>
        <label className="text-sm font-bold text-slate-800" htmlFor={`cg-in-${state.level}`}>
          <MathText>{w(side === 'up' ? 'askUp' : 'askDown', { cond: $(sideRel(side)) })}</MathText>
        </label>
        <input id={`cg-in-${state.level}`} value={raw} onChange={(e) => setRaw(e.target.value)} inputMode="numeric" dir="ltr"
          placeholder="؟" aria-label={k('inputAria')} data-cg-input
          className="h-11 w-20 rounded-lg border-2 border-slate-400 bg-white px-1 text-center font-mono text-lg font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500" />
        <button type="submit" data-cg-check
          className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-teal-700 bg-teal-700 px-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
          <DoorOpen className="h-4 w-4" aria-hidden="true" /> {k('check')}
        </button>
      </form>
      <p role="status" className="min-h-[2.5rem] font-bold leading-snug text-sm" data-cg-verdict={last?.kind ?? ''}>{verdict}</p>
    </div>
  );

  const tableFold = lab.withTable && (
    <LabFold id="cumul-gate.table" title={k('tableTitle')}
      actions={(
        <button type="button" onClick={() => setRel((r) => !r)} aria-pressed={rel} data-cg-rel aria-label={k(rel ? 'relOffAria' : 'relOnAria', { N: lab.N })}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center whitespace-nowrap rounded-lg border-2 border-slate-300 bg-white px-2 text-xs font-bold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
          {rel ? k('relOff') : <bdi dir="ltr" className="font-mono">÷ {lab.N}</bdi>}
        </button>
      )}>
      <CgTable lab={lab} k={k} rel={rel} unit={unit} onPick={pickPerson} />
    </LabFold>
  );

  const sol = state.isFormal || state.isDiscovered;

  // deux étapes lisibles : la 1re est FAITE quand ses questions sont répondues, la 2e aussi ; on fête chacune une fois (réarmées après « إعادة »)
  const stepDone = [cpActive ? done1 : lab.claims.length > 0, cpActive ? done1 && cp.done : L.discoveryReady(lab)];
  const stepper = <LabStepper count={2} current={stepDone[0] ? 1 : 0} done={stepDone} stepAttr="data-cg-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (inits !== celebrated.current.inits) { celebrated.current = new Set(); celebrated.current.inits = inits; }
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: i + 1, total: 2 });
    });
  }, [stepDone[0], stepDone[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ManipulationShell
      type="cumul-gate"
      title={title ?? k('title')}
      mission={mission ?? w('mission')}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpActive}
      hints={[w('hint1'), k('hint2'), k('hint3')].map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      representation={representation}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={<MathText>{k('dPrompt', { t: inv ? inv.t : '' })}</MathText>}
          options={discoveryOptions}
          formal={sol && inv && (
            <div className="space-y-2" data-cg-formal>
              <EquationDisplay tone="result" tex={`${inv.up} + ${inv.down} = ${inv.N} + ${inv.f}`} note={<MathText>{k('fInvariant', { t: inv.t })}</MathText>} />
              <EquationDisplay tone="neutral" tex={`${L.count(lab, Math.max(...lab.values), 'up')} = ${L.count(lab, Math.min(...lab.values), 'down')} = ${lab.N}`} note={<MathText>{k('fEnds')}</MathText>} />
              <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
            </div>
          )}
        />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className={theme === 'funpark' ? 'bg-gradient-to-b from-fuchsia-50/60 to-white' : 'bg-gradient-to-b from-sky-50/60 to-white'} data-dragging={stretch.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="space-y-2" data-cumul-gate data-series={series} data-t={T ?? ''} data-side={side} data-sorted={lab.sorted ? 'true' : 'false'}
          data-layout={wide ? 'side' : 'stack'} data-claims={lab.claims.length} data-budget={budget} data-scene-h={sceneH}>
          <div className="relative space-y-2">
          {party.node}
          {cp.node}
          {stepper}
          <div className={wide ? 'grid items-start gap-3' : 'space-y-2'} style={wide ? { gridTemplateColumns: `${sceneW}px 1fr` } : undefined} data-cg-glance>
            <Scene lab={lab} T={T} side={side} width={sceneW} height={sceneH} gaugeW={GAUGE_W} edge={EDGE} mu={mu} range={range}
              stretch={stretch} theme={theme} unit={unit} onPick={pickPerson} accepted={lab.claims.length}
              handleLabel={k('handle')} valueText={T == null ? k('notSet') : `${T} ${unit}`} personLabel={(v) => k('personAria', { v, unit })} />
            <div className="space-y-2">
              {controls}
              {wide && tableFold}
            </div>
          </div>
          </div>
          {!wide && tableFold}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/* ── le tableau du manuel : القامة t | التكرار | ≤ t | ≥ t (les cases données, les cases de l'élève) ── */
function CgTable({ lab, k, rel, unit, onPick }) {
  const rows = L.tableRows(lab);
  const cellText = (n) => (n == null ? '…' : rel ? `${n}/${lab.N}` : String(n));
  const cell = 'px-1 py-1 text-xs';
  const head = `${cell} bg-slate-100 font-extrabold text-slate-700 text-end whitespace-nowrap`;
  return (
    <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white" data-cg-table data-complete={L.tableComplete(lab) ? 'true' : 'false'}>
      <table dir="ltr" className="w-full border-collapse text-center font-mono">
        <tbody>
          <tr>
            {rows.map((r) => (
              <td key={r.v} className={`${cell} border-e border-slate-200 font-bold text-slate-900`}>
                <button type="button" onClick={() => onPick(r.v)} data-cg-col={r.v} aria-label={k('pickAria', { v: r.v, unit })}
                  className="min-h-[36px] min-w-[36px] rounded-md px-1 underline decoration-dotted focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">{r.v}</button>
              </td>
            ))}
            <th scope="row" className={head} dir="rtl">{k('rowT', { unit })}</th>
          </tr>
          <tr className="border-t border-slate-200">
            {rows.map((r) => <td key={r.v} className={`${cell} border-e border-slate-200 text-slate-700`}>{r.f}</td>)}
            <th scope="row" className={head} dir="rtl">{k('rowF')}</th>
          </tr>
          {['up', 'down'].map((sd) => (
            <tr key={sd} className="border-t border-slate-200">
              {rows.map((r) => {
                const n = r[sd];
                const own = n != null && !(sd === 'up' ? r.givenUp : r.givenDown);
                return (
                  <td key={r.v} className={`${cell} border-e border-slate-200 ${own ? 'font-extrabold' : 'text-slate-500'}`} style={own ? { color: COLORS[sd] } : undefined}
                    data-cg-cell={`${sd}:${r.v}`} data-own={own ? 'true' : 'false'}>{cellText(n)}</td>
                );
              })}
              <th scope="row" className={head} dir="rtl" style={{ color: COLORS[sd] }}>{k(sd === 'up' ? 'rowUp' : 'rowDown')}</th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── la scène : la toise (la poignée) et le bloc quasi carré des personnes ── */
function Scene({ lab, T, side, width, height, gaugeW, edge, mu, range, stretch, theme, unit, onPick, accepted, handleLabel, valueText, personLabel }) {
  const reduce = useReducedMotion();
  const blockW = Math.max(120, width - gaugeW - 6);
  const decoH = 16;
  const blockH = Math.max(100, height - decoH - 4);
  const { cols, rows } = L.blockLayout(lab.people.length, blockW / blockH);
  const cellW = Math.floor(blockW / cols);
  const cellH = Math.floor(blockH / rows);
  const labelH = Math.max(11, Math.min(15, Math.round(cellH * 0.18)));
  const figMax = Math.max(24, cellH - labelH - 4);
  const yOf = (v) => height - edge - 18 - (v - range.min) * mu;
  const steps = range.max - range.min;
  const every = steps <= 16 ? 2 : 5;
  const grads = Array.from({ length: steps + 1 }, (_, i) => range.min + i);
  const barY = T == null ? null : yOf(T);
  return (
    <div className="relative flex gap-1.5 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white/70" style={{ height, width }} data-cg-scene data-cols={cols} data-rows={rows}>
      {/* LA TOISE : toucher la piste pose la barre ; la barre est la poignée (role=slider) */}
      <div {...stretch.trackProps} dir="ltr" className="relative shrink-0" style={{ ...stretch.trackProps.style, width: gaugeW, height }} data-cg-gauge>
        <svg width={gaugeW} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" direction="ltr" dir="ltr">
          <rect x={gaugeW / 2 - 5} y={edge - 4} width="10" height={height - 2 * edge - 10} rx="4" fill={theme === 'funpark' ? '#FDE68A' : '#E2E8F0'} stroke="#94A3B8" />
          {grads.map((u) => {
            const major = u % every === 0;
            return (
              <g key={u}>
                <line x1={gaugeW / 2 - 5} x2={gaugeW / 2 - (major ? 12 : 8)} y1={yOf(u)} y2={yOf(u)} stroke="#475569" strokeWidth={major ? 1.3 : 0.8} />
                {major && <text x="2" y={yOf(u) + 3} fontSize="9" fill="#334155" fontFamily="ui-monospace, monospace">{u}</text>}
              </g>
            );
          })}
          <text x={gaugeW / 2} y={height - 4} textAnchor="middle" fontSize="9" fill="#64748B" fontFamily="ui-monospace, monospace">{unit}</text>
        </svg>
        <div
          {...stretch.handleProps({ label: handleLabel, valueText })}
          data-cg-handle
          className={`absolute flex items-center justify-center rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-teal-300 ${stretch.dragging ? 'bg-teal-500/10' : ''}`}
          style={{ left: 0, width: gaugeW, height: 44, top: (barY ?? yOf(range.min)) - 22, cursor: stretch.dragging ? 'grabbing' : 'grab', transition: stretch.dragging || reduce ? 'none' : 'top 140ms ease-out' }}
        >
          <svg width={gaugeW} height="44" aria-hidden="true" focusable="false">
            <rect x={gaugeW / 2 - 4} y="17" width={gaugeW / 2 + 4} height="10" rx="3" fill={T == null ? '#CBD5E1' : COLORS[side]} stroke="#0F172A" strokeWidth="1" />
            <circle cx={gaugeW / 2} cy="22" r="7" fill="#fff" stroke="#0F172A" strokeWidth="1.5" />
            <path d={`M${gaugeW / 2 - 3} 22 h6 M${gaugeW / 2} 19 v6`} stroke="#0F172A" strokeWidth="1.2" />
          </svg>
        </div>
      </div>
      {/* LE BLOC : les personnes à leur taille, allumées du côté choisi */}
      <div className="relative" style={{ width: blockW, height }}>
        <Deco theme={theme} width={blockW} height={decoH} accepted={accepted} reduce={reduce} />
        <div className="absolute inset-x-0 bottom-0 grid" style={{ top: decoH + 4, gridTemplateColumns: `repeat(${cols}, ${cellW}px)`, gridAutoRows: `${cellH}px` }} dir="rtl">
          {lab.people.map((p, i) => {
            const lit = L.isLit(p.v, T, side);
            const exact = T != null && p.v === T;
            const h = Math.round(figMax * L.figureScale(p.v, lab.values));
            return (
              <div key={p.id} onClick={() => onPick(p.v)} title={personLabel(p.v)}
                className="relative flex cursor-pointer flex-col items-center justify-end"
                data-cg-person={p.id} data-v={p.v} data-lit={lit ? 'true' : 'false'} data-exact={exact ? 'true' : 'false'}
                style={{ transition: reduce ? 'none' : 'opacity 160ms' }}>
                <Person h={h} shirt={SHIRTS[p.id % SHIRTS.length]} hair={HAIR[p.id % HAIR.length]} lit={lit} exact={exact} side={side} kid={theme === 'funpark'} />
                <span dir="ltr" className={`font-mono font-bold leading-none ${lit ? '' : 'text-slate-400'}`}
                  style={{ fontSize: Math.max(9, labelH - 3), height: labelH, color: lit ? COLORS[side] : undefined }}>{p.v}</span>
                {i === 0 && <span className="sr-only">{personLabel(p.v)}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── une personne dessinée : sa hauteur EST sa taille (figureScale) ── */
function Person({ h, shirt, hair, lit, exact, side, kid }) {
  const W = Math.round(h * 0.42);
  const ring = exact ? `drop-shadow(0 0 2px ${COLORS.up}) drop-shadow(0 0 3px ${COLORS.down})` : lit ? `drop-shadow(0 0 3px ${COLORS[side]})` : 'none';
  return (
    <svg viewBox="0 0 34 80" width={W} height={h} aria-hidden="true" focusable="false"
      style={{ opacity: lit ? 1 : 0.38, filter: ring }}>
      {exact && <rect x="0.5" y="0.5" width="33" height="79" rx="6" fill="none" stroke={COLORS.down} strokeWidth="1.5" strokeDasharray="4 3" />}
      {exact && <rect x="2.5" y="2.5" width="29" height="75" rx="5" fill="none" stroke={COLORS.up} strokeWidth="1.5" strokeDasharray="4 3" strokeDashoffset="3" />}
      <circle cx="17" cy="11" r="7" fill="#F2C9A0" />
      <path d={kid ? 'M10 10 Q17 1 24 10 Q22 5 17 4.5 Q12 5 10 10 Z' : 'M10 11 Q11 2 17 3 Q23 2 24 11 Q22 6 17 6 Q12 6 10 11 Z'} fill={hair} />
      <path d="M9 20 Q17 16 25 20 L26 44 L8 44 Z" fill={lit ? shirt : '#94A3B8'} />
      <path d="M9 22 L4 40 M25 22 L30 40" stroke="#F2C9A0" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M12 44 L12 74 M22 44 L22 74" stroke="#1E3A8A" strokeWidth="5" strokeLinecap="round" />
      <path d="M8 76 h7 M19 76 h7" stroke="#0F172A" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

/* ── le décor : guirlande + grande roue (funpark) ou fanions (school) — aria-hidden, jamais une information ── */
function Deco({ theme, width, height, accepted, reduce }) {
  const n = Math.max(4, Math.floor(width / 18));
  const anim = !reduce;
  return (
    <svg width={width} height={height + 8} className="pointer-events-none absolute inset-x-0 top-0" aria-hidden="true" focusable="false" data-deco={theme === 'funpark' ? 'lights' : 'bunting'}>
      <style>{'.cg-blink{animation:cg-b 1.6s ease-in-out infinite}.cg-blink2{animation:cg-b 1.6s ease-in-out .8s infinite}@keyframes cg-b{0%,100%{opacity:1}50%{opacity:.35}}.cg-swing{transform-box:fill-box;transform-origin:50% 0;animation:cg-s .9s ease-in-out 2}@keyframes cg-s{0%,100%{transform:rotate(0)}30%{transform:rotate(14deg)}70%{transform:rotate(-10deg)}}.cg-wave{transform-box:fill-box;transform-origin:50% 0;animation:cg-w .8s ease-in-out 2}@keyframes cg-w{0%,100%{transform:skewX(0)}50%{transform:skewX(12deg)}}@media (prefers-reduced-motion: reduce){.cg-blink,.cg-blink2,.cg-swing,.cg-wave{animation:none}}'}</style>
      <path d={`M0 3 Q${width / 2} ${height} ${width} 3`} fill="none" stroke="#64748B" strokeWidth="1" />
      {Array.from({ length: n }, (_, i) => {
        const x = ((i + 0.5) * width) / n;
        const y = 3 + (height - 3) * (1 - ((2 * x) / width - 1) ** 2) * 0.9;
        return theme === 'funpark'
          ? <circle key={i} cx={x} cy={y + 2} r="2.6" fill={['#F43F5E', '#FACC15', '#22D3EE', '#A3E635'][i % 4]} className={anim ? (i % 2 ? 'cg-blink' : 'cg-blink2') : undefined} />
          : <path key={`${i}-${accepted}`} d={`M${x - 5} ${y} L${x + 5} ${y} L${x} ${y + 9} Z`} fill={['#2563EB', '#16A34A', '#F59E0B', '#DC2626'][i % 4]} className={anim && accepted ? 'cg-wave' : undefined} />;
      })}
      {theme === 'funpark' && (
        <g transform={`translate(${width - 17} 1) scale(0.62)`} data-deco="wheel">
          <circle cx="12" cy="12" r="11" fill="none" stroke="#A855F7" strokeWidth="1.4" />
          <path d="M12 1 V23 M1 12 H23 M4 4 L20 20 M20 4 L4 20" stroke="#C4B5FD" strokeWidth="0.8" />
          <g key={accepted} className={anim && accepted ? 'cg-swing' : undefined} data-deco="gondola">
            <line x1="12" y1="23" x2="12" y2="26" stroke="#7C3AED" strokeWidth="1" />
            <rect x="7" y="26" width="10" height="6" rx="2" fill="#F472B6" />
          </g>
        </g>
      )}
    </svg>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** s1 : après le premier compte accepté ; s2 : une même valeur comptée des deux côtés — la dernière question est la règle. */
export const CHAINS = Object.freeze({ s1: ['other', 'incl'], s2: ['sum', 'extra', 'rule'] });

const dl = (x) => `$${x}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const relOf = (side, t) => `${side === 'up' ? '\\leq' : '\\geq'} ${t}`;
const sumOf = (groups) => `${groups.map((g) => g.f).join(' + ')} = ${groups.reduce((a, g) => a + g.f, 0)}`;

/** Chaque question est construite sur LES comptes de l'élève (rien en dur) ; `k` : les textes de `cumulGate`. */
export const QUESTIONS = {
  other: (lab, k) => {
    const c = lab.claims[0];
    const rest = lab.N - c.n;
    const o = { cond: dl(relOf(c.side, c.t)), n: c.n, N: lab.N, rest };
    return {
      id: 'other', kind: 'number', expected: String(rest), answer: <MathText>{dl(String(rest))}</MathText>,
      prompt: Mx(k, 'other.prompt', o), hints: [Mx(k, 'other.hint1', o), Mx(k, 'other.hint2', o)],
      explain: Mx(k, 'other.explain', { ...o, calc: dl(`${lab.N} - ${c.n} = ${rest}`) }),
    };
  },
  incl: (lab, k) => {
    const c = lab.claims[0];
    const f = L.freqOf(lab, c.t);
    const groups = L.litGroups(lab, c.t, c.side);
    const o = { cond: dl(relOf(c.side, c.t)), t: c.t, f, n: c.n, sum: dl(sumOf(groups)) };
    if (f === 0) {
      return {
        id: 'incl', kind: 'number', expected: '0', answer: <MathText>{dl('0')}</MathText>,
        prompt: Mx(k, 'inclZero.prompt', o), hints: [Mx(k, 'inclZero.hint1', o), Mx(k, 'inclZero.hint2', o)],
        explain: Mx(k, 'inclZero.explain', o),
      };
    }
    return {
      id: 'incl', kind: 'choice',
      prompt: Mx(k, 'incl.prompt', o),
      options: [
        { text: Mx(k, 'incl.no', o), why: Mx(k, 'incl.whyNo', o) },
        { text: Mx(k, 'incl.yes', o), correct: true },
        { text: Mx(k, 'incl.some', o), why: Mx(k, 'incl.whySome', o) },
      ],
      hints: [Mx(k, 'incl.hint1', o), Mx(k, 'incl.hint2', o)],
      explain: Mx(k, 'incl.explain', o),
    };
  },
  sum: (lab, k) => {
    const inv = L.invariantAt(lab, L.discoveryT(lab));
    const o = { t: inv.t, up: inv.up, down: inv.down, N: inv.N, f: inv.f, total: inv.up + inv.down };
    return {
      id: 'sum', kind: 'number', expected: String(o.total), answer: <MathText>{dl(String(o.total))}</MathText>,
      prompt: Mx(k, 'sum.prompt', o), hints: [Mx(k, 'sum.hint1', o), Mx(k, 'sum.hint2', { ...o, calc: dl(`${inv.up} + ${inv.down}`) })],
      explain: Mx(k, 'sum.explain', { ...o, calc: dl(`${inv.up} + ${inv.down} = ${o.total}`) }),
    };
  },
  extra: (lab, k) => {
    const inv = L.invariantAt(lab, L.discoveryT(lab));
    const total = inv.up + inv.down;
    const o = { t: inv.t, N: inv.N, f: inv.f, total };
    return {
      id: 'extra', kind: 'number', expected: String(inv.f), answer: <MathText>{dl(String(inv.f))}</MathText>,
      prompt: Mx(k, 'extra.prompt', o), hints: [Mx(k, 'extra.hint1', o), Mx(k, 'extra.hint2', o)],
      explain: Mx(k, 'extra.explain', { ...o, calc: dl(`${total} - ${inv.N} = ${inv.f}`) }),
    };
  },
  rule: (lab, k) => {
    const t = L.discoveryT(lab);
    const inv = L.invariantAt(lab, t);
    const opts = [
      { text: <MathText>{k('dN')}</MathText>, why: <MathText>{k('dWhyN', { line: dl(`${inv.up} + ${inv.down} = ${inv.up + inv.down} \\neq ${inv.N}`), t: inv.t, f: inv.f })}</MathText> },
      { text: <MathText>{k('dRight')}</MathText>, correct: true },
    ];
    const pair = L.unequalPair(lab);
    if (pair) opts.push({ text: <MathText>{k('dEqual')}</MathText>, why: <MathText>{k('dWhyEqual', { line: dl(`${pair.up} \\neq ${pair.down}`), t: pair.t })}</MathText> });
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('dPrompt', { t })}</MathText>,
      options: opts,
      hints: [Mx(k, 'rule.hint1', { t, f: inv.f }), Mx(k, 'rule.hint2', { line: dl(`${inv.up} + ${inv.down} = ${inv.N} + ${inv.f}`) })],
      explain: (
        <div className="space-y-1">
          <EquationDisplay tone="result" tex={`${inv.up} + ${inv.down} = ${inv.N} + ${inv.f}`} note={<MathText>{k('fInvariant', { t })}</MathText>} />
          <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
        </div>
      ),
    };
  },
};
