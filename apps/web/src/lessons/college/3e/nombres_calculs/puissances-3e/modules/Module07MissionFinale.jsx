import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import PowerTower from '../components/PowerTower';
import DecimalShifter from '../components/DecimalShifter';
import { formatDec, formatScientific, toScientific } from '../components/powerUtils';
import { UNIVERSE_ITEMS } from '../components/universeItems';

/**
 * Module 7 — Boss Final (moteur du kit, QCM uniquement). Fichier de DONNÉES.
 *
 * Épreuves écrites EN DERNIER. Sept d'entre elles reprennent le bilan
 * pré-kit de cette leçon (multiplication répétée, lecture de 4^3, exposant
 * négatif sur la virgule, produit et quotient de puissances, écriture
 * scientifique d'un petit nombre, comparaison d'ordres de grandeur) ; trois
 * sont ajoutées pour couvrir P1 (le pliage), P4 (le rôle de l'exposant,
 * a^0) et P9 (passer d'une écriture décimale à l'écriture scientifique).
 *
 * Chaque distracteur encode un piège réellement travaillé dans les modules
 * 1 à 6 —
 *   · « 2^5 = 10 » : exposant confondu avec un facteur (M1)
 *   · « 4^3 = 4 × 3 » : la lecture de l'exposant (M1)
 *   · « a^0 = 0 » : la tour vide ne vaut pas rien (M2)
 *   · « 10^{-2} = −100 » : le signe passerait sur le nombre (M2, M4)
 *   · « 3^2 × 3^3 = 9^5 » : on multiplierait aussi les bases (M3)
 *   · « 3^2 × 3^3 = 3^6 » : on multiplierait les exposants (M3)
 *   · « 7^6 ÷ 7^4 = 7^{10} » : on additionnerait au lieu de soustraire (M3)
 *   · « 38 × 10^{-5} » : coefficient hors [1 ; 10[ (M5)
 *   · « 9 × 10^3 > 2 × 10^5 » : comparer les coefficients d'abord (M4, M6)
 *   · « rapport = somme des exposants » : produit confondu avec quotient (M6)
 *
 * Couverture des 11 LPs : P1 (e1), P2 (e2), P3 (e3), P4 (e4), P5 (e5, e6),
 * P6 (e7), P7 (e7), P8 (e8), P9 (e9), P10 (e10), P11 (e10).
 */
const TERRE = UNIVERSE_ITEMS.find((i) => i.id === 'terre');
const GALAXIE = UNIVERSE_ITEMS.find((i) => i.id === 'galaxie');
const GLOBULE = UNIVERSE_ITEMS.find((i) => i.id === 'globule');

const REGISTRE = [
  { id: 'compte', emoji: '🧱', label: "L'exposant", value: 'compte les facteurs' },
  { id: 'produit', emoji: '➕', label: 'Produit', value: 'on ajoute' },
  { id: 'quotient', emoji: '➖', label: 'Quotient', value: 'on soustrait' },
  { id: 'sci', emoji: '🔬', label: 'Coefficient', value: 'entre 1 et 10' },
];

const SKILLS = {
  notation: { label: 'Lire et écrire une puissance', module: 1 },
  calculer: { label: "Calculer une puissance, rôle de l'exposant", module: 2 },
  regles: { label: 'Les trois règles de calcul', module: 3 },
  dix: { label: 'Puissances de 10 et ordres de grandeur', module: 4 },
  scientifique: { label: 'Écriture scientifique', module: 5 },
  problemes: { label: "Comparer et résoudre à l'échelle de l'univers", module: 6 },
};

