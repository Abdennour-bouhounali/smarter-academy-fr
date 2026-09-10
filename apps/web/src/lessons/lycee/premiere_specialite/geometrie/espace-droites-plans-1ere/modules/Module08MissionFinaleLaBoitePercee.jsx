import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 8 — ÉVALUATION.
 *
 * CONNAISSANCES AVANT LA DEMANDE. La mission finale CONSOLIDE : elle
 * n'introduit rien de neuf — ni concept, ni vocabulaire, ni notation — et
 * chaque épreuve déclare les connaissances qu'elle exige, toutes posées par une
 * brique des modules 1 à 7 ou déclarées en `priorKnowledge`.
 *
 * COUVERTURE. Sept LP, dix épreuves, et CHAQUE LP a au moins une épreuve qui
 * lui est PROPRE — `learningPointIds` valant exactement `[ce LP]` — pour que le
 * profil de maîtrise soit interprétable :
 *   P1 positions droite / plan ........ e1 (seule), e2
 *   P2 positions de deux plans ........ e3 (seule)
 *   P3 démontrer le parallélisme ...... e6 (seule), e7
 *   P4 démontrer l'orthogonalité ...... e7 (seule)
 *   P5 représentation paramétrique .... e4 (seule), e5
 *   P6 équation cartésienne d'un plan . e8 (seule), e9
 *   P7 distance dans l'espace ......... e10 (seule), e9
 *
 * DISTRACTEURS, tous vérifiés numériquement et DISTINCTS de la bonne réponse
 * (components/planUtils.test.js et ParametreLab.test.js) : « produit nul donc
 * parallèle » sans le second test (e1), « produit nul donc orthogonal » appliqué
 * à une droite et un plan (e7), le d de l'autre plan parallèle (e8), la ligne
 * de coefficient nul omise (e5), le dénominateur oublié (e10), le mauvais point
 * (e10), l'intersection de deux plans prise pour un point (e3).
 *
 * TOUTES LES ÉPREUVES PORTENT SUR LA MÊME BOÎTE ABCDEFGH que les sept modules
 * précédents, dans le repère où A est l'origine et l'arête vaut 2. L'élève n'a
 * donc aucune figure nouvelle à déchiffrer sous chronomètre.
 *
 * LES MÉTADONNÉES SONT DES LITTÉRAUX INTÉGRAUX : un helper les rendrait
 * invisibles au validateur, et la couverture des LP ne serait plus prouvable.
 */
