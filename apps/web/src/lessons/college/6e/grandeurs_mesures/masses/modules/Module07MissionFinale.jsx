import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import UnitLadder from '../components/UnitLadder';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — Boss Final sur le moteur du kit partagé (QCM uniquement).
 *
 * Voir docs/architecture/LESSON_INTEGRATION_GUIDE.md §7 : ce fichier est un
 * fichier de DONNÉES — épreuves, compétences, badges, synthèse — zéro
 * logique recopiée. Le moteur `BossFinal` applique par construction la
 * forme obligatoire (silencieux jusqu'au submit global, correction, profil
 * de maîtrise, synthèse) et branche l'evidence (useEvidenceSubmission) +
 * la persistance de la tentative (useFinalTestAttempt).
 *
 * Même histoire que la version précédente : le ravitaillement du goûter de
 * l'école pour 24 élèves. Les métadonnées `assessment` reprennent la
 * correspondance déjà déclarée — mais jamais branchée — dans l'ancienne
 * version pré-kit (EVAL_INFO_SORTER, EVAL_BUILD_ORDER, EVAL_TOTAL_MASS_G,
 * EVAL_TOTAL_MASS_KG, ESTIM_Q.assessment), complétée pour couvrir les 6 LPs.
 */
const SACHET_G = 150;
const BRIQUE_G = 200;
const BOITE_BISCUITS = 6 * SACHET_G; // 900 g
const BOITE_JUS = 4 * BRIQUE_G; // 800 g
const TOTAL_G = 4 * BOITE_BISCUITS + 6 * BOITE_JUS; // 8400 g

const REGISTRE = [
  { id: 'eleves', emoji: '🎒', label: 'Élèves', value: '24' },
  { id: 'sachet', emoji: '🍪', label: 'Sachet', value: '150 g' },
  { id: 'brique', emoji: '🧃', label: 'Brique', value: '200 g' },
  { id: 'total', emoji: '📦', label: 'Commande', value: '4 + 6 boîtes' },
];

const SKILLS = {
  comparer: { label: 'Comparer des masses', module: 1 },
  unite: { label: 'Choisir une unité', module: 2 },
  lire: { label: 'Lire une balance', module: 3 },
  relations: { label: 'Relations entre unités', module: 4 },
  convertir: { label: 'Convertir', module: 5 },
  estimer: { label: 'Estimer et résoudre', module: 6 },
};

const EPREUVES = [
  {
    id: 'ms-e1',
    skill: 'estimer',
    title: 'Épreuve 1',
    prompt: 'Pour préparer la commande, quelles informations te sont vraiment utiles ?',
    options: [
      'Le nombre d’élèves et la masse d’un sachet',
      'L’heure de départ du bus et le prix d’un sachet',
      'La distance jusqu’au site et la masse du sac du professeur',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Pour calculer une masse totale, seules comptent les données de masse et de quantité : 24 élèves, 150 g par sachet. L’heure, le prix et la distance ne servent à rien ici.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P6'] },
  },
  {
    id: 'ms-e2',
    skill: 'unite',
    title: 'Épreuve 2',
    prompt: 'Sur le bon de commande, on doit indiquer la masse d’un sachet de biscuits. Quelle unité choisir ?',
    options: ['mg', 'g', 't'],
    cols: 3,
    correct: 1,
    explain: 'Un sachet de biscuits se pèse en grammes : le mg conviendrait à un comprimé, la tonne à un camion.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P2'] },
  },
  {
    id: 'ms-e3',
    skill: 'lire',
    title: 'Épreuve 3',
    prompt: 'Sur la balance de la cantine, la barre s’arrête juste sur la graduation 900 g. Que pèse la boîte de biscuits ?',
    options: ['90 g', '900 g', '9 kg'],
    cols: 3,
    correct: 1,
    explain: 'On lit la graduation atteinte par le remplissage : 900 g. Une boîte de 6 sachets de 150 g pèse bien 6 × 150 = 900 g.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P3'] },
  },
  {
    id: 'ms-e4',
    skill: 'relations',
    title: 'Épreuve 4',
    prompt: 'Une boîte de jus contient 4 briques de 200 g. Quelle est la masse de la boîte ?',
    options: [`${BOITE_JUS} g`, '600 g', '1 000 g'],
    cols: 3,
    correct: 0,
    explain: `4 × 200 g = ${BOITE_JUS} g. C’est un peu moins qu’un kilogramme.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P4'] },
  },
  {
    id: 'ms-e5',
    skill: 'relations',
    title: 'Épreuve 5',
    prompt: 'La commande complète : 4 boîtes de biscuits (900 g) et 6 boîtes de jus (800 g). Quelle masse totale ?',
    options: [`${TOTAL_G} g`, '1 700 g', '5 400 g'],
    cols: 3,
    correct: 0,
    explain: `4 × 900 g = 3 600 g et 6 × 800 g = 4 800 g. Total : 3 600 + 4 800 = ${TOTAL_G} g.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P3', '6e_masses_P4'] },
  },
  {
    id: 'ms-e6',
    skill: 'convertir',
    title: 'Épreuve 6',
    prompt: `Pour l’annoncer simplement, convertis ${TOTAL_G} g en kilogrammes.`,
    options: ['0,84 kg', '8,4 kg', '84 kg'],
    cols: 3,
    correct: 1,
    explain: `1 kg = 1 000 g, donc ${TOTAL_G} g = ${TOTAL_G} ÷ 1 000 = 8,4 kg.`,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P5', '6e_masses_P2'] },
  },
  {
    id: 'ms-e7',
    skill: 'convertir',
    title: 'Épreuve 7',
    prompt: 'Un élève écrit que la commande pèse « 8 400 kg ». Que penses-tu de son écriture ?',
    options: [
      'C’est juste, 8 400 g et 8 400 kg c’est pareil',
      'Non : il a gardé le nombre des grammes en écrivant kg — 8 400 kg, ce serait plus de 8 tonnes',
    ],
    cols: 1,
    correct: 1,
    explain:
      'Changer d’unité change le nombre. 8 400 g = 8,4 kg. Écrire 8 400 kg reviendrait à annoncer 8,4 tonnes de goûter !',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P5'] },
  },
  {
    id: 'ms-e8',
    skill: 'estimer',
    title: 'Épreuve 8',
    prompt: '8,4 kg de goûter pour 24 élèves : est-ce cohérent ?',
    options: [
      'Oui : cela fait environ 350 g par élève, un goûter raisonnable',
      'Non : c’est beaucoup trop lourd pour un simple goûter',
    ],
    cols: 1,
    correct: 0,
    explain:
      '8,4 kg ÷ 24 élèves ≈ 350 g par élève — un sachet de biscuits et une brique de jus par personne, tout à fait cohérent.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P6', '6e_masses_P1'] },
  },
  {
    id: 'ms-e9',
    skill: 'comparer',
    title: 'Épreuve 9',
    prompt: 'Sur la balance à deux plateaux, une boîte de biscuits (900 g) fait descendre son plateau face à une boîte de jus (800 g). Pourquoi ?',
    options: [
      'Parce que le plateau qui descend porte la masse la plus lourde',
      'Parce que le plateau qui descend porte la masse la plus légère',
      'Parce que les deux boîtes ont la même masse',
    ],
    cols: 1,
    correct: 0,
    explain: 'La balance penche toujours du côté le plus lourd : 900 g > 800 g, donc le plateau des biscuits descend.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P1'] },
  },
  {
    id: 'ms-e10',
    skill: 'estimer',
    title: 'Épreuve 10',
    prompt: 'Le professeur ajoute son sac de 3 kg au chargement. Quelle est la masse totale à transporter ?',
    options: ['8,7 kg', '11,4 kg', '38,4 kg'],
    cols: 3,
    correct: 1,
    explain: '8,4 kg + 3 kg = 11,4 kg. Les deux masses étaient déjà dans la même unité : on peut additionner directement.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_masses_P6', '6e_masses_P5'] },
  },
];

