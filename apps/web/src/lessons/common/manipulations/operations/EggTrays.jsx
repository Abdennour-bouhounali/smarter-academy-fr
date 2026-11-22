import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Egg as EggIcon, Lock, Hand, CheckCircle2, XCircle, Target, PackagePlus, ThumbsUp, ThumbsDown } from 'lucide-react';
import MathText from '../../components/MathText';
import { resolveLevelId } from '@smarter-academy/core/curriculum/manipulationLevels.js';
import { divmod } from '@smarter-academy/core/arithmetic/divisibility.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useStretchInteraction from '../useStretchInteraction';
import LabFold from '../primitives/LabFold';
import DivisionRoles from '../primitives/DivisionRoles';
import KidFigure from '../primitives/KidFigure';
import { LabCard, StageFrame, PromptCard, RoundButton, VerdictBanner, ChoiceCard } from '../primitives/LabKit';
import { SvgPill, pillWidth } from '../primitives/SvgPill';
import { Egg, TrayBody, CartonLid, FullTraySlat, Pallet } from '../primitives/EggFigure';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import { LEVELS } from '../levels';
import * as L from '../logic/eggTrays';

/**
 * egg-trays — LE TAPIS ET LA RÈGLE DES PLATEAUX (2AM, unité 2 « الكسور والعمليات عليها », درس « القسمة الإقليدية وحصر
 * حاصل القسمة », manuel نشاط 1 p. 24 et معارف 1 p. 26). La logique, entière et exacte, est dans `logic/eggTrays.js`
 * (divmod du core, importé par chemin) ; les dessins (œuf, boîte, plateau, palette) dans `primitives/EggFigure.jsx`.
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. b est DONNÉ (12 œufs par علبة, 30 par صفيحة) ; l'élève TIENT a, les œufs qui passent du tapis dans les plateaux :
 *    il tire le MANCHE du tapis (glisser, toucher le tapis, flèches ±1 œuf, Page ±b, boutons ±1 œuf / ±1 plateau / ±10
 *    plateaux). Avant, il POSE un cadre d'une graduation sur la règle des plateaux (glisser, toucher, flèches, −/+) : son
 *    pari sur l'endroit où tombera a ÷ b. Aucun labo de division ne tient le dividende (DNA §12).
 * B. a ÷ b est un NOMBRE de la règle des plateaux, en q + r/b : strictement entre q (plateaux pleins, valeur approchée par
 *    défaut) et q + 1 (plateaux nécessaires, par excès), et SUR une graduation si et seulement si r = 0 (b يقسم a).
 * C. Pendant le geste : les plateaux pleins se ferment (un « tampon »), dix plateaux se lient en palette (متقدم : la valeur
 *    de position de q se VOIT), le plateau ouvert garde r œufs dans ses cases, le repère glisse sur la règle juste sous le
 *    manche (le fil à plomb : c'est LA MÊME ligne, lue ÷ b), et le zoom agrandit [q ; q + 1] = le plateau ouvert, rempli
 *    à r/b. Le tapis ne dépasse pas la commande (la butée tremble). À la commande pleine le cadre est JUGÉ.
 * D. 50 = 12 × 4 + 2 avec 2 < 12, puis 4 < 50/12 < 5 et ses deux bouts nommés (بالنقصان / بالزيادة), puis 60/12 = 5 ⇒
 *    « 12 يقسم 60 »… ; متقدم : 2145, 30, 71, 15, 72, 2160 et la ligne du fils barrée.
 * E. Avant la règle : un cadre JUSTE sur la commande du jour, la commande du contraste atterrie SUR une graduation (« يقع
 *    على عدد طبيعي », un cadre y est jugé `onMark`), et (متقدم) la division du fils jugée. Les conjectures fausses sont
 *    réfutées avec SES nombres (50 est pair ; un pair qu'il a fait passer, 2140 = 30 × 71 + 10).
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        a ÷ b est un nombre entre deux entiers consécutifs (le حصر), et sur un entier ⇔ r = 0 — pour tout b
 *   OBJECT         le manche du tapis d'œufs ; le cadre sur la règle des plateaux
 *   VARIABLE       a, les œufs emballés (0 … la commande) ; n, le cadre [n ; n + 1]
 *   INVARIANT      b ; un plateau fermé a b œufs ; le plateau ouvert en a r < b ; emballés + tapis = la commande
 *   TRANSFORMATION les plateaux se ferment, les palettes se lient, le repère avance de 1/b par œuf
 *   CONSTRAINT     un plateau se FERME tout seul à b : il ne tient jamais b œufs ouverts
 *   RESISTANCE     la fermeture à b (« 45 œufs » du fils remplissent un plateau et en laissent 15) ; la butée de la commande ;
 *                  le cadre verrouillé pendant le remplissage (un pari ne se corrige pas en regardant)
 *   EVIDENCE       le repère dans / hors du cadre, l'écart en plateaux ; le zoom = le plateau ouvert
 *   CONTRAST       2145 (entre 71 et 72) puis 2160 (SUR 72) ; 50 puis 60 en مبتدئ
 *   PREDICTION     le cadre posé AVANT le premier œuf (le tapis est fermé tant qu'il ne l'est pas) ; ses modèles below /
 *                  above / remainder / onMark lisent l'erreur
 *   DISCOVERY      « عندما لا تبقى علبة مفتوحة: الباقي معدوم » ; les bouts du cadre = plateaux pleins / plateaux nécessaires
 *   FORMALIZATION  a = b × q + r, 0 ≤ r < b ; q < a/b < q + 1 (بالنقصان / بالزيادة) ; a/b = q ⇔ b يقسم a
 *   TRANSFER       kasr-hasil-qisma (valeurs approchées, leçon suivante), les مسائل et la banque
 *
 * « جرّب كل الإمكانيات » (§6bis) : NON — chaque cadre et chaque avis sur le camarade EST une réponse ; pas d'auto-complétion
 * (les boutons ±1 / ±b / ±10b SONT la division à la main : palettes, puis plateaux, puis œufs). Ce n'est pas `division-jumps`
 * (la main y tient q, le reste se lit après coup ; ici elle tient a, le plateau se ferme tout seul et la question est OÙ
 * tombe le quotient sur une règle), ni le team-builder ni l'étagère (b n'est pas choisi).
 *
 * LE KIT (§8ter) : `PromptCard` (puce « أين يقع الحاصل؟ », la commande — `[data-et-order]` —, sa lampe allumée par un verdict
 * juste, les pilules de lecture vivante) ; la scène dans un `StageFrame` (mur de planches, tapis à rouleaux, la butée de la
 * commande, la règle des plateaux, le zoom, l'enfant : Salma en hijab — `scarf="mint"` — en مبتدئ, le fils du fermier en
 * متقدم) ; large (≥ 600 px) : la carte de commande à côté (le cadre AVANT et APRÈS le remplissage, les œufs PENDANT : un seul
 * panneau à la fois) ; étroit : ses paires −/+ DANS la scène (une bande en bas, de hauteur fixe par monde), le verdict
 * dessous garde sa place (la consigne s'y lit). Une seule phrase de geste par phase (DNA §17.7), indices fermés.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-et-glance]` = consigne + scène + commandes + verdict + cartes ; la scène est budgétée
 * sur l'écran de leçon (`useLessonViewport`) moins la consigne et ce qui suit (mesurés, jamais la scène) : le ZOOM cède sa
 * hauteur (110 → 34 px), le reste est fixe. La liste des essais est dans un `LabFold`.
 *
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater) : `logic/eggTrays.js › coachOf` montre, dans l'ordre, la poignée du
 * cadre (avant le premier œuf), le manche du tapis, le bouton « يقع على عدد طبيعي » (commande pleine), la carte « بيض إضافي » puis la
 * carte du camarade — la COMMANDE, jamais le nombre de plateaux, le reste ni l'avis juste.
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 1, 2026-10-28) : `checkpoints` (défaut true). Les ÉTAPES sont
 * la commande du jour, le contraste, le camarade (`L.stepIds`) ; après chacune, une suite sur ce que l'élève vient de FAIRE, avec SES nombres
 * (`CHAINS`) : order le reste de la boîte ouverte · l'écriture a = b × q + r · le حصر ; then le reste · où tombe le quotient ; claim ce qui
 * cloche · le vrai reste ; la dernière finit par LA RÈGLE (l'ancienne découverte, qui formalise). « بيض إضافي » et le camarade attendent les
 * questions. Obligatoires pour tout élève ; l'enseignant seul les coupe (`useLabCheckpointSettings`) ; `guided` cache جرّب › اكتشف › صِغ et تلميح.
 * ÉTAPES `LabStepper` (`[data-et-stepper-step=<i>]`) + la fête ; « إعادة » repart de la commande du jour ; « أعِد التجربة » : `L.retryStep`.
 * SON (`playSfx`) : `tooth` par œuf (plus grave en arrière), `bell` quand une boîte se ferme, `flag` un cadre / un avis juste, `over` faux.
 * CONTRAT DOM : [data-egg-trays][data-world][data-a][data-b][data-count][data-solved][data-layout], [data-et-glance],
 * [data-et-order], [data-et-handle] (slider, aria-valuenow = œufs), [data-et-step=egg|tray|pallet][data-dir=less|more],
 * [data-et-frame-step=1|10][data-dir], [data-et-tray=<i>][data-full], [data-et-pallet=<i>], [data-et-open][data-eggs],
 * [data-et-belt-egg=<i>], [data-et-ruler], [data-et-marker][data-q][data-r] (dès le premier œuf), [data-et-zoom],
 * [data-et-frame][data-n][data-state=idle|right|wrong][data-placed][data-locked], [data-et-frame-handle], [data-et-exact],
 * [data-et-next] / [data-et-next-button], [data-et-claim][data-verdict=agree|disagree], [data-et-claim-answer=agree|disagree],
 * [data-et-verdict=<kind>], [data-et-formal], [data-et-ends], [data-lab-fold=egg-trays.trials].
 */
