import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import CalcChain from '../../../../../common/components/CalcChain';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/** Rappel statique des informations de l'énoncé — lecture seule dans une épreuve. */
function InfoRecap({ items }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((it) => (
        <li key={it.text} className="flex items-start gap-2 bg-white border-2 border-slate-200 rounded-xl px-3 py-2">
          <span className="shrink-0 mt-0.5" aria-hidden="true">{it.useful ? '📌' : '·'}</span>
          <span className="text-slate-700">{it.text}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Module 11 — Boss Final sur le moteur du kit partagé (QCM uniquement).
 *
 * Voir docs/architecture/LESSON_INTEGRATION_GUIDE.md §7 : ce fichier est un
 * fichier de DONNÉES — épreuves, compétences, badges, synthèse — zéro
 * logique recopiée. Le moteur `BossFinal` applique par construction la
 * forme obligatoire (silencieux jusqu'au submit global, correction, profil
 * de maîtrise, synthèse, sans 4ᵉ phase) et branche l'evidence
 * (useEvidenceSubmission) + la persistance de la tentative
 * (useFinalTestAttempt).
 *
 * La même histoire que la version précédente (« La Grande Mission » — une
 * sortie scolaire) est conservée pour son fil narratif, en particulier le
 * rebondissement de l'épreuve 1 : l'information sur les bus, écartée
 * comme inutile pour le coût des billets, redevient nécessaire à l'épreuve
 * 9 pour le transport — une information n'est « inutile » que pour UNE
 * question précise, jamais pour toujours.
 *
 * Learning points (littéraux, voir lesson.config.js) : P1 comprendre ·
 * P2 extraire · P3 modéliser · P4 stratégie · P5 étapes · P6 estimer/
 * vérifier/communiquer. Chaque LP a au moins une épreuve d'évaluation.
 */

const STAGE_INFO = [
  { text: '6 classes participent à la sortie.', useful: true },
  { text: 'Chaque classe compte 24 élèves.', useful: true },
  { text: "Un billet d'entrée coûte 4,50 €.", useful: true },
  { text: 'Chaque bus accueille 50 personnes.', useful: false },
  { text: 'Le trajet dure 45 minutes.', useful: false },
];

/* ═══ COMPÉTENCES SUIVIES ══════════════════════════════════════════ */
const SKILLS = {
  comprendre: { label: 'Comprendre la situation', module: 2 },
  extraire: { label: 'Extraire les informations', module: 3 },
  modeliser: { label: 'Modéliser', module: 4 },
  strategie: { label: 'Choisir une stratégie', module: 5 },
  uneEtape: { label: 'Problèmes à une étape', module: 6 },
  plusieursEtapes: { label: 'Problèmes à plusieurs étapes', module: 7 },
  estimerVerifier: { label: 'Estimer et vérifier', module: 8 },
  communiquer: { label: 'Communiquer une réponse', module: 9 },
  detective: { label: 'Détective des erreurs', module: 10 },
};

/* ═══ REGISTRE ══════════════════════════════════════════════════════ */
const REGISTRE = [
  { id: 'classes', emoji: '🚌', label: 'Classes', value: '6 × 24' },
  { id: 'billet', emoji: '🎟️', label: 'Billet', value: '4,50 €' },
  { id: 'photo', emoji: '📸', label: 'Option photo', value: '1/4 des élèves' },
  { id: 'bus', emoji: '🚍', label: 'Bus', value: '50 places' },
];

/* ═══ ÉPREUVES (QCM uniquement) ════════════════════════════════════ */
const EPREUVES = [
  {
    id: 'rp-e1',
    requires: ['trier-les-donnees'],
    skill: 'extraire',
    title: 'Épreuve 1',
    prompt: 'Question : quel est le coût total des billets d\'entrée pour tous les élèves ? Quelles informations te servent VRAIMENT à répondre ?',
    extra: <InfoRecap items={STAGE_INFO} />,
    options: [
      "Les 6 classes de 24 élèves, et le prix du billet (4,50 €)",
      "Les 6 classes de 24 élèves, le prix du billet, et la capacité des bus",
      'Uniquement le prix du billet',
    ],
    cols: 1,
    correct: 0,
    explain: "Le nombre de classes/élèves et le prix du billet suffisent pour un COÛT. La capacité des bus (50 places) et la durée du trajet sont de vraies informations, mais inutiles ICI.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_resolution-problemes_P2'] },
  },
  {
    id: 'rp-e2',
    requires: ['construire-avant-calculer', 'structures-de-problemes'],
    skill: 'comprendre',
    title: 'Épreuve 2',
    prompt: '6 classes de 24 élèves chacune. Combien d\'élèves participent en tout ?',
    options: ['30', '144', '620'],
    cols: 3,
    correct: 1,
    explain: '6 classes de 24 élèves, ce sont 6 groupes égaux répétés : 6 × 24 = 144.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_resolution-problemes_P1'] },
  },
  {
    id: 'rp-e3',
    requires: ['structures-de-problemes'],
    skill: 'uneEtape',
    title: 'Épreuve 3',
    prompt: '144 élèves, billet à 4,50 € chacun. Quel est le coût total des billets ?',
    options: ['148,50 €', '648 €', '6 480 €'],
    cols: 3,
    correct: 1,
    explain: '144 × 4,50 = 648 € : pense à 144 × 4 = 576, puis 144 × 0,50 = 72, soit 576 + 72 = 648.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_resolution-problemes_P5'] },
  },
  {
    id: 'rp-e4',
    requires: ['choisir-un-modele', 'structures-de-problemes'],
    skill: 'modeliser',
    title: 'Épreuve 4',
    prompt: '1/4 des 144 élèves choisissent une option photo. Quel modèle représente le mieux « 1/4 de 144 » ?',
    options: [
      'Partager 144 en 4 parts égales et en prendre une',
      'Multiplier 144 par 4',
      'Ajouter 4 à 144',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un quart, c\'est un partage en 4 parts égales : 144 ÷ 4 = 36 élèves choisissent l\'option photo.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_resolution-problemes_P3'] },
  },
  {
    id: 'rp-e5',
    requires: ['estimer-puis-controler'],
    skill: 'estimerVerifier',
    title: 'Épreuve 5',
    prompt: (
      <>
        L'option photo coûte 2 € par élève, pour 36 élèves. Avant de calculer 36 × 2, quel est le bon ordre de
        grandeur ?
      </>
    ),
    options: ['≈ 7 €', '≈ 70 €', '≈ 700 €'],
    cols: 3,
    correct: 1,
    explain: '36 ≈ 40 et 40 × 2 = 80, ou plus simplement 36 × 2 ≈ 70 : le résultat exact (72 €) est cohérent avec cette estimation.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_resolution-problemes_P6'] },
  },
  {
    id: 'rp-e6',
    requires: ['resultat-intermediaire', 'chaine-de-calcul'],
    skill: 'plusieursEtapes',
    title: 'Épreuve 6',
    prompt: 'Billets : 648 €. Option photo : 72 €. Quel est le budget total de la sortie ?',
    extra: (
      <CalcChain
        steps={[
          { label: 'Billets', expr: '144 × 4,50 €', value: '648 €' },
          { label: 'Option photo', expr: '36 × 2 €', value: '72 €' },
        ]}
      />
    ),
    options: ['576 €', '648 €', '720 €'],
    cols: 3,
    correct: 2,
    explain: 'Le budget total additionne les deux résultats intermédiaires : 648 + 72 = 720 €.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_resolution-problemes_P5'] },
  },
  {
    id: 'rp-e7',
    requires: ['plusieurs-strategies'],
    skill: 'strategie',
    title: 'Épreuve 7',
    prompt: 'Pour vérifier 144 × 4,50 sans reposer toute la multiplication, quelle stratégie est la plus efficace ?',
    options: [
      'Recompter les 144 élèves un par un',
      'Décomposer : 144 × 4 puis 144 × 0,50, et additionner',
      'Deviner un nombre qui semble raisonnable',
    ],
    cols: 1,
    correct: 1,
    explain: "Décomposer un calcul en morceaux plus simples (144 × 4 et 144 × 0,50) est une stratégie efficace et vérifiable — bien plus fiable qu'une estimation à l'œil.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_resolution-problemes_P4'] },
  },
  {
    id: 'rp-e8',
    requires: ['reponse-complete'],
    skill: 'communiquer',
    title: 'Épreuve 8',
    prompt: 'Le budget total calculé est 720. Quelle est la réponse la plus complète à la question « Quel est le budget total de la sortie ? » ?',
    options: [
      '720',
      'Le budget total de la sortie est de 720 €.',
      'Il y a 720 élèves.',
    ],
    cols: 1,
    correct: 1,
    explain: "« 720 » seul n'est pas une réponse complète : il faut le résultat, l'unité (€), et une phrase qui répond vraiment à la question.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_resolution-problemes_P6'] },
  },
  {
    id: 'rp-e9',
    requires: ['trier-les-donnees', 'interpreter-le-resultat'],
    skill: 'extraire',
    title: 'Épreuve 9 — Le rebondissement',
    prompt: (
      <>
        Souviens-toi de l'épreuve 1 : la capacité des bus (50 personnes) avait été jugée inutile pour le coût
        des billets. Maintenant, pour 144 élèves, combien de bus faut-il prévoir pour le transport ?
      </>
    ),
    options: ['2 bus', '3 bus', '4 bus'],
    cols: 3,
    correct: 1,
    explain: '144 ÷ 50 = 2 reste 44 : deux bus ne suffisent que pour 100 personnes, il en faut un troisième pour les 44 restantes. L\'information écartée à l\'épreuve 1 est redevenue utile ici : une information n\'est « inutile » que pour UNE question précise, pas pour toujours.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_resolution-problemes_P2'] },
  },
  {
    id: 'rp-e10',
    requires: ['premiere-erreur', 'reponse-complete'],
    skill: 'detective',
    title: 'Épreuve 10',
    prompt: (
      <>
        Un élève écrit : « 45 − 12 = 33. La réponse est 33 bus. » Le calcul est juste. Quelle est la première
        erreur dans ce raisonnement ?
      </>
    ),
    options: [
      "Le calcul 45 − 12 est faux",
      "L'unité est fausse : on compte des passagers, pas des bus",
      "Il n'y a aucune erreur"
    ],
    cols: 1,
    correct: 1,
    explain: 'Le calcul (45 − 12 = 33) est juste. Mais l\'unité est fausse : la question portait sur des passagers, pas sur des bus.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_resolution-problemes_P5'] },
  },
];

