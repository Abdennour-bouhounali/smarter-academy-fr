import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, Wand2, Lock, Hand, CheckCircle2, XCircle, RefreshCw, ClipboardList, Lightbulb, Trophy, Ban, Move } from 'lucide-react';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import LabFold from '../primitives/LabFold';
import DropZone from '../primitives/DropZone';
import DragGhost from '../primitives/DragGhost';
import BulbFigure from '../primitives/BulbFigure';
import { LabCard, StageFrame, PromptCard, ChoiceTray, VerdictBanner } from '../primitives/LabKit';
import { LEVELS } from '../levels';
import * as L from '../logic/digitCards';

/**
 * digit-cards — LES CRITÈRES DE DIVISIBILITÉ DÉCOUVERTS SANS DIVISER (1AM, unité 3 « الضرب والقسمة », درس « قواعد
 * قابلية القسمة », manuel نشاط 4 pp. 37–38, معارف 3 p. 41, طريقة p. 42, تمرين 26 p. 46). La logique, entière et
 * exacte, est dans `logic/digitCards.js` (divmod du core, importé par chemin). Chaque verdict est le RESTE, écrit
 * `n = d × q + r` : le laboratoire n'énonce aucun critère avant la découverte.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. مبتدئ (`mode: 'grid'`, نشاط 4) : la table 0 → 48 en 7 colonnes (les multiples de 2 et de 5 NE tombent PAS en
 *    colonnes : il faut regarder les chiffres). L'élève ouvre un coloriage (rouge ÷2, bleu ÷5, vert ÷3, dans
 *    l'ordre) et TOUCHE les cases qu'il affirme multiples (toucher, Entrée/Espace ; chaque case est un bouton).
 *    متقدم (`mode: 'cards'`, تمرين 26) : il PORTE les cartes 4, 5, 9, 3 dans quatre cases (glisser, toucher-toucher,
 *    clavier), en ÉCHANGE deux posées, et affirme « يقبل / لا يقبل » sur cinq lampes fermées (2, 3, 5, 4, 9).
 * B. La divisibilité se décide SANS diviser : le chiffre des unités (2, 5), la somme des chiffres — qu'aucun
 *    réarrangement ne change — (3, 9), les deux derniers chiffres (4, car 100 = 4 × 25) ; et « a يقبل القسمة على b »
 *    veut dire « le reste euclidien est 0 ».
 * C. Une case acceptée prend la couleur, la ligne du haut écrit `n = d × q` ; une case refusée tremble et la ligne
 *    écrit `21 = 2 × 10 + 1`. Le registre sous la table recueille les CHIFFRES DES UNITÉS des cases coloriées (et,
 *    pour 3, leurs SOMMES de chiffres : tous les chiffres des unités y apparaissent, les sommes se répètent). Cartes :
 *    après chaque nouveau nombre les lampes ouvertes sont re-jugées et marquées « تغيّر / بقي » — 3 et 9 ne
 *    basculent jamais sous un échange, 2, 5, 4 peuvent basculer.
 * D. `n = d × q + 0` ; les règles de 2, 5, 3 (table) ; de 2, 5, 3, 9, 4 (cartes), avec `9534 = 95 × 100 + 34`.
 * E. Table : les trois coloriages complets. Cartes : les trois cibles du manuel atteintes (le plus grand nombre
 *    divisible par 2, 3, 5 : 9534, 9543, 9435) + UN échange qui a gardé la lampe 3 et basculé la lampe 2. Les
 *    conjectures fausses sont réfutées avec SES cases (« la colonne » : m et m ± 7 ; « le chiffre des unités pour 3 » :
 *    m et m ± 10) ou SES nombres (« pair ⇒ ÷4 » : sa réponse 9534 ; « la somme pour 2 » : son échange).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        la divisibilité se lit sur des chiffres ; « يقبل القسمة » ⇔ reste nul
 *   OBJECT         la table du manuel (49 cases) ; quatre cartes de chiffres et quatre cases
 *   VARIABLE       la case affirmée multiple (table) ; la POSITION de chaque chiffre (cartes)
 *   INVARIANT      la somme des chiffres sous tout réarrangement ; le reste mod 3 et mod 9
 *   TRANSFORMATION colorier ; poser, déplacer, échanger deux cartes
 *   CONSTRAINT     une case n'est multiple que si r = 0 ; un nombre n'a que quatre chiffres, ceux des cartes
 *   RESISTANCE     la case refusée avec sa division ; l'affirmation fausse ; « الأكبر » refusé avec un plus grand
 *                  valide ; « لا يوجد » refusé avec un contre-exemple
 *   EVIDENCE       le registre (unités / sommes) ; les lampes « تغيّر / بقي » après un échange
 *   CONTRAST       même colonne, verdicts opposés ; même chiffre des unités, verdicts opposés pour 3 ; même somme,
 *                  verdicts opposés pour 2 ; pair mais pas ÷4
 *   PREDICTION     l'élève AFFIRME avant de voir (aucune case n'est pré-coloriée, aucune lampe n'est ouverte)
 *   DISCOVERY      « ما الذي يكفي أن ننظر إليه؟ »
 *   FORMALIZATION  la définition par le reste, puis les cinq critères
 *   TRANSFER       les تمارين 22–26, 32 ; l'année bissextile (أتعمّق 8) ; la banque
 *
 * « جرّب كل الإمكانيات » (§6bis) : NON — chaque case touchée, chaque affirmation EST une réponse. « أكمل » (table) est
 * un raccourci LOCAL, pas l'auto-complétion du registre : il n'apparaît qu'après 5 cases coloriées à la main pour le
 * coloriage ouvert (REVEAL_AFTER), colorie les cases manquantes en pâle pointillé, et n'est jamais un essai
 * (choix de l'auteur du lab : 25 multiples de 2 à toucher un par un sur un téléphone, c'est de la corvée, pas de
 * la découverte ; les 5 premiers suffisent à faire travailler le registre).
 *
 * D'UN SEUL REGARD (§8bis) : `[data-dc-glance]` enveloppe la consigne (le kit LabKit : `PromptCard` — la puce, la
 * phrase de la tâche et sa lampe, les trois coloriages en cartes tactiles / les cibles, « هذا هو الأكبر » et
 * « لا يوجد »), le bandeau du verdict (`VerdictBanner`) et la scène (`StageFrame`) : la table en tuiles (table) ; le
 * cadenas à quatre fenêtres, le plateau et les cinq ampoules dessinées `BulbFigure` (cartes). Large (≥ 600 px) : une
 * colonne à côté de la scène porte le verdict et le registre (table) ou la GRANDE lecture du nombre (cartes) ; étroit :
 * le bandeau est toujours là (la consigne avant le premier geste), la scène ne saute jamais sous le doigt. La case de
 * la table vient de l'écran de leçon (`useLessonViewport`) moins ce qui l'entoure, entre 40 px (le doigt :
 * 7 × 40 = 280 px) et 56 px (`gridLayout`, testé) ; sous 296 px de large le bloc déborde sur les cadres jusqu'à la
 * gouttière (`data-bleed`). La liste des essais est dans un `LabFold`.
 *
 * Le registre et les ampoules montrent la MATIÈRE (chiffres des unités, sommes, restes), jamais la règle ; la ligne
 * « ce qui reste » (`data-dc-need`, dans la carte de consigne) ne guide que le geste.
 *
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater) : `logic/digitCards.js › coachOf` montre le CONTRÔLE à trouver, jamais la
 * case, la carte ou l'affirmation juste — table : un coloriage → la table → « أكمل » → le coloriage suivant ; cartes : une carte → une
 * ampoule → « هذا هو الأكبر » → la cible suivante → l'échange de deux cartes posées (« لا يوجد » n'est jamais montré).
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Table : à
 * chaque coloriage COMPLET, une suite sur SES cases (les chiffres des unités, la colonne qui ne décide pas, le suivant pour 5 ; pour 3 le
 * chiffre des unités qui ne suffit pas, la somme des chiffres). Cartes : à chaque cible atteinte (le plus grand nombre, ou « لا يوجد ») et à
 * l'échange retenu (3 gardée, 2 basculée), une suite sur SES nombres (`stepOf`, `chainOf`, `QUESTIONS`). La suite qui rend la découverte
 * prête finit par la règle (l'ancienne découverte, qui formalise). Obligatoires pour tout élève ; l'enseignant seul les coupe pour SON
 * compte. Questions actives → `guided` (ni « جرّب › اكتشف › صِغ » ni « تلميح »). ÉTAPES : table — `LabStepper` (`[data-dc-step=<i>]`, un
 * coloriage = une étape ; les cartes de coloriage restent les commandes) ; cartes — les pastilles de cibles restent (ce sont des commandes),
 * gelées tant qu'une question attend. Fête par étape ; « إعادة » repart de zéro ; « أعِد التجربة » rouvre LA MÊME étape (`L.retryStep`).
 * SON : `tooth` pour une case acceptée ou une carte posée, `bell` pour une lampe juste, `flag` quand une étape est atteinte, `over` pour un
 * refus.
 * Props (contrat fixé avec la leçon) : `mode` ('grid' | 'cards'), `divisors`, `digits` (cartes), `from`, `to`,
 * `columns` (table), `level`, `levels`, `title`, `lead`, `onTrial` à chaque geste JUGÉ — table
 * `{ mode: 'grid', n, d, r, ok }` ; cartes `{ mode: 'cards', n, d, claim, r, ok }` avec claim 'yes' | 'no' (une
 * lampe), 'largest' (« هذا هو الأكبر » : ok = divisible ET le plus grand) ou 'none' (« لا يوجد » : n = null,
 * r = null) —, `onFinished({ mode })` à la règle ; tous par `state.report`.
 *
 * CONTRAT DOM : [data-digit-cards][data-mode][data-solved], [data-dc-glance], [data-dc-colouring=<d>][data-open]
 * [data-complete], [data-dc-reveal], [data-dc-table], [data-dc-cell=<n>][data-colour][data-revealed],
 * [data-dc-ledger], [data-dc-ledger-row=<d>], [data-dc-card=<digit>][data-placed], [data-dc-slot=<i>][data-digit],
 * [data-dc-tray], [data-dc-number], [data-dc-lamp=<d>][data-state][data-flip], [data-dc-claim=<d>][data-claim],
 * [data-dc-task=<d>][data-done], [data-dc-submit], [data-dc-none], [data-dc-verdict=<kind>],
 * [data-dc-refused=<reason>], [data-dc-need], [data-dc-formal], [data-lab-fold=digit-cards.trials] ; ajoutés le
 * 2026-10-14 (refonte visuelle) : [data-dc-prompt], [data-dc-colourings], [data-dc-board], [data-dc-remainder] (la
 * pastille « +r » d'une case refusée), [data-dc-marks], [data-dc-stage], [data-dc-readout], [data-dc-answer],
 * [data-dc-flip-badge], et l'ampoule [data-bulb=<state>].
 */
