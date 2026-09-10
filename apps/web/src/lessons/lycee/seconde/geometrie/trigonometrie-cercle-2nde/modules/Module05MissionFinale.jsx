import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 5 — mission finale.
 *
 * Onze épreuves pour neuf learning points : chacun a AU MOINS une épreuve qui
 * lui est propre (`check:lessons` tourne en --strict). Les distracteurs
 * encodent les fautes réelles du chapitre — degrés pris pour des radians,
 * cosinus et sinus échangés, π/6 confondu avec π/3, une seule solution au lieu
 * de deux — jamais une valeur arbitraire.
 */
const tex = (o) => <MathText>{o}</MathText>;

const REGISTRE = [
  { id: 'cercle', emoji: '🔵', label: 'Cercle', value: 'rayon 1' },
  { id: 'radian', emoji: '📏', label: 'Radian', value: 'π = 180°' },
  { id: 'coord', emoji: '🎯', label: 'Coordonnées', value: '(cos t ; sin t)' },
  { id: 'table', emoji: '⭐', label: 'Remarquables', value: 'π/6, π/4, π/3' },
];

const SKILLS = {
  cercle: { label: 'Le cercle et l’enroulement', module: 1 },
  radian: { label: 'Le radian et les conversions', module: 2 },
  coord: { label: 'Cosinus et sinus, coordonnées', module: 3 },
  table: { label: 'Les valeurs remarquables', module: 4 },
};

