import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import { useClassroomMode, useClassroomStage, ClassroomFrame } from '../classroom';
import { Feedback, ValidateButton } from '../components/LessonUI';
import ModuleOverview from './ModuleOverview';
import {
  QUESTION_STATE, testQuestionStates, allRevealed,
  clampQuestion, resolveTestNavigation, revealedTally,
} from './testPresentation';

/**
 * LA PRÉSENTATION D'UN TEST — « وضع القسم » pour le module 0 et le test final.
 *
 * UNE seule implémentation, consommée par les DEUX moteurs (voir
 * `useTestPresentation` plus bas) : ni « TestFullscreen » ni
 * « ClassroomFullscreen », ni un écran pour le diagnostic et un autre pour le
 * test final. C'est le pendant, pour un test, de ce que ContentModule fait
 * pour les unités d'un module : une question à la fois, dans la coquille de
 * présentation qui existe déjà.
 *
 *   Coquille de présentation (classroom/)
 *     ├── manipulation      la bibliothèque, qui calcule sa mise en page
 *     ├── module            ContentModule, ses unités une à une
 *     ├── leçon             LessonClassroomShell
 *     └── TEST              ← ici : ses questions une à une
 *
 * CE QU'ELLE N'EST PAS. Elle ne corrige pas, ne note pas, n'écrit ni
 * evidence ni progression : le moteur garde son barème, sa persistance et son
 * `submit` uniques. Elle décide de ce qui est MONTRÉ, et rien d'autre. Le
 * même correcteur sert « تحقّق من الإجابة » (une question) et « كشف النتائج »
 * (toutes) — c'est `testPresentation.js` qui le garantit, et ses tests.
 *
 * ELLE N'EXISTE QU'EN PRÉSENTATION. Hors « وضع القسم », les deux moteurs
 * rendent exactement la page d'avant : le test final reste silencieux
 * jusqu'à son envoi unique, et aucun élève ne peut se révéler une réponse
 * notée question par question. Le geste par question est un geste
 * d'ENSEIGNANT, au tableau — et l'entrée en présentation est déjà réservée à
 * `canPresentClassroom` (packages/core/auth.js). Rien ici ne nomme un rôle :
 * quand la plateforme voudra un mode enseignant distinct, c'est cette
 * fonction-là qu'elle changera, pas ce fichier (brief §14).
 *
 * L'ÉTAT DES QUESTIONS SURVIT. Comme ContentModule, toutes les questions sont
 * TOUJOURS rendues, au même endroit de l'arbre ; les autres portent `hidden`.
 * Aller à la question 2 puis revenir ne remonte rien : la réponse cochée, la
 * saisie, la manipulation d'une question `custom` — tout est encore là
 * (brief §5).
 *
 * CONTRAT DOM (e2e) :
 *   [data-test-presentation] [data-test-questions=N] [data-test-current=i]
 *   [data-test-question=i] [data-test-state=unanswered|answered|correct|incorrect]
 *   [data-test-validate] [data-test-reveal-all] [data-test-navigator]
 *   [data-test-nav=<i>]
 */

/** Le chiffre d'une question dans le navigateur compact de la barre d'outils. */
function NavigatorDot({ state, index, current, onClick, label }) {
  const tone = state === QUESTION_STATE.CORRECT
    ? 'border-emerald-400 bg-emerald-500 text-white'
    : state === QUESTION_STATE.INCORRECT
      ? 'border-rose-400 bg-rose-500 text-white'
      : state === QUESTION_STATE.ANSWERED
        ? 'border-indigo-400 bg-indigo-100 text-indigo-900'
        : 'border-slate-300 bg-white text-slate-500';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={current ? 'true' : undefined}
      data-test-nav={index}
      data-test-state={state}
      className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border-2 px-1 font-mono text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${tone} ${
        current ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
      }`}
    >
      <span dir="ltr">{index + 1}</span>
    </button>
  );
}

/**
 * Le navigateur compact (brief §12) : optionnel, discret, et JAMAIS la
 * navigation principale — celle-ci reste السابق / التالي en bas de l'écran.
 * Au-delà de douze questions il s'efface : une rangée de pastilles illisible
 * au tableau ne rend service à personne, et le repère « السؤال 3 من 10 »
 * reste.
 */
const NAVIGATOR_MAX = 12;

function ToolbarSlot({ states, current, goTo, tally, revealing, lessonPosition }) {
  const { t } = useTranslation('lesson');
  const showDots = states.length > 1 && states.length <= NAVIGATOR_MAX;
  return (
    <div className="flex items-center gap-2">
      {revealing && (
        <span className="sa-classroom-position" data-test-tally>
          <span dir="ltr">{tally.correct}{'\u00A0/\u00A0'}{tally.total}</span>
        </span>
      )}
      {/* En session LEÇON, le repère « المحور 1 من 5 » reste : on déclare par
          dessus ModuleLayout, on ne lui vole pas son repère. L'enseignant doit
          savoir où il est dans le درس autant que dans le test. */}
      {lessonPosition && (
        <span className="sa-classroom-position" data-classroom-position>
          {t('classroom.positionModule', { current: lessonPosition.position, total: Math.max(1, lessonPosition.total - 1) })}
        </span>
      )}
      <span
        className="sa-classroom-position"
        data-classroom-position={lessonPosition ? undefined : true}
        data-test-position
        dir="auto"
      >
        {t('test.questionOf', { current: current + 1, total: states.length })}
      </span>
      {showDots && (
        <div className="items-center gap-1 flex" role="group" aria-label={t('test.navigator')} data-test-navigator>
          {states.map((s) => (
            <NavigatorDot
              key={s.id}
              index={s.index}
              state={s.state}
              current={s.index === current}
              onClick={() => goTo(s.index)}
              label={t('test.goToQuestion', { number: s.index + 1 })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * L'en-tête d'une question présentée : son numéro, et son état quand il est
 * connu. Le titre du test est déjà sur la barre d'outils — on ne le répète
 * pas : l'écran appartient à la question (brief §16).
 */
function QuestionHeading({ state, index, total, title }) {
  const { t } = useTranslation('lesson');
  const revealed = state === QUESTION_STATE.CORRECT || state === QUESTION_STATE.INCORRECT;
  const ok = state === QUESTION_STATE.CORRECT;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 font-mono text-xs font-bold text-white">
          <span dir="ltr">{index + 1}{'\u00A0/\u00A0'}{total}</span>
        </span>
        {title && <h3 className="font-space text-lg font-bold text-slate-800">{title}</h3>}
      </div>
      {revealed && (
        <span
          className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-1 text-sm font-bold ${
            ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'
          }`}
        >
          {ok
            ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            : <XCircle className="h-4 w-4" aria-hidden="true" />}
          {ok ? t('test.answerCorrect') : t('test.answerIncorrect')}
        </span>
      )}
    </div>
  );
}

