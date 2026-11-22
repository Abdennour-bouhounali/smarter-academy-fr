import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Target, BookMarked, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import ModuleLayout from '../components/ModuleLayout';
import { useProgress } from '../hooks/useProgress';
import { useEvidenceSubmission } from '../hooks/useEvidenceSubmission';
import { useCountdownTimer } from '../hooks/useCountdownTimer';
import { useFinalTestAttempt } from '../hooks/useFinalTestAttempt';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import {
  Feedback, ChoiceGrid, ValidateButton, MissionBrief, TimerToggle, TimerDisplay,
} from '../components/LessonUI';
import TestPresentation, { useTestPresentation } from './TestPresentation';
import { revealAll, revealOne, optionOrder } from './testPresentation';
import LessonLearningPointsStatus from '../components/LessonLearningPointsStatus';
import EarlierYearReview from '../../../features/learning/EarlierYearReview';
import { playSfx } from '../utils/playEffect';
import { useInMissionPlayer, useAutoAdvance, useDeclareUnitNav } from '../mission/missionPlayerContext';
import TimedNotice from '../mission/TimedNotice';
import MissionDialog from '../mission/MissionDialog';
import DiagnosticPlayQuestion, { SIGNAL_MS } from './DiagnosticPlayQuestion';
import { isMissionView } from '../mission/missionModel';
import { useClassroomMode } from '../classroom/ClassroomContext';
import { getLoadedLessonConfig } from '../../registry';

/**
 * Lesson kit — moteur du module final « Boss Final » (évaluatif).
 *
 * La forme obligatoire du test final (LESSON_INTEGRATION_GUIDE.md §7),
 * appliquée par construction : QCM uniquement, silencieux jusqu'au submit
 * global unique, puis Boss (correction) → Mon profil → Synthèse ; chaque
 * épreuve rattachée à ses learning points (evidence) ; persistance de la
 * tentative via useFinalTestAttempt ; timer facultatif ; badges par
 * compétence.
 *
 * Un module final devient un fichier de DONNÉES : épreuves, compétences,
 * badges, synthèse — zéro logique recopiée.
 *
 * MODE CLASSE (وضع القسم). Présenté, le test final devient une ÉPREUVE À LA
 * FOIS (TestPresentation) : السابق / التالي, « تحقّق من الإجابة » sur l'épreuve
 * courante, « كشف النتائج » à la fin, puis la revue une à une. Le barème,
 * l'evidence et la tentative ne changent pas d'un iota : « كشف النتائج »
 * appelle submitBoss(), le même envoi unique que le bouton de la page. Sur la
 * page de l'élève, rien ne change — le test reste silencieux jusqu'à son
 * envoi. Voir docs/architecture/CLASSROOM_MODE.md §5 « Test ».
 */

function Epreuve({ epreuve, index, total, pick, onPick }) {
  const { t } = useTranslation('lesson');
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-slate-200 bg-white rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-space font-bold text-slate-800">
          {epreuve.title ?? `${t('boss.trial')} ${index + 1}`}
        </h3>
        <span dir="ltr" className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 text-white">
          {index + 1}{'\u00A0/\u00A0'}{total}
        </span>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">{epreuve.prompt}</p>

      {epreuve.extra && <div className="bg-white border border-slate-200 rounded-xl p-2">{epreuve.extra}</div>}

      <ChoiceGrid
        options={epreuve.options}
        order={displayOrderOf(epreuve)}
        selected={pick}
        onSelect={onPick}
        cols={epreuve.cols || 2}
        renderOption={epreuve.renderOption}
      />
    </motion.div>
  );
}

/**
 * Indice de la bonne réponse d'une épreuve.
 *
 * Convention du projet : la bonne réponse est déclarée par `correct`. Seize
 * leçons construites avant le 2026-09-06 l'ont OMISE en plaçant
 * systématiquement la bonne réponse en première position ; `ep.correct` y
 * valait `undefined`, qu'aucun choix ne peut égaler — leur test final
 * affichait donc 0/N même pour un élève ayant tout juste (constaté au
 * navigateur sur fonction-affine-2nde). La valeur par défaut 0 répare ces
 * leçons sans toucher à leurs fichiers, et ne change rien à celles qui
 * déclarent `correct` explicitement.
 */
const correctIndexOf = (ep) => (typeof ep.correct === 'number' ? ep.correct : 0);

/**
 * L'ordre d'affichage des options (testPresentation.optionOrder) : les
 * auteurs placent la bonne réponse en tête ; on ne la montre pas en tête.
 * `keepOrder: true` sur une épreuve garde l'ordre écrit (une échelle, un
 * « صحيح / خاطئ »). L'indice choisi reste celui de l'auteur.
 */
const displayOrderOf = (ep) => (ep.keepOrder ? undefined : optionOrder(ep.id, ep.options.length));

/** Le libellé d'une option, `optionLabel` quand l'épreuve en fournit un. */
const optionLabelOf = (ep, i) => (ep.optionLabel ? ep.optionLabel(i) : ep.options[i]);

/**
 * LA CORRECTION D'UNE ÉPREUVE — le même bloc pour la page et pour la
 * présentation de classe : « إجابتك », la bonne réponse quand elle diffère,
 * puis la règle. BossReview (la page) et TestPresentation (le tableau) en
 * sont tous deux les clients : la correction du test final s'écrit ici, et
 * nulle part ailleurs.
 */
