import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, CheckCircle2, XCircle } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { usePrerequisiteDiagnostic } from '../../../../../common/hooks/usePrerequisiteDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Feedback, ChoiceGrid, ValidateButton, MissionBrief } from '../../../../../common/components/LessonUI';
import PlaceValueTable from '../components/PlaceValueTable';

/* ═══ LES DEUX PRÉREQUIS SUIVIS ════════════════════════════════════ */
const SKILLS = {
  numerationDecimale: { label: 'Numération décimale', emoji: '🧱' },
  lectureEcriture: { label: 'Lecture et écriture', emoji: '✍️' },
};

/* ═══ LES 6 QUESTIONS DU DIAGNOSTIC — 10 points au total ═══════════ */
const QUESTIONS = [
  {
    id: 'q1-digit',
    skill: 'numerationDecimale',
    points: 2,
    type: 'digit',
    number: 4582,
    targetDigit: 5,
    targetKey: 'M',
    prompt: (
      <>
        Clique sur le chiffre <strong className="font-mono">5</strong> dans <strong className="font-mono">4 582</strong>.
      </>
    ),
    explainOk: 'Bien vu ! Le 5 est dans la colonne des milliers.',
    explainKo: '💡 Regarde bien sa place dans le tableau : le 5 est dans la colonne des milliers.',
  },
  {
    id: 'q2-value',
    skill: 'numerationDecimale',
    points: 2,
    type: 'mcq',
    prompt: (
      <>
        Dans <strong className="font-mono">7 306</strong>, quelle est la valeur du chiffre <strong className="font-mono">3</strong> ?
      </>
    ),
    options: ['3', '30', '300', '3 000'],
    cols: 2,
    correct: 2,
    explain: '7 306 : le 3 occupe la colonne des centaines. Sa valeur est donc 300.',
  },
  {
    id: 'q3-position',
    skill: 'numerationDecimale',
    points: 1,
    type: 'mcq',
    prompt: (
      <>
        Dans <strong className="font-mono">52 481</strong>, où se trouve le chiffre <strong className="font-mono">2</strong> ?
      </>
    ),
    options: ['Dizaines de milliers', 'Milliers', 'Centaines', 'Dizaines'],
    cols: 2,
    correct: 1,
    explain: '52 481 : en partant de la droite, 2 occupe la 4ᵉ position — la colonne des milliers.',
  },
  {
    id: 'q4-mots-vers-chiffres',
    skill: 'lectureEcriture',
    points: 2,
    type: 'mcq',
    prompt: (
      <>
        Quelle écriture correspond à <em>« quatre mille vingt-six »</em> ?
      </>
    ),
    options: ['4 026', '4 260', '4 206', '40 026'],
    cols: 2,
    correct: 0,
    explain: '« quatre mille » → 4 dans la classe des mille ; « vingt-six » → 26 dans la classe des unités. Donc 4 026.',
  },
  {
    id: 'q5-chiffres-vers-mots',
    skill: 'lectureEcriture',
    points: 2,
    type: 'mcq',
    prompt: (
      <>
        Comment lit-on <strong className="font-mono">8 405</strong> ?
      </>
    ),
    options: [
      'huit mille quatre cent cinq',
      'huit mille quarante-cinq',
      'huit cent quatre-cinq',
      'quatre-vingt-cinq cents',
    ],
    cols: 1,
    correct: 0,
    explain: '8 405 = 8 | 405 → « huit mille » puis « quatre cent cinq ».',
  },
  {
    id: 'q6-mots-vers-chiffres-2',
    skill: 'lectureEcriture',
    points: 1,
    type: 'mcq',
    prompt: (
      <>
        Quelle écriture correspond à <em>« douze mille cinquante »</em> ?
      </>
    ),
    options: ['douze mille cinquante', '12 050', '12 500', '12 005'],
    cols: 2,
    correct: 1,
    explain: '« douze mille » → 12 dans la classe des mille ; « cinquante » → 050 dans la classe des unités. Donc 12 050.',
  },
];

const MAX_SCORE = QUESTIONS.reduce((sum, q) => sum + q.points, 0); // 10

/* ═══ Une question — digit-click (tableau de numération) ═══════════ */
function DigitQuestion({ question, pick, onPick, revealed }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 leading-relaxed">{question.prompt}</p>
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-center">
        <PlaceValueTable
          value={question.number}
          onDigitClick={revealed ? undefined : (cell) => onPick(cell.key)}
          selectedKey={pick}
        />
      </div>
    </div>
  );
}

/* ═══ Une question — QCM ═══════════════════════════════════════════ */
function McqQuestion({ question, pick, onPick, revealed }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 leading-relaxed">{question.prompt}</p>
      <ChoiceGrid
        options={question.options}
        selected={pick}
        onSelect={onPick}
        cols={question.cols || 2}
        revealed={revealed}
        correctIndex={question.correct}
      />
    </div>
  );
}

