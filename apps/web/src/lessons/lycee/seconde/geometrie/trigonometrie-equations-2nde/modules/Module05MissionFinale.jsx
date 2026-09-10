import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 5 — mission finale. Dix épreuves pour quatre learning points : chacun
 * en a au moins deux qui lui sont propres. Les distracteurs encodent les fautes
 * réelles — additionner les cosinus, oublier la seconde solution, confondre les
 * deux symétries, prendre sin²t pour sin t.
 */
const tex = (o) => <MathText>{o}</MathText>;

const REGISTRE = [
  { id: 'identite', emoji: '📐', label: 'Identité', value: 'cos² + sin² = 1' },
  { id: 'addition', emoji: '➕', label: 'Addition', value: 'cos(a+b)' },
  { id: 'cos', emoji: '🎯', label: 'cos t = a', value: '2π − t₀' },
  { id: 'sin', emoji: '🧭', label: 'sin t = b', value: 'π − t₀' },
];

const SKILLS = {
  identite: { label: 'L’identité fondamentale', module: 1 },
  addition: { label: 'Les formules d’addition', module: 2 },
  cos: { label: 'Résoudre cos t = a', module: 3 },
  sin: { label: 'Résoudre sin t = b', module: 4 },
};

const EPREUVES = [
  { id: 'te-e1', skill: 'identite', requires: ['identite-fondamentale', 'mem-pythagore-deguise'], title: 'Épreuve 1', prompt: 'Pour quels réels t a-t-on cos²t + sin²t = 1 ?', options: ['Pour tous les réels', 'Seulement pour t entre 0 et π/2', 'Seulement pour les valeurs remarquables', 'Seulement si t est positif'], cols: 2, correct: 0, explain: 'C’est une IDENTITÉ : elle est vraie pour tout réel t, car le point associé est toujours sur le cercle de rayon 1 et Pythagore s’y applique toujours.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-equations-2nde_P1'] } },
  { id: 'te-e2', skill: 'identite', requires: ['methode-retrouver-coordonnee', 'identite-fondamentale'], title: 'Épreuve 2', prompt: 'On sait que sin t = 0,8 et que le point est à droite de l’axe vertical. Combien vaut cos t ?', options: ['0,6', '−0,6', '0,2', '0,36'], cols: 4, correct: 0, explain: 'cos²t = 1 − 0,64 = 0,36, donc cos t = 0,6 ou −0,6. Le point étant à DROITE de l’axe vertical, son abscisse est positive : 0,6. (0,36 est le carré, pas la coordonnée.)', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-equations-2nde_P1'] } },
  { id: 'te-e3', skill: 'identite', requires: ['identite-fondamentale'], title: 'Épreuve 3', prompt: 'Existe-t-il un réel t tel que cos t = 0,8 et sin t = 0,8 ?', options: ['Non : 0,8² + 0,8² = 1,28 ≠ 1', 'Oui, en π/4', 'Oui, pour un t bien choisi', 'Impossible à savoir sans calculatrice'], cols: 2, correct: 0, explain: 'L’identité impose cos²t + sin²t = 1. Or 0,64 + 0,64 = 1,28 : ce couple ne peut donc PAS être les coordonnées d’un point du cercle. En π/4 les deux valent √2/2 ≈ 0,707, dont les carrés font bien 1.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-equations-2nde_P1'] } },
  { id: 'te-e4', skill: 'addition', requires: ['formules-addition', 'mem-signe-moins'], title: 'Épreuve 4', prompt: 'Quelle est la bonne écriture de cos(a + b) ?', options: ['$\\cos a \\cos b - \\sin a \\sin b$', '$\\cos a \\cos b + \\sin a \\sin b$', '$\\cos a + \\cos b$', '$\\sin a \\cos b + \\cos a \\sin b$'], renderOption: tex, optionLabel: (i) => ['cos a cos b − sin a sin b', 'cos a cos b + sin a sin b', 'cos a + cos b', 'sin a cos b + cos a sin b'][i], cols: 2, correct: 0, explain: 'Le cosinus garde les fonctions ensemble et RETRANCHE. La dernière option est la formule du SINUS, la troisième est l’erreur que le module 2 a réfutée par un contre-exemple.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-equations-2nde_P2'] } },
  { id: 'te-e5', skill: 'addition', requires: ['regle-cos-non-lineaire'], title: 'Épreuve 5', prompt: 'Pourquoi cos(a + b) ne peut-il pas valoir cos a + cos b ?', options: ['Parce que la somme dépasserait 1 dans certains cas, ce qu’un cosinus ne fait jamais', 'Parce que a et b ne sont pas égaux', 'Parce que le cosinus est négatif à gauche', 'Ce serait vrai si a et b étaient petits'], cols: 1, correct: 0, explain: 'cos(π/6) + cos(π/3) ≈ 0,87 + 0,50 = 1,37, alors que tout cosinus reste dans [−1 ; 1]. Un seul contre-exemple suffit à réfuter la règle.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-equations-2nde_P2'] } },
  { id: 'te-e6', skill: 'addition', requires: ['formules-addition', 'valeurs-remarquables'], title: 'Épreuve 6', prompt: 'Combien vaut sin(π/6 + π/3) ?', options: ['1', '√3/2', '1/2', '√2/2'], cols: 4, correct: 0, explain: 'π/6 + π/3 = π/2, dont le sinus vaut 1. On peut aussi appliquer la formule : sin(π/6)cos(π/3) + cos(π/6)sin(π/3) = 0,5 × 0,5 + 0,87 × 0,87 = 0,25 + 0,75 = 1.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-equations-2nde_P2'] } },
  { id: 'te-e7', skill: 'cos', requires: ['methode-resoudre-cos', 'equation-deux-solutions'], title: 'Épreuve 7', prompt: 'Résous cos t = 1/2 sur [0 ; 2π[.', options: ['$\\dfrac{\\pi}{3}$ et $\\dfrac{5\\pi}{3}$', '$\\dfrac{\\pi}{3}$ seulement', '$\\dfrac{\\pi}{3}$ et $\\dfrac{2\\pi}{3}$', '$\\dfrac{\\pi}{6}$ et $\\dfrac{5\\pi}{6}$'], renderOption: tex, optionLabel: (i) => ['π/3 et 5π/3', 'π/3 seulement', 'π/3 et 2π/3', 'π/6 et 5π/6'][i], cols: 2, correct: 0, explain: '1/2 est le cosinus de π/3. La seconde solution est 2π − π/3 = 5π/3, symétrique par rapport à l’axe HORIZONTAL. π/6 et 5π/6 sont les solutions de sin t = 1/2, pas de cette équation.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-equations-2nde_P3'] } },
  { id: 'te-e8', skill: 'cos', requires: ['regle-hors-bornes', 'methode-resoudre-cos'], title: 'Épreuve 8', prompt: 'Combien l’équation cos t = 1,2 a-t-elle de solutions ?', options: ['Aucune', 'Une', 'Deux', 'Une infinité'], cols: 4, correct: 0, explain: 'La droite verticale d’abscisse 1,2 ne rencontre pas le cercle, dont les points ont une abscisse comprise entre −1 et 1. Aucune solution, sur aucun intervalle.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-equations-2nde_P3'] } },
  { id: 'te-e9', skill: 'sin', requires: ['methode-resoudre-sin', 'regle-deux-symetries'], title: 'Épreuve 9', prompt: 'Résous sin t = √2/2 sur [0 ; 2π[.', options: ['$\\dfrac{\\pi}{4}$ et $\\dfrac{3\\pi}{4}$', '$\\dfrac{\\pi}{4}$ et $\\dfrac{7\\pi}{4}$', '$\\dfrac{\\pi}{4}$ seulement', '$\\dfrac{\\pi}{3}$ et $\\dfrac{2\\pi}{3}$'], renderOption: tex, optionLabel: (i) => ['π/4 et 3π/4', 'π/4 et 7π/4', 'π/4 seulement', 'π/3 et 2π/3'][i], cols: 2, correct: 0, explain: '√2/2 est le sinus de π/4. Pour un SINUS la seconde solution est π − t₀ = 3π/4 : symétrie par rapport à l’axe VERTICAL. 7π/4 serait la réponse pour un cosinus — c’est la confusion à éviter.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-equations-2nde_P4'] } },
  { id: 'te-e10', skill: 'sin', requires: ['methode-resoudre-sin', 'mem-lire-sur-le-cercle'], title: 'Épreuve 10', prompt: 'Résous sin t = 1/2 sur [0 ; π/2] — attention à l’intervalle.', options: ['$\\dfrac{\\pi}{6}$ seulement', '$\\dfrac{\\pi}{6}$ et $\\dfrac{5\\pi}{6}$', '$\\dfrac{5\\pi}{6}$ seulement', 'Aucune solution'], renderOption: tex, optionLabel: (i) => ['π/6 seulement', 'π/6 et 5π/6', '5π/6 seulement', 'aucune'][i], cols: 2, correct: 0, explain: 'Les deux solutions du tour sont π/6 et 5π/6. Mais 5π/6 ≈ 2,62 dépasse π/2 ≈ 1,57 : elle est HORS de l’intervalle demandé. On ne garde que π/6. L’intervalle se vérifie toujours à la fin.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_trigonometrie-equations-2nde_P4'] } },
];

const BADGES = [
  { id: 'b-identite', emoji: '📐', label: 'Pythagore partout', test: (m) => !m.identite },
  { id: 'b-addition', emoji: '➕', label: 'Addition maîtrisée', test: (m) => !m.addition },
  { id: 'b-cos', emoji: '🎯', label: 'Deux solutions', test: (m) => !m.cos },
  { id: 'b-sin', emoji: '🧭', label: 'La bonne symétrie', test: (m) => !m.sin },
  { id: 'b-parfait', emoji: '💎', label: 'Sans faute', test: (m) => Object.keys(m).length === 0 },
];

export default function Module05MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Mission finale : les équations"
      moduleSubtitle="Dix épreuves sur l’identité, l’addition et les deux résolutions"
      estimatedTime="12 min"
      lessonConfig={LESSON_CONFIG}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<KnowledgeSnapshot variant="complete" complete />}
    />
  );
}
