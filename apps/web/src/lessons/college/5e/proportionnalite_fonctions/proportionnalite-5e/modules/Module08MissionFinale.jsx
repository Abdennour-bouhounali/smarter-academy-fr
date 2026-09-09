import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les valeurs des
 * modules. Les contextes changent (peinture, photocopies, randonnée, recette)
 * et chaque distracteur encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   — conclure « proportionnel » parce que ça augmente (M1) ;
 *   — chercher un coefficient là où il n'y en a pas (M2) ;
 *   — appliquer la linéarité additive dans un tableau (M3) ;
 *   — oublier la conversion d'unité après l'échelle (M4) ;
 *   — multiplier par 0,30 au lieu de 0,70 pour une remise de 30 % (M5) ;
 *   — conclure « proportionnel » sur des points alignés hors origine (M6) ;
 *   — multiplier au lieu de diviser pour une vitesse (M7).
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 7 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool — un objet y provoquerait
 * « b.test is not a function » au montage.
 */
const SKILLS = {
  reconnaitre: { label: 'Reconnaître', emoji: '🔍', module: 1 },
  coefficient: { label: 'Le coefficient', emoji: '⚖️', module: 2 },
  tableau: { label: 'Le tableau', emoji: '📋', module: 3 },
  echelle: { label: 'L’échelle', emoji: '🗺️', module: 4 },
  pourcentage: { label: 'Les pourcentages', emoji: '🏷️', module: 5 },
  graphique: { label: 'Le graphique', emoji: '📈', module: 6 },
  vitesse: { label: 'La vitesse', emoji: '🚌', module: 7 },
};

