import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseDec } from '@smarter-academy/core';
import { TapQuestion, NumericQuestion, BatchChoiceQuestion } from '../kit';
import { Feedback } from '../components/LessonUI';
import MathText from '../components/MathText';
import StatementFigure from '../components/StatementFigure';
import SourceTag from './SourceTag';
import IntegerSetQuestion from './IntegerSetQuestion';
import FractionQuestion from './FractionQuestion';
import PairQuestion from './PairQuestion';
import { ClassroomPresentation, ClassroomEntryButton, ClassroomFrame } from '../classroom';
import { MoreToggle } from '../components/StudentFocus';
import { useInMissionPlayer } from '../mission/missionPlayerContext';

/**
 * Rend UN exercice du manuel à partir de sa donnée (content/exercises.js) :
 * l'énoncé au mot près, l'étiquette de source, puis l'interaction que la
 * donnée déclare —
 *   choice       QCM (TapQuestion) — { options, correct }
 *   trueFalse    plusieurs affirmations (BatchChoiceQuestion) — { rows }
 *   numeric      un nombre (NumericQuestion) — { expected, display? }
 *   integerSet   un ensemble d'entiers (IntegerSetQuestion) — { expected }
 *   fraction     un kasr (FractionQuestion, forme irréductible exigée) — { expected: 'a/b' }
 *   pair         une ثنائية (x ; y) (PairQuestion, évaluateur `point`) — { expected: { x, y }, names? }
 *   batch        plusieurs lignes, un choix par ligne (BatchChoiceQuestion) — { rows: [{ label, options, correct, correction }] }
 *   reasoning    برهان / تعليل : l'élève rédige puis compare à la solution — { solution }
 * Le texte des options et des explications vient de la donnée ; ce fichier ne
 * contient AUCUN énoncé mathématique.
 *
 * Toutes les formes sont NON BLOQUANTES (kit) ; `onAnswered` est appelé dès la
 * réponse, juste ou fausse.
 *
 * MODE CLASSE (وضع القسم) : chaque exercice est une portée de présentation
 * à lui seul — « ⛶ عرض التمرين » dans son en-tête, pour le présentateur.
 * La coquille (ClassroomPresentation) porte plein écran, repli, Échap et
 * échelle ; ici on ne fait que cadrer le MÊME exercice (ClassroomFrame), sans
 * rien remonter : réponse choisie, correction affichée, tout survit. Dans un
 * module ou une leçon déjà présentés, la coquille est passe-plat et le bouton
 * n'apparaît pas : une seule session.
 */