/* ═══ Écran de résultat — score, conseils, forces / points à renforcer ═══ */
function DiagnosticResult({ score, skillScores, onContinue, onRedo }) {
  const level = score < 5 ? 'fragile' : score <= 7 ? 'progres' : 'pret';
  const isPerfect = score === MAX_SCORE;

  const LEVEL_META = {
    fragile: {
      emoji: '🌱',
      title: 'Tes bases sont encore fragiles.',
      body: "Ce n'est pas grave ! Quelques notions utiles sont encore à renforcer. Tu peux commencer la leçon, mais prends le temps de bien observer les premières manipulations.",
      advice: 'Avance doucement dans le premier module et utilise les aides si tu en as besoin.',
      cta: 'Commencer quand même',
      tone: 'from-emerald-500 to-teal-500',
    },
    progres: {
      emoji: '👍',
      title: 'Tes bases sont en bonne voie.',
      body: 'Tu possèdes une partie des bases nécessaires. Quelques petites hésitations peuvent encore être corrigées pendant la leçon.',
      advice: 'Sois attentif aux exemples et aux manipulations du début.',
      cta: 'Commencer le Module 1',
      tone: 'from-teal-500 to-cyan-500',
    },
    pret: {
      emoji: '⭐',
      title: 'Tu es prêt !',
      body: 'Tes bases sont solides. Tu peux entrer directement dans la mission.',
      advice: 'Essaie de résoudre les premières manipulations sans utiliser les aides.',
      cta: 'Je suis prêt !',
      tone: 'from-cyan-500 to-blue-500',
    },
  };

  const meta = LEVEL_META[level];

  // Conseil enrichi par la compétence la plus faible — seulement si une
  // compétence est strictement en retrait par rapport à l'autre (jamais en
  // cas d'égalité, même imparfaite : pointer du doigt une compétence au
  // hasard serait un faux conseil).
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
        <div className="text-3xl font-space font-extrabold">{score} / {MAX_SCORE}</div>
        <div className="text-lg font-space font-bold">{meta.title}</div>
        {isPerfect && (
          <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-bold text-sm px-4 py-2 rounded-full mt-1">
            🏆 Prérequis maîtrisés !
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(skillScores).map(([key, s]) => {
          const skillPct = Math.round((s.score / s.max) * 100);
          const good = s.score === s.max;
          return (
            <div key={key} className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-space font-bold text-slate-800 text-sm">
                  {SKILLS[key].emoji} {SKILLS[key].label}
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">{s.score} / {s.max}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${good ? 'bg-emerald-500' : 'bg-amber-400'}`}
                  style={{ width: `${skillPct}%` }}
                />
              </div>
              <div className={`text-xs font-medium ${good ? 'text-emerald-600' : 'text-amber-600'}`}>
                {good ? '✓ Bonne compréhension' : '💡 À renforcer'}
              </div>
            </div>
          );
        })}
      </div>

      <Feedback tone="info">
        <strong>Ton conseil</strong>
        <p className="mt-1">
          {meta.body}{' '}
          {weakestIsMeaningful && (
            <>Fais particulièrement attention à : <strong>{SKILLS[weakestKey].label.toLowerCase()}</strong>.</>
          )}
        </p>
        <p className="mt-2">💡 {meta.advice}</p>
      </Feedback>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl min-h-[48px] text-base"
        >
          🚀 {meta.cta}
        </button>
        <button
          type="button"
          onClick={onRedo}
          className="py-3 px-5 bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-500 font-bold rounded-xl min-h-[48px]"
        >
          Refaire le diagnostic
        </button>
      </div>
    </div>
  );
}

