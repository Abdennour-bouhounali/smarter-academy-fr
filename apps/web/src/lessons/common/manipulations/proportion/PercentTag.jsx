import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, FlaskConical, ListPlus, RotateCcw } from 'lucide-react';
import * as LIN from '@smarter-academy/core/arithmetic/linear.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import * as L from '../logic/percentTag';

/**
 * percent-tag — L'ÉTIQUETTE QU'ON ÉTIRE (unité 6 « الدالة الخطية والتناسبية », leçon 4
 * « تطبيقات التناسبية (النسب المئوية والمقادير المركبة) »).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève ÉTIRE le prix : la barre « بعد » a une poignée à son bout (useStretchInteraction ;
 *    glisser, toucher la piste, −1 % / +1 %, flèches du clavier) ; il choisit زيادة / تخفيض ; il
 *    choisit l'article de la vitrine (x) ; il peut ESSAYER la barre additive « x + t ». En
 *    متقدم, il PARIE le changement global (une seconde poignée), puis construit la chaîne de
 *    changements pas à pas (« أضف هذا التغيّر »).
 * B. Idée : un changement de t % est une MULTIPLICATION par 1 ± t/100 — la même pour tous les
 *    prix (fonction linéaire x ⟼ k·x) ; des changements successifs MULTIPLIENT leurs
 *    multiplicateurs.
 * C. Pendant le geste, la barre « بعد » suit la poignée, l'étiquette affiche l'ancien prix barré
 *    et le nouveau ; le réservoir monte / descend ; k et « 1200 × 1,05 = 1260 » s'écrivent dessous.
 * D. Chaque valeur VALIDÉE est un essai (tableau x | y de l'élève, chaînes construites) ;
 *    la barre additive est refusée par la barre multipliée ; le pari faux est refusé par le
 *    niveau de l'eau.
 * E. À découvrir : « زيادة بـ 5% = ×1,05 pour tous les prix » (y / x constant dans le tableau de
 *    l'élève), et « on multiplie les multiplicateurs : 0,7 × 1,15 = 0,805 ».
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        un changement en % est une multiplication : x ⟼ (1 ± t/100)x, fonction linéaire ;
 *                  des changements successifs se composent par PRODUIT des multiplicateurs
 *   OBJECT         l'étiquette de prix (une barre) d'un article de la vitrine des soldes ; le
 *                  réservoir d'eau (le volume est une barre verticale)
 *   VARIABLE       t % signé (la poignée au bout de la barre « بعد ») ; x (l'article choisi) ;
 *                  en متقدم le pari global (demi-points) et la suite des changements
 *   INVARIANT      le multiplicateur k ne dépend pas de x (même k pour 1200, 3000, 800 DA) ;
 *                  « changement = multiplication » ; la capacité du réservoir
 *   TRANSFORMATION la barre « بعد », le prix barré / nouveau prix, le niveau de l'eau, k, x ⟼ kx
 *   CONSTRAINT     |t| ≤ 50 ; le réservoir plein ne déborde pas ; on parie AVANT de construire
 *   RESISTANCE     la barre additive « x + t » (pointillés) ne coïncide jamais avec la barre
 *                  multipliée (MISC-NISBA-JAM) ; le pari « −30 + 15 = −15 % » trace une ligne
 *                  (25,5 m³) que l'eau (24,15 m³) n'atteint pas (MISC-NISBA-TATABU-JAM) ; le
 *                  réservoir refuse de déborder
 *   EVIDENCE       le tableau x | y de l'élève (y ÷ x constant) ; la ligne du pari sur l'eau
 *   CONTRAST       la barre additive contre la barre multipliée ; −20 % puis +20 % ne revient pas
 *                  (0,8 × 1,2 = 0,96)
 *   PREDICTION     le pari du changement global, posé AVANT la chaîne
 *   DISCOVERY      « زيادة بـ t% = ضرب في 1 + t/100 » ; « تُضرب المضاعفات » (distracteurs
 *                  réfutés par les propres essais : « إضافة t » avec sa barre, « ×0,05 »,
 *                  « تُجمع النسب » avec le pari refusé, « −20 ثم +20 يعيد » avec la chaîne)
 *   FORMALIZATION  know-4 (الجدول) : x ⟼ (1 + t/100)x ; طرائق p. 71 : (1 − t/100)(1 + t'/100)
 *   TRANSFER       معارف et طرائق (module 3), دوري الآن 1,03 × 0,98 × 0,99, ex. 3, 4, 5, 19 → 24
 *
 * Mondes (`theme`) : `mall` (la vitrine des soldes : baskets, maillot de l'équipe nationale,
 * casquette — مبتدئ, act-5) et `tank` (le réservoir de 30 m³ — متقدم, method-percent). La forme
 * (un changement / une chaîne) se lit sur `steps`, jamais sur le thème. Manuel (§6bis) : chaque
 * réglage est un essai ou une réponse — aucune auto-complétion.
 *
 * DÉCOR (exigence du propriétaire) : les étiquettes de la vitrine se balancent et des pièces
 * tintent quand on les touche ; la surface de l'eau ondule quand on touche le réservoir.
 * `aria-hidden`, `tabIndex={-1}`, `[data-deco]`, jamais un état du lab, immobiles sous
 * `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (MANIPULATION_CONTRACT §8bis) : le monde, la barre et sa poignée, les boutons
 * (sens, ±1 %, essai additif / pari, ajout du pas) et la lecture (k, produit, verdict) tiennent
 * ensemble dans la hauteur de l'écran de leçon (`useLessonViewport`). Large (≥ 620 px) : le monde
 * et ses commandes côte à côte ; sinon les commandes juste sous un monde COMPACT dont la hauteur
 * vient de ce qui reste (écran − commandes mesurées). Le secondaire (tableau de l'élève, chaînes
 * construites) est SOUS la manipulation, repliable (`primitives/LabFold`), jamais entre le monde et
 * ses commandes. `MovablePanel` n'est pas utilisé : rien ne flotte, rien ne recouvre.
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 5, `primitives/LabCheckpoint`) : une étape par but, dans l'ordre, chacune finie quand son but est atteint ET ses
 * questions répondues (`LabStepper`). single : « set » (le t % de la leçon sur l'article de la leçon : lire le nouveau prix · le multiplicateur) · « table »
 * (un 2e article au même t % : son prix · y ÷ x constant) · « add » (la barre additive : pourquoi elle ne coïncide pas · la règle, qui formalise).
 * chain : « chain » (la chaîne de la leçon construite ET le pari confronté : le multiplicateur du 1er pas · le volume final · pourquoi on ne
 * peut pas additionner) · « contrast » (−t puis +t construit, pari juste : le volume · est-il revenu · la règle, qui formalise).
 * OBLIGATOIRES pour tout élève ; l'enseignant seul les coupe (`useLabCheckpointSettings`) : coupées, la découverte d'avant reprend.
 * Événements `{ tk: 'checkpoint' | 'checkpoint-done', id, … }` → `onCheckpoint` (jamais `onTrial`). « أعِد التجربة » = `logic/percentTag › retryTask`.
 * Son : `tooth` à chaque pourcent de la poignée, `bell` à chaque pas ajouté, `flag` pour un essai au t % de la leçon / un pari juste, `over` pour un refus.
 * DOM : [data-pt-step=0..2].
 * Props : `checkpoints` (défaut true), `onCheckpoint(ev)`, `price` (« 1200 », « 30 »), `steps` (« +5 », « -30|+15 »), `theme` ('mall' | 'tank'),
 * `title`, `lead`, `mission`, `level`, `levels` (false : posé seul sans sélecteur), `onTrial(ev)`
 * à chaque essai validé (ev = `evidence` : le tableau, les essais additifs, les chaînes et les
 * paris de l'élève), `onFinished` à la règle formelle — tous par `state.report`.
 *
 * CONTRAT DOM : [data-percent-tag][data-mode=single|chain][data-world][data-s][data-k][data-y],
 * [data-percent-glance] (le bloc d'un seul regard), [data-percent-controls], [data-percent-bars],
 * [data-stretch-handle][data-percent-handle=t|bet], [data-percent-dir=up|down][aria-pressed],
 * [data-percent-less|more=t|bet], [data-percent-article=<id>][aria-pressed], [data-percent-try],
 * [data-percent-additive], [data-percent-commit], [data-percent-new-chain], [data-percent-line],
 * [data-percent-verdict=<kind>], [data-percent-refused], [data-percent-tank][data-volume],
 * [data-percent-bet-line], [data-percent-row], [data-percent-chain-trial][data-ok],
 * [data-lab-fold=percent-tag.table|chains], [data-deco], [data-percent-formal].
 */
