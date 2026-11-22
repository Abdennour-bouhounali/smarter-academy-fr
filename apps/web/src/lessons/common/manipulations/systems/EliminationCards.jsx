import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Hand, Minus, Plus, RotateCcw, ChevronDown } from 'lucide-react';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import useStretchInteraction from '../useStretchInteraction';
import DraggableObject from '../primitives/DraggableObject';
import DropZone from '../primitives/DropZone';
import EquationDisplay from '../primitives/EquationDisplay';
import LabFold from '../primitives/LabFold';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import { bidi } from '../../../../utils/bidi';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';
import EliminationCardsPlayer from './EliminationCardsPlayer';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as E from '../logic/eliminationCards';

/**
 * elimination-cards — LES CARTES DU KIOSQUE (unité 5 « جمل معادلتين من الدرجة الأولى بمجهولين »,
 * leçon « حل جملة معادلتين من الدرجة الأولى بمجهولين جبريا »).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève manipule deux CARTES-ÉQUATIONS faites de tuiles (x, y, et la valeur) : il TIRE les
 *    tuiles d'une inconnue dans le tiroir (isoler), PORTE l'expression obtenue sur les tuiles de
 *    l'autre carte, ÉTIRE le multiplicateur × k d'une carte, POSE une carte sur l'autre, puis
 *    PORTE la valeur trouvée sur une carte. Toucher-toucher et clavier font les mêmes gestes.
 * B. Idée : on résout une jumla en faisant DISPARAÎTRE une inconnue — par التعويض ou par الجمع —
 *    pour obtenir une équation du premier degré à une inconnue ; puis on revient chercher l'autre :
 *    la solution est une ثنائية.
 * C. Chaque tuile y de la carte visée devient le paquet (7 − 2x) ; le multiplicateur multiplie
 *    toutes les tuiles ET la valeur ; posées l'une sur l'autre, les tuiles opposées s'annulent
 *    par paires (dessinées barrées, « = 0 ») ; la carte à une inconnue se résout ligne par ligne.
 * D. Les lignes du manuel s'écrivent sous les cartes, au moment du geste : « y = 7 − 2x »,
 *    « 3x − 2(7 − 2x) = 4,2 », « 4x + 2y = 14 », « 7x = 18,2 », « x = 2,6 », « (2,6 ; 1,8) ».
 * E. À découvrir avant la règle : les deux chemins (les deux élèves du نشاط 2) font la même chose
 *    — une inconnue disparaît — et donnent la MÊME ثنائية.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        résoudre une jumla = éliminer une inconnue (التعويض / الجمع), puis revenir à l'autre
 *   OBJECT         deux cartes-équations en tuiles sur le comptoir d'un kiosque (كشك الحي)
 *   VARIABLE       QUELLE inconnue disparaît et COMMENT : l'inconnue tirée et la carte qui reçoit
 *                  l'expression ; le multiplicateur k de chaque carte (étirement, −6…6)
 *   INVARIANT      la ثنائية solution (chaque carte réécrite garde les mêmes solutions) ; les deux
 *                  membres d'une carte sont toujours multipliés ensemble
 *   TRANSFORMATION tuiles remplacées par des paquets ; tuiles multipliées ; paires opposées annulées
 *   CONSTRAINT     l'expression ne va que sur l'AUTRE carte ; une carte ne se pose sur l'autre que si
 *                  une inconnue s'annule ; × 0 interdit ; le laboratoire ne finit qu'avec (x ; y)
 *   RESISTANCE     l'expression portée sur sa propre carte est refusée avec ce qu'elle donnerait
 *                  (« 2x + (7 − 2x) = 7، أي 7 = 7 ») ; la carte posée sans annulation est refusée avec
 *                  la somme écrite (« 5x − y = 11,2 : بقي المجهولان ») et, si deux coefficients sont
 *                  ÉGAUX, « متساويان وليسا متعاكسين » ; × 0 efface la carte (« 0 = 0 ») pendant le
 *                  geste et la valeur est refusée ; un seul membre ne peut pas être multiplié : le
 *                  multiplicateur tient la carte entière (dit sous la poignée)
 *   EVIDENCE       la carte réécrite, les paires barrées, les lignes, la ثنائية vérifiée deux fois
 *   CONTRAST       les DEUX méthodes sur la même jumla, la même ثنائية (`discoveryReady`) ; les refus
 *   PREDICTION     « quel multiplicateur rendra les y opposés ? » — la carte change PENDANT l'étirement
 *   DISCOVERY      « تخلّصت من أحد المجهولين فحصلت على معادلة بمجهول واحد، ثم عوّضت » — choisie
 *   FORMALIZATION  طرائق p. 59 : طريقة التعويض / طريقة الجمع (l'encadré du manuel)
 *   TRANSFER       دوري الآن p. 59, تمارين 5 → 13, 22, 23 (choisir la méthode selon les coefficients)
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, déploiement lot 2, 2026-10-28) : les deux MÉTHODES sont les deux « tâches » du labo.
 * Quand une méthode est TERMINÉE (la ثنائية obtenue), une suite de questions sur ce que l'élève vient de faire se pose PAR-DESSUS le labo
 * (`chainOf`) : substitution — la valeur trouvée · l'autre inconnue · la ثنائية ; addition — la somme des valeurs · la valeur trouvée · l'autre inconnue ·
 * la ثنائية. La suite de la SECONDE méthode (les deux ثنائيات sont égales) finit par LA RÈGLE (l'ancienne découverte, qui formalise). Les mauvaises
 * options sont les erreurs réelles (ordre x ↔ y permuté, une seule valeur, signe perdu). Obligatoires pour tout élève ; l'enseignant seul les coupe
 * pour SON compte (`checkpoints` = false les coupe aussi). `onCheckpoint(ev)` : `{ tk: 'checkpoint' | 'checkpoint-done', id: 'sub' | 'add', … }`.
 * ÉTAPES `LabStepper` (`[data-ec-step=<i>]` : première méthode · seconde méthode + règle) + fête ; « إعادة » repart de zéro ; « أعِد التجربة » refait
 * la MÊME méthode (les cartes neuves, l'autre méthode gardée en mémoire). SON : `tooth` (isoler, multiplier, ligne suivante), `bell` (expression
 * portée, cartes posées), `flag` (la ثنائية), `over` (refus).
 *
 * AUTO-COMPLÉTION : NON (§6bis). Chaque geste est une décision (quelle inconnue, quelle carte,
 * quel multiplicateur) : « compléter » voudrait dire « résoudre à la place de l'élève ». Seules les
 * lignes de l'équation à UNE inconnue (le savoir de l'unité 4) se révèlent au toucher.
 *
 * DÉCOR (demande du propriétaire) : le comptoir du kiosque, un plateau de كرنتيكة et deux
 * bouteilles de gazouz ; toucher une bouteille fait monter ses bulles. AUCUNE information,
 * `aria-hidden`, hors du clavier (`tabIndex=-1`), jamais un état du laboratoire, immobile sous
 * `prefers-reduced-motion`. Ce n'est pas la balance de l'unité 4 : rien ne penche ici, les
 * tuiles se REMPLACENT et s'ANNULENT (DNA §12).
 *
 * D'UN SEUL REGARD (règle du propriétaire, 2026-10-01) : tout le laboratoire tient dans la fenêtre,
 * sans défiler pour voir ou agir. Chaque carte porte sa poignée « (n) », ses tuiles, sa valeur et,
 * dans le même cadre, son multiplicateur ; le tiroir suit ; la ligne de l'étape en cours est AU-DESSUS
 * (l'historique des lignes et le tableau des méthodes sont dessous, secondaires). Les tuiles sont
 * dimensionnées par le conteneur et la hauteur d'écran (`clamp(22px, min(7.5cqi, 5.2dvh), 52px)`),
 * jamais en px fixes. Mesuré au navigateur (boîtes Playwright contre la fenêtre, sous l'en-tête de
 * l'application, aux deux niveaux, aux étapes cartes / tiroir rempli / retour de la valeur) à
 * 1280×800, 1366×768, 390×844 et 320×640 : les deux cartes, les deux poignées × k, le tiroir, la
 * valeur et ses deux cibles sont visibles ensemble — porter une carte sur l'autre ne défile jamais.
 *
 * CONTRAT DOM (e2e) :
 *   [data-elimination-cards][data-method="sub"|"add"|""][data-stage="cards"|"one"|"back"|"done"]
 *   [data-eq-card="1"|"2"] [data-eq-tile="x"|"y"|"c"] [data-scale-handle] (= [data-stretch-handle])
 *   [data-drag-source="card:<n>"|"expr:<n>"|"iso:<n>:<v>"|"val"]
 *   [data-drop-zone="card:<n>"|"tile:<n>:<v>"|"tray"|"back:<n>"]
 *   [data-ec-refused=<raison>] [data-ec-line] [data-ec-next] [data-ec-annihilate] [data-ec-bundles]
 *   [data-ec-result][data-x][data-y] [data-ec-methods] [data-ec-other] [data-ec-current] [data-deco]
 *   [data-lab-fold="elimination-cards.lines"|"elimination-cards.methods"] (LabFold : l'historique, repliable)
 */

