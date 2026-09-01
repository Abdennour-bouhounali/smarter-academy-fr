import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import ConceptCard from '../../../../../common/components/ConceptCard';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Partage équitable ────────────────────────────────────────── */
function SharingManip({ onComplete, done }) {
  const total = 24;
  const people = 6;
  const perPerson = total / people;
  // Chaque personnage reçoit des objets cliqués
  const [distribution, setDistribution] = useState(Array(people).fill(0)); // combien chacun a

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

      {/* Stock restant */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <div className="text-xs font-mono text-amber-500 font-bold mb-1">BILLES RESTANTES</div>
        <div className="flex flex-wrap gap-1.5 justify-center min-h-[40px]">
          {Array.from({ length: remaining }).map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-amber-400 shadow-sm" />
          ))}
        </div>
        <div className="text-2xl font-space font-bold text-amber-700 mt-2">{remaining}</div>
      </div>

      {/* Personnages */}
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
  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;

  const [groups, setGroups] = useState(0);
  const placed = groups * divisor;
  const remaining = dividend - placed;
  const finished = groups === quotient && remaining === remainder;

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600 leading-relaxed">
        <strong>{dividend} billes</strong> — on forme des groupes de <strong>{divisor}</strong>.
        Combien de groupes complets peut-on former ? Et combien de billes restent ?
      </p>

      {/* Billes restantes */}
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

      {/* Groupes formés */}
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

      {/* Formule */}
      <div className="bg-slate-800 text-white rounded-xl p-4 text-center space-y-1">
        <div className="text-xs font-mono text-slate-400">{dividend} ÷ {divisor}</div>
        <div className="font-space font-bold text-xl">
          Quotient : <span className="text-amber-400">{groups}</span>
          {' · '}Reste : <span className="text-rose-400">{remaining}</span>
        </div>
        <div className="text-sm font-mono text-slate-300">{dividend} = {divisor} × {groups} + {remaining}</div>
      </div>

      <AnimatePresence>
        {remaining < divisor && groups > 0 && !done && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 className="inline w-4 h-4 mr-1" />
              <strong>{dividend} = {divisor} × {groups} + {remaining}</strong><br/>
              Quotient = <strong>{groups}</strong>, Reste = <strong>{remaining}</strong> (reste &lt; {divisor} ✓)
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

/* ─── Sens du reste ──────────────────────────────────────────── */
function RemainderMeaning({ onComplete, done }) {
  const [answer, setAnswer] = useState(null);
  const [checked, setChecked] = useState(false);

  // 17 enfants, bus de 5 places → 4 bus
  const options = [
    { val: 3, label: '3 bus', reasoning: '17 ÷ 5 = 3 → quotient' },
    { val: 4, label: '4 bus', reasoning: "Il reste 2 enfants sans bus — on a besoin d'un 4e bus !", correct: true },
    { val: 5, label: '5 bus', reasoning: 'Trop de bus' },
  ];

  return (
    <div className="border-2 border-rose-100 bg-rose-50/40 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🚌</span>
        <div>
          <h3 className="font-bold text-slate-800">Le sens du reste — Attention !</h3>
          <p className="text-sm text-slate-600 mt-1">
            <strong>17 enfants</strong> doivent prendre le bus. Chaque bus peut transporter <strong>5 élèves</strong>.
            <br />Combien de bus faut-il <em>réellement</em> ?
          </p>
        </div>
      </div>

      <div className="bg-slate-800 text-white rounded-xl p-4 text-center space-y-1">
        <div className="text-slate-400 text-sm font-mono">Calcul mathématique</div>
        <div className="text-xl font-space font-bold">17 ÷ 5 = 3 reste 2</div>
        <div className="text-slate-400 text-sm">17 = 5 × 3 + 2</div>
      </div>

      {!done && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-600">Mais dans la réalité, combien de bus commande-t-on ?</p>
          <div className="grid grid-cols-3 gap-2">
            {options.map((o, i) => (
              <button
                key={i}
                onClick={() => !checked && setAnswer(i)}
                disabled={checked}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                  answer === i
                    ? checked
                      ? o.correct ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-rose-50 border-rose-400 text-rose-700'
                      : 'bg-amber-100 border-amber-400 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { if (answer !== null) setChecked(true); }}
            disabled={answer === null || checked}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm disabled:opacity-40"
          >
            Valider
          </button>

          <AnimatePresence>
            {checked && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                {options[answer].correct ? (
                  <div className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 text-sm space-y-1">
                    <div><CheckCircle2 className="inline w-4 h-4 mr-1" /><strong>4 bus !</strong></div>
                    <div>Le quotient mathématique est 3, mais il reste 2 enfants. Sans un 4e bus, ces 2 enfants resteraient à pied !</div>
                    <div className="font-bold text-emerald-800 mt-2 bg-emerald-100 rounded-lg p-2">
                      ⚠️ Dans un problème, le reste a un sens concret. Il faut l'interpréter !
                    </div>
                  </div>
                ) : (
                  <div className="text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm">
                    <XCircle className="inline w-4 h-4 mr-1" />
                    {options[answer].reasoning}. Les 2 enfants restants ont-ils un bus ?
                    <button onClick={() => { setChecked(false); setAnswer(null); }} className="block mt-1 text-rose-600 underline text-xs">Réessayer</button>
                  </div>
                )}
                {options[answer].correct && (
                  <button onClick={onComplete} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm">
                    J'ai compris le reste !
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {done && <div className="text-emerald-600 font-bold text-sm text-center"><CheckCircle2 className="inline w-4 h-4 mr-1" /> Reste interprété !</div>}
    </div>
  );
}

/* ─── Module principal ────────────────────────────────────────── */
export default function Module05Division() {
  const [phase, setPhase] = useState(0);
  const navLinks = getNavLinks(5);

  return (
    <ModuleLayout
      lessonId={MODULE_CTX.lessonId}
      coursePath={MODULE_CTX.coursePath}
      courseTitle={MODULE_CTX.courseTitle}
      chapter={MODULE_CTX.chapter}
      sequentialUnlock={MODULE_CTX.sequentialUnlock}
      moduleTitle="Diviser : partager et regrouper"
      moduleSubtitle="Partage équitable, groupement, division euclidienne et sens du reste."
      moduleNumber={5}
      totalModules={MODULE_CTX.totalModules}
      estimatedTime="15 min"
      prevLink={navLinks.prevLink}
      nextLink={phase >= 4 ? navLinks.nextLink : undefined}
      isCompleted={phase >= 4}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex gap-1.5 flex-wrap">
          {['Partage', 'Groupement', 'Division euclidienne', 'Sens du reste'].map((l, i) => (
            <div key={i} className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all ${i < phase ? 'bg-emerald-100 text-emerald-700' : i === phase ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {i < phase ? '✓ ' : ''}{l}
            </div>
          ))}
        </div>

        {/* Phase 0 — Partage */}
        {phase === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">Partager équitablement</h2>
            <SharingManip onComplete={() => setPhase(1)} done={phase > 0} />
          </div>
        )}

        {/* Phase 1 — Groupement */}
        {phase >= 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">Former des groupes</h2>
            <GroupingManip onComplete={() => setPhase(2)} done={phase > 1} />
          </div>
        )}

        {/* Phase 2 — Division euclidienne */}
        {phase >= 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-space font-bold text-slate-800">La division euclidienne (avec reste)</h2>
            <EuclideanDivision onComplete={() => setPhase(3)} done={phase > 2} />
          </div>
        )}

        {/* ConceptCard */}
        {phase >= 3 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ConceptCard label="La division euclidienne" emoji="➗" color="amber">
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { name: 'dividende', role: 'la quantité à diviser', color: 'text-amber-700' },
                    { name: 'diviseur', role: 'taille ou nombre de groupes', color: 'text-slate-700' },
                    { name: 'quotient', role: 'résultat entier', color: 'text-indigo-700' },
                    { name: 'reste', role: 'ce qui ne rentre pas', color: 'text-rose-700' },
                  ].map(({ name, role, color }) => (
                    <div key={name} className="bg-white rounded-lg border border-amber-100 p-2">
                      <div className={`font-bold ${color} text-sm`}>{name}</div>
                      <div className="text-slate-500 text-[10px]">{role}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white border border-amber-100 rounded-xl p-3 text-center">
                  <MathText>{'$$\\text{dividende} = \\text{diviseur} \\times \\text{quotient} + \\text{reste}$$'}</MathText>
                  <div className="text-xs text-slate-500 mt-1">avec <strong>reste &lt; diviseur</strong></div>
                </div>
                <p className="text-sm text-slate-600">💡 Pour vérifier : multiplie le diviseur par le quotient, ajoute le reste — tu dois retrouver le dividende.</p>
              </div>
            </ConceptCard>
          </motion.div>
        )}

        {/* Phase 3 — Sens du reste */}
        {phase >= 3 && (
          <RemainderMeaning onComplete={() => setPhase(4)} done={phase >= 4} />
        )}

        {phase >= 4 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-6 text-center space-y-2">
            <div className="text-3xl">🏅</div>
            <div className="text-xl font-space font-bold">Division maîtrisée !</div>
            <p className="text-amber-100 text-sm">Partage, groupement, division euclidienne et sens du reste — tout est clair !</p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
