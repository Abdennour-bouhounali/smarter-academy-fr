import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import RatioLab from '../components/RatioLab';
import { SIGNATURE } from '../components/trigoUtils';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Chaque distracteur
 * encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   - croire qu'un plus grand triangle a de plus grands rapports (M1, M3) ;
 *   - garder « opposé » attaché à un côté fixe quand l'angle change (M2) ;
 *   - accepter un sinus supérieur à 1 (M4, M6) ;
 *   - choisir le rapport par habitude plutôt que par les deux côtés (M5) ;
 *   - utiliser sin au lieu de arcsin pour remonter à l'angle (M6) ;
 *   - lire une pente en pourcentage comme un angle (M7).
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur.
 */
const EPREUVES = [
  {
    id: 'tg-e1',
    skill: 'reperer',
    title: 'L’hypoténuse',
    prompt: 'Dans un triangle RST rectangle en S, quel côté est l’hypoténuse ?',
    options: ['[RT]', '[RS]', '[ST]', 'Celui qui est horizontal'],
    cols: 4,
    explain: 'L’hypoténuse est le côté opposé à l’angle droit. L’angle droit est en S, donc c’est [RT] — quelle que soit l’orientation du dessin.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_trigonometrie-triangle-rectangle-3e_P1', '3e_trigonometrie-triangle-rectangle-3e_P5'] },
  },
  {
    id: 'tg-e2',
    skill: 'reperer',
    title: 'Opposé et adjacent',
    prompt: 'Dans un triangle ABC rectangle en B, on étudie l’angle en A. Quel côté est le côté opposé ?',
    options: ['[BC]', '[AB]', '[AC]', 'Cela dépend de la taille du triangle'],
    cols: 4,
    explain: 'Le côté opposé à A est celui qui ne touche pas A : c’est [BC]. Si l’on étudiait l’angle en C, ce serait [AB] — les deux rôles s’échangent avec l’angle étudié.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_trigonometrie-triangle-rectangle-3e_P2', '3e_trigonometrie-triangle-rectangle-3e_P3'] },
  },
  {
    id: 'tg-e3',
    skill: 'reperer',
    title: 'Ce qui ne change pas',
    prompt: 'On passe d’un angle aigu à l’autre dans le même triangle rectangle. Qu’est-ce qui reste identique ?',
    options: [
      'L’hypoténuse : elle est définie par l’angle droit, pas par l’angle étudié',
      'Le côté opposé',
      'Le côté adjacent',
      'Rien, tout change',
    ],
    cols: 1,
    explain: 'Opposé et adjacent s’échangent quand on change d’angle de référence. L’hypoténuse, elle, reste face à l’angle droit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_trigonometrie-triangle-rectangle-3e_P4'] },
  },
  {
    id: 'tg-e4',
    skill: 'invariance',
    title: 'Agrandir le triangle',
    prompt: 'On double toutes les longueurs d’un triangle rectangle, sans changer ses angles. Que deviennent le sinus, le cosinus et la tangente ?',
    options: [
      'Ils sont inchangés : ils ne dépendent que de l’angle',
      'Ils doublent',
      'Ils sont divisés par deux',
      'Seule la tangente change',
    ],
    cols: 1,
    explain: 'Les trois côtés doublent, donc chaque quotient garde la même valeur. C’est l’invariance que tu as relevée sur trois tailles différentes — et c’est ce qui permet de tabuler ces rapports.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_trigonometrie-triangle-rectangle-3e_P6'] },
  },
  {
    id: 'tg-e5',
    skill: 'definitions',
    title: 'La bonne définition',
    prompt: 'Que vaut le cosinus d’un angle dans un triangle rectangle ?',
    options: [
      '$\\dfrac{\\text{adjacent}}{\\text{hypoténuse}}$',
      '$\\dfrac{\\text{opposé}}{\\text{hypoténuse}}$',
      '$\\dfrac{\\text{opposé}}{\\text{adjacent}}$',
      '$\\dfrac{\\text{hypoténuse}}{\\text{adjacent}}$',
    ],
    renderOption: (o) => <MathText>{o}</MathText>,
    optionLabel: (i) => ['adjacent / hypoténuse', 'opposé / hypoténuse', 'opposé / adjacent', 'hypoténuse / adjacent'][i],
    cols: 2,
    explain: 'cos α = adjacent / hypoténuse. Le sinus est opposé / hypoténuse, et la tangente opposé / adjacent — la seule des trois qui n’utilise pas l’hypoténuse.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_trigonometrie-triangle-rectangle-3e_P8', '3e_trigonometrie-triangle-rectangle-3e_P7'] },
  },
  {
    id: 'tg-e6',
    skill: 'definitions',
    title: 'Un résultat impossible',
    prompt: 'Un élève calcule un cosinus et trouve 1,6. Que s’est-il passé ?',
    options: [
      'Il a inversé la fraction : un cosinus ne dépasse jamais 1',
      'C’est correct pour un angle proche de 0°',
      'C’est correct dans un grand triangle',
      'Sa calculatrice était en radians',
    ],
    cols: 1,
    explain: 'Le cosinus vaut adjacent ÷ hypoténuse, et l’hypoténuse est le plus grand côté : le quotient reste donc inférieur à 1. Un résultat supérieur signale une fraction inversée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_trigonometrie-triangle-rectangle-3e_P9'] },
  },
  {
    id: 'tg-e7',
    skill: 'choisir',
    title: 'Choisir le rapport',
    prompt: 'On connaît l’hypoténuse et on cherche le côté adjacent à l’angle étudié. Quel rapport utiliser ?',
    options: ['Le cosinus', 'Le sinus', 'La tangente', 'N’importe lequel des trois'],
    cols: 4,
    explain: 'Adjacent et hypoténuse sont reliés par le cosinus, et par lui seul. Le choix ne se devine pas : il se déduit des deux côtés en jeu.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_trigonometrie-triangle-rectangle-3e_P10'] },
  },
  {
    id: 'tg-e8',
    skill: 'calculer',
    title: 'Calculer une longueur',
    prompt: 'Une échelle de 10 m forme un angle de 60° avec le sol. À quelle hauteur touche-t-elle le mur ? (arrondi au dixième)',
    options: ['8,7 m', '5,0 m', '11,5 m', '17,3 m'],
    cols: 4,
    explain: 'La hauteur est le côté opposé, l’échelle l’hypoténuse : hauteur = 10 × sin 60° ≈ 8,7 m. La réponse 5,0 m vient du cosinus (c’est la distance au mur), et 11,5 m dépasserait la longueur de l’échelle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_trigonometrie-triangle-rectangle-3e_P11'] },
  },
  {
    id: 'tg-e9',
    skill: 'angle',
    title: 'Retrouver un angle',
    prompt: 'Dans un triangle rectangle, le côté opposé mesure 5 et l’hypoténuse 10. Quelle touche de la calculatrice donne l’angle ?',
    options: [
      'arcsin (ou sin⁻¹) appliqué à 0,5',
      'sin appliqué à 0,5',
      'arccos appliqué à 0,5',
      'arctan appliqué à 0,5',
    ],
    cols: 1,
    explain: 'Opposé ÷ hypoténuse = 5 ÷ 10 = 0,5, c’est un SINUS. Pour remonter du rapport à l’angle, on applique la touche inverse : arcsin(0,5) = 30°.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_trigonometrie-triangle-rectangle-3e_P12', '3e_trigonometrie-triangle-rectangle-3e_P13'] },
  },
  {
    id: 'tg-e10',
    skill: 'probleme',
    title: 'La pente en pourcentage',
    prompt: 'Une route affiche une pente de 10 %. Quel angle forme-t-elle avec l’horizontale ?',
    options: [
      'Environ 5,7°, car 10 % est une tangente, pas un angle',
      'Exactement 10°',
      'Environ 45°',
      'Environ 84,3°',
    ],
    cols: 1,
    explain: 'Une pente de 10 % signifie qu’on monte de 10 m pour 100 m parcourus : c’est un rapport, donc une tangente. L’angle vaut arctan(0,10) ≈ 5,7°. Confondre le pourcentage avec l’angle est l’erreur classique.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_trigonometrie-triangle-rectangle-3e_P14'] },
  },
];

