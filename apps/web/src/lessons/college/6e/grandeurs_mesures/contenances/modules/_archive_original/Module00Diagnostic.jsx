import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Compass, CheckCircle2, XCircle } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { usePrerequisiteDiagnostic } from '../../../../../common/hooks/usePrerequisiteDiagnostic';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Feedback, ChoiceGrid, ValidateButton, MissionBrief } from '../../../../../common/components/LessonUI';

/* ═══ LE PRÉREQUIS SUIVI ═══════════════════════════════════════════ */
/* Prérequis officiel (coursesData.js, 6e_contenances) : "Conversions
 * d'unités" — le sens général du passage d'une unité à l'autre par
 * puissances de 10, PAS les unités de contenance elles-mêmes (L, dL, cL,
 * mL), qui sont la matière enseignée par cette leçon. */
const SKILLS = {
  conversionsUnites: { label: "Conversions d'unités", emoji: '🔁' },
};

/* ═══ LES 5 QUESTIONS DU DIAGNOSTIC — 10 points au total ═══════════ */
const QUESTIONS = [
  {
    id: 'q1-cm-m',
    skill: 'conversionsUnites',
    points: 2,
    prompt: <>Combien y a-t-il de centimètres dans <strong className="font-mono">1 mètre</strong> ?</>,
    options: ['10', '100', '1 000'],
    cols: 3,
    correct: 1,
    explain: '1 m = 100 cm : le mètre se partage en 100 centimètres.',
  },
  {
    id: 'q2-sens',
    skill: 'conversionsUnites',
    points: 2,
    prompt: (
      <>
        Un objet mesure <strong className="font-mono">3 mètres</strong>. En centimètres, ce nombre sera :
      </>
    ),
    options: ['Plus petit', 'Plus grand', 'Identique'],
    cols: 3,
    correct: 1,
    explain: "Une unité plus petite (le cm) donne un nombre plus grand pour la même longueur : 3 m = 300 cm.",
  },
  {
    id: 'q3-dix',
    skill: 'conversionsUnites',
    points: 2,
    prompt: <>Combien de fois 10 faut-il pour obtenir 1 000 ?</>,
    options: ['2 fois (10 × 2)', '3 fois (10 × 10 × 10)', '10 fois'],
    cols: 1,
    correct: 1,
    explain: '10 × 10 × 10 = 1 000 : trois multiplications par 10 successives.',
  },
  {
    id: 'q4-graduation',
    skill: 'conversionsUnites',
    points: 2,
    prompt: (
      <>
        Sur une règle graduée de 0 à 10, avec une graduation tous les 1 cm, à combien de centimètres se
        trouve la 7ᵉ graduation après 0 ?
      </>
    ),
    options: ['5 cm', '7 cm', '10 cm'],
    cols: 3,
    correct: 1,
    explain: 'Chaque graduation vaut 1 cm : la 7ᵉ graduation se trouve donc à 7 cm.',
  },
  {
    id: 'q5-poids',
    skill: 'conversionsUnites',
    points: 2,
    prompt: <>Combien y a-t-il de grammes dans <strong className="font-mono">1 kilogramme</strong> ?</>,
    options: ['10', '100', '1 000'],
    cols: 3,
    correct: 2,
    explain: '1 kg = 1 000 g : même logique que pour les longueurs, par paquets de 1 000.',
  },
];

const MAX_SCORE = QUESTIONS.reduce((sum, q) => sum + q.points, 0); // 10

function DiagnosticResult({ score, onContinue, onRedo }) {
  const level = score < 5 ? 'fragile' : score <= 7 ? 'progres' : 'pret';
  const isPerfect = score === MAX_SCORE;

  const LEVEL_META = {
    fragile: {
      emoji: '🌱',
      title: 'Tes bases sont encore fragiles.',
      body: "Ce n'est pas grave ! Le passage d'une unité à l'autre mérite encore un peu d'attention. Tu peux commencer la leçon, mais prends le temps de bien observer les premières manipulations.",
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

      <Feedback tone="info">
        <strong>Ton conseil</strong>
        <p className="mt-1">{meta.body}</p>
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

export default function Module00Diagnostic() {
  const navLinks = getNavLinks(0);
  const navigate = useNavigate();
  const { xp, awardXP } = useProgress(MODULE_CTX.lessonId);
  const { result: savedResult, save: saveResult, redo: redoResult } = usePrerequisiteDiagnostic(MODULE_CTX.lessonId);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const hydratedFromSaved = useRef(false);
  useEffect(() => {
    if (hydratedFromSaved.current || !savedResult || submitted) return;
    hydratedFromSaved.current = true;
    setAnswers(savedResult.answers || {});
    setSubmitted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedResult]);

  const allAnswered = QUESTIONS.every((q) => answers[q.id] != null);
  const isCorrect = (q) => answers[q.id] === q.correct;
  const score = QUESTIONS.reduce((sum, q) => sum + (isCorrect(q) ? q.points : 0), 0);

  function handleSubmit() {
    if (submitted) return;
    setSubmitted(true);
    const adviceLevel = score < 5 ? 'fragile' : score <= 7 ? 'progres' : 'pret';
    saveResult({
      score,
      maxScore: MAX_SCORE,
      skills: { conversionsUnites: { score, max: MAX_SCORE } },
      adviceLevel,
      answers,
    });
    awardXP({ moduleId: 'L00', exerciseId: 'diagnostic', amount: 20 });
  }

  function handleRedo() {
    redoResult();
    hydratedFromSaved.current = true;
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
      estimatedTime="4 min"
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
                  Vérifions ensemble la petite base dont tu auras besoin pour explorer les contenances : passer
                  d'une unité à l'autre. Ce test nous aide à savoir comment t'aider — ce n'est pas un examen, et
                  tu pourras toujours continuer vers le Module 1, quel que soit ton score.
                </p>
              </MissionBrief>

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
                    {answers[q.id] != null && <CheckCircle2 className="w-4 h-4 text-teal-600" aria-hidden="true" />}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{q.prompt}</p>
                  <ChoiceGrid
                    options={q.options}
                    selected={answers[q.id] ?? null}
                    onSelect={(idx) => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                    cols={q.cols || 2}
                  />
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
                      className={`border-2 rounded-2xl p-5 space-y-3 ${ok ? 'border-emerald-300 bg-emerald-50/30' : 'border-rose-300 bg-rose-50/30'}`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-space font-bold text-slate-800 flex items-center gap-2 text-sm">
                          {ok ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                          )}
                          Question {i + 1}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{q.prompt}</p>
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
                      <Feedback tone={ok ? 'ok' : 'ko'}>{q.explain}</Feedback>
                    </div>
                  );
                })}
              </div>

              <DiagnosticResult score={score} onContinue={() => navigate(navLinks.nextLink)} onRedo={handleRedo} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModuleLayout>
  );
}