export default function PercentTag({
  price: price0 = '1200', steps: steps0 = '+5', theme, title, lead, mission, level, levels: withLevels = true,
  checkpoints: cpOn = true, initialMode = 'student', allowModeSwitch = false, onTrial, onCheckpoint, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.percentTag.${key}`, o), [t]);
  const state = useManipulation({ type: 'percent-tag', initialNumbers: { price: price0, steps: steps0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { price, steps } = state.numbers;
  const themeHere = state.isAuthoredLevel ? theme : undefined;

  const make = () => L.init({ price, steps, theme: themeHere });
  const [lab, setLab] = useState(make);
  const sceneKey = `${price}|${steps}|${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [liveS, setLiveS] = useState(null);
  const [liveBet, setLiveBet] = useState(null);
  const [dir, setDir] = useState('up');
  const [inits, setInits] = useState(0);
  const [cpDone, setCpDone] = useState({});
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setLiveS(null); setLiveBet(null); setDir('up'); setInits((n) => n + 1); setCpDone({}); }

  const single = lab.mode === 'single';
  // les questions pendant le labo : obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpSettings = useLabCheckpointSettings('percent-tag');
  const cpEnabled = cpOn && cpSettings.enabled;
  const ready = L.discoveryReady(lab) && !cpEnabled;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { price, steps }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chaque NOUVEL essai est rapporté à la leçon (son `[data-activity-evidence]`).
  const nEvents = lab.trials.length + lab.additiveTrials.length + lab.chains.length + lab.betTrials.length;
  useEffect(() => {
    if (nEvents === 0) return;
    state.report(onTrial, evidenceOf(lab));
  }, [nEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : la largeur de la scène et la HAUTEUR de l'écran de leçon ── */
  const boxRef = useRef(null);
  const ctrlRef = useRef(null);
  const [width, setWidth] = useState(300);
  const [ctrlH, setCtrlH] = useState(320);
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
  const budget = Math.max(320, screenH - 8);
  const wide = width >= 620;
  const GAP = 12;
  const colW = wide ? Math.floor((width - GAP) / 2) : width;
  // Le monde prend ce qui reste : côte à côte, la hauteur de l'écran ; empilé, l'écran moins les commandes.
  const worldH = Math.round(Math.max(single ? 104 : 120, Math.min(wide ? Math.min(budget - 24, 380) : budget - ctrlH - GAP - 20, wide ? 380 : 230)));

  /* ── la poignée t % (la barre « بعد ») ── */
  const art = lab.articles.find((a) => a.id === lab.selected) ?? lab.articles[0];
  const S = liveS ?? lab.s;
  const baseX = single ? art.x : L.current(lab);
  const top = LIN.mul(baseX, LIN.frac(3, 2));
  const trackW = Math.max(120, colW - 4);
  const scale = useMemo(() => L.barScale({ width: trackW, top }), [trackW, LIN.fracText(top)]); // eslint-disable-line react-hooks/exhaustive-deps
  const toValueS = useCallback((cx, _cy, rect) => L.sFromPosition(cx - rect.left, scale, baseX), [scale, LIN.fracText(baseX)]); // eslint-disable-line react-hooks/exhaustive-deps
  const commitS = (v) => {
    setLiveS(v);
    if (v !== 0) setDir(v > 0 ? 'up' : 'down');
    setLab((s) => (s.mode === 'single' ? L.setS(s, v) : L.setDraft(s, v)));
  };
  const st = useStretchInteraction({
    value: S, range: { min: -L.T_MAX, max: L.T_MAX }, toValue: toValueS,
    onChange: (v) => { setLiveS(v); if (v !== 0) setDir(v > 0 ? 'up' : 'down'); }, onCommit: commitS, direction: 'ltr',
  });
  const shownDir = S > 0 ? 'up' : S < 0 ? 'down' : dir;
  const mag = Math.abs(S);
  const pickDir = (d) => { setDir(d); if (S !== 0 && (d === 'up') !== (S > 0)) st.set(-S); };
  const nudgeMag = (delta) => {
    const m = Math.max(0, Math.min(L.T_MAX, mag + delta));
    st.set(shownDir === 'up' ? m : -m);
  };

  /* ── la poignée du pari (demi-points) ── */
  const betTrackW = trackW;
  const betPx = useCallback((b) => 14 + ((b - L.BET_RANGE.min) / (L.BET_RANGE.max - L.BET_RANGE.min)) * (betTrackW - 28), [betTrackW]);
  const toValueBet = useCallback((cx, _cy, rect) => L.BET_RANGE.min + ((cx - rect.left - 14) / (betTrackW - 28)) * (L.BET_RANGE.max - L.BET_RANGE.min), [betTrackW]);
  const sb = useStretchInteraction({
    value: liveBet ?? lab.bet, range: L.BET_RANGE, toValue: toValueBet, onChange: setLiveBet,
    onCommit: (v) => { setLiveBet(v); setLab((s) => L.setBet(s, v)); }, direction: 'ltr', pageStep: 10,
  });
  const BET = liveBet ?? lab.bet;

  /** L'état validé, y compris une valeur au clavier encore en attente. */
  const committed = (s) => {
    let base = s;
    if (liveS != null && liveS !== s.s) base = s.mode === 'single' ? L.setS(base, liveS) : L.setDraft(base, liveS);
    if (liveBet != null && liveBet !== s.bet) base = L.setBet(base, liveBet);
    return base;
  };
  const flushAll = () => { st.flush(); sb.flush(); };

  /* « جرّب كل الإمكانيات » (un changement) : toutes les valeurs entières de t, de −50 à +50, sur l'article choisi.
     Chaque t validé est l'essai exact de la main (L.setS) ; la barre additive et le 2e article restent à l'élève. */
  const labRef = useRef(lab);
  labRef.current = lab;
  const untriedS = () => {
    const cur = labRef.current;
    if (cur.mode !== 'single') return [];
    return Array.from({ length: 2 * L.T_MAX + 1 }, (_, n) => n - L.T_MAX).filter((v) => v !== 0 && !cur.trials.some((u) => u.id === cur.selected && u.s === v));
  };
  const autoComplete = single ? {
    label: t('manipulation.autoComplete.tryAll'),
    ready: true,
    remaining: untriedS().length,
    intervalMs: 480,
    maxTicks: 80,
    step: () => {
      const v = untriedS()[0];
      if (v === undefined) return;
      labRef.current = L.setS(labRef.current, v);
      setLiveS(v); setDir(v > 0 ? 'up' : 'down');
      setLab((x) => L.setS(x, v));
    },
    finish: () => {
      const todo = untriedS();
      if (todo.length === 0) return;
      labRef.current = todo.reduce((acc, v) => L.setS(acc, v), labRef.current);
      const lastV = todo[todo.length - 1];
      setLiveS(lastV); setDir(lastV > 0 ? 'up' : 'down');
      setLab((x) => todo.reduce((acc, v) => L.setS(acc, v), x));
    },
  } : undefined;
  const tryAdditive = () => { flushAll(); setLab((s) => L.tryAdditive(committed(s))); };
  const select = (id) => { flushAll(); setLab((s) => L.select(committed(s), id)); };
  const commitStep = () => { flushAll(); setLab((s) => L.commitStep(committed(s))); setLiveS(null); };
  const newChain = () => { flushAll(); setLab((s) => L.newChain(committed(s))); setLiveS(null); };

  /* ── les mots ── */
  const W = lab.world;
  const unit = k(`worlds.${W}.unit`);
  const changeWord = (s) => (s === 0 ? k('noChange') : k(s > 0 ? 'changeUp' : 'changeDown', { t: Math.abs(s) }));
  const artName = (id) => k(`articles.${id}`);
  const r = single ? L.reading(lab, S) : null;
  const stepWord = (s) => k(s > 0 ? 'worlds.tank.stepUp' : 'worlds.tank.stepDown', { t: Math.abs(s) });
  const netWord = (pct) => {
    if (LIN.isZero(pct)) return k('noChange');
    const neg = LIN.cmp(pct, LIN.frac(0)) < 0;
    const abs = neg ? LIN.sub(LIN.frac(0), pct) : pct;
    return k(neg ? 'changeDown' : 'changeUp', { t: L.dec(abs) });
  };
  const changesText = lab.target.map((s) => (W === 'tank' ? stepWord(s) : changeWord(s))).join(` ${k('then')} `);
  const missionText = mission ?? (single
    ? k('missionSingle', { article: artName(lab.articles[0].id), x: L.dec(lab.articles[0].x), unit, change: changeWord(lab.target[0]) })
    : k('missionChain', { what: k(`worlds.${W}.what`), x: L.dec(lab.start), unit, changes: changesText }));

  /* ── le verdict ── */
  const last = lab.last;
  const bv = L.betVerdict(lab);
  // Sur téléphone, le verdict est la version COURTE (une à deux lignes : règle d'un seul écran).
  const vk = (key) => (key);
  const verdict = last && (() => {
    switch (last.kind) {
      case 'needT': return <span className="text-slate-700">{k(vk('vNeedT'))}</span>;
      case 'zero': return <span className="text-slate-700">{k(vk('vZero'))}</span>;
      case 'select': return <span className="text-slate-800">{k(vk('vSelect'), { article: artName(last.id) })}</span>;
      case 'trial': {
        const rr = L.reading(lab, last.s, last.id);
        return <span className="text-slate-900"><MathText>{k(vk('vTrial'), { change: changeWord(last.s), prod: L.productTex(rr.x, rr.k) })}</MathText></span>;
      }
      case 'additive': {
        const rr = L.reading(lab, last.s, last.id);
        return (
          <span className="text-rose-800" data-percent-refused="additive">
            <MathText>{k(vk(last.s > 0 ? 'vAddUp' : 'vAddDown'), { plusVal: L.decTex(rr.plus), yVal: L.decTex(rr.y), plus: `${L.decTex(rr.x)} ${last.s > 0 ? '+' : '-'} ${Math.abs(last.s)} = ${L.decTex(rr.plus)}`, prod: L.productTex(rr.x, rr.k), t: Math.abs(last.s), unit })}</MathText>
          </span>
        );
      }
      case 'betFirst': return <span className="text-amber-800">{k(vk('vBetFirst'))}</span>;
      case 'bet': return <span className="text-slate-800"><MathText>{k(vk('vBet'), { bet: L.pctTex(L.betPercent(last.bet)) })}</MathText></span>;
      case 'overflow': return <span className="text-rose-800" data-percent-refused="overflow"><MathText>{k(vk('vOverflow'), { cap: L.dec(lab.capacity), unit, v: L.decTex(L.preview(lab, last.s)) })}</MathText></span>;
      case 'full': return <span className="text-slate-800">{k(vk('vFull'))}</span>;
      case 'step': return <span className="text-slate-900"><MathText>{k(vk('vStep'), { change: changeWord(last.s), line: L.chainLinesTex(lab).at(-1) ?? '' })}</MathText></span>;
      case 'newChain': return <span className="text-slate-800"><MathText>{k(vk('vNewChain'), { start: L.decTex(lab.start), unit })}</MathText></span>;
      case 'betOk':
      case 'betKo': {
        if (!bv) return null;
        const ok = last.kind === 'betOk';
        return (
          <span className={ok ? 'text-emerald-800' : 'text-rose-800'} data-percent-refused={ok ? undefined : 'bet'}>
            <MathText>{k(vk(ok ? 'vBetOk' : 'vBetKo'), { bet: L.pctTex(bv.bet), betted: L.decTex(bv.betted), real: L.decTex(bv.real), unit })}</MathText>
            {/* le pari « on additionne » : la somme des t % contre le produit des multiplicateurs */}
            {!ok && LIN.eq(bv.sum, bv.bet) && <> <MathText>{k('sumNote', { sum: L.pctTex(bv.sum), kline: L.chainKTex(lab.chain) })}</MathText></>}
          </span>
        );
      }
      default: return null;
    }
  })();

  /* ── la découverte : distracteurs réfutés par les essais de l'élève ── */
  const discoveryOptions = useMemo(() => {
    if (single) {
      const s0 = lab.target[0];
      const a0 = lab.articles[0];
      const r0 = L.reading(lab, s0, a0.id);
      const take = LIN.div(LIN.frac(Math.abs(s0)), LIN.frac(100));
      const opts = [
        { text: <MathText>{k('dOptRightSingle', { k: L.decTex(r0.k) })}</MathText>, correct: true },
      ];
      const add = lab.additiveTrials.find((a) => a.s === s0) ?? { id: a0.id, x: a0.x, s: s0 };
      const ra = L.reading(lab, add.s, add.id);
      opts.unshift({
        text: <MathText>{k(s0 > 0 ? 'dOptAdd' : 'dOptSub', { t: Math.abs(s0), unit })}</MathText>,
        why: <MathText>{k('dWhyAdd', { plus: `${L.decTex(ra.x)} ${s0 > 0 ? '+' : '-'} ${Math.abs(s0)} = ${L.decTex(ra.plus)}`, prod: L.productTex(ra.x, ra.k) })}</MathText>,
      });
      opts.push({
        text: <MathText>{k('dOptTake', { take: L.decTex(take) })}</MathText>,
        why: <MathText>{k(s0 > 0 ? 'dWhyTakeUp' : 'dWhyTakeDown', { takeProd: `${L.decTex(a0.x)} \\times ${L.decTex(take)} = ${L.decTex(LIN.mul(a0.x, take))}`, y: L.decTex(r0.y) })}</MathText>,
      });
      return opts;
    }
    const kT = L.chainK(lab.target);
    const net = L.netPercent(kT);
    const sum = LIN.frac(lab.target.reduce((s, v) => s + v, 0));
    const sumK = LIN.add(LIN.frac(1), LIN.div(sum, LIN.frac(100)));
    const opts = [
      { text: <MathText>{k('dOptSum', { net: netWord(sum) })}</MathText>,
        why: <MathText>{k('dWhySum', { sum: L.pctTex(sum), betted: L.decTex(LIN.mul(lab.start, sumK)), real: L.decTex(L.current(lab, lab.target)), unit })}</MathText> },
      { text: <MathText>{k('dOptRightChain', { kline: L.chainKTex(lab.target), net: netWord(net) })}</MathText>, correct: true },
    ];
    const c = L.contrastChain(lab);
    if (c) {
      opts.push({
        text: <MathText>{k('dOptBack', { first: changeWord(c.steps[0]), second: changeWord(c.steps[1]) })}</MathText>,
        why: <MathText>{k('dWhyBack', { line: `${L.decTex(lab.start)} \\times ${L.chainKTex(c.steps).split(' = ')[0]} = ${L.decTex(L.current(lab, c.steps))}`, start: L.decTex(lab.start), unit })}</MathText>,
      });
    }
    return opts;
  }, [lab, k]); // eslint-disable-line react-hooks/exhaustive-deps

  const formal = (() => {
    if (single) {
      const s0 = lab.target[0];
      const r0 = L.reading(lab, s0, lab.articles[0].id);
      return (
        <div className="space-y-2" data-percent-formal>
          <EquationDisplay tone="result" tex={L.productTex(r0.x, r0.k)} note={<MathText>{k('fSingle', { change: changeWord(s0), mult: L.multiplierTex(s0), prod: L.productTex(r0.x, r0.k) })}</MathText>} />
          <EquationDisplay tone="neutral" tex={L.fnTex(r0.k)} note={<MathText>{k('fFn', { fn: L.fnTex(r0.k), k: L.decTex(r0.k) })}</MathText>} />
          <p className="text-sm text-emerald-900"><MathText>{k('fRule')}</MathText></p>
        </div>
      );
    }
    const kT = L.chainK(lab.target);
    const c = L.contrastChain(lab);
    const full = `${L.decTex(lab.start)} \\times ${L.chainKTex(lab.target).split(' = ')[0]} = ${L.decTex(L.current(lab, lab.target))}`;
    return (
      <div className="space-y-2" data-percent-formal>
        <EquationDisplay tone="result" tex={full} note={<MathText>{k('fChainFn', { fn: L.fnTex(kT), net: netWord(L.netPercent(kT)) })}</MathText>} />
        <p className="text-sm text-emerald-900"><MathText>{k('fChainRule')}</MathText></p>
        {c && <p className="text-sm text-slate-800"><MathText>{k('fContrast', { kline: L.chainKTex(c.steps), net: netWord(L.netPercent(L.chainK(c.steps))) })}</MathText></p>}
      </div>
    );
  })();

  /* ── les étapes et leurs questions : chaque étape est FAITE quand son but est atteint ET ses questions répondues ── */
  const TASKS = single ? ['set', 'table', 'add'] : ['chain', 'contrast'];
  const reachedOf = single
    ? { set: L.targetSet(lab), table: L.table(lab).length >= 2, add: lab.additiveTrials.length > 0 }
    : { chain: L.targetChainDone(lab) && L.betTriedOnTarget(lab), contrast: !!L.contrastChain(lab) && L.betMatched(lab) };
  const doneOf = (id) => !!reachedOf[id] && (cpEnabled ? !!cpDone[id] : true);
  const stepDone = TASKS.map(doneOf);
  const firstOpen = stepDone.findIndex((d) => !d);
  const ti = firstOpen < 0 ? TASKS.length - 1 : firstOpen;
  const stage = TASKS[ti];
  const lastTask = TASKS[TASKS.length - 1];
  const chainOf = cpEnabled ? CHAINS[stage] : null;
  const wordOfStep = (sv) => (W === 'tank' ? stepWord(sv) : changeWord(sv));
  const cp = useLabCheckpoint({
    id: chainOf ? stage : null,
    questions: chainOf && reachedOf[stage]
      ? chainOf.map((q) => QUESTIONS[q](lab, {
        k, W, unit, change: wordOfStep, changes: changesText, artName,
        discoveryOptions,
        discoveryPrompt: <MathText>{single ? k('dPromptSingle', { change: changeWord(lab.target[0]) }) : k('dPromptChain', { changes: changesText })}</MathText>,
        formal,
      }))
      : null,
    reached: !!reachedOf[stage],
    resetKey: inits,
    onRetry: () => { setLab((x) => L.retryTask(x, stage)); setLiveS(null); setLiveBet(null); },
    onEvent: (ev) => state.report(onCheckpoint, ev),
    onDone: (id) => { setCpDone((d) => ({ ...d, [id]: true })); if (id === lastTask) { state.discover(); state.formalize(); } },
  });

  /* ── le son (2026-10-28) : un déclic par pourcent de la poignée (plus grave en arrière), une cloche à chaque pas ajouté, le drapeau pour un essai
     au t % de la leçon ou un pari juste, « over » pour un refus. Muet sauf « الصوت » (l'interrupteur de l'en-tête du labo). ── */
  const sfx = useRef({ s: undefined, at: 0, key: -1, last: null });
  useEffect(() => {
    const p = sfx.current;
    if (p.key !== inits) { sfx.current = { s: S, at: 0, key: inits, last: lab.last }; return; }
    if (p.s !== S) {
      const now = performance.now();
      if (now - p.at > 35) { playSfx('tooth', { pitch: S > p.s ? 1 : 0.75 }); p.at = now; }
    }
    p.s = S;
  }, [S, inits]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const p = sfx.current;
    if (p.key !== inits || lab.last === p.last) return;
    p.last = lab.last;
    const kind = lab.last?.kind;
    if (kind === 'step') playSfx('bell');
    else if (kind === 'trial' && lab.last.s === lab.target[0]) playSfx('flag');
    else if (kind === 'betOk') playSfx('flag');
    else if (kind === 'additive' || kind === 'overflow' || kind === 'betKo') playSfx('over');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la fête : une fois par étape FAITE (réarmée après « إعادة ») ── */
  const party = useStepCelebration();
  const celebrated = useRef({ key: inits, set: new Set() });
  if (celebrated.current.key !== inits) celebrated.current = { key: inits, set: new Set() };
  const doneKey = stepDone.join();
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.set.has(i)) return;
      celebrated.current.set.add(i);
      party.celebrate({ n: i + 1, total: TASKS.length });
    });
  }, [doneKey, inits]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la représentation vivante (sous la scène) ── */
  const kNow = single ? r.k : L.chainK(lab.chain);
  const representation = single
    ? <EquationDisplay tone={S === 0 ? 'neutral' : 'active'} tex={L.fnTex(r.k)} note={<MathText>{`${k('fnLabel')} — ${k('kLabel')} $${L.decTex(r.k)}$`}</MathText>} />
    : <EquationDisplay tone="neutral" tex={L.fnTex(kNow)} note={<MathText>{`${k('kLabel')} $${L.chainKTex(lab.chain)}$`}</MathText>} />;

  /* ── les commandes ── */
  const dirButtons = (
    <div role="group" aria-label={k('dirGroup')} className="flex gap-1.5">
      {['up', 'down'].map((d) => (
        <button key={d} type="button" onClick={() => pickDir(d)} aria-pressed={shownDir === d} data-percent-dir={d}
          className={`min-h-[44px] rounded-xl border-2 px-3 text-sm font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${shownDir === d
            ? (d === 'up' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-rose-600 bg-rose-600 text-white')
            : 'border-slate-300 bg-white text-slate-700'}`}>
          {k(d)}
        </button>
      ))}
    </div>
  );
  const magButtons = (
    <div dir="ltr" className="flex gap-1.5">
      <button type="button" onClick={() => nudgeMag(-1)} aria-label={k('tLess')} disabled={mag === 0} data-percent-less="t"
        className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-1 text-xs font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Minus className="h-4 w-4" aria-hidden="true" />{'1%'}</button>
      <button type="button" onClick={() => nudgeMag(1)} aria-label={k('tMore')} disabled={mag >= L.T_MAX} data-percent-more="t"
        className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-1 text-xs font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"><Plus className="h-4 w-4" aria-hidden="true" />{'1%'}</button>
    </div>
  );

  const bars = (
    <Bars
      stretch={st}
      scale={scale}
      width={trackW}
      x={baseX}
      s={S}
      unit={unit}
      compact={!wide}
      additive={single && lab.additive && lab.additive.id === art.id && lab.additive.s === S ? lab.additive : null}
      capacity={lab.capacity}
      k={k}
      changeWord={changeWord}
      labels={single ? { before: `${k('before')}: ${artName(art.id)}`, after: k('after') } : { before: `${k('stepTitle', { n: Math.min(lab.chain.length + 1, L.CHAIN_MAX) })} · ${k('before')}`, after: k('after') }} />
  );

  const newChainBtn = (
    <button type="button" onClick={newChain} data-percent-new-chain disabled={lab.chain.length === 0} title={k('newChain')}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-2 text-xs font-bold text-slate-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />{k('newChain')}
          </button>
  );

  const readings = single ? (
    <div dir="ltr" className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 font-bold text-slate-900 text-sm" data-percent-line="single">
      <span><MathText>{`$k = ${L.multiplierTex(S)}$`}</MathText></span>
      <span><MathText>{`$${L.productTex(art.x, r.k)}$`}</MathText></span>
      <span className="text-indigo-800"><MathText>{`$${L.fnTex(r.k)}$`}</MathText></span>
    </div>
  ) : (
    <div className="flex items-start gap-1.5 contents">

      <div className="min-w-0 flex-1 space-y-0.5 font-bold text-slate-900 text-sm" data-percent-line="chain">
      {lab.chain.length === 0
        ? <p className="text-xs font-normal text-slate-500">{k('chainEmpty')}</p>
          : (<div dir="ltr" className="flex flex-wrap gap-x-4">
            {L.chainLinesTex(lab).map((ln) => <span key={ln}><MathText>{`$${ln}$`}</MathText></span>)}
        </div>)}
        {lab.chain.length >= 2 && (
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-xs text-slate-600">{k('kLabel')}</span>
            <bdi dir="ltr"><MathText>{`$${L.chainKTex(lab.chain)}$`}</MathText></bdi>
            <span className="text-xs text-slate-600">{k('netLabel')}:</span>
            <span>{netWord(L.netPercent(L.chainK(lab.chain)))}</span>
          </p>
        )}
    </div>
    </div>
  );

  const betRuler = !single && (
    <div className="space-y-1" data-percent-bet>
      <h4 className="text-xs font-extrabold text-amber-900">{k('betTitle')}</h4>
      <BetTrack stretch={sb} width={betTrackW} value={BET} px={betPx} label={k('betHandle')} notSet={k('betNotSet')} />
      <div dir="ltr" className="flex items-center gap-1.5">
        <button type="button" onClick={() => sb.set((BET ?? 0) - 1)} aria-label={k('betLess')} data-percent-less="bet" disabled={BET != null && BET <= L.BET_RANGE.min}
          className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 border-amber-300 bg-white px-1 text-xs font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"><Minus className="h-4 w-4" aria-hidden="true" />{'0,5%'}</button>
        <span className="min-w-[3.5rem] rounded-full bg-amber-100 px-2 text-center font-mono text-sm font-extrabold text-amber-900" data-percent-bet-value={BET ?? ''} title={k('betHandle')}>
          {BET == null ? <span className="whitespace-nowrap font-sans text-[11px]">{k('betNotSet')}</span> : <MathText>{`$${L.pctTex(L.betPercent(BET))}$`}</MathText>}
        </span>
        <button type="button" onClick={() => sb.set((BET ?? 0) + 1)} aria-label={k('betMore')} data-percent-more="bet" disabled={BET != null && BET >= L.BET_RANGE.max}
          className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl border-2 border-amber-300 bg-white px-1 text-xs font-bold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"><Plus className="h-4 w-4" aria-hidden="true" />{'0,5%'}</button>
      </div>
    </div>
  );

  const controls = (
    <div ref={ctrlRef} className="space-y-2" data-percent-controls>
      {betRuler}
      {bars}
      <div className="flex flex-wrap items-center gap-1.5" data-percent-actions>
        {dirButtons}
        {!single && newChainBtn}
        {magButtons}
        {single ? (
          <button type="button" onClick={tryAdditive} data-percent-try
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-dashed border-amber-500 bg-amber-50 px-2 text-xs font-bold text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            <FlaskConical className="h-4 w-4" aria-hidden="true" />{k((shownDir === 'up' ? 'tryUp' : 'tryDown'), { t: mag, unit })}
          </button>
        ) : (
          <button type="button" onClick={commitStep} data-percent-commit
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-indigo-600 bg-indigo-600 px-2 text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
            <ListPlus className="h-4 w-4" aria-hidden="true" />{k('commit')}
          </button>
        )}
      </div>
      {readings}
      <p role="status" className="min-h-[2.5rem] text-sm font-bold leading-snug" data-percent-verdict={last?.kind ?? ''}>{verdict}</p>
    </div>
  );

  const world = single
    ? <MallWorld lab={lab} art={art} S={S} height={worldH} wide={wide} unit={unit} k={k} artName={artName} onSelect={select} />
    : <TankWorld lab={lab} S={S} bet={BET} height={wide ? worldH : Math.min(worldH, 170)} width={wide ? colW : Math.min(colW, 360)} unit={unit} k={k} />;

  const rows = single ? L.table(lab) : [];

  return (
    <ManipulationShell
      type="percent-tag"
      title={title ?? k('title')}
      mission={missionText}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={!!chainOf || cpEnabled}
      hints={(single ? ['hint1Single', 'hint2Single', 'hint3Single'] : ['hint1Chain', 'hint2Chain', 'hint3Chain']).map((h) => <MathText key={h}>{k(h)}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false, ...(autoComplete ? { autoComplete } : {}) }}
      representation={representation}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={<MathText>{single ? k('dPromptSingle', { change: changeWord(lab.target[0]) }) : k('dPromptChain', { changes: changesText })}</MathText>}
          options={discoveryOptions}
          formal={formal}
        />
      )}
      explanation={<MathText>{k(single ? 'explanationSingle' : 'explanationChain')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-amber-50/60 to-white" data-dragging={st.dragging || sb.dragging ? 'true' : undefined}>
        <div ref={boxRef} className="space-y-3" data-percent-tag data-mode={lab.mode} data-world={W} data-s={S}
          data-k={LIN.fracText(kNow)} data-y={single ? LIN.fracText(r.y) : LIN.fracText(L.current(lab))} data-solved={ready ? 'true' : 'false'}
          data-layout={wide ? 'side' : 'stack'} data-budget={budget} data-world-h={worldH} data-ctrl-h={ctrlH}>
          <div className="relative space-y-3">
            {party.node}
            {cp.node}
            <LabStepper count={TASKS.length} current={ti} done={stepDone} stepAttr="data-pt-step" />
            <div className={wide ? 'grid grid-cols-2 items-start gap-3' : 'space-y-3'} data-percent-glance>
              {world}
              {controls}
            </div>
          </div>

          {/* ── en dessous (secondaire, repliable) : le tableau de l'élève, les chaînes construites ── */}
          {single && lab.trials.length > 0 && (
            <LabFold id="percent-tag.table" title={k('tableTitle')}>
              {rows.length === 0 ? <p className="text-xs text-slate-500">{k('tableEmpty')}</p> : (
                <table className="w-full text-sm" data-percent-table={rows.length}>
                  <thead>
                    <tr className="text-xs text-slate-500">
                      <th className="text-start font-semibold">{k('colItem')}</th>
                      <th className="font-semibold"><bdi dir="ltr">x</bdi></th>
                      <th className="font-semibold"><bdi dir="ltr">y</bdi></th>
                      <th className="font-semibold"><bdi dir="ltr">{k('colRatio')}</bdi></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} data-percent-row={row.id}>
                        <td>{artName(row.id)}</td>
                        <td className="text-center"><bdi dir="ltr">{L.dec(row.x)}</bdi></td>
                        <td className="text-center"><bdi dir="ltr">{L.dec(row.y)}</bdi></td>
                        <td className="text-center font-bold text-indigo-800"><bdi dir="ltr">{L.dec(row.ratio)}</bdi></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </LabFold>
          )}
          {!single && lab.chains.length > 0 && (
            <LabFold id="percent-tag.chains" title={k('chainsTitle')}>
              <ul className="space-y-1" data-percent-chains>
                {lab.chains.map((c) => {
                  const kk = L.chainK(c.steps);
                  const bt = lab.betTrials.filter((b) => b.steps.join() === c.steps.join());
                  const ok = bt.some((b) => b.ok);
                  return (
                    <li key={c.steps.join()} data-percent-chain-trial={c.steps.join('|')} data-ok={String(ok)} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                      <span className="font-bold text-slate-800">{c.steps.map(changeWord).join(` ${k('then')} `)}</span>
                      <bdi dir="ltr"><MathText>{`$${L.chainKTex(c.steps)}$`}</MathText></bdi>
                      <span className="text-slate-700">{netWord(L.netPercent(kk))}</span>
                      {bt.length > 0 && <span className={ok ? 'text-emerald-700' : 'text-rose-700'}>{k(ok ? 'betOkTag' : 'betKoTag')}</span>}
                    </li>
                  );
                })}
              </ul>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

/** Ce que la leçon reçoit à chaque essai : les propres essais de l'élève, écrits (TeX). */
function evidenceOf(lab) {
  if (lab.mode === 'single') {
    return {
      mode: 'single',
      trials: lab.trials.map((tr) => { const rr = L.reading(lab, tr.s, tr.id); return { id: tr.id, s: tr.s, tex: L.productTex(rr.x, rr.k) }; }),
      additive: lab.additiveTrials.map((tr) => { const rr = L.reading(lab, tr.s, tr.id); return { id: tr.id, s: tr.s, tex: `${L.decTex(rr.x)} ${tr.s > 0 ? '+' : '-'} ${Math.abs(tr.s)} = ${L.decTex(rr.plus)}`, prodTex: L.productTex(rr.x, rr.k) }; }),
      table: L.table(lab).map((row) => ({ id: row.id, x: L.dec(row.x), y: L.dec(row.y), ratio: L.dec(row.ratio) })),
    };
  }
  return {
    mode: 'chain',
    firstBet: lab.firstBet == null ? null : L.pctTex(L.betPercent(lab.firstBet)),
    chains: lab.chains.map((c) => ({ steps: c.steps, lines: L.chainLinesTex(lab, c.steps), k: L.chainKTex(c.steps), net: L.pctTex(L.netPercent(L.chainK(c.steps))) })),
    bets: lab.betTrials.map((b) => ({ bet: L.pctTex(L.betPercent(b.bet)), steps: b.steps, ok: b.ok })),
  };
}

/* ── la piste des barres : « قبل » (fixe) et « بعد » (sa poignée au bout) ── */
// Deux géométries : normale, et COMPACTE sur téléphone (règle d'un seul écran, §8bis).
const BAR_GEOM = {
  normal: { H: 84, x: [4, 16], y: [24, 18], add: [46, 12], tick: 62, text: 77, handleTop: 11 },
  compact: { H: 62, x: [2, 10], y: [15, 14], add: [32, 9], tick: 44, text: 57, handleTop: 0 },
};
function Bars({ stretch, scale, width, x, s, unit, compact, additive, capacity, k, changeWord, labels }) {
  const g = BAR_GEOM[compact ? 'compact' : 'normal'];
  const y = LIN.mul(x, L.multiplier(s));
  const xPx = scale.px(x);
  const yPx = scale.px(y);
  const over = capacity && LIN.cmp(y, capacity) > 0;
  const color = s > 0 ? '#059669' : s < 0 ? '#E11D48' : '#6366F1';
  const ticks = L.percentTicks(x, scale, width < 260);
  const plus = additive ? LIN.add(x, LIN.frac(additive.s)) : null;
  return (
    <div className="space-y-0.5" data-percent-bars>
      {/* l'en-tête : « قبل x » — « بعد y » et le t % de la poignée (une seule ligne sur téléphone) */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-[11px] font-bold text-slate-600">
        <span>{labels.before} <bdi dir="ltr" className="text-slate-900">{L.dec(x)} {unit}</bdi></span>
        <span className="inline-flex items-baseline gap-1">
          {labels.after} <bdi dir="ltr" className="text-sm" style={{ color }}>{L.dec(y)} {unit}</bdi>
          <bdi dir="ltr" className="rounded-full px-1.5 font-mono text-xs font-extrabold text-white" style={{ background: color }} data-percent-t={s}>
            {s > 0 ? `+${s}` : s < 0 ? `−${-s}` : '0'}%
          </bdi>
          </span>
        </div>
      <div {...stretch.trackProps} className="relative" style={{ ...stretch.trackProps.style, height: g.H, width }}>
        <svg width={width} height={g.H} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
          {/* « قبل » : la barre de x, fixe */}
          <rect x={scale.edge} y={g.x[0]} width={Math.max(0, xPx - scale.edge)} height={g.x[1]} rx={3} fill="#CBD5E1" />
          <line x1={xPx} x2={xPx} y1={0} y2={g.tick} stroke="#64748B" strokeDasharray="3 2" />
          {/* « بعد » : la barre multipliée (la poignée est au bout) */}
          <rect x={scale.edge} y={g.y[0]} width={Math.max(0, yPx - scale.edge)} height={g.y[1]} rx={4} fill={color} opacity={0.9}
            style={{ transition: stretch.dragging ? 'none' : 'width 140ms' }} className="motion-reduce:transition-none" />
          {over && <rect x={scale.px(capacity)} y={g.y[0]} width={Math.max(0, yPx - scale.px(capacity))} height={g.y[1]} fill="url(#pt-over)" />}
          <defs>
            <pattern id="pt-over" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="3" height="6" fill="#F43F5E" />
            </pattern>
          </defs>
          {/* la barre ADDITIVE essayée (pointillés) */}
          {plus && (
            <g data-percent-additive>
              <rect x={scale.edge} y={g.add[0]} width={Math.max(0, scale.px(plus) - scale.edge)} height={g.add[1]} rx={3} fill="none" stroke="#D97706" strokeWidth={2} strokeDasharray="5 3" />
              <line x1={scale.px(plus)} x2={scale.px(plus)} y1={g.add[0] - 3} y2={g.add[0] + g.add[1] + 3} stroke="#D97706" strokeWidth={2} />
            </g>
          )}
          {/* les graduations en % (relatives à x) */}
          {ticks.map((tk) => (
            <g key={tk.s}>
              <line x1={tk.at} x2={tk.at} y1={g.tick} y2={tk.label ? g.tick + 6 : g.tick + 3} stroke="#94A3B8" strokeWidth={tk.s === 0 ? 1.6 : 1} />
              {tk.label && <text x={tk.at} y={g.text} textAnchor="middle" fontSize={9.5} fill="#475569" fontFamily="ui-monospace, monospace">{tk.s > 0 ? `+${tk.s}` : tk.s === 0 ? '0' : `−${-tk.s}`}%</text>}
            </g>
          ))}
        </svg>
        <div
          {...stretch.handleProps({ label: k('handle'), valueText: changeWord(s) })}
          data-percent-handle="t"
          className={`absolute flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-white/80 shadow outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${stretch.dragging ? 'border-indigo-600' : 'border-slate-500'}`}
          style={{ left: yPx, top: g.handleTop, cursor: stretch.dragging ? 'grabbing' : 'grab' }}
        >
          <span aria-hidden="true" className="h-5 w-1.5 rounded-full" style={{ background: color }} />
        </div>
      </div>
    </div>
  );
}

/* ── la piste du pari (demi-points, −50 % … +10 %) ── */
function BetTrack({ stretch, width, value, px, label, notSet }) {
  const marks = [-100, -80, -60, -40, -20, 0, 20];
  return (
    <div {...stretch.trackProps} className="relative" style={{ ...stretch.trackProps.style, height: 46, width }}>
      <svg width={width} height={46} className="absolute inset-0" aria-hidden="true" focusable="false" style={{ direction: 'ltr' }}>
        <rect x={12} y={20} width={width - 24} height={4} rx={2} fill="#FCD34D" />
        {marks.map((b) => (
          <g key={b}>
            <line x1={px(b)} x2={px(b)} y1={26} y2={32} stroke="#B45309" />
            <text x={px(b)} y={43} textAnchor="middle" fontSize={9.5} fill="#78350F" fontFamily="ui-monospace, monospace">{b > 0 ? `+${b / 2}` : b === 0 ? '0' : `−${-b / 2}`}%</text>
          </g>
        ))}
      </svg>
      <div
        {...stretch.handleProps({ label, valueText: value == null ? notSet : `${value / 2}%` })}
        data-percent-handle="bet"
        className={`absolute top-0 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-2 outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${value == null ? 'border-dashed border-amber-400 bg-amber-50/80' : 'border-amber-600 bg-white'}`}
        style={{ left: px(value ?? 0), cursor: stretch.dragging ? 'grabbing' : 'grab' }}
      >
        <span aria-hidden="true" className="text-base">🎯</span>
      </div>
    </div>
  );
}

/* ── le monde `mall` : la vitrine, l'étiquette (prix barré → nouveau prix) ── */
function MallWorld({ lab, art, S, height, wide, unit, k, artName, onSelect }) {
  const rr = L.reading(lab, S, art.id);
  // Côte à côte, la vitrine occupe la hauteur de la colonne ; empilée (téléphone), elle est COMPACTE.
  const tagH = wide ? Math.max(56, Math.min(110, Math.round(height * 0.38))) : 44;
  const itemH = wide ? Math.max(40, Math.min(96, height - tagH - 80)) : 40;
  return (
    <div className="relative space-y-1.5 rounded-2xl border-2 border-slate-200 bg-white p-2" data-percent-world="mall" style={wide ? { minHeight: height } : undefined}>
        <div className="relative flex items-center justify-between gap-2 pe-12">
          <h4 className="text-xs font-extrabold text-slate-700">{k('worlds.mall.name')}</h4>
          <Deco world="mall" />
        </div>
      <Awning />
      <div className="grid grid-cols-3 gap-1.5" role="group" aria-label={k('worlds.mall.name')}>
        {lab.articles.map((a) => {
          const on = a.id === art.id;
          return (
            <button key={a.id} type="button" onClick={() => onSelect(a.id)} aria-pressed={on} data-percent-article={a.id}
              aria-label={k('pickArticle', { article: artName(a.id), x: L.dec(a.x), unit })}
              className={`flex min-h-[44px] flex-col items-center justify-end rounded-xl border-2 px-0.5 pb-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${on ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}>
              <span className="block w-full" style={{ height: itemH }}><Article id={a.id} /></span>
              <span dir="ltr" className="whitespace-nowrap font-mono font-bold text-slate-700 text-[11px]">{L.dec(a.x)} {unit}</span>
            </button>
          );
        })}
      </div>
      {/* l'étiquette du prix : l'ancien barré, le nouveau (la conséquence de la poignée) */}
      <PriceTag height={tagH} name={artName(art.id)} x={L.dec(art.x)} y={L.dec(rr.y)} s={S} unit={unit} />
    </div>
  );
}

function PriceTag({ height, name, x, y, s, unit }) {
  const color = s > 0 ? '#047857' : s < 0 ? '#BE123C' : '#334155';
  return (
    <div className="relative mx-auto flex items-center justify-center gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 px-4" style={{ height, maxWidth: 320 }} data-percent-price-tag>
      <span aria-hidden="true" className="absolute -top-2 start-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-amber-500 bg-white" />
      {name && <span className="text-xs font-bold text-amber-900">{name}</span>}
      <span dir="ltr" className="flex items-baseline gap-2 font-mono">
        <span className={`text-sm font-bold ${s === 0 ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{x}</span>
        {s !== 0 && <span className="font-black text-2xl" style={{ color }}>{y}</span>}
        <span className="text-xs font-bold text-slate-600">{unit}</span>
      </span>
    </div>
  );
}

function Awning() {
  return (
    <svg viewBox="0 0 300 18" width="100%" height="14" aria-hidden="true" focusable="false" preserveAspectRatio="none">
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 25} y="0" width="25" height="12" fill={['#16A34A', '#FFFFFF', '#DC2626'][i % 3]} />)}
      <path d="M0 12 Q12.5 18 25 12 Q37.5 18 50 12 Q62.5 18 75 12 Q87.5 18 100 12 Q112.5 18 125 12 Q137.5 18 150 12 Q162.5 18 175 12 Q187.5 18 200 12 Q212.5 18 225 12 Q237.5 18 250 12 Q262.5 18 275 12 Q287.5 18 300 12" fill="none" stroke="#94A3B8" />
    </svg>
  );
}

/** Les articles dessinés (SVG paramétré, jamais une image). */
function Article({ id }) {
  if (id === 'jersey') {
    return (
      <svg viewBox="0 0 48 44" width="100%" height="100%" aria-hidden="true" focusable="false">
        <path d="M14 4 L20 2 Q24 7 28 2 L34 4 L44 12 L38 20 L35 17 L35 42 L13 42 L13 17 L10 20 L4 12 Z" fill="#FFFFFF" stroke="#15803D" strokeWidth="1.6" />
        <path d="M13 17 L13 42 L24 42 L24 3.6 Q22 6 20 2 L14 4 Z" fill="#16A34A" opacity="0.9" />
        <circle cx="29" cy="15" r="3" fill="#DC2626" /><circle cx="30" cy="15" r="2.4" fill="#FFFFFF" />
        <text x="29" y="33" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#15803D" fontFamily="ui-monospace, monospace">10</text>
      </svg>
    );
  }
  if (id === 'cap') {
    return (
      <svg viewBox="0 0 48 44" width="100%" height="100%" aria-hidden="true" focusable="false">
        <path d="M8 28 Q8 10 26 10 Q42 10 42 28 Z" fill="#1E293B" />
        <path d="M6 28 L46 28 Q46 33 36 33 L6 33 Q2 30 6 28 Z" fill="#334155" />
        <circle cx="26" cy="10" r="2" fill="#F59E0B" />
        <path d="M18 20 L30 20" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 44" width="100%" height="100%" aria-hidden="true" focusable="false">
      <path d="M4 30 Q4 22 12 22 L20 14 Q24 12 26 16 L30 22 Q40 23 44 28 L44 33 L4 33 Z" fill="#F8FAFC" stroke="#334155" strokeWidth="1.5" />
      <path d="M4 33 L44 33 L44 37 Q44 39 42 39 L6 39 Q4 39 4 37 Z" fill="#F97316" />
      <path d="M14 24 L26 24 M16 21 L24 21" stroke="#6366F1" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M30 27 Q36 25 42 30" fill="none" stroke="#22C55E" strokeWidth="2" />
    </svg>
  );
}

/* ── le monde `tank` : le réservoir, l'eau, la ligne du pari ── */
function TankWorld({ lab, S, bet, height, width, unit, k }) {
  const cap = lab.capacity ?? LIN.mul(lab.start, LIN.frac(3, 2));
  const topV = LIN.mul(cap, LIN.frac(11, 10));
  const now = L.current(lab);
  const prev = S !== 0 ? L.preview(lab, S) : now;
  const shown = LIN.cmp(prev, topV) > 0 ? topV : prev;
  const H = Math.max(80, height - 26);
  const W0 = Math.max(140, Math.min(width - 8, 300));
  const pad = { top: 8, bottom: 16, left: 44, right: 54 };
  const inner = H - pad.top - pad.bottom;
  const yOf = (v) => pad.top + inner - (LIN.toNumber(v) / LIN.toNumber(topV)) * inner;
  const capY = yOf(cap);
  const tankL = pad.left;
  const tankR = W0 - pad.right;
  const waterY = yOf(shown);
  const betV = bet == null ? null : LIN.mul(lab.start, LIN.add(LIN.frac(1), LIN.div(L.betPercent(bet), LIN.frac(100))));
  const grads = [];
  const stepM = LIN.toNumber(cap) > 20 ? 5 : 1;
  for (let v = 0; v <= LIN.toNumber(cap) + 0.001; v += stepM) grads.push(v);
  const over = LIN.cmp(prev, cap) > 0;
  return (
    <div className="relative space-y-1 rounded-2xl border-2 border-slate-200 bg-white p-2" data-percent-world="tank">
      <div className="relative flex items-center justify-between gap-2 pe-12">
        <h4 className="whitespace-nowrap text-xs font-extrabold text-slate-700">{k('worlds.tank.name')}</h4>
        <span className="text-[11px] font-bold text-slate-500">{k('worlds.tank.capacity', { cap: L.dec(cap) })}</span>
        <Deco world="tank" />
      </div>
      <svg viewBox={`0 0 ${W0} ${H}`} width={W0} height={H} className="mx-auto block" aria-hidden="true" focusable="false"
        style={{ direction: 'ltr' }} data-percent-tank data-volume={LIN.fracText(now)}>
        {/* graduations (m³) */}
        {grads.map((v) => (
          <g key={v}>
            <line x1={tankL - 6} x2={tankL} y1={yOf(LIN.frac(v))} y2={yOf(LIN.frac(v))} stroke="#64748B" />
            <text x={tankL - 9} y={yOf(LIN.frac(v)) + 3.5} textAnchor="end" fontSize="10" fill="#334155" fontFamily="ui-monospace, monospace">{v}</text>
          </g>
        ))}
        {/* l'eau (aperçu pendant le geste) */}
        <rect x={tankL} y={waterY} width={tankR - tankL} height={Math.max(0, pad.top + inner - waterY)} fill={over ? '#FDA4AF' : '#7DD3FC'}
          style={{ transition: 'y 220ms, height 220ms' }} className="motion-reduce:transition-none" />
        <path d={`M${tankL} ${waterY} q ${(tankR - tankL) / 8} -3 ${(tankR - tankL) / 4} 0 t ${(tankR - tankL) / 4} 0 t ${(tankR - tankL) / 4} 0 t ${(tankR - tankL) / 4} 0`}
          fill="none" stroke="#0284C7" strokeWidth="2" style={{ transition: 'd 220ms' }} className="motion-reduce:transition-none" />
        {/* le niveau validé (sans l'aperçu) */}
        {S !== 0 && <line x1={tankL} x2={tankR} y1={yOf(now)} y2={yOf(now)} stroke="#0369A1" strokeDasharray="2 3" />}
        {/* la paroi et la capacité */}
        <path d={`M${tankL} ${pad.top} L${tankL} ${pad.top + inner} L${tankR} ${pad.top + inner} L${tankR} ${pad.top}`} fill="none" stroke="#334155" strokeWidth="3" />
        <line x1={tankL - 2} x2={tankR + 2} y1={capY} y2={capY} stroke="#334155" strokeWidth="1" strokeDasharray="6 3" />
        {/* la ligne du pari */}
        {betV && (
          <g data-percent-bet-line={LIN.fracText(betV)}>
            <line x1={tankL - 4} x2={tankR + 4} y1={yOf(betV)} y2={yOf(betV)} stroke="#D97706" strokeWidth="2.5" strokeDasharray="7 4" />
            <text x={tankR + 6} y={yOf(betV) + 4} fontSize="10" fontWeight="bold" fill="#B45309">🎯</text>
          </g>
        )}
        {/* le volume lu */}
        <text x={tankR + 6} y={Math.min(pad.top + inner - 2, Math.max(pad.top + 10, waterY + 14))} fontSize="11" fontWeight="bold" fill="#075985" fontFamily="ui-monospace, monospace">{L.dec(prev)}</text>
        <text x={(tankL + tankR) / 2} y={H - 3} textAnchor="middle" fontSize="10" fill="#475569">{unit}</text>
      </svg>
    </div>
  );
}

/**
 * Le DÉCOR — sans information, sans état du lab. Vitrine : les étiquettes se balancent et une
 * pièce tinte ; réservoir : une goutte tombe et la surface ondule. `aria-hidden`, hors du
 * clavier, immobile sous `prefers-reduced-motion`.
 */
function Deco({ world }) {
  const reduce = useReducedMotion();
  const [taps, setTaps] = useState(0);
  const tap = () => { if (!reduce) setTaps((n) => n + 1); };
  const anim = taps > 0 && !reduce;
  return (
    <button type="button" tabIndex={-1} aria-hidden="true" onClick={tap} data-deco={world}
      className="absolute -top-1 end-0 h-9 w-11 rounded-xl focus:outline-none">
      <svg viewBox="0 0 70 60" width="100%" height="100%">
        <style>{'.pt-swing{transform-origin:35px 4px;animation:pt-s .5s ease-in-out 3}@keyframes pt-s{0%,100%{transform:rotate(0)}25%{transform:rotate(14deg)}75%{transform:rotate(-14deg)}}.pt-drop{animation:pt-d .7s ease-in 1}@keyframes pt-d{0%{transform:translateY(-18px);opacity:1}100%{transform:translateY(10px);opacity:0}}.pt-coin{transform-box:fill-box;transform-origin:center;animation:pt-c .5s linear 2}@keyframes pt-c{0%{transform:scaleX(1)}50%{transform:scaleX(.15)}100%{transform:scaleX(1)}}@media (prefers-reduced-motion: reduce){.pt-swing,.pt-drop,.pt-coin{animation:none}}'}</style>
        {world === 'mall' && (
          <g>
            <line x1="35" y1="0" x2="35" y2="6" stroke="#94A3B8" strokeWidth="1.5" />
            <g key={`s${taps}`} className={anim ? 'pt-swing' : undefined}>
              <path d="M22 8 L48 8 L54 20 L48 32 L22 32 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
              <circle cx="27" cy="20" r="2.5" fill="#fff" stroke="#B45309" />
              <path d="M33 16 L46 16 M33 24 L42 24" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
            </g>
            <g key={`c${taps}`} className={anim ? 'pt-coin' : undefined}>
              <circle cx="58" cy="48" r="8" fill="#FBBF24" stroke="#B45309" strokeWidth="1.6" />
            </g>
            <circle cx="12" cy="50" r="7" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.4" />
          </g>
        )}
        {world === 'tank' && (
          <g>
            <rect x="14" y="26" width="42" height="30" rx="4" fill="#E0F2FE" stroke="#0369A1" strokeWidth="2" />
            <rect x="16" y="38" width="38" height="16" rx="2" fill="#7DD3FC" />
            <g key={taps} className={anim ? 'pt-drop' : undefined}>
              <path d="M35 6 Q41 16 35 20 Q29 16 35 6 Z" fill="#0EA5E9" />
            </g>
          </g>
        )}
      </svg>
    </button>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque étape. Les dernières (`rule`) sont l'ancienne découverte : elles formalisent. */
export const CHAINS = Object.freeze({
  set: ['read', 'mult'],
  table: ['second', 'same'],
  add: ['addWhy', 'rule'],
  chain: ['mult', 'volume', 'sum'],
  contrast: ['back', 'return', 'rule'],
});

const $q = (s) => `$${s}$`;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
/** La part d'un pourcentage : « t % de x ». */
const partOf = (x, s) => LIN.mul(x, LIN.div(LIN.frac(Math.abs(s)), LIN.frac(100)));

/** Chaque question est construite sur LES nombres de l'étape de l'élève (rien n'est écrit en dur) ; `env` : les mots du labo. */
export const QUESTIONS = {
  /* ── single : la vitrine ── */
  read: (lab, env) => {
    const { k, unit, change, artName } = env;
    const a = lab.articles[0]; const s0 = lab.target[0];
    const r = L.reading(lab, s0, a.id);
    return {
      id: 'read', kind: 'number', expected: L.dec(r.y), answer: <MathText>{$q(L.decTex(r.y))}</MathText>,
      prompt: Mx(k, 'read.prompt', { change: change(s0), article: artName(a.id), x: L.dec(a.x), unit }),
      hints: [Mx(k, 'read.hint1'), Mx(k, 'read.hint2', { part: L.dec(partOf(a.x, s0)), x: L.dec(a.x), unit })],
      explain: Mx(k, 'read.explain', { prod: $q(L.productTex(r.x, r.k)), unit }),
    };
  },
  mult: (lab, env) => {
    const { k, unit, W, change } = env;
    if (W === 'tank') {
      const s1 = lab.target[0];
      const m = L.multiplier(s1);
      const v1 = LIN.mul(lab.start, m);
      return {
        id: 'mult', kind: 'number', expected: L.dec(m), answer: <MathText>{$q(L.decTex(m))}</MathText>,
        prompt: Mx(k, 'mult.promptTank', { start: L.dec(lab.start), unit, change: change(s1) }),
        hints: [Mx(k, 'mult.hint1Tank'), Mx(k, 'mult.hint2Tank', { calc: $q(L.multiplierTex(s1)) })],
        explain: Mx(k, 'mult.explainTank', { calc: $q(`${L.decTex(lab.start)} \\times ${L.decTex(m)} = ${L.decTex(v1)}`), vol: L.dec(v1), unit }),
      };
    }
    const a = lab.articles[0]; const s0 = lab.target[0];
    const r = L.reading(lab, s0, a.id);
    return {
      id: 'mult', kind: 'number', expected: L.dec(r.k), answer: <MathText>{$q(L.decTex(r.k))}</MathText>,
      prompt: Mx(k, 'mult.prompt', { x: L.dec(a.x), y: L.dec(r.y), unit }),
      hints: [Mx(k, 'mult.hint1'), Mx(k, 'mult.hint2', { calc: $q(`\\dfrac{${L.decTex(r.y)}}{${L.decTex(r.x)}}`) })],
      explain: Mx(k, 'mult.explain', { prod: $q(L.productTex(r.x, r.k)), k: $q(L.decTex(r.k)) }),
    };
  },
  second: (lab, env) => {
    const { k, unit, change, artName } = env;
    const s0 = lab.target[0];
    const row = L.table(lab).at(-1);
    return {
      id: 'second', kind: 'number', expected: L.dec(row.y), answer: <MathText>{$q(L.decTex(row.y))}</MathText>,
      prompt: Mx(k, 'second.prompt', { change: change(s0), article: artName(row.id), x: L.dec(row.x), unit }),
      hints: [Mx(k, 'second.hint1'), Mx(k, 'second.hint2', { x: L.dec(row.x), k: L.dec(row.ratio) })],
      explain: Mx(k, 'second.explain', { prod: $q(L.productTex(row.x, row.ratio)), unit }),
    };
  },
  same: (lab, env) => {
    const { k } = env;
    const rows = L.table(lab);
    const [r1, r2] = [rows[0], rows.at(-1)];
    const q = (row) => $q(`\\dfrac{${L.decTex(row.y)}}{${L.decTex(row.x)}} = ${L.decTex(row.ratio)}`);
    const o = { q1: q(r1), q2: q(r2), k: $q(L.decTex(r1.ratio)), t: Math.abs(lab.target[0]) };
    return {
      id: 'same', kind: 'choice',
      prompt: Mx(k, 'same.prompt', o),
      options: [
        { text: Mx(k, 'same.bigger'), why: Mx(k, 'same.whyBigger', o) },
        { text: Mx(k, 'same.right', o), correct: true },
        { text: Mx(k, 'same.pct', o), why: Mx(k, 'same.whyPct', o) },
      ],
      hints: [Mx(k, 'same.hint1'), Mx(k, 'same.hint2')],
      explain: Mx(k, 'same.explain', o),
    };
  },
  addWhy: (lab, env) => {
    const { k, unit } = env;
    const a = lab.additiveTrials.at(-1);
    const r = L.reading(lab, a.s, a.id);
    const t = Math.abs(a.s);
    const o = {
      t, x: L.dec(r.x), unit, part: L.dec(partOf(r.x, a.s)),
      plus: $q(`${L.decTex(r.x)} ${a.s > 0 ? '+' : '-'} ${t} = ${L.decTex(r.plus)}`), prod: $q(L.productTex(r.x, r.k)),
      plusVal: $q(L.decTex(r.plus)), yVal: $q(L.decTex(r.y)),
    };
    return {
      id: 'addWhy', kind: 'choice',
      prompt: Mx(k, 'addWhy.prompt', o),
      options: [
        { text: Mx(k, 'addWhy.small'), why: Mx(k, 'addWhy.whySmall', o) },
        { text: Mx(k, 'addWhy.right', o), correct: true },
        { text: Mx(k, 'addWhy.wrongBar'), why: Mx(k, 'addWhy.whyBar', o) },
      ],
      hints: [Mx(k, 'addWhy.hint1', o), Mx(k, 'addWhy.hint2', o)],
      explain: Mx(k, 'addWhy.explain', o),
    };
  },
  /* ── chain : le réservoir ── */
  volume: (lab, env) => {
    const { k, unit, changes } = env;
    const vol = L.current(lab, lab.target);
    const lines = L.chainLinesTex(lab, lab.target);
    return {
      id: 'volume', kind: 'number', expected: L.dec(vol), answer: <MathText>{$q(L.decTex(vol))}</MathText>,
      prompt: Mx(k, 'volume.prompt', { changes, unit }),
      hints: [Mx(k, 'volume.hint1'), Mx(k, 'volume.hint2', { line: $q(lines[0]) })],
      explain: Mx(k, 'volume.explain', { lines: $q(lines.join(' \\quad ')), vol: L.dec(vol), unit }),
    };
  },
  sum: (lab, env) => {
    const { k, unit } = env;
    const [s1, s2] = lab.target;
    const sum = LIN.frac(lab.target.reduce((t, v) => t + v, 0));
    const sumK = LIN.add(LIN.frac(1), LIN.div(sum, LIN.frac(100)));
    const v1 = LIN.mul(lab.start, L.multiplier(s1));
    const real = L.current(lab, lab.target);
    const o = {
      sum: $q(L.pctTex(sum)), betted: L.dec(LIN.mul(lab.start, sumK)), real: L.dec(real), unit, start: L.dec(lab.start),
      v1: L.dec(v1), t2: Math.abs(s2), partNew: L.dec(partOf(v1, s2)), partOld: L.dec(partOf(lab.start, s2)),
      kline: $q(L.chainKTex(lab.target)),
    };
    return {
      id: 'sum', kind: 'choice',
      prompt: Mx(k, 'sum.prompt', o),
      options: [
        { text: Mx(k, 'sum.first'), why: Mx(k, 'sum.whyFirst', o) },
        { text: Mx(k, 'sum.cancel'), why: Mx(k, 'sum.whyCancel', o) },
        { text: Mx(k, 'sum.right'), correct: true },
      ],
      hints: [Mx(k, 'sum.hint1', o), Mx(k, 'sum.hint2', o)],
      explain: Mx(k, 'sum.explain', o),
    };
  },
  back: (lab, env) => {
    const { k, unit, change } = env;
    const c = L.contrastChain(lab);
    const vol = L.current(lab, c.steps);
    const lines = L.chainLinesTex(lab, c.steps);
    return {
      id: 'back', kind: 'number', expected: L.dec(vol), answer: <MathText>{$q(L.decTex(vol))}</MathText>,
      prompt: Mx(k, 'back.prompt', { changes: c.steps.map(change).join(` ${k('then')} `), unit }),
      hints: [Mx(k, 'back.hint1', { start: L.dec(lab.start) }), Mx(k, 'back.hint2', { line: $q(lines[0]) })],
      explain: Mx(k, 'back.explain', { lines: $q(lines.join(' \\quad ')), vol: L.dec(vol), unit }),
    };
  },
  return: (lab, env) => {
    const { k, unit } = env;
    const c = L.contrastChain(lab);
    const lines = L.chainLinesTex(lab, c.steps);
    const o = {
      start: L.dec(lab.start), unit, vol: L.dec(L.current(lab, c.steps)), t: Math.abs(c.steps[0]),
      line: $q(lines.join(' \\quad ')), kline: $q(L.chainKTex(c.steps)),
    };
    return {
      id: 'return', kind: 'choice',
      prompt: Mx(k, 'return.prompt', o),
      options: [
        { text: Mx(k, 'return.cancel'), why: Mx(k, 'return.whyCancel', o) },
        { text: Mx(k, 'return.bigger'), why: Mx(k, 'return.whyBigger', o) },
        { text: Mx(k, 'return.right'), correct: true },
      ],
      hints: [Mx(k, 'return.hint1', o), Mx(k, 'return.hint2')],
      explain: Mx(k, 'return.explain', o),
    };
  },
  /* ── la règle (l'ancienne découverte) ── */
  rule: (lab, env) => {
    const { k, discoveryOptions, discoveryPrompt, formal } = env;
    const single = lab.mode === 'single';
    const s0 = lab.target[0];
    const r = L.reading(lab, s0, lab.articles[0].id);
    return {
      id: 'rule', kind: 'choice',
      prompt: discoveryPrompt,
      options: discoveryOptions,
      hints: single
        ? [Mx(k, 'rule.hint1Single'), Mx(k, 'rule.hint2Single', { k: $q(L.decTex(r.k)) })]
        : [Mx(k, 'rule.hint1Chain'), Mx(k, 'rule.hint2Chain')],
      explain: formal,
    };
  },
};
