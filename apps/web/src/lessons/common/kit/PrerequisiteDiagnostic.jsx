import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, CheckCircle2, XCircle } from 'lucide-react';
import ModuleLayout from '../components/ModuleLayout';
import { useProgress } from '../hooks/useProgress';
import { usePrerequisiteDiagnostic } from '../hooks/usePrerequisiteDiagnostic';
import { Feedback, ChoiceGrid, ValidateButton, MissionBrief } from '../components/LessonUI';
import TestPresentation, { useTestPresentation } from './TestPresentation';
import { revealAll, revealOne } from './testPresentation';
import { diagnosticAdviceLevel } from './diagnosticLevel';
import ReviewLinks from './ReviewLinks';
import { MoreToggle } from '../components/StudentFocus';
import { useInMissionPlayer, useAutoAdvance } from '../mission/missionPlayerContext';
import TimedNotice from '../mission/TimedNotice';
import MissionDialog from '../mission/MissionDialog';
import ReviseFirst from '../mission/ReviseFirst';
import DiagnosticPlayQuestion, { SIGNAL_MS } from './DiagnosticPlayQuestion';
import { playSfx } from '../utils/playEffect';
import { isMissionView } from '../mission/missionModel';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { useClassroomMode } from '../classroom/ClassroomContext';
import { getLoadedLessonConfig } from '../../registry';

/**
 * Lesson kit — moteur du module 0 « Mission de départ » (diagnostic des
 * prérequis).
 *
 * Règles appliquées par construction (LESSON_INTEGRATION_GUIDE.md §8) :
 * jamais bloquant (nextLink inconditionnel), aucune evidence serveur
 * (questions sans `assessment`), silencieux jusqu'au submit unique, score
 * par paliers (<5 / 5-7 / >7 sur 10) avec conseil, persistance locale via
 * usePrerequisiteDiagnostic (réhydratation complète, y compris les
 * réponses).
 *
 * Types de question :
 *  - 'mcq' (défaut) : { id, skill, points, prompt, options, correct, cols?, explain }
 *  - 'custom'       : { id, skill, points, prompt, explainOk, explainKo,
 *                       render({ pick, onPick, revealed }), isCorrect(pick),
 *                       review({ pick }) }  — ex. clic sur un chiffre d'un tableau.
 *
 * MODE CLASSE (وضع القسم). Présenté, le diagnostic devient une QUESTION À LA
 * FOIS (TestPresentation) : السابق / التالي, « تحقّق من الإجابة » sur la
 * question courante, « كشف النتائج » à la fin, puis la revue une à une. Les
 * questions, les paliers, les conseils et le caractère non bloquant sont
 * inchangés ; « كشف النتائج » appelle le même handleSubmit() que la page.
 * Voir docs/architecture/CLASSROOM_MODE.md §5 « Test ».
 */

// Le REPLI, quand une leçon ne fournit pas ses propres `levels`. En clés de
// traduction : l'interface élève est arabe, et un repli français réintroduirait
// du français sur l'écran d'une leçon qui n'aurait rien fait de mal. Une leçon
// qui veut son propre ton passe `levels` (voir la leçon PGCD).
const DEFAULT_LEVELS = {
  fragile: {
    emoji: '🌱',
    titleKey: 'diagnostic.basesFragile',
    bodyKey: 'diagnostic.basesFragileAdvice',
    adviceKey: 'diagnostic.basesFragileAdvice',
    ctaKey: 'diagnostic.startAnyway',
    tone: 'from-emerald-500 to-teal-500',
  },
  progres: {
    emoji: '👍',
    titleKey: 'diagnostic.basesOnTrack',
    bodyKey: 'diagnostic.basesOnTrackAdvice',
    adviceKey: 'diagnostic.basesOnTrackAdvice',
    ctaKey: 'diagnostic.startModule1',
    tone: 'from-teal-500 to-cyan-500',
  },
  pret: {
    emoji: '⭐',
    titleKey: 'diagnostic.youAreReady',
    bodyKey: 'diagnostic.basesSolid',
    adviceKey: 'diagnostic.basesSolidAdvice',
    ctaKey: 'diagnostic.imReady',
    tone: 'from-cyan-500 to-blue-500',
  },
};