const SKILLS = {
  reperer: { label: 'Nommer les côtés', module: 2 },
  invariance: { label: 'L’invariance des rapports', module: 3 },
  definitions: { label: 'Sinus, cosinus, tangente', module: 4 },
  choisir: { label: 'Choisir le rapport', module: 5 },
  calculer: { label: 'Calculer une longueur', module: 5 },
  angle: { label: 'Calculer un angle', module: 6 },
  probleme: { label: 'Problèmes concrets', module: 7 },
};

const BADGES = [
  { id: 'b-rep', emoji: '🏅', label: 'Nomme sans se tromper', test: (m) => !m.reperer },
  { id: 'b-inv', emoji: '🏅', label: 'L’invariance comprise', test: (m) => !m.invariance },
  { id: 'b-def', emoji: '🏅', label: 'Les trois définitions', test: (m) => !m.definitions },
  { id: 'b-cho', emoji: '🏅', label: 'Le bon rapport', test: (m) => !m.choisir && !m.calculer },
  { id: 'b-ang', emoji: '🏅', label: 'Maître de l’arc', test: (m) => !m.angle },
  { id: 'b-pro', emoji: '🏅', label: 'Géomètre de terrain', test: (m) => !m.probleme },
  { id: 'b-parfait', emoji: '💎', label: 'Maître des pentes', test: (m) => Object.keys(m).length === 0 },
];

