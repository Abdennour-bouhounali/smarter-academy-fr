import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { ChevronForward } from '../../../components/common/DirectionalIcons';
import { useAdminResource } from '../../../hooks/useAdminResource';
import {
  fetchClassLessons,
  fetchClassLearningPoints,
  fetchClassLearningMap,
} from '../../../services/teacher/classGroupService';
import { flattenCurriculum } from '../classGroupLessons/lessonSelection';
import { Loading, ErrorBox, input } from '../../../pages/teacher/teacherUi';
import { barSegments, sortLearningPoints, LP_STATUSES, LP_STATUS_BAR } from './lpBar';
import LearningPointDrilldown from './LearningPointDrilldown';
import LessonPicker from './LessonPicker';
import MathLabel from '../../../lessons/common/components/MathLabel';

const ALL = '*';

/**
 * « الكفاءات » — la CARTE d'apprentissage de la classe.
 *
 * Par défaut « كل الدروس » : tous les points du périmètre, groupés par leçon
 * (une seule requête). Une leçon peut être choisie parmi les leçons VISIBLES
 * du قسم (une leçon masquée n'a pas d'élèves à mesurer). Une ligne par point :
 * la barre empilée des quatre statuts, la PORTÉE d'une difficulté (un élève,
 * un groupe, toute la classe — ce qu'une moyenne cacherait), et les trois
 * puces qui disent pourquoi un statut hésite. Cliquer descend vers les
 * élèves, dans le même onglet ; `focusCode` y descend directement (depuis
 * « نظرة عامة »).
 */