const NS = 'manipulation.eggTrays';
const WIDE_MIN = 600;
const SIDE_W = 226;
/** Un îlot LTR dans une phrase RTL (« 2145 ÷ 30 » ne doit jamais se lire « 30 ÷ 2145 »). */
const iso = (s) => `⁦${s}⁩`;
const MOTION_CSS = '@keyframes et-stamp{0%{transform:translateY(-7px) scale(1.12)}60%{transform:translateY(1px) scale(.97)}100%{transform:none}}'
  + '@keyframes et-tie{from{stroke-dashoffset:60;opacity:.2}to{stroke-dashoffset:0;opacity:1}}'
  + '@keyframes et-bump{0%,100%{transform:none}25%{transform:translateX(3px)}75%{transform:translateX(-3px)}}'
  + '@keyframes et-pop{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}'
  + '.et-stamp{transform-box:fill-box;transform-origin:50% 100%;animation:et-stamp .32s cubic-bezier(.34,1.56,.64,1) both}'
  + '.et-tie{stroke-dasharray:60;animation:et-tie .45s ease-out both}'
  + '.et-bump{transform-box:fill-box;animation:et-bump .3s ease-in-out 2}'
  + '.et-pop{transform-box:fill-box;transform-origin:50% 50%;animation:et-pop .35s cubic-bezier(.34,1.56,.64,1) both}'
  + '@media (prefers-reduced-motion: reduce){.et-stamp,.et-tie,.et-bump,.et-pop{animation:none}}';

/**
 * Un texte arabe qui porte des îlots LTR (« \u206650 ÷ 12\u2069 ») : chaque îlot devient un VRAI `<bdi dir="ltr">`, sans compter sur les
 * caractères de contrôle (un copier-coller ou un moteur de rendu qui les ignore inverserait « 50 ÷ 12 » en « 12 ÷ 50 »).
 */
function rich(text) {
  return String(text).split(/(\u2066[^\u2069]*\u2069)/).map((part, i) => (part.startsWith('\u2066')
    ? <bdi key={i} dir="ltr" className="whitespace-nowrap" style={{ unicodeBidi: 'isolate' }}>{part.slice(1, -1)}</bdi>
    : part));
}

/** Le cadre « n – n+1 » : deux nombres dans UNE rangée LTR, jamais réordonnée. */
function FrameRange({ n, className = '' }) {
  return (
    <bdi dir="ltr" className={`inline-flex items-baseline gap-1.5 font-black tabular-nums ${className}`} style={{ unicodeBidi: 'isolate' }} data-et-range={`${n}-${n + 1}`}>
      <span>{n}</span><span aria-hidden="true">–</span><span>{n + 1}</span>
    </bdi>
  );
}

/** Une formule : UN îlot LTR dont les morceaux sont insécables (le idiome de division-jumps). */
function Formula({ pieces, className = '', ...rest }) {
  return (
    <bdi dir="ltr" className={`inline-flex flex-wrap justify-center gap-x-1.5 font-mono ${className}`} {...rest}>
      {pieces.map((p, i) => <span key={i} className="whitespace-nowrap">{p}</span>)}
    </bdi>
  );
}

/** Une vraie fraction a/b (empilée), en îlot LTR. */
function Frac({ n, d }) {
  return (
    <span className="mx-0.5 inline-flex flex-col items-center align-middle font-mono leading-none" dir="ltr">
      <span className="px-0.5 pb-0.5">{n}</span>
      <span className="w-full border-t-2 border-current px-0.5 pt-0.5">{d}</span>
    </span>
  );
}