const EPREUVES = [
  {
    id: 'ev-e1',
    requires: ['critere-droite-plan', 'mem-nul-puis-appartenance', 'vecteur-normal'],
    skill: 'droitePlan',
    title: 'Ce que le produit nul ne dit pas',
    prompt: 'Une droite a pour vecteur directeur (2 ; 2 ; 0) et un plan pour vecteur normal (0 ; 0 ; 1). Le produit des deux vaut 0. Que peut-on conclure ?',
    options: [
      'Que la droite ne perce pas le plan — mais il reste à vérifier si un point de la droite y appartient, pour savoir si elle est parallèle ou contenue dedans',
      'Que la droite est parallèle au plan, sans point commun',
      'Que la droite est contenue dans le plan',
      'Que la droite est orthogonale au plan',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le produit nul écarte un seul des trois cas, celui où elle perce. Les deux autres donnent exactement le même produit, et un test de plus est indispensable : un point de la droite vérifie-t-il l’équation du plan ? Oui, elle est dedans ; non, elle est à côté.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P1'] },
  },
  {
    id: 'ev-e2',
    requires: ['critere-droite-plan', 'trois-positions-droite-plan', 'formule-scalaire-espace'],
    skill: 'droitePlan',
    title: 'Combien de points communs',
    prompt: 'Une droite passe par A(0 ; 0 ; 0) et a pour vecteur directeur (2 ; 2 ; 2). Le plan a pour équation z = 0. Combien ont-ils de points communs ?',
    options: ['1', '0', 'une infinité', '2'],
    cols: 4,
    correct: 0,
    explain: 'Le vecteur normal du plan est (0 ; 0 ; 1), et le produit (2 ; 2 ; 2) · (0 ; 0 ; 1) vaut 2, qui n’est pas nul : la droite perce le plan, en un point et un seul. C’est justement en A, puisque A vérifie z = 0. Deux points communs sont impossibles : deux points suffiraient à coucher la droite entière dans le plan.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P1', 'premiere_specialite_espace-droites-plans-1ere_P6'] },
  },
  {
    id: 'ev-e3',
    requires: ['deux-plans-deux-cas', 'critere-deux-plans'],
    skill: 'deuxPlans',
    title: 'Deux plans sécants',
    prompt: 'Les plans d’équations z = 0 et y = 0 ont pour vecteurs normaux (0 ; 0 ; 1) et (0 ; 1 ; 0). Que peut-on affirmer ?',
    options: [
      'Ils sont sécants, et leur intersection est une droite entière',
      'Ils sont sécants, et leur intersection est un point',
      'Ils sont parallèles, puisque le produit de leurs normaux est nul',
      'Ils sont confondus',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les deux normaux ne sont pas colinéaires — aucun nombre ne transforme (0 ; 0 ; 1) en (0 ; 1 ; 0) — donc les plans sont sécants. Deux plans ne se coupent jamais en un seul point : leur intersection est toujours une droite. Le produit nul de leurs normaux dit ici autre chose : ils sont perpendiculaires.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P2'] },
  },
  {
    id: 'ev-e4',
    requires: ['representation-parametrique', 'methode-ecrire-parametrique', 'coordonnees-vecteur-espace'],
    skill: 'parametrique',
    title: 'Écrire une droite',
    prompt: 'Écrire la représentation paramétrique de la droite passant par A(0 ; 0 ; 0) et de vecteur directeur (2 ; 2 ; 2).',
    options: [
      'x = 0 + 2t ; y = 0 + 2t ; z = 0 + 2t',
      'x = 2 + 0t ; y = 2 + 0t ; z = 2 + 0t',
      'x = 0 + 2t ; y = 0 + 2t',
      'x = 2t ; y = 2t ; z = 2 + 2t',
    ],
    cols: 1,
    correct: 0,
    explain: 'Chaque ligne prend la coordonnée du point de départ, puis lui ajoute le paramètre fois la coordonnée du vecteur directeur. Vérification : t = 0 redonne A(0 ; 0 ; 0), et t = 1 donne (2 ; 2 ; 2). La deuxième option a échangé le point et le vecteur ; la troisième a perdu une ligne, et ne décrit donc plus une droite de l’espace.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P5'] },
  },
  {
    id: 'ev-e5',
    requires: ['methode-ecrire-parametrique', 'representation-parametrique'],
    skill: 'parametrique',
    title: 'Le point est-il dessus ?',
    prompt: 'Une droite s’écrit x = 0 + 2t ; y = 0 + 2t ; z = 0 + 0t. Le point (1 ; 1 ; 1) appartient-il à cette droite ?',
    options: [
      'Non : les deux premières lignes donnent t = 0,5, mais la troisième impose une hauteur de 0',
      'Oui : les deux premières lignes donnent toutes deux t = 0,5',
      'Oui : ce point est le centre de la boîte',
      'On ne peut pas conclure, la troisième ligne ayant un coefficient nul',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le MÊME paramètre doit convenir aux TROIS lignes. Ici x et y s’accordent sur t = 0,5, mais la troisième ligne impose z = 0 quel que soit t, alors que le point a pour cote 1. Deux accords sur trois valent un refus. Le point de paramètre 0,5 est en réalité (1 ; 1 ; 0).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P5', 'premiere_specialite_espace-droites-plans-1ere_P1'] },
  },
  {
    id: 'ev-e6',
    requires: ['parallelisme-espace-trois-formes', 'critere-droite-plan'],
    skill: 'parallelisme',
    title: 'Rédiger un parallélisme',
    prompt: 'Comment démontre-t-on qu’une droite est parallèle à un plan, sans être dedans ?',
    options: [
      'En montrant que le produit du vecteur directeur par le vecteur normal est nul, ET qu’un point de la droite n’appartient pas au plan',
      'En montrant que le vecteur directeur et le vecteur normal sont colinéaires',
      'En montrant que le produit du vecteur directeur par le vecteur normal est nul — cela suffit',
      'En montrant sur la figure qu’ils ne se rencontrent pas',
    ],
    cols: 1,
    correct: 0,
    explain: 'Deux lignes, pas une. Le produit nul écarte le cas où la droite perce ; le point hors du plan écarte le cas où elle y est couchée. La troisième option est la démonstration incomplète, vraie une fois sur deux — ce qui est pire que fausse. Et une figure n’est jamais une démonstration : ce qu’on y voit dépend de l’angle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P3'] },
  },
  {
    id: 'ev-e7',
    requires: ['orthogonalite-espace-deux-formes', 'mem-le-role-s-inverse', 'vecteur-normal'],
    skill: 'orthogonalite',
    title: 'Le produit change de camp',
    prompt: 'Une droite a pour vecteur directeur (0 ; 0 ; 2) et un plan pour vecteur normal (0 ; 0 ; 1). Quelle est la position de la droite par rapport au plan ?',
    options: [
      'Elle lui est orthogonale : le directeur est colinéaire au normal',
      'Elle lui est parallèle : le directeur est colinéaire au normal',
      'Elle est contenue dans le plan',
      'On ne peut rien dire : le produit des deux vaut 2, qui n’est ni 0 ni 1',
    ],
    cols: 1,
    correct: 0,
    explain: 'Le vecteur normal sort du plan. Une droite qui porte cette direction pointe donc exactement là où le plan sort, c’est-à-dire perpendiculairement à lui : elle est orthogonale au plan, et donc à toutes les droites de ce plan à la fois. C’est l’inverse du critère pour deux droites, où c’est le produit nul qui donne l’angle droit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P4'] },
  },
  {
    id: 'ev-e8',
    requires: ['equation-cartesienne-plan', 'mem-abc-est-le-normal', 'methode-equation-plan'],
    skill: 'equationPlan',
    title: 'Écrire un plan',
    prompt: 'Quelle est l’équation cartésienne du plan de vecteur normal (1 ; 1 ; 1) passant par le point D(0 ; 2 ; 0) ?',
    options: [
      'x + y + z − 2 = 0',
      'x + y + z − 4 = 0',
      'x + y + z = 0',
      'x − y − z = 0',
    ],
    cols: 2,
    correct: 0,
    explain: 'Les coordonnées du vecteur normal se recopient en a, b et c : l’équation commence par x + y + z. On y remplace ensuite les coordonnées de D, ce qui donne 0 + 2 + 0 + d = 0, donc d = −2. Répondre x + y + z = 0 revient à oublier le dernier geste, et le plan passerait alors par l’origine, ce qui n’est pas le cas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P6'] },
  },
  {
    id: 'ev-e9',
    requires: ['equation-cartesienne-plan', 'critere-deux-plans', 'formule-distance-point-plan'],
    skill: 'equationPlan',
    title: 'Ce que change le dernier nombre',
    prompt: 'Les plans d’équations x + y + z − 2 = 0 et x + y + z − 4 = 0 sont parallèles. Que change le dernier coefficient entre eux ?',
    options: [
      'La position du plan, pas sa direction : les deux gardent le même vecteur normal, et ce nombre dit lequel des deux est le plus loin de l’origine',
      'La direction du plan, ce qui les rend sécants',
      'Rien du tout : deux équations proportionnelles décrivent le même plan',
      'La longueur du vecteur normal',
    ],
    cols: 1,
    correct: 0,
    explain: 'Les trois premiers coefficients donnent la direction — identiques, donc plans parallèles. Le quatrième translate le plan sans le tourner. Ils ne sont pas confondus, puisque −2 diffère de −4, et la distance qui les sépare se calcule en prenant un point de l’un et sa distance à l’autre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P6', 'premiere_specialite_espace-droites-plans-1ere_P2'] },
  },
  {
    id: 'ev-e10',
    requires: ['formule-distance-point-plan', 'methode-distance-espace', 'formule-norme-espace'],
    skill: 'distance',
    title: 'La distance, dénominateur compris',
    prompt: 'Quelle est la distance du point A(0 ; 0 ; 0) au plan d’équation x + y + z − 2 = 0 ?',
    options: ['2√3/3', '2', '4√3/3', '√3'],
    cols: 4,
    correct: 0,
    explain: 'On remplace : 0 + 0 + 0 − 2 = −2, dont la valeur absolue vaut 2. Le vecteur normal est (1 ; 1 ; 1), de longueur √3. La distance vaut donc 2/√3, soit 2√3/3, environ 1,15. Répondre 2, c’est avoir oublié le dénominateur — l’écart dépasse 0,8, ce n’est pas un arrondi. Répondre 4√3/3, c’est avoir pris le point G au lieu de A.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_espace-droites-plans-1ere_P7'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  droitePlan: { label: 'Droite et plan', module: 2 },
  deuxPlans: { label: 'Deux plans', module: 3 },
  parametrique: { label: 'Représentation paramétrique', module: 4 },
  equationPlan: { label: 'Équation d’un plan', module: 5 },
  parallelisme: { label: 'Démontrer un parallélisme', module: 6 },
  orthogonalite: { label: 'Démontrer une orthogonalité', module: 6 },
  distance: { label: 'Distances', module: 7 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Trois positions', test: (m) => !m.droitePlan },
  { id: 'b2', emoji: '🏅', label: 'Deux plans, deux cas', test: (m) => !m.deuxPlans },
  { id: 'b3', emoji: '🏅', label: 'Le paramètre qui parcourt', test: (m) => !m.parametrique },
  { id: 'b4', emoji: '🏅', label: 'a, b, c et le normal', test: (m) => !m.equationPlan },
  { id: 'b5', emoji: '🏅', label: 'Démontrer, pas montrer', test: (m) => !m.parallelisme && !m.orthogonalite },
  { id: 'b6', emoji: '🏅', label: 'Dénominateur compris', test: (m) => !m.distance },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des plans', test: (m) => Object.keys(m).length === 0 },
];

export default function Module08MissionFinaleLaBoitePercee() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la boîte percée"
      moduleSubtitle="Dix épreuves : trois positions, deux écritures, deux démonstrations, une distance"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître des plans',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexes : un produit nul ne conclut jamais seul,
            les trois lignes s’écrivent toutes les trois, et une distance se divise{' '}
            <strong>toujours</strong> par la longueur du normal.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '⊙', label: 'directeur · normal', value: '≠ 0 ⇒ elle perce' },
        { id: 'r2', emoji: '∈', label: 'produit nul', value: 'puis un point' },
        { id: 'r3', emoji: '∥', label: 'deux plans', value: 'normaux colinéaires' },
        { id: 'r4', emoji: '→', label: 'une droite', value: 'trois lignes en t' },
        { id: 'r5', emoji: '▱', label: 'un plan', value: 'ax + by + cz + d = 0' },
        { id: 'r6', emoji: '📏', label: 'la distance', value: '|…| / √(a² + b² + c²)' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître des plans !',
        title: 'Mission accomplie',
        message: 'Tu sais trancher les positions relatives par le calcul, écrire une droite par un paramètre et un plan par une équation, démontrer un parallélisme comme une orthogonalité, et mesurer une distance dans l’espace — sans jamais te fier au dessin.',
        verbs: ['Trancher', 'Écrire', 'Démontrer', 'Mesurer'],
        masterBadgeLabel: 'Maître des plans',
      }}
    />
  );
}