/* ═══ BADGES ═══════════════════════════════════════════════════════ */
const BADGES = [
  { id: 'donnees', emoji: '🏅', label: 'Détective des données', test: (s) => (s.extraire ?? 0) === 0 },
  { id: 'modeles', emoji: '🏅', label: 'Constructeur de modèles', test: (s) => (s.modeliser ?? 0) === 0 },
  { id: 'strategie', emoji: '🏅', label: 'Stratège', test: (s) => (s.strategie ?? 0) === 0 },
  { id: 'verificateur', emoji: '🏅', label: 'Vérificateur', test: (s) => (s.estimerVerifier ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Problem Solver', test: (s) => Object.values(s).every((v) => v === 0) },
];

/* ═══ SYNTHÈSE — la carte des connaissances, dans son état complet.
   Rien n'est recopié : l'élève retrouve exactement les briques qu'il a
   débloquées module après module (docs/architecture/KNOWLEDGE_MAP.md). ══ */
function Synthese() {
  return (
    <div className="space-y-5">
      <KnowledgeSnapshot complete variant="complete" />
      <Feedback tone="info">
        Le point de départ n'est jamais « quelle opération ? ». C'est toujours « qu'est-ce qui se
        passe dans cette situation ? ».
      </Feedback>
    </div>
  );
}

/* ═══ MODULE ═══════════════════════════════════════════════════════ */
export default function Module11BossFinal() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(11)}
      moduleNumber={11}
      moduleTitle="🏆 La Grande Mission"
      moduleSubtitle="Dix épreuves pour organiser la sortie scolaire de bout en bout."
      estimatedTime="11 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Organiser la sortie scolaire de fin d\'année.',
        tone: 'amber',
        body: (
          <p>
            Toutes les compétences de la leçon, dans une seule histoire continue. Personne ne te dira quel
            réflexe utiliser à chaque étape. Réponds à toutes les épreuves, puis valide pour découvrir ta
            correction et tes badges de maîtrise.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Problem Solver !',
        title: 'Leçon terminée !',
        message: (
          <>
            Tu ne cherches plus une opération au hasard : tu comprends une situation, tu la modélises, tu
            choisis une stratégie, tu calcules, tu estimes, tu vérifies, et tu communiques une réponse claire.
          </>
        ),
        verbs: ['Comprendre', 'Modéliser', 'Vérifier', 'Communiquer'],
        masterBadgeLabel: 'Badge « Problem Solver » débloqué',
      }}
      xpPerCorrect={20}
    />
  );
}
