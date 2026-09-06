import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import AngleFigure from '../components/AngleFigure';
import Protractor from '../components/Protractor';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 7 — Boss Final sur le moteur du kit partagé (QCM uniquement).
 *
 * Voir docs/architecture/LESSON_INTEGRATION_GUIDE.md §7 : fichier de
 * DONNÉES. Le moteur `BossFinal` applique la forme obligatoire et branche
 * l'evidence + la persistance de tentative.
 *
 * Histoire unique : passer son brevet de pilote (caps, virages,
 * instruments de bord, approche finale). Les métadonnées `assessment`
 * couvrent les 7 LPs.
 */
const REGISTRE = [
  { id: 'pilotage', emoji: '✈️', label: 'Pilotage', value: 'brevet' },
  { id: 'cap', emoji: '🧭', label: 'Cap', value: 'virages' },
  { id: 'piste', emoji: '🛬', label: 'Piste', value: 'approche 30°' },
  { id: 'instruments', emoji: '📐', label: 'Instruments', value: 'rapporteur' },
];

const SKILLS = {
  ouverture: { label: 'L’angle comme ouverture', module: 1 },
  comparer: { label: 'Comparer et classer', module: 2 },
  mesurer: { label: 'Mesurer au rapporteur', module: 3 },
  graduation: { label: 'La bonne graduation', module: 4 },
  construire: { label: 'Construire un angle', module: 5 },
  problemes: { label: 'Problèmes d’angles', module: 6 },
};

