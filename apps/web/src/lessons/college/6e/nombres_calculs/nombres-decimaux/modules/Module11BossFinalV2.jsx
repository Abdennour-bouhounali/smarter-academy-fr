import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import NumberLine from '../../../../../common/components/NumberLine';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import DecimalPlaceTable from '../components/DecimalPlaceTable';
import RepresentationPanel from '../components/RepresentationPanel';
import { formatDec } from '../components/decimalUtils';

/**
 * Module 11 V2 — Boss Final reconstruit sur le lesson kit (BossFinal).
 *
 * Toutes les épreuves deviennent des QCM (contrat §7 : QCM uniquement).
 * L'ancienne épreuve 5 ("range ces 4 relevés") utilisait un OrderingGame —
 * transformée ici en QCM ("quel rangement est correct ?", un ordre correct
 * + 3 distracteurs plausibles). L'épreuve "place sur la droite graduée"
 * devient un QCM visuel (la droite reste affichée via `extra`, mais le choix
 * se fait parmi 4 valeurs, jamais par glisser-déposer).
 *
 * Le "Flash retour" (4e phase) a été supprimé conformément au §7 : la
 * synthèse ferme la boucle, pas de second gate après le score.
 */

const MESURES = [
  { id: 'masse', emoji: '⚖️', label: 'Masse du flacon', value: 0.75, unit: 'kg' },
  { id: 'volume', emoji: '🧪', label: 'Volume du bécher', value: 1.25, unit: 'L' },
  { id: 'longueur', emoji: '📏', label: 'Longueur du tube', value: 3.08, unit: 'm' },
  { id: 'epaisseur', emoji: '📐', label: 'Épaisseur de la plaque', value: 0.05, unit: 'm' },
  { id: 'duree', emoji: '⏱️', label: 'Durée de la réaction', value: 2.4, unit: 's' },
  { id: 'prix', emoji: '💶', label: 'Prix du matériel', value: 12.5, unit: '€' },
];

const SKILLS = {
  fractions: { label: 'Fractions décimales', module: 3 },
  virgule: { label: 'Écriture à virgule', module: 4 },
  position: { label: 'Valeur de position', module: 5 },
  comparaison: { label: 'Comparaison', module: 7 },
  rangement: { label: 'Rangement', module: 7 },
  droite: { label: 'Droite graduée', module: 8 },
  grandeur: { label: 'Ordre de grandeur', module: 9 },
  problemes: { label: 'Problèmes', module: 10 },
};

const renderFraction = (o) => {
  const [n, d] = o.split('/');
  return <MathText>{`$\\frac{${n}}{${d}}$`}</MathText>;
};