export default function LearningPointsTab({ classGroup, focusCode = null, onFocusConsumed }) {
  const { t } = useTranslation('teacher');
  const lessonsLoader = useCallback((tk) => fetchClassLessons(tk, classGroup.id), [classGroup.id]);
  const lessons = useAdminResource(lessonsLoader, [lessonsLoader]);
  const visible = useMemo(
    () => flattenCurriculum(lessons.data).filter((row) => row.classStatus === 'visible'),
    [lessons.data],
  );

  const [lessonCode, setLessonCode] = useState(ALL);
  const [sortBy, setSortBy] = useState('gap');
  const [selected, setSelected] = useState(focusCode);

  useEffect(() => {
    if (focusCode) {
      setSelected(focusCode);
      onFocusConsumed?.();
    }
  }, [focusCode, onFocusConsumed]);

  const pointsLoader = useCallback(
    (tk) =>
      lessonCode === ALL
        ? fetchClassLearningMap(tk, classGroup.id)
        : fetchClassLearningPoints(tk, classGroup.id, lessonCode),
    [classGroup.id, lessonCode],
  );
  const points = useAdminResource(pointsLoader, [pointsLoader]);
  // Une leçon : une liste. Toutes : une liste par leçon, dans l'ordre du cours.
  const groups = useMemo(() => {
    if (!points.data) return [];
    if (lessonCode === ALL)
      return (points.data.lessons ?? []).map((l) => ({
        code: l.code,
        title: l.title,
        rows: sortLearningPoints(l.learningPoints, sortBy),
      }));
    return [{ code: lessonCode, title: null, rows: sortLearningPoints(points.data.learningPoints, sortBy) }];
  }, [points.data, sortBy, lessonCode]);
  const empty = groups.every((g) => g.rows.length === 0);
  // ONE lesson open at a time when all lessons are listed: the one with the most students in difficulty, else the first.
  const filled = groups.filter((g) => g.rows.length > 0);
  const weight = (g) =>
    g.rows.reduce((sum, lp) => sum + (Number(lp.counts?.gap) || 0) * 2 + (Number(lp.counts?.reinforce) || 0), 0);
  const defaultOpen =
    filled.reduce((best, g) => (best === null || weight(g) > weight(best) ? g : best), null)?.code ?? null;
  const [openLesson, setOpenLesson] = useState(undefined);
  // By default only the lessons where at least one student was assessed: a lesson nobody touched says nothing yet.
  const touched = (g) =>
    g.rows.some((lp) => ['mastered', 'reinforce', 'gap'].some((key) => Number(lp.counts?.[key]) > 0));
  const [everyLesson, setEveryLesson] = useState(false);
  const assessed = filled.filter(touched);
  const shown = everyLesson || assessed.length === 0 || lessonCode !== ALL ? filled : assessed;
  const opened = openLesson === undefined ? defaultOpen : openLesson;

  const pickLesson = (code) => {
    setLessonCode(code);
    setSelected(null);
  };

  if (lessons.loading) return <Loading />;
  if (lessons.error) return <ErrorBox message={lessons.error} onRetry={lessons.reload} />;
  if (visible.length === 0)
    return (
      <p className="rounded-2xl border border-nav-line bg-white p-8 text-center text-sm text-slate-500">
        {t('learningPoints.noLessons')}
      </p>
    );

  return (
    <div className="space-y-4" data-learning-points-tab>
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-nav-line bg-white p-4">
        <div className="min-w-[14rem] flex-1">
          <span className="mb-1 block text-xs font-semibold text-slate-700">{t('learningPoints.pickLesson')}</span>
          <LessonPicker
            value={lessonCode}
            lessons={visible}
            allValue={ALL}
            allLabel={t('learningPoints.allLessons')}
            onPick={pickLesson}
          />
        </div>
        {!selected && (
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-700">{t('learningPoints.sortBy')}</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={input} data-lp-sort>
              <option value="gap">{t('learningPoints.sortGap')}</option>
              <option value="order">{t('learningPoints.sortOrder')}</option>
            </select>
          </label>
        )}
        {points.data && (
          <p className="w-full text-xs text-slate-500 sm:w-auto sm:ms-auto">
            {t('learningPoints.studentsCount', { count: Number(points.data.students) || 0 })}
          </p>
        )}
      </div>

      {selected ? (
        <LearningPointDrilldown classGroup={classGroup} code={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
          {points.loading && <Loading />}
          {points.error && <ErrorBox message={points.error} onRetry={points.reload} />}
          {points.data &&
            !points.loading &&
            (empty ? (
              <p className="rounded-2xl border border-nav-line bg-white p-8 text-center text-sm text-slate-500">
                {t('learningPoints.empty')}
              </p>
            ) : (
              <>
                <Legend />
                {shown.map((g) => {
                  const isOpen = !g.title || opened === g.code;
                  return (
                    <section
                      key={g.code}
                      className="overflow-hidden rounded-2xl border border-nav-line bg-white"
                      data-lp-lesson-group={g.code}
                    >
                      {g.title && (
                        <button
                          type="button"
                          onClick={() => setOpenLesson(isOpen ? null : g.code)}
                          aria-expanded={isOpen}
                          className="flex min-h-[52px] w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-start hover:bg-nav-page"
                          data-lp-lesson-toggle={g.code}
                        >
                          <span className="min-w-0 flex-1 basis-56 truncate font-space text-sm font-bold text-nav-ink">
                            <MathLabel>{g.title}</MathLabel>
                          </span>
                          <LessonBar rows={g.rows} />
                          <ChevronDown
                            size={16}
                            className={`shrink-0 text-nav-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
                        </button>
                      )}
                      {isOpen && (
                        <ul className="divide-y divide-nav-line border-t border-nav-line">
                          {g.rows.map((lp) => (
                            <LearningPointRow key={lp.code} lp={lp} onOpen={() => setSelected(lp.code)} />
                          ))}
                        </ul>
                      )}
                    </section>
                  );
                })}
                {lessonCode === ALL && assessed.length > 0 && assessed.length < filled.length && (
                  <button
                    type="button"
                    onClick={() => setEveryLesson((value) => !value)}
                    className="min-h-[40px] text-sm font-bold text-nav-accent hover:underline"
                    data-lp-every-lesson
                  >
                    {everyLesson ? t('attention.showLess') : `${t('learningPoints.allLessons')} (${filled.length})`}
                  </button>
                )}
              </>
            ))}
        </>
      )}
    </div>
  );
}

/** A lesson on one bar: the counts of all its الكفاءات together — enough to choose which lesson to open. */
function LessonBar({ rows }) {
  const totals = {};
  for (const lp of rows)
    for (const key of LP_STATUSES) totals[key] = (totals[key] ?? 0) + (Number(lp.counts?.[key]) || 0);
  const segments = barSegments(totals);
  return (
    <span className="flex h-2.5 w-40 shrink-0 overflow-hidden rounded-full bg-nav-line sm:w-56" aria-hidden="true">
      {segments.map(
        (seg) =>
          seg.percent > 0 && (
            <span key={seg.key} className={`h-full ${LP_STATUS_BAR[seg.key]}`} style={{ width: `${seg.percent}%` }} />
          ),
      )}
    </span>
  );
}

function Legend() {
  const { t } = useTranslation('teacher');
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-[11px] text-slate-500" aria-hidden="true">
      {LP_STATUSES.map((key) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-sm ${LP_STATUS_BAR[key]}`} /> {t(`students.masteryStatus.${key}`)}
        </span>
      ))}
    </p>
  );
}

function LearningPointRow({ lp, onOpen }) {
  const { t } = useTranslation('teacher');
  const segments = barSegments(lp.counts);
  const barLabel = segments.map((s) => `${t(`students.masteryStatus.${s.key}`)} ${s.count}`).join(' · ');
  const chips = [
    ['insufficientEvidence', lp.reasons?.insufficientEvidence, 'border-slate-300 text-slate-600'],
    ['needsAssessment', lp.reasons?.needsAssessment, 'border-violet-300 text-violet-700'],
    ['staleMastered', lp.staleMastered, 'border-amber-300 text-amber-800'],
  ].filter(([, n]) => Number(n) > 0);

  return (
    <li data-lp-row={lp.code}>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-start hover:bg-slate-50"
      >
        <span className="min-w-0 flex-1 basis-56">
          <span className="block truncate font-inter text-sm font-semibold text-slate-800">
            <MathLabel>{lp.title}</MathLabel>
          </span>
          {(chips.length > 0 || (lp.difficultyScope && lp.difficultyScope !== 'none')) && (
            <span className="mt-1 flex flex-wrap gap-1.5">
              {lp.difficultyScope && lp.difficultyScope !== 'none' && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${lp.difficultyScope === 'isolated' ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-700'}`}
                  data-lp-scope={lp.difficultyScope}
                >
                  {t(`learningPoints.scope.${lp.difficultyScope}`)}
                </span>
              )}
              {chips.map(([key, n, tone]) => (
                <span
                  key={key}
                  className={`rounded-full border border-dashed px-2 py-0.5 text-[10px] ${tone}`}
                  data-lp-chip={key}
                >
                  {t(`learningPoints.chips.${key}`, { count: Number(n) })}
                </span>
              ))}
            </span>
          )}
        </span>
        <span className="flex basis-64 flex-1 items-center gap-3">
          <span
            className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100"
            role="img"
            aria-label={barLabel}
            title={barLabel}
          >
            {segments.map(
              (s) =>
                s.percent > 0 && (
                  <span
                    key={s.key}
                    className={`h-full ${LP_STATUS_BAR[s.key]}`}
                    style={{ width: `${s.percent}%` }}
                    data-lp-segment={s.key}
                  />
                ),
            )}
          </span>
          <span className="flex shrink-0 gap-2 font-mono-jetbrains text-[11px] tabular-nums" dir="ltr">
            {segments.map((s) => (
              <span
                key={s.key}
                className={s.count === 0 ? 'text-slate-300' : 'text-slate-700'}
                title={t(`students.masteryStatus.${s.key}`)}
              >
                {s.count}
              </span>
            ))}
          </span>
        </span>
        <ChevronForward size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
      </button>
    </li>
  );
}
