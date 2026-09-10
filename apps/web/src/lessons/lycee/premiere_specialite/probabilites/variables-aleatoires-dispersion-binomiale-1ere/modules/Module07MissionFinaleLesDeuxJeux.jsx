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
 * exige, toutes posées par une brique des modules 1 à 6.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 calculer la variance ................. e1 (seule), e3
 *   P2 calculer l'écart type ................ e2 (seule), e3, e4
 *   P3 reconnaître un schéma de Bernoulli ... e5 (seule), e6
 *   P4 reconnaître une loi binomiale ........ e6 (seule), e10
 *   P5 calculer avec la loi binomiale ....... e7 (seule), e8, e9
 *   P6 modéliser ............................ e10 (seule), e9
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/dispersionUtils.test.js, groupe « LES DISTRACTEURS DU BOSS ») :
 * variance prise pour l'écart type et réciproquement (e1, e2, e3), écarts
 * additionnés sans carré (e1), coefficient binomial oublié (e7), décalage d'un
 * cran sur k (e7), contraire mal choisi (e8), n × p pris pour p (e10).
 *
 * PARSE. Aucune épreuve n'est une saisie numérique : ce sont des QCM, et les
 * réponses décimales y sont des OPTIONS écrites. La règle `parse={parseSigned}`
 * concerne les `NumericQuestion` des modules formatifs, où elle est appliquée.
 */
