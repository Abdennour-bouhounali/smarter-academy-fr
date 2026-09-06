import React from 'react';
import { BossFinal } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import RobotWorld from '../components/RobotWorld';
import ProgramStrip from '../components/ProgramStrip';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { makeWorld, instr, makeRepeat, runProgram } from '../components/algoUtils';

/**
 * Module 8 — ÉVALUATION : « Mission finale : ROBI explorateur ».
 *
 * Dix épreuves QCM, silencieuses jusqu'à une validation unique (le moteur du
 * kit s'en charge). Les distracteurs reprennent EXACTEMENT les pièges
 * rencontrés dans les modules : tourner ≠ avancer, ordre inversé, boucle mal
 * comptée, RAMASSER à distance, objectif confondu avec programme.
 *
 * Couverture : les 12 Learning Points de la leçon (voir lesson.config.js).
 */

/* ── Le registre : le matériel de la mission ──────────────────────── */
const REGISTRE = [
  { id: 'robi', emoji: '🤖', label: 'ROBI', value: 'Le robot du potager' },
  { id: 'cartes', emoji: '🎴', label: 'Instructions', value: 'AVANCER · TOURNER · RAMASSER' },
  { id: 'boucle', emoji: '🔁', label: 'Boucle', value: 'RÉPÉTER n FOIS' },
  { id: 'bug', emoji: '🐛', label: 'Bug', value: 'Une erreur à corriger' },
];

const SKILLS = {
  algorithme: { label: "Comprendre ce qu'est un algorithme", module: 1 },
  instruction: { label: 'Identifier l’effet d’une instruction', module: 2 },
  sequence: { label: 'Décomposer et construire une séquence', module: 3 },
  ordre: { label: "Comprendre l'ordre des instructions", module: 4 },
  boucle: { label: 'Utiliser une répétition', module: 5 },
  reparer: { label: 'Repérer et corriger une erreur', module: 6 },
  strategie: { label: 'Tester et traduire une stratégie', module: 7 },
};

/* ── Visuels d'épreuve : réutilisent les composants de la leçon ───── */
const W_SMALL = makeWorld({
  cols: 4, rows: 3, step: 40,
  start: { col: 0, row: 0, heading: 1 },
  target: { col: 2, row: 1 },
});

function MiniScene({ world, program = [], showProgram = true }) {
  const run = runProgram(world, program);
  return (
    <div className="space-y-2">
      <RobotWorld world={world} pos={world.start} height={120} reduced />
      {showProgram && program.length > 0 && (
        <ProgramStrip program={program} onChange={() => {}} disabled title="Le programme" showStepCount={false} />
      )}
      <span className="sr-only">
        ROBI part de colonne {world.start.col}, ligne {world.start.row}. Le programme le mène en
        colonne {run.final.col}, ligne {run.final.row}.
      </span>
    </div>
  );
}

