import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, CheckCircle2, XCircle, ArrowLeft, Link2, PackageOpen, ChevronLeft, Sparkles, Minus, Plus, ArrowRight } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { RANK_NAMES, spaced, classWordsOf, digitsByRank, toArabicWords } from '@smarter-academy/core/arithmetic/placeValue.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import LabFold from '../primitives/LabFold';
import DragGhost from '../primitives/DragGhost';
import KidFigure from '../primitives/KidFigure';
import { LabCard, StageFrame, PromptCard, ChoiceTray, ChoiceCard, VerdictBanner } from '../primitives/LabKit';
import { SvgPill } from '../primitives/SvgPill';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/rankExchange';

/**
 * rank-exchange — L'ÉCHANGE DIX POUR UN (1AM, unité 1 « الأعداد الطبيعية والأعداد العشرية », درس « كتابة الأعداد
 * الطبيعية ودلالة الأرقام », manuel نشاط 1 p. 9, معارف 1 p. 11 et 4 (a) p. 13, تمرين 2 p. 17). La logique, entière et
 * exacte, est dans `logic/rankExchange.js` (core/arithmetic/placeValue.js, importé par chemin).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. La main déplace des QUANTITÉS ENTRE LES RANGS : elle balaie 10 objets d'une colonne (chacun se soulève et prend
 *    son numéro 1, 2, 3…), les LIE en un objet du rang suivant et le PORTE dans la colonne de gauche (glisser,
 *    toucher-toucher, clavier ←) ; ou elle OUVRE un objet en 10 du rang de droite (le glisser d'une colonne vers la
 *    droite, ou « فتح »). متقدم ajoute « +1 / −1 » et les ± de la dictée.
 * B. Dix d'un rang font UN du rang à sa gauche : le chiffre d'un rang est ce qui y RESTE quand tout est emballé ; un
 *    rang vide garde sa place par un 0 ; « رقم العشرات » (ce qui reste) ≠ « عدد العشرات » (toutes les dizaines).
 * C. Une colonne qui tient 10 objets ou plus ne s'écrit pas : sa case déborde (deux chiffres serrés, rose, une
 *    secousse) et le nombre écrit disparaît ; la prédiction est jugée par le tableau lui-même ; le compteur de
 *    paquets monte pendant le déballage (1 → 201).
 * D. Le « جدول المراتب » de 2017 et les paires رقم / عدد, `2017 = 2 × 1000 + 1 × 10 + 7` ; à متقدم le tableau des
 *    classes de 4 908 732, sa lecture par classes et son مفكوك.
 * E. Toutes les tâches du niveau faites. Les conjectures fausses sont réfutées par SES tableaux (1 · 13 · 24 · 37 côte à
 *    côte = 1 132 437, le tableau dit 2 577 ; 2017 a 1 pour chiffre des dizaines, il a envoyé 201 paquets ; sans le 0,
 *    7065 se lit 765).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        la numération de position : 10 d'un rang = 1 du rang de gauche ; le chiffre = ce qui reste
 *   OBJECT         l'atelier d'emballage (crayon, paquet de 10, boîte de 100, carton de 1000) ; des jetons de rang ;
 *                  des pièces et billets génériques (jamais l'image d'un vrai billet)
 *   VARIABLE       combien d'objets d'un rang sont liés (balayage) ; combien sont ouverts ; ± un objet
 *   INVARIANT      la valeur du tableau sous tout lien, port et ouverture (testé)
 *   TRANSFORMATION lier 10 → 1 et porter à gauche ; ouvrir 1 → 10 à droite
 *   CONSTRAINT     un paquet a 10 objets ; il va dans la colonne du rang suivant, pas une autre
 *   RESISTANCE     `short-pack` (7 crayons retombent), `wrong-column` (le paquet revient), `overflow` (la case
 *                  déborde, « تحقّق » refusé), `no-unit` (1000 − 1 : rien à retirer), `wrong-board` (765 lu tout haut)
 *   EVIDENCE       les cases de chiffre, le nombre écrit (seulement quand tout s'écrit), le compteur de paquets
 *   CONTRAST       1 · 13 · 24 · 37 ≠ 1 132 437 ; chiffre 1 / nombre 201 ; 999 + 1 (cascade) / 999 − 1 (un geste)
 *                  / 1000 − 1 (ouvrir) ; 7065 / 765
 *   PREDICTION     une carte choisie AVANT le premier geste (pack, unpack), jugée par le tableau à la fin
 *   DISCOVERY      « ماذا يعني رقم مرتبة في كتابة عدد؟ » ; « لماذا نكتب 0 في 7065؟ »
 *   FORMALIZATION  le جدول المراتب, رقم / عدد par rang, le مفكوك ; les classes et leur lecture
 *   TRANSFER       تمرين 2 (1345 DA en billets de 100, `money`, levels={false}), les تمارين et la banque
 *
 * « جرّب كل الإمكانيات » (§6bis) : NON — chaque lien, chaque ouverture EST l'expérience de l'élève. « افتح الكل »
 * (choix de l'auteur, comme « أكمل » de digit-cards) n'apparaît qu'après deux ouvertures À LA MAIN dans une colonne :
 * 20 boîtes à ouvrir une par une sur un téléphone est une corvée, pas une découverte.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-rx-glance]` enveloppe la consigne (`PromptCard` : la puce, la question de la tâche,
 * les cartes de prédiction, les étapes, le compteur), la scène (`StageFrame` : le tableau en colonnes, rang le plus
 * haut À GAUCHE — un îlot LTR —, les cases de chiffre, le nombre écrit, les ±) et le verdict. Large (≥ 600 px) : une
 * colonne à côté porte l'emballeuse `KidFigure` (crayons), le GRAND nombre écrit et le verdict ; étroit : le verdict
 * sous la scène garde sa place. La hauteur des colonnes vient de l'écran de leçon (`useLessonViewport`) moins ce qui
 * entoure ; 7 colonnes de ≥ 40 px à 320 px (le bloc déborde sur les cadres jusqu'à la gouttière, `data-bleed`).
 *
 * ONBOARDING (obligatoire pour tout labo, 2026-10-14) : la prop `coach` (défaut true ; `false` l'éteint) active `LabCoach` — à chaque instant un anneau + une bulle
 * d'une phrase montrent le bouton ou le geste attendu (`logic/rankExchange.js › coachOf`, pure et testée : suivre le guide
 * à la lettre termine chaque tâche), masquable (« فهمت », « إيقاف الإرشاد », Échap, l'interrupteur sous la consigne).
 *
 * QUESTIONS PENDANT LE LABO (prototype de `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Après
 * CHAQUE tâche, une suite de questions sur ce que l'élève vient de FAIRE se pose par-dessus le labo et retient « المهمة التالية » (`CHAINS`) :
 * pack ce qui reste · la valeur d'un chiffre · pourquoi lier ; unpack le compteur · رقم ≠ عدد · le 0 · LA RÈGLE (l'ancienne découverte `rank`) ;
 * next / previous / borrow la valeur · les liens ou les ouvertures ; dictation le 0 · les classes · LA RÈGLE (`zero`). La suite qui finit par
 * la règle formalise (`onDone`). Obligatoires pour tout élève ; l'enseignant seul les coupe pour SON compte (`useLabCheckpointSettings`).
 * SEULEMENT LES ÉTAPES (L9) : questions actives → `guided` (ni « جرّب › اكتشف › صِغ القاعدة » ni « تلميح ») ; coupées → les deux reviennent.
 * ÉTAPES : `LabStepper` (`[data-rx-step=<i>]`) et la fête `useStepCelebration` par tâche. « إعادة » repart de la tâche 1 ; « أعِد التجربة »
 * (la carte) remet LA MÊME tâche (`L.retryTask`). SON (`playSfx`) : `tooth` pour un geste (porter, ouvrir, ±, plus grave en arrière), `bell`
 * pour dix liés en un (ou un nombre dicté juste), `flag` quand la tâche est faite, `over` pour un refus.
 * Props (contrat fixé avec la leçon) : `world` ('pencils' | 'tokens' | 'money'), `tasks`, `start`, `n`, `rank`, `next`,
 * `borrow`, `dictation`, `level`, `levels`, `coach`, `title`, `lead`, `onTrial({ task, kind, rank, ok, counts, value })`,
 * `onFinished({ tasks })` — à la règle, ou (sans découverte : `money`) quand la tâche est faite ; tous par `state.report`.
 *
 * CONTRAT DOM : [data-rank-exchange][data-world][data-task][data-solved][data-layout], [data-rx-glance][data-bleed],
 * [data-rx-col=<k>][data-count], [data-rx-item=<k>-<i>][data-lifted], [data-rx-digit=<k>], [data-rx-digit-caption], [data-rx-predict-ask], [data-rx-context]
 * [data-overflow], [data-rx-written], [data-rx-tray], [data-rx-carry], [data-rx-tie=<k>], [data-rx-open=<k>],
 * [data-rx-open-all=<k>], [data-rx-grab=<k>], [data-rx-predict=<value>][data-state], [data-rx-counter],
 * [data-rx-verdict=<kind>], [data-rx-refused=<kind>], [data-rx-words], [data-rx-check], [data-rx-next],
 * [data-rx-plusminus=<k>], [data-rx-step=<task>][data-done], [data-rx-result], [data-rx-formal], [data-rx-kid].
 */
const NS = 'manipulation.rankExchange';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const WIDE_MIN = 600;
const SIDE_W = 232;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const MOTION_CSS = '@keyframes rx-pop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}'
  + '@keyframes rx-snap{0%{transform:scale(1.25)}60%{transform:scale(.92)}100%{transform:scale(1)}}'
  + '.rx-pop{transform-box:fill-box;transform-origin:50% 100%;animation:rx-pop .28s cubic-bezier(.34,1.56,.64,1) both}'
  + '.rx-snap{animation:rx-snap .32s ease-out both}'
  + '.rx-lift{transition:transform .12s ease-out}'
  + '@media (prefers-reduced-motion: reduce){.rx-pop,.rx-snap{animation:none}.rx-lift{transition:none}}';

const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Une formule (« 2017 = 201 × 10 + 7 ») : UN îlot LTR dont les morceaux (« = … », « + … ») sont insécables ; à l'étroit
 * elle passe à la ligne entre deux morceaux, de gauche à droite, sans jamais se réordonner (idiome de division-jumps).
 */
function Formula({ text, className = '', ...rest }) {
  return (
    <bdi dir="ltr" className={`inline-flex flex-wrap justify-center gap-x-1.5 font-mono ${className}`} {...rest}>
      {String(text).split(/ (?=[=+] )/).map((p, i) => <span key={i} className="whitespace-nowrap">{p}</span>)}
    </bdi>
  );
}

