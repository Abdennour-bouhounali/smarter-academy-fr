import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import NumberLine from '../../../../../common/components/NumberLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import PlaceValueTable from '../components/PlaceValueTable';
import { formatFr, texFr, decompose } from '../components/numberUtils';

/**
 * Module 11 V2 — même Grand Défi que Module11BossFinal.jsx, reconstruit sur
 * le lesson kit : ce fichier ne contient plus que les DONNÉES (épreuves,
 * compétences, badges) et la synthèse visuelle propre à la leçon. Le moteur
 * (QCM silencieux, submit unique, correction, profil, persistance,
 * evidence, timer, XP) vit dans common/kit/BossFinal.jsx.
 */

const REGISTRE = [
  { id: 'ville', emoji: '🏙️', label: 'Habitants de la ville', value: formatFr(105300) },
  { id: 'visiteurs', emoji: '🎟️', label: 'Visiteurs du musée', value: formatFr(105030) },
  { id: 'score', emoji: '🎮', label: 'Meilleur score du tournoi', value: formatFr(48275) },
  { id: 'distance', emoji: '🚴', label: 'Distance du raid (km)', value: formatFr(2450) },
  { id: 'livres', emoji: '📚', label: 'Livres de la médiathèque', value: formatFr(12450) },
  { id: 'prix', emoji: '💶', label: 'Budget du matériel (€)', value: formatFr(8099) },
  { id: 'cahiers', emoji: '📒', label: 'Cahiers en stock', value: formatFr(6307) },
];

const SKILLS = {
  lecture: { label: 'Lecture et écriture', module: 3 },
  position: { label: 'Valeur de position', module: 4 },
  decomposition: { label: 'Décomposition', module: 5 },
  comparaison: { label: 'Comparaison', module: 6 },
  rangement: { label: 'Rangement et encadrement', module: 7 },
  droite: { label: 'Droite graduée', module: 8 },
  problemes: { label: 'Problèmes', module: 10 },
};

