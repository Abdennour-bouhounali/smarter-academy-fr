import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import NumberLine from '../../../../../common/components/NumberLine';
import PartitionShape from '../components/PartitionShape';
import ObjectGroup from '../components/ObjectGroup';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { fracLineFormat } from '../components/fractionUtils';

/**
 * Module 10 V2 — Boss Final sur le moteur du kit partagé (QCM uniquement).
 *
 * Voir docs/architecture/LESSON_INTEGRATION_GUIDE.md §7 et §11 : ce fichier
 * est un fichier de DONNÉES — épreuves, compétences, badges, synthèse —
 * zéro logique recopiée, le moteur `BossFinal` applique par construction
 * la forme obligatoire (silencieux jusqu'au submit global, correction,
 * profil de maîtrise, synthèse, sans 4ᵉ phase).
 */

const renderFrac = (o) => {
  const [n, d] = o.split('/');
  return <MathText>{`$\\frac{${n}}{${d}}$`}</MathText>;
};

/* ═══ COMPÉTENCES SUIVIES ══════════════════════════════════════════ */
const SKILLS = {
  construire: { label: 'Construire une fraction', module: 2 },
  lire: { label: 'Lire une fraction', module: 4 },
  vocabulaire: { label: 'Numérateur / dénominateur', module: 3 },
  quantite: { label: "Fraction d'une quantité", module: 5 },
  quotient: { label: 'Fraction comme quotient', module: 6 },
  droite: { label: 'Droite graduée', module: 8 },
  equivalence: { label: 'Fractions équivalentes', module: 4 },
  decimales: { label: 'Fractions décimales', module: 9 },
  problemes: { label: 'Problèmes', module: 10 },
};

/* ═══ REGISTRE — les 4 terrains explorés dans la Factory ══════════ */
const REGISTRE = [
  { id: 'chocolat', emoji: '🍫', label: 'Tablette', value: '12 carrés' },
  { id: 'distance', emoji: '🚴', label: 'Distance', value: '3/4 km' },
  { id: 'cereales', emoji: '🥣', label: 'Barres', value: '5 ÷ 4 amis' },
  { id: 'droite', emoji: '📏', label: 'Demi-droite', value: '0 → 1' },
];

