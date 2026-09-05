import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import GraphProbe from '../components/GraphProbe';
import { BALLOON, BALLOON_2 } from '../components/balloonData';
import { antecedents, maxOf, minOf, variations, crossings, describeVariation } from '../components/readingUtils';
import { formatDec } from '@smarter-academy/core';

/**
 * Module 7 — 🏆 MISSION FINALE : « La tour de contrôle ».
 *
 * Fichier de DONNÉES : dix épreuves QCM, silencieuses jusqu'à un unique envoi.
 * Écrites EN DERNIER, chaque distracteur reprenant un piège de la leçon :
 *   e1  abscisse lue à la place de l'ordonnée (module 1)
 *   e2  un seul antécédent supposé (module 2)
 *   e3  altitude jamais atteinte (module 2)
 *   e4  carreaux comptés sans l'échelle (module 3)
 *   e5  valeur arrondie à la graduation (module 3)
 *   e6  maximum confondu avec l'heure du maximum (module 4)
 *   e7  intervalle de croissance donné comme une altitude (module 4)
 *   e8  ordonnée du croisement donnée pour l'heure (module 5)
 *   e9  sens du croisement mal interprété (module 5)
 *   e10 instant donné à la place d'une durée (module 6)
 *
 * Couverture des Learning Points : P1 (e1), P3 (e1), P2 (e2, e3), P4 (e4, e5),
 * P5 (e6), P6 (e7), P7 (e7), P8 (e8), P9 (e9), P10 (e10).
 */

const HITS = crossings(BALLOON, BALLOON_2);
const MAXP = maxOf(BALLOON);
const VARS = variations(BALLOON);

const REGISTRE = [
  { id: 'vol', emoji: '🎈', label: 'Le vol', value: '12 h de relevés' },
  { id: 'echelle', emoji: '📏', label: 'Échelle', value: '1 carreau = 100 m' },
  { id: 'image', emoji: '⬇️', label: 'Image', value: 'une seule' },
  { id: 'antecedent', emoji: '↔️', label: 'Antécédents', value: '0, 1 ou plusieurs' },
];

const SKILLS = {
  lire: { label: 'Lire une image et des coordonnées', module: 1 },
  antecedent: { label: 'Chercher tous les antécédents', module: 2 },
  echelle: { label: "Lire avec l'échelle", module: 3 },
  variations: { label: 'Extremums et variations', module: 4 },
  croisement: { label: 'Intersections et solutions', module: 5 },
  probleme: { label: 'Résoudre un problème', module: 6 },
};

