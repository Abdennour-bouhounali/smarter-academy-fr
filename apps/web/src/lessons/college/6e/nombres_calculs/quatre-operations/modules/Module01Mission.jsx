import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import QuantityLab from '../components/QuantityLab';

/**
 * Module 1 — LABORATOIRE : « Le tas qui obéit à quatre gestes ».
 *
 * Activity: agir sur UN tas de jetons — en poser, en retirer, poser un paquet
 *   entier, le répartir en parts égales — et regarder ce que fait la quantité.
 * Mathematical objective: les quatre opérations sont quatre ACTIONS sur une
 *   quantité, et non quatre mots à reconnaître dans un énoncé.
 * Student action: chaque geste transforme le tas immédiatement, sans clic de
 *   validation entre l'action et sa conséquence.
 * Mathematical state: UN entier `count` ; la grille, le compte affiché, le
 *   journal des gestes et le symbole proposé en dérivent tous.
 * Expected observation: poser un paquet de 6, c'est poser 6 jetons d'un coup —
 *   × est une addition groupée ; et répartir, c'est l'inverse de grouper.
 * Misconception targeted: « l'opération se devine au mot de l'énoncé »
 *   (ajouter/enlever/partager). Ici aucun énoncé : seul le geste décide.
 * Controlled surprise: le même tas de 24 se range en 4 parts de 6 OU en 6
 *   parts de 4 — deux rangements, une seule quantité.
 * Formalization: les symboles + − × ÷ ne sont nommés qu'à l'étape 3, après
 *   que les quatre gestes ont été faits (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: aucun geste n'est bloquant ; le journal garde la trace de ce
 *   qui a été essayé, et le tas se réinitialise à volonté.
 *
 * L'ancienne version était quatre histoires écrites suivies d'un QCM
 * « qu'est-ce qu'on fait avec les stylos ? » : l'élève lisait un texte et
 * choisissait un mot. Rien n'était manipulé, et le symbole tombait en
 * récompense. Le tas remplace la lecture par le geste.
 */

const START = 12;

/* Les quatre gestes. Chacun porte l'action, pas le nom de l'opération : le
   mot « addition » n'apparaît nulle part avant l'étape 3. */
const GESTES = [
  { id: 'poser',     label: 'Poser 5 jetons',        delta: () => 5,   kind: 'add',    tone: 'emerald' },
  { id: 'retirer',   label: 'Retirer 3 jetons',      delta: () => -3,  kind: 'remove', tone: 'rose' },
  { id: 'paquet',    label: 'Poser un paquet de 6',  delta: () => 6,   kind: 'pack',   tone: 'sky' },
  { id: 'repartir',  label: 'Répartir en 4 parts',   delta: () => 0,   kind: 'share',  tone: 'violet' },
];

const TONES = {
  emerald: 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-500',
  rose: 'border-rose-300 bg-rose-50 text-rose-800 hover:border-rose-500',
  sky: 'border-sky-300 bg-sky-50 text-sky-800 hover:border-sky-500',
  violet: 'border-violet-300 bg-violet-50 text-violet-800 hover:border-violet-500',
};

