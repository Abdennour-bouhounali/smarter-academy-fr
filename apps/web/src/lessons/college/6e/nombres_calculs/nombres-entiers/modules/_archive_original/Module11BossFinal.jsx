import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Target, BookMarked, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { useEvidenceSubmission } from '../../../../../common/hooks/useEvidenceSubmission';
import { useCountdownTimer } from '../../../../../common/hooks/useCountdownTimer';
import { useFinalTestAttempt } from '../../../../../common/hooks/useFinalTestAttempt';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import PlaceValueTable from '../components/PlaceValueTable';
import NumberLine from '../../../../../common/components/NumberLine';
import { Feedback, ChoiceGrid, ValidateButton, MissionBrief, TimerToggle, TimerDisplay } from '../../../../../common/components/LessonUI';
import { formatFr, texFr, decompose } from '../components/numberUtils';

const BOSS_TIMER_SECONDS = 10 * 60;

/* ═══ LE REGISTRE — les nombres de la mission ═══════════════════════ */
const REGISTRE = [
  { id: 'ville', emoji: '🏙️', label: 'Habitants de la ville', value: 105300 },
  { id: 'visiteurs', emoji: '🎟️', label: 'Visiteurs du musée', value: 105030 },
  { id: 'score', emoji: '🎮', label: 'Meilleur score du tournoi', value: 48275 },
  { id: 'distance', emoji: '🚴', label: 'Distance du raid (km)', value: 2450 },
  { id: 'livres', emoji: '📚', label: 'Livres de la médiathèque', value: 12450 },
  { id: 'prix', emoji: '💶', label: 'Budget du matériel (€)', value: 8099 },
  { id: 'cahiers', emoji: '📒', label: 'Cahiers en stock', value: 6307 },
];

/* ═══ LES COMPÉTENCES SUIVIES ══════════════════════════════════════ */
const SKILLS = {
  lecture: { label: 'Lecture et écriture', module: 3 },
  position: { label: 'Valeur de position', module: 4 },
  decomposition: { label: 'Décomposition', module: 5 },
  comparaison: { label: 'Comparaison', module: 6 },
  rangement: { label: 'Rangement et encadrement', module: 7 },
  droite: { label: 'Droite graduée', module: 8 },
  problemes: { label: 'Problèmes', module: 10 },
};