/**
 * LA PRÉSENTATION. Le moteur lui passe ses questions et trois fonctions de
 * RENDU — il reste seul à savoir dessiner une question, sa correction et sa
 * synthèse ; la présentation ne connaît que l'ordre et les états.
 *
 * @param {object}   p
 * @param {Array}    p.questions       les questions du moteur, telles quelles
 * @param {object}   p.answers         { [id]: réponse }
 * @param {object|true} p.revealed     { [id]: true }, ou `true` (tout révélé)
 * @param {Function} p.isCorrect       (question, answer) => boolean — CELUI du moteur
 * @param {Function} p.onRevealOne     (id) => void — « تحقّق من الإجابة »
 * @param {Function} p.onRevealAll     () => void — « كشف النتائج » (le submit du moteur)
 * @param {Function} p.renderQuestion  ({ question, index, revealed }) => ReactNode
 * @param {Function} p.renderReview    ({ question, index, correct }) => ReactNode
 * @param {ReactNode} p.summary        la synthèse du moteur, montrée après la révélation
 * @param {string}   p.title           le titre porté par la barre d'outils
 * @param {object}   p.overview       { number, title, subtitle, points } — la page d'entrée du test (titre du محور
 *                                    + ce qu'il vérifie), montrée avant la question 1 ; absente = pas de page d'entrée
 * @param {string}   p.revealAllLabel  le libellé du geste final, propre au moteur
 */