const EPREUVES = [
  {
    id: 'e1',
    skill: 'fractions',
    title: 'Épreuve 1',
    prompt: (
      <>
        Une étiquette abîmée indique la masse du flacon sous la forme <MathText>{'$\\frac{75}{100}$'}</MathText>{' '}
        kg. Quelle écriture à virgule correspond ?
      </>
    ),
    options: ['7,5 kg', '0,75 kg', '0,075 kg', '75 kg'],
    correct: 1,
    explain: "75 centièmes, cela ne fait pas une unité entière : 0 unité, 7 dixièmes et 5 centièmes → 0,75 kg.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-decimaux_P1'] },
  },
  {
    id: 'e2',
    skill: 'virgule',
    title: 'Épreuve 2',
    prompt: (
      <>
        Le tube mesure <strong className="font-mono">3,08 m</strong>. Quelle est sa fraction décimale ?
      </>
    ),
    options: ['38/100', '308/100', '308/10', '3080/100'],
    correct: 1,
    cols: 4,
    renderOption: renderFraction,
    explain:
      "3,08 = 3 unités (300 centièmes) + 0 dixième + 8 centièmes = 308 centièmes, soit 308/100. Le zéro des dixièmes compte !",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-decimaux_P2'] },
  },
  {
    id: 'e3',
    skill: 'position',
    title: 'Épreuve 3',
    prompt: (
      <>
        Dans le volume <strong className="font-mono">1,25 L</strong>, que représente le chiffre{' '}
        <strong className="font-mono">5</strong> ?
      </>
    ),
    extra: <DecimalPlaceTable value={1.25} intPlaces={1} decPlaces={2} compact />,
    options: ['5 unités', '5 dixièmes', '5 centièmes', '5 millièmes'],
    correct: 2,
    explain: 'Le 5 est à la deuxième position après la virgule : les centièmes. Il vaut 5 centièmes, soit 0,05.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-decimaux_P3'] },
  },
  {
    id: 'e4',
    skill: 'comparaison',
    title: 'Épreuve 4',
    prompt: (
      <>
        Deux béchers portent les mentions <strong className="font-mono">0,7 L</strong> et{' '}
        <strong className="font-mono">0,68 L</strong>. Lequel contient le plus de liquide ?
      </>
    ),
    options: ['0,7 L', '0,68 L', 'Les deux contiennent la même quantité'],
    correct: 0,
    cols: 3,
    explain:
      "On aligne : 0,70 et 0,68. Or 70 centièmes > 68 centièmes, donc 0,7 > 0,68. Avoir plus de chiffres ne rend pas un nombre plus grand.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-decimaux_P5'] },
  },
  {
    id: 'e5',
    skill: 'rangement',
    title: 'Épreuve 5',
    prompt: <>Quatre relevés : 0,05 / 0,5 / 0,25 / 0,75. Quel rangement du plus petit au plus grand est correct ?</>,
    options: [
      '0,05 < 0,25 < 0,5 < 0,75',
      '0,05 < 0,5 < 0,25 < 0,75',
      '0,5 < 0,25 < 0,05 < 0,75',
      '0,75 < 0,5 < 0,25 < 0,05',
    ],
    correct: 0,
    cols: 1,
    explain: '0,05 < 0,25 < 0,5 < 0,75. En alignant : 0,05 / 0,25 / 0,50 / 0,75.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-decimaux_P4'] },
  },
  {
    id: 'e6',
    skill: 'droite',
    title: 'Épreuve 6',
    prompt: (
      <>
        Sur cette droite graduée (pas de 0,05), à quelle valeur correspond le repère rouge ?
      </>
    ),
    extra: (
      <NumberLine
        min={1}
        max={1.5}
        step={0.05}
        labelEvery={2}
        height={140}
        format={(v) => formatDec(v)}
        markers={[{ value: 1.25, label: '?', color: '#dc2626' }]}
        ariaLabel="Droite graduée de 1 à 1,5, pas de 0,05, un repère à identifier"
      />
    ),
    options: ['1,2', '1,25', '1,3', '1,35'],
    correct: 1,
    explain: "Le pas vaut 0,05. Depuis 1, il faut avancer de 5 graduations : 1 + 0,25 = 1,25.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-decimaux_P6'] },
  },
  {
    id: 'e7',
    skill: 'grandeur',
    title: 'Épreuve 7',
    prompt: (
      <>
        Une pesée donne <strong className="font-mono">2,96 kg</strong>. Quel ordre de grandeur annonces-tu ?
      </>
    ),
    options: ['Environ 2 kg', 'Environ 3 kg', 'Environ 2,5 kg', 'Environ 30 kg'],
    correct: 1,
    explain: "2,96 n'est qu'à 0,04 de 3 : l'ordre de grandeur est 3 kg.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-decimaux_P7'] },
  },
  {
    id: 'e8',
    skill: 'problemes',
    title: 'Épreuve 8',
    prompt: (
      <>
        Tu verses le flacon (<strong className="font-mono">0,75 L</strong>) et le bécher (
        <strong className="font-mono">1,25 L</strong>) dans un même récipient. Que peux-tu affirmer ?
      </>
    ),
    options: ['Le total dépasse 2 L', 'Le total fait exactement 2 L', 'Le total est inférieur à 2 L', 'On ne peut pas le savoir'],
    correct: 1,
    explain:
      '0,75 + 1,25 : les centièmes se complètent (75 + 25 = 100 centièmes = 1 unité). Le total fait exactement 2 L. Une estimation rapide le confirmait : environ 1 + 1 = 2.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-decimaux_P7'] },
  },
];

