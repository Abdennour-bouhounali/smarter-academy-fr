import React, { useState } from 'react';
import { ratValue, fr } from './condUtils';

/**
 * WeightDropTree — l'arbre du dépistage, dont les QUATRE POIDS SE GLISSENT sur
 * leurs branches.
 *
 * LE GESTE (règle utilisateur « le glisser d'abord ») : l'élève SAISIT une
 * étiquette de poids et la DÉPOSE sur une branche. Il ne sélectionne pas un
 * poids dans une liste pour ensuite désigner une branche dans une autre : il
 * porte le nombre jusqu'à sa place, et le nombre reste là où il l'a lâché.
 *
 * POURQUOI CETTE MANIPULATION PLUTÔT QU'UN QCM. Le point que la Seconde laisse
 * mal assis, et que ce module doit régler, est que le MÊME NOMBRE (0,99) pèse
 * deux branches différentes sans y signifier la même chose : P(M̄) porte sur
 * toute la population, P_M(+) sur les seuls malades. Un QCM « que vaut ce
 * poids ? » se répond en reconnaissant un chiffre. Ici, poser 0,99 au mauvais
 * endroit fait apparaître aussitôt une somme de branches différente de 1 : la
 * figure conteste elle-même le geste, sans qu'aucun texte n'ait à le dire.
 *
 * ACCESSIBILITÉ ET CHEMIN CLAVIER. Le glisser natif HTML5 n'est pas un chemin
 * complet : chaque poids est AUSSI un bouton focalisable qu'on active pour le
 * « prendre en main », chaque emplacement un bouton qui le repose. Le clavier
 * fait donc tout ce que fait le doigt, et le lecteur d'écran annonce l'état
 * courant de chaque branche.
 *
 * JAMAIS FIGÉ. Aucun `disabled` lié à la validation : une fois l'arbre juste,
 * l'élève peut décrocher un poids et le remettre ailleurs pour voir la somme se
 * casser — c'est même la meilleure façon de comprendre ce que la règle interdit.
 * Seul `locked` (antériorité, passé par le module) retire les poignées.
 */

/** Les quatre emplacements de l'arbre, dans l'ordre de lecture. */
const SLOTS = [
  { id: 'malade', level: 1, label: 'M — est malade', hint: 'sur toute la population' },
  { id: 'sain', level: 1, label: 'M̄ — est en bonne santé', hint: 'sur toute la population' },
  { id: 'malade/positif', level: 2, label: '+ au départ de M', hint: 'parmi les seuls malades' },
  { id: 'sain/positif', level: 2, label: '+ au départ de M̄', hint: 'parmi les seuls bien portants' },
];

