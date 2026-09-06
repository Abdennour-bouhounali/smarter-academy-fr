import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 5 V2 — reconstruit sur le lesson kit.
 * Partage, groupement et division euclidienne restent des manipulations
 * maison (pas d'état "faux", progression par clic) ; le sens du reste,
 * qui violait la politique formative (Réessayer, correction masquée),
 * devient un TapQuestion du kit.
 */

/* ─── Partage équitable ────────────────────────────────────────── */
function SharingManip({ onComplete, done }) {
  const total = 24;
  const people = 6;
  const perPerson = total / people;
  const [distribution, setDistribution] = useState(Array(people).fill(0));

  const totalDistributed = distribution.reduce((s, v) => s + v, 0);
  const remaining = total - totalDistributed;
  const finished = totalDistributed === total;

  const give = (personIdx) => {
    if (remaining <= 0 || done) return;
    setDistribution((prev) => {
      const next = [...prev];
      next[personIdx] += 1;
      return next;
    });
  };

  const personEmojis = ['😀', '😎', '🤩', '😄', '🥳', '😇'];

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600 leading-relaxed">
        Tu dois distribuer <strong>{total} billes</strong> équitablement entre <strong>{people} amis</strong>.
        Clique sur un ami pour lui donner une bille.
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <div className="text-xs font-mono text-amber-500 font-bold mb-1">BILLES RESTANTES</div>
        <div className="flex flex-wrap gap-1.5 justify-center min-h-[40px]">
          {Array.from({ length: remaining }).map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-amber-400 shadow-sm" />
          ))}
        </div>
        <div className="text-2xl font-space font-bold text-amber-700 mt-2">{remaining}</div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Array.from({ length: people }).map((_, i) => (
          <button
            key={i}
            onClick={() => give(i)}
            disabled={remaining === 0 || done}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all focus:outline-none ${
              remaining > 0 && !done ? 'hover:border-amber-400 hover:bg-amber-50 cursor-pointer' : 'cursor-default'
            } ${distribution[i] === perPerson ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}
          >
            <span className="text-2xl">{personEmojis[i]}</span>
            <div className="flex flex-wrap gap-0.5 justify-center min-h-[20px]">
              {Array.from({ length: distribution[i] }).map((_, j) => (
                <div key={j} className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-slate-600">{distribution[i]}</span>
          </button>
        ))}
      </div>

      <div className="text-center font-space font-bold text-2xl bg-slate-50 rounded-xl py-3 border border-slate-200">
        <span className="text-amber-600">{total}</span>
        <span className="text-slate-400 mx-2">÷</span>
        <span className="text-slate-600">{people}</span>
        <span className="text-slate-400 mx-2">=</span>
        <span className={finished ? 'text-emerald-600' : 'text-slate-400'}>{finished ? perPerson : '?'}</span>
      </div>

      <AnimatePresence>
        {finished && !done && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 className="inline w-4 h-4 mr-1" />
              <strong>24 ÷ 6 = 4</strong> — Chaque ami reçoit 4 billes. C'est un partage équitable.
            </div>
            <button onClick={onComplete} className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl">
              Continuer →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Groupement ─────────────────────────────────────────────── */
function GroupingManip({ onComplete, done }) {
  const total = 24;
  const groupSize = 6;
  const maxGroups = total / groupSize;
  const [groups, setGroups] = useState(0);
  const remaining = total - groups * groupSize;
  const finished = groups === maxGroups;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600 leading-relaxed">
        Cette fois : tu as <strong>{total} billes</strong> et tu formes des groupes de <strong>{groupSize}</strong>.
        Combien de groupes peux-tu former ?
      </p>

      <div className="flex flex-wrap gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[80px]">
        {Array.from({ length: groups }).map((_, gi) => (
          <motion.div key={gi} initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex gap-1 bg-indigo-50 border-2 border-indigo-200 rounded-xl p-2">
            {Array.from({ length: groupSize }).map((_, bi) => (
              <div key={bi} className="w-5 h-5 rounded-full bg-indigo-400" />
            ))}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-slate-500">Restant : <strong className="text-slate-700">{remaining}</strong> billes</div>
        <button
          onClick={() => { if (!finished && !done) setGroups((v) => v + 1); }}
          disabled={finished || done}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${finished || done ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
        >
          Faire un groupe de {groupSize} →
        </button>
      </div>

      <div className="text-center font-space font-bold text-2xl bg-slate-50 rounded-xl py-3 border border-slate-200">
        <span className="text-amber-600">{total}</span>
        <span className="text-slate-400 mx-2">÷</span>
        <span className="text-slate-600">{groupSize}</span>
        <span className="text-slate-400 mx-2">=</span>
        <span className={finished ? 'text-emerald-600' : 'text-slate-400'}>{groups}</span>
        {finished && <span className="text-emerald-600"> groupes</span>}
      </div>

      <AnimatePresence>
        {finished && !done && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 className="inline w-4 h-4 mr-1" />
              <strong>24 ÷ 6 = 4</strong> aussi ! Même opération, mais une question différente :
              <em> combien de groupes ?</em> vs <em>combien par groupe ?</em>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
              💡 La division peut répondre à deux types de questions — le résultat est le même !
            </div>
            <button onClick={onComplete} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl">
              Continuer →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Division euclidienne ───────────────────────────────────── */
function EuclideanDivision({ onComplete, done }) {
  const dividend = 17;
  const divisor = 5;
  const [groups, setGroups] = useState(0);
  const placed = groups * divisor;
  const remaining = dividend - placed;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600 leading-relaxed">
        <strong>{dividend} billes</strong> — on forme des groupes de <strong>{divisor}</strong>.
        Combien de groupes complets peut-on former ? Et combien de billes restent ?
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="text-xs font-mono text-slate-400 mb-2">Billes dans la réserve</div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: dividend }).map((_, i) => (
            <div key={i} className={`w-7 h-7 rounded-full border-2 transition-colors ${i < placed ? 'bg-slate-200 border-slate-200' : i < placed + (remaining > 0 ? Math.min(remaining, divisor) : 0) ? 'bg-rose-300 border-rose-400' : 'bg-amber-400 border-amber-500'}`} />
          ))}
        </div>
        <div className="text-xs text-slate-400 mt-2">
          Gris = dans un groupe complet · Orange = billes libres · Rose = billes à former
        </div>
      </div>

      <div className="flex flex-wrap gap-3 min-h-[50px]">
        {Array.from({ length: groups }).map((_, gi) => (
          <motion.div key={gi} initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex gap-1 bg-amber-50 border-2 border-amber-300 rounded-xl p-2">
            {Array.from({ length: divisor }).map((_, bi) => (
              <div key={bi} className="w-5 h-5 rounded-full bg-amber-400" />
            ))}
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-slate-500">
          Restant : <strong className={remaining < divisor && groups > 0 ? 'text-rose-600' : 'text-slate-700'}>{remaining}</strong>
          {remaining < divisor && groups > 0 && remaining > 0 && (
            <span className="text-rose-500 ml-1">(moins de {divisor} → ce sera le reste !)</span>
          )}
        </div>
        <button
          onClick={() => { if (!done && remaining >= divisor) setGroups((v) => v + 1); }}
          disabled={remaining < divisor || done}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${remaining < divisor || done ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
        >
          Former un groupe de {divisor}
        </button>
      </div>

      <div className="bg-slate-800 text-white rounded-xl p-4 text-center space-y-1">
        <div className="text-xs font-mono text-slate-400">{dividend} ÷ {divisor}</div>
        <div className="font-space font-bold text-xl">
          Groupes complets : <span className="text-amber-400">{groups}</span>
          {' · '}Billes de côté : <span className="text-rose-400">{remaining}</span>
        </div>
        <div className="text-sm font-mono text-slate-300">{dividend} = {divisor} × {groups} + {remaining}</div>
      </div>

      <AnimatePresence>
        {remaining < divisor && groups > 0 && !done && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 className="inline w-4 h-4 mr-1" />
              <strong>{dividend} = {divisor} × {groups} + {remaining}</strong><br />
              {groups} groupes complets de {divisor}, et {remaining} billes qui ne peuvent plus en
              former un ({remaining} &lt; {divisor} ✓)
            </div>
            <button onClick={onComplete} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
              Continuer →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

/* ─── Sens du reste (TapQuestion) ────────────────────────────── */
const REMAINDER_OPTIONS = ['3 bus', '4 bus', '5 bus'];
const REMAINDER_CORRECT_EXPLAIN = (
  <>
    <strong>4 bus !</strong> Le quotient mathématique est 3, mais il reste 2 enfants. Sans un 4e bus, ces 2 enfants
    resteraient à pied !
    <div className="font-bold mt-2 bg-emerald-100 rounded-lg p-2 text-emerald-800">
      ⚠️ Dans un problème, le reste a un sens concret. Il faut l'interpréter !
    </div>
  </>
);
const REMAINDER_WRONG_EXPLAIN =
  "17 ÷ 5 = 3 reste 2. Le quotient (3) ne suffit pas : il reste 2 enfants sans bus, il faut un 4e bus pour les transporter tous.";

export default function Module05Division() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);
  const [s4, setS4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Diviser : partager et regrouper"
      moduleSubtitle="Partage équitable, groupement, division euclidienne et sens du reste."
      estimatedTime="8 min"
      steps={[
        {
          num: 1,
          title: 'Partager équitablement',
          done: s1,
          content: (kit) => (
            <div className="space-y-5">
              <SharingManip onComplete={() => { kit.react(true); setS1(true); }} done={s1} />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Former des groupes',
          done: s2,
          content: (kit) => (
            <div className="space-y-5">
              <GroupingManip onComplete={() => { kit.react(true); setS2(true); }} done={s2} />
              {/* L'élève vient de faire les deux gestes — distribuer, puis
                  regrouper — et de tomber deux fois sur 4. C'est le moment
                  de dire que c'est la même opération. */}
              {s2 && (
                <KnowledgeBrick
                  id="partage-groupement"
                  variant="new"
                  lead="Deux gestes différents, le même 24 ÷ 6 = 4 au bout."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'La division euclidienne (avec reste)',
          done: s3,
          content: (kit) => (
            <div className="space-y-5">
              <EuclideanDivision onComplete={() => { kit.react(true); setS3(true); }} done={s3} />
              {/* RÉPARATION : « quotient » n'était jusqu'ici nommé nulle part
                  dans la leçon — il surgissait dans une OPTION du test final.
                  Il est posé ICI, après que l'élève a formé ses groupes et vu
                  ce qui restait sur la table. */}
              {s3 && (
                <>
                  <KnowledgeBrick
                    id="quotient"
                    variant="new"
                    lead="Les 3 paquets que tu as formés, et les 2 billes restées seules : chacun a son nom."
                  />
                  <KnowledgeBrick
                    id="egalite-euclidienne"
                    variant="new"
                    lead="La ligne 17 = 5 × 3 + 2 qui s'écrivait sous tes yeux à chaque groupe formé."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le sens du reste — Attention !',
          subtitle: "17 enfants, bus de 5 places : combien de bus faut-il réellement ?",
          done: s4,
          content: (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚌</span>
                <p className="text-sm text-slate-600">
                  <strong>17 enfants</strong> doivent prendre le bus. Chaque bus peut transporter <strong>5 élèves</strong>.
                  <br />Combien de bus faut-il <em>réellement</em> ?
                </p>
              </div>

              <div className="bg-slate-800 text-white rounded-xl p-4 text-center space-y-1">
                <div className="text-slate-400 text-sm font-mono">Calcul mathématique</div>
                <div className="text-xl font-space font-bold">17 ÷ 5 = 3 reste 2</div>
                <div className="text-slate-400 text-sm">17 = 5 × 3 + 2</div>
              </div>

              <TapQuestion
                prompt="Mais dans la réalité, combien de bus commande-t-on ?"
                requires={['quotient', 'egalite-euclidienne']}
                options={REMAINDER_OPTIONS}
                correct={1}
                cols={3}
                explain={REMAINDER_CORRECT_EXPLAIN}
                explainWrong={REMAINDER_WRONG_EXPLAIN}
                solved={s4}
                onAnswered={() => setS4(true)}
              />
              {/* La règle est tirée de l'épreuve qui vient d'être vécue —
                  pas récitée avant elle. */}
              {s4 && (
                <>
                  <KnowledgeBrick
                    id="sens-du-reste"
                    variant="new"
                    lead="Les 2 enfants qui seraient restés à pied si on s'était arrêté au calcul."
                  />
                  <KnowledgeBrick id="mem-quatre-mots" variant="new" />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Les quatre opérations sont nommées. On va maintenant les
          poser proprement, en colonnes, pour ne plus rien perdre en route.
        </KnowledgeSnapshot>
      }
    />
  );
}
