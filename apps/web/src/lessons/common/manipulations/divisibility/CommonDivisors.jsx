import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import useDragInteraction from '../useDragInteraction';
import DropZone from '../primitives/DropZone';
import NumberTile from '../primitives/NumberTile';
import DivisorChip from '../primitives/DivisorChip';
import DragGhost from '../primitives/DragGhost';
import GroupingScene from '../primitives/GroupingScene';
import DraggableObject from '../primitives/DraggableObject';
import GroupStock, { GroupWrapper } from '../primitives/GroupStock';
import { themeWords } from '../themeWords';
import EquationDisplay from '../primitives/EquationDisplay';
import { useLabCoach } from '../primitives/LabCoach';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import MathText from '../../components/MathText';
import * as L from '../logic/commonDivisors';
import PredictTray from '../primitives/PredictTray';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';
import { chipsAround } from './divisionChecks';

/** Lecteur : encore PRED_MAX prédictions par manche (comme factor-pairs), jamais pendant une suite de questions. */
const PRED_MAX = 2;

/**
 * common-divisors — les groupes, puis (au niveau متقدم) les listes.
 *
 * LE FLUX SUIT LE NIVEAU (décision du propriétaire, 2026-09-24) :
 *   مبتدئ   les GROUPES seulement. Poser le plus grand nombre de groupes qui
 *           tombe juste (6 pour 12 et 18) ouvre la découverte — PGCD trouvé
 *           par le geste, sans second laboratoire.
 *   متقدم   les groupes, puis les LISTES. Le passage est un GESTE de l'élève :
 *           une carte « وجدت أكبر عدد… » et un bouton ; un lien ramène aux
 *           groupes. Rien ne bascule tout seul — l'ancien seuil « deux ✓ et
 *           un ✗ » remplaçait la scène par une autre après trois essais, sans
 *           un mot.
 *   startWith="lists"  les listes seulement (un exemple du manuel sur les
 *           listes, ex. 28 et 42 dans معارف).
 *
 * 1) LES BOUQUETS (activité 4). L'élève AJOUTE UN GROUPE à la fois : il tire
 *    un emballage vide de la réserve (« أغلفة الباقات ») jusqu'à la table, et
 *    toutes les fleurs se redistribuent dans les k groupes ; il en rend un à
 *    la réserve pour revenir en arrière. Les restes se voient, dans leurs
 *    couleurs. (Depuis le 2026-09-30 — avant, il portait un NOMBRE d'un rail
 *    1…24 : une calculatrice déguisée, où l'on sautait sur 18 d'un coup.)
 *
 *    FICHE (MANIPULATION_DNA §7) — variable : k, le nombre de groupes, tenu
 *    comme des emballages posés ; invariant : a et b objets, tous les
 *    groupes identiques ; résistance : ce qui ne rentre pas reste dehors, en
 *    couleur ; contraste : en montant de 1 en 1, ✓ et ✗ alternent ; la
 *    découverte « le plus grand » exige d'avoir vu le suivant échouer
 *    (`greatestGroupFound`), jamais un saut chanceux.
 * 2) LES LISTES (activité 5, معارف 3–4). Les diviseurs de a et de b sont des
 *    jetons ; l'élève porte les COMMUNS au milieu — un jeton qui ne divise
 *    qu'un seul côté est refusé AVEC LA RAISON. Puis il porte le plus grand
 *    dans la case PGCD : le 6 de « PGCD(42 ; 60) = 6 » vient de son geste.
 *
 * ONBOARDING (prop `coach`, défaut true — `LabCoach`, §8quater) : `logic/commonDivisors.js › coachOf` montre l'emballage à tirer puis le
 * « + » (groupes), le bouton vers les listes ; dans les listes il montre la zone du milieu puis la case PGCD, jamais un jeton
 * (savoir lesquels divisent les deux nombres EST l'exercice : la complétion par le guide seul y est volontairement impossible).
 *
 * QUESTIONS PENDANT LE LABO (prototype `primitives/LabCheckpoint`, lot 2, 2026-10-28) : deux ÉTAPES (`LabStepper`, `[data-cd-step]`) — les GROUPES
 * (le plus grand nombre de groupes trouvé : `greatest` · ce qui reste au-delà : `beyond`, puis LA RÈGLE si c'est la seule étape) et les LISTES
 * (`listCommon` · `listWhy`, puis LA RÈGLE qui remplace la découverte automatique). Une seule étape quand le labo ne montre qu'une scène (مبتدئ,
 * `startWith="lists"`). Obligatoires pour tout élève ; l'enseignant seul les coupe. SON : `tooth` (un groupe ajouté, un jeton porté), `bell` (ça tombe
 * juste pour les deux nombres), `flag` (étape atteinte), `over` (refus). « إعادة » repart de zéro ; « أعِد التجربة » remet l'étape.
 *
 * `theme` choisit les OBJETS DESSINÉS de la scène des groupes (fleurs rouges
 * et blanches, ballons et maillots, stylos et cahiers — primitives/itemThemes)
 * et `context` peut en remplacer les mots par ceux de la SITUATION du manuel
 * (باقة، زهرة حمراء، زهرة بيضاء). Ni l'un ni l'autre ne touche à une
 * mathématique : la répartition, les restes et les verdicts viennent de
 * logic/commonDivisors → core. Les groupes sont de vrais cadres contenant de
 * vrais objets (`GroupingScene`) : « متماثلة » se voit, et le reste est un
 * nombre d'objets dessinés en dehors, jamais une décimale.
 *
 * LECTEUR DE MISSION (rollout 2026-11-08, traitement v2, même famille de geste que team-builder) : joué en MANCHES (LabRounds) ;
 * `onVerdict` remonte chaque nombre de groupes ESSAYÉ ({ groups: k, exact }) et, dans les listes, le PGCD posé ({ groups: g, exact }) ;
 * `levels={false}`, un seul temps par manche (les groupes OU les listes, `startWith`) ; `predict` : avant un nombre de groupes NOUVEAU
 * (k ≥ 2), « هل يتوزّع الكل ؟ » (`PredictTray`, ≤ PRED_MAX par manche) ; `chains` (`['groups', 'lists']`) ; `CHAINS_PLAYER` = observer d'un
 * toucher (le plus grand, par groupe) → BÂTIR a = k × q → au-delà → la règle ; le JOURNAL « 📋 جدول تجاربك » (k · reste de chaque
 * objet) dans la colonne du labo ; `handDone` ouvre « جرّب كل الإمكانيات » ; `choices` : des paires (a, b) à toucher (terrain libre).
 * Les contrôles se figent pendant une prédiction ou une question ; toujours guidé ; pas de fête quand l'étape est cachée.
 */
