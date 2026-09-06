import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import SolidTurner from '../components/SolidTurner';
import ViewsPanel from '../components/ViewsPanel';
import { SOLIDS } from '../components/espaceUtils';

/**
 * Module 8 — ÉVALUATION (BossFinal, données uniquement).
 *
 * Dix épreuves, silencieuses jusqu'à la soumission unique. Chaque distracteur
 * encode une erreur RÉELLEMENT rencontrée dans la leçon :
 *   - croire qu'un dessin différent signifie un objet différent (M1) ;
 *   - ne compter que les sommets visibles (M2) ;
 *   - croire qu'une arête est « cachée » par nature (M3) ;
 *   - trancher sur une seule vue (M4, M5) ;
 *   - croire qu'une perspective conserve tous les angles droits (M6) ;
 *   - croire que deux droites qui ne se coupent pas sont parallèles (M7).
 *
 * Les objets `assessment` sont écrits en toutes lettres : un helper les
 * rendrait invisibles au validateur.
 */
const EPREUVES = [
  {
    id: 're-e1',
    skill: 'solides',
    requires: ['polyedre', 'face-solide', 'arete', 'sommet-solide'],
    title: 'Reconnaître un solide',
    prompt: 'Un solide a 5 faces : deux triangles et trois rectangles. De quoi s’agit-il ?',
    options: [
      'Un prisme droit à base triangulaire',
      'Une pyramide à base carrée',
      'Un pavé droit',
      'Un cône',
    ],
    cols: 1,
    explain: 'Deux bases triangulaires reliées par trois rectangles : c’est le prisme droit à base triangulaire. La pyramide à base carrée aurait un carré et quatre triangles.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-espace-3e_P1'] },
  },
  {
    id: 're-e2',
    skill: 'compter',
    requires: ['relation-euler', 'polyedre', 'compter-le-cache'],
    title: 'Compter sans oublier',
    prompt: 'Combien un cube a-t-il de sommets ?',
    options: ['8', '7', '6', '12'],
    cols: 4,
    explain: '8 sommets : 4 sur la face avant, 4 sur la face arrière. La réponse 7 vient de compter uniquement les sommets visibles — le huitième est caché derrière.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-espace-3e_P2'] },
  },
  {
    id: 're-e3',
    skill: 'compter',
    requires: ['relation-euler', 'polyedre', 'compter-le-cache'],
    title: 'La relation d’Euler',
    prompt: 'Pour un polyèdre convexe, que vaut faces + sommets − arêtes ?',
    options: ['2', '0', '1', 'Cela dépend du solide'],
    cols: 4,
    explain: 'C’est la relation d’Euler : F + S − A = 2 pour tout polyèdre convexe. Elle ne s’applique pas aux solides à surface courbe comme la boule.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-espace-3e_P2'] },
  },
  {
    id: 're-e4',
    skill: 'perspective',
    requires: ['perspective-cavaliere', 'dessin-projection', 'mem-angles-deformes'],
    title: 'Les traits en pointillé',
    extra: (
      <div className="my-2">
        <SolidTurner solid={SOLIDS.cube} yaw={30} pitch={20}
          ariaLabel="Cube vu de trois quarts avec trois arêtes en pointillé" />
      </div>
    ),
    prompt: 'Que représentent les traits en pointillé de ce dessin ?',
    options: [
      'Des arêtes réelles du solide, situées derrière et donc invisibles d’ici',
      'Des arêtes qui n’existent pas',
      'Des arêtes plus courtes que les autres',
      'Les diagonales des faces',
    ],
    cols: 1,
    explain: 'Le pointillé est la convention du dessin technique pour les arêtes cachées. Elles font partie du solide : un cube a toujours 12 arêtes, quel que soit l’angle de vue.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-espace-3e_P3', '3e_representation-espace-3e_P4'] },
  },
  {
    id: 're-e5',
    skill: 'pointdevue',
    requires: ['cache-depend-du-point-de-vue', 'arete-cachee'],
    title: 'Visible ou caché ?',
    prompt: 'Une arête est dessinée en pointillé. Que se passe-t-il si on tourne le solide ?',
    options: [
      'Elle peut devenir visible : être cachée dépend du point de vue',
      'Elle reste cachée, c’est une propriété de cette arête',
      'Elle disparaît complètement',
      'Le solide perd une arête',
    ],
    cols: 1,
    explain: 'Tu l’as manipulé au module 3 : la même arête passe de pointillé à trait plein selon l’orientation. « Cachée » qualifie une vue, pas une arête.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-espace-3e_P6'] },
  },
  {
    id: 're-e6',
    skill: 'pointdevue',
    requires: ['cache-depend-du-point-de-vue', 'arete-cachee'],
    title: 'Identifier en tournant',
    prompt: 'Un dessin est ambigu : on ne sait pas quel solide il représente. Quelle est la meilleure méthode ?',
    options: [
      'Changer de point de vue et compter faces, arêtes et sommets',
      'Mesurer la longueur des traits sur le dessin',
      'Choisir le solide le plus courant',
      'Regarder la couleur du dessin',
    ],
    cols: 1,
    explain: 'Les comptes identifient un solide sans ambiguïté, et ils ne changent pas quand on tourne. Une seule vue, elle, peut être trompeuse.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-espace-3e_P5'] },
  },
  {
    id: 're-e7',
    skill: 'vues',
    requires: ['trois-vues', 'methode-identifier'],
    title: 'Les trois vues',
    extra: (
      <div className="my-2">
        <ViewsPanel solid={SOLIDS.pave} />
      </div>
    ),
    prompt: 'Pourquoi un plan technique donne-t-il trois vues plutôt qu’une seule ?',
    options: [
      'Parce que chaque vue écrase une dimension : il en faut plusieurs pour décrire l’objet',
      'Pour faire plus joli',
      'Parce qu’une vue est toujours fausse',
      'Pour montrer les trois couleurs du solide',
    ],
    cols: 1,
    explain: 'Une projection ne garde que deux dimensions sur trois. Deux solides différents peuvent partager une même vue : c’est en les croisant qu’on lève l’ambiguïté.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-espace-3e_P7'] },
  },
  {
    id: 're-e8',
    skill: 'perspective',
    requires: ['perspective-cavaliere', 'dessin-projection', 'mem-angles-deformes'],
    title: 'Les règles de la cavalière',
    prompt: 'Dans un cube dessiné en perspective cavalière, quelle affirmation est VRAIE ?',
    options: [
      'La face avant est en vraie grandeur, mais les autres angles droits sont déformés',
      'Tous les angles droits du cube restent droits sur le dessin',
      'Toutes les arêtes sont dessinées à la même longueur',
      'Les fuyantes se rejoignent en un point de fuite',
    ],
    cols: 1,
    explain: 'La face parallèle au plan du dessin garde ses longueurs et ses angles ; les fuyantes sont inclinées et raccourcies, et les angles droits qu’elles forment ne le sont plus sur la feuille. Les fuyantes restent parallèles : elles ne convergent pas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-espace-3e_P8'] },
  },
  {
    id: 're-e9',
    skill: 'espace',
    requires: ['non-coplanaires', 'droites-paralleles'],
    title: 'Le troisième cas',
    prompt: 'Dans l’espace, deux droites qui ne se coupent jamais sont-elles forcément parallèles ?',
    options: [
      'Non : elles peuvent être non coplanaires, comme deux arêtes bien choisies d’un cube',
      'Oui, comme dans le plan',
      'Oui, sauf si elles sont confondues',
      'Cela dépend de la taille du solide',
    ],
    cols: 1,
    explain: 'C’est la nouveauté de la géométrie dans l’espace : deux droites peuvent n’avoir aucun point commun sans avoir la même direction, dès lors qu’aucun plan ne les contient toutes les deux.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-espace-3e_P9'] },
  },
  {
    id: 're-e10',
    skill: 'espace',
    requires: ['non-coplanaires', 'droites-paralleles'],
    title: 'Dans le cube',
    extra: (
      <div className="my-2">
        <SolidTurner solid={SOLIDS.cube} yaw={30} pitch={20} showNames
          ariaLabel="Cube ABCDEFGH vu de trois quarts, sommets nommés" />
      </div>
    ),
    prompt: 'ABCD est la face avant du cube et EFGH la face arrière (E derrière A). Quelle est la position des droites (AB) et (CG) ?',
    options: [
      'Ni parallèles ni sécantes : elles ne sont pas dans un même plan',
      'Parallèles',
      'Sécantes en C',
      'Confondues',
    ],
    cols: 1,
    explain: '(AB) est une arête de la face avant et (CG) part vers l’arrière : elles n’ont aucun point commun et n’ont pas la même direction. Aucun plan ne les contient toutes les deux — elles sont non coplanaires.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['3e_representation-espace-3e_P10', '3e_representation-espace-3e_P9'] },
  },
];

