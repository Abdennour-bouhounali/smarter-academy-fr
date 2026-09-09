import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Le test
 * CONSOLIDE : il n'introduit ni concept, ni vocabulaire, ni notation neufs.
 *
 * TRANSFERT, pas répétition : aucune épreuve ne reprend les configurations
 * des modules (ni les points du labo, ni le drapeau du module 4, ni les
 * énoncés du module 6), et chaque distracteur encode une erreur RÉELLEMENT
 * rencontrée :
 *   — nommer les sommets dans le mauvais ordre, et obtenir un croisé (M2) ;
 *   — se contenter de l'égalité des longueurs, sans le parallélisme (M2, M5) ;
 *   — prendre l'apparence de la figure pour une justification (M5) ;
 *   — conclure sans nommer la propriété qui le permet (M5, M6) ;
 *   — confondre le glissement avec le demi-tour de 5e (M4) ;
 *   — placer le quatrième sommet au jugé plutôt qu'en reportant (M3).
 *
 * `badges[].test` est une FONCTION `(misses) => bool`. Les 4 LPs sont
 * couverts, avec au moins deux épreuves chacun.
 */
const SKILLS = {
  reconnaitre: { label: 'Reconnaître la figure', module: 1, emoji: '🔷' },
  construire: { label: 'Construire le sommet', module: 3, emoji: '📍' },
  justifier: { label: 'Justifier', module: 5, emoji: '✍️' },
  demontrer: { label: 'Démontrer', module: 6, emoji: '🧩' },
};

const BADGES = [
  { id: 'b-re', emoji: '🔷', label: 'Œil sûr', test: (m) => !m.reconnaitre },
  { id: 'b-co', emoji: '📍', label: 'Point posé juste', test: (m) => !m.construire },
  { id: 'b-ju', emoji: '✍️', label: 'Phrase qui tient', test: (m) => !m.justifier },
  { id: 'b-de', emoji: '🧩', label: 'Chaîne complète', test: (m) => !m.demontrer },
  { id: 'b-parfait', emoji: '💎', label: 'Maître du glissement', test: (m) => Object.keys(m).length === 0 },
];