const BADGES = [
  { id: 'b-reconnaitre', emoji: '🔍', label: 'Œil qui trie', test: (m) => !m.reconnaitre },
  { id: 'b-coefficient', emoji: '⚖️', label: 'Chasseur de coefficient', test: (m) => !m.coefficient },
  { id: 'b-tableau', emoji: '📋', label: 'Maître du tableau', test: (m) => !m.tableau },
  { id: 'b-pourcentage', emoji: '🏷️', label: 'Roi des soldes', test: (m) => !m.pourcentage },
  { id: 'b-graphique', emoji: '📈', label: 'Lecteur de droites', test: (m) => !m.graphique },
  { id: 'b-parfait', emoji: '💎', label: 'Proportion parfaite', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'prop5-e1',
    skill: 'reconnaitre',
    title: 'Le abonnement de la salle',
    prompt:
      'Une salle d’escalade demande 15 € d’inscription, puis 8 € par séance. Le prix total est-il proportionnel au nombre de séances ?',
    options: [
      'Non : 2 séances ne coûtent pas le double d’1 séance',
      'Oui : plus il y a de séances, plus c’est cher',
      'Oui : chaque séance coûte le même prix',
      'On ne peut pas savoir',
    ],
    cols: 1,
    requires: ['proportionnalite', 'grandeurs-liees'],
    explain:
      '1 séance coûte 15 + 8 = 23 €, et 2 séances coûtent 15 + 16 = 31 €. Le double de 23 serait 46. L’inscription ne se paie qu’une fois : la situation n’est pas proportionnelle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_proportionnalite-5e_P1'] },
  },
  {
    id: 'prop5-e2',
    skill: 'coefficient',
    title: 'La peinture',
    prompt: 'Avec 3 L de peinture, on couvre 36 m². Quel est le coefficient de proportionnalité, en m² par litre ?',
    options: ['12', '108', '33', '0,083'],
    cols: 4,
    requires: ['coefficient-proportionnalite'],
    explain:
      'Le coefficient est la valeur pour UNE unité : 36 ÷ 3 = 12 m² par litre. (108 vient d’une multiplication, 33 d’une soustraction.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_proportionnalite-5e_P2'] },
  },
  {
    id: 'prop5-e3',
    skill: 'coefficient',
    title: 'Retour en arrière',
    prompt: 'Cette même peinture couvre 12 m² par litre. Combien faut-il de litres pour couvrir 96 m² ?',
    options: ['8 L', '1 152 L', '84 L', '12 L'],
    cols: 4,
    requires: ['coefficient-proportionnalite'],
    explain:
      'On connaît la surface et on cherche la peinture : c’est le trajet inverse, donc une division. 96 ÷ 12 = 8 L.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_proportionnalite-5e_P2'] },
  },
  {
    id: 'prop5-e4',
    skill: 'tableau',
    title: 'Les photocopies',
    prompt: '8 photocopies coûtent 1,20 €. Combien coûtent 20 photocopies ?',
    options: ['3 €', '1,32 €', '2,40 €', '13,20 €'],
    cols: 4,
    requires: ['tableau-proportionnalite', 'coefficient-proportionnalite'],
    explain:
      'Par l’unité : 1,20 ÷ 8 = 0,15 € la photocopie, puis 0,15 × 20 = 3 €. (1,32 € reviendrait à ajouter 12 centimes, c’est-à-dire à additionner au lieu de multiplier.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_proportionnalite-5e_P3'] },
  },
  {
    id: 'prop5-e5',
    skill: 'tableau',
    title: 'La recette de crêpes',
    prompt:
      'Pour 6 crêpes il faut 300 g de farine. Combien de farine pour 15 crêpes ?',
    options: ['750 g', '309 g', '600 g', '450 g'],
    cols: 4,
    requires: ['tableau-proportionnalite'],
    explain:
      'Par l’unité : 300 ÷ 6 = 50 g par crêpe, puis 50 × 15 = 750 g. (309 g reviendrait à ajouter 9 — l’erreur de l’addition ; 600 g à doubler, alors que 15 n’est pas le double de 6.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_proportionnalite-5e_P3'] },
  },
  {
    id: 'prop5-e6',
    skill: 'echelle',
    title: 'La carte de randonnée',
    prompt:
      'Sur une carte au 1/50 000, deux refuges sont distants de 8 cm. Quelle est la distance réelle ?',
    options: ['4 km', '400 km', '40 km', '0,4 km'],
    cols: 4,
    requires: ['echelle'],
    explain:
      '8 × 50 000 = 400 000 cm. On convertit : 400 000 cm = 4 000 m = 4 km. Oublier la conversion donnerait 400 — le résultat de la multiplication est en centimètres.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_proportionnalite-5e_P4'] },
  },
  {
    id: 'prop5-e7',
    skill: 'pourcentage',
    title: 'La veste soldée',
    prompt: 'Une veste coûte 80 €. Elle est soldée à −30 %. Combien la paie-t-on ?',
    options: ['56 €', '24 €', '50 €', '77 €'],
    cols: 4,
    requires: ['remise', 'pourcentage'],
    explain:
      'Après une remise de 30 %, il reste 70 % du prix : 80 × 0,70 = 56 €. (24 € est la réduction — c’est 80 × 0,30 —, pas le prix à payer.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_proportionnalite-5e_P5'] },
  },
  {
    id: 'prop5-e8',
    skill: 'pourcentage',
    title: 'Les inscrits',
    prompt: 'Sur 250 élèves du collège, 40 % sont inscrits à la sortie. Combien d’élèves cela fait-il ?',
    options: ['100', '40', '210', '625'],
    cols: 4,
    requires: ['pourcentage'],
    explain:
      'Prendre 40 %, c’est multiplier par 0,40 : 250 × 0,40 = 100 élèves. (40 est le taux, pas un nombre d’élèves ; 210 serait le nombre de NON-inscrits.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_proportionnalite-5e_P5'] },
  },
  {
    id: 'prop5-e9',
    skill: 'graphique',
    title: 'Deux graphiques',
    prompt:
      'Sur un graphique, les points d’une situation sont parfaitement alignés, mais la droite coupe l’axe vertical à 12 et non à 0. Que peut-on dire ?',
    options: [
      'La situation n’est pas proportionnelle',
      'Elle est proportionnelle, puisque les points sont alignés',
      'Elle est proportionnelle, de coefficient 12',
      'On ne peut rien dire sans le tableau',
    ],
    cols: 1,
    requires: ['graphique-proportionnalite'],
    explain:
      'L’alignement ne suffit pas : il faut aussi que la droite passe par l’origine. Ici, il y a déjà 12 pour une entrée nulle — comme la carte de la piscine.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_proportionnalite-5e_P7', '5e_proportionnalite-5e_P1'] },
  },
  {
    id: 'prop5-e10',
    skill: 'vitesse',
    title: 'Le train',
    prompt: 'Un train parcourt 240 km en 2 h. Quelle est sa vitesse moyenne ?',
    options: ['120 km/h', '480 km/h', '238 km/h', '60 km/h'],
    cols: 4,
    requires: ['vitesse-moyenne'],
    explain:
      'La vitesse moyenne est la distance divisée par la durée : 240 ÷ 2 = 120 km/h. L’unité « km/h » dit l’opération — des kilomètres par heure. (480 vient d’une multiplication.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_proportionnalite-5e_P6'] },
  },
];

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="🏆 Mission finale : la fête"
      moduleSubtitle="Dix épreuves pour reconnaître un coefficient partout où il se cache"
      estimatedTime="6 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: 'Évaluation',
        title: 'La fête est prête — vérifions les comptes',
        tone: 'amber',
        body: (
          <p>
            Dix situations, toutes nouvelles. Pour chacune, la même question de fond :{' '}
            <strong>y a-t-il un coefficient</strong>, et si oui, dans quel sens l’employer ?
          </p>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître de la proportionnalité',
        title: 'Mission accomplie',
        message:
          'Tu sais reconnaître une situation proportionnelle, trouver son coefficient et t’en servir dans les deux sens — sur un tableau, une carte, une étiquette ou un graphique.',
        verbs: ['Reconnaître', 'Calculer', 'Représenter', 'Vérifier'],
        masterBadgeLabel: 'Proportion parfaite',
      }}
    />
  );
}