/* ═══ LES 7 ÉPREUVES DU BOSS ═══════════════════════════════════════ */
const EPREUVES = [
  {
    id: 'nombres-entiers-boss-e1',
    skill: 'lecture',
    title: 'Épreuve 1',
    prompt: (
      <>
        Une fiche du registre porte la mention manuscrite{' '}
        <em>« quarante-huit mille deux cent soixante-quinze »</em>. De quelle fiche s'agit-il ?
      </>
    ),
    type: 'mcq',
    options: ['105 300', '48 275', '12 450', '8 099'],
    correct: 1,
    explain:
      "« quarante-huit mille » → 48 dans la classe des mille ; « deux cent soixante-quinze » → 275 dans la classe des unités. Donc 48 275.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P2'] },
  },
  {
    id: 'nombres-entiers-boss-e2',
    skill: 'position',
    title: 'Épreuve 2',
    prompt: (
      <>
        Dans le nombre d'habitants <strong className="font-mono">105 300</strong>, que représente le chiffre{' '}
        <strong className="font-mono">5</strong> ?
      </>
    ),
    type: 'mcq',
    options: ['5', '500', '5 000', '50 000'],
    correct: 2,
    explain:
      '105 300 se lit 105 | 300. Le 5 occupe la colonne des milliers : il représente 5 milliers, soit 5 000.',
    table: 105300,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P3'] },
  },
  {
    id: 'nombres-entiers-boss-e3',
    skill: 'decomposition',
    title: 'Épreuve 3',
    prompt: (
      <>
        Quelle est la décomposition correcte du stock de cahiers,{' '}
        <strong className="font-mono">6 307</strong> ?
      </>
    ),
    type: 'mcq',
    options: ['6 000 + 300 + 7', '6 000 + 30 + 7', '600 + 30 + 7', '6 000 + 300 + 70'],
    correct: 0,
    explain:
      '6 307 = 6 milliers + 3 centaines + 0 dizaine + 7 unités, soit 6 000 + 300 + 7. La dizaine vide ne s\'écrit pas dans la somme, mais le 0 reste indispensable dans le nombre.',
    // Recomposing 6 307 from its place-value parts is the written analogue
    // of building it with base-10 blocks (module 1's manipulation) — this
    // question also certifies 6e_nombres-entiers_P1.
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P4', '6e_nombres-entiers_P1'] },
  },
  {
    id: 'nombres-entiers-boss-e4',
    skill: 'comparaison',
    title: 'Épreuve 4',
    prompt: (
      <>
        Deux fiches se ressemblent : <strong className="font-mono">105 300</strong> habitants et{' '}
        <strong className="font-mono">105 030</strong> visiteurs. Quelle comparaison est correcte ?
      </>
    ),
    type: 'mcq',
    options: ['105 300 < 105 030', '105 300 = 105 030', '105 300 > 105 030'],
    correct: 2,
    cols: 3,
    explain:
      'Les deux nombres ont 6 chiffres et commencent pareil : 1, 0, 5. La première différence est à la position des centaines : 3 contre 0. Donc 105 300 > 105 030.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P5'] },
  },
  {
    id: 'nombres-entiers-boss-e5',
    skill: 'rangement',
    title: 'Épreuve 5',
    prompt: <>Range quatre fiches du registre dans l'ordre croissant : 8 099 ; 2 450 ; 12 450 ; 6 307.</>,
    type: 'mcq',
    cols: 1,
    options: [
      '2 450 < 6 307 < 8 099 < 12 450',
      '12 450 < 8 099 < 6 307 < 2 450',
      '2 450 < 8 099 < 6 307 < 12 450',
      '6 307 < 2 450 < 12 450 < 8 099',
    ],
    correct: 0,
    explain:
      "2 450 < 6 307 < 8 099 < 12 450. Seul 12 450 a 5 chiffres : il est forcément le plus grand. Les trois autres se départagent par le chiffre des milliers.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P5'] },
  },
  {
    id: 'nombres-entiers-boss-e6',
    skill: 'droite',
    title: 'Épreuve 6',
    prompt: (
      <>
        Sur une demi-droite graduée de 6 000 à 7 000 avec un pas de 100, sur quelle graduation se place
        pratiquement le stock de cahiers, <strong className="font-mono">6 307</strong> ?
      </>
    ),
    type: 'mcq',
    options: ['6 000', '6 300', '6 700', '7 000'],
    correct: 1,
    table: 6307,
    explain:
      "Avec un pas de 100, 6 307 se place pratiquement sur la graduation 6 300 (il n'en est qu'à 7 unités). On lit d'abord le pas, puis on compte les graduations.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P6'] },
  },
  {
    id: 'nombres-entiers-boss-e7',
    skill: 'problemes',
    title: 'Épreuve 7',
    prompt: (
      <>
        Le maire déclare : <em>« Notre ville a dépassé les 100 000 habitants, et le musée a accueilli plus de
        visiteurs que nous n'avons d'habitants. »</em> Que dit le registre ?
      </>
    ),
    type: 'mcq',
    options: [
      'Les deux affirmations sont vraies',
      'La première est vraie, la seconde est fausse',
      'La première est fausse, la seconde est vraie',
      'Les deux affirmations sont fausses',
    ],
    correct: 1,
    explain:
      '105 300 > 100 000 : la ville a bien dépassé les 100 000 habitants. En revanche 105 030 < 105 300 : le musée a accueilli MOINS de visiteurs que la ville ne compte d\'habitants. La seconde affirmation est donc fausse.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P7'] },
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

      {epreuve.table && (
        <div className="bg-white border border-slate-200 rounded-xl p-2">
          <PlaceValueTable value={epreuve.table} compact />
        </div>
      )}

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
                  <strong>Ta réponse :</strong>{' '}
                  {pick == null ? '(sans réponse)' : ep.options[pick]}
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
  { verbe: 'LIRE', ex: '4 582 → « quatre mille cinq cent quatre-vingt-deux »', tone: 'bg-blue-50 border-blue-200 text-blue-800' },
  { verbe: 'ÉCRIRE', ex: '« trois mille quatre cent sept » → 3 407', tone: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  { verbe: 'DÉCOMPOSER', ex: '4 582 = 4 000 + 500 + 80 + 2', tone: 'bg-sky-50 border-sky-200 text-sky-800' },
  { verbe: 'RECOMPOSER', ex: '6 000 + 20 + 5 = 6 025', tone: 'bg-cyan-50 border-cyan-200 text-cyan-800' },
  { verbe: 'COMPARER', ex: '4 582 > 4 527', tone: 'bg-amber-50 border-amber-200 text-amber-800' },
  { verbe: 'RANGER', ex: '3 999 < 4 250 < 4 502', tone: 'bg-rose-50 border-rose-200 text-rose-800' },
  { verbe: 'REPÉRER', ex: '4 582 entre 4 500 et 4 600', tone: 'bg-violet-50 border-violet-200 text-violet-800' },
];

