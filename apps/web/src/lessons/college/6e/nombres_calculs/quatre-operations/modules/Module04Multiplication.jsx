import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ArrayGrid from '../components/ArrayGrid';
import SplitRectangle from '../components/SplitRectangle';

/**
 * Module 4 V2 — reconstruit sur le lesson kit.
 *
 * Quatre manipulations maison (groupes égaux, grille libre, décomposition de
 * 7×23, multiplication posée de 23×14) restent des composants bespoke —
 * elles suivent le contrat kit (solved/onSolved, react() au bon moment,
 * onSolved inconditionnel) mais ne sont pas des questions à choix. La seule
 * manipulation déjà libre (§11 : GridManip, exploration sans contrainte de
 * justesse) le reste : son bouton "J'ai exploré la grille" appelle
 * kit.react(true) puis onComplete, sans jamais bloquer.
 *
 * Les 3 exercices de pratique (Phase 4 de l'original) violaient la politique
 * formative — un "Réessayer" bloquant tant que la réponse n'était pas
 * correcte. Convertis ici en 3 <NumericQuestion> séquentielles : révélation
 * immédiate, onAnswered inconditionnel, indice affiché en cas d'erreur.
 */

/* ─── Manipulation 1 : les boîtes qu'on POSE et qu'on RETIRE ─────────
   Deux corrections par rapport à la version précédente :
   1. les boutons `+` / `−` sont remplacés par le geste direct — on tape une
      boîte pour la retirer, on tape l'emplacement vide pour en poser une ;
   2. la manipulation n'est PLUS figée quand l'étape est validée
      (`disabled={solved}` était un bug de classe : l'élève doit pouvoir
      continuer à explorer après la découverte). */