/** Les nombres de départ : ceux de la leçon, sinon le niveau dont le MONDE correspond (références du niveau réutilisées). */
export function numbersFor({ world, tasks, start, n, rank, next, borrow, dictation, level }) {
  const pair = LEVELS['rank-exchange'];
  const asked = pair[resolveLevelId(level ?? 'beginner')].numbers;
  const w = world ?? asked.world;
  const preset = asked.world === w ? asked : Object.values(pair).map((p) => p.numbers).find((x) => x.world === w) ?? null;
  const keep = (v, p) => (v == null ? p : sameJson(v, p) ? p : v);
  if (!preset) {
    // `money` (تمرين 2) : une seule tâche, posée par la leçon
    return { world: w, tasks: tasks ?? ['unpack'], n: n ?? 1345, rank: rank ?? 2 };
  }
  const out = { world: w, tasks: keep(tasks, preset.tasks) };
  for (const [key, v] of Object.entries({ start, n, rank, next, borrow, dictation })) {
    const p = preset[key];
    if (v != null || p !== undefined) out[key] = keep(v, p);
  }
  for (const key of Object.keys(out)) if (out[key] === undefined) delete out[key];
  return out;
}

/** La découverte d'une suite de tâches : « رقم المرتبة » (pack + unpack), « الصفر » (dictée), aucune (money seul). */
export const discoveryKindOf = (tasks) => (tasks.includes('pack') && tasks.includes('unpack') ? 'rank' : tasks.includes('dictation') ? 'zero' : null);