/* ═══ MODULE ═══════════════════════════════════════════════════════ */
export default function Module00Diagnostic() {
  const navLinks = getNavLinks(0);
  const navigate = useNavigate();
  const { xp, awardXP } = useProgress(MODULE_CTX.lessonId);
  const { result: savedResult, save: saveResult, redo: redoResult } = usePrerequisiteDiagnostic(MODULE_CTX.lessonId);

  const [answers, setAnswers] = useState({}); // question id -> pick (index or place-value key)
  const [submitted, setSubmitted] = useState(false);

  // A saved result always wins as soon as it loads: show the result screen
  // instead of a blank quiz. `hydratedFromSaved` stops this from re-firing
  // after a deliberate "Redo" clears the saved result.
  const hydratedFromSaved = useRef(false);
  useEffect(() => {
    if (hydratedFromSaved.current || !savedResult || submitted) return;
    hydratedFromSaved.current = true;
    setAnswers(savedResult.answers || {});
    setSubmitted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedResult]);

  const allAnswered = QUESTIONS.every((q) => answers[q.id] != null);

  const isCorrect = (q) => {
    const pick = answers[q.id];
    if (pick == null) return false;
    return q.type === 'digit' ? pick === q.targetKey : pick === q.correct;
  };

  const score = QUESTIONS.reduce((sum, q) => sum + (isCorrect(q) ? q.points : 0), 0);
  const skillScores = Object.keys(SKILLS).reduce((acc, key) => {
    const qs = QUESTIONS.filter((q) => q.skill === key);
    acc[key] = {
      score: qs.reduce((s, q) => s + (isCorrect(q) ? q.points : 0), 0),
      max: qs.reduce((s, q) => s + q.points, 0),
    };
    return acc;
  }, {});

  function handleSubmit() {
    if (submitted) return;
    setSubmitted(true);

    const adviceLevel = score < 5 ? 'fragile' : score <= 7 ? 'progres' : 'pret';
    saveResult({ score, maxScore: MAX_SCORE, skills: skillScores, adviceLevel, answers });
    awardXP({ moduleId: 'L00', exerciseId: 'diagnostic', amount: 20 });
  }

  function handleRedo() {
    redoResult();
    hydratedFromSaved.current = true; // don't re-hydrate from the now-cleared saved result
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      chapterTitle={MODULE_CTX.chapterTitle}
      levelLabel={MODULE_CTX.levelLabel}
      gradeLabel={MODULE_CTX.gradeLabel}
      moduleNumber={0}
      totalModules={MODULE_CTX.totalModules}
      moduleTitle="🎯 Mission de départ"
      moduleSubtitle="Un petit diagnostic pour savoir par où bien commencer."
      estimatedTime="5 min"
      xp={xp}
      prevLink={navLinks.prevLink}
      nextLink={navLinks.nextLink}
      isCompleted={submitted}
      stage="prerequisite_check"
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <AnimatePresence mode="wait">
          {!submitted && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <MissionBrief tag="🎯 Mission de départ" title="Avant de partir..." tone="indigo">
                <p>
                  Vérifions ensemble les deux petites bases dont tu auras besoin pour explorer les grands
                  nombres. Ce test nous aide à savoir comment t'aider — ce n'est pas un examen, et tu pourras
                  toujours continuer vers le Module 1, quel que soit ton score.
                </p>
              </MissionBrief>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(SKILLS).map(([key, skill]) => {
                  const doneCount = QUESTIONS.filter((q) => q.skill === key && answers[q.id] != null).length;
                  const totalCount = QUESTIONS.filter((q) => q.skill === key).length;
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

              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>Question {Object.keys(answers).length < QUESTIONS.length ? Object.keys(answers).length + 1 : QUESTIONS.length} / {QUESTIONS.length}</span>
                <span>{score} / {MAX_SCORE} en cours</span>
              </div>

              {QUESTIONS.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-2 border-slate-200 bg-white rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-teal-600 text-white">
                      {SKILLS[q.skill].emoji} {i + 1} / {QUESTIONS.length}
                    </span>
                    {answers[q.id] != null && (
                      <CheckCircle2 className="w-4 h-4 text-teal-600" aria-hidden="true" />
                    )}
                  </div>

                  {q.type === 'digit' ? (
                    <DigitQuestion
                      question={q}
                      pick={answers[q.id] ?? null}
                      onPick={(key) => setAnswers((a) => ({ ...a, [q.id]: key }))}
                      revealed={false}
                    />
                  ) : (
                    <McqQuestion
                      question={q}
                      pick={answers[q.id] ?? null}
                      onPick={(idx) => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                      revealed={false}
                    />
                  )}
                </motion.div>
              ))}

              <ValidateButton onClick={handleSubmit} disabled={!allAnswered} tone="teal">
                Voir mon résultat
              </ValidateButton>
            </motion.div>
          )}

          {submitted && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-space font-bold text-slate-800 flex items-center gap-2">
                  <Compass className="w-4 h-4" aria-hidden="true" /> Ta correction
                </h2>
                {QUESTIONS.map((q, i) => {
                  const ok = isCorrect(q);
                  return (
                    <div
                      key={q.id}
                      className={`border-2 rounded-2xl p-5 space-y-3 ${
                        ok ? 'border-emerald-300 bg-emerald-50/30' : 'border-rose-300 bg-rose-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-space font-bold text-slate-800 flex items-center gap-2 text-sm">
                          {ok ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                          )}
                          {SKILLS[q.skill].emoji} Question {i + 1}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{q.prompt}</p>
                      {q.type === 'digit' ? (
                        <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-center">
                          <PlaceValueTable value={q.number} selectedKey={answers[q.id]} compact />
                        </div>
                      ) : (
                        <div className="text-sm space-y-1">
                          <div className={ok ? 'text-emerald-700' : 'text-rose-700'}>
                            <strong>Ta réponse :</strong> {q.options[answers[q.id]]}
                          </div>
                          {!ok && (
                            <div className="text-emerald-700">
                              <strong>Bonne réponse :</strong> {q.options[q.correct]}
                            </div>
                          )}
                        </div>
                      )}
                      <Feedback tone={ok ? 'ok' : 'ko'}>
                        {q.type === 'digit' ? (ok ? q.explainOk : q.explainKo) : q.explain}
                      </Feedback>
                    </div>
                  );
                })}
              </div>

              <DiagnosticResult
                score={score}
                skillScores={skillScores}
                onContinue={() => navigate(navLinks.nextLink)}
                onRedo={handleRedo}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModuleLayout>
  );
}
