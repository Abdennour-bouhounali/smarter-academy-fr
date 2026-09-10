import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — ÉVALUATION.
 *
 * CONNAISSANCES AVANT LA DEMANDE. La mission finale CONSOLIDE : elle
 * n'introduit rien de neuf — ni concept, ni vocabulaire, ni notation, options
 * et distracteurs compris — et chaque épreuve déclare les connaissances qu'elle
 * exige, toutes posées par une brique des modules 1 à 5 ou par le
 * `priorKnowledge` de la leçon.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 inverser un conditionnement ........ e1 (seule), e2, e10
 *   P2 reconnaître l'indépendance ......... e3 (seule), e5, e7
 *   P3 vérifier par le calcul ............. e4 (seule), e5, e8
 *   P4 indépendance ≠ incompatibilité ..... e6 (seule), e7, e8
 *   P5 problème concret ................... e9 (seule), e2, e10
 *
 * DISTRACTEURS, tous CALCULÉS et vérifiés distincts — en fraction exacte ET
 * après mise en forme en pourcentage (data.js `BOSS_NUMBERS`,
 * components/indepUtils.test.js). Chacun est une erreur que la leçon a nommée :
 *   e1  échanger les deux lettres au lieu de changer de dénominateur
 *   e2  prendre le total, ou l'autre sens, pour dénominateur
 *   e4  additionner P(A) et P(B) au lieu de les multiplier
 *   e5  conclure sur une ressemblance de pourcentages
 *   e8  appliquer le produit à deux événements qui s'excluent
 *
 * LES CINQ AUTRES épreuves sont qualitatives : leurs options sont des phrases,
 * et c'est le texte qui les distingue, pas un nombre.
 */