const EPREUVES = [
  {
    id: 'pt4-e1',
    skill: 'reconnaitre',
    title: 'Le quadrilatère formé',
    prompt: 'Un glissement mène P en P’ et Q en Q’. Quel quadrilatère est un parallélogramme ?',
    options: ['P P’ Q’ Q', 'P Q P’ Q’', 'P Q’ Q P’', 'P’ P Q Q’'],
    correct: 0,
    cols: 4,
    requires: ['ordre-des-sommets', 'trace-du-glissement'],
    explain: 'On fait le TOUR : P, son image P’, puis l’image Q’, puis Q. Relier P à Q puis P’ à Q’ traverserait la figure et donnerait un quadrilatère croisé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_parallelogrammes-translations-4e_P1'] },
  },
  {
    id: 'pt4-e2',
    skill: 'reconnaitre',
    title: 'Ce que le glissement donne',
    prompt: 'Un glissement mène R en S et T en U. Que peut-on affirmer des segments [RS] et [TU] ?',
    options: [
      'Ils sont parallèles et de même longueur',
      'Ils sont perpendiculaires',
      'Ils ont la même longueur, mais pas forcément parallèles',
      'Ils se coupent en leur milieu',
    ],
    correct: 0,
    cols: 1,
    requires: ['deux-trajets-un-glissement'],
    explain: '[RS] et [TU] sont les deux trajets du MÊME glissement : ils ont donc la même direction, le même sens et la même longueur — c’est-à-dire qu’ils sont parallèles et de même longueur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_parallelogrammes-translations-4e_P1'] },
  },
  {
    id: 'pt4-e3',
    skill: 'reconnaitre',
    title: 'Glissement ou pas ?',
    prompt: 'On relie chaque sommet d’une figure à son image : les traits obtenus se coupent tous en un même point. Quelle transformation est-ce ?',
    options: [
      'Un demi-tour, pas un glissement',
      'Un glissement',
      'Les deux à la fois',
      'Aucune transformation connue',
    ],
    correct: 0,
    cols: 2,
    requires: ['un-seul-trajet-pour-tous'],
    explain: 'Dans un glissement, les trajets sont tous parallèles et ne se coupent jamais. Des traits concourants sont la marque du demi-tour vu en 5e.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_parallelogrammes-translations-4e_P1'] },
  },
  {
    id: 'pt4-e4',
    skill: 'construire',
    title: 'Le quatrième sommet',
    prompt: 'On veut placer C pour que EFCG soit un parallélogramme, avec E, F et G donnés. Quel est le geste juste ?',
    options: [
      'Reporter, à partir de F, le trajet qui mène E en G',
      'Placer C à égale distance de F et de G',
      'Placer C symétrique de E par rapport à F',
      'Ajuster C jusqu’à ce que la figure paraisse correcte',
    ],
    correct: 0,
    cols: 1,
    requires: ['construire-le-quatrieme'],
    explain: 'Dans EFCG, les sommets se suivent E, F, C, G : [EG] et [FC] sont deux côtés opposés. Le glissement qui mène E en G, appliqué à F, pose donc C.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_parallelogrammes-translations-4e_P2'] },
  },
  {
    id: 'pt4-e5',
    skill: 'construire',
    title: 'Le trajet à reporter',
    prompt: 'Un glissement mène le point (2 ; 1) au point (7 ; 4). Où mène-t-il le point (0 ; 5) ?',
    options: ['(5 ; 8)', '(7 ; 9)', '(2 ; 4)', '(5 ; 2)'],
    correct: 0,
    cols: 4,
    requires: ['construire-le-quatrieme', 'un-seul-trajet-pour-tous'],
    explain: 'Le trajet avance de 5 et monte de 3 (de 2 à 7, et de 1 à 4). Le même trajet appliqué à (0 ; 5) donne (0 + 5 ; 5 + 3), soit (5 ; 8).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_parallelogrammes-translations-4e_P2'] },
  },
  {
    id: 'pt4-e6',
    skill: 'justifier',
    title: 'La justification suffisante',
    prompt: 'Quelle phrase justifie CORRECTEMENT que KLMN est un parallélogramme ?',
    options: [
      'Le glissement qui mène K en N mène aussi L en M, donc [KN] et [LM] sont parallèles et de même longueur, donc KLMN est un parallélogramme',
      'KLMN a l’air d’un parallélogramme sur la figure',
      'KN = LM, donc KLMN est un parallélogramme',
      'Un glissement transforme K en N, donc KLMN est un parallélogramme',
    ],
    correct: 0,
    cols: 1,
    requires: ['justifier-par-le-glissement'],
    explain: 'Seule la première contient les trois morceaux : le glissement nommé, les deux points qu’il déplace, et la propriété qui conclut. La troisième oublie le parallélisme ; la quatrième saute la propriété.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_parallelogrammes-translations-4e_P3'] },
  },
  {
    id: 'pt4-e7',
    skill: 'justifier',
    title: 'Ce qui ne suffit pas',
    prompt: 'Dans un quadrilatère VWXY, on sait seulement que VW = XY. Peut-on conclure que c’est un parallélogramme ?',
    options: [
      'Non : il manque le parallélisme de ces deux côtés',
      'Oui : deux côtés opposés égaux suffisent',
      'Oui, si les deux autres côtés sont égaux entre eux',
      'Non : il faudrait connaître les angles',
    ],
    correct: 0,
    cols: 1,
    requires: ['deux-trajets-un-glissement', 'caracterisations'],
    explain: 'Un cerf-volant a des côtés égaux deux à deux sans être un parallélogramme. Il faut que les deux côtés opposés soient à la fois parallèles ET de même longueur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_parallelogrammes-translations-4e_P3'] },
  },
  {
    id: 'pt4-e8',
    skill: 'demontrer',
    title: 'La ligne manquante',
    prompt: 'Un élève écrit : « Le glissement mène A en B et D en C. Donc ABCD est un parallélogramme. » Que manque-t-il ?',
    options: [
      'La propriété : [AB] et [DC] sont parallèles et de même longueur',
      'Rien : la démonstration est complète',
      'La mesure du glissement',
      'Le nom des diagonales',
    ],
    correct: 0,
    cols: 1,
    requires: ['trois-lignes-de-preuve'],
    explain: 'La conclusion est juste, mais elle tombe du ciel : entre la donnée et la conclusion, il faut la ligne du cours qui les relie. C’est elle qui prouve.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_parallelogrammes-translations-4e_P4'] },
  },
  {
    id: 'pt4-e9',
    skill: 'demontrer',
    title: 'L’ordre des raisons',
    prompt: 'Dans quel ordre s’écrivent les trois lignes d’une démonstration ?',
    options: [
      'On sait que… · Or… · Donc…',
      'Donc… · On sait que… · Or…',
      'Or… · Donc… · On sait que…',
      'L’ordre n’a pas d’importance',
    ],
    correct: 0,
    cols: 2,
    requires: ['trois-lignes-de-preuve'],
    explain: 'La donnée (« On sait que »), puis la propriété du cours (« Or »), puis ce qu’on en déduit (« Donc »). Changer l’ordre revient à conclure avant d’avoir prouvé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_parallelogrammes-translations-4e_P4'] },
  },
  {
    id: 'pt4-e10',
    skill: 'demontrer',
    title: 'La démonstration en deux temps',
    prompt: 'Un glissement mène H en I et J en K. On veut prouver que HJ = IK. Quelle est la démarche ?',
    options: [
      'Montrer d’abord que H I K J est un parallélogramme, puis utiliser que ses côtés opposés sont de même longueur',
      'Mesurer HJ et IK sur la figure et comparer',
      'Dire que le glissement conserve les longueurs, donc HJ = IK directement',
      'Montrer que les diagonales se coupent en leur milieu',
    ],
    correct: 0,
    cols: 1,
    requires: ['trois-lignes-de-preuve', 'cotes-opposes-egaux'],
    explain: 'Le glissement donne d’abord le parallélogramme H I K J (ses côtés [HI] et [JK] sont les deux trajets) ; puis la propriété des côtés opposés donne HJ = IK. La conclusion du premier raisonnement est la donnée du second. Attention : le glissement conserve les longueurs de la FIGURE, il ne dit rien directement de HJ et IK, qui ne sont pas une longueur et son image.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['4e_parallelogrammes-translations-4e_P4'] },
  },
];

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : l’atelier"
      moduleSubtitle="Dix épreuves, une seule soumission"
      estimatedTime="8 min"
      lessonConfig={LESSON_CONFIG}
      brief={{
        tag: '🏆 Mission finale',
        title: 'L’atelier',
        tone: 'amber',
        body: (
          <>
            Dix situations où un glissement se cache derrière une figure. Réponds à tout, puis
            soumets : aucune correction avant la fin.
          </>
        ),
      }}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot complete variant="complete" />}
      completion={{
        masterTitle: 'Le glissement maîtrisé',
        title: 'Mission accomplie',
        message: 'Tu sais reconnaître le parallélogramme qu’un glissement fabrique, construire son quatrième sommet en reportant le trajet, justifier ta figure par une phrase qui tient, et enchaîner les raisons dans une démonstration.',
        verbs: ['Reconnaître', 'Construire', 'Justifier', 'Démontrer'],
        masterBadgeLabel: 'Maître du glissement',
      }}
    />
  );
}