export default function CommonDivisors({
  a: a0, b: b0, title, lead, mission, context, theme = 'garden', startWith = 'bouquets', initialMode = 'student', allowModeSwitch = false, onFinished, coach: coachOn = true, checkpoints: cpOn = true, onTrial,
  // ── LECTEUR DE MISSION (rollout 2026-11-08, traitement v2) ──
  onVerdict, levels: withLevels = true, handDone = false, chains: chainsOn = ['groups', 'lists'], predict: predictOn = true, choices,
}) {
  const { t } = useTranslation('lesson');
  const gameScreen = useInMissionPlayer();
  const state = useManipulation({ type: 'common-divisors', initialNumbers: { a: a0, b: b0 }, initialMode, hintCount: 3, withLevels: withLevels !== false });
  const { a, b } = state.numbers;
  const [stage, setStage] = useState(startWith);
  // La scène porte l'`epoch` pour lequel elle a été construite : voir l'effet
  // de découverte plus bas.
  const [bouquets, setBouquets] = useState(() => ({ ...L.initBouquets({ a: a0, b: b0 }), epoch: 0 }));
  const [lists, setLists] = useState(() => L.initLists({ a: a0, b: b0 }));
  const [reject, setReject] = useState(null);
  const [doneIds, setDoneIds] = useState({});
  const [retryN, setRetryN] = useState(0);
  // lecteur : le nombre de groupes qui attend sa PRÉDICTION, la dernière prédiction jugée
  const [pending, setPending] = useState(null);
  const [pred, setPred] = useState(null);
  const predsMade = useRef(0);
  const [missionBig, setMissionBig] = useState(false);
  // Miroir synchrone des groupes : « جرّب كل الإمكانيات » enchaîne des pas plus vite qu'un rendu.
  const bouquetsRef = useRef(bouquets);
  bouquetsRef.current = bouquets;

  useEffect(() => {
    setBouquets({ ...L.initBouquets({ a, b }), epoch: state.epoch }); setLists(L.initLists({ a, b })); setStage(startWith); setReject(null); setDoneIds({});
    setPending(null); setPred(null); predsMade.current = 0;
  }, [a, b, state.epoch, startWith]);

  // مبتدئ : les groupes SEULEMENT (voir l'en-tête).
  const groupsOnly = startWith !== 'lists' && (gameScreen || state.level !== 'advanced');
  const groupsDone = L.greatestGroupFound(bouquets);
  // les questions pendant le labo : obligatoires pour tout élève, l'enseignant seul les coupe pour SON compte
  const cpSettings = useLabCheckpointSettings('common-divisors');
  const cpLive = cpOn && cpSettings.enabled;
  // `state.epoch` dans les dépendances : `setNumbers` remet la phase à 'act',
  // la découverte doit être ré-affirmée sur la scène qui l'a méritée.
  // Sur « إعادة », les deux effets tournent dans le MÊME commit : celui-ci
  // voyait encore l'ancienne scène (le plus grand groupe posé) et rouvrait la
  // découverte sur une scène vide. Une scène d'un autre epoch ne compte pas.
  useEffect(() => {
    if (groupsOnly && stage === 'bouquets' && groupsDone && bouquets.epoch === state.epoch && !cpLive && !gameScreen) state.discover();
  }, [groupsOnly, stage, groupsDone, state.epoch, bouquets.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps

  const drag = useDragInteraction({
    onDrop: (sourceId, zoneId) => {
      setReject(null);
      if (sourceId === 'group:add') { addGroupRef.current(); return; }
      if (sourceId === 'group:remove') { setBouquets((s) => L.removeGroup(s)); return; }
      const d = Number(sourceId.split(':')[1]);
      if (zoneId === 'middle') {
        setLists((s) => L.placeCommon(s, d));
      } else if (zoneId === 'pgcd') {
        setLists((s) => L.placePgcd(s, d));
      }
    },
    accepts: (sourceId, zoneId) => {
      if (lockedRef.current) return '';
      if (sourceId === 'group:add') return zoneId === 'table' ? L.canChoose(bouquets, (bouquets.k ?? 0) + 1) : '';
      if (sourceId === 'group:remove') return zoneId === 'stock' ? (bouquets.k === null ? 'empty' : true) : '';
      const d = Number(sourceId.split(':')[1]);
      if (zoneId === 'middle') return L.canPlaceCommon(lists, d);
      if (zoneId === 'pgcd') return L.canPlacePgcd(lists, d);
      return 'invalid';
    },
    onReject: (sourceId, _z, reason) => setReject(sourceId.startsWith('group:') ? { reason, groups: true } : { reason, d: Number(sourceId.split(':')[1]) }),
  });

  // Les listes : la découverte suit la case PGCD remplie — dans un effet,
  // jamais dans un updater d'état (playbook §10.10).
  const listsReady = stage === 'lists' && L.listsDiscoveryReady(lists);
  useEffect(() => { if (listsReady && !cpLive && !gameScreen) state.discover(); }, [listsReady, state.epoch, cpLive]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, lists.g); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps

  // la suite de la scène atteinte : les groupes (le plus grand trouvé) ou les listes (le PGCD posé)
  const words0 = themeWords(t, theme, context);
  const cpWanted = stage === 'bouquets' && groupsDone && bouquets.epoch === state.epoch ? 'groups' : listsReady ? 'lists' : null;
  const cpId = cpLive && cpWanted && chainsOn.includes(cpWanted) ? cpWanted : null;
  // lecteur : observer d'un toucher puis BÂTIR l'égalité (traitement v2) ; la page garde ses suites
  const chainMap = gameScreen ? CHAINS_PLAYER : CHAINS;
  const chainKey = (id) => (id === 'groups' ? (groupsOnly ? 'groupsOnly' : 'groups') : id);
  const chain = cpId ? chainMap[chainKey(cpId)] : null;
  const kq = (key, o) => t(`manipulation.common.${key}`, o);
  const cp = useLabCheckpoint({
    id: cpId,
    questions: chain ? chain.map((q) => QUESTIONS[q]({ a, b, bouquets, lists, words: words0 }, kq)) : null,
    reached: !!cpId,
    resetKey: `${state.resetCount}:${retryN}`,
    onRetry: () => {
      setPending(null); setPred(null);
      if (cpId === 'lists') setLists(L.initLists({ a, b })); else setBouquets({ ...L.initBouquets({ a, b }), epoch: state.epoch });
      setReject(null); setDoneIds((d) => ({ ...d, [cpId]: false })); setRetryN((n) => n + 1);
    },
    onEvent: (ev) => state.report(onTrial, ev),
    onDone: (id) => {
      setDoneIds((d) => ({ ...d, [id]: true }));
      if (chainMap[chainKey(id)].includes('rule')) { state.discover(); state.formalize(); }
    },
  });
  // les étapes : les groupes puis les listes (une seule quand le labo ne montre qu'une scène)
  const single = groupsOnly || startWith === 'lists';
  // lecteur : une manche sans questions (défi, terrain libre) ne montre pas d'étapes, et ne fête rien
  const showStepper = !(gameScreen && (!cpLive || chainsOn.length === 0));
  const stepDone = single ? [!!(groupsOnly ? doneIds.groups : doneIds.lists)] : [!!doneIds.groups, !!doneIds.lists];
  const party = useStepCelebration();
  const celebrated = useRef(new Set());
  if (bouquets.k === null && lists.placed.length === 0 && celebrated.current.size) celebrated.current = new Set();
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.has(i)) return;
      celebrated.current.add(i);
      if (showStepper) party.celebrate({ n: i + 1, total: stepDone.length });
    });
  }, [stepDone[0], stepDone[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  // le son du geste (muet sans « الصوت ») : un groupe ajouté · un jeton porté · ça tombe juste · l'étape atteinte · un refus
  const heard = useRef({ k: null, placed: 0, works: false, id: null, reject: null, at: 0 });
  useEffect(() => {
    const h = heard.current;
    if (bouquets.k !== h.k && bouquets.k !== null && h.k !== null && Date.now() - h.at > 35) { playSfx('tooth', { pitch: bouquets.k < h.k ? 0.8 : 1 }); h.at = Date.now(); }
    if (bouquets.works && !h.works) playSfx('bell');
    h.k = bouquets.k; h.works = !!bouquets.works;
  }, [bouquets.k, bouquets.works]);
  useEffect(() => {
    const h = heard.current;
    if (lists.placed.length > h.placed) playSfx('tooth');
    h.placed = lists.placed.length;
  }, [lists.placed.length]);
  useEffect(() => { if (cpId && heard.current.id !== cpId) playSfx('flag'); heard.current.id = cpId; }, [cpId]);
  useEffect(() => { if (reject && heard.current.reject !== reject) playSfx('over'); heard.current.reject = reject; }, [reject]);

  // le VERDICT de chaque nombre de groupes ESSAYÉ (une fois par k et par scène) remonte à la manche (LabRounds)
  const reported = useRef(new Set());
  useEffect(() => {
    if (Object.keys(bouquets.tried).length === 0) { reported.current = new Set(); return; }
    Object.keys(bouquets.tried).map(Number).sort((x, y) => x - y).forEach((kk) => {
      if (reported.current.has(kk)) return;
      reported.current.add(kk);
      state.report(onVerdict, { a, b, groups: kk, exact: bouquets.tried[kk] === 'common' });
    });
  }, [bouquets.tried]); // eslint-disable-line react-hooks/exhaustive-deps
  // les listes : le PGCD posé est le verdict
  useEffect(() => { if (lists.pgcd !== null) state.report(onVerdict, { a, b, groups: lists.pgcd, exact: true }); }, [lists.pgcd]); // eslint-disable-line react-hooks/exhaustive-deps
  // lecteur : prédire avant un nombre de groupes NOUVEAU (k ≥ 2 : un seul groupe range toujours tout)
  const holdRef = useRef(false);
  holdRef.current = gameScreen && predictOn && cpLive && predsMade.current < PRED_MAX && !cp.open;
  const predictOpen = gameScreen && !missionBig && pending != null && !cp.open;
  const locked = gameScreen && (cp.open || pending != null);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const addGroupRef = useRef(null);
  addGroupRef.current = () => {
    if (lockedRef.current) return;
    setReject(null);
    const cur = bouquetsRef.current;
    const next = (cur.k ?? 0) + 1;
    if (holdRef.current && next >= 2 && cur.tried[next] === undefined && L.canChoose(cur, next) === true) { setPending(next); return; }
    setBouquets((x) => L.addGroup(x));
  };
  const sayPredict = (says) => {
    const kk = pending;
    const ok = (says === 'all') === (a % kk === 0 && b % kk === 0);
    predsMade.current += 1;
    playSfx(ok ? 'correct' : 'pop');
    setPred({ k: kk, ok });
    state.report(onTrial, { tk: 'predict', ok });
    setPending(null);
    setBouquets((x) => L.choose(x, kk));
  };
  const heldValue = drag.held ? Number(drag.held.split(':')[1]) : null;
  // Les mots de la scène : ceux du thème (lesson.json), remplacés par ceux
  // de la situation du manuel quand la leçon les fournit (`context`).
  const words = themeWords(t, theme, context);
  const gLabel = t('manipulation.common.perGroup', { group: words.group, qa: bouquets.qa, qb: bouquets.qb, itemA: words.itemA, itemB: words.itemB });
  const g = lists.g;
  // Le plus grand qui marche a été posé, mais rien au-delà n'a été vu :
  // l'élève est invité à ajouter un groupe de plus (pas de saut chanceux).
  const needBeyond = bouquets.tried[g] === 'common' && !groupsDone;
  const addGroup = () => addGroupRef.current();
  const removeGroup = () => { if (locked) return; setReject(null); setBouquets((s) => L.removeGroup(s)); };
  // lecteur : la prédiction ou la question PREND la colonne du labo (les groupes gardent toute la largeur)
  const trayNode = !gameScreen ? null : predictOpen ? (
    <PredictTray
      attr="cd"
      title={t('manipulation.common.cp.predict.title')}
      prompt={t('manipulation.common.cp.predict.prompt', { k: pending, group: words.groups, itemsA: words.itemsA, itemsB: words.itemsB })}
      options={[{ says: 'all', text: t('manipulation.common.cp.predict.all') }, { says: 'left', text: t('manipulation.common.cp.predict.left') }]}
      onSay={sayPredict}
    />
  ) : cp.open ? cp.node : null;
  // pendant une question, ce que la scène ÉCRIT (par groupe, le reste) se tait : la question porte sur ce qu'on VOIT
  const quiet = gameScreen && cp.open;
  // lecteur : pendant la suite des GROUPES, la scène montre la répartition dont parle la question — le plus grand nombre juste (observer,
  // bâtir, la règle), puis le premier nombre essayé au-delà (« au-delà ») — et non le dernier essai
  const focusK = quiet && cpId === 'groups' && groupsDone
    ? (cp.qid === 'beyondFill' ? tryKeys(bouquets).find((x) => x > greatestTried(bouquets)) : greatestTried(bouquets))
    : null;
  const shownK = focusK ?? bouquets.k;
  const wrapper = <GroupWrapper theme={theme} />;
  const coachStep = coachOn ? L.coachOf({ stage, bouquets, lists, groupsOnly }) : null;
  const coachK = (key, o) => t(`manipulation.common.coach.${key}`, o);
  const coach = useLabCoach({
    lab: 'common-divisors', step: coachStep, text: coachStep ? coachK(coachStep.id === 'to-lists' ? 'toLists' : coachStep.id, { group: words.group, groups: words.groups, stock: words.stock }) : '',
    labels: { hide: coachK('hide'), show: coachK('show'), ok: coachK('ok'), stop: coachK('stop') },
  });

  return (
    <ManipulationShell
      type="common-divisors"
      title={title ?? t('manipulation.common.title', { a, b })}
      mission={mission ?? (stage === 'bouquets'
        ? t(gameScreen && handDone ? 'manipulation.common.missionButton' : 'manipulation.common.missionGreatestGroups', { groups: words.groups })
        : t('manipulation.common.listsMission', { a, b }))}
      lead={lead}
      state={state}
      coach={coachOn ? coach : null}
      headerAction={cpSettings.control}
      // lecteur : l'écran de jeu est toujours GUIDÉ (les manches et les questions guident)
      guided={!!chain || cpLive || gameScreen}
      hideRepresentation={gameScreen || undefined}
      onIntroChange={setMissionBig}
      sidePanel={trayNode ? <div data-cd-tray>{trayNode}</div> : null}
      allowFreeLab={gameScreen ? false : undefined}
      numberFields={[{ key: 'a', label: 'a' }, { key: 'b', label: 'b' }]}
      allowModeSwitch={allowModeSwitch}
      hints={stage === 'bouquets'
        ? [t('manipulation.common.groupsHint1'), t('manipulation.common.groupsHint2', { a, b }), t('manipulation.common.groupsHint3')]
        : [t('manipulation.common.hint2'), t('manipulation.common.hint3')]}
      controller={{
        autoStep: () => {
          if (stage === 'bouquets') {
            if (groupsDone) {
              if (groupsOnly) return false;
              setStage('lists');
              return true;
            }
            setBouquets((s) => L.addGroup(s));
            return true;
          }
          if (!L.allCommonPlaced(lists)) {
            const d = lists.common.find((x) => !lists.placed.includes(x));
            setLists((s) => L.placeCommon(s, d));
            return true;
          }
          if (lists.pgcd === null) { setLists((s) => L.placePgcd(s, s.g)); return true; }
          return false;
        },
        canAutoStep: () => (stage === 'bouquets' ? !(groupsOnly && groupsDone) : lists.pgcd === null),
        // Les groupes : chaque k de 1 à min(a ; b) est un essai légitime (même
        // `L.choose` que le geste). Les listes sont un geste de choix : pas de balayage.
        // lecteur : « جرّب كل الإمكانيات » est le BOUTON du geste appris — il s'ouvre après la manche à la main (handDone)
        autoComplete: gameScreen && !handDone ? undefined : {
          label: t('manipulation.autoComplete.tryAll'),
          ready: stage === 'bouquets',
          remaining: stage === 'bouquets' ? L.untriedGroups(bouquets).length : 0,
          intervalMs: 480,
          maxTicks: 80,
          step: () => {
            const next = L.untriedGroups(bouquetsRef.current)[0];
            if (next === undefined) return;
            bouquetsRef.current = L.choose(bouquetsRef.current, next);
            setBouquets(bouquetsRef.current);
          },
          finish: () => {
            const todo = L.untriedGroups(bouquetsRef.current);
            if (todo.length === 0) return;
            bouquetsRef.current = todo.reduce((acc, k) => L.choose(acc, k), bouquetsRef.current);
            setBouquets(bouquetsRef.current);
          },
        },
        showSolution: () => {
          if (groupsOnly) {
            setBouquets((s) => L.choose(L.choose(s, lists.g + 1 <= Math.min(a, b) ? lists.g + 1 : lists.g), lists.g));
            state.discover(); state.formalize();
            return;
          }
          setStage('lists');
          setLists((s) => { let x = s; for (const d of s.common) x = L.placeCommon(x, d); x = L.placePgcd(x, x.g); return x; });
          state.discover(); state.formalize();
        },
      }}
      representation={(
        <div className="space-y-2">
          {stage === 'bouquets' && bouquets.k !== null && (
            <EquationDisplay tex={`${a} = ${bouquets.k} \\times ${bouquets.qa} + ${bouquets.ra} \\quad ${b} = ${bouquets.k} \\times ${bouquets.qb} + ${bouquets.rb}`} size="sm"
              tone={bouquets.works ? 'ok' : 'neutral'}
              note={bouquets.works
                ? `${words.allUsed} ${t('manipulation.common.worksAll', { k: bouquets.k, a, b }).replace(/^[^:]*: /, '')}`
                : t('manipulation.common.leftOverItems', { ra: bouquets.ra, rb: bouquets.rb, itemA: words.itemsA, itemB: words.itemsB })} />
          )}
          {stage === 'lists' && lists.placed.length > 0 && (
            <EquationDisplay tex={`\\{${lists.placed.join(' ; ')}\\}`} note={t('manipulation.commonDivisorsLabel')} tone={L.allCommonPlaced(lists) ? 'ok' : 'neutral'} size="sm" />
          )}
        </div>
      )}
      discovery={(
        <ManipulationDiscovery
          state={state}
          prompt={t('manipulation.common.discoverPrompt')}
          options={[
            { text: t('manipulation.common.opt1'), correct: true },
            { text: t('manipulation.common.opt2', { a }), why: t('manipulation.common.why2', { b }) },
            { text: t('manipulation.common.opt3'), why: t('manipulation.common.why3') },
          ]}
          formal={(
            <div className="space-y-2">
              <EquationDisplay tex={`\\mathrm{PGCD}(${a}\\ ;\\ ${b}) = ${lists.g}`} tone="result" size="lg" />
              <p className="text-sm text-slate-700">{t('manipulation.common.conclusion')}</p>
            </div>
          )}
        />
      )}
      explanation={t('manipulation.common.explanation')}
    >
      <ManipulationStage dragging={drag.dragging}>
        <div className="relative">
        {party.node}
        {!(gameScreen && cp.open) && cp.node}
        {showStepper && <div className="mb-2"><LabStepper count={stepDone.length} current={single ? 0 : stage === 'lists' ? 1 : 0} done={stepDone} stepAttr="data-cd-step" /></div>}
        {gameScreen && pred && bouquets.k === pred.k && !cp.open && (
          <p role="status" data-cd-predict-result={pred.ok ? 'ok' : 'wrong'}
            className={`mb-2 rounded-2xl px-4 py-2 text-center text-lg font-black ${pred.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
            {pred.ok ? t('manipulation.common.cp.predict.right') : t('manipulation.common.cp.predict.wrong')}
          </p>
        )}
        {gameScreen && choices?.length > 0 && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5" data-cd-choices>
            <span className="text-sm font-bold text-slate-600">{t('manipulation.common.choicesLabel')}</span>
            {choices.map((c) => (
              <button key={`${c.a}-${c.b}`} type="button" data-cd-choice={`${c.a}-${c.b}`} disabled={locked} onClick={() => state.setNumbers({ a: c.a, b: c.b })}
                className={`min-h-[44px] rounded-xl border-2 px-3 text-base font-black ${c.a === a && c.b === b ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'}`}>
                <bdi dir="ltr">{c.a} · {c.b}</bdi>
              </button>
            ))}
          </div>
        )}
        {stage === 'bouquets' ? (
          <div className={gameScreen ? 'grid grid-cols-[minmax(0,1fr)_15rem] gap-3' : ''}>
          <div className="min-w-0 space-y-3">
            {/* LA RÉSERVE : on TIRE un emballage vide vers la table (ou on en
                rend un) ; − / + font le même geste sans glisser. */}
            <GroupStock drag={drag} theme={theme} words={words} k={shownK} tried={bouquets.tried}
              canAdd={!locked && L.canChoose(bouquets, (bouquets.k ?? 0) + 1) === true} onAdd={addGroup} onRemove={removeGroup} />
            <DropZone drag={drag} id="table" label={t('manipulation.common.groupsZone', { group: words.group })} minHeight="min-h-[150px]" className="p-3" data-groups-table>
              {/* LA TABLE : avant tout choix, les deux piles entières ; après,
                  k cadres identiques et, à part, ce qui n'est entré nulle
                  part. Tout est dessiné — le reste se compte des yeux. */}
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                <span className="text-slate-700">{words.scene}</span>
                {bouquets.k === null
                  ? <span className="text-slate-500">{t('manipulation.common.pileHint', { stock: words.stock })}</span>
                  : !quiet && <span className={bouquets.works ? 'text-emerald-700' : 'text-amber-800'}>{gLabel}</span>}
              </div>
              {bouquets.k !== null && (
                <div className="mb-2 flex justify-end">
                  <DraggableObject drag={drag} id="group:remove" label={words.remove} className="flex items-center gap-1 rounded-lg px-1 text-[11px] font-bold text-slate-500">
                    {wrapper}<span>→ {words.stock}</span>
                  </DraggableObject>
                </div>
              )}
              <GroupingScene
                a={a} b={b} k={shownK} theme={theme} words={words}
                ariaLabel={shownK === null ? `${a} ${words.itemsA} · ${b} ${words.itemsB}` : `${a} = ${shownK} × ${Math.floor(a / shownK)} + ${a % shownK} · ${b} = ${shownK} × ${Math.floor(b / shownK)} + ${b % shownK}`}
              />
            </DropZone>
            {needBeyond && (
              <p className="rounded-xl border-2 border-sky-200 bg-sky-50 px-3 py-2 text-sm font-bold text-sky-900" data-groups-beyond>
                {t('manipulation.common.groupsNeedBeyond', { g })}
              </p>
            )}
            {!groupsOnly && groupsDone && !cp.blocking && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3" data-common-next>
                <p className="text-sm font-bold text-emerald-900">{t('manipulation.common.groupsDone', { g: lists.g, a, b })}</p>
                <button type="button" onClick={() => setStage('lists')}
                  className="min-h-[44px] rounded-xl bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                  {t('manipulation.common.toLists')}
                </button>
              </div>
            )}
          </div>
          {/* lecteur : le JOURNAL des essais, dans la colonne du labo */}
          {gameScreen && (
            <div className="min-w-0" data-cd-side>
              {Object.keys(bouquets.tried).length > 0 && !quiet && <GroupTrials a={a} b={b} tried={bouquets.tried} words={words} />}
            </div>
          )}
          </div>
        ) : (
          <div className="space-y-3">
            {startWith !== 'lists' && (
              <button type="button" onClick={() => setStage('bouquets')} data-common-back
                className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-emerald-400">
                {t('manipulation.common.backToGroups')}
              </button>
            )}
            <div className="grid gap-2 grid-cols-2">
              {[{ side: 'a', n: a, list: lists.da }, { side: 'b', n: b, list: lists.db }].map(({ side, n, list }) => (
                <div key={side} className="rounded-2xl border-2 border-slate-200 bg-white p-2">
                  <div className="mb-1 text-xs font-bold text-slate-700">{t('manipulation.divisorsOf', { n })}</div>
                  <div dir="ltr" className="flex flex-wrap gap-1.5">
                    {list.map((d) => (
                      <DivisorChip key={`${side}${d}`} value={d} drag={drag} id={`${side}:${d}`} label={`${d}`}
                        state={lists.placed.includes(d) ? 'common' : 'idle'} disabled={lists.placed.includes(d)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-2 grid-cols-[1fr_auto]">
              <DropZone drag={drag} id="middle" label={t('manipulation.common.middleZone')} tone="emerald" hint={lists.placed.length === 0 ? t('manipulation.common.dropCommon') : undefined} minHeight="min-h-[72px]" className="p-2">
                <div className="mb-1 text-[11px] font-bold text-emerald-800">{t('manipulation.common.middleZone')}</div>
                <div dir="ltr" className="flex flex-wrap gap-1.5">
                  {lists.placed.map((d) => (
                    <DivisorChip key={`m${d}`} value={d} drag={lists.pgcd === null ? drag : undefined} id={`m:${d}`} label={`${d}`} state={lists.pgcd === d ? 'pgcd' : 'common'} />
                  ))}
                </div>
              </DropZone>
              <DropZone drag={drag} id="pgcd" label={t('manipulation.common.pgcdZone')} tone="amber" hint={lists.pgcd === null ? t('manipulation.common.dropGreatest') : undefined} minHeight="min-h-[72px]" className="flex flex-col items-center justify-center px-4">
                <div className="text-[11px] font-mono font-bold text-amber-800">PGCD</div>
                {lists.pgcd !== null && <NumberTile value={lists.pgcd} tone="pgcd" size="lg" />}
              </DropZone>
            </div>
          </div>
        )}

        {reject && (
          <p role="status" className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {reject.groups
              ? t(`manipulation.common.reject.${reject.reason}`)
              : t(`manipulation.common.listReject.${reject.reason}`, { d: reject.d, a, b, defaultValue: t('manipulation.common.reject.tooMany') })}
          </p>
        )}
        </div>
      </ManipulationStage>
      <DragGhost ghost={drag.ghost}>{drag.held?.startsWith('group:') ? wrapper : heldValue !== null && <NumberTile value={heldValue} tone="divisor" />}</DragGhost>
    </ManipulationShell>
  );
}


/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

export const CHAINS = { groupsOnly: ['greatest', 'beyond', 'rule'], groups: ['greatest', 'beyond'], lists: ['listCommon', 'listWhy', 'rule'] };
/** Lecteur (rollout 2026-11-08, même traitement que team-builder) : observer d'un toucher → BÂTIR a = k × q → au-delà → la règle. */
export const CHAINS_PLAYER = { groupsOnly: ['observe', 'build', 'beyondFill', 'rule'], groups: ['observe', 'build', 'beyondFill'], lists: ['listCommonFill', 'listWhy', 'rule'] };

/** Le JOURNAL des essais (lecteur) : chaque nombre de groupes essayé, ce qui reste de chaque objet, ✓ quand rien ne reste. Les 6 derniers. */
const TRIALS_SHOWN = 6;
export function GroupTrials({ a, b, tried, words }) {
  const { t } = useTranslation('lesson');
  const all = Object.keys(tried).map(Number).sort((x, y) => x - y);
  const rows = all.slice(-TRIALS_SHOWN);
  const k = (key, o) => t(`manipulation.common.trials.${key}`, o);
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-indigo-100 bg-white" data-cd-trials>
      <p className="bg-indigo-50 px-2 py-1 text-sm font-black text-indigo-900">
        📋 {k('title')}{all.length > TRIALS_SHOWN && <span className="block text-xs font-bold text-indigo-500">{k('lastOf', { n: TRIALS_SHOWN, total: all.length })}</span>}
      </p>
      <table className="w-full table-fixed text-center">
        <thead className="text-[11px] font-black leading-tight text-slate-500">
          <tr><th className="w-[30%] px-1 py-0.5">{words.groups}</th><th className="px-1 py-0.5">{k('left', { items: words.itemA })}</th><th className="px-1 py-0.5">{k('left', { items: words.itemB })}</th></tr>
        </thead>
        <tbody>
          {rows.map((kk) => {
            const ra = a % kk; const rb = b % kk; const ok = ra === 0 && rb === 0;
            return (
              <tr key={kk} data-cd-trial={kk} data-exact={ok ? 'true' : 'false'} className={`border-t border-indigo-50 text-base font-black ${ok ? 'bg-emerald-50 text-emerald-800' : 'text-slate-800'}`}>
                <td className="whitespace-nowrap px-1 py-0.5" dir="ltr">{ok ? '✓ ' : ''}{kk}</td>
                <td className={`px-1 py-0.5 ${ra ? 'text-rose-600' : ''}`}>{ra}</td>
                <td className={`px-1 py-0.5 ${rb ? 'text-rose-600' : ''}`}>{rb}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const $ = (x) => `$${x}$`;
const Cq = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;
const tryKeys = (bq) => Object.keys(bq.tried).map(Number).sort((x, y) => x - y);
/** Le plus grand nombre de groupes essayé qui tombait juste pour les DEUX nombres. */
export const greatestTried = (bq) => Math.max(...tryKeys(bq).filter((x) => bq.tried[x] === 'common'));

export const QUESTIONS = {
  // ce que les GROUPES montrent au plus grand nombre juste, d'un toucher : combien de groupes, combien de chaque objet par groupe
  observe: ({ a, b, bouquets, words }, k) => {
    const g = greatestTried(bouquets);
    const o = { groups: words.groups, group: words.group, itemsA: words.itemsA, itemsB: words.itemsB, g: $(g), eqa: $(`${a} = ${g} \\times ${a / g}`), eqb: $(`${b} = ${g} \\times ${b / g}`) };
    return {
      id: 'observe', kind: 'fill', prompt: Cq(k, 'observe.prompt', o),
      fields: [
        { label: k('cp.observe.g', o), expected: g, options: chipsAround(g, { min: 1 }) },
        { label: k('cp.observe.qa', o), expected: a / g, options: chipsAround(a / g, { min: 1 }) },
        { label: k('cp.observe.qb', o), expected: b / g, options: chipsAround(b / g, { min: 1 }) },
      ],
      hints: [Cq(k, 'observe.hint1', o), Cq(k, 'observe.hint2', o)], explain: Cq(k, 'observe.explain', o),
    };
  },
  // l'égalité BÂTIE : a = k × q, chaque emplacement porte le sens de son nombre (une tuile de trop : le nombre de l'autre objet)
  build: ({ a, b, bouquets, words }, k) => {
    const g = greatestTried(bouquets);
    // la question NOMME l'objet (propriétaire, 2026-11-09 : on ne voyait pas si c'étaient les maillots ou les ballons) — « كل الكرات »,
    // « عدد الفرق », « كرات في كل فريق » ; la tuile de trop est le nombre de l'AUTRE objet par groupe : confondre les deux est une erreur vue
    const o = { groups: words.groups, group: words.group, itemsA: words.itemsA, theA: words.theA, theB: words.theB, theGroups: words.theGroups,
      a: $(a), g: $(g), q: $(a / g), eq: $(`${a} = ${g} \\times ${a / g}`) };
    return {
      id: 'build', kind: 'build', prompt: Cq(k, 'build.prompt', o),
      slots: [k('cp.build.slotA', o), k('cp.build.slotK', o), k('cp.build.slotQ', o)],
      tiles: [a / g, b / g, a, g], expected: [a, g, a / g],
      hints: [Cq(k, 'build.hint1', o), Cq(k, 'build.hint2', o)], explain: Cq(k, 'build.explain', o),
    };
  },
  // au-delà du plus grand : ce qui reste, d'un toucher
  beyondFill: ({ a, b, bouquets, words }, k) => {
    const g = greatestTried(bouquets);
    const over = tryKeys(bouquets).find((x) => x > g);
    const useA = a % over !== 0;
    const n = useA ? a : b; const r = n % over;
    const o = { groups: words.groups, items: useA ? words.itemsA : words.itemsB, kk: $(over), n: $(n), r: $(r), eq: $(`${n} = ${over} \\times ${Math.floor(n / over)} + ${r}`) };
    return {
      id: 'beyondFill', kind: 'fill', prompt: Cq(k, 'beyond.promptPlayer', o),
      fields: [{ label: k('cp.beyond.left', o), expected: r, options: chipsAround(r) }],
      hints: [Cq(k, 'beyond.hint1', o), Cq(k, 'beyond.hint2', o)], explain: Cq(k, 'beyond.explain', o),
    };
  },
  listCommonFill: ({ a, b, lists }, k) => {
    const n = lists.common.length;
    const o = { list: $(`\\{${lists.common.join(' ; ')}\\}`), n: $(n), a: $(a), b: $(b) };
    return {
      id: 'listCommonFill', kind: 'fill', prompt: Cq(k, 'listCommon.prompt', o),
      fields: [{ label: k('cp.listCommon.count'), expected: n, options: chipsAround(n, { min: 1 }) }],
      hints: [Cq(k, 'listCommon.hint1'), Cq(k, 'listCommon.hint2', o)], explain: Cq(k, 'listCommon.explain', o),
    };
  },
  greatest: ({ a, b, bouquets, words }, k) => {
    const g = greatestTried(bouquets);
    const o = { groups: words.groups, itemsA: words.itemsA, itemsB: words.itemsB, g: $(g), eqa: $(`${a} = ${g} \\times ${a / g}`), eqb: $(`${b} = ${g} \\times ${b / g}`) };
    return { id: 'greatest', kind: 'number', expected: String(g), answer: <MathText>{$(g)}</MathText>, prompt: Cq(k, 'greatest.prompt', o), hints: [Cq(k, 'greatest.hint1'), Cq(k, 'greatest.hint2')], explain: Cq(k, 'greatest.explain', o) };
  },
  beyond: ({ a, b, bouquets, words }, k) => {
    const g = greatestTried(bouquets);
    const over = tryKeys(bouquets).find((x) => x > g);
    const useA = a % over !== 0;
    const n = useA ? a : b; const r = n % over;
    const o = { groups: words.groups, items: useA ? words.itemsA : words.itemsB, kk: $(over), n: $(n), r: $(r), eq: $(`${n} = ${over} \\times ${Math.floor(n / over)} + ${r}`) };
    return { id: 'beyond', kind: 'number', expected: String(r), answer: <MathText>{$(r)}</MathText>, prompt: Cq(k, 'beyond.prompt', o), hints: [Cq(k, 'beyond.hint1', o), Cq(k, 'beyond.hint2', o)], explain: Cq(k, 'beyond.explain', o) };
  },
  listCommon: ({ a, b, lists }, k) => {
    const n = lists.common.length;
    const o = { list: $(`\\{${lists.common.join(' ; ')}\\}`), n: $(n), a: $(a), b: $(b) };
    return { id: 'listCommon', kind: 'number', expected: String(n), answer: <MathText>{$(n)}</MathText>, prompt: Cq(k, 'listCommon.prompt', o), hints: [Cq(k, 'listCommon.hint1'), Cq(k, 'listCommon.hint2', o)], explain: Cq(k, 'listCommon.explain', o) };
  },
  listWhy: ({ a, b, lists }, k) => {
    const g = lists.g; const big = Math.max(a, b); const other = Math.min(a, b);
    const o = { g: $(g), big: $(big), other: $(other), list: $(`\\{${lists.common.join(' ; ')}\\}`) };
    const options = [
      { text: Cq(k, 'listWhy.right'), correct: true },
      { text: Cq(k, 'listWhy.big', o), why: Cq(k, 'listWhy.whyBig', o) },
      g > 1 && { text: Cq(k, 'listWhy.small'), why: Cq(k, 'listWhy.whySmall', o) },
    ].filter(Boolean);
    return { id: 'listWhy', kind: 'choice', prompt: Cq(k, 'listWhy.prompt', o), options, hints: [Cq(k, 'listWhy.hint1'), Cq(k, 'listWhy.hint2')], explain: Cq(k, 'listWhy.explain', o) };
  },
  rule: ({ a, b, lists }, k) => ({
    id: 'rule', kind: 'choice', prompt: <MathText>{k('discoverPrompt')}</MathText>,
    options: [
      { text: <MathText>{k('opt2', { a })}</MathText>, why: <MathText>{k('why2', { b })}</MathText> },
      { text: <MathText>{k('opt1')}</MathText>, correct: true },
      { text: <MathText>{k('opt3')}</MathText>, why: <MathText>{k('why3')}</MathText> },
    ],
    hints: [Cq(k, 'rule.hint1'), Cq(k, 'rule.hint2')],
    explain: <MathText>{`${$(`\\mathrm{PGCD}(${a}\\ ;\\ ${b}) = ${lists.g}`)} — ${k('conclusion')}`}</MathText>,
  }),
};