export default function TextbookExercise({ exercise, solved = false, onAnswered, requires, rowAside }) {
  const { t } = useTranslation('lesson');
  // lecteur de mission : une longue liste (≥ 6 lignes) tient dans l'écran sur deux colonnes, jamais sous le zoom minimum (rollout 2026-11-09)
  const inPlayer = useInMissionPlayer();
  const ex = exercise;
  const label = ex.source?.number != null ? t('textbook.exerciseN', { n: ex.source.number }) : t('textbook.exercise');
  const header = (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-block rounded-md bg-sky-600 px-2 py-0.5 text-xs font-bold text-white">
          {label}
        </span>
        <SourceTag source={ex.source} />
        {ex.difficulty && <span className="text-[11px] text-slate-500">{t(`textbook.difficulty.${ex.difficulty}`)}</span>}
        <span className="ms-auto"><ClassroomEntryButton scope="exercise" title={label} tone="quiet" compact /></span>
      </div>
      {ex.statement && <p className="leading-relaxed text-slate-800 text-base"><MathText>{ex.statement}</MathText></p>}
      {/* lecteur : une partie sans énoncé porte celui de la partie 1 (`context`, exerciseParts.js › withContext) — pas d'aller-retour */}
      {!ex.statement && ex.context && inPlayer && (
        <p className="rounded-lg bg-slate-50 px-2 py-1 text-sm leading-relaxed text-slate-700" data-exercise-context><MathText>{ex.context}</MathText></p>
      )}
      {ex.figure && <StatementFigure {...ex.figure} />}
      {ex.items && (
        <ul className="ms-3 space-y-0.5 text-sm text-slate-700">
          {ex.items.map((it, i) => <li key={i}><MathText>{it}</MathText></li>)}
        </ul>
      )}
    </div>
  );

  const q = ex.question ?? {};
  // lecteur : la carte (énoncé, sous-questions, question) est UN écran — sauf une grille de lignes (`batch`, `trueFalse`) : ses lignes forment
  // déjà un bloc, et le découpage range la figure qui la précède À CÔTÉ de l'énoncé et des lignes (`pairFigures`) ; gardée entière, la carte
  // de « أربعة أشكال » (talis-hisab-atwal) descendait sous le zoom minimum
  // (une grille qui porte un `context` ou des `items` reste entière : sans figure avant elle, l'énoncé partirait seul sur son écran)
  const rowsGrid = ['batch', 'trueFalse'].includes(ex.interaction) && !ex.context && !ex.items;
  const keepWhole = inPlayer && Boolean(ex.statement || ex.context || ex.items || ex.figure) && !rowsGrid;
  const explain = q.explain ? <MathText>{q.explain}</MathText> : undefined;

  let body = null;
  switch (ex.interaction) {
    case 'choice':
      body = (
        <TapQuestion prompt={q.prompt ? <MathText>{q.prompt}</MathText> : undefined} options={q.options.map((o) => <MathText key={o}>{o}</MathText>)}
          correct={q.correct} cols={q.cols ?? 2} explain={explain} requires={requires} solved={solved} onAnswered={(ok) => onAnswered?.(ok)} />
      );
      break;
    case 'trueFalse':
      body = (
        <BatchChoiceQuestion
          rows={q.rows.map((r, i) => ({ id: `r${i}`, label: <MathText>{r.text}</MathText>, options: [t('textbook.true'), t('textbook.false')], correct: r.answer ? 0 : 1, correction: r.why ? <MathText>{r.why}</MathText> : r.why }))}
          requires={requires} solved={solved}
          feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? t('textbook.allRight') : t('textbook.seeCorrections')}{explain && (allRight ? <MoreToggle label={t('focus.why')}><> — {explain}</></MoreToggle> : <> — {explain}</>)}</Feedback>}
          onAnswered={(ok) => onAnswered?.(ok)} />
      );
      break;
    case 'numeric':
      body = (
        <NumericQuestion prompt={q.prompt ? <MathText>{q.prompt}</MathText> : undefined} expected={q.expected} display={q.display ?? String(q.expected)}
          parse={parseDec}
          explain={explain} explainFor={q.explainFor ? (n) => <MathText>{q.explainFor(n)}</MathText> : undefined}
          requires={requires} solved={solved} onAnswered={(ok) => onAnswered?.(ok)} />
      );
      break;
    case 'integerSet':
      body = (
        <IntegerSetQuestion prompt={q.prompt ? <MathText>{q.prompt}</MathText> : undefined} expected={q.expected} explain={q.explain}
          requires={requires} solved={solved} onAnswered={(ok) => onAnswered?.(ok)} />
      );
      break;
    case 'fraction':
      body = (
        <FractionQuestion prompt={q.prompt ? <MathText>{q.prompt}</MathText> : undefined} expected={q.expected} explain={q.explain}
          requireIrreducible={q.requireIrreducible !== false} requires={requires} solved={solved} onAnswered={(ok) => onAnswered?.(ok)} />
      );
      break;
    case 'pair':
      body = (
        <PairQuestion prompt={q.prompt ? <MathText>{q.prompt}</MathText> : undefined} expected={q.expected} explain={q.explain} names={q.names}
          requires={requires} solved={solved} onAnswered={(ok) => onAnswered?.(ok)} />
      );
      break;
    case 'batch':
      body = (
        <BatchChoiceQuestion
          intro={q.prompt ? <p className="text-sm font-semibold text-slate-700"><MathText>{q.prompt}</MathText></p> : undefined}
          rows={q.rows.map((r, i) => ({ id: `b${i}`, label: <MathText>{r.label}</MathText>, options: r.options.map((o) => (typeof o === 'string' ? <MathText key={o}>{o}</MathText> : o)), correct: r.correct, correction: typeof r.correction === 'string' ? <MathText>{r.correction}</MathText> : r.correction }))}
          requires={requires} solved={solved} rowCols={inPlayer && q.rows.length >= 6 && !rowAside ? 2 : 1} rowAside={rowAside}
          feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? t('textbook.allRight') : t('textbook.seeCorrections')}{explain && (allRight ? <MoreToggle label={t('focus.why')}><> — {explain}</></MoreToggle> : <> — {explain}</>)}</Feedback>}
          onAnswered={(ok) => onAnswered?.(ok)} />
      );
      break;
    case 'reasoning':
      body = <Reasoning solution={q.solution} solved={solved} onAnswered={onAnswered} />;
      break;
    default:
      body = null;
  }

  return (
    <ClassroomPresentation scope="exercise" title={label} entry="none">
      <ClassroomFrame maxWidth={1000}>
        {/* lecteur : « pas d'aller-retour » (2026-11-11) — l'énoncé, ses sous-questions (`items`) et la question restent sur UN écran
            (`data-paging-keep`) ; le découpage posait « 1) … 2) … 3) اكتب الكسر 1005/315 » sur un écran et « 3) الشكل غير القابل
            للاختزال: » seul sur le suivant. Trop haut : l'ajustement réduit l'écran (dernier recours). La page et le mode classe : inchangés. */}
        <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 space-y-3" data-textbook-exercise={ex.id}
          data-paging-keep={keepWhole ? '' : undefined}>
          {/* lecteur, énoncé AVEC figure : l'énoncé (et sa figure) à côté de la question, comme `pairFigures` les rangeait */}
          {inPlayer && ex.figure ? (
            <div className="flex items-start gap-4" data-textbook-side>
              <div className="w-1/2 shrink-0 [&_svg]:max-h-[210px]">{header}</div>
              <div className="min-w-0 flex-1">{body}</div>
            </div>
          ) : (
            <>
              {header}
              {body}
            </>
          )}
          {/* Regard « focus » : le « خطأ شائع » n'est pas lu avant de répondre — il est à un geste. */}
          {ex.commonError && (
            <MoreToggle label={t('textbook.commonError')}>
              <p className="text-xs text-slate-500"><strong>{t('textbook.commonError')} :</strong> <MathText>{ex.commonError}</MathText></p>
            </MoreToggle>
          )}
        </div>
      </ClassroomFrame>
    </ClassroomPresentation>
  );
}

