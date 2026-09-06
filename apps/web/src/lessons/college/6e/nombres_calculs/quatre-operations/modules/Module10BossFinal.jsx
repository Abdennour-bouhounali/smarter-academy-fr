import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 10 V2 — Boss Final fusionné (reconstruit sur le lesson kit).
 *
 * Fusionne les deux anciens modules d'évaluation séparés :
 *   - Module10BossFinal.jsx ("Mission Fête" — 10 calculs en saisie libre)
 *   - Module11Synthese.jsx ("Synthèse & Flash Quiz" — 5 QCM déjà formatés)
 * en UN SEUL Boss Final QCM (docs/architecture/LESSON_INTEGRATION_GUIDE.md
 * §7) : les 10 calculs en saisie libre deviennent des QCM à distracteurs
 * plausibles ; le contexte narratif "Mission Fête" (500 €, ballons, gobelets,
 * pizzas, bilan) est conservé dans les prompts/`extra` des épreuves plutôt
 * que perdu. Les 5 questions du Flash Quiz (déjà QCM) sont reprises telles
 * quelles.
 */

const SKILLS = {
  addition: { label: 'Additionner', module: 2 },
  soustraction: { label: 'Soustraire', module: 3 },
  multiplication: { label: 'Multiplier', module: 4 },
  division: { label: 'Diviser (avec reste)', module: 5 },
  posees: { label: 'Opérations posées', module: 6 },
  calculMental: { label: 'Calcul mental', module: 7 },
  choisirOutil: { label: "Choisir l'outil", module: 8 },
  problemes: { label: 'Résoudre des problèmes', module: 9 },
};

const REGISTRE = [
  { id: 'ballons', emoji: '🎈', label: 'Ballons', value: '40 × 3,25 €' },
  { id: 'gobelets', emoji: '🥤', label: 'Gobelets', value: '120 ÷ 8 tables' },
  { id: 'pizzas', emoji: '🍕', label: 'Pizzas', value: '180 élèves' },
  { id: 'budget', emoji: '💰', label: 'Budget', value: '500 €' },
];