export default function WeightDropTree({
  weights,              // BRANCH_WEIGHTS : [{ id, slot, weight, display, label }]
  placed,               // { [slotId]: weightId }
  onPlace,              // (slotId, weightId | null) => void
  locked = false,
}) {
  const [held, setHeld] = useState(null);          // poids « en main » (clavier)
  const [over, setOver] = useState(null);          // emplacement survolé (glisser)

  const byId = Object.fromEntries(weights.map((w) => [w.id, w]));
  const usedIds = new Set(Object.values(placed).filter(Boolean));

  const place = (slotId, weightId) => {
    if (locked || !weightId) return;
    // Un poids ne peut occuper qu'un emplacement : on le retire de l'ancien.
    const previous = Object.entries(placed).find(([, wid]) => wid === weightId)?.[0];
    if (previous && previous !== slotId) onPlace(previous, null);
    onPlace(slotId, weightId);
    setHeld(null);
  };

  const take = (weightId) => {
    if (locked) return;
    setHeld((h) => (h === weightId ? null : weightId));
  };

  /** La somme des deux branches d'un nœud, quand les deux sont posées. */
  const nodeSum = (aSlot, bSlot) => {
    const a = byId[placed[aSlot]];
    const b = byId[placed[bSlot]];
    if (!a || !b) return null;
    return ratValue(a.weight) + ratValue(b.weight);
  };
  // Le second niveau n'a qu'une branche à poser par nœud (« positif ») ;
  // l'autre s'en déduit, et c'est ce complément qui donne la somme à 1.
  const level1Sum = nodeSum('malade', 'sain');

  const Slot = ({ slot }) => {
    const w = byId[placed[slot.id]];
    const isOver = over === slot.id;
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={locked}
          onClick={() => (held ? place(slot.id, held) : (w ? onPlace(slot.id, null) : null))}
          onDragOver={(e) => { if (!locked) { e.preventDefault(); setOver(slot.id); } }}
          onDragLeave={() => setOver(null)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(null);
            place(slot.id, e.dataTransfer.getData('text/plain'));
          }}
          aria-label={
            w
              ? `${slot.label} : poids ${w.label} posé. Activer pour le retirer.`
              : `${slot.label} : emplacement vide${held ? `. Activer pour y poser ${byId[held]?.label}` : ''}`
          }
          className={`w-24 shrink-0 rounded-xl border-2 border-dashed px-2 py-2 text-sm font-black tabular-nums transition ${
            w
              ? 'border-solid border-violet-400 bg-violet-50 text-violet-800'
              : isOver || held
                ? 'border-violet-400 bg-violet-50/60 text-violet-400'
                : 'border-slate-300 bg-slate-50 text-slate-300'
          } disabled:opacity-60`}
        >
          {w ? w.display : '· · ·'}
        </button>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700">{slot.label}</p>
          <p className="text-xs text-slate-500">{slot.hint}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border-2 border-sky-100 bg-white p-4 space-y-4">
      {/* LA RÉSERVE DE POIDS — ce qu'on attrape. */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
          Les quatre poids{locked ? '' : ' — attrape-en un et dépose-le sur sa branche'}
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Poids à placer">
          {weights.map((w) => {
            const used = usedIds.has(w.id);
            const inHand = held === w.id;
            return (
              <button
                key={w.id}
                type="button"
                disabled={locked}
                draggable={!locked}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', w.id)}
                onClick={() => take(w.id)}
                aria-pressed={inHand}
                aria-label={`Poids ${w.label}${used ? ', déjà posé' : ''}${inHand ? ', en main' : ''}`}
                className={`px-3 py-2 rounded-xl border-2 text-sm font-black tabular-nums transition ${
                  inHand
                    ? 'border-violet-500 bg-violet-500 text-white shadow-lg scale-105'
                    : used
                      ? 'border-slate-200 bg-slate-100 text-slate-400'
                      : 'border-violet-300 bg-white text-violet-700 hover:border-violet-500 cursor-grab active:cursor-grabbing'
                } disabled:opacity-60`}
              >
                {w.display}
                <span className="ml-1.5 text-xs font-semibold opacity-70">({w.label})</span>
              </button>
            );
          })}
        </div>
        {held && !locked && (
          <p className="mt-2 text-xs font-semibold text-violet-700">
            {byId[held].display} est en main — choisis l’emplacement où le poser.
          </p>
        )}
      </div>

      {/* LES EMPLACEMENTS, groupés par niveau. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Premier niveau — l’état de santé
          </p>
          {SLOTS.filter((s) => s.level === 1).map((s) => <Slot key={s.id} slot={s} />)}
          {level1Sum !== null && (
            <p className={`text-xs font-bold ${Math.abs(level1Sum - 1) < 1e-9 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {Math.abs(level1Sum - 1) < 1e-9
                ? '✔ somme des deux branches = 1'
                : `✘ somme des deux branches = ${fr(level1Sum, 2)} — ce n’est pas 1`}
            </p>
          )}
        </div>
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Second niveau — le résultat du test
          </p>
          {SLOTS.filter((s) => s.level === 2).map((s) => <Slot key={s.id} slot={s} />)}
          <p className="text-xs text-slate-500">
            La branche « − » de chaque nœud se déduit : c’est ce qu’il faut ajouter pour faire 1.
          </p>
        </div>
      </div>

      {/* LES CHEMINS, dès que l'arbre est complet — dans le DOM. */}
      {SLOTS.every((s) => placed[s.id]) && (
        <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-600">
            Ce que l’arbre calcule alors
          </p>
          {[
            { a: 'malade', b: 'malade/positif', l: 'malade puis test +' },
            { a: 'sain', b: 'sain/positif', l: 'bien portant puis test +' },
          ].map((c) => {
            const wa = byId[placed[c.a]];
            const wb = byId[placed[c.b]];
            const prod = ratValue(wa.weight) * ratValue(wb.weight);
            return (
              <p key={c.l} className="font-mono text-sm text-sky-900 tabular-nums">
                {c.l} : {wa.display} × {wb.display} = {fr(prod, 4)}
              </p>
            );
          })}
          <p className="text-xs text-sky-700">
            Sur 100 000 personnes, cela fait{' '}
            {Math.round(ratValue(byId[placed.malade].weight) * ratValue(byId[placed['malade/positif']].weight) * 100000)}{' '}
            et{' '}
            {Math.round(ratValue(byId[placed.sain].weight) * ratValue(byId[placed['sain/positif']].weight) * 100000)}{' '}
            tests positifs.
          </p>
        </div>
      )}
    </div>
  );
}

export { SLOTS };

/**
 * L'arbre est juste quand chaque poids occupe l'emplacement qu'il pèse — et
 * NON quand les sommes tombent à 1 : intervertir les deux 0,99 laisserait la
 * somme du premier niveau à 1,98, mais poser 0,01 et 0,99 à l'envers la
 * laisserait à 1. La position est le seul critère (condUtils.test.js).
 */
export const treeIsCorrect = (weights, placed) =>
  weights.every((w) => placed[w.slot] === w.id);
