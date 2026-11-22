import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Undo2 } from 'lucide-react';
import * as V from '@smarter-academy/core/arithmetic/vectors.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import DragGhost from '../primitives/DragGhost';
import LabFold from '../primitives/LabFold';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import * as L from '../logic/vectorChain';

/**
 * vector-chain — LES CORRESPONDANCES DU MÉTRO D'ALGER (unité 11 « الأشعة والانسحاب », درس « حل مشكلات وإنجاز
 * براهين بتوظيف الأشعة والانسحاب » ; التمرين 18 ص 137 en متقدم ; دوري الآن ص 138 en mode `construct`).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève PORTE des tickets — les vecteurs nommés d'une somme ($\overrightarrow{BC}$, $\overrightarrow{AB}$…) — soit
 *    sur le TRAIN (avant sa tête ou après sa queue), soit sur une STATION de la carte (il y transporte la flèche) ;
 *    il porte aussi le train lui-même. Glisser, toucher-toucher, ou Entrée au clavier (le moteur `useDragInteraction`).
 * B. Idée : réduire une expression vectorielle — علاقة شال (deux wagons se raccordent : fin = début), l'échange d'un
 *    vecteur contre un vecteur ÉGAL que les DONNÉES justifient (متوازي أضلاع، منتصف، تعريف), deux opposés → $\overrightarrow{0}$ ;
 *    puis CONCLURE (un parallélogramme) — et, en `construct`, construire le représentant d'une somme de plusieurs vecteurs.
 * C. Sur la carte : la flèche du train grandit/raccourcit, les tickets en attente sont dessinés à leur place, la flèche
 *    transportée GLISSE vers sa nouvelle origine (la translation), un raccord refusé laisse un trou entre deux stations,
 *    un transport refusé montre où la flèche arriverait (ghost) ; la ligne de la preuve s'écrit.
 * D. La chaîne d'égalités de l'élève (« $\overrightarrow{HK} = \ldots = \overrightarrow{AC}$ ») avec la raison de chaque ligne.
 * E. À découvrir avant la règle : deux vecteurs non consécutifs ne s'additionnent pas « à vue » ; une égalité lue sur la
 *    figure n'est pas une preuve ; deux opposés s'annulent.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        réduire une somme de vecteurs (Chasles, égalité, opposés) pour démontrer une égalité vectorielle
 *   OBJECT         des tickets de métro (vecteurs nommés), un train (la somme réduite), la carte (les stations = points)
 *   VARIABLE       QUEL ticket, OÙ il s'accroche (tête / queue) ou VERS QUELLE station il est transporté ; en construct,
 *                  la station d'origine du premier représentant
 *   INVARIANT      la VALEUR exacte de l'expression (aucun geste accepté ne la change — testé en balayant tous les gestes) ;
 *                  la forme et la longueur d'une flèche transportée
 *   TRANSFORMATION l'expression change d'écriture (une ligne de plus dans la preuve), la flèche du train se redessine
 *   CONSTRAINT     raccord seulement si fin = début (`isChain`) ; échange seulement vers un représentant ÉGAL et DONNÉ
 *   RESISTANCE     le wagon refusé reste sur le quai, le trou entre les deux stations est nommé ; la flèche transportée
 *                  qui n'arrive sur aucune station est dessinée là où elle arrive ; l'égalité vraie sur la figure mais non
 *                  donnée est refusée (« الشكل لا يبرهن ») ; en construct, un représentant posé ailleurs qu'en bout de chaîne
 *   EVIDENCE       la flèche du train, la ligne de preuve, le verdict (role=status)
 *   CONTRAST       مبتدئ : BC + AB (raccord DEVANT, pas derrière) contre AB + AD (aucun raccord possible sans échange) ;
 *                  متقدم : OL atteint par raccord direct (mauvaise cible) contre AC atteint par les données
 *   PREDICTION     la cible est écrite (« أثبت أنّ HK = AC ») : l'élève choisit l'échange qui y mène
 *   DISCOVERY      « on raccorde ce qui se suit, on échange ce que les données égalent » ; « OL = HK ⇒ OHKL متوازي أضلاع »
 *   FORMALIZATION  la preuve écrite ligne à ligne + طريقة البرهان بالأشعة (module 2)
 *   TRANSFER       les exercices 17, 18, 20, 21, 23, 24 et la banque
 *
 * Toutes les vérités viennent de `packages/core/arithmetic/vectors.js` (logic/vectorChain.js) : `simplifyNamed`,
 * `isChain`, `translate`, `vecEq` sur des points exacts ; le dessin est en flottants. Manuel (§6bis) : chaque geste
 * est un choix — aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) : la baie d'Alger au-dessus de la carte (mer, vagues), le logo rond du métro, les
 * noms des stations de la ligne 1 sous les lettres (مبتدئ), le tableau des départs et le valideur de ticket qui
 * « bipe » quand on le touche. `aria-hidden`, hors clavier, `[data-deco]`, jamais une information ; immobile sous
 * `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : le bloc `[data-vc-glance]` contient la carte, le train, les tickets, les données, le
 * verdict et les boutons. Large (≥ 700 px) : carte et panneau côte à côte, la carte bornée par l'écran de leçon ;
 * étroit : la carte au-dessus, sa hauteur = écran − ce que le bloc mesure EN PLUS de la carte. La preuve ligne à ligne
 * est dans un `LabFold` sous le bloc.
 *
 * Props : `mode` (`reduce` | `construct`), `stations` { A: [x, y] } (entiers), `segments`, `givens`, `missions`
 * (reduce) ou `builds` + `radius` (construct), `theme` (`metro`), `title`, `lead`, `mission`, `level`, `levels`,
 * `onTrial(evidence)` à chaque geste jugé, `onFinished({ mode, proofs | builds })` à la règle — par `state.report`.
 *
 * CONTRAT DOM : [data-vector-chain][data-mode][data-mission][data-status][data-train], [data-vc-glance], [data-vc-map],
 * [data-vc-station=X] (zone), [data-vc-tip], [data-vc-tab=i][data-done], [data-vc-zone=head|tail], [data-vc-card=name],
 * [data-vc-train-card], [data-vc-sum], [data-vc-givens], [data-vc-verdict=<kind>], [data-vc-undo], [data-vc-next],
 * [data-vc-found], [data-lab-fold=vector-chain.proof], [data-deco].
 */