const EPREUVES = [
  {
    id: 'algo-e1',
    requires: ['objectif-nest-pas-programme', 'instruction'],
    skill: 'algorithme',
    prompt: (
      <>
        Tu dis à ROBI : « <em>Va chercher la tomate au fond du potager</em> ». Que va-t-il faire ?
      </>
    ),
    options: [
      'Il y va tout seul, il a compris',
      'Rien : ce n’est pas une suite d’instructions qu’il peut exécuter',
      'Il avance d’une case pour commencer',
      'Il tourne sur lui-même',
    ],
    cols: 1,
    correct: 1,
    explain:
      "C'est un OBJECTIF, pas un PROGRAMME. Un robot n'exécute que des instructions précises (AVANCER, TOURNER…). Traduire l'objectif en instructions, c'est tout le travail du programmeur.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_algorithmique-programmation_P1'] },
  },
  {
    id: 'algo-e2',
    requires: ['effet-instruction', 'instruction'],
    skill: 'instruction',
    prompt: (
      <>
        ROBI est en <strong className="font-mono">colonne 1, ligne 1</strong>, tourné vers le haut.
        Il exécute une seule instruction : <strong className="font-mono">TOURNER →</strong>. Où
        est-il ensuite ?
      </>
    ),
    options: [
      'En colonne 2, ligne 1',
      'En colonne 1, ligne 2',
      'Toujours en colonne 1, ligne 1',
      'En colonne 0, ligne 1',
    ],
    cols: 2,
    correct: 2,
    explain:
      'TOURNER ne déplace jamais le robot : il pivote sur sa case. Seul AVANCER change la case. C’est le piège n° 1 de la programmation de déplacements.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_algorithmique-programmation_P2'] },
  },
  {
    id: 'algo-e3',
    requires: ['sequence-algorithme', 'decomposer', 'effet-instruction'],
    skill: 'sequence',
    prompt: (
      <>
        ROBI est en <strong className="font-mono">colonne 0, ligne 0</strong>, tourné vers la droite.
        Le drapeau est en <strong className="font-mono">colonne 3, ligne 0</strong>, sur la même
        ligne. Quel programme l’y amène ?
      </>
    ),
    options: [
      'AVANCER × 3',
      'AVANCER × 4',
      'TOURNER → puis AVANCER × 3',
      'AVANCER × 3 puis TOURNER →',
    ],
    cols: 2,
    correct: 0,
    explain:
      'De la colonne 0 à la colonne 3, il y a 3 cases d’écart : 3 AVANCER suffisent. ROBI regarde déjà dans la bonne direction — pas besoin de tourner.',
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: ['6e_algorithmique-programmation_P3', '6e_algorithmique-programmation_P4'],
    },
  },
  {
    id: 'algo-e4',
    requires: ['effet-instruction', 'reperage-quadrillage'],
    skill: 'instruction',
    extra: <MiniScene world={W_SMALL} program={[instr('AVANCER'), instr('AVANCER'), instr('GAUCHE'), instr('AVANCER')]} />,
    prompt: (
      <>
        ROBI part de <strong className="font-mono">colonne 0, ligne 0</strong> tourné vers la droite,
        et exécute le programme ci-dessus. Où arrive-t-il ?
      </>
    ),
    options: [
      'Colonne 2, ligne 1',
      'Colonne 3, ligne 0',
      'Colonne 1, ligne 2',
      'Colonne 2, ligne 0',
    ],
    cols: 2,
    correct: 0,
    explain:
      'Deux AVANCER vers la droite → colonne 2. TOURNER ← le fait regarder vers le haut (sans bouger). Un AVANCER de plus → ligne 1. Il arrive donc en colonne 2, ligne 1.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_algorithmique-programmation_P5'] },
  },
  {
    id: 'algo-e5',
    requires: ['ordre-compte', 'sequence-algorithme'],
    skill: 'ordre',
    prompt: (
      <>
        Deux programmes contiennent <strong>exactement les mêmes cartes</strong>, rangées dans un
        ordre différent. Que peut-on dire de leurs résultats ?
      </>
    ),
    options: [
      'Ils sont forcément identiques',
      'Ils peuvent être différents',
      'Le second ne démarrera pas',
      'Cela dépend du nombre de cartes',
    ],
    cols: 2,
    correct: 1,
    explain:
      "Un programme est une SUITE, pas un sac : chaque instruction part de l'état laissé par la précédente. Changer l'ordre change donc le résultat.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_algorithmique-programmation_P6'] },
  },
  {
    id: 'algo-e6',
    requires: ['boucle', 'ecrire-vs-executer'],
    skill: 'boucle',
    prompt: (
      <>
        Le programme est : <strong className="font-mono">RÉPÉTER 6 FOIS (AVANCER)</strong>. Combien
        de cases ROBI parcourt-il ?
      </>
    ),
    options: ['1 case', '6 cases', '7 cases', '12 cases'],
    cols: 2,
    correct: 1,
    explain:
      'La carte est écrite 1 fois, mais elle est EXÉCUTÉE 6 fois : ROBI avance donc de 6 cases. Écrire court ne veut pas dire faire moins.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_algorithmique-programmation_P7'] },
  },
  {
    id: 'algo-e7',
    requires: ['boucle', 'ecrire-vs-executer'],
    skill: 'boucle',
    prompt: (
      <>
        Quel programme fait <strong>exactement la même chose</strong> que{' '}
        <strong className="font-mono">AVANCER, AVANCER, AVANCER, AVANCER</strong> ?
      </>
    ),
    options: [
      'RÉPÉTER 3 FOIS (AVANCER)',
      'RÉPÉTER 4 FOIS (AVANCER)',
      'RÉPÉTER 4 FOIS (AVANCER, AVANCER)',
      'AVANCER × 4 ne peut pas se raccourcir',
    ],
    cols: 1,
    correct: 1,
    explain:
      'Quatre AVANCER écrits à la main = RÉPÉTER 4 FOIS (AVANCER) : même trajet, même nombre d’actions, mais une seule carte écrite.',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_algorithmique-programmation_P7'] },
  },
  {
    id: 'algo-e8',
    requires: ['bug-debogage', 'methode-debogage'],
    skill: 'reparer',
    prompt: (
      <>
        Le drapeau était en colonne 3 ; on le déplace en colonne 6. Ton programme{' '}
        <strong className="font-mono">RÉPÉTER 3 FOIS (AVANCER)</strong> ne marche plus. Que fais-tu ?
      </>
    ),
    options: [
      "J'efface tout et je recommence de zéro",
      'Je remplace le 3 par un 6 dans la boucle',
      "J'ajoute un TOURNER à la fin",
      'Je supprime la boucle',
    ],
    cols: 1,
    correct: 1,
    explain:
      "Un programme se MODIFIE : ici, un seul nombre change (3 → 6). Inutile de tout réécrire — c'est justement l'intérêt d'un programme bien construit.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_algorithmique-programmation_P8'] },
  },
  {
    id: 'algo-e9',
    requires: ['methode-debogage', 'bug-debogage', 'effet-instruction'],
    skill: 'reparer',
    prompt: (
      <>
        Tu lances ton programme : ROBI part bien, puis <strong>fonce dans un rocher</strong> à la
        4ᵉ instruction. Comment trouves-tu l’erreur ?
      </>
    ),
    options: [
      'Je change des cartes au hasard jusqu’à ce que ça marche',
      'Je regarde les instructions juste avant le choc : le virage manque ou arrive trop tard',
      'Je supprime toutes les cartes AVANCER',
      "J'ajoute des cartes à la fin du programme",
    ],
    cols: 1,
    correct: 1,
    explain:
      "Déboguer, c'est observer OÙ le comportement dérape : le choc à la 4ᵉ instruction désigne la zone fautive. On corrige là, puis on relance pour vérifier.",
    assessment: {
      enabled: true,
      type: 'assessment',
      learningPointIds: [
        '6e_algorithmique-programmation_P9',
        '6e_algorithmique-programmation_P10',
        '6e_algorithmique-programmation_P11',
      ],
    },
  },
  {
    id: 'algo-e10',
    requires: ['traduire-strategie', 'decomposer', 'sequence-algorithme'],
    skill: 'strategie',
    prompt: (
      <>
        Stratégie du jardinier : « <em>ROBI avance de 2 cases, ramasse la carotte, puis tourne à
        droite et avance de 3 cases</em> ». Quel programme traduit cette stratégie ?
      </>
    ),
    options: [
      'AVANCER ×2, TOURNER →, RAMASSER, AVANCER ×3',
      'AVANCER ×2, RAMASSER, TOURNER →, AVANCER ×3',
      'RAMASSER, AVANCER ×2, TOURNER →, AVANCER ×3',
      'AVANCER ×2, RAMASSER, AVANCER ×3, TOURNER →',
    ],
    cols: 1,
    correct: 1,
    explain:
      "Il faut suivre la stratégie phrase par phrase, dans l'ordre : avancer 2, RAMASSER (ROBI doit être SUR la carotte), tourner, puis avancer 3. Toute autre place du RAMASSER le ferait ramasser du vide.",
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_algorithmique-programmation_P12'] },
  },
];

