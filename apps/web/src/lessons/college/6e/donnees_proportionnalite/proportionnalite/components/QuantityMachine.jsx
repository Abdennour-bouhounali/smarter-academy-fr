import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { applyRule, formatDec } from './proportionUtils';

/**
 * QuantityMachine — LE distributeur : la manipulation d'entrée de la leçon.
 *
 * GESTE : l'élève choisit une quantité (1, 2, 3, 5, 10…) et la machine
 * produit la grandeur associée. Les deux grandeurs sont montrées EN PAQUETS
 * (des jetons entrent, des crêpes sortent), pas seulement en nombres :
 * l'élève voit littéralement « 2 fois plus de jetons → 2 fois plus de
 * crêpes » avant qu'aucune règle ne soit énoncée.
 *
 * MODÈLE : la sortie vient TOUJOURS de `applyRule(rule, x)`. Une machine
 * réglée sur une règle affine se comportera donc réellement de façon non
 * proportionnelle — la leçon n'a rien à truquer.
 *
 * DENSITÉ (playbook §10.5) : les paquets sont plafonnés à MAX_TILES pastilles
 * visibles, au-delà desquelles s'affiche un badge « ×N ». Aucune quantité ne
 * peut donc faire exploser le nombre de nœuds.
 *
 * ACCESSIBILITÉ : les pastilles sont purement décoratives
 * (pointerEvents:'none', aria-hidden) ; les seuls éléments interactifs sont
 * les boutons de quantité, et la lecture chiffrée est toujours écrite en
 * toutes lettres à côté du dessin.
 */
const MAX_TILES = 12;

function Pile({ count, emoji, label, tone }) {
  const shown = Math.min(count, MAX_TILES);
  const overflow = count > MAX_TILES;
  return (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-slate-500 text-center mb-1">{label}</p>
      <div
        className={`rounded-2xl border-2 p-3 min-h-[92px] flex flex-wrap gap-1 items-center justify-center ${tone}`}
        aria-hidden="true"
      >
        {Array.from({ length: shown }).map((_, i) => (
          <span key={i} className="text-lg leading-none" style={{ pointerEvents: 'none' }}>
            {emoji}
          </span>
        ))}
        {overflow && (
          <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-800 text-white text-xs font-mono font-bold">
            ×{count}
          </span>
        )}
        {count === 0 && <span className="text-xs text-slate-400">vide</span>}
      </div>
      <p className="text-center font-mono font-bold text-slate-800 mt-1 text-sm">
        {formatDec(count)}
      </p>
    </div>
  );
}

/**
 * Accord en nombre d'une étiquette donnée au pluriel (« Jetons donnés »,
 * « Crêpes obtenues ») : sous 2, chaque mot perd son « s ».
 */
function agree(n, label) {
  const singular = Math.abs(n) < 2;
  return label
    .toLowerCase()
    .split(' ')
    .map((w) => (singular && w.endsWith('s') ? w.slice(0, -1) : w))
    .join(' ');
}

export default function QuantityMachine({
  rule,
  quantities = [1, 2, 3, 5, 10],
  value,
  onChange,
  inputLabel = 'Jetons donnés',
  outputLabel = 'Crêpes obtenues',
  inputEmoji = '🪙',
  outputEmoji = '🥞',
  outputUnit = '',
  disabled = false,
  showComputation = false,
}) {
  const reduce = useReducedMotion();
  const output = value === null || value === undefined ? 0 : applyRule(rule, value);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Choisir la quantité">
        {quantities.map((q) => {
          const active = value === q;
          return (
            <button
              key={q}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(q)}
              aria-pressed={active}
              className={`min-w-[52px] min-h-[44px] px-3 py-2 rounded-xl border-2 font-mono font-bold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                active
                  ? 'bg-indigo-600 border-indigo-700 text-white'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400 disabled:opacity-50'
              }`}
            >
              {q}
            </button>
          );
        })}
      </div>

      <motion.div
        key={value}
        initial={reduce ? false : { opacity: 0.6, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex gap-3 items-stretch"
      >
        <Pile count={value ?? 0} emoji={inputEmoji} label={inputLabel} tone="bg-amber-50 border-amber-200" />
        <div className="flex items-center text-2xl text-slate-400" aria-hidden="true">→</div>
        <Pile count={output} emoji={outputEmoji} label={outputLabel} tone="bg-emerald-50 border-emerald-200" />
      </motion.div>

      {/* Accord en nombre : « 1 jetons donnés » est fautif. Les étiquettes sont
          fournies au pluriel ; on les singularise sous 2. */}
      <p className="text-center text-sm text-slate-700">
        <strong className="font-mono">{formatDec(value ?? 0)}</strong> {agree(value ?? 0, inputLabel)} →{' '}
        <strong className="font-mono">
          {formatDec(output)} {outputUnit}
        </strong>{' '}
        {agree(output, outputLabel)}
      </p>

      {showComputation && value ? (
        <p className="text-center font-mono text-xs text-slate-500">
          {formatDec(value)} × {formatDec(rule.kind === 'proportional' ? rule.k : output / value)} ={' '}
          {formatDec(output)}
        </p>
      ) : null}
    </div>
  );
}