/** La الكفاءة évaluée par une épreuve (`assessment.learningPointIds` ou le `primary` de `learningPoints`). */
const assessedPointOf = (ep) => ep.assessment?.learningPointIds?.[0]
  ?? ep.assessment?.learningPoints?.find((lp) => lp.role === 'primary')?.code
  ?? ep.learningPointIds?.[0]
  ?? null;

function EpreuveReview({ ep, pick, isCorrect, lessonId = null }) {
  const { t } = useTranslation('lesson');
  return (
    <>
      <div className="text-sm space-y-1">
        <div className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
          <strong>{t('question.yourAnswer')}</strong>{' '}
          {pick == null ? t('boss.noAnswer') : optionLabelOf(ep, pick)}
        </div>
        {!isCorrect && (
          <div className="text-emerald-700">
            <strong>{t('question.correctAnswer')}</strong> {optionLabelOf(ep, correctIndexOf(ep))}
          </div>
        )}
      </div>
      <Feedback tone={isCorrect ? 'ok' : 'ko'}>{ep.explain}</Feedback>
      {/* « راجع: <درس> (<السنة>) » sous une réponse fausse (réseau, décision D7). */}
      {!isCorrect && <EarlierYearReview learningPointCode={assessedPointOf(ep)} lessonCode={lessonId} />}
    </>
  );
}