export default function TestPresentation({
  questions,
  answers,
  revealed,
  isCorrect,
  onRevealOne,
  onRevealAll,
  renderQuestion,
  renderReview,
  summary,
  title,
  overview,
  revealAllLabel,
}) {
  const { t } = useTranslation('lesson');
  const classroom = useClassroomMode();
  const presenting = classroom.isClassroomMode;

  const [index, setIndex] = useState(0);
  const current = clampQuestion(index, questions.length);
  const goTo = useCallback((i) => setIndex(i), []);
  // La PAGE D'ENTRÉE (titre + ce que le test vérifie) précède la question 1 :
  // une unité de plus, sans toucher à l'index des questions.
  const hasOverview = Boolean(overview);
  const [onOverview, setOnOverview] = useState(hasOverview);
  const atOverview = hasOverview && onOverview;

  const states = useMemo(
    () => testQuestionStates(questions, { answers, revealed, isCorrect }),
    [questions, answers, revealed, isCorrect],
  );
  const everything = allRevealed(questions, revealed);
  const tally = useMemo(() => revealedTally(states), [states]);

  // Changer de question change la nature du contenu : le moteur d'ajustement
  // repart de l'échelle demandée (comme ContentModule entre deux unités).
  useEffect(() => {
    if (presenting) classroom.refit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, presenting, atOverview]);

  // Les gestes de la barre du bas : les questions se parcourent comme les
  // unités d'un module, et aux deux bouts d'une session LEÇON elles mènent au
  // module voisin. Ce qui protège un test en cours n'est pas un bouton
  // manquant mais la place de « كشف النتائج », large et dans le contenu.
  const lessonNav = classroom.lessonNavigation;
  // La PAGE D'ENTRÉE (titre + ce que le test vérifie) précède la question 1 :
  // une unité de plus, sans toucher à l'index des questions.
  const nav = useMemo(() => {
    const base = resolveTestNavigation({
      index: current,
      count: questions.length,
      goTo,
      lessonPrevious: lessonNav?.previous,
      lessonNext: lessonNav?.next,
    });
    if (!hasOverview) return base;
    if (onOverview) return { onPrevious: lessonNav?.previous || undefined, onNext: () => setOnOverview(false) };
    if (current === 0) return { ...base, onPrevious: () => setOnOverview(true) };
    return base;
  }, [current, questions.length, goTo, lessonNav, hasOverview, onOverview]);
  const slot = useMemo(
    () => (
      <ToolbarSlot
        states={states} current={current} goTo={goTo} tally={tally} revealing={everything}
        lessonPosition={lessonNav ? { position: lessonNav.position, total: lessonNav.total } : null}
      />
    ),
    [states, current, goTo, tally, everything, lessonNav],
  );
  // Priorité 2, comme ContentModule : le test connaît ses questions, et sa
  // déclaration l'emporte sur celle, générique, de ModuleLayout.
  useClassroomStage({ title, onPrevious: nav.onPrevious, onNext: nav.onNext, slot, priority: 2 }, presenting);

  const atLast = !atOverview && current === questions.length - 1;

  return (
    <div className="sa-test-presentation" data-test-presentation data-test-questions={questions.length} data-test-current={current}>
      {hasOverview && (
        <div hidden={!atOverview} className="sa-test-presentation__overview" data-test-overview>
          {presenting && (
            <ClassroomFrame>
              <ModuleOverview
                number={overview.number}
                title={overview.title}
                subtitle={overview.subtitle}
                points={overview.points}
                heading={t('classroom.overview.review')}
              />
            </ClassroomFrame>
          )}
        </div>
      )}
      {questions.map((q, i) => {
        const s = states[i];
        // TOUTES les questions sont rendues, toujours : `hidden` cache les
        // autres. Un démontage perdrait la réponse cochée (brief §5).
        return (
          <div
            key={q.id}
            hidden={atOverview || i !== current}
            className="sa-test-presentation__question"
            data-test-question={i}
            data-test-state={s.state}
          >
            <ClassroomFrame>
              <div className="space-y-5">
                <QuestionHeading state={s.state} index={i} total={questions.length} title={q.title} />

                <div className="sa-test-presentation__body" data-test-body>
                  {renderQuestion({ question: q, index: i, revealed: s.revealed })}
                </div>

                {/* La correction du moteur, telle qu'il la dessine déjà. */}
                {s.revealed && renderReview && (
                  <div className="sa-test-presentation__review">
                    {renderReview({ question: q, index: i, correct: s.correct })}
                  </div>
                )}

                {/* « تحقّق من الإجابة » — CETTE question, et elle seule. Le
                    geste reste offert après coup : rien ne force à avancer
                    (brief §8), la navigation appartient à l'enseignant. */}
                {!s.revealed && (
                  <div className="flex flex-wrap items-center gap-3">
                    <ValidateButton onClick={() => onRevealOne(q.id)} disabled={!s.answered} tone="indigo">
                      {t('test.checkAnswer')}
                    </ValidateButton>
                    {!s.answered && (
                      <span className="text-sm text-slate-500">{t('test.answerFirst')}</span>
                    )}
                  </div>
                )}
              </div>
            </ClassroomFrame>
          </div>
        );
      })}

      {/* « كشف النتائج » — le MÊME geste que le submit de la page : le moteur
          note, enregistre et soumet son evidence exactement comme avant. */}
      {!everything && atLast && (
        <ClassroomFrame>
          <div className="sa-test-presentation__finish">
            <button
              type="button"
              onClick={onRevealAll}
              data-test-reveal-all
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-base font-bold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              <Eye className="h-5 w-5" aria-hidden="true" />
              {revealAllLabel ?? t('test.revealResults')}
            </button>
          </div>
        </ClassroomFrame>
      )}

      {/* Après la révélation, la synthèse du moteur reste accessible — mais
          elle ne REMPLACE pas la revue question par question (brief §10) :
          on y arrive à la dernière question, et السابق ramène aux autres. */}
      {everything && atLast && summary && (
        <ClassroomFrame>
          <div className="sa-test-presentation__summary space-y-5" data-test-summary>
            <Feedback tone="info">
              {t('test.reviewHint', { correct: tally.correct, total: tally.total })}
            </Feedback>
            {summary}
          </div>
        </ClassroomFrame>
      )}
    </div>
  );
}

/**
 * Le branchement d'un moteur de test sur la présentation.
 *
 * Il répond à UNE question — « suis-je présenté ? » — et centralise la
 * décision d'autorisation : la présentation d'un test n'existe qu'en
 * « وضع القسم », dont l'entrée est déjà réservée aux présentateurs
 * (`canPresentClassroom`). Un futur mode enseignant explicite se branchera
 * ici, sans toucher aux deux moteurs (brief §14).
 */
export function useTestPresentation() {
  const { isClassroomMode } = useClassroomMode();
  return { presenting: isClassroomMode };
}