const isCorrectFor = (q, pick) =>
  pick == null ? false : q.type === 'custom' ? q.isCorrect(pick) : pick === q.correct;

/**
 * LE CORPS D'UNE QUESTION — écrit UNE fois, rendu par la page comme par la
 * présentation de classe. Les deux surfaces posent la même question : si
 * elles la dessinaient chacune de leur côté, elles divergeraient au premier
 * type de question ajouté.
 *
 * `revealed` n'est vrai qu'après une révélation (« تحقّق » sur cette
 * question, ou « كشف النتائج ») : une question répondue reste muette.
 */
function DiagnosticQuestionBody({ q, pick, onPick, revealed }) {
  if (q.type === 'custom') return q.render({ pick: pick ?? null, onPick, revealed });
  return (
    <ChoiceGrid
      options={q.options}
      selected={pick ?? null}
      onSelect={onPick}
      revealed={revealed}
      correctIndex={q.correct}
      cols={q.cols || 2}
    />
  );
}

/** La correction d'une question — elle aussi écrite une seule fois. */
function DiagnosticQuestionReview({ q, pick, ok }) {
  const { t } = useTranslation('lesson');
  return (
    <div className="space-y-3">
      {q.type === 'custom' ? (
        q.review({ pick })
      ) : (
        <div className="text-sm space-y-1">
          <div className={ok ? 'text-emerald-700' : 'text-rose-700'}>
            <strong>{t('question.yourAnswer')}</strong> {pick == null ? '—' : q.options[pick]}
          </div>
          {!ok && (
            <div className="text-emerald-700">
              <strong>{t('question.correctAnswer')}</strong> {q.options[q.correct]}
            </div>
          )}
        </div>
      )}
      <Feedback tone={ok ? 'ok' : 'ko'}>
        {q.type === 'custom' ? (ok ? q.explainOk : q.explainKo) : q.explain}
      </Feedback>
    </div>
  );
}

