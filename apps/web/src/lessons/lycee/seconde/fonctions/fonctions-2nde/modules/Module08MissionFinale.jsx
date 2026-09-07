import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement). Les distracteurs
 * encodent les erreurs rencontrées : la moitié pour la plus grande boîte (M1),
 * image / antécédent confondus (M2), carré de 3x (M3), (y ; x) (M4), le
 * tableau qui « prouve » qu'il n'y a pas d'antécédent (M3), l'image dans le
 * trou qui vaudrait 0 (M6), le mauvais morceau (M6, M7). Les 12 LPs sont couverts.
 */
const EPREUVES = [
  { id: 'fo-e1', skill: 'notion', title: 'La dépendance', prompt: 'Le volume V de la boîte dépend de la découpe x. Que signifie « V est une fonction de x » ?', options: ['À chaque valeur de x correspond une valeur de V, et une seule', 'V et x sont proportionnels', 'V est une formule avec des x', 'Chaque volume vient d’une seule découpe'], cols: 1, explain: 'Une fonction associe à chaque valeur de la variable UNE image. La réciproque est fausse : un même volume (400 cm³) provient de deux découpes.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-2nde_P1', 'seconde_fonctions-2nde_P2'] } },
  { id: 'fo-e2', skill: 'notion', title: 'L’ensemble de définition', prompt: 'Une feuille carrée de 20 cm ; on découpe x aux quatre coins. Ensemble de définition de V ?', options: [']0 ; 10[', '[0 ; 10]', '[0 ; 20]', 'ℝ'], cols: 4, explain: 'La boîte existe si 0 < x < 10 : bornes exclues (pas de hauteur, ou plus de fond). Le fait que la formule « calcule » pour x = 12 ne crée pas de boîte.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-2nde_P3', 'seconde_fonctions-2nde_P10'] } },
  { id: 'fo-e3', skill: 'calcul', title: 'Une image', prompt: 'g(x) = 2x² − 3. Que vaut g(−2) ?', options: ['5', '−11', '13', '−7'], cols: 4, explain: '(−2)² = 4, 2 × 4 − 3 = 5. −11 vient de 2 × (−4) − 3 (carré oublié), 13 de (2 × (−2))² − 3.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-2nde_P4', 'seconde_fonctions-2nde_P8'] } },
  { id: 'fo-e4', skill: 'calcul', title: 'Un antécédent', prompt: 'f(x) = 3x − 4. Quel est l’antécédent de 11 par f ?', options: ['5', '29', '7', '3'], cols: 4, explain: 'Résoudre 3x − 4 = 11 : 3x = 15, x = 5. 29 est l’image de 11 (f(11)), pas son antécédent.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-2nde_P5', 'seconde_fonctions-2nde_P8'] } },
  { id: 'fo-e5', skill: 'lecture', title: 'Dans un tableau', prompt: 'Un tableau donne h : x = 0 → 1 ; x = 1 → 3 ; x = 2 → 1 ; x = 3 → 7. Que peut-on affirmer ?', options: ['1 a deux antécédents dans le tableau : 0 et 2', 'h(1,5) = 2', '3 n’a aucun antécédent', 'h(1) = 1'], cols: 1, explain: 'Deux colonnes portent l’image 1 (x = 0 et x = 2). h(1,5) n’est pas dans le tableau ; 3 est l’image de 1 (h(1) = 3).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-2nde_P6', 'seconde_fonctions-2nde_P5'] } },
  { id: 'fo-e6', skill: 'lecture', title: 'Sur une courbe', prompt: 'Sur la courbe de f, la droite horizontale y = 2 coupe la courbe en trois points. Conclusion ?', options: ['2 a trois antécédents', '2 a trois images', 'f(2) = 3', 'La courbe n’est pas celle d’une fonction'], cols: 2, explain: 'Chaque point commun avec y = 2 est un x tel que f(x) = 2 : trois antécédents. Une image est unique ; c’est le nombre d’antécédents qui varie.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-2nde_P7', 'seconde_fonctions-2nde_P5'] } },
  { id: 'fo-e7', skill: 'registres', title: 'Un point sur la courbe', prompt: 'f(x) = x² − 3. Lequel de ces points est sur la courbe de f ?', options: ['(3 ; 6)', '(6 ; 3)', '(2 ; −1)', '(1 ; 2)'], cols: 4, explain: 'f(3) = 9 − 3 = 6 : (3 ; 6) convient. (6 ; 3) inverse abscisse et ordonnée (f(6) = 33) ; f(2) = 1, f(1) = −2.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-2nde_P7', 'seconde_fonctions-2nde_P9'] } },
  { id: 'fo-e8', skill: 'registres', title: 'De la situation à l’expression', prompt: 'Un carré a pour côté x cm. Son aire A et son périmètre P sont fonctions de x. Quelle paire est correcte ?', options: ['A(x) = x² et P(x) = 4x', 'A(x) = 4x et P(x) = x²', 'A(x) = 2x et P(x) = 4x', 'A(x) = x² et P(x) = x + 4'], cols: 1, explain: 'Aire = côté × côté = x² ; périmètre = quatre côtés = 4x. La variable est le côté x.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-2nde_P10', 'seconde_fonctions-2nde_P9', 'seconde_fonctions-2nde_P2'] } },
  { id: 'fo-e9', skill: 'morceaux', title: 'Dans le trou', prompt: 'n est définie sur [8 ; 12] ∪ [14 ; 20]. Que dire de n(13) ?', options: ['n(13) n’existe pas : 13 n’est pas dans l’ensemble de définition', 'n(13) = 0', 'n(13) est la moyenne de n(12) et n(14)', 'n(13) = 13'], cols: 1, explain: 'Entre 12 et 14, la fonction n’est pas définie : aucune image, ce qui n’est pas « zéro ».', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-2nde_P12', 'seconde_fonctions-2nde_P3'] } },
  { id: 'fo-e10', skill: 'morceaux', title: 'Par morceaux', prompt: 'T(x) = 3 si x ∈ [8 ; 12] et T(x) = 5 si x ∈ [14 ; 20]. Que vaut T(12) + T(16) ?', options: ['8', '10', '6', 'impossible : 12 est une borne'], cols: 4, explain: '12 ∈ [8 ; 12] (borne fermée) : T(12) = 3 ; 16 ∈ [14 ; 20] : T(16) = 5. Total 8.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_fonctions-2nde_P11', 'seconde_fonctions-2nde_P12', 'seconde_fonctions-2nde_P4'] } },
];

