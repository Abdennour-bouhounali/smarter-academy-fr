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
 * et distracteurs compris — et chaque épreuve déclare les connaissances
 * qu'elle exige, toutes posées par une brique des modules 1 à 6.
 *
 * COUVERTURE. Chaque LP a au moins une épreuve qui lui est PROPRE, pour que le
 * profil de maîtrise soit interprétable :
 *   P1 terme de rang n, arithmétique ..... e1 (seule), e2 (seule), e6
 *   P2 terme de rang n, géométrique ...... e3 (seule), e4
 *   P3 somme arithmétique ................ e5 (seule), e6 (seule)
 *   P4 somme géométrique ................. e7 (seule), e8 (seule)
 *   P5 modéliser ......................... e9 (seule), e4
 *   P6 interpréter ....................... e10 (seule), e9
 *
 * DISTRACTEURS, tous CALCULÉS et vérifiés DISTINCTS de la bonne réponse et
 * entre eux (components/sommesUtils.test.js, bloc « boss ») : rang décalé d'un
 * cran (e1, e3, e4), premier terme oublié (e1, e2), signe de la raison ignoré
 * (e2), « multiplier n fois » lu « multiplier par n » (e3), intérêts simples
 * (e4), nombre de termes compté à n au lieu de n + 1 (e5, e6), division par 2
 * oubliée (e5, e6), dernier terme pris pour la somme (e6, e8), exposant n au
 * lieu de n + 1 (e7), « − 1 » oublié (e7), limite prise pour la somme finie
 * (e8), hausse lue à la place d'une baisse (e9), terme confondu avec somme
 * (e10).
 *
 * UN DÉFAUT ATTRAPÉ PAR CE TEST : dans une première rédaction, l'épreuve e4
 * proposait « 5 000 × 1,24 » comme piège « 24 % en tout ». Or ce nombre vaut
 * EXACTEMENT 5 000 × (1 + 0,03 × 8) = 6 200, le piège des intérêts simples :
 * deux options identiques, épreuve insoluble. Le piège a été remplacé par le
 * décalage d'exposant.
 */