function DiagnosticResult({ lessonId, score, maxScore, skills, skillScores, levels, onContinue, onRedo }) {
  const { t } = useTranslation('lesson');
  // Un palier fournit SOIT un texte déjà écrit (une leçon qui passe ses
  // propres `levels`), SOIT une clé de traduction (le repli DEFAULT_LEVELS).
  // Les deux sont acceptés : c'est ce qui permet au repli d'être traduit sans
  // imposer i18n aux leçons qui écrivent leur ton elles-mêmes.
  const text = (meta, field) => meta[field] ?? (meta[`${field}Key`] ? t(meta[`${field}Key`]) : '');
  const level = diagnosticAdviceLevel(score, maxScore);
  const isPerfect = score === maxScore;
  const meta = levels[level];

  const skillEntries = Object.entries(skillScores);
  const ratios = skillEntries.map(([key, s]) => [key, s.score / s.max]);
  const [weakestKey, weakestRatio] = ratios.reduce((min, cur) => (cur[1] < min[1] ? cur : min));
  const isTied = ratios.every(([, r]) => r === weakestRatio);
  const weakestIsMeaningful = !isTied && weakestRatio < 1 && level !== 'pret';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-br ${meta.tone} text-white rounded-3xl p-8 text-center space-y-3 relative overflow-hidden`}
      >
        <div className="text-5xl" aria-hidden="true">{meta.emoji}</div>
        <div dir="ltr" className="text-3xl font-space font-extrabold">{score}{'\u00A0/\u00A0'}{maxScore}</div>
        <div className="text-lg font-space font-bold">{text(meta, 'title')}</div>
        {isPerfect && (
          <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-bold text-sm px-4 py-2 rounded-full mt-1">
            {t('diagnostic.prerequisitesMastered')}
          </div>
        )}
      </motion.div>

      {skillEntries.length > 1 && (
        <div className="grid gap-3 grid-cols-2">
          {skillEntries.map(([key, s]) => {
            const skillPct = Math.round((s.score / s.max) * 100);
            const good = s.score === s.max;
            return (
              <div key={key} className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-space font-bold text-slate-800 text-sm">
                    {skills[key].emoji} {skills[key].label}
                  </span>
                  <span dir="ltr" className="font-mono text-xs font-bold text-slate-500">{s.score}{'\u00A0/\u00A0'}{s.max}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${good ? 'bg-emerald-500' : 'bg-amber-400'}`}
                    style={{ width: `${skillPct}%` }}
                  />
                </div>
                <div className={`text-xs font-medium ${good ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {good ? t('diagnostic.skillGood') : t('diagnostic.skillToReinforce')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Feedback tone="info">
        <strong>{t('diagnostic.yourAdvice')}</strong>
        <p className="mt-1">
          {text(meta, 'body')}{' '}
          {weakestIsMeaningful && (
            <>{t('diagnostic.payAttentionTo')} <strong>{skills[weakestKey].label}</strong>.</>
          )}
        </p>
        {/* Regard « focus » : le verdict d'abord ; le conseil à un geste. */}
        <MoreToggle><p className="mt-2">💡 {text(meta, 'advice')}</p></MoreToggle>
      </Feedback>

      {/* Les الكفاءات des leçons antérieures sur lesquelles celle-ci s'appuie
          (réseau des الكفاءات, LEARNING_NET.md) — des liens, jamais un verrou. */}
      <ReviewLinks lessonId={lessonId} />

      <div className="flex gap-3 flex-row">
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl min-h-[48px] text-base"
        >
          🚀 {text(meta, 'cta')}
        </button>
        <button
          type="button"
          onClick={onRedo}
          className="py-3 px-5 bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-500 font-bold rounded-xl min-h-[48px]"
        >
          {t('diagnostic.redoDiagnostic')}
        </button>
      </div>
    </div>
  );
}

/**
 * LA REVUE EN UN ÉCRAN (lecteur, propriétaire 2026-11-07 : « plus simple que السابق / واصل ») — au lieu de 10 écrans : le score,
 * UN cercle par question (✓ vert / ✗ rouge) — un clic ouvre SA correction dans une fenêtre, ‹ › y passent d'une correction à
 * l'autre —, les كفاءات en deux lignes, le conseil, les leçons à réviser (même carte que la première vue, retour en un clic) et
 * « واصل ». `data-paging-keep` : le découpage du lecteur ne l'ouvre pas en écrans séparés.
 */
function DiagnosticReviewCompact({ lessonId, lessonTitle, basePath, questions, answers, unsure = {}, skills, skillScores, score, maxScore, levels, onContinue, onRedo }) {
  const { t } = useTranslation('lesson');
  const [open, setOpen] = useState(null); // index de la question ouverte
  const text = (meta, field) => meta[field] ?? (meta[`${field}Key`] ? t(meta[`${field}Key`]) : '');
  const meta = levels[diagnosticAdviceLevel(score, maxScore)];
  const oks = questions.map((q) => isCorrectFor(q, answers[q.id]));
  // juste mais « غير متأكّد » : ✓؟ — la كفاءة n'est pas solide
  const doubts = questions.map((q, i) => oks[i] && Boolean(unsure[q.id]));
  // LA كفاءة la plus fragile (une réponse incertaine compte pour une demi-erreur) : SA leçon est la carte « راجع » prioritaire
  const weakness = Object.entries(skillScores).map(([key, sc]) => [key, (sc.score - 0.5 * (sc.unsure ?? 0)) / sc.max]);
  const weakest = weakness.reduce((min, cur) => (cur[1] < min[1] ? cur : min), [null, 1]);
  const priority = weakest[0] && weakest[1] < 1 ? skills[weakest[0]]?.lesson : null;
  const q = open == null ? null : questions[open];
  return (
    // deux colonnes : le résultat | la suite — tout tient à la taille commune de la leçon
    <div className="grid items-start gap-6 lg:grid-cols-2" data-paging-keep data-diagnostic-review>
      <div className="space-y-5">
      <div className={`flex items-center gap-5 rounded-3xl bg-gradient-to-br ${meta.tone} px-6 py-4 text-white`}>
        <span className="text-4xl" aria-hidden="true">{meta.emoji}</span>
        <span dir="ltr" className="font-space text-3xl font-extrabold">{score}{'\u00A0/\u00A0'}{maxScore}</span>
        <span className="text-lg font-bold">{text(meta, 'title')}</span>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-black text-slate-700">{t('diagnostic.yourAnswers')}</p>
        <ol className="flex flex-wrap gap-3" data-review-circles>
          {questions.map((qq, i) => (
            <li key={qq.id}>
              <button type="button" onClick={() => setOpen(i)} data-review-circle={i + 1} data-review-ok={oks[i] ? 'true' : 'false'} data-review-unsure={doubts[i] ? 'true' : undefined}
                aria-label={`${t('question.label')} ${i + 1} — ${oks[i] ? t('diagnostic.reviewRight') : t('diagnostic.reviewWrong')}`}
                className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 font-black transition-transform hover:scale-105 ${doubts[i] ? 'border-amber-400 bg-amber-50 text-amber-700' : oks[i] ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-700'}`}>
                <span dir="ltr" className="text-base leading-none">{i + 1}</span>
                <span className="text-sm leading-none" aria-hidden="true">{doubts[i] ? '✓؟' : oks[i] ? '✓' : '✗'}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="text-xs text-slate-500">{t('diagnostic.reviewHintTap')}</p>
      </div>

      {Object.keys(skillScores).length > 1 && (
        <ul className="flex flex-wrap gap-2">
          {Object.entries(skillScores).map(([key, sc]) => (
            <li key={key} className={`rounded-full px-3 py-1 text-sm font-bold ${sc.score === sc.max && !sc.unsure ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {skills[key].emoji} {skills[key].label} · <span dir="ltr">{sc.score}{'\u00A0/\u00A0'}{sc.max}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900">💡 <strong>{t('diagnostic.yourAdvice')}:</strong> {text(meta, 'body')} {text(meta, 'advice')}</p>
      </div>

      <div className="space-y-5">
      <ReviseFirst lessonId={lessonId} title={lessonTitle} basePath={basePath} columns={1} priority={priority} />

      <div className="flex gap-3">
        <button type="button" onClick={onContinue} className="min-h-[52px] flex-1 rounded-2xl bg-teal-600 px-6 text-lg font-black text-white hover:bg-teal-700">🚀 {text(meta, 'cta')}</button>
        <button type="button" onClick={onRedo} className="min-h-[52px] rounded-2xl border-2 border-slate-300 bg-white px-5 font-bold text-slate-700 hover:border-slate-500">{t('diagnostic.redoDiagnostic')}</button>
      </div>
      </div>

      {q && (
        <MissionDialog label={`${t('question.label')} ${open + 1}`} onClose={() => setOpen(null)}>
          <div className="space-y-4 pt-6 text-start" data-review-dialog={open + 1}>
            <p className={`flex items-center gap-2 text-lg font-black ${oks[open] ? 'text-emerald-700' : 'text-rose-700'}`}>
              {oks[open] ? '✓' : '✗'} {skills[q.skill]?.emoji} {t('question.label')} <span dir="ltr">{open + 1}{'\u00A0/\u00A0'}{questions.length}</span>
            </p>
            <div className="text-lg leading-relaxed text-slate-800">{q.prompt}</div>
            <DiagnosticQuestionReview q={q} pick={answers[q.id]} ok={oks[open]} />
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <button type="button" disabled={open === 0} onClick={() => setOpen(open - 1)} data-review-prev
                className="min-h-[44px] rounded-xl px-4 font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-30">→ {t('diagnostic.reviewPrev')}</button>
              <button type="button" disabled={open === questions.length - 1} onClick={() => setOpen(open + 1)} data-review-next
                className="min-h-[44px] rounded-xl px-4 font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-30">{t('diagnostic.reviewNext')} ←</button>
            </div>
          </div>
        </MissionDialog>
      )}
    </div>
  );
}

/** Lu SOUS le lecteur (ce composant le rend plus bas) : avance quand une réponse de plus est donnée. */
function AutoAdvance({ count, delayMs }) {
  useAutoAdvance(count, delayMs);
  return null;
}

export default function PrerequisiteDiagnostic({
  ctx,
  navLinks,
  moduleTitle,
  moduleSubtitle,
  estimatedTime,
  brief,         // { tag?, title?, tone?, body }
  skills,        // { key: { label, emoji } }
  questions,     // voir doc du fichier
  levels = DEFAULT_LEVELS,
  xpAmount = 20,
}) {
  const { t } = useTranslation('lesson');
  const navigate = useNavigate();
  const { xp, awardXP } = useProgress(ctx.lessonId);
  const { result: savedResult, save: saveResult, redo: redoResult } = usePrerequisiteDiagnostic(ctx.lessonId);

  const [answers, setAnswers] = useState({});
  // Lecteur : « 🤔 غير متأكّد » coché avant de répondre — une réponse juste mais incertaine marque aussi la كفاءة comme fragile
  const [unsure, setUnsure] = useState({});
  // « Dans le lecteur ? » se décide ICI, comme ContentModule : ce composant rend ModuleLayout, qui rend le lecteur PLUS BAS —
  // le contexte du lecteur n'existe pas encore à ce niveau (useInMissionPlayer y valait toujours false).
  const viewer = useLearningViewer();
  const classroomMode = useClassroomMode();
  const inPlayer = useInMissionPlayer()
    || (Boolean(getLoadedLessonConfig(ctx.lessonId)?.mission) && isMissionView(ctx.studentView, viewer, classroomMode));
  // Lecteur : à l'entrée, un message de 5 s (TimedNotice) au lieu de la carte d'introduction — puis la question 1, directement
  // (propriétaire, 2026-11-07).
  const [notice, setNotice] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  // CE QUI EST RÉVÉLÉ, question par question. Uniquement en présentation :
  // sur la page, le diagnostic garde son unique « عرض نتيجتي », et `submitted`
  // vaut alors révélation de tout.
  const [revealed, setRevealed] = useState({});
  const { presenting } = useTestPresentation();

  const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

  const hydratedFromSaved = useRef(false);
  useEffect(() => {
    if (hydratedFromSaved.current || !savedResult || submitted) return;
    hydratedFromSaved.current = true;
    setAnswers(savedResult.answers || {});
    setUnsure(savedResult.unsure || {});
    setSubmitted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedResult]);

  const allAnswered = questions.every((q) => answers[q.id] != null);
  const score = questions.reduce((sum, q) => sum + (isCorrectFor(q, answers[q.id]) ? q.points : 0), 0);
  const skillScores = Object.keys(skills).reduce((acc, key) => {
    const qs = questions.filter((q) => q.skill === key);
    acc[key] = {
      score: qs.reduce((s, q) => s + (isCorrectFor(q, answers[q.id]) ? q.points : 0), 0),
      max: qs.reduce((s, q) => s + q.points, 0),
      // réponses JUSTES mais « غير متأكّد » : la كفاءة n'est pas solide pour autant
      unsure: qs.filter((q) => unsure[q.id] && isCorrectFor(q, answers[q.id])).length,
    };
    return acc;
  }, {});

  function handleSubmit() {
    if (submitted) return;
    setSubmitted(true);
    playSfx('step');
    const adviceLevel = diagnosticAdviceLevel(score, maxScore);
    saveResult({ score, maxScore, skills: skillScores, adviceLevel, answers, unsure });
    awardXP({ moduleId: 'L00', exerciseId: 'diagnostic', amount: xpAmount });
  }

  // Lecteur : la DERNIÈRE réponse donnée, le résultat s'affiche seul (le délai laisse voir le choix fait).
  useEffect(() => {
    if (!inPlayer || submitted || !allAnswered) return undefined;
    // le signal de la dernière réponse se voit d'abord, puis le résultat
    const timer = setTimeout(handleSubmit, SIGNAL_MS + 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inPlayer, submitted, allAnswered, answers]);

  function handleRedo() {
    redoResult();
    hydratedFromSaved.current = true;
    setAnswers({});
    setUnsure({});
    setSubmitted(false);
    setRevealed({});
  }

  // Son à la réponse (propriétaire, 2026-11-07) : NEUTRE — le diagnostic ne corrige rien avant le résultat, un « juste / faux »
  // sonore le trahirait. Muet tant que « الصوت » est coupé (playSfx lit la préférence au moment de jouer).
  const pickAnswer = (id, v) => { playSfx('pop'); setAnswers((a) => ({ ...a, [id]: v })); };

  return (
    <ModuleLayout
      {...ctx}
      moduleTitle={moduleTitle}
      moduleSubtitle={moduleSubtitle}
      moduleNumber={0}
      estimatedTime={estimatedTime}
      xp={xp}
      prevLink={navLinks.prevLink}
      nextLink={navLinks.nextLink}
      isCompleted={submitted}
      stage="prerequisite_check"
      // La présentation cadre CHAQUE question elle-même ; le layout ne pose
      // pas un second cadre par-dessus (même contrat que ContentModule).
      presentationFrame={!presenting}
    >
      {presenting ? (
        <TestPresentation
          title={moduleTitle}
          overview={{
            number: 0,
            title: moduleTitle,
            subtitle: moduleSubtitle,
            points: [...Object.values(skills).map((sk) => `${sk.emoji ? `${sk.emoji} ` : ''}${sk.label}`), t('classroom.overview.questions', { count: questions.length })],
          }}
          questions={questions}
          answers={answers}
          // Une fois le diagnostic soumis, TOUT est révélé : la correction
          // rechargée d'un appareil à l'autre s'affiche comme la nôtre.
          revealed={submitted ? true : revealed}
          isCorrect={isCorrectFor}
          onRevealOne={(id) => setRevealed((r) => revealOne(r, id))}
          onRevealAll={() => { setRevealed(revealAll(questions)); handleSubmit(); }}
          renderQuestion={({ question, revealed: isRevealed }) => (
            <div className="space-y-4">
              {/* L'ÉNONCÉ d'abord — c'est la question qu'on projette. */}
              <div className="text-base leading-relaxed text-slate-700">{question.prompt}</div>
              <DiagnosticQuestionBody
                q={question}
                pick={answers[question.id]}
                onPick={(v) => pickAnswer(question.id, v)}
                revealed={isRevealed}
              />
            </div>
          )}
          renderReview={({ question, correct }) => (
            <DiagnosticQuestionReview q={question} pick={answers[question.id]} ok={correct} />
          )}
          summary={(
            <DiagnosticResult
              lessonId={ctx.lessonId}
              score={score}
              maxScore={maxScore}
              skills={skills}
              skillScores={skillScores}
              levels={levels}
              onContinue={() => navigate(navLinks.nextLink)}
              onRedo={handleRedo}
            />
          )}
        />
      ) : (
      <div className="sa-page py-8 flex-1 space-y-8">
        {/* Lecteur : une réponse donnée → la question suivante vient seule (propriétaire, 2026-11-07) */}
        {inPlayer && !submitted && <AutoAdvance count={questions.filter((q) => answers[q.id] != null).length} delayMs={SIGNAL_MS + 200} />}
        <AnimatePresence mode="wait">
      {!submitted && (
        <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
          {inPlayer ? (
            notice && <TimedNotice ms={5000} onDone={() => setNotice(false)}>{t('diagnostic.playIntro')}</TimedNotice>
          ) : (
          <MissionBrief
            tag={brief?.tag ?? t('diagnostic.defaultBriefTag')}
            title={brief?.title ?? t('diagnostic.defaultBriefTitle')}
            tone={brief?.tone ?? 'indigo'}
          >
            {brief?.body}
          </MissionBrief>
          )}

          {/* Lecteur de mission : pas de cartes de suivi par كفاءة pendant le test (propriétaire, 2026-11-04 : « pas besoin ») —
              le résultat les rapporte après l'envoi. */}
          {Object.keys(skills).length > 1 && !inPlayer && (
            <div className="grid gap-3 grid-cols-2">
              {Object.entries(skills).map(([key, skill]) => {
                const doneCount = questions.filter((q) => q.skill === key && answers[q.id] != null).length;
                const totalCount = questions.filter((q) => q.skill === key).length;
                return (
                  <div key={key} className="rounded-2xl border-2 border-slate-200 bg-white p-4">
                    <div className="font-space font-bold text-slate-800 text-sm">
                      {skill.emoji} {skill.label}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {Array.from({ length: totalCount }).map((_, i) => (
                        <span
                          key={i}
                          className={`w-2.5 h-2.5 rounded-full ${i < doneCount ? 'bg-teal-500' : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>
              {t('question.label')}{' '}
              <span dir="ltr">
                {Object.keys(answers).length < questions.length ? Object.keys(answers).length + 1 : questions.length}
                {' / '}
                {questions.length}
              </span>
            </span>
            <span>
              <span dir="ltr">{score}{'\u00A0/\u00A0'}{maxScore}</span> {t('diagnostic.inProgress')}
            </span>
          </div>

          {questions.map((q, i) => (inPlayer ? (
            // Lecteur : la question jouée — doute, se raviser 1 s, signal ✓ / ↻ (jamais la réponse), réponse verrouillée
            <DiagnosticPlayQuestion key={q.id} q={q} index={i} total={questions.length} skill={skills[q.skill]}
              pick={answers[q.id]} unsure={Boolean(unsure[q.id])} isCorrect={isCorrectFor}
              onCommit={(v, doubt) => { setAnswers((a) => ({ ...a, [q.id]: v })); if (doubt) setUnsure((u) => ({ ...u, [q.id]: true })); }} />
          ) : (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="border-2 border-slate-200 bg-white rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-teal-600 text-white">
                  {skills[q.skill].emoji}{' '}
                  <span dir="ltr">{i + 1}{'\u00A0/\u00A0'}{questions.length}</span>
                </span>
                {answers[q.id] != null && <CheckCircle2 className="w-4 h-4 text-teal-600" aria-hidden="true" />}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{q.prompt}</p>
              {q.type === 'custom' ? (
                q.render({
                  pick: answers[q.id] ?? null,
                  onPick: (v) => pickAnswer(q.id, v),
                  revealed: false,
                })
              ) : (
                <ChoiceGrid
                  options={q.options}
                  selected={answers[q.id] ?? null}
                  onSelect={(idx) => pickAnswer(q.id, idx)}
                  cols={q.cols || 2}
                />
              )}
            </motion.div>
          )))}

          {/* Lecteur : pas de « عرض نتيجتي » — le résultat vient seul après la dernière réponse (propriétaire, 2026-11-07) */}
          {!inPlayer && (
          <ValidateButton onClick={handleSubmit} disabled={!allAnswered} tone="teal">
            {t('diagnostic.seeMyResult')}
          </ValidateButton>
          )}
        </motion.div>
      )}

      {submitted && inPlayer && (
        <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <DiagnosticReviewCompact lessonId={ctx.lessonId} lessonTitle={ctx.courseTitle} basePath={ctx.coursePath}
            questions={questions} answers={answers} unsure={unsure} skills={skills} skillScores={skillScores} score={score} maxScore={maxScore}
            levels={levels} onContinue={() => navigate(navLinks.nextLink)} onRedo={handleRedo} />
        </motion.div>
      )}
      {submitted && !inPlayer && (
        <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800 flex items-center gap-2">
              <Compass className="w-4 h-4" aria-hidden="true" /> {t('diagnostic.yourCorrection')}
            </h2>
            {questions.map((q, i) => {
              const ok = isCorrectFor(q, answers[q.id]);
              return (
                <div
                  key={q.id}
                  className={`border-2 rounded-2xl p-5 space-y-3 ${ok ? 'border-emerald-300 bg-emerald-50/30' : 'border-rose-300 bg-rose-50/30'}`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-space font-bold text-slate-800 flex items-center gap-2 text-sm">
                      {ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                      )}
                      {skills[q.skill].emoji} {t('question.label')}{' '}
                      <span dir="ltr">{i + 1}</span>
                    </h3>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{q.prompt}</p>
                  {q.type === 'custom' ? (
                    q.review({ pick: answers[q.id] })
                  ) : (
                    <div className="text-sm space-y-1">
                      <div className={ok ? 'text-emerald-700' : 'text-rose-700'}>
                        <strong>{t('question.yourAnswer')}</strong> {q.options[answers[q.id]]}
                      </div>
                      {!ok && (
                        <div className="text-emerald-700">
                          <strong>{t('question.correctAnswer')}</strong> {q.options[q.correct]}
                        </div>
                      )}
                    </div>
                  )}
                  <Feedback tone={ok ? 'ok' : 'ko'}>
                    {q.type === 'custom' ? (ok ? q.explainOk : q.explainKo) : q.explain}
                  </Feedback>
                </div>
              );
            })}
          </div>

          <DiagnosticResult
            lessonId={ctx.lessonId}
            score={score}
            maxScore={maxScore}
            skills={skills}
            skillScores={skillScores}
            levels={levels}
            onContinue={() => navigate(navLinks.nextLink)}
            onRedo={handleRedo}
          />
        </motion.div>
      )}
    </AnimatePresence>
      </div >
      )}
    </ModuleLayout >
  );
}