const EPREUVES = [
  {
    id: 'pi-e1',
    requires: ['inverser-le-conditionnement', 'mem-numerateur-commun', 'conditionnelle-sur-effectifs'],
    skill: 'inverser',
    title: 'Le sens qu’on te demande',
    prompt: 'Sur 500 candidats à un concours, 100 ont suivi une préparation et 90 d’entre eux sont reçus. Il y a 200 reçus en tout. Un candidat reçu est choisi au hasard : quelle est la probabilité qu’il ait suivi la préparation ?',
    options: ['45 %', '90 %', '18 %', '40 %'],
    cols: 4,
    correct: 0,
    explain: 'Le groupe de référence est celui des reçus : ils sont 200, et 90 d’entre eux étaient préparés. 90 ÷ 200 = 0,45, soit 45 %. Répondre 90 %, c’est donner l’autre sens — la part de reçus parmi les préparés. Répondre 18 %, c’est diviser par les 500 candidats.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-independance-1ere_P1'] },
  },
  {
    id: 'pi-e2',
    requires: ['inverser-le-conditionnement', 'conditionnelle-sur-effectifs', 'methode-probleme-deux-sens'],
    skill: 'inverser',
    title: 'Le taux de rebut',
    prompt: 'Un atelier produit 2 000 pièces : 1 200 par la machine 1, dont 60 défectueuses, et 800 par la machine 2, dont 40 défectueuses. Une pièce de la machine 1 est prélevée : quelle est la probabilité qu’elle soit défectueuse ?',
    options: ['5 %', '3 %', '60 %', '10 %'],
    cols: 4,
    correct: 0,
    explain: 'Le groupe de référence est la production de la machine 1 : 1 200 pièces, dont 60 défectueuses. 60 ÷ 1 200 = 0,05, soit 5 %. Répondre 3 %, c’est diviser par les 2 000 pièces ; répondre 60 %, c’est l’autre sens — la part de la machine 1 parmi les défectueuses.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-independance-1ere_P1', 'premiere_specialite_probabilites-independance-1ere_P5'] },
  },
  {
    id: 'pi-e3',
    requires: ['independance', 'savoir-ne-change-rien', 'poids-conditionnels'],
    skill: 'reconnaitre',
    title: 'Ce que le mot veut dire',
    prompt: 'Sur un arbre à deux niveaux, les deux branches « réussite » du second niveau portent toutes deux 0,30. Que peut-on en conclure ?',
    options: [
      'Savoir laquelle des deux premières branches a été suivie n’apprend rien sur la réussite',
      'La réussite est impossible dans l’une des deux branches',
      'Les deux branches du premier niveau portent elles aussi 0,30',
      'Les deux premières branches concernent le même nombre d’individus',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un poids de second niveau se lit « parmi ceux-là… ». Quand les deux valent la même chose, se placer dans l’une ou l’autre branche ne change pas le résultat. Cela ne dit rien du premier niveau, dont les poids peuvent être très déséquilibrés : 300 pièces d’un côté et 900 de l’autre donnent le même verdict.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-independance-1ere_P2'] },
  },
  {
    id: 'pi-e4',
    requires: ['test-du-produit', 'methode-verifier-independance', 'probabilite'],
    skill: 'verifier',
    title: 'Le test du produit',
    prompt: 'Deux événements A et B sont indépendants, avec P(A) = 0,25 et P(B) = 0,4. Combien vaut P(A ∩ B) ?',
    options: ['10 %', '65 %', '15 %', '25 %'],
    cols: 4,
    correct: 0,
    explain: '0,25 × 0,4 = 0,1, soit 10 %. Répondre 65 %, c’est avoir additionné les deux probabilités ; 15 %, c’est les avoir soustraites. La propriété porte sur un produit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-independance-1ere_P3'] },
  },
  {
    id: 'pi-e5',
    requires: ['reconnaitre-sur-arbre', 'test-du-produit', 'methode-verifier-independance'],
    skill: 'verifier',
    title: 'Le presque-cas',
    prompt: 'Sur 1 000 élèves, 124 des 400 demi-pensionnaires sont au club de sport (31 %), contre 180 des 600 externes (30 %). Ces deux événements sont-ils indépendants ?',
    options: [
      'Non : 124 × 1 000 = 124 000 alors que 400 × 304 = 121 600 — l’égalité est fausse',
      'Oui : 31 % et 30 %, c’est la même chose à un point près',
      'Oui : les deux groupes n’ont pas le même effectif, un léger écart est attendu',
      'Non : il faudrait que les deux groupes aient le même effectif pour conclure',
    ],
    cols: 1,
    correct: 0,
    explain: 'La propriété est une égalité, pas une ressemblance : un écart de 2 400 sur le produit croisé suffit à la faire tomber. Et l’effectif des groupes n’entre pas dans le verdict — deux groupes de tailles très différentes peuvent parfaitement donner l’égalité.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-independance-1ere_P2', 'premiere_specialite_probabilites-independance-1ere_P3'] },
  },
  {
    id: 'pi-e6',
    requires: ['incompatibles', 'mem-deux-mots', 'independance'],
    skill: 'distinguer',
    title: 'Les deux mots',
    prompt: 'Lequel de ces énoncés décrit deux événements INCOMPATIBLES ?',
    options: [
      'Une carte tirée est un cœur ; cette même carte est un pique',
      'Une carte tirée est un cœur ; cette même carte est un roi',
      'Un élève porte des lunettes ; ce même élève est au club de sport',
      'Une pièce vient de la machine 1 ; cette même pièce est défectueuse',
    ],
    cols: 1,
    correct: 0,
    explain: 'Une carte ne peut pas être à la fois cœur et pique : aucune carte ne vérifie les deux, l’intersection est vide. Les trois autres paires ont au contraire des cas communs — le roi de cœur, les élèves qui cumulent, les pièces ratées de la machine 1.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-independance-1ere_P4'] },
  },
  {
    id: 'pi-e7',
    requires: ['incompatible-nest-pas-independant', 'mem-deux-mots', 'independance', 'incompatibles'],
    skill: 'distinguer',
    title: 'Ce que l’exclusion apprend',
    prompt: 'A et B ne peuvent pas se produire ensemble, et chacun a une probabilité non nulle. Que peut-on en dire ?',
    options: [
      'Ils ne sont pas indépendants : savoir que A s’est produit donne la certitude que B ne s’est pas produit',
      'Ils sont indépendants, puisqu’ils n’ont aucun cas commun',
      'Ils sont indépendants si et seulement si leurs probabilités sont égales',
      'On ne peut rien en dire sans connaître les effectifs',
    ],
    cols: 1,
    correct: 0,
    explain: 'P(A ∩ B) vaut 0 tandis que P(A) × P(B) est strictement positif : le test échoue toujours. Et l’information apportée est maximale, pas nulle — c’est l’opposé de ce que décrit l’autre mot. Aucun effectif n’est nécessaire : le raisonnement vaut dans tous les cas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-independance-1ere_P4', 'premiere_specialite_probabilites-independance-1ere_P2'] },
  },
  {
    id: 'pi-e8',
    requires: ['incompatible-nest-pas-independant', 'test-du-produit', 'incompatibles'],
    skill: 'distinguer',
    title: 'Le produit qui ne s’applique pas',
    prompt: 'A et B ne peuvent pas se produire ensemble, avec P(A) = 0,3 et P(B) = 0,2. Combien vaut P(A ∩ B) ?',
    options: ['0 %', '6 %', '50 %', '20 %'],
    cols: 4,
    correct: 0,
    explain: 'Ils ne se produisent jamais ensemble : l’intersection est vide, donc P(A ∩ B) = 0. Répondre 6 %, c’est appliquer le produit 0,3 × 0,2 — mais ce produit ne vaut l’intersection que pour des événements indépendants, ce qu’ils ne sont justement pas. L’écart entre 0 et 6 % est précisément la preuve qu’ils ne le sont pas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-independance-1ere_P4', 'premiere_specialite_probabilites-independance-1ere_P3'] },
  },
  {
    id: 'pi-e9',
    requires: ['methode-probleme-deux-sens', 'test-du-produit', 'methode-verifier-independance'],
    skill: 'resoudre',
    title: 'Le verdict de l’atelier',
    prompt: 'Toujours les 2 000 pièces : 1 200 de la machine 1 dont 60 défectueuses, 800 de la machine 2 dont 40 défectueuses. Le chef d’atelier accuse la machine 1, qui produit 60 des 100 rebuts. A-t-il raison ?',
    options: [
      'Non : chaque machine rate 5 % de sa production, la machine 1 en rate plus parce qu’elle produit plus',
      'Oui : 60 rebuts contre 40, la machine 1 est la moins fiable',
      'Oui : 60 % des rebuts viennent d’elle, c’est plus de la moitié',
      'On ne peut pas trancher sans connaître le nombre d’heures de fonctionnement',
    ],
    cols: 1,
    correct: 0,
    explain: '60 ÷ 1 200 = 5 % et 40 ÷ 800 = 5 % : les deux taux sont identiques. Le test le confirme : 60 × 2 000 = 120 000 = 1 200 × 100. Comparer 60 rebuts à 40 revient à comparer deux effectifs bruts sur des productions inégales.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-independance-1ere_P5'] },
  },
  {
    id: 'pi-e10',
    requires: ['methode-probleme-deux-sens', 'inverser-le-conditionnement', 'phrase-population-reference'],
    skill: 'resoudre',
    title: 'La phrase du rapport',
    prompt: 'Un rapport annonce : « 60 % des pièces rebutées viennent de la machine 1. » Quelle phrase dit la même chose sans induire en erreur ?',
    options: [
      'Parmi les pièces rebutées, 6 sur 10 viennent de la machine 1 — qui produit d’ailleurs 6 pièces sur 10',
      'La machine 1 rate 60 % de ce qu’elle produit',
      '60 % des pièces de l’atelier viennent de la machine 1 et sont rebutées',
      'Une pièce de la machine 1 a 6 chances sur 10 d’être rebutée',
    ],
    cols: 1,
    correct: 0,
    explain: 'La phrase juste nomme son groupe de référence : les pièces rebutées. Les trois autres changent de groupe — la production de la machine 1, ou l’atelier entier — et deviennent fausses : la machine 1 ne rate que 5 % de sa production, et les pièces à la fois de la machine 1 et rebutées ne font que 3 % de l’atelier.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_probabilites-independance-1ere_P5', 'premiere_specialite_probabilites-independance-1ere_P1'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  inverser: { label: 'Retourner un conditionnement', module: 2 },
  reconnaitre: { label: 'Reconnaître l’indépendance', module: 3 },
  verifier: { label: 'Vérifier par le calcul', module: 4 },
  distinguer: { label: 'Ne pas confondre les deux mots', module: 5 },
  resoudre: { label: 'Résoudre un problème concret', module: 5 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Retourneur de quotients', test: (m) => !m.inverser },
  { id: 'b2', emoji: '🏅', label: 'Œil exercé', test: (m) => !m.reconnaitre },
  { id: 'b3', emoji: '🏅', label: 'Juge du produit', test: (m) => !m.verifier },
  { id: 'b4', emoji: '🏅', label: 'Séparateur de mots', test: (m) => !m.distinguer },
  { id: 'b5', emoji: '🏅', label: 'Chef d’atelier', test: (m) => !m.resoudre },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des deux sens', test: (m) => Object.keys(m).length === 0 },
];

export default function Module06MissionFinaleLesDeuxSens() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : les deux sens"
      moduleSubtitle="Dix épreuves : un dénominateur qui change de camp, une égalité qui tranche, deux mots à ne pas confondre"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître des deux sens',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Réflexe : nommer le groupe de référence avant de
            diviser, et ne jamais conclure sur une ressemblance quand une égalité peut être
            vérifiée.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🔀', label: 'retourner', value: 'même haut, autre bas' },
        { id: 'r2', emoji: '🌳', label: 'sur l’arbre', value: 'les deux poids coïncident' },
        { id: 'r3', emoji: '✖️', label: 'le test', value: 'P(A ∩ B) = P(A) × P(B)' },
        { id: 'r4', emoji: '🔢', label: 'en entiers', value: 'n(A ∩ B) × N = n(A) × n(B)' },
        { id: 'r5', emoji: '🚫', label: 'qui s’excluent', value: 'jamais indépendants' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître des deux sens !',
        title: 'Mission accomplie',
        message: 'Tu sais retourner un conditionnement sans te tromper de population, reconnaître l’indépendance sur un arbre, la vérifier par une égalité qui ne dépend d’aucun arrondi, et ne jamais la confondre avec deux événements qui s’excluent.',
        verbs: ['Retourner', 'Reconnaître', 'Vérifier', 'Distinguer'],
        masterBadgeLabel: 'Maître des deux sens',
      }}
    />
  );
}