/** Une pilule de lecture vivante : ce que la main a produit, jamais la réponse. */
function StatPill({ label, value, tone = 'indigo', small = false, ...rest }) {
  const tones = { indigo: 'border-indigo-100 bg-white text-indigo-900', amber: 'border-amber-200 bg-amber-50 text-amber-900' };
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border font-bold ${small ? 'gap-1 px-2 text-[11px]' : 'gap-1.5 px-2.5 py-0.5 text-xs'} ${tones[tone] ?? tones.indigo}`} {...rest}>
      {label}
      <bdi dir="ltr" className={`font-mono font-black tabular-nums ${small ? 'text-sm' : 'text-base'}`}>{value}</bdi>
    </span>
  );
}

/** Une paire −/+ avec son unité au milieu (un pas de la division à la main). */
function Pair({ label, onLess, onMore, lessDisabled, moreDisabled, lessLabel, moreLabel, size = 44, wideLabel = false, stacked = false, lessProps = {}, moreProps = {} }) {
  if (stacked) {
    // étroit : le libellé AU-DESSUS de ses deux boutons (il dit ce que la paire ajoute ou retire)
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="whitespace-nowrap text-[10.5px] font-extrabold leading-none text-indigo-900">{label}</span>
        <div className="flex items-center gap-1" dir="ltr">
          <RoundButton size={size} onClick={onLess} disabled={lessDisabled} aria-label={lessLabel} {...lessProps}>
            <Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
          </RoundButton>
          <RoundButton primary size={size} onClick={onMore} disabled={moreDisabled} aria-label={moreLabel} {...moreProps}>
            <Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
          </RoundButton>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1" dir="ltr">
      <RoundButton size={size} onClick={onLess} disabled={lessDisabled} aria-label={lessLabel} {...lessProps}>
        <Minus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
      </RoundButton>
      <span dir="rtl" className={`text-center font-extrabold leading-tight text-indigo-900 ${wideLabel ? 'min-w-[100px] whitespace-nowrap text-sm' : 'min-w-[30px] text-[11px]'}`}>{label}</span>
      <RoundButton primary size={size} onClick={onMore} disabled={moreDisabled} aria-label={moreLabel} {...moreProps}>
        <Plus className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
      </RoundButton>
    </div>
  );
}

export default function EggTrays({
  a: a0, b: b0, then: then0, claim: claim0, world: world0, max: max0, title, lead, level, levels: withLevels = true,
  initialMode = 'student', allowModeSwitch = false, onTrial, onFinished, coach: coachOn = true, checkpoints: cpOn = true,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`${NS}.${key}`, o), [t]);
  const preset = LEVELS['egg-trays'][resolveLevelId(level ?? 'beginner')].numbers;
  const initialNumbers = useMemo(() => {
    const a = a0 ?? preset.a;
    const b = b0 ?? preset.b;
    const same = a === preset.a && b === preset.b;
    const world = world0 ?? preset.world;
    const then = then0 ?? (same ? preset.then : undefined);
    const claim = claim0 !== undefined ? claim0 : same ? preset.claim ?? null : null;
    return { a, b, world, ...(then != null ? { then } : {}), ...(claim ? { claim } : {}), ...(max0 != null ? { max: max0 } : {}) };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const state = useManipulation({ type: 'egg-trays', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { a: na, b, world } = state.numbers;
  const claimN = state.numbers.claim ?? null;
  const sceneKey = `${na}|${b}|${world}|${state.numbers.then}|${claimN?.q}|${claimN?.r}|${state.numbers.max}|${state.epoch}`;
  const mk = () => L.init({ a: na, b, world, then: state.numbers.then, claim: claimN, max: state.numbers.max });
  const [lab, setLab] = useState(mk);
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  // « إعادة » (nouvelle époque), un autre niveau ou d'autres nombres : TOUT recommence — la commande du jour, les essais et les questions du labo
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(mk()); }
  const tray = world === 'tray';

  const ready = L.discoveryReady(lab);
  const cpSettings = useLabCheckpointSettings('egg-trays');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpOnNow = cpOn && cpSettings.enabled;
  useEffect(() => { if (ready && !cpOnNow) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { a: lab.a0, b }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useRef(0);
  useEffect(() => {
    if (lab.trials.length < reported.current) reported.current = 0;
    for (let i = reported.current; i < lab.trials.length; i += 1) state.report(onTrial, L.trialEvidence(lab.trials[i]));
    reported.current = lab.trials.length;
  }, [lab.trials.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── les noms comptés (ARABIC_RTL_CONTRACT « Counting nouns ») ── */
  const eggs = (n) => k('eggs', { count: n });
  const units = (n) => k(tray ? 'trays' : 'cartons', { count: n });
  const div = (x) => iso(`${x} ÷ ${b}`);

  /* ── mesure : largeur, écran de leçon, la consigne et ce qui suit la scène (jamais la scène) ── */
  const boxRef = useRef(null);
  const promptRef = useRef(null);
  const belowRef = useRef(null);
  const [width, setWidth] = useState(320);
  const [around, setAround] = useState(260);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => {
      setWidth(Math.max(200, Math.floor(el.clientWidth)));
      const h = (r) => (r.current ? Math.ceil(r.current.getBoundingClientRect().height) + 12 : 0);
      setAround(Math.max(100, h(promptRef) + h(belowRef)));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (promptRef.current) ro.observe(promptRef.current);
    if (belowRef.current) ro.observe(belowRef.current);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 700;
  const compact = width < 380;
  const wide = width >= WIDE_MIN;

  /* ── la géométrie de la scène ── */
  const W = Math.min(wide ? width - SIDE_W - 12 : width, 980);
  const charW = compact ? 34 : 58;
  const pad = compact ? 12 : 18;
  const ax = useMemo(() => L.axisLayout({ max: lab.max, b, width: W, padL: pad, padR: pad + charW + (tray ? (compact ? 50 : 40) : 30) }), [lab.max, b, W, pad, charW, tray]);
  const belt = useMemo(() => (tray ? null : L.beltLayout({ b, u: ax.u, x0: ax.x0, minW: compact ? 7 : 11 })), [tray, b, ax, compact, false]);
  const grid = L.trayGrid(b);
  const g = {};
  g.eggsH = tray ? (compact ? 14 : 18) : Math.max(14, belt.height);
  g.beltTop = tray ? 16 : 22;
  g.beltY = g.beltTop + g.eggsH + 2;
  g.traysTop = g.beltY + (compact ? 12 : 24);
  g.cell = tray ? 0 : Math.min(13, (ax.u - 4) / grid.cols);
  g.trayH = tray ? 26 : Math.max(10, grid.rows * g.cell + 4);
  g.traysH = tray ? 35 : g.trayH + 3;
  g.R = g.traysTop + g.traysH + (compact ? 10 : 16);
  g.cap = compact ? 30 : 34; // la légende de la règle
  g.pill = compact ? 45 : 52; // la pilule « إطارك »
  g.zoomFoot = compact ? 36 : 44; // la règle du zoom et sa pilule « a ÷ b »
  g.rulerBottom = g.R + (compact ? 56 : 66); // graduations, la légende de la règle, puis la pilule « إطارك »
  // la bande de commande (étroit) : hauteur FIXE par monde, pour que la scène ne saute jamais d'une phase à l'autre
  // chaque paire porte son libellé AU-DESSUS (§17.9) : trois paires tiennent sur une rangée, deux sous 300 px
  const stripRows = (tray && compact) ? 2 : 1;
  g.stripH = wide ? 0 : stripRows * 60 + 8;
  const sceneMax = screenH - around - 48;
  const zoomAvail = Math.round(Math.max(34, Math.min(110, sceneMax - g.rulerBottom - g.zoomFoot - 10 - g.stripH)));
  const zl = L.zoomLayout({ b, width: Math.min(W * 0.62, tray ? 220 : 300), maxH: zoomAvail, maxCell: tray ? 22 : 30, minCell: tray ? 6 : 9 });
  g.zoomTop = g.rulerBottom + 8;
  g.H = g.zoomTop + zl.h + g.zoomFoot + g.stripH;

  /* ── les deux gestes : le manche du tapis (a), le cadre (n) ── */
  const [bump, setBump] = useState(0);
  const overRef = useRef(false);
  const toEggs = useCallback((cx, cy, rect) => {
    const raw = ax.eggsAt(cx - rect.left);
    const over = raw > lab.a + b * 0.3;
    if (over && !overRef.current) setBump((x) => x + 1);
    overRef.current = over;
    return raw;
  }, [ax, lab.a, b]);
  const st = useStretchInteraction({
    value: lab.count, range: { min: 0, max: lab.a }, toValue: toEggs, direction: 'ltr', pageStep: b,
    onChange: (c) => setLab((s) => L.setCount(s, c)),
    onCommit: (c) => { overRef.current = false; setLab((s) => L.commitCount(s, c)); },
  });
  const toTray = useCallback((cx, cy, rect) => ax.trayAt(cx - rect.left), [ax]);
  const sf = useStretchInteraction({
    value: lab.frame.n, range: { min: 0, max: lab.max - 1 }, toValue: toTray, direction: 'ltr', pageStep: 10,
    onChange: (n) => setLab((s) => L.setFrame(s, n)),
    onCommit: (n) => setLab((s) => L.commitFrame(s, n)),
  });
  const fillLocked = L.fillLocked(lab);
  const frameLocked = L.frameLocked(lab);
  const isFull = L.full(lab);
  const pack = L.packOf(lab.count, b);

  /* ── le verdict du dernier geste jugé (un seul emplacement) ── */
  const v = L.shownVerdict(lab);
  const openWord = k(`openWord.${world}`);
  const fullWord = k(`fullWord.${world}`);
  const verdictText = useMemo(() => {
    if (!v) return '';
    if (v.kind === 'frame') {
      const o = { div: div(v.a), n: v.n, n1: v.n + 1, q: v.q, full: units(v.q), open: eggs(v.r), openWord, fullWord, gapU: units(v.gap) };
      return k(`v.frame.${v.model}`, o);
    }
    if (v.kind === 'exact') return k(v.ok ? 'v.exact.right' : 'v.exact.wrong', { div: div(v.a), q: v.q, q1: v.q + 1, full: units(v.q), open: eggs(v.r), openWord });
    const o = { loose: eggs(v.claimR), extraU: units(v.extra), left: eggs(v.left), unitOne: k(`unitOne.${world}`), eq: iso(`${v.b} × ${v.claimQ} + ${v.claimR}`), a: v.a };
    if (!v.trueEq) return k(v.ok ? 'v.claim.falseRight' : 'v.claim.false', o);
    if (v.euclid) return k(v.ok ? 'v.claim.keepRight' : 'v.claim.keep', o);
    return k(v.ok ? 'v.claim.splitRight' : 'v.claim.split', o);
  }, [v, world, k]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la découverte : les conjectures fausses réfutées par les nombres de l'élève ── */
  const discoveryOptions = useMemo(() => {
    const rf = L.refutations(lab);
    const bg = rf.bigger;
    let whyBig = k('discovery.whyBigger', { a: lab.a0, b, div: div(lab.a0), q: bg.q, q1: bg.q + 1 });
    if (rf.mult) whyBig += ` ${k('discovery.whyBiggerMult', { m: rf.mult.n, mdiv: iso(`${rf.mult.n} ÷ ${b} = ${rf.mult.q}`) })}`;
    const opts = [];
    if (rf.even) {
      opts.push({ text: k('discovery.even'), why: k(rf.even.passed && rf.even.n !== lab.a0 ? 'discovery.whyEvenPassed' : 'discovery.whyEven', { n: rf.even.n, div: div(rf.even.n), q: rf.even.q, q1: rf.even.q + 1 }) });
    }
    opts.push({ text: k(`discovery.right.${world}`), correct: true });
    opts.push({ text: k(`discovery.bigger.${world}`), why: whyBig });
    return opts;
  }, [lab.a0, lab.passed, b, world, k]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la formalisation ── */
  const br = L.bracketOf(lab.a0, b);
  const formalFor = (a) => (
    <p className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-0.5 font-extrabold text-indigo-950 text-base" key={a}>
      <Formula pieces={L.formalPieces(a, b)} data-et-formal-line={a} />
      <bdi dir="ltr" className="whitespace-nowrap font-mono text-rose-800">{L.remainderLine(a, b)}</bdi>
    </p>
  );
  const formal = (
    <div className="space-y-2.5" data-et-formal>
      <p className="flex flex-wrap justify-center gap-x-4 font-mono text-sm font-bold text-slate-600">
        <bdi dir="ltr" className="whitespace-nowrap">a = b × q + r</bdi> <bdi dir="ltr" className="whitespace-nowrap">0 ≤ r &lt; b</bdi>
      </p>
      {formalFor(lab.a0)}
      <div className="space-y-1.5">
        <p className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5 font-bold text-slate-900 text-sm" data-division-role="a">
          <span dir="ltr" className="font-mono text-sm font-extrabold">a</span>
          <span>{k(`formal.roles.a.${world}`, { a: lab.a0 })}</span>
        </p>
        <DivisionRoles roles={['b', 'q', 'r'].map((key) => ({ key, text: k(`formal.roles.${key}.${world}`, { b, q: br.q, r: br.r }) }))} />
      </div>
      {!br.exact && (
        <p className="flex flex-wrap items-center justify-center gap-x-2 text-base font-extrabold text-indigo-950" data-et-bracket>
          <span className="text-sm">{k('formal.bracketTitle')}</span>
          <bdi dir="ltr" className="inline-flex items-center gap-1.5 font-mono text-lg">
            <span>{br.q}</span><span>&lt;</span><Frac n={lab.a0} d={b} /><span>&lt;</span><span>{br.q1}</span>
          </bdi>
        </p>
      )}
      {!br.exact && <FrameEnds k={k} world={world} q={br.q} r={br.r} />}
      {lab.then != null && L.thenDone(lab) && lab.then % b === 0 && (
        <div className="space-y-1 rounded-2xl border border-emerald-200 bg-white px-3 py-2">
          <p className="text-xs font-bold text-slate-600">{k('formal.then', { eggs: eggs(lab.then) })}</p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 text-base font-extrabold text-emerald-900">
            <bdi dir="ltr" className="inline-flex items-center gap-1.5 font-mono text-lg"><Frac n={lab.then} d={b} /><span>=</span><span>{lab.then / b}</span></bdi>
            <span className="text-sm">⇐</span>
            {['divides', 'multiple', 'divisible'].map((key) => (
              <span key={key} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm" data-et-says={key}>{k(`formal.${key}`, { b, t: lab.then })}</span>
            ))}
          </p>
        </div>
      )}
      {lab.claim && (
        <p className="flex flex-wrap items-baseline justify-center gap-x-2 text-sm font-bold text-rose-900" data-et-formal-claim>
          <bdi dir="ltr" className="whitespace-nowrap font-mono line-through decoration-2">{`${lab.a0} = ${b} × ${lab.claim.q} + ${lab.claim.r}`}</bdi>
          <span>{k('formal.claim')}</span>
          <bdi dir="ltr" className="whitespace-nowrap font-mono">{`${lab.claim.r} ${lab.claim.r > b ? '>' : '≥'} ${b}`}</bdi>
        </p>
      )}
      <p className="text-sm text-emerald-900">{k(`formal.rule.${world}`)}</p>
    </div>
  );

  /* ── les questions pendant le labo : la suite de la dernière étape accomplie ; la dernière étape finit par la règle ── */
  const ids = L.stepIds(lab);
  const cpIdx = L.lastDoneStep(lab);
  const cpId = cpIdx >= 0 ? ids[cpIdx] : null;
  const chain = cpOnNow && cpId ? chainOf(lab, cpId) : null;
  const cp = useLabCheckpoint({
    id: chain ? cpId : null,
    questions: chain ? chain.map((q) => QUESTIONS[q](lab, cpId, k, { world, discoveryOptions, formal })) : null,
    reached: cpIdx >= 0,
    resetKey: scene.inits,
    onRetry: () => setLab((st0) => L.retryStep(st0, cpId)),
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => { if (id === ids.at(-1)) { state.discover(); state.formalize(); } },
  });
  const coachStep = coachOn && !cp.open ? L.coachOf(lab) : null;
  const coach = useLabCoach({
    lab: 'egg-trays', step: coachStep, text: coachStep ? k(`coach.${coachStep.id}`) : '',
    labels: { hide: k('coach.hide'), show: k('coach.show'), ok: k('coach.ok'), stop: k('coach.stop') },
  });
  // une étape est FAITE quand son but est atteint ET que ses questions sont répondues : la pastille passe au vert et on fête
  const stepsDone = ids.map((id, i) => L.stepDone(lab, id) && (i !== cpIdx || !cp.blocking));
  const curStep = cp.blocking && cpIdx >= 0 ? cpIdx : L.currentStep(lab);   // l'étape interrogée reste « en cours » tant que ses questions attendent
  const stepper = ids.length > 1 && <LabStepper count={ids.length} current={curStep} done={stepsDone} stepAttr="data-et-stepper-step" />;
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (lab.trials.length === 0 && celebrated.current.size) celebrated.current = new Set();   // L.init (« إعادة », autre niveau) : on refête
  const doneKey = stepsDone.map(Number).join('');
  useEffect(() => {
    stepsDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: i + 1, total: ids.length });
    });
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du geste (muet sans « الصوت ») : un œuf, une boîte qui se ferme, un jugement juste / faux
  const sfx = useRef({ count: lab.count, at: 0, n: lab.trials.length });
  useEffect(() => {
    const p = sfx.current;
    if (lab.count !== p.count) {
      const now = Date.now();
      if (Math.floor(lab.count / b) > Math.floor(p.count / b)) playSfx('bell');
      else if (now - p.at > 35) { playSfx('tooth', { pitch: lab.count > p.count ? 1 : 0.75 }); p.at = now; }
      p.count = lab.count;
    }
    if (lab.trials.length > p.n) { const tr = lab.trials.at(-1); playSfx(tr.ok ? 'flag' : 'over'); }
    p.n = lab.trials.length;
  }, [lab.count, lab.trials.length]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── la lecture vivante (pilules de la consigne) : seulement ce que la main a produit ── */
  const reading = tray
    ? [
    ...(compact ? [] : [['pallets', pack.pallets], ['full', pack.loose]]),
    ['open', pack.r],
    ['belt', lab.a - lab.count, 'amber']
  ]
    : [['full', pack.q], ['open', pack.r]];

  /* ── le panneau d'action (un seul à la fois) : le cadre (avant / après le remplissage) ou les œufs (pendant) ── */
  const panel = (lab.count === 0 && fillLocked) || isFull ? 'frame' : 'eggs';
  const setEggs = (d) => st.set(Math.max(0, Math.min(lab.a, lab.count + d)));
  const setFrameBy = (d) => sf.set(Math.max(0, Math.min(lab.max - 1, lab.frame.n + d)));
  const stepUnits = [['egg', 1], ['tray', b], ...(tray ? [['pallet', b * L.PALLET]] : [])];
  const eggPairs = (big) => stepUnits.map(([unit, d]) => (
    <Pair key={unit} wideLabel={big} size={big ? 48 : 44} stacked={!big}
      label={k(`step.${unit}.${world}`)}
      onLess={() => setEggs(-d)} onMore={() => setEggs(d)}
      lessDisabled={lab.count <= 0 || fillLocked} moreDisabled={lab.count >= lab.a || fillLocked}
      lessLabel={k(`stepLess.${unit}.${world}`)} moreLabel={k(`stepMore.${unit}.${world}`)}
      lessProps={{ 'data-et-step': unit, 'data-dir': 'less' }} moreProps={{ 'data-et-step': unit, 'data-dir': 'more' }} />
  ));
  const framePairs = (big) => [1, ...(tray ? [10] : [])].map((d) => (
    <Pair key={d} wideLabel={big} size={big ? 48 : 44} stacked={!big}
      label={k(d === 1 ? 'frameStep1' : 'frameStep10')}
      onLess={() => setFrameBy(-d)} onMore={() => setFrameBy(d)}
      lessDisabled={frameLocked || lab.frame.n <= 0} moreDisabled={frameLocked || lab.frame.n >= lab.max - 1}
      lessLabel={k(d === 1 ? 'frameLess' : 'frameLess10')} moreLabel={k(d === 1 ? 'frameMore' : 'frameMore10')}
      lessProps={{ 'data-et-frame-step': d, 'data-dir': 'less' }} moreProps={{ 'data-et-frame-step': d, 'data-dir': 'more' }} />
  ));
  const exactButton = isFull && (
    <button type="button" onClick={() => setLab(L.claimExact)} data-et-exact
      className={`flex min-h-[44px] ${wide ? 'w-full px-2 py-1.5 leading-tight' : 'min-w-[124px] flex-1 self-end leading-tight'} items-center justify-center gap-1.5 rounded-2xl border-2 border-amber-500 bg-gradient-to-b from-amber-300 to-amber-400 px-3 font-black text-amber-950 shadow-[0_4px_0_0_#D97706] outline-none transition-transform active:translate-y-0.5 active:shadow-none focus-visible:ring-4 focus-visible:ring-amber-300 motion-reduce:transition-none ${wide ? 'text-[13px]' : 'text-[11px]'}`}>
      <Target className="h-4 w-4 shrink-0" aria-hidden="true" /> {rich(k('exact', { div: div(lab.a) }))}
    </button>
  );
  const frameReadout = <FrameRange n={lab.frame.n} className="text-indigo-900" />;
  const sideCard = wide && (
    <LabCard className="flex flex-col gap-3 p-4" data-et-panel={panel}>
      <p className="text-center text-lg font-black text-indigo-950">{panel === 'frame' ? k('frameTitle') : k(`eggsTitle.${world}`)}</p>
      <div className="flex items-baseline justify-center gap-1.5 rounded-2xl border border-indigo-100 bg-[#F5F6FF] px-3 py-2">
        {panel === 'frame'
          ? <span className="text-4xl">{frameReadout}</span>
          : <bdi dir="ltr" className="text-4xl font-black tabular-nums text-indigo-900">{lab.count}</bdi>}
      </div>
      <div className="flex flex-col items-center gap-2">{panel === 'frame' ? framePairs(true) : eggPairs(true)}</div>
      {panel === 'frame' && exactButton}
    </LabCard>
  );
  const stripNode = () => !wide && (
    <div className="absolute inset-x-1.5 bottom-1.5 z-10 flex flex-wrap items-end justify-center gap-x-2 gap-y-1 rounded-2xl border border-indigo-100 bg-white/95 p-1 shadow-[0_8px_20px_-14px_rgba(67,56,202,0.6)]"
      style={{ height: g.stripH - 6 }} data-et-strip={panel} data-rows={stripRows}>
      {nextInline || (panel === 'frame' ? <>{framePairs(false)}{exactButton}</> : eggPairs(false))}
    </div>
  );

  /* ── le verdict : un seul bandeau, qui garde sa place (la phrase du geste avant le premier essai) ── */
  const verdictTone = v ? (v.ok ? 'emerald' : 'rose') : 'indigo';
  const idle = fillLocked
    ? k(`instruction.frame.${world}`, { div: div(lab.a) })
    : isFull ? k('instruction.full', { div: div(lab.a) }) : k(`instruction.fill.${world}`);
  const verdictLine = (
    <VerdictBanner tone={verdictTone} icon={v ? (v.ok ? CheckCircle2 : XCircle) : Hand}
      size={compact ? 'xs' : 'sm'}
      className={`${compact ? '!gap-2 !px-2.5 !py-1.5' : ''} ${wide ? 'min-h-[3.5rem]' : 'min-h-[4.25rem]'}`}
      data-et-verdict={v?.kind ?? ''} data-et-refused={v && !v.ok ? (v.model ?? v.kind) : undefined}>
      <p className={v ? '' : 'font-bold text-indigo-900'}>{rich(v ? verdictText : idle)}</p>
    </VerdictBanner>
  );
  const nextInline = !wide && L.canAddEggs(lab) && !cp.blocking && (
    <div className="flex h-full w-full items-center gap-2 px-1" data-et-next>
      <p className="min-w-0 flex-1 text-[11px] font-black leading-tight text-amber-950">{k('next.short', { eggs: eggs(lab.then) })}</p>
      <button type="button" onClick={() => setLab(L.addEggs)} data-et-next-button
        className="flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 px-3 text-xs font-black text-amber-950 shadow-[0_4px_0_0_#D97706] outline-none transition-transform active:translate-y-0.5 active:shadow-none focus-visible:ring-4 focus-visible:ring-amber-300 motion-reduce:transition-none">
        <PackagePlus className="h-4 w-4" aria-hidden="true" /> {k('next.button')}
      </button>
    </div>
  );
  const nextCard = wide && L.canAddEggs(lab) && !cp.blocking && (
    <LabCard className={`space-y-2 border-amber-200 bg-amber-50/70 ${compact ? 'p-2.5' : 'p-3'}`} data-et-next>
      <p className={`${compact ? 'text-xs' : 'text-sm'} font-bold leading-snug text-amber-950`}>
        <span className="font-black">{k('next.title')}</span> {k('next.text', { more: eggs(lab.then - lab.a0), eggs: eggs(lab.then) })}
      </p>
      <button type="button" onClick={() => setLab(L.addEggs)} data-et-next-button
        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 px-3 text-sm font-black text-amber-950 shadow-[0_4px_0_0_#D97706] outline-none transition-transform active:translate-y-0.5 active:shadow-none focus-visible:ring-4 focus-visible:ring-amber-300 motion-reduce:transition-none">
        <PackagePlus className="h-5 w-5" aria-hidden="true" /> {k('next.button')}
      </button>
    </LabCard>
  );
  const claimCard = L.claimOpen(lab) && !cp.blocking && (
    <ClaimCard lab={lab} k={k} compact={compact} inline={!wide} onAnswer={(agree) => setLab((s) => L.answerClaim(s, agree))} eggs={eggs} />
  );
  // étroit : la carte du camarade se pose DANS la scène, sur la règle et le zoom (la scène garde sa hauteur)
  const overlay = !wide && claimCard && (
    <div className="absolute inset-x-1.5 bottom-1.5 z-20 overflow-hidden" style={{ top: g.R - 4 }}>{claimCard}</div>
  );

  return (
    <ManipulationShell
      headerAction={cpSettings.control}
      type="egg-trays"
      title={title ?? k(`title.${world}`)}
      titleHidden
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      coach={coachOn ? coach : null}
      guided={cpOnNow}
      hints={[0, 1, 2].map((i) => k(`hints.${world}.${i}`, { a: lab.a0, b }))}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={<ManipulationDiscovery state={state} prompt={k('discovery.prompt')} options={discoveryOptions} formal={formal} />}
      explanation={k('explanation')}
    >
      <ManipulationStage className="bg-gradient-to-b from-indigo-50/40 to-white">
        <div ref={boxRef} className="space-y-2" data-egg-trays data-world={world} data-a={lab.a} data-b={b} data-count={lab.count}
          data-solved={ready ? 'true' : 'false'} data-layout={wide ? 'wide' : 'narrow'} data-scene-h={Math.round(g.H)}>
          <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />
          <div className="relative space-y-3" data-et-glance>
            {party.node}
            {cp.node}
            <div ref={promptRef}>
              {/* §17.9 : pas de titre — le CONTEXTE (tous les nombres), puis UNE question qui nomme le but et l'état final */}
              <PromptCard
                size={compact ? 'md' : 'lg'}
               
                title={(
                  <span className="block space-y-1">
                    <span className={`block font-bold text-slate-700 ${compact ? 'text-sm' : 'text-lg'}`} data-et-context>
                      {k(`context.${world}`, { eggs: eggs(lab.a), per: eggs(b) })}
                    </span>
                    <span className={`block ${compact ? 'text-base' : 'text-xl'}`} data-et-question>
                      {rich(k(`question.${world}`, { div: div(lab.a) }))}
                    </span>
                  </span>
                )}
                lamp={v ? (v.ok ? 'on' : 'off') : 'off'}
                titleProps={{ 'data-et-order': lab.a, 'data-lit': v?.ok ? 'true' : 'false' }}
              >
                {stepper}
                <div className="flex flex-wrap items-center gap-1.5" data-et-reading>
                  {reading.map(([key, n, tone]) => (
                    <StatPill key={key} small={compact} label={k(`reading.${key}.${world}`)} value={n} tone={tone} data-et-read={key} />
                  ))}
                </div>
              </PromptCard>
            </div>

            <div className={wide ? 'flex items-start gap-3' : ''}>
              <FarmScene lab={lab} k={k} W={W} g={g} ax={ax} belt={belt} zl={zl} grid={grid} st={st} sf={sf} tray={tray}
                compact={compact} charW={charW} bump={bump} v={v} fillLocked={fillLocked} frameLocked={frameLocked} strip={overlay || stripNode()} eggs={eggs} units={units} />
              {wide && <div className="shrink-0" style={{ width: SIDE_W }}>{claimCard || nextCard || sideCard}</div>}
            </div>
            <div ref={belowRef} className="space-y-2">
              <div className={wide ? 'flex items-start gap-3' : 'space-y-2'}>
                <div className="min-w-0 flex-1 space-y-2">{verdictLine}</div>
              </div>
            </div>
          </div>

          {lab.trials.length > 0 && (
            <LabFold id="egg-trays.trials" title={k('trialsTitle')}>
              <ul className="space-y-0.5 text-xs" data-et-trials={lab.trials.length}>
                {lab.trials.map((tr, i) => (
                  <li key={i} className={tr.ok ? 'text-emerald-800' : 'text-rose-800'} data-ok={String(tr.ok)}>
                    {rich(k(`trial.${tr.kind}`, { a: tr.a, n: tr.n, n1: tr.n + 1, eq: iso(`${tr.a} = ${tr.b} × ${tr.claimQ} + ${tr.claimR}`), word: k(tr.ok ? 'trial.yes' : 'trial.no') }))}
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

/* ══════════════ la question des bouts du cadre (dans la formalisation) ══════════════ */

function FrameEnds({ k, world, q, r }) {
  const [pick, setPick] = useState(null);
  const options = [
    { id: 'right', text: k(`ends.right.${world}`), correct: true },
    { id: 'wrong', text: k('ends.wrong') },
  ];
  const right = pick === 'right';
  return (
    <div className="space-y-2 rounded-2xl border border-indigo-100 bg-white p-2.5" data-et-ends={right ? 'right' : pick ?? ''}>
      <p className="text-sm font-black text-indigo-950">{k('ends.prompt')}</p>
      {!right && (
        <div className="grid gap-2 grid-cols-2">
          {options.map((o) => (
            <ChoiceCard key={o.id} size="sm" state={pick === o.id ? (o.correct ? 'right' : 'tried') : 'idle'} className="!whitespace-normal !px-2 text-start !text-sm"
              onClick={() => setPick(o.id)} data-et-ends-option={o.id}>{o.text}</ChoiceCard>
          ))}
        </div>
      )}
      {pick === 'wrong' && <p className="text-xs font-bold text-rose-800">{k('ends.whyWrong', { q, q1: q + 1, r })}</p>}
      {right && (
        <ul className="space-y-1 text-sm font-bold" data-et-approx>
          <li className="rounded-xl border border-violet-200 bg-violet-50 px-2.5 py-1 text-violet-900">{k('formal.below', { q, what: k(`formal.what.full.${world}`) })}</li>
          <li className="rounded-xl border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-indigo-900">{k('formal.above', { q1: q + 1, what: k(`formal.what.need.${world}`) })}</li>
        </ul>
      )}
    </div>
  );
}

/* ══════════════ le camarade : ابن المزارع et sa division (متقدم) ══════════════ */

function ClaimCard({ lab, k, compact, inline = false, onAnswer, eggs }) {
  const { a0: a, b, claim } = lab;
  const ans = lab.claimAnswer;
  const answered = ans != null;
  const { q: extra, r: left } = divmod(Math.max(0, claim.r), b);
  const pallets = Math.floor(claim.q / L.PALLET);
  const loose = claim.q % L.PALLET;
  // le rejeu : ses r′ œufs en vrac, puis versés : ⌊r′/b⌋ plateaux se ferment, r′ mod b restent
  const RW = 252;
  const cell = 6.6;
  const heapCols = Math.max(1, Math.ceil(Math.sqrt(claim.r * 1.6)));
  const { rows: tr, cols: tc } = L.trayGrid(b);
  const tw = tc * 6.4 + 4;
  const th = tr * 6.4 + 4;
  return (
    <LabCard className={`border-violet-200 ${inline ? 'h-full space-y-1.5 p-2' : `space-y-2 ${compact ? 'p-2.5' : 'p-3'}`}`} data-et-claim data-verdict={answered ? (ans ? 'agree' : 'disagree') : undefined}>
      <div className="flex items-center gap-2">
        {!inline && (
          <svg width={34} height={52} viewBox="0 0 34 52" aria-hidden="true" className="shrink-0">
            <KidFigure cx={17} top={3} foot={50} hairStyle="curly" hair="black" skin="wheat" outfit="orange" mood={answered ? 'proud' : 'wonder'} />
          </svg>
        )}
        <p className="min-w-0 flex-1 text-xs font-bold text-violet-900">{k('claim.says', { a, b })}</p>
      </div>
      <p className={`rounded-xl border-2 border-violet-200 bg-violet-50 px-2 py-1 text-center font-black text-violet-950 ${inline || !compact ? 'text-base' : 'text-lg'}`}>
        <Formula pieces={[`${a} = ${b} × ${claim.q}`, `+ ${claim.r}`]} />
      </p>
      {!answered ? (
        <div className="space-y-1.5">
          <p className="text-sm font-black text-indigo-950">{k('claim.ask')}</p>
          <div className="grid grid-cols-2 gap-2">
            <ChoiceCard size="md" onClick={() => onAnswer(true)} data-et-claim-answer="agree"><ThumbsUp className="me-1.5 h-4 w-4" aria-hidden="true" />{k('claim.agree')}</ChoiceCard>
            <ChoiceCard size="md" onClick={() => onAnswer(false)} data-et-claim-answer="disagree"><ThumbsDown className="me-1.5 h-4 w-4" aria-hidden="true" />{k('claim.disagree')}</ChoiceCard>
          </div>
        </div>
      ) : null}
      {(!inline || answered) && <svg width="100%" viewBox={`0 0 ${RW} 94`} className="block" style={inline ? { maxHeight: 104 } : undefined} role="img" data-et-replay={answered ? 'poured' : 'heap'}
        aria-label={k('claim.replayAria', { units: k('trays', { count: claim.q }), eggs: eggs(claim.r) })}>
        {/* ses plateaux pleins : en palettes de 10 (dessinées en petit), le compte dans une pilule */}
        {Array.from({ length: pallets }, (_, p) => (
          <g key={p}>
            <rect x={6 + p * 11} y={18} width={9} height={30} rx={1.5} fill="#E8C48E" stroke="#B98544" strokeWidth={0.6} />
            {Array.from({ length: 5 }, (_, j) => <line key={j} x1={6 + p * 11} x2={15 + p * 11} y1={21 + j * 6} y2={21 + j * 6} stroke="#B98544" strokeWidth={0.4} />)}
            <rect x={5 + p * 11} y={48} width={11} height={4} fill="#C08A4E" />
          </g>
        ))}
        {Array.from({ length: loose }, (_, j) => (
          <rect key={j} x={8 + pallets * 11 + j * 4} y={38} width={3} height={10} rx={0.8} fill="#E8C48E" stroke="#B98544" strokeWidth={0.5} />
        ))}
        <SvgPill x={8 + (pallets * 11 + loose * 4) / 2} y={66} text={String(claim.q)} size={10} fill="#7C3AED" />
        <text x={8 + (pallets * 11 + loose * 4) / 2} y={88} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#5B21B6" style={{ unicodeBidi: 'isolate' }}>{k('replay.full')}</text>
        {/* ses œufs en vrac, puis versés */}
        {!answered ? (
          <g transform="translate(120 6)">
            {Array.from({ length: claim.r }, (_, i) => (
              <Egg key={i} x={(i % heapCols) * cell * 1.15 + 4} y={Math.floor(i / heapCols) * cell * 1.35 + 5} w={cell} />
            ))}
            <SvgPill x={(heapCols * cell * 1.15) / 2} y={60} text={String(claim.r)} size={10} fill="#D97706" />
            <text x={(heapCols * cell * 1.15) / 2} y={82} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#92400E" style={{ unicodeBidi: 'isolate' }}>{k('replay.loose')}</text>
          </g>
        ) : (
          <g transform="translate(112 6)">
            {Array.from({ length: extra }, (_, i) => (
              <g key={i} className="et-stamp">
                <TrayBody x={i * (tw + 24)} y={4} w={tw} h={th} b={b} eggs={b} kind="tray" />
                <SvgPill x={i * (tw + 24) + tw / 2} y={60} text={String(b)} size={10} fill="#4F46E5" />
                <text x={i * (tw + 24) + tw / 2} y={82} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#3730A3" style={{ unicodeBidi: 'isolate' }}>{k('replay.closed')}</text>
              </g>
            ))}
            <g className="et-pop">
              <TrayBody x={extra * (tw + 24)} y={4} w={tw} h={th} b={b} eggs={left} kind="tray" open />
              <SvgPill x={extra * (tw + 24) + tw / 2} y={60} text={String(left)} size={10} fill="#D97706" />
              <text x={extra * (tw + 24) + tw / 2} y={82} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#92400E" style={{ unicodeBidi: 'isolate' }}>{k('replay.left')}</text>
            </g>
          </g>
        )}
      </svg>}
    </LabCard>
  );
}

/* ══════════════ la scène : le mur, le tapis, les plateaux, la règle, le zoom ══════════════ */

function FarmScene({ lab, k, W, g, ax, belt, zl, st, sf, tray, compact, charW, bump, v, fillLocked, frameLocked, strip, eggs, units }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { a, b, count, frame } = lab;
  const pack = L.packOf(count, b);
  const { q, r } = pack;
  const H = Math.round(g.H);
  const xc = ax.xOfEggs(count);
  const xa = ax.xOfEggs(a);
  const gap = Math.min(1.5, ax.u * 0.08);
  const started = count > 0;
  // le cadre : son état (jugé quand la commande est pleine)
  const judged = v && v.kind === 'frame' && v.n === frame.n ? v : null;
  const fState = judged ? (judged.ok ? 'right' : 'wrong') : 'idle';
  const fx0 = ax.xOf(frame.n);
  const fx1 = ax.xOf(frame.n + 1);
  const fColor = fState === 'right' ? '#059669' : fState === 'wrong' ? '#E11D48' : '#4F46E5';
  const fText = `${frame.n} – ${frame.n + 1}`;
  const fSize = compact ? 11 : 12.5;
  const fpw = pillWidth(fText, fSize);
  const fpx = Math.max(fpw / 2 + 4, Math.min(W - fpw / 2 - 4, (fx0 + fx1) / 2));
  const fLabelRight = fpx + fpw / 2 + 52 < W;
  // le zoom : centré sous [q ; q + 1], dans la scène
  const zq = Math.min(q, lab.max - 1);
  const zMid = (ax.xOf(zq) + ax.xOf(zq + 1)) / 2;
  const zx = Math.max(compact ? 26 : 34, Math.min(W - zl.w - (compact ? 26 : 34), zMid - zl.w / 2));
  const zy = g.zoomTop;
  const zFill = zl.fillW(r);
  const mood = judged?.ok || (v?.kind === 'exact' && v.ok) ? 'proud' : judged ? 'neutral' : started ? 'wonder' : 'happy';
  const kidFoot = g.traysTop + g.traysH - 2;
  const kidTop = Math.max(4, kidFoot - Math.min(compact ? 84 : 118, kidFoot - 4));
  const kidCx = W - charW / 2 - 4;
  const closed = Array.from({ length: Math.min(q, lab.max) }, (_, i) => i);
  const pallets = Math.floor(Math.min(q, lab.max) / L.PALLET);
  const plumb = started;
  const labelSize = compact ? 10 : 11;

  return (
    <StageFrame className="shrink-0 overflow-hidden" style={{ width: W, height: H }} data-et-scene>
      <svg width={W} height={H} className="absolute inset-0" style={{ direction: 'ltr' }} role="img"
        aria-label={k('sceneAria', { a, b, c: count, q, r, units: units(q) })}>
        <defs>
          <linearGradient id={`${uid}wall`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#FFF7E8" />
            <stop offset="1" stopColor="#FBEBD0" />
          </linearGradient>
          <pattern id={`${uid}eggs`} width="7" height="8" patternUnits="userSpaceOnUse">
            <ellipse cx="3.5" cy="4" rx="2.6" ry="3.2" fill="#FFF1DC" stroke="#D9A066" strokeWidth="0.6" />
          </pattern>
        </defs>
        {/* le mur de planches et le sol de la station */}
        <rect x={0} y={0} width={W} height={g.traysTop + g.traysH} fill={`url(#${uid}wall)`} />
        {Array.from({ length: Math.ceil(W / 46) }, (_, i) => (
          <line key={i} x1={i * 46 + 23} x2={i * 46 + 23} y1={0} y2={g.traysTop + g.traysH} stroke="#EAD6B4" strokeWidth={1} aria-hidden="true" />
        ))}
        <rect x={0} y={0} width={W} height={7} fill="#E9B872" opacity={0.6} />
        <rect x={0} y={g.traysTop + g.traysH} width={W} height={4} fill="#D9C2A0" />

        {/* le tapis : la ligne des œufs, à l'échelle de la règle */}
        <g aria-hidden="true">
          <rect x={ax.x0 - 10} y={g.beltY} width={ax.x1 - ax.x0 + 20} height={7} rx={3.5} fill="#64748B" />
          <rect x={ax.x0 - 10} y={g.beltY} width={ax.x1 - ax.x0 + 20} height={2} rx={1} fill="#94A3B8" />
          {Array.from({ length: Math.max(2, Math.floor((ax.x1 - ax.x0 + 20) / 26) + 1) }, (_, i) => (
            <circle key={i} cx={ax.x0 - 6 + i * 26} cy={g.beltY + 11} r={3.2} fill="#E2E8F0" stroke="#94A3B8" strokeWidth={1} />
          ))}
          <rect x={ax.x0 - 6} y={g.beltY + 14} width={4} height={Math.max(0, g.traysTop - g.beltY - 16)} fill="#CBD5E1" />
          <rect x={ax.x1 + 2} y={g.beltY + 14} width={4} height={Math.max(0, g.traysTop - g.beltY - 16)} fill="#CBD5E1" />
        </g>
        {/* les œufs ENCORE sur le tapis : chacun une fois (مبتدئ) ; un tas compté (متقدم) */}
        {!tray && Array.from({ length: Math.max(0, a - count) }, (_, j) => {
          const i = count + j;
          const p = belt.pos(i);
          return <Egg key={i} x={p.x} y={g.beltTop + p.y} w={belt.w} data-et-belt-egg={i} />;
        })}
        {tray && a > count && (
          <g data-et-belt={a - count}>
            <rect x={xc} y={g.beltY - g.eggsH} width={Math.max(0, xa - xc)} height={g.eggsH} rx={4} fill={`url(#${uid}eggs)`} stroke="#E7C79C" strokeWidth={0.8} />
          </g>
        )}
        {/* la butée : après la dernière œuf de la commande, le tapis est vide */}
        <g key={`stop-${bump}`} className={bump > 0 ? 'et-bump' : undefined} data-et-end={a}>
          <rect x={xa + 1} y={g.beltTop - 8} width={4} height={Math.max(0, g.beltY - g.beltTop + 15)} rx={2} fill="#F97316" />
          <path d={`M${xa + 5} ${g.beltTop - 8} L${xa + 17} ${g.beltTop - 3} L${xa + 5} ${g.beltTop + 2} Z`} fill="#FB923C" />
        </g>

        {/* le cadre : une colonne translucide de [n ; n + 1], des plateaux à la règle */}
        <g data-et-frame data-n={frame.n} data-state={fState} data-placed={frame.placed ? 'true' : 'false'} data-locked={frameLocked ? 'true' : 'false'}>
          <rect x={fx0} y={g.traysTop - 6} width={Math.max(2, fx1 - fx0)} height={Math.max(0, g.R + 10 - (g.traysTop - 6))} rx={Math.min(6, (fx1 - fx0) / 3)}
            fill={fColor} opacity={frame.placed ? 0.13 : 0.07} />
          {[fx0, fx1].map((x, i) => (
            <path key={i} d={`M${x + (i ? -4 : 4)} ${g.R - 13} H${x} V${g.R + 11} H${x + (i ? -4 : 4)}`} fill="none" stroke={fColor} strokeWidth={2.6}
              strokeLinecap="round" strokeLinejoin="round" strokeDasharray={frame.placed ? undefined : '3 3'} />
          ))}
          <SvgPill x={fpx} y={g.R + g.pill} text={fText} size={fSize} fill={frame.placed ? fColor : '#A5B4FC'} />
          {/* ce que la pilule est : « إطارك » à sa droite (ou à sa gauche au bord de la scène) */}
          <text x={fLabelRight ? fpx + fpw / 2 + 5 : fpx - fpw / 2 - 5} y={g.R + g.pill + 4} textAnchor={fLabelRight ? 'start' : 'end'} fontSize={compact ? 11 : 12} fontWeight={800}
            fill={frame.placed ? fColor : '#6366F1'} style={{ unicodeBidi: 'isolate' }}>{k('frameLabel')}</text>
          {frameLocked && (
            <g transform={`translate(${fLabelRight ? fpx - fpw / 2 - 16 : fpx + fpw / 2 + 5} ${g.R + g.pill - 6})`} aria-hidden="true">
              <rect x={0} y={2} width={10} height={8} rx={1.5} fill="#64748B" />
              <path d="M2 2 V0 a3 3 0 0 1 6 0 V2" fill="none" stroke="#64748B" strokeWidth={1.6} />
            </g>
          )}
        </g>

        {/* les plateaux : fermés sur [i ; i + 1], en palettes de 10 (متقدم) ; le plateau ouvert sur [q ; q + 1] */}
        {tray && Array.from({ length: pallets }, (_, p) => {
          const x0 = ax.xOf(p * L.PALLET) + gap;
          const x1 = ax.xOf((p + 1) * L.PALLET) - gap;
          return (
            <g key={p === pallets - 1 ? `p-last-${pallets}` : `p${p}`} data-et-pallet={p}>
              <Pallet x={x0} y={g.traysTop + 27} w={x1 - x0} h={7} />
            </g>
          );
        })}
        {closed.map((i) => {
          const x0 = ax.xOf(i) + gap;
          const w = ax.xOf(i + 1) - gap - x0;
          const last = i === q - 1;
          return (
            <g key={last ? `last-${q}` : `t${i}`} className={last ? 'et-stamp' : undefined} data-et-tray={i} data-full="true">
              {tray
                ? <FullTraySlat x={x0} y={g.traysTop + 1} w={w} h={26} />
                : <CartonLid x={x0} y={g.traysTop} w={w} h={g.trayH} b={b} />}
            </g>
          );
        })}
        {tray && Array.from({ length: pallets }, (_, p) => {
          const x0 = ax.xOf(p * L.PALLET) + gap;
          const x1 = ax.xOf((p + 1) * L.PALLET) - gap;
          return (
            <line key={p === pallets - 1 ? `s-last-${pallets}` : `s${p}`} className={p === pallets - 1 ? 'et-tie' : undefined}
              x1={x0} x2={x1} y1={g.traysTop + 14} y2={g.traysTop + 14} stroke="#2563EB" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true" />
          );
        })}
        {q < lab.max && (
          <g data-et-tray={q} data-full="false">
            <TrayBody x={ax.xOf(q) + gap} y={g.traysTop + (tray ? 1 : 0)} w={ax.u - 2 * gap} h={tray ? 26 : g.trayH} b={b} eggs={r} kind={tray ? 'tray' : 'carton'} open
              data-et-open data-eggs={r} />
          </g>
        )}

        {/* la règle des plateaux */}
        <g data-et-ruler={lab.max}>
          <line x1={ax.x0 - 6} x2={ax.x1 + 8} y1={g.R} y2={g.R} stroke="#475569" strokeWidth={2} />
          <path d={`M${ax.x1 + 8} ${g.R - 4.5} L${ax.x1 + 15} ${g.R} L${ax.x1 + 8} ${g.R + 4.5} Z`} fill="#475569" />
          {ax.ticks.map((tk) => (
            <g key={tk.v}>
              <line x1={tk.x} x2={tk.x} y1={g.R - (tk.major ? 6 : 3)} y2={g.R + (tk.major ? 6 : 3)} stroke="#64748B" strokeWidth={tk.major ? 1.4 : 0.8} />
              {tk.label && <text x={tk.x} y={g.R + 19} textAnchor="middle" fontSize={labelSize} fontWeight={800} fill="#334155" fontFamily="ui-monospace, monospace">{tk.v}</text>}
            </g>
          ))}
          {/* ce que comptent les graduations */}
          <text x={ax.x1 + 15} y={g.R + g.cap} textAnchor="end" fontSize={compact ? 10.5 : 11.5} fontWeight={800} fill="#475569" style={{ unicodeBidi: 'isolate' }} data-et-ruler-caption>
            {k(`rulerCaption.${tray ? 'tray' : 'carton'}`)}
          </text>
        </g>

        {/* le fil à plomb : le manche du tapis est AU-DESSUS du repère « a ÷ b » (la même ligne, lue ÷ b) */}
        {plumb && (
          <g data-et-marker data-q={q} data-r={r}>
            <line x1={xc} x2={xc} y1={g.beltY + 8} y2={g.R - 2} stroke="#7C3AED" strokeWidth={1.4} strokeDasharray="3 3" />
            <path d={`M${xc} ${g.R + 1} L${xc - 6} ${g.R - 8} L${xc + 6} ${g.R - 8} Z`} fill="#7C3AED" stroke="#FFFFFF" strokeWidth={1.2} />
          </g>
        )}

        {/* le zoom sur [q ; q + 1] : le plateau ouvert lui-même, rempli à r/b */}
        <g data-et-zoom={zq}>
          <path d={`M${ax.xOf(zq)} ${g.R + 4} L${zx} ${zy} L${zx + zl.w} ${zy} L${ax.xOf(zq + 1)} ${g.R + 4} Z`} fill="#6366F1" opacity={0.06} />
          <line x1={ax.xOf(zq)} y1={g.R + 4} x2={zx} y2={zy} stroke="#A5B4FC" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={ax.xOf(zq + 1)} y1={g.R + 4} x2={zx + zl.w} y2={zy} stroke="#A5B4FC" strokeWidth={1} strokeDasharray="3 3" />
          <TrayBody x={zx} y={zy} w={zl.w} h={zl.h} b={b} eggs={r} kind={tray ? 'tray' : 'carton'} open />
          <line x1={zx} x2={zx + zl.w} y1={zy + zl.h + 12} y2={zy + zl.h + 12} stroke="#475569" strokeWidth={1.6} />
          {[0, 1].map((e) => (
            <g key={e}>
              <line x1={zx + e * zl.w} x2={zx + e * zl.w} y1={zy + zl.h + 6} y2={zy + zl.h + 18} stroke="#475569" strokeWidth={1.6} />
              <text x={zx + e * zl.w + (e ? 6 : -6)} y={zy + zl.h + 16} textAnchor={e ? 'start' : 'end'} fontSize={12} fontWeight={900} fill="#334155" fontFamily="ui-monospace, monospace">{zq + e}</text>
            </g>
          ))}
          {(() => {
            const right = W - (zx + zl.w);
            const onRight = right >= zx;
            const x = onRight ? zx + zl.w + 8 : zx - 8;
            return (
              <text x={x} y={zy + 14} textAnchor={onRight ? 'start' : 'end'} fontSize={compact ? 10.5 : 11.5} fontWeight={800} fill="#4338CA" style={{ unicodeBidi: 'isolate' }} data-et-zoom-caption>
                <tspan x={x} dy={0}>{k(`zoomCaption.${tray ? 'tray' : 'carton'}`)}</tspan>
                <tspan x={x} dy={15}>{k('zoomCaption2')}</tspan>
              </text>
            );
          })()}
          {started && (
            <>
              <rect x={zx} y={zy + zl.h + 10} width={zFill} height={4} rx={2} fill="#F59E0B" />
              <path d={`M${zx + zFill} ${zy + zl.h + 12} L${zx + zFill - 5} ${zy + zl.h + 4} L${zx + zFill + 5} ${zy + zl.h + 4} Z`} fill="#7C3AED" />
              <SvgPill x={Math.max(zx + 28, Math.min(zx + zl.w - 28, zx + zFill))} y={zy + zl.h + (compact ? 24 : 27)} text={`${count} ÷ ${b}`} size={compact ? 10 : 11} fill="#7C3AED" />
            </>
          )}
        </g>

        {/* l'enfant de la ferme : Salma (hijab) en مبتدئ, le fils du fermier en متقدم */}
        <g aria-hidden="true">
          {tray
            ? <KidFigure cx={kidCx} top={kidTop} foot={kidFoot} hairStyle="curly" hair="black" skin="wheat" outfit="orange" mood={mood} />
            : <KidFigure cx={kidCx} top={kidTop} foot={kidFoot} hairStyle="hijab" scarf="mint" skin="light" outfit="teal" mood={mood} />}
        </g>
      </svg>
      {/* le TAPIS est la piste du manche : le toucher y pose le manche ; le manche est au bout de ce qui est emballé */}
      <div {...st.trackProps} className="absolute inset-x-0 top-0" style={{ ...st.trackProps.style, height: g.beltY + 16, pointerEvents: fillLocked ? 'none' : undefined }}>
        <div {...st.handleProps({ label: k('handle'), valueText: k('handleValue', { eggs: eggs(count), order: a }) })}
          data-et-handle aria-disabled={fillLocked ? 'true' : undefined}
          className="group absolute flex h-11 min-w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full outline-none"
          style={{ left: Math.max(24, Math.min(W - 24, xc)), top: g.beltTop + g.eggsH / 2, cursor: fillLocked ? 'not-allowed' : st.dragging ? 'grabbing' : 'grab' }}>
          <span className={`flex h-10 items-center justify-center gap-1 rounded-full border-[3px] px-2 shadow-[0_6px_16px_-6px_rgba(124,58,237,0.9)] transition-transform group-focus-visible:ring-4 group-focus-visible:ring-violet-300 motion-reduce:transition-none ${fillLocked ? 'border-slate-300 bg-slate-50 text-slate-400' : 'border-violet-500 bg-white text-violet-800'} ${st.dragging ? 'scale-110' : ''}`}>
            <span className="text-[10px] font-extrabold">{k('handleTag')}</span>
            {fillLocked ? <Lock className="h-4 w-4" aria-hidden="true" /> : <EggIcon className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />}
            <bdi dir="ltr" className="font-mono text-sm font-black tabular-nums">{count}</bdi>
          </span>
        </div>
      </div>
      {/* la RÈGLE (et les plateaux au-dessus) est la piste du cadre */}
      <div {...sf.trackProps} className="absolute inset-x-0" style={{ ...sf.trackProps.style, top: g.traysTop - 6, height: g.rulerBottom - (g.traysTop - 6), pointerEvents: frameLocked ? 'none' : undefined }}>
        <div {...sf.handleProps({ label: k('frameHandle'), valueText: k('frameValue', { n: frame.n, n1: frame.n + 1 }) })}
          data-et-frame-handle aria-disabled={frameLocked ? 'true' : undefined}
          className="absolute -translate-x-1/2 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
          style={{ left: (fx0 + fx1) / 2, top: 0, width: Math.max(44, fx1 - fx0), height: g.rulerBottom - (g.traysTop - 6), cursor: frameLocked ? 'not-allowed' : sf.dragging ? 'grabbing' : 'grab' }} />
      </div>
      {strip}
    </StageFrame>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite de chaque étape : ce que l'élève vient de FAIRE, avec SES nombres ; la dernière étape finit par la règle. */
export const CHAINS = Object.freeze({
  order: ['rest', 'write', 'bounds'],
  then: ['rest', 'where'],
  claim: ['claimWhy', 'claimRest'],
});
export function chainOf(lab, id) {
  const ids = L.stepIds(lab);
  const base = CHAINS[id] ?? [];
  return id === ids.at(-1) ? [...base, 'rule'] : base;
}

const $ = (x) => <MathText>{`$${x}$`}</MathText>;
const C = (k, key, o) => k(`cp.${key}`, o);
const opt = (texts, right, whys) => texts.map((text, i) => (i === right ? { text, correct: true } : { text, why: whys[i] }));
const iso2 = (x) => `⁦${x}⁩`;
const aOf = (lab, id) => (id === 'then' ? lab.then : lab.a0);
const nounsOf = (k, world) => ({ eggs: (n) => k('eggs', { count: n }), units: (n) => k(world === 'tray' ? 'trays' : 'cartons', { count: n }), open: k(`openWord.${world}`), unit: k(`unitOne.${world}`) });

/** Chaque question est construite sur LES nombres de l'étape (a, b, q, r) ; `ctx` : le monde, la découverte et la règle du labo. */
export const QUESTIONS = {
  rest: (lab, id, k, { world }) => {
    const a = aOf(lab, id); const { b } = lab; const { q, r } = divmod(a, b);
    const n = nounsOf(k, world);
    const o = { a: iso2(a), b: iso2(b), q: iso2(q), open: n.open, full: n.units(q), calc: iso2(`${a} − ${b} × ${q} = ${r}`) };
    return {
      id: 'rest', kind: 'number', expected: String(r), answer: <bdi dir="ltr">{r}</bdi>,
      prompt: C(k, `rest.prompt.${id === 'then' ? 'then' : 'order'}`, o), hints: [C(k, 'rest.hint1', o), C(k, 'rest.hint2', o)],
      explain: C(k, r === 0 ? 'rest.explainZero' : 'rest.explain', o),
    };
  },
  write: (lab, id, k) => {
    const a = aOf(lab, id); const { b } = lab; const { q, r } = divmod(a, b);
    const o = { b: iso2(b), r2: iso2(r + b), q1: iso2(q + 1), prod: iso2(b * (q + 1)), a: iso2(a) };
    return {
      id: 'write', kind: 'choice', prompt: C(k, 'write.prompt', o),
      options: opt([$(`${a}=${b}\\times ${q}+${r}`), $(`${a}=${b}\\times ${q - 1}+${r + b}`), $(`${a}=${b}\\times ${q + 1}`)], 0,
        [null, C(k, 'write.whyBigRest', o), C(k, 'write.whyNeeded', o)]),
      hints: [C(k, 'write.hint1', o), C(k, 'write.hint2', o)],
      explain: C(k, 'write.explain', { ...o, eq: iso2(`${a} = ${b} × ${q} + ${r}`), rr: iso2(`${r} < ${b}`) }),
    };
  },
  bounds: (lab, id, k) => {
    const a = aOf(lab, id); const { b } = lab; const { q, r } = divmod(a, b);
    const f = `\\tfrac{${a}}{${b}}`;
    const o = { q: iso2(q), q1: iso2(q + 1), r: iso2(r), b: iso2(b), div: iso2(`${a} ÷ ${b}`) };
    return {
      id: 'bounds', kind: 'choice', cols: 3, prompt: C(k, 'bounds.prompt', o),
      options: opt([$(`${q}<${f}<${q + 1}`), $(`${q - 1}<${f}<${q}`), $(`${r}<${f}<${b}`)], 0,
        [null, C(k, 'bounds.whyBelow', o), C(k, 'bounds.whyRest', o)]),
      hints: [C(k, 'bounds.hint1', o), C(k, 'bounds.hint2', o)],
      explain: C(k, 'bounds.explain', o),
    };
  },
  where: (lab, id, k) => {
    const a = lab.then; const { b } = lab; const { q, r } = divmod(a, b);
    const o = { q: iso2(q), q1: iso2(q + 1), qm: iso2(Math.max(0, q - 1)), div: iso2(`${a} ÷ ${b}`), calc: iso2(`${a} = ${b} × ${q}${r ? ` + ${r}` : ''}`) };
    return {
      id: 'where', kind: 'choice', prompt: C(k, 'where.prompt', o),
      options: opt([C(k, 'where.on', o), C(k, 'where.between', o), C(k, 'where.below', o)], r === 0 ? 0 : 1,
        [C(k, 'where.whyOn', o), C(k, 'where.whyBetween', o), C(k, 'where.whyBelow', o)]),
      hints: [C(k, 'where.hint1', o), C(k, 'where.hint2', o)],
      explain: C(k, r === 0 ? 'where.explainOn' : 'where.explainBetween', o),
    };
  },
  claimWhy: (lab, id, k, { world }) => {
    const { a0: a, b, claim } = lab;
    const trueEq = claim.q * b + claim.r === a;
    const right = !trueEq ? 2 : claim.r >= b ? 0 : 1;
    const n = nounsOf(k, world);
    const o = { eq: iso2(`${a} = ${b} × ${claim.q} + ${claim.r}`), r: iso2(claim.r), b: iso2(b), unit: n.unit, calc: iso2(`${b} × ${claim.q} + ${claim.r} = ${b * claim.q + claim.r}`) };
    return {
      id: 'claimWhy', kind: 'choice', prompt: C(k, 'claimWhy.prompt', o),
      options: opt([C(k, 'claimWhy.big', o), C(k, 'claimWhy.fine', o), C(k, 'claimWhy.calc', o)], right,
        [C(k, 'claimWhy.whyBig', o), C(k, 'claimWhy.whyFine', o), C(k, 'claimWhy.whyCalc', o)]),
      hints: [C(k, 'claimWhy.hint1', o), C(k, 'claimWhy.hint2', o)],
      explain: C(k, right === 0 ? 'claimWhy.explainBig' : right === 1 ? 'claimWhy.explainFine' : 'claimWhy.explainCalc', o),
    };
  },
  claimRest: (lab, id, k) => {
    const { a0: a, b } = lab; const { q, r } = divmod(a, b);
    const o = { a: iso2(a), b: iso2(b), eq: iso2(`${a} = ${b} × ${q} + ${r}`), rr: iso2(`${r} < ${b}`) };
    return {
      id: 'claimRest', kind: 'number', expected: String(r), answer: <bdi dir="ltr">{r}</bdi>,
      prompt: C(k, 'claimRest.prompt', o), hints: [C(k, 'claimRest.hint1', o), C(k, 'claimRest.hint2', o)], explain: C(k, 'claimRest.explain', o),
    };
  },
  rule: (lab, id, k, { discoveryOptions, formal }) => ({
    id: 'rule', kind: 'choice', prompt: k('discovery.prompt'), options: discoveryOptions,
    hints: [C(k, 'rule.hint1'), C(k, 'rule.hint2')], explain: formal,
  }),
};
