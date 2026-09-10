import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION.
 *
 * CONNAISSANCES AVANT LA DEMANDE. La mission finale CONSOLIDE : elle
 * n'introduit rien de neuf — ni concept, ni vocabulaire, ni notation, options
 * et distracteurs compris — et chaque épreuve déclare les connaissances qu'elle
 * exige, toutes posées par une brique des modules 2 à 6.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 e^(a+b) = e^a × e^b ............ e1 (seule), e2
 *   P2 e^(−a) et e^(a−b) .............. e3 (seule), e4, e2
 *   P3 (e^a)^n = e^(na) ............... e5 (seule), e4
 *   P4 résoudre une équation .......... e6 (seule), e7
 *   P5 résoudre une inéquation ........ e8 (seule), e7
 *   P6 modéliser ...................... e9 (seule), e10
 *
 * DISTRACTEURS, tous CALCULÉS depuis le modèle et prouvés distincts deux à deux
 * (components/reglesExpoUtils.test.js, section 9) : `piegesSomme(3, 2)` donne
 * 5 / 6 / 3 / 1 pour e1 ; `piegesPuissance(2, 3)` donne 6 / 8 / 2 / 5 pour e5.
 * Les autres pièges sont les conceptions erronées nommées par la leçon :
 * « e^(−a) = −e^a » (e3), « on enlève les e » (e6), le sens renversé au passage
 * aux exposants (e8), « une décroissance atteint zéro » (e9), « un modèle
 * exponentiel ajoute la même chose à chaque pas » (e10).
 */
