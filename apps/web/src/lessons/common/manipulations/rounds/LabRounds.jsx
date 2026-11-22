import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Manipulation from '../Manipulation';
import { scopedStorage } from '../../../../utils/storage';
import { useLabJump } from '../../mission/missionPlayerContext';
import {
  emptyLog, logEvent, roundWon, starsFor, starCriteria, needsHelp, roundUnlocked, jumpTarget, resumeRound, readStars, recordStars, STARS_EVENT,
  easierProps, releasesOnEasyWin,
} from './roundsModel';

/**
 * UN LABO EN MANCHES (« الجولات » + étoiles, propriétaire 2026-11-04) — au lieu du sélecteur مبتدئ / متقدم.
 *
 *   <LabRounds lessonId labId rounds={[…]} onRoundWon={(id) => …} onVerdict onTrial />
 *
 * En haut, le CHEMIN des manches (numéro, titre, meilleures étoiles ★★☆, serrure) ; au milieu, la manche courante — un labo
 * NEUF par manche (`key`), donc sa propre « مهمتك » en grand (ManipulationShell) ; à la victoire, une carte : les étoiles
 * gagnées une à une, pourquoi (gagnée · questions justes du premier coup · peu d'essais), et « الجولة التالية ». Rejouer une
 * manche ne fait jamais perdre d'étoiles. Le terrain libre (`free`) est toujours ouvert (règle « جرّب أعدادك »).
 * La logique est dans roundsModel.js ; les étoiles vivent par élève dans scopedStorage (la barre de mission en fait le total).
 */
// la célébration du labo (LabSteps.useStepCelebration) dure 2,2 s : la carte de la manche vient APRÈS elle
const WIN_DELAY_MS = 2400;