const COLORS = ['#16A34A', '#F59E0B', '#0EA5E9', '#E11D48', '#8B5CF6', '#0D9488'];
const TRAIN = '#4338CA';
const TONE = { ok: 'text-emerald-800', ko: 'text-rose-800', info: 'text-slate-700', warn: 'text-amber-800' };
const sub = (name) => name.replace(/_(\d)/, (m, d) => '₀₁₂₃₄₅₆₇₈₉'[d]);

export default function VectorChain({
  mode = 'reduce', stations, segments, givens, missions, builds, radius = 2, theme = 'metro',
  title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.vectorChain.${key}`, o), [t]);
  const initialNumbers = mode === 'construct' ? { mode, stations, builds, radius } : { mode, stations, segments, givens, missions };
  const state = useManipulation({ type: 'vector-chain', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const make = () => L.init(nums);
  const [lab, setLab] = useState(make);
  const sceneKey = `${JSON.stringify(nums)}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [beeps, setBeeps] = useState(0);
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); }
  const construct = lab.mode === 'construct';
  const reduce = useReducedMotion();

  // les questions pendant le labo (obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte) : la règle vient de la dernière suite
  const cpSettings = useLabCheckpointSettings('vector-chain');
  const cpActive = cpOn && cpSettings.enabled;
  const ready = L.discoveryReady(lab) && !cpActive;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!state.isFormal) return;
    state.report(onFinished, construct
      ? { mode: 'construct', builds: lab.builds.map((b) => ({ name: b.name, found: b.found ? V.coords(b.found) : null })) }
      : { mode: 'reduce', proofs: lab.missions.map((_, i) => L.proofChain(lab, i)) });
  }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const nTrials = lab.trials.length;
  useEffect(() => { if (nTrials > 0) state.report(onTrial, L.evidenceOf(lab)); }, [nTrials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── le geste : un seul moteur (porter), des zones = le train, les stations, la pointe ── */
  const act = useCallback((src, zone) => {
    setLab((s) => {
      if (s.mode === 'construct') return L.place(s, src, zone);
      if (zone === 'head' || zone === 'tail') return src === 'train' ? s : L.couple(s, src, zone);
      if (zone.startsWith('st:')) return L.translateCard(s, src, zone.slice(3));
      return s;
    });
  }, []);
  const accepts = useCallback((src, zone) => {
    if (lab.mode === 'construct') return L.canPlace(lab, src, zone);
    if (zone === 'head' || zone === 'tail') return src === 'train' ? '' : L.canCouple(lab, src, zone);
    if (!zone.startsWith('st:')) return '';
    const ms = L.current(lab);
    const name = src === 'train' ? ms.train : ms.tray.find((c) => c.id === src)?.name;
    if (!name || name === '0') return '';
    const p = L.probe(lab, name, zone.slice(3));
    return p.kind === 'swap' ? true : p.kind === 'same' ? '' : p.kind;
  }, [lab]);
  const drag = useDragInteraction({ onDrop: act, onReject: (src, zone, reason) => { if (reason) act(src, zone); }, accepts });

  /* ── mesure : largeur, écran de leçon, ce que le bloc « glance » mesure en plus de la carte ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const mapRef = useRef(null);
  const mapHRef = useRef(240);
  const [width, setWidth] = useState(640);
  const [overhead, setOverhead] = useState(260);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(240, Math.floor(el.clientWidth)));
      if (glanceRef.current) setOverhead(Math.max(140, Math.ceil(glanceRef.current.getBoundingClientRect().height) - mapHRef.current));
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
  const wide = width >= 700;
  const narrow = width < 400;
  const mapW = wide ? Math.floor(width * 0.6) : width;
  const fr = useMemo(() => L.frame(lab), [lab.coords, lab.mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const natural = L.naturalHeight(fr, mapW, 1.1);
  const mapH = Math.round(wide
    ? Math.max(220, Math.min(natural, screenH - 90, 540))
    : Math.max(140, Math.min(natural, screenH - overhead - 24, 460)));
  mapHRef.current = wide ? 0 : mapH;
  const sc = L.mapScale(fr, { width: mapW, height: mapH, margin: 1.1 });

  /* ── lecture ── */
  const ms = construct ? null : L.current(lab);
  const bs = construct ? L.currentBuild(lab) : null;
  const ok = construct ? lab.builds[lab.b] : lab.missions[lab.m];
  const stat = construct ? (bs.found ? 'complete' : 'open') : L.status(lab);
  const colorOf = (id) => COLORS[Number(String(id).replace(/\D+/g, '').slice(-1)) % COLORS.length];
  const nTabs = construct ? lab.builds.length : lab.missions.length;
  const idx = construct ? lab.b : lab.m;
  const doneOf = (i) => (construct ? !!lab.builds[i].found : lab.done[i]);

  /* ── le verdict du dernier geste ── */
  const verdict = useMemo(() => verdictOf(lab, k), [lab, k]);

  /* ── la découverte ── */
  const discoveryOptions = useMemo(() => {
    if (construct) {
      return [
        { text: k('dConRight'), correct: true },
        { text: k('dConBigger'), why: <MathText>{k('dConBiggerWhy')}</MathText> },
        { text: <MathText>{k('dConFromA')}</MathText>, why: <MathText>{k('dConFromAWhy')}</MathText> },
      ];
    }
    if (lab.missions.some((m) => m.target)) {
      return [
        { text: <MathText>{k('dAdvOrder')}</MathText>, why: <MathText>{k('dAdvOrderWhy')}</MathText> },
        { text: <MathText>{k('dAdvRight')}</MathText>, correct: true },
        { text: k('dAdvSee'), why: <MathText>{k('dAdvSeeWhy')}</MathText> },
        { text: k('dAdvLine'), why: <MathText>{k('dAdvLineWhy')}</MathText> },
      ];
    }
    return [
      { text: <MathText>{k('dBegAny')}</MathText>, why: <MathText>{k('dBegAnyWhy')}</MathText> },
      { text: k('dBegRight'), correct: true },
      { text: k('dBegLength'), why: <MathText>{k('dBegLengthWhy')}</MathText> },
    ];
  }, [construct, lab.missions, k]);
  const prompt = construct ? 'dPromptConstruct' : lab.missions.some((m) => m.target) ? 'dPromptAdvanced' : 'dPromptBeginner';
  const formal = (
    <div className="space-y-2" data-vc-formal>
      {!construct && lab.missions.map((_, i) => (
        <p key={i} className="overflow-x-auto text-sm text-emerald-900" dir="ltr"><MathText>{`$${L.proofChain(lab, i)}$`}</MathText></p>
      ))}
      {construct && lab.builds.map((b, i) => (
        <p key={i} className="text-sm text-emerald-900"><MathText>{`$\\overrightarrow{E${b.name}} = ${L.sumTex(b.terms)}$`}</MathText></p>
      ))}
      <p className="text-sm text-emerald-900"><MathText>{k(construct ? 'fConstruct' : lab.missions.some((m) => m.target) ? 'fAdvanced' : 'fBeginner')}</MathText></p>
    </div>
  );

  const missionText = mission ?? k(construct ? 'missionConstruct' : lab.missions.some((m) => m.target) ? 'missionProve' : 'missionReduce');
  const goal = construct
    ? k('goalConstruct', { name: `(\\Gamma_${lab.b + 1})`, sum: L.sumTex(bs.terms) })
    : ok.target ? k('goalProve', { lhs: L.vecTex(ok.lhs), target: L.vecTex(ok.target) }) : k('goalSingle', { expr: L.sumTex(ok.start) });

  const stepId = construct ? `b${lab.b}` : `r${lab.m}`;
  const chain = cpActive ? chainOf(lab) : null;
  const cp = useLabCheckpoint({
    id: chain ? stepId : null,
    questions: chain && doneOf(idx) ? chain.map((q) => QUESTIONS[q](lab, k, { options: discoveryOptions, prompt, formal })) : null,
    reached: doneOf(idx),
    resetKey: state.epoch,
    onRetry: () => setLab(L.restartStep),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: () => { if (chain.includes('rule')) { state.discover(); state.formalize(); } },
  });
  const stepDone = Array.from({ length: nTabs }, (_, i) => doneOf(i) && (i !== idx || !cp.blocking));
  const party = useStepCelebration();
  const celebrated = useRef({ epoch: state.epoch, set: new Set() });
  if (celebrated.current.epoch !== state.epoch) celebrated.current = { epoch: state.epoch, set: new Set() };
  const nowDone = stepDone[idx];
  useEffect(() => {
    if (!nowDone || celebrated.current.set.has(idx)) return;
    celebrated.current.set.add(idx);
    party.celebrate({ n: idx + 1, total: nTabs });
  }, [nowDone, idx]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son : un déclic pour un geste accepté, « over » pour un refus, le drapeau quand la mission est faite
  const doneN = stepDone.filter(Boolean).length;
  const sfx = useRef({ n: nTrials, d: doneN, epoch: state.epoch });
  useEffect(() => {
    const p = sfx.current;
    if (p.epoch !== state.epoch) { sfx.current = { n: nTrials, d: doneN, epoch: state.epoch }; return; }
    if (nTrials > p.n) { const tr = lab.trials[nTrials - 1]; playSfx(tr?.ok === false ? 'over' : 'tooth'); }
    if (doneN > p.d) playSfx('flag');
    sfx.current = { n: nTrials, d: doneN, epoch: state.epoch };
  }, [nTrials, doneN, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  const canNext = idx < nTabs - 1 && doneOf(idx) && !cp.blocking;
  const hoverSt = drag.hoverZone?.id?.startsWith('st:') ? drag.hoverZone.id.slice(3) : null;
  const heldName = construct
    ? (drag.held === 'sum' ? 'sum' : bs.tray.find((c) => c.id === drag.held)?.name ?? null)
    : drag.held === 'train' ? ms.train : ms.tray.find((c) => c.id === drag.held)?.name ?? null;

  /* ── la carte ── */
  const map = (
    <div ref={mapRef} className="relative mx-auto shrink-0 overflow-hidden rounded-2xl border border-sky-200 bg-[#F8FAFC]"
      style={{ width: mapW, height: mapH }} data-vc-map>
      <MapSvg lab={lab} sc={sc} fr={fr} construct={construct} reduce={reduce} heldName={heldName} hoverSt={hoverSt}
        colorOf={colorOf} beeps={beeps} onBeep={() => setBeeps((n) => n + 1)} names={!construct && Object.keys(lab.coords).length <= 4 ? k('stations', { returnObjects: true }) : null} />
      {Object.entries(lab.coords).map(([name, p]) => {
        const [x, y] = sc.to(p);
        const zp = drag.zoneProps(`st:${name}`);
        const active = zp['data-drop-active'] === 'true'; const invalid = zp['data-drop-invalid'] === 'true';
        return (
          <div key={name} role="button" tabIndex={0} aria-label={k('stationLabel', { name })} {...zp} data-vc-station={name}
            className={`absolute rounded-full outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 ${active ? 'bg-emerald-300/40 ring-2 ring-emerald-500' : invalid ? 'bg-rose-300/40 ring-2 ring-rose-400' : drag.held ? 'ring-2 ring-indigo-300/70' : ''}`}
            style={{ left: x - 22, top: y - 22, width: 44, height: 44 }} />
        );
      })}
      {construct && L.tip(bs) && !bs.found && !L.stationAt(lab, L.tip(bs)) && (() => {
        const [x, y] = sc.to(V.coords(L.tip(bs)));
        const zp = drag.zoneProps('tip');
        return (
          <div role="button" tabIndex={0} aria-label={k('tipLabel')} {...zp} data-vc-tip
            className={`absolute rounded-full outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 ${zp['data-drop-active'] === 'true' ? 'bg-emerald-300/40 ring-2 ring-emerald-500' : drag.held ? 'ring-2 ring-indigo-300/70' : ''}`}
            style={{ left: x - 22, top: y - 22, width: 44, height: 44 }} />
        );
      })()}
    </div>
  );

  /* ── le panneau : train (ou chaîne), tickets, données, verdict, boutons ── */
  const ticket = (card, extra = {}) => (
    <button key={card.id} type="button" {...drag.sourceProps(card.id)} aria-label={k('cardLabel', { name: card.name })}
      data-vc-card={card.name} {...extra}
      className={`sa-manip-object inline-flex min-h-[44px] min-w-[52px] items-center justify-center rounded-xl border-2 bg-white px-2 shadow-sm transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${drag.held === card.id ? 'scale-105 ring-2 ring-indigo-500' : ''} ${drag.rejected === card.id ? 'sa-manip-reject ring-2 ring-rose-400' : ''}`}
      style={{ ...drag.sourceProps(card.id).style, borderColor: colorOf(card.id) }}>
      <span dir="ltr" className="pointer-events-none text-base font-bold" style={{ color: colorOf(card.id) }}><MathText>{`$${L.vecTex(card.name)}$`}</MathText></span>
    </button>
  );
  const zone = (id) => {
    const zp = drag.zoneProps(id);
    return (
      <div role="button" tabIndex={0} aria-label={k(id)} {...zp} data-vc-zone={id}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-dashed text-lg font-black outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${zp['data-drop-active'] === 'true' ? 'border-emerald-500 bg-emerald-100 text-emerald-700' : zp['data-drop-invalid'] === 'true' ? 'border-rose-400 bg-rose-50 text-rose-600' : zp['data-drop-ready'] === 'true' ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-slate-300 bg-white text-slate-400'}`}>
        <span aria-hidden="true">+</span>
      </div>
    );
  };

  const trainRow = !construct && (
    <div className="flex items-center justify-center gap-1.5" dir="ltr" data-vc-train={ms.train ?? ''}>
      {zone('head')}
      {ms.train == null ? (
        <div className="flex h-11 min-w-[96px] items-center justify-center rounded-xl border-2 border-indigo-200 bg-indigo-50 px-2 text-xs font-bold text-indigo-400" dir="rtl">{k('trainEmpty')}</div>
      ) : (
        <button type="button" {...drag.sourceProps('train', { disabled: ms.train === '0' })} data-vc-train-card={ms.train}
          aria-label={ms.train === '0' ? k('zeroCard') : k('trainCard', { name: ms.train })}
          className={`sa-manip-object flex h-11 min-w-[96px] items-center justify-center gap-1 rounded-xl px-2 text-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${drag.held === 'train' ? 'ring-2 ring-amber-300' : ''} ${drag.rejected === 'train' ? 'sa-manip-reject' : ''}`}
          style={{ ...drag.sourceProps('train').style, background: TRAIN }}>
          <TrainNose />
          <span className="pointer-events-none text-base font-bold"><MathText>{`$${L.vecTex(ms.train)}$`}</MathText></span>
        </button>
      )}
      {zone('tail')}
    </div>
  );

  const tray = construct ? bs.tray : ms.tray;
  const trayRow = (
    <div className="flex min-h-[48px] flex-wrap items-center justify-center gap-1.5" data-vc-tray={tray.length}>
      {tray.map((c) => ticket(c))}
      {construct && bs.sum && !bs.found && (
        <button type="button" {...drag.sourceProps('sum')} data-vc-sum aria-label={k('sumCard', { from: bs.origin })}
          className={`sa-manip-object inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-indigo-500 bg-indigo-50 px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${drag.held === 'sum' ? 'scale-105 ring-2 ring-indigo-500' : ''} ${drag.rejected === 'sum' ? 'sa-manip-reject' : ''}`}
          style={drag.sourceProps('sum').style}>
          <span dir="ltr" className="pointer-events-none text-sm font-bold text-indigo-900"><MathText>{`$${L.sumTex(bs.terms)}$`}</MathText></span>
        </button>
      )}
      {!tray.length && !(construct && bs.sum && !bs.found) && <span className="text-xs text-slate-500">{k('trayEmpty')}</span>}
    </div>
  );

  const givensRow = !construct && lab.givens.length > 0 && (
    <div className="flex flex-wrap items-center justify-center gap-1" data-vc-givens={lab.givens.length}>
      {!narrow && <span className="text-xs font-bold text-slate-600">{k('givensTitle')}:</span>}
      {lab.givens.map((g, i) => (
        <span key={i} className={`rounded-full border border-amber-300 bg-amber-50 font-semibold text-amber-900 ${narrow ? 'px-1.5 text-[11px] leading-5' : 'px-2 py-0.5 text-xs'}`} data-vc-given={g.kind}>
          <MathText>{givenText(g, k, narrow)}</MathText>
        </span>
      ))}
    </div>
  );

  const undoBtn = (
    <button type="button" onClick={() => setLab((s) => L.undo(s))} disabled={!L.canUndo(lab)} data-vc-undo aria-label={k('undo')}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${narrow ? 'px-1' : 'px-3'}`}>
      <Undo2 className="h-4 w-4" aria-hidden="true" /> {!narrow && k('undo')}
    </button>
  );
  const tabs = nTabs > 1 && <LabStepper count={nTabs} current={idx} done={stepDone} stepAttr="data-vc-step" />;

  const actions = (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {undoBtn}
      {canNext && (
        <button type="button" onClick={() => setLab((s) => L.goTo(s, idx + 1))} data-vc-next
          className="min-h-[44px] rounded-xl border-2 border-indigo-600 bg-indigo-600 px-3 text-sm font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
          {k(construct ? 'nextBuild' : 'nextTrip')} ←
        </button>
      )}
      {!narrow && <Validator onBeep={() => setBeeps((n) => n + 1)} label={k('board')} minutes={k('minutes', { n: 2 + (beeps % 4) })} />}
    </div>
  );

  const panel = (
    <div className={`flex min-w-0 flex-1 flex-col gap-2 ${wide ? '' : ''}`} data-vc-panel>
      <p className={`text-center ${narrow ? 'text-sm' : 'text-base'} font-extrabold text-indigo-950`} data-vc-goal><MathText>{goal}</MathText></p>
      {givensRow}
      {trainRow}
      {trayRow}
      <p role="status" className={`min-h-[2.5rem] text-center ${narrow ? 'text-xs' : 'text-sm'} font-bold leading-snug ${TONE[verdict.tone]}`} data-vc-verdict={verdict.kind}>
        <MathText>{verdict.text}</MathText>
      </p>
      {actions}
    </div>
  );

  const proofFold = !construct ? (
    <LabFold id="vector-chain.proof" title={k('proofTitle')}>
      <ol className="space-y-1 text-sm" data-vc-proof={ms.lines.length}>
        {L.proofLines(lab).map((l, i) => (
          <li key={i} className="flex flex-wrap items-baseline gap-x-2">
            <span dir="ltr" className="font-semibold text-slate-900"><MathText>{`$${l.tex}$`}</MathText></span>
            {l.reason && <span className="text-xs text-slate-500">({reasonText(lab, l.reason, k, ok)})</span>}
          </li>
        ))}
      </ol>
      {ms.lines.length < 2 && <p className="text-xs text-slate-500">{k('proofEmpty')}</p>}
    </LabFold>
  ) : (
    bs.chain.length > 0 && (
      <LabFold id="vector-chain.build" title={k('buildTitle')}>
        <ul className="space-y-0.5 text-sm" data-vc-build={bs.chain.length}>
          {bs.chain.map((c, i) => (
            <li key={i}><MathText>{i === 0 ? k('buildLine', { a: L.vecTex(c.name), st: bs.origin }) : k('buildLineNext', { a: L.vecTex(c.name) })}</MathText></li>
          ))}
        </ul>
      </LabFold>
    )
  );

  const heldGhost = heldName && heldName !== 'sum' ? (
    <span className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-indigo-400 bg-white px-2 text-base font-bold text-indigo-900" dir="ltr">
      <MathText>{`$${L.vecTex(heldName)}$`}</MathText>
    </span>
  ) : heldName === 'sum' ? (
    <span className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-indigo-400 bg-white px-2 text-sm font-bold text-indigo-900" dir="ltr">
      <MathText>{`$${L.sumTex(bs.terms)}$`}</MathText>
    </span>
  ) : null;

  return (
    <ManipulationShell
      type="vector-chain"
      title={title ?? k(construct ? 'titleConstruct' : 'title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpActive}
      hints={(construct ? ['hintC1', 'hintC2', 'hintC3'] : ['hintR1', 'hintR2', 'hintR3']).map((h) => <MathText key={h}>{k(h)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={<MathText>{k(prompt)}</MathText>} options={discoveryOptions} formal={formal} />}
      explanation={<MathText>{k(construct ? 'explanationConstruct' : 'explanationReduce')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-sky-50/60 to-white" minHeight="min-h-[160px]">
        <div ref={boxRef} className={`relative space-y-2 ${cp.open ? 'min-h-[620px]' : ''}`} data-vector-chain data-mode={lab.mode} data-world={theme}
          data-mission={idx} data-status={stat} data-train={construct ? '' : ms.train ?? ''} data-found={construct && bs.found ? V.coords(bs.found).join(',') : undefined}>
          {party.node}
          {cp.node}
          <div ref={glanceRef} className="space-y-2" data-vc-glance>
            {tabs}
            <div className={wide ? 'flex items-start gap-3' : 'space-y-2'}>
              {map}
              {panel}
            </div>
          </div>
          {proofFold}
        </div>
      </ManipulationStage>
      <DragGhost ghost={drag.ghost}>{heldGhost}</DragGhost>
    </ManipulationShell>
  );
}

/* ── textes ─────────────────────────────────────────────────────────────── */

function givenText(g, k, short = false) {
  const vt = L.vecTex;
  switch (g.kind) {
    case 'para': return k('givenPara', { name: g.name });
    case 'mid': return k('givenMid', { point: g.point, seg: g.seg });
    case 'sym': return k('givenSym', { image: g.image, point: g.point, centre: g.centre });
    case 'eq': return k('givenEq', { a: vt(g.a), b: vt(g.b) });
    case 'def': return short ? k('givenEq', { a: vt(g.a), b: L.sumTex(g.sum) }) : k('givenDef', { a: vt(g.a), sum: L.sumTex(g.sum), point: L.ends(g.a)[1] });
    default: return '';
  }
}

function reasonText(lab, r, k, mission) {
  switch (r.kind) {
    case 'insert': return k('rInsert');
    case 'def': {
      const def = lab.givens.find((g) => g.kind === 'def');
      return k('rDef', { point: def ? L.ends(def.a)[1] : (mission?.lhs ?? '') });
    }
    case 'shal': return k('rShal');
    case 'opposite': return k('rOpposite');
    case 'zero': return k('rZero');
    case 'swap': return <MathText>{k('rSwap', { why: r.via.map((gi) => givenText(L.givenOf(lab, gi), k)).join(k('and')) })}</MathText>;
    default: return '';
  }
}

function verdictOf(lab, k) {
  const vt = L.vecTex;
  const last = lab.last;
  if (lab.mode === 'construct') {
    const bs = L.currentBuild(lab);
    if (bs.found) return { kind: 'found', tone: 'ok', text: k('cFound', { name: bs.name }) };
    if (!last || last.kind === 'undo') {
      if (bs.sum) return { kind: 'sum', tone: 'info', text: k('cSum', { st: bs.origin }) };
      return { kind: last ? 'undo' : '', tone: 'info', text: bs.chain.length ? k('cPlace', { a: vt(bs.chain[bs.chain.length - 1].name) }) : k('cWaiting') };
    }
    if (last.kind === 'place' && last.ok) {
      if (bs.sum) return { kind: 'sum', tone: 'info', text: k('cSum', { st: bs.origin }) };
      return bs.chain.length === 1
        ? { kind: 'start', tone: 'info', text: k('cStart', { a: vt(last.card), st: bs.origin }) }
        : { kind: 'place', tone: 'ok', text: k('cPlace', { a: vt(last.card) }) };
    }
    if (last.kind === 'place') {
      const st = last.zone.startsWith('st:') ? last.zone.slice(3) : '';
      return last.reason === 'ownStart'
        ? { kind: 'ownStart', tone: 'ko', text: k('cOwnStart', { a: vt(last.card) }) }
        : { kind: 'notTip', tone: 'ko', text: k('cNotTip', { st }) };
    }
    if (last.kind === 'carry' && !last.ok) return { kind: 'notCentre', tone: 'ko', text: k('cNotCentre', { st: last.zone.slice(3) }) };
    return { kind: '', tone: 'info', text: k('cWaiting') };
  }
  const ms = L.current(lab);
  const mission = lab.missions[lab.m];
  const st = L.status(lab);
  if (st === 'complete' && (!last || last.status === 'complete' || last.kind === 'undo' || last.mission !== lab.m)) {
    return mission.target
      ? { kind: 'complete', tone: 'ok', text: k('vComplete', { lhs: vt(mission.lhs), c: vt(ms.train) }) }
      : { kind: 'complete', tone: 'ok', text: k('vSingle', { c: vt(ms.train) }) };
  }
  if (!last || last.kind === 'undo' || last.mission !== lab.m) {
    if (st === 'offTarget') return { kind: 'offTarget', tone: 'warn', text: k('vOffTarget', { c: vt(ms.train), target: vt(mission.target) }) };
    return { kind: last?.kind === 'undo' ? 'undo' : '', tone: 'info', text: last?.kind === 'undo' ? k('vUndo') : k('waiting') };
  }
  if (last.kind === 'couple' && !last.ok) {
    return { kind: last.reason, tone: 'ko', text: k(last.reason === 'chainTail' ? 'vChainTail' : 'vChainHead', { arrive: last.arrive, depart: last.depart }) };
  }
  if (last.kind === 'swap' && !last.ok) {
    if (last.reason === 'notGiven') return { kind: 'notGiven', tone: 'ko', text: k('vNotGiven', { a: vt(last.card), b: vt(last.to) }) };
    return last.opposite
      ? { kind: 'nowhere', tone: 'ko', text: k('vNowhereOpp', { a: vt(last.card), st: last.station, b: vt(last.opposite) }) }
      : { kind: 'nowhere', tone: 'ko', text: k('vNowhere', { a: vt(last.card), st: last.station }) };
  }
  if (st === 'offTarget') return { kind: 'offTarget', tone: 'warn', text: k('vOffTarget', { c: vt(ms.train), target: vt(mission.target) }) };
  if (last.kind === 'couple') {
    const [a, b] = last.terms;
    if (last.reason === 'board') return { kind: 'board', tone: 'info', text: k('vBoard', { a: vt(last.card) }) };
    if (last.reason === 'zero') return { kind: 'zero', tone: 'ok', text: k('vZero', { a: vt(last.card) }) };
    if (last.reason === 'opposite') return { kind: 'opposite', tone: 'ok', text: k('vOpposite', { a: vt(a), b: vt(b) }) };
    return { kind: 'shal', tone: 'ok', text: k('vShal', { a: vt(a), b: vt(b), c: vt(last.result) }) };
  }
  if (last.kind === 'swap') {
    const why = `(${k('rSwap', { why: last.via.map((gi) => givenText(L.givenOf(lab, gi), k)).join(k('and')) })})`;
    return { kind: 'swap', tone: 'ok', text: k('vSwap', { a: vt(last.card), b: vt(last.to), why }) };
  }
  return { kind: '', tone: 'info', text: k('waiting') };
}

/* ── le dessin de la carte ──────────────────────────────────────────────── */

function arrowHead([x1, y1], [x2, y2], size = 9) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p1 = [x2 - size * Math.cos(a - 0.42), y2 - size * Math.sin(a - 0.42)];
  const p2 = [x2 - size * Math.cos(a + 0.42), y2 - size * Math.sin(a + 0.42)];
  return `${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`;
}
function Arrow({ from, to, color, width = 3, dashed = false, opacity = 1, shorten = 6, ...rest }) {
  const dx = to[0] - from[0]; const dy = to[1] - from[1]; const l = Math.hypot(dx, dy) || 1;
  const s = [from[0] + (dx / l) * shorten, from[1] + (dy / l) * shorten];
  const e = [to[0] - (dx / l) * shorten, to[1] - (dy / l) * shorten];
  return (
    <g opacity={opacity} {...rest}>
      <line x1={s[0]} y1={s[1]} x2={e[0]} y2={e[1]} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? '6 5' : undefined} />
      <polygon points={arrowHead(s, e, 6 + width * 1.4)} fill={color} />
    </g>
  );
}

function MapSvg({ lab, sc, fr, construct, reduce, heldName, hoverSt, colorOf, beeps, names, onBeep }) {
  const { to, width, height, unit } = sc;
  const P = (name) => to(lab.coords[name]);
  const textProps = { direction: 'ltr', unicodeBidi: 'isolate' };
  const gx = []; const gy = [];
  for (let x = Math.floor(fr.minX - 2); x <= Math.ceil(fr.maxX + 2); x += 1) gx.push(x);
  for (let y = Math.floor(fr.minY - 2); y <= Math.ceil(fr.maxY + 2); y += 1) gy.push(y);
  const ms = construct ? null : L.current(lab);
  const bs = construct ? L.currentBuild(lab) : null;
  const last = lab.last;
  const trans = reduce ? 'none' : 'opacity 300ms ease-out';

  // la flèche que montrerait le transport en cours (la translation, sous le doigt)
  let preview = null;
  if (!construct && heldName && heldName !== '0' && hoverSt) {
    const end = V.coords(L.landing(lab, heldName, hoverSt));
    preview = { from: P(hoverSt), to: to(end) };
  }
  // un refus « n'arrive sur aucune station » : la flèche fantôme là où elle arrive
  // un transport refusé : la flèche fantôme là où elle arrive (aucune station, ou une station que rien ne justifie)
  const ghost = !construct && last?.kind === 'swap' && !last.ok && last.mission === lab.m
    ? (last.landing ? { from: P(last.station), to: to(last.landing) } : last.to ? { from: P(last.station), to: P(L.ends(last.to)[1]) } : null) : null;

  return (
    <svg width={width} height={height} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
      {/* la baie d'Alger (décor) */}
      <g data-deco="bay">
        <rect x={0} y={0} width={width} height={7} fill="#BAE6FD" opacity={0.7} />
        <path d={`M0 7 ${Array.from({ length: Math.ceil(width / 24) }, () => 'q 6 -4 12 0 t 12 0').join(' ')}`} fill="none" stroke="#7DD3FC" strokeWidth={1.2} />
        {(() => {
          // le coin le plus éloigné des stations : le logo du métro et le minaret de جامع الجزائر n'y cachent rien
          const pts = Object.values(lab.coords).map(to);
          const corners = [[16, 22], [width - 16, 22], [16, height - 16], [width - 16, height - 16]];
          const free = corners.map((c) => Math.min(...pts.map((p) => Math.hypot(p[0] - c[0], p[1] - c[1])))) ;
          const [cx, cy] = corners[free.indexOf(Math.max(...free))];
          return (
            <g transform={`translate(${cx} ${cy})`} opacity={0.85} onClick={onBeep} style={{ cursor: 'pointer' }} data-deco="metro-logo">
              <circle r={13} fill="transparent" />
              <circle r={9} fill="#DC2626" />
              <text y={4} textAnchor="middle" fontSize={11} fontWeight={900} fill="#FFFFFF" style={textProps}>M</text>
            </g>
          );
        })()}
      </g>
      {/* la grille (le papier quadrillé du manuel) */}
      <g stroke="#E2E8F0" strokeWidth={1}>
        {gx.map((x) => { const [px] = to([x, 0]); return <line key={`x${x}`} x1={px} x2={px} y1={0} y2={height} />; })}
        {gy.map((y) => { const [, py] = to([0, y]); return <line key={`y${y}`} y1={py} y2={py} x1={0} x2={width} />; })}
      </g>
      {/* les lignes de la figure = les lignes du métro */}
      {(lab.segments ?? []).map(([a, b], i) => {
        const [x1, y1] = P(a); const [x2, y2] = P(b);
        return (
          <g key={i} data-deco="metro-line">
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#5EEAD4" strokeWidth={Math.max(4, unit * 0.26)} strokeLinecap="round" opacity={0.45} />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFFFFF" strokeWidth={1.2} strokeDasharray="1 5" strokeLinecap="round" opacity={0.9} />
          </g>
        );
      })}
      {/* MODE reduce : les tickets à leur place, le train, le dernier geste */}
      {!construct && ms.tray.map((c) => {
        const [a, b] = L.ends(c.name);
        return <Arrow key={c.id} from={P(a)} to={P(b)} color={colorOf(c.id)} width={heldName === c.name ? 4.5 : 2.6} opacity={heldName && heldName !== c.name ? 0.45 : 0.95} data-vc-arrow={c.name} />;
      })}
      {!construct && last?.ok && last.mission === lab.m && last.kind === 'couple' && last.terms?.length === 2 && last.terms.every((n) => n !== '0') && (
        last.terms.map((n, i) => { const [a, b] = L.ends(n); return <Arrow key={`p${i}`} from={P(a)} to={P(b)} color="#94A3B8" width={2} dashed opacity={0.8} />; })
      )}
      {!construct && last?.ok && last.mission === lab.m && last.kind === 'swap' && (() => {
        const [a, b] = L.ends(last.card); const [c] = L.ends(last.to);
        return (
          <g>
            <Arrow from={P(a)} to={P(b)} color="#94A3B8" width={2} dashed opacity={0.7} />
            <line x1={P(a)[0]} y1={P(a)[1]} x2={P(c)[0]} y2={P(c)[1]} stroke="#F59E0B" strokeWidth={1.6} strokeDasharray="2 4" />
          </g>
        );
      })()}
      {!construct && ms.train && ms.train !== '0' && (() => {
        const [a, b] = L.ends(ms.train);
        return <Arrow from={P(a)} to={P(b)} color={TRAIN} width={5} data-vc-arrow="train" style={{ transition: trans }} />;
      })()}
      {!construct && ms.train === '0' && last?.reason === 'opposite' && last.mission === lab.m && (() => {
        const [x, y] = P(L.ends(last.terms[0])[0]);
        return <circle cx={x} cy={y} r={13} fill="none" stroke={TRAIN} strokeWidth={3} data-vc-zero />;
      })()}
      {preview && <Arrow from={preview.from} to={preview.to} color="#0EA5E9" width={3} dashed data-vc-preview />}
      {ghost && <Arrow from={ghost.from} to={ghost.to} color="#E11D48" width={2.5} dashed data-vc-ghost />}
      {/* MODE construct : (Γ), la chaîne, la résultante, les images */}
      {construct && lab.builds.map((b, i) => b.found && (
        <circle key={`g${i}`} cx={to(V.coords(b.found))[0]} cy={to(V.coords(b.found))[1]} r={lab.radius * unit} fill="#10B98114" stroke="#059669" strokeWidth={2.5} data-vc-circle={i} />
      ))}
      {construct && (() => {
        const E = lab.builds[0].centre; const [x, y] = P(E);
        return <circle cx={x} cy={y} r={lab.radius * unit} fill="none" stroke="#475569" strokeWidth={2} strokeDasharray="5 4" />;
      })()}
      {construct && bs.chain.map((c, i) => (
        <Arrow key={`c${i}`} from={to(V.coords(c.from))} to={to(V.coords(c.to))} color={COLORS[i % COLORS.length]} width={3.5} />
      ))}
      {construct && bs.tray.map((c) => {
        const [a, b] = L.ends(c.name);
        return <Arrow key={c.id} from={P(a)} to={P(b)} color="#94A3B8" width={2} dashed opacity={0.8} />;
      })}
      {construct && (bs.sum || bs.found) && bs.chain.length > 0 && (
        <Arrow from={to(V.coords(bs.chain[0].from))} to={to(V.coords(L.tip(bs)))} color={TRAIN} width={4} />
      )}
      {construct && bs.sum && bs.found && (
        <Arrow from={P(bs.centre)} to={to(V.coords(bs.found))} color={TRAIN} width={4} />
      )}
      {construct && L.tip(bs) && !bs.found && (() => {
        const [x, y] = to(V.coords(L.tip(bs)));
        return <g data-vc-tip-marker><rect x={x - 11} y={y - 8} width={22} height={16} rx={5} fill={TRAIN} /><rect x={x - 7} y={y - 5} width={6} height={5} rx={1} fill="#E0E7FF" /><rect x={x + 1} y={y - 5} width={6} height={5} rx={1} fill="#E0E7FF" /></g>;
      })()}
      {construct && lab.builds.map((b, i) => b.found && (() => {
        const [x, y] = to(V.coords(b.found));
        return (
          <g key={`f${i}`} data-vc-found={i}>
            <circle cx={x} cy={y} r={4.5} fill="#059669" />
            <text x={x + 7} y={y - 7} fontSize={14} fontWeight={800} fill="#065F46" style={textProps}>{sub(b.name)}</text>
          </g>
        );
      })())}
      {/* les stations (texte LTR) */}
      {Object.entries(lab.coords).map(([name, p], i) => {
        const [x, y] = to(p);
        return (
          <g key={name}>
            <circle cx={x} cy={y} r={7} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2.5} />
            <text x={x > width - 24 ? x - 9 : x + 9} y={y - 9} textAnchor={x > width - 24 ? 'end' : 'start'} fontSize={15} fontWeight={800} fill="#0F172A" style={textProps}>{name}</text>
            {names?.[i] && (
              <text x={x} y={y + 21} textAnchor="middle" fontSize={10} fill="#64748B" data-deco="station-name" style={{ direction: 'rtl' }}>{names[i]}</text>
            )}
          </g>
        );
      })}
      {beeps > 0 && !reduce && (
        <g key={beeps} data-deco="beep">
          <style>{'.vc-b{transform-origin:center;animation:vc-b .6s ease-out 1}@keyframes vc-b{0%{opacity:.7}100%{opacity:0}}'}</style>
          <rect className="vc-b" x={2} y={2} width={width - 4} height={height - 4} rx={14} fill="none" stroke="#22C55E" strokeWidth={4} />
        </g>
      )}
    </svg>
  );
}

/** Le nez du train (décor du wagon). */
function TrainNose() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false" className="pointer-events-none shrink-0">
      <rect x="1" y="3" width="14" height="10" rx="3" fill="#C7D2FE" />
      <rect x="3" y="5" width="4" height="3" rx="1" fill="#312E81" />
      <rect x="9" y="5" width="4" height="3" rx="1" fill="#312E81" />
      <circle cx="4.5" cy="11" r="1" fill="#FDE68A" /><circle cx="11.5" cy="11" r="1" fill="#FDE68A" />
    </svg>
  );
}

/** Le valideur de ticket et le tableau des départs : touché, il « bipe » (la carte clignote en vert). Décor seulement. */
function Validator({ onBeep, label, minutes }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden="true" data-deco="validator">
      <button type="button" tabIndex={-1} aria-hidden="true" onClick={onBeep} className="h-11 w-9 shrink-0 rounded-lg focus:outline-none">
        <svg viewBox="0 0 36 44" width="100%" height="100%">
          <rect x="6" y="2" width="24" height="40" rx="5" fill="#334155" />
          <rect x="10" y="7" width="16" height="10" rx="2" fill="#22C55E" />
          <rect x="11" y="24" width="14" height="3" rx="1.5" fill="#94A3B8" />
        </svg>
      </button>
      <span className="rounded-md bg-slate-800 px-2 py-1 font-mono text-[11px] font-bold text-amber-300">{label} {minutes}</span>
    </span>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

const $ = (s) => `$${s}$`;
const vt = (n) => $(L.vecTex(n));
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
/** Le premier geste accepté d'un genre dans les lignes de la preuve de la mission courante. */
const lineOf = (lab, kind) => L.current(lab).lines.find((l) => l.reason?.kind === kind) ?? null;

/** La suite de questions de la mission (ou construction) courante : les gestes qu'on vient de FAIRE, puis le résultat, puis la règle (dernière à finir). */
export function chainOf(lab) {
  const last = L.allDone(lab) ? ['rule'] : [];
  if (lab.mode === 'construct') return ['count', 'chain', ...last];
  return [...(lineOf(lab, 'shal') ? ['couple'] : []), ...(lineOf(lab, 'swap') ? ['swap'] : []), 'final', ...last];
}

/** Chaque question est construite sur LES stations, les tickets et le train de la mission (rien en dur) ; `k` : les textes de `vectorChain`. */
export const QUESTIONS = {
  couple: (lab, k) => {
    const r = lineOf(lab, 'shal').reason;
    const [t1, t2] = r.terms;
    const mid = L.ends(t1)[1];
    const o = { t1: vt(t1), t2: vt(t2), res: vt(r.result), m: mid, s: L.ends(t2)[0] };
    return {
      id: 'couple', kind: 'choice',
      prompt: Mx(k, 'couple.prompt', o),
      options: [
        { text: Mx(k, 'couple.same', o), correct: true },
        { text: Mx(k, 'couple.length'), why: Mx(k, 'couple.whyLength', o) },
        { text: Mx(k, 'couple.parallel'), why: Mx(k, 'couple.whyParallel', o) },
      ],
      hints: [Mx(k, 'couple.hint1', o), Mx(k, 'couple.hint2', o)],
      explain: Mx(k, 'couple.explain', o),
    };
  },
  swap: (lab, k) => {
    const r = lineOf(lab, 'swap').reason;
    const o = { from: vt(r.from), to: vt(r.to), st: L.ends(r.to)[0] };
    return {
      id: 'swap', kind: 'choice',
      prompt: Mx(k, 'swap.prompt', o),
      options: [
        { text: Mx(k, 'swap.figure'), why: Mx(k, 'swap.whyFigure', o) },
        { text: Mx(k, 'swap.given', o), correct: true },
        { text: Mx(k, 'swap.length'), why: Mx(k, 'swap.whyLength', o) },
      ],
      hints: [Mx(k, 'swap.hint1'), Mx(k, 'swap.hint2', o)],
      explain: Mx(k, 'swap.explain', o),
    };
  },
  final: (lab, k) => {
    const ms = L.current(lab);
    const name = ms.train;
    const [a, b] = L.ends(name);
    const rev = L.reverse(name);
    const other = [...L.current(lab).lines[0].names, `${a}${a}`].find((n) => n !== name && n !== rev);
    const o = { n: lab.m + 1, a, b, train: vt(name), rev: vt(rev), x: vt(other) };
    return {
      id: 'final', kind: 'choice', cols: 3,
      prompt: Mx(k, 'final.prompt', o),
      options: [
        { text: <MathText>{o.rev}</MathText>, why: Mx(k, 'final.whyRev', o) },
        { text: <MathText>{o.x}</MathText>, why: Mx(k, 'final.whyFirst', o) },
        { text: <MathText>{o.train}</MathText>, correct: true },
      ],
      hints: [Mx(k, 'final.hint1'), Mx(k, 'final.hint2', o)],
      explain: Mx(k, 'final.explain', o),
    };
  },
  count: (lab, k) => {
    const bs = L.currentBuild(lab);
    const o = { sum: $(L.sumTex(bs.terms)), st: bs.origin, name: `$(\\Gamma_${lab.b + 1})$` };
    return {
      id: 'count', kind: 'number', expected: String(bs.terms.length), answer: <MathText>{$(String(bs.terms.length))}</MathText>,
      prompt: Mx(k, 'count.prompt', o), hints: [Mx(k, 'count.hint1', o), Mx(k, 'count.hint2', o)],
      explain: Mx(k, 'count.explain', { ...o, n: $(String(bs.terms.length)) }),
    };
  },
  chain: (lab, k) => {
    const bs = L.currentBuild(lab);
    const o = { first: vt(bs.chain[0].name), second: bs.chain[1] ? vt(bs.chain[1].name) : vt(bs.chain[0].name), centre: bs.centre, st: bs.origin };
    return {
      id: 'chain', kind: 'choice',
      prompt: Mx(k, 'chain.prompt', o),
      options: [
        { text: Mx(k, 'chain.centre', o), why: Mx(k, 'chain.whyCentre', o) },
        { text: Mx(k, 'chain.tip'), correct: true },
        { text: Mx(k, 'chain.any'), why: Mx(k, 'chain.whyAny', o) },
      ],
      hints: [Mx(k, 'chain.hint1', o), Mx(k, 'chain.hint2', o)],
      explain: Mx(k, 'chain.explain', o),
    };
  },
  rule: (lab, k, ctx) => ({
    id: 'rule', kind: 'choice',
    prompt: <MathText>{k(ctx.prompt)}</MathText>,
    options: ctx.options,
    hints: [Mx(k, `rule.${lab.mode === 'construct' ? 'construct' : lab.missions.some((m) => m.target) ? 'advanced' : 'beginner'}1`), Mx(k, 'rule.hint2')],
    explain: ctx.formal,
  }),
};
