import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { nineSplit } from '../components/arithUtils';

/**
 * Module 7 — Boss Final « L'atelier » (kit, QCM). DONNÉES.
 * Distracteurs = pièges des modules 1–6 : direction multiple/diviseur (M1) ·
 * « impair + impair = impair » (M1) · « des exemples prouvent » (M2, M6) ·
 * « multiple de 3 ⇒ multiple de 9 » (M3) · dernier chiffre pour 3 (M3) ·
 * PPCM = produit (M4) · PGCD confondu avec PPCM (M4, M6) · 0 multiple (M5).
 * Couverture : P1 → e1, e2 · P2 → e3, e4 · P3 → e5, e6 · P4 → e7, e8 · P5 → e9, e10.
 */
const S = nineSplit(4725);
const REGISTRE = [
  { id: 'paquets', emoji: '🎲', label: 'Paquets', value: 'n = pq + r' },
  { id: 'parite', emoji: '✏️', label: 'Parité', value: '2k / 2k + 1' },
  { id: 'criteres', emoji: '🔬', label: 'Critères', value: '9 × 523 + 18' },
  { id: 'rdv', emoji: '🚌', label: 'Rendez-vous', value: 'PPCM 36' },
];
const SKILLS = {
  multiples: { label: 'Multiples et diviseurs', module: 1 },
  criteres: { label: 'Critères de divisibilité', module: 3 },
  parite: { label: 'Raisonner sur les entiers', module: 2 },
  problemes: { label: 'Problèmes (PGCD, PPCM)', module: 4 },
  demontrer: { label: 'Démontrer', module: 6 },
};
const tex = (o) => <MathText>{o}</MathText>;
const EPREUVES = [
  { id: 'ar-e1', skill: 'multiples', title: 'Épreuve 1', prompt: 'On sait que 84 = 12 × 7. Quelle affirmation est exacte ?', options: ['84 est un multiple de 12, et 12 est un diviseur de 84', '12 est un multiple de 84', '84 est un diviseur de 7', '7 est un multiple de 84'], cols: 1, correct: 0, explain: 'Le grand nombre est le multiple, les petits sont les diviseurs. Une seule égalité, deux lectures : 84 est multiple de 12 et de 7 ; 12 et 7 divisent 84.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arithmetique-2nde_P1'] } },
  { id: 'ar-e2', skill: 'multiples', title: 'Épreuve 2', prompt: 'Dans la division euclidienne de 100 par 7, quel est le reste ?', options: ['2', '14', '3', '0'], cols: 4, correct: 0, explain: '100 = 7 × 14 + 2 : quatorze paquets de 7, et 2 jetons seuls. Le reste est toujours strictement plus petit que 7 (donc jamais 14).', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arithmetique-2nde_P1'] } },
  { id: 'ar-e3', skill: 'criteres', title: 'Épreuve 3', prompt: '2 346 est-il divisible par 3 ? par 9 ?', options: ['Par 3 oui (somme 15), par 9 non', 'Par 3 et par 9', 'Ni par 3 ni par 9', 'Par 9 seulement'], cols: 2, correct: 0, explain: 'Somme des chiffres : 2 + 3 + 4 + 6 = 15, multiple de 3 mais pas de 9. Tout multiple de 9 est multiple de 3, jamais l’inverse.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arithmetique-2nde_P2'] } },
  { id: 'ar-e4', skill: 'criteres', title: 'Épreuve 4', prompt: 'Pourquoi la somme des chiffres décide-t-elle de la divisibilité par 9 ?', options: ['Parce que 9, 99, 999… sont des multiples de 9 : n = 9k + (somme des chiffres)', 'Parce que 9 est le plus grand chiffre', 'Parce que 9 divise 10', 'C’est une astuce sans démonstration'], cols: 1, correct: 0, explain: 'Chaque chiffre d de rang k apporte d × 10^k = d × (10^k − 1) + d, et 10^k − 1 (9, 99, 999…) est multiple de 9. Il ne reste que la somme des chiffres. 9 ne divise PAS 10.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arithmetique-2nde_P2', 'seconde_arithmetique-2nde_P5'] } },
  { id: 'ar-e5', skill: 'parite', title: 'Épreuve 5', prompt: 'a et b sont impairs. Que peut-on dire de a + b ?', options: ['C’est un nombre pair : (2k + 1) + (2m + 1) = 2(k + m + 1)', 'C’est un nombre impair', 'Cela dépend des valeurs', 'C’est un multiple de 4'], cols: 2, correct: 0, explain: 'Les deux jetons seuls forment un paquet de 2 : la somme est paire, toujours. Multiple de 4 ? Pas forcément : 3 + 3 = 6.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arithmetique-2nde_P3'] } },
  { id: 'ar-e6', skill: 'parite', title: 'Épreuve 6', prompt: 'Comment s’écrit un nombre impair, pour k entier ?', options: ['$2k + 1$', '$2k$', '$k + 1$', '$k^{2} + 1$'], renderOption: tex, optionLabel: (i) => ['2k + 1', '2k', 'k + 1', 'k² + 1'][i], cols: 4, correct: 0, explain: '2k est pair (des paquets de 2 pleins) ; 2k + 1 ajoute le jeton seul : impair. k + 1 peut être pair ou impair selon k.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arithmetique-2nde_P3'] } },
  { id: 'ar-e7', skill: 'problemes', title: 'Épreuve 7', prompt: 'Deux phares clignotent, l’un toutes les 15 s, l’autre toutes les 20 s. Ils viennent de clignoter ensemble. Dans combien de secondes recommenceront-ils ensemble ?', options: ['60 s', '300 s', '35 s', '5 s'], cols: 4, correct: 0, explain: 'Premier multiple commun de 15 et 20 : 60 (= 15 × 4 = 20 × 3). 300 = 15 × 20 est un rendez-vous, mais pas le premier ; 35 est la somme ; 5 est le PGCD.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arithmetique-2nde_P4'] } },
  { id: 'ar-e8', skill: 'problemes', title: 'Épreuve 8', prompt: 'On veut découper deux rubans de 36 cm et 48 cm en morceaux égaux les plus longs possibles, sans perte. Quelle longueur ?', options: ['12 cm', '6 cm', '144 cm', '84 cm'], cols: 4, correct: 0, explain: 'La longueur doit diviser 36 ET 48 : le plus grand diviseur commun est 12 (36 = 12 × 3, 48 = 12 × 4). 6 divise aussi, mais n’est pas le plus grand ; 144 est un multiple commun.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arithmetique-2nde_P4'] } },
  { id: 'ar-e9', skill: 'demontrer', title: 'Épreuve 9', prompt: 'Pour démontrer que la somme de deux multiples de 5 est un multiple de 5, la première ligne est :', options: ['« Soit a = 5k et b = 5k′ avec k et k′ entiers »', '« Prenons a = 10 et b = 15 »', '« On voit que ça marche toujours »', '« Supposons que a + b ne soit pas multiple de 5 »'], cols: 1, correct: 0, explain: 'On écrit l’hypothèse avec des lettres pour couvrir TOUS les cas, puis on transforme : 5k + 5k′ = 5(k + k′). Des exemples ne démontrent rien.', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arithmetique-2nde_P5'] } },
  { id: 'ar-e10', skill: 'demontrer', title: 'Épreuve 10', prompt: 'Pourquoi n(n + 1) est-il pair pour tout entier n ?', options: ['Parce que parmi deux entiers consécutifs, l’un est toujours pair', 'Parce que n² + n est toujours pair par définition', 'Parce que c’est vrai pour n = 1, 2, 3', 'C’est faux : n = 3 donne 12, qui est pair, mais n = 5 donne 30'], cols: 1, correct: 0, explain: 'De deux entiers qui se suivent, l’un est pair : leur produit contient donc un facteur 2. (Les exemples ne prouvent rien, et 12 comme 30 sont bien pairs.)', assessment: { enabled: true, type: 'assessment', learningPointIds: ['seconde_arithmetique-2nde_P5', 'seconde_arithmetique-2nde_P3'] } },
];
const BADGES = [
  { id: 'b-mult', emoji: '🎲', label: 'Multiples et restes sans faute', test: (m) => !m.multiples },
  { id: 'b-crit', emoji: '🔬', label: 'Critères sans faute', test: (m) => !m.criteres },
  { id: 'b-par', emoji: '✏️', label: 'Parité sans faute', test: (m) => !m.parite },
  { id: 'b-prob', emoji: '🚌', label: 'Problèmes sans faute', test: (m) => !m.problemes },
  { id: 'b-dem', emoji: '🧠', label: 'Démonstrations sans faute', test: (m) => !m.demontrer },
  { id: 'b-perfect', emoji: '💎', label: 'Dix sur dix', test: (m) => Object.values(m).every((v) => !v) },
];
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1"><h2 className="text-xl font-space font-extrabold text-slate-900">Synthèse : l’atelier</h2><p className="text-sm text-slate-500">Le découpage de 4 725, figé.</p></div>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 font-mono text-sm text-slate-800">
        4 725 = <span className="text-indigo-700 font-bold">9 × {S.nineTimes}</span> + <span className="text-emerald-700 font-bold">{S.digitSum}</span> — la première part est multiple de 9 quoi qu’il arrive ; 18 l’est aussi, donc 4 725 aussi.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Feedback tone="info"><strong>Paquets.</strong> n = pq + r ; multiple ⇔ r = 0 ⇔ n = pk. Les restes s’additionnent.</Feedback>
        <Feedback tone="info"><strong>Parité.</strong> 2k et 2k + 1 : la lettre couvre tous les entiers et transforme un constat en preuve.</Feedback>
        <Feedback tone="info"><strong>Critères.</strong> Dernier chiffre (2, 5, 10), deux derniers (4), somme des chiffres (3, 9) — chacun démontré par un découpage.</Feedback>
        <Feedback tone="info"><strong>Problèmes.</strong> PPCM pour un rendez-vous, PGCD pour le plus grand morceau qui tombe juste.</Feedback>
      </div>
    </div>
  );
}
export default function Module07MissionFinale() {
  return (
    <BossFinal ctx={MODULE_CTX} navLinks={getNavLinks(7)} moduleNumber={7}
      moduleTitle="🏆 Mission finale : l’atelier" moduleSubtitle="Dix épreuves pour prouver qu’aucun reste ne t’échappe." estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG} timerSeconds={600} timerLabel="10 min" xpPerCorrect={10}
      brief={{ tag: '🏆 Boss final', title: 'L’atelier te confie ses commandes.', body: <p>Dix questions, aucune aide, une seule validation à la fin.</p> }}
      registre={REGISTRE} skills={SKILLS} epreuves={EPREUVES} badges={BADGES} synthese={<Synthese />}
      completion={{ masterTitle: 'Maître des restes', title: 'Leçon terminée', message: 'Tu sais reconnaître un multiple, appliquer et JUSTIFIER un critère, raisonner avec 2k + 1, et résoudre un problème de rendez-vous ou de découpe.', verbs: ['Ranger', 'Découper', 'Raisonner', 'Démontrer'], masterBadgeLabel: 'Tous les badges débloqués' }} />
  );
}