const EPREUVES = [
  {
    id: 'et-e1',
    requires: ['relation-fondamentale-exp', 'mem-somme-devient-produit'],
    skill: 'transformer',
    title: 'Regrouper un produit',
    prompt: 'Écris e³ × e² sous la forme d’une seule exponentielle.',
    options: ['e⁵', 'e⁶', 'e³', 'e¹'],
    cols: 4,
    correct: 0,
    explain: 'On additionne les exposants : 3 + 2 = 5, donc e³ × e² = e⁵. Répondre e⁶, c’est multiplier les exposants entre eux ; répondre e¹, c’est les soustraire, ce qui correspondrait à un quotient.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P1'] },
  },
  {
    id: 'et-e2',
    requires: ['relation-fondamentale-exp', 'exp-difference-quotient'],
    skill: 'transformer',
    title: 'La règle, dans le bon sens',
    prompt: 'Laquelle de ces égalités est VRAIE pour tous les nombres a et b ?',
    options: [
      'e^(a+b) = e^a × e^b',
      'e^(a+b) = e^a + e^b',
      'e^(a×b) = e^a × e^b',
      'e^(a−b) = e^a − e^b',
    ],
    cols: 1,
    correct: 0,
    explain: 'C’est la relation fondamentale : une somme d’exposants correspond à un produit de valeurs. Une somme de valeurs ne correspond à rien de simple, et une différence d’exposants donne un quotient — jamais une différence de valeurs.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P1', 'premiere_specialite_exponentielle-calculer-modeliser-1ere_P2'] },
  },
  {
    id: 'et-e3',
    requires: ['exp-oppose-inverse', 'mem-oppose-et-difference', 'exp-strictement-positive'],
    skill: 'oppose',
    title: 'L’exposant opposé',
    prompt: 'Que vaut e^(−2) ?',
    options: [
      '1 / e², un nombre strictement positif plus petit que 1',
      '−e², un nombre négatif',
      '−2 × e',
      '0, puisque l’exposant est négatif',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un exposant opposé donne l’INVERSE, jamais l’opposé : e^(−2) = 1/e² ≈ 0,135. Cette fonction ne prend que des valeurs strictement positives, quel que soit le signe de l’exposant.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P2'] },
  },
  {
    id: 'et-e4',
    requires: ['exp-difference-quotient', 'exp-puissance'],
    skill: 'oppose',
    title: 'Un quotient à simplifier',
    prompt: 'Écris (e³)² / e⁴ sous la forme d’une seule exponentielle.',
    options: ['e²', 'e⁵', 'e⁹', 'e^(3/2)'],
    cols: 4,
    correct: 0,
    explain: 'Deux règles à la suite : (e³)² = e⁶ puisque la puissance multiplie l’exposant, puis e⁶ / e⁴ = e^(6−4) = e². Répondre e⁹ reviendrait à élever l’exposant, et e^(3/2) à diviser les exposants entre eux.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P2', 'premiere_specialite_exponentielle-calculer-modeliser-1ere_P3'] },
  },
  {
    id: 'et-e5',
    requires: ['exp-puissance', 'mem-puissance-multiplie'],
    skill: 'puissance',
    title: 'Une puissance d’exponentielle',
    prompt: 'Écris (e²)³ sous la forme d’une seule exponentielle.',
    options: ['e⁶', 'e⁸', 'e²', 'e⁵'],
    cols: 4,
    correct: 0,
    explain: 'La puissance MULTIPLIE l’exposant : 2 × 3 = 6, donc (e²)³ = e⁶. C’est le dépliage qui le dit : e² × e² × e², soit 2 + 2 + 2. Répondre e⁸, c’est élever l’exposant à la puissance (2³) au lieu de le multiplier ; répondre e⁵, c’est additionner 2 et 3.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P3'] },
  },
  {
    id: 'et-e6',
    requires: ['egalite-des-exposants', 'methode-resoudre-equation-exp', 'exp-strictement-croissante'],
    skill: 'resoudre',
    title: 'Pourquoi on a le droit',
    prompt: 'Pour résoudre e^(x+3) = e^(2x+1), on écrit x + 3 = 2x + 1. Qu’est-ce qui autorise ce passage ?',
    options: [
      'La stricte croissance : deux valeurs égales ne peuvent venir que du même exposant',
      'La relation e^(a+b) = e^a × e^b',
      'Le fait que l’on puisse simplement effacer les e des deux côtés',
      'Le fait que l’exponentielle soit strictement positive',
    ],
    cols: 1,
    correct: 0,
    explain: 'C’est la stricte croissance, et elle seule : une fonction qui monte toujours ne repasse jamais deux fois par la même hauteur, donc deux valeurs égales viennent du même exposant. La relation fondamentale sert à TRANSFORMER, pas à résoudre ; et la stricte positivité ne dit rien de l’unicité.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P4'] },
  },
  {
    id: 'et-e7',
    requires: ['egalite-des-exposants', 'methode-resoudre-equation-exp', 'equation-premier-degre'],
    skill: 'resoudre',
    title: 'Une équation à résoudre',
    prompt: 'Résous e^(3x−1) = e^(x+5). Que vaut x ?',
    options: ['3', '2', '6', '−3'],
    cols: 4,
    correct: 0,
    explain: 'On égale les exposants : 3x − 1 = x + 5, donc 2x = 6 et x = 3. Vérification : les deux exposants valent alors 8. Répondre 6, c’est s’arrêter à 2x = 6 sans diviser.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P4', 'premiere_specialite_exponentielle-calculer-modeliser-1ere_P5'] },
  },
  {
    id: 'et-e8',
    requires: ['inegalite-sens-conserve', 'methode-resoudre-inequation', 'intervalle-crochets'],
    skill: 'comparer',
    title: 'Une inéquation',
    prompt: 'Résous e^(2x+1) < e^(x+4) dans ℝ. Quel est l’ensemble des solutions ?',
    options: [']−∞ ; 3[', ']3 ; +∞[', ']−∞ ; 5[', 'ℝ tout entier'],
    cols: 4,
    correct: 0,
    explain: 'La stricte croissance conserve le sens : 2x + 1 < x + 4, donc x < 3. L’ensemble est ]−∞ ; 3[. Le sens ne s’inverse pas ici — il ne le ferait que si l’on divisait par un nombre négatif, ce qui n’arrive pas dans ce calcul.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P5'] },
  },
  {
    id: 'et-e9',
    requires: ['modele-exponentiel', 'exp-strictement-positive'],
    skill: 'modeliser',
    title: 'Lire un modèle',
    prompt: 'Une grandeur est modélisée par f(t) = 60 × e^(−0,15t). Que peut-on affirmer ?',
    options: [
      'Elle vaut 60 au départ, puis diminue sans jamais atteindre 0',
      'Elle vaut 60 au départ, puis augmente',
      'Elle vaut −0,15 au départ',
      'Elle diminue jusqu’à 0, puis devient négative',
    ],
    cols: 1,
    correct: 0,
    explain: 'En t = 0, e⁰ = 1 : la valeur de départ est donc 60, le nombre placé devant. Et le signe de l’exposant décide du sens : k = −0,15 est négatif, donc la grandeur diminue — mais elle reste strictement positive, comme toute valeur de cette fonction.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P6'] },
  },
  {
    id: 'et-e10',
    requires: ['facteur-constant', 'modele-exponentiel', 'exp-difference-quotient'],
    skill: 'modeliser',
    title: 'Reconnaître le modèle',
    prompt: 'À quoi reconnaît-on qu’une grandeur suit un modèle de la forme A·e^(kt), plutôt qu’un modèle affine ?',
    options: [
      'Le QUOTIENT d’une valeur par la précédente est le même à chaque pas',
      'L’ÉCART entre une valeur et la précédente est le même à chaque pas',
      'Les valeurs sont toutes des nombres entiers',
      'La grandeur finit toujours par atteindre 0',
    ],
    cols: 1,
    correct: 0,
    explain: 'La règle du quotient le montre : f(t+1)/f(t) = e^k, une valeur qui ne dépend pas de t. C’est donc un FACTEUR constant. Un écart constant, lui, est la signature d’un modèle affine — et c’est exactement ce qui distingue les deux.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_exponentielle-calculer-modeliser-1ere_P6', 'premiere_specialite_exponentielle-calculer-modeliser-1ere_P1'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  transformer: { label: 'La relation fondamentale', module: 2 },
  oppose: { label: 'L’opposé et la différence', module: 3 },
  puissance: { label: 'La puissance', module: 4 },
  resoudre: { label: 'Résoudre une équation', module: 5 },
  comparer: { label: 'Résoudre une inéquation', module: 6 },
  modeliser: { label: 'Modéliser', module: 6 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Traducteur somme-produit', test: (m) => !m.transformer },
  { id: 'b2', emoji: '🏅', label: 'Maître de l’inverse', test: (m) => !m.oppose },
  { id: 'b3', emoji: '🏅', label: 'Déplieur de puissances', test: (m) => !m.puissance },
  { id: 'b4', emoji: '🏅', label: 'Résolveur d’équations', test: (m) => !m.resoudre && !m.comparer },
  { id: 'b5', emoji: '🏅', label: 'Modélisateur', test: (m) => !m.modeliser },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du traducteur', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleLeTraducteur() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le traducteur"
      moduleSubtitle="Dix épreuves : transformer, simplifier, résoudre, modéliser"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître du traducteur',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : une somme d’exposants devient un produit,
            un opposé devient un inverse, une différence devient un quotient, une puissance multiplie
            l’exposant. Et pour résoudre, une seule raison : elle monte toujours.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '✖️', label: 'somme', value: 'e^(a+b) = e^a × e^b' },
        { id: 'r2', emoji: '🔄', label: 'opposé', value: 'e^(−a) = 1/e^a' },
        { id: 'r3', emoji: '➗', label: 'différence', value: 'e^(a−b) = e^a / e^b' },
        { id: 'r4', emoji: '⬆️', label: 'puissance', value: '(e^a)^n = e^(na)' },
        { id: 'r5', emoji: '⚖️', label: 'résoudre', value: 'e^u = e^v ⟺ u = v' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître du traducteur !',
        title: 'Mission accomplie',
        message: 'Tu sais transformer une somme en produit, simplifier un quotient, déplier une puissance, résoudre équations et inéquations, et lire un modèle de croissance.',
        verbs: ['Transformer', 'Simplifier', 'Résoudre', 'Modéliser'],
        masterBadgeLabel: 'Maître du traducteur',
      }}
    />
  );
}