function EqualGroups({ onSolved, solved, react }) {
  const [numGroups, setNumGroups] = useState(1);
  const perGroup = 3;
  const target = 4;
  const MAX = 8;

  const total = numGroups * perGroup;
  const reached = numGroups >= target;

  React.useEffect(() => {
    if (reached && !solved) { react?.(true); onSolved?.(); }
  }, [reached, solved, onSolved, react]);

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600 leading-relaxed">
        Chaque boîte contient <strong>3 objets</strong>. Touche l'emplacement vide pour{' '}
        <strong>poser une boîte</strong>, ou une boîte pour la <strong>retirer</strong>.
      </p>

      <div className="flex flex-wrap gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[110px]">
        {Array.from({ length: numGroups }).map((_, gi) => (
          <motion.button
            key={gi}
            type="button"
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setNumGroups((v) => Math.max(1, v - 1))}
            aria-label={`Retirer la boîte ${gi + 1}`}
            className="flex flex-col items-center gap-1.5 bg-violet-50 border-2 border-violet-200 rounded-xl p-3 min-h-[76px]
                       hover:border-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <div className="flex gap-1">
              {Array.from({ length: perGroup }).map((_, oi) => (
                <span key={oi} className="w-6 h-6 rounded-full bg-violet-400 shadow-sm" />
              ))}
            </div>
            <span className="text-[10px] font-mono text-violet-600 font-bold">Boîte {gi + 1}</span>
          </motion.button>
        ))}

        {/* L'emplacement vide EST le bouton « poser une boîte » : le geste se
            fait là où l'objet va apparaître, pas dans une barre de contrôle. */}
        {numGroups < MAX && (
          <button
            type="button"
            onClick={() => setNumGroups((v) => Math.min(MAX, v + 1))}
            aria-label="Poser une boîte de 3 objets"
            className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-violet-300 rounded-xl p-3
                       min-h-[76px] min-w-[76px] text-violet-500 hover:border-violet-500 hover:bg-violet-50/50
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <span className="text-2xl leading-none" aria-hidden="true">+</span>
            <span className="text-[10px] font-mono font-bold">poser</span>
          </button>
        )}
      </div>

      <div className="text-center" role="status" aria-live="polite">
        <div className="text-2xl font-space font-bold text-violet-700">
          {numGroups} boîte{numGroups > 1 ? 's' : ''}
        </div>
        <div className="text-sm text-slate-500">
          {numGroups} × {perGroup} = <strong className="text-violet-700">{total}</strong> objets
        </div>
      </div>

      <div className="bg-slate-800 text-white rounded-xl p-4 text-center space-y-1">
        <div className="text-xs font-mono text-slate-400">Addition répétée → pont vers la multiplication</div>
        <div className="font-space font-bold text-lg break-words">
          {Array.from({ length: numGroups }, () => perGroup).join(' + ')}
          <span className="text-violet-300 ml-2">= {total}</span>
        </div>
        <div className={`text-xl font-bold mt-1 ${numGroups >= 3 ? 'text-violet-300' : 'text-slate-500'}`}>
          {numGroups} × {perGroup} = {total}
        </div>
      </div>

      <AnimatePresence>
        {reached && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="inline w-4 h-4 mr-1" aria-hidden="true" />
              <strong>{numGroups} × {perGroup} = {total}</strong> — des groupes de même taille.
              Écrire la somme prend {numGroups} termes ; la multiplication en prend deux.
              Continue à poser et retirer des boîtes : la ligne du haut s'allonge, celle du bas non.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Manipulation 2 : le rectangle qu'on redimensionne au coin ─────────
   L'ancienne grille était pilotée par quatre boutons `+` / `−` posés sous
   elle. Ici l'élève tire le COIN du rectangle : les deux facteurs changent
   sous sa main, et le pivot 3×4 → 4×3 devient une observation, pas une
   règle annoncée. */
function GridManip({ onSolved, solved, react }) {
  const [dim, setDim] = useState({ rows: 3, cols: 4 });
  const [seen, setSeen] = useState([]);
  const [pivotSeen, setPivotSeen] = useState(false);

  const resize = ({ rows, cols }) => {
    setDim({ rows, cols });
    const key = `${rows}x${cols}`;
    setSeen((v) => {
      if (v.includes(key)) return v;
      const next = [...v, key];
      // Le pivot : avoir vu a×b ET b×a, avec a ≠ b — c'est la commutativité
      // constatée, pas récitée.
      if (rows !== cols && v.includes(`${cols}x${rows}`)) setPivotSeen(true);
      return next;
    });
  };

  const explored = seen.length >= 4;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 leading-relaxed">
        Ce rectangle est fait de jetons. Tire son <strong>coin</strong> et regarde le total.
      </p>

      <ArrayGrid rows={dim.rows} cols={dim.cols} onResize={resize} />

      {pivotSeen && (
        <Feedback tone="ok">
          Tu as fabriqué <strong className="font-mono">{dim.rows} × {dim.cols}</strong> et aussi{' '}
          <strong className="font-mono">{dim.cols} × {dim.rows}</strong> : le rectangle a pivoté,
          mais le nombre de jetons n'a pas bougé. L'ordre des deux nombres ne change pas le total.
        </Feedback>
      )}
      {!pivotSeen && explored && (
        <Feedback tone="info">
          {seen.length} rectangles essayés. Essaie maintenant de faire pivoter le rectangle :
          fabrique <strong className="font-mono">{dim.cols} × {dim.rows}</strong> après{' '}
          <strong className="font-mono">{dim.rows} × {dim.cols}</strong>.
        </Feedback>
      )}
      {!explored && (
        <Feedback tone="info">
          Fabrique plusieurs rectangles différents — tu en as essayé{' '}
          <strong className="font-mono">{seen.length}</strong> sur 4.
        </Feedback>
      )}

      {!solved && explored && (
        <button
          type="button"
          onClick={() => { react(true); onSolved(); }}
          className="w-full min-h-[48px] py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          J'ai exploré la grille → continuer
        </button>
      )}
    </div>
  );
}

/* ─── Manipulation 3 : COUPER le rectangle soi-même ────────────────────
   L'ancienne version était un diaporama de trois panneaux : l'élève cliquait
   « Étape suivante → » et lisait le raisonnement tout fait. Ici il coupe le
   rectangle lui-même et constate que la somme des deux morceaux ne dépend
   pas de l'endroit de la coupe — la distributivité devient une observation
   d'AIRE, et la coupe ronde (20 | 3) apparaît comme la plus commode. */