const EPREUVES = [
  {
    id: 'sm-e1',
    requires: ['terme-rang-arithmetique', 'mem-les-deux-sauts'],
    skill: 'sauter',
    title: 'Le rang 20',
    prompt: 'Une suite arithmétique a pour premier terme u(0) = 4 et pour raison 6. Que vaut u(20) ?',
    options: ['124', '120', '118', '1 344'],
    cols: 4,
    correct: 0,
    explain: 'u(20) = 4 + 20 × 6 = 4 + 120 = 124. Répondre 120, c’est avoir oublié le premier terme ; 118 est le terme de rang 19 ; 1 344 est la SOMME des vingt et un premiers termes, pas un terme.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P1'] },
  },
  {
    id: 'sm-e2',
    requires: ['raison-negative-meme-formule', 'terme-rang-arithmetique'],
    skill: 'sauter',
    title: 'Une raison négative',
    prompt: 'Une suite arithmétique a pour premier terme 100 et pour raison −4. Que vaut son terme de rang 15 ?',
    options: ['40', '160', '44', '−60'],
    cols: 4,
    correct: 0,
    explain: '100 + 15 × (−4) = 100 − 60 = 40. Répondre 160, c’est avoir ajouté 4 au lieu de le retrancher : le signe de la raison entre dans la multiplication. 44 est le terme de rang 14, et −60 est seulement ce qu’on a retranché en tout.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P1'] },
  },
  {
    id: 'sm-e3',
    requires: ['terme-rang-geometrique', 'puissance'],
    skill: 'sauter',
    title: 'Dix fois « × 2 »',
    prompt: 'Une suite géométrique a pour premier terme 3 et pour raison 2. Que vaut son terme de rang 10 ?',
    options: ['3 072', '60', '1 536', '6 144'],
    cols: 4,
    correct: 0,
    explain: '3 × 2¹⁰ = 3 × 1 024 = 3 072. Répondre 60, c’est avoir multiplié PAR 10 (3 × 2 × 10) au lieu de multiplier DIX FOIS. 1 536 est le terme de rang 9 ; 6 144 utilise l’exposant 11, un cran de trop.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P2'] },
  },
  {
    id: 'sm-e4',
    requires: ['terme-rang-geometrique', 'choisir-le-modele', 'coefficient-multiplicateur'],
    skill: 'modeliser',
    title: 'Un placement à 3 %',
    prompt: 'On place 5 000 € sur un compte qui rapporte 3 % chaque année. Que contient le compte au bout de 8 ans ?',
    options: ['6 333,85 €', '6 200 €', '6 149,37 €', '6 523,87 €'],
    cols: 2,
    correct: 0,
    explain: 'Chaque année on multiplie par 1,03 : 5 000 × 1,03⁸ ≈ 6 333,85 €. Répondre 6 200 €, c’est avoir ajouté huit fois 3 % de la somme de DÉPART (5 000 × 1,24), alors que les intérêts portent chaque année sur ce qu’il y a déjà. 6 149,37 € est le montant après 7 ans, et 6 523,87 € après 9.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P2', 'premiere_specialite_suites-calculer-modeliser-1ere_P5'] },
  },
  {
    id: 'sm-e5',
    requires: ['mem-somme-arithmetique', 'appariement-de-gauss'],
    skill: 'sommer',
    title: 'De 1 à 100',
    prompt: 'Combien font 1 + 2 + 3 + … + 100 ?',
    options: ['5 050', '4 999,5', '10 100', '10 000'],
    cols: 4,
    correct: 0,
    explain: 'Il y a 100 termes ; le premier vaut 1 et le dernier 100. La somme fait 100 × (1 + 100) ÷ 2 = 100 × 101 ÷ 2 = 5 050. Répondre 10 100, c’est avoir oublié la division par 2 — on aurait compté chaque paire deux fois. 4 999,5 compte 99 termes au lieu de 100.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P3'] },
  },
  {
    id: 'sm-e6',
    requires: ['mem-somme-arithmetique', 'terme-rang-arithmetique', 'colonne-centrale-impaire'],
    skill: 'sommer',
    title: 'Du rang 0 au rang 20',
    prompt: 'Une suite arithmétique a pour premier terme 5 et pour raison 3. Combien vaut la somme de ses termes, du rang 0 au rang 20 ?',
    options: ['735', '700', '65', '1 470'],
    cols: 4,
    correct: 0,
    explain: 'Le dernier terme vaut 5 + 20 × 3 = 65, et il y a 21 termes (le rang 0 en fait partie). La somme fait 21 × (5 + 65) ÷ 2 = 21 × 70 ÷ 2 = 735. Répondre 700, c’est avoir compté 20 termes au lieu de 21 ; 65 est le dernier TERME, pas la somme ; 1 470 oublie la division par 2.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P3'] },
  },
  {
    id: 'sm-e7',
    requires: ['mem-somme-geometrique', 'telescopage'],
    skill: 'sommer',
    title: 'Les puissances de 2',
    prompt: 'Combien font 1 + 2 + 4 + 8 + … + 1 024 (les termes de rang 0 à 10 d’une suite géométrique de premier terme 1 et de raison 2) ?',
    options: ['2 047', '1 024', '1 023', '2 048'],
    cols: 4,
    correct: 0,
    explain: 'S = 1 × (1 − 2¹¹) ÷ (1 − 2) = (2¹¹ − 1) ÷ 1 = 2 048 − 1 = 2 047. L’exposant vaut 11, le NOMBRE de termes, pas 10 : répondre 1 023 revient à utiliser l’exposant 10. 1 024 est le dernier terme, et 2 048 oublie le « − 1 ».',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P4'] },
  },
  {
    id: 'sm-e8',
    requires: ['mem-somme-geometrique', 'telescopage'],
    skill: 'sommer',
    title: 'Une raison plus petite que 1',
    prompt: 'Combien font 16 + 8 + 4 + 2 + 1 ?',
    options: ['31', '32', '15,5', '1'],
    cols: 4,
    correct: 0,
    explain: '16 × (1 − 0,5⁵) ÷ (1 − 0,5) = 16 × (1 − 0,03125) ÷ 0,5 = 31. Répondre 32, c’est la valeur dont la somme s’approche si l’on continue indéfiniment — elle ne l’atteint jamais avec un nombre fini de termes. 15,5 oublie la division par (1 − q), et 1 est le dernier terme.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P4'] },
  },
  {
    id: 'sm-e9',
    requires: ['choisir-le-modele', 'coefficient-multiplicateur', 'suite-geometrique'],
    skill: 'modeliser',
    title: 'Une ville qui se vide',
    prompt: 'Une ville de 12 000 habitants perd 4 % de sa population chaque année. Quelle suite modélise cette évolution ?',
    options: [
      'Géométrique de raison 0,96, de premier terme 12 000',
      'Géométrique de raison 1,04, de premier terme 12 000',
      'Géométrique de raison 0,04, de premier terme 12 000',
      'Arithmétique de raison −4, de premier terme 12 000',
    ],
    cols: 1,
    correct: 0,
    explain: 'Une baisse de 4 % laisse 96 % de la population : on multiplie par 1 − 0,04 = 0,96. La raison 1,04 décrirait une HAUSSE ; la raison 0,04 ne laisserait que 4 % chaque année ; et une raison −4 ferait perdre 4 habitants par an, pas 4 %.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P5'] },
  },
  {
    id: 'sm-e10',
    requires: ['interpreter-le-modele', 'mem-somme-arithmetique', 'terme-rang-arithmetique'],
    skill: 'interpreter',
    title: 'Le solde ou le total versé ?',
    prompt: 'Un compte contient 800 € et l’on y verse 60 € chaque mois. Au bout de 12 mois, le compte contient 1 520 €. Que vaut alors le total VERSÉ sur ces 12 mois ?',
    options: ['720 €', '1 520 €', '15 080 €', '800 €'],
    cols: 4,
    correct: 0,
    explain: '12 × 60 = 720 €. Les 1 520 € du compte sont un TERME de la suite : ils comprennent les 800 € qui s’y trouvaient déjà. 15 080 € serait la somme de tous les soldes mensuels, un calcul juste qui ne répond à aucune question ici. Un terme, une somme et un état initial sont trois nombres différents.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['premiere_specialite_suites-calculer-modeliser-1ere_P6'] },
  },
];

