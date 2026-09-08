import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test CONSOLIDE :
 * il n'introduit ni concept, ni vocabulaire, ni notation neufs
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * TRANSFERT, pas répétition (§45) : aucune épreuve ne reprend les valeurs des
 * modules. Les contextes changent (course, peinture, terrain, lecture) et
 * chaque distracteur encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   — ne multiplier qu'un seul des deux termes (M2) ;
 *   — s'arrêter avant la simplification maximale (M3) ;
 *   — croire qu'un grand dénominateur fait un grand nombre (M4) ;
 *   — comparer les numérateurs sans re-graduer (M4) ;
 *   — additionner numérateurs ET dénominateurs (M5) ;
 *   — multiplier au lieu de partager pour une fraction d'une quantité (M6).
 *
 * PÉRIMÈTRE 5e — vérifié épreuve par épreuve : aucun couple de dénominateurs
 * quelconques, aucun produit ou quotient de fractions, aucune fraction
 * négative. Toutes les additions portent sur des dénominateurs multiples.
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur. Les 7 LPs sont tous couverts.
 *
 * `badges[].test` est une FONCTION (m) => bool — un objet y provoquerait
 * « b.test is not a function » au montage.
 */
const SKILLS = {
  nombre: { label: 'La fraction est un nombre', emoji: '📍', module: 1 },
  egales: { label: 'Fractions égales', emoji: '🟰', module: 2 },
  simplifier: { label: 'Simplifier', emoji: '✂️', module: 3 },
  comparer: { label: 'Comparer', emoji: '⚖️', module: 4 },
  calculer: { label: 'Additionner et soustraire', emoji: '➕', module: 5 },
  quantite: { label: 'Fraction d’une quantité', emoji: '🍰', module: 6 },
};

