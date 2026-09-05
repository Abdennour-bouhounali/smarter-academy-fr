import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import DurationLine from '../components/DurationLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { hopsBetween } from '../components/durationUtils';

/**
 * Module 7 — Boss Final sur le moteur du kit partagé (QCM uniquement).
 *
 * Voir docs/architecture/LESSON_INTEGRATION_GUIDE.md §7 : fichier de
 * DONNÉES — épreuves, compétences, badges, synthèse. Le moteur `BossFinal`
 * applique la forme obligatoire et branche l'evidence + la persistance.
 *
 * Histoire unique : la journée de voyage scolaire Paris → Marseille
 * (réveil, train, correspondance, visite, retour). Les métadonnées
 * `assessment` couvrent les 7 LPs.
 */
const TRAJET_HOPS = hopsBetween({ h: 9, min: 47 }, { h: 12, min: 15 });

const REGISTRE = [
  { id: 'train', emoji: '🚄', label: 'Train', value: '9 h 47 → 12 h 15' },
  { id: 'visite', emoji: '🏛️', label: 'Visite', value: '150 min' },
  { id: 'retour', emoji: '🌆', label: 'Retour', value: 'arrivée 19 h' },
  { id: 'chrono', emoji: '⏱️', label: 'Règle d’or', value: 'tout en base 60' },
];

const SKILLS = {
  unites: { label: 'Unités de durée', module: 1 },
  lecture: { label: 'Lire les horaires', module: 2 },
  relations: { label: 'Relations h / min / s', module: 3 },
  convertir: { label: 'Convertir et comparer', module: 4 },
  sauts: { label: 'Durée entre deux instants', module: 5 },
  problemes: { label: 'Problèmes d’horaires', module: 6 },
};

const EPREUVES = [
  {
    id: 'du-e1',
    skill: 'unites',
    title: 'Épreuve 1',
    prompt: 'Sur le carnet de voyage, quelle unité choisir pour noter la durée du trajet complet Paris → Marseille ? Et celle de l’attente sur le quai ?',
    options: [
      'Trajet en heures, attente en minutes',
      'Trajet en secondes, attente en jours',
      'Tout en secondes, c’est plus précis',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un long trajet se compte naturellement en heures, une attente courte en minutes. « Tout en secondes » serait exact mais illisible (un trajet de 8 880 s ?).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_durees_P1'] },
  },
  {
    id: 'du-e2',
    skill: 'lecture',
    title: 'Épreuve 2',
    prompt: 'L’horloge de la gare : petite aiguille entre 8 et 9, grande aiguille juste avant le 11 (à 52 minutes). Quelle heure est-il ?',
    options: ['8 h 52', '9 h 52', '10 h 40'],
    cols: 3,
    correct: 0,
    explain: 'La petite aiguille n’a pas encore atteint le 9 : il est encore 8 h — 8 h 52. La grande donne les minutes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_durees_P2'] },
  },
  {
    id: 'du-e3',
    skill: 'lecture',
    title: 'Épreuve 3',
    prompt: 'Le billet du retour indique « départ 17 h 05 ». C’est-à-dire…',
    options: ['5 h 05 du matin', '5 h 05 de l’après-midi', '7 h 05 du soir'],
    cols: 3,
    correct: 1,
    explain: 'En notation 24 h, on retire 12 pour l’après-midi : 17 h 05 = 5 h 05 de l’après-midi.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_durees_P2'] },
  },
  {
    id: 'du-e4',
    skill: 'relations',
    title: 'Épreuve 4',
    prompt: 'Le contrôleur annonce « environ 2 heures de trajet ». Combien de minutes ?',
    options: ['100 min', '120 min', '200 min'],
    cols: 3,
    correct: 1,
    explain: '1 h = 60 min, donc 2 h = 120 min. (100 et 200, ce serait compter par 50 ou par 100 — le temps marche par 60.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_durees_P3'] },
  },
  {
    id: 'du-e5',
    skill: 'convertir',
    title: 'Épreuve 5',
    prompt: 'La visite du musée dure 150 min. En heures et minutes ?',
    options: ['1 h 50 min', '2 h 30 min', '1 h 30 min'],
    cols: 3,
    correct: 1,
    explain: '150 = 120 + 30 : 2 h 30 min. (1 h 50, c’est le piège du « on recopie les chiffres ».)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_durees_P4'] },
  },
  {
    id: 'du-e6',
    skill: 'convertir',
    title: 'Épreuve 6',
    prompt: 'Pour rentrer : TGV direct 3 h 05 min, ou avion 1 h 10 min + 2 h d’attente à l’aéroport. Le plus rapide ?',
    options: ['Le TGV', 'L’avion', 'Égalité parfaite'],
    cols: 3,
    correct: 0,
    explain: 'TGV : 3 h 05 = 185 min. Avion : 70 + 120 = 190 min. Le TGV gagne de 5 minutes — l’attente compte dans la durée totale !',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_durees_P5'] },
  },
  {
    id: 'du-e7',
    skill: 'relations',
    title: 'Épreuve 7',
    prompt: 'L’appli du bus affiche « 1,5 h de trajet ». Qu’est-ce que cela signifie ?',
    options: ['1 h 50 min', '1 h 30 min', '1 h 05 min'],
    cols: 3,
    correct: 1,
    explain: '0,5 h = la moitié de 60 min = 30 min. Donc 1,5 h = 1 h 30 min — jamais 1 h 50.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_durees_P3', '6e_durees_P4'] },
  },
  {
    id: 'du-e8',
    skill: 'sauts',
    title: 'Épreuve 8',
    prompt: 'Le train part à 9 h 47 et arrive à 12 h 15. Durée du trajet, par la méthode des sauts ?',
    options: ['2 h 28 min', '2 h 68 min', '3 h 28 min'],
    cols: 3,
    correct: 0,
    explain: '+ 13 min (→ 10 h) + 2 h (→ 12 h) + 15 min (→ 12 h 15) : 2 h 28 min. (« 2 h 68 min » : la soustraction posée a encore frappé.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_durees_P6'] },
  },
  {
    id: 'du-e9',
    skill: 'sauts',
    title: 'Épreuve 9',
    prompt: 'Le retour dure 3 h 20 min et il faut arriver à 19 h 00 pile. Heure de départ au plus tard ?',
    options: ['15 h 40', '16 h 20', '15 h 20'],
    cols: 3,
    correct: 0,
    explain: 'En arrière depuis 19 h : − 3 h → 16 h, puis − 20 min → 15 h 40. Les sauts marchent en marche arrière.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_durees_P6', '6e_durees_P7'] },
  },
  {
    id: 'du-e10',
    skill: 'problemes',
    title: 'Épreuve 10',
    prompt: 'Bilan de la journée : 2 h 28 min de train + 2 h 30 min de visite + 3 h 20 min de retour. Durée totale des activités ?',
    options: ['7 h 78 min', '8 h 18 min', '8 h 28 min'],
    cols: 3,
    correct: 1,
    explain: '2 h 28 + 2 h 30 + 3 h 20 = 7 h 78 min… et 78 min = 1 h 18 min : total 8 h 18 min. La retenue se fait à 60, pas à 100 !',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_durees_P7', '6e_durees_P1'] },
  },
];

