import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Repeat, Scissors } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import Base10Blocks from '../components/Base10Blocks';
import { Feedback, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { formatFr, decompose } from '../components/numberUtils';

/* ─── Le matériel disponible ─────────────────────────────────────── */
const MATERIEL = [
  { key: 'UM', name: 'millier', plural: 'milliers', value: 1000, tone: 'text-amber-700 border-amber-300 bg-amber-50' },
  { key: 'C', name: 'centaine', plural: 'centaines', value: 100, tone: 'text-violet-700 border-violet-300 bg-violet-50' },
  { key: 'D', name: 'dizaine', plural: 'dizaines', value: 10, tone: 'text-sky-700 border-sky-300 bg-sky-50' },
  { key: 'U', name: 'unité', plural: 'unités', value: 1, tone: 'text-emerald-700 border-emerald-300 bg-emerald-50' },
];

const totalOf = (c) => (c.UM || 0) * 1000 + (c.C || 0) * 100 + (c.D || 0) * 10 + (c.U || 0);

/** Écriture canonique : le moins de blocs possible. */
const canonical = (n) => ({
  UM: Math.floor(n / 1000),
  C: Math.floor((n % 1000) / 100),
  D: Math.floor((n % 100) / 10),
  U: n % 10,
});

const isCanonical = (c) => {
  const k = canonical(totalOf(c));
  return k.UM === (c.UM || 0) && k.C === (c.C || 0) && k.D === (c.D || 0) && k.U === (c.U || 0);
};

const countBlocks = (c) => (c.UM || 0) + (c.C || 0) + (c.D || 0) + (c.U || 0);

/* ─── Atelier de construction ────────────────────────────────────── */
function BlockWorkshop({
  target,
  start = { UM: 0, C: 0, D: 0, U: 0 },
  available = ['UM', 'C', 'D', 'U'],
  requireCanonical = false,
  allowSplit = false,
  maxRender = 12,
  goalCheck,
  onReach,
  successNote,
}) {
  const [counts, setCounts] = useState(start);
  const total = totalOf(counts);
  const reached = total === target;
  const canonicalOk = !requireCanonical || isCanonical(counts);
  const solved = goalCheck ? goalCheck(counts) : reached && canonicalOk;

  React.useEffect(() => {
    if (solved) onReach?.(counts);
    // onReach est stable côté appelant (setState) : on ne l'inclut pas en dépendance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, counts]);

  const bump = (key, delta) =>
    setCounts((c) => ({ ...c, [key]: Math.max(0, (c[key] || 0) + delta) }));

  /* Échanges : 10 petits blocs → 1 grand bloc. Le regroupement par 10 devient visible. */
  const EXCHANGES = [
    { from: 'U', to: 'D', label: '10 unités = 1 dizaine' },
    { from: 'D', to: 'C', label: '10 dizaines = 1 centaine' },
    { from: 'C', to: 'UM', label: '10 centaines = 1 millier' },
  ].filter((e) => available.includes(e.from) && available.includes(e.to) && (counts[e.from] || 0) >= 10);

  const SPLITS = allowSplit
    ? [
        { from: 'D', to: 'U', label: '1 dizaine = 10 unités' },
        { from: 'C', to: 'D', label: '1 centaine = 10 dizaines' },
        { from: 'UM', to: 'C', label: '1 millier = 10 centaines' },
      ].filter((s) => available.includes(s.from) && available.includes(s.to) && (counts[s.from] || 0) >= 1)
    : [];

  const exchange = (from, to) =>
    setCounts((c) => ({ ...c, [from]: c[from] - 10, [to]: (c[to] || 0) + 1 }));

  const split = (from, to) =>
    setCounts((c) => ({ ...c, [from]: c[from] - 1, [to]: (c[to] || 0) + 10 }));

  return (
    <div className="space-y-4">
      {/* Palette */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MATERIEL.filter((m) => available.includes(m.key)).map((m) => (
          <div key={m.key} className={`rounded-xl border-2 p-3 space-y-2 ${m.tone}`}>
            <div className="text-center">
              <div className="text-xs font-mono font-bold uppercase">{m.plural}</div>
              <div className="text-[10px] font-mono opacity-70">1 = {formatFr(m.value)}</div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => bump(m.key, -1)}
                disabled={(counts[m.key] || 0) === 0}
                aria-label={`Retirer une ${m.name}`}
                className="w-9 h-9 rounded-lg bg-white border-2 border-current/20 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="font-mono font-extrabold text-xl tabular-nums w-8 text-center" aria-live="polite">
                {counts[m.key] || 0}
              </span>
              <button
                type="button"
                onClick={() => bump(m.key, 1)}
                aria-label={`Ajouter une ${m.name}`}
                className="w-9 h-9 rounded-lg bg-white border-2 border-current/20 flex items-center justify-center hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Échanges et découpages */}
      <AnimatePresence>
        {(EXCHANGES.length > 0 || SPLITS.length > 0) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="flex flex-wrap gap-2">
              {EXCHANGES.map((e) => (
                <button
                  key={`ex-${e.from}`}
                  type="button"
                  onClick={() => exchange(e.from, e.to)}
                  className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-xs font-bold min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <Repeat className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  Échanger : {e.label}
                </button>
              ))}
              {SPLITS.map((s) => (
                <button
                  key={`sp-${s.from}`}
                  type="button"
                  onClick={() => split(s.from, s.to)}
                  className="px-3 py-2.5 rounded-xl bg-white border-2 border-slate-300 text-slate-600 hover:border-slate-500 font-mono text-xs font-bold min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <Scissors className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  Casser : {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Le matériel construit */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <Base10Blocks counts={counts} max={maxRender} />
      </div>

      {/* Compteur : la représentation visuelle et l'écriture chiffrée avancent ensemble */}
      <div
        className={`rounded-2xl border-2 p-4 flex items-center justify-between gap-4 flex-wrap transition-colors ${
          solved ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
        }`}
      >
        <div>
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Ton nombre
          </div>
          <div className="font-mono font-extrabold text-3xl text-slate-800 tabular-nums" aria-live="polite">
            {formatFr(total)}
          </div>
          <div className="text-[11px] font-mono text-slate-400">{countBlocks(counts)} bloc(s) utilisé(s)</div>
        </div>
        {target !== undefined && (
          <div className="text-right">
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Objectif</div>
            <div className="font-mono font-extrabold text-2xl text-slate-400 tabular-nums">{formatFr(target)}</div>
          </div>
        )}
      </div>

      {reached && !canonicalOk && (
        <Feedback tone="hint">
          Bravo, ton matériel vaut bien <strong className="font-mono">{formatFr(total)}</strong> ! Mais tu utilises{' '}
          {countBlocks(counts)} blocs. Peux-tu représenter le même nombre avec{' '}
          <strong>le moins de blocs possible</strong> ? Utilise les boutons <em>Échanger</em>.
        </Feedback>
      )}

      {solved && (
        <Feedback tone="ok">
          {successNote || (
            <>
              Nombre construit : <strong className="font-mono">{formatFr(total)}</strong>.
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

/* ─── Révélation : du matériel à l'écriture symbolique ───────────── */
function Reveal({ n }) {
  const parts = decompose(n);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2"
    >
      <div className="font-mono text-4xl font-extrabold tabular-nums">{formatFr(n)}</div>
      <div className="text-slate-400 text-lg">=</div>
      <div className="font-mono text-lg sm:text-xl font-bold text-amber-300 tabular-nums">
        {parts.map((p) => formatFr(p)).join(' + ')}
      </div>
      <p className="text-xs text-slate-400 pt-1">
        Chaque paquet de matériel devient un morceau de l'écriture du nombre.
      </p>
    </motion.div>
  );
}

export default function Module02Construire() {
  const navLinks = getNavLinks(2);
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3a, setS3a] = useState(false);
  const [s3b, setS3b] = useState(false);

  const allDone = s1 && s2 && s3a && s3b;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Construire les nombres"
      moduleSubtitle="Fabrique les nombres avec du matériel base 10 : le groupement par 10 devient visible."
      moduleNumber={2}
      estimatedTime="12 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🧱 Atelier" title="Avant d'écrire un nombre, on va le fabriquer.">
          <p>
            Tu disposes de quatre sortes de matériel. Regarde bien : chaque forme est faite de dix formes plus
            petites.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              ['🟩', '1 cube', '= 1 unité'],
              ['🟦', '1 barre', '= 10 cubes'],
              ['🟪', '1 plaque', '= 10 barres'],
              ['🟧', '1 bloc', '= 10 plaques'],
            ].map(([e, t, s]) => (
              <div key={t} className="bg-white/10 rounded-xl p-2.5 text-center">
                <div className="text-xl" aria-hidden="true">{e}</div>
                <div className="text-xs font-bold text-white">{t}</div>
                <div className="text-[10px] font-mono text-slate-300">{s}</div>
              </div>
            ))}
          </div>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard
          num={1}
          title="Construis le nombre 347"
          subtitle="Plusieurs assemblages sont possibles… mais un seul utilise le minimum de blocs."
          done={s1}
        >
          <BlockWorkshop
            target={347}
            available={['C', 'D', 'U']}
            requireCanonical
            maxRender={12}
            onReach={() => setS1(true)}
            successNote={
              <>
                Parfait : <strong>3 plaques</strong>, <strong>4 barres</strong> et <strong>7 cubes</strong>.
              </>
            }
          />
          {s1 && (
            <div className="space-y-3">
              <Reveal n={347} />
              <Feedback tone="info">
                3 centaines, 4 dizaines et 7 unités. On écrit ce nombre <strong className="font-mono">347</strong> :
                les chiffres se rangent dans l'ordre des paquets, du plus gros au plus petit.
              </Feedback>
            </div>
          )}
        </StepCard>

        {/* Étape 2 */}
        <StepCard
          num={2}
          title="Construis maintenant 1 205"
          subtitle="Attention : une position va rester vide."
          done={s2}
          locked={!s1}
        >
          <BlockWorkshop
            target={1205}
            requireCanonical
            maxRender={12}
            onReach={() => setS2(true)}
            successNote={<>1 bloc, 2 plaques, aucune barre et 5 cubes.</>}
          />
          {s2 && (
            <div className="space-y-3">
              <Reveal n={1205} />
              <Feedback tone="info">
                Tu n'as posé <strong>aucune barre</strong> : il n'y a pas de dizaine dans 1 205. Pourtant on ne
                peut pas écrire « 125 » ! Le <strong className="font-mono text-lg">0</strong> occupe la place des
                dizaines pour que le 2 reste bien à la place des centaines. On y reviendra au module 5.
              </Feedback>
            </div>
          )}
        </StepCard>

        {/* Étape 3 */}
        <StepCard
          num={3}
          title="Atelier d'échange : de 37 à 50"
          subtitle="Ajoute 1 dizaine, puis 3 unités. Observe ce qui se passe quand les unités s'accumulent."
          done={s3a && s3b}
          locked={!s2}
        >
          <div className="space-y-4">
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-sm text-sky-900">
              <strong>Objectif 1 :</strong> partir de 37 et atteindre exactement 50, en utilisant l'échange
              « 10 unités = 1 dizaine ».
            </div>

            <BlockWorkshop
              target={50}
              start={{ UM: 0, C: 0, D: 3, U: 7 }}
              available={['D', 'U']}
              requireCanonical
              allowSplit
              maxRender={50}
              onReach={() => setS3a(true)}
              successNote={<>50 atteint, et rangé au plus court : <strong>5 dizaines</strong>.</>}
            />

            {s3a && (
              <>
                <Feedback tone="ok">
                  Tu as vu la transformation : 37 <span className="font-mono">+ 10</span> = 47, puis 47{' '}
                  <span className="font-mono">+ 3</span> = 50. En arrivant à 10 unités, elles se sont regroupées
                  en 1 dizaine. <strong>50 = 5 dizaines.</strong>
                </Feedback>

                <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 text-sm text-sky-900">
                  <strong>Objectif 2 :</strong> montre le même nombre 50 avec <strong>uniquement des unités</strong>.
                  Utilise les boutons <em>Casser</em>.
                </div>

                <BlockWorkshop
                  target={50}
                  start={{ UM: 0, C: 0, D: 5, U: 0 }}
                  available={['D', 'U']}
                  allowSplit
                  maxRender={50}
                  goalCheck={(c) => (c.U || 0) === 50 && (c.D || 0) === 0}
                  onReach={() => setS3b(true)}
                  successNote={
                    <>
                      <strong>50 = 50 unités = 5 dizaines.</strong> Deux représentations, un seul nombre.
                    </>
                  }
                />
              </>
            )}

            {s3b && (
              <Feedback tone="info">
                Voilà pourquoi on regroupe : <strong>50 unités</strong> et <strong>5 dizaines</strong>, c'est la
                même quantité, mais l'une se lit d'un coup d'œil et l'autre non. Les positions servent à écrire
                les grandes quantités sans tout compter.
              </Feedback>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
