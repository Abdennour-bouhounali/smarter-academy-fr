import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION.
 *
 * CONNAISSANCES AVANT LA DEMANDE. La mission finale CONSOLIDE : elle
 * n'introduit rien de neuf — ni concept, ni vocabulaire, ni notation — et
 * chaque épreuve déclare les connaissances qu'elle exige, toutes posées par
 * une brique des modules 2 à 5 ou déclarées en `priorKnowledge`.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 signe de f′ → variations ......... e1 (seule), e2, e3
 *   P2 construire le tableau ............ e4 (seule), e5, e6, e7
 *   P3 optimisation ..................... e8 (seule), e9, e10
 *
 * DISTRACTEURS, tous calculés et vérifiés DISTINCTS de la bonne réponse
 * (components/variationsUtils.test.js, section « mission finale ») : la
 * position de la courbe prise pour le signe de la dérivée (e1) ; « dérivée
 * nulle donc sommet » (e3) ; l'abscisse prise pour la valeur (e6) ; le côté
 * découpé pris pour le volume (e8, avec V′(0) = 144 et V(3) = 108 comme autres
 * pièges) ; l'autre zéro de la dérivée, qui est un creux (e9).
 */
const EPREUVES = [
  {
    id: 'dvo-e1',
    requires: ['signe-derivee-donne-sens', 'mem-positive-monte'],
    skill: 'lien',
    title: 'Le signe et le sens',
    prompt: 'Sur un intervalle, la dérivée d’une fonction f est strictement négative. Que fait f sur cet intervalle ?',
    options: [
      'Elle est décroissante',
      'Elle est croissante',
      'Elle passe en dessous de l’axe des abscisses',
      'Elle est constante',
    ],
    cols: 2,
    correct: 0,
    explain: 'f′ < 0 signifie que la pente de la tangente est négative en chaque point : la courbe descend, donc f est décroissante. « Passer en dessous de l’axe » décrirait le signe de f, pas celui de f′ — ce sont deux choses différentes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P1'] },
  },
  {
    id: 'dvo-e2',
    requires: ['signe-derivee-donne-sens', 'derive-coefficient-directeur'],
    skill: 'lien',
    title: 'Position ou pente ?',
    prompt: 'En un point où la courbe de f se trouve SOUS l’axe des abscisses, que peut-on dire du sens de variation de f ?',
    options: [
      'Rien : la position de la courbe ne décide pas du signe de f′',
      'f y est forcément décroissante',
      'f y est forcément croissante',
      'f y est forcément constante',
    ],
    cols: 1,
    correct: 0,
    explain: 'Sur f(x) = x³ − 3x, en x = 0,5 la courbe est sous l’axe (f = −1,375) et f′(0,5) = −2,25 : elle descend. En x = 1,5 elle est encore sous l’axe (f = −1,125) et pourtant f′(1,5) = 3,75 : elle monte. Le signe de f et celui de f′ sont indépendants.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P1'] },
  },
  {
    id: 'dvo-e3',
    requires: ['changement-de-signe-decide', 'signe-derivee-donne-sens'],
    skill: 'lien',
    title: 'Une dérivée qui s’annule',
    prompt: 'Pour g(x) = x³, on a g′(x) = 3x², donc g′(0) = 0. Que se passe-t-il pour g en 0 ?',
    options: [
      'Rien de particulier : g′ garde le même signe des deux côtés, donc g continue de croître',
      'g atteint sa plus grande valeur',
      'g atteint sa plus petite valeur',
      'g devient décroissante après 0',
    ],
    cols: 1,
    correct: 0,
    explain: 'g′(−0,5) = 0,75 et g′(0,5) = 0,75 : le signe est le même avant et après. La courbe s’aplatit un instant puis repart en montant. Une dérivée qui s’annule est un candidat, pas une conclusion : c’est le CHANGEMENT de signe qui décide.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P1'] },
  },
  {
    id: 'dvo-e4',
    requires: ['methode-construire-tableau-depuis-derivee', 'methode-construire-tableau'],
    skill: 'tableau',
    title: 'Le découpage',
    prompt: 'On étudie p(x) = x² − 4x + 1, dont la dérivée est p′(x) = 2x − 4. En quelle valeur l’intervalle d’étude se découpe-t-il ?',
    options: ['2', '4', '−2', '0'],
    cols: 4,
    correct: 0,
    explain: '2x − 4 = 0 donne 2x = 4, donc x = 2. C’est la seule valeur qui annule p′, et c’est elle qui découpe l’intervalle en deux morceaux.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P2'] },
  },
  {
    id: 'dvo-e5',
    requires: ['methode-construire-tableau-depuis-derivee', 'regle-ligne-derivee-au-dessus'],
    skill: 'tableau',
    title: 'L’ordre des gestes',
    prompt: 'Pour construire un tableau de variations à partir de la dérivée, dans quel ordre travaille-t-on ?',
    options: [
      'Calculer f′, résoudre f′(x) = 0, étudier le signe de f′, en déduire les flèches et les valeurs',
      'Poser les flèches d’abord, puis chercher un signe qui leur convienne',
      'Calculer f aux bornes, puis deviner les flèches entre elles',
      'Tracer la courbe, lire les flèches, puis vérifier avec la dérivée',
    ],
    cols: 1,
    correct: 0,
    explain: 'La ligne du signe se remplit AVANT la ligne des flèches, parce que la seconde se déduit de la première. Toute autre ordre revient à décider du résultat avant de l’avoir établi.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P2', 'premiere_specialite_derivation-variations-optimisation-1ere_P1'] },
  },
  {
    id: 'dvo-e6',
    requires: ['methode-extremum-par-le-signe', 'mem-plus-moins-maximum'],
    skill: 'tableau',
    title: 'Lire le retournement',
    prompt: 'Pour q(x) = x³ − 6x² + 9x, la dérivée q′ passe de + à − en x = 1. Quelle VALEUR q atteint-elle à ce retournement ?',
    options: ['4', '1', '0', '3'],
    cols: 4,
    correct: 0,
    explain: 'q(1) = 1 − 6 + 9 = 4. Répondre 1, c’est donner l’ENDROIT du retournement (l’abscisse) au lieu de la valeur atteinte. Ce sont deux nombres différents, rangés dans deux lignes différentes du tableau.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P2'] },
  },
  {
    id: 'dvo-e7',
    requires: ['regle-derivee-jamais-nulle', 'signe-derivee-donne-sens'],
    skill: 'tableau',
    title: 'Une dérivée sans zéro',
    prompt: 'Une fonction r a pour dérivée r′(x) = 3x² + 3. À quoi ressemble son tableau de variations sur [−2 ; 2] ?',
    options: [
      'Une seule flèche montante : r′ vaut au moins 3, donc ne s’annule jamais',
      'Deux flèches, avec un retournement en x = 0',
      'Deux flèches, avec un retournement en x = −1',
      'Trois flèches, comme pour x³ − 3x',
    ],
    cols: 1,
    correct: 0,
    explain: '3x² + 3 = 0 donnerait x² = −1, ce qui est impossible. La dérivée ne s’annule donc jamais, reste strictement positive, et le tableau ne comporte aucun découpage : une seule flèche.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P2'] },
  },
  {
    id: 'dvo-e8',
    requires: ['methode-optimiser-avec-la-derivee', 'methode-extremum-par-le-signe'],
    skill: 'choix',
    title: 'La plus grande boîte',
    prompt: 'On découpe un carré de côté x aux quatre coins d’un carton de 12 cm : le volume vaut V(x) = x(12 − 2x)², et V′ s’annule en x = 2 sur ]0 ; 6[. Quel est le volume de la plus grande boîte, en cm³ ?',
    options: ['128', '2', '144', '108'],
    cols: 4,
    correct: 0,
    explain: 'V(2) = 2 × (12 − 4)² = 2 × 64 = 128 cm³. Répondre 2, c’est donner le côté découpé et non le volume ; 144 est la valeur de V′(0), un nombre du calcul mais pas un volume ; 108 est V(3), un volume atteignable mais plus petit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P3'] },
  },
  {
    id: 'dvo-e9',
    requires: ['regle-annuler-ne-suffit-pas-optimisation', 'methode-extremum-par-le-signe'],
    skill: 'choix',
    title: 'Deux candidats, un seul bon',
    prompt: 'Le bénéfice B(x) = −2x³ + 30x² − 96x a pour dérivée B′(x) = −6(x − 2)(x − 8), qui s’annule en 2 et en 8. Pour quel x le bénéfice est-il le plus grand sur [0 ; 10] ?',
    options: ['8', '2', '10', '0'],
    cols: 4,
    correct: 0,
    explain: 'B′ passe de − à + en 2 : c’est un creux, B(2) = −88, le pire point. Elle passe de + à − en 8 : c’est le sommet, B(8) = 128. Les bornes valent B(0) = 0 et B(10) = 40, donc moins. La réponse est x = 8.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P3'] },
  },
  {
    id: 'dvo-e10',
    requires: ['methode-optimiser-avec-la-derivee', 'mem-lire-la-reponse-dans-le-tableau', 'fonction', 'intervalle'],
    skill: 'choix',
    title: 'Le premier geste',
    prompt: 'Un problème demande le meilleur choix possible. Par quoi commence-t-on avant même de dériver ?',
    options: [
      'Par nommer la variable, préciser l’intervalle où elle a un sens, et écrire la grandeur comme une fonction de cette variable',
      'Par résoudre « dérivée = 0 »',
      'Par calculer la grandeur pour trois ou quatre valeurs et garder la meilleure',
      'Par lire le résultat sur l’écran de la calculatrice',
    ],
    cols: 1,
    correct: 0,
    explain: 'On ne peut dériver que ce qui est déjà écrit comme une fonction, et l’intervalle décide de quels candidats sont recevables. Pour la boîte, x = 8 annulerait bien un facteur, mais 8 n’appartient pas à ]0 ; 6[ : le découpage n’aurait aucun sens.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_derivation-variations-optimisation-1ere_P3'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  lien: { label: 'Signe de f′ et sens de marche', module: 2 },
  tableau: { label: 'Construire et lire le tableau', module: 3 },
  choix: { label: 'Trouver le meilleur choix', module: 5 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Lecteur de signes', test: (m) => !m.lien },
  { id: 'b2', emoji: '🏅', label: 'Bâtisseur de tableaux', test: (m) => !m.tableau },
  { id: 'b3', emoji: '🏅', label: 'Chercheur de sommets', test: (m) => !m.choix },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du sommet', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleLeSommet() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le sommet"
      moduleSubtitle="Dix épreuves : un signe, un tableau, un choix"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître du sommet',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : le signe d’abord, les flèches ensuite —
            et toujours vérifier ce que le signe fait de part et d’autre.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '↗', label: 'f′ > 0', value: 'f croissante' },
        { id: 'r2', emoji: '↘', label: 'f′ < 0', value: 'f décroissante' },
        { id: 'r3', emoji: '⌢', label: '+ puis −', value: 'la courbe se retourne' },
        { id: 'r4', emoji: '🎯', label: 'le meilleur choix', value: 'se lit dans le tableau' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître du sommet !',
        title: 'Mission accomplie',
        message: 'Tu sais relier le signe d’une dérivée au sens de marche d’une courbe, en tirer un tableau, et t’en servir pour désigner le meilleur choix d’un problème.',
        verbs: ['Relier', 'Construire', 'Lire', 'Décider'],
        masterBadgeLabel: 'Maître du sommet',
      }}
    />
  );
}
