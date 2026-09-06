import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import RationalBar from '../components/RationalBar';
import FractionAreaGrid from '../components/FractionAreaGrid';
import { formatDec, rat, toDecimal } from '../components/rationalUtils';

/**
 * Module 8 — Boss Final (moteur du kit, QCM uniquement). Fichier de DONNÉES.
 *
 * Épreuves écrites EN DERNIER : chaque distracteur encode un piège
 * réellement travaillé dans les modules 1 à 7 —
 *   · croire que couper en 0 part a un sens (M1)
 *   · croire que 6/8 ≠ 3/4 parce que les chiffres diffèrent (M1)
 *   · simplifier le haut sans le bas (M2)
 *   · « 1/4 > 1/2 car 4 > 2 » et l'inversion chez les négatifs (M3)
 *   · « 1/2 + 1/3 = 2/5 » : additionner les dénominateurs (M4)
 *   · « multiplier agrandit toujours » (M5)
 *   · « diviser rend toujours plus petit » et multiplier sans retourner (M5)
 *   · calculer de gauche à droite au lieu des priorités (M6)
 *   · confondre la part dépensée et la part restante (M7)
 *
 * Couverture des 10 LPs : P1 (e1), P2 (e2), P3 (e3), P4 (e4), P5 (e5),
 * P6 (e6), P7 (e7), P8 (e8), P9 (e9), P10 (e10).
 *
 * `requires` nomme, épreuve par épreuve, les connaissances que la leçon a
 * établies et que l'épreuve mobilise. Le test final CONSOLIDE : il n'introduit
 * ni concept, ni mot, ni notation, et la synthèse ne recopie aucune définition
 * — elle affiche la carte complète (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const REGISTRE = [
  { id: 'point', emoji: '📍', label: 'Un rationnel', value: 'est un point' },
  { id: 'decoupe', emoji: '✂️', label: 'Additionner', value: 'même découpe' },
  { id: 'inverse', emoji: '🔄', label: 'Diviser', value: '× l’inverse' },
  { id: 'ordre', emoji: '🧮', label: 'Parenthèses', value: 'puis × ÷ puis + −' },
];

const SKILLS = {
  ecritures: { label: 'Écritures d’un même rationnel', module: 1 },
  irreductible: { label: 'Rendre irréductible', module: 2 },
  comparer: { label: 'Comparer deux rationnels', module: 3 },
  operations: { label: 'Additionner, soustraire, multiplier, diviser', module: 4 },
  ordre: { label: 'Choisir et enchaîner les opérations', module: 6 },
  problemes: { label: 'Résoudre un problème', module: 7 },
};

const EPREUVES = [
  {
    id: 'nr-e1',
    requires: ['nombre-rationnel'],
    skill: 'ecritures',
    title: 'Épreuve 1',
    prompt:
      'Un nombre rationnel est un nombre qui peut s’écrire comme quotient de deux entiers. Quelle condition doit absolument être respectée ?',
    options: [
      'Le dénominateur doit être différent de zéro',
      'Le numérateur doit être plus petit que le dénominateur',
      'Les deux entiers doivent être positifs',
    ],
    cols: 1,
    correct: 0,
    explain:
      "Découper en 0 part ne définit aucune longueur : aucun nombre ne peut être le résultat. En revanche 7/3 (numérateur plus grand) et −3/4 (entiers négatifs) sont des rationnels parfaitement valables.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_nombres-rationnels_P1'] },
  },
  {
    id: 'nr-e2',
    requires: ['ecritures-equivalentes', 'quotient-rationnels'],
    skill: 'ecritures',
    title: 'Épreuve 2',
    prompt: 'Laquelle de ces écritures ne désigne PAS le même nombre que les autres ?',
    options: ['$\\frac{6}{8}$', '$0{,}75$', '$\\frac{8}{6}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['6/8', '0,75', '8/6'][i],
    correctionLabel: '8/6',
    cols: 3,
    correct: 2,
    explain:
      "6/8 et 0,75 valent tous deux 3/4. 8/6 vaut environ 1,33 : c'est un autre point, à droite de 1. Retourner une fraction ne donne pas une écriture équivalente — ça donne son inverse.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_nombres-rationnels_P2'] },
  },
  {
    id: 'nr-e3',
    requires: ['irreductible', 'pgcd-irreductible'],
    skill: 'irreductible',
    title: 'Épreuve 3',
    prompt: 'Quelle est la forme irréductible de 18/24 ?',
    options: ['$\\frac{9}{24}$', '$\\frac{3}{4}$', '$\\frac{9}{12}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['9/24', '3/4', '9/12'][i],
    correctionLabel: '3/4',
    cols: 3,
    correct: 1,
    explain:
      "Le PGCD de 18 et 24 vaut 6 : 18 ÷ 6 = 3 et 24 ÷ 6 = 4, donc 3/4. 9/24 vient d'avoir divisé le haut sans le bas — ça change le nombre. 9/12 est juste mais pas terminé : on peut encore diviser par 3.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_nombres-rationnels_P3'] },
  },
  {
    id: 'nr-e4',
    requires: ['comparer-rationnels', 'piege-denominateur', 'signe-fraction'],
    skill: 'comparer',
    title: 'Épreuve 4',
    prompt: 'Quel est le plus grand de ces trois nombres ?',
    options: ['$-\\frac{1}{2}$', '$-\\frac{3}{4}$', '$-\\frac{5}{6}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['−1/2', '−3/4', '−5/6'][i],
    correctionLabel: '−1/2',
    cols: 3,
    correct: 0,
    explain:
      "En douzièmes : −6/12, −9/12 et −10/12. Le plus grand est celui qui est le plus à DROITE sur la droite, donc le plus proche de zéro : −1/2. Chez les négatifs, le nombre qui « paraît le plus gros » est le plus petit.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_nombres-rationnels_P4'] },
  },
  {
    id: 'nr-e5',
    requires: ['meme-decoupe', 'somme-difference', 'ppcm-denominateur'],
    skill: 'operations',
    title: 'Épreuve 5',
    prompt: 'Combien vaut 1/2 + 1/3 ?',
    options: ['$\\frac{2}{5}$', '$\\frac{5}{6}$', '$\\frac{1}{6}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['2/5', '5/6', '1/6'][i],
    correctionLabel: '5/6',
    cols: 3,
    correct: 1,
    explain:
      "Il faut d'abord la même découpe : 3/6 + 2/6 = 5/6. 2/5 vient d'avoir additionné aussi les dénominateurs — mais le dénominateur dit la TAILLE des parts, il ne se cumule pas. 1/6 est le produit, pas la somme.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_nombres-rationnels_P5'] },
  },
  {
    id: 'nr-e6',
    requires: ['produit-rationnels', 'irreductible'],
    skill: 'operations',
    title: 'Épreuve 6',
    prompt: 'On calcule 2/3 × 3/4. Que peut-on dire du résultat ?',
    options: [
      'Il vaut 1/2, donc il est plus petit que 2/3 et que 3/4',
      'Il vaut 6/4, car multiplier agrandit toujours',
      'Il vaut 2/4, car on garde le dénominateur',
    ],
    cols: 1,
    correct: 0,
    explain:
      "Sur le quadrillage : 2 × 3 = 6 cases vertes sur 3 × 4 = 12, soit 6/12 = 1/2. Multiplier par un nombre INFÉRIEUR à 1 rapetisse — « multiplier agrandit » n'est vrai qu'au-delà de 1. Et on multiplie aussi les dénominateurs.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_nombres-rationnels_P6'] },
  },
  {
    id: 'nr-e7',
    requires: ['quotient-rationnels', 'ecritures-equivalentes'],
    skill: 'operations',
    title: 'Épreuve 7',
    prompt: 'Combien vaut 3/2 ÷ 1/4 ?',
    options: ['$6$', '$\\frac{3}{8}$', '$\\frac{3}{2}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['6', '3/8', '3/2'][i],
    correctionLabel: '6',
    cols: 3,
    correct: 0,
    explain:
      "Diviser par 1/4, c'est multiplier par 4 : 3/2 × 4/1 = 12/2 = 6. On peut aussi compter : 3/2 s'écrit 6/4, donc il y tient exactement 6 quarts. 3/8 vient d'avoir multiplié sans retourner. « Diviser rend plus petit » est faux dès que le diviseur est inférieur à 1.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_nombres-rationnels_P7'] },
  },
  {
    id: 'nr-e8',
    requires: ['choisir-operation', 'somme-difference', 'meme-decoupe'],
    skill: 'ordre',
    title: 'Épreuve 8',
    prompt:
      "Un club dépense 1/3 de son budget puis 1/4. Quelle suite d'opérations donne la part qui RESTE ?",
    options: [
      'D’abord 1/3 + 1/4, puis 1 moins le résultat',
      'D’abord 1/3 + 1/4, puis 1/3 + 1/4 encore',
      'Directement 1 − 1/3 − 1/4 sans passer au même dénominateur',
    ],
    cols: 1,
    correct: 0,
    explain:
      "On additionne les deux dépenses (7/12), puis on les retire du budget entier, qui vaut 1 : 1 − 7/12 = 5/12. La troisième piste donne le bon résultat SI on met tout au même dénominateur — sans découpe commune, la soustraction n'est pas posable.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_nombres-rationnels_P8'] },
  },
  {
    id: 'nr-e9',
    requires: ['priorites-calcul', 'produit-rationnels', 'somme-difference'],
    skill: 'ordre',
    title: 'Épreuve 9',
    prompt: 'Combien vaut 1/2 + 2/3 × 3/4 ?',
    options: ['$1$', '$\\frac{7}{8}$', '$\\frac{7}{6}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['1', '7/8', '7/6'][i],
    correctionLabel: '1',
    cols: 3,
    correct: 0,
    explain:
      "La multiplication passe avant l'addition : 2/3 × 3/4 = 1/2, puis 1/2 + 1/2 = 1. 7/8 est ce qu'on obtient en calculant de gauche à droite (donc en ajoutant d'abord) : c'est le résultat de (1/2 + 2/3) × 3/4. 7/6 est la somme seule.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_nombres-rationnels_P9'] },
  },
  {
    id: 'nr-e10',
    requires: ['choisir-operation', 'produit-rationnels'],
    skill: 'problemes',
    title: 'Épreuve 10',
    prompt:
      "Le budget du club vaut 720 €. Le tournoi en représente 5/12. Combien d'euros cela fait-il ?",
    options: ['300 €', '60 €', '1 728 €'],
    cols: 3,
    correct: 0,
    explain:
      "Prendre une fraction d'une quantité, c'est multiplier : 5/12 × 720 = 720 ÷ 12 × 5 = 60 × 5 = 300 €. 60 € n'est qu'UN douzième. 1 728 € vient d'avoir multiplié par 12/5 — la fraction retournée.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_nombres-rationnels_P10'] },
  },
];

const BADGES = [
  { id: 'ecritures', emoji: '🏅', label: 'Lecteur d’écritures', test: (s) => (s.ecritures ?? 0) === 0 },
  { id: 'irr', emoji: '🏅', label: 'Réducteur en chef', test: (s) => (s.irreductible ?? 0) === 0 },
  { id: 'comp', emoji: '🏅', label: 'Arbitre de la droite', test: (s) => (s.comparer ?? 0) === 0 },
  { id: 'ops', emoji: '🏅', label: 'Quatre opérations', test: (s) => (s.operations ?? 0) === 0 },
  { id: 'ordre', emoji: '🏅', label: 'Maître de l’ordre', test: (s) => (s.ordre ?? 0) === 0 },
  { id: 'pb', emoji: '🏅', label: 'Modélisateur', test: (s) => (s.problemes ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Un seul nombre, mille noms', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Additionner les dénominateurs : 1/2 + 1/3 = 2/5', right: 'Même découpe d’abord : 3/6 + 2/6 = 5/6' },
  { wrong: 'Croire que 1/4 > 1/2 parce que 4 > 2', right: 'Plus on coupe en parts nombreuses, plus la part est petite' },
  { wrong: 'Croire que diviser rend toujours plus petit', right: 'Diviser par un nombre < 1 agrandit : 3/2 ÷ 1/4 = 6' },
  { wrong: 'Calculer de gauche à droite', right: 'Parenthèses, puis × et ÷, puis + et −' },
];

function Synthese() {
  const EQ = [rat(2, 3), rat(4, 6), rat(6, 9)];
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">➗</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Un nombre rationnel est un point. Toutes ses écritures ne sont que des découpes différentes
          du même chemin — et toutes les opérations reviennent à savoir découper au bon endroit.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-slate-700 text-center">
          La barre élastique, figée sur trois écritures d’un seul point
        </p>
        {EQ.map((r) => (
          <RationalBar key={`${r.num}/${r.den}`} value={r} min={0} max={1} showLine={false} compact frozen />
        ))}
        <p className="text-center text-xs text-slate-500">
          <MathText>{'$\\frac{2}{3} = \\frac{4}{6} = \\frac{6}{9}$'}</MathText> — trois découpes,{' '}
          {formatDec(toDecimal(rat(2, 3), 3))}, un seul point.
        </p>
      </div>

      <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-emerald-700 text-center">
          Et le quadrillage du produit, figé sur 6 cases vertes
        </p>
        <FractionAreaGrid
          aDen={4}
          bDen={3}
          cols={new Set([0, 1, 2])}
          rows={new Set([0, 1])}
          frozen
        />
        <p className="text-center text-xs text-slate-500">
          <MathText>{'$\\frac{2}{3} \\times \\frac{3}{4} = \\frac{6}{12} = \\frac{1}{2}$'}</MathText>
        </p>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 space-y-2.5">
        <p className="text-sm font-bold text-amber-900">Les pièges à éviter</p>
        {PIEGES.map((p) => (
          <div key={p.wrong} className="text-sm space-y-0.5">
            <div className="text-rose-700">❌ {p.wrong}</div>
            <div className="text-emerald-700">✅ {p.right}</div>
          </div>
        ))}
      </div>

      <Feedback tone="info">
        Recettes de cuisine, partages de budget, probabilités, pentes : dès qu’une quantité se compare
        à une autre, les rationnels sont là — et le réflexe reste le même, trouver la bonne découpe.
      </Feedback>

      {/* Les connaissances elles-mêmes : la carte complète, source unique. */}
      <KnowledgeSnapshot variant="complete" complete />
    </div>
  );
}

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="🏆 Mission finale : deux noms, un seul nombre"
      moduleSubtitle="Dix épreuves pour prouver qu’aucune écriture ne te trompe."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix écritures, dix pièges. Le point ne ment jamais.',
        tone: 'amber',
        body: (
          <p>
            Reconnaître, simplifier, comparer, additionner, multiplier, diviser, ordonner, résoudre :
            tout ce que tu as manipulé. Réponds aux dix épreuves, puis valide pour voir ta correction
            et tes badges.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Un seul nombre, mille noms !',
        title: 'Mission accomplie !',
        message: (
          <>
            De la barre qu’on recoupe sans déplacer le point jusqu’au budget du club, tu as vu,
            manipulé puis démontré : un rationnel est un point, et savoir le découper, c’est savoir
            calculer.
          </>
        ),
        verbs: ['Simplifier', 'Comparer', 'Calculer', 'Résoudre'],
        masterBadgeLabel: 'Badge « Un seul nombre, mille noms » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
