import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import SolidView from '../components/SolidView';
import PatronGrid from '../components/PatronGrid';
import {
  SOLIDES, eulerCheck, gridFromArt,
  PATRON_CROIX, PATRON_IMPOSSIBLE,
} from '../components/solidesUtils';

/**
 * Module 7 — ÉVALUATION (« Boss final »).
 *
 * Fichier de DONNÉES : le moteur vit dans common/kit/BossFinal.jsx.
 *
 * Distracteurs, tous adossés à un piège réellement travaillé :
 *   - compter les faces visibles au lieu de toutes   (module 1)
 *   - confondre arête et sommet                      (module 2)
 *   - croire à un seul patron du cube                (module 3)
 *   - croire que 6 cases collées suffisent           (module 4)
 *   - appliquer le mauvais compte à un problème      (module 6)
 *
 * Couverture des LP : P1(e1) P2(e2) P3(e3) P4(e4) P5(e5) P6(e6) P7(e7)
 * P8(e8) P9(e9) P10(e10) — les 10 learning points sont évalués.
 */
const CUBE = SOLIDES.cube;

const SKILLS = {
  representer: { label: 'Dessin plat et objet en volume', module: 1 },
  compter: { label: 'Faces, arêtes et sommets', module: 2 },
  patron: { label: 'Associer un solide à son patron', module: 3 },
  plier: { label: 'Plier mentalement un patron', module: 4 },
  reconnaitre: { label: 'Reconnaître les solides', module: 5 },
  resoudre: { label: 'Résoudre un problème de solides', module: 6 },
};

