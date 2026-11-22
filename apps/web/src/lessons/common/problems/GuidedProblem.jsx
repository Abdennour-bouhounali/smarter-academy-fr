import { useEffect, useRef, useState } from 'react';
import { useSavedAnswer } from '../answers/useSavedAnswer';
import { useTranslation } from 'react-i18next';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion } from '../kit';
import InfoSorter from '../components/InfoSorter';
import MathText from '../components/MathText';
import { SourceTag } from '../textbook';
import WrittenAnswer from './WrittenAnswer';
import ProblemSupport from './ProblemSupport';
import ProblemSheet from './ProblemSheet';
import ProblemAside, { asideIsWide } from './ProblemAside';
import { problemTone } from './problemTone';
import { MoreToggle, useStudentFocusFor } from '../components/StudentFocus';
import { isMissionView } from '../mission/missionModel';
import { useLearningViewer } from '../../../features/learning/learningViewer';
import { useClassroomMode } from '../classroom/ClassroomContext';
import { getLoadedLessonConfig } from '../../registry';
import { initialProgress, completeSubstep, isPartDone, substepRole, stepTemplate, stepGiven, resumePart, asideOf, foundOf } from './guidedProblem';

/**
 * GuidedProblem — un module « مسألة » : un exercice COMPLET de type امتحان,
 * résolu pas à pas (décision du propriétaire, 2026-10-05 : toujours guidé).
 *
 * La carte d'activité porte l'énoncé ENTIER et ses questions numérotées, comme
 * sur la feuille d'examen ; chaque question devient une étape du module, et
 * dans chaque étape les sous-étapes s'ouvrent l'une après l'autre :
 * أستخرج المعطيات → أترجم → أحسب → أستنتج / الجواب → الحلّ المحرّر.
 * Chaque demande de la question a sa propre réponse (guidedProblem.js › asks),
 * et la partie se clôt sur une RÉDACTION écrite par l'élève (WrittenAnswer).
 *
 * Le composant est piloté par la DONNÉE (`content/problems.js` de la leçon) :
 * une leçon n'écrit aucun JSX de مسألة. Contrat et validation :
 * ./guidedProblem.js ; docs/architecture/LESSON_CONTRACT.md § Modules « مسائل ».
 *
 * Non bloquant : une sous-étape est faite dès qu'on y a répondu. Formatif :
 * aucune question n'est un `assessment` — la maîtrise des الكفاءات ne vient
 * que du إختبار أولي.
 */