const SKILLS = {
  solides: { label: 'Reconnaître les solides', module: 2 },
  compter: { label: 'Faces, arêtes, sommets', module: 2 },
  perspective: { label: 'Lire une perspective', module: 6 },
  pointdevue: { label: 'Changer de point de vue', module: 3 },
  vues: { label: 'Les trois vues', module: 5 },
  espace: { label: 'Positions relatives', module: 7 },
};

const BADGES = [
  { id: 'b-sol', emoji: '🏅', label: 'Connaisseur des solides', test: (m) => !m.solides },
  { id: 'b-cpt', emoji: '🏅', label: 'Compte ce qui est caché', test: (m) => !m.compter },
  { id: 'b-per', emoji: '🏅', label: 'Lecteur de perspective', test: (m) => !m.perspective },
  { id: 'b-pdv', emoji: '🏅', label: 'Maître du point de vue', test: (m) => !m.pointdevue },
  { id: 'b-vue', emoji: '🏅', label: 'Lecteur de plans', test: (m) => !m.vues },
  { id: 'b-esp', emoji: '🏅', label: 'Géomètre de l’espace', test: (m) => !m.espace },
  { id: 'b-parfait', emoji: '💎', label: 'Architecte diplômé', test: (m) => Object.keys(m).length === 0 },
];