const EPREUVES = [
  { id: 'tc-e1', skill: 'cercle', requires: ['cercle-trigonometrique', 'mem-rayon-un'], title: 'Épreuve 1', prompt: 'Quel est le rayon du cercle trigonométrique, et d’où part-on ?', options: ['Rayon 1, départ en (1 ; 0)', 'Rayon 1, départ en (0 ; 0)', 'Rayon quelconque, départ en (1 ; 0)', 'Rayon 2π, départ en (0 ; 1)'], cols: 2, correct: 0, explain: 'Le rayon vaut 1 — c’est ce choix qui fait que la longueur d’arc mesure l’angle — et on part toujours du point (1 ; 0), sur l’axe horizontal, en tournant dans le sens direct.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-cercle-2nde_P1'] } },
  { id: 'tc-e2', skill: 'cercle', requires: ['enroulement', 'cercle-trigonometrique'], title: 'Épreuve 2', prompt: 'Quelle longueur de fil faut-il pour faire un tour complet du cercle trigonométrique ?', options: ['2π', 'π', '360', '1'], cols: 4, correct: 0, explain: 'Le périmètre d’un cercle vaut 2 × π × rayon, soit 2π pour un rayon de 1. 360 est une mesure en degrés, pas une longueur.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-cercle-2nde_P1'] } },
  { id: 'tc-e3', skill: 'radian', requires: ['radian', 'mem-pi-180'], title: 'Épreuve 3', prompt: 'Que signifie « un angle de 1 radian » ?', options: ['L’arc qu’il découpe sur le cercle de rayon 1 a pour longueur 1', 'L’angle vaut 1 degré', 'Le rayon vaut 1', 'L’angle fait un tour complet'], cols: 1, correct: 0, explain: 'Le radian mesure l’angle par la LONGUEUR de l’arc intercepté sur un cercle de rayon 1. Un radian correspond donc à un arc long comme le rayon, soit environ 57°.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-cercle-2nde_P2'] } },
  { id: 'tc-e4', skill: 'radian', requires: ['formule-conversion', 'mem-pi-180'], title: 'Épreuve 4', prompt: 'Combien vaut 135° en radians ?', options: ['$\\dfrac{3\\pi}{4}$', '$\\dfrac{\\pi}{4}$', '$\\dfrac{2\\pi}{3}$', '$\\dfrac{3\\pi}{2}$'], renderOption: tex, optionLabel: (i) => ['3π/4', 'π/4', '2π/3', '3π/2'][i], cols: 4, correct: 0, explain: '135 × π/180 = 135π/180 = 3π/4. Autrement dit trois huitièmes de tour : 135 = 3 × 45, et 45° vaut π/4.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-cercle-2nde_P3'] } },
  { id: 'tc-e5', skill: 'cercle', requires: ['enroulement'], title: 'Épreuve 5', prompt: 'Les réels t et t + 2π sont associés à…', options: ['Le même point du cercle', 'Deux points diamétralement opposés', 'Deux points symétriques par rapport à l’axe horizontal', 'Deux points sans rapport'], cols: 2, correct: 0, explain: 'Ajouter 2π revient à faire un tour complet de plus : on repasse exactement au même endroit. Un point du cercle correspond donc à une infinité de réels, mais chaque réel ne donne qu’un point.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-cercle-2nde_P4'] } },
  { id: 'tc-e6', skill: 'coord', requires: ['cos-sin-coordonnees', 'mem-cos-abscisse'], title: 'Épreuve 6', prompt: 'Le point associé au réel t a pour coordonnées…', options: ['$(\\cos t\\ ;\\ \\sin t)$', '$(\\sin t\\ ;\\ \\cos t)$', '$(t\\ ;\\ \\cos t)$', '$(\\cos t\\ ;\\ t)$'], renderOption: tex, optionLabel: (i) => ['(cos t ; sin t)', '(sin t ; cos t)', '(t ; cos t)', '(cos t ; t)'][i], cols: 2, correct: 0, explain: 'Le cosinus est l’ABSCISSE (lecture horizontale), le sinus l’ORDONNÉE (lecture verticale). Les échanger est l’erreur la plus fréquente du chapitre.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-cercle-2nde_P5', 'seconde_trigonometrie-cercle-2nde_P6'] } },
  { id: 'tc-e7', skill: 'coord', requires: ['regle-signes-quadrants', 'cos-sin-coordonnees'], title: 'Épreuve 7', prompt: 'Le point associé à t est en haut à gauche du cercle. Que peut-on dire ?', options: ['cos t < 0 et sin t > 0', 'cos t > 0 et sin t > 0', 'cos t < 0 et sin t < 0', 'cos t > 0 et sin t < 0'], cols: 2, correct: 0, explain: 'À gauche de l’axe vertical, l’abscisse est négative : cos t < 0. Au-dessus de l’axe horizontal, l’ordonnée est positive : sin t > 0. Aucun signe n’est à mémoriser, tout se lit sur la figure.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-cercle-2nde_P6'] } },
  { id: 'tc-e8', skill: 'coord', requires: ['regle-borne-un'], title: 'Épreuve 8', prompt: 'Existe-t-il un réel t tel que sin t = −1,2 ?', options: ['Non : le sinus reste entre −1 et 1', 'Oui, pour t négatif', 'Oui, au-delà d’un tour', 'Oui, en agrandissant le cercle'], cols: 2, correct: 0, explain: 'Le point reste sur un cercle de rayon 1 : son ordonnée est comprise entre −1 et 1, bornes atteintes en (0 ; 1) et (0 ; −1). Le rayon du cercle trigonométrique vaut toujours 1.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-cercle-2nde_P5'] } },
  { id: 'tc-e9', skill: 'table', requires: ['valeurs-remarquables', 'regle-pi-quatre-egalite'], title: 'Épreuve 9', prompt: 'Combien vaut $\\cos\\dfrac{\\pi}{3}$ ?', options: ['$\\dfrac{1}{2}$', '$\\dfrac{\\sqrt{3}}{2}$', '$\\dfrac{\\sqrt{2}}{2}$', '$1$'], renderOption: tex, optionLabel: (i) => ['1/2', '√3/2', '√2/2', '1'][i], cols: 4, correct: 0, explain: 'π/3 ≈ 1,05 est le plus grand des trois angles remarquables du premier quart : son abscisse est donc la plus PETITE, soit 1/2 ≈ 0,50. √3/2 est le cosinus de π/6, avec lequel on le confond souvent.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-cercle-2nde_P7'] } },
  { id: 'tc-e10', skill: 'table', requires: ['valeurs-remarquables'], title: 'Épreuve 10', prompt: 'Combien vaut $\\sin\\dfrac{\\pi}{6}$ ?', options: ['$\\dfrac{1}{2}$', '$\\dfrac{\\sqrt{3}}{2}$', '$\\dfrac{\\sqrt{2}}{2}$', '$0$'], renderOption: tex, optionLabel: (i) => ['1/2', '√3/2', '√2/2', '0'][i], cols: 4, correct: 0, explain: 'π/6 est le plus petit des trois : son ordonnée est la plus petite, soit 1/2. Remarque que cos(π/3) = sin(π/6) = 1/2 — les deux angles portent les mêmes nombres, échangés.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-cercle-2nde_P8'] } },
  { id: 'tc-e11', skill: 'table', requires: ['methode-placer-remarquable', 'regle-signes-quadrants', 'valeurs-remarquables'], title: 'Épreuve 11', prompt: 'Quelles sont les coordonnées du point associé à $\\dfrac{3\\pi}{4}$ ?', options: ['$\\left(-\\dfrac{\\sqrt{2}}{2}\\ ;\\ \\dfrac{\\sqrt{2}}{2}\\right)$', '$\\left(\\dfrac{\\sqrt{2}}{2}\\ ;\\ \\dfrac{\\sqrt{2}}{2}\\right)$', '$\\left(-\\dfrac{\\sqrt{2}}{2}\\ ;\\ -\\dfrac{\\sqrt{2}}{2}\\right)$', '$\\left(-\\dfrac{1}{2}\\ ;\\ \\dfrac{\\sqrt{3}}{2}\\right)$'], renderOption: tex, optionLabel: (i) => ['(−√2/2 ; √2/2)', '(√2/2 ; √2/2)', '(−√2/2 ; −√2/2)', '(−1/2 ; √3/2)'], cols: 2, correct: 0, explain: '3π/4 est entre π/2 et π : le point est en haut à GAUCHE, donc (− ; +). C’est le symétrique de π/4 par rapport à l’axe vertical, d’où (−√2/2 ; √2/2) — les deux coordonnées gardent la même valeur absolue.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-cercle-2nde_P9'] } },
];

const BADGES = [
  { id: 'b-cercle', emoji: '🔵', label: 'Maître du cercle', test: (m) => !m.cercle },
  { id: 'b-radian', emoji: '📏', label: 'Radian sans faute', test: (m) => !m.radian },
  { id: 'b-coord', emoji: '🎯', label: 'Abscisse et ordonnée', test: (m) => !m.coord },
  { id: 'b-table', emoji: '⭐', label: 'Table par cœur', test: (m) => !m.table },
  { id: 'b-parfait', emoji: '💎', label: 'Sans faute', test: (m) => Object.keys(m).length === 0 },
];

export default function Module05MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Mission finale : le cercle"
      moduleSubtitle="Onze épreuves sur l’enroulement, le radian et les coordonnées"
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
    />
  );
}