/* ═══ ÉPREUVES ══════════════════════════════════════════════════════ */
const EPREUVES = [
  {
    id: 'e1',
    skill: 'construire',
    title: 'Épreuve 1',
    prompt: (
      <>
        Ce trésor est partagé en 5 parts égales. Combien de parts faut-il colorier pour représenter{' '}
        <MathText>{'$\\frac{3}{5}$'}</MathText> ?
      </>
    ),
    extra: <PartitionShape shape="bar" parts={5} shaded={0} tone="amber" size="sm" />,
    options: ['2 parts', '3 parts', '5 parts', '8 parts'],
    cols: 2,
    correct: 1,
    explain: 'Le numérateur indique le nombre de parts prises : 3/5 se colorie en 3 parts sur les 5.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_fractions_P1'] },
  },
  {
    id: 'e2',
    skill: 'lire',
    title: 'Épreuve 2',
    prompt: 'Quelle fraction ce disque représente-t-il ?',
    extra: <PartitionShape shape="circle" parts={6} shaded={5} tone="violet" size="sm" />,
    options: ['1/6', '5/6', '6/5'],
    cols: 3,
    correct: 1,
    renderOption: renderFrac,
    explain: '5 parts coloriées sur 6 parts égales : 5/6.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_fractions_P1'] },
  },
  {
    id: 'e3',
    skill: 'vocabulaire',
    title: 'Épreuve 3',
    prompt: (
      <>
        Dans <MathText>{'$\\frac{2}{7}$'}</MathText>, que représente le 7 ?
      </>
    ),
    options: ['Les parts prises', 'Le nombre total de parts égales', 'Un résultat de calcul'],
    cols: 1,
    correct: 1,
    explain: 'Le 7 est le dénominateur : le nombre total de parts égales du partage.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_fractions_P2'] },
  },
  {
    id: 'e4',
    skill: 'vocabulaire',
    title: 'Épreuve 4',
    prompt: (
      <>
        Dans <MathText>{'$\\frac{5}{8}$'}</MathText>, que représente le 5 ?
      </>
    ),
    options: ['Le nombre de parts prises (numérateur)', 'Le nombre total de parts (dénominateur)'],
    cols: 1,
    correct: 0,
    explain: 'Le 5 est le numérateur : les parts effectivement prises.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_fractions_P2'] },
  },
  {
    id: 'e5',
    skill: 'quantite',
    title: 'Épreuve 5',
    prompt: (
      <>
        Sélectionne <MathText>{'$\\frac{2}{3}$'}</MathText> de ces 15 pièces d'or : combien de pièces cela
        représente-t-il ?
      </>
    ),
    extra: <ObjectGroup total={15} groups={3} selected={0} emoji="🪙" tone="amber" />,
    options: ['5 pièces', '9 pièces', '10 pièces', '13 pièces'],
    cols: 2,
    correct: 2,
    explain: "15 ÷ 3 = 5 pièces par groupe, puis 5 × 2 = 10 pièces pour 2/3.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_fractions_P3'] },
  },
  {
    id: 'e6',
    skill: 'quotient',
    title: 'Épreuve 6',
    prompt: '3 gâteaux identiques sont partagés entre 5 personnes. Quelle part reçoit chacune ?',
    options: ['3/5', '5/3', '3 × 5'],
    cols: 3,
    correct: 0,
    renderOption: (o) => (o.includes('/') ? renderFrac(o) : o),
    explain: '3 ÷ 5 = 3/5 : chacune reçoit 3/5 de gâteau.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_fractions_P1'] },
  },
  {
    id: 'e7',
    skill: 'droite',
    title: 'Épreuve 7',
    prompt: (
      <>
        Cette demi-droite va de 0 à 1, graduée en cinquièmes. Où se trouve{' '}
        <MathText>{'$\\frac{3}{5}$'}</MathText> ?
      </>
    ),
    extra: (
      <NumberLine
        min={0}
        max={1}
        step={0.2}
        labelEvery={1}
        height={140}
        mode="static"
        format={fracLineFormat(5)}
        ariaLabel="Demi-droite graduée de 0 à 1, en cinquièmes"
        edgesOnly
      />
    ),
    options: ['À 1 graduation de 0', 'À 3 graduations de 0', 'À 5 graduations de 0'],
    cols: 1,
    correct: 1,
    explain: '3/5 se place à 3 graduations de 0, sur un partage en 5 parts égales entre 0 et 1.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_fractions_P4'] },
  },
  {
    id: 'e8',
    skill: 'equivalence',
    title: 'Épreuve 8',
    prompt: 'Ces deux figures représentent-elles la même quantité ?',
    extra: (
      <div className="grid grid-cols-2 gap-3">
        <PartitionShape shape="bar" parts={2} shaded={1} tone="sky" size="sm" />
        <PartitionShape shape="bar" parts={6} shaded={3} tone="sky" size="sm" />
      </div>
    ),
    options: ['Non, 1/2 ≠ 3/6', 'Oui : 1/2 = 3/6, même surface coloriée'],
    cols: 1,
    correct: 1,
    explain: "La moitié d'une barre coupée en 6 parts égales occupe 3 parts : 1/2 = 3/6.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_fractions_P4'] },
  },
  {
    id: 'e9',
    skill: 'decimales',
    title: 'Épreuve 9',
    prompt: (
      <>
        <strong className="font-mono">0,75</strong> s'écrit sous forme de fraction décimale. Laquelle ?
      </>
    ),
    options: ['75/10', '7/100', '75/100', '750/100'],
    cols: 2,
    correct: 2,
    explain: '0,75 se lit « 75 centièmes » : numérateur 75, dénominateur 100 (une puissance de 10).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_fractions_P3'] },
  },
  {
    id: 'e10',
    skill: 'problemes',
    title: 'Épreuve 10',
    prompt: (
      <>
        Une tablette de 12 carrés est partagée équitablement entre 4 enfants. Chaque enfant mange sa part.
        Combien de carrés mange-t-il ?
      </>
    ),
    options: ['3 carrés', '4 carrés', '6 carrés', '12 carrés'],
    cols: 2,
    correct: 0,
    explain: '12 ÷ 4 = 3 carrés par enfant : chacun mange 1/4 de la tablette, soit 3 carrés.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_fractions_P1'] },
  },
  {
    id: 'e11',
    skill: 'problemes',
    title: 'Épreuve 11',
    prompt: (
      <>
        Léa a parcouru <MathText>{'$\\frac{3}{4}$'}</MathText> de kilomètre (1 km = 1 000 m). Quelle distance a-t-elle
        parcourue, en mètres ?
      </>
    ),
    options: ['250 m', '400 m', '750 m', '1 000 m'],
    cols: 2,
    correct: 2,
    explain: '1 000 ÷ 4 = 250 m par quart, puis 250 × 3 = 750 m. Et 750 m correspond à 0,75 km.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_fractions_P3'] },
  },
  {
    id: 'e12',
    skill: 'problemes',
    title: 'Épreuve 12',
    prompt: '5 barres de céréales identiques sont partagées équitablement entre 4 amis. Quelle fraction de barre chacun reçoit-il ?',
    options: ['5/4', '4/5', '5/1'],
    cols: 3,
    correct: 0,
    renderOption: renderFrac,
    explain: '5 barres partagées entre 4 amis : chacun reçoit 5 ÷ 4 = 5/4 de barre, soit plus d\'une barre entière.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_fractions_P2'] },
  },
];

