import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import DropZone from '../primitives/DropZone';
import DraggableObject from '../primitives/DraggableObject';
import DragGhost from '../primitives/DragGhost';
import NumberTile from '../primitives/NumberTile';
import EquationDisplay from '../primitives/EquationDisplay';
import DivisionRoles from '../primitives/DivisionRoles';
import PlayerFigure, { FootballIcon } from '../primitives/PlayerFigure';
import PitchBackdrop from '../primitives/PitchBackdrop';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import RolesEquation from '../primitives/RolesEquation';
import PredictTray from '../primitives/PredictTray';
import { useInMissionPlayer, useMissionArea } from '../../mission/missionPlayerContext';

// Ce que la scène porte autour des terrains dans le lecteur (étapier, pastilles, journal, en-têtes d'équipe, banc en groupes
// de 5 SOUS les terrains — conseil 2026-11-07) : le terrain prend toute la hauteur qui reste.
const PLAYER_SCENE_OVERHEAD_SIDE_BENCH = 330;
import MathText from '../../components/MathText';
import { wrongEqualities, eqTex, splitKey, chipsAround, buildTiles } from './divisionChecks';
import * as L from '../logic/teamBuilder';
import { formationPositions, playerScale } from './teamFormation';

/**
 * team-builder — LE PARTAGE ÉQUITABLE, DEBOUT SUR LE TERRAIN.
 *
 * A. Ce que l'élève MANIPULE : des joueurs, un par un, qu'il porte du banc
 *    vers une équipe.
 * B. Idée : partager n en k parts égales, c'est n = k × q + r.
 * C. Ce qui change : l'équipe s'agrandit, le compteur monte, le banc se
 *    vide. Quand les équipes sont pleines, le joueur en trop ne peut entrer
 *    NULLE PART — il reste sur le banc, visible, tête basse.
 * D. Représentation qui ÉMERGE : n = k × q + r, écrite après le geste, avec
 *    le reste en ambre quand il y en a un.
 * E. À découvrir AVANT la règle : « ça tombe juste » n'est pas une chance —
 *    les effectifs qui marchent sont exactement les قواسم de n.
 *
 * FIDÉLITÉ. La mathématique est celle de l'activité 1 du manuel (p. 8) :
 * répartition en parts égales, reste nul ⇔ قاسم. Le CONTEXTE est de la
 * plateforme — des équipes plutôt que des rayons de bibliothèque — parce
 * qu'un élève de 4AM se projette dans une équipe et pas dans une réserve de
 * librairie. La structure est intacte : même opération, même égalité, même
 * découverte. La traçabilité est déclarée dans `lesson.config.js`
 * (`experience: { type: 'platform_context', reason: … }`).
 *
 * « أنشئ الفرق » (MANIPULATION_CONTRACT §6bis). Le premier partage se fait
 * à la main — et c'est APPLIQUÉ (`unlock: 'first-gesture'`, `manualDone` =
 * une répartition menée jusqu'au bout sans le bouton ; jusqu'au 2026-09-29
 * le bouton s'ouvrait avant tout geste). C'est ce premier partage qui montre
 * ce que « à parts égales » veut dire. Pour
 * les suivants (20 en 4, 18 en 5…), porter vingt joueurs ne serait plus que
 * de la répétition : le bouton les répartit, joueur par joueur, avec la même
 * règle `canPlace` que le geste — les joueurs déjà placés restent où l'élève
 * les a mis, et le seizième reste sur le banc comme à la main.
 *
 * POURQUOI LE REFUS EST LA LEÇON. `canPlace` n'accepte un joueur que si les
 * équipes restent ÉGALES. L'élève qui essaie d'entasser six joueurs dans une
 * équipe reçoit une raison en arabe — et comprend, par le geste, que
 * « partager » veut dire « à parts égales ». C'est la même exigence qui rend
 * le seizième joueur physiquement impossible à placer.
 *
 * CE QUE L'ÉCRAN NE DIT PAS D'AVANCE. Le badge d'une équipe compte ses
 * joueurs (« 3 »), il n'annonce pas la part visée (« 3/5 ») : q est ce que le
 * partage PRODUIT, pas une consigne. Le banc s'appelle « في الانتظار » tant
 * que des joueurs peuvent encore entrer, et « خارج الفرق — الباقي » quand plus
 * rien ne bouge : une même zone, deux sens, et l'écran nomme celui du moment.
 *
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater) : `logic/teamBuilder.js › coachOf` montre le joueur du banc à porter (sans
 * nommer l'équipe : c'est le refus d'égalité qui répond), puis la pastille d'un autre nombre d'équipes — ou, au niveau avancé sans
 * pastilles, le bouton du laboratoire libre.
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, lot 2, 2026-10-28). Pas de tâches successives : DEUX étapes (`LabStepper`,
 * `[data-tb-step]`) — (1) un premier partage, interrogé sur SES nombres (`first` : combien par équipe, combien dehors, quelle égalité) ;
 * (2) le contraste vu (une répartition juste ET une qui laisse quelqu'un) : `contrast` (laquelle a laissé quelqu'un · combien en ajouter ·
 * LA RÈGLE, qui remplace la découverte automatique). Obligatoires pour tout élève ; l'enseignant seul les coupe (interrupteur dans l'en-tête).
 * « إعادة » repart de zéro ; « أعِد التجربة » efface les essais. SON : `tooth` (un joueur posé), `bell` (équipes pleines, rien dehors),
 * `over` (refus d'égalité), `flag` (le contraste est vu).
 *
 * PARTITION. Ici b est le NOMBRE de groupes que l'élève fixe, q la taille qui
 * en résulte ; aux rayons (divisor-explorer-books) c'est l'inverse. Les rôles
 * sont nommés sous l'égalité (`DivisionRoles`) pour que le passage d'un
 * laboratoire à l'autre ne soit jamais silencieux.
 */