const EPREUVES = [
  {
    id: 'sp-e1',
    requires: ['pave-droit', 'nature-des-faces', 'face-solide'],
    skill: 'reconnaitre',
    title: 'Épreuve 1 — Reconnaître le solide',
    prompt: 'Un solide a 6 faces rectangulaires, égales deux à deux. De quel solide s’agit-il ?',
    extra: <SolidView solide="pave" size={200} ariaLabel="Un pavé droit" />,
    options: ['Un pavé droit', 'Un cube', 'Un prisme triangulaire'],
    cols: 1,
    correct: 0,
    explain:
      'Le pavé droit a 6 faces rectangulaires. Le cube est un cas particulier où ces rectangles sont des carrés tous identiques.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_solides-patrons_P1'] },
  },
  {
    id: 'sp-e2',
    requires: ['face-solide', 'dessin-et-objet', 'mem-cube-fas'],
    skill: 'compter',
    title: 'Épreuve 2 — Les faces',
    prompt: 'Combien de faces possède un cube ?',
    extra: <SolidView solide="cube" size={200} ariaLabel="Un cube en perspective" />,
    options: [`${CUBE.faces} faces`, '3 faces', '8 faces'],
    cols: 3,
    correct: 0,
    explain:
      'Six faces. Sur un dessin on n’en voit que 3 — les trois autres sont derrière, mais elles existent.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_solides-patrons_P2'] },
  },
  {
    id: 'sp-e3',
    requires: ['arete', 'mem-cube-fas'],
    skill: 'compter',
    title: 'Épreuve 3 — Les arêtes',
    prompt: 'Combien d’arêtes possède un cube ?',
    options: [`${CUBE.aretes} arêtes`, '6 arêtes', '8 arêtes'],
    cols: 3,
    correct: 0,
    explain:
      'Douze arêtes : 4 en haut, 4 en bas, 4 verticales. Une arête est un SEGMENT, pas une surface ni un point.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_solides-patrons_P3'] },
  },
  {
    id: 'sp-e4',
    requires: ['sommet-solide', 'arete', 'mem-cube-fas'],
    skill: 'compter',
    title: 'Épreuve 4 — Les sommets',
    prompt: 'Combien de sommets possède un cube ?',
    options: [`${CUBE.sommets} sommets`, '12 sommets', '6 sommets'],
    cols: 3,
    correct: 0,
    explain:
      'Huit sommets — les coins. 12 serait le nombre d’arêtes, 6 celui des faces : trois comptes différents.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_solides-patrons_P4'] },
  },
  {
    id: 'sp-e5',
    requires: ['arete-cachee', 'dessin-et-objet'],
    skill: 'representer',
    title: 'Épreuve 5 — Les pointillés',
    prompt: 'Sur un dessin de cube en perspective, que représentent les traits en pointillé ?',
    extra: <SolidView solide="cube" highlight="aretes" size={200} ariaLabel="Cube avec arêtes cachées" />,
    options: [
      'Les arêtes cachées, situées derrière le solide',
      'Des arêtes plus courtes que les autres',
      'Les arêtes qu’il faut découper',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Le pointillé est la convention du dessin technique : il signale ce qui existe mais reste caché derrière. Toutes les arêtes d’un cube ont la même longueur.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_solides-patrons_P5'] },
  },
  {
    id: 'sp-e6',
    requires: ['patron-solide', 'face-solide'],
    skill: 'patron',
    title: 'Épreuve 6 — Le patron du cube',
    prompt: 'Ce patron se replie-t-il en cube ?',
    extra: <PatronGrid grid={PATRON_CROIX} readOnly showVerdict={false} cellSize={32} />,
    options: ['Oui', 'Non : deux faces se superposeraient', 'Non : il manque une case'],
    cols: 1,
    correct: 0,
    explain:
      'C’est le patron « en croix », le plus classique des onze patrons du cube : ses 6 cases se replient sur 6 faces différentes.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_solides-patrons_P6'] },
  },
  {
    id: 'sp-e7',
    requires: ['onze-patrons', 'patron-solide'],
    skill: 'patron',
    title: 'Épreuve 7 — Combien de patrons ?',
    prompt: 'Combien de patrons différents un cube possède-t-il ?',
    options: ['Onze', 'Un seul', 'Six'],
    cols: 3,
    correct: 0,
    explain:
      'Onze. C’est pourquoi on ne les apprend pas par cœur : on vérifie si le patron se replie sans superposition.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_solides-patrons_P7'] },
  },
  {
    id: 'sp-e8',
    requires: ['patron-impossible', 'patron-solide', 'face-solide'],
    skill: 'plier',
    title: 'Épreuve 8 — Plier mentalement',
    prompt: 'Ce patron de 6 cases se replie-t-il en cube ?',
    extra: <PatronGrid grid={PATRON_IMPOSSIBLE} readOnly showVerdict={false} cellSize={32} />,
    options: [
      'Non : en pliant, deux cases tomberaient sur la même face',
      'Oui : il a bien 6 cases collées',
      'Oui : toutes les formes de 6 cases fonctionnent',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Six cases collées ne suffisent pas : il faut qu’elles se replient sur six faces DIFFÉRENTES. Ici, deux se superposent et une face resterait ouverte.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_solides-patrons_P8'] },
  },
  {
    id: 'sp-e9',
    requires: ['patron-impossible', 'face-solide'],
    skill: 'plier',
    title: 'Épreuve 9 — Le patron impossible',
    prompt: 'Qu’est-ce qui rend un patron de 6 cases impossible à replier en cube ?',
    options: [
      'Deux cases occuperaient la même face, en laissant une autre à découvert',
      'Le patron n’a pas la forme d’une croix',
      'Le patron est trop large',
    ],
    cols: 1,
    correct: 0,
    explain:
      'Un cube a exactement 6 faces : les 6 cases doivent occuper 6 faces différentes. La forme du patron, elle, n’a aucune importance.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_solides-patrons_P9'] },
  },
  {
    id: 'sp-e10',
    requires: ['choisir-le-compte', 'arete', 'face-solide', 'sommet-solide'],
    skill: 'resoudre',
    title: 'Épreuve 10 — L’atelier d’emballage',
    prompt:
      'On colle un ruban de renfort le long de chaque arête d’une caisse cubique. Combien de morceaux faut-il ?',
    options: [`${CUBE.aretes} morceaux`, `${CUBE.faces} morceaux`, `${CUBE.sommets} morceaux`],
    cols: 3,
    correct: 0,
    explain:
      'Le ruban suit les ARÊTES : un cube en a 12. Six serait le nombre de faces (pour peindre), huit celui des sommets (pour protéger les coins).',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_solides-patrons_P10'] },
  },
];