const EPREUVES = [
  {
    id: 'an-e1',
    requires: ['angle-ouverture', 'longueur-cotes-sans-effet'],
    skill: 'ouverture',
    title: 'Épreuve 1',
    prompt: 'Sur le plan de vol, qu’est-ce qui détermine la « grandeur » d’un angle de virage ?',
    options: [
      'L’écartement entre les deux trajectoires',
      'La longueur des trajectoires dessinées',
      'La couleur du tracé sur la carte',
    ],
    cols: 1,
    correct: 0,
    explain: 'Un angle mesure une OUVERTURE : l’écartement entre les deux demi-droites, jamais leur longueur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_angles_P1'] },
  },
  {
    id: 'an-e2',
    requires: ['angle-ouverture', 'orientation-sans-effet'],
    skill: 'comparer',
    title: 'Épreuve 2',
    prompt: 'Deux plans de virage sont dessinés dans des orientations différentes. Comment les comparer sûrement ?',
    options: [
      'En les superposant sommet sur sommet, un côté commun',
      'En comparant la longueur de leurs tracés',
      'En regardant lequel penche le plus vers la droite',
    ],
    cols: 1,
    correct: 0,
    explain: 'La superposition (sommet sur sommet) neutralise l’orientation : seul l’écartement reste visible.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_angles_P2'] },
  },
  {
    id: 'an-e3',
    requires: ['angle-droit', 'classes-angles'],
    skill: 'comparer',
    title: 'Épreuve 3',
    prompt: 'Le cap affiché forme un angle nettement plus ouvert que l’équerre du navigateur. C’est un angle…',
    extra: <AngleFigure deg={125} rotation={10} rayLengths={[85, 85]} arcLabel="?" tone="sky" size={190} />,
    options: ['aigu', 'droit', 'obtus'],
    cols: 3,
    correct: 2,
    explain: 'Plus ouvert que l’angle droit (90°) : c’est un angle obtus.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_angles_P3'] },
  },
  {
    id: 'an-e4',
    requires: ['angle-ouverture', 'longueur-cotes-sans-effet'],
    skill: 'ouverture',
    title: 'Épreuve 4',
    prompt: 'Deux trajectoires ont la même ouverture, mais l’une est tracée avec des traits deux fois plus longs. Que peut-on dire de leurs angles ?',
    options: [
      'Le tracé long correspond à un angle plus grand',
      'Ils sont égaux : la longueur des côtés ne change pas la mesure',
      'Impossible de comparer sans rapporteur',
    ],
    cols: 1,
    correct: 1,
    explain: 'Prolonger les côtés n’ouvre pas l’angle : les deux mesures sont identiques. C’est le piège n° 1 des angles.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_angles_P1', '6e_angles_P2'] },
  },
  {
    id: 'an-e5',
    requires: ['rapporteur', 'rituel-placement', 'deux-graduations'],
    skill: 'mesurer',
    title: 'Épreuve 5',
    prompt: 'Le rapporteur est correctement posé sur l’angle de montée et le second côté sort sur la graduation 30 (échelle partant du zéro posé sur le côté). Quelle est la mesure ?',
    options: ['30°', '150°', '60°'],
    cols: 3,
    correct: 0,
    explain: 'On lit la graduation de l’échelle qui part du zéro posé sur le côté : 30°. (150° serait l’autre échelle.)',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_angles_P4'] },
  },
  {
    id: 'an-e6',
    requires: ['rapporteur', 'rituel-placement'],
    skill: 'mesurer',
    title: 'Épreuve 6',
    prompt: 'Le copilote a posé le rapporteur mais sa lecture est fausse. Quelle erreur a-t-il commise ?',
    extra: <Protractor angleDeg={60} mode="read" misplaced disabled ariaLabel="Rapporteur mal placé sur un angle" />,
    options: [
      'Le centre du rapporteur n’est pas sur le sommet de l’angle',
      'Il a utilisé un rapporteur trop petit',
      'Il a lu la mesure en centimètres',
    ],
    cols: 1,
    correct: 0,
    explain: 'Premier geste du rituel : le CENTRE de l’outil sur le SOMMET. Décalé, toutes les graduations sont fausses.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_angles_P4', '6e_angles_P5'] },
  },
  {
    id: 'an-e7',
    requires: ['classes-angles', 'deux-graduations', 'reflexe-classer'],
    skill: 'graduation',
    title: 'Épreuve 7',
    prompt: 'L’instrument affiche « 40 » et « 140 » sur la même graduation. L’angle de descente est visiblement AIGU. Quelle est sa mesure ?',
    options: ['40°', '140°', 'Les deux sont acceptables'],
    cols: 3,
    correct: 0,
    explain: 'Aigu → inférieur à 90° : seule 40° convient. Classer d’abord élimine la mauvaise graduation à tous les coups.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_angles_P5'] },
  },
  {
    id: 'an-e8',
    requires: ['rapporteur', 'construire-angle', 'reflexe-classer'],
    skill: 'construire',
    title: 'Épreuve 8',
    prompt: 'Pour tracer un virage de 115° à partir d’une demi-droite, quelle graduation faut-il marquer ?',
    options: [
      '115, sur l’échelle qui part du zéro posé sur la demi-droite',
      '65, car 180 − 115 = 65',
      'N’importe laquelle des deux : le tracé sera le même',
    ],
    cols: 1,
    correct: 0,
    explain: 'On marque 115 sur l’échelle partant du zéro aligné sur la demi-droite. Vérification : 115° > 90°, l’angle obtenu est bien obtus ✓.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_angles_P6'] },
  },
  {
    id: 'an-e9',
    requires: ['angle-droit', 'tour-360'],
    skill: 'problemes',
    title: 'Épreuve 9',
    prompt: 'Le circuit d’attente est un carré : l’avion effectue 4 virages égaux pour revenir à son cap de départ (un tour complet). Combien mesure chaque virage ?',
    options: ['45°', '90°', '180°'],
    cols: 3,
    correct: 1,
    explain: 'Un tour complet vaut 360° : 360 ÷ 4 = 90° par virage — quatre angles droits, comme les coins d’un carré.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_angles_P7'] },
  },
  {
    id: 'an-e10',
    requires: ['classes-angles', 'deux-graduations', 'reflexe-classer'],
    skill: 'problemes',
    title: 'Épreuve 10',
    prompt: 'Approche finale : le manuel impose un angle piste-trajectoire AIGU de 30°. Le copilote lit 150° sur l’instrument. Que faut-il en conclure ?',
    options: [
      'L’approche est bonne : 150° est la mesure attendue',
      'Il a lu la mauvaise graduation : 180 − 150 = 30°, l’approche est correcte',
      'L’approche est impossible, il faut faire demi-tour',
    ],
    cols: 1,
    correct: 1,
    explain:
      '150° serait un angle obtus, incompatible avec l’approche aiguë exigée. C’est l’autre échelle : la vraie mesure est 30° ✓. Classer d’abord, lire ensuite, vérifier toujours.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_angles_P7', '6e_angles_P3', '6e_angles_P4'] },
  },
];