const EPREUVES = [
  // ── Issues de "Mission Fête" (saisie libre → QCM à distracteurs plausibles) ──
  {
    id: 'boss-ballons',
    requires: ['facteurs-produit', 'decomposer-produit'],
    skill: 'multiplication',
    title: '🎈 Les ballons',
    prompt: 'Tu commandes 40 paquets de ballons à 3,25 € chacun. Quel est le coût total ?',
    options: ['130,00 €', '120,00 €', '43,25 €', '133,00 €'],
    cols: 2,
    correct: 0,
    explain: '40 × 3,25 = 40 × 3 + 40 × 0,25 = 120 + 10 = 130 €.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P1'] },
  },
  {
    id: 'boss-gobelets',
    requires: ['partage-groupement', 'quotient'],
    skill: 'division',
    title: '🥤 Les gobelets',
    prompt: 'Il y a 120 gobelets à répartir équitablement sur 8 tables. Combien de gobelets par table ?',
    options: ['15', '14', '8', '112'],
    cols: 4,
    correct: 0,
    explain: '8 × 15 = 120 (8×10=80 et 8×5=40, 80+40=120) : 15 gobelets par table.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P1'] },
  },
  {
    id: 'boss-pizzas-1',
    requires: ['facteurs-produit'],
    skill: 'multiplication',
    title: '🍕 Les pizzas (1/2)',
    prompt: '180 élèves viennent à la fête. On a déjà commandé 6 pizzas de 8 parts chacune. Combien de parts cela fait-il ?',
    options: ['48', '24', '14', '180'],
    cols: 4,
    correct: 0,
    explain: '6 × 8 = 48 parts déjà disponibles.',
  },
  {
    id: 'boss-pizzas-2',
    requires: ['quotient', 'sens-du-reste'],
    skill: 'problemes',
    title: '🍕 Les pizzas (2/2)',
    prompt: 'Avec 48 parts disponibles pour 180 élèves, il manque 180 − 48 = 132 parts. Sachant que 132 ÷ 8 = 16 reste 4, combien de pizzas supplémentaires faut-il commander ?',
    options: [
      '17 pizzas (16 pleines + 1 pour les 4 parts restantes)',
      '16 pizzas (le quotient suffit)',
      '132 pizzas',
      '4 pizzas (juste le reste)',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le quotient 16 ne couvre pas les 4 parts du reste : ces élèves n’auraient pas de pizza. Il faut donc une pizza de plus : 16 + 1 = 17.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P5', '6e_quatre-operations_P6'] },
  },
  {
    id: 'boss-budget-1',
    requires: ['facteurs-produit', 'decomposer-produit'],
    skill: 'multiplication',
    title: '💰 Le bilan (1/2)',
    prompt: 'Les 17 pizzas supplémentaires coûtent 12 € chacune. Quel est leur coût total ?',
    options: ['204 €', '196 €', '17 €', '212 €'],
    cols: 2,
    correct: 0,
    explain: '17 × 12 = 17 × 10 + 17 × 2 = 170 + 34 = 204 €.',
  },
  {
    id: 'boss-budget-2',
    requires: ['difference', 'echange-emprunt'],
    skill: 'soustraction',
    title: '💰 Le bilan (2/2)',
    prompt: 'Dépenses totales : 130 € (ballons) + 204 € (pizzas) = 334 €. Le budget de départ est 500 €. Quel est le budget restant ?',
    options: ['166 €', '176 €', '234 €', '164 €'],
    cols: 2,
    correct: 0,
    explain: '500 − 334 = 166 € de budget restant.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P2'] },
  },
  // ── Reprises du Flash Quiz (déjà QCM) ──
  {
    id: 'quatre-operations-flash-01',
    requires: ['quotient'],
    skill: 'division',
    prompt: 'Dans 45 ÷ 8 = 5 reste 5, quel est le quotient ?',
    options: ['45', '8', '5', '0'],
    cols: 4,
    correct: 2,
    explain: 'Le quotient est le résultat entier de la division : 5. (Le reste est aussi 5, mais ce sont deux valeurs différentes.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P5'] },
  },
  {
    id: 'quatre-operations-flash-02',
    requires: ['quatre-situations', 'facteurs-produit'],
    skill: 'addition',
    prompt: 'Laquelle de ces situations correspond à une multiplication ?',
    options: [
      "Taille d'une classe : 28 élèves. On en retire 5.",
      '6 rangées de 7 chaises = ?',
      'Distance de Paris à Lyon : 465 km. On a parcouru 230 km. Il reste ?',
      'On partage 36 bonbons entre 4 amis.',
    ],
    cols: 1,
    correct: 1,
    explain: '6 rangées × 7 chaises = groupes égaux → multiplication.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P1'] },
  },
  {
    id: 'quatre-operations-flash-03',
    requires: ['quotient', 'egalite-euclidienne'],
    skill: 'division',
    prompt: '17 pizzas = 5 × q + r. Si 5 × 3 = 15 et 17 − 15 = 2, que vaut q ?',
    options: ['17', '5', '3', '2'],
    cols: 4,
    correct: 2,
    explain: 'q est le quotient : 17 ÷ 5 = 3 reste 2.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P5'] },
  },
  {
    id: 'quatre-operations-flash-04',
    requires: ['strategies-mentales'],
    skill: 'calculMental',
    prompt: 'Pour 7 + 9, quelle stratégie de calcul mental est la plus rapide ?',
    options: ['Poser le calcul', '7 + 10 − 1 = 16', 'Estimer à 15', 'Calculer 7 + 9 = 7 + 7 + 2'],
    cols: 2,
    correct: 1,
    explain: '+9 = +10 − 1 → 7 + 10 − 1 = 16. Très rapide !',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P3', '6e_quatre-operations_P4'] },
  },
  {
    id: 'quatre-operations-flash-05',
    requires: ['quotient', 'sens-du-reste'],
    skill: 'problemes',
    prompt: '31 enfants dans 5 groupes. Quel est le nombre de groupes complets ?',
    options: ['31', '5', '6', '1'],
    cols: 4,
    correct: 2,
    explain: '31 ÷ 5 = 6 reste 1 → 6 groupes complets (et 1 enfant en plus).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_quatre-operations_P5', '6e_quatre-operations_P6'] },
  },
  // ── Couverture supplémentaire : opérations posées / choix de l'outil ──
  {
    id: 'boss-posees',
    requires: ['aligner-les-rangs', 'retenue'],
    skill: 'posees',
    prompt: '247 + 158, posé en colonnes. Aux unités, 7 + 8 = 15. Que fait-on ?',
    options: [
      "On écrit 5 et on retient 1 pour les dizaines",
      'On écrit 15 directement',
      'On écrit 1 et on retient 5',
      "On ignore la retenue",
    ],
    cols: 1,
    correct: 0,
    explain: '7 + 8 = 15 = 1 dizaine + 5 unités : on écrit 5 et on reporte la retenue de 1 dans la colonne des dizaines.',
  },
  {
    id: 'boss-outil',
    requires: ['choisir-outil'],
    skill: 'choisirOutil',
    prompt: 'Pour calculer 398 + 487 (grands nombres, retenues multiples), quel outil est le plus sûr ?',
    options: ['Calcul mental', 'Calcul posé', 'Estimation seule', 'Deviner'],
    cols: 2,
    correct: 1,
    explain: 'Trois chiffres avec retenues multiples : le calcul posé évite les erreurs que le calcul mental risquerait de provoquer.',
  },
];

