import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import ShapeLab from '../components/ShapeLab';
import { SHAPE_LABEL, PROPERTIES, propertiesOf } from '../components/figuresUtils';

/**
 * Module 8 — ÉVALUATION (« Boss final »).
 *
 * Fichier de DONNÉES : le moteur vit dans common/kit/BossFinal.jsx.
 *
 * Distracteurs, tous adossés à un piège réellement travaillé :
 *   - nommer d'après l'allure                     (module 1)
 *   - compter un sommet de trop                   (module 2)
 *   - croire carré et rectangle exclusifs         (module 3)
 *   - refuser qu'un triangle cumule deux caractères (module 4)
 *   - décrire par l'orientation plutôt que les propriétés (module 5)
 *   - conclure sur un seul indice                 (module 6)
 *
 * Couverture des LP : P1(e1) P2(e2) P3(e3) P4(e4) P5(e5) P6(e6) P7(e7)
 * P8(e8) P9(e9) P10(e10) — les 10 learning points sont évalués.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 260, yMax: 190 };

const CARRE = [{ x: 70, y: 35 }, { x: 190, y: 35 }, { x: 190, y: 155 }, { x: 70, y: 155 }];
const RECT = [{ x: 40, y: 55 }, { x: 220, y: 55 }, { x: 220, y: 140 }, { x: 40, y: 140 }];
const LOSANGE = [{ x: 130, y: 25 }, { x: 215, y: 95 }, { x: 130, y: 165 }, { x: 45, y: 95 }];
const PENTA = [{ x: 130, y: 25 }, { x: 215, y: 85 }, { x: 185, y: 165 }, { x: 75, y: 165 }, { x: 45, y: 85 }];
const TRI_ISO_RECT = [{ x: 60, y: 155 }, { x: 180, y: 155 }, { x: 60, y: 35 }];

const SKILLS = {
  reconnaitre: { label: 'Reconnaître une figure par ses propriétés', module: 1 },
  vocabulaire: { label: 'Côtés, sommets et angles', module: 2 },
  quadrilateres: { label: 'Caractériser carré et rectangle', module: 3 },
  triangles: { label: 'La famille des triangles', module: 4 },
  decrire: { label: 'Décrire et comparer des figures', module: 5 },
  identifier: { label: 'Identifier à partir d’indices', module: 6 },
  construire: { label: 'Construire sous contraintes', module: 7 },
};

const fig = (pts, label) => (
  <ShapeLab
    points={pts} box={BOX} draggable={false}
    showName={false} showProperties={false}
    ariaLabel={label}
  />
);

const EPREUVES = [
  {
    id: 'fp-e1',
    skill: 'reconnaitre',
    title: 'Épreuve 1 — Sur quoi se fonder ?',
    prompt:
      'Une figure ressemble beaucoup à un carré, mais l’un de ses côtés mesure 8 mm de plus que les autres. Est-ce un carré ?',
    options: [
      'Non : un carré a ses quatre côtés exactement égaux',
      'Oui : 8 mm, c’est négligeable à l’œil',
      'Oui, si elle a quatre angles droits',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Le nom d’une figure vient de propriétés exactes, pas de son allure. Un côté différent, et ce n’est plus un carré.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_figures-planes_P1'] },
  },
  {
    id: 'fp-e2',
    skill: 'vocabulaire',
    title: 'Épreuve 2 — Côtés et sommets',
    prompt: 'Ce polygone a 5 côtés. Combien a-t-il de sommets ?',
    extra: fig(PENTA, 'Pentagone à cinq côtés'),
    options: ['5 sommets', '6 sommets', '4 sommets'],
    cols: 3,
    correct: 0,
    explain:
      'Autant de sommets que de côtés : la figure est fermée, donc le dernier côté ramène au premier sommet sans en créer un nouveau.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_figures-planes_P2'] },
  },
  {
    id: 'fp-e3',
    skill: 'vocabulaire',
    title: 'Épreuve 3 — Comparer deux angles',
    prompt:
      'Deux angles mesurent 65° et 110°. Lequel est le plus ouvert, et de quoi cela dépend-il ?',
    options: [
      'Celui de 110°, car un angle se compare par sa mesure',
      'Celui de 65°, car ses côtés sont plus longs',
      'On ne peut pas comparer sans connaître la figure',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Un angle ne dépend que de l’écartement de ses côtés, jamais de leur longueur : 110° > 65°, donc il est plus ouvert.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_figures-planes_P3'] },
  },
  {
    id: 'fp-e4',
    skill: 'quadrilateres',
    title: 'Épreuve 4 — Caractériser le carré',
    prompt: 'Quelles propriétés faut-il vérifier, ensemble, pour affirmer qu’un quadrilatère est un carré ?',
    extra: fig(CARRE, 'Un carré'),
    options: [
      '4 côtés égaux ET 4 angles droits',
      '4 côtés égaux, cela suffit',
      '4 angles droits, cela suffit',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Les deux à la fois : 4 côtés égaux seuls donnent un losange, 4 angles droits seuls donnent un rectangle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_figures-planes_P4'] },
  },
  {
    id: 'fp-e5',
    skill: 'quadrilateres',
    title: 'Épreuve 5 — Carré et rectangle',
    prompt: 'Un carré est-il un rectangle ?',
    extra: fig(RECT, 'Un rectangle'),
    options: [
      'Oui : il a 4 angles droits, plus la propriété d’avoir 4 côtés égaux',
      'Non : ce sont deux figures différentes',
      'Non : un rectangle est toujours plus long que large',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Le rectangle se définit par ses 4 angles droits. Le carré les a, plus une propriété en plus : c’est donc un rectangle particulier.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_figures-planes_P5'] },
  },
  {
    id: 'fp-e6',
    skill: 'triangles',
    title: 'Épreuve 6 — Deux caractères à la fois',
    prompt: 'Ce triangle a deux côtés égaux et un angle droit. Comment l’appelle-t-on ?',
    extra: fig(TRI_ISO_RECT, 'Triangle isocèle rectangle'),
    options: [
      'Isocèle rectangle : les deux à la fois',
      'Seulement rectangle',
      'Équilatéral',
    ],
    cols: 1,
    correct: 0,
    explain:
      '« Isocèle » parle des côtés, « rectangle » d’un angle : deux critères indépendants, donc cumulables. Un équilatéral, lui, n’a jamais d’angle droit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_figures-planes_P6'] },
  },
  {
    id: 'fp-e7',
    skill: 'decrire',
    title: 'Épreuve 7 — Une description valable',
    prompt: 'Laquelle de ces descriptions désigne un losange sans ambiguïté ?',
    extra: fig(LOSANGE, 'Un losange'),
    options: [
      'Un quadrilatère dont les 4 côtés sont égaux',
      'Un carré posé sur la pointe',
      'Un quadrilatère penché',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Une description doit énoncer des propriétés vérifiables. L’orientation sur la feuille n’en est pas une : tourner une figure ne change pas sa nature.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_figures-planes_P7'] },
  },
  {
    id: 'fp-e8',
    skill: 'decrire',
    title: 'Épreuve 8 — Comparer deux figures',
    prompt: 'Quelle propriété le rectangle possède-t-il, que le losange ne possède pas en général ?',
    options: [
      'Quatre angles droits',
      'Quatre côtés égaux',
      'Des côtés opposés parallèles',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Les deux ont leurs côtés opposés parallèles ; le losange a 4 côtés égaux, le rectangle a 4 angles droits. C’est là qu’ils diffèrent.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_figures-planes_P8'] },
  },
  {
    id: 'fp-e9',
    skill: 'identifier',
    title: 'Épreuve 9 — L’enquête',
    prompt:
      'Une figure a 4 côtés tous égaux, et aucun angle droit. De quelle figure s’agit-il ?',
    options: ['Un losange', 'Un carré', 'Un rectangle'],
    cols: 3,
    correct: 0,
    explain:
      '4 côtés égaux : carré ou losange. « Aucun angle droit » élimine le carré. Il reste le losange. Un seul indice n’aurait pas suffi.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_figures-planes_P9'] },
  },
  {
    id: 'fp-e10',
    skill: 'construire',
    title: 'Épreuve 10 — Construire',
    prompt:
      'On demande de construire un quadrilatère avec 4 angles droits mais dont les côtés ne sont pas tous égaux. Que faut-il tracer ?',
    options: [
      'Un rectangle qui ne soit pas un carré',
      'Un carré',
      'Un losange',
    ],
    cols: 1,
    correct: 0,
    explain:
      '4 angles droits impose un rectangle ; « côtés non tous égaux » interdit le carré. Il faut donc un rectangle allongé.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_figures-planes_P10'] },
  },
];

const BADGES = [
  { id: 'b-reco', emoji: '🏅', label: 'Œil critique — l’allure ne suffit pas', test: (m) => !m.reconnaitre },
  { id: 'b-voc', emoji: '🏅', label: 'Vocabulaire exact', test: (m) => !m.vocabulaire },
  { id: 'b-quad', emoji: '🏅', label: 'Maître des quadrilatères', test: (m) => !m.quadrilateres },
  { id: 'b-tri', emoji: '🏅', label: 'Expert des triangles', test: (m) => !m.triangles },
  { id: 'b-desc', emoji: '🏅', label: 'Descripteur rigoureux', test: (m) => !m.decrire },
  { id: 'b-enq', emoji: '🏅', label: 'Fin limier géométrique', test: (m) => !m.identifier },
];

/** Synthèse : la famille des figures, reconstruite à partir des propriétés. */
function Synthese() {
  const cards = [
    { pts: CARRE, note: '4 côtés égaux + 4 angles droits' },
    { pts: RECT, note: '4 angles droits' },
    { pts: LOSANGE, note: '4 côtés égaux' },
  ];
  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-space font-extrabold text-slate-900">Une figure, une liste de propriétés</h2>
        <p className="text-sm text-slate-500">
          Le nom vient toujours des propriétés — jamais de l’allure ni de l’orientation.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {cards.map((c, i) => {
          const props = propertiesOf(c.pts);
          return (
            <div key={i} className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
              <ShapeLab
                points={c.pts} box={BOX} draggable={false}
                showName showProperties={false} size={210}
                ariaLabel={c.note}
              />
              <ul className="space-y-1">
                {PROPERTIES.map((p) => (
                  <li
                    key={p.id}
                    className={`text-[11px] flex items-center gap-1.5 ${props[p.id] ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}
                  >
                    <span aria-hidden="true">{props[p.id] ? '✓' : '○'}</span>
                    {p.short}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2">
        <h3 className="font-space font-bold text-amber-900 text-sm">Les pièges à éviter</h3>
        <ul className="text-sm text-amber-900 space-y-1.5">
          <li>❌ « ça ressemble à un carré » &nbsp;→&nbsp; ✅ mesurer côtés et angles</li>
          <li>❌ compter un sommet de plus que les côtés &nbsp;→&nbsp; ✅ autant de sommets que de côtés</li>
          <li>❌ « un carré n’est pas un rectangle » &nbsp;→&nbsp; ✅ c’est un rectangle particulier</li>
          <li>❌ conclure sur un seul indice &nbsp;→&nbsp; ✅ 4 côtés égaux = carré OU losange</li>
        </ul>
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
      moduleTitle="🏆 Mission finale : le vitrail"
      moduleSubtitle="Dix épreuves d’expertise : reconnaître, comparer, caractériser."
      estimatedTime="8 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={600}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Défi final',
        title: 'Le maître verrier veut des figures exactes.',
        body: (
          <p>
            Dix épreuves, une seule validation à la fin. Méfie-toi de ce qui « a l’air » juste : vérifie les
            propriétés.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '⬜', label: 'Carré', value: '4 = + 4 ⊥' },
        { id: 'r2', emoji: '▭', label: 'Rectangle', value: '4 ⊥' },
        { id: 'r3', emoji: '◇', label: 'Losange', value: '4 =' },
        { id: 'r4', emoji: '🔺', label: 'Triangle', value: '3 côtés' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître des figures !',
        title: 'Mission accomplie !',
        message:
          'Tu caractérises les figures par leurs propriétés, tu sais les comparer, les identifier à partir d’indices et les construire sous contraintes. La leçon suivante fera bouger ces figures : la symétrie.',
        verbs: ['Reconnaître', 'Caractériser', 'Comparer', 'Construire'],
        masterBadgeLabel: 'Sans aucune erreur',
      }}
      xpPerCorrect={10}
    />
  );
}
