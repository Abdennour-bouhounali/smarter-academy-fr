import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartitionShape from '../components/PartitionShape';
import ObjectGroup from '../components/ObjectGroup';
import { texFrac } from '../components/fractionUtils';

/**
 * Module 5 V2 — reconstruit sur le lesson kit.
 * Étape 1 : manipulation bespoke (CollectionAtelier) — sélectionner le bon
 * nombre de groupes est un geste de construction, pas une question ; elle
 * garde son mécanisme "atteins l'objectif" (Valider désactivé tant que la
 * sélection n'est pas exacte), et appelle kit.react(true) au succès.
 * Étape 2 : la sélection des 3 groupes sur 4 reste une manipulation
 * (gate local `groupsOk`) ; le QCM de comparaison qui suit est converti en
 * <TapQuestion> — un tap = la réponse, révélation immédiate, onSolved
 * inconditionnel.
 */

/* ─── Étape 1 : fraction d'une collection ────────────────────────── */
const COLLECTION = [
  { total: 12, groups: 3, take: 1, emoji: '🎈' },
  { total: 12, groups: 3, take: 2, emoji: '🎈' },
];

function CollectionAtelier({ item, solved, onSolved, react }) {
  const [sel, setSel] = useState([]);
  const perGroup = item.total / item.groups;
  const isRight = sel.length === item.take;

  const toggle = (g) => {
    if (solved) return;
    setSel((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g].sort()));
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-slate-600">
        Sélectionne <MathText>{`$${texFrac(item.take, item.groups)}$`}</MathText> des {item.total} ballons.
      </div>

      <ObjectGroup
        total={item.total}
        groups={item.groups}
        selectedSet={sel}
        onToggleGroup={toggle}
        emoji={item.emoji}
        tone="sky"
      />

      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              if (!isRight) return;
              react(true);
              onSolved?.();
            }}
            disabled={!isRight}
          >
            Valider
          </ValidateButton>
        </div>
      )}

      {solved && (
        <Feedback tone="ok">
          <MathText>{`$${texFrac(item.take, item.groups)}$`}</MathText> de {item.total}, c'est {item.total} ÷{' '}
          {item.groups} = {perGroup} par groupe, puis {perGroup} × {item.take} ={' '}
          <strong>{perGroup * item.take}</strong>.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 2 : même fraction, dessin différent ──────────────────── */
const COMPARAISON_Q = {
  q: "3/4 d'un rectangle et 3/4 de 20 objets : est-ce la même chose ?",
  options: [
    'Oui : dans les deux cas, on prend 3 parts sur un total partagé en 4 — seule la quantité représentée change',
    'Non : ce sont deux fractions différentes',
    'Non : 3/4 ne peut représenter que des formes, jamais des objets',
  ],
  correct: 0,
  explain:
    "C'est la même RELATION : « 3 parts sur 4 ». Sur un rectangle, cela donne une surface. Sur 20 objets, cela donne 15 objets (20 ÷ 4 = 5, puis 5 × 3 = 15). Le dessin change, le sens de la fraction reste identique.",
};

function ComparaisonMemeQuantite({ solved, onSolved }) {
  const [groupSel, setGroupSel] = useState([]);
  const target = 3;
  const groups = 4;
  const total = 20;
  const perGroup = total / groups;

  const toggle = (g) => {
    if (groupSel.includes(g)) setGroupSel((prev) => prev.filter((x) => x !== g));
    else if (groupSel.length < target) setGroupSel((prev) => [...prev, g].sort());
  };

  const groupsOk = groupSel.length === target;

  return (
    <div className="space-y-5">
      {/* ── En-tête : la fraction commune ─────────────────────────── */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
          Dans les deux cas, on parle de…
        </div>
        <div className="flex items-center gap-0">
          {/* numérateur */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-black text-red-500 leading-none">3</div>
            <div className="w-14 h-[3px] bg-slate-800 rounded-full my-1" />
            <div className="text-4xl font-black text-indigo-600 leading-none">4</div>
          </div>
        </div>
        <div className="flex gap-4 text-[11px] font-mono font-bold mt-1">
          <span className="text-red-500">← parts prises</span>
          <span className="text-indigo-600">← total de parts</span>
        </div>
      </div>

      {/* ── Les deux dessins ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
        {/* Dessin 1 : rectangle */}
        <div className="border-2 border-slate-200 rounded-2xl p-4 bg-white space-y-3">
          <div className="text-center">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dessin 1</div>
            <div className="text-sm font-bold text-slate-800">
              <span className="text-red-500">3</span>/
              <span className="text-indigo-600">4</span>
              {' '}d'un rectangle
            </div>
          </div>
          <PartitionShape shape="bar" parts={4} shaded={3} tone="violet" size="md" />
          <div className="grid grid-cols-2 gap-1 text-center text-[11px] font-mono">
            <div className="bg-red-50 rounded-lg py-1.5 border border-red-200">
              <div className="font-black text-red-500">3</div>
              <div className="text-red-400">parts coloriées</div>
            </div>
            <div className="bg-indigo-50 rounded-lg py-1.5 border border-indigo-200">
              <div className="font-black text-indigo-600">4</div>
              <div className="text-indigo-400">parts au total</div>
            </div>
          </div>
        </div>

        {/* Séparateur = */}
        <div className="flex items-center justify-center">
          <div className="text-3xl font-black text-slate-400">=</div>
        </div>

        {/* Dessin 2 : collection */}
        <div className="border-2 border-slate-200 rounded-2xl p-4 bg-white space-y-3">
          <div className="text-center">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dessin 2</div>
            <div className="text-sm font-bold text-slate-800">
              <span className="text-red-500">3</span>/
              <span className="text-indigo-600">4</span>
              {' '}de {total} objets
            </div>
          </div>
          <ObjectGroup total={total} groups={groups} selectedSet={groupSel} onToggleGroup={toggle} emoji="🔵" tone="violet" />
          <div className="grid grid-cols-2 gap-1 text-center text-[11px] font-mono">
            <div className="bg-red-50 rounded-lg py-1.5 border border-red-200">
              <div className="font-black text-red-500">{groupSel.length}</div>
              <div className="text-red-400">
                groupe{groupSel.length !== 1 ? 's' : ''} sélectionné{groupSel.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="bg-indigo-50 rounded-lg py-1.5 border border-indigo-200">
              <div className="font-black text-indigo-600">{groups}</div>
              <div className="text-indigo-400">groupes au total</div>
            </div>
          </div>
          {groupSel.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs font-bold text-violet-700"
            >
              {groupSel.length === target ? (
                <span className="text-emerald-600">
                  ✓ {groupSel.length * perGroup} objets sélectionnés sur {total}
                </span>
              ) : (
                <span>
                  {groupSel.length * perGroup} objet{groupSel.length * perGroup > 1 ? 's' : ''} — sélectionne{' '}
                  {target - groupSel.length} groupe{target - groupSel.length > 1 ? 's' : ''} de plus
                </span>
              )}
            </motion.div>
          )}
          {groupsOk && (
            <div className="text-center text-[11px] text-slate-500">
              {total} ÷ {groups} = {perGroup} par groupe → {perGroup} × {target} ={' '}
              <strong className="text-slate-800">{perGroup * target} objets</strong>
            </div>
          )}
        </div>
      </div>

      {groupsOk && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <TapQuestion
            prompt={COMPARAISON_Q.q}
            options={COMPARAISON_Q.options}
            correct={COMPARAISON_Q.correct}
            cols={1}
            explain={COMPARAISON_Q.explain}
            solved={solved}
            onAnswered={() => onSolved?.()}
          />
        </motion.div>
      )}
    </div>
  );
}

export default function Module05Quantite() {
  const [collDone, setCollDone] = useState([]);
  const [compDone, setCompDone] = useState(false);

  const s1 = collDone.length === COLLECTION.length;
  const s2 = compDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Fraction d'une quantité"
      moduleSubtitle="Partager une COLLECTION d'objets, pas seulement une forme continue."
      estimatedTime="10 min"
      brief={{
        tag: '🎈 Collection',
        title: 'Une fraction peut aussi partager un groupe d’objets.',
        body: (
          <p>
            Jusqu'ici tu as partagé une forme continue (une barre, un disque). Une fraction peut aussi porter sur
            une <strong className="text-white">collection d'objets</strong> : on forme des groupes égaux, puis on
            en prend quelques-uns.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: '12 ballons, 3 groupes égaux',
          done: s1,
          content: (kit) => (
            <div className="space-y-8">
              {COLLECTION.map((item, i) =>
                i === 0 || collDone.includes(i - 1) ? (
                  <div key={item.take} className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                    <CollectionAtelier
                      item={item}
                      solved={collDone.includes(i)}
                      react={kit.react}
                      onSolved={() => setCollDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}
              {s1 && (
                <Feedback tone="info">
                  Remarque : en passant de 1/3 à 2/3, on prend deux fois plus de groupes — et deux fois plus de
                  ballons (4 puis 8). La fraction et la quantité avancent ensemble.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Même fraction, deux dessins',
          done: s2,
          content: <ComparaisonMemeQuantite solved={compDone} onSolved={() => setCompDone(true)} />,
        },
      ]}
    />
  );
}
