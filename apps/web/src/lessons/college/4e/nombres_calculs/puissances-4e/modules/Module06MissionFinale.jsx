import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition (§45) : aucune épreuve ne reprend les valeurs des
 * modules, et chaque distracteur encode une erreur RÉELLEMENT rencontrée :
 *   — « 10⁻³ = −1000 », le contresens du signe (M1, M2) ;
 *   — multiplier les exposants au lieu de les additionner (M3) ;
 *   — soustraire dans le mauvais sens (M3) ;
 *   — mélanger deux bases différentes (M3) ;
 *   — un coefficient hors de [1 ; 10[ (M4) ;
 *   — lire un écart d'exposants comme un écart additif (M5).
 *
 * La bonne réponse est déclarée par `correct` et sa POSITION VARIE.
 *
 * `badges[].test` est une FONCTION `(misses) => bool` : un objet `{skill}` y
 * jette « b.test is not a function » et le module ne monte pas du tout.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 7 LPs sont tous couverts.
 */
const SKILLS = {
  negatif: { label: 'Exposant négatif', emoji: '📉' },
  regles: { label: 'Règles de calcul', emoji: '🧮' },
  scientifique: { label: 'Notation scientifique', emoji: '🔬' },
  grandeur: { label: 'Ordres de grandeur', emoji: '🌍' },
};

const BADGES = [
  { id: 'b-neg', emoji: '📉', label: 'Maître du signe', test: (m) => !m.negatif },
  { id: 'b-reg', emoji: '🧮', label: 'Compteur de facteurs', test: (m) => !m.regles },
  { id: 'b-sci', emoji: '🔬', label: 'Écriture scientifique', test: (m) => !m.scientifique },
  { id: 'b-gra', emoji: '🌍', label: 'Sens des grandeurs', test: (m) => !m.grandeur },
  { id: 'b-parfait', emoji: '💎', label: 'Maître de l’échelle', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'pu4-e1',
    skill: 'negatif',
    title: 'Un exposant négatif',
    prompt: 'Combien vaut 10⁻⁴ ?',
    options: ['−10 000', '0,0001', '−0,0001', '0,001'],
    correct: 1,
    cols: 4,
    requires: ['exposant-negatif'],
    explain: '10⁻⁴ = 1/10⁴ = 1/10 000 = 0,0001. Le signe porte sur l’exposant : il commande une division, il ne rend pas le nombre négatif.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_puissances-4e_P1'] },
  },
  {
    id: 'pu4-e2',
    skill: 'negatif',
    title: 'Le signe, où est-il ?',
    prompt: 'Parmi ces nombres, lequel est NÉGATIF ?',
    options: ['2⁻⁵', '10⁻¹', '−5²', '3⁻²'],
    correct: 2,
    cols: 4,
    requires: ['exposant-negatif'],
    explain: '−5² = −25 : le signe est devant le nombre. Les trois autres ont leur signe en EXPOSANT — ils valent 1/32, 0,1 et 1/9, tous positifs.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_puissances-4e_P1'] },
  },
  {
    id: 'pu4-e3',
    skill: 'regles',
    title: 'Un produit',
    prompt: 'Combien fait 10⁶ × 10⁻² ?',
    options: ['10⁻¹²', '10⁸', '10⁴', '10³'],
    correct: 2,
    cols: 4,
    requires: ['regles-puissances'],
    explain: 'On additionne les exposants : 6 + (−2) = 4, donc 10⁴. (10⁻¹² viendrait d’une multiplication des exposants, 10⁸ d’une soustraction du signe.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_puissances-4e_P2'] },
  },
  {
    id: 'pu4-e4',
    skill: 'regles',
    title: 'Un quotient',
    prompt: 'Combien fait 2⁴ ÷ 2⁹ ?',
    options: ['2⁵', '2⁻⁵', '2¹³', '2⁻¹³'],
    correct: 1,
    cols: 4,
    requires: ['regles-puissances', 'exposant-negatif'],
    explain: 'On soustrait dans le bon sens : 4 − 9 = −5, donc 2⁻⁵ (c’est-à-dire 1/32). 2⁵ viendrait de 9 − 4 : l’ordre compte.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_puissances-4e_P3'] },
  },
  {
    id: 'pu4-e5',
    skill: 'regles',
    title: 'Une puissance de puissance',
    prompt: 'Combien fait (10⁴)³ ?',
    options: ['10⁷', '10⁴³', '10¹²', '10⁶⁴'],
    correct: 2,
    cols: 4,
    requires: ['regles-puissances'],
    explain: 'Le paquet de quatre facteurs, répété trois fois : 4 × 3 = 12 facteurs, donc 10¹². (10⁷ viendrait d’une addition — mais on ne met pas deux paquets bout à bout, on en répète un.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_puissances-4e_P4'] },
  },
  {
    id: 'pu4-e6',
    skill: 'regles',
    title: 'Deux bases',
    prompt: 'Que vaut 3² × 5² ?',
    options: [
      '15⁴, en multipliant bases et exposants',
      '225, car aucune règle ne s’applique : 9 × 25',
      '15², par la règle des exposants',
      '8², en additionnant les bases',
    ],
    correct: 1,
    cols: 1,
    requires: ['regles-puissances'],
    explain: 'Les règles exigent la MÊME base. Ici il faut calculer : 9 × 25 = 225. (On remarquera que 15² = 225 aussi — c’est vrai pour un exposant COMMUN, mais ce n’est pas la règle du programme de 4e, et 15⁴ serait faux.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_puissances-4e_P2'] },
  },
  {
    id: 'pu4-e7',
    skill: 'scientifique',
    title: 'Écriture scientifique',
    prompt: 'Quelle est l’écriture scientifique de 0,00058 ?',
    options: ['5,8 × 10⁻⁴', '58 × 10⁻⁵', '5,8 × 10⁴', '0,58 × 10⁻³'],
    correct: 0,
    cols: 2,
    requires: ['notation-scientifique', 'exposant-negatif'],
    explain: 'La virgule avance de 4 rangs pour se placer après le 5 : 5,8 × 10⁻⁴. Les deux dernières propositions désignent bien le même nombre mais leur coefficient sort de [1 ; 10[.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_puissances-4e_P6'] },
  },
  {
    id: 'pu4-e8',
    skill: 'scientifique',
    title: 'Le coefficient',
    prompt: 'Pourquoi 47 × 10³ n’est-il pas une écriture scientifique ?',
    options: [
      'Parce que l’exposant doit être négatif',
      'Parce que le coefficient doit être compris entre 1 et 10',
      'Parce qu’on ne peut pas utiliser la base 10',
      'Parce que 47 n’est pas un nombre décimal',
    ],
    correct: 1,
    cols: 1,
    requires: ['notation-scientifique'],
    explain: '47 dépasse 10 : il faut écrire 4,7 × 10⁴. Cette contrainte rend l’écriture UNIQUE, donc deux nombres immédiatement comparables.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_puissances-4e_P6'] },
  },
  {
    id: 'pu4-e9',
    skill: 'grandeur',
    title: 'Puissances de 10',
    prompt: 'Combien fait 4,2 × 10³ en écriture décimale ?',
    options: ['42 000', '4200', '0,0042', '420'],
    correct: 1,
    cols: 4,
    requires: ['notation-scientifique'],
    explain: 'Multiplier par 10³ décale la virgule de 3 rangs vers la droite : 4,2 devient 4200.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_puissances-4e_P5'] },
  },
  {
    id: 'pu4-e10',
    skill: 'grandeur',
    title: 'Deux ordres de grandeur',
    prompt: 'Une goutte d’eau pèse environ 10⁻⁴ kg, un éléphant 10⁴ kg. Combien de fois l’éléphant est-il plus lourd ?',
    options: ['8 fois', '10⁸ fois', '10⁰ fois', '100 fois'],
    correct: 1,
    cols: 4,
    requires: ['ordre-de-grandeur-4e'],
    explain: 'Huit crans d’écart entre −4 et 4, chacun valant un facteur 10 : le rapport est 10⁸, soit cent millions de fois. L’écart des exposants (8) n’est pas le rapport.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_puissances-4e_P7'] },
  },
];

export default function Module06MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : l’échelle"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises les puissances"
      estimatedTime="8 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître de l’échelle',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Souviens-toi : un exposant se{' '}
            <strong>compte</strong>, il ne se calcule pas — et un signe en exposant n’est pas un
            signe devant le nombre.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📉', label: 'a⁻ⁿ', value: '= 1/aⁿ, un nombre positif' },
        { id: 'r2', emoji: '✖️', label: 'Produit', value: 'on additionne les exposants' },
        { id: 'r3', emoji: '➗', label: 'Quotient', value: 'on soustrait les exposants' },
        { id: 'r4', emoji: '🔬', label: 'Scientifique', value: '1 ≤ a < 10' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître de l’échelle !',
        title: 'Mission accomplie',
        message: 'Tu sais interpréter un exposant négatif, calculer avec les puissances et écrire un nombre en notation scientifique.',
        verbs: ['Interpréter', 'Multiplier', 'Diviser', 'Écrire'],
        masterBadgeLabel: 'Maître de l’échelle',
      }}
    />
  );
}
