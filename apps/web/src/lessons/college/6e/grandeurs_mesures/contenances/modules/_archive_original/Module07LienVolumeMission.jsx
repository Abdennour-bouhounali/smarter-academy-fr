import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Target, BookMarked, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { useEvidenceSubmission } from '../../../../../common/hooks/useEvidenceSubmission';
import { useCountdownTimer } from '../../../../../common/hooks/useCountdownTimer';
import { useFinalTestAttempt } from '../../../../../common/hooks/useFinalTestAttempt';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { Feedback, ChoiceGrid, ValidateButton, MissionBrief, TimerToggle, TimerDisplay } from '../../../../../common/components/LessonUI';

const BOSS_TIMER_SECONDS = 8 * 60;

/* ═══ LE BAR À JUS — le matériel de la mission ═════════════════════ */
const REGISTRE = [
  { id: 'bouteilles', emoji: '🧃', label: 'Bouteilles de jus', value: '4 × 1 L' },
  { id: 'verres', emoji: '🥤', label: 'Verres servis', value: '20 cL' },
  { id: 'cuve', emoji: '🛢️', label: 'Cuve graduée', value: '5 L' },
  { id: 'cube', emoji: '🧊', label: 'Cube mystère (arête)', value: '1 dm' },
];

/* ═══ LES COMPÉTENCES SUIVIES ══════════════════════════════════════ */
const SKILLS = {
  comparer: { label: 'Comparer des contenances', module: 1 },
  mesurer: { label: 'Mesurer avec un récipient gradué', module: 2 },
  unites: { label: 'Choisir la bonne unité', module: 3 },
  relations: { label: 'Relations entre les unités', module: 4 },
  convertir: { label: 'Convertir', module: 5 },
  problemes: { label: 'Problèmes et lien avec le volume', module: 6 },
};