const NS = 'manipulation.digitCards';
const LRI = '⁦';
const PDI = '⁩';
const iso = (s) => `${LRI}${s}${PDI}`;
const ring = 'outline-none focus-visible:ring-4 focus-visible:ring-indigo-300';
const WIDE_MIN = 600;
const SIDE_W = 230;

/**
 * Les couleurs du manuel (rouge ÷2, bleu ÷5, vert ÷3), en classes littérales (Tailwind) : la carte de coloriage
 * (`idle` / `open` / `done`), la tuile coloriée (`tile`, posée sur un rebord plus foncé), la tuile révélée par « أكمل »
 * (`soft`, pâle et pointillée), le point, la bande et les pilules du registre.
 */
const TONE = {
  red: {
    idle: 'border-red-200 bg-white text-red-900 shadow-[0_4px_0_0_#FECACA] hover:-translate-y-0.5 hover:border-red-300 active:translate-y-0.5 active:shadow-none',
    open: 'border-red-600 bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_4px_0_0_#991B1B]',
    done: 'border-red-200 bg-red-50 text-red-800 shadow-[0_3px_0_0_#FECACA]',
    tile: 'border-red-600 bg-red-500 text-white shadow-[0_3px_0_0_#B91C1C]',
    soft: 'border-dashed border-red-400 bg-red-100 text-red-900',
    dot: 'bg-red-500', band: 'bg-red-50/80', text: 'text-red-900', pill: 'border-red-200 text-red-900',
  },
  blue: {
    idle: 'border-blue-200 bg-white text-blue-900 shadow-[0_4px_0_0_#BFDBFE] hover:-translate-y-0.5 hover:border-blue-300 active:translate-y-0.5 active:shadow-none',
    open: 'border-blue-600 bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_4px_0_0_#1E40AF]',
    done: 'border-blue-200 bg-blue-50 text-blue-800 shadow-[0_3px_0_0_#BFDBFE]',
    tile: 'border-blue-600 bg-blue-500 text-white shadow-[0_3px_0_0_#1D4ED8]',
    soft: 'border-dashed border-blue-400 bg-blue-100 text-blue-900',
    dot: 'bg-blue-500', band: 'bg-blue-50/80', text: 'text-blue-900', pill: 'border-blue-200 text-blue-900',
  },
  green: {
    idle: 'border-green-200 bg-white text-green-900 shadow-[0_4px_0_0_#BBF7D0] hover:-translate-y-0.5 hover:border-green-300 active:translate-y-0.5 active:shadow-none',
    open: 'border-green-700 bg-gradient-to-b from-green-600 to-green-700 text-white shadow-[0_4px_0_0_#14532D]',
    done: 'border-green-200 bg-green-50 text-green-800 shadow-[0_3px_0_0_#BBF7D0]',
    tile: 'border-green-700 bg-green-600 text-white shadow-[0_3px_0_0_#166534]',
    soft: 'border-dashed border-green-500 bg-green-100 text-green-900',
    dot: 'bg-green-600', band: 'bg-green-50/80', text: 'text-green-900', pill: 'border-green-200 text-green-900',
  },
  amber: {
    idle: 'border-amber-200 bg-white text-amber-900 shadow-[0_4px_0_0_#FDE68A] hover:-translate-y-0.5 hover:border-amber-300 active:translate-y-0.5 active:shadow-none',
    open: 'border-amber-600 bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-[0_4px_0_0_#92400E]',
    done: 'border-amber-200 bg-amber-50 text-amber-800 shadow-[0_3px_0_0_#FDE68A]',
    tile: 'border-amber-600 bg-amber-500 text-white shadow-[0_3px_0_0_#B45309]',
    soft: 'border-dashed border-amber-400 bg-amber-100 text-amber-900',
    dot: 'bg-amber-500', band: 'bg-amber-50/80', text: 'text-amber-900', pill: 'border-amber-200 text-amber-900',
  },
  violet: {
    idle: 'border-violet-200 bg-white text-violet-900 shadow-[0_4px_0_0_#DDD6FE] hover:-translate-y-0.5 hover:border-violet-300 active:translate-y-0.5 active:shadow-none',
    open: 'border-violet-600 bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-[0_4px_0_0_#5B21B6]',
    done: 'border-violet-200 bg-violet-50 text-violet-800 shadow-[0_3px_0_0_#DDD6FE]',
    tile: 'border-violet-600 bg-violet-500 text-white shadow-[0_3px_0_0_#6D28D9]',
    soft: 'border-dashed border-violet-400 bg-violet-100 text-violet-900',
    dot: 'bg-violet-500', band: 'bg-violet-50/80', text: 'text-violet-900', pill: 'border-violet-200 text-violet-900',
  },
  slate: {
    idle: 'border-slate-200 bg-white text-slate-900 shadow-[0_4px_0_0_#E2E8F0] hover:-translate-y-0.5 hover:border-slate-300 active:translate-y-0.5 active:shadow-none',
    open: 'border-slate-600 bg-gradient-to-b from-slate-500 to-slate-600 text-white shadow-[0_4px_0_0_#1E293B]',
    done: 'border-slate-200 bg-slate-50 text-slate-800 shadow-[0_3px_0_0_#E2E8F0]',
    tile: 'border-slate-600 bg-slate-500 text-white shadow-[0_3px_0_0_#334155]',
    soft: 'border-dashed border-slate-400 bg-slate-100 text-slate-900',
    dot: 'bg-slate-500', band: 'bg-slate-50/80', text: 'text-slate-900', pill: 'border-slate-200 text-slate-900',
  },
};
const toneOf = (d) => TONE[L.colourOf(d)] ?? TONE.slate;

/** Une formule : UN îlot LTR insécable (QA 320 px des labs précédents : coupée dans un paragraphe RTL, elle se réordonne). */
function Formula({ children, className = '', ...rest }) {
  return <bdi dir="ltr" className={`whitespace-nowrap font-mono ${className}`} {...rest}>{children}</bdi>;
}

const sameArr = (x, y) => Array.isArray(x) && Array.isArray(y) && x.length === y.length && x.every((v, i) => v === y[i]);

/** Les nombres de départ : ceux de la leçon, sinon le niveau dont le MODE correspond (les tableaux du niveau sont réutilisés tels quels). */
export function numbersFor({ mode, divisors, digits, from, to, columns, level }) {
  const pair = LEVELS['digit-cards'];
  const asked = pair[resolveLevelId(level ?? 'beginner')].numbers;
  const m = mode ?? asked.mode;
  const preset = asked.mode === m ? asked : Object.values(pair).map((p) => p.numbers).find((n) => n.mode === m) ?? asked;
  const arr = (v, p) => (v == null || sameArr(v, p) ? p : [...v]);
  if (m === 'cards') return { mode: 'cards', digits: arr(digits, preset.digits), divisors: arr(divisors, preset.divisors) };
  return { mode: 'grid', from: from ?? preset.from, to: to ?? preset.to, columns: columns ?? preset.columns, divisors: arr(divisors, preset.divisors) };
}

