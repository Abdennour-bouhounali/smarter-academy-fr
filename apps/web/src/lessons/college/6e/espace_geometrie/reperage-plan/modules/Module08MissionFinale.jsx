import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import CoordGrid from '../components/CoordGrid';
import SwapLab from '../components/SwapLab';
import { makeGrid, formatCoords, swapNode } from '../components/reperageUtils';

/**
 * Module 8 — ÉVALUATION (« Boss final »).
 *
 * Ce fichier est un fichier de DONNÉES : le moteur (silence jusqu'au submit
 * unique, correction, profil de maîtrise, evidence, persistance de la
 * tentative) vit dans common/kit/BossFinal.jsx.
 *
 * Les dix épreuves sont écrites EN DERNIER, pour que chaque distracteur
 * encode un piège réellement travaillé dans les modules 1 à 7 :
 *   - l'échange des deux coordonnées         (module 2)
 *   - le décalage d'une unité (compter à partir de 1) (modules 3-4)
 *   - la confusion nœud / case               (module 6)
 *   - la somme des écarts prise pour un produit (module 5)
 *   - la description qualitative jugée suffisante   (module 1)
 *
 * Couverture des LP : P1(e1) P2(e2,e3) P3(e4) P4(e6) P5(e5) P6(e7,e8)
 * P7(e9,e10) — les 7 learning points sont évalués.
 */
const GRID = makeGrid({ cols: 7, rows: 6, step: 34 });

const PARC = [
  { col: 6, row: 3, emoji: '🎡', label: 'Grande roue' },
  { col: 2, row: 5, emoji: '🍦', label: 'Kiosque' },
  { col: 2, row: 3, emoji: '🎯', label: 'Tir à l’arc' },
  { col: 0, row: 0, emoji: '🚪', label: 'Entrée' },
];

const SKILLS = {
  besoin: { label: 'Décrire une position sans ambiguïté', module: 1 },
  ordre: { label: 'Le rôle de chaque coordonnée', module: 2 },
  lire: { label: 'Lire les coordonnées d’un point', module: 3 },
  placer: { label: 'Placer un point', module: 4 },
  deplacer: { label: 'Se déplacer dans un quadrillage', module: 5 },
  resoudre: { label: 'Résoudre un problème de repérage', module: 7 },
};

const T = { col: 4, row: 2 };
const CANDIDATES = [
  { col: 3, row: 5 },
  { col: 5, row: 3 },
  { col: 3, row: 4 },
];

