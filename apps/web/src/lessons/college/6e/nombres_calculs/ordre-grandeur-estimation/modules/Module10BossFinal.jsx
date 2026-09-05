import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import NumberLine from '../../../../../common/components/NumberLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import ArrayGrid from '../components/ArrayGrid';
import { formatFr } from '../components/estimationUtils';

/**
 * Module 10 — Boss Final sur le moteur du kit partagé (QCM uniquement).
 *
 * Voir docs/architecture/LESSON_INTEGRATION_GUIDE.md §7 : ce fichier est un
 * fichier de DONNÉES — épreuves, compétences, badges, synthèse — zéro
 * logique recopiée. Le moteur `BossFinal` applique par construction la
 * forme obligatoire (silencieux jusqu'au submit global, correction, profil
 * de maîtrise, synthèse, sans 4ᵉ phase) et branche l'evidence
 * (useEvidenceSubmission) + la persistance de la tentative
 * (useFinalTestAttempt).
 *
 * Learning points (littéraux, voir lesson.config.js) :
 * P1 estimer · P2 arrondir · P3 somme/différence/produit · P4 détecter ·
 * P5 précision. Chaque LP a au moins une épreuve d'évaluation.
 */

/* ═══ COMPÉTENCES SUIVIES ══════════════════════════════════════════ */
const SKILLS = {
  estimer: { label: 'Estimer avant de calculer', module: 2 },
  arrondir: { label: 'Arrondir au nombre ami', module: 3 },
  somme: { label: "Ordre de grandeur d'une somme", module: 4 },
  difference: { label: "Ordre de grandeur d'une différence", module: 5 },
  produit: { label: "Ordre de grandeur d'un produit", module: 6 },
  detective: { label: 'Détecter une erreur', module: 7 },
  problemes: { label: 'Estimation dans un problème', module: 8 },
  precision: { label: 'Choisir la précision', module: 9 },
};

/* ═══ REGISTRE — les 4 réflexes travaillés ═════════════════════════ */
const REGISTRE = [
  { id: 'somme', emoji: '➕', label: 'Somme', value: '≈ 600' },
  { id: 'difference', emoji: '➖', label: 'Différence', value: '≈ 500' },
  { id: 'produit', emoji: '✖️', label: 'Produit', value: '≈ 1 000' },
  { id: 'controle', emoji: '🔎', label: 'Contrôle', value: 'plausible ?' },
];