export default function DigitCards({
  mode, divisors, digits, from, to, columns, title, lead, level, levels: withLevels = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished, coach: coachOn = true, checkpoints: cpOn = true,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const initialNumbers = useMemo(() => numbersFor({ mode, divisors, digits, from, to, columns, level }), []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'digit-cards', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const nums = state.numbers;
  // « إعادة » (resetCount), un autre niveau ou d'autres nombres : TOUT recommence — les étapes, les essais et les questions du labo
  const sceneKey = `${JSON.stringify(nums)}|${state.epoch}|${state.resetCount}`;
  const [lab, setLab] = useState(() => L.init(nums));
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(L.init(nums)); }
  const m = lab.mode;

  const ready = L.discoveryReady(lab);
  // les questions pendant le labo : la suite de l'étape atteinte ; celle qui rend la découverte prête finit par la règle
  const cpSettings = useLabCheckpointSettings('digit-cards');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpActive = cpOn && cpSettings.enabled;
  const [answered, setAnswered] = useState({ inits: 0, ids: [] });
  const doneIds = answered.inits === scene.inits ? answered.ids : [];
  const step = cpActive ? stepOf(lab, doneIds) : null;
  const cp = useLabCheckpoint({
    id: step?.reached ? step.id : null,
    questions: step?.reached ? chainOf(lab, step).map((q) => QUESTIONS[q](lab, step, k)) : null,
    reached: !!step?.reached,
    resetKey: scene.inits,
    onRetry: () => setLab((s) => L.retryStep(s, step.key)),
    onEvent: (ev) => {
      if (ev.tk === 'checkpoint-done') setAnswered((a) => ({ inits: scene.inits, ids: [...(a.inits === scene.inits ? a.ids : []), ev.id] }));
      state.report(onTrial, ev);
    },
    onDone: () => { if (L.discoveryReady(lab)) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !cpActive) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du geste (muet sans « الصوت »)
  const lastSeen = useRef(lab.last);
  const doneCount = m === 'grid' ? lab.divisors.filter((d) => L.colouringComplete(lab, d)).length : Object.keys(lab.tasks).length + (lab.swap ? 1 : 0);
  const doneSeen = useRef(doneCount);
  useEffect(() => {
    const v = lab.last;
    const more = doneCount > doneSeen.current;
    doneSeen.current = doneCount;
    if (v === lastSeen.current && !more) return;
    lastSeen.current = v;
    if (more) { playSfx('flag'); return; }
    if (!v) return;
    if (v.ok === false) playSfx('over');
    else if (v.kind === 'claim') playSfx('bell');
    else if (v.ok === true || v.kind === 'change') playSfx('tooth', { pitch: v.again ? 0.75 : 1 });
  }, [lab.last, doneCount]);
  useEffect(() => { if (state.isFormal) state.report(onFinished, { mode: m }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  // chaque essai est rapporté UNE fois, même si deux gestes tombent dans le même rendu ; « إعادة » repart de zéro
  const reported = useRef(0);
  const nTrials = lab.trials.length;
  useEffect(() => {
    if (nTrials < reported.current) reported.current = 0;
    for (let i = reported.current; i < nTrials; i += 1) state.report(onTrial, L.trialEvidence(lab.trials[i]));
    reported.current = nTrials;
  }, [nTrials, lab.trials]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure : largeur, écran de leçon, ce qui entoure la table ── */
  const boxRef = useRef(null);
  const glanceRef = useRef(null);
  const tableHRef = useRef(0);
  const [width, setWidth] = useState(320);
  const [overhead, setOverhead] = useState(260);
  const [room, setRoom] = useState(0);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(160, Math.floor(el.clientWidth)));
      // la place libre de chaque côté jusqu'à la gouttière de l'écran (20 px) : la table peut y déborder sur un téléphone
      const r = el.getBoundingClientRect();
      if (typeof window !== 'undefined') setRoom(Math.max(0, Math.floor(Math.min(r.left, window.innerWidth - r.right) - 20)));
      if (glanceRef.current) setOverhead(Math.max(80, Math.ceil(glanceRef.current.getBoundingClientRect().height) - tableHRef.current));
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

  /* ── la découverte : les conjectures fausses réfutées par les cases / les nombres de l'élève ── */
  const discoveryOptions = useMemo(() => discoveryOptionsOf(lab, k), [lab, k]);

  const formal = <Formal lab={lab} k={k} />;
  // §17.9 : le CONTEXTE (tous les nombres) ouvre la carte de consigne ; la leçon peut l'écrire (`lead`) pour SES nombres
  const context = (state.isAuthoredLevel && lead) || (m === 'grid'
    ? k('context.grid', { from: lab.from, to: lab.to })
    : k('context.cards', { digits: iso(lab.digits.join(' ، ')) }));

  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'digit-cards', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });

  return (
    <ManipulationShell
      headerAction={cpSettings.control}
      type="digit-cards"
      title={title ?? k(`title.${m}`)}
      titleHidden
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      hints={[0, 1, 2].map((i) => k(`hints.${m}.${i}`))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      guided={cpActive}
      discovery={<ManipulationDiscovery state={state} prompt={k(`discovery.prompt.${m}`)} options={discoveryOptions} formal={formal} />}
      explanation={k('explanation')}
    >
      <ManipulationStage className="bg-gradient-to-b from-indigo-50/40 to-white">
        <div ref={boxRef} className="space-y-2" data-digit-cards data-mode={m} data-solved={ready ? 'true' : 'false'}
          data-layout={narrow ? 'narrow' : 'wide'}>
          {m === 'grid'
            ? <GridLab lab={lab} setLab={setLab} k={k} width={width} room={room} screenH={screenH} overhead={overhead} narrow={narrow} glanceRef={glanceRef} tableHRef={tableHRef} context={context} cp={cp} />
            : <CardsLab lab={lab} setLab={setLab} k={k} width={width} glanceRef={glanceRef} context={context} cp={cp} />}

          {lab.trials.length > 0 && (
            <LabFold id="digit-cards.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-dc-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => (
                  <li key={i} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'} data-ok={String(tr.ok)}>
                    {trialText(tr, k)}
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

function trialText(tr, k) {
  const word = k(tr.ok ? 'ok' : 'notOk');
  if (tr.mode === 'grid') return k('trial.grid', { eq: iso(L.equationText(tr.n, tr.d)), word });
  if (tr.claim === 'yes' || tr.claim === 'no') return k('trial.claim', { eq: iso(L.equationText(tr.n, tr.d)), word: `${k(tr.claim === 'yes' ? 'claimYes' : 'claimNo')}: ${word}` });
  if (tr.claim === 'largest') return k('trial.largest', { n: tr.n, d: tr.d, word });
  return k('trial.none', { d: tr.d, word });
}

/* ══════════════ مبتدئ : la table du نشاط 4 ══════════════ */

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
/** Le « tampon » d'une case acceptée : un rebond court en `transform` seulement (coupé sous reduced-motion). */
const stamp = (el) => {
  if (!el || typeof el.animate !== 'function' || reducedMotion()) return;
  el.animate([{ transform: 'scale(1.3)' }, { transform: 'scale(0.92)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
};

function GridLab({ lab, setLab, k, width, room, screenH, overhead, narrow, glanceRef, tableHRef, context, cp }) {
  // une étape = un coloriage ; FAITE quand il est complet ET que ses questions (LabCheckpoint) sont répondues
  const cur = lab.active ?? 0;
  const stepDone = lab.divisors.map((dd, i) => L.colouringComplete(lab, dd) && (i !== cur || !cp.blocking));
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  const nowDone = stepDone[cur];
  useEffect(() => {
    if (!nowDone || celebrated.current.has(cur)) return;
    celebrated.current.add(cur);
    party.celebrate({ n: cur + 1, total: lab.divisors.length });
  }, [nowDone, cur]); // eslint-disable-line react-hooks/exhaustive-deps
  const stepper = lab.divisors.length > 1 && <LabStepper count={lab.divisors.length} current={cur} done={stepDone} stepAttr="data-dc-step" />;
  const cells = L.cellsOf(lab);
  const wide = width >= WIDE_MIN;
  // TÉLÉPHONE (320 px : 238 px utiles) : le bloc « d'un seul regard » déborde symétriquement sur les cadres de la leçon,
  // jusqu'à la gouttière de l'écran (20 px), juste assez pour des cases de 40 px (le doigt) : 7 × 40 = 280 px.
  const need = lab.columns * 40;
  const bleed = !wide && width < need + 16 ? Math.min(room, Math.ceil((need + 16 - width) / 2)) : 0;
  const inner = width + 2 * bleed;
  // large : la table prend ce qu'il lui faut (cases ≤ 56 px), la colonne d'à côté le reste (≥ SIDE_W)
  const boardW = wide ? Math.min(width - SIDE_W - 12, lab.columns * 56 + 16) : inner;
  const pad = boardW - 2 * 8 >= need ? 8 : 0;
  // − 48 : la barre collante du module et une marge
  const lay = L.gridLayout({ count: cells.length, columns: lab.columns, width: boardW - 2 * pad, maxHeight: Math.max(280, screenH - overhead - 48) });
  const margin = Math.max(0, (inner - width) / 2);
  tableHRef.current = lay.height;
  const d = L.activeDivisor(lab);
  const v = lab.last;
  const [shake, setShake] = useState(null);
  const tiles = useRef(new Map());
  useEffect(() => {
    if (!v) return undefined;
    if (v.ok) { if (!v.again) stamp(tiles.current.get(v.n)); return undefined; }
    setShake(v.n);
    const id = setTimeout(() => setShake(null), 500);
    return () => clearTimeout(id);
  }, [v]);

  const complete = d != null && L.colouringComplete(lab, d);
  const allDone = L.gridDiscoveryReady(lab);
  let kind = '';
  let verdict = '';
  if (v) {
    kind = v.ok ? (v.again ? 'again' : 'ok') : 'refused';
    verdict = k(`v.grid.${kind}`, { n: v.n, d: v.d, r: v.r });
  } else if (complete) {
    kind = 'complete';
    verdict = k('v.grid.complete', { d, total: L.multiplesOf(d, lab.from, lab.to).length });
  }
  const eq = v ? L.equationText(v.n, v.d) : null;
  const instruction = d == null ? k('prompt.grid.start')
    : allDone ? k('prompt.grid.all')
      : complete ? k('prompt.grid.next')
        : k('prompt.grid.do', { d });
  const good = v?.ok || kind === 'complete';
  // étroit : le bandeau est TOUJOURS là (la consigne tant qu'aucun geste n'est jugé) — la table ne saute jamais sous le doigt
  const banner = (
    <VerdictBanner tone={kind ? (good ? 'emerald' : 'rose') : 'indigo'} icon={kind ? (good ? CheckCircle2 : XCircle) : Hand}
      size="sm"
      className={`${narrow ? 'min-h-[3rem] px-3 py-1.5' : ''} ${!kind && wide ? 'hidden' : ''}`}
      data-dc-verdict={kind} data-dc-refused={v && !v.ok ? 'remainder' : undefined}>
      {kind ? (
        <span className="block">
          {eq && <><Formula className="ml-2 text-base font-black">{eq}</Formula>{' '}</>}
          {verdict}
        </span>
      ) : <span className="font-bold">{instruction}</span>}
    </VerdictBanner>
  );

  const reveal = L.canReveal(lab) && (
    <button type="button" onClick={() => setLab(L.reveal)} aria-label={k('revealAria', { d })} data-dc-reveal
      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-indigo-200 bg-white px-3.5 text-sm font-black text-indigo-700 shadow-[0_3px_0_0_#E0E3FF] transition-all duration-150 hover:border-indigo-400 active:translate-y-0.5 active:shadow-none motion-reduce:transition-none ${ring}`}>
      <Wand2 className="h-4 w-4" aria-hidden="true" /> {k('reveal')}
    </button>
  );

  const prompt = (
    <PromptCard size={narrow ? 'md' : 'lg'}
      context={context} contextProps={{ 'data-dc-context': 'grid' }}
      aside={(stepper || reveal) ? <div className="flex flex-wrap items-center gap-2">{stepper}{reveal}</div> : null}
      title={k('question.grid', { list: lab.divisors.map((x) => iso(x)).join(k('then')) })}
      titleClassName={narrow ? 'text-base' : undefined}
      lamp={allDone ? 'on' : 'off'}
      instruction={narrow ? null : instruction}
      titleProps={{ 'data-dc-prompt': d ?? '' }}>
      <ChoiceTray cols={lab.divisors.length === 3 ? 3 : 4} data-dc-colourings>
        {lab.divisors.map((dd, i) => {
          const open = lab.active === i;
          const done = L.colouringComplete(lab, dd);
          const can = L.canOpen(lab, i);
          const tone = toneOf(dd);
          const lg = L.ledger(lab, dd);
          const look = open ? tone.open : !can ? 'border-slate-200 bg-white/70 text-slate-400' : done ? tone.done : tone.idle;
          return (
            <button key={dd} type="button" onClick={() => setLab((s) => L.openColouring(s, i))} disabled={!can || (cp.blocking && i !== cur)}
              aria-pressed={open} title={can ? undefined : k('colouring.locked', { d: lab.divisors[i - 1] })}
              aria-label={k('colouring.aria', { d: dd, colour: k(`colourName.${L.colourOf(dd)}`) })}
              data-dc-colouring={dd} data-open={open ? 'true' : 'false'} data-complete={done ? 'true' : 'false'}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl border-2 font-black transition-all duration-150 motion-reduce:transition-none disabled:cursor-not-allowed ${narrow ? 'min-h-[44px] px-1 py-1 text-sm' : 'min-h-[60px] px-2 text-lg'} ${look} ${ring}`}>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <span className={`inline-block shrink-0 rounded-full ring-2 ring-white ${narrow ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${tone.dot}`} aria-hidden="true" />
                {narrow && lab.divisors.length > 3 ? <bdi dir="ltr" className="text-xl leading-none">{dd}</bdi> : <span className={narrow ? 'text-[11px]' : ''}>{k('colouring.label', { d: dd })}</span>}
              </span>
              <span className={`inline-flex items-center gap-1 ${narrow ? 'text-[11px]' : 'text-xs'} font-extrabold opacity-90`}>
                {!can ? <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  : done ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                    : <span data-dc-progress={`${lg.count}/${lg.total}`}>{k(narrow ? 'colouring.progressShort' : 'colouring.progress', { count: lg.count, total: lg.total })}</span>}
              </span>
            </button>
          );
        })}
      </ChoiceTray>
    </PromptCard>
  );

  const fs = lay.cell >= 50 ? 'text-lg' : 'text-base';
  const inset = lay.cell >= 48 ? 3 : 2;
  const board = (
    <StageFrame className={`${pad ? 'rounded-3xl' : 'rounded-2xl'} shrink-0`} style={{ width: boardW, padding: pad }} data-dc-board>
      {/* la table : 7 colonnes, de droite à gauche (le sens de la page) ; chaque case est un bouton de la taille du doigt,
          la tuile dessinée dedans laisse un joint de 2–3 px */}
      <div role="group" aria-label={k('tableAria', { from: lab.from, to: lab.to, columns: lab.columns })}
        className="mx-auto grid"
        style={{ width: lay.width, gridTemplateColumns: `repeat(${lab.columns}, ${lay.cell}px)`, gridAutoRows: `${lay.cell}px` }}
        data-dc-table data-cell={lay.cell}>
        {cells.map((n) => {
          const inSets = lab.divisors.filter((dd) => L.isColoured(lab, dd, n));
          const here = d != null && L.isColoured(lab, d, n);
          const revealed = here && (lab.revealed[d] ?? []).includes(n);
          const tone = d != null ? toneOf(d) : null;
          const others = inSets.filter((dd) => dd !== d);
          const refused = v && !v.ok && v.n === n;
          const look = here ? (revealed ? tone.soft : tone.tile)
            : refused ? 'border-rose-300 bg-rose-50 text-rose-800 shadow-[0_3px_0_0_#FECDD3]'
              : d == null ? 'border-indigo-50 bg-white/80 text-indigo-950/70 shadow-[0_2px_0_0_#E6E8FF]'
                : 'border-indigo-100 bg-white text-indigo-950 shadow-[0_3px_0_0_#DADDFB] group-hover:-translate-y-0.5 group-hover:border-indigo-300 group-active:translate-y-0.5 group-active:shadow-none';
          return (
            <button key={n} type="button" onClick={() => setLab((s) => L.tapCell(s, n))} disabled={d == null}
              aria-label={inSets.length ? k('cellAriaIn', { n, list: inSets.join(' ، ') }) : k('cellAria', { n })}
              aria-pressed={here}
              data-dc-cell={n} data-colour={inSets.map(L.colourOf).join(' ')} data-revealed={revealed ? 'true' : undefined}
              className={`group relative outline-none disabled:cursor-default focus-visible:z-10 ${shake === n ? 'sa-manip-reject' : ''}`}>
              <span ref={(el) => { if (el) tiles.current.set(n, el); else tiles.current.delete(n); }}
                className={`absolute flex items-center justify-center rounded-xl border-2 font-black tabular-nums transition-[transform,background-color,box-shadow] duration-150 motion-reduce:transition-none group-focus-visible:ring-4 group-focus-visible:ring-indigo-300 ${fs} ${look}`}
                style={{ inset }}>
                <span dir="ltr">{n}</span>
                {others.length > 0 && (
                  <span className="pointer-events-none absolute bottom-0.5 left-0 right-0 flex justify-center gap-0.5" aria-hidden="true" data-dc-marks={others.join(' ')}>
                    {others.map((dd) => <span key={dd} className={`h-1.5 w-1.5 rounded-full ring-1 ring-white ${toneOf(dd).dot}`} />)}
                  </span>
                )}
                {refused && (
                  <span className="pointer-events-none absolute -left-1 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-black leading-none text-white ring-2 ring-white"
                    aria-hidden="true" data-dc-remainder={v.r} dir="ltr">{`+${v.r}`}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </StageFrame>
  );

  // sous 250 px : la ligne du coloriage ouvert seulement, compacte, et « أكمل » dans son en-tête (pas de rangée en plus)
  const ledger = <Ledger lab={lab} k={k} narrow={narrow} compact={narrow} only={null} action={null} />;

  return (
    <div ref={glanceRef} className={`relative space-y-2.5 ${margin > 0 ? 'z-[1] rounded-3xl bg-[#F7F7FF]' : ''}`}
      style={margin > 0 ? { marginInline: -margin } : undefined} data-dc-glance data-bleed={margin > 0 ? Math.round(margin) : undefined}>
      {party.node}
      {cp.node}
      {prompt}
      {wide ? (
        <div className="flex items-start gap-3">
          {board}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            {banner}
            {ledger}
          </div>
        </div>
      ) : (
        <>
          {banner}
          <div className="flex justify-center">{board}</div>
          {ledger}
        </>
      )}
    </div>
  );
}

/** Le registre en pilules. `only` (téléphone) : la ligne du coloriage ouvert seulement — rouvrir un coloriage fini remontre la sienne. */
function Ledger({ lab, k, narrow, compact = false, only = null, action = null }) {
  const rows = lab.divisors.filter((d) => only == null || d === only).map((d) => L.ledger(lab, d)).filter((lg) => lg.count > 0);
  return (
    <LabCard className={`${compact ? 'space-y-1.5 p-2' : narrow ? 'space-y-2 p-2.5' : 'space-y-2 p-3.5'}`} data-dc-ledger>
      <div className="flex items-center justify-between gap-2">
        <p className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'} font-black text-indigo-950`}>
          <ClipboardList className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
          <span>{k('ledger.title')}</span>
        </p>
        {action}
      </div>
      {rows.length === 0 && <p className="text-xs font-semibold text-slate-500">{k('ledger.empty')}</p>}
      {rows.map((lg) => {
        const tone = toneOf(lg.d);
        const label = (key) => <span className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-bold text-slate-600`}>{k(key)}</span>;
        return (
          <div key={lg.d} className={`rounded-2xl ${tone.band} ${compact ? 'space-y-0.5 px-1.5 py-1' : 'space-y-1 px-2 py-1.5'}`} data-dc-ledger-row={lg.d}>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
              {compact
                ? <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
                : (
                  <span className={`inline-flex items-center gap-1 text-xs font-black ${tone.text}`}>
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${tone.dot}`} aria-hidden="true" />{k('colouring.label', { d: lg.d })}
                  </span>
                )}
              {label(compact ? 'ledger.unitsShort' : 'ledger.units')}
              <Chips values={lg.units} tone={tone} small={compact} data-dc-units={lg.units.join(' ')} />
            </div>
            {lg.sums && (
              <div className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 ${compact ? 'ps-4' : ''}`}>
                {label(compact ? 'ledger.sumsShort' : 'ledger.sums')}
                <Chips values={lg.sums} tone={tone} small={compact} data-dc-sums={lg.sums.join(' ')} />
              </div>
            )}
          </div>
        );
      })}
    </LabCard>
  );
}

function Chips({ values, tone, small = false, ...rest }) {
  return (
    <span className={`inline-flex flex-wrap ${small ? 'gap-0.5' : 'gap-1'}`} dir="ltr" {...rest}>
      {values.map((x) => (
        <span key={x} className={`inline-flex items-center justify-center rounded-full border bg-white font-black tabular-nums ${small ? 'h-5 min-w-[1.25rem] px-1 text-[11px]' : 'h-6 min-w-[1.5rem] px-1.5 text-xs'} ${tone.pill}`}>{x}</span>
      ))}
    </span>
  );
}

/* ══════════════ متقدم : les cartes du تمرين 26 ══════════════ */

function CardsLab({ lab, setLab, k, width, glanceRef, context, cp }) {
  // une étape = une cible atteinte (les pastilles de cibles sont les commandes) ; fête quand ses questions sont répondues
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // « إعادة » : on refête
  const curD = lab.divisors[lab.task];
  const nowDone = L.taskDone(lab, curD) && !cp.blocking;
  useEffect(() => {
    if (!nowDone || celebrated.current.has(curD)) return;
    celebrated.current.add(curD);
    party.celebrate({ n: celebrated.current.size, total: lab.divisors.length });
  }, [nowDone, curD]); // eslint-disable-line react-hooks/exhaustive-deps
  const wide = width >= WIDE_MIN;
  const inner = width;
  const narrow = inner < 380;
  const n = L.numberOf(lab);
  const drag = useDragInteraction({
    accepts: (src, zone) => {
      if (src.startsWith('card:')) return zone.startsWith('slot:') ? true : '';
      if (src.startsWith('slot:')) {
        if (zone === 'tray') return true;
        return zone.startsWith('slot:') && zone !== src ? true : '';
      }
      return '';
    },
    onDrop: (src, zone) => {
      const a = Number(src.slice(5));
      if (src.startsWith('card:')) setLab((s) => L.placeCard(s, a, Number(zone.slice(5))));
      else if (zone === 'tray') setLab((s) => L.returnCard(s, a));
      else setLab((s) => L.moveSlot(s, a, Number(zone.slice(5))));
    },
  });

  // Toucher (ou Entrée sur) une carte POSÉE pendant qu'on en tient une autre, c'est viser sa case (un échange) ;
  // toucher une carte du plateau en tenant une carte posée, c'est la rendre au plateau.
  const targetFor = (id) => {
    const held = drag.held;
    if (!held || drag.dragging || held === id) return null;
    if (id.startsWith('slot:')) return id;
    if (id.startsWith('card:') && held.startsWith('slot:')) return 'tray';
    return null;
  };
  const intercept = (id) => ({
    onPointerDownCapture: (e) => { if (targetFor(id)) { e.stopPropagation(); e.preventDefault(); } },
    onPointerUpCapture: (e) => { if (targetFor(id)) { e.stopPropagation(); e.preventDefault(); } },
    onClickCapture: (e) => { const z = targetFor(id); if (z) { e.stopPropagation(); e.preventDefault(); drag.dropHere(z); } },
    onKeyDownCapture: (e) => { const z = targetFor(id); if (z && (e.key === 'Enter' || e.key === ' ')) { e.stopPropagation(); e.preventDefault(); drag.dropHere(z); } },
  });

  const heldDigit = (() => {
    const h = String(drag.held ?? '');
    if (h.startsWith('card:')) return lab.digits[Number(h.slice(5))];
    if (h.startsWith('slot:')) { const c = lab.slots[Number(h.slice(5))]; return c == null ? null : lab.digits[c]; }
    return null;
  })();

  const cardSize = narrow ? 'h-16 w-12 text-3xl' : 'h-[72px] w-14 text-4xl';
  const slotW = narrow ? 'w-[58px]' : 'w-[66px]';
  const slotH = narrow ? 'min-h-[72px]' : 'min-h-[82px]';
  const d = L.taskDivisor(lab);
  const card = (ci, id, extra = {}) => {
    const sp = drag.sourceProps(id);
    const ic = intercept(id);
    const digit = lab.digits[ci];
    const held = drag.held === id;
    return (
      <button key={id} type="button" {...sp} {...ic} {...extra}
        aria-label={k('cardAria', { digit })} data-dc-card={digit} data-placed={id.startsWith('slot:') ? 'true' : 'false'}
        className={`sa-manip-object relative inline-flex ${cardSize} shrink-0 select-none items-center justify-center rounded-2xl border-2 bg-gradient-to-b from-white to-[#F5F6FF] font-black tabular-nums text-indigo-950 transition-transform duration-150 motion-reduce:transition-none ${ring} ${held ? '-translate-y-1 scale-105 border-indigo-600 shadow-[0_10px_18px_-8px_rgba(79,70,229,0.75)] ring-4 ring-indigo-300' : 'border-indigo-200 shadow-[0_4px_0_0_#C7CBFF] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none'} ${drag.rejected === id ? 'sa-manip-reject' : ''}`}
        style={sp.style}>
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-2 top-1.5 h-1 rounded-full bg-indigo-100" />
        {digit}
      </button>
    );
  };

  /* ── le verdict ── */
  const v = lab.last;
  let verdict = '';
  let eq = null;
  let kind = '';
  let refused;
  if (v?.kind === 'claim') {
    kind = 'claim';
    eq = L.equationText(v.n, v.d);
    const key = v.claim === 'yes' ? (v.ok ? 'claimYesOk' : 'claimYesWrong') : (v.ok ? 'claimNoOk' : 'claimNoWrong');
    verdict = k(`v.cards.${key}`, { n: v.n, d: v.d, r: v.r });
    if (!v.ok) refused = 'claim';
  } else if (v?.kind === 'largest') {
    kind = 'largest';
    eq = L.equationText(v.n, v.d);
    verdict = k(`v.cards.${v.ok ? 'largestOk' : v.reason}`, { n: v.n, d: v.d, r: v.r, larger: v.larger });
    if (!v.ok) refused = v.reason;
  } else if (v?.kind === 'none') {
    kind = 'none';
    eq = v.exampleEq;
    verdict = k(`v.cards.${v.ok ? 'noneOk' : 'noneWrong'}`, { d: v.d, count: v.count, rs: iso((v.remainders ?? []).join(' ، ')), example: v.example });
    if (!v.ok) refused = 'none';
  } else if (v?.kind === 'change') {
    kind = 'change';
    verdict = k('v.cards.change', { from: v.from, to: v.to });
  }
  const tone = !kind ? 'indigo' : kind === 'change' ? 'indigo' : v.ok ? 'emerald' : 'rose';
  const icon = !kind ? Hand : kind === 'change' ? RefreshCw : v.ok ? CheckCircle2 : XCircle;
  const flips = lab.flips ?? {};
  const flipped = lab.divisors.filter((x) => flips[x] === 'flipped');
  const kept = lab.divisors.filter((x) => flips[x] === 'kept');

  const reach = L.reachableTargets(lab);
  const targetsDone = reach.every((x) => L.taskDone(lab, x));
  const need = L.discoveryReady(lab) ? null : targetsDone && !lab.swap ? 'swap' : lab.swap && !targetsDone ? 'targets' : null;
  const taskState = lab.tasks[d];

  const banner = (
    <VerdictBanner tone={tone} icon={icon} size="sm" className={`${narrow ? 'px-3 py-2' : ''} ${!kind ? 'hidden' : ''}`}
      data-dc-verdict={kind} data-dc-refused={refused}>
      {kind ? (
        <span className="block space-y-1">
          <span className="block">
            {eq && <><Formula className="ml-2 text-base font-black">{eq}</Formula>{' '}</>}
            {verdict}
          </span>
          {kind === 'change' && (flipped.length > 0 || kept.length > 0) && (
            <span className="flex flex-wrap gap-1.5 text-xs">
              {flipped.length > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900" data-dc-flipped={flipped.join(' ')}>{k('v.cards.flipped', { list: iso(flipped.join(' ، ')) })}</span>}
              {kept.length > 0 && <span className="rounded-full bg-white px-2 py-0.5 text-slate-700" data-dc-kept={kept.join(' ')}>{k('v.cards.kept', { list: iso(kept.join(' ، ')) })}</span>}
            </span>
          )}
        </span>
      ) : <span className="font-bold">{k('v.cards.empty')}</span>}
    </VerdictBanner>
  );
  // ce qui reste à faire pour la découverte : une consigne du GESTE (jamais la règle), dans la carte de consigne
  const needLine = need && (
    <span className="flex items-start gap-1.5 text-amber-800" data-dc-need={need}>
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{k(`need.${need}`)}</span>
    </span>
  );

  /* ── la consigne : les cibles, la phrase, les deux réponses ── */
  const tasks = (
    <div className={`flex items-center ${narrow ? 'gap-1' : 'gap-1.5'}`} role="group" aria-label={k('tasksTitle')}>
      <span className={`whitespace-nowrap ${narrow ? 'text-xs' : 'text-sm'} font-black text-indigo-900/70`} data-dc-tasks-label>{k(narrow ? 'tasksShort' : 'tasksTitle')}</span>
      {lab.divisors.map((x, i) => {
        const done = L.taskDone(lab, x);
        const sel = lab.task === i;
        return (
          <button key={x} type="button" onClick={() => setLab((s) => L.selectTask(s, i))} aria-pressed={sel} disabled={cp.blocking && !sel}
            aria-label={k('taskAria', { d: x })} data-dc-task={x} data-done={done ? 'true' : 'false'}
            className={`relative inline-flex ${narrow ? 'h-10 min-w-[40px]' : 'h-11 min-w-[44px]'} items-center justify-center gap-0.5 rounded-full border-2 px-2 text-base font-black tabular-nums transition-colors motion-reduce:transition-none ${ring} ${sel ? 'border-indigo-600 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-[0_6px_14px_-8px_rgba(79,70,229,0.9)]' : done ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-indigo-100 bg-white text-indigo-900 hover:border-indigo-300'}`}>
            <bdi dir="ltr">{x}</bdi>
            {done && <Check className={`h-3.5 w-3.5 ${sel ? '' : 'text-emerald-600'}`} strokeWidth={3} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
  const answers = (
    <div className={wide ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-2'}>
      <button type="button" onClick={() => setLab((s) => L.submitLargest(s))} disabled={n == null || !!taskState?.done}
        aria-label={n == null ? k('submit') : k('submitAria', { n, d })} data-dc-submit
        className={`inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl border-2 border-indigo-600 bg-gradient-to-b from-indigo-500 to-indigo-600 px-2 font-black text-white shadow-[0_4px_0_0_#3730A3] transition-all duration-150 hover:brightness-110 active:translate-y-0.5 active:shadow-none motion-reduce:transition-none disabled:cursor-not-allowed disabled:border-indigo-200 disabled:from-indigo-200 disabled:to-indigo-200 disabled:shadow-none ${narrow ? 'text-sm' : 'text-base'} ${ring}`}>
        <Trophy className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="whitespace-nowrap">{k('submit')}</span>
      </button>
      <button type="button" onClick={() => setLab((s) => L.sayNone(s))} disabled={!!taskState?.done}
        aria-label={k('noneAria', { d })} data-dc-none
        className={`inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-2xl border-2 border-indigo-200 bg-white px-2 font-black text-indigo-800 shadow-[0_4px_0_0_#E0E3FF] transition-all duration-150 hover:border-indigo-400 active:translate-y-0.5 active:shadow-none motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${narrow ? 'text-sm' : 'text-base'} ${ring}`}>
        <Ban className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="whitespace-nowrap">{k('none')}</span>
      </button>
    </div>
  );
  const prompt = (
    <PromptCard size={narrow ? 'md' : 'lg'}
      context={context} contextProps={{ 'data-dc-context': 'cards' }}
      aside={tasks}
      title={k('question.cards', { d })}
      lamp={taskState?.done ? 'on' : 'off'}
      titleProps={{ 'data-dc-prompt': d }} titleClassName={narrow ? 'text-base' : undefined}
      instruction={taskState?.done
        ? <span className="font-black text-emerald-700" data-dc-answer>{taskState.none ? k('answerNone') : k('answer', { n: taskState.answer })}</span>
        : needLine || null}>
      {!wide && answers}
    </PromptCard>
  );

  /* ── la scène : le cadenas à quatre fenêtres, le plateau, les ampoules ── */
  const lock = (
    <div className="flex flex-col items-center">
      {/* l'anse du cadenas, dessinée (pas sous 300 px : la hauteur manque) */}
      <svg width={150} height={24} viewBox="0 0 150 24" aria-hidden="true" className="-mb-1 block">
        <path d="M30 24 V14 A14 14 0 0 1 44 0 H106 A14 14 0 0 1 120 14 V24" fill="none" stroke="#A5B4FC" strokeWidth="9" strokeLinecap="round" />
        <path d="M30 24 V14 A14 14 0 0 1 44 0 H106 A14 14 0 0 1 120 14 V24" fill="none" stroke="#C7D2FE" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-b from-white to-[#EEF0FF] shadow-[0_6px_0_0_#C7CBFF] px-3 py-2.5">
        <div className="flex items-start gap-2" dir="ltr" data-dc-number={n ?? ''} aria-label={k('slotsTitle')} role="group">
          {lab.slots.map((ci, i) => {
            const place = k(`places.${placeIndex(i, lab.slots.length)}`);
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <DropZone drag={drag} id={`slot:${i}`} tone="indigo" minHeight={slotH}
                  label={ci == null ? k('slotAria', { i: i + 1, place }) : k('slotFullAria', { i: i + 1, place, digit: lab.digits[ci] })}
                  className={`flex ${slotW} items-center justify-center ${ci == null ? 'shadow-[inset_0_3px_6px_rgba(67,56,202,0.12)]' : !drag.held && drag.hoverZone?.id !== `slot:${i}` ? '!border-transparent !bg-transparent' : ''}`}
                  data-dc-slot={i} data-digit={ci == null ? '' : lab.digits[ci]}>
                  {ci != null && card(ci, `slot:${i}`)}
                </DropZone>
                <span className="text-[10px] font-bold leading-none text-indigo-900/60" dir="rtl" aria-hidden="true">{place}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
  const tray = (
    <DropZone drag={drag} id="tray" tone="slate" minHeight={L.trayOf(lab).length === 0 ? 'min-h-[48px]' : 'min-h-[84px]'} label={k('trayAria')}
      className="flex w-full flex-wrap items-center justify-center gap-2 !border-indigo-100 !bg-white/60 px-2 py-1.5" data-dc-tray>
      <span className="sr-only">{k('trayTitle')}</span>
      {L.trayOf(lab).length === 0
        ? <span className="px-1 text-xs font-bold text-indigo-900/50">{k('trayEmpty')}</span>
        : <span className="flex flex-wrap justify-center gap-2" dir="ltr">{L.trayOf(lab).map((ci) => card(ci, `card:${ci}`))}</span>}
    </DropZone>
  );
  const bulbs = (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
        <p className={`${narrow ? 'text-xs' : 'text-sm'} font-black text-indigo-950`}>{k('lampsTitle')}</p>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${lab.divisors.length}, minmax(0, 1fr))` }}>
        {lab.divisors.map((x) => <Lamp key={x} lab={lab} d={x} n={n} k={k} setLab={setLab} narrow={narrow} />)}
      </div>
    </div>
  );
  const stage = (
    <StageFrame className="min-w-0 flex-1 space-y-3 p-3" data-dc-stage>
      {lock}
      {tray}
      {bulbs}
    </StageFrame>
  );
  const readout = wide && (
    <LabCard className="flex flex-col gap-2.5 p-3.5" data-dc-readout>
      <p className="text-center text-base font-black text-indigo-950">{k('numberTitle')}</p>
      <div className="flex items-center justify-center rounded-2xl border border-indigo-100 bg-[#F5F6FF] px-3 py-2">
        <bdi dir="ltr" className={`font-black tabular-nums tracking-wider ${n == null ? 'text-4xl text-indigo-200' : 'text-5xl text-indigo-900'}`}>
          {n ?? lab.slots.map((ci) => (ci == null ? '_' : lab.digits[ci])).join('')}
        </bdi>
      </div>
      {answers}
      {/* l'indice du geste, tant que le nombre n'est pas formé */}
      {n == null && <p className="flex items-center gap-2 rounded-2xl bg-[#F5F6FF] px-2.5 py-2 text-xs font-bold leading-snug text-slate-600">
        <Move className="h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
        <span>{k('dragHint')}</span>
      </p>}
    </LabCard>
  );

  return (
    <div ref={glanceRef} className="relative space-y-2.5" data-dc-glance>
      {party.node}
      {cp.node}
      {prompt}
      {wide ? (
        <div className="flex items-start gap-3">
          {stage}
          <div className="flex shrink-0 flex-col gap-2.5" style={{ width: SIDE_W }}>
            {readout}
            {banner}
          </div>
        </div>
      ) : (
        <>
          {/* étroit : sous la scène — un verdict qui apparaît ne déplace jamais le cadenas sous le doigt */}
          {stage}
          {banner}
        </>
      )}
      <DragGhost ghost={drag.ghost}>
        {heldDigit != null && (
          <span className={`inline-flex ${cardSize} items-center justify-center rounded-2xl border-2 border-indigo-500 bg-white font-black text-indigo-950`}>{heldDigit}</span>
        )}
      </DragGhost>
    </div>
  );
}

/** L'indice du nom de rang (الآلاف … الآحاد) de la case i sur `len` cases. */
const placeIndex = (i, len) => Math.max(0, 4 - (len - i));

function Lamp({ lab, d, n, k, setLab, narrow }) {
  const st = L.lampState(lab, d);
  const flip = lab.flips?.[d];
  const claimBtn = 'inline-flex min-h-[44px] w-full items-center justify-center gap-0.5 whitespace-nowrap rounded-xl border-2 bg-white px-0.5 font-black transition-all duration-150 active:translate-y-0.5 active:shadow-none motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none';
  return (
    <div className={`relative flex min-w-0 flex-col items-center gap-1 rounded-2xl border-2 px-0.5 pb-1 pt-1.5 text-center transition-colors duration-300 motion-reduce:transition-none ${st === 'yes' ? 'border-amber-300 bg-amber-50' : st === 'no' ? 'border-slate-200 bg-slate-50' : 'border-indigo-100 bg-white/80'} ${flip === 'flipped' ? 'ring-4 ring-amber-300' : ''}`}
      role="group" aria-label={k(`lampAria.${st}`, { d })} data-dc-lamp={d} data-state={st} data-flip={flip ?? undefined}>
      {flip && (
        <span className={`absolute -top-3 left-1/2 z-[1] -translate-x-1/2 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ring-2 ring-white ${flip === 'flipped' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'}`}
          data-dc-flip-badge={flip}>{k(`lampFlip.${flip}`)}</span>
      )}
      <BulbFigure state={st} label={d} size={narrow ? 36 : 44} />
      {st === 'closed' ? (
        <div className="flex w-full flex-col gap-1">
          <button type="button" onClick={() => setLab((s) => L.claim(s, d, true))} disabled={n == null}
            aria-label={n == null ? k('claimNeedNumber') : k('claimYesAria', { n, d })} data-dc-claim={d} data-claim="yes"
            className={`${claimBtn} border-emerald-300 text-emerald-800 shadow-[0_3px_0_0_#A7F3D0] hover:border-emerald-500 ${narrow ? 'text-[11px]' : 'text-xs'} ${ring}`}>
            <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} aria-hidden="true" /><span dir="rtl" className={narrow ? 'text-[10px]' : ''}>{k('claimYes')}</span>
          </button>
          <button type="button" onClick={() => setLab((s) => L.claim(s, d, false))} disabled={n == null}
            aria-label={n == null ? k('claimNeedNumber') : k('claimNoAria', { n, d })} data-dc-claim={d} data-claim="no"
            className={`${claimBtn} border-slate-200 text-slate-700 shadow-[0_3px_0_0_#E2E8F0] hover:border-slate-400 ${narrow ? 'text-[11px]' : 'text-xs'} ${ring}`}>
            <X className="h-3.5 w-3.5 shrink-0" strokeWidth={3} aria-hidden="true" /><span dir="rtl" className={narrow ? 'text-[10px]' : ''}>{k('claimNo')}</span>
          </button>
        </div>
      ) : (
        <span className={`inline-flex min-h-[28px] items-center justify-center whitespace-nowrap rounded-full px-1.5 ${narrow ? 'text-[10px]' : 'text-xs'} font-black leading-tight ${st === 'yes' ? 'bg-amber-400 text-amber-950' : st === 'no' ? 'bg-slate-200 text-slate-700' : 'text-slate-500'}`} dir="rtl">
          {k(`lampState.${st}`)}
        </span>
      )}
    </div>
  );
}

/* ══════════════ La règle (après la découverte) ══════════════ */

function Formal({ lab, k }) {
  const line = (text, key, formula) => (
    <li key={key} className="space-y-0.5" data-dc-rule={key}>
      <p>{text}</p>
      {formula && <p className="flex flex-wrap justify-center gap-x-4 text-indigo-950">{formula}</p>}
    </li>
  );
  if (lab.mode === 'grid') {
    // les exemples viennent des cases de l'élève (sinon de la table)
    const pick = (d, test) => [...(lab.found[d] ?? []), ...(lab.revealed[d] ?? [])].filter(test).at(-1) ?? L.multiplesOf(d, lab.from, lab.to).filter(test).at(-1);
    const e3 = pick(3, (x) => x >= 10);
    return (
      <div className="space-y-2 text-sm font-bold text-emerald-950" data-dc-formal>
        <p>{k('formal.def')}</p>
        <p className="flex justify-center"><Formula className="font-extrabold text-indigo-950">{L.equationWithRemainder(e3, 3)}</Formula></p>
        <ul className="space-y-1.5">
          {lab.divisors.map((d) => line(k(`formal.rule${d}`), d, d === 3 && e3 != null ? <Formula>{`${L.digitsOf(e3).join(' + ')} = ${L.digitSum(e3)}`}</Formula> : null))}
        </ul>
      </div>
    );
  }
  const ex = lab.tasks[2]?.answer ?? L.validArrangements(lab.digits, 2).at(-1) ?? L.arrangements(lab.digits).at(-1);
  const hi = Math.floor(ex / 100);
  const lo = ex - hi * 100;
  const order = [2, 5, 3, 9, 4].filter((d) => lab.divisors.includes(d));
  return (
    <div className="space-y-2 text-sm font-bold text-emerald-950" data-dc-formal>
      <p>{k('formal.def')}</p>
      <p className="flex justify-center"><Formula className="font-extrabold text-indigo-950">{L.equationWithRemainder(ex, 2)}</Formula></p>
      <ul className="space-y-1.5">
        {order.map((d) => {
          if (d === 3 || d === 9) {
            return line(k(`formal.rule${d}`), d, (
              <>
                <Formula>{`${L.digitsOf(ex).join(' + ')} = ${L.digitSum(ex)}`}</Formula>
                <Formula>{L.equationText(L.digitSum(ex), d)}</Formula>
              </>
            ));
          }
          if (d === 4) {
            return line(k('formal.rule4'), d, (
              <>
                <span className="text-xs text-slate-700">{k('formal.why4')}</span>
                <Formula>{`${ex} = ${hi} × 100 + ${lo}`}</Formula>
                <Formula>100 = 4 × 25</Formula>
                <Formula>{L.equationText(lo, 4)}</Formula>
              </>
            ));
          }
          return line(k(`formal.rule${d}`), d, null);
        })}
      </ul>
    </div>
  );
}

/** La découverte : les conjectures fausses réfutées par les cases / les nombres de l'élève (aussi la dernière question du labo). */
export function discoveryOptionsOf(lab, k) {
  const m = lab.mode;
  if (m === 'grid') {
    const col = L.columnRefutation(lab);
    const un = L.unitsRefutation(lab);
    return [
      { text: k('discovery.column'), why: col ? k('discovery.whyColumn', { ...col, eq: iso(L.equationText(col.n, col.d)) }) : k('discovery.whyGeneric') },
      { text: k('discovery.right.grid'), correct: true },
      { text: k('discovery.units3'), why: un ? k('discovery.whyUnits3', { ...un, eq: iso(L.equationText(un.n, un.d)) }) : k('discovery.whyGeneric') },
    ];
  }
  const ans2 = lab.tasks[2]?.answer;
  const even = ans2 != null && L.division(ans2, 4).r !== 0 ? ans2 : null;
  const sw = lab.swap;
  const sumWhy = sw
    ? k('discovery.whySum2', {
      a: sw.from, b: sw.to, s: L.digitSum(sw.from),
      even: L.division(sw.from, 2).divides ? sw.from : sw.to, odd: L.division(sw.from, 2).divides ? sw.to : sw.from,
    })
    : k('discovery.whyGeneric');
  return [
    { text: k('discovery.even4'), why: even != null ? k('discovery.whyEven4', { n: even, eq: iso(L.equationText(even, 4)), r: L.division(even, 4).r }) : k('discovery.whyGeneric') },
    { text: k('discovery.right.cards'), correct: true },
    { text: k('discovery.sum2'), why: sumWhy },
  ];
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/**
 * L'étape dont la suite de questions est en jeu : table — le coloriage ouvert (atteinte quand il est complet) ; cartes — la cible
 * affichée (atteinte quand elle est faite), ou l'échange retenu dès qu'il existe et que sa suite n'a pas encore été posée.
 * `doneIds` : les suites déjà finies (événements `checkpoint-done`).
 */
export function stepOf(lab, doneIds = []) {
  if (lab.mode === 'grid') {
    if (lab.active == null) return null;
    const d = lab.divisors[lab.active];
    return { id: `g${d}`, key: d, kind: 'grid', d, reached: L.colouringComplete(lab, d) };
  }
  const d = lab.divisors[lab.task];
  const target = { id: `c${d}`, key: d, kind: 'target', d, reached: L.taskDone(lab, d) };
  const targetPending = target.reached && !doneIds.includes(target.id);
  if (lab.swap && !doneIds.includes('swap') && !targetPending) return { id: 'swap', key: 'swap', kind: 'swap', reached: true };
  return target;
}

/** La suite d'une étape ; celle qui rend la découverte prête finit par la règle. */
export function chainOf(lab, step) {
  let out;
  if (step.kind === 'grid') out = step.d === 2 ? ['units', 'column'] : step.d === 5 ? ['units', 'next'] : ['unitsNo', 'sum'];
  else if (step.kind === 'swap') out = ['swap', 'swapSum'];
  else if (lab.tasks[step.d]?.none) out = step.d === 4 ? ['noneWhy', 'even4'] : ['noneWhy', 'cardSum'];
  else out = step.d === 3 || step.d === 9 ? ['cardSum', 'anyOrder'] : ['largest', 'flip'];
  return L.discoveryReady(lab) ? [...out, 'rule'] : out;
}

const C = (k, key, o) => k(`cp.${key}`, o);
const pick = (list, right, whys) => list.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
const list = (xs) => iso(xs.join(' ، '));
const ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const UNITS = { 2: [0, 2, 4, 6, 8], 5: [0, 5] };
/** Les nombres des cartes après échange des deux derniers chiffres. */
const swapLast = (n) => { const t = String(n); return Number(t.slice(0, -2) + t.at(-1) + t.at(-2)); };
/** Un autre rangement des cartes (le plus petit qui diffère de n). */
const otherOrder = (lab, n) => L.arrangements(lab.digits).find((x) => x !== n);

/** Chaque question est construite sur LES cases / LES cartes de l'élève (rien en dur). */
export const QUESTIONS = {
  units: (lab, step, k) => {
    const d = step.d;
    const lg = L.ledger(lab, d);
    const other = d === 2 ? UNITS[5] : UNITS[2];
    const o = { d: iso(d), units: list(lg.units), other: list(other), last: iso(L.colouredIn(lab, d).at(-1)) };
    return {
      id: 'units', kind: 'choice', prompt: C(k, 'units.prompt', o),
      options: pick([list(lg.units), list(ALL), list(other)], 0, [null, C(k, 'units.whyAll', o), C(k, 'units.whyOther', o)]),
      hints: [C(k, 'units.hint1', o), C(k, 'units.hint2', o)], explain: C(k, 'units.explain', o),
    };
  },
  column: (lab, step, k) => {
    const d = step.d;
    const ref = L.columnRefutation({ ...lab, divisors: [d] }) ?? { m: d * 2, n: d * 2 + lab.columns, col: 1 };
    const div = L.division(ref.n, d);
    const o = { d: iso(d), m: iso(ref.m), n: iso(ref.n), eq: iso(L.equationWithRemainder(ref.n, d)), u: iso(L.unitsDigit(ref.n)), r: iso(div.r) };
    return {
      id: 'column', kind: 'choice', prompt: C(k, 'column.prompt', o),
      options: pick([C(k, 'column.right', o), C(k, 'column.same'), C(k, 'column.both', o)], 0, [null, C(k, 'column.whySame', o), C(k, 'column.whyBoth', o)]),
      hints: [C(k, 'column.hint1', o), C(k, 'column.hint2', o)], explain: C(k, 'column.explain', o),
    };
  },
  next: (lab, step, k) => {
    const d = step.d;
    const last = L.colouredIn(lab, d).at(-1);
    const o = { d: iso(d), last: iso(last), to: iso(lab.to), n: iso(last + d) };
    return {
      id: 'next', kind: 'number', expected: String(last + d), answer: <bdi dir="ltr">{last + d}</bdi>,
      prompt: C(k, 'next.prompt', o), hints: [C(k, 'next.hint1', o), C(k, 'next.hint2', o)], explain: C(k, 'next.explain', o),
    };
  },
  unitsNo: (lab, step, k) => {
    const d = step.d;
    const ref = L.unitsRefutation(lab, d) ?? { m: d * 4, n: d * 4 + 10, u: L.unitsDigit(d * 4) };
    const o = { d: iso(d), m: iso(ref.m), n: iso(ref.n), u: iso(ref.u), eq: iso(L.equationWithRemainder(ref.n, d)) };
    return {
      id: 'unitsNo', kind: 'choice', prompt: C(k, 'unitsNo.prompt', o),
      options: pick([C(k, 'unitsNo.right', o), C(k, 'unitsNo.both', o), C(k, 'unitsNo.neither', o)], 0, [null, C(k, 'unitsNo.whyBoth', o), C(k, 'unitsNo.whyNeither', o)]),
      hints: [C(k, 'unitsNo.hint1', o), C(k, 'unitsNo.hint2', o)], explain: C(k, 'unitsNo.explain', o),
    };
  },
  sum: (lab, step, k) => {
    const d = step.d;
    const m = L.colouredIn(lab, d).filter((x) => x >= 10).at(-1) ?? L.colouredIn(lab, d).at(-1);
    const sm = L.digitSum(m);
    const o = { d: iso(d), m: iso(m), s: iso(sm), calc: iso(`${L.digitsOf(m).join(' + ')} = ${sm}`) };
    return {
      id: 'sum', kind: 'number', expected: String(sm), answer: <bdi dir="ltr">{sm}</bdi>,
      prompt: C(k, 'sum.prompt', o), hints: [C(k, 'sum.hint1', o), C(k, 'sum.hint2', o)], explain: C(k, 'sum.explain', o),
    };
  },
  largest: (lab, step, k) => {
    const d = step.d;
    const n = lab.tasks[d].answer;
    const o = { d: iso(d), n: iso(n), u: iso(L.unitsDigit(n)), s: iso(L.digitSum(n)), first: iso(L.digitsOf(n)[0]) };
    return {
      id: 'largest', kind: 'choice', prompt: C(k, 'largest.prompt', o),
      options: pick([C(k, `largest.right${d === 4 ? '4' : ''}`, { ...o, two: iso(n % 100) }), C(k, 'largest.sum', o), C(k, 'largest.first', o)], 0,
        [null, C(k, 'largest.whySum', o), C(k, 'largest.whyFirst', o)]),
      hints: [C(k, 'largest.hint1', o), C(k, 'largest.hint2', o)], explain: C(k, 'largest.explain', o),
    };
  },
  flip: (lab, step, k) => {
    const d = step.d;
    const n = lab.tasks[d].answer;
    const m = swapLast(n);
    const yes = L.division(m, d).divides;
    const o = { d: iso(d), n: iso(n), m: iso(m), eq: iso(yes ? L.equationText(m, d) : L.equationWithRemainder(m, d)), u: iso(L.unitsDigit(m)) };
    return {
      id: 'flip', kind: 'choice', prompt: C(k, 'flip.prompt', o),
      options: pick([C(k, yes ? 'flip.yes' : 'flip.no', o), C(k, yes ? 'flip.no' : 'flip.yes', o), C(k, 'flip.divide')], 0,
        [null, C(k, 'flip.whyWrong', o), C(k, 'flip.whyDivide', o)]),
      hints: [C(k, 'flip.hint1', o), C(k, 'flip.hint2', o)], explain: C(k, 'flip.explain', o),
    };
  },
  cardSum: (lab, step, k) => {
    const sm = lab.digits.reduce((a, b) => a + b, 0);
    const o = { d: iso(step.d), digits: list(lab.digits), s: iso(sm), calc: iso(`${lab.digits.join(' + ')} = ${sm}`) };
    return {
      id: 'cardSum', kind: 'number', expected: String(sm), answer: <bdi dir="ltr">{sm}</bdi>,
      prompt: C(k, 'cardSum.prompt', o), hints: [C(k, 'cardSum.hint1'), C(k, 'cardSum.hint2', o)], explain: C(k, `cardSum.explain${L.division(sm, step.d).divides ? 'Yes' : 'No'}`, o),
    };
  },
  anyOrder: (lab, step, k) => {
    const d = step.d;
    const n = lab.tasks[d].answer;
    const other = otherOrder(lab, n);
    const o = { d: iso(d), n: iso(n), other: iso(other), s: iso(L.digitSum(other)) };
    return {
      id: 'anyOrder', kind: 'choice', prompt: C(k, 'anyOrder.prompt', o),
      options: pick([C(k, 'anyOrder.right', o), C(k, 'anyOrder.no'), C(k, 'anyOrder.divide')], 0, [null, C(k, 'anyOrder.whyNo', o), C(k, 'anyOrder.whyDivide', o)]),
      hints: [C(k, 'anyOrder.hint1', o), C(k, 'anyOrder.hint2', o)], explain: C(k, 'anyOrder.explain', o),
    };
  },
  noneWhy: (lab, step, k) => {
    const d = step.d;
    const sm = lab.digits.reduce((a, b) => a + b, 0);
    const o = { d: iso(d), s: iso(sm), count: iso(L.arrangements(lab.digits).length) };
    return {
      id: 'noneWhy', kind: 'choice', prompt: C(k, 'noneWhy.prompt', o),
      options: pick([C(k, `noneWhy.right${d === 4 ? '4' : '9'}`, o), C(k, 'noneWhy.tried'), C(k, 'noneWhy.big', o)], 0, [null, C(k, 'noneWhy.whyTried', o), C(k, 'noneWhy.whyBig', o)]),
      hints: [C(k, `noneWhy.hint1_${d === 4 ? '4' : '9'}`, o), C(k, 'noneWhy.hint2', o)], explain: C(k, `noneWhy.explain${d === 4 ? '4' : '9'}`, o),
    };
  },
  even4: (lab, step, k) => {
    const n = L.validArrangements(lab.digits, 2).at(-1) ?? L.arrangements(lab.digits).at(-1);
    const o = { n: iso(n), two: iso(n % 100), eq: iso(L.equationWithRemainder(n % 100, 4)) };
    return {
      id: 'even4', kind: 'choice', prompt: C(k, 'even4.prompt', o),
      options: pick([C(k, 'even4.right', o), C(k, 'even4.even'), C(k, 'even4.big')], 0, [null, C(k, 'even4.whyEven', o), C(k, 'even4.whyBig')]),
      hints: [C(k, 'even4.hint1'), C(k, 'even4.hint2', o)], explain: C(k, 'even4.explain', o),
    };
  },
  swap: (lab, step, k) => {
    const { from, to } = lab.swap;
    const o = { a: iso(from), b: iso(to), s: iso(L.digitSum(from)) };
    return {
      id: 'swap', kind: 'choice', prompt: C(k, 'swap.prompt', o),
      options: pick([C(k, 'swap.right'), C(k, 'swap.luck'), C(k, 'swap.never')], 0, [null, C(k, 'swap.whyLuck', o), C(k, 'swap.whyNever')]),
      hints: [C(k, 'swap.hint1', o), C(k, 'swap.hint2', o)], explain: C(k, 'swap.explain', o),
    };
  },
  swapSum: (lab, step, k) => {
    const { from, to } = lab.swap;
    const sm = L.digitSum(to);
    const o = { a: iso(from), b: iso(to), s: iso(sm) };
    return {
      id: 'swapSum', kind: 'number', expected: String(sm), answer: <bdi dir="ltr">{sm}</bdi>,
      prompt: C(k, 'swapSum.prompt', o), hints: [C(k, 'swapSum.hint1'), C(k, 'swapSum.hint2', o)], explain: C(k, 'swapSum.explain', o),
    };
  },
  rule: (lab, step, k) => ({
    id: 'rule', kind: 'choice', prompt: k(`discovery.prompt.${lab.mode}`), options: discoveryOptionsOf(lab, k),
    hints: [C(k, `rule.${lab.mode}.hint1`), C(k, `rule.${lab.mode}.hint2`)], explain: <Formal lab={lab} k={k} />,
  }),
};
