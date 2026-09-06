import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import RelationFigure from '../components/RelationFigure';
import { RELATIONS, RELATION_LABEL } from '../components/relationsUtils';

/**
 * Module 9 — ÉVALUATION (« Boss final »).
 *
 * Fichier de DONNÉES : le moteur vit dans common/kit/BossFinal.jsx.
 *
 * Distracteurs, tous adossés à un piège réellement travaillé :
 *   - « ça a l'air parallèle sur le dessin »           (module 1)
 *   - l'écart mesuré en diagonale plutôt que d'équerre  (modules 2, 8)
 *   - perpendiculaire = vertical + horizontal           (module 3)
 *   - « parallèle » employé sans dire à quoi            (module 4)
 *   - équerre posée à moitié bien                       (module 5)
 *   - parallèle tracée « à la même pente », à l'œil     (module 7)
 *
 * Couverture des LP : P1(e1) P2(e2) P3(e3) P4(e4) P5(e5) P6(e6) P7(e7)
 * P8(e8) P9(e9) P10(e10) — les 10 learning points sont évalués.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 300, yMax: 150 };

const SKILLS = {
  reconnaitre: { label: 'Reconnaître les deux relations', module: 2 },
  angleDroit: { label: 'L’angle droit et la perpendicularité', module: 3 },
  situations: { label: 'Repérer les relations en situation', module: 4 },
  verifier: { label: 'Vérifier avec les instruments', module: 5 },
  construire: { label: 'Construire parallèle et perpendiculaire', module: 7 },
  distance: { label: 'Le plus court chemin', module: 8 },
};

const PAR = [
  { p: { x: 20, y: 45 }, angleDeg: 12, name: 'd₁' },
  { p: { x: 20, y: 100 }, angleDeg: 12, name: 'd₂' },
];
const PERP = [
  { p: { x: 150, y: 70 }, angleDeg: 25, name: 'd₁' },
  { p: { x: 150, y: 70 }, angleDeg: 115, name: 'd₂' },
];

const EPREUVES = [
  {
    id: 'pp-e1',
    requires: ['droites-paralleles', 'ecart-constant', 'mesurer-ecart'],
    skill: 'reconnaitre',
    title: 'Épreuve 1 — Deux rues',
    prompt:
      'Deux rues gardent exactement le même écart sur toute leur longueur, mesuré perpendiculairement. Que peut-on affirmer ?',
    extra: <RelationFigure droites={PAR} box={BOX} ariaLabel="Deux droites à écart constant" />,
    options: [
      'Elles sont parallèles',
      'Elles sont perpendiculaires',
      'On ne peut rien dire sans les prolonger à l’infini',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Écart constant ⟺ parallèles. C’est justement le critère qui évite d’avoir à prolonger à l’infini.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_parallelisme-perpendicularite_P1'] },
  },
  {
    id: 'pp-e2',
    requires: ['droites-paralleles', 'ecart-constant'],
    skill: 'reconnaitre',
    title: 'Épreuve 2 — Le piège du dessin',
    prompt:
      'Sur une feuille, deux droites ne se coupent pas. Peut-on en conclure qu’elles sont parallèles ?',
    options: [
      'Non : elles pourraient se couper au-delà de la feuille',
      'Oui : si elles ne se coupent pas, elles sont parallèles',
      'Oui, à condition que la feuille soit assez grande',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Deux droites d’inclinaisons très proches semblent parallèles sur un petit morceau, mais finissent par se couper. Il faut vérifier l’écart, pas se fier au cadre du dessin.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_parallelisme-perpendicularite_P2'] },
  },
  {
    id: 'pp-e3',
    requires: ['droites-perpendiculaires', 'orientation-sans-importance'],
    skill: 'angleDroit',
    title: 'Épreuve 3 — Deux droites obliques',
    prompt: 'Ces deux droites sont toutes deux inclinées et se coupent en formant un angle droit. Sont-elles perpendiculaires ?',
    extra: <RelationFigure droites={PERP} box={BOX} ariaLabel="Deux droites obliques perpendiculaires" />,
    options: [
      'Oui : c’est l’angle entre elles qui compte, pas leur inclinaison',
      'Non : il faudrait une verticale et une horizontale',
      'Seulement si on tourne la feuille',
    ],
    cols: 1,
    correct: 0,
    explain:
      'La perpendicularité ne dépend pas de l’orientation sur la page : deux droites obliques formant 90° sont perpendiculaires.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_parallelisme-perpendicularite_P3'] },
  },
  {
    id: 'pp-e4',
    requires: ['droites-perpendiculaires', 'secantes'],
    skill: 'angleDroit',
    title: 'Épreuve 4 — Presque droit',
    prompt: 'Deux droites se coupent en formant un angle de 88°. Sont-elles perpendiculaires ?',
    options: [
      'Non : il faut exactement 90°',
      'Oui : 88°, c’est pratiquement un angle droit',
      'Oui, si le dessin est fait à main levée',
    ],
    cols: 1,
    correct: 0,
    explain:
      'La perpendicularité est une propriété exacte. À 88°, la marque d’angle droit ne peut pas être placée : les droites sont sécantes, pas perpendiculaires.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_parallelisme-perpendicularite_P4'] },
  },
  {
    id: 'pp-e5',
    requires: ['relation-binaire', 'droites-perpendiculaires'],
    skill: 'situations',
    title: 'Épreuve 5 — Une phrase incomplète',
    prompt: 'Un élève écrit : « la rue des Lilas est perpendiculaire ». Que manque-t-il ?',
    options: [
      'À quoi elle est perpendiculaire : c’est une relation entre DEUX droites',
      'Rien, la phrase est correcte',
      'La longueur de la rue',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Parallèle et perpendiculaire lient toujours deux droites. Une droite seule n’est ni l’une ni l’autre.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_parallelisme-perpendicularite_P5'] },
  },
  {
    id: 'pp-e6',
    requires: ['ecart-constant', 'mesurer-ecart', 'droites-paralleles'],
    skill: 'verifier',
    title: 'Épreuve 6 — Vérifier un parallélisme',
    prompt: 'Avec une règle graduée, comment vérifier que deux droites tracées sont bien parallèles ?',
    options: [
      'Mesurer l’écart perpendiculairement en deux endroits éloignés : il doit être identique',
      'Mesurer la longueur des deux droites : elles doivent être égales',
      'Vérifier qu’elles ne se touchent pas au milieu de la feuille',
    ],
    cols: 1,
    correct: 0,
    explain:
      'On contrôle l’écart, perpendiculairement, en deux endroits éloignés. Une droite n’a d’ailleurs pas de longueur : elle est infinie.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_parallelisme-perpendicularite_P6'] },
  },
  {
    id: 'pp-e7',
    requires: ['rituel-equerre', 'droites-perpendiculaires'],
    skill: 'verifier',
    title: 'Épreuve 7 — L’équerre à moitié posée',
    prompt:
      'On veut vérifier que la droite d′ est perpendiculaire à d en A. L’équerre est bien orientée le long de d, mais son sommet est à 2 cm de A. Que conclure ?',
    options: [
      'Rien pour le point A : l’angle droit de l’équerre n’est pas au bon endroit',
      'Que d′ est perpendiculaire à d, puisque l’équerre est bien orientée',
      'Que d′ est parallèle à d',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Le rituel a DEUX conditions : un côté le long de la droite, et le sommet sur le point. Si le sommet est ailleurs, l’angle droit contrôlé n’est pas celui de A.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_parallelisme-perpendicularite_P7'] },
  },
  {
    id: 'pp-e8',
    requires: ['construire-parallele', 'mem-deux-perp', 'droites-paralleles'],
    skill: 'construire',
    title: 'Épreuve 8 — Tracer une parallèle',
    prompt: 'Quelle méthode garantit de tracer une droite parallèle à d passant par un point B ?',
    options: [
      'Tracer deux perpendiculaires successives, avec l’équerre',
      'Tracer à l’œil un trait qui semble ne jamais rejoindre d',
      'Tracer un trait qui ne touche pas d sur la feuille',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Deux droites perpendiculaires à une même troisième sont parallèles entre elles : c’est ce qui rend la construction sûre. L’œil, lui, ne garantit rien.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_parallelisme-perpendicularite_P8'] },
  },
  {
    id: 'pp-e9',
    requires: ['unicite-perpendiculaire', 'droites-perpendiculaires'],
    skill: 'construire',
    title: 'Épreuve 9 — Combien de perpendiculaires ?',
    prompt: 'Par un point A donné, combien peut-on tracer de droites perpendiculaires à une droite d ?',
    options: [
      'Une seule',
      'Deux : une de chaque côté',
      'Une infinité',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Par un point donné, il passe exactement UNE perpendiculaire à une droite donnée. C’est ce qui rend la construction à l’équerre non ambiguë.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_parallelisme-perpendicularite_P9'] },
  },
  {
    id: 'pp-e10',
    requires: ['distance-point-droite', 'droites-perpendiculaires'],
    skill: 'distance',
    title: 'Épreuve 10 — Rejoindre la route',
    prompt:
      'Une maison M doit être reliée à une route rectiligne par le chemin le plus court. Où doit arriver ce chemin ?',
    options: [
      'Perpendiculairement à la route',
      'À l’endroit de la route le plus à gauche',
      'En diagonale, pour couper au plus court',
    ],
    cols: 1,
    correct: 0,
    explain:
      'La distance d’un point à une droite se mesure perpendiculairement : tout autre trajet est plus long. C’est ce que tu as vérifié en déplaçant le point d’arrivée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_parallelisme-perpendicularite_P10'] },
  },
];

const BADGES = [
  { id: 'b-reco', emoji: '🏅', label: 'Œil du géomètre — reconnaissance parfaite', test: (m) => !m.reconnaitre },
  { id: 'b-angle', emoji: '🏅', label: 'Gardien de l’angle droit', test: (m) => !m.angleDroit },
  { id: 'b-situ', emoji: '🏅', label: 'Chasseur de relations', test: (m) => !m.situations },
  { id: 'b-verif', emoji: '🏅', label: 'Maître de l’équerre', test: (m) => !m.verifier },
  { id: 'b-cons', emoji: '🏅', label: 'Constructeur rigoureux', test: (m) => !m.construire },
  { id: 'b-dist', emoji: '🏅', label: 'Traceur de plus court chemin', test: (m) => !m.distance },
];

/** Synthèse : les deux relations et leurs marques, figées. */
function Synthese() {
  const ROUTE = { p: { x: 15, y: 120 }, angleDeg: -12, name: 'd' };
  const M = { x: 165, y: 45 };
  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-space font-extrabold text-slate-900">Deux relations, deux marques</h2>
        <p className="text-sm text-slate-500">
          Les marques ne sont pas décoratives : elles n’apparaissent que si la propriété est exacte.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-sky-200 bg-white p-3 space-y-2">
          <RelationFigure droites={PAR} box={BOX} ariaLabel="Deux droites parallèles avec leurs chevrons" />
          <div className="text-center">
            <div className="font-mono font-extrabold text-lg text-sky-700">d₁ // d₂</div>
            <p className="text-xs text-slate-600">
              Jamais de point commun · écart constant, mesuré perpendiculairement
            </p>
          </div>
        </div>
        <div className="rounded-2xl border-2 border-emerald-200 bg-white p-3 space-y-2">
          <RelationFigure droites={PERP} box={BOX} ariaLabel="Deux droites perpendiculaires avec le carré d’angle droit" />
          <div className="text-center">
            <div className="font-mono font-extrabold text-lg text-emerald-700">d₁ ⊥ d₂</div>
            <p className="text-xs text-slate-600">Angle droit exact · l’inclinaison sur la page n’y change rien</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
        <h3 className="font-space font-bold text-slate-800 text-sm text-center">
          Et le lien entre les deux
        </h3>
        <RelationFigure
          droites={[ROUTE]}
          points={[{ ...M, name: 'M', color: '#e11d48' }]}
          distanceFrom={M}
          box={BOX}
          ariaLabel="Distance du point M à la droite, mesurée perpendiculairement"
        />
        <p className="text-sm text-slate-600 text-center">
          La distance d’un point à une droite — et l’écart entre deux parallèles — se mesurent toutes deux{' '}
          <strong>perpendiculairement</strong>. C’est le plus court chemin.
        </p>
      </div>

      {/* La synthèse PRÉSENTE la carte complète, elle ne la réécrit pas. */}
      <KnowledgeSnapshot complete variant="complete" />

      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2">
        <h3 className="font-space font-bold text-amber-900 text-sm">Les pièges à éviter</h3>
        <ul className="text-sm text-amber-900 space-y-1.5">
          <li>❌ « elles ne se coupent pas sur la feuille » &nbsp;→&nbsp; ✅ vérifier l’écart, en deux endroits</li>
          <li>❌ perpendiculaire = vertical + horizontal &nbsp;→&nbsp; ✅ 90° exactement, quelle que soit l’inclinaison</li>
          <li>❌ « la rue est parallèle » &nbsp;→&nbsp; ✅ parallèle à QUOI ? c’est une relation</li>
          <li>❌ mesurer l’écart en diagonale &nbsp;→&nbsp; ✅ toujours perpendiculairement</li>
        </ul>
      </div>
    </div>
  );
}