function BossReview({ epreuves, answers, onContinue, onRedo, lessonId = null }) {
  const { t } = useTranslation('lesson');
  const correctCount = epreuves.filter((ep) => answers[ep.id] === correctIndexOf(ep)).length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-6 text-center space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">{t('boss.challengeResult')}</div>
        {/* `dir="ltr"` : un score est une écriture NUMÉRIQUE. Sans lui, le
            bidi arabe inverse les deux nombres et « 10 / 11 » se lit
            « 11 / 10 » — le score et son maximum échangés. */}
        <div dir="ltr" className="text-3xl font-space font-extrabold">
          {correctCount}{'\u00A0/\u00A0'}{epreuves.length}
        </div>
      </div>

      <div className="space-y-4">
        {epreuves.map((ep, i) => {
          const pick = answers[ep.id];
          const isCorrect = pick === correctIndexOf(ep);
          return (
            <div
              key={ep.id}
              className={`border-2 rounded-2xl p-5 space-y-3 ${isCorrect ? 'border-emerald-300 bg-emerald-50/30' : 'border-rose-300 bg-rose-50/30'
                }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-space font-bold text-slate-800 flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                  )}
                  {ep.title ?? `${t('boss.trial')} ${i + 1}`}
                </h3>
                <span dir="ltr" className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 text-white">
                  {i + 1}{'\u00A0/\u00A0'}{epreuves.length}
                </span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{ep.prompt}</p>

              <EpreuveReview ep={ep} pick={pick} isCorrect={isCorrect} lessonId={lessonId} />
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 flex-row">
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl min-h-[48px]"
        >
          {t('boss.seeMasteryProfile')} <ArrowRight className="inline w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          className="py-3 px-5 bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-500 font-bold rounded-xl min-h-[48px]"
        >
          {t('boss.retakeTest')}
        </button>
      </div>
    </div>
  );
}

/**
 * « نتيجة هذا التحدي حسب المهارة » — les erreurs de CETTE tentative, par
 * compétence déclarée dans le module. Ce n'est PAS la maîtrise : les glyphes
 * sont neutres (✓ / ~ / ✗, jamais les 🟢🟡🔴 des الكفاءات) pour que
 * l'élève ne confonde pas le score d'un essai avec l'état calculé par le
 * serveur, rendu juste en dessous (LessonLearningPointsStatus).
 */
function ProfilMaitrise({ skills, scores, lessonConfig }) {
  const { t } = useTranslation('lesson');
  const levelOf = (misses) => (misses === 0 ? 'ok' : misses === 1 ? 'mid' : 'low');

  const META = {
    ok: { dot: '✓', label: t('boss.masteredWell'), tone: 'border-slate-200 bg-white', glyph: 'bg-slate-800 text-white' },
    mid: { dot: '~', label: t('boss.someErrors'), tone: 'border-slate-200 bg-slate-50', glyph: 'bg-slate-200 text-slate-800' },
    low: { dot: '✗', label: t('boss.needsWork'), tone: 'border-slate-300 bg-slate-50', glyph: 'bg-slate-300 text-slate-900' },
  };

  return (
    <div className="space-y-3" data-attempt-by-skill>
      {Object.entries(skills).map(([key, skill]) => {
        const misses = scores[key] ?? 0;
        const lvl = levelOf(misses);
        const meta = META[lvl];
        const target = lessonConfig.modules.find((m) => m.number === skill.module);

        return (
          <div key={key} className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 flex-wrap ${meta.tone}`} data-attempt-skill-level={lvl}>
            <div className="flex items-center gap-3">
              <span className={`w-7 h-7 rounded-lg font-mono text-sm font-bold flex items-center justify-center shrink-0 ${meta.glyph}`} aria-hidden="true">{meta.dot}</span>
              <div>
                <div className="font-space font-bold text-slate-800 text-sm">{skill.label}</div>
                <div className="text-xs text-slate-600">{meta.label}</div>
              </div>
            </div>
            {lvl !== 'ok' && target && (
              <Link
                to={target.path}
                className="text-xs font-mono font-bold px-3 py-2 rounded-lg bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-500 transition-colors"
              >
                {t('boss.reviewModule', { number: skill.module })} <ArrowRight className="inline w-3 h-3" aria-hidden="true" />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Lu SOUS le lecteur (BossFinal le rend plus bas) : avance quand une réponse de plus est donnée. */
function AutoAdvance({ count, delayMs }) {
  useAutoAdvance(count, delayMs);
  return null;
}

/**
 * LE MINUTEUR DANS LE LECTEUR (propriétaire, 2026-11-08) : facultatif comme sur la page, mais au bon endroit — une pastille
 * « ⏱ مؤقّت 7 دقائق » sur la PREMIÈRE question (avant toute réponse) ; une fois lancé, le décompte reste visible sur chaque
 * question (rouge la dernière minute). À zéro, le test s'envoie seul (onExpire → submitBoss).
 */
function TimerChip({ timer, durationLabel, canEnable }) {
  const { t } = useTranslation('lesson');
  if (timer.enabled) {
    return (
      <span dir="ltr" role="timer" data-boss-timer={timer.label}
        className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-4 font-mono text-lg font-black ${timer.remaining <= 60 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'}`}>
        ⏱ {timer.label}
      </span>
    );
  }
  if (!canEnable) return null;
  return (
    <button type="button" data-boss-timer-on onClick={() => { timer.setEnabled(true); timer.start(); }}
      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-indigo-300">
      ⏱ {t('boss.timerOn', { label: durationLabel })}
    </button>
  );
}

/**
 * LE RÉSULTAT EN UN ÉCRAN (lecteur, propriétaire 2026-11-08 : « comme أستعدّ ») — le score, UN cercle par épreuve (✓ / ✗, ✓؟ si
 * juste mais « غير متأكّد ») qui ouvre SA correction (même bloc EpreuveReview que la page), les compétences en une ligne, puis
 * « واصل » (le profil et la synthèse — rien n'est supprimé) et « أعد الاختبار ». `data-paging-keep` : un seul écran.
 */
function BossReviewCompact({ epreuves, answers, unsure = {}, skills, misses, lessonId, onContinue, onRedo }) {
  const { t } = useTranslation('lesson');
  const [open, setOpen] = useState(null);
  const oks = epreuves.map((ep) => answers[ep.id] === correctIndexOf(ep));
  const doubts = epreuves.map((ep, i) => oks[i] && Boolean(unsure[ep.id]));
  const score = oks.filter(Boolean).length;
  const perfect = score === epreuves.length;
  const ep = open == null ? null : epreuves[open];
  return (
    <div className="mx-auto max-w-3xl space-y-6" data-paging-keep data-boss-review>
      <div className={`flex items-center justify-center gap-5 rounded-3xl bg-gradient-to-br px-6 py-5 text-white ${perfect ? 'from-amber-500 to-orange-600' : 'from-slate-800 to-slate-900'}`}>
        <span className="text-5xl" aria-hidden="true">{perfect ? '🏆' : '🎯'}</span>
        <span dir="ltr" className="font-space text-4xl font-extrabold" data-boss-score={`${score}/${epreuves.length}`}>{score}{'\u00A0/\u00A0'}{epreuves.length}</span>
        <span className="text-lg font-bold">{t('boss.challengeResult')}</span>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-black text-slate-700">{t('diagnostic.yourAnswers')}</p>
        <ol className="flex flex-wrap gap-3" data-review-circles>
          {epreuves.map((e, i) => (
            <li key={e.id}>
              <button type="button" onClick={() => setOpen(i)} data-review-circle={i + 1} data-review-ok={oks[i] ? 'true' : 'false'}
                aria-label={`${t('question.label')} ${i + 1} — ${oks[i] ? t('diagnostic.reviewRight') : t('diagnostic.reviewWrong')}`}
                className={`flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 font-black transition-transform hover:scale-105 ${doubts[i] ? 'border-amber-400 bg-amber-50 text-amber-700' : oks[i] ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-700'}`}>
                <span dir="ltr" className="text-lg leading-none">{i + 1}</span>
                <span className="text-sm leading-none" aria-hidden="true">{doubts[i] ? '✓؟' : oks[i] ? '✓' : '✗'}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="text-xs text-slate-500">{t('diagnostic.reviewHintTap')}</p>
      </div>

      <ul className="flex flex-wrap gap-2">
        {Object.entries(skills).map(([key, sk]) => {
          const m = misses[key] ?? 0;
          return (
            <li key={key} data-boss-skill={key} className={`rounded-full px-3 py-1 text-sm font-bold ${m === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {m === 0 ? '✓' : m === 1 ? '~' : '✗'} {sk.label}
            </li>
          );
        })}
      </ul>

      <div className="flex gap-3">
        <button type="button" onClick={onContinue} data-boss-continue autoFocus
          className="min-h-[56px] flex-1 rounded-2xl bg-indigo-600 px-6 text-lg font-black text-white shadow-[0_4px_0_0_#3730A3] hover:bg-indigo-700">
          {t('boss.playContinue')} <span aria-hidden="true">←</span>
        </button>
        <button type="button" onClick={onRedo} data-boss-redo
          className="min-h-[56px] rounded-2xl border-2 border-slate-300 bg-white px-5 font-bold text-slate-700 hover:border-slate-500">
          {t('boss.retakeTest')}
        </button>
      </div>

      {ep && (
        <MissionDialog label={`${t('question.label')} ${open + 1}`} onClose={() => setOpen(null)}>
          <div className="space-y-4 pt-6 text-start" data-review-dialog={open + 1}>
            <p className={`flex items-center gap-2 text-lg font-black ${oks[open] ? 'text-emerald-700' : 'text-rose-700'}`}>
              {oks[open] ? '✓' : '✗'} {t('question.label')} <span dir="ltr">{open + 1}{'\u00A0/\u00A0'}{epreuves.length}</span>
            </p>
            <div className="text-lg leading-relaxed text-slate-800">{ep.prompt}</div>
            <EpreuveReview ep={ep} pick={answers[ep.id]} isCorrect={oks[open]} lessonId={lessonId} />
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <button type="button" disabled={open === 0} onClick={() => setOpen(open - 1)} data-review-prev
                className="min-h-[44px] rounded-xl px-4 font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-30">→ {t('diagnostic.reviewPrev')}</button>
              <button type="button" disabled={open === epreuves.length - 1} onClick={() => setOpen(open + 1)} data-review-next
                className="min-h-[44px] rounded-xl px-4 font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-30">{t('diagnostic.reviewNext')} ←</button>
            </div>
          </div>
        </MissionDialog>
      )}
    </div>
  );
}

/** Déclare au lecteur le bouton « السابق » de l'écran courant (rendu SOUS le lecteur). */
function UnitBack({ onPrevious }) {
  const nav = React.useMemo(() => ({ onPrevious, canNext: true }), [onPrevious]);
  useDeclareUnitNav(nav);
  return null;
}

/**
 * « نتيجتي » DANS LE LECTEUR (propriétaire, 2026-11-08) — sans onglets (« التحدي النهائي » : le bouton « السابق » du lecteur y
 * ramène ; « الحوصلة » retirée du lecteur) et en UN écran : le score, une carte par compétence (✓ / ~ / ✗ en grand, « راجع
 * المحور n » quand ce n'est pas acquis), les badges gagnés. L'état serveur des الكفاءات (LessonLearningPointsStatus) reste à un
 * geste, dans une fenêtre — jamais supprimé. « إنهاء » est le bouton du lecteur.
 */
function PlayerProfile({ skills, misses, score, total, lessonConfig, badges, masterBadge, completion, lessonId, tracksProgress, evidenceBatch }) {
  const { t } = useTranslation('lesson');
  const [statusOpen, setStatusOpen] = useState(false);
  const LEVEL = {
    ok: { glyph: '✓', ring: 'border-emerald-300 bg-emerald-50', dot: 'bg-emerald-500 text-white', text: 'text-emerald-800', label: t('boss.masteredWell') },
    mid: { glyph: '~', ring: 'border-amber-300 bg-amber-50', dot: 'bg-amber-400 text-amber-950', text: 'text-amber-800', label: t('boss.someErrors') },
    low: { glyph: '✗', ring: 'border-rose-300 bg-rose-50', dot: 'bg-rose-500 text-white', text: 'text-rose-800', label: t('boss.needsWork') },
  };
  const levelOf = (m) => (m === 0 ? 'ok' : m === 1 ? 'mid' : 'low');
  return (
    <div className="mx-auto max-w-4xl space-y-6" data-paging-keep data-boss-profile>
      <div className="flex flex-wrap items-center justify-center gap-4 text-center">
        <h2 className="font-space text-3xl font-extrabold text-slate-900">{t('boss.playProfileTitle')}</h2>
        <span dir="ltr" className="rounded-full bg-slate-900 px-4 py-1.5 font-space text-xl font-extrabold text-white">{score}{'\u00A0/\u00A0'}{total}</span>
      </div>
      {masterBadge && completion?.masterBadgeLabel && (
        <p className="rounded-2xl bg-gradient-to-l from-amber-400 to-orange-500 px-5 py-3 text-center text-xl font-black text-white" data-boss-master>🏆 {completion.masterBadgeLabel}</p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2" data-attempt-by-skill>
        {Object.entries(skills).map(([key, skill]) => {
          const lvl = levelOf(misses[key] ?? 0);
          const L = LEVEL[lvl];
          const target = lessonConfig.modules.find((m) => m.number === skill.module);
          return (
            <li key={key} className={`flex items-center gap-4 rounded-3xl border-2 px-5 py-4 ${L.ring}`} data-attempt-skill-level={lvl}>
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl font-black ${L.dot}`} aria-hidden="true">{L.glyph}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-black text-slate-900">{skill.label}</span>
                <span className={`block text-sm font-bold ${L.text}`}>{L.label}</span>
                {/* sous le nom (pas à côté) : le nom de la compétence garde toute la largeur de la carte */}
                {lvl !== 'ok' && target && (
                  <Link to={target.path} data-boss-review-module={skill.module}
                    className="mt-2 inline-flex min-h-[44px] items-center gap-1 rounded-2xl bg-white px-3 text-sm font-black text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50">
                    🔁 {t('boss.reviewModule', { number: skill.module })}
                  </Link>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {badges.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-2" aria-label={t('boss.badgesUnlocked')}>
          {badges.map((b) => (
            <li key={b.id} className="inline-flex items-center gap-2 rounded-full border-2 border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-bold text-amber-900">
              <span aria-hidden="true">{b.emoji}</span> {b.label}
            </li>
          ))}
        </ul>
      )}
      {tracksProgress && (
        <div className="text-center">
          <button type="button" onClick={() => setStatusOpen(true)} data-boss-lp-status
            className="min-h-[44px] rounded-2xl px-4 text-sm font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50">
            📊 {t('boss.playLpStatus')}
          </button>
        </div>
      )}
      {statusOpen && (
        <MissionDialog label={t('boss.playLpStatus')} onClose={() => setStatusOpen(false)}>
          <div className="pt-6 text-start">
            <LessonLearningPointsStatus lessonId={lessonId} refreshToken={evidenceBatch} />
          </div>
        </MissionDialog>
      )}
    </div>
  );
}

const PHASES = [
  { key: 'boss', labelKey: 'boss.phaseBoss', Icon: Trophy },
  { key: 'profil', labelKey: 'boss.phaseProfile', Icon: Target },
  { key: 'synthese', labelKey: 'boss.phaseSynthesis', Icon: BookMarked },
];

export default function BossFinal({
  ctx,
  navLinks,
  moduleNumber,
  moduleTitle,
  moduleSubtitle,
  estimatedTime = '15 min',
  lessonConfig,
  timerSeconds = 10 * 60,
  timerLabel = '10 min',
  brief,          // { tag, title, tone?, body }
  registre,       // [{ id, emoji, label, value: ReactNode }] — cartes de contexte (optionnel)
  skills,         // { key: { label, module } }
  epreuves,       // [{ id, skill, title?, prompt, extra?, options, correct, cols?, renderOption?, optionLabel?, explain, assessment }]
  badges,         // [{ id, emoji, label, test: (misses) => bool }]
  synthese,       // ReactNode — synthèse visuelle propre à la leçon
  completion,     // { masterTitle, title, message, verbs: [..4], masterBadgeLabel }
  xpPerCorrect = 20,
}) {
  const { t } = useTranslation('lesson');
  const { xp, awardXP } = useProgress(ctx.lessonId);
  // QUI lit ce test : l'enseignant le PRÉPARE (toutes les phases ouvertes).
  const viewer = useLearningViewer();
  const { submitEvidence } = useEvidenceSubmission(ctx.lessonId);
  const { attempt: savedAttempt, save: saveAttempt, redo: redoAttempt } = useFinalTestAttempt(ctx.lessonId);
  const timer = useCountdownTimer(timerSeconds, {
    onExpire: () => submitBoss(),
  });

  const [phase, setPhase] = useState('boss');
  const [bossAnswers, setBossAnswers] = useState({});
  const [bossSubmitted, setBossSubmitted] = useState(false);
  const [misses, setMisses] = useState({});
  // Incrémenté à chaque envoi : le bloc « حالتك على الكفاءات » relit le
  // profil serveur après un court délai (les preuves partent en arrière-plan).
  const [evidenceBatch, setEvidenceBatch] = useState(0);
  // CE QUI EST RÉVÉLÉ, épreuve par épreuve — UNIQUEMENT en « وضع القسم ».
  //
  // Sur la page de l'élève, le test final reste ce qu'il est : silencieux
  // jusqu'à l'envoi unique. Révéler une épreuve à la fois est un geste
  // d'ENSEIGNANT au tableau, et l'entrée en présentation est déjà réservée
  // aux présentateurs. C'est aussi une garantie de barème : un élève ne peut
  // pas se faire corriger une épreuve notée avant de répondre aux suivantes.
  //
  // Une révélation N'ÉCRIT RIEN : ni evidence, ni XP, ni tentative. Le test
  // n'est noté, soumis et persisté qu'une seule fois, par submitBoss() — le
  // même chemin qu'avant, appelé par « كشف النتائج ». Sans cela, chaque
  // `submitEvidence` tirant un nouvel `attemptId`, valider une épreuve deux
  // fois en dupliquerait l'evidence de maîtrise.
  const [revealed, setRevealed] = useState({});
  const { presenting } = useTestPresentation();
  // LE LECTEUR DE MISSION (pilote, propriétaire 2026-11-08 : « comme أستعدّ ») — décidé ICI comme PrerequisiteDiagnostic : ce
  // composant rend ModuleLayout, qui rend le lecteur plus bas. Dans le lecteur : un message de 5 s au lieu des onglets et de la
  // carte d'introduction, puis UNE épreuve par écran (doute, se raviser 1 s, signal ✓ / ↻ — jamais la bonne réponse), le
  // lecteur avance seul, le résultat vient seul après la dernière réponse. La notation, l'evidence et la tentative sont
  // EXACTEMENT celles de la page : un seul envoi, submitBoss().
  const classroomMode = useClassroomMode();
  const inPlayer = useInMissionPlayer()
    || (Boolean(getLoadedLessonConfig(ctx.lessonId)?.mission) && isMissionView(ctx.studentView, viewer, classroomMode));
  const [notice, setNotice] = useState(true);
  const [unsure, setUnsure] = useState({});

  // Une tentative sauvegardée (cet appareil, ou un autre une fois synchro)
  // gagne dès son chargement : correction affichée, jamais un quiz vierge.
  // Le ref évite de re-déclencher après un « Refaire » volontaire.
  const hydratedFromSaved = useRef(false);

  // Garde anti double-soumission (clic + expiration du timer). Un ref, pas
  // un updater setState : un updater doit rester pur, et StrictMode
  // l'exécute deux fois en dev — les effets (evidence, XP, sauvegarde)
  // partiraient en double.
  const submittedRef = useRef(false);

  useEffect(() => {
    if (hydratedFromSaved.current || !savedAttempt || bossSubmitted) return;
    hydratedFromSaved.current = true;
    submittedRef.current = true;

    const restoredAnswers = {};
    const restoredMisses = {};
    savedAttempt.answers.forEach((a) => {
      restoredAnswers[a.questionCode] = a.picked;
      if (!a.isCorrect) {
        const ep = epreuves.find((e) => e.id === a.questionCode);
        if (ep) restoredMisses[ep.skill] = (restoredMisses[ep.skill] || 0) + 1;
      }
    });
    setBossAnswers(restoredAnswers);
    setMisses(restoredMisses);
    setBossSubmitted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAttempt]);

  const bossDone = bossSubmitted;
  const allAnswered = epreuves.every((ep) => bossAnswers[ep.id] != null);

  function submitBoss() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    // le test ne corrige rien avant l'envoi : un son NEUTRE à chaque réponse, le carillon d'étape à l'envoi
    playSfx('step');

    const nextMisses = {};
    const attemptAnswers = [];
    epreuves.forEach((ep) => {
      // `isCorrect` n'est calculé ici QUE pour la revue de cette page, l'XP et
      // la tentative sauvegardée. La preuve envoyée au serveur ne le porte
      // plus (Mastery V2) : elle dit ce que l'élève a choisi — `picked: null`
      // pour une épreuve laissée sans réponse —, le serveur juge.
      const isCorrect = bossAnswers[ep.id] === correctIndexOf(ep);
      submitEvidence(ep, { picked: bossAnswers[ep.id] ?? null });
      attemptAnswers.push({
        questionCode: ep.id,
        picked: bossAnswers[ep.id] ?? null,
        isCorrect,
        correctAnswer: correctIndexOf(ep),
      });
      if (isCorrect) {
        awardXP({ moduleId: String(moduleNumber), exerciseId: ep.id, amount: xpPerCorrect });
      } else {
        nextMisses[ep.skill] = (nextMisses[ep.skill] || 0) + 1;
      }
    });
    setMisses(nextMisses);
    timer.stop();

    const score = attemptAnswers.filter((a) => a.isCorrect).length;
    saveAttempt({ score, totalQuestions: epreuves.length, answers: attemptAnswers });

    setBossSubmitted(true);
    setEvidenceBatch((n) => n + 1);
  }

  // Lecteur : la DERNIÈRE réponse donnée, le résultat vient seul (le délai laisse voir le signal de cette réponse).
  useEffect(() => {
    if (!inPlayer || bossSubmitted || !allAnswered) return undefined;
    const id = setTimeout(submitBoss, SIGNAL_MS + 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inPlayer, bossSubmitted, allAnswered, bossAnswers]);

  function redoBoss() {
    setNotice(true);
    setUnsure({});
    redoAttempt();
    hydratedFromSaved.current = true;
    submittedRef.current = false;
    setPhase('boss');
    setBossAnswers({});
    setBossSubmitted(false);
    setMisses({});
    setRevealed({});
    timer.setEnabled(false);
  }

  const backToTest = useCallback(() => setPhase('boss'), []);
  const isEpreuveCorrect = useCallback((ep, pick) => pick === correctIndexOf(ep), []);

  const badgesGagnes = badges.filter((b) => b.test(misses));
  // 🏆 et « أتقنت … » exigent un essai SANS FAUTE, pas seulement les badges :
  // une leçon ne déclare souvent qu'un badge sur une seule compétence, et
  // quatre défis sur neuf affichaient « أتقنت » avec deux réponses fausses sur
  // quatre (audit du 2026-09-29). Toute réponse fausse est comptée dans
  // `misses`, sous sa compétence — ou sous `undefined` si elle n'en a pas.
  const perfectAttempt = Object.values(misses).every((n) => !n);
  const masterBadge = bossDone && perfectAttempt && badgesGagnes.length === badges.length;

  // Les phases مراجعة / النتائج s'ouvrent à l'élève une fois le test soumis :
  // on ne lit pas la correction avant d'avoir répondu. En NAVIGATION LIBRE
  // (enseignant, administration — learningViewer) elles sont ouvertes dès
  // l'arrivée : préparer un test, c'est en lire la correction sans le passer.
  const phaseUnlocked = (key) => key === 'boss' || bossDone || viewer.freeNavigation;

  return (
    <ModuleLayout
      {...ctx}
      moduleTitle={moduleTitle}
      moduleSubtitle={moduleSubtitle}
      moduleNumber={moduleNumber}
      stage="evaluation"
      estimatedTime={estimatedTime}
      xp={xp}
      prevLink={navLinks.prevLink}
      nextLink={navLinks.nextLink}
      isCompleted={bossDone}
      // La présentation cadre CHAQUE épreuve elle-même.
      presentationFrame={!presenting}
    >
      {presenting ? (
        <TestPresentation
          title={moduleTitle}
          overview={{
            number: moduleNumber,
            title: moduleTitle,
            subtitle: moduleSubtitle,
            points: [...Object.values(skills).map((sk) => `${sk.emoji ? `${sk.emoji} ` : ''}${sk.label}`), t('classroom.overview.questions', { count: epreuves.length })],
          }}
          questions={epreuves}
          answers={bossAnswers}
          // Le test soumis (ici ou sur un autre appareil) est entièrement
          // révélé : on projette la correction, pas un questionnaire vierge.
          revealed={bossSubmitted ? true : revealed}
          isCorrect={isEpreuveCorrect}
          onRevealOne={(id) => setRevealed((r) => revealOne(r, id))}
          // « كشف النتائج » EST le submit du moteur : mêmes notes, même
          // evidence, même tentative persistée, une seule fois.
          onRevealAll={() => { setRevealed(revealAll(epreuves)); submitBoss(); }}
          renderQuestion={({ question: ep, revealed: isRevealed }) => (
            <div className="space-y-4">
              <p className="text-base leading-relaxed text-slate-700">{ep.prompt}</p>
              {ep.extra && <div className="rounded-xl border border-slate-200 bg-white p-3">{ep.extra}</div>}
              <ChoiceGrid
                options={ep.options}
                order={displayOrderOf(ep)}
                selected={bossAnswers[ep.id] ?? null}
                onSelect={(idx) => setBossAnswers((a) => ({ ...a, [ep.id]: idx }))}
                revealed={isRevealed}
                correctIndex={correctIndexOf(ep)}
                cols={ep.cols || 2}
                renderOption={ep.renderOption}
              />
            </div>
          )}
          renderReview={({ question: ep, correct }) => (
            <EpreuveReview ep={ep} pick={bossAnswers[ep.id]} isCorrect={correct} lessonId={ctx.lessonId} />
          )}
          // Après la révélation : le profil de maîtrise, la synthèse du
          // moteur — sans remplacer la revue épreuve par épreuve.
          summary={(
            <div className="space-y-5">
              <ProfilMaitrise skills={skills} scores={misses} lessonConfig={lessonConfig} />
              {viewer.tracksProgress && <LessonLearningPointsStatus lessonId={ctx.lessonId} refreshToken={evidenceBatch} />}
              {synthese}
            </div>
          )}
        />
      ) : inPlayer && phase !== 'boss' ? (
      <div className="sa-page py-8 flex-1" data-boss-player-profile>
        {/* « السابق » ramène au résultat du test (onglet « التحدي النهائي » retiré du lecteur) */}
        <UnitBack onPrevious={backToTest} />
        <PlayerProfile skills={skills} misses={misses} score={epreuves.filter((ep) => bossAnswers[ep.id] === correctIndexOf(ep)).length}
          total={epreuves.length} lessonConfig={lessonConfig} badges={badgesGagnes} masterBadge={masterBadge} completion={completion}
          lessonId={ctx.lessonId} tracksProgress={viewer.tracksProgress} evidenceBatch={evidenceBatch} />
      </div>
      ) : inPlayer && phase === 'boss' ? (
      <div className="sa-page py-8 flex-1 space-y-8" data-boss-player>
        {!bossSubmitted && <AutoAdvance count={epreuves.filter((ep) => bossAnswers[ep.id] != null).length} delayMs={SIGNAL_MS + 200} />}
        <AnimatePresence mode="wait">
          {!bossSubmitted && (
            <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {notice && <TimedNotice ms={5000} onDone={() => setNotice(false)}>{t('boss.playIntro')}</TimedNotice>}
              {epreuves.map((ep, i) => (
                <div key={ep.id} className="space-y-3">
                  <div className="flex justify-end">
                    <TimerChip timer={timer} durationLabel={timerLabel} canEnable={i === 0 && Object.keys(bossAnswers).length === 0} />
                  </div>
                  <DiagnosticPlayQuestion q={{ ...ep, order: displayOrderOf(ep) }} index={i} total={epreuves.length} skill={skills[ep.skill]}
                    pick={bossAnswers[ep.id]} unsure={Boolean(unsure[ep.id])} isCorrect={(q, p) => p === correctIndexOf(q)}
                    onCommit={(v, doubt) => { setBossAnswers((a) => ({ ...a, [ep.id]: v })); if (doubt) setUnsure((u) => ({ ...u, [ep.id]: true })); }} />
                </div>
              ))}
            </motion.div>
          )}
          {bossSubmitted && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BossReviewCompact epreuves={epreuves} answers={bossAnswers} unsure={unsure} skills={skills} misses={misses}
                lessonId={ctx.lessonId} onContinue={() => setPhase('profil')} onRedo={redoBoss} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      ) : (
      <div className="sa-page py-8 flex-1 space-y-8">
        <div className="grid grid-cols-3 gap-2">
          {PHASES.map(({ key, labelKey, Icon }) => {
            const unlocked = phaseUnlocked(key);
            return (
              <button
                key={key}
                type="button"
                disabled={!unlocked}
                onClick={() => setPhase(key)}
                className={`px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition-all min-h-[48px] flex items-center justify-center gap-1.5 ${
                  phase === key
                    ? 'bg-slate-900 text-white'
                    : unlocked
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {t(labelKey)}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {phase === 'boss' && !bossSubmitted && (
            <motion.div key="boss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {brief && (
                <MissionBrief tag={brief.tag} title={brief.title} tone={brief.tone ?? 'amber'}>
                  {brief.body}
                </MissionBrief>
              )}

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <TimerToggle
                  enabled={timer.enabled}
                  onChange={(next) => {
                    timer.setEnabled(next);
                    if (next) timer.start();
                  }}
                  durationLabel={timerLabel}
                  disabled={Object.keys(bossAnswers).length > 0}
                />
                {timer.enabled && <TimerDisplay label={timer.label} urgent={timer.remaining <= 60} />}
              </div>

              {registre && (
                <div className="grid gap-2 grid-cols-4">
                  {registre.map((r) => (
                    <div key={r.id} className="rounded-xl border-2 border-slate-200 bg-white p-2.5 text-center">
                      <div className="text-lg" aria-hidden="true">{r.emoji}</div>
                      <div className="text-[9px] font-mono text-slate-500 uppercase leading-tight">{r.label}</div>
                      <div className="font-mono font-extrabold text-sm text-slate-800 tabular-nums">{r.value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {epreuves.map((e, i) => (
                  <span
                    key={e.id}
                    className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                      bossAnswers[e.id] != null ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {bossAnswers[e.id] != null ? '✓' : i + 1}
                  </span>
                ))}
              </div>

              {epreuves.map((ep, i) => (
                <Epreuve
                  key={ep.id}
                  epreuve={ep}
                  index={i}
                  total={epreuves.length}
                  pick={bossAnswers[ep.id] ?? null}
                  onPick={(idx) => { playSfx('pop'); setBossAnswers((a) => ({ ...a, [ep.id]: idx })); }}
                />
              ))}

              <ValidateButton onClick={submitBoss} disabled={!allAnswered} tone="amber">
                {t('boss.submitAnswers', { count: epreuves.length })}
              </ValidateButton>
            </motion.div>
          )}

          {phase === 'boss' && bossSubmitted && (
            <motion.div key="boss-review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BossReview epreuves={epreuves} answers={bossAnswers} onContinue={() => setPhase('profil')} onRedo={redoBoss} lessonId={ctx.lessonId} />
            </motion.div>
          )}

          {phase === 'profil' && (
            <motion.div key="profil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-space font-extrabold text-slate-900">{t('boss.yourMasteryProfile')}</h2>
                <p className="text-sm text-slate-500">
                  {t('boss.profileSubtitle')}
                </p>
              </div>

              <ProfilMaitrise skills={skills} scores={misses} lessonConfig={lessonConfig} />

              {/* La MAÎTRISE, à part et nommée comme telle : l'état serveur des
                  الكفاءات de la leçon, jamais confondu avec le score de
                  cet essai. Un enseignant qui prépare le test n'a pas de
                  profil à lire ici. */}
              {viewer.tracksProgress && (
                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-5">
                  <LessonLearningPointsStatus lessonId={ctx.lessonId} refreshToken={evidenceBatch} />
                </div>
              )}

              {badgesGagnes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-space font-bold text-slate-800 text-sm">{t('boss.badgesUnlocked')}</h3>
                  <div className="grid gap-2 grid-cols-2">
                    {badgesGagnes.map((b) => (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3"
                      >
                        <span className="text-xl" aria-hidden="true">{b.emoji}</span>
                        <span className="text-sm font-bold text-amber-900">{b.label}</span>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    {t('boss.badgesNote')}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setPhase('synthese')}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl min-h-[48px]"
              >
                {t('boss.goToSynthesis')}
              </button>
            </motion.div>
          )}

          {phase === 'synthese' && (
            <motion.div key="synthese" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              {synthese}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl p-8 text-center space-y-3"
              >
                <div className="text-5xl" aria-hidden="true">{masterBadge ? '🏆' : '🎓'}</div>
                <div className="text-2xl font-space font-extrabold">
                  {masterBadge ? completion.masterTitle : completion.title}
                </div>
                <p className="text-indigo-100 text-sm leading-relaxed max-w-lg mx-auto">{completion.message}</p>
                <div className="grid gap-2 pt-2 grid-cols-4">
                  {completion.verbs.map((v) => (
                    <div key={v} className="bg-white/15 rounded-xl py-2 text-sm font-bold">
                      ✓ {v}
                    </div>
                  ))}
                </div>
                {masterBadge && (
                  <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-bold text-sm px-4 py-2 rounded-full mt-2">
                    🏆 {completion.masterBadgeLabel}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div >
      )}
    </ModuleLayout >
  );
}