// `module` pointe le module qui ENSEIGNE la compétence, jamais l'évaluation
// elle-même : le boss mesure, il n'enseigne pas.
const SKILLS = {
  sauter: { label: 'Atteindre un rang lointain', module: 2 },
  sommer: { label: 'Additionner les premiers termes', module: 4 },
  modeliser: { label: 'Modéliser une situation', module: 6 },
  interpreter: { label: 'Interpréter un résultat', module: 6 },
};

const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Sauteur de rangs', test: (m) => !m.sauter },
  { id: 'b2', emoji: '🏅', label: 'Sommateur', test: (m) => !m.sommer },
  { id: 'b3', emoji: '🏅', label: 'Modélisateur', test: (m) => !m.modeliser },
  { id: 'b4', emoji: '🏅', label: 'Lecteur de modèle', test: (m) => !m.interpreter },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du saut et du total', test: (m) => Object.keys(m).length === 0 },
];

export default function Module07MissionFinaleLeSautEtLeTotal() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : le saut et le total"
      moduleSubtitle="Dix épreuves : atteindre, additionner, modéliser, interpréter"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître du saut et du total',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation. Deux réflexes : compter les PAS pour atteindre un
            rang, compter les TERMES pour additionner — ce n’est jamais le même nombre.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '➕', label: 'atteindre (ajout)', value: 'u(0) + n × r' },
        { id: 'r2', emoji: '✖️', label: 'atteindre (produit)', value: 'u(0) × qⁿ' },
        { id: 'r3', emoji: '🧱', label: 'total (ajout)', value: 'nb × (premier + dernier) ÷ 2' },
        { id: 'r4', emoji: '🔭', label: 'total (produit)', value: 'u(0) × (1 − q^(n+1)) ÷ (1 − q)' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{
        masterTitle: 'Maître du saut et du total !',
        title: 'Mission accomplie',
        message: 'Tu sais atteindre un rang lointain sans le gravir, additionner beaucoup de termes sans les écrire, et faire dire à un modèle quelque chose d’utile.',
        verbs: ['Atteindre', 'Additionner', 'Modéliser', 'Interpréter'],
        masterBadgeLabel: 'Maître du saut et du total',
      }}
    />
  );
}