function Synthese() {
  return (
    <div className="space-y-5">
      {/* Le concept central */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Le concept central</div>
        <div className="text-2xl sm:text-3xl font-space font-extrabold">UN NOMBRE ENTIER</div>
        <div className="text-slate-500 text-xl" aria-hidden="true">↓</div>
        <p className="text-sm text-slate-300">
          ce n'est pas une suite de chiffres : c'est une <strong className="text-white">quantité</strong> écrite
          grâce à des <strong className="text-white">positions</strong>.
        </p>
      </div>

      {/* Les 7 capacités */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CAPACITES.map((c) => (
          <div key={c.verbe} className={`rounded-xl border-2 px-4 py-3 ${c.tone}`}>
            <div className="font-mono font-extrabold text-xs tracking-wider">{c.verbe}</div>
            <div className="text-xs sm:text-sm font-mono mt-0.5 tabular-nums">{c.ex}</div>
          </div>
        ))}
      </div>

      {/* Le tableau de numération */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="font-space font-bold text-slate-800 text-sm">Le tableau de numération — 4 582</h3>
        <PlaceValueTable value={4582} showValues />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {[
            ['4 milliers', '4 000'],
            ['5 centaines', '500'],
            ['8 dizaines', '80'],
            ['2 unités', '2'],
          ].map(([a, b]) => (
            <div key={a} className="bg-slate-50 rounded-xl px-2 py-2 border border-slate-200">
              <div className="text-[11px] font-mono text-slate-500">{a}</div>
              <div className="font-mono font-bold text-slate-800">{b}</div>
            </div>
          ))}
        </div>
        <div className="text-center font-mono font-bold text-slate-800 bg-slate-100 rounded-xl py-2.5">
          <MathText>{`$${texFr(4582)} = ${decompose(4582).map(texFr).join(' + ')}$`}</MathText>
        </div>
      </div>

      {/* Les deux règles à retenir */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="font-space font-bold text-amber-900 text-sm">⚖️ Comparer</div>
          <ol className="text-xs text-amber-900 space-y-1 list-decimal list-inside">
            <li>Compte les chiffres : le plus long gagne.</li>
            <li>À égalité, compare position par position en partant de la gauche.</li>
            <li>Arrête-toi à la première différence.</li>
          </ol>
        </div>
        <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 space-y-2">
          <div className="font-space font-bold text-violet-900 text-sm">📏 Repérer</div>
          <p className="text-xs text-violet-900">
            Sur la demi-droite graduée, on lit d'abord <strong>le pas</strong>, puis on compte les graduations.
            <strong> Plus on va vers la droite, plus le nombre est grand.</strong>
          </p>
          <NumberLine min={0} max={5} step={1} labelEvery={1} height={110} ariaLabel="Demi-droite graduée de 0 à 5" />
        </div>
      </div>

      <Feedback tone="info">
        Et le zéro ? Il ne se dit pas, mais il <strong>tient une place</strong> : sans lui, 4 005 deviendrait 45.
      </Feedback>
    </div>
  );
}

/* ═══ BADGES ═══════════════════════════════════════════════════════ */
const BADGES = [
  { id: 'decodeur', emoji: '🏅', label: 'Décodeur des nombres', test: (s) => (s.lecture ?? 0) === 0 },
  { id: 'position', emoji: '🏅', label: 'Maître de la valeur de position', test: (s) => (s.position ?? 0) === 0 },
  { id: 'architecte', emoji: '🏅', label: 'Architecte des nombres', test: (s) => (s.decomposition ?? 0) === 0 },
  {
    id: 'detective',
    emoji: '🏅',
    label: 'Détective des comparaisons',
    test: (s) => (s.comparaison ?? 0) === 0 && (s.rangement ?? 0) === 0,
  },
  { id: 'explorateur', emoji: '🏅', label: 'Explorateur de la droite graduée', test: (s) => (s.droite ?? 0) === 0 },
];

/* ═══ MODULE ═══════════════════════════════════════════════════════ */
const PHASES = [
  { key: 'boss', label: 'Boss final', Icon: Trophy },
  { key: 'profil', label: 'Mon profil', Icon: Target },
  { key: 'synthese', label: 'Synthèse', Icon: BookMarked },
];

export default function Module11BossFinal() {
  const navLinks = getNavLinks(11);
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
          awardXP({ moduleId: '11', exerciseId: ep.id, amount: 20 });
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
      moduleTitle="🏆 Le Grand Défi des Nombres"
      moduleSubtitle="Sept épreuves, un profil de maîtrise et une synthèse."
      moduleNumber={11}
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
                title="Le registre de fin d'année du collège vient d'être retrouvé."
                tone="amber"
              >
                <p>
                  Sept fiches, sept épreuves. À toi de décider, à chaque fois, ce qu'il faut faire : lire,
                  décomposer, comparer, ranger, repérer ou interpréter. Personne ne te dira quelle compétence
                  utiliser. Réponds à toutes les épreuves, puis valide pour découvrir ta correction.
                </p>
              </MissionBrief>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <TimerToggle
                  enabled={timer.enabled}
                  onChange={(next) => {
                    timer.setEnabled(next);
                    if (next) timer.start();
                  }}
                  durationLabel="10 min"
                  disabled={Object.keys(bossAnswers).length > 0}
                />
                {timer.enabled && <TimerDisplay label={timer.label} urgent={timer.remaining <= 60} />}
              </div>

              {/* Le registre */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {REGISTRE.map((r) => (
                  <div key={r.id} className="rounded-xl border-2 border-slate-200 bg-white p-2.5 text-center">
                    <div className="text-lg" aria-hidden="true">{r.emoji}</div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase leading-tight">{r.label}</div>
                    <div className="font-mono font-extrabold text-sm text-slate-800 tabular-nums">
                      {formatFr(r.value)}
                    </div>
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
                  {masterBadge ? 'Maître des nombres entiers !' : 'Leçon terminée !'}
                </div>
                <p className="text-indigo-100 text-sm leading-relaxed max-w-lg mx-auto">
                  Un grand nombre n'est plus une suite de chiffres pour toi. Tu sais ce que représente chaque
                  chiffre, tu peux construire un nombre, le décomposer, le comparer, le ranger, le placer — et
                  t'en servir pour comprendre le monde.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  {['Lire', 'Décomposer', 'Comparer', 'Repérer'].map((v) => (
                    <div key={v} className="bg-white/15 rounded-xl py-2 text-sm font-bold">
                      ✓ {v}
                    </div>
                  ))}
                </div>
                {masterBadge && (
                  <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-bold text-sm px-4 py-2 rounded-full mt-2">
                    🏆 Badge « Maître des nombres entiers » débloqué
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