export default function LabRounds({ lessonId, labId, rounds, onRoundWon, onVerdict, onTrial, icon = '⚽', freeIcon = '🏟️' }) {
  const { t } = useTranslation('lesson');
  const reduceMotion = useReducedMotion();
  const [best, setBest] = useState(() => readStars(scopedStorage, lessonId)[labId] ?? {});
  const [index, setIndex] = useState(() => resumeRound(rounds, readStars(scopedStorage, lessonId)[labId] ?? {}));
  const [log, setLog] = useState(emptyLog);
  const [win, setWin] = useState(null); // { roundId, stars, why: [bool, bool, bool] }
  // LA SECONDE CHANCE (conseil + propriétaire, 2026-11-08) : quand l'élève peine (needsHelp), une carte « لا بأس — جرّب أصغر »
  // ouvre la manche d'entraînement `round.easier` (plus petite, sans étoiles, hors du chemin) ; gagnée, elle ramène à la manche.
  const [practice, setPractice] = useState(false);
  const [helpOff, setHelpOff] = useState(false);
  const [practiceDone, setPracticeDone] = useState(false);
  // le journal de la manche au moment où l'élève part s'entraîner : il choisit les nombres de l'entraînement (`easier.props` fonction)
  const [mainLog, setMainLog] = useState(emptyLog);
  const announced = useRef(new Set());
  // gagnée UNE fois par passage ; le minuteur de la carte vit hors de l'effet (un nouvel événement ne doit pas l'annuler)
  const wonRef = useRef(false);
  const winTimer = useRef(null);
  useEffect(() => () => clearTimeout(winTimer.current), []);
  const round = rounds[index];
  // la PORTE du labo : une étape demande une manche → on la choisit ; sa victoire proposera d'abord de revenir à l'étape
  const labJump = useLabJump();
  const asked = labJump?.request;
  useEffect(() => {
    if (!asked) return;
    // une manche fermée n'est jamais sautée : la porte mène à la première manche requise non gagnée (roundsModel › jumpTarget)
    const i = jumpTarget(rounds, rounds.findIndex((r) => r.id === asked.roundId), best);
    if (i >= 0 && i !== index) go(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asked?.nonce]);

  // Les manches DÉJÀ gagnées (une visite précédente) comptent pour le module dès l'arrivée.
  useEffect(() => {
    Object.keys(best).forEach((id) => { if (!announced.current.has(id)) { announced.current.add(id); onRoundWon?.(id); } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La victoire : une seule fois par passage dans la manche.
  useEffect(() => {
    if (practice) {
      if (wonRef.current || !round?.easier || !roundWon(round.easier, log)) return;
      wonRef.current = true;
      // l'entraînement gagné LIBÈRE la manche quand elle le dit : 1 ★ (jamais moins que ses meilleures), les étapes qui l'attendent s'ouvrent
      if (releasesOnEasyWin(round)) {
        const all = recordStars(scopedStorage, lessonId, labId, round.id, 1);
        setBest(all[labId] ?? {});
        window.dispatchEvent(new Event(STARS_EVENT));
        announced.current.add(round.id);
        onRoundWon?.(round.id);
      }
      winTimer.current = setTimeout(() => setPracticeDone(true), WIN_DELAY_MS);
      return;
    }
    if (wonRef.current || !round || !roundWon(round, log)) return;
    wonRef.current = true;
    const stars = starsFor(round, log);
    // l'étoile 2 : les prédictions justes (pilote 2026-11-07), plus « questions justes du premier coup »
    const { clean, few } = starCriteria(round, log);
    const all = recordStars(scopedStorage, lessonId, labId, round.id, stars);
    setBest(all[labId] ?? {});
    window.dispatchEvent(new Event(STARS_EVENT));
    announced.current.add(round.id);
    onRoundWon?.(round.id);
    // La carte de la manche ATTEND la célébration du labo (LabSteps : « المهمة 1 مكتملة ») : l'une après l'autre, jamais l'une
    // sur l'autre. L'attente suit la réussite de l'élève — ce n'est pas un minuteur de lecture.
    winTimer.current = setTimeout(() => setWin({ roundId: round.id, stars, why: [true, clean, few] }), WIN_DELAY_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log]);

  const go = (i) => {
    clearTimeout(winTimer.current); wonRef.current = false; setIndex(i); setLog(emptyLog()); setWin(null);
    setPractice(false); setPracticeDone(false); setHelpOff(false);
  };
  const startPractice = () => { clearTimeout(winTimer.current); wonRef.current = false; setMainLog(log); setLog(emptyLog()); setPractice(true); setPracticeDone(false); };
  const showHelp = !practice && !win && !helpOff && needsHelp(round, log);
  const returnsToStep = Boolean(win && labJump?.stepIndexFor?.(win.roundId) >= 0);
  const nextIndex = rounds.findIndex((r, i) => i > index && roundUnlocked(rounds, i, best));

  const chipLabel = (r, i) => (r.free ? t('manipulation.rounds.free') : r.optional ? t('manipulation.rounds.challenge') : t('manipulation.rounds.round', { n: i + 1 }));
  const Stars = ({ n, size = 'text-sm' }) => (
    <span className={`${size} tracking-tight`} aria-label={t('manipulation.rounds.starsLabel', { n })} dir="ltr">
      {[0, 1, 2].map((k) => <span key={k} className={k < n ? 'text-amber-400' : 'text-slate-300'}>★</span>)}
    </span>
  );

  return (
    <div className="space-y-3" data-lab-rounds={labId}>
      <ol className="flex flex-wrap items-stretch gap-2" aria-label={t('manipulation.rounds.track')} data-rounds-track>
        {rounds.map((r, i) => {
          const open = roundUnlocked(rounds, i, best);
          const current = i === index;
          const got = best[r.id] ?? 0;
          return (
            <li key={r.id}>
              <button type="button" disabled={!open} onClick={() => go(i)} aria-current={current ? 'step' : undefined}
                title={open ? r.title : t('manipulation.rounds.locked')} data-round={r.id} data-round-stars={got}
                className={`flex min-h-[52px] items-center gap-2 rounded-2xl border-2 px-3 text-start transition-colors ${current ? 'border-indigo-600 bg-indigo-600 text-white shadow' : open ? 'border-indigo-200 bg-white text-indigo-950 hover:bg-indigo-50' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
                <span className="text-lg" aria-hidden="true">{!open ? '🔒' : r.free ? freeIcon : r.optional ? '⭐' : got ? '✓' : icon}</span>
                <span className="leading-tight">
                  <span className="block text-sm font-black">{chipLabel(r, i)}</span>
                  {!r.free && <Stars n={got} size="text-xs" />}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="relative">
        {round && practice && round.easier && (
          // la manche d'entraînement : ses événements NE remontent PAS au module (d'autres nombres que la vraie manche)
          <Manipulation
            key={`${labId}:${round.id}:easy`}
            {...easierProps(round, mainLog)}
            levels={false}
            onVerdict={(v) => setLog((l) => logEvent(l, 'verdict', v))}
            onTrial={(e) => setLog((l) => logEvent(l, 'trial', e))}
          />
        )}
        {round && !practice && (
          <Manipulation
            key={`${labId}:${round.id}`}
            {...round.props}
            levels={false}
            onVerdict={(v) => { setLog((l) => logEvent(l, 'verdict', v)); onVerdict?.(v); }}
            onTrial={(e) => { setLog((l) => logEvent(l, 'trial', e)); onTrial?.(e); }}
          />
        )}
        {practice && (
          <span className="pointer-events-none absolute start-3 top-3 z-30 rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-900 ring-1 ring-amber-300" data-round-practice>
            🎯 {t('manipulation.rounds.practiceBadge')}
          </span>
        )}
        <AnimatePresence>
          {/* une carte CLAIRE posée en bas du terrain — pas de fond sombre, rien ne bouge dans la page (conseil 2026-11-07) */}
          {(showHelp || practiceDone) && (
            <motion.div key={practiceDone ? 'practice-done' : 'help'} role="status"
              data-round-help={practiceDone ? 'done' : 'offer'}
              className="absolute inset-x-0 bottom-4 z-40 mx-auto flex w-fit max-w-[92%] flex-wrap items-center justify-center gap-3 rounded-3xl border-2 border-amber-300 bg-white px-6 py-4 shadow-2xl"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}>
              <p className="text-xl font-black text-indigo-950">
                {practiceDone ? t('manipulation.rounds.practiceWon') : t('manipulation.rounds.helpTitle')}
                <span className="ms-2 text-base font-bold text-slate-600">{practiceDone ? '' : (round?.easier?.helpLine ?? t('manipulation.rounds.helpLine'))}</span>
              </p>
              {practiceDone ? (
                <>
                  {/* la manche est LIBÉRÉE (`easier.releases`) : l'étape qui l'attendait, ou la manche suivante, est proposée d'abord */}
                  {releasesOnEasyWin(round) && labJump?.stepIndexFor?.(round.id) >= 0 && (
                    <button type="button" // la manche repart PROPRE (journal vide, wonRef remis) avant le retour à l'étape — revue 2026-11-10
                      onClick={() => { go(index); labJump.toStep(round.id); }} data-round-return autoFocus
                      className="min-h-[52px] rounded-2xl bg-emerald-700 px-6 text-lg font-black text-white shadow-[0_4px_0_0_#065F46] hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">
                      {t('manipulation.rounds.backToStep')} <span aria-hidden="true">←</span>
                    </button>
                  )}
                  {releasesOnEasyWin(round) && !(labJump?.stepIndexFor?.(round.id) >= 0) && nextIndex >= 0 && (
                    <button type="button" onClick={() => go(nextIndex)} data-round-next autoFocus
                      className="min-h-[52px] rounded-2xl bg-indigo-700 px-6 text-lg font-black text-white shadow-[0_4px_0_0_#3730A3] hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">
                      {t('manipulation.rounds.next')} <span aria-hidden="true">←</span>
                    </button>
                  )}
                  <button type="button" onClick={() => go(index)} data-round-practice-back
                    // le focus va au PREMIER bouton de la carte : celui-ci quand ni « عُد إلى الخطوة » ni « الجولة التالية » ne s'affiche
                    autoFocus={!releasesOnEasyWin(round) || !(labJump?.stepIndexFor?.(round.id) >= 0 || nextIndex >= 0)}
                    className="min-h-[52px] rounded-2xl bg-emerald-700 px-6 text-lg font-black text-white shadow-[0_4px_0_0_#065F46] hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">
                    {t('manipulation.rounds.practiceBack', { n: index + 1 })} <span aria-hidden="true">←</span>
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={startPractice} data-round-help-go autoFocus
                    className="min-h-[52px] rounded-2xl bg-amber-500 px-6 text-lg font-black text-white shadow-[0_4px_0_0_#B45309] hover:bg-amber-600">
                    {t('manipulation.rounds.helpGo')} <span aria-hidden="true">←</span>
                  </button>
                  <button type="button" onClick={() => setHelpOff(true)} data-round-help-stay
                    className="min-h-[52px] rounded-2xl px-4 text-base font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
                    {t('manipulation.rounds.helpStay')}
                  </button>
                </>
              )}
            </motion.div>
          )}
          {win && (
            <motion.div key="round-win" data-round-win={win.roundId}
              className="absolute inset-0 z-40 flex items-center justify-center rounded-3xl bg-indigo-950/70 p-6 backdrop-blur-sm"
              initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="w-full max-w-2xl space-y-6 rounded-3xl bg-white p-10 text-center shadow-2xl"
                initial={reduceMotion ? false : { scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>
                <p className="text-3xl font-black text-indigo-950">🎉 {round?.optional ? t('manipulation.rounds.challengeWon') : t('manipulation.rounds.won')}</p>
                <p className="flex justify-center gap-3 text-6xl" dir="ltr" aria-label={t('manipulation.rounds.starsLabel', { n: win.stars })}>
                  {[0, 1, 2].map((k) => (
                    <motion.span key={k} className={k < win.stars ? 'text-amber-400 drop-shadow' : 'text-slate-200'}
                      initial={reduceMotion ? false : { scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: reduceMotion ? 0 : 0.25 + k * 0.25, type: 'spring', stiffness: 320, damping: 14 }}>★</motion.span>
                  ))}
                </p>
                <ul className="mx-auto max-w-md space-y-1 text-start text-lg">
                  {win.why.map((ok, k) => (
                    <li key={k} className={ok ? 'font-bold text-emerald-700' : 'text-slate-400'}>{ok ? '★' : '☆'} {t(`manipulation.rounds.why${k + 1}`)}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap justify-center gap-3">
                  {/* la manche ouvre une étape du module : on y retourne d'abord (conseil 2026-11-07), la manche suivante passe après */}
                  {returnsToStep && (
                    <button type="button" onClick={() => { setWin(null); labJump.toStep(win.roundId); }} data-round-return autoFocus
                      className="min-h-[56px] rounded-2xl bg-emerald-600 px-8 text-xl font-black text-white shadow-[0_4px_0_0_#047857] hover:bg-emerald-700">
                      {t('manipulation.rounds.backToStep')} <span aria-hidden="true">←</span>
                    </button>
                  )}
                  {nextIndex >= 0 && !returnsToStep && (
                    <button type="button" onClick={() => go(nextIndex)} data-round-next autoFocus
                      className="min-h-[56px] rounded-2xl bg-indigo-600 px-8 text-xl font-black text-white shadow-[0_4px_0_0_#3730A3] hover:bg-indigo-700">
                      {t('manipulation.rounds.next')} <span aria-hidden="true">←</span>
                    </button>
                  )}
                  <button type="button" onClick={() => setWin(null)} data-round-stay
                    className="min-h-[56px] rounded-2xl px-6 text-lg font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
                    {t('manipulation.rounds.stay')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