const BADGES = [
  { id: 'comparateur', emoji: '🏅', label: 'Comparateur sûr', test: (s) => (s.comparer ?? 0) === 0 },
  { id: 'unites', emoji: '🏅', label: 'Expert des unités', test: (s) => (s.unite ?? 0) === 0 },
  { id: 'lecteur', emoji: '🏅', label: 'Lecteur de balance', test: (s) => (s.lire ?? 0) === 0 },
  { id: 'convertisseur', emoji: '🏅', label: 'Virtuose des conversions', test: (s) => (s.relations ?? 0) === 0 && (s.convertir ?? 0) === 0 },
  { id: 'estimateur', emoji: '🏅', label: 'Estimateur malin', test: (s) => (s.estimer ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Chef du ravitaillement', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: '8 400 g = 8 400 kg', right: '8 400 g = 8,4 kg — changer d’unité change le nombre' },
  { wrong: '1 kg = 100 g', right: '1 kg = 1 000 g — chaque marche vaut 1 000' },
  { wrong: '3,2 kg − 400 g = 2,8 kg', right: 'Convertis d’abord : 3 200 g − 400 g = 2 800 g' },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">⚖️</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Une masse ne change pas quand on change d’unité — seul le nombre qui la décrit change. Comparer, lire,
          convertir et estimer sont quatre façons de regarder la même grandeur.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-slate-700 text-center">L’échelle des masses</p>
        <UnitLadder />
      </div>

      <div className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-2xl p-5 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide text-violet-100 font-mono font-bold">À retenir</p>
        <p className="font-mono font-extrabold text-lg">1 t = 1 000 kg = 1 000 000 g</p>
        <p className="text-violet-100 text-sm">Trois marches, toutes de 1 000.</p>
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
        Avant d’additionner ou de soustraire deux masses, vérifie toujours qu’elles sont écrites dans la même unité :
        c’est l’erreur la plus fréquente, et la plus facile à éviter.
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
      moduleTitle="🏆 Mission finale : le ravitaillement"
      moduleSubtitle="Dix épreuves pour préparer le goûter de toute l’école."
      estimatedTime="16 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'L’école part en sortie : 24 élèves, un goûter à préparer.',
        tone: 'amber',
        body: (
          <p>
            Du tri des informations jusqu’à la vérification finale : comparer, lire une balance, choisir une unité,
            convertir et estimer. Réponds à toutes les épreuves, puis valide pour découvrir ta correction et tes
            badges de maîtrise.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Chef du ravitaillement !',
        title: 'Mission accomplie !',
        message: (
          <>
            Du tri des informations à la vérification finale, tu as comparé, mesuré, choisi une unité, construit les
            relations entre unités, converti et estimé — sur une seule et même situation.
          </>
        ),
        verbs: ['Comparer', 'Mesurer', 'Convertir', 'Estimer'],
        masterBadgeLabel: 'Badge « Chef du ravitaillement » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