/** La synthèse : le solide tourné, et ses trois vues. */
function Synthese() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 text-center">Le solide en perspective</p>
          <SolidTurner solid={SOLIDS.pave} yaw={30} pitch={20} showNames
            ariaLabel="Pavé droit vu de trois quarts, arêtes cachées en pointillé" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 text-center">Ses trois vues</p>
          <ViewsPanel solid={SOLIDS.pave} />
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 text-sm">
        {[
          { t: 'Le dessin n’est pas l’objet', d: 'Une projection perd de l’information.' },
          { t: 'Caché ≠ inexistant', d: 'Les comptes ne changent jamais quand on tourne.' },
          { t: 'Trois cas dans l’espace', d: 'Sécantes, parallèles, ou non coplanaires.' },
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
      moduleTitle="🏆 Mission finale : l’atelier"
      moduleSubtitle="Dix épreuves pour prouver que tu lis l’espace"
      estimatedTime="15 min"
      timerSeconds={600}
      timerLabel="10 min"
      xpPerCorrect={10}
      brief={{
        tag: 'Mission finale',
        title: 'Architecte diplômé',
        tone: 'amber',
        body: (
          <p>
            Dix questions, une seule validation à la fin. Pour chacune, souviens-toi qu’un dessin
            ne montre qu’un point de vue.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🧊', label: 'Cube', value: '6 faces, 12 arêtes, 8 sommets' },
        { id: 'r2', emoji: '➖', label: 'Pointillé', value: 'arête cachée' },
        { id: 'r3', emoji: '📐', label: 'Cavalière', value: 'face avant en vraie grandeur' },
        { id: 'r4', emoji: '🔀', label: 'Espace', value: 'le cas non coplanaire' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Architecte diplômé !',
        title: 'Mission accomplie',
        message: 'Tu sais lire une perspective, compter ce qui est caché et raisonner dans l’espace.',
        verbs: ['Lire', 'Compter', 'Tourner', 'Raisonner'],
        masterBadgeLabel: 'Architecte diplômé',
      }}
    />
  );
}