export default function RankExchange({
  world, tasks, start, n, rank, next, borrow, dictation, title, lead, level, levels: withLevels = true, coach = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ world, tasks, start, n, rank, next, borrow, dictation, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'rank-exchange', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  const numsKey = JSON.stringify(nums);
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: 0 });
  if (scene.key !== numsKey || scene.epoch !== state.epoch) {
    // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — la tâche 1, les essais et les questions du labo
    setScene({ key: numsKey, epoch: state.epoch, rc: state.resetCount, inits: scene.inits + 1 });
    setLab(L.init(nums));
  }
  const W0 = lab.world;
  const task = L.taskOf(lab);
  const dk = discoveryKindOf(lab.tasks);
  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite de la tâche courante ; celle qui finit par la règle remplace la découverte automatique
  const cpSettings = useLabCheckpointSettings('rank-exchange');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpChains = cpOn && cpSettings.enabled ? chainsOf(lab, dk) : null;
  const chain = cpChains?.[task] ?? null;
  const ruleByCheckpoint = !!cpChains && Object.values(cpChains).some((c) => c.includes('rule'));
  const cpNames = useMemo(() => namesFor(W0, k), [W0, k]);
  const cp = useLabCheckpoint({
    id: chain ? task : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, task, k, cpNames, dk)) : null,
    reached: L.taskDone(lab),
    resetKey: scene.inits,
    onRetry: () => setLab(L.retryTask),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (cpChains?.[id]?.includes('rule')) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && dk && !ruleByCheckpoint) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du geste (muet sans « الصوت ») : un geste, dix liés, la tâche faite, un refus
  const lastSeen = useRef(lab.last);
  useEffect(() => {
    const v = lab.last;
    if (v === lastSeen.current) return;
    lastSeen.current = v;
    if (!v) return;
    if (v.type === 'refused') playSfx('over');
    else if (v.type === 'done' || (v.type === 'answer' && v.finished)) playSfx('flag');
    else if (v.type === 'tie' || v.type === 'answer') playSfx('bell');
    else playSfx('tooth', { pitch: v.type === 'remove' || v.type === 'open' ? 0.75 : 1 });
  }, [lab.last]);
  useEffect(() => { if (state.isFormal) state.report(onFinished, { tasks: [...lab.tasks] }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const finishedOnce = useRef(false);
  useEffect(() => {
    if (!ready) { finishedOnce.current = false; return; }
    if (!dk && !finishedOnce.current) { finishedOnce.current = true; state.report(onFinished, { tasks: [...lab.tasks] }); }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  // chaque geste jugé est rapporté UNE fois, même si deux gestes tombent dans le même rendu
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, L.trialEvidence(lab.trials[i]));
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur, place jusqu'à la gouttière, ce qui entoure les colonnes ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const bodyHRef = useRef(0);
  const [width, setWidth] = useState(320);
  const [room, setRoom] = useState(0);
  const [overhead, setOverhead] = useState(330);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      const r = el.getBoundingClientRect();
      if (typeof window !== 'undefined') setRoom(Math.max(0, Math.floor(Math.min(r.left, window.innerWidth - r.right) - 16)));
      if (glanceRef.current) setOverhead(Math.max(160, Math.ceil(glanceRef.current.getBoundingClientRect().height) - bodyHRef.current));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (glanceRef.current) ro.observe(glanceRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 700;

  /* ── les noms comptés (ARABIC_RTL_CONTRACT « Counting nouns ») ── */
  const names = useMemo(() => namesFor(W0, k), [W0, k]);

  /* ── la découverte et la règle ── */
  const discovery = dk && (
    <ManipulationDiscovery state={state} prompt={discoveryPrompt(lab, dk, k)} options={discoveryOptions(lab, dk, k, names)} formal={<Formal lab={lab} dk={dk} k={k} names={names} />} />
  );

  return (
    <ManipulationShell
      type="rank-exchange"
      title={title ?? k(`title.${W0}`)}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      guided={!!chain || ruleByCheckpoint}
      headerAction={cpOn ? cpSettings.control : null}
      hints={[0, 1, 2].map((i) => k(`hints.${hintKey(task, W0)}.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={discovery || undefined}
      explanation={k('explanation')}
    >
      <ManipulationStage className="bg-gradient-to-b from-indigo-50/40 to-white">
        <div ref={boxRef} className="space-y-2" data-rank-exchange data-world={W0} data-task={task}
          data-solved={ready ? 'true' : 'false'} data-layout={width >= WIDE_MIN ? 'wide' : 'narrow'}>
          <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
          <Lab lab={lab} setLab={setLab} k={k} names={names} width={width} room={room} screenH={screenH} overhead={overhead}
            glanceRef={glanceRef} bodyHRef={bodyHRef} lead={state.isAuthoredLevel ? lead : null} coach={coach} cp={cp} />
          {lab.trials.length > 0 && (
            <LabFold id="rank-exchange.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-rx-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => (
                  <li key={i} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'} data-ok={String(tr.ok)}>{trialText(tr, k, names)}</li>
                ))}
              </ul>
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

const hintKey = (task, world) => (task === 'unpack' && world === 'money' ? 'unpackMoney' : task);

/* ══════════════ Les noms d'un monde ══════════════ */

/**
 * Pour chaque rang : `count(n)` (le nom compté), `the` (défini singulier : « الحزمة »), `one` (indéfini : « حزمة »),
 * `col` (la colonne : « الحزم »), `head` / `sub` (l'en-tête de colonne, deux lignes).
 */
function namesFor(world, k) {
  const out = [];
  for (let r = 0; r < L.columnsOf(world); r += 1) {
    const v = spaced(10 ** r);
    if (world === 'pencils') {
      out.push({
        count: (c) => k(`noun.pencils.r${r}`, { count: c }), the: k(`the.pencils.${r}`), one: k(`one.pencils.${r}`), col: k(`col.pencils.${r}`),
        head: k(`head.pencils.${r}`), sub: v,
      });
    } else if (world === 'money') {
      const kind = r >= 2 ? 'note' : 'coin';
      out.push({
        count: (c) => k(`noun.money.${kind}`, { count: c, v: iso(v) }), the: k(`the.money.${kind}`, { v: iso(v) }), one: k(`one.money.${kind}`, { v: iso(v) }),
        col: k(`col.money.${kind}`, { v: iso(v) }), head: k(`head.money.${kind}`), sub: k('dinar', { v: iso(v) }),
      });
    } else {
      out.push({
        count: (c) => k('noun.tokens', { count: c, v: iso(v) }), the: k('the.tokens', { v: iso(v) }), one: k('one.tokens', { v: iso(v) }),
        col: RANK_NAMES[r], head: RANK_NAMES[r], sub: v,
      });
    }
  }
  return out;
}

/** « صندوق واحد و13 علبة و24 حزمة و37 قلمًا » : les quantités non nulles, du rang le plus haut au plus bas. */
function haveList(counts, names, k) {
  const parts = Object.keys(counts ?? {}).map(Number).filter((r) => counts[r] > 0 && names[r]).sort((a, b) => b - a)
    .map((r) => names[r].count(counts[r]));
  return parts.join(k('and'));
}

function trialText(tr, k, names) {
  const word = k(tr.ok ? 'ok' : 'notOk');
  const value = iso(spaced(tr.value));
  const nm = tr.rank != null ? names[tr.rank] : null;
  if (tr.kind === 'predict') return k('trial.predict', { p: iso(spaced(tr.predict)), value: iso(spaced(tr.actual ?? tr.value)), word });
  if (tr.kind === 'answer') return k('trial.answer', { value, word });
  if (tr.refused) return k('trial.refused', { what: k(`refusedName.${tr.refused}`), word });
  if (tr.kind === 'pack') return k('trial.pack', { from: nm.count(10), to: names[tr.rank + 1]?.one ?? '', word });
  if (tr.kind === 'unpack') return k('trial.unpack', { obj: nm.count(tr.n ?? 1), word });
  return k(`trial.${tr.kind}`, { col: nm?.col ?? '', value, word });
}

/* ══════════════ Le laboratoire (consigne, scène, verdict) ══════════════ */

function Lab({ lab, setLab, k, names, width, room, screenH, overhead, glanceRef, bodyHRef, lead, coach: coachOn, cp }) {
  const world = lab.world;
  const task = L.taskOf(lab);
  const cols = lab.columns;
  const wide = width >= WIDE_MIN;
  // TÉLÉPHONE : 7 colonnes de 40 px = 280 px ; le bloc déborde symétriquement sur les cadres jusqu'à la gouttière
  const need = cols * 40;
  const bleed = !wide && width < need + 12 ? Math.min(room, Math.ceil((need + 12 - width) / 2)) : 0;
  const inner = width + 2 * bleed;
  const narrow = inner < 420;
  const tiny = inner < 300;
  const boardW = wide ? width - SIDE_W - 12 : inner;
  const pad = boardW - 12 >= need ? 6 : 0;
  const colW = Math.floor((boardW - 2 * pad - 2) / cols);
  const bodyH = Math.round(Math.max(wide ? 150 : 104, Math.min(wide ? 250 : 200, screenH - overhead - 40)));
  bodyHRef.current = bodyH;
  // UNE taille d'objet pour tout le tableau (la plus petite dont une colonne a besoin, jamais sous 14 px) : des jetons de
  // tailles différentes d'une colonne à l'autre se liraient comme des valeurs différentes
  // (les grandes piles — 201 paquets — ne comptent pas : elles rapetissent seules)
  const sizeCap = Math.max(14, Math.min(narrow ? 30 : 40, ...Array.from({ length: cols }, (_, r) => r).filter((r) => lab.counts[r] <= 20).map((r) => L.columnLayout({
    count: lab.counts[r], width: colW, height: bodyH, aspect: L.aspectOf(world, r), maxSize: narrow ? 30 : 40, minSize: 10, minPitch: L.pitchOf(world, r),
  }).size)));

  const [picked, setPicked] = useState(null); // { rank, items: [i…] } — les objets soulevés (balayage ou toucher)
  const [focusCol, setFocusCol] = useState(0);
  const sweep = useRef(null);
  useEffect(() => { setPicked(null); }, [lab.counts, task]);
  useEffect(() => { setFocusCol(0); }, [task, lab.di]);

  const drag = useDragInteraction({
    accepts: (src, zone) => {
      const to = Number(zone.slice(4));
      if (src === 'tray') return lab.tray && to === lab.tray.to ? true : 'wrong-column';
      if (src.startsWith('item:')) {
        const r = Number(src.slice(5));
        if (to === r) return '';
        return to === r - 1 ? true : 'wrong-column';
      }
      return '';
    },
    onDrop: (src, zone) => {
      const to = Number(zone.slice(4));
      if (src === 'tray') setLab((s) => L.carry(s, to));
      else setLab((s) => L.open(s, Number(src.slice(5))));
    },
    onReject: (src, zone, reason) => {
      if (reason !== 'wrong-column') return;
      const to = Number(zone.slice(4));
      if (src === 'tray') setLab((s) => L.carry(s, to));
      else { const r = Number(src.slice(5)); setLab((s) => L.refuseMove(s, r, to, r - 1)); }
    },
  });

  /* ── le balayage : chaque objet traversé se soulève et prend son numéro ; 10 au relâchement = un paquet ── */
  const itemAt = (x, y, r) => {
    if (typeof document === 'undefined') return null;
    const el = document.elementFromPoint(x, y)?.closest?.('[data-rx-item]');
    if (!el) return null;
    const [kk, ii] = el.getAttribute('data-rx-item').split('-').map(Number);
    return kk === r ? ii : null;
  };
  const tieNow = (r, count) => setLab((s) => L.tie(s, r, count));
  const sweepProps = (r) => {
    if (!L.allows(lab, 'tie', r) || drag.held) return {};
    return {
      onPointerDown: (e) => {
        if (e.button > 0) return;
        const i = itemAt(e.clientX, e.clientY, r);
        if (i == null) return;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        const base = picked?.rank === r ? picked.items : [];
        sweep.current = { r, x: e.clientX, y: e.clientY, moved: false, first: i, items: base.includes(i) ? base : [...base, i].slice(0, 10) };
        setPicked({ rank: r, items: sweep.current.items });
      },
      onPointerMove: (e) => {
        const sw = sweep.current;
        if (!sw || sw.r !== r) return;
        if (!sw.moved && Math.hypot(e.clientX - sw.x, e.clientY - sw.y) > 6) sw.moved = true;
        const i = itemAt(e.clientX, e.clientY, r);
        if (i != null && !sw.items.includes(i) && sw.items.length < 10) {
          sw.items = [...sw.items, i];
          setPicked({ rank: r, items: sw.items });
        }
      },
      onPointerUp: () => {
        const sw = sweep.current;
        sweep.current = null;
        if (!sw || sw.r !== r) return;
        if (sw.moved || sw.items.length >= 10) {
          setPicked(null);
          tieNow(r, sw.items.length);
          return;
        }
        // un TOUCHER : l'objet se soulève (ou retombe) ; les touchers s'additionnent jusqu'à 10
        const base = picked?.rank === r ? picked.items : [];
        const items = base.includes(sw.first) ? base.filter((x) => x !== sw.first) : [...base, sw.first];
        setPicked(items.length ? { rank: r, items } : null);
      },
      onPointerCancel: () => { sweep.current = null; },
      style: { touchAction: 'none' },
    };
  };

  /* ── les tâches et la consigne ── */
  const nm = names;
  // l'onboarding : la prochaine action attendue, dite en UNE phrase (désactivé : aucun pas, aucun rendu)
  const coachStep = coachOn && !cp.open ? L.coachOf(lab, { focusCol }) : null;
  const coach = useLabCoach({
    lab: 'rank-exchange', step: coachStep, text: coachText(coachStep, lab, k, nm),
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });
  const cfg = lab.cfg;
  const done = L.taskDone(lab);
  const predicting = L.needsPrediction(lab);
  const cards = L.cardsOf(lab);
  const target = L.targetOf(lab);
  const promptO = {
    words: toArabicWords(task === 'dictation' ? target ?? 0 : task === 'borrow' ? cfg.borrow : cfg.next),
    one: nm[cfg.rank]?.one ?? '', ones: nm[0]?.count(0) ?? '',
  };
  // §17.9 : le CONTEXTE (les nombres de départ, jamais le tableau vivant) puis UNE question qui nomme l'état final
  const have = haveList(task === 'pack' ? cfg.start : digitsByRank(cfg.n ?? 0), nm, k);
  const sub = task === 'pack' ? (world === 'pencils' ? 'pencils' : 'other') : world;
  const context = lead ?? (task === 'pack' || task === 'unpack' ? k(`context.${task}.${sub}`, { have }) : k(`context.${task}`, promptO));
  const promptTitle = task === 'pack' || task === 'unpack' ? k(`question.${task}.${sub}`, promptO) : k(`question.${task}`, promptO);
  // une étape est FAITE quand la tâche est finie ET que ses questions (LabCheckpoint) sont répondues : la pastille passe au vert et on fête
  const stepDone = lab.tasks.map((tk, i) => !!lab.done[tk] && (i !== lab.ti || !cp.blocking));
  const steps = lab.tasks.length > 1 && (
    <LabStepper count={lab.tasks.length} current={lab.ti} done={stepDone} stepAttr="data-rx-step" />
  );
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // L.init (« إعادة », autre niveau) : on refête
  const nowDone = stepDone[lab.ti];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(lab.ti)) return;
    celebrated.current.add(lab.ti);
    party.celebrate({ n: lab.ti + 1, total: lab.tasks.length });
  }, [nowDone, lab.ti]); // eslint-disable-line react-hooks/exhaustive-deps
  const result = lab.results[task];
  const predictPill = !predicting && lab.predict != null && (
    <span data-rx-predict={lab.predict} data-state={!done ? 'chosen' : result?.ok ? 'right' : 'tried'}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-2.5 py-0.5 text-xs font-bold ${!done ? 'border-indigo-200 bg-white text-indigo-900' : result?.ok ? 'border-emerald-400 bg-emerald-500 text-white rx-snap' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
      {k('predicted')}
      <bdi dir="ltr" className={`text-sm font-black tabular-nums ${done && !result?.ok ? 'line-through decoration-2' : ''}`}>{spaced(lab.predict)}</bdi>
      {done && (result?.ok ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <XCircle className="h-3.5 w-3.5" aria-hidden="true" />)}
    </span>
  );
  const counter = task === 'unpack' && !predicting && !done && (
    <span data-rx-counter={lab.counts[cfg.rank]}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-950">
      {k('counter', { col: nm[cfg.rank].col })}
      <bdi dir="ltr" key={lab.counts[cfg.rank]} className="rx-snap inline-block text-base font-black tabular-nums">{lab.counts[cfg.rank]}</bdi>
    </span>
  );
  const prompt = (
    <PromptCard size={narrow ? 'md' : 'lg'}
      aside={!predicting && (steps || predictPill || counter) ? <div className="flex flex-wrap items-center gap-1.5">{steps}{predictPill}{counter}</div> : null}
      context={task === 'dictation' && !lead ? <span>{k('context.dictation')} <span className="font-black text-indigo-700" data-rx-words={target}>«&nbsp;{promptO.words}&nbsp;»</span></span> : context}
      contextProps={{ 'data-rx-context': task, ...(tiny ? { className: 'text-[13.5px] font-semibold leading-snug text-slate-700' } : {}) }}
      title={promptTitle}
      titleClassName={narrow ? (tiny || task === 'dictation' ? 'text-[15px]' : 'text-lg') : 'text-xl'}
      lamp={tiny ? null : done ? 'on' : 'off'}
      titleProps={{ 'data-rx-prompt': task }}>
      {/* §17.9 : les cartes de prédiction sous LEUR question (les jalons sur la même rangée) */}
      {predicting && (
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <p className={`font-extrabold text-indigo-900 ${tiny ? 'text-[13px]' : narrow ? 'text-sm' : 'text-base'}`} data-rx-predict-ask>{k(`predictAsk.${task}.${sub}`, promptO)}</p>
          {!tiny && steps}
        </div>
      )}
      {predicting && (
        <ChoiceTray cols={3} data-rx-cards>
          {cards.map((c) => (
            <ChoiceCard key={c} ltr size={tiny ? 'sm' : narrow ? 'md' : 'lg'} className={tiny ? '!px-0.5 !text-[12.5px] tracking-tight' : ''} onClick={() => setLab((s) => L.choose(s, c))}
              data-rx-predict={c} data-state="idle" aria-label={k('predictAria', { v: spaced(c) })}>
              {spaced(c)}
            </ChoiceCard>
          ))}
        </ChoiceTray>
      )}
    </PromptCard>
  );

  /* ── la scène : le tableau des rangs ── */
  const lifted = (r) => (picked?.rank === r ? picked.items : []);
  const board = (
    <div dir="ltr" className="relative" data-rx-board>
      {world === 'tokens' && <ClassBar cols={cols} colW={colW} k={k} tiny={tiny} />}
      <div className="flex overflow-hidden rounded-2xl border-2 border-indigo-200 bg-white" style={{ width: colW * cols + 4 }}>
        {Array.from({ length: cols }, (_, j) => {
          const r = cols - 1 - j; // le rang le plus haut À GAUCHE
          return (
            <Column key={r} r={r} lab={lab} setLab={setLab} k={k} nm={nm[r]} names={nm} colW={colW} bodyH={bodyH} sizeCap={sizeCap} tiny={tiny}
              drag={drag} sweepProps={sweepProps(r)} lifted={lifted(r)} focused={focusCol === r}
              onFocusCol={() => setFocusCol(r)} last={j === cols - 1} />
          );
        })}
      </div>
    </div>
  );

  // le nombre ÉCRIT : seulement quand chaque colonne s'écrit (rien d'autre ne l'annonce avant)
  const written = L.writtenOf(lab);
  const writtenPlate = (big) => (
    <div className={`flex items-center justify-center gap-2 rounded-2xl border-2 ${written ? 'border-indigo-200 bg-white' : 'border-dashed border-indigo-200 bg-white/50'} ${big ? 'min-h-[64px] px-3 py-2' : 'min-h-[48px] px-2 py-1'}`}>
      <span className={`${big ? 'text-sm' : 'text-xs'} font-black text-indigo-900/70`}>{k('writtenTitle')}</span>
      <bdi dir="ltr" key={written} className={`font-black tabular-nums tracking-wide text-indigo-950 ${written ? 'rx-snap inline-block' : ''} ${big ? 'text-4xl' : tiny ? 'text-2xl' : 'text-3xl'}`} data-rx-written>{written}</bdi>
      {!written && <span aria-hidden="true" className={`font-black text-indigo-200 ${big ? 'text-3xl' : 'text-2xl'}`}>…</span>}
    </div>
  );

  /* ── ± : la dictée (n'importe quel rang) ; +1 / −1 des tâches next / previous / borrow (les unités) ── */
  const pmRank = task === 'dictation' ? focusCol : 0;
  const showPm = ['next', 'previous', 'borrow', 'dictation'].includes(task);
  const canAdd = L.allows(lab, 'add', pmRank);
  const canRemove = task === 'dictation' ? L.allows(lab, 'remove', pmRank) && lab.counts[pmRank] > 0 : L.allows(lab, 'remove', pmRank);
  const pmBtn = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none';
  const stepper = showPm && (
    <div className="flex items-center gap-1.5 rounded-2xl border border-indigo-100 bg-white p-1" dir="ltr" data-rx-plusminus={pmRank}>
      <button type="button" onClick={() => setLab((s) => L.add(s, pmRank, -1))} disabled={!canRemove} aria-label={k('minusAria', { col: nm[pmRank].col })}
        data-rx-minus={pmRank} className={`${pmBtn} border-indigo-200 bg-white text-indigo-700 hover:border-indigo-400 ${ring}`}>
        <Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
      </button>
      <div className="flex min-w-0 flex-1 items-center justify-center rounded-xl bg-[#F5F6FF] py-1" data-rx-pm-count={lab.counts[pmRank]}>
        <bdi dir="ltr" key={lab.counts[pmRank]} className="rx-snap inline-block text-3xl font-black tabular-nums leading-none text-indigo-900">{lab.counts[pmRank]}</bdi>
      </div>
      <button type="button" onClick={() => setLab((s) => L.add(s, pmRank, 1))} disabled={!canAdd} aria-label={k('plusAria', { col: nm[pmRank].col })}
        data-rx-plus={pmRank} className={`${pmBtn} border-indigo-600 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_6px_14px_-8px_rgba(79,70,229,0.9)] ${ring}`}>
        <Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
      </button>
    </div>
  );
  const pmLabel = showPm && (
    <p className="text-center text-xs font-black text-indigo-900/70" aria-hidden="true">{k('pmTitle', { col: nm[pmRank].col })}</p>
  );
  const checkBtn = task === 'dictation' && !done && (
    <button type="button" onClick={() => setLab((s) => L.check(s))} disabled={!!lab.tray} data-rx-check
      className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-indigo-600 bg-gradient-to-b from-indigo-500 to-indigo-600 px-3 text-base font-black text-white shadow-[0_4px_0_0_#3730A3] transition-all duration-150 hover:brightness-110 active:translate-y-0.5 active:shadow-none disabled:opacity-50 motion-reduce:transition-none ${ring}`}>
      <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> {k('check')}
    </button>
  );

  /* ── le verdict : un seul bandeau, mis à jour sur place ── */
  const v = lab.last;
  const verdict = verdictOf(lab, v, k, nm);
  const tone = !v ? 'indigo' : v.type === 'refused' ? 'rose' : v.type === 'done' || v.type === 'answer' ? 'emerald' : 'indigo';
  const icon = !v ? Hand : v.type === 'refused' ? XCircle : v.type === 'done' || v.type === 'answer' ? CheckCircle2 : Sparkles;
  const openAllRank = Object.keys(lab.counts).map(Number).filter((r) => L.canOpenAll(lab, r)).sort((a, b) => b - a)[0];
  const actionBtn = 'inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border-2 px-3.5 text-sm font-black transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none';
  const banner = (
    <VerdictBanner tone={tone} icon={tiny ? null : icon} size={tiny ? 'xs' : 'sm'}
      className={`${tiny ? '!px-2.5 !py-1.5' : ''} ${wide ? 'min-h-[3.5rem]' : 'min-h-[4rem]'}`}
      data-rx-verdict={v ? (v.type === 'refused' ? 'refused' : v.type) : ''} data-rx-refused={v?.type === 'refused' ? v.refused : undefined}>
      <div className="space-y-1.5">
        {v?.type === 'done' && task === 'unpack' && <UnpackResult lab={lab} k={k} nm={nm} />}
        <p className={v ? '' : 'font-bold text-indigo-900'}>{verdict}</p>
        {(lab.tray || openAllRank != null || (done && !cp.blocking && lab.ti < lab.tasks.length - 1)) && (
          <div className="flex flex-wrap gap-2">
            {lab.tray && (
              <button type="button" onClick={() => setLab((s) => L.carry(s, s.tray.from + 1))} data-rx-carry
                className={`${actionBtn} border-indigo-600 bg-indigo-600 text-white shadow-[0_3px_0_0_#3730A3] ${ring}`}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {k('carry')}
              </button>
            )}
            {openAllRank != null && (
              <button type="button" onClick={() => setLab((s) => L.openAll(s, openAllRank))} data-rx-open-all={openAllRank}
                className={`${actionBtn} border-amber-300 bg-white text-amber-900 shadow-[0_3px_0_0_#FDE68A] ${ring}`}>
                <PackageOpen className="h-4 w-4" aria-hidden="true" /> {k('openAll', { obj: nm[openAllRank].count(lab.counts[openAllRank]) })}
              </button>
            )}
            {done && !cp.blocking && lab.ti < lab.tasks.length - 1 && (
              <button type="button" onClick={() => setLab(L.nextTask)} data-rx-next
                className={`${actionBtn} border-emerald-600 bg-emerald-600 text-white shadow-[0_3px_0_0_#047857] ${ring}`}>
                {k('nextTask')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
    </VerdictBanner>
  );

  const stage = (
    <StageFrame className={`min-w-0 ${wide ? 'flex-1' : ''} ${pad ? 'space-y-2 p-1.5' : 'space-y-2 p-0 !rounded-2xl !border-0'}`} data-rx-stage>
      <div className="flex justify-center">{board}</div>
      {/* §17.9 « pas d'ambiguïté » : la rangée de cases sous les colonnes dit ce qu'elle compte */}
      <p className={`px-1 text-center font-bold leading-snug text-indigo-900/70 ${narrow ? 'text-[11px]' : 'text-xs'}`} data-rx-digit-caption>{k('digitCaption')}</p>
      {!wide && writtenPlate(false)}
      {showPm && !wide && <div className="flex items-center gap-1.5 px-1 pb-1"><div className="min-w-0 flex-1">{stepper}</div>{checkBtn && <div className="w-[42%] shrink-0">{checkBtn}</div>}</div>}
    </StageFrame>
  );
  const kidMood = !v ? 'neutral' : v.type === 'refused' ? 'wonder' : v.type === 'done' ? 'proud' : 'happy';
  const side = wide && (
    <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>
      {world === 'pencils' && <Packer mood={kidMood} />}
      <LabCard className="space-y-2 p-3" data-rx-readout>
        {writtenPlate(true)}
        {showPm && <div className="space-y-1">{pmLabel}{stepper}</div>}
        {checkBtn}
      </LabCard>
      {banner}
    </div>
  );

  const margin = Math.max(0, (inner - width) / 2);
  return (
    <div ref={glanceRef} className={`relative space-y-2.5 ${margin > 0 ? 'z-[1] rounded-3xl bg-[#F7F7FF]' : ''}`}
      style={margin > 0 ? { marginInline: -margin } : undefined} data-rx-glance data-bleed={margin > 0 ? Math.round(margin) : undefined}>
      {party.node}
      {cp.node}
      {prompt}
      {coachOn && <div className="flex">{coach.toggle}</div>}
      {wide ? <div className="flex items-start gap-3">{stage}{side}</div> : <>{stage}{banner}</>}
      {coachOn && coach.overlay}
      <DragGhost ghost={drag.ghost}>
        {drag.held && (
          <svg width={52} height={52} viewBox="0 0 40 40" aria-hidden="true" className="rounded-xl bg-white/90">
            <FittedObject world={world} rank={drag.held === 'tray' ? lab.tray?.to ?? 1 : Number(String(drag.held).slice(5))} />
          </svg>
        )}
      </DragGhost>
    </div>
  );
}

/** L'astuce de l'onboarding : UNE phrase qui montre le bouton ou le geste (jamais la règle). */
function coachText(step, lab, k, nm) {
  if (!step) return '';
  const r = step.rank;
  switch (step.id) {
    case 'tie': return k('coach.tie', { ten: nm[r].count(10), obj: nm[r + 1]?.one ?? '' });
    case 'carry': return k('coach.carry', { col: nm[r].col });
    case 'open': return k('coach.open', { obj: nm[r].the });
    case 'plus': case 'minus': case 'pick': return k(`coach.${step.id}`, { col: nm[r].col });
    case 'predict': return k('coach.predict');
    case 'check': return k('coach.check');
    case 'next-task': return k('coach.nextTask');
    default: return '';
  }
}

/** Le texte du bandeau : la consigne du GESTE au repos (une ligne), sinon ce que le dernier geste a produit. */
function verdictOf(lab, v, k, nm) {
  const task = L.taskOf(lab);
  if (!v) {
    if (L.needsPrediction(lab)) return k('idle.predict');
    return k(`idle.${task}`);
  }
  const value = iso(spaced(L.valueOf(lab)));
  if (v.type === 'tie') return k('v.tie', { obj: nm[v.rank + 1].one });
  if (v.type === 'carry') return k(L.writable(lab) ? 'v.carryWritable' : 'v.carry', { obj: nm[v.to].the, col: nm[v.to].col });
  if (v.type === 'open') return k('v.open', { obj: nm[v.rank].the, ten: nm[v.rank - 1].count(10) });
  if (v.type === 'add' || v.type === 'remove') {
    if (L.writable(lab)) return k('v.board', { value });
    const r = Object.keys(lab.counts).map(Number).find((x) => lab.counts[x] > 9);
    return k('v.overflowNow', { col: nm[r].col, count: nm[r].count(lab.counts[r]) });
  }
  if (v.type === 'refused') {
    const r = v.rank;
    if (v.refused === 'short-pack') return k('v.short', { have: nm[r].count(v.n), one: nm[r + 1]?.one ?? '', ten: nm[r].count(10) });
    if (v.refused === 'wrong-column') {
      if (lab.tray || v.need === r + 1) return k('v.wrongColumn', { obj: nm[v.need].the, col: nm[v.need].col });
      return k('v.wrongOpen', { obj: nm[r].the, col: nm[v.need].col });
    }
    if (v.refused === 'no-unit') return k('v.noUnit', { col: nm[r].col });
    if (v.refused === 'overflow') return k('v.overflow', { col: nm[r].col, count: nm[r].count(v.count) });
    if (v.refused === 'wrong-board') return k('v.wrongBoard', { board: iso(spaced(v.board)), words: toArabicWords(v.board) });
  }
  if (v.type === 'answer') return k(v.finished ? 'v.answerLast' : 'v.answer', { value: iso(spaced(v.value)) });
  if (v.type === 'done') {
    if (task === 'pack') return k(v.ok ? 'v.packRight' : 'v.packWrong', { value: iso(spaced(v.value)), p: iso(spaced(v.predict)) });
    if (task === 'unpack') return k(v.ok ? 'v.unpackRight' : 'v.unpackWrong', { p: iso(spaced(v.predict)) });
    return k('v.reached', { value: iso(spaced(v.value)), words: toArabicWords(v.value) });
  }
  return '';
}

/** Après le déballage : `2017 = 201 × 10 + 7` et les deux pilules « رقم العشرات: 1 » / « عدد الحزم: 201 ». */
function UnpackResult({ lab, k, nm }) {
  const { n, rank } = lab.cfg;
  const res = lab.results.unpack;
  return (
    <div className="space-y-1" data-rx-result>
      <p className="flex justify-center"><Formula text={L.unpackLine(n, rank)} className="text-base font-black text-indigo-950" data-rx-line /></p>
      <p className="flex flex-wrap justify-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-black text-indigo-900 ring-1 ring-indigo-200" data-rx-pill="digit">
          {k('pill.digit', { rank: RANK_NAMES[rank] })} <bdi dir="ltr" className="text-base">{res.digit}</bdi>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-950 ring-1 ring-amber-300" data-rx-pill="count">
          {k('pill.count', { col: nm[rank].col })} <bdi dir="ltr" className="text-base">{res.count}</bdi>
        </span>
      </p>
    </div>
  );
}

/* ══════════════ Une colonne du tableau ══════════════ */

function Column({ r, lab, setLab, k, nm, names, colW, bodyH, sizeCap, drag, sweepProps, lifted, focused, onFocusCol, last }) {
  const world = lab.world;
  const count = lab.counts[r];
  const lay = L.columnLayout({ count, width: colW, height: bodyH, aspect: L.aspectOf(world, r), maxSize: sizeCap, minSize: 10, minPitch: L.pitchOf(world, r) });
  const overflow = count > 9;
  const zone = drag.zoneProps(`col:${r}`);
  const active = zone['data-drop-active'] === 'true';
  const invalid = zone['data-drop-invalid'] === 'true';
  const readyZone = zone['data-drop-ready'] === 'true';
  const task = L.taskOf(lab);
  const canTie = L.allows(lab, 'tie', r);
  const canOpen = L.allows(lab, 'open', r) && count > 0;
  const showTie = ['pack', 'next'].includes(task) && r < lab.columns - 1;
  const showOpen = ['unpack', 'borrow'].includes(task) && r >= 1 && (task !== 'unpack' || r > lab.cfg.rank);
  const isDict = task === 'dictation';
  const trayHere = lab.tray && lab.tray.from === r;
  const top = lay.positions.length - 1;
  const grab = canOpen && top >= 0 ? lay.positions[top] : null;
  const grabProps = drag.sourceProps(`item:${r}`);
  const trayProps = drag.sourceProps('tray');
  const tieBtn = showTie && canTie && count >= 10;
  const openBtn = showOpen && canOpen;
  const tone = BIN[world];
  return (
    <div {...zone} role="group" aria-label={k('colAria', { col: nm.col, count: nm.count(count) })}
      className={`relative flex flex-col ${last ? '' : 'border-r border-indigo-100'} ${active ? 'bg-indigo-50' : invalid ? 'bg-rose-50' : readyZone ? 'bg-indigo-50/50' : ''} ${focused && isDict ? 'z-[1] outline outline-[3px] -outline-offset-[3px] outline-indigo-500' : ''}`}
      style={{ width: colW }} data-rx-col={r} data-count={count}
      onClickCapture={isDict ? onFocusCol : undefined}>
      {/* l'en-tête : le nom du rang (arabe) et sa valeur (îlot LTR) */}
      <div className={`flex flex-col items-center justify-center gap-0.5 overflow-hidden border-b border-indigo-100 ${focused && isDict ? 'bg-indigo-100' : 'bg-[#F5F6FF]'} px-0.5 text-center ${colW < 72 && world === 'tokens' ? 'h-[52px]' : 'h-[44px]'}`} dir="rtl">
        <span className={`font-black leading-tight text-indigo-950 ${colW < 56 ? 'text-[9.5px]' : colW < 80 ? 'text-[11px]' : 'text-sm'}`}>{nm.head}</span>
        <bdi dir={world === 'money' ? 'rtl' : 'ltr'} className="whitespace-nowrap font-bold leading-none text-indigo-500"
          style={{ fontSize: Math.min(11, Math.max(7, (colW - 4) / (String(nm.sub).length * 0.56))) }}>{nm.sub}</bdi>
      </div>
      {/* le bac : les objets dessinés, empilés depuis le bas */}
      <div className="relative" {...sweepProps} style={{ height: bodyH, ...(sweepProps.style ?? {}) }} data-rx-body={r}
        tabIndex={isDict ? 0 : undefined} aria-label={isDict ? k('pickCol', { col: nm.col }) : undefined}
        onKeyDown={isDict ? (e) => {
          if (e.key === 'ArrowUp') { e.preventDefault(); onFocusCol(); setLab((s) => L.add(s, r, 1)); }
          if (e.key === 'ArrowDown') { e.preventDefault(); onFocusCol(); setLab((s) => L.add(s, r, -1)); }
        } : undefined}>
        <svg width={colW} height={bodyH} className="absolute inset-0" style={{ direction: 'ltr' }} aria-hidden="true">
          <defs>
            <linearGradient id={`rx-bin-${world}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={tone.top} /><stop offset="1" stopColor={tone.bottom} />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={colW} height={bodyH} fill={`url(#rx-bin-${world})`} />
          <rect x={0} y={bodyH - 5} width={colW} height={5} fill={tone.rim} />
          {lay.positions.map((p, i) => {
            const li = lifted.indexOf(i);
            const up = li >= 0;
            return (
              <g key={`${i}`} data-rx-item={`${r}-${i}`} data-lifted={up ? 'true' : undefined} className="rx-lift"
                style={{ transform: up ? `translateY(${-Math.min(8, lay.size * 0.3)}px)` : undefined }}>
                <ObjectFigure world={world} rank={r} x={p.x} y={p.y} w={lay.w} h={lay.size} i={i} hi={up} />
                {up && <SvgPill x={p.x + lay.w / 2} y={p.y + 2} pointer="down" text={String(li + 1)} size={Math.max(8, Math.min(11, lay.size * 0.45))} fill="#4F46E5" />}
              </g>
            );
          })}
        </svg>
        {/* ouvrir : glisser l'objet du dessus vers la colonne de DROITE */}
        {grab && (
          <button type="button" {...grabProps} data-rx-grab={r} aria-label={k('grabAria', { obj: nm.the })}
            className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${ring}`}
            style={{ ...grabProps.style, left: grab.x + lay.w / 2, top: grab.y + lay.size / 2 }}>
            <span className={`h-10 w-10 rounded-full border-[3px] border-dashed ${drag.held === `item:${r}` ? 'border-indigo-600 bg-indigo-100/50' : 'border-indigo-400'}`} />
            <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow ring-2 ring-white">
              <ArrowRight className="h-3 w-3" strokeWidth={3} />
            </span>
          </button>
        )}
        {/* l'objet LIÉ qui attend d'être porté : posé sur la colonne d'où il vient */}
        {trayHere && (
          <button type="button" {...trayProps} data-rx-tray={lab.tray.to} aria-label={k('trayAria', { obj: names[lab.tray.to].one })}
            onKeyDown={(e) => {
              trayProps.onKeyDown(e);
              if (e.key === 'ArrowLeft') { e.preventDefault(); setLab((s) => L.carry(s, s.tray.from + 1)); }
              if (e.key === 'ArrowRight') { e.preventDefault(); setLab((s) => L.carry(s, s.tray.from - 1)); }
            }}
            className={`${drag.rejected === 'tray' ? 'sa-manip-reject' : 'rx-snap'} absolute top-1 z-10 flex items-center justify-center rounded-2xl border-2 bg-white p-1 shadow-[0_10px_18px_-8px_rgba(79,70,229,0.8)] ${drag.held === 'tray' ? 'border-indigo-600 ring-4 ring-indigo-300' : 'border-indigo-300'} ${ring}`}
            style={{ ...trayProps.style, left: (colW - Math.min(colW - 4, 64)) / 2, width: Math.min(colW - 4, 64), height: Math.min(colW - 4, 56) }}>
            <svg width="100%" height="100%" viewBox="0 0 40 40" aria-hidden="true">
              <FittedObject world={world} rank={lab.tray.to} />
            </svg>
          </button>
        )}
      </div>
      {/* la case du chiffre : 0..9, sinon le compte DÉBORDE (rose, serré, une secousse). Quand la colonne peut être LIÉE
          (10 ou plus) ou OUVERTE, la case entière devient le bouton du geste (chemin clavier / toucher), avec son insigne. */}
      <div className="relative flex h-[56px] items-center justify-center border-t-2 border-indigo-100 bg-white">
        <span key={overflow ? 'o' : 'w'} data-rx-digit={r} data-overflow={overflow ? 'true' : 'false'}
          className={`flex items-center justify-center rounded-xl border-2 font-black tabular-nums ${overflow ? 'sa-manip-reject border-rose-400 bg-rose-50 text-rose-600' : 'border-indigo-200 bg-[#F5F6FF] text-indigo-950'} ${colW < 56 ? 'h-11 w-[34px]' : 'h-12 w-12'}`}
          style={{ fontSize: overflow ? (colW < 56 ? 15 : 19) : (colW < 56 ? 24 : 30), letterSpacing: overflow ? '-0.08em' : undefined }}>
          <bdi dir="ltr">{count}</bdi>
        </span>
        {(tieBtn || openBtn) && (
          <button type="button" onClick={() => setLab((s) => (tieBtn ? L.tie(s, r, 10) : L.open(s, r)))}
            {...(tieBtn ? { 'data-rx-tie': r } : { 'data-rx-open': r })}
            aria-label={tieBtn ? k('tieAria', { ten: nm.count(10), obj: names[r + 1]?.one ?? '' }) : k('openAria', { obj: nm.the, ten: names[r - 1].count(10) })}
            className={`group absolute inset-0 flex items-center justify-center ${ring}`}>
            <span aria-hidden="true" className={`absolute rounded-2xl border-2 ${tieBtn ? 'border-indigo-400' : 'border-amber-400'} motion-safe:animate-pulse ${colW < 56 ? 'h-[50px] w-[38px]' : 'h-[54px] w-[56px]'}`} />
            <span aria-hidden="true" className={`absolute flex h-6 w-6 items-center justify-center rounded-full text-white shadow ring-2 ring-white transition-transform group-active:scale-90 motion-reduce:transition-none ${tieBtn ? 'bg-indigo-600' : 'bg-amber-500'}`}
              style={{ top: 1, right: Math.max(0, colW / 2 - (colW < 56 ? 26 : 34)) }}>
              {tieBtn ? <Link2 className="h-3.5 w-3.5" strokeWidth={3} /> : <PackageOpen className="h-3.5 w-3.5" strokeWidth={2.6} />}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

const BIN = {
  pencils: { top: '#FFF8EC', bottom: '#F6E3C2', rim: '#E2C08E' },
  tokens: { top: '#F7F7FF', bottom: '#ECEEFF', rim: '#C7CBFF' },
  money: { top: '#F3FBF6', bottom: '#E2F3E8', rim: '#A7D7B8' },
};

/** Les couleurs des jetons, une par CLASSE (unités, milliers, millions). */
const CLASS_TONE = [
  { fill: '#6366F1', dark: '#4338CA', light: '#E0E7FF' },
  { fill: '#F59E0B', dark: '#B45309', light: '#FEF3C7' },
  { fill: '#E11D48', dark: '#9F1239', light: '#FFE4E6' },
];
/** Les couleurs DÉCORATIVES des crayons : une période de 7 (jamais 10 : la couleur ne fait pas le paquet). */
const PENCIL_HUES = ['#FBBF24', '#60A5FA', '#34D399', '#F87171', '#A78BFA', '#FB923C', '#F472B6'];

/* ══════════════ Les objets dessinés ══════════════ */

/** Un objet de rang `rank` centré dans un carré de `box` px (le plateau, l'objet porté sous le doigt). */
function FittedObject({ world, rank, box = 40, m = 2 }) {
  const a = L.aspectOf(world, rank);
  const inner = box - 2 * m;
  const w = a >= 1 ? inner : inner * a;
  const h = a >= 1 ? inner / a : inner;
  return <ObjectFigure world={world} rank={rank} x={(box - w) / 2} y={(box - h) / 2} w={w} h={h} i={1} />;
}

/** Un objet de rang `rank` dans la boîte (x, y, w, h). Honnête : un paquet montre 10 crayons, une boîte 10 paquets… */
function ObjectFigure({ world, rank, x, y, w, h, i = 0, hi = false }) {
  const stroke = hi ? '#4F46E5' : null;
  if (world === 'tokens') {
    const tone = CLASS_TONE[Math.min(2, Math.floor(rank / 3))];
    const rr = Math.min(w, h) / 2;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const label = spaced(10 ** rank).replace(/ /g, ' ');
    const fs = Math.min(rr * 0.9, (rr * 2.6) / Math.max(1, label.length));
    return (
      <g>
        <ellipse cx={cx} cy={cy + rr * 0.16} rx={rr} ry={rr * 0.98} fill={tone.dark} />
        <circle cx={cx} cy={cy} r={rr} fill={tone.fill} stroke={stroke ?? '#FFFFFF'} strokeWidth={hi ? 2 : 0.8} />
        <circle cx={cx} cy={cy} r={rr * 0.74} fill="none" stroke={tone.light} strokeWidth={Math.max(0.6, rr * 0.08)} opacity={0.8} />
        {fs >= 4.5 && <text x={cx} y={cy + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight={900} fill="#FFFFFF" fontFamily="ui-sans-serif, system-ui, sans-serif">{label}</text>}
      </g>
    );
  }
  if (world === 'money') {
    const v = 10 ** rank;
    if (rank >= 2) {
      // un billet GÉNÉRIQUE : un rectangle, un cadre, un médaillon rond, « 100 دج » — jamais le dessin d'un vrai billet
      const c = rank === 2 ? { fill: '#C4B5FD', dark: '#7C3AED', light: '#EDE9FE' } : { fill: '#5EEAD4', dark: '#0F766E', light: '#CCFBF1' };
      const fs = Math.max(4, h * 0.42);
      return (
        <g>
          <rect x={x} y={y + 1} width={w} height={h - 1} rx={Math.max(1.5, h * 0.12)} fill={c.dark} opacity={0.35} />
          <rect x={x} y={y} width={w} height={h - 1} rx={Math.max(1.5, h * 0.12)} fill={c.fill} stroke={stroke ?? c.dark} strokeWidth={hi ? 2 : 0.8} />
          <rect x={x + w * 0.06} y={y + h * 0.14} width={w * 0.88} height={h * 0.62} rx={h * 0.08} fill="none" stroke={c.light} strokeWidth={Math.max(0.5, h * 0.05)} />
          <circle cx={x + w * 0.22} cy={y + h * 0.45} r={h * 0.2} fill={c.light} opacity={0.9} />
          {h >= 10 && <text x={x + w * 0.66} y={y + h * 0.45 + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight={900} fill={c.dark} fontFamily="ui-sans-serif, system-ui, sans-serif">{v}</text>}
        </g>
      );
    }
    const rr = Math.min(w, h) / 2;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const gold = rank === 1;
    return (
      <g>
        <ellipse cx={cx} cy={cy + rr * 0.14} rx={rr} ry={rr} fill={gold ? '#A16207' : '#64748B'} />
        <circle cx={cx} cy={cy} r={rr} fill={gold ? '#FCD34D' : '#E2E8F0'} stroke={stroke ?? (gold ? '#B45309' : '#94A3B8')} strokeWidth={hi ? 2 : 0.8} />
        {gold && <circle cx={cx} cy={cy} r={rr * 0.62} fill="#E5E7EB" />}
        {rr >= 6 && <text x={cx} y={cy + rr * 0.32} textAnchor="middle" fontSize={rr * 0.9} fontWeight={900} fill={gold ? '#78350F' : '#334155'} fontFamily="ui-sans-serif, system-ui, sans-serif">{v}</text>}
      </g>
    );
  }
  // ── l'atelier : crayon, paquet de 10 crayons, boîte de 10 paquets, carton de 10 boîtes ──
  if (rank === 0) return <Pencil x={x} y={y} w={w} h={h} hue={PENCIL_HUES[i % PENCIL_HUES.length]} stroke={stroke} />;
  if (rank === 1) {
    const pw = w / 10;
    return (
      <g>
        {Array.from({ length: 10 }, (_, j) => <Pencil key={j} x={x + j * pw} y={y} w={pw} h={h} hue={PENCIL_HUES[(i * 3 + j) % PENCIL_HUES.length]} plain={pw < 3} />)}
        <rect x={x - 0.5} y={y + h * 0.5} width={w + 1} height={Math.max(1.6, h * 0.1)} rx={1} fill="#E11D48" />
        {stroke && <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx={2} fill="none" stroke={stroke} strokeWidth={2} />}
      </g>
    );
  }
  const carton = rank === 3;
  const lid = h * 0.26;
  const body = carton ? { fill: '#C08A4E', dark: '#8A5A2B', light: '#E2B47A' } : { fill: '#E7B77A', dark: '#B07D44', light: '#F6D7A8' };
  const slots = Array.from({ length: 10 }, (_, j) => j);
  return (
    <g>
      <rect x={x} y={y + 1.2} width={w} height={h - 1.2} rx={Math.max(1, h * 0.06)} fill={body.dark} />
      <rect x={x} y={y} width={w} height={h - 1.5} rx={Math.max(1, h * 0.06)} fill={body.fill} stroke={stroke ?? body.dark} strokeWidth={hi ? 2 : 0.7} />
      {/* l'ouverture du dessus : les 10 contenus (10 paquets en rangée / 10 boîtes en 2 × 5) */}
      <rect x={x + w * 0.06} y={y + h * 0.06} width={w * 0.88} height={lid} rx={Math.max(0.8, h * 0.04)} fill={body.dark} opacity={0.55} />
      {carton
        ? slots.map((j) => (
          <rect key={j} x={x + w * 0.08 + (j % 5) * (w * 0.84 / 5)} y={y + h * 0.075 + Math.floor(j / 5) * (lid / 2)} width={w * 0.84 / 5 - 0.6} height={lid / 2 - 0.6} rx={0.6} fill="#E7B77A" stroke="#B07D44" strokeWidth={0.3} />
        ))
        : slots.map((j) => (
          <rect key={j} x={x + w * 0.08 + j * (w * 0.84 / 10)} y={y + h * 0.08} width={Math.max(0.6, w * 0.84 / 10 - 0.5)} height={lid - h * 0.04} fill={PENCIL_HUES[(j + i) % PENCIL_HUES.length]} />
        ))}
      {/* le ruban adhésif / la poignée */}
      <rect x={x + w * 0.42} y={y + lid + h * 0.08} width={w * 0.16} height={h - lid - h * 0.12} fill={body.light} opacity={0.8} />
      {h >= 22 && <text x={x + w / 2} y={y + h * 0.84} textAnchor="middle" fontSize={h * 0.22} fontWeight={900} fill={body.dark} fontFamily="ui-sans-serif, system-ui, sans-serif">{carton ? '1000' : '100'}</text>}
    </g>
  );
}

/** Un crayon vertical : gomme, virole, corps à pans, bois taillé, mine. `plain` : un trait coloré (très petit). */
function Pencil({ x, y, w, h, hue, stroke = null, plain = false }) {
  if (plain) return <rect x={x + w * 0.1} y={y} width={w * 0.8} height={h} fill={hue} />;
  const e = h * 0.12;
  const f = h * 0.06;
  const tip = h * 0.2;
  const bx = x + w * 0.1;
  const bw = w * 0.8;
  return (
    <g>
      <rect x={bx} y={y} width={bw} height={e} rx={bw * 0.3} fill="#F9A8D4" />
      <rect x={bx} y={y + e} width={bw} height={f} fill="#CBD5E1" />
      <rect x={bx} y={y + e + f} width={bw} height={h - e - f - tip} fill={hue} stroke={stroke ?? undefined} strokeWidth={stroke ? 1.6 : 0} />
      <rect x={bx + bw * 0.38} y={y + e + f} width={bw * 0.24} height={h - e - f - tip} fill="#FFFFFF" opacity={0.28} />
      <path d={`M${bx} ${y + h - tip} L${bx + bw} ${y + h - tip} L${bx + bw / 2} ${y + h} Z`} fill="#F5D0A9" />
      <path d={`M${bx + bw * 0.34} ${y + h - tip * 0.34} L${bx + bw * 0.66} ${y + h - tip * 0.34} L${bx + bw / 2} ${y + h} Z`} fill="#334155" />
    </g>
  );
}

/** Les CLASSES au-dessus du tableau à 7 colonnes : millions | milliers | unités. */
function ClassBar({ cols, colW, k, tiny }) {
  const groups = [];
  for (let c = Math.ceil(cols / 3) - 1; c >= 0; c -= 1) {
    const n = Math.min(3, cols - c * 3);
    groups.push({ c, n });
  }
  return (
    <div className="mb-1 flex items-stretch" style={{ width: colW * cols + 4, paddingInline: 2 }} data-rx-classes>
      {groups.map(({ c, n }) => {
        const tone = CLASS_TONE[Math.min(2, c)];
        return (
          <div key={c} className="px-0.5" style={{ width: colW * n }}>
            <div className={`flex h-full items-center justify-center rounded-lg px-0.5 text-center font-black leading-tight ${tiny ? 'min-h-[26px]' : 'min-h-[28px]'} ${colW * n < 48 ? 'text-[8.5px]' : tiny ? 'text-[9.5px]' : 'text-xs'}`} dir="rtl"
              style={{ background: tone.light, color: tone.dark }}>{k(colW * n < 76 ? `classesShort.${c}` : `classes.${c}`)}</div>
          </div>
        );
      })}
    </div>
  );
}

/** L'emballeuse de l'atelier (large seulement) : une élève en hijab derrière la table, qui réagit. */
function Packer({ mood }) {
  return (
    <LabCard className="overflow-hidden p-0" data-rx-kid={mood}>
      <svg width={SIDE_W} height={118} viewBox={`0 0 ${SIDE_W} 118`} role="img" aria-hidden="true">
        <rect x={0} y={0} width={SIDE_W} height={118} fill="#FFF8EC" />
        <rect x={0} y={0} width={SIDE_W} height={14} fill="#FDE7C2" />
        <KidFigure cx={SIDE_W / 2} top={10} foot={176} hairStyle="hijab" scarf="lavender" outfit="teal" skin="wheat" mood={mood} shadow={false} />
        {/* la table de l'atelier, avec un paquet et une boîte posés */}
        <rect x={6} y={86} width={SIDE_W - 12} height={10} rx={3} fill="#C08A4E" />
        <rect x={6} y={95} width={SIDE_W - 12} height={23} fill="#A9743F" />
        <g transform="translate(24 64)"><ObjectFigure world="pencils" rank={1} x={0} y={0} w={18} h={22} i={2} /></g>
        <g transform={`translate(${SIDE_W - 62} 62)`}><ObjectFigure world="pencils" rank={2} x={0} y={0} w={34} h={26} i={4} /></g>
      </svg>
    </LabCard>
  );
}

/* ══════════════ La découverte et la règle ══════════════ */

function discoveryPrompt(lab, dk, k) {
  if (dk === 'rank') return k('discovery.prompt.rank');
  const z = zeroExample(lab);
  return k('discovery.prompt.zero', { n: iso(spaced(z)) });
}

/** Le nombre de la dictée qui porte un 0 entre deux chiffres (7065), sinon le premier. */
const zeroExample = (lab) => lab.cfg.dictation.find((x) => /[1-9]0+[1-9]/.test(String(x))) ?? lab.cfg.dictation[0];

function discoveryOptions(lab, dk, k, names) {
  const cfg = lab.cfg;
  if (dk === 'rank') {
    const p = L.packCards(cfg.start);
    const u = L.unpackCards(cfg.n, cfg.rank);
    const ranks = Object.keys(cfg.start).map(Number).sort((a, b) => b - a);
    return [
      {
        text: k('discovery.asArrived'),
        why: k('discovery.whyAsArrived', { start: iso(ranks.map((r) => cfg.start[r]).join(' · ')), concat: iso(spaced(p.concat)), value: iso(spaced(p.right)) }),
      },
      { text: k('discovery.right.rank'), correct: true },
      {
        text: k('discovery.allUnits'),
        why: k('discovery.whyAllUnits', { n: iso(cfg.n), rank: RANK_NAMES[cfg.rank], digit: u.digit, count: names[cfg.rank].count(u.right) }),
      },
    ];
  }
  const z = zeroExample(lab);
  const d = digitsByRank(z);
  const ranks = Object.keys(d).map(Number).sort((a, b) => b - a);
  const empty = ranks.find((r) => d[r] === 0 && r < ranks[0]);
  const hi = ranks[0];
  const big = cfg.dictation.reduce((a, b) => Math.max(a, b), 0);
  const without = L.withoutZeros(z);
  const lowRank = String(without).length - 1;
  return [
    {
      text: k('discovery.dropZero'),
      why: k('discovery.whyDropZero', { without: iso(spaced(without)), words: toArabicWords(without), d: d[hi], lower: RANK_NAMES[lowRank] ?? '' }),
    },
    { text: k('discovery.right.zero', { empty: RANK_NAMES[empty ?? 0], d: d[hi], rank: RANK_NAMES[hi] }), correct: true },
    { text: k('discovery.zeroAfterEach'), why: k('discovery.whyZeroAfterEach', { big: iso(spaced(big)), zeros: k('zeros', { count: L.zeroCount(big) }) }) },
  ];
}

function Formal({ lab, dk, k }) {
  const cfg = lab.cfg;
  if (dk === 'rank') {
    const n = cfg.n;
    const pairs = L.digitCountPairs(n).slice().reverse();
    return (
      <div className="space-y-2.5 text-sm font-bold text-emerald-950" data-rx-formal="rank">
        <p className="font-black">{k('formal.tableTitle', { n: iso(n) })}</p>
        <div className="overflow-x-auto">
          <table dir="ltr" className="mx-auto w-full max-w-[460px] table-fixed border-collapse text-center" data-rx-formal-table>
            <thead>
              <tr>{pairs.map((p) => <th key={p.rank} className="border border-emerald-200 bg-white px-0.5 py-1 text-[11px] font-black leading-tight" dir="rtl">{RANK_NAMES[p.rank]}</th>)}<th className="w-[22%] px-1" /></tr>
            </thead>
            <tbody>
              <tr>
                {pairs.map((p) => <td key={p.rank} className={`border border-emerald-200 px-0.5 py-1 text-lg font-black ${p.digit === 0 ? 'text-slate-400' : 'text-indigo-950'}`} data-zero={p.digit === 0 ? 'true' : undefined}>{p.digit}</td>)}
                <td className="px-1 text-[11px] leading-tight" dir="rtl">{k('formal.digit')}</td>
              </tr>
              <tr>
                {pairs.map((p) => <td key={p.rank} className="border border-emerald-200 bg-amber-50 px-0.5 py-1 text-base font-black text-amber-950">{p.count}</td>)}
                <td className="px-1 text-[11px] leading-tight" dir="rtl">{k('formal.count')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="flex justify-center"><Formula text={L.decomposeLine(n)} className="text-base font-extrabold text-indigo-950" /></p>
        <p>{k('formal.rule.rank')}</p>
      </div>
    );
  }
  const big = cfg.dictation.reduce((a, b) => Math.max(a, b), 0);
  const cls = classWordsOf(big);
  return (
    <div className="space-y-2.5 text-sm font-bold text-emerald-950" data-rx-formal="zero">
      <p className="font-black">{k('formal.classesTitle')}</p>
      <p className="flex justify-center"><bdi dir="ltr" className="whitespace-nowrap text-2xl font-black tracking-wide text-indigo-950" data-rx-formal-spaced>{spaced(big)}</bdi></p>
      <ul className="flex flex-wrap justify-center gap-1.5" data-rx-formal-classes>
        {cls.map((c, i) => (
          <li key={c.k} className="rounded-xl border px-2 py-1 text-center" style={{ borderColor: CLASS_TONE[Math.min(2, c.k)].fill, background: CLASS_TONE[Math.min(2, c.k)].light }}>
            <bdi dir="ltr" className="block font-mono text-base font-black text-indigo-950">{c.digits}</bdi>
            <span className="block text-xs">{i > 0 ? `و${c.words}` : c.words}</span>
          </li>
        ))}
      </ul>
      <p className="flex justify-center"><Formula text={L.decomposeLine(big)} className="text-sm font-extrabold text-indigo-950" /></p>
      <p>{k('formal.rule.zero')}</p>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de questions de chaque tâche : elle interroge ce que l'élève vient de FAIRE ; `rule` (la découverte) clôt la dernière. */
export const CHAINS = Object.freeze({
  pack: ['stay', 'digit', 'whyTie'],
  unpack: ['count', 'digitCount', 'zero'],
  next: ['value', 'links'],
  previous: ['value', 'oneGesture'],
  borrow: ['value', 'opens'],
  dictation: ['zeroBox', 'classes'],
});

const hasInnerZero = (n) => /[1-9]0+[1-9]/.test(String(n));

/** Les suites de CE labo : une question sans objet est retirée (pas de 0 intérieur, moins de 10 à lier) ; la règle clôt sa tâche. */
export function chainsOf(lab, dk = discoveryKindOf(lab.tasks)) {
  const c = lab.cfg;
  const out = {};
  for (const tk of lab.tasks) {
    out[tk] = (CHAINS[tk] ?? []).filter((q) => !(q === 'stay' && (c.start[0] ?? 0) < 10)
      && !(q === 'zero' && !hasInnerZero(c.n)) && !(q === 'zeroBox' && !c.dictation.some(hasInnerZero)));
  }
  const ruleTask = dk === 'rank' ? lab.tasks.filter((tk) => tk === 'pack' || tk === 'unpack').at(-1) : dk === 'zero' ? 'dictation' : null;
  if (ruleTask) out[ruleTask] = [...out[ruleTask], 'rule'];
  return out;
}

const n$ = (x) => iso(spaced(x));
const C = (k, key, o) => k(`cp.${key}`, o);
const pick = (list, right, whys) => list.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));

/** Chaque question est construite sur LES nombres de la tâche (rien en dur) ; `nm` : les noms comptés du monde. */
export const QUESTIONS = {
  stay: (lab, task, k, nm) => {
    const n0 = lab.cfg.start[0];
    const tens = Math.floor(n0 / 10);
    const o = { have: nm[0].count(n0), col: nm[0].col, packs: nm[1].count(tens), n0: iso(n0), tens: iso(tens), rest: nm[0].count(n0 % 10) };
    return {
      id: 'stay', kind: 'choice', prompt: C(k, 'stay.prompt', o),
      options: pick([nm[0].count(n0 % 10), nm[0].count(n0), nm[0].count(tens)], 0, [null, C(k, 'stay.whyAll', o), C(k, 'stay.whyTens', o)]),
      hints: [C(k, 'stay.hint1', o), C(k, 'stay.hint2', o)],
      explain: C(k, 'stay.explain', { ...o, calc: iso(`${n0} = ${tens} × 10 + ${n0 % 10}`) }),
    };
  },
  digit: (lab, task, k, nm) => {
    const value = lab.results.pack?.value ?? L.packCards(lab.cfg.start).right;
    const d = digitsByRank(value);
    const r = [1, 2, 3].find((x) => (d[x] ?? 0) > 0) ?? 1;
    const p = 10 ** r;
    const o = { value: n$(value), d: iso(d[r]), col: nm[r].col, one: nm[r].one, units: nm[0].col, below: nm[Math.max(0, r - 1)].col, above: nm[Math.min(nm.length - 1, r + 1)].col, p: iso(spaced(p)) };
    return {
      id: 'digit', kind: 'choice', prompt: C(k, 'digit.prompt', o),
      options: pick([nm[0].count(d[r] * p), nm[0].count(d[r]), nm[0].count(d[r] * p * 10)], 0, [null, C(k, 'digit.whyDigit', o), C(k, 'digit.whyAbove', o)]),
      hints: [C(k, 'digit.hint1', o), C(k, 'digit.hint2', o)],
      explain: C(k, 'digit.explain', { ...o, calc: iso(`${d[r]} × ${spaced(p)} = ${spaced(d[r] * p)}`) }),
    };
  },
  whyTie: (lab, task, k) => {
    const pc = L.packCards(lab.cfg.start);
    const ranks = Object.keys(lab.cfg.start).map(Number).sort((a, b) => b - a);
    const o = { start: iso(ranks.map((r) => lab.cfg.start[r]).join(' · ')), concat: n$(pc.concat), sum: n$(pc.sum), value: n$(pc.right) };
    return {
      id: 'whyTie', kind: 'choice', prompt: C(k, 'whyTie.prompt', o),
      options: pick([C(k, 'whyTie.right'), C(k, 'whyTie.big'), C(k, 'whyTie.sum', o)], 0, [null, C(k, 'whyTie.whyBig', o), C(k, 'whyTie.whySum', o)]),
      hints: [C(k, 'whyTie.hint1'), C(k, 'whyTie.hint2')],
      explain: C(k, 'whyTie.explain', o),
    };
  },
  count: (lab, task, k, nm) => {
    const { n, rank } = lab.cfg;
    const u = L.unpackCards(n, rank);
    const o = { n: n$(n), col: nm[rank].col, rankName: RANK_NAMES[rank] };
    return {
      id: 'count', kind: 'number', expected: String(u.right), answer: <bdi dir="ltr">{u.right}</bdi>,
      prompt: C(k, 'count.prompt', o), hints: [C(k, 'count.hint1', o), C(k, 'count.hint2', o)],
      explain: C(k, 'count.explain', { ...o, calc: iso(L.unpackLine(n, rank)), count: nm[rank].count(u.right) }),
    };
  },
  digitCount: (lab, task, k, nm) => {
    const { n, rank } = lab.cfg;
    const u = L.unpackCards(n, rank);
    const o = { n: n$(n), digit: iso(u.digit), count: nm[rank].count(u.right), col: nm[rank].col, rankName: RANK_NAMES[rank], right: iso(u.right) };
    return {
      id: 'digitCount', kind: 'choice', prompt: C(k, 'digitCount.prompt', o),
      options: pick([C(k, 'digitCount.right'), C(k, 'digitCount.wrongBoard', o), C(k, 'digitCount.fromRight', o)], 0,
        [null, C(k, 'digitCount.whyWrongBoard', o), C(k, 'digitCount.whyFromRight', o)]),
      hints: [C(k, 'digitCount.hint1', o), C(k, 'digitCount.hint2')],
      explain: C(k, 'digitCount.explain', o),
    };
  },
  zero: (lab, task, k) => {
    const { n } = lab.cfg;
    const without = L.withoutZeros(n);
    const o = { n: n$(n), without: n$(without), ten: n$(n * 10), words: toArabicWords(without) };
    return {
      id: 'zero', kind: 'choice', prompt: C(k, 'zero.prompt', o),
      options: pick([n$(without), n$(n), n$(n * 10)], 0, [null, C(k, 'zero.whySame', o), C(k, 'zero.whyTen', o)]),
      hints: [C(k, 'zero.hint1', o), C(k, 'zero.hint2', o)],
      explain: C(k, 'zero.explain', o),
    };
  },
  value: (lab, task, k) => {
    const base = task === 'borrow' ? lab.cfg.borrow : lab.cfg.next;
    const target = L.targetOf(lab, task);
    const o = { n: n$(base), calc: iso(`${spaced(base)} ${task === 'next' ? '+' : '−'} 1 = ${spaced(target)}`) };
    return {
      id: 'value', kind: 'number', expected: String(target), answer: <bdi dir="ltr">{spaced(target)}</bdi>,
      prompt: C(k, `value.prompt.${task}`, o), hints: [C(k, 'value.hint1'), C(k, `value.hint2.${task === 'next' ? 'up' : 'down'}`)],
      explain: C(k, 'value.explain', o),
    };
  },
  links: (lab, task, k) => {
    const packs = lab.results.next?.packs ?? String(lab.cfg.next).match(/9*$/)[0].length;
    const o = { n: n$(lab.cfg.next), t: n$(lab.cfg.next + 1), packs: iso(packs) };
    return {
      id: 'links', kind: 'number', expected: String(packs), answer: <bdi dir="ltr">{packs}</bdi>,
      prompt: C(k, 'links.prompt', o), hints: [C(k, 'links.hint1'), C(k, 'links.hint2', o)], explain: C(k, 'links.explain', o),
    };
  },
  oneGesture: (lab, task, k) => {
    const o = { n: n$(lab.cfg.next), up: n$(lab.cfg.next + 1), down: n$(lab.cfg.next - 1) };
    return {
      id: 'oneGesture', kind: 'choice', prompt: C(k, 'oneGesture.prompt', o),
      options: pick([C(k, 'oneGesture.right'), C(k, 'oneGesture.easier'), C(k, 'oneGesture.noTie')], 0,
        [null, C(k, 'oneGesture.whyEasier', o), C(k, 'oneGesture.whyNoTie', o)]),
      hints: [C(k, 'oneGesture.hint1'), C(k, 'oneGesture.hint2', o)], explain: C(k, 'oneGesture.explain', o),
    };
  },
  opens: (lab, task, k) => {
    const opens = lab.results.borrow?.opens ?? String(lab.cfg.borrow).match(/0*$/)[0].length;
    const o = { n: n$(lab.cfg.borrow), t: n$(lab.cfg.borrow - 1), opens: iso(opens) };
    return {
      id: 'opens', kind: 'number', expected: String(opens), answer: <bdi dir="ltr">{opens}</bdi>,
      prompt: C(k, 'opens.prompt', o), hints: [C(k, 'opens.hint1'), C(k, 'opens.hint2', o)], explain: C(k, 'opens.explain', o),
    };
  },
  zeroBox: (lab, task, k) => {
    const z = lab.cfg.dictation.find(hasInnerZero);
    const d = digitsByRank(z);
    const ranks = Object.keys(d).map(Number).sort((a, b) => b - a);
    const empty = ranks.find((r) => d[r] === 0 && r < ranks[0]);
    const without = L.withoutZeros(z);
    const o = { z: n$(z), empty: RANK_NAMES[empty], without: n$(without), words: toArabicWords(without) };
    return {
      id: 'zeroBox', kind: 'choice', cols: 3, prompt: C(k, 'zeroBox.prompt', o),
      options: pick([iso('0'), C(k, 'zeroBox.blank'), iso('1')], 0, [null, C(k, 'zeroBox.whyBlank', o), C(k, 'zeroBox.whyOne', o)]),
      hints: [C(k, 'zeroBox.hint1', o), C(k, 'zeroBox.hint2', o)], explain: C(k, 'zeroBox.explain', o),
    };
  },
  classes: (lab, task, k) => {
    const big = lab.cfg.dictation.reduce((a, b) => Math.max(a, b), 0);
    const n = Math.ceil(String(big).length / 3);
    const o = { big: n$(big), digits: iso(String(big).length), n: iso(n), list: classWordsOf(big).map((c) => c.words).join(' و') };
    return {
      id: 'classes', kind: 'number', expected: String(n), answer: <bdi dir="ltr">{n}</bdi>,
      prompt: C(k, 'classes.prompt', o), hints: [C(k, 'classes.hint1'), C(k, 'classes.hint2', o)], explain: C(k, 'classes.explain', o),
    };
  },
  rule: (lab, task, k, nm, dk) => ({
    id: 'rule', kind: 'choice', prompt: discoveryPrompt(lab, dk, k), options: discoveryOptions(lab, dk, k, nm),
    hints: [C(k, `rule.${dk}.hint1`), C(k, `rule.${dk}.hint2`)],
    explain: <Formal lab={lab} dk={dk} k={k} names={nm} />,
  }),
};