const EPREUVES = [
  {
    id: 'lg-e1',
    skill: 'lire',
    title: 'Épreuve 1',
    prompt: 'Un point de la courbe a pour coordonnées (5 ; 400). Que signifie-t-il ?',
    options: [
      'À 5 h, le ballon était à 400 m',
      'À 400 h, le ballon était à 5 m',
      'Le ballon est monté de 5 m en 400 h',
      'Le ballon a mis 400 h pour atteindre 5 m',
    ],
    cols: 1,
    correct: 0,
    explain: "Un point se lit toujours dans le même ordre : l'abscisse d'abord (l'heure), l'ordonnée ensuite (l'altitude).",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_lecture-graphique-3e_P1', '3e_lecture-graphique-3e_P3'] },
  },
  {
    id: 'lg-e2',
    skill: 'antecedent',
    title: 'Épreuve 2',
    prompt: 'Sur un vol qui monte, redescend puis remonte, combien de fois une altitude intermédiaire peut-elle être atteinte ?',
    options: [
      'Plusieurs fois : autant que la courbe croise ce niveau',
      'Une seule fois, forcément',
      'Deux fois au maximum',
      'Jamais plus d’une fois par heure',
    ],
    cols: 1,
    correct: 0,
    explain: "Le guide horizontal coupe la courbe autant de fois que le ballon franchit ce niveau. Une heure n'a qu'une altitude, mais une altitude peut avoir plusieurs antécédents.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_lecture-graphique-3e_P2'] },
  },
  {
    id: 'lg-e3',
    skill: 'antecedent',
    title: 'Épreuve 3',
    prompt: 'Le sommet du vol est à 600 m. Combien d’antécédents l’altitude 800 m a-t-elle ?',
    options: ['Aucun', 'Un', 'Deux', 'Impossible à savoir'],
    cols: 2,
    correct: 0,
    explain: "Le guide placé à 800 m ne coupe la courbe nulle part, puisque le ballon n'est jamais monté si haut : cette altitude n'a aucun antécédent.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_lecture-graphique-3e_P2'] },
  },
  {
    id: 'lg-e4',
    skill: 'echelle',
    title: 'Épreuve 4',
    prompt: 'Un carreau vertical vaut 100 m. La courbe est à quatre carreaux de hauteur. Quelle altitude ?',
    options: ['400 m', '4 m', '104 m', '40 m'],
    cols: 2,
    correct: 0,
    explain: "Compter les carreaux ne suffit pas : il faut les multiplier par ce que vaut un carreau. Quatre carreaux à 100 m font 400 m.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_lecture-graphique-3e_P4'] },
  },
  {
    id: 'lg-e5',
    skill: 'echelle',
    title: 'Épreuve 5',
    prompt: 'À 1 h le ballon est à 200 m, à 2 h il est à 400 m. Que vaut son altitude à 1 h 30 ?',
    options: ['300 m', '200 m', '400 m', 'Impossible à lire'],
    cols: 2,
    correct: 0,
    explain: "À mi-chemin entre deux relevés, la courbe passe par la valeur intermédiaire : 300 m. Une altitude peut très bien tomber entre deux graduations.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_lecture-graphique-3e_P4'] },
  },
  {
    id: 'lg-e6',
    skill: 'variations',
    title: 'Épreuve 6',
    prompt: 'Le sommet du vol est atteint à 3 h, à 600 m. Quel est le MAXIMUM de la fonction ?',
    options: ['600 m', '3 h', '3', 'De 3 h à 4 h'],
    cols: 2,
    correct: 0,
    explain: "Le maximum est une VALEUR de la fonction, donc une altitude : 600 m. L'heure 3 h est l'endroit où ce maximum est atteint, pas le maximum lui-même.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_lecture-graphique-3e_P5'] },
  },
  {
    id: 'lg-e7',
    skill: 'variations',
    title: 'Épreuve 7',
    prompt: 'Comment exprime-t-on une période pendant laquelle le ballon monte ?',
    options: [
      'Par un intervalle d’heures, par exemple de 0 h à 3 h',
      'Par une altitude, par exemple 600 m',
      'Par un seul instant, par exemple 3 h',
      'Par le nombre de mètres gagnés',
    ],
    cols: 1,
    correct: 0,
    explain: "Une période de croissance est un morceau de l'axe des ABSCISSES : elle a un début et une fin, exprimés en heures. Les altitudes se lisent sur l'autre axe.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_lecture-graphique-3e_P6', '3e_lecture-graphique-3e_P7'] },
  },
  {
    id: 'lg-e8',
    skill: 'croisement',
    title: 'Épreuve 8',
    prompt: 'Deux courbes se coupent au point (2 ; 400). À quelle heure les deux ballons sont-ils à la même altitude ?',
    options: ['À 2 h', 'À 400 h', 'À 402 h', 'On ne peut pas le savoir'],
    cols: 2,
    correct: 0,
    explain: "L'abscisse du point d'intersection donne le MOMENT de la rencontre : 2 h. Son ordonnée, 400 m, donne l'altitude commune à cet instant.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_lecture-graphique-3e_P8'] },
  },
  {
    id: 'lg-e9',
    skill: 'croisement',
    title: 'Épreuve 9',
    prompt: 'Avant leur croisement, la courbe B est au-dessus de A. Que peut-on dire après le croisement ?',
    options: [
      'A passe au-dessus de B',
      'Les deux restent à la même altitude',
      'B reste au-dessus de A',
      'Les deux redescendent au sol',
    ],
    cols: 1,
    correct: 0,
    explain: "Le croisement est l'instant où l'écart s'annule et change de sens : celle qui était en dessous passe au-dessus. C'est l'interprétation graphique d'un changement de solution.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_lecture-graphique-3e_P9'] },
  },
  {
    id: 'lg-e10',
    skill: 'probleme',
    title: 'Épreuve 10',
    prompt: 'Un drone franchit 600 m à 3 h et repasse en dessous à 5 h. Combien de temps est-il resté au-dessus ?',
    options: ['2 h', '3 h', '5 h', '600 m'],
    cols: 2,
    correct: 0,
    explain: "Une durée est un ÉCART entre deux instants : 5 − 3 = 2 h. Donner « 3 h » serait donner le moment du franchissement, pas la durée.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_lecture-graphique-3e_P10'] },
  },
];