function GesteLab({ onGesture, tried }) {
  const [count, setCount] = useState(START);
  const [groups, setGroups] = useState(null);
  const [highlight, setHighlight] = useState(null);
  const [lastDelta, setLastDelta] = useState(0);
  const [journal, setJournal] = useState([]);

  const apply = (g) => {
    setGroups(null);
    if (g.kind === 'share') {
      // Répartir ne change pas la quantité : il la RANGE. C'est exactement ce
      // que l'élève doit voir — le tas ne maigrit pas, il s'organise.
      const parts = 4;
      setGroups(parts);
      setHighlight(null);
      setLastDelta(0);
      setJournal((j) => [...j, { txt: `${count} rangés en ${parts} parts de ${Math.floor(count / parts)}${count % parts ? ` (+${count % parts} en trop)` : ''}`, kind: 'share' }]);
      onGesture('share');
      return;
    }
    const d = g.delta();
    const next = Math.max(0, count + d);
    const real = next - count;
    setCount(next);
    setHighlight(real > 0 ? 'added' : 'removed');
    setLastDelta(real);
    setJournal((j) => [...j, { txt: `${count} → ${next}`, kind: g.kind, d: real }]);
    onGesture(g.kind);
  };

  const reset = () => {
    setCount(START); setGroups(null); setHighlight(null); setLastDelta(0); setJournal([]);
  };

  return (
    <div className="space-y-3">
      <QuantityLab
        count={count}
        groups={groups}
        highlight={highlight}
        lastDelta={lastDelta}
        unit="jeton"
      />

      <div className="grid grid-cols-2 gap-2">
        {GESTES.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => apply(g)}
            className={`min-h-[48px] px-3 py-2 rounded-xl border-2 text-sm font-bold transition-all
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${TONES[g.tone]}
              ${tried.includes(g.kind) ? 'ring-1 ring-inset ring-slate-300' : ''}`}
          >
            {g.label}
            {tried.includes(g.kind) && <span className="ml-1.5 text-xs opacity-60">✓</span>}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Gestes essayés : <strong className="font-mono">{tried.length}</strong> / 4
        </p>
        <button
          type="button"
          onClick={reset}
          className="min-h-[44px] px-4 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Repartir de {START}
        </button>
      </div>

      <AnimatePresence>
        {journal.length > 0 && (
          <motion.ul
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1 max-h-32 overflow-y-auto"
          >
            {journal.slice(-6).map((e, i) => (
              <li key={i} className="text-xs font-mono text-slate-600 flex items-center gap-2">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                  e.kind === 'add' ? 'bg-emerald-500' : e.kind === 'remove' ? 'bg-rose-500'
                  : e.kind === 'pack' ? 'bg-sky-500' : 'bg-violet-500'}`} />
                {e.txt}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Étape 2 — la surprise contrôlée : 24 jetons se rangent de deux façons. */
function RangementLab({ done, onDone }) {
  const [parts, setParts] = useState(4);
  const TOTAL = 24;
  const per = TOTAL / parts;
  const exact = Number.isInteger(per);
  const [seen, setSeen] = useState([4]);

  const choose = (p) => {
    setParts(p);
    setSeen((s) => (s.includes(p) ? s : [...s, p]));
    if (!done && [...new Set([...seen, p])].filter((x) => TOTAL % x === 0).length >= 3) onDone();
  };

  return (
    <div className="space-y-3">
      <QuantityLab count={TOTAL} groups={exact ? parts : null} unit="jeton" color="#7c3aed" />
      <div className="flex flex-wrap gap-2 justify-center">
        {[2, 3, 4, 5, 6, 8].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => choose(p)}
            aria-pressed={parts === p}
            className={`min-h-[44px] min-w-[52px] px-3 rounded-xl border-2 font-mono font-bold text-sm transition-all
              focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
              ${parts === p ? 'border-violet-500 bg-violet-50 text-violet-800' : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300'}`}
          >
            {p} parts
          </button>
        ))}
      </div>
      <Feedback tone={exact ? 'ok' : 'info'}>
        {exact ? (
          <>
            <strong className="font-mono">24 = {parts} × {per}</strong> — le tas n'a pas changé de
            taille, il a changé de <em>rangement</em>. {seen.filter((x) => TOTAL % x === 0).length >= 3
              ? 'Trois rangements différents pour une seule quantité.'
              : 'Essaie encore un autre nombre de parts.'}
          </>
        ) : (
          <>
            En {parts} parts, ça ne tombe pas juste : {Math.floor(TOTAL / parts)} par part et{' '}
            <strong>{TOTAL % parts} en trop</strong>. Toutes les répartitions ne sont pas possibles.
          </>
        )}
      </Feedback>
    </div>
  );
}

/* Étape 3 — nommer les signes, une fois les quatre gestes faits. */
const SIGNE_Q = {
  q: 'Tu viens de poser un paquet de 6 jetons d’un seul coup. Quel calcul décrit le mieux ce geste ?',
  options: ['6 + 6', '1 × 6', '6 − 1', '6 ÷ 1'],
  correct: 1,
  explain:
    "Poser UN paquet de 6, c'est poser 6 jetons en une fois : 1 × 6. La multiplication est une addition groupée — c'est pour cela qu'un paquet fait sauter la quantité de 6 d'un coup, au lieu de la faire monter jeton par jeton.",
  explainWrong:
    "Regarde ce qui s'est passé sur le tas : un seul geste, et 6 jetons de plus. Ce n'est pas une soustraction (le tas a grossi) ni un partage (rien n'a été rangé).",
};

export default function Module01Mission() {
  const [tried, setTried] = useState([]);
  const [pred, setPred] = useState(null);
  const [rangeDone, setRangeDone] = useState(false);
  const [signeDone, setSigneDone] = useState(false);

  const onGesture = (kind) => setTried((t) => (t.includes(kind) ? t : [...t, kind]));
  const allGestes = tried.length >= 4;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Mission : le tas qui obéit"
      moduleSubtitle="Un seul tas de jetons, quatre gestes. Regarde ce que chacun lui fait."
      estimatedTime="8 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Quatre gestes, une seule quantité.',
        tone: 'slate',
        body: (
          <p>
            Voici <strong className="text-white">12 jetons</strong>. Tu peux en poser, en retirer,
            en poser tout un paquet, ou les répartir. Essaie les quatre — et surveille le nombre.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Essaie les quatre gestes',
          subtitle: 'Le tas réagit tout de suite : rien à valider.',
          done: allGestes,
          content: (kit) => (
            <div className="space-y-4">
              <PredictionChips
                prompt="d’après toi, quel geste fera grandir le tas le PLUS vite ?"
                options={[
                  { id: 'poser', label: 'Poser 5 jetons' },
                  { id: 'paquet', label: 'Poser un paquet de 6' },
                  { id: 'egal', label: 'Les deux pareil' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={allGestes}
              />
              <GesteLab
                onGesture={(k) => { onGesture(k); kit.react?.(true); }}
                tried={tried}
              />
              {allGestes && (
                <Feedback tone="ok">
                  {pred === 'paquet'
                    ? 'Ta prédiction tenait : '
                    : pred ? 'Ta prédiction disait autre chose, et pourtant : '
                    : ''}
                  les quatre gestes agissent sur le <strong>même</strong> tas. Deux le font grandir,
                  un le fait maigrir — et le dernier ne change pas sa taille du tout : il le
                  <strong> range</strong>.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le même tas, rangé autrement',
          subtitle: 'Change le nombre de parts et regarde ce qui reste constant.',
          done: rangeDone,
          content: (
            <div className="space-y-3">
              <RangementLab done={rangeDone} onDone={() => setRangeDone(true)} />
              {rangeDone && (
                <Feedback tone="ok">
                  24 jetons, c'est <strong className="font-mono">2 × 12</strong>,{' '}
                  <strong className="font-mono">3 × 8</strong>,{' '}
                  <strong className="font-mono">4 × 6</strong>… La quantité ne bouge pas ; seule la
                  façon de la grouper change. Ranger et grouper sont deux gestes inverses.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Mettre un signe sur chaque geste',
          done: signeDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt={SIGNE_Q.q}
                options={SIGNE_Q.options}
                correct={SIGNE_Q.correct}
                cols={2}
                explain={SIGNE_Q.explain}
                explainWrong={SIGNE_Q.explainWrong}
                requires={[]}
                solved={signeDone}
                onAnswered={() => setSigneDone(true)}
              />
              {/* La brique arrive APRÈS les gestes ET après l'interprétation :
                  l'élève a agi, observé, puis mis un mot dessus. */}
              {signeDone && (
                <KnowledgeBrick
                  id="quatre-situations"
                  variant="new"
                  lead="Tu as fait les quatre gestes avant qu’aucun ne porte de nom. Les voici."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Chaque geste a maintenant son signe. On va les regarder un par
          un, en commençant par réunir deux quantités.
        </KnowledgeSnapshot>
      }
    />
  );
}