// Tuiles dimensionnées par le conteneur ET par la hauteur de l'écran (jamais un px fixe) : le
// laboratoire entier tient dans la fenêtre, du téléphone 320×640 au projecteur.
const TILE = 'clamp(22px, min(7.5cqi, 5.2dvh), 52px)';
const TONE = {
  x: { on: 'bg-amber-400 border-amber-600 text-amber-950', off: 'bg-amber-50 border-amber-500 text-amber-800' },
  y: { on: 'bg-teal-400 border-teal-700 text-teal-950', off: 'bg-teal-50 border-teal-600 text-teal-800' },
};

/** Une tuile x / y : pleine pour +1, pointillée rose pour −1. */
export function Tile({ v, negative, label, crossed = false }) {
  return (
    <span data-eq-tile={v} data-negative={negative ? 'true' : undefined}
      className={`relative inline-flex items-center justify-center rounded-md border-2 font-mono font-extrabold leading-none ${negative ? 'border-dashed border-rose-500 bg-rose-50 text-rose-700' : TONE[v].on} ${crossed ? 'opacity-50' : ''}`}
      style={{ minWidth: TILE, height: TILE, fontSize: `calc(${TILE} * 0.45)`, paddingInline: label ? 4 : 0 }}>
      {label ? `${negative ? '−' : ''}${label}${v}` : `${negative ? '−' : ''}${v}`}
      {crossed && <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-0.5 -rotate-12 bg-slate-700" />}
    </span>
  );
}

/** Les tuiles d'un terme (|coef| tuiles, ou une seule tuile portant le coefficient). */
function Tiles({ v, coef, decimal }) {
  const tiles = E.tilesOf(coef);
  if (!tiles.count) return null;
  const label = tiles.label ? E.numText(tiles.label, decimal) : null;
  return (
    <span className="inline-flex flex-wrap items-center gap-0.5">
      {Array.from({ length: tiles.count }, (_, i) => <Tile key={i} v={v} negative={tiles.negative} label={label} />)}
    </span>
  );
}

/** Le décor du kiosque : comptoir, كرنتيكة, bouteilles de gazouz à bulles. Aucune information. */
function KioskDeco() {
  const [fizz, setFizz] = useState(0);
  return (
    <div className="relative w-full overflow-hidden rounded-xl h-10" aria-hidden="true" data-deco>
      <svg viewBox="0 0 320 56" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={i * 20} y={0} width={20} height={12} fill={i % 2 ? '#FFFFFF' : '#DC2626'} />)}
        <path d="M0 12 Q10 18 20 12 Q30 18 40 12 Q50 18 60 12 Q70 18 80 12 Q90 18 100 12 Q110 18 120 12 Q130 18 140 12 Q150 18 160 12 Q170 18 180 12 Q190 18 200 12 Q210 18 220 12 Q230 18 240 12 Q250 18 260 12 Q270 18 280 12 Q290 18 300 12 Q310 18 320 12" fill="none" stroke="#B91C1C" strokeWidth="1.5" />
        <rect x={0} y={40} width={320} height={16} fill="#92400E" />
        <rect x={0} y={38} width={320} height={4} fill="#B45309" />
        {/* le plateau de كرنتيكة */}
        <rect x={24} y={28} width={64} height={11} rx={2} fill="#FDE68A" stroke="#B45309" />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={24 + 16 * (i + 1)} y1={28} x2={24 + 16 * (i + 1)} y2={39} stroke="#D97706" strokeWidth="1" />)}
      </svg>
      {[0, 1].map((b) => (
        <button key={b} type="button" tabIndex={-1} aria-hidden="true" onClick={() => setFizz((n) => n + 1)} data-deco-bottle={b}
          className="absolute bottom-1 h-8 w-5" style={{ right: `${18 + b * 9}%` }}>
          <svg viewBox="0 0 20 36" className="h-full w-full" aria-hidden="true" focusable="false">
            <rect x={7} y={0} width={6} height={6} rx={1} fill={b ? '#F97316' : '#16A34A'} />
            <path d="M6 6 L14 6 L16 12 L16 34 Q16 36 14 36 L6 36 Q4 36 4 34 L4 12 Z" fill={b ? '#FDBA74' : '#86EFAC'} stroke={b ? '#C2410C' : '#15803D'} />
            <rect x={4} y={18} width={12} height={7} fill="#FFFFFF" opacity={0.8} />
          </svg>
          {fizz % 2 === 1 && [0, 1, 2].map((i) => (
            <span key={i} className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-white ring-1 ring-sky-400 motion-safe:animate-bounce"
              style={{ bottom: `${92 + i * 14}%`, left: `${30 + (i - 1) * 25}%`, animationDelay: `${i * 120}ms` }} />
          ))}
        </button>
      ))}
    </div>
  );
}