const BADGES = [
  { id: 'lire', emoji: '🏅', label: 'Lecteur de coordonnées', test: (s) => (s.lire ?? 0) === 0 },
  { id: 'antecedent', emoji: '🏅', label: 'Chasseur d’antécédents', test: (s) => (s.antecedent ?? 0) === 0 },
  { id: 'echelle', emoji: '🏅', label: 'Œil calibré', test: (s) => (s.echelle ?? 0) === 0 },
  { id: 'variations', emoji: '🏅', label: 'Maître des sommets', test: (s) => (s.variations ?? 0) === 0 },
  { id: 'croisement', emoji: '🏅', label: 'Aiguilleur du ciel', test: (s) => (s.croisement ?? 0) === 0 },
  { id: 'probleme', emoji: '🏅', label: 'Contrôleur en chef', test: (s) => (s.probleme ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Sans faute', test: (s) => Object.values(s).every((v) => v === 0) },
];

const PIEGES = [
  { wrong: 'Une altitude n’est atteinte qu’une fois', right: 'Elle peut l’être zéro, une ou plusieurs fois' },
  { wrong: 'Le maximum, c’est 3 h', right: 'Le maximum est une altitude : 600 m. 3 h est le moment' },
  { wrong: 'Quatre carreaux, donc 4', right: 'Quatre carreaux à 100 m, donc 400 m' },
  { wrong: 'Le croisement se lit sur l’axe vertical', right: 'L’abscisse donne QUAND, l’ordonnée donne COMBIEN' },
  { wrong: 'Une durée, c’est un instant', right: 'Une durée est l’écart entre deux instants' },
];

/** Synthèse : la sonde figée sur les deux vols, et les repères de lecture. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900 text-white p-4 text-center space-y-1">
        <p className="text-2xl">🎈 🔎</p>
        <p className="font-bold">Tout se lit, rien ne se calcule</p>
        <p className="text-slate-300 text-sm">
          Verticalement les altitudes, horizontalement les heures.
        </p>
      </div>

      <GraphProbe
        curves={[
          { id: 'b1', points: BALLOON, tone: 'sky', label: 'ballon A' },
          { id: 'b2', points: BALLOON_2, tone: 'rose', label: 'ballon B' },
        ]}
        curve={BALLOON}
        mode="x"
        value={HITS.length ? HITS[0].x : 2}
        frozen
        ariaLabel="Synthèse : les deux vols et leur croisement"
      />

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <p className="font-bold text-slate-800">Ce que le vol raconte</p>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li><strong>Maximum</strong> : {formatDec(MAXP.y)} m, atteint à {formatDec(MAXP.x)} h.</li>
          <li><strong>Minimum</strong> : {formatDec(minOf(BALLOON).y)} m, atteint deux fois.</li>
          <li><strong>400 m</strong> est atteint {antecedents(BALLOON, 400).length} fois : à {antecedents(BALLOON, 400).map((x) => `${formatDec(x)} h`).join(', ')}.</li>
          <li><strong>Variations</strong> : le vol {describeVariation(VARS.slice(0, 3), { unit: ' h' })}.</li>
        </ul>
      </div>

      <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4">
        <p className="font-bold text-rose-800 mb-2">Les pièges déjoués</p>
        <ul className="space-y-1.5 text-sm">
          {PIEGES.map((p) => (
            <li key={p.wrong} className="text-slate-700">
              <span className="text-rose-600">❌ {p.wrong}</span>
              <br />
              <span className="text-emerald-700">✅ {p.right}</span>
            </li>
          ))}
        </ul>
      </div>

      <Feedback tone="info">
        Une courbe répond à toutes ces questions sans qu’aucune formule n’intervienne. Il
        suffit de savoir sur quel axe chercher — et de lire l’échelle avant de conclure.
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
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : la tour de contrôle"
      moduleSubtitle="Dix épreuves à lire sur la courbe, et rien qu’à lire."
      estimatedTime="12 min"
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'Dix lectures à réussir',
        tone: 'amber',
        body: (
          <p>
            Aucune correction avant la fin : réponds aux dix épreuves, puis valide en une
            fois. Tu verras ensuite ton profil et la synthèse.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Chef de la tour de contrôle !',
        title: 'Vol suivi de bout en bout !',
        message: (
          <>
            Du décollage jusqu’au croisement des deux ballons, tu as tout lu sur la courbe —
            sans jamais confondre une altitude avec une heure, ni un instant avec une durée.
          </>
        ),
        verbs: ['Lire', 'Chercher', 'Repérer', 'Interpréter'],
        masterBadgeLabel: 'Badge « Chef de la tour de contrôle » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
