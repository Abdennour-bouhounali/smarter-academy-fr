import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import SquareLab from '../components/SquareLab';
import SquareTiling from '../components/SquareTiling';
import {
  simplifyRoot, formatRoot, formatSqrt, formatDec, approxRoot, bracket,
} from '../components/rootUtils';

/**
 * Module 7 — Boss Final (moteur du kit, QCM uniquement). Fichier de DONNÉES.
 *
 * Épreuves écrites EN DERNIER : chaque distracteur encode un piège
 * réellement travaillé dans les modules 1 à 6 —
 *   · confondre la racine et la moitié (√36 = 18) — M1, M2
 *   · croire que tout entier « rond » est un carré parfait (20, 50) — M2
 *   · encadrer au jugé au lieu de comparer les carrés — M2, M3
 *   · croire que (√13)² vaut 169 — M3
 *   · additionner sous la racine : √(9 + 16) = 3 + 4 — M4
 *   · sortir le carré parfait sans lui prendre sa racine (√18 = 9√2) — M5
 *   · croire que 2√3 = √6 — M5
 *   · prendre la diagonale pour deux côtés (5 + 5) — M6
 *   · confondre valeur exacte et arrondi (√50 « = » 7) — M6
 *
 * Couverture des 10 LPs : P1 (e1), P2 (e2), P3 (e3), P4 (e4), P5 (e5),
 * P6 (e6), P7 (e7), P8 (e8), P9 (e9), P10 (e10).
 */
const DIAG50 = simplifyRoot(50);   // 5√2
const TILE = 12;

const REGISTRE = [
  { id: 'sens', emoji: '⬜', label: '√a, c’est', value: 'le côté' },
  { id: 'produit', emoji: '✖️', label: 'Produit', value: 'ça passe' },
  { id: 'somme', emoji: '🚫', label: 'Somme', value: 'ça casse' },
  { id: 'compare', emoji: '⚖️', label: 'Comparer', value: 'par les carrés' },
];

const SKILLS = {
  sens: { label: 'Le sens de la racine carrée', module: 1 },
  repertoire: { label: 'Carrés parfaits et racines exactes', module: 2 },
  encadrer: { label: 'Encadrer et comparer', module: 3 },
  proprietes: { label: 'Produit, quotient et le piège de la somme', module: 4 },
  simplifier: { label: 'Simplifier une racine', module: 5 },
  geometrie: { label: 'Racines en géométrie', module: 6 },
};

