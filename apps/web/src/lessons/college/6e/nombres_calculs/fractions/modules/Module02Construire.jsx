import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentModule, BatchChoiceQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartitionShape from '../components/PartitionShape';
import { texFrac } from '../components/fractionUtils';

/**
 * Module 2 V2 — Construire une fraction.
 *
 * Progression pédagogique :
 *   Étape 1 — Conflit cognitif : 4 morceaux ≠ 4 parts égales (TapQuestion).
 *   Étape 2 — Atelier de construction : l'élève choisit d'abord la découpe,
 *             puis prend des parts, la fraction apparaît comme CONCLUSION.
 *             3 constructions à difficulté croissante (1/2 guidé → 3/4 → 7/10 autonome).
 *   Étape 3 — Mini synthèse : ce que j'ai découvert (pas encore numérateur/dénominateur formels).
 *
 * La règle « parts égales » n'est JAMAIS posée en amont ; elle émerge du
 * conflit cognitif de l'étape 1 et de l'observation dans l'atelier.
 *
 * Contrat kit respecté :
 *   - react(bool) appelé à chaque validation ;
 *   - onSolved() inconditionnel dès l'objectif atteint ;
 *   - aucun état « faux bloquant » exposé.
 */

/* ═══════════════════════════════════════════════════════════════════
   HELPERS PRÉSENTATIONNELS
   ═══════════════════════════════════════════════════════════════════ */

/** Petite pastille de contexte */
function Tag({ children, color = 'slate' }) {
  const cls = {
    slate:  'bg-slate-100 text-slate-600 border-slate-200',
    amber:  'bg-amber-100 text-amber-700 border-amber-300',
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    emerald:'bg-emerald-100 text-emerald-700 border-emerald-300',
  }[color];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-widest ${cls}`}>
      {children}
    </span>
  );
}

/** Compteur de parts — central et lisible */
function PartsCounter({ taken, total, targetNum }) {
  const done = taken === targetNum;
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`font-mono font-extrabold text-3xl sm:text-4xl transition-colors ${taken > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
        {taken} / {total}
      </div>
      <div className="text-sm text-slate-500 font-sans">
        {done
          ? '✓ Parts prises'
          : taken === 0
          ? 'Touche les parts que tu veux prendre'
          : taken < targetNum
          ? `Encore ${targetNum - taken} part${targetNum - taken > 1 ? 's' : ''}…`
          : `Tu en as pris ${taken} — essaie d'en prendre ${targetNum}`}
      </div>
    </div>
  );
}