/* ═══ LES 7 ÉPREUVES DU BOSS ═══════════════════════════════════════ */
const EPREUVES = [
  {
    id: 'contenances-boss-e1',
    skill: 'comparer',
    title: 'Épreuve 1',
    prompt: (
      <>
        Pour préparer le bar, on verse toute une bouteille dans une carafe… et la carafe{' '}
        <strong>déborde</strong>. Que peut-on en conclure ?
      </>
    ),
    type: 'mcq',
    cols: 1,
    options: [
      'La bouteille contient plus que la carafe',
      'La carafe contient plus que la bouteille',
      'Elles contiennent exactement la même chose',
    ],
    correct: 0,
    explain:
      "Si tout le contenu de la bouteille ne tient pas dans la carafe, c'est que la bouteille contient plus. Transvaser est le moyen sûr de comparer deux contenances — la forme des récipients, elle, peut tromper l'œil.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P1'] },
  },
  {
    id: 'contenances-boss-e2',
    skill: 'mesurer',
    title: 'Épreuve 2',
    prompt: (
      <>
        La cuve du bar est graduée tous les <strong className="font-mono">0,5 L</strong>. Le jus monte
        jusqu'à la 3ᵉ graduation. Quelle quantité contient-elle ?
      </>
    ),
    type: 'mcq',
    options: ['0,5 L', '1,5 L', '3 L'],
    cols: 3,
    correct: 1,
    explain:
      "Chaque graduation vaut 0,5 L : la 3ᵉ graduation correspond à 3 × 0,5 L = 1,5 L. On lit d'abord la valeur d'une graduation, puis on compte.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P2'] },
  },
  {
    id: 'contenances-boss-e3',
    skill: 'unites',
    title: 'Épreuve 3',
    prompt: (
      <>
        Sur l'affiche du bar, quelle unité choisir pour indiquer la contenance d'une{' '}
        <strong>cuillère de sirop de menthe</strong> ?
      </>
    ),
    type: 'mcq',
    options: ['mL', 'dL', 'L'],
    cols: 3,
    correct: 0,
    explain:
      "Une cuillère contient une toute petite quantité : quelques millilitres. Le litre servirait pour une bouteille, le décilitre pour un bol.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P3'] },
  },
  {
    id: 'contenances-boss-e4',
    skill: 'relations',
    title: 'Épreuve 4',
    prompt: <>Combien y a-t-il de centilitres dans <strong className="font-mono">1 litre</strong> ?</>,
    type: 'mcq',
    options: ['10 cL', '100 cL', '1 000 cL'],
    cols: 3,
    correct: 1,
    explain: '1 L = 10 dL et 1 dL = 10 cL : donc 1 L = 10 × 10 = 100 cL. (Et 1 L = 1 000 mL.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P4'] },
  },
  {
    id: 'contenances-boss-e5',
    skill: 'convertir',
    title: 'Épreuve 5',
    prompt: (
      <>
        Les 4 bouteilles de 1 L donnent <strong className="font-mono">4 L</strong> de jus. Convertis ce
        total en centilitres.
      </>
    ),
    type: 'mcq',
    options: ['40 cL', '400 cL', '4 000 cL'],
    cols: 3,
    correct: 1,
    explain:
      '1 L = 100 cL, donc 4 L = 4 × 100 = 400 cL. Le cL étant une unité plus petite que le L, le nombre devient plus grand.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P5'] },
  },
  {
    id: 'contenances-boss-e6',
    skill: 'problemes',
    title: 'Épreuve 6',
    prompt: (
      <>
        Avec <strong className="font-mono">400 cL</strong> de jus et des verres de{' '}
        <strong className="font-mono">20 cL</strong>, combien de verres complets peut-on servir ?
      </>
    ),
    type: 'mcq',
    options: ['4 verres', '20 verres', '80 verres'],
    cols: 3,
    correct: 1,
    explain:
      "400 ÷ 20 = 20 : on peut servir 20 verres. Convertir d'abord tout dans la même unité (le cL) rend la division possible.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P6'] },
  },
  {
    id: 'contenances-boss-e7',
    skill: 'problemes',
    title: 'Épreuve 7',
    prompt: (
      <>
        Le cube mystère du bar a une arête de <strong className="font-mono">1 dm</strong>. Rempli à ras
        bord, il contient exactement :
      </>
    ),
    type: 'mcq',
    options: ['1 mL', '1 L', '100 L'],
    cols: 3,
    correct: 1,
    explain:
      "Un cube de 1 dm d'arête a un volume de 1 dm³, et 1 dm³ = 1 L : c'est le lien entre volume et contenance.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_contenances_P6'] },
  },
];

/* ═══ Une épreuve — QCM silencieux : on répond, on passe, aucune réaction ═══ */
function Epreuve({ epreuve, index, pick, onPick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-slate-200 bg-white rounded-2xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-space font-bold text-slate-800">{epreuve.title}</h3>
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 text-white">
          {index + 1} / {EPREUVES.length}
        </span>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed">{epreuve.prompt}</p>

      <ChoiceGrid
        options={epreuve.options}
        selected={pick}
        onSelect={onPick}
        cols={epreuve.cols || 2}
      />
    </motion.div>
  );
}