const BADGES = [
  { id: 'penseur', emoji: '🏅', label: 'Penseur d’algorithmes', test: (s) => (s.algorithme ?? 0) === 0 },
  { id: 'lecteur', emoji: '🏅', label: 'Lecteur d’instructions', test: (s) => (s.instruction ?? 0) === 0 },
  { id: 'batisseur', emoji: '🏅', label: 'Bâtisseur de séquences', test: (s) => (s.sequence ?? 0) === 0 },
  { id: 'ordonnateur', emoji: '🏅', label: 'Maître de l’ordre', test: (s) => (s.ordre ?? 0) === 0 },
  { id: 'boucleur', emoji: '🏅', label: 'Virtuose de la boucle', test: (s) => (s.boucle ?? 0) === 0 },
  { id: 'depanneur', emoji: '🏅', label: 'Chasseur de bugs', test: (s) => (s.reparer ?? 0) === 0 },
  { id: 'strategePro', emoji: '🏅', label: 'Traducteur de stratégies', test: (s) => (s.strategie ?? 0) === 0 },
  { id: 'parfait', emoji: '💎', label: 'Programme parfait', test: (s) => Object.values(s).every((v) => v === 0) },
];

/* ══ Synthèse — la manipulation de la leçon, figée en carte-mémoire ══ */