const EPREUVES = [
  {
    id: 'pu-e1',
    skill: 'notation',
    title: 'Épreuve 1',
    prompt:
      "On plie une feuille 5 fois : le nombre d'épaisseurs double à chaque pli. Quelle écriture donne le nombre d'épaisseurs ?",
    options: ['$2 \\times 5$', '$5^{2}$', '$2^{5}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['2 × 5', '5²', '2⁵'][i],
    correctionLabel: '2⁵',
    cols: 3,
    correct: 2,
    explain:
      "Doubler cinq fois, c'est multiplier cinq fois par 2 : 2 × 2 × 2 × 2 × 2 = 2⁵ = 32 épaisseurs. 2 × 5 = 10 additionne cinq fois 2 ; 5² = 25 échange la base et l'exposant.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_puissances-3e_P1'] },
  },
  {
    id: 'pu-e2',
    skill: 'notation',
    title: 'Épreuve 2',
    prompt: "Dans l'écriture 4³, quelle multiplication est représentée ?",
    options: ['$4 + 4 + 4$', '$4 \\times 3$', '$4 \\times 4 \\times 4$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['4 + 4 + 4', '4 × 3', '4 × 4 × 4'][i],
    correctionLabel: '4 × 4 × 4',
    cols: 3,
    correct: 2,
    explain:
      "L'exposant indique combien de fois la base apparaît dans la MULTIPLICATION : 4³ = 4 × 4 × 4 = 64. « 4 × 3 = 12 » est l'erreur la plus classique, et « 4 + 4 + 4 = 12 » est une addition répétée, pas une puissance.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_puissances-3e_P2'] },
  },
  {
    id: 'pu-e3',
    skill: 'calculer',
    title: 'Épreuve 3',
    prompt: 'Combien vaut 3⁴ ?',
    options: ['12', '81', '64'],
    cols: 3,
    correct: 1,
    explain:
      "3⁴ = 3 × 3 × 3 × 3 = 81. 12 vient de 3 × 4 (l'exposant pris pour un facteur) ; 64 est 4³, base et exposant échangés.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_puissances-3e_P3'] },
  },
  {
    id: 'pu-e4',
    skill: 'calculer',
    title: 'Épreuve 4',
    prompt: "Que vaut 7⁰, et pourquoi ?",
    options: [
      '0, car il n’y a aucun facteur',
      '1, car en dépilant la tour on divise par 7 à chaque cran : après 7 vient 1',
      '7, car il reste toujours la base',
    ],
    cols: 1,
    correct: 1,
    explain:
      "Descendre d'un cran divise par la base : 343, 49, 7, puis 1. La tour vide vaut 1, pas 0 — une multiplication sans facteur vaut 1, comme une addition sans terme vaut 0. Et un cran de plus donne 7⁻¹ = 1/7.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_puissances-3e_P4'] },
  },
  {
    id: 'pu-e5',
    skill: 'regles',
    title: 'Épreuve 5',
    prompt: 'Simplifie 3² × 3³.',
    options: ['$9^{5}$', '$3^{5}$', '$3^{6}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['9⁵', '3⁵', '3⁶'][i],
    correctionLabel: '3⁵',
    cols: 3,
    correct: 1,
    explain:
      "Fusionner deux tours de même base, c'est ajouter les blocs : 2 + 3 = 5, donc 3⁵ = 243. La base ne change jamais (d'où 9⁵ est faux), et on ne multiplie pas les exposants (3⁶ serait (3²)³).",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_puissances-3e_P5'] },
  },
  {
    id: 'pu-e6',
    skill: 'regles',
    title: 'Épreuve 6',
    prompt: 'Simplifie 7⁶ ÷ 7⁴.',
    options: ['$7^{10}$', '$7^{2}$', '$7^{24}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['7¹⁰', '7²', '7²⁴'][i],
    correctionLabel: '7²',
    cols: 3,
    correct: 1,
    explain:
      "Diviser, c'est retirer des blocs : 6 − 4 = 2, donc 7² = 49. 7¹⁰ additionne les exposants (règle du produit) et 7²⁴ les multiplie (règle de la puissance de puissance).",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_puissances-3e_P5'] },
  },
  {
    id: 'pu-e7',
    skill: 'dix',
    title: 'Épreuve 7',
    extra: (
      <p className="text-xs text-slate-500 text-center">
        Rappel du registre : un globule rouge mesure{' '}
        <MathText>{`$${formatScientific(toScientific(GLOBULE.meters))}$`}</MathText> m.
      </p>
    ),
    prompt: "Un globule rouge mesure 8 × 10⁻⁶ m. Que fait cet exposant négatif ?",
    options: [
      'Il décale la virgule de 6 rangs vers la droite : le nombre grandit',
      'Il décale la virgule de 6 rangs vers la gauche : le nombre rapetisse, mais reste positif',
      'Il rend le nombre négatif : −8 000 000 m',
    ],
    cols: 1,
    correct: 1,
    explain:
      "Multiplier par 10⁻⁶, c'est diviser par 10⁶ : la virgule glisse de 6 rangs vers la gauche et 8 devient 0,000008. Le nombre est petit, jamais négatif — le « − » porte sur l'exposant, pas sur la valeur. Son ordre de grandeur est 10⁻⁶ m.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_puissances-3e_P6', '3e_puissances-3e_P7'],
    },
  },
  {
    id: 'pu-e8',
    skill: 'scientifique',
    title: 'Épreuve 8',
    prompt: "Quelle écriture de 0,00038 est l'écriture SCIENTIFIQUE ?",
    options: ['$3{,}8 \\times 10^{-4}$', '$3{,}8 \\times 10^{4}$', '$38 \\times 10^{-5}$', '$0{,}38 \\times 10^{-3}$'],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['3,8 × 10⁻⁴', '3,8 × 10⁴', '38 × 10⁻⁵', '0,38 × 10⁻³'][i],
    correctionLabel: '3,8 × 10⁻⁴',
    cols: 1,
    correct: 0,
    explain:
      "Le coefficient doit vérifier 1 ≤ a < 10 : seul 3,8 convient. 38 est trop grand, 0,38 trop petit — ces deux écritures valent pourtant bien 0,00038. Et 3,8 × 10⁴ = 38 000 : le signe de l'exposant est inversé.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_puissances-3e_P8'] },
  },
  {
    id: 'pu-e9',
    skill: 'scientifique',
    title: 'Épreuve 9',
    prompt: "Le diamètre de la Terre vaut 12 700 000 m. Comment passe-t-on à l'écriture scientifique ?",
    options: [
      'On avance la virgule de 7 rangs : $1{,}27 \\times 10^{-7}$',
      'On recule la virgule de 7 rangs, donc l’exposant vaut $+7$ : $1{,}27 \\times 10^{7}$',
      'On garde le nombre tel quel et on ajoute $\\times 10^{0}$',
    ],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['1,27 × 10⁻⁷', '1,27 × 10⁷', '12 700 000 × 10⁰'][i],
    correctionLabel: '1,27 × 10⁷',
    cols: 1,
    correct: 1,
    explain:
      "On déplace la virgule jusqu'à n'avoir qu'un chiffre non nul devant : 12 700 000 → 1,27, soit 7 rangs. Le nombre étant GRAND, l'exposant est positif : 1,27 × 10⁷. La dernière écriture est juste en valeur mais son coefficient, 12 700 000, n'est pas entre 1 et 10.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_puissances-3e_P9'] },
  },
  {
    id: 'pu-e10',
    skill: 'problemes',
    title: 'Épreuve 10',
    extra: (
      <p className="text-xs text-slate-500 text-center">
        Registre : Terre <MathText>{`$${formatScientific(toScientific(TERRE.meters))}$`}</MathText> m · Voie
        lactée <MathText>{`$${formatScientific(toScientific(GALAXIE.meters))}$`}</MathText> m.
      </p>
    ),
    prompt:
      'Le diamètre de la Terre vaut 1,27 × 10⁷ m et celui de la Voie lactée 1 × 10²¹ m. Combien de fois la galaxie est-elle plus grande, environ ?',
    options: ['Environ 10 fois', 'Environ $10^{14}$ fois', 'Environ $10^{28}$ fois'],
    renderOption: (o) => (o.startsWith('$') ? <MathText>{o}</MathText> : o),
    optionLabel: (i) => ['10 fois', '10¹⁴ fois', '10²⁸ fois'][i],
    correctionLabel: '10¹⁴ fois',
    cols: 3,
    correct: 1,
    explain:
      "Un rapport de puissances de 10 se lit en SOUSTRAYANT les exposants : 21 − 7 = 14, donc environ 10¹⁴ fois. 10²⁸ additionne les exposants (règle du produit, pas du quotient) ; « 10 fois » compare les coefficients au lieu des ordres de grandeur.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['3e_puissances-3e_P10', '3e_puissances-3e_P11'],
    },
  },
];

const BADGES = [
  { id: 'notation', emoji: '🏅', label: 'Lecteur de puissances', test: (s) => (s.notation ?? 0) === 0 },
  { id: 'calculer', emoji: '🏅', label: 'Calculateur d’exposants', test: (s) => (s.calculer ?? 0) === 0 },
  { id: 'regles', emoji: '🏅', label: 'Maître des trois règles', test: (s) => (s.regles ?? 0) === 0 },
  { id: 'dix', emoji: '🏅', label: 'Pilote de la virgule', test: (s) => (s.dix ?? 0) === 0 },
  { id: 'scientifique', emoji: '🏅', label: 'Virtuose de l’écriture scientifique', test: (s) => (s.scientifique ?? 0) === 0 },
  { id: 'problemes', emoji: '🏅', label: "Explorateur de l'univers", test: (s) => (s.problemes ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Compteur de facteurs', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Lire 2⁵ comme 2 × 5', right: 'L’exposant COMPTE les facteurs : 2 × 2 × 2 × 2 × 2 = 32' },
  { wrong: 'Écrire a⁰ = 0', right: 'La tour vide vaut 1 : descendre d’un cran divise par la base' },
  { wrong: 'Croire que 10⁻² est négatif', right: 'Il est petit et positif : 1/100 = 0,01' },
  { wrong: '3² × 3³ = 9⁵ ou 3⁶', right: 'On ajoute les exposants, la base ne bouge pas : 3⁵' },
  { wrong: 'Comparer les coefficients avant les exposants', right: 'L’exposant décide en premier : 2 × 10⁵ > 9 × 10³' },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">🚀</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Un exposant n’est pas un nombre de plus dans un calcul : c’est un <strong>compte de facteurs</strong>.
          Toute la leçon consiste à lire ce compte — pour calculer, pour simplifier, pour changer d’échelle.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-slate-700 text-center">
          Les deux tours, figées sur la fusion
        </p>
        <PowerTower base={3} n={2} n2={3} mode="merge" combined frozen label="Fusion de deux tours, figée" />
        <p className="text-center text-xs text-slate-500">
          <MathText>{'$3^{2} \\times 3^{3} = 3^{5} = 243$'}</MathText> — 2 blocs plus 3 blocs.
        </p>
      </div>

      <div className="bg-white border-2 border-violet-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-violet-700 text-center">
          Et la virgule, posée sur son exposant
        </p>
        <DecimalShifter mantissa={3.45} n={4} frozen />
        <p className="text-center text-xs text-slate-500">
          <MathText>{'$3{,}45 \\times 10^{4} = 34\\,500$'}</MathText> — quatre rangs vers la droite.
        </p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide text-emerald-100 font-mono font-bold">À retenir</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Produit : on ajoute les exposants</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Quotient : on les soustrait</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Puissance de puissance : on les multiplie</p>
        <p className="font-mono font-extrabold text-sm sm:text-base">Écriture scientifique : 1 ≤ a &lt; 10</p>
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
        Astronomie, biologie, informatique : dès qu’un nombre est trop grand ou trop petit pour être écrit
        en entier, on le range en <strong>a × 10ⁿ</strong> et on ne regarde plus que l’exposant.
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
      moduleTitle="🏆 Mission finale : le compte des facteurs"
      moduleSubtitle="Dix épreuves pour prouver qu’aucun exposant ne te surprend."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix épreuves, du pliage de la feuille à la taille de la galaxie.',
        tone: 'amber',
        body: (
          <p>
            Lire une puissance, la calculer, appliquer les trois règles, faire glisser la virgule, écrire un
            nombre en notation scientifique et comparer des ordres de grandeur : tout ce que tu as manipulé.
            Réponds aux dix épreuves, puis valide pour voir ta correction et tes badges.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Compteur de facteurs !',
        title: 'Mission accomplie !',
        message: (
          <>
            De la feuille pliée cinq fois à la Voie lactée, tu as vu, empilé puis démontré : l’exposant
            compte les facteurs, et c’est lui qui décide de tout.
          </>
        ),
        verbs: ['Compter', 'Empiler', 'Décaler', 'Comparer'],
        masterBadgeLabel: 'Badge « Compteur de facteurs » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