const EPREUVES = [
  {
    id: 'rp-e1',
    requires: ['deux-nombres'],
    skill: 'besoin',
    title: 'Épreuve 1 — Le message du gardien',
    prompt:
      'Un visiteur demande où est le kiosque. Le gardien répond : « il est en haut à gauche ». Pourquoi cette réponse ne suffit-elle pas ?',
    options: [
      'Parce que plusieurs endroits différents correspondent à cette description',
      'Parce qu’elle est suffisante : on voit bien où c’est',
      'Parce qu’il faudrait donner un seul nombre',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Une description qualitative laisse le choix entre de nombreuses positions. Deux nombres, dans un ordre fixé, n’en désignent qu’une.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_reperage-plan_P1'] },
  },
  {
    id: 'rp-e2',
    requires: ['abscisse', 'ordonnee', 'ordre-du-couple'],
    skill: 'ordre',
    title: 'Épreuve 2 — Le rôle du premier nombre',
    prompt: 'La grande roue est en (6 ; 3). Que commande le 6 ?',
    options: [
      'De combien on se déplace horizontalement',
      'De combien on monte',
      'Le numéro de la case',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Le premier nombre se lit toujours sur l’axe horizontal ; c’est le second (ici 3) qui commande la montée.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_reperage-plan_P2'] },
  },
  {
    id: 'rp-e3',
    requires: ['ordre-du-couple', 'coordonnees'],
    skill: 'ordre',
    title: 'Épreuve 3 — Deux écritures',
    prompt: 'Les écritures (2 ; 5) et (5 ; 2) désignent-elles le même endroit du plan ?',
    options: [
      'Non : les deux nombres n’ont pas le même rôle',
      'Oui : ce sont les mêmes nombres',
      'Oui, mais seulement sur un quadrillage carré',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Échanger les deux nombres désigne un autre point — sauf quand ils sont égaux, comme (3 ; 3), qui est sur la diagonale.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_reperage-plan_P2'] },
  },
  {
    id: 'rp-e4',
    requires: ['lire-un-point', 'coordonnees', 'abscisse', 'ordonnee'],
    skill: 'lire',
    title: 'Épreuve 4 — Lire le point T',
    prompt: 'Quelles sont les coordonnées du point T ?',
    extra: (
      <CoordGrid
        grid={GRID}
        mode="display"
        labelledNodes={[{ col: T.col, row: T.row, name: 'T' }]}
        showCoordsBadge={false}
        ariaLabel="Quadrillage portant le point T"
      />
    ),
    options: [formatCoords(T), formatCoords(swapNode(T)), formatCoords({ col: 5, row: 2 })],
    cols: 3,
    correct: 0,
    explain:
      'On lit l’horizontale d’abord (4), la verticale ensuite (2) : T = (4 ; 2). (2 ; 4) inverse les rôles, (5 ; 2) décale d’une graduation.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_reperage-plan_P3'] },
  },
  {
    id: 'rp-e5',
    requires: ['coordonnee-commune', 'abscisse'],
    skill: 'lire',
    title: 'Épreuve 5 — Une coordonnée commune',
    prompt:
      'Le tir à l’arc (2 ; 3) et le kiosque (2 ; 5) ont le même PREMIER nombre. Qu’est-ce que cela signifie sur le plan ?',
    options: [
      'Ils sont sur la même verticale',
      'Ils sont à la même hauteur',
      'Ils sont au même endroit',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Le premier nombre commande l’horizontale : deux points qui le partagent sont l’un au-dessus de l’autre, donc sur une même verticale.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_reperage-plan_P5'] },
  },
  {
    id: 'rp-e6',
    requires: ['placer-un-point', 'coordonnees', 'ordre-du-couple'],
    skill: 'placer',
    title: 'Épreuve 6 — Où est (3 ; 5) ?',
    prompt: 'Parmi les trois points marqués, lequel se trouve en (3 ; 5) ?',
    extra: (
      <CoordGrid
        grid={GRID}
        mode="display"
        labelledNodes={CANDIDATES.map((c, i) => ({
          col: c.col,
          row: c.row,
          name: ['①', '②', '③'][i],
          color: '#7c3aed',
        }))}
        showCoordsBadge={false}
        ariaLabel="Quadrillage portant trois points candidats"
      />
    ),
    options: ['Le point ①', 'Le point ②', 'Le point ③'],
    cols: 3,
    correct: 0,
    explain:
      '(3 ; 5) : 3 vers la droite, puis 5 vers le haut — c’est le point ①. Le ② est en (5 ; 3), les nombres échangés ; le ③ est en (3 ; 4), une graduation trop bas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_reperage-plan_P4'] },
  },
  {
    id: 'rp-e7',
    requires: ['deplacement-somme', 'origine-repere', 'coordonnees'],
    skill: 'deplacer',
    title: 'Épreuve 7 — Le nombre de pas',
    prompt:
      'Un gardien va de l’entrée (0 ; 0) au tir à l’arc (2 ; 3), en se déplaçant le long des traits. Combien de pas au minimum ?',
    options: ['5 pas', '6 pas', '3 pas'],
    cols: 3,
    correct: 0,
    explain:
      '2 pas horizontalement + 3 pas verticalement = 5 pas. On additionne les écarts ; 6 serait 2 × 3, et 3 oublierait un des deux déplacements.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_reperage-plan_P6'] },
  },
  {
    id: 'rp-e8',
    requires: ['deplacement-somme', 'ordonnee', 'coordonnees'],
    skill: 'deplacer',
    title: 'Épreuve 8 — Dans quel sens ?',
    prompt: 'On part du kiosque (2 ; 5) pour rejoindre la grande roue (6 ; 3). Le déplacement vertical, c’est…',
    options: ['2 pas vers le bas', '2 pas vers le haut', '4 pas vers le bas'],
    cols: 1,
    correct: 0,
    explain:
      'La seconde coordonnée passe de 5 à 3 : elle DIMINUE, donc on descend de 2 pas. Les 4 pas, eux, sont le déplacement horizontal.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_reperage-plan_P6'] },
  },
  {
    id: 'rp-e9',
    requires: ['noeud-vs-case', 'mem-noeud-case'],
    skill: 'resoudre',
    title: 'Épreuve 9 — Case ou nœud ?',
    prompt: 'Sur le plan du parc, laquelle de ces deux affirmations est correctement écrite ?',
    options: [
      '« Le poteau est au nœud (1 ; 2) » et « le trésor est dans la case B3 »',
      '« Le poteau est au nœud B3 » et « le trésor est dans la case (1 ; 2) »',
      'Les deux écritures sont interchangeables',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Un nœud est un point, repéré par deux nombres entre parenthèses ; une case est une surface, repérée par une lettre et un numéro. Les deux repérages ne se remplacent pas.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_reperage-plan_P7'] },
  },
  {
    id: 'rp-e10',
    requires: ['coordonnee-commune', 'ordonnee'],
    skill: 'resoudre',
    title: 'Épreuve 10 — Trois stands',
    prompt:
      'Trois stands sont en (1 ; 2), (4 ; 2) et (7 ; 2). Que peut-on affirmer avec certitude ?',
    options: [
      'Ils sont alignés sur une même ligne horizontale',
      'Ils forment un triangle',
      'Ils sont de plus en plus hauts',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Les trois partagent la même seconde coordonnée (2) : ils sont donc à la même hauteur, alignés horizontalement. C’est le premier alignement de la géométrie — la leçon suivante en fera une droite.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_reperage-plan_P7'] },
  },
];

const BADGES = [
  { id: 'b-ordre', emoji: '🏅', label: 'Cartographe — l’ordre des coordonnées', test: (m) => !m.ordre },
  { id: 'b-lire', emoji: '🏅', label: 'Œil de lynx — lecture sans erreur', test: (m) => !m.lire },
  { id: 'b-placer', emoji: '🏅', label: 'Poseur de points', test: (m) => !m.placer },
  { id: 'b-deplacer', emoji: '🏅', label: 'Navigateur — déplacements maîtrisés', test: (m) => !m.deplacer },
  { id: 'b-resoudre', emoji: '🏅', label: 'Résolveur de plans', test: (m) => !m.resoudre },
  { id: 'b-besoin', emoji: '🏅', label: 'Message sans ambiguïté', test: (m) => !m.besoin },
];

/** Synthèse : la leçon revue à travers ses propres manipulations, figées. */
function Synthese() {
  const A = { col: 2, row: 5 };
  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-space font-extrabold text-slate-900">Ce que tu as construit</h2>
        <p className="text-sm text-slate-500">Les quatre idées de la leçon, dans l’ordre où tu les as rencontrées.</p>
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <h3 className="font-space font-bold text-slate-800 text-sm">1. Deux nombres, et leur ordre</h3>
        <SwapLab grid={makeGrid({ cols: 6, rows: 6, step: 34 })} point={A} disabled />
        <p className="text-sm text-slate-600">
          {formatCoords(A)} et {formatCoords(swapNode(A))} ne désignent pas le même point : le premier nombre
          commande l’horizontale, le second la verticale.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
        <h3 className="font-space font-bold text-slate-800 text-sm">2. Lire, placer, se déplacer</h3>
        <CoordGrid
          grid={GRID}
          mode="display"
          overlay={PARC}
          trail={[{ col: 0, row: 0 }, { col: 6, row: 0 }, { col: 6, row: 3 }]}
          showCoordsBadge={false}
          ariaLabel="Plan du parc avec le trajet de l’entrée à la grande roue"
        />
        <p className="text-sm text-slate-600">
          Un déplacement se lit comme un couple : de (0 ; 0) à (6 ; 3), c’est 6 pas à droite et 3 pas vers le
          haut, soit 9 pas — une <strong>somme</strong>, jamais un produit.
        </p>
      </div>

      {/* Les pièges et les connaissances ne sont pas recopiés ici : la carte
          construite au fil des sept modules EST la fiche de révision
          (docs/architecture/KNOWLEDGE_MAP.md). */}
      <KnowledgeSnapshot variant="complete" complete />
    </div>
  );
}

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="🏆 Mission finale : le plan du parc"
      moduleSubtitle="Dix épreuves d’orientation sur le plan du parc d’aventure."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={600}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Défi final',
        title: 'Le parc t’ouvre ses portes.',
        body: (
          <p>
            Dix épreuves, une seule validation à la fin : rien ne se corrige avant que tu aies tout répondu.
            Prends le temps de relire chaque plan.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🎡', label: 'Grande roue', value: '(6 ; 3)' },
        { id: 'r2', emoji: '🍦', label: 'Kiosque', value: '(2 ; 5)' },
        { id: 'r3', emoji: '🎯', label: 'Tir à l’arc', value: '(2 ; 3)' },
        { id: 'r4', emoji: '🚪', label: 'Entrée', value: '(0 ; 0)' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître du repère !',
        title: 'Mission accomplie !',
        message:
          'Tu sais décrire une position sans ambiguïté, lire et placer un point, te déplacer dans un quadrillage et t’en servir pour résoudre des problèmes. La prochaine leçon part du même quadrillage — pour explorer les droites.',
        verbs: ['Décrire', 'Lire', 'Placer', 'Se déplacer'],
        masterBadgeLabel: 'Sans aucune erreur',
      }}
      xpPerCorrect={10}
    />
  );
}