/** La synthèse : le même angle à deux tailles, rapports identiques. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {[SIGNATURE.echelles[0], SIGNATURE.echelles[3]].map((h) => (
          <div key={h} className="space-y-1">
            <p className="text-sm font-semibold text-slate-700 text-center">
              Taille {h === SIGNATURE.echelles[0] ? 'petite' : 'grande'}
            </p>
            <RatioLab alpha={SIGNATURE.alpha} hyp={h} disabled
              ariaLabel={`Triangle d’angle ${SIGNATURE.alpha} degrés, hypoténuse ${h}`} />
          </div>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-2 text-sm">
        {[
          { t: 'Trois rôles', d: 'Opposé et adjacent changent avec l’angle, pas l’hypoténuse.' },
          { t: 'Une invariance', d: 'Les rapports ne dépendent que de l’angle.' },
          { t: 'Deux sens', d: 'sin/cos/tan pour une longueur, arcsin/arccos/arctan pour un angle.' },
        ].map(({ t, d }) => (
          <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
            <p className="font-semibold text-slate-800">{t}</p>
            <p className="text-xs text-slate-600">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      lessonConfig={LESSON_CONFIG}
      moduleTitle="🏆 Mission finale : les pentes"
      moduleSubtitle="Dix épreuves pour prouver que tu maîtrises la trigonométrie"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Maître des pentes',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune : quel est l’angle étudié,
            que connaît-on, et que cherche-t-on ?
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📐', label: 'Hypoténuse', value: 'face à l’angle droit' },
        { id: 'r2', emoji: '🔄', label: 'Opposé/adjacent', value: 's’échangent avec l’angle' },
        { id: 'r3', emoji: '📏', label: 'Sinus, cosinus', value: 'toujours < 1' },
        { id: 'r4', emoji: '↩️', label: 'Trouver l’angle', value: 'arcsin, arccos, arctan' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître des pentes !',
        title: 'Mission accomplie',
        message: 'Tu sais nommer les côtés, choisir le bon rapport, calculer une longueur et un angle.',
        verbs: ['Nommer', 'Choisir', 'Calculer', 'Résoudre'],
        masterBadgeLabel: 'Maître des pentes',
      }}
    />
  );
}