const EPREUVES = [
  {
    id: 'vd-e1',
    requires: ['variance', 'methode-calculer-variance', 'ecart-a-l-esperance'],
    skill: 'variance',
    title: 'Calculer une variance',
    prompt: 'X vaut 1 avec la probabilité 0,4 ; 2 avec 0,2 ; 3 avec 0,4. Son espérance vaut 2. Que vaut V(X) ?',
    options: ['0,8', '0', '2', '0,89'],
    cols: 4,
    correct: 0,
    explain: '0,4 × (1 − 2)² + 0,2 × (2 − 2)² + 0,4 × (3 − 2)² = 0,4 + 0 + 0,4 = 0,8. Répondre 0, c’est avoir oublié les carrés : les écarts −1 et +1 s’annuleraient. Répondre 2, c’est avoir additionné les carrés sans les peser par leurs probabilités.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P1'] },
  },
  {
    id: 'vd-e2',
    requires: ['ecart-type', 'mem-variance-ecart-type', 'variance-en-unite-carree'],
    skill: 'ecart',
    title: 'De la variance à l’écart type',
    prompt: 'Une variable aléatoire a pour variance V(X) = 36. Que vaut son écart type ?',
    options: ['6', '36', '18', '1 296'],
    cols: 4,
    correct: 0,
    explain: 'σ(X) = √V(X) = √36 = 6. Répondre 36, c’est confondre les deux nombres ; 18, c’est avoir divisé par 2 ; 1 296, c’est avoir élevé au carré au lieu de prendre la racine.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P2'] },
  },
  {
    id: 'vd-e3',
    requires: ['variance', 'ecart-type', 'meme-moyenne-pas-meme-jeu'],
    skill: 'ecart',
    title: 'Deux jeux, un seul choix',
    prompt: 'Deux jeux ont la même espérance de 2 €. Le premier a un écart type de 0,89 € ; le second de 6 €. Que peut-on en dire ?',
    options: [
      'Les résultats du second s’éloignent beaucoup plus de 2 €, alors que les deux rapportent autant à long terme',
      'Le second rapporte plus, puisque 6 est plus grand que 0,89',
      'Le premier est plus rentable, puisque ses résultats sont plus réguliers',
      'Les deux jeux sont identiques : seule l’espérance décrit une variable aléatoire',
    ],
    cols: 1,
    correct: 0,
    explain: 'L’écart type mesure l’éloignement à l’espérance, pas ce que le jeu rapporte : les deux rapportent 2 € à long terme. Le second réserve simplement des résultats bien plus dispersés — beaucoup de rien, et parfois beaucoup.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P2', 'premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P1'] },
  },
  {
    id: 'vd-e4',
    requires: ['variance-en-unite-carree', 'ecart-type'],
    skill: 'ecart',
    title: 'Une question d’unité',
    prompt: 'Les gains d’un jeu sont réécrits en centimes au lieu d’euros : chaque gain est multiplié par 100. Que deviennent la variance et l’écart type ?',
    options: [
      'La variance est multipliée par 10 000, l’écart type par 100',
      'Les deux sont multipliés par 100',
      'Les deux sont multipliés par 10 000',
      'Ni l’un ni l’autre ne change : le jeu est le même',
    ],
    cols: 1,
    correct: 0,
    explain: 'Chaque écart est multiplié par 100, donc chaque CARRÉ d’écart par 100² = 10 000 : c’est la variance. L’écart type, racine de la variance, n’est multiplié que par 100 — il suit l’unité des gains, et c’est exactement pourquoi on le préfère pour parler.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P2'] },
  },
  {
    id: 'vd-e5',
    requires: ['schema-bernoulli'],
    skill: 'bernoulli',
    title: 'Deux issues, ou pas',
    prompt: 'Laquelle de ces expériences n’a PAS exactement deux issues ?',
    options: [
      'On interroge une personne qui répond « oui », « non » ou « sans avis »',
      'On lance une pièce et l’on note pile ou face',
      'On prélève une ampoule et l’on note si elle est défectueuse',
      'On lance un dé et l’on note si l’on obtient un 6',
    ],
    cols: 1,
    correct: 0,
    explain: 'Trois réponses possibles, donc trois issues : ce n’est pas une épreuve à deux issues. Les trois autres n’en ont bien que deux — un dé a six faces, mais « obtenir un 6 » ou « ne pas en obtenir » n’en fait que deux.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P3'] },
  },
  {
    id: 'vd-e6',
    requires: ['schema-bernoulli', 'compter-les-succes', 'loi-binomiale'],
    skill: 'reconnaitre',
    title: 'Répétition ou pas',
    prompt: 'Une urne contient 3 boules rouges et 7 vertes. On tire 4 boules SANS remise, et X compte les rouges. X suit-elle la loi binomiale ?',
    options: [
      'Non : sans remise, les tirages ne sont pas indépendants — chaque tirage change la composition de l’urne',
      'Oui : il y a bien deux issues et 4 répétitions',
      'Non : parce que 4 n’est pas un nombre pair de répétitions',
      'Oui, à condition de remettre chaque boule après le tirage',
    ],
    cols: 1,
    correct: 0,
    explain: 'Deux issues et 4 répétitions fixées : ces deux conditions-là sont remplies. C’est la troisième qui tombe — l’indépendance. Après une rouge sortie, il n’en reste que 2 sur 9 : la deuxième branche ne porte plus le même poids. La dernière option décrit bien la correction à faire, mais elle change l’expérience au lieu de répondre à la question posée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P4'] },
  },
  {
    id: 'vd-e7',
    requires: ['loi-binomiale', 'mem-loi-binomiale', 'coefficient-binomial'],
    skill: 'calculer',
    title: 'Exactement deux',
    prompt: 'X compte les succès de 5 épreuves indépendantes de probabilité 0,4. Que vaut P(X = 2) ?',
    options: ['0,3456', '0,03456', '0,4', '0,2304'],
    cols: 4,
    correct: 0,
    explain: 'C(5,2) × 0,4² × 0,6³ = 10 × 0,16 × 0,216 = 0,3456. Répondre 0,03456, c’est avoir oublié le coefficient : c’est la probabilité d’UN seul chemin, pas de l’événement entier. 0,2304 est P(X = 3), un cran plus loin.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P5'] },
  },
  {
    id: 'vd-e8',
    requires: ['passer-au-complementaire', 'loi-binomiale'],
    skill: 'calculer',
    title: 'Au moins un',
    prompt: 'X compte les succès de 5 épreuves indépendantes de probabilité 0,4, et P(X = 0) = 0,07776. Que vaut P(X ⩾ 1) ?',
    options: ['0,92224', '0,07776', '0,2592', '0,7408'],
    cols: 4,
    correct: 0,
    explain: 'Le contraire de « au moins un » est « aucun » : P(X ⩾ 1) = 1 − 0,07776 = 0,92224. Répondre 0,7408, c’est avoir pris le contraire de « exactement un » ; 0,2592 est justement P(X = 1), qui n’est qu’un des cinq cas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P5'] },
  },
  {
    id: 'vd-e9',
    requires: ['esperance-variance-binomiale', 'loi-binomiale', 'mem-variance-ecart-type'],
    skill: 'calculer',
    title: 'Espérance et variance d’un coup',
    prompt: 'X compte les succès de 20 épreuves indépendantes de probabilité 0,3. Que valent E(X) et V(X) ?',
    options: [
      'E(X) = 6 et V(X) = 4,2',
      'E(X) = 6 et V(X) = 6',
      'E(X) = 0,3 et V(X) = 0,21',
      'E(X) = 20 et V(X) = 4,2',
    ],
    cols: 1,
    correct: 0,
    explain: 'E(X) = np = 20 × 0,3 = 6, et V(X) = np(1 − p) = 20 × 0,3 × 0,7 = 4,2. Répondre 0,3 et 0,21, c’est avoir donné les valeurs pour UNE seule épreuve ; répondre 20, c’est avoir donné le nombre d’épreuves au lieu du nombre de succès attendu.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P5', 'premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P6'] },
  },
  {
    id: 'vd-e10',
    requires: ['modeliser-par-une-variable', 'schema-bernoulli', 'esperance-variance-binomiale'],
    skill: 'modeliser',
    title: 'Traduire un énoncé',
    prompt: 'Une machine produit en moyenne 2 pièces défectueuses par lot de 25. On prélève un lot de 25 pièces et X compte les défectueuses. Quels sont n et p ?',
    options: [
      'n = 25 et p = 0,08',
      'n = 25 et p = 2',
      'n = 2 et p = 25',
      'n = 25 et p = 0,5',
    ],
    cols: 1,
    correct: 0,
    explain: 'n est le nombre de répétitions : 25 pièces prélevées. Et 2 défauts attendus sur 25 donnent une probabilité de 2 ÷ 25 = 0,08 par pièce. Répondre p = 2, c’est confondre p avec n × p, le nombre attendu de défauts — l’erreur la plus fréquente de la modélisation.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_variables-aleatoires-dispersion-binomiale-1ere_P6'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  variance: { label: 'Calculer une variance', module: 2 },
  ecart: { label: 'Calculer et lire un écart type', module: 3 },
  bernoulli: { label: 'Reconnaître une épreuve à deux issues', module: 4 },
  reconnaitre: { label: 'Reconnaître une répétition d’épreuves', module: 5 },
  calculer: { label: 'Calculer avec la loi binomiale', module: 5 },
  modeliser: { label: 'Modéliser une situation', module: 6 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Mesureur d’écarts', test: (m) => !m.variance },
  { id: 'b2', emoji: '🏅', label: 'Maître de l’unité', test: (m) => !m.ecart },
  { id: 'b3', emoji: '🏅', label: 'Deux issues, pas trois', test: (m) => !m.bernoulli },
  { id: 'b4', emoji: '🏅', label: 'Œil du reconnaisseur', test: (m) => !m.reconnaitre },
  { id: 'b5', emoji: '🏅', label: 'Compteur de chemins', test: (m) => !m.calculer },
  { id: 'b6', emoji: '🏅', label: 'Traducteur d’énoncés', test: (m) => !m.modeliser },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des deux jeux', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleLesDeuxJeux() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : les deux jeux"
      moduleSubtitle="Dix épreuves : une dispersion, une unité, une répétition, une formule, une traduction"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître des deux jeux',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexes : les carrés d’abord et la racine
            ensuite — et jamais de formule avant d’avoir posé n, p et ce que compte X.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📏', label: 'V(X)', value: 'Σ pᵢ(xᵢ − E(X))²' },
        { id: 'r2', emoji: '📐', label: 'σ(X)', value: '√V(X), dans l’unité des valeurs' },
        { id: 'r3', emoji: '🌳', label: 'répétition', value: 'deux issues · n fixé · indépendance' },
        { id: 'r4', emoji: '🧮', label: 'P(X = k)', value: 'C(n,k) pᵏ (1−p)ⁿ⁻ᵏ' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître des deux jeux !',
        title: 'Mission accomplie',
        message: 'Tu sais mesurer la dispersion d’une variable aléatoire, la lire dans la bonne unité, reconnaître une répétition d’épreuves identiques et calculer avec elle.',
        verbs: ['Mesurer', 'Reconnaître', 'Calculer', 'Modéliser'],
        masterBadgeLabel: 'Maître des deux jeux',
      }}
    />
  );
}