const BADGES = [
  { id: 'addition', emoji: '🏅', label: 'Maître de l’addition', test: (s) => (s.addition ?? 0) === 0 },
  { id: 'soustraction', emoji: '🏅', label: 'Maître de la soustraction', test: (s) => (s.soustraction ?? 0) === 0 },
  { id: 'multiplication', emoji: '🏅', label: 'Maître de la multiplication', test: (s) => (s.multiplication ?? 0) === 0 },
  { id: 'division', emoji: '🏅', label: 'Maître de la division', test: (s) => (s.division ?? 0) === 0 },
  { id: 'strategie', emoji: '🏅', label: 'Stratège du calcul', test: (s) => (s.calculMental ?? 0) === 0 && (s.choisirOutil ?? 0) === 0 },
  { id: 'probleme', emoji: '🏅', label: 'Résolveur de problèmes', test: (s) => (s.problemes ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Organisateur parfait', test: (s) => Object.values(s).every((v) => v === 0) },
];

/* ── La synthèse EST la carte des connaissances, dans son état complet :
   rien n'est recopié, l'élève retrouve exactement les briques qu'il a
   débloquées module après module (docs/architecture/KNOWLEDGE_MAP.md). ── */
function Synthese() {
  return (
    <div className="space-y-4">
      <KnowledgeSnapshot complete variant="complete" />
      <Feedback tone="info">
        🧮 Quatre opérations, un seul réflexe : comprendre la situation avant de choisir
        l'opération et l'outil de calcul.
      </Feedback>
    </div>
  );
}

export default function Module10BossFinal() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(10)}
      moduleNumber={10}
      moduleTitle="🏆 Boss Final : Mission Fête"
      moduleSubtitle="Organise l'événement scolaire en mobilisant les quatre opérations."
      estimatedTime="13 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={12 * 60}
      timerLabel="12 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Mission : Organiser la fête du collège',
        tone: 'amber',
        body: (
          <p>
            Budget total : <strong className="text-white">500 €</strong>. Treize épreuves pour tout vérifier :
            addition, soustraction, multiplication, division, calcul mental et choix de l'outil. Réponds à
            toutes les épreuves, puis valide pour découvrir ta correction et tes badges de maîtrise.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Organisateur parfait !',
        title: 'Mission accomplie !',
        message: (
          <>
            Tu maîtrises les quatre opérations fondamentales : leur sens, leurs algorithmes, leurs stratégies et
            leur utilisation dans des problèmes réels.
            <strong className="block mt-2 text-white">💡 Le réflexe à garder : comprendre la situation avant de calculer.</strong>
          </>
        ),
        verbs: ['Additionner', 'Soustraire', 'Multiplier', 'Diviser'],
        masterBadgeLabel: 'Badge « Organisateur parfait » débloqué',
      }}
      xpPerCorrect={15}
    />
  );
}