/**
 * LECTEUR DE MISSION (rollout 2026-11-12, unité 5 leçon 2 `hall-jabri` ; conseil du 2026-11-11, verdict X7) : dans le lecteur le labo est
 * `EliminationCardsPlayer` (manches, questions, prédictions, guide) ; la page (enseignant, mode classe) reste `EliminationCardsPage`, inchangée.
 */
export default function EliminationCards(props) {
  const inPlayer = useInMissionPlayer();
  return inPlayer ? <EliminationCardsPlayer {...props} /> : <EliminationCardsPage {...props} />;
}

function EliminationCardsPage({
  system: sys0 = 'x+y=10|x-y=2', title, lead, mission, level, levels: withLevels = true, checkpoints: cpOn = true,
  initialMode = 'student', allowModeSwitch = false, onFinished, onTrial, onCheckpoint,
}) {
  const { t } = useTranslation('lesson');
  const k = useCallback((key, o) => t(`manipulation.eliminationCards.${key}`, o), [t]);
  const state = useManipulation({ type: 'elimination-cards', initialNumbers: { system: sys0 }, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { system } = state.numbers;

  const sceneKey = `${system}:${state.epoch}:${state.resetCount}`;
  const [scene, setScene] = useState({ key: sceneKey, inits: 0 });
  const [lab, setLab] = useState(() => E.init(sys0));
  const [notice, setNotice] = useState(null);
  const [live, setLive] = useState({ 1: null, 2: null });
  // « إعادة » (resetCount), un autre niveau ou une autre jumla : TOUT recommence — les cartes, la mémoire des méthodes et les questions du labo
  if (scene.key !== sceneKey) { setScene({ key: sceneKey, inits: scene.inits + 1 }); setLab(E.init(system)); setNotice(null); setLive({ 1: null, 2: null }); }

  const ready = E.discoveryReady(lab);
  // les questions pendant le labo : une suite quand une MÉTHODE est terminée ; la suite de la seconde finit par la règle (remplace la découverte automatique)
  const cpSettings = useLabCheckpointSettings('elimination-cards');   // obligatoires pour tout élève ; l'enseignant seul peut les couper, pour SON compte
  const cpLive = cpOn && cpSettings.enabled;
  const done = lab.stage === 'done' && !!lab.result;
  const chain = cpLive && lab.method ? chainOf(lab) : null;
  const cp = useLabCheckpoint({
    id: chain ? lab.method : null,
    questions: chain && done ? chain.map((q) => QUESTIONS[q](lab, k)) : null,
    reached: done,
    resetKey: scene.inits,
    // « أعِد التجربة » : la MÊME méthode repart de cartes neuves ; l'autre méthode, déjà faite, reste en mémoire
    onRetry: () => { setNotice(null); setLive({ 1: null, 2: null }); setLab((l) => E.init(l.src, { methodsDone: { ...l.methodsDone, [l.method]: null }, attempts: l.attempts.filter((a) => a.method !== l.method), refusals: l.refusals })); },
    onEvent: (ev) => state.report(onCheckpoint, ev),
    onDone: () => { if (E.discoveryReady(lab)) { state.discover(); state.formalize(); } },
  });
  useEffect(() => { if (ready && !cpLive) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  // une étape est FAITE quand sa méthode est terminée ET ses questions répondues : la pastille passe au vert et on fête
  const nMethods = Number(!!lab.methodsDone.sub) + Number(!!lab.methodsDone.add);
  const stepDone = [nMethods >= 1 && !(nMethods === 1 && cp.blocking), nMethods >= 2 && ready && !cp.blocking];
  const nDone = stepDone.findIndex((d) => !d) < 0 ? stepDone.length : stepDone.findIndex((d) => !d);
  const party = useStepCelebration();
  const celebrated = useRef({ n: 0, inits: scene.inits });
  if (celebrated.current.inits !== scene.inits) celebrated.current = { n: 0, inits: scene.inits };   // « إعادة » : on refête
  useEffect(() => {
    if (nDone <= celebrated.current.n) return;
    celebrated.current.n = nDone;
    party.celebrate({ n: nDone, total: stepDone.length });
  }, [nDone]); // eslint-disable-line react-hooks/exhaustive-deps
  const heard = useRef(0);
  const tick = () => { const now = Date.now(); if (now - heard.current > 35) { playSfx('tooth'); heard.current = now; } };
  useEffect(() => { if (state.isFormal) state.report(onFinished, system); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  const dec = lab.decimal;
  const commit = (next) => {
    const finished = next.stage === 'done' && lab.stage !== 'done';
    if (finished) playSfx('flag');
    setLab(next);
    if (finished) state.report(onTrial, E.summary(next));
  };

  /* ── porter ── */
  const verdict = (r) => (r === true ? true : r);
  const accepts = (src, zone) => {
    const [s, sn, sv] = src.split(':');
    const [z, zn, zv] = zone.split(':');
    const n = Number(zn);
    if (s === 'iso') return zone === 'tray' ? verdict(E.canIsolate(lab, Number(sn), sv)) : '';
    if (s === 'expr') {
      if (z === 'tile') return verdict(E.canSubstitute(lab, n, zv));
      if (z === 'card') return verdict(E.canSubstitute(lab, n, lab.expr?.v));
      return '';
    }
    if (s === 'card') {
      if (z !== 'card' && z !== 'tile') return '';
      return n === Number(sn) ? '' : verdict(E.canStack(lab, Number(sn), n));
    }
    if (s === 'val') return z === 'back' ? verdict(E.canBack(lab, n)) : '';
    return '';
  };
  const drag = useDragInteraction({
    accepts,
    onDrop: (src, zone) => {
      const [s, sn, sv] = src.split(':');
      const n = Number(zone.split(':')[1]);
      if (s === 'iso') {
        const next = E.isolateFrom(lab, Number(sn), sv);
        tick();
        setNotice({ tone: 'ok', key: 'notice_isolated', o: { expr: E.exprLine(next) } });
        commit(next);
      } else if (s === 'expr') {
        const next = E.substituteInto(lab, n);
        playSfx('bell');
        setNotice({ tone: 'ok', key: 'notice_substituted', o: { v: lab.expr.v, n } });
        commit(next);
      } else if (s === 'card') {
        const pairs = E.cancelledPairs(lab);
        const next = E.stack(lab, Number(sn), n);
        playSfx('bell');
        setNotice({ tone: 'ok', key: 'notice_stacked', o: { v: pairs?.v } });
        commit(next);
      } else if (s === 'val') {
        const next = E.backSubstitute(lab, n);
        setNotice({ tone: 'ok', key: 'notice_done', o: { pair: E.pairTex(next.result.x, next.result.y, dec) } });
        commit(next);
      }
    },
    onReject: (src, zone, reason) => {
      if (!reason) { setNotice(null); return; }
      const zv = zone.split(':')[2];
      let o = {};
      let key = `refuse_${reason}`;
      if (reason === 'sameCard') o = E.sameCardDetails(lab);
      if (reason === 'noCancel') {
        const d = E.noCancelDetails(lab);
        o = { sum: d.sum, v: d.equalVar };
        if (d.equalVar) key = 'refuse_noCancelEqual';
      }
      if (reason === 'wrongUnknown') o = { v: lab.expr?.v, w: zv };
      if (reason === 'noUnknownHere') o = { v: src.startsWith('expr') ? lab.expr?.v : zv };
      setLab((l) => E.refuse(l, reason));
      playSfx('over');
      setNotice({ tone: 'ko', key, reason, o });
    },
  });
  // Toucher une source posée DANS une zone en tenant un autre objet, c'est viser cette zone.
  const targetFor = (id) => {
    const held = drag.held;
    if (!held || drag.dragging || held === id) return null;
    const [h, hn] = held.split(':');
    const [s, sn, sv] = id.split(':');
    if (h === 'expr' && s === 'iso') return `tile:${sn}:${sv}`;
    if (h === 'expr' && s === 'card') return `card:${sn}`;
    if (h === 'card' && (s === 'iso' || s === 'card') && sn !== hn) return `card:${sn}`;
    return null;
  };
  const intercept = (id) => ({
    onPointerDownCapture: (e) => { if (targetFor(id)) { e.stopPropagation(); e.preventDefault(); } },
    onPointerUpCapture: (e) => { if (targetFor(id)) { e.stopPropagation(); e.preventDefault(); } },
    onClickCapture: (e) => { const z = targetFor(id); if (z) { e.stopPropagation(); e.preventDefault(); drag.dropHere(z); } },
    onKeyDownCapture: (e) => { const z = targetFor(id); if (z && (e.key === 'Enter' || e.key === ' ')) { e.stopPropagation(); e.preventDefault(); drag.dropHere(z); } },
  });
  // Une zone emboîtée (les tuiles d'une carte) garde son clic : il ne remonte pas à la carte.
  const keepInside = {
    onClick: (e) => e.stopPropagation(),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); },
  };

  /* ── multiplier une carte (étirement) ── */
  const commitScale = (n, v) => {
    setLive((s) => ({ ...s, [n]: null }));
    const r = E.canScale(lab, n, v);
    if (r === true) {
      if (v !== lab.scale[n]) { setNotice({ tone: 'info', key: 'notice_scaled', o: { n, k: v } }); tick(); }
      setLab(E.setScale(lab, n, v));
    } else if (r) {
      setLab((l) => E.refuse(l, r));
      playSfx('over');
      setNotice({ tone: 'ko', key: `refuse_${r}`, reason: r, o: {} });
    }
  };
  const toValue = (cx, _y, rect) => E.SCALE_MIN + ((cx - rect.left - 22) / Math.max(1, rect.width - 44)) * (E.SCALE_MAX - E.SCALE_MIN);
  const s1 = useStretchInteraction({ value: live[1] ?? lab.scale[1], range: { min: E.SCALE_MIN, max: E.SCALE_MAX }, toValue, onChange: (v) => setLive((s) => ({ ...s, 1: v })), onCommit: (v) => commitScale(1, v), direction: 'ltr' });
  const s2 = useStretchInteraction({ value: live[2] ?? lab.scale[2], range: { min: E.SCALE_MIN, max: E.SCALE_MAX }, toValue, onChange: (v) => setLive((s) => ({ ...s, 2: v })), onCommit: (v) => commitScale(2, v), direction: 'ltr' });
  const stretchOf = { 1: s1, 2: s2 };

  /* ── la scène ── */
  const shownScale = (n) => live[n] ?? lab.scale[n];
  const shownCard = (n) => (shownScale(n) === 0 ? null : E.card({ ...lab, scale: { ...lab.scale, [n]: shownScale(n) } }, n));
  const plainEq = (e) => E.eqTex(e, dec).replace(/\{,\}/g, ',').replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, '$1/$2');

  const tileGroup = (n, v, e) => {
    const coef = v === 'x' ? e.a : e.b;
    if (E.tilesOf(coef).count === 0) return null;
    const id = `iso:${n}:${v}`;
    return (
      <span {...keepInside} className="inline-flex">
        <DropZone drag={drag} id={`tile:${n}:${v}`} tone="amber" minHeight="min-h-0" label={k('tileZone', { v, n })}
          className="inline-flex items-center p-0.5" data-ec-tiles={`${n}:${v}`}>
          <span {...intercept(id)} className="inline-flex">
            <DraggableObject drag={drag} id={id} label={k('isolateSource', { v, n })} disabled={lab.stage !== 'cards'}
              className="inline-flex min-h-[44px] items-center rounded-lg px-0.5">
              <Tiles v={v} coef={coef} decimal={dec} />
            </DraggableObject>
          </span>
        </DropZone>
      </span>
    );
  };

  // UNE carte = sa poignée « (n) », ses tuiles et sa valeur sur UNE rangée (la zone), puis, juste
  // dessous et dans le même cadre, son multiplicateur × k : la commande est À CÔTÉ de l'objet
  // qu'elle transforme (règle « d'un seul regard » : tout le laboratoire tient dans l'écran).
  const cardView = (n) => {
    const e = shownCard(n);
    const scaled = shownScale(n);
    const st = stretchOf[n];
    return (
      <div key={n} className="min-w-0 space-y-1 rounded-2xl border border-slate-200 bg-white/80 p-1" data-eq-card={n} data-scale={scaled}>
        <DropZone drag={drag} id={`card:${n}`} tone="emerald" minHeight="min-h-0"
          label={k('cardZone', { n, eq: e ? plainEq(e) : '0 = 0' })} className="p-1">
          <div dir="ltr" className="flex flex-wrap items-center gap-1" data-eq-row>
            <span {...intercept(`card:${n}`)} className="inline-flex">
              <DraggableObject drag={drag} id={`card:${n}`} label={k('cardHandle', { n })} disabled={lab.stage !== 'cards'}
                className="inline-flex h-11 min-w-[44px] items-center justify-center gap-0.5 rounded-xl border-2 border-emerald-500 bg-white px-1 text-sm font-extrabold text-emerald-800">
                <Hand className="h-4 w-4" aria-hidden="true" /><span>({n})</span>
              </DraggableObject>
            </span>
            {e ? (
              <>
                {tileGroup(n, 'x', e)}
                {tileGroup(n, 'y', e)}
                <span className="px-0.5 font-mono text-lg font-bold text-slate-600">{k('eq')}</span>
                <span data-eq-tile="c" className="inline-flex items-center rounded-lg border-2 border-slate-400 bg-slate-50 px-1.5 font-mono font-extrabold text-slate-800"
                  style={{ minHeight: TILE, fontSize: `calc(${TILE} * 0.55)` }}>
                  {E.numText(e.c, dec)}
                </span>
              </>
            ) : (
              <span className="rounded-lg bg-rose-50 px-2 py-1 text-sm font-bold text-rose-700" data-ec-zero-card>
                {k('zeroCard')} <span className="font-mono">0 = 0</span>
              </span>
            )}
          </div>
        </DropZone>
        {lab.stage === 'cards' && (
          <div className="flex items-center gap-1" dir="ltr" data-ec-scale={n}>
            <button type="button" onClick={() => st.nudge(-1)} aria-label={k('fewer', { n })} disabled={scaled <= E.SCALE_MIN}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
            <div {...st.trackProps} className="relative h-11 min-w-[60px] flex-1" style={{ ...st.trackProps.style }} data-ec-scale-track={n}>
              <div className="absolute inset-x-[22px] top-1/2 h-1.5 -translate-y-1/2 rounded bg-violet-300" />
              <div className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-violet-500" style={{ left: 'calc(22px + (100% - 44px) * 0.5)' }} />
              <div {...st.handleProps({ label: k('scaleHandle', { n }), valueText: k('scaleValue', { k: scaled }) })} data-scale-handle={n}
                className={`absolute top-0 flex h-11 min-w-[44px] -translate-x-1/2 items-center justify-center rounded-xl border-2 px-1 font-mono text-sm font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${scaled === 0 ? 'border-rose-500 bg-rose-50 text-rose-700' : st.dragging ? 'border-blue-500 bg-blue-50' : 'border-violet-500 bg-white'}`}
                style={{ left: `calc(22px + (100% - 44px) * ${(scaled - E.SCALE_MIN) / (E.SCALE_MAX - E.SCALE_MIN)})` }}>
                ×{scaled}
              </div>
            </div>
            <button type="button" onClick={() => st.nudge(1)} aria-label={k('more', { n })} disabled={scaled >= E.SCALE_MAX}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
          </div>
        )}
      </div>
    );
  };

  const exprText = lab.expr ? E.exprLine(lab) : null;
  const subTarget = lab.method === 'sub' ? lab.lines.find((l) => l.key === 'substitute') : null;
  const last = lab.lines.at(-1);
  const checks = E.checkLines(lab);
  const missing = E.missingMethod(lab);

  const noticeText = (nt) => (nt ? k(nt.key, nt.o) : null);
  const toneClass = { ko: 'text-rose-800', ok: 'text-emerald-800', info: 'text-sky-800' };

  return (
    <ManipulationShell
      type="elimination-cards"
      title={bidi(title ?? k('title'))}
      mission={mission ?? <MathText>{k('mission', { sys: E.systemTex(lab) })}</MathText>}
      lead={typeof lead === 'string' ? bidi(lead) : lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpSettings.control}
      guided={cpLive}
      hints={[k('hint1'), k('hint2'), k('hint3')].map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={k('discoveryPrompt')}
          options={discoveryOptions(k)}
          formal={<Formal lab={lab} k={k} />}
        />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-orange-50/60 to-white" data-dragging={drag.dragging || s1.dragging || s2.dragging ? 'true' : undefined}>
        <div className="relative space-y-3" style={{ containerType: 'inline-size' }}
          data-elimination-cards data-system={system} data-method={lab.method} data-stage={lab.stage}>
          {party.node}
          {cp.node}
          <LabStepper count={stepDone.length} current={Math.min(nDone, stepDone.length - 1)} done={stepDone} stepAttr="data-ec-step" />
          <KioskDeco />

          {/* la ligne de l'étape en cours, AU-DESSUS des cartes (l'historique complet est plus bas) */}
          {last && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-2 py-1" data-ec-current>
              <span className="text-xs text-slate-500">{k(`line_${last.key}`, { n: last.n, v: last.v, k: last.k })}</span>
              <span dir="ltr" className="font-bold text-slate-900"><MathText>{`$${last.tex}$`}</MathText></span>
            </div>
          )}

          {lab.stage === 'cards' && (
            <>
              <div className="grid gap-1.5 grid-cols-2" aria-label={k('ariaCards', { eq1: plainEq(lab.sys[0]), eq2: plainEq(lab.sys[1]) })}>
                {E.CARDS.map((n) => cardView(n))}
              </div>
              <DropZone drag={drag} id="tray" tone="indigo" label={k('trayZone')} minHeight="min-h-[48px]" className="flex flex-wrap items-center gap-2 p-1.5" data-ec-tray>
                <span className="text-xs font-bold text-indigo-900">{k('tray')}</span>
                {lab.expr ? (
                  <>
                    <DraggableObject drag={drag} id={`expr:${lab.expr.from}`} label={k('exprChip', { expr: exprText, n: lab.expr.from, v: lab.expr.v })}
                      className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-indigo-500 bg-white px-2 text-base font-bold text-indigo-950">
                      <span dir="ltr"><MathText>{`$${exprText}$`}</MathText></span>
                    </DraggableObject>
                    <span className="text-[11px] text-slate-600">{k('exprCarry', { v: lab.expr.v })}</span>
                    {lab.expr.fractional && <span className="w-full text-[11px] text-amber-800" data-ec-fractional>{k('exprFractional')}</span>}
                  </>
                ) : (
                  <span className="text-[11px] text-slate-500">{k('trayEmpty')}</span>
                )}
              </DropZone>
              <p className="text-[11px] leading-tight text-violet-800">{k('bothSides')}</p>
            </>
          )}

          {lab.stage !== 'cards' && (
            <div className="space-y-2 rounded-2xl border-2 border-slate-200 bg-white p-2" data-ec-one>
              {lab.stage === 'one' && <p className="text-sm font-extrabold text-slate-800">{k('oneTitle')}</p>}
              {lab.stage === 'one' && lab.method === 'sub' && subTarget && (
                <div className="space-y-1" data-ec-bundles>
                  <p className="text-xs text-slate-600">{k('bundlesTitle', { n: subTarget.n, v: subTarget.v })}</p>
                  <div dir="ltr" className="flex flex-wrap items-center gap-1">
                    {(() => {
                      const e = E.card(lab, subTarget.n);
                      const u = E.other(subTarget.v);
                      const own = subTarget.v === 'x' ? e.a : e.b;
                      const tiles = E.tilesOf(own);
                      const bundle = `(${E.exprTex(lab.expr, u, dec)})`;
                      return (
                        <>
                          <Tiles v={u} coef={u === 'x' ? e.a : e.b} decimal={dec} />
                          {Array.from({ length: tiles.count }, (_, i) => (
                            <span key={i} data-ec-bundle className={`inline-flex min-h-[36px] items-center rounded-lg border-2 px-1.5 ${tiles.negative ? 'border-dashed border-rose-500 bg-rose-50 text-rose-800' : 'border-indigo-500 bg-indigo-50 text-indigo-900'}`}>
                              <MathText>{`$${tiles.negative ? '-' : ''}${tiles.label ? `${E.numTex(tiles.label, dec)}` : ''}${bundle}$`}</MathText>
                            </span>
                          ))}
                          <span className="px-1 font-mono text-xl font-bold text-slate-600">{k('eq')}</span>
                          <span data-eq-tile="c" className="inline-flex min-h-[36px] items-center rounded-lg border-2 border-slate-400 bg-slate-50 px-2 font-mono text-lg font-extrabold">{E.numText(e.c, dec)}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              {lab.stage === 'one' && lab.method === 'add' && lab.pairs && (
                <div className="space-y-1" data-ec-annihilate={lab.pairs.v}>
                  <p className="text-xs text-slate-600">{k('annihilateTitle', { v: lab.pairs.v })}</p>
                  <div dir="ltr" className="flex flex-wrap items-center gap-1.5">
                    {Array.from({ length: lab.pairs.count ?? 1 }, (_, i) => (
                      <span key={i} className="inline-flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5" data-ec-pair>
                        <Tile v={lab.pairs.v} negative={false} label={lab.pairs.count ? null : E.numText(lab.pairs.coef, dec)} crossed />
                        <Tile v={lab.pairs.v} negative label={lab.pairs.count ? null : E.numText(lab.pairs.coef, dec)} crossed />
                        <span className="px-0.5 font-mono text-sm font-bold text-slate-500">= 0</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {lab.stage === 'one' && (
                <button type="button" onClick={() => { tick(); commit(E.solveStep(lab)); }} data-ec-next
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-4 font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300">
                  <ChevronDown className="h-5 w-5" aria-hidden="true" /> <span>{k('nextLine')}</span>
                </button>
              )}
              {lab.stage === 'back' && lab.found && (
                <div className="space-y-2" data-ec-back>
                  <p className="text-sm font-bold text-slate-700">{k('backTitle')}</p>
                  <DraggableObject drag={drag} id="val" label={k('valueChip', { v: lab.found.v, value: E.numText(lab.found.value, dec) })}
                    className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-blue-500 bg-blue-50 px-3 font-bold text-blue-950">
                    <span dir="ltr"><MathText>{`$${lab.found.v} = ${E.numTex(lab.found.value, dec)}$`}</MathText></span>
                  </DraggableObject>
                  <div className="grid grid-cols-2 gap-1.5">
                    {E.CARDS.map((n) => (
                      <DropZone key={n} drag={drag} id={`back:${n}`} tone="emerald" minHeight="min-h-[48px]" className="flex flex-wrap items-center justify-center gap-1 p-1 text-sm"
                        label={k('backZone', { n, eq: plainEq(lab.sys[n - 1]) })}>
                        <span className="font-bold text-slate-600">({n})</span>
                        <span dir="ltr" className="whitespace-nowrap"><MathText>{`$${E.eqTex(lab.sys[n - 1], dec)}$`}</MathText></span>
                      </DropZone>
                    ))}
                  </div>
                </div>
              )}
              {lab.stage === 'done' && lab.result && (
                <div className="space-y-2" data-ec-result data-x={E.numText(lab.result.x)} data-y={E.numText(lab.result.y)}>
                  <EquationDisplay tone="ok" tex={E.pairTex(lab.result.x, lab.result.y, dec)} note={k('resultTitle')} />
                  <p className="text-xs font-bold text-slate-600">{k('checkTitle')}</p>
                  <ul className="space-y-1" data-ec-checks>
                    {checks.map((c) => (
                      <li key={c.n} className="flex flex-wrap items-center gap-2 text-sm" data-ok={String(c.ok)}>
                        <span className="text-slate-500">({c.n})</span>
                        <span dir="ltr"><MathText>{`$${c.tex}$`}</MathText></span>
                        {c.ok && <span className="text-xs font-bold text-emerald-700">✓ {k('checkOk')}</span>}
                      </li>
                    ))}
                  </ul>
                  {missing ? (
                    <button type="button" onClick={() => { setNotice(null); setLab(E.restart(lab)); }} data-ec-other={missing}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-indigo-500 bg-white px-4 font-bold text-indigo-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300">
                      <RotateCcw className="h-5 w-5" aria-hidden="true" /> <span>{k('tryOther', { method: k(`method_${missing}`) })}</span>
                    </button>
                  ) : (
                    <p className="text-sm font-bold text-emerald-800">{k('bothDone')}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <p className="min-h-[1.25rem] text-sm font-semibold" aria-live="polite" data-ec-refused={notice?.tone === 'ko' ? notice.reason : undefined} data-ec-notice={notice?.key}>
            {notice && <span className={toneClass[notice.tone]}><MathText>{noticeText(notice)}</MathText></span>}
          </p>

          {/* secondaire, repliable (« إخفاء / إظهار ») : l'historique des lignes et le tableau des méthodes */}
          {lab.lines.length > 0 && (
            <LabFold id="elimination-cards.lines" title={k('linesTitle')}>
              <ol className="space-y-1 text-sm" data-ec-lines>
                {lab.lines.map((l, i) => (
                  <li key={i} className="space-y-0.5 border-t border-slate-100 pt-1 first:border-t-0 first:pt-0" data-ec-line={i} data-line-key={l.key}>
                    <p className="text-xs text-slate-500">{k(`line_${l.key}`, { n: l.n, v: l.v, k: l.k })}</p>
                    <p dir="ltr" className="text-start font-bold text-slate-900"><MathText>{`$${l.tex}$`}</MathText></p>
                  </li>
                ))}
              </ol>
            </LabFold>
          )}

          {lab.attempts.length > 0 && (
            <LabFold id="elimination-cards.methods" title={k('methodsTitle')}>
              <ul className="grid gap-1 text-xs grid-cols-2" data-ec-methods>
                {lab.attempts.map((a, i) => (
                  <li key={i} className="rounded-lg bg-slate-50 px-2 py-1" data-ec-method={a.method}>
                    <strong>{k(`method_${a.method}`)}</strong> — <span dir="ltr"><MathText>{`$${E.pairTex(E.parseNum(a.pair.x), E.parseNum(a.pair.y), dec)}$`}</MathText></span>
                    {' · '}{k('methodLines', { n: a.lines })}{a.fractional ? ` · ${k('methodFractions')}` : ''}
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

/* ══════════════ La découverte et la règle ══════════════ */

export function discoveryOptions(k) {
  return [
    { text: <MathText>{k('opt2')}</MathText>, why: <MathText>{k('why2')}</MathText> },
    { text: <MathText>{k('opt1')}</MathText>, correct: true },
    { text: <MathText>{k('opt3')}</MathText>, why: <MathText>{k('why3')}</MathText> },
  ];
}

export function Formal({ lab, k }) {
  return (
    <div className="space-y-2" data-ec-formal>
      <p className="rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900"><MathText>{k('formalNote')}</MathText></p>
      {lab.methodsDone.sub && (
        <EquationDisplay tone="result" tex={`(x ; y) = ${E.pairTex(E.parseNum(lab.methodsDone.sub.x), E.parseNum(lab.methodsDone.sub.y), lab.decimal)}`}
          note={<MathText>{k('yourCase')}</MathText>} />
      )}
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

/** La suite d'une méthode terminée ; celle de la SECONDE (les deux ثنائيات égales) finit par LA RÈGLE. */
export function chainOf(lab) {
  const base = lab.method === 'add' ? ['sumValue', 'found', 'other', 'pair'] : ['found', 'other', 'pair'];
  return E.discoveryReady(lab) ? [...base, 'rule'] : base;
}

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const isNeg = (f) => E.numText(f).startsWith('-');

/**
 * Une valeur à donner : `number` si elle se tape (positive, décimale ou fraction), sinon `choice` — la valeur, son opposé (le signe perdu) et
 * l'autre inconnue (x et y confondus) : un nombre négatif ne se tape pas (`readNumber`).
 */
function valueQuestion(id, value, other, dec, text, hints, explain) {
  const shown = E.numTex(value, dec);
  if (!isNeg(value)) return { id, kind: 'number', expected: E.numText(value, dec), answer: <MathText>{$(shown)}</MathText>, prompt: text, hints, explain };
  const opposite = Lin.neg(value);
  const opts = [{ text: <MathText>{$(shown)}</MathText>, correct: true }, { text: <MathText>{$(E.numTex(opposite, dec))}</MathText> }];
  if (E.numText(other) !== E.numText(value) && E.numText(other) !== E.numText(opposite)) opts.push({ text: <MathText>{$(E.numTex(other, dec))}</MathText> });
  return { id, kind: 'choice', cols: 3, prompt: text, options: opts, hints, explain };
}

export const QUESTIONS = {
  sumValue: (lab, k) => {
    const dec = lab.decimal;
    const e1 = E.card(lab, 1); const e2 = E.card(lab, 2);
    const { sum } = E.stackSum(lab);
    const o = { c1: $(E.numTex(e1.c, dec)), c2: $(E.numTex(e2.c, dec)), calc: $(`${E.numTex(e1.c, dec)}+${isNeg(e2.c) ? `(${E.numTex(e2.c, dec)})` : E.numTex(e2.c, dec)}=${E.numTex(sum.c, dec)}`) };
    return valueQuestion('sumValue', sum.c, e1.c, dec, Cq(k, 'sumValue.prompt', o), [Cq(k, 'sumValue.hint1'), Cq(k, 'sumValue.hint2', o)], Cq(k, 'sumValue.explain', o));
  },
  found: (lab, k) => {
    const dec = lab.decimal;
    const { v, value } = lab.found;
    const o = { u: $(v), c: $(E.numTex(lab.one.c, dec)), a: $(E.numTex(lab.one.a, dec)), calc: $(`${v}=${E.numTex(value, dec)}`) };
    return valueQuestion('found', value, lab.one.a, dec, Cq(k, 'found.prompt', o), [Cq(k, 'found.hint1', o), Cq(k, 'found.hint2', o)], Cq(k, 'found.explain', o));
  },
  other: (lab, k) => {
    const dec = lab.decimal;
    const { v, value } = lab.found;
    const w = E.other(v);
    const wValue = v === 'x' ? lab.result.y : lab.result.x;
    const back = lab.lines.find((l) => l.key === 'back');
    const o = { v: $(v), w: $(w), value: $(E.numTex(value, dec)), n: lab.result.via, line: $(back.tex), calc: $(`${w}=${E.numTex(wValue, dec)}`) };
    return valueQuestion('other', wValue, value, dec, Cq(k, 'other.prompt', o), [Cq(k, 'other.hint1', o), Cq(k, 'other.hint2', o)], Cq(k, 'other.explain', o));
  },
  pair: (lab, k) => {
    const dec = lab.decimal;
    const { x, y } = lab.result;
    const right = E.pairTex(x, y, dec);
    const swapped = E.numText(x) !== E.numText(y) ? E.pairTex(y, x, dec) : E.pairTex(x, Lin.neg(y), dec);
    const single = `x=${E.numTex(x, dec)}`;
    const o = { right: $(right), x: $(`x=${E.numTex(x, dec)}`), y: $(`y=${E.numTex(y, dec)}`), swapped: $(swapped), single: $(single) };
    return {
      id: 'pair', kind: 'choice', cols: 3, prompt: Cq(k, 'pair.prompt'),
      options: [
        { text: <MathText>{$(swapped)}</MathText>, why: Cq(k, E.numText(x) !== E.numText(y) ? 'pair.whySwap' : 'pair.whySign', o) },
        { text: <MathText>{$(right)}</MathText>, correct: true },
        { text: <MathText>{$(single)}</MathText>, why: Cq(k, 'pair.whyOne', o) },
      ],
      hints: [Cq(k, 'pair.hint1'), Cq(k, 'pair.hint2', o)], explain: Cq(k, 'pair.explain', o),
    };
  },
  rule: (lab, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('discoveryPrompt')}</MathText>,
    options: discoveryOptions(k),
    hints: [Cq(k, 'rule.hint1', { sub: $(E.pairTex(E.parseNum(lab.methodsDone.sub.x), E.parseNum(lab.methodsDone.sub.y), lab.decimal)) }), Cq(k, 'rule.hint2')],
    explain: <Formal lab={lab} k={k} />,
  }),
};
