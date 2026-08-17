import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MathText from '../../../../../common/components/MathText';
import NumberLine from '../../../../../common/components/NumberLine';
import DecimalPlaceTable from './DecimalPlaceTable';
import { QuantityView } from './UnitGrid';
import { formatDec, toDecimalFraction, decDecompose, decimalPlaces, frameDec } from './decimalUtils';

/**
 * RepresentationPanel — la « machine à traduire ».
 *
 * Un seul et même nombre, montré simultanément sous toutes ses formes. L'objectif
 * n'est pas d'apprendre des règles de conversion mais de sentir qu'il s'agit
 * d'UN SEUL OBJET qui change d'habit :
 *
 *   quantité ↔ fraction décimale ↔ écriture à virgule ↔ valeur de position ↔ droite graduée
 */

const VIEW_META = {
  quantite: { label: 'Quantité', emoji: '🟩' },
  virgule: { label: 'Écriture à virgule', emoji: '✏️' },
  fraction: { label: 'Fraction décimale', emoji: '➗' },
  decomposition: { label: 'Décomposition', emoji: '🧩' },
  positions: { label: 'Valeurs de position', emoji: '📊' },
  droite: { label: 'Droite graduée', emoji: '📏' },
};

/** Fenêtre de droite graduée adaptée à la précision du nombre. */
function lineWindow(value) {
  const dp = decimalPlaces(value);
  if (dp <= 1) {
    const low = Math.floor(value);
    return { min: low, max: low + 1, step: 0.1, labelEvery: 5 };
  }
  const [low, high] = frameDec(value, 0.1);
  return { min: low, max: high, step: 0.01, labelEvery: 5 };
}

function ViewBody({ view, value, den }) {
  const frac = toDecimalFraction(value);
  const { whole, parts } = decDecompose(value);

  switch (view) {
    case 'quantite':
      return <QuantityView value={value} den={den || (decimalPlaces(value) >= 2 ? 100 : 10)} showCount={false} />;

    case 'virgule':
      return (
        <div className="text-center py-2">
          <div className="font-mono font-extrabold text-3xl sm:text-4xl text-slate-800 tabular-nums">
            {formatDec(value)}
          </div>
        </div>
      );

    case 'fraction':
      return (
        <div className="text-center py-2 text-2xl sm:text-3xl text-slate-800">
          {frac.dp === 0 ? (
            <span className="font-mono font-extrabold">{formatDec(value)}</span>
          ) : (
            <MathText>{`$\\frac{${frac.num}}{${frac.den}}$`}</MathText>
          )}
        </div>
      );

    case 'decomposition':
      return (
        <div className="text-center py-2 text-lg sm:text-xl text-slate-800 leading-relaxed">
          <MathText>
            {`$${whole > 0 ? whole : ''}${
              whole > 0 && parts.length > 0 ? ' + ' : ''
            }${parts.map((p) => `\\frac{${p.digit}}{${p.den}}`).join(' + ') || (whole === 0 ? '0' : '')}$`}
          </MathText>
        </div>
      );

    case 'positions':
      return <DecimalPlaceTable value={value} intPlaces={value >= 10 ? 2 : 1} decPlaces={Math.max(decimalPlaces(value), 1)} compact />;

    case 'droite': {
      const w = lineWindow(value);
      return (
        <NumberLine
          min={w.min}
          max={w.max}
          step={w.step}
          labelEvery={w.labelEvery}
          height={140}
          format={(v) => formatDec(v)}
          markers={[{ value, label: formatDec(value), color: '#7c3aed' }]}
          ariaLabel={`Position de ${formatDec(value)} sur la droite graduée`}
        />
      );
    }

    default:
      return null;
  }
}

/**
 * @param {number} value
 * @param {string[]} views  clés de VIEW_META à afficher
 * @param {'grid'|'tabs'} mode  grid = tout visible en même temps (recommandé)
 */
export default function RepresentationPanel({
  value,
  views = ['virgule', 'fraction', 'decomposition', 'positions', 'droite'],
  mode = 'grid',
  den,
  title,
}) {
  const [active, setActive] = useState(views[0]);

  if (mode === 'tabs') {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {views.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setActive(v)}
              className={`px-3 py-2 rounded-xl font-mono text-[11px] font-bold transition-all min-h-[40px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                active === v ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {VIEW_META[v].emoji} {VIEW_META[v].label}
            </button>
          ))}
        </div>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-slate-200 rounded-2xl p-4"
        >
          <ViewBody view={active} value={value} den={den} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && <h3 className="font-space font-bold text-slate-800 text-sm">{title}</h3>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {views.map((v, i) => (
          <motion.div
            key={v}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2 ${
              v === 'droite' || v === 'positions' ? 'sm:col-span-2' : ''
            }`}
          >
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              {VIEW_META[v].emoji} {VIEW_META[v].label}
            </div>
            <ViewBody view={v} value={value} den={den} />
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-slate-500 text-center">
        Cinq habits différents, <strong>une seule et même quantité</strong> :{' '}
        <span className="font-mono font-bold text-slate-700">{formatDec(value)}</span>.
      </p>
    </div>
  );
}