const BADGES = [
  { id: 'ouverture', emoji: '🏅', label: 'Œil d’aviateur', test: (s) => (s.ouverture ?? 0) === 0 },
  { id: 'classeur', emoji: '🏅', label: 'Navigateur classeur', test: (s) => (s.comparer ?? 0) === 0 },
  { id: 'mesureur', emoji: '🏅', label: 'Maître du rapporteur', test: (s) => (s.mesurer ?? 0) === 0 },
  { id: 'graduation', emoji: '🏅', label: 'Anti-piège', test: (s) => (s.graduation ?? 0) === 0 },
  { id: 'constructeur', emoji: '🏅', label: 'Traceur de caps', test: (s) => (s.construire ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Ailes d’or', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Des côtés plus longs = un angle plus grand', right: 'Seule l’OUVERTURE compte — la longueur des côtés n’y change rien' },
  { wrong: 'Poser le rapporteur au jugé', right: 'Centre sur le sommet, PUIS zéro sur un côté' },
  { wrong: 'Lire n’importe laquelle des deux graduations', right: 'Celle qui part du zéro posé sur le côté — et on vérifie avec la classe' },
  { wrong: 'Un angle change si on tourne la figure', right: 'L’orientation ne change jamais la mesure' },
];

function Synthese() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 text-center">
        <div className="text-2xl" aria-hidden="true">📐</div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
          Un angle est une ouverture entre deux demi-droites. Ni la longueur des côtés ni l'orientation du dessin
          ne la modifient : seul l'écartement compte.
        </p>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-semibold text-slate-700 text-center">L’angle d’approche finale</p>
        <Protractor angleDeg={30} mode="read" selectedValue={30} disabled ariaLabel="Rapporteur bien posé sur l’angle d’approche de 30 degrés" />
        <p className="text-center font-mono text-sm text-slate-600">
          Centre sur le sommet · zéro sur le côté · lecture <strong>30°</strong> (aigu ✓)
        </p>
      </div>

      <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl p-5 text-center space-y-1">
        <p className="text-xs uppercase tracking-wide text-sky-100 font-mono font-bold">À retenir</p>
        <p className="font-mono font-extrabold text-base sm:text-lg">aigu &lt; 90° · droit = 90° · obtus &gt; 90° · plat = 180°</p>
        <p className="text-sky-100 text-sm">Autour d’un point : un tour complet vaut 360°</p>
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
        Le réflexe complet, valable pour mesurer comme pour construire :{' '}
        <strong>classer → lire (ou marquer) → vérifier</strong>. La classe de l'angle élimine toujours la mauvaise
        graduation.
      </Feedback>

      {/* La carte complète : l'« À retenir » de la leçon n'est pas un second
          résumé écrit à la main, c'est la carte elle-même
          (docs/architecture/KNOWLEDGE_MAP.md). */}
      <KnowledgeSnapshot complete variant="complete" />
    </div>
  );
}

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : l’école de pilotage"
      moduleSubtitle="Dix épreuves pour décrocher ton brevet."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Brevet de pilote : caps, virages et approche finale.',
        tone: 'amber',
        body: (
          <p>
            Du plan de vol à l'atterrissage : reconnaître, comparer, mesurer au rapporteur, éviter le piège des
            deux graduations et construire un cap. Réponds à toutes les épreuves, puis valide pour découvrir ta
            correction et tes badges de maîtrise.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Ailes d’or !',
        title: 'Brevet décroché !',
        message: (
          <>
            Du premier virage à l'approche finale, tu as reconnu, comparé, classé, mesuré et construit des angles —
            sans jamais te faire piéger par la longueur des côtés ni par la mauvaise graduation.
          </>
        ),
        verbs: ['Comparer', 'Classer', 'Mesurer', 'Construire'],
        masterBadgeLabel: 'Badge « Ailes d’or » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