const W_RECAP = makeWorld({
  cols: 5, rows: 3, step: 40,
  start: { col: 0, row: 0, heading: 1 },
  target: { col: 3, row: 1 },
});
const RECAP_PROGRAM = [makeRepeat(3, [instr('AVANCER')]), instr('GAUCHE'), instr('AVANCER')];

function Synthese() {
  const run = runProgram(W_RECAP, RECAP_PROGRAM);

  return (
    <div className="space-y-4">
      {/* LE PROGRAMME ET SON EXÉCUTION, CÔTE À CÔTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wide text-slate-500">
            Ce que j’écris
          </div>
          <ProgramStrip
            program={RECAP_PROGRAM}
            onChange={() => {}}
            disabled
            title="Le programme"
          />
        </div>
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wide text-slate-500">
            Ce que fait ROBI
          </div>
          <RobotWorld
            world={W_RECAP}
            pos={run.final}
            trail={[W_RECAP.start, ...run.trace.map((t) => t.pos)]}
            height={130}
            reduced
            label={`Récapitulatif : ROBI arrive colonne ${run.final.col}, ligne ${run.final.row}`}
          />
          <p className="text-center text-[11px] font-mono text-slate-500 tabular-nums">
            3 cartes écrites · {run.steps} actions exécutées
          </p>
        </div>
      </div>

      {/* La carte complète REMPLACE les blocs « pièges » et « 4 réflexes »
          recopiés à la main : ils vivent déjà dans les items de la carte. */}
      <KnowledgeSnapshot complete variant="complete" />

      <Feedback tone="info">
        🤖 Un algorithme, c’est une suite d’instructions dans un ordre précis. Je l’écris, je
        l’exécute, je l’observe et je le corrige.
      </Feedback>
    </div>
  );
}

export default function Module08MissionFinale() {
  return (
    <BossFinal
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="🏆 Mission finale : ROBI explorateur"
      moduleSubtitle="Dix épreuves pour devenir Programmeur du potager."
      estimatedTime="15 min"
      lessonConfig={LESSON_CONFIG}
      timerSeconds={10 * 60}
      timerLabel="10 min"
      brief={{
        tag: '🏆 Boss final',
        title: 'ROBI part explorer le potager tout entier.',
        tone: 'amber',
        body: (
          <p>
            Dix épreuves pour tout vérifier : instructions, séquences, ordre, boucles et débogage.
            Réponds à toutes les épreuves, puis valide pour découvrir ta correction et tes badges.
          </p>
        ),
      }}
      registre={REGISTRE}
      skills={SKILLS}
      epreuves={EPREUVES}
      badges={BADGES}
      synthese={<Synthese />}
      completion={{
        masterTitle: 'Programmeur du potager !',
        title: 'Mission accomplie !',
        message: (
          <>
            Tu sais construire, exécuter, modifier et réparer un programme.
            <strong className="block mt-2 text-white">
              💡 Le réflexe à garder : lancer, observer, corriger, relancer.
            </strong>
          </>
        ),
        verbs: ['Découper', 'Écrire', 'Exécuter', 'Corriger'],
        masterBadgeLabel: 'Badge « Programme parfait » débloqué',
      }}
      xpPerCorrect={10}
    />
  );
}