const EPREUVES = [
  {
    id: 'rc-e1',
    skill: 'sens',
    title: 'Épreuve 1',
    prompt: "Un carré a une aire de 36 cm². Quelle est la longueur de son côté ?",
    options: ['$18 \\text{ cm}$', '$6 \\text{ cm}$', '$1296 \\text{ cm}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['18 cm', '6 cm', '1296 cm'][i],
    cols: 3,
    correct: 1,
    explain:
      "Le côté d'un carré est la RACINE CARRÉE de son aire : 6 × 6 = 36, donc √36 = 6 cm. 18 est la moitié de 36 (un carré de côté 18 aurait 324 cm² d'aire) ; 1296 est 36², le carré de l'aire.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_racines-carrees-3e_P1'] },
  },
  {
    id: 'rc-e2',
    skill: 'repertoire',
    title: 'Épreuve 2',
    prompt: 'Lequel de ces nombres est un carré parfait ?',
    options: ['50', '121', '20'],
    cols: 3,
    correct: 1,
    explain:
      "121 = 11², c'est une marche de l'escalier. 50 est coincé entre 49 = 7² et 64 = 8² ; 20 entre 16 = 4² et 25 = 5². Être pair ou rond n'a rien à voir : la liste est 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_racines-carrees-3e_P2'] },
  },
  {
    id: 'rc-e3',
    skill: 'repertoire',
    title: 'Épreuve 3',
    prompt: 'Combien vaut √144 ?',
    options: ['$12$', '$72$', '$14$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['12', '72', '14'][i],
    cols: 3,
    correct: 0,
    explain:
      "12 × 12 = 144, donc √144 = 12 : c'est la douzième marche. 72 est la moitié de 144, pas sa racine. 14 donnerait 196.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_racines-carrees-3e_P3'] },
  },
  {
    id: 'rc-e4',
    skill: 'encadrer',
    title: 'Épreuve 4',
    prompt: 'Que vaut (√13)² ?',
    options: ['$13$', '$169$', '$\\sqrt{169}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['13', '169', '√169'][i],
    cols: 3,
    correct: 0,
    explain:
      "√13 est le côté d'un carré d'aire 13 ; l'élever au carré redonne cette aire : (√13)² = 13. Élever au carré et prendre la racine sont deux opérations qui s'annulent. 169, c'est 13² — on a élevé 13 au carré au lieu de la racine.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_racines-carrees-3e_P4'] },
  },
  {
    id: 'rc-e5',
    skill: 'sens',
    title: 'Épreuve 5',
    prompt: "Un jardin carré doit avoir une aire de 50 m². Que peut-on dire de son côté ?",
    options: [
      'Il mesure 25 m',
      'Il mesure entre 7 m et 8 m, et vaut exactement √50 m',
      'Un tel jardin est impossible',
    ],
    cols: 1,
    correct: 1,
    explain:
      "7² = 49 (trop petit) et 8² = 64 (trop grand) : le côté vit entre 7 et 8, il vaut exactement √50 ≈ 7,07 m. 25 m serait la moitié de l'aire — le carré ferait 625 m². Et le jardin existe bel et bien : la longueur est réelle, c'est seulement son écriture décimale qui ne tombe jamais juste.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_racines-carrees-3e_P5'] },
  },
  {
    id: 'rc-e6',
    skill: 'proprietes',
    title: 'Épreuve 6',
    prompt: 'Une seule de ces égalités est vraie. Laquelle ?',
    options: [
      '$\\sqrt{9} + \\sqrt{16} = \\sqrt{25}$',
      '$\\sqrt{2} \\times \\sqrt{18} = 6$',
      '$\\sqrt{4 + 5} = \\sqrt{4} + \\sqrt{5}$',
    ],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['√9 + √16 = √25', '√2 × √18 = 6', '√(4+5) = √4 + √5'][i],
    cols: 1,
    correct: 1,
    explain:
      "Le PRODUIT passe sous la racine : √2 × √18 = √36 = 6. L'addition, non : √9 + √16 = 3 + 4 = 7, alors que √25 = 5 ; et √9 = 3 alors que √4 + √5 ≈ 2 + 2,24 = 4,24. Une seule règle existe, celle du produit (et du quotient).",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_racines-carrees-3e_P6'] },
  },
  {
    id: 'rc-e7',
    skill: 'simplifier',
    title: 'Épreuve 7',
    prompt: 'Quelle est la forme simplifiée de √18 ?',
    options: ['$3\\sqrt{2}$', '$9\\sqrt{2}$', '$2\\sqrt{9}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['3√2', '9√2', '2√9'][i],
    cols: 3,
    correct: 0,
    explain:
      "18 = 9 × 2, et on SORT LA RACINE du carré parfait : √9 = 3, donc √18 = 3√2. 9√2 sort le 9 tel quel (son carré vaudrait 162, pas 18) ; 2√9 laisse un carré parfait sous la racine — et vaut 6, pas √18.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_racines-carrees-3e_P7'] },
  },
  {
    id: 'rc-e8',
    skill: 'encadrer',
    title: 'Épreuve 8',
    prompt: 'Quelle comparaison est vraie ?',
    options: ['$\\sqrt{50} < 7$', '$\\sqrt{50} > 7$', '$2\\sqrt{3} = \\sqrt{6}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['√50 < 7', '√50 > 7', '2√3 = √6'][i],
    cols: 1,
    correct: 1,
    explain:
      "On compare les carrés : (√50)² = 50 et 7² = 49. Comme 50 > 49, on a √50 > 7 (de très peu : ≈ 7,07). Et 2√3 ≠ √6 : son carré vaut 4 × 3 = 12, donc 2√3 = √12.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_racines-carrees-3e_P8'] },
  },
  {
    id: 'rc-e9',
    skill: 'geometrie',
    title: 'Épreuve 9',
    prompt: 'Un carré a 5 cm de côté. Quelle est la valeur EXACTE de sa diagonale ?',
    options: ['$10 \\text{ cm}$', '$5\\sqrt{2} \\text{ cm}$', '$50 \\text{ cm}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['10 cm', '5√2 cm', '50 cm'][i],
    cols: 3,
    correct: 1,
    explain:
      "Pythagore : d² = 5² + 5² = 50, donc d = √50 = 5√2 ≈ 7,07 cm. 10 cm serait deux côtés bout à bout — or la diagonale coupe au plus court. 50 est d², une aire, pas une longueur.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_racines-carrees-3e_P9'] },
  },
  {
    id: 'rc-e10',
    skill: 'geometrie',
    title: 'Épreuve 10',
    prompt:
      "Un triangle rectangle a deux côtés de l'angle droit de 3 cm et 6 cm. Quelle est son hypoténuse ?",
    options: ['$9 \\text{ cm}$', '$3\\sqrt{5} \\text{ cm}$', '$45 \\text{ cm}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['9 cm', '3√5 cm', '45 cm'][i],
    cols: 3,
    correct: 1,
    explain:
      "h² = 3² + 6² = 9 + 36 = 45, donc h = √45 = 3√5 ≈ 6,7 cm. 9 cm, ce serait 3 + 6 : les côtés ne s'additionnent pas, ce sont leurs CARRÉS qui s'additionnent. 45 est h², pas h.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_racines-carrees-3e_P10'] },
  },
];

const BADGES = [
  { id: 'sens', emoji: '🏅', label: 'Lecteur de carrés', test: (s) => (s.sens ?? 0) === 0 },
  { id: 'repertoire', emoji: '🏅', label: 'Escalier maîtrisé', test: (s) => (s.repertoire ?? 0) === 0 },
  { id: 'encadrer', emoji: '🏅', label: 'Encadreur', test: (s) => (s.encadrer ?? 0) === 0 },
  { id: 'proprietes', emoji: '🏅', label: 'Anti-piège de la somme', test: (s) => (s.proprietes ?? 0) === 0 },
  { id: 'simplifier', emoji: '🏅', label: 'Découpeur de carrés', test: (s) => (s.simplifier ?? 0) === 0 },
  { id: 'geometrie', emoji: '🏅', label: 'Arpenteur', test: (s) => (s.geometrie ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Bâtisseur de carrés', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Prendre la moitié au lieu de la racine (√36 = 18)', right: 'Chercher le nombre qui, multiplié par lui-même, donne 36' },
  { wrong: 'Écrire √(9 + 16) = 3 + 4', right: 'La somme ne passe pas : seuls le produit et le quotient passent' },
  { wrong: 'Simplifier √18 en 9√2', right: 'On sort la RACINE du carré parfait : √9 = 3, donc 3√2' },
  { wrong: 'Croire que 2√3 = √6', right: 'Le coefficient rentre au carré : 2√3 = √(4 × 3) = √12' },
  { wrong: 'Confondre la valeur exacte √50 et son arrondi 7,07', right: 'Exact avec le symbole √, arrondi seulement pour se représenter' },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">√</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          <MathText>{'$\\sqrt{a}$'}</MathText>, c’est le CÔTÉ du carré d’aire a. Toute la leçon
          découle de là : encadrer quand ça ne tombe pas juste, multiplier sous une seule racine,
          découper pour simplifier, comparer par les carrés.
        </p>
      </div>

      <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-emerald-700 text-center">
          Le jardin de 49 m², figé sur son côté juste
        </p>
        <SquareLab mode="reverse" side={7} targetArea={49} maxSide={10} unit="m" showLine={false} frozen />
        <p className="text-center text-xs text-slate-500">
          <MathText>{'$\\sqrt{49} = 7 \\quad \\text{car} \\quad 7^{2} = 49$'}</MathText>
        </p>
      </div>

      <div className="bg-white border-2 border-violet-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-violet-700 text-center">
          Le carré d’aire 12, découpé en quatre
        </p>
        <SquareTiling n={TILE} k={2} frozen />
        <p className="text-center text-xs text-slate-500">
          <MathText>{`$${formatSqrt(TILE)} = \\sqrt{4 \\times 3} = ${formatRoot(simplifyRoot(TILE))}$`}</MathText>
          {' '}≈ {formatDec(approxRoot(TILE, 2))}
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide text-emerald-100 font-mono font-bold">À retenir</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">√a = le côté du carré d’aire a</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">√a × √b = √(ab), mais JAMAIS pour +</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Simplifier = extraire le plus grand carré</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Comparer = comparer les carrés</p>
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
        Diagonales, hypoténuses, écrans, terrains : dès qu’une longueur se déduit d’une aire ou d’un
        théorème de Pythagore, la racine carrée apparaît. On la garde exacte tant qu’on calcule, on
        l’arrondit seulement pour se représenter la taille — comme{' '}
        <MathText>{`$${formatRoot(DIAG50)}$`}</MathText> ≈ {formatDec(approxRoot(50, 2))} pour la
        diagonale d’un carré de 5, ou {bracket(50)[0]} &lt; √50 &lt; {bracket(50)[1]} d’un simple coup
        d’œil.
      </Feedback>
    </div>
  );
}

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : le carré à reconstruire"
      moduleSubtitle="Dix épreuves pour prouver qu’aucune racine ne te résiste."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix carrés à reconstruire. Un seul côté juste à chaque fois.',
        tone: 'amber',
        body: (
          <p>
            Lire une aire, reconnaître un carré parfait, encadrer, multiplier sous une seule racine,
            simplifier, comparer, arpenter : tout ce que tu as manipulé. Réponds aux dix épreuves, puis
            valide pour voir ta correction et tes badges.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Bâtisseur de carrés !',
        title: 'Mission accomplie !',
        message: (
          <>
            Du jardin de 49 m² au découpage du carré d’aire 12, tu as vu, manipulé puis démontré : une
            racine carrée est une longueur — celle du côté d’un carré dont on connaît l’aire.
          </>
        ),
        verbs: ['Encadrer', 'Multiplier', 'Simplifier', 'Comparer'],
        masterBadgeLabel: 'Badge « Bâtisseur de carrés » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