const BADGES = [
  { id: 'lecteur', emoji: '🏅', label: 'Chef de gare', test: (s) => (s.lecture ?? 0) === 0 },
  { id: 'unites', emoji: '🏅', label: 'Gardien des unités', test: (s) => (s.unites ?? 0) === 0 && (s.relations ?? 0) === 0 },
  { id: 'convertisseur', emoji: '🏅', label: 'Virtuose du 60', test: (s) => (s.convertir ?? 0) === 0 },
  { id: 'sauteur', emoji: '🏅', label: 'Maître des sauts', test: (s) => (s.sauts ?? 0) === 0 },
  { id: 'organisateur', emoji: '🏅', label: 'Organisateur hors pair', test: (s) => (s.problemes ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Maître du temps', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: '1,5 h = 1 h 50 min', right: '1,5 h = 1 h 30 min — la moitié de 60, pas 50' },
  { wrong: 'Poser 12 h 15 − 9 h 47 en colonnes', right: 'Sauter : + 13 min, + 2 h, + 15 min = 2 h 28 min' },
  { wrong: '2 h 15 min = 215 min', right: '2 × 60 + 15 = 135 min — on convertit avant d’assembler' },
  { wrong: 'Retenue à 100 (7 h 78 min)', right: '78 min = 1 h 18 min — la retenue se fait à 60' },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">⏱️</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Le temps est la seule grandeur de la famille qui compte en base 60. Une durée est un SAUT entre deux
          instants — jamais une soustraction posée.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-slate-700 text-center">Le trajet du matin, saut par saut</p>
        <DurationLine
          start={{ h: 9, min: 47 }}
          end={{ h: 12, min: 15 }}
          hops={TRAJET_HOPS}
          visibleCount={TRAJET_HOPS.length}
        />
        <p className="text-center font-mono text-sm text-slate-600">
          13 min + 2 h + 15 min = <strong>2 h 28 min</strong>
        </p>
      </div>

      <div className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-2xl p-5 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide text-sky-100 font-mono font-bold">À retenir</p>
        <p className="font-mono font-extrabold text-base sm:text-lg">1 j = 24 h · 1 h = 60 min · 1 min = 60 s</p>
        <p className="text-sky-100 text-sm">Vers le petit : × 60 · Vers le grand : ÷ 60</p>
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
        Avant tout calcul de durée : tout mettre dans la même unité, et se rappeler que la retenue se fait à 60.
        L'horloge n'est pas une calculatrice décimale.
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
      moduleTitle="🏆 Mission finale : le grand voyage"
      moduleSubtitle="Dix épreuves pour boucler la journée Paris–Marseille."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'La classe part en voyage : une journée entière à orchestrer.',
        tone: 'amber',
        body: (
          <p>
            Du réveil au retour : lire les horaires, convertir, comparer les itinéraires et calculer chaque durée.
            Réponds à toutes les épreuves, puis valide pour découvrir ta correction et tes badges de maîtrise.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître du temps !',
        title: 'Mission accomplie !',
        message: (
          <>
            Du quai de la gare au retour du soir, tu as lu les horaires, compté en base 60, sauté d'heure ronde en
            heure ronde et orchestré toute une journée.
          </>
        ),
        verbs: ['Lire', 'Convertir', 'Comparer', 'Calculer'],
        masterBadgeLabel: 'Badge « Maître du temps » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