const EPREUVES = [
  {
    id: 'nombres-entiers-boss-e1',
    skill: 'lecture',
    prompt: (
      <>
        Une fiche du registre porte la mention manuscrite{' '}
        <em>« quarante-huit mille deux cent soixante-quinze »</em>. De quelle fiche s'agit-il ?
      </>
    ),
    options: ['105 300', '48 275', '12 450', '8 099'],
    correct: 1,
    explain:
      "« quarante-huit mille » → 48 dans la classe des mille ; « deux cent soixante-quinze » → 275 dans la classe des unités. Donc 48 275.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P2'] },
  },
  {
    id: 'nombres-entiers-boss-e2',
    skill: 'position',
    prompt: (
      <>
        Dans le nombre d'habitants <strong className="font-mono">105 300</strong>, que représente le chiffre{' '}
        <strong className="font-mono">5</strong> ?
      </>
    ),
    options: ['5', '500', '5 000', '50 000'],
    correct: 2,
    explain:
      '105 300 se lit 105 | 300. Le 5 occupe la colonne des milliers : il représente 5 milliers, soit 5 000.',
    extra: <PlaceValueTable value={105300} compact />,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P3'] },
  },
  {
    id: 'nombres-entiers-boss-e3',
    skill: 'decomposition',
    prompt: (
      <>
        Quelle est la décomposition correcte du stock de cahiers,{' '}
        <strong className="font-mono">6 307</strong> ?
      </>
    ),
    options: ['6 000 + 300 + 7', '6 000 + 30 + 7', '600 + 30 + 7', '6 000 + 300 + 70'],
    correct: 0,
    explain:
      '6 307 = 6 milliers + 3 centaines + 0 dizaine + 7 unités, soit 6 000 + 300 + 7. La dizaine vide ne s\'écrit pas dans la somme, mais le 0 reste indispensable dans le nombre.',
    // Recomposer 6 307 à partir de ses valeurs de position certifie aussi P1
    // (la manipulation base 10 du module 1, sous forme écrite).
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P4', '6e_nombres-entiers_P1'] },
  },
  {
    id: 'nombres-entiers-boss-e4',
    skill: 'comparaison',
    prompt: (
      <>
        Deux fiches se ressemblent : <strong className="font-mono">105 300</strong> habitants et{' '}
        <strong className="font-mono">105 030</strong> visiteurs. Quelle comparaison est correcte ?
      </>
    ),
    options: ['105 300 < 105 030', '105 300 = 105 030', '105 300 > 105 030'],
    correct: 2,
    cols: 3,
    explain:
      'Les deux nombres ont 6 chiffres et commencent pareil : 1, 0, 5. La première différence est à la position des centaines : 3 contre 0. Donc 105 300 > 105 030.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P5'] },
  },
  {
    id: 'nombres-entiers-boss-e5',
    skill: 'rangement',
    prompt: <>Range quatre fiches du registre dans l'ordre croissant : 8 099 ; 2 450 ; 12 450 ; 6 307.</>,
    cols: 1,
    options: [
      '2 450 < 6 307 < 8 099 < 12 450',
      '12 450 < 8 099 < 6 307 < 2 450',
      '2 450 < 8 099 < 6 307 < 12 450',
      '6 307 < 2 450 < 12 450 < 8 099',
    ],
    correct: 0,
    explain:
      "2 450 < 6 307 < 8 099 < 12 450. Seul 12 450 a 5 chiffres : il est forcément le plus grand. Les trois autres se départagent par le chiffre des milliers.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P5'] },
  },
  {
    id: 'nombres-entiers-boss-e6',
    skill: 'droite',
    prompt: (
      <>
        Sur une demi-droite graduée de 6 000 à 7 000 avec un pas de 100, sur quelle graduation se place
        pratiquement le stock de cahiers, <strong className="font-mono">6 307</strong> ?
      </>
    ),
    options: ['6 000', '6 300', '6 700', '7 000'],
    correct: 1,
    extra: <PlaceValueTable value={6307} compact />,
    explain:
      "Avec un pas de 100, 6 307 se place pratiquement sur la graduation 6 300 (il n'en est qu'à 7 unités). On lit d'abord le pas, puis on compte les graduations.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P6'] },
  },
  {
    id: 'nombres-entiers-boss-e7',
    skill: 'problemes',
    prompt: (
      <>
        Le maire déclare : <em>« Notre ville a dépassé les 100 000 habitants, et le musée a accueilli plus de
        visiteurs que nous n'avons d'habitants. »</em> Que dit le registre ?
      </>
    ),
    options: [
      'Les deux affirmations sont vraies',
      'La première est vraie, la seconde est fausse',
      'La première est fausse, la seconde est vraie',
      'Les deux affirmations sont fausses',
    ],
    correct: 1,
    explain:
      '105 300 > 100 000 : la ville a bien dépassé les 100 000 habitants. En revanche 105 030 < 105 300 : le musée a accueilli MOINS de visiteurs que la ville ne compte d\'habitants. La seconde affirmation est donc fausse.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_nombres-entiers_P7'] },
  },
];

const BADGES = [
  { id: 'decodeur', emoji: '🏅', label: 'Décodeur des nombres', test: (s) => (s.lecture ?? 0) === 0 },
  { id: 'position', emoji: '🏅', label: 'Maître de la valeur de position', test: (s) => (s.position ?? 0) === 0 },
  { id: 'architecte', emoji: '🏅', label: 'Architecte des nombres', test: (s) => (s.decomposition ?? 0) === 0 },
  {
    id: 'detective',
    emoji: '🏅',
    label: 'Détective des comparaisons',
    test: (s) => (s.comparaison ?? 0) === 0 && (s.rangement ?? 0) === 0,
  },
  { id: 'explorateur', emoji: '🏅', label: 'Explorateur de la droite graduée', test: (s) => (s.droite ?? 0) === 0 },
];