const BADGES = [
  { id: 'b-rep', emoji: '🏅', label: 'Lecteur de perspective', test: (m) => !m.representer },
  { id: 'b-cpt', emoji: '🏅', label: 'Compteur exact — F, A, S', test: (m) => !m.compter },
  { id: 'b-pat', emoji: '🏅', label: 'Connaisseur de patrons', test: (m) => !m.patron },
  { id: 'b-pli', emoji: '🏅', label: 'Plieur mental', test: (m) => !m.plier },
  { id: 'b-rec', emoji: '🏅', label: 'Reconnaît tous les solides', test: (m) => !m.reconnaitre },
  { id: 'b-res', emoji: '🏅', label: 'Emballeur professionnel', test: (m) => !m.resoudre },
];

/** Synthèse : le solide, ses comptes et son patron, côte à côte. */
function Synthese() {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-space font-extrabold text-slate-900">Du volume au plan, et retour</h2>
        <p className="text-sm text-slate-500">
          Un solide se compte en trois nombres, et se déplie en patron.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
          <SolidView solide="cube" size={190} ariaLabel="Un cube" />
          <div className="grid grid-cols-3 gap-1 text-center">
            {[['Faces', CUBE.faces], ['Arêtes', CUBE.aretes], ['Sommets', CUBE.sommets]].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-slate-50 border border-slate-200 py-1.5">
                <div className="font-mono font-extrabold text-slate-800">{v}</div>
                <div className="text-[10px] text-slate-500">{k}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] font-mono text-center text-emerald-700">
            {CUBE.faces} + {CUBE.sommets} − {CUBE.aretes} = {eulerCheck(CUBE)} (tout solide à faces planes)
          </p>
        </div>
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
          <PatronGrid grid={PATRON_CROIX} readOnly showVerdict={false} cellSize={32} />
          <p className="text-sm text-slate-600 text-center">
            Le même cube, <strong>déplié</strong> : 6 cases pour 6 faces. Le cube a onze patrons — ce qui
            compte n’est pas leur forme, mais qu’ils se replient sans superposition.
          </p>
        </div>
      </div>

      {/* Les pièges et les connaissances ne sont pas recopiés ici : la carte
          construite au fil des six modules EST la fiche de révision
          (docs/architecture/KNOWLEDGE_MAP.md). */}
      <KnowledgeSnapshot variant="complete" complete />
    </div>
  );
}

export default function Module07MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="🏆 Mission finale : l’atelier d’emballage"
      moduleSubtitle="Dix épreuves : solides, patrons et pliages."
      estimatedTime="12 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={600}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Défi final',
        title: 'L’atelier d’emballage ouvre ses portes.',
        body: (
          <p>
            Dix épreuves, une seule validation à la fin. Attention à bien distinguer faces, arêtes et
            sommets — et à ne pas te fier aux seules faces visibles.
          </p>
        ),
      }}
      registre={[
        { id: 'r1', emoji: '🧊', label: 'Faces', value: String(CUBE.faces) },
        { id: 'r2', emoji: '📏', label: 'Arêtes', value: String(CUBE.aretes) },
        { id: 'r3', emoji: '📍', label: 'Sommets', value: String(CUBE.sommets) },
        { id: 'r4', emoji: '📐', label: 'Patrons', value: '11' },
      ]}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Maître des solides !',
        title: 'Mission accomplie !',
        message:
          'Tu reconnais les solides usuels, tu comptes faces, arêtes et sommets sans te fier au dessin, et tu sais dire si un patron se replie. Il ne reste plus qu’à construire : la dernière leçon du chapitre.',
        verbs: ['Reconnaître', 'Compter', 'Déplier', 'Plier'],
        masterBadgeLabel: 'Sans aucune erreur',
      }}
      xpPerCorrect={10}
    />
  );
}