/* ═══ ÉPREUVES (QCM uniquement) ════════════════════════════════════ */
const EPREUVES = [
  {
    id: 'oge-e1',
    skill: 'arrondir',
    title: 'Épreuve 1',
    prompt: <>Arrondi à la dizaine, <strong className="font-mono">286</strong> devient…</>,
    extra: (
      <NumberLine
        min={280}
        max={290}
        step={10}
        labelEvery={1}
        height={140}
        format={formatFr}
        markers={[{ value: 286, label: '286', color: '#7c3aed' }]}
        ariaLabel="286 entre 280 et 290"
      />
    ),
    options: ['280', '290', '300'],
    cols: 3,
    correct: 1,
    explain: '286 est à 6 de 280 mais à 4 de 290 : le nombre ami le plus proche est 290.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P2'] },
  },
  {
    id: 'oge-e2',
    skill: 'arrondir',
    title: 'Épreuve 2',
    prompt: <>Arrondi à la centaine, <strong className="font-mono">750</strong> devient…</>,
    options: ['700, car c\'est le plus petit', "800 : à égale distance, la convention arrondit au-dessus", 'On ne peut pas arrondir 750'],
    cols: 1,
    correct: 1,
    explain: '750 est pile au milieu de 700 et 800. La convention est d\'arrondir au-dessus : 750 → 800.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P2'] },
  },
  {
    id: 'oge-e3',
    skill: 'somme',
    title: 'Épreuve 3',
    prompt: <>Estime <strong className="font-mono">412 + 289</strong>.</>,
    options: ['≈ 70', '≈ 700', '≈ 7 000'],
    cols: 3,
    correct: 1,
    explain: '412 ≈ 400 et 289 ≈ 300 : 400 + 300 = 700. Le résultat exact (701) le confirme.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P3'] },
  },
  {
    id: 'oge-e4',
    skill: 'difference',
    title: 'Épreuve 4',
    prompt: <>Estime <strong className="font-mono">905 − 396</strong>.</>,
    options: ['≈ 200', '≈ 500', '≈ 1 300'],
    cols: 3,
    correct: 1,
    explain: '905 ≈ 900 et 396 ≈ 400 : 900 − 400 = 500. C\'est la distance entre les deux nombres arrondis.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P3'] },
  },
  {
    id: 'oge-e5',
    skill: 'produit',
    title: 'Épreuve 5',
    prompt: <>Estime <strong className="font-mono">31 × 39</strong>, en imaginant le rectangle.</>,
    extra: <ArrayGrid rows={30} cols={40} tone="amber" caption="30 × 40 = surface du rectangle" />,
    options: ['≈ 120', '≈ 1 200', '≈ 12 000'],
    cols: 3,
    correct: 1,
    explain: '31 ≈ 30 et 39 ≈ 40 : 30 × 40 = 1 200. La surface du rectangle donne l\'ordre de grandeur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P3'] },
  },
  {
    id: 'oge-e6',
    skill: 'detective',
    title: 'Épreuve 6',
    prompt: (
      <>
        Un élève affirme : <strong className="font-mono">298 + 512 = 1 810</strong>. Ton estimation :
        300 + 500 = 800. Ce résultat est…
      </>
    ),
    options: ['Plausible', 'Suspect', 'Impossible'],
    cols: 3,
    correct: 2,
    explain: '1 810, c\'est plus du double de l\'estimation 800 : ordre de grandeur complètement différent, résultat impossible.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P4'] },
  },
  {
    id: 'oge-e7',
    skill: 'detective',
    title: 'Épreuve 7',
    prompt: (
      <>
        Un élève affirme : <strong className="font-mono">49 × 21 = 800</strong>. Ton estimation :
        50 × 20 = 1 000. Ce résultat est…
      </>
    ),
    options: ['Plausible', 'Suspect', 'Impossible'],
    cols: 3,
    correct: 1,
    explain: '800 reste dans le même ordre de grandeur que 1 000, mais l\'écart (200) est assez net : résultat suspect, à vérifier. (Le vrai résultat est 1 029.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P4'] },
  },
  {
    id: 'oge-e8',
    skill: 'estimer',
    title: 'Épreuve 8',
    prompt: (
      <>
        Un camarade calcule <strong className="font-mono">398 + 205</strong> et annonce{' '}
        <strong className="font-mono">1 203</strong>. Sans recalculer, que peux-tu dire ?
      </>
    ),
    options: [
      'Rien : sans refaire le calcul, impossible de juger',
      'Le résultat est impossible : on attend environ 400 + 200 = 600',
    ],
    cols: 1,
    correct: 1,
    explain: 'L\'estimation 400 + 200 = 600 suffit pour juger : 1 203 est presque le double, il y a forcément une erreur. (Le résultat exact est 603.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P1'] },
  },
  {
    id: 'oge-e9',
    skill: 'problemes',
    title: 'Épreuve 9 — Problème final',
    prompt: (
      <>
        Une salle vend <strong className="font-mono">197 billets</strong> à{' '}
        <strong className="font-mono">15 €</strong> l'un. La caisse annonce un total de{' '}
        <strong className="font-mono">2 955 €</strong>. Ton verdict ?
      </>
    ),
    options: [
      'Cohérent : 197 ≈ 200 et 200 × 15 = 3 000, l\'annonce est plausible',
      'Impossible : le total devrait être environ 300 €',
      'Impossible : le total devrait être environ 30 000 €',
    ],
    cols: 1,
    correct: 0,
    explain: '197 ≈ 200, et 200 × 15 = 3 000 : l\'annonce de 2 955 € est tout à fait plausible. (C\'est même le résultat exact : 197 × 15 = 2 955.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P1'] },
  },
  {
    id: 'oge-e10',
    skill: 'precision',
    title: 'Épreuve 10',
    prompt: 'Dans laquelle de ces situations faut-il absolument une valeur EXACTE ?',
    options: [
      'Dire combien de spectateurs il y avait au match',
      'Préparer la dose d\'un médicament',
      'Prévoir la durée du trajet jusqu\'à l\'école',
    ],
    cols: 1,
    correct: 1,
    explain: 'Une dose de médicament doit être exacte : une approximation peut être dangereuse. Pour une foule ou une durée de trajet, un ordre de grandeur suffit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P5'] },
  },
];

