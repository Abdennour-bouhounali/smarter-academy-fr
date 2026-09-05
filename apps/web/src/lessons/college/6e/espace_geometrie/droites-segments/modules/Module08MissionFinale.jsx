import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import GeoFigure from '../components/GeoFigure';
import { KINDS, KIND_LABEL, notationOf, extentSentence, endpointCount } from '../components/droitesUtils';

/**
 * Module 8 — ÉVALUATION (« Boss final »).
 *
 * Fichier de DONNÉES : le moteur (silence jusqu'au submit unique, correction,
 * profil, evidence, persistance) vit dans common/kit/BossFinal.jsx.
 *
 * Distracteurs, tous adossés à un piège réellement travaillé :
 *   - « une droite est un segment très long »        (module 1)
 *   - compter les extrémités de travers               (module 2)
 *   - juger l'objet à son apparence dessinée          (module 3)
 *   - « ça a l'air aligné », le milieu sans égalité   (module 4)
 *   - confondre [AB] / (AB) / [AB)                    (module 5)
 *   - [AB) et [BA) pris pour le même objet            (module 6)
 *
 * Couverture des LP : P1(e1) P2(e2) P3(e3) P4(e4,e5) P5(e6) P6(e7,e8)
 * P7(e9) P8(e10) P9(e9) — les 9 learning points sont évalués.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 300, yMax: 150 };
const A = { x: 70, y: 105 };
const B = { x: 200, y: 55 };

const SKILLS = {
  reconnaitre: { label: 'Reconnaître les trois objets', module: 3 },
  extremites: { label: 'Identifier les extrémités', module: 2 },
  points: { label: 'Le rôle des points sur une droite', module: 4 },
  notation: { label: 'Utiliser les notations', module: 5 },
  construire: { label: 'Construire et prolonger', module: 6 },
  decrire: { label: 'Décrire une figure', module: 7 },
};

const fig = (kind, ariaLabel) => (
  <GeoFigure
    objects={[{ kind, a: A, b: B, nameA: 'A', nameB: 'B' }]}
    box={BOX}
    ariaLabel={ariaLabel}
  />
);

const EPREUVES = [
  {
    id: 'ds-e1',
    skill: 'reconnaitre',
    title: 'Épreuve 1 — Qu’est-ce que c’est ?',
    prompt: 'Cette figure ne s’arrête d’aucun côté : les deux bouts portent une flèche. De quel objet s’agit-il ?',
    extra: fig('droite', 'Trait fléché aux deux bouts'),
    options: ['Une droite', 'Un segment très long', 'Une demi-droite'],
    cols: 3,
    correct: 0,
    explain:
      'Aucune extrémité ⇒ une droite. Une droite n’est pas « un segment très long » : même immense, un segment garde deux bouts.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_droites-segments_P1'] },
  },
  {
    id: 'ds-e2',
    skill: 'reconnaitre',
    title: 'Épreuve 2 — Deux bouts',
    prompt: 'Cette figure s’arrête des deux côtés, sur deux points bien marqués. De quel objet s’agit-il ?',
    extra: fig('segment', 'Trait s’arrêtant sur deux points'),
    options: ['Un segment', 'Une droite', 'Une demi-droite'],
    cols: 3,
    correct: 0,
    explain: 'Deux extrémités ⇒ un segment. C’est le seul des trois objets qui soit borné des deux côtés.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_droites-segments_P2'] },
  },
  {
    id: 'ds-e3',
    skill: 'reconnaitre',
    title: 'Épreuve 3 — Un seul bout',
    prompt: 'Cette figure part d’un point A et continue sans fin de l’autre côté. De quel objet s’agit-il ?',
    extra: fig('demi-droite', 'Trait partant de A et fléché de l’autre côté'),
    options: ['Une demi-droite d’origine A', 'Un segment', 'Une droite'],
    cols: 1,
    correct: 0,
    explain:
      'Une seule extrémité ⇒ une demi-droite, et cette extrémité est son origine. Elle est infinie, comme une droite, mais d’un seul côté.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_droites-segments_P3'] },
  },
  {
    id: 'ds-e4',
    skill: 'reconnaitre',
    title: 'Épreuve 4 — La vraie différence',
    prompt: 'Trois objets passent par les mêmes points A et B. Qu’est-ce qui les distingue ?',
    options: [
      'Leur étendue : jusqu’où ils vont',
      'Leur longueur dessinée',
      'Leur direction',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Même droite support, même direction : la seule variable est l’étendue, c’est-à-dire le nombre d’extrémités.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_droites-segments_P4'] },
  },
  {
    id: 'ds-e5',
    skill: 'reconnaitre',
    title: 'Épreuve 5 — Sur le dessin',
    prompt:
      'Sur une feuille, une droite paraît toujours courte : elle s’arrête au bord du papier. Que faut-il en conclure ?',
    options: [
      'Rien : le bord de la feuille n’est pas une extrémité de la droite',
      'Que la droite est en réalité un segment',
      'Que la droite mesure la largeur de la feuille',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Le dessin n’en montre qu’un morceau. Les flèches signalent justement que l’objet continue au-delà de ce qu’on voit.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_droites-segments_P4'] },
  },
  {
    id: 'ds-e6',
    skill: 'extremites',
    title: 'Épreuve 6 — Compter les extrémités',
    prompt: 'Combien d’extrémités possède une demi-droite ?',
    options: ['1 seule : son origine', 'Aucune', '2, comme un segment'],
    cols: 1,
    correct: 0,
    explain:
      'Une demi-droite a exactement une extrémité, son origine ; de l’autre côté, elle continue sans fin.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_droites-segments_P5'] },
  },
  {
    id: 'ds-e7',
    skill: 'points',
    title: 'Épreuve 7 — Presque aligné',
    prompt:
      'Un point P est à 2 mm de la droite (AB). Sur le dessin, il a l’air posé dessus. Appartient-il à (AB) ?',
    options: [
      'Non : sa distance à la droite n’est pas nulle',
      'Oui : 2 mm, c’est négligeable',
      'Oui, si on trace avec une règle épaisse',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Appartenir à une droite est une propriété exacte : la distance doit valoir 0. « Presque aligné » n’existe pas en géométrie.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_droites-segments_P6'] },
  },
  {
    id: 'ds-e8',
    skill: 'points',
    title: 'Épreuve 8 — Le milieu',
    prompt: 'Un point M vérifie AM = MB, mais il est situé au-dessus de la droite (AB). Est-ce le milieu de [AB] ?',
    options: [
      'Non : le milieu doit aussi appartenir au segment',
      'Oui : AM = MB, c’est la définition',
      'Oui, à condition que AM soit assez grand',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Le milieu vérifie DEUX conditions : appartenir à [AB] et vérifier AM = MB. L’égalité seule décrit tous les points à égale distance de A et de B, pas seulement le milieu.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_droites-segments_P6'] },
  },
  {
    id: 'ds-e9',
    skill: 'notation',
    title: 'Épreuve 9 — Lire une écriture',
    prompt: 'Dans une description de figure, que désigne l’écriture [AB) ?',
    options: [
      'La demi-droite d’origine A passant par B',
      'Le segment d’extrémités A et B',
      'La droite passant par A et B',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Le crochet ferme du côté de A (extrémité), la parenthèse ouvre du côté de B (ça continue) : c’est la demi-droite d’origine A. [AB] serait le segment, (AB) la droite.',
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['6e_droites-segments_P7', '6e_droites-segments_P9'],
    },
  },
  {
    id: 'ds-e10',
    skill: 'construire',
    title: 'Épreuve 10 — Deux demi-droites',
    prompt: 'Les écritures [AB) et [BA) désignent-elles le même objet ?',
    options: [
      'Non : elles ont des origines différentes, donc des sens opposés',
      'Oui : ce sont les mêmes points',
      'Oui : elles sont sur la même droite',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Elles partagent la même droite support, mais [AB) part de A vers B et [BA) part de B vers A : ce sont deux objets différents. L’origine d’une demi-droite fait partie de sa définition.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_droites-segments_P8'] },
  },
];

const BADGES = [
  { id: 'b-reco', emoji: '🏅', label: 'Trieur de traits — reconnaissance parfaite', test: (m) => !m.reconnaitre },
  { id: 'b-ext', emoji: '🏅', label: 'Chasseur d’extrémités', test: (m) => !m.extremites },
  { id: 'b-pts', emoji: '🏅', label: 'Œil exact — alignement et milieu', test: (m) => !m.points },
  { id: 'b-not', emoji: '🏅', label: 'Maître des crochets', test: (m) => !m.notation },
  { id: 'b-cons', emoji: '🏅', label: 'Constructeur rigoureux', test: (m) => !m.construire },
];

/** Synthèse : les trois objets côte à côte, figés — la leçon en un écran. */
function Synthese() {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-space font-extrabold text-slate-900">Les trois objets, une seule idée</h2>
        <p className="text-sm text-slate-500">
          Mêmes points A et B. Seule change l’étendue — et tout le reste en découle.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {KINDS.map((k) => (
          <div key={k} className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
            <GeoFigure
              objects={[{ kind: k, a: A, b: B, nameA: 'A', nameB: 'B' }]}
              box={BOX}
              ariaLabel={`${KIND_LABEL[k]} : ${extentSentence(k)}`}
            />
            <div className="text-center">
              <div className="font-mono font-extrabold text-lg text-slate-900">
                {notationOf({ kind: k }, 'A', 'B')}
              </div>
              <div className="text-xs font-bold text-slate-700 capitalize">{KIND_LABEL[k]}</div>
              <div className="text-[11px] text-slate-500 mt-1">{extentSentence(k)}</div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                {endpointCount(k)} extrémité{endpointCount(k) > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2">
        <h3 className="font-space font-bold text-amber-900 text-sm">Les pièges à éviter</h3>
        <ul className="text-sm text-amber-900 space-y-1.5">
          <li>❌ « une droite est un segment très long » &nbsp;→&nbsp; ✅ un segment a toujours deux bouts</li>
          <li>❌ « ça a l’air aligné » &nbsp;→&nbsp; ✅ la distance à la droite doit valoir 0</li>
          <li>❌ le milieu = « à peu près au centre » &nbsp;→&nbsp; ✅ sur [AB] et AM = MB</li>
          <li>❌ [AB) = [BA) &nbsp;→&nbsp; ✅ deux origines, deux sens</li>
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
      moduleTitle="🏆 Mission finale : le skatepark"
      moduleSubtitle="Dix épreuves pour trancher entre droite, segment et demi-droite."
      estimatedTime="10 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={600}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Défi final',
        title: 'Le plan du skatepark passe au contrôle.',
        body: (
          <p>
            Dix épreuves, une seule validation à la fin. Prends le temps de regarder les bouts de chaque
            trait avant de répondre.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '📏', label: 'Segment', value: '[AB]' },
        { id: 'r2', emoji: '➡️', label: 'Demi-droite', value: '[AB)' },
        { id: 'r3', emoji: '↔️', label: 'Droite', value: '(AB)' },
        { id: 'r4', emoji: '🎯', label: 'Milieu', value: 'AM = MB' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître des droites !',
        title: 'Mission accomplie !',
        message:
          'Tu distingues droite, segment et demi-droite par leurs extrémités, tu sais les noter, les construire et décrire une figure sans ambiguïté. La leçon suivante fera se rencontrer — ou non — deux droites.',
        verbs: ['Reconnaître', 'Noter', 'Construire', 'Décrire'],
        masterBadgeLabel: 'Sans aucune erreur',
      }}
      xpPerCorrect={10}
    />
  );
}