function DecompositionManip({ onSolved, solved, react }) {
  const ROWS = 7, COLS = 23;
  const [cut, setCut] = useState(11);
  const [seen, setSeen] = useState([]);
  const roundCut = cut === 20;

  const change = (v) => {
    setCut(v);
    setSeen((prev) => (prev.includes(v) ? prev : [...prev, v]));
  };

  const explored = seen.length >= 3;
  const canFinish = explored && roundCut;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 leading-relaxed">
        Calculer <strong className="font-mono">7 × 23</strong> de tête est difficile. Coupe ce
        rectangle en deux et regarde ce que valent les morceaux.
      </p>

      <SplitRectangle rows={ROWS} cols={COLS} cut={cut} onCut={change} />

      {explored && !roundCut && (
        <Feedback tone="info">
          Où que tu coupes, la somme des deux morceaux vaut toujours{' '}
          <strong className="font-mono">{ROWS * COLS}</strong>. Cherche maintenant la coupe qui rend
          les deux calculs faciles à faire de tête — celle qui laisse un <strong>nombre rond</strong> à
          gauche.
        </Feedback>
      )}
      {roundCut && (
        <Feedback tone="ok">
          Voilà la coupe utile : <strong className="font-mono">7 × 20 = 140</strong> et{' '}
          <strong className="font-mono">7 × 3 = 21</strong>, donc{' '}
          <strong className="font-mono">140 + 21 = 161</strong>. Découper un facteur en un nombre
          rond plus un petit reste, c'est ce qui rend le calcul mental possible.
        </Feedback>
      )}
      {!explored && (
        <Feedback tone="info">
          Essaie plusieurs coupes ({seen.length} / 3) et surveille la ligne du bas.
        </Feedback>
      )}

      {canFinish && !solved && (
        <button
          type="button"
          onClick={() => { react(true); onSolved(); }}
          className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          J'ai trouvé la coupe utile → suite
        </button>
      )}
    </div>
  );
}

/* ─── Multiplication posée : 23 × 14 (bespoke walkthrough) ─────────── */
function PosedMultiplication({ onSolved, solved, react }) {
  const [step, setStep] = useState(solved ? 3 : 0);

  const steps = [
    {
      title: 'Le sens : 23 × 14',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Avant de poser le calcul, comprenons ce que signifie <strong>23 × 14</strong> :</p>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2 text-sm">
            <div className="font-bold text-indigo-700">23 × 14</div>
            <div className="text-indigo-600">= 23 × (10 + 4)</div>
            <div className="text-indigo-600">= <span className="font-bold">23 × 10</span> + <span className="font-bold">23 × 4</span></div>
          </div>
          <p className="text-sm text-slate-500">On va calculer ces deux parties séparément, puis les additionner.</p>
        </div>
      ),
    },
    {
      title: '1re partie : 23 × 4',
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse text-center font-mono text-xl">
              <thead><tr className="text-xs text-slate-400"><th className="px-5 py-1">Dizaines</th><th className="px-5 py-1">Unités</th></tr></thead>
              <tbody>
                <tr><td className="px-5 py-2 font-bold">2</td><td className="px-5 py-2 font-bold">3</td></tr>
                <tr><td className="px-5 py-2 font-bold text-slate-500">×</td><td className="px-5 py-2 font-bold text-slate-500">4</td></tr>
                <tr className="border-t-2 border-slate-400">
                  <td className="px-5 py-2 text-indigo-700 font-bold">9</td>
                  <td className="px-5 py-2 text-indigo-700 font-bold">2</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-600 text-center">23 × 4 = 92</p>
        </div>
      ),
    },
    {
      title: "2e partie : 23 × 10 (décalage d'une position)",
      content: (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
            <p className="font-bold text-amber-800">Multiplier par 10 = décaler d'une position vers la gauche</p>
            <p className="text-amber-700 mt-1">23 × 10 = 230 (on écrit 0 à droite et on décale d'une colonne)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="mx-auto border-collapse text-center font-mono text-xl">
              <thead><tr className="text-xs text-slate-400"><th className="px-5 py-1">Centaines</th><th className="px-5 py-1">Dizaines</th><th className="px-5 py-1">Unités</th></tr></thead>
              <tbody>
                <tr><td className="px-5 py-2 text-amber-600 font-bold">2</td><td className="px-5 py-2 text-amber-600 font-bold">3</td><td className="px-5 py-2 text-amber-600 font-bold">0</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-center text-slate-600">23 × 10 = 230</p>
        </div>
      ),
    },
    {
      title: 'Addition des deux parties',
      content: (
        <div className="space-y-3">
          <div className="bg-slate-800 text-white rounded-xl p-5 text-center space-y-2">
            <div className="text-slate-400 text-sm">23 × 4 + 23 × 10</div>
            <div className="text-2xl font-space font-bold">92 + 230</div>
            <div className="text-3xl font-space font-bold text-violet-300">= 322</div>
          </div>
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <CheckCircle2 className="inline w-4 h-4 mr-1" />
            <strong>23 × 14 = 322</strong> — L'algorithme posé fait exactement ces deux étapes !
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {steps.slice(0, step + 1).map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="text-xs font-mono font-bold text-indigo-600 uppercase">{s.title}</div>
          {s.content}
        </motion.div>
      ))}
      {step < steps.length - 1 && (
        <button onClick={() => setStep((v) => v + 1)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all">
          Étape suivante →
        </button>
      )}
      {step === steps.length - 1 && !solved && (
        <button
          onClick={() => { react(true); onSolved(); }}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
        >
          Compris → pratique
        </button>
      )}
    </div>
  );
}

