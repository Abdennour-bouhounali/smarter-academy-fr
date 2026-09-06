import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import MirrorLab from '../components/MirrorLab';
import FoldCard from '../components/FoldCard';
import {
  lineThrough, countSymmetryAxes, CONSERVEES, NON_CONSERVEES,
} from '../components/symetrieUtils';

/**
 * Module 8 — ÉVALUATION (« Boss final »).
 *
 * Fichier de DONNÉES : le moteur vit dans common/kit/BossFinal.jsx.
 *
 * Distracteurs, tous adossés à un piège réellement travaillé :
 *   - juger la symétrie « à l'œil »                     (module 1)
 *   - la diagonale du rectangle prise pour un axe       (module 2)
 *   - une seule des deux conditions                     (modules 3-5)
 *   - croire que la symétrie agrandit ou réduit         (module 7)
 *
 * Couverture des LP : P1(e1) P2(e2) P3(e3) P4(e4) P5(e5) P6(e6) P7(e7)
 * P8(e8) P9(e9) P10(e10) — les 10 learning points sont évalués.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 240, yMax: 180 };
const AXE_V = lineThrough({ x: 120, y: 0 }, { x: 120, y: 180 });

const RECT = [{ x: 35, y: 60 }, { x: 205, y: 60 }, { x: 205, y: 140 }, { x: 35, y: 140 }];
const CARRE = [{ x: 60, y: 40 }, { x: 180, y: 40 }, { x: 180, y: 160 }, { x: 60, y: 160 }];
const SYM = [
  { x: 120, y: 30 }, { x: 190, y: 90 }, { x: 155, y: 150 },
  { x: 85, y: 150 }, { x: 50, y: 90 },
];

const SKILLS = {
  principe: { label: 'Le principe du pliage', module: 1 },
  axes: { label: 'Identifier et compter les axes', module: 2 },
  relation: { label: 'La relation point / image', module: 3 },
  construire: { label: 'Construire un symétrique', module: 4 },
  conserve: { label: 'Ce que la symétrie conserve', module: 5 },
  resoudre: { label: 'Résoudre un problème', module: 7 },
};

const EPREUVES = [
  {
    id: 'sy-e1',
    requires: ['symetrie-pliage', 'axe-symetrie'],
    skill: 'principe',
    title: 'Épreuve 1 — Le critère',
    prompt: 'Une figure est symétrique par rapport à une droite quand…',
    extra: <FoldCard points={SYM} axis={AXE_V} folded={false} box={BOX} label="Une figure et son pli" />,
    options: [
      'En pliant le long de cette droite, les deux moitiés se superposent exactement',
      'Ses deux moitiés se ressemblent beaucoup',
      'Elle est bien équilibrée à gauche et à droite',
    ],
    cols: 1,
    correct: 0,
    explain:
      'La superposition doit être EXACTE, point par point. « Se ressembler » n’est pas un critère géométrique.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_symetrie_P1'] },
  },
  {
    id: 'sy-e2',
    requires: ['nombre-axes', 'axe-symetrie'],
    skill: 'axes',
    title: 'Épreuve 2 — La diagonale du rectangle',
    prompt: 'La diagonale d’un rectangle est-elle un axe de symétrie ?',
    extra: <FoldCard points={RECT} axis={AXE_V} folded={false} box={BOX} label="Un rectangle" />,
    options: [
      'Non : en pliant sur la diagonale, les coins ne se superposent pas',
      'Oui : elle partage le rectangle en deux triangles égaux',
      'Oui, si le rectangle est assez allongé',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Deux triangles de même aire ne se superposent pas forcément par pliage. Un rectangle n’a que 2 axes : ses deux plis du milieu.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_symetrie_P2'] },
  },
  {
    id: 'sy-e3',
    requires: ['nombre-axes', 'axe-symetrie'],
    skill: 'axes',
    title: 'Épreuve 3 — Combien d’axes ?',
    prompt: 'Combien d’axes de symétrie possède un carré ?',
    extra: <FoldCard points={CARRE} axis={AXE_V} folded={false} box={BOX} label="Un carré" />,
    options: [`${countSymmetryAxes(CARRE)} axes`, '2 axes', '1 axe'],
    cols: 3,
    correct: 0,
    explain:
      'Le carré en a 4 : ses deux plis du milieu et ses deux diagonales. C’est l’égalité de ses côtés qui rend les diagonales pliables — ce qui est faux pour le rectangle.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_symetrie_P3'] },
  },
  {
    id: 'sy-e4',
    requires: ['symetrique-point'],
    skill: 'relation',
    title: 'Épreuve 4 — La distance',
    prompt: 'Un point M est à 6 cm de l’axe. À quelle distance de l’axe se trouve son symétrique M′ ?',
    options: ['6 cm', '12 cm', '3 cm'],
    cols: 3,
    correct: 0,
    explain:
      'Le symétrique est toujours à la MÊME distance de l’axe, de l’autre côté. Le pliage ne change pas les distances.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_symetrie_P4'] },
  },
  {
    id: 'sy-e5',
    requires: ['symetrique-point', 'axe-symetrie'],
    skill: 'construire',
    title: 'Épreuve 5 — Construire',
    prompt: 'Pour construire le symétrique d’un point M par rapport à une droite (d), que faut-il faire ?',
    options: [
      'Tracer la perpendiculaire à (d) passant par M, puis reporter la même distance de l’autre côté',
      'Tracer une parallèle à (d) passant par M',
      'Mesurer la distance de M à (d) et la reporter n’importe où de l’autre côté',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Les deux gestes, dans cet ordre : la perpendiculaire donne la direction, la distance égale donne la position.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_symetrie_P5'] },
  },
  {
    id: 'sy-e6',
    requires: ['symetrique-figure', 'symetrique-point'],
    skill: 'construire',
    title: 'Épreuve 6 — Le symétrique d’une figure',
    prompt: 'Comment construit-on le symétrique d’un triangle ABC ?',
    options: [
      'En construisant le symétrique de chacun de ses trois sommets, puis en les reliant',
      'En recopiant le triangle à l’œil de l’autre côté',
      'En mesurant seulement le côté le plus long',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Une figure se construit sommet par sommet : chaque sommet suit la même règle que le point isolé, puis on relie.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_symetrie_P6'] },
  },
  {
    id: 'sy-e7',
    requires: ['symetrique-point', 'axe-symetrie'],
    skill: 'relation',
    title: 'Épreuve 7 — L’angle du trait',
    prompt: 'Quel angle le trait qui joint un point M à son image M′ forme-t-il avec l’axe de symétrie ?',
    extra: (
      <MirrorLab
        axis={AXE_V}
        points={[{ x: 55, y: 70 }]}
        showDistances={false}
        disabled
        box={{ xMin: 0, yMin: 0, xMax: 240, yMax: 180 }}
        ariaLabel="Un point, son image, et le trait qui les relie"
      />
    ),
    options: ['Un angle droit (90°)', 'Un angle de 45°', 'Cela dépend de la position de M'],
    cols: 1,
    correct: 0,
    explain:
      'Toujours un angle droit : c’est la première des deux conditions. Le trait [MM′] est perpendiculaire à l’axe, quelle que soit la position de M.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_symetrie_P7'] },
  },
  {
    id: 'sy-e8',
    requires: ['symetrique-point', 'axe-oblique'],
    skill: 'relation',
    title: 'Épreuve 8 — Une seule condition ?',
    prompt:
      'Un élève place un point à la bonne distance de l’axe, mais pas en face de M. A-t-il construit le symétrique ?',
    options: [
      'Non : il manque la perpendicularité de [MM′] à l’axe',
      'Oui : la distance est la seule chose qui compte',
      'Oui, si le point est de l’autre côté',
    ],
    cols: 1,
    correct: 0,
    explain:
      'À distance égale de l’axe, il existe une infinité de points. Seule la perpendicularité en désigne un — le bon.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_symetrie_P8'] },
  },
  {
    id: 'sy-e9',
    requires: ['conservation'],
    skill: 'conserve',
    title: 'Épreuve 9 — Ce qui ne change pas',
    prompt: 'Parmi ces propositions, qu’est-ce que la symétrie axiale NE conserve PAS ?',
    options: [
      'La position de la figure dans le plan',
      'Les longueurs des côtés',
      'La mesure des angles',
    ],
    cols: 1,
    correct: 0,
    explain:
      'La symétrie conserve longueurs, angles, périmètre et aire : elle DÉPLACE la figure sans la déformer. Seules la position et le sens de lecture changent.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_symetrie_P9'] },
  },
  {
    id: 'sy-e10',
    requires: ['mem-deduire', 'conservation', 'axe-symetrie'],
    skill: 'resoudre',
    title: 'Épreuve 10 — Le logo',
    prompt:
      'Un logo est fait d’un motif et de son symétrique. Le motif mesure 24 cm² d’aire. Quelle est l’aire totale du logo ?',
    options: ['48 cm²', '24 cm²', '12 cm²'],
    cols: 3,
    correct: 0,
    explain:
      'L’image a la même aire que le motif (la symétrie la conserve), et les deux moitiés ne se chevauchent pas : 24 + 24 = 48 cm².',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_symetrie_P10'] },
  },
];

const BADGES = [
  { id: 'b-pli', emoji: '🏅', label: 'Plieur exact — le principe maîtrisé', test: (m) => !m.principe },
  { id: 'b-axes', emoji: '🏅', label: 'Chasseur d’axes', test: (m) => !m.axes },
  { id: 'b-rel', emoji: '🏅', label: 'Les deux conditions, toujours', test: (m) => !m.relation },
  { id: 'b-cons', emoji: '🏅', label: 'Constructeur de symétriques', test: (m) => !m.construire },
  { id: 'b-conserve', emoji: '🏅', label: 'Gardien des conservations', test: (m) => !m.conserve },
  { id: 'b-res', emoji: '🏅', label: 'Résolveur malin', test: (m) => !m.resoudre },
];

/** Synthèse : la leçon revue à travers ses propres manipulations, figées. */
function Synthese() {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-space font-extrabold text-slate-900">Le miroir, en deux conditions</h2>
        <p className="text-sm text-slate-500">
          Un pliage exact — et tout ce qui ne change pas en chemin.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <MirrorLab
          axis={AXE_V}
          points={[{ x: 55, y: 60 }]}
          showDistances
          disabled
          box={BOX}
          ariaLabel="Un point, son image, la perpendiculaire et l’égalité des distances"
        />
        <p className="text-sm text-slate-600 text-center">
          <strong>[MM′] ⊥ (d)</strong> et <strong>M, M′ à égale distance de (d)</strong> — les deux
          ensemble, jamais l’une sans l’autre.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 space-y-1.5">
          <h3 className="font-space font-bold text-emerald-900 text-sm">La symétrie conserve</h3>
          <ul className="text-sm text-emerald-900 space-y-1">
            {CONSERVEES.map((c) => (
              <li key={c.id}>✓ {c.label}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 space-y-1.5">
          <h3 className="font-space font-bold text-rose-900 text-sm">Elle change</h3>
          <ul className="text-sm text-rose-900 space-y-1">
            {NON_CONSERVEES.map((c) => (
              <li key={c.id}>✗ {c.label}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* La synthèse PRÉSENTE la carte complète, elle ne la réécrit pas. */}
      <KnowledgeSnapshot complete variant="complete" />

      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2">
        <h3 className="font-space font-bold text-amber-900 text-sm">Les pièges à éviter</h3>
        <ul className="text-sm text-amber-900 space-y-1.5">
          <li>❌ juger la symétrie à l’œil &nbsp;→&nbsp; ✅ le pliage doit être exact</li>
          <li>❌ la diagonale d’un rectangle est un axe &nbsp;→&nbsp; ✅ il n’en a que 2, ses plis du milieu</li>
          <li>❌ la bonne distance suffit &nbsp;→&nbsp; ✅ il faut AUSSI la perpendiculaire</li>
          <li>❌ la symétrie agrandit ou réduit &nbsp;→&nbsp; ✅ elle conserve tout, elle déplace</li>
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
      moduleTitle="🏆 Mission finale : le papillon"
      moduleSubtitle="Dix épreuves : axes, images, constructions et conservations."
      estimatedTime="8 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={600}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Défi final',
        title: 'Les ailes doivent se replier parfaitement.',
        body: (
          <p>
            Dix épreuves, une seule validation à la fin. Souviens-toi : deux conditions, jamais une seule.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🪞', label: 'Axe', value: '(d)' },
        { id: 'r2', emoji: '📐', label: 'Condition 1', value: '⊥' },
        { id: 'r3', emoji: '📏', label: 'Condition 2', value: '=' },
        { id: 'r4', emoji: '🦋', label: 'Conservé', value: 'tout' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître du miroir !',
        title: 'Mission accomplie !',
        message:
          'Tu sais reconnaître une symétrie, compter les axes, construire l’image d’un point et d’une figure, et te servir des conservations pour déduire. La leçon suivante quitte le plan : les solides et leurs patrons.',
        verbs: ['Reconnaître', 'Construire', 'Déduire', 'Vérifier'],
        masterBadgeLabel: 'Sans aucune erreur',
      }}
      xpPerCorrect={10}
    />
  );
}