/* ── Synthèse visuelle (propre à la leçon) ─────────────────────────── */
const CAPACITES = [
  { verbe: 'LIRE', ex: '4 582 → « quatre mille cinq cent quatre-vingt-deux »', tone: 'bg-blue-50 border-blue-200 text-blue-800' },
  { verbe: 'ÉCRIRE', ex: '« trois mille quatre cent sept » → 3 407', tone: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  { verbe: 'DÉCOMPOSER', ex: '4 582 = 4 000 + 500 + 80 + 2', tone: 'bg-sky-50 border-sky-200 text-sky-800' },
  { verbe: 'RECOMPOSER', ex: '6 000 + 20 + 5 = 6 025', tone: 'bg-cyan-50 border-cyan-200 text-cyan-800' },
  { verbe: 'COMPARER', ex: '4 582 > 4 527', tone: 'bg-amber-50 border-amber-200 text-amber-800' },
  { verbe: 'RANGER', ex: '3 999 < 4 250 < 4 502', tone: 'bg-rose-50 border-rose-200 text-rose-800' },
  { verbe: 'REPÉRER', ex: '4 582 entre 4 500 et 4 600', tone: 'bg-violet-50 border-violet-200 text-violet-800' },
];

function Synthese() {
  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Le concept central</div>
        <div className="text-2xl sm:text-3xl font-space font-extrabold">UN NOMBRE ENTIER</div>
        <div className="text-slate-500 text-xl" aria-hidden="true">↓</div>
        <p className="text-sm text-slate-300">
          ce n'est pas une suite de chiffres : c'est une <strong className="text-white">quantité</strong> écrite
          grâce à des <strong className="text-white">positions</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CAPACITES.map((c) => (
          <div key={c.verbe} className={`rounded-xl border-2 px-4 py-3 ${c.tone}`}>
            <div className="font-mono font-extrabold text-xs tracking-wider">{c.verbe}</div>
            <div className="text-xs sm:text-sm font-mono mt-0.5 tabular-nums">{c.ex}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="font-space font-bold text-slate-800 text-sm">Le tableau de numération — 4 582</h3>
        <PlaceValueTable value={4582} showValues />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {[
            ['4 milliers', '4 000'],
            ['5 centaines', '500'],
            ['8 dizaines', '80'],
            ['2 unités', '2'],
          ].map(([a, b]) => (
            <div key={a} className="bg-slate-50 rounded-xl px-2 py-2 border border-slate-200">
              <div className="text-[11px] font-mono text-slate-500">{a}</div>
              <div className="font-mono font-bold text-slate-800">{b}</div>
            </div>
          ))}
        </div>
        <div className="text-center font-mono font-bold text-slate-800 bg-slate-100 rounded-xl py-2.5">
          <MathText>{`$${texFr(4582)} = ${decompose(4582).map(texFr).join(' + ')}$`}</MathText>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="font-space font-bold text-amber-900 text-sm">⚖️ Comparer</div>
          <ol className="text-xs text-amber-900 space-y-1 list-decimal list-inside">
            <li>Compte les chiffres : le plus long gagne.</li>
            <li>À égalité, compare position par position en partant de la gauche.</li>
            <li>Arrête-toi à la première différence.</li>
          </ol>
        </div>
        <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 space-y-2">
          <div className="font-space font-bold text-violet-900 text-sm">📏 Repérer</div>
          <p className="text-xs text-violet-900">
            Sur la demi-droite graduée, on lit d'abord <strong>le pas</strong>, puis on compte les graduations.
            <strong> Plus on va vers la droite, plus le nombre est grand.</strong>
          </p>
          <NumberLine min={0} max={5} step={1} labelEvery={1} height={110} ariaLabel="Demi-droite graduée de 0 à 5" />
        </div>
      </div>

      <Feedback tone="info">
        Et le zéro ? Il ne se dit pas, mais il <strong>tient une place</strong> : sans lui, 4 005 deviendrait 45.
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
      moduleTitle="🏆 Le Grand Défi des Nombres"
      moduleSubtitle="Sept épreuves, un profil de maîtrise et une synthèse."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: "Le registre de fin d'année du collège vient d'être retrouvé.",
        tone: 'amber',
        body: (
          <p>
            Sept fiches, sept épreuves. À toi de décider, à chaque fois, ce qu'il faut faire : lire,
            décomposer, comparer, ranger, repérer ou interpréter. Personne ne te dira quelle compétence
            utiliser. Réponds à toutes les épreuves, puis valide pour découvrir ta correction.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître des nombres entiers !',
        title: 'Leçon terminée !',
        message:
          "Un grand nombre n'est plus une suite de chiffres pour toi. Tu sais ce que représente chaque chiffre, tu peux construire un nombre, le décomposer, le comparer, le ranger, le placer — et t'en servir pour comprendre le monde.",
        verbs: ['Lire', 'Décomposer', 'Comparer', 'Repérer'],
        masterBadgeLabel: 'Badge « Maître des nombres entiers » débloqué',
      }}
      xpPerCorrect={20}
    />
  );
}