export default function TeamBuilder({
  total: total0 = 15,
  groups: groups0 = 3,
  teamChoices,
  squadChoices,
  title, lead, mission,
  level,
  initialMode = 'student',
  allowModeSwitch = false,
  onVerdict, onFinished,
  coach: coachOn = true,
  checkpoints: cpOn = true,
  onTrial,
  // false : un EXEMPLE TRAVAILLÉ, sans sélecteur مبتدئ / متقدم (comme divisor-explorer-books)
  levels: withLevels = true,
  // true : l'élève a DÉJÀ partagé à la main (une manche précédente) — « أنشئ الفرق » s'ouvre d'emblée : on ne lui fait pas
  // porter 42 ou 48 joueurs un par un une seconde fois (propriétaire, 2026-11-04).
  handDone = false,
}) {
  // L'écran de jeu du lecteur de mission : le terrain s'y borne en largeur (voir data-team-pitch-area).
  const gameScreen = useInMissionPlayer();
  const area = useMissionArea();
  // la largeur du terrain qui fait tenir sa hauteur (2:3) dans l'écran : aussi GRAND que possible, jamais trop petit
  const pitchMax = gameScreen && area?.height ? Math.round(Math.min(360, Math.max(150, (area.height - PLAYER_SCENE_OVERHEAD_SIDE_BENCH) / 1.5))) : undefined;
  const { t } = useTranslation('lesson');
  const state = useManipulation({
    type: 'team-builder',
    initialNumbers: { total: total0, groups: groups0 },
    initialMode,
    hintCount: 3,
    initialLevel: level,
    withLevels: withLevels !== false,
  });
  // Le niveau VIVANT : celui du workspace, ou celui que l'élève a choisi
  // dans le sélecteur de la manipulation posée seule.
  const isAdvanced = state.level === 'advanced';
  const { total, groups } = state.numbers;
  const [lab, setLab] = useState(() => L.init({ total: total0, groups: groups0 }));
  const [reject, setReject] = useState(null);
  // La MÉMOIRE des configurations essayées vit HORS de `lab`, parce que `lab`
  // repart à zéro à chaque changement de nombres. Or c'est précisément en
  // changeant les nombres (15 → 16) que l'élève produit le CONTRASTE qui
  // ouvre la découverte : le garder dans `lab` l'effacerait à l'instant même
  // où il devient intéressant.
  const [tried, setTried] = useState({});
  // « أنشئ الفرق » s'ouvre après UNE répartition menée à la main jusqu'au
  // bout. `autoUsed` dit si le bouton a servi dans la configuration en cours.
  const [handShared, setHandShared] = useState(Boolean(handDone));
  const autoUsed = useRef(false);
  const [doneIds, setDoneIds] = useState({});
  const [retryN, setRetryN] = useState(0);

  // Nouveaux nombres (palier, mode classe, « إعادة ») : la scène repart.
  //
  // La réinitialisation se fait PENDANT le rendu, pas dans un effet. Un effet
  // s'exécute après le rendu : pendant une frame, `total` vaudrait déjà 16
  // tandis que `lab` décrirait encore les trois équipes pleines de la partie
  // à 15 — une scène « stabilisée » qui n'existe pas, et dont le verdict
  // (faux) était enregistré sous la nouvelle clé. C'est le procédé React
  // d'ajustement d'état sur changement de props : on compare, on corrige,
  // on laisse React re-rendre immédiatement avec un état cohérent.
  const signature = `${total}:${groups}:${state.epoch}`;
  const [labSignature, setLabSignature] = useState(signature);
  if (labSignature !== signature) {
    setLabSignature(signature);
    setLab(L.init({ total, groups }));
    setReject(null);
    autoUsed.current = false;
  }
  // « إعادة » efface AUSSI la mémoire : sinon la découverte se rouvrait sur une
  // scène vide (audit 2026-09-29, M1-F3). Changer de nombres, lui, la garde.
  const [memoryKey, setMemoryKey] = useState(state.resetCount);
  if (memoryKey !== state.resetCount) {
    setMemoryKey(state.resetCount);
    setTried({});
    setHandShared(false);
    setDoneIds({});
  }

  // `lab` peut décrire l'instant d'avant tant que l'ajustement ci-dessus
  // n'a pas été appliqué : on ne lit donc RIEN de lui pendant ce rendu-là.
  const stale = labSignature !== signature || lab.total !== total || lab.groups !== groups;
  const v = L.verdict(lab);

  // Dès que la scène se stabilise, on retient SON verdict. Aucun effet de
  // bord dans un updater (playbook §10.10) : on calcule d'abord, on agit
  // ensuite.
  const settled = v.settled && !stale;
  useEffect(() => {
    if (!settled) return;
    const key = `${total}:${groups}`;
    setTried((prev) => (key in prev ? prev : { ...prev, [key]: v.exact }));
    if (!autoUsed.current) setHandShared(true);
    state.report(onVerdict, { total, groups, perGroup: v.perGroup, leftOver: v.leftOver, exact: v.exact });
  }, [settled, v.exact, total, groups]); // eslint-disable-line react-hooks/exhaustive-deps
  // la prédiction de CETTE configuration, jugée par le terrain dès qu'il se stabilise
  useEffect(() => {
    if (!settled || !pred || pred.key !== `${total}:${groups}` || pred.ok != null) return;
    const ok = (pred.says === 'left') === !v.exact;
    setPred({ ...pred, ok });
    playSfx(ok ? 'correct' : 'pop');
    state.report(onTrial, { tk: 'predict', ok });
  }, [settled]); // eslint-disable-line react-hooks/exhaustive-deps

  // La découverte s'ouvre quand les DEUX cas ont été vus — un partage qui
  // tombe juste et un partage qui laisse quelqu'un dehors. C'est le contraste
  // qui enseigne, pas l'un des deux cas isolé.
  //
  // `state.epoch` est dans les dépendances, et c'est nécessaire : changer les
  // nombres (15 → 16) appelle `setNumbers`, qui appelle `reset()`, qui
  // REMET la phase à « جرّب ». Or c'est justement ce changement de nombres
  // qui produit le contraste. Sans réaffirmer la découverte après la remise
  // à zéro, elle serait annulée à l'instant même où elle est méritée.
  const contrastSeen = L.discoveryReady(tried);
  // PRÉDIRE AVANT D'AGIR (lecteur, pilote 2026-11-07) : avant de distribuer une nouvelle configuration, « هل سيبقى أحد على المقاعد؟ ».
  // Gratuit (une prédiction fausse ne coûte rien : le terrain répond), jugé quand la scène se stabilise, et compté pour l'étoile.
  const [pred, setPred] = useState(null); // { key, says: 'left' | 'none', ok?: boolean }
  // la mission en grand d'abord (ManipulationShell › onIntroChange), la prédiction ensuite : une chose à lire à la fois
  const [missionBig, setMissionBig] = useState(false);
  const configKey = `${total}:${groups}`;
  // les questions pendant le labo : obligatoires pour tout élève, l'enseignant seul les coupe pour SON compte
  const cpSettings = useLabCheckpointSettings('team-builder');
  const cpLive = cpOn && cpSettings.enabled;
  const triedKeys = Object.keys(tried);
  const cpId = cpLive && !stale ? (contrastSeen ? 'contrast' : triedKeys.length ? 'first' : null) : null;
  // Lecteur (pilote 2026-11-07, conseil) : 2 questions par arrêt — l'observation d'un toucher puis l'égalité BÂTIE ; après le
  // contraste, « laquelle a laissé quelqu'un » puis la règle (« fix » quitte la suite obligatoire : l'action le couvre).
  const chain = cpId ? (gameScreen ? CHAINS_PLAYER : CHAINS)[cpId] : null;
  const kq = (key, o) => t(`manipulation.teamBuilder.${key}`, o);
  const cp = useLabCheckpoint({
    id: cpId,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ tried, keys: triedKeys }, kq)) : null,
    reached: !!cpId,
    resetKey: `${state.resetCount}:${retryN}`,
    onRetry: () => { setTried({}); setHandShared(Boolean(handDone)); setLab(L.init({ total, groups })); autoUsed.current = false; setRetryN((n) => n + 1); setDoneIds({}); },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => ({ ...d, [id]: true }));
      if (id === 'contrast') { state.discover(); state.formalize(); }
    },
  });
  useEffect(() => { if (contrastSeen && !cpLive) state.discover(); }, [contrastSeen, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (state.isFormal) state.report(onFinished, v); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Le refus explique le geste qui vient d'échouer ; dès que la scène change,
  // il n'explique plus rien et doit disparaître (sinon l'élève lit un
  // reproche pour une action qu'il a corrigée).
  const placedCount = lab.teams.reduce((n, team) => n + team.length, 0);
  useEffect(() => { setReject(null); }, [placedCount, lab.bench.length, signature]);

  const drag = useDragInteraction({
    onDrop: (sourceId, zoneId) => {
      setReject(null);
      const playerId = Number(sourceId.replace('player:', ''));
      if (zoneId === 'bench') { setLab((s) => L.unplace(s, playerId)); return; }
      const teamIndex = Number(zoneId.replace('team:', ''));
      setLab((s) => L.place(s, playerId, teamIndex));
    },
    accepts: (sourceId, zoneId) => {
      const playerId = Number(sourceId.replace('player:', ''));
      // Le reposer dans SA propre équipe : un geste sans effet (un petit
      // glisser qui retombe sur place), pas une erreur — refus MUET, comme
      // pour le banc ci-dessous (audit 2026-09-29, M1-F2).
      if (zoneId !== 'bench' && L.teamOf(lab, playerId) === Number(zoneId.replace('team:', ''))) return '';
      if (zoneId === 'bench') {
        // Le banc ne REND un joueur que s'il est dans une équipe. Un joueur
        // déjà sur le banc « posé » sur le banc est un geste SANS EFFET —
        // typiquement le clic qui vient de le prendre et qui remonte jusqu'à
        // la zone. On le refuse SILENCIEUSEMENT (`''`, aucun message) : ce
        // n'est pas une erreur de l'élève, et lui afficher « هذا اللاعب خارج
        // الفرق أصلًا » lui reprochait un geste qu'il n'avait pas fait
        // (défaut rapporté par le propriétaire, 2026-09-20).
        return lab.bench.includes(playerId) ? '' : true;
      }
      return L.canPlace(lab, playerId, Number(zoneId.replace('team:', '')));
    },
    onReject: (sourceId, zoneId, reason) => {
      // Un refus sans raison est volontairement muet (geste sans effet).
      if (!reason) { setReject(null); return; }
      // Les nombres du refus viennent de la LOGIQUE (`rejectDetails`), qui les
      // calcule comme `canPlace` les voit : après le départ du joueur de son
      // équipe. Le message nomme des nombres que l'élève voit à l'écran.
      const playerId = Number(sourceId.replace('player:', ''));
      const team = Number(String(zoneId).replace('team:', ''));
      setReject({ reason, ...L.rejectDetails(lab, playerId, team) });
    },
  });

  // le son du geste (muet sans « الصوت ») : un joueur posé · les équipes pleines · un refus · le contraste vu
  const heard = useRef({ placed: 0, at: 0, exact: false, reject: null, contrast: false });
  useEffect(() => {
    const h = heard.current;
    if (placedCount > h.placed) {
      const now = Date.now();
      if (now - h.at > 35) { playSfx('tooth'); h.at = now; }
    }
    h.placed = placedCount;
  }, [placedCount]);
  useEffect(() => {
    const h = heard.current;
    const ex = settled && v.exact;
    if (ex && !h.exact) playSfx('bell');
    h.exact = ex;
  }, [settled, v.exact]);
  useEffect(() => { if (reject?.reason && heard.current.reject !== reject) playSfx('over'); heard.current.reject = reject; }, [reject]);
  // les deux étapes : un premier partage interrogé, puis le contraste vu et la règle
  const stepDone = [!!doneIds.first || !!doneIds.contrast || (!cpLive && triedKeys.length > 0), !!doneIds.contrast || (!cpLive && contrastSeen)];
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (triedKeys.length === 0 && celebrated.current.size) celebrated.current = new Set();
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      party.celebrate({ n: i + 1, total: 2 });
    });
  }, [stepDone[0], stepDone[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (contrastSeen && !heard.current.contrast) playSfx('flag'); heard.current.contrast = contrastSeen; }, [contrastSeen]);

  const heldPlayer = drag.held ? Number(drag.held.replace('player:', '')) : null;
  // Le banc change de SENS quand plus rien ne bouge : d'abord ceux qui
  // attendent, ensuite — s'il en reste — le reste de la division.
  const benchName = settled && !v.exact
    ? t('manipulation.teamBuilder.benchLeftover')
    : t('manipulation.teamBuilder.benchZone');

  // Les effectifs et les nombres d'équipes PROPOSÉS. Au niveau débutant, on
  // offre quelques nombres d'équipes dont certains tombent juste et d'autres
  // non : le contraste est à portée de doigt. Au niveau avancé, aucun
  // raccourci — l'élève choisit librement dans les bornes du registre.
  const teamOptions = useMemo(() => {
    if (teamChoices) return teamChoices;
    return isAdvanced ? [] : [2, 3, 4, 5, 6];
  }, [teamChoices, isAdvanced]);

  const squadOptions = useMemo(() => {
    if (squadChoices) return squadChoices;
    return isAdvanced ? [] : [12, 15, 16, 18, 20];
  }, [squadChoices, isAdvanced]);

  // La contrainte croisée de la configuration — UNE seule définition, lue par
  // le laboratoire libre / le mode classe ET par « أنشئ الفرق ».
  const validateNumbers = (n) => (n.groups > n.total ? t('manipulation.teamBuilder.reject.moreTeamsThanPlayers') : '');

  const kk = (key, o) => t(`manipulation.teamBuilder.${key}`, o);
  const coachStep = coachOn && !stale ? L.coachOf(lab, { memory: tried, teamOptions, freeLab: state.freeLab, button: Boolean(handDone) }) : null;
  const coach = useLabCoach({
    lab: 'team-builder', step: coachStep, text: coachStep ? kk(`coach.${coachStep.id}`) : '',
    labels: { hide: kk('coach.hide'), show: kk('coach.show'), ok: kk('coach.ok'), stop: kk('coach.stop') },
  });
  const setGroupsTo = (k) => state.setNumbers({ ...state.numbers, groups: k });
  const setTotalTo = (n) => state.setNumbers({ ...state.numbers, total: n });

  // « + 0 » écrit aussi quand tout tombe juste : c'est la forme du manuel
  // (420 = 28 × 15 + 0), et le r = 0 que la découverte va nommer.
  const equality = `${total} = ${groups} \\times ${v.perGroup} + ${v.leftOver}`;
  const players = (n) => t('manipulation.teamBuilder.players', { count: n });

  // La COMPOSITION : calculée pour l'effectif visé par équipe, donc stable
  // pendant que l'élève remplit — un joueur déjà posé ne bouge pas quand le
  // suivant arrive.
  const positions = useMemo(() => formationPositions(Math.max(1, v.perGroup)), [v.perGroup]);
  const scale = useMemo(() => playerScale(Math.max(1, v.perGroup)), [v.perGroup]);

  // Lecteur : la question (ou la prédiction) est une COLONNE du labo, à côté du terrain qui reste entier et visible
  // LE BANC — au lecteur (conseil + propriétaire, 2026-11-07), un BLOC à côté des terrains, en rangées de 5 : le reste se compte
  // d'un coup d'œil (2 joueurs dans un bloc presque vide), le glisser de la manche 1 est court ; hors lecteur, la bande d'avant.
  const benchNode = (block) => (
    <DropZone
      drag={drag}
      id="bench"
      label={`${benchName}: ${players(lab.bench.length)}`}
      tone={settled && !v.exact ? 'amber' : 'slate'}
      minHeight="min-h-[86px]"
      className="border-dashed bg-[repeating-linear-gradient(45deg,#F8FAFC_0_8px,#F1F5F9_8px_16px)] p-2"
      data-bench-count={lab.bench.length}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700">
          <FootballIcon size={14} />
          {benchName}
        </span>
        <span dir="ltr" className="font-mono text-[11px] font-bold text-slate-600">{lab.bench.length}</span>
      </div>
      {block ? (
      // en GROUPES DE 5, côte à côte (un groupe = une petite rangée) : 42 joueurs = 9 groupes sur ~3 lignes, et le reste se lit
      // d'un coup d'œil (« 2 » = un groupe à moitié vide) ; jamais une longue file à compter
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2" data-bench-layout="groups-of-5">
        {Array.from({ length: Math.ceil(lab.bench.length / 5) }, (_, gi) => lab.bench.slice(gi * 5, gi * 5 + 5)).map((group, gi) => (
          <div key={gi} className="flex items-end gap-0.5 rounded-xl bg-white/70 px-1 py-0.5 ring-1 ring-slate-200" data-bench-group={group.length}>
            {group.map((p) => (
              <DraggableObject
                key={p} drag={drag} id={`player:${p}`}
                label={t('manipulation.teamBuilder.playerOnBench', { n: p + 1 })}
                className="flex justify-center rounded-lg"
              >
                <PlayerFigure index={p} team={null} size={30} held={drag.held === `player:${p}`} benched={settled && !v.exact} />
              </DraggableObject>
            ))}
          </div>
        ))}
        {lab.bench.length === 0 && (
          <span className="px-2 py-3 text-xs font-bold text-emerald-700">{t('manipulation.teamBuilder.benchEmpty')}</span>
        )}
      </div>
    ) : (
    <div className="flex flex-wrap items-end gap-0.5" data-bench-layout="strip">
        {lab.bench.map((p) => (
          <DraggableObject
            key={p} drag={drag} id={`player:${p}`}
            label={t('manipulation.teamBuilder.playerOnBench', { n: p + 1 })}
            className="flex min-w-[44px] justify-center rounded-lg"
          >
            <PlayerFigure
              index={p} team={null} size={34}
              held={drag.held === `player:${p}`}
              benched={settled && !v.exact}
            />
          </DraggableObject>
        ))}
        {lab.bench.length === 0 && (
          <span className="px-2 py-3 text-xs font-bold text-emerald-700">{t('manipulation.teamBuilder.benchEmpty')}</span>
        )}
      </div>
    )}
    </DropZone>
  );
  // LE RÉSULTAT (l'égalité, les rôles, le conseil) : la colonne hors lecteur ; DANS la scène au lecteur, dans l'espace libre à
  // côté des équipes (propriétaire, 2026-11-07 : « compressé dans la colonne alors qu'il y a de la place à côté du terrain »)
  const resultNode = settled ? (
        <div className="space-y-2">
          <EquationDisplay
            tex={equality}
            tone={v.exact ? 'ok' : 'result'}
            note={v.exact
              ? t('manipulation.teamBuilder.allPlaying', { players: players(v.perGroup) })
              : t('manipulation.teamBuilder.leftOutNote', { players: players(v.perGroup), left: players(v.leftOver) })}
          />
          <DivisionRoles roles={[
            { key: 'b', text: t('manipulation.teamBuilder.roleB', { b: groups }) },
            { key: 'q', text: t('manipulation.teamBuilder.roleQ', { q: v.perGroup }) },
            { key: 'r', text: t('manipulation.teamBuilder.roleR', { r: v.leftOver, b: groups }) },
          ]} />
          {!v.exact && (
            <p className="rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
              {t('manipulation.teamBuilder.fixHint', { up: total + v.fix.add, down: total - v.fix.remove })}
            </p>
          )}
        </div>
      
  ) : null;
  // les questions sur le premier partage sont ouvertes : rien d'écrit ne doit souffler q ou r (ni l'égalité, ni le journal)
  const hideAnswers = gameScreen && cp.open && cpId === 'first';
  const predictOpen = gameScreen && !missionBig && cpLive && !stale && placedCount === 0 && !settled && !(configKey in tried) && pred?.key !== configKey && !cp.open;
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray
      attr="tb"
      title={kk('cp.predict.title')}
      prompt={kk('cp.predict.prompt', { players: players(total), teams: t('manipulation.teamBuilder.teamsIn', { count: groups }) })}
      options={[{ says: 'left', text: kk('cp.predict.left') }, { says: 'none', text: kk('cp.predict.none') }]}
      onSay={(says) => { playSfx('pop'); setPred({ key: configKey, says }); }}
    />
  ) : cp.open ? cp.node : null;

  return (
    <ManipulationShell
      type="team-builder"
      title={title ?? t('manipulation.teamBuilder.title', {
        players: t('manipulation.teamBuilder.playersIn', { count: total }),
        teams: t('manipulation.teamBuilder.teamsIn', { count: groups }),
      })}
      // une manche où « أنشئ الفرق » est ouvert d'emblée (handDone) ne dit pas « اسحب كل لاعب » : la consigne suit le geste réel
      mission={mission ?? t(handDone ? 'manipulation.teamBuilder.missionButton' : 'manipulation.teamBuilder.mission')}
      lead={lead}
      state={state}
      coach={coachOn ? coach : null}
      headerAction={cpSettings.control}
      guided={!!chain || cpLive}
      hideRepresentation={hideAnswers || gameScreen}
      onIntroChange={setMissionBig}
      // la question / la prédiction prend la COLONNE du labo (pas une colonne de plus dans la scène) : terrains + banc gardent la largeur
      sidePanel={trayNode ? <div data-tb-tray>{trayNode}</div> : null}
      numberFields={[
        { key: 'total', label: t('manipulation.teamBuilder.squadLabel') },
        { key: 'groups', label: t('manipulation.teamBuilder.teamsLabel') },
      ]}
      validate={validateNumbers}
      allowModeSwitch={allowModeSwitch}
      hints={[
        t('manipulation.teamBuilder.hint1'),
        t('manipulation.teamBuilder.hint2'),
        t('manipulation.teamBuilder.hint3'),
      ]}
      controller={{
        autoStep: () => {
          const mv = L.nextMove(lab);
          if (!mv) return false;
          setLab((s) => L.place(s, mv.playerId, mv.team));
          return true;
        },
        canAutoStep: () => L.nextMove(lab) !== null,
        showSolution: () => { setLab((s) => L.fill(s)); state.discover(); state.formalize(); },
        // « أنشئ الفرق » — la complétion automatique de l'élève (§6bis). Elle
        // ne touche QUE la répartition : ni la découverte, ni la
        // formalisation. Le verdict, le banc et l'égalité suivent la scène
        // exactement comme après le dernier geste manuel.
        autoComplete: {
          label: t('manipulation.teamBuilder.autoComplete'),
          lockedLabel: t('manipulation.teamBuilder.autoCompleteLocked'),
          ready: !stale && !validateNumbers({ total, groups }),
          manualDone: handShared,
          remaining: stale ? 0 : L.remainingMoves(lab),
          step: () => { autoUsed.current = true; setLab(L.autoStep); },
          finish: () => { autoUsed.current = true; setLab(L.fill); },
        },
      }}
      // pendant les questions sur CE partage (« observe » / « build »), le résultat écrit ne s'affiche pas : il donnerait la réponse
      // (la colonne de questions laisse désormais le terrain ET la colonne visibles)
      representation={!gameScreen && !hideAnswers && resultNode}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={t('manipulation.teamBuilder.discoverPrompt')}
          options={[
            { text: t('manipulation.teamBuilder.opt2'), why: t('manipulation.teamBuilder.why2') },
            { text: t('manipulation.teamBuilder.opt1'), correct: true },
            { text: t('manipulation.teamBuilder.opt3'), why: t('manipulation.teamBuilder.why3') },
          ]}
          formal={(
            <div className="space-y-2">
              <EquationDisplay tex={'a = b \\times q + r'} tone="result" note={t('manipulation.teamBuilder.formalNote')} />
              <p className="text-sm text-slate-700">{t('manipulation.teamBuilder.conclusion')}</p>
            </div>
          )}
        />
      )}
      explanation={t('manipulation.teamBuilder.explanation')}
    >
      <ManipulationStage dragging={drag.dragging} className="bg-gradient-to-b from-emerald-50 to-white">
        <div>
        <div className="relative space-y-3">
          {party.node}
          {!(gameScreen && cp.open) && cp.node}
          {gameScreen && pred?.key === configKey && settled && pred.ok != null && (
            <p role="status" data-tb-predict-result={pred.ok ? 'ok' : 'wrong'}
              className={`rounded-2xl px-4 py-2 text-center text-lg font-black ${pred.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
              {pred.ok ? kk('cp.predict.right') : kk('cp.predict.wrong')}
            </p>
          )}
          {/* LE JOURNAL DES ESSAIS dans le labo (lecteur) : il remplace l'étape « رتّب أفكارك » d'après — « pair » et « rule » s'y lisent */}
          {gameScreen && triedKeys.length > 0 && !hideAnswers && <TrialsTable keys={triedKeys} tried={tried} k={kk} />}
          <LabStepper count={2} current={contrastSeen ? 1 : 0} done={stepDone} stepAttr="data-tb-step" />
          {/* ── Les réglages de la situation : combien d'équipes, combien de joueurs ── */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {teamOptions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700">{t('manipulation.teamBuilder.teamsLabel')}</span>
                <div dir="ltr" className="flex flex-wrap gap-1.5" role="group" aria-label={t('manipulation.teamBuilder.teamsLabel')}>
                  {teamOptions.map((k) => (
                    <NumberTile
                      key={k} value={k} size="sm" data-tb-teams={k} onClick={() => setGroupsTo(k)}
                      label={t('manipulation.teamBuilder.makeTeams', { teams: t('manipulation.teamBuilder.teamsIn', { count: k }) })}
                      tone={k === groups ? 'common' : 'neutral'}
                    />
                  ))}
                </div>
              </div>
            )}
            {squadOptions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700">{t('manipulation.teamBuilder.squadLabel')}</span>
                <div dir="ltr" className="flex flex-wrap gap-1.5" role="group" aria-label={t('manipulation.teamBuilder.squadLabel')}>
                  {squadOptions.map((n) => (
                    <NumberTile
                      key={n} value={n} size="sm" onClick={() => setTotalTo(n)}
                      label={t('manipulation.teamBuilder.makeSquad', { players: players(n) })}
                      tone={n === total ? 'common' : 'neutral'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── LE TERRAIN : une zone par équipe ─────────────────────────────
              Un terrain vertical a besoin de LARGEUR pour rester lisible :
              trois terrains côte à côte sur un téléphone donnent trois
              lamelles où plus rien ne se lit. La grille suit donc la place
              réelle (`auto-fill` sur une largeur minimale) au lieu d'imposer
              une colonne par équipe : une colonne sur un téléphone, deux sur
              une tablette, jusqu'à quatre sur un grand écran. */}
          <div className={gameScreen ? 'flex items-start gap-4' : ''} data-tb-pitch-row>
          <div
            className={`grid gap-2 ${gameScreen ? 'min-w-0 flex-1' : ''}`}
            style={{
              // lecteur : les équipes sur UNE rangée (deux au-delà de 7) — chaque terrain rétrécit plutôt que de passer à la ligne ;
              // sinon la hauteur du labo dépendait du zoom (plus de zoom → moins de largeur → terrains repliés → labo plus haut) et
              // l'écran se posait petit, avec de grandes bandes vides (2026-11-07)
              gridTemplateColumns: gameScreen ? `repeat(${groups <= 7 ? groups : Math.ceil(groups / 2)}, minmax(0, 1fr))` : 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
              maxWidth: `${Math.min(groups, 4) * 260}px`,
            }}
            data-team-pitch
          >
            {lab.teams.map((team, i) => {
              const full = settled;
              return (
                <DropZone
                  key={i}
                  drag={drag}
                  id={`team:${i}`}
                  label={t('manipulation.teamBuilder.teamZone', { n: i + 1, players: players(team.length) })}
                  tone={full ? 'emerald' : 'indigo'}
                  minHeight="min-h-0"
                  className="relative p-2"
                  data-team={i}
                  data-team-size={team.length}
                >
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <span className="text-[11px] font-extrabold text-slate-800">
                      {t('manipulation.teamBuilder.teamName', { n: i + 1 })}
                    </span>
                    {/* Le COMPTE, pas la cible : « 3 », jamais « 3/5 » — q se
                        découvre, il ne s'annonce pas. Vert quand l'équipe ne
                        peut plus rien recevoir (la scène est stabilisée). */}
                    <span dir="ltr" data-team-count className={`rounded-full px-1.5 font-mono text-[11px] font-bold ${settled ? (v.exact ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white') : 'bg-slate-200 text-slate-800'}`}>
                      {team.length}
                    </span>
                  </div>

                  {/* LE TERRAIN, vertical et à ses proportions réelles (2/3).
                      Les joueurs sont POSÉS DESSUS en composition : chaque
                      position vient de `teamFormation`, balayée par ses
                      tests pour qu'aucun effectif atteignable ne superpose
                      deux joueurs. */}
                  {/* Sur l'écran de jeu (lecteur de mission), le terrain garde ses proportions et prend TOUTE la hauteur qui
                      reste (pitchMax, d'après la zone du lecteur) : ni défilement, ni place perdue. */}
                  <div className="relative mx-auto w-full" style={{ aspectRatio: '2 / 3', maxWidth: pitchMax }} data-team-pitch-area>
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                      <PitchBackdrop variant="full" />
                    </div>
                    {team.map((p, idx) => {
                      const pos = positions[idx] ?? { x: 50, y: 50 };
                      return (
                        <DraggableObject
                          key={p} drag={drag} id={`player:${p}`}
                          label={t('manipulation.teamBuilder.playerInTeam', { n: p + 1, team: i + 1 })}
                          className="absolute rounded-lg"
                          style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: `${scale}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          <PlayerFigure index={p} team={i} size="100%" held={drag.held === `player:${p}`} />
                        </DraggableObject>
                      );
                    })}
                    {team.length === 0 && (
                      <span className="pointer-events-none absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-lg bg-white/85 px-2 py-1 text-center text-[11px] font-bold text-slate-700">
                        {t('manipulation.teamBuilder.dropHere')}
                      </span>
                    )}
                  </div>
                </DropZone>
              );
            })}
          </div>
          {/* lecteur : le résultat dans l'espace libre à côté des équipes, jamais pendant les questions sur ce partage */}
          {gameScreen && resultNode && !hideAnswers && (
            <div className="w-[22rem] max-w-[38%] shrink-0 space-y-2" data-tb-result>{resultNode}</div>
          )}
          </div>

          {/* ── LE BANC : sous les terrains hors lecteur ; au lecteur, il est À CÔTÉ (voir data-tb-pitch-row) ── */}
          {/* le banc SOUS les terrains : au lecteur en GROUPES DE 5 sur toute la largeur (42 joueurs = 2 lignes courtes) ; mesuré à
              1848, 1366 et 1024 px, c'est ce qui laisse aux terrains la plus grande taille (le banc à côté les écrasait à 31 px) */}
          {benchNode(gameScreen)}

          {reject && (
            <p role="status" className="rounded-lg border-2 border-rose-300 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-900">
              {t(`manipulation.teamBuilder.reject.${reject.reason}`, {
                players: players(reject.perGroup), here: players(reject.here), min: players(reject.min),
              })}
            </p>
          )}
        </div>
        </div>
      </ManipulationStage>

      <DragGhost ghost={drag.ghost}>
        {heldPlayer !== null && <PlayerFigure index={heldPlayer} team={null} size={36} held />}
      </DragGhost>
    </ManipulationShell>
  );
}


/* ══════════════ Lecteur : prédire, et le journal des essais (pilote 2026-11-07) ══════════════ */

/** Les essais de l'élève, au fil de la manche : chaque nombre avec son sens ; une ligne verte quand personne ne reste. */
// au plus 3 lignes à l'écran (les plus récentes) : un journal qui grandit à chaque essai faisait rétrécir tout l'écran au terrain
// libre (2026-11-07) ; le titre dit combien d'essais il y a — tous restent dans la mémoire du labo (« pair » / « rule » s'en servent)
const TRIALS_SHOWN = 3;
function TrialsTable({ keys, tried, k }) {
  const rows = keys.slice(-TRIALS_SHOWN).map((key) => ({ key, ...splitKey(key), exact: tried[key] }));
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-indigo-100 bg-white" data-tb-trials>
      <p className="bg-indigo-50 px-3 py-1.5 text-sm font-black text-indigo-900">
        📋 {k('trials.title')}{keys.length > TRIALS_SHOWN && <span className="ms-2 text-xs font-bold text-indigo-500">{k('trials.lastOf', { n: TRIALS_SHOWN, total: keys.length })}</span>}
      </p>
      <table className="w-full text-center text-sm">
        <thead className="text-xs font-black text-slate-500">
          <tr><th className="px-2 py-1">{k('trials.players')}</th><th className="px-2 py-1">{k('trials.teams')}</th><th className="px-2 py-1">{k('trials.perTeam')}</th><th className="px-2 py-1">{k('trials.bench')}</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} data-tb-trial={r.key} data-exact={r.exact ? 'true' : 'false'} className={`border-t border-indigo-50 text-base font-black ${r.exact ? 'bg-emerald-50 text-emerald-800' : 'text-slate-800'}`}>
              <td className="px-2 py-1">{r.n}</td><td className="px-2 py-1">{r.g}</td><td className="px-2 py-1">{r.q}</td>
              <td className={`px-2 py-1 ${r.exact ? '' : 'text-rose-600'}`}>{r.r}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

export const CHAINS = { first: ['perTeam', 'left', 'eq'], contrast: ['pair', 'fix', 'rule'] };
/** Lecteur (pilote 2026-11-07, conseil) : observer d'un toucher puis BÂTIR l'égalité ; après le contraste, laquelle puis la règle. */
export const CHAINS_PLAYER = { first: ['observe', 'build'], contrast: ['pair', 'rule'] };

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const split = splitKey;
const words = (k, { n, g }) => ({ players: k('players', { count: n }), teams: k('teamsIn', { count: g }) });

export const QUESTIONS = {
  // « في كل فريق ▢ · على المقاعد ▢ » : ce que le TERRAIN montre, d'un toucher (le terrain reste visible à côté) — sans
  // « اكتب 0 إن لم يبقَ أحد », qui soufflait que 0 est possible à l'instant même où il doit être découvert
  observe: ({ keys }, k) => {
    const c = split(keys[0]);
    const o = { ...words(k, c), q: $(c.q), r: $(c.r) };
    return {
      id: 'observe', kind: 'fill', prompt: Cq(k, 'observe.prompt', o),
      fields: [
        { label: k('cp.observe.perTeam'), expected: c.q, options: chipsAround(c.q, { min: 1 }) },
        { label: k('cp.observe.bench'), expected: c.r, options: chipsAround(c.r) },
      ],
      hints: [Cq(k, 'observe.hint1'), Cq(k, 'observe.hint2')], explain: Cq(k, 'observe.explain', o),
    };
  },
  // l'égalité BÂTIE : chaque emplacement porte le sens de son nombre ; 15 = 5 × 3 + 0 est refusé si 5 n'est pas « الفرق »
  build: ({ keys }, k) => {
    const c = split(keys[0]);
    return {
      id: 'build', kind: 'build', prompt: Cq(k, 'build.prompt'),
      slots: [k('cp.build.slotN'), k('cp.build.slotG'), k('cp.build.slotQ'), k('cp.build.slotR')],
      tiles: buildTiles(c), expected: [c.n, c.g, c.q, c.r],
      hints: [Cq(k, 'build.hint1'), Cq(k, 'build.hint2')],
      explain: (
        <div className="space-y-2">
          <RolesEquation n={c.n} g={c.g} q={c.q} r={c.r} labels={{ n: k('roles.n'), g: k('roles.g'), q: k('roles.q'), r: k('roles.r') }} />
          <p>{k('cp.eq.explainRoles')}</p>
        </div>
      ),
    };
  },
  perTeam: ({ keys }, k) => {
    const c = split(keys[0]);
    const o = { ...words(k, c), q: $(c.q), eq: $(eqTex(c)) };
    return { id: 'perTeam', kind: 'number', expected: String(c.q), answer: <MathText>{$(c.q)}</MathText>, prompt: Cq(k, 'perTeam.prompt', o), hints: [Cq(k, 'perTeam.hint1'), Cq(k, 'perTeam.hint2')], explain: Cq(k, 'perTeam.explain', o) };
  },
  left: ({ keys }, k) => {
    const c = split(keys[0]);
    const o = { ...words(k, c), r: $(c.r), eq: $(eqTex(c)) };
    return { id: 'left', kind: 'number', expected: String(c.r), answer: <MathText>{$(c.r)}</MathText>, prompt: Cq(k, 'left.prompt', o), hints: [Cq(k, 'left.hint1'), Cq(k, 'left.hint2')], explain: Cq(k, 'left.explain', o) };
  },
  eq: ({ keys }, k) => {
    const c = split(keys[0]);
    const [w1, w2] = wrongEqualities(c);
    const o = { ...words(k, c), n: $(c.n), eq: $(eqTex(c)) };
    const opt = (w) => ({ text: <MathText>{$(`${c.n} = ${w.tex}`)}</MathText>, why: Cq(k, 'eq.whyWrong', { ...o, calc: $(`${w.tex} = ${w.v}`) }) });
    return {
      id: 'eq', kind: 'choice', cols: 3, prompt: Cq(k, 'eq.prompt', o),
      options: [opt(w1), { text: <MathText>{$(eqTex(c))}</MathText>, correct: true }, opt(w2)],
      hints: [Cq(k, 'eq.hint1'), Cq(k, 'eq.hint2', o)],
      // l'égalité ÉCRITE avec le SENS de chaque nombre (propriétaire, 2026-11-04 : « 3 → 3 فرق، 15 → 15 لاعبًا »)
      explain: (
        <div className="space-y-2">
          <RolesEquation n={c.n} g={c.g} q={c.q} r={c.r} labels={{ n: k('roles.n'), g: k('roles.g'), q: k('roles.q'), r: k('roles.r') }} />
          <p>{k('cp.eq.explainRoles')}</p>
        </div>
      ),
    };
  },
  pair: ({ tried, keys }, k) => {
    const left = split(keys.find((x) => tried[x] === false));
    const fine = split(keys.find((x) => tried[x] === true));
    const ol = { ...words(k, left), left: k('players', { count: left.r }), eq: $(eqTex(left)) };
    const of = { ...words(k, fine), eq: $(eqTex(fine)) };
    return {
      id: 'pair', kind: 'choice', cols: 1, prompt: Cq(k, 'pair.prompt'),
      options: [
        { text: Cq(k, 'pair.opt', of), why: Cq(k, 'pair.whyFine', of) },
        { text: Cq(k, 'pair.opt', ol), correct: true },
        { text: Cq(k, 'pair.none'), why: Cq(k, 'pair.whyNone', ol) },
      ],
      hints: [Cq(k, 'pair.hint1'), Cq(k, 'pair.hint2')], explain: Cq(k, 'pair.explain', ol),
    };
  },
  fix: ({ tried, keys }, k) => {
    const c = split(keys.find((x) => tried[x] === false));
    const add = c.g - c.r;
    const o = { ...words(k, c), left: k('players', { count: c.r }), full: k('players', { count: c.g }), add: $(add), newN: $(c.n + add), eq: $(`${c.n + add} = ${c.g} \\times ${c.q + 1} + 0`) };
    return { id: 'fix', kind: 'number', expected: String(add), answer: <MathText>{$(add)}</MathText>, prompt: Cq(k, 'fix.prompt', o), hints: [Cq(k, 'fix.hint1'), Cq(k, 'fix.hint2', o)], explain: Cq(k, 'fix.explain', o) };
  },
  rule: (_ctx, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('discoverPrompt')}</MathText>,
    options: [
      { text: <MathText>{k('opt2')}</MathText>, why: <MathText>{k('why2')}</MathText> },
      { text: <MathText>{k('opt1')}</MathText>, correct: true },
      { text: <MathText>{k('opt3')}</MathText>, why: <MathText>{k('why3')}</MathText> },
    ],
    hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2')],
    explain: <MathText>{`${$('a = b \\times q + r')} — ${k('conclusion')}`}</MathText>,
  }),
};