const BADGES = [
  { id: 'dixiemes', emoji: '🏅', label: 'Explorateur des dixièmes', test: (s) => (s.fractions ?? 0) === 0 },
  { id: 'centiemes', emoji: '🏅', label: 'Maître des centièmes', test: (s) => (s.position ?? 0) === 0 },
  { id: 'decodeur', emoji: '🏅', label: 'Décodeur des nombres décimaux', test: (s) => (s.virgule ?? 0) === 0 },
  { id: 'detective', emoji: '🏅', label: 'Détective des comparaisons', test: (s) => (s.comparaison ?? 0) === 0 && (s.rangement ?? 0) === 0 },
  { id: 'droite', emoji: '🏅', label: 'Expert de la droite graduée', test: (s) => (s.droite ?? 0) === 0 },
  { id: 'estimateur', emoji: '🏅', label: 'Estimateur hors pair', test: (s) => (s.grandeur ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Laboratoire parfait', test: (s) => Object.values(s).every((v) => v === 0) },
];

function Synthese() {
  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Le concept central</div>
        <div className="text-3xl sm:text-4xl font-space font-extrabold font-mono">3,75</div>
        <div className="text-slate-500 text-xl" aria-hidden="true">↓</div>
        <p className="text-sm text-slate-300">
          ce n'est pas « 3 virgule 75 » : c'est une <strong className="text-white">quantité</strong> — 3 unités
          entières et 75 centièmes d'unité.
        </p>
      </div>

      <RepresentationPanel
        value={3.75}
        views={['virgule', 'fraction', 'decomposition', 'positions', 'droite']}
        mode="grid"
        title="Les cinq visages de 3,75"
      />

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="font-space font-bold text-slate-800 text-sm">Le tableau de numération</h3>
        <DecimalPlaceTable value={3.75} intPlaces={1} decPlaces={2} showValues />
        <div className="grid grid-cols-3 gap-2 text-center">
          {[['3 unités', '3'], ['7 dixièmes', '0,7'], ['5 centièmes', '0,05']].map(([a, b]) => (
            <div key={a} className="bg-slate-50 rounded-xl px-2 py-2 border border-slate-200">
              <div className="text-[11px] font-mono text-slate-500">{a}</div>
              <div className="font-mono font-bold text-slate-800">{b}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="font-space font-bold text-amber-900 text-sm">⚖️ Comparer</div>
          <ol className="text-xs text-amber-900 space-y-1 list-decimal list-inside">
            <li>Comparer d'abord les parties entières.</li>
            <li>En cas d'égalité, compléter avec des zéros pour avoir autant de décimales.</li>
            <li>Comparer ensuite de gauche à droite, et s'arrêter à la première différence.</li>
          </ol>
          <div className="bg-white rounded-xl px-3 py-2 text-center font-mono text-xs text-amber-900">
            3,75 vs 3,8 → 3,80 → <strong>3,75 &lt; 3,8</strong>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 space-y-2">
          <div className="font-space font-bold text-violet-900 text-sm">🎯 Estimer</div>
          <p className="text-xs text-violet-900">
            3,75 est au-delà de la moitié entre 3 et 4 : à l'unité près, <strong>3,75 ≈ 4</strong>. L'estimation
            sert à vérifier qu'un résultat est plausible.
          </p>
          <NumberLine
            min={3}
            max={4}
            step={0.1}
            labelEvery={5}
            height={120}
            format={(v) => formatDec(v)}
            markers={[{ value: 3.75, label: '3,75', color: '#7c3aed' }]}
            ariaLabel="3,75 entre 3 et 4"
          />
        </div>
      </div>

      <Feedback tone="info">
        Et les zéros ? <strong>3,5 = 3,50 = 3,500</strong> (zéros ajoutés à la fin), mais <strong>3,5 ≠ 3,05</strong> :
        un zéro juste après la virgule décale tous les chiffres.
      </Feedback>
    </div>
  );
}

export default function Module11BossFinal() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(11)}
      moduleNumber={11}
      moduleTitle="🏆 Le Laboratoire des Décimaux"
      moduleSubtitle="Huit épreuves, un profil de maîtrise et une synthèse visuelle."
      estimatedTime="18 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={12 * 60}
      timerLabel="12 min"
      brief={{
        tag: '🧪 Boss final',
        title: 'Bienvenue au laboratoire de mesure du collège.',
        tone: 'amber',
        body: (
          <p>
            Six relevés ont été effectués ce matin. Huit épreuves t'attendent : à toi de choisir, à chaque fois,
            la bonne façon de lire, transformer, comparer ou estimer. Réponds à toutes les épreuves, puis valide
            pour découvrir ta correction et tes badges de maîtrise.
          </p>
        ),
      }}
      registre={MESURES.map((m) => ({ id: m.id, emoji: m.emoji, label: m.label, value: `${formatDec(m.value)} ${m.unit}` }))}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître des nombres décimaux !',
        title: 'Leçon terminée !',
        message:
          "Un nombre décimal représente une quantité. Tu sais la découper, l'écrire en fraction décimale ou avec une virgule, dire ce que vaut chaque chiffre, la comparer, la ranger, la placer sur une droite et vérifier qu'un résultat est raisonnable.",
        verbs: ['Fractions', 'Virgule', 'Comparer', 'Estimer'],
        masterBadgeLabel: 'Badge « Laboratoire parfait » débloqué',
      }}
      xpPerCorrect={20}
    />
  );
}