const SKILLS = {
  notion: { label: 'Fonction, variable, ensemble de définition', module: 2 },
  calcul: { label: 'Calculer une image, un antécédent', module: 3 },
  lecture: { label: 'Lire un tableau, une courbe', module: 4 },
  registres: { label: 'Passer d’un registre à l’autre, modéliser', module: 5 },
  morceaux: { label: 'Intervalles et réunions d’intervalles', module: 6 },
};
const BADGES = [
  { id: 'b1', emoji: '🏅', label: 'Une découpe, un volume', test: (m) => !m.notion },
  { id: 'b2', emoji: '🏅', label: 'Calculateur', test: (m) => !m.calcul },
  { id: 'b3', emoji: '🏅', label: 'Lecteur de courbes', test: (m) => !m.lecture },
  { id: 'b4', emoji: '🏅', label: 'Traducteur', test: (m) => !m.registres },
  { id: 'b5', emoji: '🏅', label: 'Maître des morceaux', test: (m) => !m.morceaux },
  { id: 'b-parfait', emoji: '💎', label: 'Fabricant de boîtes', test: (m) => Object.keys(m).length === 0 },
];

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX} navLinks={getNavLinks(8)} moduleNumber={8} lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la boîte" moduleSubtitle="Dix épreuves pour prouver que tu lis, calcules et traduis une fonction"
      estimatedTime="15 min" timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: 'Mission finale', title: 'Fabricant de boîtes', tone: 'amber', body: <p>Dix questions, une seule validation. À chaque fois : quelle est la variable ? part-on de x (image) ou de y (antécédents) ? x est-il dans l’ensemble de définition ?</p> }}
      registre={[
        { id: 'r1', emoji: 'ƒ', label: 'Fonction', value: 'x ↦ f(x)' },
        { id: 'r2', emoji: '→', label: 'Image', value: 'unique' },
        { id: 'r3', emoji: '←', label: 'Antécédents', value: '0, 1, 2…' },
        { id: 'r4', emoji: '∪', label: 'Définition', value: 'intervalles' },
      ]}
      skills={SKILLS} epreuves={EPREUVES} badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
      completion={{ masterTitle: 'Fabricant de boîtes !', title: 'Mission accomplie', message: 'Tu sais reconnaître une fonction, la lire dans tous ses registres et modéliser avec.', verbs: ['Reconnaître', 'Calculer', 'Lire', 'Modéliser'], masterBadgeLabel: 'Fabricant de boîtes' }}
    />
  );
}