export default function GuidedProblem({ ctx, navLinks, moduleNumber, problem, estimatedTime, footer }) {
  const { t } = useTranslation('lesson');
  const T = problemTone(problem.tone);
  // Regard « focus » de l'élève : décidé ICI (les étapes sont rendues par ContentModule, hors du fournisseur).
  const focus = useStudentFocusFor(ctx.studentView);
  // Lecteur de mission : chaque sous-étape devient un BLOC à part, que le découpage en pages peut séparer (aucun défilement).
  const viewer = useLearningViewer();
  const classroom = useClassroomMode();
  const play = Boolean(getLoadedLessonConfig(ctx.lessonId)?.mission) && isMissionView(ctx.studentView, viewer, classroom);
  const [progress, setProgress] = useState(() => initialProgress(problem));
  // l'avancement de la مسألة gardé POUR L'ÉLÈVE (pilote 2026-11-07) : il revient à la sous-étape où il s'était arrêté
  const memory = useSavedAnswer([], { key: `gp:${problem.id ?? problem.title}`, lessonId: ctx.lessonId, moduleNumber });
  const touched = useRef(false);
  // Une sous-étape qui se RESTAURE (sa propre réponse gardée, ses effets passent AVANT celui de la مسألة) n'est pas un geste de l'élève :
  // elle ne doit ni bloquer la reprise ni écraser l'avancement gardé (vu le 2026-11-10, synthèse de l'unité 9 : après un rechargement la
  // وضعية repartait de l'écran 0 et l'avancement gardé était remplacé par celui des seules questions restaurées).
  const restoring = () => !restored.current && memory.saved?.v != null;
  const done = (p, i) => { if (!restoring()) touched.current = true; setProgress((prev) => completeSubstep(prev, p, i)); };
  // Ce que l'élève a répondu à chaque sous-étape (affiché dans la liste des demandes).
  const [given, setGiven] = useState({});
  const restored = useRef(false);
  // REPRISE DANS la مسألة (`mission.resumeInside`, lecteur seulement) : une fois l'avancement gardé retrouvé, la première partie encore
  // ouverte est dite à ContentModule, qui y saute UNE fois — l'élève ne repart pas de l'écran 0 d'une وضعية à moitié faite.
  const resumeInside = play && getLoadedLessonConfig(ctx.lessonId)?.mission?.resumeInside === true;
  const [resumeStep, setResumeStep] = useState(null);
  useEffect(() => {
    const m = memory.saved;
    if (restored.current || !m?.v || touched.current) return;
    restored.current = true;
    if (Array.isArray(m.v.progress) && m.v.progress.length === progress.length) {
      // le plus avancé des deux, partie par partie : l'avancement gardé ET ce que les questions restaurées viennent de refaire
      const merged = m.v.progress.map((n, k) => Math.max(Number(n) || 0, progress[k] ?? 0));
      setProgress(merged);
      const part = resumeInside ? resumePart(merged, problem) : null;
      if (part != null) setResumeStep(part + 1);
    }
    if (m.v.given && typeof m.v.given === 'object') setGiven((g) => ({ ...m.v.given, ...g }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memory.saved]);
  useEffect(() => { if (touched.current) memory.save({ progress, given }); }, [progress, given]); // eslint-disable-line react-hooks/exhaustive-deps
  const answer = (p, i, value) => {
    if (!restoring()) touched.current = true;
    setGiven((g) => ({ ...g, [`${p}:${i}`]: value }));
    done(p, i);
  };

  const renderSubstep = (part, p, step, i) => {
    const onDone = () => done(p, i);
    switch (step.kind) {
      case 'sort':
        return (
          <div className="space-y-2">
            <p className="text-sm text-slate-700">{step.lead ?? t('problem.sortLead')}</p>
            {/* Textes simples : InfoSorter les joint et s'en sert d'étiquette. */}
            <InfoSorter items={problem.data} formative onSolved={onDone} />
          </div>
        );
      case 'choice':
        return (
          <TapQuestion
            prompt={<MathText>{step.prompt}</MathText>}
            options={step.options.map((o) => <MathText key={o}>{o}</MathText>)}
            correct={step.correct} cols={step.cols ?? 1}
            explain={step.explain ? <MathText>{step.explain}</MathText> : undefined}
            requires={step.requires}
            onAnswered={(_, idx) => answer(p, i, step.options[idx])}
          />
        );
      case 'numeric':
        return (
          <NumericQuestion
            prompt={<MathText>{step.prompt}</MathText>}
            expected={step.expected} display={step.display ?? String(step.expected)}
            parse={parseDec}
            prefix={step.prefix} suffix={step.suffix}
            // « الإجابة تُكتب في شكلها » : seule une étape qui DÉCLARE `shape` change (guidedProblem.js › stepTemplate)
            template={stepTemplate(step) ?? undefined}
            explain={step.explain ? <MathText>{step.explain}</MathText> : undefined}
            requires={step.requires}
            onAnswered={(_, n) => answer(p, i, stepGiven(step, n))}
          />
        );
      case 'batch':
        return (
          <BatchChoiceQuestion
            intro={step.prompt ? <p className="text-sm font-semibold text-slate-700"><MathText>{step.prompt}</MathText></p> : undefined}
            rows={step.rows.map((r, k) => ({
              id: `r${k}`,
              label: <MathText>{r.label}</MathText>,
              options: r.options.map((o) => <MathText key={o}>{o}</MathText>),
              correct: r.correct,
              correction: r.correction ? <MathText>{r.correction}</MathText> : undefined,
            }))}
            requires={step.requires}
            onAnswered={onDone}
          />
        );
      case 'solution':
        // La rédaction : l'élève écrit, puis la rédaction modèle ligne à ligne.
        return <WrittenAnswer prompt={step.prompt} lines={step.lines} onDone={onDone} />;
      default:
        return null;
    }
  };

  const steps = problem.parts.map((part, p) => ({
    num: p + 1,
    // Lecteur : l'en-tête de la partie, répété à chacun de ses écrans, porte la QUESTION ENTIÈRE, pas son titre court
    // (propriétaire, 2026-11-04).
    title: play ? `${part.label} ${part.question}` : `${part.label} ${part.title}`,
    done: isPartDone(progress, problem, p),
    content: (kit) => {
      // Revisite d'un module terminé : tout le chemin est ouvert.
      const open = kit.alreadyCompleted ? part.steps.length : progress[p] + 1;
      const asks = part.asks ?? [];
      // Une demande est satisfaite quand une de SES sous-étapes de réponse
      // (hors rédaction) est faite ; on montre ce que l'élève y a mis.
      const askState = asks.map((_, k) => {
        const i = part.steps.findIndex((st, j) => st.ask === k && st.kind !== 'solution' && progress[p] > j);
        return i < 0 ? null : (given[`${p}:${i}`] ?? '✓');
      });
      return (
        <div className="space-y-4" data-problem-part={p + 1}>
          {(!play || asks.length > 0) && (
          <div className={`space-y-2 rounded-xl border-2 ${T.box} px-3 py-2`} data-problem-question>
            {/* Lecteur : la question est déjà dans l'en-tête de la partie — la boîte garde les demandes */}
            {!play && <p className={`text-sm font-semibold ${T.title}`}><MathText>{`${part.label} ${part.question}`}</MathText></p>}
            {/* LES DEMANDES, visibles d'emblée : deux questions = deux réponses
                (règle du propriétaire, 2026-10-06). */}
            {asks.length > 0 && (
              <div className={`space-y-1 ${play ? '' : `border-t ${T.rule} pt-2`}`} data-problem-asks={asks.length}>
                <p className={`text-xs font-bold ${T.asksTitle}`}>{t('problem.asksTitle')}</p>
                <ol className="space-y-1">
                  {asks.map((ask, k) => (
                    <li key={k} className={`flex flex-wrap items-center gap-2 text-sm ${T.title}`} data-problem-ask-item={k} data-answered={askState[k] != null ? 'true' : 'false'}>
                      <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${askState[k] != null ? 'bg-emerald-600 text-white' : `border-2 ${T.todo}`}`} dir="ltr">
                        {askState[k] != null ? '✓' : k + 1}
                      </span>
                      <MathText>{ask}</MathText>
                      {askState[k] != null && askState[k] !== '✓' && (
                        <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-emerald-800" data-ask-given>
                          <MathText>{String(askState[k])}</MathText>
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
          )}
          {(() => {
            const items = part.steps.map((step, i) => {
              const locked = i >= open;
              // La rédaction répond à TOUTE la question : pas d'étiquette d'une seule demande.
              const askChip = step.kind !== 'solution' && step.ask != null && asks[step.ask] && (
                <p className={`inline-block rounded-full ${T.chip} px-2.5 py-0.5 text-xs font-bold`} data-problem-ask={step.ask}>
                  <MathText>{t('problem.askChip', { ask: asks[step.ask] })}</MathText>
                </p>
              );
              return { locked, step, i, el: (
                <li key={i} className={`space-y-2 ${locked ? 'rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-3 py-2 opacity-70' : ''}`}
                  data-problem-substep={substepRole(step)} data-substep-done={progress[p] > i ? 'true' : 'false'} data-substep-locked={locked ? 'true' : 'false'}>
                  <p className="flex items-center gap-2 text-xs font-extrabold text-slate-600">
                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white ${locked ? 'bg-slate-400' : 'bg-slate-700'}`} dir="ltr">{i + 1}</span>
                    {t(`problem.role.${substepRole(step)}`)}
                    {locked && <span aria-hidden="true">🔒</span>}
                  </p>
                  {/* À quelle demande de la question cette étape répond. */}
                  {askChip}
                  {locked
                    // Fermée : on montre CE QUI viendra (sa consigne), jamais la réponse.
                    ? (step.prompt && <p className="text-sm text-slate-500"><MathText>{step.prompt}</MathText></p>)
                    : renderSubstep(part, p, step, i)}
                </li>
              ) };
            });
            // Regard « focus » : les sous-étapes fermées ne s'affichent pas d'emblée — elles s'ouvrent dans « الخطوات القادمة ».
            const upcoming = focus ? items.filter((x) => x.locked) : [];
            return (
              <>
                {play
                  // une liste d'un élément par sous-étape : du HTML valide, et autant de blocs que de sous-étapes
                  // « pas d'aller-retour » (2026-11-11) : chaque sous-étape porte À CÔTÉ d'elle la figure et les données de l'énoncé
                  // (ProblemAside) — l'énoncé n'est que sur le premier écran ; une rangée gardée entière (`data-paging-keep`)
                  ? items.filter((x) => !x.locked).map((x) => {
                    const aside = asideOf(problem, x.step);
                    const found = x.step.kind === 'sort' ? [] : foundOf(problem, p, x.i, given);
                    if (!aside && !found.length) return <ol key={x.el.key} className="list-none">{x.el}</ol>;
                    return (
                      <div key={x.el.key} className="flex items-start gap-4" data-paging-keep data-problem-aside-row>
                        <div className={`${asideIsWide(aside, found) ? 'w-[48%] max-w-[34rem]' : 'w-[32%] min-w-[13rem] max-w-[20rem]'} shrink-0`}><ProblemAside aside={aside} found={found} /></div>
                        <ol className="min-w-0 flex-1 list-none">{x.el}</ol>
                      </div>
                    );
                  })
                  : (
                    <ol className="space-y-4">
                      {items.filter((x) => !focus || !x.locked).map((x) => x.el)}
                    </ol>
                  )}
                {/* Le lecteur n'a pas de « المزيد » : chaque sous-étape arrive sur SON écran quand elle s'ouvre (ClassroomPaged). */}
                {upcoming.length > 0 && !play && (
                  <MoreToggle force label={t('focus.upcomingSteps', { count: upcoming.length })}>
                    <ol className="space-y-4" data-focus-upcoming-substeps>{upcoming.map((x) => x.el)}</ol>
                  </MoreToggle>
                )}
              </>
            );
          })()}
        </div>
      );
    },
  }));

  return (
    <>
    {/* Lecteur : « نصّ المسألة » à TOUS les écrans — l'énoncé entier dans une fenêtre */}
    {play && <ProblemSheet problem={problem} />}
    <ContentModule
      ctx={ctx}
      navLinks={navLinks}
      moduleNumber={moduleNumber}
      moduleTitle={problem.title}
      moduleSubtitle={problem.context}
      estimatedTime={estimatedTime}
      brief={{
        tag: t('problem.tag'),
        headline: problem.headline,
        emoji: problem.emoji,
        title: problem.context,
        tone: problem.tone ?? 'amber',
        // L'énoncé EST la مسألة : il reste ouvert même en focus.
        keepBody: true,
        body: (
          play ? (
            // Lecteur : en DEUX colonnes (le texte et les questions | le support) — l'énoncé tient à la taille commune de la leçon
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]" data-problem-statement>
              <div className="space-y-2">
                <p className="leading-relaxed"><MathText>{problem.statement}</MathText></p>
                <ol className="list-none space-y-0.5 font-semibold">
                  {problem.parts.map((part) => <li key={part.label}><MathText>{`${part.label} ${part.question}`}</MathText></li>)}
                </ol>
                <p className="text-xs text-slate-600">{t('problem.briefLead')}</p>
              </div>
              <ProblemSupport figure={problem.figure} visual={problem.visual} table={problem.table} scene={problem.scene} illustration={problem.illustration} />
            </div>
          ) : (
          <div className="space-y-2" data-problem-statement>
            <p className="leading-relaxed"><MathText>{problem.statement}</MathText></p>
            {/* Le support de l'énoncé (2026-10-06) : une مسألة qui dit « الشكل » / « الجدول » / « التمثيل البياني »
                le MONTRE — mêmes données déclaratives que la pratique (ExerciseStatement). */}
            <ProblemSupport figure={problem.figure} visual={problem.visual} table={problem.table} scene={problem.scene} illustration={problem.illustration} />
            {/* Regard « focus » : chaque partie repose déjà SA question — la liste complète est à un geste. */}
            <MoreToggle label={t('focus.all')}>
              <ol className="list-none space-y-0.5 font-semibold">
                {problem.parts.map((part) => <li key={part.label}><MathText>{`${part.label} ${part.question}`}</MathText></li>)}
              </ol>
              <p className="text-xs text-slate-600">{t('problem.briefLead')}</p>
            </MoreToggle>
          </div>
          )
        ),
        footer: <SourceTag source={problem.source} />,
      }}
      steps={steps}
      footer={footer}
      resumeStep={resumeStep}
    />
    </>
  );
}