/* ─── Pratique — 3 exercices, NumericQuestion séquentielles ─────────── */
const EXERCISES = [
  { q: '6 × 7', expected: 42 },
  { q: '8 × 9', expected: 72, explainFor: () => 'Tu peux décomposer : 8×9 = 8×10 − 8×1' },
  { q: '4 × 25', expected: 100, explainFor: () => '4 × 25 = 4 × (20 + 5) = 80 + 20 = 100' },
];

function MultPractice({ q1, setQ1, q2, setQ2, q3, setQ3 }) {
  return (
    <div className="space-y-6">
      <NumericQuestion
        prompt={`Exercice 1/3 — ${EXERCISES[0].q} = ?`}
        requires={['facteurs-produit']}
        expected={EXERCISES[0].expected}
        explain="6 × 7 = 42."
        solved={q1}
        onAnswered={() => setQ1(true)}
      />
      {q1 && (
        <NumericQuestion
          prompt={`Exercice 2/3 — ${EXERCISES[1].q} = ?`}
          requires={['facteurs-produit', 'decomposer-produit']}
          expected={EXERCISES[1].expected}
          explain="8 × 9 = 72."
          explainFor={EXERCISES[1].explainFor}
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      )}
      {q2 && (
        <NumericQuestion
          prompt={`Exercice 3/3 — ${EXERCISES[2].q} = ?`}
          requires={['facteurs-produit', 'decomposer-produit']}
          expected={EXERCISES[2].expected}
          explain="4 × 25 = 100."
          explainFor={EXERCISES[2].explainFor}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      )}
    </div>
  );
}

/* ─── Module principal ────────────────────────────────────────────── */
export default function Module04Multiplication() {
  const [groupsDone, setGroupsDone] = useState(false);
  const [gridDone, setGridDone] = useState(false);
  const [decompDone, setDecompDone] = useState(false);
  const [posedDone, setPosedDone] = useState(false);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const s1 = groupsDone;
  const s2 = gridDone;
  const s3 = decompDone;
  const s4 = posedDone;
  const s5 = q1 && q2 && q3;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Multiplier : construire des groupes"
      moduleSubtitle="Groupes égaux, grille interactive, décomposition et multiplication posée."
      estimatedTime="9 min"
      brief={{
        tag: '✖️ Mission 04',
        title: 'Des groupes de même taille',
        body: (
          <p>
            La multiplication, c'est compter vite des groupes identiques. Tu vas construire ces groupes à la
            main, puis découvrir comment décomposer un calcul pour le rendre simple.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Des groupes de même taille',
          done: s1,
          content: (kit) => (
            <EqualGroups solved={s1} onSolved={() => setGroupsDone(true)} react={kit.react} />
          ),
        },
        {
          num: 2,
          title: 'La grille rectangulaire',
          subtitle: 'Explore librement, puis découvre le vocabulaire de la multiplication.',
          done: s2,
          content: (kit) => (
            <div className="space-y-6">
              <GridManip solved={s2} onSolved={() => setGridDone(true)} react={kit.react} />
              {/* La grille vient d'être remplie : lignes, colonnes et total
                  sont sous les yeux quand les trois mots arrivent. */}
              {s2 && (
                <KnowledgeBrick
                  id="facteurs-produit"
                  variant="new"
                  lead="Les lignes, les colonnes et le nombre de cases que tu viens de compter."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Décomposer pour calculer',
          done: s3,
          content: (kit) => (
            <div className="space-y-5">
              <DecompositionManip solved={s3} onSolved={() => setDecompDone(true)} react={kit.react} />
              {/* La méthode est nommée une fois que l'élève l'a exécutée. */}
              {s3 && (
                <KnowledgeBrick
                  id="decomposer-produit"
                  variant="new"
                  lead="Le 23 que tu viens de couper en 20 et 3 pour t'en sortir de tête."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'La multiplication posée',
          done: s4,
          content: (kit) => (
            <PosedMultiplication solved={s4} onSolved={() => setPosedDone(true)} react={kit.react} />
          ),
        },
        {
          num: 5,
          title: "Je m'entraîne",
          done: s5,
          content: (
            <MultPractice q1={q1} setQ1={setQ1} q2={q2} setQ2={setQ2} q3={q3} setQ3={setQ3} />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Trois opérations posées sur la carte. La quatrième, elle,
          laisse parfois quelque chose de côté — et c'est tout son intérêt.
        </KnowledgeSnapshot>
      }
    />
  );
}