/**
 * Un exercice de RAISONNEMENT (برهن، علّل، اشرح) : l'élève écrit sa réponse
 * pour lui-même, puis compare à la solution du manuel. Aucune évaluation
 * automatique — on ne fait pas semblant de corriger un brهان par mots-clés.
 * Type « discovery » : jamais de preuve d'apprentissage.
 */
function Reasoning({ solution, solved, onAnswered }) {
  const { t } = useTranslation('lesson');
  const [text, setText] = useState('');
  const [revealed, setRevealed] = useState(solved);
  return (
    <div className="space-y-2">
      {!revealed && (
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
          aria-label={t('textbook.yourReasoning')} placeholder={t('textbook.yourReasoning')}
          className="w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none" />
      )}
      {!revealed ? (
        <button type="button" onClick={() => { setRevealed(true); onAnswered?.(true); }}
          className="rounded-xl border-2 border-blue-600 bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
          {t('textbook.compareWithSolution')}
        </button>
      ) : (
        <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-3 space-y-1">
          <span className="inline-block rounded-md bg-slate-700 px-2 py-0.5 text-xs font-bold text-white">{t('textbook.solution')}</span>
          {(Array.isArray(solution) ? solution : [solution]).map((line, i) => (
            <p key={i} className="text-sm leading-relaxed text-slate-800"><MathText>{line}</MathText></p>
          ))}
        </div>
      )}
    </div>
  );
}