/** Révélation de la fraction — apparaît APRÈS la manipulation */
function FractionReveal({ num, den, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="reveal"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="flex flex-col items-center gap-2 py-3"
        >
          <Tag color="indigo">La fraction que tu viens de construire</Tag>
          <div className="text-5xl sm:text-6xl font-mono font-extrabold text-indigo-600 py-1" aria-label={`${num} sur ${den}`}>
            <MathText>{texFrac(num, den)}</MathText>
          </div>
          <p className="text-base text-slate-600 font-sans text-center leading-relaxed max-w-xs">
            {num} part{num > 1 ? 's' : ''} prises parmi les <strong>{den} parts égales</strong> de l'unité.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ÉTAPE 2 — ATELIER : CONSTRUCTION D'UNE FRACTION
   ═══════════════════════════════════════════════════════════════════
   
   Séquence par construction :
     Phase SPLIT  : l'élève choisit en combien de parts couper l'unité.
     Phase TAKE   : il prend des parts (le nombre cible est affiché
                    SEULEMENT après la découpe pour éviter l'effet « devine »).
     Phase REVEAL : la fraction apparaît comme conclusion.
   ═══════════════════════════════════════════════════════════════════ */

const DEN_OPTIONS = [2, 3, 4, 5, 8, 10];

/**
 * Une construction :
 *   den   — nombre de parts égales (dénominateur cible, caché jusqu'à la phase TAKE)
 *   num   — parts à prendre (affiché seulement en phase TAKE)
 *   shape — 'bar' | 'circle'
 *   tone  — palette PartitionShape
 *   hint  — aide contextuelle affichée en phase SPLIT
 */
function Construction({ config, solved, onSolved, reactKit, showTarget }) {
  const { den, num, shape, tone, hint } = config;
  const [phase, setPhase] = useState('split');  // 'split' | 'take' | 'reveal'
  const [chosenDen, setChosenDen] = useState(null);
  const [cells, setCells] = useState([]);

  const denOk   = chosenDen === den;
  const taken   = solved ? num : cells.length;
  const numOk   = cells.length === num;

  /* ── Phase SPLIT : choisir la découpe ── */
  const pickDen = (d) => {
    if (solved || phase !== 'split') return;
    setChosenDen(d);
    setCells([]);
    setPhase('take');
  };

  /* ── Phase TAKE : prendre des parts ── */
  const toggle = (i) => {
    if (solved || phase !== 'take') return;
    setCells((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort((a, b) => a - b)
    );
  };

  /* ── Validation : la fraction apparaît ── */
  const validate = () => {
    if (!denOk || !numOk || solved) return;
    setPhase('reveal');
    reactKit(true);
    onSolved();
  };

  /* ── Réinitialiser la découpe ── */
  const resetSplit = () => {
    if (solved) return;
    setChosenDen(null);
    setCells([]);
    setPhase('split');
  };

  return (
    <div className="space-y-5">

      {/* ── Phase SPLIT ── */}
      {phase === 'split' && (
        <div className="space-y-3">
          {hint && (
            <p className="text-base text-slate-600 font-sans leading-relaxed">{hint}</p>
          )}
          <p className="text-base sm:text-lg font-semibold text-slate-800 font-sans">
            En combien de parts égales veux-tu couper l'unité ?
          </p>
          <div className="flex flex-wrap gap-2.5">
            {DEN_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => pickDen(d)}
                aria-label={`Couper en ${d} parts`}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 font-mono font-bold text-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Phase TAKE ── */}
      {(phase === 'take' || phase === 'reveal' || solved) && chosenDen !== null && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

          {/* Résumé de la découpe + possibilité de recommencer */}
          <div className="flex items-center gap-3 flex-wrap">
            <Tag color="amber">
              Unité coupée en {chosenDen} parts égales
            </Tag>
            {phase === 'take' && !denOk && (
              <button
                type="button"
                onClick={resetSplit}
                className="text-sm text-indigo-600 underline font-sans focus:outline-none focus-visible:ring-1"
              >
                Changer la découpe
              </button>
            )}
          </div>

          {/* Feedback si mauvaise découpe — AVANT de montrer la cible */}
          {phase === 'take' && !denOk && (
            <Feedback tone="hint">
              Tu as choisi {chosenDen} parts. Observe bien ton unité : {chosenDen} parts n'est peut-être pas
              la bonne découpe pour cet exercice. Tu peux changer le nombre ci-dessus.
            </Feedback>
          )}

          {/* Chocolat / pizza — hero visuel */}
          <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 sm:p-6 flex flex-col items-center gap-4">
            <div className="w-full max-w-xs">
              <PartitionShape
                shape={shape}
                parts={chosenDen}
                cells={solved ? Array.from({ length: num }, (_, i) => i) : cells}
                onToggle={phase === 'take' ? toggle : undefined}
                tone={tone}
                size="lg"
              />
            </div>

            {/* Compteur */}
            {phase === 'take' && denOk && (
              <PartsCounter taken={cells.length} total={chosenDen} targetNum={num} />
            )}

            {/* Affichage de la cible — seulement APRÈS que l'élève a choisi la découpe */}
            {phase === 'take' && denOk && showTarget && (
              <p className="text-base text-indigo-700 font-semibold font-sans text-center">
                Prends maintenant exactement <strong>{num} part{num > 1 ? 's' : ''}</strong>.
              </p>
            )}
          </div>

          {/* Valider */}
          {phase === 'take' && denOk && (
            <div className="flex justify-center">
              <ValidateButton onClick={validate} disabled={!numOk} tone="indigo">
                J'ai construit ma fraction →
              </ValidateButton>
            </div>
          )}

          {/* Mauvais nombre de parts — feedback formatif */}
          {phase === 'take' && denOk && cells.length > 0 && cells.length !== num && showTarget && (
            <p className="text-center text-sm text-slate-500 font-sans">
              {cells.length > num
                ? `Tu en as pris ${cells.length} — enlèves-en ${cells.length - num}.`
                : `Tu en as pris ${cells.length} — il en faut ${num}.`}
            </p>
          )}
        </motion.div>
      )}

      {/* ── Phase REVEAL / solved ── */}
      <FractionReveal
        num={num}
        den={chosenDen ?? den}
        visible={phase === 'reveal' || solved}
      />
    </div>
  );
}

/* ─── Configuration des 3 constructions ─────────────────────────── */
const BUILDS = [
  {
    den: 2,
    num: 1,
    shape: 'bar',
    tone: 'sky',
    hint: "Commence par couper l'unit\u00e9 en deux \u2014 le partage le plus simple.",
    showTarget: true,  // guidé : on montre la cible immédiatement
    label: 'Découverte — 1/2',
    sublabel: 'Le partage le plus simple.',
  },
  {
    den: 4,
    num: 3,
    shape: 'bar',
    tone: 'amber',
    hint: "Cette fois, partage l'unit\u00e9 en 4 parts \u00e9gales, puis prends 3 parts.",
    showTarget: true,  // encore guidé
    label: 'Construction — 3/4',
    sublabel: 'Reprends le geste avec une autre fraction.',
  },
  {
    den: 10,
    num: 7,
    shape: 'bar',
    tone: 'emerald',
    hint: null,        // défi autonome : pas d'instruction sur la cible avant la découpe
    showTarget: false, // la cible n'est révélée qu'après que l'élève a choisi la découpe
    label: 'Défi — 7/10',
    sublabel: 'À toi de trouver : construis 7/10.',
  },
];

/* ═══════════════════════════════════════════════════════════════════
   ÉTAPE 2 — Wrapper multi-construction
   ═══════════════════════════════════════════════════════════════════ */
function AtelierStep({ done, setDone, react: reactKit }) {
  return (
    <div className="space-y-10">
      {BUILDS.map((cfg, i) => {
        const isUnlocked = i === 0 || done.includes(i - 1);
        if (!isUnlocked) return null;
        return (
          <div key={i} className={`space-y-3 ${i > 0 ? 'border-t border-slate-100 pt-7' : ''}`}>
            <div className="space-y-0.5">
              <Tag color={i === BUILDS.length - 1 ? 'indigo' : 'slate'}>
                {cfg.label}
              </Tag>
              {cfg.sublabel && (
                <p className="text-sm text-slate-500 font-sans">{cfg.sublabel}</p>
              )}
            </div>

            {/* Défi 7/10 : révèle la cible seulement après la découpe */}
            {i === BUILDS.length - 1 && !done.includes(i) && (
              <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3">
                <p className="text-base font-semibold text-indigo-900 font-sans">
                  Construis{' '}
                  <span className="font-mono"><MathText>{texFrac(7, 10)}</MathText></span>
                  {' '}en choisissant d'abord ta découpe, puis tes parts.
                </p>
              </div>
            )}

            <Construction
              config={cfg}
              solved={done.includes(i)}
              onSolved={() => setDone((d) => (d.includes(i) ? d : [...d, i]))}
              reactKit={reactKit}
              showTarget={cfg.showTarget || done.includes(i)}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ÉTAPE 1 — Conflit cognitif : 4 morceaux ≠ 4 parts égales
   ═══════════════════════════════════════════════════════════════════ */

// Figure inégale : poids très différents (1 gros morceau parmi les 4)
const UNEQUAL_WEIGHTS = [1, 1, 1, 4];

const CONFLICT_Q = {
  q: 'Une tablette a été coupée en 4 morceaux. Chaque personne reçoit un morceau. Est-ce que chacun reçoit vraiment 1/4 ?',
  options: [
    'Oui — il y a bien 4 morceaux',
    'Non — les morceaux ne sont pas de la même taille',
    'Je ne sais pas encore',
  ],
  correct: 1,
  explain:
    "Il y a bien 4 morceaux \u2014 mais ils n'ont pas la m\u00eame taille. Une personne re\u00e7oit un gros morceau, une autre un tout petit. Pour parler de \u00ab\u00a0quarts\u00a0\u00bb, les 4 parts doivent \u00eatre de la m\u00eame taille.",
  explainWrong:
    'Regarde bien les morceaux : ont-ils vraiment la même taille ? Compte les morceaux, puis compare leurs largeurs.',
};

function ConflictStep() {
  return (
    <div className="space-y-5">
      {/* La figure inégale, affichée AVANT la question */}
      <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-5 flex flex-col items-center gap-4">
        <Tag color="amber">La tablette</Tag>
        <div className="w-full max-w-xs">
          <PartitionShape
            shape="bar"
            parts={4}
            weights={UNEQUAL_WEIGHTS}
            shaded={1}
            tone="amber"
            size="lg"
          />
        </div>
        <p className="text-sm text-slate-500 font-sans text-center">
          La part coloriée représente ce qu'une personne reçoit.
        </p>
      </div>

      {/* Question */}
      <TapQuestion
        prompt={CONFLICT_Q.q}
        options={CONFLICT_Q.options}
        correct={CONFLICT_Q.correct}
        cols={1}
        explain={CONFLICT_Q.explain}
        explainWrong={CONFLICT_Q.explainWrong}
      />

      {/* Comparaison après réponse — affichée toujours via le wrapper above= non dispo ici,
          donc on l'intègre dans le feedback via explain (déjà fait ci-dessus). */}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ÉTAPE 3 — Mini synthèse « Ce que j'ai découvert »
   ═══════════════════════════════════════════════════════════════════ */

const EQUAL_CASES = [
  { id: 'a', weights: null,               shaded: 1, parts: 4, valid: true  },
  { id: 'b', weights: [1, 1, 1, 5],       shaded: 1, parts: 4, valid: false },
];

const EQUAL_ROWS = EQUAL_CASES.map((c) => ({
  id: c.id,
  label: (
    <PartitionShape
      shape="bar"
      parts={c.parts}
      weights={c.weights}
      shaded={c.shaded}
      tone={c.valid ? 'emerald' : 'rose'}
      size="sm"
    />
  ),
  options: ["Oui, c'est 1/4", 'Non'],
  correct: c.valid ? 0 : 1,
  correction: c.valid
    ? 'Les 4 parts sont de même taille ✓'
    : 'Les parts ne sont pas égales — on ne peut pas dire 1/4.',
}));

function SynthesisStep({ synthesisKey, solved, onAnswered }) {
  return (
    <div className="space-y-6">
      {/* Comparaison : égales vs inégales */}
      <BatchChoiceQuestion
        intro={
          <div className="space-y-2">
            <p className="text-base sm:text-lg font-semibold text-slate-800 font-sans">
              Ces deux figures ont toutes les deux 4 morceaux. Dans laquelle la part coloriée représente-t-elle vraiment{' '}
              <span className="font-mono"><MathText>{'$\\frac{1}{4}$'}</MathText></span> ?
            </p>
          </div>
        }
        rows={EQUAL_ROWS}
        solved={solved}
        onAnswered={onAnswered}
        feedback={({ allRight }) => (
          <div className="space-y-4">
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight
                ? <>La figure A a des parts <strong>de même taille</strong> : c'est la seule où l'on peut vraiment parler de quarts.</>
                : <>Regarde la taille des morceaux dans chaque figure — compte les morceaux, puis compare leurs largeurs. Seule la figure avec des parts <strong>égales</strong> représente 1/4.</>
              }
            </Feedback>

            {/* Mini retenir */}
            <div className="rounded-2xl bg-indigo-50 border-2 border-indigo-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-indigo-500 text-lg" aria-hidden="true">📌</span>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Ce que j'ai découvert</span>
              </div>
              <p className="text-base text-indigo-900 font-sans leading-relaxed">
                Une fraction décrit une <strong>partie d'une unité partagée en parts égales</strong>.
              </p>
              <div className="flex items-center gap-6 flex-wrap py-1">
                <div className="w-28 shrink-0">
                  <PartitionShape shape="bar" parts={4} shaded={3} tone="amber" size="sm" />
                </div>
                <div className="text-slate-700 font-sans text-base leading-relaxed">
                  <p>4 parts égales</p>
                  <p>→ j'en prends 3</p>
                  <p>→ <strong className="font-mono text-lg"><MathText>{texFrac(3,4)}</MathText></strong></p>
                </div>
              </div>
              <p className="text-sm text-indigo-700 font-sans">
                Dans le module suivant, tu découvriras le nom des deux nombres de la fraction.
              </p>
            </div>
          </div>
        )}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MODULE PRINCIPAL
   ═══════════════════════════════════════════════════════════════════ */
export default function Module02Construire() {
  const [conflictDone, setConflictDone] = useState(false);
  const [buildDone, setBuildDone] = useState([]);  // indices des constructions validées
  const [synthDone, setSynthDone] = useState(false);

  const s1 = conflictDone;
  const s2 = buildDone.length === BUILDS.length;
  const s3 = synthDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Construire une fraction"
      moduleSubtitle="Je manipule, j'observe, la fraction apparaît."
      estimatedTime="7 min"
      brief={{
        tag: '🧱 Atelier',
        title: 'Ce module est un atelier.',
        body: (
          <p>
            Tu vas <strong className="text-white">fabriquer</strong> des fractions toi-même — d'abord choisir
            comment couper une unité, ensuite prendre des parts. La fraction apparaît en dernier, comme
            conclusion de ce que tu viens de construire.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: '4 morceaux = 4 parts égales ?',
          subtitle: 'Observe avant de répondre.',
          done: s1,
          content: (kit) => (
            // TapQuestion via useKit() interne — pas besoin de passer react ici
            // mais onAnswered doit déclencher s1
            <div className="space-y-5">
              <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-5 flex flex-col items-center gap-4">
                <Tag color="amber">La tablette</Tag>
                <div className="w-full max-w-xs">
                  <PartitionShape
                    shape="bar"
                    parts={4}
                    weights={UNEQUAL_WEIGHTS}
                    shaded={1}
                    tone="amber"
                    size="lg"
                  />
                </div>
                <p className="text-sm text-slate-500 font-sans text-center">
                  La part coloriée représente ce qu'une personne reçoit.
                </p>
              </div>
              <TapQuestion
                prompt="Une tablette a été coupée en 4 morceaux. Chaque personne reçoit un morceau. Peut-on vraiment dire que chacun reçoit 1/4 ?"
                options={CONFLICT_Q.options}
                correct={CONFLICT_Q.correct}
                cols={1}
                explain={CONFLICT_Q.explain}
                explainWrong={CONFLICT_Q.explainWrong}
                requires={['part-egale', 'fraction-ecriture']}
                solved={conflictDone}
                onAnswered={() => setConflictDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Fabrique tes fractions',
          subtitle: 'Choisis la découpe, prends des parts, observe la fraction.',
          done: s2,
          content: (kit) => (
            <div className="space-y-5">
              <AtelierStep
                done={buildDone}
                setDone={setBuildDone}
                react={kit.react}
              />
              {/* Trois découpes viennent d'être faites sur la MÊME unité :
                  l'élève a vu les parts rétrécir à mesure que le nombre du
                  bas grandissait. On nomme ce qu'il vient de voir. */}
              {buildDone && (
                <KnowledgeBrick
                  id="role-du-bas"
                  variant="new"
                  lead="Tu as coupé la même unité en 2, en 4, puis en 10 — et les parts n’ont fait que rétrécir."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Parts égales ou non ?',
          subtitle: 'Une question pour ancrer la règle essentielle.',
          done: s3,
          content: (
            <SynthesisStep
              solved={synthDone}
              onAnswered={() => setSynthDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Tu sais ce que fait chacun des deux nombres. Il est temps
          qu’ils portent leur nom — c’est le module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