/* ═══ BADGES ═══════════════════════════════════════════════════════ */
const BADGES = [
  { id: 'amis', emoji: '🏅', label: 'Expert des nombres amis', test: (s) => (s.arrondir ?? 0) === 0 },
  {
    id: 'grandeur',
    emoji: '🏅',
    label: "Maître de l'ordre de grandeur",
    test: (s) => (s.somme ?? 0) === 0 && (s.difference ?? 0) === 0 && (s.produit ?? 0) === 0,
  },
  {
    id: 'detective',
    emoji: '🏅',
    label: 'Détective des erreurs',
    test: (s) => (s.detective ?? 0) === 0 && (s.estimer ?? 0) === 0,
  },
  {
    id: 'terrain',
    emoji: '🏅',
    label: 'Estimateur de terrain',
    test: (s) => (s.problemes ?? 0) === 0 && (s.precision ?? 0) === 0,
  },
  { id: 'parfait', emoji: '💎', label: 'Contrôleur de résultats', test: (s) => Object.values(s).every((v) => v === 0) },
];

/* ═══ SYNTHÈSE ══════════════════════════════════════════════════════ */
function Synthese() {
  const STEPS = [
    { label: 'Nombre compliqué', v: '198 + 302' },
    { label: 'Je simplifie', v: '198 → 200, 302 → 300' },
    { label: "J'estime", v: '200 + 300 ≈ 500' },
    { label: 'Je calcule', v: '198 + 302 = 500' },
    { label: 'Je contrôle', v: '500 est cohérent avec 500 ✓' },
  ];
  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Le réflexe à automatiser</div>
        <div className="text-2xl sm:text-3xl font-space font-extrabold">ESTIMER → CALCULER → VÉRIFIER</div>
      </div>

      <div className="space-y-2">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-xl px-4 py-3">
            <span className="w-7 h-7 rounded-full bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">{s.label}</div>
              <div className="font-mono font-bold text-slate-800">{s.v}</div>
            </div>
          </div>
        ))}
      </div>

      <Feedback tone="info">
        Une estimation n'est jamais une preuve d'exactitude — c'est un CONTRÔLE. Elle permet de repérer les
        erreurs grossières avant même de vérifier le détail du calcul.
      </Feedback>
    </div>
  );
}

/* ═══ MODULE ═══════════════════════════════════════════════════════ */
export default function Module10BossFinal() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(10)}
      moduleNumber={10}
      moduleTitle="🏆 Détective des résultats"
      moduleSubtitle="Dix épreuves pour décrocher ton badge de Contrôleur de résultats."
      estimatedTime="12 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={8 * 60}
      timerLabel="8 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix épreuves. Personne ne te dira quelle compétence utiliser.',
        tone: 'amber',
        body: (
          <p>
            Arrondir, estimer une somme, une différence, un produit, juger un résultat, choisir la bonne
            précision : à toi de choisir le bon réflexe à chaque fois. Réponds à toutes les épreuves, puis
            valide pour découvrir ta correction et tes badges de maîtrise.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Contrôleur de résultats !',
        title: 'Leçon terminée !',
        message: (
          <>
            Tu as maintenant le réflexe : estimer avant de calculer, et contrôler après. C'est ce qui te
            permettra de repérer tes propres erreurs, dans toutes les leçons à venir.
          </>
        ),
        verbs: ['Estimer', 'Arrondir', 'Détecter', 'Contrôler'],
        masterBadgeLabel: 'Badge « Contrôleur de résultats » débloqué',
      }}
      xpPerCorrect={20}
    />
  );
}