/* ═══ Écran de correction — score, chaque question, bonne réponse et réponse donnée ═══ */
function BossReview({ answers, onContinue, onRedo }) {
  const correctCount = EPREUVES.filter((ep) => answers[ep.id] === ep.correct).length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-6 text-center space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Résultat du défi</div>
        <div className="text-3xl font-space font-extrabold">
          {correctCount} / {EPREUVES.length}
        </div>
      </div>

      <div className="space-y-4">
        {EPREUVES.map((ep, i) => {
          const pick = answers[ep.id];
          const isCorrect = pick === ep.correct;
          return (
            <div
              key={ep.id}
              className={`border-2 rounded-2xl p-5 space-y-3 ${
                isCorrect ? 'border-emerald-300 bg-emerald-50/30' : 'border-rose-300 bg-rose-50/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="font-space font-bold text-slate-800 flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                  )}
                  {ep.title}
                </h3>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 text-white">
                  {i + 1} / {EPREUVES.length}
                </span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{ep.prompt}</p>

              <div className="text-sm space-y-1">
                <div className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                  <strong>Ta réponse :</strong> {pick == null ? '(sans réponse)' : ep.options[pick]}
                </div>
                {!isCorrect && (
                  <div className="text-emerald-700">
                    <strong>Bonne réponse :</strong> {ep.options[ep.correct]}
                  </div>
                )}
              </div>

              <Feedback tone={isCorrect ? 'ok' : 'ko'}>{ep.explain}</Feedback>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl min-h-[48px]"
        >
          Voir mon profil de maîtrise <ArrowRight className="inline w-4 h-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          className="py-3 px-5 bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-500 font-bold rounded-xl min-h-[48px]"
        >
          Refaire le test
        </button>
      </div>
    </div>
  );
}

/* ═══ PHASE 2 — Profil de maîtrise ═════════════════════════════════ */
function ProfilMaitrise({ scores }) {
  const levelOf = (misses) => (misses === 0 ? 'ok' : misses === 1 ? 'mid' : 'low');

  const META = {
    ok: { dot: '🟢', label: 'Très bien maîtrisé', tone: 'border-emerald-200 bg-emerald-50' },
    mid: { dot: '🟡', label: 'Encore quelques erreurs', tone: 'border-amber-200 bg-amber-50' },
    low: { dot: '🔴', label: 'À retravailler', tone: 'border-rose-200 bg-rose-50' },
  };

  return (
    <div className="space-y-3">
      {Object.entries(SKILLS).map(([key, skill]) => {
        const misses = scores[key] ?? 0;
        const lvl = levelOf(misses);
        const meta = META[lvl];
        const target = LESSON_CONFIG.modules.find((m) => m.number === skill.module);

        return (
          <div key={key} className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 flex-wrap ${meta.tone}`}>
            <div className="flex items-center gap-3">
              <span className="text-lg" aria-hidden="true">{meta.dot}</span>
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
                Revoir le module {skill.module} <ArrowRight className="inline w-3 h-3" aria-hidden="true" />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══ PHASE 3 — Synthèse visuelle ══════════════════════════════════ */
const CAPACITES = [
  { verbe: 'COMPARER', ex: 'En transvasant — jamais à l\'œil', tone: 'bg-blue-50 border-blue-200 text-blue-800' },
  { verbe: 'MESURER', ex: 'Lire la valeur d\'une graduation, puis compter', tone: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  { verbe: 'CHOISIR', ex: 'mL pour le minuscule, L pour la bouteille', tone: 'bg-sky-50 border-sky-200 text-sky-800' },
  { verbe: 'CONSTRUIRE', ex: '1 L = 10 dL = 100 cL = 1 000 mL', tone: 'bg-cyan-50 border-cyan-200 text-cyan-800' },
  { verbe: 'CONVERTIR', ex: 'Unité plus petite → nombre plus grand', tone: 'bg-amber-50 border-amber-200 text-amber-800' },
  { verbe: 'RELIER', ex: '1 L = 1 dm³ — contenance et volume', tone: 'bg-violet-50 border-violet-200 text-violet-800' },
];

function Synthese() {
  return (
    <div className="space-y-5">
      {/* Le concept central */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Le concept central</div>
        <div className="text-2xl sm:text-3xl font-space font-extrabold">UNE CONTENANCE</div>
        <div className="text-slate-500 text-xl" aria-hidden="true">↓</div>
        <p className="text-sm text-slate-300">
          ce n'est pas la forme du récipient : c'est la <strong className="text-white">quantité de liquide</strong>{' '}
          qu'il peut contenir — et seule la mesure fait foi.
        </p>
      </div>

      {/* Les 6 capacités */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CAPACITES.map((c) => (
          <div key={c.verbe} className={`rounded-xl border-2 px-4 py-3 ${c.tone}`}>
            <div className="font-mono font-extrabold text-xs tracking-wider">{c.verbe}</div>
            <div className="text-xs sm:text-sm mt-0.5">{c.ex}</div>
          </div>
        ))}
      </div>

      {/* L'échelle des unités */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="font-space font-bold text-slate-800 text-sm">L'échelle des unités</h3>
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap">
          {['L', 'dL', 'cL', 'mL'].map((u, i) => (
            <React.Fragment key={u}>
              {i > 0 && (
                <span className="text-[10px] font-mono font-bold text-slate-400" aria-hidden="true">
                  × 10 →
                </span>
              )}
              <div className="w-14 h-14 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-mono font-extrabold text-slate-800">
                {u}
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="text-center font-mono font-bold text-slate-800 bg-slate-100 rounded-xl py-2.5 text-sm">
          1 L = 10 dL = 100 cL = 1 000 mL
        </div>
      </div>

      {/* Les deux règles à retenir */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="font-space font-bold text-amber-900 text-sm">🔁 Convertir</div>
          <p className="text-xs text-amber-900">
            Vers une unité <strong>plus petite</strong>, la même contenance demande <strong>plus</strong>{' '}
            d'unités : le nombre grandit (×10 à chaque marche). Vers une unité plus grande, il rapetisse.
          </p>
        </div>
        <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 space-y-2">
          <div className="font-space font-bold text-violet-900 text-sm">📦 Le lien avec le volume</div>
          <p className="text-xs text-violet-900">
            Un cube de <strong>1 dm d'arête</strong> (1 dm³) contient exactement <strong>1 L</strong>. La
            contenance d'un récipient, c'est le volume de liquide qu'il peut recevoir.
          </p>
        </div>
      </div>

      <Feedback tone="info">
        La forme trompe l'œil : une carafe large peut contenir moins qu'une bouteille fine. Compare toujours en
        transvasant ou en mesurant — jamais au jugé.
      </Feedback>
    </div>
  );
}

/* ═══ BADGES ═══════════════════════════════════════════════════════ */
const BADGES = [
  { id: 'transvaseur', emoji: '🏅', label: 'Maître du transvasement', test: (s) => (s.comparer ?? 0) === 0 },
  { id: 'lecteur', emoji: '🏅', label: 'Lecteur de graduations', test: (s) => (s.mesurer ?? 0) === 0 },
  { id: 'expert', emoji: '🏅', label: 'Expert des unités', test: (s) => (s.unites ?? 0) === 0 },
  { id: 'architecte', emoji: '🏅', label: 'Architecte des unités', test: (s) => (s.relations ?? 0) === 0 },
  { id: 'virtuose', emoji: '🏅', label: 'Virtuose des conversions', test: (s) => (s.convertir ?? 0) === 0 },
  { id: 'barman', emoji: '🏅', label: 'Chef du bar à jus', test: (s) => (s.problemes ?? 0) === 0 },
];

/* ═══ MODULE ═══════════════════════════════════════════════════════ */
const PHASES = [
  { key: 'boss', label: 'Boss final', Icon: Trophy },
  { key: 'profil', label: 'Mon profil', Icon: Target },
  { key: 'synthese', label: 'Synthèse', Icon: BookMarked },
];

export default function Module07LienVolumeMission() {
  const navLinks = getNavLinks(7);
  const { xp, awardXP } = useProgress(MODULE_CTX.lessonId);
  const { submitEvidence } = useEvidenceSubmission(MODULE_CTX.lessonId);
  const { attempt: savedAttempt, save: saveAttempt, redo: redoAttempt } = useFinalTestAttempt(MODULE_CTX.lessonId);
  const timer = useCountdownTimer(BOSS_TIMER_SECONDS, {
    onExpire: () => submitBoss(),
  });

  const [phase, setPhase] = useState('boss');
  const [bossAnswers, setBossAnswers] = useState({}); // épreuve id -> option index picked
  const [bossSubmitted, setBossSubmitted] = useState(false);
  const [misses, setMisses] = useState({}); // skill -> nb d'erreurs (calculé à la correction)

  // A saved attempt from a previous visit (this device or, once synced,
  // another one) always wins as soon as it loads: show the review instead
  // of a blank quiz. `hydratedFromSaved` stops this from re-firing after a
  // deliberate "Redo" clears the saved attempt.
  const hydratedFromSaved = useRef(false);

  useEffect(() => {
    if (hydratedFromSaved.current || !savedAttempt || bossSubmitted) return;
    hydratedFromSaved.current = true;

    const restoredAnswers = {};
    const restoredMisses = {};
    savedAttempt.answers.forEach((a) => {
      restoredAnswers[a.questionCode] = a.picked;
      if (!a.isCorrect) {
        const ep = EPREUVES.find((e) => e.id === a.questionCode);
        if (ep) restoredMisses[ep.skill] = (restoredMisses[ep.skill] || 0) + 1;
      }
    });
    setBossAnswers(restoredAnswers);
    setMisses(restoredMisses);
    setBossSubmitted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAttempt]);

  const bossDone = bossSubmitted;
  const allAnswered = EPREUVES.every((ep) => bossAnswers[ep.id] != null);

  function submitBoss() {
    setBossSubmitted((already) => {
      if (already) return already;

      const nextMisses = {};
      const attemptAnswers = [];
      EPREUVES.forEach((ep) => {
        const isCorrect = bossAnswers[ep.id] === ep.correct;
        submitEvidence(ep, isCorrect, { picked: bossAnswers[ep.id] ?? null });
        attemptAnswers.push({
          questionCode: ep.id,
          picked: bossAnswers[ep.id] ?? null,
          isCorrect,
          correctAnswer: ep.correct,
        });
        if (isCorrect) {
          awardXP({ moduleId: '07', exerciseId: ep.id, amount: 20 });
        } else {
          nextMisses[ep.skill] = (nextMisses[ep.skill] || 0) + 1;
        }
      });
      setMisses(nextMisses);
      timer.stop();

      const score = attemptAnswers.filter((a) => a.isCorrect).length;
      saveAttempt({ score, totalQuestions: EPREUVES.length, answers: attemptAnswers });

      return true;
    });
  }

  function redoBoss() {
    redoAttempt();
    hydratedFromSaved.current = true; // don't re-hydrate from the now-cleared saved attempt
    setPhase('boss');
    setBossAnswers({});
    setBossSubmitted(false);
    setMisses({});
    timer.setEnabled(false);
  }

  const badgesGagnes = BADGES.filter((b) => b.test(misses));
  const masterBadge = bossDone && badgesGagnes.length === BADGES.length;

  const phaseUnlocked = (key) => {
    if (key === 'boss') return true;
    return bossDone;
  };

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="🏆 Le Grand Défi des Contenances"
      moduleSubtitle="Sept épreuves, un profil de maîtrise et une synthèse — le bar à jus de l'école."
      moduleNumber={7}
      stage="evaluation"
      estimatedTime="15 min"
      xp={xp}
      prevLink={navLinks.prevLink}
      nextLink={navLinks.nextLink}
      isCompleted={bossDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Navigation des phases */}
        <div className="grid grid-cols-3 gap-2">
          {PHASES.map(({ key, label, Icon }) => {
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
                {label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ── PHASE 1 : BOSS ── */}
          {phase === 'boss' && !bossSubmitted && (
            <motion.div key="boss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <MissionBrief
                tag="🏆 Boss final"
                title="Le bar à jus de la fête de l'école ouvre dans une heure."
                tone="amber"
              >
                <p>
                  Sept épreuves pour tout vérifier : comparer, mesurer, choisir une unité, convertir et
                  résoudre. Personne ne te dira quelle compétence utiliser. Réponds à toutes les épreuves,
                  puis valide pour découvrir ta correction.
                </p>
              </MissionBrief>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <TimerToggle
                  enabled={timer.enabled}
                  onChange={(next) => {
                    timer.setEnabled(next);
                    if (next) timer.start();
                  }}
                  durationLabel="8 min"
                  disabled={Object.keys(bossAnswers).length > 0}
                />
                {timer.enabled && <TimerDisplay label={timer.label} urgent={timer.remaining <= 60} />}
              </div>

              {/* Le matériel du bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {REGISTRE.map((r) => (
                  <div key={r.id} className="rounded-xl border-2 border-slate-200 bg-white p-2.5 text-center">
                    <div className="text-lg" aria-hidden="true">{r.emoji}</div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase leading-tight">{r.label}</div>
                    <div className="font-mono font-extrabold text-sm text-slate-800 tabular-nums">{r.value}</div>
                  </div>
                ))}
              </div>

              {/* Progression */}
              <div className="flex items-center gap-2 flex-wrap">
                {EPREUVES.map((e, i) => (
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

              {EPREUVES.map((ep, i) => (
                <Epreuve
                  key={ep.id}
                  epreuve={ep}
                  index={i}
                  pick={bossAnswers[ep.id] ?? null}
                  onPick={(idx) => setBossAnswers((a) => ({ ...a, [ep.id]: idx }))}
                />
              ))}

              <ValidateButton onClick={submitBoss} disabled={!allAnswered} tone="amber">
                Valider mes 7 réponses
              </ValidateButton>
            </motion.div>
          )}

          {phase === 'boss' && bossSubmitted && (
            <motion.div key="boss-review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BossReview answers={bossAnswers} onContinue={() => setPhase('profil')} onRedo={redoBoss} />
            </motion.div>
          )}

          {/* ── PHASE 2 : PROFIL ── */}
          {phase === 'profil' && (
            <motion.div key="profil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-space font-extrabold text-slate-900">Ton profil de maîtrise</h2>
                <p className="text-sm text-slate-500">
                  Pas seulement un score : ce que tu maîtrises, et ce qui mérite encore un passage.
                </p>
              </div>

              <ProfilMaitrise scores={misses} />

              {badgesGagnes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-space font-bold text-slate-800 text-sm">Badges débloqués</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    Les badges récompensent la compréhension et la justesse du raisonnement — jamais la vitesse.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setPhase('synthese')}
                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl min-h-[48px]"
              >
                Passer à la synthèse →
              </button>
            </motion.div>
          )}

          {/* ── PHASE 3 : SYNTHÈSE ── */}
          {phase === 'synthese' && (
            <motion.div key="synthese" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <Synthese />

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl p-8 text-center space-y-3"
              >
                <div className="text-5xl" aria-hidden="true">{masterBadge ? '🏆' : '🎓'}</div>
                <div className="text-2xl font-space font-extrabold">
                  {masterBadge ? 'Maître des contenances !' : 'Leçon terminée !'}
                </div>
                <p className="text-indigo-100 text-sm leading-relaxed max-w-lg mx-auto">
                  Une contenance n'a plus de secret pour toi. Tu sais la comparer en transvasant, la mesurer, la
                  convertir et la relier au volume — du verre de sirop à la cuve du bar à jus.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {['Comparer', 'Mesurer', 'Convertir', 'Relier'].map((v) => (
                    <div key={v} className="bg-white/15 rounded-xl py-2 text-sm font-bold">
                      ✓ {v}
                    </div>
                  ))}
                </div>
                {masterBadge && (
                  <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-bold text-sm px-4 py-2 rounded-full mt-2">
                    🏆 Badge « Maître des contenances » débloqué
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModuleLayout>
  );
}