export default function Module09MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(9)}
      moduleNumber={9}
      moduleTitle="🏆 Mission finale : le plan du quartier"
      moduleSubtitle="Dix épreuves d’urbaniste : rues, trottoirs et distances."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={600}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Défi final',
        title: 'Le plan du quartier passe au contrôle.',
        body: (
          <p>
            Dix épreuves, une seule validation à la fin. Méfie-toi de ce qui « a l’air » juste : vérifie les
            marques et les écarts.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🛤️', label: 'Parallèles', value: '//' },
        { id: 'r2', emoji: '📐', label: 'Perpendiculaires', value: '⊥' },
        { id: 'r3', emoji: '📏', label: 'Écart', value: 'constant' },
        { id: 'r4', emoji: '🎯', label: 'Angle droit', value: '90°' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître des deux relations !',
        title: 'Mission accomplie !',
        message:
          'Tu reconnais, vérifies et construis des droites parallèles et perpendiculaires, et tu sais mesurer la distance d’un point à une droite. Ces deux relations sont la base de toutes les figures que tu rencontreras ensuite.',
        verbs: ['Reconnaître', 'Vérifier', 'Construire', 'Mesurer'],
        masterBadgeLabel: 'Sans aucune erreur',
      }}
      xpPerCorrect={10}
    />
  );
}