/* ═══ BADGES ═══════════════════════════════════════════════════════ */
const BADGES = [
  { id: 'constructeur', emoji: '🏅', label: 'Constructeur de fractions', test: (s) => (s.construire ?? 0) === 0 },
  { id: 'decodeur', emoji: '🏅', label: 'Décodeur du numérateur', test: (s) => (s.vocabulaire ?? 0) === 0 },
  { id: 'partage', emoji: '🏅', label: 'Maître du partage', test: (s) => (s.quotient ?? 0) === 0 },
  { id: 'explorateur', emoji: '🏅', label: 'Explorateur de la droite graduée', test: (s) => (s.droite ?? 0) === 0 },
  { id: 'detective', emoji: '🏅', label: 'Détective des fractions', test: (s) => (s.equivalence ?? 0) === 0 && (s.decimales ?? 0) === 0 },
  { id: 'resolveur', emoji: '🏅', label: 'Résolveur de problèmes', test: (s) => (s.problemes ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Maître des fractions', test: (s) => Object.values(s).every((v) => v === 0) },
];

/* ═══ SYNTHÈSE ══════════════════════════════════════════════════════ */
function Synthese() {
  const BRANCHES = [
    { title: 'PARTAGE', body: <><MathText>{'$\\frac{3}{4}$'}</MathText> = 3 parts parmi 4 parts égales</>, tone: 'bg-blue-50 border-blue-200' },
    { title: 'ÉCRITURE', body: <MathText>{'$\\frac{3}{4}$'}</MathText>, tone: 'bg-indigo-50 border-indigo-200' },
    { title: 'VOCABULAIRE', body: '3 = numérateur, 4 = dénominateur', tone: 'bg-sky-50 border-sky-200' },
    { title: 'NOMBRE', body: '3/4 a une position, comme tout nombre', tone: 'bg-violet-50 border-violet-200' },
    { title: 'QUOTIENT', body: <><MathText>{'$\\frac{3}{4} = 3 \\div 4$'}</MathText></>, tone: 'bg-amber-50 border-amber-200' },
    { title: 'DROITE GRADUÉE', body: '3/4 est entre 0 et 1', tone: 'bg-rose-50 border-rose-200' },
    { title: 'FRACTION DÉCIMALE', body: <><MathText>{'$\\frac{3}{10} = 0{,}3$'}</MathText></>, tone: 'bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Le concept central</div>
        <div className="text-4xl font-space font-extrabold">FRACTION</div>
        <p className="text-sm text-slate-300">une quantité née d'un partage, qui peut se lire de sept façons.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BRANCHES.map((b) => (
          <div key={b.title} className={`rounded-xl border-2 px-4 py-3 ${b.tone}`}>
            <div className="font-mono font-extrabold text-xs tracking-wider text-slate-700">{b.title}</div>
            <div className="text-sm mt-1 text-slate-800">{b.body}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="font-space font-bold text-slate-800 text-sm">3/4, sous tous ses angles</h3>
        <PartitionShape shape="bar" parts={4} shaded={3} tone="amber" size="md" />
        <div className="text-center font-mono font-bold text-slate-800 bg-slate-100 rounded-xl py-2.5">
          <MathText>{'$\\frac{3}{4} = 3 \\div 4 = 0{,}75$'}</MathText>
        </div>
      </div>

      <Feedback tone="info">
        Rappel du lien avec les décimaux (vu au module 9) : dès que le dénominateur est 10, 100 ou 1 000, la
        fraction s'écrit directement avec une virgule.
      </Feedback>
    </div>
  );
}

/* ═══ MODULE ═══════════════════════════════════════════════════════ */
export default function Module10BossFinal() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(10)}
      moduleNumber={10}
      moduleTitle="🏆 La Mission du Partage"
      moduleSubtitle="Douze épreuves pour décrocher ton badge de Maître des fractions."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Douze épreuves. Personne ne te dira laquelle utiliser.',
        tone: 'amber',
        body: (
          <p>
            Construire, lire, partager, quotient, droite graduée, équivalence, décimales, problèmes concrets : à toi
            de choisir la bonne compétence à chaque fois. Réponds à toutes les épreuves, puis valide pour découvrir
            ta correction et tes badges de maîtrise.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître des fractions !',
        title: 'Leçon terminée !',
        message: (
          <>
            Une fraction représente une quantité née d'un partage. Tu peux la construire, la nommer, la voir comme
            un nombre, comme un quotient, la placer sur une droite — et la relier aux décimaux que tu connaissais
            déjà.
          </>
        ),
        verbs: ['Partager', 'Nommer', 'Placer', 'Relier'],
        masterBadgeLabel: 'Badge « Maître des fractions » débloqué',
      }}
      xpPerCorrect={20}
    />
  );
}