const BADGES = [
  { id: 'b-nombre', emoji: '📍', label: 'Placeur de fractions', test: (m) => !m.nombre },
  { id: 'b-egales', emoji: '🟰', label: 'Maître des écritures', test: (m) => !m.egales },
  { id: 'b-comparer', emoji: '⚖️', label: 'Juge des parts', test: (m) => !m.comparer },
  { id: 'b-calculer', emoji: '➕', label: 'Compteur de parts', test: (m) => !m.calculer },
  { id: 'b-quantite', emoji: '🍰', label: 'Partageur exact', test: (m) => !m.quantite },
  { id: 'b-parfait', emoji: '💎', label: 'Le bon nombre', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'nr5r-e1',
    skill: 'nombre',
    title: 'Sur la piste',
    prompt: 'Une piste mesure 1 km. Un coureur s’arrête après 5/4 de tour. Où est-il ?',
    options: [
      'Entre 1 et 2 tours : il a dépassé la ligne d’arrivée d’un quart de tour',
      'Entre 0 et 1 tour : une fraction est toujours plus petite que 1',
      'Exactement sur la ligne de départ',
      'À la moitié du parcours',
    ],
    cols: 1,
    requires: ['fraction-nombre'],
    explain: '5/4, c’est quatre quarts (soit 1 tour entier) plus un quart. Le coureur est donc entre 1 et 2 tours. Une fraction peut parfaitement dépasser 1 : elle occupe simplement sa place sur la droite.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-rationnels-5e_P1'] },
  },
  {
    id: 'nr5r-e2',
    skill: 'nombre',
    title: 'Entre quels entiers ?',
    prompt: 'Entre quels deux nombres entiers se situe 17/5 ?',
    options: ['Entre 3 et 4', 'Entre 5 et 17', 'Entre 2 et 3', 'Entre 17 et 18'],
    cols: 4,
    requires: ['fraction-nombre'],
    explain: '5/5 fait 1, donc 15/5 fait 3. Il reste 2/5, ce qui place 17/5 juste après 3, donc entre 3 et 4.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-rationnels-5e_P1'] },
  },
  {
    id: 'nr5r-e3',
    skill: 'egales',
    title: 'La même part',
    prompt: 'Laquelle de ces fractions est égale à 3/7 ?',
    options: ['12/28', '3/14', '6/7', '10/14'],
    cols: 4,
    requires: ['fractions-egales', 'mem-deux-termes'],
    explain: '12/28 s’obtient en multipliant les DEUX termes de 3/7 par 4. Dans 3/14, seul le dénominateur a doublé ; dans 6/7, seul le numérateur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-rationnels-5e_P2'] },
  },
  {
    id: 'nr5r-e4',
    skill: 'egales',
    title: 'Compléter',
    prompt: 'On écrit 5/6 avec 30 pour dénominateur. Quel est le numérateur ?',
    options: ['25', '5', '29', '150'],
    cols: 4,
    requires: ['fractions-egales'],
    explain: 'De 6 à 30, on multiplie par 5. Le numérateur suit le même facteur : 5 × 5 = 25, donc 25/30. (Laisser 5 revient à n’avoir multiplié que le dénominateur.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-rationnels-5e_P2'] },
  },
  {
    id: 'nr5r-e5',
    skill: 'simplifier',
    title: 'Au plus simple',
    prompt: 'Quelle est l’écriture la plus simple de 18/24 ?',
    options: ['3/4', '9/12', '6/8', '18/24 est déjà au maximum'],
    cols: 4,
    requires: ['simplifier'],
    explain: 'Les diviseurs communs de 18 et 24 sont 1, 2, 3 et 6. En divisant par 6 : 3/4. Les réponses 9/12 et 6/8 désignent bien le même nombre, mais on peut encore les regrouper.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-rationnels-5e_P3'] },
  },
  {
    id: 'nr5r-e6',
    skill: 'comparer',
    title: 'La plus grosse part',
    prompt: 'Trois amis partagent trois gâteaux identiques. Léa prend 1/4 du sien, Tom 1/6 du sien, Zoé 1/3 du sien. Qui a la plus grosse part ?',
    options: ['Zoé', 'Tom', 'Léa', 'Elles sont toutes égales : chacun a une part'],
    cols: 2,
    requires: ['comparer-fractions'],
    explain: 'À numérateur égal, plus le dénominateur est grand, plus les parts sont fines. Un tiers est plus gros qu’un quart, lui-même plus gros qu’un sixième : c’est donc Zoé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-rationnels-5e_P4'] },
  },
  {
    id: 'nr5r-e7',
    skill: 'comparer',
    title: 'Ranger',
    prompt: 'Range dans l’ordre croissant : 5/6 ; 7/12 ; 11/12.',
    options: [
      '7/12 < 5/6 < 11/12',
      '5/6 < 7/12 < 11/12',
      '7/12 < 11/12 < 5/6',
      '11/12 < 7/12 < 5/6',
    ],
    cols: 1,
    requires: ['comparer-fractions', 'graduation-commune'],
    explain: 'On met tout en douzièmes : 5/6 = 10/12. On compare alors 7, 10 et 11 douzièmes, ce qui donne 7/12 < 5/6 < 11/12.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-rationnels-5e_P4'] },
  },
  {
    id: 'nr5r-e8',
    skill: 'calculer',
    title: 'Le mur à peindre',
    prompt: 'Un peintre a fait 1/3 d’un mur le matin, et 5/12 l’après-midi. Quelle part du mur a-t-il peinte en tout ?',
    options: ['9/12', '6/15', '6/12', '5/36'],
    cols: 4,
    requires: ['additionner-fractions', 'graduation-commune'],
    explain: '12 est un multiple de 3 : 1/3 = 4/12. Puis 4/12 + 5/12 = 9/12 (soit les trois quarts du mur). La réponse 6/15 vient d’avoir additionné les numérateurs ET les dénominateurs — impossible, puisque le résultat serait plus petit que 5/12.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-rationnels-5e_P5'] },
  },
  {
    id: 'nr5r-e9',
    skill: 'calculer',
    title: 'Ce qu’il reste du livre',
    prompt: 'Un élève a lu 5/8 d’un livre. Quelle part lui reste-t-il à lire ?',
    options: ['3/8', '5/8', '3/16', '8/5'],
    cols: 4,
    requires: ['additionner-fractions'],
    explain: 'Le livre entier vaut 8/8. Il reste 8/8 − 5/8 = 3/8. Les dénominateurs étant déjà égaux, il n’y a rien à re-graduer : on retire simplement les numérateurs.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-rationnels-5e_P6'] },
  },
  {
    id: 'nr5r-e10',
    skill: 'quantite',
    title: 'Le terrain',
    prompt: 'Un terrain de 350 m² est occupé aux 2/5 par un potager. Quelle est la surface du potager ?',
    options: ['140 m²', '875 m²', '70 m²', '210 m²'],
    cols: 4,
    requires: ['fraction-quantite'],
    explain: 'On partage en 5 : 350 ÷ 5 = 70 m² pour une part. On en prend 2 : 2 × 70 = 140 m². (70 m² ne serait qu’UNE part ; 875 m² viendrait d’une multiplication au lieu d’un partage, et dépasserait le terrain entier.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['5e_nombres-rationnels-5e_P7'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le bon nombre"
      moduleSubtitle="Dix épreuves pour prouver qu’une fraction est bien un nombre"
      estimatedTime="6 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Le bon nombre',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, reviens à la même image :{' '}
            <strong>où ce nombre se place-t-il sur la droite ?</strong>
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📍', label: 'Une fraction', value: 'un nombre, une position' },
        { id: 'r2', emoji: '🟰', label: 'Fractions égales', value: 'le même geste en haut et en bas' },
        { id: 'r3', emoji: '⚖️', label: 'Comparer', value: 'même graduation d’abord' },
        { id: 'r4', emoji: '🍰', label: 'Fraction d’une quantité', value: 'je partage, puis je prends' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Le bon nombre !',
        title: 'Mission accomplie',
        message: 'Tu sais placer, réécrire, simplifier, comparer et calculer avec les fractions.',
        verbs: ['Placer', 'Réécrire', 'Comparer', 'Calculer'],
        masterBadgeLabel: 'Le bon nombre',
      }}
    />
  );
}
